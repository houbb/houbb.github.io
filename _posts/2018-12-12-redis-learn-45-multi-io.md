---
layout: post
title: redis-45-redis multi io 多路复用
date:  2018-09-08 11:07:16 +0800
categories: [Distributed]
tags: [distributed, redis, lock, sh]
published: true
---

# Blocking I/O

先来看一下传统的阻塞 I/O 模型到底是如何工作的：

当使用 read 或者 write 对某一个文件描述符（File Descriptor 以下简称 FD)进行读写时，如果当前 FD 不可读或不可写，整个 Redis 服务就不会对其它的操作作出响应，导致整个服务不可用。

这也就是传统意义上的，也就是我们在编程中使用最多的阻塞模型：

![阻塞模型](https://upload-images.jianshu.io/upload_images/13880925-cf34b76f18f4a53b.png)

阻塞模型虽然开发中非常常见也非常易于理解，但是由于它会影响其他 FD 对应的服务，所以在需要处理多个客户端任务的时候，往往都不会使用阻塞模型。

## I/O 多路复用

阻塞式的 I/O 模型并不能满足这里的需求，我们需要一种效率更高的 I/O 模型来支撑 Redis 的多个客户（redis-cli），这里涉及的就是 I/O 多路复用模型了：

![I/O 多路复用](https://upload-images.jianshu.io/upload_images/13880925-ed04dfac6be688f0.png)

在 I/O 多路复用模型中，最重要的函数调用就是 select，该方法的能够同时监控多个文件描述符的可读可写情况，当其中的某些文件描述符可读或者可写时，select 方法就会返回可读以及可写的文件描述符个数。

与此同时也有其它的 I/O 多路复用函数 epoll/kqueue/evport，它们相比 select 性能更优秀，同时也能支撑更多的服务。

当如下任一情况发生时，会产生套接字的可读事件：

- 该套接字的接收缓冲区中的数据字节数大于等于套接字接收缓冲区低水位标记的大小；

- 该套接字的读半部关闭（也就是收到了FIN），对这样的套接字的读操作将返回0（也就是返回EOF）；

- 该套接字是一个监听套接字且已完成的连接数不为0；

- 该套接字有错误待处理，对这样的套接字的读操作将返回-1。

当如下任一情况发生时，会产生套接字的可写事件：

- 该套接字的发送缓冲区中的可用空间字节数大于等于套接字发送缓冲区低水位标记的大小；

- 该套接字的写半部关闭，继续写会产生SIGPIPE信号；

- 非阻塞模式下，connect返回之后，该套接字连接成功或失败；

- 该套接字有错误待处理，对这样的套接字的写操作将返回-1。

此外，在UNIX系统上，一切皆文件套接字也不例外，每一个套接字都有对应的fd（即文件描述符）我们简单看看这几个系统调用的原型。

```c
select(int nfds, fd_set *r, fd_set *w,fd_set *e, struct timeval *timeout)
```

对于select()，我们需要传3个集合，r（读），w（写）和e其中，r表示我们对哪些fd的可读事件感兴趣，w表示我们对哪些fd的可写事件感兴趣每个集合其实是一个bitmap，通过0/1表示我们感兴趣的fd例如，

如：我们对于fd为6的可读事件感兴趣，那么r集合的第6个bit需要被设置为1这个系统调用会阻塞，直到我们感兴趣的事件（至少一个）发生调用返回时，内核同样使用这3个集合来存放fd实际发生的事件信息也就是说，调用前这3个集合表示我们感兴趣的事件，调用后这3个集合表示实际发生的事件

select为最早期的UNIX系统调用，它存在4个问题：

1）这3个bitmap有大小限制（FD_SETSIZE，通常为1024）；

2）由于这3个集合在返回时会被内核修改，因此我们每次调用时都需要重新设置；

3）我们在调用完成后需要扫描这3个集合才能知道哪些fd的读/写事件发生了，一般情况下全量集合比较大而实际发生读/写事件的fd比较少，效率比较低下；

4）内核在每次调用都需要扫描这3个fd集合，然后查看哪些fd的事件实际发生，在读/写比较稀疏的情况下同样存在效率问题

由于存在这些问题，于是人们对select进行了改进，从而有了poll

```c
poll(struct pollfd *fds, int nfds, inttimeout)

struct pollfd {int fd;short events;short revents;}
```

poll调用需要传递的是一个pollfd结构的数组，调用返回时结果信息也存放在这个数组里面pollfd的结构中存放着fd我们对该fd感兴趣的事件(events)以及该fd实际发生的事件(revents)poll传递的不是固定大小的bitmap，因此select的问题1解决了；poll将感兴趣事件和实际发生事件分开了，因此select的问题2也解决了但select的问题3和问题4仍然没有解决。

select问题3比较容易解决，只要系统调用返回的是实际发生相应事件的fd集合，我们便不需要扫描全量的fd集合。对于select的问题4，我们为什么需要每次调用都传递全量的fd呢？内核可不可以在第一次调用的时候记录这些fd，然后我们在以后的调用中不需要再传这些fd呢？问题的关键在于无状态对于每一次系统调用，内核不会记录下任何信息，所以每次调用都需要重复传递相同信息。

上帝说要有状态，所以我们有了epoll和kqueue

```c
int epoll_create(int size);

int epoll_ctl(int epfd, int op, int fd,struct epoll_event *event);

int epoll_wait(int epfd, struct epoll_event*events, int maxevents, int timeout);
```

epoll_create的作用是创建一个context，这个context相当于状态保存者的概念

epoll_ctl的作用是，当你对一个新的fd的读/写事件感兴趣时，通过该调用将fd与相应的感兴趣事件更新到context中

epoll_wait的作用是，等待context中fd的事件发生

epoll的解决方案不像select或poll一样每次都把current轮流加入fd对应的设备等待队列中，而只在epoll_ctl时把current挂一遍（这一遍必不可少）并为每个fd指定一个回调函数，当设备就绪，唤醒等待队列上的等待者时，就会调用这个回调函数，而这个回调函数会把就绪的fd加入一个就绪链表）。

epoll_wait的工作实际上就是在这个就绪链表中查看有没有就绪的fd。

# Reactor 设计模式

Redis 服务采用 Reactor 的方式来实现文件事件处理器（每一个网络连接其实都对应一个文件描述符）

![Reactor 设计模式](https://upload-images.jianshu.io/upload_images/13880925-d45f44df7e39ed05.png)

![IO 套接字](https://upload-images.jianshu.io/upload_images/13880925-60b031d3effe4b8a.png)

文件事件处理器使用 I/O 多路复用模块同时监听多个 FD，当 accept、read、write 和 close 文件事件产生时，文件事件处理器就会回调 FD 绑定的事件处理器。

虽然整个文件事件处理器是在单线程上运行的，但是通过 I/O 多路复用模块的引入，实现了同时对多个 FD 读写的监控，提高了网络通信模型的性能，同时也可以保证整个 Redis 服务实现的简单。

## I/O 多路复用模块

I/O 多路复用模块封装了底层的 select、epoll、avport 以及 kqueue 这些 I/O 多路复用函数，为上层提供了相同的接口。

![I/O 多路复用模块](https://upload-images.jianshu.io/upload_images/13880925-32733025f1e5c721.png)

在这里我们简单介绍 Redis 是如何包装 select 和 epoll 的，简要了解该模块的功能，整个 I/O 多路复用模块抹平了不同平台上 I/O 多路复用函数的差异性，提供了相同的接口：

```c
static int aeApiCreate(aeEventLoop *eventLoop)
static int aeApiResize(aeEventLoop *eventLoop, int setsize)
static void aeApiFree(aeEventLoop *eventLoop)
static int aeApiAddEvent(aeEventLoop *eventLoop, int fd, int mask)
static void aeApiDelEvent(aeEventLoop *eventLoop, int fd, int mask)
static int aeApiPoll(aeEventLoop *eventLoop, struct timeval *tvp)
```

同时，因为各个函数所需要的参数不同，我们在每一个子模块内部通过一个 aeApiState 来存储需要的上下文信息：

```c
// select
typedef struct aeApiState {
    fd_set rfds, wfds;
    fd_set _rfds, _wfds;
} aeApiState;

// epoll
typedef struct aeApiState {
    int epfd;
    struct epoll_event *events;
} aeApiState;
```

这些上下文信息会存储在 eventLoop 的 `void * state` 中，不会暴露到上层，只在当前子模块中使用。

## 封装 select 函数

select 可以监控 FD 的可读、可写以及出现错误的情况。

在介绍 I/O 多路复用模块如何对 select 函数封装之前，先来看一下 select 函数使用的大致流程：

```c
int fd = /* file descriptor */

fd_set rfds;
FD_ZERO(&rfds);
FD_SET(fd, &rfds)

for ( ; ; ) {
    select(fd+1, &rfds, NULL, NULL, NULL);
    if (FD_ISSET(fd, &rfds)) {
        /* file descriptor `fd` becomes readable */
    }
}
```

1. 初始化一个可读的 fd_set 集合，保存需要监控可读性的 FD；

2. 使用 FD_SET 将 fd 加入 rfds；

3. 调用 select 方法监控 rfds 中的 FD 是否可读；

4. 当 select 返回时，检查 FD 的状态并完成对应的操作。

而在 Redis 的 ae_select 文件中代码的组织顺序也是差不多的，首先在 aeApiCreate 函数中初始化 rfds 和 wfds：

```c
static int aeApiCreate(aeEventLoop *eventLoop) {
    aeApiState *state = zmalloc(sizeof(aeApiState));
    if (!state) return -1;
    FD_ZERO(&state->rfds);
    FD_ZERO(&state->wfds);
    eventLoop->apidata = state;
    return 0;
}
```

而 aeApiAddEvent 和 aeApiDelEvent 会通过 FD_SET 和 FD_CLR 修改 fd_set 中对应 FD 的标志位：

```c
static int aeApiAddEvent(aeEventLoop *eventLoop, int fd, int mask) {
    aeApiState *state = eventLoop->apidata;
    if (mask & AE_READABLE) FD_SET(fd,&state->rfds);
    if (mask & AE_WRITABLE) FD_SET(fd,&state->wfds);
    return 0;
}
```

整个 ae_select 子模块中最重要的函数就是 aeApiPoll，它是实际调用 select 函数的部分，其作用就是在 I/O 多路复用函数返回时，将对应的 FD 加入 aeEventLoop 的 fired 数组中，并返回事件的个数：

```c
static int aeApiPoll(aeEventLoop *eventLoop, struct timeval *tvp) {
    aeApiState *state = eventLoop->apidata;
    int retval, j, numevents = 0;

    memcpy(&state->_rfds,&state->rfds,sizeof(fd_set));
    memcpy(&state->_wfds,&state->wfds,sizeof(fd_set));

    retval = select(eventLoop->maxfd+1,
                &state->_rfds,&state->_wfds,NULL,tvp);
    if (retval > 0) {
        for (j = 0; j <= eventLoop->maxfd; j++) {
            int mask = 0;
            aeFileEvent *fe = &eventLoop->events[j];

            if (fe->mask == AE_NONE) continue;
            if (fe->mask & AE_READABLE && FD_ISSET(j,&state->_rfds))
                mask |= AE_READABLE;
            if (fe->mask & AE_WRITABLE && FD_ISSET(j,&state->_wfds))
                mask |= AE_WRITABLE;
            eventLoop->fired[numevents].fd = j;
            eventLoop->fired[numevents].mask = mask;
            numevents++;
        }
    }
    return numevents;
}
```

# 封装 epoll 函数

Redis 对 epoll 的封装其实也是类似的，使用 epoll_create 创建 epoll 中使用的 epfd：

```c
static int aeApiCreate(aeEventLoop *eventLoop) {
    aeApiState *state = zmalloc(sizeof(aeApiState));

    if (!state) return -1;
    state->events = zmalloc(sizeof(struct epoll_event)*eventLoop->setsize);
    if (!state->events) {
        zfree(state);
        return -1;
    }
    state->epfd = epoll_create(1024); /* 1024 is just a hint for the kernel */
    if (state->epfd == -1) {
        zfree(state->events);
        zfree(state);
        return -1;
    }
    eventLoop->apidata = state;
    return 0;
}
```

在 aeApiAddEvent 中使用 epoll_ctl 向 epfd 中添加需要监控的 FD 以及监听的事件：

```c
static int aeApiAddEvent(aeEventLoop *eventLoop, int fd, int mask) {
    aeApiState *state = eventLoop->apidata;
    struct epoll_event ee = {0}; /* avoid valgrind warning */
    /* If the fd was already monitored for some event, we need a MOD
     * operation. Otherwise we need an ADD operation. */
    int op = eventLoop->events[fd].mask == AE_NONE ?
            EPOLL_CTL_ADD : EPOLL_CTL_MOD;

    ee.events = 0;
    mask |= eventLoop->events[fd].mask; /* Merge old events */
    if (mask & AE_READABLE) ee.events |= EPOLLIN;
    if (mask & AE_WRITABLE) ee.events |= EPOLLOUT;
    ee.data.fd = fd;
    if (epoll_ctl(state->epfd,op,fd,&ee) == -1) return -1;
    return 0;
}
```

由于 epoll 相比 select 机制略有不同，在 epoll_wait 函数返回时并不需要遍历所有的 FD 查看读写情况；在 epoll_wait 函数返回时会提供一个 epoll_event 数组：

```c
typedef union epoll_data {
    void    *ptr;
    int      fd; /* 文件描述符 */
    uint32_t u32;
    uint64_t u64;} epoll_data_t;

struct epoll_event {
    uint32_t     events; /* Epoll 事件 */
    epoll_data_t data;
};
```

其中保存了发生的 epoll 事件（EPOLLIN、EPOLLOUT、EPOLLERR 和 EPOLLHUP）以及发生该事件的 FD。

aeApiPoll 函数只需要将 epoll_event 数组中存储的信息加入 eventLoop 的 fired 数组中，将信息传递给上层模块：

```c
static int aeApiPoll(aeEventLoop *eventLoop, struct timeval *tvp) {
    aeApiState *state = eventLoop->apidata;
    int retval, numevents = 0;

    retval = epoll_wait(state->epfd,state->events,eventLoop->setsize,
            tvp ? (tvp->tv_sec*1000 + tvp->tv_usec/1000) : -1);
    if (retval > 0) {
        int j;

        numevents = retval;
        for (j = 0; j < numevents; j++) {
            int mask = 0;
            struct epoll_event *e = state->events+j;

            if (e->events & EPOLLIN) mask |= AE_READABLE;
            if (e->events & EPOLLOUT) mask |= AE_WRITABLE;
            if (e->events & EPOLLERR) mask |= AE_WRITABLE;
            if (e->events & EPOLLHUP) mask |= AE_WRITABLE;
            eventLoop->fired[j].fd = e->data.fd;
            eventLoop->fired[j].mask = mask;
        }
    }
    return numevents;
}
```

# 子模块的选择

因为 Redis 需要在多个平台上运行，同时为了最大化执行的效率与性能，所以会根据编译平台的不同选择不同的 I/O 多路复用函数作为子模块，提供给上层统一的接口；在 Redis 中，我们通过宏定义的使用，合理的选择不同的子模块：

```c
#ifdef HAVE_EVPORT#include "ae_evport.c"#else
    #ifdef HAVE_EPOLL
    #include "ae_epoll.c"
    #else
        #ifdef HAVE_KQUEUE
        #include "ae_kqueue.c"
        #else
        #include "ae_select.c"
        #endif
    #endif
#endif
```

因为 select 函数是作为 POSIX 标准中的系统调用，在不同版本的操作系统上都会实现，所以将其作为保底方案：

![子模块的选择](https://upload-images.jianshu.io/upload_images/13880925-4f157293d864b83a.png)

Redis 会优先选择时间复杂度为 O(1)的 I/O 多路复用函数作为底层实现，包括 Solaries 10 中的 evport、Linux 中的 epoll 和 macOS/FreeBSD 中的 kqueue，上述的这些函数都使用了内核内部的结构，并且能够服务几十万的文件描述符。

但是如果当前编译环境没有上述函数，就会选择 select 作为备选方案，由于其在使用时会扫描全部监听的描述符，所以其时间复杂度较差 O(n)，并且只能同时服务 1024 个文件描述符，所以一般并不会以 select 作为第一方案使用。

# 总结

Redis 对于 I/O 多路复用模块的设计非常简洁，通过宏保证了 I/O 多路复用模块在不同平台上都有着优异的性能，将不同的 I/O 多路复用函数封装成相同的 API 提供给上层使用。

整个模块使 Redis 能以单进程运行的同时服务成千上万个文件描述符，避免了由于多进程应用的引入导致代码实现复杂度的提升，减少了出错的可能性。

# Redis 是单线程还是多线程？

通常我们所说的Redis 是单线程，主要是指 Redis 的网络 IO 和键值对读写是由一个线程来完成的，这也是 Redis 对外提供键值存储服务的主要流程。

但 Redis 的其他功能，比如持久化、异步删除、集群数据同步等，其实是由额外的线程执行的。

所以严格来说Redis并不是单线程的。

## 单线程的 Redis 为啥这么快？

哈哈，反正我在面试时候经常会问候选人这个问题，这个问题其实是对redis内部机制的一个考察，可以牵扯出好多涉及底层深入原理的一些列问题。

回到问题本身，基本的回答就两点：

1.redis是基于内存的，内存的读写速度非常快；

2.redis是单线程的，省去了很多上下文切换线程的时间；

3.redis使用多路复用技术，可以处理并发的连接。

非阻塞IO 内部实现采用epoll，采用了epoll+自己实现的简单的事件框架。

epoll中的读、写、关闭、连接都转化成了事件，然后利用epoll的多路复用特性，绝不在io(指的是网络io或磁盘io，全部在内存里处理，速度就是快)上浪费一点时间。

1、关于第1点比较好理解。Redis 绝大部分请求是纯粹的内存操作，非常快速。数据存在内存中，类似于HashMap，查找和操作的时间复杂度都是O(1)。

2、关于第2点IO多路复用，有些同学看到概念后感觉一头雾水，到底什么是IO多路复用？

本文从IO并发性能提升来整体思考，来逐步剖析IO多路复用的原理。

ps: 其实还有很多其他巧妙的设计，比如基于 C 语言。数据结构设计的巧妙。过期等策略，渐进式 rehash 等等。

个人理解 io 多路复用其实是提升了并发性，严格地说，并不是 redis 为什么快的核心原因。

## Redis 单线程模型

Redis 基于 Reactor 模式开发了自己的网络事件处理器，称之为文件事件处理器(File Event Hanlder)。

文件事件处理器由Socket、IO多路复用程序、文件事件分派器(dispather)，事件处理器(handler)四部分组成。

文件事件处理器的模型如下所示：

![单线程模型](https://img2020.cnblogs.com/blog/601748/202112/601748-20211208180528081-1562156035.png)

IO多路复用程序会同时监听多个socket，当被监听的socket准备好执行accept、read、write、close等操作时，与这些操作相对应的文件事件就会产生。

IO多路复用程序会把所有产生事件的socket压入一个队列中，然后有序地每次仅一个socket的方式传送给文件事件分派器，文件事件分派器接收到socket之后会根据socket产生的事件类型调用对应的事件处理器进行处理。

文件事件处理器分为几种：

连接应答处理器：用于处理客户端的连接请求；

命令请求处理器：用于执行客户端传递过来的命令，比如常见的set、lpush等；

命令回复处理器：用于返回客户端命令的执行结果，比如set、get等命令的结果；

事件种类：

AE_READABLE：与两个事件处理器结合使用。

当客户端连接服务器端时，服务器端会将连接应答处理器与socket的AE_READABLE事件关联起来；

当客户端向服务端发送命令的时候，服务器端将命令请求处理器与AE_READABLE事件关联起来；

AE_WRITABLE：当服务端有数据需要回传给客户端时，服务端将命令回复处理器与socket的AE_WRITABLE事件关联起来。

Redis的客户端与服务端的交互过程如下所示：

![流程](https://img2020.cnblogs.com/blog/601748/202112/601748-20211208180623456-1959170545.png)

### 这样设计的好处：

文件事件处理器实现了高性能的网络IO通信模型

**通过单线程的方式执行指令，避免同步机制的性能开销、避免过多的上下文切换、整体实现比较简单，不需要考虑多线程场景中的各种数据结构的线程安全问题。**

# Redis为什么不用多线程处理每个命令呢？

想必大家都听过，多线程能提高系统吞吐率这个说法了，但是这个的前提是要有很好的系统设计，尤其是共享资源的并发访问控制问题，如果没有精心的设计，那么并行也会变成串行，而且，采用多线程开发一般会引入同步原语来保护共享资源的并发访问，这也会降低系统代码的易调试性和可维护性。

为了避免这些问题，Redis 直接采用了单线程模式。

# Redis的多路复用机制

Redis之所以这么快除了完全基于内存计算和高效的数据结构意外，还有一个重要的原因就是**采用了多路复用机制，使其在网络 IO 操作中能并发处理大量的客户端请求，实现高吞吐率**。

要想了解IO模型，首先我们要知道IO操作是基于什么来实现的，如果一个应用程序, 想对外提供服务, 一般都是通过建立套接字监听端口来实现, 也就是socket，IO多路复用是系统来实现的并不是Redis实现的，这个需要系统层面的支持。

不要搞混哈，不过现在很多系统都实现了IO多路复用，可能只是不同的系统实现方式不同而已。

好，那下面我们先来搞一下基本的IO模型和它的阻塞点？

以 Get 请求为例，Redis为了处理一个GET请求，先要监听客户端请求（bind/listen），和客户端建立连接（accept），从 socket 中读取请求（recv），解析客户端发送请求（parse），根据请求类型读取键值数据（get），最后给客户端返回结果，即向 socket 中写回数据（send）。

下图显示了这一过程，其中，bind/listen、accept、recv、parse 和 send 属于网络 IO 处理，而 get 属于键值数据操作。

既然 Redis 是单线程，那么，最基本的一种实现是在一个线程中依次执行上面说的这些操作。

![redis 请求](https://img-blog.csdnimg.cn/20210323201539648.png)

但是，在这里的网络 IO 操作中，有潜在的阻塞点，分别是 accept() 和 recv()。

当 Redis 监听到一个客户端有连接请求，但一直未能成功建立起连接时，会阻塞在 accept() 函数这里，导致其他客户端无法和 Redis 建立连接。

类似的，当 Redis 通过 recv() 从一个客户端读取数据时，如果数据一直没有到达，Redis 也会一直阻塞在 recv()。

这就导致 Redis 整个线程阻塞，无法处理其他客户端请求，效率很低。

ps: 如果采用阻塞模式，基本 redis 会变得不可用。

不过，幸运的是，socket 网络模型本身支持非阻塞模式。

## 非阻塞模式

非阻塞模式Socket 网络模型的非阻塞模式设置，主要体现在三个关键的函数调用上，如果想要使用 socket 非阻塞模式，就必须要了解这三个函数的调用返回类型和设置模式。

接下来，我们就重点学习下它们。

在 socket 模型中，不同操作调用后会返回不同的套接字类型。

socket() 方法会返回主动套接字，然后调用 listen() 方法，将主动套接字转化为监听套接字，此时，可以监听来自客户端的连接请求。

最后，调用 accept() 方法接收到达的客户端连接，并返回已连接套接字。

![非阻塞模式](https://img-blog.csdnimg.cn/20210323202909916.png)

针对监听套接字，我们可以设置非阻塞模式：

当 Redis 调用 accept() 但一直未有连接请求到达时，Redis 线程可以返回处理其他操作，而不用一直等待。但是，你要注意的是，调用 accept() 时，已经存在监听套接字了。

虽然 Redis 线程可以不用继续等待，但是总得有机制继续在监听套接字上等待后续连接请求，并在有请求时通知 Redis。

类似的，我们也可以针对已连接套接字设置非阻塞模式：Redis 调用 recv() 后，如果已连接套接字上一直没有数据到达，Redis 线程同样可以返回处理其他操作。我们也需要有机制继续监听该已连接套接字，并在有数据达到时通知 Redis。

这样才能保证 Redis 线程，既不会像基本 IO 模型中一直在阻塞点等待，也不会导致 Redis 无法处理实际到达的连接请求或数据。

到此，Linux 中的 IO 多路复用机制就要登场了，上面说了多路复用机制是系统层面去实现的哦。

## 基于多路复用的高性能 I/O 模型

Linux 中的 IO 多路复用机制是指一个线程处理多个 IO 流，就是我们经常听到的 select/epoll 机制。

简单来说，在 Redis 只运行单线程的情况下，该机制允许内核中，同时存在多个监听套接字和已连接套接字。

内核会一直监听这些套接字上的连接请求或数据请求。一旦有请求到达，就会交给 Redis 线程处理，这就实现了一个 Redis 线程处理多个 IO 流的效果。

下图就是基于多路复用的 Redis IO 模型。图中的多个 FD 就是刚才所说的多个套接字。

Redis 网络框架调用 epoll 机制，让内核监听这些套接字。

此时，Redis 线程不会阻塞在某一个特定的监听或已连接套接字上，也就是说，不会阻塞在某一个特定的客户端请求处理上。

正因为此，Redis 可以同时和多个客户端连接并处理请求，从而提升并发性。

![多路复用](https://img-blog.csdnimg.cn/20210323203354974.png)

为了在请求到达时能通知到 Redis 线程，select/epoll 提供了基于事件的回调机制，即针对不同事件的发生，调用相应的处理函数。

那么，回调机制是怎么工作的呢？

其实，select/epoll 一旦监测到 FD 上有请求到达时，就会触发相应的事件，其实就是Redis会在select/epoll 机制上提前去注册Redis自己提供的回调函数。

这些事件会被放进一个事件队列，Redis 单线程对该事件队列不断进行处理。

这样一来，Redis 无需一直轮询是否有请求实际发生，这就可以避免造成 CPU 资源浪费。

同时，Redis 在对事件队列中的事件进行处理时，会调用相应的处理函数，这就实现了基于事件的回调。因为 Redis 一直在对事件队列进行处理，所以能及时响应客户端请求，提升 Redis 的响应性能。

为了方便你理解，我再以连接请求和读数据请求为例，具体解释一下。

这两个请求分别对应 Accept 事件和 Read 事件，Redis 分别对这两个事件注册 accept 和 get 回调函数。

当 Linux 内核监听到有连接请求或读数据请求时，就会触发 Accept 事件和 Read 事件，此时，内核就会回调 Redis 相应的 accept 和 get 函数进行处理。


# redis 如何处理多客户端操作

redis服务端对于命令的处理是单线程的，但是在I/O层面却可以同时面对多个客户端并发的提供服务，并发到内部单线程的转化通过多路复用框架实现

一个IO操作的完整流程是数据请求先从用户态到内核态，也就是操作系统层面，然后再调用操作系统提供的api，调用相对应的设备去获取相应的数据。

当相应的设备准备好数据后，会将数据复制到内核态，处理方式分为阻塞和非阻塞。

阻塞：用户请求会等待数据从操作系统调用相应的设备返回到内核态，如果没有返回则处于阻塞状态

非阻塞：操作系统接收到一组文件描述符，然后操作系统批量处理这些文件描述符，然后不管有没有准备好数据都立即返回，如果没有对应的准备好的文件描述符，则继续轮询获取准备好数据的文件描述符。

数据从内核态复制到用户态的处理方式又分为同步和异步

同步：用户请求等待数据从内核态向用户态复制数据，在此期间不做其他事情

异步：在数据从内核态向用户态复制的过程中，用户请求不会一直处于等待状态而是做其他事情

redis的多路复用框架使用的非阻塞的数据返回模式

模型：select、poll、epoll

redis 是一个单线程却性能非常好的内存数据库， 主要用来作为缓存系统。 

redis 采用网络IO多路复用技术来保证在多连接的时候， 系统的高吞吐量。

# 为什么 Redis 中要使用 I/O 多路复用这种技术呢？

## 为什么需要多路复用？

首先，Redis 是跑在单线程中的，所有的操作都是按照顺序线性执行的，但是由于读写操作等待用户输入或输出都是阻塞的，所以 I/O 操作在一般情况下往往不能直接返回，这会导致某一文件的 I/O 阻塞导致整个进程无法对其它客户提供服务，而 I/O 多路复用就是为了解决这个问题而出现的。

redis的io模型主要是基于epoll实现的，不过它也提供了select和kqueue的实现，默认采用epoll。

## epoll 与 select/poll 的区别

select，poll，epoll都是IO多路复用的机制。

I/O多路复用就通过一种机制，可以监视多个描述符，一旦某个描述符就绪，能够通知程序进行相应的操作。

select 的本质是采用 32 个整数的 32 位，即 3232= 1024 来标识，fd值为 1-1024。当 fd 的值超过 1024 限制时，就必须修改 FD_SETSIZE 的大小。这个时候就可以标识32max 值范围的 fd。

poll 与 select 不同，通过一个 pollfd 数组向内核传递需要关注的事件，故没有描述符个数的限制，pollfd 中的 events 字段和 revents 分别用于标识关注的事件和发生的事件，故 pollfd 数组只需要被初始化一次。

epoll 还是 poll 的一种优化，返回后不需要对所有的 fd 进行遍历，在内核中维持了 fd 的列表。

select 和 poll 是将这个内核列表维持在用户态，然后传递到内核中；而与 poll/select 不同，epoll 不再是一个单独的系统调用，而是由 epoll_create/

epoll_ctl/epoll_wait 三个系统调用组成，后面将会看到这样做的好处。

## 那么 epoll 到底是个什么东西呢？ 

> [Netty-08-linux 通讯模型之 epoll](https://houbb.github.io/2017/11/16/netty-08-module-linux-04-epoll-detail-04)

其实只是众多i/o多路复用技术当中的一种而已，但是相比其他io多路复用技术(select, poll等等)，epoll有诸多优点：

1. epoll 没有最大并发连接的限制，上限是最大可以打开文件的数目，这个数字一般远大于 2048, 一般来说这个数目和系统内存关系很大，具体数目可以 cat /proc/sys/fs/file-max 察看。

2. 效率提升， Epoll 最大的优点就在于它只管你“活跃”的连接，而跟连接总数无关，因此在实际的网络环境中， Epoll 的效率就会远远高于 select 和 poll 。

3. 内存拷贝， Epoll 在这点上使用了“共享内存”，这个内存拷贝也省略了。

## select/poll的几大缺点：

每次调用 select/poll，都需要把 fd 集合从用户态拷贝到内核态，这个开销在 fd 很多的时候会很大；

同时每次调用 select/poll 都需要在内核遍历传递进来的所有 fd，这个开销在 fd 很多时也很大；

针对 select 支持的文件描述符数量太小了，默认是 1024；

select 返回的是含有整个句柄的数组，应用程序需要遍历整个数组才能发现哪些句柄发生了事件；

select 的触发方式是水平触发，应用程序如果没有完成对一个已经就绪的文件描述符进行 IO 操作，那么之后每次 select 调用还是会将这些文件描述符通知进程。

相比 select模型，poll使用链表保存文件描述符，因此没有了监视文件数量的限制，但其他三个缺点依然存在。

# 那么 epoll 的原理是什么呢？

## 实现机制

由于 epoll 的实现机制与 select/poll 机制完全不同，上面所说的 select 的缺点在 epoll 上不复存在。

Epoll 没有这个限制，它所支持的 FD 上限是最大可以打开文件的数目，这个数字一般远大于 2048。

举个例子，在 1GB 内存的机器上大约是 10万左右，设想一下如下场景：有 100 万个客户端同时与一个服务器进程保持着 TCP 连接。而每一时刻，通常只有几百上千个 TCP 连接是活跃的（事实上大部分场景都是这种情况）。如何实现这样的高并发？

在 select/poll 时代，主要实现方式是从用户态复制句柄数据结构到内核态。服务器进程每次都把这 100 万个连接告诉操作系统，让操作系统内核去查询这些套接字上是否有事件发生。

轮询完后，再将句柄数据复制到用户态，让服务器应用程序轮询处理已发生的网络事件，这一过程资源消耗较大，因此，select/poll一般只能处理几千的并发连接。

此外，如果没有 I/O 事件产生，我们的程序就会阻塞在 select 处。

但是依然有个问题，我们从 select 那里仅仅知道了，有 I/O 事件发生了，但却并不知道是那几个流（可能有一个，多个，甚至全部），我们只能无差别轮询所有流，找出能读出数据，或者写入数据的流，对他们进行操作。

但是使用 select，我们有 O(n) 的无差别轮询复杂度，同时处理的流越多，每一次无差别轮询时间就越长。

Epoll 的设计和实现与 select 完全不同。

Epoll 通过在 Linux 内核中申请一个简易的文件系统（文件系统一般用 B+树实现），把原先的 select/poll 调用分成了3个部分：

```c
int epoll_create(int size);   //建立一个 epoll对象（在 Epoll 文件系统中，为这个句柄对象分配资源）；

int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);  // 向 epoll 对象中添加这100万个连接的套接字；

int epoll_wait(int epfd, struct epoll_event *events, int maxevents); // 收集发生的事件的连接；
```

如此一来，要实现上面所说的场景，只需要在进程启动时建立一个 epoll 对象，然后在需要的时候向这个 epoll 对象中添加或者删除连接。

同时，epoll_wait 的效率也非常高，因为调用 epoll_wait 时，并没有一股脑的向操作系统复制这100万个连接的句柄数据，内核也不需要去遍历全部的连接。

epoll的实现原理就是基于这三个函数来实现的，具体步骤如下：

首先，需要调用epoll_create来创建一个epoll的文件描述符，内核会同时创建一个eventpoll的数据结构。

这个数据结构里面会包含两个东西，一个是红黑树，专门用于存储epoll_ctl注册进来的fd文件描述符；

另外一个是就绪链表，用来存储epoll_wait调用相关的，已经就绪的那些fd文件描述符。

```c
struct eventpoll{
 
struct rb_root rbr; // 红黑树的根节点，存储着所有添加到epoll中的需要监控的事件
 
struct list_head rdlist;//  双链表中存放着将要通过epoll_wait返回给用户的满足条件的事件
 
};
```

其次，因为epoll中的所有事件，都与网卡驱动程序建立回调关系，当相应的事件发生的时候，会通过这个回调函数，将发生的事件添加到就绪链表当中。

最后，当调用epoll_wait检查是否有事件发生时，只需要检查eventpoll对象中的rdlist双链表中是否有需要处理的事件。

如果rdlist不为空，则把发生的事件复制到用户态，同时将事件数量返回给用户。

## Epoll 底层实现

当某一进程调用 epoll_create 方法时，Linux 内核会创建一个 eventpoll 结构体，这个结构体中有两个成员与 epoll 的使用方式密切相关。

eventpoll 结构体如下所示：

```c
struct eventpoll {
  //....
  // 红黑树的根节点，这棵树中存储着所有添加到 epoll 中的需要监控的事件
  struct rb_root rbr;
  // 双链表中存放着将要通过 epoll_wait 返回给用户的满足条件的事件
  struct list_head rdlist;
  //....
}
```

### socket 红黑树

每一个 epoll 对象都有一个独立的 eventpoll 结构体，用于存放通过 epoll_ctl 方法向 epoll 对象中添加进来的事件，这些事件都会挂载在用于存储上述的被监控 socket 的红黑树上，即上面源码的 rb_root。

当你调用 epoll_create 时，就会在 epoll 注册的一个文件系统中创建一个 file 节点，这个 file 不是普通文件，它只服务于 epoll。epoll 在被内核初始化时（操作系统启动），同时会开辟出 epoll 自己的内核高速缓存区，用于安置每一个我们想监控的 socket，这些 socket 会以红黑树的形式保存在内核缓存里，红黑树的插入时间效率很高，对于高度为 n 的红黑树，查找、插入、删除的效率都是 lgn。

如此重复添加的事件就可以通过红黑树高效的识别出来。

注：这个内核高速缓存区，就是建立连续的物理内存页，然后在之上建立 slab 层，简单的说，就是物理上分配好你想要的 size 的内存对象，每次使用时都是使用空闲的已分配好的对象。

### 事件双链表

所有添加到 epoll 中的事件都会与设备（网卡）驱动程序**建立回调关系，也就是说当相应的事件发生时，会调用这个回调方法。

这个回调方法在内核中叫 ep_poll_callback，它会将发生的事件添加到 rdlist 双链表中。

这个事件双链表是怎么维护的呢？当我们执行 epoll_ctl 时，除了把 socket 放到 epoll 文件系统里 file 对象对应的红黑树上之外，还会给内核中断处理程序注册一个回调函数**。

告诉内核，如果这个句柄的中断到了，就把它放到准备就绪 list 链表里。

所以，当一个 socket 上有数据到了，内核在把网卡上的数据 copy 到内核中，然后就把 socket 插入到准备就绪链表里了。

由此可见，**epoll 的基础就是回调**。

epoll 的每一个事件都会包含一个 epitem 结构体，如下所示：

```c
struct epitem {
  // 红黑树节点
  struct rb_node rbn; 
  // 双向链表节点
  struct list_head rdllink;
  // 事件句柄信息
  struct epoll_filefd ffd;
  // 指向所属的 eventpoll 对象
  struct eventpoll *ep;
  // 期待发生的事件类型
  struct epoll_event event;
}
```

当调用 epoll_wait 检查是否有事件发生时，只需要检查 eventpoll 对象中的 rdlist 双链表中是否有 epitem 元素即可。

如果 rdlist 不为空，则把发生的事件复制到用户态，同时将事件数量返回给用户。

## 总结

综上所述，epoll 的执行过程：

1. 调用 epoll_create 时，内核帮我们在 epoll 文件系统里建立 file 结点，内核缓存中建立 socket 红黑树，除此之外，还会再建立一个用于存储准备就绪事件的 list 链表。

2. 执行 epoll_ctl 时，如果增加就绪事件的 socket 句柄，则需要：

检查在红黑树中是否存在，存在立即返回，不存在则添加到树干上；

然后向内核注册回调函数，用于当中断事件来临时向准备就绪链表中插入数据。

epoll_wait 调用时，仅仅观察这个 list 链表里有没有数据即可，有数据就返回，没有数据就 sleep，等到 timeout 时间到后，即使链表没数据也返回。

epoll_wait 的执行过程相当于以往调用 select/poll，但 epoll 的效率高得多。

## EPoll 的两种模式

epoll 独有的两种模式 LT 和 ET。无论是 LT 和 ET 模式，都适用于以上所说的流程。

区别是，LT 模式下只要一个句柄上的事件一次没有处理完，会在以后调用 epoll_wait 时次次返回这个句柄。而ET模式仅在第一次返回。

关于 LT 和 ET 有一端描述，LT 和 ET 都是电子里面的术语，ET 是边缘触发，LT 是水平触发，一个表示只有在变化的边际触发，一个表示在某个阶段都会触发。

对于 epoll 而言，当一个 socket 句柄上有事件时，内核会把该句柄插入上面所说的准备就绪链表，这时我们调用 epoll_wait，会把准备就绪的 socket 拷贝到用户态内存，然后清空准备就绪链表。

最后，epoll_wait 检查这些 socket，如果不是 ET 模式（就是LT模式的句柄了），并且这些 socket 上确实有未处理的事件时，又把该句柄放回到刚刚清空的准备就绪链表了。

所以，非 ET 的句柄，只要它上面还有事件，epoll_wait 每次都会返回这个句柄。

# Redis 的多线程

另外Redis在6.0推出了多线程，可以在高并发场景下利用CPU多核多线程读写客户端数据，进一步提升server性能，当然，只是针对客户端的读写是并行的，每个命令的真正操作依旧是单线程的。

在Redis6.0中引入了多线程，可能很多同学会误以为redis原本的单线程数据IO变成了多线程IO，那作者不就是在打自己的脸吗？

对于Redis来说，CPU通常不是瓶颈，因为大多数请求不是属于CPU密集型，而是I/O密集型。

而在Redis中除了数据的持久化方案之外，它是完全的纯内存操作，因此执行速度是非常快的，所以数据的IO并不是Redis的性能瓶颈，Redis真正的性能瓶颈是在网络I/O，也就是客户端和服务端之间的网络传输延迟，所以Redis选择了单线程的IO多路复用来实现它的核心网络模型。

## 单线程的好处

前面我们说过，单线程设计对于Redis来说有很多好处。

- 避免过多的上上下文切换开销

- 避免同步机制的开销，涉及到数据同步和事务操作时，避免多线程影响所以必然需要加同步机制保证线程安全性。但是加锁同时也会影响到程序的执行性能。

- 维护简单，引入多线程之后，不管是对数据结构的设计，还是在程序代码的维护上，都会变得很复杂。

所以既然Redis的数据I/O不是瓶颈，同时单线程又有这么多好处，那Redis自然就采用单线程了。

既然是这样，那么Redis 6.0引入多线程，一定不是优化数据IO性能，那么我们先来分析一下Redis性能瓶颈主要体现在哪些方面，无非就是三个方面。

1. 网络IO

2. CPU核心数

3. 内存

由于CPU核心数并不是redis的瓶颈，所以影响Redis性能的因素只有网络IO和内存，而内存属于硬件范畴，比如采用容量更大、吞吐量更高的内存进行优化就行，因此也不是属于Redis可优化的空间，所以最终我们发现Redis的性能瓶颈还是在网络IO上。

而在Redis6.0之前，使用的是单线程Reactor模型，单线程模型是指对于客户端的请求，主线程需要负责对这个请求的完整IO过程进行处理，如图4-8所示，从socket中读取数据和往socket中写数据都是比较耗时的网络IO操作，解析请求和内存交互耗时可能远小于这个网络IO操作。

![4-8](https://pics6.baidu.com/feed/9e3df8dcd100baa18596dc4b3f00ef1bc9fc2ea5.png?token=856c278e17629ca716fd6000d5fe90a1)

按照前面我们对多Reactor多线程的理解，那我们能不能改成主从多Reactor多线程模型呢？

主Reactor负责接收客户端连接，然后分发给多个Reactor进行网络IO操作。

很显然，这样做就会导致Redis编程了一个多线程模型，这对Redis的影响较大，因为多线程带来的线程安全问题和底层复杂的数据结构的操作都非常棘手，所以Redis 6.0并没有这么做。

Redis 6.0中将处理过程中最耗时的Socket读取、请求解析、单独用一个线程来处理，剩下的命令执行操作仍然由单线程来完成和内存的数据交互，这样一来，网络IO操作就变成了多线程了，但是核心部分仍然是线程安全的，如图4-9所示。

![4-9](https://pics2.baidu.com/feed/4e4a20a4462309f7fc8e9d13071e5afad6cad6e3.png?token=a64638f04a93c9fc83802bc8489479c7)

为什么说Redis6.0是一个特殊的多线程，原因就在这里，**Redis主要针对网络IO这块引入了多线程的方式来提升了网络IO性能，但是真正执行命令的操作仍然是由主线程来完成**。

因此，总的来说，我们仍然可以说Redis是单线程模型。

## Redis 6.0如何开启多线程

Redis 6.0默认多线程是禁止的，也就是仍然只是使用主线程来完成网络IO，如果需要开启，则修改redis.conf配置文件中的如下属性

默认是关闭，设置为yes打开io-threads-do-reads no#默认线程数量是4，官方建议是4核机器上设置为2~3个，8核机器上设置6个io-threads 4

## 引入多线程之后的性能提升

图4-20是美团技术团队使用阿里云服务器压测GET/SET命令在4个线程IO时性能上的对比结果，可以明显的看到，Redis 在使用多线程模式之后性能大幅提升，达到了一倍。

Redis Server 阿里云 Ubuntu 18.04 ， 8CPU 2.5GHZ，8G内存，主机型号： ecs.ic5.2xlarge
Redis Benchmark client: 阿里云 Unbuntu 18.04 , 8CPU 2.5GHZ，8G内存，主机型号：ecs.ic5.2xlarge

![GET 性能对比](https://pics4.baidu.com/feed/b2de9c82d158ccbfe467d8c86ac8ea37b0354106.jpeg?token=522c3d1e9d53f663263f6ff3a0828a29)

## 内存回收策略

很多同学了解了Redis的好处之后，于是把任何数据都往Redis中放，如果使用不合理很容易导致数据超过Redis的内存，这种情况会出现什么问题呢？

Redis中有很多无效的缓存，这些缓存数据会降低数据IO的性能，因为不同的数据类型时间复杂度算法不同，数据越多可能会造成性能下降

随着系统的运行，redis的数据越来越多，会导致物理内存不足。

通过使用虚拟内存（VM），将很少访问的数据交换到磁盘上，腾出内存空间的方法来解决物理内存不足的情况。

虽然能够解决物理内存不足导致的问题，但是由于这部分数据是存储在磁盘上，如果在高并发场景中，频繁访问虚拟内存空间会严重降低系统性能。

所以遇到这类问题的时候，我们一般有几种方法。

对每个存储到redis中的key设置过期时间，这个根据实际业务场景来决定。

否则，再大的内存都会虽则系统运行被消耗完。

增加内存

使用内存淘汰策略。

## 设置Redis能够使用的最大内存

在实际生产环境中，服务器不仅仅只有Redis，为了避免Redis内存使用过多对其他程序造成影响，我们一般会设置最大内存。

Redis默认的最大内存maxmemory=0，表示不限制Redis内存的使用。我们可以修改redis.conf文件，设置Redis最大使用的内存。

```
# 单位为bytemaxmemory <bytes>  2147483648（2G）
```

如何查看当前Redis最大内存设置呢，进入到Redis-Cli控制台，输入下面这个命令。

```
config get maxmemory
```

当Redis中存储的内存超过maxmemory时，会怎么样呢？

下面我们做一个实验

在redis-cli控制台输入下面这个命令，把最大内存设置为1个字节。

```
config set maxmemory 1
```

通过下面的命令存储一个string类型的数据

```
set name mic
```

此时，控制台会得到下面这个错误信息

```
  (error) OOM command not allowed when used memory > 'maxmemory'.
```

## 使用内存淘汰策略释放内存

设置了 maxmemory 的选项，redis内存使用达到上限。

可以通过设置LRU算法来删除部分key，释放空间。

默认是按照过期时间的，如果set时候没有加上过期时间就会导致数据写满maxmemory。

Redis中提供了一种内存淘汰策略，当内存不足时，Redis会根据相应的淘汰规则对key数据进行淘汰。 

Redis一共提供了8种淘汰策略，默认的策略为 noeviction，当内存使用达到阈值的时候，

所有引起申请内存的命令会报错。

```
volatile-lru，针对设置了过期时间的key，使用lru算法进行淘汰。
allkeys-lru，针对所有key使用lru算法进行淘汰。
volatile-lfu，针对设置了过期时间的key，使用lfu算法进行淘汰。
allkeys-lfu，针对所有key使用lfu算法进行淘汰。
volatile-random，从所有设置了过期时间的key中使用随机淘汰的方式进行淘汰。
allkeys-random，针对所有的key使用随机淘汰机制进行淘汰。
volatile-ttl，删除生存时间最近的一个键。
noeviction，不删除键，值返回错误。
```

# 参考资料

[文件事件](http://redisbook.com/preview/event/file_event.html)

[Redis IO多路复用机制解析](https://www.cnblogs.com/johnvwan/p/15662925.html)

[redis的多路复用原理](https://blog.csdn.net/cj_eryue/article/details/118361057)

[Redis的多路复用机制](https://blog.csdn.net/java_cjx/article/details/115140225)

https://www.cnblogs.com/histlyb/p/12155934.html

https://zhuanlan.zhihu.com/p/338471702

https://blog.51cto.com/u_12874079/2149260

https://www.136.la/jingpin/show-208978.html

https://www.kancloud.cn/imnotdown1019/java_core_full/2182629

https://www.pianshen.com/article/41731305174/

https://baijiahao.baidu.com/s?id=1714827016420383614&wfr=spider&for=pc

https://coding.imooc.com/learn/questiondetail/184653.html

[redis为什么不使用异步io而使用多路io复用？](https://www.zhihu.com/question/306885437/answer/1582002357)

https://maimai.cn/article/detail?fid=1675272081&efid=7RSVCF74lz2u6GtEtZMFUg

[Redis 原理和机制详解](https://maimai.cn/article/detail?fid=1675272081&efid=7RSVCF74lz2u6GtEtZMFUg)

[Redis 的 I/O 多路复用](https://www.jianshu.com/p/311f9d276b2a)

* any list
{:toc}
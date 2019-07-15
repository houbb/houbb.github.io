---
layout: post
title: Redis Learn-09-00-事件
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 概述

redis 内部有一个小型的事件驱动，它和 libevent 网络库的事件驱动一样，都是依托 I/O 多路复用技术支撑起来的。

利用 I/O 多路复用技术，监听感兴趣的文件 I/O 事件，例如读事件，写事件等，同时也要维护一个以文件描述符为主键，数据为某个预设函数的事件表，这里其实就是一个数组或者链表。

当事件触发时，比如某个文件描述符可读，系统会返回文件描述符值，用这个值在事件表中找到相应的数据项，从而实现回调。

同样的，定时事件也是可以实现的，因为系统提供的 I/O 多路复用技术中的函数允许我们设定时间值。

![redis_event_summary.png](http://daoluan.net/blog/wp-content/uploads/2014/03/redis_event_summary.png)

# Redis 的多路复用设计

每个 CS 模式程序，尤其是高并发的网络服务端程序都有自己的网络异步事件处理库，Redis不例外。

Redis 基于 Reactor 模型 封装了自己的事件驱动模型库。

作者是这样跟别人讨论的，感兴趣的可以了解下。

下面从源码入手介绍下 Redis 中封装的 ae 库。

## 为什么要自己实现？

TODO...

## 概览

Redis 的 I/O 多路复用函数库对常见的 select/epoll/evport/kqueue 等进行了封装，提高了易用性。

每一个 I/O 多路复用函数库在 Redis 源码中都单独成一个个文件，因此你可以找到 ae_epoll.c 等文件，它们对外提供统一的 API，这样做有一个好处是，底层库可以互换。

Redis 在底层用哪个 I/O 多路复用函数库是在编译时决定的，源码中定义了如下的规则：

```c
#ifdef HAVE_EVPORT
#include "ae_evport.c"
#else
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

该规则保证在编译时会自动选择系统中性能最高的 I/O 多路复用函数库作为其 I/O 多路复用程序的底层实现。

绝大多数的 Redis 服务都跑在 linux 服务器上，因此用的是 epoll。

大家都知道，epoll 常用函数主要有以下 3 个：

```c
#include <sys/epoll.h>
int epoll_create(int size);
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

# redis 事件驱动数据结构

redis 事件驱动内部有四个主要的数据结构，分别是：事件循环结构体，文件事件结构体，时间事件结构体和触发事件结构体。

```c
// 文件事件结构体
/* File event structure */
typedef struct aeFileEvent {
    int mask; /* one of AE_(READABLE|WRITABLE) */
 
    // 回调函数指针
    aeFileProc *rfileProc;
    aeFileProc *wfileProc;
 
    // clientData 参数一般是指向 redisClient 的指针
    void *clientData;
} aeFileEvent;
 
// 时间事件结构体
/* Time event structure */
typedef struct aeTimeEvent {
    long long id; /* time event identifier. */
    long when_sec; /* seconds */
    long when_ms; /* milliseconds */
 
    // 定时回调函数指针
    aeTimeProc *timeProc;
 
    // 定时事件清理函数，当删除定时事件的时候会被调用
    aeEventFinalizerProc *finalizerProc;
 
    // clientData 参数一般是指向 redisClient 的指针
    void *clientData;
 
    // 定时事件表采用链表来维护
    struct aeTimeEvent *next;
} aeTimeEvent;
 
// 触发事件
/* A fired event */
typedef struct aeFiredEvent {
    int fd;
    int mask;
} aeFiredEvent;
 
// 事件循环结构体
/* State of an event based program */
typedef struct aeEventLoop {
    int maxfd;   /* highest file descriptor currently registered */
    int setsize; /* max number of file descriptors tracked */
 
    // 记录最大的定时事件 id + 1
    long long timeEventNextId;
 
    // 用于系统时间的矫正
    time_t lastTime;     /* Used to detect system clock skew */
 
    // I/O 事件表
    aeFileEvent *events; /* Registered events */
 
    // 被触发的事件
    aeFiredEvent *fired; /* Fired events */
 
    // 定时事件表
    aeTimeEvent *timeEventHead;
 
    // 事件循环结束标识
    int stop;
 
    // 对于不同的 I/O 多路复用技术，有不同的数据，详见各自实现
    void *apidata; /* This is used for polling API specific data */
 
    // 新的循环前需要执行的操作
    aeBeforeSleepProc *beforesleep;
} aeEventLoop;
```

# 事件循环中心

redis 的主函数中调用 initServer() 函数从而初始化事件循环中心（EventLoop），它的主要工作是在 aeCreateEventLoop() 中完成的。

```c
aeEventLoop *aeCreateEventLoop(int setsize) {
    aeEventLoop *eventLoop;
    int i;
 
    // 分配空间
    if ((eventLoop = zmalloc(sizeof(*eventLoop))) == NULL) goto err;
 
    // 分配文件事件结构体空间
    eventLoop->events = zmalloc(sizeof(aeFileEvent)*setsize);
 
    // 分配已触发事件结构体空间
    eventLoop->fired = zmalloc(sizeof(aeFiredEvent)*setsize);
    if (eventLoop->events == NULL || eventLoop->fired == NULL) goto err;
 
    eventLoop->setsize = setsize;
    eventLoop->lastTime = time(NULL);
 
    // 时间事件链表头
    eventLoop->timeEventHead = NULL;
 
    // 后续提到
    eventLoop->timeEventNextId = 0;
    eventLoop->stop = 0;
    eventLoop->maxfd = -1;
 
    // 进入事件循环前需要执行的操作，此项会在 redis main() 函数中设置
    eventLoop->beforesleep = NULL;
 
    // 在这里，aeApiCreate() 函数对于每个 IO 多路复用模型的实现都有不同，具体参见源代码，因为每种 IO 多路复用模型的初始化都不同
    if (aeApiCreate(eventLoop) == -1) goto err;
 
    /* Events with mask == AE_NONE are not set. So let's initialize the
     * vector with it. */
    // 初始化事件类型掩码为无事件状态
    for (i = 0; i < setsize; i++)
        eventLoop->events[i].mask = AE_NONE;
    return eventLoop;
 
err:
    if (eventLoop) {
        zfree(eventLoop->events);
        zfree(eventLoop->fired);
        zfree(eventLoop);
    }
    return NULL;
}
```

有上面初始化工作只是完成了一个空空的事件中心而已。要想驱动事件循环，还需要下面的工作。

# 事件注册详解

## 简述

文件 I/O 事件注册主要操作在 aeCreateFileEvent() 中完成。

aeCreateFileEvent() 会根据文件描述符的数值大小在事件循环结构体的 I/O 事件表中取一个数据空间，利用系统提供的 I/O 多路复用技术监听感兴趣的 I/O 事件，并设置回调函数。

![io_event_table.png](http://daoluan.net/blog/wp-content/uploads/2014/03/io_event_table.png)

## 代码

```c
int aeCreateFileEvent(aeEventLoop *eventLoop, int fd, int mask,
        aeFileProc *proc, void *clientData)
{
    if (fd >= eventLoop->setsize) {
        errno = ERANGE;
        return AE_ERR;
    }
    // 在 I/O 事件表中选择一个空间
    aeFileEvent *fe = &eventLoop->events[fd];
 
    // aeApiAddEvent() 只在此函数中调用，对于不同 IO 多路复用实现，会有所不同
    if (aeApiAddEvent(eventLoop, fd, mask) == -1)
        return AE_ERR;
 
    fe->mask |= mask;
 
    // 设置回调函数
    if (mask & AE_READABLE) fe->rfileProc = proc;
    if (mask & AE_WRITABLE) fe->wfileProc = proc;
    fe->clientData = clientData;
    if (fd > eventLoop->maxfd)
        eventLoop->maxfd = fd;
    return AE_OK;
}
```

对于不同版本的 I/O 多路复用，比如 epoll，select，kqueue 等，redis 有各自的版本，但接口统一，譬如 aeApiAddEvent()。

![redis_event_api.png](http://daoluan.net/blog/wp-content/uploads/2014/03/redis_event_api.png)

至于定时事件，在事件循环结构体中用链表来维护。

定时事件操作在 aeCreateTimeEvent() 中完成：分配定时事件结构体，设置触发时间和回调函数，插入到定时事件表中。

- 定时事件表

```
定时事件0=》定时事件1=》定时事件3
```

## aeCreateTimeEvent 代码

```c

long long aeCreateTimeEvent(aeEventLoop *eventLoop, long long milliseconds,
        aeTimeProc *proc, void *clientData,
        aeEventFinalizerProc *finalizerProc)
{
/*    自增
    timeEventNextId 会在处理执行定时事件时会用到，用于防止出现死循环。
    如果超过了最大 id，则跳过这个定时事件，为的是避免死循环，即：
    如果事件一执行的时候注册了事件二，事件一执行完毕后事件二得到执行，紧接着如果事件一有得到执行就会成为循环，因此维护了 timeEventNextId 。*/
    long long id = eventLoop->timeEventNextId++;
    aeTimeEvent *te;
 
    // 分配空间
    te = zmalloc(sizeof(*te));
    if (te == NULL) return AE_ERR;
 
    // 填充时间事件结构体
    te->id = id;
 
    // 计算超时时间
    aeAddMillisecondsToNow(milliseconds,&te->when_sec,&te->when_ms);
 
    // proc == serverCorn
    te->timeProc = proc;
    te->finalizerProc = finalizerProc;
    te->clientData = clientData;
 
    // 头插法
    te->next = eventLoop->timeEventHead;
    eventLoop->timeEventHead = te;
    return id;
}
```

# 准备监听工作

initServer() 中调用了 aeCreateEventLoop() 完成了事件中心的初始化，initServer() 还做了监听的准备。

```c
/* Open the TCP listening socket for the user commands. */
// listenToPort() 中有调用 listen()
if (server.port != 0 &&
    listenToPort(server.port,server.ipfd,&server.ipfd_count) == REDIS_ERR)
    exit(1);
 
// UNIX 域套接字
/* Open the listening Unix domain socket. */
if (server.unixsocket != NULL) {
    unlink(server.unixsocket); /* don't care if this fails */
    server.sofd = anetUnixServer(server.neterr,server.unixsocket,server.unixsocketperm);
    if (server.sofd == ANET_ERR) {
        redisLog(REDIS_WARNING, "Opening socket: %s", server.neterr);
        exit(1);
    }
}
```

从上面可以看出，redis 提供了 TCP 和 UNIX 域套接字两种工作方式。

以 TCP 工作方式为例，listenPort() 创建绑定了套接字并启动了监听。

# 为监听套接字注册事件

在进入事件循环前还需要做一些准备工作。

紧接着，initServer() 为所有的监听套接字注册了读事件，响应函数为 acceptTcpHandler() 或者 acceptUnixHandler()。

```c
// 创建接收 TCP 或者 UNIX 域套接字的事件处理
// TCP
/* Create an event handler for accepting new connections in TCP and Unix
 * domain sockets. */
for (j = 0; j < server.ipfd_count; j++) {
 
    // acceptTcpHandler() tcp 连接接受处理函数
    if (aeCreateFileEvent(server.el, server.ipfd[j], AE_READABLE,
        acceptTcpHandler,NULL) == AE_ERR)
        {
            redisPanic(
                "Unrecoverable error creating server.ipfd file event.");
        }
}
 
// UNIX 域套接字
if (server.sofd > 0 && aeCreateFileEvent(server.el,server.sofd,AE_READABLE,
    acceptUnixHandler,NULL) == AE_ERR) redisPanic("Unrecoverable error creating server.sofd file event.");
```

## acceptTcpHandler() 
 
来看看 acceptTcpHandler() 做了什么：

```c
// 用于 TCP 接收请求的处理函数
void acceptTcpHandler(aeEventLoop *el, int fd, void *privdata, int mask) {
    int cport, cfd;
    char cip[REDIS_IP_STR_LEN];
    REDIS_NOTUSED(el);
    REDIS_NOTUSED(mask);
    REDIS_NOTUSED(privdata);
 
    // 接收客户端请求
    cfd = anetTcpAccept(server.neterr, fd, cip, sizeof(cip), &cport);
 
    // 出错
    if (cfd == AE_ERR) {
        redisLog(REDIS_WARNING,"Accepting client connection: %s", server.neterr);
        return;
    }
 
    // 记录
    redisLog(REDIS_VERBOSE,"Accepted %s:%d", cip, cport);
 
    // 真正有意思的地方
    acceptCommonHandler(cfd,0);
}
```

接收套接字与客户端建立连接后，调用 acceptCommonHandler()。acceptCommonHandler() 主要工作就是：

1. 建立并保存服务端与客户端的连接信息，这些信息保存在一个 struct redisClient 结构体中；

2. 为与客户端连接的套接字注册读事件，相应的回调函数为 readQueryFromClient()，readQueryFromClient() 作用是从套接字读取数据，执行相应操作并回复客户端。


# redis 事件循环

## 简述

以上做好了准备工作，可以进入事件循环。

跳出 initServer() 回到 main() 中，main() 会调用 aeMain()。

进入事件循环发生在 aeProcessEvents() 中：

根据定时事件表计算需要等待的最短时间；

调用 redis api aeApiPoll() 进入监听轮询，如果没有事件发生就会进入睡眠状态，其实就是 I/O 多路复用 select() epoll() 等的调用；
有事件发生会被唤醒，处理已触发的 I/O 事件和定时事件。

## 源码

```c
void aeMain(aeEventLoop *eventLoop) {
    eventLoop->stop = 0;
    while (!eventLoop->stop) {
 
        // 进入事件循环可能会进入睡眠状态。在睡眠之前，执行预设置的函数 aeSetBeforeSleepProc()。
        if (eventLoop->beforesleep != NULL)
            eventLoop->beforesleep(eventLoop);
 
        // AE_ALL_EVENTS 表示处理所有的事件
        aeProcessEvents(eventLoop, AE_ALL_EVENTS);
    }
}
 
// 先处理定时事件，然后处理套接字事件
int aeProcessEvents(aeEventLoop *eventLoop, int flags)
{
    int processed = 0, numevents;
 
    /* Nothing to do? return ASAP */
    if (!(flags & AE_TIME_EVENTS) && !(flags & AE_FILE_EVENTS)) return 0;
 
    /* Note that we want call select() even if there are no
     * file events to process as long as we want to process time
     * events, in order to sleep until the next time event is ready
     * to fire. */
    if (eventLoop->maxfd != -1 ||
        ((flags & AE_TIME_EVENTS) && !(flags & AE_DONT_WAIT))) {
 
        int j;
        aeTimeEvent *shortest = NULL;
        // tvp 会在 IO 多路复用的函数调用中用到，表示超时时间
        struct timeval tv, *tvp;
 
        // 得到最短将来会发生的定时事件
        if (flags & AE_TIME_EVENTS && !(flags & AE_DONT_WAIT))
            shortest = aeSearchNearestTimer(eventLoop);
 
        // 计算睡眠的最短时间
        if (shortest) { // 存在定时事件
            long now_sec, now_ms;
 
            /* Calculate the time missing for the nearest
             * timer to fire. */
            // 得到当前时间
            aeGetTime(&now_sec, &now_ms);
            tvp = &tv;
            tvp->tv_sec = shortest->when_sec - now_sec;
            if (shortest->when_ms < now_ms) { // 需要借位
                // 减法中的借位，毫秒向秒借位
                tvp->tv_usec = ((shortest->when_ms+1000) - now_ms)*1000;
                tvp->tv_sec --;
            } else { // 不需要借位，直接减
                tvp->tv_usec = (shortest->when_ms - now_ms)*1000;
            }
 
            // 当前系统时间已经超过定时事件设定的时间
            if (tvp->tv_sec < 0) tvp->tv_sec = 0;
            if (tvp->tv_usec < 0) tvp->tv_usec = 0;
        } else {
            /* If we have to check for events but need to return
             * ASAP because of AE_DONT_WAIT we need to set the timeout
             * to zero */
            // 如果没有定时事件，见机行事
            if (flags & AE_DONT_WAIT) {
                tv.tv_sec = tv.tv_usec = 0;
                tvp = &tv;
            } else {
                /* Otherwise we can block */
                tvp = NULL; /* wait forever */
            }
        }
 
        // 调用 IO 多路复用函数阻塞监听
        numevents = aeApiPoll(eventLoop, tvp);
 
        // 处理已经触发的事件
        for (j = 0; j < numevents; j++) {
            // 找到 I/O 事件表中存储的数据
            aeFileEvent *fe = &eventLoop->events[eventLoop->fired[j].fd];
            int mask = eventLoop->fired[j].mask;
            int fd = eventLoop->fired[j].fd;
            int rfired = 0;
 
         /* note the fe->mask & mask & ... code: maybe an already processed
             * event removed an element that fired and we still didn't
             * processed, so we check if the event is still valid. */
            // 读事件
            if (fe->mask & mask & AE_READABLE) {
                rfired = 1;
                fe->rfileProc(eventLoop,fd,fe->clientData,mask);
            }
            // 写事件
            if (fe->mask & mask & AE_WRITABLE) {
                if (!rfired || fe->wfileProc != fe->rfileProc)
                    fe->wfileProc(eventLoop,fd,fe->clientData,mask);
            }
            processed++;
        }
    }
 
    // 处理定时事件
    /* Check time events */
    if (flags & AE_TIME_EVENTS)
        processed += processTimeEvents(eventLoop);
 
    return processed; /* return the number of processed file/time events */
}
```

# 事件触发

## 简述

这里以 select 版本的 redis api 实现作为讲解，aeApiPoll() 调用了 select() 进入了监听轮询。

aeApiPoll() 的 tvp 参数是最小等待时间，它会被预先计算出来，它主要完成：

1. 拷贝读写的 fdset。select() 的调用会破坏传入的 fdset，实际上有两份 fdset，一份作为备份，另一份用作调用。每次调用 select() 之前都从备份中直接拷贝一份；

2. 调用 select()；

3. 被唤醒后，检查 fdset 中的每一个文件描述符，并将可读或者可写的描述符记录到触发表当中。

接下来的操作便是执行相应的回调函数，代码在上一段中已经贴出：先处理 I/O 事件，再处理定时事件。

## 代码

```c
static int aeApiPoll(aeEventLoop *eventLoop, struct timeval *tvp) {
    aeApiState *state = eventLoop->apidata;
    int retval, j, numevents = 0;
 
/*
    真有意思，在 aeApiState 结构中：
    typedef struct aeApiState {
        fd_set rfds, wfds;
        fd_set _rfds, _wfds;
    } aeApiState;
    在调用 select() 的时候传入的是 _rfds 和 _wfds，所有监听的数据在 rfds 和 wfds 中。
    在下次需要调用 selec() 的时候，会将 rfds 和 wfds 中的数据拷贝进 _rfds 和 _wfds 中。*/
    memcpy(&state->_rfds,&state->rfds,sizeof(fd_set));
    memcpy(&state->_wfds,&state->wfds,sizeof(fd_set));
 
    retval = select(eventLoop->maxfd+1,
                &state->_rfds,&state->_wfds,NULL,tvp);
    if (retval > 0) {
        // 轮询
        for (j = 0; j <= eventLoop->maxfd; j++) {
            int mask = 0;
            aeFileEvent *fe = &eventLoop->events[j];
 
            if (fe->mask == AE_NONE) continue;
            if (fe->mask & AE_READABLE && FD_ISSET(j,&state->_rfds))
                mask |= AE_READABLE;
            if (fe->mask & AE_WRITABLE && FD_ISSET(j,&state->_wfds))
                mask |= AE_WRITABLE;
 
            // 添加到触发事件表中
            eventLoop->fired[numevents].fd = j;
            eventLoop->fired[numevents].mask = mask;
            numevents++;
        }
    }
    return numevents;
}
```

# 总结

redis 的事件驱动总结如下：

初始化事件循环结构体

注册监听套接字的读事件

注册定时事件

进入事件循环

如果监听套接字变为可读，会接收客户端请求，并为对应的套接字注册读事件

如果与客户端连接的套接字变为可读，执行相应的操作


# 拓展阅读

[Reactor 模式]()

# 参考资料

[深入剖析 redis 事件驱动](https://www.cnblogs.com/daoluanxiaozi/p/3590093.html)

[Redis 中的事件](https://segmentfault.com/a/1190000016062999)

* any list
{:toc}
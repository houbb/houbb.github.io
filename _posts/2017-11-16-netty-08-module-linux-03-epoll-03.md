---
layout: post
title:  Netty-08-linux 通讯模型之 epoll
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, linux, sh]
published: true
---

# epoll

直到Linux2.6才出现了由内核直接支持的实现方法，那就是epoll，被公认为Linux2.6下性能最好的多路IO就绪通知方法。epoll可以同时支持水平触发和边缘触发（Edge Triggered，只告诉进程哪些文件描述符刚刚变为就绪状态，它只说一遍，如果我们没有采取行动，那么它将不会再次告知，这种方式称为边缘触发），理论上边缘触发的性能要更高一些，但是代码实现相当复杂。epoll同样只告知那些就绪的文件描述符，而且当我们调用epoll_wait()获得就绪文件描述符时，返回的不是实际的描述符，而是一个代表就绪描述符数量的值，你只需要去epoll指定的一个数组中依次取得相应数量的文件描述符即可，这里也使用了内存映射（mmap）技术，这样便彻底省掉了这些文件描述符在系统调用时复制的开销。另一个本质的改进在于epoll采用基于事件的就绪通知方式。在select/poll中，进程只有在调用一定的方法后，内核才对所有监视的文件描述符进行扫描，而epoll事先通过epoll_ctl()来注册一个文件描述符，一旦基于某个文件描述符就绪时，内核会采用类似callback的回调机制，迅速激活这个文件描述符，当进程调用epoll_wait()时便得到通知。

# 解决了 select 的缺点

epoll既然是对select和poll的改进，就应该能避免上述的三个缺点。

那epoll都是怎么解决的呢？在此之前，我们先看一下epoll 和select和poll的调用接口上的不同，select和poll都只提供了一个函数——select或者poll函数。而epoll提供了三个函 数，epoll_create,epoll_ctl和epoll_wait，epoll_create是创建一个epoll句柄；epoll_ctl是注 册要监听的事件类型；epoll_wait则是等待事件的产生。

对于第一个缺点，epoll的解决方案在epoll_ctl函数中。每次注册新的事件到epoll句柄中时（在epoll_ctl中指定 EPOLL_CTL_ADD），会把所有的fd拷贝进内核，而不是在epoll_wait的时候重复拷贝。epoll保证了每个fd在整个过程中只会拷贝一次。

对于第二个缺点，epoll的解决方案不像select或poll一样每次都把current轮流加入fd对应的设备等待队列中，而只在 epoll_ctl时把current挂一遍（这一遍必不可少）并为每个fd指定一个回调函数，当设备就绪，唤醒等待队列上的等待者时，就会调用这个回调 函数，而这个回调函数会把就绪的fd加入一个就绪链表）。epoll_wait的工作实际上就是在这个就绪链表中查看有没有就绪的fd（利用 schedule_timeout()实现睡一会，判断一会的效果，和select实现中的第7步是类似的）。

对于第三个缺点，epoll没有这个限制，它所支持的FD上限是最大可以打开文件的数目，这个数字一般远大于2048,举个例子, 在1GB内存的机器上大约是10万左右，具体数目可以cat /proc/sys/fs/file-max察看,一般来说这个数目和系统内存关系很大。


## epoll的优点：

1、没有最大并发连接的限制，能打开的FD的上限远大于1024（1G的内存上能监听约10万个端口）；

2、效率提升，不是轮询的方式，不会随着FD数目的增加效率下降。只有活跃可用的FD才会调用callback函数；

即Epoll最大的优点就在于它只管你“活跃”的连接，而跟连接总数无关，因此在实际的网络环境中，Epoll的效率就会远远高于select和poll。

3、内存拷贝，利用mmap()文件映射内存加速与内核空间的消息传递；即epoll使用mmap减少复制开销。

# linux 函数使用

## api

要想使用 epoll 模型，必须先需要创建一个 epollfd，这需要使用 epoll_create 函数去创建：

```c
#include <sys/epoll.h>

int epoll_create(int size);
```

参数 size 从 Linux 2.6.8 以后就不再使用，但是必须设置一个大于 0 的值。

epoll_create 函数调用成功返回一个非负值的 epollfd，调用失败返回 -1。

有了 epollfd 之后，我们需要将我们需要检测事件的其他 fd 绑定到这个 epollfd 上，或者修改一个已经绑定上去的 fd 的事件类型，或者在不需要时将 fd 从 epollfd 上解绑，这都可以使用 epoll_ctl 函数：

```c
int epoll_ctl(int epfd, int op, int fd, struct epoll_event* event);
```

### 参数说明：

参数 epfd 即上文提到的 epollfd；

参数 op，操作类型，取值有 EPOLL_CTL_ADD、EPOLL_CTL_MOD 和 EPOLL_CTL_DEL，分别表示向 epollfd 上添加、修改和移除一个其他 fd，当取值是 EPOLL_CTL_DEL，第四个参数 event 忽略不计，可以设置为 NULL；

参数 fd，即需要被操作的 fd；

参数 event，这是一个 epoll_event 结构体的地址，epoll_event 结构体定义如下：

```c
struct epoll_event
{
    uint32_t     events;      /* 需要检测的 fd 事件，取值与 poll 函数一样 */
    epoll_data_t data;        /* 用户自定义数据 */
};
```

epoll_event 结构体的 data 字段的类型是 epoll_data_t，我们可以利用这个字段设置一个自己的自定义数据，它本质上是一个 Union 对象，在 64 位操作系统中其大小是 8 字节，其定义如下：

```c
typedef union epoll_data
{
    void*		 ptr;
    int          fd;
    uint32_t     u32;
    uint64_t     u64;
} epoll_data_t;
```

函数返回值：epoll_ctl 调用成功返回 0，调用失败返回 -1，你可以通过 errno 错误码获取具体的错误原因。

创建了 epollfd，设置好某个 fd 上需要检测事件并将该 fd 绑定到 epollfd 上去后，我们就可以调用 epoll_wait 检测事件了，epoll_wait 函数签名如下：

```c
int epoll_wait(int epfd, struct epoll_event* events, int maxevents, int timeout);
```

参数的形式和 poll 函数很类似，参数 events 是一个 epoll_event 结构数组的首地址，这是一个输出参数，函数调用成功后，events 中存放的是与就绪事件相关 epoll_event 结构体数组；参数 maxevents 是数组元素的个数；timeout 是超时时间，单位是毫秒，如果设置为 0，epoll_wait 会立即返回。

当 epoll_wait 调用成功会返回有事件的 fd 数目；如果返回 0 表示超时；调用失败返回 -1。

epoll_wait 使用示例如下：

```c
while (true)
{
    epoll_event epoll_events[1024];
    int n = epoll_wait(epollfd, epoll_events, 1024, 1000);
    if (n < 0)
    {
        //被信号中断
        if (errno == EINTR)
            continue;

        //出错，退出
        break;
    }
    else if (n == 0)
    {
        //超时，继续
        continue;
    }

    for (size_t i = 0; i < n; ++i)
    {
        // 处理可读事件
        if (epoll_events[i].events & POLLIN)
        {
        }
        // 处理可写事件
        else if (epoll_events[i].events & POLLOUT)
        {
        }
        //处理出错事件
        else if (epoll_events[i].events & POLLERR)
        {
        }
    }
}
```

# epoll_wait 与 poll 的区别

通过前面介绍 poll 与 epoll_wait 函数的介绍，我们可以发现：

epoll_wait 函数调用完之后，我们可以直接在 event 参数中拿到所有有事件就绪的 fd，直接处理即可（event 参数仅仅是个出参）；

而 poll 函数的事件集合调用前后数量都未改变，只不过调用前我们通过 pollfd 结构体的 events 字段设置待检测事件，调用后我们需要通过 pollfd 结构体的 revents 字段去检测就绪的事件（ 参数 fds 既是入参也是出参）。

举个生活中的例子，某人不断给你一些苹果，这些苹果有生有熟，调用 epoll_wait 相当于：

1. 你把苹果挨个投入到 epoll 机器中(调用 epoll_ctl);

2. 调用 epoll_wait 加工，你直接通过另外一个袋子就能拿到所有熟苹果。

调用 poll 相当于：

1. 把收到的苹果装入一个袋子里面然后调用 poll 加工；

2. 调用结束后，拿到原来的袋子，袋子中还是原来那么多苹果，只不过熟苹果被贴上了标签纸，你还是需要挨个去查看标签纸挑选熟苹果。

当然，这并不意味着，poll 函数的效率不如 epoll_wait，一般在 fd 数量比较多，但某段时间内，就绪事件 fd 数量较少的情况下，epoll_wait 才会体现出它的优势，也就是说 socket 连接数量较大时而活跃连接较少时 epoll 模型更高效。

# LT 模式和 ET 模式

与 poll 的事件宏相比，epoll 新增了一个事件宏 EPOLLET，这就是所谓的边缘触发模式（Edge Trigger，ET），而默认的模式我们称为 水平触发模式（Level Trigger，LT）。

这两种模式的区别在于：

对于水平触发模式，一个事件只要有，就会一直触发；

对于边缘触发模式，只有一个事件从无到有才会触发。

这两个词汇来自电学术语，你可以将 fd 上有数据认为是高电平，没有数据认为是低电平，将 fd 可写认为是高电平，fd 不可写认为是低电平。

那么水平模式的触发条件是状态处于高电平，而边缘模式的触发条件是新来一次电信号将当前状态变为高电平，即：

- 水平模式的触发条件

1. 低电平 => 高电平

2. 处于高电平状态

- 边缘模式的触发条件

1. 低电平 => 高电平

说的有点抽象，以 socket 的读事件为例，对于水平模式，只要 socket 上有未读完的数据，就会一直产生 POLLIN 事件；

而对于边缘模式，socket 上每新来一次数据就会触发一次，如果上一次触发后，未将 socket 上的数据读完，也不会再触发，除非再新来一次数据。

对于 socket 写事件，如果 socket 的 TCP 窗口一直不饱和，会一直触发 POLLOUT 事件；

而对于边缘模式，只会触发一次，除非 TCP 窗口由不饱和变成饱和再一次变成不饱和，才会再次触发 POLLOUT 事件。

- socket 可读事件水平模式触发条件：

1. socket上无数据 => socket上有数据

2. socket处于有数据状态

- socket 可读事件边缘模式触发条件：

1. socket上无数据 => socket上有数据

2. socket又新来一次数据

- socket 可写事件水平模式触发条件：

1. socket可写 => socket可写

2. socket不可写 => socket可写

- socket 可写事件边缘模式触发条件：

1. socket不可写 => socket可写

也就是说，如果对于一个非阻塞 socket，如果使用 epoll 边缘模式去检测数据是否可读，触发可读事件以后，一定要一次性把 socket 上的数据收取干净才行，也就是说一定要循环调用 recv 函数直到 recv 出错，错误码是EWOULDBLOCK（EAGAIN 一样）（此时表示 socket 上本次数据已经读完）；

如果使用水平模式，则不用，你可以根据业务一次性收取固定的字节数，或者收完为止。

## 边缘模式示例代码

边缘模式下收取数据的代码写法示例如下：

```c
 bool TcpSession::RecvEtMode()
 {
     //每次只收取256个字节
     char buff[256];
     while (true)
     {       
         int nRecv = ::recv(clientfd_, buff, 256, 0);
         if (nRecv == -1)
         {
             if (errno == EWOULDBLOCK)
                 return true;
             else if (errno == EINTR)
                 continue;
 ​
             return false;
         }
         //对端关闭了socket
         else if (nRecv == 0)
             return false;
 ​
         inputBuffer_.add(buff, (size_t)nRecv);
     }
 ​
     return true;
 }
```

## 对比案例

```c
/** 
  * 验证epoll的LT与ET模式的区别, epoll_server.cpp
  * zhangyl 2019.04.01
  */
 #include<sys/types.h>
 #include<sys/socket.h>
 #include<arpa/inet.h>
 #include<unistd.h>
 #include<fcntl.h>
 #include<sys/epoll.h>
 #include<poll.h>
 #include<iostream>
 #include<string.h>
 #include<vector>
 #include<errno.h>
 #include<iostream>
 ​
 int main()
 {
     //创建一个监听socket
     int listenfd = socket(AF_INET, SOCK_STREAM, 0);
     if (listenfd == -1)
     {
         std::cout << "create listen socket error" << std::endl;
         return -1;
     }
 ​
     //设置重用ip地址和端口号
     int on = 1;
     setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, (char*)&on, sizeof(on));
     setsockopt(listenfd, SOL_SOCKET, SO_REUSEPORT, (char*)&on, sizeof(on));
 ​
 ​
     //将监听socker设置为非阻塞的
     int oldSocketFlag = fcntl(listenfd, F_GETFL, 0);
     int newSocketFlag = oldSocketFlag | O_NONBLOCK;
     if (fcntl(listenfd, F_SETFL, newSocketFlag) == -1)
     {
         close(listenfd);
         std::cout << "set listenfd to nonblock error" << std::endl;
         return -1;
     }
 ​
     //初始化服务器地址
     struct sockaddr_in bindaddr;
     bindaddr.sin_family = AF_INET;
     bindaddr.sin_addr.s_addr = htonl(INADDR_ANY);
     bindaddr.sin_port = htons(3000);
 ​
     if (bind(listenfd, (struct sockaddr*)&bindaddr, sizeof(bindaddr)) == -1)
     {
         std::cout << "bind listen socker error." << std::endl;
         close(listenfd);
         return -1;
     }
 ​
     //启动监听
     if (listen(listenfd, SOMAXCONN) == -1)
     {
         std::cout << "listen error." << std::endl;
         close(listenfd);
         return -1;
     }
 ​
 ​
     //创建epollfd
     int epollfd = epoll_create(1);
     if (epollfd == -1)
     {
         std::cout << "create epollfd error." << std::endl;
         close(listenfd);
         return -1;
     }
 ​
     epoll_event listen_fd_event;
     listen_fd_event.data.fd = listenfd;
     listen_fd_event.events = EPOLLIN;
     //取消注释掉这一行，则使用ET模式
     //listen_fd_event.events |= EPOLLET;
 ​
     //将监听sokcet绑定到epollfd上去
     if (epoll_ctl(epollfd, EPOLL_CTL_ADD, listenfd, &listen_fd_event) == -1)
     {
         std::cout << "epoll_ctl error" << std::endl;
         close(listenfd);
         return -1;
     }
 ​
     int n;
     while (true)
     {
         epoll_event epoll_events[1024];
         n = epoll_wait(epollfd, epoll_events, 1024, 1000);
         if (n < 0)
         {
             //被信号中断
             if (errno == EINTR) 
                 continue;
 ​
             //出错,退出
             break;
         }
         else if (n == 0)
         {
             //超时,继续
             continue;
         }
         for (size_t i = 0; i < n; ++i)
         {
             //事件可读
             if (epoll_events[i].events & EPOLLIN)
             {
                 if (epoll_events[i].data.fd == listenfd)
                 {
                     //侦听socket,接受新连接
                     struct sockaddr_in clientaddr;
                     socklen_t clientaddrlen = sizeof(clientaddr);
                     int clientfd = accept(listenfd, (struct sockaddr*)&clientaddr, &clientaddrlen);
                     if (clientfd != -1)
                     {
                         int oldSocketFlag = fcntl(clientfd, F_GETFL, 0);
                         int newSocketFlag = oldSocketFlag | O_NONBLOCK;
                         if (fcntl(clientfd, F_SETFD, newSocketFlag) == -1)
                         {
                             close(clientfd);
                             std::cout << "set clientfd to nonblocking error." << std::endl;
                         }
                         else
                         {
                             epoll_event client_fd_event;
                             client_fd_event.data.fd = clientfd;
                             client_fd_event.events = EPOLLIN;
                             //取消注释这一行，则使用ET模式
                             //client_fd_event.events |= EPOLLET; 
                             if (epoll_ctl(epollfd, EPOLL_CTL_ADD, clientfd, &client_fd_event) != -1)
                             {
                                 std::cout << "new client accepted,clientfd: " << clientfd << std::endl;
                             }
                             else
                             {
                                 std::cout << "add client fd to epollfd error" << std::endl;
                                 close(clientfd);
                             }
                         }
                     }
                 }
                 else
                 {
                     std::cout << "client fd: " << epoll_events[i].data.fd << " recv data." << std::endl;
                     //普通clientfd
                     char ch;
                     //每次只收一个字节
                     int m = recv(epoll_events[i].data.fd, &ch, 1, 0);
                     if (m == 0)
                     {
                         //对端关闭了连接，从epollfd上移除clientfd
                         if (epoll_ctl(epollfd, EPOLL_CTL_DEL, epoll_events[i].data.fd, NULL) != -1)
                         {
                             std::cout << "client disconnected,clientfd:" << epoll_events[i].data.fd << std::endl;
                         }
                         close(epoll_events[i].data.fd);
                     }
                     else if (m < 0)
                     {
                         //出错
                         if (errno != EWOULDBLOCK && errno != EINTR)
                         {
                             if (epoll_ctl(epollfd, EPOLL_CTL_DEL, epoll_events[i].data.fd, NULL) != -1)
                             {
                                 std::cout << "client disconnected,clientfd:" << epoll_events[i].data.fd << std::endl;
                             }
                             close(epoll_events[i].data.fd);
                         }
                     }
                     else
                     {
                         //正常收到数据
                         std::cout << "recv from client:" << epoll_events[i].data.fd << ", " << ch << std::endl;
                     }
                 }
             }
             else if (epoll_events[i].events & POLLERR)
             {
                 // TODO 暂不处理
             }
         }
     }
 ​
     close(listenfd);
     return 0;
 }
```

## 模式小结

LT 模式和 ET 模式各有优缺点，无所谓孰优孰劣。

使用 LT 模式，我们可以自由决定每次收取多少字节（对于普通 socket）或何时接收连接（对于侦听 socket），但是可能会导致多次触发；

使用 ET 模式，我们必须每次都要将数据收完（对于普通 socket）或必须理解调用 accept 接收连接（对于侦听socket），其优点是触发次数少。

# 总结

（1）select，poll实现需要自己不断轮询所有fd集合，直到设备就绪，期间可能要睡眠和唤醒多次交替。而epoll其实也需要调用 epoll_wait不断轮询就绪链表，期间也可能多次睡眠和唤醒交替，但是它是设备就绪时，调用回调函数，把就绪fd放入就绪链表中，并唤醒在 epoll_wait中进入睡眠的进程。虽然都要睡眠和交替，但是select和poll在“醒着”的时候要遍历整个fd集合，而epoll在“醒着”的 时候只要判断一下就绪链表是否为空就行了，这节省了大量的CPU时间，这就是回调机制带来的性能提升。

（2）select，poll每次调用都要把fd集合从用户态往内核态拷贝一次，并且要把current往设备等待队列中挂一次，而epoll只要 一次拷贝，而且把current往等待队列上挂也只挂一次（在epoll_wait的开始，注意这里的等待队列并不是设备等待队列，只是一个epoll内 部定义的等待队列），这也能节省不少的开销。




# 参考资料

[Linux 下的五种 IO 模型详细介绍](https://www.jb51.net/article/94783.htm)

[Linux IO模式及 select、poll、epoll详解](https://segmentfault.com/a/1190000003063859)

[网络通信基础重难点解析 12 ：Linux epoll 模型](https://zhuanlan.zhihu.com/p/60028202)

* any list
{:toc}


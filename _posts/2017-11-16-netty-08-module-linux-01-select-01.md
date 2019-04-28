---
layout: post
title:  Netty-08-linux 通讯模型之 select
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, linux, sh]
published: true
---

# 概览

epoll跟select都能提供多路I/O复用的解决方案。

在现在的Linux内核里有都能够支持，其中epoll是Linux所特有，而select则应该是POSIX所规定，一般操作系统均有实现。

# select

## select 与 poll 工作原理：

1、select 主要是采用轮询的方式来实现对就绪的 fd 处理：

2、poll 和 select 基本相同，主要不同在于 poll 没有对 fd 数量限制

![select module](https://s1.51cto.com/images/blog/201711/28/f7490478590a2e47919da6f35f8a8a81.jpg?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_100,g_se,x_10,y_10,shadow_90,type_ZmFuZ3poZW5naGVpdGk=)

## 函数定义

```
int select(int nfds,
               fd_set *restrict readfds,
               fd_set *restrict writefds,
               fd_set *restrict errorfds,
               struct timeval *restrict timeout);
nfds:    监控的文件描述符集里最大文件描述符+1，此参数会告诉内核检测前多少个文件描述符的状态
readfds: 监控有读数据到达文件描述符集合，传入传出参数
writefds:监控写数据到达文件描述符集合，传入传出参数
exceptfds:监控异常发生达文件描述符集合,如带外数据到达异常，传入传出参数
timeout:定时阻塞监控时间，3种情况
    1. NULL，阻塞, 但是在select检测到之后会结束阻塞
    2. 设置timeval，等待固定时间
    3. 设置timeval里时间均为0，检查描述字后立即返回，轮询
struct timeval {
        long tv_sec; /* seconds */
        long tv_usec; /* microseconds */
    };
    4.返回值, 返回有几个文件描述符变化了, 但是不知道是哪一个, 需要遍历查找
    void FD_CLR(int fd, fd_set *set);   //把文件描述符集合里fd清0
    int FD_ISSET(int fd, fd_set *set);  //测试文件描述符集合里fd是否置1
    void FD_SET(int fd, fd_set *set);   //把文件描述符集合里fd位置1
    void FD_ZERO(fd_set *set);      //把文件描述符集合里所有位清0
```

select的第一个参数nfds为fdset集合中最大描述符值加1，fdset是一个位数组，其大小限制为__FD_SETSIZE（1024），位数组的每一位代表其对应的描述符是否需要被检查。

第二三四参数表示需要关注读、写、错误事件的文件描述符位数组，这些参数既是输入参数也是输出参数，可能会被内核修改用于标示哪些描述符上发生了关注的事件，所以每次调用select前都需要重新初始化fdset。

timeout参数为超时时间，该结构会被内核修改，其值为超时剩余的时间。

## 调用步骤

![基本原理](http://hi.csdn.net/attachment/201203/11/2429699_1331492431cuPx.gif)

select的调用步骤如下：

使用copy_from_user从用户空间拷贝fdset到内核空间

注册回调函数__pollwait

遍历所有fd，调用其对应的poll方法（对于socket，这个poll方法是sock_poll，sock_poll根据情况会调用到tcp_poll,udp_poll或者datagram_poll）
以tcp_poll为例，其核心实现就是__pollwait，也就是上面注册的回调函数。

__pollwait的主要工作就是把current（当前进程）挂到设备的等待队列中，不同的设备有不同的等待队列，对于tcp_poll 来说，其等待队列是sk->sk_sleep（注意把进程挂到等待队列中并不代表进程已经睡眠了）。在设备收到一条消息（网络设备）或填写完文件数 据（磁盘设备）后，会唤醒设备等待队列上睡眠的进程，这时current便被唤醒了。

poll方法返回时会返回一个描述读写操作是否就绪的mask掩码，根据这个mask掩码给fd_set赋值。

如果遍历完所有的fd，还没有返回一个可读写的mask掩码，则会调用schedule_timeout是调用select的进程（也就是 current）进入睡眠。当设备驱动发生自身资源可读写后，会唤醒其等待队列上睡眠的进程。如果超过一定的超时时间（schedule_timeout 指定），还是没人唤醒，则调用select的进程会重新被唤醒获得CPU，进而重新遍历fd，判断有没有就绪的fd。

把fd_set从内核空间拷贝到用户空间。

# select 的缺点

select本质上是通过设置或者检查存放fd标志位的数据结构来进行下一步处理。

总结下select的几大缺点：

（1）每次调用select，都需要把fd集合从用户态拷贝到内核态，这个开销在fd很多时会很大 

（2）同时每次调用select都需要在内核遍历传递进来的所有fd，这个开销在fd很多时也很大 

（3）select支持的文件描述符数量太小了，默认是1024

一般来说这个数目和系统内存关系很大，具体数目可以cat /proc/sys/fs/file-max察看。32位机默认是1024个。64位机默认是2048.

（4）对socket进行扫描时是线性扫描，即采用轮询的方法，效率较低

当套接字比较多的时候，每次select()都要通过遍历FD_SETSIZE个Socket来完成调度,不管哪个Socket是活跃的,都遍历一遍。这会浪费很多CPU时间。如果能给套接字注册某个回调函数，当他们活跃时，自动完成相关操作，那就避免了轮询，这正是epoll与kqueue做的。

# 源码

## server 代码

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <string.h>
#include <ctype.h>

#define SERV_PORT 8888

int main(int argc, const char * argv[]) {
    int lfd, cfd;   //创建监听 通信文件描述符
    struct sockaddr_in serv_addr, clien_addr;
    // creat socket
    lfd = socket(AF_INET, SOCK_STREAM, 0);
    // init server sockaddr
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;                //地址族, ipv4
    serv_addr.sin_addr.s_addr = htonl(INADDR_ANY); //监听本机所有IP
    serv_addr.sin_port = htons(SERV_PORT);         //设置端口
    
    socklen_t serv_len = sizeof(serv_addr);
    
    int opt = 1;
    // 设置端口复用
    setsockopt(lfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    
    //绑定端口
    bind(lfd, (struct sockaddr *)&serv_addr, serv_len);
    
    //设置同时监听的最大个数
    listen(lfd, 64);
    printf("start accept ... \n");
    
    int maxfd = lfd;
    /**
     *  设置最大的文件描述符, 交给系统内核处理, 系统内核发现有客户端连接则会监听到变化
     *  创建要监听的文件描述符表, 但是系统监听时会将没有变化的移除
     *  此时创建一个临时的文件描述符表给系统
     */
    fd_set reads, test;
    
    // init fd_set
    FD_ZERO(&reads);
    FD_SET(lfd, &reads);
    
    while (1) {
        test = reads;
        //将test表交给系统, 系统检测中会修改发生改变的文件描述符
        int ret = select(maxfd+1, &test, NULL, NULL, NULL);
        if (ret == -1) {
            perror("select error");
            exit(1);
        }
        //判断是否有新的客户端连接, 如果存在则证明select检测到了lfd发生改变-有客户端连进来
        if (FD_ISSET(lfd, &test)) {
            socklen_t clien_len = sizeof(clien_addr);
            cfd = accept(lfd, (struct sockaddr*)&clien_addr, &clien_len);
            if(cfd == -1) {
                perror("accept error");
                exit(1);
            }
            char ipbuf[128];
            printf("new client link IP: %s, port: %d\n", inet_ntop(AF_INET, &clien_addr.sin_addr.s_addr, ipbuf, sizeof(ipbuf)),
                   ntohs(clien_addr.sin_port));
            // cfd放到检测读的集合中
            FD_SET(cfd, &reads);
            // 更新最大的文件描述符
            maxfd = maxfd < cfd ? cfd : maxfd;
        }
        //检测客户端是否有数据到达, 因为系统没有提供变化的, 所以需要遍历
        for(int i = lfd+1; i<=maxfd; ++i) {
            // 判断文件描述符是否在读集合中
            if(FD_ISSET(i, &test)) {
                char buf[1024] = {0};
                int len = (int)recv(i,  buf, sizeof(buf), 0);
                if(len == -1) {
                    perror("recv error");
                    exit(1);
                } else if(len == 0) { // == 0 客户端主动断开了连接
                    printf("客户端关闭了连接。。。\n");
                    // 从检测读的集合中删除该文件描述符
                    FD_CLR(i, &reads);
                    close(i);
                } else {
                    printf("read buf = %s\n",  buf);
                    for(int j=0; j<len; ++j) {
                        buf[j] = toupper(buf[j]);
                    }
                    printf("toupper buf == %s\n",  buf);
                    // 发送数据给客户端
                    send(i, buf, strlen(buf)+1, 0);
                }
            }
        }
    }
    return 0;
}
```

## 客户端

```c
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/types.h>          /* See NOTES */
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/ip.h> /* superset of previous */
 
#define backlog 5
#define BUFFSIZE 1024
 
int main(int argc, char *argv[])
{
    int sockfd = socket(PF_INET, SOCK_STREAM, 0);
    if(-1 == sockfd)
    {
        perror("socket");
        exit(EXIT_FAILURE);
    }
 
    struct sockaddr_in serv_addr;
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(atoi(argv[2]));
    serv_addr.sin_addr.s_addr = inet_addr(argv[1]);
 
    if(-1 == connect(sockfd, (struct sockaddr*)&serv_addr, sizeof(serv_addr)))
    {
        perror("connect");
        close(sockfd);
        exit(EXIT_FAILURE);
    }
    printf("connect success!\n");
 
    char buff[BUFFSIZE];
    int recvbytes, sendbytes;
    while(1)
    {
        fgets(buff, sizeof(buff), stdin);
        if(0 == strncmp(buff, "quit", 4))
        {
            printf("client quit!\n");
            break;
        }
        sendbytes = send(sockfd, buff, strlen(buff)+1, 0);
        if(sendbytes <= 0)
        {
            perror("send");
            break;
        }
    }
 
    close(sockfd);
 
    return 0;
}
```

# 参考资料

[linux下多路复用模型之Select模型](https://www.cnblogs.com/gongxijun/p/4702738.html)

[linux select 多路复用机制](https://blog.csdn.net/turkeyzhou/article/details/8609360)

[Linux并发服务器模型三 -- select](https://www.jianshu.com/p/850969f19d81)

[Linux -- select 与 poll 事件模型详解](https://blog.51cto.com/13126942/2045340)

[Linux 下select 模型](https://blog.csdn.net/HQ354974212/article/details/76176906)

[linux select 多路复用机制](https://blog.csdn.net/turkeyzhou/article/details/8609360)

https://www.cnblogs.com/renxs/p/3683189.html

* any list
{:toc}


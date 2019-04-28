---
layout: post
title:  Netty-08-linux 通讯模型之 poll
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, linux, sh]
published: true
---

# Poll

poll本质上和select没有区别，它将用户传入的数组拷贝到内核空间，然后查询每个fd对应的设备状态，如果设备就绪则在设备等待队列中加入一项并继续遍历，如果遍历完所有fd后没有发现就绪设备，则挂起当前进程，直到设备就绪或者主动超时，被唤醒后它又要再次遍历fd。

这个过程经历了多次无谓的遍历。

它没有最大连接数的限制，原因是它是基于链表来存储的，但是同样有一个缺点：

1、大量的fd的数组被整体复制于用户态和内核地址空间之间，而不管这样的复制是不是有意义。     

2、poll还有一个特点是“水平触发”，如果报告了fd后，没有被处理，那么下次poll时会再次报告该fd。

poll与select不同，通过一个pollfd数组向内核传递需要关注的事件，故没有描述符个数的限制，pollfd中的events字段和revents分别用于标示关注的事件和发生的事件，故pollfd数组只需要被初始化一次。

poll的实现机制与select类似，其对应内核中的sys_poll，只不过poll向内核传递pollfd数组，然后对pollfd中的每个描述符进行poll，相比处理fdset来说，poll效率更高。poll返回后，需要对pollfd中的每个元素检查其revents值，来得指事件是否发生。


# 调用形式

## api

```c
#include <poll.h>  

int poll(struct pollfd fds[], nfds_t nfds, int timeout)；  
```

## 参数说明

fds：存放需要被检测状态的Socket描述符；与select不同（select函数在调用之后，会清空检测socket描述符的数组），每当调用这个函数之后，系统不会清空这个数组，而是将有状态变化的描述符结构的revents变量状态变化，操作起来比较方便；

nfds：用于标记数组fds中的struct pollfd结构元素的总数量；

timeout：poll函数调用阻塞的时间，单位是MS（毫秒）

## struct pollfd结构

【在源码文件poll.h文件中】

```c
struct pollfd {  
    int fd;          /* poll 的文件描述符.  */
    short events;    /* fd 上感兴趣的事件(等待的事件).*/
    short revents;   /* fd 上实际发生的事件.  */
};  
```

这个结构中

fd表示文件描述符，

events表示请求检测的事件位掩码，

```
常量	说明
POLLIN	普通或优先级带数据可读
POLLRDNORM	普通数据可读
POLLRDBAND	优先级带数据可读
POLLPRI	高优先级数据可读
POLLOUT	普通数据可写
POLLWRNORM	普通数据可写
POLLWRBAND	优先级带数据可写
POLLERR	发生错误
POLLHUP	发生挂起
POLLNVAL	描述字不是一个打开的文件
```

注意：后三个只能作为描述字的返回结果存储在revents中，而不能作为测试条件用于events中。

revents表示检测之后返回的事件位掩码，如果当某个文件描述符有状态变化时，revents的值就不为空。 

## 返回值

大于0：表示数组fds中有socket描述符的状态发生变化，或可以读取、或可以写入、或出错。

并且返回的值表示这些状态有变化的socket描述符的总数量；此时可以对fds数组进行遍历，以寻找那些revents不空的socket描述符，然后判断这个里面有哪些事件以读取数据。

等于0：表示没有socket描述符有状态变化，并且调用超时。

小于0：此时表示有错误发生，此时全局变量errno保存错误码。

# 源码

## 服务端

```c
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/types.h>          /* See NOTES */
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/ip.h> /* superset of previous */
#include <sys/time.h>
#include <arpa/inet.h>
#include <poll.h>
 
#define backlog 5
#define BUFFSIZE 1024
 
int create_listenfd(const char *ip, unsigned short port)
{
    int listenfd = socket(PF_INET, SOCK_STREAM, 0);
    if(-1 == listenfd)
    {
        perror("socket");
        return -1;
    }
    
    struct sockaddr_in serv_addr;
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(port);
    serv_addr.sin_addr.s_addr = (ip == NULL ? INADDR_ANY :inet_addr(ip));
    
    if(-1 == bind(listenfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr)))
    {
        perror("bind");
        close(listenfd);
        return -1;
    }
    printf("bind success!\n");
    
    if(-1 == listen(listenfd, backlog))
    {
        perror("listen");
        close(listenfd);
        return -1;
    }
    printf("listening ...\n");
    
    return listenfd;
}
 
int main(int argc, char *argv[])
{
    int listenfd = create_listenfd(NULL,atoi(argv[2]));
    if(-1 == listenfd) 
    {
        return 0;
    }
    
    char buff[BUFFSIZE];
    int recvbytes, sendbytes;
    struct pollfd eventfds[BUFFSIZE];
    memset(eventfds, 0, sizeof(eventfds));
 
    eventfds[0].fd = STDIN_FILENO;
    eventfds[0].events = POLLIN;
    eventfds[1].fd = listenfd;
    eventfds[1].events = POLLIN;
    
    while(1)
    {    
        int ret = poll(eventfds, BUFFSIZE, 3*1000);
        if(-1 == ret)
        {
            perror("poll");
            break;
        }
        else if(0 == ret)
        {
            printf("timeout...\n");
        }
        else
        {
            for(int i = 0; i <= BUFFSIZE; i++)
            {
                int fd = eventfds[i].fd;
                if(eventfds[i].revents & POLLIN)
                {
                    if(fd == STDIN_FILENO)
                    {
                        fgets(buff, sizeof(buff), stdin);
                        printf("gets:%s",buff);
                    }
                    else if(fd == listenfd)
                    {
                        int connectfd = accept(listenfd, NULL, NULL);
                        if(-1 == connectfd)
                        {
                            perror("accept");
                            close(listenfd);
                            return 0;
                        }
                        printf("A new client(fd=%d) is connect success!\n", connectfd);
                        eventfds[connectfd - listenfd + 1].fd = connectfd;
                        eventfds[connectfd - listenfd + 1].events = POLLIN;
                    }
                    else
                    {
                        recvbytes = recv(fd, buff, sizeof(buff), 0);
                        if(recvbytes < 0)
                        {
                            perror("recv");
                            eventfds[i].events = 0;
                            eventfds[i].fd = -1;
                            close(fd);
                            break;
                        }
                        if(recvbytes == 0)
                        {
                            printf("client(fd=%d) is closed!\n", fd);
                            eventfds[i].events = 0;
                            eventfds[i].fd = -1;
                            close(fd);
                            break;
                        }
                        printf("server recv from client(fd=%d):%s", fd, buff);
                    }
                    
                }
            }
        }
    }
   
    close(listenfd);
 
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

## 运行 

```
./server 127.0.0.1 8888
./client 127.0.0.1 8888
./client 127.0.0.1 8888
```

# 个人收获

1. 技术是和语言无关的，最底层的原理，还是 c 语言更加强大。

2. 要知道原理首先知道大概的方式，然后通过阅读代码的方式，而不是直接阅读源码。

3. 这些内容在《linux 网络编程》中肯定都是有的，内容大同小异。

# 参考资料

[Linux 下的五种 IO 模型详细介绍](https://www.jb51.net/article/94783.htm)

[Linux 下 poll模型](https://blog.csdn.net/hq354974212/article/details/76208739)

[网络通信基础重难点解析 11 ：Linux poll 函数用法](https://zhuanlan.zhihu.com/p/60026631)

* any list
{:toc}


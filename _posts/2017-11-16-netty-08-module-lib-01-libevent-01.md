---
layout: post
title:  Netty-08-通讯模型框架 libevent
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: true
---

# libevent

[libevent](https://libevent.org/) – an event notification library

## 功能

libevent API提供了一种机制，用于在文件描述符上发生特定事件或达到超时后执行回调函数。

此外，libevent还支持由于信号或定期超时引起的回调。

libevent旨在替换事件驱动的网络服务器中的事件循环。应用程序只需调用event_dispatch（），然后动态添加或删除事件，而无需更改事件循环。

目前，libevent支持  /dev/poll, kqueue(2), event ports, POSIX select(2), Windows select(), poll(2), and epoll(4). 

内部事件机制完全独立于公开的事件API，而libevent的简单更新可以提供新功能，而无需重新设计应用程序。

因此，Libevent允许便携式应用程序开发，并提供操作系统上可用的最可扩展的事件通知机制。 

Libevent还可用于多线程应用程序，可以通过隔离每个event_base以便只有一个线程访问它，或者通过锁定访问单个共享event_base。 

Libevent应该在Linux，* BSD，Mac OS X，Solaris，Windows等上编译。

Libevent还为缓冲网络IO提供了一个复杂的框架，支持套接字，过滤器，速率限制，SSL，零拷贝文件传输和IOCP。 

Libevent包括对几种有用协议的支持，包括DNS，HTTP和最小的RPC框架。

有关网络服务器事件通知机制的更多信息，请参阅Dan Kegel的“The C10K问题”网页。

# 快速开始

libevent是一个开源是并且可以跨平台的库，可以去官网http://libevent.org/下载后在Linux中解压，然后通过源码安装的方式安装。

通过libevent可以轻松实现epoll的IO复用并发服务器，无需再自己定义根结点和上树删除结点的一些操作。

以下用Linux下的epoll简单服务器端的代码作为例子。

需要比较注意的是回调函数的用处。以后还会持续接触到。

## 下载

1、下载的网站在http://libevent.org

2、下载之后使用./configure --prefix=/home/用户名/lib

3、执行make

4、执行make install

然后再/usr/lib/libevent*.so 或者在/usr/lib64/libevent*.so或者在/usr/local/lib/libevent*.so可以找到这个库文件；

## libevent的构成

libevent_core:表示所有核心的事件和缓冲功能，通常包含event_base以及evbuffer、bufferevent、以及各种工具函数

libevent_pthreads:表示基于pthread可移植线程库的线程和锁，并且独立于libevent_core，这样程序使用libevent时，就不需要连接到pthread，但是使用多线程方式例外；

libevent_extra:用于定义的是特殊的协议，例如HTTP，DNS，RPC；

libevent:这个库已经不经常使用；

## 功能

Libevent的功能

1、事件通知：当文件描述符可读可写时执行回调函数；

2、IO缓存：缓存事件提供了输入输出缓存，能够自动的读入和写入，用户不必执行操作IO；

3、定时器：定时器机制，在一定时间间隔之后调用回调函数；

4、信号：触发信号，执行回调函数；

5、异步的DNS解析：异步解析DNS服务器的DNS解析函数集；

6、事件驱动的HTTP服务器：HTTP服务器；

7、RPC客户端服务器框架：RPC服务器和客户端框架，自动的封装和解封数据结构；

## 示例代码

```c
#include <stdio.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <stdlib.h>
#include <string.h>
#include <arpa/inet.h>
#include <unistd.h>
#include<event2/bufferevent.h>
#include<event2/event.h>
#include<event2/listener.h>
void read_cb(struct bufferevent* bev,void* arg)
{
	char buf[1024] = { 0 };
	bufferevent_read(bev, buf, sizeof(buf));
	printf("read recv:%s \n", buf);
	//发送
	bufferevent_write(bev, buf, strlen(buf) + 1);
}
void event_cb(struct bufferevent* bev,short events)
{
	if (events&BEV_EVENT_EOF)//按位与操作，如果为空说明客户端关闭
	{
		printf("client has been closed!\n");
	}
	else if (events&BEV_EVENT_ERROR)
	{
		printf("some error happended...\n");
	}
	bufferevent_free(bev);
}
void write_cb()
{
	printf("回送当前信息完毕\n");
}
void listen_cb(struct evconnlistener*listener,evutil_socket_t fd,
				struct sockaddr_in *server,int len,void* ptr)
{
	//得到传进来的event_base
	struct event_base* base = (struct event_base*)ptr;
	//接收和发送数据
	struct bufferevent* bev = NULL;
	bev = bufferevent_socket_new(base, fd, BEV_OPT_CLOSE_ON_FREE);

	bufferevent_setcb(bev, (bufferevent_data_cb)read_cb,
		(bufferevent_data_cb)write_cb, (bufferevent_event_cb)event_cb, NULL);
	//打开缓冲区读的回调可用
	bufferevent_enable(bev, EV_READ);

}

int main()
{
	//创建事件处理框架
	struct event_base *base = event_base_new();
    //定义客户端的信息
	struct sockaddr_in server;
	server.sin_family = AF_INET;
	server.sin_port = htons(8080);
	server.sin_addr.s_addr = htonl(INADDR_ANY);

	//一步完成套接字的创建，绑定和监听以及accept
	struct evconnlistener *listen = NULL;
	listen = evconnlistener_new_bind(base,(evconnlistener_cb)listen_cb,
		base,BEV_OPT_CLOSE_ON_FREE | LEV_OPT_REUSEABLE,
		-1, (struct sockaddr*)&server, sizeof(server)
	);

	//开始时间循环,犹豫是缓冲区事件不用event_add
	event_base_dispatch(base);

	//释放资源
	evconnlistener_free(listen);
	event_base_free(base);

	return 0;
}
```


# 个人理解

1. 不同的平台都有自己的网络通讯模型，这问题就是如果我们希望统一调用，就需要有人帮我们屏蔽底层的区别。

2. 统一的标准可以导致后期变化拓展非常的方便。

# 参考资料

[libevent 的工作模型](https://blog.csdn.net/hejinjing_tom_com/article/details/37656313)

[Linux：用libevent库创建epoll的IO复用并发服务器](http://codeleading.com/article/6461755888/)

[Linux-C-10-libevent](https://www.jianshu.com/p/64b055ce1aa8)

* any list
{:toc}


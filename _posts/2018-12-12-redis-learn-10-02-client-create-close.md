---
layout: post
title: Redis Learn-10-02-client 客户端创建和关闭
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 客户端的创建和关闭

## 创建普通客户端

通过网络连接与服务器进行连接的客户端是普通客户端，使用connect函数连接服务器的时候，服务器会调用事件处理器，为客户端创建相应的客户端状态，并将这个新的客户端状态添加到服务器状态结构clients链表的末尾。

### 例子

c1，c2正在连接服务器，c3是一个新的普通客户端，连接到服务器：

![CLIENT-CREATE](https://img-blog.csdn.net/20181004163948648?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2p1bjgxNDg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## 关闭普通客户端

### 关闭原因

普通客户端关闭的原因：

1) 客户端进程退出或被杀死，导致客户端服务器之间的网络连接关闭

2) 客户端向发送了不符合协议格式的命令请求

3) 客户端是CLIENT KILL 命令的目标

4) 用户为服务器设置了timeout选项，当客户端的空转时间超过timeout选项设置的值时，客户端将会被关闭

- 例外场景

客户端是主服务器(打开了REDIS_MASTER标志)，从服务器(打开了REDIS_SLAVE标志),正在被BLPOP等命令阻塞（打开了REDIS_BLOCKED标志）或者正在执行SUBSCRIBR、PSUBSCRIBE等订阅命令，那么即使客户端的timeout时间，客户端也不会别服务器关闭

5) 客户端发送的命令请求的代销超过了输入缓冲区的显示大小(默认1GB)

6) 命令回复超过了输出缓冲区的限制大小

注：学习输出缓冲区时，讲到了可变大小缓冲区，原则上是可以保存任意长的命令回复，但是为了避免客户端的回复过大，占用过多的服务器资源，所以服务器会在缓冲区大小超出范围之后，执行相应的限制操作：

7) 硬性限制

如果输出缓冲区超过了硬性限制，立马关闭客户端

8) 软性限制

输出缓冲区超过了软性限制，而没超过硬性限制，那么服务器将使用客户端状态结构的 obuf_soft_limit_reached_time 属性记录客户端达到软性限制的起始时间，监视客户端，如果输出缓冲区一直超过软性限制，并且持续时间超过服务器设定的时长，那么服务器将关闭客户端，

相反，在指定时间内，不再超过软性限制，那么客户单不会被关闭，并且 obuf_soft_limit_reached_time 的值会被清零。

使用 client-output-buffer-limit 选项为普通、从服务器、执行发布与订阅功能的客户单分别设置不同的软性或者硬性限制。

命令格式：`client-output-buffer-limit <class> <hard limt> <soft limit< <soft seconds>`

# Lua 脚本的伪客户端

服务器会在初始化创建负责执行Lua脚本中包含的Redis命令的伪客户端，并将这个伪客户端关联在服务器状态结构的lua_client属性中。

```c
struct redisServer{
	//...
	redisClient *lua_client;
	//...
}
```

lua_client 伪客户端会在服务器运行的整个生命周期中一直存在，当服务器关闭时，关闭。

# AOF文件的伪客户端

服务器在载入AOF文件时，会创建用于执行AOF文件包含的Redis命令的伪客户端，并在载入完成以后，关闭这个伪客户端

# 参考资料

[9.redis设计与实现学习笔记-客户端&服务器](https://blog.csdn.net/jun8148/article/details/82938503)

[《Redis设计与实现》阅读笔记8-客户端](https://blog.csdn.net/maniacxx/article/details/82747280)

* any list
{:toc}
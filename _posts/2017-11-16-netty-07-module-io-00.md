---
layout: post
title:  Netty-07-通讯模型
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: true
---

# Unix中的I/O模型

Unix定义了五种I/O模型

阻塞I/O

非阻塞I/O

I/O复用（select、poll、linux 2.6种改进的epoll）

信号驱动IO（SIGIO）

异步I/O（POSIX的aio_系列函数）

# 异步的处理

异步无非是通知系统做一件事情。然后忘掉它，自己做其他事情去了。很多时候系统做完某一件事情后需要一些后续的操作。怎么办？这时候就是告诉异步调用如何做后续处理。通常有两种方式：

将来式: 当你希望主线程发起异步调用，并轮询等待结果的时候使用将来式;

回调式: 常说的异步回调就是它。

# 常见模型

## jdk 

[BIO](https://houbb.github.io/2017/11/16/netty-07-module-bio-01)

[NIO](https://houbb.github.io/2017/11/16/netty-07-module-nio-02)

[AIO](https://houbb.github.io/2017/11/16/netty-07-module-aio-03)

## unix

select

poll

Epoll

select=>poll=>epoll=>libvent=>libuv

## windows

windows i/o completion port 

## Reactor与Proactor

两种IO多路复用方案:Reactor and Proactor。

Reactor模式是基于同步I/O的，而Proactor模式是和异步I/O相关的。

reactor：能收了你跟俺说一声。proactor: 你给我收十个字节，收好了跟俺说一声。

# 参考资料

## 经典书籍

《Unix 网络编程》

## other

[常见通讯模型](https://www.cnblogs.com/duanxz/p/5150973.html)

[java BIO/NIO/AIO 学习](https://www.cnblogs.com/diegodu/p/6823855.html)

https://www.jianshu.com/p/c5e16460047b

* any list
{:toc}


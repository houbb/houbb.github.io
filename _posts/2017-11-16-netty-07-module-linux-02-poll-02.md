---
layout: post
title:  Netty-07-linux 通讯模型之 poll
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, linux, sh]
published: true
---

# Poll

poll与select不同，通过一个pollfd数组向内核传递需要关注的事件，故没有描述符个数的限制，pollfd中的events字段和revents分别用于标示关注的事件和发生的事件，故pollfd数组只需要被初始化一次。

poll的实现机制与select类似，其对应内核中的sys_poll，只不过poll向内核传递pollfd数组，然后对pollfd中的每个描述符进行poll，相比处理fdset来说，poll效率更高。poll返回后，需要对pollfd中的每个元素检查其revents值，来得指事件是否发生。

# 参考资料

[Linux 下的五种 IO 模型详细介绍](https://www.jb51.net/article/94783.htm)

* any list
{:toc}


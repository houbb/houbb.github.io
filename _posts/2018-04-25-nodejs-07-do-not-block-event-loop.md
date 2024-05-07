---
layout: post
title:  NodeJs-07 Do Not Block Event Loop
date:  2018-05-02 20:35:38 +0800
categories: [NodeJs]
tags: [js, nodejs, nodejs-learn, js-learn]
published: true
---

# TL; DR

Node.js在事件循环(初始化和回调)中运行JavaScript代码，并提供一个工作池来处理像文件I/O这样的昂贵任务。
节点伸缩性好，有时比像Apache这样的重量级方法要好。
Node的可伸缩性的秘密在于它使用少量的线程来处理许多客户机。
如果Node可以使用更少的线程，那么它可以花费更多的系统时间和内存来处理客户机，而不是为线程(内存、上下文切换)支付空间和时间开销。
但是因为Node只有几个线程，所以您必须组织应用程序来明智地使用它们。

这里有一个很好的经验法则，可以让您的节点服务器速度更快:节点在任何给定时间与每个客户机相关联的工作是“小”的。

这适用于事件循环的回调和工作池中的任务。

# 为什么要避免阻塞 Event Loop 和 Worker Pool？

节点使用少量线程来处理许多客户机。在节点中有两种类型的线程:一个事件循环(即主循环、主线程、事件线程等)，以及一个工作池中的k个工作人员池(即threadpool)。

如果线程花了很长时间来执行回调(事件循环)或任务(Worker)，我们称之为“阻塞”。
当一个线程被阻塞为一个客户端工作时，它不能处理来自任何其他客户端的请求。这提供了两个阻止事件循环和工作池的动机:

## 性能

如果您经常在任何类型的线程上执行重量级活动，您的服务器的吞吐量(请求/秒)将受到影响。

## 安全性

如果您的某个线程可能会阻塞某个输入，那么恶意客户端可能会提交这个“恶意输入”，使您的线程阻塞，并阻止它们处理其他客户端。这将是对服务攻击的拒绝。

# Node 快速回顾

Node使用事件驱动的体系结构:它有一个用于编排的事件循环和一个用于昂贵任务的工作池。

## Event Loop 运行什么代码？

当它们开始时，节点应用程序首先完成一个初始化阶段，require'ing  模块和为事件注册回调。
然后，节点应用程序进入事件循环，通过执行适当的回调来响应传入的客户机请求。
此回调将同步执行，并可能在完成后注册异步请求以继续处理。这些异步请求的回调也将在事件循环中执行。

事件循环还将实现其回调(例如，网络I/O)所生成的非阻塞异步请求。

总之，事件循环执行为事件注册的JavaScript回调，并负责实现非阻塞异步请求，如网络I/O。

## Worker Pool 运行什么代码？

Node的工作池是在 [libuv](http://docs.libuv.org/en/v1.x/threadpool.html) 中实现的，它公开了一个通用的任务提交API。

节点使用工作池来处理“昂贵”的任务。这包括操作系统不提供非阻塞版本的I/O，以及特别cpu密集型任务。

这些是使用这个工作池的节点模块api:

## I/O-intensive

[DNS](https://nodejs.org/api/dns.html): dns.lookup(), dns.lookupService().
[File System](https://nodejs.org/api/fs.html#fs_threadpool_usage): All file system APIs except fs.FSWatcher() and those that are explicitly synchronous use libuv's threadpool.

## CPU-intensive
[Crypto](https://nodejs.org/api/crypto.html): crypto.pbkdf2(), crypto.randomBytes(), crypto.randomFill().
[Zlib](https://nodejs.org/api/zlib.html#zlib_threadpool_usage): All zlib APIs except those that are explicitly synchronous use libuv's threadpool.

在许多节点应用程序中，这些api是工作池任务的唯一来源。使用c++附加组件的应用程序和模块可以向工作池提交其他任务。

为了完整性起见，我们注意到，当您从事件循环的回调中调用其中一个API时，事件循环会支付一些较小的设置成本，
因为它将进入该API的节点c++绑定，并将任务提交给工作池。
与任务的总成本相比，这些成本可以忽略不计，这就是为什么事件循环将其卸载的原因。
当将其中一个任务提交给工作池时，节点提供了指向节点c++绑定中相应的c++函数的指针。

## Node 如何决定接下来要运行什么代码?

抽象地，事件循环和工作池分别维护等待事件和挂起任务的队列。

实际上，事件循环实际上并没有维护一个队列。相反，它有一个文件描述符集合，它要求操作系统监视，
使用像epoll (Linux)、kqueue (OSX)、事件端口(Solaris)或IOCP.aspx (Windows)这样的机制。
这些文件描述符对应于网络套接字、它正在监视的任何文件等等。当操作系统说其中一个文件描述符已经准备好时，
事件循环将它转换为适当的事件并调用与该事件关联的回调。你可以在这里学到更多关于这个过程的知识。

相反，Worker池使用一个真正的队列，其条目是要处理的任务。
一个工作人员从这个队列中弹出一个任务并在其上工作，当完成这个任务时，该工作人员会为事件循环增加一个“至少一个任务完成”事件。

## 这对应用程序设计意味着什么?

在像Apache这样的每个客户端系统中，每个挂起的客户机都分配了自己的线程。
如果一个线程处理一个客户端块，操作系统将会中断它并给另一个客户端一个回合。
因此，操作系统可以确保那些需要少量工作的客户不会受到需要更多工作的客户的惩罚。

因为节点处理许多线程的客户机，如果线程块处理一个客户机的请求，那么在线程完成回调或任务之前，挂起的客户机请求可能不会得到一个转换。
因此，对客户的公平对待是您的应用程序的责任。这意味着在任何一个回调或任务中，您都不应该为任何客户机做太多的工作。

这是Node能够很好地伸缩的部分原因，但它也意味着您负责确保公平的调度。下一节将讨论如何确保事件循环和工作池的公平调度。

TODO...

[don-t-block-the-event-loop](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/#don-t-block-the-event-loop)

* any list
{:toc}
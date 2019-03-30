---
layout: post
title:  Netty-03-基础组件之 Channel
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# Channel

## 官方简介

网络套接字或能够执行I/O操作（如读取，写入，连接和绑定）的组件的连接。

Channel 为用户提供：

- 通道的当前状态（例如它是否打开？是否已连接？），

- 通道的配置参数（例如接收缓冲区大小），

- 通道支持的I/O操作（例如，读，写，连接和绑定），以及

- ChannelPipeline，用于处理与通道关联的所有I/O事件和请求。

## 所有 I/O 操作都是异步的。

Netty中的所有I/O操作都是异步的。

这意味着任何I/O调用都将立即返回，并且不保证在调用结束时所请求的I/O操作已完成。相反，您将返回一个ChannelFuture实例，该实例将在请求的I/O操作成功，失败或取消时通知您。

## 渠道是分层的

一个频道可以拥有一个父母，具体取决于它的创建方式。

例如，ServerSocketChannel接受的SocketChannel将返回ServerSocketChannel作为parent()的父级。

层次结构的语义取决于Channel所属的传输实现。例如，您可以编写一个新的Channel实现，创建共享一个套接字连接的子通道，如BEEP和SSH那样。

## 向下转发以访问特定于传输的操作

某些传输会暴露特定于传输的其他操作。将Channel向下转换为子类型以调用此类操作。

例如，使用旧的I/O数据报传输，由DatagramChannel提供多播加 `join/leave` 开操作。


# Channel 工作原理

## 生命周期

Interface Channel定义了一组和ChannelInboundHandler API密切相关的简单但功能强大的状态模型，其Channel主要有4个状态。

| 状态    | 描述 |
|:---|:---|
| ChannelUnregistered | Channel 已经被创建，但还未注册到EventLoop |
| ChannelRegistered   | Channel 已经被注册到了EventLoop |
| ChannelActive       | Channel 处于活动状态（已经连接到它的远程节点）。它现在可以接收和发送数据了 |
| ChannelInactive     | Channel 没有连接到远程节点 |

当这些状态发生改变时，将会生成对应的事件。这些事件将会被转发给ChannelPipeline中的ChannelHandler，其可以随后对它们做出响应。 

## 工作原理

![工作原理](https://images2015.cnblogs.com/blog/562880/201612/562880-20161217183926073-1296213324.png)

如上图所示：

一旦用户端连接成功，将新建一个channel同该用户端进行绑定。

channel从EventLoopGroup获得一个EventLoop，并注册到该EventLoop，channel生命周期内都和该EventLoop在一起（注册时获得selectionKey）

channel同用户端进行网络连接、关闭和读写，生成相对应的event（改变selectinKey信息），触发eventloop调度线程进行执行。

如果是读事件，执行线程调度pipeline来处理用户业务逻辑。

## 状态转换

![状态转换](https://images2015.cnblogs.com/blog/562880/201612/562880-20161217183934511-1443751012.png)

如上图所示，Channel包含注册、活跃、非活跃和非注册状态。

在一般情况下是从注册->活跃->非活跃->非注册。

但用户可以从eventloop取消和重注册channel，因此在此情况下活跃->非注册->注册

## 线程

多个channel可以注册到一个eventloop上，所有的操作都是顺序执行的，eventloop会依据channel的事件调用channel的方法进行相关操作，每个channel的操作和处理在eventloop中都是顺序的，

如下图：

![channel-thread](https://images2015.cnblogs.com/blog/562880/201612/562880-20161217183947089-1267174525.png)

# ChannelPipeline 和 ChannelHandler

ChannelPipeline 和 ChannelHandler用于channel事件的拦截和处理，Netty使用类似责任链的模式来设计ChannelPipeline和ChannelHandler

ChannelPipeline相当于ChannelHandler的容器，channel事件消息在ChannelPipeline中流动和传播，相应的事件能够被ChannelHandler拦截处理、传递、忽略或者终止。

如下图所示：

![ChannelPipeline](https://images2015.cnblogs.com/blog/562880/201612/562880-20161217184010136-11231381.png)

## INBOUD和OUTBOUND事件

inbound:当发生某个I/O操作时由IO线程流向用户业务处理线程的事件，如链路建立、链路关闭或者读完成等

outbound:由用户线程或者代码发起的IO操作事件

## ChannelHandlerContext

每个 ChannelHandler 被添加到ChannelPipeline 后，都会创建一个ChannelHandlerContext 并与之创建的ChannelHandler 关联绑定。

如下图：

![ChannelHandlerContext](https://images2015.cnblogs.com/blog/562880/201612/562880-20161217184022042-891019600.png)

ChannelHandler通过ChannelHandlerContext来操作channel和channelpipeline

## ChannelHandler

ChannelHandler负责I/O事件或者I/O操作进行拦截和处理，用户可以通过ChannelHandlerAdapter来选择性的实现自己感兴趣的事件拦截和处理。

由于Channel只负责实际的I/O操作，因此数据的编解码和实际处理都需要通过ChannelHandler进行处理。

## 注意

ChannelPipeline是线程安全的，多个业务线程可以并发的操作ChannelPipeline；ChannelHandler不是线程安全的，用户需要自己保重ChannelHandler的线程安全

# ChannelFuture与ChannelPromise

在Netty中，所有的I/O操作都是异步的，因此调用一个I/O操作后，将继续当前线程的执行，但I/O操作的结果怎么获得？

ChannelFuture。

![ChannelFuture](https://images2015.cnblogs.com/blog/562880/201612/562880-20161217184036042-1281887530.png)

如上图，当前线程A异步发起I/O操作后，不阻塞继续执行相关操作，当IO线程B完成后，通过回调执行A设置的回调方法。

回调方法通过监听的形式实现:ChannelFutureListener。

ChannelPromise是ChannelFuture的扩展，允许设置I/O操作的结果，使ChannelFutureListener可以执行相关操作

# 参考资料

- Netty

[Channel](https://netty.io/4.0/api/io/netty/channel/Channel.html)

- 使用 

[Netty学习四:Channel](https://www.cnblogs.com/TomSnail/p/6192885.html)

[Netty框架学习之路（四）—— Channel及相关概念](https://blog.csdn.net/tjreal/article/details/79661706)

[Netty之Channel*](http://www.cnblogs.com/krcys/p/9297092.html)

[Netty学习（一）：Netty基本组件](https://blog.csdn.net/qingzhou4122/article/details/81142206)

- 源码

[Netty 权威指南笔记（六）：Channel 解读](https://blog.csdn.net/hustspy1990/article/details/78454644)

[Netty中Channel与Unsafe源码解读](https://www.jianshu.com/p/4cbbf261bd0f)

* any list
{:toc}


---
layout: post
title:  Netty-10-ChannelHandler API
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, api, sh]
published: false
---


# 学习方式

1. 官方文档

2. 《Netty in Action》

3. blogs

4. 源码

# Channel 生命周期

channel 有以下四种生命状态。

```
状态	            描述
ChannelUnregistered	Channel已经被创建，但未注册到EventLoop
ChannelRegistered	Channel已经被注册到了EventLoop
ChannelActive	    Channel处于活动状态(已经连接到它的远程节点)。现在Channel可以接受和发送数据
ChannelInActive	    Channel没有连接到远程节点
```

一般Channel的生命周期顺序 ChannelRegistered -> ChannelActive -> ChannelInactive -> ChannelUnregistered。

当Channel的状态发生变化时，将会生成对应的事件。

与此同时，这些事件会被转发给ChannelPipeline中的ChannelHandler。

# ChannelHandler 生命周期

ChannelHandler定义的生命周期操作，在ChannelHandler被添加到ChannelPipeline中或者被从ChannelPipeline中移除时会调用这些方法。

这些方法中都可以接受一个ChannelHandlerContext参数。


```
类型	         描述
handlerAdded	当把ChannelHandler添加到ChannelPipeline中时被调用
handlerRemoved	当从ChannelHandler在ChannelPipeline移除时调用
exceptionCaught	当处理过程中在ChannelPipeline中有错误产生时被调用
```

Netty中定义了下面两个重要的ChannelHandler接口：

ChannelInboundHandler——处理入站数据以及各种状态变化

CHannelOutboundHandler——处理出站数据并且允许拦截所有的操作

# ChanneInboundHandler接口

```
类型	描述
channelRegistered	当Channel已经注册到它的EventLoop并且能够处理I/O时被调用
channelUnregistered	当Channel从它的EventLoop注销并且无法处理任何I/O时被调用
channelActive	    当Channel处于活动状态时被调用；Channel已经连接/绑定并且已经就绪
channelInactive	    当Channel离开活动状态并且不再连接它的远程节点时被调用
channelReadComplete	当Channel的一个读操作完成时被调用
channelRead	        当从Channel读取数据时被调用
channelWritabilityChanged	当Channel的可写状态发生改变时被调用。用户可以确保写操作不会完成的太快(以避免发生OutOfMemoryError)或者可以在Channel变为再次可写时恢复写入。Channel的isWriteable()方法可以来检测Channel的可写性。与可写性相关的阀值可以通过Channel.config().setWriteHighWaterMark()和Channel.config().setWriteLowWaterMark()方法来设置
userEventTriggered	当ChannelInboundHandler.fireUserEventTriggered()方法被调用时被调用。
```

- 释放消息资源

当某个ChannelInboundHandler 的实现重写channelRead()方法时，它将负责显式地释放与池化的ByteBuf 实例相关的内存。

Netty 为此提供了一个实用方法 ReferenceCountUtil.release()，如代码清单6-1 所示。

```java
@Sharable
public class DiscardHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        ReferenceCountUtil.release(msg);
    }
}
```

Netty 将使用WARN 级别的日志消息记录未释放的资源，使得可以非常简单地在代码中发现违规的实例。

但是以这种方式管理资源可能很繁琐。一个更加简单的方式是使用 SimpleChannelInboundHandler。

代码清单6-2 是代码清单6-1 的一个变体，说明了这一点。

- SimpleChannelInboundHandler 方式

```java
public class SimpleDiscardHandler   extends SimpleChannelInboundHandler<Object> {
    @Override
    public void channelRead0(ChannelHandlerContext ctx,Object msg) {
        // No need to do anything special
    }
}
```

由于SimpleChannelInboundHandler 会自动释放资源，所以你不应该存储指向任何消息的引用供将来使用，因为这些引用都将会失效。

ps: netty 在设计的时候就尽可能的考虑使用者的便利性，这是一个优秀的框架所必备的设计思想。

# ChannelOutboundHandler 接口

出站操作和数据将由ChannelOutboundHandler处理。

它的方法将被Channel、ChannelPipeline以及ChannelHandlerContext调用。

ChannelOutboundHandler 可以按需推迟操作或者事件。

```
类型	描述
bind(ChannelHandlerContext, SockertAddress, ChannelPromise)	                    当请求将Channel绑定到本地地址时被调用
connect(ChannelHandlerContext, SocketAddress, SockertAddress, ChannelPromise)	当请求将Channel连接到远程节点时被调用
disconnect(ChannelHandlerContext, ChannelPromise)	                            当请求将Channel从远程节点断开时被调用
close(ChannelHandlerContext, ChannelPromise)	                                当请求关闭Channel时被调用
deregister(ChannelHandlerContext, ChannelPromise)	                            当请求将Channel丛它的EventLoop注销时被调用
read(ChannelHandlerContext)	                                                    当请求从Channel读取更多的数据时被调用
flush(ChannelHandlerContext)	                                                当请求通过Channel将入队数据冲刷到远程节点时被调用
write(ChannelHandlerContext, Object, ChannelPromise)	                        当请求通过Channel将数据写到远程节点时被调用
```

## ChannelPromise & ChannelFuture

ChannelPromise与ChannelFuture ChannelOutboundHandler中的大部分方法都需要一个ChannelPromise参数，以便在操作完成时得到通知。

ChannelPromise是ChannelFuture的一个子类，其定义了一些可写的方法，如setSuccess()和setFailure()，从而使ChannelFuture不可变。

这里借鉴的是 Scala 的 Promise 和 Future 的设计，当一个 Promise 被完成之后，其对应的 Future 的值便不能再进行任何修改了

ps: 思想是相同的。比如 node.js 的回调，js 的 promise 回调模式。

## ChannelInboundHandler和ChannelOutboundHandler的区别

个人感觉in和out的区别主要在于ChannelInboundHandler的channelRead和channelReadComplete回调和ChannelOutboundHandler的write和flush回调上，

ChannelOutboundHandler的channelRead回调负责执行入栈数据的decode逻辑，ChannelOutboundHandler的write负责执行出站数据的encode工作。

其他回调方法和具体触发逻辑有关，和in与out无关。

# ChannelHandler 适配器

ChannelInboundHandlerAdapter和ChannelOutboundHandlerAdapter两个适配器分别提供了ChannelInboundHandler和ChannelOutboundHandler的基本实现。

通过扩展抽象类ChannelHandlerAdapter，它们获得了它们共同的超接口ChannelHandler的方法。

ChannelHandlerAdapter提供了isSharable()，如果其对应的实现被注解标注为Sharable，这方法将返回true，表示它可以被添加到多个ChannelPipeline。

ChannelInboundHandlerAdapter和ChannelOutboundHandlerAdapter中的方法体调用了其相关联的ChannelHandlerContext上的等效方法，从而将事件转发到了ChannelPipeline中的下一个ChannelHandler中。

# 个人总结

《netty in action》是一个系统的讲解 netty 的书籍，但是说实话不适合入门学习。

比较适合在会使用 netty 之后，然后回过头来阅读，加深对 netty 的理解。

因为这种书籍不是从一个个示例开始的，而是从一大堆 api 和概念开始的。

# 参考资料

- channel handler

[Netty-ChannelHandler-ChannelPipeline](https://yq.aliyun.com/articles/669726)

[Netty学习笔记之ChannelHandler](https://www.jianshu.com/p/96a50869b527)

* any list
{:toc}
---
layout: post
title:  Netty-10-ChannelPipeline API
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, api, sh]
published: true
---

# ChannelPipeline 接口

每一个新创建的Channel都将会被分配一个新的ChannelPipeline。这项关联是永久性的；Channel既不能附加另外一个ChannelPipeline，也不能分离当前的。

根据事件的起源，事件将会被ChannelInboundHandler或者ChannelOutboundHandler处理。随后，会调用ChannelHandlerContext实现，它将被转发给同一超类型的下一个ChannelHandler。

在ChannelPipeline传播事件时，它会测试ChannelPipeline中的下一个ChannelHandler的类型是否和事件的运动方向相匹配。

如果不匹配，ChannelPipeline将跳过该ChannelHandler并前进到下一个，直到它找到和该事件所期望的方向相匹配的为止。

（ChannelHandler可以同时实现ChannelInboundHandler和ChannelOutboundHandler接口）

## ChannelHandlerContext

ChannelHandlerContext使得ChannelHandler能够和它的ChannelPipeline以及其他的ChannelHandler 交互。

ChannelHandler 可以通知其所属的 ChannelPipeline 中的下一个 ChannelHandler，甚至可以动态修改它所属的ChannelPipeline。

ChannelHandlerContext 具有丰富的用于处理事件和执行I/O 操作的API。

## ChannelPipeline 相对论

你可能会说，从事件途经ChannelPipeline 的角度来看，ChannelPipeline 的头部和尾端取决于该事件是入站的还是出站的。

然而Netty 总是将ChannelPipeline 的入站口（图6-3 中的左侧）作为头部，而将出站口（该图的右侧）作为尾端。

当你完成了通过调用ChannelPipeline.add*()方法将入站处理器（ChannelInboundHandler）和出站处理器（ ChannelOutboundHandler ） 混合添加到ChannelPipeline 之后， 每一个ChannelHandler 从头部到尾端的顺序位置正如同我们方才所定义它们的一样。

因此，如果你将图6-3 中的处理器（ChannelHandler）从左到右进行编号，那么第一个被入站事件看到的ChannelHandler 将是1，而第一个被出站事件看到的ChannelHandler 将是5。

# 修改ChannelPipeline

ChannelHandler 可以通过添加、删除或者替换其他的 ChannelHandler 来实时地修改 ChannelPipeline 的布局。

（它也可以将它自己从ChannelPipeline 中移除。）这是ChannelHandler 最重要的能力之一，所以我们将仔细地来看看它是如何做到的。

表6-6 列出了相关的方法。

```
名称	描述
addFirst(),addBefore(),addAfter(),addLast()	将一个ChannelHandler添加到ChannelPipeline
remove()	将一个ChannelHandler从ChannelPipeline中移除
replace()	将ChannelPipeline中的一个ChannelHandler替换为另一个ChannelHandler
get()		通过类型或者名称返回ChannelHandler
context()	返回和ChannelHandler绑定的ChannelHandlerContext
names()		返回ChannelPipeline中所有的ChannelHandle的名称
```

# 触发事件

ChannelPipeline 的API 公开了用于调用入站和出站操作的附加方法。

## 入站操作

表 6-8 列出了入站操作，用于通知 ChannelInboundHandler 在 ChannelPipeline 中所发生的事件。

```
名称					 描述
fireChannelRegistered	调用ChannelPipeline中下一个ChannelInboundHandler的channelRegistered(ChannelHandlerContext)方法
fireChannelUnregistered	调用ChannelPipeline中下一个ChannelInboundHandler的channelUnregistered(ChannelHandlerContext)方法
fireChannelActive		调用ChannelPipeline中下一个ChannelInboundHandler的channelActive(ChannelHandlerContext)
fireChannelInActive		调用ChannelPipeline中下一个ChannelInboundHandler的channelInactive(ChannelHandlerContext)方法
fireExceptionCaught		调用ChannelPipeline中下一个ChannelInboundHandler的exceptionCaught(ChannelHandlertext, Throwable)方法
fireUserEventTriggerd	调用ChannelPipeline中下一个ChannelInboundHandler的userEventTriggered(ChannelHandlertext, Object)方法
fireChannelRead			调用ChannelPipeline中下一个ChannelInboundHandler的channelRead(ChannelHandlertext, Object msg)方法
fireChannelReadComplete	调用ChannelPipeline中下一个ChannelInboundHandler的channelReadComplete(ChannelHandlertext)方法
fireChannelWritabilityChanged	调用ChannelPipeline中下一个ChannelInboundHandler的channelWritabilityChanged(ChannelHandlertext)方法
```


## 出站操作

在出站这边，处理事件将会导致底层的套接字上发生一系列的动作。

表6-9 列出了ChannelPipeline API 的出站操作。

```
名称	描述
bind	将Channel绑定到一个本地地址，将调用ChannelPipeline中的下一个ChannelOutboundHandler的bind(ChannelHandlerContext,Socket,ChannelPromise)方法
connect	将Channel连接到一个远程地址，这将调用ChannelPipeline中的下一个ChannelOutboundHandler的connect(ChannelHandlerContext,Socket,ChannelPromise)方法
disconnect	将Channel断开连接。这将调用ChannelPipeline中的下一个ChannelOutboundHandler的disconnect(ChannelHandlerContext,Socket,ChannelPromise)方法
close	将Channel关闭。这将调用ChannelPipeline中的下一个ChannelOutboundHandler的close(ChannelHandlerContext,ChannelPromise)方法
deregister	将Channel从它先前分配的EventExecutor(即EventLoop)中注销，这将调用ChannelPipeline中的下一个ChannelOutboundHandler的deregister(ChannelHandlerContext,ChannelPromise)方法
flush	冲刷Channel所有挂起的写入。这将调用ChannelPipeline中的下一个ChannelOutboundHandler的flush(ChannelHandlerContext)方法
write	将消息写入Channel。这将调用ChannelPipeline中的下一个ChannelOutboundHandler的write(ChannelContext,Object msg,ChannelPromise)方法。这并不会将消息写入底层的Socket，而只会将它放入到队列中。要将它写入到Socket，需要调用flush或者writeAndFlush方法
writeAndFlush	先调用write再调用flush的便利方法
read	请求从Channel中读取更多的数据。这将调用ChannelPipeline中的下一个ChannelOutboundHandler的read(ChannelHandlerContext)方法
```

## 总结

ChannelPipeline保存了与Channel相关联的ChannelHandler

ChannelPipeline可以根据需要，通过添加或者删除ChannelHandler来动态修改

ChannelPipeline有着丰富的API调用，以响应入站和出站事件

# 个人收获

1. 为每一张图，没一个代码片段，每一个表格添加标号是一种非常不错的方式。特别是在写书籍的时候。




# 参考资料

《Netty in Action》 P99

- free

[Netty ByteBuf 释放注意事项](https://blog.csdn.net/u012807459/article/details/77259869)

* any list
{:toc}



---
layout: post
title:  Netty-12-Boostrap 客户端
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# 引导客户端和无连接协议

Bootstrap 类被用于客户端或者使用了无连接协议的应用程序中。

表8-1 提供了该类的一个概览，其中许多方法都继承自AbstractBootstrap 类。

## 方法概览

```
Bootstrap group(EventLoopGroup)     设置用于处理Channel 所有事件的EventLoopGroup
Bootstrap channel(Class<? extends C>)/Bootstrap channelFactory(ChannelFactory<? extends C>) channel()方法指定了Channel的实现类。如果该实现类没提供默认的构造函数，可以通过调用channelFactory()方法来指定一个工厂类，它将会被bind()方法调用
Bootstrap localAddress(SocketAddress)   指定Channel 应该绑定到的本地地址。如果没有指定，则将由操作系统创建一个随机的地址。或者，也可以通过
bind()或者connect()方法指定localAddress
<T> Bootstrap option(ChannelOption<T> option,T value)   设置ChannelOption，其将被应用到每个新创建的Channel 的ChannelConfig。这些选项将会通过
bind()或者connect()方法设置到Channel，不管哪个先被调用。这个方法在Channel 已经被创建后再调用将不会有任何的效果。支持的ChannelOption 取决于使用的Channel 类型。参见8.6 节以及ChannelConfig 的API 文档，了解所使用的Channel 类型
<T> Bootstrap attr(Attribute<T> key, T value)   指定新创建的Channel 的属性值。这些属性值是通过bind()或者connect()方法设置到Channel 的，具体
取决于谁最先被调用。这个方法在Channel 被创建后将不会有任何的效果。参见8.6 节
Bootstraphandler(ChannelHandler)    设置将被添加到ChannelPipeline 以接收事件通知的
ChannelHandlerBootstrap clone()     创建一个当前Bootstrap 的克隆，其具有和原始的Bootstrap 相同的设置信息
Bootstrap remoteAddress(SocketAddress)  设置远程地址。或者，也可以通过connect()方法来指定它
ChannelFuture connect()     连接到远程节点并返回一个ChannelFuture，其将会在连接操作完成后接收到通知
ChannelFuture bind()    绑定Channel 并返回一个ChannelFuture，其将会在绑定操作完成后接收到通知，在那之后必须调用Channel.connect()方法来建立连接
```

下一节将一步一步地讲解客户端的引导过程。我们也将讨论在选择可用的组件实现时保持兼容性的问题。

# 引导客户端

Bootstrap 类负责为客户端和使用无连接协议的应用程序创建Channel，如图8-2 所示。

Bootstrap 方法在 bind() 调用之后，创建新的 channel。在调用 connect() 之后，也创建新的 channel。

## 示例

- 8.1 引导一个客户端







# 参考资料

《Netty in Action》 P113

* any list
{:toc}
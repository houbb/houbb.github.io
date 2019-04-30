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

```java
package com.github.houbb.netty.inaction.bootstrap;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;

import java.net.InetSocketAddress;

/**
 * @author binbin.hou
 * @date 2019/4/30
 * @since 1.0.0
 */
public class BoostrapDemo {

    public static void main(String[] args) {
        // 创建一个引导
        Bootstrap bootstrap = new Bootstrap();
        // 新建一个 group
        EventLoopGroup eventExecutors = new NioEventLoopGroup();

        bootstrap.group(eventExecutors)
        //指定 channel 类实现
        .channel(NioSocketChannel.class)
        //指定 channelHandler
        .handler(new SimpleChannelInboundHandler<ByteBuf>() {
            @Override
            protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
                System.out.println("Received data...");
            }
        });

        //连接到远程，并返回 future
        ChannelFuture channelFuture = bootstrap
                .connect(new InetSocketAddress("www.manning.com", 80));
        // 添加 future 的listener
        channelFuture.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture future) throws Exception {
                if(future.isSuccess()) {
                    System.out.println("channelFuture success");
                } else {
                    System.out.println("channelFuture fail");
                    future.cause().printStackTrace();
                }
            }
        });
    }
}
```

直接运行，日志如下：

```
channelFuture success
```

# Channel 和 EventLoopGroup 的兼容性

代码清单8-2 所示的目录清单来自io.netty.channel 包。

你可以从包名以及与其相对应的类名的前缀看到，对于NIO 以及OIO 传输两者来说，都有相关的EventLoopGroup 和Channel 实现。

- 代码清单

```
channel
├───nio
│ NioEventLoopGroup
├───oio
│ OioEventLoopGroup
└───socket
    ├───nio
    │ NioDatagramChannel
    │ NioServerSocketChannel
    │ NioSocketChannel
    └───oio
    │ OioDatagramChannel 
    │ OioServerSocketChannel
    │ OioSocketChannel
```

必须保持这种兼容性，不能混用具有不同前缀的组件，如NioEventLoopGroup 和OioSocketChannel。

## 不匹配的例子

代码清单8-3 展示了试图这样做的一个例子。

```java
package com.github.houbb.netty.inaction.bootstrap;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.oio.OioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;

import java.net.InetSocketAddress;

/**
 * @author binbin.hou
 * @date 2019/4/30
 * @since 1.0.0
 */
public class DismatchBoostrapDemo {

    public static void main(String[] args) {
        // 创建一个引导
        Bootstrap bootstrap = new Bootstrap();
        // 新建一个 group
        EventLoopGroup eventExecutors = new OioEventLoopGroup();

        bootstrap.group(eventExecutors)
        //指定 channel 类实现
        .channel(NioSocketChannel.class)
        //指定 channelHandler
        .handler(new SimpleChannelInboundHandler<ByteBuf>() {
            @Override
            protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
                System.out.println("Received data...");
            }
        });

        //连接到远程，并返回 future
        ChannelFuture channelFuture = bootstrap
                .connect(new InetSocketAddress("www.manning.com", 80));
        // 添加 future 的listener
        channelFuture.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture future) throws Exception {
                if(future.isSuccess()) {
                    System.out.println("channelFuture success");
                } else {
                    System.out.println("channelFuture fail");
                    future.cause().printStackTrace();
                }
            }
        });
    }
}
```

运行的话就会报错

```
channelFuture fail
java.lang.IllegalStateException: incompatible event loop type: io.netty.channel.ThreadPerChannelEventLoop
	at io.netty.channel.AbstractChannel$AbstractUnsafe.register(AbstractChannel.java:469)
	at io.netty.channel.SingleThreadEventLoop.register(SingleThreadEventLoop.java:80)
	at io.netty.channel.ThreadPerChannelEventLoop.register(ThreadPerChannelEventLoop.java:35)
	at io.netty.channel.ThreadPerChannelEventLoopGroup.register(ThreadPerChannelEventLoopGroup.java:279)
	at io.netty.bootstrap.AbstractBootstrap.initAndRegister(AbstractBootstrap.java:331)
	at io.netty.bootstrap.Bootstrap.doResolveAndConnect(Bootstrap.java:163)
	at io.netty.bootstrap.Bootstrap.connect(Bootstrap.java:145)
	at com.github.houbb.netty.inaction.bootstrap.DismatchBoostrapDemo.main(DismatchBoostrapDemo.java:38)
```

## 关于IllegalStateException 的更多讨论

在引导的过程中，在调用bind()或者connect()方法之前，必须调用以下方法来设置所需的组件：

1. group()；

2. channel()或者channelFactory()；

3. handler()。

如果不这样做，则将会导致IllegalStateException。对handler()方法的调用尤其重要，因为它需要配置好ChannelPipeline。

## 思考

既然不能出现这种混乱的 EventLoopGroup 和 Channel 得匹配关系，那么是否应该把这种细节隐藏？

还是说 channel 是不确定的，所以无法确定 group？

那么能不能根据 channel 来确定 EventLoopGroup？

# 参考资料

《Netty in Action》 P113

* any list
{:toc}
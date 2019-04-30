---
layout: post
title:  Netty-12-ChannelInitializer 引导添加多个 handler 
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# 场景

在所有我们展示过的代码示例中，我们都在引导的过程中调用了handler()或者childHandler()方法来添加单个的ChannelHandler。

这对于简单的应用程序来说可能已经足够了，但是它不能满足更加复杂的需求。

例如，一个必须要支持多种协议的应用程序将会有很多的ChannelHandler，而不会是一个庞大而又笨重的类。

正如你经常所看到的一样，你可以根据需要，通过在ChannelPipeline 中将它们链接在一起来部署尽可能多的ChannelHandler。

但是，如果在引导的过程中你只能设置一个ChannelHandler，

那么你应该怎么做到这一点呢？

## ChannelInboundHandlerAdapter

正是针对于这个用例，Netty 提供了一个特殊的 ChannelInboundHandlerAdapter 子类：

```java
public abstract class ChannelInitializer<C extends Channel> extends ChannelInboundHandlerAdapter
```

它定义了下面的方法：

```java
protected abstract void initChannel(C ch) throws Exception;
```

这个方法提供了一种将多个ChannelHandler 添加到一个ChannelPipeline 中的简便方法。

你只需要简单地向Bootstrap 或ServerBootstrap 的实例提供你的ChannelInitializer 实现即可，并且一旦Channel 被注册到了它的EventLoop 之后，就会调用你的
initChannel()版本。

在该方法返回之后，ChannelInitializer 的实例将会从Channel-Pipeline 中移除它自己。

## 代码示例

代码清单8-6 定义了ChannelInitializerImpl 类， 并通过ServerBootstrap 的 childHandler()方法注册它。

你可以看到，这个看似复杂的操作实际上是相当简单直接的。

```java
package com.github.houbb.netty.inaction.bootstrap;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

/**
 * @author binbin.hou
 * @date 2019/4/30
 * @since 1.0.0
 */
public class ChannelInit {

    public static void main(String[] args) throws InterruptedException {
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        EventLoopGroup eventExecutors = new NioEventLoopGroup();

        serverBootstrap.group(eventExecutors)
                .channel(NioServerSocketChannel.class)
                .childHandler(new ChannelInitializer<Channel>() {
                    @Override
                    protected void initChannel(Channel ch) throws Exception {
                        ChannelPipeline channelPipeline = ch.pipeline();
                        channelPipeline.addLast(new SimpleChannelInboundHandler<ByteBuf>() {
                            @Override
                            protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
                                System.out.println("hello init~");
                            }
                        });
                    }
                });

        ChannelFuture channelFuture = serverBootstrap.bind("127.0.0.1", 8080)
                .sync();    //同步等待，直到连接完成

        System.out.println("Server start listen at " + 8080);
        channelFuture.channel().closeFuture().sync();
        System.out.println("执行到这里 " + 8080);
    }
}
```

如果你的应用程序使用了多个 ChannelHandler，请定义你自己的 ChannelInitializer 实现来将它们安装到 ChannelPipeline 中。

# 收获

1. 在框架设计的时候要考虑足够的灵活性。保证别人在使用的时候不会感觉这个框架很多地方的设计都不完善。

2. 灵活源于接口。

# 参考资料

《Netty in Action》 P128

* any list
{:toc}
---
layout: post
title:  Netty-12-ServerBoostrap 服务端
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# 引导服务器

我们将从ServerBootstrap API 的概要视图开始我们对服务器引导过程的概述。

然后，我们将会探讨引导服务器过程中所涉及的几个步骤，以及几个相关的主题，包含从一个ServerChannel 的子Channel 中引导一个客户端这样的特殊情况。

## ServerBoostrap 类

```
名 称   描 述
group       设置ServerBootstrap 要用的EventLoopGroup。这个EventLoopGroup将用于ServerChannel 和被接受的子Channel 的I/O 处理
channel     设置将要被实例化的ServerChannel 类
channelFactory 如果不能通过默认的构造函数①创建Channel，那么可以提供一个ChannelFactory
localAddress 指定ServerChannel 应该绑定到的本地地址。如果没有指定，则将由操作系统使用一个随机地址。或者，可以通过bind()方法来指定该localAddress
option      指定要应用到新创建的ServerChannel 的ChannelConfig 的ChannelOption。这些选项将会通过bind()方法设置到Channel。在bind()方法被调用之后，设置或者改变ChannelOption 都不会有任何的效果。所支持的ChannelOption 取决于所使用的Channel 类型。参见正在使用的ChannelConfig 的API 文档
childOption 指定当子Channel 被接受时，应用到子Channel 的ChannelConfig 的ChannelOption。所支持的ChannelOption 取决于所使用的Channel 的类型。参见正在使用的ChannelConfig 的API 文档
attr        指定ServerChannel 上的属性，属性将会通过bind()方法设置给Channel。在调用bind()方法之后改变它们将不会有任何的效果
childAttr   将属性设置给已经被接受的子Channel。接下来的调用将不会有任何的效果
handler     设置被添加到ServerChannel 的ChannelPipeline 中的ChannelHandler。更加常用的方法参见childHandler()
childHandler     设置将被添加到已被接受的子Channel 的ChannelPipeline 中的ChannelHandler。handler()方法和childHandler()方法之间的区别是：前者所添加的ChannelHandler  由接受子Channel 的ServerChannel 处理，而childHandler()方法所添加的ChannelHandler 将由已被接受的子Channel处理，其代表一个绑定到远程节点的套接字
clone   克隆一个设置和原始的ServerBootstrap 相同的ServerBootstrap
bind    绑定ServerChannel 并且返回一个ChannelFuture，其将会在绑定操作完成后收到通知（带着成功或者失败的结果）
```

# 引导服务器

你可能已经注意到了，表8-2 中列出了一些在表8-1 中不存在的方法：

childHandler()、childAttr()和childOption()。

这些调用支持特别用于服务器应用程序的操作。

具体来说，ServerChannel 的实现负责创建子 Channel，这些子 Channel 代表了已被接受的连接。

因此，负责引导 ServerChannel 的 ServerBootstrap 提供了这些方法，以简化将设置应用到已被接受的子 Channel 的ChannelConfig 的任务。

图8-3 展示了 ServerBootstrap 在 bind() 方法被调用时创建了一个 ServerChannel，并且该ServerChannel 管理了多个子Channel。

```
1. 当 ServerBootstrap.bind() 调用时，将会创建一个 ServerChannel

2. 当有新的客户端连接过来时，会在 ServerChannel 下创建 Channel
```

## 示例代码

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
public class ServerBoostrapDemo {

    public static void main(String[] args) {
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        EventLoopGroup eventExecutors = new NioEventLoopGroup();

        serverBootstrap.group(eventExecutors)
                .channel(NioServerSocketChannel.class)
                .childHandler(new SimpleChannelInboundHandler<ByteBuf>() {
                    @Override
                    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
                        System.out.println("Received data");
                    }
                });

        ChannelFuture channelFuture = serverBootstrap.bind("127.0.0.1", 8080);
        channelFuture.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture future) throws Exception {
                if(future.isSuccess()) {
                    System.out.println("success");
                } else {
                    System.out.println("fail");
                    future.cause().printStackTrace();
                }
            }
        });

        eventExecutors.shutdownGracefully();
    }
}
```

- 运行日志

```
success
```

# 从 channel 引导客户端

## 问题情境

假设你的服务器正在处理一个客户端的请求，这个请求需要它充当第三方系统的客户端。

当一个应用程序（如一个代理服务器）必须要和组织现有的系统（如Web 服务或者数据库）集成时，就可能发生这种情况。

在这种情况下，将需要从已经被接受的子Channel 中引导一个客户端Channel。

你可以按照8.2.1 节中所描述的方式创建新的Bootstrap 实例，但是这并不是最高效的解决方案，因为它将要求你为每个新创建的客户端Channel 定义另一个EventLoop。

这会产生额外的线程，以及在已被接受的子Channel 和客户端Channel 之间交换数据时不可避免的上下文切换。

一个更好的解决方案是：通过将已被接受的子Channel 的EventLoop 传递给Bootstrap的group()方法来共享该EventLoop。

因为分配给EventLoop 的所有Channel 都使用同一个线程，所以这避免了额外的线程创建，以及前面所提到的相关的上下文切换。

ps: 核心就是尽可能的共享 EventLoop，尽可能的避免线程的上下文切换。


## 示例代码

```java
package com.github.houbb.netty.inaction.bootstrap;

import io.netty.bootstrap.Bootstrap;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;

/**
 * 通过服务端的 channel 引导客户端
 *
 * @author binbin.hou
 * @date 2019/4/30
 * @since 1.0.0
 */
public class ServerBootstrapChannelClient {

    public static void main(String[] args) {
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        EventLoopGroup parentEventExecutors = new NioEventLoopGroup();
        EventLoopGroup childEventExecutors = new NioEventLoopGroup();

        serverBootstrap.group(parentEventExecutors, childEventExecutors)
                .channel(NioServerSocketChannel.class)
                .childHandler(new SimpleChannelInboundHandler<ByteBuf>() {
                    // 当一个新的 channel 连接过来的时候
                    ChannelFuture channelFuture;

                    @Override
                    public void channelActive(ChannelHandlerContext ctx) throws Exception {
                        Bootstrap bootstrap = new Bootstrap();
                        // 获取当前上下文的线程
                        EventLoop eventExecutors = ctx.channel().eventLoop();
                        bootstrap.group(eventExecutors)
                                .channel(NioSocketChannel.class)
                                .handler(new SimpleChannelInboundHandler<ByteBuf>() {
                                    @Override
                                    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
                                        System.out.println("server-child client read...");
                                    }
                                });

                        // 和原来一样，连接到远程服务器
                        channelFuture = bootstrap.connect("www.manning.com", 80);
                    }

                    @Override
                    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
                        if (channelFuture.isDone()) {
                            // 当连接完成之后，进行相关操作。
                        }
                    }
                });

        ChannelFuture channelFuture = serverBootstrap.bind("127.0.0.1", 8080);
        // 添加监听器
        channelFuture.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture future) throws Exception {
                if(future.isSuccess()) {
                    System.out.println("success");
                } else {
                    System.out.println("fail");
                    future.cause().printStackTrace();
                }
            }
        });
    }
}
```


## 个人收获

1. netty 的设计思想确实非常的巧妙

2. 也非常的灵活。


### 学习的过程

原来看 netty 的代码，一言不合洋洋洒洒几百行，看的是不知所云。

现在把基础的知识过一遍，用到的组件学习一遍，逐渐就理解了。

主要是理解之后，自己多动手去写一下。

理解为什么要这么设计？

每一个组件的目的是什么？

# 参考资料

《Netty in Action》 P128

* any list
{:toc}
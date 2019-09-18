---
layout: post
title: Netty 权威指南-04-为什么选择 Netty
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# JDK 编程

感受了上面三篇，不知道你是否觉得 jdk 直接编程非常麻烦？

还有很多情况需要去考虑处理，还有性能相关的问题。

稳定性问题，拓展性问题。

# Netty

[Netty](https://netty.io/) is an asynchronous event-driven network application framework for rapid development of maintainable high performance protocol servers & clients.

Netty是一个NIO客户端服务器框架，可以快速轻松地开发协议服务器和客户端等网络应用程序。 

它极大地简化并简化了TCP和UDP套接字服务器等网络编程。

“快速简便”并不意味着最终的应用程序会受到可维护性或性能问题的影响。 

Netty经过精心设计，具有丰富的协议，如FTP，SMTP，HTTP以及各种二进制和基于文本的传统协议。

因此，Netty成功地找到了一种在不妥协的情况下实现易于开发，性能，稳定性和灵活性的方法。

![components.png](https://netty.io/images/components.png)

# 特征

## 设计

适用于各种传输类型的统一API  - 阻塞和非阻塞套接字

基于灵活且可扩展的事件模型，可以清晰地分离关注点

高度可定制的线程模型 - 单线程，一个或多个线程池，如SEDA

真正的无连接数据报套接字支持（自3.1起）

## 使用方便

详细记录的Javadoc，用户指南和示例

没有其他依赖项，JDK 5（Netty 3.x）或6（Netty 4.x）就足够了

注意：某些组件（如HTTP / 2）可能有更多要求。 

有关更多信息，请参阅“要求”页面。

## 性能

更高的吞吐量，更低的延迟

减少资源消耗

最小化不必要的内存复制

## 安全

完整的SSL/TLS和StartTLS支持

## 社区

早发布，经常发布

自2003年以来，作者一直在编写类似的框架，他仍然发现你的反馈很珍贵！

# 问题

现在我们使用通用应用程序或库来相互通信。

例如，我们经常使用HTTP客户端库从Web服务器检索信息并通过Web服务调用远程过程调用。

但是，通用协议或其实现有时不能很好地扩展。这就像我们不使用通用HTTP服务器来交换大量文件，电子邮件和近实时消息（如财务信息和多人游戏数据）。

所需要的是高度优化的协议实现，专用于特殊目的。

例如，您可能希望实现针对基于AJAX的聊天应用程序，媒体流或大文件传输进行优化的HTTP服务器。

您甚至可以设计并实施一个完全根据您的需求量身定制的全新协议。

另一个不可避免的情况是，您必须处理传统的专有协议，以确保与旧系统的互操作性。

在这种情况下，重要的是我们能够多快地实现该协议，同时不牺牲最终应用程序的稳定性和性能。

# 解决方案

Netty项目旨在为可维护的高性能和高可扩展性协议服务器和客户端的快速开发提供异步事件驱动的网络应用程序框架和工具。

换句话说，Netty是一个NIO客户端服务器框架，可以快速轻松地开发协议服务器和客户端等网络应用程序。

它极大地简化并简化了TCP和UDP套接字服务器开发等网络编程。

“快速简便”并不意味着最终的应用程序会受到可维护性或性能问题的影响。 

Netty经过精心设计，具有丰富的协议实施经验，如FTP，SMTP，HTTP以及各种基于二进制和文本的遗留协议。

因此，Netty成功地找到了一种在不妥协的情况下实现易于开发，性能，稳定性和灵活性的方法。

一些用户可能已经找到了声称具有相同优势的其他网络应用程序框架，您可能想问一下是什么让Netty与它们如此不同。

答案是建立在它上面的哲学。从第一天开始，Netty旨在为您提供API和实施方面最舒适的体验。这不是有形的东西，但你会意识到，当你阅读本指南并与Netty一起玩时，这种理念将使你的生活更轻松。

# 入门

本章通过简单的示例浏览Netty的核心结构，以便您快速入门。

当您在本章末尾时，您将能够立即在Netty上编写客户端和服务器。

如果您更喜欢自上而下的学习方法，那么您可能需要从第2章“架构概述”开始，然后再回到这里。

## 入门之前

本章中运行示例的最低要求仅为两个;最新版本的Netty和JDK 1.6或更高版本。

最新版本的Netty可在项目下载页面中找到。要下载正确版本的JDK，请参阅您首选的JDK供应商的网站。

在阅读时，您可能对本章介绍的类有更多疑问。如果您想了解更多相关信息，请参阅API参考。

为方便起见，本文档中的所有类名都链接到在线API参考。

此外，请不要犹豫与Netty项目社区联系，如果有任何不正确的信息，语法或拼写错误，以及您是否有任何好的想法来帮助改进文档，请告诉我们。

## maven 引入

```xml
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.17.Final</version>
</dependency>
```

# 实例代码

## 编写丢弃服务器

世界上最简单的协议不是'Hello，World！'，而是丢弃。 

它是一种在没有任何响应的情况下丢弃任何接收数据的协议。

要实现DISCARD协议，您唯一需要做的就是忽略所有收到的数据。 

让我们直接从处理程序实现开始，它处理由Netty生成的I/O事件。

- DiscardServerHandler.java


```java
package com.github.houbb.netty.learn.four.discard;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

/**
 * <p> 信息处理器 </p>
 *
 * <pre> Created: 2019/9/18 8:24 PM  </pre>
 * <pre> Project: netty-learn  </pre>
 *
 * @author houbinbin
 */
public class DiscardServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 直接丢弃信息
        ((ByteBuf) msg).release();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

- DiscardServer.java

核心启动流程。

```java
package com.github.houbb.netty.learn.four.discard;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

public class DiscardServer {

    public static void main(String[] args) {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(bossGroup, workGroup)
                    //在这里，我们指定使用NioServerSocketChannel类，该类用于实例化新Channel以接受传入连接。
                    .channel(NioServerSocketChannel.class)
                    //此处指定的处理程序将始终由新接受的Channel评估。
                    .childHandler(new DiscardServerHandler())
                    // 设置套接字选项信息
                    .option(ChannelOption.SO_BACKLOG, 128)
//            option（）用于接受传入连接的NioServerSocketChannel。
//            childOption（）用于父ServerChannel接受的Channels，在这种情况下是NioServerSocketChannel。
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            //bind
            ChannelFuture channelFuture = serverBootstrap.bind(8888).syncUninterruptibly();

            // Wait until the server socket is closed.
            // In this example, this does not happen, but you can do that to gracefully
            // shut down your server.
            channelFuture.channel().closeFuture().syncUninterruptibly();
        } finally {
            workGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }
}
```

EventLoopGroup 可以理解为线程池。

## 打印信息

我们如果启动程序，最简单的方式是使用 `telnet localhost 8888` 进行验证。

- ReceivedByteServerHandler.java

```java
package com.github.houbb.netty.learn.four.discard;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.util.ReferenceCountUtil;

/**
 * <p> 打印收到的字节信息 </p>
 *
 * <pre> Created: 2019/9/18 8:24 PM  </pre>
 * <pre> Project: netty-learn  </pre>
 *
 * @author houbinbin
 */
public class ReceivedByteServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf in = (ByteBuf) msg;

        try {
            while (in.isReadable()) {
                System.out.println(in.readChar());
                System.out.flush();
            }
        } finally {
            // 这个是可选的
            ReferenceCountUtil.release(in);
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}
```

我们将 Server 中的 handler 换成这个，进行试验。

### 测试验证

- 命令行

```
192:~ houbinbin$ telnet localhost 8888
Trying ::1...
Connected to localhost.
Escape character is '^]'.
5
1234
```

- 服务端日志

```
5

1
2
3
4
```

## Echo Server

将客户端的信息，直接返回给客户端。

```java
public class EchoServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 写入并且刷新
        ctx.writeAndFlush(msg);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

### 测试验证

将 server 的 handler 换成这个类。

启动服务端。

- 命令行

```
192:~ houbinbin$ telnet localhost 8888
Trying ::1...
Connected to localhost.
Escape character is '^]'.
1
1
2
2
3
3
4
4
```

每次输入一个字符，都会得到相同的反馈信息。

## 时间服务端

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

/**
 * <p> 时间戳响应服务端 </p>
 *
 * @author houbinbin
 */
public class TimeServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        final ByteBuf byteBuf = ctx.alloc().buffer(4);
        final long time = System.currentTimeMillis();

        // 将时间戳写入 buffer
        byteBuf.writeLong(time);

        // 将 buffer 写入到 ctx
        ChannelFuture channelFuture = ctx.writeAndFlush(byteBuf);
        // 监听事件完成事件
        channelFuture.addListener((ChannelFutureListener) future -> {
            ctx.close();
        });
        // 也可以使用下面更加优雅的方式。
//        channelFuture.addListener(ChannelFutureListener.CLOSE);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

## 时间客户端

```java
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;

public class TimeClient {

    public static void main(String[] args) {
        EventLoopGroup workGroup = new NioEventLoopGroup();

        try {
            Bootstrap bootstrap = new Bootstrap();
            ChannelFuture channelFuture = bootstrap.group(workGroup)
                    .channel(NioSocketChannel.class)
                    .handler(new TimeClientHandler())
                    .option(ChannelOption.SO_KEEPALIVE, true)
                    .connect("localhost", 8888)
                    .syncUninterruptibly();

            // 关闭客户端
            channelFuture.channel().closeFuture().syncUninterruptibly();
        } finally {
            workGroup.shutdownGracefully();
        }
    }
}
```

- TimeClientHandler.java

```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

/**
 * <p> 时间戳响应客户端 </p>
 */
public class TimeClientHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf byteBuf = (ByteBuf) msg;
        long value = byteBuf.readLong();
        System.out.println("Client receive time: " + value);

        ctx.close();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

### 测试验证

启动服务端

启动客户端

- 客户端日志

```
Client receive time: 1568812068058

Process finished with exit code 0
```

# 感受

Netty 真的是非常的强大，api 也封装的非常优雅。

很值得深入学习。

# 拓展阅读

[丢弃协议](https://tools.ietf.org/html/rfc863)

# 参考资料

《Netty 权威指南》

[Netty 官方](https://netty.io/wiki/user-guide-for-4.x.html)

* any list
{:toc}
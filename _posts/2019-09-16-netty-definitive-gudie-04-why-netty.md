---
layout: post
title: Netty 权威指南-04-为什么选择 Netty？Netty 入门教程
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# JDK 编程

感受了上面的 [java 中的 BIO/NIO/AIO 详解](https://www.toutiao.com/i6908281789907730947/)，不知道你是否觉得 jdk 直接编程非常麻烦？

还有很多情况需要去考虑处理，还有性能相关的问题、稳定性问题，拓展性问题。

## 不选择Java原生NIO编程的原因

现在我们总结一下为什么不建议开发者直接使用JDK的NIO类库进行开发，具体原因如下。

(1) NIO的类库和API繁杂，使用麻烦，你需要熟练掌握Selector、ServerSocketChannel、SocketChannel、ByteBuffer等

(2) 需要具备其他的额外技能做铺垫，例如熟悉Java多线程编程。

这是因为NIO编程涉及到Reactor模式，你必须对多线程和网路编程非常熟悉，才能编写出高质量的NIO程序。

(3) 可靠性能力补齐，工作量和难度都非常大。

例如客户端面临断连重连、网络闪断、半包读写、失败缓存、网络拥塞和异常码流的处理等问题，NIO编程的特点是功能开发相对容易，但是可靠性能力补齐的工作量和难度都非常大。

(4) JDK NIO的BUG， 例如臭名昭著的epollbug，它会导致Selector空轮询， 最终导致CPU 100%。

官方声称在JDK1.6版本的update18修复了该问题， 但是直到JDK1.7版本该问题仍旧存在， 只不过该BUG发生概率降低了一些而已，它并没有得到根本性解决。

## 为什么选择 netty

Netty是业界最流行的NIO框架之一， 它的健壮性、功能、性能、可定制性和可扩展性在同类框架中都是首屈一指的， 它已经得到成百上千的商用项目验证， 例如Hadoop的RPC框架Avro就使用了Netty作为底层通信框架， 其他还有业界主流的RPC框架， 也使用Netty来构建高性能的异步通信能力。

通过对Netty的分析，我们将它的优点总结如下。

- API使用简单， 开发门槛低；

- 功能强大，预置了多种编解码功能，支持多种主流协议；

- 定制能力强， 可以通过ChannelHandler对通信框架进行灵活地扩展；

- 性能高， 通过与其他业界主流的NIO框架对比，Netty的综合性能最优；

- 成熟、稳定，Netty修复了已经发现的所有JDKNIOBUG， 业务开发人员不需要再为NIO的BUG而烦恼；

- 社区活跃， 版本迭代周期短， 发现的BUG可以被及时修复，同时， 更多的新功能会加入；

- 经历了大规模的商业应用考验， 质量得到验证。Netty在互联网、大数据、网络游戏、企业应用、电信软件等众多行业已经得到了成功商用，证明它已经完全能够满足不同行业的商业应用了。

正是因为这些优点，Netty 逐渐成为了 Java NIO 编程的首选框架。

# Netty

[Netty](https://netty.io/) 是一个NIO客户端服务器框架，可以快速轻松地开发协议服务器和客户端等网络应用程序。 

它极大地简化并简化了TCP和UDP套接字服务器等网络编程。

“快速简便”并不意味着最终的应用程序会受到可维护性或性能问题的影响。 

Netty经过精心设计，具有丰富的协议，如FTP，SMTP，HTTP以及各种二进制和基于文本的传统协议。

因此，Netty成功地找到了一种在不妥协的情况下实现易于开发，性能，稳定性和灵活性的方法。

![components.png](https://netty.io/images/components.png)

# 快速入门

本章通过简单的示例浏览Netty的核心结构，以便您快速入门。

当您在本章末尾时，您将能够立即在Netty上编写客户端和服务器。

## 入门之前

本章中运行示例的最低要求仅为两个：最新版本的Netty和JDK 1.6或更高版本。

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
 * @author 老马啸西风
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
 * @author 老马啸西风
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
192:~ 老马啸西风$ telnet localhost 8888
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
192:~ 老马啸西风$ telnet localhost 8888
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
 * @author 老马啸西风
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

Netty 真的是非常的强大，api 也封装的非常优雅，很值得深入学习。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 拓展阅读

[丢弃协议](https://tools.ietf.org/html/rfc863)

# 参考资料

《Netty 权威指南》

[Netty 官方](https://netty.io/wiki/user-guide-for-4.x.html)

* any list
{:toc}
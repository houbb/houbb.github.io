---
layout: post
title:  java 从零实现 rpc（1）服务端与客户端启动
date:  2020-12-16 22:11:27 +0800
categories: [RPC]
tags: [rpc, micro service, sh]
published: true
---

# 回顾

大家好，我是老马。

我们前面学习了 [5 分钟入门 spring cloud 实战笔记](https://www.toutiao.com/i6906136436756840968/) 和 [dubbo 2.7 的 3种入门案例实战](https://www.toutiao.com/i6906507244977127950/)，
小伙伴肯定已经有了最基本的认识。

工作使用过 rpc 框架的肯定也觉得 so easy，那后面我们就来一起从零实现属于自己的 rpc 框架。

懂得原理，以后哪怕遇到 GRPC 之类的，上手都会变得简单很多。

![so easy](https://p1-tt-ipv6.byteimg.com/origin/pgc-image/9955d8dbc9b64bdaba5711635ead4801)

# 知识储备

建议学习的小伙伴有扎实的 java 基础，最好有一定的 rpc 框架使用经验。

建议的基础储备如下：

[Java 并发实战学习](https://houbb.github.io/2019/01/18/jcip-00-overview)

[TCP/IP 协议学习笔记](https://houbb.github.io/2019/04/05/protocol-tcp-ip-01-overview-01)

[Netty 权威指南学习](https://houbb.github.io/2019/05/10/netty-definitive-gudie-00-overview)

为了便于大家理解，这个系列采用渐进式开发，希望每一位小伙伴都可以看懂。

let's go!

# 服务端的启动

## maven 依赖

这里网络包我们使用成熟的 netty，后续有时间将对 netty 进行一下深入学习，此处不做展开。

```xml
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.17.Final</version>
</dependency>
```

其实最基础的实现也可以从 java 的 socket 开始，不过原理的是类似的，netty 在网络通信方面做了很多封装和改良，我们要学会站在巨人的肩膀上。

![巨人](https://p9-tt-ipv6.byteimg.com/origin/pgc-image/ba4767346d5f4cca8eee648164377392)

## 服务端核心代码

基于 netty 的服务端，整体部分是固定的，不要求大家死记硬背。

```java
package com.github.houbb.rpc.server.core;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.server.constant.RpcServerConst;
import com.github.houbb.rpc.server.handler.RpcServerHandler;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

/**
 * rpc 服务端
 * @author binbin.hou
 * @since 0.0.1
 */
public class RpcServer extends Thread {

    private static final Log log = LogFactory.getLog(RpcServer.class);

    /**
     * 端口号
     */
    private final int port;

    public RpcServer() {
        this.port = RpcServerConst.DEFAULT_PORT;
    }

    public RpcServer(int port) {
        this.port = port;
    }

    @Override
    public void run() {
        // 启动服务端
        log.info("RPC 服务开始启动服务端");

        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(workerGroup, bossGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<Channel>() {
                        @Override
                        protected void initChannel(Channel ch) throws Exception {
                            ch.pipeline().addLast(new RpcServerHandler());
                        }
                    })
                    // 这个参数影响的是还没有被accept 取出的连接
                    .option(ChannelOption.SO_BACKLOG, 128)
                    // 这个参数只是过一段时间内客户端没有响应，服务端会发送一个 ack 包，以判断客户端是否还活着。
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            // 绑定端口，开始接收进来的链接
            ChannelFuture channelFuture = serverBootstrap.bind(port).syncUninterruptibly();
            log.info("RPC 服务端启动完成，监听【" + port + "】端口");

            channelFuture.channel().closeFuture().syncUninterruptibly();
            log.info("RPC 服务端关闭完成");
        } catch (Exception e) {
            log.error("RPC 服务异常", e);
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }

}
```

netty 的 api 设计是老马非常喜欢的风格，我的 90% 的工具类都会采用这种 fluent-api 的风格，写起来非常之流畅。

EventLoopGroup 大家可以理解为是一个连接池，用于提升性能。

NIO 相比于传统的 BIO 性能有着巨大的飞跃，可以参考

> [java NIO 系列教程](https://houbb.github.io/2018/09/22/java-nio-01-overview)

## 最简单的 Handler

netty 为我们的所有实现，都抽象为了 Handler，我们这里的 RpcServerHandler 非常简单，如下：

```java
package com.github.houbb.rpc.server.handler;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class RpcServerHandler extends SimpleChannelInboundHandler {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        // do nothing now
    }
}
```

## 服务端启动

```java
/**
 * 服务启动代码测试
 * @param args 参数
 */
public static void main(String[] args) {
    new RpcServer().start();
}
```

启动日志如下：

```
[INFO] [2020-12-16 22:46:52.176] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务开始启动服务端
[INFO] [2020-12-16 22:46:54.436] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务端启动完成，监听【9627】端口
```

# 客户端

同理，我们可以创建需要调用服务端的客户端。

## 依赖

maven 依赖也是 netty

```xml
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.17.Final</version>
</dependency>
```

## 客户端核心实现

```java
package com.github.houbb.rpc.client.core;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.handler.RpcClientHandler;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;

/**
 * <p> rpc 客户端 </p>
 *
 * <pre> Created: 2019/10/16 11:21 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * @author houbinbin
 * @since 0.0.2
 */
public class RpcClient extends Thread {

    private static final Log log = LogFactory.getLog(RpcClient.class);

    /**
     * 监听端口号
     */
    private final int port;

    public RpcClient(int port) {
        this.port = port;
    }

    public RpcClient() {
        this(9527);
    }

    @Override
    public void run() {
        // 启动服务端
        log.info("RPC 服务开始启动客户端");

        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            Bootstrap bootstrap = new Bootstrap();
            ChannelFuture channelFuture = bootstrap.group(workerGroup)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.SO_KEEPALIVE, true)
                    .handler(new ChannelInitializer<Channel>(){
                        @Override
                        protected void initChannel(Channel ch) throws Exception {
                            ch.pipeline()
                                    // 添加日志输出 Handler
                                    .addLast(new LoggingHandler(LogLevel.INFO))
                                    // 添加自定义 Handler
                                    .addLast(new RpcClientHandler());
                        }
                    })
                    // 连接到本地的 port 指定端口
                    .connect("localhost", port)
                    .syncUninterruptibly();

            log.info("RPC 服务启动客户端完成，监听端口：" + port);
            channelFuture.channel().closeFuture().syncUninterruptibly();
            log.info("RPC 服务开始客户端已关闭");
        } catch (Exception e) {
            log.error("RPC 客户端遇到异常", e);
        } finally {
            workerGroup.shutdownGracefully();
        }
    }

}
```

## 客户端 Handler

这里 Handler 仅作为演示，实现也非常简单：

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

package com.github.houbb.rpc.client.handler;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * <p> 客户端处理类 </p>
 *
 * <pre> Created: 2019/10/16 11:30 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * @author houbinbin
 * @since 0.0.2
 */
public class RpcClientHandler extends SimpleChannelInboundHandler {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        // do nothing.
    }

}
```

## 客户端启动

我们在服务端启动之后，可以启动一下客户端进行连接。

```java
/**
 * 服务启动代码测试
 * @param args 参数
 */
public static void main(String[] args) {
    new RpcClient().start();
}
```

启动日志如下：

```
[INFO] [2020-12-16 22:54:22.332] [Thread-0] [c.g.h.r.c.c.RpcClient.run] - RPC 服务开始启动客户端
十二月 16, 2020 10:54:25 下午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0x20efe557] REGISTERED
十二月 16, 2020 10:54:25 下午 io.netty.handler.logging.LoggingHandler connect
信息: [id: 0x20efe557] CONNECT: localhost/127.0.0.1:9527
十二月 16, 2020 10:54:25 下午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0x20efe557, L:/127.0.0.1:53434 - R:localhost/127.0.0.1:9527] ACTIVE
[INFO] [2020-12-16 22:54:25.045] [Thread-0] [c.g.h.r.c.c.RpcClient.run] - RPC 服务启动客户端完成，监听端口：9527
```

# 小结

本地演示了如何使用 netty 实现 rpc，是不是感觉非常的简单？

是的，实际上这正是 netty 的魅力所在，将网络通讯的细节都隐藏起来了，让我们可以更加专注于业务。

千里之行，始于足下。

小伙伴看了之后，也要自己动手写一下。

为了便于大家学习，所有源码均已开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://mp.weixin.qq.com/s/r9F8qYw8PIcyjGR2yS0Jzg

* any list
{:toc}
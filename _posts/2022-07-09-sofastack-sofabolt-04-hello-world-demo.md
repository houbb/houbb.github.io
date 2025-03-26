---
layout: post
title: SOFABolt 介绍-04-入门实战的例子
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFABolt, sh]
published: true
---

# 目的

java 实战真实的例子，而不是侃侃而谈的理论。

# netty 入门例子

## maven

```xml
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.108.Final</version>
</dependency>
```

## 服务端

```java
package com.github.houbb.netty.learn;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;

import java.nio.charset.StandardCharsets;

public class EchoServer {
    public static void main(String[] args) throws Exception {
        // 1. 创建线程组（Boss 负责连接，Worker 负责 I/O）
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            // 2. 配置服务端引导类
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ch.pipeline().addLast(new EchoServerHandler());
                        }
                    });

            // 3. 绑定端口并启动服务
            ChannelFuture f = b.bind(8080).sync();
            f.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}

// 自定义处理器
class EchoServerHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        ByteBuf in = (ByteBuf) msg;
        System.out.println("收到客户端消息: " + in.toString(StandardCharsets.UTF_8));
        ctx.writeAndFlush(Unpooled.copiedBuffer("Hi Client!", StandardCharsets.UTF_8));
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

## 客户端

```java
package com.github.houbb.netty.learn;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;

import java.nio.charset.StandardCharsets;

public class EchoClient {
    public static void main(String[] args) throws Exception {
        EventLoopGroup group = new NioEventLoopGroup();

        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
                    .channel(NioSocketChannel.class)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ch.pipeline().addLast(new EchoClientHandler());
                        }
                    });

            // 连接服务端
            ChannelFuture f = b.connect("127.0.0.1", 8080).sync();
            f.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully();
        }
    }
}

// 自定义处理器
class EchoClientHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        ctx.writeAndFlush(Unpooled.copiedBuffer("Hello Server!", StandardCharsets.UTF_8));
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        ByteBuf in = (ByteBuf) msg;
        System.out.println("收到服务端响应: " + in.toString(StandardCharsets.UTF_8));
        ctx.close();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

## 测试

首先启动 EchoServer、然后启动 EchoClient

预期结果：

服务端输出：收到客户端消息: Hello Server!

客户端输出：收到服务端响应: Hi Client!

# sofatbolt 例子

## maven 

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>bolt</artifactId>
    <version>1.6.11</version>
</dependency>
```

## 服务端

```java
package com.github.houbb.sofabolt.learn;

import com.alipay.remoting.BizContext;
import com.alipay.remoting.rpc.RpcServer;
import com.alipay.remoting.rpc.protocol.SyncUserProcessor;

public class SofaBoltServer {

    public static void main(String[] args) {
        // 1. 创建 RPC 服务端（自动管理线程池）
        RpcServer rpcServer = new RpcServer(12200);

        // 2. 注册用户处理器（处理字符串消息）
        rpcServer.registerUserProcessor(new SyncUserProcessor<String>() {
            @Override
            public Object handleRequest(BizContext bizContext, String s) throws Exception {
                System.out.println("收到客户端消息: " + s);
                return "Hi Client!"; // 直接返回响应
            }

            @Override
            public String interest() {
                return String.class.getName(); // 声明处理的消息类型
            }
        });

        // 3. 启动服务
        rpcServer.start();
        System.out.println("Server started on port 12200");
    }

}
```

## 客户端

```java
package com.github.houbb.sofabolt.learn;

import com.alipay.remoting.rpc.RpcClient;

public class SofaBoltClient {

    public static void main(String[] args) {
        // 1. 创建 RPC 客户端（自动管理连接池）
        RpcClient rpcClient = new RpcClient();
        rpcClient.init();

        try {
            // 2. 同步调用（指定地址、请求体、超时时间）
            String response = (String) rpcClient.invokeSync(
                    "127.0.0.1:12200",
                    "Hello Server!",
                    3000 // 超时 3 秒
            );

            System.out.println("收到服务端响应: " + response);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            rpcClient.shutdown();
        }
    }

}
```

## 测试验证

服务端启动，客户端启动。

服务端日志：

```
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
Sofa-Middleware-Log:WARN [com.alipay.remoting] No log util is usable, Default app logger will be used.
Server started on port 12200
Sofa-Middleware-Log:WARN [sofa-common-tools] No log util is usable, Default app logger will be used.
三月 26, 2025 8:09:25 下午 com.caucho.hessian.io.AbstractStringBuilderDeserializer <clinit>
警告: coder field not found or not accessible, will skip coder check, error is coder
Sofa-Middleware-Log:WARN [com.alipay.sofa.hessian] No log util is usable, Default app logger will be used.
收到客户端消息: Hello Server!
```

客户端日志

```
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
Sofa-Middleware-Log:WARN [com.alipay.remoting] No log util is usable, Default app logger will be used.
三月 26, 2025 8:09:24 下午 com.caucho.hessian.io.AbstractStringBuilderDeserializer <clinit>
警告: coder field not found or not accessible, will skip coder check, error is coder
Sofa-Middleware-Log:WARN [com.alipay.sofa.hessian] No log util is usable, Default app logger will be used.
收到服务端响应: Hi Client!
```

# 参考资料

https://www.sofastack.tech/projects/sofa-bolt/sofa-bolt-handbook/

* any list
{:toc}
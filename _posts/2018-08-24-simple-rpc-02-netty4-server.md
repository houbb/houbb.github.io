---
layout: post
title: java 从零开始手写 RPC (02)-server 服务端代码实现
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# 说明

上一篇代码基于 socket 的实现非常简单，但是对于实际生产，一般使用 netty。

至于 netty 的优点可以参考：

> [为什么选择 netty？](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

[https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

# 代码实现

## maven 引入

```xml
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>${netty.version}</version>
</dependency>
```

引入 netty 对应的 maven 包，此处为 4.1.17.Final。

## 服务端代码实现

netty 的服务端启动代码是比较固定的。

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

为了简单，服务端启动端口号固定，RpcServerConst 常量类内容如下：

```java
public final class RpcServerConst {

    private RpcServerConst(){}

    /**
     * 默认端口
     * @since 0.0.1
     */
    public static final int DEFAULT_PORT = 9627;

}
```

## RpcServerHandler

当然，还有一个比较核心的类就是 RpcServerHandler

```java
public class RpcServerHandler extends SimpleChannelInboundHandler {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        // do nothing now
    }
}
```

目前是空实现，后续可以添加对应的日志输出及逻辑处理。

# 测试

启动测试的代码非常简单：

```java
/**
 * 服务启动代码测试
 * @param args 参数
 */
public static void main(String[] args) {
    new RpcServer().start();
}
```

# 开源地址

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}
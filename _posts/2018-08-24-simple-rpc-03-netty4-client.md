---
layout: post
title: 基于 netty4 手写 rpc-02-client 客户端代码实现
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# 说明

上一篇我们实现了服务端的实现，这一节来一起看一下 client 客户端代码实现。

# 代码实现

## RpcClient 

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

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
                                    .addLast(new LoggingHandler(LogLevel.INFO))
                                    .addLast(new RpcClientHandler());
                        }
                    })
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

`.connect("localhost", port)` 声明了客户端需要连接的服务端，此处和服务端的端口保持一致。

## RpcClientHandler

客户端处理类也比较简单，暂时留空。

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

# 启动测试

## 服务端

首先启动服务端。

## 客户端

然后启动客户端连接服务端，实现如下：

```java
/**
 * 服务启动代码测试
 * @param args 参数
 */
public static void main(String[] args) {
    new RpcClient().start();
}
```

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}
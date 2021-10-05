---
layout: post
title: 基于 netty4 手写 rpc-05-客户端主动调用服务端
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# 说明

我们上一章的例子中，我们的调用是在客户端启动的时候完成的。

实际使用中，我们希望调用可以有客户端主动发起。

# 客户端

## 核心

```java
/**
 * <p> rpc 客户端 </p>
 *
 * <pre> Created: 2019/10/16 11:21 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * @author houbinbin
 * @since 0.0.2
 */
public class RpcClient {

    // 和以前保持一致

    /**
     * 开始运行
     */
    public void start() {
        // 启动服务端
        log.info("RPC 服务开始启动客户端");

        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            Bootstrap bootstrap = new Bootstrap();
            channelFuture = bootstrap.group(workerGroup)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.SO_KEEPALIVE, true)
                    .handler(new ChannelInitializer<Channel>(){
                        @Override
                        protected void initChannel(Channel ch) throws Exception {
                            channelHandler = new RpcClientHandler();
                            ch.pipeline()
                                    .addLast(new LoggingHandler(LogLevel.INFO))
                                    .addLast(new CalculateRequestEncoder())
                                    .addLast(new CalculateResponseDecoder())
                                    .addLast(channelHandler);
                        }
                    })
                    .connect(RpcConstant.ADDRESS, port)
                    .syncUninterruptibly();
            log.info("RPC 服务启动客户端完成，监听端口：" + port);
        } catch (Exception e) {
            log.error("RPC 客户端遇到异常", e);
            throw new RuntimeException(e);
        }
        // 不要关闭线程池！！！
    }

    /**
     * 调用计算
     * @param request 请求信息
     * @return 结果
     * @since 0.0.4
     */
    public CalculateResponse calculate(final CalculateRequest request) {
        // 发送请求
        final Channel channel = channelFuture.channel();
        log.info("RPC 客户端发送请求，request: {}", request);

        // 关闭当前线程，以获取对应的信息
        channel.writeAndFlush(request);
        channel.closeFuture().syncUninterruptibly();

        return channelHandler.getResponse();
    }

}
```

我们将计算部分的方法单独抽离出来。

## RpcClientHandler

客户端处理类实现如下：

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

package com.github.houbb.rpc.client.handler;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.core.RpcClient;
import com.github.houbb.rpc.common.model.CalculateResponse;

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

    private static final Log log = LogFactory.getLog(RpcClient.class);

    /**
     * 响应信息
     * @since 0.0.4
     */
    private CalculateResponse response;

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        CalculateResponse response = (CalculateResponse)msg;

        this.response = response;
        log.info("[Client] response is :{}", response);
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        // 每次用完要关闭，不然拿不到response，我也不知道为啥（目测得了解netty才行）
        // 个人理解：如果不关闭，则永远会被阻塞。
        ctx.flush();
        ctx.close();
    }

    public CalculateResponse getResponse() {
        return response;
    }

}
```

## CalculatorProxy

计算的代理实现。

```java
package com.github.houbb.rpc.client.proxy;

import com.github.houbb.rpc.client.core.RpcClient;
import com.github.houbb.rpc.common.model.CalculateRequest;
import com.github.houbb.rpc.common.model.CalculateResponse;
import com.github.houbb.rpc.common.service.Calculator;

/**
 * @author binbin.hou
 * @since 0.0.4
 */
public class CalculatorProxy implements Calculator {

    /**
     * rpc 客户端
     */
    private RpcClient rpcClient;

    /**
     * 创建类
     * （1）默认初始化 client 端
     */
    public CalculatorProxy() {
        rpcClient = new RpcClient();
        rpcClient.start();
    }

    @Override
    public CalculateResponse sum(CalculateRequest request) {
        return rpcClient.calculate(request);
    }

}
```

## 编码&解码

和以前保持一致。

服务端保持不变。

# 测试

## 服务端

服务端启动，日志如下：

```
[DEBUG] [2021-10-05 12:29:40.307] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 12:29:40.314] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务开始启动服务端
十月 05, 2021 12:29:41 下午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0xb4519e4f] REGISTERED
十月 05, 2021 12:29:41 下午 io.netty.handler.logging.LoggingHandler bind
信息: [id: 0xb4519e4f] BIND: 0.0.0.0/0.0.0.0:9527
十月 05, 2021 12:29:41 下午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0xb4519e4f, L:/0:0:0:0:0:0:0:0:9527] ACTIVE
[INFO] [2021-10-05 12:29:41.832] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务端启动完成，监听【9527】端口
```

## 客户端

客户端主动调用，可以更加灵活。

### 调用

```java
/**
 * 服务启动代码测试
 * @param args 参数
 */
public static void main(String[] args) {
    Calculator calculator = new CalculatorProxy();
    CalculateRequest request = new CalculateRequest();
    request.setOne(5);
    request.setTwo(6);
    CalculateResponse response = calculator.sum(request);
    System.out.println("rpc call result: " + response);
}
```

日志如下：

```
[DEBUG] [2021-10-05 12:30:36.172] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 12:30:36.182] [main] [c.g.h.r.c.c.RpcClient.start] - RPC 服务开始启动客户端
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0x7dbd673d] REGISTERED
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler connect
信息: [id: 0x7dbd673d] CONNECT: /127.0.0.1:9527
[INFO] [2021-10-05 12:30:38.054] [main] [c.g.h.r.c.c.RpcClient.start] - RPC 服务启动客户端完成，监听端口：9527
[INFO] [2021-10-05 12:30:38.058] [main] [c.g.h.r.c.c.RpcClient.calculate] - RPC 客户端发送请求，request: CalculateRequest{one=5, two=6}
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0x7dbd673d, L:/127.0.0.1:60689 - R:/127.0.0.1:9527] ACTIVE
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler write
信息: [id: 0x7dbd673d, L:/127.0.0.1:60689 - R:/127.0.0.1:9527] WRITE: 8B
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 00 00 00 05 00 00 00 06                         |........        |
+--------+-------------------------------------------------+----------------+
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler flush
信息: [id: 0x7dbd673d, L:/127.0.0.1:60689 - R:/127.0.0.1:9527] FLUSH
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler channelRead
信息: [id: 0x7dbd673d, L:/127.0.0.1:60689 - R:/127.0.0.1:9527] READ: 5B
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 01 00 00 00 0b                                  |.....           |
+--------+-------------------------------------------------+----------------+
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler channelReadComplete
信息: [id: 0x7dbd673d, L:/127.0.0.1:60689 - R:/127.0.0.1:9527] READ COMPLETE
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler flush
信息: [id: 0x7dbd673d, L:/127.0.0.1:60689 - R:/127.0.0.1:9527] FLUSH
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler close
信息: [id: 0x7dbd673d, L:/127.0.0.1:60689 - R:/127.0.0.1:9527] CLOSE
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler channelInactive
信息: [id: 0x7dbd673d, L:/127.0.0.1:60689 ! R:/127.0.0.1:9527] INACTIVE
十月 05, 2021 12:30:38 下午 io.netty.handler.logging.LoggingHandler channelUnregistered
信息: [id: 0x7dbd673d, L:/127.0.0.1:60689 ! R:/127.0.0.1:9527] UNREGISTERED
[INFO] [2021-10-05 12:30:38.186] [nioEventLoopGroup-2-1] [c.g.h.r.c.c.RpcClient.channelRead0] - [Client] response is :CalculateResponse{success=true, sum=11}
rpc call result: CalculateResponse{success=true, sum=11}
```

# 编译报错问题

idea 开源社区版本，2020.03 发现编译会报错：

```
java: Workaround: to make project compile with the current annotation processor implementation, start JPS with VM option: -Djps.track.ap.dependencies=false
  When run from IDE, the option can be set in "Compiler Settings | build process VM options"
```

## 原因

升级到idea 2020.3 版本后，出现无法在编译阶段解析，尤其在处理一些注解，类似lombok这类的。

ps：这个应该是社区版本的 BUG。

## 解决方案

在 setting --> Compiler 中的vm选项加入

```
-Djps.track.ap.dependencies=false
```

或者排除掉 lombok 相关的依赖包。

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}
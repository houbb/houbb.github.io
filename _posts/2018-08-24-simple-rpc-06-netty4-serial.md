---
layout: post
title: java 从零开始手写 RPC (04) -序列化
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# 序列化

[java 从零开始手写 RPC (01) 基于 socket 实现](https://mp.weixin.qq.com/s/Pvzi_O4DumhisIwDrSwnqQ)

[java 从零开始手写 RPC (02)-netty4 实现客户端和服务端](https://mp.weixin.qq.com/s/0zbk6fo-PryCNOxESwMSbQ)

[java 从零开始手写 RPC (03) 如何实现客户端调用服务端？](https://mp.weixin.qq.com/s/2z6T4yEVT29AZMvdYqwZ7Q)

前面几节我们实现了最基础的客户端调用服务端，这一节来学习一下通讯中的对象序列化。

![fastjson](https://img-blog.csdnimg.cn/d8490dd90106448696bc274cf770cc0e.jpg)

## 为什么需要序列化

netty 底层都是基于 ByteBuf 进行通讯的。

前面我们通过编码器/解码器专门为计算的入参/出参进行处理，这样方便我们直接使用 pojo。

但是有一个问题，如果想把我们的项目抽象为框架，那就需要为所有的对象编写编码器/解码器。

显然，直接通过每一个对象写一对的方式是不现实的，而且用户如何使用，也是未知的。

## 序列化的方式

基于字节的实现，性能好，可读性不高。

基于字符串的实现，比如 json 序列化，可读性好，性能相对较差。

ps: 可以根据个人还好选择，相关序列化可参考下文，此处不做展开。

> [json 序列化框架简介](https://houbb.github.io/2018/07/20/json-00-overview)

## 实现思路

可以将我们的 Pojo 全部转化为 byte，然后 Byte 转换为 ByteBuf 即可。

反之亦然。

# 代码实现

## maven 

引入序列化包：

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>json</artifactId>
    <version>0.1.1</version>
</dependency>
```

## 服务端

### 核心

服务端的代码可以大大简化：

```java
serverBootstrap.group(workerGroup, bossGroup)
    .channel(NioServerSocketChannel.class)
    // 打印日志
    .handler(new LoggingHandler(LogLevel.INFO))
    .childHandler(new ChannelInitializer<Channel>() {
        @Override
        protected void initChannel(Channel ch) throws Exception {
            ch.pipeline()
                    .addLast(new RpcServerHandler());
        }
    })
    // 这个参数影响的是还没有被accept 取出的连接
    .option(ChannelOption.SO_BACKLOG, 128)
    // 这个参数只是过一段时间内客户端没有响应，服务端会发送一个 ack 包，以判断客户端是否还活着。
    .childOption(ChannelOption.SO_KEEPALIVE, true);
```

这里只需要一个实现类即可。

### RpcServerHandler

服务端的序列化/反序列化调整为直接使用 JsonBs 实现。

```java
package com.github.houbb.rpc.server.handler;

import com.github.houbb.json.bs.JsonBs;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.common.model.CalculateRequest;
import com.github.houbb.rpc.common.model.CalculateResponse;
import com.github.houbb.rpc.common.service.Calculator;
import com.github.houbb.rpc.server.service.CalculatorService;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class RpcServerHandler extends SimpleChannelInboundHandler {

    private static final Log log = LogFactory.getLog(RpcServerHandler.class);

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        final String id = ctx.channel().id().asLongText();
        log.info("[Server] channel {} connected " + id);
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        final String id = ctx.channel().id().asLongText();

        ByteBuf byteBuf = (ByteBuf)msg;
        byte[] bytes = new byte[byteBuf.readableBytes()];
        byteBuf.readBytes(bytes);
        CalculateRequest request = JsonBs.deserializeBytes(bytes, CalculateRequest.class);
        log.info("[Server] receive channel {} request: {} from ", id, request);

        Calculator calculator = new CalculatorService();
        CalculateResponse response = calculator.sum(request);

        // 回写到 client 端
        byte[] responseBytes = JsonBs.serializeBytes(response);
        ByteBuf responseBuffer = Unpooled.copiedBuffer(responseBytes);
        ctx.writeAndFlush(responseBuffer);
        log.info("[Server] channel {} response {}", id, response);
    }

}
```

## 客户端

### 核心

客户端可以简化如下：

```java
channelFuture = bootstrap.group(workerGroup)
    .channel(NioSocketChannel.class)
    .option(ChannelOption.SO_KEEPALIVE, true)
    .handler(new ChannelInitializer<Channel>(){
        @Override
        protected void initChannel(Channel ch) throws Exception {
            channelHandler = new RpcClientHandler();
            ch.pipeline()
                    .addLast(new LoggingHandler(LogLevel.INFO))
                    .addLast(channelHandler);
        }
    })
    .connect(RpcConstant.ADDRESS, port)
    .syncUninterruptibly();
```

### RpcClientHandler

客户端的序列化/反序列化调整为直接使用 JsonBs 实现。

```java
package com.github.houbb.rpc.client.handler;

import com.github.houbb.json.bs.JsonBs;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.core.RpcClient;
import com.github.houbb.rpc.common.model.CalculateResponse;

import io.netty.buffer.ByteBuf;
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
        ByteBuf byteBuf = (ByteBuf)msg;
        byte[] bytes = new byte[byteBuf.readableBytes()];
        byteBuf.readBytes(bytes);

        this.response = JsonBs.deserializeBytes(bytes, CalculateResponse.class);
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

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}
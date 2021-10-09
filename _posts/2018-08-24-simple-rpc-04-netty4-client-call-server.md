---
layout: post
title: java 从零开始手写 RPC (03) 如何实现客户端调用服务端？
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# 说明

[java 从零开始手写 RPC (01) 基于 socket 实现](https://mp.weixin.qq.com/s/Pvzi_O4DumhisIwDrSwnqQ)

[java 从零开始手写 RPC (02)-netty4 实现客户端和服务端](https://mp.weixin.qq.com/s/0zbk6fo-PryCNOxESwMSbQ)

写完了客户端和服务端，那么如何实现客户端和服务端的调用呢？

下面就让我们一起来看一下。

# 接口定义

## 计算方法

```java
package com.github.houbb.rpc.common.service;

import com.github.houbb.rpc.common.model.CalculateRequest;
import com.github.houbb.rpc.common.model.CalculateResponse;

/**
 * <p> 计算服务接口 </p>
 *
 * <pre> Created: 2018/8/24 下午4:47  </pre>
 * <pre> Project: fake  </pre>
 *
 * @author houbinbin
 * @since 0.0.1
 */
public interface Calculator {

    /**
     * 计算加法
     * @param request 请求入参
     * @return 返回结果
     */
    CalculateResponse sum(final CalculateRequest request);

}
```

## pojo 

对应的参数对象：

- CalculateRequest

```java
package com.github.houbb.rpc.common.model;

import java.io.Serializable;

/**
 * <p> 请求入参 </p>
 *
 * <pre> Created: 2018/8/24 下午5:05  </pre>
 * <pre> Project: fake  </pre>
 *
 * @author houbinbin
 * @since 0.0.3
 */
public class CalculateRequest implements Serializable {

    private static final long serialVersionUID = 6420751004355300996L;

    /**
     * 参数一
     */
    private int one;

    /**
     * 参数二
     */
    private int two;

    public CalculateRequest() {
    }

    public CalculateRequest(int one, int two) {
        this.one = one;
        this.two = two;
    }

    //getter setter toString

}
```

- CalculateResponse

```java
package com.github.houbb.rpc.common.model;

import java.io.Serializable;

/**
 * <p> 请求入参 </p>
 *
 * <pre> Created: 2018/8/24 下午5:05  </pre>
 * <pre> Project: fake  </pre>
 *
 * @author houbinbin
 * @since 0.0.3
 */
public class CalculateResponse implements Serializable {

    private static final long serialVersionUID = -1972014736222511341L;

    /**
     * 是否成功
     */
   private boolean success;

    /**
     * 二者的和
     */
   private int sum;

    public CalculateResponse() {
    }

    public CalculateResponse(boolean success, int sum) {
        this.success = success;
        this.sum = sum;
    }

    //getter setter toString
}
```

# 客户端

## 核心部分

RpcClient 需要添加对应的 Handler，调整如下：

```java
Bootstrap bootstrap = new Bootstrap();
ChannelFuture channelFuture = bootstrap.group(workerGroup)
        .channel(NioSocketChannel.class)
        .option(ChannelOption.SO_KEEPALIVE, true)
        .handler(new ChannelInitializer<Channel>(){
            @Override
            protected void initChannel(Channel ch) throws Exception {
                ch.pipeline()
                        .addLast(new LoggingHandler(LogLevel.INFO))
                        .addLast(new CalculateRequestEncoder())
                        .addLast(new CalculateResponseDecoder())
                        .addLast(new RpcClientHandler());
            }
        })
        .connect(RpcConstant.ADDRESS, port)
        .syncUninterruptibly();
```

netty 中的 handler 泳道设计的非常优雅，让我们的代码可以非常灵活地进行拓展。

接下来我们看一下对应的实现。

## RpcClientHandler

```java
package com.github.houbb.rpc.client.handler;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.core.RpcClient;
import com.github.houbb.rpc.common.model.CalculateRequest;
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

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        CalculateRequest request = new CalculateRequest(1, 2);

        ctx.writeAndFlush(request);
        log.info("[Client] request is :{}", request);
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        CalculateResponse response = (CalculateResponse)msg;
        log.info("[Client] response is :{}", response);
    }

}
```

这里比较简单，channelActive 中我们直接发起调用，入参的对象为了简单，此处固定写死。

channelRead0 中监听服务端的相应结果，并做日志输出。

## CalculateRequestEncoder

请求参数是一个对象，netty 是无法直接传输的，我们将其转换为基本对象：

```java
package com.github.houbb.rpc.client.encoder;

import com.github.houbb.rpc.common.model.CalculateRequest;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;

/**
 * @author binbin.hou
 * @since 0.0.3
 */
public class CalculateRequestEncoder extends MessageToByteEncoder<CalculateRequest> {

    @Override
    protected void encode(ChannelHandlerContext ctx, CalculateRequest msg, ByteBuf out) throws Exception {
        int one = msg.getOne();
        int two = msg.getTwo();

        out.writeInt(one);
        out.writeInt(two);
    }

}
```

## CalculateResponseDecoder

针对服务端的响应，也是同理。

我们需要把基本的类型，封装转换为我们需要的对象。

```java
package com.github.houbb.rpc.client.decoder;

import com.github.houbb.rpc.common.model.CalculateResponse;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;

import java.util.List;

/**
 * 响应参数解码
 * @author binbin.hou
 * @since 0.0.3
 */
public class CalculateResponseDecoder extends ByteToMessageDecoder {

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        boolean success = in.readBoolean();
        int sum = in.readInt();

        CalculateResponse response = new CalculateResponse(success, sum);
        out.add(response);
    }

}
```

# 服务端

## 设置处理类

RpcServer 中的处理类要稍微调整一下，其他的保持不变。

```java
ServerBootstrap serverBootstrap = new ServerBootstrap();
serverBootstrap.group(workerGroup, bossGroup)
        .channel(NioServerSocketChannel.class)
        // 打印日志
        .handler(new LoggingHandler(LogLevel.INFO))
        .childHandler(new ChannelInitializer<Channel>() {
            @Override
            protected void initChannel(Channel ch) throws Exception {
                ch.pipeline()
                        .addLast(new CalculateRequestDecoder())
                        .addLast(new CalculateResponseEncoder())
                        .addLast(new RpcServerHandler());
            }
        })
        // 这个参数影响的是还没有被accept 取出的连接
        .option(ChannelOption.SO_BACKLOG, 128)
        // 这个参数只是过一段时间内客户端没有响应，服务端会发送一个 ack 包，以判断客户端是否还活着。
        .childOption(ChannelOption.SO_KEEPALIVE, true);
```

## RpcServerHandler

一开始这里是空实现，我们来添加一下对应的实现。

```java
package com.github.houbb.rpc.server.handler;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.common.model.CalculateRequest;
import com.github.houbb.rpc.common.model.CalculateResponse;
import com.github.houbb.rpc.common.service.Calculator;
import com.github.houbb.rpc.server.service.CalculatorService;
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

        CalculateRequest request = (CalculateRequest)msg;
        log.info("[Server] receive channel {} request: {} from ", id, request);

        Calculator calculator = new CalculatorService();
        CalculateResponse response = calculator.sum(request);

        // 回写到 client 端
        ctx.writeAndFlush(response);
        log.info("[Server] channel {} response {}", id, response);
    }

}
```

读取到客户端的访问之后，我们获取到计算的入参 CalculateRequest，然后调用 sum 方法，获取到对应的 CalculateResponse，将结果通知客户端。

## CalculateRequestDecoder

这里和客户端是一一对应的，我们首先把 netty 传递的基本类型转换为 CalculateRequest 对象。

```java
package com.github.houbb.rpc.server.decoder;

import com.github.houbb.rpc.common.model.CalculateRequest;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;

import java.util.List;

/**
 * 请求参数解码
 * @author binbin.hou
 * @since 0.0.3
 */
public class CalculateRequestDecoder extends ByteToMessageDecoder {

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        int one = in.readInt();
        int two = in.readInt();

        CalculateRequest request = new CalculateRequest(one, two);
        out.add(request);
    }

}
```

## CalculateResponseEncoder

这里和客户端类似，我们需要把 response 转换为基本类型进行网络传输。

```java
package com.github.houbb.rpc.server.encoder;

import com.github.houbb.rpc.common.model.CalculateResponse;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;

/**
 * @author binbin.hou
 * @since 0.0.3
 */
public class CalculateResponseEncoder extends MessageToByteEncoder<CalculateResponse> {

    @Override
    protected void encode(ChannelHandlerContext ctx, CalculateResponse msg, ByteBuf out) throws Exception {
        boolean success = msg.isSuccess();
        int result = msg.getSum();
        out.writeBoolean(success);
        out.writeInt(result);
    }

}
```

## CalculatorService

服务端对应的实现类。

```java
public class CalculatorService implements Calculator {

    @Override
    public CalculateResponse sum(CalculateRequest request) {
        int sum = request.getOne()+request.getTwo();

        return new CalculateResponse(true, sum);
    }

}
```

# 测试

## 服务端

启动服务端：

```java
new RpcServer().start();
```

服务端启动日志：

```
[DEBUG] [2021-10-05 11:53:11.795] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 11:53:11.807] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务开始启动服务端
十月 05, 2021 11:53:13 上午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0xd399474f] REGISTERED
十月 05, 2021 11:53:13 上午 io.netty.handler.logging.LoggingHandler bind
信息: [id: 0xd399474f] BIND: 0.0.0.0/0.0.0.0:9527
十月 05, 2021 11:53:13 上午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0xd399474f, L:/0:0:0:0:0:0:0:0:9527] ACTIVE
[INFO] [2021-10-05 11:53:13.101] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务端启动完成，监听【9527】端口
```

## 客户端

启动客户端：

```java
new RpcClient().start();
```

日志如下：

```
[DEBUG] [2021-10-05 11:54:12.158] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 11:54:12.164] [Thread-0] [c.g.h.r.c.c.RpcClient.run] - RPC 服务开始启动客户端
十月 05, 2021 11:54:13 上午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0x4d75c580] REGISTERED
十月 05, 2021 11:54:13 上午 io.netty.handler.logging.LoggingHandler connect
信息: [id: 0x4d75c580] CONNECT: /127.0.0.1:9527
十月 05, 2021 11:54:13 上午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0x4d75c580, L:/127.0.0.1:54030 - R:/127.0.0.1:9527] ACTIVE
[INFO] [2021-10-05 11:54:13.403] [Thread-0] [c.g.h.r.c.c.RpcClient.run] - RPC 服务启动客户端完成，监听端口：9527
十月 05, 2021 11:54:13 上午 io.netty.handler.logging.LoggingHandler write
信息: [id: 0x4d75c580, L:/127.0.0.1:54030 - R:/127.0.0.1:9527] WRITE: 8B
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 00 00 00 01 00 00 00 02                         |........        |
+--------+-------------------------------------------------+----------------+
十月 05, 2021 11:54:13 上午 io.netty.handler.logging.LoggingHandler flush
信息: [id: 0x4d75c580, L:/127.0.0.1:54030 - R:/127.0.0.1:9527] FLUSH
[INFO] [2021-10-05 11:54:13.450] [nioEventLoopGroup-2-1] [c.g.h.r.c.c.RpcClient.channelActive] - [Client] request is :CalculateRequest{one=1, two=2}
十月 05, 2021 11:54:13 上午 io.netty.handler.logging.LoggingHandler channelRead
信息: [id: 0x4d75c580, L:/127.0.0.1:54030 - R:/127.0.0.1:9527] READ: 5B
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 01 00 00 00 03                                  |.....           |
+--------+-------------------------------------------------+----------------+
十月 05, 2021 11:54:13 上午 io.netty.handler.logging.LoggingHandler channelReadComplete
信息: [id: 0x4d75c580, L:/127.0.0.1:54030 - R:/127.0.0.1:9527] READ COMPLETE
[INFO] [2021-10-05 11:54:13.508] [nioEventLoopGroup-2-1] [c.g.h.r.c.c.RpcClient.channelRead0] - [Client] response is :CalculateResponse{success=true, sum=3}
```

可以看到，输出了对应的请求参数和响应结果。

当然，此时服务端也有对应的新增日志：

```
十月 05, 2021 11:54:13 上午 io.netty.handler.logging.LoggingHandler channelRead
信息: [id: 0xd399474f, L:/0:0:0:0:0:0:0:0:9527] READ: [id: 0xbc9f5927, L:/127.0.0.1:9527 - R:/127.0.0.1:54030]
十月 05, 2021 11:54:13 上午 io.netty.handler.logging.LoggingHandler channelReadComplete
信息: [id: 0xd399474f, L:/0:0:0:0:0:0:0:0:9527] READ COMPLETE
[INFO] [2021-10-05 11:54:13.432] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelActive] - [Server] channel {} connected 00e04cfffe360988-00001d34-00000001-2a80d950d8166c0c-bc9f5927
[INFO] [2021-10-05 11:54:13.495] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 00e04cfffe360988-00001d34-00000001-2a80d950d8166c0c-bc9f5927 request: CalculateRequest{one=1, two=2} from 
[INFO] [2021-10-05 11:54:13.505] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 00e04cfffe360988-00001d34-00000001-2a80d950d8166c0c-bc9f5927 response CalculateResponse{success=true, sum=3}
```

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}
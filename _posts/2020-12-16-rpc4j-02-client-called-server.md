---
layout: post
title:  java 从零实现 rpc（二）客户端调用服务端
date:  2020-12-16 22:11:27 +0800
categories: [RPC]
tags: [rpc, micro service, sh]
published: true
---

# 回顾

大家好，我是老马。

我们在前面学习了 [5 分钟入门 spring cloud 实战笔记](https://www.toutiao.com/i6906136436756840968/) 和 [dubbo 2.7 的 3种入门案例实战](https://www.toutiao.com/i6906507244977127950/)，
小伙伴肯定对 rpc 有了基本的认识。

系列目录：

[java 从零实现 RPC（一）服务端与客户端启动](https://www.toutiao.com/i6906867178591535630/)

# 服务对象调用

上一节为了便于大家理解，实际上只是启动了服务端和客户端，但是二者之间没有任何交互。

这一节让我们一起来学习下实现客户端调用服务端。

## 功能

实现 Client 端到服务端之间的固定服务 pojo 调用。

# 接口

## 服务

我们希望实现一个计算功能。

```java
public interface Calculator {

    /**
     * 计算加法
     * @param request 请求入参
     * @return 返回结果
     */
    CalculateResponse sum(final CalculateRequest request);

}
```

- 服务端实现

```java
public class CalculatorService implements Calculator {

    @Override
    public CalculateResponse sum(CalculateRequest request) {
        int sum = request.getOne()+request.getTwo();

        return new CalculateResponse(true, sum);
    }

}
```

## pojo 信息

入参和出参如下：

- CalculateRequest.java

```java
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

    //Getter & Setter
}
```

- CalculateResponse.java

```java
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

    //Getter & Setter
}
```

# 服务端核心代码

## RpcServerHandler

主要处理客户端的调用请求。

```java
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.common.model.CalculateRequest;
import com.github.houbb.rpc.common.model.CalculateResponse;
import com.github.houbb.rpc.common.service.Calculator;
import com.github.houbb.rpc.server.service.CalculatorService;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * @author 老马啸西风
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

## 编码器 & 解码器

可以使得我们 handler 中直接操作对象即可。

- CalculateResponseEncoder.java

```java
import com.github.houbb.rpc.common.model.CalculateResponse;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;

/**
 * @author 老马啸西风
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

- CalculateRequestDecoder.java

```java
import com.github.houbb.rpc.common.model.CalculateRequest;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;

import java.util.List;

/**
 * 请求参数解码
 * @author 老马啸西风
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

## 处理类的指定

我们将上述的处理类，在服务端启动的时候进行指定：

```java
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
```

可以看到 netty 的 initChannel() 方法，可以让我们非常方便的添加各种处理类。

# 客户端核心代码

## RpcClientHandler.java

向客户端发送请求，并且处理服务端响应结果。

```java
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
 * @author 老马啸西风
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

## 编码器 & 解码器

- CalculateRequestEncoder.java

```java
import com.github.houbb.rpc.common.model.CalculateRequest;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;

/**
 * @author 老马啸西风
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

- CalculateResponseDecoder.java

```java
import com.github.houbb.rpc.common.model.CalculateResponse;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;

import java.util.List;

/**
 * 响应参数解码
 * @author 老马啸西风
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

## 处理类的指定

我们在客户端启动的时候进行指定：

```java
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

这个和服务端类似，比较简单。

# 测试代码

## 服务端启动

- 测试代码

```java
new RpcServer().start();
```

- 日志

```
[INFO] [2020-12-20 11:24:54.160] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务开始启动服务端
十二月 20, 2020 11:24:56 上午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0x89de1e73] REGISTERED
十二月 20, 2020 11:24:56 上午 io.netty.handler.logging.LoggingHandler bind
信息: [id: 0x89de1e73] BIND: 0.0.0.0/0.0.0.0:9527
十二月 20, 2020 11:24:56 上午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0x89de1e73, L:/0:0:0:0:0:0:0:0:9527] ACTIVE
[INFO] [2020-12-20 11:24:56.452] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务端启动完成，监听【9527】端口
```

## 客户端启动

- 测试代码

```java
new RpcClient().start();
```

- 日志

客户端日志如下：

```
[INFO] [2020-12-20 11:25:35.196] [nioEventLoopGroup-2-1] [c.g.h.r.c.c.RpcClient.channelActive] - [Client] request is :CalculateRequest{one=1, two=2}
十二月 20, 2020 11:25:35 上午 io.netty.handler.logging.LoggingHandler channelRead
信息: [id: 0x1bef131c, L:/127.0.0.1:51336 - R:/127.0.0.1:9527] READ: 5B
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 01 00 00 00 03                                  |.....           |
+--------+-------------------------------------------------+----------------+
十二月 20, 2020 11:25:35 上午 io.netty.handler.logging.LoggingHandler channelReadComplete
信息: [id: 0x1bef131c, L:/127.0.0.1:51336 - R:/127.0.0.1:9527] READ COMPLETE
[INFO] [2020-12-20 11:25:35.262] [nioEventLoopGroup-2-1] [c.g.h.r.c.c.RpcClient.channelRead0] - [Client] response is :CalculateResponse{success=true, sum=3}
```

服务端日志如下：

```
[INFO] [2020-12-20 11:25:35.177] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelActive] - [Server] channel {} connected 502b73fffec4485c-00002eb4-00000001-3b69b5a4d9ae582e-dd8f2794
[INFO] [2020-12-20 11:25:35.250] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 502b73fffec4485c-00002eb4-00000001-3b69b5a4d9ae582e-dd8f2794 request: CalculateRequest{one=1, two=2} from 
[INFO] [2020-12-20 11:25:35.253] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 502b73fffec4485c-00002eb4-00000001-3b69b5a4d9ae582e-dd8f2794 response CalculateResponse{success=true, sum=3}
```

可以发现，客户端已经通过网络调用服务端，并且获得了客户端的响应。

# 小结

这一节我们演示了如何实现实现客户端和服务端之间的交互，小伙伴看了之后，也要自己动手写一下。

为了便于大家学习，所有源码均已开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://mp.weixin.qq.com/s/r9F8qYw8PIcyjGR2yS0Jzg

* any list
{:toc}
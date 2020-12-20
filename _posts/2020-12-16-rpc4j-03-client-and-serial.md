---
layout: post
title:  从零手写实现 dubbo（三）客户端主动调用 & 序列化
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

[java 从零实现 rpc（二）客户端调用服务端](https://www.toutiao.com/i6908173804762268164/)

## 客户端主动调用

我们上一章的例子中，我们的调用是在客户端启动的时候完成的。

实际使用中，我们希望调用可以有客户端主动发起。

# 客户端代码

## RpcClient.java

通过 `calculate` 方法，我们就可以主动发起请求。

```java
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.decoder.CalculateResponseDecoder;
import com.github.houbb.rpc.client.encoder.CalculateRequestEncoder;
import com.github.houbb.rpc.client.handler.RpcClientHandler;

import com.github.houbb.rpc.common.constant.RpcConstant;
import com.github.houbb.rpc.common.model.CalculateRequest;
import com.github.houbb.rpc.common.model.CalculateResponse;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;

import java.util.concurrent.TimeUnit;

/**
 * <p> rpc 客户端 </p>
 *
 * <pre> Created: 2019/10/16 11:21 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * @author 老马啸西风
 * @since 0.0.2
 */
public class RpcClient {

    private static final Log log = LogFactory.getLog(RpcClient.class);

    /**
     * 监听端口号
     */
    private final int port;

    /**
     * channel 信息
     * @since 0.0.4
     */
    private ChannelFuture channelFuture;

    /**
     * 客户端处理 handler
     * @since 0.0.4
     */
    private RpcClientHandler channelHandler;

    public RpcClient(int port) {
        this.port = port;
    }

    public RpcClient() {
        this(RpcConstant.PORT);
    }

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

## RpcClientHandler.java

客户端处理类，编码解码和上次一样。

```java
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
 * @author 老马啸西风
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

## CalculatorProxy.java

计算的代理实现。

```java
import com.github.houbb.rpc.client.core.RpcClient;
import com.github.houbb.rpc.common.model.CalculateRequest;
import com.github.houbb.rpc.common.model.CalculateResponse;
import com.github.houbb.rpc.common.service.Calculator;

/**
 * @author 老马啸西风
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

# 测试代码

## 服务端

和原来一样，此处不再赘述。

直接启动即可。

## 客户端

- 代码

我们主动发起一次调用。

```java
import com.github.houbb.rpc.client.proxy.CalculatorProxy;
import com.github.houbb.rpc.common.model.CalculateRequest;
import com.github.houbb.rpc.common.model.CalculateResponse;
import com.github.houbb.rpc.common.service.Calculator;
import org.junit.Ignore;

import java.util.concurrent.TimeUnit;

/**
 * rpc 客户端测试代码
 * @author 老马啸西风
 * @since 0.0.2
 */
@Ignore
public class RpcClientTest {

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
}
```

- 日志

```
[DEBUG] [2019-11-01 14:48:33.523] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2019-11-01 14:48:33.527] [main] [c.g.h.r.c.c.RpcClient.start] - RPC 服务开始启动客户端
[INFO] [2019-11-01 14:48:34.546] [main] [c.g.h.r.c.c.RpcClient.start] - RPC 服务启动客户端完成，监听端口：9527
[INFO] [2019-11-01 14:48:34.548] [main] [c.g.h.r.c.c.RpcClient.calculate] - RPC 客户端发送请求，request: CalculateRequest{one=5, two=6}
[INFO] [2019-11-01 14:48:34.600] [nioEventLoopGroup-2-1] [c.g.h.r.c.c.RpcClient.channelRead0] - [Client] response is :CalculateResponse{success=true, sum=11}
rpc call result: CalculateResponse{success=true, sum=11}
```

# 序列化

## 为什么需要序列化

netty 底层都是基于 ByteBuf 进行通讯的。

前面我们通过编码器/解码器专门为计算的入参/出参进行处理，这样方便我们直接使用 pojo。

但是有一个问题，如果想把我们的项目抽象为框架，那就需要为所有的对象编写编码器/解码器。

显然，直接通过每一个对象写一对的方式是不现实的，而且用户如何使用，也是未知的。

## 序列化的方式

基于字节的实现，性能好，可读性不高。

基于字符串的实现，比如 json 序列化，可读性好，性能相对较差。

## 实现思路

可以将我们的 Pojo 全部转化为 byte，然后 Byte 转换为 ByteBuf 即可。

反之亦然。

# 代码实现

## 序列化 jar 依赖

这里依赖的是老马自己写的 json 工具，大家也可以选择 FastJSON/GJSON 等其他常用的序列化工具。

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>json</artifactId>
    <version>0.1.1</version>
</dependency>
```

## 服务端

服务端的序列化/反序列化调整为直接使用 JsonBs 实现。

```java
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

客户端的序列化/反序列化调整为直接使用 JsonBs 实现。

```java
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
 * @author 老马啸西风
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

这一节我们演示了如何实现实现客户端主动调用服务端，这样才更加符合实际的使用情况。

为了后续框架的便利性，我们将序列化也整合到本节进行讲解。

小伙伴看了之后，也要自己动手写一下。

为了便于大家学习，所有源码均已开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://mp.weixin.qq.com/s/r9F8qYw8PIcyjGR2yS0Jzg

* any list
{:toc}
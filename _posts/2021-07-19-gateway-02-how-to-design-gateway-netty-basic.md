---
layout: post
title: netty 如何实现作为 http 的服务端和客户端？
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, spring-cloud, gateway-topic, sh]
published: true
---

# netty 模拟 HTTP 客户端与服务端

发送的请求以HTTP请求为主，本例就以Netty4来实现一个接收HTTP请求的服务器，并根据用户请求返回响应

## 1.Netty中HTTP请求和响应类

### 请求（FullHttpRequest）

```java
/**
 * Combine the {@link HttpRequest} and {@link FullHttpMessage}, so the request is a <i>complete</i> HTTP
 * request.
 */
public interface FullHttpRequest extends HttpRequest, FullHttpMessage {
```

可以看到，它结合了HttpRequest、FullHttpMessag，作为一个完整的HTTP请求体。

默认实现为DefaultFullHttpRequest

### 响应（FullHttpResponse）

```java
/**
 * Combination of a {@link HttpResponse} and {@link FullHttpMessage}.
 * So it represent a <i>complete</i> http response.
 */
public interface FullHttpResponse extends HttpResponse, FullHttpMessage {
```

同样，它结合了HttpResponse、FullHttpMessage

默认实现为DefaultFullHttpResponse

## Netty中客户端、服务端的编解码器

### 作为服务端而言：

主要工作就是接收客户端请求，将客户端的请求内容解码；发送响应给客户端，并将发送内容编码

所以，服务端需要两个编解码器

* HttpRequestDecoder(将请求内容解码)

* HttpResponseEncoder(将响应内容编码)

可以简化为一个：HttpServerCodec

```java
public final class HttpServerCodec extends CombinedChannelDuplexHandler<HttpRequestDecoder, HttpResponseEncoder> implements HttpServerUpgradeHandler.SourceCodec {
```

### 作为客户端而言：

主要工作就是发送请求给服务端，并将发送内容编码；接收服务端响应，并将接收内容解码；

所以，客户端需要两个编解码器

* HttpResponseDecoder（将响应内容解码）

* HttpRequestEncoder（将请求内容编码） 

可以简化为一个：HttpClientCodec

```java
public final class HttpClientCodec extends CombinedChannelDuplexHandler<HttpResponseDecoder, HttpRequestEncoder> implements HttpClientUpgradeHandler.SourceCodec {
```

# netty 模拟实现 http 的服务端

## 说明

通过 netty 模拟实现一个服务端，接收用户的请求，并且直接返回。

## 代码实现

### 

```java
package com.github.houbb.netty.gateway.learn;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpRequestDecoder;
import io.netty.handler.codec.http.HttpResponseEncoder;

/**
 * @author dh
 */
public class NettyGatewayServer {
    private final int port;

    public NettyGatewayServer(int port) {
        this.port = port;
    }

    public void start() throws Exception {
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) throws Exception {
                            ChannelPipeline p = ch.pipeline();
                            // 添加 HttpRequestDecoder，用于将字节流解码成 HttpRequest 对象
                            p.addLast(new HttpRequestDecoder());

                            // 添加 HttpObjectAggregator，用于将多个 HttpContent 对象合并成一个 FullHttpRequest 对象
                            p.addLast(new HttpObjectAggregator(65536));

                            // 添加 HttpResponseEncoder，用于将 HttpResponse 对象编码成字节流
                            p.addLast(new HttpResponseEncoder());

                            // 添加处理器
                            p.addLast(new NettyGatewayServerHandler());
                        }
                    })
                    .option(ChannelOption.SO_BACKLOG, 128)
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            // 启动服务器
            ChannelFuture f = b.bind(port).sync();

            System.out.println("服务端准备在 port 启动完成" + port);

            // 等待服务器套接字关闭
            f.channel().closeFuture().sync();
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        System.out.println("服务端准备在 port 启动完成" + port);
        NettyGatewayServer server = new NettyGatewayServer(port);
        server.start();
    }

}
```

### NettyGatewayServerHandler 处理器

处理接收对应的 FullHttpRequest 请求，然后直接给响应一个 "echo from gateway!!!" 字符串。

```java
package com.github.houbb.netty.gateway.learn;

import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.*;
import io.netty.util.CharsetUtil;

import java.net.URISyntaxException;


public class NettyGatewayServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws URISyntaxException {
        // 处理请求
        if(!(msg instanceof FullHttpRequest)) {
            // 不是完整的 http 请求，直接触发，然后结束。
            System.out.println("---------------- 不是合格的 http 请求，直接忽略丢弃");
            ctx.fireChannelRead(msg);
            return;
        }

        if (msg instanceof FullHttpRequest) {
            FullHttpRequest request = (FullHttpRequest) msg;
            HttpMethod method = request.getMethod();

            if (!method.equals(HttpMethod.GET)) { // 非 GET 方法不处理
                sendError(ctx, HttpResponseStatus.METHOD_NOT_ALLOWED);
                return;
            }

            // 直接把响应返回给客户端
            response(ctx, "echo from gateway!!!");
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        // 异常处理
        cause.printStackTrace();
        ctx.close();
    }

    /**
     * 直接响应给客户端
     * @param ctx 上下文
     * @param content 响应内容
     */
    private void response(ChannelHandlerContext ctx, String content) {
        FullHttpResponse resp = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1,
                HttpResponseStatus.OK,
                Unpooled.copiedBuffer(content, CharsetUtil.UTF_8));

        // 请求头设置
        resp.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/html; charset=UTF-8");

        // 2.发送
        // 注意必须在使用完之后，close channel
        ctx.writeAndFlush(resp).addListener(ChannelFutureListener.CLOSE);
    }

    /**
     * 发送失败
     * @param ctx
     * @param status
     */
    private void sendError(ChannelHandlerContext ctx, HttpResponseStatus status) {
        FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, status);
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain; charset=UTF-8");
        response.content().writeBytes(status.toString().getBytes());
        ctx.writeAndFlush(response);
    }

}
```

## 测试

浏览器直接访问 [http://localhost:8080/test](http://localhost:8080/test)

可以直接请求到上面的服务，页面返回 echo from gateway!!!

# netty 实现 http 客户端

## 说明

一般http请求，我们会使用httpclient来实现连接池方式的连接，根据请求的类型，封装get,post等请求，设置参数，设置请求头，调用方法，发送请求之后等待请求返回结果，根据结果解析出我们需要的数据。netty也可以实现httpclient类似的功能，只不过，很多时候，我们使用netty构建tcp的连接，要么使用netty构建http服务端，很少用来构建http客户端，其实和tcp客户端类似，构建http客户端也很简单，但是需要注意的是，请求以及响应的相对关系处理。

使用netty构建http客户端，我们需要在pipeline这里加入请求编码器，响应解码器，以及发送请求和处理响应的handler。

在发送请求的时候，我们需要构造FullHttpRequest，设置uri,header等信息，然后就可以通过ctx.writeAndFlush(request)调用即可。

另外当我们处理channelRead()即获取响应的时候，需要对响应体做类型转换，一般来说我们得到的msg是FullHttpResponse。

本人在编写netty实现http客户端程序的时候，发现当我使用http1.1类型的时候，无论如何，都无法正确请求springboot项目的方法，channelRead()方法倒是会收到数据，请求状态码总是400，很纳闷，这不是参数错误么，后来就把http1.1改为了http1.0，请求正常，返回了正确结果，但是结果里显示http1.1，也是很奇怪。

准备工作，如下所示，本机开启一个springboot服务，开启一个接口http://localhost:8081/user/get，在命令行下，模拟发送请求，响应如下：

## 代码

代码如下所示，主要的方法中一个简单的group,bootstrap，然后设置childHandler,在childHandler中再设置处理请求和响应相关的decoder,encoder,handler。

### HttpClient.java

```java
package com.github.houbb.netty.gateway.learn.client;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.http.*;

import java.net.URI;
import java.net.URISyntaxException;

public class MyHttpClient {

    /**
     *
     * 这里有一个问题，fullRequest 每次不同，所以必须每一次都要构建对应的链接吗？
     * 可以提前处理吗？
     *
     *
     * @param host 地址
     * @param port 端口
     * @param fullHttpRequest 完整的请求
     * @since 1.0.0
     */
    public static void sendRequest(String host, int port, FullHttpRequest fullHttpRequest){
        EventLoopGroup group = new NioEventLoopGroup();
        Bootstrap bootstrap = new Bootstrap();
        try {
            bootstrap.group(group)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.SO_KEEPALIVE, true)
                    .handler(new ChannelInitializer<Channel>() {
                        @Override
                        protected void initChannel(Channel channel)
                                throws Exception {
                            //channel.pipeline().addLast(new HttpRequestEncoder());
                            //channel.pipeline().addLast(new HttpResponseDecoder());
                            channel.pipeline().addLast(new HttpClientCodec());
                            channel.pipeline().addLast(new HttpObjectAggregator(65536));
                            channel.pipeline().addLast(new HttpContentDecompressor());
                            channel.pipeline().addLast(new MyHttpClientHandler(fullHttpRequest));
                        }
                    });
            ChannelFuture future = bootstrap.connect(host, port).sync();
            future.channel().closeFuture().sync();
        } catch (Exception e) {
            e.printStackTrace();
        }finally{
            group.shutdownGracefully();
        }
    }

    private static FullHttpRequest buildGetRequest() {
        try {
            URI uri = new URI("/test");
            FullHttpRequest request = new DefaultFullHttpRequest(HttpVersion.HTTP_1_0, HttpMethod.GET, uri.toASCIIString());
            request.headers().add(HttpHeaderNames.CONNECTION,HttpHeaderValues.KEEP_ALIVE);
            request.headers().add(HttpHeaderNames.CONTENT_LENGTH,request.content().readableBytes());

            return request;
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) {
        // 调用指定的服务端信息
        FullHttpRequest request = buildGetRequest();
        sendRequest("127.0.0.1", 8081, request);
    }

}
```

### MyHttpClientHandler

```java
package com.github.houbb.netty.gateway.learn.client;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.util.CharsetUtil;

public class MyHttpClientHandler extends ChannelInboundHandlerAdapter {

    private final FullHttpRequest request;

    public MyHttpClientHandler(FullHttpRequest request) {
        this.request = request;
    }

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // 触发请求
        ctx.writeAndFlush(request);
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg)
            throws Exception {
        System.out.println("接收到完整的响应：msg -> "+msg);
        if(msg instanceof FullHttpResponse){
            FullHttpResponse response = (FullHttpResponse)msg;
            ByteBuf buf = response.content();
            String result = buf.toString(CharsetUtil.UTF_8);

            // 接收到 http 服务端的响应
            System.out.println("response -> "+result);
        }

        // 其他的处理
    }

}
```

### 测试的服务端

main 方法中会请求 http://localhost:8081/test 地址。

服务端对应的代码很简单，一个基于 springboot 实现的 http 服务

```java
@RestController
public class MonitorController {

    @RequestMapping(value = "test")
    public String test() {
        System.out.println("-------------------------------- 我被请求啦！！！！！！！！");
        return "backend-test";
    }

}
```

## 测试

1）首先启动 springboot 的 http 服务。

2）然后启动基于 netty 的测试 main 方法

日志如下：

```
接收到完整的响应：msg -> HttpObjectAggregator$AggregatedFullHttpResponse(decodeResult: success, version: HTTP/1.1, content: CompositeByteBuf(ridx: 0, widx: 12, cap: 12, components=1))
HTTP/1.1 200 OK
Server: Apache-Coyote/1.1
Content-Type: text/plain;charset=UTF-8
Date: Mon, 24 Apr 2023 01:59:04 GMT
Connection: keep-alive
content-length: 12
response -> backend-test
```

可以看到受到了完整的响应，输出对应的 response 为简单的字符串 backend-test。

# 参考资料

[Netty4之如何实现HTTP请求、响应](https://www.jb51.net/article/280011.htm)

https://blog.csdn.net/u014209205/article/details/100097388

https://www.jianshu.com/p/185023e22dbc

https://www.cnblogs.com/w1570631036/p/9665385.html

[netty实现http客户端请求远程http服务](https://blog.csdn.net/feinifi/article/details/102981475)

https://github.com/lfz757077613/RocketHttp

https://cloud.tencent.com/developer/article/1940307

[Netty实战5——Netty实现HTTP客户端](https://blog.csdn.net/feinifi/article/details/102981475)

* any list
{:toc}
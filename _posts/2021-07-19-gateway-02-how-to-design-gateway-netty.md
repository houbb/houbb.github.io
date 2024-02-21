---
layout: post
title: 如何基于 Netty 实现简单的 gateway 网关？
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, spring-cloud, gateway-topic, sh]
published: true
---

# java 如何通过 netty 实现一个网关

要通过Netty实现一个网关，可以遵循以下步骤：

1. 创建一个Netty服务器。这可以使用Netty提供的Bootstrap类来完成。通过创建一个ServerBootstrap实例，你可以配置服务器的参数，例如端口、线程池和ChannelInitializer等。

2. 在ChannelInitializer中添加一个ChannelHandler。该处理器将处理传入的数据并将其转发到下一个步骤。例如，你可以使用HttpRequestDecoder和HttpResponseEncoder等编解码器来处理HTTP请求和响应。还可以添加其他的自定义处理器。

3. 配置网关规则。网关应该定义转发规则，例如将请求转发到后端服务器、路由请求到指定的路径或拦截请求以进行安全验证等。

4. 实现负载均衡。如果你有多个后端服务器，则可以使用负载均衡算法将请求平均分配给每个后端服务器，以提高系统的可扩展性和稳定性。

5. 实现监控和日志记录。可以使用Netty提供的一些工具来监控网关的性能和处理情况，并将日志记录到本地或远程存储中，以便于分析和排查问题。

总的来说，使用Netty实现一个网关需要具备一定的网络编程知识和对Netty框架的理解。建议先了解Netty的基本概念和使用方法，再逐步实现一个简单的网关，逐步加深对Netty的理解和掌握程度。

## 推荐阅读

如果你对 netty 不是很熟悉，推荐阅读：

> [netty 如何实现作为 http 的服务端和客户端？](https://houbb.github.io/2018/11/21/gateway-02-how-to-design-gateway-netty-basic)

> [如何从零实现属于自己的 API 网关？](https://houbb.github.io/2018/11/21/gateway-02-how-to-design-gateway)

# 代码实现

PS: 此处为了简单，日志输出通过控台，仅作为演示。

## 服务端

- GatewayServer.java

通过 netty 作为服务端，接收处理 http 请求。

```java
package com.github.houbb.netty.gateway.learn.gateway;

import com.github.houbb.netty.gateway.learn.server.MyHttpServerHandler;
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
public class GatewayServer {
    private final int port;

    public GatewayServer(int port) {
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
                            p.addLast(new GatewayServerHandler());
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
        GatewayServer server = new GatewayServer(port);
        server.start();
    }

}
```

- GatewayServerHandler.java

```java
package com.github.houbb.netty.gateway.learn.gateway;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.FullHttpRequest;

import java.net.URISyntaxException;


public class GatewayServerHandler extends ChannelInboundHandlerAdapter {

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

            // 模拟 client，转发请求
            IGatewayClient gatewayClient = new GatewayClient();
            gatewayClient.sendRequest(request, ctx);
        }

        // 其他操作
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        // 异常处理
        cause.printStackTrace();
        ctx.close();
    }

}
```

这里通过客户端调用，进行了一次请求转发。

## 客户端

- IGatewayClient.java

接口定义

```java
package com.github.houbb.netty.gateway.learn.gateway;

import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.FullHttpRequest;

public interface IGatewayClient {

    /**
     * 发送请求
     * @param httpRequest 请求
     * @param ctx 上下文
     * @since 1.0.0
     */
    void sendRequest(FullHttpRequest httpRequest,
                     ChannelHandlerContext ctx);

}
```

- GatewayClient.java

客户端实现：

```java
package com.github.houbb.netty.gateway.learn.gateway;

import com.github.houbb.netty.gateway.learn.client.MyHttpClientHandler;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.http.*;

import java.net.URI;
import java.net.URISyntaxException;

public class GatewayClient implements IGatewayClient {

    @Override
    public void sendRequest(FullHttpRequest httpRequest, ChannelHandlerContext ctx) {
        // 构建为新的 request
        URI uri = buildUri(httpRequest);
        FullHttpRequest actualRequest = buildFullHttpRequest(httpRequest);

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
                            channel.pipeline().addLast(new GatewayClientHandler(actualRequest, ctx));
                        }
                    });
            ChannelFuture future = bootstrap.connect(uri.getHost(), uri.getPort()).sync();
            future.channel().closeFuture().sync();
        } catch (Exception e) {
            e.printStackTrace();
        }finally{
            group.shutdownGracefully();
        }
    }

    /**
     * 构建新的请求
     *
     * 1. 后续可以添加新的一些数据，比如请求头等。
     *
     * @param rawHttpRequest 请求
     * @return 结果
     */
    private FullHttpRequest buildFullHttpRequest(FullHttpRequest rawHttpRequest) {
        FullHttpRequest request = new DefaultFullHttpRequest(rawHttpRequest.protocolVersion(),
                rawHttpRequest.getMethod(),
                rawHttpRequest.getUri(),
                rawHttpRequest.content(),
                rawHttpRequest.headers(),
                rawHttpRequest.trailingHeaders());

        //TODO: 可以加新的
        return request;
    }

    /**
     * 构建的 URI
     * @param request 请求
     * @return 结果
     */
    private URI buildUri(FullHttpRequest request) {
        try {
            //TODO: 后续改成从配置中获取信息

            String REMOTE_HOST = "http://localhost:8081";
            URI originalUri = URI.create(request.getUri());
            String remoteUri = REMOTE_HOST + originalUri.getPath(); // 组装目标 URI
            URI uri = new URI(remoteUri);
            System.out.println("------------------ 远程的地址：" + remoteUri);
            return uri;
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

}
```

这里因为仅作为演示，所以转发的地址暂时是写死的，后续可以通过空调配置等，进一步提升灵活性。

- GatewayClientHandler.java

```java
package com.github.houbb.netty.gateway.learn.gateway;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.util.CharsetUtil;

public class GatewayClientHandler extends ChannelInboundHandlerAdapter {

    /**
     * 构建好的请求
     */
    private final FullHttpRequest request;

    /**
     * 原始的服务端上下文
     */
    private final ChannelHandlerContext serverContext;

    public GatewayClientHandler(FullHttpRequest request, ChannelHandlerContext serverContext) {
        this.request = request;
        this.serverContext = serverContext;
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

            // 直接写回到服务端
            FullHttpResponse actualResponse = buildFullHttpResponse(response);
            serverContext.writeAndFlush(actualResponse)
                    .addListener(ChannelFutureListener.CLOSE);
            System.out.println("========================== 服务端写回原始的请求。");
        }

        // 关闭原始的请求
        ctx.close();
        System.out.println("========================== 客户端 ctx 关闭");
    }

    /**
     * 构建新的响应结果
     * @param originalResponse 原始响应
     * @return 结果
     * @since 1.0.0
     */
    private FullHttpResponse buildFullHttpResponse(FullHttpResponse originalResponse) {
        FullHttpResponse response = new DefaultFullHttpResponse(originalResponse.getProtocolVersion(),
                originalResponse.getStatus(),
                originalResponse.content(),
                originalResponse.headers(),
                originalResponse.trailingHeaders());

        return response;
    }

}
```

这里需要把客户端模拟调用的结果，回写到 server 的 ctx 中。

客户端的 ctx 也必须要关闭，不然请求会卡主。

## 测试

### 后端 http 服务

基于 springboot 实现一个简单的 http 服务。

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

### 准备工作

1）启用 springboot 的 http 服务

2）启用 GatewayServer#main 方法

### 测试

通过浏览器，直接访问网关 [http://localhost:8080/test](http://localhost:8080/test)

请求会首先通过网关，然后转发调用后端 http 服务，最后把结果通过网关回给浏览器前端。

# 后续深入考虑的一些问题

如何控台配置结合？

如何设置多个域名？

如何配置规则？

请求超时怎么办？

如何直接返回 404？

如何请求重定向？

设置生效的时间。

# 参考资料

[聊聊API网关的作用](https://www.cnblogs.com/coolfiry/p/8193768.html)

* any list
{:toc}
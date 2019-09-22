---
layout: post
title: Netty 权威指南-07-Netty example http hello world
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# 例子说明

An HTTP server that sends back the content of the received HTTP request in a pretty plaintext form.

# 源码

## HttpHelloWorldServer.java

这里指定了打印后台的日志信息。

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.HttpServerExpectContinueHandler;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;

public class HttpHelloWorldServer {

    public static void main(String[] args) {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            ChannelFuture channelFuture = serverBootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .option(ChannelOption.SO_BACKLOG, 1024)
                    .handler(new LoggingHandler(LogLevel.INFO))
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new HttpServerCodec(),
                                    new HttpServerExpectContinueHandler(),
                                    new HttpHelloWorldServerHandler());
                        }
                    })
                    .bind(8889)
                    .syncUninterruptibly();

            channelFuture.channel().closeFuture().syncUninterruptibly();
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }

    }

}
```

## HttpHelloWorldServerHandler.java

```java
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpHeaderNames;
import io.netty.handler.codec.http.HttpHeaderValues;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpUtil;

/**
 * <p> </p>
 *
 * <pre> Created: 2019/9/22 11:07 AM  </pre>
 * <pre> Project: netty-learn  </pre>
 *
 * @author houbinbin
 */
public class HttpHelloWorldServerHandler extends SimpleChannelInboundHandler<HttpObject> {

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        // 刷新内容
        ctx.flush();
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, HttpObject msg) throws Exception {
        if(msg instanceof HttpRequest) {
            HttpRequest req = (HttpRequest) msg;

            boolean keepAlive = HttpUtil.isKeepAlive(req);

            FullHttpResponse response = new DefaultFullHttpResponse(req.protocolVersion(), HttpResponseStatus.OK,
                    Unpooled.wrappedBuffer("HelloWorld".getBytes()));

            // 设置头信息
            response.headers().set(HttpHeaderNames.CONTENT_TYPE, HttpHeaderValues.TEXT_PLAIN);
            response.headers().setInt(HttpHeaderNames.CONTENT_LENGTH, response.content().readableBytes());

            if(keepAlive) {
                // 如果默认不是 keep alive
                if(!req.protocolVersion().isKeepAliveDefault()) {
                    response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
                } else {
                    // Tell the client we're going to close the connection.
                    response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.CLOSE);
                }
            }

            // 写回响应
            ChannelFuture f = ctx.write(response);
            if(!keepAlive) {
                f.addListener(ChannelFutureListener.CLOSE);
            }
        }
    }

}
```

## 测试

- 启动服务端

日志输出如下：

```
九月 22, 2019 11:18:47 上午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0x891a31aa] REGISTERED
九月 22, 2019 11:18:47 上午 io.netty.handler.logging.LoggingHandler bind
信息: [id: 0x891a31aa] BIND: 0.0.0.0/0.0.0.0:8889
九月 22, 2019 11:18:47 上午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0x891a31aa, L:/0:0:0:0:0:0:0:0:8889] ACTIVE
```

- 浏览器访问

[http://localhost:8889/](http://localhost:8889/)

页面返回 

```
HelloWorld
```

此处服务器新增日志如下：

```
九月 22, 2019 11:20:42 上午 io.netty.handler.logging.LoggingHandler channelRead
信息: [id: 0x891a31aa, L:/0:0:0:0:0:0:0:0:8889] READ: [id: 0xc6ffb869, L:/0:0:0:0:0:0:0:1:8889 - R:/0:0:0:0:0:0:0:1:61632]
九月 22, 2019 11:20:42 上午 io.netty.handler.logging.LoggingHandler channelReadComplete
信息: [id: 0x891a31aa, L:/0:0:0:0:0:0:0:0:8889] READ COMPLETE
九月 22, 2019 11:20:42 上午 io.netty.handler.logging.LoggingHandler channelRead
信息: [id: 0x891a31aa, L:/0:0:0:0:0:0:0:0:8889] READ: [id: 0xe681d8ac, L:/0:0:0:0:0:0:0:1:8889 - R:/0:0:0:0:0:0:0:1:61633]
九月 22, 2019 11:20:42 上午 io.netty.handler.logging.LoggingHandler channelReadComplete
信息: [id: 0x891a31aa, L:/0:0:0:0:0:0:0:0:8889] READ COMPLETE
```

# 参考资料

[netty 官方例子](https://netty.io/4.1/xref/io/netty/example/http/helloworld/package-summary.html)

* any list
{:toc}
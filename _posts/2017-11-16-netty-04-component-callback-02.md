---
layout: post
title:  Netty-04-基础组件之 Callback
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# Callback 入门例子

## 代码

- TestServer

```java
package com.github.houbb.netty.inaction.components.callback;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

public class TestServer {
    public static void main(String[] args) throws Exception{
        /**
         * 死循环 线程组
         * NioEventLoopGroup 是用来处理I/O操作的线程池，Netty对 EventLoopGroup 接口针对不同的传输协议提供了不同的实现。
         * 在本例子中，需要实例化两个NioEventLoopGroup，通常第一个称为“boss”，
         * 用来accept客户端连接，另一个称为“worker”，处理客户端数据的读写操作。
         */
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try{
            //启动服务端的类 ServerBootstrap 是启动服务的辅助类，有关socket的参数可以通过ServerBootstrap进行设置。
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)//这里指定NioServerSocketChannel类初始化channel用来接受客户端请求。
                    .childHandler(new TestServerInitializer());
            ChannelFuture channelFuture = serverBootstrap.bind(8899).sync();
            System.out.println("Netty Server listen on: 8899");
            channelFuture.channel().closeFuture().sync();
        }finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

}
```

- 建一个Initializer

```java
package com.github.houbb.netty.inaction.components.callback;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpServerCodec;

//通常会为新SocketChannel通过添加一些handler，来设置ChannelPipeline。
public class TestServerInitializer extends ChannelInitializer<SocketChannel> {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline pipeline = ch.pipeline();

        pipeline.addLast("httpServiceCodec",new HttpServerCodec());//netty自己的处理器
        pipeline.addLast("testHttpServerHandler",new TestHttpServerHandler());//自定义的处理器
    }
}
```

- TestHttpServerHandler.java

```java
package com.github.houbb.netty.inaction.components.callback;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.*;
import io.netty.util.CharsetUtil;

import java.net.URI;

public class TestHttpServerHandler extends SimpleChannelInboundHandler<HttpObject> {
    /**
     * SpringMVC由容器来判断http请求是否结束了 netty可以自己判断keepalive
     * @param ctx
     * @param msg
     * @throws Exception
     */
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, HttpObject msg) throws Exception {
        System.out.println(msg.getClass());
        System.out.println(ctx.channel().remoteAddress());
//        Thread.sleep(8000);
        if (msg instanceof HttpRequest) {
            HttpRequest httpRequest = (HttpRequest) msg;

            System.out.println("请求方法名:" + httpRequest.method().name());
            URI uri = new URI(httpRequest.uri());
            if ("/favicon.ico".equals(uri.getPath())) {
                System.out.println("请求favicon.ico");
                return;
            }

            //读取客户端的请求并返回响应
            ByteBuf content = Unpooled.copiedBuffer("Hello World", CharsetUtil.UTF_8);

            FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK, content);
            response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain");
            response.headers().set(HttpHeaderNames.CONTENT_LENGTH, content.readableBytes());

            ctx.writeAndFlush(response);
            ctx.channel().close();
        }
    }

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        System.out.println("channerl active");
        super.channelActive(ctx);
    }

    @Override
    public void channelRegistered(ChannelHandlerContext ctx) throws Exception {
        System.out.println("channelRegistered");
        super.channelRegistered(ctx);
    }

    @Override
    public void handlerAdded(ChannelHandlerContext ctx) throws Exception {
        System.out.println("handlerAdded");
        super.handlerAdded(ctx);
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        System.out.println("channelInactive");
        super.channelInactive(ctx);
    }

    @Override
    public void channelUnregistered(ChannelHandlerContext ctx) throws Exception {
        System.out.println("channelUnregistered");
        super.channelUnregistered(ctx);
    }
}
```

## 测试

### curl 

命令行执行

```
curl 'http://localhost:8899'
```

命令行信息如下：

```
handlerAdded 一个新的handler添加 新的通道
channelRegistered  注册到某个对象
channerl active  连接处于活动状态
class io.netty.handler.codec.http.DefaultHttpRequest
/0:0:0:0:0:0:0:1:60290
请求方法名:GET  请求读取
class io.netty.handler.codec.http.LastHttpContent$1
/0:0:0:0:0:0:0:1:60290
channelInactive     变成不活动状态
channelUnregistered 取消注册
```

### 浏览器

如果使用浏览器来请求 [http://localhost:8899 ](http://localhost:8899) 则有所不同

```
handlerAdded
channelRegistered
channerl active
class io.netty.handler.codec.http.DefaultHttpRequest
/0:0:0:0:0:0:0:1:60322
请求方法名:GET
class io.netty.handler.codec.http.LastHttpContent$1
/0:0:0:0:0:0:0:1:60322
class io.netty.handler.codec.http.DefaultHttpRequest
/0:0:0:0:0:0:0:1:60322
请求方法名:GET
请求favicon.ico
class io.netty.handler.codec.http.LastHttpContent$1
/0:0:0:0:0:0:0:1:60322
```

## 状态失效

可以看到并没有出现

```
channelInactive
channelUnregistered
```

当我们把浏览器关闭之后，这两行才出现，这里也体现了Netty并没有遵循Servlet规范，需要自己实现。

我们平时的SpringMVC应用运行在tomcat之上，与http请求之间的连接由tomcat来保证相应的连接断掉，但是Netty不是这样的。


# 参考资料

[Netty回调与Channel执行流程分析](https://www.jianshu.com/p/7dcb07103e7f)

[netty中的消息分发和回调](https://www.jianshu.com/p/71535aec492c)

[浅析Netty的异步事件驱动（二）](https://www.cnblogs.com/sorheart/p/3195099.html)

[Netty推荐addListener回调异步执行](https://www.jianshu.com/p/c7019a8f6c53)

* any list
{:toc}


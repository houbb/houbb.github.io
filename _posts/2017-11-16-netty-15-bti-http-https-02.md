---
layout: post
title:  Netty HTTP/HTTPS
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, http, sh]
published: true
---

# 构建基于Netty 的HTTP/HTTPS 应用程序

HTTP/HTTPS 是最常见的协议套件之一，并且随着智能手机的成功，它的应用也日益广泛，因为对于任何公司来说，拥有一个可以被移动设备访问的网站几乎是必须的。

这些协议也被用于其他方面。

许多组织导出的用于和他们的商业合作伙伴通信的 WebService API 一般也是基于HTTP（S）的。

接下来，我们来看看 Netty 提供的 ChannelHandler，你可以用它来处理HTTP 和HTTPS协议，而不必编写自定义的编解码器。

# HTTP 解码器、编码器和编解码器

HTTP 是基于请求/响应模式的：客户端向服务器发送一个HTTP 请求，然后服务器将会返回一个HTTP 响应。

Netty 提供了多种编码器和解码器以简化对这个协议的使用。

## 组成部分

图11-2 和图11-3分别展示了生产和消费HTTP 请求和HTTP 响应的方法。

![请求组成](http://www.liuhaihua.cn/wp-content/uploads/2018/09/UfaYZrQ.jpg)

![响应组成](http://www.liuhaihua.cn/wp-content/uploads/2018/09/BVfUZf3.jpg)

如图11-2 和图11-3 所示，一个HTTP 请求/响应可能由多个数据部分组成，并且它总是以一个LastHttpContent 部分作为结束。

FullHttpRequest 和FullHttpResponse 消息是特殊的子类型，分别代表了完整的请求和响应。

所有类型的HTTP 消息（FullHttpRequest、LastHttpContent 以及代码清单11-2 中展示的那些）都实现了HttpObject 接口。

## 核心 API

表 11-2 概要地介绍了处理和生成这些消息的HTTP 解码器和编码器。


- 表11-2 HTTP 解码器和编码器

```
名 称                   描 述
HttpRequestEncoder      将HttpRequest、HttpContent 和LastHttpContent 消息编码为字节
HttpResponseEncoder     将HttpResponse、HttpContent 和LastHttpContent 消息编码为字节
HttpRequestDecoder      将字节解码为HttpRequest、HttpContent 和LastHttpContent 消息
HttpResponseDecoder     将字节解码为HttpResponse、HttpContent 和LastHttpContent 消息
```

## 添加 http 支持

首先要理解，对于客户端，请求需要编码，响应需要解码。对于服务端，请求需要解码，响应需要编码。

下面直接看代码：

```java
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.handler.codec.http.HttpRequestEncoder;
import io.netty.handler.codec.http.HttpResponseDecoder;
import io.netty.handler.codec.http.HttpResponseEncoder;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class HttpChannelnitializer extends ChannelInitializer<Channel> {

    /**
     * 是否为客户端
     */
    private final boolean isClient;

    public HttpChannelnitializer(boolean isClient) {
        this.isClient = isClient;
    }

    @Override
    protected void initChannel(Channel ch) throws Exception {
        if(isClient) {
            ch.pipeline().addLast(new HttpRequestEncoder())
                    .addLast(new HttpResponseDecoder());
        } else {
            ch.pipeline().addLast(new HttpResponseDecoder())
                    .addLast(new HttpResponseEncoder());
        }
    }

}
```

# 聚合 HTTP 消息
 
在 ChannelInitializer 将 ChannelHandler 安装到 ChannelPipeline 中之后，你便可以处理不同类型的HttpObject 消息了。

但是由于 HTTP 的请求和响应可能由许多部分组成，因此你需要聚合它们以形成完整的消息。

为了消除这项繁琐的任务，Netty 提供了一个聚合器，它可以将多个消息部分合并为FullHttpRequest 或者FullHttpResponse 消息。

通过这样的方式，你将总是看到完整的消息内容。

由于消息分段需要被缓冲，直到可以转发一个完整的消息给下一个ChannelInboundHandler，所以这个操作有轻微的开销。其所带来的好处便是你不必关心消息碎片了。

引入这种自动聚合机制只不过是向ChannelPipeline 中添加另外一个ChannelHandler罢了。

## 代码示例

代码清单 11-3 展示了如何做到这一点。

- 自动聚合消息片段

```java
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.handler.codec.http.*;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class HttpAggregatorChannelnitializer extends ChannelInitializer<Channel> {

    /**
     * 是否为客户端
     */
    private final boolean isClient;

    public HttpAggregatorChannelnitializer(boolean isClient) {
        this.isClient = isClient;
    }

    @Override
    protected void initChannel(Channel ch) throws Exception {
        if(isClient) {
            ch.pipeline().addLast(new HttpClientCodec());
        } else {
            ch.pipeline().addLast(new HttpServerCodec());
        }
        // 添加聚合 handler, 最大消息为 512kb
        ch.pipeline().addLast(new HttpObjectAggregator(512 * 1024));
    }

}
```


# HTTP 压缩

当使用HTTP 时，建议开启压缩功能以尽可能多地减小传输数据的大小。

虽然压缩会带来一些CPU 时钟周期上的开销，但是通常来说它都是一个好主意，特别是对于文本数据来说。

Netty 为压缩和解压缩提供了ChannelHandler 实现，它们同时支持 gzip 和 deflate 编码。

## HTTP 请求的头部信息

客户端可以通过提供以下头部信息来指示服务器它所支持的压缩格式：

```
GET /encrypted-area HTTP/1.1
Host: www.example.com
Accept -Encoding: gzip, deflate
```

然而，需要注意的是，服务器没有义务压缩它所发送的数据。

## 示例代码

### 压缩依赖

如果你正在使用的是JDK 6 或者更早的版本，那么你需要将JZlib（www.jcraft.com/jzlib/）添加到 CLASSPATH 中以支持压缩功能。
对于Maven，请添加以下依赖项：

```xml
<dependency>
    <groupId>com.jcraft</groupId>
    <artifactId>jzlib</artifactId>
    <version>1.1.3</version>
</dependency>
```

### 代码

```java
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.handler.codec.http.*;

/**
 * http 压缩
 *
 * @author binbin.hou
 * @since 1.0.0
 */
public class HttpCompressChannelnitializer extends ChannelInitializer<Channel> {

    /**
     * 是否为客户端
     */
    private final boolean isClient;

    public HttpCompressChannelnitializer(boolean isClient) {
        this.isClient = isClient;
    }

    @Override
    protected void initChannel(Channel ch) throws Exception {
        ChannelPipeline channelPipeline = ch.pipeline();

        if (isClient) {
            channelPipeline.addLast(new HttpClientCodec())
                    // 添加解压实现
                    .addLast(new HttpContentDecompressor());
        } else {
            channelPipeline.addLast(new HttpServerCodec())
                    // 添加压缩实现
                    .addLast(new HttpContentCompressor());
        }
    }

}
```

# Https 的支持

前面的代码是一个很好的例子，说明了Netty 的架构方式是如何将代码重用变为杠杆作用的。

只需要简单地将一个ChannelHandler 添加到ChannelPipeline 中，便可以提供一项新功能，甚至像加密这样重要的功能都能提供。

```java
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.handler.codec.http.HttpClientCodec;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslHandler;

import javax.net.ssl.SSLEngine;

/**
 * 开启 https
 * @author binbin.hou
 * @since 1.0.0
 */
public class HttpsChannelnitializer extends ChannelInitializer<Channel> {

    /**
     * ssl 上下文
     */
    private final SslContext sslContext;

    /**
     * 是否为客户端
     */
    private final boolean isClient;

    public HttpsChannelnitializer(SslContext sslContext, boolean isClient) {
        this.sslContext = sslContext;
        this.isClient = isClient;
    }

    @Override
    protected void initChannel(Channel ch) throws Exception {
        final ChannelPipeline pipeline = ch.pipeline();

        // 添加 ssl
        SSLEngine sslEngine = sslContext.newEngine(ch.alloc());
        // 创建 ssl Handler，默认不开启 tls
        SslHandler sslHandler = new SslHandler(sslEngine);
        pipeline.addFirst(sslHandler);

        // Http 相关处理
        if(isClient) {
            pipeline.addLast(new HttpClientCodec());
        } else {
            pipeline.addLast(new HttpServerCodec());
        }
    }
}
```

# Netty 中使用 WebSocket

## WebSocket 的作用

WebSocket解决了一个长期存在的问题：既然底层的协议（HTTP）是一个请求/响应模式的交互序列，那么如何实时地发布信息呢？

AJAX提供了一定程度上的改善，但是数据流仍然是由客户端所发送的请求驱动的。

还有其他的一些或多或少的取巧方式，但是最终它们仍然属于扩展性受限的变通之法。

WebSocket规范以及它的实现代表了对一种更加有效的解决方案的尝试。

简单地说，WebSocket提供了“在一个单个的TCP连接上提供双向的通信……结合WebSocket API……它为网页和远程服务器之间的双向通信提供了一种替代HTTP轮询的方案。”

也就是说，WebSocket在客户端和服务器之间提供了真正的双向数据交换。我们不会深入地描述太多的内部细节，但是我们还是应该提到，尽管最早的实现仅限于文本数据，但是现在已经不是问题了；WebSocket现在可以用于传输任意类型的数据，很像普通的套接字。

## 调用流程

要想向你的应用程序中添加对于WebSocket的支持，你需要将适当的客户端或者服务器WebSocketChannelHandler添加到ChannelPipeline中。

这个类将处理由WebSocket定义的称为帧的特殊消息类型。

![websocket flow](https://images2018.cnblogs.com/blog/1112095/201803/1112095-20180313083855472-1286146613.png)

## WebSocketFrame类型

```
BinaryWebSocketFrame 数据帧：二进制数据
TextWebSocketFrame 数据帧：文本数据
ContinuationWebSocketFrame 数据帧：属于上一个BinaryWebSocketFrame或者TextWebSocketFrame的文本的或者二进制数据
CloseWebSocketFrame 控制帧：一个CLOSE请求、关闭的状态码以及关闭的原因
PingWebSocketFrame 控制帧：请求一个PongWebSocketFrame
PongWebSocketFrame 控制帧：对PingWebSocketFrame请求的响应
```

## 示例代码

因为Netty主要是一种服务器端的技术，所以在这里我们重点创建WebSocket服务器。

以下代码清单展示了一个使用WebSocketServerProtocolHandler的简单示例，这个类处理协议升级握手，以及3种控制帧——Close、Ping和Pong。

Text和Binary数据帧将会被传递给下一个（由你实现的）ChannelHandler进行处理。

### 服务端

以下展示Netty在服务器端支持WebSocket

```java
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.ContinuationWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketServerProtocolHandler;

/**
 * WebSocket 服务器
 * @author binbin.hou
 * @since 1.0.0
 */
public class WebSocketServerChannelInit extends ChannelInitializer<Channel> {
    @Override
    protected void initChannel(Channel ch) throws Exception {
        ch.pipeline().addLast(new HttpServerCodec())
                // 握手提供聚合
                .addLast(new HttpObjectAggregator(512*1024))
                //如果被请求的端点是"/websocket"，则处理该升级握手
                .addLast(new WebSocketServerProtocolHandler("/websocket"))
                .addLast(new TextFrameHandler())
                .addLast(new BinaryFrameHandler())
                .addLast(new ContinuationFrameHandler());
    }

    /**
     * 数据帧
     */
    class TextFrameHandler extends SimpleChannelInboundHandler<TextWebSocketFrame> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, TextWebSocketFrame msg) throws Exception {
            //...
        }
    }

    /**
     * 二进制帧
     */
    class BinaryFrameHandler extends SimpleChannelInboundHandler<BinaryWebSocketFrame> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, BinaryWebSocketFrame msg) throws Exception {

        }
    }

    /**
     * 连续帧
     */
    class ContinuationFrameHandler extends SimpleChannelInboundHandler<ContinuationWebSocketFrame> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, ContinuationWebSocketFrame msg) throws Exception {

        }
    }
}
```

### 客户端

参见 [客户端](https://github.com/netty/netty/blob/4.1/example/src/main/java/io/netty/example/http/websocketx/client/WebSocketClient.java)

## 保护WebSocket

要想为WebSocket 添加安全性，只需要将SslHandler 作为第一个ChannelHandler 添加到ChannelPipeline 中。

# 拓展阅读

- 协议

[HTTP](https://houbb.github.io/2018/09/25/protocol-http)

[HTTPS](https://houbb.github.io/2018/08/25/https)

[WebService](https://houbb.github.io/2017/07/03/webservice)

- 压缩算法


# 个人收获

1. 理解协议本身，就是网络编程的精髓。

2. netty 提供的这种灵活性与便利性，值得所有的框架使用。

3. 加密提供安全性，压缩提供性能提升。

# 参考资料

《Netty in Action》 P161

- other

https://www.cnblogs.com/shamo89/p/8534564.html

* any list
{:toc}
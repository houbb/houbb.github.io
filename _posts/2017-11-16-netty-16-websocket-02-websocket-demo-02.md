---
layout: post
title:  Netty WebSocket-netty 实现案例
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, web, web-socket, sh]
published: true
---

# 我们的WebSocket 示例应用程序

## 场景

为了让示例应用程序展示它的实时功能，我们将通过使用WebSocket 协议来实现一个基于浏览器的聊天应用程序，就像你可能在Facebook 的文本消息功能中见到过的那样。

我们将通过使得多个用户之间可以同时进行相互通信，从而更进一步。

图12-1 说明了该应用程序的逻辑：

（1）客户端发送一个消息；

（2）该消息将被广播到所有其他连接的客户端。

## 流程

![流程](https://waylau.gitbooks.io/essential-netty-in-action/content/images/Figure%2011.1%20Application%20logic.jpg)

1 客户端/用户连接到服务器，并且是聊天的一部分

2 聊天消息通过 WebSocket 进行交换

3 消息双向发送

4 服务器处理所有的客户端/用户

这正如你所想的聊天室的工作方式：每个人都可以跟其他人聊天。

此例子将仅提供服务器端，浏览器充当客户端，通过访问网页来聊天。正如您接下来要看到的，WebSocket 让这一切变得简单。

# 添加 WebSocket 支持

在从标准的HTTP或者HTTPS协议切换到WebSocket时，将会使用一种称为升级握手机制。

因此，使用WebSocket的应用程序将始终以HTTP/S作为开始，然后再执行升级。这个升级动作发生的确切时刻特定于应用程序；它可能会发生在启动时，也可能会发生在请求了某个特定的URL之后。

我们的应用程序将采用下面的约定：如果被请求的 URL 以 `/ws` 结尾，那么我们将会把该协议升级为WebSocket；否则，服务器将使用基本的HTTP/S。

在连接已经升级完成之后，所有数据都将会使用WebSocket 进行传输。

图12-2 说明了该服务器逻辑，一如在Netty 中一样，它由一组ChannelHandler 实现。

我们将会在下一节中，解释用于处理HTTP 以及WebSocket 协议的技术时，描述它们。

## 流程图

![流程图](https://7n.w3cschool.cn/attachments/image/20170808/1502160945859573.jpg)

1 客户端/用户连接到服务器并加入聊天

2 HTTP 请求页面或 WebSocket 升级握手

3 服务器处理所有客户端/用户

4 响应 URI `/` 的请求，转到 index.html

5 如果访问的是 URI `/ws` ，处理 WebSocket 升级握手

6 升级握手完成后 ，通过 WebSocket 发送聊天消息

# 示例代码

## 服务器

- WsServer.java

```java
package com.github.houbb.netty.inaction.chap12.ws;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

import java.net.InetSocketAddress;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class WsServer {

    public static void main(String[] args) {
        final int port = 8989;
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        serverBootstrap.group(bossGroup, workerGroup)
                .channel(NioServerSocketChannel.class)
                .childHandler(new WsServerInitializer());


        ChannelFuture channelFuture = serverBootstrap.bind(new InetSocketAddress(port)).syncUninterruptibly();
        if(!channelFuture.isSuccess()) {
            channelFuture.cause().printStackTrace();
        } else {
            System.out.println("Server listen on port: " + port);
        }

        channelFuture.channel().closeFuture().syncUninterruptibly();
        //close group
        bossGroup.shutdownGracefully();
        workerGroup.shutdownGracefully();
    }
}
```

- WsServerInitializer.java

```java
package com.github.houbb.netty.inaction.chap12.ws;

import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketServerProtocolHandler;
import io.netty.handler.stream.ChunkedWriteHandler;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class WsServerInitializer extends ChannelInitializer<SocketChannel> {

    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline pipeline = ch.pipeline();

        // webSocket 是 http 协议的升级
        pipeline.addLast(new HttpServerCodec())
                //避免大文件写入 oom
                .addLast(new ChunkedWriteHandler())
                //使用对象聚合
                .addLast(new HttpObjectAggregator(64*1024));

        //ws://server:port/context_path
        //ws://localhost:9999/ws
        //参数指的是contex_path
        pipeline.addLast(new WebSocketServerProtocolHandler("/ws"))
                // 自定义的 frame 文本处理 handler
                .addLast(new TextWebSocketFrameHandler());
    }
}
```

- TextWebSocketFrameHandler

```java
package com.github.houbb.netty.inaction.chap12.ws;

import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;

import java.time.LocalDateTime;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class TextWebSocketFrameHandler extends SimpleChannelInboundHandler<TextWebSocketFrame> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, TextWebSocketFrame msg) throws Exception {
        //1. 读取客户端的内容
        Channel channel = ctx.channel();
        System.out.println(channel.remoteAddress()+": " + msg.text());

        //2. 服务端反馈内容
        ctx.writeAndFlush(new TextWebSocketFrame("Server: " + LocalDateTime.now()));
    }

    @Override
    public void handlerAdded(ChannelHandlerContext ctx) throws Exception {
        System.out.println("[客户端加入] " + ctx.channel().id().asLongText());
    }

    @Override
    public void handlerRemoved(ChannelHandlerContext ctx) throws Exception {
        System.out.println("[客户端移除] " + ctx.channel().id().asLongText());
    }
}
```

## 客户端

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Socket</title>
    <script type="text/javascript">
        var websocket;

        //如果浏览器支持WebSocket
        if(window.WebSocket){
            websocket = new WebSocket("ws://localhost:8989/ws");  //获得WebSocket对象

            //当有消息过来的时候触发
            websocket.onmessage = function(event){
                var respMessage = document.getElementById("respMessage");
                respMessage.value = respMessage.value + "\n" + event.data;
            }

            //连接关闭的时候触发
            websocket.onclose = function(event){
                var respMessage = document.getElementById("respMessage");
                respMessage.value = respMessage.value + "\n断开连接";
            }

            //连接打开的时候触发
            websocket.onopen = function(event){
                var respMessage = document.getElementById("respMessage");
                respMessage.value = "建立连接";
            }
        }else{
            alert("浏览器不支持WebSocket");
        }

        function sendMsg(msg) { //发送消息
            if(window.WebSocket){
                if(websocket.readyState == WebSocket.OPEN) { //如果WebSocket是打开状态
                    websocket.send(msg); //send()发送消息
                }
            }else{
                return;
            }
        }
    </script>
</head>
<body>
<form onsubmit="return false">
    <textarea style="width: 300px; height: 200px;" name="message"></textarea>
    <input type="button" onclick="sendMsg(this.form.message.value)" value="发送"><br>
    <h3>信息</h3>
    <textarea style="width: 300px; height: 200px;" id="respMessage"></textarea>
    <input type="button" value="清空" onclick="javascript:document.getElementById('respMessage').value = ''">
</form>
</body>
</html>
```

## 测试

- 页面打开 index.html

可以打开多个，在输入框发送信息，可以接收到服务器的反馈。

关闭代表移除当前连接。

- 服务端

```
Server listen on port: 8989
[客户端加入] d89c67fffe99d9d7-00004978-00000001-089a4fe674c43c6c-f4e6a557
/0:0:0:0:0:0:0:1:59205: 啊啊啊
/0:0:0:0:0:0:0:1:59205: 啊啊啊，hello
[客户端加入] d89c67fffe99d9d7-00004978-00000002-21719b08d4c491ad-9373573f
/0:0:0:0:0:0:0:1:59214: 222
[客户端移除] d89c67fffe99d9d7-00004978-00000001-089a4fe674c43c6c-f4e6a557
[客户端移除] d89c67fffe99d9d7-00004978-00000002-21719b08d4c491ad-9373573f
```


# 核心内容讲解

## WEBSOCKET 帧

WebSocket 以帧的方式传输数据，每一帧代表消息的一部分。一个完整的消息可能会包含许多帧

由IETF 发布的WebSocket RFC，定义了6 种帧，Netty 为它们每种都提供了一个POJO 实现。

表12-1 列出了这些帧类型，并描述了它们的用法。

```
帧 类 型                描 述
BinaryWebSocketFrame    包含了二进制数据
TextWebSocketFrame      包含了文本数据
ContinuationWebSocketFrame   包含属于上一个BinaryWebSocketFrame或TextWebSocketFrame 的文本数据或者二进制数据
CloseWebSocketFrame     表示一个CLOSE 请求，包含一个关闭的状态码和关闭的原因
PingWebSocketFrame      请求传输一个PongWebSocketFrame
PongWebSocketFrame      作为一个对于PingWebSocketFrame 的响应被发送
```

我们的聊天应用程序将使用下面几种帧类型：

- CloseWebSocketFrame；

- PingWebSocketFrame；

- PongWebSocketFrame；

- TextWebSocketFrame。

TextWebSocketFrame 是我们唯一真正需要处理的帧类型。

为了符合WebSocket RFC，Netty 提供了 `WebSocketServerProtocolHandler` 来处理其他类型的帧。

## Handler 及其职责

```
ChannelHandler          职 责
HttpServerCodec         将字节解码为HttpRequest、HttpContent 和LastHttpContent。并将HttpRequest、HttpContent 和LastHttpContent 编码为字节
ChunkedWriteHandler     块写入一个文件的内容
HttpObjectAggregator    将一个HttpMessage 和跟随它的多个HttpContent 聚合为单个FullHttpRequest 或者FullHttpResponse（取决于它是被用来处理请求还是响应）。安装了这个之后，ChannelPipeline 中的下一个ChannelHandler 将只会收到完整的HTTP 请求或响应
HttpRequestHandler      处理FullHttpRequest（那些不发送到/ws URI 的请求）
WebSocketServerProtocolHandler 按照WebSocket 规范的要求，处理WebSocket 升级握手、PingWebSocketFrame 、PongWebSocketFrame、CloseWebSocketFrame     
TextWebSocketFrameHandler 处理TextWebSocketFrame 和握手完成事件
```

Netty 的WebSocketServerProtocolHandler 处理了所有委托管理的WebSocket 帧类型以及升级握手本身。

如果握手成功，那么所需的ChannelHandler 将会被添加到ChannelPipeline中，而那些不再需要的ChannelHandler 则将会被移除。

当WebSocket 协议升级完成之后，WebSocketServerProtocolHandler 将会把HttpRequestDecoder 替换为WebSocketFrameDecoder，把HttpResponseEncoder 替换为WebSocketFrameEncoder。

为了性能最大化，它将移除任何不再被WebSocket 连接所需要的ChannelHandler。



# 参考资料

《Netty in Action》 P185

- other

[Netty笔记之六：Netty对websocket的支持](https://www.jianshu.com/p/9a97e667cf84)

[Netty对WebSocket的支持(五)](https://www.cnblogs.com/miller-zou/p/7002070.html)

* any list
{:toc}
---
layout: post
title:  Netty UDP-实际例子
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, udp, sh]
published: true
---


# 广播的个人理解

可以发送到多台主机，但是主机的监听端口号要相同。

但是有也可以不同，比如广播的时候，同时发送给多个 host+port，应该也是可以的。

# 定义传输对象

```java
/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MessageBean {

    private String time;

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    @Override
    public String toString() {
        return "MessageBean{" +
                "time='" + time + '\'' +
                '}';
    }
}
```

# 服务器

```java
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioDatagramChannel;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class UdpServer {

    public static void main(String[] args) throws InterruptedException {
        Bootstrap serverBootstrap = new Bootstrap();
        EventLoopGroup eventExecutors = new NioEventLoopGroup();

        serverBootstrap.group(eventExecutors)
                .channel(NioDatagramChannel.class)
                // 支持广播
                .option(ChannelOption.SO_BROADCAST, true)
                // 添加编码器
                .handler(new UdpServerEncoder());


        // 循环广播内容-5S钟推送一次服务器时间
        // 这个端口绑定的是0
        Channel channel = serverBootstrap.bind(0).syncUninterruptibly().channel();

        for(int i = 0; i < 10000; i++) {
            MessageBean messageBean = new MessageBean();
            messageBean.setTime(LocalDateTime.now().toString());
            channel.writeAndFlush(messageBean);
            System.out.println("[Server] broadcast: " + messageBean);
            TimeUnit.SECONDS.sleep(5);
        }

        //close
        channel.closeFuture().syncUninterruptibly();
        eventExecutors.shutdownGracefully();
    }

}
```

## 编码器

```java
package com.github.houbb.netty.inaction.chap13.udp;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.socket.DatagramPacket;
import io.netty.handler.codec.MessageToMessageEncoder;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 编码器
 * 1. 将服务器的对象==》DatagramPacket
 * @author binbin.hou
 * @since 1.0.0
 */
public class UdpServerEncoder extends MessageToMessageEncoder<MessageBean> {

    /**
     * 需要传输的远方地址
     */
    private final InetSocketAddress remoteAddress;

    public UdpServerEncoder() {
        // 广播地址
        this.remoteAddress = new InetSocketAddress("255.255.255.255", UdpClient.PORT);
    }

    @Override
    protected void encode(ChannelHandlerContext ctx, MessageBean msg, List<Object> out) throws Exception {
        ByteBuf byteBuf = Unpooled.copiedBuffer(msg.getTime(), StandardCharsets.UTF_8);
        System.out.println("[Server] encode to " + remoteAddress.toString());
        out.add(new DatagramPacket(byteBuf, remoteAddress));
    }

}
```

这里做了两件事：

1. 对象编码为 DatagramPacket

2. 指定了广播的地址。

如果想发送给不同的 ip+port, 在 `out.add(new DatagramPacket(byteBuf, remoteAddress));` 这句话调整下即可。

# 客户端

## 引导类

```java
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioDatagramChannel;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class UdpClient {

    /**
     * 客户端端口号
     */
    public static final int PORT = 8080;

    public static void main(String[] args) {
        Bootstrap bootstrap = new Bootstrap();
        EventLoopGroup eventExecutors = new NioEventLoopGroup();
        bootstrap.group(eventExecutors)
                .channel(NioDatagramChannel.class)
                // 指定允许广播
                .option(ChannelOption.SO_BROADCAST, true)
                .handler(new ChannelInitializer<Channel>() {
                    @Override
                    protected void initChannel(Channel ch) throws Exception {
                        ch.pipeline()
                                .addLast(new UdpClientDecoder())
                                .addLast(new UdpClientHandler());
                    }
                })
               ;

        // 监听固定的端口
        ChannelFuture channelFuture = bootstrap.bind(PORT).syncUninterruptibly();
        channelFuture.channel().closeFuture().syncUninterruptibly();

        eventExecutors.shutdownGracefully();
    }

}
```

## 解码

将 udp 消息转换为对象。

```java
package com.github.houbb.netty.inaction.chap13.udp;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.socket.DatagramPacket;
import io.netty.handler.codec.MessageToMessageDecoder;
import io.netty.util.CharsetUtil;

import java.util.List;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class UdpClientDecoder extends MessageToMessageDecoder<DatagramPacket> {

    @Override
    protected void decode(ChannelHandlerContext ctx, DatagramPacket msg, List<Object> out) throws Exception {
        final String result = msg.content().toString(CharsetUtil.UTF_8);
        System.out.println("[Client] decode msg: " + result);
        MessageBean messageBean = new MessageBean();
        messageBean.setTime(result);

        out.add(messageBean);
    }

}
```

## handler 处理类

```java
package com.github.houbb.netty.inaction.chap13.udp;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class UdpClientHandler extends SimpleChannelInboundHandler<MessageBean> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, MessageBean msg) throws Exception {
        System.out.println("[Client] received from server: " + msg);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
    }
}
```


# 测试

## 服务器

```
[Server] broadcast: MessageBean{time='2019-05-03T10:26:33.607'}
[Server] encode to /255.255.255.255:8080
[Server] broadcast: MessageBean{time='2019-05-03T10:26:38.624'}
[Server] encode to /255.255.255.255:8080
....
```

## 客户端

```
[Client] decode msg: 2019-05-03T10:26:43.628
[Client] received from server: MessageBean{time='2019-05-03T10:26:43.628'}
[Client] decode msg: 2019-05-03T10:26:48.629
[Client] received from server: MessageBean{time='2019-05-03T10:26:48.629'}
...
```




# 参考资料

《Netty in Action》 P185

[Netty实现简单UDP服务器](https://www.cnblogs.com/lanqie/p/8267498.html)

* any list
{:toc}
---
layout: post
title: Netty 权威指南-05-拆包和粘包
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# TCP为什么会粘包/拆包

我们知道，TCP是以一种流的方式来进行网络转播的，当tcp三次握手建立通信后，客户端服务端之间就建立了一种通讯管道，我们可以想象成自来水管道，流出来的水是连城一片的，是没有分界线的。

TCP底层并不了解上层的业务数据的具体含义，它会根据TCP缓冲区的实际情况进行包的划分。

所以对于我们应用层而言。

我们直观是发送一个个连续完整TCP数据包的，而在底层就可能会出现将一个完整的TCP拆分成多个包发送或者将多个包封装成一个大的数据包发送。

这就是所谓的TCP粘包和拆包。

# 当发生TCP粘包/拆包会发生什么情况

我们举一个简单例子说明：

客户端向服务端发送两个数据包：第一个内容为 123；第二个内容为456。

服务端接受一个数据并做相应的业务处理（这里就是打印接受数据加一个逗号）。

那么服务端输出结果将会出现下面四种情况

| 服务端响应结果	| 结论     |
|:---|:---|
| 123，456，| 	正常接收，没有发生粘包和拆包     |
| 123456，| 	异常接收，发生tcp粘包    |
| 123，4，56，| 	异常接收，发生tcp拆包    |
| 12，3456，| 	异常接收，发生tcp拆包和粘包  |

## 如何解决

主流的协议解决方案可以归纳如下：

(1) 消息定长，例如每个报文的大小固定为20个字节，如果不够，空位补空格；

(2) 在包尾增加回车换行符进行切割；

(3) 将消息分为消息头和消息体，消息头中包含表示消息总长度的字段；

(4) 更复杂的应用层协议。

对于之前描述的案例，在这里我们就可以采取方案1和方案3。

以方案1为例：我们每次发送的TCP包只有三个数字，那么我将报文设置为3个字节大小的，此时，服务器就会以三个字节为基准来接受包，以此来解决站包拆包问题。



# 未考虑拆包/粘包的案例

## 服务端

- PackTimeServerHandler.java

```java
import java.nio.charset.StandardCharsets;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

public class PackTimeServerHandler extends ChannelInboundHandlerAdapter {


    private static final String NEW_LINE = System.getProperty("line.separator");


    private int count = 0;

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 读取收到的信息
        ByteBuf byteBuf = (ByteBuf)msg;
        byte[] bytes = new byte[byteBuf.readableBytes()];
        byteBuf.readBytes(bytes);

        // 获取内容，移除掉换行符号
        String body = new String(bytes, 0, bytes.length-NEW_LINE.length(), StandardCharsets.UTF_8);
        count++;
        System.out.println("Server revice body from client : " + body + ", count is " +count);

        // 回写到 client 端时间。
        long currentTime = System.currentTimeMillis();
        String currentTimeStr = currentTime+""+NEW_LINE;
        ByteBuf timeBuffer = Unpooled.copiedBuffer(currentTimeStr.getBytes());
        ctx.writeAndFlush(timeBuffer);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

- DefaultServer.java

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

public class DefaultServer {

    public static void main(String[] args) {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            ChannelFuture channelFuture = serverBootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new PackTimeServerHandler())
                    .bind(8888)
                    .syncUninterruptibly();

            // 优雅关闭
            channelFuture.channel().closeFuture().syncUninterruptibly();
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }

}
```

## 客户端

- PackTimeClientHandler.java

```java
import java.nio.charset.StandardCharsets;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

public class PackTimeClientHandler extends ChannelInboundHandlerAdapter {


    private static final String NEW_LINE = System.getProperty("line.separator");


    private static final String QUERY_INFO = "query time " + NEW_LINE;

    private int count = 0;

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // 写入到 channel 中
        ByteBuf byteBuf;

        for(int i = 0 ; i < 100; i++) {
            byteBuf = Unpooled.copiedBuffer(QUERY_INFO.getBytes());
            ctx.writeAndFlush(byteBuf);
        }
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf buf = (ByteBuf)msg;
        byte[] bytes = new byte[buf.readableBytes()];
        buf.readBytes(bytes);

        String info = new String(bytes, StandardCharsets.UTF_8);
        System.out.println("Client received from server : " + info + "count " + count++);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

- DefaultClient.java

```java
import io.netty.bootstrap.Bootstrap;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;

public class DefaultClient {

    public static void main(String[] args) {
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            Bootstrap serverBootstrap = new Bootstrap();
            ChannelFuture channelFuture = serverBootstrap.group(workerGroup)
                    .channel(NioSocketChannel.class)
                    .handler(new PackTimeClientHandler())
                    .connect("localhost", 8888)
                    .syncUninterruptibly();

            // 优雅关闭
            channelFuture.channel().closeFuture().syncUninterruptibly();
        } finally {
            workerGroup.shutdownGracefully();
        }
    }

}
```

## 测试验证

(1) 启动服务端

(2) 启动客户端

- 客户端日志

```
Client received from server : 1568904061556
1568904061565
count 0
```

- 服务端

```
Server revice body from client : query time 
query time 
... 
query time 
que, count is 1
Server revice body from client : y time 
query time 
query time 
query time 
query time 
query time 
query time 
query time 
query time 
query time 
query time 
query time 
query time 
query time 
query time , count is 2
```

虽然收到了客户端的 100 次 query time，但是对于客户端却只得到了一次反馈。



# 利用LineBasedFrameDecoder解决TCP粘包问题

## 服务端

- FixDefaultServer.java

核心调整。

```java
.childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline()
                                    // 添加解码器
                                    .addLast(new LineBasedFrameDecoder(1024))
                                    .addLast(new StringDecoder())
                                    .addLast(new FixPackTimeServerHandler());
                        }
                    })
```

- FixPackTimeServerHandler.java

```java
public class FixPackTimeServerHandler extends ChannelInboundHandlerAdapter {


    private static final String NEW_LINE = System.getProperty("line.separator");

    private int count = 0;

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 读取收到的信息
        String body = (String)msg;
        count++;
        System.out.println("Server revice body from client : " + body + ", count is " +count);

        // 回写到 client 端时间。
        long currentTime = System.currentTimeMillis();
        String currentTimeStr = currentTime+""+NEW_LINE;
        ByteBuf timeBuffer = Unpooled.copiedBuffer(currentTimeStr.getBytes());
        ctx.writeAndFlush(timeBuffer);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

## 客户端

- FixDefaultClient

核心调整

```java
.handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline()
                                    .addLast(new LineBasedFrameDecoder(1024))
                                    .addLast(new StringDecoder())
                                    .addLast(new FixPackTimeClientHandler());
                        }
                    })
```

- FixPackTimeClientHandler.java

```java
public class FixPackTimeClientHandler extends ChannelInboundHandlerAdapter {


    private static final String NEW_LINE = System.getProperty("line.separator");


    private static final String QUERY_INFO = "query time " + NEW_LINE;

    private int count = 0;

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // 写入到 channel 中
        ByteBuf message;

        for(int i = 0 ; i < 100; i++) {
            message = Unpooled.copiedBuffer(QUERY_INFO.getBytes());
            ctx.writeAndFlush(message);
        }
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        String body = (String)msg;
        System.out.println("Client received from server : " + body + "count " + count++);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

## 测试验证

顺序和原来一样。

- 客户端

```
Client received from server : 1568905436714count 0
Client received from server : 1568905436723count 1
Client received from server : 1568905436723count 2
Client received from server : 1568905436723count 3
Client received from server : 1568905436724count 4
Client received from server : 1568905436724count 5
....
Client received from server : 1568905436748count 99
```

- 服务端

```
Server revice body from client : query time , count is 1
Server revice body from client : query time , count is 2
Server revice body from client : query time , count is 3
Server revice body from client : query time , count is 4
Server revice body from client : query time , count is 5
Server revice body from client : query time , count is 6
Server revice body from client : query time , count is 7
Server revice body from client : query time , count is 8
....
Server revice body from client : query time , count is 100
```

# 原理简单分析

## LineBasedFrameDecoder 的原理分析

LineBasedFrameDecoder 的工作原理是依次遍历ByteBuf中的可读字节，判断是否有\n或者\r\n，如果有，就在此位置为结束位置,从可读索引到结束位置区间的字节就组成了一行。

它是以换行符为结束标志的解码器，支持携带结束符和不携带结束符2种解码方式，同时支持配置单行字节的最大长度。

如果连续读取到最大长度后仍然没有发现换行符，就会抛出异常，同时忽略掉之前的读到的异常码流。

## StringDecoder

StringDecoder 就是将接收到的对象转换成字符串，然后继续调用后面的Handler。


# 指定分隔符方案

通过约定的分隔符进行拆分，也是一种很常见的解决方案。

## 服务端

- DelimiterTimeServerHandler.java

```java
package com.github.houbb.netty.learn.four.pack.delimiter;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
public class DelimiterTimeServerHandler extends ChannelInboundHandlerAdapter {

    private AtomicInteger atomicInteger = new AtomicInteger(0);

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 获取客户端的信息
        String info = (String)msg;
        int count = atomicInteger.incrementAndGet();
        System.out.println("Server receive from client " + info + ", count " + count);

        // 信息输出到客户端
        String timeInfo = System.currentTimeMillis()+"$";
        ByteBuf byteBuf = Unpooled.copiedBuffer(timeInfo.getBytes());
        ctx.writeAndFlush(byteBuf);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

注意这一句 `String timeInfo = System.currentTimeMillis()+"$";`

我们直接指定以 `$` 符号作为分隔符号。

- 服务端代码

```java
.childHandler(new ChannelInitializer<SocketChannel>() {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ch.pipeline()
                .addLast(new DelimiterBasedFrameDecoder(1024,
                        Unpooled.copiedBuffer("$".getBytes())))
                .addLast(new StringDecoder())
                .addLast(new DelimiterTimeServerHandler());
    }
})
```

其中：

```java
DelimiterBasedFrameDecoder(1024, Unpooled.copiedBuffer("$".getBytes())
```

我们这里指定使用分隔符的方式，去处理我们的拆包/黏包问题。


## 客户端

- DelimiterTimeClientHandler.java

```java
package com.github.houbb.netty.learn.four.pack.delimiter;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
public class DelimiterTimeClientHandler extends ChannelInboundHandlerAdapter {

    private AtomicInteger atomicInteger = new AtomicInteger(0);

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // channel 激活是，调用 server 端 20 次
        String queryInfo = "ask for time $";
        ByteBuf byteBuf;
        for(int i = 0; i < 20; i++) {
            byteBuf = Unpooled.copiedBuffer(queryInfo.getBytes());
            ctx.writeAndFlush(byteBuf);
        }
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 获取客户端的信息
        String info = (String)msg;
        int count = atomicInteger.incrementAndGet();
        System.out.println("Client receive from server " + info + ", count " + count);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

}
```

`String queryInfo = "ask for time $";`

这里客户端调用的时候，也是以 `$` 分隔符作为结尾。

为了整理日志简单。本次将调用次数降低为 20 次。

- 客户端

启动代码 handler 也做如下的初始化：

```java
.handler(new ChannelInitializer<SocketChannel>() {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ch.pipeline()
                .addLast(new DelimiterBasedFrameDecoder(1024,
                        Unpooled.copiedBuffer("$".getBytes())))
                .addLast(new StringDecoder())
                .addLast(new DelimiterTimeClientHandler());
    }
})
```

## 测试验证

（1）启动服务端

（2）启动客户端

- 服务端日志

```
Server receive from client ask for time , count 1
Server receive from client ask for time , count 2
Server receive from client ask for time , count 3
Server receive from client ask for time , count 4
Server receive from client ask for time , count 5
Server receive from client ask for time , count 6
Server receive from client ask for time , count 7
Server receive from client ask for time , count 8
Server receive from client ask for time , count 9
Server receive from client ask for time , count 10
Server receive from client ask for time , count 11
Server receive from client ask for time , count 12
Server receive from client ask for time , count 13
Server receive from client ask for time , count 14
Server receive from client ask for time , count 15
Server receive from client ask for time , count 16
Server receive from client ask for time , count 17
Server receive from client ask for time , count 18
Server receive from client ask for time , count 19
Server receive from client ask for time , count 20
```

- 客户端日志

```
Client receive from server 1568961677739, count 1
Client receive from server 1568961677741, count 2
Client receive from server 1568961677742, count 3
Client receive from server 1568961677742, count 4
Client receive from server 1568961677743, count 5
Client receive from server 1568961677743, count 6
Client receive from server 1568961677743, count 7
Client receive from server 1568961677743, count 8
Client receive from server 1568961677744, count 9
Client receive from server 1568961677744, count 10
Client receive from server 1568961677744, count 11
Client receive from server 1568961677745, count 12
Client receive from server 1568961677745, count 13
Client receive from server 1568961677745, count 14
Client receive from server 1568961677745, count 15
Client receive from server 1568961677746, count 16
Client receive from server 1568961677746, count 17
Client receive from server 1568961677746, count 18
Client receive from server 1568961677746, count 19
Client receive from server 1568961677747, count 20
```

# 定长解决方案

## 方案说明

有时候直接指定长度，根据长度进行截取也是一种常见的方式。

## Netty 解决方案

Netty 中提供了类 `FixedLengthFrameDecoder`

## netty 设计的有优点

netty 的这种泳道式设计，使得后期的拓展变得非常简单。

而且提供了大量丰富而强大的类库，极大的降低了重复开发的成本。

## 服务端

- FixedLengthServerHandler.java

非常简单，直接输出。

```java
public class FixedLengthServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 直接打印信息
        String info = (String)msg;
        System.out.println(info);
    }

}
```

- 服务器 handler 指定

```java
.childHandler(new ChannelInitializer<SocketChannel>() {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        ch.pipeline().addLast(new FixedLengthFrameDecoder(20))
                .addLast(new StringDecoder())
                .addLast(new FixedLengthServerHandler());
    }
})
```

## 测试

直接使用命令行 `telnet localhost 8888`

然后输入信息，打印得到

```
123

asdfasdf
asd
fasdf
asdfasdf
12a
```

# 小结

本节的内容相对比较简单，但是确实非常的使用。

这一节主要是参考《Netty 权威指南》中的个人学习笔记，下一节将分析一下 netty 服务端的启动源码。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

《Netty 权威指南》

[Netty 官方](https://netty.io/wiki/user-guide-for-4.x.html)

- other

[使用Netty解决TCP粘包和拆包问题过程详解](https://www.jb51.net/article/165349.htm)

[[Netty]——TCP粘包和拆包的解决之道(第四章)](https://www.jianshu.com/p/0e732223f5c1)

* any list
{:toc}
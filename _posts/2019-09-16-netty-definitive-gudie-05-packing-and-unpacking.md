---
layout: post
title: Netty 权威指南-05-拆包和粘包
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# TCP为什么会粘包/拆包

我们知道，TCP是以一种流的方式来进行网络转播的，当tcp三次握手简历通信后，客户端服务端之间就建立了一种通讯管道，我们可以想象成自来水管道，流出来的水是连城一片的，是没有分界线的。

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

# 参考资料

《Netty 权威指南》

[Netty 官方](https://netty.io/wiki/user-guide-for-4.x.html)

- other

[使用Netty解决TCP粘包和拆包问题过程详解](https://www.jb51.net/article/165349.htm)

[[Netty]——TCP粘包和拆包的解决之道(第四章)](https://www.jianshu.com/p/0e732223f5c1)

* any list
{:toc}
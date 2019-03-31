---
layout: post
title:  Netty-07-Echo 服务器和客户端示例
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, TODO, sh]
published: true
---

# 快速开始

[Netty-快速开始](https://houbb.github.io/2017/11/16/netty-02-quick-start-02) 演示了一个丢弃版本的 Netty 入门案例。

现在我们来看一个 Echo 版本的例子。

# 服务端

## Handler 实现

```java
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.util.CharsetUtil;

/**
 * 自定义的服务端类
 * 1. 注解标识可以被多个 channel 安全的共享。
 * @author binbin.hou
 * @date 2019/3/31
 * @since v1
 */
@ChannelHandler.Sharable
public class EchoServerHandler extends ChannelInboundHandlerAdapter {

    /**
     * 信息读取
     * @param ctx 上下文
     * @param msg 消息
     * @throws Exception if any
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf byteBuf = (ByteBuf)msg;
        final String string = byteBuf.toString(CharsetUtil.UTF_8);
        System.out.println("Echo server received: " + string);

        // 将接收到的消息，写给发送者
        ctx.write(byteBuf);
    }

    /**
     * 消息读取完成
     * @param ctx 上下文
     * @throws Exception if any
     */
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        //将未处理的消息冲刷到远程
        // 关闭当前 channel
        ctx.writeAndFlush(Unpooled.EMPTY_BUFFER)
                .addListener(ChannelFutureListener.CLOSE);
    }

    /**
     * 异常处理
     * 1. 处理异常消息
     * 2. 关闭 channel
     * @param ctx 上下文
     * @param cause 原因
     * @throws Exception if any
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        System.err.println("异常原因：" + cause.getMessage());

        ctx.close();
    }
}
```

## 启动服务器

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;

/**
 * 服务端
 * @author binbin.hou
 * @date 2019/3/31
 * @since v1
 */
public class EchoServer {

    /**
     * 服务器监听端口号
     */
    private static final int PORT = 8081;

    /**
     * @param args 参数
     */
    public static void main(String[] args) throws InterruptedException {
        // 执行的线程池组
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();

        try {
            //启动服务端的类 ServerBootstrap 是启动服务的辅助类，有关socket的参数可以通过ServerBootstrap进行设置。
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap
                    // 指定执行的线程组
                    .group(eventLoopGroup)
                    // 这里指定NioServerSocketChannel类初始化channel用来接受客户端请求。
                    .channel(NioServerSocketChannel.class)
                    // 新的连接创建时，会新增一个 childHandler，并且将这个 handler 放在 pipeline 中。
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            // 将我们定义的 channelHandler 添加到 pipeline
                            ch.pipeline().addLast(new EchoServerHandler());
                        }
                    });
            // 同步阻塞线程，直到同步绑定端口完成
            ChannelFuture channelFuture = serverBootstrap
                    // 绑定套接字的地址
                    .bind(PORT)
                    .sync();
            System.out.println("Server started on PORT: " + PORT);
            // 同步阻塞线程，直到获取 closeFuture
            channelFuture.channel().closeFuture().sync();
        } finally {
            // 同步优雅的关闭线程池
            eventLoopGroup.shutdownGracefully().sync();
        }
    }
}
```

# 客户端

## Handler

```java
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

import java.nio.charset.StandardCharsets;

/**
 * @author binbin.hou
 * @date 2019/3/31
 * @since v1
 */
@ChannelHandler.Sharable
public class EchoClientHandler extends SimpleChannelInboundHandler<ByteBuf> {

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        final ByteBuf byteBuf = Unpooled.copiedBuffer("Client channel active!", StandardCharsets.UTF_8);
        ctx.writeAndFlush(byteBuf);
    }

    /**
     * 记录已经接受的消息
     * 1. 每次接受数据的时候，都会调用这个方法。
     * 2. 从服务器接收到的数据可能会被分隔为多次接受，即使数据量比较少。
     * 3. 作为一个面向流的协议，TCP 保证了字节数组将会按照服务器发送它们的顺序被接收。
     * @param ctx 上下文
     * @param msg 消息
     * @throws Exception if any
     */
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
        final String string = msg.toString(StandardCharsets.UTF_8);
        System.out.println("Client received msg: " + string);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        System.err.println("Client meet ex: " + cause.getMessage());
        // 关闭当前 channel
        ctx.close();
    }
}
```

## 客户端启动函数

```java
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;

/**
 * @author binbin.hou
 * @date 2019/3/31
 * @since v1
 */
public class EchoClient {

    /**
     * 服务器地址
     */
    private static final String HOST = "127.0.0.1";

    /**
     * 服务器 port
     */
    private static final int PORT = 8081;

    public static void main(String[] args) throws InterruptedException {
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(eventLoopGroup)
                    .channel(NioSocketChannel.class)
                    .handler(new EchoClientHandler());

            ChannelFuture channelFuture = bootstrap.connect(HOST, PORT).sync();
            System.out.println("Client connect to "+HOST+":"+PORT+" success!");
            channelFuture.channel().closeFuture().sync();
        } finally {
            // 同步优雅的关闭线程池。
            eventLoopGroup.shutdownGracefully().sync();
        }
    }
}
```

# 测试

## 启动服务器

日志信息如下

```
Server started on PORT: 8081
```

## 启动客户端

- 客户端日志

```
Client connect to 127.0.0.1:8081 success!
Client received msg: Client channel active!

Process finished with exit code 0
```

- 服务器日志

与此同时，服务器端也多出一条日志

```
Echo server received: Client channel active!
```

# 疑问

## 注解 `@Sharable`的作用？

注解标识当前 Handler 类可以被多个 channel 安全的共享。

## 为什么二者继承的 Hanlder 不同？

- SimpleChannelInboundHandler 与 ChannelInboundHandler

你可能会想：为什么我们在客户端使用的是SimpleChannelInboundHandler，而不是在Echo-ServerHandler 中所使用的ChannelInboundHandlerAdapter 呢？

这和两个因素的相互作用有关：业务逻辑如何处理消息以及 Netty 如何管理资源。

在客户端，当channelRead0()方法完成时，你已经有了传入消息，并且已经处理完它了。当该方法返回时，SimpleChannelInboundHandler 负责释放指向保存该消息的ByteBuf 的内存引用。

在 EchoServerHandler 中，你仍然需要将传入消息回送给发送者，而write()操作是异步的，直到channelRead()方法返回后可能仍然没有完成。

为此，EchoServerHandler扩展了ChannelInboundHandlerAdapter，其在这个时间点上不会释放消息。

消息在EchoServerHandler 的channelReadComplete()方法中，当writeAndFlush()方法被调用时被释放。

后续将对消息的资源管理进行详细的介绍。

## Handler 中都做了异常的处理，不处理会怎么样？

每个Channel 都拥有一个与之相关联的ChannelPipeline，其持有一个ChannelHandler 的实例链。

在默认的情况下，ChannelHandler 会把对它的方法的调用转发给链中的下一个ChannelHandler。

因此，如果exceptionCaught()方法没有被该链中的某处实现，那么所接收的异常将会被传递到ChannelPipeline 的尾端并被记录。

为此，**你的应用程序应该提供至少有一个实现了exceptionCaught()方法的ChannelHandler。**

## 优雅关闭怎么做到的？



# 学习新技术的方式

1. 大概了解下这门技术。

2. 跟着案例手写几遍。理解，然后直到完全记下来。

3. 不要直接复制。没有用的。像我复制黏贴 java 注解的上面元注解信息，导致记不得怎么写。其实也没有多少东西。

多写几遍，就记住了。

# 参考资料

《Netty 实战》P54

* any list
{:toc}


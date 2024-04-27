---
layout: post
title: 从零手写实现 tomcat-06-servlet bio/thread/nio/netty 池化处理 
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 创作缘由

平时使用 tomcat 等 web 服务器不可谓不多，但是一直一知半解。

于是想着自己实现一个简单版本，学习一下 tomcat 的精髓。

# 系列教程

[从零手写实现 apache Tomcat-01-入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-overview)

[从零手写实现 apache Tomcat-02-web.xml 入门详细介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-web-xml)

[从零手写实现 tomcat-03-基本的 socket 实现](https://houbb.github.io/2016/11/07/web-server-tomcat-03-hand-write-simple-socket)

[从零手写实现 tomcat-04-请求和响应的抽象](https://houbb.github.io/2016/11/07/web-server-tomcat-04-hand-write-request-and-resp)

[从零手写实现 tomcat-05-servlet 处理支持](https://houbb.github.io/2016/11/07/web-server-tomcat-05-hand-write-servlet-web-xml)

[从零手写实现 tomcat-06-servlet bio/thread/nio/netty 池化处理](https://houbb.github.io/2016/11/07/web-server-tomcat-06-hand-write-thread-pool)

[从零手写实现 tomcat-07-war 如何解析处理三方的 war 包？](https://houbb.github.io/2016/11/07/web-server-tomcat-07-hand-write-war)

[从零手写实现 tomcat-08-tomcat 如何与 springboot 集成？](https://houbb.github.io/2016/11/07/web-server-tomcat-08-hand-write-embed)

[从零手写实现 tomcat-09-servlet 处理类](https://houbb.github.io/2016/11/07/web-server-tomcat-09-hand-write-servlet)

[从零手写实现 tomcat-10-static resource 静态资源文件](https://houbb.github.io/2016/11/07/web-server-tomcat-10-hand-write-static-resource)

[从零手写实现 tomcat-11-filter 过滤器](https://houbb.github.io/2016/11/07/web-server-tomcat-11-hand-write-filter)

[从零手写实现 tomcat-12-listener 监听器](https://houbb.github.io/2016/11/07/web-server-tomcat-12-hand-write-listener)

## 拓展阅读

[Netty 权威指南-01-BIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-01-bio)

[Netty 权威指南-02-NIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-02-nio)

[Netty 权威指南-03-AIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-03-aio)

[Netty 权威指南-04-为什么选择 Netty？Netty 入门教程](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

# 问题

现在的实现看起来一切都好，但是有一个问题，会导致阻塞。

为了一步步演示，我们把代码简化一下。

# v1-bio

最基本的版本

```java
package com.github.houbb.minicat.bs.servlet;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;
import com.github.houbb.minicat.util.InnerHttpUtil;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * @author 老马啸西风
 * @since 0.1.0
 */
public class MiniCatBootstrapBioSocket {

    private static final Log logger = LogFactory.getLog(MiniCatBootstrapBioSocket.class);

    /**
     * 启动端口号
     */
    private final int port;

    /**
     * 服务端 socket
     */
    private ServerSocket serverSocket;

    public MiniCatBootstrapBioSocket() {
        this.port = 8080;
    }

    public void start() {
        logger.info("[MiniCat] start listen on port {}", port);
        logger.info("[MiniCat] visit url http://{}:{}", "127.0.0.1", port);

        try {
            this.serverSocket = new ServerSocket(port);

            while (true) {
                Socket clientSocket = serverSocket.accept(); // 等待客户端连接

                // 从Socket获取输入流
                logger.info("readRequestString start");
                String requestString = readRequestString(clientSocket);
                logger.info("readRequestString end");

                // 这里模拟一下耗时呢
                TimeUnit.SECONDS.sleep(5);

                // 写回到客户端
                logger.info("writeToClient start");
                writeToClient(clientSocket, requestString);
                logger.info("writeToClient end");

                // 关闭连接
                clientSocket.close();
            }


        } catch (Exception e) {
            logger.error("[MiniCat] start meet ex", e);
            throw new MiniCatException(e);
        }
    }

    private void writeToClient(Socket clientSocket, String requestString) throws IOException {
        OutputStream outputStream = clientSocket.getOutputStream();
        String httpText = InnerHttpUtil.http200Resp("ECHO: \r\n" + requestString);
        outputStream.write(httpText.getBytes("UTF-8"));
    }

    private String readRequestString(Socket clientSocket) throws IOException {
        // 从Socket获取输入流
        BufferedReader reader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
        StringBuilder requestBuilder = new StringBuilder();
        String line;
        // 读取HTTP请求直到空行（表示HTTP请求结束）
        while ((line = reader.readLine()) != null && !line.isEmpty()) {
            requestBuilder.append(line).append("\n");
        }
        return requestBuilder.toString();
    }

}
```

这种实现方式每次只能处理一个请求。

当然，我们可以引入 thread 线程池。

# v2-bio+thread

```java
package com.github.houbb.minicat.bs.servlet;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;
import com.github.houbb.minicat.util.InnerHttpUtil;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * 实际测试还是会阻塞
 *
 * @author 老马啸西风
 * @since 0.1.0
 */
public class MiniCatBootstrapBioThreadSocket {

    private static final Log logger = LogFactory.getLog(MiniCatBootstrapBioThreadSocket.class);

    /**
     * 启动端口号
     */
    private final int port;

    /**
     * 服务端 socket
     */
    private ServerSocket serverSocket;

    private final ExecutorService threadPool;

    public MiniCatBootstrapBioThreadSocket() {
        this.port = 8080;

        threadPool = Executors.newFixedThreadPool(10);
    }

    public void start() {
        logger.info("[MiniCat] start listen on port {}", port);
        logger.info("[MiniCat] visit url http://{}:{}", "127.0.0.1", port);

        try {
            this.serverSocket = new ServerSocket(port);

            while (true) {
                Socket clientSocket = serverSocket.accept(); // 等待客户端连接

                // 从Socket获取输入流
                threadPool.submit(new Runnable() {
                    @Override
                    public void run() {
                        handleSocket(clientSocket);
                    }
                });
            }


        } catch (Exception e) {
            logger.error("[MiniCat] start meet ex", e);
            throw new MiniCatException(e);
        }
    }

    private void handleSocket(Socket clientSocket) {
        try {
            logger.info("readRequestString start");
            String requestString = readRequestString(clientSocket);
            logger.info("readRequestString end");

            // 这里模拟一下耗时呢
            TimeUnit.SECONDS.sleep(5);

            // 写回到客户端
            logger.info("writeToClient start");
            writeToClient(clientSocket, requestString);
            logger.info("writeToClient end");

            // 关闭连接
            clientSocket.close();
        } catch (IOException | InterruptedException e) {
            logger.error("");
        }
    }

    private void writeToClient(Socket clientSocket, String requestString) throws IOException {
        OutputStream outputStream = clientSocket.getOutputStream();
        String httpText = InnerHttpUtil.http200Resp("ECHO: \r\n" + requestString);
        outputStream.write(httpText.getBytes("UTF-8"));
    }

    private String readRequestString(Socket clientSocket) throws IOException {
        // 从Socket获取输入流
        BufferedReader reader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
        StringBuilder requestBuilder = new StringBuilder();
        String line;
        // 读取HTTP请求直到空行（表示HTTP请求结束）
        while ((line = reader.readLine()) != null && !line.isEmpty()) {
            requestBuilder.append(line).append("\n");
        }
        return requestBuilder.toString();
    }

}
```

其实这个还是不够的，测试发现这里的 socket 其实还是阻塞的。

# v3-nio

nio 可以让 socket 不再阻塞

```java
package com.github.houbb.minicat.bs.servlet;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;
import com.github.houbb.minicat.util.InnerHttpUtil;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.TimeUnit;

public class MiniCatBootstrapNioSocket {

    private static final Log logger = LogFactory.getLog(MiniCatBootstrapNioSocket.class);

    private final int port;
    private ServerSocketChannel serverSocketChannel;
    private Selector selector;

    public MiniCatBootstrapNioSocket() {
        this.port = 8080;
    }

    public void start() {
        logger.info("[MiniCat] start listen on port {}", port);
        logger.info("[MiniCat] visit url http://{}:{}", "127.0.0.1", port);

        try {
            serverSocketChannel = ServerSocketChannel.open();
            serverSocketChannel.bind(new InetSocketAddress(port));
            serverSocketChannel.configureBlocking(false);

            selector = Selector.open();
            serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

            while (true) {
                int readyChannels = selector.select();
                if (readyChannels == 0) {
                    continue;
                }

                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

                while (keyIterator.hasNext()) {
                    SelectionKey key = keyIterator.next();

                    if (key.isAcceptable()) {
                        handleAccept(key);
                    } else if (key.isReadable()) {
                        handleRead(key);
                    }

                    keyIterator.remove();
                }
            }
        } catch (IOException | InterruptedException e) {
            logger.error("[MiniCat] start meet ex", e);
            throw new MiniCatException(e);
        }
    }

    private void handleAccept(SelectionKey key) throws IOException {
        ServerSocketChannel serverSocketChannel = (ServerSocketChannel) key.channel();
        SocketChannel socketChannel = serverSocketChannel.accept();
        socketChannel.configureBlocking(false);
        socketChannel.register(selector, SelectionKey.OP_READ);
    }

    private void handleRead(SelectionKey key) throws IOException, InterruptedException {
        logger.info("handle read start");
        SocketChannel socketChannel = (SocketChannel) key.channel();
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        StringBuilder requestBuilder = new StringBuilder();

        int bytesRead = socketChannel.read(buffer);
        while (bytesRead > 0) {
            buffer.flip();
            while (buffer.hasRemaining()) {
                requestBuilder.append((char) buffer.get());
            }
            buffer.clear();
            bytesRead = socketChannel.read(buffer);
        }

        String requestString = requestBuilder.toString();
        logger.info("handle read requestString={}", requestString);

        TimeUnit.SECONDS.sleep(5); // 模拟耗时操作

        logger.info("start write");
        writeToClient(socketChannel, requestString);
        logger.info("end writeToClient");

        socketChannel.close();
    }

    private void writeToClient(SocketChannel socketChannel, String requestString) throws IOException {
        String httpText = InnerHttpUtil.http200Resp("ECHO: \r\n" + requestString);
        ByteBuffer buffer = ByteBuffer.wrap(httpText.getBytes("UTF-8"));
        socketChannel.write(buffer);
    }

}
```

# v4-nio+thread

不过测试发现，依然会阻塞在 sleep 的地方。

调整如下：

```java
package com.github.houbb.minicat.bs.servlet;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;
import com.github.houbb.minicat.util.InnerHttpUtil;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class MiniCatBootstrapNioThreadSocket {

    private static final Log logger = LogFactory.getLog(MiniCatBootstrapNioThreadSocket.class);

    private final int port;
    private ServerSocketChannel serverSocketChannel;
    private Selector selector;
    private ExecutorService threadPool;

    public MiniCatBootstrapNioThreadSocket() {
        this.port = 8080;
        this.threadPool = Executors.newFixedThreadPool(10); // 10个线程的线程池
    }

    public void start() {
        logger.info("[MiniCat] start listen on port {}", port);
        logger.info("[MiniCat] visit url http://{}:{}", "127.0.0.1", port);

        try {
            serverSocketChannel = ServerSocketChannel.open();
            serverSocketChannel.bind(new InetSocketAddress(port));
            serverSocketChannel.configureBlocking(false);

            selector = Selector.open();
            serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

            while (true) {
                int readyChannels = selector.select();
                if (readyChannels == 0) {
                    continue;
                }

                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

                while (keyIterator.hasNext()) {
                    SelectionKey key = keyIterator.next();

                    if (key.isAcceptable()) {
                        handleAccept(key);
                    } else if (key.isReadable()) {
                        handleRead(key);
                    }

                    keyIterator.remove();
                }
            }
        } catch (IOException e) {
            logger.error("[MiniCat] start meet ex", e);
            throw new MiniCatException(e);
        }
    }

    private void handleAccept(SelectionKey key) throws IOException {
        ServerSocketChannel serverSocketChannel = (ServerSocketChannel) key.channel();
        SocketChannel socketChannel = serverSocketChannel.accept();
        socketChannel.configureBlocking(false);
        socketChannel.register(selector, SelectionKey.OP_READ);
    }

    private void handleRead(SelectionKey key) throws IOException {
        threadPool.execute(() -> {
            try {
                SocketChannel socketChannel = (SocketChannel) key.channel();
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                StringBuilder requestBuilder = new StringBuilder();

                int bytesRead = socketChannel.read(buffer);
                while (bytesRead > 0) {
                    buffer.flip();
                    while (buffer.hasRemaining()) {
                        requestBuilder.append((char) buffer.get());
                    }
                    buffer.clear();
                    bytesRead = socketChannel.read(buffer);
                }

                String requestString = requestBuilder.toString();
                logger.info("read requestString={}", requestString);

                TimeUnit.SECONDS.sleep(5); // 模拟耗时操作
                writeToClient(socketChannel, requestString);
                logger.info("writeToClient done");
                socketChannel.close();
            } catch (InterruptedException | IOException e) {
                logger.error("[MiniCat] error processing request", e);
            }
        });
    }

    private void writeToClient(SocketChannel socketChannel, String requestString) throws IOException {
        String httpText = InnerHttpUtil.http200Resp("ECHO: \r\n" + requestString);
        ByteBuffer buffer = ByteBuffer.wrap(httpText.getBytes("UTF-8"));
        socketChannel.write(buffer);
    }

    public void shutdown() {
        try {
            threadPool.shutdown();
            threadPool.awaitTermination(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            logger.error("[MiniCat] error shutting down thread pool", e);
            Thread.currentThread().interrupt();
        } finally {
            try {
                selector.close();
                serverSocketChannel.close();
            } catch (IOException e) {
                logger.error("[MiniCat] error closing server socket", e);
            }
        }
    }

}
```

# v5-netty

看的出来，我们废了很大的精力才实现了 nio。

其实 netty 就是针对 nio api 设计的过于复杂的问题，做了大量的改进和优化。

我们来一起欣赏一下 netty 的版本：

```java
package com.github.houbb.minicat.bs.servlet;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;


public class MiniCatBootstrapNetty {

    private static final Log logger = LogFactory.getLog(MiniCatBootstrapNetty.class);

    /**
     * 启动端口号
     */
    private final int port;

    public MiniCatBootstrapNetty() {
        this.port = 8080;
    }

    public void start() {
        logger.info("[MiniCat] start listen on port {}", port);
        logger.info("[MiniCat] visit url http://{}:{}", "127.0.0.1", port);

        EventLoopGroup bossGroup = new NioEventLoopGroup();
        //worker 线程池的数量默认为 CPU 核心数的两倍
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            serverBootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new MiniCatNettyServerHandler());
                        }
                    })
                    .option(ChannelOption.SO_BACKLOG, 128)
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            // Bind and start to accept incoming connections.
            ChannelFuture future = serverBootstrap.bind(port).sync();

            // Wait until the server socket is closed.
            future.channel().closeFuture().sync();
        } catch (InterruptedException e) {
            logger.error("[MiniCat] start meet ex", e);
            throw new MiniCatException(e);
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }

}
```

```java
package com.github.houbb.minicat.bs.servlet;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.util.InnerHttpUtil;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;

import java.nio.charset.Charset;
import java.util.concurrent.TimeUnit;

public class MiniCatNettyServerHandler extends ChannelInboundHandlerAdapter {

    private static final Log logger = LogFactory.getLog(MiniCatNettyServerHandler.class);

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        ByteBuf buf = (ByteBuf) msg;
        byte[] bytes = new byte[buf.readableBytes()];
        buf.readBytes(bytes);
        String requestString = new String(bytes, Charset.defaultCharset());
        logger.info("channelRead requestString={}", requestString);

        // Simulating some processing time
        try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        String respText = InnerHttpUtil.http200Resp("ECHO: \r\n" + requestString);;
        ByteBuf responseBuf = Unpooled.copiedBuffer(respText.getBytes());
        ctx.writeAndFlush(responseBuf)
                .addListener(ChannelFutureListener.CLOSE); // Close the channel after sending the response
        logger.info("channelRead writeAndFlush DONE");
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.flush();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        logger.error("exceptionCaught", cause);
        ctx.close();
    }
}
```

# 开源地址

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)

# 参考资料

https://www.cnblogs.com/isdxh/p/14199711.html

https://blog.csdn.net/u011662320/article/details/65631800

[java获取路径，文件名的方法总结](https://blog.csdn.net/dudefu011/article/details/49911287)

https://blog.csdn.net/pange1991/article/details/86100527

https://xz.aliyun.com/t/10462?time__1311=mq%2BxBDyDcDnA37KDsD7meexYqWTEQKe3W4D&alichlgref=https%3A%2F%2Fwww.google.com%2F
https://www.cnblogs.com/zzdbullet/p/9527263.html
https://durant35.github.io/2016/07/16/linux_%E7%9E%8E%E8%B0%88Socket%E7%BC%96%E7%A8%8B_2/
https://blog.csdn.net/u012441924/article/details/70157280

https://juejin.cn/post/6857476504582881294
https://zhuanlan.zhihu.com/p/38637493

* any list
{:toc}
---
layout: post
title: Netty 权威指南-07-Netty 实战：如何实现文件服务器？
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# 文件服务器

实现一个可以展示指定用户输入的文件路径，返回对应文件内容的服务器。

# 实例代码

## 服务端

```java
public class FileServer {

    public static void main(String[] args) {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            ChannelFuture channelFuture = serverBootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            // 编码 String
                            ch.pipeline().addLast(new StringEncoder(CharsetUtil.UTF_8))
                                    // 按照行进行解码
                                    .addLast(new LineBasedFrameDecoder(1024))
                                    // String 解码
                                    .addLast(new StringDecoder(CharsetUtil.UTF_8))
                                    // 大数据流的处理
                                    .addLast(new ChunkedWriteHandler())
                                    .addLast(new FileServerHandler());

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

## FileServerHandler.java

针对文件服务器的处理，实现如下：

```java
import java.io.RandomAccessFile;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.stream.ChunkedFile;

public class FileServerHandler extends SimpleChannelInboundHandler<String> {

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // 提醒客户端输入文件路径
        ctx.writeAndFlush("HELLO: Type the path of the file to retrieve.\n");
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, String msg) throws Exception {
        // 只读方式打开文件
        try(RandomAccessFile file = new RandomAccessFile(msg, "r")) {
            long length = file.length();
            ctx.write("OK: " + length + '\n');

            ctx.write(new ChunkedFile(file));
            ctx.writeAndFlush("\n");
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}
```


整体比较简单，exceptionCaught 为异常时的处理。

channelActive() 为客户端连接时，服务端返回客户端的提示。

channelRead0() 为服务端对于客户端的反馈，就是通过客户端输入的文件路劲，返回文件内容。

## 测试验证

我们直接使用本地的 telnet 

- 打开命令行

输入 `telnet localhost 8889`

```
192:~ houbinbin$ telnet localhost 8889
Trying ::1...
Connected to localhost.
Escape character is '^]'.
HELLO: Type the path of the file to retrieve.
```

- 输入文件路径

```java
/Users/houbinbin/code/_github/netty-learn/netty-learn-four/src/main/java/com/github/houbb/netty/learn/four/file/FileServer.java
```

反馈如下：

就是把 FileServer.java 这个文件内容全部返回回来了。

```
OK: 2387
/*
 * Copyright (c)  2019. houbinbin Inc.
 * netty-learn All rights reserved.
 */

package com.github.houbb.netty.learn.four.file;

....... 内容省略

/**
 * <p> </p>
 *
 * <pre> Created: 2019/9/21 11:49 PM  </pre>
 * <pre> Project: netty-learn  </pre>
 *
 * @author houbinbin
 */
public class FileServer {

    public static void main(String[] args) {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        .... 内容省略
    }

}

Connection closed by foreign host.
```

# 拓展阅读

[面试经典：linux 的 5 种 I/O 模型详解](https://www.toutiao.com/item/6908238524617785863/)

[java 中的 BIO/NIO/AIO 详解](https://www.toutiao.com/item/6908281789907730947/)

[为什么选择 Netty？Netty 入门教程](https://www.toutiao.com/item/6908298138885603844/)

[netty 解决拆包和粘包问题的 4 种方法，你会几种？](https://www.toutiao.com/item/6908695608308154894/)

[netty 服务端启动流程源码详解](https://www.toutiao.com/item/6909058613290009092/)

[netty 客户端启动流程及源码详解](https://www.toutiao.com/item/6909457669397168644/)

# 小结

可以发现基于 netty 实现一个文件的读写工具其实并不难。

我当时的第一个感觉是可以实现一个日志实时刷新的界面，感兴趣的小伙伴也可以自己实现以下。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 源码阅读

## 我们使用的 handler

```java
.childHandler(new ChannelInitializer<SocketChannel>() {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
        // 编码 String
        ch.pipeline().addLast(new StringEncoder(CharsetUtil.UTF_8))
                // 按照行进行解码
                .addLast(new LineBasedFrameDecoder(1024))
                // String 解码
                .addLast(new StringDecoder(CharsetUtil.UTF_8))
                // 大数据流的处理
                .addLast(new ChunkedWriteHandler())
                .addLast(new FileServerHandler());
    }
})
```

这里我们使用了多个 netty 内置的 handler。

下面来简单学习一下。

ps: 此处跳过 String 的编码器和解码器。

# 拓展阅读

## LineBasedFrameDecoder

TODO...

## FileServerHandler


# 参考资料

[netty 官方例子](https://netty.io/4.1/xref/io/netty/example/http/file/package-summary.html)

[利用Netty中提供的HttpChunk简单实现文件传输](http://www.west999.com/cms/wiki/code/2018-07-20/36526.html)

* any list
{:toc}
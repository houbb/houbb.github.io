---
layout: post
title:  Netty 写大型数据
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, http, sh]
published: true
---

# 写大型数据

因为网络饱和的可能性，如何在异步框架中高效地写大块的数据是一个特殊的问题。

由于写操作是非阻塞的，所以即使没有写出所有的数据，写操作也会在完成时返回并通知ChannelFuture。

当这种情况发生时，如果仍然不停地写入，就有内存耗尽的风险。

所以在写大型数据时，需要准备好处理到远程节点的连接是慢速连接的情况，这种情况会导致内存释放的延迟。

让我们考虑下将一个文件内容写出到网络的情况。

在我们讨论传输（见4.2 节）的过程中，提到了NIO 的零拷贝特性，这种特性消除了将文件的内容从文件系统移动到网络栈的复制过程。所有的这一切都发生在Netty 的核心中，所以应用程序所有需要做的就是使用一个FileRegion 接口的实现，

其在Netty 的API 文档中的定义是：“通过支持零拷贝的文件传输的Channel 来发送的文件区域。”

## 示例代码

代码清单11-11 展示了如何通过从FileInputStream创建一个DefaultFileRegion，并将其写入Channel。从而利用零拷贝特性来传输一个文件的内容。

```java
import io.netty.channel.*;

import java.io.File;
import java.io.FileInputStream;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class CommonInit extends ChannelInitializer<Channel> {

    @Override
    protected void initChannel(Channel ch) throws Exception {
        final File file  = new File("1.txt");
        FileInputStream fileInputStream = new FileInputStream(file);
        FileRegion fileRegion = new DefaultFileRegion(fileInputStream.getChannel(), 0, file.length());

        // 直接写入
        ch.writeAndFlush(fileRegion)
                .addListener(new ChannelFutureListener() {
                    @Override
                    public void operationComplete(ChannelFuture future) throws Exception {
                        if(!future.isSuccess()) {
                            future.cause().printStackTrace();
                        }
                    }
                });
    }
}
```

当然这种方式非常的原始，可能导致 OOM。

这个示例只适用于文件内容的直接传输，不包括应用程序对数据的任何处理。

# ChunkedWriteHandler 类

在需要将数据从文件系统复制到用户内存中时，可以使用 ChunkedWriteHandler，它支持异步写大型数据流，而又不会导致大量的内存消耗。

## 核心 API

关键是interface ChunkedInput<B>，其中类型参数B 是readChunk()方法返回的类型。

Netty 预置了该接口的4 个实现，如表11-7 中所列出的。每个都代表了一个将由Chunked-WriteHandler 处理的不定长度的数据流。

```
ChunkedFile         从文件中逐块获取数据，当你的平台不支持零拷贝或者你需要转换数据时使用
ChunkedNioFile      和ChunkedFile 类似，只是它使用了FileChannel
ChunkedStream       从InputStream 中逐块传输内容
ChunkedNioStream    从ReadableByteChannel 中逐块传输内容
```

## 示例代码

代码清单11-12 说明了ChunkedStream 的用法，它是实践中最常用的实现。

所示的类使用了一个File 以及一个SslContext 进行实例化。

当initChannel()方法被调用时，它将使用所示的ChannelHandler 链初始化该Channel。

当Channel 的状态变为活动的时，WriteStreamHandler 将会逐块地把来自文件中的数据作为 ChunkedStream 写入。

数据在传输之前将会由SslHandler 加密。

- 流程梳理

1. 添加 ssl 加密

2. 添加 ChunkedWriteHandler 处理大文件

3. 在 channel.active 的时候，通过 ChunkedStream 写入数据。

```java
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.channel.ChannelInitializer;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslHandler;
import io.netty.handler.stream.ChunkedStream;
import io.netty.handler.stream.ChunkedWriteHandler;

import javax.net.ssl.SSLEngine;
import java.io.File;
import java.io.FileInputStream;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ChunkedChannelInit extends ChannelInitializer<Channel> {

    /**
     * 待传递的文件
     */
    private final File file;

    /**
     * SSL 上下文
     */
    private final SslContext sslContext;

    public ChunkedChannelInit(File file, SslContext sslContext) {
        this.file = file;
        this.sslContext = sslContext;
    }

    @Override
    protected void initChannel(Channel ch) throws Exception {
        //1. 构造 ssl
        SSLEngine sslEngine = sslContext.newEngine(ch.alloc());
        SslHandler sslHandler = new SslHandler(sslEngine, false);

        //2. 构建 pipeline
        ch.pipeline().addLast(sslHandler)
                .addLast(new ChunkedWriteHandler())
                .addLast(new WriteStreamHandler());
    }

    class WriteStreamHandler extends ChannelInboundHandlerAdapter {

        /**
         * 当 channel active 的时候，执行数据写入
         * @param ctx 上下文
         * @throws Exception 异常
         */
        @Override
        public void channelActive(ChannelHandlerContext ctx) throws Exception {
            super.channelActive(ctx);
            // 使用 ChunkedStream 来进行写入
            ctx.writeAndFlush(new ChunkedStream(new FileInputStream(file)));
        }
    }

}
```

## 逐块输入 

要使用你自己的ChunkedInput 实现，请在ChannelPipeline 中安装一个ChunkedWriteHandler。

在本节中，我们讨论了如何通过使用零拷贝特性来高效地传输文件，以及如何通过使用ChunkedWriteHandler 来写大型数据而又不必冒着导致OutOfMemoryError 的风险。

下一节中，我们将仔细研究几种序列化POJO 的方法。


# 参考资料

《Netty in Action》 P172

* any list
{:toc}
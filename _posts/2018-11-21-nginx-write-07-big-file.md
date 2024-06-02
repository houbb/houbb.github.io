---
layout: post
title:  从零手写实现 nginx-07-大文件传输 分块传输（chunked transfer）/ 分页传输（paging）
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---


# 前言

大家好，我是老马。很高兴遇到你。

我们希望实现最简单的 http 服务信息，可以处理静态文件。

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

## 手写 nginx 系列

如果你对 nginx 原理感兴趣，可以阅读：

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[从零手写实现 nginx-06-文件夹自动索引](https://houbb.github.io/2018/11/22/nginx-write-06-dir-list)

[从零手写实现 nginx-07-大文件下载](https://houbb.github.io/2018/11/22/nginx-write-07-big-file)

[从零手写实现 nginx-08-范围查询](https://houbb.github.io/2018/11/22/nginx-write-08-range)

[从零手写实现 nginx-09-文件压缩](https://houbb.github.io/2018/11/22/nginx-write-09-comparess)

[从零手写实现 nginx-10-sendfile 零拷贝](https://houbb.github.io/2018/11/22/nginx-write-10-sendfile)

[从零手写实现 nginx-11-file+range 合并](https://houbb.github.io/2018/11/22/nginx-write-11-file-and-range-merge)

[从零手写实现 nginx-12-keep-alive 连接复用](https://houbb.github.io/2018/11/22/nginx-write-12-keepalive)

[从零手写实现 nginx-13-nginx.conf 配置文件介绍](https://houbb.github.io/2018/11/22/nginx-write-13-nginx-conf-intro)

[从零手写实现 nginx-14-nginx.conf 和 hocon 格式有关系吗？](https://houbb.github.io/2018/11/22/nginx-write-14-nginx-conf-hocon)

[从零手写实现 nginx-15-nginx.conf 如何通过 java 解析处理？](https://houbb.github.io/2018/11/22/nginx-write-15-nginx-conf-parser)

[从零手写实现 nginx-16-nginx 支持配置多个 server](https://houbb.github.io/2018/11/22/nginx-write-16-nginx-conf-multi-server)

# 目标

前面的内容我们实现了小文件的传输，但是如果文件的内容特别大，全部加载到内存会导致服务器报废。

那么，应该怎么解决呢？

## 思路

我们可以把一个非常大的文件直接拆分为多次，然后分段传输过去。

传输完成后，告诉浏览器已经传输完成了，发送一个结束标识即可。

# 大文件传输的方式

## 一次梭哈

这种方式通常用于发送较小的文件，因为整个文件内容会被加载到内存中。

代码示例：

```java
RandomAccessFile randomAccessFile = new RandomAccessFile(file, "r"); // 以只读的方式打开文件

long fileLength = randomAccessFile.length();
// 创建一个默认的HTTP响应
HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
// 设置Content Length
HttpUtil.setContentLength(response, fileLength);


// 读取文件内容到字节数组
byte[] fileContent = new byte[(int) fileLength];
int bytesRead = randomAccessFile.read(fileContent);
if (bytesRead != fileLength) {
    sendError(ctx, INTERNAL_SERVER_ERROR);
    return;
}

// 将文件内容转换为FullHttpResponse
FullHttpResponse fullHttpResponse = new DefaultFullHttpResponse(HTTP_1_1, OK);
fullHttpResponse.content().writeBytes(fileContent);
fullHttpResponse.headers().set(HttpHeaderNames.CONTENT_LENGTH, fileLength);
// 写入HTTP响应并关闭连接
ctx.writeAndFlush(fullHttpResponse).addListener(ChannelFutureListener.CLOSE);
```

这段代码的主要变化如下：

1. **读取文件内容**：使用`randomAccessFile.read(fileContent)`一次性读取整个文件到字节数组`fileContent`中。
2. **创建`FullHttpResponse`**：使用`DefaultFullHttpResponse`创建一个完整的HTTP响应对象，并将文件内容写入到响应的`content()`中。
3. **设置`Content-Length`**：在`FullHttpResponse`的headers中设置`Content-Length`。
4. **发送响应并关闭连接**：使用`ctx.writeAndFlush(fullHttpResponse)`一次性发送整个响应，并通过`.addListener(ChannelFutureListener.CLOSE)`确保在发送完成后关闭连接。

请注意，这种方式适用于文件大小不是很大的情况，因为整个文件内容被加载到了内存中。

如果文件非常大，这种方式可能会导致内存溢出。

对于大文件，推荐使用分块传输（chunked transfer）或者分页传输（paging）的方式。

## 分块传输（chunked transfer）

分块传输（Chunked Transfer）是一种HTTP协议中用于传输数据的方法，允许服务器在知道整个响应内容大小之前就开始发送数据。

这在发送大文件或动态生成的内容时非常有用。

以下是使用Netty实现分块传输的一个示例：

```java
RandomAccessFile randomAccessFile = new RandomAccessFile(file, "r"); // 以只读的方式打开文件
long fileLength = randomAccessFile.length();

// 创建一个默认的HTTP响应
HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);

// 由于是分块传输，移除Content-Length头
response.headers().remove(HttpHeaderNames.CONTENT_LENGTH);

// 如果request中有KEEP ALIVE信息
if (HttpUtil.isKeepAlive(request)) {
    response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
}

// 将HTTP响应写入Channel
ctx.write(response);

// 分块传输文件内容
final int chunkSize = 8192; // 设置分块大小
ByteBuffer buffer = ByteBuffer.allocate(chunkSize);
while (true) {
    int bytesRead = randomAccessFile.read(buffer.array());
    if (bytesRead == -1) { // 文件读取完毕
        break;
    }
    buffer.limit(bytesRead);
    // 写入分块数据
    ctx.write(new DefaultHttpContent(Unpooled.wrappedBuffer(buffer)));
    buffer.clear(); // 清空缓冲区以供下次使用
}

// 写入最后一个分块，即空的HttpContent，表示传输结束
ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT).addListener(ChannelFutureListener.CLOSE);
```

这段代码的主要变化如下：

1. **移除`Content-Length`头**：由于是分块传输，我们不需要在响应头中设置`Content-Length`。

2. **分块读取文件**：使用一个固定大小的缓冲区`ByteBuffer`来分块读取文件内容。

3. **发送分块数据**：在循环中，每次读取文件内容到缓冲区后，创建一个`DefaultHttpContent`对象，并将缓冲区的数据包装在`Unpooled.wrappedBuffer()`中，然后写入Channel。

4. **发送结束标记**：在文件读取完毕后，发送一个空的`LastHttpContent`对象，以标记HTTP消息体的结束。

5. **关闭连接**：在发送完最后一个分块后，使用`addListener(ChannelFutureListener.CLOSE)`确保关闭连接。

## 分页传输

分页传输通常是指将大文件分成多个小的部分（页），然后逐个发送这些部分。

这种方式适用于在网络编程中传输大文件，因为它可以减少内存的使用，并且允许接收方逐步处理数据。

在Netty中，实现分页传输通常涉及到手动控制数据的发送，而不是使用HTTP分块编码（chunked encoding）。

以下是一个简化的分页传输实现示例，我们将使用Netty的`FileRegion`来实现高效的文件传输：

```java
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.FileRegion;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.stream.ChunkedFile;

import java.io.RandomAccessFile;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FilePageTransfer {

    public static void sendFile(ChannelHandlerContext ctx, Path filePath) {
        try {
            RandomAccessFile randomAccessFile = new RandomAccessFile(filePath.toFile(), "r");
            FileChannel fileChannel = randomAccessFile.getChannel();

            long fileSize = fileChannel.size();
            long position = 0;
            final long pageSize = 8192; // 定义每页的大小，可以根据实际情况调整

            while (position < fileSize) {
                long remaining = fileSize - position;
                long size = remaining > pageSize ? pageSize : remaining;

                // 使用FileRegion进行传输
                FileRegion region = new DefaultFileRegion(fileChannel, position, size);
                ((SocketChannel) ctx.channel()).write(region);

                // 更新位置
                position += size;

                // 检查传输是否成功
                if (!region.isWritten()) {
                    // 传输失败，可以进行重试或者发送错误响应
                    break;
                }
            }

            // 发送结束标记
            ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT).addListener(ChannelFutureListener.CLOSE);
        } catch (IOException e) {
            e.printStackTrace();
            // 发送错误响应
            ctx.writeAndFlush(new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.NOT_FOUND));
        }
    }
}
```

在这个示例中，我们定义了一个`sendFile`方法，它接受一个`ChannelHandlerContext`和一个文件路径`Path`作为参数。以下是该方法的主要步骤：

1. **打开文件**：使用`RandomAccessFile`打开要传输的文件，并获取`FileChannel`。

2. **计算文件大小**：通过`fileChannel.size()`获取文件的总大小。

3. **分页传输**：使用一个循环来逐页读取文件内容。在每次迭代中，我们计算要传输的数据块的大小，并使用`FileRegion`来表示这部分数据。

4. **写入Channel**：将`FileRegion`写入Netty的`Channel`。

5. **更新位置**：更新`position`变量以指向下一页的开始位置。

6. **检查传输状态**：通过`region.isWritten()`检查数据是否成功写入。

7. **发送结束标记**：传输完成后，发送`LastHttpContent.EMPTY_LAST_CONTENT`来标记消息结束，并关闭连接。

8. **错误处理**：如果在传输过程中发生异常，发送一个错误响应。

请注意，这个示例是一个简化的版本，它没有处理HTTP协议的细节，也没有设置HTTP头信息。

在实际的HTTP服务器实现中，你需要在发送文件内容之前发送一个包含适当头信息的HTTP响应。

此外，`LastHttpContent.EMPTY_LAST_CONTENT`用于HTTP/1.1，如果你使用的是HTTP/1.0，可能需要不同的处理方式。

# 改进后的核心代码

## 统一的分发

为了避免实现膨胀，难以管理，我们将实现全部抽象。

```java
protected NginxRequestDispatch getDispatch(NginxRequestDispatchContext context) {
    final FullHttpRequest requestInfoBo = context.getRequest();
    final NginxConfig nginxConfig = context.getNginxConfig();
    // 消息解析不正确
    /*如果无法解码400*/
    if (!requestInfoBo.decoderResult().isSuccess()) {
        return NginxRequestDispatches.http400();
    }
    // 文件
    File targetFile = getTargetFile(requestInfoBo, nginxConfig);
    // 是否存在
    if(targetFile.exists()) {
        // 设置文件
        context.setFile(targetFile);
        // 如果是文件夹
        if(targetFile.isDirectory()) {
            return NginxRequestDispatches.fileDir();
        }
        long fileSize = targetFile.length();
        if(fileSize <= NginxConst.BIG_FILE_SIZE) {
            return NginxRequestDispatches.fileSmall();
        }
        return NginxRequestDispatches.fileBig();
    }  else {
        return NginxRequestDispatches.http404();
    }
}
```

## 大文件的核心逻辑

大文件我们使用 chunk 的方式

```java
    public void doDispatch(NginxRequestDispatchContext context) {
        final FullHttpRequest request = context.getRequest();
        final File targetFile = context.getFile();
        final String bigFilePath = targetFile.getAbsolutePath();
        final long fileLength = targetFile.length();


        logger.info("[Nginx] match big file, path={}", bigFilePath);

        HttpResponse response = new DefaultHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
        response.headers().set(HttpHeaderNames.CONTENT_DISPOSITION, "attachment; filename=\"" + targetFile.getName() + "\"");
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, InnerMimeUtil.getContentType(targetFile));
        response.headers().set(HttpHeaderNames.CONTENT_LENGTH, fileLength);

        final ChannelHandlerContext ctx = context.getCtx();
        ctx.write(response);

        // 分块传输文件内容
        long totalLength = targetFile.length();
        long totalRead = 0;

        try(RandomAccessFile randomAccessFile = new RandomAccessFile(targetFile, "r")) {
            ByteBuffer buffer = ByteBuffer.allocate(NginxConst.CHUNK_SIZE);
            while (true) {
                int bytesRead = randomAccessFile.read(buffer.array());
                if (bytesRead == -1) { // 文件读取完毕
                    break;
                }
                buffer.limit(bytesRead);
                // 写入分块数据
                ctx.write(new DefaultHttpContent(Unpooled.wrappedBuffer(buffer)));
                buffer.clear(); // 清空缓冲区以供下次使用

                // process 可以考虑加一个 listener
                totalRead += bytesRead;
                logger.info("[Nginx] bigFile process >>>>>>>>>>> {}/{}", totalRead, totalLength);
            }

            // 发送结束标记
            ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT)
                    .addListener(ChannelFutureListener.CLOSE);
        } catch (Exception e) {
            logger.error("[Nginx] bigFile meet ex", e);
        }
    }
```

这里采用的是直接下载的方式。

当然，也可以实现在线播放，但是试了下效果不好，后续有时间可以尝试下。

## 测试日志

```
[INFO] [2024-05-26 15:53:58.498] [nioEventLoopGroup-3-3] [c.g.h.n.s.h.NginxNettyServerHandler.channelRead0] - [Nginx] channelRead writeAndFlush start request=HttpObjectAggregator$AggregatedFullHttpRequest(decodeResult: success, version: HTTP/1.1, content: CompositeByteBuf(ridx: 0, widx: 0, cap: 0, components=0))
GET /mime/2.mp4 HTTP/1.1
Host: 192.168.1.12:8080
Connection: keep-alive
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
content-length: 0, id=40a5effffe257be0-00001c6c-00000003-0824dff434805bd3-b09fd676
[INFO] [2024-05-26 15:53:58.498] [nioEventLoopGroup-3-3] [c.g.h.n.s.r.d.h.AbstractNginxRequestDispatchFullResp.doDispatch] - [Nginx] match big file, path=D:\data\nginx4j\mime\2.mp4
[INFO] [2024-05-26 15:53:58.514] [nioEventLoopGroup-3-3] [c.g.h.n.s.r.d.h.AbstractNginxRequestDispatchFullResp.doDispatch] - [Nginx] bigFile process >>>>>>>>>>> 8388608/668918096
...
[INFO] [2024-05-26 15:53:59.616] [nioEventLoopGroup-3-3] [c.g.h.n.s.r.d.h.AbstractNginxRequestDispatchFullResp.doDispatch] - [Nginx] bigFile process >>>>>>>>>>> 668918096/668918096
[INFO] [2024-05-26 15:53:59.627] [nioEventLoopGroup-3-3] [c.g.h.n.s.h.NginxNettyServerHandler.channelRead0] - [Nginx] channelRead writeAndFlush DONE id=40a5effffe257be0-00001c6c-00000003-0824dff434805bd3-b09fd676
```

# 小结

本节我们实现了一个大文件的下载处理，主要思想就是分段。

可以考虑类似于视频软件，采用分段加载实时播放的方式。

下一节，我们考虑实现以下文件的范围查询。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 参考资料

https://www.cnblogs.com/luxiaoxun/p/3959450.html

https://www.cnblogs.com/carl10086/p/6185095.html

https://blog.csdn.net/suifeng3051/article/details/22800171

https://blog.csdn.net/sinat_34163739/article/details/108820355

* any list
{:toc}
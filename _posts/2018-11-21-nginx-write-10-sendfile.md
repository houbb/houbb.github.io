---
layout: post
title:  从零手写实现 nginx-10-sendfile 零拷贝 zero-copy
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---


# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

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

# 什么是零拷贝？

零拷贝（Zero Copy）是一种技术，用于在数据传输过程中减少或消除数据在用户空间和内核空间之间的拷贝次数，从而提高传输效率。

它广泛应用于文件传输、网络通信等场景，尤其是在处理大数据量传输时，零拷贝技术能够显著减少CPU的负载，提高系统性能。

### 零拷贝的基本原理

通常，数据在从磁盘读取到发送到网络的过程中，需要多次在用户空间和内核空间之间进行拷贝。

零拷贝技术通过减少这些拷贝操作，直接在内核空间内完成数据传输，避免了不必要的数据拷贝。

### 传统的数据传输流程

1. **从磁盘读取数据到内核空间**：操作系统将文件从磁盘读取到内核空间的缓冲区。
2. **从内核空间拷贝数据到用户空间**：应用程序调用`read`系统调用，将数据从内核缓冲区拷贝到用户空间的缓冲区。
3. **从用户空间拷贝数据到内核空间**：应用程序调用`write`系统调用，将数据从用户空间的缓冲区拷贝到内核空间的网络缓冲区。
4. **从内核空间发送数据到网络**：操作系统将数据从网络缓冲区发送到网络接口卡（NIC）。

整个过程涉及多次拷贝操作，增加了CPU和内存带宽的消耗。

### 零拷贝的数据传输流程

零拷贝技术通过减少数据在用户空间和内核空间之间的拷贝次数，提高数据传输效率。以下是几种常见的零拷贝实现方式：

1. **`sendfile`系统调用**

`sendfile`是Linux内核提供的系统调用，它允许直接将数据从文件描述符传输到网络套接字，而无需将数据拷贝到用户空间。其工作流程如下：

- 内核将文件数据从磁盘读取到内核缓冲区。
- 内核直接将数据从内核缓冲区传输到网络缓冲区，并发送到网络接口卡。

这种方式避免了数据在用户空间和内核空间之间的两次拷贝，提高了传输效率。

```c
ssize_t sendfile(int out_fd, int in_fd, off_t *offset, size_t count);
```

2. **`mmap`和`write`结合使用**

`mmap`系统调用将文件映射到用户空间的内存地址，通过内存映射，可以减少一次数据拷贝，但仍需一次从用户空间到内核空间的拷贝。工作流程如下：

- 使用`mmap`将文件映射到用户空间。
- 使用`write`将数据从映射的内存区域拷贝到网络缓冲区。

3. **`splice`系统调用**

`splice`是Linux 2.6.17引入的系统调用，允许将数据在两个文件描述符之间传输，而无需将数据拷贝到用户空间。其工作流程如下：

- 内核将文件数据从磁盘读取到内核缓冲区。
- 内核直接将数据从内核缓冲区传输到另一个文件描述符（例如网络套接字）。

```c
ssize_t splice(int fd_in, loff_t *off_in, int fd_out, loff_t *off_out, size_t len, unsigned int flags);
```

### 零拷贝的优点

- **减少CPU负载**：由于减少了数据拷贝的次数，CPU的负载显著降低。
- **提高传输速度**：减少数据在内存中的拷贝操作，能够提高传输速度。
- **降低延迟**：减少数据在用户空间和内核空间之间的切换，提高了数据传输的实时性。

### 零拷贝的应用场景

- **大文件传输**：如视频文件、日志文件等大文件的网络传输。
- **高性能服务器**：如Web服务器、文件服务器等需要处理大量并发请求的服务器。
- **数据库系统**：如数据库备份、恢复等操作中涉及大数据量传输的场景。

# 核心代码调整

## 原始分块

```java
    /**
     * 分块传输-普通方式
     * @param context 上下文
     */
    protected void dispatchByRandomAccessFile(NginxRequestDispatchContext context) {
        final ChannelHandlerContext ctx = context.getCtx();
        final File targetFile = context.getFile();

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
                logger.info("[Nginx] file process >>>>>>>>>>> {}/{}", totalRead, totalLength);
            }

            // 结果响应
            ChannelFuture lastContentFuture = ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
            //如果不支持keep-Alive，服务器端主动关闭请求
            if (!HttpUtil.isKeepAlive(context.getRequest())) {
                lastContentFuture.addListener(ChannelFutureListener.CLOSE);
            }
        } catch (Exception e) {
            logger.error("[Nginx] file meet ex", e);
            throw new Nginx4jException(e);
        }
    }
```

### zero-copy

```java
    /**
     * Netty 之 FileRegion 文件传输: https://www.jianshu.com/p/447c2431ac32
     *
     * @param context 上下文
     */
    protected void dispatchByZeroCopy(NginxRequestDispatchContext context) {
        final ChannelHandlerContext ctx = context.getCtx();
        final File targetFile = context.getFile();

        // 分块传输文件内容
        long totalLength = targetFile.length();

        try {
            RandomAccessFile randomAccessFile = new RandomAccessFile(targetFile, "r");
            FileChannel fileChannel = randomAccessFile.getChannel();

            // 使用DefaultFileRegion进行零拷贝传输
            DefaultFileRegion fileRegion = new DefaultFileRegion(fileChannel, 0, totalLength);
            ChannelFuture transferFuture = ctx.writeAndFlush(fileRegion);

            // 监听传输完成事件
            transferFuture.addListener(new ChannelFutureListener() {
                @Override
                public void operationComplete(ChannelFuture future) {
                    try {
                        if (future.isSuccess()) {
                            // 传输完毕，发送最后一个空内容，标志传输结束
                            ChannelFuture lastContentFuture = ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
                            // 如果不支持keep-Alive，服务器端主动关闭请求
                            if (!HttpUtil.isKeepAlive(context.getRequest())) {
                                lastContentFuture.addListener(ChannelFutureListener.CLOSE);
                            }
                        } else {
                            // 处理传输失败
                            logger.error("[Nginx] file transfer failed", future.cause());
                            throw new Nginx4jException(future.cause());
                        }
                    } finally {
                        // 确保在所有操作完成之后再关闭文件通道和RandomAccessFile
                        try {
                            fileChannel.close();
                            randomAccessFile.close();
                        } catch (Exception e) {
                            logger.error("[Nginx] error closing file channel", e);
                        }
                    }
                }
            });

            // 记录传输进度（如果需要，可以通过监听器或其他方式实现）
            logger.info("[Nginx] file process >>>>>>>>>>> {}", totalLength);

        } catch (Exception e) {
            logger.error("[Nginx] file meet ex", e);
            throw new Nginx4jException(e);
        }
    }
```

这里要注意，文件信息必须在传输完成后关闭。

因为 operationComplete 这个是异步的，直接 TRW 关闭资源会导致失败。很坑...


# DefaultFileRegion

`DefaultFileRegion`是Netty中实现零拷贝文件传输的一个核心类。

它允许你在不将文件内容复制到用户空间的情况下将文件直接传输到网络，极大地提高了大文件传输的效率。

下面是对`DefaultFileRegion`的详细介绍，包括其工作原理和使用方法。

### `DefaultFileRegion`的基本介绍

`DefaultFileRegion`类位于Netty的`io.netty.channel`包中。它实现了`FileRegion`接口，主要用于将文件的某个部分直接传输到网络套接字上，利用操作系统的零拷贝功能来提高效率。

### 工作原理

`DefaultFileRegion`通过调用操作系统的本地I/O方法（如Linux上的`sendfile`）实现零拷贝传输。它将数据从文件系统直接传输到网络栈，而不需要经过用户空间，这样可以避免不必要的数据拷贝，减少CPU使用，提高传输性能。

### 构造方法

```java
public DefaultFileRegion(FileChannel file, long position, long count)
```

- `file`: 要传输的文件的`FileChannel`。
- `position`: 文件传输的起始位置。
- `count`: 要传输的字节数。

### 主要方法

1. **transferTo**

```java
public long transferTo(WritableByteChannel target, long position) throws IOException
```
将文件的内容从给定的位置传输到目标`WritableByteChannel`。这个方法会调用操作系统的底层方法来执行零拷贝。

2. **count**

```java
public long count()
```
返回这个文件区域的字节数。

3. **position**

```java
public long position()
```
返回这个文件区域的起始位置。

### 使用示例

以下是一个使用`DefaultFileRegion`进行零拷贝文件传输的示例：

```java
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.DefaultFileRegion;
import io.netty.handler.codec.http.HttpUtil;
import io.netty.handler.codec.http.LastHttpContent;

import java.io.File;
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;

public void sendFile(ChannelHandlerContext ctx, File file) {
    try {
        RandomAccessFile randomAccessFile = new RandomAccessFile(file, "r");
        FileChannel fileChannel = randomAccessFile.getChannel();
        long fileLength = file.length();

        // Create a new DefaultFileRegion
        DefaultFileRegion fileRegion = new DefaultFileRegion(fileChannel, 0, fileLength);

        // Send the file region over the channel
        ChannelFuture sendFileFuture = ctx.writeAndFlush(fileRegion);

        // Add a listener to close the file channel after the send is complete
        sendFileFuture.addListener((ChannelFuture future) -> {
            fileChannel.close();
            randomAccessFile.close();
        });

        // If the request does not support keep-alive, close the connection
        if (!HttpUtil.isKeepAlive(request)) {
            sendFileFuture.addListener(ChannelFutureListener.CLOSE);
        }

    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

### 注意事项

1. **文件通道的管理**：确保在文件传输完成后正确关闭`FileChannel`和`RandomAccessFile`，避免资源泄漏。
2. **异常处理**：在传输过程中可能会遇到各种异常（如文件被删除或网络中断），需要进行适当的异常处理。
3. **线程安全**：确保`FileChannel`在传输过程中不会被其他线程关闭或修改。

### 适用场景

- **大文件传输**：`DefaultFileRegion`非常适合用于传输大文件，如视频流、日志文件等，因为它能显著降低CPU使用率。
- **高并发场景**：在高并发场景下，减少CPU的拷贝操作能提高系统的整体性能和吞吐量。

总之，`DefaultFileRegion`是Netty中实现高效文件传输的一个强大工具，通过使用操作系统的零拷贝机制，可以显著提高文件传输的效率。

## 介绍一下零拷贝

# 小结

本节我们实现了文件的压缩处理，这个对于文件的传输性能提升比较大。

当然，压缩+解压本身也是对性能有损耗的。要结合具体的压缩比等考虑。

下一节，我们考虑实现一下 cors 的支持。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)


-------------------------------------------------------------------------------------------------------------------------

# chat

## 详细介绍一下 sendfile

`sendfile` 是一个在 Linux 操作系统中用于高效文件传输的系统调用。

它允许一个进程（通常是 Web 服务器）直接将文件内容从文件描述符（file descriptor）传输到网络套接字（socket），而无需将数据首先复制到用户空间（应用程序空间）。

在传统的文件传输方式中，数据需要从内核空间复制到用户空间，然后再从用户空间复制到内核空间的网络缓冲区。这个过程涉及到多次数据复制，增加了 CPU 的负担和延迟。

`sendfile` 的工作机制如下：

1. **减少数据复制**：`sendfile` 允许数据直接在内核空间中从一个缓冲区传输到另一个缓冲区，无需通过用户空间。这减少了数据复制的步骤，从而降低了 CPU 的负载。

2. **提高性能**：由于减少了数据复制，`sendfile` 可以显著提高文件传输的性能，特别是在处理大量并发连接时。

3. **支持零拷贝（Zero-copy）**：在某些情况下，`sendfile` 可以实现零拷贝传输，即数据在内存中不需要被实际复制。这进一步提高了效率。

4. **适用于静态内容**：`sendfile` 特别适用于 Web 服务器传输静态内容，如图片、视频、CSS 和 JavaScript 文件等。

Nginx 中的 `sendfile` 指令：

在 Nginx 配置中，可以通过 `sendfile` 指令来启用或禁用 `sendfile` 功能。例如：

```nginx
sendfile on;  # 启用 sendfile
```

或者

```nginx
sendfile off; # 禁用 sendfile
```

默认情况下，Nginx 会启用 `sendfile` 功能，以提高文件传输的效率。

需要注意的是，`sendfile` 并不是在所有操作系统上都可用。它主要用于 Linux 系统，而在其他操作系统（如 Windows 或 macOS）上，Nginx 可能需要使用不同的机制来实现类似的性能优化。

此外，`sendfile` 的性能优势在高负载和高并发的场景下尤为明显。

对于低负载或低并发的场景，其性能提升可能不那么显著。

因此，是否启用 `sendfile` 功能，以及如何配置它，应根据实际的应用场景和需求来决定。

## Java netty 之类的，有没有办法实现 sendfile 类似的能力？

Java 及其网络编程框架，如 Netty，并没有直接对应于 Linux `sendfile` 系统调用的功能，因为 Java 是一个跨平台的语言，而 `sendfile` 是特定于 Linux 操作系统的。然而，Java 和 Netty 提供了一些机制和优化技术，可以在一定程度上模拟 `sendfile` 的效果，尤其是在减少数据复制和提高 I/O 效率方面。

以下是一些 Java 和 Netty 中可以用于提高文件传输效率的技术：

1. **ByteBuffer**：Java 的 `ByteBuffer` 是一个用于高效 I/O 操作的字节缓冲区。它允许直接在内存中读写数据，而不需要在用户空间和内核空间之间复制数据。

2. **FileChannel**：Java 的 `java.nio.channels.FileChannel` 类提供了对文件的内存映射访问，允许将文件内容直接映射到内存中，从而实现高效的文件 I/O 操作。

3. **内存映射文件（Memory-Mapped Files）**：通过 `FileChannel` 的 `map()` 方法，可以将文件区域映射到内存中，这样文件数据就可以像访问内存一样被访问，减少了数据复制的需要。

4. **零拷贝（Zero-Copy）**：Java 7 引入了 `FileChannel.transferTo()` 和 `FileChannel.transferFrom()` 方法，这些方法可以在不复制数据到用户空间的情况下，直接在内存和套接字之间传输数据，类似于零拷贝。

5. **Netty 的 FileRegion**：Netty 提供了 `FileRegion` 类，它允许将文件区域作为内存映射的缓冲区，直接用于网络传输。这可以在 Netty 的管道中实现高效的文件传输。

6. **直接缓冲区（Direct Buffers）**：Netty 支持使用直接缓冲区，这些缓冲区直接分配在堆外内存中，可以减少垃圾收集的影响，并提高 I/O 性能。

7. **I/O 优化**：Netty 本身就是为高性能 I/O 操作设计的，它使用了非阻塞 I/O 和事件驱动模型，可以有效地处理大量并发连接。

8. **自定义协议**：在某些情况下，可以通过自定义协议来优化数据传输，例如，通过减少协议开销和优化数据序列化/反序列化过程。

虽然 Java 和 Netty 没有直接的 `sendfile` 调用，但通过上述技术和策略，它们仍然可以实现高效的文件传输，减少数据复制，提高性能。

开发者需要根据具体的应用场景和需求来选择最合适的方法。

## 如何实现文件的压缩+零拷贝？

```java
public class NginxRequestDispatchFileCompress extends AbstractNginxRequestDispatchFullResp {

    private static final Log logger = LogFactory.getLog(AbstractNginxRequestDispatchFullResp.class);

    @Override
    protected FullHttpResponse buildFullHttpResponse(FullHttpRequest request,
                                                     final NginxConfig nginxConfig,
                                                     NginxRequestDispatchContext context) {
        final File targetFile = context.getFile();
        logger.info("[Nginx] match compress file, path={}", targetFile.getAbsolutePath());

        // 创建临时文件以存储压缩内容
        final File compressTempFile;
        try {
            compressTempFile = File.createTempFile("compressed_", ".gz");
        } catch (IOException e) {
            logger.error("[Nginx] Failed to create temp file for compressed data", e);
            throw new Nginx4jException(e);
        }

        // 压缩文件并写入临时文件
        try (GZIPOutputStream gzipOutputStream = new GZIPOutputStream(new FileOutputStream(compressTempFile))) {
            byte[] inputData = FileUtil.getFileBytes(targetFile);
            gzipOutputStream.write(inputData);
            gzipOutputStream.finish();
        } catch (IOException e) {
            logger.error("[Nginx] Compression failed", e);
            throw new Nginx4jException(e);
        }

        // 获取压缩文件的大小
        long compressedSize = compressTempFile.length();

        // 创建响应
        FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
        response.headers().set(HttpHeaderNames.CONTENT_ENCODING, HttpHeaderValues.GZIP);
        response.headers().set(HttpHeaderNames.CONTENT_LENGTH, compressedSize);
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, InnerMimeUtil.getContentTypeWithCharset(targetFile, context.getNginxConfig().getCharset()));

        // 检查请求是否接受GZIP编码
        if (request.headers().contains(HttpHeaderNames.ACCEPT_ENCODING) &&
            request.headers().get(HttpHeaderNames.ACCEPT_ENCODING).contains(HttpHeaderValues.GZIP)) {
            response.headers().set(HttpHeaderNames.VARY, HttpHeaderNames.ACCEPT_ENCODING);
        }

        // 使用FileRegion发送压缩文件
        try (FileChannel fileChannel = FileChannel.open(compressTempFile.toPath(), StandardOpenOption.READ)) {
            FileRegion fileRegion = new DefaultFileRegion(fileChannel, 0, compressedSize);
            ChannelHandlerContext ctx = context.getCtx();
            ctx.write(response);
            ctx.write(fileRegion, ctx.newProgressivePromise().addListener(new ChannelFutureListener() {
                @Override
                public void operationComplete(ChannelFuture future) {
                    fileRegion.release();
                    if (future.isSuccess()) {
                        logger.info("[Nginx] Sent compressed file");
                    } else {
                        logger.error("[Nginx] Failed to send compressed file", future.cause());
                    }
                }
            }));

            // 发送结束标记
            ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT).addListener(ChannelFutureListener.CLOSE);
        } catch (IOException e) {
            logger.error("[Nginx] Failed to open file channel for compressed file", e);
            throw new Nginx4jException(e);
        }

        return response;
    }

    // ... 其他方法保持不变
}
```

### 必须创建压缩文件吗？

不一定需要创建临时压缩文件。如果希望避免创建临时文件，可以使用内存映射文件（Memory-Mapped File）的方式或者直接使用Netty的压缩工具来压缩并发送数据。但是，这通常涉及到更复杂的逻辑，并且可能不会实现零拷贝。

Netty 提供了 `HttpContentCompressor` 用于压缩HTTP内容，但是它是用于压缩内存中的数据，而不是文件系统中的文件。如果你的数据量不大，可以考虑将文件内容读入内存，压缩后发送。但是，这违背了零拷贝的原则，因为数据会被加载到内存中。

如果你的应用场景允许在内存中处理数据，可以考虑使用以下方式：

```java
@Override
protected FullHttpResponse buildFullHttpResponse(FullHttpRequest request,
                                                  final NginxConfig nginxConfig,
                                                  NginxRequestDispatchContext context) {
    final File targetFile = context.getFile();
    logger.info("[Nginx] match compress file, path={}", targetFile.getAbsolutePath());

    // 读取文件内容
    byte[] fileContent = FileUtil.getFileBytes(targetFile);

    // 使用Netty的压缩工具压缩内容
    HttpContentCompressor compressor = new HttpContentCompressor();
    FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
    if (compressor.isCompressible(request, response)) {
        // 压缩内容
        response.content().writeBytes(fileContent);
        compressor.compress(response);
        response.headers().set(HttpHeaderNames.CONTENT_ENCODING, HttpHeaderValues.GZIP);
    } else {
        // 如果不压缩，直接发送原始内容
        response.content().writeBytes(fileContent);
    }

    // 设置其他响应头
    response.headers().set(HttpHeaderNames.CONTENT_TYPE, InnerMimeUtil.getContentTypeWithCharset(targetFile, context.getNginxConfig().getCharset()));
    // ... 设置其他必要的头信息

    return response;
}
```

请注意，`HttpContentCompressor` 需要在发送内容之前确定是否启用压缩，并且它会修改响应对象以应用压缩。

使用这种方式，你可以避免创建临时文件，但是你需要确保不会一次性将大文件加载到内存中，这可能会消耗大量内存并导致性能问题。

如果你需要处理大文件并希望实现零拷贝，通常需要使用文件系统中的零拷贝技术，如`sendfile()`系统调用，或者使用`FileRegion`来发送文件的一部分。

这些方法通常需要在服务器端进行特定的配置和支持。

# 压缩的零拷贝实现

## 方法1

零拷贝（Zero-copy）是一种技术，它允许数据在存储器之间传输时，不经过CPU的拷贝，从而提高数据传输的效率。在Java中，可以通过使用`java.nio`包中的`FileChannel`来实现零拷贝。以下是使用零拷贝技术重新实现的代码示例：

```java
import io.netty.buffer.ByteBuf;
import io.netty.buffer.ByteBufAllocator;
import io.netty.buffer.Unpooled;
import io.netty.handler.codec.http.*;
import java.io.*;
import java.nio.channels.FileChannel;
import java.util.zip.GZIPOutputStream;

public class NginxRequestDispatchFileCompress extends AbstractNginxRequestDispatchFullResp {

    private static final Log logger = LogFactory.getLog(AbstractNginxRequestDispatchFullResp.class);

    @Override
    protected FullHttpResponse buildFullHttpResponse(FullHttpRequest request,
                                                     final NginxConfig nginxConfig,
                                                     NginxRequestDispatchContext context) {
        final File targetFile = context.getFile();
        logger.info("[Nginx] match compress file, path={}", targetFile.getAbsolutePath());

        try {
            // 使用FileChannel实现零拷贝读取文件
            try (FileInputStream fis = new FileInputStream(targetFile);
                 FileChannel fileChannel = fis.getChannel()) {
                
                // 压缩内容
                ByteBuf compressedContent = compress(fileChannel, targetFile.length());
                FullHttpResponse response = new DefaultFullHttpResponse(
                        HttpVersion.HTTP_1_1, HttpResponseStatus.OK, compressedContent);

                // 设置压缩相关的响应头
                response.headers().set(HttpHeaderNames.CONTENT_ENCODING, HttpHeaderValues.GZIP);
                response.headers().set(HttpHeaderNames.CONTENT_LENGTH, response.content().readableBytes());
                response.headers().set(HttpHeaderNames.CONTENT_TYPE, InnerMimeUtil.getContentTypeWithCharset(targetFile, context.getNginxConfig().getCharset()));

                // 检查请求是否接受GZIP编码
                if (request.headers().contains(HttpHeaderNames.ACCEPT_ENCODING) &&
                        request.headers().get(HttpHeaderNames.ACCEPT_ENCODING).contains(HttpHeaderValues.GZIP)) {

                    // 添加Vary头，告知存在多个版本的响应
                    response.headers().set(HttpHeaderNames.VARY, HttpHeaderNames.ACCEPT_ENCODING);
                }

                return response;
            }
        } catch (IOException e) {
            logger.error("[Nginx] buildFullHttpResponse failed", e);
            throw new Nginx4jException(e);
        }
    }

    private ByteBuf compress(FileChannel fileChannel, long fileSize) throws IOException {
        ByteBufAllocator alloc = Unpooled.byteBufAllocator();
        ByteBuf buffer = alloc.ioBuffer((int) fileSize);

        // 使用FileChannel.transferTo实现零拷贝压缩
        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             GZIPOutputStream gzipOutputStream = new GZIPOutputStream(byteArrayOutputStream)) {
            fileChannel.transferTo(0, fileSize, gzipOutputStream);
            gzipOutputStream.finish();

            // 将压缩后的数据写入ByteBuf
            buffer.writeBytes(byteArrayOutputStream.toByteArray());
            return buffer;
        }
    }
}
```

在这个示例中，我使用了`FileChannel.transferTo`方法来实现零拷贝，它可以直接将文件内容传输到`GZIPOutputStream`中，而不需要通过CPU进行数据拷贝。

然后，我将压缩后的数据写入到`ByteBuf`中，以便构建响应。请注意，这个示例假设`fileSize`是已知的，并且有足够的内存来分配`ByteBuf`。

请注意，这个示例代码只是一个简化的版本，实际应用中可能需要更多的错误处理和资源管理。此外，由于`GZIPOutputStream`不支持零拷贝，所以这里仍然需要CPU拷贝数据到`ByteArrayOutputStream`中。如果需要完全的零拷贝，可能需要使用更底层的系统调用或特定的库来实现。




# 参考资料

https://www.cnblogs.com/luxiaoxun/p/3959450.html

https://www.cnblogs.com/carl10086/p/6185095.html

https://blog.csdn.net/suifeng3051/article/details/22800171

https://blog.csdn.net/sinat_34163739/article/details/108820355

* any list
{:toc}
---
layout: post
title:  从零手写实现 nginx-08-range 范围查询
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

# 什么是 http 范围查询？

HTTP范围请求（Range Requests）是一种让客户端可以请求资源（如文件）的一部分而不是全部的机制。

这在处理大文件时特别有用，例如，视频点播服务或大文件下载，用户可以请求文件的特定部分进行播放或下载。

范围请求通过在HTTP请求中添加`Range`头来实现。以下是`Range`头的一些关键点：

1. **语法**：
   `Range`头的语法遵循以下格式：
   ```
   Range: bytes=<start-byte>-<end-byte>
   ```
   其中`<start-byte>`和`<end-byte>`指定了请求的字节范围（包含）。如果`<end-byte>`被省略，服务器将从`<start-byte>`发送到文件的末尾。

2. **例子**：
   - 请求文件的前8192字节：
     ```
     Range: bytes=0-8191
     ```
   - 请求文件从第5120个字节开始到第10239个字节：
     ```
     Range: bytes=5120-10239
     ```
   - 请求文件从第2048个字节开始到文件末尾：
     ```
     Range: bytes=2048-
     ```

3. **响应**：
   如果服务器支持范围请求，并且请求的范围有效，服务器将返回状态码`206 Partial Content`，并将请求范围内的数据发送给客户端。
   
   服务器还需要在响应中包含`Content-Range`头，指示实际发送的数据范围。

4. **`Content-Range`头**：
   `Content-Range`头的格式如下：
   ```
   Content-Range: bytes <start-byte>-<end-byte>/<total-file-size>
   ```
   - `<start-byte>`和`<end-byte>`与请求中的范围对应。
   - `<total-file-size>`是资源的总大小。

5. **不支持范围请求**：
   如果服务器不支持范围请求，或者请求的范围无效（例如，开始字节大于文件大小），服务器将返回状态码`200 OK`，并发送资源的全部内容。

6. **多范围请求**：
   HTTP协议也支持请求多个非连续的范围，但这需要特定的服务器支持。多范围请求的`Range`头会包含多个范围，用逗号分隔：
   ```
   Range: bytes=500-600,601-700
   ```
   对于多范围请求，服务器可能返回多个部分，每个部分都有自己的`Content-Range`头，并且包装在`multipart/byteranges`的`Content-Type`中。

7. **用例**：
   范围请求常用于以下场景：
   - 恢复中断的下载。
   - 视频点播服务中的“快进”功能。
   - 大文件的增量更新或备份。

8. **注意事项**：
   - 并非所有的服务器都支持范围请求，这取决于服务器的配置和能力。
   - 对于不支持范围请求的资源，客户端仍然可以使用分块下载技术来实现类似的功能。

范围请求是HTTP协议中一个强大且灵活的特性，它为客户端提供了对资源访问的细粒度控制。

# netty 实现

## 流程

在Netty中实现HTTP范围请求（Range Requests），你需要处理HTTP请求，解析Range头，并根据请求的范围发送相应的响应。以下是实现这一功能的步骤：

1. **解析HTTP请求**：首先，你需要解析客户端发送的HTTP请求，特别是`Range`请求头。

2. **处理Range头**：根据`Range`头指定的范围，确定要发送的字节区间。

3. **构造HTTP响应**：创建HTTP响应，如果范围有效，设置状态码为`206 Partial Content`，否则使用`200 OK`。

4. **设置Content-Range头**：在响应中添加`Content-Range`头，指示实际发送的数据范围。

5. **发送数据**：使用适当的方式发送请求范围内的数据。

6. **结束响应**：发送结束标记，如`LastHttpContent.EMPTY_LAST_CONTENT`。

## 核心实现

```java
    public void doDispatch(NginxRequestDispatchContext context) {
        final HttpRequest request = context.getRequest();
        final File file = context.getFile();
        final ChannelHandlerContext ctx = context.getCtx();

        // 解析Range头
        String rangeHeader = request.headers().get("Range");
        logger.info("[Nginx] fileRange start rangeHeader={}", rangeHeader);

        long fileLength = file.length(); // 假设file是你要发送的File对象
        long[] range = parseRange(rangeHeader, fileLength);
        long start = range[0];
        long end = range[1];

        // 构造HTTP响应
        HttpResponse response = new DefaultHttpResponse(HttpVersion.HTTP_1_1,
                start < 0 ? HttpResponseStatus.OK : HttpResponseStatus.PARTIAL_CONTENT);
        // 设置Content-Type
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, InnerMimeUtil.getContentType(file));

        if (start >= 0) {
            // 设置Content-Range
            if (end < 0) {
                end = fileLength - 1;
            }
            response.headers().set(HttpHeaderNames.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileLength);

            // 设置Content-Length
            int contentLength = (int) (end - start + 1);
            response.headers().set(HttpHeaderNames.CONTENT_LENGTH, contentLength);

            // 发送响应头
            ctx.write(response);

            try (FileChannel fileChannel = FileChannel.open(file.toPath(), StandardOpenOption.READ)) {
                fileChannel.position(start); // 设置文件通道的起始位置

                ByteBuffer buffer = ByteBuffer.allocate(NginxConst.CHUNK_SIZE);
                while (end >= start) {
                    // 读取文件到ByteBuffer
                    int bytesRead = fileChannel.read(buffer);
                    if (bytesRead == -1) { // 文件读取完毕
                        break;
                    }
                    buffer.flip(); // 切换到读模式
                    ctx.write(new DefaultHttpContent(Unpooled.wrappedBuffer(buffer)));
                    buffer.compact(); // 保留未读取的数据，并为下次读取腾出空间
                    start += bytesRead; // 更新下一个读取的起始位置
                }
                ctx.flush(); // 确保所有数据都被发送

                // 发送结束标记
                ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT)
                        .addListener(ChannelFutureListener.CLOSE); // 如果连接断开，则关闭
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

        }
    }
```

范围处理如下：

```java
    protected long[] parseRange(String rangeHeader, long totalLength) {
        // 简单解析Range头，返回[start, end]
        // Range头格式为: "bytes=startIndex-endIndex"
        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            String range = rangeHeader.substring("bytes=".length());
            String[] parts = range.split("-");
            long start = parts[0].isEmpty() ? totalLength - 1 : Long.parseLong(parts[0]);
            long end = parts.length > 1 ? Long.parseLong(parts[1]) : totalLength - 1;
            return new long[]{start, end};
        }
        return new long[]{-1, -1}; // 表示无效的范围请求
    }
```

## 请求测试

```
>curl -i -H "Range: bytes=0-" http://192.168.1.12:8080/mime/1.css
HTTP/1.1 206 Partial Content
content-type: text/css
content-range: bytes 0-198/199
content-length: 199

body {
       font-family: Arial, sans-serif;
       margin: 0;
       padding: 0;
   }

   h1 {
       color: #333333;
   }

   .container {
       width: 80%;
       margin: auto;
   }

>curl -i -H "Range: bytes=127-" http://192.168.1.12:8080/mime/1.css
HTTP/1.1 206 Partial Content
content-type: text/css
content-range: bytes 127-198/199
content-length: 72


   }

   .container {
       width: 80%;
       margin: auto;
   }
```

或者过长的内容：

```
>curl -i -H "Range: bytes=255-" http://192.168.1.12:8080/mime/1.css
HTTP/1.1 206 Partial Content
content-type: text/css
content-range: bytes 255-198/199
curl: (8) Invalid Content-Length: value
```

------------------------------------------------------------------------------------------------

# chat

## nginx 是如何支持分段查询的？如何配置

Nginx 是一款高性能的 HTTP 和反向代理服务器，它支持 HTTP 范围请求（Range Requests），允许客户端请求文件的特定部分。

Nginx 通过配置文件来设置其行为，对于范围请求，通常不需要特别的配置，因为 Nginx 默认就支持它。

然而，Nginx 的配置可以影响其对范围请求的处理方式。

以下是一些与范围请求相关的配置指令：

1. **`sendfile`**：
   `sendfile` 指令用于决定是否使用 `sendfile` 系统调用来传输文件。这个指令对性能有重要影响，因为它允许操作系统内核直接将文件内容发送到网络，减少了用户空间和内核空间之间的数据复制。

   ```nginx
   sendfile on;  # 开启 sendfile
   sendfile off; # 关闭 sendfile
   ```

2. **`sendfile_max_chunk`**：
   当 `sendfile` 开启时，`sendfile_max_chunk` 指令用于设置每次 `sendfile` 调用传输的最大数据量。这可以影响范围请求的响应大小。

   ```nginx
   sendfile_max_chunk 4k; # 设置最大传输块为 4 KB
   ```

3. **`ignore_invalid_headers`**：
   如果客户端发送了无效的请求头，`ignore_invalid_headers` 指令可以告诉 Nginx 忽略这些无效头并继续处理请求。

   ```nginx
   ignore_invalid_headers on; # 忽略无效头
   ```

4. **`tcp_nopush`** 和 **`tcp_nodelay`**：
   这两个指令用于调整 TCP 套接字的行为，可以影响数据的发送方式，从而影响范围请求的性能。

   ```nginx
   tcp_nopush on;  # 开启 TCP_NOPUSH，禁用 Nagle 算法
   tcp_nodelay on;  # 开启 TCP_NODELAY，禁用 Nagle 算法
   ```

5. **`chunked_transfer_encoding`**：
   虽然这个指令主要用于输出过滤阶段，但它可以影响 Nginx 是否使用分块传输编码发送响应。

   ```nginx
   chunked_transfer_encoding on;  # 开启分块传输编码
   ```

6. **日志记录**：
   Nginx 可以配置日志来记录范围请求。通过访问日志，你可以分析客户端发出的范围请求。

要配置 Nginx 以优化范围请求的处理，你可以编辑 Nginx 配置文件（通常位于 `/etc/nginx/nginx.conf` 或 `/etc/nginx/sites-available/` 目录下的某个文件），并添加或修改上述指令。

以下是一个简单的 Nginx 配置示例，展示了如何设置这些指令：

```nginx
http {
    sendfile on;
    sendfile_max_chunk 4k;
    ignore_invalid_headers on;
    tcp_nopush on;
    tcp_nodelay on;
    chunked_transfer_encoding on;

    server {
        listen 80;
        server_name example.com;
        root /var/www/html;
        index index.html index.htm;

        # 其他配置...
    }
}
```

在修改了 Nginx 配置文件后，你需要重新加载或重启 Nginx 服务以使更改生效。可以使用以下命令：

```bash
sudo nginx -s reload  # 重新加载配置文件
sudo systemctl restart nginx  # 重启 Nginx 服务
```

请注意，配置 Nginx 时应该根据你的具体需求和服务器环境来调整这些设置。



# 小结

本节我们实现了文件的范围查询，这个在断点续传，视频播放时还是非常方便的。

下一节，我们考虑实现以下文件的压缩处理，提升传输的效率。

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
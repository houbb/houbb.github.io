---
layout: post
title:  从零手写实现 nginx-09-compress http 文件压缩
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

# 什么是 http 压缩

HTTP压缩是一种网络优化技术，用于减少在客户端和服务器之间传输的数据量。

通过压缩响应内容（如HTML、CSS、JavaScript、图片等），可以加快加载速度，减少带宽消耗，提升用户体验。

HTTP压缩通常在服务器端进行，客户端接收到压缩后的数据后进行解压缩。

以下是HTTP压缩的一些关键点：

1. **压缩算法**：
   - **GZIP**：最常用的压缩格式，广泛支持各种压缩级别。
   - **DEFLATE**：与GZIP类似，但通常不包含文件元数据。
   - **Brotli**：一种较新的压缩算法，提供比GZIP更好的压缩比率，被现代浏览器支持。
   - **其他**：如Zstandard（Zstd），也是一种高效的压缩算法，但浏览器支持度较低。

2. **HTTP头信息**：
   - **`Content-Encoding`**：响应头，指示数据使用的压缩格式。
   - **`Accept-Encoding`**：请求头，客户端通过此头通知服务器它支持的压缩格式。
   - **`Vary`**：响应头，用于指示响应内容会根据不同的请求头（如`Accept-Encoding`）而变化。

3. **服务器配置**：
   - 服务器需要配置相应的模块或中间件来处理HTTP压缩。例如，在Nginx中，可以使用`gzip`模块，在Apache中可以使用`mod_deflate`。

4. **内容类型**：
   - 并非所有内容类型都适合压缩。文本内容（如HTML、CSS、JavaScript）通常会从压缩中受益，而已经压缩的媒体类型（如JPEG、GIF图片，MP3音频）则不会。

5. **压缩级别**：
   - 服务器可以配置不同的压缩级别，以平衡压缩比率和CPU负载。压缩级别越高，压缩比率越好，但CPU负载也越大。

6. **缓存处理**：
   - 压缩内容应该被适当地缓存。如果客户端支持条件请求（如ETag或Last-Modified），缓存的压缩内容可以被重复使用。

7. **安全性**：
   - 在某些情况下，压缩可能会暴露敏感信息，尤其是当内容是动态生成的。因此，需要确保压缩的内容不会泄露敏感数据。

8. **配置示例**：
   - 以下是Nginx配置GZIP压缩的示例：
     ```nginx
     gzip on;
     gzip_vary on;
     gzip_proxied any;
     gzip_comp_level 5;
     gzip_min_length 256;
     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
     ```
   - 这个配置启用了GZIP压缩，根据`Accept-Encoding`头变化响应不同的内容，对所有代理请求进行压缩，设置压缩级别为5（快速压缩），只压缩大于256字节的响应，并且指定了可以被压缩的内容类型。

9. **测试和验证**：
   - 使用工具（如Chrome开发者工具或在线服务）来测试和验证压缩是否按预期工作。

10. **客户端支持**：
    - 客户端（浏览器）必须支持并发送`Accept-Encoding`头，才能接收压缩内容。

HTTP压缩是一个强大的工具，可以显著提高网站性能。然而，它也增加了服务器的CPU负载，因此需要根据服务器的处理能力和网站的需求来适当配置。

## 如果一个 txt 文件很大，指定压缩响应。那么 response 中的 Content-Type 应该是什么？响应中会有哪些信息标识压缩相关的？

对于一个大型的文本文件（如`.txt`），如果服务器配置了压缩响应，那么`Content-Type`通常设置为`text/plain`，因为`.txt`文件是纯文本格式。

当响应被压缩时，响应头中会包含一些标识压缩相关的信息：

1. **`Content-Encoding`**：
   这个响应头用于指示响应体使用的压缩格式。例如，如果使用了GZIP压缩，`Content-Encoding`将被设置为`gzip`。如果使用了Brotli压缩，它将被设置为`br`。

   ```http
   Content-Encoding: gzip
   ```

2. **`Vary`**：
   `Vary`响应头用于指示响应内容会根据不同的请求头而变化。当启用压缩时，服务器可能会设置`Vary`头为`Accept-Encoding`，表示响应内容会根据请求中的`Accept-Encoding`头变化。

   ```http
   Vary: Accept-Encoding
   ```

3. **`Content-Length`**：
   `Content-Length`响应头指示响应体的大小（以字节为单位）。当响应被压缩时，`Content-Length`将反映压缩后的大小。

   ```http
   Content-Length: 1200
   ```

   注意：在某些情况下，如果服务器使用分块传输编码（chunked transfer encoding），`Content-Length`可能不会被设置。

当客户端接收到包含`Content-Encoding`头的响应时，它知道需要对接收到的数据进行解压缩，以恢复原始内容。

以下是一个示例HTTP响应，假设服务器对一个大型文本文件的响应进行了GZIP压缩：

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=UTF-8
Content-Encoding: gzip
Content-Length: 1200
Vary: Accept-Encoding
Date: Wed, 31 Dec 2024 12:00:00 GMT
Server: YourServer/1.0

<压缩的响应体>
```

在这个示例中：

- `Content-Type: text/plain; charset=UTF-8` 表示响应体是一个文本文件，使用UTF-8编码。
- `Content-Encoding: gzip` 表示响应体被GZIP压缩。
- `Content-Length` 表示压缩后的响应体大小。
- `Vary: Accept-Encoding` 表示响应内容可能会根据请求头中的`Accept-Encoding`变化。

客户端在接收到这个响应后，会根据`Content-Encoding`头来解压缩响应体，然后以原始的文本格式进行处理或显示。

# 核心实现

```java
/**
 * 文件压缩
 *
 * @since 0.8.0
 * @author 老马啸西风
 */
public class NginxRequestDispatchFileCompress extends AbstractNginxRequestDispatchFullResp {

    private static final Log logger = LogFactory.getLog(AbstractNginxRequestDispatchFullResp.class);

    @Override
    protected FullHttpResponse buildFullHttpResponse(FullHttpRequest request,
                                                     final NginxConfig nginxConfig,
                                                     NginxRequestDispatchContext context) {
        final File targetFile = context.getFile();
        logger.info("[Nginx] match compress file, path={}", targetFile.getAbsolutePath());


        // 压缩内容
        byte[] compressData = getCompressData(context);
        // 创建一个带有GZIP压缩内容的ByteBuf
        ByteBuf compressedContent = Unpooled.copiedBuffer(compressData);
        FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK, compressedContent);

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

    public static byte[] getCompressData(NginxRequestDispatchContext context) {
        final File targetFile = context.getFile();

        byte[] inputData = FileUtil.getFileBytes(targetFile);
        // 使用try-with-resources语句自动关闭资源
        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             GZIPOutputStream gzipOutputStream = new GZIPOutputStream(byteArrayOutputStream)) {
            // 写入要压缩的数据
            gzipOutputStream.write(inputData);
            // 强制刷新输出流以确保所有数据都被压缩和写入
            gzipOutputStream.finish();
            // 获取压缩后的数据
            return byteArrayOutputStream.toByteArray();
        } catch (IOException e) {
            logger.error("[Nginx] getCompressData failed", e);
            throw new Nginx4jException(e);
        }
    }

}
```

## 测试

### 测试代码

```java
public static void main(String[] args) {
    NginxGzipConfig gzipConfig = new NginxGzipConfig();
    gzipConfig.setGzip("on");
    gzipConfig.setGzipMinLength(256);
    Nginx4jBs.newInstance()
            .nginxGzipConfig(gzipConfig)
            .init()
            .start();
}
```

### 页面访问

http://192.168.1.12:8080/c.txt

可以直接返回 c.txt 的内容。

而且后端命中了压缩处理。

```
[INFO] [2024-05-26 21:01:26.319] [nioEventLoopGroup-3-1] [c.g.h.n.s.r.d.h.AbstractNginxRequestDispatchFullResp.buildFullHttpResponse] - [Nginx] match compress file, path=D:\data\nginx4j\c.txt
[INFO] [2024-05-26 21:01:26.324] [nioEventLoopGroup-3-1] [c.g.h.n.u.InnerMimeUtil.getContentTypeWithCharset] - file=D:\data\nginx4j\c.txt, contentType=text/plain; charset=UTF-8
[INFO] [2024-05-26 21:01:26.327] [nioEventLoopGroup-3-1] [c.g.h.n.s.r.d.h.AbstractNginxRequestDispatchFullResp.doDispatch] - [Nginx] channelRead writeAndFlush DONE response=DefaultFullHttpResponse(decodeResult: success, version: HTTP/1.1, content: UnpooledHeapByteBuf(freed))
HTTP/1.1 200 OK
content-encoding: gzip
content-type: text/plain; charset=UTF-8
vary: accept-encoding
content-length: 696
[INFO] [2024-05-26 21:01:26.328] [nioEventLoopGroup-3-1] [c.g.h.n.s.h.NginxNettyServerHandler.channelRead0] - [Nginx] channelRead writeAndFlush DONE id=40a5effffe257be0-00006394-00000001-0af1170bb1114311-b3ae0da9
```

### http 信息

请求基本信息

```
Request URL:
http://192.168.1.12:8080/c.txt
Request Method:
GET
Status Code:
200 OK
Remote Address:
192.168.1.12:8080
Referrer Policy:
strict-origin-when-cross-origin
```

请求头

```
GET /c.txt HTTP/1.1
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Connection: keep-alive
Host: 192.168.1.12:8080
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36
```

响应头

```
HTTP/1.1 200 OK
content-encoding: gzip
content-type: text/plain; charset=UTF-8
vary: accept-encoding
content-length: 696
```

可见，虽然返回的是 gzip 内容，但是浏览器会自动解压处理。

# 小结

本节我们实现了文件的压缩处理，这个对于文件的传输性能提升比较大。

当然，压缩+解压本身也是对性能有损耗的。要结合具体的压缩比等考虑。

下一节，我们考虑实现一下 cors 的支持。

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
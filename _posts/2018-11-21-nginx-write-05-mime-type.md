---
layout: post
title:  从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）
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

## netty 相关

如果你对 netty 不是很熟悉，可以读一下

[Netty 权威指南-01-BIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-01-bio)

[Netty 权威指南-02-NIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-02-nio)

[Netty 权威指南-03-AIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-03-aio)

[Netty 权威指南-04-为什么选择 Netty？Netty 入门教程](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

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

# 前言

我们上一篇文章中，我们默认支持的文件类型比较少，都是直接返回纯文本。

浏览器默认支持的文件类型肯定不止这么点。

我们先来一起学习下 MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）

## 是什么？

MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）是一种标准，用于定义消息（如电子邮件）和文件的类型，以及指定资源的格式。

在HTTP协议中，MIME类型用于描述发送的响应内容或请求的资源内容的格式。

### MIME类型的组成：

一个MIME类型通常由两部分组成，用斜杠（/）分隔：

1. **类型（Type）**：表示资源类型的一般分类，如`text`、`image`、`application`等。
2. **子类型（Subtype）**：表示该类型下的具体格式，如`html`、`jpeg`、`xml`等。

### 常见的MIME类型：

以下是一些常见的MIME类型及其描述：

- `text/plain`：普通的文本文件，如TXT文件。
- `text/html`：HTML文档。
- `text/css`：层叠样式表，用于定义网页的样式和布局。
- `text/javascript`：JavaScript脚本文件。
- `application/json`：JSON格式数据，常用于Web API。
- `application/xml`：XML格式数据。
- `application/octet-stream`：二进制流数据，常用于文件下载。
- `image/jpeg`：JPEG格式的图片。
- `image/png`：PNG格式的图片。
- `image/gif`：GIF格式的图片。
- `audio/mpeg`：MP3音频文件。
- `video/mp4`：MP4视频文件。

### MIME类型的作用：

1. **内容识别**：MIME类型帮助客户端（如浏览器）识别接收到的内容类型，从而决定如何正确处理或显示这些内容。

2. **文件上传**：在表单提交时，MIME类型用于指示上传文件的格式。

3. **响应头设置**：服务器在HTTP响应中使用`Content-Type`头来指定响应内容的MIME类型。

4. **请求头设置**：客户端在HTTP请求中使用`Accept`头来指定它能够处理的MIME类型。

5. **多部分类型**：在发送多部分请求或响应时（如文件上传），使用`multipart/*`类型的MIME类型。

### MIME类型与文件扩展名：

虽然MIME类型与文件扩展名（如`.html`、`.jpg`等）通常有直接的对应关系，但它们是两个不同的概念。

文件扩展名是操作系统用来识别文件类型的，而MIME类型是网络协议用来识别内容类型的。

服务器配置可以映射文件扩展名到MIME类型，以确定发送给客户端的正确类型。

## 常见文件的例子

- `text/plain`：普通的文本文件，如TXT文件。
- `text/html`：HTML文档。
- `text/css`：层叠样式表，用于定义网页的样式和布局。
- `text/javascript`：JavaScript脚本文件。
- `application/json`：JSON格式数据，常用于Web API。
- `application/xml`：XML格式数据。

- `application/octet-stream`：二进制流数据，常用于文件下载。
- `image/jpeg`：JPEG格式的图片。
- `image/png`：PNG格式的图片。
- `image/gif`：GIF格式的图片。
- `audio/mpeg`：MP3音频文件。
- `video/mp4`：MP4视频文件。

### 文本类的

以下是各种MIME类型对应的文件内容示例：

1. **`text/plain`**：普通的文本文件，如TXT文件。

   ```plaintext
   This is a plain text file.
   It contains raw text data that can be viewed
   in any text editor.
   ```

2. **`text/html`**：HTML文档。
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>Example HTML Document</title>
   </head>
   <body>
       <h1>Hello, World!</h1>
       <p>This is an example of an HTML document.</p>
   </body>
   </html>
   ```

3. **`text/css`**：层叠样式表，用于定义网页的样式和布局。
   ```css
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
   ```

4. **`text/javascript`**：JavaScript脚本文件。
   ```javascript
   // This is a JavaScript file
   function sayHello() {
       alert('Hello, World!');
   }

   document.addEventListener('DOMContentLoaded', (event) => {
       console.log('DOM fully loaded and parsed');
   });
   ```

5. **`application/json`**：JSON格式数据，常用于Web API。
   ```json
   {
       "name": "John Doe",
       "age": 30,
       "isEmployed": true,
       "address": {
           "street": "123 Main St",
           "city": "Anytown",
           "zip": "12345"
       },
       "phoneNumbers": [
           {"type": "home", "number": "555-0100"},
           {"type": "mobile", "number": "555-0101"}
       ]
   }
   ```

6. **`application/xml`**：XML格式数据。
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <person>
       <name>John Doe</name>
       <age>30</age>
       <isEmployed>true</isEmployed>
       <address>
           <street>123 Main St</street>
           <city>Anytown</city>
           <zip>12345</zip>
       </address>
       <phoneNumbers>
           <phone type="home">555-0100</phone>
           <phone type="mobile">555-0101</phone>
       </phoneNumbers>
   </person>
   ```

每个示例都展示了相应MIME类型文件的基本结构和内容。这些示例可以根据需要进行扩展和修改，以适应不同的应用场景和数据表示需求。


# 核心代码

我们在代码处理时，添加上核心的文件类型响应。

```java
    /**
     * String format = "HTTP/1.1 200 OK\r\n" +
     *                 "Content-Type: text/plain\r\n" +
     *                 "\r\n" +
     *                 "%s";
     *
     * @param bytes 原始内容
     * @param status 结果枚举
     * @param request 请求内容
     * @param nginxConfig 配置
     * @return 结果
     */
    protected FullHttpResponse buildCommentResp(byte[] bytes,
                                            final HttpResponseStatus status,
                                            final FullHttpRequest request,
                                            final NginxConfig nginxConfig) {
        byte[] defaultContent = new byte[]{};
        if(ArrayPrimitiveUtil.isNotEmpty(bytes)) {
            defaultContent = bytes;
        }

        // 构造响应
        FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1,
                status, Unpooled.copiedBuffer(defaultContent));
        // 头信息
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain;");
        response.headers().set(HttpHeaderNames.CONTENT_LENGTH, response.content().readableBytes());
        //如果request中有KEEP ALIVE信息
        if (HttpUtil.isKeepAlive(request)) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
        }

        return response;
    }

    protected void setContentType(FullHttpResponse response,
                                  String contentType) {
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, contentType);
    }
```

这样在浏览中访问对应的图片等，就可以实现文件的预览。

# 小结

本节我们实现了常见的文件类别的处理，可以实现常见文件的预览。

下一节，我们一起来看一下如何实现文件夹的处理。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

-------------------------------------------------------------------------------------


# 内置类介绍

这里我们来一起简单看下几个内置的处理类。

## HttpRequestDecoder & HttpResponseEncoder

在Netty中，`HttpRequestDecoder` 和 `HttpResponseEncoder` 是两个非常重要的HTTP编解码器，它们用于处理HTTP协议的编码和解码工作。

下面是这两个类的详细介绍：

### HttpRequestDecoder

`HttpRequestDecoder` 是一个用于解码HTTP请求的处理器。它实现了 `HttpServerCodec` 接口，该接口是Netty提供的用于HTTP服务器端的编解码器。`HttpRequestDecoder` 负责将接收到的字节码（`ByteBuf`）解码成HTTP请求消息（`HttpRequest`），并将它们传递给pipeline中的下一个处理器。

#### 主要功能：

- **解码请求行**：解码HTTP请求的第一行，即请求行，它包含请求方法（如GET、POST）、URI和HTTP版本。
- **解码请求头**：解码随后的请求头，这些头包含了关于请求的附加信息，如`Host`、`User-Agent`、`Content-Length`等。
- **解码请求体**：如果请求中包含请求体（例如POST请求），`HttpRequestDecoder` 也会解码这部分内容。
- **聚合HTTP碎片**：在HTTP协议中，一个完整的请求可能被分成多个消息发送。`HttpRequestDecoder` 可以聚合这些消息，形成一个完整的HTTP请求。

### HttpResponseEncoder

`HttpResponseEncoder` 是一个用于编码HTTP响应的处理器。

它同样实现了 `HttpServerCodec` 接口，负责将HTTP响应消息（`HttpResponse`）编码为字节码（`ByteBuf`），以便发送给客户端。

#### 主要功能：

- **编码响应行**：编码HTTP响应的第一行，即状态行，它包含HTTP版本、状态码和状态消息。
- **编码响应头**：编码响应头，这些头包含了关于响应的附加信息，如`Content-Type`、`Content-Length`、`Set-Cookie`等。
- **编码响应体**：将HTTP响应体（如果存在）编码为字节码。
- **支持分块编码**：对于支持HTTP分块传输编码的请求，`HttpResponseEncoder` 可以对响应体进行分块编码。

### 使用场景

这两个编解码器通常在Netty的HTTP服务器pipeline中一起使用。

`HttpRequestDecoder` 用于解码客户端发送的请求，而 `HttpResponseEncoder` 用于编码服务器生成的响应。

### 示例配置

在Netty服务器的初始化代码中，你可能会看到类似以下的pipeline配置：

```java
ServerBootstrap b = new ServerBootstrap();
b.group(bossGroup, workerGroup)
 .channel(NioServerSocketChannel.class)
 .childHandler(new ChannelInitializer<SocketChannel>() {
     @Override
     protected void initChannel(SocketChannel ch) {
         ChannelPipeline p = ch.pipeline();
         p.addLast("decoder", new HttpRequestDecoder());
         p.addLast("encoder", new HttpResponseEncoder());
         p.addLast("aggregator", new HttpObjectAggregator(512 * 1024));
         // 其他handler...
     }
 });
```

在这个例子中，`HttpRequestDecoder` 和 `HttpResponseEncoder` 被添加到pipeline中，分别用于请求的解码和响应的编码。

### 注意事项

- `HttpRequestDecoder` 和 `HttpResponseEncoder` 默认配置对于大多数HTTP服务器应用来说已经足够，但在某些特定场景下，你可能需要调整它们的配置，如调整最大请求/响应大小、初始化缓冲区大小等。

- 当处理HTTP/2时，Netty提供了专门的编解码器，如 `Http2FrameCodec` 和 `Http2MultiplexCodec`，这些编解码器需要与 `HttpRequestDecoder` 和 `HttpResponseEncoder` 结合使用。

通过使用这些编解码器，Netty能够高效地处理网络中的HTTP请求和响应，提供高性能的网络通信能力。

## HttpObjectAggregator

`HttpObjectAggregator` 是Netty提供的用于处理HTTP协议的处理器，它属于HTTP服务器或客户端pipeline中的一个组件。这个处理器的主要作用是将多个HTTP消息（如请求行、请求头、请求体以及可能的文件上传部分）聚合成一个单一的`HttpObject`，通常是`HttpRequest`或`HttpResponse`对象。

### 主要功能：

1. **消息聚合**：`HttpObjectAggregator` 将接收到的多个分散的HTTP消息部分（例如，请求头和请求体）合并成一个完整的HTTP请求或响应对象。这对于客户端和服务器端都是很有用的，因为它简化了HTTP消息的处理。

2. **设置最大内容长度**：你可以为聚合器设置一个最大内容长度。如果接收到的HTTP实体的总长度超过了这个值，聚合器会抛出一个`TooLongFrameException`。

3. **处理多种类型的HTTP消息**：`HttpObjectAggregator` 能够处理不同类型的HTTP消息，包括但不限于`HttpRequest`、`HttpResponse`、`HttpContent`等。

4. **与解码器和编码器协同工作**：在HTTP服务器的pipeline中，`HttpObjectAggregator` 通常跟 `HttpRequestDecoder` 和 `HttpResponseEncoder` 结合使用。`HttpRequestDecoder` 负责解码HTTP消息，`HttpObjectAggregator` 负责将解码后的消息聚合，而 `HttpResponseEncoder` 负责将聚合后的响应消息编码后发送给客户端。

### 使用场景：

`HttpObjectAggregator` 主要用于以下几种场景：

- **聚合HTTP请求**：在服务器端，它将从客户端接收到的分散的HTTP请求消息聚合成完整的请求对象。
- **聚合HTTP响应**：在客户端，它将从服务器接收到的分散的HTTP响应消息聚合成完整的响应对象。
- **处理大文件上传**：对于包含文件上传的POST请求，`HttpObjectAggregator` 可以有效地处理大文件，因为它聚合了所有的HTTP内容片段。

### 示例配置：

在Netty的HTTP服务器pipeline中配置`HttpObjectAggregator`的示例代码如下：

```java
ServerBootstrap b = new ServerBootstrap();
b.group(bossGroup, workerGroup)
 .channel(NioServerSocketChannel.class)
 .childHandler(new ChannelInitializer<SocketChannel>() {
     @Override
     protected void initChannel(SocketChannel ch) {
         ChannelPipeline p = ch.pipeline();
         p.addLast("decoder", new HttpRequestDecoder());
         p.addLast("encoder", new HttpResponseEncoder());
         // 设置最大聚合内容长度为5MB
         p.addLast("aggregator", new HttpObjectAggregator(5 * 1024 * 1024));
         // 其他handler...
     }
 });
```

在这个配置中，`HttpObjectAggregator` 被设置为最大聚合大小为5MB，这意味着它能够处理最大为5MB的HTTP实体。

### 注意事项：

- 当设置`HttpObjectAggregator`的最大内容长度时，需要确保这个值能够满足应用程序的需求，同时避免因过大的请求导致的潜在的DoS攻击。

- 在HTTP/2场景下，由于HTTP/2是流式的，`HttpObjectAggregator`的使用方式可能与HTTP/1.x略有不同。

- `HttpObjectAggregator` 是Netty提供的HTTP服务器和客户端框架的一部分，它与其他HTTP处理器协同工作，提供了一个高效、灵活的方式来处理HTTP消息。

## ChunkedWriteHandler

`ChunkedWriteHandler` 是Netty中的一个处理器，用于处理HTTP分块传输编码（chunked transfer encoding）。分块传输编码是HTTP协议中的一个特性，它允许服务器在知道整个响应内容长度之前就开始发送响应。这对于动态内容的生成特别有用，例如实时数据流、在线视频或音频播放，以及任何需要延迟生成响应内容的场景。

### 主要功能：

1. **分块写入**：`ChunkedWriteHandler` 可以将大的响应内容分割成多个小块，然后逐一发送。这种方式可以减少内存占用，因为不需要一次性将整个响应内容加载到内存中。

2. **动态内容支持**：对于动态生成的内容，如实时数据流，`ChunkedWriteHandler` 可以在内容生成的同时进行发送，而不必等待所有内容生成完毕后再发送。

3. **编码HTTP响应**：当使用分块传输编码时，`ChunkedWriteHandler` 会自动添加必要的HTTP头字段，如`Transfer-Encoding: chunked`，并正确地编码每个分块。

4. **结束分块**：在所有内容块发送完毕后，`ChunkedWriteHandler` 会发送一个特殊的“最后分块”（last chunk），其大小为0，以告知客户端响应内容已经结束。

5. **与`HttpObjectAggregator`协同工作**：在HTTP服务器pipeline中，`ChunkedWriteHandler` 通常与`HttpObjectAggregator`一起使用。`HttpObjectAggregator`用于聚合接收到的HTTP请求消息，而`ChunkedWriteHandler`用于处理发送的响应消息。

### 使用场景：

`ChunkedWriteHandler` 主要用于以下场景：

- **动态内容生成**：当服务器需要发送动态生成的内容，并且无法预先知道内容的总长度时。
- **大文件传输**：对于大文件的传输，使用分块传输编码可以避免一次性加载整个文件到内存中。
- **流式数据传输**：适用于需要实时传输数据的场景，如视频直播、在线会议等。

### 示例配置：

在Netty的HTTP服务器pipeline中配置`ChunkedWriteHandler`的示例代码如下：

```java
ServerBootstrap b = new ServerBootstrap();
b.group(bossGroup, workerGroup)
 .channel(NioServerSocketChannel.class)
 .childHandler(new ChannelInitializer<SocketChannel>() {
     @Override
     protected void initChannel(SocketChannel ch) {
         ChannelPipeline p = ch.pipeline();
         p.addLast("decoder", new HttpRequestDecoder());
         p.addLast("encoder", new HttpResponseEncoder());
         p.addLast("aggregator", new HttpObjectAggregator(512 * 1024));
         // 添加ChunkedWriteHandler
         p.addLast("chunkedWriter", new ChunkedWriteHandler());
         // 其他handler...
     }
 });
```

在这个配置中，`ChunkedWriteHandler` 被添加到pipeline中，用于处理分块传输编码。

### 注意事项：

- 当使用`ChunkedWriteHandler`时，确保客户端支持HTTP分块传输编码。大多数现代HTTP客户端都支持此特性。
- 在HTTP/1.1中，分块传输编码是默认支持的。但在HTTP/2中，由于HTTP/2本身就是基于帧的流式协议，分块传输编码不再是必需的。
- 使用`ChunkedWriteHandler`时，需要确保正确地关闭流，以发送最后一个空的分块，告知客户端响应结束。
- 在某些情况下，如果能够预先知道内容长度，使用固定长度的传输可能会更高效，因为它允许客户端更快地分配资源并处理响应。

`ChunkedWriteHandler` 是Netty提供的一个强大工具，它为处理动态和流式内容提供了灵活性和高效性。

# 参考资料

https://www.cnblogs.com/luxiaoxun/p/3959450.html

https://www.cnblogs.com/carl10086/p/6185095.html

https://blog.csdn.net/suifeng3051/article/details/22800171

https://blog.csdn.net/sinat_34163739/article/details/108820355

* any list
{:toc}
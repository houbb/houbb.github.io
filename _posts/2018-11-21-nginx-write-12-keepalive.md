---
layout: post
title:  从零手写实现 nginx-12-keepalive HTTP 持久连接或连接复用
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



# 小结

本节我们实现了文件的压缩处理，这个对于文件的传输性能提升比较大。

当然，压缩+解压本身也是对性能有损耗的。要结合具体的压缩比等考虑。

下一节，我们考虑实现一下 cors 的支持。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# chat

## 详细介绍一下 http 的 keepalive 

HTTP Keep-Alive，也称为HTTP持久连接或连接复用，是一种HTTP协议的特性，它允许客户端和服务器之间在一个TCP连接上发送多个HTTP请求和响应，而不需要在每个请求/响应之后重新建立连接。

这种机制可以减少连接建立和关闭的开销，从而提高网络传输效率。

### 工作原理：

在HTTP/1.0中，Keep-Alive是一个可选项，可以通过`Connection`头信息来启用。

而在HTTP/1.1中，Keep-Alive默认是启用的，除非在请求或响应中明确指定`Connection: close`。

### 配置Keep-Alive：
Keep-Alive可以通过以下HTTP头信息进行配置：

- **Connection**: 指定连接是持久的还是一次性的。如果设置为`keep-alive`，则表示希望保持连接打开，用于后续的请求/响应交换。
- **Keep-Alive**: 可以包含额外的参数，如超时时间（timeout）和最大请求数（max），例如：`Keep-Alive: timeout=5, max=100`。

### 优点：
1. **减少连接建立和关闭的开销**：TCP连接的建立和关闭需要进行三次握手和四次挥手，这个过程涉及到额外的网络延迟和资源消耗。
2. **提高响应速度**：由于避免了重新建立连接的需要，后续的请求可以更快地得到响应。
3. **减少服务器负载**：服务器不需要频繁地处理连接的建立和关闭，可以更高效地处理请求。
4. **改善用户体验**：页面加载更快，用户交互更流畅。

### 缺点：
1. **资源占用**：如果客户端或服务器端没有正确管理Keep-Alive连接，可能会导致资源（如文件描述符、内存）的长时间占用。
2. **连接泄漏**：如果客户端或服务器端在传输数据时发生错误，可能会导致连接未能正确关闭，从而产生连接泄漏。
3. **不适用于短连接**：对于只发送单个请求的场景，Keep-Alive可能会增加不必要的复杂性和开销。

### 实现Keep-Alive：

在服务器端（如Nginx、Apache）和客户端（如浏览器、HttpClient）中，Keep-Alive通常可以通过配置文件或代码来启用或调整。

例如，在Nginx中，可以通过以下配置启用Keep-Alive：

```nginx
keepalive_timeout 75;
```

这表示如果客户端在75秒内没有任何请求，Nginx将关闭该连接。

### 注意事项：
- **超时设置**：合理设置Keep-Alive的超时时间，以平衡资源占用和响应速度。
- **客户端支持**：确保客户端支持HTTP Keep-Alive，并且正确处理持久连接。
- **服务器资源**：监控服务器资源使用情况，避免因Keep-Alive连接过多而导致资源耗尽。

总的来说，HTTP Keep-Alive是一个重要的性能优化特性，通过减少连接的建立和关闭，可以显著提高网络应用的效率和用户体验。

然而，它也需要合理的配置和管理，以避免潜在的问题。

## Netty 实现一个 http 的响应，如果支持了 keep alive，那么如何管理可能过期失效的链接呢？

在Netty中实现HTTP响应并管理Keep-Alive连接，需要考虑几个关键方面来确保连接在适当的时候被关闭或重用。以下是一些管理可能过期失效的Keep-Alive连接的策略：

### 1. 设置超时时间
在Netty中，可以通过`ChannelOption.SO_TIMEOUT`设置读取超时时间。如果在这个时间内没有收到任何数据，连接将被关闭。

```java
ChannelPipeline pipeline = ch.pipeline();
pipeline.addLast("decoder", new HttpRequestDecoder());
pipeline.addLast("encoder", new HttpResponseEncoder());
pipeline.addLast("aggregator", new HttpObjectAggregator(512 * 1024));
pipeline.addLast(new HttpServerHandler() {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, HttpObject msg) throws Exception {
        // 处理HTTP请求
    }
});
ChannelOption.SO_TIMEOUT, timeout);
```

### 2. 检查HTTP头信息
在HTTP请求和响应中，检查`Connection`头信息来确定连接是否应该保持打开。如果客户端或服务器端发送了`Connection: close`，则关闭连接。

```java
if (httpRequest.headers().contains(HttpHeaderNames.CONNECTION, "close", true)) {
    // 关闭连接
}
```

### 3. 使用LastHttpContent
在HTTP请求或响应处理中，使用`LastHttpContent`来标记消息的结束。当收到`LastHttpContent`时，可以决定是否关闭连接或保持打开以供后续请求使用。

```java
if (msg instanceof LastHttpContent) {
    // 检查是否需要关闭连接
}
```

### 4. 管理Keep-Alive连接
如果确定连接应该保持打开，可以在`HttpServerHandler`中维护一个映射，记录每个连接的状态和最后活动时间。

```java
Map<Channel, Long> keepAliveChannels = new ConcurrentHashMap<>();
private void addKeepAliveChannel(Channel channel) {
    keepAliveChannels.put(channel, System.currentTimeMillis());
}

private void removeKeepAliveChannel(Channel channel) {
    keepAliveChannels.remove(channel);
}

private void closeExpiredChannels(long currentTime) {
    keepAliveChannels.entrySet().removeIf(entry -> {
        long duration = currentTime - entry.getValue();
        return duration > KEEP_ALIVE_TIMEOUT;
    });
}
```

### 5. 定期检查和清理
设置一个定时任务，定期检查并关闭过期的Keep-Alive连接。

```java
ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
scheduler.scheduleAtFixedRate(() -> closeExpiredChannels(System.currentTimeMillis()), 0, KEEP_ALIVE_TIMEOUT, TimeUnit.MILLISECONDS);
```

### 6. 处理异常和错误
在处理HTTP请求和响应时，确保捕获并处理可能发生的异常和错误。如果发生错误，应该关闭连接。

```java
try {
    // 处理HTTP请求
} catch (Exception e) {
    ctx.close();
}
```

### 7. 优雅地关闭连接
在关闭连接之前，确保所有的数据都已经被发送和接收。可以使用`ChannelFutureListener`来确保连接在数据发送完毕后关闭。

```java
ChannelFuture future = channel.writeAndFlush(Unpooled.EMPTY_BUFFER);
future.addListener(ChannelFutureListener.CLOSE);
```

通过上述策略，Netty可以有效地管理Keep-Alive连接，确保连接在不需要时能够及时关闭，同时在需要时能够被重用，从而提高网络应用的性能和效率。


# 参考资料


* any list
{:toc}
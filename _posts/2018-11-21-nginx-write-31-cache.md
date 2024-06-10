---
layout: post
title:  从零手写实现 nginx-15-cache 缓存
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

## 详细介绍一下 nginx cache 

Nginx 缓存控制是指通过 Nginx 服务器对静态资源进行缓存管理的过程。合理配置缓存可以显著提高网站性能，减少服务器负载，加快资源的加载速度。

以下是 Nginx 缓存控制的详细介绍：

### 1. 缓存位置
Nginx 缓存通常存储在服务器的文件系统中。你可以在 Nginx 配置文件中通过 `proxy_cache_path` 指令指定缓存文件存储的路径。

```nginx
proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;
```

### 2. 缓存区
`keys_zone` 是一个共享内存区，用于存储缓存键和元数据。它允许 Nginx 快速查找缓存项。

### 3. 缓存大小
`max_size` 指定了缓存空间的最大大小，`inactive` 定义了缓存文件在多长时间内未被访问后会被清除。

### 4. 缓存有效性
通过设置 HTTP 头部，如 `Cache-Control` 和 `Expires`，可以控制资源在客户端和代理服务器上的缓存行为。

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public";
}
```

### 5. 缓存验证
当缓存的资源过期后，Nginx 可以通过 `If-Modified-Since` 或 `If-None-Match` HTTP 头部与后端服务器进行验证，以确定资源是否已被修改。

### 6. 缓存失效
可以通过配置 Nginx 来实现缓存失效策略，例如，当后端资源更新时，自动清除对应的缓存。

### 7. 缓存重用
Nginx 允许配置缓存重用策略，以减少对后端服务器的请求。

### 8. 缓存锁定
为了防止多个进程同时写入同一个缓存文件，Nginx 使用缓存锁定机制。

### 9. 缓存日志
Nginx 可以记录缓存的访问和错误日志，帮助管理员监控和调试缓存系统。

### 10. 缓存控制指令
Nginx 提供了多种指令来控制缓存行为，如 `proxy_cache`, `proxy_cache_valid`, `proxy_cache_bypass`, `proxy_no_cache` 等。

### 11. 缓存预热
缓存预热是指在网站上线前预先加载资源到缓存中，以减少用户请求时的延迟。

### 12. 缓存优化
根据实际的访问模式和资源更新频率，可以对缓存策略进行优化，以达到最佳性能。

### 13. 第三方模块
除了 Nginx 自带的缓存功能外，还有第三方模块如 `ngx_cache_purge` 可以提供额外的缓存管理功能，如缓存清除接口。

通过合理配置和使用 Nginx 的缓存控制功能，可以显著提升网站的响应速度和用户体验，同时降低服务器的负载。

在配置缓存时，需要根据实际的应用场景和资源特性来调整缓存策略，以达到最优效果。




## 详细介绍一下 Http 的 ETag 和 Last-Modified

ETag（实体标签）和 Last-Modified 是 HTTP 协议中用于缓存和条件请求的两个重要头部字段。

它们的主要目的是优化 Web 性能，减少不必要的数据传输和服务器负载。

下面是对它们的详细介绍：

### ETag

ETag 是一个用于标识资源版本的 HTTP 头部字段。它是由服务器生成的一个字符串，可以唯一标识某个特定版本的资源。

#### 工作原理

1. **生成和发送 ETag**：
   - 服务器在响应头中包含一个 `ETag` 字段，用于标识资源的版本。
   - 例如：
     ```http
     ETag: "686897696a7c876b7e"
     ```

2. **客户端缓存 ETag**：
   - 客户端（例如浏览器）会缓存资源及其 ETag。

3. **客户端发起条件请求**：
   - 当客户端再次请求该资源时，它会在请求头中包含一个 `If-None-Match` 字段，值为之前缓存的 ETag。
   - 例如：
     ```http
     If-None-Match: "686897696a7c876b7e"
     ```

4. **服务器验证 ETag**：
   - 服务器收到请求后，会比较 `If-None-Match` 的值与当前资源的 ETag。
   - 如果 ETag 匹配，则返回 `304 Not Modified` 状态码，表示资源未修改，客户端可以继续使用缓存。
   - 如果 ETag 不匹配，则返回新的资源和新的 ETag。

#### 示例

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1024
ETag: "686897696a7c876b7e"
```

后续请求：

```http
GET /index.html HTTP/1.1
Host: example.com
If-None-Match: "686897696a7c876b7e"
```

响应：

```http
HTTP/1.1 304 Not Modified
```

### Last-Modified

Last-Modified 是一个 HTTP 头部字段，用于标识资源的最后修改时间。

#### 工作原理

1. **生成和发送 Last-Modified**：
   - 服务器在响应头中包含一个 `Last-Modified` 字段，表示资源的最后修改时间。
   - 例如：
     ```http
     Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
     ```

2. **客户端缓存 Last-Modified**：
   - 客户端缓存资源及其 Last-Modified 时间。

3. **客户端发起条件请求**：
   - 当客户端再次请求该资源时，它会在请求头中包含一个 `If-Modified-Since` 字段，值为之前缓存的 Last-Modified 时间。
   - 例如：
     ```http
     If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
     ```

4. **服务器验证 Last-Modified**：
   - 服务器收到请求后，会比较 `If-Modified-Since` 的值与当前资源的最后修改时间。
   - 如果资源自那之后没有修改过，则返回 `304 Not Modified` 状态码，表示资源未修改，客户端可以继续使用缓存。
   - 如果资源已修改，则返回新的资源和新的 Last-Modified 时间。

#### 示例

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1024
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

后续请求：

```http
GET /index.html HTTP/1.1
Host: example.com
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
```

响应：

```http
HTTP/1.1 304 Not Modified
```

### ETag vs Last-Modified

- **精度**：ETag 更精确，因为它可以基于内容的哈希值或版本号，而 Last-Modified 只能精确到一秒。
- **性能**：ETag 生成和比较可能比 Last-Modified 更耗资源，特别是对于动态生成的内容。
- **使用场景**：
  - ETag 适用于资源变化不定，且需要精确控制缓存的场景。
  - Last-Modified 适用于资源更新较少，且不需要精确到秒以下的场景。

### Nginx 配置 ETag 和 Last-Modified

在 Nginx 中，配置 ETag 和 Last-Modified 头部字段是相对简单的，可以通过配置文件中的一些指令实现。

#### 配置 ETag

Nginx 默认会生成 ETag。如果你需要关闭它，可以在配置文件中添加以下指令：

```nginx
etag off;
```

#### 配置 Last-Modified

Nginx 默认也会生成 Last-Modified 头部字段。如果你需要自定义或关闭它，可以使用以下指令：

```nginx
location / {
    add_header Last-Modified $date_gmt;
}
```

通过了解和正确配置 ETag 和 Last-Modified，您可以显著提高 Web 应用的性能和用户体验。







# 参考资料

https://www.cnblogs.com/luxiaoxun/p/3959450.html

https://www.cnblogs.com/carl10086/p/6185095.html

https://blog.csdn.net/suifeng3051/article/details/22800171

https://blog.csdn.net/sinat_34163739/article/details/108820355

* any list
{:toc}
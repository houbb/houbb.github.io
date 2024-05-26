---
layout: post
title:  Nginx R31 doc-11-Compression and Decompression 压缩与解压缩
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
published: true
---


# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

# 压缩与解压缩

压缩服务器响应，或者对不支持压缩的客户端进行解压缩，以提高交付速度并减少服务器的开销。

这一部分描述了如何配置响应的压缩或解压缩，以及发送压缩文件。

## 介绍

压缩响应通常会显著减小传输数据的大小。然而，由于压缩发生在运行时，它也可能会增加相当大的处理开销，从而对性能产生负面影响。

NGINX 在将响应发送给客户端之前执行压缩，但不会对已经压缩的响应进行“双重压缩”（例如，通过代理服务器压缩的响应）。

## 启用压缩

要启用压缩，请使用 gzip 指令，并使用 on 参数。

```nginx
gzip on;
```

默认情况下，NGINX 只会压缩 MIME 类型为 text/html 的响应。要压缩其他 MIME 类型的响应，请包含 gzip_types 指令并列出其他类型。

```nginx
gzip_types text/plain application/xml;
```

要指定响应的最小长度以进行压缩，请使用 gzip_min_length 指令。默认值为 20 字节（在此调整为 1000）：

```nginx
gzip_min_length 1000;
```

默认情况下，NGINX 不会压缩代理请求的响应（来自代理服务器的请求）。请求来自代理服务器的事实是由请求中的 Via 标头字段的存在确定的。要配置这些响应的压缩，请使用 gzip_proxied 指令。该指令具有许多参数，指定 NGINX 应压缩哪些类型的代理请求。例如，仅对不会在代理服务器上缓存的请求压缩响应是合理的。为此，gzip_proxied 指令具有参数，指示 NGINX 检查响应中的 Cache-Control 标头字段，并在该值为 no-cache、no-store 或 private 时压缩响应。此外，必须包括 expired 参数以检查 Expires 标头字段的值。以下是这些参数的设置示例，以及 auth 参数，该参数检查 Authorization 标头字段的存在（授权响应特定于最终用户，通常不会被缓存）：

```nginx
gzip_proxied no-cache no-store private expired auth;
```

与大多数其他指令一样，配置压缩的指令可以包含在 http 上下文或服务器或位置配置块中。

压缩 gzip 的整体配置可能如下所示。

```nginx
server {
    gzip on;
    gzip_types      text/plain application/xml;
    gzip_proxied    no-cache no-store private expired auth;
    gzip_min_length 1000;
    ...
}
```

## 启用解压缩

一些客户端不支持使用 gzip 编码方法的响应。

与此同时，可能希望存储压缩数据，或者在运行时压缩响应并将其存储在缓存中。

为了成功为既接受压缩数据又不接受压缩数据的客户端提供服务，NGINX 可以在发送给后一种类型的客户端时实时解压缩数据。

要启用运行时解压缩，请使用 gunzip 指令。

```nginx
location /storage/ {
    gunzip on;
    ...
}
```

gunzip 指令可以在与 gzip 指令相同的上下文中指定：

```nginx
server {
    gzip on;
    gzip_min_length 1000;
    gunzip on;
    ...
}
```

请注意，此指令是在一个单独的模块中定义的，默认情况下可能不包含在 NGINX Open Source 构建中。

## 发送压缩文件

为了向客户端发送文件的压缩版本而不是常规版本，请在适当的上下文中将 gzip_static 指令设置为 on。

```nginx
location / {
    gzip_static on;
}
```

在这种情况下，为了处理对 /path/to/file 的请求，NGINX 尝试找到并发送文件 /path/to/file.gz。

如果文件不存在，或者客户端不支持 gzip，则 NGINX 发送文件的未压缩版本。

请注意，gzip_static 指令不启用实时压缩。它仅使用由任何压缩工具预先压缩的文件。要在运行时压缩内容（而不仅仅是静态内容），请使用 gzip 指令。

此指令是在一个单独的模块中定义的，默认情况下可能不包含在 NGINX Open Source 构建中。

# nginx 系列

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[Nginx 实战-01-nginx ubuntu 安装笔记](https://houbb.github.io/2018/11/22/nginx-inaction-01-ubuntu-install)

[Nginx 实战-01-nginx windows 安装笔记](https://houbb.github.io/2018/11/22/nginx-inaction-01-windows-install)

[Nginx 实战-02-nginx proxy_pass 服务代理访问 使用笔记 ubuntu nodejs](https://houbb.github.io/2018/11/22/nginx-inaction-02-usage-proxy-pass)

[Nginx 实战-03-nginx 负载均衡](https://houbb.github.io/2018/11/22/nginx-inaction-03-usage-load-balance)

[Nginx 实战-04-nginx 不同的地址访问不同的服务](https://houbb.github.io/2018/11/22/nginx-inaction-04-useage-different-proxy-pass)

[Nginx 实战-05-nginx 反向代理实现域名到指定的 ip](https://houbb.github.io/2018/11/22/nginx-inaction-05-reverse-proxy)

[Nginx-01-聊一聊 nginx](https://houbb.github.io/2018/11/22/nginx-00-chat)

[Nginx-01-Nginx 是什么](https://houbb.github.io/2018/11/22/nginx-01-overview-01)

[Nginx-02-为什么使用 Nginx](https://houbb.github.io/2018/11/22/nginx-01-why-02)

[Nginx-02-Nginx Ubuntu 安装 + windows10 + WSL ubuntu 安装 nginx 实战笔记](https://houbb.github.io/2018/11/22/nginx-02-install-ubuntu-02)

[Nginx-02-基本使用](https://houbb.github.io/2018/11/22/nginx-02-usage-02)

[Nginx-03-Nginx 项目架构](https://houbb.github.io/2018/11/22/nginx-03-struct-03)

[Nginx-04-Docker Nginx](https://houbb.github.io/2018/11/22/nginx-04-docker-04)

[Nginx-05-nginx 反向代理是什么？windows 下如何配置使用 nginx](https://houbb.github.io/2018/11/22/nginx-05-reverse-proxy)

[Nginx-06-nginx 汇总入门介绍](https://houbb.github.io/2018/11/22/nginx-06-all-in-one)


# 参考资料

https://docs.nginx.com/nginx/admin-guide/web-server/compression/

* any list
{:toc}
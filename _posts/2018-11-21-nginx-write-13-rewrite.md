---
layout: post
title:  从零手写实现 nginx-13-rewrite url 重写
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

## 详细介绍一下 url 重写

URL重写（也称为URL重定向或URL重构）是一种网络技术，用于将一个URL映射到另一个URL。这通常用于网站重构、搜索引擎优化（SEO）、改善用户体验、处理移动设备访问、负载均衡等场景。以下是URL重写的一些详细介绍：

### 1. 基本用途
- **网站重构**：当网站进行重构或设计变更时，旧的URL可能不再有效，URL重写可以帮助将旧URL重定向到新的URL。
- **SEO**：搜索引擎优化需要保持URL的一致性，URL重写可以帮助确保链接不会因网站变动而失效。
- **用户体验**：通过将复杂的URL转换为更简洁、更易于记忆的URL，可以改善用户体验。
- **移动设备访问**：为移动设备用户提供特定版本的页面，可以通过URL重写实现。
- **负载均衡**：在服务器集群中，URL重写可以用于将请求分发到不同的服务器。

### 2. 实现方式
URL重写通常在Web服务器或应用程序中实现。以下是一些常见的实现方式：

- **服务器端重写**：使用Web服务器（如Apache、Nginx）的重写模块，如Apache的`mod_rewrite`或Nginx的`rewrite`指令。
- **客户端重写**：通过JavaScript在浏览器端进行URL重写。
- **应用程序重写**：在Web应用程序中，如使用PHP、Ruby on Rails、Django等框架提供URL重写功能。

### 3. Nginx URL重写示例
在Nginx中，可以使用`rewrite`指令在配置文件中定义URL重写规则：

```nginx
server {
    listen 80;
    server_name example.com;

    location /old-path {
        rewrite ^ http://www.example.com/new-path permanent;
    }
}
```
上面的配置将所有对`http://example.com/old-path`的请求重定向到`http://www.example.com/new-path`，并使用`permanent`标志表示这是一个301重定向，告诉客户端和搜索引擎URL已经永久更改。

### 4. Apache URL重写示例
在Apache中，可以使用`.htaccess`文件或服务器配置文件中的`RewriteEngine`来实现URL重写：

```apache
RewriteEngine On
RewriteRule ^old-path/(.*)$ /new-path/$1 [R=301,L]
```
上面的规则将`old-path`下的请求重写到`new-path`下，并使用301重定向。

### 5. 注意事项
- **301 vs 302**：301重定向表示URL的永久更改，而302是临时更改。选择合适的重定向类型对于SEO非常重要。
- **重定向循环**：错误的重写规则可能导致重定向循环，需要仔细测试以避免这种情况。
- **性能考虑**：过度的URL重写可能会影响服务器性能，特别是在高流量情况下。
- **规则测试**：在部署URL重写规则之前，需要在开发环境中进行彻底测试。

### 6. SEO影响
URL重写对SEO有重要影响。合理的URL重写可以提高网站的可索引性，而错误的重写可能导致内容重复、链接失效等问题。

URL重写是一个强大的工具，可以用于多种目的，但需要谨慎使用，以确保不会对用户体验和搜索引擎优化产生负面影响。


# 参考资料


* any list
{:toc}
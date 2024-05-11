---
layout: post
title:  Nginx R31 doc-10-NGINX Reverse Proxy 反向代理
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
published: true
---


## 配置 NGINX 作为反向代理

配置 NGINX 作为反向代理用于 HTTP 和其他协议，支持修改请求头和对响应进行细粒度的缓冲。

本文介绍了代理服务器的基本配置。您将学习如何将请求从 NGINX 转发到不同协议的代理服务器上，修改发送到代理服务器的客户端请求头，并配置来自代理服务器的响应的缓冲。

### 介绍

代理通常用于在多个服务器之间分发负载，无缝显示来自不同网站的内容，或者通过非 HTTP 协议将请求传递给应用服务器进行处理。

### 将请求传递给代理服务器

当 NGINX 代理请求时，它将请求发送到指定的代理服务器，获取响应，并将其发送回客户端。

可以通过指定的协议将请求代理到 HTTP 服务器（另一个 NGINX 服务器或任何其他服务器）或非 HTTP 服务器（可以运行使用特定框架开发的应用程序，如 PHP 或 Python）。支持的协议包括 FastCGI、uwsgi、SCGI 和 memcached。

要将请求传递到 HTTP 代理服务器，需要在 location 内部指定 proxy_pass 指令。例如：

```nginx
location /some/path/ {
    proxy_pass http://www.example.com/link/;
}
```

此示例配置导致将此位置处理的所有请求传递到指定地址的代理服务器。

此地址可以指定为域名或 IP 地址。地址还可以包括端口：

```nginx
location ~ \.php {
    proxy_pass http://127.0.0.1:8000;
}
```

请注意，在上面的第一个示例中，代理服务器的地址后面跟着一个 URI，/link/。如果 URI 与地址一起指定，则它替换了与位置参数匹配的请求 URI 部分。

例如，在这里，具有 /some/path/page.html URI 的请求将被代理到 http://www.example.com/link/page.html。

如果地址没有指定 URI，或者无法确定要替换的 URI 部分，则传递完整的请求 URI（可能已修改）。

要将请求传递到非 HTTP 代理服务器，应使用适当的 **_pass 指令：

- fastcgi_pass 将请求传递到 FastCGI 服务器
- uwsgi_pass 将请求传递到 uwsgi 服务器
- scgi_pass 将请求传递到 SCGI 服务器
- memcached_pass 将请求传递到 memcached 服务器

请注意，在这些情况下，指定地址的规则可能不同。您可能还需要向服务器传递其他参数（有关更多详细信息，请参阅参考文档）。

proxy_pass 指令也可以指向一组命名的服务器。在这种情况下，请求将根据指定的方法分布在组中的服务器之间。

## 传递请求头

默认情况下，NGINX 在代理请求中重新定义两个头字段：“Host” 和 “Connection”，并且消除值为空字符串的头字段。 “Host” 设置为 $proxy_host 变量，而 “Connection” 设置为 close。

要更改这些设置以及修改其他头字段，使用 proxy_set_header 指令。此指令可以在位置或更高位置指定。也可以在特定服务器上下文或 http 块中指定。例如：

```nginx
location /some/path/ {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_pass http://localhost:8000;
}
```

在此配置中，“Host” 字段设置为 $host 变量。

要防止某个头字段传递到代理服务器，请将其设置为空字符串，如下所示：

```nginx
location /some/path/ {
    proxy_set_header Accept-Encoding "";
    proxy_pass http://localhost:8000;
}
```

### 配置缓冲区

默认情况下，NGINX 缓冲来自代理服务器的响应。响应存储在内部缓冲区中，直到整个响应接收完毕后才发送给客户端。缓冲有助于优化与慢速客户端的性能，如果响应是从 NGINX 同步传递到客户端，可能会浪费代理服务器的时间。

但是，当启用缓冲时，NGINX 允许代理服务器快速处理响应，同时 NGINX 将响应存储多长时间取决于客户端下载它们所需的时间。

负责启用和禁用缓冲的指令是 proxy_buffering。

默认情况下，它设置为 on，缓冲已启用。

proxy_buffers 指令控制为请求分配的缓冲区的大小和数量。来自代理服务器的响应的第一部分存储在单独的缓冲区中，其大小由 proxy_buffer_size 指令设置。此部分通常包含相对较小的响应头，可以比其他响应的缓冲区小。

在下面的示例中，增加了默认缓冲区的数量，并将响应的第一部分的缓冲区大小设为小于默认值：

```nginx
location /some/path/ {
    proxy_buffers 16 4k;
    proxy_buffer_size 2k;
    proxy_pass http://localhost:8000;
}
```

如果禁用了缓冲，响应将在从代理服务器接收响应时同步发送给客户端。对于需要尽快开始接收响应的快速交互式客户端，可能希望这种行为。

要在特定位置禁用缓冲，请在位置中使用 proxy_buffering 指令并使用 off 参数，如下所示：

```nginx
location /some/path/ {
    proxy_buffering off;
    proxy_pass http://localhost:8000;
}
```

在这种情况下，NGINX 仅使用由 proxy_buffer_size 配置的缓冲区来存储响应的当前部分。

## 选择出站 IP 地址

如果您的代理服务器具有多个网络接口，有时可能需要为连接到代理服务器或上游的特定源 IP 地址进行选择。

如果 NGINX 后面的代理服务器配置为接受来自特定 IP 网络或 IP 地址范围的连接，则此功能可能很有用。

指定 proxy_bind 指令和必要网络接口的 IP 地址：

```nginx
location /app1/ {
    proxy_bind 127.0.0.1;
    proxy_pass http://example.com/app1/;
}

location /app2/ {
    proxy_bind 127.0.0.2;
    proxy_pass http://example.com/app2/;
}
```

也可以使用变量指定 IP 地址。例如，$server_addr 变量传递接受请求的网络接口的 IP 地址：

```nginx
location /app3/ {
    proxy_bind $server_addr;
    proxy_pass http://example.com/app3/;
}
```



# chat

## 详细介绍一下 nginx 反向代理，不太理解和转发/重定向的区别是什么？

Nginx 反向代理（Reverse Proxy）是一种网络服务，它位于客户端与服务器之间。

客户端对网站的访问请求首先被发送到 Nginx，然后 Nginx 将请求转发到一个或多个后端服务器。

客户端通常不知道后端服务器的存在，因为 Nginx 直接响应客户端的请求。

这个过程对于客户端来说是透明的。

### Nginx 反向代理的作用

1. **负载均衡**：Nginx 可以将请求分发到多个后端服务器，平衡负载并提高网站可用性。
2. **SSL 终端**：Nginx 可以处理 SSL/TLS 加密，减轻后端服务器的加密负担。
3. **缓存静态内容**：Nginx 可以缓存来自后端服务器的内容，提高响应速度。
4. **压缩响应**：在将响应发送给客户端之前，Nginx 可以压缩内容，减少传输数据量。
5. **安全性**：Nginx 可以作为防火墙，保护后端服务器免受某些类型的网络攻击。

### 配置 Nginx 反向代理

以下是 Nginx 反向代理的基本配置示例：

```nginx
http {
    server {
        listen 80;

        location / {
            proxy_pass http://backend_server;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

在这个配置中：

- `listen 80;` 表示 Nginx 监听 80 端口。
- `proxy_pass http://backend_server;` 指定了请求被转发到的后端服务器地址。
- `proxy_set_header` 指令用于设置转发到后端服务器的 HTTP 头部，包括原始请求的 `Host`、客户端的 `IP` 地址和 `X-Forwarded-For` 头部。

### 转发 vs 重定向

- **转发（Forwarding）**：在 Nginx 中，转发通常指的是将客户端的请求传递给另一个服务器处理，而不告知客户端。客户端与后端服务器之间的通信由 Nginx 管理，客户端感知不到后端服务器的存在。这通常用于负载均衡或将请求传递给处理特定任务的内部服务器。

- **重定向（Redirecting）**：重定向是 HTTP 标准的一部分，它涉及将客户端的请求显式地重新路由到另一个 URI。这通常用于当资源移动到新位置时告知客户端，或者在 URL 结构发生变化时使用。重定向在 Nginx 中通过 `return` 指令实现，例如：

  ```nginx
  location /old-path {
      return 301 http://www.example.com/new-path;
  }
  ```

  这个配置会将所有对 `/old-path` 的请求重定向到 `http://www.example.com/new-path`。

### 总结

Nginx 反向代理是一种强大的工具，可以提高网站的性能、安全性和可伸缩性。

转发是 Nginx 反向代理中的一个关键概念，它允许 Nginx 在内部将请求传递给后端服务器，而不让客户端知道。

与之相对的重定向则明确告知客户端新的资源位置。两者都是 Nginx 用于管理网络请求流的重要机制。




# 参考资料

https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/

* any list
{:toc}
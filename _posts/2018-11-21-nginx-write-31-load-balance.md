---
layout: post
title:  从零手写实现 nginx-31-load balance 负载均衡介绍
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

[从零手写实现 nginx-17-nginx 默认配置优化](https://houbb.github.io/2018/11/22/nginx-write-17-nginx-conf-global-default)

[从零手写实现 nginx-18-nginx 请求头+响应头操作](https://houbb.github.io/2018/11/22/nginx-write-18-nginx-conf-header-oper)

[从零手写实现 nginx-19-nginx cors](https://houbb.github.io/2018/11/22/nginx-write-19-cors)

[从零手写实现 nginx-20-nginx 占位符 placeholder](https://houbb.github.io/2018/11/22/nginx-write-20-placeholder)

[从零手写实现 nginx-21-nginx modules 模块信息概览](https://houbb.github.io/2018/11/22/nginx-write-21-modules-overview)

[从零手写实现 nginx-22-nginx modules 分模块加载优化](https://houbb.github.io/2018/11/22/nginx-write-22-modules-load)

[从零手写实现 nginx-23-nginx cookie 的操作处理](https://houbb.github.io/2018/11/22/nginx-write-23-cookie-oper)

[从零手写实现 nginx-24-nginx IF 指令](https://houbb.github.io/2018/11/22/nginx-write-24-directives-if)

[从零手写实现 nginx-25-nginx map 指令](https://houbb.github.io/2018/11/22/nginx-write-25-directives-map)

[从零手写实现 nginx-26-nginx rewrite 指令](https://houbb.github.io/2018/11/22/nginx-write-26-directives-rewrite)

[从零手写实现 nginx-27-nginx return 指令](https://houbb.github.io/2018/11/22/nginx-write-27-directives-return)

[从零手写实现 nginx-28-nginx error_pages 指令](https://houbb.github.io/2018/11/22/nginx-write-28-directives-error-pages)

[从零手写实现 nginx-29-nginx try_files 指令](https://houbb.github.io/2018/11/22/nginx-write-29-directives-try_files)

[从零手写实现 nginx-30-nginx proxy_pass upstream 指令](https://houbb.github.io/2018/11/22/nginx-write-30-proxy-pass)

[从零手写实现 nginx-31-nginx load-balance 负载均衡](https://houbb.github.io/2018/11/22/nginx-write-31-load-balance)

# nginx 负载均衡是什么？

Nginx 负载均衡，就像一个聪明的分餐员，帮你把大量订单均匀地分配给不同的大厨，让每个大厨都能忙而不乱，最终让顾客都能快速拿到自己的餐品。

### 例子

假设你经营了一家非常受欢迎的餐馆，来吃饭的顾客特别多。

如果只有一个大厨来做饭，他很快就会忙不过来，顾客就得等很久。为了提高效率，你雇了好几个大厨，每个大厨都能做相同的菜。

- **负载均衡器（Load Balancer）**：Nginx 就像餐馆的一个聪明分餐员，他的工作就是接到订单后，把订单均匀地分给每个大厨。这就叫负载均衡。

### 具体场景：

1. **客户请求**：很多顾客来点餐（客户端请求）。
2. **Nginx 分发请求**：Nginx 分餐员接到订单后，把订单分配给不同的大厨（后端服务器）。
3. **大厨处理请求**：每个大厨根据分配到的订单做菜（处理请求），然后把做好的菜（响应）交给分餐员。
4. **返回结果**：分餐员把菜送到顾客手中（返回响应给客户端）。

### 举个例子：

```conf
http {
    upstream my_backend {
        server 192.168.0.1;
        server 192.168.0.2;
        server 192.168.0.3;
    }

    server {
        listen 80;
        server_name www.example.com;

        location / {
            proxy_pass http://my_backend;
        }
    }
}
```

- **upstream my_backend**：定义了三位大厨的 IP 地址（后端服务器）。
- **proxy_pass http://my_backend**：Nginx 分餐员接到顾客的订单后，会把订单均匀地分给这三位大厨处理。

### 总结

Nginx 负载均衡的目标是通过均匀分配请求，确保每台服务器（大厨）都不至于过载，从而提升整体系统的效率和可靠性。

这样，每个顾客都能更快地得到服务，整个餐馆的运营也更加顺畅。

# nginx 支持哪些负载均衡算法？给出对应的例子

Nginx 支持多种负载均衡算法，可以根据不同的需求来选择合适的算法。以下是主要的几种负载均衡算法及其配置示例：

### 1. 轮询（Round Robin）

这是 Nginx 默认的负载均衡算法。请求依次分配给每个后端服务器，按顺序循环。

```conf
upstream my_backend {
    server 192.168.0.1;
    server 192.168.0.2;
    server 192.168.0.3;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

### 2. 权重轮询（Weighted Round Robin）

可以为每个服务器设置权重，权重越高，分配到的请求越多。

```conf
upstream my_backend {
    server 192.168.0.1 weight=3;
    server 192.168.0.2 weight=2;
    server 192.168.0.3 weight=1;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

### 3. 最少连接（Least Connections）

将新请求分配给当前活动连接数最少的服务器，适用于请求处理时间不均匀的情况。

```conf
upstream my_backend {
    least_conn;
    server 192.168.0.1;
    server 192.168.0.2;
    server 192.168.0.3;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

### 4. IP 哈希（IP Hash）

根据客户端的 IP 地址分配请求，同一 IP 地址的请求会分配到同一台服务器上，适用于需要会话保持的场景。

```conf
upstream my_backend {
    ip_hash;
    server 192.168.0.1;
    server 192.168.0.2;
    server 192.168.0.3;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

### 5. 一致性哈希（Hash）

根据用户定义的键（比如 URL、cookie 等）分配请求，确保相同键的请求分配到同一台服务器。

```conf
upstream my_backend {
    hash $request_uri;
    server 192.168.0.1;
    server 192.168.0.2;
    server 192.168.0.3;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

# 总结

Nginx 提供了多种负载均衡算法，包括轮询、权重轮询、最少连接、IP 哈希和一致性哈希。

每种算法适用于不同的场景和需求，选择合适的算法可以提升系统的性能和可靠性。

通过配置 `upstream` 指令和相关参数，可以灵活地实现各种负载均衡策略。


# 参考资料

* any list
{:toc}
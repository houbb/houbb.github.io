---
layout: post
title:  Nginx R31 doc-13-Limiting Access to Proxied HTTP Resources 访问限流
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

## 手写 nginx 系列

如果你对 netty 不是很熟悉，可以读一下

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[从零手写实现 nginx-06-文件夹自动索引](https://houbb.github.io/2018/11/22/nginx-write-06-dir-list)

[从零手写实现 nginx-07-大文件下载](https://houbb.github.io/2018/11/22/nginx-write-07-big-file)

[从零手写实现 nginx-08-范围查询](https://houbb.github.io/2018/11/22/nginx-write-08-range)

[从零手写实现 nginx-09-文件压缩](https://houbb.github.io/2018/11/22/nginx-write-09-comparess)

# 限制访问代理的 HTTP 资源

通过限制连接、请求速率或带宽，基于客户端 IP 地址或其他变量，来保护您的上游 Web 和应用服务器。

本文解释了如何设置连接的最大请求数，或者从服务器下载内容的最大速率。

## 简介

使用 NGINX 和 NGINX Plus，可以限制：

- 每个键值（例如，每个 IP 地址）的连接数
- 每个键值（每秒或每分钟允许处理的请求数）
- 连接的下载速度

请注意，IP 地址可以在 NAT 设备后共享，因此应谨慎使用按 IP 地址限制。

## 限制连接数

要限制连接数：

1. 使用 `limit_conn_zone` 指令定义键并设置共享内存区域的参数（工作进程将使用此区域来共享键值的计数器）。在

第一个参数中，指定为键计算的表达式。在第二个参数 `zone` 中，指定区域的名称和大小：

   ```nginx
   limit_conn_zone $binary_remote_addr zone=addr:10m;
   ```

2. 使用 `limit_conn` 指令在 `location {}`、`server {}` 或 `http {}` 上下文中应用限制。将共享内存区域的名称作为第一个参数，并将每个键允许的连接数作为第二个参数：

   ```nginx
   location /download/ {
        limit_conn addr 1;
   }
   ```

连接数基于 IP 地址进行限制，因为使用了 `$binary_remote_addr` 变量作为键。

另一种限制给定服务器的连接数的方法是使用 `$server_name` 变量：

```nginx
http {
    limit_conn_zone $server_name zone=servers:10m;

    server {
        limit_conn servers 1000;
    }
}
```

# 限制请求速率

速率限制可用于防止 DDoS 攻击，或防止上游服务器同时收到过多请求而被淹没。该方法基于漏桶算法：请求以不同的速率到达桶中，并以固定的速率离开桶。

在使用速率限制之前，您需要配置“漏桶”的全局参数：

- 键（key）：用于区分一个客户端和另一个客户端的参数，通常是一个变量。
- 共享内存区域（shared memory zone）：保存这些键的状态（“漏桶”）的区域的名称和大小。
- 速率（rate）：以每秒请求数（r/s）或每分钟请求数（r/m）指定的请求速率限制（“漏桶排空”）。每分钟请求用于指定少于每秒一个请求的速率。

这些参数是使用 `limit_req_zone` 指令设置的。该指令在 `http {}` 级别定义 - 这种方法允许将不同的区域和请求溢出参数应用于不同的上下文：

```nginx
http {
    #...
    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
}
```

通过这种配置，将创建一个名为 `one`、大小为 10 兆字节的共享内存区域。该区域保存了使用 `$binary_remote_addr` 变量设置的客户端 IP 地址的状态。请注意，与 `$remote_addr` 相比，后者也保存客户端的 IP 地址，而 `$binary_remote_addr` 保存的是 IP 地址的二进制表示，长度更短。

共享内存区域的最佳大小可以使用以下数据计算：IPv4 地址的 `$binary_remote_addr` 值大小为 4 字节，在 64 位平台上，存储状态占据 128 字节。因此，大约 16,000 个 IP 地址的状态信息占用 1 兆字节的区域。

如果当 NGINX 需要添加新条目时存储空间已经耗尽，则会删除最旧的条目。如果释放的空间仍然不足以容纳新记录，则 NGINX 返回状态码 503 Service Unavailable。您可以使用 `limit_req_status` 指令重新定义状态码。

设置了区域之后，您可以在 NGINX 配置的任何位置使用请求限制，使用 `limit_req` 在 `server {}`、`location {}` 或 `http {}` 上下文中指定：

```nginx
http {
    #...

    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;

    server {
        #...

        location /search/ {
            limit_req zone=one;
        }
    }
}
```

通过这种配置，NGINX 在 `/search/` 位置内每秒最多处理 1 个请求。这些请求的处理会以这样的方式延迟，以确保总速率不超过指定值。如果请求的数量超过指定的速率，NGINX 将延迟处理这些请求，直到“桶”（共享内存区域 `one`）已满。

对于到达满桶的请求，NGINX 将使用 503 Service Unavailable 错误进行响应（如果没有使用 `limit_req_status` 重新定义）。

# 测试请求速率限制

在配置实际的请求速率限制之前，您可以尝试“干运行”模式，该模式不会限制请求处理速率。但是，这些过多的请求仍然会计入共享内存区域并进行记录。您可以使用 `limit_req_dry_run` 指令启用“干运行”模式：

```nginx
http {
    #...

    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;

    server {
        #...

        location /search/ {
            limit_req zone=one;
            limit_req_dry_run on;
        }
    }
}
```

每个超出定义的速率限制的请求都将带有“干运行”标记进行记录：

```
2019/09/03 10:28:45 [error] 142#142: *13246 limiting requests, dry run, excess: 1.000 by zone "one", client: 172.19.0.1, server: www.example.com, request: "GET / HTTP/1.0", host: "www.example.com:80"
```

## 处理过多的请求 Handling Excessive Requests

请求被限制以符合 `limit_req_zone` 指令中定义的速率。

如果请求的数量超过了指定的速率，并且共享内存区域变满，NGINX 将以错误响应。

由于流量往往是突发性的，返回错误以响应流量突发期间的客户端请求并非最佳方案。

在 NGINX 中，这些过多的请求可以进行缓冲和处理。`limit_req` 指令的 `burst` 参数设置了等待以指定速率处理的过多请求的最大数量：

```nginx
http {
    #...

    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;

    server {
        #...

        location /search/ {
            limit_req zone=one burst=5;
        }
    }
}
```

通过这种配置，如果请求速率超过每秒 1 个请求，超出速率的请求将放入区域 `one`。当区域满时，过多的请求将被排队（burst），此队列的大小为 5 个请求。队列中的请求处理会延迟，以确保总速率不超过指定值。超出突发限制的请求将用 503 错误拒绝。

如果不希望在流量突发期间延迟请求，可以添加 `nodelay` 参数：

```nginx
http {
    #...

    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;

    server {
        #...

        location /search/ {
            limit_req zone=one burst=5 nodelay;
        }
    }
}
```

通过这种配置，突发限制内的过多请求将立即服务，而不考虑指定的速率，超出突发限制的请求将用 503 错误拒绝。

## 延迟过多的请求 Delaying Excessive Requests

处理过多请求的另一种方法是在一定数量的请求中提供无延迟服务，然后在超出此数量后应用速率限制，直到拒绝过多的请求。

可以使用 `delay` 和 `burst` 参数来实现这一点。`delay` 参数定义了超出请求被延迟以符合定义的速率限制的点：

```nginx
http {
    #...

    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;

    server {
        #...

        location /search/ {
            limit_req zone=one burst=5 delay=3;
        }
    }
}
```

通过这种配置，前 3 个请求（`delay`）将无延迟通过，接下来的 2 个请求（`burst - delay`）将以延迟的方式进行处理，以确保总速率不超过指定的值，进一步过多的请求将被拒绝，因为已超出了总突发大小，后续请求将被延迟处理。

## 同步多个共享内存区域的内容 Synchronizing Contents of Many Shared Memory Zones

如果您有一个带有多个 NGINX 实例的计算机集群，并且这些实例使用了 `limit_req` 方法，则可以在以下条件下同步它们的共享内存区域的内容：

- 每个实例都配置了 `zone_sync` 功能
- 每个实例的 `limit_req_zone` 指令设置的共享内存区域具有相同的名称
- 每个实例的 `limit_req_zone` 指令指定了 `sync` 参数：

```nginx
http {
    #...
    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s sync;
}
```

有关详细信息，请参阅[集群中的运行时状态共享](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html#zone_sync)。


# 限制带宽 

要限制每个连接的带宽，可以使用 `limit_rate` 指令：

```nginx
location /download/ {
    limit_rate 50k;
}
```

通过这个设置，客户端将能够通过单个连接以最大速度下载 50 千字节/秒的内容。但是，客户端可以打开多个连接。因此，如果目标是防止下载速度超过指定值，还应该限制连接的数量。例如，每个 IP 地址一个连接（如果使用上面指定的共享内存区域）：

```nginx
location /download/ {
    limit_conn addr 1;
    limit_rate 50k;
}
```

要在客户端下载一定数量的数据后才施加限制，可以使用 `limit_rate_after` 指令。允许客户端快速下载一定数量的数据（例如，文件头 - 影片索引），然后限制下载其余数据的速率可能是合理的（让用户观看电影，而不是下载）。

```nginx
limit_rate_after 500k;
limit_rate       20k;
```

下面的示例展示了限制连接数和带宽的组合配置。允许的最大连接数设置为每个客户端地址 5 个连接，这适用于大多数常见情况，因为现代浏览器通常同时打开最多 3 个连接。同时，用于提供下载的位置只允许一个连接：

```nginx
http {
    limit_conn_zone $binary_remote_address zone=addr:10m

    server {
        root /www/data;
        limit_conn addr 5;

        location / {
        }

        location /download/ {
            limit_conn       addr 1;
            limit_rate_after 1m;
            limit_rate       50k;
        }
    }
}
```

# 动态带宽控制 Dynamic Bandwidth Control

`limit_rate` 值也可以指定为变量 - 这可以实现动态带宽使用案例，例如，允许现代浏览器有更高的带宽限制：

```nginx
map $ssl_protocol $response_rate {
    "TLSv1.1" 10k;
    "TLSv1.2" 100k;
    "TLSv1.3" 1000k;
}

server {
    listen 443 ssl;
    ssl_protocols       TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_certificate     www.example.com.crt;
    ssl_certificate_key www.example.com.key;

    location / {
        limit_rate       $response_rate; # 根据 TLS 版本限制带宽
        limit_rate_after 512;            # 发送头部后应用限制
        proxy_pass       http://my_backend;
    }
}
```

参见

[使用NGINX和NGINX Plus进行速率限制](https://www.nginx.com/blog/rate-limiting-nginx/)



# 参考资料

https://docs.nginx.com/nginx/admin-guide/security-controls/controlling-access-proxied-http/

* any list
{:toc}
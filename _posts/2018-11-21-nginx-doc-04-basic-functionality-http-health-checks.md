---
layout: post
title:  Nginx R31 doc-04-HTTP Health Checks
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

### HTTP 健康检查

通过发送周期性的健康检查，包括可定制的主动健康检查，在上游组中监视 HTTP 服务器的健康状态。

#### 简介

NGINX 和 NGINX Plus 可以持续测试您的上游服务器，避免失败的服务器，并将已恢复的服务器优雅地添加到负载平衡组中。

#### 先决条件

- 对于被动健康检查，NGINX Open Source 或 NGINX Plus
- 对于主动健康检查和实时活动监控仪表板，NGINX Plus
- 一个负载平衡的 HTTP 上游服务器组

#### 被动健康检查

对于被动健康检查，NGINX 和 NGINX Plus 监视事务的发生，并尝试恢复失败的连接。

如果事务仍无法恢复，NGINX Open Source 和 NGINX Plus 将服务器标记为不可用，并且暂时停止向其发送请求，直到再次标记为活动。

定义上游服务器标记为不可用的条件，为每个上游服务器使用 upstream 块中 server 指令的参数：

- fail_timeout - 设置服务器被标记为不可用的时间段，以及服务器被标记为不可用的时间（默认为 10 秒）。
- max_fails - 设置在 fail_timeout 时间段内必须发生的失败尝试次数，以使服务器被标记为不可用（默认为 1 次尝试）。

在以下示例中，如果 NGINX 在 30 秒内无法发送请求给服务器或者从服务器那里接收到响应 3 次，则将服务器标记为不可用，持续 30 秒：

```nginx
upstream backend {
    server backend1.example.com;
    server backend2.example.com max_fails=3 fail_timeout=30s;
}
```

请注意，如果组中只有一个服务器，则 fail_timeout 和 max_fails 参数将被忽略，并且该服务器永远不会被标记为不可用。

#### 服务器慢启动

一个最近恢复的服务器可能会被连接轻松地压垮，这可能会导致服务器再次被标记为不可用。

慢启动允许上游服务器在恢复或可用后逐渐将其权重从零增加到其名义值。

这可以通过 upstream server 指令的 slow_start 参数来完成：

```nginx
upstream backend {
    server backend1.example.com slow_start=30s;
    server backend2.example.com;
    server 192.0.0.1 backup;
}
```

请注意，如果组中只有一个服务器，则 slow_start 参数将被忽略，并且该服务器永远不会被标记为不可用。

慢启动是专属于 NGINX Plus 的功能。


### 主动健康检查

NGINX Plus 可以通过向每个服务器发送特殊的健康检查请求并验证正确的响应，定期检查上游服务器的健康状况。

要启用主动健康检查：

1. 在传递请求（proxy_pass）到上游组的位置上，包含 health_check 指令：

    ```nginx
    server {
        location / {
            proxy_pass http://backend;
            health_check;
        }
    }
    ```

    这个片段定义了一个服务器，将所有请求（location /）传递到名为 backend 的上游组。它还使用 health_check 指令启用了高级健康监测：默认情况下，NGINX Plus 每隔五秒向 backend 组中的每个服务器发送一次“/”的请求。如果发生任何通信错误或超时（服务器响应的状态码不在 200 到 399 的范围内），则健康检查失败。服务器被标记为不健康，并且 NGINX Plus 不会向其发送客户端请求，直到它再次通过健康检查。

2. 可选地，您可以为健康检查指定另一个端口，例如，用于监视同一主机上的许多服务的健康状况。使用 health_check 指令的 port 参数指定一个新端口：

    ```nginx
    server {
        location / {
            proxy_pass   http://backend;
            health_check port=8080;
        }
    }
    ```

3. 在上游服务器组中，使用 zone 指令定义一个共享内存区域：

    ```nginx
    http {
        upstream backend {
            zone backend 64k;
            server backend1.example.com;
            server backend2.example.com;
            server backend3.example.com;
            server backend4.example.com;
        }
    }
    ```

    该区域在所有 worker 进程之间共享，并存储上游组的配置。这使得 worker 进程可以使用相同的计数器集来跟踪来自组中服务器的响应。

默认情况下，可以使用 health_check 指令的参数覆盖主动健康检查的设置：

```nginx
location / {
    proxy_pass   http://backend;
    health_check interval=10 fails=3 passes=2;
}
```

在这里，interval 参数将健康检查之间的延迟从默认的 5 秒增加到 10 秒。fails 参数要求服务器在三次健康检查失败后被标记为不健康（默认为一次）。最后，passes 参数意味着服务器必须通过两个连续的检查才能被再次标记为健康，而不是默认的一次。

您还可以使用 keepalive_time 参数启用连接缓存 - 在 TLS 上游的情况下，每次健康检查探测都不会进行完整的 TLS 握手，而是在指定的一段时间内重复使用连接：

```nginx
location / {
    proxy_http_version 1.1;
    proxy_set_header   Connection "";
    proxy_pass         https://backend;
    health_check       interval=1 keepalive_time=60s;
}
```

### 指定请求的 URI

使用 health_check 指令的 uri 参数设置健康检查中请求的 URI：

```nginx
location / {
    proxy_pass   http://backend;
    health_check uri=/some/path;
}
```

指定的 URI 会附加到上游块中为服务器设置的域名或 IP 地址上。对于上述示例中声明的 sample backend 组的第一个服务器，健康检查请求的 URI 是“http://backend1.example.com/some/path"。

### 定义自定义条件

您可以设置响应必须满足的自定义条件，以使服务器通过健康检查。这些条件在 match 块中定义，然后在 health_check 指令的 match 参数中引用。

在 http {} 级别上指定 match {} 块并命名，例如 server_ok：

```nginx
http {
    #...
    match server_ok {
        # 测试在这里
    }
}
```

通过 health_check 指令指定 match 参数和 match 块的名称：

```nginx
http {
    #...
    match server_ok {
       

 status 200-399;
        body   !~ "maintenance mode";
    }
    server {
        #...
        location / {
            proxy_pass   http://backend;
            health_check match=server_ok;
        }
    }
}
```

在这里，如果响应的状态码在 200–399 范围内，并且其正文不包含 "maintenance mode" 字符串，则健康检查会通过。

match 指令使 NGINX Plus 能够检查响应的状态码、标头字段和正文。使用该指令，可以验证状态是否在指定范围内，响应是否包含标头，或者标头或正文是否匹配正则表达式。match 指令可以包含一个 status 条件，一个 body 条件和多个 header 条件。响应必须满足 match 块中定义的所有条件才能使服务器通过健康检查。

例如，以下 match 指令匹配状态码为 200、Content-Type 标头中包含确切值 text/html，以及正文中包含 Welcome to nginx! 的响应：

```nginx
match welcome {
    status 200;
    header Content-Type = text/html;
    body   ~ "Welcome to nginx!";
}
```

以下示例使用叹号（!）来定义响应必须不具备的特征才能通过健康检查。在这种情况下，当状态码不是 301、302、303 或 307 时，且没有 Refresh 标头时，健康检查通过。

```nginx
match not_redirect {
    status ! 301-303 307;
    header ! Refresh;
}
```

### 强制健康检查

默认情况下，当将新服务器添加到上游组时，NGINX Plus 将其视为健康的，并立即向其发送流量。但对于某些服务器，特别是如果它们是通过 API 接口或通过 DNS 解析添加的，则最好在允许它们处理流量之前先执行健康检查。

mandatory 参数要求每个新添加的服务器在 NGINX Plus 向其发送流量之前通过所有配置的健康检查。

与慢启动结合使用时，它给了新服务器更多的时间来连接到数据库并“预热”，然后再请求处理其全部流量。

可以将强制健康检查标记为持久性的，以便在重新加载配置时记住以前的状态。与 mandatory 参数一起指定 persistent 参数：

```nginx
upstream my_upstream {
    zone   my_upstream 64k;
    server backend1.example.com slow_start=30s;
}

server {
    location / {
        proxy_pass   http://my_upstream;
        health_check mandatory persistent;
    }
}
```

在这里，指定了 health_check 指令的 mandatory 和 persistent 参数，以及 server 指令的 slow_start 参数。使用 API 或 DNS 接口添加到上游组的服务器被标记为不健康，并且在通过健康检查之前不接收流量；在此之后，它们开始在 30 秒的时间段内逐渐接收增加的流量。如果重新加载 NGINX Plus 配置并且在重新加载之前服务器被标记为健康，则不会执行强制健康检查，服务器状态被认为是正常的。

健康检查也可以应用于非 HTTP 协议，例如 FastCGI、memcached、SCGI、uwsgi，以及 TCP 和 UDP。




# 参考资料

https://docs.nginx.com/nginx/admin-guide/load-balancer/http-health-check/

* any list
{:toc}
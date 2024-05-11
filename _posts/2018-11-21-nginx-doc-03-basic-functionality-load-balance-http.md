---
layout: post
title:  Nginx R31 doc-03-HTTP Load Balancing HTTP 负载均衡
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# HTTP 负载均衡

在 Web 或应用服务器组之间负载平衡 HTTP 流量，使用多种算法和高级功能，如慢启动和会话保持。

## 概述

跨多个应用程序实例进行负载平衡是一种常用的技术，用于优化资源利用率、最大化吞吐量、减少延迟，并确保容错配置。

观看 NGINX Plus for Load Balancing and Scaling 网络研讨会，深入了解 NGINX 用户用于构建大规模、高可用性 Web 服务的技术。

NGINX 和 NGINX Plus 可以在不同的部署场景中作为非常高效的 HTTP 负载均衡器使用。

## 代理 HTTP 流量到一组服务器

要开始使用 NGINX Plus 或 NGINX Open Source 将 HTTP 流量负载均衡到一组服务器，首先需要使用 upstream 指令定义该组。该指令位于 http 上下文中。

组中的服务器使用 server 指令进行配置（不要与定义在 NGINX 上运行的虚拟服务器的 server 块混淆）。

例如，以下配置定义了一个名为 backend 的组，由三个服务器配置组成（实际服务器可能超过三个）：

```conf
http {
    upstream backend {
        server backend1.example.com weight=5;
        server backend2.example.com;
        server 192.0.0.1 backup;
    }
}
```

为了将请求传递给服务器组，组的名称在 proxy_pass 指令中指定（或者对于这些协议，可以在 fastcgi_pass、memcached_pass、scgi_pass 或 uwsgi_pass 指令中指定）。

在下一个示例中，运行在 NGINX 上的虚拟服务器将所有请求传递给前面示例中定义的 backend 上游组：

```conf
server {
    location / {
        proxy_pass http://backend;
    }
}
```

以下示例结合了上面的两个片段，并展示了如何将 HTTP 请求代理到后端服务器组。

该组由三个服务器组成，其中两个运行着相同应用程序的实例，而第三个是备份服务器。

由于在 upstream 块中未指定负载均衡算法，NGINX 使用默认算法，即 Round Robin：

```conf
http {
    upstream backend {
        server backend1.example.com;
        server backend2.example.com;
        server 192.0.0.1 backup;
    }

    server {
        location / {
            proxy_pass http://backend;
        }
    }
}
```

### 选择负载均衡方法

NGINX Open Source 支持四种负载均衡方法，NGINX Plus 添加了两种额外的方法：

#### Round Robin（轮询）

- 请求均匀分配到服务器上，考虑了服务器的权重。这是默认使用的方法（没有启用它的指令）：

```nginx
upstream backend {
   # 没有指定负载均衡方法，默认为 Round Robin
   server backend1.example.com;
   server backend2.example.com;
}
```

#### Least Connections（最小连接数）

- 请求发送到当前具有最少活动连接的服务器上，再次考虑服务器的权重：

```nginx
upstream backend {
    least_conn;
    server backend1.example.com;
    server backend2.example.com;
}
```

#### IP Hash（IP 哈希）

- 根据客户端 IP 地址确定要发送请求的服务器。在这种情况下，使用 IPv4 地址的前三个八位字节或整个 IPv6 地址来计算哈希值。此方法确保来自相同地址的请求到达同一服务器，除非该服务器不可用。

```nginx
upstream backend {
    ip_hash;
    server backend1.example.com;
    server backend2.example.com;
}
```

#### Generic Hash（通用哈希）

- 根据用户定义的密钥确定要发送请求的服务器，可以是文本字符串、变量或组合。例如，密钥可以是配对的源 IP 地址和端口，或者是 URI。

```nginx
upstream backend {
    hash $request_uri consistent;
    server backend1.example.com;
    server backend2.example.com;
}
```

#### Least Time（仅适用于 NGINX Plus）

- 对于每个请求，NGINX Plus 选择具有最低平均延迟和最少活动连接的服务器。最低平均延迟是基于 least_time 指令的以下参数之一计算的：

  - header：从服务器接收第一个字节的时间
  - last_byte：从服务器接收完整响应的时间
  - last_byte inflight：考虑了不完整请求后，从服务器接收完整响应的时间

```nginx
upstream backend {
    least_time header;
    server backend1.example.com;
    server backend2.example.com;
}
```

#### Random（随机）

- 每个请求将被随机选择的服务器处理。如果指定了 two 参数，首先，NGINX 随机选择两个服务器，然后使用指定的方法选择其中一个服务器：

  - least_conn：最少活动连接数
  - least_time=header（仅适用于 NGINX Plus）：从服务器接收响应头的最小平均时间（$upstream_header_time）
  - least_time=last_byte（仅适用于 NGINX Plus）：从服务器接收完整响应的最小平均时间（$upstream_response_time）

```nginx
upstream backend {
    random two least_time=last_byte;
    server backend1.example.com;
    server backend2.example.com;
    server backend3.example.com;
    server backend4.example.com;
}
```

随机负载平衡方法应该用于分布式环境，其中多个负载均衡器正在将请求传递到相同的后端。

对于负载均衡器具有所有请求的完整视图的环境，请使用其他负载均衡方法，例如轮询、最少连接和最小时间。

注意：配置除了 Round Robin 以外的任何方法时，请将相应的指令（hash、ip_hash、least_conn、least_time 或 random）放在 upstream {} 块中的 server 指令列表之前。

### 服务器权重

默认情况下，NGINX 使用 Round Robin 方法根据服务器的权重分配请求给组中的服务器。server 指令的 weight 参数设置服务器的权重；默认值为 1：

```nginx
upstream backend {
    server backend1.example.com weight=5;
    server backend2.example.com;
    server 192.0.0.1 backup;
}
```

在此示例中，backend1.example.com 的权重为 5；其他两个服务器的权重为默认值（1），但具有 IP 地址 192.0.0.1 的服务器标记为备份服务器，除非其他两个服务器都不可用，否则不会接收请求。

根据这些权重配置，每 6 个请求中，5 个请求被发送到 backend1.example.com，1 个请求被发送到 backend2.example.com。

### 服务器慢启动

服务器慢启动功能防止了最近恢复的服务器被连接淹没，可能会超时并导致服务器再次标记为失败。

在 NGINX Plus 中，慢启动允许上游服务器在恢复或可用后逐渐将其权重从 0 增加到其名义值。

可以通过 server 指令的 slow_start 参数实现这一点：

```nginx
upstream backend {
    server backend1.example.com slow_start=30s;
    server backend2.example.com;
    server 192.0.0.1 backup;
}
```

时间值（这里为 30 秒）设置了 NGINX Plus 将连接数逐渐增加到服务器的完整值的时间。

请注意，如果组中只有一个服务器，则 server 指令的 max_fails、fail_timeout 和 slow_start 参数将被忽略，并且该服务器永远不会被视为不可用。



### 启用会话保持

会话保持意味着 NGINX Plus 识别用户会话，并将给定会话中的所有请求路由到同一上游服务器。

NGINX Plus 支持三种会话保持方法。这些方法通过 sticky 指令设置。（对于 NGINX Open Source 的会话保持，请使用如上所述的 hash 或 ip_hash 指令。）

#### Sticky Cookie（粘性 Cookie）

- NGINX Plus 在来自上游组的第一个响应中添加一个会话 Cookie，并标识发送响应的服务器。客户端的下一个请求包含 Cookie 值，NGINX Plus 将请求路由到响应第一个请求的上游服务器：

```nginx
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
    sticky cookie srv_id expires=1h domain=.example.com path=/;
}
```

在示例中，srv_id 参数设置了 Cookie 的名称。可选的 expires 参数设置了浏览器保持 Cookie 的时间（这里为 1 小时）。可选的 domain 参数定义了设置 Cookie 的域，可选的 path 参数定义了设置 Cookie 的路径。这是最简单的会话保持方法。

#### Sticky Route（粘性路由）

- 当 NGINX Plus 收到第一个请求时，它为客户端分配一个“路由”。所有后续请求都与 server 指令的 route 参数进行比较，以确定请求被代理到的服务器。路由信息来自 Cookie 或请求 URI。

```nginx
upstream backend {
    server backend1.example.com route=a;
    server backend2.example.com route=b;
    sticky route $route_cookie $route_uri;
}
```

#### Sticky Learn Method（学习型粘性）

- NGINX Plus 首先通过检查请求和响应来找到会话标识符。

然后 NGINX Plus “学习”哪个上游服务器对应于哪个会话标识符。通常，这些标识符是通过 HTTP Cookie 传递的。如果请求包含已经“学习”的会话标识符，则 NGINX Plus 将请求转发到相应的服务器：

```nginx
upstream backend {
   server backend1.example.com;
   server backend2.example.com;
   sticky learn
       create=$upstream_cookie_examplecookie
       lookup=$cookie_examplecookie
       zone=client_sessions:1m
       timeout=1h;
}
```

在示例中，其中一个上游服务器通过在响应中设置 Cookie EXAMPLECOOKIE 来创建会话。

- create 参数指定了一个变量，指示如何创建新会话。在示例中，通过上游服务器发送的 EXAMPLECOOKIE Cookie 创建新会话。

- lookup 参数指定了如何查找现有会话。在我们的示例中，现有会话在客户端发送的 EXAMPLECOOKIE Cookie 中搜索。

- zone 参数指定了一个共享内存区，用于保存有关粘性会话的所有信息。在我们的示例中，区域名为 client_sessions，大小为 1MB。

这是比前两种方法更复杂的会话保持方法，因为它不需要在客户端上保留任何 Cookie：所有信息都在服务器端的共享内存区中保留。

如果集群中有多个使用“sticky learn”方法的 NGINX 实例，可以在满足以下条件时同步其共享内存区的内容：

- 区域具有相同的名称
- 每个实例都配置了 zone_sync 功能
- 指定了 sync 参数

详见《集群中的运行时状态共享》。



### 限制连接数

使用 NGINX Plus，可以通过指定 max_conns 参数来限制到上游服务器的活动连接数的最大数量。

如果达到了 max_conns 限制，请求将被放入队列以供进一步处理，前提是还包括 queue 指令以设置同时可以在队列中的最大请求数量：

```nginx
upstream backend {
    server backend1.example.com max_conns=3;
    server backend2.example.com;
    queue 100 timeout=70;
}
```

如果队列中充满了请求或在可选的 timeout 参数指定的超时期间内无法选择上游服务器，则客户端会收到错误。

请注意，如果在其他 worker 进程中打开了空闲 keepalive 连接，则会忽略 max_conns 限制。因此，在共享内存与多个 worker 进程的配置中，服务器的总连接数可能会超过 max_conns 值。

### 配置健康检查

NGINX 可以持续测试您的 HTTP 上游服务器，避免失败的服务器，并将恢复的服务器优雅地添加到负载平衡组中。

请参阅《HTTP 健康检查》以了解如何为 HTTP 配置健康检查的说明。

### 与多个 worker 进程共享数据

如果一个 upstream 块不包含 zone 指令，则每个 worker 进程将保留其自己的服务器组配置副本，并维护其自己的一组相关计数器。这些计数器包括每个服务器组中的当前连接数以及尝试将请求传递给服务器的失败次数。因此，无法动态修改服务器组配置。

当在 upstream 块中包含 zone 指令时，上游组的配置保留在所有 worker 进程之间共享的内存区域中。这种情况是动态可配置的，因为 worker 进程访问同一份组配置副本并利用同一组相关计数器。

zone 指令对于主动健康检查和上游组的动态重新配置是强制性的。然而，上游组的其他功能也可以受益于使用该指令。

例如，如果一个组的配置不是共享的，每个 worker 进程都会维护自己的失败尝试计数器（由 max_fails 参数设置）。在这种情况下，每个请求仅到达一个 worker 进程。当选择处理请求的 worker 进程无法将请求传输到服务器时，其他 worker 进程不知道此事。虽然某些 worker 进程可能会认为服务器不可用，但其他 worker 进程仍然可能向该服务器发送请求。要将服务器确定为不可用，必须在由 fail_timeout 参数设置的时间范围内，失败尝试的次数必须等于 max_fails 乘以 worker 进程的数量。另一方面，zone 指令可以保证预期的行为。

同样，如果没有 zone 指令，Least Connections 负载均衡方法可能无法按预期工作，至少在低负载下是如此。此方法将请求传递给具有最少活动连接数的服务器。如果组的配置不共享，每个 worker 进程使用自己的连接数计数器，可能会向另一个 worker 进程刚刚发送请求的同一服务器发送请求。但是，您可以增加请求数量以减少此效果。在高负载下，请求均匀分布在 worker 进程之间，并且 Least Connections 方法按预期工作。

### 设置区域大小

无法推荐理想的内存区域大小，因为使用模式变化很大。所需的内存量取决于启用了哪些功能（例如会话保持、健康检查或 DNS 重新解析）以及如何标识上游服务器。

例如，使用 sticky_route 会话保持方法和启用单个健康检查时，256KB 区域可以容纳有关指定数量的上游服务器的信息：

- 128个服务器（每个定义为 IP 地址:端口对）
- 88个服务器（每个定义为主机名:端口对，其中主机名解析为单个 IP 地址）
- 12个服务器（每个定义为主机名:端口对，其中主机名解析为多个 IP 地址）


### 使用 DNS 配置 HTTP 负载均衡

可以使用 DNS 在运行时修改服务器组的配置。

对于在 server 指令中用域名标识的上游组中的服务器，NGINX Plus 可以监视相应 DNS 记录中 IP 地址列表的更改，并自动将更改应用于上游组的负载均衡，而无需重新启动。这可以通过在 http 块中包含 resolver 指令以及在 server 指令中包含 resolve 参数来完成：

```nginx
http {
    resolver 10.0.0.1 valid=300s ipv6=off;
    resolver_timeout 10s;
    server {
        location / {
            proxy_pass http://backend;
        }
    }
    upstream backend {
        zone backend 32k;
        least_conn;
        # ...
        server backend1.example.com resolve;
        server backend2.example.com resolve;
    }
}
```

在示例中，server 指令中的 resolve 参数告诉 NGINX Plus 定期重新解析 backend1.example.com 和 backend2.example.com 域名到 IP 地址。

resolver 指令定义了 NGINX Plus 发送请求的 DNS 服务器的 IP 地址（此处为 10.0.0.1）。默认情况下，NGINX Plus 以 DNS 记录中的 time-to-live（TTL）频率重新解析 DNS 记录，但可以使用 valid 参数覆盖 TTL 值；在示例中为 300 秒，即 5 分钟。

可选的 ipv6=off 参数表示仅使用 IPv4 地址进行负载均衡，尽管默认情况下支持解析 IPv4 和 IPv6 地址。

如果一个域名解析为多个 IP 地址，这些地址将保存到上游配置并进行负载均衡。在我们的示例中，服务器根据最少连接的负载均衡方法进行负载均衡。如果服务器的 IP 地址列表发生了变化，NGINX Plus 将立即开始跨新地址集进行负载均衡。

### Microsoft Exchange 服务器的负载均衡

在 NGINX Plus 7 版本及更高版本中，NGINX Plus 可以代理 Microsoft Exchange 流量到单个服务器或服务器组并对其进行负载均衡。

要设置 Microsoft Exchange 服务器的负载均衡：

1. 在一个 location 块中，使用 proxy_pass 指令将 Microsoft Exchange 服务器的上游组配置为代理：

    ```nginx
    location / {
        proxy_pass https://exchange;
        # ...
    }
    ```

2. 为了使 Microsoft Exchange 连接传递到上游服务器，在 location 块中将 proxy_http_version 指令值设置为 1.1，并将 proxy_set_header 指令设置为 Connection ""，就像对 keepalive 连接一样：

    ```nginx
    location / {
        # ...
        proxy_http_version 1.1;
        proxy_set_header   Connection "";
        # ...
    }
    ```

3. 在 http 块中，使用与 proxy_pass 指令中指定的上游组相同的 upstream 块配置 Microsoft Exchange 服务器的上游组。然后指定 ntlm 指令以允许组中的服务器接受带有 NTLM 认证的请求：

    ```nginx
    http {
        # ...
        upstream exchange {
            zone exchange 64k;
            ntlm;
            # ...
        }
    }
    ```

4. 将 Microsoft Exchange 服务器添加到上游组，并可选地指定一个负载均衡方法：

    ```nginx
    http {
        # ...
        upstream exchange {
            zone exchange 64k;
            ntlm;
            server exchange1.example.com;
            server exchange2.example.com;
            # ...
        }
    }
    ```

### 使用 NGINX Plus API 进行动态配置

使用 NGINX Plus，可以使用 NGINX Plus API 动态修改上游服务器组的配置。

可以使用配置命令查看所有服务器或特定服务器组中的服务器，修改特定服务器的参数，并添加或删除服务器。

有关更多信息和说明，请参阅《使用 NGINX Plus API 配置动态负载均衡》。


# 参考资料

https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/

* any list
{:toc}
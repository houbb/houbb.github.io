---
layout: post
title:  Nginx R31 doc-06-Accepting the PROXY Protocol 
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# 接受 PROXY 协议

本文介绍如何配置 NGINX 和 NGINX Plus 来接受 PROXY 协议，重写负载均衡器或代理收到的 IP 地址为 PROXY 协议头中接收到的 IP 地址，配置客户端 IP 地址的简单日志记录，并在 NGINX 和 TCP 上游服务器之间启用 PROXY 协议。


## 介绍

PROXY 协议使 NGINX 和 NGINX Plus 能够接收通过代理服务器和负载均衡器（如 HAproxy 和 Amazon Elastic Load Balancer [ELB]）传递的客户端连接信息。

通过 PROXY 协议，NGINX 可以从 HTTP、SSL、HTTP/2、SPDY、WebSocket 和 TCP 中了解原始 IP 地址。了解客户端的原始 IP 地址可能对于为网站设置特定语言、保持 IP 地址的拒绝列表或仅用于日志记录和统计目的等方面非常有用。

通过 PROXY 协议传递的信息包括客户端 IP 地址、代理服务器 IP 地址和两个端口号。

使用这些数据，NGINX 可以通过以下几种方式获取客户端的原始 IP 地址：

- 使用 $proxy_protocol_addr 和 $proxy_protocol_port 变量捕获原始客户端 IP 地址和端口。$remote_addr 和 $remote_port 变量捕获负载均衡器的 IP 地址和端口。

- 使用 RealIP 模块重写 $remote_addr 和 $remote_port 变量中的值，将负载均衡器的 IP 地址和端口替换为原始客户端 IP 地址和端口。$realip_remote_addr 和 $realip_remote_port 变量保留负载均衡器的地址和端口，而 $proxy_protocol_addr 和 $proxy_protocol_port 变量无论如何都保留原始客户端 IP 地址和端口。

## 先决条件

- 要接受 PROXY 协议 v2，需要 NGINX Plus R16 或更高版本，或 NGINX Open Source 1.13.11 或更高版本。

- 要接受 HTTP 的 PROXY 协议，需要 NGINX Plus R3 或更高版本，或 NGINX Open Source 1.5.12 或更高版本。

- 对于 TCP 客户端端 PROXY 协议支持，需要 NGINX Plus R7 或更高版本，或 NGINX Open Source 1.9.3 或更高版本。

- 要接受 TCP 的 PROXY 协议，需要 NGINX Plus R11 或更高版本，或 NGINX Open Source 1.11.4 或更高版本。

- HTTP 和流 TCP 的 Real‑IP 模块不包含在 NGINX Open Source 中；有关详细信息，请参阅安装 NGINX Open Source。对于 NGINX Plus，无需额外步骤。


# 配置 NGINX 接受 PROXY 协议

要配置 NGINX 接受 PROXY 协议头，请在 http {} 或 stream {} 块中的服务器块中的 listen 指令中添加 proxy_protocol 参数。

```nginx
http {
    #...
    server {
        listen 80   proxy_protocol;
        listen 443  ssl proxy_protocol;
        #...
    }
}

stream {
    #...
    server {
        listen 12345 proxy_protocol;
        #...
    }
}
```

现在您可以使用 $proxy_protocol_addr 和 $proxy_protocol_port 变量来获取客户端 IP 地址和端口，并额外配置 HTTP 和流 RealIP 模块，以将负载均衡器的 IP 地址替换为客户端的 IP 地址和端口。

## 将负载均衡器的 IP 地址更改为客户端 IP 地址

您可以使用 HTTP 和流 RealIP 模块将负载均衡器或 TCP 代理的地址替换为从 PROXY 协议中接收到的客户端 IP 地址。通过这些模块，$remote_addr 和 $remote_port 变量保留客户端的实际 IP 地址和端口，而 $realip_remote_addr 和 $realip_remote_port 变量保留负载均衡器的 IP 地址和端口。

要将 IP 地址从负载均衡器的 IP 地址更改为客户端的 IP 地址：

1. 确保您已经配置 NGINX 接受 PROXY 协议头。参见《配置 NGINX 接受 PROXY 协议》。
2. 确保您的 NGINX 安装包含 HTTP 和流 Real‑IP 模块：
   
   ```bash
   nginx -V 2>&1 | grep -- 'http_realip_module'
   nginx -V 2>&1 | grep -- 'stream_realip_module'
   ```

   如果没有，请重新编译 NGINX 并包含这些模块。有关详细信息，请参阅《安装 NGINX Open Source》。对于 NGINX Plus，无需额外步骤。

3. 在 HTTP、流或两者的 set_real_ip_from 指令中，指定 TCP 代理或负载均衡器的 IP 地址或地址的 CIDR 范围：
   
   ```nginx
   server {
       #...
       set_real_ip_from 192.168.1.0/24;
      #...
   }
   ```

4. 在 http {} 上下文中，通过将 proxy_protocol 参数指定为 real_ip_header 指令，将负载均衡器的 IP 地址更改为从 PROXY 协议头中接收到的客户端的 IP 地址：

   ```nginx
   http {
       server {
           #...
           real_ip_header proxy_protocol;
         }
   }
   ```

# 记录原始 IP 地址

当您知道客户端的原始 IP 地址时，可以配置正确的日志记录：

对于 HTTP，请配置 NGINX 使用 $proxy_protocol_addr 变量和 proxy_set_header 指令将客户端 IP 地址传递给上游服务器：

```nginx
http {
    proxy_set_header X-Real-IP       $proxy_protocol_addr;
    proxy_set_header X-Forwarded-For $proxy_protocol_addr;
}
```

在日志格式指令（HTTP 或 Stream）中添加 $proxy_protocol_addr 变量：

在 http 块中：

```nginx
http {
    #...
    log_format combined '$proxy_protocol_addr - $remote_user [$time_local] '
                        '"$request" $status $body_bytes_sent '
                        '"$http_referer" "$http_user_agent"';
}
```

在 stream 块中：

```nginx
stream {
    #...
    log_format basic '$proxy_protocol_addr - $remote_user [$time_local] '
                      '$protocol $status $bytes_sent $bytes_received '
                      '$session_time';
}
```

TCP 上游服务器的 PROXY 协议

对于 TCP 流，可以在 NGINX 和上游服务器之间的连接上启用 PROXY 协议。要启用 PROXY 协议，在 stream {} 级别的服务器块中包含 proxy_protocol 指令：

```nginx
stream {
    server {
        listen 12345;
        proxy_pass example.com:12345;
        proxy_protocol on;
    }
}
```

示例：

```nginx
http {
    log_format combined '$proxy_protocol_addr - $remote_user [$time_local] '
                        '"$request" $status $body_bytes_sent '
                        '"$http_referer" "$http_user_agent"';
    #...

    server {
        server_name localhost;

        listen 80   proxy_protocol;
        listen 443  ssl proxy_protocol;

        ssl_certificate      /etc/nginx/ssl/public.example.com.pem;
        ssl_certificate_key  /etc/nginx/ssl/public.example.com.key;

        location /app/ {
            proxy_pass       http://backend1;
            proxy_set_header Host            $host;
            proxy_set_header X-Real-IP       $proxy_protocol_addr;
            proxy_set_header X-Forwarded-For $proxy_protocol_addr;
        }
    }
}

stream {
    log_format basic '$proxy_protocol_addr - $remote_user [$time_local] '
                     '$protocol $status $bytes_sent $bytes_received '
                     '$session_time';
    #...
    server {
        listen              12345 ssl proxy_protocol;

        ssl_certificate     /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/cert.key;

        proxy_pass          backend.example.com:12345;
        proxy_protocol      on;
    }
}
```

该示例假设 NGINX 前面有一个负载均衡器来处理所有传入的 HTTPS 流量，例如 Amazon ELB。NGINX 在端口 443 上接受 HTTPS 流量（listen 443 ssl;），端口 12345 上接受 TCP 流量，并且还通过 PROXY 协议从负载均衡器传递客户端的 IP 地址（在 http {} 和 stream {} 块中的 listen 指令的 proxy_protocol 参数）。

NGINX 终止 HTTPS 流量（ssl_certificate 和 ssl_certificate_key 指令），并将解密后的数据代理到后端服务器：

- 对于 HTTP：proxy_pass http://backend1;
- 对于 TCP：proxy_pass backend.example.com:12345

它使用 proxy_set_header 指令包含客户端 IP 地址和端口。

在日志格式指令中指定的 $proxy_protocol_addr 变量也将客户端的 IP 地址传递给 HTTP 和 TCP 的日志。

此外，TCP 服务器（stream {} 块）将其自己的 PROXY 协议数据发送到其后端服务器（proxy_protocol on 指令）。

------------------------------------------------------------------------------------------------------------

# chat

## 详细介绍一下 nginx PROXY Protocol

PROXY 协议是一种开放标准，用于在传输层之上传递客户端的原始地址信息。当使用代理服务器或负载均衡器时，原始客户端的 IP 地址和端口号可能会丢失，因为代理服务器会用自己的 IP 地址和端口号来转发请求。PROXY 协议允许代理服务器在转发请求之前添加一行特殊的数据，这行数据包含了原始请求的客户端地址和端口信息。

Nginx 支持 PROXY 协议，可以使用它来传递客户端的真实 IP 地址，即使请求经过了代理或负载均衡器。这对于日志记录、访问控制、地理定位等功能非常重要，因为它们依赖于客户端的真实 IP 地址。

### PROXY 协议工作原理

PROXY 协议通过在客户端与代理服务器之间的连接上发送一个特殊的文本行来工作。这个文本行包含了原始请求的源地址信息，格式如下：

```
PROXY <protocol> <source> <destination> <local> <remote>
```

- `protocol`：表示使用的协议，如 `TCP4`、`TCP6` 等。
- `source`：原始请求的客户端 IP 地址。
- `destination`：目标服务器的 IP 地址。
- `local`：代理服务器监听的 IP 地址。
- `remote`：代理服务器接收请求的 IP 地址。

例如，一个 PROXY 协议行可能如下所示：

```
PROXY TCP4 192.168.1.1 192.168.1.2 192.168.1.2 10.10.10.10
```

### 在 Nginx 中启用 PROXY 协议

要在 Nginx 中启用 PROXY 协议，你需要在监听指令中添加 `proxy_protocol` 参数。例如：

```nginx
server {
    listen 80 proxy_protocol;
    server_name your_server_domain;

    location / {
        proxy_pass http://your_upstream;
        # 其他配置...
    }
}
```

在这个配置中，`listen 80 proxy_protocol;` 指示 Nginx 监听 80 端口并期望接收带有 PROXY 协议行的请求。

### 注意事项

- 只有当客户端（即代理服务器或负载均衡器）也支持 PROXY 协议并被配置为发送 PROXY 协议行时，启用 `proxy_protocol` 才有意义。

- 启用 PROXY 协议可能会对性能产生一定影响，因为它需要解析额外的协议行。

- 确保你的防火墙和安全规则允许 PROXY 协议行的传输，否则 Nginx 将无法正确接收客户端的原始地址信息。

通过使用 PROXY 协议，你可以确保即使在复杂的网络架构中，也能获取到客户端的真实 IP 地址，从而提高你的应用程序的透明度和安全性。



## 给一个具体的例子，可以获取真实的 ip 信息

为了获取客户端的真实 IP 地址，你需要在 Nginx 配置中启用 PROXY 协议，并确保你的代理服务器（如负载均衡器或另一个代理）被配置为在转发请求时添加 PROXY 协议行。下面是一个具体的例子，展示如何配置 Nginx 来接收 PROXY 协议行并获取真实的客户端 IP 地址。

### 1. 配置前端代理以发送 PROXY 协议

假设你有一个前端代理（如 HAProxy 或 Amazon ELB）负责接收客户端的请求并在转发到 Nginx 之前添加 PROXY 协议行。以下是 HAProxy 配置示例：

```haproxy
frontend http
    bind *:80
    mode http
    option http-proxy
    http-request set-header PROXY %[src]%[dst]:%[sport]:%[dport]

    default_backend nginx_backend

backend nginx_backend
    server nginx1 192.168.1.1:80
```

在这个配置中，`http-request set-header PROXY` 指令告诉 HAProxy 在转发请求到 Nginx 之前添加一个 PROXY 协议行。

### 2. 配置 Nginx 以接收 PROXY 协议

接下来，你需要配置 Nginx 以监听 PROXY 协议。修改 Nginx 的配置文件，通常位于 `/etc/nginx/nginx.conf`，如下所示：

```nginx
http {
    server {
        listen 80;
        server_name your_server_domain;

        # 启用 PROXY 协议
        set_real_ip_from  192.168.1.1; # 代理服务器的 IP 地址
        real_ip_header    PROXY;        # 使用 PROXY 协议行作为真实 IP 地址的来源

        location / {
            # 代理设置，将请求转发到你的应用服务器
            proxy_pass http://your_application_server;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

在这个 Nginx 配置中：

- `set_real_ip_from` 指定了被信任的代理服务器的 IP 地址，这是 PROXY 协议行将被接受的来源。
- `real_ip_header` 设置为 `PROXY`，告诉 Nginx 使用 PROXY 协议行中的地址作为客户端的真实 IP 地址。

### 3. 获取真实 IP 地址

一旦配置完成并重新加载 Nginx 配置，Nginx 将能够识别 PROXY 协议行并从中获取客户端的真实 IP 地址。你可以通过 `$remote_addr` 变量在 Nginx 日志中获取这个 IP 地址：

```nginx
log_format main '$http_x_forwarded_for - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for" "$remote_addr"';
access_log /var/log/nginx/access.log main;
```

在这个 `log_format` 中，`$remote_addr` 将记录客户端的真实 IP 地址，即使请求经过了代理服务器。

### 注意

- 确保你的前端代理（如 HAProxy、AWS ELB 等）被正确配置为发送 PROXY 协议行。
- 更新 Nginx 配置后，记得运行 `nginx -t` 来测试配置文件的语法是否正确，然后使用 `sudo systemctl reload nginx` 重新加载 Nginx 配置。
- 只有当 Nginx 配置了 `set_real_ip_from` 和 `real_ip_header` 指令时，`$remote_addr` 变量才会显示真实的客户端 IP 地址。如果没有这些指令，`$remote_addr` 将显示代理服务器的 IP 地址。


# 参考资料

https://docs.nginx.com/nginx/admin-guide/load-balancer/using-proxy-protocol/

* any list
{:toc}
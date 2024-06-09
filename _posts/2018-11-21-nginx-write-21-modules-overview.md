---
layout: post
title:  从零手写实现 nginx-21-modules 模块
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

# 前言

大家好，我是老马。

这一节我们来系统的看一下 nginx 有哪些模块，为我们后续的设计实现打下基础。

# 模块概览

Nginx 的配置文件通常由几个不同的模块组成，这些模块定义了服务器的不同方面。以下是一些主要的配置模块：

1. **main（主配置）** - 这是配置文件的核心部分，包括了全局设置和默认行为。

2. **events（事件）** - 这个模块定义了Nginx如何处理连接和事件。例如，它设置了工作进程的数量和连接的超时时间。

3. **http（HTTP模块）** - 这个模块定义了HTTP服务器的配置，包括日志格式、MIME类型、文件扩展名和文件类型映射等。

4. **mail（邮件模块）** - 如果Nginx配置为邮件代理，这个模块定义了邮件处理的配置。

5. **stream（流模块）** - 这个模块定义了TCP和UDP服务器的配置，用于处理非HTTP协议的流量。

6. **server（服务器）** - 这个模块定义了虚拟服务器的配置，包括监听的端口、服务器名称、处理请求的规则等。

7. **location（位置）** - 这个模块定义了请求的匹配规则和相应的处理指令，可以嵌套在server模块中。

8. **upstream（上游）** - 这个模块定义了后端服务器的列表，用于负载均衡和反向代理。

9. **include（包含）** - 这个指令用于包含其他配置文件，使得配置更加模块化和易于管理。

10. **log_format（日志格式）** - 定义自定义的日志格式。

11. **ssl（SSL模块）** - 如果配置了SSL，这个模块定义了SSL相关的设置，如证书和密钥文件。

12. **if（条件判断）** - 这个指令允许在配置文件中进行条件判断，根据条件来启用或禁用某些配置。

这些模块通过不同的指令和参数组合，允许管理员精细地控制Nginx服务器的行为。

配置文件通常以`nginx.conf`为文件名，并且可以在不同的目录级别上进行分割，以便于管理和维护。

# 模块

## 1. Main (全局) 模块

全局模块配置 Nginx 的全局设置，例如工作进程数量、日志路径等。

通常，这些配置位于 Nginx 配置文件的顶部。

```conf
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;
```

### 指令

Nginx Main（全局）模块配置指令及其示例：

| 指令名称                | 说明                                           | 示例                                |
|-----------------------|----------------------------------------------|-----------------------------------|
| `worker_processes`    | 指定工作进程数量。                                  | `worker_processes auto;`          |
| `error_log`           | 配置错误日志路径和日志级别。                              | `error_log /var/log/nginx/error.log warn;` |
| `pid`                 | 指定存储 Nginx 主进程 PID 的文件路径。                    | `pid /run/nginx.pid;`             |
| `worker_rlimit_nofile`| 设置工作进程可打开的最大文件描述符数量。                        | `worker_rlimit_nofile 8192;`      |
| `worker_priority`     | 设置工作进程的优先级。                                 | `worker_priority -10;`            |
| `daemon`              | 是否以守护进程方式运行 Nginx。                            | `daemon on;`                      |
| `master_process`      | 是否启用主进程模式。                                 | `master_process on;`              |
| `user`                | 设置 Nginx 进程的用户和组。                             | `user www-data;`                  |
| `worker_cpu_affinity` | 绑定工作进程到特定 CPU 核心。                           | `worker_cpu_affinity auto;`       |
| `worker_shutdown_timeout`| 设置工作进程关闭时的超时时间。                        | `worker_shutdown_timeout 10s;`    |
| `timer_resolution`    | 设置事件定时器的分辨率。                               | `timer_resolution 100ms;`         |
| `include`             | 包含其他配置文件。                                   | `include /etc/nginx/conf.d/*.conf;` |
| `load_module`         | 动态加载 Nginx 模块。                                | `load_module modules/ngx_http_geoip_module.so;` |
| `env`                 | 设置环境变量。                                     | `env PATH;`<br>`env MY_VARIABLE=value;` |

### 配置示例

以下是一个包含多个 Main 模块指令的 Nginx 配置示例：

```nginx
worker_processes auto;                             # 自动配置工作进程数量
error_log /var/log/nginx/error.log warn;           # 错误日志路径和级别
pid /run/nginx.pid;                                # PID 文件路径
worker_rlimit_nofile 8192;                         # 最大文件描述符数量
worker_priority -10;                               # 工作进程优先级
daemon on;                                         # 以守护进程方式运行
master_process on;                                 # 启用主进程模式
user www-data;                                     # 进程用户和组
worker_cpu_affinity auto;                          # 自动绑定工作进程到 CPU 核心
worker_shutdown_timeout 10s;                       # 工作进程关闭超时时间
timer_resolution 100ms;                            # 事件定时器分辨率
include /etc/nginx/conf.d/*.conf;                  # 包含其他配置文件
load_module modules/ngx_http_geoip_module.so;      # 动态加载模块
env PATH;                                          # 设置环境变量
env MY_VARIABLE=value;                             # 设置自定义环境变量
```

通过合理配置这些全局指令，可以优化 Nginx 的性能和稳定性，并确保其在各种操作系统和硬件环境下的高效运行。

## 2. Events 模块

Events 模块配置与连接处理相关的参数，例如每个工作进程允许的最大连接数。

```conf
events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}
```

Nginx 的 Events 模块用于配置处理事件的相关参数，例如每个工作进程允许的最大连接数、使用的事件模型等。以下是 Nginx Events 模块的常见配置指令及其示例：

| 指令名称                | 说明                                           | 示例                                |
|-----------------------|----------------------------------------------|-----------------------------------|
| `worker_connections`  | 每个工作进程允许的最大连接数。                          | `worker_connections 1024;`        |
| `multi_accept`        | 设置工作进程是否同时接受多个新连接。                        | `multi_accept on;`                |
| `use`                 | 指定使用的事件驱动模型。                             | `use epoll;`                      |

### 配置示例

以下是一个包含多个 Events 模块指令的 Nginx 配置示例：

```nginx
events {
    worker_connections 1024;  # 每个工作进程允许的最大连接数
    multi_accept on;          # 同时接受多个新连接
    use epoll;                # 使用 epoll 事件驱动模型（适用于 Linux）
}
```

### 指令详细说明

1. **`worker_connections`**
   - 说明：设置每个工作进程允许的最大连接数。这是一个关键参数，决定了 Nginx 的并发处理能力。
   - 示例：`worker_connections 1024;`

2. **`multi_accept`**
   - 说明：当设置为 `on` 时，每个工作进程将尝试同时接受所有的新连接。当负载较重时，这可以提高连接的接受速度。
   - 示例：`multi_accept on;`

3. **`use`**
   - 说明：指定 Nginx 使用的事件驱动模型。常见的选项包括 `select`、`poll`、`kqueue`、`epoll`、`/dev/poll`、`eventport` 等。选择适合操作系统和负载的事件模型可以显著提高性能。
   - 示例：`use epoll;`（epoll 是 Linux 上性能优异的事件驱动模型）

通过合理配置 Events 模块指令，可以优化 Nginx 的事件处理性能，提升服务器在高并发环境下的响应能力。

### events 模块可以配置多个吗？

在 Nginx 中，Events 模块本身只能配置一个。

这是因为 Events 模块主要用于配置与事件处理相关的参数，例如工作进程允许的最大连接数、事件驱动模型等。

这些配置对于整个 Nginx 实例是全局性质的，因此只需要一个 Events 模块来定义这些参数即可。

在 Nginx 的配置文件中，Events 模块通常位于 `nginx.conf` 文件的顶层，如下所示：

```nginx
events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}
```

上述配置示例中，`events` 块内的指令只能配置一次，且其中的指令影响所有工作进程和连接处理。

如果需要更多的事件处理配置，通常情况下并不会在同一个配置文件中重复定义 `events` 块，而是依赖于全局配置的一致性。

因此，答案是：在 Nginx 中，Events 模块本身只能配置一个，用于定义全局的事件处理参数。

## 3. HTTP 模块

HTTP 模块是最常用的模块，包含 HTTP 服务器和反向代理相关的配置。

```conf
http {
    include       mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;

    # Include server blocks
    include /etc/nginx/conf.d/*.conf;
}
```

### nginx http 模块可以配置多个吗？

在 Nginx 配置文件中，每个文件只能包含一个 `http` 块，用于定义 HTTP 服务器的全局配置。

这个 `http` 块包含了所有的 `server` 块，每个 `server` 块代表一个虚拟主机或者一个 HTTP 服务配置单元。

### Nginx HTTP 模块配置指令及其示例：

以下是一些常见的 Nginx HTTP 模块配置指令及其说明：

| 指令名称                     | 说明                                           |
|-----------------------------|----------------------------------------------|
| `include`                   | 包含其他配置文件。                              |
| `default_type`              | 设置默认的 MIME 类型。                           |
| `log_format`                | 定义日志格式。                                   |
| `access_log`                | 配置访问日志路径和格式。                         |
| `error_log`                 | 配置错误日志路径和级别。                         |
| `gzip`                      | 启用或禁用 Gzip 压缩。                           |
| `gzip_types`                | 配置哪些 MIME 类型的响应需要进行 Gzip 压缩。         |
| `client_max_body_size`      | 设置请求体的最大大小。                           |
| `keepalive_timeout`         | 配置 Keep-Alive 连接超时时间。                   |
| `proxy_cache_path`          | 配置反向代理的缓存路径和参数。                    |
| `proxy_set_header`          | 设置发送给后端服务器的 HTTP 头字段。              |
| `proxy_pass`                | 设置反向代理到后端服务器。                         |
| `root`                      | 设置请求的根目录。                               |
| `index`                     | 设置默认的索引文件。                             |
| `try_files`                 | 配置尝试查找文件的规则。                         |
| `error_page`                | 配置错误页面。                                  |
| `expires`                   | 设置响应的过期时间。                             |
| `add_header`                | 添加 HTTP 响应头字段。                            |
| `ssl_certificate`           | 配置 SSL 证书文件路径。                          |
| `ssl_certificate_key`       | 配置 SSL 证书私钥文件路径。                      |
| `ssl_protocols`             | 配置支持的 SSL 协议版本。                        |
| `ssl_ciphers`               | 配置支持的 SSL 加密算法。                        |
| `server_name`               | 配置虚拟主机的域名。                             |
| `listen`                    | 配置监听的端口和 IP 地址。                        |
| `resolver`                  | 配置域名解析器地址。                            |
| `include`                   | 包含其他配置文件。                               |

以下是一个示例 Nginx 配置文件，包含了上述提到的一些常见的 HTTP 模块配置指令：

```conf
# 定义全局的 MIME 类型和默认类型
http {
    include       mime.types;
    default_type  application/octet-stream;

    # 定义日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    # 配置访问日志
    access_log /var/log/nginx/access.log main;

    # 配置错误日志
    error_log /var/log/nginx/error.log warn;

    # 第一个虚拟主机配置
    server {
        listen       80;
        server_name  example.com www.example.com;

        root /var/www/example.com;
        index index.html index.htm;

        # 配置请求处理规则
        location / {
            try_files $uri $uri/ =404;
        }

        # 配置反向代理
        location /api/ {
            proxy_pass http://backend_server;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 启用 Gzip 压缩
        gzip on;
        gzip_types text/plain application/xml;
    }

    # 第二个虚拟主机配置
    server {
        listen       80;
        server_name  anotherdomain.com;

        root /var/www/anotherdomain.com;
        index index.html index.htm;

        # 配置请求处理规则
        location / {
            try_files $uri $uri/ =404;
        }

        # 配置 SSL
        ssl_certificate /etc/nginx/ssl/anotherdomain.com.crt;
        ssl_certificate_key /etc/nginx/ssl/anotherdomain.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # 添加自定义 HTTP 头字段
        add_header X-Frame-Options "SAMEORIGIN";
    }

    # 全局配置
    client_max_body_size 10M;
    keepalive_timeout 65;

    # 配置 HTTP 缓存
    proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=my_cache:10m inactive=60m;
}
```

在这个示例配置文件中：

- `http` 块包含了全局的配置，如包含其他配置文件、默认 MIME 类型、日志格式和路径等。
- 两个 `server` 块分别定义了两个虚拟主机的配置，包括监听的端口、域名、根目录、索引文件、请求处理规则（使用 `location` 块）、反向代理配置、Gzip 压缩、SSL 配置等。
- 全局配置部分包括了一些通用的配置指令，如客户端请求体大小限制 (`client_max_body_size`)、Keep-Alive 连接超时时间 (`keepalive_timeout`)，以及 HTTP 缓存配置 (`proxy_cache_path`)。

这个示例展示了如何通过组合使用不同的 Nginx HTTP 模块配置指令，来实现一个具有多个虚拟主机、反向代理、SSL 加密、HTTP 头字段添加、Gzip 压缩和缓存控制的完整的 HTTP 服务器配置。

## 4. Server 模块

Server 模块配置单个虚拟主机的参数。

它通常包含在 HTTP 模块内。

```conf
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
```

### nginx server 模块常见的指令表格

以下是一些常见的 Nginx `server` 模块配置指令及其说明：

| 指令名称                     | 说明                                           |
|-----------------------------|----------------------------------------------|
| `listen`                    | 配置监听的端口和 IP 地址。                        |
| `server_name`               | 配置虚拟主机的域名。                             |
| `root`                      | 设置请求的根目录。                               |
| `index`                     | 设置默认的索引文件。                             |
| `location`                  | 定义请求处理的位置块。                            |
| `try_files`                 | 配置尝试查找文件的规则。                         |
| `error_page`                | 配置错误页面。                                  |
| `access_log`                | 配置访问日志路径和格式。                         |
| `error_log`                 | 配置错误日志路径和级别。                         |
| `ssl_certificate`           | 配置 SSL 证书文件路径。                          |
| `ssl_certificate_key`       | 配置 SSL 证书私钥文件路径。                      |
| `ssl_protocols`             | 配置支持的 SSL 协议版本。                        |
| `ssl_ciphers`               | 配置支持的 SSL 加密算法。                        |
| `add_header`                | 添加 HTTP 响应头字段。                            |
| `proxy_pass`                | 设置反向代理到后端服务器。                         |
| `proxy_set_header`          | 设置发送给后端服务器的 HTTP 头字段。              |
| `proxy_read_timeout`        | 配置从后端服务器读取响应的超时时间。                   |
| `proxy_connect_timeout`     | 配置与后端服务器建立连接的超时时间。                   |
| `proxy_send_timeout`        | 配置向后端服务器发送请求的超时时间。                   |
| `proxy_buffering`           | 启用或禁用反向代理缓冲。                          |
| `proxy_cache`               | 启用反向代理缓存。                               |
| `proxy_cache_valid`         | 配置反向代理缓存的有效期。                        |
| `proxy_cache_key`           | 配置反向代理缓存键。                             |
| `proxy_cache_path`          | 配置反向代理缓存路径和参数。                       |
| `limit_req_zone`            | 配置请求速率限制区域。                           |
| `limit_conn_zone`           | 配置连接速率限制区域。                           |
| `gzip`                      | 启用或禁用 Gzip 压缩。                           |
| `gzip_types`                | 配置哪些 MIME 类型的响应需要进行 Gzip 压缩。         |
| `gzip_comp_level`           | 配置 Gzip 压缩级别。                             |
| `gzip_min_length`           | 配置启用 Gzip 压缩的最小响应长度。                  |
| `gzip_buffers`              | 配置 Gzip 压缩使用的缓冲区大小。                    |
| `gzip_disable`              | 配置禁用 Gzip 压缩的条件。                        |
| `expires`                   | 设置响应的过期时间。                             |
| `add_header`                | 添加 HTTP 响应头字段。                            |
| `error_page`                | 配置错误页面。                                  |

这些指令允许管理员在每个 `server` 块中配置特定虚拟主机的行为，从基本的请求处理到高级的代理、安全和性能调优配置。

通过合理配置这些指令，可以实现丰富的功能和灵活的服务器行为定制。

### nginx server 模块常见的配置例子

以下是一个简单的 Nginx `server` 模块的配置例子，展示了如何配置一个基本的静态文件服务器：

```nginx
server {
    listen 80;  # 监听端口

    server_name example.com www.example.com;  # 设置虚拟主机的域名

    root /var/www/example.com;  # 设置根目录

    index index.html index.htm;  # 设置默认的索引文件

    access_log /var/log/nginx/example.access.log;  # 配置访问日志
    error_log /var/log/nginx/example.error.log;    # 配置错误日志

    location / {
        try_files $uri $uri/ =404;  # 配置请求处理规则
    }

    location /images/ {
        # 反向代理到另一个服务器的示例
        proxy_pass http://backend_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 启用 Gzip 压缩
    gzip on;
    gzip_types text/plain application/xml;

    # 添加自定义 HTTP 响应头
    add_header X-Frame-Options "SAMEORIGIN";

    # 设置 SSL 配置示例
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

在这个例子中：

- `listen` 指令指定了 Nginx 监听的端口。
- `server_name` 指令设置了虚拟主机的域名。
- `root` 指令定义了服务器的根目录，客户端请求将在这个根目录下查找文件。
- `index` 指令设置了默认的索引文件，如果请求的路径是一个目录，则尝试显示指定的索引文件。
- `access_log` 和 `error_log` 指令配置了访问日志和错误日志的路径。
- `location /` 块定义了基本的请求处理规则，使用 `try_files` 指令尝试查找请求的文件。
- `location /images/` 块演示了如何配置反向代理，将以 `/images/` 开头的请求转发到 `http://backend_server`。
- `gzip` 指令启用了 Gzip 压缩，并配置了需要压缩的 MIME 类型。
- `add_header` 指令添加了自定义的 HTTP 响应头字段。
- `ssl_certificate` 和 `ssl_certificate_key` 指令配置了 SSL 证书和私钥的路径，启用了 HTTPS 访问。
- `ssl_protocols` 和 `ssl_ciphers` 指令配置了 SSL 支持的协议版本和加密算法。

这个配置示例展示了一个基本的 Nginx HTTP 服务器配置，包括静态文件服务、反向代理、Gzip 压缩、自定义响应头、SSL 配置等功能。

根据实际需求，可以进一步调整和扩展这些配置来满足特定的应用场景和安全要求。

## 5. Location 模块

Location 模块用于定义请求路径和处理方法。

```conf
location /images/ {
    root /data;
}

location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### nginx location 常见的指令表格

在 Nginx 的 `location` 块中，常见的配置指令用于定义请求的处理规则和行为。以下是一些常见的 Nginx `location` 块配置指令及其说明：

| 指令名称                     | 说明                                           |
|-----------------------------|----------------------------------------------|
| `alias`                     | 定义请求的路径别名。                             |
| `root`                      | 设置请求的根目录。                               |
| `try_files`                 | 配置尝试查找文件的规则。                         |
| `index`                     | 设置默认的索引文件。                             |
| `rewrite`                   | 定义重写规则。                                  |
| `return`                    | 定义返回响应码和重定向。                          |
| `error_page`                | 配置错误页面。                                  |
| `expires`                   | 设置响应的过期时间。                             |
| `limit_req`                 | 配置请求速率限制。                               |
| `limit_conn`                | 配置连接速率限制。                               |
| `proxy_pass`                | 设置反向代理到后端服务器。                         |
| `proxy_set_header`          | 设置发送给后端服务器的 HTTP 头字段。              |
| `proxy_read_timeout`        | 配置从后端服务器读取响应的超时时间。                   |
| `proxy_connect_timeout`     | 配置与后端服务器建立连接的超时时间。                   |
| `proxy_send_timeout`        | 配置向后端服务器发送请求的超时时间。                   |
| `proxy_buffering`           | 启用或禁用反向代理缓冲。                          |
| `proxy_cache`               | 启用反向代理缓存。                               |
| `proxy_cache_valid`         | 配置反向代理缓存的有效期。                        |
| `proxy_cache_key`           | 配置反向代理缓存键。                             |
| `proxy_cache_path`          | 配置反向代理缓存路径和参数。                       |
| `fastcgi_pass`              | 设置 FastCGI 后端服务器。                        |
| `fastcgi_param`             | 设置传递给 FastCGI 服务器的参数。                 |
| `uwsgi_pass`                | 设置 uWSGI 后端服务器。                          |
| `scgi_pass`                 | 设置 SCGI 后端服务器。                           |
| `grpc_pass`                 | 设置 gRPC 后端服务器。                           |
| `include`                   | 包含其他配置文件。                               |

这些指令允许管理员在 `location` 块中配置特定请求路径的处理规则，包括路径重写、缓存控制、反向代理、FastCGI、uWSGI、SCGI 等 CGI 协议支持，以及各种请求速率和连接速率的限制。配置文件中可以根据具体需求组合和使用这些指令，以实现复杂的请求路由和后端服务集成。

### nginx location 常见的配置例子

以下是一些常见的 Nginx `location` 块配置示例，展示了不同情况下如何配置具体的请求处理规则：

### 静态文件服务

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/example.com;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    location /images/ {
        alias /var/www/images/;
    }
}
```

- **说明**：
  - `/` 路径下的请求使用 `try_files` 指令尝试查找文件，如果找不到则返回 404。
  - `/images/` 路径下的请求使用 `alias` 指令将请求路径映射到服务器文件系统中的另一个位置。

### 反向代理

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://backend_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

- **说明**：
  - 所有 `/` 路径下的请求将被反向代理到名为 `backend_server` 的后端服务器。
  - 使用 `proxy_set_header` 指令设置发送给后端服务器的 HTTP 头字段。

### FastCGI 服务

```nginx
server {
    listen 80;
    server_name php.example.com;

    root /var/www/php.example.com;
    index index.php;

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

- **说明**：
  - 所有以 `.php` 结尾的请求将使用 `fastcgi_pass` 指令转发到 PHP FastCGI 进程。
  - `fastcgi_param` 指令设置传递给 FastCGI 服务器的参数，例如 `SCRIPT_FILENAME`。

### 缓存控制

```nginx
server {
    listen 80;
    server_name static.example.com;

    root /var/www/static.example.com;
    index index.html;

    location / {
        expires 1d;
    }
}
```

- **说明**：
  - 所有请求在 `/` 路径下，响应的过期时间设置为 1 天，使用 `expires` 指令。

### HTTPS 配置

```nginx
server {
    listen 443 ssl;
    server_name secure.example.com;

    ssl_certificate /etc/nginx/ssl/secure.example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/secure.example.com.key;

    location / {
        # HTTPS 配置的具体内容
    }
}
```

- **说明**：
  - 使用 `ssl_certificate` 和 `ssl_certificate_key` 指令配置 SSL 证书和私钥路径。
  - 此处 `location /` 块内可以配置与 HTTPS 相关的其他指令，如 SSL 协议版本、加密算法等。

这些示例展示了在不同场景下如何配置 Nginx 的 `location` 块，以实现静态文件服务、反向代理、FastCGI、缓存控制和 HTTPS 安全设置等功能。

根据具体需求，可以进一步调整和扩展这些配置来满足特定的应用场景和安全要求。

## 6. Upstream 模块

Upstream 模块配置负载均衡和反向代理的后端服务器组。

```conf
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
}
```

### nginx Upstream 模块指令表格

在 Nginx 中，Upstream 模块用于定义一组后端服务器，常用于负载均衡和反向代理配置。

以下是一些常见的 Nginx Upstream 模块配置指令及其说明：

| 指令名称                     | 说明                                           |
|-----------------------------|----------------------------------------------|
| `upstream`                  | 定义一个上游服务器组。                           |
| `server`                    | 定义单个上游服务器。                            |
| `weight`                    | 设置服务器的权重，用于负载均衡。                   |
| `max_fails`                 | 设置在服务器被标记为不可用前允许的最大失败次数。      |
| `fail_timeout`              | 设置在服务器被标记为不可用多长时间后尝试重新启用的时间。|
| `backup`                    | 指定服务器为备份服务器，只有在所有非备份服务器失败时才会使用。|
| `down`                      | 标记服务器为永久不可用，不会尝试与其建立连接。       |
| `keepalive`                 | 设置与上游服务器的 keepalive 连接参数。             |
| `zone`                      | 设置共享内存区域以跟踪上游服务器的状态。            |
| `hash`                      | 根据指定的键值对请求进行散列分配。                  |
| `ip_hash`                   | 根据客户端 IP 地址进行散列分配。                    |
| `least_conn`                | 选择活跃连接数最少的服务器进行请求分发。             |

这些指令允许管理员配置上游服务器组的各种参数，包括负载均衡策略、健康检查、备份服务器、连接保持等。

通过合理配置 Upstream 模块，可以实现高可用性、负载均衡和性能优化的反向代理服务。

### nginx Upstream 模块配置例子

以下是一个简单的 Nginx Upstream 模块的配置例子，演示了如何定义一组后端服务器并进行负载均衡配置：

```nginx
http {
    upstream backend_servers {
        server backend1.example.com weight=3;
        server backend2.example.com:8080 max_fails=3 fail_timeout=30s;
        server 192.168.1.100:8080 backup;
        server unix:/var/run/backend3.sock;
        keepalive 32;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

- **说明**：
  - `upstream backend_servers { ... }` 定义了一个名为 `backend_servers` 的上游服务器组。
  - `server` 指令用于定义每个后端服务器的配置：
    - `backend1.example.com` 权重为 3，表示比其他服务器被选中的概率更高。
    - `backend2.example.com:8080` 设置了最大失败次数为 3 次，每次失败后等待 30 秒后再次尝试。
    - `192.168.1.100:8080` 设为备份服务器，在所有非备份服务器失败时才会使用。
    - `unix:/var/run/backend3.sock` 使用 UNIX 域套接字连接。
  - `keepalive 32;` 设置与上游服务器的 keepalive 连接数。

在上述配置中，Nginx 将通过 `proxy_pass` 指令将所有来自 `example.com` 的请求代理到 `backend_servers` 组中的后端服务器。

通过合理配置权重、失败处理和备份服务器，可以实现高可用性和负载均衡，确保应用在各种条件下的稳定运行。

## 7. Stream 模块

Stream 模块用于配置 TCP/UDP 代理服务。

```conf
stream {
    upstream backend {
        server backend1.example.com:12345;
        server backend2.example.com:12345;
    }

    server {
        listen 12345;
        proxy_pass backend;
    }
}
```

### nginx stream 模块的指令表格

Nginx 的 Stream 模块用于处理 TCP 和 UDP 流量，例如用于代理和负载均衡非 HTTP 流量。

以下是一些常见的 Nginx Stream 模块配置指令及其说明：

| 指令名称                     | 说明                                           |
|-----------------------------|----------------------------------------------|
| `stream`                    | 定义一个 TCP 或 UDP 代理服务器。                  |
| `server`                    | 定义一个 TCP 或 UDP 服务器块。                   |
| `listen`                    | 配置监听的 IP 地址和端口。                       |
| `proxy_pass`                | 设置反向代理到后端服务器。                         |
| `proxy_timeout`             | 配置与后端服务器的超时时间。                       |
| `proxy_connect_timeout`     | 配置与后端服务器建立连接的超时时间。                   |
| `proxy_send_timeout`        | 配置向后端服务器发送数据的超时时间。                   |
| `proxy_read_timeout`        | 配置从后端服务器读取数据的超时时间。                   |
| `proxy_protocol`            | 启用或禁用代理协议支持。                          |
| `ssl_preread`               | 启用 SSL 预读取用于 TCP 和 UDP 代理。                |
| `allow`                     | 定义允许连接的 IP 地址或地址范围。                    |
| `deny`                      | 定义拒绝连接的 IP 地址或地址范围。                    |
| `limit_conn`                 | 配置并发连接数限制。                              |
| `limit_rate`                | 配置限制连接速率。                               |
| `zone`                      | 配置共享内存区域以跟踪连接状态。                    |
| `resolver`                  | 配置域名解析器地址。                            |

这些指令允许管理员配置 Nginx Stream 模块用于处理 TCP 或 UDP 流量的各种行为，包括代理、超时控制、SSL 预读取、访问控制、限速等。

通过合理配置这些指令，可以实现非 HTTP 流量的反向代理、负载均衡和安全控制。

### nginx stream 模块的常见配置例子

以下是一个简单的 Nginx Stream 模块的配置例子，演示了如何配置 TCP 和 UDP 代理服务器：

### TCP 代理

```nginx
stream {
    upstream backend_servers {
        server backend1.example.com:12345;
        server backend2.example.com:12345;
    }

    server {
        listen 12345;
        proxy_pass backend_servers;
        proxy_timeout 3s;
    }
}
```

- **说明**：
  - `stream { ... }` 定义了一个 TCP 代理服务器。
  - `upstream backend_servers { ... }` 定义了一个名为 `backend_servers` 的上游服务器组。
  - `server { ... }` 定义了一个 TCP 服务器块，监听端口 `12345`。
  - `proxy_pass backend_servers;` 使用 `proxy_pass` 指令将所有来自客户端的 TCP 请求代理到 `backend_servers` 组中的后端服务器。
  - `proxy_timeout 3s;` 配置与后端服务器的超时时间为 3 秒。

### UDP 代理

```nginx
stream {
    server {
        listen 12345 udp;
        proxy_pass backend_server;
        proxy_timeout 3s;
        proxy_responses 1;
    }
}
```

- **说明**：
  - `stream { ... }` 定义了一个 UDP 代理服务器。
  - `server { ... }` 定义了一个 UDP 服务器块，监听 UDP 端口 `12345`。
  - `proxy_pass backend_server;` 使用 `proxy_pass` 指令将所有来自客户端的 UDP 请求代理到 `backend_server`。
  - `proxy_timeout 3s;` 配置与后端服务器的超时时间为 3 秒。
  - `proxy_responses 1;` 配置 UDP 代理的最大响应次数为 1。

这些示例展示了如何配置 Nginx Stream 模块来处理 TCP 和 UDP 流量的代理功能。

通过合理配置 `upstream` 和 `server` 块，可以实现 TCP 和 UDP 请求的负载均衡、超时控制和安全性。

## 8. Mail 模块

Mail 模块用于配置邮件代理服务。

```conf
mail {
    server {
        listen 25;
        protocol smtp;
        smtp_auth login plain;
        proxy on;
    }
}
```

### nginx Mail 模块的指令表格

Nginx 的 Mail 模块用于配置邮件代理服务器。以下是一些常见的 Nginx Mail 模块配置指令及其说明：

| 指令名称                     | 说明                                           |
|-----------------------------|----------------------------------------------|
| `mail`                      | 定义一个邮件代理服务器。                          |
| `server`                    | 定义一个邮件服务器块。                           |
| `listen`                    | 配置监听的 IP 地址和端口。                       |
| `protocol`                  | 设置邮件服务器的协议，如 SMTP、SMTPS 或 POP3。   |
| `proxy_pass`                | 设置反向代理到后端邮件服务器。                    |
| `smtp_auth`                 | 配置 SMTP 认证类型。                            |
| `auth_http`                 | 配置 HTTP 认证服务的地址。                      |
| `auth_http_timeout`         | 配置与 HTTP 认证服务的超时时间。                |
| `starttls`                  | 启用 STARTTLS 支持。                            |
| `ssl_prefer_server_ciphers` | 设置为 `on` 以使用服务器端的 SSL 加密算法。      |
| `ssl_protocols`             | 配置 SSL/TLS 协议版本。                         |
| `ssl_ciphers`               | 配置 SSL 加密算法。                             |
| `ssl_certificate`           | 配置 SSL 证书路径。                             |
| `ssl_certificate_key`       | 配置 SSL 证书私钥路径。                          |

这些指令允许管理员配置 Nginx Mail 模块用于处理邮件流量的各种行为，包括 SMTP、SMTPS 和 POP3 协议的代理、认证、加密和证书配置等。

通过合理配置这些指令，可以实现邮件服务的代理、加密传输和安全性控制。

### nginx Mail 模块的常见配置例子

以下是一个简单的 Nginx Mail 模块的配置例子，演示了如何配置邮件代理服务器来处理 SMTP 流量：

```nginx
mail {
    server {
        listen 25;
        protocol smtp;

        auth_http localhost/auth-smtp;
        smtp_auth login plain cram-md5;
        starttls on;

        ssl_certificate /etc/nginx/ssl/mail.example.com.crt;
        ssl_certificate_key /etc/nginx/ssl/mail.example.com.key;

        server_name mail.example.com;

        proxy_pass_error_message on;
        proxy_pass_error_message "An unexpected error occurred. Please try again later.";

        proxy_pass 192.168.1.100:25;

        timeout 1m;

        resolver 192.168.1.1;

        resolver_timeout 5s;
    }
}
```

- **说明**：
  - `mail { ... }` 定义了一个邮件代理服务器。
  - `server { ... }` 定义了一个邮件服务器块，监听 SMTP 端口 `25`。
  - `protocol smtp;` 设置邮件服务器的协议为 SMTP。
  - `auth_http localhost/auth-smtp;` 配置 HTTP 认证服务的地址，用于认证用户。
  - `smtp_auth login plain cram-md5;` 配置支持的 SMTP 认证类型。
  - `starttls on;` 启用 STARTTLS 支持，以加密传输。
  - `ssl_certificate` 和 `ssl_certificate_key` 指定 SSL 证书和私钥的路径。
  - `server_name mail.example.com;` 设置邮件服务器的名称。
  - `proxy_pass` 指定将所有传入的 SMTP 请求代理到内部服务器 `192.168.1.100` 的 SMTP 端口 `25`。
  - `proxy_pass_error_message` 配置代理错误时返回的消息。
  - `timeout 1m;` 配置与后端服务器的超时时间为 1 分钟。
  - `resolver` 和 `resolver_timeout` 配置 DNS 解析器的地址和超时时间。

这个配置示例展示了如何使用 Nginx Mail 模块配置一个 SMTP 代理服务器，并包括了认证、加密传输、错误处理以及与后端 SMTP 服务器的连接管理等功能。

具体配置可以根据实际需求进一步调整和扩展。

## 9. Gzip 模块

Gzip 模块用于配置响应的 Gzip 压缩。

```conf
http {
    gzip on;
    gzip_types text/plain application/xml;
}
```

### nginx Gzip 模块的指令表格

以下是一些常见的 Nginx Gzip 模块配置指令及其说明：

| 指令名称                   | 说明                                           |
|---------------------------|----------------------------------------------|
| `gzip on`                 | 启用或禁用 gzip 压缩。                          |
| `gzip_comp_level`         | 设置 gzip 压缩级别（1-9），级别越高压缩率越高，但消耗 CPU 资源越多。 |
| `gzip_types`              | 指定需要进行 gzip 压缩的 MIME 类型。             |
| `gzip_min_length`         | 设置启用 gzip 压缩的最小文件大小。                 |
| `gzip_buffers`            | 设置用于压缩的缓冲区数量和大小。                   |
| `gzip_disable`            | 禁用指定条件下的 gzip 压缩。                     |
| `gzip_proxied`            | 设置哪些代理响应进行 gzip 压缩。                  |
| `gzip_vary`               | 启用或禁用 Vary 头字段，用于区分支持 gzip 的客户端。  |
| `gzip_http_version`       | 设置启用 gzip 压缩的 HTTP 版本。                   |
| `gzip_static`             | 启用或禁用对静态文件的 gzip 预压缩。               |
| `gzip_disable "MSIE [1-6]\."` | 禁用对指定浏览器版本的 gzip 压缩。             |

这些指令允许管理员在 Nginx 中配置 Gzip 压缩，以减少传输内容的大小，从而提升网站的加载速度和用户体验。

通过合理配置这些指令，可以根据具体需求定制和优化压缩设置。

### nginx Gzip 模块的常见配置例子

以下是一些常见的 Nginx Gzip 模块的配置例子，演示了如何配置 gzip 压缩以提升 Web 服务器性能和用户体验：

### 启用基本的 gzip 压缩

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json;
}
```

- **说明**：
  - `gzip on;` 启用 gzip 压缩功能。
  - `gzip_vary on;` 启用 Vary 头字段，以便客户端能够识别支持 gzip 的版本。
  - `gzip_comp_level 6;` 设置 gzip 压缩级别为 6，平衡压缩率和 CPU 消耗。
  - `gzip_min_length 1000;` 设置最小压缩文件大小为 1000 字节。
  - `gzip_types text/plain text/css application/json;` 指定需要进行 gzip 压缩的 MIME 类型。

### 预压缩静态文件

```nginx
http {
    gzip_static on;
    gzip_http_version 1.1;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_types text/plain text/css application/json;
}
```

- **说明**：
  - `gzip_static on;` 启用对静态文件的 gzip 预压缩。
  - `gzip_http_version 1.1;` 设置启用 gzip 压缩的 HTTP 版本。
  - `gzip_proxied any;` 配置哪些代理响应进行 gzip 压缩。
  - `gzip_comp_level 6;` 设置 gzip 压缩级别为 6。
  - `gzip_buffers 16 8k;` 设置用于压缩的缓冲区数量和大小。
  - `gzip_types text/plain text/css application/json;` 指定需要进行 gzip 压缩的 MIME 类型。

这些配置示例展示了如何使用 Nginx Gzip 模块来优化 Web 服务器的性能，通过压缩静态和动态内容，减少数据传输量，提升页面加载速度和用户体验。

具体的配置可以根据实际需求和服务器环境进行调整和优化。

## 10. Log 模块

Log 模块用于配置访问日志和错误日志。

```conf
http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
}
```

### nginx Log 模块的指令表格

以下是一些常见的 Nginx Log 模块配置指令及其说明：

| 指令名称                   | 说明                                           |
|---------------------------|----------------------------------------------|
| `access_log`              | 配置访问日志的路径和格式。                       |
| `error_log`               | 配置错误日志的路径和级别。                       |
| `log_format`              | 定义自定义日志格式。                            |
| `open_log_file_cache`     | 设置日志文件的缓存参数。                         |
| `log_not_found`           | 启用或禁用 404 错误日志记录。                     |
| `log_subrequest`          | 启用或禁用子请求日志记录。                        |
| `access_log off`          | 禁用访问日志记录。                              |
| `error_log off`           | 禁用错误日志记录。                              |
| `buffered`                | 设置是否启用日志缓冲。                            |
| `flush`                   | 设置日志缓冲区的刷新频率。                        |

这些指令允许管理员配置 Nginx 的日志记录行为，包括访问日志、错误日志的路径、格式和级别，以及日志缓冲和刷新策略等。

通过合理配置这些指令，可以实现对服务器行为的详细监控和分析。

### nginx Log 模块的常见配置例子

以下是一些常见的 Nginx Log 模块的配置例子，演示了如何配置访问日志和错误日志：

### 配置访问日志和错误日志

```nginx
http {
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
}
```

- **说明**：
  - `log_format main ...;` 定义了名为 `main` 的自定义日志格式，包含了常见的访问日志字段。
  - `access_log /var/log/nginx/access.log main;` 配置将访问日志记录到 `/var/log/nginx/access.log` 文件中，使用定义的 `main` 日志格式。
  - `error_log /var/log/nginx/error.log;` 配置将错误日志记录到 `/var/log/nginx/error.log` 文件中，默认使用 Nginx 的默认日志格式。

### 禁用日志记录

```nginx
server {
    listen 80;
    server_name example.com;

    access_log off;
    error_log /var/log/nginx/error.log;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
```

- **说明**：
  - `access_log off;` 在特定 `server` 块中禁用访问日志记录。
  - `error_log /var/log/nginx/error.log;` 配置错误日志记录到 `/var/log/nginx/error.log` 文件中。

### 高级日志缓冲和刷新配置

```nginx
http {
    log_format combined '$remote_addr - $remote_user [$time_local] '
                        '"$request" $status $body_bytes_sent '
                        '"$http_referer" "$http_user_agent"';

    access_log /var/log/nginx/access.log combined buffer=32k flush=5s;

    server {
        listen 80;
        server_name example.com;

        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
}
```

- **说明**：
  - `log_format combined ...;` 定义了名为 `combined` 的自定义日志格式。
  - `access_log /var/log/nginx/access.log combined buffer=32k flush=5s;` 配置将访问日志记录到 `/var/log/nginx/access.log` 文件中，使用定义的 `combined` 日志格式，并设置缓冲区大小为 32 KB，每 5 秒刷新一次日志。

这些配置示例展示了如何使用 Nginx Log 模块来配置访问日志和错误日志的路径、格式和缓冲设置。

根据实际需求，可以进一步调整和优化日志记录的配置。

## 11. Cache 模块

Cache 模块用于配置缓存设置。

```conf
http {
    proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=my_cache:10m inactive=60m;
    
    server {
        location / {
            proxy_cache my_cache;
            proxy_pass http://backend;
        }
    }
}
```

### nginx Cache 模块的指令表格

以下是一些常见的 Nginx Cache 模块配置指令及其说明：

| 指令名称                     | 说明                                           |
|-----------------------------|----------------------------------------------|
| `proxy_cache_path`          | 配置代理缓存路径和属性。                         |
| `proxy_cache`               | 启用或禁用缓存以及指定使用的缓存区域。               |
| `proxy_cache_key`           | 配置用于生成缓存键的变量。                        |
| `proxy_cache_valid`         | 设置缓存有效时间。                              |
| `proxy_cache_methods`       | 指定允许缓存的请求方法。                          |
| `proxy_cache_bypass`        | 配置条件下绕过缓存的规则。                        |
| `proxy_cache_use_stale`     | 配置是否在后端服务器不可用时使用过期缓存。            |
| `proxy_no_cache`            | 配置条件下不缓存的规则。                          |
| `proxy_cache_lock`          | 启用或禁用缓存锁机制。                            |
| `proxy_cache_lock_timeout`  | 配置缓存锁定超时时间。                           |
| `proxy_cache_background_update` | 启用或禁用后台更新缓存。                      |
| `proxy_cache_revalidate`    | 配置是否在缓存过期时重新验证内容。                 |

这些指令允许管理员配置 Nginx 缓存模块，以实现对代理服务器响应的缓存控制，提高网站性能和减少服务器负载。

通过合理配置这些指令，可以根据实际需求定制和优化缓存策略。

### nginx Cache 模块的常见配置例子

以下是几个常见的 Nginx Cache 模块的配置例子，演示了如何配置代理缓存以提升网站性能：

### 基本的代理缓存配置

```nginx
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g;
    
    server {
        listen 80;
        server_name example.com;
        
        location / {
            proxy_pass http://backend_server;
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_key $scheme$proxy_host$request_uri;
        }
    }
}
```

- **说明**：
  - `proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g;`
    - 配置了代理缓存路径 `/var/cache/nginx`，并创建了一个名为 `my_cache` 的缓存区域，大小为 10 MB，最大存储容量为 10 GB。
  - `location / { ... }`
    - 配置了一个代理服务器块，将请求转发到后端服务器 `http://backend_server`。
    - `proxy_cache my_cache;` 启用了名为 `my_cache` 的缓存区域。
    - `proxy_cache_valid 200 302 10m;` 设置 HTTP 状态码为 200 和 302 的响应缓存有效时间为 10 分钟。
    - `proxy_cache_valid 404 1m;` 设置 HTTP 状态码为 404 的响应缓存有效时间为 1 分钟。
    - `proxy_cache_key $scheme$proxy_host$request_uri;` 配置生成缓存键的规则。

### 后台更新缓存配置

```nginx
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g;
    
    server {
        listen 80;
        server_name example.com;
        
        location / {
            proxy_pass http://backend_server;
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_background_update on;
        }
    }
}
```

- **说明**：
  - `proxy_cache_background_update on;`
    - 启用后台更新缓存，当缓存内容过期时，Nginx 将继续提供旧缓存内容，同时后台异步更新新的内容。

这些配置示例展示了如何使用 Nginx Cache 模块配置代理缓存，以提升网站性能和减少对后端服务器的请求负载。

具体的配置可以根据实际需求进行进一步调整和优化。

## 12. SSL 模块

SSL 模块用于配置 HTTPS 相关的参数。

```conf
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### nginx SSL 模块的指令表格

以下是一些常见的 Nginx SSL 模块配置指令及其说明：

| 指令名称                       | 说明                                           |
|-------------------------------|----------------------------------------------|
| `ssl_certificate`             | 配置 SSL 证书的路径。                           |
| `ssl_certificate_key`         | 配置 SSL 证书的私钥路径。                       |
| `ssl_protocols`               | 配置允许使用的 SSL/TLS 协议版本。               |
| `ssl_ciphers`                 | 配置 SSL 加密算法。                             |
| `ssl_prefer_server_ciphers`   | 设置为 `on` 以使用服务器端的 SSL 加密算法。      |
| `ssl_session_cache`           | 配置 SSL 会话缓存。                             |
| `ssl_session_timeout`         | 配置 SSL 会话的超时时间。                       |
| `ssl_session_tickets`         | 启用或禁用 SSL 会话票据。                        |
| `ssl_session_ticket_key`      | 配置 SSL 会话票据密钥。                         |
| `ssl_dhparam`                 | 配置 Diffie-Hellman 参数文件的路径。            |
| `ssl_ecdh_curve`              | 配置 ECDH 曲线。                                |
| `ssl_stapling`                | 启用或禁用 OCSP Stapling。                      |
| `ssl_stapling_verify`         | 启用或禁用 OCSP Stapling 验证。                 |
| `ssl_trusted_certificate`     | 配置用于验证客户端证书的 CA 证书。               |
| `ssl_verify_client`           | 启用或禁用客户端证书验证。                      |
| `ssl_verify_depth`            | 配置客户端证书链的验证深度。                    |
| `ssl_client_certificate`      | 配置服务器信任的 CA 证书列表。                  |
| `ssl_password_file`           | 配置 SSL 密钥文件的密码。                       |
| `ssl_crl`                     | 配置用于验证客户端证书的 CRL 文件。              |

这些指令允许管理员配置 Nginx 服务器上 SSL/TLS 的相关安全设置，包括证书、加密算法、会话管理、客户端证书验证、OCSP Stapling 等。

### nginx SSL 模块的常见配置例子

以下是几个常见的 Nginx SSL 模块的配置例子，演示了如何配置 SSL/TLS 加密和安全设置：

### 基本的 SSL/TLS 配置

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        root /var/www/html;
        index index.html;
    }
}
```

- **说明**：
  - `listen 443 ssl;` 配置监听端口为 443，并启用 SSL。
  - `ssl_certificate` 和 `ssl_certificate_key` 分别配置 SSL 证书和私钥的路径。
  - `ssl_protocols TLSv1.2 TLSv1.3;` 配置允许使用的 SSL/TLS 协议版本。
  - `ssl_prefer_server_ciphers on;` 设置为使用服务器端的 SSL 加密算法。
  - `ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';` 配置 SSL 加密算法。
  - `ssl_session_cache shared:SSL:10m;` 配置 SSL 会话缓存，使用共享内存区域，大小为 10 MB。
  - `ssl_session_timeout 10m;` 配置 SSL 会话的超时时间为 10 分钟。
  - `location / { ... }` 配置一个简单的静态文件服务位置。

### 启用 OCSP Stapling

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/trusted-ca.crt;

    location / {
        root /var/www/html;
        index index.html;
    }
}
```

- **说明**：
  - `ssl_stapling on;` 启用 OCSP Stapling，使服务器能够获取到证书的状态信息。
  - `ssl_stapling_verify on;` 启用 OCSP Stapling 验证，验证 OCSP 响应的有效性。
  - `ssl_trusted_certificate` 配置用于验证证书链的 CA 证书。

这些配置示例展示了如何使用 Nginx SSL 模块配置基本的 SSL/TLS 设置和启用 OCSP Stapling，以提升服务器安全性和性能。

具体的配置可以根据实际需求进一步调整和优化。

# 小结

看的出来，nginx 的模块非常强大。

我们实现的时候，还是要分清主次，依次处理。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)



# 参考资料


* any list
{:toc}
---
layout: post
title:  Nginx R31 doc-05-Dynamic Configuration of Upstreams with the NGINX Plus API 使用 NGINX Plus API 动态配置上游服务器
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# 使用 NGINX Plus API 动态配置上游服务器

# 使用 NGINX Plus API 动态配置上游服务器

利用 NGINX Plus API，在不重新加载配置或重新启动进程的情况下，动态重新配置 NGINX Plus 上游组中的服务器。

## 概述

使用 NGINX Plus，可以在不重新加载服务器和 NGINX 配置的情况下，即时修改服务器组中上游服务器的配置。这在以下情况下非常有用：

- 自动扩展，当需要添加更多服务器时
- 维护，当需要移除服务器、指定备用服务器或临时将服务器下线时
- 快速设置，当需要更改上游服务器设置，如服务器权重、活动连接、慢启动、故障超时
- 监控，当使用一个命令获取服务器或服务器组的状态时

这些更改通过 NGINX Plus REST API 接口与 API 命令完成。

**注意：** 在 NGINX Plus R12 及之前的版本中，动态配置是通过 `upstream_conf` 处理程序执行的。该 API（以及扩展状态 API）现已弃用，取而代之的是 NGINX Plus API。

## 先决条件

在使用动态配置功能之前，请确保具备以下环境：

- NGINX Plus R13 或更高版本
- 已创建应用程序或 Web 服务器的上游组，如《HTTP 负载均衡和 TCP/UDP 负载均衡》中所述
- 上游服务器组位于共享内存区域，如《与多个工作进程共享数据》中所述

## 启用动态配置

按照《将流量代理到一组服务器》中的说明创建上游服务器组。

```nginx
http {
    # ...
    upstream appservers {
        server appserv1.example.com      weight=5;
        server appserv2.example.com:8080 fail_timeout=5s;
        server reserve1.example.com:8080 backup;
        server reserve2.example.com:8080 backup;
    }

    server {
        # 将请求代理到上游组的位置
        location / {
            proxy_pass http://appservers;
            health_check;
        }
    }
}
```

在上游块中包含 `zone` 指令。`zone` 指令配置共享内存中的一个区域，并设置区域名称和大小。服务器组的配置保存在此区域中，因此所有工作进程都使用相同的配置。

```nginx
http {
    # ...
    upstream appservers {
        zone appservers 64k;

        server appserv1.example.com      weight=5;
        server appserv2.example.com:8080 fail_timeout=5s;
        server reserve1.example.com:8080 backup;
        server reserve2.example.com:8080 backup;
    }
}
```

通过在服务器块中的专用位置块中包含 `api` 指令，将 NGINX API 启用为读写模式。

我们强烈建议限制对位置和 PATCH/POST/DELETE 方法的访问。此示例使用 `allow` 和 `deny` 指令，允许来自本地主机地址（127.0.0.1）的访问，并拒绝所有其他地址的访问。它还通过 HTTP 基本认证限制了对 PATCH/POST/DELETE 方法的访问。

```nginx
server {
    location /api {
        limit_except GET {
            auth_basic "NGINX Plus API";
            auth_basic_user_file /path/to/passwd/file;
        }
        api write=on;
        allow 127.0.0.1;
        deny  all;
    }
}
```

完整示例：

```nginx
http {
    # ...
    # 服务器组的配置
    upstream appservers {
        zone appservers 64k;

        server appserv1.example.com      weight=5;
        server appserv2.example.com:8080 fail_timeout=5s;
        server reserve1.example.com:8080 backup;
        server reserve2.example.com:8080 backup;
    }

    server {
        # 将请求代理到上游组的位置
        location / {
            proxy_pass http://appservers;
            health_check;
        }

        # 用于动态配置请求的位置
        location /api {
            limit_except GET {
                auth_basic "NGINX Plus API";
                auth_basic_user_file /path/to/passwd/file;
            }
            api write=on;
            allow 127.0.0.1;
            deny  all;
        }
    }
}
```

# 使用 API 进行动态配置

NGINX Plus REST API 支持以下 HTTP 方法：

- GET：显示有关上游组或其中单个服务器的信息
- POST：将服务器添加到上游组
- PATCH：修改特定服务器的参数
- DELETE：从上游组中删除服务器

NGINX Plus API 的端点和方法在 NGINX 模块参考中有描述。此外，API 具有内置的 Swagger 规范，可用于探索 API 并了解每个资源的功能。Swagger 文档可在 http://_NGINX-host_/swagger-ui/ 访问。

要动态更改上游组的配置，请发送带有适当 API 方法的 HTTP 请求。以下示例使用 curl 命令，但支持使用任何机制进行 HTTP 请求。所有请求体和响应都是 JSON 格式。

URI 按以下顺序指定了以下信息：

1. 处理请求的节点的主机名或 IP 地址（在以下示例中为 127.0.0.1）
2. api 指令出现的位置（api）
3. API 版本（9）
4. 上游组的名称，以其在 NGINX Plus 配置层次结构中的位置表示为斜杠分隔的路径（http/upstreams/appservers）

例如，要将新服务器添加到 appservers 上游组，请发送以下 curl 命令：

```bash
curl -X POST -d '{ \
   "server": "10.0.0.1:8089", \
   "weight": 4, \
   "max_conns": 0, \
   "max_fails": 0, \
   "fail_timeout": "10s", \
   "slow_start": "10s", \
   "backup": true, \
   "down": true \
 }' -s 'http://127.0.0.1/api/9/http/upstreams/appservers/servers'
```

要从上游组中删除服务器：

```bash
curl -X DELETE -s 'http://127.0.0.1/api/9/http/upstreams/appservers/servers/0'
```

要为组中的第一个服务器设置 down 参数（ID 为 0）：

```bash
curl -X PATCH -d '{ "down": true }' -s 'http://127.0.0.1/api/9/http/upstreams/appservers/servers/0'
```

交互式示例：

您可以以只读模式在 https://demo.nginx.com/swagger-ui/ 探索 NGINX Plus API 的 Swagger 界面。

# 配置动态配置的持久性

在《启用 API》中的基本配置中，使用 API 进行的更改仅存储在共享内存区域中。当重新加载 NGINX Plus 配置文件时，这些更改将被丢弃。

为了使更改在配置重新加载时持久化，将上游服务器列表从 upstream 块移动到一个专门用于存储服务器状态的文件中，并使用 state 指令进行定义。Linux 发行版的建议路径是 /var/lib/nginx/state/，FreeBSD 发行版的建议路径是 /var/db/nginx/state/。

```nginx
http {
    # ...
    upstream appservers {
        zone appservers 64k;
        state /var/lib/nginx/state/appservers.conf;

        # 所有服务器在状态文件中定义
        # server appserv1.example.com      weight=5;
        # server appserv2.example.com:8080 fail_timeout=5s;
        # server reserve1.example.com:8080 backup;
        # server reserve2.example.com:8080 backup;
    }
}
```

请注意，只能使用 API 接口的配置命令来修改状态文件；不要直接修改文件（例如使用文本编辑器）。



# 参考资料

https://docs.nginx.com/nginx/admin-guide/load-balancer/http-health-check/

* any list
{:toc}
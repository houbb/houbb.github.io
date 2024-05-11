---
layout: post
title:  Nginx R31 doc-02-nginx 基本功能
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

## 在运行时控制 NGINX 进程

了解处理流量的 NGINX 进程，并学会在运行时对它们进行控制。

### 主进程和工作进程

NGINX 有一个主进程和一个或多个工作进程。如果启用了缓存，缓存加载器和缓存管理器进程也会在启动时运行。

主进程的主要目的是读取和评估配置文件，并维护工作进程。

工作进程执行请求的实际处理。NGINX 依赖于操作系统相关的机制来有效地将请求分配给工作进程。

工作进程的数量由 nginx.conf 配置文件中的 worker_processes 指令定义，并且可以设置为固定数量，也可以配置为根据可用的 CPU 核心数量自动调整。

### 控制 NGINX

要重新加载配置，可以停止或重新启动 NGINX，或向主进程发送信号。

可以通过运行带有 -s 参数的 nginx 命令（调用 NGINX 可执行文件）来发送信号。

### 使用 NGINX 控制信号

使用 `nginx -s <SIGNAL>` 命令，其中 `<SIGNAL>` 可以是以下之一：

- `quit` – 优雅地关闭（SIGQUIT 信号）
- `reload` – 重新加载配置文件（SIGHUP 信号）
- `reopen` – 重新打开日志文件（SIGUSR1 信号）
- `stop` – 立即关闭（或快速关闭，SIGTERM 信号）

也可以使用 kill 实用程序直接向主进程发送信号。主进程的进程 ID 默认写入到 nginx.pid 文件中，该文件位于 /usr/local/nginx/logs 或 /var/run 目录中。

要了解更多关于高级信号的信息（例如执行实时二进制升级），请参阅 nginx.org 上的《控制 NGINX》。



### 创建 NGINX Plus 和 NGINX 配置文件

了解 NGINX 或 NGINX Plus 配置文件中的基本元素，包括指令和上下文。

NGINX 和 NGINX Plus 与其他服务类似，它们使用以特定格式编写的基于文本的配置文件。

默认情况下，该文件名为 nginx.conf，对于 NGINX Plus 放置在 /etc/nginx 目录下。

（对于 NGINX Open Source，文件位置取决于用于安装 NGINX 的软件包系统和操作系统。

通常位于 /usr/local/nginx/conf、/etc/nginx 或 /usr/local/etc/nginx 其中之一。）

#### 指令

配置文件由指令及其参数组成。简单（单行）指令以分号结尾。

其他指令充当“容器”，将相关指令分组在一起，用大括号（{}）括起来；这些通常被称为块。以下是一些简单指令的示例。

```conf
user             nobody;
error_log        logs/error.log notice;
worker_processes 1;
```

### 特定功能配置文件

为了更容易维护配置，我们建议将其拆分为一组特定功能的文件，存储在 /etc/nginx/conf.d 目录中，并在主 nginx.conf 文件中使用 include 指令来引用特定功能文件的内容。

```nginx
include conf.d/http;
include conf.d/stream;
include conf.d/exchange-enhanced;
```

#### 上下文

几个顶级指令，称为上下文，将适用于不同流量类型的指令分组在一起：

- `events` – 通用连接处理
- `http` – HTTP 流量
- `mail` – 邮件流量
- `stream` – TCP 和 UDP 流量

放置在这些上下文之外的指令被认为在主上下文中。

#### 虚拟服务器

在每个流量处理上下文中，您可以包含一个或多个 server 块来定义控制请求处理的虚拟服务器。您可以在 server 上下文中包含的指令取决于流量类型。

对于 HTTP 流量（http 上下文），每个 server 指令控制特定域名或 IP 地址上资源的请求处理。在 server 上下文中的一个或多个 location 上下文定义了如何处理特定的 URI 集。

对于邮件和 TCP/UDP 流量（mail 和 stream 上下文），每个 server 指令控制到达特定 TCP 端口或 UNIX 套接字的流量的处理。

#### 具有多个上下文的示例配置文件

以下配置说明了上下文的使用。

```conf
user nobody; # a directive in the 'main' context

events {
    # configuration of connection processing
}

http {
    # Configuration specific to HTTP and affecting all virtual servers

    server {
        # configuration of HTTP virtual server 1
        location /one {
            # configuration for processing URIs starting with '/one'
        }
        location /two {
            # configuration for processing URIs starting with '/two'
        }
    }

    server {
        # configuration of HTTP virtual server 2
    }
}

stream {
    # Configuration specific to TCP/UDP and affecting all virtual servers
    server {
        # configuration of TCP virtual server 1
    }
}
```

### 继承 Inheritance

通常情况下，子上下文（包含在另一个上下文中的上下文，即其父上下文）会继承在父级水平包含的指令的设置。一些指令可以出现在多个上下文中，在这种情况下，您可以通过在子上下文中包含该指令来覆盖从父级继承的设置。例如，请参阅 proxy_set_header 指令。

### 重新加载配置 Reloading Configuration

要使配置文件的更改生效，必须重新加载。

您可以重新启动 nginx 进程，也可以发送重新加载信号以升级配置，而不中断当前请求的处理。有关详细信息，请参阅在运行时控制 NGINX 进程。

使用 NGINX Plus，您可以在不重新加载配置的情况下动态重新配置对上游组中服务器的负载平衡。

您还可以使用 NGINX Plus API 和键值存储来动态控制访问，例如基于客户端 IP 地址。

# 参考资料

https://docs.nginx.com/nginx/admin-guide/basic-functionality/runtime-control/

* any list
{:toc}
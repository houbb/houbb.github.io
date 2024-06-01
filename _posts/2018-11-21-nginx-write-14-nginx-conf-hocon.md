---
layout: post
title:  从零手写实现 nginx-13-nginx.conf 是 HOCON 的格式吗？
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

# chat

## nginx.conf 是 hocon 格式的吗？

Nginx 的配置文件不是 HOCON 格式的。Nginx 使用自己的配置格式，通常称为 Nginx 配置语法（Nginx configuration syntax）。

这种格式相对简单且专门为 Nginx 设计。

它使用块（block）和指令（directive）的组合来定义服务器的行为和特性。

以下是一个简单的 Nginx 配置文件示例：

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;

        location / {
            root   html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

在这个示例中，`worker_processes`、`events`、`http` 和 `server` 等都是块指令，而 `listen`、`server_name`、`location` 等是普通指令。

相比之下，HOCON（Human-Optimized Config Object Notation）是一种用于配置文件的格式，主要用于配置基于 JVM 的应用程序，如 Akka、Play Framework 等。

HOCON 具有更复杂和灵活的语法，支持嵌套结构、对象、数组等。

下面是一个 HOCON 配置示例：

```hocon
application {
  name = "MyApp"
  version = "1.0.0"
  http {
    host = "localhost"
    port = 8080
  }
  database {
    url = "jdbc:mysql://localhost:3306/mydb"
    user = "dbuser"
    password = "dbpassword"
  }
}
```

可以看到，HOCON 的语法和 Nginx 的配置语法有很大的不同。

因此，Nginx 的配置文件并不是 HOCON 格式的，它有自己专门的配置格式。

## 可以把你给的 nginx 配置例子，改成 hocon 格式的吗

将 Nginx 配置文件转换为 HOCON 格式涉及到将 Nginx 的指令和块转换为 HOCON 支持的键值对和嵌套结构。以下是如何将上面示例的 Nginx 配置文件转换为类似 HOCON 的格式，但请注意，这只是一个结构上的转换，实际上 Nginx 并不支持 HOCON 格式的配置文件。

```hocon
nginx {
  worker_processes = 1

  events {
    worker_connections = 1024
  }

  http {
    include = "mime.types"
    default_type = "application/octet-stream"
    sendfile = "on"
    keepalive_timeout = 65

    server {
      listen = 80
      server_name = "localhost"

      location_root {
        root = "html"
        index = ["index.html", "index.htm"]
      }

      error_page {
        code = [500, 502, 503, 504]
        page = "/50x.html"
        location {
          root = "html"
        }
      }
    }
  }
}
```

在这个示例中：

1. 使用嵌套结构来表示 Nginx 配置中的块，例如 `events` 和 `http`。
2. 将指令转换为键值对，例如 `worker_processes = 1`。
3. 将数组值表示为 HOCON 数组，例如 `index = ["index.html", "index.htm"]`。
4. 为了示例的完整性，`error_page` 里面的 `code` 和 `page` 分开写，表示多个错误代码使用相同的错误页面。

请记住，这只是一个理论上的转换，实际使用中，Nginx 不支持 HOCON 格式的配置文件，因此这个 HOCON 配置文件不能直接用于配置 Nginx 服务器。

这个示例仅用于展示如何将配置内容结构化为 HOCON 格式。

## nginx 中 http  模块可以有多个吗

在 Nginx 配置文件中，`http` 模块是一个上下文（context），它用于定义 HTTP 服务器的配置。根据 Nginx 的配置规范，一个配置文件中只能有一个 `http` 上下文。因此，不能有多个 `http` 模块。不过，可以在单个 `http` 上下文中定义多个 `server` 块，以配置多个虚拟主机。

下面是一个示例，展示了如何在一个 `http` 上下文中定义多个 `server` 块：

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  example.com;

        location / {
            root   /var/www/example.com;
            index  index.html index.htm;
        }
    }

    server {
        listen       80;
        server_name  another-example.com;

        location / {
            root   /var/www/another-example.com;
            index  index.html index.htm;
        }
    }
}
```

在这个示例中：

- 有一个 `http` 上下文。
- 在 `http` 上下文中定义了两个 `server` 块，每个块配置了一个不同的虚拟主机。

这样，可以在同一个 Nginx 实例上托管多个网站，每个网站都有自己的服务器块配置。虽然只有一个 `http` 上下文，但可以通过配置多个 `server` 来支持多个站点和配置。

## 不同的 server  模块，listen 的端口必须相同吗？

在 Nginx 中，不同的 `server` 块可以监听不同的端口。每个 `server` 块的 `listen` 指令可以配置不同的端口号，这样可以在同一个 Nginx 实例上通过不同的端口来托管不同的服务。

下面是一个示例，展示了如何配置多个 `server` 块，每个块监听不同的端口：

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  example.com;

        location / {
            root   /var/www/example.com;
            index  index.html index.htm;
        }
    }

    server {
        listen       8080;
        server_name  another-example.com;

        location / {
            root   /var/www/another-example.com;
            index  index.html index.htm;
        }
    }

    server {
        listen       443 ssl;
        server_name  secure-example.com;

        ssl_certificate     /etc/nginx/ssl/secure-example.com.crt;
        ssl_certificate_key /etc/nginx/ssl/secure-example.com.key;

        location / {
            root   /var/www/secure-example.com;
            index  index.html index.htm;
        }
    }
}
```

在这个示例中：

- 第一个 `server` 块监听端口 `80`，配置了 `example.com`。
- 第二个 `server` 块监听端口 `8080`，配置了 `another-example.com`。
- 第三个 `server` 块监听端口 `443`（HTTPS），配置了 `secure-example.com`，并且包含了 SSL 证书配置。

这种配置允许 Nginx 在同一个实例上同时处理多个不同端口的请求。

## 为什么 nginx 允许不同的 server 监听相同的端口？

Nginx 允许不同的 `server` 块监听相同的端口是为了支持虚拟主机（Virtual Hosting）的概念。这种配置方式允许在同一台服务器上托管多个网站，并通过域名区分不同的站点，即使这些站点监听的是相同的端口。虚拟主机有两种主要类型：基于名称的虚拟主机和基于 IP 的虚拟主机。Nginx 通常使用基于名称的虚拟主机。

### 基于名称的虚拟主机

在基于名称的虚拟主机中，Nginx 使用 `server_name` 指令来区分不同的 `server` 块。当一个请求到达时，Nginx 会检查请求的主机头（Host header），并根据该头部信息将请求路由到正确的 `server` 块。

以下是一个示例，展示了两个 `server` 块监听相同的端口（80），但使用不同的域名：

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  example.com;

        location / {
            root   /var/www/example.com;
            index  index.html index.htm;
        }
    }

    server {
        listen       80;
        server_name  another-example.com;

        location / {
            root   /var/www/another-example.com;
            index  index.html index.htm;
        }
    }
}
```

在这个配置中：

- 两个 `server` 块都监听端口 `80`。
- 第一个 `server` 块处理 `example.com` 的请求。
- 第二个 `server` 块处理 `another-example.com` 的请求。

当请求到达时，Nginx 会根据请求的主机头部（Host header）来选择合适的 `server` 块进行处理。

### 基于 IP 的虚拟主机

虽然不如基于名称的虚拟主机常见，但 Nginx 也支持基于 IP 的虚拟主机。在这种配置中，不同的 `server` 块监听不同的 IP 地址，但可以使用相同的端口。

### 默认服务器

Nginx 还支持默认服务器（default server）。如果没有任何一个 `server_name` 匹配请求中的主机头部，Nginx 会将请求发送到默认服务器。可以通过在 `listen` 指令中使用 `default_server` 参数来指定默认服务器：

```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        root /var/www/default;
        index index.html index.htm;
    }
}
```

### 总结

允许不同的 `server` 块监听相同的端口，使得 Nginx 能够高效地支持虚拟主机。

这种灵活性使得可以在同一个服务器实例上托管多个网站，只需要根据域名来区分不同的站点。

Nginx 根据请求中的 `Host` 头部来选择合适的 `server` 块进行处理。`Host` 头部在 HTTP 请求中指定了目标服务器的域名和可选的端口号。浏览器或其他客户端在发送 HTTP 请求时，会在请求头中包含 `Host` 头部，以表明请求的目标。

### 示例

以下是一个 HTTP 请求的示例，其中包含了 `Host` 头部：

```
GET / HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
```

在这个请求中，`Host: example.com` 表明客户端想要访问 `example.com` 站点。

### Nginx 配置

Nginx 的 `server_name` 指令用于匹配 `Host` 头部中的域名。例如：

```nginx
http {
    server {
        listen 80;
        server_name example.com;

        location / {
            root /var/www/example.com;
            index index.html index.htm;
        }
    }

    server {
        listen 80;
        server_name another-example.com;

        location / {
            root /var/www/another-example.com;
            index index.html index.htm;
        }
    }
}
```

在这个配置中：

- 当 `Host` 头部为 `example.com` 时，Nginx 会将请求路由到第一个 `server` 块。
- 当 `Host` 头部为 `another-example.com` 时，Nginx 会将请求路由到第二个 `server` 块。

### 默认服务器

如果请求的 `Host` 头部没有匹配任何 `server_name`，Nginx 会将请求路由到默认服务器（default server）。默认服务器可以通过在 `listen` 指令中使用 `default_server` 参数来指定：

```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        root /var/www/default;
        index index.html index.htm;
    }
}
```

在这个示例中，如果没有其他 `server_name` 匹配，Nginx 会将请求发送到这个默认服务器。

### 总结

Nginx 根据 HTTP 请求中的 `Host` 头部来选择合适的 `server` 块。`Host` 头部包含了目标服务器的域名，Nginx 使用它来匹配配置中的 `server_name` 指令，以确定处理请求的正确服务器块。

# 参考资料

* any list
{:toc}
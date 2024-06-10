---
layout: post
title:  从零手写实现 nginx-23-directive IF 条件判断指令
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

这一节我们将配置的加载，拆分为不同的模块加载处理，便于后续拓展。



# 小结

模块的加载拆分为不同的模块加载后，我们暂时实现了其中的部分。

后续有时间再实现更多的配置信息。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 参考资料

# chat

## nginx 除了 set、proxy_set_header 还有哪些指令？ 

Nginx 是一个高性能的HTTP和反向代理服务器，也是一个IMAP/POP3/SMTP代理服务器。

除了 `set` 和 `proxy_set_header`，Nginx 还有许多其他指令，用于配置其不同的功能和模块。

以下是一些常用的指令类别和一些示例：

### 基本配置指令

- **server**: 配置一个虚拟主机。
- **listen**: 指定服务器监听的端口和IP地址。
- **server_name**: 指定服务器名称（域名）。
- **root**: 设置请求的根目录。
- **index**: 指定默认的索引文件。

### 日志配置指令

- **access_log**: 设置访问日志的路径和日志格式。
- **error_log**: 设置错误日志的路径和日志级别。

### 代理配置指令

- **proxy_pass**: 设置代理请求的后端服务器地址。
- **proxy_redirect**: 设置代理重定向。
- **proxy_set_body**: 修改发送到后端服务器的请求体。
- **proxy_connect_timeout**: 设置连接到后端服务器的超时时间。
- **proxy_read_timeout**: 设置从后端服务器读取响应的超时时间。
- **proxy_send_timeout**: 设置发送请求到后端服务器的超时时间。

### 缓存配置指令

- **proxy_cache**: 启用代理缓存。
- **proxy_cache_path**: 设置缓存存储路径和其他缓存相关参数。
- **proxy_cache_valid**: 设置缓存内容的有效时间。

### 负载均衡配置指令

- **upstream**: 定义后端服务器组，用于负载均衡。
- **ip_hash**: 使用客户端IP地址进行会话保持。
- **least_conn**: 将请求分发到连接最少的服务器。

### 重写和重定向指令

- **rewrite**: 使用正则表达式重写URL。
- **return**: 返回指定的状态码和可选的响应体。
- **try_files**: 尝试按顺序处理文件，如果文件不存在则执行指定的动作。

### 安全相关指令

- **allow**: 允许特定IP地址访问。
- **deny**: 禁止特定IP地址访问。
- **auth_basic**: 配置基础HTTP身份验证。
- **auth_basic_user_file**: 指定用于身份验证的用户名和密码文件。

### HTTP配置指令

- **client_max_body_size**: 设置客户端请求体的最大大小。
- **sendfile**: 启用或禁用 `sendfile` 功能，用于高效传输文件。
- **tcp_nopush**: 控制TCP_NOPUSH选项，用于优化发送大文件。
- **keepalive_timeout**: 设置保持连接的超时时间。

### FastCGI配置指令

- **fastcgi_pass**: 设置FastCGI服务器地址。
- **fastcgi_param**: 设置FastCGI参数。
- **fastcgi_cache**: 启用FastCGI缓存。

### 示例配置片段

以下是一个简单的Nginx配置示例：

```conf
http {
    server {
        listen 80;
        server_name example.com;
        root /var/www/html;

        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        location / {
            try_files $uri $uri/ =404;
        }

        location /proxy {
            proxy_pass http://backend_server;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location ~ \.php$ {
            fastcgi_pass 127.0.0.1:9000;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }
}
```

这个示例配置了一个基本的Web服务器，具有静态文件服务、代理和FastCGI处理能力。通过了解和使用这些指令，您可以根据需要定制Nginx的行为。

## cookie 的处理, nginx 的指令有哪些

在 Nginx 中处理 Cookie 的指令主要用于操纵和传递 HTTP Cookie。

以下是一些常用的 Cookie 相关指令及其用途：

### `proxy_cookie_domain`

- **作用**：更改从后端服务器返回的 Set-Cookie 头中的域名。
- **语法**：`proxy_cookie_domain <original_domain> <replacement_domain>;`
- **示例**：
  ```nginx
  proxy_cookie_domain www.old-domain.com www.new-domain.com;
  ```

### `proxy_cookie_path`

- **作用**：更改从后端服务器返回的 Set-Cookie 头中的路径。
- **语法**：`proxy_cookie_path <original_path> <replacement_path>;`
- **示例**：
  ```nginx
  proxy_cookie_path /one/ /;
  ```

### `proxy_pass`

- **作用**：传递请求到后端服务器。虽然 `proxy_pass` 本身不是专门用于 Cookie 的指令，但它会携带请求中的 Cookie，并接收后端服务器返回的 Set-Cookie 头。
- **语法**：`proxy_pass <URL>;`
- **示例**：
  ```nginx
  location / {
      proxy_pass http://backend_server;
  }
  ```

### `add_header`

- **作用**：添加自定义头部字段，包括 Set-Cookie 头部字段。
- **语法**：`add_header <name> <value>;`
- **示例**：
  ```nginx
  add_header Set-Cookie "mycookie=myvalue; Path=/; HttpOnly";
  ```

### `set_cookie_flag`

- **作用**：为 Set-Cookie 头部字段添加安全标志 (Secure, HttpOnly, SameSite)。
- **语法**：`set_cookie_flag <name> <flag>;`
- **示例**：
  ```nginx
  set_cookie_flag mycookie HttpOnly;
  set_cookie_flag mycookie Secure;
  ```

### `expires`

- **作用**：设置客户端缓存资源的过期时间，也可以用于设置 Cookie 的过期时间。
- **语法**：`expires <time>;`
- **示例**：
  ```nginx
  location / {
      expires 1h;
  }
  ```

### 示例配置片段

以下是一个处理 Cookie 的 Nginx 配置示例：

```conf
http {
    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend_server;

            # 修改 Set-Cookie 域名
            proxy_cookie_domain backend_server.com example.com;

            # 修改 Set-Cookie 路径
            proxy_cookie_path /app /;

            # 添加自定义 Set-Cookie 头部字段
            add_header Set-Cookie "mycookie=myvalue; Path=/; HttpOnly; Secure";

            # 设置 Cookie 标志
            set_cookie_flag mycookie HttpOnly;
            set_cookie_flag mycookie Secure;
        }
    }
}
```

这个示例展示了如何使用 Nginx 指令来修改、添加和设置 Cookie。

通过这些指令，您可以灵活地处理 Cookie 以满足不同的需求。

## nginx 重写和重定向指令 有哪些？

Nginx 的重写和重定向指令主要用于修改请求的 URL 或者将请求重定向到另一个 URL。

这些指令可以在 `server` 或 `location` 块中使用。以下是一些常用的重写和重定向指令：

### `rewrite`

- **作用**：根据正则表达式重写请求的 URL。
- **语法**：`rewrite regex replacement [flag];`
- **示例**：
  ```nginx
  rewrite ^/oldpath/(.*)$ /newpath/$1 permanent;
  ```
  这个示例将以 `/oldpath/` 开头的请求永久重定向到 `/newpath/`。

- **标志**：
  - **last**：停止重写并将请求传递给下一个阶段。
  - **break**：停止重写并处理当前请求。
  - **redirect**：返回临时重定向（302）。
  - **permanent**：返回永久重定向（301）。

### `return`

- **作用**：返回指定的状态码和可选的重定向 URL 或文本响应。
- **语法**：`return code [text|URL];`
- **示例**：
  ```nginx
  return 301 http://www.newsite.com$request_uri;
  ```
  这个示例将请求永久重定向到 `http://www.newsite.com`，并保留原始的请求 URI。

### `try_files`

- **作用**：尝试按顺序访问文件，如果都不存在则执行指定的动作（通常是重定向或返回错误）。
- **语法**：`try_files file1 [file2 ...] uri;`
- **示例**：
  ```nginx
  try_files $uri $uri/ /index.html;
  ```
  这个示例尝试访问 `$uri` 和 `$uri/`，如果都不存在则返回 `index.html`。

### `error_page`

- **作用**：指定自定义错误页，并可选择性地重定向到新的 URI。
- **语法**：`error_page code ... [=[response]] uri;`
- **示例**：
  ```nginx
  error_page 404 /custom_404.html;
  location = /custom_404.html {
      internal;
  }
  ```

### 示例配置片段

以下是一个综合使用这些指令的 Nginx 配置示例：

```conf
http {
    server {
        listen 80;
        server_name example.com;

        # 重写旧路径到新路径，并永久重定向
        location /oldpath/ {
            rewrite ^/oldpath/(.*)$ /newpath/$1 permanent;
        }

        # 简单的重定向
        location /redirect-me {
            return 301 http://www.newsite.com$request_uri;
        }

        # 尝试访问文件，失败则返回index.html
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 自定义错误页面
        error_page 404 /custom_404.html;
        location = /custom_404.html {
            internal;
        }
    }
}
```

### 重写模块（`ngx_http_rewrite_module`）

- **if**：条件语句，可用于在特定条件下执行重写。
  ```nginx
  if ($http_user_agent ~* "MSIE [1-6]\.") {
      return 403;
  }
  ```

使用这些指令，您可以灵活地控制 Nginx 的 URL 重写和重定向行为，以满足不同的需求。




* any list
{:toc}
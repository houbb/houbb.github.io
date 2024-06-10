---
layout: post
title:  从零手写实现 nginx-23-nginx 对于 cookie 的操作
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


## 详细介绍一下 nginx 的 proxy_set_header 指令，并给出配置操作 cookie 的例子


### `proxy_set_header` 指令

`proxy_set_header` 指令用于在将请求转发给上游服务器（后端服务器）之前，设置或修改请求头。

它通常用于在反向代理设置中修改或添加头部字段，以确保后端服务器能够正确处理请求。

#### 语法

```nginx
proxy_set_header <header_name> <value>;
```

- **header_name**: 要设置或修改的头部字段名称。
- **value**: 头部字段的值。可以是静态值，也可以是 Nginx 变量。

#### 上下文

可以在 `http`, `server`, 或 `location` 块中使用。

### 常见使用场景

1. **传递客户端 IP**：后端服务器通常需要了解客户端的真实 IP 地址。
2. **传递主机名**：确保后端服务器能够知道客户端请求的主机名。
3. **传递用户代理**：有时需要传递客户端的用户代理字符串。
4. **处理 Cookies**：可以用于在请求头中添加或修改 `Cookie` 字段。

### 常用示例

#### 传递客户端 IP 地址

后端服务器需要知道客户端的真实 IP 地址，而不是代理服务器的 IP。

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

- **X-Real-IP**: 设置为客户端的真实 IP 地址。
- **X-Forwarded-For**: 包含客户端 IP 和所有经过的代理 IP。

#### 传递主机名

确保后端服务器知道客户端请求的主机名。

```nginx
proxy_set_header Host $host;
```

#### 传递用户代理

将客户端的用户代理字符串传递给后端服务器。

```conf
proxy_set_header User-Agent $http_user_agent;
```

### 配置操作 Cookie 的示例

假设您需要在将请求转发给后端服务器时添加或修改 `Cookie` 头。

#### 示例 1：添加自定义 Cookie

在将请求转发给后端服务器时添加一个自定义 Cookie。

```conf
http {
    upstream backend {
        server backend.internal;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;

            # 添加自定义 Cookie
            proxy_set_header Cookie "custom_cookie=my_value; $http_cookie";
        }
    }
}
```

在这个示例中，`proxy_set_header` 指令用于将一个名为 `custom_cookie` 的自定义 Cookie 添加到现有的 `Cookie` 头中。

`$http_cookie` 变量包含了客户端发送的所有 Cookie。

#### 示例 2：修改现有的 Cookie

假设您需要修改现有的 `session_id` Cookie 的值。

```conf
http {
    upstream backend {
        server backend.internal;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;

            # 修改 session_id Cookie 的值
            proxy_set_header Cookie "session_id=new_value; $http_cookie";
        }
    }
}
```

在这个示例中，`proxy_set_header` 指令用于将 `session_id` Cookie 的值修改为 `new_value`，并保留客户端发送的其他 Cookie。

#### 示例 3：条件性地添加或修改 Cookie

假设您需要根据某个条件来添加或修改 Cookie，可以使用 `if` 指令。

```conf
http {
    upstream backend {
        server backend.internal;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;

            # 默认情况，传递现有的 Cookie
            proxy_set_header Cookie $http_cookie;

            # 如果请求参数中包含 user=admin，则添加 admin_cookie
            if ($arg_user = "admin") {
                proxy_set_header Cookie "admin_cookie=admin_value; $http_cookie";
            }
        }
    }
}
```

在这个示例中，如果 URL 参数中包含 `user=admin`，则会添加一个名为 `admin_cookie` 的自定义 Cookie。

### 完整示例

综合以上内容，以下是一个完整的 Nginx 配置示例，展示了如何使用 `proxy_set_header` 指令传递各种头部字段，并根据条件修改 Cookie。

```conf
http {
    upstream backend {
        server backend.internal;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;

            # 传递客户端 IP 地址
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

            # 传递主机名
            proxy_set_header Host $host;

            # 传递用户代理
            proxy_set_header User-Agent $http_user_agent;

            # 默认情况，传递现有的 Cookie
            proxy_set_header Cookie $http_cookie;

            # 如果请求参数中包含 user=admin，则添加 admin_cookie
            if ($arg_user = "admin") {
                proxy_set_header Cookie "admin_cookie=admin_value; $http_cookie";
            }
        }
    }
}
```

通过合理使用 `proxy_set_header` 指令，您可以确保在反向代理设置中正确传递和处理各种 HTTP 头部字段，提高后端服务器的响应能力和准确性。

## 详细介绍一下 nginx 的 proxy_cookie_domain 指令，并给出配置操作 cookie 的例子

### `proxy_cookie_domain` 指令

`proxy_cookie_domain` 指令用于修改从上游服务器返回的 `Set-Cookie` 头中的域属性。

这个指令通常用于反向代理设置，当您需要将上游服务器的域名更改为客户端能够访问的域名时非常有用。

#### 语法

```nginx
proxy_cookie_domain <original_domain> <replacement_domain>;
```

- **original_domain**: 上游服务器返回的 `Set-Cookie` 头中的域名。
- **replacement_domain**: 要替换成的域名。

#### 默认值

无默认值。必须显式配置。

#### 上下文

可以在 `http`, `server`, 或 `location` 块中使用。

### 使用场景

假设您有一个反向代理设置，后端服务器的域名为 `backend.internal`，但是客户端通过 `example.com` 访问您的服务器。后端服务器在 `Set-Cookie` 头中返回的域名为 `backend.internal`，而客户端需要的是 `example.com`。此时，您可以使用 `proxy_cookie_domain` 指令进行替换。

### 示例配置

#### 基本配置

假设您的后端服务器是 `backend.internal`，且客户端通过 `example.com` 访问。

1. 在 `http` 块中配置反向代理：

```nginx
http {
    upstream backend {
        server backend.internal;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;
            
            # 修改 Set-Cookie 头中的域名
            proxy_cookie_domain backend.internal example.com;
        }
    }
}
```

2. 假设后端服务器返回的 `Set-Cookie` 头如下：

```http
Set-Cookie: session_id=abc123; Domain=backend.internal; Path=/; HttpOnly
```

3. 使用 `proxy_cookie_domain` 后，Nginx 会将其修改为：

```http
Set-Cookie: session_id=abc123; Domain=example.com; Path=/; HttpOnly
```

### 更复杂的示例

假设您有一个多域名的应用程序，客户端可以通过 `example.com` 和 `example.org` 访问您的服务，而后端服务器的域名是 `backend.internal`。

1. 在 `http` 块中配置反向代理，并处理不同域名的替换：

```nginx
http {
    upstream backend {
        server backend.internal;
    }

    server {
        listen 80;
        server_name example.com example.org;

        location / {
            proxy_pass http://backend;

            # 修改 Set-Cookie 头中的域名
            proxy_cookie_domain backend.internal example.com;
            proxy_cookie_domain backend.internal example.org;
        }
    }
}
```

2. 假设后端服务器返回的 `Set-Cookie` 头如下：

```http
Set-Cookie: session_id=abc123; Domain=backend.internal; Path=/; HttpOnly
```

3. 使用 `proxy_cookie_domain` 后，Nginx 会根据客户端请求的域名将其修改为：

- 对于 `example.com`：

```http
Set-Cookie: session_id=abc123; Domain=example.com; Path=/; HttpOnly
```

- 对于 `example.org`：

```http
Set-Cookie: session_id=abc123; Domain=example.org; Path=/; HttpOnly
```

### 结合其他 `proxy_cookie_*` 指令

`proxy_cookie_path` 指令可以配合 `proxy_cookie_domain` 使用，用于修改 `Set-Cookie` 头中的路径。

#### 示例配置

```nginx
http {
    upstream backend {
        server backend.internal;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;

            # 修改 Set-Cookie 头中的域名
            proxy_cookie_domain backend.internal example.com;

            # 修改 Set-Cookie 头中的路径
            proxy_cookie_path /backend /;
        }
    }
}
```

假设后端服务器返回的 `Set-Cookie` 头如下：

```http
Set-Cookie: session_id=abc123; Domain=backend.internal; Path=/backend; HttpOnly
```

使用 `proxy_cookie_domain` 和 `proxy_cookie_path` 后，Nginx 会将其修改为：

```http
Set-Cookie: session_id=abc123; Domain=example.com; Path=/; HttpOnly
```

### 总结

`proxy_cookie_domain` 指令在反向代理配置中非常有用，特别是当后端服务器的域名与客户端访问的域名不同时。

通过适当地配置此指令，可以确保客户端接收到正确的 Cookie，维持会话的连续性和安全性。

## 详细介绍一下 nginx 的 proxy_cookie_path 指令，并给出配置操作 cookie 的例子

   用于修改从后端服务器接收到的 Cookie 中的路径。
   
   ```nginx
   proxy_cookie_path /old-path/ /new-path/;  # 将/old-path/替换为/new-path/
   ```



## 4. **proxy_pass**: 详细介绍一下 nginx 的 proxy_pass 指令，并给出配置操作 cookie 的例子

   在 `location` 块中使用 `proxy_pass` 指令来指定代理的后端服务器。虽然它本身不直接处理 Cookie，但是它允许你配置代理请求，间接影响 Cookie 的传输。
   
   ```nginx
   location / {
       proxy_pass http://backend-server;
       # 其他配置...
   }
   ```

## 5. 详细介绍一下 nginx 的 add_header 指令，并给出配置操作 cookie 的例子

   用于向响应头中添加自定义的 Cookie。
   
   ```nginx
   add_header Set-Cookie "example_cookie=value; Path=/; HttpOnly";
   ```
 
## 6. 详细介绍一下 nginx 的 expires 指令，并给出配置操作 cookie 的例子

   设置响应的过期时间，间接影响浏览器对 Cookie 的处理。
   
   ```nginx
   expires 30d;  # 设置过期时间为30天
   ```

## 10. **proxy_cookie***: 详细介绍一下 nginx 的 proxy_cookie 指令，并给出配置操作 cookie 的例子

    Nginx 还提供了其他与 Cookie 相关的指令，如 `proxy_cookie_name` 等，用于修改 Cookie 的名称。

请注意，这些指令的使用和配置需要根据你的具体需求和 Nginx 版本进行调整。

在配置文件中使用这些指令时，确保你已经理解了它们的作用，并且测试了配置以验证其效果。

## 7. **secure**: 详细介绍一下 nginx 的 secure 指令，并给出配置操作 cookie 的例子
   如果使用 SSL/TLS，可以设置 Cookie 为仅通过安全连接传输。
   
   ```nginx
   proxy_cookie_flags example_cookie secure;
   ```

8. **HttpOnly**: 详细介绍一下 nginx 的 HttpOnly 指令，并给出配置操作 cookie 的例子
   设置 Cookie 为 HttpOnly，防止通过客户端脚本访问。
   
   ```nginx
   proxy_cookie_flags example_cookie HttpOnly;
   ```

## 9. **SameSite**:  详细介绍一下 nginx 的 SameSite 指令，并给出配置操作 cookie 的例子

   设置 Cookie 的 SameSite 属性，控制 Cookie 在跨站点请求时的行为。
   
   ```nginx
   add_header Set-Cookie "example_cookie=value; SameSite=Lax";
   ```










* any list
{:toc}
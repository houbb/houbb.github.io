---
layout: post
title:  从零手写实现 nginx-26-rewrite url 重写
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

[从零手写实现 nginx-21-nginx modules 模块信息概览](https://houbb.github.io/2018/11/22/nginx-write-21-modules-overview)

[从零手写实现 nginx-22-nginx modules 分模块加载优化](https://houbb.github.io/2018/11/22/nginx-write-22-modules-load)

[从零手写实现 nginx-23-nginx cookie 的操作处理](https://houbb.github.io/2018/11/22/nginx-write-23-cookie-oper)

[从零手写实现 nginx-24-nginx IF 指令](https://houbb.github.io/2018/11/22/nginx-write-24-directives-if)

[从零手写实现 nginx-25-nginx map 指令](https://houbb.github.io/2018/11/22/nginx-write-25-directives-map)

[从零手写实现 nginx-26-nginx rewrite 指令](https://houbb.github.io/2018/11/22/nginx-write-26-directives-rewrite)



# 小结

本节我们实现了文件的压缩处理，这个对于文件的传输性能提升比较大。

当然，压缩+解压本身也是对性能有损耗的。要结合具体的压缩比等考虑。

下一节，我们考虑实现一下 cors 的支持。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# chat


## 详细介绍一下 nginx 的 rewrite 

Nginx 的 `rewrite` 指令用于对 URL 进行重写（Rewrite），即将用户请求的 URL 按照指定的规则修改成新的 URL，然后再进行后续处理或跳转。

它通常用于实现 URL 重定向、SEO 优化、URL 简化等功能。

### 基本语法
`rewrite` 指令的基本语法如下：

```nginx
rewrite regex replacement [flag];
```

- `regex`: 正则表达式，用于匹配请求的 URL。
- `replacement`: 重写后的新 URL，可以包含捕获组（从 `regex` 中捕获的部分）。
- `flag`: 可选参数，表示重写后的行为。

### 常见的 flag

- `last`: 停止当前所在的 `rewrite` 指令所在的位置，并重新搜索新的 location。相当于 Apache 的 `L` 标志。
- `break`: 停止处理当前的 `rewrite` 指令，但继续处理剩下的指令，不会重新搜索 location。
- `redirect`: 返回 302 临时重定向。
- `permanent`: 返回 301 永久重定向。

### 示例讲解

#### 基本重写

将所有访问 `http://example.com/old-path` 的请求重写为 `http://example.com/new-path`：

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        rewrite ^/old-path$ /new-path break;
    }
}
```

#### 捕获组

使用正则表达式的捕获组，将动态路径的一部分包含在新的路径中：

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        rewrite ^/product/(\d+)$ /new-product/$1 break;
    }
}
```

在这个示例中，`/product/123` 将被重写为 `/new-product/123`。

#### 永久重定向

实现 301 永久重定向，将 `http://example.com/old-page` 重定向到 `http://example.com/new-page`：

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        rewrite ^/old-page$ /new-page permanent;
    }
}
```

#### 带查询参数的重写

将带有查询参数的 URL 重写为不同的路径：

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        if ($arg_id) {
            rewrite ^/details$ /details/$arg_id? last;
        }
    }
}
```

在这个示例中，如果请求 URL 是 `http://example.com/details?id=123`，它将被重写为 `http://example.com/details/123`。

#### 使用变量

Nginx 支持使用变量来动态重写 URL：

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        set $new_url /new-path;
        rewrite ^/old-path$ $new_url break;
    }
}
```

### 使用场景

1. **SEO 优化**：将不友好的 URL 重写为更易读和包含关键词的 URL。
2. **迁移兼容**：网站路径结构调整后，通过重写规则保持旧链接的有效性。
3. **访问控制**：对特定路径进行条件性的访问控制，通过重写指向相应的处理脚本。
4. **负载均衡**：在负载均衡器上，通过重写规则将请求分发到不同的后端服务器。

### 注意事项

1. **正则表达式**：编写和测试正则表达式时需要特别小心，以确保匹配的准确性。
2. **顺序**：`rewrite` 指令的顺序会影响重写的结果，因此应根据实际需求合理安排重写规则。
3. **性能**：大量的重写规则可能影响 Nginx 的性能，应尽量简化和优化规则。

通过合理使用 Nginx 的 `rewrite` 指令，可以实现灵活的 URL 重写和重定向，满足各种应用需求。


## 为什么 nginx 需要 rewrite?

Nginx 需要 `rewrite` 指令的主要原因在于它能够灵活地处理和修改客户端请求的 URL，以满足不同的需求。

这些需求包括但不限于 URL 重定向、SEO 优化、旧链接兼容性、访问控制和负载均衡等。

具体来说，以下是几个主要的原因：

### 1. **SEO 优化**

搜索引擎更倾向于友好且包含关键词的 URL。通过 `rewrite`，可以将复杂或不友好的 URL 转换为简洁且易于理解的 URL，从而提升网页的 SEO 排名。

```nginx
rewrite ^/product/view/(\d+)$ /products/$1 permanent;
```

### 2. **旧链接兼容性**

当网站的路径结构发生变化时，通过 `rewrite` 指令，可以将旧的 URL 重定向到新的 URL，从而保持旧链接的有效性，避免因链接失效而导致的用户流失或 SEO 损失。

```nginx
rewrite ^/old-path$ /new-path permanent;
```

### 3. **访问控制**

可以根据 URL 路径来实现访问控制。例如，将某些路径的请求重定向到一个特定的处理脚本或页面，从而实现权限控制或内容过滤。

```nginx
rewrite ^/admin$ /admin-login.html break;
```

### 4. **负载均衡**

在负载均衡器上，通过 `rewrite` 指令，可以根据请求的 URL 动态地将请求分发到不同的后端服务器或服务，从而实现负载均衡和高可用性。

```nginx
location / {
    if ($request_uri ~* "/api") {
        rewrite ^(.*)$ http://api-server$1 break;
    }
}
```

### 5. **统一资源路径**

通过 `rewrite`，可以将不同格式或规则的 URL 统一到一个标准路径，从而简化后端的处理逻辑。例如，将所有的 `index.php` 请求统一重定向到根路径。

```nginx
rewrite ^/index.php/(.*)$ /$1 break;
```

### 6. **动态 URL 重写**

在某些情况下，需要根据请求中的参数或路径部分动态生成新的 URL。`rewrite` 指令允许使用正则表达式和变量来实现这种动态重写。

```nginx
rewrite ^/user/(\d+)$ /profile?id=$1 break;
```

### 7. **简化配置**

有时候，重写规则可以简化 Nginx 的配置，避免在不同 location 中重复配置相同的处理逻辑。例如，将所有以 `/old` 开头的路径重写到 `/new`，只需一条 `rewrite` 指令。

```nginx
rewrite ^/old/(.*)$ /new/$1 break;
```

### 总结

通过使用 Nginx 的 `rewrite` 指令，可以灵活地管理和修改 URL，从而实现更好的用户体验、SEO 优化、访问控制和系统维护。

这使得 Nginx 能够适应各种复杂的应用场景，并在保持高性能的同时提供强大的功能。

## 给出 nginx rewrite 的使用例子

当然，以下是几个常见的 Nginx `rewrite` 指令使用示例，涵盖了不同的应用场景：

### 1. 基本 URL 重写

将 `/old-path` 重写为 `/new-path`，但保持浏览器地址栏不变（内部重写）。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        rewrite ^/old-path$ /new-path break;
    }
}
```

### 2. 简单的 URL 重定向

将 `/old-page` 重定向到 `/new-page`，并返回 301 永久重定向。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        rewrite ^/old-page$ /new-page permanent;
    }
}
```

### 3. 动态 URL 重写

使用正则表达式和捕获组，将动态路径的一部分包含在新的路径中。

比如，将 `/product/123` 重写为 `/new-product/123`。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        rewrite ^/product/(\d+)$ /new-product/$1 break;
    }
}
```

### 4. 带查询参数的重写

将带有查询参数的 URL 重写为不同的路径。例如，将 `/details?id=123` 重写为 `/details/123`。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        if ($arg_id) {
            rewrite ^/details$ /details/$arg_id? last;
        }
    }
}
```

### 5. 条件重写

根据请求头或其他条件重写 URL。例如，如果请求的主机名是 `old.example.com`，则重写为 `new.example.com`。

```nginx
server {
    listen 80;
    server_name old.example.com;

    location / {
        rewrite ^/(.*)$ http://new.example.com/$1 permanent;
    }
}
```

### 6. 使用变量

通过变量动态地重写 URL。例如，根据请求的 URI 动态地设置新的路径。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        set $new_url /new-path;
        rewrite ^/old-path$ $new_url break;
    }
}
```

### 7. 将所有请求重写到单一入口点

常见于单页应用（SPA）或使用前端路由的应用，将所有请求重写到 `index.html`。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 8. 禁止特定路径访问

如果需要禁止访问某些路径，可以将这些路径重写到一个错误页面或直接返回 403 Forbidden。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        rewrite ^/admin/.*$ /forbidden.html break;
    }

    location = /forbidden.html {
        internal;
    }
}
```

### 9. 处理 HTTPS 重定向

将所有 HTTP 请求重定向到 HTTPS，以确保安全性。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        rewrite ^/(.*)$ https://example.com/$1 permanent;
    }
}
```

### 10. 负载均衡

在负载均衡器上，通过重写规则将请求分发到不同的后端服务器。

```nginx
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
    }

    location /api {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://backend/api;
    }
}
```

这些示例展示了 Nginx `rewrite` 指令的多种应用场景，从简单的 URL 重写到复杂的条件重写和负载均衡。

根据具体需求，可以灵活地配置和组合这些规则，以实现预期的效果。

## nginx rewrite 有哪些优缺点？

Nginx `rewrite` 指令在URL重写和重定向方面提供了强大的功能，但也有其优缺点。以下是对其优缺点的详细分析：

### 优点

1. **灵活性高**
   - `rewrite` 指令使用正则表达式，可以处理复杂的URL重写需求，几乎可以满足任何URL重写的场景。

2. **性能高**
   - Nginx 本身是一个高性能的HTTP服务器，`rewrite` 指令的执行效率很高，不会显著影响服务器的性能。

3. **丰富的功能**
   - 可以进行内部重写、临时重定向、永久重定向，还可以根据请求的条件（如请求头、变量等）进行重写和重定向。

4. **SEO优化**
   - 通过重写URL，可以使网站的URL更加友好，有利于搜索引擎优化（SEO）。

5. **兼容性**
   - 可以保持旧链接的有效性，通过重写规则将旧的URL重定向到新的URL，保证网站迁移或路径结构调整后的兼容性。

6. **简化配置**
   - 可以通过简单的重写规则实现复杂的URL路由逻辑，简化服务器配置。

### 缺点

1. **配置复杂**
   - 对于不熟悉正则表达式的用户来说，编写和调试`rewrite`规则可能比较困难，容易出错。

2. **可读性差**
   - 复杂的重写规则可能导致配置文件的可读性降低，维护起来比较困难。

3. **错误处理困难**
   - 当重写规则出现错误时，可能导致请求无法正确路由，调试这些问题通常需要一些经验。

4. **影响缓存**
   - URL的重写可能会影响缓存策略，因为重写后的URL和原始URL可能被视为不同的资源，从而导致缓存命中率降低。

5. **潜在的性能开销**
   - 虽然Nginx的性能较高，但复杂的重写规则仍可能在高流量情况下带来一定的性能开销，尤其是当规则涉及大量正则表达式匹配时。

6. **安全风险**
   - 不当的重写规则可能引发安全问题，例如URL重写导致的路径遍历攻击等，需要仔细设计和验证规则。

### 总结

Nginx `rewrite` 指令是一个非常强大且灵活的工具，可以极大地满足各种复杂的URL重写和重定向需求。

它的高性能和丰富的功能使得它在许多场景中非常有用。

然而，它的配置复杂性和潜在的错误风险也需要管理员在使用时保持谨慎，确保规则的正确性和安全性。

通过合理的设计和优化，可以最大程度地发挥`rewrite` 指令的优势，满足应用需求。

## 如果让你设计 rewrite 指令，你会如何设计？为什么

设计一个URL重写指令时，需要考虑简洁性、易用性、灵活性和性能等多个方面。

以下是一个改进版的重写指令设计思路，并附上设计理由：

### 设计目标

1. **易用性**：让用户更容易编写和理解重写规则。
2. **灵活性**：支持复杂的URL重写需求。
3. **性能**：保持高效的处理性能。
4. **安全性**：减少潜在的安全风险。

### 设计思路

1. **简化语法**：提供更直观的语法，减少对正则表达式的依赖。
2. **条件支持**：允许根据请求头、查询参数等条件进行重写。
3. **调试工具**：提供调试工具和详细的错误信息。
4. **内置变量**：预定义一些常用变量，减少用户记忆负担。
5. **分组和优先级**：支持规则分组和优先级设置，简化复杂配置。

### 重写指令设计示例

#### 基本语法

```plaintext
rewrite [pattern] [replacement] [flag] [condition];
```

- `pattern`: 匹配模式，支持简单模式和正则表达式。
- `replacement`: 重写后的URL，可以包含捕获组。
- `flag`: 可选参数，表示重写后的行为（如 `last`、`break`、`redirect`、`permanent`）。
- `condition`: 可选参数，表示重写规则生效的条件。

#### 示例

1. **简单重写**

```plaintext
rewrite /old-path /new-path;
```

- 将 `/old-path` 重写为 `/new-path`。

2. **正则表达式重写**

```plaintext
rewrite ^/product/(\d+)$ /new-product/$1;
```

- 将 `/product/123` 重写为 `/new-product/123`。

3. **条件重写**

```plaintext
rewrite ^/details$ /details/$arg_id if ($arg_id);
```

- 如果存在查询参数 `id`，将 `/details?id=123` 重写为 `/details/123`。

4. **重定向**

```plaintext
rewrite ^/old-page$ /new-page permanent;
```

- 将 `/old-page` 重定向到 `/new-page`，返回301永久重定向。

5. **条件与请求头**

```plaintext
rewrite ^/admin$ /admin-login.html if ($http_user_agent ~* "bot");
```

- 如果用户代理包含 "bot"，将 `/admin` 重写为 `/admin-login.html`。

6. **分组和优先级**

```plaintext
rewrite group main {
    priority 1;
    rewrite /old-path /new-path;
    rewrite ^/product/(\d+)$ /new-product/$1;
}
```

- 将规则分组，并设置优先级。

### 理由

1. **简化语法**：使用简单的模式匹配，减少用户对正则表达式的依赖，降低使用门槛。
2. **条件支持**：允许根据请求头、查询参数等条件进行重写，增强灵活性。
3. **调试工具**：提供调试工具和详细的错误信息，方便用户调试和排查问题。
4. **内置变量**：预定义一些常用变量，如 `$arg_id`、`$http_user_agent`，减少用户记忆负担。
5. **分组和优先级**：支持规则分组和优先级设置，使得复杂配置更易于管理。

### 实现

为实现这些设计，需要在Nginx核心中扩展现有的rewrite模块，增加对条件、分组、优先级和调试工具的支持。

同时，优化正则表达式的处理性能，确保重写指令的高效执行。

通过这样的设计，可以显著提升Nginx重写指令的易用性和灵活性，同时保持高效的性能和安全性。

# 参考资料


* any list
{:toc}
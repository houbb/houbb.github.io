---
layout: post
title:  从零手写实现 nginx-18-access control 访问控制 防止倒链
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

# 小结

本节我们实现了文件的压缩处理，这个对于文件的传输性能提升比较大。

当然，压缩+解压本身也是对性能有损耗的。要结合具体的压缩比等考虑。

下一节，我们考虑实现一下 cors 的支持。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# chat

## 详细介绍下 防止盗链

防止盗链是指采取措施保护网站资源不被未授权的网站直接链接（或嵌入）访问。盗链不仅消耗了原网站的带宽资源，还可能带来版权和安全问题。以下是一些防止盗链的常见策略：

### 1. HTTP 头部设置
通过设置特定的HTTP头部，可以限制资源的访问来源。

- **Referer头部**：检查HTTP请求中的`Referer`头部，确保请求来自合法的域名。
- **Access-Control-Allow-Origin**：对于跨域资源共享（CORS），可以设置允许访问的域名列表。

### 2. Web服务器配置
在Web服务器（如Apache、Nginx）中设置规则，拒绝来自特定域名的请求。

#### Apache示例：
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTP_REFERER} !^$
    RewriteCond %{HTTP_REFERER} !^http(s)?://(www\.)?example\.com [NC]
    RewriteRule \.(jpg|jpeg|png|gif)$ - [F,L]
</IfModule>
```
上面的Apache配置会拒绝所有非`example.com`域名的图片请求。

#### Nginx示例：
```nginx
if ($http_referer != "") {
    valid_referers none blocked example.com *.example.com;
    if ($invalid_referer) {
        return 403;
    }
}
```
在Nginx中，如果请求的`Referer`不符合规定的域名，则返回403禁止访问状态。

### 3. IP地址限制
限制只有特定的IP地址或IP地址范围可以访问资源。

#### Apache示例：
```apache
<FilesMatch "\.(jpg|jpeg|png|gif)$">
    Order Allow,Deny
    Allow from 192.168.
    Deny from all
</FilesMatch>
```
这将只允许`192.168.x.x`网段的IP地址访问匹配的文件。

#### Nginx示例：
```nginx
location ~* \.(jpg|jpeg|png|gif)$ {
    allow 192.168.0.0/16;
    deny all;
}
```
这将限制只有`192.168.x.x`网段的访问。

### 4. Token验证
生成一个token（通常是一个随机字符串），并将该token作为参数附加到资源URL中。服务器端需要验证这个token的有效性。

### 5. 用户登录验证
要求用户登录后才能访问资源，可以有效地防止未授权的访问。

### 6. 使用CDN
内容分发网络（CDN）通常提供防盗链功能，可以设置资源访问的源站验证。

### 7. 动态生成资源链接
通过服务器端脚本动态生成资源链接，并设置较短的有效期，使得盗链者难以利用。

### 8. 法律和版权声明
在网站上明确版权声明和使用条款，虽然这不能技术上防止盗链，但可以提供法律保护。

### 注意事项：
- 防盗链措施可能会影响搜索引擎的爬虫，因此在实施时需要考虑搜索引擎优化（SEO）。
- 完全防止盗链是非常困难的，特别是对于静态资源，因此目标应该是尽量减少未授权访问。
- 某些防盗链策略可能会被绕过，因此定期检查和更新防盗链措施是必要的。

通过上述措施，可以在一定程度上防止资源被盗链，保护网站资源和版权。

然而，需要注意的是，没有任何方法可以提供100%的防盗链保证。

## 详细介绍下 nginx 得访问控制

Nginx 提供了多种访问控制功能，允许管理员限制或允许特定IP地址、地理位置、用户代理等访问服务器上的资源。以下是一些常见的 Nginx 访问控制方法：

### 1. IP地址访问控制
Nginx 允许通过配置文件限制或允许特定IP地址的访问。

```nginx
# 允许特定IP地址访问
allow 192.168.1.1;

# 拒绝特定IP地址访问
deny 192.168.1.2;

# 允许所有IP地址访问，除了被deny的
allow all;
```

### 2. 地理位置访问控制
可以使用 Nginx 模块如 `ngx_http_geo_module` 根据用户的地理位置来控制访问。

```nginx
geo $location {
    default          USA;
    192.168.1.0/24  OFFICE;
    10.0.0.0/8      INTERNAL;
}

server {
    location / {
        if ($location = INTERNAL) {
            return 403;
        }
    }
}
```
上面的配置会拒绝所有来自 `10.0.0.0/8` 网段的访问。

### 3. 用户代理访问控制
根据用户代理（User-Agent）字符串来限制访问。

```nginx
if ($http_user_agent ~* MSIE) {
    return 403;
}
```
上面的配置会拒绝所有使用 MSIE 浏览器的用户访问。

### 4. Referer访问控制
检查 HTTP 请求的 `Referer` 头部，只允许从特定站点访问资源。

```nginx
valid_referers none blocked server_names example.com *.example.com;

if ($invalid_referer) {
    return 403;
}
```
上面的配置会拒绝所有非 `example.com` 域名的请求。

### 5. 基于时间的访问控制
限制特定时间段内的访问。

```nginx
location / {
    allow 192.168.1.0/24;
    deny all;
    valid_referers none blocked server_names example.com *.example.com;
    if ($invalid_referer) {
        return 403;
    }
    if ($remote_addr = 192.168.1.100) {
        allow all;
    }
    if ($http_user_agent ~ MSIE) {
        return 403;
    }
    if ($binary_remote_addr = 192.168.1.101) {
        allow all;
    }
    if ($args) {
        allow all;
    }
    if ($request_time >= 1000000000) {
        allow all;
    }
    if ($request_time < 946684800) {
        allow all;
    }
    deny all;
}
```
上面的配置示例中，`$request_time` 用于检查请求的时间戳。

### 6. 访问限制与认证
可以使用 Nginx 的 `ngx_http_auth_basic_module` 模块来实现基于用户名和密码的访问控制。

```nginx
location /secure/ {
    auth_basic "Restricted Content";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```
上面的配置要求用户输入用户名和密码才能访问 `/secure/` 路径下的资源。

### 7. 使用第三方模块
Nginx 社区提供了许多第三方模块，如 `modsecurity`，`ngx_http_aws_auth_request_module`等，用于增强访问控制功能。

### 注意事项：

- 在实施访问控制时，应确保不会错误地阻止合法用户的访问。
- 访问控制规则应定期审查和更新，以应对新的安全威胁。
- 对于敏感资源，建议使用组合的访问控制策略，以提高安全性。

通过上述方法，Nginx 提供了灵活的访问控制机制，帮助管理员保护服务器资源免受未授权访问。


# 参考资料


* any list
{:toc}
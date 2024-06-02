---
layout: post
title:  Nginx 实战-05-nginx 反向代理实现域名到指定的 ip 
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

# 目标

我想实现访问 http://github/houbb  转发到 http://127.0.0.1:3000

# 准备工作

实现一个简单的 http 服务

## nodejs http
 
```
>node -v
v20.10.0

>npm -v
10.2.3
```

### 代码编写

```js
const http = require('http');

// 创建一个 HTTP 服务器
const server = http.createServer((req, res) => {
  // 设置响应头
  res.writeHead(200, {'Content-Type': 'text/plain'});
  // 发送响应内容
  res.end('Hello World!\n');
});

// 监听端口 3000
server.listen(3000, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:3000/');
});

```

### 启动

```
λ node http.js
Server running at http://127.0.0.1:3000/
```

测试效果：

```
>curl http://127.0.0.1:3000/
Hello World!
```


## 如何通过 nginx 设置反向代理，让我们访问 http://githubhoubb 的请求转发到 http://127.0.0.1:3000

要通过 Nginx 设置反向代理，将访问 `http://githubhoubb` 的请求转发到 `http://127.0.0.1:3000`，需要编辑 Nginx 的配置文件来定义一个 `server` 块和 `location` 块。

以下是配置的示例步骤：

### 1. 修改配置文件

找到 nginx 文件，

添加 server 块**：在 `http` 块内部，添加一个新的 `server` 块，用于监听 80 端口（HTTP 默认端口）：

    ```nginx
    server {
        listen 80;
        server_name githubhoubb;  # 这里应为 githubhoubb 或者你希望的域名

        location / {
            proxy_pass http://127.0.0.1:3000;  # 转发到本机的 3000 端口
            proxy_set_header Host $host;  # 设置原始请求的 Host 头
            proxy_set_header X-Real-IP $remote_addr;  # 设置原始请求的 IP 地址
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 设置 X-Forwarded-For 头
            proxy_set_header X-Forwarded-Proto $scheme;  # 设置 X-Forwarded-Proto 头
        }
    }
    ```

### 2. 验证配置正确性：

```
λ nginx -t
nginx: the configuration file D:\tool\nginx\nginx-1.26.0\nginx-1.26.0/conf/nginx.conf syntax is ok
nginx: configuration file D:\tool\nginx\nginx-1.26.0\nginx-1.26.0/conf/nginx.conf test is successful
```

### 3. 重载 Nginx 配置

为了使更改生效，你需要重载 Nginx 的配置。在命令行中运行以下命令：

    ```sh
    nginx -s reload
    ```

### 4. 测试验证

```
curl http://githubhoubb
```

现在，当你尝试访问 `http://githubhoubb`（或者你在 `server_name` 中设置的域名），请求应该会被转发到 `http://127.0.0.1:3000`。

发现，依然无效。

```
λ curl http://githubhoubb
curl: (6) Could not resolve host: githubhoubb
```

发现这里如果想成功，必须和 DNS 结合起来。



-------------------------------------------------------------------------------------------------------------------------------------------------



# chat

## 比如我想实现访问 http://githubhbb.com   转发到 http://127.0.0.1:3000

您提到的 `jmdns` 确实支持服务的注册和发现，它遵循了零配置网络（Zero Configuration Networking，Zeroconf）的协议，使得设备可以在没有明确配置的情况下相互发现和通信。`jmdns` 主要用于局域网内服务的发现，比如在一个家庭或小型办公室网络中，不同的设备可以发现并访问网络上的其他服务，如打印机、文件共享、网络摄像头等。

然而，`jmdns` 并不提供域名解析或转发的功能。它允许设备在局域网内发布服务并被其他设备发现，但是它不涉及将外部域名（如 `http://githubhbb.com`）解析或转发到一个特定的 IP 地址和端口（如 `http://127.0.0.1:3000`）。

要实现您提出的需求，即让 `http://githubhbb.com` 指向 `http://127.0.0.1:3000`，您需要以下几种方法之一：

1. **修改本地 `hosts` 文件**：在本地机器上，您可以编辑 `hosts` 文件，将 `githubhbb.com` 映射到 `127.0.0.1`。但这种方法只对修改了 `hosts` 文件的机器有效，并且不涉及端口转发。

2. **DNS 配置**：如果您控制了 `githubhbb.com` 的 DNS 设置，您可以将该域名的 DNS 解析指向您的本地 IP 地址。然而，这通常不适用于公共域名，因为它会影响所有尝试访问该域名的用户的解析结果。

3. **反向代理**：您可以使用反向代理服务器，如 Nginx 或 Apache，配置它来将对 `githubhbb.com` 的请求转发到 `127.0.0.1:3000`。这通常用于开发和测试目的，而不是生产环境。

4. **本地 DNS 服务**：您可以在本地网络中设置一个 DNS 服务，如 `dnsmasq`，它可以将特定的域名解析到本地的 IP 地址。

5. **浏览器插件**：对于开发和测试，您可以使用浏览器插件来修改浏览器的 DNS 解析，将特定的域名指向特定的 IP 地址。

`jmdns` 可以用于局域网内的服务发现，但它不是为域名解析或网络级别的请求转发设计的。如果您的需求是让局域网内的设备发现并访问您的服务，那么 `jmdns` 是一个很好的工具。但如果您想要将一个外部域名指向一个本地地址，您需要使用上述提到的其他方法。

## 如何通过 nginx 设置反向代理，让我们访问 http://githubhoubb 的请求转发到 http://127.0.0.1:3000

要通过 Nginx 设置反向代理，将访问 `http://github/houbb` 的请求转发到 `http://127.0.0.1:3000`，你需要编辑 Nginx 的配置文件来定义一个 `server` 块和 `location` 块。以下是配置的示例步骤：

1. **找到 Nginx 配置文件**：Nginx 的配置文件通常位于 Nginx 安装目录的 `conf` 文件夹中，文件名为 `nginx.conf`。

2. **编辑配置文件**：使用文本编辑器打开 `nginx.conf` 文件，并找到 `http` 块，它看起来像这样：

    ```nginx
    http {
        # ...
    }
    ```

3. **添加 server 块**：在 `http` 块内部，添加一个新的 `server` 块，用于监听 80 端口（HTTP 默认端口）：

    ```nginx
    server {
        listen 80;
        server_name github/houbb;  # 这里应为 githubhoubb 或者你希望的域名

        location / {
            proxy_pass http://127.0.0.1:3000;  # 转发到本机的 3000 端口
            proxy_set_header Host $host;  # 设置原始请求的 Host 头
            proxy_set_header X-Real-IP $remote_addr;  # 设置原始请求的 IP 地址
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 设置 X-Forwarded-For 头
            proxy_set_header X-Forwarded-Proto $scheme;  # 设置 X-Forwarded-Proto 头
        }
    }
    ```

    请注意，`server_name` 应与您想要使用的域名匹配。由于 `github/houbb` 包含一个斜杠，这在 DNS 中不是有效的域名格式，所以您可能需要使用一个子域或一个没有斜杠的域名，例如 `githubhoubb.localhost`。

4. **保存并关闭配置文件**。

5. **重载 Nginx 配置**：为了使更改生效，你需要重载 Nginx 的配置。在命令行中运行以下命令：

    ```sh
    nginx -s reload
    ```

6. **测试配置**：现在，当你尝试访问 `http://githubhoubb.localhost`（或者你在 `server_name` 中设置的域名），请求应该会被转发到 `http://127.0.0.1:3000`。

请记住，如果你使用的是实际的域名，而不是 `localhost` 或本地测试域名，你可能还需要在 DNS 设置中将该域名指向你的服务器的公网 IP 地址。此外，如果你打算使用 HTTPS 或者是生产环境，还需要考虑 SSL 证书的配置和安全设置。

## 如何利用 Nginx 作为本地 DNS 服务器

Nginx 本身并不是一个 DNS 服务器，它主要用于处理 HTTP、HTTPS 等网络请求。

不过，你可以使用 Nginx 来转发 DNS 查询请求到真正的 DNS 服务器，或者配合其他工具来实现类似的功能。

如果你想要利用 Nginx 来辅助处理 DNS 请求，你可以考虑以下方法：

1. **DNS 转发**：配置 Nginx 作为 DNS 转发服务器，将 DNS 请求转发到上游 DNS 服务器。

2. **使用第三方模块**：虽然 Nginx 核心功能不包括 DNS 服务器功能，但有一些第三方模块可能提供了这样的功能，如 `ngx_postgres` 可以与 Postgres 数据库结合使用，用于存储和查询 DNS 记录。

3. **结合使用 DNS 服务**：在本地运行一个 DNS 服务，如 `dnsmasq` 或 BIND，并配置 Nginx 来处理特定的请求，而将其他请求转发给这个 DNS 服务。

以下是使用 `dnsmasq` 作为本地 DNS 服务的一个基本示例：

1. **安装 dnsmasq**：在系统上安装 `dnsmasq`。

2. **配置 dnsmasq**：在 `dnsmasq` 的配置文件中（通常是 `/etc/dnsmasq.conf` 或 `/usr/local/etc/dnsmasq.conf`），添加一个条目来解析特定的域名到本地 IP 地址。例如：

   ```
   address=/githubhoubb/127.0.0.1
   ```

3. **启动 dnsmasq**：启动 `dnsmasq` 服务，以便它可以开始解析和响应 DNS 请求。

4. **配置 Nginx**：配置 Nginx 来处理特定的请求，而将其他请求转发给 `dnsmasq`。例如，你可以在 Nginx 的配置文件中添加一个 `stream` 块来监听 DNS 端口（53）并转发请求：

   ```nginx
   stream {
       upstream dns_backend {
           server 127.0.0.1:53;
       }

       server {
           listen 53;
           proxy_pass dns_backend;
       }
   }
   ```

5. **重启 Nginx**：重新加载 Nginx 配置以应用更改。

请注意，这种方法并不是让 Nginx 成为一个真正的 DNS 服务器，而是使用 Nginx 来转发 DNS 请求。真正的 DNS 解析工作是由 `dnsmasq` 完成的。

如果你需要一个完整的 DNS 服务器功能，你可能需要使用专门的 DNS 服务器软件，如 `bind`、`dnsmasq` 或 `powerdns`。这些工具提供了完整的 DNS 服务器功能，包括区域管理、记录管理、DNSSEC 支持等。

# 参考资料

[nginx 一把梭！（超详细讲解+实操）](https://juejin.cn/post/7306041273822527514)

> [一个简单的Nginx入门案例](一个简单的Nginx入门案例)

https://juejin.cn/post/7293176193322729510

* any list
{:toc}
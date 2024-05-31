---
layout: post
title:  Nginx 实战-03-nginx 负载均衡
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

# 场景

假设我们有两个 http 服务

localhost:3000
localhost:3001

实际对应生产的等价的多台服务，如何通过 nginx 代理，让请求均衡的请求到每一台上面吗。

接下来我们来模拟一下整个流程。

## nodejs 创建第1个 http 服务

Node.js 最简单的入门例子是一个基础的 Web 服务器，它使用 Node.js 内置的 `http` 模块来响应 HTTP 请求。

以下是创建这样一个服务器的步骤：

1. **安装 Node.js**：确保你已经在系统上安装了 Node.js。你可以通过在终端运行以下命令来检查 Node.js 是否已安装以及其版本号：

   ```bash
   node -v
   ```

2. **创建一个新的 JavaScript 文件**：在你的文本编辑器中，创建一个名为 `app.js` 的新文件。

3. **编写代码**：在 `app.js` 文件中，输入以下代码：

   ```javascript
   const http = require('http'); // 引入 http 模块

   // 创建一个 HTTP 服务器
   const server = http.createServer((req, res) => {
     res.writeHead(200, {'Content-Type': 'text/plain'});
     res.end('Hello, World!\n'); // 响应请求并发送一个字符串
   });

   // 服务器监听 3000 端口
   server.listen(3000, '127.0.0.1', () => {
     console.log('Server running at http://127.0.0.1:3000/');
   });
   ```

4. **运行你的服务器**：在终端中，导航到 `app.js` 文件所在的目录，然后运行以下命令：

   ```bash
   node app.js
   ```

5. **访问服务器**：

```sh
$ curl http://127.0.0.1:3000/
Hello, World!
```

## nodejs 创建第 2 个 http 服务

3. **编写代码**：在 `app2.js` 文件中，输入以下代码：

   ```javascript
   const http = require('http'); // 引入 http 模块

   // 创建一个 HTTP 服务器
   const server = http.createServer((req, res) => {
     res.writeHead(200, {'Content-Type': 'text/plain'});
     res.end('Hello, World! FROM 127.0.0.1:3001\n'); // 响应请求并发送一个字符串
   });

   // 服务器监听 3001 端口
   server.listen(3001, '127.0.0.1', () => {
     console.log('Server running at http://127.0.0.1:3001/');
   });
   ```

4. **运行你的服务器**：在终端中，导航到 `app.js` 文件所在的目录，然后运行以下命令：

   ```bash
   node app2.js
   ```

5. **访问服务器**：

```sh
$ curl localhost:3001
Hello, World! FROM 127.0.0.1:3001
```







# 假设我有两台 http 服务，127.0.0.1:3000, 127.0.0.1:3001。如何通过 nginx 代理访问，让后续的请求可以均衡的请求到两台机器上？


## 修改配置

1. **编辑 Nginx 配置文件**：找到 Nginx 的主配置文件，通常位于 `/etc/nginx/nginx.conf` 或 `/etc/nginx/sites-available/default`（如果是使用 `sites-available` 和 `sites-enabled` 目录结构的话）。

2. **添加一个新的 `server` 块**：在配置文件中，你需要添加一个新的 `server` 块来配置代理设置。确保在正确的上下文（通常是 `http` 块内）添加此配置。

3. **配置代理**：在新的 `server` 块中，设置 `location` 部分以代理到你的 Node.js 服务。


这段配置是 Nginx 的一个 `server` 块，它定义了如何处理进入 Nginx 的 HTTP 请求，并将这些请求代理到一个 Node.js 服务上。下面是对这个配置块中每一行的详细解释：

```sh
sudo vi /etc/nginx/nginx.conf
```

```nginx
http {
    upstream backend {
        server 127.0.0.1:3000;
        server 127.0.0.1:3001;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

在这个配置中：

upstream 块定义了后端服务器的地址和端口。
proxy_pass 指令将请求转发到 upstream 块中定义的后端服务器组。
默认情况下，Nginx 会使用轮询（round-robin）算法将请求均衡地分配到后端服务器上。
您可以根据需要进行更多高级配置，例如指定其他负载均衡算法、设置后端服务器的权重等。

完整的配置文件修改后如下：

vi nginx.conf

```conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
        worker_connections 768;
        # multi_accept on;
}

http {

        ##
        # Basic Settings
        ##

        sendfile on;
        tcp_nopush on;
        types_hash_max_size 2048;
        # server_tokens off;

        # server_names_hash_bucket_size 64;
        # server_name_in_redirect off;

        include /etc/nginx/mime.types;
        default_type application/octet-stream;

        ##
        # SSL Settings
        ##

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
        ssl_prefer_server_ciphers on;

        ##
        # Logging Settings
        ##

        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        ##
        # Gzip Settings
        ##

        gzip on;

        # gzip_vary on;
        # gzip_proxied any;
        # gzip_comp_level 6;
        # gzip_buffers 16 8k;
        # gzip_http_version 1.1;
        # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        ##
        # Virtual Host Configs
        ##
        upstream backend {
            server 127.0.0.1:3000;
            server 127.0.0.1:3001;
         }

         server {
            listen 80;
            server_name localhost;

            location / {
                  proxy_pass http://backend;
                  proxy_http_version 1.1;
                  proxy_set_header Upgrade $http_upgrade;
                  proxy_set_header Connection 'upgrade';
                  proxy_set_header Host $host;
                  proxy_cache_bypass $http_upgrade;
            }
         }

        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;
}


#mail {
#       # See sample authentication script at:
#       # http://wiki.nginx.org/ImapAuthenticateWithApachePhpScript
#
#       # auth_http localhost/auth.php;
#       # pop3_capabilities "TOP" "USER";
#       # imap_capabilities "IMAP4rev1" "UIDPLUS";
#
#       server {
#               listen     localhost:110;
#               protocol   pop3;
#               proxy      on;
#       }
#
#       server {
#               listen     localhost:143;
#               protocol   imap;
#               proxy      on;
#       }
#}
```


4. **测试 Nginx 配置**：在保存配置文件之前，运行以下命令来测试 Nginx 配置是否有语法错误：

   ```bash
   sudo nginx -t
   ```

   如下:

   ```
   $ sudo nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
   ```

5. **重启 Nginx 服务**：如果 Nginx 配置测试通过，重启 Nginx 服务以应用新配置：

   ```bash
   sudo systemctl restart nginx
   ```

6. **通过 Nginx 访问 Node.js 服务**：现在，你可以通过 Nginx 服务器的 IP 地址或域名（如果配置了域名）加上相应的端口号（如果不使用默认的 80 端口）来访问你的 Node.js 服务。

请注意，如果你的 Node.js 应用使用的是 HTTPS 或者你希望 Nginx 处理 SSL 连接，那么你可能还需要在 Nginx 配置中添加 SSL 相关设置和证书。

```sh
$ curl http://localhost
Hello, World!
$ curl http://localhost
Hello, World! FROM 127.0.0.1:3001
$ curl http://localhost
Hello, World!
$ curl http://localhost
Hello, World! FROM 127.0.0.1:3001
```

可见已经均衡的请求到 2 台服务上了。


---------------------------------------------------------------------------


# chat

## 

## 访问

这样访问 [http://localhost/hello](http://localhost/hello) 和原来访问 tomcat 一个效果。

# 参考资料

[nginx 一把梭！（超详细讲解+实操）](https://juejin.cn/post/7306041273822527514)

> [一个简单的Nginx入门案例](一个简单的Nginx入门案例)

https://juejin.cn/post/7293176193322729510

* any list
{:toc}
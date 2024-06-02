---
layout: post
title:  Nginx 实战-04-nginx 不同的地址访问不同的服务
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








------------------------------------------------------------------------------------------------------------------------------------------------------------


# 目标

假设我有两台 http 服务，分别为 127.0.0.1:3000, 127.0.0.1:3001。

如何通过 nginx 代理访问，让 http://localhost/s1/ 访问到 127.0.0.1:3000，让 http://localhost/s2/ 访问到 127.0.0.1:3001?


# 实现方式

## 修改配置

```sh
sudo vi /etc/nginx/nginx.conf
```

```conf
server {
   listen 80;
   server_name localhost;
   location /s1/ {
      proxy_pass http://127.0.0.1:3000/;
   }
   location /s2/ {
      proxy_pass http://127.0.0.1:3001/;
   }
}
```


这个配置中，Nginx 会监听在本地的 80 端口，当请求 `/s1/` 路径时，Nginx 会将请求代理到 `http://127.0.0.1:3000/`，同理，当请求 `/s2/` 路径时，Nginx 会将请求代理到 `http://127.0.0.1:3001/`。

你可以将这个配置保存为一个 `.conf` 文件，然后将其放置在 Nginx 配置文件夹中（通常是 `/etc/nginx/sites-available/` 或 `/usr/local/nginx/conf/conf.d/`），最后通过 `nginx -s reload` 重载 Nginx 配置即可生效。

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
      server {
         listen 80;
         server_name localhost;

         location /s1/ {
            proxy_pass http://127.0.0.1:3000/;
         }

         location /s2/ {
            proxy_pass http://127.0.0.1:3001/;
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
$ curl http://localhost/s1/
Hello, World!

$ curl http://localhost/s2/
Hello, World! FROM 127.0.0.1:3001
```

这样不同的路径请求，就可以到对应的服务上了。

---------------------------------------------------------------------------


# chat

## 不同的路径代理不同的服务

假设我有两台 http 服务，分别为 127.0.0.1:3000, 127.0.0.1:3001。

如何通过 nginx 代理访问，让 http://localhost/s1/ 访问到 127.0.0.1:3000，让 http://localhost/s2/ 访问到 127.0.0.1:3001?

你可以通过 Nginx 的反向代理功能来实现这个需求。你可以创建一个 Nginx 的配置文件，配置两个代理位置分别指向不同的 http 服务。

以下是一个简单的 Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name localhost;

    location /s1/ {
        proxy_pass http://127.0.0.1:3000/;
    }

    location /s2/ {
        proxy_pass http://127.0.0.1:3001/;
    }
}
```

这个配置中，Nginx 会监听在本地的 80 端口，当请求 `/s1/` 路径时，Nginx 会将请求代理到 `http://127.0.0.1:3000/`，同理，当请求 `/s2/` 路径时，Nginx 会将请求代理到 `http://127.0.0.1:3001/`。

你可以将这个配置保存为一个 `.conf` 文件，然后将其放置在 Nginx 配置文件夹中（通常是 `/etc/nginx/sites-available/` 或 `/usr/local/nginx/conf/conf.d/`），最后通过 `nginx -s reload` 重载 Nginx 配置即可生效。



## 如何不同的域名访问？

假设我有两台 http 服务，分别为 127.0.0.1:3000, 127.0.0.1:3001。如何通过 nginx 代理访问，让 http://localhost.s1/ 访问到 127.0.0.1:3000，让 http://localhost.s2/ 访问到 127.0.0.1:3001?




您可以通过 Nginx 的虚拟主机（Server Blocks）功能为每个服务配置不同的域名，并将其代理到不同的后端服务器。以下是配置示例：

```nginx
http {
    server {
        listen 80;
        server_name localhost.s1;

        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    server {
        listen 80;
        server_name localhost.s2;

        location / {
            proxy_pass http://127.0.0.1:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

在这个配置中：

- 第一个 `server` 块配置了监听域名为 `localhost.s1` 的虚拟主机，并将请求代理到 `127.0.0.1:3000`。
- 第二个 `server` 块配置了监听域名为 `localhost.s2` 的虚拟主机，并将请求代理到 `127.0.0.1:3001`。

您需要确保您的系统 hosts 文件中有相应的域名解析，例如：

```
127.0.0.1 localhost.s1
127.0.0.1 localhost.s2
```

将以上配置添加到您的 Nginx 配置文件中，并重新加载 Nginx，这样访问 `http://localhost.s1/` 就会代理到 `127.0.0.1:3000`，访问 `http://localhost.s2/` 就会代理到 `127.0.0.1:3001`。

您可以在 Nginx 配置中指定虚拟主机，并使用不同的域名来区分不同的服务，而无需修改系统的 hosts 文件。这可以通过在 Nginx 配置中使用 `server_name` 指令来实现。以下是相应的配置示例：

```nginx
http {
    server {
        listen 80;
        server_name localhost.s1;

        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    server {
        listen 80;
        server_name localhost.s2;

        location / {
            proxy_pass http://127.0.0.1:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

在这个配置中，第一个 `server` 块监听 `localhost.s1`，将请求代理到 `127.0.0.1:3000`；第二个 `server` 块监听 `localhost.s2`，将请求代理到 `127.0.0.1:3001`。

使用不同的域名可以避免修改系统的 hosts 文件，但是需要确保您的 DNS 服务器或本地 DNS 解析器能够正确解析这些域名到您的 Nginx 服务器的 IP 地址。

## 把二者结合起来，给出满足最初条件的完整的配置

好的，以下是结合了两种方法的完整 Nginx 配置：

这个警告是由于配置中出现了重复的 `server_name` 指令所导致的。为了避免这个警告，您可以将共享相同监听端口的 `server` 块合并为一个，并在其中使用 `if` 条件来动态选择代理目标。以下是修正后的配置：

```nginx
http {
    server {
        listen 80;
        server_name localhost.s1 localhost.s2;

        location / {
            # 使用 if 条件根据请求的域名选择代理目标
            if ($host = 'localhost.s1') {
                proxy_pass http://127.0.0.1:3000;
            }
            if ($host = 'localhost.s2') {
                proxy_pass http://127.0.0.1:3001;
            }

            # 设置代理请求的头部信息
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

这样您就可以通过 `http://localhost.s1/` 访问 `127.0.0.1:3000`，通过 `http://localhost.s2/` 访问 `127.0.0.1:3001`，而不会再收到重复 `server_name` 的警告。

在这个配置中：

- 前两个 `server` 块分别监听 `localhost.s1` 和 `localhost.s2`，并将请求代理到相应的后端服务器。
- 第三个 `server` 块监听 `localhost.s1` 和 `localhost.s2`，使用 `if` 指令根据请求的域名动态选择代理目标，然后将请求代理到相应的后端服务器。

这样，您可以通过不同的域名访问不同的后端服务，而无需修改系统的 hosts 文件。





# 参考资料

[nginx 一把梭！（超详细讲解+实操）](https://juejin.cn/post/7306041273822527514)

> [一个简单的Nginx入门案例](一个简单的Nginx入门案例)

https://juejin.cn/post/7293176193322729510

* any list
{:toc}
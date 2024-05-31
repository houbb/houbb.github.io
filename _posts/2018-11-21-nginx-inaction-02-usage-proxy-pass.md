---
layout: post
title:  Nginx 实战-02-nginx proxy_pass 服务代理访问 使用笔记 ubuntu nodejs
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


# 准备工作-HTTP 服务

我们简单起见，使用 node.js 启动一个简单的前端服务。

# ubuntu 如何安装 node.js

1. **更新包索引**：
   更新你的包索引列表以确保你安装的是最新版本的软件包。
   ```bash
   sudo apt update
   ```

2. **安装 Node.js**：
   使用 `apt` 安装 Node.js 和 npm（Node.js 的包管理器）。
   ```bash
   sudo apt install -y nodejs npm
   ```

   这将安装最新的 Node.js 和 npm 版本。

3. **验证安装**：
   安装完成后，你可以通过检查 Node.js 和 npm 的版本来验证安装是否成功。
   ```bash
   node -v
   npm -v
   ```

安装版本如下：

```
$ node -v
v12.22.9

$ npm -v
8.5.1
```

## nodejs 创建一个 http 服务

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



# 想通过 nginx 来代理访问这个 http 服务，应该如何配置实现？

要通过 Nginx 代理访问你的 Node.js HTTP 服务，你需要在 Nginx 的配置文件中设置一个代理服务器。

以下是配置 Nginx 以代理 Node.js 服务的步骤：

## 先看一下 nginx 的配置

默认的配置如下：

```
cat /etc/nginx/nginx.conf
```

如下：

```conf
$ cat /etc/nginx/nginx.conf
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

### 简单解释

这是一个 Nginx 的主配置文件，它包含了用于定义 Nginx 服务器行为的多种设置。

以下是配置文件中每一行的解释，其中注释行以 `#` 开头：

```conf
# 指定运行 Nginx 的用户和用户组
user www-data;

# 设置工作进程的数量，'auto' 会让 Nginx 根据 CPU 核心数自动设置
worker_processes auto;

# 指定 Nginx 进程的 PID 文件存放位置
pid /run/nginx.pid;

# 包含所有在 /etc/nginx/modules-enabled/ 目录下启用的模块配置文件
include /etc/nginx/modules-enabled/*.conf;

events {
    # 设置每个工作进程的最大连接数
    worker_connections 768;
    # 以下注释掉的选项可以启用或禁用多请求接受
    # multi_accept on;
}

http {
    ### 基础设置 ###

    # 开启高效文件传输模式
    sendfile on;
    # 开启 TCP 无推送选项，可以提高性能
    tcp_nopush on;
    # 设置类型hash桶的最大大小
    types_hash_max_size 2048;
    # 以下注释掉的选项可以关闭服务器版本号在错误页面和HTTP头部的显示
    # server_tokens off;

    # 设置服务器名称的hash桶大小
    # server_names_hash_bucket_size 64;
    # 禁止在重定向响应中出现服务器名称
    # server_name_in_redirect off;

    # 包含 MIME 类型配置文件
    include /etc/nginx/mime.types;
    # 默认的 MIME 类型
    default_type application/octet-stream;

    ### SSL 设置 ###

    # 设置 SSL/TLS 协议版本
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # 不支持 SSLv3，参考 POODLE 漏洞
    # 优先使用服务器端的加密套件
    ssl_prefer_server_ciphers on;

    ### 日志设置 ###

    # 定义访问日志的存放路径
    access_log /var/log/nginx/access.log;
    # 定义错误日志的存放路径
    error_log /var/log/nginx/error.log;

    ### Gzip 设置 ###

    # 开启 Gzip 压缩
    gzip on;
    # 以下注释掉的选项可以进一步配置 Gzip 压缩行为
    # gzip_vary on;
    # gzip_proxied any;
    # gzip_comp_level 6;
    # gzip_buffers 16 8k;
    # gzip_http_version 1.1;
    # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    ### 虚拟主机配置 ###

    # 包含 /etc/nginx/conf.d/ 目录下的所有配置文件
    include /etc/nginx/conf.d/*.conf;
    # 包含 /etc/nginx/sites-enabled/ 目录下的所有配置文件
    include /etc/nginx/sites-enabled/*;
}

#mail {
    # 下面的注释掉的链接提供了一个 Nginx 与 Apache/PHP 脚本进行 IMAP 认证的示例
    # 详见：http://wiki.nginx.org/ImapAuthenticateWithApachePhpScript
    #
    # auth_http localhost/auth.php;
    # pop3_capabilities "TOP" "USER";
    # imap_capabilities "IMAP4rev1" "UIDPLUS";
    #
    # server {
    #     listen     localhost:110;
    #     protocol   pop3;
    #     proxy      on;
    # }
    #
    # server {
    #     listen     localhost:143;
    #     protocol   imap;
    #     proxy      on;
    # }
#}
```

这个配置文件定义了 Nginx 服务器的基本运行参数，如用户、工作进程、PID 文件位置，以及事件处理、HTTP、SSL、日志、Gzip 压缩和虚拟主机包含的设置。被注释的部分可以通过去掉前面的 `#` 符号来启用。

此外，还有一个被注释掉的 `mail` 部分，这部分配置用于设置 IMAP/POP3 邮件服务的相关参数，但由于被注释掉了，所以不会生效。


## 修改配置

1. **编辑 Nginx 配置文件**：找到 Nginx 的主配置文件，通常位于 `/etc/nginx/nginx.conf` 或 `/etc/nginx/sites-available/default`（如果是使用 `sites-available` 和 `sites-enabled` 目录结构的话）。

2. **添加一个新的 `server` 块**：在配置文件中，你需要添加一个新的 `server` 块来配置代理设置。确保在正确的上下文（通常是 `http` 块内）添加此配置。

3. **配置代理**：在新的 `server` 块中，设置 `location` 部分以代理到你的 Node.js 服务。


这段配置是 Nginx 的一个 `server` 块，它定义了如何处理进入 Nginx 的 HTTP 请求，并将这些请求代理到一个 Node.js 服务上。下面是对这个配置块中每一行的详细解释：

```sh
sudo vi /etc/nginx/nginx.conf
```

```nginx
server {
    # 监听端口，这里指定 Nginx 监听 80 端口，这是 HTTP 默认端口
    listen 80;

    # 定义 server_name，这里使用的是 your_server_domain，它应该被替换为你的域名
    # 如果你是在本地测试，也可以使用 localhost 或 127.0.0.1
    server_name localhost;

    # location 块定义了匹配所有请求URI的规则
    location / {
        # proxy_pass 指令告诉 Nginx 将请求转发到指定的地址，这里是本地的 Node.js 服务
        proxy_pass http://127.0.0.1:3000;

        # proxy_http_version 指令指定代理请求使用的 HTTP 版本
        proxy_http_version 1.1;

        # proxy_set_header 指令用于设置代理请求的 HTTP 头部
        # Upgrade 头部用于处理 WebSocket 或 HTTP/2 等协议升级
        proxy_set_header Upgrade $http_upgrade;

        # Connection 头部用于指定连接选项，这里设置为 'upgrade' 以便处理协议升级
        proxy_set_header Connection 'upgrade';

        # Host 头部用于指定原始请求的 Host 值，这样后端服务就可以知道原始的请求主机
        proxy_set_header Host $host;

        # proxy_cache_bypass 指令告诉 Nginx 如果请求中包含 Upgrade 头部，则绕过缓存
        # 这通常用于 WebSocket 或其他需要维持持久连接的协议
        proxy_cache_bypass $http_upgrade;
    }
}
```

这个配置块的作用是将所有到达 Nginx 的 HTTP 请求（因为 `location /` 匹配所有 URI），通过代理转发到运行在 `127.0.0.1` 的 `3000` 端口上的 Node.js 服务。

它还特别处理了可能的协议升级，例如从 HTTP 切换到 WebSocket，这在开发需要实时通信功能的 Web 应用时非常有用。

请注意，如果你的 Node.js 服务运行在不同的 IP 地址或端口上，你需要相应地修改 `proxy_pass` 后面的地址。

同样，如果你打算使用基于路径的路由或更复杂的代理规则，你可能需要添加额外的 `location` 块来处理这些情况。

这里的关键指令是 `proxy_pass`，它告诉 Nginx 将所有进入这个 `location` 的请求转发到指定的 Node.js 服务地址。


注意：nginx 配置文件中 server 指令不允许在 http 块之外。您需要将 server 块移到 http 块内。

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
        server {
            # 监听端口，这里指定 Nginx 监听 80 端口，这是 HTTP 默认端口
            listen 80;

            # 定义 server_name，这里使用的是 your_server_domain，它应该被替换为你的域名
            # 如果你是在本地测试，也可以使用 localhost 或 127.0.0.1
            server_name localhost;

            # location 块定义了匹配所有请求URI的规则
            location / {
                # proxy_pass 指令告诉 Nginx 将请求转发到指定的地址，这里是本地的 Node.js 服务
                proxy_pass http://127.0.0.1:3000;

                # proxy_http_version 指令指定代理请求使用的 HTTP 版本
                proxy_http_version 1.1;

                # proxy_set_header 指令用于设置代理请求的 HTTP 头部
                # Upgrade 头部用于处理 WebSocket 或 HTTP/2 等协议升级
                proxy_set_header Upgrade $http_upgrade;

                # Connection 头部用于指定连接选项，这里设置为 'upgrade' 以便处理协议升级
                proxy_set_header Connection 'upgrade';

                # Host 头部用于指定原始请求的 Host 值，这样后端服务就可以知道原始的请求主机
                proxy_set_header Host $host;

                # proxy_cache_bypass 指令告诉 Nginx 如果请求中包含 Upgrade 头部，则绕过缓存
                # 这通常用于 WebSocket 或其他需要维持持久连接的协议
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
```

此时，已经变成了我们的 nodejs 信息。

另外，如果你的 Node.js 服务运行在不同于 `localhost` 的服务器上，或者监听的端口不是 `3000`，你需要相应地修改 `proxy_pass` 指令中的地址和端口号。





---------------------------------------------------------------------------


# chat

## ubuntu 如何安装 node.js

在 Ubuntu 系统上安装 Node.js，你可以选择使用官方二进制包、使用包管理器 `apt`、或者通过 Node Version Manager (nvm) 安装。以下是使用这些方法的步骤：

### 使用官方二进制包安装：

1. 访问 Node.js 官方下载页面：[https://nodejs.org/en/download/](https://nodejs.org/en/download/)，选择你要安装的版本（LTS 或 Current）。

2. 根据你的 Ubuntu 版本，下载相应的 `.deb` 或 `.tar.xz` 安装包。

3. 安装 `.deb` 包，使用以下命令（替换为你下载的文件名）：
   ```bash
   sudo dpkg -i node_v14.*_linux-x64.deb
   ```

### 使用 `apt` 包管理器安装：

1. 使用 `curl` 下载 NodeSource 存储库的安装脚本：
   ```bash
   curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   ```

   这里 `14.x` 是 Node.js 的版本号，你可以根据需要选择其他版本。

2. 安装 Node.js：
   ```bash
   sudo apt-get install -y nodejs
   ```

### 使用 Node Version Manager (nvm) 安装：

1. 首先，你需要安装 `nvm`。在终端运行以下命令来安装它：
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   ```

   这里 `v0.39.1` 是 `nvm` 的版本号，你可以根据需要选择其他版本。

2. 安装完成后，重启终端或者运行以下命令来使 `nvm` 命令生效：
   ```bash
   source ~/.bashrc
   ```

3. 使用 `nvm` 安装 Node.js：
   ```bash
   nvm install 14
   ```

   同样，`14` 是 Node.js 的版本号，你可以根据需要选择其他版本。

4. 切换使用安装的 Node.js 版本：
   ```bash
   nvm use 14
   ```

安装完成后，你可以通过运行以下命令来验证 Node.js 是否安装成功：

```bash
node -v
```

这应该会输出你安装的 Node.js 的版本号。同样，你也可以检查 `npm`（Node Package Manager）的版本：

```bash
npm -v
```

这将输出你安装的 `npm` 的版本号。

## 命令行安装

在 Ubuntu 系统中，你可以通过命令行使用 `apt` 包管理器安装 Node.js。以下是安装过程的详细步骤：

1. **更新包索引**：
   更新你的包索引列表以确保你安装的是最新版本的软件包。
   ```bash
   sudo apt update
   ```

2. **安装 Node.js**：
   使用 `apt` 安装 Node.js 和 npm（Node.js 的包管理器）。
   ```bash
   sudo apt install -y nodejs npm
   ```

   这将安装最新的 Node.js 和 npm 版本。

3. **验证安装**：
   安装完成后，你可以通过检查 Node.js 和 npm 的版本来验证安装是否成功。
   ```bash
   node -v
   npm -v
   ```

   这些命令将分别显示已安装的 Node.js 和 npm 的版本号。

4. **（可选）添加 Node.js 和 npm 到 PATH**：
   如果你发现 `node` 或 `npm` 命令未被识别，可能是因为它们没有被添加到系统的 PATH 环境变量中。你可以通过以下命令将它们添加到 PATH：
   ```bash
   sudo ln -s /usr/bin/nodejs /usr/bin/node
   sudo ln -s /usr/bin/npm /usr/bin/npm
   ```

   然后再次验证 Node.js 和 npm 是否安装成功。

5. **（可选）使用 Node Version Manager (nvm)**：
   如果你希望更灵活地管理 Node.js 版本，可以使用 nvm。首先安装 nvm：
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   ```

   然后按照提示，关闭并重新打开终端或者运行以下命令来使 nvm 生效：
   ```bash
   source ~/.bashrc
   ```

   使用 nvm 安装 Node.js 的特定版本：
   ```bash
   nvm install 14
   ```

   使用 nvm 切换到所安装的版本：
   ```bash
   nvm use 14
   ```

通过以上步骤，你应该能够在 Ubuntu 系统上通过命令行成功安装 Node.js。


## 想通过 nginx 来代理访问这个 http 服务，应该如何配置实现？

要通过 Nginx 代理访问你的 Node.js HTTP 服务，你需要在 Nginx 的配置文件中设置一个代理服务器。以下是配置 Nginx 以代理 Node.js 服务的步骤：

1. **编辑 Nginx 配置文件**：找到 Nginx 的主配置文件，通常位于 `/etc/nginx/nginx.conf` 或 `/etc/nginx/sites-available/default`（如果是使用 `sites-available` 和 `sites-enabled` 目录结构的话）。

2. **添加一个新的 `server` 块**：在配置文件中，你需要添加一个新的 `server` 块来配置代理设置。确保在正确的上下文（通常是 `http` 块内）添加此配置。

3. **配置代理**：在新的 `server` 块中，设置 `location` 部分以代理到你的 Node.js 服务。如果你的 Node.js 服务运行在 `localhost` 的 `3000` 端口上，配置可能如下所示：

   ```nginx
   server {
       listen 80; # 监听端口，可以是80或其他端口
       server_name your_server_domain; # 可以替换为你的域名

       location / {
           proxy_pass http://127.0.0.1:3000; # 你的 Node.js 服务地址
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   这里的关键指令是 `proxy_pass`，它告诉 Nginx 将所有进入这个 `location` 的请求转发到指定的 Node.js 服务地址。

4. **测试 Nginx 配置**：在保存配置文件之前，运行以下命令来测试 Nginx 配置是否有语法错误：

   ```bash
   sudo nginx -t
   ```

5. **重启 Nginx 服务**：如果 Nginx 配置测试通过，重启 Nginx 服务以应用新配置：

   ```bash
   sudo systemctl restart nginx
   ```

6. **通过 Nginx 访问 Node.js 服务**：现在，你可以通过 Nginx 服务器的 IP 地址或域名（如果配置了域名）加上相应的端口号（如果不使用默认的 80 端口）来访问你的 Node.js 服务。

请注意，如果你的 Node.js 应用使用的是 HTTPS 或者你希望 Nginx 处理 SSL 连接，那么你可能还需要在 Nginx 配置中添加 SSL 相关设置和证书。

另外，如果你的 Node.js 服务运行在不同于 `localhost` 的服务器上，或者监听的端口不是 `3000`，你需要相应地修改 `proxy_pass` 指令中的地址和端口号。


# 通过 ngnix 反向代理

我想通过访问 nginx 来到达 tomcat 的服务，怎么做呢？

## 修改配置

修改下配置文件 `nginx.conf` 即可: 

```
upstream local_tomcat {  
	server localhost:8081;  
}  

server {
	# 指定代理
	location / {  
       proxy_pass http://local_tomcat;  
    }  
    # 其他省略
}    
```

## 重新加载

此时我们修改了文件，是不是就意思着必须先关了nginx再重新启动了，其实不必，nginx可以重新加载文件的。

我们直接运行：

```
nginx -s reload  
```

如果不想直接加载，而只是想看看自己的配置文件有没有问题，可以直接输入:

```
nginx -t
```

## 访问

这样访问 [http://localhost/hello](http://localhost/hello) 和原来访问 tomcat 一个效果。

# 参考资料

[nginx 一把梭！（超详细讲解+实操）](https://juejin.cn/post/7306041273822527514)

> [一个简单的Nginx入门案例](一个简单的Nginx入门案例)

https://juejin.cn/post/7293176193322729510

* any list
{:toc}
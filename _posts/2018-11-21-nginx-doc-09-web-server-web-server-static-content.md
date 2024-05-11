---
layout: post
title:  Nginx R31 doc-09-Serving Static Content 静态内容
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
published: true
---


## 提供静态内容

配置 NGINX 和 NGINX Plus 以提供静态内容，使用类型特定的根目录，检查文件存在性，并进行性能优化。

本节介绍如何配置 NGINX 和 NGINX Plus 以提供静态内容，如何定义搜索请求文件的路径，如何设置索引文件，以及如何调整 NGINX 和 NGINX Plus 以及内核以实现最佳性能。

### 根目录和索引文件

root 指令指定将用于搜索文件的根目录。为了获得请求文件的路径，NGINX 将请求 URI 追加到 root 指令指定的路径中。该指令可以放置在 http {}、server {} 或 location {} 上下文中的任何级别。在下面的示例中，root 指令为虚拟服务器定义了根目录。它适用于所有未在 location {} 块中明确重新定义根目录的地方：

```nginx
server {
    root /www/data;

    location / {
    }

    location /images/ {
    }

    location ~ \.(mp3|mp4) {
        root /www/media;
    }
}
```

在这里，NGINX 在文件系统中的 /www/data/images/ 目录中搜索以 /images/ 开头的 URI。但是，如果 URI 以 .mp3 或 .mp4 扩展名结尾，NGINX 将在匹配的 location 块中定义的 /www/media/ 目录中搜索文件。

如果请求以斜杠结尾，则 NGINX 将其视为对目录的请求，并尝试在目录中查找索引文件。index 指令定义了索引文件的名称（默认值为 index.html）。继续上面的示例，如果请求 URI 是 /images/some/path/，并且如果存在 /www/data/images/some/path/index.html，则 NGINX 将返回该文件。如果不存在，则 NGINX 默认返回 HTTP 404（未找到）。要配置 NGINX 返回自动生成的目录列表，可以将 on 参数包含在 autoindex 指令中：

```nginx
location /images/ {
    autoindex on;
}
```

您可以在 index 指令中列出多个文件名。NGINX 按指定的顺序搜索文件，并返回它找到的第一个文件。

```nginx
location / {
    index index.$geo.html index.htm index.html;
}
```

此处使用的 $geo 变量是通过 geo 指令设置的自定义变量。该变量的值取决于客户端的 IP 地址。

要返回索引文件，NGINX 检查其是否存在，然后进行内部重定向，将索引文件的名称追加到基本 URI 中以获取新的 URI。内部重定向导致对位置的新搜索，可能会进入另一个位置，如下面的示例所示：

```nginx
location / {
    root /data;
    index index.html index.php;
}

location ~ \.php {
    fastcgi_pass localhost:8000;
    #...
}
```

在这里，如果请求中的 URI 是 /path/，并且 /data/path/index.html 不存在但 /data/path/index.php 存在，则对 /path/index.php 的内部重定向被映射到第二个位置。结果，请求被代理。

## 尝试多个选项

try_files 指令可以用于检查指定的文件或目录是否存在；如果存在，则 NGINX 进行内部重定向，如果不存在，则返回指定的状态码。

例如，要检查请求 URI 对应的文件是否存在，可以使用 try_files 指令和 $uri 变量，如下所示：

```nginx
server {
    root /www/data;

    location /images/ {
        try_files $uri /images/default.gif;
    }
}
```

文件以 URI 的形式指定，使用当前位置或虚拟服务器上下文中设置的 root 或 alias 指令进行处理。在这种情况下，如果原始 URI 对应的文件不存在，NGINX 将内部重定向到最后一个参数指定的 URI，并返回 /www/data/images/default.gif。

最后一个参数也可以是状态码（直接在等号之前）或位置的名称。在以下示例中，如果 try_files 指令的参数都不能解析为现有文件或目录，则返回 404 错误。

```nginx
location / {
    try_files $uri $uri/ $uri.html =404;
}
```

在下一个示例中，如果原始 URI 和附加的尾部斜杠的 URI 都不能解析为现有文件或目录，则将请求重定向到命名位置，该位置将请求传递给代理服务器。

```nginx
location / {
    try_files $uri $uri/ @backend;
}

location @backend {
    proxy_pass http://backend.example.com;
}
```

要了解更多信息，请观看“内容缓存”网络研讨会，了解如何显著提高网站的性能，并深入了解 NGINX 的缓存功能。


## 优化性能以提供内容

加载速度是提供任何内容的关键因素。对 NGINX 配置进行微小优化可能会提高生产力并帮助达到最佳性能。

### 启用 sendfile

默认情况下，NGINX 自己处理文件传输，并在发送之前将文件复制到缓冲区中。启用 sendfile 指令可消除将数据复制到缓冲区的步骤，并启用直接从一个文件描述符复制数据到另一个文件描述符。或者，为了防止一个快速连接完全占据工作进程，您可以使用 sendfile_max_chunk 指令来限制在单个 sendfile() 调用中传输的数据量（在此示例中，限制为 1 MB）：

```nginx
location /mp3 {
    sendfile           on;
    sendfile_max_chunk 1m;
    #...
}
```

### 启用 tcp_nopush

将 tcp_nopush 指令与 sendfile on; 指令一起使用。这使得 NGINX 在通过 sendfile() 获取数据块后立即将 HTTP 响应头部发送在一个数据包中。

```nginx
location /mp3 {
    sendfile   on;
    tcp_nopush on;
    #...
}
```

### 启用 tcp_nodelay

tcp_nodelay 指令允许覆盖 Nagle 算法，最初设计用于解决慢速网络中的小数据包问题。该算法将多个小数据包合并成一个较大的数据包，并在延迟 200 毫秒后发送数据包。如今，在提供大型静态文件时，无论数据包大小如何，数据都可以立即发送。延迟还会影响在线应用（ssh、在线游戏、在线交易等）。默认情况下，tcp_nodelay 指令设置为开启，这意味着 Nagle 算法已禁用。仅对保持活动的连接使用此指令：

```nginx
location /mp3  {
    tcp_nodelay       on;
    keepalive_timeout 65;
    #...
}
```

### 优化后台队列

重要因素之一是 NGINX 处理传入连接的速度。一般规则是，当建立连接时，它被放入“监听”套接字的“监听”队列中。在正常负载下，要么队列很小，要么根本没有队列。但在高负载下，队列可能会急剧增长，导致性能不均匀、连接丢失和延迟增加。

#### 显示监听队列

要显示当前的监听队列，请运行以下命令：

```bash
netstat -Lan
```

输出可能如下，其中显示在端口 80 的监听队列中有 10 个未接受的连接，而配置的最大值为 128 个排队连接。这种情况是正常的。

```bash
当前的监听队列大小（qlen/incqlen/maxqlen）
监听           本地地址
0/0/128        *.12345
10/0/128        *.80
0/0/128        *.8080
```

相比之下，在以下命令中，未接受的连接数量（192）超过了 128 的限制。当网站经历大量流量时，这种情况很常见。为了达到最佳性能，您需要增加可以排队等待 NGINX 接受的连接的最大数量，方法是在操作系统和 NGINX 配置中都增加此值。

```bash
当前的监听队列大小（qlen/incqlen/maxqlen）
监听           本地地址
0/0/128        *.12345
192/0/128        *.80
0/0/128        *.8080
```

#### 调整操作系统

将 net.core.somaxconn 内核参数的值从默认值（128）增加到足够大以处理大量流量的值。

在此示例中，将其增加到 4096。

对于 FreeBSD，运行以下命令：

```bash
sudo sysctl kern.ipc.somaxconn=4096
```

对于 Linux：

运行以下命令：

```bash
sudo sysctl -w net.core.somaxconn=4096
```

使用文本编辑器将以下行添加到 /etc/sysctl.conf：

```bash
net.core.somaxconn = 4096
```

#### 调整 NGINX

如果将 somaxconn 内核参数设置为大于 512 的值，请将 backlog 参数更改为 NGINX listen 指令以匹配：

```nginx
server {
    listen 80 backlog=4096;
    # ...
}
```

# 参考资料

https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/

* any list
{:toc}
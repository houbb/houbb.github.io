---
layout: post
title: Nginx-02-Nginx Ubuntu 安装 + windows10 + WSL ubuntu 安装 nginx 实战笔记
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [web-server, nginx, ubuntu, install, sh]
published: true
---

# windows10 + WSL ubuntu 安装 nginx 实战笔记

在Ubuntu上安装Nginx通常是一个相对简单的过程。你可以通过以下步骤进行安装：

1. 打开终端。
2. 运行以下命令以更新系统的软件包列表：

```bash
sudo apt update
```

3. 安装Nginx：

```bash
sudo apt install nginx
```

4. 安装完成后，可以使用以下命令启动Nginx服务：

```bash
sudo systemctl start nginx
```

5. 如果你希望Nginx在系统启动时自动启动，可以运行以下命令：

```bash
sudo systemctl enable nginx
```

现在，Nginx已经安装并运行在你的Ubuntu系统上。你可以通过在浏览器中输入服务器的IP地址或域名来验证是否成功安装。

如果一切顺利，你应该能够看到Nginx的欢迎页面。

6. 验证方式

浏览器的话，可以看到对应的欢迎页面。

```
$ curl http://localhost

<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

------------------------------------------------------------------------------------------------

# Nginx in Ubuntu

> [blog zh_CN](http://blog.csdn.net/qq_25689397/article/details/51480006)


- update

```
$   sudo apt-get update
```

> Install openssl

```
$   sudo apt-get install openssl
```

> Install PCRE

```
$   sudo apt-get install libpcre3 libpcre3-dev
```

> Install zlib

```
$   sudo apt-get install zlib1g-dev
```

> Download nginx

```
$   sudo apt-get install nginx

$   service nginx
```

- config nginx

如果你安装了 Apache ，并且此时 Apache 在运行，那么请先修改一下配置文件

```
sudo vim /etc/nginx/sites-available/default
```


修改如下:

```
server {
  #修改这里 我将 80 改为 88
 listen 88 default_server;
  #还有这里 同样改为你想要的监听端口
 listen [::]:88 default_server ipv6only=on;
```

> Usage

```conf
# nginx -c /etc/nginx/nginx.conf
关闭 nginx

# nginx -s stop
重读配置文件

# nginx -s reload
# pkill -HUP nginx
重新打开日志文件

# nginx -s reopen
# pkill -USR1 nginx
还可以下载 nginx RPM 包中的 /etc/init.d/nginx 文件，修改路径后即可使用：

# service nginx {start|stop|status|restart|reload|configtest|}
```

# 参考资料

> [tengine zh_CN](http://tengine.taobao.org/)

学习则以 tengine 为主。

* any list
{:toc}




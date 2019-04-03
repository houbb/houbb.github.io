---
layout: post
title: Nginx-02-Nginx Ubuntu 安装
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [web-server, nginx, ubuntu, install, sh]
published: true
---

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




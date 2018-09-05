---
layout: post
title:  Nginx
date:  2018-09-04 09:29:39 +0800
categories: [Distributed]
tags: [nginx, distributed, server, sh]
published: false
excerpt: Nginx 反向代理
---

# Nginx

[nginx [engine x]](https://nginx.org/en/) is an HTTP and reverse proxy server, 

a mail proxy server, and a generic TCP/UDP proxy server, originally written by Igor Sysoev.

## 特性

- 处理静态文件，索引文件以及自动索引；打开文件描述符缓冲．

- 无缓存的反向代理加速，简单的负载均衡和容错．

- FastCGI，简单的负载均衡和容错．

- 模块化的结构。

包括 gzipping, byte ranges, chunked responses,以及 SSI-filter 等 filter。如果由 FastCGI 或其它代理服务器处理单页中存在的多个 SSI，则这项处理可以并行运行，而不需要相互等待。

- 支持 SSL 和 TLSSNI．

# Docker Nginx 实战

## HTTP 服务

Nginx 的最大作用，就是搭建一个 Web Server。

有了容器，只要一行命令，服务器就架设好了，完全不用配置。

- 运行官方 image

```
$ docker container run \
  -d \
  -p 8080:80 \
  --rm \
  --name mynginx \
  nginx
```

参数说明：

```
-d：在后台运行
-p ：容器的80端口映射到127.0.0.1:8080
--rm：容器停止运行后，自动删除容器文件
--name：容器的名字为mynginx
```

- 访问

打开 [http://127.0.0.1:8080/](http://127.0.0.1:8080/)

内容如下：

```
Welcome to nginx!
If you see this page, the nginx web server is successfully installed and working. Further configuration is required.

For online documentation and support please refer to nginx.org.
Commercial support is available at nginx.com.

Thank you for using nginx.
```

## 映射网页目录

```
$ docker container run \
  -d \
  -p 127.0.0.1:8080:80 \
  --rm \
  --name mynginx \
  --volume "$PWD":/usr/share/nginx/html \
  nginx
```

直接访问 [http://127.0.0.1:8080/](http://127.0.0.1:8080/)，即可看到 `index.html` 内容。

# 拓展阅读

[docker 入门](https://houbb.github.io/2018/09/05/container-docker-hello)

# 参考资料

https://nginx.org/en/

http://wiki.jikexueyuan.com/project/nginx/characteristics.html

http://www.ruanyifeng.com/blog/2018/02/nginx-docker.html

* any list
{:toc}
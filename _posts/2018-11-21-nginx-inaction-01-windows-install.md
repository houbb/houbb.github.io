---
layout: post
title:  Nginx 实战-01-nginx windows 安装笔记
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


# 环境说明

本地 windows 安装 nginx

# 安装笔记

## 下载

访问 Nginx 官方网站的 Windows 版本页面：[https://nginx.org/en/docs/windows.html](https://nginx.org/en/docs/windows.html)

此处选择：https://nginx.org/download/nginx-1.26.0.zip

## 解压

下载后解压，如下：

```
cd D:\tool\nginx\nginx-1.26.0\nginx-1.26.0
λ ls
conf/  contrib/  docs/  html/  logs/  nginx.exe*  temp/
```

## 启动

```
start nginx # 启动服务
```

## 验证

```
>curl http://localhost/

<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
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

# chat

## windows 如何实现 nginx 安装

在 Windows 上安装 Nginx 相对简单，以下是基本步骤：

1. **下载 Nginx**：
   - 访问 Nginx 官方网站的 Windows 版本页面：[https://nginx.org/en/docs/windows.html](https://nginx.org/en/docs/windows.html)
   - 下载 Windows 版本的 Nginx。

2. **解压下载的文件**：
   - 将下载的 Nginx 压缩包解压到一个你希望安装 Nginx 的目录中，比如 `C:\nginx`。

3. **运行 Nginx**：
   - 打开命令提示符或 PowerShell。
   - 切换到 Nginx 的解压目录，例如，如果解压到了 `C:\nginx`，则输入 `cd C:\nginx`。
   - 启动 Nginx，运行以下命令：
     ```
     start nginx
     ```
   - 你可以通过浏览器访问 `http://localhost` 来检查 Nginx 是否正在运行。

4. **配置 Nginx**：
   - Nginx 的配置文件通常位于解压目录中的 `conf` 文件夹内，名为 `nginx.conf`。
   - 你可以编辑这个文件来设置服务器块、配置代理、添加 SSL 证书等。

5. **设置服务**（可选）：
   - 如果你希望 Nginx 作为 Windows 服务运行，可以使用以下命令来安装和启动服务：
     ```
     nginx -s stop # 停止当前运行的 Nginx
     nginx -s install # 安装为 Windows 服务
     start nginx # 启动服务
     ```

# 参考资料

[nginx 一把梭！（超详细讲解+实操）](https://juejin.cn/post/7306041273822527514)

> [一个简单的Nginx入门案例](一个简单的Nginx入门案例)

https://juejin.cn/post/7293176193322729510

* any list
{:toc}
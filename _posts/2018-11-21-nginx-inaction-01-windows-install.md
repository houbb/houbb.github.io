---
layout: post
title:  Nginx 实战-01-nginx windows 安装笔记
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---

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
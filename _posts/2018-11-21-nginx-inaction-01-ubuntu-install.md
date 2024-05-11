---
layout: post
title:  Nginx 实战-01-nginx ubuntu 安装笔记
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---

# 环境说明

本地 windows 使用 WSL

# 安装预构建的 Ubuntu 包

NGINX 为以下 Ubuntu 操作系统提供包：

| 版本   | 代号     | 支持的平台                   |
|--------|----------|------------------------------|
| 20.04  | focal    | x86_64, aarch64/arm64, s390x |
| 22.04  | jammy    | x86_64, aarch64/arm64, s390x |
| 22.10  | kinetic  | x86_64, aarch64/arm64        |
| 23.04  | lunar    | x86_64, aarch64/arm64        |

可以从以下位置安装该包：

- 默认的 Ubuntu 存储库。这是最快的方法，但通常提供的包已过时。

- nginx.org 上的官方存储库。第一次必须设置 apt-get 存储库，但之后提供的包始终是最新的。

# 从 Ubuntu 存储库安装预构建的 Ubuntu 包

1. 更新 Ubuntu 存储库信息：

```bash
sudo apt-get update
```

2. 安装包：

```bash
sudo apt-get install nginx
```

3. 验证安装：

```bash
sudo nginx -v
```

日志如下：

```
nginx version: nginx/1.18.0 (Ubuntu)
```

## 直接访问

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

# 常见操作命令

## 1. 查看状态

**查看 Nginx 状态**（检查是否正在运行）：

   ```bash
   sudo systemctl status nginx
   ```

如下：

```
 nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Sat 2024-05-11 10:38:03 CST; 4min 2s ago
       Docs: man:nginx(8)
    Process: 1537 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 1538 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 1645 (nginx)
      Tasks: 17 (limit: 9362)
     Memory: 18.0M
     CGroup: /system.slice/nginx.service
             ├─1645 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"
             ├─1648 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1649 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1650 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1651 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1652 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1653 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1654 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1655 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1656 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1657 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1658 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1659 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1660 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1661 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             ├─1662 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >
             └─1663 "nginx: worker process" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" >

May 11 10:38:03 d systemd[1]: Starting A high performance web server and a reverse proxy server...
```

## 2. 启停 nginx

### 启动 Nginx
   ```bash
   sudo systemctl start nginx
   ```

可以状态确认：

```
$ sudo systemctl status nginx

$ sudo systemctl status nginx
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Sat 2024-05-11 10:44:40 CST; 11s ago
       Docs: man:nginx(8)
    Process: 3631 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 3632 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 3633 (nginx)
      Tasks: 17 (limit: 9362)
     Memory: 14.1M
     CGroup: /system.slice/nginx.service
     ...
```

### 停止 Nginx

   ```bash
   sudo systemctl stop nginx
   ```

停止后查看状态：

```
$ sudo systemctl status nginx
○ nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: inactive (dead) since Sat 2024-05-11 10:43:42 CST; 2s ago
       Docs: man:nginx(8)
    Process: 3396 ExecStop=/sbin/start-stop-daemon --quiet --stop --retry QUIT/5 --pidfile /run/nginx.pid (code=exited,>
   Main PID: 1645 (code=exited, status=0/SUCCESS)

May 11 10:38:03 d systemd[1]: Starting A high performance web server and a reverse proxy server...
May 11 10:38:03 d systemd[1]: Started A high performance web server and a reverse proxy server.
May 11 10:43:42 d systemd[1]: Stopping A high performance web server and a reverse proxy server...
May 11 10:43:42 d systemd[1]: nginx.service: Deactivated successfully.
May 11 10:43:42 d systemd[1]: Stopped A high performance web server and a reverse proxy server.
```

### 重启

个人理解：重启=关闭+启动

```sh
sudo systemctl restart nginx
```

## 启动时自动运行 nginx

作用：可以让 ngix 是否在机器重启后服务自动运行。

5. **使 Nginx 在启动时自动运行**：
   ```bash
   sudo systemctl enable nginx
   ```

6. **禁止 Nginx 在启动时自动运行**：
   ```bash
   sudo systemctl disable nginx
   ```



# chat

## ubuntu 安装 nginx 之后，如何启停 nginx，常用命令有哪些？

在 Ubuntu 系统上安装 Nginx 之后，你可以通过以下命令来启动、停止和检查 Nginx 服务的状态：

1. **启动 Nginx**：
   ```bash
   sudo systemctl start nginx
   ```

2. **停止 Nginx**：
   ```bash
   sudo systemctl stop nginx
   ```

3. **重载 Nginx 配置**（在修改配置文件后，使更改生效）：
   ```bash
   sudo systemctl reload nginx
   ```

4. **查看 Nginx 状态**（检查是否正在运行）：
   ```bash
   sudo systemctl status nginx
   ```

5. **使 Nginx 在启动时自动运行**：
   ```bash
   sudo systemctl enable nginx
   ```

6. **禁止 Nginx 在启动时自动运行**：
   ```bash
   sudo systemctl disable nginx
   ```

7. **重启 Nginx 服务**：
   ```bash
   sudo systemctl restart nginx
   ```

此外，有时你可能需要检查 Nginx 的配置文件是否有语法错误，可以使用以下命令：

```bash
sudo nginx -t
```

如果配置正确，它会输出成功的消息；如果有错误，它会显示错误信息。





# 参考资料

[nginx 一把梭！（超详细讲解+实操）](https://juejin.cn/post/7306041273822527514)

> [一个简单的Nginx入门案例](一个简单的Nginx入门案例)

https://juejin.cn/post/7293176193322729510

* any list
{:toc}
---
layout: post
title: windows wsl2-05-docker 安装笔记
date: 2024-01-05 21:01:55 +0800
categories: [Windows]
tags: [windows, os, linux, wsl, sh]
published: true
---

# docker 基本信息查看

## 查看是否安装

检查 Docker 二进制文件是否存在

```sh
$ which docker
/snap/bin/docker
```

或检查 Docker 包是否安装（适用于 apt 安装）

```sh
$ dpkg -l | grep docker
```

## 查看 Docker 版本信息

```bash
# 查看完整版本信息（需要权限）
docker version

# 或仅查看客户端版本（无需权限）
docker --version
```

## 查看 Docker 系统信息

```bash
# 查看详细系统信息（需要权限）
docker info
```

## 检查 Docker 服务状态

```bash
# 检查 Docker 守护进程是否运行
sudo service docker status

# 或使用 systemctl（如果支持）
sudo systemctl status docker
```

查看如下：

```sh
$ sudo service docker status
Unit docker.service could not be found.
```

如何解决呢？

## wls 启用一下 systemd

WSL2 从 2022 年底开始支持 systemd，需要手动开启：

```bash
# 在 WSL 中执行
echo -e "[boot]\nsystemd=true" | sudo tee -a /etc/wsl.conf
```

然后 **重启 WSL**：

```powershell
# 在 Windows 的 PowerShell 中执行
wsl --shutdown
```

重新进入 WSL 后，确认 systemd 是否启动：

```bash
ps --no-headers -o comm 1
# 输出应为 systemd
```

## 重新安装 docker

WSL 中执行

```bash
sudo apt update
sudo apt install docker.io
```

## 再次验证

```
~$ service docker status
● docker.service - Docker Application Container Engine
     Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)
     Active: active (running) since Sat 2025-07-19 16:31:08 CST; 1min 30s ago
TriggeredBy: ● docker.socket
       Docs: https://docs.docker.com
   Main PID: 2143 (dockerd)
      Tasks: 14
     Memory: 22.2M
        CPU: 697ms
     CGroup: /system.slice/docker.service
             └─2143 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock

Jul 19 16:31:07 PC-20230404XHIO systemd[1]: Starting Docker Application Container Engine...
Jul 19 16:31:07 PC-20230404XHIO dockerd[2143]: time="2025-07-19T16:31:07.360965585+08:00" level=info msg="Starting up"
Jul 19 16:31:07 PC-20230404XHIO dockerd[2143]: time="2025-07-19T16:31:07.363910484+08:00" level=info msg="OTEL tracing >
Jul 19 16:31:07 PC-20230404XHIO dockerd[2143]: time="2025-07-19T16:31:07.442890058+08:00" level=info msg="Loading conta>
Jul 19 16:31:08 PC-20230404XHIO dockerd[2143]: time="2025-07-19T16:31:08.272889289+08:00" level=info msg="Default bridg>
Jul 19 16:31:08 PC-20230404XHIO dockerd[2143]: time="2025-07-19T16:31:08.488122519+08:00" level=info msg="Loading conta>
Jul 19 16:31:08 PC-20230404XHIO dockerd[2143]: time="2025-07-19T16:31:08.509578812+08:00" level=info msg="Docker daemon>
Jul 19 16:31:08 PC-20230404XHIO dockerd[2143]: time="2025-07-19T16:31:08.509985312+08:00" level=info msg="Daemon has co>
Jul 19 16:31:08 PC-20230404XHIO dockerd[2143]: time="2025-07-19T16:31:08.591416886+08:00" level=info msg="API listen on>
Jul 19 16:31:08 PC-20230404XHIO systemd[1]: Started Docker Application Container Engine.
```

ok!

# 账户加入到 docker 组

这样可以避免每次 sudo

```sh
# WSL 执行
$ sudo usermod -aG docker $USER
```

然后 重启 WSL：

```sh
# powershell 执行
wsl --shutdown
```

# 如何卸载

```sh
sudo apt purge docker.io
```

其他

```
sudo rm -rf /var/lib/docker
sudo groupdel docker 2>/dev/null
```

```
sudo apt autoremove
```


* any list
{:toc}
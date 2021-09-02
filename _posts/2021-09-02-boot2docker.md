---
layout: post
title: boot2docker  专门用于运行 Docker 容器
date: 2021-09-01 21:01:55 +0800
categories: [java]
tags: [java, sh]
published: true
---

# Boot2Docker 

Boot2Docker 已正式弃用且不再维护。 

建议用户从 Boot2Docker 过渡到 Docker Desktop（尤其是使用支持 Windows 10 Home 的新 WSL2 后端）。

如今，有很多工具旨在帮助启动环境，并且通过安装 Docker 以最少的努力启动和运行某些东西相对容易。

Boot2Docker 是一个轻量级的 Linux 发行版，专门用于运行 Docker 容器。 

它完全从 RAM 运行，大约需要 45MB 的下载量并且可以快速启动。

## 特征

- 最新的 Linux 内核、Docker 预安装和随时可用

- VM 来宾添加（VirtualBox、Parallels、VMware、XenServer）

- 通过 /var/lib/docker 上的磁盘自动挂载实现容器持久性

- 通过磁盘自动挂载的 SSH 密钥持久性

注意：Boot2Docker 使用端口 2376，即已注册的 IANA Docker TLS 端口

# 安装

安装应通过 Docker Toolbox 执行，该工具箱安装 Docker Machine、Boot2Docker VM 和其他必要工具。

ISO可以在这里下载。

# 如何使用

Boot2Docker 通过 Docker Machine（作为 Docker Toolbox 的一部分安装）使用，它利用 VirtualBox 的 VBoxManage 直接从命令行初始化、启动、停止和删除 VM。

# 参考资料

https://github.com/tesseract-ocr/tesseract

* any list
{:toc}
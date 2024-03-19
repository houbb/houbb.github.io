---
layout: post
title: Docker learn-10-boot2docker
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, sh]
published: true
---

# Boot2Docker

## 是什么

[boot2docker](https://github.com/boot2docker/boot2docker) is a lightweight Linux distribution made specifically to run Docker containers. 

It runs completely from RAM, is a ~45MB download and boots quickly.

## 为什么需要

在 Ubuntu 等环境，我们可以一键安装Docker(服务端、客户端)，但是在 Mac、Windows 环境却无法直接安装 Docker 服务端。

这种情况下，我们有3种选择：

1、在虚拟机安装 CentOS 或者 Ubuntu：比较费时。

2、使用 docker-for-mac 或者 docker-for-windows (仅Windows10专业版支持)客户端，这种体积会比较大，一般300M左右。可配置性不高，出了问题不好排查。

3、使用 boot2docker，配合 docker-machine 客户端，轻松部署Docker环境。需要提前安装VirtualBox(约90M)。（推荐，可玩性较高）

ps: 我们前面 windows 的安装就是基于这种方式实现的。

# Docker Quickstart Terminal

Docker Quickstart Terminal启动后会复制 `C:\Users\Administrator\.docker\machine\cache` 下的镜像boot2docker.iso到

`C:\Users\Administrator\.docker\machine\machines\default` 下面。

检测到默认的镜像不是最新版本的，需要到 https://github.com/boot2docker/boot2docker/releases 下载最新的，并复制到`C:\Users\Administrator\.docker\machine\cache`目录下。

ps：如果网速够快就不需要关心这些，如果网速较慢就可以手动下载。

# 参考资料

[http://boot2docker.io/](http://boot2docker.io/)

[基于boot2docker部署Docker环境](https://www.cnblogs.com/52fhy/p/8413029.html)

[Docker 更新boot2docker.iso](https://cloud.tencent.com/developer/article/1334570)

[Docker：Window上的Boot2Docker安装和入门](https://blog.csdn.net/qq_19674905/article/details/79816913)

https://blog.csdn.net/qq_19674905/article/details/79816913

[在 Windows 上可以用 Docker 吗？](http://www.docker.org.cn/docker/178.html)

[Docker---Windows系统上安装Boot2Docker以及安装的一些问题](https://blog.csdn.net/freeape/article/details/51173258)

[如何快速下载DockerToolbox？Boot2Docker？ 使用国内开源镜像站点](https://blog.csdn.net/csdn_duomaomao/article/details/72944525)

* any list
{:toc}
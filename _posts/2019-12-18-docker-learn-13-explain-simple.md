---
layout: post
title: Docker learn-13-深入浅出 Docker
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, sh]
published: true
---

# 容器的发展历史

![image](https://user-images.githubusercontent.com/18375710/71174451-30f9a400-22a0-11ea-9f99-e14d88428ba9.png)

# Docker 是什么 

Docker 是Docker.Inc 公司开源的⼀一个基于Linux Kernel Namespace/CGroups技术之上构建的 Container容器引擎, 源代码托管在GitHub 上, 基于Go语⾔言开发并遵从Apache2.0协议开源。

## 对比虚拟机

![image](https://user-images.githubusercontent.com/18375710/71174737-dca2f400-22a0-11ea-81b1-65708c0c88ae.png)

## Docker 的引擎

Libcontainer提供了本机Go实现，用于创建具有名称空间，cgroup，功能和文件系统访问控制的容器。

它使您可以管理创建容器后执行其他操作的容器的生命周期。

# Linux Containers

## CGroups 限制资源

- Cpu

- Memory

- Blkio

- Freezer

## Namespaces 隔离环境

MNT、PID、NET、IPC、USER、UTS

# 如何启动的

```
export GOPATH=$GOPATH:/your/path/to/libcontainer/vendor
cd libcontainer/nsinit && go get && make
mkdir /busybox
curl -sSL 'https://github.com/jpetazzo/docker-busybox/raw/buildroot-
2014.11/rootfs.tar' | tar -xC /busybox
cp libcontainer/sample_configs/minimal.json /busybox/container.json
cd /busybox
nsinit exec --tty --config container.json /bin/bash
```


# 参考资料

《肖德时-深入浅出Docker》

* any list
{:toc}
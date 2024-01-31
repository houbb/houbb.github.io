---
layout: post
title: 时序数据库-05-TDengine windows11 WSL 安装实战笔记 docker 
date:  2019-4-1 19:24:57 +0800
categories: [Database]
tags: [database, dis-database, distributed, time-series, in-action]
published: true
---

# 环境

windows11 WSL

# 实战笔记

## 说明

尝试了一下命令行直接安装，感觉有问题，还是按照官方的 docker 安装吧。

## docker 安装

```sh
sudo apt-get update
sudo apt-get install -y docker.io
```

验证

```
$ docker --version
Docker version 24.0.5, build 24.0.5-0ubuntu1~22.04.1
```


## docker 安装 TdEngine

指定版本

```bash
docker pull tdengine/tdengine:3.0.1.4
```

启动命令：

```bash
docker run -d -p 6030:6030 -p 6041:6041 -p 6043-6049:6043-6049 -p 6043-6049:6043-6049/udp tdengine/tdengine
```

PS：发现这个命令，会重新拉去最新版本的 tdengine/tdengine。

注意：TDengine 3.0 服务端仅使用 6030 TCP 端口。6041 为 taosAdapter 所使用提供 REST 服务端口。

6043-6049 为 taosAdapter 提供第三方应用接入所使用端口，可根据需要选择是否打开。

### docker 删除镜像

查看本地镜像

```bash
docker image ls
```

如下:

```
$ docker image ls
REPOSITORY          TAG       IMAGE ID       CREATED         SIZE
tdengine/tdengine   latest    f5210372598d   6 weeks ago     622MB
tdengine/tdengine   3.0.1.4   ad94f3c5dc66   16 months ago   236MB
```

删除本地镜像

```bash
docker rmi <镜像ID或镜像名称>
```

删除 3.0.1.4

```
docker rmi ad94f3c5dc66
```

### docker ps

启动查看：

```
$ docker ps
CONTAINER ID   IMAGE               COMMAND                  CREATED              STATUS              PORTS                                                                                                                                                                                                                NAMES
6649ff543d1d   tdengine/tdengine   "/tini -- /usr/bin/e…"   About a minute ago   Up About a minute   0.0.0.0:6030->6030/tcp, :::6030->6030/tcp, 0.0.0.0:6041->6041/tcp, :::6041->6041/tcp, 0.0.0.0:6043-6049->6043-6049/tcp, :::6043-6049->6043-6049/tcp, 0.0.0.0:6043-6049->6043-6049/udp, :::6043-6049->6043-6049/udp   admiring_pare
```


### 运行 client 

进入容器

```bash
docker exec -it 6649ff543d1d bash
```

然后输入 taos，进入命令行。

```
taos
```

### 基本命令

```
taos> show databases;
              name              |
=================================
 information_schema             |
 performance_schema             |
Query OK, 2 row(s) in set (0.002570s)
```

# 参考资料

https://github.com/taosdata/TDengine/blob/main/README-CN.md

* any list
{:toc}
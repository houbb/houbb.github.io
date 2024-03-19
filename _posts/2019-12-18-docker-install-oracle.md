---
layout: post
title:  Docker install Oracle 数据库教程笔记
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, oracle, sql]
published: true
---

# Docker 安装 Oracle

最近工作中用到 oracle 数据库，又不想直接安装 oracle。就尝试下使用 docker 安装 oracle 的方式。

- Mac 安装方式

> [mac os下使用 Docker安装 oracle数据库](https://www.jianshu.com/p/14000d16915c)

# 使用 Docker 方式安装
 
> [mac 下安装docker，在docker下安装oracle](https://blog.csdn.net/wangxinxinsj/article/details/77193491)

## Docker 安装

因为原来安装的有 Docker，此处使用 Docker 直接进行安装:

直接参考：[Docker](https://houbb.github.io/2016/10/15/docker)


- Version

```
$ docker version
Client:
 Version:	18.03.0-ce
 API version:	1.37
 Go version:	go1.9.4
 Git commit:	0520e24
 Built:	Wed Mar 21 23:06:22 2018
 OS/Arch:	darwin/amd64
 Experimental:	false
 Orchestrator:	swarm

Server:
 Engine:
  Version:	18.03.0-ce
  API version:	1.37 (minimum version 1.12)
  Go version:	go1.9.4
  Git commit:	0520e24
  Built:	Wed Mar 21 23:14:32 2018
  OS/Arch:	linux/amd64
  Experimental:	false
```

## 下载 Oracle镜像 

- 下载镜像

```
$   docker pull alexeiled/docker-oracle-xe-11g
```

- 执行结果

```
$ docker pull alexeiled/docker-oracle-xe-11g
Using default tag: latest
latest: Pulling from alexeiled/docker-oracle-xe-11g
759d6771041e: Pulling fs layer 
8836b825667b: Pulling fs layer 
c2f5e51744e6: Pulling fs layer 
a3ed95caeb02: Pulling fs layer 
787648ea7b44: Pull complete 
46f20000ce59: Pull complete 
2a190e47ca3f: Pull complete 
f8043f470a85: Pull complete 
0f6111a00dd6: Pull complete 
deacbfda2b11: Pull complete 
6eb979936fa3: Pull complete 
5194f2505f56: Pull complete 
a63e30990791: Pull complete 
994cf2ce199e: Pull complete 
5eba4c64e295: Pull complete 
01227e9ca0a6: Pull complete 
076b6fa27478: Pull complete 
d6407a7221b5: Pull complete 
bbc5a28168da: Pull complete 
dd783b45fa26: Pull complete 
0a686089bc7e: Pull complete 
73fac5e681c5: Pull complete 
afaede9e60b1: Pull complete 
a5d9cef8ef2a: Pull complete 
32bcfcf46e45: Pull complete 
aa896f927427: Pull complete 
f99ab5aba6e5: Pull complete 
Digest: sha256:35448e199115012a742ff9098da3287c666ce52d18efcf4658e0437892ed3ee6
Status: Downloaded newer image for alexeiled/docker-oracle-xe-11g:latest
```

 
## 启动镜像为一个容器

- 启动

启动镜像为一个容器，并命名为oracle

```
$   docker run -h "oracle" --name "oracle" -d -p 49160:22 -p 49161:1521 -p 49162:8080 alexeiled/docker-oracle-xe-11g
```

- 验证

执行命令 `$ docker ps`

内容如下：

```
CONTAINER ID        IMAGE                            COMMAND                  CREATED             STATUS              PORTS                                                                     NAMES
f517f0e8555b        alexeiled/docker-oracle-xe-11g   "/bin/sh -c /start.sh"   9 seconds ago       Up 9 seconds        0.0.0.0:49160->22/tcp, 0.0.0.0:49161->1521/tcp, 0.0.0.0:49162->8080/tcp   oracle
```

- 端口说明

| 端口号 | 说明 |
|:---|:---|
| 49160 | 用ssh连接对应的端口 | 
| 49161 | 连接sqlplus对应的端口 | 
| 49162 | 连接oem对应的端口 | 


- 本地 oracle 对应链接信息

| 属性 | 值 |
|:---|:---|
| hostname | localhost | 
| port | 49161 | 
| sid | xe | 
| username | system | 
| password | oracle | 
| SYS的密码 | oracle | 


## 运行 oracle 容器

执行命令：

```
$   docker exec -it f517f0e8555b  /bin/bash
```

其中 **f517f0e8555b** 是 oracle 的 CONTAINER ID。

## 登录 Oracle 

执行完上述命令后：

```
$ docker exec -it f517f0e8555b  /bin/bash
root@oracle:/# 

```

- 登录

直接输入 `sqlplus system/oracle`

```
root@oracle:/# sqlplus system/oracle
SQL*Plus: Release 11.2.0.2.0 Production on Sun Apr 22 06:41:08 2018

Copyright (c) 1982, 2011, Oracle.  All rights reserved.

ERROR:
ORA-28002: the password will expire within 7 days



Connected to:
Oracle Database 11g Express Edition Release 11.2.0.2.0 - 64bit Production
```

- 简单测试

执行一条简单的查询

```
SQL> select name from v$database;

NAME
---------
XE
```

# 小技巧

直接使用 docker terminal 可能不是很好使用。

可以使用 SecureCRT 等工具连接到 192.168.99.100 这个地址操作。

# 请求失败

## pull 镜像

```
$ docker pull alexeiled/docker-oracle-xe-11g                                                                                                
Using default tag: latest
Error response from daemon: pull access denied for alexeiled/docker-oracle-xe-11g, repository does not exist or may require 'docker login': denied: requested access to the resource is denied
docker@default:~$ docker query docker-oracle-xe-11g
```

## 查看对应的镜像

```
$ docker search docker-oracle-xe-11g                                                                                                        
NAME                                 DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
deepdiver/docker-oracle-xe-11g                                                       33                                      [OK]
epiclabs/docker-oracle-xe-11g        Customized Oracle XE 11g build for CI and de…   16                                      [OK]
arahman/docker-oracle-xe-11g         phusion/baseimage based spin off of alexei-l…   9                                       [OK]
pengbai/docker-oracle-xe-11g-r2      oracle xe 11g r2 with sql initdb and web con…   8                                       [OK]
konnecteam/docker-oracle-xe-11g      Fork of https://github.com/wnameless/docker-…   3                                       [OK]
rafaelri/docker-oracle-xe-11g        Fork from wnameless/docker-oracle-xe-11g        3                                       [OK]
ignatov/docker-oracle-xe-11g         Dockerfile of Oracle Database Express Editio…   3                                       [OK]
```

我们只看有星星的。

此处就选第一个好了。

## 重新拉取

```
$ docker pull deepdiver/docker-oracle-xe-11g
```


* any list
{:toc}
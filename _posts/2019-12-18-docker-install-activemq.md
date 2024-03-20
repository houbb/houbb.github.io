---
layout: post
title: Docker 安装 activeMQ 入门介绍
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [java, docker, mq, sh]
published: true
---

# Docker ActiveMQ

平时使用 activemq 就觉得安装还挺麻烦，懒得去弄。

现在使用 docker，简化这一操作。

## 基础知识

[Docker 入门介绍](https://houbb.github.io/2018/09/05/container-docker-hello)

[Active-MQ](https://houbb.github.io/2017/06/07/activemq)

# 安装命令

## 查询

- 命令

```
$   docker search activemq
```

- 结果

```
NAME                                     DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
webcenter/activemq                       ActiveMQ 5.14.3 with OpenJDK-jre-8-headless …   140                                     [OK]
rmohr/activemq                           Various versions of ActiveMQ neatly packet i…   54                                      [OK]
vromero/activemq-artemis                 ActiveMQ Artemis image (Debian and Alpine ba…   15                                      [OK]
...
```

直接选择第一个即可

## 拉取镜像

```
$   docker pull webcenter/activemq
```

## 镜像列表

- 命令

```
$   docker image list
```

- 结果

```
...
webcenter/activemq               latest              3af156432993        20 months ago       422MB
...
```
 
## 启动 activemq

```
docker run -d --name myactivemq -p 61616:61616 -p 8161:8161 webcenter/activemq
```

61616 是 activemq 的容器使用端口，8161 是 web 页面管理端口。

- 查看运行状态

```
$ docker ps
CONTAINER ID        IMAGE                COMMAND             CREATED             STATUS              PORTS                                                                                   NAMES
7a15fb8885d1        webcenter/activemq   "/app/run.sh"       4 seconds ago       Up 4 seconds        1883/tcp, 5672/tcp, 0.0.0.0:8161->8161/tcp, 61613-61614/tcp, 0.0.0.0:61616->61616/tcp   myactivemq
```

## 访问页面

浏览器输入 [http://127.0.0.1:8161/](http://127.0.0.1:8161/)，点击 Manage ActiveMQ broker 使用默认账号/密码：admin/admin 进入查看

* any list
{:toc}
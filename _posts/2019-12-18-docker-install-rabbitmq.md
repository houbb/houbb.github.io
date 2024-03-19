---
layout: post
title: Docker install RabbitMQ 教程笔记
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [java, docker, middle-ware, amqp, mq, sh]
published: true
---

# RabbitMQ

[RabbitMQ](http://www.rabbitmq.com/) is the most widely deployed open source message broker.

## 特性

# Homebrew 安装

Mac 可以使用 [Homebrew 安装 RabbitMQ](http://www.rabbitmq.com/install-homebrew.html)

## 下载

```sh
brew update

brew install rabbitmq
```

rabbitmq 的脚本会被下载到 `/usr/local/sbin` 目录下。

并没有被自动添加到 PATH 下，你可以手动做如下添加。

## 配置

添加如下的内容到 `.bash_profile` 或者 `.profile` 文件中。

```
PATH=$PATH:/usr/local/sbin
```

## 运行

使用 `rabbitmq-server` 运行 服务。 

# Docker RabbitMQ

还是使用下 Docker 来安装，免得时间久了忘记了这些东西。

## 拓展阅读

[Docker 入门介绍](https://houbb.github.io/2018/09/05/container-docker-hello)

## 拉取镜像

这里看以查看[标签](https://hub.docker.com/r/library/rabbitmq/tags/)

我们选择有管理界面的版本。

```
$   docker pull rabbitmq:management
```

## 运行容器

```
$   docker run -d --name myrabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

- 参数说明

```
-d 后台进程运行
--name myrabbitmq 容器名称
-p 15672:15672 http 访问端口
-p 5672:5672 amqp 访问端口
```

## 访问管理界面

使用 [http://127.0.0.1:15672](http://127.0.0.1:15672) 访问，用户名密码使用默认：guest/guest。

感觉界面风格还不错，赞。

![20180917-jms-rabbitmq-manage.jpg](https://raw.githubusercontent.com/houbb/resource/master/img/jms/20180917-jms-rabbitmq-manage.jpg)

# 参考资料

- 官方

http://www.rabbitmq.com/getstarted.html

https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/java

- docker

[docker环境下的RabbitMQ部署，Spring AMQP使用](https://my.oschina.net/lhztt/blog/790440)

[使用docker安装rabbitmq及遇到的问题](https://blog.csdn.net/qq_35981283/article/details/69648171)

[RabbitMQ系列（五）使用Docker部署RabbitMQ集群](https://www.cnblogs.com/vipstone/p/9362388.html)

* any list
{:toc}
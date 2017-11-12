---
layout: post
title:  Apache Kafka
date:  2017-8-9 09:32:36 +0800
categories: [Apache]
tags: [apache, kafka, mq]
published: true
---

# Apache Kafka

[Kafka™](http://kafka.apache.org/)  is used for building real-time data pipelines and streaming apps. 
It is horizontally scalable, fault-tolerant, wicked fast, and runs in production in thousands of companies.

> [入门简介](http://blog.csdn.net/tangdong3415/article/details/53432166)


# Introduction

[Introduction](http://kafka.apache.org/intro) 对 Kafka 进行了简单的解释。

Kafka 依赖于 [protocol](https://kafka.apache.org/protocol.html) 技术。

(此处概念暂时跳过)

# Quick Start

(此时测试环境为 windows)

一、Download and Unzip

[Download](http://kafka.apache.org/downloads) the zip file and then unzip at any place you like.

二、Start Server

1、依赖于 [ZooKeeper](https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html), 所以需要安装配置好并启动.

> [zookeeper 安装 windows环境](http://blog.csdn.net/morning99/article/details/40426133)

启动 zookeeper;

2、启动 kafka

```
.\bin\windows\kafka-server-start.bat .\config\server.properties
```

<label class="label label-danger">Error</label>

```
[D:\Learn\apache\kafka\kafka-0.11.0.0-src]$ .\bin\windows\kafka-server-start.bat .\config\server.properties
命令语法不正确。
错误: 找不到或无法加载主类 kafka.Kafka
```

几种方式都尝试了，依然失败！

> [Kafka集群配置---Windows版](http://blog.csdn.net/u013132051/article/details/68925935)

> [windows kafka安装及问题解决](http://blog.csdn.net/yuebao1991/article/details/72771599)




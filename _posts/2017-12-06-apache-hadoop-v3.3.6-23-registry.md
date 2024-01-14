---
layout: post
title:  Apache Hadoop v3.3.6-23-Hadoop Service Registry
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# Hadoop服务注册表

服务注册表是可以部署在Hadoop集群中的一项服务，允许部署的应用程序注册自身及其与其通信的方式。

客户端应用程序可以定位服务并使用绑定信息连接到服务的网络可访问端点，无论是REST、IPC、Web UI、Zookeeper quorum+path还是其他协议。目前，所有注册表数据都存储在一个Zookeeper集群中。

Architecture
Configuration
Using the Hadoop Service registry
Security
Registry DNS

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/registry/index.html

* any list
{:toc}
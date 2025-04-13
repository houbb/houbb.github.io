---
layout: post
title: 从零开始实现自己的 raft（二）技术选型
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFAJRaft, raft, sh]
published: true
---

# 前言

大家好，我是老马。

分布式系统中，一致性算法是最重要的基石，也是最难学习的部分。

这里是从零开始实现 raft 系列，今天我们简单介绍一下 raft 的技术选型。

# 核心能力

Raft 为了算法的可理解性，将算法分成了 4 个部分。

leader 选举

日志复制

成员变更

日志压缩

# 技术选型：

一致性模块，是 Raft 算法的核心实现，通过一致性模块，保证 Raft 集群节点数据的一致性。

这里我们需要自己根据论文描述去实现。

RPC 通信，可以使用 HTTP 短连接，也可以直接使用 TCP 长连接，考虑到集群各个节点频繁通信，同时节点通常都在一个局域网内，因此我们选用 TCP 长连接。而 Java 社区长连接框架首选 Netty，这里我们选用蚂蚁金服网络通信框架 SOFA-Bolt（基于 Netty），便于快速开发。

日志模块，Raft 算法中，日志实现是基础，考虑到时间因素，我们选用 RocksDB 作为日志存储。

状态机，可以是任何实现，其实质就是将日志中的内容进行处理。可以理解为 Mysql binlog 中的具体数据。

由于我们是要实现一个 KV 存储，那么可以直接使用日志模块的 RocksDB 组件。 

我们可以看到，得益于开源世界，我们开发一个 Raft 存储，只需要编写一个“一致性模块”就行了，其他模块都有现成的轮子可以使用，真是美滋滋。

# 拓展阅读

[RocksDB-01-Start](https://houbb.github.io/2018/09/06/cache-rocksdb-01-overview)

[SOFABolt 介绍-01-overview](https://houbb.github.io/2022/07/09/sofastack-sofabolt-01-overview)

# 参考资料


* any list
{:toc}
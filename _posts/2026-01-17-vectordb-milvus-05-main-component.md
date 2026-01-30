---
layout: post
title: 向量数据库 milvus 入门-05-主要组件
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---


# 主要组件

Milvus 集群由五个核心组件和三个第三方依赖项组成。每个组件都可以独立部署在 Kubernetes 上：

## Milvus 组件

- 协调器：可启用主从模式，以提供高可用性。
- 代理：每个集群一个或多个
- 流节点：每个集群一个或多个
- 查询节点：每个群集一个或多个
- 数据节点：每个群集一个或多个

## 第三方依赖

- 元存储：存储 Milvus 中各种组件的元数据，如 etcd。
- 对象存储： 负责 Milvus 中索引和二进制日志文件等大型文件的数据持久化，例如 S3
- WAL 存储：为 Milvus 提供先写日志（WAL）服务，如 woodpecker。
- 在啄木鸟零磁盘模式下，WAL直接使用对象存储和元存储，无需其他部署，减少第三方依赖。

## Milvus 部署模式

运行 Milvus 有两种模式：

### 独立运行

在一个进程中运行所有组件的 Milvus 单实例，适用于数据集小、工作量小的情况。 此外，在 Standalone 模式下，可以选择更简单的 WAL 实现，如 woodpecker 和 rocksmq，以消除对第三方 WAL 存储依赖的要求。

![独立架构](https://milvus.io/docs/v2.6.x/assets/standalone_architecture.png)

目前，即使 WAL 存储后端支持集群模式，也无法从 Milvus 独立实例在线升级到 Milvus 集群。

### 集群

Milvus 的一种分布式部署模式，每个组件独立运行，并可进行弹性扩展。这种设置适用于大型数据集和高负荷场景。

![分布式架构](https://milvus.io/docs/v2.6.x/assets/distributed_architecture.png)

## 下一步

- 阅读计算/存储分解，了解 Milvus 的机制和设计原理。

翻译自

## 想要更快、更简单、更好用的 Milvus SaaS服务 ？

Zilliz Cloud是基于Milvus的全托管向量数据库，拥有更高性能，更易扩展，以及卓越性价比
免费试用 Zilliz Cloud

##### 反馈

此页对您是否有帮助?


# 参考资料

https://milvus.io/docs/zh/main_components.md

* any list
{:toc}
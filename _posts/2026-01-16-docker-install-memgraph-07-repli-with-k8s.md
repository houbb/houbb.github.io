---
layout: post
title: memgraph-07-在 Kubernetes 上设置复制集群（Set up replication cluster with Kubernetes）
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---


# **在 Kubernetes 上设置复制集群（Set up replication cluster with Kubernetes）**

此指南针对希望在多个实例上设置 **数据复制（data replication）** 的 **Memgraph Community 版用户**。
如果你拥有 **Memgraph Enterprise 授权**，我们建议使用 **高可用性功能（high availability features）** 替代，它提供自动故障切换、负载均衡和更全面的集群管理能力。

Memgraph Community 目前 **没有内置用于复制的 Helm chart**。
只有 **高可用性（Enterprise）版** 提供官方 Helm 支持：
👉 [Memgraph HA Helm Chart](https://github.com/memgraph/helm-charts)

要使用 Community 版在 Kubernetes 上部署复制集群，你需要自行创建 Kubernetes manifests。

部署复制集群的一种常用方法是：

1. 参考 [Set up replication cluster with Docker](https://memgraph.com/docs/clustering/replication/setup-replication-cluster-docker) 了解所需的角色、端口和设置步骤
2. 使用 [Memgraph standalone Helm chart](https://github.com/memgraph/helm-charts) 或你自己的 Kubernetes manifests 来部署：

   * 一个 **MAIN 实例**
   * 一个或多个 **REPLICA 实例**
3. 通过客户端运行适当的 Cypher 命令（如 `SET REPLICATION ROLE`、`REGISTER REPLICA` 等）来配置复制

目前，本节主要作为 **手动在 Kubernetes 上部署 Memgraph Community 复制集群的参考**。

---

## **相关链接**

* 👉 [Set up replication cluster with Docker](https://memgraph.com/docs/clustering/replication/setup-replication-cluster-docker)
* 👉 [Best practices when setting up replication](https://memgraph.com/docs/clustering/replication/best-practices)


# 参考资料

https://memgraph.com/docs/clustering/replication/setup-replication-cluster-docker

* any list
{:toc}
---
layout: post
title: docker memgraph Clustering 如何实现集群？
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---


# **集群（Clustering）**

在集群配置中运行 Memgraph 可以提高任何图数据库应用的 **弹性（resilience）**、**容错性（fault-tolerance）** 以及 **可用性（uptime）**。

通过部署多个 Memgraph 实例，你可以确保在某些故障发生时系统仍然可以连续可用。

Memgraph 通过两个主要功能支持集群：

* **复制（Replication）** —— 在 **Memgraph Community（社区版）** 中可用
* **高可用性（High Availability，HA）** —— 在 **Memgraph Enterprise（企业版）** 中可用

在配置集群之前，我们强烈建议先阅读 Memgraph 中的 **复制工作原理指南**。

理解复制模式，并选择正确数量的实例至关重要，因为这些决策会直接影响集群的性能和可靠性。在本指南中，你将了解 Memgraph 复制的底层实现和理论概念，包括 **CAP 定理**、**复制模式** 以及 **同步机制**。

⚠️ **注意：** 当前复制和高可用性仅在 **内存事务性存储模式（in-memory transactional storage mode）** 下工作。

---

## **复制（Replication） ^{Community}**

Memgraph 社区版开箱即用提供复制功能。典型的复制设置包括：

* **MAIN 实例** — 处理读和写请求
* **REPLICA 实例** — 只读副本，用于扩展查询吞吐量

你可以运行任意数量的 REPLICA 实例来满足需求。然而，社区版**不提供自动故障切换（automatic failover）**；如果 MAIN 实例不可用，你需要手动操作将某个 REPLICA 升级为 MAIN。

要构建一个可靠的基于 Memgraph 社区版的架构，你需要自己处理故障切换逻辑，例如通过自定义工具或集成编排平台等方式。

在文档中 **复制部分** 将提供一步步的指南，带你设置复制集群。该方案适用于希望实现 **读扩展（read scaling）** 或拥有多个数据副本的用户。需要注意的是，**高可用性功能不包含在内**，因此需要你自行执行手动故障切换。

---

## **高可用性（High Availability） ^{Enterprise}**

Memgraph 企业版包含社区版的所有功能，并在此基础上添加了内建的 **高可用性管理**。一个企业版集群通常由以下实例组成：

* **MAIN 实例**
* **REPLICA 实例**
* **COORDINATOR 实例** — 使用 Raft 共识协议，负责集群状态管理和自动主节点选举

COORDINATOR 节点确保集群能够在发生故障时自动恢复，从而实现真正的 **24×7 不间断运行**，无须人工干预完成故障切换。

在文档中 **高可用性部分** 你将学习如何使用 Memgraph Enterprise 配置、管理和监控完整的 HA 集群，包括自动故障切换和协调节点管理。

---

## **概念与内部原理（Concepts & internals）**

如果你希望在配置集群之前或在设置过程中 **理解集群的底层机制**，这些概念指南将讲解 Memgraph 集群背后的理论与架构原理：

* **复制概念**
  学习 Memgraph 如何从分布式系统视角建模复制：**CAP 定理**、角色（MAIN / REPLICA）、复制模式（SYNC、ASYNC、STRICT_SYNC）、持久性（快照、写前日志 WAL、增量日志 deltas），以及副本如何恢复和保持同步。
  → *How replication works in Memgraph*

* **高可用性架构（企业版）**
  深入探讨 Memgraph 如何使用协调器实例、Raft 共识协议、健康检查、故障切换决策逻辑以及 RPO/RTO（数据恢复点与恢复时间）来实现自动故障切换和 24×7 可用性。
  → *How high availability works*

* **在 HA 集群中路由查询（企业版）**
  了解为什么在集群环境下单纯使用 `bolt://` 协议是不够的，以及如何通过 Bolt+routing（例如 `neo4j://`）与协调器协作，始终将写请求发送至当前 MAIN，并透明地将读请求路由到集群中的各个节点。
  → *Querying the cluster in high availability*

这些页面主要聚焦理论与架构层面的内容；下文部分则更关注如何实际配置和操作你的复制或高可用性集群。

---

## **常见问题（FAQ）**

此部分包含关于 Memgraph 集群、复制和高可用性最常见的问题及解答。

（FAQ 内容在原文页面也包含，该部分通常有若干问答条目，若你需要我翻译该 FAQ 的全部具体问答内容，请回复。）




# 参考资料

https://memgraph.com/docs/clustering

* any list
{:toc}
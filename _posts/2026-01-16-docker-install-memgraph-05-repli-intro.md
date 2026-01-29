---
layout: post
title: memgraph-05-Replication with Memgraph（使用 Memgraph 进行复制）
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---


# **使用 Memgraph 的复制功能（Replication with Memgraph）**

复制（Replication）允许你将数据从一个 Memgraph 实例（MAIN）复制到一个或多个 REPLICA 实例。
这样可以提升读取扩展性（read scalability）、提供额外的数据副本，以及降低单个节点故障的影响。

在一个复制设置中：

* **MAIN 实例** 处理读和写请求
* **REPLICA 实例** 只处理读操作，并持续从 MAIN 复制数据

复制适合以下场景：

* 希望横向扩展读取负载
* 需要数据的多个副本以提高弹性
* 能够自行管理手动故障切换和集群编排

本指南面向 **Memgraph Community 版本用户**，帮助你在多个实例之间设置数据复制。

若你拥有 **Memgraph Enterprise 授权**，我们强烈建议使用 **高可用性（High Availability）** 功能。

**高可用性（HA）** 构建在复制之上，并添加：

* 自动故障切换（无需人工提升副本）
* 基于 Raft 共识协议的协调器实例
* 内建路由以及更好的数据丢失保护
* 更稳定的平台以实现真正的 24×7 持续可用

在开始之前，我们建议先阅读 **复制底层原理** 部分，以理解复制的基本概念：角色（MAIN / REPLICA）、复制模式（SYNC、ASYNC、STRICT_SYNC）、持久性机制（快照、WAL、deltas）、以及副本恢复行为。

---

## **本章节内容（What you’ll find in this section）**

本“复制”部分主要关注于设置和操作一个复制集群的实用内容，可作为：

* 选择部署方式（Docker 或 Kubernetes）
* 应用可靠性与性能的最佳实践
* 使用可用命令管理与检查集群

---

## **复制底层原理（How replication works）**

本小节讲解 Memgraph 复制的底层工作原理，包括：

* CAP 定理的权衡
* MAIN 与 REPLICA 的角色
* 使用 deltas、WALs、快照复制数据
* 副本状态与恢复
* 复制模式（ASYNC、SYNC、STRICT_SYNC）及其保证
* 中断后副本如何追赶最新状态
* 多租户复制（Enterprise）
* 时间戳、epoch ID 以及持久化处理等内部细节

---

## **使用 Docker 设置复制集群（Set up replication cluster using Docker）**

创建一个本地复制集群，使用 Docker 运行一个 MAIN 和两个 REPLICA 实例，配置 SYNC/ASYNC 模式，并验证数据是否正确复制。

这是在本地试验或基于容器的简单部署的推荐起点。

---

## **使用 Kubernetes 设置复制集群（Set up replication cluster on K8s）**

使用自定义 Kubernetes manifests 或独立 Helm chart 在 Kubernetes 上部署复制集群。

目前官方暂未提供 Community 版的 Helm chart，因此本指南侧重于使用原始 Kubernetes manifests 与概念。

---

## **复制最佳实践（Replication best practices）**

提供关于选择复制模式、配置存储、硬件规格、设置标志位、管理手动故障切换，以及在 Memgraph Community 中安全运行复制的指南。

---

## **复制命令参考指南（Replication commands reference guide）**

列出所有 Community Edition 复制相关的命令，包括角色变更、副本注册、监控以及集群维护操作。

# 参考资料

https://memgraph.com/docs/clustering/replication

* any list
{:toc}
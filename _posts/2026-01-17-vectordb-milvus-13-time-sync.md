---
layout: post
title: 向量数据库 milvus 入门-13-timestamp 时间戳
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---


# 时间同步

本主题介绍 Milvus 的时间同步机制。

## 概述

Milvus 中的事件一般可分为两类：
- 数据定义语言（DDL）事件：创建/删除 Collections、创建/删除分区等。
- 数据操作语言（DML）事件：插入、搜索等。

任何事件，不管是 DDL 还是 DML 事件，都标有时间戳，可以表明事件发生的时间。

假设有两个用户在 Milvus 中发起了一系列 DML 和 DDL 事件，时间顺序如下表所示。

| 时间戳 | 用户 1 | 用户 2 |
| :--- | :--- | :--- |
| t0 | 创建了名为`C0`的 Collections . | / |
| t2 | / | 在 Collections`C0`上进行搜索 . |
| t5 | 将数据`A1`插入 Collections`C0`. | / |
| t7 | / | 在 Collections`C0`上进行搜索 . |
| t10 | 将数据`A2`插入 Collections`C0`. | / |
| t12 | / | 对 Collections 进行搜索`C0` |
| t15 | 从 Collections`C0`中删除数据`A1`. | / |
| t17 | / | 对 Collection 进行搜索`C0` |

理想情况下，用户 2 应该能够看到：
- 一个空的 Collections `C0` at `t2`。
- 数据 `A1` ，网址 `t7`。
- 数据 `A1` 和 `A2` 均位于 `t12`。
- 只有数据 `A2` at `t17` （因为数据 `A1` 在此之前已从 Collections 中删除）。

当只有一个节点时，这种理想情况很容易实现。然而，Milvus 是一个分布式向量数据库，为了确保不同节点中的所有 DML 和 DDL 操作都能保持有序，Milvus 需要解决以下两个问题：

1.  上面例子中的两个用户如果在不同的节点上，他们的时间时钟是不同的。例如，如果用户 2 比用户 1 晚 24 小时，那么用户 1 的所有操作都要到第二天才能被用户 2 看到。
2.  可能存在网络延迟。如果用户 2 在 `t17` 对 Collections `C0` 进行搜索，Milvus 应该能保证 `t17` 之前的所有操作都被成功处理并完成。如果 `t15` 上的删除操作因网络延迟而延迟，那么用户 2 在 `t17` 上进行搜索时，很有可能仍能看到本应删除的数据 `A1`。

因此，Milvus 采用时间同步系统（timetick）来解决这些问题。

## 时间戳甲骨文（TSO）

为了解决上一节提到的第一个问题，Milvus 和其他分布式系统一样，提供了时间戳甲骨文（TSO）服务。

这意味着 Milvus 中的所有事件都必须分配一个来自 TSO 而非本地时钟的时间戳。

TSO 服务由 Milvus 中的根协调器提供。客户端可以在单个时间戳分配请求中分配一个或多个时间戳。

TSO 时间戳是一种 `uint64` 值，由物理部分和逻辑部分组成。下图展示了时间戳的格式。

![TSO_Timestamp](https://milvus.io/docs/v2.6.x/assets/TSO_Timestamp.png).

如图所示，开头的 46 位是物理部分，即以毫秒为单位的 UTC 时间。最后 18 位是逻辑部分。

## 时间同步系统（timetick）

本节以数据插入操作为例，解释 Milvus 的时间同步机制。

当代理收到 SDK 的数据插入请求时，它会根据主键的哈希值将插入信息分成不同的信息流 (MsgStream) 。

每条插入信息 (InsertMsg) 在发送到 `MsgStream` 之前都会被分配一个时间戳。
> `MsgStream` 是消息队列的封装器，在 Milvus 2.0 中默认为 Pulsar。

![timesync_proxy_insert_msg](https://milvus.io/docs/v2.6.x/assets/timesync_proxy_insert_msg.png)

一般原则是，在 `MsgStream` 中，来自同一代理的 `InsertMsgs` 的时间戳必须是递增的。但是，来自不同代理的 `InsertMsgs` 的时间戳却没有这样的规则。

下图是 `InsertMsgs` 在 `MsgStream` 中的示例。该代码段包含五个 `InsertMsgs` ，其中三个来自 `Proxy1` ，其余来自 `Proxy2` 。

![msgstream](https://milvus.io/docs/v2.6.x/assets/msgstream.png)

来自 `Proxy1` 的三个 `InsertMsgs` 的时间戳是递增的，来自 `Proxy2` 的两个 `InsertMsgs` 的时间戳也是递增的。但是，`Proxy1` 和 `Proxy2` `InsertMsgs` 之间没有特定的顺序。

一种可能的情况是，当从 `Proxy2` 读取时间戳为 `110` 的信息时，Milvus 发现从 `Proxy1` 读取时间戳为 `80` 的信息仍在 `MsgStream` 中。因此，Milvus 引入了一个时间同步系统 timetick，以确保从 `MsgStream` 读取信息时，必须消耗掉所有时间戳值较小的信息。

![时间同步](https://milvus.io/docs/v2.6.x/assets/time_synchronization.png)

如上图所示：
- 每个代理定期（默认情况下每 200 毫秒一次）向 Root coord 报告 `MsgStream` 中最新 `InsertMsg` 的最大时间戳值。
- Root coord 会识别该 `Msgstream` 上的最小时间戳值，无论该 `InsertMsgs` 属于哪个代理。然后，Root coord 将这个最小时间戳插入 `Msgstream` 。这个时间戳也称为 timetick。
- 当消费者组件读到 Root coord 插入的时间戳时，就会明白所有时间戳值较小的插入信息都已被消耗。因此，可以在不中断订单的情况下安全地执行相关请求。

下图是 `Msgstream` 插入时间刻度的示例。

![时间戳](https://milvus.io/docs/v2.6.x/assets/timetick.png)

`MsgStream` 根据时间刻度分批处理报文，以确保输出的报文符合时间戳的要求。在上例中，除了来自 的 外，它将在 处消耗所有记录，因为它在最新的 TimeTick 之后。`Proxy2 InsertMsgs Timestamp: 120`

## 下一步

- 了解时间戳的概念。
- 了解 Milvus 的数据处理工作流程。

翻译自

## 想要更快、更简单、更好用的 Milvus SaaS服务 ？

Zilliz Cloud是基于Milvus的全托管向量数据库，拥有更高性能，更易扩展，以及卓越性价比
免费试用 Zilliz Cloud

##### 反馈

此页对您是否有帮助?


# 参考资料

https://milvus.io/docs/zh/time_sync.md


* any list
{:toc}
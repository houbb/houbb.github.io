---
layout: post
title: Ocean Base-02-技术概览
date:  2019-11-20 11:18:30 +0800
categories: [Database]
tags: [database, distributed-database, olap, oltp, htap, sh]
published: true
---

# 技术概览

## 整体架构图

OceanBase 采用 Share-Nothing 架构，各个节点之间完全对等，每个节点都有自己的 SQL 引擎和存储引擎。

OceanBase 的整个设计里没有任何的单点，这就从架构上解决了高可靠和高可用的问题。

![ocean-base](https://gw.alipayobjects.com/mdn/ob_asset/afts/img/A*AA2VQqV4TEMAAAAAAAAAAABjAQAAAQ/original)

## 大表

一张大表，实际上会通过分区进行拆分开。

然后通过拆分为众多的小表，从而可以部署在多台机器上。

扩容进行 re-balance 的时候，基本上可以做到不影响线上的业务。

## 事务提交

根据 paxos 算法，只需要过半通过即可。

本地落盘成功，且另一个机器 ack 成功。（过半）

只会在 commit 的一瞬间进行加锁。

## group-commit 

可以通过对多个事务，放在同一组中进行提交。

并行执行语句，来提升性能。

## 表格组

对于分布式的聚合开销如何尽可能的降低？

（1）异步提交

（2）采用表格组，尽可能将事务放在一台物理机上。从而避免跨机器事务。

# 性能优化

## plan 变形

任何一个 sql 写出来之后，plan 变形是非常重要的一步，决定了后续的其他优化特性。

## 并行查询

类似于 map-reduece  的思想，hive/hadoop 这种处理方式、

# route-server

这个是中心化的？还是去中心化的？

答案是后者。

即使 route-server 挂掉了，也没有关系。

有些类似于路由器的自学习更新。

# OLAP/ALTP 鱼和熊掌能否兼得？

## 读优先

可以读从库，指定。

## 回流

可以提供数据回流机制，将数据信息引入到 OLAP 工具。

比如 hadoop/spark 等分析框架。

# 锁

## 行级锁

所有的锁都是基于内存的。

## 如何解决热点问题

- 事务

加锁

修改

commit

## pre-commit 

会在 commit 阶段加一个状态 pre-commit。

如果是这个状态，那么后续的事务是可以获取到这个锁的。

但是这里加了个强依赖，事务依赖。

所有后续的事务成功，都是基于前面的 pre-commit 成功之后才会成功。

这里也可以结合 group-commit。

## 额外开销

roll-back 失败时，如果最初的失败，则后续的都会失败。

# 持久化

## LSM

基于 LSM 进行持久化。

所有的增量都是直接放在内存中，然后通过顺序写。

## 优点

- online=dll

- merger 压缩

3副本，mysql 2 副本。体积是 mysql 的 40%


## 内存规划

2M 作为最小的内存块。

所有的操作都是随机读，顺序写。

通过 GC 回收废弃的块，将其放在 Free-list 中。

## 旧数据的修改-COW

通过 COW 进行处理。

新数据通过 AOF 的方式处理。

## 数据的安全性

- 备份

- 回收站

- 闪回

undo

redo

就是一个状态机的处理。


# 数据同步迁移问题

## 核心流程

Oracle ----- OceanBase

二者互为备库，然后相互同步。

BIZ 系统可以通过 DNS 访问二者。

## 主备切换

## 数据校验

分钟级别

全量级别

用户自定义（指定字段 sum 等）

## ob-replay

进行数据的回放。

## 整体预案

全量：放在队列中，因为存在延迟。然后轮训，如果超过指定时间（阈值），则进行报警。

增量：通过 c-log 进行同步。

# 拓展对比

[TiDB](https://houbb.github.io/2019/03/15/database-tidb)

[Polar DB]()

## 分布式

[paxos](https://houbb.github.io/2018/10/30/paxos)

[consistent-hash](https://houbb.github.io/2018/08/13/consistent-hash)

# 参考资料

[OceanBase快速入门指南](https://oceanbase.alipay.com/docs/oceanbase/OceanBase%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8%E6%8C%87%E5%8D%97)

* any list
{:toc}

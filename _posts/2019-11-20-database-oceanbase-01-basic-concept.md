---
layout: post
title: Ocean Base-01-基本概念
date:  2019-11-20 11:18:30 +0800
categories: [Database]
tags: [database, distributed-database, olap, oltp, htap, sh]
published: true
---

# 基本概念

## Zone（Availabilty Zone，区，可用性区）

一个OceanBase集群，由若干个Zone组成。

Zone的含义是可用性区，通常指一个机房（数据中心，IDC）。

为了数据的安全和高可用性，一般会把数据的多个副本分布在多个Zone上。

这样，对于OB来说，可以实现单个Zone的故障不影响数据库服务。

一个Zone包括若干物理服务器。

Zone是AvailabilityZone的简写。

## Server（OBServer，OB服务器）

Server是一个OB的服务进程，一般独占一台物理服务器。

所以，通常也用observer指代其所在的物理机。

在OB内部，server由其IP地址和服务端口唯一标识。


## 租户

OceanBase通过租户实现资源隔离，采用“单集群多租户”的管理模式。

在一个OceanBase数据库集群之中，可以提供多个数据库服务的实例，每个数据库服务的实例不感知其他实例的存在。

这些不同的实例，每一个叫做一个租户。租户拥有一组计算和存储资源，提供一套完整独立的数据库服务。

OceanBase 上有系统租户和用户租户。

系统租户下存放OceanBase数据库管理的各种内部元数据信息；用户租户下存放用户的各种数据和数据库元信息。


## 资源池（Resource Pool）

一个租户拥有若干个资源池，这些资源池的集合描述了这个租户所能使用的所有资源。

一个资源池由具有相同资源规格（Unit Config）的若干个UNIT（资源单元）组成。

一个资源池只能属于一个租户。

每个UNIT描述了位于一个Server上的一组计算和存储资源，可以视为一个轻量级虚拟机，包括若干CPU资源，内存资源，磁盘资源等。

一个租户在同一个Server上最多有一个UNIT。

实际上，从概念上讲，副本是存储在UNIT之中，UNIT是副本的容器。


## 数据库（Database）

数据库是按数据结构来组织、存储和管理数据的仓库。数据库下包括若干表、索引，以及数据库对象的元数据信息。

## 表（Table）

最基本的数据库对象，OB的表都是关系表。

每个表由若干行记录组成，每一行有相同的预先定义的列。

用户通过SQL语句对表进行增、删、查、改等操作。通常，表的若干列会组成一个主键，主键在整个表的数据集合内唯一。

## 分区（Partition）

分区是物理数据库设计技术，它的操作对象是表。

实现分区的表，我们称之为分区表。表分布在多个分区上。

当一个表很大的时候，可以水平拆分为若干个分区，每个分区包含表的若干行记录。

根据行数据到分区的映射关系不同，分为hash分区，range分区（按范围），key分区等。

每一个分区，还可以用不同的维度再分为若干分区，叫做二级分区。

例如，交易记录表，按照用户ID分为若干hash分区，每个一级hash分区再按照交易时间分为若干二级range分区。

## TableGroup

表格组。

每个表都可能有自己所属的表格组。

TableGroup是一个逻辑概念，它和物理数据文件没有关联关系，TableGroup只影响表分区的调度方法，OceanBase会优先把属于同一个TableGroup的相同分区号的调度，调度到同一台节点上，以减少跨节点分布式事务。

## OBProxy

OceanBase1.0云版本中，应用访问数据库使用MySQL多种语言的客户端来访问OceanBase, OceanBase以服务的形式提供给应用访问。

OBProxy就是满足此种需求，方便应用使用不同语言的MySQL客户端访问OceanBase，它接收客户端的应用请求，并转发给OBServer，然后OBServer将数据返回给OBProxy, OBProxy将数据转发给应用客户端。

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


# 

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

---
layout: post
title: HBase-01-Overview
date:  2019-4-16 10:55:13 +0800
categories: [Database]
tags: [database, big-data, overview, sh]
published: true
---

# HBase

[Apache HBase™](http://hbase.apache.org/#) 是Hadoop数据库，是一个分布式，可扩展的大数据存储。

当您需要对大数据进行随机，实时读/写访问时，请使用Apache HBase™。 

该项目的目标是托管非常大的表 - 数十亿行X百万列 - 在商品硬件集群上。 

Apache HBase是一个开源的，分布式的，版本化的非关系数据库，模仿Google的Bigtable：Chang等人的结构化数据分布式存储系统。 

正如Bigtable利用Google文件系统提供的分布式数据存储一样，Apache HBase在Hadoop和HDFS之上提供类似Bigtable的功能。

# 特性

HBase 具有如下特性：

强一致性读写：HBase 不是“eventually consistent（最终一致性）”数据存储。这让它很适合高速计数聚合类任务；

自动分片(Automatic sharding)： HBase 表通过 region 分布在集群中。数据增长时，region 会自动分割并重新分布；

RegionServer 自动故障转移；

Hadoop/HDFS 集成：HBase 支持开箱即用地支持 HDFS 作为它的分布式文件系统；

MapReduce： HBase 通过 MapReduce 支持大并发处理；

Java 客户端 API：HBase 支持易于使用的 Java API 进行编程访问；

Thrift/REST API：HBase 也支持 Thrift 和 REST 作为非 Java 前端的访问；

Block Cache 和 Bloom Filter：对于大容量查询优化， HBase 支持 Block Cache 和 Bloom Filter；

运维管理：HBase 支持 JMX 提供内置网页用于运维。

# HBase 的应用场景

HBase 不适合所有场景。

首先，确信有足够多数据，如果有上亿或上千亿行数据，HBase 是很好的备选。

如果只有上千或上百万行，则用传统的RDBMS 可能是更好的选择。因为所有数据可以在一两个节点保存，集群其他节点可能闲置。

其次，确信可以不依赖所有 RDBMS 的额外特性（例如，列数据类型、 第二索引、事务、高级查询语言等）。

第三，确信你有足够的硬件。因为 HDFS 在小于5个数据节点时，基本上体现不出它的优势。

虽然，HBase 能在单独的笔记本上运行良好，但这应仅当成是开发阶段的配置。

# Hbase 的优缺点

## Hbase 的优点：

列的可以动态增加，并且列为空就不存储数据，节省存储空间

Hbase 自动切分数据，使得数据存储自动具有水平扩展

Hbase 可以提供高并发读写操作的支持

与 Hadoop MapReduce 相结合有利于数据分析

容错性

版权免费

非常灵活的模式设计（或者说没有固定模式的限制）

可以跟 Hive 集成，使用类 SQL 查询

自动故障转移

客户端接口易于使用

行级别原子性，即，PUT 操作一定是完全成功或者完全失败

## Hbase 的缺点：

不能支持条件查询，只支持按照 row key 来查询

容易产生单点故障（在只使用一个 HMaster 的时候）

不支持事务

JOIN 不是数据库层支持的，而需要用 MapReduce

只能在逐渐上索引和排序

没有内置的身份和权限认证

# HBase 与 Hadoop/HDFS 的差异

HDFS 是分布式文件系统，适合保存大文件。官方宣称它并非普通用途文件系统，不提供文件的个别记录的快速查询。

另一方面，HBase 基于 HDFS，并能够提供大表的记录快速查找和更新。

这有时会可能引起概念混乱。HBase 内部将数据放到索引好的“StoreFiles”存储文件中，以便提供高速查询，而存储文件位于 HDFS中。

如果想了解 HBase 更深层次的内容，推荐阅读 Lars George 的《HBase: The Definitive Guide》。

# 参考资料

[HBase教程](https://www.yiibai.com/hbase/)

[Apache HBase 入门教程](http://www.importnew.com/21958.html)

* any list
{:toc}












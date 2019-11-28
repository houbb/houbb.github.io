---
layout: post
title: POLARDB-00-overview
date:  2019-11-20 11:18:30 +0800
categories: [Database]
tags: [database, distributed-database, olap, oltp, htap, sh]
published: true
---

# 云数据库 POLARDB  视频简介

POLARDB 是阿里巴巴自主研发的下一代关系型分布式云原生数据库，目前兼容三种数据库引擎：MySQL、PostgreSQL、高度兼容Oracle语法。 

计算能力最高可扩展至 1000 核以上，存储容量最高可达 100T。

经过阿里巴巴双十一活动的最佳实践，让用户既享受到开源的灵活性与价格，又享受到商业数据库的高性能和安全性。

# 业界领先的优势

## 海量存储，享受云原生技术的普惠

POLARDB支持最大容量100T，最多可横向扩展16个节点，每个节点最高88 vCPU，Serverless分布式存储空间根据数据量自动伸缩，仅须为实际使用的容量付费。

## 澎湃性能，极速弹性应对突增负载

采用计算&存储分离架构，大幅提升了资源利用率与性能。

高并发场景下相比传统MySQL性能最高提升6倍，单节点最高100万QPS，增加计算节点只需5分钟，快速弹性应对突发业务负载。

## 稳如磐石，数据安全永远是第一位

POLARDB采用“一主多从”架构，同一实例的所有读写和只读节点都访问存储上同一个数据副本。

可实现主备切换0数据丢失，彻底解决异步复制带来的主备节点数据非强一致缺陷，几分钟内即可扩展只读副本，备份和恢复数据。

## 兼容并包，引领全球数字化转型

兼容多款流行的关系型数据库，完全兼容 MySQL/PostgreSQL，不需要修改代码/应用，高度兼容 Oracle语法。

# 拓展对比

[TiDB](https://houbb.github.io/2019/03/15/database-tidb)

[Ocean Base]()

# 参考资料

[polardb](https://www.aliyun.com/product/polardb)

[OceanBase、X-DB、POLARDB 分布式关系型数据库，各自的优势是什么？有什么区别？](https://www.zhihu.com/question/273663930)

* any list
{:toc}

---
layout: post
title: 列式数据库 Infobright
date: 2018-12-27 09:04:34 +0800
categories: [SQL]
tags: [sql, big-data, sh]
published: true
excerpt: Infobright 灵活的数据库
---

# Infobright

Ignite的Infobright DB为应用程序提供支持，以执行交互式复杂查询，从而实现更好，更快的业务决策。 

它是一种高性能，可扩展的解决方案，用于以较低的成本存储和分析大量机器生成的数据，并且比其他数据库解决方案显着减少管理工作量。

高性能数据分析，以更低的成本实现更快，更快的业务决策

Infobright DB由我们创新的知识网格架构提供支持，易于实施和管理 - 帮助您以您能承受的价格获得业务用户所需的答案。

## 特性

高性能：复杂即席查询的次秒响应时间

可扩展：每小时加载数TB的数据并扩展到数PB的数据

低成本高投资回报率：无需复杂的硬件和存储基础架构

加载和运行：Infobright DB不需要数据分区，调优或索引创建 - 只需加载并使用现有模式

## 优缺点

### 优点

查询性能高：百万、千万、亿级记录数条件下，同等的SELECT查询语句，速度比MyISAM、InnoDB等普通的MySQL存储引擎快5～60倍

存储数据量大：TB级数据大小，几十亿条记录

高压缩比：在我们的项目中为18:1，极大地节省了数据存储空间

基于列存储：无需建索引，无需分区

适合复杂的分析性SQL查询：SUM, COUNT, AVG, GROUP BY

### 限制

不支持数据更新：社区版Infobright只能使用“LOAD DATA INFILE”的方式导入数据，不支持INSERT、UPDATE、DELETE

不支持高并发：只能支持10-18多个并发查询

# 参考资料

[架构概览](https://cdn2.hubspot.net/hubfs/4281917/Ignite_Technologies%20March2018%20Theme/Docs/Ignite%20l%20White%20Paper%20l%20Infobright%20DB-Architecture%20Overview-1.pdf)

[infobright数据导入导出测试](https://www.cnblogs.com/ssslinppp/p/6183304.html)

[MySQL · 引擎特性 · Infobright 列存数据库](https://m.aliyun.com/yunqi/articles/71956)

[传统的行存储和（HBase）列存储的区别](https://blog.csdn.net/youzhouliu/article/details/67632882)

* any list
{:toc}
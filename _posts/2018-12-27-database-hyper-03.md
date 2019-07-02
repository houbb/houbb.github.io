---
layout: post
title: 列式数据库 HyPer
date: 2018-12-27 09:04:34 +0800
categories: [Database]
tags: [database, column-store, sh]
published: true
---

# HyPer

HyPer – A Hybrid OLTP&OLAP High Performance DBMS

HyPer是用于混合OLTP和OLAP工作负载的基于主内存的关系DBMS。 

它是一个所谓的一体化New-SQL数据库系统，它完全偏离了传统的基于磁盘的DBMS架构，引入了许多创新的想法，包括用于以数据为中心的查询处理和多版本并发控制的机器代码生成，

导致 卓越的表现。 

HyPer的OLTP吞吐量与专用事务处理系统相当或更优，其OLAP性能与最佳查询处理引擎相匹配 - 但是，HyPer在同一数据库状态下同时实现了此OLTP和OLAP性能。 

目前的研究重点是将HyPer的功能从OLTP和OLAP处理扩展到利用HyPer开创性编译基础架构深入集成到数据库内核中的探索性工作流。

# 亮点

## 内存数据管理

HyPer依赖于内存数据管理，而不会受DBMS控制的页面结构和缓冲区管理引起的传统数据库系统的压载。 

SQL表定义被转换为简单的基于向量的虚拟内存表示 - 这构成了面向列的物理存储方案。

## 以数据为中心的代码生成

事务和查询以SQL或类似PL / SQL的脚本语言指定，并有效地编译为有效的LLVM汇编代码。

## 多版本并发控制

使用多版本并发控制（MVCC）将OLAP查询处理与任务关键型OLTP事务处理分开。

## 没有妥协

HyPer的交易处理完全符合ACID标准。 

查询在SQL-92中指定，加上后续标准的一些扩展。

# 参考资料

* any list
{:toc}
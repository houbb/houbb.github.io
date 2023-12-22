---
layout: post
title: database Lealone 比 MySQL 和 MongoDB 快10倍的 OLTP 关系数据库和文档数据库
date:  2019-3-15 17:16:10 +0800
categories: [Database]
tags: [database, distributed-database, sh]
published: true
---

# Lealone 是什么

是一个高性能的面向 OLTP 场景的关系数据库

也是一个兼容 MongoDB 的高性能文档数据库

同时还高度兼容 MySQL 和 PostgreSQL 的协议和 SQL 语法

# Lealone 有哪些特性

## 高亮特性

并发写性能极其炸裂

全链路异步化，使用少量线程就能处理大量并发

可暂停的、渐进式的 SQL 引擎

基于 SQL 优先级的抢占式调度，慢查询不会长期霸占 CPU

创建 JDBC 连接非常快速，占用资源少，不再需要 JDBC 连接池

插件化存储引擎架构，内置 AOSE 引擎，采用新颖的异步化 B-Tree

插件化事务引擎架构，事务处理逻辑与存储分离，内置 AOTE 引擎

支持 Page 级别的行列混合存储，对于有很多字段的表，只读少量字段时能大量节约内存

支持通过 CREATE SERVICE 语句创建可托管的后端服务

只需要一个不到 2M 的 jar 包就能运行，不需要安装

## 普通特性

支持索引、视图、Join、子查询、触发器、自定义函数、Order By、Group By、聚合

## 企业版

支持高性能分布式事务、支持强一致性复制、支持全局快照隔离

支持自动化分片 (Sharding)，用户不需要关心任何分片的规则，没有热点，能够进行范围查询

支持混合运行模式，包括4种模式: 嵌入式、Client/Server 模式、复制模式、Sharding 模式

支持不停机快速手动或自动转换运行模式: Client/Server 模式 -> 复制模式 -> Sharding 模式

# 入门

https://github.com/lealone/Lealone

* any list
{:toc}
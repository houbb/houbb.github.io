---
layout: post
title: 数据库汇总 database overview
date: 2018-12-27 09:04:34 +0800
categories: [Database]
tags: [database, overview, sh]
published: true
---

# 数据库

# OLAP ALTP

# 传统数据库 

[mysql]()

[postgresql](https://houbb.github.io/2018/01/08/postgresql)

# 数据仓库

[TiDB](https://houbb.github.io/2019/03/15/database-tidb)

[Greenplum](https://houbb.github.io/2019/01/09/database-greenplum)

[]()

# 列式数据库

[monetdb](https://houbb.github.io/2018/12/27/database-monetdb)

[info-bright](https://houbb.github.io/2018/12/27/info-bright)

[Clickhouse]()

[Vertica]()

[Hyper 实时编译 JIT 寄存器流水线]()

IBM Netezza 计算下压


# 计算机基础知识

[内存相关知识](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

[MMAP 内存映射](https://houbb.github.io/2018/09/21/java-io-08-mmap-08)


# 数据库理论

[SQL Theory - BASE ACID CAP](https://houbb.github.io/2018/08/13/sql-theory)

# 设计范式

[数据库表设计-数据库三范式](https://houbb.github.io/2018/12/27/database-three-normal-form)

[数据库表设计-大宽表](https://houbb.github.io/2018/12/27/database-wide-table)


# chat

## Q1: 目前市面上一共有哪些类别的数据库？给出他们的代表。比如传统关系数据库 mysql，kv 型 redis。给出表格

以下是一些主要类别的数据库以及它们的代表：

| 类别                 | 代表数据库                                       |
|----------------------|--------------------------------------------------|
| 关系型数据库         | MySQL, PostgreSQL, Oracle, Microsoft SQL Server   |
| 键值存储数据库       | Redis, Amazon DynamoDB, Riak                      |
| 列族型数据库         | Apache Cassandra, HBase                          |
| 文档型数据库         | MongoDB, CouchDB, Elasticsearch                   |
| 图数据库             | Neo4j, Amazon Neptune, ArangoDB                  |
| 内存数据库           | Redis, Memcached                                  |
| 搜索引擎             | Elasticsearch, Apache Solr                      |
| 拟图数据库           | Amazon Neptune, Virtuoso                         |
| 时序数据库           | InfluxDB, OpenTSDB                               |
| 多模型数据库         | ArangoDB, OrientDB, MarkLogic                    |

请注意，数据库领域不断发展，新的数据库类型和产品也在不断涌现。每种类型的数据库都有其自身的优势和适用场景。选择合适的数据库通常取决于应用程序的特定需求和性能要求。

## Q2: 简单解释下上面的各种数据库，以及使用的场景

1. **关系型数据库：**
   - **代表数据库：** MySQL, PostgreSQL, Oracle, Microsoft SQL Server
   - **简要解释：** 关系型数据库使用表格结构（表格、行和列）来组织和存储数据。它们支持 SQL 查询语言，具有强大的事务管理和数据一致性特性。
   - **使用场景：** 适用于需要复杂事务处理和数据关联性的应用，如企业应用、金融系统、客户关系管理（CRM）系统等。

2. **键值存储数据库：**
   - **代表数据库：** Redis, Amazon DynamoDB, Riak
   - **简要解释：** 键值存储数据库使用简单的键值对来存储数据。它们通常提供快速的读写操作，适用于需要快速存储和检索简单数据结构的场景。
   - **使用场景：** 适用于缓存、会话存储、计数器、队列等需要快速读写操作的应用。

3. **列族型数据库：**
   - **代表数据库：** Apache Cassandra, HBase
   - **简要解释：** 列族型数据库以列簇（column family）的形式存储数据，适合处理大规模的分布式数据，具有高可扩展性。
   - **使用场景：** 适用于大规模数据集的分布式存储，例如日志、时间序列数据等。

4. **文档型数据库：**
   - **代表数据库：** MongoDB, CouchDB, Elasticsearch
   - **简要解释：** 文档型数据库使用文档来组织和存储数据，文档可以是 JSON 或 BSON 格式。它们适用于存储和查询复杂的非结构化数据。
   - **使用场景：** 适用于内容管理系统、博客平台、实时分析等需要灵活数据模型的应用。

5. **图数据库：**
   - **代表数据库：** Neo4j, Amazon Neptune, ArangoDB
   - **简要解释：** 图数据库用于存储和处理图结构数据，其中节点表示实体，边表示实体之间的关系。这使得图数据库非常适用于处理复杂的关系型数据。
   - **使用场景：** 适用于社交网络分析、推荐系统、网络关系分析等需要深层次关联数据的应用。

6. **内存数据库：**
   - **代表数据库：** Redis, Memcached
   - **简要解释：** 内存数据库将数据存储在内存中，以提供高速的读写操作。它们通常用于缓存、会话存储等需要快速访问的场景。
   - **使用场景：** 适用于高速读写需求、实时分析等需要低延迟操作的应用。

7. **搜索引擎：**
   - **代表数据库：** Elasticsearch, Apache Solr
   - **简要解释：** 搜索引擎专注于文本搜索和全文检索。它们支持复杂的搜索查询和分析，适用于处理大量文本数据。
   - **使用场景：** 适用于日志分析、文本搜索、实时数据分析等需要强大搜索和分析功能的应用。

8. **拟图数据库：**
   - **代表数据库：** Amazon Neptune, Virtuoso
   - **简要解释：** 拟图数据库是图数据库的一种扩展，支持存储和查询拟图数据，同时具有一些图数据库和关系型数据库的特性。
   - **使用场景：** 适用于需要同时处理图数据和传统关系型数据的应用。

9. **时序数据库：**
   - **代表数据库：** InfluxDB, OpenTSDB
   - **简要解释：** 时序数据库专注于处理按时间排序的数据，通常用于存储和查询时间序列数据，如传感器数据、监控数据等。
   - **使用场景：** 适用于物联网、监控系统、日志分析等需要处理时间序列数据的应用。

10. **多模型数据库：**
   - **代表数据库：** ArangoDB, OrientDB, MarkLogic
   - **简要解释：** 多模型数据库支持多种数据模型，如文档、图和键值存储，使其更灵活地适应不同的数据存储需求。
   - **使用场景：** 适用于需要同时支持多种数据模型的应用，减少数据模型转换的复杂性。


# 个人感受

成熟的软件本身的应用，会再多都是没有意义的。

重要的是，熟知其中的原理。

比如索引，锁，缓存，执行计划，mmap。

主从复制，负载均衡。。。

* any list
{:toc}
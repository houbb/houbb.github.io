---
layout: post
title:  Neo4j-Cypher-00-Cypher Manual、Cypher Cheat Sheet 和 Cypher Refcard introduction 入门介绍
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# 官方资料

> [官方资料](https://neo4j.com/docs/resources/docs-archive/#_cypher_query_language)


> [neo4j-cypher-manual-5.pdf](https://neo4j.com/docs/pdf/neo4j-cypher-manual-5.pdf)

# 介绍

欢迎使用Neo4j Cypher® 手册。

Cypher是Neo4j的声明式查询语言，允许用户充分发挥属性图数据库的潜力。

Cypher手册旨在尽可能为来自不同背景和职业（如开发人员、管理员和学术研究人员）的读者提供指导。

如果您是Cypher和Neo4j的新手，您可以访问入门指南 → Cypher简介章节。

此外，Neo4j GraphAcademy提供了各种针对不同经验水平的免费课程。

要了解所有可用的Cypher功能，请参阅Cypher速查表。

要获取Cypher手册的可下载PDF版本，请访问Neo4j文档存档。

本介绍将涵盖以下主题：

Overview

Cypher and Neo4j

Cypher and Aura

# 概述

本节提供了Cypher®的概述，并简要讨论了Cypher与SQL的区别。

## 什么是Cypher？

Cypher是Neo4j的声明式图查询语言。它由Neo4j工程师于2011年创建，作为图数据库的SQL等效语言。

与SQL类似，Cypher让用户专注于从图中检索什么，而不是如何检索。

因此，Cypher通过允许高效且富有表现力的查询，揭示以前未知的数据连接和集群，使用户能够充分发挥其属性图数据库的潜力。

Cypher提供了一种可视化的方式来匹配模式和关系。

它依赖于以下ASCII艺术类型的语法：`(nodes)-[:CONNECT_TO]→(otherNodes)`。

圆括号用于表示圆形节点，`-[:ARROWS]→`用于表示关系。

编写查询实际上就像在图中的数据中绘制图案。换句话说，实体（如节点及其关系）被直观地构建到查询中。

这使得Cypher成为一种非常直观的语言，既易于阅读又易于编写。

## Cypher和SQL：主要区别

Cypher和SQL在许多方面相似。

例如，它们共享许多相同的关键字，如WHERE和ORDER BY。

然而，它们之间存在一些重要的区别：

1. **Cypher具有架构灵活性**

虽然可以使用索引和约束来强制实施部分模式，但Cypher和Neo4j提供了比SQL和关系数据库更大程度的架构灵活性。

具体来说，在Neo4j数据库中的节点和关系不必具有特定的属性集，因为同一图中的其他节点或关系具有该属性（除非在该特定属性上创建了存在约束）。

这意味着用户无需使用固定的模式来表示数据，他们可以随着图的演变而添加新属性和关系。

2. **查询顺序**

SQL查询以用户想要返回的数据开始，而Cypher查询则以返回子句结束。

例如，考虑以下两个查询（都在数据库中搜索评分大于7的电影标题），第一个使用SQL编写，第二个使用Cypher编写：

（SQL查询）：
```sql
SELECT title FROM movies WHERE rating > 7;
```

（Cypher查询）：
```cypher
MATCH (movie:Movie)
WHERE movie.rating > 7
RETURN movie.title;
```

在Cypher中，查询从图中的模式匹配开始，并最终返回用户所需的数据。这与SQL的查询顺序有所不同。


## Cypher查询更为简洁

由于Cypher查询使用直观的白板式构造子句的方法，通常比其等效的SQL查询更为简洁。

例如，考虑以下两个查询（都在数据库中搜索电影《黑客帝国》中演员的名字），第一个使用SQL编写，第二个使用Cypher编写：

（SQL查询）：

```sql
SELECT actors.name
FROM actors
	LEFT JOIN acted_in ON acted_in.actor_id = actors.id
	LEFT JOIN movies ON movies.id = acted_in.movie_id
WHERE movies.title = "The Matrix";
```

（Cypher查询）：

```cypher
MATCH (actor:Actor)-[:ACTED_IN]->(movie:Movie {title: 'The Matrix'})
RETURN actor.name;
```

在Cypher中，由于其直观的语法，查询通常更为简洁。

它的构造方式使得查询更加易读和易写，相较于SQL，可以用更少的代码实现相同的功能。

## Cypher和APOC

Neo4j支持APOC（Cypher上的强大存储过程）核心库。

APOC核心库提供了对用户定义的过程和函数的访问，这些过程和函数扩展了Cypher查询语言的使用领域，包括数据集成、图算法和数据转换等。

欲了解更多详细信息，请访问 [APOC核心页面](https://neo4j.com/docs/apoc/5)。

# Cypher和Neo4j

本节讨论了在使用Cypher®时需要考虑的Neo4j的方面。

## Cypher和Neo4j的不同版本

Neo4j分为两个版本：商业版Enterprise Edition和社区版Community Edition。

在这两个版本之间，Cypher的工作方式几乎相同，但它们之间存在关键区别：


# 关键的Neo4j术语

Cypher查询是针对Neo4j数据库执行的，但通常适用于特定的图形数据。

了解这些术语的含义以及何时图形不等同于数据库是非常重要的。

## DBMS（数据库管理系统）

Neo4j数据库管理系统能够包含和管理多个包含在数据库中的图形数据。

客户端应用程序将连接到DBMS并在其上打开会话。客户端会话提供对DBMS中的任何图形数据的访问权限。

## 图形（Graph）

指的是数据库中的数据模型。通常，每个数据库中只有一个图形数据模型，并且许多管理命令是指向特定图形数据模型的数据库名称。

在会话中执行的Cypher查询可以声明它们适用于哪个图形数据模型，或者使用会话给定的默认图形数据模型。

复合数据库可以通过别名引用其他数据库，其中包含多个图形数据模型。提交给复合数据库的查询可以在同一查询中引用多个图形数据模型。

有关更多信息，请参阅 [操作手册 → 复合数据库](https://neo4j.com/docs/operations-manual/5/composite-databases/)。

## 数据库（Database）

数据库是用于在磁盘和内存中的定义空间中收集数据的存储和检索机制。

# Neo4j中的内置数据库

所有的Neo4j服务器都包含一个名为system的内置数据库，它与所有其他数据库的行为不同。

system数据库用于存储系统数据，您无法对其执行图形查询。

在Neo4j的新安装中，包含了两个数据库：

- **system** - 上述的system数据库，包含有关DBMS和安全配置的元数据。
- **neo4j** - 默认数据库，使用配置选项`dbms.default_database=neo4j`命名。

有关system数据库的更多信息，请参阅关于数据库管理和访问控制的部分。

## 查询注意事项

大多数时候，Cypher查询是针对图形数据运行的读取或更新查询。

还有一些管理命令适用于数据库或整个DBMS。

管理命令不能在连接到普通用户数据库的会话中运行，而是需要在连接到system数据库的会话中运行。管理命令在system数据库上执行。

如果将管理命令提交到用户数据库，它将被重新路由到system数据库上执行。


# Cypher和Neo4j事务

所有Cypher查询都在事务中运行。

由更新查询进行的修改将被事务保存在内存中，直到提交事务，此时更改将被持久化到磁盘上，并对其他事务可见。

如果发生错误 - 无论是在查询评估期间，比如除以零，还是在提交期间，比如违反约束 - 事务会自动回滚，图中的更改不会被持久化。

简而言之，一个更新查询要么完全成功，要么完全不成功。

如果一个查询进行了大量的更新，它会使用大量内存，因为事务将更改保存在内存中。

有关Neo4j中内存配置的信息，请参阅 [Neo4j操作手册 → 内存配置](https://neo4j.com/docs/operations-manual/5/performance/memory-configuration)。

## Neo4j中的事务

可以是显式的（explicit）或隐式的（implicit）。

显式事务	                    隐式事务
由用户打开。	                自动打开。
可以按顺序执行多个Cypher查询。	 只能执行单个Cypher查询。
由用户提交或回滚。	            在事务成功完成时自动提交。

自身启动独立事务的查询，比如使用 `CALL { ... } IN TRANSACTIONS` 的查询，只允许在隐式模式下执行。

显式事务不能直接从查询中管理，必须通过API或工具进行管理。

有关API的示例或用于启动和提交事务的命令，请参考特定API或工具的文档：

- 有关在Neo4j驱动程序中使用事务的信息，请参阅 [Neo4j驱动程序手册中的Session API](https://neo4j.com/docs)。

- 有关在HTTP API中使用事务的信息，请参阅 [HTTP API文档 → 使用HTTP API](https://neo4j.com/docs/http-api/5/actions#http-api-actions)。

- 有关在嵌入式Core API中使用事务的信息，请参阅 [Java参考 → 从Java执行Cypher查询](https://neo4j.com/docs/java-reference/5/java-embedded/cypher-java#cypher-java)。

- 有关在Neo4j Browser或Cypher-shell中使用事务的信息，请参阅 [Neo4j Browser文档](https://neo4j.com/docs/browser-manual/current/reference-commands/) 或 [Cypher-shell文档](https://neo4j.com/docs/operations-manual/5/tools/cypher-shell/#cypher-shell-commands)。

在编写存储过程或使用Neo4j嵌入式时，请记住从执行结果返回的所有迭代器应该被完全使用或关闭。

这样可以确保与它们绑定的资源得到适当的释放。

## DBMS事务

在连接到DBMS时开始一个事务将启动一个DBMS级别的事务。

DBMS级别的事务是数据库事务的容器。

当向特定数据库发出第一个查询时，将启动一个数据库事务。

在DBMS级别事务内打开的数据库事务将在DBMS级别事务提交或回滚时进行提交或回滚。

DBMS事务有以下限制：

- 只能在一个DBMS事务中写入一个数据库。
- Cypher操作分为以下主要类别：
  1. 图形操作。
  2. 模式命令。
  3. 管理命令。
- 不可能将这些工作负载中的任何一个组合到一个单独的DBMS事务中。


## ACID合规性

Neo4j是完全符合ACID标准的。

这意味着：

- **原子性（Atomicity）** - 如果事务的某个部分失败，数据库状态会保持不变。
- **一致性（Consistency）** - 每个事务使数据库处于一致的状态。
- **隔离性（Isolation）** - 在事务期间，修改的数据对其他操作不可见。
- **持久性（Durability）** - 数据库管理系统始终可以恢复已提交事务的结果。


# 云服务

https://neo4j.com/docs/cypher-manual/5/introduction/cypher_aura/

Aura是Neo4j的全托管云服务。它包括AuraDB和AuraDS两部分。

AuraDB是一个供开发人员构建智能应用的图数据库服务，而AuraDS是一个供数据科学家构建预测模型和分析工作流的图数据科学（GDS）服务。

AuraDB提供以下几个层次的服务：

- AuraDB Free（免费版）

- AuraDB Pro（专业版）

- AuraDB Enterprise（企业版）

# Q1-介绍一下 Cypher Manual、Cypher Cheat Sheet 和 Cypher Refcard

Cypher是一种用于图数据库（如Neo4j）的查询语言，它允许用户执行各种图数据库操作，包括图模式的查询和数据修改。

在Cypher的学习过程中，有一些有用的资源，其中包括Cypher Manual、Cypher Cheat Sheet和Cypher Refcard。

1. **Cypher Manual（Cypher手册）**：

   Cypher Manual是官方的Cypher语言文档，提供了详细的语法说明、查询示例和最佳实践。
   
   该手册是最权威的Cypher语言资源之一，适用于初学者和有经验的开发者。在Cypher Manual中，你可以找到关于Cypher查询语言的各种信息，包括查询语句的构建、模式匹配、过滤、排序、聚合和图形修改等。这个手册是一个全面的参考，适用于学习Cypher语言的各个阶段。

2. **Cypher Cheat Sheet（Cypher速查表）**：

   Cypher Cheat Sheet是一种紧凑的、精简的文档，旨在为用户提供Cypher语言的常用语法和示例，以便快速查阅。它通常包含了常见的查询模式、关键字、函数和操作符，以及相应的用法示例。Cypher Cheat Sheet特别适合那些已经熟悉Cypher语法但需要快速查找特定信息的用户。它可以帮助用户快速了解Cypher语言的基本概念，提高查询的效率。

3. **Cypher Refcard（Cypher参考卡片）**：

   Cypher Refcard是一种可打印的、便携式的文档，通常以PDF格式提供。它是一个简洁的参考资源，包含了Cypher语言的关键概念、语法规则和常用模式。Cypher Refcard通常设计得非常紧凑，适合用户随身携带，随时随地查阅。它提供了一种方便的方式，让用户在没有网络连接或电脑环境的情况下，仍然能够快速查找Cypher语言的基本信息。

这些资源通常由Cypher语言的开发者或使用者社区创建和维护，旨在帮助用户更好地理解和使用Cypher语言。无论你是初学者还是有经验的开发者，这些资源都可以为你提供支持和指导，帮助你更高效地使用Cypher语言进行图数据库操作。





# 参考资料

chat



* any list
{:toc}


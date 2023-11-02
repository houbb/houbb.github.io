---
layout: post
title:  Neo4j-Cypher-02-Clauses 子句
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# 子句

本节包含Cypher®查询语言中所有子句的信息。

## Reading clauses 读取子句

这些子句用于从数据库中读取数据。

Cypher查询中的数据流是一组无序的带有键值对的映射 — 这是查询中的变量与数据库中得出的值之间可能的绑定集合。该集合会在查询的后续部分中被进一步细化和扩展。

| 子句 | 描述 |
| ---- | ---- |
| MATCH | 指定在数据库中搜索的模式。 |
| OPTIONAL MATCH | 指定在数据库中搜索的模式，同时对模式中缺失的部分使用null。 |

## Projecting clauses 投影子句

这些子句用于定义结果集中返回哪些表达式。所有返回的表达式都可以使用AS进行别名设置。

| 子句 | 描述 |
| ---- | ---- |
| RETURN ...​ [AS] | 定义查询结果集中包含什么。 |
| WITH ...​ [AS] | 允许将查询部分链接在一起，将一个查询的结果传递到下一个查询中作为起始点或条件。 |
| UNWIND ...​ [AS] | 将列表展开为一系列行。 |

## Reading sub-clauses 读取子子句

这些子子句必须作为读取子句的一部分运行。

| 子子句 | 描述 |
| ---- | ---- |
| WHERE | 在MATCH或OPTIONAL MATCH子句中添加对模式的约束，或者过滤WITH子句的结果。 |
| ORDER BY [ASC[ENDING] | DESC[ENDING]] | 在RETURN或WITH后的子子句，指定输出按升序（默认）或降序排序。 |
| SKIP | 定义从哪一行开始包括输出中的行。 |
| LIMIT | 限制输出中的行数。 |

## Writing clauses 写入子句

这些子句用于将数据写入数据库。

| 子句 | 描述 |
| ---- | ---- |
| CREATE | 创建节点和关系。 |
| DELETE | 删除节点、关系或路径。要删除的任何节点也必须明确删除所有关联的关系。 |
| DETACH DELETE | 删除一个或一组节点。所有关联的关系将自动被删除。 |
| SET | 更新节点上的标签和节点、关系上的属性。 |
| REMOVE | 从节点和关系中删除属性和标签。 |
| FOREACH | 更新列表中的数据，无论是路径的组件还是聚合结果。 |

## Reading/Writing clauses 读取/写入子句

这些子句既从数据库中读取数据又向数据库中写入数据。

| 子句 | 描述 |
| ---- | ---- |
| MERGE | 确保图中存在某个模式。该模式要么已经存在，要么需要被创建。 |
| --- ON CREATE | 与MERGE一起使用，用于指定如果需要创建模式时要采取的操作。 |
| --- ON MATCH | 与MERGE一起使用，用于指定如果模式已经存在时要采取的操作。 |
| CALL ...​ [YIELD ...​ ] | 调用在数据库中部署的存储过程并返回任何结果。 |

## Subquery clauses 子查询子句

| 子句 | 描述 |
| ---- | ---- |
| CALL { …​ } | 计算子查询，通常用于联合后处理或聚合。 |
| CALL { …​ } IN TRANSACTIONS | 在单独的事务中计算子查询。通常用于修改或导入大量数据时。 |

## Set operations 集合操作

| 子句 | 描述 |
| ---- | ---- |
| UNION | 将多个查询的结果组合成一个结果集。重复的行会被移除。 |
| UNION ALL | 将多个查询的结果组合成一个结果集。重复的行会被保留。 |

## Multiple graphs 多图

| 子句 | 描述 |
| ---- | ---- |
| USE | 确定查询或查询部分在哪个图上执行。 |


## Importing data 导入数据

| 子句 | 描述 |
| ---- | ---- |
| LOAD CSV | 从CSV文件导入数据时使用。 |
| CALL { …​ } IN TRANSACTIONS | 在导入大量数据时，可以使用此子句来避免内存溢出错误的发生。 |

## Listing functions and procedures 函数和存储过程列表

| 子句 | 描述 |
| ---- | ---- |
| SHOW FUNCTIONS | 列出可用函数。 |
| SHOW PROCEDURES | 列出可用存储过程。 |

## Configuration Commands 配置命令

| 子句 | 描述 |
| ---- | ---- |
| SHOW SETTINGS | 列出配置设置。 |

## Transaction Commands 事务命令

| 子句 | 描述 |
| ---- | ---- |
| SHOW TRANSACTIONS | 列出可用事务。 |
| TERMINATE TRANSACTIONS | 通过其ID终止事务。 |

## Reading hints 读取提示

这些子句用于在调整查询时指定规划提示。有关使用这些提示以及查询调优的更多详细信息，可参阅“规划提示”和“USING关键字”。

| 提示 | 描述 |
| ---- | ---- |
| USING INDEX | 索引提示用于指定规划器应该使用哪个索引（如果有）作为起始点。 |
| USING INDEX SEEK | 索引搜索提示指示规划器在此子句中使用索引搜索。 |
| USING SCAN | 扫描提示用于强制规划器执行标签扫描（后跟过滤操作），而不使用索引。 |
| USING JOIN | 连接提示用于在指定的点上强制执行连接操作。 |

## Index and constraint clauses 索引和约束子句

这些子句用于创建、显示和删除索引和约束。

| 子句 | 描述 |
| ---- | ---- |
| CREATE | SHOW | DROP INDEX | 创建、显示或删除索引。 |
| CREATE | SHOW | DROP CONSTRAINT | 创建、显示或删除约束。 |

## Administration clauses 管理子句

Cypher包括用于管理数据库、别名、服务器和基于角色的访问控制的命令。要了解有关每个子句的更多信息，请参见：

[Operations Manual → Database administration（操作手册 → 数据库管理）](https://neo4j.com/docs/operations-manual/5/database-administration)

[Operations Manual → Authentication and authorization（操作手册 → 身份验证和授权）](https://neo4j.com/docs/operations-manual/5/authentication-authorization/)

[Operations Manual → Clustering（操作手册 → 集群化）](https://neo4j.com/docs/operations-manual/5/clustering/)


# 参考资料

chat

https://neo4j.com/docs/cypher-manual/5/clauses/

* any list
{:toc}


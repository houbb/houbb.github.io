---
layout: post
title: Apache Calcite advanced 03 streaming 流
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 介绍 

流（Streams）是持续流动且永无止境的记录集合。

与表不同，它们通常不存储在磁盘上，而是通过网络流动，并在内存中短暂地保存。

流与表相辅相成，因为它们代表了企业当前和未来发生的事情，而表则代表了过去。将流存档到表中是非常常见的。

与表类似，您经常希望使用基于关系代数的高级语言查询流，根据模式进行验证，并针对可用资源和算法进行优化。

Calcite 的 SQL 是标准 SQL 的扩展，而不是另一种“类似 SQL”的语言。

这种区别很重要，原因有几个：

- 对于任何了解常规 SQL 的人来说，流式 SQL 非常容易学习。
- 语义清晰，因为我们的目标是在流上产生与相同数据在表中时相同的结果。
- 您可以编写结合流和表（或流的历史，基本上是一个内存中的表）的查询。
- 许多现有工具可以生成标准 SQL。
- 如果不使用 STREAM 关键字，则回到常规的标准 SQL。

# 一个示例模式

我们的流式 SQL 示例使用以下模式:

- Orders（rowtime、productId、orderId、units）- 一个流和一个表
- Products（rowtime、productId、name）- 一个表
- Shipments（rowtime、orderId）- 一个流

# 一个简单的查询

让我们从最简单的流式查询开始：

```sql
SELECT STREAM *
FROM Orders;

  rowtime | productId | orderId | units
----------+-----------+---------+-------
 10:17:00 |        30 |       5 |     4
 10:17:05 |        10 |       6 |     1
 10:18:05 |        20 |       7 |     2
 10:18:07 |        30 |       8 |    20
 11:02:00 |        10 |       9 |     6
 11:04:00 |        10 |      10 |     1
 11:09:30 |        40 |      11 |    12
 11:24:11 |        10 |      12 |     4
```

这个查询从 Orders 流中读取所有列和行。像任何流式查询一样，它永远不会终止。它在 Orders 到达时输出一条记录。

要终止查询，请键入 Control-C。

STREAM 关键字是流式 SQL 中的主要扩展。它告诉系统您对即将到来的订单感兴趣，而不是现有的订单。 

```sql
SELECT *
FROM Orders;

  rowtime | productId | orderId | units
----------+-----------+---------+-------
 08:30:00 |        10 |       1 |     3
 08:45:10 |        20 |       2 |     1
 09:12:21 |        10 |       3 |    10
 09:27:44 |        30 |       4 |     2

4 records returned.
```

这个查询也是有效的，但会打印出所有现有的订单，然后终止。我们将其称为关系查询，与流式查询相对。它具有传统的 SQL 语义。

Orders 很特殊，因为它既是一个流，又是一个表。如果您尝试在表上运行流式查询，或在流上运行关系查询，Calcite 将会报错：

```sql
SELECT * FROM Shipments;

ERROR: Cannot convert stream 'SHIPMENTS' to a table

SELECT STREAM * FROM Products;

ERROR: Cannot convert table 'PRODUCTS' to a stream
```

# 过滤行

就像在常规的 SQL 中一样，您可以使用 WHERE 子句来过滤行：

```sql
SELECT STREAM *
FROM Orders
WHERE units > 3;

  rowtime | productId | orderId | units
----------+-----------+---------+-------
 10:17:00 |        30 |       5 |     4
 10:18:07 |        30 |       8 |    20
 11:02:00 |        10 |       9 |     6
 11:09:30 |        40 |      11 |    12
 11:24:11 |        10 |      12 |     4
```

# 投射表达式 Projecting expressions

在 SELECT 子句中使用表达式来选择要返回的列或计算表达式：




# 参考资料

https://calcite.apache.org/docs/spatial.html

* any list
{:toc}
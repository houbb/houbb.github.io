---
layout: post
title:  Neo4j-Cypher-07-Indexes for search performance
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# 拓展阅读

[Full-text search index](https://neo4j.com/docs/cypher-manual/5/indexes-for-full-text-search/)

[]()

# 搜索性能的索引

本页介绍了如何管理用于搜索性能的索引。

出于查询性能的目的，了解Cypher®规划器如何使用索引也非常重要。请参阅查询调整，了解不同索引和查询方案导致的查询计划示例和深入讨论。特别参阅索引的使用，了解各种索引方案导致不同查询计划的示例。

有关索引配置和限制的信息，请参阅操作手册→索引配置。

索引（类型和限制）

数据库索引是数据库中一些数据的冗余副本，用于使相关数据的搜索更高效。这样做的代价是额外的存储空间和较慢的写入速度，因此决定对什么进行索引和不进行索引是一项重要且通常不容易的任务。

一旦创建了索引，它将由DBMS进行管理和保持最新。

一旦创建并上线，Neo4j将自动识别并开始使用该索引。

有多种类型的索引可用：

范围索引。

查找索引。

文本索引。

点索引。

全文索引。

有关全文索引的更多信息，请参阅全文搜索索引。查找索引包含具有一个或多个标签或关系类型的节点，而不考虑任何属性。

Cypher使得可以为具有给定标签或关系类型的所有节点或关系的一个或多个属性创建范围索引：

为给定标签或关系类型的单个属性创建的索引称为单属性索引。

为给定标签或关系类型的多个属性创建的索引称为复合索引。

在复合和单属性索引之间的使用模式差异在复合索引限制中有描述。

此外，文本和点索引是一种单属性索引，但它们只识别具有字符串和点值的属性，分别。具有另一种值类型的索引属性的标有索引标签或关系类型的节点或关系不包括在索引中。

索引有以下特点：

最佳实践是在创建索引时为其命名。如果索引未明确命名，则会自动生成一个名称。

索引名称在索引和约束之间必须是唯一的。

索引创建默认情况下不是幂等的，如果尝试两次创建相同的索引，则会抛出错误。使用关键字IF NOT EXISTS使命令成为幂等，如果尝试两次创建相同的索引，则不会抛出错误。

有关所有索引命令的简要概述的语法，请参阅语法。

# 创建索引

创建索引使用CREATE ... INDEX ...命令。

如果在创建命令中未指定索引类型，则将创建一个范围索引。

在创建索引时，最佳实践是为其命名。如果索引未明确命名，则会自动生成一个名称。

索引名称在索引和约束之间必须是唯一的。

CREATE INDEX命令是可选择幂等的。这意味着它的默认行为是，如果尝试两次创建相同的索引，将抛出错误。使用IF NOT EXISTS，如果具有相同名称或相同架构和索引类型的索引已经存在，则不会抛出错误，也不会发生任何操作。如果存在冲突的约束，例如具有相同名称或相同架构和支持索引类型的约束，则仍然可能抛出错误。

创建索引需要CREATE INDEX权限。

新索引不会立即可用，而是在后台创建。

## 创建范围索引

可以使用CREATE INDEX命令创建范围索引。请注意，索引名称必须是唯一的。

```cypher
CREATE [RANGE] INDEX [index_name] [IF NOT EXISTS]
FOR (n:LabelName)
ON (n.propertyName_1[,
    n.propertyName_2,
    ...
    n.propertyName_n])

CREATE [RANGE] INDEX [index_name] [IF NOT EXISTS]
FOR ()-[:TYPE_NAME]-()
ON (r.propertyName_1[,
    r.propertyName_2,
    ...
    r.propertyName_n])
```

范围索引只有一个可用的索引提供者，即range-1.0，不支持索引配置。

示例

创建节点的单属性范围索引

创建关系的单属性范围索引

创建节点的复合范围索引

创建关系的复合范围索引

只有在索引不存在时创建范围索引

```cypher
CREATE INDEX node_range_index_name FOR (n:Person) ON (n.surname)
IF NOT EXISTS

CREATE INDEX rel_range_index_name FOR ()-[r:KNOWS]-() ON (r.since)
IF NOT EXISTS
```

如果不确定索引是否存在，可以添加IF NOT EXISTS以确保它存在。

索引如果不存在则创建范围索引

```cypher
CREATE INDEX node_range_index_name IF NOT EXISTS
FOR (n:Person) ON (n.surname)
```

如果具有相同的架构和类型、相同的名称或两者都相同的索引已经存在，则不会创建索引。

## 创建文本索引

可以使用CREATE TEXT INDEX命令创建文本索引。请注意，索引名称必须是唯一的。

```cypher
CREATE TEXT INDEX [index_name] [IF NOT EXISTS]
FOR (n:LabelName)
ON (n.propertyName)
[OPTIONS "{" option: value[, ...] "}"]

CREATE TEXT INDEX [index_name] [IF NOT EXISTS]
FOR ()-[:TYPE_NAME]-()
ON (r.propertyName)
[OPTIONS "{" option: value[, ...] "}"]
```

从Neo4j 5.1开始，文本索引有两个可用的索引提供者，text-2.0（默认）和text-1.0（已弃用），并且不支持索引配置。

文本索引只能识别字符串值，不支持多个属性。

示例

创建节点文本索引

创建关系文本索引

只有在索引不存在时创建文本索引

指定索引提供者创建文本索引

创建节点文本索引
以下语句将在所有带有Person标签且具有昵称字符串属性的节点上创建一个命名的文本索引。

```cypher
CREATE TEXT INDEX node_text_index_nickname FOR (n:Person) ON (n.nickname)
```

创建关系文本索引
以下语句将在所有具有关系类型KNOWS和字符串属性interest的关系上创建一个命名的文本索引。

```cypher
CREATE TEXT INDEX rel_text_index_name FOR ()-[r:KNOWS]-() ON (r.interest)
```

只有在索引不存在时创建文本索引
如果不确定索引是否存在，可以添加IF NOT EXISTS以确保它存在。

以下语句将尝试在所有带有Person标签且具有昵称字符串属性的节点上创建一个命名的文本索引。

```cypher
CREATE TEXT INDEX node_index_name IF NOT EXISTS FOR (n:Person) ON (n.nickname)
```

请注意，如果已经存在具有相同架构和类型、相同名称或两者都相同的索引，索引将不会被创建。

指定索引提供者创建文本索引
要使用特定的索引提供者创建文本索引，可以使用OPTIONS子句。索引提供者的有效值为text-2.0和text-1.0（已弃用）。默认提供者是text-2.0。

```cypher
CREATE TEXT INDEX text_index_with_indexprovider FOR ()-[r:TYPE]-() ON (r.prop1)
OPTIONS {indexProvider: 'text-2.0'}
```

文本索引没有支持的索引配置。

## 创建点索引

可以使用CREATE POINT INDEX命令创建点索引。请注意，索引名称必须是唯一的。

```cypher
CREATE POINT INDEX [index_name] [IF NOT EXISTS]
FOR (n:LabelName)
ON (n.propertyName)
[OPTIONS "{" option: value[, ...] "}"]

CREATE POINT INDEX [index_name] [IF NOT EXISTS]
FOR ()-[:TYPE_NAME]-()
ON (r.propertyName)
[OPTIONS "{" option: value[, ...] "}"]
```

点索引具有支持的索引配置，参见最后的示例，但只有一个可用的索引提供者，即point-1.0。

请注意，点索引只能识别点值，不支持多个属性。

示例

创建节点点索引

创建关系点索引

只有在索引不存在时创建点索引

指定索引配置创建点索引

创建节点点索引
以下语句将在所有带有Person标签且具有sublocation点属性的节点上创建一个命名的点索引。

```cypher
CREATE POINT INDEX node_point_index_name FOR (n:Person) ON (n.sublocation)
```

创建关系点索引
以下语句将在所有具有关系类型STREET和点属性intersection的关系上创建一个命名的点索引。

```cypher
CREATE POINT INDEX rel_point_index_name FOR ()-[r:STREET]-() ON (r.intersection)
```

只有在索引不存在时创建点索引
如果不确定索引是否存在，可以添加IF NOT EXISTS以确保它存在。

```cypher
CREATE POINT INDEX node_point_index IF NOT EXISTS
FOR (n:Person) ON (n.sublocation)
```

请注意，如果已经存在具有相同架构和类型、相同名称或两者都相同的索引，索引将不会被创建。

指定索引配置创建点索引
要创建具有特定索引配置的点索引，可以使用OPTIONS子句。

有效的配置设置为：

- spatial.cartesian.min
- spatial.cartesian.max
- spatial.cartesian-3d.min
- spatial.cartesian-3d.max
- spatial.wgs-84.min
- spatial.wgs-84.max
- spatial.wgs-84-3d.min
- spatial.wgs-84-3d.max

未指定设置时，它们具有各自的默认值。

以下语句将创建一个指定spatial.cartesian.min和spatial.cartesian.max设置的点索引。

```cypher
CREATE POINT INDEX point_index_with_config
FOR (n:Label) ON (n.prop2)
OPTIONS {
  indexConfig: {
    `spatial.cartesian.min`: [-100.0, -100.0],
    `spatial.cartesian.max`: [100.0, 100.0]
  }
}
```

可以将指定索引配置与指定索引提供者结合使用。尽管索引提供者只有一个有效值，即point-1.0，它是默认值。

## 创建令牌查找索引

可以使用CREATE LOOKUP INDEX命令创建令牌查找索引（节点标签或关系类型查找索引）。请注意，索引名称必须是唯一的。

```cypher
CREATE LOOKUP INDEX [index_name] [IF NOT EXISTS]
FOR (n)
ON EACH labels(n)

CREATE LOOKUP INDEX [index_name] [IF NOT EXISTS]
FOR ()-[:r]-()
ON [EACH] type(r)
```

令牌查找索引只有一个可用的索引提供者，即token-lookup-1.0，不支持索引配置。

示例

创建节点标签查找索引

创建关系类型查找索引

只有在索引不存在时创建令牌查找索引

创建节点标签查找索引
以下语句将在具有一个或多个标签的所有节点上创建一个命名的节点标签查找索引：

```cypher
CREATE LOOKUP INDEX node_label_lookup_index FOR (n) ON EACH labels(n)
```

一次只能存在一个节点标签查找索引。

创建关系类型查找索引
以下语句将在具有任何关系类型的所有关系上创建一个命名的关系类型查找索引。

```cypher
CREATE LOOKUP INDEX rel_type_lookup_index FOR ()-[r]-() ON EACH type(r)
```

一次只能存在一个关系类型查找索引。

只有在索引不存在时创建令牌查找索引

如果不确定索引是否存在，可以添加IF NOT EXISTS以确保它存在。

```cypher
CREATE LOOKUP INDEX node_label_lookup IF NOT EXISTS FOR (n) ON EACH labels(n)
```

如果已经存在具有相同架构和类型、相同名称或两者都相同的索引，索引将不会被创建。

## 创建具有冲突索引或约束时的索引

创建一个已经存在的节点上的Book标签的属性title的索引，当该索引已经存在时。

```cypher
CREATE INDEX bookTitleIndex FOR (book:Book) ON (book.title)
```

在这种情况下，索引无法创建，因为它已经存在。

错误消息

```shell
There already exists an index (:Book {title}).
```

创建具有与已经存在的索引相同名称的索引
当已经存在具有给定名称的索引时，在具有Book标签的节点上的属性numberOfPages上创建一个命名索引。现有索引的索引类型并不重要。

```cypher
CREATE INDEX indexOnBooks FOR (book:Book) ON (book.numberOfPages)
```

在这种情况下，索引无法创建，因为已经存在具有给定名称的索引。

错误消息

```shell
There already exists an index called 'indexOnBooks'.
```

当已经存在与现有索引支持的约束相同的模式上的属性isbn上的节点上的Book标签上的索引时，创建一个索引。这仅适用于范围索引。

```cypher
CREATE INDEX bookIsbnIndex FOR (book:Book) ON (book.isbn)
```

在这种情况下，索引无法创建，因为该标签和属性组合上已经存在索引支持的约束。

错误消息

```shell
There is a uniqueness constraint on (:Book {isbn}), so an index is already created that matches this.
```

当具有给定名称的约束已经存在时，在带有Book标签的节点上的属性numberOfPages上创建一个命名索引。

```cypher
CREATE INDEX bookRecommendations FOR (book:Book) ON (book.recommendations)
```

在这种情况下，索引无法创建，因为已经存在具有给定名称的约束。

错误消息

```shell
There already exists a constraint called 'bookRecommendations'.
```

# SHOW INDEXES

Listing indexes can be done with SHOW INDEXES.

```
SHOW [ALL \| FULLTEXT \| LOOKUP \| POINT \| RANGE \| TEXT] INDEX[ES]
  [YIELD { * \| field[, ...] } [ORDER BY field[, ...]] [SKIP n] [LIMIT n]]
  [WHERE expression]
  [RETURN field[, ...] [ORDER BY field[, ...]] [SKIP n] [LIMIT n]]
```

#  删除索引

可以使用`DROP INDEX index_name`命令删除（移除）索引。

此命令可以删除任何类型的索引，但不能删除支持约束的索引。可以使用`SHOW INDEXES`命令在输出列`name`中找到索引的名称。

```cypher
DROP INDEX index_name [IF EXISTS]
```

`DROP INDEX`命令具有幂等性。这意味着如果尝试两次删除同一个索引，其默认行为是抛出错误。如果使用`IF EXISTS`，则如果索引不存在，则不会抛出错误，也不会执行任何操作。

删除索引需要`DROP INDEX`权限。

示例

删除索引

删除不存在的索引

删除索引
以下语句将尝试删除名为`example_index`的索引。

```cypher
DROP INDEX example_index
```

如果存在该名称的索引，它将被删除；如果不存在，则命令将失败。

删除不存在的索引
如果不确定索引是否存在，如果存在则想要删除它，但如果不存在则不想要错误，可以使用`IF EXISTS`。

以下语句将尝试删除名为`missing_index_name`的索引。

```cypher
DROP INDEX missing_index_name IF EXISTS
```

如果存在该名称的索引，它将被删除；如果不存在，则命令不执行任何操作。

# 参考资料

chat

https://neo4j.com/docs/cypher-manual/5/functions/

* any list
{:toc}


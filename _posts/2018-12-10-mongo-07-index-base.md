---
layout: post
title: Mongo Index-07 Mongo 索引
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, index, mongo, sh]
published: true
---

# Mongo Index

索引支持在 mongodb 中高效执行查询。如果没有索引, mongodb 必须执行集合扫描, 即扫描集合中的每个文档, 以选择与查询语句匹配的文档。

如果查询存在适当的索引, mongodb 可以使用该索引来限制它必须检查的文档数。

索引是一种特殊的数据结构, 它以易于遍历的形式存储集合数据集的一小部分。索引存储特定字段或一组字段的值, 按字段的值排序。

索引项的顺序支持有效的相等匹配和基于范围的查询操作。

此外, mongodb 可以通过使用索引中的排序返回已排序的结果。

下图说明了使用索引选择匹配文档并对其进行排序的查询:

![index-for-sort.bakedsvg.svg](https://docs.mongodb.com/manual/_images/index-for-sort.bakedsvg.svg)

从根本上说, mongodb 中的索引与其他数据库系统中的索引相似。

mongodb 在集合级别定义索引, 并支持 mongodb 集合中文档的任何字段或子字段上的索引。

# 默认 _id 索引

mongodb 在创建集合期间在 _id 字段上创建一个唯一索引。

_id 索引阻止客户端为 _id 字段插入具有相同值的两个文档。不能在 _id 字段上删除此索引。

> 注意

在分片群集中, 如果不使用 _id 字段作为分片键, 则应用程序必须确保 _id 字段中值的唯一性, 以防止出错。

这通常是通过使用标准的自动生成的 objectid 来完成的。

# 创建索引

## 命令

```
db.collection.createIndex( <key and index type specification>, <options> )
```

## 例子

```
db.collection.createIndex( { name: -1 } )
```

db.collection.createIndex 方法仅在不存在同一规范的索引时才创建索引。

mongodb 索引使用 B-Tree 数据结构。

# 索引类型

mongodb 提供了许多不同的索引类型来支持特定类型的数据和查询。

## Single Field

除了 mongob 定义的 _id 索引外, mongodb 还支持在文档的单个字段上创建用户定义的上升降序索引。

![index-ascending.bakedsvg.svg](https://docs.mongodb.com/manual/_images/index-ascending.bakedsvg.svg)

对于单字段索引和排序操作, 索引键的排序顺序 (即升序或降序) 并不重要, 因为 mongodb 可以在任一方向遍历索引。

有关单字段索引的详细信息, 请参阅单个字段索引和使用单个字段索引排序。

## 复合 index

mongodb 还支持多个字段上的用户定义索引, 即复合索引。

复合索引中列出的字段顺序具有重要意义。

例如, 如果复合索引由 {userid:1, 分数:-1} 组成, 索引首先按用户 id 排序, 然后在每个 userid 值中按分数排序。

![index-compound-key.bakedsvg.svg](https://docs.mongodb.com/manual/_images/index-compound-key.bakedsvg.svg)

对于复合索引和排序操作, 索引键的排序顺序 (即升序或降序) 可以确定索引是否可以支持排序操作。

有关索引顺序对复合索引中结果的影响的详细信息, 请参阅排序顺序。

有关复合索引的详细信息, 请参阅[复合索引](https://docs.mongodb.com/manual/core/index-compound/)和对[多个字段进行排序](https://docs.mongodb.com/manual/tutorial/sort-results-with-indexes/#sort-on-multiple-fields)。

## 多键索引

mongodb 使用多键索引为存储在数组中的内容编制索引。

如果对包含数组值的字段进行索引, mongodb 将为数组的每个元素创建单独的索引项。

这些多键索引允许查询通过在数组的一个或多个元素上匹配来选择包含数组的文档。

如果索引字段包含数组值, mongodb 将自动确定是否创建多键索引; 如果索引字段包含数组值, mongodb 将自动确定是否创建多键索引。

您不需要显式指定多键类型。

![index-multikey.bakedsvg.svg](https://docs.mongodb.com/manual/_images/index-multikey.bakedsvg.svg)

## 地理空间索引

为了支持地理空间坐标数据的有效查询, mongodb 提供了两个特殊索引: 

1. 在返回结果时使用平面几何的 2d 索引

2. 和使用球面几何返回结果的 2dsphere 索引。

有关地理空间索引的高级介绍, 请参阅 [2d 索引内部](https://docs.mongodb.com/manual/core/geospatial-indexes/)。

## 文本索引

mongodb 提供了支持搜索集合中的字符串内容的文本索引类型。

这些文本索引不存储特定于语言的停止词 (例如 "the"、"a" 或 "), 并阻止集合中的单词只存储根单词。

有关文本索引和搜索的详细信息, 请参阅[文本索引](https://docs.mongodb.com/manual/core/index-text/)。

## 哈希索引

为了支持基于哈希的分片, mongodb 提供了一个哈希索引类型, 该索引对字段值的哈希进行索引。

这些索引的值在其范围内具有更随机的分布, 但只支持相等匹配, 并且不能支持基于范围的查询。

# 索引属性

## 独特的索引

索引的唯一属性会导致 mongodb 拒绝索引字段的重复值。

除了唯一约束外, 唯一索引在功能上可以与其他 mongodb 索引互换。

## 部分索引

3.2 版中的新版本。

部分索引仅索引满足指定筛选表达式的集合中的文档。通过为集合中的文档子集编制索引, 部分索引具有较低的存储要求, 并降低了索引创建和维护的性能成本。

部分索引提供了稀疏索引功能的超集, 应该优先于稀疏索引。

## 稀疏索引

索引的稀疏属性可确保索引仅包含具有索引字段的文档的条目。索引将跳过没有索引字段的文档。

您可以将稀疏索引选项与唯一索引选项结合起来, 以拒绝对字段具有重复值但忽略的文档

## ttl 索引

ttl 索引是 mongodb 可用于在一段时间后自动从集合中删除文档的特殊索引。

这对于某些类型的信息 (如计算机生成的事件数据、日志和会话信息) 非常理想, 这些信息只需要在数据库中保留有限的时间。

请参阅: 通过[设置 ttl 来过期集合中的数据](https://docs.mongodb.com/manual/tutorial/expire-data/), 以获取实现说明。

# 索引使用

索引可以提高读取操作的效率。

分析查询性能教程提供了具有和不具有索引的查询的执行统计信息的示例。

有关 mongodb 如何选择要使用的索引的信息, 请参阅查询优化器。

> [执行计划](https://docs.mongodb.com/manual/tutorial/analyze-query-plan/)


# Indexes and Collation

3.4 版中的新版本。

排序规则允许用户指定字符串比较的特定于语言的规则, 例如字母大小写和重音标记的规则。

若要使用索引进行字符串比较, 操作还必须指定相同的排序规则。

也就是说, 如果某个操作指定了不同的排序规则, 则具有排序规则的索引不能支持在索引字段上执行字符串比较的操作。

例如, 集合 mycoll 在字符串字段类别上有一个索引, 其排序规则区域设置为 "fr"。

```
db.myColl.createIndex( { category: 1 }, { collation: { locale: "fr" } } )
```

- 命中索引

下面的查询操作指定了与索引相同的排序规则, 可以使用索引:

```
db.myColl.find( { category: "cafe" } ).collation( { locale: "fr" } )
```

- 无法命中索引

但是, 以下查询操作 (默认情况下使用 "简单" 二进制排序器) 不能使用索引:

```
db.myColl.find( { category: "cafe" } )
```

对于索引前缀键不是字符串、数组和嵌入文档的复合索引, 指定不同排序规则的操作仍然可以使用索引来支持索引前缀键上的比较。

例如, 集合 mycoll 在数字字段分数和价格以及字符串字段类别上有一个复合索引;

索引是使用排序规则区域设置 "fr" 创建的, 用于字符串比较:

```
db.myColl.createIndex(
   { score: 1, price: 1, category: 1 },
   { collation: { locale: "fr" } } )
```

以下操作使用 "简单" 二进制排序规则进行字符串比较, 可以使用索引:

```
db.myColl.find( { score: 5 } ).sort( { price: 1 } )
db.myColl.find( { score: 5, price: { $gt: NumberDecimal( "10" ) } } ).sort( { price: 1 } )
```

下面的操作使用 "简单" 二进制排序规则对索引类别字段中的字符串进行比较, 它可以使用索引来仅完成查询的分数:

```
db.myColl.find( { score: 5, category: "cafe" } )
```

我觉得对于索引，一个是理解。

另外一个比较简单的就是使用 explain，看执行时到底命中与否即可。

# 覆盖的查询

当查询条件和查询投影仅包含索引字段时, mongodb 将直接从索引返回结果, 而无需扫描任何文档或将文档放入内存。

这些覆盖的查询可以非常有效。

![index-for-covered-query.bakedsvg.svg](https://docs.mongodb.com/manual/_images/index-for-covered-query.bakedsvg.svg)

> [read-operations-covered-query](https://docs.mongodb.com/manual/core/query-optimization/#read-operations-covered-query)


# 索引交集

2.6 版中的新版本。

mongodb 可以使用索引的交集来完成查询。

对于指定复合查询条件的查询, 如果一个索引可以满足查询条件的一部分, 而另一个索引可以满足查询条件的另一部分, 则 mongodb 可以使用两个索引的交集来完成查询。

复合索引的使用或索引交集的使用是否更有效取决于特定的查询和系统。

有关索引交集的详细信息, 请参阅索引交集。

# 限制

某些限制适用于索引, 例如索引键的长度或每个集合的索引数。

有关详细信息, 请参阅[索引限制](https://docs.mongodb.com/manual/reference/limits/#index-limitations)。

## 其他注意事项

虽然索引可以提高查询性能, 但索引也提供了一些操作注意事项。

有关详细信息, 请参阅索引的操作注意事项。

如果您的集合包含大量数据, 并且应用程序需要能够在生成索引时访问数据, 请考虑在后台生成索引, 如背景构造中所述。

若要生成或重建副本集的索引, 请参阅在副本集上生成索引。

某些驱动程序可以使用 NumberLong(1) 而不是1作为规范来指定索引。

这不会对生成的索引产生任何影响。

# 参考资料

[Indexes](https://docs.mongodb.com/manual/indexes/)

* any list
{:toc}
---
layout: post
title: Mongo Aggregation Pipieline-31 Mongo 聚合函数管道篇
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, index, mongo, TODO, sh]
published: true
---

# aggregation

聚合操作处理数据记录并返回计算结果。

聚合操作将多个文档中的值组合在一起, 并且可以对分组数据执行各种操作以返回单个结果。

mongodb 提供了三种执行聚合的方法: 聚合管道、减少映射函数和单一用途聚合方法。

# 聚合管道 (Aggregation Pipeline)

mongodb 的聚合框架是基于数据处理管道的概念而建模的。

文档进入多级管道, 将文档转换为聚合结果。

最基本的管道阶段提供了像查询和文档转换一样的筛选器, 这些筛选器修改了输出文档的形式。

其他管道操作提供了按特定字段对文档进行分组和排序的工具, 以及用于聚合数组内容 (包括文档数组) 的工具。

此外, 管道阶段可以使用运算符执行诸如计算平均或连接字符串等任务。

该管道使用 mongodb 中的本机操作提供高效的数据聚合, 是 mongodb 中数据聚合的首选方法。

聚合管道可以对共享的集合进行操作。

聚合管道可以使用索引来提高其在某些阶段的性能。此外, 聚合管道具有内部优化阶段。

有关详细信息, 请参阅管道操作员和索引以及聚合管道优化。

![aggregation-pipeline.bakedsvg.svg](https://docs.mongodb.com/manual/_images/aggregation-pipeline.bakedsvg.svg)

## 和 map-reduce 的关系

聚合管道提供了 map-reduce 的替代方案, 并且可能是聚合任务的首选解决方案, 在这些任务中, map-reduce 的复杂性可能是没有道理的。

聚合管道对值类型和结果大小有一些限制。

有关聚合管道的限制和约束的详细信息, 请参阅[聚合管道限制](#聚合管道限制)。

# 管道

mongodb 聚合管道由多个阶段组成。

每个阶段在文档通过管道时对其进行转换。管道阶段不需要为每个输入文档生成一个输出文档;

例如, 某些阶段可能会生成新文档或筛选出文档。管道阶段可能会在管道中出现多次。

mongodb 在 mongo shell 中提供 `db.collection.aggregate()` 方法, 并为聚合管道提供聚合命令。

有关可用阶段, 请参阅[聚合管道阶段](#聚合管道阶段)。

例如, 聚合管道的使用情况, 请考虑 ["具有用户首选项数据的聚合"](#具有用户首选项数据的聚合) 和 ["具有 ZIP CODE 数据集的聚合"](#具有-ZIP-CODE-数据集的聚合)。

# 管道表达式

某些管道阶段将管道表达式作为操作数。管道表达式指定要应用于输入文档的转换。表达式具有文档结构, 并且可以包含其他表达式。

管道表达式只能对管道中的当前文档进行操作, 不能引用其他文档中的数据: 表达式操作提供文档的内存中转换。

通常, 表达式是无状态的, 只有在聚合过程看到时才会计算, 但有一个例外: 累加器表达式。

在 `$group` 阶段使用的累加器在文档通过管道进行时保持其状态 (例如总计、最大值、最小值和相关数据)。

在3.2 版中进行了更改: 在 `$project` 阶段提供了一些蓄能器;但是, 在 `$project` 阶段使用时, 累加器不会在文档之间保持其状态。

有关表达式的详细信息, 请参阅[表达式](https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#aggregation-expressions)。

# 聚合管道行为

在 mongodb 中, 聚合命令对单个集合进行操作, 从逻辑上将整个集合传递到聚合管道中。

要优化操作, 请尽可能使用以下策略来避免扫描整个集合。

## 管道操作员和索引

$match 和 $sort 管道运算符在管道开始时可以利用索引。

$geoNear 管道运营商利用地理空间索引。

使用 $geoNear 时, $geoNear 管道操作必须显示为聚合管道中的第一阶段。

在3.2 版中更改: 从 mongodb 3.2 开始, 索引可以涵盖聚合管道。

在 mongodb 2.6 和3.0 中, 索引不能涵盖聚合管道, 因为即使管道使用索引, 聚合仍然需要访问实际文档。

## 早期过滤

如果聚合操作只需要集合中数据的子集, 请使用 $match、$limit 和 $skip 阶段来限制在管道开头输入的文档。

放置在管道开头时, $match 操作使用适当的索引仅扫描集合中的匹配文档。

在管道开始时放置一个 $match 管道阶段, 然后放置一个 $sort 阶段, 在逻辑上等同于具有排序的单个查询, 并且可以使用索引。

在可能的情况下, 将 $match 操作人员放置在管道的开头。

## 附加功能

聚合管道有一个内部优化阶段, 为某些运算符序列提供了更好的性能。

有关详细信息, 请参阅[聚合管道优化](#聚合管道优化)。

聚合管道支持对共享集合的操作。请参阅[聚合管道和 sharded collection](#聚合管道和-sharded-collection)。

# 聚合管道优化

聚合管道操作有一个优化阶段, 它尝试重塑管道以提高性能。

若要查看优化器如何转换特定的聚合管道, 请在 `db.collection.aggregate()` () 方法中包括 explain 选项。

优化可能会在不同版本之间进行更改。

## 投影(Projection)优化

聚合管道可以确定它是否只需要文档中的字段的子集才能获得结果。

如果是这样, 管道将只使用这些必填字段, 从而减少通过管道的数据量。

## 管道序列优化

$project 或 $addFields + $match 序列优化

对于包含投影阶段 ($project 或 $addFields) 并与 $match 阶段一起的聚合管道, mongodb 将 $match 阶段中不需要在投影阶段计算的值的任何筛选器移动到投影之前的新 $match 阶段。

如果聚合管道包含多个投影 and/or $match 阶段, mongodb 将对每个 $match 阶段执行此优化, 在筛选器不依赖的所有投影阶段之前移动每个 $match 筛选器。

请考虑以下阶段的管道:

```
{ $addFields: {
    maxTime: { $max: "$times" },
    minTime: { $min: "$times" }
} },
{ $project: {
    _id: 1, name: 1, times: 1, maxTime: 1, minTime: 1,
    avgTime: { $avg: ["$maxTime", "$minTime"] }
} },
{ $match: {
    name: "Joe Schmoe",
    maxTime: { $lt: 20 },
    minTime: { $gt: 5 },
    avgTime: { $gt: 7 }
} }
```

优化器将 $match 阶段分成四个单独的筛选器, $match 查询文档中的每个键一个。

然后, 优化器将每个筛选器移动到尽可能多的投影阶段之前, 根据需要创建新的 $match 阶段。

在这个例子中, 优化器生成以下优化的管道:

```
{ $match: { name: "Joe Schmoe" } },
{ $addFields: {
    maxTime: { $max: "$times" },
    minTime: { $min: "$times" }
} },
{ $match: { maxTime: { $lt: 20 }, minTime: { $gt: 5 } } },
{ $project: {
    _id: 1, name: 1, times: 1, maxTime: 1, minTime: 1,
    avgTime: { $avg: ["$maxTime", "$minTime"] }
} },
{ $match: { avgTime: { $gt: 7 } } }
```

$match 筛选器 `{avgtime: {$gt: 7}}` 取决于 $project 阶段来计算 avgtime 字段。

$project 阶段是该管道中的最后一个投影阶段, 因此无法移动 avgtime 上的 $match 滤波器。

"maxTime" 和 "minTime" 字段是在 $addFields 阶段计算的, 但不依赖于 $project 阶段。

优化器为这些字段上的筛选器创建了一个新的 $match 阶段, 并将其置于 $project 阶段之前。

$match 筛选器 `{name: "joe schmoe"}` 不使用在 $project 或 $addFields 阶段计算的任何值, 因此它被移动到两个投影阶段之前的新 $match 阶段。

> 注意

优化后, 筛选器 `{name: "joe schmoe"}` 正处于管道开始时的 $match 阶段。

这样做的另一个好处是, 在最初查询集合时, 允许聚合在名称字段上使用索引。

有关详细信息, 请参阅[管道操作员和索引](#管道操作员和索引)。


## TODO...

其他各种场景

[sort-match-sequence-optimization](https://docs.mongodb.com/manual/core/aggregation-pipeline-optimization/#sort-match-sequence-optimization)

# 聚合管道限制

具有聚合命令的聚合操作具有以下限制。

## 结果大小限制

在3.6 版中更改: mongodb 3.6 删除聚合命令以单个文档形式返回其结果的选项。

聚合命令可以返回游标或将结果存储在集合中。

当返回游标或将结果存储在集合中时, 结果集中的每个文档都受 bson 文档大小限制的限制, 当前为16兆字节;

如果任何单个文档超过 bson 文档大小限制, 该命令将产生错误。

限制仅适用于返回的文档;在管道处理过程中, 文档可能会超过此大小。

默认情况下, `db.collection.aggregate()` 方法返回游标。

## 内存限制

更改了2.6 版。

管道阶段的 ram 限制为100兆字节。如果一个阶段超过此限制, mongodb 将产生错误。若要允许处理大型数据集, 请使用 "允许磁盘使用" 选项启用聚合管道阶段, 以便将数据写入临时文件。

在3.4 版中发生了更改。

$graphLookup 阶段必须保持在100兆字节的内存限制范围内。

如果为 aggregate() 操作指定了允许磁盘使用: true, 则 $graphLookup 阶段将忽略该选项。

如果 aggregate() 操作中还有其他阶段, 允许磁盘使用: 真正的选项对这些其他阶段有效。

# 聚合管道和 sharded collection

聚合管道支持对共享集合的操作。本节介绍特定于聚合管道和共享集合的行为。

## 行为

在3.2 版中发生了变化。

如果管道从分片键上的精确 $match 开始, 则整个管道仅在匹配的分片上运行。

以前, 管道会被拆分, 合并管道的工作必须在主分片上完成。

对于必须在多个分片上运行的聚合操作, 如果这些操作不需要在数据库的主分片上运行, 则这些操作将将结果路由到随机分片以合并结果, 从而避免重载该分片的主分片。数据库。

$out 阶段和 $lookup 阶段需要在数据库的主分片上运行。

## 优化

将聚合管道拆分为两部分时, 将拆分管道, 以确保分片在考虑优化的情况下执行尽可能多的阶段。

若要查看管道是如何拆分的, 请在 `db.collection.aggregate()` 方法中包括解释选项。

优化可能会在不同版本之间进行更改。

# 聚合管道阶段

[aggregation-pipeline-operator-reference](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/#aggregation-pipeline-operator-reference)

# 具有 ZIP CODE 数据集的聚合

本文档中的示例使用邮政编码集合。

ps: 这个和 [具有用户首选项数据的聚合](#具有用户首选项数据的聚合) 都是官方提供的 2 个 demo。

此集合可在 media.mongodb.org/zips.json。

使用 mongoimport 将此数据集加载到您的 mongoimport 实例中。

## 数据模型

邮政编码集合中的每个文档都有以下形式:

```json
{
  "_id": "10280",
  "city": "NEW YORK",
  "state": "NY",
  "pop": 5574,
  "loc": [
    -74.016323,
    40.710537
  ]
}
```

_id 字段将邮政编码作为字符串保存。

city 字段举行城市名字。一个城市可以有多个与之关联的邮政编码, 因为城市的不同部分可以每个区域都有不同的邮政编码。

state 字段包含两个字母状态缩写。

pop 容纳人口。

loc 字段将位置保存为纬度经度对。

## aggregate() 方法

以下所有示例都使用 mongo shell 中的 aggregate() 帮助器。

aggregate() 方法使用聚合管道将文档处理为聚合结果。

聚合管道由阶段组成, 每个阶段在文档沿管道传递时对其进行处理。文档按顺序通过各个阶段。

mongo shell 中的 aggregate() 方法提供了聚合数据库命令的包装器。

有关数据聚合操作的更习语接口, 请参阅驱动程序的文档。

## 人口超过1000万的返回状态

以下聚合操作返回总人口超过1000万的所有状态:

```
db.zipcodes.aggregate( [
   { $group: { _id: "$state", totalPop: { $sum: "$pop" } } },
   { $match: { totalPop: { $gte: 10*1000*1000 } } }
] )
```

在本例中, 聚合管道由 $group 阶段和 $match 阶段组成:

$group 阶段按状态字段对 zipcode 集合的文档进行分组, 计算每个状态的 totalpop 字段, 并为每个唯一状态输出文档。

新的每个状态文档有两个字段: `_id` 字段和总 pop 字段。

`_id` 字段包含状态的值;即按字段分组。

"totalPop" 字段是一个计算字段, 其中包含每个状态的总填充。

若要计算值, $group 使用 $sum 运算符为每个状态添加填充字段 (pop)。

$group 阶段后, 管道中的文档如下所示:

```json
{
  "_id" : "AK",
  "totalPop" : 550043
}
```

$match 阶段筛选这些分组文档, 以便仅输出总 pop 值大于或等于1000万的文档。

$match 阶段不会更改匹配的文档, 但会输出不加修改的匹配文档。

## 按州分列的返回平均城市人口

下面的聚合操作返回每个州的城市的平均人口:

```
db.zipcodes.aggregate( [
   { $group: { _id: { state: "$state", city: "$city" }, pop: { $sum: "$pop" } } },
   { $group: { _id: "$_id.state", avgCityPop: { $avg: "$pop" } } }
] )
```

在本例中, 聚合管道由 $group 阶段和另一个 $group 阶段组成:

第一 $group 阶段按城市和州的组合对文档进行分组, 使用 $sum 表达式计算每个组合的填充, 并输出每个城市和州组合的文档。

在管道中的此阶段之后, 文档如下所示:

```json
{
  "_id" : {
    "state" : "CO",
    "city" : "EDGEWATER"
  },
  "pop" : 13154
}
```

第二个 $group 阶段按 `_id.state` 字段 (即 _id 文档中的状态字段) 对管道中的文档进行分组, 

使用 $avg 表达式计算每个状态的平均城市人口 (avgcity pop), 并输出每个状态的文档。

此聚合操作所产生的文档如下所示:

```json
{
  "_id" : "MN",
  "avgCityPop" : 5335
}
```

## 按州返回最大和最小的城市

以下聚合操作按人口返回每个州最小和最大的城市:

```
db.zipcodes.aggregate( [
   { $group:
      {
        _id: { state: "$state", city: "$city" },
        pop: { $sum: "$pop" }
      }
   },
   { $sort: { pop: 1 } },
   { $group:
      {
        _id : "$_id.state",
        biggestCity:  { $last: "$_id.city" },
        biggestPop:   { $last: "$pop" },
        smallestCity: { $first: "$_id.city" },
        smallestPop:  { $first: "$pop" }
      }
   },

  // the following $project is optional, and
  // modifies the output format.

  { $project:
    { _id: 0,
      state: "$_id",
      biggestCity:  { name: "$biggestCity",  pop: "$biggestPop" },
      smallestCity: { name: "$smallestCity", pop: "$smallestPop" }
    }
  }
] )
```

在本例中, 聚合管道由 $group 阶段、$sort 阶段、另一个 $group 阶段和 $project 阶段组成:

第一个 $group 阶段按城市和状态的组合对文档进行分组, 计算每个组合的弹出值之和, 并为每个城市和状态组合输出文档。

在管道的这一阶段, 文档如下所示:

```json
{
  "_id" : {
    "state" : "CO",
    "city" : "EDGEWATER"
  },
  "pop" : 13154
}
```

$sort 阶段按弹出字段值 (从最小到最大) 对管道中的文档进行排序;即通过增加秩序。此操作不会更改文档。

下一个 $group 阶段按 `_id.state` 字段 (即 `_id` 文档中的状态字段) 对已排序的文档进行分组, 并为每个状态输出文档。

该阶段还为每个状态计算以下四个字段。

使用 $last 表达式, $group 运算符创建较大的 "城市" 和 "较大的 pop" 字段, 用于存储人口最多、人口最多的城市。

使用 $first 表达式, $group 运算符创建存储人口最少和人口最少的城市的 smallestcity 和 smallestCity 字段。

在管道中的这一阶段, 这些文档如下所示:

```json
{
  "_id" : "WA",
  "biggestCity" : "SEATTLE",
  "biggestPop" : 520096,
  "smallestCity" : "BENGE",
  "smallestPop" : 2
}
```

最后 $project 舞台将 _id 字段重命名为状态, 并将大城市、大流行、smalestcity 和 smalestpop 移动到大城市和 smalestcity 嵌入文档。

此聚合操作的输出文档如下所示:

```json
{
  "state" : "RI",
  "biggestCity" : {
    "name" : "CRANSTON",
    "pop" : 176404
  },
  "smallestCity" : {
    "name" : "CLAYVILLE",
    "pop" : 45
  }
}
```

# 具有用户首选项数据的聚合

[aggregation-with-user-preference-data](https://docs.mongodb.com/manual/tutorial/aggregation-with-user-preference-data/)

# 参考资料

https://docs.mongodb.com/manual/aggregation/

* any list
{:toc}
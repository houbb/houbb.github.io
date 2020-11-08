---
layout: post
title: Mongo Aggregation Map-Reduce-32 Mongo 聚合 Map-Reduce
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, TODO, sh]
published: true
---

# Map-Reduce

Map-Reduce 是一种数据处理模式, 用于将大量数据压缩为有用的聚合结果。

对于Map-Reduce的操作, mongodb 提供 mapReduce 数据库命令。

![map-reduce.bakedsvg.svg](https://docs.mongodb.com/manual/_images/map-reduce.bakedsvg.svg)

考虑到上面的例子：

在此Map-Reduce操作中, mongodb 将映射阶段应用于每个输入文档 (即集合中与查询条件匹配的文档)。

映射函数发出键值对。对于具有多个值的密钥, mongodb 应用减少阶段, 该阶段收集和压缩聚合数据。

然后, mongodb 将结果存储在集合中。或者, 减少函数的输出可以通过一个最终函数来进一步压缩或处理聚合的结果。

mongodb 中的所有Map-Reduce函数都是 javascript, 并在 mongoen 进程中运行。

地图缩减操作将单个集合的文档作为输入, 并且可以在开始映射阶段之前执行任意排序和限制。

Map-Reduce可以将Map-Reduce操作的结果作为文档返回, 也可以将结果写入集合。

可以共享输入和输出集合。

# Map-Reduce javascript 函数

在 mongodb 中, Map-Reduce操作使用自定义 javascript 函数将值映射或关联到键。

如果某个键映射到多个值, 则操作会将键的值减少到单个对象。

自定义 javascript 函数的使用为减少地图操作提供了灵活性。

例如, 在处理文档时, map 函数可以创建多个键和值映射或不创建映射。

Map-Reduce操作还可以使用自定义 javascript 函数在映射结束时对结果进行最后修改, 并减少操作, 例如执行其他计算。

# Map-Reduce行为

在 mongodb 中, Map-Reduce操作可以将结果写入集合或内联返回结果。

如果将Map-Reduce输出写入集合, 则可以对同一输入集合执行后续Map-Reduce操作, 这些输入集合将使用以前的结果替换、合并或减少新结果。有关详细信息和示例, 请参阅Map-Reduce并执行增量Map-Reduce。

在内联返回Map-Reduce操作的结果时, 结果文档必须在 bson 文档大小限制范围内, 该限制当前为16兆字节。有关减少地图操作的限制和约束的其他信息, 请参阅地图缩减参考页。

mongodb 支持共享集合上的Map-Reduce操作。Map-Reduce操作还可以将结果输出到共享集合。

请参阅Map-Reduce和锐化集合。

视图不支持地图缩减操作。


# TODO..

因为 map-reduce 要和 js 脚本结合起来，实际使用中比较复杂。

暂时就简单的了解一下。

# 参考资料

https://docs.mongodb.com/manual/core/map-reduce/

* any list
{:toc}
---
layout: post
title: Mongo 分片 ranged sharding-46
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# 范围分片

基于范围的分片涉及将数据划分为由分片键值确定的连续范围。 

在此模型中，具有“close”分片键值的文档可能位于相同的块或分片中。 

这允许有效查询，其中读取连续范围内的目标文档。 

但是，读取和写入性能可能会随着分片密钥选择不当而降低。 

请参阅碎片键选择。

![sharding-range-based.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharding-range-based.bakedsvg.svg)

如果没有配置其他选项（如散列分片或区域所需的选项），则基于范围的分片是默认的分片方法。

# 分片键选择

当分片键显示以下特征时，远程分片最有效：

大碎片关键基数

低分片键频率

非单调变化的分片键

下图说明了使用字段X作为分片键的分片群集。 

如果X的值具有较大的范围，较低的频率，并且以非单调的速率变化，则插入的分布可能类似于以下内容：

![sharded-cluster-ranged-distribution-good.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharded-cluster-ranged-distribution-good.bakedsvg.svg)

# 对集合分片

使用 sh.shardCollection() 方法，指定集合的完整命名空间以及要用作分片键的目标索引或复合索引。

```js
sh.shardCollection( "database.collection", { <shard key> } )
```

## Shard a Populated Collection

如果您对填充的集合进行分片：

分片操作创建初始块以覆盖整个分片键值范围。 

创建的块数取决于配置的块大小。

在初始块创建之后，平衡器会根据需要在分片中迁移这些初始块，并管理未来的块分布。

## 空集合分片

如果您对一个空集合进行分片：

没有为空集合或不存在集合指定区域和区域范围：

分片操作会创建一个空的块，以覆盖整个分片键值范围。

在初始块创建之后，平衡器在适当的情况下跨分片迁移初始块，以及管理未来的块分布。

为空或非现有集合指定区域和区域范围（从MongoDB 4.0.3开始可用），分片操作为定义的区域范围以及任何其他块创建空块，以覆盖整个分片键值范围，并根据区域范围执行初始块分布。 

这种块的初始创建和分发允许更快地设置分区分片。

在初始分发之后，平衡器管理未来的块分布。

# 参考资料

https://docs.mongodb.com/manual/core/ranged-sharding/

* any list
{:toc}
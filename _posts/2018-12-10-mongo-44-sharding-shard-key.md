---
layout: post
title: Mongo 分片 shard key-44
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, TODO, sh]
published: true
---

# Shard Keys

分片键确定集合的分片中集合文档的分布。 

分片键是索引字段或索引化合物字段，它们存在于集合中的每个文档中。

MongoDB使用分片键值范围对集合中的数据进行分区。 

每个范围定义非重叠的分片键值范围，并与块相关联。

MongoDB尝试在群集中的分片之间均匀分布块。 

分片键与块分布的有效性直接相关。 

请参阅选择分片键。

![sharding-range-based.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharding-range-based.bakedsvg.svg)

> 重要

分片集合后，分片键和分片键值是不可变的;

即：

您无法为该集合选择不同的分片键。

您无法更新分片键字段的值。

# Shard Key 规范

要对集合进行分片，必须为 sh.shardCollection() 方法指定目标集合和分片键：

```js
sh.shardCollection( namespace, key )
```

namespace参数由字符串 `<database>.<collection>` 组成，指定目标集合的完整命名空间。

关键参数由包含字段的文档和该字段的索引遍历方向组成。

有关使用散列分片策略分片集合的特定说明，请参阅使用散列分片对Shard进行分片。

有关使用远程分片策略分片集合的特定说明，请参阅使用范围分片对Shard进行分片。

# 分片键索引

所有分片集合必须具有支持分片键的索引; 

即索引可以是分片键的索引或分片键是索引的前缀的复合索引。

如果集合为空，则 sh.shardCollection() 会在分片键上创建索引（如果此类索引尚不存在）。

如果集合不为空，则必须先使用 sh.shardCollection() 创建索引。

如果删除分片键的最后一个有效索引，则通过仅在分片键上重新创建索引来进行恢复。

## 唯一索引

您不能在散列索引上指定唯一约束。

对于远程分片集合，只有以下索引可以是唯一的：

分片键上的索引

分片键是前缀的复合索引

默认的_id索引; 但是，如果_id字段不是分片键或分片键的前缀，则_id索引仅强制每个分片的唯一性约束。

## 唯一性和_ID索引

如果_id字段不是分片键或分片键的前缀，则_id索引仅对每个分片强制执行唯一性约束，而不是跨分片。

例如，考虑一个分片集合（带有分片键{x：1}），它跨越两个分片A和B.因为_id键不是分片键的一部分，所以该集合可以在分片A中具有_id值为1的文档和另一个在分片B中具有_id值1的文档。

如果_id字段不是分片键，也不是分片键的前缀，MongoDB希望应用程序在分片中强制执行_id值的唯一性。

- 唯一索引约束意味着

对于要分片的集合，如果集合具有其他唯一索引，则无法对集合进行分片。

对于已经分片的集合，您无法在其他字段上创建唯一索引。

通过在分片键上使用唯一索引，MongoDB可以对分片键值强制执行唯一性。 

MongoDB强制整个组合键的唯一性，而不是分片键的各个组件。 

要对分片键值强制实施唯一性，请将唯一参数作为true传递给 sh.shardCollection() 方法：

如果集合为空，则 sh.shardCollection() 会在分片键上创建唯一索引（如果此类索引尚不存在）。

如果集合不为空，则必须先使用 sh.shardCollection() 创建索引。

虽然您可以使用唯一的复合索引，其中分片键是前缀，但如果使用唯一参数，则集合必须具有分片键上的唯一索引。

# 选择分片键

分片键的选择会影响跨可用分片的块的创建和分发。 

这会影响分片群集中操作的整体效率和性能。

分片键会影响分片群集使用的分片策略的性能和效率。

理想的分片键允许MongoDB在整个群集中均匀分发文档。

![sharded-cluster-ranged-distribution-good.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharded-cluster-ranged-distribution-good.bakedsvg.svg)


至少，考虑潜在分片密钥的基数，频率和变化率的后果。

## 限制

有关分片键的限制，请参阅分片键限制。

## 集合大小

分片非空集合时，分片键可以仅限制初始分片操作所支持的最大集合大小。 

请参见分割现有集合数据大小。

## 重要

成功分片后，分片集合可以增长到任何大小。

## Shard Key Cardinality

分片键的基数决定了平衡器可以创建的最大块数。 

这可以降低或消除群集中水平扩展的有效性。

在任何给定时间，唯一的分片键值可以存在于不超过一个块的位置。 

如果分片键的基数为4，则分片群集中不得超过4个块，每个块存储一个唯一的分片键值。 

这会将群集中有效分片的数量限制为4-添加其他分片不会带来任何好处。

下图说明了使用字段X作为分片键的分片群集。 

如果X的基数较低，则插入的分布可能类似于以下内容：

![sharded-cluster-ranged-distribution-low-cardinal.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharded-cluster-ranged-distribution-low-cardinal.bakedsvg.svg)


此示例中的群集不会水平缩放，因为传入的写入只会路由到分片的子集。

具有高基数的分片键不保证在分片群集中均匀分布数据，但它更有利于水平缩放。 

分片键的频率和变化率也有助于数据分发。 

选择分片键时请考虑每个因素。

如果您的数据模型需要对基数较低的键进行分片，请考虑使用具有较高相对基数的字段的复合索引。

## Shard Key Frequency

考虑表示分片键值范围的集合 - 分片键的频率表示给定值在数据中出现的频率。 

如果大多数文档仅包含这些值的子集，则存储这些文档的块将成为群集中的瓶颈。 

此外，随着这些块的增长，它们可能变成不可分割的块，因为它们无法进一步分裂。 

这降低或消除了群集中水平扩展的有效性。

下图说明了使用字段X作为分片键的分片群集。 

如果X的值的子集以高频率出现，则插入的分布可能类似于以下内容：

![sharded-cluster-ranged-distribution-frequency.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharded-cluster-ranged-distribution-frequency.bakedsvg.svg)

具有低频率的分片键不保证在分片群集中均匀分布数据。 

分片键的基数和变化率也有助于数据分发。 

选择分片键时请考虑每个因素。

如果您的数据模型需要对具有高频率值的键进行分片，请考虑使用唯一或低频值的复合索引。

# 单调改变分片键

值单调增加或减少的分片键更有可能将插入分发到群集中的单个分片。

发生这种情况是因为每个集群都有一个块，它捕获一个上限为maxKey的范围。 

maxKey始终比较高于所有其他值。 

类似地，有一个块捕获具有minKey下限的范围。 

minKey始终比较低于所有其他值。

如果分片键值始终增加，则所有新插入都将路由到以maxKey作为上限的块。 

如果分片键值始终在减小，则所有新插入都将路由到以minKey作为下限的块。 

包含该块的分片成为写操作的瓶颈。

下图说明了使用字段X作为分片键的分片群集。 

如果X的值单调递增，则插入的分布可能类似于以下内容：

![sharded-cluster-monotonic-distribution.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharded-cluster-monotonic-distribution.bakedsvg.svg)

如果分片键值单调递减，则所有插入都将路由到Chunk A.

不单调更改的分片键不保证在分片群集中均匀分布数据。 

分片键的基数和频率也有助于数据分发。 

选择分片键时请考虑每个因素。

如果您的数据模型需要对单调变化的键进行分片，请考虑使用哈希分片。

# 参考资料

https://docs.mongodb.com/manual/core/sharding-shard-key/

* any list
{:toc}
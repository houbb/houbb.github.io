---
layout: post
title: Mongo Conver Query-29 Mongo 覆盖查询
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, index, mongo, sh]
published: true
---

# 覆盖查询

当查询条件和查询投影仅包含索引字段时, mongodb 将直接从索引返回结果, 而无需扫描任何文档或将文档放入内存。

这些覆盖的查询性能非常高。

![index-for-covered-query.bakedsvg.svg](https://docs.mongodb.com/manual/_images/index-for-covered-query.bakedsvg.svg)

覆盖的查询是可以完全使用索引来满足的查询, 无需检查任何文档。当同时应用以下两个选项时, 索引涵盖查询:

1. 查询中的所有字段都是索引的一部分, 并且

2. 结果中返回的所有字段都在同一个索引中。

## 例子

例如, 集合清单在类型和项字段上具有以下索引:

```
db.inventory.createIndex( { type: 1, item: 1 } )
```

- 覆盖查询

下面的查询就是覆盖查询。默认 MongODB 会返回 `_id` 字段，应该排除掉：

```
db.inventory.find(
   { type: "food", item:/^c/ },
   { item: 1, _id: 0 }
)
```

对于包含查询的指定索引, 投影文档必须显式指定 `_id:0` 以从结果中排除 `_id` 字段, 因为索引不包括 `_id` 字段。

## 嵌套文档的字段查询

在3.6 版中更改: 索引可以涵盖对嵌入文档中的字段的查询。

例如, 考虑具有以下形式的文档的集合用户数据:

- 数据

```
{ _id: 1, user: { login: "tester" } }
```

- 索引

```
{ "user.login": 1 }
```

- 下面的查询命中覆盖索引

```
db.userdata.find( { "user.login": "tester" }, { "user.login": 1, _id: 0 } )
```


# 多键覆盖

从3.6 开始, 如果索引跟踪哪个或多个字段导致索引是多键的, 则多键索引可以覆盖对非数组字段的查询。

在 mongodb 3.4 或更高版本的存储引擎上创建的多键索引 (mmapv1 除外) 跟踪此数据。

多键索引不能覆盖数组字段上的查询。

## 性能

由于索引包含查询所需的所有字段, mongodb 既可以匹配查询条件, 也可以仅使用索引返回结果。

仅查询索引比查询索引之外的文档要快得多。

索引键通常小于它们所目录的文档, 索引通常在 ram 中可用, 或者按顺序位于磁盘上。

## 限制

对索引字段的限制

1. 地理空间索引不能覆盖查询。

2. 多键索引不能覆盖数组字段上的查询。

# 对 Sharded Collection 的限制

从 mongodb 3.0 开始, 如果索引不包含分片键, 索引在针对 mongos 运行时无法覆盖共享集合上的查询, 

但 _id 索引的以下异常: 如果共享集合上的查询仅指定 _id field 上的条件 并只返回 _id 字段, 即使 _id 字段不是分片键, 也可以在对 mongos 运行时覆盖查询。

在以前的版本中, 索引在对 mongos 运行时不能覆盖对共享集合的查询。

# 参考资料

[covered-queries](https://docs.mongodb.com/manual/indexes/#covered-queries)

* any list
{:toc}
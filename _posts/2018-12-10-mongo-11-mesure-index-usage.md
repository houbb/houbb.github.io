---
layout: post
title: Mongo Measure Index Usage-11 Mongo 测量 index 的使用
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, index, mongo, sh]
published: true
---

# Measure Index Usage

获取具有 `$indexStats` 的索引访问信息

使用 `$indexStats` 聚合阶段获取有关集合的每个索引的使用的统计信息。

例如, 下面的聚合操作返回有关订单集合上的索引使用情况的统计信息:

```
db.explain.aggregate( [ { $indexStats: { } } ] )
```

结果：

```json
/* 1 */
{
    "name" : "c_1",
    "key" : {
        "c" : 1.0
    },
    "host" : "c120a2890d51:27017",
    "accesses" : {
        "ops" : NumberLong(0),
        "since" : ISODate("2018-12-13T08:18:59.905Z")
    }
}

/* 2 */
{
    "name" : "a_1_b_1",
    "key" : {
        "a" : 1.0,
        "b" : 1.0
    },
    "host" : "c120a2890d51:27017",
    "accesses" : {
        "ops" : NumberLong(0),
        "since" : ISODate("2018-12-13T08:18:57.081Z")
    }
}

/* 3 */
{
    "name" : "_id_",
    "key" : {
        "_id" : 1
    },
    "host" : "c120a2890d51:27017",
    "accesses" : {
        "ops" : NumberLong(0),
        "since" : ISODate("2018-12-13T07:38:02.493Z")
    }
}
```

# 指定触发的索引

若要强制 mongodb 对 `db.collection.find()` 操作使用特定索引, 请使用hint() 方法指定索引。将hint() 方法追加到 find() 方法。

请考虑下面的示例:

```
db.people.find(
   { name: "John Doe", zipcode: { $gt: "63000" } }
).hint( { zipcode: 1 } ).explain("executionStats")
```

# 实例索引使用报告

mongodb 提供了许多索引使用和操作的指标, 您在分析数据库的索引使用时可能需要考虑这些指标:

## 服务器状态

- metrics.queryExecutor.scanned

- metrics.operation.scanAndOrder

## 表统计信息

- totalIndexSize

- indexSizes

## 数据库统计信息

- dbStats.indexes

- dbStats.indexSize

# 参考资料

[Measure Index Usage](https://docs.mongodb.com/manual/tutorial/measure-index-use/)

* any list
{:toc}
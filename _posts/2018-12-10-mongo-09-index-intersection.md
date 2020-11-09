---
layout: post
title: Mongo Index Intersection-09 Mongo 交叉索引
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, index, mongo, sh]
published: true
---

# index-intersection

2.6 版中的新功能。

mongodb 可以使用多个索引的交集来完成查询。

通常, 每个索引交集涉及两个索引;但是, mongodb 可以使用多嵌套索引交集来解析查询。

若要说明索引交集, 请考虑具有以下索引的集合订单:

```
{ qty: 1 }
{ item: 1 }
```

mongodb 可以使用两个索引的交集来支持以下查询:

```
db.orders.find( { item: "abc123", qty: { $gt: 15 } } )
```

要确定 mongodb 是否使用索引交集, 请运行 explain() ; explain() 的结果将包括一个 AND_SORTED 相关分析阶段或 AND_HASH 阶段。

在以前的版本中, mongodb 只能使用单个索引来完成大多数查询。

例外的是与 $or 子句的查询, 它可以对每个 $or 子句使用一个索引。

# 索引前缀交叉

对于索引交集, mongodb 可以使用整个索引或索引前缀的交集。

索引前缀是复合索引的子集, 由从索引开头开始的一个或多个键组成。

请考虑具有以下索引的集合订单:

```
{ qty: 1 }
{ status: 1, ord_date: -1 }
```

为了完成以下在 qty 字段和状态字段上都指定条件的查询, mongodb 可以使用两个索引的交集:

```
db.orders.find( { qty: { $gt: 10 } , status: "A" } )
```

# 索引交集和复合索引

索引交集并不能消除创建复合索引的需要。

但是, 由于列表顺序 (即键在索引中列出的顺序) 和排序顺序 (即升序或降序) 在复合索引中的事项, 复合索引可能不支持不包括索引前缀或指定不同的排序顺序。

例如, 如果集合订单具有以下复合索引, 状态字段列在 ord_date 字段之前:

```
{ status: 1, ord_date: -1 }
```

- 下面的查询将命中索引

```
db.orders.find( { status: { $in: ["A", "P" ] } } )
db.orders.find(
   {
     ord_date: { $gt: new Date("2014-02-01") },
     status: {$in:[ "P", "A" ] }
   }
)
```

- 下面的查询不会命中索引

```
db.orders.find( { ord_date: { $gt: new Date("2014-02-01") } } )
db.orders.find( { } ).sort( { ord_date: 1 } )
```

## 如果有两个分开的索引

- 索引信息

```
{ status: 1 }
{ ord_date: -1 }
```

这两个索引可以单独或通过索引交集支持上述所有四个查询。

创建支持查询的复合索引还是依赖于索引交集的选择取决于系统的具体情况。

# 索引交集和排序

当 sort () 操作需要与查询谓词完全独立的索引时, 索引交集不适用。

例如, 订单集合具有以下索引:

```
{ qty: 1 }
{ status: 1, ord_date: -1 }
{ status: 1 }
{ ord_date: -1 }
```

- 下面的查询不会命中index intersection 

```
db.orders.find( { qty: { $gt: 10 } } ).sort( { status: 1 } )
```

也就是说, mongodb 不使用 {qty:1} 索引进行查询, 并且对排序使用单独的 { status: 1 } 或 { status: 1, ord_date: -1 } 索引。

但是, mongodb 可以使用索引交集对以下查询进行排序, 因为索引 { status: 1, ord_date: -1 } 可以完成部分查询谓词。

```
db.orders.find( { qty: { $gt: 10 } , status: "A" } ).sort( { ord_date: -1 } )
```

# 参考资料

[index-intersection](https://docs.mongodb.com/manual/core/index-intersection/)

* any list
{:toc}
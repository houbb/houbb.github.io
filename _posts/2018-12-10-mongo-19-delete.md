---
layout: post
title: Mongo Delete-19 Mongo 数据删除
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# Delete

## 数据初始化

```
db.inventory.insertMany( [
   { item: "journal", qty: 25, size: { h: 14, w: 21, uom: "cm" }, status: "A" },
   { item: "notebook", qty: 50, size: { h: 8.5, w: 11, uom: "in" }, status: "P" },
   { item: "paper", qty: 100, size: { h: 8.5, w: 11, uom: "in" }, status: "D" },
   { item: "planner", qty: 75, size: { h: 22.85, w: 30, uom: "cm" }, status: "D" },
   { item: "postcard", qty: 45, size: { h: 10, w: 15.25, uom: "cm" }, status: "A" },
] );
```

## 删除所有文档

若要从集合中删除所有文档, 请将空筛选器文档 {} 传递给 db.collection.deleteMany() 方法。

下面的示例从库存集合中删除所有文档:

```
db.inventory.deleteMany({})
```

## 删除所有匹配的数据

您可以指定标识要删除的文档的条件或筛选器。筛选器使用与读取操作相同的语法。

若要指定相等条件, 请使用查询筛选器文档中 `<field>:<value>` 表达式:

```
{ <field1>: <value1>, ... }
```

- 例子

若要删除与删除条件匹配的所有文档, 请将筛选器参数传递给 deleteMany() 方法。

下面的示例从库存集合中删除状态字段等于 "a" 的所有文档:

```
db.inventory.deleteMany({ status : "A" })
```

## 删除一个匹配的数据

若要最多删除与指定筛选器匹配的单个文档 (即使多个文档可能与指定筛选器匹配), 请使用 db.collection.deleteOne() 方法。

下面的示例删除状态为 "d" 的第一个文档:

```
db.inventory.deleteOne( { status: "D" } )
```

# 删除行为

## 指标

删除操作不会删除索引, 即使从集合中删除所有文档也是如此。

## 原子性

mongodb 中的所有写入操作在单个文档的级别上都是原子的。

有关 mongodb 和原子性的详细信息, 请参阅原子性和事务。

# 参考资料

[delete-documents](https://docs.mongodb.com/manual/tutorial/remove-documents/)

* any list
{:toc}
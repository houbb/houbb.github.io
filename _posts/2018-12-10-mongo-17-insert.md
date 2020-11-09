---
layout: post
title: Mongo Insert-17 Mongo 数据插入
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# Insert

此页提供了 mongodb 中插入操作的示例。

## 创建一个集合

如果集合当前不存在, 则插入操作将创建集合。

## 插入单个文档

3.2 版中的新版本。

`db.collection.insertOne()` 将单个文档插入到集合中。

下面的示例将新文档插入到清单集合中。

如果文档未指定 _id 字段, mongodb 将带有 objectid 值的 _id 字段添加到新文档中。请参阅插入行为。

```
db.inventory.insertOne(
   { item: "canvas", qty: 100, tags: ["cotton"], size: { h: 28, w: 35.5, uom: "cm" } }
)
```

返回包含新插入的文档的 _id 字段值的文档。有关返回文档的示例, 请参阅 db.collection.insertOne() 引用。

若要检索刚插入的文档, 请查询集合:

```
db.inventory.find( { item: "canvas" } )
```

## 插入多个文档

3.2 版中的新版本。

`db.collection.insertMany()` 可以将多个文档插入到集合中。将文档数组传递给该方法。

下面的示例将三个新文档插入到清单集合中。

如果文档未指定 _id 字段, mongodb 将带有 objectid 值的 _id 字段添加到每个文档中。

请参阅插入行为。

```
db.inventory.insertMany([
   { item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
   { item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
   { item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
])
```

insertMany() 返回包含新插入的文档 _id 字段值的文档。请参阅示例的引用。

若要检索插入的文档, 请查询集合:

```
db.inventory.find( {} )
```

## 插入行为

### 集合创建

如果集合当前不存在, 则插入操作将创建集合。

### _id 字段

在 mongodb 中, 存储在集合中的每个文档都需要一个唯一的 _id 字段, 该字段充当主键。

如果插入的文档省略了 _id 字段, mongodb 驱动程序将自动为 _id 字段生成 objectid。

这也适用于通过更新操作插入的文档, 使用 upsert: true。

### 原子性

mongodb 中的所有写入操作在单个文档的级别上都是原子的。

有关 mongodb 和原子性的详细信息, 请参阅原子性和事务

### 写确认

有了写问题, 您可以指定从 mongodb 请求的写入操作的确认级别。

有关详细信息, 请参阅写入关注。

# Query Documents

此页提供了使用 mongo shell 中的 db.collection.find() 方法进行查询操作的示例。

此页上的示例使用库存集合。若要填充清单集合, 请运行以下命令:

```
db.inventory.insertMany([
   { item: "journal", qty: 25, size: { h: 14, w: 21, uom: "cm" }, status: "A" },
   { item: "notebook", qty: 50, size: { h: 8.5, w: 11, uom: "in" }, status: "A" },
   { item: "paper", qty: 100, size: { h: 8.5, w: 11, uom: "in" }, status: "D" },
   { item: "planner", qty: 75, size: { h: 22.85, w: 30, uom: "cm" }, status: "D" },
   { item: "postcard", qty: 45, size: { h: 10, w: 15.25, uom: "cm" }, status: "A" }
]);
```

## 查询所有

```
db.inventory.find( {} )
```

## 指定相等的条件

下面的示例从库存集合中选择状态等于 "d" 的所有文档:

```
db.inventory.find( { status: "D" } )
```

## 指定查询条件

查询筛选器文档可以使用查询运算符以以下形式指定条件:

```
db.inventory.find( { status: { $in: [ "A", "D" ] } } )
```

> 注意

尽管可以使用 $or 运算符来表示此查询, 但在对同一字段执行相等性检查时, 请使用 `$in` 运算符, 而不是 $or 运算符。

## 指定 & 条件

复合查询可以为集合文档中的多个字段指定条件。

隐式地, 逻辑 and 连词连接复合查询的子句, 以便查询选择集合中与所有条件匹配的文档。

下面的示例检索清单集合中状态等于 "a" 且 qty 小于 ($lt) 30 的所有文档:

```
db.inventory.find( { status: "A", qty: { $lt: 30 } } )
```

## 指定 or 条件

使用 $or 运算符, 可以指定一个复合查询, 该查询用逻辑或连词连接每个子句, 以便查询选择集合中至少匹配一个条件的文档。

下面的示例检索集合中状态等于 "a" 或 qty 小于 ($lt) 30 的所有文档:

```
db.inventory.find( { $or: [ { status: "A" }, { qty: { $lt: 30 } } ] } )
```

### 使用 and/or

在下面的示例中, 复合查询文档选择集合中状态等于 "a" 且数量小于 ($lt) 30 或项目以字符 p 开头的集合中的所有文档:

```
db.inventory.find( {
     status: "A",
     $or: [ { qty: { $lt: 30 } }, { item: /^p/ } ]
} )
```

## 行为

### 光标

`db.collection.find()` 方法将光标返回到匹配的文档。

### 阅读隔离

3.2 版中的新版本。

对于对副本集和副本集分片的读取, 读取关注允许客户端为其读取选择隔离级别。

有关详细信息, 请参阅阅读关注。

# 参考资料

[insert-documents](https://docs.mongodb.com/manual/tutorial/insert-documents/#insert-documents)

* any list
{:toc}
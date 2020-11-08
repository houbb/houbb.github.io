---
layout: post
title: Mongo Update-18 Mongo 更新操作
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# Update

此页上的示例使用库存集合。

## 数据准备

若要创建和/或填充清单集合, 请运行以下命令:

```
db.inventory.insertMany( [
   { item: "canvas", qty: 100, size: { h: 28, w: 35.5, uom: "cm" }, status: "A" },
   { item: "journal", qty: 25, size: { h: 14, w: 21, uom: "cm" }, status: "A" },
   { item: "mat", qty: 85, size: { h: 27.9, w: 35.5, uom: "cm" }, status: "A" },
   { item: "mousepad", qty: 25, size: { h: 19, w: 22.85, uom: "cm" }, status: "P" },
   { item: "notebook", qty: 50, size: { h: 8.5, w: 11, uom: "in" }, status: "P" },
   { item: "paper", qty: 100, size: { h: 8.5, w: 11, uom: "in" }, status: "D" },
   { item: "planner", qty: 75, size: { h: 22.85, w: 30, uom: "cm" }, status: "D" },
   { item: "postcard", qty: 45, size: { h: 10, w: 15.25, uom: "cm" }, status: "A" },
   { item: "sketchbook", qty: 80, size: { h: 14, w: 21, uom: "cm" }, status: "A" },
   { item: "sketch pad", qty: 95, size: { h: 22.85, w: 30.5, uom: "cm" }, status: "A" }
] );
```

# 更新集合中的文档

若要更新文档, mongodb 提供更新运算符 (如 $set) 来修改字段值。

若要使用更新运算符, 请将窗体的更新文档传递给更新方法:

```
{
  <update operator>: { <field1>: <value1>, ... },
  <update operator>: { <field2>: <value2>, ... },
  ...
}
```

如果字段不存在, 某些更新运算符 (如 $set) 将创建该字段。

有关详细信息, 请参阅各个更新运算符参考。

## 更新单个 Document

```
db.inventory.updateOne(
   { item: "paper" },
   {
     $set: { "size.uom": "cm", status: "P" },
     $currentDate: { lastModified: true }
   }
)
```

- 更新操作:

使用 $set 运算符将大小. uom 字段的值更新为 "cm", 将状态字段的值更新为 "p",

使用 $currentDate 运算符将 "上次修改" 字段的值更新到当前日期。

如果 "上次修改" 字段不存在, $currentDate 将创建该字段。

有关详细信息, 请参阅 [$currentDate](https://docs.mongodb.com/manual/reference/operator/update/currentDate/#up._S_currentDate)。

## 更新多个 Document

3.2 版中的新版本。

下面的示例使用库存收集上的 db.collection.updateMany() 方法更新数量小于50的所有文档:

```
db.inventory.updateMany(
   { "qty": { $lt: 50 } },
   {
     $set: { "size.uom": "in", status: "P" },
     $currentDate: { lastModified: true }
   }
)
```

# 替换文档

若要替换除 _id 字段之外的文档的全部内容, 请将一个全新的文档作为第二个参数传递给 db.collection.replaceOne ()。

替换文档时, 替换文档必须仅包含字段/值对; 替换文档必须仅包含字段/值对。即不包括更新运算符表达式。

替换文档可以具有与原始文档不同的字段。在替换文档中, 您可以省略 _id 字段, 因为 _id 字段是不可变的;但是, 如果确实包含 _id 字段, 则它必须具有与当前值相同的值。

下面的示例替换 inventory 集合中的第一个文档, 其中的item:  "paper":

```
db.inventory.replaceOne(
   { item: "paper" },
   { item: "paper", instock: [ { warehouse: "A", qty: 60 }, { warehouse: "B", qty: 40 } ] }
)
```

# 行为

## 原子性

MongoDB中的所有写入操作都是单个文档级别的原子操作。有关MongoDB和原子性的更多信息，请参阅Atomicity和Transactions。

## _id Field

设置后，您无法更新_id字段的值，也无法使用具有不同_id字段值的替换文档替换现有文档。

## 文件大小

执行将文档大小增加到超出该文档的已分配空间的更新操作时，更新操作会将文档重定位到磁盘上。

## 现场订单

除了以下情况之外，MongoDB在写操作之后保留文档字段的顺序：

## _id字段始终是文档中的第一个字段。

包括重命名字段名称的更新可能会导致文档中字段的重新排序。

在2.6版中更改：从2.6版开始，MongoDB主动尝试保留文档中的字段顺序。

在2.6版之前，MongoDB没有主动保留文档中字段的顺序。

## Upsert选项

如果updateOne()，updateMany() 或replaceOne() 包含upsert：true且没有文档与指定的过滤器匹配，则操作将创建一个新文档并将其插入。

如果存在匹配的文档，则操作修改或替换匹配的文档。

有关创建的新文档的详细信息，请参阅方法的各个参考页面。

## 写确认

对于写入问题，您可以指定MongoDB请求的写入操作的确认级别。

有关详细信息，请参阅[写入关注](https://docs.mongodb.com/manual/reference/write-concern/)。

# 参考资料

[update-documents](https://docs.mongodb.com/manual/tutorial/update-documents/)

* any list
{:toc}
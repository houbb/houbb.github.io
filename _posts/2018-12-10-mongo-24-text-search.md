---
layout: post
title: Mongo Text Search-24 Mongo 文本索引查询
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, index, mongo, sh]
published: true
---

# 概览

mongodb 支持对字符串内容执行文本搜索的查询操作。

若要执行文本搜索, mongodb 使用文本索引和 `$text` 运算符。

> views 不支持 text search

# 例子

此示例演示如何构建文本索引并使用它来查找咖啡店, 只给出文本字段。

使用以下文档创建集合存储:

```
db.stores.insert(
   [
     { _id: 1, name: "Java Hut", description: "Coffee and cakes" },
     { _id: 2, name: "Burger Buns", description: "Gourmet hamburgers" },
     { _id: 3, name: "Coffee Shop", description: "Just coffee" },
     { _id: 4, name: "Clothes Clothes Clothes", description: "Discount clothing" },
     { _id: 5, name: "Java Shopping", description: "Indonesian goods" }
   ]
)
```

## 文本索引

mongodb 提供文本索引, 以支持对字符串内容的文本搜索查询。

文本索引可以包括其值为字符串或字符串元素数组的任何字段。

若要执行文本搜索查询, 必须在集合上具有文本索引。

集合只能有一个文本搜索索引, 但该索引可以覆盖多个字段。

例如, 您可以在 mongo shell 中运行以下内容, 以允许在名称和说明字段上搜索文本:

```
db.stores.createIndex( { name: "text", description: "text" } )
```

## $text 查询运算符

使用 $text 查询运算符对具有文本索引的集合执行文本搜索。

$text 将使用空格和大多数标点符号作为分隔符标记搜索字符串, 并对搜索字符串中的所有此类标记执行逻辑 or。

例如, 您可以使用以下查询查找包含列表 "coffee"、"shop" 和 "java" 中任何术语的所有商店:

```
db.stores.find( { $text: { $search: "java coffee shop" } } )
```

- 结果

```
{ "_id" : 3, "name" : "Coffee Shop", "description" : "Just coffee" }
{ "_id" : 1, "name" : "Java Hut", "description" : "Coffee and cakes" }
{ "_id" : 5, "name" : "Java Shopping", "description" : "Indonesian goods" }
```

## 准确的短语

您还可以通过用双引号包装来搜索精确的短语。

例如, 下面将找到包含 "java" 或 "coffee shop" 的所有文档:

```
db.stores.find( { $text: { $search: "java \"coffee shop\"" } } )
```

- 结果

```
{ "_id" : 3, "name" : "Coffee Shop", "description" : "Just coffee" }
```

## 期限排除

若要排除某个单词, 可以在 `-` 字符之前加上。

例如, 要查找包含 "java" 或 "shop" 但不包含 "coffee" 的所有商店, 请使用以下内容:

```
db.stores.find( { $text: { $search: "java shop -coffee" } } )
```

- 结果

```
{ "_id" : 5, "name" : "Java Shopping", "description" : "Indonesian goods" }
```

## 排序

默认情况下, mongodb 将按未排序的顺序返回其结果。

但是, 文本搜索查询将计算每个文档的相关性分数, 该分数指定文档与查询的匹配程度。

若要按相关性分数排序结果, 必须显式投影 `$meta` 的 "textScore" 字段, 并对其进行排序:

```
db.stores.find(
   { $text: { $search: "java coffee shop" } },
   { score: { $meta: "textScore" } }
).sort( { score: { $meta: "textScore" } } )
```

- 结果

```
{ "_id" : 3, "name" : "Coffee Shop", "description" : "Just coffee", "score" : 2.25 }
{ "_id" : 1, "name" : "Java Hut", "description" : "Coffee and cakes", "score" : 1.5 }
{ "_id" : 5, "name" : "Java Shopping", "description" : "Indonesian goods", "score" : 1.5 }
```

# 文本索引

mongodb 提供文本索引, 以支持对字符串内容的文本搜索查询。

文本索引可以包括其值为字符串或字符串元素数组的任何字段。

若要执行文本搜索查询, 必须在集合上具有文本索引。集合只能有一个文本搜索索引, 但该索引可以覆盖多个字段。

例如, 您可以在 mongo shell 中运行以下内容, 以允许在名称和说明字段上搜索文本:

```
db.stores.createIndex( { name: "text", description: "text" } )
```

> [文本索引](https://docs.mongodb.com/manual/core/index-text/)


# 参考资料

[Text Search](https://docs.mongodb.com/manual/text-search/)

* any list
{:toc}
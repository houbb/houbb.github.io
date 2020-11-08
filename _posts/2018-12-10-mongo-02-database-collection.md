---
layout: post
title: Mongo database & collection-02
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
excerpt: Mongo-02-database & collection
---

# Databases and Collections

Mongo 存储为 BJSON 的文档，数据记录存在 Collections，Collections 存储在Databases。

# 数据库

在MongoDB中，数据库包含文档集合。

要选择要使用的数据库，请在mongo shell中发出`use <db>`语句，如以下示例所示

```
use myDB
```

## 新建

如果数据库不存在，MongoDB会在您第一次存储该数据库的数据时创建数据库。

因此，您可以切换到不存在的数据库并在mongo shell中执行以下操作：

```
use myDB
```

当然，数据库的命名规则见：[restrictions-on-db-names](https://docs.mongodb.com/manual/reference/limits/#restrictions-on-db-names)

# 集合

MongoDB将文档存储在集合中。集合类似于关系数据库中的表。

## 创建一个集合

如果集合不存在，MongoDB会在您第一次存储该集合的数据时创建该集合。

```
db.myNewCollection2.insertOne( { x: 1 } )
db.myNewCollection3.createIndex( { y: 1 } )
```

命名规则见：[restrictions-on-collection-names](https://docs.mongodb.com/manual/reference/limits/#restrictions-on-collection-names)

## 显式创造

MongoDB提供了 `db.createCollection()`方法，以显式创建具有各种选项的集合，例如设置最大大小或文档验证规则。

如果未指定这些选项，则无需显式创建集合，因为MongoDB在首次存储集合数据时会创建新集合。

要修改这些集合选项，请参阅 [collMod](https://docs.mongodb.com/manual/reference/command/collMod/#dbcmd.collMod)。

## 文件验证

版本3.2中的新功能。

默认情况下，集合不要求其文档具有相同的模式;即，单个集合中的文档不需要具有相同的字段集，并且字段的数据类型可以在集合中的文档之间不同。

但是，从MongoDB 3.2开始，您可以在更新和插入操作期间强制执行集合的文档验证规则。有关详细信息，请参阅架构验证。

## 修改文档结构

要更改集合中文档的结构（例如添加新字段，删除现有字段或将字段值更改为新类型），请将文档更新为新结构。

## 唯一标识符

版本3.6中的新功能。

> 注意

featureCompatibilityVersion必须设置为“3.6”或更高。

有关更多信息，请参阅查看FeatureCompatibilityVersion。

为集合分配了不可变的UUID。集合UUID在副本集的所有成员和分片集群中的分片中保持相同。

要检索集合的UUID，请运行listCollections命令或 `db.getCollectionInfos()` 方法。

# Views

从3.4版开始，MongoDB增加了对从现有集合或其他视图创建只读视图的支持。

## 创建视图

现有create命令的viewOn和pipeline选项（以及db.createCollection helper）

```
db.runCommand( { create: <view>, viewOn: <source>, pipeline: <pipeline> } )
```

或者指定一个默认的 collation

```
db.runCommand( { create: <view>, viewOn: <source>, pipeline: <pipeline>, collation: <collation> } )
```

or

```
db.createView(<view>, <source>, <pipeline>, <collation> )
```

## 特性

### 只读

视图是只读的;对视图执行写操作会出错。

以下读取操作可以支持视图：

```
db.collection.find()
db.collection.findOne()
db.collection.aggregate()
db.collection.countDocuments()
db.collection.estimatedDocumentCount()
db.collection.count()
db.collection.distinct()
```

### 视图使用基于集合的索引

由于索引位于基础集合上，因此无法直接在视图上创建，删除或重新构建索引，也无法在视图上获取索引列表。

您无法在视图上指定 $natural 排序。

例如，以下操作无效：

```
db.view.find().sort({$natural: 1})
```

### 投影限制

对视图的find()操作不支持以下投影操作符：

```
$
$elemMatch
$slice
$meta
```

### 不可变的名称

你不能重命名 view

### 查看创作

在读取操作期间按需计算视图，MongoDB对视图执行读取操作，作为底层聚合管道的一部分。因此，视图不支持以下操作：

`db.collection.mapReduce()`

$text 运算符，因为聚合中的$ text操作仅对第一阶段有效，

$geoNear 管道阶段和不推荐使用的geoNear命令。

如果用于创建视图的聚合管道禁止_id字段，则视图中的文档不具有_id字段。

### 碎片视图

如果视图的基础集合是分片的，则视图将被视为分片。

因此，您无法在$lookup和$graphLookup操作中为from字段指定分片视图。

### Views and Collation

您可以在创建时为视图指定默认排序规则。如果未指定排序规则，则视图的默认排序规则是“简单”二进制比较排序规则。

也就是说，视图不会继承集合的默认排序规则。

视图上的字符串比较使用视图的默认排序规则。尝试更改或覆盖视图的默认排序规则的操作将失败并显示错误。
如果从另一个视图创建视图，则无法指定与源视图的排序规则不同的排序规则。

如果执行涉及多个视图的聚合，则视图必须具有相同的排序规则。

### 公共视图定义

列出集合的操作（例如db.getCollectionInfos() 和db.getCollectionNames() ）在其输出中包含视图。

> 重要

视图定义是公开的;

即 db.getCollectionInfos() 和解释视图上的操作将包括定义视图的管道。

因此，请避免直接引用视图定义中的敏感字段和值。

## 删除视图

要删除视图，请在视图上使用 `db.collection.drop()` 方法。

## 修改视图

您可以通过删除和重新创建视图或使用collMod命令来修改视图。

# Capped Collections

## 概观

[加盖集合](https://docs.mongodb.com/manual/reference/glossary/#term-capped-collection)是固定大小的集合，支持基于插入顺序插入和检索文档的高吞吐量操作。

加盖的集合以类似于循环缓冲区的方式工作：一旦集合填充其分配的空间，它通过覆盖集合中最旧的文档为新文档腾出空间。

有关创建上限集合的更多信息，请参阅createCollection()或create。

## 特性

### 插入顺序

加盖的集合保证了插入顺序的保留。

因此，查询不需要索引来按插入顺序返回文档。

如果没有此索引开销，上限集合可以支持更高的插入吞吐量。

### 自动删除最旧的文档

为了为新文档腾出空间，上限集合会自动删除集合中最旧的文档，而无需脚本或显式删除操作。

考虑以下针对上限集合的潜在用例：

存储由大容量系统生成的日志信息。在没有索引的情况下将文档插入到上限集合中，这与将日志信息直接写入文件系统的速度接近。

此外，内置的先进先出属性维护事件的顺序，同时管理存储使用。

在封顶集合中缓存少量数据。由于缓存是读取而不是写入较大，因此您需要确保此集合始终保留在工作集中（即在RAM中）或接受对所需索引或索引的一些写入惩罚。

例如，在副本集中存储操作日志的oplog.rs集合使用上限集合。从MongoDB 4.0开始，与其他上限集合不同，oplog可以超过其配置的大小限制，以避免删除多数提交点。

### _id索引

默认情况下，上限集合在_id字段上有_id字段和索引。

## 限制和建议

### 更新

如果计划更新上限集合中的文档，请创建索引，以便这些更新操作不需要进行集合扫描。

### 文件大小

版本3.2中已更改。

如果更新或替换操作更改了文档大小，则操作将失败。

### 文件删除

您无法从上限集合中删除文档。要从集合中删除所有文档，请使用drop（）方法删除集合并重新创建有上限的集合。

### Sharding

不支持

### 查询效率

使用自然排序可以有效地从集合中检索最近插入的元素。这有点类似于日志文件中的tail。

### 聚合$out

聚合管道运算符$out无法将结果写入上限集合。

## 程序

## 创建一个上限集合

您必须使用db.createCollection() 方法显式创建上限集合，该方法是create命令的mongo shell中的帮助程序。

创建上限集合时，必须以字节为单位指定集合的​​最大大小，MongoDB将为集合预先分配。有顶集合的大小包括少量的内部空间。

```
db.createCollection( "log", { capped: true, size: 100000 } )
```

如果size字段小于或等于4096，则集合的上限为4096字节。否则，MongoDB将提高提供的大小，使其成为256的整数倍。

此外，您还可以使用max字段为集合指定最大文档数，如以下文档中所示：

```
db.createCollection("log", { capped : true, size : 5242880, max : 5000 } )
```

> 重要

即使指定了最大文档数，也始终需要size参数。

如果集合在达到最大文档计数之前达到最大大小限制，MongoDB将删除旧文档。


## 查询上限集合

如果在没有指定排序的上限集合上执行find()，MongoDB会保证结果的排序与插入顺序相同。

要以反向插入顺序检索文档，请将find()与sort()方法一起发出，并将$ natural参数设置为-1，如以下示例所示：

```
db.cappedCollection.find().sort( { $natural: -1 } )
```

## 检查集合是否有上限

使用isCapped() 方法确定集合是否有上限，如下所示：

```
db.collection.isCapped()
```

## 将集合转换为上限

您可以使用convertToCapped命令将非上限集合转换为上限集合：

```
db.runCommand（{“convertToCapped”：“mycoll”，size：100000}）;
```

size参数指定上限集合的大小（以字节为单位）。

这在操作期间保存数据库独占锁。锁定同一数据库的其他操作将被阻止，直到操作完成。

请参阅一些常见客户端操作所采取的锁定？用于锁定数据库的操作。

## 在指定的时间段后自动删除数据

作为封顶集合的替代方案，请考虑MongoDB的TTL（“生存时间”）索引。

如通过设置TTL从集合中过期数据中所述，这些索引允许您根据日期类型字段的值和索引的TTL值使正常集合中的数据过期和删除。

> 重要

TTL索引与上限集合不兼容

## Tailable Cursor

您可以使用带有上限集合的tailable游标。

与Unix tail -f命令类似，tailable游标“尾巴”加盖的集合的末尾。将新文档插入到上限集合中时，可以使用tailable游标继续检索文档。

有关创建tailable游标的信息，请参阅 [tailable-cursors](https://docs.mongodb.com/manual/core/tailable-cursors/)


# 参考资料

https://docs.mongodb.com/manual/core/databases-and-collections/

* any list
{:toc}
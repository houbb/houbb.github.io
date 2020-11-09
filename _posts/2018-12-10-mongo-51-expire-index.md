---
layout: post
title: Mongo 51-mongo expire mongo 过期索引 TTL Index
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, index, sh]
published: true
---

# 如何优雅删除

## ttl index 作用

有些类似于 redis 的 expire，设置之后，mongo 会有一个异步进程去定时清理数据信息。

## 应用场景

现在的 mongo 中存放每天的数据信息，前一天的数据信息会进行清空。

原来是采用定时任务清空的方式。

定时任务虽然可以指定时间，但是对于 mongo 的瞬时压力还是很大的。

## 解决方式

使用 ttl index 

# TTL Index

TTL索引是特殊的单字段索引，MongoDB可以使用它在一定时间后或在特定时钟时间自动从集合中删除文档。 

数据到期对于某些类型的信息非常有用，例如机器生成的事件数据，日志和会话信息，这些信息只需要在数据库中持续有限的时间。

## 创建方式

要创建TTL索引，请对值为日期或包含日期值的数组的字段使用 `db.collection.createIndex()` 方法和expireAfterSeconds选项。

例如，要在eventlog集合的lastModifiedDate字段上创建TTL索引，请在mongo shell中使用以下操作：

```
db.eventlog.createIndex( { "lastModifiedDate": 1 }, { expireAfterSeconds: 3600 } )
```

## Behavior

### 数据到期

TTL索引在索引字段值超过指定的秒数后过期文档; 即，到期阈值是索引字段值加上指定的秒数。

如果字段是数组，并且索引中有多个日期值，则MongoDB使用数组中的最低（即最早）日期值来计算到期阈值。

如果文档中的索引字段不是日期或包含日期值的数组，则文档将不会过期。

如果文档不包含索引字段，则文档不会过期。

### 删除操作

mongod中的后台线程读取索引中的值并从集合中删除过期的文档。

当TTL线程处于活动状态时，您将在 db.currentOp() 的输出或数据库探查器收集的数据中看到删除操作。

### 删除操作的时间

对于功能兼容版本（fcv）“4.2”，MongoDB在索引完成构建后立即开始删除过期文档。

对于功能兼容版本（fcv）“4.0”，删除操作的时间取决于索引构建类型：

使用前景索引构建，MongoDB只能在构建完成后才开始删除过期文档。

使用后台索引构建，MongoDB可以在构建处理它们后立即开始删除过期文档。

有关索引构建过程的更多信息，请参阅填充集合上的索引构建。

TTL索引不保证在到期时立即删除过期数据。文档到期的时间与MongoDB从数据库中删除文档的时间之间可能存在延迟。

**删除过期文档的后台任务每60秒运行一次。**

结果，文档可能在文档到期和后台任务运行之间的期间保留在集合中。

由于删除操作的持续时间取决于您的mongod实例的工作负载，因此过期数据可能会在后台任务运行之间的60秒之后的某个时间段内存在。

### 副本集

在副本集成员上，TTL后台线程仅在成员处于主状态时删除文档。 

当成员处于辅助状态时，TTL后台线程处于空闲状态。 

辅助成员从主要成员复制删除操作。

### 支持查询

TTL索引支持非TTL索引的查询方式。

ps: **类似于直接建立了一个索引，也存在一个问题。会增加索引创建的压力。**

## 限制

- TTL索引是单字段索引。 

复合索引不支持TTL并忽略expireAfterSeconds选项。

- _id字段不支持TTL索引。

您无法在 capped collection 上创建TTL索引，因为MongoDB无法从上限集合中删除文档。

- 您不能使用createIndex() 来更改现有索引的expireAfterSeconds值。 

而是将collMod数据库命令与索引集合标志结合使用。 

否则，**要更改现有索引的选项的值，必须先删除索引并重新创建。**

如果字段已存在非TTL单字段索引，则无法在同一字段上创建TTL索引，因为您无法创建具有相同密钥规范且仅由选项不同的索引。 

要将非TTL单字段索引更改为TTL索引，必须先删除索引并使用expireAfterSeconds选项重新创建。

# Expire Data from Collections by Setting TTL

## 内容概要

本文档介绍了MongoDB的“生存时间”或TTL收集功能。 

TTL集合使得可以在MongoDB中存储数据，并使mongod在指定的秒数或特定的时钟时间后自动删除数据。

数据到期对于某些类别的信息很有用，包括机器生成的事件数据，日志和会话信息，这些信息只需要在有限的时间段内保留。

特殊的TTL索引属性支持TTL集合的实现。

TTL功能依赖于mongod中的后台线程，该线程读取索引中的日期类型值并从集合中删除过期的文档。

## 在指定的秒数后过期文档

要在索引字段后经过指定秒数后使数据到期，请在保存BSON日期类型值或BSON日期类型对象数组的字段上创建TTL索引，并在expireAfterSeconds中指定正非零值领域。 

当expireAfterSeconds字段中的秒数自其索引字段中指定的时间过去后，文档将过期。

例如，以下操作在log_events集合的createdAt字段上创建索引，并指定expireAfterSeconds值3600，以将到期时间设置为createdAt指定的时间之后24小时。

```
db.log_events.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 86,400‬ } )
```

将文档添加到log_events集合时，将createdAt字段设置为当前时间：

```
db.log_events.insert( {
   "createdAt": new Date(),
   "logEvent": 2,
   "logMessage": "Success!"
} )
```

当文档的createdAt值早于expireAfterSeconds中指定的秒数时，MongoDB将自动从log_events集合中删除文档。


## 在特定时钟时间过期文档

要在特定时钟时间到期文档，首先在保存BSON日期类型值或BSON日期类型对象数组的字段上创建TTL索引，并指定expireAfterSeconds值为0。

对于集合中的每个文档，设置 索引日期字段为与文档到期时间对应的值。 

如果索引日期字段包含过去的日期，MongoDB会认为文档已过期。

例如，以下操作在log_events集合的expireAt字段上创建索引，并指定expireAfterSeconds值为0：

```
db.log_events.createIndex( { "expireAt": 1 }, { expireAfterSeconds: 0 } )
```

对于每个文档，将expireAt的值设置为与文档到期的时间相对应。 

例如，以下insert（）操作会添加一个文档，该文档将于2013年7月22日14:00:00到期。

```
db.log_events.insert( {
   "expireAt": new Date('July 22, 2013 14:00:00'),
   "logEvent": 2,
   "logMessage": "Success!"
} )
```

当文档的expireAt值早于expireAfterSeconds中指定的秒数时，MongoDB将自动从log_events集合中删除文档，即在这种情况下为0秒。 因此，数据在指定的expireAt值处到期。

# 实战记录

## 创建 ttl 索引

100s 后过期

```
db.test.createIndex( { "createdAt": 1 }, { expireAfterSeconds:100 } )
```

日志信息

```
{
    "createdCollectionAutomatically" : false,
    "numIndexesBefore" : 2,
    "numIndexesAfter" : 3,
    "ok" : 1.0
}
```

## 插入数据

```
db.test.insert( {
   "createdAt": new Date(),
   "name": "test for expire",
} )
```

## 查询

```
db.test.find({"name": "test for expire"})
```

刚插入是有数据的。

等待 3min 再次查询：

成功删除。

# 参考资料

- mongo

[ttl index](https://docs.mongodb.com/manual/core/index-ttl/)

[expire-data](https://docs.mongodb.com/manual/tutorial/expire-data/)

- other

[Working with MongoDB TTL (Time-To-Live) Index](http://hassansin.github.io/working-with-mongodb-ttl-index)

[spring-boot-mongodb-indexed-with-expireafterseconds-to-auto-delete-document-does](https://stackoverflow.com/questions/50533151/spring-boot-mongodb-indexed-with-expireafterseconds-to-auto-delete-document-does)

* any list
{:toc}
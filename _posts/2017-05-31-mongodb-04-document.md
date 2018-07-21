---
layout: post
title:  MongoDB-04-document 
date:  2017-05-31 13:41:22 +0800
categories: [SQL]
tags: [sql, nosql, mongodb]
published: true
---


# Insert Document

本章节中我们将向大家介绍如何将数据插入到MongoDB的集合中。
文档的数据结构和JSON基本一样。
所有存储在集合中的数据都是BSON格式。
BSON是一种类json的一种二进制形式的存储格式,简称Binary JSON。

一、常规处理方式

- 插入文档

MongoDB 使用 insert() 或 save() 方法向集合中插入文档，语法如下：

```
db.COLLECTION_NAME.insert(document)
```

- 实例

以下文档可以存储在 MongoDB 的 test 数据库 的 col 集合中：

```
> use test;
switched to db test

> db.col.insert({title: 'MongoDB 教程', 
    description: 'MongoDB 是一个 Nosql 数据库',
    by: '菜鸟教程',
    url: 'http://www.runoob.com',
    tags: ['mongodb', 'database', 'NoSQL'],
    likes: 100
});

WriteResult({ "nInserted" : 1 })
```



以上实例中 col 是我们的集合名，如果该集合不在该数据库中， MongoDB 会**自动创建该集合并插入文档**。


- 查看

```
> db.col.find();
{ "_id" : ObjectId("59396cd67ad7ebedf2146586"), "title" : "MongoDB 教程", "description" : "MongoDB 是一个 Nosql 数据库", "by" : "菜鸟教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
```


二、声明插入法

我们也可以将数据定义为一个变量，如下所示：

```
document=({title: 'MongoDB 教程', 
...     description: 'MongoDB 是一个 Nosql 数据库',
...     by: '菜鸟教程',
...     url: 'http://www.runoob.com',
...     tags: ['mongodb', 'database', 'NoSQL'],
...     likes: 100
... });
{
	"title" : "MongoDB 教程",
	"description" : "MongoDB 是一个 Nosql 数据库",
	"by" : "菜鸟教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"database",
		"NoSQL"
	],
	"likes" : 100
}
```


执行插入

```
> db.col.insert(document);
WriteResult({ "nInserted" : 1 })
```

插入文档你也可以使用 `db.col.save(document)` 命令。如果不指定 _id 字段 save() 方法类似于 insert() 方法。如果指定 _id 字段，则会更新该 _id 的数据。


# Update Document

MongoDB 使用 update() 和 save() 方法来更新集合中的文档。接下来让我们详细来看下两个函数的应用及其区别。

- update() 方法

update() 方法用于更新已存在的文档。语法格式如下：

```
db.collection.update(
   <query>,
   <update>,
   {
     upsert: <boolean>,
     multi: <boolean>,
     writeConcern: <document>
   }
)
```

参数说明：


1. query : update的查询条件，类似sql update查询内where后面的。

2. update : update的对象和一些更新的操作符（如$,$inc...）等，也可以理解为sql update查询内set后面的

3. upsert : 可选，这个参数的意思是，如果不存在update的记录，是否插入objNew,true为插入，默认是false，不插入。

4. multi : 可选，mongodb 默认是false,只更新找到的第一条记录，如果这个参数为true,就把按条件查出来多条记录全部更新。

5. writeConcern :可选，抛出异常的级别。


实例

根据上面的插入插入一条数据。然后更新标题。

```
> db.col.find();
{ "_id" : ObjectId("59396cd67ad7ebedf2146586"), "title" : "MongoDB 教程", "description" : "MongoDB 是一个 Nosql 数据库", "by" : "菜鸟教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
{ "_id" : ObjectId("59396dd67ad7ebedf2146587"), "title" : "MongoDB 教程", "description" : "MongoDB 是一个 Nosql 数据库", "by" : "菜鸟教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
```

执行更新

```
> db.col.update({'title':'MongoDB 教程'},{$set:{'title':'MongoDB'}});
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
> db.col.find();
{ "_id" : ObjectId("59396cd67ad7ebedf2146586"), "title" : "MongoDB", "description" : "MongoDB 是一个 Nosql 数据库", "by" : "菜鸟教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
{ "_id" : ObjectId("59396dd67ad7ebedf2146587"), "title" : "MongoDB 教程", "description" : "MongoDB 是一个 Nosql 数据库", "by" : "菜鸟教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
```

你会发现只更新了第一个。如果想更新多个，则需要设置 multi 参数为 true。

- save() 方法

save() 方法通过传入的文档来替换已有文档。语法格式如下：

```
db.collection.save(
   <document>,
   {
     writeConcern: <document>
   }
)
```

参数说明：

1. document : 文档数据。

2. writeConcern :可选，抛出异常的级别。

实例

以下实例中我们替换了 _id 为 59396dd67ad7ebedf2146587 的文档数据：

```
> db.col.save({
	"_id" : ObjectId("59396dd67ad7ebedf2146587"),
    "title" : "MongoDB",
    "description" : "MongoDB 是一个 Nosql 数据库",
    "by" : "Runoob",
    "url" : "http://www.runoob.com",
    "tags" : [
            "mongodb",
            "NoSQL"
    ],
    "likes" : 110
})
```

执行查询

```
> db.col.find();
{ "_id" : ObjectId("59396cd67ad7ebedf2146586"), "title" : "MongoDB", "description" : "MongoDB 是一个 Nosql 数据库", "by" : "菜鸟教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
{ "_id" : ObjectId("59396dd67ad7ebedf2146587"), "title" : "MongoDB", "description" : "MongoDB 是一个 Nosql 数据库", "by" : "Runoob", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "NoSQL" ], "likes" : 110 }
```


# Remove Document

在前面的几个章节中我们已经学习了MongoDB中如何为集合添加数据和更新数据。在本章节中我们将继续学习MongoDB集合的删除。

MongoDB remove()函数是用来移除集合中的数据。

MongoDB数据更新可以使用update()函数。在执行remove()函数前先执行find()命令来判断执行的条件是否正确，这是一个比较好的习惯。

语法
remove() 方法的基本语法格式如下所示：

```
db.collection.remove(
   <query>,
   <justOne>
)
```

如果你的 MongoDB 是 2.6 版本以后的，语法格式如下：

```
db.collection.remove(
   <query>,
   {
     justOne: <boolean>,
     writeConcern: <document>
   }
)
```

参数说明：

1. query :（可选）删除的文档的条件。

2. justOne : （可选）如果设为 true 或 1，则只删除一个文档。

3. writeConcern :（可选）抛出异常的级别。


```
> db.col.find();
{ "_id" : ObjectId("59396cd67ad7ebedf2146586"), "title" : "MongoDB", "description" : "MongoDB 是一个 Nosql 数据库", "by" : "菜鸟教程", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "database", "NoSQL" ], "likes" : 100 }
{ "_id" : ObjectId("59396dd67ad7ebedf2146587"), "title" : "MongoDB", "description" : "MongoDB 是一个 Nosql 数据库", "by" : "Runoob", "url" : "http://www.runoob.com", "tags" : [ "mongodb", "NoSQL" ], "likes" : 110 }
```

执行删除

```
> db.col.remove({'title':'MongoDB'});
WriteResult({ "nRemoved" : 2 })
> db.col.find();
> 
```

如果你只想删除第一条找到的记录可以设置 justOne 为 1，如下所示：

```
> db.COLLECTION_NAME.remove(DELETION_CRITERIA,1)
```


# Find Document

MongoDB 查询文档使用 find() 方法。

find() 方法以非结构化的方式来显示所有文档。

MongoDB 查询数据的语法格式如下：

```
db.collection.find(query, projection)
```


1. query ：可选，使用查询操作符指定查询条件

2. projection ：可选，使用投影操作符指定返回的键。查询时返回文档中所有键值， 只需省略该参数即可（默认省略）。

如果你需要以易读的方式来读取数据，可以使用 pretty() 方法，语法格式如下：

```
> db.col.find().pretty()
```

pretty() 方法以格式化的方式来显示所有文档。

```
> db.col.find().pretty();
{
	"_id" : ObjectId("59396dd67ad7ebedf2146587"),
	"title" : "MongoDB",
	"description" : "MongoDB 是一个 Nosql 数据库",
	"by" : "Runoob",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb",
		"NoSQL"
	],
	"likes" : 110
}
```

- MongoDB 与 RDBMS Where 语句比较


| 操作	        | 格式	                    | 范例	                                    | RDBMS中的类似语句 |
|:---|:---|:---|
| 等于	        | {<key>:<value>}	        | db.col.find({"by":"菜鸟教程"}).pretty()	    | where by = '菜鸟教程' |
| 小于	        | {<key>:{$lt:<value>}}	    | db.col.find({"likes":{$lt:50}}).pretty()	| where likes < 50 |
| 小于或等于     | {<key>:{$lte:<value>}}	    | db.col.find({"likes":{$lte:50}}).pretty()	| where likes <= 50 |
| 大于	        | {<key>:{$gt:<value>}}	    | db.col.find({"likes":{$gt:50}}).pretty()	| where likes > 50 |
| 大于或等于 	    | {<key>:{$gte:<value>}}	| db.col.find({"likes":{$gte:50}}).pretty()	| where likes >= 50 |
| 不等于	        | {<key>:{$ne:<value>}}	    | db.col.find({"likes":{$ne:50}}).pretty()	| where likes != 50 |




- MongoDB AND 条件

MongoDB 的 find() 方法可以传入多个键(key)，每个键(key)以逗号隔开，及常规 SQL 的 AND 条件。

语法格式如下：

```
> db.col.find({key1:value1, key2:value2}).pretty()
```

- MongoDB OR 条件

MongoDB OR 条件语句使用了关键字 `$or`, 语法格式如下：

```
> db.col.find(
   {
      $or: [
	     {key1: value1}, {key2:value2}
      ]
   }
).pretty()
```

- AND 和 OR 联合使用

以下实例演示了 AND 和 OR 联合使用，类似常规 SQL 语句为： 'where likes>50 AND (by = '菜鸟教程' OR title = 'MongoDB 教程')'

```
> db.col.find({"likes": {$gt:50}, $or: [{"by": "菜鸟教程"},{"title": "MongoDB 教程"}]}).pretty()
{
        "_id" : ObjectId("56063f17ade2f21f36b03133"),
        "title" : "MongoDB 教程",
        "description" : "MongoDB 是一个 Nosql 数据库",
        "by" : "菜鸟教程",
        "url" : "http://www.runoob.com",
        "tags" : [
                "mongodb",
                "database",
                "NoSQL"
        ],
        "likes" : 100
}
```


* any list
{:toc}









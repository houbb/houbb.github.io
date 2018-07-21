---
layout: post
title:  MongoDB-05-operator
date:  2017-05-31 14:41:22 +0800
categories: [SQL]
tags: [sql, nosql, mongodb]
published: true
---


# Condition Operator

为了测试，我们首先进行数据准备。

```
db.col.find().pretty();
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

首先对数据进行清除

```
> db.col.remove({});
WriteResult({ "nRemoved" : 1 })
```

插入数据

```
> db.col.insert({
...     title: 'PHP 教程', 
...     description: 'PHP 是一种创建动态交互性站点的强有力的服务器端脚本语言。',

...     by: '菜鸟教程',
...     url: 'http://www.runoob.com',
...     tags: ['php'],
...     likes: 200
... });
WriteResult({ "nInserted" : 1 })

> db.col.insert({title: 'Java 教程', 
...     description: 'Java 是由Sun Microsystems公司于1995年5月推出的高级程序设计语言。',
...     by: '菜鸟教程',
...     url: 'http://www.runoob.com',
...     tags: ['java'],
...     likes: 150
... });
WriteResult({ "nInserted" : 1 })

> db.col.insert({title: 'MongoDB 教程', 
...     description: 'MongoDB 是一个 Nosql 数据库',
...     by: '菜鸟教程',
...     url: 'http://www.runoob.com',
...     tags: ['mongodb'],
...     likes: 100
... });
WriteResult({ "nInserted" : 1 })
```

- MongoDB (>) 大于操作符 - $gt

如果你想获取 "col" 集合中 "likes" 大于 100 的数据，你可以使用以下命令：

```
db.col.find({"likes" : {$gt : 100}})
```

类似于SQL语句：

```sql
Select * from col where likes > 100;
```

- MongoDB（>=）大于等于操作符 - $gte

如果你想获取"col"集合中 "likes" 大于等于 100 的数据，你可以使用以下命令：

```
db.col.find({likes : {$gte : 100}})
```

类似于SQL语句：

```sql
Select * from col where likes >=100;
```

- MongoDB (<) 小于操作符 - $lt

如果你想获取"col"集合中 "likes" 小于 150 的数据，你可以使用以下命令：

```
db.col.find({likes : {$lt : 150}})
```

类似于SQL语句：

```sql
Select * from col where likes < 150;
```


- MongoDB (<=) 小于操作符 - $lte

如果你想获取"col"集合中 "likes" 小于等于 150 的数据，你可以使用以下命令：

```
db.col.find({likes : {$lte : 150}})
```

类似于SQL语句：

```sql
Select * from col where likes <= 150;
```

- MongoDB 使用 (<) 和 (>) 查询 - $lt 和 $gt

如果你想获取"col"集合中 "likes" 大于100，小于 200 的数据，你可以使用以下命令：

```
db.col.find({likes : {$lt :200, $gt : 100}})
```

类似于SQL语句：

```sql
Select * from col where likes>100 AND  likes<200;
```

# $type Operator

在本章节中，我们将继续讨论MongoDB中条件操作符 $type。

$type操作符是基于BSON类型来检索集合中匹配的数据类型，并返回结果。

MongoDB 中可以使用的类型如下表所示：

| 类型	| 数字	| 备注 |
|:---|:---|:---|
| Double	            | 1	| 
| String	            | 2	|  
| Object	            | 3	|  
| Array	                | 4	|  
| Binary data	        | 5	|  
| Undefined	            | 6	|  已废弃。|
| Object id	            | 7	|  
| Boolean	            | 8	|  
| Date	                | 9	|  
| Null	                | 10|   
| Regular Expression	| 11|   
| JavaScript	        | 13 |	 
| Symbol	                | 14 |	 
| JavaScript (with scope)	| 15 |	 
| 32-bit integer	        | 16 |	 
| Timestamp	                | 17 |	 
| 64-bit integer	        | 18 |	 
| Min key	                | 255 |	Query with -1. |
| Max key	                | 127 |	 


- 实例

如果想获取 "col" 集合中 title 为 String 的数据，你可以使用以下命令：


```
db.col.find({"title" : {$type : 2}})
```

输出结果为：

```
db.col.find({"title" : {$type : 2}}).pretty();
{
	"_id" : ObjectId("593abda34599370cf6e7e7fb"),
	"title" : "PHP 教程",
	"description" : "PHP 是一种创建动态交互性站点的强有力的服务器端脚本语言。",
	"by" : "菜鸟教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"php"
	],
	"likes" : 200
}
{
	"_id" : ObjectId("593abdb34599370cf6e7e7fc"),
	"title" : "Java 教程",
	"description" : "Java 是由Sun Microsystems公司于1995年5月推出的高级程序设计语言。",
	"by" : "菜鸟教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"java"
	],
	"likes" : 150
}
{
	"_id" : ObjectId("593abdc64599370cf6e7e7fd"),
	"title" : "MongoDB 教程",
	"description" : "MongoDB 是一个 Nosql 数据库",
	"by" : "菜鸟教程",
	"url" : "http://www.runoob.com",
	"tags" : [
		"mongodb"
	],
	"likes" : 100
}
```



# Limit() & Skip()

- MongoDB Limit() 方法

如果你需要在MongoDB中读取指定数量的数据记录，可以使用MongoDB的Limit方法，limit()方法接受一个数字参数，该参数指定从MongoDB中读取的记录条数。

limit()方法基本语法如下所示：

```
> db.COLLECTION_NAME.find().limit(NUMBER)
```

实例

```
> db.col.find({},{"title":1,_id:0}).limit(2);
{ "title" : "PHP 教程" }
{ "title" : "Java 教程" }
> db.col.find({},{"title":1,_id:0});
{ "title" : "PHP 教程" }
{ "title" : "Java 教程" }
{ "title" : "MongoDB 教程" }
```


- MongoDB Skip() 方法

我们除了可以使用limit()方法来读取指定数量的数据外，还可以使用skip()方法来跳过指定数量的数据，skip方法同样接受一个数字参数作为跳过的记录条数。

skip() 方法脚本语法格式如下：

```
> db.COLLECTION_NAME.find().limit(NUMBER).skip(NUMBER)
```


实例

```
> db.col.find({},{"title":1,_id:0}).limit(1).skip(1);
{ "title" : "Java 教程" }
```

注: skip()方法默认参数为 0 

* any list
{:toc}

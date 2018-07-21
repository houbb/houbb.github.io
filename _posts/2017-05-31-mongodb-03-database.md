---
layout: post
title:  MongoDB-03-database 
date:  2017-05-31 12:41:22 +0800
categories: [SQL]
tags: [sql, nosql, mongodb]
published: true
---


# Create DB

MongoDB 创建数据库的语法格式如下：

```
use DATABASE_NAME
```

如果数据库不存在，则创建数据库，否则切换到指定数据库。


eg:

```
> use test
switched to db test
> db
test
```

如果你想查看所有数据库，可以使用 `show dbs` 命令

```
> show dbs
admin  0.000GB
local  0.000GB
```

如你所见，我们刚才使用的数据库不在其中。要显示它，我们需要向 test 数据库插入一些数据。


```
> db.test.insert({"name":"db test"})
WriteResult({ "nInserted" : 1 })
```

再次查询, 出现。

```
> show dbs
admin  0.000GB
local  0.000GB
test   0.000GB
```


# Remove DB

MongoDB 删除数据库的语法格式如下：

```
db.dropDatabase()
```

删除当前数据库，默认为 test，你可以使用 db 命令查看当前数据库名。


```
> show dbs
admin  0.000GB
local  0.000GB
test   0.000GB
> use test
switched to db test
```

执行删除

```
> db.dropDatabase();
{ "dropped" : "test", "ok" : 1 }
> show dbs;
admin  0.000GB
local  0.000GB
```



# Remove Collection

集合删除语法格式如下：

```
db.collection.drop()
```

(教程这里不太合适，因为没有提及到集合的创建。)

以下实例删除了 runoob 数据库中的集合 site：

```
> use runoob
switched to db runoob
> show tables
site
> db.site.drop()
true
> show tables
> 
```



* any list
{:toc}









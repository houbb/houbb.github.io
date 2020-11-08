---
layout: post
title: Mongo Manage Index-10 Mongo 管理索引
date: 2018-12-10 11:35:23 +0800 
categories: [Database]
tags: [sql, nosql, index, mongo, sh]
published: true
---

# Manage Index

此页显示如何管理现有索引。有关创建索引的说明, 请参阅特定的索引类型页。

# 查看现有索引

以下各节提供了用于查看集合或整个数据库上的现有索引的方法。

## 列出集合中的所有索引

若要返回集合上所有索引的列表, 请使用 `db.collection.getIndexes()` 方法或驱动程序的类似方法。

例如, 若要查看人员集合上的所有索引, 请运行以下命令:

```
db.getCollection('explain').getIndexes();
```

- 查询结果

```json
[
    {
        "v" : 2,
        "key" : {
            "_id" : 1
        },
        "name" : "_id_",
        "ns" : "test.explain"
    },
    {
        "v" : 2,
        "key" : {
            "a" : 1.0,
            "b" : 1.0
        },
        "name" : "a_1_b_1",
        "ns" : "test.explain"
    },
    {
        "v" : 2,
        "key" : {
            "c" : 1.0
        },
        "name" : "c_1",
        "ns" : "test.explain"
    }
]
```

## 列举数据库的所有索引信息

- 列举数据库名称

`db.getCollectionNames()`

结果：

```
[
    "explain",
    "person"
]
```

- 列举数据库索引

遍历每一个 collection 即可。

## 删除索引

### 指定删除索引的名称

若要删除索引, 请使用 db.collection.dropIndex() 方法。

例如, 下面的操作删除帐户集合中的税 id 字段上的升序索引:

```
db.accounts.dropIndex( { "tax-id": 1 } )
```

### 移除所有的索引

```
db.accounts.dropIndexes()
```

## 修改索引

若要修改现有索引, 需要删除并重新创建索引。

此规则的例外是 TTL 索引, 可以通过 collMod 命令与索引集合标志一起修改。

# 参考资料

[Manage Index](https://docs.mongodb.com/manual/tutorial/manage-indexes/)

* any list
{:toc}
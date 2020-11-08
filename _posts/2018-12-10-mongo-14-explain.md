---
layout: post
title: Mongo Explain-14 Mongo Explain 执行计划
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, explain, mongo, sh]
published: true
---

# 基础知识

[mongo 与 docker](https://houbb.github.io/2018/11/22/docker-mongodb)

[mongo 与 java](https://houbb.github.io/2018/12/05/mongo-java)

[mongo 的索引](https://houbb.github.io/2018/12/10/mongo-07-index)

# 准备工作

## 数据准备

```json
/* 1 */
{
    "_id" : ObjectId("5c07bc41fd7bbd038830240f"),
    "name" : "MongoDB",
    "type" : "database",
    "count" : 1,
    "info" : {
        "x" : 203,
        "y" : 102
    }
}

/* 2 */
{
    "_id" : ObjectId("5c07bd11fd7bbd3914a1ad08"),
    "name" : "MongoDB",
    "type" : "database",
    "count" : 1,
    "info" : {
        "x" : 203,
        "y" : 102
    }
}
```

## 创建索引

我们为 name 和 type 提供索引。

```
db.getCollection('person').createIndex({type: -1, name: -1});
```

## 查看索引

```
db.getCollection('person').getIndex();
```

内容如下：

```json
/* 1 */
[
    {
        "v" : 2,
        "key" : {
            "_id" : 1
        },
        "name" : "_id_",
        "ns" : "test.person"
    },
    {
        "v" : 2,
        "key" : {
            "type" : -1.0,
            "name" : -1.0
        },
        "name" : "type_-1_name_-1",
        "ns" : "test.person"
    }
]
```

- 查看索引的总大小

```
db.getCollection('person').totalIndexSize();
```

结果

```
49152
```

## 删除索引

- 删除索引

```
db.COLLECTION_NAME.dropIndex("INDEX-NAME")
```

比如 `type_-1_name_-1`

- 删除所有的索引

```
db.COLLECTION_NAME.dropIndexes()
```

# 执行 SQL 查看执行计划

指定 name/type，查看执行计划。

基本使用功能：

```
db.getCollection('person').find({name:'MongoDB', type: 'database'}).explain();
```

结果:

```json
{
    "queryPlanner" : {
        "plannerVersion" : 1,
        "namespace" : "test.person",
        "indexFilterSet" : false,
        "parsedQuery" : {
            "$and" : [ 
                {
                    "name" : {
                        "$eq" : "MongoDB"
                    }
                }, 
                {
                    "type" : {
                        "$eq" : "database"
                    }
                }
            ]
        },
        "winningPlan" : {
            "stage" : "FETCH",
            "inputStage" : {
                "stage" : "IXSCAN",
                "keyPattern" : {
                    "type" : -1.0,
                    "name" : -1.0
                },
                "indexName" : "type_-1_name_-1",
                "isMultiKey" : false,
                "multiKeyPaths" : {
                    "type" : [],
                    "name" : []
                },
                "isUnique" : false,
                "isSparse" : false,
                "isPartial" : false,
                "indexVersion" : 2,
                "direction" : "forward",
                "indexBounds" : {
                    "type" : [ 
                        "[\"database\", \"database\"]"
                    ],
                    "name" : [ 
                        "[\"MongoDB\", \"MongoDB\"]"
                    ]
                }
            }
        },
        "rejectedPlans" : []
    },
    "serverInfo" : {
        "host" : "c120a2890d51",
        "port" : 27017,
        "version" : "4.0.4",
        "gitVersion" : "f288a3bdf201007f3693c58e140056adf8b04839"
    },
    "ok" : 1.0
}
```

## 执行计划属性解释

返回结果包含两大块信息，一个是queryPlanner，即查询计划，还有一个是serverInfo，即MongoDB服务的一些信息。

那么这里涉及到的参数比较多，我们来一一看一下：

| 参数	          | 含义 | 
|:----|:----|
| plannerVersion	 | 查询计划版本 | 
| namespace	    | 要查询的集合 | 
| indexFilterSet	 | 是否使用索引 | 
| parsedQuery	    | 查询条件，此处为x=1 | 
| winningPlan	    | 最佳执行计划 | 
| stage	          | 查询方式，常见的有COLLSCAN/全表扫描、IXSCAN/索引扫描、FETCH/根据索引去检索文档、SHARD_MERGE/合并分片结果、IDHACK/针对_id进行查询 | 
| filter	       | 过滤条件 | 
| direction	    | 搜索方向 | 
| rejectedPlans	 | 拒绝的执行计划 | 
| serverInfo	    | MongoDB服务器信息 | 

## 添加不同参数

explain() 也接收不同的参数，通过设置不同参数我们可以查看更详细的查询计划。

# queryPlanner 默认

queryPlanner是默认参数，添加queryPlanner参数的查询结果就是我们上文看到的查询结果，so，这里不再赘述。

# executionStats 最佳执行计划

executionStats 会返回**最佳执行计划**的一些统计信息，如下：

```
db.getCollection('person').find({name:'MongoDB', type: 'database'}).explain('executionStats');
```

最佳执行结果

```json
{
    "queryPlanner" : {
        "plannerVersion" : 1,
        "namespace" : "test.person",
        "indexFilterSet" : false,
        "parsedQuery" : {
            "$and" : [ 
                {
                    "name" : {
                        "$eq" : "MongoDB"
                    }
                }, 
                {
                    "type" : {
                        "$eq" : "database"
                    }
                }
            ]
        },
        "winningPlan" : {
            "stage" : "FETCH",
            "inputStage" : {
                "stage" : "IXSCAN",
                "keyPattern" : {
                    "type" : -1.0,
                    "name" : -1.0
                },
                "indexName" : "type_-1_name_-1",
                "isMultiKey" : false,
                "multiKeyPaths" : {
                    "type" : [],
                    "name" : []
                },
                "isUnique" : false,
                "isSparse" : false,
                "isPartial" : false,
                "indexVersion" : 2,
                "direction" : "forward",
                "indexBounds" : {
                    "type" : [ 
                        "[\"database\", \"database\"]"
                    ],
                    "name" : [ 
                        "[\"MongoDB\", \"MongoDB\"]"
                    ]
                }
            }
        },
        "rejectedPlans" : []
    },
    "executionStats" : {
        "executionSuccess" : true,
        "nReturned" : 2,
        "executionTimeMillis" : 1,
        "totalKeysExamined" : 2,
        "totalDocsExamined" : 2,
        "executionStages" : {
            "stage" : "FETCH",
            "nReturned" : 2,
            "executionTimeMillisEstimate" : 0,
            "works" : 3,
            "advanced" : 2,
            "needTime" : 0,
            "needYield" : 0,
            "saveState" : 0,
            "restoreState" : 0,
            "isEOF" : 1,
            "invalidates" : 0,
            "docsExamined" : 2,
            "alreadyHasObj" : 0,
            "inputStage" : {
                "stage" : "IXSCAN",
                "nReturned" : 2,
                "executionTimeMillisEstimate" : 0,
                "works" : 3,
                "advanced" : 2,
                "needTime" : 0,
                "needYield" : 0,
                "saveState" : 0,
                "restoreState" : 0,
                "isEOF" : 1,
                "invalidates" : 0,
                "keyPattern" : {
                    "type" : -1.0,
                    "name" : -1.0
                },
                "indexName" : "type_-1_name_-1",
                "isMultiKey" : false,
                "multiKeyPaths" : {
                    "type" : [],
                    "name" : []
                },
                "isUnique" : false,
                "isSparse" : false,
                "isPartial" : false,
                "indexVersion" : 2,
                "direction" : "forward",
                "indexBounds" : {
                    "type" : [ 
                        "[\"database\", \"database\"]"
                    ],
                    "name" : [ 
                        "[\"MongoDB\", \"MongoDB\"]"
                    ]
                },
                "keysExamined" : 2,
                "seeks" : 1,
                "dupsTested" : 0,
                "dupsDropped" : 0,
                "seenInvalidated" : 0
            }
        }
    },
    "serverInfo" : {
        "host" : "c120a2890d51",
        "port" : 27017,
        "version" : "4.0.4",
        "gitVersion" : "f288a3bdf201007f3693c58e140056adf8b04839"
    },
    "ok" : 1.0
}
```

## executionStats 参数介绍

这里除了我们上文介绍到的一些参数之外，还多了executionStats参数，含义如下：

| 参数	| 含义 |
|:---|:---|
| executionSuccess	           | 是否执行成功 |
| nReturned	                 | 返回的结果数 |
| executionTimeMillis	        | 执行耗时 |
| totalKeysExamined	           | 索引扫描次数 |
| totalDocsExamined	           | 文档扫描次数 |
| executionStages	           | 这个分类下描述执行的状态 |
| stage	                       | 扫描方式，具体可选值与上文的相同 |
| nReturned	                 | 查询结果数量 |
| executionTimeMillisEstimate	| 预估耗时 |
| works	                       | 工作单元数，一个查询会分解成小的工作单元 |
| advanced	                    | 优先返回的结果数 |
| docsExamined	              | 文档检查数目，与totalDocsExamined一致 |


# allPlansExecution

allPlansExecution 用来获取所有执行计划，结果参数基本与上文相同，这里就不再细说了。

## 执行 SQL

```
db.getCollection('person').find({name:'MongoDB', type: 'database'}).explain('allPlansExecution');
```

# 其他方法

##  explain() 本身

执行 sql

```
db.collection.explain().help()
```

结果如下

```
Explainable operations
	.aggregate(...) - explain an aggregation operation
	.count(...) - explain a count operation
	.distinct(...) - explain a distinct operation
	.find(...) - get an explainable query
	.findAndModify(...) - explain a findAndModify operation
	.group(...) - explain a group operation
	.remove(...) - explain a remove operation
	.update(...) - explain an update operation
Explainable collection methods
	.getCollection()
	.getVerbosity()
	.setVerbosity(verbosity)
```

## 具体的方法 

```
db.collection.explain().find().help()
```

日志结果

```
Explain query methods
	.finish() - sends explain command to the server and returns the result
	.forEach(func) - apply a function to the explain results
	.hasNext() - whether this explain query still has a result to retrieve
	.next() - alias for .finish()
Explain query modifiers
	.addOption(n)
	.batchSize(n)
	.comment(comment)
	.collation(collationSpec)
	.count()
	.hint(hintSpec)
	.limit(n)
	.maxTimeMS(n)
	.max(idxDoc)
	.min(idxDoc)
	.readPref(mode, tagSet)
	.showDiskLoc()
	.skip(n)
	.snapshot()
	.sort(sortSpec)
```

# IndexFilter

IndexFilter决定了查询优化器对于某一类型的查询将如何使用index，

indexFilter仅影响查询优化器对于该类查询可以用尝试哪些index的执行计划分析，查询优化器还是根据分析情况选择最优计划。

如果某一类型的查询设定了IndexFilter，那么执行时通过hint指定了其他的index，查询优化器将会忽略hint所设置index，仍然使用indexfilter中设定的查询计划。

IndexFilter可以通过命令移除，也将在实例重启后清空。

## IndexFilter的创建

可以通过如下命令为某一个collection建立indexFilter

- 命令

```
db.runCommand(
   {
      planCacheSetFilter: <collection>,
      query: <query>,
      sort: <sort>,
      projection: <projection>,
      indexes: [ <index1>, <index2>, ...]
   }
)
```

- 实例

```
db.runCommand(
   {
      planCacheSetFilter: "orders",
      query: { status: "A" },
      indexes: [
         { cust_id: 1, status: 1 },
         { status: 1, order_date: -1 }
      ]
   }
)
```

上图针对orders表建立了一个indexFilter，indexFilter指定了对于orders表只有status条件（仅对status进行查询，无sort等）的查询的indexes。

# Stage

## 类型

如explain.queryPlanner.winningPlan.stage和explain.queryPlanner.winningPlan.inputStage等。

文档中仅有如下几类介绍

COLLSCAN

全表扫描

IXSCAN

索引扫描

FETCH

根据索引去检索指定document

SHARD_MERGE

将各个分片返回数据进行merge

但是根据源码中的信息，个人还总结了文档中没有的如下几类(常用如下，由于是通过源码查找，可能有所遗漏)

SORT

表明在内存中进行了排序（与老版本的scanAndOrder:true一致）

LIMIT

使用limit限制返回数

SKIP

使用skip进行跳过

IDHACK

针对_id进行查询

SHARDING_FILTER

通过mongos对分片数据进行查询

COUNT

利用db.coll.explain().count()之类进行count运算

COUNTSCAN

count不使用用Index进行count时的stage返回

COUNT_SCAN

count使用了Index进行count时的stage返回

SUBPLA

未使用到索引的$or查询的stage返回

TEXT

使用全文索引进行查询时候的stage返回

PROJECTION

限定返回字段时候stage的返回


# 聚合查询

## 对于聚合的查询

```sql
{ aggregate: "xxx", 
pipeline: [ { $unwind: "$xxx" }, 
{ $match: { key1: "value1", key2: "value2", merId: "xxx", time: { $gt: 20190701000000000, $lte: 20190701143451346 } } }, 
{ $group: { _id: "xxx", totalAmount: { $sum: "xxx" } } } ] }
```

## 不同的查询计划方式

- 直接 

```
db.getCollection('xxx').aggregate(XXX).explain()
```

可以看到命中的索引

- 使用 find

但是下面的语句，却是全文扫描。

```
db.getCollection('xxx').aggregate(XXX).explain()
```

## mongoTempalate

对于 redis 提供的模板，直接使用 mongoTempalate.executeCommand(XXX) 经验证是可以命中索引的。

# 参考资料

[Indexes](https://docs.mongodb.com/manual/indexes/)

[MongoDB索引管理－索引的创建、查看、删除](https://itbilu.com/database/mongo/E1tWQz4_e.html)

[联合索引](https://blog.csdn.net/u012546526/article/details/44673527)

- 执行计划

[Mongo explain 执行结果](https://docs.mongodb.com/manual/reference/explain-results/)

[MongoDB执行计划获取(db.collection.explain())](http://lib.csdn.net/article/mongodb/56192)

[Mongo 官方 - 性能分析](https://docs.mongodb.com/manual/tutorial/analyze-query-plan/)

[MongoDB干货系列2-MongoDB执行计划分析详解（1）](http://www.mongoing.com/eshu_explain1)

[MongoDB干货系列2-MongoDB执行计划分析详解（2）](http://www.mongoing.com/eshu_explain2)

[MongoDB干货系列2-MongoDB执行计划分析详解（3）](http://www.mongoing.com/eshu_explain3)

* any list
{:toc}
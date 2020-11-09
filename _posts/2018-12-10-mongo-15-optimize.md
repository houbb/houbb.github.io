---
layout: post
title: Mongo Optimize-15 Mongo Optimize 性能优化
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, explain, mongo, sh]
published: true
---

# 性能优化

知道 index 和执行计划之后，我们要学会分析执行计划。选择出最优秀的索引方案。

## 索引准则

1. 避免全表扫描

2. 避免过多索引。如无必要，不增索引。

# 关注点

## 关注点1：执行时间

其中有3个executionTimeMillis，分别是

### executionStats.executionTimeMillis

该query的整体查询时间

### executionStats.executionStages.executionTimeMillis

该查询根据index去检索document获取2条具体数据的时间

### executionStats.executionStages.inputStage.executionTimeMillis

该查询扫描 2 行index所用时间

这三个值我们都希望越少越好，那么是什么影响这这三个返回值呢？

抛开硬件因素等不谈，我们来进行下一层的剥离。

## 关注点2：返回的条数

这里主要谈3个返回项，nReturned，totalKeysExamined与totalDocsExamined，分别代表该条查询返回的条目、索引扫描条目和文档扫描条目。

很好理解，这些都直观的影响到executionTimeMillis。我们需要扫描的越少速度越快。

对于一个查询， 我们最理想的状态是

```
nReturned=totalKeysExamined & totalDocsExamined=0
```

（cover index，仅仅使用到了index，无需文档扫描，这是最理想状态。）

或者

```
nReturned=totalKeysExamined=totalDocsExamined
```

(需要具体情况具体分析)

（正常index利用，无多余index扫描与文档扫描。）

如果有sort的时候，为了使得sort不在内存中进行，我们可以在保证 nReturned=totalDocsExamined 的基础上，totalKeysExamined可以大于totalDocsExamined与nReturned，因为量级较大的时候内存排序非常消耗性能。

后面我们会针对例子来进行分析。

## 关注点3：Stage状态分析

那么又是什么影响到了totalKeysExamined与totalDocsExamined呢？

就是Stage的类型，Stage的具体含义在上文中有提及，如果认真看的同学就不难理解为何Stage会影响到totalKeysExamined 和totalDocsExamined从而影响executionTimeMillis了。

此前有讲解过stage的类型，这里不再赘述。

### 普通查询

- 希望看到

```
Fetch+IDHACK

Fetch+ixscan

Limit+（Fetch+ixscan）

PROJECTION+ixscan

SHARDING_FILTER+ixscan
...
```

- 不希望看到

COLLSCAN（全表扫），SORT（使用sort但是无index），不合理的SKIP，SUBPLA（未用到index的$or）

### 对于 count

- 希望看到的有

COUNT_SCAN

- 不希望看到的有

COUNTSCAN

# Explain 实例

## 初始化测试数据

```
db.explain.insertMany([
   { "_id" : ObjectId("55b86d6bd7e3f4ccaaf20d70"), "a" : 1, "b" : 1, "c" : 1 },
    { "_id" : ObjectId("55b86d6fd7e3f4ccaaf20d71"), "a" : 1, "b" : 2, "c" : 2 },
    { "_id" : ObjectId("55b86d72d7e3f4ccaaf20d72"), "a" : 1, "b" : 3, "c" : 3 },
    { "_id" : ObjectId("55b86d74d7e3f4ccaaf20d73"), "a" : 4, "b" : 2, "c" : 3 },
    { "_id" : ObjectId("55b86d75d7e3f4ccaaf20d74"), "a" : 4, "b" : 2, "c" : 5 },
    { "_id" : ObjectId("55b86d77d7e3f4ccaaf20d75"), "a" : 4, "b" : 2, "c" : 5 },
    { "_id" : ObjectId("55b879b442bfd1a462bd8990"), "a" : 2, "b" : 1, "c" : 1 },
    { "_id" : ObjectId("55b87fe842bfd1a462bd8991"), "a" : 1, "b" : 9, "c" : 1 },
    { "_id" : ObjectId("55b87fe942bfd1a462bd8992"), "a" : 1, "b" : 9, "c" : 1 },
    { "_id" : ObjectId("55b87fe942bfd1a462bd8993"), "a" : 1, "b" : 9, "c" : 1 }
])
```

## 业务需求

查询 a=1，b 的值小于3，且按照 c 倒叙排序

```
db.d.find({a:1,b:{$lt:3}}).sort({c:-1})
```

## 没有索引的情况

```
db.explain.find({a:1,b:{$lt:3}}).sort({c:-1}).explain('executionStats')
```

结果如下：

```json
{
    "queryPlanner" : {
        "plannerVersion" : 1,
        "namespace" : "test.explain",
        "indexFilterSet" : false,
        "parsedQuery" : {
            "$and" : [ 
                {
                    "a" : {
                        "$eq" : 1.0
                    }
                }, 
                {
                    "b" : {
                        "$lt" : 3.0
                    }
                }
            ]
        },
        "winningPlan" : {
            "stage" : "SORT",
            "sortPattern" : {
                "c" : -1.0
            },
            "inputStage" : {
                "stage" : "SORT_KEY_GENERATOR",
                "inputStage" : {
                    "stage" : "COLLSCAN",
                    "filter" : {
                        "$and" : [ 
                            {
                                "a" : {
                                    "$eq" : 1.0
                                }
                            }, 
                            {
                                "b" : {
                                    "$lt" : 3.0
                                }
                            }
                        ]
                    },
                    "direction" : "forward"
                }
            }
        },
        "rejectedPlans" : []
    },
    "executionStats" : {
        "executionSuccess" : true,
        "nReturned" : 2,
        "executionTimeMillis" : 0,
        "totalKeysExamined" : 0,
        "totalDocsExamined" : 10,
        "executionStages" : {
            "stage" : "SORT",
            "nReturned" : 2,
            "executionTimeMillisEstimate" : 0,
            "works" : 16,
            "advanced" : 2,
            "needTime" : 13,
            "needYield" : 0,
            "saveState" : 0,
            "restoreState" : 0,
            "isEOF" : 1,
            "invalidates" : 0,
            "sortPattern" : {
                "c" : -1.0
            },
            "memUsage" : 126,
            "memLimit" : 33554432,
            "inputStage" : {
                "stage" : "SORT_KEY_GENERATOR",
                "nReturned" : 2,
                "executionTimeMillisEstimate" : 0,
                "works" : 13,
                "advanced" : 2,
                "needTime" : 10,
                "needYield" : 0,
                "saveState" : 0,
                "restoreState" : 0,
                "isEOF" : 1,
                "invalidates" : 0,
                "inputStage" : {
                    "stage" : "COLLSCAN",
                    "filter" : {
                        "$and" : [ 
                            {
                                "a" : {
                                    "$eq" : 1.0
                                }
                            }, 
                            {
                                "b" : {
                                    "$lt" : 3.0
                                }
                            }
                        ]
                    },
                    "nReturned" : 2,
                    "executionTimeMillisEstimate" : 0,
                    "works" : 12,
                    "advanced" : 2,
                    "needTime" : 9,
                    "needYield" : 0,
                    "saveState" : 0,
                    "restoreState" : 0,
                    "isEOF" : 1,
                    "invalidates" : 0,
                    "direction" : "forward",
                    "docsExamined" : 10
                }
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

此处的条数较少，暂时不关心时间。

我们开始看条数和 executionStats。

```
"nReturned" : 2,        -- 符合的条件的返回为2条。
"executionTimeMillis" : 0,
"totalKeysExamined" : 0,    -- 未命中索引
"totalDocsExamined" : 10,   -- 扫描了所有记录
```

- 排序

`executionStats.executionStages.sort=SORT` 没有命中索引

- 内存占用

```
"memUsage" : 126,       -- 占用的内存
"memLimit" : 33554432,  -- 内存限制
```

- 扫描类型

`executionStages.inputStage.stage=COLLSCAN`，全表扫描，扫描条件为

```json
 "filter" : {
    "$and" : [ 
        {
            "a" : {
                "$eq" : 1.0
            }
        }, 
        {
            "b" : {
                "$lt" : 3.0
            }
        }
    ]
}
```

# 优化步骤

## 排序字段优化

### 排序添加索引

```
db.explain.createIndex({c: 1})
```

### 查看执行计划

```json
"executionStats" : {
    "executionSuccess" : true,
    "nReturned" : 2,
    "executionTimeMillis" : 4,
    "totalKeysExamined" : 10,
    "totalDocsExamined" : 10,
    "executionStages" : {
        "stage" : "FETCH",
        "filter" : {
            "$and" : [ 
                {
                    "a" : {
                        "$eq" : 1.0
                    }
                }, 
                {
                    "b" : {
                        "$lt" : 3.0
                    }
                }
            ]
        },
        "nReturned" : 2,
        "executionTimeMillisEstimate" : 0,
        "works" : 11,
        "advanced" : 2,
        "needTime" : 8,
        "needYield" : 0,
        "saveState" : 0,
        "restoreState" : 0,
        "isEOF" : 1,
        "invalidates" : 0,
        "docsExamined" : 10,
        "alreadyHasObj" : 0,
        "inputStage" : {
            "stage" : "IXSCAN",
            "nReturned" : 10,
            "executionTimeMillisEstimate" : 0,
            "works" : 11,
            "advanced" : 10,
            "needTime" : 0,
            "needYield" : 0,
            "saveState" : 0,
            "restoreState" : 0,
            "isEOF" : 1,
            "invalidates" : 0,
            "keyPattern" : {
                "c" : 1.0
            },
            "indexName" : "c_1",
            "isMultiKey" : false,
            "multiKeyPaths" : {
                "c" : []
            },
            "isUnique" : false,
            "isSparse" : false,
            "isPartial" : false,
            "indexVersion" : 2,
            "direction" : "backward",
            "indexBounds" : {
                "c" : [ 
                    "[MaxKey, MinKey]"
                ]
            },
            "keysExamined" : 10,
            "seeks" : 1,
            "dupsTested" : 0,
            "dupsDropped" : 0,
            "seenInvalidated" : 0
        }
    }
}
```

### 结果分析

- 排序

Stage没有了SORT，因为我们sort字段有了index，但是由于查询还是没有index，故totalDocsExamined还是10，但是由于sort用了index，totalKeysExamined也是10

- 查询

还是扫描了所有的数据，需要进一步优化。

```
"nReturned" : 2,
"executionTimeMillis" : 4,
"totalKeysExamined" : 10,
"totalDocsExamined" : 10,
```

## 查询优化

### 新建索引

删除原来的索引。

```
db.explain.dropIndexes();
db.explain.createIndex({a:1, b:1, c:1});
```

## 执行计划

```json
"executionStats" : {
    "executionSuccess" : true,
    "nReturned" : 2,
    "executionTimeMillis" : 6,
    "totalKeysExamined" : 2,
    "totalDocsExamined" : 2,
    "executionStages" : {
        "stage" : "SORT",
        "nReturned" : 2,
        "executionTimeMillisEstimate" : 0,
        "works" : 7,
        "advanced" : 2,
        "needTime" : 4,
        "needYield" : 0,
        "saveState" : 0,
        "restoreState" : 0,
        "isEOF" : 1,
        "invalidates" : 0,
        "sortPattern" : {
            "c" : -1.0
        },
        "memUsage" : 126,
        "memLimit" : 33554432,
        "inputStage" : {
            "stage" : "SORT_KEY_GENERATOR",
            "nReturned" : 2,
            "executionTimeMillisEstimate" : 0,
            "works" : 4,
            "advanced" : 2,
            "needTime" : 1,
            "needYield" : 0,
            "saveState" : 0,
            "restoreState" : 0,
            "isEOF" : 1,
            "invalidates" : 0,
            "inputStage" : {
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
                        "a" : 1.0,
                        "b" : 1.0,
                        "c" : 1.0
                    },
                    "indexName" : "a_1_b_1_c_1",
                    "isMultiKey" : false,
                    "multiKeyPaths" : {
                        "a" : [],
                        "b" : [],
                        "c" : []
                    },
                    "isUnique" : false,
                    "isSparse" : false,
                    "isPartial" : false,
                    "indexVersion" : 2,
                    "direction" : "forward",
                    "indexBounds" : {
                        "a" : [ 
                            "[1.0, 1.0]"
                        ],
                        "b" : [ 
                            "[-inf.0, 3.0)"
                        ],
                        "c" : [ 
                            "[MinKey, MaxKey]"
                        ]
                    },
                    "keysExamined" : 2,
                    "seeks" : 1,
                    "dupsTested" : 0,
                    "dupsDropped" : 0,
                    "seenInvalidated" : 0
                }
            }
        }
    }
}
```

### 结果分析

```json
"executionStats" : {
 "executionSuccess" : true,
 "nReturned" : 2,
 "executionTimeMillis" : 6,
 "totalKeysExamined" : 2,
 "totalDocsExamined" : 2,
 "executionStages" : {
     "stage" : "SORT",
```

- 查询

查询已经满足我们的条件了。

- 排序

但是排序为 SORT，属于内存排序，不符合我们的预期。

## sort 优化方式1

### 新建索引

删除原来的索引。

```
db.explain.dropIndexes();
db.explain.createIndex({a:1, c:1, b:1});
```

### 执行计划

```json
"executionStats" : {
    "executionSuccess" : true,
    "nReturned" : 2,
    "executionTimeMillis" : 5,
    "totalKeysExamined" : 4,
    "totalDocsExamined" : 2,
    "executionStages" : {
        "stage" : "FETCH",
        "nReturned" : 2,
        "executionTimeMillisEstimate" : 0,
        "works" : 5,
        "advanced" : 2,
        "needTime" : 2,
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
            "works" : 5,
            "advanced" : 2,
            "needTime" : 2,
            "needYield" : 0,
            "saveState" : 0,
            "restoreState" : 0,
            "isEOF" : 1,
            "invalidates" : 0,
            "keyPattern" : {
                "a" : 1.0,
                "c" : 1.0,
                "b" : 1.0
            },
            "indexName" : "a_1_c_1_b_1",
            "isMultiKey" : false,
            "multiKeyPaths" : {
                "a" : [],
                "c" : [],
                "b" : []
            },
            "isUnique" : false,
            "isSparse" : false,
            "isPartial" : false,
            "indexVersion" : 2,
            "direction" : "backward",
            "indexBounds" : {
                "a" : [ 
                    "[1.0, 1.0]"
                ],
                "c" : [ 
                    "[MaxKey, MinKey]"
                ],
                "b" : [ 
                    "(3.0, -inf.0]"
                ]
            },
            "keysExamined" : 4,
            "seeks" : 3,
            "dupsTested" : 0,
            "dupsDropped" : 0,
            "seenInvalidated" : 0
        }
    }
}
```


### 结果分析

```json
"nReturned" : 2,
    "executionTimeMillis" : 5,
    "totalKeysExamined" : 4,
    "totalDocsExamined" : 2,
    "executionStages" : {
        "stage" : "FETCH",
```

nReturned为2，返回2条记录

totalKeysExamined为4，扫描了4个index

totalDocsExamined为2，扫描了2个docs

虽然不是nReturned=totalKeysExamined=totalDocsExamined，但是Stage无Sort，即利用了index进行排序，而非内存，这个性能的提升高于多扫几个index的代价。

### 小技巧

综上可以有一个小结论，当查询覆盖精确匹配，范围查询与排序的时候

`{精确匹配字段,排序字段,范围查询字段}` 这样的索引排序会更为高效。


# 可以指定命中的索引

```
db.inventory.createIndex( { quantity: 1, type: 1 } )
db.inventory.createIndex( { type: 1, quantity: 1 } )
```

指定出发第一个索引

```
db.inventory.find(
   { quantity: { $gte: 100, $lte: 300 }, type: "food" }
).hint({ quantity: 1, type: 1 }).explain("executionStats")
```

# 性能优化拓展阅读

https://docs.mongodb.com/manual/core/query-optimization/

https://docs.mongodb.com/manual/core/query-plans/

https://docs.mongodb.com/manual/tutorial/optimize-query-performance-with-indexes-and-projections/

https://docs.mongodb.com/manual/tutorial/create-indexes-to-support-queries/

# 参考资料

[MongoDB干货系列2-MongoDB执行计划分析详解（3）](http://www.mongoing.com/eshu_explain3)

* any list
{:toc}
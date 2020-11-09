---
layout: post
title: Mongo 分片平衡器-50-优化实战
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# 初始化

## 创建 collection

可以跳过，插入数据会默认创建。


## 初始化数据

```
for(i=1;i<=10000;i++){db.test.insert({"id":i,"name":"test", "amount": i+10000})}
```

```
for(i=1;i<=10000;i++){db.test.insert({"id":i,"name":"test2", "amount": i+10000})}
```

```
for(i=1;i<=10000;i++){db.test.insert({"id":i,"name":"test3", "amount": i+10000})}
```

```
for(i=1;i<=30000;i++){db.test.insert({"id":i,"name":"test4", "amount": i+10000})}
```


## 创建索引

```
db.getCollection('test').createIndex({"name":1, "amount":1}, {"name":"name_amount_ix"})
```

## 总数查看

```
db.getCollection('test').count()
```

共计初始化 6W 条数据。

# 执行测试

## 基础测试

```
db.getCollection('test').aggregate([
    { $match: {name:"test"} },
    { $group: { _id: "$name", totalAmount: { $sum: "$amount" }, totalCount: {$sum:1}} }
])
```

耗时：0.015s 和数量基本没有关系。

## 降低查询的数量

确定是否耗时和数量成线性

```
db.getCollection('test').aggregate([
    { $match: {name:"test", id: {$lt: 5000}} },
    { $group: { _id: "$name", totalAmount: { $sum: "$amount" }, totalCount: {$sum:1}} }
])
```

发现耗时平均为 0.018s 反而耗时更多了。因为这里没有命中索引，不具有代表性

## 降低查询的数量-命中索引

```
db.getCollection('test').aggregate([
    { $match: {name:"test", amount: {$lt: 15000}} },
    { $group: { _id: "$name", totalAmount: { $sum: "$amount" }, totalCount: {$sum:1}} }
])
```

耗时 0.008 接近降低一半。

经过测试耗时和数量是线性的关系。

# 是否为聚合运算耗时测试

## 有聚合

```
db.getCollection('test').aggregate([
    { $match: {name:"test" }},
    { $group: { _id: "$name", totalAmount: { $sum: "$amount" }, totalCount: {$sum:1}} }
])
```

耗时：0.014s

- 执行计划

```
{
    "stages" : [ 
        {
            "$cursor" : {
                "query" : {
                    "name" : "test"
                },
                "fields" : {
                    "amount" : 1,
                    "name" : 1,
                    "_id" : 0
                },
                "queryPlanner" : {
                    "plannerVersion" : 1,
                    "namespace" : "test.test",
                    "indexFilterSet" : false,
                    "parsedQuery" : {
                        "name" : {
                            "$eq" : "test"
                        }
                    },
                    "winningPlan" : {
                        "stage" : "PROJECTION",
                        "transformBy" : {
                            "amount" : 1,
                            "name" : 1,
                            "_id" : 0
                        },
                        "inputStage" : {
                            "stage" : "IXSCAN",
                            "keyPattern" : {
                                "name" : 1.0,
                                "amount" : 1.0
                            },
                            "indexName" : "name_amount_ix",
                            "isMultiKey" : false,
                            "multiKeyPaths" : {
                                "name" : [],
                                "amount" : []
                            },
                            "isUnique" : false,
                            "isSparse" : false,
                            "isPartial" : false,
                            "indexVersion" : 2,
                            "direction" : "forward",
                            "indexBounds" : {
                                "name" : [ 
                                    "[\"test\", \"test\"]"
                                ],
                                "amount" : [ 
                                    "[MinKey, MaxKey]"
                                ]
                            }
                        }
                    },
                    "rejectedPlans" : []
                }
            }
        }, 
        {
            "$group" : {
                "_id" : "$name",
                "totalAmount" : {
                    "$sum" : "$amount"
                },
                "totalCount" : {
                    "$sum" : {
                        "$const" : 1.0
                    }
                }
            }
        }
    ],
    "ok" : 1.0
}
```

## 不进行集合计算

```
db.getCollection('test').aggregate([
    { $match: {name:"test" }},
    { $group: { _id: "$name", totalCount: {$sum:1}} }
])
```

耗时：0.013 s

- 执行计划

```
/* 1 */
{
    "stages" : [ 
        {
            "$cursor" : {
                "query" : {
                    "name" : "test"
                },
                "fields" : {
                    "name" : 1,
                    "_id" : 0
                },
                "queryPlanner" : {
                    "plannerVersion" : 1,
                    "namespace" : "test.test",
                    "indexFilterSet" : false,
                    "parsedQuery" : {
                        "name" : {
                            "$eq" : "test"
                        }
                    },
                    "winningPlan" : {
                        "stage" : "PROJECTION",
                        "transformBy" : {
                            "name" : 1,
                            "_id" : 0
                        },
                        "inputStage" : {
                            "stage" : "IXSCAN",
                            "keyPattern" : {
                                "name" : 1.0,
                                "amount" : 1.0
                            },
                            "indexName" : "name_amount_ix",
                            "isMultiKey" : false,
                            "multiKeyPaths" : {
                                "name" : [],
                                "amount" : []
                            },
                            "isUnique" : false,
                            "isSparse" : false,
                            "isPartial" : false,
                            "indexVersion" : 2,
                            "direction" : "forward",
                            "indexBounds" : {
                                "name" : [ 
                                    "[\"test\", \"test\"]"
                                ],
                                "amount" : [ 
                                    "[MinKey, MaxKey]"
                                ]
                            }
                        }
                    },
                    "rejectedPlans" : []
                }
            }
        }, 
        {
            "$group" : {
                "_id" : "$name",
                "totalCount" : {
                    "$sum" : {
                        "$const" : 1.0
                    }
                }
            }
        }
    ],
    "ok" : 1.0
}
```

## 去掉 group

```
db.getCollection('test').aggregate([
    { $match: {name:"test" }},
    { $group: { _id: null, totalCount: {$sum:1}} }
])
```

耗时：0.005s


# 集合状态

```
db.getCollection('test').stats()
```

# 参考资料

[Mongo 性能监控](https://www.yuanmas.com/info/4py2xNnjzb.html)

* any list
{:toc}
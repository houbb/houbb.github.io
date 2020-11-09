---
layout: post
title: Mongo Bulk Write-22 Mongo 批量写操作
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# 概述

mongodb 为客户端提供了批量执行写入操作的能力。大容量写入操作会影响单个集合。mongodb 允许应用程序确定批量写入操作所需的可接受确认级别。

3.2 版中的新版本。

db.collection.bulkWrite() 方法提供了执行批量插入、更新和删除操作的能力。

mongodb 还支持批量插入 db.collection.insertMany()。

# 有序操作与无序操作

批量写入操作可以是有序的, 也可以是无序的。

使用有序的操作列表, mongodb 按顺序执行操作。如果在处理其中一个写入操作的过程中发生错误, mongodb 将返回, 而不处理列表中的任何剩余写入操作。

查看[顺序写入](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#bulkwrite-example-bulk-write-operation)

对于无序的操作列表, mongodb 可以并行执行操作, 但不能保证此行为。如果在处理其中一个写入操作的过程中发生错误, mongodb 将继续处理列表中剩余的写入操作。

请参阅[无序写入](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#bulkwrite-example-unordered-bulk-write)。

在共享集合上执行有序操作列表通常比执行无序列表要慢, 因为对于有序列表, 每个操作都必须等待上一个操作完成。

默认情况下, [bulkwrite()](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#db.collection.bulkWrite) 执行有序操作。

若要指定无序写入操作, 请在选项文档中按顺序设置: false。

参见 [Execution of Operations](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#bulkwrite-write-operations-executionofoperations)


# bulkWrite()

## 支持方法

- insertOne()

- updateOne()

- updateMany()

- replaceOne()

- deleteOne()

- deleteMany()

每个写入操作都作为数组中的文档传递给 bulkwrite ()。

## 例子

例如, 以下执行多个写入操作:

字符集合包含以下文档:

```
{ "_id" : 1, "char" : "Brisbane", "class" : "monk", "lvl" : 4 },
{ "_id" : 2, "char" : "Eldon", "class" : "alchemist", "lvl" : 3 },
{ "_id" : 3, "char" : "Meldane", "class" : "ranger", "lvl" : 3 }
```

- 批量操作

```
try {
   db.characters.bulkWrite(
      [
         { insertOne :
            {
               "document" :
               {
                  "_id" : 4, "char" : "Dithras", "class" : "barbarian", "lvl" : 4
               }
            }
         },
         { insertOne :
            {
               "document" :
               {
                  "_id" : 5, "char" : "Taeln", "class" : "fighter", "lvl" : 3
               }
            }
         },
         { updateOne :
            {
               "filter" : { "char" : "Eldon" },
               "update" : { $set : { "status" : "Critical Injury" } }
            }
         },
         { deleteOne :
            { "filter" : { "char" : "Brisbane"} }
         },
         { replaceOne :
            {
               "filter" : { "char" : "Meldane" },
               "replacement" : { "char" : "Tanys", "class" : "oracle", "lvl" : 4 }
            }
         }
      ]
   );
}
catch (e) {
   print(e);
}
```

# 批量插入到集群集合中的策略

大型批量插入操作 (包括初始数据插入或常规数据导入) 可能会影响共享群集的性能。对于批量插入, 请考虑以下策略:

## 预拆分集合

如果共享集合为空, 则该集合只有一个初始块, 它驻留在单个分片上。

然后, mongodb 必须花费时间来接收数据、创建拆分并将拆分块分发到可用的分片。若要避免此性能成本, 可以预拆分集合, 如锐化群集中的拆分块中所述。

## 对 mongos 的无序写入

若要提高共享群集的写入性能, 请使用 bulkwrite(), 并将可选参数排序为 false。

mongos 可以尝试同时将写入发送到多个分片。

对于空集合, 首先预拆分集合, 如在 [Split Chunks in a Sharded Cluster](https://docs.mongodb.com/manual/tutorial/split-chunks-in-sharded-cluster/) 所述。


## 避免单声道节流

如果您的分片键在插入过程中单调增加, 则所有插入的数据都将转到集合中的最后一个块, 这些块最终将始终位于单个分片上。

因此, 群集的插入容量永远不会超过该单个分片的插入容量。

如果插入卷大于单个分片可以处理的内容, 并且无法避免单调增加分片键, 请考虑对应用程序进行以下修改:

- 反转分片键的二进制位。这将保留信息, 并避免将插入顺序与不断增加的值序列关联起来。

- 将第一个和最后一个16位单词交换为 "洗牌" 插入。

## 例子

下面的示例, 在 c++ 中, 交换生成的 bson objecds 的前导和尾随16位单词, 使它们不再单调增加。

```c++
using namespace mongo;
OID make_an_id() {
  OID x = OID::gen();
  const unsigned char *p = x.getData();
  swap( (unsigned short&) p[0], (unsigned short&) p[10] );
  return x;
}

void foo() {
  // create an object
  BSONObj o = BSON( "_id" << make_an_id() << "x" << 3 << "name" << "jane" );
  // now we may insert o into a sharded collection
}
```







# 参考资料

[bulk-write-operations](https://docs.mongodb.com/manual/core/bulk-write-operations/)

* any list
{:toc}
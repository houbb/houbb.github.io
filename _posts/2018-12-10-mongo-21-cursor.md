---
layout: post
title: Mongo Cursor-21 Mongo 游标
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# Cursor

db.collection.find() 方法返回游标。

若要访问文档, 您需要迭代游标。但

是, 在 mongo shell 中, 如果返回的光标未分配给使用 var 关键字的变量, 则光标将自动迭代 20次, 以打印结果中的前20个文档。

下面的示例介绍手动迭代游标以访问文档或使用迭代器索引的方法。

# 手动迭代光标

在 mongo shell 中, 当您使用 var 关键字将从 find()  方法返回的游标分配给变量时, 游标不会自动迭代。

您可以调用 shell 中的游标变量, 最多循环访问 20次 并打印匹配的文档, 如下例所示:

- 获取

```
var myCursor = db.inventory.find( { status: "A" });
```

- 打印

```
myCursor
```

## 或者使用 hasNext() + next() 的方式输出

- 打印

```
while (myCursor.hasNext()) {
   print(tojson(myCursor.next()));
}
;
```

- 使用 printjson()

```
while (myCursor.hasNext()) {
   printjson(myCursor.next());
}
;
```

- forEach 方式

```
myCursor.forEach(printjson);
```

# 指定下标

在 mongo shell 中, 您可以使用 toAarray() 方法迭代游标并返回数组中的文档, 如下所示

```
var myCursor = db.inventory.find( { status: "A" });
var documentArray = myCursor.toArray();
var myDocument = documentArray[3];
```

toArray()  方法将光标返回的所有文档加载到 ram 中;方法耗尽光标。

此外, 某些驱动程序通过使用游标上的索引 (即`游标[索引]`) 提供对文档的访问。

这是首先调用 toArray() 方法, 然后在生成的数组上使用索引的快捷方式。


## 其他方式

```
var myDocument = myCursor[1];
myCursor.toArray() [1];
```

# Cursor 属性

## 非活动游标的闭合

默认情况下, 服务器将在10分钟不活动后自动关闭光标, 或者如果客户端已耗尽光标。

若要重写 mongo shell 中的此行为, 可以使用 cursors.noCursorTimeout()  方法:

```
var myCursor = db.users.find().noCursorTimeout();
```

设置 "节点光标超时" 选项后, 必须使用 cur点. close () 手动关闭光标, 或者用尽光标的结果。

有关设置 "节点超时" 选项的信息, 请参阅[drivers](https://docs.mongodb.com/ecosystem/drivers)程序文档。

## 光标隔离

当游标返回文档时, 其他操作可能会与查询交错。

对于 mmapv1 存储引擎, 对文档的中间写入操作可能会导致游标在文档发生更改时多次返回文档。

若要处理这种情况, 请参阅光标快照上的信息。

## 光标批次

mongodb 服务器批量返回查询结果。批处理中的数据量不会超过 bson 文档的最大大小。

若要覆盖批处理的默认大小, 请参阅 batchSize() 和 limit()。

版本3.4 中的新功能: 类型 find()、aggregate()、listIndexes 和 listCollections的操作每批最多返回16兆字节。

batchSize() 可以强制执行较小的限制, 但不能强制执行较大的限制。

默认情况下, find()、aggregate() 操作的初始批处理大小为101个文档。

针对生成的游标发出的后续 getmore 操作没有默认批处理大小, 因此它们仅受到16兆字节消息大小的限制。

对于包含不带索引的排序操作的查询, 服务器必须加载内存中的所有文档才能执行排序, 然后才能返回任何结果。

当您遍历游标并到达返回的批处理的末尾时, 如果有更多的结果, cursor.next() 将执行 getmore 操作来检索下一个批处理。

要在迭代游标时查看批处理中保留的文档数, 可以使用 objsLeftInBatch() 方法, 如下面的示例所示:

```
var myCursor = db.inventory.find();

var myFirstDocument = myCursor.hasNext() ? myCursor.next() : null;

myCursor.objsLeftInBatch();
```

# 光标信息

方法返回包含指标字段的文档。指标字段包含一个度量值. 光标字段, 其中包含以下信息:

- 自上次服务器重新启动以来超时游标数

- DBQuery.Option.noTimeout 设置选项以防止在一段时间不活动后超时的打开游标数

- "固定" 打开的游标数

- 打开游标的总数

请考虑下面的示例, 该示例调用 db.serverStatus() 方法, 并从结果中访问指标字段, 然后从指标字段访问游标字段:

## 命令

```
db.serverStatus().metrics.cursor
```

- 结果

```
{
	"timedOut" : NumberLong(0),
	"open" : {
		"noTimeout" : NumberLong(0),
		"pinned" : NumberLong(0),
		"total" : NumberLong(0)
	}
}
```

# 参考资料

[Iterate a Cursor in the mongo Shell](https://docs.mongodb.com/manual/tutorial/iterate-a-cursor/)

* any list
{:toc}
---
layout: post
title: Mongo Retryable Writes-23 Mongo 可重试写入
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# Retryable Writes

3.6 版中的新版本。

可重试写入允许 mongodb 驱动程序在遇到网络错误时, 或者在副本集或共享的群集中找不到正常的主请求程序时, 可以一次自动重试某些写入操作。

# 先决条件

可重试写入具有以下要求:

1. 支持的部署拓扑结构

2. 可重试写入需要副本集或共享群集, 并且不支持独立实例。

3. 支持的存储引擎

可重试写入需要支持文档级锁定的存储引擎, 如 wiredtiger 或内存中存储引擎。

mmapv1 存储引擎不支持可重试写入。

## 驱动

3.6+ MongoDB Drivers

## 版本

3.6+ 的 mongo 版本

# 可重试写入和多文档事务

4.0 版中的新功能。

事务提交和中止操作是可重试的写入操作。

如果提交操作或中止操作遇到错误, mongodb 驱动程序将重试该操作一次, 而不考虑 retry构是否设置为 true。

无论重试写入是否设置为 true, 事务中的写入操作都不能单独重试。

# 启用可重试写入

默认情况下, mongodb 驱动程序不启用可重试写入, 但事务提交和中止操作除外。

## mongodb 驱动程序

要在 mongodb 驱动程序中启用可重试写入, 请将 "重试写入" 选项添加到连接字符串中:

```
mongodb://localhost/?retryWrites=true
```

## mongo shell

```
mongo --retryWrites
```

# 可重试写入操作

以下写入操作在发出已确认的写入问题时是可重试的;

例如, [写入关注](https://docs.mongodb.com/manual/reference/write-concern/)不能是 {w:0}。

> 事务中的写入操作不能单独重试。

## 插入

db.collection.insertOne()
db.collection.insert()
db.collection.insertMany()

## 单文件更新

db.collection.updateOne()
db.collection.replaceOne()
db.collection.save()
db.collection.update() where multi is false

## 单文件删除

db.collection.deleteOne()
db.collection.remove() where justOne is true

## findAndModify 操作

都是操作单个文件

db.collection.findAndModify()
db.collection.findOneAndDelete()
db.collection.findOneAndReplace()
db.collection.findOneAndUpdate()

db.collection.bulkWrite() with the following write operations:

## 批量操作

只支持单个文件的操作

insertOne
updateOne
replaceOne
deleteOne

## 批量操作

仅由单文档写入操作组成的大容量写入操作。

可重试批量操作可以包括指定写入操作的任意组合, 但不能包括任何多文档写入操作, 例如为多选项指定 true 的更新。

Bulk.find.removeOne()
Bulk.find.replaceOne()
Bulk.find.replaceOne()


# 行为

## 持续的网络错误

mongodb 可重试写入只进行一次重试尝试。

这有助于解决瞬态网络错误和副本集选择, 但不能解决持久的网络错误。

## 故障转移期间

如果驱动程序在目标副本集或共享群集分片中找不到正常的主服务器, 则驱动程序将等待服务器选择时间 toutms 毫秒以确定新的主服务器, 然后重试。

可重试写入不会处理故障转移期间超过服务器选择时间输出的实例。

> WARNING

如果客户端应用程序在发出写入操作后暂时没有响应, 其响应量超过了 locallogicssession time3分钟, 则在客户端应用程序开始响应时 (无需重新启动) 时, 写入操作可能会出现重试并再次应用。

## 诊断

版本3.6.3 中的新版本。

命令, 及其 mongo shell 帮助器 db.serverStatus() 包括有关事务部分中可重试写入的统计信息。

# 参考资料

[Retryable Writes](https://docs.mongodb.com/manual/core/retryable-writes/#retryable-writes)

* any list
{:toc}
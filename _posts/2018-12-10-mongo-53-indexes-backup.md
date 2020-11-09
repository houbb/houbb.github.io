---
layout: post
title: Mongo 53-mongo indexes 索引如何备份
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, index, sh]
published: true
---

# 查看所有索引信息

MongoDB索引的元信息（描述信息）存储在local数据库的集合system.indexes中，这是系统提供的保留集合（创建数据库时），我们不能对其进行插入或删除操作,但我们可以从中查看索引定义的相关信息。

system.indexes 集合中包含了每个索引的详细信息，可以通过下面的命令查询已经存在的索引，例如：

```js
db.system.indexes.find()
```

## 执行方式

这个命令要在mongodb的shell下输入，不是操作系统的shell下输入，先执行mongo，在输入各种mongodb的命令，像这样


## 查看单表索引

```
db.COLLECTION_NAME.getIndexes()
```

# 在后台创建索引

创建索引会对数据库添加写锁，如果数据集比如大，会将线上读写数据库的操作挂起，以等待索引创建结束。

这影响了数据库的正常服务，我们可以通过在创建索引时加 `background:true` 的选项，让创建工作在后台执行，这时候创建索引还是需要加写锁，但是这个写锁不会直接独占到索引创建完成，而是会暂停为其它读写操作让路，不至于造成严重的性能影响。

具体方法：

```js
db.values.createIndex({open: 1, close: 1}, {background: true}) 
```

# 离线创建索引

无论如何，索引的创建都会给数据库造成一定的压力，从而影响线上服务。

如果希望创建索引的过程完全不影响线上服务，我们可以通过将replica sets中的节点先从集群中剥离，在这个节点上添加相应的索引，等索引添加完毕后再将其添加到replica sets中。这只需要保证一个条件，就是创建索引的时间不能长于oplog能够保存日志的时间，否则创建完后节点再上线发现再也无法追上primary了，这时会进行resync操作。

# 索引备份

我们知道，无论是使用mongodump还是mongoexport命令，都只是对数据进行备份，无法备份索引。

我们在恢复的时候，还是需要等待漫长的索引创建过程。

所以，如果你希望备份的时候带上索引，那么最好采用备份数据文件的方式。

# 索引压缩

索引在使用一段时间后，经历增删改等操作，会变得比较松散，从而战用不必要的空间，我们可以通过reindex命令，重新组织索引，让索引的空间占用变得更小。

# 参考资料

[Mongo导出mongoexport和导入mongoimport介绍](https://www.cnblogs.com/mengyu/p/7718311.html)

[MongoDB数据库如何能备份集合的建索引语句？](http://blog.itpub.net/15498/viewspace-2122584/)

[MongoDB索引管理](https://www.iteye.com/blog/mootools-1426496)

[怎样查看mongodb已经存在的索引？](https://segmentfault.com/q/1010000014999283)

[查看索引命中率](https://blog.csdn.net/weixin_33809981/article/details/92003891)

[MongoDB中各种类型的索引](https://blog.csdn.net/u012702547/article/details/81027421)

* any list
{:toc}
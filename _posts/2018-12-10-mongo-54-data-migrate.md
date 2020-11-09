---
layout: post
title: Mongo 54-mongo data migrate 数据迁移
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, data-migrate, sh]
published: true
---

# 背景

有时候希望将一个库的数据迁移到另一个库中。

代码实现当然也是可以的，不过感觉有些麻烦。

mongodb 本身应该就自带的特性支持。

# 相同实例

```
use db_source;
var docs = db_source.collection_souce.find();
use db_target;
docs.forEach({db.collection_target.insert(d)});
```

# 不同实例

不同Mongodb实例之间，可以使用mongodump和mongorestore，先备份，后恢复:

```
mongodump -h host:port -d db_source -c collection_source
 
mongorestore -h host:port -d db_target -c collection_target dump/collection_source.bson
```

# 参考资料

[mongodb怎么实现两个表之间的数据转移](https://blog.csdn.net/weixin_41287692/article/details/82378441)

* any list
{:toc}
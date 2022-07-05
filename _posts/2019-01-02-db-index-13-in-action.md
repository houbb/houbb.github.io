---
layout: post
title:  数据库索引-13-实际工作中的索引优化
date:  2019-1-2 10:17:00 +0800
categories: [SQL]
tags: [sql, mysql, index, sh]
published: true
---


# mysql 的分页优化

## 现象

[mysql learn-01-mysql limit 的分页性能很差问题及其解决方案](https://houbb.github.io/2020/10/17/database-mysql-learn-01-performance-limit)

## 解决方案

返回给前端对应的 lastId

然后通过 lastId 做对应的主键过滤，子查询。

id 走的是主键聚合索引，会比较快。

### 优化方案1

```sql
SELECT * FROM tableName
WHERE id >= (SELECT id FROM tableName ORDER BY id LIMIT 500000 , 1)
LIMIT 2;
```

### 优化方案2

可以直接让前端把 lastId 传过来

```sql
SELECT * FROM tableName
WHERE id >= lastId
LIMIT 2;
```

这样可以进一步减少一次查询。

# 实际工作中的索引优化？

比如限额限次中。统计商户一段时间内的交易量/交易次数。

创建对应的联合索引：mer_id + request_time

其实可以加一下交易金额，可以避免回表。

ps: 因为会有一些复杂的过滤条件，所以数据本身还是需要回表的。所以当时选择的就是 mer_id+request_time。

## 原因分析

数据库在执行的时候，一次只能吃到一个索引。

ps: 为什么？会有特例吗？

数据库如何判断走哪一个索引？

## 为什么使用联合索引

简单的说有两个主要原因：

（1）"一个顶三个"。建了一个(a,b,c)的复合索引，那么实际等于建了(a),(a,b),(a,b,c)三个索引，因为每多一个索引，都会增加写操作的开销和磁盘空间的开销。对于大量数据的表，这可是不小的开销！

若表中索引过多，会影响INSERT及UPDATE性能，简单说就是会影响数据写入性能。

**因为更新数据的同时，也要同时更新索引。**

（2）覆盖索引。

同样的有复合索引（a,b,c），如果有如下的sql: `select a,b,c from table where a=1 and b = 1`。

那么MySQL可以直接通过遍历索引取得数据，而无需回表，这减少了很多的随机io操作。减少io操作，特别的随机io其实是dba主要的优化策略。所以，在真正的实际应用中，覆盖索引是主要的提升性能的优化手段之一

（3）索引列越多，通过索引筛选出的数据越少。

有1000W条数据的表，有如下sql:select * from table where a = 1 and b =2 and c = 3,假设假设每个条件可以筛选出10%的数据，如果只有单值索引，那么通过该索引能筛选出1000W*10%=100w 条数据，然后再回表从100w条数据中找到符合b=2 and c= 3的数据，然后再排序，再分页；如果是复合索引，通过索引筛选出 `1000w *10% *10% *10%=1w`，然后再排序、分页，哪个更高效，一眼便知

# 参考资料

[mysql里创建‘联合索引’的意义？](https://segmentfault.com/q/1010000000342176)

* any list
{:toc}
---
layout: post
title: Oracle 删除重复数据，创建唯一索引
date:  2020-5-7 09:23:59 +0800
categories: [SQL]
tags: [sql, index, oracle, sh]
published: true
---

# 情景说明

数据库中数据被重复插入，导致查询时直接报错。

因为有很多代码默认查出的结果是唯一的，但是库中又没有唯一索引。

所以需要从头到尾解决这个问题：

1. 移除重复数据

2. 定位数据重复原因（具体分析，本节不做深入）

3. 创建唯一索引

本节就 1,3 这两个部分做下整理，便于日后查阅。

# 如何删除重复数据

## 查询出重复数据

比如是多个字段确定唯一性

```sql
select * from 表 a where (a.Id,a.seq) in(select Id,seq from 表 group by Id,seq having count(*) > 1)
```

根据指定的字段分组，然后确定重复的数据。

## 删除重复的数据

找出重复的数据进行删除，并且只留有 rowid 最小的记录。

```sql
delete from 表 a where (a.Id,a.seq) in (select Id,seq from 表 group by Id,seq having count(*) > 1) and rowid not in (select min(rowid) from 表 group by Id,seq having count(*)>1)
```

ps: 其他数据库的思路也是同理，可以通过 ID 等标示性较强的数据来区分。

## 确认是否删除成功

这里可以直接根据查询重复数据。

顺便确认下数据别删多了。

# 创建唯一索引

## 说明

虽说修正了代码的重复问题之后，就可以杜绝这个问题。

不过创建一下唯一索引，可以从一开始就彻底杜绝这个问题，最多是插入的时候报错，而不会影响查询。

这个具体结合业务进行分析。

## 唯一索引创建方式

```sql
create unique index idx_test_uid on test_uid(name) online tablespace tablespace2;
```

说明：

1、作为一个好习惯，不要把索引和表格的数据放在同一个表空间。一般索引单独建一个表空间。

2、建立索引切记加online这个参数，尤其是在大表操作。这个参数加上以后，除了create过程中index 保持online状态，Oracle还会在create index之前等待所有DML操作结束，然后得到DDL锁，开始create.

# 参考资料

[Oracle 删除重复数据只留一条](https://www.cnblogs.com/252e/archive/2012/09/13/2682817.html)

[oracle创建唯一索引](https://blog.csdn.net/bobocqu/article/details/87158327)

[oracle 创建 唯一索引和非唯一索引](https://blog.csdn.net/qq_26556401/article/details/78002819)

* any list
{:toc}
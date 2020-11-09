---
layout: post
title:  MySQL 数据库最佳实践，count(*)，全文索引，事务、行锁与表锁、外键
date:  2018-09-03 08:57:39 +0800
categories: [SQL]
tags: [sql, mysql, best-practice, index, sh]
published: true
---

# count(*)

## 知识点

MyISAM 会直接存储总行数，InnoDB 则不会，需要按行扫描。

潜台词是，对于 `select count(*) from t;` 

如果数据量大，MyISAM会瞬间返回，而InnoDB则会一行行扫描。

## 实践

数据量大的表，InnoDB 不要轻易 select count(*)，性能消耗极大。

## 常见坑

只有查询全表的总行数，MyISAM才会直接返回结果，当加了where条件后，两种存储引擎的处理方式类似。

## 实例

- 用户表

t_user(uid, uname, age, sex);

uid PK

age index

- 查询

```sql
select count(*) where age<18 and sex='F';
```

查询未成年少女个数，两种存储引擎的处理方式类似，都需要进行索引扫描。

## 启示

不管哪种存储引擎，都要建立好索引。

# 关于全文索引

## 知识点

MyISAM支持全文索引，InnoDB5.6 之前不支持全文索引。

## 实践

不管哪种存储引擎，在数据量大并发量大的情况下，都不应该使用数据库自带的全文索引，会导致小量请求占用大量数据库资源，而要使用《索引外置》的架构设计方法。

## 启示

大数据量+高并发量的业务场景，全文索引，MyISAM 也不是最优之选。

# 关于事务

## 知识点

MyISAM不支持事务，InnoDB支持事务。

## 实践

事务是选择InnoDB非常诱人的原因之一，它提供了commit，rollback，崩溃修复等能力。

在系统异常崩溃时，MyISAM有一定几率造成文件损坏，这是非常烦的。

但是，事务也非常耗性能，会影响吞吐量，建议只对一致性要求较高的业务使用复杂事务。

画外音：Can't open file 'XXX.MYI'. 碰到过么？

## 小技巧

MyISAM可以通过lock table表锁，来实现类似于事务的东西，但对数据库性能影响较大，强烈不推荐使用。

# 关于外键

- 知识点

MyISAM不支持外键，InnoDB支持外键。

- 实践

不管哪种存储引擎，在数据量大并发量大的情况下，都不应该使用外键，而建议由应用程序保证完整性。

# 关于行锁与表锁

- 知识点

MyISAM只支持表锁，InnoDB可以支持行锁。

- 分析

MyISAM：执行读写SQL语句时，会对表加锁，所以数据量大，并发量高时，性能会急剧下降。

InnoDB：细粒度行锁，在数据量大，并发量高时，性能比较优异。

- 实践

网上常常说，select+insert的业务用MyISAM，因为MyISAM在文件尾部顺序增加记录速度极快。

楼主的建议是，绝大部分业务是混合读写，只要数据量和并发量较大，一律使用InnoDB。

- 常见坑

InnoDB的行锁是实现在索引上的，而不是锁在物理行记录上。

潜台词是，**如果访问没有命中索引，也无法使用行锁，将要退化为表锁**。

画外音：Oracle的行锁实现机制不同。

## 实例

- 表

t_user(uid, uname, age, sex) innodb;

uid PK

无其他索引

- 索引命中情况

1、 命中索引，行锁

```sql
update t_user set age=10 where uid=1;
```

2、未命中索引，表锁

```sql
update t_user set age=10 where uid != 1;
```

3、无索引，表锁

```sql
update t_user set age=10 where name='shenjian';
```

- 启示

InnoDB务必建好索引，否则锁粒度较大，会影响并发。

# 拓展阅读

[mysql 数据库军规](https://houbb.github.io/2017/02/27/mysql-ruler)

[索引外置](https://houbb.github.io/2018/09/03/query-design)

[索引不生效的场景](https://houbb.github.io/2018/07/30/mysql-index#%E7%B4%A2%E5%BC%95%E4%B8%8D%E7%94%9F%E6%95%88%E7%9A%84%E5%9C%BA%E6%99%AF)

# 参考资料

[InnoDB，5项最佳实践，知其所以然？](https://mp.weixin.qq.com/s/JEJcgD36dpKgbUi7xo6DzA)

* any list
{:toc}
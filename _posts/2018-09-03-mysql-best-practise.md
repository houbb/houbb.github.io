---
layout: post
title:  MySQL Best Practise
date:  2018-09-03 08:57:39 +0800
categories: [SQL]
tags: [sql, mysql, best-practise, sh]
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



# 拓展阅读

[mysql 数据库军规](https://houbb.github.io/2017/02/27/mysql-ruler)

# 参考资料

https://mp.weixin.qq.com/s/JEJcgD36dpKgbUi7xo6DzA

* any list
{:toc}
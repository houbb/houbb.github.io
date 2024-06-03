---
layout: post
title:  MySQL-16-mysql 分组之后取第一个，同时查询字段不在分组条件中 ROW_NUMBER() OVER (PARTITION BY xxx ORDER BY xxx_2)
date:  2017-7-17 10:26:01 +0800
categories: [MySQL]
tags: [sp]
published: true
---

# 拓展阅读

[MySQL 00 View](https://houbb.github.io/2017/02/27/mysql-00-view)

[MySQL 01 Ruler mysql 日常开发规范](https://houbb.github.io/2017/02/27/mysql-01-ruler)

[MySQL 02 truncate table 与 delete 清空表的区别和坑](https://houbb.github.io/2017/02/27/mysql-truncate)

[MySQL 03 Expression 1 of ORDER BY clause is not in SELECT list,references column](https://houbb.github.io/2017/02/27/mysql-03-error)

[MySQL 04 EMOJI 表情与 UTF8MB4 的故事](https://houbb.github.io/2017/02/27/mysql-04-emoj-and-utf8mb4)

[MySQL 05 MySQL入门教程（MySQL tutorial book）](https://houbb.github.io/2017/02/27/mysql-05-learn-book)

[MySQL 06 mysql 如何实现类似 oracle 的 merge into](https://houbb.github.io/2017/02/27/mysql-06-merge-into)

[MySQL 07 timeout 超时异常](https://houbb.github.io/2017/02/27/mysql-07-timeout-errors)

[MySQL 08 datetime timestamp 以及如何自动更新，如何实现范围查询](https://houbb.github.io/2017/02/27/mysql-08-datetime-timestamp)

[MySQL 09 MySQL-09-SP mysql 存储过程](https://houbb.github.io/2017/02/27/mysql-09-sp)

[MySQL 09 MySQL-group by 分组](https://houbb.github.io/2017/02/27/mysql-10-groupby)

# 需求

mysql 查询，表字段 id, app_name, create_time。

如何实现查询 select id, app_name, create_time from app_info where app_name in ('a1', 'a2')。

但是只取满足 app_name=a1, a2 的第一条

## 实现方式

要从 `app_info` 表中查询 `id`、`app_name` 和 `create_time` 字段，并且只取满足 `app_name` 为 'a1' 或 'a2' 的每个组的第一条记录，可以使用以下 SQL 语句。

这里我们假设 "第一条记录" 是指按 `create_time` 先后顺序的第一条记录：

```sql
SELECT id, app_name, create_time
FROM (
    SELECT id, app_name, create_time,
           ROW_NUMBER() OVER (PARTITION BY app_name ORDER BY create_time) as rn
    FROM app_info
    WHERE app_name IN ('a1', 'a2')
) subquery
WHERE rn = 1;
```

这个查询分两步实现：

1. 使用子查询，通过 `ROW_NUMBER()` 窗口函数对 `app_name` 进行分组，并根据 `create_time` 对每组记录进行排序，然后为每条记录分配一个行号 (`rn`)。
2. 在外层查询中，只选择 `rn` 为 1 的记录，即每组中的第一条记录。

这样可以确保每个 `app_name` ('a1' 和 'a2') 只返回一条记录，并且是按 `create_time` 排序后的第一条记录。

## 版本要求

`ROW_NUMBER()` 窗口函数在 MySQL 8.0 中引入，因此 MySQL 8.0 及以上版本支持使用 `ROW_NUMBER()` 窗口函数。

这个函数允许对查询结果集进行分区和排序，然后为每个分区中的每行分配唯一的行号。

以下是一个例子，使用 `ROW_NUMBER()` 函数来实现之前提到的查询：

```sql
SELECT id, app_name, create_time
FROM (
    SELECT id, app_name, create_time,
           ROW_NUMBER() OVER (PARTITION BY app_name ORDER BY create_time) as rn
    FROM app_info
    WHERE app_name IN ('a1', 'a2')
) subquery
WHERE rn = 1;
```

如果您使用的是 MySQL 8.0 之前的版本，那么可以通过以下替代方法来实现类似的功能，使用变量来模拟行号：

```sql
SELECT t1.id, t1.app_name, t1.create_time
FROM app_info t1
JOIN (
    SELECT app_name, MIN(create_time) AS first_time
    FROM app_info
    WHERE app_name IN ('a1', 'a2')
    GROUP BY app_name
) t2 ON t1.app_name = t2.app_name AND t1.create_time = t2.first_time;
```

这个查询使用了一个子查询来找到每个 `app_name` 的最早 `create_time`，然后通过 `JOIN` 来获取完整的记录。

这个方法虽然没有 `ROW_NUMBER()` 那么直接，但在 MySQL 5.7 及更早版本中也是一种常见的解决方案。

# 参考资料

https://www.jb51.net/database/3110399bu.htm

https://blog.csdn.net/weixin_44147535/article/details/135438169

* any list
{:toc}
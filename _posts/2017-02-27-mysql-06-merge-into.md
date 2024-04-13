---
layout: post
title: MySQL 06 mysql 如何实现类似 oracle 的 merge into
date:  2017-02-27 21:44:46 +0800
categories: [SQL]
tags: [mysql, database, sql]
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



# mysql 中 insert into tableName values() ON DUPLICATE KEY update time=now() 啥意思

在 MySQL 中，`INSERT INTO` 语句用于向表中插入新的行数据。语法如下：

```sql
INSERT INTO tableName (column1, column2, ...)
VALUES (value1, value2, ...)
```

上述语句中，`tableName` 是表的名称，`column1, column2, ...` 是要插入的列名，`value1, value2, ...` 是要插入的对应列的值。

而 `ON DUPLICATE KEY UPDATE` 子句是用于在插入数据时，当遇到主键或唯一索引冲突时，执行更新操作。这样可以避免插入重复的数据，而是更新已存在的行。

在你提供的例子中，`ON DUPLICATE KEY UPDATE time=now()` 的意思是，当插入数据时，如果出现主键或唯一索引冲突，将会更新已存在行中的 `time` 列为当前的时间戳（使用 `now()` 函数获取）。

所以，这个语句的含义是：如果要插入的数据在表中已存在（根据主键或唯一索引判断），则更新已存在行的时间列为当前时间；如果数据不存在，则插入新的行数据。

# 参考资料

https://github.com/jaywcjlove/mysql-tutorial

* any list
{:toc}
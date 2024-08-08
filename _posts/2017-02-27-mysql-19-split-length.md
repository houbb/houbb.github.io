---
layout: post
title:  MySQL-19-mysql 逗号分隔的字段，如何拆分计算长度？
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

# 场景

mysql 表中，一些收件人之类的，直接用逗号分隔。

但是需要统计发送给多少人时，就比较麻烦。

有什么方法可以直接拆分实现吗？

# 确认步骤


在 MySQL 中，你可以使用字符串处理函数来拆分逗号分隔的字段，并计算拆分后的总数。下面是一个示例：

假设有一个表 `my_table`，其中有一个字段 `my_column` 包含逗号分隔的值：

```sql
SELECT my_column FROM my_table;
```

你可以使用以下查询语句来计算每个字段中逗号分隔值的数量：

```sql
SELECT my_column,
       LENGTH(my_column) - LENGTH(REPLACE(my_column, ',', '')) + 1 AS count_values
FROM my_table;
```

解释：
- `LENGTH(my_column)` 计算 `my_column` 字段的总长度。
- `REPLACE(my_column, ',', '')` 将 `my_column` 字段中的逗号替换为空字符串，然后计算替换后的长度。
- 通过 `LENGTH(my_column) - LENGTH(REPLACE(my_column, ',', ''))` 计算逗号的数量。
- 最后加上 1，因为逗号的数量比值的数量少 1。

如果你想要计算所有记录中逗号分隔值的总和，可以使用以下查询：

```sql
SELECT SUM(LENGTH(my_column) - LENGTH(REPLACE(my_column, ',', '')) + 1) AS total_count
FROM my_table;
```

这个查询会计算所有记录中逗号分隔值的总数量。

# 参考资料

-

* any list
{:toc}
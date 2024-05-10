---
layout: post
title:  MySQL-13-mysql 如何通过 alter table drop 一个列, 如何通过 alter table add column，且在指定的列后面
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

# chat

## mysql 如何通过 alter table drop 一个列

在 MySQL 中，如果你想要通过 `ALTER TABLE` 语句删除一个列，可以使用 `DROP COLUMN` 子句。以下是具体的语法：

```sql
ALTER TABLE table_name
DROP COLUMN column_name;
```

这里的 `table_name` 是你要修改的表的名称，而 `column_name` 是你想要删除的列的名称。

例如，如果你有一个名为 `users` 的表，并且想要删除名为 `phone_number` 的列，你可以执行以下 SQL 语句：

```sql
ALTER TABLE users
DROP COLUMN phone_number;
```

在执行 `ALTER TABLE` 语句时，请确保你有足够的权限来修改数据库中的表结构，并且要意识到删除列将会移除该列的所有数据，这个操作是不可逆的，所以请在执行前确保已经做好了必要的数据备份。

此外，如果该列被用于索引、外键约束或触发器中，你可能需要先删除这些依赖于该列的对象，然后才能成功执行 `DROP COLUMN` 操作。

## Mysql 如何通过 alter table add column，且在指定的列后面

在 MySQL 中，使用 `ALTER TABLE` 语句添加列时，默认情况下新列会被添加到表的最后面。但是，如果你需要在指定位置添加列，比如在某个已存在的列之后，你可以使用 `ALTER TABLE` 语句配合 `ADD COLUMN` 和 `AFTER` 关键字来实现。

以下是具体的语法：

```sql
ALTER TABLE table_name
ADD COLUMN new_column_name column_definition
AFTER existing_column_name;
```

这里的 `table_name` 是你要修改的表的名称，`new_column_name` 是你想要添加的新列的名称，`column_definition` 是新列的定义（如数据类型等），而 `existing_column_name` 是表中已存在的列的名称，新列将会紧随这个列之后。

例如，如果你有一个名为 `users` 的表，并且想要在 `email` 列之后添加一个名为 `phone_number` 的新列，类型为 `VARCHAR(20)`，你可以执行以下 SQL 语句：

```sql
ALTER TABLE users
ADD COLUMN phone_number VARCHAR(20)
AFTER email;
```

执行这个语句后，`phone_number` 列会被添加到 `users` 表中，并且位于 `email` 列之后。

请注意，使用 `AFTER` 关键字时，只能将其放在表中已存在的列之后。如果你尝试将其放在一个不存在的列之后，MySQL 将报错。此外，也不能将其放在索引列为 `NULL` 的列之后。

在执行 `ALTER TABLE` 语句时，请确保你有足够的权限来修改数据库中的表结构。

同时，要注意操作对数据的影响，尤其是在生产环境中，建议先在测试环境中验证更改。

* any list
{:toc}
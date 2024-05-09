---
layout: post
title:  MySQL-12-mysql 如何通过 alter 修改表的唯一索引？
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

原来创建了一个唯一索引，发现少加了一个字段。需要改一下这个索引。

## 思路

修改索引，其实是 2 步：

1. 删除索引

2. 加新的索引

## 如何修改 mysql 唯一索引，从 2个字段 a,b，改成3个字段 a,b,c

在MySQL中，要修改唯一索引从包含两个字段（a, b）变更为包含三个字段（a, b, c），你需要先删除现有的唯一索引，然后创建一个新的唯一索引。

以下是具体的步骤：

1. **删除现有的唯一索引**：
   假设你的现有唯一索引名为`unique_index_name`，你可以使用`ALTER TABLE`语句来删除它。

   ```sql
   ALTER TABLE your_table_name DROP INDEX unique_index_name;
   ```

   如果你不知道索引的确切名称，可以使用`SHOW INDEX`语句来查看表的所有索引。

   ```sql
   SHOW INDEX FROM your_table_name;
   ```

2. **创建一个新的唯一索引**：
   删除旧索引后，你可以创建一个新的唯一索引，这次包括三个字段（a, b, c）。

   ```sql
   ALTER TABLE your_table_name ADD UNIQUE (a, b, c);
   ```

   这将创建一个名为`unique`的新唯一索引，它将应用于列`a`、`b`和`c`。

请确保在执行这些操作之前，你的数据库连接具有足够的权限，并且你已经对数据库进行了备份，以防止数据丢失。另外，如果你的表非常大，这些操作可能需要一些时间来完成，并且可能会影响数据库的性能。因此，最好在低峰时段进行这些更改。

## 发现这个索引，没法指定名称？

在MySQL中，要通过`ALTER TABLE`语句为表添加唯一索引，你可以使用`ADD UNIQUE`子句。

以下是添加唯一索引的语法：

```sql
ALTER TABLE table_name
ADD UNIQUE (column1, column2, ...);
```

这里的`table_name`是你想要添加唯一索引的表的名称，而`column1, column2, ...`是组成唯一索引的一个或多个列的名称。

以下是一些具体的例子：

1. **为单个列添加唯一索引**：

   ```sql
   ALTER TABLE users
   ADD UNIQUE (email);
   ```

   这将在`users`表的`email`列上添加一个名为`unique_email`的唯一索引。

2. **为多个列添加唯一索引**：

   ```sql
   ALTER TABLE orders
   ADD UNIQUE (customer_id, order_date);
   ```

   这将在`orders`表的`customer_id`和`order_date`列上添加一个复合唯一索引。

3. **指定唯一索引的名称**：

   如果你想要为唯一索引指定一个特定的名称，可以使用以下语法：

   ```sql
   ALTER TABLE users
   ADD CONSTRAINT unique_email
   UNIQUE (email);
   ```

   这将创建一个名为`unique_email`的唯一索引，它将应用于`users`表的`email`列。

请注意，在添加唯一索引之前，确保没有任何现有的数据违反了唯一性约束（即没有任何重复的值）。

如果存在违反唯一性约束的数据，`ALTER TABLE`语句将会失败。

此外，添加唯一索引可能会影响数据库的性能，特别是对于大型表。

因此，你可能需要在低峰时段进行此操作，并确保在执行之前对数据库进行了备份。

## 其他索引调整方式

在 MySQL 中，可以通过 `ALTER TABLE` 语句添加索引，并且可以指定索引的名称。以下是几种常见索引添加时指定名称的语法：

1. **添加普通索引** 并指定索引名称：
   ```sql
   ALTER TABLE table_name ADD INDEX index_name (column_list);
   ```

2. **添加唯一索引** 并指定索引名称：
   ```sql
   ALTER TABLE table_name ADD UNIQUE index_name (column_list);
   ```

3. **添加主键索引** 并指定索引名称（这将自动设置列为 NOT NULL）：
   ```sql
   ALTER TABLE table_name ADD PRIMARY KEY index_name (column_list);
   ```

4. **添加全文索引** 并指定索引名称：
   ```sql
   ALTER TABLE table_name ADD FULLTEXT index_name (column_list);
   ```

5. **添加空间索引**（需要 MySQL 的空间数据类型支持）并指定索引名称：
   ```sql
   ALTER TABLE table_name ADD SPATIAL index_name (column_list);
   ```

这里的 `table_name` 是你要修改的表名，`index_name` 是你想要给索引指定的名称，而 `column_list` 是你想要索引的一个或多个列名。

请注意，如果你尝试添加的索引名称已经存在，MySQL 将会报错。另外，索引的名称在数据库中应该是唯一的。

以下是添加一个指定名称的普通索引的完整示例：

```sql
ALTER TABLE users ADD INDEX idx_username (username);
```

这条语句将在 `users` 表上为 `username` 列创建一个普通索引，索引的名称为 `idx_username`。

在执行 `ALTER TABLE` 语句时，MySQL 会锁定该表直到语句完成，这可能会对生产环境中的数据库性能产生影响。因此，建议在低峰时段进行此类操作。


* any list
{:toc}
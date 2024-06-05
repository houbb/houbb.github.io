---
layout: post
title:  MySQL-17-mysql alter 语句如何实现？如何合并为一个
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

表在上线以后，我们需要对表进行 alter 字段处理

## 实现方式

mysql 如何通过 alter 添加一个字段？如何修改一个字段？

## 实际测试

```
mysql> select @@version;
+------------+
| @@version  |
+------------+
| 5.7.31-log |
+------------+
```

创建一张测试表

```sql
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    age INT
);
```

### 添加字段

```sql
alter table students add column create_time datetime(6) comment '创建时间';
```

测试效果

```
mysql> alter table students add column create_time datetime(6) comment '创建时间';
Query OK, 0 rows affected (0.08 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql>
mysql> desc students;
+-------------+--------------+------+-----+---------+----------------+
| Field       | Type         | Null | Key | Default | Extra          |
+-------------+--------------+------+-----+---------+----------------+
| id          | int(11)      | NO   | PRI | NULL    | auto_increment |
| name        | varchar(100) | YES  |     | NULL    |                |
| age         | int(11)      | YES  |     | NULL    |                |
| create_time | datetime(6)  | YES  |     | NULL    |                |
+-------------+--------------+------+-----+---------+----------------+
4 rows in set (0.00 sec)
```

### 修改字段

```sql
ALTER TABLE students MODIFY COLUMN name VARCHAR(256);
```

实际测试效果：

```
mysql> ALTER TABLE students MODIFY COLUMN name VARCHAR(256);
Query OK, 0 rows affected (0.02 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc students;
+-------------+--------------+------+-----+---------+----------------+
| Field       | Type         | Null | Key | Default | Extra          |
+-------------+--------------+------+-----+---------+----------------+
| id          | int(11)      | NO   | PRI | NULL    | auto_increment |
| name        | varchar(256) | YES  |     | NULL    |                |
| age         | int(11)      | YES  |     | NULL    |                |
| create_time | datetime(6)  | YES  |     | NULL    |                |
+-------------+--------------+------+-----+---------+----------------+
4 rows in set (0.00 sec)
```

### 修改字段名称+属性

如果我们希望修改字段名称，需要使用 `CHANGE COLUMN`

```sql
ALTER TABLE students CHANGE COLUMN create_time created_time datetime(3) COMMENT '创建时间';
```

实际测试效果如下：

```
mysql> ALTER TABLE students CHANGE COLUMN create_time created_time datetime(3) COMMENT '创建时间';
Query OK, 0 rows affected (0.09 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc students;
+--------------+--------------+------+-----+---------+----------------+
| Field        | Type         | Null | Key | Default | Extra          |
+--------------+--------------+------+-----+---------+----------------+
| id           | int(11)      | NO   | PRI | NULL    | auto_increment |
| name         | varchar(256) | YES  |     | NULL    |                |
| age          | int(11)      | YES  |     | NULL    |                |
| created_time | datetime(3)  | YES  |     | NULL    |                |
+--------------+--------------+------+-----+---------+----------------+
4 rows in set (0.00 sec)
```

# 场景2：如何把同一个表的多个 alter 语句合并为 1 个？

在 MySQL 中，你可以将多个 `ALTER TABLE` 语句合并为一个，以提高效率和减少表锁定时间。这是通过在一个 `ALTER TABLE` 语句中指定多个修改来实现的。每个修改用逗号分隔。

假设你有以下多个 `ALTER TABLE` 语句：

```sql
ALTER TABLE my_table ADD COLUMN new_column1 VARCHAR(100);
ALTER TABLE my_table MODIFY COLUMN existing_column VARCHAR(256);
ALTER TABLE my_table ADD COLUMN new_column2 INT;
ALTER TABLE my_table DROP COLUMN old_column;
```

你可以将它们合并为一个 `ALTER TABLE` 语句，如下所示：

```sql
ALTER TABLE my_table
ADD COLUMN new_column1 VARCHAR(100),
MODIFY COLUMN existing_column VARCHAR(256),
ADD COLUMN new_column2 INT,
DROP COLUMN old_column;
```

### 示例

假设你有一个名为 `students` 的表，你想执行以下修改：

1. 添加一个名为 `email` 的字段，类型为 `VARCHAR(255)`。
2. 修改 `name` 字段的长度为 `VARCHAR(256)`。
3. 添加一个名为 `birthdate` 的字段，类型为 `DATE`。
4. 删除一个名为 `old_field` 的字段。

将这些操作合并为一个 `ALTER TABLE` 语句：

```sql
ALTER TABLE students
ADD COLUMN email VARCHAR(255),
MODIFY COLUMN name VARCHAR(256),
ADD COLUMN birthdate DATE,
DROP COLUMN old_field;
```

### 注意事项

1. **顺序问题**：在某些情况下，操作的顺序可能很重要。例如，如果你要修改一个字段的名称然后更改其类型，确保先重命名再修改类型。
2. **兼容性问题**：确保所有操作在一个 `ALTER TABLE` 语句中执行时不会互相冲突。例如，删除一个字段然后再添加同名字段在同一个语句中可能会出问题。
3. **备份数据**：在对表结构进行重大更改之前，最好备份数据，以防出现意外情况。

合并 `ALTER TABLE` 语句不仅可以提高执行效率，还可以减少数据库表的锁定时间，尤其是在处理大表时，这一点尤为重要。

## 为什么需要合并为一个?

将多个 `ALTER TABLE` 语句合并为一个有以下几个主要原因和好处：

### 1. **减少表锁定时间**
每个 `ALTER TABLE` 操作都会对表进行锁定，阻止其他操作在同一时间修改表结构。多个 `ALTER TABLE` 语句将导致多次锁定表，增加锁定时间。而将多个修改合并为一个 `ALTER TABLE` 语句只会锁定表一次，从而减少表的锁定时间，提高并发操作的性能。

### 2. **提高执行效率**
每个 `ALTER TABLE` 操作都需要对表进行扫描和重新构建索引，这会增加执行时间。将多个操作合并为一个语句可以减少表扫描和索引重建的次数，从而提高执行效率。

### 3. **减少日志和备份空间**
每个 `ALTER TABLE` 操作都会生成一条日志记录。如果有大量的 `ALTER TABLE` 操作，这些日志记录会占用大量的磁盘空间。合并操作可以减少日志记录的数量，节省磁盘空间。

### 4. **降低发生错误的概率**
当你分多次执行 `ALTER TABLE` 语句时，任何一次操作的失败都可能导致数据不一致。将所有操作合并在一起，可以保证所有修改要么全部成功，要么全部失败，减少了数据不一致的风险。

### 示例对比

#### 多次 `ALTER TABLE` 语句：
```sql
ALTER TABLE students ADD COLUMN email VARCHAR(255);
ALTER TABLE students MODIFY COLUMN name VARCHAR(256);
ALTER TABLE students ADD COLUMN birthdate DATE;
ALTER TABLE students DROP COLUMN old_field;
```

这些语句会导致表被锁定四次，每次操作都会产生相应的日志记录，并且每次操作都会重新扫描表和重建索引。

#### 合并后的 `ALTER TABLE` 语句：
```sql
ALTER TABLE students
ADD COLUMN email VARCHAR(255),
MODIFY COLUMN name VARCHAR(256),
ADD COLUMN birthdate DATE,
DROP COLUMN old_field;
```

这个语句只会锁定表一次，减少表扫描和索引重建的次数，以及相应的日志记录。

### 结论

合并 `ALTER TABLE` 语句有助于提高性能，减少锁定时间，节省磁盘空间，并降低数据不一致的风险。

这在处理大表或高并发环境下尤其重要，有助于保持数据库的高效和稳定运行。

# chat

## 为什么 mysql 需要有 CHANGE COLUMN，而不是统一的 MODIFY COLUMN?

MySQL 提供了 `MODIFY COLUMN` 和 `CHANGE COLUMN` 两个不同的语法，以便为用户提供灵活性来处理不同的修改需求。虽然这两者在某些情况下可以互换使用，但它们之间有一些关键区别，这使得保留两者有其实际意义。

### 主要区别

1. **修改字段名称**：
   - **`CHANGE COLUMN`** 可以同时修改字段名称和字段类型。
   - **`MODIFY COLUMN`** 只能修改字段类型，不能修改字段名称。

2. **语法要求**：
   - **`CHANGE COLUMN`** 语法：
     ```sql
     ALTER TABLE table_name CHANGE COLUMN old_column_name new_column_name column_definition;
     ```
     `CHANGE COLUMN` 需要指定旧的字段名称和新的字段名称，即使字段名称没有变化，新的字段名称也必须写出来。
   - **`MODIFY COLUMN`** 语法：
     ```sql
     ALTER TABLE table_name MODIFY COLUMN column_name column_definition;
     ```
     `MODIFY COLUMN` 只需要指定字段名称和新的字段定义，不需要旧的字段名称。

### 使用场景

1. **修改字段类型而不修改名称**：
   - 使用 `MODIFY COLUMN` 更简洁，因为只需指定字段名称和新类型。

   ```sql
   ALTER TABLE my_table MODIFY COLUMN name VARCHAR(256);
   ```

2. **修改字段名称和类型**：
   - 使用 `CHANGE COLUMN`，因为它允许同时修改字段名称和类型。

   ```sql
   ALTER TABLE my_table CHANGE COLUMN old_name new_name VARCHAR(256);
   ```

### 示例对比

假设有一个表 `employees`，包含字段 `employee_name`，我们需要将其长度改为 256 个字符。

- 使用 `MODIFY COLUMN` 仅修改字段类型：

  ```sql
  ALTER TABLE employees MODIFY COLUMN employee_name VARCHAR(256);
  ```

- 使用 `CHANGE COLUMN` 修改字段名称和类型（即使名称不变，也必须指定）：

  ```sql
  ALTER TABLE employees CHANGE COLUMN employee_name employee_name VARCHAR(256);
  ```

### 结论

MySQL 保留 `MODIFY COLUMN` 和 `CHANGE COLUMN` 两个语法，是为了提供更大的灵活性，满足不同的修改需求。

这样，用户在只需要修改字段类型时可以使用更简洁的 `MODIFY COLUMN`，而在需要修改字段名称时可以使用 `CHANGE COLUMN`。

这种设计提高了 SQL 语句的可读性和易用性。

# 参考资料

https://www.jb51.net/database/3110399bu.htm

https://blog.csdn.net/weixin_44147535/article/details/135438169

* any list
{:toc}
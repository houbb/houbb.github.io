---
layout: post
title: mysql Tutorial-06-table alter 表的变更
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# 介绍一下 mysql 的表的 alter 变更 

## 说明

在MySQL中，使用`ALTER TABLE`语句可以对已存在的表进行结构变更，包括添加、修改、删除列，添加或删除约束，以及其他一些表结构的变更。

`ALTER TABLE`语句提供了丰富的选项，可以根据需要进行灵活的表结构变更。

下面是一些常见的`ALTER TABLE`用法和示例：

### 1. 添加列：

要向表中添加新列，可以使用`ADD COLUMN`子句。例如：

```sql
ALTER TABLE table_name ADD COLUMN column_name column_definition;
```

示例：

```sql
ALTER TABLE employees ADD COLUMN email VARCHAR(100);
```

这将向名为`employees`的表中添加一个名为`email`的新列。

### 2. 修改列：

要修改列的定义，可以使用`MODIFY COLUMN`子句。例如：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name new_column_definition;
```

示例：

```sql
ALTER TABLE employees MODIFY COLUMN age INT UNSIGNED;
```

这将修改名为`employees`的表中`age`列的数据类型为无符号整数。

### 3. 删除列：

要删除表中的列，可以使用`DROP COLUMN`子句。例如：

```sql
ALTER TABLE table_name DROP COLUMN column_name;
```

示例：

```sql
ALTER TABLE employees DROP COLUMN email;
```

这将从名为`employees`的表中删除名为`email`的列。

### 4. 添加主键约束：

要向表中添加主键约束，可以使用`ADD CONSTRAINT`子句。例如：

```sql
ALTER TABLE table_name ADD CONSTRAINT pk_constraint_name PRIMARY KEY (column_name);
```

示例：

```sql
ALTER TABLE employees ADD CONSTRAINT pk_employee_id PRIMARY KEY (id);
```

这将向名为`employees`的表中添加一个名为`pk_employee_id`的主键约束，作用于`id`列。

### 5. 添加外键约束：

要向表中添加外键约束，可以使用`ADD CONSTRAINT`子句。例如：

```sql
ALTER TABLE table_name ADD CONSTRAINT fk_constraint_name FOREIGN KEY (column_name) REFERENCES reference_table(reference_column);
```

示例：

```sql
ALTER TABLE employees ADD CONSTRAINT fk_department_id FOREIGN KEY (department_id) REFERENCES departments(id);
```

这将向名为`employees`的表中添加一个名为`fk_department_id`的外键约束，将`department_id`列与`departments`表中的`id`列关联起来。

以上是一些常见的`ALTER TABLE`用法和示例。

通过使用`ALTER TABLE`语句，可以灵活地对MySQL表进行结构变更，满足不同的需求。

在MySQL中，使用`ALTER TABLE`语句可以对表进行各种变更操作，包括添加索引和删除索引。下面我将分别介绍如何使用`ALTER TABLE`语句给指定字段添加索引和删除索引。

### 5. 给指定字段添加索引：

要给表的指定字段添加索引，可以使用`ALTER TABLE`语句结合`ADD INDEX`子句来实现。以下是一个示例：

```sql
ALTER TABLE table_name ADD INDEX index_name (column_name);
```

- `table_name`：要添加索引的表的名称。
- `index_name`：要添加的索引的名称，可以自定义。
- `column_name`：要添加索引的字段的名称。

例如，假设我们有一个名为`employees`的表，现在要给`employees`表的`name`字段添加一个名为`idx_name`的索引，可以执行以下命令：

```sql
ALTER TABLE employees ADD INDEX idx_name (name);
```

### 6. 删除指定字段的索引：

要删除表的指定字段的索引，可以使用`ALTER TABLE`语句结合`DROP INDEX`子句来实现。以下是一个示例：

```sql
ALTER TABLE table_name DROP INDEX index_name;
```

- `table_name`：要删除索引的表的名称。
- `index_name`：要删除的索引的名称。

例如，假设我们要删除上面示例中给`employees`表添加的名为`idx_name`的索引，可以执行以下命令：

```sql
ALTER TABLE employees DROP INDEX idx_name;
```

通过这些操作，你可以灵活地给指定字段添加索引和删除索引，以优化数据库的查询性能。

## 实际测试

```sql
mysql> use mysql_learn;
Database changed
mysql> show tables;
+-----------------------+
| Tables_in_mysql_learn |
+-----------------------+
| employees             |
| employees_backup      |
+-----------------------+
2 rows in set (0.00 sec)
```

查看建表语句:

```sql
mysql> show create table employees;
+-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table     | Create Table

                                                                        |
+-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| employees | CREATE TABLE "employees" (
  "id" int(11) NOT NULL AUTO_INCREMENT,
  "name" varchar(100) DEFAULT NULL,
  "age" int(11) DEFAULT NULL,
  "department" varchar(100) DEFAULT NULL,
  "salary" decimal(10,2) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='员工信息表'      |
+-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.02 sec)
```

查看表结构：

```
mysql> desc employees;
+------------+---------------+------+-----+---------+----------------+
| Field      | Type          | Null | Key | Default | Extra          |
+------------+---------------+------+-----+---------+----------------+
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| name       | varchar(100)  | YES  |     | NULL    |                |
| age        | int(11)       | YES  |     | NULL    |                |
| department | varchar(100)  | YES  |     | NULL    |                |
| salary     | decimal(10,2) | YES  |     | NULL    |                |
+------------+---------------+------+-----+---------+----------------+
5 rows in set (0.00 sec)
```

### 添加列

我们给用户加一个 email 字段。

```sql
mysql> alter table employees add column email varchar(64);
Query OK, 0 rows affected (0.08 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc employees;
+------------+---------------+------+-----+---------+----------------+
| Field      | Type          | Null | Key | Default | Extra          |
+------------+---------------+------+-----+---------+----------------+
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| name       | varchar(100)  | YES  |     | NULL    |                |
| age        | int(11)       | YES  |     | NULL    |                |
| department | varchar(100)  | YES  |     | NULL    |                |
| salary     | decimal(10,2) | YES  |     | NULL    |                |
| email      | varchar(64)   | YES  |     | NULL    |                |
+------------+---------------+------+-----+---------+----------------+
6 rows in set (0.00 sec)
```

### 修改列

我们发现这个 email 可能会更长，如何修改呢？

```sql
mysql> alter table employees MODIFY column email varchar(256);
Query OK, 0 rows affected (0.72 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc employees;
+------------+---------------+------+-----+---------+----------------+
| Field      | Type          | Null | Key | Default | Extra          |
+------------+---------------+------+-----+---------+----------------+
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| name       | varchar(100)  | YES  |     | NULL    |                |
| age        | int(11)       | YES  |     | NULL    |                |
| department | varchar(100)  | YES  |     | NULL    |                |
| salary     | decimal(10,2) | YES  |     | NULL    |                |
| email      | varchar(256)  | YES  |     | NULL    |                |
+------------+---------------+------+-----+---------+----------------+
6 rows in set (0.00 sec)
```

### 删除列

过一会儿项目经理和你说，这个 email 你可以放在 extra 拓展表，所以你要把 email 去掉。

```sql
mysql> alter table employees DROP column email;
Query OK, 0 rows affected (0.06 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc employees;
+------------+---------------+------+-----+---------+----------------+
| Field      | Type          | Null | Key | Default | Extra          |
+------------+---------------+------+-----+---------+----------------+
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| name       | varchar(100)  | YES  |     | NULL    |                |
| age        | int(11)       | YES  |     | NULL    |                |
| department | varchar(100)  | YES  |     | NULL    |                |
| salary     | decimal(10,2) | YES  |     | NULL    |                |
+------------+---------------+------+-----+---------+----------------+
5 rows in set (0.00 sec)
```

### 添加字段索引

有时候虽然业务的变化，我们需要给指定字段添加索引，提升查询性能。

索引我们后续会专门讲解，这里先做了解。

```
mysql> alter table employees add index ix_name(name);
Query OK, 0 rows affected (0.05 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

疑问：我们修改了索引，怎么能比较方便的看到呢？

如果你使用 mysql client 客户端，一般直接编辑表，都可以直接看到。

那么 mysql 中是如何查看的呢？

我们可以用下面的方式：

```sql
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    NON_UNIQUE,
    INDEX_TYPE
FROM
    information_schema.statistics
WHERE
    TABLE_SCHEMA = 'your_database_name'
    AND TABLE_NAME = 'your_table_name';
```

解释一下查询结果的字段含义：

TABLE_NAME：表名称

INDEX_NAME：索引名称

COLUMN_NAME：索引包含的列名

SEQ_IN_INDEX：索引中列的顺序

NON_UNIQUE：索引是否为唯一索引，0 表示唯一索引，1 表示非唯一索引

INDEX_TYPE：索引类型，例如 BTREE、HASH 等


实际测试下：

```sql
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    NON_UNIQUE,
    INDEX_TYPE
FROM
    information_schema.statistics
WHERE
    TABLE_SCHEMA = 'mysql_learn'
    AND TABLE_NAME = 'employees';
```

如下：

```
+------------+------------+-------------+--------------+------------+------------+
| TABLE_NAME | INDEX_NAME | COLUMN_NAME | SEQ_IN_INDEX | NON_UNIQUE | INDEX_TYPE |
+------------+------------+-------------+--------------+------------+------------+
| employees  | PRIMARY    | id          |            1 |          0 | BTREE      |
| employees  | ix_name    | name        |            1 |          1 | BTREE      |
+------------+------------+-------------+--------------+------------+------------+
```

### 移除字段索引

当然，也许你加错了，或者发现某个索引不再需要。

也可以把这个索引移除。

```
mysql> alter table employees drop index ix_name;
Query OK, 0 rows affected (0.03 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> SELECT
    ->     TABLE_NAME,
    ->     INDEX_NAME,
    ->     COLUMN_NAME,
    ->     SEQ_IN_INDEX,
    ->     NON_UNIQUE,
    ->     INDEX_TYPE
    -> FROM
    ->     information_schema.statistics
    -> WHERE
    ->     TABLE_SCHEMA = 'mysql_learn'
    ->     AND TABLE_NAME = 'employees';
+------------+------------+-------------+--------------+------------+------------+
| TABLE_NAME | INDEX_NAME | COLUMN_NAME | SEQ_IN_INDEX | NON_UNIQUE | INDEX_TYPE |
+------------+------------+-------------+--------------+------------+------------+
| employees  | PRIMARY    | id          |            1 |          0 | BTREE      |
+------------+------------+-------------+--------------+------------+------------+
1 row in set (0.01 sec)
```

此时索引又会变成原来的样子。



# mysql 表的 rename

## 说明

在 MySQL 中，可以使用 `ALTER TABLE` 语句来重命名表。

通过重命名表，可以更改表的名称而不影响表的结构和数据。

以下是如何在 MySQL 中重命名表的步骤：

### 重命名表：

```sql
ALTER TABLE old_table_name RENAME TO new_table_name;
```

- `old_table_name`：要重命名的现有表的名称。
- `new_table_name`：新的表名称。

例如，要将表 `employees` 重命名为 `staff`，可以执行以下命令：

```sql
ALTER TABLE employees RENAME TO staff;
```

### 注意事项：

- 在执行重命名操作时，请确保你有足够的权限来修改表结构。

- 在重命名表之后，表的所有相关对象（如存储过程、触发器、视图等）仍然会引用新的表名。

- 重命名表不会修改表的任何结构或数据，只会修改表的名称。

通过重命名表，你可以更改表的名称以满足业务需求或数据库设计的变更，同时保持表的结构和数据不变。

## 实际测试


```sql
mysql> use mysql_learn;
Database changed
mysql> show tables;
+-----------------------+
| Tables_in_mysql_learn |
+-----------------------+
| employees             |
| employees_backup      |
+-----------------------+
2 rows in set (0.00 sec)
```

假设我们觉得 employees_backup 不是很顺眼，想改成 `employees_bak`

可以执行:

```sql
mysql> ALTER table employees_backup rename to employees_bak;
Query OK, 0 rows affected (0.03 sec)

mysql> show tables;
+-----------------------+
| Tables_in_mysql_learn |
+-----------------------+
| employees             |
| employees_bak         |
+-----------------------+
2 rows in set (0.00 sec)
```





# 参考资料

https://www.tutorialspoint.com/mysql/mysql_create_table.htm

* any list
{:toc}
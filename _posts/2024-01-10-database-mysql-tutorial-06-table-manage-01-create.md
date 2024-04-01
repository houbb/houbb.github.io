---
layout: post
title: mysql Tutorial-06-table create 表的创建
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# 介绍一下 mysql 的表

在MySQL中，表（Table）是用于存储数据的基本结构。

表由行（Row）和列（Column）组成，行表示表中的每个数据记录，列表示数据记录的属性或字段。

表是数据库中最常用的对象之一，它们用于组织和存储数据，并提供了对数据的高效管理和操作。

以下是关于MySQL表的一些重要信息和特性：

### 1. 表结构：

- **行（Row）**：表中的每一行表示一个数据记录，也称为记录（Record）或元组（Tuple）。
- **列（Column）**：表中的每一列表示数据记录的一个属性，也称为字段（Field）或属性（Attribute）。
- **主键（Primary Key）**：主键是用于唯一标识每个数据记录的一列或一组列，保证了表中数据记录的唯一性。
- **外键（Foreign Key）**：外键是表中的一列，它与另一个表的主键或唯一键相关联，用于建立表与表之间的关联关系。

### 2. 表类型：

- **InnoDB表**：默认的存储引擎，在事务处理和行级锁上提供了良好的性能和可靠性。
- **MyISAM表**：提供了较快的读取速度和较小的存储空间，但不支持事务处理和行级锁。

### 3. 表操作：

- **创建表**：使用 `CREATE TABLE` 语句创建新表，指定表的名称、列名、数据类型、约束等。

- **查看表**：使用 `SHOW TABLES` 可以查看创建的表。

- **查看表结构**：使用 `DESC`+表名称 语句查看表的结构信息。

- **修改表结构**：使用 `ALTER TABLE` 语句修改表的结构，包括添加列、修改列、删除列等操作。

- **删除表**：使用 `DROP TABLE` 语句删除不再需要的表，慎用，删除后数据将无法恢复。

### 4. 表约束：

- **主键约束**：保证表中每行的唯一性。
- **唯一约束**：保证表中某列或一组列的值唯一。
- **外键约束**：用于建立表与表之间的关联关系，保证数据的一致性。
- **检查约束**：限制列中的值必须满足指定的条件。

### 5. 表空间：

- **数据空间**：存储表中的实际数据。
- **索引空间**：存储表的索引信息，用于加速数据检索。

MySQL中的表是数据库中存储数据的基本单元，它们提供了高效的数据组织和管理机制，可以满足各种复杂的业务需求。

通过合理设计和管理表结构，可以实现数据库的高性能和可靠性。

# mysql 表的创建

## 说明

建表语句的语法：

```sql
CREATE TABLE [IF NOT EXISTS] table_name(
   column1 datatype,
   column2 datatype,
   column3 datatype,
   .....
   columnN datatype,
);
```

## 实际测试

```sql
create database mysql_learn;
use mysql_learn;
```

建表：

```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY, -- 员工ID，主键，自动增长
    name VARCHAR(100),                 -- 员工姓名
    age INT,                           -- 员工年龄
    department VARCHAR(100),           -- 员工部门
    salary DECIMAL(10, 2)              -- 员工薪资
) COMMENT='员工信息表';                -- 表注释，描述了表的用途
```

查看确认：

```
mysql> show tables;
+-----------------------+
| Tables_in_mysql_learn |
+-----------------------+
| employees             |
+-----------------------+
1 row in set (0.02 sec)
```

## 再次创建会怎么样？

我们再次执行建表语句：

```sql
mysql> CREATE TABLE employees (
    ->     id INT AUTO_INCREMENT PRIMARY KEY, -- 员工ID，主键，自动增长
    ->     name VARCHAR(100),                 -- 员工姓名
    ->     age INT,                           -- 员工年龄
    ->     department VARCHAR(100),           -- 员工部门
    ->     salary DECIMAL(10, 2)              -- 员工薪资
    -> ) COMMENT='员工信息表';                -- 表注释，描述了表的用途
ERROR 1050 (42S01): Table 'employees' already exists
```

提示表已经存在，会报错。

这有些不够优雅，我们可以做到让表不存在才创建吗？

### IF NOT EXISTS

我们可以改一下建表语句，加上 `IF NOT EXISTS，当表不存在时才执行。

```sql
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY, -- 员工ID，主键，自动增长
    name VARCHAR(100),                 -- 员工姓名
    age INT,                           -- 员工年龄
    department VARCHAR(100),           -- 员工部门
    salary DECIMAL(10, 2)              -- 员工薪资
) COMMENT='员工信息表';                -- 表注释，描述了表的用途
```

再次执行试一下

```sql
mysql> CREATE TABLE IF NOT EXISTS employees (
    ->     id INT AUTO_INCREMENT PRIMARY KEY, -- 员工ID，主键，自动增长
    ->     name VARCHAR(100),                 -- 员工姓名
    ->     age INT,                           -- 员工年龄
    ->     department VARCHAR(100),           -- 员工部门
    ->     salary DECIMAL(10, 2)              -- 员工薪资
    -> ) COMMENT='员工信息表';                -- 表注释，描述了表的用途
Query OK, 0 rows affected, 1 warning (0.02 sec)
```

此时就不会在报错，只不过不会产生影响。

## 从已有的表创建

我们可以直接从已有的表创建一张新表吗？

### 说明

在MySQL中，可以使用 `CREATE TABLE ... SELECT` 语句来实现这一功能。

该语法允许你从一个现有的表中选择数据，并将其插入到新表中，同时也可以选择性地添加额外的列或约束。

以下是一个示例，展示了如何从现有的表创建一张新表：

假设我们有一个名为 `employees` 的现有表，它具有以下结构：

```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    department VARCHAR(100),
    salary DECIMAL(10, 2)
);
```

现在，我们想要创建一个新表 `employees_backup`，它与 `employees` 表具有相同的结构，但不包含任何数据。

我们可以使用以下 `CREATE TABLE ... SELECT` 语句来实现：

```sql
CREATE TABLE employees_backup AS
SELECT * FROM employees WHERE 1=0;
```

在这个示例中，`CREATE TABLE employees_backup AS` 部分表示创建一个名为 `employees_backup` 的新表。

`SELECT * FROM employees WHERE 1=0` 部分表示从 `employees` 表中选择数据，但由于 `WHERE 1=0` 条件永远不成立，所以不会选择任何实际数据。

这样，新表 `employees_backup` 就会具有与 `employees` 表相同的结构，但不包含任何数据。

当然，我们可以通过修改条件，来决定新表的数据。

通过这种方式，你可以方便地从现有的表创建一张新表，并且保持表结构的一致性。

### 实际测试

```sql
create table employees_backup AS SELECT * FROM employees where 1=1;
```

会发现并不能成功，错误如下：

```
create table employees_backup AS SELECT * FROM employees where 1=1;
ERROR 1786 (HY000): Statement violates GTID consistency: CREATE TABLE ... SELECT.
```

为什么呢？

报错信息提示了 GTID 一致性问题。

GTID（全局事务标识符）是MySQL中用于复制和高可用性配置的一种标识机制，它确保在复制过程中的一致性和容错性。

在MySQL 5.6及之后的版本中，默认情况下启用了 GTID。

在GTID模式下，一些DDL语句（比如 CREATE TABLE ... SELECT）的使用会受到限制，因为这些语句可能会引起数据不一致。

具体来说，CREATE TABLE ... SELECT 语句在 GTID 模式下不允许跨事务复制数据。

解决这个问题的方法有两种：

1) 使用不同的方法创建表：可以尝试使用其他方法来创建新表，例如，先创建一个空表，然后使用 INSERT INTO ... SELECT 语句从现有表中复制数据到新表中。

```sql
CREATE TABLE employees_backup (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    department VARCHAR(100),
    salary DECIMAL(10, 2)
);

INSERT INTO employees_backup SELECT * FROM employees WHERE 1=1;
```

一般实际使用，建议使用这一种方式。

2) 禁用 GTID：如果不需要使用 GTID，可以在 MySQL 配置中禁用 GTID 模式。

具体的方法取决于你的 MySQL 配置和版本。

请注意，**禁用 GTID 可能会影响到数据库的复制和高可用性配置**。

### 建表小技巧

如果你的备份表和原始表一样，可以这样创建：

```sql
create table employees_backup like employees;
```

这样可以创建一张一模一样的表：

```
mysql> create table employees_backup like employees;
Query OK, 0 rows affected (0.03 sec)

mysql> desc employees_backup;
+------------+---------------+------+-----+---------+----------------+
| Field      | Type          | Null | Key | Default | Extra          |
+------------+---------------+------+-----+---------+----------------+
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| name       | varchar(100)  | YES  |     | NULL    |                |
| age        | int(11)       | YES  |     | NULL    |                |
| department | varchar(100)  | YES  |     | NULL    |                |
| salary     | decimal(10,2) | YES  |     | NULL    |                |
+------------+---------------+------+-----+---------+----------------+
5 rows in set (0.01 sec)
```

# 参考资料

https://www.tutorialspoint.com/mysql/mysql_create_table.htm

* any list
{:toc}
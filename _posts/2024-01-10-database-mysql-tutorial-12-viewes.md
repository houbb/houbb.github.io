---
layout: post
title: mysql Tutorial-12-view 视图介绍
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# 表准备

测试表准备。

```sql
create database mysql_learn;
use mysql_learn;

drop table if exists employees;
CREATE TABLE "employees" (
  "employee_id" int(11) NOT NULL AUTO_INCREMENT,
  "first_name" varchar(32) DEFAULT NULL,
  "last_name" varchar(32) DEFAULT NULL,
  "age" int(11) DEFAULT NULL,
  "department" varchar(32) DEFAULT NULL,
  "salary" decimal(10,2) DEFAULT NULL,
  PRIMARY KEY ("employee_id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='员工信息表';

drop table if exists department;
CREATE TABLE "department" (
  "id" int(11) NOT NULL AUTO_INCREMENT,
  "name" varchar(32) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='部门信息表';
```

我们插入初始化数据：

```sql
insert into employees(first_name, last_name, age, department, salary) values ('老马', '啸西风', 29, 'IT', 88888);
insert into employees(first_name, last_name, age, department, salary) values ('小叶', '爱开源', 27, 'SALE', 9999);

insert into department(id, name) values (1, 'IT');
insert into department(id, name) values (2, 'SALE');
```

数据确认：

```
mysql> select * from employees;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 88888.00 |
|           2 | 小叶       | 爱开源    |   27 | SALE       |  9999.00 |
+-------------+------------+-----------+------+------------+----------+
2 rows in set (0.00 sec)

mysql> select * from department;
+----+------+
| id | name |
+----+------+
|  1 | IT   |
|  2 | SALE |
+----+------+
2 rows in set (0.00 sec)
```

# 详细介绍下 mysql view 视图 

## 说明

MySQL视图（View）是一种虚拟的表，它是由一个或多个查询语句所定义的结果集合。

视图本身并不包含数据，它只是一个对存储在数据库中的基本表的查询结果的引用。

视图可以像表一样被查询，但是其实际内容是根据定义视图的查询语句在运行时动态生成的。

## 视图的优点

1. 简化复杂查询：可以将复杂的查询逻辑封装在视图中，简化对数据的查询操作。

2. 安全性控制：可以通过视图限制用户对特定列的访问权限，从而增强数据安全性。

3. 重用性：视图可以被多个查询重复使用，提高了代码的重用性。

4. 数据独立性：视图的存在使得应用程序与数据结构之间的耦合度降低，当基础表结构变化时，只需要调整视图而不需要修改应用程序。

## 视图的缺点

1. 性能问题：视图的查询性能可能不如直接查询表，特别是当视图的定义包含了复杂的查询逻辑时。

2. 更新限制：某些类型的视图不支持更新操作，这限制了其在一些场景下的使用。

3. 数据一致性：由于视图本质上是对基础表的引用，当基础表发生变化时，视图的内容也会相应地改变，这可能导致一些数据一致性的问题。

## 使用场景

1. 简化查询：当需要频繁执行的复杂查询可以封装成视图，以提高查询的简洁性和可读性。

2. 数据安全性控制：通过视图可以对用户的数据访问权限进行细粒度的控制。

3. 报表生成：可以使用视图来简化报表生成过程，使得报表代码更加清晰简洁。

总的来说，MySQL视图是一个强大的工具，可以用于简化复杂查询、增强数据安全性，并提高代码的重用性。但

在使用时需要注意性能和数据一致性等方面的问题。

# 视图的基本管理

## 视图的创建

使用`CREATE VIEW`语句可以创建一个视图。

语法如下：

```sql
CREATE VIEW view_name AS
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

### 实际测试

我们直接选取一些字段，构建一个新的视图

```sql
CREATE VIEW emp_view AS
SELECT employee_id, concat(first_name, last_name) AS full_name
FROM employees
WHERE 1=1;
```

## 查询视图

创建视图后，可以像查询表一样使用视图。例如：

```sql
SELECT * FROM view_name;
```

### 实际测试

我们查一下刚才创建的 view

```sql
CREATE VIEW emp_view AS
SELECT employee_id, concat(first_name, last_name) AS full_name, age 
FROM employees
WHERE 1=1;

mysql> select * from emp_view;
+-------------+-----------------+------+
| employee_id | full_name       | age  |
+-------------+-----------------+------+
|           1 | 老马啸西风      |   29 |
|           2 | 小叶爱开源      |   27 |
+-------------+-----------------+------+
2 rows in set (0.00 sec)
```

## 视图的更新

视图的更新指的是通过视图对基础表进行的更新操作。

一般来说，视图是虚拟的，它本身并不存储数据，而是通过对基础表的查询动态生成结果集。

因此，**更新视图实际上是在更新基础表的数据**。

在 MySQL 中，视图的更新操作是受到一些限制的，取决于视图的定义方式以及是否满足特定的条件。

### 更新视图的限制

1. **单表视图的更新：** 

- 如果视图仅由单个基础表定义，并且满足一些特定的条件，例如视图中不包含以下操作符：`GROUP BY`、`DISTINCT`、`UNION`、`JOIN`（在 MySQL 5.7之前的版本中），则可以对视图进行更新。

- MySQL 5.7版本之后，也允许对包含JOIN操作的视图进行更新，但是要求视图中的JOIN操作必须满足一些特定的条件，例如：JOIN操作使用的连接条件必须是等值连接。

2. **多表视图的更新：**

- 多表视图通常不能直接进行更新操作，因为其更新可能导致歧义。MySQL对于多表视图的更新限制较多，因为更新可能会影响到多个表，而 MySQL 难以确定应该如何更新。不过，在某些情况下，可以通过触发器或者其他方式实现多表视图的更新操作。

3. **必须满足更新条件：**

- 在更新视图时，必须满足一些条件，例如视图中的列必须是可更新的（不是计算字段或表达式）、更新操作不违反视图的定义等。

### 更新视图的语法

对于可以进行更新的视图，更新操作的语法与更新表的语法相似，使用 `UPDATE` 关键字，示例如下：

```sql
UPDATE view_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
```


### 实际测试

简单字段的更新：

我们让老马返老返童：

```sql
mysql> select * from emp_view;
+-------------+-----------------+------+
| employee_id | full_name       | age  |
+-------------+-----------------+------+
|           1 | 老马啸西风      |   28 |
|           2 | 小叶爱开源      |   27 |
+-------------+-----------------+------+
2 rows in set (0.00 sec)

mysql> select * from employees;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   28 | IT         | 88888.00 |
|           2 | 小叶       | 爱开源    |   27 | SALE       |  9999.00 |
+-------------+------------+-----------+------+------------+----------+
2 rows in set (0.00 sec)
```

可以看到，我们针对视图的修改，直接让原始表的信息也跟着修改了。

那如果我们直接修改一个组合字段，大家猜猜会怎么样？

```sql
UPDATE emp_view
SET full_name = '小叶真的爱开源'
WHERE full_name = '小叶爱开源';
```

结果如下：

```
mysql> UPDATE emp_view
    -> SET full_name = '小叶真的爱开源'
    -> WHERE full_name = '小叶爱开源';
ERROR 1348 (HY000): Column 'full_name' is not updatable
```

是的，这种对应的原始字段导致 Mysql 不知道如何更新。

### 视图更新的注意事项

1. 视图更新可能导致基础表的数据发生改变，因此在进行更新操作时需要谨慎，确保不会影响到其他应用程序或者用户。

2. 视图更新的性能可能不如直接更新表，因为更新视图实际上是在更新基础表的数据，并且可能涉及到更复杂的查询逻辑。

3. 视图更新受到一些限制，需要满足一定的条件才能进行更新操作，因此在设计视图时需要考虑到更新的需求。

4. 视图更新的语法与更新表的语法类似，但是需要注意更新操作是否符合视图的定义以及更新条件是否合理。

视图的更新操作是一种对基础表数据进行操作的方式，但需要注意更新操作的限制以及可能引起的数据一致性和性能问题。

## 视图的 drop

### 语法

删除视图可以通过 `DROP VIEW` 语句来完成。

`DROP VIEW` 语句用于从数据库中删除一个已经存在的视图。

语法如下：

```sql
DROP VIEW [IF EXISTS] view_name;
```

- `IF EXISTS`: 可选项，如果指定了该选项，并且视图存在，则删除该视图；如果没有指定该选项，并且视图不存在，则将返回错误。

- `view_name`: 要删除的视图的名称。

### 实际测试

```sql
DROP VIEW IF EXISTS emp_view;
```

这将删除名为 `my_view` 的视图。如果视图不存在，该语句不会产生错误。

删除视图是一个谨慎的操作，因为一旦删除，视图的定义就会丢失，无法恢复。

因此，在执行 `DROP VIEW` 之前，应该确保不再需要该视图，或者备份视图的定义以便以后需要重新创建。

删除视图不会被原始表有影响。

```
mysql> DROP VIEW IF EXISTS emp_view;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from emp_view;
ERROR 1146 (42S02): Table 'mysql_learn.emp_view' doesn't exist
mysql> select * from employees;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   28 | IT         | 88888.00 |
|           2 | 小叶       | 爱开源    |   27 | SALE       |  9999.00 |
+-------------+------------+-----------+------+------------+----------+
2 rows in set (0.00 sec)
```

# 小结

MySQL视图（View）是一种虚拟表，它是由一个或多个查询语句所定义的结果集合。

视图本身不包含数据，而是根据定义视图的查询语句在运行时动态生成结果。

主要特点包括：

1. **简化查询：** 视图可以将复杂的查询逻辑封装在其中，使得对数据的查询操作变得简洁易读。
  
2. **数据安全性：** 可以通过视图限制用户对特定列的访问权限，从而提高数据的安全性。
  
3. **重用性：** 视图可以被多个查询重复使用，提高了代码的重用性和可维护性。
  
4. **数据独立性：** 视图使得应用程序与数据结构之间的耦合度降低，当基础表结构变化时，只需调整视图而不需修改应用程序。

5. **更新限制：** 视图的更新操作受到一定的限制，特别是对于多表视图或包含特定操作的视图，更新操作可能会受到限制。

6. **性能问题：** 视图的查询性能可能不如直接查询表，特别是当视图的定义包含了复杂的查询逻辑时，可能会影响性能。

MySQL视图是一个强大的工具，可以用于简化复杂查询、增强数据安全性，并提高代码的重用性，但在使用时需要注意更新操作的限制以及可能的性能问题。

活学活用，**每一种技术都有适合他的场景**。

# 参考资料

https://www.tutorialspoint.com/mysql/mysql_create_view.htm

* any list
{:toc}
---
layout: post
title: mysql Tutorial-10-update 语句
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)




# 表准备

假设有一个名为 `employees` 的表，其中包含以下列：`employee_id`, `first_name`, `last_name`, `department`, `salary`。

```sql
create database mysql_learn;
use mysql_learn;

CREATE TABLE "employees" (
  "employee_id" int(11) NOT NULL AUTO_INCREMENT,
  "first_name" varchar(32) DEFAULT NULL,
  "last_name" varchar(32) DEFAULT NULL,
  "age" int(11) DEFAULT NULL,
  "department" varchar(32) DEFAULT NULL,
  "salary" decimal(10,2) DEFAULT NULL,
  PRIMARY KEY ("employee_id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='员工信息表';

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

# mysql update 

## 说明

MySQL 的 UPDATE 语句用于修改数据库表中已有的记录。它允许您更新表中的现有数据，可以根据指定的条件选择要更新的行。

以下是 UPDATE 语句的详细介绍：

## 基本语法结构

```sql
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
```

- `UPDATE`: 关键字，表示开始一个更新操作。

- `table_name`: 要更新的目标表名。

- `SET column1 = value1, column2 = value2, ...`: 指定要更新的列及其新值。列名与新值之间使用等号（=）分隔，多个列之间使用逗号（,）分隔。

- `WHERE condition`: 指定更新操作的条件。只有满足条件的行才会被更新。如果省略 WHERE 子句，则将更新表中的所有记录。

## 示例

假设有一个名为 `employees` 的表，其中包含以下列：`employee_id`, `first_name`, `last_name`, `department`, `salary`。

### 1. **更新单个列的数据**：

```sql
UPDATE employees SET salary = 99999 WHERE employee_id = 1;
```

这条语句将 employee_id 为 1 的员工的薪水更新为 99999

测试效果如下：

```
mysql> UPDATE employees SET salary = 99999 WHERE employee_id = 1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> select * from employees;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 99999.00 |
|           2 | 小叶       | 爱开源    |   27 | SALE       |  9999.00 |
+-------------+------------+-----------+------+------------+----------+
2 rows in set (0.00 sec)
```

### 2. **同时更新多个列的数据**：

```sql
UPDATE employees SET salary = 88888, department = 'SALE' WHERE employee_id = 2;
```

这条语句将 employee_id 为 2 的员工的薪水更新为 88888，并将其部门更新为 'SALE'。

效果：

```
mysql> UPDATE employees SET salary = 88888, department = 'SALE' WHERE employee_id = 2;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> select * from employees;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 99999.00 |
|           2 | 小叶       | 爱开源    |   27 | SALE       | 88888.00 |
+-------------+------------+-----------+------+------------+----------+
2 rows in set (0.00 sec)
```

### 3. **更新满足条件的多行数据**：

```sql
UPDATE employees SET salary = salary * 1.1 WHERE department = 'IT';
```

这条语句将部门为 'IT' 的所有员工的薪水增加 10%。

效果：

```
mysql> UPDATE employees SET salary = salary * 1.1 WHERE department = 'IT';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> select * from employees;
+-------------+------------+-----------+------+------------+-----------+
| employee_id | first_name | last_name | age  | department | salary    |
+-------------+------------+-----------+------+------------+-----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 109998.90 |
|           2 | 小叶       | 爱开源    |   27 | SALE       |  88888.00 |
+-------------+------------+-----------+------+------------+-----------+
2 rows in set (0.00 sec)
```

### 4. **更新所有行的数据**：

```sql
UPDATE employees SET department = 'HR';
```

这条语句将所有员工的部门都更新为 'HR'。

请注意，如果没有指定 WHERE 子句，则将更新表中的所有记录。

效果：

```
mysql> UPDATE employees SET department = 'HR';
Query OK, 2 rows affected (0.00 sec)
Rows matched: 2  Changed: 2  Warnings: 0

mysql> select * from employees;
+-------------+------------+-----------+------+------------+-----------+
| employee_id | first_name | last_name | age  | department | salary    |
+-------------+------------+-----------+------+------------+-----------+
|           1 | 老马       | 啸西风    |   29 | HR         | 109998.90 |
|           2 | 小叶       | 爱开源    |   27 | HR         |  88888.00 |
+-------------+------------+-----------+------+------------+-----------+
2 rows in set (0.00 sec)
```
### 注意事项

- 在 UPDATE 语句中，可以根据需要同时更新一个或多个列。

- 如果不使用 WHERE 子句，将更新表中的所有行，这可能导致意外的数据变更，因此要特别小心。

- 在更新操作中应谨慎使用 WHERE 子句，以确保只有符合条件的行被更新。

这些是 UPDATE 语句的基本用法示例，您可以根据具体的需求和业务逻辑进行更复杂的更新操作。

# 参考资料

https://www.tutorialspoint.com/mysql/mysql_update.htm

* any list
{:toc}
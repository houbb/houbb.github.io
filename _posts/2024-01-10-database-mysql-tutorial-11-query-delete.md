---
layout: post
title: mysql Tutorial-10-delete 语句
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

# 详细介绍下 mysql delete 

## 说明

当涉及到 MySQL 数据库中的 DELETE 操作时，我们通常是指从数据库表中删除数据行的操作。

DELETE 语句允许您根据特定的条件删除符合条件的记录。

下面是关于 MySQL 中 DELETE 语句的详细介绍：

## 基本语法结构

```sql
DELETE FROM table_name
WHERE condition;
```

- `DELETE FROM`: DELETE 语句的关键字，表示开始一个删除操作。

- `table_name`: 要删除数据的目标表名。

- `WHERE condition`: 可选项，用于指定删除操作的条件。只有满足条件的行才会被删除。如果省略 WHERE 子句，则将删除表中的所有记录。

## 示例

### 1. **删除单行数据**：

```sql
DELETE FROM employees WHERE employee_id = 2;
```

这条语句将从表中删除 `employee_id` 为 2 的员工记录。

```
mysql> DELETE FROM employees WHERE employee_id = 2;
Query OK, 1 row affected (0.00 sec)

mysql> select * from  employees;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 88888.00 |
+-------------+------------+-----------+------+------------+----------+
1 row in set (0.00 sec)
```

2. **删除满足条件的多行数据**：

```sql
DELETE FROM employees WHERE department = 'IT';
```

这条语句将删除部门为 'IT' 的所有员工记录。

测试效果

```
mysql> DELETE FROM employees WHERE department = 'IT';
Query OK, 1 row affected (0.00 sec)

mysql> select * from  employees;
Empty set (0.00 sec)
```

3. **删除所有行的数据**：

上面数据删除完了，我们再次初始化数据：

```sql
insert into employees(first_name, last_name, age, department, salary) values ('老马', '啸西风', 29, 'IT', 88888);
insert into employees(first_name, last_name, age, department, salary) values ('小叶', '爱开源', 27, 'SALE', 9999);
```

清空所有数据

```sql
mysql> DELETE FROM employees;
Query OK, 2 rows affected (0.00 sec)

mysql> select * from  employees;
Empty set (0.00 sec)
```

这条语句将删除表中的所有员工记录。

请注意，如果没有指定 WHERE 子句，则将删除表中的所有记录。

### 注意事项

- 在使用 DELETE 语句时，务必小心谨慎，确保理解删除操作的影响。

- 如果没有指定 WHERE 子句，DELETE 将删除表中的所有行，这可能导致不可挽回的数据丢失，所以务必谨慎操作。

- 在删除操作中应该特别注意 WHERE 子句的条件，确保只删除符合条件的行。

这些是 DELETE 语句的基本用法示例，根据具体的业务需求和条件，您可以灵活地调整和扩展这些示例。

# 参考资料

https://www.tutorialspoint.com/mysql/mysql_update.htm

* any list
{:toc}
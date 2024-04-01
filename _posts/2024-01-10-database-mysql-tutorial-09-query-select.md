---
layout: post
title: mysql Tutorial-08-select 语句
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# mysql select 

MySQL 的 SELECT 语句用于从数据库中检索数据。

它是 MySQL 中最常用的语句之一，用于从一个或多个表中选择数据行。

下面是一个详细的介绍：

## 基本语法结构

```sql
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

- `SELECT`: 关键字，表示开始一个查询操作。

- `column1, column2, ...`: 指定要检索的列。可以是单个列名，也可以是多个列名，用逗号分隔。如果要选择所有列，则可以使用 `*` 代替列名。

- `FROM table_name`: 指定要检索数据的表名。如果从多个表中检索数据，则在 `FROM` 子句中指定这些表，并使用适当的条件进行连接。

- `WHERE condition`: 可选项，用于指定检索数据时的筛选条件。只有满足条件的行才会被检索。

## 示例

### 表准备

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

## 常见用法

### 1. **选择所有列的数据**：
   
```sql
SELECT * FROM employees;
```

效果：

```
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 88888.00 |
|           2 | 小叶       | 爱开源    |   27 | SALE       |  9999.00 |
+-------------+------------+-----------+------+------------+----------+
2 rows in set (0.00 sec)
```

### 2. **选择特定列的数据**：

```sql
SELECT first_name, last_name, salary FROM employees;
```

如下：

```
mysql> SELECT first_name, last_name, salary FROM employees;
+------------+-----------+----------+
| first_name | last_name | salary   |
+------------+-----------+----------+
| 老马       | 啸西风    | 88888.00 |
| 小叶       | 爱开源    |  9999.00 |
+------------+-----------+----------+
2 rows in set (0.00 sec)
```

### 3. **选择满足特定条件的数据**：

```sql
SELECT * FROM employees WHERE department = 'IT';
```

如下：

```
mysql> SELECT * FROM employees WHERE department = 'IT';
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 88888.00 |
+-------------+------------+-----------+------+------------+----------+
1 row in set (0.00 sec)
```

### 4. **选择满足多个条件的数据**：

```sql
SELECT * FROM employees WHERE department = 'IT' AND salary > 5000;
```

如下：

```
mysql> SELECT * FROM employees WHERE department = 'IT' AND salary > 5000;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 88888.00 |
+-------------+------------+-----------+------+------------+----------+
1 row in set (0.00 sec)
```

### 5. **使用聚合函数**：

```sql
SELECT AVG(salary) AS average_salary FROM employees;
```

AVG 可以计算平均数。

```
mysql> SELECT AVG(salary) AS average_salary FROM employees;
+----------------+
| average_salary |
+----------------+
|   49443.500000 |
+----------------+
1 row in set (0.00 sec)
```

### 6. **对结果进行排序**：

```sql
SELECT * FROM employees ORDER BY salary DESC;
```

如下：

```
mysql> SELECT * FROM employees ORDER BY salary DESC;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 88888.00 |
|           2 | 小叶       | 爱开源    |   27 | SALE       |  9999.00 |
+-------------+------------+-----------+------+------------+----------+
2 rows in set (0.00 sec)
```

### 7. **使用 LIMIT 限制返回的行数**：

```sql
SELECT * FROM employees LIMIT 10;
```

如下：

```
mysql> SELECT * FROM employees LIMIT 10;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 88888.00 |
|           2 | 小叶       | 爱开源    |   27 | SALE       |  9999.00 |
+-------------+------------+-----------+------+------------+----------+
2 rows in set (0.00 sec)
```

### 8. **使用 JOIN 连接多个表**：

```sql
SELECT employees.first_name, department.name
FROM employees
INNER JOIN department ON employees.department = department.name;
```

效果：

```
+------------+------+
| first_name | name |
+------------+------+
| 老马       | IT   |
| 小叶       | SALE |
+------------+------+
2 rows in set (0.00 sec)
```


# 参考资料

https://www.tutorialspoint.com/mysql/mysql_select.htm

* any list
{:toc}
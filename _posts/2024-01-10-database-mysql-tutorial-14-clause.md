---
layout: post
title: mysql Tutorial-14-clause 常用的语句介绍
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



# 详细介绍下 mysql clause 语句

在 MySQL 中，CLAUSE 通常指的是 SQL 查询语句中的关键字，这些关键字用于对数据进行筛选、排序、分组和限制等操作，从而实现对数据库的数据进行灵活处理。

常见的 CLAUSE 包括 WHERE、ORDER BY、GROUP BY、HAVING、LIMIT 等。

以下是对 MySQL 中常见 CLAUSE 的详细介绍：


## 语句

### 1. WHERE Clause（WHERE 条件语句）：

- 用于在查询中指定条件，过滤出满足条件的数据行。
- 可以使用比较运算符（如=、<>、<、>等）、逻辑运算符（如AND、OR、NOT等）和通配符（如LIKE、IN等）来构建条件。
- 示例：`SELECT * FROM table_name WHERE column_name = 'value';`

### 2. ORDER BY Clause（排序语句）：

- 用于对查询结果进行排序，可以按照一个或多个列的值进行升序或降序排列。
- 可以使用 ASC（升序，默认）和 DESC（降序）关键字来指定排序顺序。
- 示例：`SELECT * FROM table_name ORDER BY column_name ASC;`

### 3. GROUP BY Clause（分组语句）：

- 用于将查询结果按照一个或多个列的值进行分组，通常与聚合函数一起使用。
- 示例：`SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name;`

### 4. HAVING Clause（分组条件语句）：

- 用于在 GROUP BY 分组后对分组进行筛选，类似于 WHERE 对查询结果进行筛选。
- 示例：`SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name HAVING COUNT(*) > 1;`

### 5. LIMIT Clause（限制语句）：

- 用于限制查询返回的结果集的行数。
- 可以使用 OFFSET 子句指定起始位置。
- 示例：`SELECT * FROM table_name LIMIT 10;`（返回前 10 行数据）

### 6. OFFSET Clause（偏移语句）：

- 用于在 LIMIT 子句中指定起始位置。
- 示例：`SELECT * FROM table_name LIMIT 10 OFFSET 20;`（从第 21 行开始返回 10 行数据）

### 7. DISTINCT Clause（去重语句）：

- 用于返回唯一不同的值，从查询结果中删除重复的行。
- 示例：`SELECT DISTINCT column_name FROM table_name;`

### 8. JOIN Clause（连接语句）：

- 用于将两个或多个表中的数据关联起来，以便在一个查询中检索相关联的数据。
- 可以使用 INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL JOIN 等不同类型的连接。
- 示例：`SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.id;`

### 9. UNION Clause（合并语句）：

- 用于合并两个或多个 SELECT 语句的结果集，返回一个包含所有 SELECT 语句返回的行的结果集。
- 可以使用 UNION、UNION ALL 来执行不同的合并操作。
- 示例：`SELECT column_name FROM table1 UNION SELECT column_name FROM table2;`

这些 CLAUSE 可以组合使用，以构建复杂的查询，满足各种不同的数据处理需求。

# where 语句

在MySQL中，`WHERE`语句用于在查询中指定条件，它允许你根据特定的条件来过滤出满足条件的数据行。

`WHERE`子句通常跟随在`SELECT`、`UPDATE`、`DELETE`等语句之后，用于限制返回的数据集。

### 1. 基本语法：

```sql
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

- `SELECT`语句用于选择要返回的列。
- `FROM`子句用于指定要查询的表。
- `WHERE`子句用于指定条件，以过滤数据行。

### 2. 条件表达式：

条件表达式可以使用比较运算符、逻辑运算符、通配符等来构建。常见的条件表达式包括：
- 使用比较运算符（`=`、`<>`、`<`、`>`、`<=`、`>=`）来比较值。
- 使用逻辑运算符（`AND`、`OR`、`NOT`）来组合多个条件。
- 使用通配符（`LIKE`、`IN`、`BETWEEN`）来匹配模式或范围。

### 3. 示例：
以下是一些`WHERE`语句的示例：

- 查询名为`customers`的表中姓为"Smith"的顾客：
  ```sql
  SELECT * FROM customers WHERE last_name = 'Smith';
  ```

- 查询年龄大于等于18岁的顾客：
  ```sql
  SELECT * FROM customers WHERE age >= 18;
  ```

- 查询姓为"Smith"且年龄大于等于18岁的顾客：
  ```sql
  SELECT * FROM customers WHERE last_name = 'Smith' AND age >= 18;
  ```

- 查询姓为"Smith"或"Johnson"的顾客：
  ```sql
  SELECT * FROM customers WHERE last_name = 'Smith' OR last_name = 'Johnson';
  ```

- 查询名字以"A"开头的顾客：
  ```sql
  SELECT * FROM customers WHERE first_name LIKE 'A%';
  ```

### 4. 复合条件：

你可以使用括号来组合复杂的条件表达式，以便更好地控制条件的逻辑。

例如：

```sql
SELECT * FROM customers WHERE (last_name = 'Smith' OR last_name = 'Johnson') AND age >= 18;
```

### 5. NULL 值处理：
`WHERE`子句还可以用于过滤包含或不包含`NULL`值的行。例如：
```sql
SELECT * FROM customers WHERE email IS NOT NULL;
```

# ORDER BY 语句

在 MySQL 中，`ORDER BY` 子句用于对查询结果进行排序，可以按照一个或多个列的值进行升序（默认）或降序排列。

`ORDER BY` 子句通常跟随在 `SELECT` 查询语句的末尾。

下面是对 MySQL 中 `ORDER BY` 子句的详细介绍：

### 1. 基本语法：

```sql
SELECT column1, column2, ...
FROM table_name
ORDER BY column1 [ASC | DESC], column2 [ASC | DESC], ...;
```

- `SELECT` 语句用于选择要返回的列。

- `FROM` 子句用于指定要查询的表。

- `ORDER BY` 子句用于指定排序的列，并可以指定排序的顺序（默认为升序）。

### 2. 排序顺序：

- 默认情况下，`ORDER BY` 子句按照指定列的升序（从小到大）进行排序。

- 你可以使用 `ASC` 关键字显式指定升序，或使用 `DESC` 关键字指定降序（从大到小）。

### 3. 示例：

以下是一些 `ORDER BY` 子句的示例：

- 按照员工的工资升序排序：

  ```sql
  SELECT * FROM employees ORDER BY salary;
  ```

- 按照员工的工资降序排序：

  ```sql
  SELECT * FROM employees ORDER BY salary DESC;
  ```

- 按照员工的部门 ID 升序、工资降序排序：

  ```sql
  SELECT * FROM employees ORDER BY department_id ASC, salary DESC;
  ```

### 4. 多列排序：

如果指定了多个列进行排序，MySQL 首先按照第一个列进行排序，如果有相同的值，则按照第二个列进行排序，以此类推。

### 5. 排序表达式：

`ORDER BY` 子句可以使用表达式来指定排序条件，而不仅仅是列名。例如，你可以使用函数、计算表达式等作为排序条件。

### 6. 注意事项：

- 如果不指定排序顺序，默认情况下按照升序进行排序。

- 对于文本列的排序，默认情况下是按照字母顺序进行排序。

- `ORDER BY` 子句通常位于查询语句的最后，但在使用 `LIMIT` 子句时，`ORDER BY` 子句必须位于 `LIMIT` 子句之前。

#  GROUP BY + HAVING 语句

在 MySQL 中，`GROUP BY` 和 `HAVING` 语句通常一起使用，用于对查询结果进行分组和过滤。

它们允许你在对数据进行分组之后，对分组结果进行筛选和过滤，以便得到满足特定条件的分组数据。以下是对这两个语句的详细介绍：

### 1. GROUP BY 语句：

`GROUP BY` 语句用于将查询结果按照一个或多个列的值进行分组，从而可以对分组后的数据进行聚合计算。

`GROUP BY` 通常和聚合函数（如 SUM、COUNT、AVG 等）一起使用，以便对每个分组的数据进行统计分析。

#### 基本语法：

```sql
SELECT column1, aggregate_function(column2), ...
FROM table_name
GROUP BY column1, column2, ...;
```

- `SELECT` 语句用于选择要返回的列，通常包含被分组的列和聚合函数。

- `FROM` 子句用于指定要查询的表。

- `GROUP BY` 子句用于指定要分组的列，可以是一个或多个列。

#### 示例：

以下是一个示例，将员工表按照部门 ID 进行分组，并计算每个部门的员工人数：

```sql
SELECT department_id, COUNT(*) AS num_employees
FROM employees
GROUP BY department_id;
```

### 2. HAVING 语句：

`HAVING` 语句用于在 `GROUP BY` 子句之后对分组结果进行过滤，可以根据特定的条件筛选出满足条件的分组数据。

与 `WHERE` 子句类似，但 `HAVING` 子句用于过滤分组，而不是过滤行。

#### 基本语法：

```sql
SELECT column1, aggregate_function(column2), ...
FROM table_name
GROUP BY column1, column2, ...
HAVING condition;
```

- `HAVING` 子句用于指定要应用于分组结果的条件，可以包含聚合函数和普通列。

#### 示例：

以下示例使用 `HAVING` 子句筛选出员工数量大于等于 5 的部门：

```sql
SELECT department_id, COUNT(*) AS num_employees
FROM employees
GROUP BY department_id
HAVING COUNT(*) >= 5;
```

### 3. 注意事项：

- `GROUP BY` 子句必须出现在 `SELECT` 语句的 `FROM` 子句之后，`HAVING` 子句必须出现在 `GROUP BY` 子句之后。

- `HAVING` 子句不能单独使用，必须与 `GROUP BY` 子句一起使用。

### 4. 区别：

- `WHERE` 子句用于过滤行数据，而 `HAVING` 子句用于过滤分组数据。

- `WHERE` 子句在数据分组之前进行过滤，而 `HAVING` 子句在数据分组之后进行过滤。

# LIMIT + OFFSET 语句

在 MySQL 中，`LIMIT` 和 `OFFSET` 语句通常一起使用，用于限制查询结果返回的行数，并可以指定返回结果的起始位置。

这两个语句通常用于分页查询，以便在大量数据中返回较小的结果集。

### 1. LIMIT 语句：

`LIMIT` 语句用于限制查询返回的结果行数。

#### 基本语法：

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT number_of_rows;
```

- `SELECT` 语句用于选择要返回的列。

- `FROM` 子句用于指定要查询的表。

- `LIMIT` 子句用于指定要返回的结果行数。

#### 示例：

以下示例返回 `employees` 表中的前 10 条记录：

```sql
SELECT * FROM employees LIMIT 10;
```

### 2. OFFSET 语句：

`OFFSET` 语句用于指定返回结果的起始位置，通常与 `LIMIT` 一起使用，以实现分页查询功能。

#### 基本语法：

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT number_of_rows OFFSET offset_value;
```

- `OFFSET` 子句用于指定返回结果的起始位置，即跳过前面的几行数据。

- `offset_value` 是要跳过的行数。

#### 示例：

以下示例返回 `employees` 表中的第 11 条记录开始的后 10 条记录：
```sql
SELECT * FROM employees LIMIT 10 OFFSET 10;
```

### 3. 注意事项：

- `LIMIT` 和 `OFFSET` 子句通常用于分页查询，以便在大数据集中返回较小的结果集。

- `LIMIT` 和 `OFFSET` 子句必须按照指定的顺序出现在 `SELECT` 语句的最后。

### 4. 使用场景：

- 分页查询：在 Web 应用程序中，将大量数据分页显示给用户时，常常使用 `LIMIT` 和 `OFFSET` 子句来实现分页功能。

- 测试和调试：在开发和调试过程中，限制返回的结果集可以提高查询效率和减少等待时间。


# DISTINCT 语句

在 MySQL 中，`DISTINCT` 语句用于返回唯一不同的值，从查询结果中删除重复的行。

它通常用于查询中以确保返回的结果集中不包含重复的数据行。

以下是对 MySQL 中 `DISTINCT` 语句的详细介绍：

### 1. 基本语法：

```sql
SELECT DISTINCT column1, column2, ...
FROM table_name;
```

- `SELECT` 语句用于选择要返回的列。

- `DISTINCT` 关键字用于标识要返回唯一值的列。

- `FROM` 子句用于指定要查询的表。

### 2. 示例：

以下是一个示例，返回 `employees` 表中所有不重复的部门 ID：

```sql
SELECT DISTINCT department_id FROM employees;
```

### 3. 注意事项：

- `DISTINCT` 关键字应用于查询的列，它将删除重复的行，只返回唯一不同的值。

- 如果指定多列进行 `DISTINCT` 查询，则 MySQL 将根据所有指定列的值进行去重。

- `DISTINCT` 查询通常会增加查询的性能开销，特别是在查询结果集中包含大量重复值时。

### 4. 使用场景：

- 数据去重：当需要从查询结果中去除重复行时，可以使用 `DISTINCT` 语句。

- 统计唯一值：在需要对某一列中的唯一值进行统计分析时，可以使用 `DISTINCT` 语句来获取不同的值。


* any list
{:toc}
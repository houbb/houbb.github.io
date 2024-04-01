---
layout: post
title: mysql Tutorial-16-join&union join 
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# mysql join 和 union 

当需要从多个表中检索数据时，`JOIN` 和 `UNION` 是 MySQL 中常用的两种方式。

### 1. JOIN：

`JOIN` 是用于在查询中连接两个或多个表的操作，以便检索相关联的数据。MySQL 支持多种类型的 JOIN，常见的有：

- INNER JOIN：返回两个表中匹配的行。

- LEFT JOIN：返回左表中的所有行，以及右表中与左表中匹配的行。

- RIGHT JOIN：返回右表中的所有行，以及左表中与右表中匹配的行。

- FULL JOIN：返回左表和右表中的所有行，如果某个表中没有匹配的行，则返回 NULL 值。

#### 示例：
```sql
SELECT * FROM table1 INNER JOIN table2 ON table1.column = table2.column;
```

### 2. UNION：

`UNION` 用于合并两个或多个 SELECT 语句的结果集，返回一个包含所有 SELECT 语句结果的单一结果集。要求每个 SELECT 语句返回的列数和数据类型必须一致。

#### 示例：
```sql
SELECT column1 FROM table1
UNION
SELECT column1 FROM table2;
```

### 注意事项：

- 使用 `JOIN` 可以在查询中连接多个表，从而检索相关联的数据。

- 使用 `UNION` 可以合并多个 SELECT 语句的结果集，返回一个单一的结果集。

- 在使用 `JOIN` 时，应确保连接条件准确，避免返回不正确的结果。

- 在使用 `UNION` 时，应注意 SELECT 语句返回的列数和数据类型必须一致。

综上所述，`JOIN` 和 `UNION` 是 MySQL 中常用的两种操作，用于从多个表中检索数据或合并多个查询结果集。通过合理使用这两种操作，可以实现复杂的数据检索和处理需求。

# mysql 的 union

在 MySQL 中，UNION 是一种用于合并多个 SELECT 语句的结果集的操作符。

它可以将多个查询的结果集合并成一个结果集，并去除重复的行。

UNION 操作符要求每个 SELECT 语句返回的列数和数据类型必须相同。

以下是 UNION 操作符的一般语法：

```sql
SELECT column1, column2, ...
FROM table1
WHERE condition1
UNION [ALL | DISTINCT]
SELECT column1, column2, ...
FROM table2
WHERE condition2
[ORDER BY column1, column2, ...];
```

在这个语法中：

- `UNION` 操作符用于合并两个或多个 SELECT 语句的结果集。
- `ALL` 关键字表示合并所有行，包括重复的行。如果不指定，默认为 `DISTINCT`，表示去除重复的行。
- `DISTINCT` 关键字表示去除合并结果中的重复行。
- 每个 SELECT 语句返回的列数和数据类型必须一致。
- 可以在最后一个 SELECT 语句之后使用 `ORDER BY` 对合并结果进行排序。

### 示例：

假设我们有两个表 `students` 和 `teachers`，它们的结构如下：

**students 表：**

| id | name     |
|----|----------|
| 1  | Alice    |
| 2  | Bob      |
| 3  | Charlie  |

**teachers 表：**

| id | name     |
|----|----------|
| 1  | TeacherA |
| 2  | TeacherB |
| 3  | TeacherC |

现在我们使用 UNION 来合并这两个表的结果：

```sql
SELECT id, name FROM students
UNION
SELECT id, name FROM teachers;
```

执行上述查询将返回以下结果：

| id | name     |
|----|----------|
| 1  | Alice    |
| 2  | Bob      |
| 3  | Charlie  |
| 1  | TeacherA |
| 2  | TeacherB |
| 3  | TeacherC |

这里，合并结果中包含了两个表中的所有行，并去除了重复的行。

如果想要保留重复的行，可以使用 `UNION ALL`。

# mysql 的各种 join 

在 MySQL 中，JOIN 是用于在查询中连接两个或多个表的操作，以便检索相关联的数据。

MySQL 支持多种类型的 JOIN，每种 JOIN 都有不同的用途和效果。

假设我们有两个表 `students` 和 `courses`，它们的结构如下：

**students 表：**

| student_id | name     |
|------------|----------|
| 1          | Alice    |
| 2          | Bob      |
| 3          | Charlie  |

**courses 表：**

| course_id | course_name |
|-----------|-------------|
| 101       | Math        |
| 102       | English     |
| 103       | Science     |

现在我们将使用这些表来说明不同类型的 JOIN。

## 1. INNER JOIN：

INNER JOIN 返回两个表中匹配的行。

```sql
SELECT students.name, courses.course_name
FROM students
INNER JOIN courses ON students.student_id = courses.course_id;
```

**结果：**

| name    | course_name |
|---------|-------------|
| Alice   | Math        |
| Bob     | English     |
| Charlie | Science     |

**图示：**

```
students       courses
+------------+   +-------------+
| student_id |   | course_id   |
| name       |   | course_name |
+------------+   +-------------+
    |                |
    |----------------| 
           |
           V
   INNER JOIN Result
+------------+-------------+
| name       | course_name |
+------------+-------------+
| Alice      | Math        |
| Bob        | English     |
| Charlie    | Science     |
+------------+-------------+
```

## 2. LEFT JOIN：

LEFT JOIN 返回左表中的所有行，以及右表中与左表中匹配的行。

如果右表中没有匹配的行，则返回 NULL 值。

```sql
SELECT students.name, courses.course_name
FROM students
LEFT JOIN courses ON students.student_id = courses.course_id;
```

**结果：**

| name    | course_name |
|---------|-------------|
| Alice   | Math        |
| Bob     | English     |
| Charlie | Science     |
| NULL    | NULL        |   <-- 由于 courses 表中没有 student_id 为 3 的记录，所以返回 NULL 值

**图示：**

```
students       courses
+------------+   +-------------+
| student_id |   | course_id   |
| name       |   | course_name |
+------------+   +-------------+
    |                |
    |----------------| 
           |
           V
    LEFT JOIN Result
+------------+-------------+
| name       | course_name |
+------------+-------------+
| Alice      | Math        |
| Bob        | English     |
| Charlie    | Science     |
| NULL       | NULL        |
+------------+-------------+
```

## 3. RIGHT JOIN：

RIGHT JOIN 返回右表中的所有行，以及左表中与右表中匹配的行。如果左表中没有匹配的行，则返回 NULL 值。

```sql
SELECT students.name, courses.course_name
FROM students
RIGHT JOIN courses ON students.student_id = courses.course_id;
```

**结果：**

| name    | course_name |
|---------|-------------|
| Alice   | Math        |
| Bob     | English     |
| NULL    | NULL        |  <-- 由于 students 表中没有 course_id 为 103 的记录，所以返回 NULL 值
| NULL    | Science     |  <-- 由于 students 表中没有 course_id 为 103 的记录，所以返回 NULL 值

**图示：**

```
students       courses
+------------+   +-------------+
| student_id |   | course_id   |
| name       |   | course_name |
+------------+   +-------------+
    |                |
    |----------------| 
           |
           V
   RIGHT JOIN Result
+------------+-------------+
| name       | course_name |
+------------+-------------+
| Alice      | Math        |
| Bob        | English     |
| NULL       | NULL        |
| NULL       | Science     |
+------------+-------------+
```

## 4. FULL JOIN：

FULL JOIN 返回左表和右表中的所有行，如果某个表中没有匹配的行，则返回 NULL 值。

```sql
SELECT students.name, courses.course_name
FROM students
FULL JOIN courses ON students.student_id = courses.course_id;
```

**结果：**

| name    | course_name |
|---------|-------------|
| Alice   | Math        |
| Bob     | English     |
| Charlie | Science     |
| NULL    | NULL        |  <-- 由于 courses 表中没有 student_id 为 3 的记录，所以返回 NULL 值

**图示：**

```
students       courses
+------------+   +-------------+
| student_id |   | course_id   |
| name       |   | course_name |
+------------+   +-------------+
    |                |
    |----------------| 
           |
           V
   FULL JOIN Result
+------------+-------------+
| name       | course_name |
+------------+-------------+
| Alice      | Math        |
| Bob        | English     |
| Charlie    | Science     |
| NULL       | NULL        |
+------------+-------------+
```

以上是几种常见的 JOIN 类型在 MySQL 中的示例和图示，希望能帮助您更好地理解各种 JOIN 的含义和用法。

## 5. cross join

CROSS JOIN 是一种特殊的 JOIN 类型，它返回左表的每一行与右表的每一行的组合，也就是返回两个表的笛卡尔积。

在使用 CROSS JOIN 时，不需要指定任何连接条件，因为它会返回左表的每一行与右表的所有行的组合。

以下是一个具体的示例：

假设我们有两个表 `students` 和 `courses`，它们的结构如下：

**students 表：**

| student_id | name     |
|------------|----------|
| 1          | Alice    |
| 2          | Bob      |
| 3          | Charlie  |

**courses 表：**

| course_id | course_name |
|-----------|-------------|
| 101       | Math        |
| 102       | English     |
| 103       | Science     |

现在我们使用 CROSS JOIN 来获取所有学生与所有课程的组合：

```sql
SELECT students.name, courses.course_name
FROM students
CROSS JOIN courses;
```

执行上述查询将返回以下结果：

| name    | course_name |
|---------|-------------|
| Alice   | Math        |
| Alice   | English     |
| Alice   | Science     |
| Bob     | Math        |
| Bob     | English     |
| Bob     | Science     |
| Charlie | Math        |
| Charlie | English     |
| Charlie | Science     |

这里，每个学生都与每门课程进行了组合，共计 3 个学生 × 3 门课程 = 9 条记录，这就是 CROSS JOIN 的结果。


# 对比一下 union 和 join

在 MySQL 中，UNION 和 JOIN 是两种不同的操作，它们用于合并不同的查询结果集，但是它们的使用场景和效果有所不同。

### 1. UNION：

- UNION 用于合并多个 SELECT 语句的结果集，并去除重复的行。

- UNION 合并的查询结果必须具有相同的列数和数据类型。

- UNION 通常用于合并不同表中相似的数据，或者对同一表进行不同条件的查询。

- UNION 不能用于在结果集中建立表之间的关系，只是简单地将结果合并起来。

**示例：**

```sql
SELECT column1 FROM table1
UNION
SELECT column2 FROM table2;
```

### 2. JOIN：

- JOIN 用于在查询中连接两个或多个表，以便检索相关联的数据。

- JOIN 通过指定连接条件将表之间的关系建立起来，可以根据连接条件返回满足条件的结果集。

- JOIN 可以根据连接条件返回符合特定关联条件的数据，这种关系通常体现在返回结果中。

**示例：**
```sql
SELECT * FROM table1
INNER JOIN table2 ON table1.column = table2.column;
```

### 对比：

- UNION 用于合并不同查询的结果集，而 JOIN 用于在查询中连接多个表。

- UNION 主要用于合并数据，而 JOIN 主要用于建立表之间的关系。

- UNION 合并的结果集不一定有关系，而 JOIN 的结果集通常反映了表之间的关联关系。

- UNION 会去除重复的行，而 JOIN 不会自动去除重复的行，除非使用 DISTINCT 关键字。


综上所述，UNION 和 JOIN 是两种不同的操作，它们各自有不同的用途和效果。

UNION 用于合并多个查询的结果集，而 JOIN 用于在查询中连接多个表，并建立表之间的关系。

在实际应用中，根据具体的需求和数据结构选择合适的操作来实现所需的功能。

* any list
{:toc}
---
layout: post
title: mysql Tutorial-08-insert 语句
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# mysql 的 insert 介绍

在 MySQL 中，`INSERT` 语句用于向表中插入新的行或记录。

通过 `INSERT` 语句，你可以将数据添加到表中的一个或多个列中。

## 基本用法

下面是 `INSERT` 语句的基本语法：

```sql
INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);
```

- `table_name`：要插入数据的表名。
- `(column1, column2, column3, ...)`：要插入数据的列名，可以省略，如果省略，则假设插入数据的顺序与表定义的列顺序相同。
- `VALUES`：关键字，用于指定要插入的值。
- `(value1, value2, value3, ...)`：要插入到相应列中的值。值的数量和顺序必须与列的数量和顺序相匹配。

### 示例：

employees 这个单词好长，我们建一个短一点的表名字。

```sql
 CREATE TABLE "emp" (
  "id" int(11) NOT NULL AUTO_INCREMENT,
  "name" varchar(100) DEFAULT NULL,
  "age" int(11) DEFAULT NULL,
  "department" varchar(100) DEFAULT NULL,
  "salary" decimal(10,2) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='员工信息表';
```

插入数据：

```sql
mysql> select * from emp;
+----+--------------------------+------+------------+--------+
| id | name                     | age  | department | salary |
+----+--------------------------+------+------------+--------+
|  1 | 老马消息风               |   25 | NULL       |   NULL |
|  2 | 爱开源的小叶同学         |   23 | NULL       |   NULL |
+----+--------------------------+------+------------+--------+
2 rows in set (0.00 sec)
```

作为日常开发而言，insert 可能到这里结束了。

但是 insert 还有很多其他写法，让老马和大家一起看看。

## insert .... select

`INSERT ... SELECT` 是 MySQL 中用于从一个表中选择数据并将其插入到另一个表中的语句。

它的基本语法如下：

```sql
INSERT INTO target_table (column1, column2, ...)
SELECT expression1, expression2, ...
FROM source_table
WHERE condition;
```

- `target_table`：要插入数据的目标表。
- `(column1, column2, ...)`：目标表中要插入数据的列。
- `source_table`：数据源表，从中选择数据。
- `SELECT`：用于选择要插入的数据。
- `expression1, expression2, ...`：用于选择数据的表达式或列。
- `WHERE condition`：可选项，用于指定选择数据的条件。

### 实际测试

我们结合上一节学习的直接建表，然后把年龄大于 24 的同步到新表的。

```sql
create table emp_bak like emp;
insert into emp_bak select * from emp where age > 24;
```

确认结果：

```
mysql> select * from emp_bak;
+----+-----------------+------+------------+--------+
| id | name            | age  | department | salary |
+----+-----------------+------+------------+--------+
|  1 | 老马消息风      |   25 | NULL       |   NULL |
+----+-----------------+------+------------+--------+
1 row in set (0.00 sec)
```

## insert ... set

`INSERT ... SET` 是 MySQL 中用于向表中插入数据的另一种语法形式，它允许你为每个要插入的列指定一个特定的值或表达式。

与 `INSERT ... SELECT` 不同，`INSERT ... SET` 适用于手动指定要插入的值，而不是从另一个表中选择数据。

基本的 `INSERT ... SET` 语法如下所示：

```sql
INSERT INTO table_name
SET column1 = value1, column2 = value2, ...;
```

- `table_name`：要插入数据的目标表名。
- `column1 = value1, column2 = value2, ...`：每个要插入的列以及其对应的值或表达式。

### 实际测试

可以插入一条数据，然后指定每一个字段的属性。

```sql
mysql> INSERT INTO emp
    -> SET name = '老马的朋友', age=22;
Query OK, 1 row affected (0.02 sec)

mysql> select * from emp;
+----+--------------------------+------+------------+--------+
| id | name                     | age  | department | salary |
+----+--------------------------+------+------------+--------+
|  1 | 老马消息风               |   25 | NULL       |   NULL |
|  2 | 爱开源的小叶同学         |   23 | NULL       |   NULL |
|  3 | 老马的朋友               |   22 | NULL       |   NULL |
+----+--------------------------+------+------------+--------+
3 rows in set (0.00 sec)
```

### 为什么要有 set? values 不够吗？

`INSERT ... SET` 和 `INSERT ... VALUES` 是 MySQL 中用于插入数据的两种不同的语法形式，它们都可以用来向表中插入数据。

两者的选择取决于个人偏好、具体的数据需求以及可读性等因素。

主要的区别在于语法的表达方式：

1. **`INSERT ... SET`**：
   - 使用 `SET` 语法时，你可以为每个要插入的列指定特定的值或表达式。
   - 这种语法形式更加灵活，允许你对每个列进行定制化的赋值。
   - 适用于需要为每个列手动指定值的情况。

2. **`INSERT ... VALUES`**：
   - 使用 `VALUES` 语法时，你将一次性为所有列指定一个值组。
   - 这种语法形式更加简洁，适用于所有要插入的列都使用相同值的情况。
   - 适用于需要一次性为所有列指定相同值的情况。

如果每个列的值都是唯一的或需要手动指定的，那么使用 `INSERT ... SET` 更加合适；如果所有列的值都是相同的，那么使用 `INSERT ... VALUES` 更加简洁。


## insert ... ignore

`INSERT ... IGNORE` 是 MySQL 中用于插入数据的一种特殊形式，它与普通的 `INSERT` 语句略有不同。

当使用 `INSERT ... IGNORE` 语句插入数据时，如果插入的数据违反了唯一性约束（比如主键或唯一索引），MySQL 将会忽略这些违反约束的行，而不是报错，从而避免插入失败。

基本语法如下：

```sql
INSERT IGNORE INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
```

或者：

```sql
INSERT IGNORE INTO table_name (column1, column2, ...)
SELECT expression1, expression2, ...
FROM source_table
WHERE condition;
```

- `table_name`：要插入数据的目标表。
- `(column1, column2, ...)`：要插入数据的列。
- `VALUES`：指定要插入的值。
- `SELECT`：从另一个表中选择数据进行插入。
- `IGNORE`：指示 MySQL 忽略违反唯一性约束的行。


### 开发场景

我们有时候经常会写一些判断代码，首先 count 然后再插入。

其实可以用这种来简化。

### 示例：

我们的 id 是主键，所以可以用来测试。

```sql
mysql> insert into emp (id, name, age) values (1, '老马消息风', 25);
ERROR 1062 (23000): Duplicate entry '1' for key 'PRIMARY'
```

我们改一下：

```
mysql> insert ignore into emp (id, name, age) values (1, '老马消息风', 25);
Query OK, 0 rows affected, 1 warning (0.00 sec)
```

看起来不错，那如果我想做一下数据更新怎么办呢?

类似 oracle 中的 mrege，不存在则插入，存在则更新。



## insert ... on Duplicate Key Update

当使用 `INSERT ... ON DUPLICATE KEY UPDATE` 语句插入数据时，如果插入的行违反了唯一键约束，MySQL 将尝试更新已存在的行，而不是引发错误。

如果被插入的行中包含了重复键，MySQL 将执行 `UPDATE` 操作，更新已存在的行的值，而不是插入新的行。

这种方式通常用于在插入数据时更新已存在的行，以保持数据的最新状态。

语法示例：

```sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...)
ON DUPLICATE KEY UPDATE column1 = value1, column2 = value2, ...;
```

### 实际测试


```
mysql> select * from emp;
+----+--------------------------+------+------------+--------+
| id | name                     | age  | department | salary |
+----+--------------------------+------+------------+--------+
|  1 | 老马消息风               |   25 | NULL       |   NULL |
|  2 | 爱开源的小叶同学         |   23 | NULL       |   NULL |
|  3 | 老马的朋友               |   22 | NULL       |   NULL |
+----+--------------------------+------+------------+--------+
```

执行插入：

```sql
mysql> insert into emp (id, name, age) values (4, '江南的燕子', 19)
    -> ON DUPLICATE KEY UPDATE
    -> name = '江南的燕子', age = 19;
Query OK, 1 row affected (0.00 sec)

mysql>
mysql>
mysql> select * from emp;
+----+--------------------------+------+------------+--------+
| id | name                     | age  | department | salary |
+----+--------------------------+------+------------+--------+
|  1 | 老马消息风               |   25 | NULL       |   NULL |
|  2 | 爱开源的小叶同学         |   23 | NULL       |   NULL |
|  3 | 老马的朋友               |   22 | NULL       |   NULL |
|  4 | 江南的燕子               |   19 | NULL       |   NULL |
+----+--------------------------+------+------------+--------+
```

再次执行插入：

```sql
mysql> insert into emp (id, name, age) values (4, '江南的燕子', 19)
    -> ON DUPLICATE KEY UPDATE
    -> name = '江南的燕子', age = 20;
Query OK, 2 rows affected (0.00 sec)

mysql> select * from emp;
+----+--------------------------+------+------------+--------+
| id | name                     | age  | department | salary |
+----+--------------------------+------+------------+--------+
|  1 | 老马消息风               |   25 | NULL       |   NULL |
|  2 | 爱开源的小叶同学         |   23 | NULL       |   NULL |
|  3 | 老马的朋友               |   22 | NULL       |   NULL |
|  4 | 江南的燕子               |   20 | NULL       |   NULL |
+----+--------------------------+------+------------+--------+
4 rows in set (0.00 sec)
```

### 疑问

为什么第二次 insert into ON DUPLICATE KEY UPDATE 时，结果显示 `Query OK, 2 rows affected (0.00 sec)`，2 行数据变化？

但是实际上只有一条记录被修改了才对。

这个问题可以参考一下:

> [Why are 2 rows affected in my `INSERT ... ON DUPLICATE KEY UPDATE`?](why-are-2-rows-affected-in-my-insert-on-duplicate-key-update)

比较高赞的回答是：

```
With ON DUPLICATE KEY UPDATE, the affected-rows value per row is 1 if the row is inserted as a new row and 2 if an existing row is updated.
```

> [官方 doc](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html)

### 思考题

那么问题来了，如何写一个 ON DUPLICATE KEY UPDATE 语句，让最后的结果是 0 rows affected?

-------------------------------

1) 查询

```sql
select * from emp;
```

如下：

```
mysql> select * from emp;
+----+--------------------------+------+------------+--------+
| id | name                     | age  | department | salary |
+----+--------------------------+------+------------+--------+
|  1 | 老马消息风               |   25 | NULL       |   NULL |
|  2 | 爱开源的小叶同学         |   23 | NULL       |   NULL |
|  3 | 老马的朋友               |   22 | NULL       |   NULL |
|  4 | 江南的燕子               |   20 | NULL       |   NULL |
+----+--------------------------+------+------------+--------+
4 rows in set (0.00 sec)
```

2) 执行下面的 insert 

```sql
insert into emp (id, name, age) values (4, '江南的燕子', 19)
ON DUPLICATE KEY UPDATE 
name = '江南的燕子', age = 20;
```

日志：

```
mysql> insert into emp (id, name, age) values (4, '江南的燕子', 19)
    -> ON DUPLICATE KEY UPDATE
    -> name = '江南的燕子', age = 20;
Query OK, 0 rows affected (0.00 sec)
```

可以发现此时就是0，所以理解一些细节也比较重要。

可以用来区分是否有数据变化，是插入，还是更新，

# 参考资料

https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html

https://www.tutorialspoint.com/mysql/mysql_create_table.htm

https://blog.csdn.net/miyatang/article/details/78227344

* any list
{:toc}
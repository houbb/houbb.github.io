---
layout: post
title:  MySQL-11-compare 差异对比实战
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

# 场景

想通过分组，对数据进行对比处理。

这里做一个简单的笔记记录。

# 测试笔记

## 建表

```sql
create database my_test;
use my_test;
```

原始数据表 raw_data，拥有自增主键 id, 事件标识 event_id, 事件来源 event_source, 事件信息 raw_data 创建时间 create_time

其中 id 是唯一索引，event_id+event_source 也是唯一索引。

给出建表语句: 

以下是根据您提供的信息构建的SQL建表语句：

```sql
CREATE TABLE raw_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(255),
    event_source VARCHAR(255),
    raw_data TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, event_source)
);
```

## 数据初始化

```sql
insert into raw_data (event_id, event_source, raw_data) values('e1', 's1', 'raw_data1');
insert into raw_data (event_id, event_source, raw_data) values('e1', 's2', 'raw_data1');
insert into raw_data (event_id, event_source, raw_data) values('e2', 's1', 'raw_data2');
insert into raw_data (event_id, event_source, raw_data) values('e2', 's2', 'raw_data2');
insert into raw_data (event_id, event_source, raw_data) values('e3', 's1', 'raw_data3');
insert into raw_data (event_id, event_source, raw_data) values('e3', 's2', 'raw_data3_differ');
insert into raw_data (event_id, event_source, raw_data) values('e4', 's1', 'raw_data4');
insert into raw_data (event_id, event_source, raw_data) values('e4', 's2', 'raw_data4_differ');
```

数据确认：

```
+----+----------+--------------+------------------+---------------------+
| id | event_id | event_source | raw_data         | create_time         |
+----+----------+--------------+------------------+---------------------+
|  1 | e1       | s1           | raw_data1        | 2024-05-06 09:44:24 |
|  2 | e1       | s2           | raw_data1        | 2024-05-06 09:44:24 |
|  3 | e2       | s1           | raw_data2        | 2024-05-06 09:44:24 |
|  4 | e2       | s2           | raw_data2        | 2024-05-06 09:44:24 |
|  5 | e3       | s1           | raw_data3        | 2024-05-06 09:44:24 |
|  6 | e3       | s2           | raw_data3_differ | 2024-05-06 09:44:25 |
|  7 | e4       | s1           | raw_data4        | 2024-05-06 09:51:39 |
|  8 | e4       | s2           | raw_data4_differ | 2024-05-06 09:51:39 |
+----+----------+--------------+------------------+---------------------+
```

## 找到差异

要求：按照 event_id 分组，找到其中按照 event_id 分组后， raw_data 不同的数据。

返回不同数据对应的的 event_id.

给出查询 sql

### SQL

为了找到按照 `event_id` 分组后，`raw_data` 不同的数据，可以使用 `GROUP BY` 和 `HAVING` 子句结合 `COUNT` 函数来实现。

以下是实现这一要求的 SQL 查询语句：

```sql
SELECT event_id
FROM raw_data
GROUP BY event_id
HAVING COUNT(DISTINCT raw_data) > 1;
```

这条 SQL 语句的逻辑是：

1. `FROM raw_data`：从 `raw_data` 表中选择数据。
2. `GROUP BY event_id`：按照 `event_id` 对结果进行分组。
3. `HAVING COUNT(DISTINCT raw_data) > 1`：使用 `HAVING` 子句过滤掉那些 `raw_data` 有且只有一个不同值的组，只保留有超过一个不同 `raw_data` 值的组。

查询效果：

```
+----------+
| event_id |
+----------+
| e3       |
| e4       |
+----------+
```

## 差异表

创建差异表存储表 compare_differ

拥有自增主键 id, 事件标识 event_id, 事件来源1 event_source_1, 事件来源2 event_source_2, 

事件信息1 raw_data_1, 事件信息2 raw_data_2 创建时间 create_time

### 给出建表语句

要创建一个名为 `compare_differ` 的表，用于存储具有不同 `raw_data` 的 `event_id` 以及它们的相关信息，可以使用以下 SQL 建表语句：

```sql
CREATE TABLE compare_differ (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(255),
    event_source_1 VARCHAR(255),
    event_source_2 VARCHAR(255),
    raw_data_1 TEXT,
    raw_data_2 TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

这个表定义了以下字段：

- `id`：一个自增的主键，用于唯一标识表中的每条记录。
- `event_id`：事件的唯一标识符。
- `event_source_1`：第一个事件来源的名称。
- `event_source_2`：第二个事件来源的名称，用于与 `event_source_1` 中的事件进行比较。
- `raw_data_1`：来自 `event_source_1` 的原始数据文本。
- `raw_data_2`：来自 `event_source_2` 的原始数据文本，用于比较。
- `create_time`：记录被创建的时间戳，默认为当前时间戳。

请注意，这个表结构假设你想要比较两个不同 `event_source` 下的 `raw_data`。如果你的比较逻辑不同，可能需要调整字段以适应你的具体需求。

## 通过刚才查找差异的 sql，把数据的数据插入到差异表中。sql 怎么写？

要将之前通过差异查询找到的数据插入到新创建的 `compare_differ` 表中，可以使用 SQL 的 `INSERT INTO ... SELECT` 语句。

这个语句允许你直接从查询结果中选取数据，并将它们插入到另一个表中。

以下是具体的 SQL 语句：

```sql
INSERT INTO compare_differ (event_id, event_source_1, event_source_2, raw_data_1, raw_data_2)
SELECT 
    rd1.event_id,
    rd1.event_source AS event_source_1,
    rd2.event_source AS event_source_2,
    rd1.raw_data AS raw_data_1,
    rd2.raw_data AS raw_data_2
FROM 
    raw_data rd1
JOIN 
    raw_data rd2 ON rd1.event_id = rd2.event_id
WHERE 
    rd1.event_id IN (
        SELECT event_id
        FROM raw_data
        GROUP BY event_id
        HAVING COUNT(DISTINCT raw_data) > 1
    )
    AND rd1.event_source < rd2.event_source;
```

这个 SQL 语句的逻辑如下：

1. `INSERT INTO compare_differ ...`：指定要插入数据的目标表 `compare_differ` 以及对应的列名。

2. `SELECT ... FROM raw_data rd1 JOIN raw_data rd2 ON rd1.event_id = rd2.event_id`：从 `raw_data` 表中选择数据，通过自连接（`JOIN`）来找到具有相同 `event_id` 但不同 `event_source` 的记录。

3. `WHERE rd1.event_id IN (...)`：使用子查询来限制只选择那些根据之前的差异查询结果，`raw_data` 不同的 `event_id`。

4. `AND rd1.event_source < rd2.event_source`：确保选取的记录中，`event_source` 是按字典顺序排序的，这样每个 `event_id` 组合只会被插入一次，避免了重复。

5. `SELECT ...`：选择要插入的数据字段，包括 `event_id`、两个不同 `event_source` 下的 `event_source` 和 `raw_data`。

请注意，这个 SQL 语句假设 `event_source` 是可以比较的，并且可以用于区分不同的事件来源。如果 `event_source` 包含不能比较的数据类型（如 JSON 或者二进制数据），则需要修改逻辑以适应实际情况。

### 效果

```
mysql> select * from compare_differ;
+----+----------+----------------+----------------+------------+------------------+---------------------+
| id | event_id | event_source_1 | event_source_2 | raw_data_1 | raw_data_2       | create_time         |
+----+----------+----------------+----------------+------------+------------------+---------------------+
|  1 | e3       | s1             | s2             | raw_data3  | raw_data3_differ | 2024-05-06 09:57:56 |
|  2 | e4       | s1             | s2             | raw_data4  | raw_data4_differ | 2024-05-06 09:57:56 |
+----+----------+----------------+----------------+------------+------------------+---------------------+
```

* any list
{:toc}
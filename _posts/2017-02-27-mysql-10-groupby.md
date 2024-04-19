---
layout: post
title:  MySQL-10-group by 分组实战笔记
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

# 场景

想通过分组，进行处理数据。

这里做一个简单的笔记记录。

# 测试笔记

## 建表

```
create database my_test;
use my_test;
```

指定用户表，拥有自增主键 id, 用户名 username, 用户状态 user_status, 用户年龄 age, 用户组 group_id, 创建时间 create_time，给出建表语句 

```sql
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,  -- 用户ID，自动增长的整数类型
    username VARCHAR(255) NOT NULL,  -- 用户名，不允许为空的字符串类型
    user_status ENUM('active', 'inactive', 'pending') NOT NULL,  -- 用户状态，枚举类型
    age INT,  -- 用户年龄，整数类型
    group_id INT,  -- 用户所属组的ID，整数类型
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 创建时间，时间戳类型，默认为当前时间
    PRIMARY KEY (id)  -- 将id字段设置为主键
) ENGINE=InnoDB DEFAULT CHARSET=utf8;  -- 使用InnoDB存储引擎和默认的字符集
```

## 数据初始化

```sql
insert into users (username, user_status, age, group_id) values('U-1', 'active', 10, '001');
insert into users (username, user_status, age, group_id) values('U-2', 'active', 12, '001');
insert into users (username, user_status, age, group_id) values('U-3', 'active', 13, '001');

insert into users (username, user_status, age, group_id) values('U-3', 'active', 13, '002');
insert into users (username, user_status, age, group_id) values('U-4', 'active', 14, '002');
insert into users (username, user_status, age, group_id) values('U-5', 'inactive', 15, '002');
```

数据确认：

```
mysql> select * from users;
+----+----------+-------------+------+----------+---------------------+
| id | username | user_status | age  | group_id | create_time         |
+----+----------+-------------+------+----------+---------------------+
|  1 | U-1      | active      |   10 |        1 | 2024-04-19 16:14:18 |
|  2 | U-2      | active      |   12 |        1 | 2024-04-19 16:14:18 |
|  3 | U-3      | active      |   13 |        1 | 2024-04-19 16:14:18 |
|  4 | U-3      | active      |   13 |        2 | 2024-04-19 16:14:18 |
|  5 | U-4      | active      |   14 |        2 | 2024-04-19 16:14:18 |
|  6 | U-5      | inactive    |   15 |        2 | 2024-04-19 16:14:18 |
+----+----------+-------------+------+----------+---------------------+
```

## 分组

按照 group_id+user_status 分组，where 过滤条件为 create_time 距离 now() 1小时内数据。

要求返回：count(*) as total_count, user_name 逗号拼接, max(age), min(age), user_status, group_id

```sql
SELECT 
    group_id,
    user_status,
    COUNT(*) AS total_count,  -- 每个分组的记录数
    GROUP_CONCAT(username SEPARATOR ',') AS user_names,  -- 用户名的逗号拼接
    MAX(age) AS max_age,  -- 分组内年龄的最大值
    MIN(age) AS min_age  -- 分组内年龄的最小值
FROM 
    users
WHERE 
    create_time > NOW() - INTERVAL 1 HOUR  -- 创建时间在1小时内
GROUP BY 
    group_id, 
    user_status
```

结果：

```
+----------+-------------+-------------+-------------+---------+---------+
| group_id | user_status | total_count | user_names  | max_age | min_age |
+----------+-------------+-------------+-------------+---------+---------+
|        1 | active      |           3 | U-1,U-2,U-3 |      13 |      10 |
|        2 | active      |           2 | U-3,U-4     |      14 |      13 |
|        2 | inactive    |           1 | U-5         |      15 |      15 |
+----------+-------------+-------------+-------------+---------+---------+
```



* any list
{:toc}
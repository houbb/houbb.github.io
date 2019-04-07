---
layout: post
title: MySQL View 
date:  2017-03-30 20:44:19 +0800
categories: [SQL]
tags: [mysql, view, sql]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---

# Mysql View

丑话说在前面，对于企业级项目是不推荐使用视图的。但是东西用在合适的地方就是最好的。

参考资料：

- [mysql视图学习总结](http://www.cnblogs.com/wangtao_20/archive/2011/02/24/1964276.html)

- [mysql之视图详解 ](http://blog.itpub.net/28194062/viewspace-772902/)

# 视图简介

一、为何使用视图

1. 安全

用户权限与视图绑定。实际上可以通过[shiro](http://shiro.apache.org/)或者[spring-security](http://projects.spring.io/spring-security/)控制。

2. 查询性能提高
 
3. 虚拟表不用修改表结构，可以完成某些业务需求。这一点比较实用。

二、视图的工作机制

- 视图的工作机制

当调用视图的时候，才会执行视图中的sql，进行取数据操作。视图的内容没有存储，而是在视图被引用的时候才派生出数据。这样不会占用空间，由于是即时引用，视图的内容总是与真实表的内容是一致的。

- 如此设计的优点

节省空间。维护好真实表的内容，就可保证视图的完整性。


# CRUD


为了测试。创建一个**user**表。DDL如下：

```sql
CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键,自增',
  `mobile` varchar(20) NOT NULL COMMENT '手机号',
  `password` varchar(64) NOT NULL COMMENT '密码',
  `salt` varchar(128) NOT NULL COMMENT '密码盐',
  `nickname` varchar(32) NOT NULL DEFAULT '' COMMENT '昵称',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否删除 {0:未删除, 1:已删除}',
  `created_time` datetime NOT NULL COMMENT '创建时间',
  `updated_time` datetime NOT NULL COMMENT '最后更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `mobile_UNIQUE` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表'
```

数据初始化：

```sql
INSERT INTO `user` (mobile, password, salt, nickname, is_deleted, created_time, updated_time) VALUES ('13062666053', 'a7097b4e5fa3c1d1165e66b2d72a2d060f288d64', '649f6afc93874cf8', '某小宝', 0, '2016-09-17 14:08:38', '2016-09-17 14:08:38');
INSERT INTO `user` (mobile, password, salt, nickname, is_deleted, created_time, updated_time) VALUES ('13012345678', '67917009d2faccc292171bb16084d7410616cdcb', '7c3186569813f1c3', '某宝', 0, '2016-09-17 14:08:38', '2016-09-17 14:08:38');
INSERT INTO `user` (mobile, password, salt, nickname, is_deleted, created_time, updated_time) VALUES ('13111111111', '847100b326a0574c0cdcc22483e13cb39accdefd', '48c3e9cfac9ac472', '11', 0, '2016-09-17 18:29:25', '2016-09-17 18:29:25');
INSERT INTO `user` (mobile, password, salt, nickname, is_deleted, created_time, updated_time) VALUES ('13111111112', '1d4fe693d850b2e5de5f348c69bfe15a78249022', 'c1d2a40cd8db1a88', '12', 0, '2016-09-17 18:30:10', '2016-09-17 18:30:10')
```

- Create

```
CREATE [OR REPLACE] [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]
    VIEW view_name [(column_list)]
    AS select_statement
[WITH [CASCADED | LOCAL] CHECK OPTION]
```

假设我们只关心用户的信息，如下：

```sql
CREATE VIEW v_user_info AS SELECT nickname, mobile, is_deleted FROM `user`;
```

- Read

视图创建成功之后，可以像普通表一样对待。

```
mysql> select * from v_user_info;
+-----------+-------------+------------+
| nickname  | mobile      | is_deleted |
+-----------+-------------+------------+
| 某小宝    | 13062666053 |          0 |
| 某宝      | 13012345678 |          0 |
| 11        | 13111111111 |          0 |
| 12        | 13111111112 |          0 |
+-----------+-------------+------------+
4 rows in set (0.00 sec)

mysql> desc v_user_info;
+------------+-------------+------+-----+---------+-------+
| Field      | Type        | Null | Key | Default | Extra |
+------------+-------------+------+-----+---------+-------+
| nickname   | varchar(32) | NO   |     |         |       |
| mobile     | varchar(20) | NO   |     | NULL    |       |
| is_deleted | tinyint(4)  | NO   |     | 0       |       |
+------------+-------------+------+-----+---------+-------+
3 rows in set (0.00 sec)
```

- Update

对视图的数据修改会直接反应在真实表之上。

```
mysql> select * from user where nickname='11';
+----+-------------+------------------------------------------+------------------+----------+------------+---------------------+---------------------+
| id | mobile      | password                                 | salt             | nickname | is_deleted | created_time        | updated_time        |
+----+-------------+------------------------------------------+------------------+----------+------------+---------------------+---------------------+
|  5 | 13111111111 | 847100b326a0574c0cdcc22483e13cb39accdefd | 48c3e9cfac9ac472 | 11       |          0 | 2016-09-17 18:29:25 | 2016-09-17 18:29:25 |
+----+-------------+------------------------------------------+------------------+----------+------------+---------------------+---------------------+
1 row in set (0.00 sec)

mysql> update v_user_info set mobile='10123456789' where nickname='11';
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> select * from user where nickname='11';
+----+-------------+------------------------------------------+------------------+----------+------------+---------------------+---------------------+
| id | mobile      | password                                 | salt             | nickname | is_deleted | created_time        | updated_time        |
+----+-------------+------------------------------------------+------------------+----------+------------+---------------------+---------------------+
|  5 | 10123456789 | 847100b326a0574c0cdcc22483e13cb39accdefd | 48c3e9cfac9ac472 | 11       |          0 | 2016-09-17 18:29:25 | 2016-09-17 18:29:25 |
+----+-------------+------------------------------------------+------------------+----------+------------+---------------------+---------------------+
1 row in set (0.00 sec)
```


我们也可以修改视图的结构，就像修改表结构一样。比如我们不想关心`is_deleted`了。

```
mysql> alter view v_user_info AS SELECT mobile, nickname FROM user;
Query OK, 0 rows affected (0.01 sec)

mysql> select * from v_user_info;
+-------------+-----------+
| mobile      | nickname  |
+-------------+-----------+
| 13062666053 | 某小宝    |
| 13012345678 | 某宝      |
| 10123456789 | 11        |
| 13111111112 | 12        |
+-------------+-----------+
4 rows in set (0.00 sec)
```

- Drop

```sql
DROP VIEW VIEW_NAME;
```

比如我们不想要这张视图了

```
mysql> drop view v_user_info;
Query OK, 0 rows affected (0.00 sec)
```























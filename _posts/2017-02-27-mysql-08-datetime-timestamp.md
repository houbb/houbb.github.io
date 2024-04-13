---
layout: post
title: MySQL-08-datetime timestamp 以及如何自动更新，如何实现范围查询
date:  2017-02-27 21:44:46 +0800
categories: [SQL]
tags: [mysql, database, sql]
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

有时候我们希望当数据的记录发生变化的时候，就有一个时间戳可以记录一下。

很多时候这个逻辑是通过去保证的。

不过有些情况可能没这么美好：

（1）历史代码更新时没有更新对应的时间字段

（2）数据库直接操作，刷脚本等，跳过了程序

那么，如何保证这个我们可以有一个字段保证在记录变更时自动更新呢？

# on update

## 声明方式

我们可以添加一个字段

```sql
alter table TABLE_NAME add column MODIFY_DATE_TIME datetime(6) default CURRENT_TIMESTAMP(6) null on update CURRENT_TIMESTAMP(6)
COMMENT '自动更新时间';
```

## 简单解释

ON UPDATE CURRENT_TIMESTAMP(6) 表示数据被更新时，则字段无论值有没有变化，它的值也会跟着更新为当前UPDATE操作时的时间。

# datetime 与 timestampe 的区别

## mysql 获取当前时间的方式

```
CURRENT_TIMESTAMP

CURRENT_TIMESTAMP()

NOW()

LOCALTIME

LOCALTIME()

LOCALTIMESTAMP

LOCALTIMESTAMP()
```

## 关于TIMESTAMP和DATETIME的比较

一个完整的日期格式如下：`YYYY-MM-DD HH:MM:SS[.fraction]`，它可分为两部分：date部分和time部分，其中，date部分对应格式中的“YYYY-MM-DD”，time部分对应格式中的 `HH:MM:SS[.fraction]`。

对于date字段来说，它只支持date部分，如果插入了time部分的内容，它会丢弃掉该部分的内容，并提示一个warning。

```sql
mysql> create table test(id int,hiredate date);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into test values(1,'20151208000000');
Query OK, 1 row affected (0.00 sec)

mysql> insert into test values(1,'20151208104400');
Query OK, 1 row affected, 1 warning (0.01 sec)

mysql> show warning;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'warning' at line 1
mysql> select * from test;
+------+------------+
| id   | hiredate   |
+------+------------+
|    1 | 2015-12-08 |
|    1 | 2015-12-08 |
+------+------------+
2 rows in set (0.00 sec)
```

注：第一个没提示warning的原因在于它的time部分都是0

## 二者的异同点

### 相同点

两者都可用来表示 `YYYY-MM-DD HH:MM:SS[.fraction]` 类型的日期。

### 不同点

（1）两者的存储方式不一样

对于TIMESTAMP，它把客户端插入的时间从当前时区转化为UTC（世界标准时间）进行存储。查询时，将其又转化为客户端当前时区进行返回。

而对于DATETIME，不做任何改变，基本上是原样输入和输出。

```sql
mysql> create table test(id int,hiredate timestamp);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into test values(1,'20151208000000');
Query OK, 1 row affected (0.00 sec)

mysql> create table test1(id int,hiredate datetime);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into test1 values(1,'20151208000000');
Query OK, 1 row affected (0.00 sec)

mysql> select * from test;
+------+---------------------+
| id   | hiredate            |
+------+---------------------+
|    1 | 2015-12-08 00:00:00 |
+------+---------------------+
1 row in set (0.01 sec)

mysql> select * from test1;
+------+---------------------+
| id   | hiredate            |
+------+---------------------+
|    1 | 2015-12-08 00:00:00 |
+------+---------------------+
1 row in set (0.00 sec)
```

两者输出是一样的。

- 其次修改当前会话的时区

```sql
mysql> show variables like '%time_zone%'; 
+------------------+--------+
| Variable_name    | Value  |
+------------------+--------+
| system_time_zone | CST    |
| time_zone        | SYSTEM |
+------------------+--------+
2 rows in set (0.00 sec)

mysql> set time_zone='+0:00';
Query OK, 0 rows affected (0.00 sec)

mysql> select * from test;
+------+---------------------+
| id   | hiredate            |
+------+---------------------+
|    1 | 2015-12-07 16:00:00 |
+------+---------------------+
1 row in set (0.00 sec)

mysql> select * from test1;
+------+---------------------+
| id   | hiredate            |
+------+---------------------+
|    1 | 2015-12-08 00:00:00 |
+------+---------------------+
1 row in set (0.01 sec)
```

上述“CST”指的是MySQL所在主机的系统时间，是中国标准时间的缩写，China Standard Time UT+8:00

通过结果可以看出，test中返回的时间提前了8个小时，而test1中时间则不变。

这充分验证了两者的区别。

（2）两者所能存储的时间范围不一样

timestamp 所能存储的时间范围为：'1970-01-01 00:00:01.000000' 到 '2038-01-19 03:14:07.999999'。

datetime 所能存储的时间范围为：'1000-01-01 00:00:00.000000' 到 '9999-12-31 23:59:59.999999'。

总结：TIMESTAMP和DATETIME除了存储范围和存储方式不一样，没有太大区别。

当然，对于跨时区的业务，TIMESTAMP更为合适。

## 关于TIMESTAMP和DATETIME的自动初始化和更新

首先，我们先看一下下面的操作

```sql
mysql> create table test(id int,hiredate timestamp);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into test(id) values(1);
Query OK, 1 row affected (0.00 sec)

mysql> select * from test;
+------+---------------------+
| id   | hiredate            |
+------+---------------------+
|    1 | 2015-12-08 14:34:46 |
+------+---------------------+
1 row in set (0.00 sec)

mysql> show create table test\G
*************************** 1. row ***************************
       Table: test
Create Table: CREATE TABLE `test` (
  `id` int(11) DEFAULT NULL,
  `hiredate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1
1 row in set (0.00 sec)
```

看起来是不是有点奇怪，我并没有对hiredate字段进行插入操作，它的值自动修改为当前值，而且在创建表的时候，我也并没有定义“show create table test\G”结果中显示的“ DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP”。

### 自动初始化和更新

其实，这个特性是**自动初始化和自动更新（Automatic Initialization and Updating）**。

自动初始化指的是如果对该字段（譬如上例中的hiredate字段）没有显性赋值，则自动设置为当前系统时间。

自动更新指的是如果修改了其它字段，则该字段的值将自动更新为当前系统时间。

它与“explicit_defaults_for_timestamp”参数有关。

默认情况下，该参数的值为OFF，如下所示：

```sql
mysql> show variables like '%explicit_defaults_for_timestamp%';
+---------------------------------+-------+
| Variable_name                   | Value |
+---------------------------------+-------+
| explicit_defaults_for_timestamp | OFF   |
+---------------------------------+-------+
1 row in set (0.00 sec)
```

下面我们看看官档的说明：

```
By default, the first TIMESTAMP column has both DEFAULT CURRENT_TIMESTAMP and ON UPDATE CURRENT_TIMESTAMP if neither is specified explicitly。
```

很多时候，这并不是我们想要的，如何禁用呢？

1. 将“explicit_defaults_for_timestamp”的值设置为ON。

2. “explicit_defaults_for_timestamp”的值依旧是OFF，也有两种方法可以禁用

1> 用DEFAULT子句该该列指定一个默认值

2> 为该列指定NULL属性。

在MySQL 5.6.5 版本之前，Automatic Initialization and Updating只适用于TIMESTAMP，而且一张表中，最多允许一个TIMESTAMP字段采用该特性。

从MySQL 5.6.5 开始，Automatic Initialization and Updating同时适用于TIMESTAMP和DATETIME，且不限制数量。

# 如何实现范围查询

如果想查询最近一段时间操作的记录，可使用如下查询语句（-60*10的单位是秒）：

```sql
SELECT * FROM table
WHERE  unix_timestamp(时间字段)>unix_timestamp(NOW())-60*10 
ORDER BY 时间字段 desc
LIMIT 1000
```

## java 实战

我想查询最近一段时间内的错误次数，使用 java 结合 mybatis 实现：

```java
long unixTimeSeconds = System.currentTimeMillis()/1000 - timeSeconds;
long errorCount = baseMapper.selectErrorCount(ip, unixTimeSeconds);
```

- Mapper.java

定义如下：

```java
/**
 * 错误的次数统计
 * @param ip ip 信息
 * @param timeSeconds 毫秒数
 * @return 错误的次数
 * @since 0.0.13
 */
long selectErrorCount(@Param("ip") String ip,
                          @Param("timeSeconds") long timeSeconds);
```

- 对应的 xml sql

```sql
<select id="selectErrorCount" resultType="java.lang.Long">
    SELECT count(*)
    FROM LOGIN_LOG
    WHERE IP = #{ip}
    AND login_status = 'F'
    AND unix_timestamp(create_time) > #{timeSeconds}
</select>
```

# 个人收获 

mysql 的这种特性其实更加类似于一个原理应该就是触发器。

我们如果想实现这个功能，前提是知道这个知识点。

缺点可能是有些 sql 没有提供这种特性，不过常见的应该都提供了。


# 参考资料

[mysql更新时设置ON UPDATE CURRENT_TIMESTAMP保存数据库的时间](https://blog.csdn.net/dongzhouzhou/article/details/80367551)

[MySQL中datetime和timestamp的区别及使用](https://www.cnblogs.com/mxwz/p/7520309.html)

[mysql TIMESTAMP（时间戳）详解——查询最近一段时间操作的记录](https://www.cnblogs.com/XL-Liang/archive/2012/05/15/2501242.html)

* any list
{:toc}
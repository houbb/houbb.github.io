---
layout: post
title:  浅谈数据库事务之隔离级别 Database Transaction isolation
date:  2018-07-26 11:17:13 +0800
categories: [Database]
tags: [database, transaction, sf]
published: true
---

# 前言

大家好，我是老马。

每一个做后端的开发小伙伴，基本都接触过数据库，对事务也都有所耳闻。

但是真的问起来，可能都会记不太清处理。

每天都在用，但是总是忘记，事务堪称最熟悉的陌生人。

本文就和大家一起重点回顾下事务的隔离级别。

# 基本概念

为保证文档的完整性，下面是一些官方的概念。不感兴趣的小伙伴可以跳过。

遇到不清楚的名词，回头查阅即可。

## 数据库事务

数据库事务（简称：事务）是数据库管理系统执行过程中的一个逻辑单位，由一个有限的数据库操作序列构成。

## ACID 性质

并非任意的对数据库的操作序列都是数据库事务。

数据库事务拥有以下四个特性，习惯上被称之为 ACID 特性。

| 性质 | 描述 |
|:---|:---|
| 原子性（Atomicity）| 事务作为一个整体被执行，包含在其中的对数据库的操作要么全部被执行，要么都不执行。|
| 一致性（Consistency）| 事务应确保数据库的状态从一个一致状态转变为另一个一致状态。一致状态的含义是数据库中的数据应满足完整性约束。|
| 隔离性（Isolation）| 多个事务并发执行时，一个事务的执行不应影响其他事务的执行。|
| 持久性（Durability）| 已被提交的事务对数据库的修改应该永久保存在数据库中。|

## SQL 标准事务隔离级别

本文重点讨论一下第三点，隔离性。

为了兼顾并发效率和异常控制，在标准SQL规范中，定义了4个事务隔离级别。

| 隔离级别 | 说明 | 备注 |
|:---|:---|:---|
| 未提交读(Read Uncommitted) | 即使一个更新语句没有提交，但是别的事务可以读到这个改变。 | Read Uncommitted 允许脏读。 |
| 已提交读(Read Committed) | 直译就是"读提交"，意思就是语句提交以后，即执行了 Commit 以后别的事务就能读到这个改变，只能读取到已经提交的数据。 | Read Commited 不允许脏读，但会出现非重复读。 |
| 可重复读(Repeatable Read) | 同一个事务里面先后执行同一个查询语句的时候，得到的结果是一样的。 | Repeatable Read 不允许脏读，不允许非重复读，但是会出现幻象读。 |
| 串行读(Serializable) | 个事务执行的时候不允许别的事务并发执行。 | 完全串行化的读，每次读都需要获得表级共享锁，读写相互都会阻塞。 |

SQL 标准为什么要定义 4 种不同的隔离级别呢？

当然是**为了解决实际数据库读写中会遇到的问题**。

下面让我们结合实际例子来看一下这些问题，而不只是抽象的概念。

# 准备工作

此处演示数据库为 5.7 版本的 mysql。

## 创建表

```java
CREATE TABLE user
(
    `id`        BIGINT(19)   NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    user_id   VARCHAR(20)  NOT NULL COMMENT '用户标识',
    user_name  VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '用户名称',
    UNIQUE KEY (user_id)
) ENGINE = InnoDB comment '用户表';
```

## 数据初始化

```sql
insert into user (user_id, user_name) values ('001', '老马啸西风');
insert into user (user_id, user_name) values ('002', '江南可采莲');
```

查询数据：

```
mysql> select * from user;
+----+---------+-----------------+
| id | user_id | user_name       |
+----+---------+-----------------+
|  1 | 001     | 老马啸西风      |
|  2 | 002     | 江南可采莲      |
+----+---------+-----------------+
```

## 隔离级别的设置与读取

mysql 中查看隔离级别的方式：

```
mysql> select @@tx_isolation;
+-----------------+
| @@tx_isolation  |
+-----------------+
| REPEATABLE-READ |
+-----------------+
```

设置隔离级别的方式：

```sql
set  [glogal | session]  transaction isolation level 隔离级别名称;
set tx_isolation= 隔离级别名称;
```

## 事务的命令方式

START TRANSACTION 或 BEGIN 开始新的事务 

COMMIT 提交当前事务 

ROLLBACK 回滚当前事务

知道这些，就可以进行下面的验证了。

# 数据库读写问题演示

## 脏读(Dirty Read)

### 例子

session A 设置隔离级别为读未提交。

```sql
set session transaction isolation level read uncommitted;
set tx_isolation='READ-UNCOMMITTED';
```

session B 开启事务，进行数据插入，但是不提交事务。

```sql
set session transaction isolation level read uncommitted;
set tx_isolation='READ-UNCOMMITTED';

BEGIN;
insert into user (user_id, user_name) values ('003', '莲叶何田田');
```

此时 session B 的事务未提交，但是 session A 是可以查询到的：

```
mysql> select * from user;
+----+---------+-----------------+
| id | user_id | user_name       |
+----+---------+-----------------+
|  1 | 001     | 老马啸西风      |
|  2 | 002     | 江南可采莲      |
|  3 | 003     | 莲叶何田田      |
+----+---------+-----------------+
```

**当一个事务读取另一个事务尚未提交的修改时，产生脏读。**

同一事务内不是脏读。 

### 解决方式-READ committed;

我们可以把隔离界别设置为读提交即可。

session A

```sql
set session transaction isolation level read committed;
set tx_isolation='READ-COMMITTED';
```

session B

```sql
set session transaction isolation level read committed;
set tx_isolation='READ-COMMITTED';

BEGIN;
insert into user (user_id, user_name) values ('004', '鱼戏莲叶间');
```

此时 session A 查询，看到的还是 3 条; session B 是可以看到 4 条的。

```
mysql> select * from user;
+----+---------+-----------------+
| id | user_id | user_name       |
+----+---------+-----------------+
|  1 | 001     | 老马啸西风      |
|  2 | 002     | 江南可采莲      |
|  3 | 003     | 莲叶何田田      |
+----+---------+-----------------+
```

只有当 session B commit 之后，session A 才能看到新插入的数据。

## 非重复读(Nonrepeatable Read) 

### 例子

我们设置隔离级别为 READ-COMMITTED（读提交），来演示这个问题。

session A

```sql
set session transaction isolation level read committed;
set tx_isolation='READ-COMMITTED';

BEGIN;

select * from user where user_id = '002';
```

数据如下：

```
+----+---------+-----------------+
| id | user_id | user_name       |
+----+---------+-----------------+
|  2 | 002     | 江南可采莲      |
+----+---------+-----------------+
```

session B，对该数据进行修改，并提交。

```sql
set session transaction isolation level read committed;
set tx_isolation='READ-COMMITTED';

BEGIN;

update user set user_name = '陌上花开' where user_id = '002';

COMMIT;
```

session A 重新查询：

```
mysql> select * from user where user_id = '002';
+----+---------+--------------+
| id | user_id | user_name    |
+----+---------+--------------+
|  2 | 002     | 陌上花开     |
+----+---------+--------------+
```

一个事务对同一行数据重复读取两次，但是却得到了不同的结果。

**同一查询在同一事务中多次进行，由于其他提交事务所做的修改或删除，每次返回不同的结果集，此时发生非重复读**。

这个问题，比如我们处理用户金额，查询的时候是一个值，然后被其他线程修改，再查询又变化了，无疑是致命的。

### 解决方式-REPEATABLE-READ

我们可以把隔离级别设置为可重复读来解决这个问题。

ps: 可重复读也是 mysql 的默认级别。

session A

```sql
set session transaction isolation level REPEATABLE read;
set tx_isolation='REPEATABLE-READ';

BEGIN;

select * from user where user_id = '002';
```

session B，对该数据进行修改，并提交。

```sql
set session transaction isolation level read committed;
set tx_isolation='REPEATABLE-READ';

BEGIN;

update user set user_name = '可缓缓归矣' where user_id = '002';

COMMIT;
```

此时 session B 的数据 002 已经变为 '可缓缓归矣'。

不过 session A 的数据依然是不变的：

```
mysql> select * from user where user_id = '002';
+----+---------+--------------+
| id | user_id | user_name    |
+----+---------+--------------+
|  2 | 002     | 陌上花开     |
+----+---------+--------------+
```

## 幻读(Phantom Reads) 

事务在操作过程中进行两次查询，第二次查询的结果包含了第一次查询中未出现的数据（这里并不要求两次查询的SQL语句相同）。

这是因为在两次查询过程中有另外一个事务插入数据造成的。

当对某行执行插入或删除操作，而该行属于某个事务正在读取的行的范围时，会发生幻像读问题。

session A

```sql
set session transaction isolation level REPEATABLE read;
set tx_isolation='REPEATABLE-READ';

BEGIN;

select * from user where id > 2;
```

返回结果：

```
mysql> select * from user where id > 2;
+----+---------+-----------------+
| id | user_id | user_name       |
+----+---------+-----------------+
|  3 | 003     | 莲叶何田田      |
|  4 | 004     | 鱼戏莲叶间      |
+----+---------+-----------------+
```


session B，插入一条数据：

```sql
set session transaction isolation level read committed;
set tx_isolation='REPEATABLE-READ';

BEGIN;

insert into user (user_id, user_name) values ('005', '鱼戏莲叶东');

COMMIT;
```

此时 session A 查询如下：

```
mysql> select * from user where id > 2;
+----+---------+-----------------+
| id | user_id | user_name       |
+----+---------+-----------------+
|  3 | 003     | 莲叶何田田      |
|  4 | 004     | 鱼戏莲叶间      |
+----+---------+-----------------+
```

可以发现，这种场景的幻读，mysql 已经在可重复读的隔离级别已经处理掉了。

是基于 next-key 临键锁处理的。

当然，你可以用插入方式去证明存在问题，比如 session B 插入了 005 的数据，但是 session A 查询时没有看到，你再次插入，会报错。

当然这无伤大雅，因为本来应该看不到才是正确的。

## 丢失修改(Lost Update)

第一类：当两个事务更新相同的数据源，如果第一个事务被提交，第二个却被撤销，那么连同第一个事务做的更新也被撤销。

第二类：有两个并发事务同时读取同一行数据，然后其中一个对它进行修改提交，而另一个也进行了修改提交。这就会造成第一次写操作失效。

### 解决方案-锁

这种丢失修改，最常见的两种实现方式：

方式1：排他锁

```sql
select * from user for update
```

读取时，加一把排他锁。

方式2：分布式锁

基于 redis 等实现的分布式锁。

推荐阅读：

[redis 分布式锁设计 redis lock](https://houbb.github.io/2019/01/07/redis-learn-41-lock)

[ZooKeeper 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-zookeeper)

# Mysql 事务的实现原理

我们演示了上面的几个场景，但是 mysql 是如何实现不同隔离级别的处理的呢？

## trade-off

我们可以使用安全级别最高的串行化，但是性能很差。

那如何同时兼顾数据的准确性，和并发性呢？

这里就绕不开永恒的两个话题：锁（lock） 和多版本控制（MVCC）

## 锁

### 读写锁

为保证数据的准确性：

（1）读数据时。

为数据添加读锁（共享锁），数据允许其他读锁，但是不能写。

（2）写数据时

为数据添加写锁（排他锁），此时数据不允许其他读锁，更不允许写锁。

### 两端式提交锁（Two-phase locking）

两段式提交分为两步：

1. 这个阶段只加锁，或者释放锁（读写锁）

2. 这个阶段只会释放锁

说白了就是我们常见的：

```java
try{
    // 持有锁处理
    BEGIN TX

    // 成功则提交
    COMMIT;
} catch(Exception ex) {
    // 异常则回滚
    ROLLBACK;
} finally {
    // 释放锁
}
```

下面对应于不同隔离级别对加锁方式进一步分析：

未提交读（read uncommitted）：这个级别加锁，其实并不需要用两端式加锁，每一个具体操作执行完，锁就可以释放了。

提交读（read committed）：这个阶段其实也可以按照每个操作执行前加锁，执行之后释放锁的方式。

可重复读（repeatable read） ： 这个级别，就要求读锁必须，到事务结束前最后时刻才能释放，这样才能保证读取到数据是不可变的，可重复读的。但是这样会阻塞其他事务对加锁的数据的写操作。

序列化读（serializable）：这个级别要求，两段式提交的第一步，要在事务开始的时候，原子性的把需要的锁全部加好（这显然很难估算，除非很大力度的锁），在事务结束前最后时刻，把全部锁一次性释放。这样做的结果就是使很多数据在事务执行期能都被加锁，无法被其他事务所使用。

## MVCC

### 概念

加锁的方式处理事务一个比较大的问题就是会造成死锁（dead lock）,原因就是一个事务加锁的数据并不止只有一行。

事务A对行C加写锁，事务B对行D加写锁，接着事务希望获取行D的锁，事务B希望获取行C的锁，这样很容就死锁了。

使用MVCC就可以避免很多情况下的加锁操作，使用**数据冗余的方式来实现事务隔离**。

MVCC提供的只是一种思路，具体的实现比较多样化。

大体的思路是每一行保存冗余数据，读写的时间戳，也可以称为版本号，在对某一行数据继续update或者delete的时候，并不直接操作，而是复制多一份副本进行操作，这个就是所谓多版本（multiversion）。

### mysql innodb 对于 MVCC 的实现

innodb对每一行保存两个系统版本号，一个更新操作的版本号，一个删除操作的版本号，这两个版本号的来源是事务的ID（transaction id），也就是说，当某个事务对这一行数据进行update，或者删除的时候，相应会把它的事务ID写入这行数据的更新操作的版本号，删除操作的版本号中。

mysql官方innodb的实现是用MVCC，官方声称默认的innodb的隔离级别是可重复读。

但是mysql是保证不会出现幻读的，因为它每次select只会读取在事务开始时候的snapshot，并且忽略在这个时刻之后提交的所有变更。

> [consistent read](https://dev.mysql.com/doc/refman/5.7/en/innodb-consistent-read.html)

MVCC 的详细内容，此处不做展开。拓展阅读：[SQL MVCC](https://houbb.github.io/2018/08/31/sql-mvcc)

# 小结

数据库事务基本上是看了就忘，重在理解。

mysql 对于可重复读，做了很多额外的操作，设计的很巧妙，值得学习。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 参考资料

https://zh.wikipedia.org/zh-hans/%E6%95%B0%E6%8D%AE%E5%BA%93%E4%BA%8B%E5%8A%A1

https://hit-alibaba.github.io/interview/basic/db/Transaction.html

https://www.jianshu.com/p/eb150b4f7ce0

* any list
{:toc}
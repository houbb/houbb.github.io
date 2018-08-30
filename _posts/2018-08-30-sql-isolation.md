---
layout: post
title:  SQL Isolation
date:  2018-08-30 09:22:17 +0800
categories: [SQL]
tags: [sql, mysql, sf]
published: true
---

# 数据库隔离性

## 概念

事务隔离级别是数据库事务处理的基础，ACID 中 I，即 Isolation，指的就是事务的隔离性。

隔离性是指，多个用户的并发事务访问同一个数据库时，一个用户的事务不应该被其他用户的事务干扰，多个并发事务之间要相互隔离。

## sql 92 标准

sql 92 标准定义了 4 种隔离级别，读未提交、读已提交、可重复读、串行化，见下表。

- ANSI SQL 隔离级级别

| Isolation Level  | Dirty Read   | Nonrepeatable Read | Phantom Read          | Serialization Anomaly |
| ---------------- | ------------ | ------------------ | --------------------- | --------------------- |
| Read Uncommitted | Possible     | Possible           | Possible              | Possible              |
| Read Committed   | Not possible | Possible           | Possible              | Possible              |
| Repeatable Read  | Not possible | Not possible       | Possible              | Possible              |
| Serializable     | Not possible | Not possible       | Not possible          | Not possible          |

### 未提交读(Read Uncommitted)

允许脏读，也就是可能读取到其他会话中未提交事务修改的数据

### 提交读(Read Committed)

只能读取到已经提交的数据。Oracle等多数数据库默认都是该级别 (不重复读)

### 可重复读(Repeated Read)

可重复读。在同一个事务内的查询都是事务开始时刻一致的，Mysql/InnoDB默认级别。在SQL标准中，该隔离级别消除了不可重复读，但是还存在幻读。

### 串行读(Serializable)

完全串行化的读，每次读都需要获得表级共享锁，读写相互都会阻塞。

# 例子解释

mysql 为例子。

## mysql 相关

### 查看

- 在 MySQL 数据库中查看当前事务的隔离级别：

```sql
select @@tx_isolation;
```

### 设置

- 在 MySQL 数据库中设置事务的隔离级别：

```sql
set  [glogal | session]  transaction isolation level 隔离级别名称;
set tx_isolation=’隔离级别名称;’
```

## 脏读

脏读就是指当一个事务正在访问数据，并且对数据进行了修改，而这种修改还没有提交到数据库中，这时，另外一个事务也访问这个数据，然后使用了这个数据。

## 不可重复读

是指在一个事务内，多次读同一数据。

在这个事务还没有结束时，另外一个事务也访问该同一数据。

那么，在第一个事务中的两次读数据之间，由于第二个事务的修改，那么第一个事务两次读到的的数据可能是不一样的。

这样就发生了在**一个事务内两次读到的数据是不一样的**，因此称为是不可重复读。

## 可重复读

```sql
session 1:
mysql> select @@session.tx_isolation;
+------------------------+
| @@session.tx_isolation |
+------------------------+
| REPEATABLE-READ        |
+------------------------+
row in set (0.00 sec)

mysql> start transaction;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from ttd;
+------+
| id   |
+------+
|    1 |
|    2 |
+------+
rows in set (0.00 sec)

session 2 :

mysql> select @@session.tx_isolation;
+------------------------+
| @@session.tx_isolation |
+------------------------+
| REPEATABLE-READ        |
+------------------------+
row in set (0.00 sec)

mysql> start transaction;
Query OK, 0 rows affected (0.00 sec)

mysql> insert into ttd values(3);
Query OK, 1 row affected (0.00 sec)

mysql> commit;
Query OK, 0 rows affected (0.03 sec)

session 2 提交后,查看session 1 的结果;

session 1:

mysql> select * from ttd;
+------+
| id   |
+------+
|    1 |                                      --------和第一次的结果一样,REPEATABLE-READ级别出现了重复读
|    2 |
+------+
rows in set (0.00 sec)
```

(commit session 1 之后 再 `select * from ttd` 可以看到session 2 插入的数据3)

## 幻读

第一个事务对一个表中的数据进行了修改，这种修改涉及到表中的全部数据行。

同时，第二个事务也修改这个表中的数据，这种修改是向表中插入一行新数据。

那么，以后就会发生操作第一个事务的用户无法发现事务2中提交的事务，就好象发生了幻觉一样。

- 表

```sql
mysql>CREATE TABLE `t_bitfly` (
`id` bigint(20) NOT NULL default '0',
`value` varchar(32) default NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB

mysql> select @@global.tx_isolation, @@tx_isolation;
+-----------------------+-----------------+
| @@global.tx_isolation | @@tx_isolation  |
+-----------------------+-----------------+
| REPEATABLE-READ       | REPEATABLE-READ |
+-----------------------+-----------------+
```

### 实验一

```sql
t Session A                   Session B
|
| START TRANSACTION;          START TRANSACTION;
|
| SELECT * FROM t_bitfly;
| empty set
|                             INSERT INTO t_bitfly
|                             VALUES (1, 'a');
|
| SELECT * FROM t_bitfly;
| empty set
|                             COMMIT;
|
| SELECT * FROM t_bitfly;
| empty set
|
| INSERT INTO t_bitfly VALUES (1, 'a');
| ERROR 1062 (23000):
| Duplicate entry '1' for key 1
```

刚刚明明告诉我没有这条记录的，可是却。。。

如此就出现了幻读，以为表里没有数据，其实数据已经存在了，傻乎乎的提交后，才发现数据冲突了。

### 实验二

```sql
t Session A                  Session B
|
| START TRANSACTION;         START TRANSACTION;
|
| SELECT * FROM t_bitfly;
| +------+-------+
| | id   | value |
| +------+-------+
| |    1 | a     |
| +------+-------+
|                            INSERT INTO t_bitfly
|                            VALUES (2, 'b');
|
| SELECT * FROM t_bitfly;
| +------+-------+
| | id   | value |
| +------+-------+
| |    1 | a     |
| +------+-------+
|                            COMMIT;
|
| SELECT * FROM t_bitfly;
| +------+-------+
| | id   | value |
| +------+-------+
| |    1 | a     |
| +------+-------+
|
| UPDATE t_bitfly SET value='z';
| Rows matched: 2  Changed: 2  Warnings: 0
| (怎么多出来一行)
|
| SELECT * FROM t_bitfly;
| +------+-------+
| | id   | value |
| +------+-------+
| |    1 | z     |
| |    2 | z     |
| +------+-------+
```

### 实验三

再看一个实验，要注意，表 t_bitfly 里的 id 为主键字段。

```sql
t Session A                 Session B
|
| START TRANSACTION;        START TRANSACTION;
|
| SELECT * FROM t_bitfly
| WHERE id<=1
| FOR UPDATE;
| +------+-------+
| | id   | value |
| +------+-------+
| |    1 | a     |
| +------+-------+
|                           INSERT INTO t_bitfly
|                           VALUES (2, 'b');
|                           Query OK, 1 row affected
|
| SELECT * FROM t_bitfly;
| +------+-------+
| | id   | value |
| +------+-------+
| |    1 | a     |
| +------+-------+
|                           INSERT INTO t_bitfly
|                           VALUES (0, '0');
|                           (waiting for lock ...then timeout)
|                           ERROR 1205 (HY000):
|                           Lock wait timeout exceeded;
|                           try restarting transaction
|
| SELECT * FROM t_bitfly;
| +------+-------+
| | id   | value |
```

可以看到，用id<=1加的锁，只锁住了id<=1的范围，可以成功添加id为2的记录，添加id为0的记录时就会等待锁的释放。

### 实验四

一致性读和提交读

```sql
t Session A                      Session B
|
| START TRANSACTION;             START TRANSACTION;
|
| SELECT * FROM t_bitfly;
| +----+-------+
| | id | value |
| +----+-------+
| |  1 | a     |
| +----+-------+
|                                INSERT INTO t_bitfly
|                                VALUES (2, 'b');
|                                COMMIT;
|
| SELECT * FROM t_bitfly;
| +----+-------+
| | id | value |
| +----+-------+
| |  1 | a     |
| +----+-------+
|
| SELECT * FROM t_bitfly LOCK IN SHARE MODE;
| +----+-------+
| | id | value |
| +----+-------+
| |  1 | a     |
| |  2 | b     |
| +----+-------+
|
| SELECT * FROM t_bitfly FOR UPDATE;
| +----+-------+
| | id | value |
| +----+-------+
| |  1 | a     |
| |  2 | b     |
| +----+-------+
|
| SELECT * FROM t_bitfly;
| +----+-------+
| | id | value |
| +----+-------+
| |  1 | a     |
| +----+-------+
```

如果使用普通的读，会得到一致性的结果，如果使用了加锁的读，就会读到“最新的”“提交”读的结果。

本身，可重复读和提交读是矛盾的。在同一个事务里，如果保证了可重复读，就会看不到其他事务的提交，违背了提交读；如果保证了提交读，就会导致前后两次读到的结果不一致，违背了可重复读。

可以这么讲，InnoDB 提供了这样的机制，在默认的可重复读的隔离级别里，可以使用加锁读去查询最新的数据（提交读）。
MySQL InnoDB 的可重复读并不保证避免幻读，需要应用使用加锁读来保证。

而这个加锁度使用到的机制就是 next-key locks。

## 小结

隔离级别越高，安全性越高，但是性能越差。

# mysql 隔离性实现原理

## 实现方式

我们知道，如果要实现数据库事务最高隔离性，也就是最安全的隔离性，有个显而易见的实现就是当一个事务在执行的时候，其他全部事务都阻塞，等待这个事务执行完再执行，这在现代多核CPU环境下显然非常浪费计算资源。为了充分利用资源，必须支持并发，这里就涉及并发控制（Concurrency control）
这是一个非常大的主题，关系到数据库，有两个比较重要的方法，一个是用锁（lock），一个是称为多版本并发控制（MVCC）的方法。

## 锁的方式

悲观锁

### 读写锁

读写锁的概念很平常，当你在读取数据的时候，应该先加读锁，读取完之后的某个时间再解开读锁，那么加了读锁的数据，应该需要有什么特性呢，应该只能读，不能写，因为加了读锁，说明有事务准备读取这个数据，如果被别的事务重写这个事务，那数据就不准确了。所以一个事务给这个数据加了读锁，别的事务也可以对这个数据加读锁，因为大家都是只读不写。

写锁则具有排他性（exclusive lock），当一个事务准备对一个数据进行写操作的时候，先要对数据加写锁，那么数据就是可变的，这时候，其他事务就无法对这个数据加读锁了，除非这个写锁释放。

### 两端式提交锁（Two-phase locking）

两段式提交分为两步：

1. 这个阶段只加锁，或者释放锁（读写锁）

2. 这个阶段只会释放锁

下面对应于不同隔离级别对加锁方式进一步分析：

未提交读（read uncommitted）：这个级别加锁，其实并不需要用两端式加锁，每一个具体操作执行完，锁就可以释放了。

提交读（read committed）：这个阶段其实也可以按照每个操作执行前加锁，执行之后释放锁的方式。

可重复读（repeatable read） ： 这个级别，就要求读锁必须，到事务结束前最后时刻才能释放，这样才能保证读取到数据是不可变的，可重复读的。但是这样会阻塞其他事务对加锁的数据的写操作。

序列化读（serializable）：这个级别要求，两段式提交的第一步，要在事务开始的时候，原子性的把需要的锁全部加好（这显然很难估算，除非很大力度的锁），在事务结束前最后时刻，把全部锁一次性释放。这样做的结果就是使很多数据在事务执行期能都被加锁，无法被其他事务所使用。

## MVCC

乐观锁

## 概念

加锁的方式处理事务一个比较大的问题就是会造成死锁（dead lock）,原因就是一个事务加锁的数据并不止只有一行。

事务A对行C加写锁，事务B对行D加写锁，接着事务希望获取行D的锁，事务B希望获取行C的锁，这样很容就死锁了。

使用MVCC就可以避免很多情况下的加锁操作，使用**数据冗余的方式来实现事务隔离**（这真是个很好的设计啊）

MVCC提供的只是一种思路，具体的实现比较多样化。
大体的思路是每一行保存冗余数据，读写的时间戳，也可以称为版本号，在对某一行数据继续update或者delete的时候，并不直接操作，而是复制多一份副本进行操作，这个就是所谓多版本（multiversion）。

## mysql innodb 对于 MVCC 的实现

innodb对每一行保存两个系统版本号，一个更新操作的版本号，一个删除操作的版本号，这两个版本号的来源是事务的ID（transaction id），也就是说，当某个事务对这一行数据进行update，或者删除的时候，相应会把它的事务ID写入这行数据的更新操作的版本号，删除操作的版本号中。

事务ID是随时间推移而增长，而且不可重复的。一个事务打开之后：

对于select操作：每次只会select具有比当前事务ID更小的更新操作版本号的数据，而且这些数据要保证删除版本号为空，或者删除版本号大于当前事务ID。

对于update操作：对该行数据复制出一份副本，同时在更新操作版本号写入当前事务ID，同时把当前事务ID写入之前的删除操作的版本号中。

对于insert操作：写入新行，同时在更新操作版本号写入当前事务ID

对于delete操作：在删除操作版本号写入当前事务ID

mysql官方innodb的实现是用MVCC，官方声称默认的innodb的隔离级别是可重复读。

但是mysql是保证不会出现幻读的，因为它每次select只会读取在事务开始时候的snapshot，并且忽略在这个时刻之后提交的所有变更。

> [consistent read](https://dev.mysql.com/doc/refman/5.7/en/innodb-consistent-read.html)

mysql官方文档提到串行隔离级别要在原来的基础说对每一个select操作执行 [SELECT ... LOCK IN SHARE MODE](https://dev.mysql.com/doc/refman/5.7/en/select.html)

这样就可以读取的数据加读锁了，那么其他试图写入数据都必须阻塞。那么就可以实现序列化串行了。

# 参考文档

- sql

[sql-1992](https://www.contrib.andrew.cmu.edu/~shadow/sql/sql1992.txt)

- 隔离级别

https://github.com/pingcap/docs-cn/blob/master/sql/transaction-isolation.md

http://www.cnblogs.com/zhoujinyi/p/3437475.html

https://www.jianshu.com/p/06f3542240b4

https://zh.wikipedia.org/wiki/%E4%BA%8B%E5%8B%99%E9%9A%94%E9%9B%A2

- mysql InnoDB LOCK

https://mp.weixin.qq.com/s/x_7E2R2i27Ci5O7kLQF0UA

http://www.cnblogs.com/zhoujinyi/p/3435982.html

http://hedengcheng.com/?p=771

https://www.jianshu.com/p/5734c143c0bc

- MVCC

http://blog.51cto.com/donghui/692586

https://draveness.me/database-concurrency-control

https://segmentfault.com/a/1190000012650596

- oracle

https://www.2cto.com/database/201306/223404.html

* any list
{:toc}
---
layout: post
title: MySQL 入门使用
date: 2016-10-17 22:24:53 +0800
categories: [Database]
tags: [mysql, sql]
published: true
---

# MySQL

[MySQL](https://www.mysql.com) is the world's most popular open source database.

> [zh_CN](http://c.biancheng.net/cpp/html/1456.html)


# Data Type

Data Type Rules:

1. The smaller, the better

2. As simple as possible

3. Avoid use NULL


# Index

The max limit number of mysql index is —— **16**

## Index not work case

- ```!=``` or ```<>```

- use fun();

- JOIN, only use index when primary key has the same type with foreign key;

- LIKE, REGEX only use index when first char is not wildcard.

```sql
like '%abc'   ×
like 'abc%'   √
```

- ORDER BY: only use when the where condition is not a expression. It's not works well when has multi-table.

- index not works well when one column has many the same value, like (0/1), (y/n)

## Full-Text index

> [full-text](http://www.cnblogs.com/mguo/archive/2013/04/16/3023610.html)

The most time consuming sql may like this:

```sql
SELECT * FROM `table_name` WHERE `column_name` LIKE '%word%'
```

- create full-text

```sql
CREATE TABLE full_text(
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '名称',
  `info` VARCHAR(128) NULL DEFAULT '' COMMENT '信息',
  PRIMARY KEY (`id`),
  FULLTEXT (`name`, `info`) COMMENT '添加全文索引'
) COMMENT = '全文检索' ENGINE = MyISAM;

INSERT INTO full_text (name, info) VALUES
  ('mark the word', 'you can mark the word'),
  ('kill the word', 'you can kill the word'),
  ('like the word', 'you can like the word'),
  ('miss the word', 'you can miss the word'),
  ('think the word', 'you can think the word');
```

- query

```
SELECT * FROM full_text WHERE MATCH(`name`, `info`) AGAINST ('think like mark') > 0.0001;
SELECT * FROM full_text WHERE MATCH(`name`, `info`) AGAINST ('you word miss') > 0.0001;
```


# Stored Procedure & Trigger (5.0+)

> Stored Procedure

- define

```sql
DROP FUNCTION IF EXISTS shortLen;

CREATE FUNCTION shortLen(s VARCHAR(255), n INT)
  RETURNS VARCHAR(255)
  BEGIN
    IF ISNULL(s)
    THEN
      RETURN '';
    ELSEIF n < 15
      THEN
        RETURN LEFT(s, n);
    ELSE
      IF CHAR_LENGTH(s) <= n
      THEN
        RETURN s;
      ELSE
        RETURN CONCAT(LEFT(s, n - 10), '...', RIGHT(s, 5));
      END IF;
    END IF;
  END;
```

- use

```sql
SELECT shortLen('asdfasdfasdfasdfasfdasdgasdgfadghfgdhfgjghj', 15);
```

- result

```
asdfa...gjghj
```

- show functions

```sql
SHOW FUNCTION STATUS;

SHOW CREATE FUNCTION shortLen;
```


# 自连接查询

```
$   vi ~/.base_profile

alias mysql=/usr/local/mysql/bin/mysql

$   source ~/.base_profile
```

- Create table

```sql
DROP TABLE IF EXISTS `t_score`;
CREATE TABLE `t_score`(
  id BIGINT(20) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
  score INT(11) NOT NULL DEFAULT 0,
  student_id BIGINT(20) NOT NULL,
  type INT(11) NOT NULL COMMENT '类型, 0->语文, 1->数学'
) COMMENT '分数表';

INSERT INTO t_score (score, student_id, type) VALUES
  (50, 1, 0),
  (60, 1, 1),
  (78, 2, 0),
  (99, 2, 1)
;
```

- Query all

```
mysql> SELECT * FROM t_score;
+----+-------+------------+------+
| id | score | student_id | type |
+----+-------+------------+------+
|  1 |    50 |          1 |    0 |
|  2 |    60 |          1 |    1 |
|  3 |    78 |          2 |    0 |
|  4 |    99 |          2 |    1 |
+----+-------+------------+------+
4 rows in set (0.00 sec)
```

- Query student's math and chinese score

```
mysql> SELECT cs.score, ms.score, cs.student_id
    -> FROM t_score AS cs, t_score AS ms
    -> WHERE cs.student_id=ms.student_id
    -> AND cs.type=0 AND ms.type=1;
+-------+-------+------------+
| score | score | student_id |
+-------+-------+------------+
|    50 |    60 |          1 |
|    78 |    99 |          2 |
+-------+-------+------------+
2 rows in set (0.00 sec)
```


# 并发控制

> 读写锁

- 读锁

共享锁, 多个客户之间读取资源互不干扰。

- 写锁

排他锁, 会阻塞其他的读锁和写锁。

> 锁粒度

- Table Lock

消耗最小。一个用户进行更新、删除、创建时,获取写锁,阻塞其他用户的读写。无写锁时,读锁互不影响。

- Row Lock

最大程度支持并发。开销较大。


> Transaction

- Create table for test

```mysql
CREATE TABLE `t_test`(
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `info` VARCHAR(100) DEFAULT NULL,
  `create_time` TIMESTAMP NULL DEFAULT NULL
) COMMENT 'test table';
```

- Begin transaction

```
START TRANSACTION | BEGIN [WORK]
    COMMIT [WORK] [AND [NO] CHAIN] [[NO] RELEASE]
    ROLLBACK [WORK] [AND [NO] CHAIN] [[NO] RELEASE]
    SET AUTOCOMMIT = {0 | 1}
```


<table class="table table-bordered table-hover text-left">
    <tr><th>session_1</th><th>session_2</th></tr>
    <tr>
        <td>
            start transaction;
            Query OK, 0 rows affected (0.00 sec)
        </td>
        <td></td>
    </tr>
    <tr>
        <td>
            insert into t_test (info, create_time) VALUES ('1 insert', NOW());
            Query OK, 1 row affected (0.00 sec)
        </td>
        <td></td>
    </tr>
    <tr>
        <td>
        </td>
        <td>
            select * from t_test;
            Empty set (0.00 sec)
        </td>
    </tr>
    <tr>
        <td>
            commit;
            Query OK, 0 rows affected (0.00 sec)
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td>
            mysql> select * from t_test;    <br/>
              +----+----------+---------------------+<br/>
              | id | info     | create_time         |<br/>
              +----+----------+---------------------+<br/>
              |  1 | 1 insert | 2016-10-17 22:59:05 |<br/>
              +----+----------+---------------------+<br/>
              1 row in set (0.00 sec)|
        </td>
    </tr>
</table>

**事务**是一组原子性的SQL查询,内部的操作,要么**全部成功,要么全部失败**。

- Atomicity

不可再分

- Consistency

从一种一致性状态到另一种一致性状态

- Isolation

事务在最终提交之前,所有的修改操作对其他事务都是不可见的

- Durability

事务一旦提交,修改将会在数据库持久生效

> Isolation level

| Isolation Level  |   dirty read       | non-repeatable read  |    phantom read      |   add lock read |
| :--------------- |:---------------:   | :---------------:    |    :---------------: |:---------------:|
| uncommitted read |     yes            |     yes              |       yes            | no              |
|   committed read |     no             |     yes              |       yes            | no              |
|  repeatable read |     no             |     no               |       yes            | no              |
|     serializable |     no             |     no               |       no             | yes             |


> Dead Lock

当两个或者两个以上事务在同一资源上相互占用,并请求锁定占用对方的资源,会造成死锁。

如 Innodb 引擎,会检测死锁,并立刻返回错误。

# Config MySQL

- 降低初始化占用内存

- Edit ```my.cnf``` file in ```/etc/mysql```


```
performance_schema_max_table_instances=600
table_definition_cache=400
table_open_cache=256
```

- timestamp

```sql
CREATE TABLE test(
`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
COMMENT '创建时，默认为系统当前时间。以后不再刷新',

`update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
COMMENT '创建/修改时刷新时间，同TIMESTAMP'
)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='test';
```

# MySQL Remote Connection

- Link to localhost

```
$   mysql -h localhost -u root -p
```

- Link to remote

```
houbinbindeMacBook-Pro:~ houbinbin$ mysql -h remote -uroot -p
Enter password:
ERROR 2003 (HY000): Can't connect to MySQL server on 'remote' (61)
```

## make remote access enable


- Login Remote MySQL

```
mysql> use mysql;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> select Host,User from user;
+-------------------------+------------------+
| Host                    | User             |
+-------------------------+------------------+
| 127.0.0.1               | root             |
| ::1                     | root             |
| izuf60ahcky4k4nfv470juz | root             |
| localhost               | debian-sys-maint |
| localhost               | root             |
+-------------------------+------------------+
5 rows in set (0.00 sec)
```

- Update `mysql`.`user`

run this sql:

```
UPDATE `user` SET Host='%' WHERE User ='root' LIMIT 1;

Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

after update:

```
mysql> select Host,User from user;
+-------------------------+------------------+
| Host                    | User             |
+-------------------------+------------------+
| %                       | root             |
| 127.0.0.1               | root             |
| ::1                     | root             |
| izuf60ahcky4k4nfv470juz | root             |
| localhost               | debian-sys-maint |
+-------------------------+------------------+
5 rows in set (0.00 sec)
```

use ```flush privileges;``` to flush.

- Edit ```my.cnf``` file in ```/etc/mysql```

comment the line of **bind-address**

```
#
# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
# bind-address          = 127.0.0.1
```

use command to restart mysql

```
root@iZuf60ahcky4k4nfv470juZ:~# service mysql restart
mysql stop/waiting
mysql start/running, process 2493
```


## table name sensitive

Table name in ubuntu is **case-sensitive**, so. If you want it works like in windows. Just:

add the content under ```[mysqld]```, and restart mysql.

```
vi /etc/mysql/my.cnf

lower_case_table_names = 1
```

and then use ```show variables like 'lower_%'``` test it:

```
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_file_system | OFF   |
| lower_case_table_names | 1     |
+------------------------+-------+
```


# mysql开启日志功能

- 查看是否开启

```
mysql> show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | OFF   |
+---------------+-------+
1 row in set (0.00 sec)
```

- 查看当前日志

```
mysql> show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | OFF   |
+---------------+-------+
1 row in set (0.00 sec)

mysql> show master status;
Empty set (0.00 sec)
```

- 编辑配置文件 ```my.cnf```

```
vi /etc/mysql/my.cnf
```

开启日志:

```
log-bin = /var/mysqllog/logbin.log
```

- 查看状态

```
service mysql restart

mysql>  show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | ON    |
+---------------+-------+
1 row in set (0.00 sec)
mysql> show master status;
+------------------+----------+--------------+------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+----------+--------------+------------------+
| mysql-bin.000001 |      107 |              |                  |
+------------------+----------+--------------+------------------+
1 row in set (0.00 sec)
```


# 备份还原

1、备份一个数据库

mysqldump基本语法：

```
mysqldump -u username -p dbname table1 table2 ...-> BackupName.sql
```

其中：
dbname参数表示数据库的名称；
table1和table2参数表示需要备份的表的名称，为空则整个数据库备份；
```BackupName.sql``` 参数表设计备份文件的名称，文件名前面可以加上一个绝对路径。通常将数据库被分成一个后缀名为sql的文件；


如:

```
mysqldump -u root -p blog_view  > /root/backup/blog_view.sql;
```


- 备份多个数据库

```
mysqldump -u username -p --databases dbname2 dbname2 > Backup.sql
```

- 备份所有数据库

```
mysqldump -u username -p --all-databases > BackupName.sql
```



2、还原一个数据库

```
mysql -u root -p [dbname] < backup.sq
```


> 定时备份

- 创建定时备份脚本:

```
vi backup_blog_view.sh
```

- 添加内容如下:

```
#!/bin/bash
mysqldump -uroot -p123456 blog_view > /root/backup/blog_view_$(date +%Y%m%d_%H%M%S).sql
```

- 进行备份压缩:

```
#!/bin/bash
mysqldump -uroot -p123456 blog_view | gzip > /root/backup/blog_view_$(date +%Y%m%d_%H%M%S).sql.gz
```

- 添加权限,执行测试:

```
chmod +x backup_blog_view.sh
./backup_blog_view.sh
```

- 定时运行

ubuntu 下使用 crontab
```
$   ~# crontab -e
```

添加内容如下:

```
0 2 * * * /root/shell/backup_blog_view.sh
```

意思为凌晨2点执行备份脚本。

- 重启 CRON 进程:

```
~# /etc/init.d/cron restart
```


# Dead lock

1. mysql 更新,根据普通索引。会首先锁定*普通索引*, 在锁定*主索引*
2. mysql 根据主键更新会直接锁定*主索引*

二者同时使用,会造成锁争用——死锁。

最佳实践:

每次更新或者删除,根据索引条件查询出记录。再根据主键进行删除或更新。


# 备份实战

切换至root.

Ubuntu14.04 默认mysql```5.5.53```,现在将其升级到 ```5.6```

> Prepare

- reboot

```
$   sudo reboot
```

- backup

```
$ pwd
/home/hbb/backup

$ mysqldump -uroot -p123456 --all-databases > backup_all_20170101.sql
```

- stop mysql

```
$   sudo /etc/init.d/mysql stop
```


remove mysql

```
apt-get remove mysql-server
apt-get --purge remove mysql-server
apt-get autoremove
```

- update and upgrade apt-get

```
apt-get update
apt-get upgrade
```
upgrade会更新很多东西,可以跳过不执行。

- install mysql-server-5.6

```
apt-get install mysql-server-5.6
```

- re-back

```
mysql -uroot -p123456 < backup_all_20170101.sql
```

- version

```
$ mysql --version;
mysql  Ver 14.14 Distrib 5.6.33, for debian-linux-gnu (x86_64) using  EditLine wrapperv
```

* any list
{:toc}
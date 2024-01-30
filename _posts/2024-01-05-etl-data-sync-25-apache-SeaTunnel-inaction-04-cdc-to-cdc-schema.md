---
layout: post
title: ETL-25-apache SeaTunnel 实战 source mysql CDC 到 sink jdbc Schema Evolution 表结构变更同步
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[ETL-10-apache SeaTunnel Connector v2 source mysql cdc](https://houbb.github.io/2024/01/05/etl-data-sync-10-apache-SeaTunnel-connector-v2-source-mysql-cdc)

[mysql binlog](https://houbb.github.io/2021/08/29/mysql-binlog)

# 说明 

v2.3.3 支持 Schema evolution

关于 CDC 方面的重要更新，是在架构层面支持了 Schema evolution（DDL 变更同步），这是从架构层面对 DDL 变更事件进行了抽象，包括 Source 和 Sink 中相关接口的添加。

另外，我们在 Zeta 引擎中添加了 DDL 变更事件与checkpoint 相关的处理流程。

至此，在架构层面，SeaTunnel 已经满足了支持 DDL 变更同步的所有前提条件，后续就是不同的连接器实现相应的接口，进行 DDL 变更同步的适配工作。


## 基础能力更新
在做 CDC 多表同步的场景下，之前目标表无法自动创建，需要用户手工在目标端创建好表之后才能进行同步。

在本次更新中，添加了 JDBC Sink 自动建表的功能，JDBC Sink 将根据上游传递过来的 catalogtable 自动生成创建表的DDL 语句，并在目标数据库进行建表。

注意，很多数据库都可以使用 JDBC Sink 连接器，但并不是所有数据库都已经实现了自动建表，本次更新目标端支持自动建表的数据库有 MySQL, Oracle, Postgres, SQLServer。

另外，使用自动建表对 Source Connector 也有要求，Source 连接器必须实现了 Catalog，本次更新中只有 CDC Source 实现了 Catalog，所以自动建表功能只有在 CDC Source 同步到 MySQL/Oracle/Postgres/SQLServer，并且是在多表同步模式下才能生效。

## Zeta 引擎更新

支持 Schema evolution（DDL变更同步）。

Rest API 添加了提交作业的 API，用户可以使用 Rest API 进行作业的提交。

这对于那些自研开发了页面集成 SeaTunnel 的用户来说非常重要，这意味着他们不再需要单独为提交作业安装 SeaTunnel Client。

下一篇可以试下基于 api 的功能提交之类的。

## 验证原因

不过这一点，官方文档好像没有说的非常仔细。

验证一下，数据同步具体支持到哪一步？

# 准备

> [mysql binlog windows10 环境的开启和解析笔记](https://houbb.github.io/2021/08/29/mysql-binlog)

> [database mysql install on windows10 WSL](https://houbb.github.io/2024/01/05/etl-data-sync-mysql-install-wsl-intro)

这里我们定义一个拥有 binlog 权限的账户；

```sql
CREATE USER 'admin'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
flush privileges;
```

确认开启了 binlog

```sql
mysql> show variables where variable_name in ('log_bin', 'binlog_format', 'binlog_row_image', 'gtid_mode', 'enforce_gtid_consistency');
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| binlog_format            | ROW   |
| binlog_row_image         | FULL  |
| enforce_gtid_consistency | ON    |
| gtid_mode                | ON    |
| log_bin                  | ON    |
+--------------------------+-------+
5 rows in set, 1 warning (0.00 sec)
```

## 初始化表

我们模拟从源头库迁移到目标库。

```sql
create database cdc;
use cdc;

drop table if exists user_info;
create table user_info
(
    id int unsigned auto_increment comment '主键' primary key,
    username varchar(128) not null comment '用户名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '用户表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;

drop table if exists role_info;
create table role_info
(
    id int unsigned auto_increment comment '主键' primary key,
    role_name varchar(128) not null comment '角色名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '角色表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
```

### data

```sql
truncate table user_info;

insert into user_info (username) values ('u1');
insert into user_info (username) values ('u2');
insert into user_info (username) values ('u3');
insert into user_info (username) values ('u4');


truncate table role_info;
insert into role_info (role_name) values ('r1');
insert into role_info (role_name) values ('r2');
insert into role_info (role_name) values ('r3');
insert into role_info (role_name) values ('r4');
```

test: 

```
mysql> select * from user_info;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  2 | u2       | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  3 | u3       | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  4 | u4       | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
+----+----------+---------------------+---------------------+

mysql> select * from role_info;
+----+-----------+---------------------+---------------------+
| id | role_name | create_time         | update_time         |
+----+-----------+---------------------+---------------------+
|  1 | r1        | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  2 | r2        | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  3 | r3        | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  4 | r4        | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
+----+-----------+---------------------+---------------------+
```

提了对应的需求：https://github.com/apache/seatunnel/issues/6302

# 实际测试

## 依赖包

```xml
<!--        添加测试 connector-->
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>connector-jdbc</artifactId>
    <version>${project.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>connector-cdc-mysql</artifactId>
    <version>${project.version}</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.27</version>
</dependency>
```

## 配置例子

- cdc_schema_v1.conf

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://localhost:3306/migrate_source?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["migrate_source.user_info"]

        startup.mode = "initial"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    jdbc {
        url = "jdbc:mysql://localhost:3306/migrate_target?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "admin"
        password = "123456"
        database = "migrate_target"
        table = "user_info_bak"
        generate_sink_sql = true
        support_upsert_by_query_primary_key_exist = true
        primary_keys = ["id"]
    }

}
```

## 初始化效果

```sql
mysql> use migrate_target;
Database changed
mysql> select * from user_info_bak;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  2 | u2       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  3 | u3       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
|  4 | u4       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
+----+----------+---------------------+---------------------+
4 rows in set (0.00 sec)
```

非常的方便！

## 增量效果

我们分别测试一下增加/修改/删除

### 增加

source:

```
mysql> use migrate_source;
Database changed
mysql>
mysql>
mysql> insert into user_info(username) values ('u5');
Query OK, 1 row affected (0.00 sec)
```

target:

```
mysql> select * from user_info_bak;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  2 | u2       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  3 | u3       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
|  4 | u4       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
|  5 | u5       | 2024-01-27 14:54:29 | 2024-01-27 14:54:29 |
+----+----------+---------------------+---------------------+
5 rows in set (0.00 sec)
```

### 修改

source:

```sql
update user_info  set username='u5-edit' where id=5;
```

target:

```
mysql> select * from user_info_bak;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  2 | u2       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  3 | u3       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
|  4 | u4       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
|  5 | u5-edit  | 2024-01-27 14:54:29 | 2024-01-27 14:56:26 |
+----+----------+---------------------+---------------------+
5 rows in set (0.00 sec)
```

### 删除

source:

```sql
delete from user_info where id=5;
```

target:

```sql
mysql> select * from user_info_bak;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  2 | u2       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  3 | u3       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
|  4 | u4       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
+----+----------+---------------------+---------------------+
```

# TODO

下一步可以学习一下对应的源码实现，自己实现一个类似的 neo4j 插件。

# 小结

还是要注意看一下文档，学习一下别人的设计。

不要闭门造车。

* any list
{:toc}
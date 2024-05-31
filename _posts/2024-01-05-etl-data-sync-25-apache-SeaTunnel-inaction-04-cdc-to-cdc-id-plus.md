---
layout: post
title: ETL-25-apache SeaTunnel 实战 source mysql CDC 到 sink jdbc id 增加
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---


# 拓展阅读

[ETL-10-apache SeaTunnel Connector v2 source mysql cdc](https://houbb.github.io/2024/01/05/etl-data-sync-10-apache-SeaTunnel-connector-v2-source-mysql-cdc)

[mysql binlog](https://houbb.github.io/2021/08/29/mysql-binlog)

# 说明 

mysql cdc source 生成的信息还算比较复杂，开始还以为需要自己写各种 jdbc sink 的语句。

结果发现，jdbc 提供了一个自动生成 sink sql 的语句，非常的方便。

本文主要来验证一下。

## 准备

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

### 源头库

```sql
create database migrate_source;
use migrate_source;

drop table if exists user_info;
create table user_info
(
    id int unsigned auto_increment comment '主键' primary key,
    username varchar(128) not null comment '用户名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '用户表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
```

插入语句

```sql
truncate table user_info;

insert into user_info (username) values ('u1');
insert into user_info (username) values ('u2');
insert into user_info (username) values ('u3');
insert into user_info (username) values ('u4');
```

确认：

```
mysql> select * from user_info;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  2 | u2       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  3 | u3       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
|  4 | u4       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
+----+----------+---------------------+---------------------+
```

### 目标

```sql
create database migrate_target;
use migrate_target;

drop table if exists user_info;
 CREATE TABLE "user_info" (
  "id" int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  "username" varchar(128) NOT NULL COMMENT '用户名',
  "source" varchar(64) NOT NULL DEFAULT '' COMMENT '数据来源',
  "create_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  "update_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 要求

我们希望同步时，把原始的 id+9999，同时默认 source 指定一个值，比如 test。

如何实现呢？

1）source 选择 mysql-cdc

2) transfer 选择 sql

3) sink 选择 jdbc

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

<!--   seatunnel-transforms-v2   -->
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>seatunnel-transforms-v2</artifactId>
    <version>${project.version}</version>
</dependency>
```

## 配置例子

```conf
# Defining the runtime environment
env {
  parallelism = 1
  job.mode = "STREAMING"
  checkpoint.interval = 10000
}

source {
    MySQL-CDC {
        category = {
            factory = MySQL
        }
        base-url = "jdbc:mysql://localhost:3306/migrate_source?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["migrate_source.user_info"]
        startup.mode = "initial"
        result_table_name = "cdc_user_info"  # 添加 result_table_name
    }
}

transform {
    Sql {
        source_table_name = ["cdc_user_info"]  # 配置为列表格式
        result_table_name = "transformed_user_info"
        query = "SELECT id+9999 AS id, username, 'test' AS source, create_time, update_time FROM cdc_user_info"
    }
}

sink {
    jdbc {
        source_table_name = ["transformed_user_info"]  # 配置为列表格式
        url = "jdbc:mysql://localhost:3306/migrate_target?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "admin"
        password = "123456"
        database = "migrate_target"
        generate_sink_sql = true

        #table = "user_info"
        #support_upsert_by_query_primary_key_exist = true
        #primary_keys = ["id"]
    }
}
```

## 初始化效果

```sql
mysql> select * from user_info;
+-------+----------+--------+---------------------+---------------------+
| id    | username | source | create_time         | update_time         |
+-------+----------+--------+---------------------+---------------------+
| 10000 | u1       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10001 | u2       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10002 | u3       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10003 | u4       | test   | 2024-05-31 10:17:06 | 2024-05-31 10:17:06 |
+-------+----------+--------+---------------------+---------------------+
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
use migrate_target;
mysql> select * from user_info;
mysql> select * from user_info;
+-------+----------+--------+---------------------+---------------------+
| id    | username | source | create_time         | update_time         |
+-------+----------+--------+---------------------+---------------------+
| 10000 | u1       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10001 | u2       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10002 | u3       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10003 | u4       | test   | 2024-05-31 10:17:06 | 2024-05-31 10:17:06 |
| 10004 | u5       | test   | 2024-05-31 15:08:53 | 2024-05-31 15:08:53 |
+-------+----------+--------+---------------------+---------------------+
5 rows in set (0.00 sec)
```

### 修改

source:

```sql
update user_info  set username='u5-edit' where id=5;
```

target:

```
mysql> select * from user_info;
+-------+----------+--------+---------------------+---------------------+
| id    | username | source | create_time         | update_time         |
+-------+----------+--------+---------------------+---------------------+
| 10000 | u1       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10001 | u2       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10002 | u3       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10003 | u4       | test   | 2024-05-31 10:17:06 | 2024-05-31 10:17:06 |
| 10004 | u5-edit  | test   | 2024-05-31 15:08:53 | 2024-05-31 15:12:02 |
+-------+----------+--------+---------------------+---------------------+
5 rows in set (0.00 sec)
```

### 删除

source:

```sql
delete from user_info where id=5;
```

target:

```sql
mysql> select * from user_info;
+-------+----------+--------+---------------------+---------------------+
| id    | username | source | create_time         | update_time         |
+-------+----------+--------+---------------------+---------------------+
| 10000 | u1       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10001 | u2       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10002 | u3       | test   | 2024-05-31 10:17:05 | 2024-05-31 10:17:05 |
| 10003 | u4       | test   | 2024-05-31 10:17:06 | 2024-05-31 10:17:06 |
+-------+----------+--------+---------------------+---------------------+
4 rows in set (0.00 sec)
```

# 多张表的话呢？

## 说明

我们前面只有 1 张表。

### 源头库

```sql
create database migrate_source;
use migrate_source;

drop table if exists user_info;
create table user_info
(
    id int unsigned auto_increment comment '主键' primary key,
    username varchar(128) not null comment '用户名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '用户表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
```

插入语句

```sql
truncate table user_info;

insert into user_info (username) values ('u1');
insert into user_info (username) values ('u2');
insert into user_info (username) values ('u3');
insert into user_info (username) values ('u4');
```

确认：

```
mysql> select * from user_info;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  2 | u2       | 2024-01-27 14:51:39 | 2024-01-27 14:51:39 |
|  3 | u3       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
|  4 | u4       | 2024-01-27 14:51:40 | 2024-01-27 14:51:40 |
+----+----------+---------------------+---------------------+
```

### 目标

```sql
create database migrate_target;
use migrate_target;

drop table if exists user_info;
 CREATE TABLE "user_info" (
  "id" int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  "username" varchar(128) NOT NULL COMMENT '用户名',
  "source" varchar(64) NOT NULL DEFAULT '' COMMENT '数据来源',
  "create_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  "update_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```





# TODO

下一步可以学习一下对应的源码实现，自己实现一个类似的 neo4j 插件。

# 小结

还是要注意看一下文档，学习一下别人的设计。

不要闭门造车。

* any list
{:toc}
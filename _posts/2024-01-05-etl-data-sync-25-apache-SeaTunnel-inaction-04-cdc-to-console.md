---
layout: post
title: ETL-25-apache SeaTunnel 实战 source mysql CDC 到 sink console
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

这里主要记录一下 cdc 对应的 seatunnel row 内容到底是什么？

主要方便对应的 neo4j 等插件编写，打下基础。

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
|  1 | u1       | 2024-01-29 09:12:31 | 2024-01-29 09:12:31 |
|  2 | u2       | 2024-01-29 09:12:31 | 2024-01-29 09:12:31 |
|  3 | u3       | 2024-01-29 09:12:31 | 2024-01-29 09:12:31 |
|  4 | u4       | 2024-01-29 09:12:31 | 2024-01-29 09:12:31 |
+----+----------+---------------------+---------------------+
```

### 目标

写入到 console 控台，这里实现一个最简单的 console 控台输出。

下面是自定义的 consoleBinglog sink 实现。

```java
public void write(SeaTunnelRow element) {
    Date date = new Date();
    String dateStr = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").format(date);
    try {
        TimeUnit.MILLISECONDS.sleep(1);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
    log.info("ConsoleBinlogSinkWriter ================= " + dateStr + " >>>>>>>>>>> " + element.toString());

    // 写入文件，便于查看
    final String targetPath = "D:\\_my\\seatunnel-2.3.3-release-slim\\seatunnel-examples\\seatunnel-engine-examples\\src\\main\\resources\\sink\\cdclogs.txt";
    FileUtil.append(targetPath, dateStr + " ~~~~~~~~~~~~ " + element.toString());
}
```




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

<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>connector-consolebinlog</artifactId>
    <version>${project.version}</version>
</dependency>
```

## 配置例子

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
    ConsoleBinlog {
    }

}
```

## 测试效果

### rowKind 的枚举

各种类别：

```java
public enum RowKind {
    // Note: Enums have no stable hash code across different JVMs, use toByteValue() for
    // this purpose.

    /** Insertion operation. */
    INSERT("+I", (byte) 0),

    /**
     * Update operation with the previous content of the updated row.
     *
     * <p>This kind SHOULD occur together with {@link #UPDATE_AFTER} for modelling an update that
     * needs to retract the previous row first. It is useful in cases of a non-idempotent update,
     * i.e., an update of a row that is not uniquely identifiable by a key.
     */
    UPDATE_BEFORE("-U", (byte) 1),

    /**
     * Update operation with new content of the updated row.
     *
     * <p>This kind CAN occur together with {@link #UPDATE_BEFORE} for modelling an update that
     * needs to retract the previous row first. OR it describes an idempotent update, i.e., an
     * update of a row that is uniquely identifiable by a key.
     */
    UPDATE_AFTER("+U", (byte) 2),

    /** Deletion operation. */
    DELETE("-D", (byte) 3);

}
```

### 初始化效果

首先是初始化效果：

```
2024-01-29 09:36:27.099 ~~~~~~~~~~~~ SeaTunnelRow{tableId=migrate_source.user_info, kind=+I, fields=[1, u1, 2024-01-29T09:12:31, 2024-01-29T09:12:31]}
2024-01-29 09:36:27.108 ~~~~~~~~~~~~ SeaTunnelRow{tableId=migrate_source.user_info, kind=+I, fields=[2, u2, 2024-01-29T09:12:31, 2024-01-29T09:12:31]}
2024-01-29 09:36:27.109 ~~~~~~~~~~~~ SeaTunnelRow{tableId=migrate_source.user_info, kind=+I, fields=[3, u3, 2024-01-29T09:12:31, 2024-01-29T09:12:31]}
2024-01-29 09:36:27.111 ~~~~~~~~~~~~ SeaTunnelRow{tableId=migrate_source.user_info, kind=+I, fields=[4, u4, 2024-01-29T09:12:31, 2024-01-29T09:12:31]}
```

这里是初始化的 4 条数据，对应的全量 snapshot 信息。

下面我们测试一下增量操作。

### 增加

我们分别测试一下增加/修改/删除

source:

```sql
mysql> use migrate_source;
mysql> insert into user_info(username) values ('u5');
Query OK, 1 row affected (0.00 sec)
```

target:

```
2024-01-29 09:39:41.158 ~~~~~~~~~~~~ SeaTunnelRow{tableId=migrate_source.user_info, kind=+I, fields=[5, u5, 2024-01-29T09:39:40, 2024-01-29T09:39:40]}
```

### 修改

source:

```sql
update user_info  set username='u5-edit' where id=5;
```

target:

```
2024-01-29 09:40:05.762 ~~~~~~~~~~~~ SeaTunnelRow{tableId=migrate_source.user_info, kind=-U, fields=[5, u5, 2024-01-29T09:39:40, 2024-01-29T09:39:40]}
2024-01-29 09:40:05.778 ~~~~~~~~~~~~ SeaTunnelRow{tableId=migrate_source.user_info, kind=+U, fields=[5, u5-edit, 2024-01-29T09:39:40, 2024-01-29T09:40:05]}
```

这里会有 2 条数据，一个更新前，一个更新后。

### 删除

source:

```sql
delete from user_info where id=5;
```

target:

```sql
2024-01-29 09:40:51.763 ~~~~~~~~~~~~ SeaTunnelRow{tableId=migrate_source.user_info, kind=-D, fields=[5, u5-edit, 2024-01-29T09:39:40, 2024-01-29T09:40:05]}
```

kind= '-D' 对应删除操作。

发现这个数据还是非常简洁的。

其实可以直接根据，加上 kind 进行处理。

# TODO

下一步可以学习一下对应的源码实现，自己实现一个类似的 neo4j 插件。

主要学习一下 cdc 的 sink

其中有一个自动生成语句，原理就是首先去数据库查询表的结构数据，然后自动生成对应的 SQL 脚本。

这种方式也挺不错，也可以让编写的脚本非常简洁。类似 mybatis-plus 动态生成 sql

也可以自动生成语句，然后写入到同步的 conf 文件，类似于 mybatis generator。

# 小结

还是要注意看一下文档，学习一下别人的设计。

不要闭门造车。

* any list
{:toc}
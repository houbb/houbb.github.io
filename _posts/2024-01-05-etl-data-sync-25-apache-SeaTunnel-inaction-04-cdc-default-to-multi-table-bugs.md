---
layout: post
title: ETL-25-apache SeaTunnel 实战 mysql CDC default to file 指定多表的 BUG？
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[ETL-10-apache SeaTunnel Connector v2 source mysql cdc](https://houbb.github.io/2024/01/05/etl-data-sync-10-apache-SeaTunnel-connector-v2-source-mysql-cdc)

[mysql binlog](https://houbb.github.io/2021/08/29/mysql-binlog)

# BUGS 

Apache seatunnel version：v2.3.3

Mysql version: 5.7.31-log

BUG: mysql cdc table-names config one table, works fine. But config multi tables, meets org.apache.kafka.connect.errors.DataException: xxx is not a valid field name（mysql cdc 当 table-names 指定监听多张表的时候，examples 本地测试直接失败。只指定一张表的时候，不存在问题）

Run Mode: local seatunnel-examples run config file directly.

Ask: How to fix this problem? I think mysql-cdc should support config multi-tables in one config.

## config file

For simple, sink is console.

- mysql_cdc_to_console.conf

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "merge_cdc.user_info-STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:13306/cdc?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["cdc.user_info", "cdc.role_info"]

        startup.mode = "initial"
        result_table_name="merge_cdc.user_info"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    Console {
    }
}
```

## exception logs

```
2024-01-29 18:00:26,226 ERROR org.apache.seatunnel.core.starter.SeaTunnel - 
===============================================================================



Exception in thread "main" org.apache.seatunnel.core.starter.exception.CommandExecuteException: SeaTunnel job executed failed
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:191)
	at org.apache.seatunnel.core.starter.SeaTunnel.run(SeaTunnel.java:40)
	at org.apache.seatunnel.example.engine.cdc.MysqlCdcDefaultToLocalFileMultiTablesExample.main(MysqlCdcDefaultToLocalFileMultiTablesExample.java:44)
Caused by: org.apache.seatunnel.engine.common.exception.SeaTunnelEngineException: org.apache.kafka.connect.errors.DataException: username is not a valid field name
	at org.apache.kafka.connect.data.Struct.lookupField(Struct.java:254)
	at org.apache.kafka.connect.data.Struct.get(Struct.java:74)
	at org.apache.seatunnel.connectors.cdc.debezium.row.SeaTunnelRowDebeziumDeserializationConverters.convert(SeaTunnelRowDebeziumDeserializationConverters.java:84)
	at org.apache.seatunnel.connectors.cdc.debezium.row.SeaTunnelRowDebeziumDeserializeSchema.extractAfterRow(SeaTunnelRowDebeziumDeserializeSchema.java:209)
	at org.apache.seatunnel.connectors.cdc.debezium.row.SeaTunnelRowDebeziumDeserializeSchema.deserializeDataChangeRecord(SeaTunnelRowDebeziumDeserializeSchema.java:178)
	at org.apache.seatunnel.connectors.cdc.debezium.row.SeaTunnelRowDebeziumDeserializeSchema.deserialize(SeaTunnelRowDebeziumDeserializeSchema.java:110)
	at org.apache.seatunnel.connectors.cdc.base.source.reader.IncrementalSourceRecordEmitter.emitElement(IncrementalSourceRecordEmitter.java:155)
	at org.apache.seatunnel.connectors.cdc.base.source.reader.IncrementalSourceRecordEmitter.processElement(IncrementalSourceRecordEmitter.java:130)
	at org.apache.seatunnel.connectors.cdc.base.source.reader.IncrementalSourceRecordEmitter.emitRecord(IncrementalSourceRecordEmitter.java:89)
	at org.apache.seatunnel.connectors.cdc.base.source.reader.IncrementalSourceRecordEmitter.emitRecord(IncrementalSourceRecordEmitter.java:55)
	at org.apache.seatunnel.connectors.seatunnel.common.source.reader.SourceReaderBase.pollNext(SourceReaderBase.java:108)
	at org.apache.seatunnel.connectors.cdc.base.source.reader.IncrementalSourceReader.pollNext(IncrementalSourceReader.java:98)
	at org.apache.seatunnel.engine.server.task.flow.SourceFlowLifeCycle.collect(SourceFlowLifeCycle.java:150)
	at org.apache.seatunnel.engine.server.task.SourceSeaTunnelTask.collect(SourceSeaTunnelTask.java:95)
	at org.apache.seatunnel.engine.server.task.SeaTunnelTask.stateProcess(SeaTunnelTask.java:168)
	at org.apache.seatunnel.engine.server.task.SourceSeaTunnelTask.call(SourceSeaTunnelTask.java:100)
	at org.apache.seatunnel.engine.server.TaskExecutionService$BlockingWorker.run(TaskExecutionService.java:613)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at java.util.concurrent.FutureTask.run$$$capture(FutureTask.java:266)
	at java.util.concurrent.FutureTask.run(FutureTask.java)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:750)

	at org.apache.seatunnel.engine.client.job.ClientJobProxy.waitForJobComplete(ClientJobProxy.java:122)
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:184)
	... 2 more
```

## local debug

local debug，found the database metadata is mismatch with data.

![test](https://img-blog.csdnimg.cn/direct/1a9d1f4d7d9441caa48c2c79969a9e29.png#pic_center)

# parpare info

## admin user

```sql
CREATE USER 'admin'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
flush privileges;
```

## enable binlog

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



## init tables

### tables

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


# 本地启动

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --config mysql_cdc_to_console.conf -e local
```

# 问题解决

## 发现需要指定一下 catalog

发现需要指定一下下面的内容：

```
catalog = {
	factory = MySQL
}
```

但是这个重要的属性，在官方文档上并没有。

还是在另一个博客中找到的

> [全方位解读SeaTunnel MySQL CDC连接器：实现数据高效同步的强大工具](https://blog.csdn.net/DolphinScheduler/article/details/134855410)


```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "merge_cdc.user_info-STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        catalog = {
            factory = MySQL
        }
        base-url = "jdbc:mysql://127.0.0.1:3306/cdc?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["cdc.user_info", "cdc.role_info"]

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


对应的文件内容：

```
2024-01-30 10:33:50.632 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.role_info, kind=+I, fields=[1, r1, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:50.659 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.role_info, kind=+I, fields=[2, r2, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.795 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.role_info, kind=+I, fields=[3, r3, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.811 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.role_info, kind=+I, fields=[4, r4, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.827 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.user_info, kind=+I, fields=[1, u1, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.843 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.user_info, kind=+I, fields=[2, u2, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.864 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.user_info, kind=+I, fields=[3, u3, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.879 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.user_info, kind=+I, fields=[4, u4, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
```

发现这里有对应的 tableId 信息。

那如果想写入到对应的 jdbc 表，应该怎么办呢？


# 多表的同步验证

## 根据 source

虽然官方并没有真正的看到 cdc 多表的完整例子。

但是上面的 console 内容输出为：

```
2024-01-30 10:33:50.632 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.role_info, kind=+I, fields=[1, r1, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:50.659 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.role_info, kind=+I, fields=[2, r2, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.795 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.role_info, kind=+I, fields=[3, r3, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.811 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.role_info, kind=+I, fields=[4, r4, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.827 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.user_info, kind=+I, fields=[1, u1, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.843 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.user_info, kind=+I, fields=[2, u2, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.864 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.user_info, kind=+I, fields=[3, u3, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
2024-01-30 10:33:57.879 ~~~~~~~~~~~~ SeaTunnelRow{tableId=cdc.user_info, kind=+I, fields=[4, u4, 2024-01-29T17:33:42, 2024-01-29T17:33:42]}
```

然后 jdbc + mysql 对应的 sink 看起来都是单表的？

## v1-不指定数据库+表的验证

### conf

看一下是否会自动对应？


```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "merge_cdc.user_info-STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        catalog = {
            factory = MySQL
        }
        base-url = "jdbc:mysql://127.0.0.1:3306/cdc?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["cdc.user_info", "cdc.role_info"]

        startup.mode = "initial"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    jdbc {
        database = "cdc_target"
        url = "jdbc:mysql://localhost:3306/cdc_target?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "admin"
        password = "123456"
        generate_sink_sql = true
    }
}
```

### step1: 不创建库+表

直接执行，会报错库不存在

```
Caused by: java.sql.SQLSyntaxErrorException: Unknown database 'cdc_target'
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:120)
	at com.mysql.cj.jdbc.exceptions.SQLExceptionsMapping.translateException(SQLExceptionsMapping.java:122)
	at com.mysql.cj.jdbc.ConnectionImpl.createNewIO(ConnectionImpl.java:828)
	at com.mysql.cj.jdbc.ConnectionImpl.<init>(ConnectionImpl.java:448)
	at com.mysql.cj.jdbc.ConnectionImpl.getInstance(ConnectionImpl.java:241)
	at com.mysql.cj.jdbc.NonRegisteringDriver.connect(NonRegisteringDriver.java:198)
	at org.apache.seatunnel.connectors.seatunnel.jdbc.internal.connection.SimpleJdbcConnectionProvider.getOrEstablishConnection(SimpleJdbcConnectionProvider.java:111)
	at org.apache.seatunnel.connectors.seatunnel.jdbc.internal.JdbcOutputFormat.open(JdbcOutputFormat.java:70)
	... 18 more
```

我们创建一下对应的库

```sql
create database cdc_target;
```

### step2: 创建库+不创建表

再次执行

```
Caused by: java.sql.SQLSyntaxErrorException: Table 'cdc_target.user_info' doesn't exist
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:120)
	at com.mysql.cj.jdbc.exceptions.SQLExceptionsMapping.translateException(SQLExceptionsMapping.java:122)
	at com.mysql.cj.jdbc.ClientPreparedStatement.executeInternal(ClientPreparedStatement.java:953)
	at com.mysql.cj.jdbc.ClientPreparedStatement.executeUpdateInternal(ClientPreparedStatement.java:1098)
	at com.mysql.cj.jdbc.ClientPreparedStatement.executeBatchSerially(ClientPreparedStatement.java:832)
	... 23 more

	at org.apache.seatunnel.engine.client.job.ClientJobProxy.waitForJobComplete(ClientJobProxy.java:122)
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:184)
	... 2 more
```

但是这并不支持 Schema Evolution 表结构变更同步呀？

还是说我哪里配置的问题？

### step3: 创建库+创建表

```sql
use cdc_target;

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

重新执行。

```
mysql> select * from  role_info;
+----+-----------+---------------------+---------------------+
| id | role_name | create_time         | update_time         |
+----+-----------+---------------------+---------------------+
|  1 | r1        | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  2 | r2        | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  3 | r3        | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  4 | r4        | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
+----+-----------+---------------------+---------------------+
4 rows in set (0.00 sec)

mysql> select * from user_info;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  2 | u2       | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  3 | u3       | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
|  4 | u4       | 2024-01-29 17:33:42 | 2024-01-29 17:33:42 |
+----+----------+---------------------+---------------------+
4 rows in set (0.00 sec)
```


# 变更表结构呢？

## 变更 cdc 源的结构

```sql
ALTER table user_info add remark varchar(128) null comment '备注';
```

实际并不生效。

# 参考资料

https://blog.csdn.net/DolphinScheduler/article/details/134855410


* any list
{:toc}
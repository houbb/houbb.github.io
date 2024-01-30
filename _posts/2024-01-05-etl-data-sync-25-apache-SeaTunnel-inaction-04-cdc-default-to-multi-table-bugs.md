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
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh
```


# 小结



* any list
{:toc}
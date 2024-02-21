---
layout: post
title: ETL-17-apache SeaTunnel Engine savepoint 如何根据保存点恢复任务？
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# savepoint 和使用 savepoint 进行恢复

savepoint 是使用检查点创建的，是作业执行状态的全局镜像，可用于作业或 SeaTunnel 的停止和恢复、升级等操作。

# 使用 savepoint

要使用 savepoint，您需要确保作业使用的连接器支持检查点，否则可能会导致数据丢失或重复。

# 确保作业正在运行

使用以下命令触发 savepoint：

```bash
./bin/seatunnel.sh -s {jobId}
```
执行成功后，将保存检查点数据并结束任务。

# 使用 savepoint 进行恢复

使用 jobId 从 savepoint 恢复

```bash
./bin/seatunnel.sh -c {jobConfig} -r {jobId}
```


# 实战测试

## 本地安装

参考: [ETL-03-简化版 SeaTunnel install windows10 单机 WSL 安装笔记](https://houbb.github.io/2024/01/05/etl-data-sync-04-apache-SeaTunnel-install-wsl-simple)

## 本地 cdc 测试

参考

> [ETL-24-apache SeaTunnel 实战 mysql CDC 流式增量](https://houbb.github.io/2024/01/05/etl-data-sync-24-apache-SeaTunnel-inaction-03-cdc)

## 准备工作

数据库启动 binlog.

### 建表语句

```sql
drop table if exists user_info;
create table user_info
(
    id int unsigned auto_increment comment '主键' primary key,
    username varchar(128) not null comment '用户名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '枚举映射表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
create unique index user_info on user_info (username) comment '标识索引';
```

### 数据初始化

创建一些测试数据。

```sql
insert into user_info (username) values ('binlog-add-01');
insert into user_info (username) values ('binlog-add-02');
insert into user_info (username) values ('binlog-add-03');
insert into user_info (username) values ('binlog-add-04');
insert into user_info (username) values ('binlog-add-05');
```

数据确认：

```
mysql> select * from user_info;
+----+---------------+---------------------+---------------------+
| id | username      | create_time         | update_time         |
+----+---------------+---------------------+---------------------+
| 14 | binlog-add-01 | 2024-02-21 14:17:54 | 2024-02-21 14:17:54 |
| 15 | binlog-add-02 | 2024-02-21 14:17:54 | 2024-02-21 14:17:54 |
| 16 | binlog-add-03 | 2024-02-21 14:17:54 | 2024-02-21 14:17:54 |
| 17 | binlog-add-04 | 2024-02-21 14:17:54 | 2024-02-21 14:17:54 |
| 18 | binlog-add-05 | 2024-02-21 14:17:55 | 2024-02-21 14:17:55 |
+----+---------------+---------------------+---------------------+
5 rows in set (0.00 sec)
```

## 配置查看

这里简化一下，因为主要需要看一下主要对于任务是否可以暂停+恢复。

mysql_cdc_to_console.conf 放在 `/home/dh/bigdata/seatunnel-2.3.3/config` 目录下。

- mysql_cdc_to_console.conf

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "etl.user_info-streaming"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:13306/etl?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["etl.user_info"]

        startup.mode = "initial"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    ConsoleBinlog {}
}
```

ConsoleBinlog 是一个自定义的日志输出，避免 binglog 直接输出报错的，简单的 console 输出实现。

只是为了演示，实际改成需要的 sink 即可。

## seatunnel 服务启动

```sh
#进入安装目录
cd /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3
# 关闭
bash bin/stop-seatunnel-cluster.sh
# 启动服务
nohup bash bin/seatunnel-cluster.sh 2>&1 &
```

确认：

```
$ jps
1050 Jps
892 SeaTunnelServer
```

启动日志在 nohup.out

## seatunnel 指定配置文件，添加 job

```sh
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --config /home/dh/bigdata/seatunnel-2.3.3/config/mysql_cdc_to_console.conf -elocal
```

日志查看在文件：`/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/logs/seatunnel-engine-server.log`


启动时测试日志为：

```
2024-02-21 14:29:34,678 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - output rowType: create_time<TIMESTAMP>, id<BIGINT>, update_time<TIMESTAMP>, username<STRING>
2024-02-21 14:29:36,539 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-02-21 14:29:36.537 >>>>>>>>>>> SeaTunnelRow{tableId=etl.user_info, kind=+I, fields=[2024-02-21T14:17:54, 14, 2024-02-21T14:17:54, binlog-add-01]}
2024-02-21 14:29:36,540 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-02-21 14:29:36.539 >>>>>>>>>>> SeaTunnelRow{tableId=etl.user_info, kind=+I, fields=[2024-02-21T14:17:54, 15, 2024-02-21T14:17:54, binlog-add-02]}
2024-02-21 14:29:36,541 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-02-21 14:29:36.540 >>>>>>>>>>> SeaTunnelRow{tableId=etl.user_info, kind=+I, fields=[2024-02-21T14:17:54, 16, 2024-02-21T14:17:54, binlog-add-03]}
2024-02-21 14:29:36,543 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-02-21 14:29:36.542 >>>>>>>>>>> SeaTunnelRow{tableId=etl.user_info, kind=+I, fields=[2024-02-21T14:17:54, 17, 2024-02-21T14:17:54, binlog-add-04]}
2024-02-21 14:29:36,544 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-02-21 14:29:36.543 >>>>>>>>>>> SeaTunnelRow{tableId=etl.user_info, kind=+I, fields=[2024-02-21T14:17:55, 18, 2024-02-21T14:17:55, binlog-add-05]}
```

### 插入测试

mysql 插入一条：

```sql
insert into user_info (username) values ('binlog-add-06');
```

会有一条新的输出：

```
2024-02-21 14:35:28,587 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-02-21 14:35:28.585 >>>>>>>>>>> SeaTunnelRow{tableId=etl.user_info, kind=+I, fields=[2024-02-21T14:35:28, 19, 2024-02-21T14:35:28, binlog-add-06]}
```

## 查看任务列表

```sh
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --list
```

可以获取到对应的任务列表

```
2024-02-21 14:33:33,073 INFO  com.hazelcast.client.impl.statistics.ClientStatisticsService - Client statistics is enabled with period 5 seconds.
Job ID              Job Name   Job Status  Submit Time              Finished Time
------------------  ---------  ----------  -----------------------  -----------------------
812571631246376961  SeaTunnel  RUNNING     2024-02-21 14:29:34.08
```

812571631246376961 就是我们刚才的任务标识。

## 任务暂停+savepoint

```sh
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh -s 812571631246376961
```

这个命令可以触发指定 jobid 的 savepoint，然后发现任务已经被暂停了。

执行成功后，将保存检查点数据并结束任务。

```
2024-02-21 14:36:44,715 INFO  com.hazelcast.core.LifecycleService - hz.client_1 [seatunnel] [5.1] HazelcastClient 5.1 (20220228 - 21f20e7) is SHUTTING_DOWN
2024-02-21 14:36:44,722 INFO  com.hazelcast.client.impl.connection.ClientConnectionManager - hz.client_1 [seatunnel] [5.1] Removed connection to endpoint: [localhost]:5801:13affa6c-bd6c-4e53-82b7-03585fcfc599, connection: ClientConnection{alive=false, connectionId=1, channel=NioChannel{/127.0.0.1:45369->localhost/127.0.0.1:5801}, remoteAddress=[localhost]:5801, lastReadTime=2024-02-21 14:36:44.713, lastWriteTime=2024-02-21 14:36:44.712, closedTime=2024-02-21 14:36:44.719, connected server version=5.1}
2024-02-21 14:36:44,722 INFO  com.hazelcast.core.LifecycleService - hz.client_1 [seatunnel] [5.1] HazelcastClient 5.1 (20220228 - 21f20e7) is CLIENT_DISCONNECTED
2024-02-21 14:36:44,730 INFO  com.hazelcast.core.LifecycleService - hz.client_1 [seatunnel] [5.1] HazelcastClient 5.1 (20220228 - 21f20e7) is SHUTDOWN
2024-02-21 14:36:44,730 INFO  org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand - Closed SeaTunnel client......
2024-02-21 14:36:44,730 INFO  org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand - Closed metrics executor service ......
2024-02-21 14:36:44,732 INFO  org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand - run shutdown hook because get close signal
```

### 查看任务确认

```sh
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --list
```

发现任务的状态变成了完成：

```
2024-02-21 14:38:08,132 INFO  com.hazelcast.client.impl.statistics.ClientStatisticsService - Client statistics is enabled with period 5 seconds.
Job ID              Job Name   Job Status  Submit Time              Finished Time
------------------  ---------  ----------  -----------------------  -----------------------
812571631246376961  SeaTunnel  FINISHED    2024-02-21 14:29:34.08   2024-02-21 14:36:44.696
```

## 使用 savepoint 进行恢复

使用 jobId 从 savepoint 恢复

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --config /home/dh/bigdata/seatunnel-2.3.3/config/mysql_cdc_to_console.conf -elocal -r 812571631246376961
```

和原来比，多了一个 `-r 812571631246376961`

### 确认任务

```sh
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --list
```

如下：

```
2024-02-21 14:40:01,903 INFO  com.hazelcast.client.impl.statistics.ClientStatisticsService - Client statistics is enabled with period 5 seconds.
Job ID              Job Name   Job Status  Submit Time              Finished Time
------------------  ---------  ----------  -----------------------  -----------------------
812571631246376961  SeaTunnel  RUNNING     2024-02-21 14:39:31.309
```

### console

可以启动时发现，此时的 console 并没有额外的日志输出。

我们在 mysql 再插入一条数据，可以发现出现的增量日志：

```sql
insert into user_info (username) values ('binlog-add-07');
```

此时控台多出一条实际日志：

```
2024-02-21 14:42:11,144 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-02-21 14:42:11.142 >>>>>>>>>>> SeaTunnelRow{tableId=etl.user_info, kind=+I, fields=[2024-02-21T14:42:10, 20, 2024-02-21T14:42:10, binlog-add-07]}
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/savepoint

* any list
{:toc}
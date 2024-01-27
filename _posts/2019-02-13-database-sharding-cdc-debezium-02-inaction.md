---
layout: post
title: Debezium-02-Debezium mysql cdc 实战笔记
date:  2019-2-13 09:48:27 +0800
categories: [Database]
tags: [database, sharding, cdc, sh]
published: true
---

# Debezium

[Debezium](https://github.com/debezium/debezium) 是一个开源项目，为捕获数据更改(change data capture,CDC)提供了一个低延迟的流式处理平台。

你可以安装并且配置Debezium去监控你的数据库，然后你的应用就可以消费对数据库的每一个行级别(row-level)的更改。

只有已提交的更改才是可见的，所以你的应用不用担心事务(transaction)或者更改被回滚(roll back)。

Debezium为所有的数据库更改事件提供了一个统一的模型，所以你的应用不用担心每一种数据库管理系统的错综复杂性。

另外，由于Debezium用持久化的、有副本备份的日志来记录数据库数据变化的历史，因此，你的应用可以随时停止再重启，而不会错过它停止运行时发生的事件，保证了所有的事件都能被正确地、完全地处理掉。

监控数据库，并且在数据变动的时候获得通知一直是很复杂的事情。关系型数据库的触发器可以做到，但是只对特定的数据库有效，而且通常只能更新数据库内的状态(无法和外部的进程通信)。一些数据库提供了监控数据变动的API或者框架，但是没有一个标准，每种数据库的实现方式都是不同的，并且需要大量特定的知识和理解特定的代码才能运用。确保以相同的顺序查看和处理所有更改，同时最小化影响数据库仍然非常具有挑战性。

Debezium提供了模块为你做这些复杂的工作。一些模块是通用的，并且能够适用多种数据库管理系统，但在功能和性能方面仍有一些限制。另一些模块是为特定的数据库管理系统定制的，所以他们通常可以更多地利用数据库系统本身的特性来提供更多功能。

# windows10 实战笔记

## 准备工作

确保已经开启 binlog

> [binlog 开启](https://houbb.github.io/2021/08/29/mysql-binlog)

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
```

## 创建 dbz 账户

```sql
CREATE USER 'dbz'@'%' IDENTIFIED BY 'dbz';
GRANT ALL PRIVILEGES ON *.* TO 'dbz'@'%' WITH GRANT OPTION;
flush privileges;
```

## 创建表

```sql
create database test_source;
use test_source;

drop table if exists user_info;
create table user_info
(
    id int unsigned auto_increment comment '主键' primary key,
    username varchar(128) not null comment '用户名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '用户信息表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
```

初始化数据

```sql
insert into user_info (username) values ('u1');
insert into user_info (username) values ('u2');
insert into user_info (username) values ('u3');
insert into user_info (username) values ('u4');
insert into user_info (username) values ('u5');
```


# 代码开发

debezium 和 canal 类似，直接由服务端。

当然也支持 client jdk 的方式，监听处理变更。

这里演示 jdk 的方式。

## maven 依赖

```xml
<dependencies>
    <dependency>
        <groupId>io.debezium</groupId>
        <artifactId>debezium-api</artifactId>
        <version>1.9.5.Final</version>
    </dependency>
    <dependency>
        <groupId>io.debezium</groupId>
        <artifactId>debezium-embedded</artifactId>
        <version>1.9.5.Final</version>
    </dependency>
    <dependency>
        <groupId>io.debezium</groupId>
        <artifactId>debezium-connector-mysql</artifactId>
        <version>1.9.5.Final</version>
    </dependency>
</dependencies>
```

## 代码

```java
package org.example;

import io.debezium.engine.ChangeEvent;
import io.debezium.engine.DebeziumEngine;
import io.debezium.engine.format.Json;

import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;


public class Main {


    private static DebeziumEngine<ChangeEvent<String, String>> engine;

    public static void main(String[] args) throws Exception {
        final Properties props = new Properties();
        props.setProperty("name", "dbz-engine");
        props.setProperty("connector.class", "io.debezium.connector.mysql.MySqlConnector");

        //offset config begin - 使用文件来存储已处理的binlog偏移量
        props.setProperty("offset.storage", "org.apache.kafka.connect.storage.FileOffsetBackingStore");
        props.setProperty("offset.storage.file.filename", "D:\\github\\debezium-learn\\mysql_offsets.dat");
        props.setProperty("offset.flush.interval.ms", "0");
        //offset config end

        props.setProperty("database.server.name", "mysql-connector");
        props.setProperty("database.history", "io.debezium.relational.history.FileDatabaseHistory");
        props.setProperty("database.history.file.filename", "D:\\github\\debezium-learn\\mysql_dbhistory.txt");

        props.setProperty("database.server.id", "122112"); //需要与MySQL的server-id不同
        props.setProperty("database.hostname", "localhost");
        props.setProperty("database.port", "3306");
        props.setProperty("database.user", "admin");
        props.setProperty("database.password", "123456");
        props.setProperty("database.include.list", "test_source");//要捕获的数据库名
        props.setProperty("table.include.list", "test_source.user_info");//要捕获的数据表

        props.setProperty("snapshot.mode", "initial");//全量+增量

        // 使用上述配置创建Debezium引擎，输出样式为Json字符串格式
        engine = DebeziumEngine.create(Json.class)
                .using(props)
                .notifying(record -> {
                    System.out.println(record);//输出到控制台
                })
                .using((success, message, error) -> {
                    if (error != null) {
                        // 报错回调
                        System.out.println("------------error, message:" + message + "exception:" + error);
                    }
                    closeEngine(engine);
                })
                .build();

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(engine);
        addShutdownHook(engine);
        awaitTermination(executor);

        System.out.println("------------main finished.");
    }

    private static void closeEngine(DebeziumEngine<ChangeEvent<String, String>> engine) {
        try {
            engine.close();
        } catch (IOException ignored) {
        }
    }

    private static void addShutdownHook(DebeziumEngine<ChangeEvent<String, String>> engine) {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> closeEngine(engine)));
    }

    private static void awaitTermination(ExecutorService executor) {
        if (executor != null) {
            try {
                executor.shutdown();
                while (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }


}
```

### 启动报错

```
java.sql.SQLException: The server time zone value '?й???׼ʱ?' is unrecognized or represents more than one time zone. You must configure either the server or JDBC driver (via the 'connectionTimeZone' configuration property) to use a more specific time zone value if you want to utilize time zone support.
```

异常可以参见 [Expose serverTimezone debezium option via MySQL Source spec for CDC](https://github.com/airbytehq/airbyte/issues/6573)

https://stackoverflow.com/questions/67340500/kafka-connect-mysql-server-time-zone-value-edt-is-unrecognized

解决方式：

添加对应的时区就行：

```java
props.setProperty("database.connectionTimeZone", "UTC");//设置时区
```

## 启动日志

可以看到对应的数据信息：

```
 EmbeddedEngineChangeEvent [key={"schema":{"type":"struct","fields":[{"type":"int64","optional":false,"field":"id"}],"optional":false,"name":"mysql_connector.test_source.user_info.Key"},"payload":{"id":4}}, value={"schema":{"type":"struct","fields":[{"type":"struct","fields":[{"type":"int64","optional":false,"field":"id"},{"type":"string","optional":false,"field":"username"},{"type":"string","optional":false,"name":"io.debezium.time.ZonedTimestamp","version":1,"default":"1970-01-01T00:00:00Z","field":"create_time"},{"type":"string","optional":false,"name":"io.debezium.time.ZonedTimestamp","version":1,"default":"1970-01-01T00:00:00Z","field":"update_time"}],"optional":true,"name":"mysql_connector.test_source.user_info.Value","field":"before"},{"type":"struct","fields":[{"type":"int64","optional":false,"field":"id"},{"type":"string","optional":false,"field":"username"},{"type":"string","optional":false,"name":"io.debezium.time.ZonedTimestamp","version":1,"default":"1970-01-01T00:00:00Z","field":"create_time"},{"type":"string","optional":false,"name":"io.debezium.time.ZonedTimestamp","version":1,"default":"1970-01-01T00:00:00Z","field":"update_time"}],"optional":true,"name":"mysql_connector.test_source.user_info.Value","field":"after"},{"type":"struct","fields":[{"type":"string","optional":false,"field":"version"},{"type":"string","optional":false,"field":"connector"},{"type":"string","optional":false,"field":"name"},{"type":"int64","optional":false,"field":"ts_ms"},{"type":"string","optional":true,"name":"io.debezium.data.Enum","version":1,"parameters":{"allowed":"true,last,false,incremental"},"default":"false","field":"snapshot"},{"type":"string","optional":false,"field":"db"},{"type":"string","optional":true,"field":"sequence"},{"type":"string","optional":true,"field":"table"},{"type":"int64","optional":false,"field":"server_id"},{"type":"string","optional":true,"field":"gtid"},{"type":"string","optional":false,"field":"file"},{"type":"int64","optional":false,"field":"pos"},{"type":"int32","optional":false,"field":"row"},{"type":"int64","optional":true,"field":"thread"},{"type":"string","optional":true,"field":"query"}],"optional":false,"name":"io.debezium.connector.mysql.Source","field":"source"},{"type":"string","optional":false,"field":"op"},{"type":"int64","optional":true,"field":"ts_ms"},{"type":"struct","fields":[{"type":"string","optional":false,"field":"id"},{"type":"int64","optional":false,"field":"total_order"},{"type":"int64","optional":false,"field":"data_collection_order"}],"optional":true,"field":"transaction"}],"optional":false,"name":"mysql_connector.test_source.user_info.Envelope"},"payload":{"before":null,"after":{"id":4,"username":"u4","create_time":"2024-01-27T21:41:47Z","update_time":"2024-01-27T21:41:47Z"},"source":{"version":"1.9.5.Final","connector":"mysql","name":"mysql-connector","ts_ms":1706364529245,"snapshot":"true","db":"test_source","sequence":null,"table":"user_info","server_id":0,"gtid":null,"file":"mysql-bin.000001","pos":10808,"row":0,"thread":null,"query":null},"op":"r","ts_ms":1706364529246,"transaction":null}}, sourceRecord=SourceRecord{sourcePartition={server=mysql-connector}, sourceOffset={ts_sec=1706364529, file=mysql-bin.000001, pos=10808, gtids=c8ea338c-babd-11ee-a02f-22444d03619e:1-37, snapshot=true}} ConnectRecord{topic='mysql-connector.test_source.user_info', kafkaPartition=null, key=Struct{id=4}, keySchema=Schema{mysql_connector.test_source.user_info.Key:STRUCT}, value=Struct{after=Struct{id=4,username=u4,create_time=2024-01-27T21:41:47Z,update_time=2024-01-27T21:41:47Z},source=Struct{version=1.9.5.Final,connector=mysql,name=mysql-connector,ts_ms=1706364529245,snapshot=true,db=test_source,table=user_info,server_id=0,file=mysql-bin.000001,pos=10808,row=0},op=r,ts_ms=1706364529246}, valueSchema=Schema{mysql_connector.test_source.user_info.Envelope:STRUCT}, timestamp=null, headers=ConnectHeaders(headers=)}]

EmbeddedEngineChangeEvent [key={"schema":{"type":"struct","fields":[{"type":"int64","optional":false,"field":"id"}],"optional":false,"name":"mysql_connector.test_source.user_info.Key"},"payload":{"id":5}}, value={"schema":{"type":"struct","fields":[{"type":"struct","fields":[{"type":"int64","optional":false,"field":"id"},{"type":"string","optional":false,"field":"username"},{"type":"string","optional":false,"name":"io.debezium.time.ZonedTimestamp","version":1,"default":"1970-01-01T00:00:00Z","field":"create_time"},{"type":"string","optional":false,"name":"io.debezium.time.ZonedTimestamp","version":1,"default":"1970-01-01T00:00:00Z","field":"update_time"}],"optional":true,"name":"mysql_connector.test_source.user_info.Value","field":"before"},{"type":"struct","fields":[{"type":"int64","optional":false,"field":"id"},{"type":"string","optional":false,"field":"username"},{"type":"string","optional":false,"name":"io.debezium.time.ZonedTimestamp","version":1,"default":"1970-01-01T00:00:00Z","field":"create_time"},{"type":"string","optional":false,"name":"io.debezium.time.ZonedTimestamp","version":1,"default":"1970-01-01T00:00:00Z","field":"update_time"}],"optional":true,"name":"mysql_connector.test_source.user_info.Value","field":"after"},{"type":"struct","fields":[{"type":"string","optional":false,"field":"version"},{"type":"string","optional":false,"field":"connector"},{"type":"string","optional":false,"field":"name"},{"type":"int64","optional":false,"field":"ts_ms"},{"type":"string","optional":true,"name":"io.debezium.data.Enum","version":1,"parameters":{"allowed":"true,last,false,incremental"},"default":"false","field":"snapshot"},{"type":"string","optional":false,"field":"db"},{"type":"string","optional":true,"field":"sequence"},{"type":"string","optional":true,"field":"table"},{"type":"int64","optional":false,"field":"server_id"},{"type":"string","optional":true,"field":"gtid"},{"type":"string","optional":false,"field":"file"},{"type":"int64","optional":false,"field":"pos"},{"type":"int32","optional":false,"field":"row"},{"type":"int64","optional":true,"field":"thread"},{"type":"string","optional":true,"field":"query"}],"optional":false,"name":"io.debezium.connector.mysql.Source","field":"source"},{"type":"string","optional":false,"field":"op"},{"type":"int64","optional":true,"field":"ts_ms"},{"type":"struct","fields":[{"type":"string","optional":false,"field":"id"},{"type":"int64","optional":false,"field":"total_order"},{"type":"int64","optional":false,"field":"data_collection_order"}],"optional":true,"field":"transaction"}],"optional":false,"name":"mysql_connector.test_source.user_info.Envelope"},"payload":{"before":null,"after":{"id":5,"username":"u5","create_time":"2024-01-27T21:41:48Z","update_time":"2024-01-27T21:41:48Z"},"source":{"version":"1.9.5.Final","connector":"mysql","name":"mysql-connector","ts_ms":1706364529246,"snapshot":"last","db":"test_source","sequence":null,"table":"user_info","server_id":0,"gtid":null,"file":"mysql-bin.000001","pos":10808,"row":0,"thread":null,"query":null},"op":"r","ts_ms":1706364529246,"transaction":null}}, sourceRecord=SourceRecord{sourcePartition={server=mysql-connector}, sourceOffset={ts_sec=1706364529, file=mysql-bin.000001, pos=10808, gtids=c8ea338c-babd-11ee-a02f-22444d03619e:1-37}} ConnectRecord{topic='mysql-connector.test_source.user_info', kafkaPartition=null, key=Struct{id=5}, keySchema=Schema{mysql_connector.test_source.user_info.Key:STRUCT}, value=Struct{after=Struct{id=5,username=u5,create_time=2024-01-27T21:41:48Z,update_time=2024-01-27T21:41:48Z},source=Struct{version=1.9.5.Final,connector=mysql,name=mysql-connector,ts_ms=1706364529246,snapshot=last,db=test_source,table=user_info,server_id=0,file=mysql-bin.000001,pos=10808,row=0},op=r,ts_ms=1706364529246}, valueSchema=Schema{mysql_connector.test_source.user_info.Envelope:STRUCT}, timestamp=null, headers=ConnectHeaders(headers=)}]

```

# 参考资料 

https://github.com/debezium/debezium

https://github.com/debezium/debezium/blob/main/README_ZH.md

https://blog.csdn.net/n88Lpo/article/details/127780611

https://github.com/airbytehq/airbyte/issues/6573

* any list
{:toc}
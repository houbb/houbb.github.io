---
layout: post
title: ETL-24-apache SeaTunnel 实战 mysql CDC 流式增量
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[ETL-10-apache SeaTunnel Connector v2 source mysql cdc](https://houbb.github.io/2024/01/05/etl-data-sync-10-apache-SeaTunnel-connector-v2-source-mysql-cdc)

[mysql binlog](https://houbb.github.io/2021/08/29/mysql-binlog)

# mysql 准备

创建一个测试账户：

```sql
CREATE USER 'admin'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
flush privileges;
```

## 启用 binlog

```ini
# Enable binary replication log and set the prefix, expiration, and log format.
# The prefix is arbitrary, expiration can be short for integration tests but would
# be longer on a production system. Row-level info is required for ingest to work.
# Server ID is required, but this will vary on production systems
server-id         = 223344
log_bin           = mysql-bin
expire_logs_days  = 10
binlog_format     = row
binlog_row_image  = FULL

# enable gtid mode
gtid_mode = on
enforce_gtid_consistency = on
```


## 建表

```sql
create database etl;
use etl;
```

创建测试表：

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

drop table if exists user_info_bak;
create table user_info_bak
(
    id int unsigned auto_increment comment '主键' primary key,
    username varchar(128) not null comment '用户名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '枚举映射表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
create unique index user_info_bak on user_info_bak (username) comment '标识索引';
```

# v1-mysql => mysql CDC

## 需求

我们首先验证一下最简单的 mysql-CDC 到 mysql 的功能。

## 添加依赖

添加对应的 cdc 依赖：

```xml
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>connector-cdc-mysql</artifactId>
    <version>${project.version}</version>
</dependency>
```

## 配置

```yaml
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://localhost:3306/etl?useSSL=false&serverTimezone=Asia/Shanghai"
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
    Console {
    }
}
```

吐槽一下，这里的配置属性值和一般的 jdbc 没有统一。

### 不足

感觉这里还没有 neo4j 的方便，因为参数看文档，只有 `?` 的方式，无法指定对应的字段？

## 测试 add

```sql
insert into user_info (username) values ('binlog-add-01');
insert into user_info (username) values ('binlog-add-02');
insert into user_info (username) values ('binlog-add-03');
insert into user_info (username) values ('binlog-add-04');
insert into user_info (username) values ('binlog-add-05');
```

对应的日志：

```
2024-01-15 16:00:42,286 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=1:  SeaTunnelRow#tableId=etl.user_info SeaTunnelRow#kind=INSERT : 1, binlog-add-01, 2024-01-15T16:00:42, 2024-01-15T16:00:42
2024-01-15 16:00:42,286 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=2:  SeaTunnelRow#tableId=etl.user_info SeaTunnelRow#kind=INSERT : 2, binlog-add-02, 2024-01-15T16:00:42, 2024-01-15T16:00:42
2024-01-15 16:00:42,286 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=3:  SeaTunnelRow#tableId=etl.user_info SeaTunnelRow#kind=INSERT : 3, binlog-add-03, 2024-01-15T16:00:42, 2024-01-15T16:00:42
2024-01-15 16:00:42,286 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=4:  SeaTunnelRow#tableId=etl.user_info SeaTunnelRow#kind=INSERT : 4, binlog-add-04, 2024-01-15T16:00:42, 2024-01-15T16:00:42
2024-01-15 16:00:42,286 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=5:  SeaTunnelRow#tableId=etl.user_info SeaTunnelRow#kind=INSERT : 5, binlog-add-05, 2024-01-15T16:00:42, 2024-01-15T16:00:42
```

### 注意

这个 startup.mode = "initial" 导致每次启动都会去从头开始查询数据，感觉还不如设置为最新比较合理。


### 测试修改

```sql
update user_info set username = 'binlog-edit-01' where username = 'binlog-add-01';
```

日志：

```
2024-01-15 16:07:32,265 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=6:  SeaTunnelRow#tableId=etl.user_info SeaTunnelRow#kind=UPDATE_BEFORE : 1, binlog-add-01, 2024-01-15T16:00:42, 2024-01-15T16:00:42
2024-01-15 16:08:29,426 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=7:  SeaTunnelRow#tableId=etl.user_info SeaTunnelRow#kind=UPDATE_AFTER : 1, binlog-edit-01, 2024-01-15T16:00:42, 2024-01-15T16:07:22
```

### 测试删除

```sql
delete from user_info where username = 'binlog-add-02';
```

日志：

```
2024-01-15 16:10:36,060 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=8:  SeaTunnelRow#tableId=etl.user_info SeaTunnelRow#kind=DELETE : 2, binlog-add-02, 2024-01-15T16:00:42, 2024-01-15T16:00:42
```

## 问题

这种数据，信息都被简化掉了，会导致接收到的时候，无法和字段关联起来？

主要的是多了一个类别？


# binlog json 格式

我们来验证一下 json 序列化的效果，并且输出到自定义的 console 中。

学习一下插件的编写。

## json 序列化

上面的日只有一个缺点就是不太利于阅读。

如果我们想将其转换为标准的 json 的话。

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
        base-url = "jdbc:mysql://localhost:3306/etl?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["etl.user_info"]

        startup.mode = "initial"

        format = compatible_debezium_json
        debezium = {
           # include schema into kafka message
           key.converter.schemas.enable = false
           value.converter.schemas.enable = false
           # include dd1
           include.schema.changes = true
           # topic.prefix
           database.server.name = ""
        }
        #compatible_debezium_json fixed schema
        schema = {
           fields = {
               id = int
               username = string
               create_time = date
               update_time = date
           }
        }
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    # 使用自定义的控台输出，避免 console 异常。
    ConsoleBinlog {
    }
}
```

序列化这部分的官方地址丢失了，可以参考类：DebeziumJsonSerializationSchema

还有一些别人提的 issue: https://github.com/apache/seatunnel/issues/5010

## ConsoleBinlog 自定义插件

原始的插件会对数据进行处理，如果直接序列化之后，console 会报错。

我们可以复制一份 console 的实现，加一个 consoleBinlog 模块。

主要改一行逻辑，其他的都是插件名称修改：

```java
@Slf4j
public class ConsoleBinlogSinkWriter extends AbstractSinkWriter<SeaTunnelRow, Void> {

    // 其他

    @Override
    @SuppressWarnings("checkstyle:RegexpSingleline")
    public void write(SeaTunnelRow element) {
        // 简化日志输出，避免 console 处理导致的报错
        log.info("ConsoleBinlogSinkWriter ================= " + element.toString());
    }
```

然后在 examples 中引入这个插件即可。


## 启动时

```json
SeaTunnelRow{tableId=, kind=+I, fields=[.etl.user_info, {"id":1}, {"before":null,"after":{"id":1,"username":"binlog-edit-01","create_time":"2024-01-15T08:00:42Z","update_time":"2024-01-15T08:07:22Z"},"source":{"version":"1.6.4.Final","connector":"mysql","name":"","ts_ms":0,"snapshot":"false","db":"etl","sequence":null,"table":"user_info","server_id":0,"gtid":null,"file":"","pos":0,"row":0,"thread":null,"query":null},"op":"r","ts_ms":1705310101381,"transaction":null}]}

SeaTunnelRow{tableId=, kind=+I, fields=[.etl.user_info, {"id":3}, {"before":null,"after":{"id":3,"username":"binlog-add-03","create_time":"2024-01-15T08:00:42Z","update_time":"2024-01-15T08:00:42Z"},"source":{"version":"1.6.4.Final","connector":"mysql","name":"","ts_ms":0,"snapshot":"false","db":"etl","sequence":null,"table":"user_info","server_id":0,"gtid":null,"file":"","pos":0,"row":0,"thread":null,"query":null},"op":"r","ts_ms":1705310101381,"transaction":null}]}

SeaTunnelRow{tableId=, kind=+I, fields=[.etl.user_info, {"id":4}, {"before":null,"after":{"id":4,"username":"binlog-add-04","create_time":"2024-01-15T08:00:42Z","update_time":"2024-01-15T08:00:42Z"},"source":{"version":"1.6.4.Final","connector":"mysql","name":"","ts_ms":0,"snapshot":"false","db":"etl","sequence":null,"table":"user_info","server_id":0,"gtid":null,"file":"","pos":0,"row":0,"thread":null,"query":null},"op":"r","ts_ms":1705310101382,"transaction":null}]}

SeaTunnelRow{tableId=, kind=+I, fields=[.etl.user_info, {"id":5}, {"before":null,"after":{"id":5,"username":"binlog-add-05","create_time":"2024-01-15T08:00:42Z","update_time":"2024-01-15T08:00:42Z"},"source":{"version":"1.6.4.Final","connector":"mysql","name":"","ts_ms":0,"snapshot":"false","db":"etl","sequence":null,"table":"user_info","server_id":0,"gtid":null,"file":"","pos":0,"row":0,"thread":null,"query":null},"op":"r","ts_ms":1705310101382,"transaction":null}]}
```

## 更新

```sql
update user_info set username = 'binlog-edit-03' where username = 'binlog-add-03';
```

日志：

```
SeaTunnelRow{tableId=, kind=+I, fields=[.etl.user_info, {"id":3}, {"before":{"id":3,"username":"binlog-add-03","create_time":"2024-01-15T08:00:42Z","update_time":"2024-01-15T08:00:42Z"},"after":{"id":3,"username":"binlog-edit-03","create_time":"2024-01-15T08:00:42Z","update_time":"2024-01-15T09:17:02Z"},"source":{"version":"1.6.4.Final","connector":"mysql","name":"","ts_ms":1705310222000,"snapshot":"false","db":"etl","sequence":null,"table":"user_info","server_id":223344,"gtid":"f00fb9a1-1a19-11ed-911a-00ff5f785ccc:15","file":"mysql-bin.000001","pos":4113,"row":0,"thread":null,"query":null},"op":"u","ts_ms":1705310222423,"transaction":null}]}
```

## 删除

```sql
delete from user_info where username = 'binlog-edit-01';
```

日志：

```
SeaTunnelRow{tableId=, kind=+I, fields=[.etl.user_info, {"id":1}, {"before":{"id":1,"username":"binlog-edit-01","create_time":"2024-01-15T08:00:42Z","update_time":"2024-01-15T08:07:22Z"},"after":null,"source":{"version":"1.6.4.Final","connector":"mysql","name":"","ts_ms":1705310352000,"snapshot":"false","db":"etl","sequence":null,"table":"user_info","server_id":223344,"gtid":"f00fb9a1-1a19-11ed-911a-00ff5f785ccc:16","file":"mysql-bin.000001","pos":4431,"row":0,"thread":null,"query":null},"op":"d","ts_ms":1705310352117,"transaction":null}]}
```

## 插入

```sql
insert into user_info (username) values ('binlog-add-06');
```

日志：

```
SeaTunnelRow{tableId=, kind=+I, fields=[.etl.user_info, {"id":8}, {"before":null,"after":{"id":8,"username":"binlog-add-06","create_time":"2024-01-15T09:22:09Z","update_time":"2024-01-15T09:22:09Z"},"source":{"version":"1.6.4.Final","connector":"mysql","name":"","ts_ms":1705310529000,"snapshot":"false","db":"etl","sequence":null,"table":"user_info","server_id":223344,"gtid":"f00fb9a1-1a19-11ed-911a-00ff5f785ccc:19","file":"mysql-bin.000001","pos":5296,"row":0,"thread":null,"query":null},"op":"c","ts_ms":1705310529765,"transaction":null}]}
```

## 整体感受

这里的 kink=+I 好像是固定的，没有仔细研究对应的 format 实现。

不过可以根据 op 来判断

c: CREATE
d: DELETE
u: UPDATE

# 思考

这里的格式化是一个插件。

关键既然可以根据原始的 row 序列化为 json，那么说明 row 的信息应该是完整的。

我们有没有办法直接解析这个原始的 row，实现入库等操作。

但是不是直接的入库，因为涉及到对应的 3 个操作：

1. CREATE 插入

2. DELETE 删除

3. UPDATE 更新

## 一些要求

能否类似于 neo4j？做对应的字段映射。可以指定，更加灵活？

如果一次操作，涉及到多个 node+edge 的变化，能否放在一个事务中？


# v2.3.3 mysql cdc release 包的问题

## 现象

用本地代码测试正常，但是用命令行在 wsl 上执行就会报错。

## 命令

```
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --config /home/dh/bigdata/seatunnel-2.3.3/config/mysql_cdc_to_neo4j_multi.conf -elocal
```

### 配置文件

```conf
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
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
    Console {
    }

}
```

## releease 包的形式执行

```
2024-01-19 13:20:50,734 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Reason:SeaTunnel job executed failed

2024-01-19 13:20:50,735 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Exception StackTrace:org.apache.seatunnel.core.starter.exception.CommandExecuteException: SeaTunnel job executed failed
        at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:191)
        at org.apache.seatunnel.core.starter.SeaTunnel.run(SeaTunnel.java:40)
        at org.apache.seatunnel.core.starter.seatunnel.SeaTunnelClient.main(SeaTunnelClient.java:34)
Caused by: org.apache.seatunnel.engine.common.exception.SeaTunnelEngineException: java.lang.RuntimeException: java.util.concurrent.ExecutionException: java.util.concurrent.CompletionException: java.lang.ClassCastException: cannot assign instance of io.debezium.relational.TableId to field org.apache.seatunnel.connectors.cdc.base.source.split.SnapshotSplit.tableId of type io.debezium.relational.TableId in instance of org.apache.seatunnel.connectors.cdc.base.source.split.SnapshotSplit
        at org.apache.seatunnel.engine.server.task.flow.SourceFlowLifeCycle.requestSplit(SourceFlowLifeCycle.java:223)
        at org.apache.seatunnel.engine.server.task.context.SourceReaderContext.sendSplitRequest(SourceReaderContext.java:64)
        at org.apache.seatunnel.connectors.cdc.base.source.reader.IncrementalSourceReader.pollNext(IncrementalSourceReader.java:94)
        at org.apache.seatunnel.engine.server.task.flow.SourceFlowLifeCycle.collect(SourceFlowLifeCycle.java:150)
        at org.apache.seatunnel.engine.server.task.SourceSeaTunnelTask.collect(SourceSeaTunnelTask.java:95)
        at org.apache.seatunnel.engine.server.task.SeaTunnelTask.stateProcess(SeaTunnelTask.java:168)
        at org.apache.seatunnel.engine.server.task.SourceSeaTunnelTask.call(SourceSeaTunnelTask.java:100)
        at org.apache.seatunnel.engine.server.TaskExecutionService$BlockingWorker.run(TaskExecutionService.java:613)
        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
        at java.util.concurrent.FutureTask.run(FutureTask.java:266)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
        at java.lang.Thread.run(Thread.java:750)

Caused by: java.lang.ClassCastException: cannot assign instance of io.debezium.relational.TableId to field org.apache.seatunnel.connectors.cdc.base.source.split.SnapshotSplit.tableId of type io.debezium.relational.TableId in instance of org.apache.seatunnel.connectors.cdc.base.source.split.SnapshotSplit
        at java.io.ObjectStreamClass$FieldReflector.setObjFieldValues(ObjectStreamClass.java:2301)
        at java.io.ObjectStreamClass.setObjFieldValues(ObjectStreamClass.java:1431)
        at java.io.ObjectInputStream.defaultReadFields(ObjectInputStream.java:2437)
        at java.io.ObjectInputStream.readSerialData(ObjectInputStream.java:2355)
        at java.io.ObjectInputStream.readOrdinaryObject(ObjectInputStream.java:2213)
        at java.io.ObjectInputStream.readObject0(ObjectInputStream.java:1669)
        at java.io.ObjectInputStream.readObject(ObjectInputStream.java:503)
        at java.io.ObjectInputStream.readObject(ObjectInputStream.java:461)
        at org.apache.seatunnel.common.utils.SerializationUtils.deserialize(SerializationUtils.java:74)
        at org.apache.seatunnel.api.serialization.DefaultSerializer.deserialize(DefaultSerializer.java:41)
        at org.apache.seatunnel.api.serialization.DefaultSerializer.deserialize(DefaultSerializer.java:25)
        at org.apache.seatunnel.engine.server.task.operation.source.AssignSplitOperation.lambda$run$0(AssignSplitOperation.java:67)
        at org.apache.seatunnel.common.utils.RetryUtils.retryWithException(RetryUtils.java:48)
        at org.apache.seatunnel.engine.server.task.operation.source.AssignSplitOperation.run(AssignSplitOperation.java:54)
        at com.hazelcast.spi.impl.operationservice.Operation.call(Operation.java:189)
        at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.call(OperationRunnerImpl.java:273)
        at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:248)
        at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:213)
        at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:175)
        at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:139)
        at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.executeRun(OperationThread.java:123)
        at com.hazelcast.internal.util.executor.HazelcastManagedThread.run(HazelcastManagedThread.java:102)

        at org.apache.seatunnel.engine.client.job.ClientJobProxy.waitForJobComplete(ClientJobProxy.java:122)
        at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:184)
        ... 2 more
2024-01-19 12:47:38,125 INFO  org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand - run shutdown hook because get close signal
```



## 猜测原因 v1-connector-cdc-mysql 问题

类似的bug:

https://github.com/apache/seatunnel/issues/4403

https://github.com/apache/seatunnel/issues/5010

说是已经解决，但是实际上问题并没有被解决。

## 尝试解决方式

```
~/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/lib
~/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors/seatunnel
```

这里的 `connector-cdc-mysql-2.3.3.jar` 备份到本地，然后移除。

在本地编译代码，然后把包放进去。

本地编译的 jar: connector-cdc-mysql-2.3.4-SNAPSHOT-2.11.12.jar

对应的 WSL 位置：

```
\\wsl.localhost\Ubuntu\home\dh\bigdata\seatunnel-2.3.3\backend\apache-seatunnel-2.3.3\lib
\\wsl.localhost\Ubuntu\home\dh\bigdata\seatunnel-2.3.3\backend\apache-seatunnel-2.3.3\connectors\seatunnel
```

### 重启服务

```bash
cd ~/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3

bash bin/stop-seatunnel-cluster.sh

nohup bash bin/seatunnel-cluster.sh 2>&1 &
```

## 再次验证


```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --config /home/dh/bigdata/seatunnel-2.3.3/config/mysql_cdc_to_neo4j_multi.conf -elocal
```

发现依然报错。

## 猜测原因 v2-connector-cdc-base 问题

### 源码部分

```java
protected SnapshotSplit createSnapshotSplit(
        JdbcConnection jdbc,
        TableId tableId,
        int chunkId,
        SeaTunnelRowType splitKeyType,
        Object chunkStart,
        Object chunkEnd) {
    // currently, we only support single split column
    Object[] splitStart = chunkStart == null ? null : new Object[] {chunkStart};
    Object[] splitEnd = chunkEnd == null ? null : new Object[] {chunkEnd};
    return new SnapshotSplit(
            splitId(tableId, chunkId), tableId, splitKeyType, splitStart, splitEnd);
}
```

这里的 tableId 参数：io.debezium.relational.TableId

二者应该确实是同一个才对。

报错：

```
java.lang.ClassCastException: cannot assign instance of io.debezium.relational.TableId to field org.apache.seatunnel.connectors.cdc.base.source.split.SnapshotSplit.tableId of type io.debezium.relational.TableId in instance of org.apache.seatunnel.connectors.cdc.base.source.split.SnapshotSplit
这个为什么会类型转换错误呢？二者不都是同一个类 io.debezium.relational.TableId 吗？
```

### 可能不一样的原因

在 Java 中，`ClassCastException` 表示在运行时尝试将一个对象强制转换为与其实际类型不兼容的类型。

虽然两者看起来相同，但在 Java 中，类加载器的不同实例可能导致两个具有相同类名的类被认为是不同的类。

下面是一些可能导致你遇到这个问题的原因：

1. **类加载器问题：**
   类加载器负责在 Java 虚拟机中加载类。如果 `io.debezium.relational.TableId` 在运行时由不同的类加载器加载，即使两者的类名相同，它们也被认为是不同的类。在你的错误信息中，可能是在 `org.apache.seatunnel.connectors.cdc.base.source.split.SnapshotSplit` 类的字段 `tableId` 的类型定义上有问题。
   
   确保这两个类使用的是相同的类加载器。

2. **版本不匹配：**
   即使是相同的类，也要确保它们来自于相同版本的库或 JAR 文件。版本不匹配可能导致类的字段、方法等发生变化，从而引发类转换异常。

3. **ClassLoader 和双亲委派模型：**
   Java 的类加载机制遵循双亲委派模型。如果在不同的类加载器层次结构中加载了相同名称的类，它们会被认为是不同的类。这可能导致在运行时发生类型转换异常。

为了解决这个问题，可以考虑以下步骤：

- **检查类加载器：** 确保 `io.debezium.relational.TableId` 类在运行时由相同的类加载器加载。
  
- **检查版本：** 确保你的应用程序使用的所有库和依赖项的版本是一致的。

- **ClassLoader 隔离：** 如果可能，考虑使用类加载器隔离，确保相同的类只由相同的类加载器加载。

- **日志输出：** 在出现异常的代码周围添加日志输出，输出相关对象的 `getClass().getClassLoader()`，以便查看它们的类加载器是否相同。

如果问题仍然存在，更详细的代码片段和相关上下文可能有助于进一步分析问题。

### 验证猜想

我们把 connector 和 lib 中的包备份，然后把其他不需要的的 connector 全部移除掉。

```bash
cd ~/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/
cp -r lib lib_bak
cp -r connectors/seatunnel connectors/seatunnel_bak
```

我们移除 lib + connectors 下边的其他 cdc 包

```
rm connector-cdc-mongodb-2.3.3.jar
```

怀疑这个有问题，不同的 cdc 导致对应的基类冲突了？

### 重新验证

```bash
cd ~/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3

bash bin/stop-seatunnel-cluster.sh

nohup bash bin/seatunnel-cluster.sh 2>&1 &
```

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --config /home/dh/bigdata/seatunnel-2.3.3/config/mysql_cdc_to_neo4j_multi.conf
```

还是失败了。。。

是遗漏了什么吗？


### 移除 lib 下面的所有 datasource-*.jar

移除过头了。。PS 一定要提前备份。

# 成功的版本

看起来应该只需要把 lib 下的移除，只需要保留 connectos 即可。

## 对应的包

```
b$ ls
mysql-connector-java-8.0.28.jar  seatunnel-hadoop3-3.1.4-uber-2.3.3-optional.jar  seatunnel-transforms-v2.jar

$ pwd
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/lib
```

```
$ pwd
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors/seatunnel

$ ls
connector-cdc-mysql-2.3.3.jar  connector-console-2.3.3.jar  connector-fake-2.3.3.jar
```

## 日志


```
2024-01-19 15:05:56,442 INFO  org.apache.seatunnel.core.starter.utils.ConfigShadeUtils - Load config shade spi: [base64]
2024-01-19 15:05:56,471 INFO  org.apache.seatunnel.core.starter.utils.ConfigBuilder - Parsed config file: {
    "env" : {
        "parallelism" : 1,
        "job.mode" : "STREAMING",
        "checkpoint.interval" : 10000
    },
    "source" : [
        {
            "base-url" : "jdbc:mysql://127.0.0.1:13306/etl?useSSL=false&serverTimezone=Asia/Shanghai",
            "password" : "123456",
            "startup.mode" : "initial",
            "driver" : "com.mysql.cj.jdbc.Driver",
            "table-names" : [
                "etl.user_info"
            ],
            "plugin_name" : "MySQL-CDC",
            "username" : "admin"
        }
    ],
    "transform" : [],
    "sink" : [
        {
            "plugin_name" : "Console"
        }
    ]
}

2024-01-19 15:05:56,489 INFO  org.apache.seatunnel.api.configuration.ReadonlyConfig - Config uses fallback configuration key 'plugin_name' instead of key 'factory'
2024-01-19 15:05:56,489 INFO  org.apache.seatunnel.api.configuration.ReadonlyConfig - Config uses fallback configuration key 'plugin_name' instead of key 'factory'
2024-01-19 15:05:56,493 INFO  org.apache.seatunnel.plugin.discovery.AbstractPluginDiscovery - Load SeaTunnelSink Plugin from /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors/seatunnel
2024-01-19 15:05:56,498 INFO  org.apache.seatunnel.plugin.discovery.AbstractPluginDiscovery - Discovery plugin jar: MySQL-CDC at: file:/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors/seatunnel/connector-cdc-mysql-2.3.3.jar
2024-01-19 15:05:56,499 INFO  org.apache.seatunnel.plugin.discovery.AbstractPluginDiscovery - Discovery plugin jar: Console at: file:/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors/seatunnel/connector-console-2.3.3.jar
2024-01-19 15:05:56,502 INFO  org.apache.seatunnel.engine.core.parse.MultipleTableJobConfigParser - start generating all sources.
2024-01-19 15:05:56,502 INFO  org.apache.seatunnel.api.configuration.ReadonlyConfig - Config uses fallback configuration key 'plugin_name' instead of key 'factory'
2024-01-19 15:05:56,519 INFO  org.apache.seatunnel.api.configuration.ReadonlyConfig - Config uses fallback configuration key 'plugin_name' instead of key 'factory'
2024-01-19 15:05:56,521 INFO  org.apache.seatunnel.plugin.discovery.AbstractPluginDiscovery - Load SeaTunnelSource Plugin from /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors/seatunnel
2024-01-19 15:05:56,525 INFO  org.apache.seatunnel.plugin.discovery.AbstractPluginDiscovery - Discovery plugin jar: MySQL-CDC at: file:/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors/seatunnel/connector-cdc-mysql-2.3.3.jar
2024-01-19 15:05:56,527 INFO  org.apache.seatunnel.plugin.discovery.AbstractPluginDiscovery - Load plugin: PluginIdentifier{engineType='seatunnel', pluginType='source', pluginName='MySQL-CDC'} from classpath
2024-01-19 15:05:56,686 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.catalog.AbstractJdbcCatalog - Catalog mysql established connection to jdbc:mysql://127.0.0.1:13306/etl?useSSL=false&serverTimezone=Asia/Shanghai
2024-01-19 15:05:56,738 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.catalog.AbstractJdbcCatalog - Catalog mysql closing
2024-01-19 15:05:56,786 INFO  org.apache.seatunnel.engine.core.parse.MultipleTableJobConfigParser - start generating all transforms.
2024-01-19 15:05:56,786 INFO  org.apache.seatunnel.engine.core.parse.MultipleTableJobConfigParser - start generating all sinks.
2024-01-19 15:05:56,787 INFO  org.apache.seatunnel.api.configuration.ReadonlyConfig - Config uses fallback configuration key 'plugin_name' instead of key 'factory'
2024-01-19 15:05:56,790 INFO  org.apache.seatunnel.api.configuration.ReadonlyConfig - Config uses fallback configuration key 'plugin_name' instead of key 'factory'
2024-01-19 15:05:56,829 INFO  org.apache.seatunnel.engine.client.job.ClientJobProxy - Start submit job, job id: 800621986458894337, with plugin jar [file:/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors/seatunnel/connector-cdc-mysql-2.3.3.jar, file:/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors/seatunnel/connector-console-2.3.3.jar]
2024-01-19 15:05:56,867 INFO  org.apache.seatunnel.engine.client.job.ClientJobProxy - Submit job finished, job id: 800621986458894337, job name: SeaTunnel
2024-01-19 15:05:56,874 WARN  org.apache.seatunnel.engine.client.job.JobMetricsRunner - Failed to get job metrics summary, it maybe first-run






^[[A^[[A^[[B^[[B2024-01-19 15:06:56,916 INFO  org.apache.seatunnel.engine.client.job.JobMetricsRunner -
***********************************************
           Job Progress Information
***********************************************
Job Id                    :  800621986458894337
Read Count So Far         :                   6
Write Count So Far        :                   6
Average Read Count        :                 0/s
Average Write Count       :                 0/s
Last Statistic Time       : 2024-01-19 15:05:56
Current Statistic Time    : 2024-01-19 15:06:56
***********************************************

2024-01-19 15:07:56,885 INFO  org.apache.seatunnel.engine.client.job.JobMetricsRunner -
***********************************************
           Job Progress Information
***********************************************
Job Id                    :  800621986458894337
Read Count So Far         :                   7
Write Count So Far        :                   7
Average Read Count        :                 0/s
Average Write Count       :                 0/s
Last Statistic Time       : 2024-01-19 15:06:56
Current Statistic Time    : 2024-01-19 15:07:56
***********************************************

2024-01-19 15:08:56,883 INFO  org.apache.seatunnel.engine.client.job.JobMetricsRunner -
***********************************************
           Job Progress Information
***********************************************
Job Id                    :  800621986458894337
Read Count So Far         :                   7
Write Count So Far        :                   7
Average Read Count        :                 0/s
Average Write Count       :                 0/s
Last Statistic Time       : 2024-01-19 15:07:56
Current Statistic Time    : 2024-01-19 15:08:56
***********************************************

2024-01-19 15:09:56,882 INFO  org.apache.seatunnel.engine.client.job.JobMetricsRunner -
***********************************************
           Job Progress Information
***********************************************
Job Id                    :  800621986458894337
Read Count So Far         :                   7
Write Count So Far        :                   7
Average Read Count        :                 0/s
Average Write Count       :                 0/s
Last Statistic Time       : 2024-01-19 15:08:56
Current Statistic Time    : 2024-01-19 15:09:56
***********************************************
```







# 参考资料

https://seatunnel.apache.org/docs/2.3.3/contribution/contribute-transform-v2-guide

[[Bug] [Mysql-cdc] send Mysql data to kafka ](https://github.com/apache/seatunnel/issues/5010)

[[Bug] [mysql-cdc] mysql-cdc Failed to get driver instance for jdbcUrl ](https://github.com/apache/seatunnel/issues/4959)

* any list
{:toc}
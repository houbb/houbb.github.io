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

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/contribution/contribute-transform-v2-guide

[[Bug] [Mysql-cdc] send Mysql data to kafka ](https://github.com/apache/seatunnel/issues/5010)

[[Bug] [mysql-cdc] mysql-cdc Failed to get driver instance for jdbcUrl ](https://github.com/apache/seatunnel/issues/4959)

* any list
{:toc}
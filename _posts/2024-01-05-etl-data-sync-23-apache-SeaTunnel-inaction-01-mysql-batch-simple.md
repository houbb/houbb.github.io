---
layout: post
title: ETL-23-apache SeaTunnel 实战 mysql 批量同步到 console/neo4j 入门测试用例
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# mysql 准备

创建一个测试账户：

```sql
CREATE USER 'admin'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
flush privileges;
```

# 建表

```sql
create database etl;
use etl;
```

创建测试表+初始化数据：

```sql
drop table if exists lc_enum_mapping;
create table lc_enum_mapping
(
    id int unsigned auto_increment comment '主键' primary key,
    table_name varchar(128) not null comment '表名称',
    column_name varchar(128) not null comment '字段名称',
    `key` varchar(128) not null comment '字段编码',
    label varchar(256) not null comment '字段显示',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '枚举映射表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
create unique index ix_lc_enum_mapping on lc_enum_mapping (table_name, column_name, `key`) comment '标识索引';

insert into lc_enum_mapping(table_name, column_name, `key`, label) values ('user', 'status', 'Y', '启用');
insert into lc_enum_mapping(table_name, column_name, `key`, label) values ('user', 'status', 'N', '禁用');
```

测试：

```
> select * from lc_enum_mapping;
+----+------------+-------------+-----+--------+---------------------+---------------------+
| id | table_name | column_name | key | label  | create_time         | update_time         |
+----+------------+-------------+-----+--------+---------------------+---------------------+
|  1 | user       | status      | Y   | 启用   | 2024-01-15 09:23:50 | 2024-01-15 09:23:50 |
|  2 | user       | status      | N   | 禁用   | 2024-01-15 09:23:51 | 2024-01-15 09:23:51 |
+----+------------+-------------+-----+--------+---------------------+---------------------+
2 rows in set (0.00 sec)
```

# v1-简单的 mysql => console 配置

## 需求

我们首先验证一下最简单的 mysql 到控台的功能。

```yaml
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 2
  job.mode = "BATCH"
}
source{
    Jdbc {
        url = "jdbc:mysql://localhost:3306/etl?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "admin"
        password = "123456"
        query = "select * from lc_enum_mapping limit 10"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    Console {}
}
```

## 报错 1

```
Caused by: java.lang.RuntimeException: Plugin PluginIdentifier{engineType='seatunnel', pluginType='source', pluginName='Jdbc'} not found.
	at org.apache.seatunnel.plugin.discovery.AbstractPluginDiscovery.createPluginInstance(AbstractPluginDiscovery.java:223)
	at org.apache.seatunnel.engine.core.parse.ConnectorInstanceLoader.loadSourceInstance(ConnectorInstanceLoader.java:61)
	at org.apache.seatunnel.engine.core.parse.JobConfigParser.parseSource(JobConfigParser.java:81)
	at org.apache.seatunnel.engine.core.parse.MultipleTableJobConfigParser.parseSource(MultipleTableJobConfigParser.java:317)
	at org.apache.seatunnel.engine.core.parse.MultipleTableJobConfigParser.parse(MultipleTableJobConfigParser.java:179)
	at org.apache.seatunnel.engine.core.job.AbstractJobEnvironment.getLogicalDag(AbstractJobEnvironment.java:109)
	at org.apache.seatunnel.engine.client.job.JobExecutionEnvironment.execute(JobExecutionEnvironment.java:73)
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:143)
	... 2 more
```

### 测试时 jar plugin 是如何发现的？

debug 可以看到对应的插件目录：

```
pluginDir=D:\_my\seatunnel-2.3.3-release-slim\seatunnel-common\connectors\seatunnel
```

### 解决方式

1) 引入缺失的包

在 seatunnel-engine-examples 模块引入我们需要的包。默认原来其实只有 connector-fake/connector-console/connector-assert，所以原来测试没问题。

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

2）重启 idea，避免不生效等问题。

3）重新编译安装

```
mvn clean install -DskipTests
```

## 测试日志：

```
2024-01-15 09:59:27,267 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceReader - Closed the bounded jdbc source
2024-01-15 09:59:27,268 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=1:  SeaTunnelRow#tableId= SeaTunnelRow#kind=INSERT : 1, user, status, Y, 启用, 2024-01-15T09:23:50, 2024-01-15T09:23:50
2024-01-15 09:59:27,268 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=2:  SeaTunnelRow#tableId= SeaTunnelRow#kind=INSERT : 2, user, status, N, 禁用, 2024-01-15T09:23:51, 2024-01-15T09:23:51
```

# v2-mysql=>console 添加格式处理转换

## 说明

原始的查询在落库的时候，一般是需要做一些转换处理的。

我们可以把原来的 sql source 作为第一层的结果，然后在 transform 中处理，最后在 sink 中获取结果。

## 配置

```yaml
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 2
  job.mode = "BATCH"
}
source{
    Jdbc {
        url = "jdbc:mysql://localhost:3306/etl?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "admin"
        password = "123456"
        query = "select * from lc_enum_mapping limit 10"
        result_table_name = "lc_enum_mapping_source"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
    Sql {
        source_table_name = "lc_enum_mapping_source"
        result_table_name = "lc_enum_mapping_transform"
        # id | table_name | column_name | key | label
        query = "select id, concat(table_name, '_') as table_name, column_name, key, label from lc_enum_mapping_source"
    }
}

sink {
    Console {
        source_table_name = "lc_enum_mapping_transform"
    }
}
```

## 引入转换的依赖包

这里用到了 sql 的 transform

看了下，测试模块默认包含了。

```xml
<!--   seatunnel-transforms-v2   -->
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>seatunnel-transforms-v2</artifactId>
    <version>${project.version}</version>
</dependency>
```

## 测试日志:

```
2024-01-15 10:20:16,019 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceReader - Closed the bounded jdbc source
2024-01-15 10:20:16,019 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=1:  SeaTunnelRow#tableId= SeaTunnelRow#kind=INSERT : 1, user_, status, Y, 启用
2024-01-15 10:20:16,019 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0  rowIndex=2:  SeaTunnelRow#tableId= SeaTunnelRow#kind=INSERT : 2, user_, status, N, 禁用
```

可以看到这次 console 输出的日志，已经是我们在 transform 转换处理过的了。

会有链式处理的日志：

```
2024-01-15 10:20:16,228 DEBUG org.apache.seatunnel.engine.server.checkpoint.PendingCheckpoint - acknowledgeTask states [[ActionSubtaskState(stateKey=ActionStateKey(name=ActionStateKey - pipeline-1 [Source[0]-Jdbc-lc_enum_mapping_source]), index=0, state=[]), ActionSubtaskState(stateKey=ActionStateKey(name=ActionStateKey - pipeline-1 [TransformChain[Transform[0]-Sql-lc_enum_mapping_transform]]), index=0, state=[])]]
```

# mysql=>neo4j 测试

## 说明

我们如何把 mysql 的数据写入到 neo4j 呢？

## 准备工作

首先准备好对应的 neo4j 服务。这里不做展开。

## 依赖 xml

```xml
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>connector-neo4j</artifactId>
    <version>${project.version}</version>
</dependency>
<dependency>
    <groupId>org.neo4j.driver</groupId>
    <artifactId>neo4j-java-driver</artifactId>
    <version>4.4.9</version>
</dependency>
```

## 配置文件

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 2
  job.mode = "BATCH"
}
source{
    Jdbc {
        url = "jdbc:mysql://localhost:3306/etl?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 1000
        user = "admin"
        password = "123456"
        query = "select id,table_name,column_name,`key`,label,create_time,update_time from lc_enum_mapping limit 10"
        result_table_name = "lc_enum_mapping_source"
    }
}

transform {
}

sink {
    Neo4j {
        source_table_name = "lc_enum_mapping_source"

        uri = "bolt://localhost:7687"
        username = "neo4j"
        password = "12345678"
        database = "neo4j"

        max_transaction_retry_time = 1000
        max_connection_timeout = 1000

        # id,table_name,column_name,key,label,create_time,update_time
        query = "CREATE (a:LcEnumMapping {id: $id, tableName: $table_name, columnName: $column_name, label: $label})"
        queryParamPosition = {
            id = 0
            table_name = 1
            column_name = 2
            label = 4
        }
    }
}
```

这个配置，从 mysql 中查询数据，然后插入到对应的数据库 neo4j。

## 测试效果

正常插入到 neo4j，neo4j 对应的数据：

```
MATCH (n:LcEnumMapping) RETURN n LIMIT 25
```

结果：

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:LcEnumMapping {id: 1,label: "启用",tableName: "user",columnName: "stat│
│us"})                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│(:LcEnumMapping {id: 2,label: "禁用",tableName: "user",columnName: "stat│
│us"})                                                                 │
└──────────────────────────────────────────────────────────────────────┘
```

# 一些疑问

如果想把数据库中一张表的数据，全部同步到 neo4j。要如何配置实现？

还是说只能是一次全量的同步？

我们下一篇测试下大量的数据处理，然后看一下具体效果。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/contribution/contribute-transform-v2-guide

* any list
{:toc}
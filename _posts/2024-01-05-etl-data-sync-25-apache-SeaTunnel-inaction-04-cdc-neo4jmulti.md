---
layout: post
title: ETL-25-apache SeaTunnel 实战 mysql CDC 到 neo4j multi 自定义插件
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[ETL-10-apache SeaTunnel Connector v2 source mysql cdc](https://houbb.github.io/2024/01/05/etl-data-sync-10-apache-SeaTunnel-connector-v2-source-mysql-cdc)

[mysql binlog](https://houbb.github.io/2021/08/29/mysql-binlog)

# 说明 

mysql cdc 看官方的推荐，应该是让通过 json 发送到 kafka。

不过这样也比较麻烦，如果只是简单的 cdc 监听处理，那发送到 kafka，然后再监听 kafka 处理，绕了一个大弯子。

有没有办法，直接监听 CDC 处理，然后写入到 neo4j 库中？

因为有时候 mysql 到 neo4j 可能一对多，我们这里自己实现一个插件，支持基于 CDC 的类别，做一个对应的列表处理。多个 cypher 放在一个事务中。

# 插件核心代码简介

下面是我们自定义的插件简单介绍。

## 配置例子

sink 配置例子：

```
sink {
    Neo4jMulti {
            source_table_name = "etl.user_info"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 1000
            max_connection_timeout = 1000

            # id,table_name,column_name,key,label,create_time,update_time
            queryConfigList = [
                {
                    rowKind = "INSERT"
                    query = "CREATE (a:UserInfoCdc {id: $id, username: $username})"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                },
                {
                    rowKind = "DELETE"
                    query = "MATCH (a:UserInfoCdc {id: $id, username: $username}) DELETE a"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                }
            ]
    }

}
```

## 配置解析核心代码

```java
    // TODO: 这里其实应该细分为：加一个操作条件 create delete update
    private List<Neo4jMultiQueryPosConfig> buildConfigList(final Config config) {
        List<? extends ConfigObject> list = config.getObjectList(QUERY_PARAM_POSITION.key());

        List<Neo4jMultiQueryPosConfig> resultList = new ArrayList<>();

        // 对应的类被隐藏了，所以无法直接获取。
        for(ConfigObject configObject : list) {
            String rowKind = (String) configObject.get("rowKind").unwrapped();
            String query = (String) configObject.get("query").unwrapped();
            Map<String, Object>  queryParamPosition = (Map<String, Object>) configObject.get("queryParamPosition").unwrapped();

            Neo4jMultiQueryPosConfig result = new Neo4jMultiQueryPosConfig();
            result.setRowKind(rowKind);
            result.setQuery(query);
            result.setQueryParamPosition(queryParamPosition);
            resultList.add(result);
        }

        return resultList;
    }
```

## sink 的核心代码

直接根据 cdc 的类别，过滤获取到 cypher 列表，然后放在一个事务中执行即可。

```java
@Slf4j
public class Neo4jMultiSinkWriter implements SinkWriter<SeaTunnelRow, Void, Void> {

    private final Neo4jMultiSinkQueryInfo neo4jSinkQueryInfo;
    private final transient Driver driver;
    private final transient Session session;
    private final List<Neo4jMultiSeaTunnelRowValue> writeBuffer;

    public Neo4jMultiSinkWriter(
            Neo4jMultiSinkQueryInfo neo4jSinkQueryInfo, SeaTunnelRowType seaTunnelRowType) {
        this.neo4jSinkQueryInfo = neo4jSinkQueryInfo;
        this.driver = this.neo4jSinkQueryInfo.getDriverBuilder().build();
        this.session =
                driver.session(
                        SessionConfig.forDatabase(
                                neo4jSinkQueryInfo.getDriverBuilder().getDatabase()));
        this.writeBuffer = new ArrayList<>();
    }

    @Override
    public void write(SeaTunnelRow element) throws IOException {
        writeOneByOne(element);
    }

    private void writeOneByOne(SeaTunnelRow element) {
        // 构建一个列表，能否开启一个事务处理？
        try {
            List<Neo4jMultiQueryPosConfig> filterConfigList = getFilterList(element);
            if(CollectionUtils.isEmpty(filterConfigList)) {
                return;
            }

            // 事务批量处理
            session.writeTransaction(
                    tx -> {
                        for(Neo4jMultiQueryPosConfig queryPosConfig : filterConfigList) {
                            Query query = buildNeo4jQuery(element, queryPosConfig);
                            tx.run(query);
                        }
                        return null;
                    });
        } catch (Neo4jException e) {
            throw new Neo4jConnectorException(
                    Neo4jConnectorErrorCode.DATE_BASE_ERROR, e.getMessage());
        }
    }

    private List<Neo4jMultiQueryPosConfig> getFilterList(SeaTunnelRow element) {
        // 根据配置，构建好每一个 query 信息
        final List<Neo4jMultiQueryPosConfig> queryConfigList = this.neo4jSinkQueryInfo.getQueryConfigList();

        // 过滤
        final String rowKind = element.getRowKind().name();
        final List<Neo4jMultiQueryPosConfig> filterConfigList = queryConfigList.stream()
                .filter(new Predicate<Neo4jMultiQueryPosConfig>() {
                    @Override
                    public boolean test(Neo4jMultiQueryPosConfig queryPosConfig) {
                        return rowKind.equalsIgnoreCase(queryPosConfig.getRowKind());
                    }
                }).collect(Collectors.toList());

        return filterConfigList;
    }

    private Query buildNeo4jQuery(final SeaTunnelRow element,
                                  final Neo4jMultiQueryPosConfig queryPosConfig) {
        final Map<String, Object> queryParamPosition =
                queryPosConfig.getQueryParamPosition().entrySet().stream()
                        .collect(
                                Collectors.toMap(
                                        Map.Entry::getKey,
                                        e -> element.getField((Integer) e.getValue())));
        final Query query = new Query(queryPosConfig.getQuery(), queryParamPosition);
        return query;
    }

    @Override
    public Optional<Void> prepareCommit() throws IOException {
        return Optional.empty();
    }

    @Override
    public void abortPrepare() {}

    @Override
    public void close() throws IOException {
        session.close();
        driver.close();
    }

}
```

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

# v1-mysql cdc => neo4j multi CRUD 测试

## 添加依赖

添加对应的 cdc 依赖：

```xml
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>connector-cdc-mysql</artifactId>
    <version>${project.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>connector-neo4j-multi</artifactId>
    <version>${project.version}</version>
</dependency>
```

## 配置

source 基于 mysql CDC

sink 中指定了增删改的对应操作。

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
    Neo4jMulti {
            source_table_name = "etl.user_info"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 1000
            max_connection_timeout = 1000

            # id,table_name,column_name,key,label,create_time,update_time
            queryConfigList = [
                {
                    rowKind = "INSERT"
                    query = "CREATE (a:UserInfoCdc {id: $id, username: $username})"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                },
                {
                    rowKind = "DELETE"
                    query = "MATCH (a:UserInfoCdc {id: $id, username: $username}) DELETE a"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                },
                {
                    rowKind = "UPDATE_AFTER"
                    query = "MATCH (a:UserInfoCdc {id: $id}) SET a.username=$username"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                }
            ]
    }

}
```

## 启动效果

启动时，会有对应的一些 binlog 加载处理。

neo4j 会有对应的数据。

```
╒═════════════════════════════════════════════════╕
│n                                                │
╞═════════════════════════════════════════════════╡
│(:UserInfoCdc {id: 4,username: "binlog-add-04"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 5,username: "binlog-add-05"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 6,username: "binlog-add-01"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 7,username: "binlog-add-08"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 3,username: "binlog-edit-03"})│
└─────────────────────────────────────────────────┘
```

## 测试删除

mysql 执行

```sql
delete from user_info where id=7 and username='binlog-add-08';
```

因为我们 neo4j sink 中的的删除处理，neo4j 的数据变成：

```
╒═════════════════════════════════════════════════╕
│n                                                │
╞═════════════════════════════════════════════════╡
│(:UserInfoCdc {id: 4,username: "binlog-add-04"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 5,username: "binlog-add-05"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 6,username: "binlog-add-01"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 3,username: "binlog-edit-03"})│
└─────────────────────────────────────────────────┘
```

## 添加

mysql 中执行

```sql
insert into user_info (id, username) values (7, 'binlog-add-07');
```

neo4j 中数据对应变化为：

```
╒═════════════════════════════════════════════════╕
│n                                                │
╞═════════════════════════════════════════════════╡
│(:UserInfoCdc {id: 4,username: "binlog-add-04"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 5,username: "binlog-add-05"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 6,username: "binlog-add-01"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 7,username: "binlog-add-07"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 3,username: "binlog-edit-03"})│
└─────────────────────────────────────────────────┘
```

## 修改

mysql 中执行

```sql
update user_info set username='binlog-add-06' where id=6;
```

neo4j 中的数据也会根据 sink 对应变化：

```
╒═════════════════════════════════════════════════╕
│n                                                │
╞═════════════════════════════════════════════════╡
│(:UserInfoCdc {id: 4,username: "binlog-add-04"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 5,username: "binlog-add-05"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 6,username: "binlog-add-06"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 7,username: "binlog-add-07"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 3,username: "binlog-edit-03"})│
└─────────────────────────────────────────────────┘
```


# v2-mysql cdc => neo4j multi 多个语句测试

## 说明

上面演示了对应 cdc 的增删改查。

我们下面展示一下 neo4j-multi 的另一个能力，多个 cypher 语句。

比如我们在执行 mysql cdc 增删改查同步时，同时记录每一次的操作日志。

## 编写 conf 文件

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
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    Neo4jMulti {
            source_table_name = "etl.user_info"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 1000
            max_connection_timeout = 1000

            # id,table_name,column_name,key,label,create_time,update_time
            queryConfigList = [
                {
                    rowKind = "INSERT"
                    query = "CREATE (a:UserInfoCdc {id: $id, username: $username})"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                },
                {
                    rowKind = "INSERT"
                    query = "CREATE (a:UserInfoCdcLog {id: $id, username: $username, rowKind: 'INSERT'})"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                },
                {
                    rowKind = "DELETE"
                    query = "MATCH (a:UserInfoCdc {id: $id, username: $username}) DELETE a"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                },
                {
                    rowKind = "DELETE"
                    query = "CREATE (a:UserInfoCdcLog {id: $id, username: $username, rowKind: 'DELETE'})"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                },
                {
                    rowKind = "UPDATE_AFTER"
                    query = "MATCH (a:UserInfoCdc {id: $id}) SET a.username=$username"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                },
                {
                    rowKind = "UPDATE_AFTER"
                    query = "CREATE (a:UserInfoCdcLog {id: $id, username: $username, rowKind: 'UPDATE'})"
                    queryParamPosition = {
                        id = 0
                        username = 1
                    }
                }
            ]
    }
}
```

我们在原来的 CRUD 之外，添加了对应的 UserInfoCdcLog 操作日志。

## 测试

### 启动效果

发现对应的 UserInfoCdc 和 UserInfoCdcLog 都有数据。

```
╒═════════════════════════════════════════════════╕
│n                                                │
╞═════════════════════════════════════════════════╡
│(:UserInfoCdc {id: 4,username: "binlog-add-04"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 5,username: "binlog-add-05"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 3,username: "binlog-edit-03"})│
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 6,username: "binlog-add-06"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 7,username: "binlog-add-07"}) │
└─────────────────────────────────────────────────┘
```

和

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:UserInfoCdcLog {id: 3,rowKind: "INSERT",username: "binlog-edit-03"})│
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 4,rowKind: "INSERT",username: "binlog-add-04"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 5,rowKind: "INSERT",username: "binlog-add-05"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 6,rowKind: "INSERT",username: "binlog-add-06"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 7,rowKind: "INSERT",username: "binlog-add-07"}) │
└──────────────────────────────────────────────────────────────────────┘
```

### 测试新增

mysql 执行

```sql
insert into user_info (id, username) values (8, 'binlog-add-08');
```

neo4j 数据：

```
╒═════════════════════════════════════════════════╕
│n                                                │
╞═════════════════════════════════════════════════╡
│(:UserInfoCdc {id: 4,username: "binlog-add-04"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 5,username: "binlog-add-05"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 3,username: "binlog-edit-03"})│
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 6,username: "binlog-add-06"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 7,username: "binlog-add-07"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 8,username: "binlog-add-08"}) │
└─────────────────────────────────────────────────┘
```

和

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:UserInfoCdcLog {id: 3,rowKind: "INSERT",username: "binlog-edit-03"})│
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 4,rowKind: "INSERT",username: "binlog-add-04"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 5,rowKind: "INSERT",username: "binlog-add-05"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 6,rowKind: "INSERT",username: "binlog-add-06"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 7,rowKind: "INSERT",username: "binlog-add-07"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 8,rowKind: "INSERT",username: "binlog-add-08"}) │
└──────────────────────────────────────────────────────────────────────┘
```

### 测试修改

mysql 执行：

```sql
update user_info set username = 'binlog-edit-08' where id=8;
```

neo4j 数据：

```
╒═════════════════════════════════════════════════╕
│n                                                │
╞═════════════════════════════════════════════════╡
│(:UserInfoCdc {id: 4,username: "binlog-add-04"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 5,username: "binlog-add-05"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 3,username: "binlog-edit-03"})│
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 6,username: "binlog-add-06"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 7,username: "binlog-add-07"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 8,username: "binlog-edit-08"})│
└─────────────────────────────────────────────────┘
```

和

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:UserInfoCdcLog {id: 3,rowKind: "INSERT",username: "binlog-edit-03"})│
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 4,rowKind: "INSERT",username: "binlog-add-04"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 5,rowKind: "INSERT",username: "binlog-add-05"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 6,rowKind: "INSERT",username: "binlog-add-06"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 7,rowKind: "INSERT",username: "binlog-add-07"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 8,rowKind: "INSERT",username: "binlog-add-08"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 8,rowKind: "UPDATE",username: "binlog-edit-08"})│
└──────────────────────────────────────────────────────────────────────┘
```

### 测试删除

mysql 中执行：

```sql
delete from user_info where id=8;
```

neo4j 中数据：

```
╒═════════════════════════════════════════════════╕
│n                                                │
╞═════════════════════════════════════════════════╡
│(:UserInfoCdc {id: 4,username: "binlog-add-04"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 5,username: "binlog-add-05"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 3,username: "binlog-edit-03"})│
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 6,username: "binlog-add-06"}) │
├─────────────────────────────────────────────────┤
│(:UserInfoCdc {id: 7,username: "binlog-add-07"}) │
└─────────────────────────────────────────────────┘
```

和

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:UserInfoCdcLog {id: 3,rowKind: "INSERT",username: "binlog-edit-03"})│
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 4,rowKind: "INSERT",username: "binlog-add-04"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 5,rowKind: "INSERT",username: "binlog-add-05"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 6,rowKind: "INSERT",username: "binlog-add-06"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 7,rowKind: "INSERT",username: "binlog-add-07"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 8,rowKind: "INSERT",username: "binlog-add-08"}) │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 8,rowKind: "UPDATE",username: "binlog-edit-08"})│
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: 8,rowKind: "DELETE",username: "binlog-edit-08"})│
└──────────────────────────────────────────────────────────────────────┘
```


# windows wsl linux 服务端模式运行

## 包冲突

v2 的 connector，需要把 lib 下面的 connector 包删除。

系统默认优先从 connectors 中读取。

## 说明

服务端运行时，会有一些不同。

本地 mvn clean install 打包，把对应的包命名为 connector-neo4j-multi-2.3.3.jar 放入到 connectors 下。

但是发现依然会报错，说插件不存在。

为什么内置的可以，我们自己定义不行？

```
~/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/connectors$ ls
plugin-mapping.properties  seatunnel
```

看了下需要改一下 `plugin-mapping.properties`。

加一下我们自定义的插件：

```
# SeaTunnel Connector-V2
seatunnel.sink.Neo4jMulti = connector-neo4j-multi

seatunnel.source.FakeSource = connector-fake
seatunnel.sink.Console = connector-console
```

后面的版本一定要保持一致。

## 2.2 服务启动

```bash
cd /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3
bash bin/stop-seatunnel-cluster.sh
nohup bash bin/seatunnel-cluster.sh 2>&1 &
```

### 运行命令：

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --config /home/dh/bigdata/seatunnel-2.3.3/config/mysql_cdc_to_neo4j_multi.conf
```

日志查看在 

```bash
tail -f /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/logs/seatunnel-engine-server.log
```

## neo4j 启动效果

```
MATCH (n:UserInfoCdc) RETURN n LIMIT 25
```

数据：

```
╒═══════════════════════════════════════════════════════╕
│n                                                      │
╞═══════════════════════════════════════════════════════╡
│(:UserInfoCdc {id: "2024-01-19T13:27:05",username: 1}) │
├───────────────────────────────────────────────────────┤
│(:UserInfoCdc {id: "2024-01-19T13:27:12",username: 2}) │
├───────────────────────────────────────────────────────┤
│(:UserInfoCdc {id: "2024-01-19T13:27:31",username: 3}) │
├───────────────────────────────────────────────────────┤
│(:UserInfoCdc {id: "2024-01-19T13:28:20",username: 4}) │
├───────────────────────────────────────────────────────┤
│(:UserInfoCdc {id: "2024-01-19T13:30:43",username: 5}) │
├───────────────────────────────────────────────────────┤
│(:UserInfoCdc {id: "2024-01-19T15:06:25",username: 9}) │
├───────────────────────────────────────────────────────┤
│(:UserInfoCdc {id: "2024-01-19T15:07:12",username: 10})│
├───────────────────────────────────────────────────────┤
│(:UserInfoCdc {id: "2024-01-19T15:41:08",username: 11})│
└───────────────────────────────────────────────────────┘
```

## neo4j 增量效果

mysql 测试插入效果：

```sql
insert into user_info (id, username) values (8, 'etl-cdc-08');
```

再次查看 neo4j 中的数据：

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:UserInfoCdcLog {id: "2024-01-19T13:30:43",rowKind: "INSERT",username│
│: 5})                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: "2024-01-19T13:27:05",rowKind: "INSERT",username│
│: 1})                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: "2024-01-19T15:06:25",rowKind: "INSERT",username│
│: 9})                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: "2024-01-19T13:27:12",rowKind: "INSERT",username│
│: 2})                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: "2024-01-19T15:07:12",rowKind: "INSERT",username│
│: 10})                                                                │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: "2024-01-19T13:27:31",rowKind: "INSERT",username│
│: 3})                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: "2024-01-19T15:41:08",rowKind: "INSERT",username│
│: 11})                                                                │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: "2024-01-19T13:28:20",rowKind: "INSERT",username│
│: 4})                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: "2024-01-23T10:09:39",rowKind: "INSERT",username│
│: 12})                                                                │
├──────────────────────────────────────────────────────────────────────┤
│(:UserInfoCdcLog {id: "2024-01-23T10:12:38",rowKind: "INSERT",username│
│: 13})                                                                │
└──────────────────────────────────────────────────────────────────────┘
```

PS: 这里的属性值好像错了，回来调整一下。

# 小结

到这里，可以发现 seaTunnel 的设计给后续的拓展提供了强大的灵活性基础。

只不过 v2 的 transform 相对比较弱，但是都可以自定义拓展。所以问题不大。

* any list
{:toc}
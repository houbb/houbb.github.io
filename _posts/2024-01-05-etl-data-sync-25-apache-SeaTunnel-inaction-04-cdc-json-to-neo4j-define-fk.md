---
layout: post
title: ETL-25-apache SeaTunnel 实战 mysql CDC json 到 neo4j 自定义插件，包含外键
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[ETL-10-apache SeaTunnel Connector v2 source mysql cdc](https://houbb.github.io/2024/01/05/etl-data-sync-10-apache-SeaTunnel-connector-v2-source-mysql-cdc)

[mysql binlog](https://houbb.github.io/2021/08/29/mysql-binlog)

# 说明 

mysql cdc json 格式，发送到 neo4j 持久化。

同时支持外键。

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
use test;

CREATE TABLE users
(
    id       INT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL
);

CREATE TABLE user_extra
(
    user_id   INT PRIMARY KEY,
    full_name VARCHAR(255),
    address   VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);


insert into users(id, username, email) values (1, 'u-1', '1@qq.com');
insert into user_extra(user_id, full_name, address) values (1, 'user-1', '藏剑山庄');
```

数据确认：

```
mysql> select * from users;
+----+----------+----------+
| id | username | email    |
+----+----------+----------+
|  1 | u-1      | 1@qq.com |
+----+----------+----------+
1 row in set (0.00 sec)

mysql> select * from user_extra;
+---------+-----------+--------------+
| user_id | full_name | address      |
+---------+-----------+--------------+
|       1 | user-1    | 藏剑山庄     |
+---------+-----------+--------------+
1 row in set (0.00 sec)
```

## 同步脚本

针对 2 张表的增+删+改，包含外键的处理。

对应 mysql-to-neo4j 版本为 v0.12.0

- allInOne-CDC-JSON-STREAMING.conf

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "allInOne-CDC-JSON-STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:3306/test?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["test.users", "test.user_extra"]

        startup.mode = "initial"
        format = compatible_debezium_json
        debezium = {
           # include schema into kafka message
           key.converter.schemas.enable = false
           value.converter.schemas.enable = false
           # include dd1
           include.schema.changes = false
           # topic.prefix
           database.server.name = "merge"
        }
        result_table_name="allInOne-CDC-JSON-result"
    }

}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    MysqlToNeo4j {
            source_table_name = "allInOne-CDC-JSON-result"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 30000
            max_connection_timeout = 30000

            format = compatible_debezium_json

            queryConfigList = [
                {
                    tableName = "merge.test.user_extra"
                    rowKind = "INSERT"
                    query = "MERGE (p:merge_user_extra {  user_id: $user_id  }) SET p.user_id = $user_id, p.full_name = $full_name, p.address = $address"
                    queryParamPosition = {
                        user_id = "$.after.user_id"
                        full_name = "$.after.full_name"
                        address = "$.after.address"
                        ts_ms = "$.ts_ms"
                    }
                },
                {
                    tableName = "merge.test.user_extra"
                    rowKind = "INSERT"
                    query = "MERGE (from:merge_user_extra { user_id: $user_id }) MERGE (to:merge_users { id: $user_id }) MERGE (from)-[:user_extra_user_id_to_users_id]->(to)"
                    queryParamPosition = {
                        user_id = "$.after.user_id"
                        full_name = "$.after.full_name"
                        address = "$.after.address"
                        ts_ms = "$.ts_ms"
                    }
                },
                {
                    tableName = "merge.test.user_extra"
                    rowKind = "DELETE"
                    query = "MATCH (p:merge_user_extra) WHERE   p.user_id = $user_id   DETACH DELETE p"
                    queryParamPosition = {
                        user_id = "$.before.user_id"
                        full_name = "$.before.full_name"
                        address = "$.before.address"
                        ts_ms = "$.ts_ms"
                    }
                },
                {
                    tableName = "merge.test.user_extra"
                    rowKind = "UPDATE_AFTER"
                    query = "MERGE (p:merge_user_extra {  user_id: $user_id  }) SET p.user_id = $user_id, p.full_name = $full_name, p.address = $address"
                    queryParamPosition = {
                        user_id = "$.after.user_id"
                        full_name = "$.after.full_name"
                        address = "$.after.address"
                        ts_ms = "$.ts_ms"
                    }
                },
                {
                    tableName = "merge.test.users"
                    rowKind = "INSERT"
                    query = "MERGE (p:merge_users {  id: $id  }) SET p.id = $id, p.username = $username, p.email = $email"
                    queryParamPosition = {
                        id = "$.after.id"
                        username = "$.after.username"
                        email = "$.after.email"
                        ts_ms = "$.ts_ms"
                    }
                },
                {
                    tableName = "merge.test.users"
                    rowKind = "DELETE"
                    query = "MATCH (p:merge_users) WHERE   p.id = $id   DETACH DELETE p"
                    queryParamPosition = {
                        id = "$.before.id"
                        username = "$.before.username"
                        email = "$.before.email"
                        ts_ms = "$.ts_ms"
                    }
                },
                {
                    tableName = "merge.test.users"
                    rowKind = "UPDATE_AFTER"
                    query = "MERGE (p:merge_users {  id: $id  }) SET p.id = $id, p.username = $username, p.email = $email"
                    queryParamPosition = {
                        id = "$.after.id"
                        username = "$.after.username"
                        email = "$.after.email"
                        ts_ms = "$.ts_ms"
                    }
                }
            ]
    }
}
```

主要是插入/删除/更新。

插入的时候，多了一个边的创建。

删除的时候，调整为 `DETACH DELETE` 级联删除，避免边存在，导致无法删除节点。

# 实际测试

## 测试方式

seatunnel v2.3.3 版本单元测试。

## 启动效果

默认使用 initial 模式启动，数据如下：

```
╒════════════════════════════════════════════════════════════════════╕
│n                                                                   │
╞════════════════════════════════════════════════════════════════════╡
│(:merge_user_extra {full_name: "user-1",address: "藏剑山庄",user_id: 1})│
├────────────────────────────────────────────────────────────────────┤
│(:merge_users {id: 1,email: "1@qq.com",username: "u-1"})            │
└────────────────────────────────────────────────────────────────────┘
```

还有1条指向的关系。

## 插入数据效果

### 源头

```sql
insert into users(id, username, email) values (2, 'u-2', '2@qq.com');
insert into user_extra(user_id, full_name, address) values (2, 'user-2', '大漠');
```

### 目标数据

```
╒════════════════════════════════════════════════════════════════════╕
│n                                                                   │
╞════════════════════════════════════════════════════════════════════╡
│(:merge_user_extra {full_name: "user-1",address: "藏剑山庄",user_id: 1})│
├────────────────────────────────────────────────────────────────────┤
│(:merge_users {id: 1,email: "1@qq.com",username: "u-1"})            │
├────────────────────────────────────────────────────────────────────┤
│(:merge_users {id: 2,email: "2@qq.com",username: "u-2"})            │
├────────────────────────────────────────────────────────────────────┤
│(:merge_user_extra {address: "大漠",full_name: "user-2",user_id: 2})  │
└────────────────────────────────────────────────────────────────────┘
```

2条边的关系是分别指向的。

## 修改数据效果

为了简单，我们分别修改一个 users，一个 user_extra

```sql
update users set username = 'u-1-edit' where id=1;
update user_extra set full_name = 'user-2-edit' where user_id=2;
```

此时目标库数据：

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_extra {full_name: "user-1",address: "藏剑山庄",user_id: 1})  │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_users {id: 1,email: "1@qq.com",username: "u-1-edit"})         │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_users {id: 2,email: "2@qq.com",username: "u-2"})              │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_extra {address: "大漠",full_name: "user-2-edit",user_id: 2}│
│)                                                                     │
└──────────────────────────────────────────────────────────────────────┘
```

2 条边的关系依然存在。

## 删除数据效果

1）删除 1 个 users 信息

```sql
delete from users where id=1;
```

数据变成：

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_extra {full_name: "user-1",address: "藏剑山庄",user_id: 1})  │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_users {id: 2,email: "2@qq.com",username: "u-2"})              │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_extra {address: "大漠",full_name: "user-2-edit",user_id: 2}│
│)                                                                     │
└──────────────────────────────────────────────────────────────────────┘
```

且此时和 user.id=1 的边也同时被删除。

2) 删除 1 个 user_extra 信息

```sql
delete from user_extra where user_id=2;
```

数据变成：

```
╒════════════════════════════════════════════════════════════════════╕
│n                                                                   │
╞════════════════════════════════════════════════════════════════════╡
│(:merge_user_extra {full_name: "user-1",address: "藏剑山庄",user_id: 1})│
├────────────────────────────────────────────────────────────────────┤
│(:merge_users {id: 2,email: "2@qq.com",username: "u-2"})            │
└────────────────────────────────────────────────────────────────────┘
```

且此时所有的边已经被删除。


# 小结

整体设计还是需要注意一下，比如删除的级联设计。

* any list
{:toc}
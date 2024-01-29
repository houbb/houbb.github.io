---
layout: post
title: ETL-25-apache SeaTunnel 实战 mysql CDC default neo4j 自定义插件
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

drop table if exists role_info;
create table role_info
(
    id int unsigned auto_increment comment '主键' primary key,
    role_name varchar(128) not null comment '角色名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '角色表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
```

插入语句

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

确认：

```
mysql>  select * from user_info;
+----+----------+---------------------+---------------------+
| id | username | create_time         | update_time         |
+----+----------+---------------------+---------------------+
|  1 | u1       | 2024-01-29 14:27:06 | 2024-01-29 14:27:06 |
|  2 | u2       | 2024-01-29 14:27:07 | 2024-01-29 14:27:07 |
|  3 | u3       | 2024-01-29 14:27:07 | 2024-01-29 14:27:07 |
|  4 | u4       | 2024-01-29 14:27:07 | 2024-01-29 14:27:07 |
+----+----------+---------------------+---------------------+

mysql> select * from role_info;
+----+-----------+---------------------+---------------------+
| id | role_name | create_time         | update_time         |
+----+-----------+---------------------+---------------------+
|  1 | r1        | 2024-01-29 15:46:14 | 2024-01-29 15:46:14 |
|  2 | r2        | 2024-01-29 15:46:14 | 2024-01-29 15:46:14 |
|  3 | r3        | 2024-01-29 15:46:14 | 2024-01-29 15:46:14 |
|  4 | r4        | 2024-01-29 15:46:14 | 2024-01-29 15:46:14 |
+----+-----------+---------------------+---------------------+
```

# v1-基本功能的测试

说明：基本的功能测试条件。

## 配置文件

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "merge_migrate_source.user_info-STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:3306/migrate_source?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["migrate_source.user_info"]

        startup.mode = "initial"
        result_table_name="merge_migrate_source.user_info"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    MysqlToNeo4j {
            source_table_name = "merge_migrate_source.user_info"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 30000
            max_connection_timeout = 30000

            format = "default"

            queryConfigList = [
                {
                    tableName = "merge.migrate_source.user_info"
                    rowKind = "INSERT"
                    query = "create(p:merge_user_info {id: $id, username: $username, create_time: $create_time, update_time: $update_time})"
                    queryParamPosition = {
                        id = 0
                        username = 1
                        create_time = 2
                        update_time = 3
                    }
                },
                {
                    tableName = "merge.migrate_source.user_info"
                    rowKind = "DELETE"
                    query = "MATCH (p:merge_user_info) WHERE   p.id = $id   DELETE p"
                    queryParamPosition = {
                        id = 0
                        username = 1
                        create_time = 2
                        update_time = 3
                    }
                },
                {
                    tableName = "merge.migrate_source.user_info"
                    rowKind = "UPDATE_AFTER"
                    query = "MATCH (p:merge_user_info) WHERE   p.id = $id   SET p.id = $id, p.username = $username, p.create_time = $create_time, p.update_time = $update_time"
                    queryParamPosition = {
                        id = 0
                        username = 1
                        create_time = 2
                        update_time = 3
                    }
                }
            ]
    }
}
```

## 启动初始化

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_info {update_time: "2024-01-29T14:27:06",create_time: "20│
│24-01-29T14:27:06",id: 1,username: "u1"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 2,username: "u2"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 3,username: "u3"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 4,username: "u4"})                             │
└──────────────────────────────────────────────────────────────────────┘
```

## 修改操作

### add

source:

```sql
insert into user_info(username) values ('u5');
```

target:

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_info {update_time: "2024-01-29T14:27:06",create_time: "20│
│24-01-29T14:27:06",id: 1,username: "u1"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 2,username: "u2"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 3,username: "u3"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 4,username: "u4"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:29:16",create_time: "20│
│24-01-29T14:29:16",id: 5,username: "u5"})                             │
└──────────────────────────────────────────────────────────────────────┘
```

### edit

source:

```sql
update user_info  set username='u5-edit' where id=5;
```

target:

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_info {update_time: "2024-01-29T14:27:06",create_time: "20│
│24-01-29T14:27:06",id: 1,username: "u1"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 2,username: "u2"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 3,username: "u3"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 4,username: "u4"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:29:42",create_time: "20│
│24-01-29T14:29:16",id: 5,username: "u5-edit"})                        │
└──────────────────────────────────────────────────────────────────────┘
```

### remove

source:

```sql
delete from user_info where id=5;
```

target:

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_info {update_time: "2024-01-29T14:27:06",create_time: "20│
│24-01-29T14:27:06",id: 1,username: "u1"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 2,username: "u2"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 3,username: "u3"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 4,username: "u4"})                             │
└──────────────────────────────────────────────────────────────────────┘
```

# v2-insertOrUpdate  

说明：同时支持 insert/update 的语句模式。

## 实现思路

利用 neo4j 的 merge 语句：

```cypher
MERGE (p:Person {id: $id})
SET p.name = $name
RETURN p
```

这个查询首先尝试根据给定的id查找匹配的Person节点。如果节点存在，则更新节点的name属性；如果节点不存在，则创建一个新节点，并设置id和name属性。

比如：

第一次执行时插入:

```
MERGE (p:Person {id: 123})
SET p.name = 'John Doe'
RETURN p
```

再次执行时更新：

```
MERGE (p:Person {id: 123})
SET p.name = 'John Doe-edit'
RETURN p
```

## 配置文件写法

通过 merge 的写法，让 insert/update 变成同一个逻辑。

有时候数据接收的顺序可以保证兼容。

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "merge_migrate_source.user_info-STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:3306/migrate_source?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["migrate_source.user_info"]

        startup.mode = "initial"
        result_table_name="merge_migrate_source.user_info"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    MysqlToNeo4j {
            source_table_name = "merge_migrate_source.user_info"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 30000
            max_connection_timeout = 30000

            format = "default"

            queryConfigList = [
                {
                    tableName = "merge.migrate_source.user_info"
                    rowKind = "INSERT"
                    query = "MERGE (p:merge_user_info {  id: $id  }) SET p.id = $id, p.username = $username, p.create_time = $create_time, p.update_time = $update_time"
                    queryParamPosition = {
                        id = 0
                        username = 1
                        create_time = 2
                        update_time = 3
                    }
                },
                {
                    tableName = "merge.migrate_source.user_info"
                    rowKind = "DELETE"
                    query = "MATCH (p:merge_user_info) WHERE   p.id = $id   DELETE p"
                    queryParamPosition = {
                        id = 0
                        username = 1
                        create_time = 2
                        update_time = 3
                    }
                },
                {
                    tableName = "merge.migrate_source.user_info"
                    rowKind = "UPDATE_AFTER"
                    query = "MERGE (p:merge_user_info {  id: $id  }) SET p.id = $id, p.username = $username, p.create_time = $create_time, p.update_time = $update_time"
                    queryParamPosition = {
                        id = 0
                        username = 1
                        create_time = 2
                        update_time = 3
                    }
                }
            ]
    }
}
```

## 准备工作

清空一下原来 target 的数据。

## 初始化启动

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_info {update_time: "2024-01-29T14:27:06",create_time: "20│
│24-01-29T14:27:06",id: 1,username: "u1"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 2,username: "u2"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 3,username: "u3"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 4,username: "u4"})                             │
└──────────────────────────────────────────────────────────────────────┘
```

## 修改操作

### add

source:

```sql
insert into user_info(id, username) values (5, 'u5');
```

target:

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_info {update_time: "2024-01-29T14:27:06",create_time: "20│
│24-01-29T14:27:06",id: 1,username: "u1"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 2,username: "u2"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 3,username: "u3"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 4,username: "u4"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:56:37",create_time: "20│
│24-01-29T14:56:37",id: 5,username: "u5"})                             │
└──────────────────────────────────────────────────────────────────────┘
```

### edit

source:

```sql
update user_info  set username='u5-edit' where id=5;
```

target:

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_info {update_time: "2024-01-29T14:27:06",create_time: "20│
│24-01-29T14:27:06",id: 1,username: "u1"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 2,username: "u2"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 3,username: "u3"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 4,username: "u4"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:57:01",create_time: "20│
│24-01-29T14:56:37",id: 5,username: "u5-edit"})                        │
└──────────────────────────────────────────────────────────────────────┘
```

### remove

source:

```sql
delete from user_info where id=5;
```

target:

```
╒══════════════════════════════════════════════════════════════════════╕
│n                                                                     │
╞══════════════════════════════════════════════════════════════════════╡
│(:merge_user_info {update_time: "2024-01-29T14:27:06",create_time: "20│
│24-01-29T14:27:06",id: 1,username: "u1"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 2,username: "u2"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 3,username: "u3"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T14:27:07",create_time: "20│
│24-01-29T14:27:07",id: 4,username: "u4"})                             │
└──────────────────────────────────────────────────────────────────────┘
```


# v3-allInOne 模式

说明：所有的语句，生成唯一一个文件。

## 思路

文件生成的时候，所有的表放在一起，然后不要循环生成。

当然每一张表单独一个 streaming 也可以，但是这样当表特别多的时候，就会导致暂用大量的线程去处理。

## 配置文件

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "allInOne-CDC-STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:3306/migrate_source?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["migrate_source.role_info", "migrate_source.user_info"]

        startup.mode = "initial"
        result_table_name="allInOne-CDC-result"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    MysqlToNeo4j {
            source_table_name = "allInOne-CDC-result"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 30000
            max_connection_timeout = 30000

            format = "default"

            queryConfigList = [
                {
                    tableName = "merge.migrate_source.role_info"
                    rowKind = "INSERT"
                    query = "MERGE (p:merge_role_info {  id: $id  }) SET p.id = $id, p.rolename = $rolename, p.create_time = $create_time, p.update_time = $update_time"
                    queryParamPosition = {
                        id = 0
                        rolename = 1
                        create_time = 2
                        update_time = 3
                    }
                },
                {
                    tableName = "merge.migrate_source.role_info"
                    rowKind = "DELETE"
                    query = "MATCH (p:merge_role_info) WHERE   p.id = $id   DELETE p"
                    queryParamPosition = {
                        id = 0
                        rolename = 1
                        create_time = 2
                        update_time = 3
                    }
                },
                {
                    tableName = "merge.migrate_source.role_info"
                    rowKind = "UPDATE_AFTER"
                    query = "MERGE (p:merge_role_info {  id: $id  }) SET p.id = $id, p.rolename = $rolename, p.create_time = $create_time, p.update_time = $update_time"
                    queryParamPosition = {
                        id = 0
                        rolename = 1
                        create_time = 2
                        update_time = 3
                    }
                },
                {
                    tableName = "merge.migrate_source.user_info"
                    rowKind = "INSERT"
                    query = "MERGE (p:merge_user_info {  id: $id  }) SET p.id = $id, p.username = $username, p.create_time = $create_time, p.update_time = $update_time"
                    queryParamPosition = {
                        id = 0
                        username = 1
                        create_time = 2
                        update_time = 3
                    }
                },
                {
                    tableName = "merge.migrate_source.user_info"
                    rowKind = "DELETE"
                    query = "MATCH (p:merge_user_info) WHERE   p.id = $id   DELETE p"
                    queryParamPosition = {
                        id = 0
                        username = 1
                        create_time = 2
                        update_time = 3
                    }
                },
                {
                    tableName = "merge.migrate_source.user_info"
                    rowKind = "UPDATE_AFTER"
                    query = "MERGE (p:merge_user_info {  id: $id  }) SET p.id = $id, p.username = $username, p.create_time = $create_time, p.update_time = $update_time"
                    queryParamPosition = {
                        id = 0
                        username = 1
                        create_time = 2
                        update_time = 3
                    }
                }
            ]
    }
}
```

## 实际测试

### 清空操作

```
MATCH (n:merge_user_info) delete n;
MATCH (n:merge_role_info) delete n;
```

### 启动初始化

```
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T15:10:47",create_time: "20│
│24-01-29T15:10:47",id: 1,username: "r1"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_role_info {update_time: "2024-01-29T15:10:47",create_time: "20│
│24-01-29T15:10:47",rolename: "r2",id: 2})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T15:10:47",create_time: "20│
│24-01-29T15:10:47",id: 2,username: "r2"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_role_info {update_time: "2024-01-29T15:10:47",create_time: "20│
│24-01-29T15:10:47",rolename: "r3",id: 3})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T15:10:47",create_time: "20│
│24-01-29T15:10:47",id: 3,username: "r3"})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_role_info {update_time: "2024-01-29T15:10:47",create_time: "20│
│24-01-29T15:10:47",rolename: "r4",id: 4})                             │
├──────────────────────────────────────────────────────────────────────┤
│(:merge_user_info {update_time: "2024-01-29T15:10:47",create_time: "20│
│24-01-29T15:10:47",id: 4,username: "r4"})                             │
└──────────────────────────────────────────────────────────────────────┘
```

## 启动失败

实际测试，当启动的时候，如果指定多个表，那么会失败。

应该是不同的表结构同步查询的时候出现问题，pull NetRecord 构建直接异常。

# 小结

保证灵活性与隔离性。

* any list
{:toc}
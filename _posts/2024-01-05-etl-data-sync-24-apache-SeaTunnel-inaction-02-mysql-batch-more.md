---
layout: post
title: ETL-24-apache SeaTunnel 实战 mysql 批量同步到 console/neo4j 更近一步测试用例
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

初始化 1W 条数据。

测试：

```
> select count(*) from  user_info;
```

# v1-mysql => mysql 配置

## 需求

我们首先验证一下最简单的 mysql 到控台的功能。

主要验证一下 fetch_size。

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
        query = "select id, username from user_info"
        fetch_size = 100
        result_table_name = "user_info_source"
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    Jdbc {
        source_table_name = "user_info_source"
        url = "jdbc:mysql://localhost:3306/etl?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "admin"
        password = "123456"
        query = "insert into user_info_bak(id, username) values(?, ?)"
    }
}
```

我们希望同步全量的表信息，这里为了避免一次查询过大，指定了 fetch_size=100

### 不足

感觉这里还没有 neo4j 的方便，因为参数看文档，只有 `?` 的方式，无法指定对应的字段？

## 测试效果

```
mysql> select count(*) from user_info_bak;
+----------+
| count(*) |
+----------+
|     9999 |
+----------+
1 row in set (0.02 sec)
```

同步速度还是很快的。

## 疑问？

这个是一次性的吗？如果发生变化了，怎么办？

# 一些疑问

如果想把数据库中一张表的数据，全部同步到 neo4j。要如何配置实现？

还是说只能是一次全量的同步？

我们下一篇测试下大量的数据处理，然后看一下具体效果。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/contribution/contribute-transform-v2-guide

* any list
{:toc}
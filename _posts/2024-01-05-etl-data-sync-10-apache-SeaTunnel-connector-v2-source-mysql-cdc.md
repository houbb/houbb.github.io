---
layout: post
title: ETL-10-apache SeaTunnel Connector v2 source mysql cdc
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# MySQL-CDC

> [MySQL-CDC](https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/MySQL-CDC)

https://seatunnel.apache.org/docs/connector-v2/source/MySQL-CDC

MySQL CDC source connector

## 描述

MySQL CDC 连接器允许从MySQL数据库读取快照数据和增量数据。

本文档描述了如何设置 MySQL CDC 连接器以针对 MySQL 数据库运行 SQL 查询。

## 主要特点

- 批处理 ×
- 流处理
- 精确一次
- 列投影 ×
- 并行性
- 支持用户定义的拆分


# 数据库依赖

## 安装 JDBC 驱动程序

请下载并将 MySQL 驱动程序放置在 ${SEATUNNEL_HOME}/lib/ 目录中。例如：cp mysql-connector-java-xxx.jar $SEATNUNNEL_HOME/lib/

## 创建 MySQL 用户

您需要在 Debezium MySQL 连接器监视的所有数据库上定义一个具有适当权限的MySQL用户。

1) 创建 MySQL 用户：

```sql
mysql> CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
```

2) 指定权限:

```sql
mysql> GRANT SELECT, RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'user' IDENTIFIED BY 'password';
```

3) 刷新

```sql
mysql> FLUSH PRIVILEGES;
```

# 启用MySQL二进制日志

在MySQL复制中，你必须启用二进制日志。二进制日志记录事务更新，以便复制工具传播更改。

1) 检查log-bin选项是否已经开启：

```sql
mysql> show variables where variable_name in ('log_bin', 'binlog_format', 'binlog_row_image', 'gtid_mode', 'enforce_gtid_consistency');
+--------------------------+----------------+
| Variable_name            | Value          |
+--------------------------+----------------+
| binlog_format            | ROW            |
| binlog_row_image         | FULL           |
| enforce_gtid_consistency | ON             |
| gtid_mode                | ON             |
| log_bin                  | ON             |
+--------------------------+----------------+
5 rows in set (0.00 sec)
```

2) 如果与上述结果不一致，请使用以下属性配置你的MySQL服务器配置文件（$MYSQL_HOME/mysql.cnf）。

这些属性在下表中进行了描述：


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

3) 重启服务

```bash
/etc/inint.d/mysqld restart
```

4) 再次确认配置

```sql
mysql> show variables where variable_name in ('log_bin', 'binlog_format', 'binlog_row_image', 'gtid_mode', 'enforce_gtid_consistency');
+--------------------------+----------------+
| Variable_name            | Value          |
+--------------------------+----------------+
| binlog_format            | ROW            |
| binlog_row_image         | FULL           |
| enforce_gtid_consistency | ON             |
| gtid_mode                | ON             |
| log_bin                  | ON             |
+--------------------------+----------------+
5 rows in set (0.00 sec)
```

## 设置MySQL会话超时

在为大型数据库创建初始一致性快照时，当正在读取表时，你建立的连接可能会超时。

你可以通过在MySQL配置文件中配置interactive_timeout和wait_timeout来防止这种情况发生。

- interactive_timeout：在关闭交互连接之前，服务器等待交互连接上的活动的秒数。更多详细信息请参阅MySQL的文档。

- wait_timeout：在关闭非交互连接之前，服务器等待非交互连接上的活动的秒数。更多详细信息请参阅MySQL的文档。

有关更多数据库设置，请参阅Debezium MySQL Connector。

# 选项

| 名称                                    | 类型             | 必需     | 默认值          |
|-----------------------------------------|------------------|----------|-----------------|
| username                                | 字符串            | 是       | -               |
| password                                | 字符串            | 是       | -               |
| database-names                          | 列表              | 否       | -               |
| table-names                             | 列表              | 是       | -               |
| base-url                                | 字符串            | 是       | -               |
| startup.mode                            | 枚举              | 否       | INITIAL         |
| startup.timestamp                       | 长整数            | 否       | -               |
| startup.specific-offset.file            | 字符串            | 否       | -               |
| startup.specific-offset.pos             | 长整数            | 否       | -               |
| stop.mode                               | 枚举              | 否       | NEVER           |
| stop.timestamp                          | 长整数            | 否       | -               |
| stop.specific-offset.file               | 字符串            | 否       | -               |
| stop.specific-offset.pos                | 长整数            | 否       | -               |
| incremental.parallelism                 | 整数             | 否       | 1               |
| snapshot.split.size                     | 整数             | 否       | 8096            |
| snapshot.fetch.size                     | 整数             | 否       | 1024            |
| server-id                               | 字符串            | 否       | -               |
| server-time-zone                        | 字符串            | 否       | UTC             |
| connect.timeout.ms                      | 时长              | 否       | 30000           |
| connect.max-retries                     | 整数             | 否       | 3               |
| connection.pool.size                    | 整数             | 否       | 20              |
| chunk-key.even-distribution.factor.upper-bound | 双精度浮点数 | 否       | 100             |
| chunk-key.even-distribution.factor.lower-bound | 双精度浮点数 | 否       | 0.05            |
| sample-sharding.threshold               | 整数             | 否       | 1000            |
| inverse-sampling.rate                   | 整数             | 否       | 1000            |
| exactly_once                           | 布尔             | 否       | true            |
| debezium.*                              | 配置             | 否       | -               |
| format                                  | 枚举              | 否       | DEFAULT         |
| common-options                          | 无               | 否       | -               |

这是一份关于MySQL CDC连接器的选项配置列表。

根据您的需求，您可以根据这些选项进行适当的配置。

username [String]
连接到数据库服务器时要使用的数据库名称。

password [String]
连接到数据库服务器时要使用的密码。

database-names [List]
要监视的数据库的数据库名称。

table-names [List]
要监视的数据库的表名称。表名称需要包含数据库名称，例如：database_name.table_name

base-url [String]
URL 必须包含数据库，例如 "jdbc:mysql://localhost:5432/db" 或 "jdbc:mysql://localhost:5432/db?useSSL=true"。

startup.mode [Enum]
MySQL CDC 消费者的可选启动模式，有效的枚举值为 "initial"、"earliest"、"latest" 和 "specific"。

startup.timestamp [Long]
从指定的纪元时间戳开始（以毫秒为单位）。

注意，当 "startup.mode" 选项使用 'timestamp' 时，此选项是必需的。

startup.specific-offset.file [String]
从指定的 binlog 文件名开始。

注意，当 "startup.mode" 选项使用 'specific' 时，此选项是必需的。

startup.specific-offset.pos [Long]
从指定的 binlog 文件位置开始。

注意，当 "startup.mode" 选项使用 'specific' 时，此选项是必需的。

stop.mode [Enum]
MySQL CDC 消费者的可选停止模式，有效的枚举值为 "never"。

stop.timestamp [Long]
从指定的纪元时间戳停止（以毫秒为单位）。

注意，当 "stop.mode" 选项使用 'timestamp' 时，此选项是必需的。

stop.specific-offset.file [String]
从指定的 binlog 文件名停止。

注意，当 "stop.mode" 选项使用 'specific' 时，此选项是必需的。

stop.specific-offset.pos [Long]
从指定的 binlog 文件位置停止。

注意，当 "stop.mode" 选项使用 'specific' 时，此选项是必需的。

incremental.parallelism [Integer]
增量阶段的并行读取器数量。

snapshot.split.size [Integer]
表快照的拆分大小（行数）。在读取表的快照时，捕获的表会被拆分为多个拆分。

snapshot.fetch.size [Integer]
读取表快照时每次轮询的最大获取大小。

chunk-key.even-distribution.factor.upper-bound [Double]
块键分布因子的上限。此因子用于确定表数据是否均匀分布。如果分布因子计算出小于或等于此上限（即 (MAX(id) - MIN(id) + 1) / 行数），则表块将被优化为均匀分布。否则，如果分布因子更大，则将认为表是不均匀分布的，并且如果估计的分片数超过由 sample-sharding.threshold 指定的值，则将使用基于采样的分片策略。默认值为 100.0。

chunk-key.even-distribution.factor.lower-bound [Double]
块键分布因子的下限。此因子用于确定表数据是否均匀分布。如果分布因子计算出大于或等于此下限（即 (MAX(id) - MIN(id) + 1) / 行数），则表块将被优化为均匀分布。否则，如果分布因子更小，则将认为表是不均匀分布的，并且如果估计的分片数超过由 sample-sharding.threshold 指定的值，则将使用基于采样的分片策略。默认值为 0.05。

sample-sharding.threshold [Integer]
此配置指定触发采样分片策略的估计分片计数的阈值。当分布因子在由 chunk-key.even-distribution.factor.upper-bound 和 chunk-key.even-distribution.factor.lower-bound 指定的边界之外，且估计的分片数（计算为近似行数 / 块大小）超过此阈值时，将使用采样分片策略。这有助于更有效地处理大型数据集。默认值为 1000。

inverse-sampling.rate [Integer]
采样分片策略中使用的采样率的倒数。例如，如果将此值设置为 1000，则表示在采样过程中应用 1/1000 的采样率。此选项提供了在控制采样的粒度方面的灵活性，从而影响最终的分片数。在处理非常大的数据集时，较低的采样率更为适用，因此这是一个特别有用的选项。默认值为 1000。

server-id [String]
此数据库客户端的数字 ID 或数字 ID 范围。数字 ID 的语法类似于 '5400'，数字 ID 范围的语法类似于 '5400-5408'。

每个 ID 必须在 MySQL 集群中的所有当前运行的数据库进程中是唯一的。该连接器将以另一个服务器的身份（具有此唯一 ID）加入 MySQL 集群，以便读取 binlog。

默认情况下，在 5400 和 6400 之间生成一个随机数，但我们建议设置一个明确的值。

server-time-zone [String]
数据库服务器中的会话时区。如果未设置，则使用 ZoneId.systemDefault() 来确定服务器时区。

connect.timeout.ms [long]
连接器在尝试连接到数据库服务器后等待的最长时间，超过此时间将超时。

connect.max-retries [Integer]
连接器应该重试建立数据库服务器连接的最大次数。

connection.pool.size [Integer]
连接池大小。

exactly_once [Boolean]
启用精确一次语义。

debezium [Config]
将 Debezium 的属性传递给 Debezium 嵌入式引擎，该引擎用于捕获从 MySQL 服务器发生的数据更改。

了解有关 Debezium 的 MySQL 连接器属性的更多信息。

format [Enum]
MySQL CDC 的可选输出格式，有效的枚举值为 "DEFAULT"、"COMPATIBLE_DEBEZIUM_JSON"。

例子：

```
source {
  MySQL-CDC {
    debezium {
        snapshot.mode = "never"
        decimal.handling.mode = "double"
    }
  }
}
```

> [common-options](https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/common-options)

# Example

```
source {
  MySQL-CDC {
    result_table_name = "fake"
    parallelism = 1
    server-id = 5656
    username = "mysqluser"
    password = "mysqlpw"
    table-names = ["inventory_vwyw0n.products"]
    base-url = "jdbc:mysql://localhost:56725/inventory_vwyw0n"
  }
}
```


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/MySQL-CDC

* any list
{:toc}
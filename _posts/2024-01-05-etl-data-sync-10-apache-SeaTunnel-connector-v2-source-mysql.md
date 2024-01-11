---
layout: post
title: ETL-10-apache SeaTunnel Connector v2 source mysql
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# MySQL

> [https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/Mysql](https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/Mysql)

JDBC MySQL 数据源连接器

# 支持的引擎

Spark
Flink
SeaTunnel Zeta

## 主要特点

√ 批处理
× 流处理
√ 精确一次
√ 列投影
√ 并行性
√ 支持用户定义的拆分

支持查询 SQL 并能够实现投影效果。

# 数据库依赖

请下载与 'Maven' 对应的支持列表，并将其复制到 '$SEATNUNNEL_HOME/plugins/jdbc/lib/' 工作目录中。

例如，MySQL 数据源：`cp mysql-connector-java-xxx.jar $SEATNUNNEL_HOME/plugins/jdbc/lib/`

# 源选项

| 名称                      | 类型             | 必需     | 默认值     | 描述                                                                                                                   |
|--------------------------|------------------|----------|------------|------------------------------------------------------------------------------------------------------------------------|
| url                      | 字符串            | 是       | -          | JDBC 连接的 URL。示例：jdbc:mysql://localhost:3306:3306/test                                                            |
| driver                   | 字符串            | 是       | -          | 用于连接到远程数据源的 JDBC 类名，如果使用 MySQL，则值为 com.mysql.cj.jdbc.Driver。                                       |
| user                     | 字符串            | 否       | -          | 连接实例的用户名。                                                                                                     |
| password                 | 字符串            | 否       | -          | 连接实例的密码。                                                                                                       |
| query                    | 字符串            | 是       | -          | 查询语句。                                                                                                             |
| connection_check_timeout_sec | 整数            | 否       | 30         | 用于等待验证连接的数据库操作完成的时间，单位为秒。                                                                      |
| partition_column         | 字符串            | 否       | -          | 并行性分区的列名，仅支持数值类型，仅支持数值类型的主键，并且只能配置一个列。                                              |
| partition_lower_bound    | BigDecimal       | 否       | -          | 扫描的 partition_column 的最小值，如果未设置，SeaTunnel 将查询数据库获取最小值。                                         |
| partition_upper_bound    | BigDecimal       | 否       | -          | 扫描的 partition_column 的最大值，如果未设置，SeaTunnel 将查询数据库获取最大值。                                         |
| partition_num            | 整数            | 否       | job parallelism | 分区计数的数量，仅支持正整数，默认值为作业并行性。                                                                    |
| fetch_size               | 整数            | 否       | 0          | 对于返回大量对象的查询，可以配置查询中使用的行获取大小，以减少满足选择条件所需的数据库访问次数，零表示使用 JDBC 的默认值。   |
| common-options           | -               | 否       | -          | 源插件的通用参数，请参阅 Source Common Options 了解详细信息。                                                          |


## 提示

如果未设置 `partition_column`，则将以单一并发运行。

如果设置了 `partition_column`，将根据任务的并发度并行执行。

当您的分片读取字段为大数类型，如 bigint(30) 及以上，并且数据不均匀分布时，建议将并行级别设置为1，以确保解决数据倾斜问题。

# 任务示例

## 简单示例：

此示例在单一并行度中查询在您的测试 "database" 中的 "table" 表中的 16 条数据，并查询其所有字段。

您还可以指定要在最终输出到控制台的查询哪些字段。

```yaml
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 2
  job.mode = "BATCH"
}
source{
    Jdbc {
        url = "jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2b8"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "root"
        password = "123456"
        query = "select * from type_bin limit 16"
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

## 并行示例：

使用您配置的分片字段和分片数据并行读取您的查询表。

如果您想要读取整个表，可以使用此方法。

```yaml
source {
    Jdbc {
        url = "jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2b8"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "root"
        password = "123456"
        # Define query logic as required
        query = "select * from type_bin"
        # Parallel sharding reads fields
        partition_column = "id"
        # Number of fragments
        partition_num = 10
    }
}
```

## 并行边界示例：

根据您配置的上限和下限边界指定查询范围，按照您配置的上下边界读取数据源更为高效。

数据源配置示例：

```ini
source {
    Jdbc {
        url = "jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2b8"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "root"
        password = "123456"
        # 根据需要定义查询逻辑
        query = "select * from type_bin"
        partition_column = "id"
        # 读取起始边界
        partition_lower_bound = 1
        # 读取结束边界
        partition_upper_bound = 500
        partition_num = 10
    }
}
```

这个配置示例使用了Jdbc数据源，连接到MySQL数据库。它执行了一个查询，从表`type_bin`中选择所有字段。

并且通过指定分片字段`id`和设置分片的上下边界，以及分片数量，实现了并行读取数据的配置。

读取的数据将在id从1到500之间进行分片，并将分成10个分片进行并行读取。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/concept/JobEnvConfig

* any list
{:toc}
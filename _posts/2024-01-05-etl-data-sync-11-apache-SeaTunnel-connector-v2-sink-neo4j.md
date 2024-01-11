---
layout: post
title: ETL-11-apache SeaTunnel Connector v2 sink neo4j
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# neo4j

Neo4j sink connector

## 描述

将数据写入 Neo4j。

neo4j-java-driver 版本为 4.4.9

# 选项

| 名称                     | 类型       | 必需 | 默认值       |
|--------------------------|------------|------|--------------|
| uri                      | 字符串     | 是   | -            |
| username                 | 字符串     | 否   | -            |
| password                 | 字符串     | 否   | -            |
| max_batch_size           | 整数       | 否   | -            |
| write_mode               | 字符串     | 否   | OneByOne     |
| bearer_token             | 字符串     | 否   | -            |
| kerberos_ticket          | 字符串     | 否   | -            |
| database                 | 字符串     | 是   | -            |
| query                    | 字符串     | 是   | -            |
| queryParamPosition       | 对象       | 是   | -            |
| max_transaction_retry_time| 长整数     | 否   | 30           |
| max_connection_timeout   | 长整数     | 否   | 30           |
| common-options           | config     | 否   | -            |

这是关于 Neo4j 接收器连接器选项的配置列表。

根据您的需求，您可以适当配置这些选项。

uri [string]
Neo4j 数据库的 URI。参考格式：neo4j://localhost:7687

username [string]
Neo4j 的用户名

password [string]
Neo4j 的密码。如果提供了用户名，则为必需项。

max_batch_size [Integer]
max_batch_size 指的是在写入数据库时，可以在单个事务中写入的最大数据条目数。

write_mode
默认值为 oneByOne，或者将其设置为 "Batch"，如果希望能够批量写入

```
unwind $ttt as row create (n:Label) set n.name = row.name,n.age = rw.age
```

"ttt" 表示一批数据，"ttt" 可以是任意字符串，只要它与配置的 "batch_data_variable" 匹配。

bearer_token [string]
Neo4j 的 base64 编码的承载令牌，用于身份验证。

kerberos_ticket [string]
Neo4j 的 base64 编码的 Kerberos 票据，用于身份验证。

database [string]
数据库名称。

query [string]
查询语句。包含在运行时用相应值替换的参数占位符。

queryParamPosition [object]
查询参数的位置映射信息。

键名是参数占位符名称。

关联值是输入数据行中字段的位置。

max_transaction_retry_time [long]
最大事务重试时间（秒）。如果超过这个时间，事务将失败。

max_connection_timeout [long]
等待建立 TCP 连接的最长时间（秒）。

common options
Sink 插件的通用参数，请参阅 Sink Common Options 了解详细信息。


# WriteOneByOneExample

```
sink {
  Neo4j {
    uri = "neo4j://localhost:7687"
    username = "neo4j"
    password = "1234"
    database = "neo4j"

    max_transaction_retry_time = 10
    max_connection_timeout = 10

    query = "CREATE (a:Person {name: $name, age: $age})"
    queryParamPosition = {
        name = 0
        age = 1
    }
  }
}
```

# WriteBatchExample

您提供的 Neo4j Sink 连接器配置示例使用了 `unwind` 关键字，支持批量写入。默认情况下，一批数据的默认变量名为 `batch`。

如果您要编写批量写入语句，则应声明 `cypher:unwind $batch as row` 进行相应操作。

以下是您提供的配置示例：

```yaml
sink {
    Neo4j {
        uri = "bolt://localhost:7687"
        username = "neo4j"
        password = "neo4j"
        database = "neo4j"
        max_batch_size = 1000
        write_mode = "BATCH"
        max_transaction_retry_time = 3
        max_connection_timeout = 10

        query = "unwind $batch as row create(n:MyLabel) set n.name = row.name, n.age = row.age"
    }
}
```

该配置指定了 Neo4j 数据库的 URI、用户名、密码等参数，并使用了 `BATCH` 写模式，设置了最大批量大小、最大事务重试时间和最大连接超时。

查询语句使用了 `unwind $batch as row` 进行批量写入。请确保您的实际数据和数据模型与配置中的查询语句相匹配。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/connector-v2/sink/Neo4j

* any list
{:toc}
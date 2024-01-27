---
layout: post
title: ETL-11-apache SeaTunnel Connector v2 sink jdbc
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# Kafka
Kafka 汇聚连接器

## 支持的引擎

Spark
Flink
Seatunnel Zeta

## 主要特性

 精确一次传输

# sink 配置项

默认情况下，我们将使用两阶段提交（2pc）来确保消息被精确一次发送到 Kafka。

| 名称                  | 类型     | 是否必需 | 默认值 | 描述                                                                                                                                                      |
|-----------------------|----------|----------|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| topic                 | 字符串   | 是       | -      | 当表用作汇聚时，主题名称是要写入数据的主题。                                                                                                              |
| bootstrap.servers     | 字符串   | 是       | -      | 以逗号分隔的 Kafka 代理服务器列表。                                                                                                                      |
| kafka.config          | 映射     | 否       | -      | 除了 Kafka 生产者客户端必须指定的参数外，用户还可以为生产者客户端指定多个非强制性参数，涵盖了官方 Kafka 文档中指定的所有生产者参数。                    |
| semantics             | 字符串   | 否       | NON    | 可选择的语义为 EXACTLY_ONCE/AT_LEAST_ONCE/NON， 默认为 NON。                                                                                            |
| partition_key_fields  | 数组     | 否       | -      | 配置用作 Kafka 消息键的字段。                                                                                                                           |
| partition            | 整数     | 否       | -      | 我们可以指定分区，所有消息将被发送到该分区。                                                                                                           |
| assign_partitions    | 数组     | 否       | -      | 我们可以根据消息内容决定要发送到哪个分区。该参数的功能是分发信息。                                                                                        |
| transaction_prefix   | 字符串   | 否       | -      | 如果语义被指定为 EXACTLY_ONCE，则生产者将在 Kafka 事务中写入所有消息，Kafka 通过不同的 transactionId 区分不同的事务。该参数是 Kafka transactionId 的前缀。确保不同的作业使用不同的前缀。|
| format               | 字符串   | 否       | json   | 数据格式。默认格式为 json。可选的文本格式有 canal-json 和 debezium-json。如果使用 json 或文本格式，默认字段分隔符是“，”。如果自定义分隔符，请添加“field_delimiter”选项。如果使用 canal 格式，请参考 canal-json 进行详细了解。如果使用 debezium 格式，请参考 debezium-json 进行详细了解。|
| field_delimiter      | 字符串   | 否       | ,      | 自定义数据格式的字段分隔符。                                                                                                                             |
| common-options        |          | 否       | -      | 源插件的常见参数，请参考源插件常见选项以获取详细信息。                                                                                                   |


# 参数解释

## 主题格式 Topic Formats

目前支持两种格式：

1. 填写主题的名称。
2. 使用上游数据中的字段值作为主题，格式为${你的字段名称}，其中主题是上游数据中某一列的值。

例如，上游数据如下：

```
name    age    data
Jack    16     data-example1
Mary    23     data-example2
```

如果将${name}设置为主题。那么第一行将被发送到主题 Jack，第二行将被发送到主题 Mary。

语义
在 EXACTLY_ONCE 模式下，生产者将在 Kafka 事务中写入所有消息，该事务将在检查点时提交到 Kafka。在 AT_LEAST_ONCE 模式下，生产者将等待 Kafka 缓冲区中所有未处理消息在检查点时得到 Kafka 生产者的确认。NON 不提供任何保证：在 Kafka 代理出现问题的情况下，消息可能会丢失，并且消息可能会重复。

## 分区键字段 Partition Key Fields

例如，如果要将上游数据中的字段值用作键，可以将字段名称分配给此属性。

上游数据如下：

```
name    age    data
Jack    16     data-example1
Mary    23     data-example2
```

如果将 name 设置为键，则将根据 name 列的哈希值确定消息将发送到哪个分区。如果未设置分区键字段，将发送 null 消息键。

消息键的格式为 json，例如如果将 name 设置为键，则为'{"name":"Jack"}'。所选字段必须是上游中已存在的字段。

## 分配分区 Assign Partitions

例如，总共有五个分区，配置中的 assign_partitions 字段如下：`assign_partitions = ["shoe", "clothing"]`，那么包含 "shoe" 的消息将被发送到分区零，因为在 assign_partitions 中 "shoe" 被订阅为零，包含 "clothing" 的消息将被发送到分区一。

对于其他消息，将使用哈希算法将它们分割到其余的分区。

此功能由 MessageContentPartitioner 类实现 org.apache.kafka.clients.producer.Partitioner 接口。

如果需要自定义分区，我们也需要实现此接口。

# 任务示例

## 简单示例：

此示例定义了一个 SeaTunnel 同步任务，通过 FakeSource 自动生成数据并将其发送到 Kafka Sink。

FakeSource 生成总共 16 行数据（row.num=16），每行有两个字段，name（字符串类型）和 age（整数类型）。

最终的目标主题是 test_topic，主题中也将有 16 行数据。

如果尚未安装和部署 SeaTunnel，需要按照“安装 SeaTunnel”中的说明进行安装和部署。然后按照“SeaTunnel 引擎快速入门”中的说明运行此作业。

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 1
  job.mode = "BATCH"
}

source {
  FakeSource {
    parallelism = 1
    result_table_name = "fake"
    row.num = 16
    schema = {
      fields {
        name = "string"
        age = "int"
      }
    }
  }
}

sink {
  kafka {
      topic = "test_topic"
      bootstrap.servers = "localhost:9092"
      partition = 3
      format = json
      kafka.request.timeout.ms = 60000
      semantics = EXACTLY_ONCE
      kafka.config = {
        acks = "all"
        request.timeout.ms = 60000
        buffer.memory = 33554432
      }
  }
}
```

## AWS MSK SASL/SCRAM

用AWS MSK中的配置值替换以下的${username}和${password}。

```conf
sink {
  kafka {
      topic = "seatunnel"
      bootstrap.servers = "localhost:9092"
      partition = 3
      format = json
      kafka.request.timeout.ms = 60000
      semantics = EXACTLY_ONCE
      kafka.config = {
         security.protocol=SASL_SSL
         sasl.mechanism=SCRAM-SHA-512
         sasl.jaas.config="org.apache.kafka.common.security.scram.ScramLoginModule required \nusername=${username}\npassword=${password};"
      }
  }
}
```

AWS MSK IAM
从 https://github.com/aws/aws-msk-iam-auth/releases 下载 aws-msk-iam-auth-1.1.5.jar 并将其放置在 $SEATUNNEL_HOME/plugin/kafka/lib 目录中。

请确保 IAM 策略中包含 "kafka-cluster:Connect"，如下所示：

```json
"Effect": "Allow",
"Action": [
    "kafka-cluster:Connect",
    "kafka-cluster:AlterCluster",
    "kafka-cluster:DescribeCluster"
],
```

Sink 配置

```conf
sink {
  kafka {
      topic = "seatunnel"
      bootstrap.servers = "localhost:9092"
      partition = 3
      format = json
      kafka.request.timeout.ms = 60000
      semantics = EXACTLY_ONCE
      kafka.config = {
         security.protocol=SASL_SSL
         sasl.mechanism=AWS_MSK_IAM
         sasl.jaas.config="software.amazon.msk.auth.iam.IAMLoginModule required;"
         sasl.client.callback.handler.class="software.amazon.msk.auth.iam.IAMClientCallbackHandler"
      }
  }
}
```

请用 AWS MSK 中的配置值替换 Sink Config 中的 ${username} 和 ${password}。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/connector-v2/sink/Neo4j

* any list
{:toc}
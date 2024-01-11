---
layout: post
title: ETL-10-apache SeaTunnel Connector v2 source kafka
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# kafka

Kafka source connector

## Support Those Engines

Spark
Flink
Seatunnel Zeta

## Key Features

 batch
 stream
 exactly-once
× column projection 
 parallelism
× support user-defined split

## 驱动

直接从 [connector-kafka](https://mvnrepository.com/artifact/org.apache.seatunnel/seatunnel-connectors-v2/connector-kafka) 下载。

# Source Options

| 名称                                      | 类型              | 必需     | 默认值                | 描述                                                                                                                                                   |
|-------------------------------------------|-------------------|----------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| topic                                     | 字符串             | 是       | -                     | 当表用作源时，从中读取数据的主题名称。它还支持通过逗号分隔的主题列表，例如 'topic-1,topic-2'。                                                                      |
| bootstrap.servers                         | 字符串             | 是       | -                     | 逗号分隔的 Kafka 代理列表。                                                                                                                             |
| pattern                                   | 布尔              | 否       | false                 | 如果将 pattern 设置为 true，则表示要从中读取的主题名称的正则表达式模式。将订阅匹配指定正则表达式的所有具有匹配名称的客户端的主题。                           |
| consumer.group                            | 字符串             | 否       | SeaTunnel-Consumer-Group | Kafka 消费者组 ID，用于区分不同的消费者组。                                                                                                          |
| commit_on_checkpoint                     | 布尔              | 否       | true                  | 如果为 true，则消费者的偏移量将在后台定期提交。                                                                                                        |
| kafka.config                              | Map               | 否       | -                     | 除了上述 Kafka 消费者客户端必须指定的必要参数之外，用户还可以指定多个消费者客户端非强制性参数，这些参数覆盖了官方 Kafka 文档中指定的所有消费者参数。                |
| schema                                    | Config            | 否       | -                     | 数据的结构，包括字段名称和字段类型。                                                                                                                 |
| format                                    | 字符串             | 否       | json                  | 数据格式。默认格式为 json。可选文本格式，canal-json 和 debezium-json。如果使用 json 或 text 格式，则默认字段分隔符为 ", "。如果自定义分隔符，请添加 "field_delimiter" 选项。如果使用 canal 格式，请参阅 canal-json 了解详细信息。如果使用 debezium 格式，请参阅 debezium-json 了解详细信息。 |
| format_error_handle_way                   | 字符串             | 否       | fail                  | 数据格式错误的处理方法。默认值为 fail，可选值为 (fail, skip)。选择 fail 时，数据格式错误将阻塞，并且将引发异常。选择 skip 时，数据格式错误将跳过此行数据。              |
| field_delimiter                           | 字符串             | 否       | ,                     | 用于数据格式的字段定界符的自定义字段定界符。                                                                                                           |
| start_mode                                | StartMode 枚举      | 否       | group_offsets         | 消费者的初始消费模式。                                                                                                                                |
| start_mode.offsets                        | Config            | 否       | -                     | 用于消费模式为 specific_offsets 的偏移量。                                                                                                             |
| start_mode.timestamp                      | 长整数             | 否       | -                     | 用于消费模式为 "timestamp" 的时间。                                                                                                                  |
| partition-discovery.interval-millis       | 长整数             | 否       | -1                    | 动态发现主题和分区的间隔。                                                                                                                            |
| common-options                            | 无               | 否       | -                     | 源插件的通用参数，请参阅 Source Common Options 了解详细信息。                                                                                            |

这是关于源选项的配置列表。根据您的需求，您可以适当配置这些选项。

# 任务示例

## 简单示例：

此示例读取 Kafka 的 topic_1、topic_2、topic_3 的数据，并将其打印到客户端。

如果您尚未安装和部署 SeaTunnel，则需要按照《安装 SeaTunnel》中的说明安装和部署 SeaTunnel。然后按照《使用 SeaTunnel 引擎快速入门》中的说明运行此作业。

```yml
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 2
  job.mode = "BATCH"
}
source {
  Kafka {
    schema = {
      fields {
        name = "string"
        age = "int"
      }
    }
    format = text
    field_delimiter = "#"
    topic = "topic_1,topic_2,topic_3"
    bootstrap.servers = "localhost:9092"
    kafka.config = {
      client.id = client_1
      max.poll.records = 500
      auto.offset.reset = "earliest"
      enable.auto.commit = "false"
    }
  }  
}
sink {
  Console {}
}
```

## Regex Topic

```
source {
    Kafka {
          topic = ".*seatunnel*."
          pattern = "true" 
          bootstrap.servers = "localhost:9092"
          consumer.group = "seatunnel_group"
    }
}
```

## AWS MSK SASL/SCRAM

替换以下 `${username}` 和 `${password}` 为 AWS MSK 中的配置值。

```
source {
    Kafka {
        topic = "seatunnel"
        bootstrap.servers = "xx.amazonaws.com.cn:9096,xxx.amazonaws.com.cn:9096,xxxx.amazonaws.com.cn:9096"
        consumer.group = "seatunnel_group"
        kafka.config = {
            security.protocol=SASL_SSL
            sasl.mechanism=SCRAM-SHA-512
            sasl.jaas.config="org.apache.kafka.common.security.scram.ScramLoginModule required username=\"username\" password=\"password\";"
            #security.protocol=SASL_SSL
            #sasl.mechanism=AWS_MSK_IAM
            #sasl.jaas.config="software.amazon.msk.auth.iam.IAMLoginModule required;"
            #sasl.client.callback.handler.class="software.amazon.msk.auth.iam.IAMClientCallbackHandler"
        }
    }
}
```

## AWS MSK IAM

请从 https://github.com/aws/aws-msk-iam-auth/releases 下载 `aws-msk-iam-auth-1.1.5.jar` 并将其放置在 `$SEATUNNEL_HOME/plugin/kafka/lib` 目录中。

请确保 IAM 策略包含 "kafka-cluster:Connect"，类似于以下内容：

```
"Effect": "Allow",
"Action": [
    "kafka-cluster:Connect",
    "kafka-cluster:AlterCluster",
    "kafka-cluster:DescribeCluster"
],
```

source config:

```
source {
    Kafka {
        topic = "seatunnel"
        bootstrap.servers = "xx.amazonaws.com.cn:9098,xxx.amazonaws.com.cn:9098,xxxx.amazonaws.com.cn:9098"
        consumer.group = "seatunnel_group"
        kafka.config = {
            #security.protocol=SASL_SSL
            #sasl.mechanism=SCRAM-SHA-512
            #sasl.jaas.config="org.apache.kafka.common.security.scram.ScramLoginModule required username=\"username\" password=\"password\";"
            security.protocol=SASL_SSL
            sasl.mechanism=AWS_MSK_IAM
            sasl.jaas.config="software.amazon.msk.auth.iam.IAMLoginModule required;"
            sasl.client.callback.handler.class="software.amazon.msk.auth.iam.IAMClientCallbackHandler"
        }
    }
}
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/kafka

* any list
{:toc}
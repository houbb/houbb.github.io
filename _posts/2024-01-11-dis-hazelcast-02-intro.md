---
layout: post
title: hazelcast-02-intro
date: 2024-01-11 21:01:55 +0800
categories: [Cache]
tags: [cache, sql, sh]
published: true
---

# Hazelcast

Hazelcast 是世界领先的公司信任的软件，用于现代化应用程序并对运动中的数据采取即时行动，以创造新的收入流、降低风险并提高运营效率。

企业使用Hazelcast的统一实时数据平台来处理流数据，将其与历史背景进行丰富，并在将其存储到数据库或数据湖之前使用标准或ML/AI驱动的自动化立即采取行动。

Hazelcast被列为Gartner事件流处理市场指南中的一部分，并在GigaOm雷达报告中被评为流数据平台的领导者。

要加入我们的CXO、架构师和开发人员社区，与Lowe’s、HSBC、JPMorgan Chase、Volvo、纽约人寿等品牌一起，请访问 hazelcast.com。

# 使用Hazelcast的时机包括：

1. 在流数据或静态数据上进行有状态的数据处理。
2. 直接使用SQL查询流数据和批处理数据源。
3. 通过连接器库摄取数据，并使用低延迟的SQL查询提供服务。
4. 在事件发生时向应用程序推送更新。
5. 使用低延迟的基于队列或发布-订阅的消息传递。
6. 通过缓存模式（如读/写穿透和写入延迟）快速访问上下文和事务数据。
7. 用于微服务的分布式协调。
8. 将数据从一个区域复制到另一个区域或在同一区域的数据中心之间进行复制。

# Hazelcast的主要特点包括：

1. 在数据流和静态数据上进行有状态和容错的数据处理和查询，可使用SQL或数据流API。
2. 包含丰富的连接器库，如Kafka、Hadoop、S3、RDBMS、JMS等。
3. 使用发布-订阅和队列进行分布式消息传递。
4. 分布式、分区、可查询的键-值存储，具有事件监听器，还可用于以低延迟存储上下文数据以丰富事件流。
5. 一个生产就绪的Raft实现，允许线性化（CP）并发原语，如分布式锁。
6. 与Python紧密集成，可将机器学习模型部署到数据处理管道。
7. 云原生、可在任何地方运行的架构。
8. 滚动升级，实现零停机运维。
9. 流处理管道的至少一次和确切一次处理保证。
10. 使用WAN在数据中心和地理区域之间进行数据复制。
11. 针对键-值点查找和发布-订阅的微秒级性能。
12. 独特的数据处理架构，导致每秒数百万事件的流查询的99.99%延迟低于10毫秒。
13. 提供Java、Python、Node.js、.NET、C++和Go等多个客户端库。

# Operational Data Store

Hazelcast提供分布式的内存数据结构，这些结构是分区、复制和可查询的。Hazelcast的主要用途之一是存储工作数据集，以便进行快速查询和访问。

Hazelcast的主要数据结构称为IMap，它是一个键-值存储，具有丰富的功能，包括：

1. 与数据源的集成，支持一次或连续摄取。
2. 读穿透和写穿透的缓存模式。
3. 通过SQL进行索引和查询。
4. 用于原子更新的原地处理条目。
5. 根据TTL或上次访问时间等特定条件自动过期项目。
6. 用于在客户端缓存条目的近缓存。
7. 用于将更改推送到客户端的监听器。
8. 数据中心之间的数据复制（仅企业版）。
9. 将数据持久化到磁盘（仅企业版）。

Hazelcast将数据存储在分区中，这些分区分布到所有节点。您可以通过添加额外的节点来增加存储容量，如果其中一个节点故障，数据将自动从备份副本中还原。

![rep](https://github.com/hazelcast/hazelcast/raw/master/images/replication.png)

您可以使用SQL或您选择的编程语言客户端与地图进行交互。以下是创建和与地图交互的示例：

```sql
CREATE MAPPING myMap (name varchar EXTERNAL NAME "__key", age INT EXTERNAL NAME "this") 
TYPE IMap
OPTIONS ('keyFormat'='varchar','valueFormat'='int');
INSERT INTO myMap VALUES('Jake', 29);
SELECT * FROM myMap;
```

同样，您可以使用受支持的编程语言以编程方式执行相同的操作。以下是Java和Python的一些示例：

Java示例：

```java
var hz = HazelcastClient.newHazelcastClient();
IMap<String, Integer> map = hz.getMap("myMap");
map.set("Alice", 25);
```

Python示例：

```python
import hazelcast

client = hazelcast.HazelcastClient()
my_map = client.get_map("myMap")
age = my_map.get("Alice").result()
```

其他支持的编程语言包括C＃、C++、Node.js和Go。

或者，您可以直接使用SQL从支持的许多源摄取数据：

```sql
CREATE MAPPING csv_ages (name VARCHAR, age INT)
TYPE File
OPTIONS ('format'='csv',
    'path'='/data', 'glob'='data.csv');
SINK INTO myMap
SELECT name, age FROM csv_ages;
```

Hazelcast还提供了其他数据结构，如ReplicatedMap、Set、MultiMap和List。有关完整列表，请参阅文档中的分布式数据结构部分。

# Stateful Data Processing

Hazelcast拥有内置的数据处理引擎称为Jet。

Jet可用于构建具有弹性的流式和批处理数据管道。您可以使用它来处理大量的实时事件或庞大的静态数据集。

为了感知规模，Hazelcast的单个节点已被证明可以在低于10毫秒的延迟下聚合每秒1000万个事件。Hazelcast节点集群可以处理每秒数十亿个事件。

![Stateful Data Processing](https://github.com/hazelcast/hazelcast/blob/master/images/latency.png)

以下是一个每秒聚合数百万个来自Kafka的传感器读数的应用程序示例，分辨率为10毫秒：

```java
var hz = Hazelcast.bootstrappedInstance();

var p = Pipeline.create();

p.readFrom(KafkaSources.<String, Reading>kafka(kafkaProperties, "sensors"))
 .withTimestamps(event -> event.getValue().timestamp(), 10) // 使用事件时间戳，允许的滞后时间为10毫秒
 .groupingKey(reading -> reading.sensorId())
 .window(sliding(1_000, 10)) // 1秒滑动窗口，每10毫秒
 .aggregate(averagingDouble(reading -> reading.temperature()))
 .writeTo(Sinks.logger());

hz.getJet().newJob(p).join();
```

使用以下命令将应用程序部署到服务器：

```bash
bin/hazelcast submit analyze-sensors.jar
```

Jet支持高级的流处理功能，如确切一次处理和水印。

## Data Processing using SQL

Jet还驱动Hazelcast中的SQL引擎，该引擎可以执行流式和批处理查询。

在内部，所有SQL查询都被转换为Jet作业。

```sql
CREATE MAPPING trades (
    id BIGINT,
    ticker VARCHAR,
    price DECIMAL,
    amount BIGINT)
TYPE Kafka
OPTIONS (
    'valueFormat' = 'json',
    'bootstrap.servers' = 'kafka:9092'
);

SELECT ticker, ROUND(price * 100) AS price_cents, amount
  FROM trades
  WHERE price * amount > 100;
```

查询结果如下：

```
+------------+----------------------+-------------------+
|ticker      |           price_cents|             amount|
+------------+----------------------+-------------------+
|EFGH        |                  1400|                 20|
```

这个例子演示了使用SQL语句处理Kafka中的交易数据，选择特定条件下的结果。 

Jet使得在Hazelcast中执行SQL查询变得更加灵活和强大。

# 消息

Hazelcast提供了轻量级的选项，用于向您的应用程序添加消息传递。消息传递的两个主要构造是主题（Topics）和队列（Queues）。

**主题（Topics）**

主题提供发布-订阅模式，其中每条消息都广播到多个订阅者。以下是Java和Python中的示例：

Java示例：

```java
var hz = Hazelcast.bootstrappedInstance();
ITopic<String> topic = hz.getTopic("my_topic");
topic.addMessageListener(msg -> System.out.println(msg));
topic.publish("message");
```

Python示例：

```python
import hazelcast

client = hazelcast.HazelcastClient()
topic = client.get_topic("my_topic")

def handle_message(msg):
    print("Received message %s" % msg.message)

topic.add_listener(on_message=handle_message)
topic.publish("my-message")
```

有关其他语言的示例，请参阅文档。

**队列（Queues）**

队列提供先进先出（FIFO）语义，您可以从一个客户端添加项目并从另一个客户端删除。以下是Java和Python中的示例：

Java示例：

```java
var client = Hazelcast.newHazelcastClient();
IQueue<String> queue = client.getQueue("my_queue");
queue.put("new-item");
```

Python示例：

```python
import hazelcast

client = hazelcast.HazelcastClient()
q = client.get_queue("my_queue")
my_item = q.take().result()
print("Received item %s" % my_item)
```

有关其他语言的示例，请参阅文档。通过主题和队列，Hazelcast提供了简便的消息传递选项，可轻松集成到您的应用程序中。

# 参考资料

https://github.com/hazelcast/hazelcast

* any list
{:toc}
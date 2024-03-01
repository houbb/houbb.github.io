---
layout: post
title: schedule-08-分布式任务调度流批 hazelcast-jet 开源的、内存中的、分布式的批处理和流处理引擎
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---

# Jet是什么

[Jet](https://jet-start.sh/) 是一个开源的、内存中的、分布式的批处理和流处理引擎。

您可以使用它来处理大量实时事件或庞大的静态数据集。

为了给您一个规模的感觉，已经证明 Jet 的单个节点可以在 10 毫秒以下的延迟下 [聚合每秒 1000 万个事件](https://jet-start.sh/blog/2020/08/05/gc-tuning-for-jet)。

它提供了一个 Java API 通过 [数据流编程模型](https://jet-start.sh/docs/concepts/dag) 来构建流和批处理应用程序。在将应用程序部署到 Jet 集群后，Jet 将自动使用集群上的所有计算资源运行您的应用程序。

如果在运行应用程序时向集群添加更多节点，Jet 将自动扩展您的应用程序以在新节点上运行。

如果从集群中删除节点，它会在不丢失当前计算状态的情况下无缝缩小，提供 [Exactly-Once](https://jet-start.sh/docs/architecture/fault-tolerance) 处理保证。

例如，您可以使用以下 API 表示经典的单词计数问题，读取一些本地文件并将每个单词的频率输出到控制台：

```java
JetInstance jet = Jet.bootstrappedInstance();

Pipeline p = Pipeline.create();
p.readFrom(Sources.files("/path/to/text-files"))
 .flatMap(line -> traverseArray(line.toLowerCase().split("\\W+")))
 .filter(word -> !word.isEmpty())
 .groupingKey(word -> word)
 .aggregate(counting())
 .writeTo(Sinks.logger());

jet.newJob(p).join();
```

然后将应用程序部署到集群：

```bash
bin/jet submit word-count.jar
```

另一个应用程序从 Kafka 聚合每秒数百万个传感器读数，分辨率为 10 毫秒，如下所示：

```java
Pipeline p = Pipeline.create();

p.readFrom(KafkaSources.<String, Reading>kafka(kafkaProperties, "sensors"))
 .withTimestamps(event -> event.getValue().timestamp(), 10) // 使用事件时间戳，允许的滞后时间为毫秒
 .groupingKey(reading -> reading.sensorId())
 .window(sliding(1_000, 10)) // 滑动窗口 1s 每 10ms
 .aggregate(averagingDouble(reading -> reading.temperature()))
 .writeTo(Sinks.logger());

jet.newJob(p).join();
```

Jet 提供了对许多种类的 [数据源和接收器](https://jet-start.sh/docs/api/sources-sinks) 的开箱即用支持，包括：

* Apache Kafka
* 本地文件 (Text, Avro, JSON)
* Apache Hadoop (Azure Data Lake, S3, GCS)
* Apache Pulsar
* Debezium
* Elasticsearch
* JDBC
* JMS
* InfluxDB
* Hazelcast
* Redis
* MongoDB
* Twitter

## 何时使用Jet

在需要以分布式方式处理大量数据时，Jet 是一个很好的选择。

您可以使用它构建各种数据处理应用程序，例如：

* 低延迟的有状态流处理。例如，从 100,000 设备的 100 Hz 传感器数据中检测趋势并在 10 毫秒内发送纠正反馈。
* 高吞吐量、大状态流处理。例如，跟踪数百万用户的 GPS 位置，推断其速度矢量。
* 大数据量的批处理，例如分析一天的股票交易数据以更新给定投资组合的风险敞口。

## 主要特点

### 在负载下的可预测延迟

Jet 使用独特的 [协作式多线程](https://jet-start.sh/docs/architecture/execution-engine) 执行模型，可以在处理数百万个项的同时达到 [极低的延迟](https://jet-start.sh/blog/2020/08/05/gc-tuning-for-jet)，仅在单个节点上：

<img src="images/latency.png"/>

该引擎能够在固定数量的线程上同时运行数十到数千个作业。

### 无基础设施的容错性

Jet 将计算状态存储在分布式、复制的 [内存存储](https://jet-start.sh/docs/architecture/in-memory-storage) 中，不需要分布式文件系统或类似 Zookeeper 的基础设施来提供高可用性和容错性。

<p align="center">
    <img src="images/storage.png"/>
</p>

Jet 实现了 [Chandy-Lamport](https://jet-start.sh/docs/architecture/fault-tolerance) 算法的一种版本，以在面对故障时提供 _Exactly-Once_ 处理。与外部事务性系统（如数据库）进行交互时，可以使用 [two-phase commit](https://jet-start.sh/blog/2020/02/20/transactional-processors) 提供端到端的处理保证。

### 高级事件处理

事件数据通常可能是 [无序的](https://jet-start.sh/docs/concepts/event-time)，Jet 对处理此无序性有着一流的支持。Jet 实现了一种称为 [_分布式水印_](https://jet-start.sh/docs/architecture/event-time-processing) 的技术，将无序事件视为按顺序到达的事件。

<img src="images/watermarks.svg">

## 如何入门

请遵循 [入门指南](https://jet-start.sh/docs/get-started/intro) 开始使用 Jet。

## 下载

您可以从 [https://jet-start.sh](https://jet-start.sh/download) 下载 Jet。

或者，您可以使用最新的 [Docker 镜像](https://jet-start.sh/docs/operations/docker)：

```java
docker run -p 5701:5701 hazelcast/hazelcast-jet
```

使用以下 Maven 坐标将 Jet 添加到您的应用程序中：

```xml
<groupId>com.hazelcast.jet</groupId>
<artifactId>hazelcast-jet</artifactId>
<version>4.2</version>
```

# 个人感觉

这个更加类似于 seatunnel

# 参考资料

https://github.com/hazelcast/hazelcast-jet

* any list
{:toc}
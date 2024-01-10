---
layout: post
title: ETL-07-apache SeaTunnel Config Intro To Connector V2 Features
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# **Connector V2 与 Connector V1 之间的区别**

自从 https://github.com/apache/seatunnel/issues/1608 问题被解决后，我们添加了 Connector V2 功能。

Connector V2 是基于 SeaTunnel Connector API 接口定义的连接器。

与 Connector V1 不同，Connector V2 支持以下功能。

**多引擎支持**
SeaTunnel Connector API 是一个独立于引擎的 API。基于此 API 开发的连接器可以在多个引擎中运行。目前支持 Flink 和 Spark，我们将来会支持其他引擎。

**多引擎版本支持**
通过翻译层将连接器与引擎解耦，解决了大多数连接器需要修改代码以支持底层引擎的新版本的问题。

**统一的批处理和流处理**
Connector V2 可以执行批处理或流处理。我们不需要分别为批处理和流处理开发连接器。

**多路复用 JDBC/日志连接**
Connector V2 支持 JDBC 资源的重用，并共享数据库日志解析。

# **数据源连接器特性**

数据源连接器具有一些共同的核心特性，每个数据源连接器以不同程度支持这些特性。

## **精确一次（Exactly-Once）**

如果数据源中的每个数据只会被源一次发送到下游，我们认为这个数据源连接器支持精确一次。

在 SeaTunnel 中，我们可以在检查点时将读取的 Split 及其偏移量（读取数据在 Split 中的位置，如行号、字节大小、偏移量等）保存为 StateSnapshot。

如果任务重新启动，我们将获取上次的 StateSnapshot，然后定位上次读取的 Split 和偏移量，并继续将数据发送到下游。

例如，文件（File）、Kafka。

## **列投影（Column Projection）**

如果连接器支持仅从数据源中读取指定的列（请注意，如果您首先读取所有列，然后通过模式筛选掉不必要的列，这种方法并不是真正的列投影）。

例如，JDBCSource 可以使用 SQL 定义要读取的列。

KafkaSource 将从主题中读取所有内容，然后使用模式来过滤不必要的列，这不是列投影。

## **批处理（Batch）**

批处理作业模式，读取的数据是有限的，当所有数据都被读取完毕时作业将停止。

## *流处理（Stream）**

流处理作业模式，读取的数据是无限的，作业永不停止。

## **并行度（Parallelism）**

并行度是数据源连接器支持的配置项，每个并行度将创建一个任务来读取数据。

在并行度数据源连接器中，源将被拆分为多个拆分（splits），然后枚举器将为其分配拆分以进行处理。

## **支持用户定义的拆分**

用户可以配置拆分规则。

# **汇连接器特性**

汇连接器具有一些共同的核心特性，每个汇连接器以不同程度支持这些特性。

## **精确一次（Exactly-Once）**

当任何数据流入分布式系统时，如果系统在整个处理过程中只准确处理一次任何数据，并且处理结果正确，那么认为系统满足精确一次一致性。

对于汇连接器，如果任何数据只写入目标一次，则该汇连接器支持精确一次。通常有两种实现方法：

1. 目标数据库支持键去重。例如 MySQL、Kudu。
2. 目标支持 XA 事务（此事务可以跨会话使用。即使创建事务的程序已结束，新启动的程序只需知道上一个事务的ID即可重新提交或回滚事务）。然后我们可以使用两阶段提交来确保精确一次。例如 File、MySQL。

## **CDC（Change Data Capture）**

如果汇连接器支持基于主键写入行种类（INSERT/UPDATE_BEFORE/UPDATE_AFTER/DELETE），我们认为它支持 CDC（Change Data Capture）。



# 参考资料

https://github.com/apache/seatunnel

https://seatunnel.apache.org/docs/2.3.3/about

* any list
{:toc}
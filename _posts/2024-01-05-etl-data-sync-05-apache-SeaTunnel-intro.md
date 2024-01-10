---
layout: post
title: ETL-05-apache SeaTunnel 入门介绍
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# SeaTunnel

SeaTunnel 是一个非常易于使用、超高性能的分布式数据集成平台，支持大规模数据的实时同步。

它能够每天稳定高效地同步数百亿条数据，并已经在近百家公司的生产环境中得到应用。

## SeaTunnel的必要性主要体现在以下几个方面：

1. **各种数据源：** 存在着数百种常用数据源，而它们的版本不兼容。随着新技术的出现，更多的数据源不断涌现。对用户而言，很难找到一个能够充分快速支持这些数据源的工具。

2. **复杂的同步场景：** 数据同步需要支持离线全同步、离线增量同步、CDC（变更数据捕获）、实时同步和完整数据库同步等各种同步场景。

3. **高资源需求：** 现有的数据集成和同步工具通常需要庞大的计算资源或JDBC连接资源，才能完成大规模小表的实时同步。这增加了企业的负担。

4. **缺乏质量和监控：** 数据集成和同步过程经常出现数据丢失或重复的情况。同步过程缺乏监控，无法直观了解任务过程中数据的真实情况。

5. **复杂的技术堆栈：** 企业使用的技术组件各异，用户需要为不同组件开发相应的同步程序，以完成数据集成。

6. **管理和维护的难度：** 受限于不同的底层技术组件（如Flink/Spark），离线同步和实时同步通常需要分开开发和管理，这增加了管理和维护的难度。

## SeaTunnel的特性包括：

1. **丰富且可扩展的连接器：** SeaTunnel提供了一个不依赖于特定执行引擎的Connector API。基于该API开发的连接器（源、转换、汇）可以在许多不同的引擎上运行，如SeaTunnel Engine、Flink和Spark，这些引擎目前都得到支持。

2. **连接器插件：** 插件设计允许用户轻松开发自己的Connector并集成到SeaTunnel项目中。目前，SeaTunnel支持100多个连接器，并且这个数字还在不断增长。

3. **批流一体化：** 基于SeaTunnel Connector API开发的连接器完全兼容离线同步、实时同步、全同步、增量同步等场景。它们大大降低了管理数据集成任务的难度。

4. **支持分布式快照算法以确保数据一致性。**

5. **多引擎支持：** SeaTunnel默认使用SeaTunnel Engine进行数据同步。SeaTunnel还支持将Flink或Spark作为Connector的执行引擎，以适应企业现有的技术组件。SeaTunnel支持多个版本的Spark和Flink。

6. **JDBC多路复用，数据库日志多表解析：** SeaTunnel支持多表或整个数据库同步，解决了过多JDBC连接的问题；同时支持多表或整个数据库日志读取和解析，解决了CDC多表同步场景中对日志的重复读取和解析问题。

7. **高吞吐量和低延迟：** SeaTunnel支持并行读写，提供高吞吐量和低延迟的稳定可靠的数据同步能力。

8. **完善的实时监控：** SeaTunnel支持数据同步过程中每个步骤的详细监控信息，允许用户轻松了解同步任务读写的数据数量、数据大小、QPS等信息。

9. **支持两种作业开发方法：** 编码和画布设计。SeaTunnel web项目 [https://github.com/apache/seatunnel-web](https://github.com/apache/seatunnel-web) 提供了作业的可视化管理、调度、运行和监控功能。

## SeaTunnel work flowchart

![SeaTunnel work flowchart](https://seatunnel.apache.org/assets/images/architecture_diagram-c02a9d297450d0f9522324b2f196fa06.png)

SeaTunnel的运行过程如上图所示。

用户配置作业信息并选择执行引擎后，提交作业。

源连接器负责并行读取数据并将数据发送到下游的转换器（Transform）或直接发送到汇（Sink），而汇则将数据写入目的地。值得注意的是，源、转换器和汇可以轻松地由用户自行开发和扩展。

SeaTunnel是一款EL(T)数据集成平台。因此，在SeaTunnel中，转换器只能用于对数据执行一些简单的转换，比如将列数据转换为大写或小写，更改列名，或将一列拆分为多列。

SeaTunnel默认使用SeaTunnel Engine作为执行引擎。如果选择使用Flink或Spark引擎，SeaTunnel将把连接器打包成Flink或Spark程序，并提交给Flink或Spark运行。

## **Connector（连接器）**

**Source Connectors（源连接器）:** SeaTunnel支持从各种关系型、图形、NoSQL、文档和内存数据库中读取数据；分布式文件系统如HDFS；以及各种云存储解决方案，如S3和OSS。我们还支持对许多常见SaaS服务的数据读取。您可以在此处查看详细列表。如果需要，您可以开发自己的源连接器并轻松集成到SeaTunnel中。

**Transform Connector（转换连接器）:** 如果源和汇之间的模式不同，您可以使用Transform Connector更改从源读取的模式，使其与汇的模式相同。

**Sink Connector（汇连接器）:** SeaTunnel支持将数据写入各种关系型、图形、NoSQL、文档和内存数据库；分布式文件系统如HDFS；以及各种云存储解决方案，如S3和OSS。我们还支持将数据写入许多常见的SaaS服务。您可以在此处查看详细列表。如果需要，您可以开发自己的汇连接器并轻松集成到SeaTunnel中。

## **谁在使用SeaTunnel**

SeaTunnel被广泛应用于需要进行数据集成和同步的场景。以下是可能使用SeaTunnel的一些实体：

1. **企业数据团队：** 数据团队可以利用SeaTunnel来处理不同数据源之间的数据集成和同步，确保数据在整个企业中的一致性。

2. **云服务提供商：** 云服务提供商可能使用SeaTunnel来帮助其客户在多个环境中实现数据同步和迁移。

3. **大数据处理平台：** SeaTunnel的高性能使其成为处理大规模数据集成和同步的理想选择。

4. **SaaS提供商：** SaaS提供商可以利用SeaTunnel来提供灵活且可扩展的数据集成解决方案。

总体而言，SeaTunnel适用于各种需要处理数据集成和同步的组织和场景。

# deployment

**步骤 1：准备环境**

在您希望在本地运行 SeaTunnel 之前，您需要安装 SeaTunnel 所需的以下软件：

- 已安装 Java（Java 8 或 11，理论上其他大于 Java 8 的版本也可以工作），并设置 JAVA_HOME。

**步骤 2：下载 SeaTunnel**

从 SeaTunnel 下载页面下载最新版本的 Seatunnel 分发包 `seatunnel-<version>-bin.tar.gz`。

或者，您可以通过终端下载：

```bash
export version="2.3.3"
wget "https://archive.apache.org/dist/seatunnel/${version}/apache-seatunnel-${version}-bin.tar.gz"
tar -xzvf "apache-seatunnel-${version}-bin.tar.gz"
```

**步骤 3：安装连接器插件**

自 2.2.0-beta 版本起，二进制包默认不提供连接器的依赖关系，因此第一次使用时，您需要执行以下命令来安装连接器：

```bash
sh bin/install-plugin.sh 2.3.3
```

如果需要指定连接器的版本，以 2.3.3 为例，您需要执行：

```bash
sh bin/install-plugin.sh 2.3.3
```

通常您不需要所有连接器插件，因此您可以通过配置 `config/plugin_config` 来指定您需要的插件。

例如，如果您只需要 `connector-console` 插件，可以将 `plugin.properties` 修改为：

```plaintext
--seatunnel-connectors--
connector-console
--end--
```

如果您想使示例应用正常工作，您需要添加以下插件：

```plaintext
--seatunnel-connectors--
connector-fake
connector-console
--end--
```

您可以在 `${SEATUNNEL_HOME}/connectors/plugins-mapping.properties` 下找到所有支持的连接器和相应的 `plugin_config` 配置名称。

**小贴士**

作为替代，您也可以手动从 Apache Maven 存储库下载连接器，然后手动移动到 `connectors/seatunnel` 目录中。

如果您希望通过手动下载连接器来安装连接器插件，请特别注意以下事项：

连接器目录包含以下子目录，如果它们不存在，您需要手动创建它们：

- flink
- flink-sql
- seatunnel
- spark

您可以仅下载您需要的 V2 连接器插件并将它们放置在 `seatunnel` 目录中。

此外，目前希望您已成功在本地部署了 SeaTunnel。您可以按照快速入门指南配置并运行数据同步任务。

# **使用 SeaTunnel Engine 快速入门**

**步骤 1：部署 SeaTunnel 和连接器**

在开始之前，请确保您已按照[部署说明](https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/deployment)下载并部署了 SeaTunnel。

**步骤 2：添加作业配置文件以定义一个作业**

编辑 `config/v2.batch.config.template` 文件，该文件确定了 SeaTunnel 启动后的数据输入、处理和输出方式及逻辑。

以下是配置文件的示例，与上述示例应用相同。

```yaml
env {
  execution.parallelism = 1
  job.mode = "BATCH"
}

source {
  FakeSource {
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

transform {
  FieldMapper {
    source_table_name = "fake"
    result_table_name = "fake1"
    field_mapper = {
      age = age
      name = new_name
    }
  }
}

sink {
  Console {
    source_table_name = "fake1"
  }
}
```

有关配置的更多信息，请查阅 [config 概念](https://seatunnel.apache.org/docs/2.3.3/concept/config)。

**步骤 3：运行 SeaTunnel 应用程序**

您可以通过以下命令启动应用程序：

```bash
cd "apache-seatunnel-${version}"
./bin/seatunnel.sh --config ./config/v2.batch.config.template -e local
```

查看输出：运行命令时，您可以在控制台上看到其输出。您可以将这看作是命令是否成功运行的标志。

SeaTunnel 控制台将输出如下一些日志信息：

```
2022-12-19 11:01:45,417 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - output rowType: name<STRING>, age<INT>
2022-12-19 11:01:46,489 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=1:  SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: CpiOd, 8520946
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=2: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: eQqTs, 1256802974
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=3: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: UsRgO, 2053193072
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=4: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: jDQJj, 1993016602
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=5: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: rqdKp, 1392682764
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=6: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: wCoWN, 986999925
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=7: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: qomTU, 72775247
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=8: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: jcqXR, 1074529204
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=9: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: AkWIO, 1961723427
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=10: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: hBoib, 929089763
2022-12-19 11:01:46,490 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=11: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: GSvzm, 827085798
2022-12-19 11:01:46,491 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=12: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: NNAYI, 94307133
2022-12-19 11:01:46,491 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=13: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: EexFl, 1823689599
2022-12-19 11:01:46,491 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=14: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: CBXUb, 869582787
2022-12-19 11:01:46,491 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=15: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: Wbxtm, 1469371353
2022-12-19 11:01:46,491 INFO  org.apache.seatunnel.connectors.seatunnel.console.sink.ConsoleSinkWriter - subtaskIndex=0 rowIndex=16: SeaTunnelRow#tableId=-1 SeaTunnelRow#kind=INSERT: mIJDt, 995616438
```

# 拓展阅读

[https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/quick-start-flink](https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/quick-start-flink)

[https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/quick-start-spark](https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/quick-start-spark)

# 参考资料

https://github.com/apache/seatunnel

https://seatunnel.apache.org/docs/2.3.3/about

* any list
{:toc}
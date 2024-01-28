---
layout: post
title: 数据库变化监听 database Change Data Capture cdc-01-overview
date:  2019-2-13 09:48:27 +0800
categories: [Database]
tags: [database, sharding, mysql, cdc, canal, sh]
published: true
---

# 拓展阅读

[Debezium-01-为捕获数据更改(change data capture,CDC)提供了一个低延迟的流式处理平台。](https://houbb.github.io/2019/02/13/database-sharding-cdc-debezium)

[logstash 日志处理-06-Apache NiFi](https://houbb.github.io/2023/10/30/logstash-06-apache-nifi)

[canal 阿里巴巴 MySQL binlog 增量订阅&消费组件](https://houbb.github.io/2019/02/13/database-sharding-deploy-canal)

[ETL-01-DataX 是阿里云DataWorks数据集成的开源版本。](https://houbb.github.io/2024/01/05/etl-datasource-datax-02-crud)

# mysql cdc

以下是从MySQL获取数据流的项目列表，支持从MySQL到Kafka的复制：

| 项目名称                    | 网站                                      | 描述                                                                                                               |
|-----------------------------|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| debezium                     | [https://debezium.io](https://debezium.io) | Debezium是一个开源的分布式平台，用于变更数据捕获。从MySQL到Kafka进行复制。使用mysql-binlog-connector-java。Kafka连接器。由Redhat支持的资助项目，全职员工全程工作。                               |
| Airbyte                     | [https://docs.airbyte.io/integrations/sources/mysql#change-data-capture-cdc](https://docs.airbyte.io/integrations/sources/mysql#change-data-capture-cdc) | Airbyte是一个开源的EL(T)平台，帮助您在数据仓库、湖和数据库中复制数据。                                                    |
| aesop                       | [https://github.com/Flipkart/aesop](https://github.com/Flipkart/aesop) | 构建在Databus之上。在[Flipkart](http://www.flipkart.com/)的生产中使用。允许您插入自己的代码以转换/处理MySQL事件。                                      |
| databus                     | [https://github.com/linkedin/databus](https://github.com/linkedin/databus) | Kafka的前身。从MySQL和Oracle读取，并复制到其自己的日志结构。在LinkedIn的生产中使用。没有Kafka集成。使用Open Replicator。                                      |
| FlexCDC                     | [http://github.com/greenlion/swanhart-tools/](http://github.com/greenlion/swanhart-tools/) | FlexCDC是一个守护程序，读取MySQL复制流并将记录发送到日志表或插件。支持事务和ALTER表以使日志表与MySQL服务器的DDL同步。                                    |
| Lapidus                     | [https://github.com/JarvusInnovations/lapidus](https://github.com/JarvusInnovations/lapidus) | 以newline delimited JSON的形式从MySQL、PostgreSQL和MongoDB中流出数据。可以作为守护程序运行或包含为Node.js模块。                                           |
| Maxwell                     | [https://github.com/zendesk/maxwell](https://github.com/zendesk/maxwell) | 读取MySQL事件流，将事件输出为JSON。解析ALTER/CREATE TABLE等语句以保持模式同步。用Java编写。得到良好的维护。                                           |
| mypipe                      | [https://github.com/mardambey/mypipe](https://github.com/mardambey/mypipe) | 读取MySQL事件流，并发出与INSERT、DELETE、UPDATE相对应的事件。用Scala编写。发出Avro到Kafka。                                     |
| mysql_cdc                   | [https://github.com/rusuly/mysql_cdc](https://github.com/rusuly/mysql_cdc) | 用于Rust的MySQL binlog Change Data Capture (CDC)连接器。                                                                 |
| MySqlCdc                    | [https://github.com/rusuly/MySqlCdc](https://github.com/rusuly/MySqlCdc) | 用于.NET的MySQL binlog Change Data Capture (CDC)连接器。基于mysql-binlog-connector-java。                                      |
| mysql-binlog-connector-java | [https://github.com/shyiko/mysql-binlog-connector-java](https://github.com/shyiko/mysql-binlog-connector-java) | 解析MySQL二进制日志并调用您的代码进行处理的库。Open Replicator的分支/重写。具有测试。                                          |
| mysql_streamer              | [https://github.com/Yelp/mysql_streamer](https://github.com/Yelp/mysql_streamer) | MySQLStreamer是一个数据库变更数据捕获和发布系统。负责捕获每个个体数据库变更，将其封装为消息并发布到Kafka。                                     |
| oltp-cdc-olap               | [https://github.com/xmlking/nifi-examples/tree/master/oltp-cdc-olap](https://github.com/xmlking/nifi-examples/tree/master/oltp-cdc-olap) | 使用Maxwell进行复制到Apache Nifi。                                                                                   |
| Open Replicator             | [https://code.google.com/p/open-replicator/](https://code.google.com/p/open-replicator/) | 解析MySQL二进制日志并调用您的代码进行处理的库。似乎没有得到维护。                                                       

# chat

## 详细介绍一下数据库变化监听 CDC

CDC（Change Data Capture）是一种数据库变化监听的技术，用于捕获数据库中发生的变更操作，如插入、更新和删除。

CDC允许应用程序实时地获取数据库变更信息，以便进行相应的处理。以下是关于数据库变化监听CDC的详细介绍：

1. **基本原理：**
   - CDC的基本原理是通过监听数据库的变更日志或事务日志，捕获数据库中的变更操作。
   - 当数据库发生变更时，CDC会识别这些变更并将其记录为事件，包括变更的类型、影响的表、变更前后的数据等信息。

2. **使用场景：**
   - 数据同步：将一个数据库的变更同步到另一个数据库，确保数据的一致性。
   - 实时数据仓库：构建实时数据仓库，及时更新分析数据。
   - 缓存更新：在缓存层更新数据，提高读取性能。
   - 日志审计：跟踪数据库中的变更，实现审计和追溯功能。

3. **实现方式：**
   - **数据库日志：** 大多数CDC工具使用数据库的事务日志或二进制日志来捕获变更。这些日志记录了数据库中发生的所有变更操作。
   - **轮询：** 一些CDC工具采用轮询方式，定期查询数据库中的变更，然后将变更记录为事件。

4. **事件表示：**
   - CDC捕获的变更通常以事件的形式表示，每个事件包含了变更的详细信息。事件可以是JSON格式、AVRO格式或其他自定义格式。
   - 事件通常包括变更的类型（插入、更新、删除）、受影响的表、变更前后的数据等信息。

5. **支持的数据库：**
   - CDC可以支持各种类型的数据库，包括关系型数据库（如MySQL、PostgreSQL、Oracle）、NoSQL数据库（如MongoDB）等。

6. **开源CDC工具：**
   - Debezium：支持MySQL、PostgreSQL、MongoDB等，基于数据库的binlog实现CDC。
   - Apache NiFi：支持多种数据源，提供了强大的数据流处理和CDC功能。
   - Maxwell's Daemon：支持MySQL，轻量级的CDC工具，捕获MySQL的binlog变更。

总体而言，CDC是一种强大的数据库变更监听技术，可帮助应用程序实时地响应数据库中的变更操作。在选择CDC工具时，需要考虑数据库类型、性能、可靠性以及与应用程序集成的方便程度。

## 开源 CDC 工具有哪些？

有许多开源CDC（Change Data Capture）工具可用于捕获和处理数据库中的变更数据。

以下是一些常见的开源CDC工具：

1. **Debezium:**
   - **支持数据库:** MySQL、PostgreSQL、MongoDB、SQL Server等。
   - **特点:** 基于数据库的binlog实现CDC，支持多种数据库，并提供了强大的变更数据捕获功能。

2. **Maxwell's Daemon:**
   - **支持数据库:** MySQL。
   - **特点:** 轻量级的CDC工具，通过解析MySQL的binlog实时捕获变更。

3. **Apache NiFi:**
   - **支持数据库:** 多种数据源，包括关系型数据库、NoSQL数据库等。
   - **特点:** 提供了强大的数据流处理功能，支持CDC，可以用于构建数据流和ETL（Extract, Transform, Load）工作流程。

4. **Debezium SQL Server Connector:**
   - **支持数据库:** SQL Server。
   - **特点:** Debezium的专用连接器，用于捕获SQL Server数据库的变更。

5. **Tungsten Replicator:**
   - **支持数据库:** MySQL。
   - **特点:** 提供高性能的MySQL数据库复制和变更数据捕获功能，支持多种拓扑结构。

6. **Mushroom:**
   - **支持数据库:** MySQL。
   - **特点:** 基于Java开发的数据库同步工具，支持MySQL binlog的实时捕获和数据同步。

这些工具各自有不同的特点和适用场景，选择其中一个取决于你的具体需求、数据库类型以及系统架构。

在选择CDC工具之前，建议查阅各个工具的文档和社区反馈，以了解它们的特性、性能和使用经验。

## 给出上面工具的详细对比表格

以下是Debzium、Maxwell's Daemon、Apache NiFi、Debezium SQL Server Connector、Tungsten Replicator和Mushroom这些CDC工具的简要对比表格。

请注意，这个对比表格并不详尽，具体的选择还取决于项目需求、环境和偏好。

| 功能/特性               | Debezium             | Maxwell's Daemon      | Apache NiFi           | Debezium SQL Server Connector | Tungsten Replicator   | Mushroom             |
|-------------------------|----------------------|-----------------------|-----------------------|-------------------------------|------------------------|----------------------|
| **支持的数据库**           | MySQL, PostgreSQL, MongoDB, SQL Server等 | MySQL                | 多种数据源，包括关系型数据库、NoSQL数据库等 | SQL Server                   | MySQL                | MySQL                |
| **捕获机制**               | 基于数据库的binlog     | 基于数据库的binlog      | 多种捕获机制，包括基于binlog、CDC等 | 基于数据库的CDC                   | 复制和binlog                  | 基于binlog             |
| **性能**                   | 高性能                | 轻量级                 | 取决于具体用例和配置        | 依赖于SQL Server的CDC功能           | 高性能                  | 适中                 |
| **数据格式**               | JSON, Avro等         | JSON                  | 多种数据格式，支持JSON、Avro等 | JSON                          | 自定义                   | JSON                 |
| **集成和拓展性**            | 集成Kafka等消息中间件 | REST API, Kafka, Redis | 高度可拓展，支持多种集成方式 | 集成Kafka等消息中间件             | 插件系统，支持多种拓展           | Java API，插件支持    |
| **社区支持和活跃度**         | 高                   | 适中                  | 高                   | 适中                          | 适中                   | 适中                 |
| **用途**                   | 数据同步、实时数据仓库构建、搜索引擎构建等 | 数据同步、缓存更新、实时数据仓库构建等 | 复杂数据流处理，ETL工作流程，CDC等 | SQL Server数据库变更捕获           | 数据库复制、变更数据捕获等 | 数据同步、实时数据仓库构建 |
| **文档和学习资料**           | 丰富的文档，活跃的社区 | 文档相对全面，社区一般 | 完善的文档，丰富的社区    | 相对全面的文档，较小的社区         | 文档较全面，社区适中            | 文档相对全面，社区一般 |

这只是一个简要的对比，具体选择应根据项目的具体需求、技术栈和团队经验来决定。建议在具体使用之前查阅各个工具的最新文档，以获取详细的信息。

## 开源组件对比

以下是DataX、Canal、Apache NiFi和Debezium的简要对比。请注意，这些工具在特定场景和需求下可能有不同的优劣势，因此选择取决于具体的使用情境。

| 特性/工具       | DataX                | Canal               | Apache NiFi        | Debezium           |
|-----------------|----------------------|---------------------|--------------------|---------------------|
| 数据同步方式     | 批量同步             | 增量同步            | 支持批量和增量同步 | 增量同步            |
| 数据源支持       | 多种数据源           | MySQL、Oracle等     | 多种数据源          | 多种数据库、消息队列 |
| 数据目标支持     | 多种数据目标         | 数据库等            | 多种数据目标         | 数据库、消息队列     |
| 可视化界面       | 无                   | 无                  | 支持可视化配置      | 部分支持可视化配置  |
| 扩展性           | 中                   | 中                  | 高                 | 中                  |
| 社区活跃度       | 中                   | 高                  | 高                 | 高                  |
| 实时性           | 低                   | 高                  | 可配置             | 高                  |
| 支持的数据格式   | 多种数据格式         | 结构化数据          | 多种数据格式         | 结构化数据           |
| 容错性           | 一般                 | 一般                | 高                 | 高                  |
| 数据转换能力     | 有                   | 无                  | 有                 | 无                  |

这只是一个简单的对比表格，实际选择应根据具体需求、数据特点和团队经验等因素进行综合考虑。

每个工具都有其独特的优势和适用场景，因此建议根据具体项目需求进行深入的评估和比较。

# 参考资料 

https://github.com/alibaba/canal

* any list
{:toc}
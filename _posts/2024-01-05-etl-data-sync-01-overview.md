---
layout: post
title: ETL-00-data sync 数据同步
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[kettle](https://houbb.github.io/2017/04/28/kettle)

[SymmetricDS](https://houbb.github.io/2017/04/28/symm)

# 概览

ETL

source: kakfa/mysql/oracle/neo4j

target: ES/neo4j/mysql/TDEngine

支持特性：CDC  / checkpoint

自己写的 logstash4j，学习一下别人的长处。


# 常见的 

数据同步工具调研选型：SeaTunnel 与 DataX 、Sqoop、Flume、Flink CDC 对比

产品概述

Apache SeaTunnel 是一个非常易用的超高性能分布式数据集成产品，支持海量数据的离线及实时同步。

每天可稳定高效同步万亿级数据，已应用于数百家企业生产，也是首个由国人主导贡献到 Apache 基金会的数据集成顶级项目。

SeaTunnel 主要解决数据集成领域的常见问题：

* 数据源多样：常用的数据源有数百种，版本不兼容。随着新技术的出现，出现了更多的数据源。用户很难找到能够全面快速支持这些数据源的工具。

* 复杂同步场景：数据同步需要支持离线-全量同步、离线-增量同步、CDC、实时同步、全库同步等多种同步场景。

* 资源需求高：现有的数据集成和数据同步工具往往需要大量的计算资源或JDBC连接资源来完成海量小表的实时同步。这在一定程度上加重了企业的负担。

* 缺乏质量和监控：数据集成和同步过程经常会丢失或重复数据。同步过程缺乏监控，无法直观了解任务过程中数据的真实情况。

* 技术栈复杂：企业使用的技术组件各不相同，用户需要针对不同的组件开发相应的同步程序来完成数据集成。

* 管理维护困难：市面上的数据集成工具通常受限于不同的底层技术组件（Flink/Spark），使得离线同步和实时同步往往是分开开发和管理的，增加了管理和维护的难度。

![view](https://pic2.zhimg.com/80/v2-fa67de4f1b0e77558fe2b53b63185661_720w.webp)

SeaTunnel 产品实现了高可靠性、集中管理、可视化监控等一体的数据集成统一平台。

平台可以实现了标准化、规范化、界面化操作；实现了数据同步高速化，全量到增量无锁化自动切换，目前已经支持 100+ 种数据源；支持整库同步、表结构自动变更；同时无中心化设计确保系统的高可用机制，整体上做到简单易用，开箱即用。

同类产品横向对比
2.1、高可用、健壮的容错机制
DataX 只支持单机，SeaTunnel 和 Flink CDC 支持集群，因此在高可用上 DataX 是不支持的，DataX由于单机设计很易受网络闪断、数据源不稳定等因素的影响造成数据不一致问题。

Apache SeaTunnel具有无中心化的高可用架构设计和完善的容错机制，SeaTunnel支持更细粒度的作业回滚机制，结合多阶段提交与CheckPoint机制，确保数据一致的同时避免大量回滚导致性能下降

Flink CDC采用主从模式的架构设计，容错粒度较粗，多表同步时，Flink 任何表出现问题都会导致整个作业失败停止，导致所有表同步延迟。

在高可用维度上，SeaTunnel 和 Flink CDC 优势很大

2.2、部署难度和运行模式
Apache SeaTunnel 和 DataX 部署都十分容易。
Flink CDC 的部署难度中等，但因为它依赖于 Hadoop 生态系统， 所以部署相对 SeaTunnel 会复杂一些。
2.3、支持的数据源丰富度
Apache SeaTunnel 支持 MySQL、PostgreSQL、Oracle、SQLServer、Hive、S3、RedShift、HBase、Clickhouse 等 100 多种数据源。

DataX 支持 MySQL、ODPS、PostgreSQL、Hive 等 20 多种数据源。

Flink CDC 支持 MySQL、PostgreSQL、MongoDB、SQLServer 等 10 多种数据源。

Apache SeaTunnel 支持关系型数据库、NOSQL 数据库、数据仓库、实时数仓、大数据、云数据源、 SAAS、消息队列、标准接口、文件、FTP等多种数据源同步,数据可以同步到任一指定的系型数据库、NOSQL 数据库、数据仓库、实时数仓、大数据、云数据源、 SAAS、标准接口、消息队列、文件等目标数据源中,满足政府、企事业单位对于数据流动的绝大多数需求。在这个维度的对比上，显然 SeaTunnel 支持的数据源丰富度是远远高于其他两个的。

2.4、内存资源占用
Apache SeaTunnel 占用较少的内存资源，SeaTunnel Zeta 引擎的 Dynamic Thread Sharing 技术可提高 CPU 利用率，不依赖 HDFS，Spark 等复杂组件，具备更好单机处理性能。

DataX 和 Flink CDC 会占用较多的内存资源， Flink CDC 每个作业只能同步一张表，多张表同步需要启动多个 Job 运行，造成巨大浪费资源。

2.5、数据库连接占用
Apache SeaTunnel 占用较少的数据库连接，支持多表或整库同步，解决 JDBC 连接过多的问题； 同时实现了 zero-copy 技术，无需序列化开销。

DataX 和 Flink CDC 占用较多的数据库连接，他们每个 Task 只能处理一张表，每张表至少需要一个JDBC 连接来读取或写入数据。当进行多表同步和整库同步时，需要大量的 JDBC 连接。

这通常是 DBA 们十分关注的，数据同步不能影响业务库正常运行，所以控制连接数占用是十分必要的。

2.6、自动建表
Apache SeaTunnel 支持自动建表。

DataX 和 Flink CDC 不支持自动建表。

2.7、整库同步
Apache SeaTunnel 设计有支持整库同步，方便用户使用，不需要为每张表都写一遍配置。

DataX 和 Flink CDC 不支持整库同步，每个表需要单独配置。

试想一下当你有数百张表，每张都单独配置一遍是不是还是太费劲了些！

2.8、断点续传
断点续传功能在数据同步过程是十分实用的功能，支持断点续传将让数据同步在手动暂停或出问题时能快速恢复继续，Apache SeaTunnel 和 Flink CDC 可以支持断点续传，但 DataX 不支持断点续传。

2.9、多引擎支持
Apache SeaTunnel 支持 SeaTunnel Zeta、Flink 和 Spark 三个引擎选其一作为运行时。

DataX 只能运行在 DataX 自己的引擎上。

Flink CDC 只能运行在 Flink 上。

在引擎支持丰富度上，SeaTunnel 具有更佳的优势。

2.10、数据转换算子
Apache SeaTunnel 支持 Copy、Filter、Replace、Split、SQL 和自定义 UDF 等算子。

DataX 支持补全、过滤等算子，还可以使用Groovy自定义算子。

Flink CDC 支持 Filter、Null、SQL 和自定义 UDF 等算子。

在数据转换上，这 3 个支持力度差不多。

2.11、性能
因为 DataX 只有单机版，所以对比性能时统一使用单机来进行

DataX 和 Flink CDC 的单机性能较好。但 Apache SeaTunnel 的单机性能比 DataX 高 40%-80% 左右。

社区有贡献者曾做过测试，测试场景如下：

本地测试场景：MySQL-Hive, Postgres-Hive, SQLServer-Hive, Orache-Hive

云测试场景：MySQL-S3

列数：32，基本包含大部分数据类型

行数：3000w 行

Hive 文件 text 格式 18G

测试节点：单机 8C16G

测试结果：

在本地测试场景下： SeaTunnel Zeta VS DataX

SeaTunnel Zeta 比 DataX 同步数据快 40-80% 左右。同时SeaTunnel Zeta 对内存的使用比 DataX 少且稳定的多。

在云数据同步场景下：SeaTunnel 在 MySQL 到 S3 场景下性能是 Airbyte 的 30 多倍，是 AWS DMS 和 Glue 的 2 到 5 倍。






# chat

## 详细谈一下 ETL

ETL代表Extract, Transform, Load，是一种在数据仓库和商业智能环境中常见的数据集成过程。该过程包含三个主要阶段：

1. **提取 (Extract):**
   - 在这个阶段，数据从源系统中提取出来。这可以是来自数据库、日志文件、API调用或其他数据存储的信息。提取的目标是将数据从原始系统中获取出来，为进一步处理做好准备。

2. **转换 (Transform):**
   - 提取的数据可能需要经过多种转换步骤，以使其适用于目标系统或目标数据仓库。这包括清理、规范化、重命名、合并等操作。转换阶段的目标是将提取的数据转换成适合目标系统的格式，并确保数据的一致性、质量和可用性。

3. **加载 (Load):**
   - 加载阶段将经过提取和转换的数据加载到目标系统，通常是数据仓库或目标数据库。这可能涉及将数据插入表中、创建索引、生成聚合表等操作。加载的目标是确保数据按照定义的规则和结构存储在目标系统中。

**ETL的关键特点和概念:**

- **增量加载 (Incremental Loading):** 只加载发生变化的数据，而不是全部重新加载整个数据集，以提高效率。
  
- **数据清洗 (Data Cleansing):** 清理不一致、不准确或不完整的数据，以确保高质量的数据用于分析和报告。

- **事务性处理 (Transactional Processing):** ETL过程通常是事务性的，确保在处理数据时的一致性和可靠性。

- **数据合并 (Data Merging):** 将来自不同源的数据合并，以便在目标系统中形成一致的视图。

- **调度和监控 (Scheduling and Monitoring):** ETL过程通常需要定期运行，并需要监控和报告处理的状态和结果。

- **元数据管理 (Metadata Management):** 管理和维护关于数据源、转换规则和目标数据结构的元数据，以便更好地理解和维护整个ETL流程。

**常见的ETL工具:**

1. **Apache NiFi:** 一个开源的数据集成工具，用于自动化流式数据和ETL工作流。

2. **Apache Spark:** 一个通用的大数据处理引擎，它可以用于ETL、数据分析、机器学习等任务。

3. **Talend:** 一个开源的ETL工具，提供图形界面来设计和管理ETL过程。

4. **Informatica PowerCenter:** 一个商业化的ETL工具，广泛用于企业级数据集成。

5. **Microsoft SQL Server Integration Services (SSIS):** 集成到Microsoft SQL Server中的ETL工具，适用于Microsoft生态系统。

ETL是数据仓库和商业智能项目中的关键环节，它确保数据从多个源头整合、清理，并存储在一个一致的、可用于分析和报告的位置。

## 类似于 kettle 的 ETL 开源工具有哪些？

类似于Kettle（现在称为Pentaho Data Integration）的开源ETL工具有许多。以下是一些常见的开源ETL工具：

1. **Talend Open Studio:**
   - Talend是一个流行的开源数据集成平台，提供了Talend Open Studio，一个图形化的ETL工具。它支持大量的数据连接器和组件，可以用于处理各种ETL任务。

2. **Apache NiFi:**
   - Apache NiFi是一个强大的、可扩展的数据集成工具，专注于构建数据流。它提供了直观的用户界面，支持大规模的数据移动、转换和处理。

3. **Apache Camel:**
   - Apache Camel是一个开源的集成框架，支持多种数据转换和路由模式。它可以与不同的组件和数据源集成，用于构建自定义的ETL流程。

4. **GeoKettle:**
   - GeoKettle是Kettle的一个分支，专注于地理信息系统（GIS）数据的ETL。它提供了对地理数据的特殊处理和转换。

5. **Scriptella ETL:**
   - Scriptella是一个轻量级的ETL框架，使用XML或注释配置。它支持使用SQL、脚本和其他自定义处理来执行ETL任务。

6. **Apatar:**
   - Apatar是一个开源的、可视化的ETL工具，支持多个数据源。它提供了一个直观的图形用户界面，用于设计和执行ETL流程。

这些工具都具有不同的特点和适用场景，选择取决于项目的具体需求、技术栈和团队的偏好。

在选择ETL工具时，还需要考虑其性能、社区支持、文档质量以及与其他系统的集成能力。

## 类似于 datax 不同的数据源同步工具有哪些？

除了DataX之外，还有一些其他用于不同数据源同步的工具。以下是一些常见的工具：

1. **Apache Sqoop:**
   - Sqoop是Apache软件基金会的项目，用于在Apache Hadoop和关系型数据库之间传输数据。它支持从关系型数据库（如MySQL、Oracle）导入数据到Hadoop，也支持将数据从Hadoop导出到关系型数据库。

2. **Talend Open Studio:**
   - Talend也可以用作数据集成和同步的工具。它支持多种数据源，包括关系型数据库、文件、云服务等。Talend提供了可视化的界面，使得设计和执行数据同步任务变得更加直观。

3. **AWS Glue:**
   - AWS Glue是亚马逊AWS的托管ETL服务，支持从多个数据源抽取、转换和加载数据。它可以用于处理云中的数据，包括Amazon S3、RDS、Redshift等。

4. **Kafka Connect:**
   - Kafka Connect是Apache Kafka的一部分，用于连接Kafka消息系统与其他数据存储系统。它有许多连接器（Connectors），支持从不同的数据源抽取和加载数据。

5. **Flume:**
   - Apache Flume是一个分布式的、可靠的、可用于将大量数据从各种源头收集到Hadoop的工具。它支持多种数据源，并提供了强大的事件传递机制。

6. **Maxwell:**
   - Maxwell是一个开源的MySQL数据库二进制日志（binlog）解析器，它可以捕获变更并将其传递到其他系统。它用于实时地捕获MySQL数据库中的更改并同步到其他数据存储。

这些工具适用于不同的场景和需求。选择合适的工具通常取决于项目的具体要求、数据源类型以及与其他系统的集成需求。


# 参考资料

https://github.com/alibaba/DataX

https://zhuanlan.zhihu.com/p/666726655?utm_id=0

* any list
{:toc}
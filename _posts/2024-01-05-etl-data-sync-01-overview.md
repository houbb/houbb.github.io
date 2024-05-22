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

产品概述

# apache seatunenl 给人的思考

首先是宣发+生态

cdc=> 非常有用的设计

任务的并行拆分处理

统一的 seatunnel row 对象抽象。

map=>transfer=>reduce

怎么实现不停机的任务变化？资源隔离？

插件化：标准定义好之后，可以支持多种模式

流批一体化









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
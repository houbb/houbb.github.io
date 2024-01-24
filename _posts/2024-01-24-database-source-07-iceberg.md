---
layout: post
title: Apache Iceberg 开源的数据表格格式，用于在大规模数据湖中存储和管理结构化数据
date: 2024-01-24 21:01:55 +0800
categories: [Database]
tags: [database, sql, big-data, apache, sh]
published: true
---

# Iceberg 介绍

Apache Iceberg是一个用于大型分析数据集的开放表格格式。

Iceberg通过为计算引擎（包括Spark、Trino、PrestoDB、Flink、Hive和Impala）添加表格，采用高性能的表格格式，其操作方式与SQL表格相同。

## 用户体验

Iceberg避免了令人不快的惊喜。模式演变可靠运行，不会无意中取消删除数据。用户无需了解分区即可获得快速查询。

模式演变支持添加、删除、更新或重命名，并且没有副作用
隐藏分区防止用户错误，导致悄无声息的不正确结果或极慢的查询
分区布局演变可以根据数据量或查询模式的变化更新表格的布局
时间旅行使查询可重现，使用完全相同的表格快照，或让用户轻松查看更改
版本回滚允许用户通过将表格重置为良好状态来快速纠正问题

## 可靠性和性能

Iceberg专为巨大的表格而构建。Iceberg在生产环境中得到使用，其中单个表格可以包含数十PB的数据，即使这些庞大的表格也可以在不使用分布式SQL引擎的情况下进行读取。

扫描计划迅速 - 读取表格或查找文件时不需要分布式SQL引擎
高级过滤 - 使用分区和列级统计信息对数据文件进行修剪，使用表格元数据
Iceberg旨在解决一致性最终云对象存储中的正确性问题。

适用于任何云存储，并通过避免列出和重命名来减少在HDFS中的名称节点拥塞
可串行化隔离 - 表格更改是原子的，读取者永远不会看到部分或未提交的更改
多个并发写入程序使用乐观并发，并会重试以确保兼容的更新成功，即使写入发生冲突

## 开放标准

Iceberg经过设计和开发，成为一个开放的社区标准，具有规范以确保在不同语言和实现之间的兼容性。

Apache Iceberg是开源的，并在Apache Software Foundation进行开发。

# chat

## 详细介绍一下 Apache Iceberg

Apache Iceberg 是一个开源的数据表格格式，用于在大规模数据湖中存储和管理结构化数据。

Iceberg 设计的目标是提供高性能、可扩展、容错的数据表格式，以满足数据湖中复杂和多样化的查询需求。

以下是 Apache Iceberg 的一些关键特性和概念：

1. **事务性写入：** Iceberg 支持原子性、一致性、隔离性和持久性（ACID）的事务，确保数据表的一致性和可靠性。这是通过将数据表写入操作分解为小的事务单元来实现的，以便于管理和维护。

2. **快照和历史：** Iceberg 使用快照来跟踪数据表的变化。每当对表进行更改时，Iceberg 将创建一个新的快照，从而提供表的历史视图。这使得可以轻松地回滚到以前的表状态。

3. **分区：** Iceberg 支持基于表的分区，这使得在查询时可以更高效地过滤数据。分区可以基于一个或多个列，提高了查询性能和数据组织的灵活性。

4. **Schema Evolution：** Iceberg 提供了强大的模式演变功能，允许用户在不中断现有查询的情况下更改表的结构。这包括添加、删除和修改列等操作。

5. **元数据管理：** Iceberg 管理表的元数据，包括表的结构、分区信息、快照信息等。这些元数据存储在元数据表中，使得可以轻松地了解和查询表的状态。

6. **可扩展性：** Iceberg 被设计为可扩展的，适用于大规模数据湖。它可以与各种存储后端集成，如 Apache Hadoop 分布式文件系统（HDFS）、Amazon S3、Azure Blob Storage 等。

7. **查询性能优化：** Iceberg 通过索引、统计信息和元数据缓存等机制来优化查询性能。它允许使用谓词下推、投影剪裁等技术，以在查询时最小化读取的数据量。

8. **开源生态系统：** Iceberg 是一个开源项目，由 Apache Software Foundation 托管。它能够与许多流行的大数据生态系统工具集成，如 Apache Spark、Apache Hive、Apache Flink 等。

总体而言，Apache Iceberg 提供了一种灵活、可靠且高性能的方式来管理和查询结构化数据，特别适用于大规模的数据湖环境。

## iceberg 的特点和应用场景

Apache Iceberg 具有许多特点，使其在不同的应用场景中得到广泛应用。

以下是一些 Iceberg 的主要特点和适用场景：

### 特点：

1. **ACID 事务支持：** Iceberg 提供原子性、一致性、隔离性和持久性的事务，确保对数据的写入是可靠和一致的。这使得 Iceberg 适用于要求高数据可靠性的应用场景，如金融和企业级应用。

2. **Schema Evolution：** Iceberg 支持对表结构进行演变，包括添加、删除和修改列等操作。这使得 Iceberg 适用于需要经常更改数据模型的应用，而无需中断现有查询。

3. **快照和历史：** Iceberg 使用快照来跟踪数据表的历史变化，使得可以轻松地回滚到以前的表状态。这对于数据还原、分析历史数据和实现时间旅行查询等场景非常有用。

4. **分区：** Iceberg 支持基于表的分区，使得可以更高效地查询和过滤数据。分区能够提高查询性能，并且能够支持对分区进行动态更改。

5. **可扩展性：** Iceberg 被设计为可扩展的，可以与多种存储后端集成，如 HDFS、S3、Azure Blob Storage 等。这使得 Iceberg 能够适应不同的存储需求和云环境。

6. **元数据管理：** Iceberg 管理表的元数据，包括表的结构、分区信息、快照信息等。这使得用户能够了解表的状态，进行元数据查询，并确保元数据的一致性。

7. **查询性能优化：** Iceberg 通过索引、统计信息和元数据缓存等机制来优化查询性能。它支持谓词下推、投影剪裁等技术，以最小化读取的数据量，提高查询效率。

8. **开源生态系统：** Iceberg 是一个开源项目，得到了 Apache Software Foundation 的支持，可以与大数据生态系统中的其他工具无缝集成。

### 应用场景：

1. **大数据湖管理：** Iceberg 适用于大规模的数据湖环境，能够有效管理和查询结构化数据。

2. **数据仓库构建：** Iceberg 可以用作构建数据仓库的基础，支持快速、可靠的数据写入和查询。

3. **数据版本控制：** 由于 Iceberg 提供了快照和历史功能，因此可以用于数据版本控制，使得用户可以轻松地查看和还原以前的数据状态。

4. **实时分析：** Iceberg 支持高性能的查询和事务，使得它适用于需要实时分析大量结构化数据的场景。

5. **大规模 ETL：** Iceberg 的事务性写入和查询性能优化功能使得它适用于大规模的 ETL（Extract, Transform, Load）任务。

总体而言，Apache Iceberg 是一个多功能的数据表格格式，适用于大量不同的应用场景，特别是在需要高性能、可靠性和灵活性的数据管理环境中。

## 类似 iceberg 的开源组件有哪些？

在开源生态中，有一些类似于 Apache Iceberg 的开源组件，它们也专注于数据湖、大数据表格格式、事务性写入等方面。

以下是一些类似的项目：

1. **Apache Hive：** Hive 是一个数据仓库工具，提供了类似于 SQL 的查询语言（HiveQL），允许在大数据存储中执行分析查询。Hive使用类似Iceberg的概念来管理表和支持模式演变。

2. **Delta Lake：** Delta Lake 是由 Databricks 开发的一个开源项目，为 Apache Spark 提供 ACID 事务性支持。它建立在 Parquet 格式之上，提供了版本控制、模式演变和事务等功能，与 Iceberg 有一些相似之处。

3. **Apache Hudi（Hadoop Upserts Deletes and Incrementals）：** Hudi 是一个 Apache 开源项目，专注于增量数据处理和事务性写入。它能够在数据湖中支持插入、更新和删除等操作，并提供了类似 ACID 的事务性支持。

4. **Apache ORC（Optimized Row Columnar）：** ORC 是一种列式存储格式，类似于 Parquet。它优化了读取和查询性能，并提供了一些额外的功能，如索引和统计信息。

5. **Amazon S3 Select：** 尽管不是一个完整的表格式，但Amazon S3 Select是一个用于在 Amazon S3 存储桶中选择和检索数据的服务，可以在某种程度上与大规模数据湖中的查询需求相符合。

这些项目各自有其特定的优势和适用场景，具体选择应该根据项目需求、数据湖架构和所使用的生态系统工具来决定。 

Iceberg 在这些项目中的主要特色之一是其对表格结构和模式演变的支持，以及对不同存储后端的可扩展性。

## 给出 iceberg 的学习资料，包含网址

以下是 Apache Iceberg 的一些学习资料，包括官方文档、GitHub 仓库以及相关社区资源：

1. **官方文档：**
   - [Apache Iceberg 官方文档](https://iceberg.apache.org/)
     - 官方文档包含了 Iceberg 的详细说明、概念、API 参考等内容。

2. **GitHub 仓库：**
   - [Apache Iceberg GitHub 仓库](https://github.com/apache/iceberg)
     - Iceberg 的源代码托管在 GitHub 上，你可以在这里找到最新的源代码、问题追踪和社区讨论。

3. **社区资源：**
   - [Apache Iceberg Mail列表](https://iceberg.apache.org/community/#mail-lists)
     - 可以加入 Apache Iceberg 的邮件列表，获取最新的社区讨论、问题解答和版本发布通知。
   - [Apache Iceberg Slack 频道](https://iceberg.apache.org/community/#slack)
     - 加入 Slack 频道，与其他 Iceberg 用户和开发者交流。

4. **示例和教程：**
   - [Iceberg 示例](https://github.com/apache/iceberg/blob/main/iceberg-examples/src/main/java/org/apache/iceberg/examples/)
     - Iceberg 仓库中包含一些示例代码，可以帮助你入门 Iceberg 的使用。
   - [Apache Iceberg 教程](https://github.com/apache/iceberg/blob/main/docs/content/docs/1.0.0/tutorials/hello-world.md)
     - Iceberg 官方文档中的教程，提供了一步步的指导，帮助你了解 Iceberg 的基本概念和用法。

5. **技术博客和文章：**
   - [Databricks 博客 - "Introducing Delta Lake"](https://databricks.com/blog/2019/09/24/introducing-delta-lake.html)
     - 这篇博客介绍了 Delta Lake，它是 Databricks 团队为 Apache Spark 构建的与 Iceberg 有相似目标的项目。
   - [Iceberg: An Open Table Format for Huge Analytical Workloads](https://engineering.linkedin.com/blog/2020/iceberg-table-format)
     - LinkedIn 工程团队撰写的一篇文章，详细介绍了他们为什么选择 Iceberg 以及使用 Iceberg 的经验。

请注意，Iceberg 是一个活跃的开源项目，文档和资源可能会不断更新和完善。

在学习过程中，建议查阅最新的官方文档和社区资源，以获取最准确的信息。

# 参考资料

https://iceberg.apache.org/docs/latest/

* any list
{:toc}

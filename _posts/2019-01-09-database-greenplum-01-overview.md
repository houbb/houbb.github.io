---
layout: post
title: Greenplum Database Greenplum 数据库
date: 2019-1-9 08:44:18 +0800
categories: [Database]
tags: [database, big-data, sh]
published: true
---

# greenplum 

[Experience Greenplum Database](https://greenplum.org/) , an open-source massively parallel data platform for analytics, machine learning and AI.

## greenplum 与 postgresql

greenplum是利用了 postgresql 数据库的框架，也就相当于说是，GP数据库是基于PG数据库进行开发的。

## 特性

如果想在数据仓库中快速查询结果，可以使用greenplum。

Greenplum数据库也简称GPDB。它拥有丰富的特性：

第一，完善的标准支持：GPDB完全支持ANSI SQL 2008标准和SQL OLAP 2003 扩展；从应用编程接口上讲，它支持ODBC和JDBC。完善的标准支持使得系统开发、维护和管理都大为方便。而现在的 NoSQL，NewSQL和Hadoop 对 SQL 的支持都不完善，不同的系统需要单独开发和管理，且移植性不好。

第二，支持分布式事务，支持ACID。保证数据的强一致性。

第三，做为分布式数据库，拥有良好的线性扩展能力。在国内外用户生产环境中，具有上百个物理节点的GPDB集群都有很多案例。

第四，GPDB是企业级数据库产品，全球有上千个集群在不同客户的生产环境运行。这些集群为全球很多大的金融、政府、物流、零售等公司的关键业务提供服务。

第五，GPDB是Greenplum（现在的Pivotal）公司十多年研发投入的结果。GPDB基于 PostgreSQL 8.2，PostgreSQL 8.2有大约80万行源代码，而GPDB现在有130万行源码。相比PostgreSQL 8.2，增加了约50万行的源代码。

第六，Greenplum有很多合作伙伴，GPDB有完善的生态系统，可以与很多企业级产品集成，譬如SAS，Cognos，Informatic，Tableau等；也可以很多种开源软件集成，譬如Pentaho,Talend 等。

# 拓展阅读

[postgresql](https://houbb.github.io/2018/01/08/postgresql)

- 列式数据库

[info-bright](https://houbb.github.io/2018/12/27/info-bright)

- 数据查询

[Elasticsearch](https://houbb.github.io/2018/11/15/elasticsearch)

# chat

## 详细介绍一下 Greenplum

Greenplum是一种用于数据仓库和分析的大规模并行处理（MPP）数据库管理系统。

它最初由Greenplum公司开发，后来被Pivotal Software收购，而Pivotal Software又在2019年被VMware收购。

Greenplum是一个开源项目，基于PostgreSQL构建，但它扩展了PostgreSQL以支持并行处理和大规模数据分析。

以下是Greenplum的一些关键特性和特点：

1. **大规模并行处理（MPP）：** Greenplum通过在多个节点上并行执行查询来实现高性能的数据处理。每个节点都有自己的处理器和内存，使得系统能够同时处理大量数据。

2. **列存储：** Greenplum采用列存储的方式来存储数据，这有助于提高查询性能。列存储将表中的每一列分别存储在磁盘上，而不是像传统的行存储数据库那样将整个行存储在一起。

3. **分布式架构：** 数据库的数据被分布式存储在多个节点上，这使得Greenplum能够处理非常大的数据集。每个节点都可以独立执行查询，然后将结果合并以提高整体性能。

4. **并行加载：** Greenplum支持并行加载数据，这使得在大规模数据仓库中高效地导入大量数据成为可能。

5. **高度可扩展性：** Greenplum的架构允许在需要时轻松地扩展系统，以处理更多的数据和更大的工作负载。

6. **SQL兼容性：** Greenplum保留了PostgreSQL的SQL兼容性，这意味着已经熟悉PostgreSQL的开发人员可以相对容易地转移到Greenplum。

7. **并行优化器：** Greenplum具有优化查询执行计划的并行优化器，以确保在大规模并行处理中实现最佳性能。

8. **分析和数据挖掘支持：** 由于其并行处理和大规模数据处理能力，Greenplum在支持复杂分析和数据挖掘操作方面表现出色。

Greenplum通常用于大规模的数据仓库和数据分析工作负载，适用于需要处理海量数据和执行复杂分析的场景，如企业的商业智能和大数据分析。

## 详细介绍一下 大规模并行处理（MPP）

大规模并行处理（MPP）是一种处理大量数据的计算框架，它通过同时在多个处理单元上执行任务来提高性能。

MPP系统通常用于数据仓库和大数据处理，以应对海量数据和复杂查询的需求。

以下是MPP的一些关键特点和工作原理：

1. **分布式架构：** MPP系统采用分布式架构，将数据分割成多个部分并存储在不同的节点上。每个节点都有自己的处理器、内存和存储，节点之间通过高速网络进行通信。

2. **并行执行：** MPP系统的关键特性是能够在多个处理节点上同时执行任务。这意味着一个大任务可以被分解成多个小任务，每个小任务在不同的节点上并行执行，从而加速整体处理速度。

3. **数据分片：** 数据在MPP系统中被水平分片，每个节点负责处理其中的一部分数据。这种分片方式使得系统能够轻松地扩展，只需添加更多的节点即可处理更多的数据。

4. **任务协调：** MPP系统需要一个中央协调器来管理和调度任务。这个协调器负责将查询分解成子任务，将这些子任务分配给不同的节点，并确保它们协同工作以完成整个查询。

5. **数据传输优化：** 由于数据分布在不同的节点上，MPP系统需要有效地在节点之间传输数据。高速网络和优化的数据传输算法帮助减少数据移动的开销，提高整体性能。

6. **负载平衡：** MPP系统需要在各个节点上均匀分配工作负载，以确保所有节点都能够充分利用其计算和存储资源。负载平衡有助于防止某些节点成为性能瓶颈。

7. **故障容忍：** 由于MPP系统通常由许多节点组成，系统需要具备故障容忍能力。即使某个节点出现故障，系统仍然能够继续工作，而不影响整体性能。

8. **扩展性：** MPP系统可以轻松地扩展以适应不断增长的数据量和工作负载。通过添加更多的节点，系统能够线性扩展，保持高性能。

大规模并行处理在处理大数据、执行复杂查询和支持数据分析等方面表现出色，因此在数据仓库、商业智能和大数据分析领域得到了广泛应用。

## 类似 greenplum 的数据库有哪些？

类似于Greenplum的数据库通常是大规模并行处理（MPP）数据库，专注于处理大规模数据仓库和分析工作负载。以下是一些类似于Greenplum的数据库：

1. **Teradata:**
   - **特点：** Teradata是一个MPP数据库管理系统，专注于数据仓库和分析。它提供高度并行的处理能力，支持复杂查询和大规模数据分析。
   
2. **Netezza:**
   - **特点：** Netezza（现在是IBM PureData System for Analytics）是一款专门设计用于高性能分析的MPP数据库。它采用硬件加速技术，提供快速的查询性能。

3. **Amazon Redshift:**
   - **特点：** Amazon Redshift是亚马逊云服务（AWS）提供的云数据仓库解决方案，采用MPP架构。它具有弹性伸缩性，可根据需求自动调整计算和存储资源。

4. **Snowflake:**
   - **特点：** Snowflake是一种云原生数据仓库，支持MPP处理。它提供了分离计算和存储的架构，以实现弹性的资源管理和灵活的数据存储。

5. **Vertica:**
   - **特点：** Vertica是一款由Micro Focus开发的MPP数据库，专注于实时大数据分析。它支持高度并行的处理和实时数据加载。

6. **Exasol:**
   - **特点：** Exasol是一种高性能、高度并行的数据库管理系统，专注于分析工作负载。它具有内存驱动的架构，以提供快速的查询性能。

7. **SAP HANA:**
   - **特点：** SAP HANA是一种内存数据库，但它也支持MPP处理。它在内存中存储和处理数据，适用于实时分析和数据挖掘。

8. **Citus Data (CitusDB):**
   - **特点：** Citus是一个开源的分布式数据库扩展，可以将PostgreSQL转变为MPP数据库。它允许水平扩展，将数据分布在多个节点上。

请注意，数据库市场是不断发展的，新的技术和产品可能在我知识截至日期后已经推出。

选择数据库时，需要根据具体的需求和环境考虑各种因素，包括性能、可扩展性、成本等。

## 为什么 greenplum 要基于 PostgreSQL？而不是基于 mysql?

Greenplum选择基于PostgreSQL而不是MySQL的原因有几个方面：

1. **PostgreSQL的成熟性：** PostgreSQL是一个成熟、稳定、功能丰富的开源关系型数据库管理系统。它在事务支持、SQL标准遵循、扩展性和可定制性等方面有很好的表现。Greenplum通过构建在PostgreSQL之上，能够利用这些成熟的特性。

2. **PostgreSQL的可扩展性：** Greenplum需要支持大规模并行处理（MPP），这要求底层数据库系统具有良好的可扩展性。PostgreSQL的架构设计允许在分布式环境中实现水平扩展，使得Greenplum能够有效地处理大量数据。

3. **SQL标准遵循：** PostgreSQL严格遵循SQL标准，这意味着Greenplum继承了这种对标准的支持。这有助于确保Greenplum的兼容性，使得在SQL查询和语法方面与PostgreSQL更加一致。

4. **PostgreSQL的社区支持：** PostgreSQL拥有一个庞大的活跃社区，这意味着有许多开发者和用户不断地贡献和维护该系统。Greenplum作为一个基于PostgreSQL的分支，可以受益于这个强大的社区支持，从而更容易获取解决问题的支持和更新。

5. **开源和许可协议：** PostgreSQL采用开源协议（PostgreSQL许可证），这使得Greenplum能够自由使用、修改和分发，同时保持开源的灵活性。

总体而言，选择基于PostgreSQL而不是MySQL是基于技术和生态系统的考虑。PostgreSQL提供了Greenplum所需的功能和扩展性，同时与Greenplum的目标相契合。

## greenplum 相比较 PostgreSQL 增加了哪些核心能力？

Greenplum是建立在PostgreSQL之上的大规模并行处理（MPP）数据库系统，为了满足大规模数据仓库和分析的需求，它在PostgreSQL的基础上增加了一些核心能力。以下是Greenplum相对于PostgreSQL的一些主要扩展和增强：

1. **大规模并行处理（MPP）：** Greenplum引入了MPP架构，允许在多个节点上并行执行查询。每个节点都有自己的计算资源和存储，从而可以同时处理大量数据，提高整体性能。

2. **列存储：** Greenplum采用列存储的方式，将数据按列而非行进行存储。这对于数据仓库和分析工作负载来说是一个重要的优化，可以提高查询性能，特别是当只需要访问某些列时。

3. **分布式架构：** Greenplum将数据分布式存储在多个节点上，每个节点负责管理和处理其分片的数据。这种架构使得Greenplum能够轻松扩展以处理更大的数据集。

4. **并行加载：** Greenplum支持并行加载数据，这使得在大规模数据仓库中高效地导入大量数据成为可能。它可以通过并行加载数据来提高数据导入的速度。

5. **高度并行的优化器：** Greenplum具有专门针对MPP环境的并行优化器，它能够生成并行执行计划，最大程度地利用所有节点的计算资源，从而提高查询性能。

6. **分布式数据处理算法：** Greenplum引入了一些分布式数据处理算法，以支持在整个集群上进行数据操作和计算，包括聚合、排序、连接等操作。

7. **并行加载和并行导出：** Greenplum提供了并行加载和并行导出的功能，这有助于提高数据的导入和导出效率。

8. **大数据生态系统集成：** Greenplum与大数据生态系统集成，可以通过外部表进行Hadoop和Spark的数据交互，支持复杂的分析工作负载。

总体而言，Greenplum在保留了PostgreSQL的SQL兼容性的同时，通过上述增强和扩展，使得它更适合处理大规模数据仓库和复杂分析工作负载。

## 给出 greenplum 的学习资料，包含网址

以下是学习Greenplum的一些资料和网址，这些资源包括官方文档、社区论坛以及其他有关Greenplum的教程和参考资料：

1. **Greenplum官方文档:**
   - [Greenplum官方文档](https://gpdb.docs.pivotal.io/)
     - 提供了Greenplum数据库的详尽文档，包括安装、配置、管理和使用方面的内容。

2. **Greenplum社区论坛:**
   - [Greenplum社区论坛](https://community.pivotal.io/s/topic/0TO0P000000IOtXWA1/gpdb-greenplum-database)
     - Pivotal社区论坛是一个交流Greenplum经验和问题的地方，你可以在这里提问、分享和学习。

3. **GitHub Greenplum仓库:**
   - [Greenplum GitHub仓库](https://github.com/greenplum-db/gpdb)
     - Greenplum的开源代码仓库，你可以在这里找到最新的源代码、问题追踪和参与开发讨论。

4. **Greenplum学习路径:**
   - [Pivotal Academy - Greenplum Learning Path](https://academy.pivotal.io/)
     - Pivotal Academy提供了一系列关于Greenplum的在线课程，覆盖了从基础知识到高级主题的内容。

5. **Greenplum SQL参考卡:**
   - [Greenplum SQL参考卡](https://gpdb.docs.pivotal.io/5170/sqlref/sql-reference.html)
     - 提供Greenplum SQL的快速参考，适用于那些想要迅速查找SQL语法和功能的人。

请注意，由于我知识截至日期是2022年1月，以上链接可能会发生变化。建议你在查找资源时查看最新的官方网站和社区论坛。

此外，你还可以在在线学习平台、书籍和其他教育资源中寻找Greenplum相关的课程和教材。

# 参考资料

[官方教程](https://greenplum.org/gpdb-sandbox-tutorials/)

[海量数据处理利器greenplum——初识](https://www.cnblogs.com/skyme/p/5779885.html)

* any list
{:toc}


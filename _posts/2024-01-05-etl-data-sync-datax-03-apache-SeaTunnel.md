---
layout: post
title: ETL-03-数据同步工具调研选型 SeaTunnel 与 DataX 、Sqoop、Flume、Flink CDC 对比
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[DataX集成可视化页面，选择数据源即可一键生成数据同步任务，支持RDBMS、Hive、HBase、ClickHouse、MongoDB等数据源，批量创建RDBMS数据同步任务，集成开源调度系统，支持分布式、增量同步数据、实时查看运行日志、监控执行器资源、KILL运行进程、数据源信息加密等。](https://github.com/WeiYe-Jing/datax-web)

# 部署

参考 [SeaTunnel及SeaTunnel Web部署指南(小白版)](https://avoid.overfit.cn/post/ac32f113f8b8490d980ed761122c4237)，记录真实的部署笔记。

# Apache SeaTunnel

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

# 2.1、高可用、健壮的容错机制

DataX 只支持单机，SeaTunnel 和 Flink CDC 支持集群，因此在高可用上 DataX 是不支持的，DataX由于单机设计很易受网络闪断、数据源不稳定等因素的影响造成数据不一致问题。

Apache SeaTunnel具有无中心化的高可用架构设计和完善的容错机制，SeaTunnel支持更细粒度的作业回滚机制，结合多阶段提交与CheckPoint机制，确保数据一致的同时避免大量回滚导致性能下降

Flink CDC采用主从模式的架构设计，容错粒度较粗，多表同步时，Flink 任何表出现问题都会导致整个作业失败停止，导致所有表同步延迟。

在高可用维度上，SeaTunnel 和 Flink CDC 优势很大

# 2.2、部署难度和运行模式

Apache SeaTunnel 和 DataX 部署都十分容易。
Flink CDC 的部署难度中等，但因为它依赖于 Hadoop 生态系统， 所以部署相对 SeaTunnel 会复杂一些。

# 2.3、支持的数据源丰富度

Apache SeaTunnel 支持 MySQL、PostgreSQL、Oracle、SQLServer、Hive、S3、RedShift、HBase、Clickhouse 等 100 多种数据源。

DataX 支持 MySQL、ODPS、PostgreSQL、Hive 等 20 多种数据源。

Flink CDC 支持 MySQL、PostgreSQL、MongoDB、SQLServer 等 10 多种数据源。

Apache SeaTunnel 支持关系型数据库、NOSQL 数据库、数据仓库、实时数仓、大数据、云数据源、 SAAS、消息队列、标准接口、文件、FTP等多种数据源同步,数据可以同步到任一指定的系型数据库、NOSQL 数据库、数据仓库、实时数仓、大数据、云数据源、 SAAS、标准接口、消息队列、文件等目标数据源中,满足政府、企事业单位对于数据流动的绝大多数需求。在这个维度的对比上，显然 SeaTunnel 支持的数据源丰富度是远远高于其他两个的。

# 2.4、内存资源占用

Apache SeaTunnel 占用较少的内存资源，SeaTunnel Zeta 引擎的 Dynamic Thread Sharing 技术可提高 CPU 利用率，不依赖 HDFS，Spark 等复杂组件，具备更好单机处理性能。

DataX 和 Flink CDC 会占用较多的内存资源， Flink CDC 每个作业只能同步一张表，多张表同步需要启动多个 Job 运行，造成巨大浪费资源。

# 2.5、数据库连接占用

Apache SeaTunnel 占用较少的数据库连接，支持多表或整库同步，解决 JDBC 连接过多的问题； 同时实现了 zero-copy 技术，无需序列化开销。

DataX 和 Flink CDC 占用较多的数据库连接，他们每个 Task 只能处理一张表，每张表至少需要一个JDBC 连接来读取或写入数据。当进行多表同步和整库同步时，需要大量的 JDBC 连接。

这通常是 DBA 们十分关注的，数据同步不能影响业务库正常运行，所以控制连接数占用是十分必要的。

# 2.6、自动建表

Apache SeaTunnel 支持自动建表。

DataX 和 Flink CDC 不支持自动建表。

# 2.7、整库同步

Apache SeaTunnel 设计有支持整库同步，方便用户使用，不需要为每张表都写一遍配置。

DataX 和 Flink CDC 不支持整库同步，每个表需要单独配置。

试想一下当你有数百张表，每张都单独配置一遍是不是还是太费劲了些！

# 2.8、断点续传

断点续传功能在数据同步过程是十分实用的功能，支持断点续传将让数据同步在手动暂停或出问题时能快速恢复继续，Apache SeaTunnel 和 Flink CDC 可以支持断点续传，但 DataX 不支持断点续传。

# 2.9、多引擎支持

Apache SeaTunnel 支持 SeaTunnel Zeta、Flink 和 Spark 三个引擎选其一作为运行时。

DataX 只能运行在 DataX 自己的引擎上。

Flink CDC 只能运行在 Flink 上。

在引擎支持丰富度上，SeaTunnel 具有更佳的优势。

# 2.10、数据转换算子

Apache SeaTunnel 支持 Copy、Filter、Replace、Split、SQL 和自定义 UDF 等算子。

DataX 支持补全、过滤等算子，还可以使用Groovy自定义算子。

Flink CDC 支持 Filter、Null、SQL 和自定义 UDF 等算子。

在数据转换上，这 3 个支持力度差不多。

# 2.11、性能

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


这样的测试结果得益于 SeaTunnel Zeta 引擎专为数据同步场景而进行的精心化设计：

- 不需要依赖三方组件，不依赖大数据平台无主（自选主）

- 完善的Write Ahead Log 机制，即使整个集群重启也可快速恢复之前正在运行的作业

- 高效的分布式快照算法，强力保障数据一致性

# 2.12、离线同步

Apache SeaTunnel、DataX 和 Flink CDC 都支持离线同步，但 SeaTunnel 支持的数据源远远多于 DataX 和 Flink CDC。

# 2.13、增量同步 & 实时同步

Apache SeaTunnel、DataX 和 Flink CDC 都支持增量同步。
Apache SeaTunnel 和 Flink CDC 支持实时同步。但 DataX 不支持实时同步。

# 2.14、CDC 同步

Apache SeaTunnel 和 Flink CDC 支持 CDC 同步。

DataX 不支持 CDC 同步。

Change Data Capture（CDC）是一种用于实时数据同步的重要技术，它能够捕获数据源中发生的变化，从而实现对数据的实时更新和同步。随着数据量和数据更新速度的增加，传统的批量同步方法已经无法满足实时性和即时性的需求。CDC 技术能够以事件驱动的方式捕获和传递数据变化，使得数据同步更加灵活、高效和准确。

在 CDC 同步领域，SeaTunnel 作为一款强大的数据同步工具，具备突出的优势。以下是 SeaTunnel 支持 CDC 同步的优势：

实时性：SeaTunnel 能够实时捕获源数据的变化，并将变化的数据实时传递到目标端。这意味着当源数据发生变化时，SeaTunnel 能够立即捕获到这些变化，并在最短的时间内将其同步到目标数据存储中。这种实时性使得 SeaTunnel 非常适用于需要快速反应和及时更新的应用场景。
精确性：SeaTunnel 通过 CDC 技术能够准确地捕获和同步数据的变化，避免了传统批量同步中可能存在的数据不一致性问题。它可以准确地追踪和记录源数据的每一次变化，确保目标端数据的精确性和一致性。这对于需要保持数据一致性和准确性的业务非常重要。
高效性：由于 CDC 同步只传递发生变化的数据，相比于全量数据同步，SeaTunnel 能够显著提高同步的效率和性能。SeaTunnel 只需要处理发生变化的数据，避免了不必要的数据传输和处理，节省了带宽和计算资源。这种高效性使得SeaTunnel能够应对大规模数据和高频率数据变化的同步需求。
可靠性：SeaTunnel 通过采用可靠的 CDC 机制，确保了数据同步的可靠性和容错性。它能够应对网络闪断、数据源异常等异常情况，并保证数据同步的连续性和稳定性。SeaTunnel 的容错机制能够确保即使在异常情况下，数据同步不会丢失或出现错误。
多数据源支持：SeaTunnel 支持多种主流数据源的 CDC 同步，包括 MySQL、PostgreSQL、Oracle、SQLServer等。这使得 SeaTunnel 能够适应不同类型的数据源，满足各种复杂的数据环境下的同步需求。SeaTunnel能够与不同数据源进行无缝集成，实现灵活、可扩展的CDC同步方案。
SeaTunnel 作为一款功能强大的数据同步工具，通过其实时性、精确性、高效性、可靠性和多数据源支持等突出的优势，能够满足不同业务场景下的 CDC 同步需求。无论是数据仓库同步、实时数据分析还是实时数据迁移，SeaTunnel 都能够提供可靠的 CDC 同步解决方案，助力用户实现数据的及时更新和同步。

# 2.15、批流一体

Apache SeaTunnel 和 Flink CDC 支持批流一体。

DataX 不支持批流一体。

SeaTunnel 和 Flink CDC 提供了统一的批流一体框架：SeaTunnel 提供了的一体化框架使得用户可以同时处理批量数据和实时数据而不需要为了批量同步配置一遍， 然后实时需要再配置一遍的过程。用户可以通过SeaTunnel 的灵活配置，将批处理和流处理的逻辑结合在一起，批和流同步变成只需要配置一下模式(mode)的差别，大大简化了开发和维护的工作，提高了数据处理的灵活性和效率。

# 2.16、精确一致性

Apache SeaTunnel 支持 MySQL、Kafka、Hive、HDFS、File 等连接器的精确一致性。

DataX 不支持精确一致性。

Flink CDC 支持 MySQL、PostgreSQL、Kakfa 等连接器的精确一致性。

SeaTunnel 的精确一致性实现得益于 SeaTunnel 的 Sink & Source API 的设计，对 MySQL 等数据库来说，SeaTunnel通过实现二阶段提交（Two-Phase Commit，2PC）来保证数据同步过程中的一致性。二阶段提交是一种分布式事务协议，用于在分布式系统中实现多个参与者的数据操作的一致性。

![一致性](https://pic2.zhimg.com/v2-9cb349d775158f3f7518f7f3948f9d8d_r.jpg)

通过以上的二阶段提交过程，SeaTunnel 能够确保在数据同步过程中的一致性。SeaTunnel 实现了分布式环境下的数据操作的原子性和一致性。在正常情况下，所有参与者都成功执行了数据操作并提交数据，而在异常情况下，参与者能够回滚之前的数据操作，确保数据的一致性。

这种机制使得 SeaTunnel 能够在分布式数据同步中提供可靠的数据一致性保证。其 Sink API 如下：

![sink api](https://pic2.zhimg.com/80/v2-9dd59fa035fa9ba8e56fe6a0fb535401_720w.webp)

# 2.17、可扩展性

Apache SeaTunnel、DataX 和 Flink CDC 都具有易扩展性，并支持插件机制。

三者均采用插件化设计，允许用户通过编写自定义插件来扩展其功能。插件可以添加新的数据源、数据转换算子、数据处理逻辑等。使得用户可以根据自己的需求定制和扩展功能。

除此之外，Apache SeaTunnel 已经与 DolphinScheduler 集成，并计划支持其他调度系统。目前 DataX 和 Flink CDC 均不支持与调度系统集成。

SeaTunnel 与其他工具和系统的集成非常方便。SeaTunnel 提供了与常见的调度系统、任务调度框架和数据生态系统的集成接口。通过这些接口，用户可以将 SeaTunnel 与现有的工具和系统进行无缝集成，实现更强大的数据处理和调度能力。

# 2.18、统计监控信息

Apache SeaTunnel 和 DataX 都具有统计信息。

Flink CDC 没有统计信息。

做过数据同步的伙伴都应该清楚不知道数据同步进度和速率是多么痛苦的一件事，幸运的是 SeaTunnel 推出了 SeaTunnel web 监控页面，提供了多维度的监控信息，让数据同步一目了然

# 2.19、可视化操作

Apache SeaTunnel 正在实现中，可以通过拖拉拽完成操作。

DataX 和 Flink CDC 没有 Web UI。

SeaTunnel 提供了如下的可视化操作界面，让用户开箱即用：

![view](https://pic1.zhimg.com/v2-37d0b58068983a9992cee7d1f5c979c0_r.jpg)

# 2.20、社区
Apache SeaTunnel 和 Flink CDC 社区非常活跃。

DataX 社区活跃度低。

SeaTunnel 的活跃社区和强大生态系统也是其成功的关键。作为一个开源项目，SeaTunnel 拥有庞大的开发者社区和用户社区，他们为 SeaTunnel 的发展和改进做出了巨大贡献。丰富的文档、案例和示例代码，以及积极的技术交流，使得用户能够更好地理解和使用 SeaTunnel，并及时解决遇到的问题。这种活跃的社区支持为用户提供了强大的后盾，保证了 SeaTunnel 的持续发展和改进。

特别的，我们 Flink CDC，SeaTunnel Zeta 引擎的优势对比如下：

![社区](https://pic2.zhimg.com/80/v2-73838f5ea044b1c90c2978518dfcccdd_720w.webp)

Flink 是非常优秀的流计算引擎，Zeta 是我们专为数据同步这个场景打造的，更适合于高性能数据同步这个场景！

# 总结

Apache SeaTunnel 作为一款强大的数据同步和转换工具，凭借其部署易用性、容错机制、数据源支持、性能优势、功能丰富性以及活跃的社区支持，成为了数据工程师们不可或缺的利器。SeaTunnel 能够满足各种规模和类型的数据处理需求，为用户提供高效、稳定和灵活的数据处理解决方案。

随着数据环境的不断演变和发展，SeaTunnel 将继续在数据同步和转换领域发挥领导作用，推动数据驱动的业务发展。

同时 Apache SeaTunnel 有商业版的 WhaleTunnel 产品，由商业公司提供产品企业级功能增强、服务、运维、Debug、定期漏洞扫描和修复，产品功能、稳定性、兼容性、速度、安全性都比开源版 SeaTunnel 有巨大的进步！

# SeaTunnel

是一个非常易用的超高性能分布式数据集成平台，在企业中由于开发时间或开发部门不通用往有多个异构的、运行在不同的软硬件平台上的信息系统同时运行；而一个有价值的数据集成是把不同来源、格式、特点性质的数据在逻辑上或物理上有机地集中，从而为企业提供全面的数据共享；SeaTunnel 支持海量数据的实时同步，它每天可以稳定高效地同步数百亿的数据，并已用于近100家公司的生产。最新版本为v2.1.3（作为下一代高性能、分布式、海量数据集成框架）

SeaTunnel原名WaterDrop（水滴），自2021年 10月 12日更名为 SeaTunnel。2021年 12月 9日，SeaTunnel正式通过 Apache软件基金会的投票决议，以全票通过的优秀表现正式成为 Apache 孵化器项目。2022 年 3 月 18 日社区正式发布了首个 Apache 版本v2.1.0。

本质上SeaTunnel 没有对 Spark 和 Flink的改造，而是在这两者的基础上做了一层包装，主要运用控制反转设计模式，这也是 SeaTunnel实现的基本思想。
SeaTunnel 的日常使用，就是编辑配置文件，编辑好的配置文件由 SeaTunnel 转换为具体的 Spark或 Flink 任务。

## 使用场景

海量数据同步
海量数据集成
海量数据的ETL
海量数据聚合
多源数据处理

## 特点

使用方便，配置灵活，近乎低代码开发
实时流媒体
离线多源数据分析
高性能、海量数据处理能力
模块化和插件机制，易于扩展
支持SQL对数据进行处理和聚合
支持Spark structured streaming
支持Spark 2.x

## 工作流程

SeaTunnel 有丰富的连接器且以 Spark 和 Flink 为引擎，所以可以很好地进行分布式的海量数据同步。一般来说使用SeaTunnel作为出仓入仓的工具，或者用于数据集成，主要流程如下：

Source[Data Source Input] -> Transform[Data Processing] -> Sink[Result Output]

# 背后的故事

2023 年 6 月 1 日，在儿童节这天，首个由国人主导的开源数据集成工具 Apache SeaTunnel 正式宣布从 Apache 软件基金会孵化器毕业成为顶级项目。

历经 18 个月的孵化，这个项目终于瓜熟蒂落。但也正如一个“呱呱坠地”的婴儿一样，Apache SeaTunnel 新的旅程，其实才刚刚开始。

从最早的 Waterdrop 到如今的 Apache SeaTunnel；

从实时数据处理系统到新一代一站式高性能、分布式、海量数据集成解决方案工具；

从 2018 年 1 月的第一行代码到现今的 24.5 万行代码；

从不到 10 人的贡献者到 200+ 位贡献者；

从苦寻首位用户到数千家企业上生产环境；

从寻找 Mentor 到顺利成为 Apache 顶级项目。

……

Apache SeaTunnel 社区核心人员将讲述这其中的跌宕起伏，并以时间轴为线索为你呈现它开源之路背后的故事。

## Apache SeaTunnel 诞生的背后

一直以来，我们在数据处理过程中面临着诸多挑战，其中之一就是需要支持在众多数据源之间的无缝集成和高速同步。当时调研了市面上已有的数据集成工具，发现大多支持的数据源都非常有限，往往支持了上游的数据源，却找不到下游数据源的连接器。而且在面临大规模数据量时往往性能太低，操作也复杂且缺乏灵活性。于是，我们萌生了做一个开源数据集成工具的想法！

在核心团队的一番打磨之后，Apache SeaTunnel 诞生了。它不仅支持上百种数据源（Database/Cloud/SaaS），同时支持海量数据的实时 CDC 和批量同步，可以稳定高效地同步万亿级数据。

![sync](https://img-blog.csdnimg.cn/ad1046b708934de38140878d3a61dca2.png)

除了基本的数据读取和写入功能，Apache SeaTunnel 区别于一般数据集成工具的功能有：

引擎与 Spark、Flink 解耦，拥有自己专为数据集成场景设计的引擎 Zeta，更快、更稳定、更省资源，意味着 Apache SeaTunnel 同时支持三种执行引擎——Spark、Flink，以及 Tunnel 自研的引擎 Zeta Engine；

- 具有 Web 界面更加直观易于操作；

- 支持连接 100+ 连接器，数据处理类型丰富，满足生产需要；

- 独特的 Checkpoint 功能设计，增强数据存储能力等。

- 这使得 Apache SeaTunnel 能够实现：

- 支持上百个数据源、传输速度更快、高准确率；

- 降低复杂性，基于 API 开发的连接器能兼容离线同步、实时同步、全量同步、增量同步、CDC 实时同步等多种场景；

- 提供可拖拽和类 SQL 语言界面，节省开发者更多时间 ，提供了作业可视化管理、调度、运行和监控能力。加速低代码和无代码工具的集成；

- 简单易维护，支持单机 & 集群部署，如果选择 Zeta 引擎部署，无需依赖 Spark、Flink 等大数据组件。

别看 SeaTunnel 现在具备这么多能力，回到两年前，当时还叫 Waterdrop 的 SeaTunnel 定位是让 Flink 和 Spark 使用起来更简单，所以整个架构设计都是基于 Spark 和 Flink 之上的，这就有了社区的第一次大讨论——连接器必须做到和具体引擎无关。

## 为什么要做到连接器和引擎无关？

首先，我们先看下连接器的作用。连接器负责将具体的上下游数据源打通，是数据集成的关键组成部分，Waterdrop 当时的架构基本是将 Spark 和 Flink 的连接器引入进来实现，使用的是 Spark 和 Flink 原生 API ，这样需要分别开发一套代码，早期批和流还是不同的 API，意味着同一个数据源为了实现批同步和流同步，需要开发两套代码。而且考虑到 Spark 和 Flink 大版本兼容性问题，代码的开发量和维护成本实在太高。

于是在 2022 年初，社区发起了重构连接器的讨论，目标是定义 SeaTunnel 自己的连接器 API 与具体的引擎解耦，不依赖具体引擎 API，真正实现批流一体，同一个数据源只需要一套代码就可以同时运行在 Spark 和 Flink 引擎上。

在讨论的初期有不少人反对，觉得 Flink 和 Spark 这些引擎很成熟，强依赖它们也没什么问题。还有些贡献者觉得我们应该放弃 Spark 全面依赖 Flink，在 Flink 的基础上把功能做好做完善。而且重构连接器 API 意味着，之前的 50 多个连接器的工作需要从 0 开始。

但经过与业界众多大神的交流和探讨后，社区不久就确定了不依赖引擎的连接器是必须要做的，“不能带着枷锁跳舞”，新的 API 将使连接器开发变得更简单，那些老的连接器也能很快在新的架构下支持起来。

事实证明，当这个目标确立后，社区花了一个月设计新的连接器 API，许多热心的贡献者参与进来，我们仅仅用了 4 个月的时间就实现了 100 多个连接器的支持，速度之快是不可想象的，而且新 API 真正实现了支持多引擎的能力。

实现了这个连接器与引擎无关之后，“干脆实现个专注于数据集成的新引擎吧，一劳永逸！”，SeaTunnel PMC Chair 高俊无意间说起的一句话，激起了社区贡献者一发不可收拾的高涨热情。

## 为什么要自研新引擎？

“什么，要自研引擎？” 听到这个要自研集成引擎的消息，社区炸裂了，立马又发起了是否必须要自己造一个引擎的空前热火的激烈争论。

主要争论点有几个：

从简单易用方面来看，Spark 和 Flink 都需要企业有大数据平台，这对于那些中小企业来说是一个很大的技术负担，大家需要一个更简单，使用成本更低的引擎来降低 SeaTunnel 的使用门槛。

从性能上来看，Spark/Flink 都是为计算而生的，它们解决的主要是 ETL 架构中 T 的问题，而数据集成主要是解决 ELT 中的 EL 过程，像 Join、Aggregation、开窗计算等这些特性不是数据集成关注的重点。数据集成引擎应该专注于集成，而不是计算，一切的代码优化和架构设计应该从提高作业的性能和稳定性出来，所以我们需要一个专门为集成场景设计的引擎，它应该有极佳的性能，极度稳定和占更少的资源。特别是当同步的表比较多时，能不能用较少的资源（比如 1 核 CPU）就完成这些表的实时同步？

从业务场景来看，Flink/Spark 本身并不能满足 CDC 多表同步、整库同步，CDC 过程中的 DDL 变更同步等这些特性，如果要支持这些特性就需要修改 Flink/Spark 的源码。我们无法确定这些特性能不能被 Spark/Flink 社区接受，因为这和他们主要解决的问题的方向（ELT 中的 T，专注于数仓中的计算处理）是不一致的。如果不被接受，那需要我们自己维护一个 Spark/Flink 的版本，这几乎是不可能的，从这个角度来看，SeaTunnel 自己做一个集成引擎也是必须。

当时社区的很多贡献者都参与了讨论，有的人觉得这是在重复造轮子。当然，最终社区还是达成了共识，决定开始一个专业集成引擎的设计和开发，我记得还有贡献者发出了 “这个轮子我造定了” 的宣言。

就这样，社区一咬牙一跺脚，把专注于解决同步领域问题的引擎 Zeta 给做了出来。在去年 10 月份，我们成功发布了 Zeta 的正式版本。当时名字叫 SeaTunnel Engine，大家觉得应该起一个耳熟能详而且符合这个引擎定位的名字。

于是社区就开始了头脑风暴，经过了约两周的讨论，我们在众多候选的名字里选择了使用 Zeta 这个名字，Zeta 是目前可观测到的宇宙中最快的行星，也有不少用户亲切的叫它为 “泽塔奥特曼”——宇宙中最强的奥特曼力量，一起守护光的信仰！我们希望 “泽塔奥特曼” 引擎让集成这件事变得更简单、更高效、更稳定、更省资源。

## 开启孵化：为什么要加入 Apache 软件基金会？

其实 Apache SeaTunnel 在从 Waterdrop 改名之前，就有加入全球最大的开源组织 —— Apache 软件基金会的计划。郭炜（SeaTunnel Mentor）在 SeaTunnel 加入 Apache 孵化器时就说过：

现在 Apache Sqoop 退役了，如何解决数据源之间数据打通的问题，没有一个特别优秀的开源项目来解决。而现在数据源的种类繁杂，如果只是一家企业解决自己使用的几个数据源之间的打通，根本无法解决更多的人使用更多数据源打通的问题，如果出现新的数据源还需要重新编写。而开源就是 “聚沙成塔、海纳百川” 的模式，可以让每个企业、每个人方便快捷地使用开源数据源连接器，同时如果有自己使用的数据源也可以贡献到开源项目当中。这样，一个连通各个数据源的开源项目就可以像滚雪球一样，越滚越大，让更多的用户更容易地连通各种各样的数据源，从而实现数据整合当中的 “飞轮效应”。

还有重要的一点在于，在此之前，Apache SeaTunnel 的一些核心贡献者和导师已经有开源项目 DolphinScheduler 的成功孵化经验，因此对于 SeaTunnel 进入孵化器大家都充满信心和期待。虽然进入 Apache 孵化器的进程并非一帆风顺，但是前期的经验让团队不至于无从下手，而是有条不紊地进行。

具体来说，SeaTunnel 前身 Waterdrop 的核心贡献者与 DolphinScheduler 社区在 2018 年就建立了密切的联系，DolphinScheduler 的伙伴们对 Waterdrop 也一直密切关注，Waterdrop 无论是从项目本身的代码质量，还是未来在数据集成领域的潜力来说，都是一个 “潜力股”。所以当 Waterdrop 跟我们一起商量是否可以一起接着做，没有经过很长时间的犹豫，我们就投入人力和精力到 Apache SeaTunnel 的研发中，并在不久后推动其进入 Apache 孵化器，我们以开放的心态，希望能够让 SeaTunnel 在开源的力量下，高效、准确、快速地进行跨数据源的同步、转化数据，让大家在多数据源的场景下，可以快速、简单地完成自己的目标。我们相信在「Apache Way」的指导下，Apache SeaTunnel 会获得更多的支持，加速项目的成长。

进入 Apache 基金会，寻找 Mentor 往往是最初且关键的一步。但与其他需要摸着石头过河的项目不同，Apache SeaTunnel 在孵化器讨论阶段就曾引起全球 Apache 孵化器导师的关注，“导师” 数量远超过普通孵化项目，以至于 Apache 孵化器负责人 Justin 邮件提醒“导师不能过多”。也有导师在全球 Apache 孵化器讨论邮件列表里表示遗憾，Apache 孵化器项目 “旱的旱死，涝的涝死”，有的项目要四处寻求导师才可以进入孵化器，有的项目则需要大家争抢导师。

很快，Apache SeaTunnel 在 Jean-Baptiste Onofré、Kevin Ratnasekera、Willem Ning Jiang（姜宁）、 Ted Liu（刘天栋）、 Lidong Dai（代立冬）、Guo William（郭炜）、Zhenxu Ke（柯振旭）7 位 Mentor 的帮助和指引下很快步入 Apache 孵化器的正轨。

姜宁是位开源 “老手”，最终成为了我们的 Champion。姜宁是国内最资深的 Apache Member 之一，2023 年再次当选 Apache 软件基金会董事，成为首位连任 Apache 基金会董事的华人。

代立冬是 Apache DolphinScheduler 项目的 Chair，在开源领域有丰富的经验。和 Apache SeaTunnel 也很有渊源，Apache SeaTunnel 很多功能也有他帮着组织设计，并一同建设 Apache SeaTunnel 社区。在参与 Apache SeaTunnel 建设的这一年多的时间里，他又陆续担任了多个 Apache 孵化项目的 Mentor，并在 2022 年被选举为 ASF Member。

Apache Member Jean Baptiste Onofré 和 Kevin Ratnasekera 也都是在 Apache DolphinScheduler 孵化期间熟识的人，他们都有着丰富的项目孵化经验。

之后，郭炜、Ted Liu、柯振旭也加入到 Mentor 行列中来，让 Apache SeaTunnel 的孵化之路更加顺利。

为了正式进入 Apache 孵化器，我们也参考成熟项目，对 Apache SeaTunnel 进行了整体上的项目代码规范；为与国际接轨，还对项目文档也进行了大量的英文翻译和校对工作，Apache 项目网站也全部进行了英文化。这些整理让 Apache SeaTunnel 项目更加规范和“国际范儿”。

此外，加入孵化器后，我们在项目功能上进行了比较大的改动，其中最重要的变化，就是上文提到的数据同步专用引擎 Zeta 的研发和发布。这个可以为用户提供高吞吐、低延时、强一致性的同步作业保障的引擎在 2.3.0 版本中正式发布，作为 Apache SeaTunnel 默认使用的引擎。它实现了与 Flink 和 Spark 引擎的解耦，让用户可以不依赖 Flink 和 Spark 独立运行，自治集群（无中心化）、数据缓存、可控制速度、共享连接池、断点续传、耕细粒度的容错设计、动态共享线程等独特功能，也让 Apache SeaTunnel Zeta 引擎前所未有地简单易用、更省资源、更稳定、更快速，可以做到全场景数据同步支持。

![探索](https://img-blog.csdnimg.cn/295f5cee807d443c83c93929bb90d9df.png)

## Apache Way 的探索

就像我们加入一家新公司需要了解这家公司的文化一样，参与 Apache 开源项目之前，我们也需要了解 ASF 的文化，即 The Apache Way。

深入进入开源就会发现，开源不只是开放源码这么简单的一件事，开源还关乎社区的管理、活跃、沟通交流、文化等，这就需要我们对 Apache Way 有更加深刻的理解。

鉴于此前的经验，Apache SeaTunnel 在进入 Apache 孵化器初期就对 Apache Way 的重要性有着深刻的理解，比如对于开源社区来说，Community Over Code 的理念要植根心中，为此也需要社区做出准备和努力，尽可能降低每个有兴趣参与项目人的门槛，甚至打造 0 门槛，比如制定社区激励计划、制作新手入门指南、精选 Good First Issue、重要 Feature 进展跟踪、通过定期的用户访谈获取反馈和优化建议、定期解答社区关于项目和社区的疑问等。

社区贡献不仅限于代码，非代码的贡献甚至有时会发挥比代码更加有价值的作用，比如利用自身影响力为项目引发关注做贡献，写作项目相关技术和非技术文章，参与社区组织的各种活动、在各种时机和场合为 Apache SeaTunnel“代言”，把它推荐给更多的用户等，都是参与社区的渠道。

同时，Community Over Code 还强调开放、交流、合作，Apache SeaTunnel 秉持着这些理念，坚持社区内与海内外社区保持沟通，相互学习交流，坚持与 Apache 社区建立沟通，所有讨论发生在邮件内、Issue 中，并通过社区自媒体渠道公布项目和社区的重大进展和计划，让社区保持公开透明。

从进入孵化期至今，Apache SeaTunnel 先后与多个海内外开源项目举办线上线下 Meetup 20 余场，包括已先于 Apache SeaTunnel 顺利从 ASF 孵化器毕业的 Apache Shenyu、Apache InLong、Apache Linkis，Apache Doris、IoTDB、StarRocks、TDengine 等成熟开源项目，以及在美国、印度等海外地区与 Trino、APISIX、Shopee、ALC Indore 联合举办的 Meetup 等。

社区之间的合作与交流推动开源技术的发展和应用，Apache SeaTunnel 与其他开源项目合作，共同解决了技术难题，有利于提升开源生态的整体水平，拓展了开源生态的边界。

经过时间的积累，社区已有了质的变化。从社区的邮件讨论、GitHub 的数据展示中，你会发现 Apache SeaTunnel 的社区开始真正变得活跃与多元化。从下表我们可以看到 Apache SeaTunnel 在 Apache 孵化器一年多的社区数据变化。

可以看到，社区与贡献者就像是“鱼”与“水”之间的共存，越来越多贡献者参与进社区，给社区这条“鱼”不断带来新鲜的生命之水，让 Apache SeaTunnel 社区蓬勃发展；水也因为社区的这条大鱼不断腾跃而流动起来，流得更快、更远。鱼水共生，才能生生不息。

![飞轮](https://img-blog.csdnimg.cn/fd65e52d62fd43bc97e2b972cf475264.png)

## 从孵化器毕业

经过为期 18 个月的孵化，社区根据 Apache 成熟度评估模型，从代码、许可和版权、版本发布、质量、社区、一致意见、独立性 7 个方面进行谨慎评估后，认为 Apache SeaTunnel 毕业的时机已经比较成熟，便开始筹备从 ASF 孵化器毕业事宜。

![毕业](https://img-blog.csdnimg.cn/caa2833048224f81a5ad8c9b8236c74a.png)

Apache 项目成熟度评估模型

比如，在代码成熟度上，社区经历过多个版本的升级与新增功能，提升了 Apache SeaTunnel 的性能和功能，进一步提高了数据源之间的高效同步与转换能力；在社区建设方面，如上所述，通过多场海内外线上线下的 Meetup 活动，Apache SeaTunnel 社区提供了交流和分享的平台，促进了开发者之间的交流和合作，扩大了开源项目的影响力。此外，Apache SeaTunnel 也加强了与上下游生态项目的集成，如 Flink、Spark、TiDB、OceanBase、IoTDB 等，促进了不同项目之间的协同发展，提升了整个开源生态的互操作性和整体性能。

在 Apache Member 的指导下，Apache SeaTunnel 4 月份在社区发起了毕业讨论，并根据 ASF 孵化器的指导意见改进不足，不断修正。

最终，Apache SeaTunnel 通过毕业投票，在 2023 年 5 月 17 日通过 ASF 董事会决议，如愿加入 TLP 行列！

## 未来之路：中国开源如何走向世界

Apache SeaTunnel 的目标是“连接万源，同步如飞”，力争成为世界第一流的数据集成工具，未来也将与更多的上下游生态项目进行集成。同时，也将继续承担起推广开源文化的使命，促进开发者之间的交流和合作，为开源社区的发展提供更多平台，激发更多人参与开源项目并做出贡献。

值此重要时刻，我们呼吁更多人参与到 Apache SeaTunnel 贡献者中来！

最后，对于 Apache SeaTunnel 来说，从 ASF 毕业的道路并不是一帆风顺，仅以我们在开源世界摸索的一点经验，对中国开源生态发展表达一些观点和建议：

加强开源文化建设
在中国，开源文化的传播和普及仍然需要进一步加强。需要鼓励更多的开发者和企业参与到开源项目中，促进知识共享和协作。同时，也需要提高对开源的认知和理解，推动开源在教育、企业和政府等领域的广泛应用。

提高开源项目的质量和影响力
中国的开源项目在数量上已经有了一定的积累，但在质量和影响力上仍有提升的空间。需要注重项目的技术创新和实用性，鼓励更多的高质量项目涌现。同时，要积极参与国际开源社区，与国际项目进行合作和交流，提高项目的知名度和影响力。

加强开源社区建设和治理
开源社区是开源项目成功的关键所在。需要建立健全的社区治理机制，促进社区成员的参与和贡献。同时，要提供良好的沟通和协作平台，鼓励开发者之间的交流和合作。此外，还需要加强对社区成员的培训和支持，提高其技术和管理能力。

加强开源与产业的结合
开源技术在推动产业创新和发展方面具有重要作用。需要加强开源技术与各个行业的结合，推动开源技术在企业和公共服务领域的应用。同时，要积极培育开源技术生态圈，促进开源项目和产业链的协同发展。

总而言之，中国开源已经取得了一些成绩，许多国内开源项目在国际上也获得了广泛的认可和使用，但还有很多工作需要继续努力。通过加强开源文化建设、提高项目质量和影响力、加强社区建设和治理以及加强开源与产业的结合，可以进一步推动中国开源生态的发展，促进技术创新和产业升级。

作者简介：

郭炜，Apache 基金会成员，Apache DolphinScheduler PMC Member，Apache SeaTunnel Mentor。

代立冬，白鲸开源联合创始人，Apache DolphinScheduler PMC Chair & Apache SeaTunnel PMC Member& Mentor，Apache 孵化器导师，Apache Local Community Beijing 成员。

# 参考资料

https://zhuanlan.zhihu.com/p/666726655?utm_id=0

https://blog.csdn.net/JHIII/article/details/126556446

https://backend.devrank.cn/traffic-information/7245979389433841720

* any list
{:toc}
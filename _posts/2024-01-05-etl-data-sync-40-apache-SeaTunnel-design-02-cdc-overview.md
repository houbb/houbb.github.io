---
layout: post
title: ETL-40-apache SeaTunnel cdc 设计
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 引言

在快速发展的数据驱动时代，数据的实时、准确同步成为了企业信息系统不可或缺的一部分。随着技术的进步，特别是在分布式计算和大数据技术的背景下，构建一个高效且可靠的数据同步管道成为了挑战。
Apache SeaTunnel作为一个先进的数据集成开发平台，提供了构建高效CDC数据同步管道的可能性。本文将深入探讨利用Apache SeaTunnel构建CDC数据同步管道的过程，揭示其背后的关键技术和实践策略，旨在为面临数据同步挑战的专业人士提供实用指导。

大家下午好，今天分享的主题是基于Apache SeaTunnel构建CDC数据同步管道。我之前主要从事监控APM的计算平台工作，后来转向数据集成开发平台。

目前，我正在基于Apache SeaTunnel开发CDC的数据同步管道，长期活跃于开源社区。我是Apache SeaTunnel的PMC成员和Skywalking的committer。

# Apache SeaTunnel 简介

Apache SeaTunnel是一个数据集成开发平台，其发展经历了几个重要阶段：

![seatunnel](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_36D009FA72DC4937A5FEF6AE5EF2E72D)

1. ETL时代（90年代）：面向结构化数据库的数据同步，用于构建数据仓库。

2. MPP和分布式技术流行：使用技术如Hive进行数据仓库的构建。此阶段主要使用mapreduce程序进行数据搬运和转换。

3. 数据湖技术流行：重视数据集成，强调先同步数据至数据湖仓储，再进行业务面向的转换和设计。

![ELT](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_490277EF34BE445BB293ED617F7CB3FA)

# 技术定位与挑战

![数据集成](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_B6D947A6BE484F4E90F9A9DCED141506)

Apache SeaTunnel在ELT环节中，主要解决简单的转换问题，并快速搬运数据。

面临的挑战包括：

- 处理多样化的数据源和存储差异。

- 尽量减少对数据源的影响。

- 适应不同的数据集成场景，如离线和实时CDC同步。

- 保证数据集成的监控和量化指标。

## 重要特性

简单易用：No code，通过配置文件提交作业。

运行监控：提供详细的读写监控。

丰富的生态：插件式架构，提供统一的读写API。

# Apache SeaTunnel的发展历程

Apache SeaTunnel的前身是Whatdorp。它于2021年加入Apache孵化器，并在2022年发布了第一个版本。

2022年10月，进行了重大重构，引入统一API。

![SeaTunnel 的发展历程](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_CFE5111FAA624156BB5B2D2FD7B11B26)

2022年11月，开发了专门用于数据同步的引擎。到2022年底，连接器的读写功能已经支持超过100种数据源。

到2023年，主要集中于CDC和整库同步。

![CDC和整库同步](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_3D49B1086C3A4396B96463A433C0A94E)

# CDC（Change Data Capture）简介

![cdc](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_B2DADF3EF9A14563A4A8D65E4B859010)

CDC，即变更数据捕获，是一种捕获数据库变更事件（如插入、更新、删除）的技术。

在业务数据库中，数据不断变更，CDC的作用是捕获这些事件，并同步到数仓、数据湖或其他平台，确保目标存储与原始数据库保持一致。

![cdc](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_9CFAD9401BD04D55A9F43B2BDA6C178A)

# CDC的应用场景

数据复制：如备库建设或读写分离。

数据分析：在大数据平台进行基于BI的数据分析。

检索业务：例如，将商品库或文档库同步到ES等检索平台。

操作审计：记录系统变更，用于金融审计等。

## 常见的CDC方案的痛点

单表作业限制：大多数开源方案中，一个作业通常只能处理一个表。

读取与写入分离：一些平台专注于数据捕获，而另一些只负责数据写入。

多数据库支持问题：不同的数据库可能需要不同的同步平台，增加了维护难度。

大规模表处理困难：处理大型表时可能遇到性能瓶颈。

DDL变更同步：实时同步数据库结构（DDL）变更是一个复杂且重要的需求。

# Apache SeaTunnel在CDC中的应用

![cdc](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_6940481AE8FA47BBB18E0F582D7232F3)

Apache SeaTunnel作为一个连接器，可以实现抽象的Source API和Sink API，即读写API，以实现数据的同步。

它的设计目标是：

- 支持多种数据库：如MySQL、Oracle等。

- 零编码：自动建表和动态增删表，无需编写代码。

- 高效读取：先进行数据快照，再跟踪binlog变化。

- 确保一致性：实现exactly-once语义，即使在中断恢复情况下也不会出现数据重复。

# Apache SeaTunnel CDC的设计实践重点

![CDC的设计实践重点](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_25776827F51B415FBAD8082FFDC263B9)

在于处理数据同步的两个阶段：快照读取和增量跟踪。

![快照读取和增量跟踪](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_91DF887D0DED44CA922496A492F3DD46)

# 快照读取阶段

## 基本流程

Chunk划分（Splitting）：为了高效同步大量历史数据，表被划分为多个chunk（或split），每个chunk处理一部分数据。

并行处理：每个表分成多个split，这些split通过路由算法分配给不同的reader进行并行读取。

事件反馈机制：每个reader在完成split读取后会向split分发器报告进度（watermark）。

![基本流程](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_6B192ECD55C848959EAA3A36C7A1B21A)

![并行读取](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_55A92360F0A44289A346BF5356677EA1)

## Split 详解

组成：Split包括唯一ID、指向的表ID、以及划分细节（如数据范围）。

划分方法：Split可基于不同类型的列（如数字或时间）进行范围划分。

处理过程：划分后的split被分发给reader，每个split的读取完成后会报告数据水位线。

![Split 详解](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_2FB3F0E4071E474593BB3CBB8EA69604)

# 增量跟踪阶段

## 单线程流读取

![单线程流读取](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_B11C5B0D79CC43248028D299A21C694C)

流读取特性：与快照阶段的并行读取不同，增量跟踪通常为单线程操作。

减少业务压力：避免重复拉取binlog，减轻对业务数据库的压力。

![增量读](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_4652263F8B36476CB3478A1320F9761F)

![确切一次](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_E11AA6213E5F49C3BF6FA0CCDC51D8CD)

![内存合并](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_E2F45084113E40C989C3B351D986D3AF)

## Split管理

- 无终止的Split：增量阶段的Split没有结束点，意味着流读取是持续的。

- 水位线管理：增量Split包含所有快照Split的最小水位线，从最小位置开始读取。

- 资源优化：一个reader占用一个连接，保持高效且资源优化的数据跟踪。

Apache SeaTunnel CDC的设计允许有效地同步历史数据（快照读取）和实时变更（增量跟踪）。

通过Split管理和资源优化策略，确保数据同步既高效又对原始数据库影响最小。

# Apache SeaTunnel CDC的Exactly-Once实现

![Apache SeaTunnel CDC的Exactly-Once实现](https://juejin.cn/post/7313979404992610342?searchId=202401291018510FB1011922876A9CD7AE)

Apache SeaTunnel CDC实现Exactly-Once语义的核心在于处理数据同步中的不一致性和系统故障。

![1](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_6214F0D62C5A46A4A2C31FA371E2574F)

## Exactly-Once的实现机制

### 快照读取的水位线管理

低水位与高水位：在快照读取时，首先记录低水位线，读取结束后记录高水位线。这两个水位线之间的差异表明数据库在此期间发生了变化。

内存表合并：低水位和高水位之间的变更会被合并到内存表中，确保未遗漏任何变更。


![s1](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_0811349BC7F445FEA969B269AE667095)

![s2](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_A8721C0B758D4018B9E1D297558DE54F)

### Split与Split之间的间隙处理

处理数据间隙：处理Split间的数据间隙，确保没有遗漏变更。

反向过滤与回捞：快照阶段的每个数据点都会检查以确保没有被之前的Split覆盖，避免数据重复。

阶段性校对：分为两个阶段（Stage 1和Stage 2），分别处理Split间的间隙和表间的间隙，确保所有变更都被捕获。

## 断点续传与分布式快照

### 分布式快照机制

![分布式快照机制](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_D588B073F30242B79C9A91D3B2AC8B0A)

- 不同引擎适配：分布式快照API适配不同的执行引擎，确保状态一致性。

- 检查点保存：定期发起检查点保存操作，所有组件上传自己的状态，保存完整的检查点状态。

- 恢复选择：在恢复时，可以选择任何一个检查点版本进行恢复。

![断点续传](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_BFCC1AACCACB40169F6427AA190424B5)

### 分布式状态对齐

进程间状态同步：处理多个进程内的不同内存状态，确保它们在一个时间点达到一致状态。

信号传播与保存：从一个进程发起分布式快照信号，其余进程根据信号保存自己的状态并传递信号，直至所有节点状态对齐。

实际应用：在CDC任务中，枚举器节点、读取节点、写入节点均参与这一过程，保证整个数据同步过程的状态一致性。

# DDL同步的深入探讨

![ddl](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_5E71F3790CD144BBBD800A538DF40F95)

在Apache SeaTunnel CDC中，DDL同步是一个关键的挑战。由于数据库结构可能在数据流处理过程中发生变化，因此必须谨慎处理这些变更。

## DDL解析与抽象化

DDL事件解析：DDL事件首先被解析并转换为结构化的抽象形式，这样做的目的是将DDL处理过程与特定数据库的语法细节解耦。

结构化事件处理：例如，添加列的操作被转换为一个通用的结构化事件，不再依赖于具体数据库的语法。

![DDL解析与抽象化](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_E2DAC213D5B747D0A124DE44BECA33A9)

## 数据流与结构流的分离

信号插入：在DDL操作前后，系统会插入特定的信号以分离结构流和数据流。这样做允许在DDL操作期间暂停数据处理，避免在结构变更期间发生数据混乱。

## 前置与后置信号处理

前置信号：在DDL操作前，清空内存中的数据状态，并暂停数据处理，以确保结构变更前的数据完整性。

后置信号：DDL操作完成后，系统恢复数据处理，并继续之后的数据同步。

![前置与后置信号处理](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_8693ED22B45F415684E6ACF68C726421)

![后置信号处理](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_5B062E76E3D1460BB6F421340FFB03A0)

![变更完成](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_93603B691DE740FCBEA008371CF4B91E)

# 数据传输的细节优化

![数据传输的细节优化](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_6E5547F4F40449AFAE91143EF01D4CF0)

在数据传输方面，Apache SeaTunnel CDC通过一系列优化，确保数据同步的效率和一致性。

## 数据操作的类型化处理

插入（Insert）：处理新增数据，仅涉及操作后的状态。

更新（Update）：涉及操作前后的状态变化，需要精确处理以确保数据一致性。

删除（Delete）：只关注操作前的状态，因为数据在操作后不再存在。

## 高效的数据流管理

为了提高效率，CDC在数据流管理方面做了大量优化：

表级数据拆分：保证同一表内的数据处理的有序性。

键级数据排序：同一键的数据操作按顺序处理，保证数据状态的正确性。

并行数据写入：同一表内的数据可以并行写入，提高了数据处理的速度。

## 更新优化

![更新优化](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_AF0EB20E55794E1C89C06A694FB34B07)

对于不支持更新操作的目标存储，CDC采取了一种优化策略：将更新操作转换为先删除后插入操作，从而绕过存储的限制。

## 共享挖掘与多目标写入

![共享挖掘与多目标写入](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_BA9886728A6C46E5AC7BA87378E3162E)

为了减少对原始数据源的负担，CDC采用共享挖掘机制。这意味着数据被一次读取，然后共享给多个写入插件，允许数据被写入到多个目标存储。这种方法有效地整合了原本分散的数据读写流程，提升了整体效率。

# 自动建表

## 目的

自动转换：将原库的表结构自动转换到目标库，适用于不熟悉业务库表结构或表数量庞大的场景。

## 实现过程

![create table](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_94B6358CB124498C92815985B7DA7D31)

表结构推送：将配置的所有表转换为通用的数据类型和表结构。

与写入插件的交互：启动时，插件接收表结构，检查并在目标库创建或更新表。

类型提升：处理异构数据库中的类型不匹配问题，如将小类型提升到大类型。

# Apache SeaTunnel 2.3.3 版本发布，CDC 支持 Schema Evolution！

## 支持 Schema evolution

关于 CDC 方面的重要更新，是在架构层面支持了 Schema evolution（DDL 变更同步），这是从架构层面对 DDL 变更事件进行了抽象，包括 Source 和 Sink 中相关接口的添加。

另外，我们在 Zeta 引擎中添加了 DDL 变更事件与checkpoint 相关的处理流程。至此，在架构层面，SeaTunnel 已经满足了支持 DDL 变更同步的所有前提条件，后续就是不同的连接器实现相应的接口，进行 DDL 变更同步的适配工作。

SeaTunnel CDC 相关设计，可参考《解读重要功能特性：新手入门 Apache SeaTunnel CDC》。

## Split 拆分优化

在本次更新之前，CDC Source 读取时只能基于数值类型的主键列进行 Split 的拆分，而在实际使用场景中，很多表没有主键，或者主键的数据类型是字符串类型，这会导致无法进行 CDC 同步。

本次更新添加了两个重大 feature：

1. 一个是支持唯一索引作为 split 拆分字段；

2. 另一个是支持字符串类型的字段进行split拆分。

**这意味着只要 source 表中拥有主键列或者唯一索引列，并且列的类型是数值或者字符串，就能自动进行 split 的拆分，从而快速完成 CDC 的读取**。

另外，新版本对于基于字符串类型列进行 split 拆分的算法进行了优化，经过测试，一张拥有 4 亿行，60 个字段的 MySQL 数据表，针对字符串类型主键的 split 拆分由原来的 3 个小时缩短到 20 分钟。

在 JDBC Source 的 partition 拆分中，我们添加了同样的算法，从而让 JDBC Source 针对字符串类型的 split 拆分也得到了优化。

## 基础能力更新

在做 CDC 多表同步的场景下，之前目标表无法自动创建，需要用户手工在目标端创建好表之后才能进行同步。

在本次更新中，添加了 JDBC Sink 自动建表的功能，JDBC Sink 将根据上游传递过来的 catalogtable 自动生成创建表的DDL 语句，并在目标数据库进行建表。

注意，很多数据库都可以使用 JDBC Sink 连接器，但并不是所有数据库都已经实现了自动建表，本次更新目标端支持自动建表的数据库有 MySQL, Oracle, Postgres, SQLServer。

另外，使用自动建表对 Source Connector 也有要求，Source 连接器必须实现了 Catalog，本次更新中只有 CDC Source 实现了 Catalog，所以自动建表功能只有在 CDC Source 同步到 MySQL/Oracle/Postgres/SQLServer，并且是在多表同步模式下才能生效。

# 基于Apache SeaTunnel 的数据精确一致性技术实践

## 引言

在分布式系统中，保障数据一致性是至关重要的任务之一。数据一致性是指分布式系统中的各个节点在进行数据更新时能够保持数据的准确性和完整性。

然而，由于网络延迟、节点故障等原因，分布式系统中的数据一致性问题变得复杂而具有挑战性。

为了解决这一问题，二阶段提交（Two-Phase Commit）协议被广泛应用于保障分布式系统的数据一致性。

本文将介绍二阶段提交协议的工作原理，并探讨其在分布式系统中的关键策略，亦将介绍在下一代数据集成工具 - Apache SeaTunnel 中实现二阶段提交的原理，探讨其在保障数据一致性方面的实践。

## 分布式一致性

分布式场景下，多个服务同时服务一个流程，比如电商下单场景，需要支付服务进行支付、库存服务扣减库存、物流服务更新物流信息等。如果某一个服务执行失败，或者网络不通引起的请求丢失，那么整个系统可能出现数据不一致。

上述场景就是分布式数据一致性的问题，其根本原因在于数据的分布式操作，引起本地事务无法保障数据的原子性。

分布式一致性问题的解决思路有两种，一种是分布式事务，一种是尽量通过业务流程避免分布式事务。由于分布式事务解决方案具有通用性，本文着重介绍分布式事务实现

## 分布式事务分类

分布式事务实现方案从类型上分为刚性事务和柔性事务。

刚性事务：保持强一致性，原生支持回滚/隔离性，低并发，适合短事务（XA协议（2PC、JTA、JTS）、3PC）；

柔性事务：有业务改造，最终一致性，实现补偿接口，实现资源锁定接口，高并发，适合长事务(TCC、Saga(状态机模式，Aop模式)、本地事务消息、消息事务)；本文主要介绍 XA

## XA 两阶段提交协议

XA 协议即是通常所说的两阶段提交协议（Two-phase commit protocol），简称 2PC，过程涉及到协调者和参与者。

它是一种强一致性设计，引入一个协调者的角色来协调管理各参与者的提交和回滚，二阶段分别指的是准备（投票）和提交两个阶段。2PC 的算法思路可以概括为：参与者将操作成败通知协调者，再由协调者根据所有参与者的反馈结果决定各参与者是否要提交操作还是回滚操作。

第一阶段（准备阶段）

协调者节点（Coordinator）向所有参与者节点（Participants）发送 Prepare 提交请求，并等待它们的回复。
在接到 Prepare 请求之后，每一个参与者节点会各自执行与事务有关的数据更新，并将操作结果保存在本地的日志中。如果参与者执行成功，暂不提交事务，而是向协调节点返回 “完成” 消息。
当协调者接到了所有参与者的返回消息，整个分布式事务将会进入第二阶段。

![第一阶段（准备阶段）](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_6AC67B8FC97A48EA84476E5FBED58C2D)

假如在第一阶段有一个参与者返回失败，那么协调者就会向所有参与者发送回滚事务的请求，即分布式事务执行失败

第二阶段（提交阶段）

协调者节点根据参与者节点的回复情况，决定是否提交事务。
如果协调节点收到的都是同意提交，那么它将向所有事务参与者发出提交 Commit 请求，并等待参与者节点的确认。
参与者节点接到 Commit 请求后，将操作结果更新到数据库，并向协调者节点发送确认消息。
协调者节点收到所有参与者节点的确认消息后，最终决定提交或回滚事务，并将决策通知给所有参与者节点。

![确切一次](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_68A0E27C90DD42598906A94B5534D3CF)

## SeaTunnel 中的数据精确一致性实践

SeaTunnel 中的精确一次 Exactly-once 主要是以下 2 种方式来实现：

1) 幂等写入

2）两阶段提交

在 Sink 端为数据库时，通常采用的方式二阶段提交，以下为其流程图

![两阶段提交](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_D7F7F44E6BE6428DA5E78B717E58FDCE)

其中涉及几个核心类：

![核心类](http://openwrite-whaleops.oss-cn-zhangjiakou.aliyuncs.com/31504_42D6AA08AD764927A40A9C8FEBF03512)

## 总结

在 SeaTunnel 中，实现数据的精确一致性是一个重要的目标。SeaTunnel 采用了多种实践方法来保障数据的精确一致性。

SeaTunnel 支持二阶段提交，可以根据实际场景灵活定义和执行多个阶段的操作。这种灵活性使得 SeaTunnel 适用于更广泛的应用场景，并能够满足不同的一致性需求。

SeaTunnel 还具备强大的异常恢复和容错机制。它建立了心跳机制，定期检测节点的可用性。当节点故障或网络中断发生时，SeaTunnel 能够自动检测并进行相应的故障转移和恢复操作，以确保系统的稳定性
和数据的一致性。

最后，SeaTunnel 提供了可定制的策略和扩展性。用户可以根据具体需求进行定制化设置，选择不同的数据一致性级别、超时机制、冲突解决策略等。此外，SeaTunnel 还支持水平扩展，能够轻松应对大规模分布式系统的需求。

综上所述，SeaTunnel 在实现数据的精确一致性方面采取了多种创新实践。通过二阶段提交、异常恢复和容错机制以及可定制的策略和扩展性，SeaTunnel 能够提供高性能、高可靠性的数据一致性保障。这些实践为分布式系统中的数据一致性问题提供了创新的解决方式!

# 参考资料

https://juejin.cn/post/7324143986759172122?searchId=202401290950565554DD2BB57218A05C4D


https://juejin.cn/post/7296440993214087194?searchId=202401290950565554DD2BB57218A05C4D

https://juejin.cn/post/7272199653340069928?searchId=202401291018510FB1011922876A9CD7AE

https://juejin.cn/post/7313979404992610342?searchId=202401291018510FB1011922876A9CD7AE



* any list
{:toc}
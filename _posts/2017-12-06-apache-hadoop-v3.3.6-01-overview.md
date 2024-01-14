---
layout: post
title:  Apache Hadoop v3.3.6-01-overview
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# Apache Hadoop 3.3.6

Apache Hadoop 3.3.6 是 Hadoop 3.3.x 发布分支的更新。

变更概览

鼓励用户阅读完整的发布说明。本页面提供主要变更的概览。

SBOM 构件

从这个版本开始，Hadoop 使用 CycloneDX Maven 插件发布软件清单 (SBOM)。有关 SBOM 的更多信息，请参阅 SBOM。

HDFS RBF：基于 RDBMS 的令牌存储支持

HDFS 路由器 - 基于路由器的联邦现在支持将委托令牌存储在 MySQL 上，改进了原始基于 Zookeeper 的实现的令牌操作吞吐量，详见 HADOOP-18535。

新文件系统 API

HADOOP-18671 将一些 HDFS 特定的 API 移动到 Hadoop Common，使依赖于 HDFS 语义的某些应用程序能够在其他兼容 Hadoop 的文件系统上运行。

特别是，recoverLease() 和 isFileClosed() 通过 LeaseRecoverable 接口公开。而 setSafeMode() 通过 SafeMode 接口公开。

Azure ABFS：关键流预取修复

ABFS 有一个关键的错误修复 HADOOP-18546。ABFS。禁用在 ABFS 流关闭() 中清除进行中读取列表。

在 Hadoop 发布 3.3.2+ 中使用 abfs 连接器的所有用户必须升级或通过将 fs.azure.readaheadqueue.depth 设置为 0 来禁用预取。

参考 HADOOP-18521 ABFS ReadBufferManager 跨并发 HTTP 请求共享缓冲区的根本原因分析，受影响的详细信息以及缓解措施。

矢量 IO API
HADOOP-18103。Hadoop 中的高性能矢量读 API

PositionedReadable 接口现在添加了支持矢量 IO（也称为散列 / 聚集 IO）的操作：

```java
void readVectored(List<? extends FileRange> ranges, IntFunction<ByteBuffer> allocate)
```

所有请求的范围将被检索到提供的字节缓冲区中 - 可能是异步的，可能是并行的，结果可能无序。

默认实现使用一系列的 readFully() 调用，因此提供了等效的性能。
本地文件系统使用 Java 本机 IO 调用进行更高性能的读取。
S3A 文件系统使用不同线程中的并行 HTTP GET 请求。
通过 file:// 和 s3a:// 的增强 Apache ORC 和 Apache Parquet 客户端的基准测试显示了查询性能的显着提高。

进一步阅读：* FsDataInputStream。* Hadoop 矢量 IO：您的数据刚刚变得更快！Apachecon 2022 演讲。

Mapreduce：Azure ABFS 和 Google GCS 的清单提交器
新的中间清单提交器使用清单文件来提交成功任务尝试的工作，而不是重命名目录。作业提交只涉及读取所有清单，创建目标目录（并行化）并再次并行重命名文件。

在 Azure 存储和 Google GCS 上，这既快速又正确，应该在这里使用，而不是经典的 v1/v2 文件输出提交器。

在 HDFS 上使用时也是安全的，在那里它应该比 v1 提交器更快。然而，在云存储上进行了优化，其中列出和重命名操作明显较慢；收益可能较小。

有关详细信息，请参阅清单提交器文档。

HDFS：动态数据节点重新配置
HDFS-16400、HDFS-16399、HDFS-16396、HDFS-16397、HDFS-16413、HDFS-16457。

可以在无需重新启动数据节点的情况下更改许多数据节点配置选项。这使得可以在不需要集群范围的数据节点重新启动的情况下调整部署配置。

请参阅 DataNode.java 以获取可动态重新配置的属性列表。

传递性 CVE 修复
许多依赖项已经升级以解决最近的 CVE。其中许多 CVE 实际上并没有通过 Hadoop 利用，因此这项工作主要是尽职调查。但是，具有类路径上所有库的应用程序可能是脆弱的，并且升级还应该减少安全扫描器报告的虚假阳性数量。

我们无法升级每个依赖项到最新版本。其中一些更改在根本上不兼容。如果您对特定库的状态有疑虑，请查阅 Apache JIRA 问题跟踪器，查看是否已经提交了有关所涉及库的问题，是否已经进行了讨论，并且是否已经在处理中有修复。请在没有首先搜索任何现有问题的情况下不要提交有关依赖项 X.Y.Z 具有 CVE 的新 JIRA。

作为开源项目，对于这个领域的贡献总是受欢迎的，特别是在测试活动分支、测试这些分支下游的应用程序以及更新的依赖项是否触发回归方面。

安全咨询
Hadoop HDFS 是一个允许远程调用者读取和写入数据的分布式文件系统。

Hadoop YARN 是一个分布式作业提交/执行引擎，允许远程调用者将任意工作提交到集群中。

除非使用 Kerberos 进行呼叫方身份验证，否则对服务器具有网络访问权的任何人都可以无限制地访问数据并

在系统中运行任何代码。

在生产中，通常有三种部署模式可以在小心的情况下保持数据和计算资源的私密性。1. 物理集群：配置 Hadoop 安全性，通常与企业的 Kerberos/Active Directory 系统绑定。好的。1. 云：瞬态或持久的单用户/租户集群，具有私有 VLAN 和安全性。好的。考虑使用 Apache Knox 来管理对集群的远程访问。1. 云：瞬态的单用户/租户集群，具有私有 VLAN，没有任何安全性。需要小心的网络配置，因为这是保护集群的唯一手段。考虑使用 Apache Knox 来管理对集群的远程访问。

如果在云中部署 Hadoop 集群时没有启用安全性，并且没有配置 VLAN 以限制对受信任用户的访问，那么实际上是与任何具有网络访问权限的人共享数据和计算资源。

如果以这种方式在云中部署不安全的集群，那么端口扫描程序将不可避免地发现它并提交加密挖矿作业。如果发生这种情况，请不要将其报告为 CVE 或安全问题：这是完全可预测的。如果要保持独占您的集群，请确保对集群进行安全配置。

最后，如果您正在使用由他人部署/管理的 Hadoop 作为服务，请确定其产品提供了什么安全性，并确保它满足您的要求。

入门
Hadoop 文档包含了您开始使用 Hadoop 所需的信息。从单节点设置开始，该设置向您展示如何设置单节点 Hadoop 安装。然后转到集群设置，以了解如何设置多节点 Hadoop 安装。

在将 Hadoop 部署到生产环境之前，请阅读安全模式下的 Hadoop，并按照其中的说明来保护您的集群。

© 2008-2023 Apache Software Foundation - 隐私政策。

# 参考资料

https://hadoop.apache.org/docs/stable/


* any list
{:toc}
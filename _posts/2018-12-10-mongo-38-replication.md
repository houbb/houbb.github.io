---
layout: post
title: Mongo Replication-38 Mongo Replication 主从复制
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, TODO, sh]
published: true
---

# Replication

MongoDB中的副本集是一组维护相同数据集的mongod进程。 

副本集提供冗余和高可用性，是所有生产部署的基础。 

本节介绍MongoDB中的复制以及副本集的组件和体系结构。

该部分还提供了与副本集相关的常见任务的教程。

# 冗余和数据可用性

复制提供冗余并提高数据可用性。 

通过在不同数据库服务器上提供多个数据副本，复制可提供一定程度的容错能力，以防止丢失单个数据库服务器。

在某些情况下，复制可以提供增加的读取容量，因为客户端可以将读取操作发送到不同的服 

在不同数据中心维护数据副本可以增加分布式应用程序的数据位置和可用性。

您还可以为专用目的维护其他副本，例如灾难恢复，报告或备份。

ps: 所有的高可用都是用冗余的方式。所有的数据冗余都存在同步的时间。

# MongoDB中的复制

副本集是一组维护相同数据集的mongod实例。 

副本集包含多个数据承载节点和可选的一个仲裁节点。 

在承载数据的节点中，一个且仅一个成员被视为主节点，而其他节点被视为次要节点。

主节点接收所有写操作。 

副本集只能有一个主要能够确认具有{w：“most”}写入关注的写入; 虽然在某些情况下，另一个mongod实例可能会暂时认为自己也是主要的。 

主要记录其操作日志中的数据集的所有更改，即oplog。 

有关主节点操作的详细信息，请参阅副本集主节点。

![replica-set-read-write-operations-primary.bakedsvg.svg](https://docs.mongodb.com/manual/_images/replica-set-read-write-operations-primary.bakedsvg.svg)

辅助节点复制主节点的oplog并将操作应用于其数据集，以使辅助节点的数据集反映主节点的数据集。 

如果主要人员不在，则符合条件的中学将举行选举以选举新的主要人员。 

有关辅助成员的详细信息，请参阅副本集辅助成员。

![replica-set-primary-with-two-secondaries.bakedsvg.svg](https://docs.mongodb.com/manual/_images/replica-set-primary-with-two-secondaries.bakedsvg.svg)

您可以将额外的mongod实例添加到副本集作为仲裁器。 

仲裁者不维护数据集。 

仲裁者的目的是通过响应其他副本集成员的心跳和选举请求来维护副本集中的仲裁。 

因为它们不存储数据集，所以仲裁器可以是提供副本集仲裁功能的好方法，其资源成本比具有数据集的全功能副本集成员更便宜。 

如果您的副本集具有偶数个成员，请添加仲裁者以获得主要选举中的大多数投票。 

仲裁者不需要专用硬件。 

有关仲裁器的更多信息，请参阅副本集仲裁器。

![replica-set-primary-with-secondary-and-arbiter.bakedsvg.svg](https://docs.mongodb.com/manual/_images/replica-set-primary-with-secondary-and-arbiter.bakedsvg.svg)


仲裁者将始终是仲裁者，而主要人员可能会退出并成为次要人员，而次要人员可能成为选举期间的主要仲裁者。

# 异步复制

辅助节点异步应用主节点的操作。 

通过在主要成员之后应用操作，尽管一个或多个成员失败，但集合仍可继续运行。 

有关复制机制的详细信息，请参阅副本集Oplog和副本集数据同步。

# 自动故障转移

如果主节点未与该节点的其他成员通信超过配置的electionTimeoutMillis期间（默认为10秒），则符合条件的次要节点要求选举将自己指定为新主节点。 

群集尝试完成新主节点的选举并恢复正常操作。

![replica-set-trigger-election.bakedsvg.svg](https://docs.mongodb.com/manual/_images/replica-set-trigger-election.bakedsvg.svg)

在选举成功完成之前，副本集无法处理写入操作。如果此类查询配置为在主服务器脱机时在辅助服务器上运行，则副本集可以继续提供读取查询。

假设默认副本配置设置，群集选择新主节点之前的中位时间通常不应超过12秒。这包括将主要标记为不可用以及呼叫和完成选举所需的时间。您可以通过修改settings.electionTimeoutMillis复制配置选项来调整此时间段。网络延迟等因素可能会延长副本集选举完成所需的时间，从而影响群集在没有主节点的情况下运行的时间。这些因素取决于您的特定群集体系结构。

将electionTimeoutMillis复制配置选项从默认10000（10秒）降低可以更快地检测到主要故障。但是，由于诸如临时网络延迟等因素，群集可能会更频繁地呼叫选举，即使主要因素是健康的。

这可能导致w：1写入操作的回滚增加。

您的应用程序连接逻辑应包括自动故障转移和后续选举的容差。

版本3.6中的新功能：MongoDB 3.6+驱动程序可以检测主要数据库的丢失并自动重试某些写入操作，提供额外的内置自动故障转移和选举处理。

有关副本集选举的完整文档，请参阅副本集选举。

要了解有关MongoDB故障转移过程的更多信息，请参阅：

- 副本集选举

- 可重试的写入

- 副本集故障转移期间的回滚

# 参考资料

https://docs.mongodb.com/manual/replication/

* any list
{:toc}
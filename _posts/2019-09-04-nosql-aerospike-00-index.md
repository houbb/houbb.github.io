---
layout: post
title: aerospike-00-数据库间接
date:  2019-5-10 11:08:59 +0800
categories: [Data-Management]
tags: [data-management, database, sh]
published: true
---

# Aerospike数据库4.0

强大的一致性 + 高性能

数字经济建立在商业时刻 – 当决策转向行动时，数字经济的关键时刻。 

## 为什么 Aerospike

Aerospike 4.0是唯一能够以毫秒级速度可靠处理互联网级数据量和决策的数据库，而不会增加操作的复杂性或难以承受的成本。

## 是什么

Aerospike是一个分布式，可扩展的NoSQL数据库。

该架构有三个主要目标：

1. 为Web级应用程序创建灵活，可扩展的平台。

2. 提供传统数据库所期望的稳健性和可靠性（如ACID）。

3. 以最少的人工参与提供运营效率。

# 架构

客户端层：此群集感知层包括开源客户端库，可实现Aerospike API。

集群和数据分布层：该层管理集群通信并自动执行故障转移，复制，跨数据中心同步以及智能重新平衡和数据迁移

数据存储层：该层可以将数据可靠地存储在DRAM和Flash中，以便快速检索。

# 客户端层（Client Layer）

客户端层能监控cluster的所有节点，并且能够自动感知所有节点的更新，同时掌握数据在cluster内的分布，

特点如下

高效性：Client的基础架构确保请求能够到相应的节点读写数据，减少响应时间。

稳定性：如果节点出错，不需要重启Client端，并且保持服务的正确性

连接池：为了减少频繁的open/close TCP操作，Client会在内部维护一个连接池保持长连接

# 分布层（Distibution Layer）

负责管理集群内数据的平衡分布。

备份、容错和不用集群之前的数据同步。

如果新增节点，只需要向集群中添加新的Aerospike server,不需要停止当前的服务，包含三个模块：

## 集群管理模块

基于Paxos-like Consensus Voting Process算法来管理和维护集群内的节点，并用心跳（Heart，包含active和passive）来监听所有节点的状态，用于监听节点间的连通性。

## 数据迁移模块

当有节点添加和删除是，该模块保证数据的重新分布，按照系统配置的复制因子确保每个数据块跨节点和跨数据中心复制。

## 事务处理模块

确保读写一致性，写操作先写Replica，再写master

事务模块主要负责以下任务：

Sync/Async Replication(同步/异步复制)：为保证写一致性，在提交数据之前向副本传播更新并将结果返回客户端

Proxy（代理）：集群重新配置期间客户端可能出现短暂过期，透明代理请求到其他节点。

Duplicate（副本解析）：当集群从活动分区恢复时，解决不同数据副本之间的冲突。

# 数据存储层（Data Layer）

负责数据的存储，Aerospike是schema-less的键-值数据库，数据存储模式：

命名空间：数据存储在namespace中；namespace可以分为不同sets和records，每条record包含一个唯一的key和一个或多个bins值。

索引：Aerospike Indexs包含Primary Indexs和Second Indexs，索引只存储在内存中。

磁盘：与其它基于文件系统数据库的不同之处，在于Aerospike为了达到更好的性能选择了直接访问SSD的raw blocks（row device），并特别优化了Aerospike的最小化读、大块写和并行SSD来真加响应速度和吞吐量。

# 数据模型

Aerospike采用无模式（schema-less）数据模型，这意味着存储在库中的数据不符合严格模式。

允许动态添加新类型的bin。尽管如此，仍然需要遵守bin名称与数据的对应关系。

应用程序必须利用bin的一致性来保障查询和聚合的正确性。

Aerospike 键值存储（KVS）操作将键与一组命名值相关联。

在集群启动时，Aerospike配置策略容器 - namespace（RDBMS 数据库） - 它控制一组数据的保留和可靠性要求。

命名空间分为set（RDBMS 表）和record（RDBMS 行）。

每条记录都有一个唯一的索引键，以及一个或多个包含记录值的bin（RDBMS 列）。

# 命名空间(namespace)

命名空间是顶级数据容器。命名空间实际上可以是数据库或一组数据库的一部分，如标准RDBMS中所述。

在命名空间中收集数据的方式与数据的存储和管理方式有关。命名空间包含记录，索引和策略。策略规定了命名空间行为，包括：

如何存储数据：在DRAM或磁盘上。

记录存在多少个副本。

记录到期时间等


# 集合（sets）

在命名空间（namespace）中，记录可以属于一个称作集合（set）的逻辑容器。集合（set）为应用程序提供了收集记录组的能力。

集合（set）继承了包含它的namespace的策略，也可为set指定其他的策略。

例如，可以仅针对特定集合的数据指定二级索引，或者可以对特定集合执行扫描操作。

# 记录（records）

Aerospike数据库是一个行存储，专注于单个记录（RDBMS 行）。

记录是数据库中的基本存储单元。

记录可以属于命名空间或命名空间中的集合。记录使用密钥作为其唯一标识符。

记录包括以下内容：

| Component	|  Description | 
|:---|:---|
| Key	    | 唯一标识，记录可以使用其密钥的散列来寻址，称为摘要。 |
| Metadata	| 记录版本信息和配置到期时间，称为生存时间（TTL） |
| Bins	    | 相当于传统数据中的字段 |

## key

使用键在应用程序中读取或写入记录。

当密钥被发送到数据库时，它及其设置信息被散列为160位摘要，用于解决所有操作的记录。

因此，您在应用程序中使用密钥，而摘要用于寻址数据库中的记录。

## Metadata

每条记录包括以下元数据

生成跟踪记录修改周期。该数字将在读取时返回给应用程序，可以使用它来确保自上次读取后未写入的数据已被修改。

生存时间（TTL）指定记录到期。

Aerospike 根据其 TTL 自动过期记录。

每次写入记录时TTL都会递增。

对于服务器版本3.10.1及更高版本，客户端可以将策略设置为在更新记录时不更新TTL。

last-update-time（LUT）指定更新的时间戳记录。这是数据库内部的元数据，不会返回给客户端。

## bins

在记录中，数据存储在一个或多个bin中，包含名称和值。

Bins不指定数据类型，数据类型由bin中包含的值定义，这种动态数据类型为数据模型提供了灵活性。

例如，记录可以包含由字符串值bob组成的bin id。

bin的值总是可以更改为不同的字符串值，但也可以更改为不同数据类型的值，例如整数。

### Bin中支持的数据类型：

Integer

String

Bytes

Double（3.6.0及更高的版本）

List

Map

GeoJSON（3.7.0及更高的版本）

native-language serialized (blobs)

命名空间或集合中的记录可以由非常不同的箱组成。

记录没有架构，因此每条记录可以有不同的bins。

您可以在记录的生命周期中的任何位置添加和删除容器。

目前，命名空间中并发唯一bin名称的数量限制为32K。

这是由于优化的字符串表实现。



# 个人收获

基于内存的性能+ssd的性能。

因为 ssd 相对于内存而言，是廉价的。从而可以节约成本。

# 参考资料

[WiredTiger-官网](http://source.wiredtiger.com/)


- other

[应用实战：从Redis到Aerospike，我们踩了这些坑](https://www.cnblogs.com/evakang/p/9328672.html)

[Aerospike基础知识](https://blog.csdn.net/wqh8522/article/details/83750363)

* any list
{:toc}
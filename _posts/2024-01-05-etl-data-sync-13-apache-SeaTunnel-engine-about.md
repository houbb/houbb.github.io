---
layout: post
title: ETL-13-apache SeaTunnel Engine about
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# SeaTunnel Engine

SeaTunnel Engine是一个由社区开发的数据同步引擎，专为数据同步场景而设计。

作为SeaTunnel的默认引擎，它支持高吞吐量、低延迟和强一致性的同步作业操作，速度更快、更稳定、更节省资源且易于使用。

SeaTunnel Engine的整体设计遵循以下路径：

更快：SeaTunnel Engine的执行计划优化器旨在减少数据网络传输，从而降低由数据序列化和反序列化导致的整体同步性能损失，使用户能够更快地完成数据同步操作。同时，支持速度限制，以合理的速度同步数据。

更稳定：SeaTunnel Engine将Pipeline作为数据同步任务的最小粒度的检查点和容错机制。任务的失败只会影响其上游和下游任务，避免了任务失败导致整个作业失败或回滚的情况。同时，SeaTunnel Engine还支持数据缓存，适用于源数据有存储时间限制的场景。启用缓存时，从源读取的数据将自动缓存，然后由下游任务读取并写入目标。在这种情况下，即使由于目标的失败而无法写入数据，也不会影响源的正常读取，防止源数据在过期时被删除。

节省空间：SeaTunnel Engine在内部使用动态线程共享技术。在实时同步场景中，对于每个表数据量大但每个表的数据量较小的情况，SeaTunnel Engine将在共享线程中运行这些同步任务，以减少不必要的线程创建并节省系统空间。在读取和数据写入方面，SeaTunnel Engine的设计目标是最小化JDBC连接的数量；在CDC场景中，SeaTunnel Engine将重用日志读取和解析资源。

简单易用：SeaTunnel Engine减少了对第三方服务的依赖，并能够独立实现集群管理、快照存储和集群高可用功能，而无需依赖诸如Zookeeper和HDFS之类的大数据组件。这对于目前缺乏大数据平台的用户或不愿意依赖大数据平台进行数据同步的用户非常有用。

未来，SeaTunnel Engine将进一步优化其功能，以支持离线批量同步、实时同步和CDC的全同步和增量同步。

## 集群管理

- 支持单机操作；
- 支持集群操作；
- 支持自治集群（分散式），无需用户指定SeaTunnel Engine集群的主节点，因为它在运行过程中可以自行选择主节点，并在主节点失败时自动选择新的主节点。
- 自治集群节点发现和具有相同cluster_name的节点将自动形成一个集群。

## 核心功能

- 支持在本地模式下运行作业，作业完成后自动销毁集群；
- 支持在集群模式下运行作业（单机或集群），通过SeaTunnel Client将作业提交给SeaTunnel Engine服务，作业完成后服务继续运行并等待下一个作业的提交；
- 支持离线批量同步；
- 支持实时同步；
- 批流一体化，所有SeaTunnel V2连接器均可在SeaTunnel Engine中运行；
- 支持分布式快照算法，并支持与SeaTunnel V2连接器的两阶段提交，确保数据仅执行一次。
- 支持在Pipeline级别调用作业，以确保即使资源有限也可以启动作业；
- 支持Pipeline级别的作业容错。任务失败仅影响其所在的Pipeline，只需回滚该Pipeline下的任务；
- 支持动态线程共享，以实时同步大量小数据集。


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/about

* any list
{:toc}
---
layout: post
title: Mongo 分片组件之 shards-41
date: 2018-12-10 11:35:23 +0800
categories: [sql]
tags: [sql, nosql, mongo, sh]
published: true
excerpt: Mongo 分片组件之 shards
---

# shards

分片包含分片群集的分片数据子集。 

集群的分片一起保存集群的整个数据集。

从MongoDB 3.6开始，必须将分片部署为副本集以提供冗余和高可用性。

用户，客户端或应用程序应仅直接连接到分片以执行本地管理和维护操作。

在单个分片上执行查询仅返回数据的子集。 

连接到mongos以执行集群级操作，包括读取或写入操作。

> 重要

MongoDB不保证任何两个连续的块驻留在单个分片上。

# 主分片

分片群集中的每个数据库都有一个主分片，其中包含该数据库的所有非分片集合。 

每个数据库都有自己的主分片。 

主分片与副本集中的主分片无关。

通过选择具有最少数据量的群集中的分片，mongos在创建新数据库时选择主分片。 

mongos使用listDatabase命令返回的totalSize字段作为选择条件的一部分。

![sharded-cluster-primary-shard.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharded-cluster-primary-shard.bakedsvg.svg)

要更改数据库的主分片，请使用movePrimary命令。 

迁移主分片的过程可能需要很长时间才能完成，并且在完成之前不应访问与数据库关联的集合。 

根据要迁移的数据量，迁移可能会影响整个群集操作。 

在尝试更改主分片之前，请考虑对群集操作和网络负载的影响。

部署带有先前用作副本集的分片的新分片群集时，所有现有数据库将继续驻留在其原始副本集上。

随后创建的数据库可能驻留在集群中的任何分片上。

# 碎片状态

使用mongo shell中的 `sh.status()` 方法查看集群的概述。 

此报告包括哪个分片是数据库的主分片以及分片中的分块。 

# 分片群集安全性

使用内部身份验证可强制实施群集内安全性，并防止未经授权的群集组件访问群集。 

您必须使用适当的安全设置启动群集中的每个mongod，以强制执行内部身份验证。

有关部署安全分片群集的教程，请参阅使用密钥文件访问控制部署分片群集。

## 分片本地用户

每个分片都支持基于角色的访问控制（RBAC），以限制对分片数据和操作的未授权访问。 

使用 `--auth` 选项启动副本集中的每个mongod以强制执行RBAC。 

或者，为群集内安全性强制执行内部身份验证还可以通过RBAC启用用户访问控制。

每个分片都有自己的分片本地用户。 

这些用户不能用于其他分片，也不能用于通过mongos连接到群集。

有关启用将用户添加到启用RBAC的MongoDB部署的教程，请参阅启用身份验证。

# 参考资料

https://docs.mongodb.com/manual/core/sharded-cluster-shards/

* any list
{:toc}
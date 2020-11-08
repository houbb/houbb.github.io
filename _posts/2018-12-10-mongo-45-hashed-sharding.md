---
layout: post
title: Mongo 分片 hashed sharding-45
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# hashed sharding

散列分片使用散列索引在共享群集中分区数据。 

散列索引计算单个字段的哈希值作为索引值; 此值用作分片键。

散列分片在分片群集中提供更均匀的数据分布，但代价是减少了目标操作与广播操作。

后哈希，具有“关闭”分片键值的文档不太可能在同一块或分片上 - mongos更有可能执行广播操作以满足给定的远程查询。 

mongos可以将具有相等匹配的查询定位到单个分片。

> TIPS

在使用散列索引解析查询时，MongoDB会自动计算哈希值。应用程序不需要计算哈希值。

> 警告

MongoDB散列索引在散列之前将浮点数截断为64位整数。

如，散列索引将为保持值为2.3,2.2和2.9的字段存储相同的值。

要防止冲突，请不要对可能无法可靠地转换为64位整数（然后返回浮点）的浮点数使用散列索引。 

MongoDB散列索引不支持大于253的浮点值。

要查看密钥的散列值，请参阅 convertShardKeyToHashed()。

# 哈希分片碎片密钥

您选择作为散列分片键的字段应具有良好的基数或大量不同的值。 

散列键非常适合分片键，其字段可以像ObjectId值或时间戳一样单调变化。 

一个很好的例子是默认的_id字段，假设它只包含ObjectID值。

要使用散列分片键对集合进行分片，请参阅使用散列分片部署分片分片。

# Hashed vs Ranged Sharding

给定使用单调递增值X作为分片键的集合，使用远程分片会导致传入插入的分布类似于以下内容：

![sharded-cluster-monotonic-distribution.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharded-cluster-monotonic-distribution.bakedsvg.svg)

由于X的值总是在增加，因此具有maxKey上限的块接收大多数传入写入。 

这会将插入操作限制为包含此块的单个分片，从而减少或消除分片集群中分布式写入的优势。

通过在X上使用散列索引，插入的分布类似于以下内容：

![sharded-cluster-hashed-distribution.bakedsvg.svg](https://docs.mongodb.com/manual/_images/sharded-cluster-hashed-distribution.bakedsvg.svg)

# Shard the Collection

使用 sh.shardCollection() 方法，指定集合的完整命名空间和目标散列索引以用作分片键。

```js
sh.shardCollection( "database.collection", { <field> : "hashed" } )
```

## Shard a Populated Collection

如果使用散列的分片键对填充的集合进行分片：

分片操作创建初始块以覆盖整个分片键值范围。创建的块数取决于配置的块大小。

在初始块创建之后，平衡器会根据需要在分片中迁移这些初始块，并管理未来的块分布。

## 空集合分片

如果使用散列分片键对空集合进行分片：

没有为空集合或不存在集合指定区域和区域范围：

分片操作创建空块以覆盖整个分片键值范围并执行初始块分发。默认情况下，该操作会为每个分片创建2个块，并在群集中进行迁移。您可以使用numInitialChunks选项指定不同数量的初始块。这种块的初始创建和分发允许更快地设置分片。

在初始分发之后，平衡器管理未来的块分布。

为空或非现有集合指定区域和区域范围（从MongoDB 4.0.3开始可用），分片操作为定义的区域范围以及任何其他块创建空块，以覆盖整个分片键值范围，并根据区域范围执行初始块分布。这种块的初始创建和分发允许更快地设置分区分片。

在初始分发之后，平衡器管理未来的块分布。


# 部署一个基于 hash 的分片集群

## 概观

散列分片键使用单个字段的散列索引作为分片键来分割整个分片群集中的数据。

散列分片在分片群集中提供更均匀的数据分布，但代价是减少了目标操作与广播操作。 

通过散列分片，具有“关闭”分片键值的文档不可能位于同一块或分片上，并且mongos更有可能执行广播操作以完成给定查询。

如果已经部署了分片集群，请使用散列分片跳过Shard集合。

## Atlas，CloudManager和OpsManager

如果您当前正在使用或计划使用Atlas，Cloud Manager或Ops Manager，请参阅各自的手册以获取有关部署分片群集的说明：

创建一个集群（Atlas）

部署分片群集（Cloud Manager）

部署Sharded Cluster（Ops Manager）。


# 注意事项

## 主机名和配置

如果可能，请使用逻辑DNS主机名而不是IP地址，尤其是在配置副本集成员或分片集群成员时。 

逻辑DNS主机名的使用避免了由于IP地址更改而导致的配置更改。

## 操作系统

本教程使用mongod和mongos程序。 

Windows用户应该使用mongod.exe和mongos.exe程序。

## IP绑定

使用bind_ip选项可确保MongoDB侦听来自配置地址上的应用程序的连接。

版本3.6中更改：从MongoDB 3.6开始，MongoDB二进制文件，mongod和mongos默认绑定到localhost。如果为二进制文件设置了net.ipv6配置文件设置或--ipv6命令行选项，则二进制文件还会绑定到localhost IPv6地址。

以前，从MongoDB 2.6开始，默认情况下只有官方MongoDB RPM（Red Hat，CentOS，Fedora Linux和衍生产品）和DEB（Debian，Ubuntu及衍生产品）包中的二进制文件绑定到localhost。

仅绑定到localhost时，这些MongoDB 3.6二进制文件只能接受来自同一台计算机上运行的客户端（包括mongo shell，部署中用于副本集和分片集群的其他成员）的连接。远程客户端无法连接到仅绑定到localhost的二进制文件。

要覆盖并绑定到其他IP地址，可以使用net.bindIp配置文件设置或 `--bind_ip` 命令行选项指定主机名或IP地址列表。

> 警告

在绑定到其他IP地址之前，请考虑启用安全检查表中列出的访问控制和其他安全措施，以防止未经授权的访问。

例如，以下mongod实例绑定到localhost和主机名My-Example-Associated-Hostname，它与ip地址198.51.100.1相关联：

```
mongod --bind_ip localhost,My-Example-Associated-Hostname
```

要连接到此实例，远程客户端必须指定主机名或其关联的IP地址198.51.100.1：

```
mongo --host My-Example-Associated-Hostname

mongo --host 198.51.100.1
```

## 安全

本教程不包括配置内部身份验证或基于角色的访问控制所需的步骤。 

有关使用密钥文件部署分片集群的教程，请参阅使用密钥文件访问控制部署分片集群。

在生产环境中，分片集群应至少使用x.509安全性进行内部身份验证和客户端访问：

有关使用x.509进行内部身份验证的详细信息，请参阅使用x.509证书进行身份验证。

有关使用x.509进行客户端身份验证的详细信息，请参阅使用x.509证书对客户端进行身份验证。

> 注意

启用内部身份验证还可启用基于角色的访问控制。


# 部署具有散列分片的分片群集

> TIPS

如果可能，请使用逻辑DNS主机名而不是IP地址，尤其是在配置副本集成员或分片集群成员时。 逻辑DNS主机名的使用避免了由于IP地址更改而导致的配置更改。

# TODO。。。

实战记录

# 参考资料

https://docs.mongodb.com/manual/core/hashed-sharding/

* any list
{:toc}
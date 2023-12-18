---
layout: post
title: Elasticsearch-02-核心概念介绍
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# Elasticsearch

Elasticsearch是使用Java编写的一种开源搜索引擎，它在内部使用Lucene做索引与搜索，通过对Lucene的封装，提供了一套简单一致的RESTfulAPI。

Elasticsearch也是一种分布式的搜索引擎架构，可以很简单地扩展到上百个服务节点，并支持PB级别的数据查询，使系统具备高可用和高并发特性。

# Elasticsearch的核心概念如下

Cluster：集群，由一个或多个Elasticsearch节点组成。

Node：节点，组成Elasticsearch集群的服务单元，同一个集群内节点的名字不能重复。通常在一个节点上分配一个或者多个分片。

Shards：分片，当索引上的数据量太大的时候，我们通常会将一个索引上的数据进行水平拆分，拆分出来的每个数据块叫作一个分片。在一个多分片的索引中写入数据时，通过路由来确定具体写入那一个分片中，所以在创建索引时需要指定分片的数量，并且分片的数量一旦确定就不能更改。分片后的索引带来了规模上（数据水平切分）和性能上（并行执行）的提升。每个分片都是Lucene中的一个索引文件，每个分片必须有一个主分片和零到多个副本分片。

Replicas：备份也叫作副本，是指对主分片的备份。主分片和备份分片都可以对外提供查询服务，写操作时先在主分片上完成，然后分发到备份上。当主分片不可用时，会在备份的分片中选举出一个作为主分片，所以备份不仅可以提升系统的高可用性能，还可以提升搜索时的并发性能。但是若副本太多的话，在写操作时会增加数据同步的负担。

Index：索引，由一个和多个分片组成，通过索引的名字在集群内进行唯一标识。

Type：类别，指索引内部的逻辑分区，通过Type的名字在索引内进行唯一标识。在查询时如果没有该值，则表示在整个索引中查询。

Document：文档，索引中的每一条数据叫作一个文档，类似于关系型数据库中的一条数据，通过_id在Type内进行唯一标识。

Settings：对集群中索引的定义，比如一个索引默认的分片数、副本数等信息。

Mapping：类似于关系型数据库中的表结构信息，用于定义索引中字段（Field）的存储类型、分词方式、是否存储等信息。Elasticsearch中的mapping是可以动态识别的。如果没有特殊需求，则不需要手动创建mapping，因为Elasticsearch会自动根据数据格式识别它的类型，但是当需要对某些字段添加特殊属性（比如：定义使用其他分词器、是否分词、是否存储等）时，就需要手动设置mapping了。一个索引的mapping一旦创建，若已经存储了数据，就不可修改了。

Analyzer：字段的分词方式的定义。一个analyzer通常由一个tokenizer、零到多个Filter组成。比如默认的标准Analyzer包含一个标准的tokenizer和三个filter：Standard Token Filter、Lower Case Token Filter、Stop Token Filter。


# Elasticsearch的节点的分类

## 主节点（Master Node）：

也叫作主节点，主节点负责创建索引、删除索引、分配分片、追踪集群中的节点状态等工作。Elasticsearch中的主节点的工作量相对较轻。用户的请求可以发往任何一个节点，并由该节点负责分发请求、收集结果等操作，而并不需要经过主节点转发。通过在配置文件中设置node.master =true来设置该节点成为候选主节点（但该节点并不一定是主节点，主节点是集群在候选节点中选举出来的），在Elasticsearch集群中只有候选节点才有选举权和被选举权。其他节点是不参与选举工作的。

## 数据节点（Data Node）：

数据节点，负责数据的存储和相关具体操作，比如索引数据的创建、修改、删除、搜索、聚合。所以，数据节点对机器配置要求比较高，首先需要有足够的磁盘空间来存储数据，其次数据操作对系统CPU、Memory和I/O的性能消耗都很大。通常随着集群的扩大，需要增加更多的数据节点来提高可用性。通过在配置文件中设置node.data=true来设置该节点成为数据节点。

## 客户端节点（Client Node）：

就是既不做候选主节点也不做数据节点的节点，只负责请求的分发、汇总等，也就是下面要说到的协调节点的角色。其实任何一个节点都可以完成这样的工作，单独增加这样的节点更多地是为了提高并发性。

可在配置文件中设置该节点成为数据节点：

```
node.master =false
node.data=false
```

## 部落节点（TribeNode）：

部落节点可以跨越多个集群，它可以接收每个集群的状态，然后合并成一个全局集群的状态，它可以读写所有集群节点上的数据，在配置文件中通过如下设置使节点成为部落节点：

```
tribe:
    one: 
        cluster.name:   cluster_one
    two: 
        cluster.name:   cluster_two
```

因为Tribe Node要在Elasticsearch 7.0以后移除，所以不建议使用。

## 协调节点（CoordinatingNode）：

协调节点，是一种角色，而不是真实的Elasticsearch的节点，我们没有办法通过配置项来配置哪个节点为协调节点。集群中的任何节点都可以充当协调节点的角色。当一个节点A收到用户的查询请求后，会把查询语句分发到其他的节点，然后合并各个节点返回的查询结果，最后返回一个完整的数据集给用户。在这个过程中，节点A扮演的就是协调节点的角色。由此可见，协调节点会对CPU、Memory和I/O要求比较高。


# 集群状态

集群的状态有Green、Yellow和Red三种，如下所述。

Green：绿色，健康。所有的主分片和副本分片都可正常工作，集群100%健康。

Yellow：黄色，预警。所有的主分片都可以正常工作，但至少有一个副本分片是不能正常工作的。此时集群可以正常工作，但是集群的高可用性在某种程度上被弱化。

Red：红色，集群不可正常使用。集群中至少有一个分片的主分片及它的全部副本分片都不可正常工作。这时虽然集群的查询操作还可以进行，但是也只能返回部分数据（其他正常分片的数据可以返回），而分配到这个分片上的写入请求将会报错，最终会导致数据的丢失。

# 3C和脑裂

## 1. 共识性（Consensus）

共识性是分布式系统中最基础也最主要的一个组件，在分布式系统中的所有节点必须对给定的数据或者节点的状态达成共识。虽然现在有很成熟的共识算法如Raft、Paxos等，也有比较成熟的开源软件如ZooKeeper。但是Elasticsearch并没有使用它们，而是自己实现共识系统zen discovery。Elasticsearch之父Shay Banon解释了其中主要的原因：“zendiscovery是Elasticsearch的一个核心的基础组件，zen discovery不仅能够实现共识系统的选择工作，还能够很方便地监控集群的读写状态是否健康。当然，我们也不保证其后期会使用ZooKeeper代替现在的zen discovery”。zendiscovery模块以“八卦传播”（Gossip）的形式实现了单播（Unicast）：单播不同于多播（Multicast）和广播（Broadcast）。节点间的通信方式是一对一的。

## 2．并发（Concurrency）

Elasticsearch是一个分布式系统。写请求在发送到主分片时，同时会以并行的形式发送到备份分片，但是这些请求的送达时间可能是无序的。

在这种情况下，Elasticsearch用乐观并发控制（Optimistic ConcurrencyControl）来保证新版本的数据不会被旧版本的数据覆盖。

乐观并发控制是一种乐观锁，另一种常用的乐观锁即多版本并发控制（Multi-VersionConcurrency Control），它们的主要区别如下。

乐观并发控制（OCC）：是一种用来解决写-写冲突的无锁并发控制，认为事务间的竞争不激烈时，就先进行修改，在提交事务前检查数据有没有变化，如果没有就提交，如果有就放弃并重试。乐观并发控制类似于自选锁，适用于低数据竞争且写冲突比较少的环境。

多版本并发控制（MVCC）：是一种用来解决读-写冲突的无锁并发控制，也就是为事务分配单向增长的时间戳，为每个修改保存一个版本，版本与事务时间戳关联，读操作只读该事务开始前的数据库的快照。这样在读操作不用阻塞写操作且写操作不用阻塞读操作的同时，避免了脏读和不可重复读。

## 3．一致性（Consistency）

Elasticsearch集群保证写一致性的方式是在写入前先检查有多少个分片可供写入，如果达到写入条件，则进行写操作，否则，Elasticsearch会等待更多的分片出现，默认为一分钟。


有如下三种设置来判断是否允许写操作。

One：只要主分片可用，就可以进行写操作。

All：只有当主分片和所有副本都可用时，才允许写操作。

Quorum：是Elasticsearch的默认选项。当有大部分的分片可用时才允许写操作。

其中，对“大部分”的计算公式为 `int((primary + number_of_replicas) / 2 ) + 1`。

Elasticsearch集群保证读写一致性的方式是，为了保证搜索请求的返回结果是最新版本的文档，备份可以被设置为sync（默认值），写操作在主分片和备份分片同时完成后才会返回写请求的结果。这样，无论搜索请求至哪个分片都会返回最新的文档。但是如果我们的应用对写要求很高，就可以通过设置replication=async来提升写的效率，如果设置replication=async，则只要主分片的写完成，就会返回写成功。

## 4．脑裂

在Elasticsearch集群中主节点通过ping命令来检查集群中的其他节点是否处于可用状态，同时非主节点也会通过ping命令来检查主节点是否处于可用状态。

当集群网络不稳定时，有可能会发生一个节点ping不通Master节点，则会认为Master节点发生了故障，然后重新选出一个Master节点，这就会导致在一个集群内出现多个Master节点。

当在一个集群中有多个Master节点时，就有可能会导致数据丢失。

我们称这种现象为脑裂。在5.4.7节会介绍如何避免脑裂的发生。


# 事务日志

我们在5.1节了解到，Lucene为了加快写索引的速度，采用了延迟写入的策略。虽然这种策略提高了写入的效率，但其最大的弊端是，如果数据在内存中还没有持久化到磁盘上时发生了类似断电等不可控情况，就可能丢失数据。为了避免丢失数据，Elasticsearch添加了事务日志（Translog），事务日志记录了所有还没有被持久化到磁盘的数据。

Elasticsearch写索引的具体过程如下。

首先，当有数据写入时，为了提升写入的速度，并没有把数据直接写在磁盘上，而是先写入到内存中，但是为了防止数据的丢失，会追加一份数据到事务日志里。因为内存中的数据还会继续写入，所以内存中的数据并不是以段的形式存储的是检索不到的。总之，Elasticsearch是一个准实时的搜索引擎，而不是一个实时的搜索引擎。此时的状态如图1所示。

![图1](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTDNCjbH3liaOoqSm8kgVeLeM2t7tBVswVgzj0alwpGjTypNflunQoJaUw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


然后，当到达默认的时间（1秒钟）或者内存的数据到达一定量时，会触发一次刷新（Refresh）。刷新的主要步骤如下。

（1）将内存中的数据刷新到一个新的段中，但是该段并没有持久化到硬盘中，而是缓存在操作系统的文件缓存系统中。虽然数据还在内存中，但是内存里的数据和文件缓存系统里的数据有以下区别。

内存使用的是JVM的内存，而文件缓存系统使用的是操作系统的内存。

内存的数据不是以段的形式存储的，并且可以继续向内存里写数据。文件缓存系统中的数据是以段的形式存储的，所以只能读，不能写。

内存中的数据是搜索不到的，文件缓存系统中的数据是可以搜索的。

（2）打开保存在文件缓存系统中的段，使其可被搜索。

（3）清空内存，准备接收新的数据。日志不做清空处理。

此时的状态如图2所示。

![图2](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTDfK4Bk2FlE739ZoFTtfgz7t4DQEiaSoiaGlGvCooACxmYCNt3M69YjKCg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

其次，数据继续写入，同时写入内存和日志，如图3所示。

![图3](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTDWyc3QApjShnnKTqFGblReQWng2XgNdiccyPeiaIDiaeqVURSicrAaOIRLQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

最后，刷新（Flush）。当日志数据的大小超过512MB或者时间超过30分钟时，需要触发一次刷新。刷新的主要步骤如下。

（1）在文件缓存系统中创建一个新的段，并把将内存中的数据写入，使其可被搜索。

（2）清空内存，准备接收新的数据。

（3）将文件系统缓存中的数据通过fsync函数刷新到硬盘中。

（4）生成提交点。

（5）删除旧的日志，创建一个空的日志。

此时的状态如图4所示。

![图4](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTDtm1Xtnr81pl4dGnhC8H1Qfhg0ibQtGiaOSjmFC0NFs7uqH4U1WDgzYOg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

由上面索引创建的过程可知，内存里面的数据并没有直接被刷新（Flush）到硬盘中，而是被刷新（Refresh）到了文件缓存系统中，这主要是因为持久化数据十分耗费资源，频繁地调用会使写入的性能急剧下降，所以Elasticsearch，为了提高写入的效率，利用了文件缓存系统和内存来加速写入时的性能，并使用日志来防止数据的丢失。

在需要重启时，Elasticsearch，不仅要根据提交点去加载已经持久化过的段，还需要根据Translog里的记录，把未持久化的数据重新持久化到磁盘上。

根据上面对Elasticsearch，写操作流程的介绍，我们可以整理出一个索引数据所要经历的几个阶段，以及每个阶段的数据的存储方式和作用。如图5所示。

![图5](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTDYibMrF5uMriaQumbQBF1bgnF2iaCQE1AkwVhYB6OPC1CAjlWuv5pKLL3g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


# 在集群中写索引

假设我们有如图6所示（图片来自官网）的一个集群，该集群由三个节点组成（Node 1、Node 2和Node 3），包含一个由两个主分片和每个主分片有两个副本分片组成的索引。其中，标星号的Node 1是Master节点，负责管理整个集群的状态；p0和p1是主分片；r0和r1是副本分片。为了达到高可用，Master节点会避免将主分片和副本放在同一个节点上。

![图6](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTDVVWvXj1le0ic7HRXj8HTRqyDOaCm4ttKS3AvChMLyvESEpLNqFMwHFw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

将数据分片是为了提高可处理数据的容量和易于进行水平扩展，为分片做副本是为了提高集群的稳定性和提高并发量。在主分片挂掉后，会从副本分片中选举出一个升级为主分片，当副本升级为主分片后，由于少了一个副本分片，所以集群状态会从green改变为yellow，但是此时集群仍然可用。在一个集群中有一个分片的主分片和副本分片都挂掉后，集群状态会由yellow改变为red，集群状态为red时集群不可正常使用。

由上面的步骤可知，副本分片越多，集群的可用性就越高，但是由于每个分片都相当于一个Lucene的索引文件，会占用一定的文件句柄、内存及CPU，并且分片间的数据同步也会占用一定的网络带宽，所以，索引的分片数和副本数也并不是越多越好。

写索引时只能写在主分片上，然后同步到副本上，那么，一条数据应该被写在哪个分片上呢？如图5-19所示，如何知道一条数据应该被写在p0上还是p1上呢？答案就是路由（routing），路由的公式如下：

![路由](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTD8d2hGjAtNdCic8CrBgjjcL4YFw40mWCy4kSRkvAibbxLjUj38ymOph5g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

其中，routing是一个可选择的值，默认是文档的_id（文档的唯一主键，文档在创建时，如果文档的_id已经存在，则进行更新，如果不存在则创建）。后面会介绍如何通过自定义routing参数使查询落在一个分片中，而不用查询所有的分片，从而提升查询的性能。routing通过hash函数生成一个数字，将这个数字除以number_of_primary_shards（分片的数量）后得到余数。这个分布在0到number_of_primary_shards-1之间的余数，就是我们所寻求的文档所在分片的位置。这也就说明了分片数一旦定下来就不能再改变的原因，因为分片数改变后，所有之前的路由值都会变得无效，前期创建的文档也就找不到了。



由于在Elasticsearch集群中每个节点都知道集群中的文档的存放位置（通过路由公式定位），所以每个节点都有处理读写请求的能力。在一个写请求被发送到集群中的一个节点后，此时，该节点被称为协调节点（Coordinating Node），协调节点会根据路由公式计算出需要写到哪个分片上，再将请求转发到该分片的主分片节点上。写操作的流程如下（见图7，图片来自官网）。

（1）客户端向Node 1（协调节点）发送写请求。

（2）Node 1通过文档的_id（默认是_id，但不表示一定是_id）确定文档属于哪个分片（在本例中是编号为0的分片）。请求会被转发到主分片所在的节点Node3上。

（3）Node 3在主分片上执行请求，如果成功，则将请求并行转发到Node1和Node 2的副本分片上。一旦所有的副本分片都报告成功（默认），则Node 3将向协调节点报告成功，协调节点向客户端报告成功。

![图7](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTDZMeQlpsXmWWrlBqb46acFhQwdhQK7kGg1icZNmUYrlAKbcV95vicHu1w/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


# 集群中的查询流程

根据routing字段进行的单个文档的查询，在Elasticsearch集群上可以在主分片或者副本分片上进行。查询字段刚好是routing的分片字段如“_id”的查询流程如下（见图8，图片来自官网）。

（1）客户端向集群发送查询请求，集群再随机选择一个节点作为协调节点（Node1），负责处理这次查询任务。

（2）Node1使用文档的routing id 来计算要查询的文档在哪个分片上（在本例中落在了0分片上）。分片0的副本分片存在所有的三个节点上。在这种情况下，协调节点可以把请求转发到任意节点。本例将请求转发到Node 2上。

（3）Node 2执行查找，并将查找结果返回给协调节点Node 1，Node1再将文档返回给客户端。

![图 8](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTD1lyBxWqqfeHt1Mjvt6kk3RzxNnIrR3E76MxHZOhdcbKzppyUiaU9F4w/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在处理读取请求时，协调结点在每次请求时都会通过轮询所有的副本分片来达到负载均衡。



如果是普通的查询，在查询前并不知道数据在哪个分片上，这时就需要查询所有的分片，然后汇总所有的数据，再把满足条件的数据返回给客户端。这种查询相比于根据routing id查询，要复杂很多，并且性能要差很多。这种查询的详细流程如下（见图9，图片来自官网）。

（1）客户端发送一个查询请求到任意节点，在本例中为Node 3，Node 3会创建一个大小为from + size的空优先队列。

（2）Node 3 将查询请求转发到索引的每个主分片或副本分片中。每个分片在本地执行查询并添加结果到大小为 from + size 的本地有序优先队列中。

（3）在默认情况下每个分片返回各自优先队列中所有文档的id和得分score给协调节点，协调节点合并这些值到自己的优先队列中来产生一个全局排序后的结果列表。

![图9](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTDT9mjfsudvcFjyicjz2NJBk7sicF4eHYJHmtghicEjz7JjLLI6um6iazTiaQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


当一个搜索请求被发送到某个节点时，这个节点就变成了协调节点（Node 1）。 协调节点的任务是广播查询请求到所有相关分片（主分片或者副本分片），并将它们的响应结果整合成全局排序后的结果集合，由上面步骤3所示，默认返回给协调节点的并不是所有的数据，而是只有文档的id和得分score，因为我们最后只返回给用户size条数据，所以这样做的好处是可以节省很多带宽，特别是from很大时。协调节点对收集回来的数据进行排序后，找到要返回的size条数据的id，再根据id查询要返回的数据，比如title、content等。取回数据的流程如下（见图10，图片来自官网）。

（1）Node 3进行二次排序来找出要返回的文档id，并向相关的分片提交多个获得文档详情的请求。

（2）每个分片加载文档，并将文档返回给Node 3。

（3）一旦所有的文档都被取回了，Node 3就返回结果给客户端。

![图 10](https://mmbiz.qpic.cn/mmbiz_png/odp4zTVAogrScPic9Y6TEwj7MNvNic3CTDYHibUVJ29g6FZT8cVdzJicW4OeT3PQt7szU2G7Ln1Yb7ECoT0CiaLKyZg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

协调节点收集各个分片查询出来的数据，再进行二次排序，然后选择需要被取回的文档。例如，如果我们的查询指定了{ "from": 20, "size": 10 }，那么我们需要在每个分片中查询出来得分最高的20+10条数据，协调节点在收集到30×n（n为分片数）条数据后再进行排序，排序位置在0-20的结果会被丢弃，只有从第21个开始的10个结果需要被取回。这些文档可能来自多个甚至全部分片。

由上面的搜索策略可以知道，在查询时深翻（DeepPagination）并不是一种好方法。因为深翻时，from会很大，这时的排序过程可能会变得非常沉重，会占用大量的CPU、内存和带宽。因为这个原因，所以强烈建议慎重使用深翻。

分片可以减少每个片上的数据量，加快查询的速度，但是在查询时，协调节点要在收集数（from+size）×n条数据后再做一次全局排序，若这个数据量很大，则也会占用大量的CPU、内存、带宽等，并且分片查询的速度取决于最慢的分片查询的速度，所以分片数并不是越多越好。

# 参考资料

https://mp.weixin.qq.com/s/PlQRorBV03oqcnjWvE-uRg

* any list
{:toc}
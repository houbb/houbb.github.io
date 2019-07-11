---
layout: post
title: 数据库索引-02-secondary index 二级索引
date: 2019-1-2 10:17:00 +0800
categories: [SQL]
tags: [sql, index, big-data, sh]
published: true
---


# 主键索引

大部分的数据都会有唯一的主键进行标识。

但是查询时的条件往往不是主键，而是其他的比如名称，时间，标签的信息。

为了提升查询的性能，二级索引可以说是是必须的。


# 个人的理解

## 主键索引与数据

主键索引可以唯一确定数据的位置。

二级索引可以建立与主键索引之间的关系。

# mysql 二级索引

mysql中每个表都有一个聚簇索引（clustered index ），除此之外的表上的每个非聚簇索引都是二级索引，又叫辅助索引（secondary indexes）。

以InnoDB来说，每个InnoDB表具有一个特殊的索引称为聚集索引。

如果您的表上定义有主键，该主键索引是聚集索引。

如果你不定义为您的表的主键时，MySQL取第一个唯一索引（unique）而且只含非空列（NOT NULL）作为主键，InnoDB使用它作为聚集索引。

如果没有这样的列，InnoDB就自己产生一个这样的ID值，它有六个字节，而且是隐藏的，使其作为聚簇索引。

# 二级索引设计思路

## 本质

二级索引的本质就是建立各列值与行键之间的映射关系。

如(图1)，当要对F:C1这列建立索引时，只需要建立F:C1各列值到其对应行键的映射关系，如C11->RK1等，这样就完成了对F:C1列值的二级索引的构建，当要查询符合F:C1=C11对应的F:C2的列值时（即根据C1=C11来查询C2的值,图1青色部分）

其查询步骤如下：

1. 根据C1=C11到索引数据中查找其对应的RK，查询得到其对应的RK=RK1

2. 得到RK1后就自然能根据RK1来查询C2的值了 这是构建二级索引大概思路，其他组合查询的联合索引的建立也类似。

![二级索引](https://images2015.cnblogs.com/blog/776259/201606/776259-20160612234508199-1338773707.png)

# 二级索引与数据的同步

可以进行异步刷新。

# HBase 二级索引的设计

## 业务需求

HBase里面只有rowkey作为一级索引， 如果要对库里的非rowkey字段进行数据检索和查询，往往要通过MapReduce/Spark等分布式计算框架进行，硬件资源消耗和时间延迟都会比较高。

为了HBase的数据查询更高效、适应更多的场景， 诸如使用非rowkey字段检索也能做到秒级响应，或者支持各个字段进行模糊查询和多字段组合查询等， 因此需要在
HBase上面构建二级索引， 以满足现实中更复杂多样的业务需求。

## HBse二级索引方案

### A.基于 Coprocessor 方案

1、官方特性

其实从0.94版本开始，HBase官方文档已经提出了hbase上面实现二级索引的一种路径：

基于Coprocessor（0.92版本开始引入，达到支持类似传统RDBMS的触发器的行为）

开发自定义数据处理逻辑，采用数据“双写”（dual-write）策略，在有数据写入同时同步到二级索引表

2、开源方案：

虽然官方一直也没提供内置的支持二级索引的工具， 不过业界也有些比较知名的基于Coprocessor的开源方案：

华为的 hindex ： 基于0.94版本，当年刚出来的时候比较火，但是版本较旧，看GitHub项目地址最近这几年就没更新过。

Apache Phoenix： 功能围绕着SQL on hbase，支持和兼容多个hbase版本， 二级索引只是其中一块功能。 

二级索引的创建和管理直接有SQL语法支持，使用起来很简便， 该项目目前社区活跃度和版本更新迭代情况都比较好。

ApachePhoenix在目前开源的方案中，是一个比较优的选择。

主打SQL on HBase， 基于SQL能完成HBase的CRUD操作，支持JDBC协议。 

Apache Phoenix 在 Hadoop 生态里面位置：

![Apache Phoenix 在 Hadoop 生态里面位置](https://pic1.zhimg.com/80/v2-d1bf1a98000cb9c49b255689df54d2e4_hd.jpg)

3、Phoenix 二级索引特点：

Covered Indexes(覆盖索引) ：把关注的数据字段也附在索引表上，只需要通过索引表就能返回所要查询的数据（列）， 所以索引的列必须包含所需查询的列(SELECT的列和WHRER的列)。

Functional indexes(函数索引)： 索引不局限于列，支持任意的表达式来创建索引。

Global indexes(全局索引)：适用于读多写少场景。通过维护全局索引表，所有的更新和写操作都会引起索引的更新，写入性能受到影响。在读数据时，Phoenix SQL会基于索引字段，执行快速查询。

Local indexes(本地索引)：适用于写多读少场景。 在数据写入时，索引数据和表数据都会存储在本地。在数据读取时，由于无法预先确定region的位置，所以在读取数据时需要检查每个region（以找到索引数据），会带来一定性能（网络）开销。

其他的在网上也很多自己基于Coprocessor实现二级索引的文章，大体都是遵循类似的思路：构建一份“索引”的映射关系，存储在另一张hbase表或者其他DB里面。


4、方案优缺点：

优点： 基于Coprocessor的方案，从开发设计的角度看， 把很多对二级索引管理的细节都封装在的Coprocessor具体实现类里面，这些细节对外面读写的人是无感知的，简化了数据访问者的使用。

缺点： 但是 Coprocessor 的方案入侵性比较强， 增加了在 Regionserver 内部需要运行和维护二级索引关系表的代码逻辑等，对 Regionserver 的性能会有一定影响。


### B. 非 Coprocessor 方案

选择不基于 Coprocessor 开发，自行在外部构建和维护索引关系也是另外一种方式。

常见的是采用底层基于 Apache Lucene 的Elasticsearch(下面简称ES)或Apache Solr ，来构建强大的索引能力、搜索能力， 例如支持模糊查询、全文检索、组合查询、排序等。

1、Lily HBase Indexer：

LilyHBase Indexer(也简称 HBase Indexer)是国外的NGDATA公司开源的基于solr的索引构建工具， 特色是其基于HBase的备份机制，开发了一个叫SEP工具， 

通过监控HBase 的WAL日志（Put/Delete操作），来触发对solr集群索引的异步更新， 基本对HBase无侵入性（但必须开启WAL ）， 流程图如下所示：

![Lily HBase Indexer](https://pic1.zhimg.com/80/v2-651035ada722c0f044f9832e1eea1b60_hd.jpg)

2、CDH Search

CDH Search 是 Hadoop 发行商 Cloudera 公司开发的基于 solr 的 HBase 检索方案，部分集成了Lily HBase Indexer的功能。

下面是 CDH search 的核心组件交互图， 体现了在单次 client 端查询过程中，核心的 zookeeper 和 solr 等的交互流程：

![CDH Search](https://pic2.zhimg.com/80/v2-76082f5e0cb296ea6823f02b766638f1_hd.jpg)

3、CDH 支持构建索引方式：

- 批量索引：

使用 Spark ：CDH自带 spark 批量index工具

使用MapReduce ：集成Lily Indexer、自带MR index等工具

- 近实时索引（增量场景）：

使用 Flume 近实时（NRT）索引

集成Lily NRT Indexer

基于Solr REST API自定义索引场景

4、CDH Solr 索引查询流程示意图：

![CDH Solr](https://pic1.zhimg.com/80/v2-3e3b68d7aef2430ee0fb3a3d8c4c14a8_hd.jpg)

# 二级索引方案介绍

其实对于在外部自定义构建二级索引的方式，有自己的大数据团队的公司一般都会针对自己的业务场景进行优化，自行构建ES/Solr的搜索集群。 

例如数说故事企业内部的百亿级数据全量库，就是基于ES构建海量索引和检索能力的案例。 

主要优化点包括：

1. 对企业的索引集群面向的业务场景和模式定制，对通用数据模型进行抽象和平台化复用

2. 需要针对多业务、多项目场景进行ES集群资源的合理划分和运维管理

3. 查询需要针对多索引集群、跨集群查询进行优化

4. 共用集群场景需要做好防护、监控、限流

下面显示了数说基于ES做二级索引的两种构建流程，包含：

增量索引： 日常持续接入的数据源，进行增量的索引更新

全量索引： 配套基于Spark/MR的批量索引创建/更新程序， 用于初次或重建已有HBase库表的索引

![ES 做二级索引](https://pic2.zhimg.com/80/v2-7e31f64a2a100f656f53375bb872ae45_hd.jpg)

数据查询流程：

![数据查询流程](https://pic3.zhimg.com/80/v2-7beec7808daec7cb4fd7845d758d915a_hd.jpg)

# 拓展阅读

[Phoenix]()

[聚集索引]()

# 参考资料

[mysql 二级索引](https://blog.csdn.net/wmsjlihuan/article/details/14447479)

[HBase二级索引的设计](https://www.cnblogs.com/MOBIN/p/5579088.html)

[HBase二级索引方案](https://zhuanlan.zhihu.com/p/43972378)

[二级索引](https://www.jianshu.com/p/26f564f7ac66)

[全局二级索引](https://docs.aws.amazon.com/zh_cn/amazondynamodb/latest/developerguide/GSI.html)

## Phoenix

[Phoenix 系列：二级索引（1）](https://www.cnblogs.com/haoxinyue/p/6724365.html)

[Phoenix 五、二级索引](https://yq.aliyun.com/articles/536850)

* any list
{:toc}
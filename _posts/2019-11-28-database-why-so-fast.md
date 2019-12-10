---
layout: post
title: Lindorm Ali DataBase 为什么这么快
date:  2019-11-20 11:18:30 +0800
categories: [Database]
tags: [database, distributed-database, why, sh]
published: false
---

# Lindorm

2019年以来，Lindorm 已经服务了包括淘宝、天猫、蚂蚁、菜鸟、妈妈、优酷、高德、大文娱等数十个BU，在今年的双十一中，Lindorm峰值请求达到了7.5亿次每秒，天吞吐22.9万亿次，平均响应时间低于3ms，整体存储的数据量达到了数百PB。

这些数字的背后，凝聚了HBase&Lindorm团队多年以来的汗水和心血。Lindorm脱胎于HBase，是团队多年以来承载数百PB数据，亿级请求量，上千个业务后，在面对规模成本压力，以及HBase自身缺陷下，全面重构和引擎升级的全新产品。相比HBase，Lindorm无论是性能，功能还是可用性上，都有了巨大飞跃。

本文将从功能、可用性、性能成本、服务生态等维度介绍Lindorm的核心能力与业务表现，最后分享部分我们正在进行中的一些项目。

# 极致优化，超强性能

Lindorm比HBase在RPC、内存管理，缓存、日志写入等方面做了深度的优化，引入了众多新技术，大幅提升了读写性能，在相同硬件的情况下，吞吐可达到HBase的5倍以上，毛刺更是可以达到HBase的1/10。

这些性能数据，并不是在实验室条件下产生的，而是在不改动任何参数的前提下，使用开源测试工具YCSB跑出来的成绩。

我们把测试的工具和场景都公布在阿里云的帮助文件中，任何人都可以依照指南自己跑出一样的结果。


# Trie Index

Lindorm 的文件LDFile（类似HBase中的HFile）是只读 B+ 树结构，其中文件索引是至关重要的数据结构。

在 block cache 中有高优先级，需要尽量常驻内存。

如果能降低文件索引所占空间大小，我们可以节省 block cache 中索引所需要的宝贵内存空间。

或者在索引空间不变的情况下，增加索引密度，降低 data block 的大小，从而提高性能。

而HBase中的索引block中存的是全量的Rowkey，而在一个已经排序好的文件中，很多Rowkey都是有共同前缀的。

数据结构中的Trie (前缀树) 结构能够让共同前缀只存一份，避免重复存储带来的浪费。

但是传统前缀树结构中，从一个节点到下一个节点的指针占用空间太多，整体而言得不偿失。

这一情况有望用 Succinct Prefix Tree 来解决。

SIGMOD2018年的最佳论文 Surf 中提出了一种用 Succinct Prefix Tree 来取代 bloom filter，并同时提供 range filtering 的功能。

我们从这篇文章得到启发，用 Succinct Trie 来做 file block index。

## 数据结构

我们在线上的多个业务中使用了Trie index实现的索引结构。

结果发现，各个场景中，Trie index可以大大缩小索引的体积，最多可以压缩12倍的索引空间！

节省的这些宝贵空间让内存Cache中能够存放更多的索引和数据文件，大大提高了请求的性能。

# ZGC加持，百GB堆平均5ms暂停

ZGC(Powerd by Dragonwell JDK)是下一代Pauseless GC算法的代表之一，其核心思想是Mutator利用内存读屏障(Read Barrier)识别指针变化，使得大部分的标记(Mark)与合并(Relocate)工作可以放在并发阶段执行。

这样一项实验性技术，在Lindorm团队与AJDK团队的紧密合作下，进行了大量的改进与改造工作。

使得ZGC在Lindorm这个场景上实现了生产级可用，主要工作包括：

1. Lindorm内存自管理技术，数量级减少对象数与内存分配速率。(比如说阿里HBase团队贡献给社区的CCSMap)。

2. AJDK ZGC Page缓存机制优化(锁、Page缓存策略)。

3. AJDK ZGC 触发时机优化，ZGC无并发失败。AJDK ZGC在Lindorm上稳定运行两个月，并顺利通过双十一大考。

其JVM暂停时间稳定在5ms左右，最大暂停时间不超过8ms。

ZGC大大改善了线上运行集群的RT与毛刺指标，平均RT优化15%～20%，P999 RT减少一倍。

在今年双十一蚂蚁风控集群中，在ZGC的加持下，P999时间从12ms降低到了5ms。


# LindormBlockingQueue

上图是HBase中的RegionServer从网络上读取RPC请求并分发到各个Handler上执行的流程。

HBase中的RPC Reader从Socket上读取RPC请求放入BlockingQueue，Handler订阅这个Queue并执行请求。

而这个BlockingQueue，HBase使用的是Java原生的JDK自带的LinkedBlockingQueue。

LinkedBlockingQueue利用Lock与Condition保证线程安全与线程之间的同步，虽然经典易懂，但当吞吐增大时，这个queue会造成严重的性能瓶颈。

因此在Lindorm中全新设计了LindormBlockingQueue，将元素维护在Slot数组中。

维护head与tail指针，通过CAS操作对进队列进行读写操作，消除了临界区。

并使用Cache Line Padding与脏读缓存加速，同时可定制多种等待策略(Spin/Yield/Block)，避免队列为空或为满时，频繁进入Park状态。

LindormBlockingQueue的性能非常突出，相比于原先的LinkedBlockingQueue性能提升4倍以上。

# VersionBasedSynchronizer

LDLog是Lindorm中用于系统failover时进行数据恢复时的日志，以保障数据的原子性和可靠性。

在每次数据写入时，都必须先写入LDLog。

LDLog写入成功之后，才可以进行后续的写入memstore等操作。

因此Lindorm中的Handler都必须等待WAL写入完成后再被唤醒以进行下一步操作，在高压条件下，无用唤醒会造成大量的CPU Context Switch造成性能下降。

针对这个问题，Lindorm研发了基于版本的高并发多路线程同步机制(VersionBasedSynchronizer)来大幅优化上下文切换。

VersionBasedSynchronizer的主要思路是让Handler的等待条件被Notifier感知，减少Notifier的唤醒压力。

经过模块测试VersionBasedSynchronizer的效率是JDK自带的ObjectMonitor和J.U.C(java util concurrent包)的两倍以上。

# 全面无锁化

HBase 内核在关键路径上有大量的锁，在高并发场景下，这些锁都会造成线程争抢和性能下降。

Lindorm内核对关键链路上的锁都做了无锁化处理，如MVCC，WAL模块中的锁。

另外，HBase在运行过程中会产生的各种指标，如qps，rt，cache命中率等等。

而在记录这些Metrics的“不起眼”操作中，也会有大量的锁。

面对这样的问题，Lindorm借鉴了tcmalloc的思想，开发了LindormThreadCacheCounter，来解决Metrics的性能问题。

# Handler协程化

在高并发应用中，一个RPC请求的实现往往包含多个子模块，涉及到若干次IO。

这些子模块的相互协作，系统的ContextSwitch相当频繁。

ContextSwitch的优化是高并发系统绕不开的话题，各位高手都各显神通，业界有非常多的思想与实践。

其中coroutine(协程)和SEDA(分阶段事件驱动)方案是我们着重考察的方案。

基于工程代价，可维护性，代码可读性三个角度考虑，Lindorm选择了协程的方式进行异步化优化。

我们利用了阿里JVM团队提供的Dragonwell JDK内置的Wisp2.0功能实现了HBase Handler的协程化，Wisp2.0开箱即用，有效地减少了系统的资源消耗，优化效果比较客观。

# 全新Encoding算法

从性能角度考虑，HBase通常需要将Meta信息装载进block cache。

如果将block大小较小，Meta信息较多，会出现Meta无法完全装入Cache的情况, 性能下降。

如果block大小较大，经过Encoding的block的顺序查询的性能会成为随机读的性能瓶颈。

针对这一情况，Lindorm全新开发了Indexable Delta Encoding，在block内部也可以通过索引进行快速查询，seek性能有了较大提高。

通过Indexable Delta Encoding， HFile的随机seek性能相对于使用之前翻了一倍，以64K block为例，随机seek性能基本与不做encoding相近（其他encoding算法会有一定性能损失）。

在全cache命中的随机Get场景下，相对于Diff encoding RT下降50%


# 其他

相比社区版HBase，Lindorm还有多达几十项的性能优化和重构，引入了众多新技术，由于篇幅有限，这里只能列举一部分，其他的核心技术，比如：

- CCSMap

- 自动规避故障节点的并发三副本日志协议 (Quorum-based write)

- 高效的批量组提交(Group Commit)

- 无碎片的高性能缓存—Shared BucketCache

- Memstore Bloomfilter

- 面向读写的高效数据结构

- GC-Invisible内存管理

- 在线计算与离线作业架构分离

- JDK/操作系统深度优化

- FPGA offloading Compaction

- 用户态TCP加速


# 丰富的查询模型，降低开发门槛

原生的HBase只支持KV结构的查询，虽然简单，但是在面对各项业务的复杂需求时，显的有点力不从心。

因此，在Lindorm中，我们针对不同业务的特点，研发了多种查询模型，通过更靠近场景的API和索引设计，降低开发门槛。

## WideColumn 模型（原生HBase API）

WideColumn是一种与HBase完全一致的访问模型和数据结构，从而使得Lindrom能100%兼容HBase的API。

用户可以通过Lindorm提供的高性能原生客户端中的WideColumn API访问Lindorm，也可以通过alihbase-connector这个插件，使用HBase客户端及API(无需任何代码改造)直接访问Lindorm。

同时，Lindorm使用了轻客户端的设计，将大量数据路由、批量分发、超时、重试等逻辑下沉到服务端，并在网络传输层做了大量的优化，使得应用端的CPU消耗可以大大节省。

像下表中，相比于HBase，使用Lindorm后的应用侧CPU使用效率提升60%，网络带宽效率提升25%。

在HBase原生API上，我们还独家支持了高性能二级索引，用户可以使用HBase原生API写入数据过程中，索引数据透明地写入索引表。

在查询过程中，把可能全表扫的Scan + Filter大查询，变成可以先去查询索引表，大大提高了查询性能。

关于高性能原生二级索引，大家可以参考：

https://help.aliyun.com/document_detail/144577.html

## TableService模型(SQL、二级索引)

HBase中只支持Rowkey这一种索引方式，对于多字段查询时，通常效率低下。

为此，用户需要维护多个表来满足不同场景的查询需求，这在一定程度上既增加了应用的开发复杂性，也不能很完美地保证数据一致性和写入效率。

并且HBase中只提供了KV API，只能做Put、Get、Scan等简单API操作，也没有数据类型，所有的数据都必须用户自己转换和储存。

对于习惯了SQL语言的开发者来说，入门的门槛非常高，而且容易出错。

为了解决这一痛点，降低用户使用门槛，提高开发效率，在Lindorm中我们增加了TableService模型，其提供丰富的数据类型、结构化查询表达API，并原生支持SQL访问和全局二级索引，解决了众多的技术挑战，大幅降低普通用户的开发门槛。

通过SQL和SQL like的API，用户可以方便地像使用关系数据库那样使用Lindorm。

下面是一个Lindorm SQL的简单示例。

```sql
-- 主表和索引DDL
create table shop_item_relation (
    shop_id varchar,
    item_id varchar,
    status varchar
constraint primary key(shop_id, item_id)) ;
create index idx1 on shop_item_relation (item_id) include (ALL);   -- 对第二列主键建索引，冗余所有列
create index idx2 on shop_item_relation (shop_id, status) include (ALL);  -- 多列索引，冗余所有列
-- 写入数据，会同步更新2个索引
upsert into shop_item_relation values('shop1', 'item1',  'active');
upsert into shop_item_relation values('shop1', 'item2',  'invalid');
-- 根据WHERE子句自动选择合适的索引执行查询
select * from shop_item_relation where item_id = 'item2';  -- 命中idx1
select * from shop_item_relation where shop_id = 'shop1' and status = 'invalid'; -- 命中idx2
```

相比于关系数据库的SQL，Lindorm不具备多行事务和复杂分析(如Join、Groupby)的能力，这也是两者之间的定位差异。

相比于HBase上Phoenix组件提供的二级索引，Lindorm的二级索引在功能、性能、稳定性上远远超过Phoenix。

## FeedStream模型

现代互联网架构中，消息队列承担了非常重要的职责，可以极大的提升核心系统的性能和稳定性。

其典型的应用场景有包括系统解耦，削峰限流，日志采集，最终一致保证，分发推送等等。

常见的消息队列包括RabbitMq，Kafka以及RocketMq等等。

这些数据库尽管从架构和使用方式和性能上略有不同，但其基本使用场景都相对接近。

### 问题

然而，传统的消息队列并非完美，其在消息推送，feed流等场景存在以下问题：

存储：不适合长期保存数据，通常过期时间都在天级

删除能力：不支持删除指定数据entry

查询能力：不支持较为复杂的查询和过滤条件

一致性和性能难以同时保证：类似于Kafka之类的数据库更重吞吐，为了提高性能存在了某些状况下丢数据的可能，而事务处理能力较好的消息队列吞吐又较为受限。

Partition快速拓展能力：通常一个Topc下的partition数目都是固定，不支持快速扩展。

物理队列/逻辑队列：通常只支持少量物理队列(如每个partition可以看成一个队列)，而业务需要的在物理队列的基础上模拟出逻辑队列，如IM系统中为每个用户维护一个逻辑上的消息队列，用户往往需要很多额外的开发工作。

### 解决方案

针对上述需求，Lindorm推出了队列模型FeedStreamService，能够解决海量用户下的消息同步，设备通知，自增ID分配等问题。

FeedStream模型在今年手机淘宝消息系统中扮演了重要角色，解决了手机淘宝消息推送保序，幂等等难题。

在今年双十一中，手淘的盖楼和回血大红包推送都有Lindorm的身影。

手淘消息的推送中，峰值超过了100w/s，做到了分钟级推送全网用户。

# 全文索引模型

虽然Lindorm中的TableService模型提供了数据类型和二级索引。

但是，在面对各种复杂条件查询和全文索引的需求下，还是显得力不从心，而Solr和ES是优秀的全文搜索引擎。

使用Lindorm+Solr/ES，可以最大限度发挥Lindorm和Solr/ES各自的优点，从而使得我们可以构建复杂的大数据存储和检索服务。

Lindorm内置了外部索引同步组件，能够自动地将写入Lindorm的数据同步到外部索引组件如Solr或者ES中。

这种模型非常适合需要保存大量数据，而查询条件的字段数据仅占原数据的一小部分，并且需要各种条件组合查询的业务，例如：

1. 常见物流业务场景，需要存储大量轨迹物流信息，并需根据多个字段任意组合查询条件

2. 交通监控业务场景，保存大量过车记录，同时会根据车辆信息任意条件组合检索出感兴趣的记录

3. 各种网站会员、商品信息检索场景，一般保存大量的商品/会员信息，并需要根据少量条件进行复杂且任意的查询，以满足网站用户任意搜索需求等。

全文索引模型已经在阿里云上线，支持Solr/ES外部索引。

目前，索引的查询用户还需要直接查询Solr/ES再来反查Lindorm，后续我们会用TableService的语法把查询外部索引的过程包装起来，用户全程只需要和Lindorm交互，即可获得全文索引的能力。

# 零干预、秒恢复的高可用能力

从一个婴儿成长为青年，阿里HBase摔过很多次，甚至头破血流，我们在客户的信任之下幸运的成长。

在9年的阿里应用过程中，我们积累了大量的高可用技术，而这些技术，都应用到了HBase增强版中。

## MTTR优化

HBase是参照Gooogle著名论文BigTable的开源实现，其中最核心特点是数据持久化存储于底层的分布式文件系统HDFS，通过HDFS对数据的多副本维护来保障整个系统的高可靠性，而HBase自身不需要去关心数据的多副本及其一致性，这有助于整体工程的简化，但也引入了"服务单点"的缺陷，即对于确定的数据的读写服务只有发生固定的某个节点服务器，这意味着当一个节点宕机后，数据需要通过重放Log恢复内存状态，并且重新派发给新的节点加载后，才能恢复服务。

当集群规模较大时，HBase单点故障后恢复时间可能会达到10-20分钟，大规模集群宕机的恢复时间可能需要好几个小时！

而在Lindorm内核中，我们对MTTR（平均故障恢复时间）做了一系列的优化，包括故障恢复时先上线region、并行replay、减少小文件产生等众多技术。

将故障恢复速度提升10倍以上！基本上接近了HBase设计的理论值。

## 可调的多一致性

在原来的HBase架构中，每个region只能在一个RegionServer中上线，如果这个region server宕机，region需要经历Re-assgin，WAL按region切分，WAL数据回放等步骤后，才能恢复读写。

这个恢复时间可能需要数分钟，对于某些高要求的业务来说，这是一个无法解决的痛点。

另外，虽然HBase中有主备同步，但故障下只能集群粒度的手动切换，并且主和备的数据只能做到最终一致性，而有一些业务只能接受强一致，HBase在这点上望尘莫及。

Lindorm内部实现了一种基于Shared Log的一致性协议，通过分区多副本机制达到故障下的服务自动快速恢复的能力，完美适配了存储分离的架构, 利用同一套体系即可支持强一致语义，又可以选择在牺牲一致性的前提换取更佳的性能和可用性，实现多活，高可用等多种能力。

在这套架构下，Lindorm拥有了以下几个一致性级别，用户可以根据自己的业务自由选择一致性级别：

## 客户端高可用切换

虽然说目前HBase可以组成主备，但是目前市面上没有一个高效地客户端切换访问方案。

HBase的客户端只能访问固定地址的HBase集群。

如果主集群发生故障，用户需要停止HBase客户端，修改HBase的配置后重启，才能连接备集群访问。

或者用户在业务侧必须设计一套复杂地访问逻辑来实现主备集群的访问。

阿里HBase改造了HBase客户端，流量的切换发生在客户端内部，通过高可用的通道将切换命令发送给客户端，客户端会关闭旧的链接，打开与备集群的链接，然后重试请求。

# 云原生，更低使用成本

Lindorm从立项之初就考虑到上云，各种设计也能尽量复用云上基础设施，为云的环境专门优化。

比如在云上，我们除了支持云盘之外，我们还支持将数据存储在OSS这种低成本的对象存储中减少成本。

我们还针对ECS部署做了不少优化，适配小内存规格机型，加强部署弹性，一切为了云原生，为了节省客户成本。

## ECS+云盘的极致弹性

目前Lindorm在云上的版本HBase增强版均采用ECS+云盘部署（部分大客户可能采用本地盘），ECS+云盘部署的形态给Lindorm带来了极致的弹性。

最开始的时候，HBase在集团的部署均采用物理机的形式。每个业务上线前，都必须先规划好机器数量和磁盘大小。在物理机部署下，往往会遇到几个难以解决的问题：

业务弹性难以满足：当遇到业务突发流量高峰或者异常请求时，很难在短时间内找到新的物理机扩容。

存储和计算绑定，灵活性差：物理机上CPU和磁盘的比例都是一定的，但是每个业务的特点都不一样，采用一样的物理机，有一些业务计算资源不够，但存储过剩，而有些业务计算资源过剩，而存储瓶颈。特别是在HBase引入混合存储后，HDD和SSD的比例非常难确定，有些高要求的业务常常会把SSD用满而HDD有剩余，而一些海量的离线型业务SSD盘又无法利用上。

运维压力大：使用物理机时，运维需要时刻注意物理机是否过保，是否有磁盘坏，网卡坏等硬件故障需要处理，物理机的报修是一个漫长的过程，同时需要停机，运维压力巨大。对于HBase这种海量存储业务来说，每天坏几块磁盘是非常正常的事情。而当Lindorm采用了ECS+云盘部署后，这些问题都迎刃而解。

### ECS 的优势

ECS提供了一个近似无限的资源池。

当面对业务的紧急扩容时，我们只需在资源池中申请新的ECS拉起后，即可加入集群，时间在分钟级别之内，无惧业务流量高峰。

配合云盘这样的存储计算分离架构。我们可以灵活地为各种业务分配不同的磁盘空间。

当空间不够时，可以直接在线扩缩容磁盘。

同时，运维再也不用考虑硬件故障，当ECS有故障时，ECS可以在另外一台宿主机上拉起，而云盘完全对上层屏蔽了坏盘的处理。

极致的弹性同样带来了成本的优化。

我们不需要为业务预留太多的资源，同时当业务的大促结束后，能够快速地缩容降低成本。

## 一体化冷热分离

在海量大数据场景下，一张表中的部分业务数据随着时间的推移仅作为归档数据或者访问频率很低，同时这部分历史数据体量非常大，比如订单数据或者监控数据，降低这部分数据的存储成本将会极大的节省企业的成本。

如何以极简的运维配置成本就能为企业极大降低存储成本，Lindorm冷热分离功能应运而生。

Lindorm为冷数据提供新的存储介质，新的存储介质存储成本仅为高效云盘的1/3。

Lindorm在同一张表里实现了数据的冷热分离，系统会自动根据用户设置的冷热分界线自动将表中的冷数据归档到冷存储中。

在用户的访问方式上和普通表几乎没有任何差异，在查询的过程中，用户只需配置查询Hint或者TimeRange，系统根据条件自动地判断查询应该落在热数据区还是冷数据区。

对用户而言始终是一张表，对用户几乎做到完全的透明。

详细介绍请参考：https://yq.aliyun.com/articles/718395

## ZSTD-V2，压缩比再提升100%

早在两年前，我们就把集团内的存储压缩算法替换成了ZSTD，相比原来的SNAPPY算法，获得了额外25%的压缩收益。

今年我们对此进一步优化，开发实现了新的ZSTD-v2算法，其对于小块数据的压缩，提出了使用预先采样数据进行训练字典，然后用字典进行加速的方法。

我们利用了这一新的功能，在Lindorm构建LDFile的时候，先对数据进行采样训练，构建字典，然后在进行压缩。

在不同业务的数据测试中，我们最高获得了超过原生ZSTD算法100%的压缩比，这意味着我们可以为客户再节省50%的存储费用。

## HBase Serverless版，入门首选

阿里云HBase Serverless 版是基于Lindorm内核，使用Serverless架构构建的一套新型的HBase 服务。

阿里云HBase Serverless版真正把HBase变成了一个服务，用户无需提前规划资源，选择CPU，内存资源数量，购买集群。

在应对业务高峰，业务空间增长时，也无需进行扩容等复杂运维操作，在业务低谷时，也无需浪费闲置资源。

在使用过程中，用户可以完全根据当前业务量，按需购买请求量和空间资源即可。

使用阿里云HBase Serverless版本，用户就好像在使用一个无限资源的HBase集群，随时满足业务流量突然的变化，而同时只需要支付自己真正使用的那一部分资源的钱。


# 面向大客户的安全和多租户能力

Lindorm引擎内置了完整的用户名密码体系，提供多种级别的权限控制，并对每一次请求鉴权，防止未授权的数据访问，确保用户数据的访问安全。

同时，针对企业级大客户的诉求，Lindorm内置了Group，Quota限制等多租户隔离功能，保证企业中各个业务在使用同一个HBase集群时不会被相互影响，安全高效地共享同一个大数据平台。

## 用户和ACL体系

Lindorm内核提供一套简单易用的用户认证和ACL体系。

用户的认证只需要在配置中简单的填写用户名密码即可。

用户的密码在服务器端非明文存储，并且在认证过程中不会明文传输密码，即使验证过程的密文被拦截，用以认证的通信内容不可重复使用，无法被伪造。

Lindorm中有三个权限层级。Global，Namespace和Table。

这三者是相互覆盖的关系。

比如给user1赋予了Global的读写权限，则他就拥有了所有namespace下所有Table的读写权限。如果给user2赋予了Namespace1的读写权限，那么他会自动拥有Namespace1中所有表的读写权限。

## Group隔离

当多个用户或者业务在使用同一个HBase集群时，往往会存在资源争抢的问题。

一些重要的在线业务的读写，可能会被离线业务批量读写所影响。

而Group功能，则是HBase增强版（Lindorm）提供的用来解决多租户隔离问题的功能。

通过把RegionServer划分到不同的Group分组，每个分组上host不同的表，从而达到资源隔离的目的。

## Quota限流

Lindorm内核中内置了一套完整的Quota体系，来对各个用户的资源使用做限制。

对于每一个请求，Lindorm内核都有精确的计算所消耗的CU（Capacity Unit），CU会以实际消耗的资源来计算。

比如用户一个Scan请求，由于filter的存在，虽然返回的数据很少，但可能已经在RegionServer已经消耗大量的CPU和IO资源来过滤数据，这些真实资源的消耗，都会计算在CU里。

在把Lindorm当做一个大数据平台使用时，企业管理员可以先给不同业务分配不同的用户，然后通过Quota系统限制某个用户每秒的读CU不能超过多少，或者总的CU不能超过多少，从而限制用户占用过多的资源，影响其他用户。

同时，Quota限流也支持Namesapce级别和表级别限制。

# 拓展阅读

## 索引

[B+ Tree]()

## jvm

[ZGC]()

## 操作系统

Cache Line Padding

脏读缓存加速

## 压缩

节约存储空间，降低成本，提升性能。

# 参考资料

[每秒7亿次请求，阿里新一代数据库如何支撑？](https://mp.weixin.qq.com/s/I3FnP1JtY5QZCY2D3QioyQ)

* any list
{:toc}
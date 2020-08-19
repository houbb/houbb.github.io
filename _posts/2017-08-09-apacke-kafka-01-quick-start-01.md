---
layout: post
title:  Apache Kafka-01-kafka 快速开始
date:  2017-8-9 09:32:36 +0800
categories: [Apache]
tags: [apache, kafka, mq]
published: true
---

# Apache Kafka

[Kafka™](http://kafka.apache.org/)  is used for building real-time data pipelines and streaming apps. 
It is horizontally scalable, fault-tolerant, wicked fast, and runs in production in thousands of companies.

![kafka_diagram.png](https://kafka.apache.org/images/kafka_diagram.png)

# Introduction

## 分布式流平台

- Apache Kafka® is a distributed streaming platform. 具体指什么？

### 三大功能

流媒体平台有三个关键功能:

- 发布和订阅记录流，类似于消息队列或企业消息传递系统。

- 以容错持久的方式存储记录流。

- 在记录发生时处理记录流。

### 两大应用

Kafka通常用于两大类应用程序:

- 构建能够可靠地在系统或应用程序之间获取数据的实时流数据管道

- 构建转换或响应数据流的实时流应用程序

为了理解卡夫卡是如何做这些事情的，让我们深入探讨卡夫卡的能力。

### 概念

首先是一些概念:

- Kafka作为集群运行在一个或多个服务器上，可以跨多个数据中心。

- Kafka集群以名为主题的类别存储记录流。

- 每个记录由一个键、一个值和一个时间戳组成。

### 核心 API

Kafka有四个核心api:

- 生产者API允许应用程序将记录流发布到一个或多个Kafka主题。

- 使用者API允许应用程序订阅一个或多个主题，并处理生成给它们的记录流。

- Streams API允许应用程序充当流处理器，从一个或多个主题使用输入流，并将输出流生成一个或多个输出主题，从而有效地将输入流转换为输出流。

- 连接器API允许构建和运行可重用的生产者或消费者，将Kafka主题连接到现有的应用程序或数据系统。例如，到关系数据库的连接器可能捕获对表的每个更改。

![kafka-apis.png](https://kafka.apache.org/20/images/kafka-apis.png)

在Kafka中，客户机和服务器之间的通信是通过一个简单的、高性能的、与语言无关的TCP协议完成的。

该协议进行了版本控制，并与旧版本保持向后兼容。我们为Kafka提供Java客户端，但是客户端有多种语言可用。

## Topics and Logs

让我们首先深入了解Kafka提供的核心抽象记录流——主题。

主题是发布记录的类别或提要名称。卡夫卡的主题总是多订阅者;也就是说，主题可以有0个、1个或许多订阅了写入的数据的使用者。

对于每个主题，Kafka集群维护一个分区日志，如下所示:

![log_anatomy.png](https://kafka.apache.org/20/images/log_anatomy.png)

每个分区都是有序的、不可变的记录序列，并不断地附加到结构化提交日志中。

每个分区中的记录都被分配一个称为偏移量的连续id号，偏移量惟一地标识分区中的每个记录。

Kafka集群使用一个可配置的保留期持久地保存所有已发布的记录——不管它们是否被使用过。例如，如果保留策略设置为2天，那么在记录发布后的2天内，就可以使用它，之后就可以丢弃它以腾出空间。Kafka的性能相对于数据大小来说是稳定的，所以长时间存储数据不是问题。

![log_consumer.png](https://kafka.apache.org/20/images/log_consumer.png)

实际上，在每个使用者的基础上保留的唯一元数据是该使用者在日志中的偏移量或位置。

这个偏移量由使用者控制:通常情况下，使用者在读取记录时将线性推进其偏移量，但实际上，由于位置由使用者控制，因此它可以按照自己喜欢的顺序使用记录。例如，使用者可以重置到旧偏移量，以重新处理过去的数据，或者跳到最近的记录，从“现在”开始消费。

这种特性的组合意味着Kafka的消费者非常便宜——他们可以来来去去，而不会对集群或其他消费者造成太大影响。例如，您可以使用我们的命令行工具“跟踪”任何主题的内容，而不更改任何现有使用者使用的内容。

日志中的分区有多种用途。首先，它们允许日志扩展到适合单个服务器的大小。每个单独的分区必须适合承载它的服务器，但是一个主题可能有多个分区，所以它可以处理任意数量的数据。其次，它们作为并行度的单位——稍后会详细介绍。

## Distribution

日志的分区分布在Kafka集群中的服务器上，每个服务器处理数据和请求共享分区。

为了容错，每个分区被复制到多个可配置的服务器上。

每个分区都有一个充当“领导者”的服务器和零个或多个充当“跟随者”的服务器。

leader处理分区的所有读写请求，而follower被动地复制了leader。

如果领导者失败，其中一个追随者将自动成为新的领导者。每个服务器都充当它的一些分区的领导者和其他分区的跟随者，因此集群中的负载是平衡的。

## Geo-Replication

Kafka MirrorMaker为集群提供地理复制支持。

使用MirrorMaker，消息被复制到多个数据中心或云区域。

您可以在主动/被动场景中使用此功能进行备份和恢复;或者在活动/活动场景中，将数据放置到离用户更近的地方，或者支持数据本地需求。

## 生产者

生产者根据他们选择的主题发布数据。

生产者负责选择将哪个记录分配给主题中的哪个分区。这可以以循环方式完成，只是为了平衡负载，也可以根据语义配分函数(比如基于记录中的某个键)来完成。稍后将介绍分区的更多用法!

## 消费者

使用者用使用者组名称来标识自己，并且向主题发布的每个记录都被传递到每个订阅的使用者组中的一个使用者实例。

使用者实例可以在单独的进程中，也可以在单独的机器上。

如果所有使用者实例都具有相同的使用者组，则记录将有效地在使用者实例上进行负载平衡。

如果所有使用者实例都有不同的使用者组，则每个记录将广播到所有使用者进程。

![consumer-groups.png](https://kafka.apache.org/20/images/consumer-groups.png)

两个服务器Kafka集群承载4个分区(P0-P3)和两个消费者组。消费者组A有两个消费者实例，而B组有四个。

然而，更常见的是，我们发现主题有少量的消费群体，每个“逻辑订阅方”有一个消费群体。每个组由许多用于可伸缩性和容错的使用者实例组成。这只不过是发布-订阅语义，其中订阅者是一组消费者，而不是单个进程。

Kafka中实现消费的方法是将日志中的分区除以消费者实例，这样每个实例在任何时候都是“公平共享”的分区的唯一消费者。这个维护组成员关系的过程是由Kafka协议动态处理的。如果新实例加入组，它们将从组的其他成员手中接管一些分区;如果实例死亡，它的分区将被分配给其他实例。

Kafka只提供分区内的记录的总顺序，而不是主题中不同分区之间的顺序。对大多数应用程序来说，每个分区排序结合按键分区数据的能力就足够了。但是，如果您需要记录上的总订单，那么可以使用只有一个分区的主题来实现这一点，尽管这意味着每个使用者组只有一个使用者进程。

## 多租户(Multi-tenancy)

您可以将Kafka部署为多租户解决方案。通过配置哪些主题可以生成或使用数据，可以启用多租户。还有对配额的操作支持。管理员可以对控制客户机使用的代理资源的请求定义和强制配额。有关更多信息，请参阅安全文档。

## 担保(Guarantees)

卡夫卡在高水平上提供了以下保证:

由生产者发送到特定主题分区的消息将按发送顺序追加。也就是说，如果记录M1是由与记录M2相同的生产者发送的，并且M1是首先发送的，那么M1的偏移量将低于M2，并且在日志中出现得更早。

使用者实例看到的是记录存储在日志中的顺序。

对于复制因子N的主题，我们将容忍最多N-1服务器故障，而不会丢失提交到日志的任何记录。

关于这些保证的更多细节在文档的设计部分给出。

## 卡夫卡作为一个信息系统

Kafka的流概念与传统的企业消息传递系统相比如何?

消息传递传统上有两种模式: 排队和发布-订阅。

在队列中，一个使用者池可能从服务器读取数据，每个记录将被读入其中一个;在发布-订阅中，记录被广播给所有的消费者。

这两种型号各有优缺点。

排队的优势在于，它允许您在多个使用者实例上划分数据处理，从而可以扩展处理。不幸的是，队列不是多订阅的——一旦一个进程读取了它丢失的数据。发布-订阅允许您将数据广播到多个进程，但无法扩展处理，因为每个消息都发送到每个订阅服务器。

Kafka中的消费者组概念概括了这两个概念。与队列一样，使用者组允许您将处理划分为一组进程(使用者组的成员)。与发布-订阅一样，Kafka允许您向多个消费者组广播消息。

卡夫卡模型的优点是每个主题都有这两种特性——它可以扩展处理，也可以多订阅——不需要选择其中一种。

与传统的消息传递系统相比，Kafka有更强的排序保证。

传统队列在服务器上按顺序保留记录，如果多个使用者从队列中消费，那么服务器将按照存储记录的顺序分发记录。然而，尽管服务器按顺序分发记录，但记录是异步交付给使用者的，因此在不同的使用者上它们可能会出现无序。这实际上意味着在存在并行消费的情况下，记录的顺序会丢失。消息传递系统通常通过“独占使用者”的概念来解决这个问题，该概念只允许一个进程从队列中消费，但这当然意味着处理过程中没有并行性。

卡夫卡做得更好。通过在主题中具有并行性(分区)的概念，Kafka能够在一个消费者流程池中提供顺序保证和负载平衡。这是通过将主题中的分区分配给使用者组中的使用者来实现的，这样每个分区就被组中的一个使用者所使用。通过这样做，我们可以确保使用者是该分区的唯一读者，并按顺序使用数据。由于有许多分区，因此仍然可以在许多使用者实例上平衡负载。但是请注意，在一个使用者组中不能有比分区更多的使用者实例。

## 卡夫卡作为一个存储系统

任何允许发布消息与消费消息分离的消息队列都有效地充当了正在运行的消息的存储系统。Kafka的不同之处在于它是一个非常好的存储系统。

写入Kafka的数据被写入磁盘，并为容错进行复制。Kafka允许生产者等待确认，这样写就不会被认为是完整的，直到它被完全复制，并保证即使服务器被写入失败也能持久。

由于认真对待存储并允许客户端控制其读取位置，您可以将Kafka看作是一种特殊用途的分布式文件系统，专门用于高性能、低延迟的提交日志存储、复制和传播。

有关Kafka的提交日志存储和复制设计的详细信息，请[阅读本页](https://kafka.apache.org/documentation/#design)。

## 用于流处理的Kafka

仅仅读取、写入和存储数据流是不够的，其目的是实现数据流的实时处理。

在Kafka中，流处理器是从输入主题中获取连续的数据流，对这个输入执行一些处理，并产生连续的数据流来输出主题。

例如，零售应用程序可能接受销售和发货的输入流，并输出根据这些数据计算的重新订购和价格调整流。

可以直接使用生产者和消费者api进行简单的处理。但是对于更复杂的转换，Kafka提供了一个完整的流API。这允许构建执行非平凡处理的应用程序，这些应用程序可以从流计算聚合或将流连接到一起。

此功能有助于解决此类应用程序面临的难题:处理无序数据、在代码更改时重新处理输入、执行有状态计算等等。

streams API构建在Kafka提供的核心基元基础上:它使用生产者和消费者API进行输入，使用Kafka进行有状态存储，并使用相同的组机制在流处理器实例之间进行容错。

# 使用场景



## 用例

这是一个描述的一些流行的用例Apache卡夫卡®。

要了解这些领域的运作概况，请参阅这篇[博客文章](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)。

## 消息传递

Kafka可以很好地替代传统的消息代理。消息代理用于各种原因(从数据生产者分离处理、缓冲未处理的消息等)。与大多数消息传递系统相比，Kafka具有更好的吞吐量、内置的分区、复制和容错功能，这使它成为大规模消息处理应用程序的良好解决方案。
在我们的经验中，消息传递使用的吞吐量通常相对较低，但可能需要较低的端到端延迟，并且常常依赖于Kafka提供的强大的持久性保证。

在这个领域，Kafka可以与ActiveMQ或RabbitMQ等传统消息传递系统相媲美。

## 网站活动追踪

Kafka最初的用例是能够作为一组实时发布-订阅feed重新构建用户活动跟踪管道。

这意味着站点活动(页面视图、搜索或用户可能采取的其他操作)被发布到中心主题，每个活动类型有一个主题。

这些提要可用于订阅一系列用例，包括实时处理、实时监视和加载到Hadoop或离线数据仓库系统中以进行离线处理和报告。

活动跟踪通常是非常大的容量，因为为每个用户页面视图生成了许多活动消息。

## 指标

Kafka经常用于操作监控数据。这涉及到从分布式应用程序聚合统计信息，以生成集中的操作数据提要。

## 日志聚合

许多人使用Kafka作为日志聚合解决方案的替代品。日志聚合通常从服务器收集物理日志文件，并将它们放在中心位置(可能是文件服务器或HDFS)进行处理。

Kafka将文件的细节抽象出来，将日志或事件数据抽象成消息流。

这允许更低的延迟处理，更容易支持多个数据源和分布式数据消耗。

与以日志为中心的系统(如Scribe或Flume)相比，Kafka提供了同样好的性能、由于复制而更强的耐久性保证以及更低的端到端延迟。

## 流处理

Kafka处理管道中的许多用户处理数据，包括多个阶段，原始输入数据被从Kafka主题中消费，然后聚合、充实或以其他方式转换为新主题，以进一步消费或后续处理。例如，用于推荐新闻文章的处理管道可能会从RSS提要中抓取文章内容，并将其发布到“文章”主题;进一步的处理可能会将该内容规范化或删除，并将已清理的文章内容发布到新的主题;最后的处理阶段可能会尝试向用户推荐这些内容。这种处理管道基于各个主题创建实时数据流图。从0.10.0.0开始，Apache Kafka中提供了一个轻量级但功能强大的流处理库Kafka Streams来执行上述数据处理。除了Kafka流，其他的开源流处理工具包括Apache Storm和Apache Samza。

## Event Sourcing

[事件源](https://martinfowler.com/eaaDev/EventSourcing.html)是一种应用程序设计风格，其中状态更改被记录为时间顺序的记录序列。Kafka对非常大的存储日志数据的支持使它成为构建这种风格的应用程序的优秀后端。

## 提交日志

Kafka可以作为分布式系统的一种外部委托日志。

日志有助于在节点之间复制数据，并充当失败节点恢复数据的重新同步机制。

Kafka中的日志压缩特性有助于支持这种用法。

在这种用法中，Kafka类似于 [Apache BookKeeper](https://bookkeeper.apache.org/) 项目。

# 快速开始

## 测试环境

mac 

## Zookeeper 启动

- 基础知识介绍

[Zookeeper](https://houbb.github.io/2016/09/25/zookeeper)

- 启动服务

```
$   cd /Users/houbinbin/it/tools/zookeeper/server1/zookeeper-3.4.9/bin
$   sh zkServer.sh start
```

- 查看 status

```
$    jps

22180 QuorumPeerMain
4694 ReceiveLogsDirectError
22191 Jps
```

## 运行

- 下载

[下载](http://mirrors.shu.edu.cn/apache/kafka/1.1.1/kafka_2.11-1.1.1.tgz) V2.0.0 版本的 `kafka_2.11-1.1.1.tgz`。

解压并进入对应文件夹。

- 准备工作

确保 zookeeper 已经正常运行。

```
$ pwd
/Users/houbinbin/IT/tools/kafka/kafka_2.11-1.1.1
```

- 运行

```
$   bin/kafka-server-start.sh config/server.properties

...
[2018-09-19 14:34:28,045] INFO [TransactionCoordinator id=0] Starting up. (kafka.coordinator.transaction.TransactionCoordinator)
[2018-09-19 14:34:28,046] INFO [Transaction Marker Channel Manager 0]: Starting (kafka.coordinator.transaction.TransactionMarkerChannelManager)
[2018-09-19 14:34:28,046] INFO [TransactionCoordinator id=0] Startup complete. (kafka.coordinator.transaction.TransactionCoordinator)
[2018-09-19 14:34:28,072] INFO [/config/changes-event-process-thread]: Starting (kafka.common.ZkNodeChangeNotificationListener$ChangeEventProcessThread)
[2018-09-19 14:34:28,079] INFO [SocketServer brokerId=0] Started processors for 1 acceptors (kafka.network.SocketServer)
[2018-09-19 14:34:28,080] INFO Kafka version : 1.1.1 (org.apache.kafka.common.utils.AppInfoParser)
[2018-09-19 14:34:28,081] INFO Kafka commitId : 8e07427ffb493498 (org.apache.kafka.common.utils.AppInfoParser)
[2018-09-19 14:34:28,082] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
```

## 创建 Topic

让我们创建一个名为“test”的主题，只有一个分区和一个副本:

```
$   bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
```


如果我们运行列表主题命令，我们现在可以看到这个主题:

```
$   bin/kafka-topics.sh --list --zookeeper localhost:2181

test
```

或者，您也可以将代理配置为在发布不存在的主题时自动创建主题，而不是手动创建主题。

## 发送消息

Kafka附带一个命令行客户机，它将从文件或标准输入中获取输入，并将其作为消息发送到Kafka集群。默认情况下，每一行都将作为单独的消息发送。

运行生产者，然后在控制台输入一些消息发送到服务器。

```
$ bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test
>This is a message
This is another message
>>hello kafka
```

ps: 其中前两句是默认就有的两个消息。

## 创建消费者

Kafka还有一个命令行使用者，它会将消息转储到标准输出。

```
$ bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test --from-beginning
This is a message
This is another message
hello kafka
```

如果上面的每个命令都在不同的终端中运行，那么现在您应该能够在生产者终端中键入消息，并看到它们出现在消费者终端中。

所有命令行工具都有其他选项;不带参数地运行命令将更详细地显示记录它们的用法信息。


# Windows 失败尝试

(此时测试环境为 windows)

一、Download and Unzip

[Download](http://kafka.apache.org/downloads) the zip file and then unzip at any place you like.

二、Start Server

1、依赖于 [ZooKeeper](https://zookeeper.apache.org/doc/r3.4.10/zookeeperStarted.html), 所以需要安装配置好并启动.

启动 zookeeper;

2、启动 kafka

```
.\bin\windows\kafka-server-start.bat .\config\server.properties
```

<label class="label label-danger">Error</label>

```
[D:\Learn\apache\kafka\kafka-0.11.0.0-src]$ .\bin\windows\kafka-server-start.bat .\config\server.properties
命令语法不正确。
错误: 找不到或无法加载主类 kafka.Kafka
```

几种方式都尝试了，依然失败！


# 其他分布式队列

[NSQ](https://nsq.io/)

[Celery](http://docs.celeryproject.org/en/latest/)

[Kue](https://github.com/Automattic/kue)

# 参考文档

- zookeeper

[zookeeper 安装 windows环境](http://blog.csdn.net/morning99/article/details/40426133)

- kafka

[入门简介](http://blog.csdn.net/tangdong3415/article/details/53432166)

[Kafka集群配置---Windows版](http://blog.csdn.net/u013132051/article/details/68925935)

[windows kafka安装及问题解决](http://blog.csdn.net/yuebao1991/article/details/72771599)

* any list
{:toc}


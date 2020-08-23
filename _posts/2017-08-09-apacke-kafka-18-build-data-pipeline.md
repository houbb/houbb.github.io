---
layout: post
title:  Apache Kafka-18-kafka 构建数据管道
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: false
---

# 应用场景

在使用Kafka构建数据管道时，通常有两种使用场景：

第一种，把Kafka作为数据管道的两个端点之一，例如，把Kafka里的数据移动到S3上、或者把MongoDB里的数据移动到Kafka里；

第二种，把Kafka作为数据管道两个端点的中间媒介，例如，为了把Twitter的数据移动到ElasticSearch上，需要先把它们移动到Kafka里，再将它们从Kafka移动到ElasticSearch 上.

LinkedIn和其他一些大公司都将Kafka用在上述两种场景中，后来，我们在0.9版本的Kafka里增加了Kafka Connect(以下简称Connect)。

我们注意到，企业在将Kafka与数据管道进行集成时总会碰到一些特定的问题，所以决定往Kafka里增加一些API来帮助他们解决这些问题，而不是等着他们提出这些问题。

Kafka为数据管道带来的主要价值在于，它可以**作为数据管道各个数据段之间的大型缓冲区，有效地解耦管道数据的生产者和消费者**。

Kafka的解耦能力以及在安全和效率方面的可靠性，使它成为构建数据管道的最佳选择。

## 数据集成的场景

有些组织把Kafka看成是数据管道的一个端点，他们会想“我怎么才能把数据从Kafka移到ElasicSearch里"。

这么想是理所当然的——特别是当你需要的数据在到达ElasticSearch之前还停留在Kafka里的时候，其实我们也是这么想的。

不过我们要讨论的是如何在更大的场景里使用Kafka，这些场景至少包含两个端点(可能会更多)，而且这些端点都不是Kafka。

对于那些面临数据集成问题的人来说，我们建议他们从大局考虑问题，而不只是把注意力集中在少量的端点上。

过度聚焦在短期问题上，只会增加后期维护的复杂性，付出更高的成本。

本章将讨论在构建数据管道时需要考虑的几个常见问题。

这些问题并非Kafka独有，它们都是与数据集成相关的一般性问题。

我们将解释为什么可以使用Kafka进行数据集成，以及它是如何解决这些问题的，我们将讨论Connect API与普通的客户端API(Producer和Consumer)之间的区别，以及这些客户端API分别适合在什么情况下使用。

然后我们会介绍Connect。Conneet的完整手册不在本章的讨论范围之内，不过我们会举几个例子来帮助你人门，而且会告诉你可以从哪里了解到更多关于Connect的信息

。最后介绍其他数据集成系统，以及如何将它们与Kafka集成起来。

# 构建数据管道时需要考虑的问题

本书不打算讲解所有有关构建数据管道的细节，我们会着重讨论在集成多个系统时需要考虑的几个最重要的问题。

## 及时性

有些系统希望每天一次性地接收大量数据，而有些则希望在数据生成几毫秒之内就能拿到它们。

大部分数据管道介于这两者之间。一个好的数据集成系统能够很好地支持数据管道的各种及时性需求，而且在业务需求发生变更时，具有不同及时性需求的数据表之间可以方便地进行迁移，Kafka作为一个基于流的数据平台，提供了可靠且可伸缩的数据存储，可以支持几近实时的数据管道和基于小时的批处理。

生产者可以频繁地向Kafka写入数据，也可以按需写入；消费者可以在数据到达的第一时间读取它们，也可以每隔一段时间读取一次积压的数据。

Kafka在这里扮演了一个大型缓冲区的角色，降低了生产者和消费者之间的时间敏感度。

实时的生产者和基于批处理的消费者可以同时存在，也可以任意组合。

实现回压策略也因此变得更加容易，Kafka本身就使用了回压策略(必要时可以延后向生产者发送确认)，消费速率完全取决于消费者自己。

## 可靠性

我们要避免单点故障，并能够自动从各种故障中快速恢复。

数据通过数据管道到达业务系统，哪怕出现几秒钟的故障，也会造成灾难性的影响，对于那些要求毫秒级的及时性系统来说尤为如此。

数据传递保证是可靠性的另一个重要因素。

有些系统允许数据丢失，不过在大多数情况下，它们要求至少一次传递。也就是说，源系统的每一个事件都必须到达目的地，不过有时候需要进行重试，而重试可能造成重复传递。有些系统甚至要求仅一次传递——源系统的每一个事件都必须到达目的地，不允许丢失，也不允许重复。

我们已经在第6章深入讨论了Kafka的可用性和可靠性保证。

Kafka本身就支持“至少一次传递"，如果再结合具有事务模型或唯一键特性的外部存储系统，Kafka也能实现“仅一次传递"。因为大部分的端点都是数据存储系统，它们提供了“仅一次传递"的原语支持，所以基于Kafka的数据管道也能实现“仅一次传递"，值得一提的是，Connect API为集成外部系统提供了处理偏移量的API，连接器因此可以构建仅一次传递的端到端数据管道。

实际上，很多开源的连接器都支持仅一次传递。

## 高吞吐量和动态吞吐量

为了满足现代数据系统的要求，数据管道需要支持非常高的吞吐量。更重要的是，在某些情况下，数据管道还需要能够应对突发的吞吐量增长。

由于我们将Kafka作为生产者和消费者之间的缓冲区，消费者的吞吐量和生产者的吞吐量就不会耦合在一起了。

我们也不再需要实现复杂的回压机制，如果生产者的吞吐量超过了消费者的吞吐量，可以把数据积压在Kafka里，等待消费者追赶上来。通过增加额外的消费者或生产者可以实现Kafka的伸缩，因此我们可以在数据管道的任何一边进行动态的伸缩，以便满足持续变化的需求。

因为Kafka是一个高吞吐量的分布式系统，一个适当规模的集群每秒钟可以处理数百兆的数据，所以根本无需担心数据管道无法满足伸缩性需求。

另外，ConnectAPI不仅支持伸缩，而且擅长并行处理任务。稍后，我们将会介绍数据源和数据池(DataSink)如何在多个线程间拆分任务，最大限度地利用CPU资源，哪怕是运行在单台机器上。

Kaka支持多种类型的压缩，在增长吞吐量时，Kafka用户和管理员可以通过压缩来调整网络和存储资源的使用。

## 数据格式

数据管道需要协调各种数据格式和数据类型，这是数据管道的一个非常重要的因素。数据类型取决于不同的数据库和数据存储系统。

你可能会通过Avro将XML或关系型数据加载到Kafka里，然后将它们转成JSON写入ElasticSearch，或者转成Parquet写入HDFS，或者转成CSV写入S3。

Kafka和Connect API与数据格式无关。

我们已经在之前的章节介绍过，生产者和消费者可以使用各种序列化器来表示任意格式的数据。

Connect API有自己的内存对象模型，包括数据类型和schema，不过，可以使用一些可插拔的转换器将这些对象保存成任意的格式，也就是说，不管数据是什么格式的，都不会限制我们使用连接器。

很多数据源和数据池都有schema，我们从数据源读取schema，把它们保存起来，并用它们验证数据格式的兼容性，甚至用它们更新数据池的schema。

从MySQL到Hive的数据管道就是一个很好的例子。如果有人在MySQL里增加了一个字段，那么在加载数据时，数据管道可以保证Hive里也添加了相应的字段。

另外，数据池连接器将Kafka的数据写入外部系统，因此需要负责处理数据格式。

有些连接器把数据格式的处理做成可插拔的，比如HDFS的连接器就支持Avro和Parquet。

通用的数据集成框架不仅要支持各种不同的数据类型，而且要处理好不同数据源和数据池之间的行为差异。

例如，在关系型数据库向Syslog发起抓取数据请求时，Syslog会将数据推送给它们，而HDFS只支持追加写入模式，只能向HDFS写入新数据，而对于其他很多系统来说，既可以追加数据，也可以更新已有的数据。

## 转换

数据转换比其他需求更具争议性。

数据管道的构建可以分为两大阵营，即ETL和ELT。

### ETL

ETL表示提取一转换一加载(Extract-Transform-Load)，也就是说，当数据流经数据管道时，数据管道会负责处理它们。

这种方式为我们节省了时间和存储空间，因为不需要经过保存数据、修改数据、再保存数据这样的过程。不过，这种好处也要视情况而定。

有时候，这种方式会给我们带来实实在在的好处，但也有可能给数据管道造成不适当的计算和存储负担。

这种方式有一个明显不足，就是数据的转换会给数据管道下游的应用造成一些限制，特别是当下游的应用希望对数据进行进一步处理的时候。

假设有人在MongoDB和MySQL之间建立了数据管道，并且过滤掉了一些事件记录，或者移除了一些字段，那么下游应用从MySQL中访问到的数据是不完整的。如果它们想要访向被移除的字段，只能重新构建管道，并重新处理历史数据(如果可能的话)。

### ELT

ELT表示提取-加载-转换(Extract-Load-Transform)。在这种模式下，数据管道只做少量的转换(主要是数据类型转换)，确保到达数据池的数据尽可能地与数据源保持一致。

这种情况也被称为高保真(highfidelity)数据管道或数据湖(datalake)架构。目标系统收集“原始数据"，并负责处理它们。这种方式为目标系统的用户提供了最大的灵活性，因为它们可以访问到完整的数据。在这些系统里诊断问题也变得更加容易，因为数据被集中在同一个系统里进行处理，而不是分散在数据管道和其他应用里。这种方式的不足在于，数据的转换占用了目标系统太多的CPU和存储资源。有时候，目标系统造价高昂，如果有可能，人们希望能够将计算任务移出这些系统。

## 安全性

安全性是人们一直关心的问题。

对于数据管道的安全性来说，人们主要关心如下几个方面。

- 我们能否保证流经数据管道的数据是经过加密的?这是跨数据中心数据管道通常需要考虑的一个主要方面。

- 谁能够修改数据管道?

- 如果数据管道需要从一个不受信任的位置读取或写入数据，是否有适当的认证机制?

Kafka支持加密传输数据，从数据源到Kafka，再从Kafka到数据池。它还支持认证(通过SASL来实现)和授权，所以你可以确信，如果一个主题包含了敏感信息，在不经授权的情况下，数据是不会流到不安全的系统里的。Kafka还提供了审计日志用于跟踪访问记录。通过编写额外的代码，还可能跟踪到每个事件的来源和事件的修改者，从而在每个记录之间建立起整体的联系。

## 故障处理能力

我们不能总是假设数据是完美的，而要事先做好应对故障的准备。

能否总是把缺损的数据挡在数据管道之外?

能否恢复无法解析的记录?

能否修复(或许可以手动进行)并重新处理缺损的数据?

如果在若干天之后才发现原先看起来正常的数据其实是缺损数据，该怎么办?

因为Kafka会长时间地保留数据，所以我们可以在适当的时候回过头来**重新处理出错的数据**。

## 耦合性和灵活性

数据管道最重要的作用之一是解耦数据源和数据池。它们在很多情况下可能发生耦合。

### 临时数据管道

有些公司为每一对应用程序建立单独的数据管道。

例如，他们使用Logstash向ElasticSearch导人日志，使用Flume向HDFS导人日志，使用GoldenGate将Oracle的数据导到HDFS，使用Informatica将MySQL的数据或XML导到Oracle，等等。

他们将数据管道与特定的端点耦合起来，并创建了大量的集成点，需要额外的部署、维护和监控。

当有新的系统加入时，他们需要构建额外的数据管道，从而增加了采用新技术的成本，同时遏制了创新。

### 元数据丢失

如果数据管道没有保留schema元数据，而且不允许schema发生变更，那么最终会导致生产者和消费者之间发生紧密的耦合。

没有了schema，生产者和消费者需要额外的信息来解析数据。

假设数据从Oracle流向HDFS，如果DBA在Oracle里添加了一个字段，而且没有保留schema信息，也不允许修改schema，那么从HDFS读取数据时可能会发生错误，因此需要双方的开发人员同时升级应用程序才能解决这个问题。

不管是哪一种情况，它们的解决方案都不具备灵活性。

如果数据管道允许schema发生变更，应用程序各方就可以修改自己的代码，无需担心对整个系统造成破坏。

### 末端处理

我们在讨论数据转换时就已提到，数据管道难免要做一些数据处理。

在不同的系统之间移动数据肯定会碰到不同的数据格式和不同的应用场景。

不过，如果数据管道过多地处理数据，那么就会给下游的系统造成一些限制。

在构建数据管道时所做的设计决定都会对下游的系统造成束缚，比如应该保留哪些字段或应该如何聚合数据，等等。

如果下游的系统有新的需求，那么数据管道就要作出相应的变更，这种方式不仅不灵活，而且低效、不安全。

更为灵活的方式是尽量保留原始数据的完整性，让下游的应用自己决定如何处理和聚合数据。


# 如何在Connect API和客户端API之间作出选择

在向Kafka写入数据或从Kafka读取数据时，要么使用传统的生产者和消费者客户端，就像第3章和第4章所描述的那样，要么使用后面即将介绍的Connect API和连接器。

在具体介绍Connec tAPI之前，我们不妨先问自己一个问题：“什么时候适合用哪一个?"

我们知道，Kafka客户端是要被内嵌到应用程序里的，应用程序使用它们向Kafka写入数据或从Kafka读取数据。

如果你是开发人员，你会使用Kafka客户端将应用程序连接到Kafka，并修改应用程序的代码，将数据推送到Kafka或者从Kafka读取数据。

如果要将Kafka连接到数据存储系统，可以使用Connect，因为这些系统不是你开发的，

你无法或者也不想修改它们的代码。

Connect可以用于从外部数据存储系统读取数据，或者将数据推送到外部存储系统。如果数据存储系统提供了相应的连接器，那么非开发人员就可以通过配置连接器的方式来使用Connect。

如果你要连接的数据存储系统没有相应的连接器，那么可以考虑使用客户端API或ConnectAPI开发一个应用程序。

我们建议首选Connect，因为它提供了一些开箱即用的特性，比如配置管理、偏移量存储、并行处理、错误处理，而且支持多种数据类型和标准的REST管理API。

开发一个连接Kafka和外部数据存储系统的小应用程序看起来很简单，但其实还有很多细节需要处理，比如数据类型和配置选项，这些无疑加大了开发的复杂性——Connect处理了大部分细节，让你可以专注于数据的传输。

#  Kafka Connect

Connect是Kafka的一部分，它为在Kafka和外部数据存储系统之间移动数据提供了一种可靠且可伸缩的方式。

它为连接器插件提供了一组API和一个运行时——Connect负责运行这些插件，它们则负责移动数据。

Connect以worker进程集群的方式运行，我们基于worker进程安装连接器插件，然后使用RESTAPI来管理和配置connector，这些worker进程都是长时间持续运行的作业。

连接器启动额外的task，有效地利用工作节点的资源，以并行的方式移动大量的数据。数据源的连接器负责从源系统读取数据，并把数据对象提供给worker进程。

数据池的连接器负责从worker进程获取数据，并把它们写入目标系统。

Connect通过connector在Kafka里存储不同格式的数据。

Kafka支持JSON，而且Confluent Schema Registry提供了Avro转换器。

开发人员可以选择数据的存储格式，这些完全独立于他们所使用的连接器。

本章的内容无法完全覆盖Connect的所有细节和各种连接器，这些内容可以单独写成一本书。不过，我们会提供Connect的概览，还会介绍如何使用它，并提供一些额外的参考资料。

## 运行 Connect

Connect随着Kafka一起发布，所以无需单独安装。

如果你打算在生产环境使用Connect来移动大量的数据，或者打算运行多个连接器，那么最好把Connect部署在独立于broker的服务器上。

在所有的机器上安装Kafka，并在部分服务器上启动broker，然后在其他服务器上启动Connect。

启动Connect进程与启动broker差不多，在调用脚本时传入一个属性文件即可。

```
bin/connect-distributed.sh config/connect-distributed.properttes
```
    

### 重要参数

Connect进程有以下几个重要的配置参数。

- bootstrap.servers

该参数列出了将要与Connect协同工作的broker服务器，连接器将会向这些broker写入数据或者从它们那里读取数据。你不需要指定集群所有的broker，不过建议至少指定3个。

- group.id：

具有相同groupid的worker属于同一个Connect集群。

集群的连接器和它们的任务可以运行在任意一个worker上。

- key.converter 和 value.converter： 

Connect 可以处理存储在 kafka 不同格式的数据。

这两个参数分别指定了消息的键和值所使用的转换器。

默认使用Kafka提供的 JSONConverter有些转换器还包含了特定的配置参数。

例如，通过将key.converter.schema.enable设置成true或者false来指定JSON消息是否可以包含schema。

值转换器也有类似的配置，不过它的参数名是value.converter.schena.enable，Avro消息也包含了schema，不过需要通过 key.converter.schema.registry.url 和 value.converter.schema.registry.url 来指定 Schema Registry 的位置。 

我们一般通过Connect的RESTAPI来配置和监控rest.host.name和rest.port连接器。

你可以为RESTAPI指定特定的端口。

在启动worker集群之后，可以通过RESTAPI来验证它们是否运行正常。

```
gwen$ curl http//localhost：8083/
("version"："0.10.1.0-SNAPSHOT"， "connect"："561f45d747cd2a8c"]
```

这个RESTURI应该要返回当前Connect的版本号。我运行的是Kafka0.10.1.0(预发行)快照版本，我们还可以检查已经安装好的连接器插件：

```
gwenS curl http：//localhost：8083/connector-plugins 
[("class"： "org.apache.kafka.connect.file.FileStreamSourceConnector")， ("class"："org.apache.kafka.connect.file.FtleStreanSinkConnector")]
```

我运行的是最简单的Kafka，所以只有文件数据源和文件数据池两种插件可用。

让我们先来看看如何配置和使用这些内置的连接器，然后再提供一些使用外部数据存储系统的高级示例。

### 单机模式

要注意，Connect也支持单机模式。单机模式与分布式模式类似，只是在启动时使用bin/connect-standalone.sh代替bin/connect-dtstrtbuted.sh，也可以通过命令行传人连接器的配置文件，这样就不需要使用RESTAPI了，在单机模式下，所有的连接器和任务都运行在单独的worker进程上。

单机模式使用起来更简单，特别是在开发和诊断问题的时候，或者是在需要让连接器和任务运行在某台特定机器上的时候(比如Syslog连接器会监听某个端口，所以你需要知道它运行在哪台机器上)。

## 连接器示例——文件数据源和文件数据池

这个例子使用了文件连接器和JSON转换器，它们都是Kafka自带的。

接下来要确保Zookeeper和Kafka都处于运行状态。

首先启动一个分布式的worker进程。

为了实现高可用性，真实的生产环境一般需要至少2~3个worker集群，不过在这个例子里，我们只启动1个。

```
bin/connect-distributed.sh config/connect-distributed.properttes &
```

现在开始启动一个文件数据源。

为了方便，直接让它读取Kafka的配置文件——把Kafka的配置文件内容发送到主题上。

```
echo '("nane"："Load-kafka-config"， "config"：("connector.class"："FileStrean： Source"，"flle"："config/server.properttes"，"toptc"："kafka-config-toptc"))' I curl -X POST -d @- http：//localhost：8883/connectors --header "content- Type：application/json"

 ("nane"："Load-kafka-config"， "config"：("connector.class"："FileStrean- Source"，"file"："config/server.properties"，"toptc"： "kafka-config-
    toptc"， "nane"："load-kafka-config")，"tasks"：[])
```

我写了一个JSON片段，里面包含了连接器的名字load-kafka-config和连接器的配置信息，配置信息包含了连接器的类名、需要加载的文件名和主题的名字。
下面通过Kafka的控制台消费者来验证配置文件是否已经被加到主题上了： 

```
gwen$ bin/kafka-console-consumer.sh --new --bootstrap-server=localhost：9892 - topic kafka-config-topic --from-beginning 
```

如果一切正常，可以看到如下的输出：

```
("schena"：("type"："string"，"optional"：false)，"payload"："# Licensed to the Apache Software Foundation (ASF) under one or nore")
<省略部分>
("schena"：("type"："string"， "optional"：false)，"pay-
load"："8888888888##8888888883898888 Server Bastcs
####8888########088#########")
("schema"：("type"："strtng"，"optional"；false)， "payload"：12
("schena"：("type"："string"，"optional"：false)，"payload"："# The id of the broker. This nust be set to a unique integer for each broker.")
("schena"：("type"："string"， "optional"：false)，"payload"："broker.id=0") ("schena"：("type"："string"， "optional"：false)，"payload"："")
<省略部分>
```

以上输出的是config/server.properties文件的内容，这些内容被一行一行地转成JSON记录，并被连接器发送到kafka-config-topic主题上。

默认情况下，JSON转换器会在每个记录里附带上schema。这里的schema非常简单——只有一个payLoad列，它是字符串类型，并且包含了文件里的一行内容。

现在使用文件数据池的转换器把主题里的内容导到文件里。导出的文件内容应该与原始server.properties文件的内容完全一样，JSON转化器将会把每个JSON记录转成单行文本。

```
echo '["name"："dunp-kafka-config"， "config"：
("connector.class"："FileStreanSink"， "ftle"："copy-of-server- 
properttest， "toptcs"i"kafka-conftg-topte"))' l curt x POST -d 8- http：//local. host：8883/connectors •header "content-Type：appltcation/json"
("nane"： "dump-kafka-conftg"，"config"： 
("connector.class"："FileStreanSink"， "ftle"："copy-of-server-
properties"，"toptcs"："kafka-conftg-toptc"， "nane"： "dunp-kafka-config")，"tasks"： [])
```

这次的配置发生了变化：我们使用了类名FileStreanSink，而不是FileStreanSource；文件属性指向目标文件，而不是原先的文件；我们指定了topics，而不是topic。

可以使用数据池将多个主题写人一个文件，而一个数据源只允许被写人一个主题。

如果一切正常，你会得到一个叫作copy-of-server-properties的文件，该文件的内容与 conftg/server.properties %-#.

如果要删除一个连接器，可以运行下面的命令：

```
curl -X DELETE http：//localhost：8883/connectors/dump-kafka-config
```

在删除连接器之后，如果查看Conneet的日志，你会发现其他的连接器会重启它们的任务，这是为了在worker进程间平衡剩余的任务，确保删除连接器之后可以保持负载的均衡。


## 连接器示例——从MySQL到ElasticSearch

接下来，我们要做一些更有用的事情。

这次，我们将一个MySQL的表数据导入到一个Kafka主题上，再将它们加载到ElasticSearch里，然后对它们的内容进行索引。

我是在自己的Mac笔记本上运行测试的，使用了下面的命令来安装MySQL和ElasticSearch： 

```
brew install mysql
brew install elasticsearch 
```

下一步要确保已经有可用的连接器。

如果使用的是ConffuentOpenSource，这个平台已经包含了相关的连接器，否则就要从GitHub上下载和安装。

(1) 打开网页 https//github.com/confluentinc/kafka-connect-clasticsearch. 
(2) 把代码复制到本地。
(3) 使用 mvn install 来构建项目。
(4) 按照相同的步骤安装JDBC连接器：https://github.com/confluentine/kafka-connectdbe，接下来把每个target目录下生成的JAR包复制到Connect的类路径中。

```
gwen$ mkdir libs 
gwen$ cp ../kafka-connect-jdbc/target/kafka-connect-jdbc-3.1.8-SNAPSHOT.jar  1ibs/ 
gwen$ cp .，/kafka-connect-elasticsearch/target/kafka-connect-elasttcsearch-3.2.0-SNAPSHOT-package/share/java/kafka-connect-elasttcsearch/* 1ibs/
```

如果worker进程还没有启动，需要先启动它们，然后检查新的连接器插件是否已经安装成功：

```
gwen$ bin/connect-distributed.sh conftg/connect-distributed.properttes & gwen$ curl http：//localhost：8083/connector-plugins
 [("class"： "org.apache.kafka.connect.ftle.FtleStreanSourceConnector")，  ("class"："to.confluent.connect.elasticsearch，ElasttcsearchSinkConnector")， ("class"："org.apache.kafka.connect.file.FtleStreanSinkConnector")，
    (["class"："to.confluent.connect.jdbc.JdbcSourceConnector")) 
```

从上面的输出可以看到，新的连接器插件已经安装成功了。JDBC连接器还需要一个MySQL驱动程序。

我们从Oracle网站下载了一个MySQL的JDBC驱动程序，井将其解压，然后把rysql-connector-java-5.1.40-bin.jar复制到libs/目录下。

下一步要在MySQL里创建一张表，可以使用JDBC连接器将其以流的方式发送给Kafka 

```
gwen$ nysql.server restart

nysql> create database test； 
Query OK， 1 row affected (0.00 sec)

nysql> use test；
Database changed 

mysql> create table login (username varchar(30)， login_tine datetine)； Query OK， 0 rows affected (0.02 sec)
nysql> insert into login values ('gwenshap'， now())； 
Query OK， 1 row affected (0.01 sec)

nysql> tnsert into login valves ('tpalino'， now())；
Query OK， 1 row affected (0.E0 sec)

mysql> cormit；
    Query OK， O rows affected (0.01 sec)
```

我们创建了一个数据库和一张表，并插入了一些测试数据

接下来要配置JDBC连接器。可以从文档中找到所有可用的配置项，也可以通过RESTAPI找到它们：

```
gwenS curl -X PUT -d "()" Localhost：8883/connector-plugins/JdbcSourceConnector/ conftg/validate --header "content-Type：application/json" 1 python -n json.tool
"configs"： [
"definttton"： (
"default_value"： ""，
 "dependents"： D]，
 "dtsplay_nane"： "Timestanp Column Nane"，
 -8.20htatt6. the hane .f the ttrestarp colurn to use
 to detect new or nodified rows. This colunn may not be
 nullable."， 
 "group"： "Mode"，
 "importance"： "MEDIUM"， 
 "nane"： "tinestamp.colunn.nane"，
 "order"： 3， 
 "requtred"： false， 
 "type"： "STRING"，
    "width"： "MEDIUM"
)，
<省略部分>
```

我们向RESTAPI发起验证连接器的请求，并传给它一个空的配置，得到的是所有可用的配置项，并以JSON的格式返回。

为了方便阅读，下面使用Python对JSON进行了格式化。

有了这些信息，就可以创建和配置JDBC连接器了：

```
echo '("name"："mysql-Logtn-connector"， "conftg"：("connector.class"： "JdbcSource- Connector"，"connectton.url"："jdbc：mysql：//127.0.0.1：3306/test? 
 date. non.null"：false，"timestamp.column.nane"： "login_tine"，"topic.pre- fix"："mysql."))' I curl -X POST -d @- http：//localhost：8083/connectors --header "content-Type：application/json"
 ("name"："mysql-login-connector"， "config"：("connector.class"："JdbcSourceConnec- tor"，"connection.url"："jdbc：mysql：//127.0.0.1：3366/test? 
 user=root"，"mode"： "timestamp"， "table.whitelist"："Login"，"validate.non.null"："fal se"，"timestanp.column.name"："logtn_time"， "topic.preftx"："mysql."，"name"："mysql- login-connector")，"tasks"：[]) 
```

为了确保连接器工作正常，我们从nysql.Login主题上读取数据。

```
gwen$ bin/kafka-console-consuner.sh --new --bootstrap-server=localhost：9092 --  topic mysql.login --from-beginning 
<省略部分>
 ["schena"：("type"："struct"，"ftelds"： 
 [f"type"："strtng"，"optional"：true，"field"： "usernane")， 
("type"："tnt64"，"optional"：true， "nane"： "org.apache.kafka.connect.data.Time-  stanp"，"verston"：1，"fteld"："login_time")]， "optional"：false，"nane"： "logtn")，"pay- load"：("usernane"： "gwenshap"， "login_tine"：1476423962000)) 
 ("schena"：("type"："struct"，"ftelds"： 
[("type"："string"，"optional"：true，"field"："usernane")， 
 ("type"："tnt64"，"optional"：true，"nane"："org.apache.kafka.connect.data.Time- stanp"，"version"：1，"field"： "login_tine")]， "optional"：false，"name"："login")，"pay- Load" ：["usernane"："tpalino"， "login_tine"：1476423981000)) 
```

如果得到一个“主题不存在"的错误信息，或者看不到任何数据，可以检查一下Connect的日志。

```
[2016-10-1619：39：40，482] ERROR Error while starting connector mysql-login-connector (org.apache.kafka.connect.runtime.WorkerConnector：108) 
org.apache.kafka.connect.errors.ConnectExceptton： java.sql.SQLExceptton： Access  denied for user 'root；'@'localhost' (using password： NO)
    at to.confluent.connect.jdbc.JdbcSourceConnector.start(JdbcSourceConnector.java：78)
```

我反复尝试了几次才找到正确的连接串。如果还有其他问题，请检查类路径里是否包含了驱动程序，或者是否有数据表的读取权限。

你会看到，在连接器运行期间，向login表插入的数据会立即出现在mysql.Login主题上。

把数据从MySQL移动到Kafka里就算完成了，接下来把数据从Kafka写到ElasticSearch里，这个会更有意思。

首先启动ElasticSearch，并验证是否访间本地端口：

```
gwen$ elasticsearch & 
gwen$ curl http：//localhost：9280/
  "name" ： "Hammerhead"， 
 "cluster_name" ： "elasticsearch_gwen"， 
 "cluster_uuid" ： "42D5GrxOQFebf83DYgNl-g" 
 "verston".：..
“nunber*：“2.4.1，
 "build_hash" ： "c67dc32e24162035d18d6fe1e952c4cbcbe79d16"，
 "butld_ttmestamp" ： "2016-89-27T18：57：55Z"， 
 "build_snapshot" ： false，
 "Lucene_version" ： "5.5.2'
    tagline" ： "You Know， for Search"
```

下面启动连接器：

```
echo ("nane"： "elasttc-login-connector"， "config"：("connector.class"："Elasttc- searchSinkConnector"，"connection.url"："http：//localhost：
 9200"，"type.nane"："mysql-data"，"topics"："mysql.login"，"key.ignore"：true))' I curl -X POST -d @- http：//localhost：8083/connectors --header "content- Type：application/json" 
 ("nane"："elasttc-login-connector"， "config" ：("connector.class"："Elasticsearch- SinkConnector"， "connectton.url"："http：//localhost：920D"，"type.name"："mysqldata"，" toptcs"："mysql.login"， "key.tgnore"："true"，"nane"："elasttc-logtnconnector")， "tasks"：[("connector"："elastic-Logtn-connector"， "task"：0)])
```

这里有一些配置项需要解释一下。connection.url是本地ElasticSearch服务器的地址。

默认情况下，每个Kafka主题对应ElasticSearch里的一个索引，主题的名字与索引的名字相同。我们需要在主题内为即将写入的数据定义好类别。我们假设所有数据属于同一种类别，所以硬编码了一个类别type.nane=nysql-data。

只有nysqL.Login主题里的数据会被写人ElasticSearch。另外，在创建MySQL数据表时没有为其指定主键，而Kafka数据的键是null，所以要让ElasticSearch连接器使用主题名字、分区id和偏移量作为数据的键。

同时，需要把key.tgnore设置为true。

先来验证是否已经为nysqL.Login主题的数据创建好索引了。

```
gwen$ curl 'localhost：9200/_cat/indices?v'
 health status index   pri rep docs.count docs.deleted store.size
 pri.store.size
 yellow open mysql.login 5  1 
    0 10.7kb
10.7kb 
```
如果索引还没有创建好，可以检查一下Connect的日志。如果出现错误，一般都是因为缺少配置项或依赖包，如果一切正常，就可以查询到索引数据了。

```
gwen$ curl -s -X "GET" "http：//localhost：9280/mysql.logtn/_search?pretty=true" "took"  ： 29， 
 "tined_out" ： false，
"_shards" ： (
 "total" ： 5，
 "successful" ： 5， 
 "fatled" ： 0 
)，
"hits" ： (
“total"：3，
 "max_score" ： 1.0， 
 "hits" ： [ (
 "_index" ： "mysql.Login"， 
 "_type" ： "mysql-data"， 
"_id" ： "nysql.login+0+1"，
 "_score" ： 1.0，
 "_source" ： ( 
"usernane" ； "tpalino"， 
    "logtn_tine" ： 1476423981000 
)，
    _tndex" ： "mysql.login"， 
I-type" ： "nysql-data"， 
titd" ： "nysql.login+0+2"， 
^_score" ： 1.0， 
 "_source" ： ( 
 "usernane" ： "nnarkede"， 
    "login_time" ： 1476672246000 
)，
"_index" ； "mysql.login"， 
.type" ： "mysql-data"， 
"_td" ： "nysql.login+8+8"，
 "_score" ： 1.0，
"_source" ： (
 "username" ： "gwenshap"， 
    "login_time" ： 1476423962000 
    )]
    )
```

如果在MySQL里插入新的数据，它们会自动出现在Kafka的nysql.Login主题以及ElasticSearch相应的索引里。

现在，我们已经知道如何构建与安装JDBC连接器和ElasticSearch连接器了，也可以根据具体需要构建和安装任意的连接器。

Confluent提供了一个可用的连接器清单(http//www.confluent.io/product/connectors/)，你可以挑选你想用的连接器，从GitHub上获取它们的代码，自行构建，并根据文档或者通过RESTAPI获取配置项，配置好以后在自己的Connect集群上运行。

## 构建自己的连接器

任何人都可以基于公开的ConnectorAPI创建自己的连接器。

事实上，人们创建了各种连接器，然后把它们发布到连接器中心(ConnectorHub)，井告诉我们怎么使用它们。

如果你在连接器中心找不到可以适配你要集成的数据存储系统的连接器，可以开发自己的连接器。你也可以把自己的连接器贡献给社区，让更多的人知道和使用它们。

关于构建连接器的更多细节已经超出了本章的讨论范围，不过可以参考官方文档学习如何构建连接器(http://docs.confluent.io/3.0.1/connect/devguide.html)。

建议将已有的连接器作为人门参考，或者从使用mavenarchtype(https：/github.com/jcustenborder/kafka-connect-archtype)开始。另外，可以在Kafka的社区邮件组(users@kafka.apache.org)寻求帮助，或者在邮件组里展示自己的连接器。

# 深入理解Connect

要理解Connect的工作原理，需要先知道3个基本概念，以及它们之间是如何进行交互的。

我们已经在之前的示例里演示了如何运行worker进程集群以及如何启动和关闭连接器。

不过我们并没有深入解释转化器是如何处理数据的——转换器把MySQL的数据行转成JSON记录，然后由连接器将它们写人Kafka。

现在让我们深人理解每一个组件，以及它们之间是如何进行交互的。

## 连接器和任务

连接器插件实现了Connector API，API包含了两部分内容。

### 连接器

连接器负责以下3件事情。

1. 决定需要运行多少个任务。

2. 按照任务来拆分数据复制。

3. 从worker进程获取任务配置并将其传递下去。

例如，JDBC连接器会连接到数据库，统计需要复制的数据表，并确定需要执行多少个任务，然后在配置参数max.tasks和实际数据量之间选择数值较小的那个作为任务数。

在确定了任务数之后，连接器会为每个任务生成一个配置，配置里包含了连接器的配置项(比如connection.urL和该任务需要复制的数据表。taskConfigs()方法返回一个映射列表，这些映射包含了任务的相关配置。

worker进程负责启动和配置任务，每个任务只复制配置项里指定的数据表。如果通过RESTAPI启动连接器，有可能会启动任意节点上的连接器，那么连接器的任务就会在该节点上执行。

### 任务

任务负责将数据移人或移出Kafka。

任务在初始化时会得到由worker进程分配的一个上下文：源系统上下文(SourceContext)包含了一个对象，可以将源系统记录的偏移量保存在上下文里(例如，文件连接器的偏移量就是文件里的字节位置，JDBC连接器的偏移量可以是数据表的主键ID)。

目标系统连接器的上下文提供了一些方法，连接器可以用它们操作从Kafka接收到的数据，比如进行数据清理、错误重试，或者将偏移量保存到外部系统以便实现仅一次传递。

任务在完成初始化之后，就开始按照连接器指定的配置(包含在一个Properttes对象里)启动工作。源系统任务对外部系统进行轮询，并返回一些记录，worker进程将这些记录发送到Kafka。

数据池任务通过worker进程接收来自Kafka的记录，并将它们写入外部系统。

## worker进程

worker进程是连接器和任务的“容器”。它们负责处理HTTP请求，这些请求用于定义连接器和连接器的配置。

它们还负责保存连接器的配置、启动连接器和连接器任务，并把配置信息传递给任务。如果一个worker进程停止工作或者发生崩溃，集群里的其他worker进程会感知到(Kafka的消费者协议提供了心跳检测机制)，并将崩溃进程的连接器和任务重新分配给其他进程。如果有新的进程加入集群，其他进程也会感知到，并将自己的连接器和任务分配给新的进程，确保工作负载的均衡。进程还负责提交偏移量，如果任务抛出异常，可以基于这些偏移量进行重试。

为了更好地理解worker进程，我们可以将其与连接器和任务进行简单的比较。连接器和任务负责“数据的移动”，而worker进程负责RESTAPI、配置管理、可靠性、高可用性、伸缩性和负载均衡。

这种关注点分离是ConneetAPI给我们带来的最大好处，而这种好处是普通客户端API所不具备的。

有经验的开发人员都知道，编写代码从Kafka读取数据并将其插入数据库只需要一到两天的时间，但是如果要处理好配置、异常、RESTAPI、监控、部署、伸缩、失效等问题，可能需要几个月，如果你使用连接器来实现数据复制，连接器插件会为你处理掉一大堆复杂的问题。

## 转化器和Connect的数据模型

数据模型和转化器是ConnectAPI需要讨论的最后一部分内容。

Connect提供了一组数据API——它们包含了数据对象和用于描述数据的schema。

例如，JDBC连接器从数据库读取了一个字段，并基于这个字段的数据类型创建了一个ConnectSchema对象。然后使用这些Schema对象创建一个包含了所有数据库字段的Struct——我们保存了每一个字段的名字和它们的值。源连接器所做的事情都很相似——从源系统读取事件，并为每个事件生成schema和值(值就是数据对象本身)。

目标连接器正好相反，它们获取schema和值，并使用schema来解析值，然后写人到目标系统。

源连接器只负责基于DataAPI生成数据对象，那么worker进程是如何将这些数据对象保存到Kafka的?这个时候，转换器就派上用场了。

用户在配置worker进程(或连接器)时可以选择使用合适的转化器，用于将数据保存到Kafka。

目前可用的转化器有Avro、JSON和String。JSON转化器可以在转换结果里附带上schema，当然也可以不使用schema，这个是可配的。

Kafka系统因此可以支持结构化的数据和半结构化的数据。连接器通过DataAPI将数据返回给worker进程，worker进程使用指定的转化器将数据转换成Avro对象、JSON对象或者字符串，然后将它们写人Kafka。

对于目标连接器来说，过程刚好相反——在从Kafka读取数据时，worker进程使用指定的转换器将各种格式(Avro、JSON或String)的数据转换成DataAPI格式的对象，然后将它们传给目标连接器，目标连接器再将它们插人到目标系统。

ConnectAPI因此可以支持多种类型的数据，数据类型与连接器的实现是相互独立的一只要有可用的转换器，连接器和数据类型可以自由组合。

## 偏移量管理

worker进程的RESTAPI提供了部署和配置管理服务，除此之外，worker进程还提供了偏移量管理服务。连接器只要知道哪些数据是已经被处理过的，就可以通过Kafka提供的API来维护偏移量。

源连接器返回给worker进程的记录里包含了一个逻辑分区和一个逻辑偏移量。它们并非Kafka的分区和偏移量，而是源系统的分区和偏移量。

例如，对于文件源来说，分区可以是一个文件，偏移量可以是文件里的一个行号或者字符号：而对于JDBC源来说，分区可以是一个数据表，偏移量可以是一条记录的主键。

在设计一个源连接器时，要着重考虑如何对源系统的数据进行分区以及如何跟踪偏移量，这将影响连接器的并行能力，也决定了连接器是否能够实现至少一次传递或者仅一次传递。

源连接器返回的记录里包含了源系统的分区和偏移量，worker进程将这些记录发送给Kafka。

如果Kafka确认记录保存成功，worker进程就把偏移量保存下来。偏移量的存储机制是可插拔的，一般会使用Kafka主题来保存。如果连接器发生崩溃并重启，它可以从最近的偏移量继续处理数据。

目标连接器的处理过程恰好相反，不过也很相似。它们从Kafka上读取包含了主题、分区和偏移量信息的记录，然后调用连接器的put()方法，该方法会将记录保存到目标系统里。

如果保存成功，连接器会通过消费者客户端将偏移量提交到Kafka上。

框架提供的偏移量跟踪机制简化了连接器的开发工作，并在使用多个连接器时保证了一定程度的行为一致性。

# Connect之外的选择

现在，我们对ConnectAPI有了更加深人的了解，不仅知道如何使用它们，还知道它们的一些工作原理。

虽然ConnectAPI为我们提供了便利和可靠性，但它并非唯一的选择。下面看看还有哪些可用的框架，以及在什么时候可以使用它们。
 
## 用于其他数据存储的摄入框架

虽然我们很想说Kafka是至高无上的明星，但肯定会有人不同意这种说法。有些人将Hadoop或ElasticSearch作为他们数据架构的基础，这些系统都有自己的数据摄入工具.

Hadoop 使用了 Flume， ElasticSearch 使用了 Logstash  或者 Fluentd。
 
如果把架构里包含Kafka，并且需要连接大量的源系统和目标系统，那么建议使用Connect API作为摄人工具。
 
如果构建的系统是以Hadoop或ElasticSearch为中心的，Kafka只是数据的来源之一，那么使用Flume或Logstash会更合适。

转换器将各种格式(Avro、JSON或String)的数据转换成DataAPI格式的对象，然后将它们传给目标连接器，目标连接器再将它们插人到目标系统。

ConnectAPI因此可以支持多种类型的数据，数据类型与连接器的实现是相互独立的一只要有可用的转换器，连接器和数据类型可以自由组合。

## 基于图形界面的ETL工具

从保守的Informatica到一些开源的替代方案，比如Talend和Pentaho，或者更新的ApacheNiFi和StreamSets—这些ETL解决方案都支持将Kafka作为数据源和数据池。

如果你已经使用了这些系统，比如Pentaho，那么就可能不会为了Kafka而在系统里增加另一种集成工具。如果你已经习惯了基于图形界面的ETL数据管道解决方案，那就继续使用它们。

不过，这些系统有一些不足的地方，那就是它们的工作流比较复杂，如果你只是希望从Kafka里获取数据或者将数据写人Kafka，那么它们就显得有点笨重。

我们在本章的开头部分已经说过，在进行数据集成时，应该将注意力集中在消息的传输上。

因此，对于我们来说，大部分ETL工具都太过复杂了。

我们极力建议将Kafka当成是一个支持数据集成(使用Connect)、应用集成(使用生产者和消费者)和流式处理的平台。Kafka完全可以成为ETL工具的替代品。

## 流式处理框架

几乎所有的流式处理框架都具备从Kafka读取数据并将数据写人外部系统的能力。

如果你的目标系统支持流式处理，并且你已经打算使用流式框架处理来自Kafka的数据，那么使用相同的框架进行数据集成看起来是很合理的。

这样可以省掉一个处理步骤(不需要保存来自Kafka的数据，而是直接从Kafka读取数据然后写到其他系统)，不过在发生数据丢失或者出现脏数据时，诊断问题会变得很困难，因为这些框架并不知道数据是什么时候丢失的，或者什么时候出现了脏数据。

# 总结

本章讨论了如何使用Kafka进行数据集成，从解释为什么要使用Kafka进行数据集成开始，到说明数据集成方案的一般性考虑点。

我们先解释了为什么Kafka和ConnectAPI是一种更好的选择，然后给出了一些例子，演示如何在不同的场景下使用Connect，并深人了解了Connect的工作原理，最后介绍了一些Connect之外的数据集成方案。

不管最终你选择了哪一种数据集成方案，都需要保证所有消息能够在各种恶劣条件下完成传递。

我们相信，在与Kafka的可靠性特性结合起来之后，Connect具有了极高的可靠性。

不过，我们仍然需要对它们进行严格的测试，以确保你选择的数据集成系统能够在发生进程停止、机器崩溃、网络延迟和高负载的情况下不丢失消息。毕竟，数据集成系统应该只做一件事情，那就是传递数据。

可靠性是数据集成系统唯一一个重要的需求。在选择数据系统时，首先要明确需求(可以参考7.1节)，并确保所选择的系统能够满足这些需求。

除此之外，还要很好地了解数据集成方案，确保知道怎么使用它们来满足需求。

虽然Kafka支持至少一次传递的原语，但你也要小心谨慎，避免在配置上出现偏差，破坏了可靠性。

# 参考资料

《kafka 权威指南》

* any list
{:toc}
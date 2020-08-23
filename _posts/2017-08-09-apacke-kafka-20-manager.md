---
layout: post
title:  Apache Kafka-20-管理 kafka
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: false
---

# kafka 管理

Kafka提供了一些命令行工具，用于管理集群的变更。

这些工具使用Java类实现，Kafka提供了一些脚本来调用这些Java类。

不过，它们只提供了一些基本的功能，无法完成那些复杂的操作。本章将介绍一些工具，它们是Kafka开放源码项目的一部分。Kafka社区也开发了很多高级的工具，我们可以在ApacheKafka网站上找到它们，不过它们并不属于Kafka项目。

## 管理操作授权

虽然Kafka实现了操作主题的认证和授权控制，但还不支持集群的其他大部分操作。

也就是说，在没有认证的情况下也可以使用这些命令行工具，在没有安全检查和审计的情况下也可以执行诸如主题变更之类的操作。

不过这些功能正在开发当中，应该很快就能发布。

# 主题操作

使用 `kafka-topics.sh` 工具可以执行主题的大部分操作(配置变更部分已经被弃用并被移动到kafka-configs.sh工具当中)。

我们可以用它创建、修改、删除和查看集群里的主题。要使用该工具的全部功能，需要通过--zookeeper参数提供Zookeeper的连接字符串。

在下面的例子里，Zookeeper的连接字符串是zoo1.exanple.com:2181/kafka-cLuster。

## 检查版本

Kafka的大部分命令行工具直接操作Zookeeper上的元数据，并不会连接到broker上。

因此，要确保所使用工具的版本与集群里的broker版本相匹配。

直接使用集群broker自带的工具是最保险的。

## 创建主题

在集群里创建一个主题需要用到3个参数。这些参数是必须提供的，尽管有些已经有了broker级别的默认值。

- 主题名字

想要创建的主题的名字。

- 复制系数

主题的副本数量。

- 分区

主题的分区数量。

### 指定主题配置

可以在创建主题时显式地指定复制系数或者对配置进行覆盖，不过我们不打算在这里介绍如何做到这些。稍后会介绍如何进行配置覆盖，它们是通过向kafka-topics.sh传递--conf参数来实现的。

本章还会介绍分区的重分配。

主题名字可以包含字母、数字、下划线以及英文状态下的破折号和句号。

### 主题的命名

主题名字的开头部分包含两个下划线是合法的，但不建议这么做。

具有这种格式的主题一般是集群的内部主题(比如__consuner_offsets主题用于保存消费者群组的偏移量)。

也不建议在单个集群里使用英文状态下的句号和下划线来命名，因为主题的名字会被用在度量指标上，句号会被替换成下划线(比如"topic.1"会变成"topic_1")。

试着运行下面的命令:

```
kafka-topics.sh --zookeeper <zookeeper connect> --create --topic <string> --replication-factor <integer> --partitions <integer> 
```

这个命令将会创建一个主题，主题的名字为指定的值，并包含了指定数量的分区。集群会为每个分区创建指定数量的副本。如果为集群指定了基于机架信息的副本分配策略，那么分区的副本会分布在不同的机架上。

如果不需要基于机架信息的分配策略，可以指定参数 `--disable-rack-aware`。

示例:使用以下命令创建一个叫作my-topic的主题，主题包含8个分区，每个分区拥有两个副本。

```
# kafka-topics.sh --zookeeper zoo1.example.com:2181/kafka-cluster --create  --topic my-topic --replication-factor 2 --partitions 8
 Created topic "my-topic".
```

### 忽略重复创建主题的错误

在自动化系统里调用这个脚本时，可以使用 `--if-not-exists` 参数，这样即使主题已经存在，也不会抛出重复创建主题的错误。L

## 增加分区

有时候，我们需要为主题增加分区数量，主题基于分区进行伸缩和复制，增加分区主要是为了扩展主题容量或者降低单个分区的吞吐量。如果要在单个消费者群组内运行更多的消费者，那么主题数量也需要相应增加，因为一个分区只能由群组里的一个消费者读取。

### 调整基于键的主题

从消费者角度来看，为基于键的主题添加分区是很困难的。因为如果改变了、分区的数量，键到分区之间的映射也会发生变化。

所以，对于基于键的主题来说，建议在一开始就设置好分区数量，避免以后对其进行调整，

### 忽略主题不存在的错误

在使用--alter命令修改主题时，如果指定了--if-exists参数，主题不存在的错误就会被忽略。如果要修改的主题不存在，该命令并不会返回任何错误。在主题不存在的时候本应该创建主题，但它却把错误隐藏起来，因此不建议使用这个参数。

示例:将my-topic主题的分区数量增加到16。

```
# kafka-topics.sh --zookeeper zoo1.exanple.com:2181/kafka-cluster
 --alter -- topic my-topic --partitions 16 
 WARNING: If partitions are tncreased for a topic that has a key，
 the partition logic or ordertng of the nessages will be affected
 Adding partitions succeeded!
```

### 减少分区数量

我们无法减少主题的分区数量。

因为如果删除了分区，分区里的数据也一并被删除，导致数据不一致。

我们也无法将这些数据分配给其他分区，因为这样做很难，而且会出现消息乱序

。所以，如果一定要减少分区数量，只能删除整个主题，然后重新创建它。

## 删除主题

如果一个主题不再被使用，只要它还存在于集群里，就会占用一定数量的磁盘空间和文件句柄。把它删除就可以释放被占用的资源。为了能够删除主题，broker的delete.topic.enable参数必须被设置为true。

如果该参数被设为false，删除主题的请求会被忽略。

**删除主题会丢弃主题里的所有数据。这是一个不可逆的操作，所以在执行时要十分小心**。

示例:删除my-topic主题。

```
# kafka-topics.sh --zookeeper zoo1.example.com:2181/kafka-cluster --delete -- topic my-topic 
Topic my-topic is marked for deletion. 
Note: This will have no impact if delete.topic.enable is not set to true. 
```

## 列出集群里的所有主题

可以使用主题工具列出集群里的所有主题。

每个主题占用一行输出，主题之间没有特定的顺序。

示例:列出集群里的所有主题。


```
# kafka-topics.sh --zookeeper zoo1.exaple.com:2181/kafka-cluster --list 
my-topic - marked for deletion 
    other-topic 
```

## 列出主题详细信息

主题工具还能用来获取主题的详细信息。信息里包含了分区数量、主题的覆盖配置以及每个分区的副本清单，如果通过--topic参数指定特定的主题，就可以只列出指定主题的详细信息。

示例:列出集群里所有主题的详细信息。

```
# kafka-topics.sh --zookeeper zoo1.exanple.con:2181/kafka-cluster -describe 
topic:other-topic   PartitionCount:8   ReplicationFactor:2  Conftgs: 
Topic:other-topic   Partition: 8   Replicas: 1，0   Isr: 1，8 
Topic:other-topic  Partition: 1   Replicas: 0，1  Isr: 0，1 
Topic:other-topic   Partition: 2  Repltcas: 1，0  Isr: 1，0 
Topic:other-topic   Partition: 3  Replicas: 0，1  Isr: 0，1 
Topic:other-topic  Partition: 4   Repltcas: 1，0  Isr: 1，0 
Topic:other-topic   Partttton: 5   Repltcas: 0，1   Isr: 8，1
Topic:other-topic   Partition: 6  Replicas: 1，0   Isr: 1，0  
Topic:other-topic  Partttion: 7  Replicas: 0，1   Isr: 0，1
```

describe命令还提供了一些参数，用于过滤输出结果，这在诊断集群问题时会很有用。

不要为这些参数指定--topic参数(因为这些参数的目的是为了找出集群里所有满足条件的主题和分区)。

这些参数也无法与list命令一起使用(最后一部分会详细说明原因)。

使用 `--topics-with-overrides` 参数可以找出所有包含覆盖配置的主题，它只会列出包含了与集群不一样配置的主题。

有两个参数可用于找出有问题的分区。使用--under-replicated-partitions参数可以列出所有包含不同步副本的分区。

使用--unavailable-partittons参数可以列出所有没有首领的分区，这些分区已经处于离线状态，对于生产者和消费者来说是不可用的。

示例:列出包含不同步副本的分区。

```
# kafka-topics.sh --zookeeper zoo1.example.com:2181/kafka-cluster 
 --describe --under-replicated-partitions 
    topic: other-topic Partition: 2 
    Leader: 0  Replicas: 1，0 
Isr: 0 
 topic: other-topic   Partition: 4 
    nzLaer
    Leader: B  Replicas: 1，0 
    ISг: 8 
```

# 消费者群组

在Kafka里，有两个地方保存着消费者群组的信息。

对于旧版本的消费者来说，它们的信息保存在Zookeeper上:对于新版本的消费者来说，它们的信息保存在broker上。

kafka-consumer-groups.sh工具可以用于列出上述两种消费者群组。

它也可以用于删除消费者群组和偏移量信息，不过这个功能仅限于旧版本的消费者群组(信息保存在Zookeeper上)。

在对旧版本的消费者群组进行操作时，需要通过--zookeeper参数指定Zookeeper的地址:在对新版本的消费者群组进行操作时，则需要使用--bootstrap-server参数指定broker的主机名和端口。

## 列出并描述群组

在使用旧版本的消费者客户端时，可以使用--zookeeper和--list参数列出消费者群组:在使用新版本的消费者客户端时，则要使用--bootstrap-server、--list和 --new-consumer 参数。

示例:列出旧版本的消费者群组。

```
# kafka-consuner-groups.sh --zookeeper zoo1.example.com:2181/kafka-cluster --list
 console-consuner-79697 
myconsumer 
```

示例:列出新版本的消费者群组，

```
# kafka-consumer-groups.sh --new-consuner --bootstrap-server kafka1.example.com:9092/kafka-cluster --list 
kafka-python-test 
my-new-consumer
```

对于列出的任意群组来说，使用--descrtbe代替 --list，并通过-group指定特定的群组，就可以获取该群组的详细信息。

它会列出群组里所有主题的信息和每个分区的偏移量。

示例:获取旧版本消费者群组testgroup的详细信息，

```
# kafka-consumer-groups，sh -+zookeeper zoo1.example.com:2181/kafka-cluster --describe --group testgroup 
 GROUP 
    TOPIC 
    PARTITION 
CURRENT-OFFSET LOG-END-OFFSET LAG   OWNER 
 myconsumer 
    my-topic 
    0 
 1688  1688 Q 
myconsumer_host1.example.con-1478188622741-7dab5ca7-9 
 myconsuner 
    my-topic
 1418  1418   0
 myconsuner_host1.exanple.com-1478188622741-7dab5ca7-e
  myconsuner 
1314  1315
     topic   2 
 myconsuner_host1.example.con-1478188622741-7dab5ca7-e 
 myconsuner   my-topic
 2012  2012 
 myconsumer_host1.example.com-1478188622741-7dab5ca7-8 
 myconsumer 
    my-topic
 1089  1689 
 myconsuner_host1.example.con-1478188622741-7dab5ca7-8
 myconsuner 
    my-topic
    5 
1429  1432
 myconsuner_host1.example.con-1478188622741-7dab5ca7-e 
 myconsuner   y-topic 6
1634  1634  8 
myconsuner_host1.exanple.com-1478188622741-7dab5ca7-0
 hyconsumer  hy topic 
 2261  2261  B 
myconsuner_host1.exanple.com-1478188622741-7dab5ca7-8 
```

输出结果里包含了如表9-1所示的字段。

- 表 9-1:输出结果中的字段

| 字段             |  描述 |
|:---|:---|
| GROUP            | 消费者群组的名字 |
| TOPIC            | 正在被读取的主题名字 |
| PARTITION        | 正在被读取的分区ID |
| CURRENT-OFFSET   | 消费者群组最近提交的偏移量，也就是消费者在分区里读取的当前位置 |
| LOG-END-OFFSET   | 当前高水位编移量，也就是最近一个被读取消皂的偏移量，同时也是最近一个被提交到集群的偏移量 |
| LAG              | 消费者的 CURRENT-OFFSET 和 broker 的 LOG-END-OFFSET 之间的差距 |
| OWNER            | 消费者群组里正在读取该分区的消费者，这是一个消费者的ID，不一定包含消费者的主机名 |

## 删除群组

只有旧版本的消费者客户端才支持删除群组的操作。

删除群组操作将从Zookeeper上移除整个群组，包括所有已保存的偏移量。

在执行该操作之前，必须关闭所有的消费者。如果不先执行这一步，可能会导致消费者出现不可预测的行为，因为群组的元数据已经从Zookeeper上移除了。

- 示例:删除消费者群组testgroup。

```
# kafka-consumer-groups.sh --zookeeper zoo1.example.com:2181/kafka-cluster --delete --group testgroup
Deleted all consuner group information for group testgroup in zookeeper. 
```

该命令也可以用于在不删除整个群组的情况下删除单个主题的偏移量。

**再次强调，在进行删除操作之前，需要先关闭消费者，或者不要让它们读取即将被删除的主题。**

- 示例:从消费者群组testgroup里删除my-topic主题的偏移量。

```
# kafka-consumer-groups.sh --zookeeper zoo1.example.com:2181/kafka-cluster --delete --group testgroup --topic my-topic
Deleted consuner group tnformatton for group testgroup topic my-topic in zookeeper.
```

## 偏移量管理

除了可以显示和删除消费者群组(使用了旧版本消费者客户端)的偏移量外，还可以获取偏移量，并保存批次的最新偏移量，从而实现偏移量的重置。

在需要重新读取消息或者因消费者无法正常处理消息(比如包含了非法格式的消息)需要跳过偏移量时，需要进行偏移量重置。

### 管理已经提交到Kafka的偏移量

目前，还没有工具可以用于管理由消费者客户端提交到Kafka的偏移量，管理功能只对提交到Zookeeper的偏移量可用。

另外，为了能够管理提交到Kafka的消费者群组偏移量，需要在客户端使用相应的API来提交群组的偏移量。

### 1. 导出偏移量

Kafka没有为导出偏移量提供现成的脚本，不过可以使用 `kafka-run-class.sh` 脚本调用底层的Java类来实现导出。

在导出偏移量时，会生成一个文件，文件里包含了分区和偏移量的信息。

偏移量信息以一种导人工具能够识别的格式保存在文件里。

每个分区在文件里占用一行，格式为:/consumers/GROUPNAME/offsets/topic/TOPICNAME/PARTITIONID-0:OFFSET。

- 示例:将群组testgroup的偏移量导出到offsets文件里。

```
# kafka-run-class.sh kafka.tools.ExportZkOffsets --zkconnect zoo1.example.com:2181/kafka-cluster --group testgroup --output-ftle offsets
# cat offsets 

/consuners/testgroup/offsets/my-topic/0:8985
/consumers/testgroup/offsets/my-topic/1:8915
/consuners/testgroup/offsets/my-topic/2:9845
/consumers/testgroup/offsets/my-topic/3:8072
/consumers/testgroup/offsets/my-topic/4:8088
/consumers/testgroup/offsets/my-topic/5:8319
/consumers/testgroup/offsets/my-topic/6:8102 
/consumers/testgroup/offsets/my-topic/7:12739
```

### 2.导入偏移量

偏移量导人工具与导出工具做的事情刚好相反，它使用之前导出的文件来重置消费者群组的偏移量，一般情况下，我们会导出消费者群组的当前偏移量，并将导出的文件复制一份(这样就有了一个备份)，然后修改复制文件里的偏移量。

这里要注意，在使用导人命令时，不需要使用--group参数，因为文件里已经包含了消费者群组的名字。

#### 先关闭消费者

在导入偏移量之前，必须先关闭所有的消费者。如果消费者群组处于活跃状态，它们不会读取新的偏移量，反而有可能将导人的偏移量覆盖掉。

- 示例:从offsets文件里将偏移量导人到消费者群组testgroup。

```
# kafka-run-class.sh kafka.tools.ImportZkOffsets --zkconnect zoo1.example.con:2181/kafka-cluster --tnput-file offsets
```

# 动态配置变更

我们可以在集群处于运行状态时覆盖主题配置和客户端的配额参数。

我们打算在未来增加更多的动态配置参数，这也是为什么这些参数被单独放进了 kafka-configs.sh。

这样就可以为特定的主题和客户端指定配置参数。

一旦设置完毕，它们就成为集群的永久配置，被保存在Zookeeper上，broker在启动时会读取它们。不管是在工具里还是文档里，它们所说的动态配置参数都是基于"主题"实例或者"客户端"实例的，都是可以被"覆盖"的。

与之前介绍的工具一样，这里也需要通过--zookeeper参数提供Zookeeper集群的连接字符串。

在下面的例子里，Zookeeper的连接字符串是"zool.example.com:2181/kafka-cluster"。
 
## 覆盖主题的默认配置

为了满足不同的使用场景，主题的很多参数都可以进行单独的设置。

它们大部分都有broker级别的默认值，在没有被覆盖的情况下使用默认值。

更改主题配置的命令格式如下。

```
kafka-configs.sh --zookeeper zoo1.example.com:2181/kafka-cluster --alter --entity-type topics --entity-nane <topic name>  --add-config <key>=<value>[，<key>=<value>...] 
```

可用的主题配置参数(键)如表9-2所示。

- 表9-2:可用的主题配置参数

![输入图片说明](https://images.gitee.com/uploads/images/2020/0823/162150_a892d7a0_508704.png)

- 示例:将主题my-topic的消息保留时间设为1个小时(3600000ms)。

```
# kafka-configs.sh --zookeeper zoo1.example.com:2181/kafka-cluster --alter -- entity-type topics --entity-nane my-topic --add-config retention.ms=3609990 
Updated conftg for topic: "my-topic".
```


## 覆盖客户端的默认配置

对于Kafka客户端来说，只能覆盖生产者配额和消费者配额参数。

这两个配额都以字节每秒为单位，表示客户端在每个broker上的生产速率或消费速率。也就是说，如果集群里有5个broker，生产者的配额是10MB/s，那么它可以以10MB/s的速率在单个broker上生成数据，总共的速率可以达到50MB/s。

### 客户端ID与消费者群组

客户端ID可以与消费者群组的名字不一样。消费者可以有自己的ID，因此不同群组里的消费者可能具有相同的ID。在为消费者客户端设置ID时，最44，

好使用能够表明它们所属群组的标识符，这样便于群组共享配额，从日志里查找负责请求的群组也更容易一些。

更改客户端配置的命令格式如下:

```
kafka-configs.sh --zookeeper zoo1.example.com:2181/kafka-cluster --alter -- entity-type clients --entity-name <client ID> --add-config <key>=<value>[，<key>=<value>...]
```

可用的客户端配置参数(键)如表9-3所示。

- 表9-3:可用的客户端配置参数

| 配置项          | 描述 |
|:---|:---|
| producer_bytes_rate  | 单个生产者每秒钟可以往单个broker上生成的消息字节数 |
| consumerbytes_rate    | 单个消费者每秒钟可以从单个broker读取的消息字节数 |



## 列出被覆盖的配置

使用命令行工具可以列出所有被覆盖的配置，从而用于检查主题或客户端的配置。

与其他工具类似，这个功能通过--describe命令来实现。


- 示例:列出主题my-topic所有被覆盖的配置。

```
# kafka-conftgs.sh --zookeeper zoo1.example.com:2181/kafka-cluster --describe  --entity-type topics --entity-nane my-topic
Configs for topics:my-topic are 
retention.ms=3600000，segment.ns=3600000
```

### 只能显示主题的覆盖配置

这个命令只能用于显示被覆盖的配置，不包含集群的默认配置，目前还无法通过Zookeeper或Kafka实现动态地获取broker本身的配置，也就是说，在进行自动化时，如果要使用这个工具来获得主题和客户端的配置信息，必须同时为它提供集群的默认配置信息。

## 移除被覆盖的配置

动态的配置完全可以被移除，从而恢复到集群的默认配置。可以使用--alter命令和--delete-config参数来删除被覆盖的配置。

- 示例:删除主题my-topic的retention.ns覆盖配置。

```
# kafka-configs.sh --zookeeper zoo1.exanple.com:2181/kafka-cluster --alter --entity-type topics --entity-nane my-topic --delete-config retention.ns
Updated config for topic: "my-topic".
```

# 分区管理

Kafka工具提供了两个脚本用于管理分区，一个用于重新选举首领，另一个用于将分区分配给broker。

结合使用这两个工具，就可以实现集群流量的负载均衡。

## 首选的首领选举

第6章提到，使用多个分区副本可以提升可靠性。

不过，只有其中的一个副本可以成为分区首领，而且只有首领所在的broker可以进行生产和消费活动。

Kafka将副本清单里的第一个同步副本选为首领，但在关闭并重启broker之后，并不会自动恢复原先首领的身份。

### 自动首领再均衡

broker有一个配置可以用于启用自动首领再均衡，不过到目前为止，并不建议在生产环境使用该功能。

自动均衡会带来严重的性能问题，在大型的集群里，它会造成客户端流量的长时间停顿。

通过触发首选的副本选举，可以让broker重新获得首领。当该事件被触发时，集群控制器会为分区重新选择理想的首领。

选举过程一般不会造成负面的影响，因为客户端可以自动跟踪首领的变化，也可以通过工具 kafka-preferred-replica-election.sh 手动触发。


- 示例:在一个包含了1个主题和8个分区的集群里启动首选的副本选举。


```
# kafka-preferred-repltca-electton.sh --zookeeper zoo1.example.com:2181/kafka-cluster
Successfully started preferred replica election for partitions 
Set([my-topic，5]， [my-topic，O]， [my-topic，7]， [my-topic，4]，[my-topic，6]， [my-topic，2]， [my-topic，3]， [my-topic，1])
```

因为集群包含了大量的分区，首选的副本选举有可能无法正常进行。

在进行选举时，集群的元数据必须被写到Zookeeper的节点上，如果元数据超过了节点允许的大小(默认是1MB)，那么选举就会失败。

这个时候，需要将分区清单的信息写到一个JSON文件里，并将请求分为多个步骤进行。

JSON 文件的格式如下:

```
{
"partitions": [
    "partition": 1，
    "topic": "foo" 
)，
    "partition": 2，
    "topic": "foobar"
}
```

- 示例:通过在partitions.json文件里指定分区清单来启动副本选举。

```
# kafka-preferred-replica-election.sh --zookeeper zoo1.example.com:2181/kafka-cluster --path-to-json-file partttions.json
Successfully started preferred replica electton for partitions
Set([my-topic，1]， [my-topic，2]， [my-topic，3])
```

## 修改分区副本

在某些时候，可能需要修改分区的副本。

以下是一些需要修改分区副本的场景。

- 主题分区在整个集群里的不均衡分布造成了集群负载的不均衡。

- broker离线造成分区不同步。

- 新加人的broker需要从集群里获得负载。

可以使用kafka-reassign-partions.sh工具来修改分区。

使用该工具需要经过两个步骤:第一步，根据broker清单和主题清单生成一组迁移步骤:第二步，执行这些迁移步骤。

第三个步骤是可选的，也就是可以使用生成的迁移步骤验证分区重分配的进度和完成情况。

为了生成迁移步骤，需要先创建一个包含了主题清单的JSON文件，文件格式如下(目前的版本号都是1):

```
{
    "topics": [
    {"topic": "foo"},
    {"topic": "foo1"}
    ],
    "version": 1
}
```

示例:为 topics.json 文件里的主题生成迁移步骤，以便将这些主题迁移到broker0和 broker1 上.


```
# kafka-reassign-partitions.sh --zookeeper zoo1.example.com:2181/kafka-cluster --generate --topics-to-move-json-file topics.json --broker-list 0，1
 Current partition replica assignnent 
 ("version":1，"partitions":[("topic":"my-topic"， "partttion":5，"repltcas":[0，1])， "topic":"my-topic"，"partttton":10，"replicas":[1，0])，("topic": "my.
 topic""partitton":1， "replicas":[0，1])，("topic":"my-topic"， "partttion":4，"replt cas":[1，0])，("topic":"my-topic"， "partition":7，"replicas":[0，1])，("topic":"my.
 topic"，"partitton":6，"replicas":[1，0])，("topic":"my-topic"， "partitton": 
 3，"replicas":[0，1])，("topic":"my-topic'，"partttion":15，"replicas":[0，1])，
 ("topic":"my-topic"，"partition":0，"replicas":[1，0])，["topic":"my.
 topic"，"partition":11，"replicas":[0，1])，("topic":"my-topic"， "partition":8，"repli cas":[1，0])，("topic":"my-topic"，"partttton":12，"repltcas":[1，0])，("topic":"my- topic"，"partition":2，"replicas":[1，0])，("topic": "my-topic"， "partition": 13，"гeplicas":[0，1])，("topic":"my-topic"，"partition":14，"replicas":[1，0])， ("topic":"my-topic"， "partttion":9，"replicas":[0，1])]) 
 Proposed partttion reasstgnment configuratton 
("version":1，"partittons":[("topic":"my-topic"， "partitton":5，"replicas":[0，1])， ("topic":"my-topic"，"partition":10，"гeplicas":[1，0])，("topic":"my.
 topic"，"partttion":1，"гeplicas":[0，1])，("topic":"my-topic"，"partition":4，"гepli cas":[1，0])，("topic":"my-topic"，"partttion":7，"repltcas":[0，1])，("topic":"my- topic"，"partttion":6，"гeplicas":[1，0])，("topic":"my-topic"， "partition": 15，"replicas":[0，1])，("topic":"my-topic"，"partition":0，"replicas":[1，0])， ("topic":"my-topic"，"partttton":3，"repltcas":[0，1])，("topic":"my.
 topic"，"partition":11，"repltcas":[0，1])，("topic":"my-topic"，"partitton":8，"гepli cas":[1，0])，("topic":"my-topic"， "partition":12，"replicas":[1，0])，("topic":"my- topic"， "partition":13，"repltcas":[0，1])，("topic":"my-topic"，"partitton": 2，"гeplicas":[1，0])，("topic":"my-topic"， "partition":14，"гeplicas":[1，0])， ("topic":"my-topic"，"partttion":9，"replicas":[0，1])])
```

broker的ID以逗号分隔，并作为参数提供给命令行工具。

这个工具会在标准控制台上输出两个JSON对象，分别描述了当前的分区分配情况以及建议的分区分配方案。

这些JSON 对象的格式如下: {"partitions": [("topic": "my-topic"， "partition": O， "replicas": [1，2] )]， "version":1}.

可以把第一个JSON对象保存起来，以便在必要的时候进行回滚。第二个JSON对象应该被保存到另一个文件里，作为kafka-reassign-partitions.sh工具的输人来执行第二个步骤。

- 示例:使用reassignjson来执行建议的分区分配方案。

```
# kafka-reassign-partitions.sh --zookeeper zoo1.exanple.com:2181/kafka-cluster --execute --reassignnent-json-file reasstgn.json

Current partition repltca assignment 

{"version":1，"partttions":[("topic":"my-topic"， "partition":5，"replicas":[0，1])， ("topic":"my-topic"，"partition":10， "replicas":[1，0])，("topic":"my-
 topic"，"partition":1；"replicas":[0，1])，("topic":"my-topic"， "partttton":4，"repli cas":[1，0])，("topic":"my-topic"，"partition":7，"repltcas":[0，1])，("topic":"my-
 topic"，"partttton":6，"replicas":[1，0])，("topic":"my-topic"， "partitton":3， repitcas":[0，1])，("topitc"! my-topte，partition !1s， repttca. :10，1]}，
 Reassignment of partition [my-topic，4] completed successfully
 Reasstgnment of partitton [my-topic，12] completed successfully
 Reassignment of partition [my-topic，6] completed successfully 
 Reassignment of partitton [my-topic，11] completed successfully
 Reassignment of partttion [my-topic，10] completed successfully
 Reassignment of partttion [my-topic，9] completed successfully
 Reassignnent of partitton [my-topic，2] completed successfully 
 Reassignnent of partttion [my-topic，14] completed successfully
 Reasstgnnent of partition [my-topic，3] completed successfully
 Reasstgnnent of partitton [my-topic，1] completed successfully
 Reasstgnnent of partition [my-topic，15] completed successfully
 Reassignnent of partition [my-topic，8] completed successfully 
```

### 分批重分配

分区重分配对集群的性能有很大影响，因为它会引起内存页缓存发生变化，并占用额外的网络和磁盘资源。

将重分配过程拆分成多个小步骤可以将这种影响降到最低。

## 修改复制系数

分区重分配工具提供了一些特性，用于改变分区的复制系数，这些特性并没有在文档里说明。

如果在创建分区时指定了错误的复制系数(比如在创建主题时没有足够多可用的broker)，那么就有必要修改它们。

这可以通过创建一个JSON对象来完成，该对象使用分区重新分配的执行步骤中使用的格式，显式指定分区所需的副本数量。

集群将完成重分配过程，并使用新的复制系数。

例如，假设主题my-topic有一个分区，该分区的复制系数为1。

```json
{
    "partttions": [{
    "topic": "my-topic"，
    "partition": 0，
    "replicas": [ 1]
        }
    ],
    "version": 1
}
```

在分区重新分配的执行步骤中使用以下JSON可以将复制系数改为2.

```json
{
    "partttions": [{
    "topic": "my-topic"，
    "partition": 0，
    "replicas": [1,2]
        }
    ],
    "version": 1
}
```

## 转储日志片段

如果需要查看某个特定消息的内容，比如一个消费者无法处理的“毒药”消息，可以使用工具来解码分区的日志片段。

该工具可以让你在不读取消息的情况下查看消息的内容。它接受一个以逗号分隔的日志片段文件清单作为参数，并打印出每个消息的概要信息和数据内容。

- 示例:解码日志片段00000000000052368601.log，显示消息的概要信息。

```
# kafka-run-class.sh kafka.tools.DumpLogSegnents --files
 Q0000000000052368601.log 
 Dumping 0080D000000052368601.log 
Starting offset: 52368601
 offset: 52368601 posttion: O NoTimestanpType: -1 tsvalid:true 
 payloadsize: 661 magic: 0 conpresscodec: GZIPCompresstonCodec crc:
 1194341321
 offset: 52368603 posttton: 687 NoTinestanpType: -1 isvaltd: true
 payloadsize:895  magtc: 0 compresscodec: GZIPConpresstonCodec crc:
 278946641
 offset: 52368664 positton: 1608 NoTinestampType: -1 isvalid: true
 payloadsize:665  magtc: 0 compresscodec: GZIPCompressionCodec crc:
 3767466431
 offset: 52368606 posttton: 2299 NoTinestampType: -1 isvalid: true 
 payloadsize:932 nagic: 0 compresscodec: GZIPCompressionCodec crc:
    2444301359
```

- 示例:解码日志片段00000000000052368601.log，显示消息的数据内容

```
# kafka-run-class.sh kafka.tools.DumpLogSegments --files
0000D800080052368601.tog --prtnt-data-Log 
offset: 52368601 position: O NoTimestanpType: -1 tsvalid: true
payloadstze: 661 magic: O compresscodec: GZIPCompressionCodec crc:
1194341321 payload: test message 1
offset: 52368603 positton: 687 NoTinestampType: -1 isvaltd: true 
payloadstze:895  magic: 0 compresscodec: GZIPCompresstonCodec crc::
278946641 payload: test message 2 
offset: 52368604 posttton: 1608 NoTinestampType: -1 tsvaltd: true
payloadsize:665  magtc: 0 compresscodec: GZIPCompresstonCodec crc:
3767466431 payload: test message 3
offset: 52368606 posttion: 2299 NoTimestanpType: -1 isvaltd: true
payloadsize:932  nagic: 0 compresscodec: GZIPCompresstonCodec crc:2444301359 payload: test nessage 4
```

这个工具也可以用于验证日志片段的索引文件。索引用于在日志片段里查找消息，如果索引文件损坏，会导致消费者在读取消息时出现错误。

broker在不正常启动(比如之前没有正常关闭)时会自动执行这个验证过程，不过也可以手动执行它。

有两个参数可以用于指定不同程度的验证，`--index-sanity-check` 将会检查无用的索引，而 `--verify-index-only` 将会检查索引的匹配度，但不会打印出所有的索引。

- 示例:验证日志片段00000000000052368601.log索引文件的正确性。

```
# kafka-run-class.sh kafka.tools.DumpLogSegnents --files 80000000060952368601.index，00000900090Q52368601.og
--index-sanity-check
Dumping 80009000000052368601.index
00099000000052368601.index passed sanity check.
Dumping 00000999090052368601.log 
Starting offset: 52368601
offset: 52368601 posttion: O NoTimestanpType: -1 tsvaltd: true
payloadsize: 661 magic: 0 conpresscodec: GZIPCompresstonCodec crc:
1194341321
offset: 52368603 posttion: 687 NoTimestanpType: -1 isvalid: true 
payloadsize:895 magtc: 0 conpresscodec: GZIPCompresstonCodec crc:
278946641
offset: 52368604 posttton: 1608 NoTimestanpType: -1 isvalid: true
payloadstze:665  magic: 0 conpresscodec: GZIPCompressionCodec crc:3767466431 
```

## 副本验证

分区复制的工作原理与消费者客户端类似:跟随者broker定期将上一个偏移量到当前偏移量之间的数据复制到磁盘上。

如果复制停止并重启，它会从上一个检查点继续复制。如果之前复制的日志片段被删除，跟随者不会做任何补偿。

可以使用工具 `kafka-replica-verification.sh` 来验证集群分区副本的一致性。

他会从指定分区的副本上获取消息，并检查所有副本是否具有相同的消息。

我们必须使用正则表达式将待验证主题的名字传给它。如果不提供这个参数，它会验证所有的主题。

除此之外，还需要显式地提供broker的地址清单，

副本验证对集群的影响

副本验证工具也会对集群造成影响，因为它需要读取所有的消息。另外，它的读取过程是并行进行的，所以使用的时候要小心。

示例:对broker1和broker2上以 `my-` 开头的主题副本进行验证。

```
# kafka-replica-verification.sh --broker-ltst 
kafka1.example.com:9092，kafka2.example.con:9092 --topic-white-list 'my-.*' 2016-11-23 18:42:08，838: verification process ts started.
2016-11-23 18:42:38，789: max lag ts 0 for partition [my-topic，7] at offset 53827844 anong 10 partttions 
2016-11-23 18:43:08，790: max lag is O for partition [my-topic，7] at offset 53827878 anong 10 partitions
```


# 消费和生产

在使用Kafka时，有时候为了验证应用程序，需要手动读取消息或手动生成消息。

这个时候可以借助 `kafka-console-consumer.sh` 和 `kafka-console-producer.sh` 这两个工具，它们包装了Java客户端，让用户不需要编写整个应用程序就可以与Kafka主题发生交互。

## 将结果输出到其他应用程序

有时候，我们可能需要编写应用程序将控制台消费者和控制台生产者包装起来，用它读取消息，并把消息传给另一个应用程序去处理。

这种应用程序太过脆弱，应该尽量避免编写这类应用程序。我们无法保证控制台消费者不丢失数据，也无法使用控制台生产者的所有特性，而且它发送数据的方式也很奇怪，最好的方式是直接使用Java客户端，或者使用其他基于Kafka协议实现的第三方客户端(可能是使用其他语言开发的)。

## 控制台消费者

kafka-console-consumer.sh工具提供了一种从一个或多个主题上读取消息的方式。

消息被打印在标准输出上，消息之间以空行分隔。

默认情况下，它会打印没有经过格式化的原始消息字节(使用DefaultFormatter)。

它有很多可选参数，其中有一些基本的参数是必选的。

### 检查工具版本

使用与Kafkabroker相同版本的消费者客户端，这一点是非常重要的。

旧版本的控制台消费者与Zookeeper之间不恰当的交互行为可能会影响到集群。

第一步要指定是否使用新版本的消费者，并指定Kaka集群的地址。如果使用的是旧版本的消费者，只需要提供--zookeeper参数，后面跟上Kafka集群的连接字符串。

对于上面的例，参数可能是 `--zookeeper zoo1.exarple.com:2181/kafka-cluster`， 如果使用了新版本的消费者，必须使用--new-consumer和--broker-list，--broker-list 后面需要跟上以逗号相隔的 broker 地址列表。

比如 --broker-list kafka1.exanple.com:9092，kafka2.exarple.con:9092，下一步要指定待读取的主题。

这里有3个可用参数，分别是--topic、--whitelist和--blacklist。

此处允许只指定一个参数。

--topic用于指定单个待读取的主题，--whitelist和--bLackltst后面跟着一个正则表达式(在命令行里可能需要转义)。

与白名单正则表达式匹配的主题将会被读取，与黑名单正则表达式匹配的主题不会被读取。

- 示例:使用旧版消费者读取单个主题my-topic。

```
# kafka-console-consuner.sh --zookeeper zoo1.example.com:2181/kafka-cluster --topic my-topic
sample message 1
sample message 2 
Processed a total of 2 messages
```

除了基本的命令行参数外，也可以把消费者的其他配置参数传给控制台消费者。

可以通过两种方式来达到这个目的，这取决于需要传递的参数个数以及个人喜好。

第一种方式是将配置参数写在一个文件里，然后通过 `--consumer.config CONFIGFILE`指定配置文件，其中 CONFIGFILE 就是配置文件的全路径。

另一种方式是直接在命令行以 `--consumer-property KEY=VALUE` 的格式传递一个或多个参数，其中KEY指参数的名字，VALUE指参数的值。

这种方式在设置消费者属性时会很有用，比如设置群组的ID。

### 容易混淆的命令行参数

控制台消费者和控制台生产者有一个共同的参数--property，千万不要将这些参数和 `--consumer-property` 和 `--producer-property` 混淆。

--property 参数用于向消息格式化器传递配置信息，而不是给客户端本身传递配置信息。

### 其他配置

控制台消费者的其他常用配置如下。

--formatter CLASSNAME 

指定消息格式化器的类名，用于解码消息，它的默认值是kafka.tools.DefaultFormatter。--fron-beginning 

指定从最旧的偏移量开始读取数据，否则就从最新的偏移量开始读取。

--max-messages NUM 

指定在退出之前最多读取NUM个消息。

--partition NUM 

指定只读取ID为NUM的分区(需要新版本的消费者)。

### 1.消息格式化器的选项

除了默认的消息格式化器之外，还有其他3种可用的格式化器。

- kafka.tools.LoggingMessageFormatter 

将消息输出到日志，而不是输出到标准的输出设备。

日志级别为INFO，并且包含了时间戳、键和值。

- kafka.tools. ChecksunMessageFormatter
    
只打印消息的校验和。

- kafka.tools.NoOpMessageFormatter

读取消息但不打印消息。

- kafka.tools.DefaultMessageFormatter 

有一些非常有用的配置选项， 这些选项可以通过 --property 命令行参数传给它。

- print.tinestamp

如果被设为true，就会打印每个消息的时间戳。

- print.key 

如果被设为true，除了打印消息的值之外，还会打印消息的键。

- key.separator 

指定打印消息的键和消息的值所使用的分隔符。

- line.separator

指定消息之间的分隔符。

- key.deserializer 

指定打印消息的键所使用的反序列化器类名。

- value.desertalizer

指定打印消息的值所使用的反序列化器类名。

反序列化类必须实现org.apache.kafka.common.serialtzation.Deserializer接口，控制台消费者会调用它们的toString()方法获取输出结果。

一般来说，在使用kafka_console_consumer.sh工具之前，需要通过环境变量CLASSPATH将这些实现类添加到类路径里。

### 2.读取偏移量主题

有时候，我们需要知道提交的消费者群组偏移量是多少，比如某个特定的群组是否在提交偏移量，或者偏移量提交的频度。

这个可以通过让控制台消费者读取一个特殊的内部主题 `__consuner_offsets` 来实现。

所有消费者的偏移量都以消息的形式写到这个主题上。

为了解码这个主题的消息，需要使用kafka.coordinator.GroupHetadataHanagerSOffsetsHessageFornatter这个格式化器。

- 示例：从偏移量主题读取一个消息。

```
# kafka-console-consumer.sh --zookeeper zoo1.exanple.com:2181/kafka-cluster --topic __consumer_offsets --formatter kafka.coordinator.GroupMetadataManager$OffsetsMessage Formatter--max-messages 1 
 [my-group-name，my-topic，0]：：[OffsetMetadata[481690879，NO_METADATA]
 ，ConmitTtme 1479788539051，ExpirattonTine 1480313339051]
Processed a total of 1 messages
```

## 控制台生产者

与控制台消费者类似，`kafka-console-producer.sh` 工具可以用于向Kafka主题写人消息。

默认情况下，该工具将命令行输入的每一行视为一个消息，消息的键和值以Tab字符分隔(如果没有出现Tab字符，那么键就是null)。

### 改变命令行的读取行为

如果有必要，可以使用自定义类来读取命令行输人。

自定义类必须继承 kafka.common.MessageReader 类， 并且负责创造 ProducerRecord 对象。

然后在命令行的 --line-reader 参数后面指定这个类，并确保包含这个类的JAR包已经加人到类路径里。

控制台生产者有两个参数是必须指定的：--broker-Ltst参数指定了一个或多个broker，它们以逗号分隔，格式为hostnane：port；另一个参数--topic指定了生成消息的目标主题。在生成完消息之后，需要发送一个EOF字符来关闭客户端。

- 示例：向主题my-topic生成两个消息。

```
# kafka-console-producer.sh --broker-list
kafka1.example.com:9092，kafka2.example.com:9092 --topic my-topic
sample message 1 
sample message 2 
```

与控制台消费者一样，控制台生产者可以接受普通生产者的配置参数。

这也可以通过两种方式来实现，具体用哪一种取决于你想要传递的参数个数和个人喜好。

第一种方式是通过 `--producer.config CONFIGFILE` 指定消费者配置文件，其中CONFIGFILE是配置文件的全路径。

另一种方式是直接在命令行以 `--producer-property KEY=VALUE`的格式传递一个或多个参数，其中KEY指参数的名字，VALUE指参数的值。

这种方式在设置生产者属性时会很有用，比如消息批次的相关配置(如1inger.ms或batch.size)。

### 更多参数

控制台生产者有很多命令行参数可用于调整它的行为。

（1）--key-sertalizer CLASSNAME 

指定消息键的编码器类名，默认是kafka.serializer.DefaultEncoder。

（2）--value-serializer CLASSNAME 

指定消息值的编码器类名，默认是kafka.serializer.DefaultEncoder。

（3）--compression-codec STRING 

指定生成消息所使用的压缩类型，可以是none、gztp、snappy或1z4，默认值是gzip。 --sync 

指定以同步的方式生成消息，也就是说，在发送下一个消息之前会等待当前消息得到确认。


### 创建自定义序列化器

自定义序列化器必须继承kafka.serializer.Encode类，可以用于做一些转换操作，比如将JSON格式的字符串转成其他格式，如Avro，让这些消息可以被保存到主题上。

### 文本行读取器的配置参数

- kafka.tools.LineHessageReader

类负责读取标准输入，并创建消息记录。

它也有一些非常有用的配置参数，可以通过--property命令行参数把这些配置参数传给控制台生产者。

- ignore.erгor

如果被设为false，那么在parse.key被设为true或者标准输人里没有包含键的分隔符时就会抛出异常，默认为true。

- parse.key 

如果被设为false，那么生成消息的键总是null，默认为true。

- key.separator 

指定消息键和消息值之间的分隔符，默认是Tab字符。

在生成消息时，LineMessageReader使用第一个出现的key.separator作为分隔符来拆分输人。

如果在分隔符之后没有其他字符，那么消息的值为空。如果输入里没有包含分隔符，或者parse.key被设为false，那么消息的键就是null。

# 客户端ACL

命令行工具 kafka-acls.sh 可以用于处理与客户端访问控制相关的问题，它的文档可以在 Apache Kafka 官方网站上找到。

# 不安全的操作

有一些管理操作虽然在技术上是可行的，但如果不是非常有必要，就不应该尝试那么做。

比如，你正在诊断一个问题，但已经没有其他可行的办法，或者发现了一个bug，需要一个临时解决方案。这些操作一般在文档里不会有相关的说明，而且未经证实，有可能会给应用程序带来风险。

这里会列举一些常见的操作，在紧急情况下可以使用它们。不过，一般情况下不建议执行这些操作，而且在执行之前要慎重考虑。

## 此处有危险

本节介绍的操作将涉及保存在Zookeeper上的元数据。除了这里提到的内容、以外，不要直接修改Zookeeer的其他任何信息，一定要小心谨慎，因为这些操作都是很危险的。

## 移动集群控制器

每个Kafka集群都有一个控制器，它是运行在集群某个broker上的一个线程。控制器负责看管集群的操作，有时候需要将控制器从一个broker迁移到另一个broker上。

例如，因为出现了某些异常，控制器虽然还在运行，但已无法提供正常的功能。

这时候可以迁移控制器，但毕竟这也不是一般性的操作，所以不应该经常迁移控制器。

当前控制器将自己注册到Zookeeper的一个节点上，这个节点处于集群路径的最顶层，名字叫作 `/controller`，手动删除这个节点会释放当前控制器，集群将会进行新的控制器选举。

## 取消分区重分配

分区重分配的一般流程如下。

(1) 发起重分配请求(创建Zookeeper节点)。

(2) 集群控制器将分区添加到broker上。

(3) 新的broker开始复制分区，直到副本达到同步状态。

(4) 集群控制器从分区副本清单里移除旧的broker。

因为分区重分配是并行进行的，所以一般情况下没有理由取消一个正在进行中的重分配任务。

不过有一个例外的情况，比如在重分配进行到一半时，broker发生了故障并且无法立即重启，这会导致重分配过程无法结束，进而妨碍其他重分配任务的进行(比如将故障broker的分区分配给其他broker)。

如果发生了这种情况，可以让集群忽略这个重分配任务。

## 移除流程

移除一个进行中的分区重分配任务的步骤如下。

(1) 从 Zookeeper 删除 /admin/reassign_partitions 节点.

(2) 重新选举控制器(参见9.7.1节)。

### 检查复制系数

在取消进行中的分区重分配任务时，对于任何一个未完成重分配的分区来说，旧的broker都不会从副本清单里移除。

也就是说，有些分区的复制系数会比正常的大。如果主题的分区包含不一致的复制系数，那么broker是不允许对其进行操作的(比如增加分区)。

所以建议检查分区是否仍然可用，并确保分区的复制系数是正确的。

## 移除待删除的主题

在使用命令行工具删除主题时，命令行工具会在Zookeeper上创建一个节点作为删除主题的请求。

在正常情况下，集群会立即执行这个请求。

不过，命令行工具并不知道集群是否启用了主题删除功能。

因此，如果集群没有启用主题删除功能，那么命令行工具发起的请求会一直被挂起。不过这种挂起请求是可以被移除的。

主题的删除是通过在 `/admin/delete_topic` 节点下创建一个以待删除主题名字命名的子节点来实现的。

所以，删除了这些节点(不过不要删除 `/admin/delete_topic` 这个父节点)，也就移除了被挂起的请求。

## 手动删除主题

如果集群禁用了主题删除功能，或者需要通过非正式的途径删除某些主题，那么可以进行手动删除。

这要求在线下关闭集群里所有的broker。

### 先关闭broker

在集群还在运行的时候修改Zookeeper里的元数据是很危险的，这会造成集群不稳定。

所以，不要在集群还在运行的时候删除或修改Zookeeper里的主题元数据。

### 删除流程

从集群里手动删除主题的过程如下。

(1) 关闭集群里所有的broker。

(2) 删除 Zookeeper 路径 `/brokers/topics/TOPICNAME`， 注意要先删除节点下的子节点。 

(3) 删除每个broker的分区目录，这些目录的名字可能是TOPICNAME-NUM，其中NUM是指分区的ID。

(4) 重启所有的broker。

# 总结

运行一个Kafka集群需要付出很大的努力，为了让Kafka保持巅峰状态，需要做大量的配置和维护。

我们在这一章里介绍了Kafka的很多日常操作，比如经常会用到的主题管理和客户端配置：也介绍了一些用于诊断问题的复杂操作，比如检查日志片段：最后还介绍了一些不安全的操作，这些操作在特殊的情况下可以帮你解决问题。

通过执行这些操作，你就可以更好地管理Kafka集群。

当然，如果没有进行适当的监控，管理集群就是一个不可能完成的任务。

第10章将会讨论如何对broker和集群的健康状况以及操作进行监控，这样就可以知道Kafka的运行状态了。

我们也会提供一些有关客户端(包括生产者和消费者)监控的最佳实践。

# 参考资料

《kafka 权威指南》

* amy list
{:toc}


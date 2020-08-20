---
layout: post
title:  Apache Kafka-09-kafka basic operate 基本操作
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: false
---

# 基本操作

以下是基于LinkedIn使用Kafka作为生产系统的一些使用经验。

如果您有其他好的技巧请告诉我们。

# 基础的 Kafka 操作

本节将回顾在Kafka集群上执行的最常见操作。

所有在本节中看到的工具都可以在Kafka发行版的 `bin/` 目录下找到，如果没有参数运行，每个工具都会打印所有可能的命令行选项的细节。

## 添加和删除 topics

您可以选择手动添加 topic，或者在数据首次发布到不存在的 topic 时自动创建 topic。

如果 topic 是自动创建的，那么您可能需要调整用于自动创建 topic 的默认 topic 配置。

使用 topic 工具来添加和修改 topic ：

```
> bin/kafka-topics.sh --zookeeper zk_host:port/chroot --create --topic my_topic_name
      --partitions 20 --replication-factor 3 --config x=y
```

replication-factor 控制有多少服务器将复制每个写入的消息。

如果您设置了3个复制因子，那么只能最多2个相关的服务器能出问题，否则您将无法访问数据。

我们建议您使用2或3个复制因子，以便在不中断数据消费的情况下透明的调整集群。

partitions 参数控制 topic 将被分片到多少个日志里。

partitions 会产生几个影响。

首先，每个分区只属于一台服务器，所以如果有20个分区，那么全部数据(包含读写负载)将由不超过20个服务器（不包含副本）处理。

最后 partitions 还会影响 consumer 的最大并行度。这在概念部分中有更详细的讨论。

每个分区日志都放在自己的Kafka日志目录下的文件夹中。这些文件夹的名称由主题名称，破折号（ - ）和分区ID组成。

由于典型的文件夹名称长度不能超过255个字符，所以主题名称的长度会受到限制。我们假设分区的数量不会超过10万。因此，主题名称不能超过249个字符。这在文件夹名称中留下了足够的空间以显示短划线和可能的5位长的分区ID。

在命令行上添加的配置会覆盖服务器的默认设置，例如数据应该保留的时间长度。此处记录了完整的每个 topic 配置。

## 修改 topics

使用相同的 topic 工具，您可以修改 topic 的配置或分区。

要添加分区，你可以做如下操作

```
> bin/kafka-topics.sh --zookeeper zk_host:port/chroot --alter --topic my_topic_name
      --partitions 40
```

请注意，分区的一个用处是对数据进行语义分区，并且添加分区不会更改现有数据的分区，因此如果依赖该分区，则可能会影响消费者。

也就是说，如果数据是通过 `hash（key）％number_of_partitions` 进行分区的，那么这个分区可能会通过添加分区进行混洗，但Kafka不会尝试以任何方式自动重新分配数据。

- 增加一个配置项

```
> bin/kafka-configs.sh --zookeeper zk_host:port/chroot --entity-type topics --entity-name my_topic_name --alter --add-config x=y
```

- 删除一个配置项

```
> bin/kafka-configs.sh --zookeeper zk_host:port/chroot --entity-type topics --entity-name my_topic_name --alter --delete-config x
```

- 删除一个 topic

```
> bin/kafka-topics.sh --zookeeper zk_host:port/chroot --delete --topic my_topic_name
```

当前，Kafka 不支持减少一个 topic 的分区数。

有关更改 一个 topic 复制因子的说明，[请参见此处](https://kafka.apachecn.org/documentation.html#basic_ops_increase_replication_factor).

## 优雅的关机

Kafka 集群将自动检测到任何 broker 关机或故障，并为该机器上的分区选择新的 leader。

无论服务器出现故障还是因为维护或配置更改而故意停机，都会发生这种情况。 

对于后一种情况，Kafka 支持更优雅的停止服务器的机制，而不仅仅是杀死它。 

当一个服务器正常停止时，它将采取两种优化措施:

（1）它将所有日志同步到磁盘，以避免在重新启动时需要进行任何日志恢复活动（即验证日志尾部的所有消息的校验和）。由于日志恢复需要时间，所以从侧面加速了重新启动操作。

（2）它将在关闭之前将以该服务器为 leader 的任何分区迁移到其他副本。这将使 leader 角色传递更快，并将每个分区不可用的时间缩短到几毫秒。

只要服务器的停止不是通过直接杀死，同步日志就会自动发生，但控制 leader 迁移需要使用特殊的设置：

```
controlled.shutdown.enable=true
```

请注意，只有当 broker 托管的分区具有副本（即，复制因子大于1 且至少其中一个副本处于活动状态）时，对关闭的控制才会成功。 

这通常是你想要的，因为关闭最后一个副本会使 topic 分区不可用。

## Balancing leadership

每当一个 borker 停止或崩溃时，该 borker 上的分区的 leader 会转移到其他副本。

这意味着，在 broker 重新启动时，默认情况下，它将只是所有分区的跟随者，这意味着它不会用于客户端的读取和写入。

**为了避免这种不平衡，Kafka有一个首选副本的概念。如果分区的副本列表为1,5,9，则节点1首选为节点5或9的 leader，因为它在副本列表中较早。**

您可以通过运行以下命令让Kafka集群尝试恢复已恢复副本的领导地位：

```
> bin/kafka-preferred-replica-election.sh --zookeeper zk_host:port/chroot
```

由于运行此命令可能很乏味，您也可以通过以下配置来自动配置Kafka：

```
auto.leader.rebalance.enable=true
```

## 垮机架均衡副本

机架感知功能可以跨不同机架传播相同分区的副本。

这扩展了 Kafka 为 broker 故障提供的容错担保，弥补了机架故障，如果机架上的所有 broker 都失败，则可以限制数据丢失的风险。

该功能也可以应用于其他 broker 分组，例如EC2中的可用区域。

您可以通过向 broker 配置添加属性来指定 broker 属于的特定机架：

```
broker.rack=my-rack-id
```

当 topic 创建，修改或副本重新分配时， 机架约束将得到保证，确保副本跨越尽可能多的机架（一个分区将跨越 min(#racks，replication-factor) 个不同的机架）。

用于向 broker 分配副本的算法可确保每个 broker 的 leader 数量将保持不变，而不管 broker 在机架之间如何分布。这确保了均衡的吞吐量。

但是，如果 broker 在机架间分布不均 ，副本的分配将不均匀。具有较少 broker 的机架将获得更多复制副本，这意味着他们将使用更多存储并将更多资源投入复制。

因此，每个机架配置相同数量的 broker 是明智的。

## 集群之间镜像数据

我们指的是通过“镜像”复制Kafka集群之间的数据的过程，以避免与在单个集群中的节点之间发生的复制混淆。

Kafka附带了一个在Kafka集群之间镜像数据的工具 mirror-maker。

该工具从源集群中消费数据并产生数据到目标集群。 这种镜像的常见用例是在另一个数据中心提供副本。这个场景将在下一节中详细的讨论。

您可以运行许多这样的镜像进程来提高吞吐量和容错能力（如果一个进程死亡，其他进程将承担额外的负载）。

从源群集中的 topic 中读取数据，并将其写入目标群集中具有相同名称的 topic。

事实上，镜像只不过是把一个 Kafka 的 consumer 和 producer 联合在一起了。

源和目标集群是完全独立的实体：它们可以有不同数量的分区，偏移量也不会相同。

由于这个原因，镜像集群并不是真正意义上的容错机制（因为 consumer 的偏移量将会不同）。

为此，我们建议使用正常的群集内复制。然而，镜像制作进程将保留并使用消息 key 进行分区，所以在每个 key 的基础上保存顺序。

以下示例显示如何从输入群集中镜像单个 topic（名为 my-topic）：

```
> bin/kafka-mirror-maker.sh
      --consumer.config consumer.properties
      --producer.config producer.properties --whitelist my-topic
```

请注意，我们使用 --whitelist 选项指定 topic 列表。

此选项允许使用任何 Java风格的正则表达式 

因此，您可以使用 `--whitelist 'A|B'` 来镜像名为A 和 B 的两个 topic。 

或者您可以使用 `--whitelist '*'` 来镜像全部 topic。

确保引用的任何正则表达式不会被 shell 尝试将其展开为文件路径。为了方便起见，我们允许使用 `,` 而不是 `|` 指定 topic 列表。

有时，说出你不想要的东西比较容易。

与使用 --whitelist 来表示你想要的相反，通过镜像您可以使用 --blacklist 来表示要排除的内容。 

这也需要一个正则表达式的参数。

但是，当启用新的 consumer 时，不支持 --blacklist（即 bootstrap.servers ）已在 consumer 配置中定义）。

将镜像与配置项 auto.create.topics.enable = true 结合使用，可以创建一个副本群集，即使添加了新的 topic，也可以自动创建和复制源群集中的所有数据。

## 检查 consumer 位置

有时观察到消费者的位置是有用的。

我们有一个工具，可以显示 consumer 群体中所有 consumer 的位置，以及他们所在日志的结尾。

要在名为my-group的 consumer 组上运行此工具，消费一个名为my-topic的 topic 将如下所示：

```
> bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group my-group
 
注意：这将仅显示使用Java consumer API（基于非ZooKeeper的 consumer）的 consumer 的信息。
   
TOPIC                          PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG        CONSUMER-ID                                       HOST                           CLIENT-ID
my-topic                       0          2               4               2          consumer-1-029af89c-873c-4751-a720-cefd41a669d6   /127.0.0.1                     consumer-1
my-topic                       1          2               3               1          consumer-1-029af89c-873c-4751-a720-cefd41a669d6   /127.0.0.1                     consumer-1
my-topic                       2          2               3               1          consumer-2-42c1abd4-e3b2-425d-a8bb-e1ea49b29bb2   /127.0.0.1                     consumer-2
```

这个工具也适用于基于ZooKeeper的 consumer：

```
> bin/kafka-consumer-groups.sh --zookeeper localhost:2181 --describe --group my-group
 
注意：这只会显示关于使用ZooKeeper的 consumer 的信息（不是那些使用Java consumer API的消费者）。
 
TOPIC                          PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG        CONSUMER-ID
my-topic                       0          2               4               2          my-group_consumer-1
my-topic                       1          2               3               1          my-group_consumer-1
my-topic                       2          2               3               1          my-group_consumer-2
```

## 管理 Consumer 组

通过 ConsumerGroupCommand 工具，我们可以列出，描述或删除 consumer 组。

请注意，删除仅在组元数据存储在ZooKeeper中时可用。

当使用新的 consumer API （ broker 协调分区处理和重新平衡）时， 当该组的最后一个提交偏移量过期时，该组将被删除。 

例如，要列出所有 topic 中的所有 consumer 组：

```
> bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
 
test-consumer-group
```

如前所述,为了查看偏移量，我们这样“describe”consumer 组：

```
> bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group test-consumer-group
 
TOPIC                          PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG        CONSUMER-ID                                       HOST                           CLIENT-ID
test-foo                       0          1               3               2          consumer-1-a5d61779-4d04-4c50-a6d6-fb35d942642d   /127.0.0.1                     consumer-1
```

如果您正在使用老的高级 consumer 并在ZooKeeper中存储组元数据（即 offsets.storage = zookeeper ），则传递 --zookeeper 而不是bootstrap-server：

```
> bin/kafka-consumer-groups.sh --zookeeper localhost:2181 --list
```

# 扩展您的群集

将服务器添加到Kafka集群非常简单，只需为其分配唯一的 broker ID 并在您的新服务器上启动Kafka即可。

但是，这些新的服务器不会自动分配到任何数据分区，除非将分区移动到这些分区，否则直到创建新 topic 时才会提供服务。

所以通常当您将机器添加到群集中时，您会希望将一些现有数据迁移到这些机器上。

迁移数据的过程是手动启动的，但是完全自动化。

在迁移数据时，Kafka会将新服务器添加为正在迁移的分区的 follower，并允许它完全复制该分区中的现有数据。

当新服务器完全复制了此分区的内容并加入了同步副本时，其中一个现有副本将删除其分区的数据。

分区重新分配工具可用于跨 broker 移动分区。理想的分区分布将确保所有 broker 的数据负载和分区大小比较均衡。

分区重新分配工具不具备自动分析Kafka集群中的数据分布并移动分区以获得均匀负载的功能。

因此，管理员必须找出哪些 topic 或分区应该移动。

分区重新分配工具可以以3种互斥方式运行：

--generate: 在此模式下，给定一个 topic 列表和一个 broker 列表，该工具会生成一个候选重新分配，以将指定的 topic 的所有分区移动到新的broker。此选项仅提供了一种便捷的方式，可以根据 tpoc 和目标 broker 列表生成分区重新分配计划。

--execute: 在此模式下，该工具基于用户提供的重新分配计划启动分区重新分配。（使用--reassignment-json-file选项）。这可以是由管理员制作的自定义重新分配计划，也可以是使用--generate选项提供的自定义重新分配计划。

--verify: 在此模式下，该工具将验证最近用 --execute 模式执行间的所有分区的重新分配状态。状态可以是成功完成，失败或正在进行

## 自动将数据迁移到新机器

分区重新分配工具可用于将当前一组 broker 的一些 topic 移至新增的topic。

这在扩展现有群集时通常很有用，因为将整个 topic 移动到新 broker 集比移动一个分区更容易。

当这样做的时候，用户应该提供需要移动到新的 broker 集合的 topic 列表和新的目标broker列表。

该工具然后会均匀分配新 broker 集中 topic 的所有分区。

在此过程中，topic 的复制因子保持不变。

实际上，所有输入 topic 的所有分区副本都将从旧的 broker 组转移到新 broker中。

例如，以下示例将把名叫foo1，foo2的 topic 的所有分区移动到新的 broker 集5,6。

最后，foo1和foo2的所有分区将只在<5,6> broker 上存在。

由于该工具接受由 topic 组成的输入列表作为json文件，因此首先需要确定要移动的 topic 并创建 json 文件，如下所示：

```
> cat topics-to-move.json
{"topics": [{"topic": "foo1"},
            {"topic": "foo2"}],
"version":1
}
```

一旦json文件准备就绪，就可以使用分区重新分配工具来生成候选分配：

```
> bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --topics-to-move-json-file topics-to-move.json --broker-list "5,6" --generate
当前分区副本分配
 
{"version":1,
"partitions":[{"topic":"foo1","partition":2,"replicas":[1,2]},
              {"topic":"foo1","partition":0,"replicas":[3,4]},
              {"topic":"foo2","partition":2,"replicas":[1,2]},
              {"topic":"foo2","partition":0,"replicas":[3,4]},
              {"topic":"foo1","partition":1,"replicas":[2,3]},
              {"topic":"foo2","partition":1,"replicas":[2,3]}]
}
 
建议的分区重新分配配置
 
{"version":1,
"partitions":[{"topic":"foo1","partition":2,"replicas":[5,6]},
              {"topic":"foo1","partition":0,"replicas":[5,6]},
              {"topic":"foo2","partition":2,"replicas":[5,6]},
              {"topic":"foo2","partition":0,"replicas":[5,6]},
              {"topic":"foo1","partition":1,"replicas":[5,6]},
              {"topic":"foo2","partition":1,"replicas":[5,6]}]
}
```

该工具会生成一个候选分配，将所有分区从topic foo1，foo2移动到brokers 5,6。

但是，请注意，这个时候，分区操作还没有开始，它只是告诉你当前的任务和建议的新任务。

应该保存当前的分配，以防您想要回滚到它。

新的任务应该保存在一个json文件（例如expand-cluster-reassignment.json）中，并用--execute选项输入到工具中，如下所示：

```
> bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --reassignment-json-file expand-cluster-reassignment.json --execute
当前分区副本分配
 
{"version":1,
"partitions":[{"topic":"foo1","partition":2,"replicas":[1,2]},
              {"topic":"foo1","partition":0,"replicas":[3,4]},
              {"topic":"foo2","partition":2,"replicas":[1,2]},
              {"topic":"foo2","partition":0,"replicas":[3,4]},
              {"topic":"foo1","partition":1,"replicas":[2,3]},
              {"topic":"foo2","partition":1,"replicas":[2,3]}]
}
 
保存这个以在回滚期间用作--reassignment-json-file选项
成功开始重新分配分区
{"version":1,
"partitions":[{"topic":"foo1","partition":2,"replicas":[5,6]},
              {"topic":"foo1","partition":0,"replicas":[5,6]},
              {"topic":"foo2","partition":2,"replicas":[5,6]},
              {"topic":"foo2","partition":0,"replicas":[5,6]},
              {"topic":"foo1","partition":1,"replicas":[5,6]},
              {"topic":"foo2","partition":1,"replicas":[5,6]}]
}
```

最后，可以使用--verify选项来检查分区重新分配的状态。

请注意，相同的expand-cluster-reassignment.json（与--execute选项一起使用）应与--verify选项一起使用：

```
> bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --reassignment-json-file expand-cluster-reassignment.json --verify
Status of partition reassignment:
Reassignment of partition [foo1,0] completed successfully
Reassignment of partition [foo1,1] is in progress
Reassignment of partition [foo1,2] is in progress
Reassignment of partition [foo2,0] completed successfully
Reassignment of partition [foo2,1] completed successfully
Reassignment of partition [foo2,2] completed successfully
```

## 自定义分区分配和迁移

分区重新分配工具也可用于选择性地将分区的副本移动到特定的一组 broker。

当以这种方式使用时，假定用户知道重新分配计划并且不需要该工具产生候选的重新分配，有效地跳过 --generate 步骤并直接到 --execute步骤

例如，以下示例将 topic foo1的分区0 移到 broker 5,6中和将 topic foo2的分区1移到 broker 2,3中：

第一步是在json文件中定义重新分配计划：

```
> cat custom-reassignment.json
{"version":1,"partitions":[{"topic":"foo1","partition":0,"replicas":[5,6]},{"topic":"foo2","partition":1,"replicas":[2,3]}]}
```

然后，使用带有 --execute 选项的 json 文件来启动重新分配过程：

```
> bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --reassignment-json-file custom-reassignment.json --execute
当前分区副本分配情况
 
 {"version":1,
 "partitions":[{"topic":"foo1","partition":0,"replicas":[1,2]},
               {"topic":"foo2","partition":1,"replicas":[3,4]}]
 }
 
 保存这个以在回滚期间用作 --reassignment-json-file 选项
 成功开始重新分配分区
 {"version":1,
 "partitions":[{"topic":"foo1","partition":0,"replicas":[5,6]},
               {"topic":"foo2","partition":1,"replicas":[2,3]}]
 }
```

可以使用--verify选项来检查分区重新分配的状态。 

请注意，相同的expand-cluster-reassignment.json（与--execute选项一起使用）应与--verify选项一起使用：

```
> bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --reassignment-json-file custom-reassignment.json --verify
Status of partition reassignment:
Reassignment of partition [foo1,0] completed successfully
Reassignment of partition [foo2,1] completed successfully
```

# 下线 brokers

分区重新分配工具不具备为下线 broker 自动生成重新分配计划的功能。

因此，管理员必须自己整理重新分配计划，将托管在即将下线的 broker 上的所有分区的副本移动到其他 broker。

这可能比较单调，因为重新分配需要确保所有副本不会从将下线的 broker 只转移到唯一的 broker。 

为了使这一过程毫不费力，我们计划在未来为下线 broker 添加工具支持。

# 增加复制因子

增加现有分区的复制因子很容易。

只需在自定义重新分配json文件中指定额外的副本，并将其与--execute选项一起使用，以增加指定分区的复制因子。

例如，以下示例将foo的分区0的复制因子从1增加到3。在增加复制因子之前，该分区的唯一副本存在于 broker 5上。作为增加复制因子的一部分，我们将添加更多副本到 broker 6和7。

第一步是在json文件中自定义重新分配计划：

```
> cat increase-replication-factor.json
{"version":1,
"partitions":[{"topic":"foo","partition":0,"replicas":[5,6,7]}]}
```

然后，使用带有--execute选项的json文件来启动重新分配过程：

```
> bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --reassignment-json-file increase-replication-factor.json --execute
当前分区副本分配
 
{"version":1,
"partitions":[{"topic":"foo","partition":0,"replicas":[5]}]}
 
保存这个以在回滚期间用作--reassignment-json-file选项
成功开始重新分配分区
{"version":1,
"partitions":[{"topic":"foo","partition":0,"replicas":[5,6,7]}]}
```

可以使用--verify选项来检查分区重新分配的状态。请注意，与--verify选项使用的increase-replication-factor.json要与--execute选项一起使用的相同：

```
> bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --reassignment-json-file increase-replication-factor.json --verify
Status of partition reassignment:
Reassignment of partition [foo,0] completed successfully
```

您还可以使用kafka-topics工具验证复制因子的增加情况：

```
> bin/kafka-topics.sh --zookeeper localhost:2181 --topic foo --describe
Topic:foo   PartitionCount:1    ReplicationFactor:3 Configs:
  Topic: foo    Partition: 0    Leader: 5   Replicas: 5,6,7 Isr: 5,6,7
```

# 限制数据迁移过程中的带宽使用

Kafka允许您设置复制流量的阈值，设置用于将副本从机器移动到另一台机器上的带宽上限。

在重新平衡群集，引导新 broker 或添加或删除 broker 时，这非常有用，因为它限制了这些数据密集型操作对用户的影响。

有两个接口可以用来调节阈值。最简单也是最安全的是在调用kafka-reassign-partitions.sh时调节，但也可以使用kafka-configs.sh直接查看和更改流量阀值。

例如，如果要使用下面的命令执行重新平衡，它将以不超过 50MB/s 的速度移动分区。

```
$ bin/kafka-reassign-partitions.sh --zookeeper myhost:2181--execute --reassignment-json-file bigger-cluster.json —throttle 50000000
```

当你执行这个脚本时，你会看到：

```
The throttle limit was set to 50000000 B/s
Successfully started reassignment of partitions.
```

如果你想改变阈值，在重新平衡期间，比如增加吞吐量以便更快地完成，你可以通过重新运行execute命令来传递同样的reassignment-json-file：

```
$ bin/kafka-reassign-partitions.sh --zookeeper localhost:2181  --execute --reassignment-json-file bigger-cluster.json --throttle 700000000
  There is an existing assignment running.
  The throttle limit was set to 700000000 B/s
```

当重新平衡完成后，管理员可以使用--verify选项检查重新平衡的状态。

如果重新平衡完成，流量阈值将通过--verify命令删除。 

**一旦重新平衡完成后，管理员必须及时通过 --verify 选项删除节流阀，如果不这样做可能会导致正常的复制流量受到限制。**

当执行 --verify 选项并且重新分配完成时，脚本将确认节流阀已被移除：

```
> bin/kafka-reassign-partitions.sh --zookeeper localhost:2181  --verify --reassignment-json-file bigger-cluster.json
Status of partition reassignment:
Reassignment of partition [my-topic,1] completed successfully
Reassignment of partition [mytopic,0] completed successfully
Throttle was removed.
```

管理员还可以使用kafka-configs.sh验证分配的配置。

有两对节流阀配置用于管理节流过程。节流阈值本身在 broker 级别使用动态属性进行配置的：

```
leader.replication.throttled.rate
  follower.replication.throttled.rate
```

还有一组枚举类型的复制节流配置：

```
leader.replication.throttled.replicas
  follower.replication.throttled.replicas
```

每个 topic 配置了哪些。所有四个配置值都由kafka-reassign-partitions.sh自动分配(下面讨论).

查看流量限制配置：

```
> bin/kafka-configs.sh --describe --zookeeper localhost:2181 --entity-type brokers
Configs for brokers '2' are leader.replication.throttled.rate=700000000,follower.replication.throttled.rate=700000000
Configs for brokers '1' are leader.replication.throttled.rate=700000000,follower.replication.throttled.rate=700000000
```

这显示应用于复制协议的 leader 和 follower 的节流阀。默认情况下，双方都被分配相同的限制吞吐量值。

要查看节流副本的列表，请执行以下操作：

```
> bin/kafka-configs.sh --describe --zookeeper localhost:2181 --entity-type topics
Configs for topic 'my-topic' are leader.replication.throttled.replicas=1:102,0:101,
    follower.replication.throttled.replicas=1:101,0:102
```

这里我们看到 leader 节流阀被应用于 broker 102上的分区1和 broker 101上的分区0。follower节流阀同样被应用于 broker 101上的分区1和 broker 102上的分区0。

默认情况下，kafka-reassign-partitions.sh将把 leader 的节流阀应用于重新平衡之前存在的所有副本，其中任何一个都可能是 leader。

它会将 follower 应用到所有的目的地。 

因此，如果 broker 101,102上有副本的分区，被重新分配到102,103，那么该分区的 leader 节流阀将被应用于101,102，并且 follower 节流阀将仅被应用于103。

如果需要，还可以使用kafka-configs.sh上的--alter开关手动更改节流阀配置。

## 安全使用节流复制

在使用节流复制时应该小心。 

尤其是：

(1) 移除节流阀

一旦重新分配完成，应及时移除节流阀（通过运行 `kafka-reassign-partitions -verify`）。

(2) 确保进展：

如果与传入写入速率相比阈值设置得太低，复制可能无法取得进展。

这发生在： max(BytesInPerSec) > throttle

BytesInPerSec是监控 producer 写入每个 broker 的写入吞吐量的指标。

管理员可以在重新平衡期间使用以下指标监控复制是否正在取得进展：

```
kafka.server:type=FetcherLagMetrics,name=ConsumerLag,clientId=([-.\w]+),topic=([-.\w]+),partition=([0-9]+)
```

复制期间滞后数据应该不断减少。如果指标不降低，管理员应按上述方法增大节流阈值。

# 设置配额

配额覆盖值和默认值可以在（user=user1, client-id=clientA），用户或客户端级别配置，如此处所述。 

默认情况下，客户端是无限制的配额。

可以为每个（user, client-id），用户或客户端组设置自定义配额。

为（user = user1，client-id = clientA）配置自定义配额：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --alter --add-config 'producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200' --entity-type users --entity-name user1 --entity-type clients --entity-name clientA
Updated config for entity: user-principal 'user1', client-id 'clientA'.
```

为user = user1配置自定义配额：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --alter --add-config 'producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200' --entity-type users --entity-name user1
Updated config for entity: user-principal 'user1'.
```

为client-id=clientA配置自定义配额：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --alter --add-config 'producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200' --entity-type clients --entity-name clientA
Updated config for entity: client-id 'clientA'.
```

可以通过指定 --entity-default 选项而不是--entity-name来为每个（user, client-id），用户或客户端ID组设置默认配额。

为user = userA配置默认客户端配额：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --alter --add-config 'producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200' --entity-type users --entity-name user1 --entity-type clients --entity-default
Updated config for entity: user-principal 'user1', default client-id.
```

为用户配置默认配额：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --alter --add-config 'producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200' --entity-type users --entity-default
Updated config for entity: default user-principal.
```

配置client-id的默认配额：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --alter --add-config 'producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200' --entity-type clients --entity-default
Updated config for entity: default client-id.
```

以下是如何描述给定（user, client-id）的配额：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --describe --entity-type users --entity-name user1 --entity-type clients --entity-name clientA
Configs for user-principal 'user1', client-id 'clientA' are producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200
```

描述给定用户的配额：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --describe --entity-type users --entity-name user1
Configs for user-principal 'user1' are producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200
```

描述给定 client-id的配额：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --describe --entity-type clients --entity-name clientA
Configs for client-id 'clientA' are producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200
```

如果未指定实体名称，则描述指定类型的所有实体。 

例如，描述所有用户：

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --describe --entity-type users
Configs for user-principal 'user1' are producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200
Configs for default user-principal are producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200
```

对于(user, client)也是同样的:

```
> bin/kafka-configs.sh  --zookeeper localhost:2181 --describe --entity-type users --entity-type clients
Configs for user-principal 'user1', default client-id are producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200
Configs for user-principal 'user1', client-id 'clientA' are producer_byte_rate=1024,consumer_byte_rate=2048,request_percentage=200
```

通过在 broker 上设置这些配置，可以适用于所有client-id的默认配额。只有在Zookeeper中未配置配额覆盖或默认配置时才应用这些属性。

默认情况下，每个 client-id 都会收到一个无限制的配额。

以下设置每个 producer 和 consumer 客户端的默认配额为10MB/sec。

```
quota.producer.default=10485760
quota.consumer.default=10485760
```

请注意，这些属性已被弃用，并可能在未来版本中删除。使用kafka-configs.sh配置的默认值优先于这些属性。

# 参考资料

[kafka 基本操作](https://kafka.apachecn.org/documentation.html#operations)

* any list
{:toc}
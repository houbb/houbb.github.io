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

由于这个原因，镜像集群并不是真正意义上的容错机制（因为 consumer 的偏移量将会不同）。为此，我们建议使用正常的群集内复制。然而，镜像制作进程将保留并使用消息 key 进行分区，所以在每个 key 的基础上保存顺序。

以下示例显示如何从输入群集中镜像单个 topic（名为 my-topic）：

```
> bin/kafka-mirror-maker.sh
      --consumer.config consumer.properties
      --producer.config producer.properties --whitelist my-topic
```




# 参考资料

[kafka 基本操作](https://kafka.apachecn.org/documentation.html#operations)

* any list
{:toc}
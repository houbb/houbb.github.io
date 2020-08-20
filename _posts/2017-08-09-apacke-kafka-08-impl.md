---
layout: post
title:  Apache Kafka-08-kafka implements kafka 实现原理
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: true
---


# 网络层

网络层相当于一个 NIO 服务,在此不在详细描述. 

sendfile(零拷贝) 的实现是通过 MessageSet 接口的 writeTo 方法完成的.这样的机制允许 file-backed 集使用更高效的 transferTo 实现,而不在使用进程内的写缓存.线程模型是一个单独的接受线程和 N 个处理线程,每个线程处理固定数量的连接.

这种设计方式在其他地方经过大量的测试,发现它是实现简单而且快速的.协议保持简单以允许未来实现其他语言的客户端.

# 消息

消息包含一个可变长度的 header ,一个可变长度不透明的字节数组 key ,一个可变长度不透明的字节数组 value ,消息中 header 的格式会在下一节描述. 

保持消息中的 key 和 value 不透明(二进制格式)是正确的决定: 目前构建序列化库取得很大的进展,而且任何单一的序列化方式都不能满足所有的用途.

毋庸置疑,使用kafka的特定应用程序可能会要求特定的序列化类型作为自己使用的一部分. 

RecordBatch 接口就是一种简单的消息迭代器,它可以使用特定的方法批量读写消息到 NIO 的 Channel 中.

# 消息格式

消息通常按照批量的方式写入.

record batch 是批量消息的技术术语,它包含一条或多条 records.

不良情况下, record batch 只包含一条 record. 

Record batches 和 records 都有他们自己的 headers.

在 kafka 0.11.0及后续版本中(消息格式的版本为 v2 或者 magic=2)解释了每种消息格式.

[点击查看消息格式详情](https://cwiki.apache.org/confluence/display/KAFKA/A+Guide+To+The+Kafka+Protocol#AGuideToTheKafkaProtocol-Messagesets).

## Record Batch

以下为 RecordBatch 在硬盘上的格式.

```
baseOffset: int64
batchLength: int32
partitionLeaderEpoch: int32
magic: int8 (current magic value is 2)
crc: int32
attributes: int16
    bit 0~2:
        0: no compression
        1: gzip
        2: snappy
        3: lz4
    bit 3: timestampType
    bit 4: isTransactional (0 means not transactional)
    bit 5: isControlBatch (0 means not a control batch)
    bit 6~15: unused
lastOffsetDelta: int32
firstTimestamp: int64
maxTimestamp: int64
producerId: int64
producerEpoch: int16
baseSequence: int32
records: [Record]
```

请注意,启用压缩时，压缩的记录数据将直接按照记录数进行序列化。

CRC(一种数据校验码) 会覆盖从属性到批处理结束的数据, (即 CRC 后的所有字节数据). CRC 位于 magic 之后,这意味着,在决定如何解释批次的长度和 magic 类型之前,客户端需要解析 magic 类型.CRC 计算不包括分区 learder epoch 字段,是为了避免 broker 收到每个批次的数据时 需要重新分配计算 CRC . 

CRC-32C (Castagnoli) 多项式用于计算.

压缩: 不同于旧的消息格式, magic v2 及以上版本在清理日志时保留原始日志中首次及最后一次 offset/sequence.

这是为了能够在日志重新加载时恢复生产者的状态.

例如,如果我们不保留最后一次序列号,当分区 learder 失败以后,生产者会报 OutOfSequence 的错误.

必须保留基础序列号来做重复检查(broker 通过检查生产者该批次请求中第一次及最后一次序列号是否与上一次的序列号相匹配来判断是否重复).

因此,当批次中所有的记录被清理但批次数据依然保留是为了保存生产者最后一次的序列号,日志中可能有空的数据.

不解的是在压缩中时间戳可能不会被保留,所以如果批次中的第一条记录被压缩,时间戳也会改变

### 批次控制

批次控制包含成为控制记录的单条记录. 控制记录不应该传送给应用程序,相反,他们是消费者用来过滤中断的事务消息.

控制记录的 key 符合以下模式:

```
version: int16 (current version is 0)
type: int16 (0 indicates an abort marker, 1 indicates a commit)
```

批次记录值的模式依赖于类型. 对客户端来说它是透明的.

## Record(记录)

Record level headers were introduced in Kafka 0.11.0. 

The on-disk format of a record with Headers is delineated below.

Record 级别的头部信息在0.11.0 版本引入.

拥有 headers 的 Record 的磁盘格式如下.

```
length: varint
attributes: int8
    bit 0~7: unused
timestampDelta: varint
offsetDelta: varint
keyLength: varint
key: byte[]
valueLen: varint
value: byte[]
Headers => [Header]
```

###  Record Header

```
headerKeyLength: varint
headerKey: String
headerValueLength: varint
Value: byte[]
```

我们使用了和 Protobuf 编码格式相同的 varint 编码. 

更多后者相关的信息在这里. 

Record 中 headers 的数量也被编码为 [varint](https://developers.google.com/protocol-buffers/docs/encoding#varints) .

# 日志

命名为 "my_topic" 的主题日志有两个分区,包含两个目录 (命名为 my_topic_0 和 my_topic_1) ,目录中分布着包含该 topic 消息的日志文件.

日志文件的格式是 "log entries" 的序列; 每个日志对象是由4位的数字N存储日志长度,后跟 N 字节的消息.

每个消息使用64位的整数作为 offset 唯一标记, offset 即为发送到该 topic partition 中所有流数据的起始位置.

每个消息的磁盘格式如下. 每个日志文件使用它包含的第一个日志的 offset 来命名.

所以创建的第一个文件是 00000000000.kafka, 并且每个附件文件会有大概 S 字节前一个文件的整数名称,其中 S 是配置给出的最大文件大小.

记录的精确二进制格式是版本化的,并且按照标准接口进行维护,所以批量的记录可以在 producer, broker 和客户端之间传输,而不需要在使用时进行重新复制或转化.前一章包含了记录的磁盘格式的详情.

消息的偏移量用作消息 id 是不常见的.我们最开始的想法是使用 producer 自增的 GUID ,并维护从 GUID 到每个 broker 的 offset 的映射.这样的话每个消费者需要为每个服务端维护一个 ID,提供全球唯一的 GUID 没有意义.

而且,维护一个从随机 ID 到偏移量映射的复杂度需要一个重度的索引结构,它需要与磁盘进行同步,本质上需要一个完整的持久随机访问数据结构.

因此为了简化查找结构,我们决定针对每个分区使用一个原子计数器,它可以利用分区id和节点id唯一标识一条消息.

虽然这使得查找结构足够简单,但每个消费者的多个查询请求依然是相似的.

一旦我们决定使用使用计数器,直接跳转到对应的偏移量显得更加自然-毕竟对于每个分区来说它们都是一个单调递增的整数.

由于消费者API隐藏了偏移量，所以这个决定最终是一个实现细节，我们采用了更高效的方法。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0819/150242_d506df18_508704.png)

## Writes

日志允许序列化的追加到最后一个文件中.

当文件大小达到配置的大小(默认 1G)时,会生成一个新的文件.

日志中有两个配置参数: M 是在 OS 强制写文件到磁盘之前的消息条数, S 是强制写盘的秒数.

这提供了一个在系统崩溃时最多丢失 M 条或者 S 秒消息的保证.

## Reads

通过提供消息的64位逻辑偏移量和 S 位的 max chunk size 完成读请求.

这会返回一个包含 S 位的消息缓存迭代器. 

S 必须大于任何单条的数据,但是在异常的大消息情况下,读取操作可以重试多次,每次会加倍缓冲的大小,直到消息被读取成功.

可以指定最大消息大小和缓存大小使服务器拒绝接收超过其大小的消息,并为客户端设置消息的最大限度,它需要尝试读取多次获得完整的消息.

读取缓冲区可能以部分消息结束,这很容易通过大小分界来检测.

按照偏移量读取的实际操作需要在数据存储目录中找到第一个日志分片的位置,在全局的偏移量中计算指定文件的偏移量,然后读取文件偏移量.

搜索是使用二分查找法查找在内存中保存的每个文件的偏移量来完成的.

日志提供了将消息写入到当前的能力,以允许客户端从'当前开始订阅.

在消费者未能在其SLA指定的天数内消费其数据的情况下,这也是有用的.在这种情况下,客户端会尝试消费不存在的偏移量的数据,这会抛出 OutOfRangeException 异常,并且也会重置 offset 或者失败.

以下是发送给消费者的结果格式.

```
MessageSetSend (fetch result)
 
total length     : 4 bytes
error code       : 2 bytes
message 1        : x bytes
...
message n        : x bytes

MultiMessageSetSend (multiFetch result)
 
total length       : 4 bytes
error code         : 2 bytes
messageSetSend 1
...
messageSetSend n
```

## Deletes

在一个时点下只有一个 log segment 的数据能被删除。

日志管理器允许使用可插拔的删除策略来选择哪些文件符合删除条件.

当前的删除策略会删除 N 天之前改动的日志,尽管保留最后的 N GB 数据可能有用.

为了避免锁定读，同时允许删除修改 segment 列表，我们使用 copy-on-write 形式的 segment 列表实现，在删除的同时它提供了一致的视图允许在多个 segment 列表视图上执行二进制的搜索。

## Guarantees

日志提供了配置项 M ，它控制了在强制刷盘之前的最大消息数。

启动时，日志恢复线程会运行，对最新的日志片段进行迭代，验证每条消息是否合法。

如果消息对象的总数和偏移量小于文件的长度并且消息数据包的 CRC32 校验值与存储在消息中的 CRC 校验值相匹配的话，说明这个消息对象是合法的。

如果检测到损坏，日志会在最后一个合法 offset 处截断。

请注意，有两种损坏必须处理：

由于崩溃导致的未写入的数据块的丢失和将无意义已损坏的数据块添加到文件。

原因是：通常系统不能保证文件索引节点和实际数据快之间的写入顺序，除此之外，如果在块数据被写入之前，文件索引已更新为新的大小，若此时系统崩溃，文件不会的到有意义的数据，则会导致数据丢失。

# 分布式

## Consumer Offset Tracking（消费者offset跟踪）

高级别的consumer跟踪每个分区已消费的offset，并定期提交，以便在重启的情况下可以从这些offset中恢复。

Kafka提供了一个选项在指定的broker中来存储所有给定的consumer组的offset，称为offset manager。

例如，该consumer组的所有consumer实例向offset manager（broker）发送提交和获取offset请求。

高级别的consumer将会自动处理这些过程。

如果你使用低级别的consumer，你将需要手动管理offset。

目前在低级别的java consumer中不支持，只能在Zookeeper中提交或获取offset。

如果你使用简单的Scala consumer，将可拿到offset manager，并显式的提交或获取offset。

对于包含offset manager的consumer可以通过发送GroupCoordinatorRequest到任意kafka broker，并接受GroupCoordinatorResponse响应，consumer可以继续向`offset manager broker`提交或获取offset。

如果offset manager位置变动，consumer需要重新发现offset manager。如果你想手动管理你的offset，你可以看看OffsetCommitRequest 和 OffsetFetchRequest的源码是如何实现的。

当offset manager接收到一个OffsetCommitRequest，它将追加请求到一个特定的压缩名为__consumer_offsets的kafka topic中，当offset topic的所有副本接收offset之后，offset manager将发送一个提交offset成功的响应给consumer。

万一offset无法在规定的时间内复制，offset将提交失败，consumer在回退之后可重试该提交（高级别consumer自动进行）。

broker会定期压缩offset topic，因为只需要保存每个分区最近的offset。offset manager会缓存offset在内存表中，以便offset快速获取。

当offset manager接收一个offset的获取请求，将从offset缓存中返回最新的的offset。如果offset manager刚启动或新的consumer组刚成为offset manager（成为offset topic分区的leader），则需要加载offset topic的分区到缓存中，在这种情况下，offset将获取失败，并报出OffsetsLoadInProgress异常，consumer回滚后，重试OffsetFetchRequest（高级别consumer自动进行这些操作）。

### 从ZooKeeper迁移offset到kafka

Kafka consumers在早先的版本中offset默认存储在ZooKeeper中。

可以通过下面的步骤迁移这些consumer到Kafka：

1. 在consumer配置中设置offsets.storage=kafka 和 dual.commit.enabled=true。

2. consumer做滚动消费，验证你的consumer是健康正常的。

3. 在你的consumer配置中设置dual.commit.enabled=false。

4. consumer做滚动消费，验证你的consumer是健康正常的。

回滚（就是从kafka回到Zookeeper）也可以使用上面的步骤，通过设置 offsets.storage=zookeeper。

# ZooKeeper 目录

下面给出了Zookeeper的结构和算法，用于协调consumer和broker。

## Notation

当一个path中的元素表示为[XYZ]，这意味着xyz的值不是固定的，实际上每个xyz的值可能是Zookeeper的znode，例如`/topic/[topic]`是一个目录，/topic包含一个子目录(每个topic名称)。

数字的范围如[0...5]来表示子目录0，1，2，3，4。

箭头`->`用于表示znode的内容，例如:/hello->world表示znode /hello包含值”world”。

## Broker 节点注册

```
/brokers/ids/[0...N] --> {"jmx_port":...,"timestamp":...,"endpoints":[...],"host":...,"version":...,"port":...} (ephemeral node)
```

这是当前所有broker的节点列表，其中每个提供了一个唯一的逻辑broker的id标识它的consumer（必须作为配置的一部分）。

在启动时，broker节点通过在/brokers/ids/下用逻辑broker id创建一个znode来注册它自己。

逻辑broker id的目的是当broker移动到不同的物理机器时，而不会影响消费者。

尝试注册一个已存在的broker id时将返回错误（因为2个server配置了相同的broker id）。

由于broker在Zookeeper中用的是临时znode来注册，因此这个注册是动态的，如果broker关闭或宕机，节点将消失（通知consumer不再可用）。

## Broker Topic 注册

```
/brokers/topics/[topic]/partitions/[0...N]/state --> {"controller_epoch":...,"leader":...,"version":...,"leader_epoch":...,"isr":[...]} (ephemeral node)
```

每个broker在它自己的topic下注册，维护和存储该topic分区的数据。

## Consumers and Consumer Groups

topic的consumer也在zookeeper中注册自己，以便相互协调和平衡数据的消耗。

consumer也可以通过设置offsets.storage = zookeeper将他们的偏移量存储在zookeeper中。

但是，这个偏移存储机制将在未来的版本中被弃用。因此，建议将数据迁移到kafka中。

多个consumer可组成一组，共同消费一个topic，在同一组中的每个consumer共享一个group_id。

例如，如果一个consumer是foobar，在三台机器上运行，你可能分配这个这个consumer的ID是“foobar”。这个组id是在consumer的配置文件中配置的。 

每个分区正好被一个consumer组的consumer所消费，一组中的consumer尽可能公平地分配分区。

## Consumer Id 注册

除了由所有consumer共享的group_id，每个consumer都有一个临时且唯一的consumer_id（主机名的形式:uuid）用于识别。

consumer的id在以下目录中注册。

```
/consumers/[group_id]/ids/[consumer_id] --> {"version":...,"subscription":{...:...},"pattern":...,"timestamp":...} (ephemeral node)
```

组中的每个consumer用consumer_id注册znode。znode的值包含一个map。

这个id只是用来识别在组里目前活跃的consumer，这是个临时节点，如果consumer在处理中挂掉，它就会消失。

## Consumer Offsets

消费者跟踪他们在每个分区中消耗的最大偏移量。 

如果 `offsets.storage=zookeeper`，则此值存储在ZooKeeper目录中.

```
/consumers/[group_id]/offsets/[topic]/[partition_id] --> offset_counter_value (persistent node)
```

## 分区所有者注册表 Partition Owner registry

每个代理分区由给定使用者组中的单个使用者使用。 

使用者必须在开始任何使用之前建立其对给定分区的所有权。 

为了建立其所有权，消费者在要声明的特定代理分区下的临时节点中写入自己的ID。

```
/consumers/[group_id]/owners/[topic]/[partition_id] --> consumer_node_id (ephemeral node)
```

## 集群编号

集群ID是分配给Kafka群集的唯一且不变的标识符。 

集群ID最多可以包含22个字符，并且允许的字符由正则表达式 `[a-zA-Z0-9 _ \-]+`定义，该正则表达式对应于URL安全的Base64变体使用的字符，不带填充。 

从概念上讲，它是在首次启动集群时自动生成的。

在实现方面，它是在首次成功启动具有0.10.1或更高版本的代理时生成的。 

代理在启动期间尝试从 `/cluster/id` znode获取群集ID。 

如果znode不存在，则代理将生成一个新的集群ID，并使用该集群ID创建znode。

## Broker 节点注册 Broker node registration

该券商节点基本上都是独立的，所以他们只发布关于他们有什么样的信息。

当代理连接，自行注册的代理节点登记目录下，并写了关于它的主机名和端口信息。

该 broker 还注册的现有主题，并在代理话题注册表他们的逻辑分区的列表。 

在代理上创建新主题时，它们会动态注册。

## 消费者注册算法

使用者启动时，它将执行以下操作：

1. 在其所属的使用者ID注册表中注册自己。

2. 在消费者ID注册表下注册有关更改（新消费者加入或现有消费者离开）的监视。 （每次更改都会触发更改的消费者所属的组内所有消费者之间的重新平衡。）

3. 在经纪人ID注册表下注册对更改的监视（新经纪人加入或任何现有经纪人离开）。 （每次更改都会触发所有消费者组中所有消费者之间的重新平衡。）

4. 如果使用者使用主题过滤器创建消息流，它还将在代理主题注册表下注册监视更改（正在添加新主题）的监视。 （每次更改都会触发对可用主题的重新评估，以确定主题过滤器允许哪些主题。允许的新主题将触发消费者组中所有消费者之间的重新平衡。）

5. 强迫自己重新平衡其消费群体。

## 消费者再平衡算法

消费者重新平衡算法允许组中的所有消费者就哪个消费者正在消费哪个分区达成共识。 

每次重新添加或删除同一组中的代理节点和其他使用者时，都会触发使用者重新平衡。 

对于给定的主题和给定的消费者组，经纪人分区在组内的消费者之间平均分配。 

**分区始终由单个使用者使用。** 这种设计简化了实现。 

如果我们允许一个分区由多个使用者同时使用，则该分区将发生争用，并且需要某种锁定。 

如果使用方数量超过分区数量，则某些使用方将根本无法获得任何数据。 

在重新平衡期间，我们尝试以减少每个使用者必须连接到的代理节点数量的方式将分区分配给使用者。

每个消费者在重新平衡过程中都执行以下操作：

```
1.对于C <sub> i </ sub>订阅的每个主题T
2.让P <sub> T </ sub>是产生主题T的所有分区
3.让C <sub> G </ sub>是与消费主题T的C <sub> i </ sub>在同一组中的所有消费者
4.对P <sub> T </ sub>排序（因此，同一代理上的分区将聚集在一起）
5.对C <sub> G </ sub>进行排序
6.令我为C <sub> i </ sub>在C <sub> G </ sub>中的索引位置，并令N = size（P <sub> T </ sub>）/ size（C <sub > G </ sub>）
7.将从i * N到（i + 1）* N-1的分区分配给使用者C <sub> i </ sub>
8.从分区所有者注册表中删除C <sub> i </ sub>拥有的当前条目
9.将新分配的分区添加到分区所有者注册表（我们可能需要重试此操作，直到原始分区所有者释放其所有权为止）
```

当在一个消费者上触发重新平衡时，应在大约同一时间在同一组内的其他消费者中触发重新平衡。

# Kafka 内部实现原理

![输入图片说明](https://images.gitee.com/uploads/images/2020/0817/093339_76c71b9f_508704.png)

## 点对点模式

**一对一，消费者主动拉取数据，消息收到后消息清除。**

点对点模型通常是一个基于拉取或者轮询的消息传送模型，这种模型从队列中请求信息，而不是将消息推送到客户端。

这个模型的特点是发送到队列的消息被一个且只有一个接收者接收处理，即使有多个消息监听者也是如此。

## 发布/订阅模式

**一对多，数据生产后，推送给所有订阅者。**

发布订阅模型则是一个基于推送的消息传送模型。

发布订阅模型可以有多种不同的订阅者，临时订阅者只在主动监听主题时才接收消息，而持久订阅者则监听主题的所有消息，即使当前订阅者不可用，处于离线状态。

# Kafka 架构

![输入图片说明](https://images.gitee.com/uploads/images/2020/0817/093706_c9729ced_508704.png)

1）Producer ：消息生产者，就是向kafka broker发消息的客户端。

2）Consumer ：消息消费者，向kafka broker取消息的客户端

3）Topic ：可以理解为一个队列。

4） Consumer Group （CG）：这是kafka用来实现一个topic消息的广播（发给所有的consumer）和单播（发给任意一个consumer）的手段。一个topic可以有多个CG。topic的消息会复制给consumer。如果需要实现广播，只要每个consumer有一个独立的CG就可以了。要实现单播只要所有的consumer在同一个CG。用CG还可以将consumer进行自由的分组而不需要多次发送消息到不同的topic。

5）Broker ：一台kafka服务器就是一个broker。一个集群由多个broker组成。一个broker可以容纳多个topic。

6）Partition：为了实现扩展性，一个非常大的topic可以分布到多个broker（即服务器）上，一个topic可以分为多个partition，每个partition是一个有序的队列。partition中的每条消息都会被分配一个有序的id（offset）。kafka只保证按一个partition中的顺序将消息发给consumer，不保证一个topic的整体（多个partition间）的顺序。

7）Offset：kafka的存储文件都是按照offset.kafka来命名，用offset做名字的好处是方便查找。例如你想找位于2049的位置，只要找到2048.kafka的文件即可。当然the first offset就是00000000000.kafka


# Kafka 分布式模型

Kafka每个主题的多个分区日志分布式地存储在Kafka集群上，同时为了故障容错，每个分区都会以副本的方式复制到多个消息代理节点上。

其中一个节点会作为主副本（Leader），其他节点作为备份副本（Follower，也叫作从副本）。

主副本会负责所有的客户端读写操作，备份副本仅仅从主副本同步数据。

当主副本出现故障时，备份副本中的一个副本会被选择为新的主副本。

因为每个分区的副本中只有主副本接受读写，所以每个服务器端都会作为某些分区的主副本，以及另外一些分区的备份副本，这样Kafka集群的所有服务端整体上对客户端是负载均衡的。

Kafka 的生产者和消费者相对于服务器端而言都是客户端。

Kafka 生产者客户端发布消息到服务端的指定主题，会指定消息所属的分区。

生产者发布消息时根据消息是否有键，采用不同的分区策略。消息没有键时，通过轮询方式进行客户端负载均衡；消息有键时，根据分区语义（例如hash）确保相同键的消息总是发送到同一分区。

Kafka的消费者通过订阅主题来消费消息，并且每个消费者都会设置一个消费组名称。

因为生产者发布到主题的每一条消息都只会发送给消费者组的一个消费者。

所以，如果要实现传统消息系统的“队列”模型，可以让每个消费者都拥有相同的消费组名称，这样消息就会负责均衡到所有的消费者；如果要实现“发布-订阅”模型，则每个消费者的消费者组名称都不相同，这样每条消息就会广播给所有的消费者。

分区是消费者现场模型的最小并行单位。

如下图（图1）所示，生产者发布消息到一台服务器的3个分区时，只有一个消费者消费所有的3个分区。

在下图（图2）中，3个分区分布在3台服务器上，同时有3个消费者分别消费不同的分区。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0817/094502_e826dc6f_508704.png)

假设每个服务器的吞吐量时300MB，在下图（图1）中分摊到每个分区只有100MB，而在下图（图2）中，集群整体的吞吐量有900MB。

可以看到，增加服务器节点会提升集群的性能，增加消费者数量会提升处理性能。

**Kafka的消费者消费消息时，只保证在一个分区内的消息的完全有序性，并不保证同一个主题汇中多个分区的消息顺序。**

而且，消费者读取一个分区消息的顺序和生产者写入到这个分区的顺序是一致的。

比如，生产者写入“hello”和“Kafka”两条消息到分区P1，则消费者读取到的顺序也一定是“hello”和“Kafka”。

如果业务上需要保证所有消息完全一致，只能通过设置一个分区完成，但这种做法的缺点是最多只能有一个消费者进行消费。

一般来说，只需要保证每个分区的有序性，再对消息假设键来保证相同键的所有消息落入同一分区，就可以满足绝大多数的应用。




# 参考资料

[kafka 实现思路](https://kafka.apachecn.org/documentation.html#implementation)

[Kafka 内部实现原理](https://www.cnblogs.com/ericz2j/p/11169186.html)

[kafka 的实现原理](https://www.jianshu.com/p/1c2596d2d235)

* any list
{:toc}
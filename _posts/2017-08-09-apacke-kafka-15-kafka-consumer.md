---
layout: post
title:  Apache Kafka-15-kafka consumer 消费者详解
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: false
---

# 消息消费

应用程序使用KafkaConsuner向Kafka订阅主题，并从订阅的主题上接收消息。

从Kafka读取数据不同于从其他消息系统读取数据，它涉及一些独特的概念和想法。

如果不先理解这些概念，就难以理解如何使用消费者API。

所以我们接下来先解释这些重要的概念，然后再举几个例子，演示如何使用消费者API实现不同的应用程序。

# Kafka Consumer 概念

要想知道如何从Kafka读取消息，需要先了解消费者和消费者群组的概念。

以下章节将解释这些概念。

## 消费者和消费者群组

假设我们有一个应用程序需要从一个Kafka主题读取消息并验证这些消息，然后再把它们保存起来。

应用程序需要创建一个消费者对象，订阅主题并开始接收消息，然后验证消息并保存结果。

过了一阵子，生产者往主题写人消息的速度超过了应用程序验证数据的速度，这个时候该怎么办?如果只使用单个消费者处理消息，应用程序会远跟不上消息生成的速度。

显然，此时很有必要对消费者进行横向伸缩。就像多个生产者可以向相同的主题写入消息一样，我们也可以使用多个消费者从同一个主题读取消息，对消息进行分流。

**Kafka消费者从属于消费者群组。一个群组里的消费者订阅的是同一个主题，每个消费者接收主题一部分分区的消息。**

假设主题T1有4个分区，我们创建了消费者C1，它是群组G1里唯一的消费者，我们用它订阅主题T1。

消费者C1将收到主题T1全部4个分区的消息，如图4-1所示。

- 图4-1：1个消费者收到4个分区的消息

![输入图片说明](https://images.gitee.com/uploads/images/2020/0822/165312_49be3555_508704.png)

如果在群组G1里新增一个消费者C2，那么每个消费者将分别从两个分区接收消息。我们假设消费者C1接收分区0和分区2的消息，消费者C2接收分区1和分区3的消息，如图4-2所示。

- 图4-2：2个消费者收到4个分区的消息

![输入图片说明](https://images.gitee.com/uploads/images/2020/0822/165345_1a8057cf_508704.png)

如果群组G1有4个消费者，那么每个消费者可以分配到一个分区，如图4-3所示。

- 图4-3：4个消费者收到4个分区的消息

![输入图片说明](https://images.gitee.com/uploads/images/2020/0822/165458_2d0e714c_508704.png)

如果我们往群组里添加更多的消费者，超过主题的分区数量，那么有一部分消费者就会被闲置，不会接收到任何消息，如图4-4所示。

- 图4-4：5个消费者收到4个分区的消息

![输入图片说明](https://images.gitee.com/uploads/images/2020/0822/165842_e3501785_508704.png)

往群组里增加消费者是横向伸缩消费能力的主要方式。

Kafka消费者经常会做一些高延迟的操作，比如把数据写到数据库或HDFS，或者使用数据进行比较耗时的计算。

在这些情况下，单个消费者无法跟上数据生成的速度，所以可以增加更多的消费者，让它们分担负载，每个消费者只处理部分分区的消息，这就是横向伸缩的主要手段。我们有必要为主题创建大量的分区，在负载增长时可以加人更多的消费者。

不过要注意，**不要让消费者的数量超过主题分区的数量，多余的消费者只会被闲置**。

除了通过增加消费者来横向伸缩单个应用程序外，还经常出现多个应用程序从同一个主题读取数据的情况。

实际上，Kafka设计的主要目标之一，就是要让Kafka主题里的数据能够满足企业各种应用场景的需求。在这些场景里，每个应用程序可以获取到所有的消息，而不只是其中的一部分。

**只要保证每个应用程序有自己的消费者群组，就可以让它们获取到主题所有的消息**。

不同于传统的消息系统，横向伸缩Kafka消费者和消费者群组并不会对性能造成负面影响。

在上面的例子里，如果新增一个只包含一个消费者的群组G2，那么这个消费者将从主题T1上接收所有的消息，与群组G1之间互不影响。群组G2可以增加更多的消费者，每个消费者可以消费若干个分区，就像群组G1那样，如图4-5所示。

总的来说，群组G2还是会接收到所有消息，不管有没有其他群组存在。

- 4.5 两个消费者群主对应一个主题

![输入图片说明](https://images.gitee.com/uploads/images/2020/0822/165921_cb0752db_508704.png)

简而言之，**为每一个需要获取一个或多个主题全部消息的应用程序创建一个消费者群组，然后往群组里添加消费者来伸缩读取能力和处理能力，群组里的每个消费者只处理一部分消息**。

### 个人理解

一个群组中消费的是全部消息，相同群组中的消费者共同消费这些消息。

不同群组之间对于消息的消费是独立的。

## 消费者群组和分区再均衡

我们已经从上一个小节了解到，群组里的消费者共同读取主题的分区。

一个新的消费者加人群组时，它读取的是原本由其他消费者读取的消息，当一个消费者被关闭或发生崩溃时，它就离开群组，原本由它读取的分区将由群组里的其他消费者来读取。

在主题发生变化时，比如管理员添加了新的分区，会发生分区重分配。

分区的所有权从一个消费者转移到另一个消费者，这样的行为被称为**再均衡**。

再均衡非常重要，它为消费者群组带来了高可用性和伸缩性(我们可以放心地添加或移除消费者)，不过在正常情况下，我们并不希望发生这样的行为。

在再均衡期间，消费者无法读取消息，造成整个群组一小段时间的不可用。

另外，当分区被重新分配给另一个消费者时，消费者当前的读取状态会丢失，它有可能还需要去刷新缓存，在它重新恢复状态之前会拖慢应用程序。

我们将在本章讨论如何进行安全的再均衡，以及如何避免不必要的再均衡。

消费者通过向被指派为群组协调器的broker(不同的群组可以有不同的协调器)发送心跳来维持它们和群组的从属关系以及它们对分区的所有权关系。

只要消费者以正常的时间间隔发送心跳，就被认为是活跃的，说明它还在读取分区里的消息。消费者会在轮询消息(为了获取消息)或提交偏移量时发送心跳。

如果消费者停止发送心跳的时间足够长，会话就会过期，群组协调器认为它已经死亡，就会触发一次再均衡。

如果一个消费者发生崩溃，并停止读取消息，群组协调器会等待几秒钟，确认它死亡了才会触发再均衡。在这几秒钟时间里，死掉的消费者不会读取分区里的消息。在清理消费者时，消费者会通知协调器它将要离开群组，协调器会立即触发一次再均衡，尽量降低处理停顿。

在本章的后续部分，我们将讨论一些用于控制发送心跳频率和会话过期时间的配置参数，以及如何根据实际需要来配置这些参数。

### 心跳行为在最近版本中的变化

在0.10.1版本里，Kafka社区引入了一个独立的心跳线程，可以在轮询消息的空档发送心跳。

这样一来，发送心跳的频率(也就是消费者群组用于检测发生崩溃的消费者或不再发送心跳的消者的时间)与消息轮询的频率(由处理消息所花费的时间来确定)之间就是相互独立的。

在新版本的Kafka里，可以指定消者在离开群并触发再均衡之前可以有多长时间不进行消息轮询，这样可以避免出现活锁(livelock)，比如有时候应用程序并没有崩清，只是由于某些原因导致无法正常运行，这个配置与session.timeout.ms是相互独立的，后者用于控制检测消费者发生崩清的时间和停止发送心跳的时间。

本章的剩余部分将会讨论使用旧版本Kafka会面临的一些问题，以及如何解决这些问题。本章还包括如何应对需要较长时间来处理消息的情况的讨论，这些与0.10.1或更高版本的Kafka没有太大关系。

如果你使用的是较新版本的Kafka，并且需要处理耗货较长时间的消息，只需要加大max.poll.interval.ms的值来增加轮询间隔的时长


### 分配分区是怎样的一个过程

当消费者要加人群组时，它会向群组协调器发送一个JoinGroup请求。

第一个加人群组的消费者将成为“群主”，群主从协调器那里获得群组的成员列表(列表中包含了所有最近发送过心跳的消费者，它们被认为是活跃的)，并负责给每一个消费者分配分区，它使用一个实现了PartitLonAsstgnor接口的类来决定哪些分区应该被分配给哪个消费者。

Kafka内置了两种分配策略，在后面的配置参数小节我们将深人讨论。分配完毕之后，群主把分配情况列表发送给群组协调器，协调器再把这些信息发送给所有消费者。每个消费者只能看到自己的分配信息，只有群主知道群组里所有消费者的分配信息。这个过程会在每次再均衡时重复发生。

# 创建Kafka消费者

在读取消息之前，需要先创建一个Kafka Consumer对象。

创建KafkaConsuner对象与创建KafkaProducer对象非常相似——把想要传给消费者的属性放在Properties对象里。本章后续部分会深人讨论所有的属性。

## 示例代码

### springboot 版本

> [https://houbb.github.io/2017/08/09/apacke-kafka-05-springboot](https://houbb.github.io/2017/08/09/apacke-kafka-05-springboot)

参考我们前面 kafka 整合 springboot 的文章，消费者配置如下：

```java
@Bean
KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<String, String>> kafkaListenerContainerFactory() {
    ConcurrentKafkaListenerContainerFactory<String, String> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(kafkaConsumerFactory());
    factory.setConcurrency(3);
    factory.getContainerProperties().setPollTimeout(3000);
    return factory;
}

@Bean
public ConsumerFactory<String, String> kafkaConsumerFactory() {
    return new DefaultKafkaConsumerFactory<>(kafkaConsumerProperties());
}

@Bean
public Map<String, Object> kafkaConsumerProperties() {
    Map<String, Object> props = new HashMap<>(4);
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    props.put(ConsumerConfig.GROUP_ID_CONFIG, consumerGroupId);
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    return props;
}
```

- KafkaConsumer.java

```java
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class KafkaConsumer {

    @KafkaListener(topics = "test", groupId = "default")
    public void consumer(String msg) {
        System.out.println("============= kafka 消费 " + msg);
    }

}
```

### 纯 java 版本

为了便于理解，此处我们也演示一下纯 java 的消费者版本：

```java
Map<String, Object> configs = new HashMap<>();
// 配置部分省略
KafkaConsumer<String, String> kafkaConsumer = new KafkaConsumer<>(configs);
```

## 必须属性

在这里，我们只需要使用3个必要的属性：bootstrap.servers， key.deserializer 和 value.desertaltzer. 

第1个属性bootstrap.servers指定了Kafka集群的连接字符串。它的用途与在KafkaProducer中的用途是一样的。

另外两个属性key.desertalizer 和 value.deserializer 其实就是序列化的逆过程，而是使用指定的类把字节数组转成Java对象。

第4个属性 group.id 不是必需的，不过我们现在姑且认为它是必需的。它指定了KafkaConsuner属于哪一个消费者群组。创建不属于任何一个群组的消费者也是可以的，只是这样做不太常见，在本书的大部分章节，我们都假设消费者是属于某个群组的。

## 其他属性

大部分参数都有合理的默认值，一般不需要修改它们，不过有一些参数与消费者的性能和可用性有很大关系。

接下来介绍这些重要的属性。

### fetch.min.bytes

该属性指定了消费者从服务器获取记录的最小字节数。

broker在收到消费者的数据请求时，如果可用的数据量小于fetch.min.bytes指定的大小，那么它会等到有足够的可用数据时才把它返回给消费者。

这样可以降低消费者和broker的工作负载，因为它们在主题不是很活跃的时候(或者一天里的低谷时段)就不需要来来回回地处理消息。

如果没有很多可用数据，但消费者的CPU使用率却很高，那么就需要把该属性的值设得比默认值大。

如果消费者的数量比较多，把该属性的值设置得大一点可以降低broker的工作负载。

### fetch.max.wait.ms 

我们通过 fetch.min.bytes 告诉 Kafka，等到有足够的数据时才把它返回给消费者。

而 fetch.max.wait.ms 则用于指定broker的等待时间，默认是500ms。

如果没有足够的数据流人Kafka，消费者获取最小数据量的要求就得不到满足，最终导致500ms的延迟。

如果要降低潜在的延迟(为了满足SLA)，可以把该参数值设置得小一些。

如果 fetch.max.wait.ms 被设为100ms，并且fetch.min.bytes被设为1MB，那么Kafka在收到消费者的请求后，要么返回1MB数据，要么在100ms后返回所有可用的数据，就看哪个条件先得到满足。

### max.partition.fetch.bytes

该属性指定了服务器从每个分区里返回给消费者的最大字节数。

它的默认值是1MB，也就是说，Kafka Consuner.poll()方法从每个分区里返回的记录最多不超过 max.partition.fetch.bytes 指定的字节。

如果一个主题有20个分区和5个消费者，那么每个消费者需要至少4MB的可用内存来接收记录。

在为消费者分配内存时，可以给它们多分配一些，因为如果群组里有消费者发生崩溃，剩下的消费者需要处理更多的分区。

max.partition.fetch.bytes 的值必须比broker能够接收的最大消息的字节数(通过max.message.size属性配置)大，否则消费者可能无法读取这些消息，导致消费者一直挂起重试。

在设置该属性时，另一个需要考虑的因素是消费者处理数据的时间。

消费者需要频繁调用 poll() 方法来避免会话过期和发生分区再均衡，如果单次调用 poll() 返回的数据太多，消费者需要更多的时间来处理，可能无法及时进行下一个轮询来避免会话过期，如果出现这种情况，可以把 max.partition.fetch.bytes 值改小，或者延长会话过期时间。

### session.timeout.ms 

该属性指定了消费者在被认为死亡之前可以与服务器断开连接的时间，默认是3s。

如果消费者没有在 session.timeout.ms 指定的时间内发送心跳给群组协调器，就被认为已经死亡，协调器就会触发再均衡，把它的分区分配给群组里的其他消费者，该属性与 heartbeat.interval.ms 紧密相连。 

heartbeat.interval.ms 指定了 poll() 方法发送心跳的频率， session.timeout.ms 则指定了消费者可以多久不发送心跳，所以，一般需要同时修改这两个属性。

heartbeat.interval.ms 必须比 session.timeout.ms 小，一般是 session.timeout.ms 的三分之一。

如果 session.timeout.ms 是3s，那么 heartbeat.interval.ms 就是 1s。

把 session.timeout.ms 设置的小一点，可以更快的检测和恢复崩清的节点，不过长时间的轮询或垃圾收集可能导致非预期的再均衡，把该属性的值设置得大一些，可以减少意外的再均衡，不过检测节点崩渍需要更长的时间。

### auto.offset.reset 

该属性指定了消费者在读取一个没有偏移量的分区或者偏移量无效的情况下(因消费者长时间失效，包含偏移量的记录已经过时并被删除)该作何处理，它的默认值是latest，意思是说，在偏移量无效的情况下，消费者将从最新的记录开始读取数据(在消费者启动之后生成的记录)。

另一个值是earltest，意思是说，在偏移量无效的情况下，消费者将从起始位置读取分区的记录。

### enable.auto.commit 

我们稍后将介绍儿种不同的提交偏移量的方式。

该属性指定了消费者是否自动提交偏移量，默认值是true，为了尽量避免出现重复数据和数据丢失，可以把它设为false，由自己控制何时提交偏移量，如果把它设为true，还可以通过配置 auto.conwit.interval.ms 属性来控制提交的频率。

### partition.assignment.strategy 

我们知道，分区会被分配给群组里的消费者。

ParttttonAsstgnor根据给定的消费者和主题，决定哪些分区应该被分配给哪个消费者。

Kafka有两个默认的分配策略

（1）Range

该策略会把主题的若干个连续的分区分配给消费者，假设消费者C1和消费者C2同时订阅了主题T1和主题T2，并且每个主题有3个分区，那么消费者C1有可能分配到这两个主题的分区0和分区1，而消费者C2分配到这两个主题的分区2.

因为每个主题拥有奇数个分区，而分配是在主题内独立完成的，第一个消费者最后分配到比第二个消费者更多的分区。

只要使用了Range策略，而且分区数量无法被消费者数量整除，就会出现这种情况。

（2）RoundRobin 

该策略把主题的所有分区逐个分配给消费者。

如果使用RoundRobin策略来给消费者C1和消费者C2分配分区，那么消费者C1将分到主题T1的分区0和分区2以及主题T2的分区1，消费者C2将分配到主题T1的分区1以及主题T2的分区0和分区2。

一般来说，如果所有消费者都订阅相同的主题(这种情况很常见)，RoundRobin策略会给所有消费者分配相同数量的分区(或最多就差一个分区)。

可以通过设置 `partition.assignnent.strategy` 来选择分区策略。

默认使用的是 `org.apache.kafka.clients.consuner.RangeAssignor`， 可以指定为 `org.apache.kafka.clients.consumer` 策略。

也可以自定义策略，在这种情况下，partition.assignment.strategy属性的值就是自定义类的名字。 

（3）StickyAssignor

看源码发现还有一个内置策略 `StickyAssignor`，这里简单记录一下。

粘性分配器有两个作用。 

首先，它保证分配尽可能平衡，这意味着

1. 分配给使用者的主题分区数量最多相差1个； 

2. 或每个使用者的主题分区比其他使用者少2+的使用者无法将任何这些主题分区转移给它。

其次，当发生重新分配时，它会保留尽可能多的现有分配。 

当主题分区从一个使用者移动到另一个使用者时，这有助于节省一些开销处理。

### client.id 

该属性可以是任意字符串，broker用它来标识从客户端发送过来的消息，通常被用在日志、度量指标和配额里。

### max.poll.records 

该属性用于控制单次调用call()方法能够返回的记录数量，可以帮你控制在轮询里需要处理的数据量。

### receive.buffer.bytes 和 send.buffer.bytes

socket在读写数据时用到的TCP缓冲区也可以设置大小。

如果它们被设为-1，就使用操作系统的默认值。

如果生产者或消费者与broker处于不同的数据中心内，可以适当增大这些值，因为跨数据中心的网络一般都有比较高的延迟和比较低的带宽。

# 提交和偏移量

每次调用 poll() 方法，它总是返回由生产者写人Kafka但还没有被消费者读取过的记录，我们因此可以追踪到哪些记录是被群组里的哪个消费者读取的。

之前已经讨论过，Kafka不会像其他JMS队列那样需要得到消费者的确认，这是Kafka的一个独特之处。

相反，消费者可以使用Kafka来追踪消息在分区里的位置(偏移量)。

我们把更新分区当前位置的操作叫作**提交**。

那么消费者是如何提交偏移量的呢?

消费者往一个叫作 `_consuner_offset` 的特殊主题发送消息，消息里包含每个分区的偏移量。

如果消费者一直处于运行状态，那么偏移量就没有什么用处。不过，如果消费者发生崩溃或者有新的消费者加入群组，就会触发再均衡，完成再均衡之后，每个消费者可能分配到新的分区，而不是之前处理的那个。为了能够继续之前的工作，消费者需要读取每个分区最后一次提交的偏移量，然后从偏移量指定的地方继续处理。

如果提交的偏移量小于客户端处理的最后一个消息的偏移量，那么处于两个偏移量之间的消息就会被重复处理，如图4-6所示。

- 图 4-6：提交的偏移量小于客户端处理的最后一个消息的偏移量

![输入图片说明](https://images.gitee.com/uploads/images/2020/0822/175911_3a8a0756_508704.png)

如果提交的偏移量大于客户端处理的最后一个消息的偏移量，那么处于两个偏移量之间的消息将会丢失，如图4-7所示。

- 图 4-7：提交的偏移量大于客户端处理的最后一个消息的偏移量

所以，处理偏移量的方式对客户端会有很大的影响。KafkaConsumerAPI提供了很多种方式来提交偏移量。

## 自动提交

最简单的提交方式是让消费者自动提交偏移量。

如果enable.auto.commit被设为true，那么每过5s，消费者会自动把从poll()方法接收到的最大偏移量提交上去。

提交时间间隔由auto.commit.interval.ms控制，默认值是5s。

与消费者里的其他东西一样，自动提交也是在轮询里进行的。消费者每次在进行轮询时会检查是否该提交偏移量了，如果是，那么就会提交从上一次轮询返回的偏移量。

不过，在使用这种简便的方式之前，需要知道它将会带来怎样的结果。

假设我们仍然使用默认的5s提交时间间隔，在最近一次提交之后的3s发生了再均衡，再均衡之后，消费者从最后一次提交的偏移量位置开始读取消息。

这个时候偏移量已经落后了3s，所以在这3s内到达的消息会被重复处理。可以通过修改提交时间间隔来更频繁地提交偏移量，减小可能出现重复消息的时间窗，不过这种情况是无法完全避免的。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0822/175937_24f17d4a_508704.png)

在使用自动提交时，每次调用轮询方法都会把上一次调用返回的偏移量提交上去，它并不知道具体哪些消息已经被处理了，所以在再次调用之前最好确保所有当前调用返回的消息都已经处理完毕(在调用close()方法之前也会进行自动提交)。

一般情况下不会有什么问题，不过在处理异常或提前退出轮询时要格外小心。

自动提交虽然方便，不过并没有为开发者留有余地来避免重复处理消息。

## 提交当前偏移量

大部分开发者通过控制偏移量提交时间来消除丢失消息的可能性，并在发生再均衡时减少重复消息的数量。

消费者API提供了另一种提交偏移量的方式，开发者可以在必要的时候提交当前偏移量，而不是基于时间间隔。

把auto.commit.offset设为false，让应用程序决定何时提交偏移量。

使用 comnitSync() 提交偏移量最简单也最可靠。

这个API会提交由 poll() 方法返回的最新偏移量，提交成功后马上返回，如果提交失败就抛出异常。

要记住，commitSync() 将会提交由 poll() 返回的最新偏移量，所以在处理完所有记录后要确保调用了cormitSync()，否则还是会有丢失消息的风险。

如果发生了再均衡，从最近一批消息到发生再均衡之间的所有消息都将被重复处理。

下面是我们在处理完最近一批消息后使用 commitSync() 方法提交偏移量的例子。

```java
// 开启循环
while (true) {
    ConsumerRecords<String, String> consumerRecords = kafkaConsumer.poll(100);
    for(ConsumerRecord<String, String> record : consumerRecords) {
        // 处理结果
        System.out.println("消息信息：" + record.key());
        // 同步 commit
        try {
            kafkaConsumer.commitSync();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

我们假设把记录内容打印出来就算处理完毕，这个是由应用程序根据具体的使用场景来决定的。

处理完当前批次的消息，在轮询更多的消息之前，调用conmitSync()方法提交当前批次最新的偏移量。

只要没有发生不可恢复的错误，commitSync() 方法会一直尝试直至提交成功。

如果提交失败，我们也只能把异常记录到错误日志里。

## 异步提交

手动提交有一个不足之处，在 broker 对提交请求作出回应之前，应用程序会一直阻塞，这样会限制应用程序的吞吐量。

我们可以通过降低提交频率来提升吞吐量，但如果发生了再均衡，会增加重复消息的数量。

这个时候可以使用异步提交API。我们只管发送提交请求，无需等待broker的响应。

```java
kafkaConsumer.commitAsync();
```

提交最后一个偏移量，然后继续做其他事情。

在成功提交或碰到无法恢复的错误之前，commitSync() 会一直重试，但是 commitAsync() 不会，这也是 commitAsync() 不好的一个地方。

**它之所以不进行重试，是因为在它收到服务器响应的时候，可能有一个更大的偏移量已经提交成功。**

假设我们发出一个请求用于提交偏移量2000，这个时候发生了短暂的通信问题，服务器收不到请求，自然也不会作出任何响应。与此同时，我们处理了另外一批消息，并成功提交了偏移量3000。

如果 commitAsync() 重新尝试提交偏移量2000，它有可能在偏移量3000之后提交成功。这个时候如果发生再均衡，就会出现重复消息。

我们之所以提到这个问题的复杂性和提交顺序的重要性，是因为 commitAsync() 也支持回调，在 broker 作出响应时会执行回调。

回调经常被用于记录提交错误或生成度量指标，不过如果你要用它来进行重试，一定要注意提交的顺序。

```java
kafkaConsumer.commitAsync(new OffsetCommitCallback() {
    @Override
    public void onComplete(Map<TopicPartition, OffsetAndMetadata> offsets, Exception exception) {
        // 记录对应的信息
    }
});
```

发送提交请求然后继续做其他事情，如果提交失败，错误信息和偏移量会被记录下来。

### 重试异步提交

我们可以使用一个单调递增的序列号来维护异步提交的顺序，在每次提交偏移量之后或在回调里提交偏移量时递增序列号。

在进行重试前，先检查回调的序列号和即将提交的偏移量是否相等，如果相等，说明没有新的提交，那么可以安全地进行重试。

如果序列号比较大，说明有一个新的提交已经发送出去了，应该停止重试。

## 同步和异步组合提交

一般情况下，针对偶尔出现的提交失败，不进行重试不会有太大问题，因为如果提交失败是因为临时问题导致的，那么后续的提交总会有成功的。

但如果这是发生在关闭消费者或再均衡前的最后一次提交，就要确保能够提交成功。

因此，在消费者关闭前一般会组合使用 commitAsync() 和 commitSync()。

它们的工作原理如下(后面讲到再均衡监听器时，我们会讨论如何在发生再均衡前提交偏移量：

```java
Map<String, Object> configs = new HashMap<>();
// 配置部分省略
KafkaConsumer<String, String> kafkaConsumer = new KafkaConsumer<>(configs);
kafkaConsumer.subscribe(Collections.singletonList("topicOne"));
// 开启循环
try {
    while (true) {
        ConsumerRecords<String, String> consumerRecords = kafkaConsumer.poll(100);
        for(ConsumerRecord<String, String> record : consumerRecords) {
            // 处理结果
            System.out.println("消息信息：" + record.key());
            // 异步 commit
            kafkaConsumer.commitAsync();
        }
    }
} catch (Exception e) {
    e.printStackTrace();
} finally {
    // 同步 commit
    try {
        kafkaConsumer.commitSync();
    } finally {
        kafkaConsumer.close();
    }
}
```

如果一切正常，我们使用connitAsync()方法来提交。

这样速度更快，而且即使这次提交失败，下一次提交很可能会成功。

如果直接关闭消费者，就没有所谓的“下一次提交”了，使用 commitSync() 方法会一直重试，直到提交成功或发生无法恢复的错误。

## 提交特定的偏移量

提交偏移量的频率与处理消息批次的频率是一样的。但如果想要更频繁地提交该怎么办?

如果 poll() 方法返回一大批数据，为了避免因再均衡引起的重复处理整批消息，想要在批次中间提交偏移量该怎么办?

这种情况无法通过调用 commitSync() 或 commitAsync() 来实现，因为它们只会提交最后一个偏移量，而此时该批次里的消息还没有处理完。

幸运的是，消费者API允许在调用 commitSync() 和 commitAsync() 方法时传进去希望提交的分区和偏移量的map。

假设你处理了半个批次的消息，最后一个来自主题“customers”分区3的消息的偏移量是5000，你可以调用 commitSync() 方法来提交它。

不过，因为消费者可能不只读取一个分区，你需要跟踪所有分区的偏移量，所以在这个层面上控制偏移量的提交会让代码变复杂。

下面是提交特定偏移量的例子：

```java
Map<String, Object> configs = new HashMap<>();
// 配置部分省略
KafkaConsumer<String, String> kafkaConsumer = new KafkaConsumer<>(configs);
kafkaConsumer.subscribe(Collections.singletonList("topicOne"));

// 记录偏移量信息
Map<TopicPartition, OffsetAndMetadata> offsetAndMetadataMap = new HashMap<>();
// 记录消费消息总数
int count = 0;

// 开启循环
while (true) {
    ConsumerRecords<String, String> consumerRecords = kafkaConsumer.poll(100);
    for(ConsumerRecord<String, String> record : consumerRecords) {
        // 处理消息
        System.out.println("消息信息：" + record.key());
        // 记录偏移量
        offsetAndMetadataMap.put(new TopicPartition(record.topic(), record.partition()),
                new OffsetAndMetadata(record.offset()+1, "no data"));
        // 每处理1000条记录就提交一次偏移量
        if(count % 1000 == 0) {
            kafkaConsumer.commitAsync(offsetAndMetadataMap, null);
        }
        count++;
    }
}
```


# 订阅主题

## 订阅实现

创建好消费者之后，下一步可以开始订阅主题了，`subscribe()` 方法接受一个主题列表作为参数，使用起来很简单：

```java
kafkaConsumer.subscribe(Collections.singletonList("topicOne"));
```

为了简单起见，我们创建了一个只包含单个元素的列表，主题的名字叫作 topicOne.

## subscribe 方法

实际上 subscribe 这个方法支持除了列表之外，还正则表达式：

```java
// 正则表达式
subscribe(Pattern pattern, ConsumerRebalanceListener listener)

subscribe(Pattern pattern)
```

ConsumerRebalanceListener 这个参数从名字就看的出来，是一个关于消费者 rebalance 的监听器实现。

# 轮训

消息轮询是消费者API的核心，通过一个简单的轮询向服务器请求数据。

一旦消费者订阅了主题，轮询就会处理所有的细节，包括群组协调、分区再均衡、发送心跳和获取数据，开发者只需要使用一组简单的API来处理从分区返回的数据，消费者代码的主要部分如下所示：

## 示例代码

```java
while (true) {
    ConsumerRecords<String, String> consumerRecords = kafkaConsumer.poll(100);
    for(ConsumerRecord<String, String> record : consumerRecords) {
        // 处理结果
        System.out.println("消息信息：" + record.key());
    }
}
```

这是一个无限循环，消费者实际上是一个长期运行的应用程序，它通过持续轮询向Kafka请求数据。稍后我们会介绍如何退出循环，并关闭消费者。

`kafkaConsumer.poll(100)` 这一行代码非常重要。就像鲨鱼停止移动就会死掉一样，消费者必须持续对Kafka进行轮询，否则会被认为已经死亡，它的分区会被移交给群组里的其他消费者。

传给poll()方法的参数是一个超时时间，用于控制poll()方法的阻塞时间(在消费者的缓冲区里没有可用数据时会发生阻塞)。

如果该参数被设为0，poll()会立即返回，否则它会在指定的毫秒数内一直等待broker返回数据。

poll() 方法返回一个记录列表。

每条记录都包含了记录所属主题的信息，记录所在分区的信息、记录在分区里的偏移量，以及记录的键值对。我们一般会遍历这个列表，逐条处理这些记录。

poll()方法有一个超时参数，它指定了方法在多久之后可以返回，不管有没有可用的数据都要返，超时时间的设置取决于应用程序对响应速度的要求，比如要在多长时间内把控制权归还给执行轮询的线程。

## 关闭消费者

在退出应用程序之前使用close()方法关闭消费者。

```java
// 关闭 consumer 可以放在 finally 中
consumer.close();
```

网络连接和socket也会随之关闭，并立即触发一次再均衡，而不是等待群组协调器发现它不再发送心跳井认定它已死亡因为那样需要更长的时间，导致整个群组在一段时间内无法读取消息。

轮询不只是获取数据那么简单，在第一次调用新消费者的 poll() 方法时，它会负责查找GroupCoordinator，然后加入群组，接受分配的分区。

如果发生了再均衡，整个过程也是在轮询期间进行的，当然，心跳也是从轮询里发送出去的。

所以，我们要确保在轮询期间所做的任何处理工作都应该尽快完成。

## 线程安全

在同一个群组里，我们无法让一个线程运行多个消费者，也无法让多个线程安全地共享一个消费者。

按照规则，一个消费者使用一个线程。

如果要在同一个消费者群组里运行多个消费者，需要让每个消费者运行在自己的线程里。

最好是把消费者的逻辑封装在自己的对象里，然后使用Java的ExecutorService启动多个线程，使每个消费者运行在自己的线程上。


# 再均衡监听器

在提交偏移量一节中提到过，消费者在退出和进行分区再均衡之前，会做一些清理工作。

你会在消费者失去对一个分区的所有权之前提交最后一个已处理记录的偏移量。

如果消费者谁备了一个缓冲区用于处理偶发的事件，那么在失去分区所有权之前，需要处理在缓冲区累积下来的记录。

你可能还需要关闭文件句柄、数据库连接等。

## 接口说明

ConsumerRebalanceListener有两个需要实现的方法。

```java
//方法会在再均衡开始之前和消费者停止读取消息之后被调用。如果在这里提交偏移量，下一个接管分区的消费者就知道该从哪里开始读取了。
public void onPartitionsRevoked(Collection<TopicPartition> partitions)

//方法会在重新分配分区之后和消费者开始读取消息之前被调用。
public void onPartitionsAssigned(Collection<TopicPartitton> partitions) 
```

## 例子

这里演示一下如何自定义一个在均衡监听器：

在为消费者分配新分区或移除旧分区时，可以通过消费者API执行一些应用程序代码，在调用subscribe()方法时传进去一个ConsumerRebalanceListener实例就可以了。

下面的例子将演示如何在失去分区所有权之前通过onPartitionsRevoked()方法来提交偏移量。

在下一节，我们会演示另一个同时使用了onPartitionsAssigned()方法的例子。

```java
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * 自定义
 * @author binbin.hou
 * @since 1.0.0
 */
public class DefineReBalanceListenerTest {


    // 记录偏移量信息
    private Map<TopicPartition, OffsetAndMetadata> offsetAndMetadataMap = new HashMap<>();

    // 记录消费消息总数
    private int count = 0;

    /**
     * 消费者
     */
    private KafkaConsumer<String, String> kafkaConsumer;

    private class MyReBalanceListener implements ConsumerRebalanceListener {

        @Override
        public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
            System.out.println("为了避免再平衡失去信息，此处做同步提交。");
            kafkaConsumer.commitSync(offsetAndMetadataMap);
        }

        @Override
        public void onPartitionsAssigned(Collection<TopicPartition> partitions) {

        }
    }

    /**
     * 消息消费
     */
    public void consumer() {
        Map<String, Object> configs = new HashMap<>();
        // 配置部分省略
        kafkaConsumer = new KafkaConsumer<>(configs);
        kafkaConsumer.subscribe(Collections.singletonList("topicOne"), new MyReBalanceListener());

        // 开启循环
        while (true) {
            ConsumerRecords<String, String> consumerRecords = kafkaConsumer.poll(100);
            for(ConsumerRecord<String, String> record : consumerRecords) {
                // 处理消息
                System.out.println("消息信息：" + record.key());

                // 记录偏移量
                offsetAndMetadataMap.put(new TopicPartition(record.topic(), record.partition()),
                        new OffsetAndMetadata(record.offset()+1, "no data"));
                // 每处理1000条记录就提交一次偏移量
                if(count % 1000 == 0) {
                    kafkaConsumer.commitAsync(offsetAndMetadataMap, null);
                }
                count++;
            }
        }
    }

}
```

# 从特定偏移量处开始处理记录

到目前为止，我们知道了如何使用 poll() 方法从各个分区的最新偏移量处开始处理消息。

不过，有时候我们也需要从特定的偏移量处开始读取消息。

如果你想从分区的起始位置开始读取消息，或者直接跳到分区的末尾开始读取消息，可以使 `A seekToBeginning(Collection<TopicPartition> tp)` 和 `seekToEnd(Collection<TopicPartition> tp)`这两个方法。

不过，Kafka 也为我们提供了用于查找特定偏移量的API。

它有很多用途，比如向后回退几个消息或者向前跳过几个消息(对时间比较敏感的应用程序在处理滞后的情况下希望能够向前跳过若干个消息)。

在使用Kafka以外的系统来存储偏移量时，它将给我们带来更大的惊喜。

## 简单例子

试想一下这样的场景：应用程序从Kafka读取事件(可能是网站的用户点击事件流)，对它们进行处理(可能是使用自动程序清理点击操作并添加会话信息)，然后把结果保存到数据库、NoSQL存储引擎或Hadoop。

假设我们真的不想丢失任何数据，也不想在数据库里多次保存相同的结果。

这种情况下，消费者的代码可能是这样的：

```java
public void consumerOffset() {
    Map<String, Object> configs = new HashMap<>();
    // 配置部分省略
    KafkaConsumer<String, String> kafkaConsumer = new KafkaConsumer<>(configs);
    kafkaConsumer.subscribe(Collections.singletonList("topicOne"));
    // 记录偏移量信息
    Map<TopicPartition, OffsetAndMetadata> offsetAndMetadataMap = new HashMap<>();
    // 记录消费消息总数
    int count = 0;
    // 开启循环
    while (true) {
        ConsumerRecords<String, String> consumerRecords = kafkaConsumer.poll(100);
        for(ConsumerRecord<String, String> record : consumerRecords) {
            // 记录偏移量
            offsetAndMetadataMap.put(new TopicPartition(record.topic(), record.partition()),
                    new OffsetAndMetadata(record.offset()+1, "no data"));
            //处理消息
            processRecord(record);
            storeRecordToDb(record);
            // 异步提交
            kafkaConsumer.commitAsync(offsetAndMetadataMap, null);
        }
    }
}


private void processRecord(ConsumerRecord<String, String> record) {}
private void storeRecordToDb(ConsumerRecord<String, String> record) {}
```

## 数据崩溃

在这个例子里，每处理一条记录就提交一次偏移量。

尽管如此，在记录被保存到数据库之后以及偏移量被提交之前，应用程序仍然有可能发生崩溃，导致重复处理数据，数据库里就会出现重复记录。

如果保存记录和偏移量可以在一个原子操作里完成，就可以避免出现上述情况。

记录和偏移量要么都被成功提交，要么都不提交。如果记录是保存在数据库里而偏移量是提交到Kafka上，那么就无法实现原子操作。

不过，如果在**同一个事务里把记录和偏移量都写到数据库里会怎样呢?**

ps: 其实就是将数据处理+偏移量全部放在同一个数据库事务处理，实现原子操作的一种方式。

那么我们就会知道记录和偏移量要么都成功提交，要么都没有，然后重新处理记录。

现在的问题是：如果偏移量是保存在数据库里而不是Kafka里，那么消费者在得到新分区时怎么知道该从哪里开始读取?

这个时候可以使用 seek() 方法。

在消费者启动或分配到新分区时，可以使用 seek() 方法查找保存在数据库里的偏移量。

下面的例子大致说明了如何使用这个API。

使用ConsunerRebalanceListener和seek()方法确保我们是从数据库里保存的偏移量所指定的位置开始处理消息的。

### 使用 seek()

```java
private KafkaConsumer<String, String> kafkaConsumer;

Map<String, Object> configs = new HashMap<>();
// 配置部分省略
kafkaConsumer = new KafkaConsumer<>(configs);
kafkaConsumer.subscribe(Collections.singletonList("topicOne"), new
        SaveOffsetDbRebalanceListener());
// 让消费者加入到消费者群组里，并获取分配到的分区
kafkaConsumer.poll(0);

// 重新从数据库中定位偏移量
for(TopicPartition partition : kafkaConsumer.assignment()) {
    kafkaConsumer.seek(partition, getOffsetFromDb(partition));
}

// 开启循环
while (true) {
    ConsumerRecords<String, String> consumerRecords = kafkaConsumer.poll(100);
    for(ConsumerRecord<String, String> record : consumerRecords) {
        processRecord(record);
        storeRecordToDb(record);
        storeOffsetToDb(record);
    }
    // 统一提交
    commitDbTransaction();
}
```

这里主要做两件事：

（1）consumer 启动时，根据数据库中的记录初始化偏移量

（2）消费完成后，统一提交偏移量信息到数据库。

对应的几个方法都是空代码，根据具体实现业务即可：

```java
/**
 * 获取偏移量信息
 * @param partition 分区
 * @return 偏移量
 */
private long getOffsetFromDb(final TopicPartition partition) {
    return -1;
}

/**
 * 提交事务
 */
private void commitDbTransaction() {}

/**
 * 针对数据进行处理
 * @param record 记录
 */
private void processRecord(ConsumerRecord<String, String> record) {}

/**
 * 持久化记录到数据库
 * @param record 记录
 */
private void storeRecordToDb(ConsumerRecord<String, String> record) {}

/**
 * 持久化偏移量到数据库
 * @param record 记录
 */
private void storeOffsetToDb(ConsumerRecord<String, String> record) {}
```

### SaveOffsetDbRebalanceListener 介绍

机智如你，肯定发现了 SaveOffsetDbRebalanceListener 这个类。

其实前面我们也接触过。

这个类，这次主要功能就是在 consumer 进行再均衡的时候，存储和读取对应的偏移量信息。

实现如下：

```java
private class SaveOffsetDbRebalanceListener implements ConsumerRebalanceListener {
    /**
     * 方法会在再均衡开始之前和消费者停止读取消息之后被调用。
     * @param partitions 分区信息
     */
    @Override
    public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
        // 开始再均衡之前，提交偏移量信息
        commitDbTransaction();
    }

    /**
     * 方法会在重新分配分区之后和消费者开始读取消息之前被调用。
     * @param partitions 分区信息
     */
    @Override
    public void onPartitionsAssigned(Collection<TopicPartition> partitions) {
        // 开始读取之前，初始化对应的偏移量
        for(TopicPartition partition : kafkaConsumer.assignment()) {
            kafkaConsumer.seek(partition, getOffsetFromDb(partition));
        }
    }
}
```

# 如何优雅退出

在之前讨论轮询时就说过，不需要担心消费者会在一个无限循环里轮询消息，我们会告诉消费者如何优雅地退出循环。

如果确定要退出循环，需要通过另一个线程调用 `consumer.wakeup()` 方法。

如果循环运行在主线程里，可以在 ShutdownHook 里调用该方法。

**要记住，consumer.wakeup() 是消费者唯一一个可以从其他线程里安全调用的方法。**

调用consuner.wakeup()可以退出poll()，并抛出WakeupException异常，或者如果调用 consumer.wakeup() 时线程没有等待轮询，那么异常将在下一轮调用poll()时抛出。

我们不需要处理WakeupException，因为它只是用于跳出循环的一种方式。

不过，在退出线程之前调用 consumer.close() 是很有必要的，它会提交任何还没有提交的东西，并向群组协调器发送消息，告知自己要离开群组，接下来就会触发再均衡，而不需要等待会话超时。

## 示例代码

下面是运行在主线程上的消费者退出线程的代码。

这些代码经过了简化，你可以在这里查看完整的代码：

> [SimpleMovingAvgNewConsumer](https://github.com/gwenshap/kafka-examples/blob/master/SimpleMovingAvg/src/main/java/com/shapira/examples/newconsumer/simplemovingavg/SimpleMovingAvgNewConsumer.java)

```java
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.WakeupException;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * 优雅关闭
 * @author binbin.hou
 * @since 1.0.0
 */
public class KafkaConsumerShutDownTest {

    public static void main(String[] args) {
        Map<String, Object> configs = new HashMap<>();
        // 配置部分省略
        KafkaConsumer<String, String> kafkaConsumer = new KafkaConsumer<>(configs);
        kafkaConsumer.subscribe(Collections.singletonList("topicOne"));

        // 主线程
        final Thread mainThread = Thread.currentThread();
        // Registering a shutdown hook so we can exit cleanly
        Runtime.getRuntime().addShutdownHook(new Thread() {
            public void run() {
                System.out.println("Starting exit...");
                // Note that shutdownhook runs in a separate thread, so the only thing we can safely do to a consumer is wake it up
                kafkaConsumer.wakeup();
                try {
                    mainThread.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        // 开启循环
        try {
            while (true) {
                ConsumerRecords<String, String> consumerRecords = kafkaConsumer.poll(100);
                for(ConsumerRecord<String, String> record : consumerRecords) {
                    // 处理消息
                    System.out.println(record.key());
                }

                // 提交 ack
                kafkaConsumer.commitSync();
            }
        } catch (WakeupException e) {
            // 这个异常是为了中断消费者，可以忽略
        } finally {
            kafkaConsumer.close();
            System.out.println("Consumer shutdown finish!");
        }
    }

}
```

# 反序列化

和序列化相对应，消费者会针对 byte[] 数组进行反序列化处理。

## 接口

```java
public interface Deserializer<T> extends Closeable {

    /**
     * Configure this class.
     * @param configs configs in key/value pairs
     * @param isKey whether is for key or value
     */
    void configure(Map<String, ?> configs, boolean isKey);

    /**
     * Deserialize a record value from a byte array into a value or object.
     * @param topic topic associated with the data
     * @param data serialized bytes; may be null; implementations are recommended to handle null by returning a value or null rather than throwing an exception.
     * @return deserialized typed data; may be null
     */
    T deserialize(String topic, byte[] data);

    @Override
    void close();
}
```

接口整体也比较简单。

## StringDeserializer

下面看一下默认最常用的字符串反序列化：

```java
public class StringDeserializer implements Deserializer<String> {
    private String encoding = "UTF8";

    @Override
    public void configure(Map<String, ?> configs, boolean isKey) {
        String propertyName = isKey ? "key.deserializer.encoding" : "value.deserializer.encoding";
        Object encodingValue = configs.get(propertyName);
        if (encodingValue == null)
            encodingValue = configs.get("deserializer.encoding");
        if (encodingValue != null && encodingValue instanceof String)
            encoding = (String) encodingValue;
    }

    @Override
    public String deserialize(String topic, byte[] data) {
        try {
            if (data == null)
                return null;
            else
                return new String(data, encoding);
        } catch (UnsupportedEncodingException e) {
            throw new SerializationException("Error when deserializing byte[] to string due to unsupported encoding " + encoding);
        }
    }

    @Override
    public void close() {
        // nothing to do
    }
}
```

最核心的代码就是：`new String(data, encoding)`

将原来的 byte[] 数组转换为字符串。

## 自定义

有时候我们想自定义属于自己的反序列化实现，可以自己实现这个接口实现即可。

然后在 config 中指定即可。

# 独立消费者 

为什么以及怎样使用没有群组的消费者。

到目前为止，我们讨论了消费者群组，分区被自动分配给群组里的消费者，在群组里新增或移除消费者时自动触发再均衡。

通常情况下，这些行为刚好是你所需要的，不过有时候你需要一些更简单的东西。

比如，你可能只需要一个消费者从一个主题的所有分区或者某个特定的分区读取数据。这个时候就不需要消费者群组和再均衡了，只需要把主题或者分区分配给消费者，然后开始读取消息并提交偏移量。

如果是这样的话，就不需要订阅主题，取而代之的是为自己分配分区。一个消费者可以订阅主题(并加入消费者群组)，或者为自己分配分区，但不能同时做这两件事情。

## 例子

下面的例子演示了一个消费者是如何为自己分配分区并从分区里读取消息的：

```java
Map<String, Object> configs = new HashMap<>();
// 配置部分省略
KafkaConsumer<String, String> kafkaConsumer = new KafkaConsumer<>(configs);
List<PartitionInfo> partitionInfos = kafkaConsumer.partitionsFor("topic");

if(partitionInfos != null) {
    // 初始化 topic 分区信息
    List<TopicPartition> topicPartitions = new ArrayList<>();
    for(PartitionInfo info : partitionInfos) {
        topicPartitions.add(new TopicPartition(info.topic(), info.partition()));
    }
    kafkaConsumer.assign(topicPartitions);
    while (true) {
        ConsumerRecords<String, String> consumerRecords = kafkaConsumer.poll(100);
        for(ConsumerRecord<String, String> record : consumerRecords) {
            // 处理消息
            System.out.println(record.key());
        }
        // 提交 ack
        kafkaConsumer.commitSync();
    }
}
```

除了不会发生再均衡，也不需要手动查找分区，其他的看起来一切正常。

不过要记住，如果主题增加了新的分区，消费者并不会收到通知。

所以，要么周期性地调用 `consumer.partitionsFor()` 方法来检查是否有新分区加入，要么在添加新分区后重启应用程序。

# 小结

本文主要学习了 kafka 生产者的创建、消息发送、序列化、分区等内容。

让我们对 kafka 有了更深一步的认识，后续将对 Kafka 消费者进行详细讲解。

# 参考资料

《kafka 权威指南》

* any list
{:toc}
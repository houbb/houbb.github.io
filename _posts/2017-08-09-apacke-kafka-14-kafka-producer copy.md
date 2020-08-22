---
layout: post
title:  Apache Kafka-14-kafka producer 生产者详解
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: false
---

# 前言

前面，我们学习了[kafka 与 springboot 整合](https://houbb.github.io/2017/08/09/apacke-kafka-05-springboot)，已经可以在程序中快乐的使用 kafka 了。

但是实际使用过程中总是会遇到各种各样的问题，这就需要我们对 kafka 有进一步的理解，本文就和大家一起学习一下 kafka 生产者的相关知识。

本文将从以下几个方面展开：

（1）kafka 生产者消息发送流程

（2）如何创建一个 kafka 生产者

（3）kafka 生产者的相关配置详解

（4）kafka 生产者发送消息的方式详解

（5）序列化讲解

# kafka 生产者

不管是把Kafka作为消息队列、消息总线还是数据存储平台来使用，总是需要有一个可以往Kafka写人数据的生产者和一个可以从Kafka读取数据的消费者，或者一个兼具两种角色的应用程序。

例如，在一个信用卡事务处理系统里，有一个客户端应用程序，它可能是一个在线商店，每当有支付行为发生时，它负责把事务发送到Kafka上。另一个应用程序根据规则引擎检查这个事务，决定是批准还是拒绝。批准或拒绝的响应消息被写回Kafka，然后发送给发起事务的在线商店。第三个应用程序从Kafka上读取事务和审核状态，把它们保存到数据库，随后分析师可以对这些结果进行分析，或许还能借此改进规则引擎。

开发者们可以使用Kafka内置的客户端API开发Kafka应用程序。

在这一章，我们将从Kafka生产者的设计和组件讲起，学习如何使用Kafka生产者。

我们将演示如何创建KafkaProducer和ProducerRecords对象、如何将记录发送给Kafka，以及如何处理从Kafka返回的错误，然后介绍用于控制生产者行为的重要配置选项，最后深入探讨如何使用不同的分区方法和序列化器，以及如何自定义序列化器和分区器。

在第4章，我们将会介绍Kafka的消费者客户端，以及如何从Kafka读取消息。

## 第三方客户端

除了内置的客户端外，Kafka还提供了二进制连接协议，也就是说，我们直接向Kafka网络端口发送适当的字节序列，就可以实现从Kafka读取消息或往Kafka写人消息。

还有很多用其他语言实现的Kafka客户端，比如C++、Python、Go语言等，它们都实现了Kafka的连接协议，使得Kafka不仅仅局限于在Java里使用。

这些客户端不属于Kafka项目，不过Kafka项目wiki上提供了一个清单，列出了所有可用的客户端。

连接协议和第三方客户端超出了本章的讨论范围。

## 3.1 生产者概览

一个应用程序在很多情况下需要往Kafka写人消息：记录用户的活动(用于审计和分析)、记录度量指标、保存日志消息、记录智能家电的信息、与其他应用程序进行异步通信、缓冲即将写人到数据库的数据，等等。

多样的使用场景意味着多样的需求：是否每个消息都很重要?是否允许丢失一小部分消息?偶尔出现重复消息是否可以接受?是否有严格的延迟和吞吐量要求?

在之前提到的信用卡事务处理系统里，消息丢失或消息重复是不允许的，可以接受的延迟最大为500ms，对吞吐量要求较高———我们希望每秒钟可以处理一百万个消息。

保存网站的点击信息是另一种使用场景。在这个场景里，允许丢失少量的消息或出现少量的消息重复，延迟可以高一些，只要不影响用户体验就行。换句话说，只要用户点击链接后可以马上加载页面，那么我们并不介意消息要在几秒钟之后才能到达Kafka服务器。吞吐量则取决于网站用户使用网站的频度。

不同的使用场景对生产者API的使用和配置会有直接的影响。

尽管生产者API使用起来很简单，但消息的发送过程还是有点复杂的。

图3-1展示了向Kafka发送消息的主要步骤。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0822/093902_0890b5c7_508704.png)

ProducerRecord 中包含了我们需要发送的内容。我们还可以指定键或分区。在发送ProducerRecord对象时，生产者要先把键和值对象序列化成字节数组，这样它们才能够在网络上传输。

接下来，数据被传给分区器。如果之前在ProducerRecord对象里指定了分区，那么分区器就不会再做任何事情，直接把指定的分区返回。

如果没有指定分区，那么分区器会根据ProducerRecord对象的键来选择一个分区。

选好分区以后，生产者就知道该往哪个主题和分区发送这条记录了。

紧接着，这条记录被添加到一个记录批次里，这个批次里的所有消息会被发送到相同的主题和分区上。

有一个独立的线程负责把这些记录批次发送到相应的 broker .

服务器在收到这些消息时会返回一个响应。

如果消息成功写人Kafka，就返回一个RecordMetaData对象，它包含了主题和分区信息，以及记录在分区里的偏移量。

如果写入失败，则会返回一个错误。生产者在收到错误之后会尝试重新发送消息，几次之后如果还是失败，就返回错误信息。

### 个人感受

实际上这里已经整体给出了发送者做的事情，如果我们自己实现一个 mq，可以大体参考这种思路。

（1）定义消息体

（2）针对消息体进行序列化，保证可以在网络上传输。

（3）分区处理，主要根据 key 进行分区。类似于数据库中的 sharding。

（4）消息发送到对应的 broker，进行持久化。

如果失败，则可以进行重试

如果成功，则直接返回对应的元数据

# 3.2 创建Kafka生产者

## 代码

先看一段 [kafka 与 springboot 整合](https://houbb.github.io/2017/08/09/apacke-kafka-05-springboot)中的配置代码：

> https://houbb.github.io/2017/08/09/apacke-kafka-05-springboot

```java
@Bean
public Map<String, Object> kafkaProducerProperties() {
    Map<String, Object> props = new HashMap<>();
    props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    // 后续可以调整为可配置
    props.put(ProducerConfig.RETRIES_CONFIG, 3);
    props.put(ProducerConfig.ACKS_CONFIG, "all");
    //producer将试图批处理消息记录，以减少请求次数。这将改善client与server之间的性能。这项配置控制默认的批量处理消息字节数。
    props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
    //producer组将会汇总任何在请求与发送之间到达的消息记录一个单独批量的请求,1秒延迟
    props.put(ProducerConfig.LINGER_MS_CONFIG, 1);
    //producer可以用来缓存数据的内存大小
    props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);
    //每次尝试增加的额外的间隔时间
    props.put(ProducerConfig.RETRY_BACKOFF_MS_CONFIG, 300);
    return props;
}

@Bean
public ProducerFactory<String, String> kafkaProducerFactory() {
    return new DefaultKafkaProducerFactory<>(kafkaProducerProperties());
}
```

配置就是为了适应不同的应用场景而进行设置的。

下面我们对这些配置进行初步的学习。

## 必要性配置

要往Kafka写入消息，首先要创建一个生产者对象，并设置一些属性。

Kafka生产者有3个必选的属性。

### bootstrap.servers

该属性指定broker的地址清单，地址的格式为host：port。

清单里不需要包含所有的broker地址，生产者会从给定的broker里查找到其他broker的信息。

不过建议至少要提供两个broker的信息，一旦其中一个宕机，生产者仍然能够连接到集群上。

### key.serializer

broker希望接收到的消息的键和值都是字节数组。

生产者接口允许使用参数化类型，因此可以把Java对象作为键和值发送给broker。

这样的代码具有良好的可读性，不过生产者需要知道如何把这些Java对象转换成字节数组。

key.serializer必须被设置为 `StringSerializer` 用这个类把键对象序列化成字节数组。

Kafka客户端默认提供了ByteArraySerializer(这个只做很少的事情)、StringSerializer和IntegerSerializer，因此，如果你只使用常见的几种Java对象类型，那么就没必要实现自己的序列化器。

要注意，key.serializer是必须设置的，就算你打算只发送值内容。

### value.serializer

与key.serializer一样，value.serializer指定的类会将值序列化。

如果键和值都是字符串，可以使用与key.serializer一样的序列化器。

如果键是整数类型而值是字符串，那么需要使用不同的序列化器。

ps: 其实个人认为后面两个也可以给一个默认值。大部分开发者实际也没有那么关心对应的实现。

## 其他配置属性

到目前为止，我们只介绍了生产者的几个必要配置参数——bootstrap.serversAPI以及序列化器。

生产者还有很多可配置的参数，在Kafka文档里都有说明，它们大部分都有合理的默认值，所以没有必要去修改它们。

不过有几个参数在内存使用、性能和可靠性方面对生产者影响比较大，接下来我们会一一说明。

ps: 下面的参数理解即可，需要的时候进行查阅。不需要死记硬背。

### 1. acks

acks参数指定了必须要有多少个分区副本收到消息，生产者才会认为消息写人是成功的。这个参数对消息丢失的可能性有重要影响。

该参数有如下选项。

如果acks=0，生产者在成功写入消息之前不会等待任何来自服务器的响应。也就是说，如果当中出现了问题，导致服务器没有收到消息，那么生产者就无从得知，消息也就丢失了。不过，因为生产者不需要等待服务器的响应，所以它可以以网络能够支持的最大速度发送消息，从而达到很高的吞吐量。

如果acks=1，只要集群的首领节点收到消息，生产者就会收到一个来自服务器的成功响应。如果消息无法到达首领节点(比如首领节点崩溃，新的首领还没有被选举出来)，生产者会收到一个错误响应，为了避免数据丢失，生产者会重发消息。不过，如果一个没有收到消息的节点成为新首领，消息还是会丢失。这个时候的吞吐量取决于使用的是同步发送还是异步发送。如果让发送客户编等待服务器的响应(通过调用Future对象的get()方法)，显然会增加延迟(在网络上传输一个来的延迟)。如果客户使用回请，延迟问题就可以得到缓解，不过吞吐量还是会受发送中消息数量的限制(比如，生产者在收到服务器响应之前可以发送多少个消息)。

如果acks=all，只有当所有参与复制的节点全部收到消息时，生产者才会收到一个来自服务器的成功响应。这种模式是最安全的，它可以保证不止一个服务器收到消息，就算有服务器发生崩渍，整个集群仍然可以运行(第5章将讨论更多的细节)，不过，它的延迟比acks=1时更高，因为我们要等椅不只一个服务器节点接收消息

ps: 比如 mongodb 会有 major 这个概念，也就是大部分都写入成功，则认为是成功。在分布式系统中，为了保证数据的一致性，实际上大部分写入成功即可，这样可以避免被最慢的服务器拖累。

### 2. buffer.memory 

该参教用来设置生产者内存缓冲区的大小，生产者用它缓冲要发送到服务器的消息，如果应用程序发送消息的速度超过发送到服务器的速度，会导致生产者空间不足，这个时候，send()方法调用要么被阻塞，要么抛出异常，取决于如何设置`block.on.buffer.full`参数(在0.9.0.0版本里被替换成了`max.block.ms`，表示在抛出异常之前可以阻塞一段时间)

ps: 新版就体现了属性命名的艺术。max.block.ms 可以很容易理解是最大的阻塞时间，而且时间单位是 ms，这个值得很多框架去学习。而不是每次写属性都不记得单位是什么，然后还去查一遍文档。

### 3. compression.type 

默认情况下，消息发送时不会被压缩。

该参数可以设置为snappy，gztp或Lz4，它指定了消息被发送给broker之前使用哪一种压缩算法进行压缩，snappy压缩算法由Google发明，它占用较少的CPU，却能提供较好的性能和相当可观的压缩比，如果比较关注性能和网络带宽，可以使用这种算法。

gzip压算法一般会占用较多的CPU，但会提供更高的压缩比，所以如果网络带宽比较有限，可以使用这种算法，使用压缩可以降低网络传输开销和存储开销，而这往往是向Kafka发送消息的瓶颈所在。

ps: 网络传输一般都会是整个交互流程的瓶颈，不过是否压缩主要取决于消息体的大小。如果压缩+解压缩的耗时，小于压缩部分的网络传输耗时，那么这个压缩就是值得的。一般的 mq 消息体都不大，不需要压缩。具体取决于我们的应用场景。

### 4. retries 

如果一次不行，那就再试一次。——鲁迅。

生产者从服务器收到的错误有可能是临时性的错误(比如分区找不到首领)，在这种情况下，retrtes参数的值决定了生产者可以重发消息的次数，如果达到这个次数，生产者会放弃重试并返回错误。

默认情况下，生产者会在每次重试之间等待100ms，不过可以通过 `retry.backoff.ns` 参数来改变这个时间间隔。

建议在设置重试次数和重试时间间隔之前，先测试一下恢复一个崩清节点需要多少时间(比如所有分区选举出首领需要多长时间)，让总的重试时间比Kafka集群从崩溃中恢复的时间长，否则生产者会过早地放弃重试。

不过有些错误不是临时性错误，没办法通过重试来解决(比如“消息太大”错误)，一般情况下，因为生产者会自动进行重试，所以就没必要在代码逻辑里处理那些可重试的错误，你只需要处理那些不可重试的错误或重试次数超出上限的情况。

ps: 其实重试中也有很大的学问，可以参考学习下 [https://github.com/houbb/sisyphus](https://github.com/houbb/sisyphus)

###  5. batch.size

当有多个消息需要被发送到同一个分区时，生产者会把它们放在同一个批次里，该参数指定了一个批次可以使用的内存大小，按照字节数计算(而不是消息个数)。

当批次被填满，批次里的所有消息会被发送出去。不过生产者并不一定都会等到批次被填满才发送，半满的批次，甚至只包含一个消息的批次也有可能被发送，所以就算把批次大小设置得很大，也不会造成延迟，只是会占用更多的内存而已，但如果设置得太小，因为生产者需要更频繁地发送消息，会增加一些额外的开销。

ps: 批次处理，可以大大提升吞吐量。不过同时也带来了一个实时性问题，这个在磁盘的持久化等场景也有类似的权衡。

### 6. linger.ms 

读参数指定了生产者在发送批次之前等待更多消息加人批次的时间，KafkaProducer会在批次填满成 `linger.ms`  达到上限时把批次发送出去。

默认情况下，只要有可用的线程，生产者就会把消息发送出去，就算批次里只有一个消息。

把 `linger.ms` 设置成比0大的数，让生产者在发送批次之前等待一会儿，使更多的消息加人到这个批次。

虽然这样会增加延迟，但也会提升吞吐量(因为一次性发送更多的消息，每个消息的开销就变小了)

### 7. client.id 

该参数可以是任意的字符串，服务器会用它来识别消息的来源。还可以用在日志和配指标里，

###  8. max.in.flight.requests.per.connection 

该参数指定了生产者在收到服务器响应之前可以发送多少个消息，它的值越高，就会占用越多的内存，不过也会提升吞吐量，把它设为1可以保证消息是按照发送的顺序写入服务器的，即使发生了重试。

###  9. timeout.ms， request.timeout.ms 和 metadata.fetch.timeout.ms 

request.timeout.ms 指定了生产者在发送数据时等待服务器返同响应的时间，metadata.fetch.timeout.ms 指定了生产者在获取元数据(比如目标分区的首领是谁)时等待服务器返回响应的时间。

如果等待响应超时，那么生产者要么重试发送数据，要么返一个错误(抛出异常或执行回调)，timeout.ms 指定了broker等待同步副本返回消息确认的时间，与asks的配置相匹配—如果在指定时间内没有收到同步副本的确认，那么broker就会返回一个错误

### 10. max.block.ms 

该参数指定了在调用send()方法或使用partittonsFor()方法疾取元数据时生产者的阻塞时间。当生产者的发送缓冲区已满，或者没有可用的元数据时，这些方法就会阻塞。在用塞时间达到nax.bLock.ns时，生产者会抛出超时异常。

### 11. max.request.size

该参数用于控制生产者发送的请求大小，它可以指能发送的单个消息的最大值，也可以指单个请求里所有消息总的大小。

例如，假设这个值为IMB，那么可以发送的单个最大消息为IMB，或者生产者可以在单个请求里发送一个批次，该批次包含了1000个消息，每个消息大小为1KB。另外，broker对可接收的消息最大值也有自己的限制(nessage.rax.bytes)，所以两边的配置最好可以匹配，避免生产者发送的消息被broker拒绝。

### 12. receive.buffer.bytes 和 send.buffer.bytes

这两个参数分别指定了TCP socket接收和发送数据包的缓冲区大小，如果它们被设为-1，就使用操作系统的默认值，如果生产者或消费者与broker处于不同的数据中心，那么可以适当增大这些值，因为跨数据中心的网络一般都有比较高的延迟和比较低的带宽。

## 顺序保证

Kafka可以保证同一个分区里的消息是有序的。

也就是说，如果生产者按照一定的顺序发送消息，broker就会按照这个顺序把它们写入分区，消费者也会按照同样的顺序读取它们。

在某些情况下，顺序是非常重要的。

例如，往一个账户存入100元再取出来，这个与先取钱再存钱是截然不同的!不过，有些场景对顺序不是很敏感。

如果把retries设为非零整数，同时把max.in.flight.requests.per.connection设为比1大的数，那么，如果第一个批次消息写入失败，而第二个批次写入成功，broker会重试写入第一个批次。

如果此时第一个批次也写入成功，那么两个批次的顺序就反过来了。

一般来说，如果某些场景要求消息是有序的，那么消息是否写入成功也是很关键的，所以不建议把retries设为0。

可以把max.in.flight.requests.per.connection设为1，这样在生产者尝试发送第一批消息时，就不会有其他的消息发送给broker。

不过这样会严重影响生产者的吞吐量，所以只有在对消息的顺序有严格要求的情况下才能这么做。

# kafka 消息发送

## 消息发送代码实现

- 与 spring 整合

```java
@Autowired
private KafkaTemplate kafkaTemplate;

public void sendMsg() {
    System.out.println("=============Kafka 发送消息");
    kafkaTemplate.send("test", "info");
}
```

- 简易版

实际上 kafkaTemplate 是对 kafka 进行了封装。

我们自己实现的话，代码如下：

```java
Map<String, Object> configs = new HashMap<>();
// 配置部分省略
KafkaProducer<String, String> kafkaProducer = new KafkaProducer<>(configs);
ProducerRecord<String, String> record = new ProducerRecord<>("topic", "key", "value");
kafkaProducer.send(record);
```

## 发送方式

实例化生产者对象后，接下来就可以开始发送消息了。发送消息主要有以下3种方式。

### 发送并忘记(fire-and-forget)

我们把消息发送给服务器，但并不关心它是否正常到达。大多数情况下，消息会正常到达，因为Kafka是高可用的，而且生产者会自动尝试重发。

不过，使用这种方式有时候也会丢失一些消息。

### 同步发送

我们使用send()方法发送消息，它会返回一个Future对象，调用get()方法进行等待，就可以知道消息是否发送成功。

ps: 其实 kafka 的操作还是异步执行的，我们所谓的同步，不过是在同步等待处理结果而已。

### 异步发送

我们调用send()方法，并指定一个回调函数，服务器在返回响应时调用该函数。

在下面的几个例子中，我们会介绍如何使用上述几种方式来发送消息，以及如何处理可能发生的异常情况。

本章的所有例子都使用单线程，但其实生产者是可以使用多线程来发送消息的。刚开始的时候可以使用单个消费者和单个线程。

如果需要更高的吞吐量，可以在生产者数量不变的前提下增加线程数量。

如果这样做还不够，可以增加生产者数量。

## 同步发送

send() 方法返回的是一个 Future 对象：

```java
public Future<RecordMetadata> send(ProducerRecord<K, V> record) {
    return send(record, null);
}
```

我们通过 get() 直接获取对应的结果信息：

```java
RecordMetadata recordMetadata = kafkaProducer.send(record).get();
```

metadata 中我们可以获取偏移量等基本信息：

```java
private final long offset;
// The timestamp of the message.
// If LogAppendTime is used for the topic, the timestamp will be the timestamp returned by the broker.
// If CreateTime is used for the topic, the timestamp is the timestamp in the corresponding ProducerRecord if the
// user provided one. Otherwise, it will be the producer local time when the producer record was handed to the
// producer.
private final long timestamp;
private final int serializedKeySize;
private final int serializedValueSize;
private final TopicPartition topicPartition;
```

### 发送异常

如果在发送数据之前或者在发送过程中发生了任何错误，比如broker返回了一个不允许重发消息的异常或者已经超过了重发的次数，那么就会抛出异常。

KafkaProducer一般会发生两类错误。

其中一类是可重试错误，这类错误可以通过重发消息来解决。比如对于连接错误，可以通过再次建立连接来解决，“无主(noleader)”错误则可以通过重新为分区选举首领来解决。KafkaProducer可以被配置成自动重试，如果在多次重试后仍无法解决问题，应用程序会收到一个重试异常。

另一类错误无法通过重试解决，比如“消息太大”异常。对于这类错误，KafkaProducer不会进行任何重试，直接抛出异常。

## 异步发送消息

假设消息在应用程序和Kafka集群之间一个来回需要10ms。

如果在发送完每个消息后都等待回应，那么发送100个消息需要1秒。

但如果只发送消息而不等待响应，那么发送100个消息所需要的时间会少很多。

大多数时候，我们并不需要等待响应——尽管Kafka会把目标主题、分区信息和消息的偏移量发送回来，但对于发送端的应用程序来说不是必需的。

不过在遇到消息发送失败时，我们需要抛出异常、记录错误日志，或者把消息写人“错误消息”文件以便日后分析。

为了在异步发送消息的同时能够对异常情况进行处理，生产者提供了回调支持。

实际开发中，我们一般使用异步发送的方式，通过回调去处理发送的结果。

### Callback 的例子

最基础的我们可以实现一个 Callback 接口:

```java
import org.apache.kafka.clients.producer.Callback;
import org.apache.kafka.clients.producer.RecordMetadata;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class KafkaProducerCallback implements Callback {

    @Override
    public void onCompletion(RecordMetadata metadata, Exception exception) {

    }

}
```

这个是比较基础的，我们也可以实现另一个接口，这里替我们进行简单的结果状态区分。

### 代码实现

下面是实现 ProducerListener 的一个例子。

```java
import org.apache.kafka.clients.producer.RecordMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.support.ProducerListener;
import org.springframework.stereotype.Component;

/**
 * @author binbin.hou
 */
@Component
public class KafkaProducerListener implements ProducerListener<String, String> {

    private static final Logger LOG = LoggerFactory.getLogger(KafkaProducerListener.class);

    @Override
    public void onSuccess(String topic, Integer partition,
                          String key, String value,
                          RecordMetadata recordMetadata) {
        LOG.info("[Kafka] send success, topic: {}, value: {}", topic, value);
    }

    @Override
    public void onError(String topic, Integer partition,
                        String key, String value, Exception e) {
        LOG.error("[Kafka] send fail, topic: {}, value: {}", topic, value, e);
    }

    /**
     * 方法返回值代表是否启动kafkaProducer监听器
     */
    @Override
    public boolean isInterestedInSuccess() {
        LOG.info("kafkaProducer监听器启动:KafkaProducerListener ");
        return true;
    }

}
```

# 序列化

提到序列化，我想大家都不陌生。

## 基础知识

如果你感觉到陌生，那么下面几篇文章可以学习一下，作为入门：

序列化入门：[https://houbb.github.io/2018/09/06/java-serial](https://houbb.github.io/2018/09/06/java-serial)

序列化标识详解：[https://houbb.github.io/2018/09/06/java-serial-id-02](https://houbb.github.io/2018/09/06/java-serial-id-02)

## StringSerializer

我们直接来看一下 kafka 最常用的 StringSerializer 序列化，实现代码其实不难：

```java
public class StringSerializer implements Serializer<String> {

    private String encoding = "UTF8";

    @Override
    public void configure(Map<String, ?> configs, boolean isKey) {
        String propertyName = isKey ? "key.serializer.encoding" : "value.serializer.encoding";
        Object encodingValue = configs.get(propertyName);
        if (encodingValue == null)
            encodingValue = configs.get("serializer.encoding");
        if (encodingValue != null && encodingValue instanceof String)
            encoding = (String) encodingValue;
    }

    @Override
    public byte[] serialize(String topic, String data) {
        try {
            if (data == null)
                return null;
            else
                return data.getBytes(encoding);
        } catch (UnsupportedEncodingException e) {
            throw new SerializationException("Error when serializing string to byte[] due to unsupported encoding " + encoding);
        }
    }

    @Override
    public void close() {
        // nothing to do
    }
}
```

默认使用 UTF-8 编码，首先对配置进行读取。

实现最核心的部分就是：`data.getBytes(encoding)`

## 自定义

直接实现上面的 `Serializer` 接口，然后添加我们自己的序列化实现即可。

## 常见的序列化的实现方式

其实接触过其他 rpc 的同学已经知道，序列化的方式有很多，主要是二进制和 json 两大阵营。

二者一直就性能和易读性相爱相杀。

可以阅读 json 相关文长，此处不做展开。

> https://houbb.github.io/2018/07/20/json-00-overview

# 分区

在之前的例子里，ProducerRecord对象包含了目标主题、键和值。

Kafka的消息是一个个键值对，ProducerRecord对象可以只包含目标主题和值，键可以设置为默认的null，不过大多数应用程序会用到键。

## key 的作用

键有两个用途：可以作为消息的附加信息，也可以用来决定消息该被写到主题的哪个分区。拥有相同键的消息将被写到同一个分区。也就是说，如果一个进程只从一个主题的分区读取数据，那么具有相同键的所有记录都会被该进程读取。

要创建一个包含键值的记录，只需像下面这样创建 ProducerRecord：

```java
ProducerRecord<String, String> record = new ProducerRecord<>("topic", "key", "value");
ProducerRecord<String, String> record2 = new ProducerRecord<>("topic", "value");
```

## 默认分区器

record2 这里的键被设为null。

如果键值为null，并且使用了默认的分区器，那么记录**将被随机地发送到主题内各个可用的分区上**。

分区器使用轮询(RoundRobin)算法将消息均衡地分布到各个分区上。

如果键不为空，并且使用了默认的分区器，那么Kafka会对键进行散列(使用Kafka自己的散列算法，即使升级Java版本，散列值也不会发生变化，然后根据散列值把消息映射到特定的分区上。

这里的关键之处在于，同一个键总是被映射到同一个分区上，所以在进行映射时，我们会使用主题所有的分区，而不仅仅是可用的分区。

这也意味着，如果写人数据的分区是不可用的，那么就会发生错误。但这种情况很少发生。我们将在后续讨论Kafka的复制功能和可用性。

只有在不改变主题分区数量的情况下，键与分区之间的映射才能保持不变。

举个例子，在分区数量保持不变的情况下，可以保证用户045189的记录总是被写到分区34。在从分区读取数据时，可以进行各种优化。不过，一旦主题增加了新的分区，这些就无法保证了——旧数据仍然留在分区34，但新的记录可能被写到其他分区上。如果要使用键来映射分区，那么最好在创建主题的时候就把分区规划好(第2章介绍了如何确定合适的分区数量)，而且永远不要增加新分区。

## 实现自定义分区策略

我们已经讨论了默认分区器的特点，它是使用次数最多的分区器。不过，除了散列分区之外，有时候也需要对数据进行不一样的分区。

假设你是一个B2B供应商，你有一个大客户，它是手持设备Banana的制造商。Banana占据了你整体业务10%的份额。如果使用默认的散列分区算法，Banana的账号记录将和其他账号记录一起被分配给相同的分区，导致这个分区比其他分区要大一些。服务器可能因此出现存储空间不足、处理缓慢等问题。

我们需要给Banana分配单独的分区，然后使用散列分区算法处理其他账号。

### 实现方式

我们可以通过实现 `Partitioner` 接口，定义符合自己业务场景的分区器：

```java
import org.apache.kafka.clients.producer.Partitioner;
import org.apache.kafka.common.Cluster;

import java.util.Map;

/**
 * 自定义分区器
 * @author binbin.hou
 */
public class DefinePartitioner implements Partitioner {

    @Override
    public int partition(String topic, Object key, byte[] keyBytes, Object value, byte[] valueBytes, Cluster cluster) {
        // 实现分区逻辑
        return 0;
    }

    @Override
    public void close() {

    }

    @Override
    public void configure(Map<String, ?> configs) {

    }
}
```

# 小结

本文主要学习了 kafka 生产者的创建、消息发送、序列化、分区等内容。

让我们对 kafka 有了更深一步的认识，后续将对 Kafka 消费者进行详细讲解。

# 参考资料

《kafka 权威指南》

* any list
{:toc}
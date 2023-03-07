---
layout: post
title:  kafka 常见面试题
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, mq, sh]
published: true
---

# 系列目录

[spring 常见面试题](https://houbb.github.io/2022/05/10/interview-01-spring)

[spring-boot 常见面试题](https://houbb.github.io/2022/05/10/interview-02-springboot)

[redis 常见面试题](https://houbb.github.io/2022/05/10/interview-04-redis)

[mysql 常见面试题](https://houbb.github.io/2022/05/10/interview-05-mysql)

[mq 常见面试题](https://houbb.github.io/2022/05/10/interview-07-mq)

[rpc/dubbo 常见面试题](https://houbb.github.io/2022/05/10/interview-06-dubbo)

[ZooKeeper 面试题](https://houbb.github.io/2022/05/10/interview-08-zookeeper)

[JVM 常见面试题之双亲委派](https://houbb.github.io/2022/05/10/interview-09-jvm-classloader)

[JVM 常见面试题之 GC 垃圾回收](https://houbb.github.io/2022/05/10/interview-09-jvm-gc)

[JVM 常见面试题之 java 内存结构](https://houbb.github.io/2022/05/10/interview-09-jvm-struct)

[JVM 常见面试题之 java 内存结构2](https://houbb.github.io/2022/05/10/interview-11-java-jvm)

[【面试】mybatis 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-03-mybatis)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

[java 基础之 event 事件机制](https://houbb.github.io/2022/05/10/interview-11-java-basic-event)

[Reflection-01-java 反射机制](https://houbb.github.io/2018/07/01/reflection-01-overview)

[distributed 分布式相关专题汇总](https://houbb.github.io/2022/05/10/interview-11-java-distribute)

[web 常见面试题](https://houbb.github.io/2022/05/10/interview-11-java-web)

[其他常见面试题](https://houbb.github.io/2022/05/10/interview-12-other)

# 拓展阅读

[Kafka 为什么这么快](https://houbb.github.io/2018/09/19/kafka-fast-reason)

# 关于Kafka的分区：

开始使用Kafka的时候，没有分区的概念，以为类似于传统的MQ中间件一样，就直接从程序中获取Kafka中的数据。

后来程序搭建了多套，发现永远只有一个消费者（消费者应用部署在多个tomcat上）会从Kafka中获取数据进行处理，后来才知道有分区这么一个概念。

具体不说了，网上有很多资料，总的概括：Kafka的分区，相当于把一个Topic再细分成了多个通道，一个消费者应用可以从一个分区或多个分区中获取数据。

有4个分区，1个消费者：这一个消费者需要负责消费四个分区的数据。

有4个分区，2个消费者：每个消费者负责两个分区

有4个分区，3个消费者：消费者1负责1个分区，消费者2负责1个分区，消费者3负责两个分区

有4个分区，4个消费者：一人一个

有4个分区，5个及以上消费者：4个消费者一人一个，剩下的消费者空闲不工作。

部署的时候**尽量做到一个消费者对应一个分区**。

# 分区数据量不均衡：

Topic上设置了四个分区，压测过程中，发现每个分区的数据量差别挺大的，极端的时候，只有一个分区有数据，其余三个分区空闲。

解决方法，在用生产者生产数据的时候，send方法需要指定key。

Kafka会根据key的值，通过一定的算法，如hash，将数据平均的发送到不同的分区上。

PS: 不指定 key,应该是对应的 hash 值，取模到对应的分区上。

# spring-integration-kafka：

在使用spring-integration-kafka做消费者的时候，发现CPU和内存占用量占用非常的大，后来又发现不管生产者发送了多少数据，Kafka的Topic中一直没有数据，这时候才知道spring-integration-kafka会将Topic中的数据全拉到本地，缓存起来，等待后续的处理。

解决方法：

```xml
<int:channel id="inputFromKafka">
<int:queue capacity="25"/> --这里加个配置，相当于缓存多少数据到本地
</int:channel>
```

# 死循环消费（消费者位移提交失败导致数据一直重复消费）

原因：kafka的consumer消费数据时首先会从broker里读取一批消息数据进行处理，处理完成后再提交offset。而我们项目中的consumer消费能力比较低，导致取出的一批数据在session.timeout.ms时间内没有处理完成，自动提交offset失败，然后kafka会重新分配partition给消费者，消费者又重新消费之前的一批数据，又出现了消费超时，所以会造成死循环，一直消费相同的数据

方法1：将自动提交位移关闭，在项目中手动提交位移

方法2：按报错提示上说的那样，增加max_poll_interval_ms时间，减少max_poll_records数量

max_poll_interval_ms：（默认为300000，即5min）poll()使用使用者组管理时的调用之间的最大延迟。

这为消费者在获取更多记录之前可以闲置的时间量设置了上限。

如果 poll()在此超时到期之前未调用，则认为使用者失败，并且该组将重新平衡以便将分区重新分配给另一个成员。

max_poll_records：（默认值：500）单次调用中返回的最大记录数poll()。

# Kafka 消息数据积压，Kafka 消费能力不足怎么处理？

1）如果是 Kafka 消费能力不足，则可以考虑增加 Topic 的分区数，并且同时提升消费组的消费者数量，消费者数=分区数。（两者缺一不可）

2）如果是下游的数据处理不及时：提高每批次拉取的数量。批次拉取数据过少（拉取数据/处理时间<生产速度），使处理的数据小于生产的数据，也会造成数据积压。

# Kafka 幂等性

Producer 的幂等性指的是当发送同一条消息时，数据在 Server 端只会被持久化一次，数据不丟不重，但是这里的幂等性是有条件的：

1、只能保证 Producer 在单个会话内不丟不重，如果 Producer 出现意外挂掉再重启是无法保证的（幂等性情况下，是无法获取之前的状态信息，因此是无法做到跨会话级别的不丢不重）。

2、幂等性不能跨多个 Topic-Partition，只能保证单个 Partition 内的幂等性，当涉及多个Topic-Partition 时，这中间的状态并没有同步。

# Kafka 事务

## 1、Producer 事务

为了实现跨分区跨会话的事务，需要引入一个全局唯一的 Transaction ID，并将 Producer获得的PID 和Transaction ID 绑定。

这样当 Producer重启后就可以通过正在进行的 TransactionID 获得原来的 PID。

为了管理 Transaction，Kafka 引入了一个新的组件 Transaction Coordinator。Producer 就是通过和 Transaction Coordinator 交互获得 Transaction ID 对应的任务状态。Transaction Coordinator 还负责将事务所有写入 Kafka 的一个内部 Topic，这样即使整个服务重启，由于事务状态得到保存，进行中的事务状态可以得到恢复，从而继续进行。

## 2、Consumer 事务

上述事务机制主要是从 Producer 方面考虑，对于 Consumer 而言，事务的保证就会相对较弱，尤其时无法保证 Commit 的信息被精确消费。

这是由于 Consumer 可以通过 offset 访问任意信息，而且不同的 Segment File 生命周期不同，同一事务的消息可能会出现重启后被删除的情况。

# Kafka 数据的可靠性

## 1、生产者 ACK

生产者producer的消息可靠投递Producer，使用带回调通知的 send(msg,callback)方法，并且设置 acks = all 。

它的消息投递 要采用同步的方式。

Producer 要保证消息到达服务器，就需要使用到消息确认机制，必须要拿到服务器端投递成功的响应才会继续往下执行，如果Producer 将消息投递到服务器端， 服务器来没来得及接收就已经宕机了，则会在 Producer 投递消息时生成记录日志，然后再将消息投递到服务器端，就算服 务器宕机了，等服务器重启之后，也可以根据日志信息完成 消息补偿，确保消息不丢失。

简单来说就是 生产者发送消息的回调应答机制+重试机制

## 2、副本同步+落盘机制。

在broker 中的配置项 unclean.leader.election.enable = false，保证所有副本同步。同 时，Producer 将消息投递到服务器的时候，我们需要将消息 持久化，也就是说会同步到磁盘。注意，同步到硬盘的过程 中，会有同步刷盘和异步刷盘。如果选择的是同步刷盘，那 是一定会保证消息不丢失的。就算刷盘失败，也可以即时补 偿。但如果选择的是异步刷盘的话，这个时候，消息有一定 概率会丢失。网上有一种说法，说 Kafka 不支持同步刷盘，

## 3、消费者 Consume可靠消费+重试机制

在消费者端将自动提交改为手动提交，设置 enable.auto.commit 为 false。 

在 Kafka 中，消息消费完成 之后，它不会立即删除，而是使用定时清除策略，也就是说， 我们消费者要确保消费成功之后，手动 ACK 提交。

如果消费 失败的情况下，我们要不断地进行重试。

所以，消费端不要设置自动提交，一定设置为手动提交才能保证消息不丢失。

# 为什么用Kafka （使用消息队列的好处）？

解耦合： 将生产、消费、数据存储分开，耦合性低、扩展性强（比较容易添加机器）；

灵活性&峰值处理能力： 访问量剧增时，使用消息队列可以使数据存着让消费者来取就可以，避免因为剧增的负荷使系统崩溃；

可恢复性： 当Leader宕机时会有Follower副本继续提供服务，当宕机的服务器恢复，会继续使用；

异步操作： 即发送和接收是相互独立的，当发一条消息后不需要等待结果可以做其他操作就是异步 ，用户可以把消息放入队列而不立即处理，需要的时候再去处理；而发了消息需要等待结果才能继续操作就是同步；

缓存功能： 提供缓存，解决生产消息和消费消息的处理速度不一致的情况

# 消息队列的两种模式 ？

## 点对点模式：（一对一，消费者主动拉取数据，消息收到后消息清除）

消息生产者生产消息发送到Queue 中，然后消息消费者从Queue 中取出并且消费消息。

消息被消费以后，queue 中不再有存储，所以消息消费者不可能消费到已经被消费的消息。

Queue 支持存在多个消费者， 但是对一个消息而言， 只会有一个消费者可以消费。

![点对点模式](https://img-blog.csdnimg.cn/1e8f39ea6af14d419b3ebc6080a13c28.png)

## 发布/订阅模式（一对多，消费者消费数据之后不会清除消息）

消息生产者（发布）将消息发布到 topic 队列中，同时有多个消息消费者（订阅）消费该消息。

和点对点方式不同，发布到 topic 的消息会被所有订阅者消费。

![发布-订阅](https://img-blog.csdnimg.cn/94d9815ed95f409f99961b70bc2fdd84.png)

# Kafka的组成（架构） 

![kafka 架构](https://img-blog.csdnimg.cn/57e4c6f1d23445118484e44ae5a27e73.png)

Kafka集群的目的是保存消息，Producers往Brokers里面的指定Topic中写消息，Consumers从Brokers里面拉去指定Topic的消息，生产者把数据以K、V的方式传给集群；

首先Kafka需要多台机器组成一个Kafka集群才能承载负荷，每一台服务器是一个Broker，

数据有多种进行分类 → 一个Broker中有Topic主题

为了提高负载 → 一个Topic有多个partition分区，一个partition可以放在多个不同的Broker上，而数据放在不同的partition当中（取模的方式），可以让不同的消费者来消费，提高消费速率

为了防止数据丢失 → 每个分区下有多个副本，即Leader和Follower，Leader做io处理，Follower只作备份，多个分区进行“交叉备份”，Follower从Leader中实时同步数据，当Leader挂掉后，Follower会代替Leader。

以【消费者组】为单位进行读取数据，其中一个消费者读取一个partition分区，所以**一般partition分区数量=消费者组中的Consumer消费者数量，以保证分区内数据有序**；

Zookeeper：kafka集群依赖zookeeper来保存集群的的元信息，来保证系统的可用性。

Kafka -> Broker -> Topic -> partition -> Replication(Leader、Follower) ->Consumer

1）Producer ：消息生产者，就是向 kafka broker中的Topic主题发消息的客户端；

2）Consumer ：消息消费者，向 kafka broker中的Topic中 取消息的客户端；

3）Consumer Group （CG）：消费者组，由多个 consumer 组成。消费者组内每个消费者负责消费不同分区的数据，一个分区只能由一个组内消费者消费；消费者组之间互不影响。
所有的消费者都属于某个消费者组，即消费者组是逻辑上的一个订阅者。

4）Broker ：一台 kafka 服务器就是一个 broker。一个集群由多个 broker 组成。
一个 broker可以容纳多个topic。

5）Topic ：可以理解为一个队列，生产者和消费者面向的都是一个 topic；topic逻辑上的概念，partition是物理上的概念；

6）Partition：为了实现扩展性，一个非常大的 topic 可以分布到多个broker（即服务器）上，一个 topic 可以分为多个 partition，每个 partition 是一个有序的队列；partition中的每条消息都会被分配一个有序的id（offset）

7）Replica：副本，为保证集群中的某个节点发生故障时，该节点上的 partition 数据不丢失，

且kafka 仍然能够继续工作，kafka 提供了副本机制，一个 topic 的每个分区都有若干个副本，一个 leader 和若干个 follower。

8）leader：每个分区多个副本的“主”，生产者发送数据的对象，以及消费者消费数据的对象都是 leader。

9）follower：每个分区多个副本中的“从”，实时从 leader 中同步数据，保持和 leader 数据的同步。leader 发生故障时，某个 follower 会成为新的 follower。

10）Offset：偏移量， kafka的存储文件都是按照offset.kafka来命名，用offset做名字的好处是方便查找。例如你想找位于2049的位置，只要找到2048.kafka的文件即可。

当然the first offset就是00000000000.kafka。

# Kafka的副本（Replication）？

涉及HW、LEO；

同一个partition分区可能会有多个replication副本（对应 server.properties 配置中的default.replication.factor=N）。

Leader和follower都算副本；

没有replication的情况下，一旦broker 宕机，其上所有 patition 的数据都不可被消费，同时producer也不能再将数据存于其上的patition。

引入replication之后，同一个partition可能会有多个replication备份，而这时需要在这些replication之间选出一个leader，producer和consumer只与这个leader交互，其它replication作为follower从leader 中复制数据（同步数据）。

同步数据：Leader负责数据的读和写，如果让Leader再往Follower发送数据则会使Leader负载太大，所以由Follower轮询去Leader中取数据！

所以，Producer对Leader做操作，而Follower定时向Leader取数据以此备份；

![replication](https://img-blog.csdnimg.cn/d399c7a2a8d6456b945d441ecc2e2289.png)

# 如果生产过快，如何增加消费能力？

1. 由于消费者数量一般等于partition分区数量，所以增加 partition 分区可以增加消费能力；

2. 如果不增加分区，而只增加消费者，则多出来的消费者会被浪费，因为一个分区只能被一个消费者组内的一个消费者进行消费；

不增加分区，增加消费者拉取的数量，consumer.pull( 500 )，当然越多会越慢

# Kafka为什么读写效率高（高吞吐） ？

首先Kafka是分布式集群，吞吐量大；

## 零拷贝

所谓的零拷贝就是相对 应用层来说，不需要再进行数据的拷贝；

实际应用中，如果需要把磁盘的内容发送到远程服务器：

1.操作系统将磁盘的数据A复制到内核缓存，

2.再把缓存数据复制到应用缓存中，

3.在应用中使用write()方法把应用缓存中数据复制到PageCache内核缓存中，

4.再由系统将内核缓存的数据传给NIC Buffer网卡缓冲区，通过网卡发送给数据接收方。

Kafka：
直接和底层操作系统打交道，向系统发送sendFile指令（操作系统级别的指令），让数据从磁盘拷贝到内核缓存，然后直接发给NIC 网卡缓冲区，而避免了应用层和内核层的数据拷贝；

## 顺序写

数据是以日志文件的方式顺序保存 ，比随机写效率高；

## 预读

【在读数据时】，会预先读相关的数据，提高效率（由空间局部性原理，因为很多数据在内存中是连续存放的）

## 后写

【Java中】会先将数据读到buffer缓冲流（分配了一块内存来存），再将数据写入系统，写两次慢；

而【Kafka】在写数据时，并不是立刻写入磁盘，而是先放入PageCache高速缓存（访问缓存的速度比内存快很多），到达一定值再由操作系统把缓存的值写入文件，提高了写入消息的性能；

## 分段日志

Leader将数据文件切分为多个小的segment分段，好处是使得IO更快；

Topic→partition→segment

（数据有offset偏移量，读取快）

index 和 log 文件以当前 segment 的第一条消息的 offset 命名；

Topic会分区，分区文件中存多个segment，一个segment有三种类型文件：

index 和 log 文件以当前 segment 的第一条消息的 offset 命名 --------- 查找时能快速定位！

xxxxx.index 索引，存的是第几条消息（消息偏移量offset）和对应的物理偏移地址；

如：22372103.index 文件中第一行 即为 offset=22372104的数据对应的物理偏移地址为 365；

有了index文件，就可以通过index中的offset找到 物理偏移导致，然后去log日志文件 快速定位到数据；

xxxxxx.log是一个分段日志，存的是offset、数据、文件大小等，数据文件就是日志文件，默认日志文件大小1G，分为多个分段日志可以提高性能，避免大文件加载性能差；

xxxxxx.timeindex 时间戳索引，用时间去定位数据；

如何定位到已知offset的数据？

Topic→ partition → 根据offset和index文件命名 知道属于哪个index文件 → 再找到index文件中存的目标offset对应的物理偏移量 → 再根据物理偏移量去 log文件中查找数据；

## 双端队列DQ和批处理

【在生产数据时】，每一个分区都会有一个双端队列DQ ，

①生产数据时先将数据放到双端队列，

②【当DQ满了或者时间周期到了】就一次性批量 将DQ的数据采集到Sender，发给Broker中的Leader，既保证了分区内有序，又提高了效率；

消费消息也是一个道理，一次拉取一批数据进行消费；

压缩：给的字符串，会被压缩成byte数组，压缩后数据小，传输快

# Kafka的命令行操作

1）查看当前服务器中的所有topic： `bin/kafka-topics.sh --zookeeper hadoop102:2181 --list`

–list意为查看列表

集群由Zookeeper来管理，要进行Topic操作，则集群需要先要连接上Zookeeper；

2181是Zookeeper的服务端口！

2）创建topic：`bin/kafka-topics.sh --zookeeper hadoop102:2181 \ --create --replication-factor 3 --partitions 3 --topic first`

创建Topic的目的是为了能向某一个Topic主题中发送给消息

需要提供分区、副本（Leader、Follower都是副本）

–topic 定义topic名

–replication-factor 定义副本数

–partitions 定义分区数

3）查看当前Topic( first )的描述信息：`bin/kafka-topics.sh --zookeeper hadoop102:2181 --describe --topic first`

可以看到分区数partitionCount=3，副本数为2(一个leader一个follower)


意为0号分区的Leader在Broker 1号机器，即hadoop102这台虚拟机上

4）删除topic ：`bin/kafka-topics.sh --zookeeper hadoop102:2181 \ --delete --topic first`

5）发送消息（生产）： bin/kafka-console-producer.sh \ --broker-list hadoop102:9092 --topic first (打开生产者控制台，9092是Kafka默认端口号)

>hello
>world

集群和消费跟Zookeeper有关系，但是生产和Zookeeper没有关系，只需要找到集群就够了；

这里使用控制台发送消息，所以要先启动控制台连接Kafka集群

9092是集群的服务端口！

6）消费消息: （打开消费者控制台）

`bin/kafka-console-consumer.sh \ --zookeeper hadoop102:2181 --topic first`（旧）

0.8以前的kafka,消费的进度(offset)是写在Zookeeper中的,所以consumer需要知道zk的地址；

`bin/kafka-console-consumer.sh \ --bootstrap-server hadoop102:9092 --topic first`（新）

–from-beginning： 会把first主题中以往所有的数据都读取出来，即从头读;

# Kafka的写入方式 ？

producer采用推（push）模式将消息发布到broker，每条消息都被追加（append）到patition分区的分段日志log末端，保证分区内有序，属于顺序写磁盘（顺序写磁盘效率比随机写内存要高，保障kafka吞吐率）。

生产者生产的消息会不断追加到 log 文件末尾，为防止 log 文件过大导致数据定位效率低下，Kafka 采取了分区和分段机制，将topic分为多个partition，每个 partition就是一个文件夹，一个partition又分为多个 segment。

每个 segment 对应三个文件——“.index”文件、“timeindex”文件、 “.log”文件。这些文件位于一个文件夹下，该文件夹的命名规则为：topic 名称+分区序号。

例如，first 这个 topic 有三个分区，则其对应的文件夹为 first- 0,first-1,first-2。

index 、timeindex和 log 文件以当前 segment 的第一条消息的 offset 命名

![Kafka的写入方式](https://img-blog.csdnimg.cn/9e393e7519224fb2adc03b3c99204177.png)

# Kafka的生产数据的流程 ？ACK应答机制 ？

集群依靠Zookeeper来管理；

Consumer消费者靠Zookeeper来保存偏移量；但是生产者与Zookeeper无关，Producer不和Zookeeper直接打交道；

## 过程：

1.Producer需要找集群并将数据放到某一个分区中，而分区和Leader端口号在Zookeeper中，集群和Zookeeper一直在连接，由集群去取Partition的Leader端口号，然后producer从集群中拿到对应的topic的partition信息和partition的leader的相关信息

2.Producer将数据发送给Leader（每个分区建一个双端队列DQ，先将数据放到双端队列DQ，DQ满了或者达到时间周期就由sender发送到Leader（数据采集器，双端队列DQ、sender，）

3.Leader将数据顺序写入本地log分段日志

后续：
4.Follower轮询从Leader拉取消息以此同步数据

5.Kafka的ACK应答机制（三种可靠级别）；

当取值为0，则不关心是否到达，尽最大努力交付，效率高，数据可能丢失；

取值为1（默认），Producer的发送数据，需要等待Leader的应答才能发生下一条，不关心Follower是否接收成功，性能稍慢，数据较安全，但当Leader突然宕机，则当Follower还未同步，数据会丢失；

取值为 -1（all） ，Producer发送数据，需要等待ISR内的所有副本（leader和所有Follower）都完成备份，最安全，性能差；

![kafka 的 ack 机制](https://img-blog.csdnimg.cn/2fc81c8b7d2f4585859dc1b9fc3b988d.png)

详细：

1、首先Producer要向集群的Leader发送消息，需要知道分区信息和Leader的端口号，需要先连接集群；

使用Sender数据发送器发送请求（Sender实现了Runnable接口，是个独立的线程，Sender用来实现数据的交互），获取到集群Topic的partition和Leader信息；而集群和Zookeeper一直连接，Zookeeper有以上集群的信息，

2、当Producer通过Sender从集群获取到partition和Leader信息，若有指定partition则使用指定的partition，若没有则使用分区算法对key做操作；当没有key则轮询partition；

3、Producer给Leader发数据使用批处理，如果没有批处理每次发送都建立连接在进程间做交互，会使效率很低；
这里使用了双端队列DQ，Producer将数据放入DQ，当DQ满了或者到达时间周期就由Sender线程（内部有采集器）取数据并一次性批量发给Leader（Sender会轮询DQ，看双端队列是否满了，或者达到时间周期）

4、Leader将数据写入本地log分段日志

后续：

5、Follower轮询从Leader拉取消息以此同步数据

6、Kafka的ACK应答机制；

## 为什么不让Producer直接和Zookeeper连接以获取集群信息？

因为这样会连接Zookeeper和集群共两次连接，而如果Producer连接集群以获取信息则只需要连接一次，性能提升。

## 为什么使用双端队列？

当从DQ发送到Sender失败之后，如果只是单向队列（先进先出）的DQ，则会从头放进去，这样就打破了顺序，而使用双端队列，可以将数据从队列末端再放进去，以保持分区内数据有序（分区数=DQ数），再尝试发送；

双端队列靠RecordAccumulator数据收集器来完成；

每一个Topic的partition分区都会创建一个DQ双端队列；


# Kafka的保存流程 ？ 副本同步相关的HW 、 LEO?

默认的ACK模式为当Leader确认消息就发送下一条，而Follower轮询的去Leader拉取数据以同步；

此时当Leader宕机，Follower成为Leader；

生产者生产的消息会由Leader 不断追加到 分段日志log 文件末尾，为防止 log 文件过大导致数据定位效率低下，Kafka 采取了分区和分段机制，将topic分为多个partition，每个 partition就是一个文件夹（文件夹命名就是topic名+分区号），一个partition又分为多个 segment分段。

每个 segment 对应三个文件——“.index”文件、“timeindex”文件、 “.log”文件。这些文件位于一个文件夹下，该文件夹的命名规则为：topic 名称+分区序号。
例如，first 这个 topic 有三个分区，则其对应的文件夹为 first- 0,first-1,first-2。

index 、timeindex和 log 文件以当前 segment 的第一条消息的 offset 命名，所以可以由offset 就知道数据的物理偏移量在哪个index索引文件中；

xxx.index 文件存储的是数据offset和对应的物理偏移量，根据物理偏移量去log日志文件中快速定位数据，效率高；

![保存流程](https://img-blog.csdnimg.cn/9e393e7519224fb2adc03b3c99204177.png)

LEO：Log and Offset 即副本中日志最后的offset 即最大偏移量；

HW:High WaterMark 高水位 （木桶理论最低的那一块），是消费者能见到的最大offset，【ISR中】的所有Follower中最小的LEO即HW，也就是说在HW之前的数据都是已经被所有的Follower所同步，比较安全；

Ledaer的HW取自于所有副本的最小LEO

## follower故障：

follower故障（长时间未与Leader进行同步）会被踢出ISR，待follower恢复后，follower会读取本地记录的HW，并将log大于HW的部分截取，从HW开始向Leader进行同步，等follower的LEO大于HW后，即follower追上leader之后，就重新加入ISR

## Leader故障：

leader故障后会由 /controller集群控制器从ISR中选出一个新的Leader，之后保证多个副本之间的一致性，其余的follower会将log中高于HW的部分截掉，从新的Leader同步数据；

# Kafka的ISR是什么 ？

场景： 如果采用ACK为 -1（all） 的应答机制则需要等所有副本都完成同步才能发送下一条数据，

当leader 收到数据，所有 follower 都开始同步数据， 但有一个 follower，因为某种故障，迟迟不能与 leader 进行同步，那就要一直等下去， 直到它完成同步，才能发送 ack。

解决： Leader 维护了一个动态的 in-sync replica set (ISR)，意为正在同步的Follower副本集合。

当 ISR 中的 follower 完成数据的同步之后，leader 就会给 follower 发送 ack。如果 follower长时间未向leader同步数据 ， 则该follower 将被踢出ISR ， 该时间阈值由replica.lag.time.max.ms 参数设定。

所以当ISR内的Follower完成备份，就能继续生产过程，而不会因为Follower宕机而卡住；

如果Leader 发生故障，就会从 ISR 中选举新的 leader。

# Kafka的消费方式 / 过程 ？为什么不用“推”的方式 ？

生产者通过集群获取信息而不连Zookeeper为了提高效率，而消费者组连接Zookeeper是为了保存offset偏移量；

![为什么不用“推”的方式 ](https://img-blog.csdnimg.cn/9d0e1b0f84f54dd7925107b09f0ea591.png)

consumer 采用 pull（拉）模式从 broker 中读取数据。

以【消费者组】为单位，面向Topic 进行读取数据；

Consumer消费者取的时候会取多条放入缓存（一条一条效率太低）；

为了保证分区内数据有序，则一个Consumer只能消费一个分区，不能多个Consumer消费同一个分区；但一个Consumer可以消费多个分区

当2个Consumer消费3个分区，此时会有一个Consumer消费2个分区，消费效率不高，此时再增加一个Consumer，这是会触发 “再平衡” （分区、再平衡都由其中一个broker也就是 /ontroller 集群控制器来做），会重新读取分区信息。会重新分配，

## 为什么不用推？

push（推）模式很难适应消费速率不同的消费者，因为消息发送速率是由 broker 决定的。

它的目标是尽可能以最快速度传递消息，但是这样很容易造成 consumer 来不及处理消息；

而且增加集群的负担；

# Kafka中是怎么体现消息顺序性的？

生产时： Producer拿到分区信息，一个分区创建一个双端队列DQ，由DQ发送给Leader，保持分区内有序；

消费时： 一个消费者组中的消费者拉取一个分区的数据，保证分区内顺序；

# Kafka的选举Leader机制 ？

先从现有的Broker中 选出【Zookeeper中的】/controller 集群控制器：

假设有3个Broker机器，而分区、再平衡都由其中一个broker也就是集群控制器来做；

在Zookeeper中有一个 临时节点 /controller，三个Broker都会向Zookeeper发请求，三个Broker都会创建 /controller临时节点，最先创建 /controller，谁就是 controller，此时会增加一个watch监听者，监听/controller节点有没有挂掉，一旦挂掉再次选举controller，谁先建立谁就是controller；

当有了 controller集群控制器（Broker）有了之后，再选举Leader，会从ISR （正在同步的副本）中选择Leader，一般是列表中的第一个，

当副本全挂了就是-1，会等待有副本活过来；

#  Zookeeper 在 Kafka 中的作用 ？为什么要连接Zookeeper ？

1) 负载均衡：

Zookeeper记录了Broker的信息，Producer也可以根据Broker的情况来实现 【生产时】的负载均衡；

ZooKeeper 作为给分布式系统提供协调服务的工具，通过Zookeeper，消费者就能知道Kafka的集群信息，实现消费时的负载均衡；

2) Controller 选举

选举一个broker作为controller，负责topic分区、Leader选举等工作；

3) 管理Brokers

Zookeeper用一个专门节点保存Broker服务列表，也就是 /brokers/ids ，里面存broker的ip和端口号；

4） 维护对应关系

在 Kafka 中可以定义很多个 Topic，每个 Topic 又被分为很多个 Partition。一般情况下，每个 Partition 独立在存在一个 Broker 上，所有的这些 Topic 和 Broker 的对应关系都由 ZooKeeper 进行维护。

# Kafka为什么要分区？分区策略 ？

消息发送时都被发送到一个topic，其本质就是一个目录，而topic是由一些Partition Logs(分区日志)组成，每个分区都有自己的分区日志，其组织结

![分区](https://img-blog.csdnimg.cn/4ed6f360bb79462883dfb5538d487a6b.png)

每个Partition分区中的消息都是有序的，生产的消息被不断追加到Partition log上，其中的每一个消息都被赋予了一个唯一的offset偏移量值。

## 1. 分区的原因

（1）方便在集群中扩展、提高消费能力，每个Partition可以通过调整以适应它所在的机器，而一个topic又可以有多个Partition组成，因此整个集群就可以适应任意大小的数据了；数据大了多几个partition即可，即为了便于增加负载，同时提高消费能力；

（2）可以提高并发，因为可以以Partition为单位读写了。

## 2. 分区的原则

（1）指定了patition，则直接使用；

（2）未指定patition但指定一个key，通过对key的hash 值与 topic 的 partition数进行取余得到 partition 号；

（3）patition和key都未指定，Kafka会获取可用分区，然后自己给这个topic搞个随机值然后就会按照分区轮询。

# Kafka的负载均衡？

## 生产者负载均衡 靠分区实现；

依据消息的key计算分区，如果消息制定了key，会计算key的哈希值，并与分区数取模的到最后的分区编号；

如果未指定key，则默认分区器会基于轮询为每条消息分配分区；

## 消费者负载均衡

Kafka目前主流的分区分配策略有2种（默认是range，可以通过partition.assignment.strategy参数指定）：

range：在保证均衡的前提下，将连续的分区分配给消费者，对应的实现是RangeAssignor；

round-robin：在保证均衡的前提下，轮询分配，对应的实现是RoundRobinAssignor；

# Kafka的再平衡？re-balance

一般来说消费者的数量最好要和分区数量一致；

【当消费者数量小于分区数量的时候】，那么必然会有一个消费者消费多个分区的消息；

【当消费者数量超过分区的数量的时候】，那么必然会有消费者没有去消费而被浪费；

## 什么是再平衡？

再平衡Rebalance就是指有新消费者加入的情况，比如刚开始只有消费者A在消费消息，过了一段时间消费者B和C加入了，这时候分区就需要重新分配，这就是再平衡，但是再平衡的过程和我们的GC时候STW很像，会导致整个消费群组停止工作，重平衡期间都无法消费消息。

## 什么时候触发再平衡？

只要消费者数量、Topic主题数量（比如用的正则订阅的主题）、分区数量任何一个发生改变，都会触发再平衡。

几种情况：

- 当消费者组增加，分区会分配到其他消费者上；

- 新建了一个topic，那么这个topic的分区会自动分配给当前消费者；

- 新增了分区，则新增的分区会分配给当前消费者；

# Kafka的偏移量offset存在那？ 为什么？

【早期】放在Zookeeper中，但频繁消费会更新offset，会增加Zookeeper负担，而Zookeeper仅仅是做协调调度的；

所以【0.9版本后】放到Kafka 集群中，但是会先生成Zookeeper topic(_ consumer_offset) 默认会有50个分区，会把50个分区的数据放入Kafka集群中；

# Kafka的压缩

压缩格式：一般是GZIP、Snappy；

## 压缩：

在 Kafka 中，压缩一般发生在生产者端；

```java
Properties p = new Properties();
.....
 // 开启 GZIP 压缩
p.put("compression.type", "gzip");
....
Producer<String, String> producer = new KafkaProducer<>(p);
```

这样 Producer 启动后生产的每个消息都是 GZIP 压缩过的，从而降低了Producer到Broker的网络传输，从而也降低了Broker的数据存储压力。

## 解压缩：

消息解压是发生在消费端的。Consumer 程序请求这部分消息时，Broker 依然原样发送出去，当消息到达 Consumer 端后，由 Consumer 自行解压缩还原成之前的消息

# 拦截器？

对于producer而言，interceptor使得用户在消息发送前以及producer回调逻辑前有机会对消息做一些定制化需求，比如修改消息等；

# 回调？

## 什么是回调？

消息回调，在【异步通信时】的 消息确认(生产者推送消息成功，消费者接收消息成功)

## 为什么要进行消息确认？

经常会听到丢消息的字眼, 对于程序来说，发送者没法确认是否发送成功，消费者处理失败也无法反馈，没有消息确认机制，就会出现消息莫名其妙的没了，也不知道什么情况

## 使用：

回调函数会在 producer 收到 ack 时调用，为异步调用；

在KafkaProducer对象的send方法中传入 Callback接口的匿名函数，重写onComplation方法;

该方法有两个参数，分别是RecordMetadata 和 Exception，如果 Exception 为 null，说明消息发送成功，如果Exception 不为 null，说明消息发送失败。

```java
     producer.send(new ProducerRecord<String, String>("first"
     , Integer.toString(i)
     ,Integer.toString(i))
     , new Callback() {
         //回调函数，该方法会在 Producer 收到 ack 时调用，为异步调用
         @Override
         public void onCompletion(RecordMetadata metadata, Exception exception) {
             if (exception == null) {
                 System.out.println("success->" +
                         metadata.offset());
             } else {
                 exception.printStackTrace();
             } 
```

# 参考资料

https://maimai.cn/article/detail?fid=1724791732&efid=4a9eC-XwLGQzl4F09gPajA

[Kafka常见问题处理](https://blog.csdn.net/weixin_44870066/article/details/126033672)

[Kafka 常见问题](https://blog.csdn.net/Swofford/article/details/125777061)

[Kafka 实战宝典：一文带解决 Kafka 常见故障处理](https://xie.infoq.cn/article/3a1e5c49634309380f38a444d)

[Kafka实际使用过程中遇到的一些问题及解决方法](https://www.bbsmax.com/A/1O5Ej2l8d7/)

* any list
{:toc}
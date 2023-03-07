---
layout: post
title:  mq 常见面试题汇总
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, redis, sh]
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


# 前言

大家好，我是老马。

mq 使我们日常开发中常用的削峰填谷，发布订阅的框架。

面试中自然出现频率也比较高，对常见问题进行整理，便于平时查阅收藏。

# 为什么需要使用 MQ？

1.异步处理（多线程和 MQ）

2.实现解耦

3.流量削峰（MQ 可以实现抗高并发）

可以按场景简述，录单流程：用户手机端填写录单流程，服务端接收到请求信息后，存储数据库，响应客户录单成功，然后写一条消息到MQ中，具体生成整张保单信息的耗时处理，报单中心模块监听MQ信息进行处理，最后，给客户发送保单成功短信通知。

解耦：客户端请求到服务端，用户信息写入落库，主线程响应客户端，另起一个子线程发送MQ系统，耗时操作，让具体的业务系统慢慢处理。当采用多线程时，主线程和子线程都在同一个服务器上，当服务器当即后，一些操作就无法完成；当使用MQ时，具体业务耗时逻辑的操作有另一个服务器负责去完成，二者没有关联，当前这宕机后后者无影响。

流量削峰：

背景：客户端50个请求到服务端tomcat，而tomcat内部线程容量是有限制的，比如说同时处理只能处理50个任务，当其他任务进行来时，会缓存对队列中，当处理的请求越来越多就会阻塞线程或者内存溢出。

处理方案：客户端50个请求到服务端tomcat，而tomcat不做具体耗时逻辑处理，信息落库后，直接响应客户端，然后发一条消息到业务系统的MQ中就可以了。

# 常见mq队列及区别 

常见的mq队列有 ActiveMQ、RabbitMQ、RocketMQ、Kafka。


## MQ 与多线程实现异步的区别？

1.多线程方式实现异步可能会消耗到我们的 CPU资源，可能会影响到我们业务线程执行 会发生 CPU竞争的问题，例如：单核多线程，cpu上下文切换，会出现卡顿现象

2.MQ 方式实现异步是完全解耦，适合于大型互联网项目；

3.小的项目可以使用多线程实现异步，大项目建议使用 MQ 实现异步；

# MQ 如何避免消息堆积的问题？

1. 提高消费者消费的速率；（对我们的消费者实现集群）

2. 消费者应该批量形式获取消息 减少网络传输的次数；

说明：同一个组中多个消费者不会重复消费同一条消息。（均摊策略等等）理解：

1.产生背景： 生产者投递消息的速率与我们消费者消费的速率完全不匹配。

2.生产者投递消息的速率>消费者消费的速率 导致我们消息会堆积在我们 MQ 服务器端中，没有及时的被消费者消费 所以就会产生消息堆积的问题

3.注意的是：

rabbitMQ 消费者我们的消息消费如果成功的话 消息会被立即删除。

kafka 或者 rocketMQ 消息消费如果成功的话，消息是不会立即被删除。


# MQ 宕机了消息是否会丢失呢？

不会，因为我们消息会持久化在我们硬盘中。

MQ 如何保证消息不丢失？

1.MQ 服务器端 消息持久化到硬盘

2.生产者 消息确认机制 必须确认消息成功刷盘到硬盘中，才能够人为消息投递成功。

3.消费者 必须确认消息消费成功 。

rabbitMQ 中：才会将该消息删除。

rocketMQ 或者 kafka 中：消息消费后会提交 offset 偏移量，消息并不会立即删除。

（消息删除通过日志保留策略配置，过了48小时在进行删除）

## 生产者投递消息，MQ 宕机了如何处理？

1.生产者投递消息会将 msg 消息内容记录下来，后期如果发生生产者投递消息失败；

2.可以根据该日志记录实现补偿机制；

3.补偿机制（获取到该 msg 日志消息内容实现重试）

# MQ 如何保证消息顺序一致性问题?

将消息需要投递到同一个 MQ 服务器，同一个分区模型中存放，最终被同一个消费者消费。

核心原理：设定相同的消息 key，根据相同的消息 key 计算 hash 存放在同一个分区中。

产生背景：

MQ服务器集群或者MQ采用分区模型架构存放消息，每个分区对于一个消息者消费消息。

解决消息顺序一致性问题：

核心办法：消息一定要投递到同一个MQ、同一个分区模型，最终被同一个消费者消费。

根据消息key计算%分区模型总数。

## 理解：

1. 大多数的项目是不需要保证 MQ 消息顺序一致性的问题，只有在一些特定的场景可能会需要，比如 MySQL 与 Redis 实现异步同步数据；

2. 所有消息需要投递到同一个 MQ 服务器，同一个分区模型中存放，最终被同一个消费者消费，核心原理：设定相同的消息 key，根据相同的消息 key 计算 hash 存放在同一个分区中。

如果保证了消息顺序一致性有可能降低我们消费者消费的速率。

![一致性](https://img-blog.csdnimg.cn/d100e7559c444f8486db1d61e9576ec1.png)

## 为什么保证了消息顺序一致性有可能降低我们消费者消费的速率？解决方案

# MQ 如何保证消息幂等问题?

保证幂等性的意思就是保证数据不被消费者重复消费在数据库中插入重复的数据，要解决这个问题就要在消费者端入手。

1. 进行数据库操作，可以先查下这个数据是否已经存在了，如果存在了进行更新操作，不存在就进行插入操作

2. 写入redis，这个比较简单，直接利用redis的set数据类型就可以保证数据不会重复了。

3. 如果不是数据库业务情景的话，如直接根据得到的数据进行发送邮件或者短信。这种情况的话可以加一个redis的set数据类型进行消重处理，或者用数据库做一个发送的日志记录，用1的方式去处理。

# 实现 mq 高可用

每种mq都有实现高可用性的方式，activeMQ和rabbitMQ是通过主从集群的方式实现高可用性的，但是存在一个致命问题就是，当mq队列爆满的时候，主从架构不能横向扩容，因为每个queue保持的数据都是一样的。

下面主要介绍下分布式架构的 kafka。

kafka分布式架构

1. kafka的一个topic的数据分布在分区（partition）中，而每个partition都分布在不同的broker中，这样就保证了同一个topic的数据分布在不同的机器中。

2. kafka每个partition都有一个leader和多个follower，当leader挂了，follower会自动选举出来一个leader，这样就保证了mq的健壮性。

3. 生产者和消费者的读写只能通过leader进行，不能读写follower，同时只有当leader的数据同步给follower之后才认为是写成功了，保证数据不丢失。

可以看到，相比主从架构，分布式架构具有更高的可扩展性，可用横向增加partition进行扩容。

# RocketMQ 

RocketMQ是一款分布式消息中间件，最初是由阿里巴巴消息中间件团队研发并大规模应用于生产系统，满足线上海量消息堆积的需求， 在2016年底捐赠给Apache开源基金会成为孵化项目，经过不到一年时间正式成为了Apache顶级项目；

早期阿里曾经基于ActiveMQ研发消息系统， 随着业务消息的规模增大，瓶颈逐渐显现，后来也考虑过Kafka，但因为在低延迟和高可靠性方面没有选择，最后才自主研发了RocketMQ， 

各方面的性能都比目前已有的消息队列要好，RocketMQ和Kafka在概念和原理上都非常相似，所以也经常被拿来对比；RocketMQ默认采用长轮询的拉模式， 单机支持千万级别的消息堆积，可以非常好的应用在海量消息系统中。

## 优点

RocketMQ 是阿里巴巴开发的一款开源的消息中间件，具有集群消费、广播消费、消息积压能力强、防止消息丢失、顺序消息、事务型消息、保证高可用、高性能读写数据等优点。

## 为什么要用RocketMq？

总得来说，RocketMq具有以下几个优势：

吞吐量高：单机吞吐量可达十万级

可用性高：分布式架构

消息可靠性高：经过参数优化配置，消息可以做到0丢失

功能支持完善：MQ功能较为完善，还是分布式的，扩展性好

支持10亿级别的消息堆积：不会因为堆积导致性能下降

源码是java：方便我们查看源码了解它的每个环节的实现逻辑，并针对不同的业务场景进行扩展

可靠性高：天生为金融互联网领域而生，对于要求很高的场景，尤其是电商里面的订单扣款，以及业务削峰，在大量交易涌入时，后端可能无法及时处理的情况

稳定性高：RoketMQ在上可能更值得信赖，这些业务场景在阿里双11已经经历了多次考验

## 如何保证高可用

1）master和slave 配合，master 支持读、写，slave 只读，producer 只能和 master 连接写入消息，consumer 可以连接 master 和 slave。

2）当 master 不可用或者繁忙时，consumer 会被自动切换到 slave 读。即使 master 出现故障，consumer 仍然可以从 slave 读消息，不受影响。

3）创建 topic 时，把 message queue 创建在多个 broker 组上（brokerName 一样，brokerId 不同），当一个 broker 组的 master 不可用后，其他组的 master 仍然可以用，producer 可以继续发消息。

# RocketMq消费者消费模式有几种

## 集群消费

一条消息只会投递到一个 Consumer Group 下面的一个实例。

## 广播消费

消息将对一个Consumer Group 下的各个 Consumer 实例都投递一遍。

即使这些 Consumer 属于同一个Consumer Group ，消息也会被 Consumer Group 中的每个 Consumer 都消费一次。

# RocketMq 的消息是有序的吗

一个topic下有多个queue，为了保证发送有序，rocketmq提供了MessageQueueSelector队列选择机制

1）可使用hash取模法,让同一个订单发送到同一个queue中，再使用同步发送，只有消息A发送成功，再发送消息B

2）rocketmq的topic内的队列机制，可以保证存储满足FIFO，剩下的只需要消费者顺序消费即可

3）rocketmq仅保证顺序发送，顺序消费由消费者业务保证

## 如何让 RocketMQ 保证消息的顺序消费？

首先多个 queue 只能保证单个 queue 里的顺序，queue 是典型的 FIFO，天然顺序。多个 queue 同时消费是无法绝对保证消息的有序性的。

所以总结如下：

同一 topic，同一个 QUEUE，发消息的时候一个线程去发送消息，消费的时候 一个线程去消费一个 queue 里的消息。

## 怎么保证消息发到同一个queue？

Rocket MQ给我们提供了MessageQueueSelector接口，可以自己重写里面的接口，实现自己的算法，举个最简单的例子：

判断i % 2 == 0，那就都放到queue1里，否则放到queue2里。

```java
for (int i = 0; i < 5; i++) {
    Message message = new Message("orderTopic", ("hello!" + i).getBytes());
    producer.send(
        // 要发的那条消息
        message,
        // queue 选择器 ，向 topic中的哪个queue去写消息
        new MessageQueueSelector() {
            // 手动 选择一个queue
            @Override
            public MessageQueue select(
                // 当前topic 里面包含的所有queue
                List<MessageQueue> mqs,
                // 具体要发的那条消息
                Message msg,
                // 对应到 send（） 里的 args，也就是2000前面的那个0
                Object arg) {
                // 向固定的一个queue里写消息，比如这里就是向第一个queue里写消息
                if (Integer.parseInt(arg.toString()) % 2 == 0) {
                    return mqs.get(0);
                } else {
                    return mqs.get(1);
                }
            }
        },
        // 自定义参数：0
        // 2000代表2000毫秒超时时间
        i, 2000);
}
```



# RocketMq事务消息的实现机制

RocketMQ第一阶段发送Prepared消息时，会拿到消息的地址

RocketMQ第二阶段执行本地事务，第三阶段通过第一阶段拿到的地址去访问消息，并修改消息的状态。

RocketMQ会定期扫描消息集群中的事务消息，如果发现了Prepared消息，它会向消息发送端(生产者)确认，RocketMQ会根据发送端设置的策略来决定是回滚还是继续发送确认消息。这样就保证了消息发送与本地事务同时成功或同时失败。

# RocketMq延迟消息？如何实现的

RocketMQ 支持定时消息，但是不支持任意时间精度，仅支持特定的 level，例如定时 5s， 10s， 1m 等。

其中，level=0 级表示不延时，level=1 表示 1 级延时，level=2 表示 2 级延时。

默认的配置是 

```
messageDelayLevel=1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h。
```

```java
Message msg = new Message(topic, tags, keys, body);

msg.setDelayTimeLevel(3);
```

# RocketMq是推模型还是拉模型

rocketmq不管是推模式还是拉模式底层都是拉模式，推模式也是在拉模式上做了一层封装.。

消息存储在broker中，通过topic和tags区分消息队列。

producer在发送消息时不关心consumer对应的topic和tags，只将消息发送到对应broker的对应topic和tags中。

推模式中broker则需要知道哪些consumer拥有哪些topic和tags，但在consumer重启或更换topic时，broker无法及时获取信息，可能将消息推送到旧的consumer中。

对应consumer主动获取topic，这样确保每次主动获取时他对应的topic信息都是最新的。

## rockemq 本质都是 pull

RocketMQ没有真正意义的push，都是pull，虽然有push类，但实际底层实现采用的是「长轮询机制」，即拉取方式

> broker端属性 longPollingEnable 标记是否开启长轮询。默认开启

```java
// {@link org.apache.rocketmq.client.impl.consumer.DefaultMQPushConsumerImpl#pullMessage()}
// 看到没，这是一只披着羊皮的狼，名字叫PushConsumerImpl，实际干的确是pull的活。
// 拉取消息，结果放到pullCallback里
this.pullAPIWrapper.pullKernelImpl(pullCallback);
```

## 为什么要主动拉取消息而不使用事件监听方式？

事件驱动方式是建立好长连接，由事件（发送数据）的方式来实时推送。

如果**broker主动推送消息的话有可能push速度快，消费速度慢的情况，那么就会造成消息在 Consumer 端堆积过多，同时又不能被其他 Consumer 消费的情况**。

而 pull 的方式可以根据当前自身情况来 pull，不会造成过多的压力而造成瓶颈。所以采取了 pull 的方式。

## Broker如何处理拉取请求的？

Consumer首次请求Broker Broker中是否有符合条件的消息

（1）有

响应 Consumer

等待下次 Consumer 的请求

（2）没有

DefaultMessageStore#ReputMessageService#run方法

PullRequestHoldService 来 Hold 连接，每个 5s 执行一次检查 pullRequestTable 有没有消息，有的话立即推送

每隔 1ms 检查 commitLog 中是否有新消息，有的话写入到 pullRequestTable

当有新消息的时候返回请求

挂起 consumer 的请求，即不断开连接，也不返回数据

使用 consumer 的 offset，





# RocketMq的负载均衡

## 生产者负载均衡

从MessageQueue列表中随机选择一个（默认策略），通过自增随机数对列表大小取余获取位置信息，但获得的MessageQueue所在的集群不能是上次的失败集群。

集群超时容忍策略，先随机选择一个MessageQueue，如果因为超时等异常发送失败，会优先选择该broker集群下其他的messeagequeue进行发送。

如果没有找到则从之前发送失败broker集群中选择一个MessageQueue进行发送，如果还没有找到则使用默认策略。

## 消费者负载均衡

1）平均分配策略(默认)(AllocateMessageQueueAveragely)

2）环形分配策略(AllocateMessageQueueAveragelyByCircle)

3）手动配置分配策略(AllocateMessageQueueByConfig)

4）机房分配策略(AllocateMessageQueueByMachineRoom)

5）一致性哈希分配策略(AllocateMessageQueueConsistentHash)

6）靠近机房策略(AllocateMachineRoomNearby)

## RocketMQ如何做负载均衡？

通过Topic在多Broker中分布式存储实现。

### 「producer端」

发送端指定 message queue发送消息到相应的 broker，来达到写入时的负载均衡

提升写入吞吐量，当多个producer同时向一个 broker 写入数据的时候，性能会下降

消息分布在多 broker 中，为负载消费做准备

默认策略是随机选择：

producer 维护一个 index
每次取节点会自增
index 向所有 broker 个数取余
自带容错策略

其他实现：

SelectMessageQueueByHash

hash的是传入的args

SelectMessageQueueByRandom

SelectMessageQueueByMachineRoom 没有实现

也可以自定义实现「MessageQueueSelector」接口中的select方法

```java
MessageQueue select(final List<MessageQueue> mqs, final Message msg, final Object arg);
```

### 「consumer端」

采用的是平均分配算法来进行负载均衡。

「其他负载均衡算法」

平均分配策略(「默认」)(AllocateMessageQueueAveragely)

环形分配策略(AllocateMessageQueueAveragelyByCircle)

手动配置分配策略(AllocateMessageQueueByConfig)

机房分配策略(AllocateMessageQueueByMachineRoom)

一致性哈希分配策略(AllocateMessageQueueConsistentHash)

靠近机房策略(AllocateMachineRoomNearby)

## 当消费负载均衡consumer和queue不对等的时候会发生什么？

Consumer 和 queue 会优先平均分配，如果 Consumer 少于 queue 的个数，则会存在部分 Consumer 消费多个 queue 的情况，如果 Consumer 等于 queue 的个数，那就是一个 Consumer 消费一个 queue，如果 Consumer 个数大于 queue 的个数，那么会有部分 Consumer 空余出来，白白的浪费了。


# RocketMq消息积压问题

## 提高消费并行读

同一个Consumer Group下，通过增加Consumer实例的数量来提高并行度，超过订阅队列数的Consumer实例无效。

提高单个Consumer的消费并行线程，通过修改Consumer的consumerThreadMin和consumerThreadMax来设置线程数。

## 批量方式消费

通过设置Consumer的consumerMessageBathMaxSize这个参数，默认是1，一次只消费一条消息，例如设置N，那么每次消费的消息条数小于等于N

## 丢弃非重要消息

当消息发生堆积时，如果消费速度跟不上生产速度，可以选择丢弃一些不重要的消息

## 优化消息消费的过程

对于消费消息的过程一般包括业务处理以及跟数据库的交互，可以试着通过一些其他的方法优化消费的逻辑。

## 临时解决方案：

新建一个topic，写一个临时的分发数据的consumer程序，这个程序部署上去消费积压的数据，消费之后不做耗时的处理，直接均匀轮询写入临时建立好的queue中。

临时用一部分机器来部署consumer，每一批consumer消费一个临时queue的数据。

等快速消费完积压数据之后，得恢复原先部署架构，重新用原先的consumer机器来消费消息。

# 为什么要自己写NameServer而不用Zk呢

1、NameServer是自己写的，方便扩展，去中心化，只要有一个NameServer在，整个注册中心环境就可以用

2、Zk选举需要满足过半机制才可以使用

# RocketMQ 部署结构

## 架构

![部署结构](https://img-blog.csdnimg.cn/img_convert/c2a02f088a0add5f9cd87492451f52ab.png)

这个是rocketMq的集群架构图，里面包含了四个主要部分：NameServer集群,Producer集群,Cosumer集群以及Broker集群

NameServer 担任路由消息的提供者。生产者或消费者能够通过NameServer查找各Topic相应的Broker IP列表分别进行发送消息和消费消息。nameServer由多个无状态的节点构成，节点之间无任何信息同步

broker会定期向NameServer以发送心跳包的方式，轮询向所有NameServer注册以下元数据信息：

1）broker的基本信息（ip port等）

2）主题topic的地址信息

3）broker集群信息

4）存活的broker信息

5）filter 过滤器

也就是说，每个NameServer注册的信息都是一样的，而且是当前系统中的所有broker的元数据信息

Producer负责生产消息，一般由业务系统负责生产消息。一个消息生产者会把业务应用系统里产生的消息发送到broker服务器。RocketMQ提供多种发送方式，同步发送、异步发送、顺序发送、单向发送。同步和异步方式均需要Broker返回确认信息，单向发送不需要

Broker，消息中转角色，负责存储消息、转发消息。在RocketMQ系统中负责接收从生产者发送来的消息并存储、同时为消费者的拉取请求作准备

Consumer 负责消费消息，一般是后台系统负责异步消费。一个消息消费者会从Broker服务器拉取消息、并将其提供给应用程序。从用户应用的角度而言提供了两种消费形式：拉取式消费、推动式消费

## 集群方式

它有哪几种部署类型？分别有什么特点？

RocketMQ 有 4 种部署类型

1）单Master

单机模式, 即只有一个Broker, 如果Broker宕机了, 会导致RocketMQ服务不可用, 不推荐使用

2）多Master模式

组成一个集群, 集群每个节点都是Master节点, 配置简单, 性能也是最高, 某节点宕机重启不会影响RocketMQ服务

缺点：如果某个节点宕机了, 会导致该节点存在未被消费的消息在节点恢复之前不能被消费

3）多Master多Slave模式，异步复制

每个Master配置一个Slave, 多对Master-Slave, Master与Slave消息采用异步复制方式, 主从消息一致只会有毫秒级的延迟

优点是弥补了多Master模式（无slave）下节点宕机后在恢复前不可订阅的问题。在Master宕机后, 消费者还可以从Slave节点进行消费。采用异步模式复制，提升了一定的吞吐量。总结一句就是，采用多Master多Slave模式，异步复制模式进行部署，系统将会有较低的延迟和较高的吞吐量

缺点就是如果Master宕机, 磁盘损坏的情况下, 如果没有及时将消息复制到Slave, 会导致有少量消息丢失

4）多Master多Slave模式，同步双写

与多Master多Slave模式，异步复制方式基本一致，唯一不同的是消息复制采用同步方式，只有master和slave都写成功以后，才会向客户端返回成功

优点：数据与服务都无单点，Master宕机情况下，消息无延迟，服务可用性与数据可用性都非常高

缺点就是会降低消息写入的效率，并影响系统的吞吐量

实际部署中，一般会根据业务场景的所需要的性能和消息可靠性等方面来选择后两种

## 你自己部署过RocketMq吗？简单说一下你当时部署的过程

由于我们项目中主要使用rocketMq做链路跟踪功能，因此需要比较高的性能，并且偶尔丢失几条消息也关系不大，所以我们就选择多Master多Slave模式，异步复制方式进行部署

部署过程简单说一下：

我部署的是双master和双slave模式集群，并部署了两个nameserver节点

1）服务器分配

分配是两台服务器，A和B，其中A服务器部署nameserv1,master1,slave2;B服务器部署nameserv2,master2和slave1节点

2）broker的配置

分别配置rocketmq安装目录下四个配置文件：

```
master1:/conf/2m-2s-async/broker-a.properties
slave2:/conf/2m-2s-async/broker-b-s.properties
master2:/conf/2m-2s-async/broker-b.properties
slave1:/conf/2m-2s-async/broker-a-s.properties
```

总的思路是：

a.master节点的brokerId为0，slave节点的brokerId为1（大于0即可）；

b.同一组broker的broker-Name相同，如master1和slave1都为broker-a;

c.每个broker节点配置相同的NameServer;

d.复制方式配置：master节点配置为ASYNC-MASTER，slave节点配置为SLAVE即可；

e.刷盘方式分为同步刷盘和异步刷盘，为了保证性能而不去考虑少量消息的丢失，因此同意配置为异步刷盘

# rocketmq如何保证高可用性？

1）集群化部署NameServer。

Broker集群会将所有的broker基本信息、topic信息以及两者之间的映射关系，轮询存储在每个NameServer中（也就是说每个NameServer存储的信息完全一样）。因此，NameServer集群化，不会因为其中的一两台服务器挂掉，而影响整个架构的消息发送与接收；

2）集群化部署多broker。

producer发送消息到broker的master，若当前的master挂掉，则会自动切换到其他的master

cosumer默认会访问broker的master节点获取消息，那么master节点挂了之后，该怎么办呢？它就会自动切换到同一个broker组的slave节点进行消费

那么你肯定会想到会有这样一个问题：consumer要是直接消费slave节点，那master在宕机前没有来得及把消息同步到slave节点，那这个时候，不就会出现消费者不就取不到消息的情况了？

这样，就引出了下一个措施，来保证消息的高可用性

3）设置同步复制

前面已经提到，消息发送到broker的master节点上，master需要将消息复制到slave节点上，rocketmq提供两种复制方式：同步复制和异步复制

异步复制，就是消息发送到master节点，只要master写成功，就直接向客户端返回成功，后续再异步写入slave节点

同步复制，就是等master和slave都成功写入内存之后，才会向客户端返回成功

那么，要保证高可用性，就需要将复制方式配置成同步复制，这样即使master节点挂了，slave上也有当前master的所有备份数据，那么不仅保证消费者消费到的消息是完整的，并且当master节点恢复之后，也容易恢复消息数据

在master的配置文件中直接配置brokerRole：SYNC_MASTER即可

# rocketmq的工作流程是怎样的？

RocketMq的工作流程如下：

1）首先启动NameServer。NameServer启动后监听端口，等待Broker、Producer以及Consumer连上来

2）启动Broker。启动之后，会跟所有的NameServer建立并保持一个长连接，定时发送心跳包。心跳包中包含当前Broker信息(ip、port等)、Topic信息以及Borker与Topic的映射关系

3）创建Topic。创建时需要指定该Topic要存储在哪些Broker上，也可以在发送消息时自动创建Topic

4）Producer发送消息。启动时先跟NameServer集群中的其中一台建立长连接，并从NameServer中获取当前发送的Topic所在的Broker；然后从队列列表中轮询选择一个队列，与队列所在的Broker建立长连接，进行消息的发送

5）Consumer消费消息。跟其中一台NameServer建立长连接，获取当前订阅Topic存在哪些Broker上，然后直接跟Broker建立连接通道，进行消息的消费

# 在Broker扩容的时候会影响到其他的Broker使用吗

不会，因为生产者是通过NameServer中注册的节点数通过轮询来实现数据的存放，节点数没有写死。

可以缩容，但是前提是Broker中的消息要被消费完。

# 单机版本中如何增加RocketMQ的吞吐量

只需要增加队列和消费者

# 如何保证RocketMQ不丢失消息

一条消息从生产到被消费，将会经历三个阶段：

![阶段](https://img-blog.csdnimg.cn/0afce44fa93245c9be41f731d0962e5c.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMxOTYwNjIz,size_16,color_FFFFFF,t_70)

生产阶段，Producer 新建消息，然后通过网络将消息投递给 MQ Broker

存储阶段，消息将会存储在 Broker 端磁盘中

消费阶段， Consumer 将会从 Broker 拉取消息

以上任一阶段都可能会丢失消息，只要找到这三个阶段丢失消息的原因，采用合理的办法避免丢失，就可以彻底解决消息丢失的问题。

## 生产阶段

生产者（Producer） 通过网络发送消息给 Broker，当 Broker 收到之后，将会返回确认响应信息给 Producer。

所以生产者只要接收到返回的确认响应，就代表消息在生产阶段未丢失。

发送消息的方式有同步和异步2种方式，不管是同步还是异步，都会碰到网络问题导致发送失败的情况。

针对这种情况，我们可以设置合理的重试次数，当出现网络问题，可以自动重试。

## Broker存储阶段

默认情况下，消息只要到了 Broker 端，将会优先保存到内存中，然后立刻返回确认响应给生产者。

随后 Broker 定期批量的将一组消息从内存异步刷入磁盘。

这种方式减少 I/O 次数，可以取得更好的性能，但是如果发生机器掉电，异常宕机等情况，消息还未及时刷入磁盘，就会出现丢失消息的情况。

若想保证 Broker 端不丢消息，保证消息的可靠性，我们需要将消息保存机制修改为同步刷盘方式，即消息存储磁盘成功，才会返回响应。

修改 Broker 端配置如下：

```
默认情况为 ASYNC_FLUSH
flushDiskType = SYNC_FLUSH
```

若Broker未在同步刷盘时间内（默认为5s）完成刷盘，将会返回 SendStatus.FLUSH_DISK_TIMEOUT 状态给生产者。

ps: 同步刷盘的缺点，降低性能，影响吞吐量。

### 集群部署

为了保证可用性，Broker 通常采用一主（master）多从（slave）部署方式。

为了保证消息不丢失，消息还需要复制到 slave 节点。

默认方式下，消息写入 master 成功，就可以返回确认响应给生产者，接着消息将会异步复制到 slave 节点。

注：master 配置：flushDiskType = SYNC_FLUSH

此时若 master 突然宕机且不可恢复，那么还未复制到 slave 的消息将会丢失。

为了进一步提高消息的可靠性，我们可以采用同步的复制方式，**master 节点将会同步等待 slave 节点复制完成，才会返回确认响应**。

同时这个过程我们还需要生产者配合，判断返回状态是否是 SendStatus.SEND_OK。若是其他状态，就需要考虑补偿重试。

虽然上述配置提高消息的高可靠性，但是会降低性能，生产实践中需要综合选择。

## 消费阶段

消费者从 broker 拉取消息，然后执行相应的业务逻辑。一旦执行成功，将会返回 ConsumeConcurrentlyStatus.CONSUME_SUCCESS 状态给 Broker。

如果Broker未收到消费确认响应或收到其他状态，消费者下次还会再次拉取到该条消息，进行重试。这样的方式有效避免了消费者消费过程发生异常，或者消息在网络传输中丢失的情况。

我们需要注意返回消息状态。只有当业务逻辑真正执行成功，我们才能返回 ConsumeConcurrentlyStatus.CONSUME_SUCCESS，否则我们需要返回 ConsumeConcurrentlyStatus.RECONSUME_LATER，稍后再重试。

## 总结

虽然以上方法提高了消息的可靠性，但是可能导致消息重发，重复消费。

所以对于消费客户端，需要注意保证幂等性。

# RocketMq的存储机制了解吗？

RocketMq采用文件系统进行消息的存储，相对于ActiveMq采用关系型数据库进行存储的方式就更直接，性能更高了

RocketMq与Kafka在写消息与发送消息上，继续沿用了Kafka的这两个方面：顺序写和零拷贝

1）顺序写

我们知道，操作系统每次从磁盘读写数据的时候，都需要找到数据在磁盘上的地址，再进行读写。而如果是机械硬盘，寻址需要的时间往往会比较长

而一般来说，如果把数据存储在内存上面，少了寻址的过程，性能会好很多；但Kafka 的数据存储在磁盘上面，依然性能很好，这是为什么呢？

这是因为，Kafka采用的是顺序写，直接追加数据到末尾。实际上，磁盘顺序写的性能极高，在磁盘个数一定，转数一定的情况下，基本和内存速度一致

因此，磁盘的顺序写这一机制，极大地保证了Kafka本身的性能

2）零拷贝

比如：读取文件，再用socket发送出去这一过程

```java
buffer = File.read
Socket.send(buffer)
```

传统方式实现：

先读取、再发送，实际会经过以下四次复制

1、将磁盘文件，读取到操作系统内核缓冲区Read Buffer

2、将内核缓冲区的数据，复制到应用程序缓冲区Application Buffer

3、将应用程序缓冲区Application Buffer中的数据，复制到socket网络发送缓冲区

4、将Socket buffer的数据，复制到网卡，由网卡进行网络传输

![传统方式](https://img-blog.csdnimg.cn/img_convert/fea25ada773cdf6925f373a0d3da306d.png)

传统方式，读取磁盘文件并进行网络发送，经过的四次数据copy是非常繁琐的

重新思考传统IO方式，会注意到在读取磁盘文件后，不需要做其他处理，直接用网络发送出去的这种场景下，第二次和第三次数据的复制过程，不仅没有任何帮助，反而带来了巨大的开销。那么这里使用了零拷贝，也就是说，直接由内核缓冲区Read Buffer将数据复制到网卡，省去第二步和第三步的复制。

那么采用零拷贝的方式发送消息，必定会大大减少读取的开销，使得RocketMq读取消息的性能有一个质的提升

此外，还需要再提一点，零拷贝技术采用了MappedByteBuffer内存映射技术，采用这种技术有一些限制，其中有一条就是传输的文件不能超过2G，这也就是为什么RocketMq的存储消息的文件CommitLog的大小规定为1G的原因

小结：RocketMq采用文件系统存储消息，并采用顺序写写入消息，使用零拷贝发送消息，极大得保证了RocketMq的性能

# RocketMq 的存储结构是怎样的？

如图所示，消息生产者发送消息到broker，都是会按照顺序存储在CommitLog文件中，每个commitLog文件的大小为1G

![存储结构](https://img-blog.csdnimg.cn/img_convert/0e4ccbaa3ab74575592dc7d0df30dccb.png)

CommitLog-存储所有的消息元数据，包括Topic、QueueId以及message

CosumerQueue-消费逻辑队列：存储消息在CommitLog的offset

IndexFile-索引文件：存储消息的key和时间戳等信息，使得RocketMq可以采用key和时间区间来查询消息

也就是说，rocketMq将消息均存储在CommitLog中，并分别提供了CosumerQueue和IndexFile两个索引，来快速检索消息

# RocketMq如何进行消息的去重？

我们知道，只要通过网络交换数据，就无法避免因为网络不可靠而造成的消息重复这个问题。

比如说RocketMq中，当consumer消费完消息后，因为网络问题未及时发送ack到broker,broker就不会删掉当前已经消费过的消息，那么，该消息将会被重复投递给消费者去消费

虽然rocketMq保证了同一个消费组只能消费一次，但会被不同的消费组重复消费，因此这种重复消费的情况不可避免

RocketMq本身并不保证消息不重复，这样肯定会因为每次的判断，导致性能打折扣，所以它将去重操作直接放在了消费端：

1）消费端处理消息的业务逻辑保持幂等性。那么不管来多少条重复消息，可以实现处理的结果都一样

2）还可以建立一张日志表，使用消息主键作为表的主键，在处理消息前，先insert表，再做消息处理。这样可以避免消息重复消费

# RocketMQ Broker中的消息被消费后会立即删除吗？

「不会」，每条消息都会持久化到CommitLog中，每个Consumer连接到Broker后会维持消费进度信息，当有消息消费后只是当前Consumer的消费进度（CommitLog的offset）更新了。

4.6版本默认48小时后会删除不再使用的CommitLog文件

- 检查这个文件最后访问时间

- 判断是否大于过期时间

- 指定时间删除，默认凌晨4点

源码如下：

```java
/**
 * {@link org.apache.rocketmq.store.DefaultMessageStore.CleanCommitLogService#isTimeToDelete()}
 */
private boolean isTimeToDelete() {
    // when = "04";
    String when = DefaultMessageStore.this.getMessageStoreConfig().getDeleteWhen();
    // 是04点，就返回true
    if (UtilAll.isItTimeToDo(when)) {
        return true;
    }
 // 不是04点，返回false
    return false;
}
/**
 * {@link org.apache.rocketmq.store.DefaultMessageStore.CleanCommitLogService#deleteExpiredFiles()}
 */
private void deleteExpiredFiles() {
    // isTimeToDelete()这个方法是判断是不是凌晨四点，是的话就执行删除逻辑。
    if (isTimeToDelete()) {
        // 默认是72，但是broker配置文件默认改成了48，所以新版本都是48。
        long fileReservedTime = 48 * 60 * 60 * 1000;
        deleteCount = DefaultMessageStore.this.commitLog.deleteExpiredFile(72 * 60 * 60 * 1000, xx, xx, xx);
    }
}                                                                     
/**
 * {@link org.apache.rocketmq.store.CommitLog#deleteExpiredFile()}
 */
public int deleteExpiredFile(xxx) {
    // 这个方法的主逻辑就是遍历查找最后更改时间+过期时间，小于当前系统时间的话就删了（也就是小于48小时）。
    return this.mappedFileQueue.deleteExpiredFileByTime(72 * 60 * 60 * 1000, xx, xx, xx);
}
```

# RocketMQ的消息堆积如何处理？

首先要找到是什么原因导致的消息堆积，是 Producer 太多了，Consumer 太少了导致的还是说其他情况，总之先定位问题。

然后看下消息消费速度是否正常，正常的话，可以通过上线更多 Consumer 临时解决消息堆积问题

如果Consumer和Queue不对等，上线了多台也在短时间内无法消费完堆积的消息怎么办？

- 准备一个临时的 topic

- queue 的数量是堆积的几倍

- queue 分布到多 Broker 中

- 上线一台 Consumer 做消息的搬运工，把原来 Topic 中的消息挪到新的 Topic里，不做业务逻辑处理，只是挪过去

- 上线 N 台 Consumer 同时消费临时 Topic 中的数据

- 改 bug

- 恢复原来的 Consumer，继续消费之前的 Topic

## 堆积消息会超时删除吗？

「不会」；RocketMQ 中的消息只会在 commitLog 被删除的时候才会消失。也就是说未被消费的消息不会存在超时删除这情况。

## 堆积的消息会不会进死信队列？

「不会」，消息在消费失败后会进入重试队列（%RETRY%+ConsumerGroup），18次才会进入死信队列（%DLQ%+ConsumerGroup）。

```java
public class MessageStoreConfig {
    // 每隔如下时间会进行重试，到最后一次时间重试失败的话就进入死信队列了。
 private String messageDelayLevel = "1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h";
}
```

# RocketMQ 在分布式事务支持这块机制的底层原理?

分布式系统中的事务可以使用「TCC」（Try、Confirm、Cancel）、「2pc」来解决分布式系统中的消息原子性

RocketMQ 4.3+ 提供分布事务功能，通过 RocketMQ 事务消息能达到分布式事务的最终一致

「RocketMQ实现方式：」

「Half Message」：预处理消息，当broker收到此类消息后，会存储到RMQ_SYS_TRANS_HALF_TOPIC的消息消费队列中

「检查事务状态」：Broker会开启一个定时任务，消费RMQ_SYS_TRANS_HALF_TOPIC队列中的消息，每次执行任务会向消息发送者确认事务执行状态（提交、回滚、未知），如果是未知，Broker会定时去回调在重新检查。

「超时」：如果超过回查次数，默认回滚消息。

也就是他并未真正进入Topic的queue，而是用了临时queue来放所谓的half message，等提交事务后才会真正的将half message转移到topic下的queue。

# 高吞吐量下如何优化生产者和消费者的性能?

## 开发

消息批量拉取

业务逻辑批量处理

同一group下，多机部署，并行消费

单个Consumer提高消费线程个数

批量消费

## 运维

网卡调优

jvm调优

多线程与cpu调优

Page Cache

# RocketMQ 是如何保证数据的高容错性的?

在不开启容错的情况下，轮询队列进行发送，如果失败了，重试的时候过滤失败的Broker

如果开启了容错策略，会通过RocketMQ的预测机制来预测一个Broker是否可用

如果上次失败的Broker可用那么还是会选择该Broker的队列

如果上述情况失败，则随机选择一个进行发送

在发送消息的时候会记录一下调用的时间与是否报错，根据该时间去预测broker的可用时间

其实就是send消息的时候queue的选择。

源码在如下：

```java
org.apache.rocketmq.client.latency.MQFaultStrategy#selectOneMessageQueue()
```

## 任何一台Broker突然宕机了怎么办？

Broker主从架构以及多副本策略。

Master 收到消息后会同步给 Slave，这样一条消息就不止一份了，Master 宕机了还有 slave 中的消息可用，保证了MQ的可靠性和高可用性。

而且 Rocket MQ4.5.0 开始就支持了 Dlegder 模式，基于 raft的，做到了真正意义的 HA。

## Broker把自己的信息注册到哪个NameServer上？

每个Broker向所有的NameServer上注册自己的信息，即每个NameServer上有所有的Broker信息

## RocketMQ如何分布式存储海量消息的？

RocketMQ 进程一般称为 Broker，集群部署的各个 Broker收到不同的消息，然后存储在自己本地的磁盘文件中。

## 任何一台 Broker 突然宕机了怎么办？还能使用吗？消息会不会丢？

RocketMQ的解决思路是Broker主从架构以及多副本策略。

Master收到消息后会同步给Slave，这样一条消息就不止一份了，Master宕机了还有slave中的消息可用，保证了MQ的可靠性和高可用新。

## 怎么知道有哪些 Broker？如何知道要连那个Broker？

有个NameServer的概念，是独立部署在几台机器上的，然后所有的Broker都会把自己注册到NameServer上去，NameServer就知道集群里有哪些Broker了!

发送消息到 Broker，会找 NameServer 去获取路由信息 系统要从 Broker 获取消息，也会找 NameServer 获取路由信息，去找到对应的 Broker 获取消息。

## NameServer到底可以部署几台机器？为什么要集群化部署？

部署多台，保证高可用性。

集群化部署是为了高可用性，NameServer 是集群里非常关键的一个角色,如果部署一台 NameServer，宕机会导致 RocketMQ 集群出现故障，所以 NameServer 一定会多机器部署，实现一个集群，起到高可用的效果。

## 系统如何从NameServer获取Broker信息？

系统主动去NameServer上拉取Broker信息及其他相关信息。

## 如果Broker宕了，NameServer是怎么感知到的？

Broker会定时（30s）向NameServer发送心跳 然后 NameServer会定时（10s）运行一个任务，去检查一下各个Broker的最近一次心跳时间，如果某个Broker超过120s都没发送心跳了，那么就认为这个Broker已经挂掉了。

## Broker挂了，系统是怎么感知到的？

主要是通过拉取NameServer上Broker的信息。但是，因为Broker心跳、NameServer定时任务、生产者和消费者拉取Broker信息，这些操作都是周期性的，所以不会实时感知，所以存在发送消息和消费消息失败的情况，现在 我们先知道，对于生产者而言，他是有 一套容错机制的。

## Master Broker 是如何将消息同步给 Slave Broker 的？

RocketMQ 自身的 Master-Slave 模式采取的是 Pull 模式拉取消息。

## 消费消息时是从Master获取还是Slave获取？

可能从Master Broker获取消息，也有可能从Slave Broker获取消息

消费者的系统在获取消息的时候会先发送请求到Master Broker上去，请求获取一批消息，此时Master Broker是会返回一批消息给消费者系统的

Master Broker在返回消息给消费者系统的时候，会根据当时Master Broker的 负载情况和Slave Broker的 同步情况，向消费者系统建议下一次拉取消息的时候是从Master Broker拉取还是从Slave Broker拉取。

## 如果 Slave Broker 挂掉了，会对整个系统有影响吗？

有一点影响，但是影响不太大，因为消息写入全部是发送到Master Broker的，获取消息也可以Master获取，少了Slave Broker，会导致所有读写压力都集中在Master Broker

## Master Broker 突然挂了，这样会怎么样？

「RocketMQ 4.5 版本之前」，用 Slave Broker 同步数据，尽量保证数据不丢失，但是一旦 Master 故障了，Slave 是没法自动切换成 Master 的。

所以在这种情况下，如果 Master Broker 宕机了，这时就得手动做一些运维操作，把 Slave Broker 重新修改一些配置，重启机器给调整为Master Broker，这是有点麻烦的，而且会导致中间一段时间不可用。

「RocketMQ 4.5之后」支持了一种叫做 Dledger 机制，基于 Raft 协议实现的一个机制。我们可以让一个 Master Broker 对应多个 Slave Broker， 一旦 Master Broker 宕机了，在多个 Slave 中通过 Dledger 技术 将一个 Slave Broker 选为新的 Master Broker 对外提供服务。

在生产环境中可以是用 Dledger 机制实现自动故障切换，只要10秒或者几十秒的时间就可以完成

# 参考资料

[MQ 相关面试题](https://blog.csdn.net/weixin_40816738/article/details/123362004)

https://blog.csdn.net/weixin_38660866/article/details/108189292

https://www.136.la/jingpin/show-68917.html

[RocketMQ 常见面试题](https://blog.csdn.net/qq_31960623/article/details/119730756)

https://cloud.tencent.com/developer/article/1973687

* any list
{:toc}
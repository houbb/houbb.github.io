---
layout: post
title:  【mq】从零开始实现 mq-15-如何保证消息队列的高可用 
date:  2022-04-15 09:22:02 +0800
categories: [MQ]
tags: [mq, netty, sh]
published: true
---

# 前景回顾

[【mq】从零开始实现 mq-01-生产者、消费者启动 ](https://mp.weixin.qq.com/s/moF528JiVG9dqCi5oFMbVg)

[【mq】从零开始实现 mq-02-如何实现生产者调用消费者？](https://mp.weixin.qq.com/s/_OF4hbh9llaxN27Cv_cToQ)

[【mq】从零开始实现 mq-03-引入 broker 中间人](https://mp.weixin.qq.com/s/BvEWsLp3_35yFVRqBOxS2w)

[【mq】从零开始实现 mq-04-启动检测与实现优化](https://mp.weixin.qq.com/s/BvEWsLp3_35yFVRqBOxS2w)

[【mq】从零开始实现 mq-05-实现优雅停机](https://mp.weixin.qq.com/s/BvEWsLp3_35yFVRqBOxS2w)

[【mq】从零开始实现 mq-06-消费者心跳检测 heartbeat](https://mp.weixin.qq.com/s/lsvm9UoQWK98Jy3kuS2aNg)

[【mq】从零开始实现 mq-07-负载均衡 load balance](https://mp.weixin.qq.com/s/ZNuecNeVJzIPCp252Hn4GQ)

[【mq】从零开始实现 mq-08-配置优化 fluent](https://mp.weixin.qq.com/s/_O20KKdGwxMcHc87rcuWug)

[【mq】从零开始实现 mq-09-消费者拉取消息 pull message](https://mp.weixin.qq.com/s/bAqOJ4fKWTAVet0Oqv8S0g)

[【mq】从零开始实现 mq-10-消费者拉取消息回执 pull message ack](https://mp.weixin.qq.com/s/OgcQI-Go1ZS9-pdLtYwkcg)

[【mq】从零开始实现 mq-11-消费者消息回执添加分组信息 pull message ack groupName](https://mp.weixin.qq.com/s/3RnB7KhZB3n8yGI6Z02-bw)

[【mq】从零开始实现 mq-12-消息的批量发送与回执](https://mp.weixin.qq.com/s/tg0gxwbGWd7cn_RGMiEWew)

[【mq】从零开始实现 mq-13-注册鉴权 auth](https://mp.weixin.qq.com/s/SzWAqyHpeTrDQyUTknsJGQ)

# 1.RabbitMQ 的高可用

RabbitMQ基于主从模式实现高可用。

RabbitMQ有三种模式：单机模式，普通集群模式，镜像集群模式。

## （1）单机模式：

单机模式就是demo级别的，生产中不会有人使用。

## （2）普通集群模式

普通集群模式就是在多台机器上启动多个rabbitmq实例，每个机器启动一个。

但是创建的queue只会放在一个rabbitmq实例上面，但是其他的实例都同步了这个queue的元数据。

在你消费的时候，如果连接到了另一个实例，他会从拥有queue的那个实例获取消息然后再返回给你。

![普通集群模式](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/5/22/16adff78d8007b62~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)

这种方式并没有做到所谓消息的高可用，就是个普通的集群，这样还会导致要么消费者每次随机连接一个实例然后拉取数据，这样的话在实例之间会产生网络传输，增加系统开销，要么固定连接那个queue所在的实例消费，这样会导致单实例的性能瓶颈。

而且如果那个方queue的实例宕机了，会导致接下来其他实例都无法拉取数据；如果没有开启消息的持久化会丢失消息；就算开启了消息的持久化，消息不一定会丢，但是也要等这个实例恢复了，才可以继续拉取数据。

所以这个并没有提供高可用，这种方案只是提高了吞吐量，也就是让集群中多个节点来服务某个queue的读写操作。

## （3）镜像集群模式

这种模式，才是 rabbitmq 提供是真正的高可用模式，跟普通集群不一样的是，你创建的queue，无论元数据还是queue里面是消息数据都存在多个实例当中，然后每次写消息到queue的时候，都会自动把消息到多个queue里进行消息同步。

![镜像集群模式](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/5/22/16adff78d8be07c0~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)

这种模式的好处在于，任何一台机器宕机了，其他的机器还可以使用。

坏处在于： 

1、性能消耗太大，所有机器都要进行消息的同步，导致网络压力和消耗很大。

2、没有扩展性可言，如果有一个queue负载很重，就算加了机器，新增的机器还是包含了这个queue的所有数据，并没有办法扩展queue。

如何开启镜像集群模式： 在控制台新增一个镜像集群模式的策略，指定的时候可以要求数据同步到所有节点，也可以要求同步到指定节点，然后在创建queue的时候，应用这个策略，就会自动将数据同步到其他的节点上面去了。

# kafka 的高可用

## kafka的一个基本架构

多个broker组成，一个broker是一个节点；你创建一个topic，这个topic可以划分成多个partition，每个partition可以存在于不同的broker上面，每个partition存放一部分数据。

这是天然的分布式消息队列。

实际上rabbitmq并不是分布式消息队列，他就是传统的消息队列，只不过提供了一些集群、HA的机制而已，因为无论如何配置，rabbitmq一个queue的数据就存放在一个节点里面，镜像集群下，也是每个节点都放这个queue的全部数据。

kafka在0.8以前是没有HA机制的，也就是说任何一个broker宕机了，那个broker上的partition就丢了，没法读也没法写，没有什么高可用可言。

kafka在0.8之后，提过了HA机制，也就是replica副本机制。每个partition的数据都会同步到其他机器上，形成自己的replica副本。然后所有的replica副本会选举一个leader出来，那么生产者消费者都和这个leader打交道，其他的replica就是follower。

写的时候，leader会把数据同步到所有follower上面去，读的时候直接从leader上面读取即可。

为什么只能读写leader： 因为要是你可以随意去读写每个follower，那么就要关心数据一致性问题，系统复杂度太高，容易出问题。

kafka会均匀度讲一个partition的所有数据replica分布在不同的机器上，这样就可以提高容错性。

这样就是高可用了，因为如果某个broker宕机了，没事儿，那个broker的partition在其他机器上有副本，如果这上面有某个partition的leader，那么此时会重新选举出一个现代leader出来，继续读写这个新的leader即可。

![kafka 的高可用](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/5/22/16adff78d8b67bf0~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)

## 写消息

写数据的时候，生产者就写leader，然后leader将数据落到磁盘上之后，接着其他follower自己主动从leader来pull数据。

一旦所有follower同步好了数据，就会发送ack个leader，leader收到了所有的follower的ack之后，就会返回写成功的消息给消息生产者。

（这只是一种模式，可以调整）。

## 读数据

消费数据的时候，只会从leader进行消费。但是只有一个消息已经被所有follower都同步成功返回ack的时候，这个消息才会被消费者读到。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

[Kafka 为什么这么快](https://houbb.github.io/2018/09/19/kafka-fast-reason)

# 参考资料

[关于MQ的几件小事（二）如何保证消息队列的高可用](https://juejin.cn/post/6844903849094807559)

* any list
{:toc}
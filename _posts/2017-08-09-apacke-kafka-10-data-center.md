---
layout: post
title:  Apache Kafka-10-data center 数据中心
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: false
---

# 数据中心

有一些部署需要维护一个跨越多个数据中心的数据管道。

对此，我们推荐的方法是在每个拥有众多应用实例的数据中心内部署一个本地Kafka集群，在每个数据中心内只与本地的kafka集群进行交互，然后各集群之间通过镜像进行同步，

> 请[参阅镜像制作工具了解怎么做到这一点](https://kafka.apachecn.org/documentation.html#basic_ops_mirror_maker)。

这种部署模式允许数据中心充当一个独立的实体，并允许我们能够集中的管理和调节数据中心之间的复制。

在这种部署模式下，即使数据中心间的链路不可用，每个设施也可以独立运行：当发生这种情况时，镜像会落后，直到链路恢复正常并追上时为止。

如果应用程序需要所有数据的全局视图，你可以提供一个聚合数据的集群，使用镜像将所有数据中心的本地集群镜像聚合起来。聚合集群用于需要全部数据集的应用程序读取。

这并是不唯一的部署模式，可以通过广域网读取或者写入到远程的Kafka集群，但是这显然会增加获取集群的延时。

Kafka能在生产端和消费端很轻易的批处理数据，所以即使在高延时的连接中也可以实现高吞吐量。

为此.虽然我们可能需要在生产端，消费端还有broker端增加TCP 套接字缓冲区大小，修改如下参数配置socket.send.buffer.bytes 和 socket.receive.buffer.bytes。具体请参见这里。

通常不建议在高延时链路的情况下部署一个跨越多个数据中心的Kafka集群。

这将对Kafka写入和ZooKeeper写入产生非常高的复制延时，当各位置节点之间的网络不可用时，Kafka和ZooKeeper也将不保证可用

# 参考资料

[kafka 基本操作](https://kafka.apachecn.org/documentation.html#operations)

* any list
{:toc}
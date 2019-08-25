---
layout: post
title: 流式计算-Compare 不同框架的选型-03
date:  2019-5-10 11:08:59 +0800
categories: [Stream]
tags: [stream, sh]
published: true
---

# 实时流处理系统比较与选型

当前流行的实时流处理系统主要包括Apache基金会旗下的Apache Storm、Apache Flink、Apache Spark Streaming和Apache Kafka Streams等项目。

虽然它们和Heron同属于实时流处理范畴，但是它们也有各自的特点。

# Heron对比Storm（包括Trident）

在Twitter内部，Heron替换了Storm，是流处理的标准。

## 数据模型的区别

Heron兼容Storm的数据模型，或者说Heron兼容Storm的API，但是背后的实现完全不同。

所以它们的应用场景是一样的，能用Storm的地方也能用Heron。

但是Heron比Storm提供更好的效率，更多的功能，更稳定，更易于维护。

Storm Trident是Storm基础上的项目，提供高级别的API，如同Heron的函数式API。

Trident以checkpoint加rollback的方式实现了exactly once；

Heron以Chandy和Lamport发明的分布式快照算法实现了effectively once。

## 应用程序架构的区别

Storm的worker在每个JVM进程中运行多个线程，每个线程中执行多个任务。

这些任务的log混在一起，很难调试不同任务的性能。

Storm的nimbus无法对worker进行资源隔离，所以多个topology的资源之间互相影响。

另外ZooKeeper被用来管理heartbeat，这使得ZooKeeper很容易变成瓶颈。

Heron的每个任务都是单独的JVM进程，方便调试和资源隔离管理，同时节省了整个topology的资源。

ZooKeeper在Heron中只存放很少量的数据，heartbeat由tmaster进程管理，对ZooKeeper没有压力。


# Heron对比Flink

Flink框架包含批处理和流处理两方面的功能。

Flink的核心采用流处理的模式，它的批处理模式通过模拟块数据的的流处理形式得到。

## 数据模型的区别

Flink在API方面采用declarative的API模式。

Heron既提供declarative模式API或者叫做functional API也提供底层compositional模式的API，此外Heron还提供Python和C++的API。

ps: 即提供原子性的方法，也提供组合型的方法。

## 应用程序架构的区别

在运行方面，Flink可以有多种配置，一般情况采用的是多任务多线程在同一个JVM中的混杂模式，不利于调试。

Heron采用的是单任务单JVM的模式，利于调试与资源分配。

在资源池方面，Flink和Heron都可以与多种资源池合作，包括Mesos/Aurora、YARN、Kubernetes等。

# Heron对比Spark Streaming

## 时间窗口

Spark Streaming处理tuple的粒度是micro-batch，通常使用半秒到几秒的时间窗口，将这个窗口内的tuple作为一个micro-batch提交给Spark处理。

而Heron使用的处理粒度是tuple。

由于时间窗口的限制，Spark Streaming的平均响应周期可以认为是半个时间窗口的长度，而Heron就没有这个限制。

所以Heron是低延迟，而Spark Streaming是高延迟。

Spark Streaming近期公布了一项提案，计划在下一个版本2.3中加入一个新的模式，新的模式不使用micro-batch来进行计算。

## 数据模型的区别

语义层面上，Spark Streaming和Heron都实现了exactly once/effectively once。

状态层面上，Spark Streaming和Heron都实现了stateful processing。

API接口方面，Spark Streaming支持SQL，Heron暂不支持。

Spark Streaming和Heron都支持Java、Python接口。

需要指出的是，Heron的API是pluggable模式的，除了Java和Python以外，Heron可以支持许多编程语言，比如C++。

## 应用程序架构的区别

任务分配方面，Spark Streaming对每个任务使用单个线程。

一个JVM进程中可能有多个任务的线程在同时运行。

Heron对每个任务都是一个单独的heron-instance进程，这样的设计是为了方便调试，因为当一个task失败的时候，只用把这个任务进程拿出来检查就好了，避免了进程中各个任务线程相互影响。

资源池方面，Spark Streaming和Heron都可以运行在YARN和Mesos上。

需要指出的是Heron的资源池设计是pluggable interface的模式，可以连接许多资源管理器，比如Aurora等。


## Heron对比Kafka Streams

Kafka Streams是一个客户端的程序库。通过这个调用库，应用程序可以读取Kafka中的消息流进行处理。

## 数据模型的区别

Kafka Streams与Kafka绑定，需要订阅topic来获取消息流，这与Heron的DAG模型完全不同。

对于DAG模式的流计算，DAG的结点都是由流计算框架控制，用户计算逻辑需要按照DAG的模式提交给这些框架。

Kafka Streams没有这些预设，用户的计算逻辑完全用户控制，不必按照DAG的模式。

此外，Kafka Streams也支持反压（back pressure）和stateful processing。

Kafka Streams定义了2种抽象：KStream和KTable。

在KStream中，每一对key-value是独立的。在KTable中，key-value以序列的形式解析。

## 应用程序架构的区别

Kafka Streams是完全基于Kafka来建设的，与Heron等流处理系统差别很大。

Kafka Streams的计算逻辑完全由用户程序控制，也就是说流计算的逻辑并不在Kafka集群中运行。

Kafka Streams可以理解为一个连接器，从Kafka集群中读取和写入键值序列，计算所需资源和任务生命周期等等都要用户程序管理。

而Heron可以理解为一个平台，用户提交topology以后，剩下的由Heron完成。
 
# 选型

归纳以上对各个系统的比较，我们可以得到如上的表基于以上表格的比较，我们可以得到如下的选型要点：

![image](https://user-images.githubusercontent.com/18375710/63644508-0a29c780-c71d-11e9-9e4f-0f5813c58e9e.png)

Storm适用于需要快速响应、中等流量的场景。Storm和Heron在API上兼容，在功能上基本可以互换；Twitter从Storm迁移到了Heron，说明如果Storm和Heron二选一的话，一般都是选Heron。

Kafka Streams与Kafka绑定，如果现有系统是基于Kafka构建的，可以考虑使用Kafka Streams，减少各种开销。

一般认为Spark Streaming的流量是这些项目中最高的，但是它的响应延迟也是最高的。对于响应速度要求不高、但是对流通量要求高的系统，可以采用Spark Streaming；如果把这种情况推广到极致就可以直接使用Spark系统。

Flink使用了流处理的内核，同时提供了流处理和批处理的接口。如果项目中需要同时兼顾流处理和批处理的情况，Flink比较适合。同时因为需要兼顾两边的取舍，在单个方面就不容易进行针对性的优化和处理。

总结上面，Spark Streaming、Kafka Streams、Flink都有特定的应用场景，其他一般流处理情况下可以使用Heron。

# 参考资料

[Heron：来自Twitter的新一代流处理引擎应用篇](https://blog.csdn.net/dev_csdn/article/details/78898866)

* any list
{:toc}
---
layout: post
title:  Apache Kafka-02-性能调优
date:  2017-8-9 09:32:36 +0800
categories: [Apache]
tags: [apache, kafka, best-practice, mq]
published: true
---

# 性能调优

无论一个工具的性能多么的好，也需要我们合理的使用和配置这个工具。

知道原理，更加有利于我们找到优化的方向，


## 主要优化原理和思路

kafka是一个高吞吐量分布式消息系统，并且提供了持久化。其高性能的有两个重要特点：

1. 利用了磁盘连续读写性能远远高于随机读写的特点；

2. 并发，将一个topic拆分多个partition。

要充分发挥kafka的性能，就需要满足这两个条件

kafka读写的单位是partition，因此，将一个topic拆分为多个partition可以提高吞吐量。但是，这里有个前提，就是不同partition需要位于不同的磁盘（可以在同一个机器）。如果多个partition位于同一个磁盘，那么意味着有多个进程同时对一个磁盘的多个文 件进行读写，使得操作系统会对磁盘读写进行频繁调度，也就是破坏了磁盘读写的连续性。

在linkedlin的测试中，每台机器就加载了6个磁盘，并且不做raid，就是为了充分利用多磁盘并发读写，又保证每个磁盘连续读写的特性。

具体配置上，是将不同磁盘的多个目录配置到broker的log.dirs，

例如 

```
log.dirs=/disk1/kafka-logs,/disk2/kafka-logs,/disk3/kafka-logs 
```

kafka会在新建partition的时候，将新partition分布在partition最少的目录上，因此，一般不能将同一个磁盘的多个目录设置到log.dirs

同一个ConsumerGroup内的Consumer和Partition在同一时间内必须保证是一对一的消费关系

任意Partition在某一个时刻只能被一个Consumer Group内的一个Consumer消费(反过来一个Consumer则可以同时消费多个Partition)

## 优化的方向

- jvm

- 日志异步

- 分区

- 生产者

- 消费者

- Broker 


# 参考资料

- 关键词

kafka 性能

- 参考资料

[Kafka如何做到1秒处理1500万条消息？](https://mp.weixin.qq.com/s/NZpWoDZ92wCHLaOrTPLb8w)

* any list
{:toc}


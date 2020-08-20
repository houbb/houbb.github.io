---
layout: post
title:  Apache Kafka-11-config kafka 配置
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: false
---


# 重要的客户端配置

最重要的老的 scala 版本的 producer 配置

```
acks
compression
sync vs async production
batch size (for async producers)
```

最重要的新的 Java 版本的 producer 配置

```
acks
compression
batch size
```

最重要的 consumer 配置是 fetch size。


所有的配置请查阅 [configuration](https://kafka.apachecn.org/documentation.html#configuration) 章节。

# 一个生产服务器配置

以下是生产服务器配置示例：

```
#  ZooKeeper
zookeeper.connect=[list of ZooKeeper servers]
 
# Log configuration
num.partitions=8
default.replication.factor=3
log.dir=[List of directories. Kafka should have its own dedicated disk(s) or SSD(s).]
 
# Other configurations
broker.id=[An integer. Start with 0 and increment by 1 for each new broker.]
listeners=[list of listeners]
auto.create.topics.enable=false
min.insync.replicas=2
queued.max.requests=[number of concurrent requests]
```

我们的客户端配置在不同的使用场景下需要相应的变化。

# Java 版本

从安全角度来看，我们建议您使用JDK 1.8的最新发布版本，因为较早的免费版本已经披露了安全漏洞。 

LinkedIn目前正在使用G1垃圾收集器运行JDK1.8 u5（希望升级到更新的版本）。

如果您决定使用G1（当前默认值），并且您仍然使用JDK1.7，请确保您使用的是u51或者以上版本。LinkedIn已经在测试中试用了u21，但是在该版本中，GC方面存在着一些问题。 

LinkedIn的调整如下所示:

```
-Xmx6g -Xms6g -XX:MetaspaceSize=96m -XX:+UseG1GC
-XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35 -XX:G1HeapRegionSize=16M
-XX:MinMetaspaceFreeRatio=50 -XX:MaxMetaspaceFreeRatio=80
```

作为参考，下面是LinkedIn最繁忙的群集（峰值）之一的统计数据：

```
60 brokers
50k partitions (replication factor 2)
800k messages/sec in
300 MB/sec inbound, 1 GB/sec+ outbound
```

该调整看起来相当激进，但是在集群中的所有broker的GC暂停时间90%都在大约21ms，并且每秒钟的yong GC少于一次。

# 参考资料

[kafka 配置](https://kafka.apachecn.org/documentation.html#config)

* any list
{:toc}
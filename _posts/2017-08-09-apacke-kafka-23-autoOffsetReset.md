---
layout: post
title:  Apache Kafka-23-kafka autoOffsetReset 配置详解
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: false
---

# 报错信息

```
Undefined offset with no reset policy for partitions
```

## 报错原因

这是因为设置的auto.offset.reset为none，表示如果在kafka broker中找不到当前消费者组的offset时，则抛出异常。

源码

```java
/**
 * <code>auto.offset.reset</code>
 */
public static final String AUTO_OFFSET_RESET_CONFIG = "auto.offset.reset";
public static final String AUTO_OFFSET_RESET_DOC = "What to do when there is no initial offset in Kafka or if the current offset doesnot exist any more on the server (e.g. because that data has been deleted): <ul><li>earliest: automatically reset the offset to theearliest offset<li>latest: automatically reset the offset to the latest offset</li><li>none: throw exception to the consumer if noprevious offset is found for the consumer's group</li><li>anything else: throw exception to the consumer.</li></ul>";
```

## 代码配置

```java
@Bean("kafkaConsumerProperties")
public Map<String, Object> kafkaConsumerProperties() {
    Map<String, Object> props = new HashMap<>(4);
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    props.put(ConsumerConfig.GROUP_ID_CONFIG, consumerGroupId);
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, consumerAutoOffsetReset);
    return props;
}
```

# 含义说明

- earliest

当各分区下有已提交的offset时，从提交的offset开始消费；无提交的offset时，从头开始消费

- latest

当各分区下有已提交的offset时，从提交的offset开始消费；无提交的offset时，消费新产生的该分区下的数据

- none

topic各分区都存在已提交的offset时，从offset后开始消费；只要有一个分区不存在已提交的offset，则抛出异常

# 参考资料

《kafka 权威指南》

[Kafka auto.offset.reset值详解](https://blog.csdn.net/lishuangzhe7047/article/details/74530417)

[kafka的auto.offset.reset详解](https://blog.csdn.net/xianpanjia4616/article/details/84347087)

* amy list
{:toc}

 


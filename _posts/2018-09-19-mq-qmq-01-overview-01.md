---
layout: post
title: QMQ-01-入门使用
date:  2018-09-19 15:44:59 +0800
categories: [MQ]
tags: [jms, mq, sh]
published: true
---

# QMQ

[QMQ](https://github.com/qunarcorp/qmq) QMQ是去哪儿网内部广泛使用的消息中间件，自2012年诞生以来在去哪儿网所有业务场景中广泛的应用，包括跟交易息息相关的订单场景； 也包括报价搜索等高吞吐量场景。

目前在公司内部日常消息qps在60W左右，生产上承载将近4W+消息topic，消息的端到端延迟可以控制在10ms以内。

## 特性

主要提供以下特性：

异步实时消息
延迟/定时消息(支持任意秒级)
广播消息(每个Consumer都收到相同消息，比如本地cache更新)
基于Tag的服务端过滤
Consumer端幂等处理支持
Consumer端filter
消费端支持按条ack消息
死信消息
结合Spring annotation使用的简单API
提供丰富的监控指标
接入OpenTracing
事务消息
Consumer的处理能力也可以方便扩容缩容
Server可以随心所欲扩容缩容
Java Client, .NET Client
消息投递轨迹(即将开源)
历史消息的自动备份(即将开源)
有序消息(即将开源)

## 版本要求

JDK最低版本要求

Client: 1.7及其以上版本

Server: 1.8及其以上版本


# 快速开始

## Maven

```xml
<dependency>
    <groupId>com.qunar.qmq</groupId>
    <artifactId>qmq</artifactId>
    <version>1.1.3</version>
</dependency>
```

## 发送消息

```java
MessageProducerProvider producer = new MessageProducerProvider();
producer.init();

Message message = producer.generateMessage("your subject");
message.setProperty("key", "value");
//发送延迟消息
//message.setDelayTime(15, TimeUnit.MINUTES);
producer.sendMessage(message);
```

## 消费消息

```java
@QmqConsumer(subject = "your subject", consumerGroup = "group", executor = "your executor")
public void onMessage(Message message){
    //process your message
    String value = message.getStringProperty("key");
}
```

# 参考资料

[快速开始](https://github.com/qunarcorp/qmq/blob/master/docs/cn/quickstart.md)

* any list
{:toc}
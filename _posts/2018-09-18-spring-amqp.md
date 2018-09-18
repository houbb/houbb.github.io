---
layout: post
title: Spring AMQP 
date:  2018-09-17 11:54:23 +0800
categories: [MQ]
tags: [java, spring, amqp, mq, sh]
published: true
excerpt: Spring AMQP 入门介绍
---

# Spring AMQP

Spring AMQP项目将核心Spring概念应用于基于AMQP的消息传递解决方案的开发。

它提供了一个“模板”，作为发送和接收消息的高级抽象。

它还提供了对带有“侦听器容器”的消息驱动pojo的支持。

这些库有助于管理AMQP资源，同时促进依赖注入和声明性配置的使用。在所有这些情况下，您将看到与Spring框架中的JMS支持的相似之处。

项目由两部分组成; spring-amqp 是基本抽象，spring-rabbit 是 RabbitMQ 实现。

## Features

用于异步处理入站消息的侦听器容器

用于发送和接收消息的RabbitTemplate

用于自动声明队列、交换器和绑定的RabbitAdmin

# 快速开始

## jar 引入

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.amqp</groupId>
        <artifactId>spring-rabbit</artifactId>
        <version>2.0.6.RELEASE</version>
    </dependency>
</dependencies>
```

## 代码

- QuickStart.java

```java
/*
 * Copyright (c)  2018. houbinbin Inc.
 * jms All rights reserved.
 */

package com.github.houbb.jms.learn.spring.amqp.hello;

import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

public class QuickStart {

    public static void main(String[] args) {
        ConnectionFactory connectionFactory = new CachingConnectionFactory();
        AmqpAdmin admin = new RabbitAdmin(connectionFactory);
        admin.declareQueue(new Queue("myqueue"));
        AmqpTemplate template = new RabbitTemplate(connectionFactory);
        template.convertAndSend("myqueue", "foo");
        String foo = (String) template.receiveAndConvert("myqueue");
        System.out.println(foo);
    }

}
```

## 日志

```
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.

Sep 18, 2018 4:29:28 PM org.springframework.amqp.rabbit.connection.CachingConnectionFactory createBareConnection
信息: Attempting to connect to: houbinbindeMacBook-Pro.local:5672
Sep 18, 2018 4:29:28 PM org.springframework.amqp.rabbit.connection.CachingConnectionFactory createBareConnection
信息: Created new connection: SpringAMQP#43a25848:0/SimpleConnection@47f6473 [delegate=amqp://guest@192.168.1.103:5672/, localPort= 54867]
foo
```


# 个人感想

spring 这是想做一套规范，可能是认为 jms 不够方便。

暂时不做深入学习，这样的话 rabbitmq 简直被 spring AMQP 带起来了。

# 参考资料

https://spring.io/projects/spring-amqp

* any list
{:toc}
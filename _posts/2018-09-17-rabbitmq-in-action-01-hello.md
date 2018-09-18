---
layout: post
title: RabbitMQ 实战入门-01-Hello World
date:  2018-09-17 13:43:16 +0800
categories: [MQ]
tags: [java, docker, mq, in-action, sh]
published: true
excerpt: RabbitMQ 实战入门-01-Hello World
---

# 准备工作

## 测试环境

jdk 1.8

mac 系统

## 前期准备

保证 [maven](https://houbb.github.io/2016/10/22/maven) 正确配置。

保证 [rabbitmq](https://houbb.github.io/2018/09/17/docker-rabbitmq) 服务已经启动。

# 基本元素介绍

## 生产者

生产就是发送。发送消息的程序是生产者。

## 队列

队列是位于RabbitMQ内的邮箱的名称。

尽管消息流经RabbitMQ和您的应用程序，但它们只能存储在队列中。

队列只受主机的内存和磁盘限制，它本质上是一个大的消息缓冲区。

许多生产者可以向一个队列发送消息，许多消费者可以尝试从一个队列接收数据。

## 消费者

消费与接受有着相似的含义。消费者是一个主要等待接收消息的程序。

# Hello World

## 场景

在本教程的这一部分中，我们将用Java编写两个程序;发送单个消息的生产者和接收消息并将其打印出来的消费者。我们将在Java API中忽略一些细节，只关注这个非常简单的事情。这是一个信息传递的“你好世界”。

在下面的图表中，“P”是我们的生产者，“C”是我们的消费者。中间的框是一个队列——RabbitMQ代表使用者保存的消息缓冲区。

```
+---+     +---------------+     +---+
| P | --> | Message Queue | --> | C |
+---+     +---------------+     +---+
```

## maven jar 依赖

```xml
<dependency>
    <groupId>com.rabbitmq</groupId>
    <artifactId>amqp-client</artifactId>
    <version>4.2.0</version>
</dependency>
```

ps: 此处偷懒，没有引入 slf4j 相关 jar 及其实现。

## 代码

- 生产者

```java
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

/**
 * <p> 发送者 </p>
 */
public class Send {

    /**
     * 队列名称
     */
    private final static String QUEUE_NAME = "hello";

    public static void main(String[] args) throws IOException, TimeoutException {
        // 1. 创建连接
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        // 2. 指定发送的队列及其信息
        channel.queueDeclare(QUEUE_NAME, false, false, false, null);
        String message = "Hello World!";
        channel.basicPublish("", QUEUE_NAME, null, message.getBytes());
        System.out.println(" [x] Sent '" + message + "'");

        // 3. 关闭连接
        channel.close();
        connection.close();
    }
}
```

- 消费者

```java
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

/**
 * <p> 接受者 </p>
 */
public class Receiving {

    private final static String QUEUE_NAME = "hello";

    public static void main(String[] args) throws IOException, TimeoutException {
        // 1. 创建连接信息
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        // 2. 指定队列
        channel.queueDeclare(QUEUE_NAME, false, false, false, null);
        System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

        // 3. 指定消费者
        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope,
                                       AMQP.BasicProperties properties, byte[] body)
                    throws IOException {
                String message = new String(body, "UTF-8");
                System.out.println(" [x] Received '" + message + "'");
            }
        };
        channel.basicConsume(QUEUE_NAME, true, consumer);
    }
}
```

## 测试

首先运行生产者

```
[x] Sent 'Hello World!'
```

在运行消费者。

```
[*] Waiting for messages. To exit press CTRL+C
[x] Received 'Hello World!'
```

## 源码地址

以上源代码参见 [rabbitmq-hello](https://github.com/houbb/jms-learn/tree/master/jms-rabbitmq/jms-rabbitmq-hello/src/main/java/com/github/houbb/jms/rabbitmq/hello)

# 参考资料

- 官方

http://www.rabbitmq.com/getstarted.html

https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/java

* any list
{:toc}
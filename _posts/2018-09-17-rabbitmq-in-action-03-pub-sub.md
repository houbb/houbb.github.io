---
layout: post
title: RabbitMQ 实战入门-03-发布/订阅模式
date:  2018-09-17 13:43:16 +0800
categories: [MQ]
tags: [java, docker, mq, in-action, sh]
published: true
excerpt: RabbitMQ 实战入门-03-发布/订阅模式
---

# Publish/Subscribe

在前面的教程中，我们创建了一个工作队列。工作队列后面的假设是，每个任务只交付给一个工作者。在这一部分中，我们将做一些完全不同的事情——我们将向多个消费者传递消息。这种模式称为“发布/订阅”。

为了说明这个模式，我们将构建一个简单的日志系统。它将由两个程序组成——第一个程序将发出日志消息，第二个程序将接收并打印它们。

在我们的日志系统中，接收程序的每个运行副本都会收到消息。这样我们就可以运行一个接收器，并将日志指向磁盘;同时，我们可以运行另一个接收器在屏幕上看到日志。

实际上，已发布的日志消息将被**广播**到所有接收方。

# Exchange

在本教程的前几部分中，我们向队列发送和接收消息。

现在是时候介绍Rabbit中的完整消息传递模型了。

让我们快速回顾一下我们在前面教程中介绍的内容:

- 生产者是发送消息的用户应用程序。

- 队列是存储消息的缓冲区。

- 使用者是接收消息的用户应用程序。

RabbitMQ消息传递模型的核心思想是，生产者从不直接向队列发送任何消息。实际上，生产者常常根本不知道消息是否会传递到任何队列。

相反，生产者只能向交换器发送消息。交换是一件非常简单的事情。一边接收来自生产者的消息，另一边将消息推送到队列中。

交换器必须确切地知道如何处理接收到的消息。它应该附加到特定的队列吗?它应该附加到许多队列中吗?或者它应该被丢弃。

这些规则由exchange类型定义。

![pub-sub](http://www.rabbitmq.com/img/tutorials/exchanges.png)

## 交换类型

direct, topic, headers and fanout. 

有几种交换类型可用: direct topic, headers 和 fanout。

我们将关注最后一个——fanout。

- 创建

让我们创建这种类型的交换，并将其称为日志:

```java
channel.exchangeDeclare("logs", "fanout");
```

扇出交换(fanout exchange)非常简单。

顾名思义，它只是将接收到的所有消息广播给它所知道的所有队列。这正是我们需要的记录器。

- 发布

```java
channel.basicPublish( "logs", "", null, message.getBytes());
```

- 列出所有的交换类型

```
sudo rabbitmqctl list_exchanges
```

- 无名交换

```java
channel.basicPublish("", "hello", null, message.getBytes());
```

空字符串表示默认的或无名的交换: 如果存在的话，消息将以routingKey指定的名称路由到队列中。

# Temporary queues

您可能还记得以前我们使用的队列有一个指定的名称(还记得hello和task_queue吗?)能够命名一个队列对我们来说至关重要——我们需要将工人指向同一个队列。

当您希望在生产者和消费者之间共享队列时，为队列提供一个名称非常重要。

但我们的记录员却不是这样。我们希望听到所有日志消息，而不仅仅是其中的一个子集。我们也只对当前流动的消息感兴趣，而不是旧的消息。要解决这个问题，我们需要两件事。

首先，当我们连接到Rabbit时，我们需要一个新的空队列。为此，我们可以创建一个随机名称的队列，或者更好的做法是让服务器为我们选择一个随机队列名称。

其次，一旦我们断开用户的连接，队列就会被自动删除。

在Java客户机中，当我们不向queueDeclare()提供任何参数时，我们将创建一个具有生成名称的非持久性、互斥性、自动删除队列:

```java
String queueName = channel.queueDeclare().getQueue();
```

## 属性配置

[队列相关属性配置](http://www.rabbitmq.com/queues.html)

# Bindings

我们已经创建了一个扇出交换和一个队列。现在我们需要告诉exchange将消息发送到我们的队列。exchange和队列之间的关系称为绑定。

```java
channel.queueBind(queueName, "logs", "");
```

- Listing bindings

罗列出所有的队列绑定

```
rabbitmqctl list_bindings
```

# 示例代码

## 生产者

```java
import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeoutException;

import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;

public class EmitLog {

    private static final String EXCHANGE_NAME = "logs";

    public static void main(String[] argv)
            throws java.io.IOException, TimeoutException {

        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.exchangeDeclare(EXCHANGE_NAME, "fanout");

        // 模拟 5 次
        for (int i = 0; i < 5; i++) {
            String message = UUID.randomUUID().toString();

            channel.basicPublish(EXCHANGE_NAME, "", null, message.getBytes());
            System.out.println(" [x] Sent '" + message + "'");
        }
        channel.close();
        connection.close();
    }
}
```

## 消费者

```java
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;

import java.io.IOException;

public class ReceiveLogs {

    private static final String EXCHANGE_NAME = "logs";

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.exchangeDeclare(EXCHANGE_NAME, "fanout");
        String queueName = channel.queueDeclare().getQueue();
        channel.queueBind(queueName, EXCHANGE_NAME, "");

        System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope,
                                       AMQP.BasicProperties properties, byte[] body) throws IOException {
                String message = new String(body, "UTF-8");
                System.out.println(" [x] Received '" + message + "'");
            }
        };
        channel.basicConsume(queueName, true, consumer);
    }
}
```

## 测试方式

窗口 1：ReceiveLogs - 01

窗口 2：ReceiveLogs - 01

启动 EmitLog

- EmitLog 日志

```
 [x] Sent 'e9fc8989-a72a-4626-a578-a8fa931b462d'
 [x] Sent 'afe3a804-93f2-45a0-b340-b12db0638de2'
 [x] Sent 'c42a6ef1-4676-434d-8de5-3105736858db'
 [x] Sent 'ee432f13-ae0d-43db-be3b-b7527000a3be'
 [x] Sent '0931bf27-468a-4695-ad2f-f038d9723d0c'
```

- ReceiveLogs - 01 日志

```
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received 'e9fc8989-a72a-4626-a578-a8fa931b462d'
 [x] Received 'afe3a804-93f2-45a0-b340-b12db0638de2'
 [x] Received 'c42a6ef1-4676-434d-8de5-3105736858db'
 [x] Received 'ee432f13-ae0d-43db-be3b-b7527000a3be'
 [x] Received '0931bf27-468a-4695-ad2f-f038d9723d0c'
```

- ReceiveLogs - 02 日志

```
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received 'e9fc8989-a72a-4626-a578-a8fa931b462d'
 [x] Received 'afe3a804-93f2-45a0-b340-b12db0638de2'
 [x] Received 'c42a6ef1-4676-434d-8de5-3105736858db'
 [x] Received 'ee432f13-ae0d-43db-be3b-b7527000a3be'
 [x] Received '0931bf27-468a-4695-ad2f-f038d9723d0c'
```

就像广播一样，每个订阅者都受到相同的内容。

# 源码地址

以上源代码参见 [rabbitmq-pubsub](https://github.com/houbb/jms-learn/tree/master/jms-rabbitmq/jms-rabbitmq-hello/src/main/java/com/github/houbb/jms/rabbitmq/pubsub)


# 参考资料

- 官方

http://www.rabbitmq.com/tutorials/tutorial-three-java.html

https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/java

* any list
{:toc}
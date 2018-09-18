---
layout: post
title: RabbitMQ 实战入门-05-Topics
date:  2018-09-17 13:43:16 +0800
categories: [MQ]
tags: [java, docker, mq, in-action, sh]
published: true
excerpt: RabbitMQ 实战入门-05-Topics
---

# Topics

在前面的教程中，我们改进了日志系统。我们没有使用只能进行虚拟广播的扇出(`fanout`)交换，而是使用了直接(`direct`)交换，并获得了选择性地接收日志的可能性。

虽然使用 direct exchange 改进了我们的系统，但是它仍然有局限性——它不能基于多个标准进行路由。

在我们的日志系统中，我们可能不仅要根据严重性订阅日志，还要根据发出日志的源订阅日志。

您可能从 syslog unix 工具中了解了这个概念，该工具根据严重性(info/warn/crit…)和功能(auth/cron/kern…)来路由日志。

这将给我们带来很大的灵活性——我们可能只希望听到来自“cron”的关键错误，但也希望听到来自“kern”的所有日志。

要在日志系统中实现这一点，我们需要了解更复杂的主题交换。

# Topic exchange

发送到主题交换的消息不能有任意的routing_key——它必须是由点分隔的单词列表。

单词可以是任何东西，但通常它们指定了与消息相关的一些特性。

一些有效的路由关键示例: "stock.usd.nyse"、"nyse.vmw"、"quick.orange.rabbit"。

路由键中可以有任意多的单词，最多255字节。

绑定键的形式也必须相同。主题交换背后的逻辑类似于直接交换——使用特定路由键发送的消息将被传递到使用匹配绑定键绑定的所有队列。但是，绑定键有两个重要的特殊情况:

`*` (星号)只能代替一个单词。

`#` (哈希)可以替代0个或多个单词。

这是最容易解释的一个例子:

![python-five.png](http://www.rabbitmq.com/img/tutorials/python-five.png)

在这个例子中，我们将发送所有描述动物的信息。

消息将通过一个由三个单词(两个点)组成的路由键发送。

路由键中的第一个单词将描述速度，第二个单词描述颜色，第三个单词描述物种`<speed>.<colour>.<species>`。

我们创建了三个绑定: Q1与绑定键 "*.orange.*" 绑定。

和Q2与 "*.*.rabbit" 和 "lazy.#"。

这些绑定可以总结为:

1. Q1对所有橙色的动物都感兴趣。

2. Q2想听关于兔子的一切，关于懒惰的动物的一切。

将路由键设置为 "quick.orange.rabbit" 的消息将被送到两个队列。

消息 "lazy.orange.elephant" 也将去他们两个。

另一方面，"quick.orange.fox" 只会排到第一排，而 "lazy.brown.fox" 只对第二种。

"lazy.pink.rabbit" 只会被传递到第二个队列一次，即使它匹配两个绑定。"quick.brown.fox" 和任何绑定都不匹配，所以会被丢弃。”

如果我们违反了合同，用一个或四个词发信息，比如 "orange" 或 "quick.orange.male.rabbit"，会发生什么?

这些消息不会匹配任何绑定，并且会丢失。

另一方面，"lazy.orange.male.rabbit"，即使它有四个单词，也会匹配最后一个绑定，并被发送到第二个队列。

## 话题交流

主题交换功能强大，可以像其他交换一样进行。

当一个队列被“#”(哈希)绑定键绑定时——它将接收所有的消息，不管路由键是什么——就像 fanout 交换一样。

当绑定中没有使用特殊字符“*”(星号)和“#”(散列)时，主题交换的行为将与直接交换一样。

# 示例代码

## 生产者

```java
import com.rabbitmq.client.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class EmitLogTopic {

    private static final String EXCHANGE_NAME = "topic_logs";

    public static void main(String[] argv)
            throws Exception {

        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.exchangeDeclare(EXCHANGE_NAME, "topic");

        List<String> routingKeys = Arrays.asList("quick.orange.rabbit",
                "lazy.orange.elephant",
                "quick.orange.fox",
                "lazy.brown.fox",
                "lazy.pink.rabbit",
                "quick.brown.fox",
                "orange",
                "quick.orange.male.rabbit",
                "lazy.orange.male.rabbit");

        for(String routingKey : routingKeys) {
            String message = UUID.randomUUID().toString();

            channel.basicPublish(EXCHANGE_NAME, routingKey, null, message.getBytes());
            System.out.println(" [x] Sent '" + routingKey + "':'" + message + "'");
        }

        connection.close();
    }

}
```

## 消费者

- ReceiveLogsTopicLazyRabbit.java

```java
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;

import java.io.IOException;

public class ReceiveLogsTopicLazyRabbit {

    private static final String EXCHANGE_NAME = "topic_logs";

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.exchangeDeclare(EXCHANGE_NAME, "topic");
        String queueName = channel.queueDeclare().getQueue();

        channel.queueBind(queueName, EXCHANGE_NAME, "*.*.rabbit");
        channel.queueBind(queueName, EXCHANGE_NAME, "lazy.#");

        System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope,
                                       AMQP.BasicProperties properties, byte[] body) throws IOException {
                String message = new String(body, "UTF-8");
                System.out.println(" [x] Received '" + envelope.getRoutingKey() + "':'" + message + "'");
            }
        };
        channel.basicConsume(queueName, true, consumer);
    }
}
```

- ReceiveLogsTopicOrange.java

```java
import com.rabbitmq.client.*;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;

import java.io.IOException;

public class ReceiveLogsTopicOrange {

    private static final String EXCHANGE_NAME = "topic_logs";

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.exchangeDeclare(EXCHANGE_NAME, "topic");
        String queueName = channel.queueDeclare().getQueue();

        // 绑定
        channel.queueBind(queueName, EXCHANGE_NAME, "*.orange.*");

        System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope,
                                       AMQP.BasicProperties properties, byte[] body) throws IOException {
                String message = new String(body, "UTF-8");
                System.out.println(" [x] Received '" + envelope.getRoutingKey() + "':'" + message + "'");
            }
        };
        channel.basicConsume(queueName, true, consumer);
    }
}
```

## 测试日志

- 生产者

```
 [x] Sent 'quick.orange.rabbit':'55234609-1b3e-4521-a338-de22a7918b24'
 [x] Sent 'lazy.orange.elephant':'3394c22d-13d4-461e-b20f-a7fe47996977'
 [x] Sent 'quick.orange.fox':'af5d5ba7-a4f1-44ae-8508-6cf7e5fd7610'
 [x] Sent 'lazy.brown.fox':'867a1aac-5143-4bdd-b943-09b3ec4079e7'
 [x] Sent 'lazy.pink.rabbit':'f1a2d39a-d8f8-4417-ba99-4548af35fd10'
 [x] Sent 'quick.brown.fox':'5fee4c6f-0ee2-4674-927d-9575c5449412'
 [x] Sent 'orange':'f6ac2a59-38cf-4004-ae96-8fc8e153c9a8'
 [x] Sent 'quick.orange.male.rabbit':'9354a3c2-febd-4b1f-8443-efeb19f29007'
 [x] Sent 'lazy.orange.male.rabbit':'38c16495-2e52-44e2-89ae-650c47aa5c5a'
```

- orange 接收端

```
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received 'quick.orange.rabbit':'55234609-1b3e-4521-a338-de22a7918b24'
 [x] Received 'lazy.orange.elephant':'3394c22d-13d4-461e-b20f-a7fe47996977'
 [x] Received 'quick.orange.fox':'af5d5ba7-a4f1-44ae-8508-6cf7e5fd7610'
```

- Lazy rabbit 接收端

```
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received 'quick.orange.rabbit':'55234609-1b3e-4521-a338-de22a7918b24'
 [x] Received 'lazy.orange.elephant':'3394c22d-13d4-461e-b20f-a7fe47996977'
 [x] Received 'lazy.brown.fox':'867a1aac-5143-4bdd-b943-09b3ec4079e7'
 [x] Received 'lazy.pink.rabbit':'f1a2d39a-d8f8-4417-ba99-4548af35fd10'
 [x] Received 'lazy.orange.male.rabbit':'38c16495-2e52-44e2-89ae-650c47aa5c5a'
```

## 小节

感觉就是正则匹配的 TOPIC，实际生产中还是很实用的，功能强大。

# 源码地址

以上源代码参见 [rabbitmq-topic](https://github.com/houbb/jms-learn/tree/master/jms-rabbitmq/jms-rabbitmq-hello/src/main/java/com/github/houbb/jms/rabbitmq/topic)

# 参考资料

- 官方

http://www.rabbitmq.com/tutorials/tutorial-four-java.html

https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/java

* any list
{:toc}
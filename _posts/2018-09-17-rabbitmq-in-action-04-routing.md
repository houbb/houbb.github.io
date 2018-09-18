---
layout: post
title: RabbitMQ 实战入门-04-路由
date:  2018-09-17 13:43:16 +0800
categories: [MQ]
tags: [java, docker, mq, in-action, sh]
published: true
excerpt: RabbitMQ 实战入门-04-路由
---

# Routing

在前面的教程中，我们构建了一个简单的日志系统。我们能够向许多接收器广播日志消息。

在本教程中，我们将为它添加一个特性——我们将使订阅消息的一个子集成为可能。

例如，我们将能够仅将关键错误消息直接指向日志文件(以节省磁盘空间)，同时仍然能够在控制台打印所有日志消息。

# Bindings

前面的例子绑定如下：

```java
channel.queueBind(queueName, EXCHANGE_NAME, "");
```

绑定是交换器和队列之间的关系。这可以简单地理解为:队列对来自此交换的消息感兴趣。

绑定可以接受额外的路由关键参数。为了避免与 `basic_publish` 参数混淆，我们将它称为绑定键。

这就是我们如何创建一个键绑定:

```java
channel.queueBind(queueName, EXCHANGE_NAME, "black");
```

绑定键的含义取决于交换类型。我们以前使用过的扇出交换，只是忽略了它的价值。

# Direct exchange

我们的日志系统从以前的教程广播所有消息到所有消费者。我们希望扩展此功能，以允许根据消息的严重程度对其进行过滤。

例如，我们可能希望一个将日志消息写入磁盘的程序只接收关键错误，而不会在警告或信息日志消息上浪费磁盘空间。

我们使用的是扇出交换器，它没有给我们太多的灵活性——它只能进行无目的的广播。

我们将使用直接交换。直接交换背后的路由算法很简单——消息转到队列，其绑定键与消息的路由键完全匹配。

为了说明这一点，考虑以下设置:

![direct-exchange.png](http://www.rabbitmq.com/img/tutorials/direct-exchange.png)

在这个设置中，我们可以看到直接exchange X，它绑定了两个队列。第一个队列用绑定键橙色绑定，第二个队列有两个绑定，一个用绑定键黑色绑定，另一个用绿色绑定。

在这样的设置中，发布到交换器的带有路由关键字橙色的消息将被路由到队列Q1。带有黑色或绿色路由键的消息将转到Q2。所有其他消息将被丢弃。

# Multiple bindings

![direct-exchange-multiple.png](http://www.rabbitmq.com/img/tutorials/direct-exchange-multiple.png)

使用相同的绑定键绑定多个队列是完全合法的。

在我们的示例中，我们可以使用绑定键black在X和Q1之间添加绑定。

在这种情况下，直接交换将表现得像扇出，并将消息广播到所有匹配的队列。带有路由密钥黑色的消息将同时发送到Q1和Q2。

# Emitting logs

我们将在日志系统中使用这个模型。我们将发送消息到一个直接交换器，而不是扇出。我们将提供日志严重性作为路由键。

这样，接收程序就能够选择它想要接收的严重性。让我们首先关注发出日志。

和往常一样，我们需要首先创建一个exchange:

```java
channel.exchangeDeclare(EXCHANGE_NAME, "direct");
```

发送消息：

```java
channel.basicPublish(EXCHANGE_NAME, severity, null, message.getBytes());
```

# Subscribing

接收消息的工作方式将与上一教程一样，只有一个例外——我们将为感兴趣的每个错误级别创建一个新的绑定。

```java
String queueName = channel.queueDeclare().getQueue();

for(String severity : argv){
  channel.queueBind(queueName, EXCHANGE_NAME, severity);
}
```

# 代码实现

![python-four.png](http://www.rabbitmq.com/img/tutorials/python-four.png)

ps: 有种按照不同的 topic 分类的感觉。

## 消息的生产者

```java
import com.rabbitmq.client.*;

import java.io.IOException;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeoutException;

public class EmitLogDirect {

    private static final String EXCHANGE_NAME = "direct_logs";

    public static void main(String[] args) throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.exchangeDeclare(EXCHANGE_NAME, "direct");

        for(int i = 0; i < 8; i++) {
            String severity = getSeverity();
            String message = UUID.randomUUID().toString();

            channel.basicPublish(EXCHANGE_NAME, severity, null, message.getBytes());
            System.out.println(" [x] Sent '" + severity + "': '" + message + "'");
        }

        channel.close();
        connection.close();
    }

    /**
     * 随机一下一种日志级别
     * @return 日志级别
     */
    private static String getSeverity() {
        Random random = new Random();
        String[] strings = "trace,debug,info,warn,error".split(",");
        int randomIndex = random.nextInt(strings.length);
        return strings[randomIndex];
    }
}
```

## 消息的接收者

为了方便，分成两大类。错误的和其他级别的。

- ReceiveLogsDirectError.java

```java
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;

import java.io.IOException;

public class ReceiveLogsDirectError {

    private static final String EXCHANGE_NAME = "direct_logs";

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.exchangeDeclare(EXCHANGE_NAME, "direct");
        String queueName = channel.queueDeclare().getQueue();

        // 支持错误级别
        System.out.println("【队列级别】" + "error");
        channel.queueBind(queueName, EXCHANGE_NAME, "error");
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

- ReceiveLogsDirectCommon.java

```java
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;

import com.rabbitmq.client.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class ReceiveLogsDirectCommon {

    private static final String EXCHANGE_NAME = "direct_logs";

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.exchangeDeclare(EXCHANGE_NAME, "direct");
        String queueName = channel.queueDeclare().getQueue();

        List<String> severities = Arrays.asList("trace", "info", "debug", "warn");
        System.out.println("【队列级别】" + severities);
        for(String severity : severities){
            channel.queueBind(queueName, EXCHANGE_NAME, severity);
        }
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

## 测试 

分别打开接收者两个命令行，然后启动生产者。

- 生产者日志

```
 [x] Sent 'error': '1233e7e8-d408-4d82-a2ed-411c5cf80e48'
 [x] Sent 'info': '7ac26e2d-c1c7-45b1-8200-911d9837af51'
 [x] Sent 'info': '50239cf6-ea98-47ef-862b-000af00a1d9d'
 [x] Sent 'trace': 'a199b276-90e4-4534-b002-bf594577cf9e'
 [x] Sent 'trace': 'ca50ed6e-1b98-470a-8883-a8e9dabbe533'
 [x] Sent 'error': '61a90a12-a0bf-4129-baab-ed2537d311f7'
 [x] Sent 'debug': '672a513e-f230-4a98-ad9f-59a008daf401'
 [x] Sent 'trace': 'b3b86bf4-27cb-411e-84b7-f73700420c28'
```

- 错误级别日志接收者

```
【队列级别】error
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received 'error':'1233e7e8-d408-4d82-a2ed-411c5cf80e48'
 [x] Received 'error':'61a90a12-a0bf-4129-baab-ed2537d311f7'
```

- 普通级别日志接收者

```
【队列级别】[trace, info, debug, warn]
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received 'info':'7ac26e2d-c1c7-45b1-8200-911d9837af51'
 [x] Received 'info':'50239cf6-ea98-47ef-862b-000af00a1d9d'
 [x] Received 'trace':'a199b276-90e4-4534-b002-bf594577cf9e'
 [x] Received 'trace':'ca50ed6e-1b98-470a-8883-a8e9dabbe533'
 [x] Received 'debug':'672a513e-f230-4a98-ad9f-59a008daf401'
 [x] Received 'trace':'b3b86bf4-27cb-411e-84b7-f73700420c28'
```

# 源码地址

以上源代码参见 [rabbitmq-routing](https://github.com/houbb/jms-learn/tree/master/jms-rabbitmq/jms-rabbitmq-hello/src/main/java/com/github/houbb/jms/rabbitmq/routing)

# 参考资料

- 官方

http://www.rabbitmq.com/tutorials/tutorial-four-java.html

https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/java

* any list
{:toc}
---
layout: post
title: RabbitMQ 实战入门-02-工作队列
date:  2018-09-17 13:43:16 +0800
categories: [MQ]
tags: [java, docker, mq, in-action, sh]
published: true
excerpt: RabbitMQ 实战入门-02-工作队列
---

# Worker Queue

## 拓展阅读

[竞争消费模式](https://houbb.github.io/2018/09/17/docker-rabbitmq)

## 工作队列

![Worker Queue](http://www.rabbitmq.com/img/tutorials/python-two.png)

工作队列(又名:任务队列)背后的主要思想是避免立即执行占用大量资源的任务，并且必须等待它完成。相反，我们把任务安排在以后完成。我们将任务封装为消息并将其发送到队列。在后台运行的worker进程将弹出任务并最终执行作业。当您运行许多工作者时，任务将在他们之间共享。

这个概念在web应用程序中尤其有用，在web应用程序中，在短HTTP请求窗口中不可能处理复杂任务。

# 代码

- NewTask.java

```java
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.MessageProperties;

import java.io.IOException;
import java.util.Arrays;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeoutException;

/**
 * <p> 任务 </p>
 */
public class NewTask {

    private static final String TASK_QUEUE_NAME = "task_queue";

    public static void main(String[] args) throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.queueDeclare(TASK_QUEUE_NAME, true, false, false, null);

        // 模拟 5 次任务
        for(int i = 0; i < 5; i++) {
            String message = UUID.randomUUID().toString();

            channel.basicPublish("", TASK_QUEUE_NAME,
                    MessageProperties.PERSISTENT_TEXT_PLAIN,
                    message.getBytes());
            System.out.println(" [x] Sent '" + message + "'");
        }

        channel.close();
        connection.close();
    }

}
```

- Worker.java

```java
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;

import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * <p> 工人 </p>
 */
public class Worker {

    private static final String TASK_QUEUE_NAME = "task_queue";

    public static void main(String[] args) throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        final Connection connection = factory.newConnection();
        final Channel channel = connection.createChannel();

        channel.queueDeclare(TASK_QUEUE_NAME, true, false, false, null);
        System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

        // // accept only one unack-ed message at a time
        channel.basicQos(1);

        final Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                String message = new String(body, "UTF-8");

                System.out.println(" [x] Received '" + message + "'");
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    System.out.println(" [x] Done");
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            }
        };

        boolean autoAck = false;
        channel.basicConsume(TASK_QUEUE_NAME, autoAck, consumer);
    }
}
```

# Round-robin dispatching

使用任务队列的优点之一是能够轻松地并行工作。如果我们正在积累积压的工作，我们可以增加更多的工人，这样就可以很容易地扩大规模。

首先，让我们尝试同时运行两个worker实例。它们都将从队列中获取消息，但具体如何呢?让我们来看看。

你需要打开三个控制台。两个将运行工人程序。这些控制台将是我们的两个消费者——C1和C2。

默认情况下，RabbitMQ将依次向下一个使用者发送每条消息。平均而言，每个消费者都会收到相同数量的消息。这种消息分发的方式称为循环。在三个或更多的员工身上试试。

## 模拟测试

开启两个 worker 命令行窗口，然后执行 NewTask。

- NewTask 日志

```
 [x] Sent 'b80c968a-0515-4c12-b067-d5b9ba87bc87'
 [x] Sent '2925c8a1-6095-4d3e-a7ac-2e412fb4963e'
 [x] Sent '180a72ed-dbe7-4632-9787-a64a7bdc8eaf'
 [x] Sent 'ea6c55cc-8563-4654-85ee-231269fb74c0'
 [x] Sent 'daeb218a-d247-4bfe-9e13-162e3d67183e'
```

- Worker 窗口1

```
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received 'b80c968a-0515-4c12-b067-d5b9ba87bc87'
 [x] Done
 [x] Received 'ea6c55cc-8563-4654-85ee-231269fb74c0'
 [x] Done
```

- Worker 窗口2

```
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received '2925c8a1-6095-4d3e-a7ac-2e412fb4963e'
 [x] Done
 [x] Received '180a72ed-dbe7-4632-9787-a64a7bdc8eaf'
 [x] Done
 [x] Received 'daeb218a-d247-4bfe-9e13-162e3d67183e'
 [x] Done
```

# Message acknowledgment

## 消息确认

完成一项任务可能需要几秒钟。您可能想知道，如果某个消费者开始了一项很长的任务，但只完成了部分任务，那么会发生什么情况呢?在我们当前的代码中，一旦RabbitMQ向客户发送一条消息，它就会立即标记为删除。在这种情况下，如果您杀死一个工人，我们将失去消息，它只是处理。我们还会丢失所有发送给这个工人但尚未处理的消息。

但我们不想失去任何任务。如果一个工人死了，我们希望把任务交给另一个工人。

为了确保消息不会丢失，RabbitMQ支持[消息确认](http://www.rabbitmq.com/confirms.html)。

使用者返回ack(nowledgement)，告诉RabbitMQ已经接收、处理了特定的消息，RabbitMQ可以随意删除它。

## 未发送 ack 死亡的 Worker

如果使用者在没有发送ack的情况下死亡(其通道关闭、连接关闭或TCP连接丢失)，RabbitMQ将理解消息没有完全处理，并将重新排队。如果在同一时间有其他消费者在线，它会迅速将其重新发送给另一个消费者。这样你就可以确保没有信息丢失，即使工人偶尔会死去。

没有任何消息超时;当使用者死亡时，RabbitMQ将重新传递消息。即使处理一条消息需要非常非常长的时间，也没有问题。

[手动消息确认](http://www.rabbitmq.com/confirms.html)在默认情况下是打开的。

在前面的示例中，我们通过autoAck=true标志显式地关闭了它们。当我们完成一项任务时，是时候将此标志设置为false并从工作人员发送适当的确认信息了。

## 处理方式

就像我们上面的代码一样。

```java
boolean autoAck = false;
channel.basicConsume(TASK_QUEUE_NAME, autoAck, consumer);
```

使用这段代码，我们可以确保即使您在处理消息时使用CTRL+C杀死了一个工人，也不会丢失任何东西。在工人死后不久，所有未确认的信息将被重新发送。

确认必须通过相同的通道发送，这是为了在同一通道上接收。尝试承认使用不同的通道将导致通道级别的协议异常。

## Forgotten acknowledgment

错过基础是一个常见的错误。这是一个容易犯的错误，但后果是严重的。当您的客户端退出时，消息将被重新传递(这可能看起来像随机的重新传递)，但是RabbitMQ将占用越来越多的内存，因为它不能释放任何未被添加的消息。

为了调试这种错误，可以使用 rabbitmqctl 打印 `messages_unrecognized` 字段:

```
sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
```

# Message durability

我们已经学会了如何确保即使用户死亡，任务也不会丢失。但是如果RabbitMQ服务器停止，我们的任务仍然会丢失。

当RabbitMQ退出或崩溃时，它将忘记队列和消息，除非您告诉它不要这样做。需要做两件事情来确保消息不会丢失:我们需要将队列和消息都标记为持久的。

首先，我们需要确保RabbitMQ永远不会丢失队列。

为了做到这一点，我们需要声明它是可持久化的:

```java
boolean durable = true;
channel.queueDeclare("task_queue", durable, false, false, null);
```

此时，我们确信即使RabbitMQ重新启动，task_queue 队列也不会丢失。

现在我们需要将我们的消息标记为持久化——通过将 MessageProperties(它实现了BasicProperties)设置为 `PERSISTENT_TEXT_PLAIN` 的值。

## 注意

将消息标记为持久性并不能完全保证消息不会丢失。

虽然它告诉RabbitMQ将消息保存到磁盘，但是仍然有一个短时间窗口，当RabbitMQ接受了一条消息并且还没有保存它。

此外，RabbitMQ不会对每条消息执行 `fsync(2)` 操作——它可能只是被保存为缓存，而不是真正写入磁盘。

持久性保证并不强，但对于我们的简单任务队列来说已经足够了。

如果您需要更强的保证，那么您可以使用[publisher confirmed](https://www.rabbitmq.com/confirms.html)。

# Fair dispatch

您可能已经注意到，调度仍然不能完全按照我们的要求工作。

例如，在有两个工人的情况下，当所有奇怪的信息都很重，偶数信息都很轻时，一个工人会一直很忙，而另一个几乎不做任何工作。

好吧，RabbitMQ对此一无所知，它仍然会均匀地发送消息。

这是因为RabbitMQ只是在消息进入队列时发送消息。它不查看消费者未确认消息的数量。它只是盲目地将第n个消息发送给第n个消费者。

为了克服这个缺点，我们可以使用 `prefetchCount = 1` 的 basicQos 方法。

这告诉RabbitMQ不要一次给一个工人发送多个消息。或者，换句话说，在处理并确认前一条消息之前，不要向工作人员发送新消息。相反，它会把它发送给下一个不太忙的工人。

```java
int prefetchCount = 1;
channel.basicQos(prefetchCount);
```

## 注意大小

如果所有的工人都很忙，你的队伍就会排满。

你会想要关注这个问题，也许会增加更多的员工，或者有其他的策略。

# 源码地址

以上源代码参见 [rabbitmq-workerqueue](https://github.com/houbb/jms-learn/tree/master/jms-rabbitmq/jms-rabbitmq-hello/src/main/java/com/github/houbb/jms/rabbitmq/workerqueue)

# 参考资料

- 官方

http://www.rabbitmq.com/getstarted.html

https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/java

* any list
{:toc}
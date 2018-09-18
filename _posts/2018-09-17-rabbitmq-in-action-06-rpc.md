---
layout: post
title: RabbitMQ 实战入门-06-远程调用
date:  2018-09-17 13:43:16 +0800
categories: [MQ]
tags: [java, docker, mq, in-action, sh]
published: true
excerpt: RabbitMQ 实战入门-06-远程调用
---

# RPC

在[第二个教程](2018/09/17/rabbitmq-in-action-02-woker-queue)中，我们学习了如何使用工作队列在多个工作者之间分配耗时的任务。

但是，如果我们需要在远程计算机上运行一个函数并等待结果呢?

那是另一回事了。这种模式通常称为远程过程调用或RPC。

在本教程中，我们将使用RabbitMQ构建RPC系统: 客户机和可伸缩RPC服务器。

由于我们没有任何值得分发的耗时任务，我们将创建一个返回斐波那契数的虚拟RPC服务。

# Client interface

为了说明如何使用RPC服务，我们将创建一个简单的客户端类。

它将公开一个名为call的方法，该方法发送RPC请求并阻塞，直到接收到答案:

```java
FibonacciRpcClient fibonacciRpc = new FibonacciRpcClient();
String result = fibonacciRpc.call("4");
System.out.println( "fib(4) is " + result);
```

## 关于RPC的说明

虽然RPC在计算中是一种非常常见的模式，但它经常受到批评。

当程序员不知道函数调用是本地调用还是慢RPC时，问题就出现了。

这样的混乱会导致不可预测的系统，并增加不必要的调试复杂性。滥用RPC可能导致无法维护的意大利面条式代码，而不是简化软件。

记住这一点，考虑以下建议:

1. 确保哪个函数调用是本地的，哪个函数调用是远程的。

2. 文件系统。明确组件之间的依赖关系。

3. 处理错误情况。当RPC服务器长时间宕机时，客户机应该如何反应?

在有疑问时避免RPC。如果可以，您应该使用异步管道——而不是像rpc那样阻塞，结果将异步推到下一个计算阶段。

# Callback queue

一般来说，在RabbitMQ上执行RPC很容易。

客户端发送请求消息，服务器使用响应消息进行应答。为了接收响应，我们需要使用请求发送一个“回调”队列地址。我们可以使用默认队列(在Java客户机中是独占的)。

让我们试一试:

```java
callbackQueueName = channel.queueDeclare().getQueue();

BasicProperties props = new BasicProperties
                            .Builder()
                            .replyTo(callbackQueueName)
                            .build();

channel.basicPublish("", "rpc_queue", props, message.getBytes());
```

## 消息属性

AMQP 0-9-1 协议预先定义了一组与消息相关的14个属性。

除下列情况外，大部分物业很少使用:

- deliveryMode: 将消息标记为持久化(值为2)或瞬态(任何其他值)。您可能还记得第二个教程中的这个属性。

- contentType: 用于描述编码的mime类型。例如，对于经常使用的JSON编码，最好将此属性设置为: application/JSON。

- replyTo: 常用来命名回调队列。

- correlationId: 用于将RPC响应与请求关联起来。


# correlation Id

在上述方法中，我们建议为每个RPC请求创建一个回调队列。这非常低效，但幸运的是，还有更好的方法——让我们为每个客户机创建一个回调队列。

这引发了一个新问题，在该队列中接收到响应之后，不清楚响应属于哪个请求。

这时才使用correlationId属性。我们会为每个请求设置一个唯一的值。

稍后，当我们在回调队列中接收到消息时，我们将查看此属性，并基于此，我们将能够将响应与请求匹配。如果我们看到一个未知的correlationId值，我们可能会安全地丢弃这个消息——它不属于我们的请求。

您可能会问，为什么我们应该忽略回调队列中的未知消息，而不是错误导致失败?这是由于服务器端可能存在竞争条件。

尽管不太可能，但RPC服务器可能会在向我们发送答案之后，但在向请求发送确认消息之前死亡。

如果发生这种情况，重新启动的RPC服务器将再次处理请求。这就是为什么在客户机上我们必须优雅地处理重复的响应，而RPC应该是等幂的。

# Summary

![python-six.png](http://www.rabbitmq.com/img/tutorials/python-six.png)

我们的RPC将这样工作:

对于RPC请求，客户机发送具有两个属性的消息:replyTo，它被设置为仅为请求创建的匿名排他队列;correlationId，为每个请求设置唯一值。
请求被发送到rpc_queue队列。

RPC工作人员(又名:服务器)正在等待该队列上的请求。当出现请求时，它会执行任务并使用replyTo字段中的队列将结果发送回客户机。

客户机等待应答队列上的数据。当消息出现时，它检查correlationId属性。如果与请求中的值匹配，则返回对应用程序的响应。


# 示例代码

## 服务端

```java
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class RpcServer {

    private static final String RPC_QUEUE_NAME = "rpc_queue";

    private static int fib(int n) {
        if (n ==0) {
            return 0;
        }
        if (n == 1) {
            return 1;
        }
        return fib(n-1) + fib(n-2);
    }

    public static void main(String[] args) {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        Connection connection = null;
        try {
            connection      = factory.newConnection();
            final Channel channel = connection.createChannel();

            channel.queueDeclare(RPC_QUEUE_NAME, false, false, false, null);
            channel.queuePurge(RPC_QUEUE_NAME);

            channel.basicQos(1);

            System.out.println(" [x] Awaiting RPC requests");

            Consumer consumer = new DefaultConsumer(channel) {
                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                    AMQP.BasicProperties replyProps = new AMQP.BasicProperties
                            .Builder()
                            .correlationId(properties.getCorrelationId())
                            .build();

                    String response = "";

                    try {
                        String message = new String(body,"UTF-8");
                        int n = Integer.parseInt(message);

                        System.out.println(" [.] fib(" + message + ")");
                        response += fib(n);
                    }
                    catch (RuntimeException e){
                        System.out.println(" [.] " + e.toString());
                    }
                    finally {
                        channel.basicPublish( "", properties.getReplyTo(), replyProps, response.getBytes("UTF-8"));
                        channel.basicAck(envelope.getDeliveryTag(), false);
                        // RabbitMq consumer worker thread notifies the RPC server owner thread
                        synchronized(this) {
                            this.notify();
                        }
                    }
                }
            };

            channel.basicConsume(RPC_QUEUE_NAME, false, consumer);
            // Wait and be prepared to consume the message from RPC client.
            while (true) {
                synchronized(consumer) {
                    try {
                        consumer.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        } catch (IOException | TimeoutException e) {
            e.printStackTrace();
        }
        finally {
            if (connection != null) {
                try {
                    connection.close();
                } catch (IOException _ignore) {}
            }
        }
    }
}
```

## 客户端

```java
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Envelope;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeoutException;

public class RpcClient {

    private Connection connection;
    private Channel channel;
    private String requestQueueName = "rpc_queue";

    public RpcClient() throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        connection = factory.newConnection();
        channel = connection.createChannel();
    }

    public String call(String message) throws IOException, InterruptedException {
        final String corrId = UUID.randomUUID().toString();

        String replyQueueName = channel.queueDeclare().getQueue();
        AMQP.BasicProperties props = new AMQP.BasicProperties
                .Builder()
                .correlationId(corrId)
                .replyTo(replyQueueName)
                .build();

        channel.basicPublish("", requestQueueName, props, message.getBytes("UTF-8"));

        final BlockingQueue<String> response = new ArrayBlockingQueue<String>(1);

        String ctag = channel.basicConsume(replyQueueName, true, new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                if (properties.getCorrelationId().equals(corrId)) {
                    response.offer(new String(body, "UTF-8"));
                }
            }
        });

        String result = response.take();
        channel.basicCancel(ctag);
        return result;
    }

    public void close() throws IOException {
        connection.close();
    }


    public static void main(String[] args) {
        RpcClient fibonacciRpc = null;
        String response = null;
        try {
            fibonacciRpc = new RpcClient();

            for (int i = 0; i < 32; i++) {
                String iStr = Integer.toString(i);
                System.out.println(" [x] Requesting fib(" + iStr + ")");
                response = fibonacciRpc.call(iStr);
                System.out.println(" [.] Got '" + response + "'");
            }
        }
        catch  (IOException | TimeoutException | InterruptedException e) {
            e.printStackTrace();
        }
        finally {
            if (fibonacciRpc!= null) {
                try {
                    fibonacciRpc.close();
                }
                catch (IOException _ignore) {}
            }
        }
    }
}
```

## 测试

- 服务端

```
[x] Awaiting RPC requests
 [.] fib(0)
 [.] fib(1)
 [.] fib(2)
 [.] fib(3)
 [.] fib(4)
 [.] fib(5)
 [.] fib(6)
 [.] fib(7)
 [.] fib(8)
 [.] fib(9)
 [.] fib(10)
 [.] fib(11)
 [.] fib(12)
 [.] fib(13)
 [.] fib(14)
 [.] fib(15)
 [.] fib(16)
 [.] fib(17)
 [.] fib(18)
 [.] fib(19)
 [.] fib(20)
 [.] fib(21)
 [.] fib(22)
 [.] fib(23)
 [.] fib(24)
 [.] fib(25)
 [.] fib(26)
 [.] fib(27)
 [.] fib(28)
 [.] fib(29)
 [.] fib(30)
 [.] fib(31)
```

- 客户端

```
[x] Requesting fib(0)
 [.] Got '0'
 [x] Requesting fib(1)
 [.] Got '1'
 [x] Requesting fib(2)
 [.] Got '1'
 [x] Requesting fib(3)
 [.] Got '2'
 [x] Requesting fib(4)
 [.] Got '3'
 [x] Requesting fib(5)
 [.] Got '5'
 [x] Requesting fib(6)
 [.] Got '8'
 [x] Requesting fib(7)
 [.] Got '13'
 [x] Requesting fib(8)
 [.] Got '21'
 [x] Requesting fib(9)
 [.] Got '34'
 [x] Requesting fib(10)
 [.] Got '55'
 [x] Requesting fib(11)
 [.] Got '89'
 [x] Requesting fib(12)
 [.] Got '144'
 [x] Requesting fib(13)
 [.] Got '233'
 [x] Requesting fib(14)
 [.] Got '377'
 [x] Requesting fib(15)
 [.] Got '610'
 [x] Requesting fib(16)
 [.] Got '987'
 [x] Requesting fib(17)
 [.] Got '1597'
 [x] Requesting fib(18)
 [.] Got '2584'
 [x] Requesting fib(19)
 [.] Got '4181'
 [x] Requesting fib(20)
 [.] Got '6765'
 [x] Requesting fib(21)
 [.] Got '10946'
 [x] Requesting fib(22)
 [.] Got '17711'
 [x] Requesting fib(23)
 [.] Got '28657'
 [x] Requesting fib(24)
 [.] Got '46368'
 [x] Requesting fib(25)
 [.] Got '75025'
 [x] Requesting fib(26)
 [.] Got '121393'
 [x] Requesting fib(27)
 [.] Got '196418'
 [x] Requesting fib(28)
 [.] Got '317811'
 [x] Requesting fib(29)
 [.] Got '514229'
 [x] Requesting fib(30)
 [.] Got '832040'
 [x] Requesting fib(31)
 [.] Got '1346269'
```

# 源码地址

以上源代码参见 [rabbitmq-rpc](https://github.com/houbb/jms-learn/tree/master/jms-rabbitmq/jms-rabbitmq-hello/src/main/java/com/github/houbb/jms/rabbitmq/rpc)

# 参考资料

- 官方

http://www.rabbitmq.com/tutorials/tutorial-four-java.html

https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/java

* any list
{:toc}
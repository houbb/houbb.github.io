---
layout: post
title: Rocketmq-03-java hello world 入门案例 
date: 2022-03-18 21:01:55 +0800
categories: [Apache]
tags: [mq, rocketmq, jms]
published: true
---



> [从零手写实现 mq](https://github.com/houbb/mq)

# rocketmq java 入门案例

## 整体结构

```
|____src
| |____main
| | |____java
| | | |____com
| | | | |____ryo
| | | | | |____rocket
| | | | | | |____demo
| | | | | | | |____common
| | | | | | | | |____consumer
| | | | | | | | | |____Consumer.java
| | | | | | | | |____productor
| | | | | | | | | |____Productor.java
| | |____resources
| | | |____log4j.properties
```

## maven 依赖

- pom.xml

```xml
<dependencies>

    <!--rocketmq-->
    <dependency>
        <groupId>com.alibaba.rocketmq</groupId>
        <artifactId>rocketmq-client</artifactId>
        <version>${rocketmq.version}</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba.rocketmq</groupId>
        <artifactId>rocketmq-common</artifactId>
        <version>${rocketmq.version}</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba.rocketmq</groupId>
        <artifactId>rocketmq-remoting</artifactId>
        <version>${rocketmq.version}</version>
    </dependency>


    <!--log-->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>jcl-over-slf4j</artifactId>
        <version>1.7.7</version>
    </dependency>
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-log4j12</artifactId>
        <version>1.7.7</version>
    </dependency>
    <dependency>
        <groupId>log4j</groupId>
        <artifactId>log4j</artifactId>
        <version>1.2.17</version>
    </dependency>
</dependencies>
```

## 配置

- log4j.properties

```
log4j.rootLogger=warn, stdout
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=[%t] %d{MM-dd HH:mm:ss,SSS} - %m%n
```

## 代码

- Consumer.java

```java
/**
 * @author houbinbin
 * @on 17/1/2
 */
public class Productor {

    public static void main(String[] args) {

        DefaultMQProducer producer = new DefaultMQProducer("Producer");
        producer.setNamesrvAddr("127.0.0.1:9876");

        try {

            producer.start();

            Message message = new Message("PushTopic", "push", "1", "Just fot test.".getBytes());
            SendResult result = producer.send(message);
            System.out.println("id:" + result.getMsgId() + " result:" + result.getSendStatus());

            message = new Message("PushTopic", "push", "3", "Just fot test.".getBytes());

            result = producer.send(message);
            System.out.println("id:" + result.getMsgId() + " result:" + result.getSendStatus());
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            producer.shutdown();
        }
    }
}
```

运行LOG如下:

```
id:C0A8026600002A9F000000000000011A result:SEND_OK
id:C0A8026600002A9F00000000000001A7 result:SEND_OK
```


- Consumer.java

```java
/**
 * @author houbinbin
 * @on 17/1/4
 */
public class Consumer {

    public static void main(String[] args) {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("PushConsumer");
        consumer.setNamesrvAddr("127.0.0.1:9876");

        try {
            // 订阅PushTopic下的Tag未push的消息
            consumer.subscribe("PushTopic", "push");
            // 程序第一次启动从消息队列头取数据
            consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
            consumer.registerMessageListener(new MessageListenerConcurrently() {
                @Override
                public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
                    Message message = msgs.get(0);
                    System.err.println(message.toString());
                    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
                }
            });
            consumer.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

运行LOG如下:

```
MessageExt [queueId=1, storeSize=141, queueOffset=1, sysFlag=0, bornTimestamp=1483460812589, bornHost=/192.168.2.102:54835, storeTimestamp=1483460812590, storeHost=/192.168.2.102:10911, msgId=C0A8026600002A9F00000000000001A7, commitLogOffset=423, bodyCRC=1329428386, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message [topic=PushTopic, flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=2, KEYS=3, WAIT=true, TAGS=push}, body=14]]
MessageExt [queueId=0, storeSize=141, queueOffset=1, sysFlag=0, bornTimestamp=1483460812558, bornHost=/192.168.2.102:54835, storeTimestamp=1483460812575, storeHost=/192.168.2.102:10911, msgId=C0A8026600002A9F000000000000011A, commitLogOffset=282, bodyCRC=1329428386, reconsumeTimes=0, preparedTransactionOffset=0, toString()=Message [topic=PushTopic, flag=0, properties={MIN_OFFSET=0, MAX_OFFSET=2, KEYS=1, WAIT=true, TAGS=push}, body=14]]
```


# 小结

整体非常简单，集合官方例子即可。

* any list
{:toc}
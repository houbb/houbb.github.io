---
layout: post
title: Rocketmq-ONS 入门案例
date: 2022-03-18 21:01:55 +0800
categories: [Apache]
tags: [mq, rocketmq, jms]
published: true
---

# Message ONS

## maven 依赖

```xml
<dependency>
    <groupId>com.aliyun.openservices</groupId>
    <artifactId>ons-client</artifactId>
    <version>1.8.0.Final</version>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.59</version>
</dependency>
```

# 入门代码

## 配置

此处同前，跳过。

## 实战代码

- 生产者

```java
import com.aliyun.openservices.ons.api.*;

import java.util.Date;
import java.util.Properties;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class CommonProducerTest {

    public static void main(String[] args) {
        Properties properties = new Properties();
        properties.put(PropertyKeyConst.GROUP_ID, "xxx");
        // AccessKeyId 阿里云身份验证，在阿里云服务器管理控制台创建
        properties.put(PropertyKeyConst.AccessKey, "xxx");
        // AccessKeySecret 阿里云身份验证，在阿里云服务器管理控制台创建
        properties.put(PropertyKeyConst.SecretKey, "xxx");
        // 设置 TCP 接入域名，进入控制台的实例管理页面的“获取接入点信息”区域查看
        properties.put(PropertyKeyConst.NAMESRV_ADDR, "xxx");

        //设置发送超时时间，单位毫秒
        properties.setProperty(PropertyKeyConst.SendMsgTimeoutMillis, "3000");

        Producer producer = ONSFactory.createProducer(properties);
        // 在发送消息前，必须调用 start 方法来启动 Producer，只需调用一次即可
        producer.start();
        //循环发送消息
        for (int i = 0; i < 1; i++){
            Message msg = new Message( //
                    // Message 所属的 Topic
                    "xxx",
                    // Message Tag 可理解为 Gmail 中的标签，对消息进行再归类，方便 Consumer 指定过滤条件在消息队列 RocketMQ 的服务器过滤
                    "TagA",
                    // Message Body 可以是任何二进制形式的数据， 消息队列 RocketMQ 不做任何干预，
                    // 需要 Producer 与 Consumer 协商好一致的序列化和反序列化方式
                    "Hello MQ".getBytes());
            // 设置代表消息的业务关键属性，请尽可能全局唯一。
            // 以方便您在无法正常收到消息情况下，可通过阿里云服务器管理控制台查询消息并补发
            // 注意：不设置也不会影响消息正常收发
            msg.setKey("123456789");
            try {
                SendResult sendResult = producer.send(msg);
                // 同步发送消息，只要不抛异常就是成功
                if (sendResult != null) {
                    System.out.println(new Date() + " Send mq message success. Topic is:" + msg.getTopic() + " msgId is: " + sendResult.getMessageId());
                }
            }
            catch (Exception e) {
                // 消息发送失败，需要进行重试处理，可重新发送这条消息或持久化这条数据进行补偿处理
                System.out.println(new Date() + " Send mq message failed. Topic is:" + msg.getTopic());
                e.printStackTrace();
            }
        }
        // 在应用退出前，销毁 Producer 对象
        // 注意：如果不销毁也没有问题
        producer.shutdown();
    }

}
```

- 消费者

```java
import com.aliyun.openservices.ons.api.*;

import java.util.Properties;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class CommonConsumerTest {

    public static void main(String[] args) {
        Properties properties = new Properties();
        properties.put(PropertyKeyConst.GROUP_ID, "xxx");
        // AccessKeyId 阿里云身份验证，在阿里云服务器管理控制台创建
        properties.put(PropertyKeyConst.AccessKey, "xxx");
        // AccessKeySecret 阿里云身份验证，在阿里云服务器管理控制台创建
        properties.put(PropertyKeyConst.SecretKey, "xxx");
        // 设置 TCP 接入域名，进入控制台的实例管理页面的“获取接入点信息”区域查看
        properties.put(PropertyKeyConst.NAMESRV_ADDR, "xxx");

        // 您在控制台创建的 Group ID
        Consumer consumer = ONSFactory.createConsumer(properties);

        //订阅另外一个 Topic
        consumer.subscribe("xxx", "TagA", new MessageListener() {
            @Override
            public Action consume(Message message, ConsumeContext context) {
                System.out.println("Receive: " + message);
                return Action.CommitMessage;
            }
        });
        consumer.start();
        System.out.println("Consumer Started");
    }

}
```

# 遇到的坑

## 现象

发消息，可以正常发送，可以在控台查到。

但是本地的消息监听，无法正常工作。

如果通过控台查询，然后【消费验证】本地是可以监听到消息的。

后来排查下来，发现是 ons-client 的包版本导致的。一开始使用的 1.8.2.Final，修改为 1.8.0.Final。

不得不感慨一句，真坑。

## 注意点

GROUP_ID 属性为  1.8.0.Final 及其以后版本才有的属性，因为要和控台一致，所以 jdk 必须要在 jdk8 及其以上。

# 参考资料

[官方文档](https://help.aliyun.com/document_detail/29546.html?spm=a2c4g.11174283.4.4.8c7f449cxqxSm4)

* any list
{:toc}
---
layout: post
title: Spring Kafka
date:  2018-09-19 15:44:59 +0800
categories: [MQ]
tags: [java, spring, mq, jms, sh]
published: true
excerpt: Spring Kafka 入门介绍
---

# Spring Kafka

Apache Kafka的Spring (Spring - Kafka)项目将核心Spring概念应用到基于Kafka的消息解决方案的开发中。

它提供了一个“模板”作为发送消息的高级抽象。

它还提供了对带有 `@KafkaListener` 注解和“侦听器容器”的消息驱动pojo的支持。

这些库促进了依赖注入和声明性的使用。

在所有这些情况下，您将看到与Spring框架中的JMS支持和Spring AMQP中的RabbitMQ支持的相似之处。

## 特性

- KafkaTemplate

- KafkaMessageListenerContainer

- @KafkaListener

- KafkaTransactionManager

- spring-kafka-test jar with embedded kafka server


# 快速开始

## maven 引入

- spring-kafka

```xml
<dependency>
  <groupId>org.springframework.kafka</groupId>
  <artifactId>spring-kafka</artifactId>
  <version>2.1.10.RELEASE</version>
</dependency>
```

辅助 junit 测试包

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
</dependency>
```

## 实例代码

- SpringKafkaTest.java

```java
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.IntegerDeserializer;
import org.apache.kafka.common.serialization.IntegerSerializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.Test;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.kafka.listener.config.ContainerProperties;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static junit.framework.TestCase.assertTrue;

public class SpringKafkaTest {

    @Test
    public void testAutoCommit() throws Exception {
        System.out.println("Start auto");
        ContainerProperties containerProps = new ContainerProperties("topic1", "topic2");
        final CountDownLatch latch = new CountDownLatch(4);
        containerProps.setMessageListener(new MessageListener<Integer, String>() {

            @Override
            public void onMessage(ConsumerRecord<Integer, String> message) {
                System.out.println("received: " + message);
                latch.countDown();
            }

        });
        KafkaMessageListenerContainer<Integer, String> container = createContainer(containerProps);
        container.setBeanName("testAuto");
        container.start();
        // wait a bit for the container to start
        Thread.sleep(1000);
        KafkaTemplate<Integer, String> template = createTemplate();
        template.setDefaultTopic("topic1");
        template.sendDefault(0, "foo");
        template.sendDefault(2, "bar");
        template.sendDefault(0, "baz");
        template.sendDefault(2, "qux");
        template.flush();
        assertTrue(latch.await(60, TimeUnit.SECONDS));
        container.stop();

        System.out.println("Stop auto");

    }

    private KafkaMessageListenerContainer<Integer, String> createContainer(
            ContainerProperties containerProps) {
        Map<String, Object> props = consumerProps();
        DefaultKafkaConsumerFactory<Integer, String> cf =
                new DefaultKafkaConsumerFactory<Integer, String>(props);
        KafkaMessageListenerContainer<Integer, String> container =
                new KafkaMessageListenerContainer<>(cf, containerProps);
        return container;
    }

    private KafkaTemplate<Integer, String> createTemplate() {
        Map<String, Object> senderProps = senderProps();
        ProducerFactory<Integer, String> pf =
                new DefaultKafkaProducerFactory<Integer, String>(senderProps);
        KafkaTemplate<Integer, String> template = new KafkaTemplate<>(pf);
        return template;
    }

    private Map<String, Object> consumerProps() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "foo");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
        props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, "100");
        props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "15000");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, IntegerDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        return props;
    }

    private Map<String, Object> senderProps() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.RETRIES_CONFIG, 0);
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        props.put(ProducerConfig.LINGER_MS_CONFIG, 1);
        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, IntegerSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        return props;
    }
}
```

测试日志

```
Start auto
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
Sep 19, 2018 4:45:32 PM org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler initialize
信息: Initializing ExecutorService 
Sep 19, 2018 4:45:32 PM org.springframework.kafka.listener.KafkaMessageListenerContainer onPartitionsRevoked
信息: partitions revoked: []
Sep 19, 2018 4:45:33 PM org.springframework.kafka.listener.KafkaMessageListenerContainer onPartitionsAssigned
信息: partitions assigned: [topic1-0, topic2-0]
received: ConsumerRecord(topic = topic1, partition = 0, offset = 0, CreateTime = 1537346733712, serialized key size = 4, serialized value size = 3, headers = RecordHeaders(headers = [], isReadOnly = false), key = 0, value = foo)
received: ConsumerRecord(topic = topic1, partition = 0, offset = 1, CreateTime = 1537346733716, serialized key size = 4, serialized value size = 3, headers = RecordHeaders(headers = [], isReadOnly = false), key = 2, value = bar)
received: ConsumerRecord(topic = topic1, partition = 0, offset = 2, CreateTime = 1537346733716, serialized key size = 4, serialized value size = 3, headers = RecordHeaders(headers = [], isReadOnly = false), key = 0, value = baz)
received: ConsumerRecord(topic = topic1, partition = 0, offset = 3, CreateTime = 1537346733716, serialized key size = 4, serialized value size = 3, headers = RecordHeaders(headers = [], isReadOnly = false), key = 2, value = qux)
Sep 19, 2018 4:45:33 PM org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler shutdown
信息: Shutting down ExecutorService
Sep 19, 2018 4:45:33 PM org.springframework.kafka.listener.KafkaMessageListenerContainer$ListenerConsumer run
信息: Consumer stopped
Stop auto
```

# 参考资料

https://spring.io/projects/spring-kafka

- 快速开始

https://docs.spring.io/spring-kafka/docs/2.1.10.RELEASE/reference/html/_introduction.html#quick-tour

* any list
{:toc}
---
layout: post
title:  Apache Kafka-05-springboot kafka 整合笔记
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq, springboot, mq]
published: true
---

# 背景

[Kafka 实战（一）kafka 入门介绍](https://mp.weixin.qq.com/s/g4PVjwFI0FHoY_te9AD-9A)

[Kafka 实战（二）kafka 入门介绍](https://mp.weixin.qq.com/s/YIiPxE5aDTfyAHWxKLIhVA)

安装好了 kafka，于是想使用 springboot 整合一把。

便于以后使用翻阅。

# 快速开始

## maven 引入

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <artifactId>springboot-learn-kafka</artifactId>

    <properties>
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.6.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- kafka -->
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>
    </dependencies>

</project>
```

## application.yml

```yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: default

server:
  port: 8081
```

## 生产者

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Component
public class KafkaProducer {

    @Autowired
    private KafkaTemplate kafkaTemplate;

    public void sendMsg() {
        System.out.println("============= kafka 发送消息");
        kafkaTemplate.send("test", "info");
    }

}
```

## 消费者

```java
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Component
public class KafkaConsumer {

    @KafkaListener(topics = "test", groupId = "default")
    public void consumer(String msg) {
        System.out.println("============= kafka 消费消息 " + msg);
    }

}
```

## 启动类

```java
import com.github.houbb.springboot.learn.kafka.service.KafkaProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.annotation.PostConstruct;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@SpringBootApplication
public class KafkaApplication {

    @Autowired
    private KafkaProducer kafkaProducer;

    @PostConstruct
    public void init() {
        kafkaProducer.sendMsg();
    }

    public static void main(String[] args) {
        SpringApplication.run(KafkaApplication.class, args);
    }

}
```

我们让启动的时候，触发一次消息的发送

- 日志

```
============= kafka 发送消息
============= kafka 消费消息
```

哦了，就是这么简单粗暴。

# 进阶版配置

## 整体配置

```java
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;

import java.util.HashMap;
import java.util.Map;

/**
 * kafka 配置信息
 *
 * @author binbin.hou
 */
@EnableKafka
@Configuration
public class KafkaConfig {

    /**
     * 启动服务集群
     */
    @Value("${kafka.bootstrap.servers}")
    private String bootstrapServers;

    /**
     * 消费者组ID
     */
    @Value("${kafka.consumer.groupId}")
    private String consumerGroupId;

    @Autowired
    private KafkaProducerListener kafkaProducerListener;

    @Bean
    KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<String, String>> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(kafkaConsumerFactory());
        factory.setConcurrency(3);
        factory.getContainerProperties().setPollTimeout(3000);

        return factory;
    }

    @Bean
    public ConsumerFactory<String, String> kafkaConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(kafkaConsumerProperties());
    }

    @Bean
    public Map<String, Object> kafkaConsumerProperties() {
        Map<String, Object> props = new HashMap<>(4);
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, consumerGroupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        return props;
    }

    @Bean
    public ProducerFactory<String, String> kafkaProducerFactory() {
        return new DefaultKafkaProducerFactory<>(kafkaProducerProperties());
    }

    @Bean
    public Map<String, Object> kafkaProducerProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);

        // 后续可以调整为可配置
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        //producer将试图批处理消息记录，以减少请求次数。这将改善client与server之间的性能。这项配置控制默认的批量处理消息字节数。
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        //producer组将会汇总任何在请求与发送之间到达的消息记录一个单独批量的请求,1秒延迟
        props.put(ProducerConfig.LINGER_MS_CONFIG, 1);
        //producer可以用来缓存数据的内存大小
//        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);
        //每次尝试增加的额外的间隔时间
        props.put(ProducerConfig.RETRY_BACKOFF_MS_CONFIG, 300);
        return props;
    }

    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        KafkaTemplate<String, String> kafkaTemplate = new KafkaTemplate<>(kafkaProducerFactory(), true);
        kafkaTemplate.setDefaultTopic("default");
        kafkaTemplate.setProducerListener(kafkaProducerListener);
        return kafkaTemplate;
    }
}
```

### 生产者的监听类

实际上 kafka 发送应该是异步的，所以发送成功与否，我们都是不知道的，这里需要实现一个监听类：

```java
import org.apache.kafka.clients.producer.RecordMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.support.ProducerListener;
import org.springframework.stereotype.Component;

/**
 * @author binbin.hou
 */
@Component
public class KafkaProducerListener implements ProducerListener<String, String> {

    private static final Logger LOG = LoggerFactory.getLogger(KafkaProducerListener.class);

    @Override
    public void onSuccess(String topic, Integer partition,
                          String key, String value,
                          RecordMetadata recordMetadata) {
        LOG.info("[Kafka] send success, topic: {}, value: {}", topic, value);
    }

    @Override
    public void onError(String topic, Integer partition,
                        String key, String value, Exception e) {
        LOG.error("[Kafka] send fail, topic: {}, value: {}", topic, value, e);
    }

    /**
     * 方法返回值代表是否启动kafkaProducer监听器
     */
    @Override
    public boolean isInterestedInSuccess() {
        LOG.info("kafkaProducer监听器启动:KafkaProducerListener ");
        return true;
    }

}
```

## 监听类

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * kafka 消费者
 * @author binbin.hou
 */
@Component
public class KafkaConsumer {

    private static final Logger LOG = LoggerFactory.getLogger(KafkaConsumer.class);

    /**
     * 消费者
     * @param message 消息体
     */
    @KafkaListener(topics = "${kafka.consumer.topicId}",
            group = "${kafka.consumer.groupId}")
    public void consumer(String message) {
        //处理逻辑...
    }

}
```

# 小结

本文主要讲解了如何让 kafka 与 spring 进行整合。

后续将对生产者和消费者进行深入讲解。

# 拓展阅读

[windows 安装 kafka]()

[docker 安装 kafka](https://houbb.github.io/2018/09/17/docker-install-kafka)

[spring kafka](https://houbb.github.io/2018/09/19/spring-kafka)

[springboot 整合 kafka]()

# 参考资料

[SpringBoot整合kafka](https://www.cnblogs.com/gaomanito/p/12370467.html)

[Springboot2整合kafka的两种使用方式](https://blog.csdn.net/victoylin/article/details/93409055?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.channel_param&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.channel_param)

* any list
{:toc}


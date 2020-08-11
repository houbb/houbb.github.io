---
layout: post
title:  Apache Kafka-05-springboot kafka 整合笔记
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq, springboot, mq]
published: true
---

# 背景

安装好了 kafka，于是想使用 springboot 整合一把。

留作以后使用翻阅。

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


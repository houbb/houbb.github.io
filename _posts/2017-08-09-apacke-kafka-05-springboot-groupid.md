---
layout: post
title:  Apache Kafka-05-springboot kafka 整合笔记 @KafkaListener 中的 groupId 和 consumer group-id
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

源代码：

> [https://github.com/houbb/springboot-kafka-learn](https://github.com/houbb/springboot-kafka-learn)


# springboot kafka group.id多消费组配置

很早之前就使用了springboot + kafka组合配置，但是之前使用的spring-kafka（1.1.7）版本较低，所以只能通过 spring.kafka.consumer.group-id=default_consumer_group 或者 propsMap.put(ConsumerConfig.GROUP_ID_CONFIG, "default_consumer_group");的形式配置一个默认消组，当然理论上这也是没有问题的，但是如果你定义的topic数量过多且并发消费比较大，只有一个消费组的配置方式就会暴露出很多问题，其中主要的一个问题便是每个topic分区的offset偏移量问题（在大并发下会出现offset异常问题），因为他们都保存在同一个消费组中。

直到后来发布了spring-kafka 1.3.x的版本后，增加了groupId的属性，非常方便的帮助我们解决了实现每个topic自定义一个消费组的问题，我们再也不用共用一个消费组了。

接下来通过代码演示看是否如我们的期望一样：

## pom.xml

```xml
    <parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>1.5.10.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
 
	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>
 
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<!-- https://mvnrepository.com/artifact/org.springframework.kafka/spring-kafka -->
		<dependency>
			<groupId>org.springframework.kafka</groupId>
			<artifactId>spring-kafka</artifactId>
			<version>1.3.5.RELEASE</version>
		</dependency>
 
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
 
		<!--引入elasticsearch-->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-elasticsearch</artifactId>
		</dependency>
	</dependencies>
 
	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>
```


## application 配置

-  application.properties

```properties
server.port=10087
spring.application.name=example
#topic
spring.kafka.bootstrap-servers=10.0.2.22:9092
kafka.test.topic=TEST_TOPIC
 
#es
#spring.data.elasticsearch.cluster-name=elasticsearch
#spring.data.elasticsearch.cluster-nodes=10.0.2.23:9300
#spring.data.elasticsearch.cluster-nodes=10.0.2.22:9300
```


## 生产者

```java
@Component
public class TestKafkaSender {
    @Autowired
    private KafkaTemplate kafkaTemplate;
 
    @Value("${kafka.test.topic}")
    String testTopic;
 
    public void sendTest(String msg){
        kafkaTemplate.send(testTopic, msg);
    }
}
```

## 消费者

消费者1：

```java
@Component
public class TestKafkaConsumer {
 
    Logger logger = LoggerFactory.getLogger(getClass());
 
    /**
     * topics: 配置消费topic，以数组的形式可以配置多个
     * groupId: 配置消费组为”xiaofeng1“
     *
     * @param message
     */
    @KafkaListener(topics = {"${kafka.test.topic}"}, groupId = "groupId1")
    public void consumer(String message) {
        logger.info("groupId = groupId1, message = " + message);
    }
 
}
```

消费者2：

```java
@Component
public class TestKafkaConsumer2 {
 
    Logger logger = LoggerFactory.getLogger(getClass());
 
    /**
     * topics: 配置消费topic，以数组的形式可以配置多个
     * groupId: 配置消费组为”xiaofeng1“
     *
     * @param message
     */
    @KafkaListener(topics = {"${kafka.test.topic}"}, groupId = "groupId2")
    public void consumer(String message) {
        logger.info("groupId = groupId2, message = " + message);
    }
 
}
```

## 测试类

```java
    @Autowired
    TestKafkaSender sender;
 
    @Test
    public void send() {
        for (int i = 0; i < Integer.MAX_VALUE; i++) {
            logger.info("send message = " + i);
            sender.sendTest(i + "");
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
```


## 效果

可以发现一个生产者，会被不同的消费组分别消费。

# 拓展阅读

[docker 安装 kafka](https://houbb.github.io/2018/09/17/docker-install-kafka)

[spring kafka](https://houbb.github.io/2018/09/19/spring-kafka)

# 参考资料

https://blog.csdn.net/zwx19921215/article/details/83341522

[springboot消费kafka设置topics 以及 groupId](https://blog.51cto.com/u_15897407/5899704)

[【spring-kafka】@KafkaListener详解与使用](https://cloud.tencent.com/developer/article/1846789)

[springboot 集成kafka 实现多个customer不同group](https://blog.csdn.net/caijiapeng0102/article/details/80765923)

[spring boot项目12：Kafka-基础使用](https://www.cnblogs.com/luo630/p/15192341.html)

https://stackoverflow.com/questions/49324252/difference-between-group-id-client-id-and-id-in-kafkalistener-spring-boot

[@KafkaListener注解](https://www.cnblogs.com/dayu123/p/16486317.html)


* any list
{:toc}


---
layout: post
title:  Apache Kafka-24-kafka 实战凌晨3点起来改BUG 关于 maxPullRecords 的教训
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq]
published: false
---

# 业务背景

我们经常会使用 kafka 进行日志统计，大批量的数据传输等等。

一般情况下使用方式如下：

# 发送端配置

## pom.xml

```xml
<!--kafka-->
<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka-clients</artifactId>
    <version>1.0.0</version>
</dependency>
```


可以发现客户端包，所有的配置属性都是基于 Properties 文件的，就是一个简单的 key/value。

这样可以保证以后的属性拓展，客户端也不需要升级，最多需要添加一个 key/value 就行。

这就是向后兼容的设计理念。

## 代码配置

kafka 为了吞吐量，很多操作都是异步+批量来执行的。

所以发送结果是由对应的回调函数的。

```java
import org.apache.kafka.clients.producer.RecordMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.support.ProducerListener;
import org.springframework.stereotype.Component;

/**
 * kafka 生产者监听类
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


## 完整的配置

```java
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.ByteArrayDeserializer;
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
 * @author binbin.hou
 */
@EnableKafka
@Configuration
public class KafkaConfig {

    /**
     * 满天星启动服务集群
     * 
     */
    @Value("${kafka.bootstrap.servers}")
    private String BootstrapServers;

    /**
     * 满天星消费者组ID
     * 
     */
    @Value("${kafka.consumer.groupId}")
    private String ConsumerGroupId;

    /**
     * 满天星消费者数量
     * 
     */
    @Value("${kafka.consumer.concurrency:3}")
    private int ConsumerConcurrency;

    /**
     * 满天星消费者自定偏移量重置
     * 
     */
    @Value("${kafka.consumer.autoOffsetReset:latest}")
    private String ConsumerAutoOffsetReset;

    /**
     * 消费者超时时间
     */
    @Value("${kafka.consumer.session.timeout.ms:30000}")
    private String ConsumerSessionTimeOutMs;

    /**
     * 消费者最大拉取数量
     * 注意：这个参数非常重要，需要保证再默认的间隔时间内，拉取的消息要被消费完，不然一直会重置消费位点，导致死循环。
     * 这个默认配置值是 500，有点偏高。
     */
    @Value("${kafka.consumer.max.poll.records:10}")
    private String ConsumerMaxPullRecords;

    /**
     * 消费者每次拉取的时间间隔
     */
    @Value("${kafka.consumer.max.poll.interval.ms:300000}")
    private String ConsumerMaxPullIntervalMs;
    
    @Autowired
    private KafkaProducerListener kafkaProducerListener;

    /**
     * kafkaListenerContainerFactory 这个 bean 被强制需要，但是不是应用中指定的。
     * @return bean
     */
    @Bean("kafkaListenerContainerFactory")
    public KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<byte[], byte[]>> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<byte[], byte[]> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(KafkaConsumerFactory());
        factory.setConcurrency(ConsumerConcurrency);

        return factory;
    }

    @Bean("KafkaConsumerFactory")
    public ConsumerFactory<byte[], byte[]> KafkaConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(KafkaConsumerProperties());
    }

    @Bean("KafkaConsumerProperties")
    public Map<String, Object> KafkaConsumerProperties() {
        Map<String, Object> props = new HashMap<>(4);
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, BootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, ConsumerGroupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ByteArrayDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ByteArrayDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, ConsumerAutoOffsetReset);
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG,
                ConsumerMaxPullRecords);
        props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG,
                ConsumerSessionTimeOutMs);
        props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG,
                ConsumerMaxPullIntervalMs);
        return props;
    }

    @Bean("KafkaProducerFactory")
    public ProducerFactory<String, String> KafkaProducerFactory() {
        return new DefaultKafkaProducerFactory<>(KafkaProducerProperties());
    }

    /**
     * 生产者的配置
     * 说明：暂时生产者只是为了自测，主要使用消费者。
     * 所以这部分配置，有些是固定写死了。
     * @return 配置
     */
    @Bean("KafkaProducerProperties")
    public Map<String, Object> KafkaProducerProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, BootstrapServers);
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

    @Bean("KafkaTemplate")
    public KafkaTemplate<String, String> KafkaTemplate() {
        KafkaTemplate<String, String> kafkaTemplate = new KafkaTemplate<>(KafkaProducerFactory(), true);
        kafkaTemplate.setDefaultTopic("default");
        kafkaTemplate.setProducerListener(kafkaProducerListener);
        return kafkaTemplate;
    }

}
```

## springboot 整合

`@EnableKafka` 用于 Kafka 和 springboot 的整合。

```xml
<dependency>
	<groupId>org.springframework.kafka</groupId>
	<artifactId>spring-kafka</artifactId>
	<version>1.1.8.RELEASE</version>
</dependency>
```

## 消费者的写法

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * kafka 消费者
 *
 * @author binbin.hou
 */
@Component
public class TransferKafkaConsumer {

    private static final Logger logger = LoggerFactory.getLogger(TransferKafkaConsumer.class);

    /**
     * 消费者
     * @param message 消息体
     */
    @KafkaListener(topics = "${kafka.consumer.topicId}",
            group = "${kafka.consumer.groupId}")
    public void consumer(byte[] message) {
        try {
            // 设置 traceId
            LogUtil.putMdcIfAbsent();
            logger.info("开始消费消息: {}", message.length);
            
            // 业务代码实现

            logger.info("结束消费消息");
        } finally {
            LogUtil.removeMdc();
        }
    }

}
```

这里对应的 topics 和 group 是一个配置属性，我们可以在配置中心或者基于 profile 自定对应的配置信息。


# 回顾

有很多细节平时可能不是很注意，而且一般测试也无法发现问题。

所以做技术也好，做业务也好，一定要搞清楚原理，不要一知半解，不然就是半夜起来改 BUG。

* amy list
{:toc}
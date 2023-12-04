---
layout: post
title: logstash 日志加工处理-24-input kafka + output kafka  java 如何实现 kafka 的发送和消费？
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---


# java 实现 kafa 消息发送入门例子

## maven 引入

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.kafka</groupId>
        <artifactId>kafka-clients</artifactId>
        <version>2.8.1</version> <!-- 使用最新版本 -->
    </dependency>
</dependencies>
```

## 消息发送

```java
package org.example;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Properties;


public class KafkaProducerExample {

    public static void main(String[] args) {
        // 设置 Kafka 生产者配置
        Properties properties = new Properties();
        properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        // 创建 Kafka 生产者
        Producer<String, String> producer = new org.apache.kafka.clients.producer.KafkaProducer<>(properties);

        // 发送消息到 Kafka 主题
        String topic = "test";
        String value = "Hello, Kafka!";

        ProducerRecord<String, String> record = new ProducerRecord<>(topic, value);

        // 发送消息
        producer.send(record, (metadata, exception) -> {
            if (exception == null) {
                System.out.println("Message sent successfully! Topic: " + metadata.topic() +
                        ", Partition: " + metadata.partition() +
                        ", Offset: " + metadata.offset());
            } else {
                System.err.println("Error sending message: " + exception.getMessage());
            }
        });

        // 关闭 Kafka 生产者
        producer.close();
    }

}
```

日志：

```
Message sent successfully! Topic: test, Partition: 0, Offset: 0
```

# java 实现 kafa 消息消费入门例子

## maven 引入

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.kafka</groupId>
        <artifactId>kafka-clients</artifactId>
        <version>2.8.1</version>
    </dependency>
</dependencies>
```

## 消费者代码

```java
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.Collections;
import java.util.Properties;

public class KafkaConsumerExample {

    public static void main(String[] args) {
        // 设置 Kafka 消费者配置
        Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, "myGroup");

        // 创建 Kafka 消费者
        Consumer<String, String> consumer = new KafkaConsumer<>(properties);

        // 订阅 Kafka 主题
        String topic = "test";
        consumer.subscribe(Collections.singletonList(topic));

        // 持续消费消息
        while (true) {
            ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));

            records.forEach(record -> {
                System.out.println("Received message: " +
                        "Topic = " + record.topic() +
                        ", Partition = " + record.partition() +
                        ", Offset = " + record.offset() +
                        ", Key = " + record.key() +
                        ", Value = " + record.value());
            });
        }
    }

}
```

## 日志

```
Received message: Topic = test, Partition = 0, Offset = 1, Key = null, Value = Hello, Kafka!
```

# Q: 介绍一下 kafka java consumer.poll 函数

`poll` 方法是 Kafka 消费者 API 中一个核心的方法，用于从 Kafka 服务器获取消息。

该方法的主要作用是拉取消息，使得消费者能够从订阅的主题中获取新的消息记录。以下是对 `poll` 方法的一些关键点的介绍：

### 签名

```java
ConsumerRecords<K, V> poll(Duration timeout)
```

- `timeout`：指定在没有可用消息时，`poll` 方法将等待的最大时间。它是一个 `java.time.Duration` 对象。

### 工作原理

1. **拉取消息：** `poll` 方法会向 Kafka 服务器发送拉取请求，尝试获取新的消息记录。

2. **等待：** 如果没有可用的消息，消费者将阻塞（或等待）直到满足以下条件之一：
   - 有新的消息可用。
   - 超过了指定的 `timeout` 时间。

3. **返回结果：** 一旦有可用的消息或者超过了超时时间，`poll` 方法将返回一个 `ConsumerRecords` 对象，其中包含了一批消息记录。

### ConsumerRecords

`ConsumerRecords` 包含了一组从 Kafka 主题中拉取的消息记录，这些消息记录按照分区进行组织。每个分区都有一个消息记录列表。在 `ConsumerRecords` 对象中，你可以通过 `records()` 方法获取所有分区的消息记录列表，然后逐个处理这些消息记录。

### 超时设置

在使用 `poll` 方法时，要特别注意超时设置。如果设置的超时时间太短，可能导致频繁的轮询，增加网络开销。反之，如果设置的超时时间太长，可能会导致消息处理的延迟。

### 示例

```java
Consumer<String, String> consumer = new KafkaConsumer<>(properties);

// 订阅 Kafka 主题
String topic = "your_kafka_topic";
consumer.subscribe(Collections.singletonList(topic));

// 持续消费消息
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));

    records.forEach(record -> {
        System.out.println("Received message: " +
                "Topic = " + record.topic() +
                ", Partition = " + record.partition() +
                ", Offset = " + record.offset() +
                ", Key = " + record.key() +
                ", Value = " + record.value());
    });
}
```

在上述示例中，`poll` 方法的超时时间设置为 100 毫秒。这意味着如果没有可用的消息，消费者将等待最多 100 毫秒，然后继续轮询。

# 用 jdk1.7 的语法来，重新写

在 JDK 1.7 中，没有引入 `java.time` 包，因此无法使用 `java.time.Duration`。

在这种情况下，可以使用 `java.util.concurrent.TimeUnit` 和 `long` 类型来表示超时时间。

以下是使用 JDK 1.7 语法编写的 Kafka 消费者示例：

```java
import kafka.consumer.Consumer;
import kafka.consumer.ConsumerConfig;
import kafka.consumer.ConsumerIterator;
import kafka.consumer.KafkaStream;
import kafka.javaapi.consumer.ConsumerConnector;
import kafka.message.MessageAndMetadata;
import kafka.serializer.StringDecoder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class KafkaConsumerExample {

    public static void main(String[] args) {
        // 设置 Kafka 消费者配置
        Properties properties = new Properties();
        properties.put("zookeeper.connect", "your_zookeeper_servers");
        properties.put("group.id", "your_consumer_group_id");
        properties.put("zookeeper.session.timeout.ms", "400");
        properties.put("zookeeper.sync.time.ms", "200");
        properties.put("auto.commit.interval.ms", "1000");

        // 创建 Kafka 消费者连接器
        ConsumerConnector consumerConnector = Consumer.createJavaConsumerConnector(new ConsumerConfig(properties));

        // 指定要消费的主题和分区数
        String topic = "your_kafka_topic";
        int numThreads = 1;

        // 订阅 Kafka 主题
        Map<String, Integer> topicCountMap = new HashMap<>();
        topicCountMap.put(topic, numThreads);

        Map<String, List<KafkaStream<String, String>>> consumerMap = consumerConnector.createMessageStreams(topicCountMap, new StringDecoder(null), new StringDecoder(null));
        List<KafkaStream<String, String>> streams = consumerMap.get(topic);

        // 创建并启动消费者线程
        for (final KafkaStream<String, String> stream : streams) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    ConsumerIterator<String, String> it = stream.iterator();
                    while (it.hasNext()) {
                        MessageAndMetadata<String, String> message = it.next();
                        System.out.println("Received message: " +
                                "Topic = " + message.topic() +
                                ", Partition = " + message.partition() +
                                ", Offset = " + message.offset() +
                                ", Key = " + message.key() +
                                ", Value = " + message.message());
                    }
                }
            }).start();
        }
    }
}
```

请替换以下信息：

- `your_zookeeper_servers`：替换为你的 Zookeeper 服务器地址和端口，例如 "localhost:2181"。
- `your_kafka_topic`：替换为你要消费消息的 Kafka 主题。
- `your_consumer_group_id`：替换为你的消费者组的唯一标识符。

上述代码使用了老版本的 Kafka 消费者 API，如果你的 Kafka 版本是较新的，建议尽量升级到支持新 API 的版本。


# Q: 详细介绍一下 kafka ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG 和 ConsumerConfig.MAX_POLL_RECORDS_CONFIG

`ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG` 和 `ConsumerConfig.MAX_POLL_RECORDS_CONFIG` 是 Kafka 消费者配置中的两个关键参数，用于配置消费者的行为。以下是对这两个配置项的详细介绍：

### `ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG`

- **描述：** 该配置项用于设置两次 poll 之间的最大时间间隔，以毫秒为单位。如果消费者在这个时间间隔内没有发起 poll 操作，就会被认为已经死亡，触发重新平衡（rebalance）。
  
- **类型：** 长整型（long）。
  
- **默认值：** `300000` 毫秒（5 分钟）。
  
- **作用：** 主要用于检测消费者是否处于活动状态。如果消费者在指定的时间内没有进行 poll 操作，Kafka 认为该消费者可能已经崩溃或失去连接，因此触发重新平衡以确保分区的均衡分配。

### `ConsumerConfig.MAX_POLL_RECORDS_CONFIG`

- **描述：** 该配置项用于设置单次 poll 最多拉取的记录数。这是控制每次拉取的消息数量的一个关键参数。
  
- **类型：** 整型（int）。
  
- **默认值：** `500` 条记录。
  
- **作用：** 用于控制消费者每次拉取消息的批处理大小。较大的批处理大小可以提高消费者的吞吐量，但也可能增加消息处理的延迟。在调整这个值时，需要平衡吞吐量和延迟之间的权衡。

### 注意事项：

1. **`MAX_POLL_INTERVAL_MS_CONFIG` 的值需要小于 `session.timeout.ms`：** `MAX_POLL_INTERVAL_MS_CONFIG` 的值应该小于 `session.timeout.ms`，以确保在消费者被认为已经死亡之前，有足够的时间进行 poll 操作。`session.timeout.ms` 是另一个配置项，用于指定与消费者组协调器的会话超时时间。

2. **避免设置过大的 `MAX_POLL_RECORDS_CONFIG` 值：** 设置过大的 `MAX_POLL_RECORDS_CONFIG` 值可能导致单次 poll 操作的消耗时间过长，影响消费者的响应性。根据实际场景和需求进行合理的调整。

3. **根据实际需求调整配置：** 这两个配置项的值应该根据你的应用场景和性能需求进行调整。合适的配置可以确保消费者组的稳定运行、消息的及时处理，并避免不必要的重新平衡操作。

这些配置项可以通过在消费者配置中设置相应的键值对来进行调整。例如：

```java
properties.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 60000); // 设置最大 poll 间隔为 60 秒
properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 1000); // 设置最大 poll 记录数为 1000 条
```

请根据你的实际需求谨慎调整这些参数。



# Q: 介绍一下 logstash 的 kafka input 例子

Logstash 是一个用于处理和传输日志数据的开源工具，而 Kafka 是一个分布式流处理平台。

Logstash 提供了 Kafka Input 插件，使其能够从 Kafka 主题中读取数据。

以下是一个简单的 Logstash 配置文件，演示如何使用 Kafka Input 插件：

```conf
input {
  kafka {
    bootstrap_servers => "kafka_broker:9092"
    topics => ["your_kafka_topic"]
    group_id => "your_consumer_group_id"
  }
}

filter {
  # 在这里添加任何你需要的过滤操作
}

output {
  # 在这里添加你的输出配置，例如输出到 Elasticsearch、文件等
}
```

解释一下这个配置文件的各个部分：

1. `input` 部分：使用 Kafka Input 插件从 Kafka 主题中读取数据。你需要指定 Kafka 服务器的地址（`bootstrap_servers`）、要订阅的主题（`topics`），以及消费者组的 ID（`group_id`）。

2. `filter` 部分：这是可选的，你可以在这里添加任何你需要的过滤操作，以对数据进行处理。

3. `output` 部分：在这里配置 Logstash 如何输出数据。你可以选择将数据输出到 Elasticsearch、文件、数据库等。根据你的需求配置相应的输出插件。

确保替换配置文件中的以下信息：

- `kafka_broker:9092`：替换为你的 Kafka 服务器地址和端口。
- `your_kafka_topic`：替换为你要订阅的 Kafka 主题。
- `your_consumer_group_id`：替换为你的消费者组的唯一标识符。

保存配置文件后，可以使用以下命令运行 Logstash：

```bash
bin/logstash -f your_config_file.conf
```

这样，Logstash 将会连接到 Kafka 主题，从中读取数据，并按照配置文件中的设置进行处理和输出。

# Q: 介绍一下 logstash 中的 kafka input 所有配置项


Logstash 中的 Kafka Input 插件提供了许多配置项，用于定义连接到 Kafka 主题的方式以及如何处理接收到的数据。以下是一些常见的配置项：

1. **bootstrap_servers**：
   - 描述：Kafka 服务器的地址列表，用于建立与 Kafka 集群的连接。
   - 示例：`bootstrap_servers => "kafka_broker1:9092, kafka_broker2:9092"`

2. **topics**：
   - 描述：要订阅的 Kafka 主题列表。
   - 示例：`topics => ["topic1", "topic2"]`

3. **group_id**：
   - 描述：Kafka 消费者组的唯一标识符。
   - 示例：`group_id => "my_consumer_group"`

4. **auto_offset_reset**：
   - 描述：在没有存储的消费者偏移或偏移无效的情况下，从何处开始读取消息。可选值包括 "earliest"（从最早的消息开始）和 "latest"（从最新的消息开始）。
   - 示例：`auto_offset_reset => "earliest"`

5. **client_id**：
   - 描述：用于标识 Logstash 客户端的字符串。
   - 示例：`client_id => "my_logstash"`

6. **consumer_threads**：
   - 描述：用于指定用于处理 Kafka 消息的线程数量。
   - 示例：`consumer_threads => 5`

7. **decorate_events**：
   - 描述：如果设置为 true，将添加 Kafka 特定的字段（例如 `kafka`）到 Logstash 事件中，包含 Kafka 消息的元数据。
   - 示例：`decorate_events => true`

8. **key_deserializer** 和 **value_deserializer**：
   - 描述：用于指定消息键和值的反序列化器类。默认情况下，Logstash 使用字符串反序列化器。
   - 示例：`key_deserializer => "org.apache.kafka.common.serialization.StringDeserializer"`

9. **codec**：
   - 描述：指定 Logstash 用于解码消息的编解码器。可以是 "json"、"plain" 等。
   - 示例：`codec => json`

10. **metadata_max_age_ms**：
    - 描述：指定 Kafka 元数据的最大缓存时间（以毫秒为单位）。
    - 示例：`metadata_max_age_ms => 60000`

这只是一些常见的配置项，实际上 Kafka Input 插件支持的配置项更多。

你可以根据自己的需求查阅[官方文档](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-kafka.html)以获取详细的配置信息。

# Q: 介绍一下 logstash 的 kafka output 例子

Logstash 的 Kafka Output 插件用于将数据发送到 Kafka 主题。

以下是一个简单的 Logstash 配置文件，演示如何使用 Kafka Output 插件：

```conf
input {
  # 在这里配置输入，例如从文件中读取日志
}

filter {
  # 在这里添加任何你需要的过滤操作
}

output {
  kafka {
    bootstrap_servers => "kafka_broker:9092"
    topic_id => "your_kafka_topic"
  }
}
```

解释一下这个配置文件的各个部分：

1. `input` 部分：在这里配置 Logstash 如何获取输入数据，可以是文件、标准输入等。这部分根据实际情况配置。

2. `filter` 部分：这是可选的，你可以在这里添加任何你需要的过滤操作，以对输入数据进行处理。

3. `output` 部分：使用 Kafka Output 插件将处理过的数据发送到 Kafka 主题。你需要指定 Kafka 服务器的地址（`bootstrap_servers`）和要发送到的主题（`topic_id`）。

确保替换配置文件中的以下信息：

- `kafka_broker:9092`：替换为你的 Kafka 服务器地址和端口。
- `your_kafka_topic`：替换为你要发送数据的 Kafka 主题。

保存配置文件后，可以使用以下命令运行 Logstash：

```bash
bin/logstash -f your_config_file.conf
```

这样，Logstash 将会连接到 Kafka，将处理过的数据发送到指定的 Kafka 主题。

请注意，上述示例中的输入和过滤器部分是占位符，具体的配置取决于你的数据源和需求。

根据实际情况，你可能需要配置适当的输入插件和过滤器。

# Q: 给出 logstash kafka output 所有的配置项

Logstash Kafka Output 插件提供了多个配置项，用于定义将数据发送到 Kafka 主题的方式。以下是一些常见的配置项：

1. **bootstrap_servers**：
   - 描述：Kafka 服务器的地址列表，用于建立与 Kafka 集群的连接。
   - 示例：`bootstrap_servers => "kafka_broker1:9092, kafka_broker2:9092"`

2. **topic_id**：
   - 描述：要将数据发送到的 Kafka 主题的名称。
   - 示例：`topic_id => "your_kafka_topic"`

3. **acks**：
   - 描述：指定生产者需要接收的确认数，控制消息写入的可靠性。可选值包括 "all"、"1" 或 "0"。
   - 示例：`acks => "all"`

4. **compression_type**：
   - 描述：指定消息压缩类型，可选值包括 "none"、"gzip" 和 "snappy"。
   - 示例：`compression_type => "gzip"`

5. **key_serializer** 和 **value_serializer**：
   - 描述：用于指定消息键和值的序列化器类。默认情况下，Logstash 使用字符串序列化器。
   - 示例：`key_serializer => "org.apache.kafka.common.serialization.StringSerializer"`

6. **request_timeout_ms**：
   - 描述：指定生产者等待请求响应的最大时间（以毫秒为单位）。
   - 示例：`request_timeout_ms => 1000`

7. **max_retries**：
   - 描述：在放弃之前生产者可以重试的最大次数。
   - 示例：`max_retries => 3`

8. **retry_backoff_ms**：
   - 描述：在重试尝试之间等待的时间（以毫秒为单位）。
   - 示例：`retry_backoff_ms => 500`

9. **ssl_keystore_location**、**ssl_keystore_password**、**ssl_truststore_location** 和 **ssl_truststore_password**：
   - 描述：用于配置 SSL 安全连接的密钥库和信任库的位置和密码。
   - 示例：
     ```conf
     ssl_keystore_location => "/path/to/keystore"
     ssl_keystore_password => "keystore_password"
     ssl_truststore_location => "/path/to/truststore"
     ssl_truststore_password => "truststore_password"
     ```

10. **security_protocol**：
    - 描述：指定用于与 Kafka 集群通信的安全协议，例如 "PLAINTEXT"、"SSL"、"SASL_PLAINTEXT" 或 "SASL_SSL"。
    - 示例：`security_protocol => "SSL"`

11. **sasl_mechanism**：
    - 描述：指定用于认证的 SASL 机制，例如 "PLAIN" 或 "GSSAPI"。
    - 示例：`sasl_mechanism => "PLAIN"`

12. **sasl_jaas_config**：
    - 描述：用于配置 SASL 插件的 Java Authentication and Authorization Service (JAAS) 登录配置。
    - 示例：
      ```conf
      sasl_jaas_config => "org.apache.kafka.common.security.plain.PlainLoginModule required username='user' password='password';"
      ```

这只是一部分配置项，实际上 Kafka Output 插件支持的配置项更多。

你可以根据自己的需求查阅[官方文档](https://www.elastic.co/guide/en/logstash/current/plugins-outputs-kafka.html)以获取详细的配置信息。

# 参考资料

chat

* any list
{:toc}
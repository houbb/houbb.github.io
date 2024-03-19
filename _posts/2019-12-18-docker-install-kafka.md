---
layout: post
title: Docker 安装 Kafka
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [java, docker, kafka, mq, sh]
published: true
---

# Docker Kafka

## 基础知识

[Docker 入门介绍](https://houbb.github.io/2018/09/05/container-docker-hello)

[Apacke-Kafka](https://houbb.github.io/2017/08/09/apacke-kafka)

# 实战

## 镜像选择

```
$ docker search kafka
NAME                             DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
wurstmeister/kafka               Multi-Broker Apache Kafka Image                 678                                     [OK]
spotify/kafka                    A simple docker image with both Kafka and Zo…   314                                     [OK]
sheepkiller/kafka-manager        kafka-manager                                   131                                     [OK]
ches/kafka                       Apache Kafka. Tagged versions. JMX. Cluster-…   106                                     [OK]
...
```

比较出名的有以下几个：

- wurstmeister/kafka 

特点：star数最多，版本更新到 Kafka 1.0 ，zookeeper与kafka分开于不同镜像。

- spotify/kafka 

特点：star数较多，有很多文章或教程推荐，zookeeper与kafka置于同一镜像中；但kafka版本较老（还停留在0.10.1.0）。

- confluent/kafka 

背景：Confluent是书中提到的那位开发Kafka的Jay Kreps 从LinkedIn离职后创立的新公司，Confluent Platform 是一个流数据平台，围绕着Kafka打造了一系列产品。

特点：大咖操刀，文档详尽，但是也和Confluent Platform进行了捆绑。

- 最终选择

此处选择 [wurstmeister/kafka](https://github.com/wurstmeister/kafka-docker/)。


## 拉取镜像

- zookeeper

```
$   docker pull wurstmeister/zookeeper
```

- kafka

```
$   docker pull wurstmeister/kafka
```

- 设置 `docker-compose.yml`

可以参考 [wurstmeister/docker-compose.yml](https://github.com/wurstmeister/kafka-docker/blob/master/docker-compose.yml)

```yml
version: '2'
services:
  zookeeper:
    image: wurstmeister/zookeeper
    ports:
      - "2181:2181"
  kafka:
    build: .
    ports:
      - "9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: 127.0.0.1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```


## 启动镜像

- zookeeper

```
docker run -d --name zookeeper --publish 2181:2181  wurstmeister/zookeeper
```

- zookeeper启动完成后再启动kafka:

```
docker run -d --name kafka --publish 9092:9092 \
--link zookeeper \
--env KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
--env KAFKA_ADVERTISED_HOST_NAME=127.0.0.1 \
--env KAFKA_ADVERTISED_PORT=9092 \
wurstmeister/kafka
```

- 查看状态

```
$ docker ps
CONTAINER ID        IMAGE                    COMMAND                  CREATED             STATUS              PORTS                                                                                        NAMES
6adb9863a48a        wurstmeister/kafka       "start-kafka.sh"         16 seconds ago      Up 15 seconds       0.0.0.0:9092->9092/tcp                                                                       kafka
125098d25e6b        wurstmeister/zookeeper   "/bin/sh -c '/usr/sb…"   27 seconds ago      Up 25 seconds       22/tcp, 2888/tcp, 3888/tcp, 0.0.0.0:2181->2181/tcp                                           zookeeper
```

## 可靠性测试

根据 container 名称，进入 kafka 容器

```
$   docker exec -it kafka /bin/bash
```

- 创建 topic

```
kafka-topics.sh --create --topic test --zookeeper zookeeper:2181 --replication-factor 1 --partitions 1
```

日志

```
Created topic "test".
```

- 查看创建的 topic

```
kafka-topics.sh --zookeeper zookeeper:2181 --describe --topic test
```

信息如下：

```
Topic: test	Partition: 0	Leader: 1001	Replicas: 1001	Isr: 1001
```

- 发送信息

```
kafka-console-producer.sh --broker-list localhost:9092 --topic test
```

输入测试内容

```
>hello docker kafka
```

- 接收消息

```
kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test --from-beginning
```

如同预期接收到对应的消息。

# 参考资料

[在Docker上运行Apache Kafka](http://dockone.io/article/565)

[Docker快速搭建Kafka 1.x集群](https://www.jianshu.com/p/8ccd712e2599)

[docker环境下的zookeeper和kafka部署](https://my.oschina.net/lhztt/blog/791664)

* any list
{:toc}
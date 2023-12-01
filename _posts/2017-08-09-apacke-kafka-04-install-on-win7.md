---
layout: post
title:  Apache Kafka-04-kafka install on windows7 安装笔记
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq, stream, mq]
published: true
---

# 背景

近期在使用 kafka，不过是阿里云的。

一时心痒痒，就像本地安装一下，环境是 window7，作为记录，便于以后学习。

# 基本环境

## jdk

apache kafka 基于 java 实现，所以需要安装下 java 基本环境。

```
λ java -version
java version "1.8.0_102"
Java(TM) SE Runtime Environment (build 1.8.0_102-b14)
Java HotSpot(TM) Client VM (build 25.102-b14, mixed mode, sharing)
```

本地已经安装，不再赘述。

## zookeeper

kafka 基于 zk 实现高可用，我们这里安装一下。

1、 下载安装包

http://zookeeper.apache.org/releases.html#download


我安装的是 [apache-zookeeper-3.6.1-bin.tar.gz](https://www.apache.org/dyn/closer.lua/zookeeper/zookeeper-3.6.1/apache-zookeeper-3.6.1-bin.tar.gz) 版本

2、解压

解压之后，找到配置文件夹

```
D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\conf
```

将 `zoo_sample.cfg` 复制一份，重命名为 `zoo.cfg`

3、修改配置

打开 zoo.cfg 文件，修改并且编辑 dataDir 为：

```
dataDir=D:/tool/zookeeper/apache-zookeeper-3.6.1-bin/data
```
 
这里用来存放数据信息。

4、 添加系统变量：

```
ZOOKEEPER_HOME=D:\tool\zookeeper\apache-zookeeper-3.6.1-bin
```

编辑path系统变量，添加路径：

```
%ZOOKEEPER_HOME%\bin;
```

注意前面是否有 `;`，如果没有记得添加。

5、zk 端口修改

在zoo.cfg文件中修改默认的Zookeeper端口（默认端口2181）

```
clientPort=2181
```

此处我保持不变


6、运行 zk

启动命令行，运行

```
zkServer
```

其实也可以直接到运行的目录下运行：

```
cd D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\bin
zkServer
```

### 启动报错

报错：

```
此时不应有 \Java\jdk1.8.0_102。
```

原因：java 的存放路径中包含空格，需要重新配置。

默认安装路径：

```
C:\Program Files (x86)\Java\jdk1.8.0_102
```

- 调整位置

调整到下面的位置：

```
D:\tool\Java\jdk1.8.0_102
```

- 修改环境变量

```
JAVA_HOME=D:\tool\Java\jdk1.8.0_102
```

- 确认查看

```
echo %java_home%
D:\tool\Java\jdk1.8.0_102
```

- 重新启动

```
2020-08-11 21:54:14,440 [myid:] - INFO  [main:FileTxnSnapLog@124] - zookeeper.snapshot.trust.empty : false
2020-08-11 21:54:14,455 [myid:] - INFO  [main:ZookeeperBanner@42] -
2020-08-11 21:54:14,456 [myid:] - INFO  [main:ZookeeperBanner@42] -   ______                  _
2020-08-11 21:54:14,456 [myid:] - INFO  [main:ZookeeperBanner@42] -  |___  /                 | |
2020-08-11 21:54:14,457 [myid:] - INFO  [main:ZookeeperBanner@42] -     / /    ___     ___   | | __   ___    ___   _ __     ___   _ __
2020-08-11 21:54:14,458 [myid:] - INFO  [main:ZookeeperBanner@42] -    / /    / _ \   / _ \  | |/ /  / _ \  / _ \ | '_ \   / _ \ | '__|
2020-08-11 21:54:14,459 [myid:] - INFO  [main:ZookeeperBanner@42] -   / /__  | (_) | | (_) | |   <  |  __/ |  __/ | |_) | |  __/ | |
2020-08-11 21:54:14,460 [myid:] - INFO  [main:ZookeeperBanner@42] -  /_____|  \___/   \___/  |_|\_\  \___|  \___| | .__/   \___| |_|
2020-08-11 21:54:14,460 [myid:] - INFO  [main:ZookeeperBanner@42] -                                               | |
2020-08-11 21:54:14,461 [myid:] - INFO  [main:ZookeeperBanner@42] -                                               |_|
2020-08-11 21:54:14,461 [myid:] - INFO  [main:ZookeeperBanner@42] -
2020-08-11 21:54:14,477 [myid:] - INFO  [main:Environment@98] - Server environment:zookeeper.version=3.6.1--104dcb3e3fb464b30c5186d229e00af9f332524b, built on 04/21/2020 15:01 GMT
```

保持这个窗口打开，为后面 kafka 使用。


# 安装 kafka

## 下载安装包

[http://kafka.apache.org/downloads](http://kafka.apache.org/downloads)

注意，这里选择二进制版本

```
2.6.0
Released Aug 3, 2020
Release Notes
Source download: kafka-2.6.0-src.tgz (asc, sha512)
Binary downloads:
Scala 2.12  - kafka_2.12-2.6.0.tgz (asc, sha512)
Scala 2.13  - kafka_2.13-2.6.0.tgz (asc, sha512)
We build for multiple versions of Scala. This only matters if you are using Scala and you want a version built for the same Scala version you use. Otherwise any version should work (2.13 is recommended).
```

此处我选择 [Scala 2.13  - kafka_2.13-2.6.0.tgz (asc, sha512)](https://www.apache.org/dyn/closer.cgi?path=/kafka/2.6.0/kafka_2.13-2.6.0.tgz)

解压到指定文件夹。

我这里是：

```
D:\tool\kafka\kafka_2.13-2.6.0
```

## 修改配置

进入 `D:\tool\kafka\kafka_2.13-2.6.0\config` 目录找到文件server.properties并打开

做下几个编辑：

```properties
# 日志路径
log.dirs=D:\tool\kafka\kafka_2.13-2.6.0\logs

# zk 地址（默认可以保持不变）
zookeeper.connect=localhost:2181
```

Kafka会按照默认，在 9092 端口上运行，并连接zookeeper的默认端口：2181


## 启动

我们到根目录：

```
D:\tool\kafka\kafka_2.13-2.6.0
```

文件如下：

```
ls
bin/  config/  libs/  LICENSE  NOTICE  site-docs/
```

我们指定一下启动，并且指定我们刚才的配置：

```
.\bin\windows\kafka-server-start.bat .\config\server.properties
```

启动日志：

```
[2020-08-11 22:02:36,795] INFO Kafka version: 2.6.0 (org.apache.kafka.common.utils.AppInfoParser)
[2020-08-11 22:02:36,796] INFO Kafka commitId: 62abe01bee039651 (org.apache.kafka.common.utils.AppInfoParser)
[2020-08-11 22:02:36,796] INFO Kafka startTimeMs: 1597154556790 (org.apache.kafka.common.utils.AppInfoParser)
[2020-08-11 22:02:36,800] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
```

注意：不要关了这个窗口，启用Kafka前请确保ZooKeeper实例已经准备好并开始运行


# 测试验证

（linux直接在bin目录下.sh，windows需要进入bin\winndows下的.bat）

我这里是 windows，进入：

```
D:\tool\kafka\kafka_2.13-2.6.0\bin\windows
```

## 创建主题

命令：

```
.\kafka-topics.bat --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
```

日志

```
Created topic test.
```

表明创建主题完成。

## 查看主题

输入

```
.\kafka-topics.bat --list --zookeeper localhost:2181
```

返回：

```
test
```

## 创建生产者

```
.\kafka-console-producer.bat --broker-list localhost:9092 --topic test
```

直接进入一个输入窗口：

```
>
```

保持这个窗口打开，我们创建一下消费者。

## 创建消费者

```
.\kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic test --from-beginning
```

## 测试验证

我们在生产者的命令行中输入一些信息：

```
> hello kafka
```

理论上我们是可以看到消费者对应的消息的。

然而很不幸，我并没有看到。

### 异常

去日志目录看一下，就是我们配置的 kafka 日志：

有一段错误日志如下：

```
[2020-08-11 22:09:12,776] ERROR [Broker id=0] Error while processing LeaderAndIsr request correlationId 3 received from controller 0 epoch 1 for partition __consumer_offsets-28 (state.change.logger)
java.io.IOException: Map failed
	at sun.nio.ch.FileChannelImpl.map(FileChannelImpl.java:940)
	at kafka.log.AbstractIndex.<init>(AbstractIndex.scala:125)
	at kafka.log.OffsetIndex.<init>(OffsetIndex.scala:54)
	at kafka.log.LazyIndex$.$anonfun$forOffset$1(LazyIndex.scala:106)
	at kafka.log.LazyIndex.$anonfun$get$1(LazyIndex.scala:63)
	at kafka.log.LazyIndex.get(LazyIndex.scala:60)
	at kafka.log.LogSegment.offsetIndex(LogSegment.scala:65)
	at kafka.log.LogSegment.readNextOffset(LogSegment.scala:457)
	at kafka.log.Log.recoverLog(Log.scala:824)
	at kafka.log.Log.$anonfun$loadSegments$3(Log.scala:723)
	at scala.runtime.java8.JFunction0$mcJ$sp.apply(JFunction0$mcJ$sp.scala:17)
	at kafka.log.Log.retryOnOffsetOverflow(Log.scala:2351)
	at kafka.log.Log.loadSegments(Log.scala:723)
	at kafka.log.Log.<init>(Log.scala:287)
	at kafka.log.Log$.apply(Log.scala:2485)
	at kafka.log.LogManager.getOrCreateLog(LogManager.scala:779)
	at kafka.cluster.Partition.createLog(Partition.scala:322)
	at kafka.cluster.Partition.createLogIfNotExists(Partition.scala:297)
	at kafka.cluster.Partition.$anonfun$makeLeader$1(Partition.scala:499)
	at kafka.cluster.Partition.makeLeader(Partition.scala:485)
	at kafka.server.ReplicaManager.$anonfun$makeLeaders$5(ReplicaManager.scala:1441)
	at scala.collection.mutable.HashMap$Node.foreach(HashMap.scala:587)
	at scala.collection.mutable.HashMap.foreach(HashMap.scala:475)
	at kafka.server.ReplicaManager.makeLeaders(ReplicaManager.scala:1439)
	at kafka.server.ReplicaManager.becomeLeaderOrFollower(ReplicaManager.scala:1317)
	at kafka.server.KafkaApis.handleLeaderAndIsrRequest(KafkaApis.scala:227)
	at kafka.server.KafkaApis.handle(KafkaApis.scala:136)
	at kafka.server.KafkaRequestHandler.run(KafkaRequestHandler.scala:70)
	at java.lang.Thread.run(Thread.java:745)
Caused by: java.lang.OutOfMemoryError: Map failed
	at sun.nio.ch.FileChannelImpl.map0(Native Method)
	at sun.nio.ch.FileChannelImpl.map(FileChannelImpl.java:937)
	... 28 more
```

主要有 2 种说法，一种是将 jvm 调整为 64 位，一种是修改 kafka 启动配置。

（1）修改配置

我们先修改启动参数试试:

`kafka-server-start.bat` 这个启动脚本，参数一定也在里面。

这里没有几句话：

```bat
IF NOT ERRORLEVEL 1 (
        rem 32-bit OS
        set KAFKA_HEAP_OPTS=-Xmx512M -Xms512M
    ) ELSE (
        rem 64-bit OS
        set KAFKA_HEAP_OPTS=-Xmx1G -Xms1G
    )
)
```

我们直接将 HEAP 都配置为 1G，调整如下：

```bat
IF NOT ERRORLEVEL 1 (
    rem 32-bit OS
    set KAFKA_HEAP_OPTS=-Xmx256M -Xms256M
) ELSE (
    rem 64-bit OS
    set KAFKA_HEAP_OPTS=-Xmx256M -Xms256M
)
```

我这里是调整小了可以。然后就启动成功了。

猜测：os 是 64-bit，jvm 是 32 位，所以往小处调整。

- 再次启动

```
.\bin\windows\kafka-server-start.bat .\config\server.properties
```

### 正常效果

这次我在生产者输入：

```
>winer winer
>chicken dinner
>
```

消费端对应的消息如下：

```
winer winer
chicken dinner
```

# 拓展阅读

[docker 安装 kafka](https://houbb.github.io/2018/09/17/docker-install-kafka)

[spring kafka](https://houbb.github.io/2018/09/19/spring-kafka)

[springboot 整合 kafka](https://houbb.github.io/2017/08/09/apacke-kafka-05-springboot)

# 参考资料

[Kafka文件存储机制](https://runnerliu.github.io/2018/04/30/kafkasave/)

[启动zookeeper时 报错：此时不应有 \Java\jdk1.8.0_144](https://blog.csdn.net/dgdf123/article/details/106628486/)

[kafka启动报错:java.lang.OutOfMemoryError: Map failed](https://blog.csdn.net/jja_wangfei/article/details/88622757)

[kafka-server-failed-to-start-java-io-ioexception-map-failed](https://stackoverflow.com/questions/43042144/kafka-server-failed-to-start-java-io-ioexception-map-failed)

* any list
{:toc}


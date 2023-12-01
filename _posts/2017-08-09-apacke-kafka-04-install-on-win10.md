---
layout: post
title:  Apache Kafka-04-kafka install on windows10 安装笔记
date:  2017-8-9 09:32:36 +0800
categories: [MQ]
tags: [apache, kafka, mq, stream, mq]
published: true
---

# 基础依赖

## java 环境

```
λ java -version
java version "1.8.0_371"
Java(TM) SE Runtime Environment (build 1.8.0_371-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.371-b11, mixed mode)
```

# zookeeper 

kafka 基于 zk 实现高可用，我们这里首先安装一下。

## 1、 下载安装包

http://zookeeper.apache.org/releases.html#download


我安装的是 [apache-zookeeper-3.6.1-bin.tar.gz](https://www.apache.org/dyn/closer.lua/zookeeper/zookeeper-3.6.1/apache-zookeeper-3.6.1-bin.tar.gz) 版本

## 2、解压

解压文件：

```
D:\tool\zookeeper\apache-zookeeper-3.6.1-bin
```

```
cd D:\tool\zookeeper\apache-zookeeper-3.6.1-bin
$ ls

bin/  conf/  docs/  lib/  LICENSE.txt  NOTICE.txt  README.md  README_packaging.md
```

解压之后，找到配置文件夹

```
D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\conf
```

将 `zoo_sample.cfg` 复制一份，重命名为 `zoo.cfg`

## 3、修改配置

打开 zoo.cfg 文件，修改并且编辑 dataDir 为：

```
dataDir=D:/tool/zookeeper/apache-zookeeper-3.6.1-bin/data
```
 
这里用来存放数据信息。

在zoo.cfg文件中修改默认的Zookeeper端口（默认端口2181）

```
clientPort=2181
```

此处我保持不变

## 运行 zk

到 bin 目录下运行：

```
$	cd D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\bin
$	zkServer.cmd
```

启动日志

```
λ zkServer.cmd                                                                                                        
                                                                                                                      
call "D:\tool\jdk\jdk-1.8"\bin\java "-Dzookeeper.log.dir=D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\bin\..\logs" "-D
zookeeper.root.logger=INFO,CONSOLE" "-Dzookeeper.log.file=zookeeper-dh-server-D.log" "-XX:+HeapDumpOnOutOfMemoryError"
 "-XX:OnOutOfMemoryError=cmd /c taskkill /pid %%p /t /f" -cp "D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\bin\..\buil
d\classes;D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\bin\..\build\lib\*;D:\tool\zookeeper\apache-zookeeper-3.6.1-bin
\bin\..\*;D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\bin\..\lib\*;D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\bin\.
.\conf" org.apache.zookeeper.server.quorum.QuorumPeerMain "D:\tool\zookeeper\apache-zookeeper-3.6.1-bin\bin\..\conf\zo
o.cfg"                                                                                                                
2023-12-01 15:08:39,810 [myid:] - INFO  [main:QuorumPeerConfig@173] - Reading configuration from: D:\tool\zookeeper\ap
ache-zookeeper-3.6.1-bin\bin\..\conf\zoo.cfg                                                                          
2023-12-01 15:08:39,841 [myid:] - INFO  [main:QuorumPeerConfig@459] - clientPortAddress is 0.0.0.0:2181               
2023-12-01 15:08:39,841 [myid:] - INFO  [main:QuorumPeerConfig@463] - secureClientPort is not set                     
2023-12-01 15:08:39,841 [myid:] - INFO  [main:QuorumPeerConfig@479] - observerMasterPort is not set                   
2023-12-01 15:08:39,841 [myid:] - INFO  [main:QuorumPeerConfig@496] - metricsProvider.className is org.apache.zookeepe
r.metrics.impl.DefaultMetricsProvider                                                                                 
2023-12-01 15:08:39,841 [myid:] - INFO  [main:DatadirCleanupManager@78] - autopurge.snapRetainCount set to 3          
2023-12-01 15:08:39,841 [myid:] - INFO  [main:DatadirCleanupManager@79] - autopurge.purgeInterval set to 0            
2023-12-01 15:08:39,841 [myid:] - INFO  [main:DatadirCleanupManager@101] - Purge task is not scheduled.               
2023-12-01 15:08:39,841 [myid:] - WARN  [main:QuorumPeerMain@138] - Either no config or no quorum defined in config, r
unning in standalone mode                                                                                             
2023-12-01 15:08:39,841 [myid:] - INFO  [main:ManagedUtil@44] - Log4j 1.2 jmx support found and enabled.              
2023-12-01 15:08:39,920 [myid:] - INFO  [main:QuorumPeerConfig@173] - Reading configuration from: D:\tool\zookeeper\ap
ache-zookeeper-3.6.1-bin\bin\..\conf\zoo.cfg                                                                          
2023-12-01 15:08:39,920 [myid:] - INFO  [main:QuorumPeerConfig@459] - clientPortAddress is 0.0.0.0:2181               
2023-12-01 15:08:39,920 [myid:] - INFO  [main:QuorumPeerConfig@463] - secureClientPort is not set                     
2023-12-01 15:08:39,920 [myid:] - INFO  [main:QuorumPeerConfig@479] - observerMasterPort is not set                   
2023-12-01 15:08:39,920 [myid:] - INFO  [main:QuorumPeerConfig@496] - metricsProvider.className is org.apache.zookeepe
r.metrics.impl.DefaultMetricsProvider                                                                                 
2023-12-01 15:08:39,920 [myid:] - INFO  [main:ZooKeeperServerMain@122] - Starting server                              
2023-12-01 15:08:39,967 [myid:] - INFO  [main:ServerMetrics@62] - ServerMetrics initialized with provider org.apache.z
ookeeper.metrics.impl.DefaultMetricsProvider@5474c6c                                                                  
2023-12-01 15:08:39,967 [myid:] - INFO  [main:FileTxnSnapLog@124] - zookeeper.snapshot.trust.empty : false            
2023-12-01 15:08:39,982 [myid:] - INFO  [main:ZookeeperBanner@42] -                                                   
2023-12-01 15:08:39,982 [myid:] - INFO  [main:ZookeeperBanner@42] -   ______                  _                       
                                                                                                                      
2023-12-01 15:08:39,982 [myid:] - INFO  [main:ZookeeperBanner@42] -  |___  /                 | |                      
                                                                                                                      
2023-12-01 15:08:39,982 [myid:] - INFO  [main:ZookeeperBanner@42] -     / /    ___     ___   | | __   ___    ___   _ _
_     ___   _ __                                                                                                      
2023-12-01 15:08:39,982 [myid:] - INFO  [main:ZookeeperBanner@42] -    / /    / _ \   / _ \  | |/ /  / _ \  / _ \ | '_
 \   / _ \ | '__|                                                                                                     
2023-12-01 15:08:39,982 [myid:] - INFO  [main:ZookeeperBanner@42] -   / /__  | (_) | | (_) | |   <  |  __/ |  __/ | |_
) | |  __/ | |                                                                                                        
2023-12-01 15:08:39,982 [myid:] - INFO  [main:ZookeeperBanner@42] -  /_____|  \___/   \___/  |_|\_\  \___|  \___| | ._
_/   \___| |_|                                                                                                        
...                                                                                                
2023-12-01 15:08:40,635 [myid:] - INFO  [main:ZKAuditProvider@42] - ZooKeeper audit is disabled.                      
```

# kafka windows10 install 实战

## 下载安装包

[http://kafka.apache.org/downloads](http://kafka.apache.org/downloads)

注意，这里选择二进制版本

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
log.dirs=D:/tool/kafka/kafka_2.13-2.6.0/logs

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
[2023-12-01 15:53:40,535] INFO [TransactionCoordinator id=0] Starting up. (kafka.coordinator.transaction.TransactionCoordinator)
[2023-12-01 15:53:40,537] INFO [Transaction Marker Channel Manager 0]: Starting (kafka.coordinator.transaction.TransactionMarkerChannelManager)
[2023-12-01 15:53:40,537] INFO [TransactionCoordinator id=0] Startup complete. (kafka.coordinator.transaction.TransactionCoordinator)
[2023-12-01 15:53:40,558] INFO [ExpirationReaper-0-AlterAcls]: Starting (kafka.server.DelayedOperationPurgatory$ExpiredOperationReaper)
[2023-12-01 15:53:40,581] INFO [/config/changes-event-process-thread]: Starting (kafka.common.ZkNodeChangeNotificationListener$ChangeEventProcessThread)
[2023-12-01 15:53:40,590] INFO [SocketServer brokerId=0] Starting socket server acceptors and processors (kafka.network.SocketServer)
[2023-12-01 15:53:40,593] INFO [SocketServer brokerId=0] Started data-plane acceptor and processor(s) for endpoint : ListenerName(PLAINTEXT) (kafka.network.SocketServer)
[2023-12-01 15:53:40,593] INFO [SocketServer brokerId=0] Started socket server acceptors and processors (kafka.network.SocketServer)
[2023-12-01 15:53:40,596] INFO Kafka version: 2.6.0 (org.apache.kafka.common.utils.AppInfoParser)
[2023-12-01 15:53:40,596] INFO Kafka commitId: 62abe01bee039651 (org.apache.kafka.common.utils.AppInfoParser)
[2023-12-01 15:53:40,597] INFO Kafka startTimeMs: 1701417220594 (org.apache.kafka.common.utils.AppInfoParser)
[2023-12-01 15:53:40,598] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
```

## 创建 topic

```
cd D:\tool\kafka\kafka_2.13-2.6.0

bin\windows\kafka-topics.bat --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
Created topic test.
```

## 查看主题

输入

```
$ bin\windows\kafka-topics.bat --list --zookeeper localhost:2181

test
```




# kafka_2.12-3.6.0 windows10 install 实战（最终会有问题）

## 下载 kafka

访问 Apache Kafka 官方网站：https://kafka.apache.org/downloads

解压，我们放在 d 盘下面。

```
D:\tool\kafka\kafka_2.12-3.6.0
λ ls
bin/  config/  kafka_2.12-3.6.0/  kafka_2.12-3.6.0.tar  libs/  LICENSE  licenses/  NOTICE  site-docs/
```

## 配置 zookeeper

进入 `D:\tool\kafka\kafka_2.12-3.6.0\config` 目录找到文件 `server.properties` 并打开

做下几个编辑：

```properties
# 日志路径
log.dirs=D:/tool/kafka/kafka_2.12-3.6.0/logs

# zk 地址（默认可以保持不变）
zookeeper.connect=localhost:2181
```

Kafka会按照默认，在 9092 端口上运行，并连接zookeeper的默认端口：2181

注意：这里的 log.dirs 需要使用 `/`，不然应该是会出现转义问题，导致启动报错。

## 运行 zk

我们到根目录：

```
cd D:\tool\kafka\kafka_2.12-3.6.0
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
λ .\bin\windows\kafka-server-start.bat .\config\server.properties
[2023-12-01 15:17:52,959] INFO Registered kafka:type=kafka.Log4jController MBean (kafka.utils.Log4jControllerRegistration$)
[2023-12-01 15:17:53,238] INFO Setting -D jdk.tls.rejectClientInitiatedRenegotiation=true to disable client-initiated TLS renegotiation (org.apache.zookeeper.common.X509Util)
[2023-12-01 15:17:53,306] INFO starting (kafka.server.KafkaServer)
[2023-12-01 15:17:53,307] INFO Connecting to zookeeper on localhost:2181 (kafka.server.KafkaServer)
[2023-12-01 15:17:53,318] INFO [ZooKeeperClient Kafka server] Initializing a new session to localhost:2181. (kafka.zookeeper.ZooKeeperClient)
[2023-12-01 15:17:53,323] INFO Client environment:zookeeper.version=3.8.2-139d619b58292d7734b4fc83a0f44be4e7b0c986, built on 2023-07-05 19:24 UTC (org.apache.zookeeper.ZooKeeper)
[2023-12-01 15:17:53,325] INFO Client environment:host.name=d (org.apache.zookeeper.ZooKeeper)
[2023-12-01 15:17:53,326] INFO Client environment:java.version=1.8.0_371 (org.apache.zookeeper.ZooKeeper)
[2023-12-01 15:17:53,326] INFO Client environment:java.vendor=Oracle Corporation (org.apache.zookeeper.ZooKeeper)
[2023-12-01 15:17:53,326] INFO Client environment:java.home=D:\tool\jdk\jdk-1.8\jre (org.apache.zookeeper.ZooKeeper)
.....
.....

[2023-12-01 15:17:54,487] INFO [TransactionCoordinator id=0] Starting up. (kafka.coordinator.transaction.TransactionCoordinator)
[2023-12-01 15:17:54,487] INFO [TxnMarkerSenderThread-0]: Starting (kafka.coordinator.transaction.TransactionMarkerChannelManager)
[2023-12-01 15:17:54,487] INFO [TransactionCoordinator id=0] Startup complete. (kafka.coordinator.transaction.TransactionCoordinator)
[2023-12-01 15:17:54,534] INFO [ExpirationReaper-0-AlterAcls]: Starting (kafka.server.DelayedOperationPurgatory$ExpiredOperationReaper)
[2023-12-01 15:17:54,565] INFO [/config/changes-event-process-thread]: Starting (kafka.common.ZkNodeChangeNotificationListener$ChangeEventProcessThread)
[2023-12-01 15:17:54,565] INFO [SocketServer listenerType=ZK_BROKER, nodeId=0] Enabling request processing. (kafka.network.SocketServer)
[2023-12-01 15:17:54,565] INFO Awaiting socket connections on 0.0.0.0:9092. (kafka.network.DataPlaneAcceptor)
[2023-12-01 15:17:54,581] INFO Kafka version: 3.6.0 (org.apache.kafka.common.utils.AppInfoParser)
[2023-12-01 15:17:54,581] INFO Kafka commitId: 60e845626d8a465a (org.apache.kafka.common.utils.AppInfoParser)
[2023-12-01 15:17:54,581] INFO Kafka startTimeMs: 1701415074581 (org.apache.kafka.common.utils.AppInfoParser)
[2023-12-01 15:17:54,581] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
[2023-12-01 15:17:55,145] INFO [zk-broker-0-to-controller-alter-partition-channel-manager]: Recorded new controller, from now on will use node d:9092 (id: 0 rack: null) (kafka.server.BrokerToControllerRequestThread)
[2023-12-01 15:17:55,160] INFO [zk-broker-0-to-controller-forwarding-channel-manager]: Recorded new controller, from now on will use node d:9092 (id: 0 rack: null) (kafka.server.BrokerToControllerRequestThread)
```


# kafka 创建 topic 实战

## 创建

重新打开一个命令行。

```
cd D:\tool\kafka\kafka_2.12-3.6.0\bin\windows
```

执行命令：

```
.\kafka-topics.bat --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
```


直接报错命令不正确？

```
@echo off
rem Licensed to the Apache Software Foundation (ASF) under one or more
rem contributor license agreements.  See the NOTICE file distributed with
rem this work for additional information regarding copyright ownership.
rem The ASF licenses this file to You under the Apache License, Version 2.0
rem (the "License"); you may not use this file except in compliance with
rem the License.  You may obtain a copy of the License at
rem
rem     http://www.apache.org/licenses/LICENSE-2.0
rem
rem Unless required by applicable law or agreed to in writing, software
rem distributed under the License is distributed on an "AS IS" BASIS,
rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
rem See the License for the specific language governing permissions and
rem limitations under the License.

"%~dp0kafka-run-class.bat" kafka.admin.TopicCommand %*
```


### 报错

```
D:\tool\kafka\kafka_2.12-3.6.0
λ bin\windows\kafka-topics.bat --create --topic mytopic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
命令语法不正确。
```

# chat

## Q: windows10 如何安装 kafka?

安装 Apache Kafka 可以分为以下几个步骤。请注意，以下步骤是基于我截至2022年1月的知识，具体步骤可能因Kafka版本的更新而略有不同。建议查阅最新的官方文档以获取准确的信息。

1. **准备工作**：
   - 确保你已经安装了 Java，并且JAVA_HOME环境变量已经正确配置。

2. **下载 Kafka**：
   - 访问 Apache Kafka 官方网站：https://kafka.apache.org/downloads
   - 下载最新版本的 Kafka。

3. **解压 Kafka**：
   - 将下载的 Kafka 压缩包解压到你选择的目录。

4. **配置 Zookeeper**（Kafka 依赖 Zookeeper）：
   - Kafka 使用 Zookeeper 来管理集群的元数据。
   
   你需要配置一个 Zookeeper 服务器。

   - 进入 Kafka 解压目录，找到 `config` 文件夹，复制 `zookeeper.properties` 并命名为 `zookeeper.properties`。
   - 打开 `zookeeper.properties` 文件，检查并修改 `dataDir` 为一个合适的目录，用于存储 Zookeeper 数据。

5. **启动 Zookeeper**：
   - 打开命令行，进入 Kafka 解压目录，执行以下命令启动 Zookeeper：
     ```
     bin\windows\zookeeper-server-start.bat config\zookeeper.properties
     ```

6. **配置 Kafka**：
   - 在 Kafka 解压目录下，找到 `config` 文件夹，复制 `server.properties` 并命名为 `server.properties`。
   - 打开 `server.properties` 文件，检查并修改 `log.dirs` 为一个合适的目录，用于存储 Kafka 数据。

7. **启动 Kafka 服务器**：
   - 在命令行中，进入 Kafka 解压目录，执行以下命令启动 Kafka 服务器：
     ```
     bin\windows\kafka-server-start.bat config\server.properties
     ```

8. **创建 Topic**（可选）：
   - 使用以下命令创建一个名为 `mytopic` 的新主题：
     ```
     bin\windows\kafka-topics.bat --create --topic mytopic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
     ```

9. **发送和接收消息**：
   - 使用以下命令启动一个生产者并发送消息：
     ```
     bin\windows\kafka-console-producer.bat --topic mytopic --bootstrap-server localhost:9092
     ```

   - 使用以下命令启动一个消费者接收消息：
     ```
     bin\windows\kafka-console-consumer.bat --topic mytopic --bootstrap-server localhost:9092
     ```

以上步骤应该能帮助你在 Windows 10 上安装和运行 Kafka。

请注意，实际部署中可能需要根据你的需求进行额外的配置和调整。


## topic 必须首先要创建才能使用 kafka 消息的发送和消费吗？

在 Windows 环境下，创建 Kafka 主题的步骤与在 Linux 或其他操作系统上基本相同，只是使用的命令行脚本稍有不同。

以下是在 Windows 上创建 Kafka 主题的步骤：

1. **打开命令行**：

   在 Windows 中，你可以使用 Command Prompt 或 PowerShell 打开命令行。

2. **导航到 Kafka 安装目录**：

   使用 `cd` 命令切换到 Kafka 的安装目录。假设 Kafka 解压后的目录为 `C:\kafka`，你可以执行以下命令：

   ```bash
   cd D:\tool\kafka\kafka_2.12-3.6.0
   ```

3. **创建主题**：

   使用 `kafka-topics.bat` 脚本来创建主题。
   
   例如，创建一个名为 `mytopic` 的主题：

   ```bash
   bin\windows\kafka-topics.bat --create --topic mytopic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
   ```

   上述命令中，`--partitions` 指定了主题的分区数，`--replication-factor` 指定了每个分区的复制因子。



4. **验证主题创建**：

   使用以下命令查看已创建的主题列表：

   ```bash
   bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
   ```

   确保你的主题（例如 `mytopic`）出现在列表中。

现在，你已经成功在 Windows 环境下创建了一个 Kafka 主题。接下来，你可以使用 Kafka 生产者和消费者来发送和接收消息。

### Q: 详细解释一下 --partitions

`--partitions` 是用于指定 Kafka 主题分区数的选项。

在 Kafka 中，每个主题可以被分成多个分区，这些分区是消息并行处理、水平扩展和容错的基本单位。

理解分区对于设计高性能和可扩展的 Kafka 系统至关重要。

以下是关于 `--partitions` 选项的详细解释：

- **分区的作用**：
  - 分区允许 Kafka 主题的消息并行处理，提高系统的吞吐量。每个分区在 Kafka 集群中的不同 broker 上维护，使得消息的处理可以同时在多个节点上进行。
  - 分区也提供了水平扩展性，允许主题存储的数据量超过单个节点的处理能力。

- **分区数量选择**：
  - 分区数量的选择应该基于你的系统需求和预期的并发处理能力。通常情况下，分区数应该大于或等于集群中可用的 broker 数量，以确保每个 broker 上都有工作负载。
  - 分区数也可以根据数据的负载和特性进行动态调整，但在运行中更改分区数可能需要谨慎处理，以避免影响现有数据的处理。

- **分区的消息顺序**：
  - 每个分区内的消息是有序的，但在不同分区之间的消息顺序是不保证的。这意味着在同一分区内，消息的顺序将被保留，但跨分区的消息可能会以不同的顺序到达。

- **分区的复制**：
  - 分区内的数据可以进行复制，以提供容错机制。`--replication-factor` 选项用于指定每个分区的复制因子，即在多少个 broker 上保留该分区的副本。

示例：
```bash
bin\windows\kafka-topics.bat --create --topic mytopic --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
```

上述示例中，`--partitions 3` 指定了 `mytopic` 主题将被分成 3 个分区。

你可以根据需要调整分区数，但请确保在分区数和复制因子上的选择是经过仔细考虑的，以满足你的系统要求。
 
###  kafka 参数 --replication-factor 详细介绍

`--replication-factor` 是 Kafka 主题创建时的一个重要参数，用于指定每个分区的数据副本数量。

这个参数决定了在 Kafka 集群中，每个分区的数据将在多少个 broker 上进行备份。

以下是关于 `--replication-factor` 参数的详细介绍：

- **作用**：
  - `--replication-factor` 参数定义了每个分区的数据副本数量，确保数据的可靠性和容错性。如果某个 broker 失效，仍然可以从其他副本中获取数据。
  - 副本的存在还提高了读取请求的并发性，因为可以从多个副本中读取相同的数据。

- **取值**：
  - `--replication-factor` 的值应该是一个正整数，表示每个分区数据的副本数量。通常情况下，建议将这个值设置为大于等于 2，以确保有至少一个备份。在生产环境中，常见的值可能是 2 或 3，但具体取决于你的容错需求。

- **副本分布**：
  - Kafka 将副本分布在不同的 broker 上，确保在整个集群中均匀分布。每个分区的首个副本被称为领导副本（leader），其他副本为追随者副本（follower）。

- **数据同步**：
  - 如果一个或多个追随者副本与领导副本的数据不同步，将会进行数据同步。Kafka 使用复制协议确保所有副本都保持一致。

- **容错性**：
  - 当某个 broker 失效时，Kafka 会自动选择另一个存活的副本作为领导副本，确保数据的可用性和一致性。

示例：
```bash
bin\windows\kafka-topics.bat --create --topic mytopic --bootstrap-server localhost:9092 --partitions 3 --replication-factor 2
```

上述示例中，`--replication-factor 2` 表示为 `mytopic` 主题的每个分区创建两个数据副本。

确保选择的副本数量符合你的系统容错和可用性的需求。

# 参考资料

chat

* any list
{:toc}


---
layout: post
title: ETL-14-apache SeaTunnel Engine deployment
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 部署 SeaTunnel Engine

# 1. 下载

SeaTunnel Engine 是 SeaTunnel 的默认引擎。SeaTunnel 的安装包已经包含了 SeaTunnel Engine 的所有内容。

# 2. 配置 SEATUNNEL_HOME

您可以通过添加 /etc/profile.d/seatunnel.sh 文件来配置 SEATUNNEL_HOME。/etc/profile.d/seatunnel.sh 文件的内容如下：

```bash
export SEATUNNEL_HOME=${seatunnel 安装路径}
export PATH=$PATH:$SEATUNNEL_HOME/bin
```

请将 `${seatunnel 安装路径}` 替换为实际的 SeaTunnel 安装路径。

这将设置 SeaTunnel Engine 的安装路径，并将其 bin 目录添加到系统的 PATH 中。

# 3. 配置 SeaTunnel Engine JVM 选项

SeaTunnel Engine 支持两种设置 JVM 选项的方式。

- 将 JVM 选项添加到 $SEATUNNEL_HOME/bin/seatunnel-cluster.sh。

修改 $SEATUNNEL_HOME/bin/seatunnel-cluster.sh 文件，并在第一行添加 `JAVA_OPTS="-Xms2G -Xmx2G"`。

- 在启动 SeaTunnel Engine 时添加 JVM 选项。例如，seatunnel-cluster.sh -DJvmOption="-Xms2G -Xmx2G"

# 4. 配置 SeaTunnel Engine

SeaTunnel Engine 提供了许多功能，这些功能需要在 seatunnel.yaml 中进行配置。

## 4.1 备份计数

SeaTunnel Engine 基于 Hazelcast IMDG 实现集群管理。集群的状态数据（作业运行状态、资源状态）存储在 Hazelcast IMap 中。

在 Hazelcast IMap 中保存的数据将分布式存储在集群的所有节点上。Hazelcast 将对存储在 IMap 中的数据进行分区。每个分区可以指定备份数量。因此，SeaTunnel Engine 可以在不使用其他服务（例如 Zookeeper）的情况下实现集群高可用性。

备份计数用于定义同步备份的数量。

例如，如果设置为 1，分区的备份将放置在另一个成员上。如果设置为 2，则备份将放置在两个其他成员上。

我们建议备份计数的值为 min(1, max(5, N/2))。其中，N 是集群节点的数量。

```yml
seatunnel:
    engine:
        backup-count: 1
        # other config
```

## 4.2 槽位服务

槽位数量确定了集群节点可以并行运行的任务组数量。SeaTunnel Engine 是一个数据同步引擎，大多数作业都是 IO 密集型的。

建议使用动态槽位。

```yml
seatunnel:
    engine:
        slot-service:
            dynamic-slot: true
        # other config
```

## 4.3 检查点管理器

与 Flink 类似，SeaTunnel Engine 支持 Chandy-Lamport 算法。因此，SeaTunnel Engine 可以实现无数据丢失和重复的数据同步。

**间隔 interval**

两个检查点之间的间隔，单位是毫秒。如果在作业配置文件的环境中配置了 checkpoint.interval 参数，则此处设置的值将被覆盖。

**超时 timeout**

检查点的超时时间。如果在超时期限内无法完成检查点，将触发检查点失败。因此，作业将被恢复。

示例：

```yml
seatunnel:
    engine:
        backup-count: 1
        print-execution-info-interval: 10
        slot-service:
            dynamic-slot: true
        checkpoint:
            interval: 300000
            timeout: 10000
```

**检查点存储 checkpoint storage**

关于检查点存储，您可以查看 [检查点存储](https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/checkpoint-storage)。

## 4.4 历史作业过期配置

关于每个已完成的作业的信息，例如状态、计数器和错误日志，都存储在 IMap 对象中。

随着运行作业数量的增加，内存也会增加，最终内存可能会溢出。

因此，您可以调整 history-job-expire-minutes 参数来解决这个问题。

该参数的时间单位是分钟。默认值为 1440 分钟，即一天。

示例：

```yaml
seatunnel:
  engine:
    history-job-expire-minutes: 1440
```

# 5. 配置 SeaTunnel Engine 服务器

所有 SeaTunnel Engine 服务器的配置都在 hazelcast.yaml 文件中。

## 5.1 cluster-name

SeaTunnel Engine 节点使用集群名称来确定对方是否是与自身相同的集群。

如果两个节点之间的集群名称不同，SeaTunnel Engine 将拒绝服务请求。

## 5.2 网络

基于 Hazelcast，SeaTunnel Engine 集群是运行 SeaTunnel Engine 服务器的集群成员的网络。

集群成员会自动加入以形成一个集群。此自动加入是通过各种发现机制完成的，这些机制用于集群成员找到彼此。

请注意，在形成集群后，集群成员之间的通信始终通过 TCP/IP 进行，无论使用何种发现机制。

SeaTunnel Engine 使用以下发现机制。

**TCP**

您可以配置 SeaTunnel Engine 为一个完整的 TCP/IP 集群。有关配置详细信息，请参阅"通过 TCP 发现成员"部分。

示例配置如下 hazelcast.yaml：

```yml
hazelcast:
  cluster-name: seatunnel
  network:
    join:
      tcp-ip:
        enabled: true
        member-list:
          - hostname1
    port:
      auto-increment: false
      port: 5801
  properties:
    hazelcast.logging.type: log4j2
```

TCP 是在独立 SeaTunnel Engine 集群中的推荐方式。

另一方面，Hazelcast 提供了一些其他的服务发现方法。详细信息，请参考 [Hazelcast 网络](https://docs.hazelcast.com/imdg/4.1/clusters/setting-up-clusters)。

## 5.3 Map

MapStores 仅在配置在 Map 上时才与外部数据存储连接。本主题解释了如何使用 MapStore 配置 Map。有关详细信息，请参阅 Hazelcast Map。

type

imap 持久性的类型，目前只支持 hdfs。

namespace

用于区分不同业务的数据存储位置，如 OSS 存储桶名称。

clusterName

此参数主要用于集群隔离，我们可以使用此参数区分不同的集群，例如 cluster1、cluster2，同时也用于区分不同的业务。

fs.defaultFS

我们使用 hdfs api 读/写文件，因此使用此存储需要提供 hdfs 配置。

如果您使用 HDFS，可以进行如下配置：

```yml
map:
    engine*:
       map-store:
         enabled: true
         initial-mode: EAGER
         factory-class-name: org.apache.seatunnel.engine.server.persistence.FileMapStoreFactory
         properties:
           type: hdfs
           namespace: /tmp/seatunnel/imap
           clusterName: seatunnel-cluster
           storage.type: hdfs
           fs.defaultFS: hdfs://localhost:9000
```

如果没有 HDFS 并且您的集群只有一个节点，您可以配置为使用本地文件，如下所示：

```yml
map:
    engine*:
       map-store:
         enabled: true
         initial-mode: EAGER
         factory-class-name: org.apache.seatunnel.engine.server.persistence.FileMapStoreFactory
         properties:
           type: hdfs
           namespace: /tmp/seatunnel/imap
           clusterName: seatunnel-cluster
           storage.type: hdfs
           fs.defaultFS: file:///
```

如果您使用 OSS，可以进行如下配置：

```yml
map:
    engine*:
       map-store:
         enabled: true
         initial-mode: EAGER
         factory-class-name: org.apache.seatunnel.engine.server.persistence.FileMapStoreFactory
         properties:
           type: hdfs
           namespace: /tmp/seatunnel/imap
           clusterName: seatunnel-cluster
           storage.type: oss
           block.size: block size(bytes)
           oss.bucket: oss://bucket name/
           fs.oss.accessKeyId: OSS access key id
           fs.oss.accessKeySecret: OSS access key secret
           fs.oss.endpoint: OSS endpoint
           fs.oss.credentials.provider: org.apache.hadoop.fs.aliyun.oss.AliyunCredentialsProvider
```

# 6. 配置 SeaTunnel Engine 客户端

所有 SeaTunnel Engine 客户端的配置都在 hazelcast-client.yaml 中。

## 6.1 cluster-name

客户端必须具有与 SeaTunnel Engine 相同的集群名称。否则，SeaTunnel Engine 将拒绝客户端请求。

## 6.2 网络 

cluster-members

需要将所有 SeaTunnel Engine 服务器节点的地址添加到此处。

```yml
hazelcast-client:
  cluster-name: seatunnel
  properties:
      hazelcast.logging.type: log4j2
  network:
    cluster-members:
      - hostname1:5801
```

# 7. 启动 SeaTunnel Engine 服务器节点

可以通过使用 -d 选项启动守护进程。

```bash
mkdir -p $SEATUNNEL_HOME/logs
./bin/seatunnel-cluster.sh -d
```

日志将写入 $SEATUNNEL_HOME/logs/seatunnel-engine-server.log

# 8. 安装 SeaTunnel Engine 客户端

只需将 SeaTunnel Engine 节点上的 $SEATUNNEL_HOME 目录复制到客户端节点，并像 SeaTunnel Engine 服务器节点一样配置 SEATUNNEL_HOME。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/deployment

* any list
{:toc}
---
layout: post
title: ETL-04-SeaTunnel 集群安装部署实战笔记 cluster-mode-install in action
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 集群准备工作

![准备工作](https://blog.csdn.net/jenya007/article/details/132599219)

# 2.SeaTunnel 安装

## (1)下载seatunnel安装包 

[Apache SeaTunnel](https://seatunnel.incubator.apache.org/download)

## (2)解压下载好的tar.gz包

```
tar -zxvf /export/server/apache-seatunnel-2.3.3-bin.tar.gz -C ./
```

## (3)查看Seatunnel使用的脚本


cd /export/server/apache-seatunnel-2.3.3目录下

```
install-plugin.sh                              --安装连接器脚本
seatunnel-cluster.sh                           -–集群模式启动脚本
seatunnel-cluster.sh                           --本地模式启动脚本
start-seatunnel-flink-13-connector-v2.sh       –-flink1.2-1.4版本引擎启动脚本
start-seatunnel-flink-15-connector-v2.sh       –-flink1.5-1.6版本引擎启动脚本
start-seatunnel-spark-2-connector-v2.sh        –-saprk2.x版本引擎启动脚本
start-seatunnel-spark-3-connector-v2.sh        –-saprk3.x版本引擎启动脚本
```

## (4)下载连接器

```
cd /export/server/apache-seatunnel-2.3.3
./bin/install-plugin.sh
```

# 3.配置环境变量

在/etc/profile.d/seatunnel.sh 中配置环境变量

这里其实应该是修改 /etc/profile，添加配置：

```
export SEATUNNEL_HOME=/export/server/apache-seatunnel-2.3.3
export PATH=$PATH:$SEATUNNEL_HOME/bin
```

立刻生效并且验证。

```
source /etc/profile           #使环境变量生效
echo $SEATUNNEL_HOME  #查看变量是否生效
```

# 4.配置 SeaTunnel Engine JVM

将 JVM 选项添加到$SEATUNNEL_HOME/bin/seatunnel-cluster.sh第一行

```
JAVA_OPTS="-Xms2G -Xmx2G"
```

这个只是指定 jvm 的大小，结合实际调整。

# 5.配置SeaTunnel


配置$SEATUNNEL_HOME/config/seatunnel.yaml文件

eg:

```yaml
seatunnel:
  engine:
    history-job-expire-minutes: 1440
    backup-count: 1
    queue-type: blockingqueue
    print-execution-info-interval: 60
    print-job-metrics-info-interval: 60
    slot-service:
      dynamic-slot: true
    checkpoint:
      interval: 10000
      timeout: 60000
      storage:
        type: hdfs
        max-retained: 3
        plugin-config:
          namespace: /tmp/seatunnel/checkpoint_snapshot
          storage.type: hdfs
          fs.defaultFS: hdfs://cdh01:8020 # Ensure that the directory has written permission
```

本地测试只用本地文件的方式，并且创建爱你对应的 checkpoint 文件夹

```
mkdir -p ~/bigdata/seatunnel/checkpoint
```

本地文件如下：

```yaml
seatunnel:
    engine:
        backup-count: 1
        queue-type: blockingqueue
        print-execution-info-interval: 60
        slot-service:
            dynamic-slot: true
        checkpoint:
            interval: 300000
            timeout: 10000
            storage:
                type: localfile
                max-retained: 3
                plugin-config:
                    # 这里改成 linux 的对应文件路径
                    namespace: C:\ProgramData\seatunnel\checkpoint\
```

# 6.配置SeaTunnel引擎

配置 $SEATUNNEL_HOME/config/hazelcast.yaml 文件

```yaml
hazelcast:
  cluster-name: seatunnel
  network:
    rest-api:
      enabled: true
      endpoint-groups:
        CLUSTER_WRITE:
          enabled: true
        DATA:
          enabled: true
    join:
      tcp-ip:
        enabled: true
        member-list:
          # 指定集群的对应集群 IP
          - ip1
          - ip2
          - ip3
    port:
      auto-increment: false
      port: 5801
  properties:
    hazelcast.invocation.max.retry.count: 20
    hazelcast.tcp.join.port.try.count: 30
    hazelcast.logging.type: log4j2
    hazelcast.operation.generic.thread.count: 50
```

# 7.配置 SeaTunnel 引擎服务器

配置 $SEATUNNEL_HOME/config/hazelcast-client.yaml 文件

cluster-name客户端必须与 SeaTunnel Engine相同。否则，SeaTunnel Engine 将拒绝客户端请求。

eg:

```yaml
hazelcast-client:
  cluster-name: seatunnel

  network:
    cluster-members:
      - localhost:5801
      - localhost:5802
      - localhost:5803
```

# 8.部署SeaTunnel分布式集群

## (1) 拷贝安装包和配置文件

把安装包+配置文件拷贝到其他项目。

```
cd /export/server
   scp -r apache-seatunnel-2.3.3/ root@cdh02:$PWD
   scp -r apache-seatunnel-2.3.3/ root@cdh03:$PWD

cd /etc/profile.d/
   scp /etc/profile.d/seatunnel.sh root@cdh02:$PWD
   scp /etc/profile.d/seatunnel.sh root@cdh03:$PWD
```

## (2)启动SeaTunnel集群

```bash
mkdir -p $SEATUNNEL_HOME/logs  -- 如果有请忽略
nohup $SEATUNNEL_HOME/bin/seatunnel-cluster.sh 2>&1 &   -- 每个节点启动集群
```

日志将写入 $SEATUNNEL_HOME/logs/seatunnel-engine-server.log

fake 测试验证：

```bash
#进入安装目录
$   cd /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3

# 启动服务
$   ./bin/seatunnel.sh --config ./config/v2.batch.config.template -e local
```

## (3)任务提交命令

```bash
$SEATUNNEL_HOME/bin/seatunnel.sh --config $SEATUNNEL_HOME/config/v2.batch.config.template
```

## (4)任务停止命令

在$SEATUNNEL_HOME/logs/seatunnel-engine-server.log日志中查找运行的job_id

```bash
${SEATUNNEL_HOME}/bin/seatunnel.sh -can 749188983002497026   --job_id
```

```bash
$SEATUNNEL_HOME/bin/stop-seatunnel-cluster.sh  -- 停止集群
```







# 参考资料

https://blog.csdn.net/jenya007/article/details/132599219


* any list
{:toc}
---
layout: post
title: Apache Flink-02-核心特性简介 为什么选择 flink?
date: 2018-11-29 07:32:26 +0800
categories: [Big Data]
tags: [big-data, calc-engine, apache, sh]
published: true
---

# 1. Flink的引入

这几年大数据的飞速发展，出现了很多热门的开源社区，其中著名的有 Hadoop、Storm，以及后来的 Spark，他们都有着各自专注的应用场景。

Spark 掀开了内存计算的先河，也以内存为赌注，赢得了内存计算的飞速发展。Spark 的火热或多或少的掩盖了其他分布式计算的系统身影。

就像 Flink，也就在这个时候默默的发展着。

在国外一些社区，有很多人将大数据的计算引擎分成了 4 代，当然，也有很多人不会认同。我们先姑且这么认为和讨论。

首先第一代的计算引擎，无疑就是 Hadoop 承载的 MapReduce。这里大家应该都不会对 MapReduce 陌生，它将计算分为两个阶段，分别为 Map 和 Reduce。对于上层应用来说，就不得不想方设法去拆分算法，甚至于不得不在上层应用实现多个 Job 的串联，以完成一个完整的算法，例如迭代计算。

由于这样的弊端，催生了支持 DAG 框架的产生。因此，支持 DAG 的框架被划分为第二代计算引擎。如 Tez 以及更上层的 Oozie。这里我们不去细究各种 DAG 实现之间的区别，不过对于当时的 Tez 和 Oozie 来说，大多还是批处理的任务。

接下来就是以 Spark 为代表的第三代的计算引擎。第三代计算引擎的特点主要是 Job 内部的 DAG 支持（不跨越Job），以及强调的实时计算。在这里，很多人也会认为第三代计算引擎也能够很好的运行批处理的 Job。

随着第三代计算引擎的出现，促进了上层应用快速发展，例如各种迭代计算的性能以及对流计算和 SQL 等的支持。Flink 的诞生就被归在了第四代。这应该主要表现在 Flink 对流计算的支持，以及更一步的实时性上面。当然Flink 也可以支持 Batch 的任务，以及 DAG 的运算。

首先，我们可以通过下面的性能测试初步了解两个框架的性能区别，它们都可以基于内存计算框架进行实时计算，所以都拥有非常好的计算性能。经过测试，Flink计算性能上略好。 

迭代次数（纵坐标是秒，横坐标是次数）

![迭代](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9ub3RlLnlvdWRhby5jb20veXdzL3B1YmxpYy9yZXNvdXJjZS81MmFiOTBlOThlYmUxM2I1NjA3NDY0ODQ5MTMxYzU3MS94bWxub3RlLzNGOENDMkE0M0I2NzREMkJCMzM0OTkwN0ZBNUNENTUzLzMyNjg5?x-oss-process=image/format,png)

Spark和Flink全部都运行在Hadoop YARN上，性能为Flink > Spark > Hadoop(MR)，迭代次数越多越明显，性能上，Flink优于Spark和Hadoop最主要的原因是Flink支持增量迭代，具有对迭代自动优化的功能。 

# 2. Flink 简介

很多人可能都是在 2015 年才听到 Flink 这个词，其实早在 2008 年，Flink 的前身已经是柏林理工大学一个研究性项目， 在 2014 被 Apache 孵化器所接受，然后迅速地成为了 ASF（Apache Software Foundation）的顶级项目之一。

Flink 的最新版本目前已经更新到了 0.10.0 了，在很多人感慨 Spark 的快速发展的同时，或许我们也该为 Flink的发展速度点个赞。

Flink 是一个针对流数据和批数据的分布式处理引擎。它主要是由 Java 代码实现。目前主要还是依靠开源社区的贡献而发展。对 Flink 而言，其所要处理的主要场景就是流数据，批数据只是流数据的一个极限特例而已。再换句话说，Flink 会把所有任务当成流来处理，这也是其最大的特点。

Flink 可以支持本地的快速迭代，以及一些环形的迭代任务。并且 Flink 可以定制化内存管理。在这点，如果要对比 Flink 和 Spark 的话，Flink 并没有将内存完全交给应用层。

这也是为什么 Spark 相对于 Flink，更容易出现 OOM的原因（out of memory）。

就框架本身与应用场景来说，Flink 更相似与 Storm。如果之前了解过 Storm 或者Flume 的读者，可能会更容易理解 Flink 的架构和很多概念。

## flink 架构

下面让我们先来看下 Flink 的架构图。

![flink-struct](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9ub3RlLnlvdWRhby5jb20veXdzL3B1YmxpYy9yZXNvdXJjZS81MmFiOTBlOThlYmUxM2I1NjA3NDY0ODQ5MTMxYzU3MS94bWxub3RlLzM1Q0I3QzYyNzUxQzQ1MkJCREM4MTEwNUZGNzEzOTM2LzMyNjk1?x-oss-process=image/format,png)

我们可以了解到 Flink 几个最基础的概念，Client、JobManager 和 TaskManager。

Client 用来提交任务给JobManager，JobManager 分发任务给 TaskManager 去执行，然后 TaskManager 会心跳的汇报任务状态。

看到这里，有的人应该已经有种回到 Hadoop 一代的错觉。确实，从架构图去看，JobManager 很像当年的 JobTracker，TaskManager 也很像当年的 TaskTracker。

然而有一个最重要的区别就是 TaskManager 之间是是流（Stream）。

其次，Hadoop 一代中，只有 Map 和 Reduce 之间的 Shuffle，而对 Flink 而言，可能是很多级，并且在 TaskManager内部和 TaskManager 之间都会有数据传递，而不像 Hadoop，是固定的 Map 到 Reduce。

# 3. 技术的特点（可选）

关于Flink所支持的特性，我这里只是通过分类的方式简单做一下梳理，涉及到具体的一些概念及其原理会在后面的部分做详细说明。

## 3.1. 流处理特性

支持高吞吐、低延迟、高性能的流处理

支持带有事件时间的窗口（Window）操作

支持有状态计算的Exactly-once语义

支持高度灵活的窗口（Window）操作，支持基于time、count、session，以及data-driven的窗口操作

支持具有Backpressure功能的持续流模型

支持基于轻量级分布式快照（Snapshot）实现的容错

一个运行时同时支持Batch on Streaming处理和Streaming处理

Flink在JVM内部实现了自己的内存管理

支持迭代计算

支持程序自动优化：避免特定情况下Shuffle、排序等昂贵操作，中间结果

## 3.2. API支持

对Streaming数据类应用，提供DataStream API

对批处理类应用，提供DataSet API（支持Java/Scala）

## 3.3. Libraries支持

支持机器学习（FlinkML）

支持图分析（Gelly）

支持关系数据处理（Table）

支持复杂事件处理（CEP）

## 3.4. 整合支持

支持Flink on YARN

支持HDFS

支持来自Kafka的输入数据

支持Apache HBase

支持Hadoop程序

支持Tachyon

支持ElasticSearch

支持RabbitMQ

支持Apache Storm

支持S3

支持XtreemFS

## 3.5. Flink 生态圈

一个计算框架要有长远的发展，必须打造一个完整的 Stack。不然就跟纸上谈兵一样，没有任何意义。

只有上层有了具体的应用，并能很好的发挥计算框架本身的优势，那么这个计算框架才能吸引更多的资源，才会更快的进步。

所以 Flink 也在努力构建自己的 Stack。

Flink 首先支持了 Scala 和 Java 的 API，Python 也正在测试中。Flink 通过 Gelly 支持了图操作，还有机器学习的FlinkML。Table 是一种接口化的 SQL 支持，也就是 API 支持，而不是文本化的 SQL 解析和执行。对于完整的 Stack我们可以参考下图。

![Flink生态圈](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9ub3RlLnlvdWRhby5jb20veXdzL3B1YmxpYy9yZXNvdXJjZS81MmFiOTBlOThlYmUxM2I1NjA3NDY0ODQ5MTMxYzU3MS94bWxub3RlL0NEMTFFN0Q0NDQ4RDQ3MjU4Rjk2NzAxRkUxNjMzOUFELzMyNjkz?x-oss-process=image/format,png)

Flink 为了更广泛的支持大数据的生态圈，其下也实现了很多 Connector 的子项目。

最熟悉的，当然就是与Hadoop HDFS 集成。其次，Flink 也宣布支持了 Tachyon、S3 以及 MapRFS。

不过对于 Tachyon 以及 S3 的支持，都是通过 Hadoop HDFS 这层包装实现的，也就是说要使用 Tachyon 和 S3，就必须有 Hadoop，而且要更改 Hadoop的配置（core-site.xml）。

如果浏览 Flink 的代码目录，我们就会看到更多 Connector 项目，例如 Flume 和 Kafka。

# 4. 安装

Flink 有三种部署模式，分别是 Local、Standalone Cluster 和 Yarn Cluster。

## 4.1. Local模式

对于 Local 模式来说，JobManager 和 TaskManager 会公用一个 JVM 来完成 Workload。

如果要验证一个简单的应用，Local 模式是最方便的。

实际应用中大多使用 Standalone 或者 Yarn Cluster，而local模式只是将安装包解压启动（./bin/start-local.sh）即可，在这里不在演示。

## 4.2. Standalone 模式

### 4.2.1. 下载

安装包下载地址：http://flink.apache.org/downloads.html

快速入门教程地址：

https://ci.apache.org/projects/flink/flink-docs-release-1.3/quickstart/setup_quickstart.html


### 4.2.2. 上传安装包到linux系统

使用rz命令

### 4.2.3. 解压

```
tar –zxvf flink-1.3.2-bin-hadoop26-scala_2.10.tgz
```

### 4.2.4. 重命名

```
mv flink-1.3.2 flink
```

### 4.2.5. 修改环境变量

切换到root用户配置

```
export FLINK_HOME=/home/hadoop/flink
export PATH=$PATH:$FLINK_HOME/bin
```

配置结束后切换会普通用户

```
source /etc/profile
```

### 4.2.6. 修改配置文件

修改flink/conf/masters

```
master1:8081
```

修改flink/conf/slaves

```
master1ha
 
master2
 
master2ha
```

修改flink/conf/flink-conf.yaml

```
taskmanager.numberOfTaskSlots: 2
 
jobmanager.rpc.address: master1
```

### 4.2.7. 启动flink

```
/home/Hadoop/flink/bin/start-cluster.sh
```

### 4.2.8. Flink 的 Rest API

Flink 和其他大多开源的框架一样，提供了很多有用的 Rest API。

不过 Flink 的 RestAPI，目前还不是很强大，只能支持一些 Monitor 的功能。Flink Dashboard 本身也是通过其 Rest 来查询各项的结果数据。在 Flink RestAPI 基础上，可以比较容易的将 Flink 的 Monitor 功能和其他第三方工具相集成，这也是其设计的初衷。

在 Flink 的进程中，是由 JobManager 来提供 Rest API 的服务。因此在调用 Rest 之前，要确定 JobManager 是否处于正常的状态。正常情况下，在发送一个 Rest 请求给 JobManager 之后，Client 就会收到一个 JSON 格式的返回结果。由于目前 Rest 提供的功能还不多，需要增强这块功能的读者可以在子项目 flink-runtime-web 中找到对应的代码。其中最关键一个类 WebRuntimeMonitor，就是用来对所有的 Rest 请求做分流的，如果需要添加一个新类型的请求，就需要在这里增加对应的处理代码。

下面我例举几个常用 Rest API。

1.查询 Flink 集群的基本信息: /overview。示例命令行格式以及返回结果如下：

$ curl http://localhost:8081/overview

```json
{"taskmanagers":1,"slots-total":16,"slots-available":16,"jobs-running":0,"jobs-finished":0,"jobs-cancelled":0,"jobs-failed":0}
```

2.查询当前 Flink 集群中的 Job 信息：/jobs。示例命令行格式以及返回结果如下：

$ curl http://localhost:8081/jobs

```js
{"jobs-running":[],"jobs-finished":
 
["f91d4dd4fdf99313d849c9c4d29f8977"],"jobs-cancelled":[],"jobs-failed":[]}
```

3.查询一个指定的 Job 信息: /jobs/jobid。这个查询的结果会返回特别多的详细的内容，这是我在浏览器中进行的测试，如下图：

### 4.2.9. 运行测试任务

```sh
./bin/flink run -m master1:8082 ./examples/batch/WordCount.jar --input hdfs://master1:9000/words.txt --output hdfs://master1:9000/clinkout
```

## 4.3. Flink 的 HA

首先，我们需要知道 Flink 有两种部署的模式，分别是 Standalone 以及 Yarn Cluster 模式。

对于 Standalone 来说，Flink 必须依赖于 Zookeeper 来实现 JobManager 的 HA（Zookeeper 已经成为了大部分开源框架 HA 必不可少的模块）。

在 Zookeeper 的帮助下，一个 Standalone 的 Flink 集群会同时有多个活着的 JobManager，其中只有一个处于工作状态，其他处于 Standby 状态。当工作中的 JobManager 失去连接后（如宕机或 Crash），Zookeeper 会从Standby 中选举新的 JobManager 来接管 Flink 集群。

对于 Yarn Cluaster 模式来说，Flink 就要依靠 Yarn 本身来对 JobManager 做 HA 了。其实这里完全是 Yarn 的机制。

对于 Yarn Cluster 模式来说，JobManager 和 TaskManager 都是被 Yarn 启动在 Yarn 的 Container 中。

此时的JobManager，其实应该称之为 Flink Application Master。也就说它的故障恢复，就完全依靠着 Yarn 中的ResourceManager（和 MapReduce 的 AppMaster 一样）。

由于完全依赖了 Yarn，因此不同版本的 Yarn 可能会有细微的差异。这里不再做深究。

### 4.3.1. 修改配置文件

修改 flink-conf.yaml

```yml
state.backend: filesystem
 
state.backend.fs.checkpointdir: hdfs://master1:9000/flink-checkpoints
 
high-availability: zookeeper
 
high-availability.storageDir: hdfs://master1:9000/flink/ha/
 
high-availability.zookeeper.quorum: master1ha:2181,master2:2181,master2ha:2181
 
high-availability.zookeeper.client.acl: open
```

修改conf

```
server.1=master1ha:2888:3888
 
server.2=master2:2888:3888
 
server.3=master2ha:2888:3888
```

修改masters

```
master1:8082
 
master1ha:8082
```

修改slaves

```
master1ha
 
master2
 
master2ha
```

### 4.3.2. 启动

```
/home/Hadoop/flink/bin/start-cluster.sh
```

## 4.4. Yarn Cluster 模式

### 4.4.1. 引入

在一个企业中，为了最大化的利用集群资源，一般都会在一个集群中同时运行多种类型的 Workload。

因此 Flink也支持在 Yarn 上面运行。首先，让我们通过下图了解下 Yarn 和 Flink 的关系。

在图中可以看出，Flink 与 Yarn 的关系与 MapReduce 和 Yarn 的关系是一样的。Flink 通过 Yarn 的接口实现了自己的 App Master。

当在 Yarn 中部署了 Flink，Yarn 就会用自己的 Container 来启动 Flink 的 JobManager（也就是App Master）和 TaskManager。

![yarn](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9ub3RlLnlvdWRhby5jb20veXdzL3B1YmxpYy9yZXNvdXJjZS81MmFiOTBlOThlYmUxM2I1NjA3NDY0ODQ5MTMxYzU3MS94bWxub3RlLzQ2ODNBNDYxREY2QjQ2NUNBNjI1MEU2NERCNzRBQjIyLzMyNzAx?x-oss-process=image/format,png)

### 4.4.2. 修改环境变量

```
export HADOOP_CONF_DIR= /home/hadoop/hadoop/etc/hadoop
```

### 4.4.3. 部署启动

```
yarn-session.sh -d -s 2 -tm 800 -n 2
```

上面的命令的意思是，同时向Yarn申请3个container，其中 2 个 Container 启动 TaskManager（-n 2），每个TaskManager 拥有两个 Task Slot（-s 2），并且向每个 TaskManager 的 Container 申请 800M 的内存，以及一个ApplicationMaster（Job Manager）。

Flink部署到Yarn Cluster后，会显示Job Manager的连接细节信息。

Flink on Yarn会覆盖下面几个参数，如果不希望改变配置文件中的参数，可以动态的通过-D选项指定，如


```
-Dfs.overwrite-files=true -Dtaskmanager.network.numberOfBuffers=16368
```

```
jobmanager.rpc.address：因为JobManager会经常分配到不同的机器上
taskmanager.tmp.dirs：使用Yarn提供的tmp目录
parallelism.default：如果有指定slot个数的情况下
yarn-session.sh会挂起进程，所以可以通过在终端使用CTRL+C或输入stop停止yarn-session。
```

如果不希望Flink Yarn client长期运行，Flink提供了一种detached YARN session，启动时候加上参数-d或—detached

在上面的命令成功后，我们就可以在 Yarn Application 页面看到 Flink 的纪录。

如果在虚拟机中测试，可能会遇到错误。这里需要注意内存的大小，Flink 向 Yarn 会申请多个 Container，但是Yarn 的配置可能限制了 Container 所能申请的内存大小，甚至 Yarn 本身所管理的内存就很小。这样很可能无法正常启动 TaskManager，尤其当指定多个 TaskManager 的时候。因此，在启动 Flink 之后，需要去 Flink 的页面中检查下 Flink 的状态。这里可以从 RM 的页面中，直接跳转（点击 Tracking UI）。

这时候 Flink 的页面如图

yarn-session.sh 启动命令参数如下：

```
Usage:  
 
   Required  
     -n,--container <arg>   Number of YARN container to allocate (=Number of Task Managers) 
   Optional  
     -D <arg>                        Dynamic properties  
     -d,--detached                   Start detached  
     -jm,--jobManagerMemory <arg>    Memory for JobManager Container [in MB]  
     -nm,--name                      Set a custom name for the application on YARN  
     -q,--query                      Display available YARN resources (memory, cores)  
     -qu,--queue <arg>               Specify YARN queue.  
     -s,--slots <arg>                Number of slots per TaskManager  
     -st,--streaming                 Start Flink in streaming mode  
     -tm,--taskManagerMemory <arg>   Memory per TaskManager Container [in MB]  
```

### 4.4.4. 提交任务

之后，我们可以通过这种方式提交我们的任务

```
./bin/flink run -m yarn-cluster -yn 2 ./examples/batch/WordCount.jar
```

以上命令在参数前加上y前缀，-yn表示TaskManager个数。

在这个模式下，同样可以使用-m yarn-cluster提交一个"运行后即焚"的detached yarn（-yd）作业到yarn cluster。

### 4.4.5. 停止yarn cluster

```sh
yarn application -kill application_1507603745315_0001
```

# 参考资料

[阿龙学堂-Flink简介](https://blog.csdn.net/superzyl/article/details/79748092)

* any list
{:toc}
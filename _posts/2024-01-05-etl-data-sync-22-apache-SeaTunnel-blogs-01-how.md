---
layout: post
title: ETL-22-apache SeaTunnel 博客-01-SeaTunnel 简介
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# SeaTunnel 的前世今生

Apache SeaTunnel 是一个于 2017 年创建并开源的项目。它最初的命名是 Waterdrop，目前已经有很多用户在使用它了。

当时，它是基于 Spark 和 Flink 的一些配置项优化，比如当我们要从 Kafka 到 HDFS 或数据湖进行数据同步任务时，我们需要写对应的代码。

而 Waterdrop 则放弃了让用户编写代码的过程，通过配置文件自动生成对应的任务，然后将其提交给 Flink 和 Spark，让用户的使用更加便捷。

到了 2021 年，Waterdrop 成功捐赠到了 Apache 基金会，并加入了 Apache 孵化器，随后更名为 Apache SeaTunnel。目前，它已经经历了快两年的时间，并正在为成为一个顶级项目。

Apache SeaTunnel 的目标是打造一个易用、高性能的数据集成平台，支持实时流式和离线批处理。

# 如何使用 SeaTunnel

只需要列出一行命令即可，因为对于用户来说，需要两个点：启动和配置，而配置要在启动前完成，以下是一个示例的启动命令：

```bash
./bin/seatunnel.sh -c config/v2.batch.config.template -m local
```

很简单吧！只需要指定一个 Shell 文件，一个配置文件地址和一个启动模式即可，同步任务或数据处理任务就会被启动和运行。

后续的处理就不用持续关注了，任务会自动执行。

![start](https://img-blog.csdnimg.cn/img_convert/f1a70926fce1b04f3239efc5c541b311.png)

我们需要一个 Config ，也就是我们的配置。

这个配置是用来干什么呢？因为这是一个数据同步任务，要通过配置或者一些方式，告诉程序从哪里读取数据，然后再经过转换再输出或写入到哪里，整个逻辑都是通过 Config 进行生命式的处理。

比如说 Config 有对应的 Source，Source 是 JDBC，从 MySQL 写到 Hive ，中间增加不同的 Transform，包括对数据进行过滤或者重命名等。

当然， Transform 可能没有像 Flink 或者 Spark 那样强大的 join 能力，因为 join 对于数据分析或者计算可能会用得更多，但是对于 SeaTunnel 来说，它的定位是一个数据集成、数据同步的平台， Transform 可能更注重数据的转换，也支持一些类似于 SQL 的东西，这就是配置文件。

我们通过定义好的配置文件，执行命令来完成一个数据同步任务，这是使用方式。

话说回来，我们其实想要做的是一个简单又高效的数据集成工具，不需要再像以前去做很多编码的工作。

以前做数据集成或者数据同步的时候，我们需要去 Flink 上写对应的代码，把代码打包好提交到 Flink 集群上面，现在有了 SeaTunnel，只需要通过声明一个配置文件，就可以完全实现数据同步功能。

# SeaTunnel 核心特性

No code ，就是不需要编码。编码虽然有优势，也有劣势，不能高效、快速地产生一个数据同步任务。

分布式， 其他也会有数据集成，数据同步的工具，实际上也是通过 Config 的形式完成数据任务的处理，比如说 DataX 也是通过 Config 的形式去完成数据任务的处理和声明加处理，但是 SeaTunnel 优势是支持分布式，依托于 Flink 或者 Spark 实现分布式，在多个节点上运行同一个数据任务。支持自带的引擎，引擎上也可以支持分布式，一个任务可以通过多个节点的方式来运行，从而提高整个任务的运行效率。

刚刚说 Config 是支持运行在Spark、Flink，Apache SeaTunnel 的引擎上。我们要实现运行在三个不同的引擎上，对于程序端可能需要很多的一些处理，但是对于用户端来说，用户基本上是不用做改造，因为对于用户端，它就是一个 Config，所有的任务需要做的就只是切换 Shell 提交命令，比如说你需要提交到我们的引擎，那你就用 Zeta 引擎的一个提交命令；你要提交到 Flink 上，那你就用对应的提交命令，就能帮你把定义好的数据集成任务提交到对应的集群里面。

![核心特性](https://img-blog.csdnimg.cn/img_convert/e387d5ba749da8a95d308b283c4fa177.png)

配置都不用改，现有的架构即可，刚刚的 Config 也不用改，只需要改 Shell 的命令。这个就是一个任务在多个引擎上去运行的一个特性，当然 SeaTunnel 的特性不止于此。

流批一体，当 Config 认为这是一个批任务，或者说是一个流任务，需要把一个批任务转换成一个流任务，需要在文件里面换一个参数，就是定义这个任务是批任务，定义这个任务是流，其他的所有配置不用改了，就可以实现流批一体。

数据是一致性，我们需要去做一个相关的保障，这个在整体实现中有相应的部分。

集群容错的支持，比如说整个集群出现问题，或者说这个集群的 Master 出现问题了之后，我们需要保证我们的任务依然正常地运行？当然这个目前是在自己的引擎上做实现

CDC的支持，待会由社区的小伙伴为大家做一个详细的介绍。

高性能的数据同步，要让它高性能，首先代码没有 bug，不会让数据写入或者是数据读取会很慢。其次，需要是一个分布式，即多个节点去读这些数据才能达到高效率。此外，你的任务要支持拆分成多个子任务提供给不同的 Worker，这样才能达到每个 Worker 都做自己的工作，才能实现高性能的数据同步。

# SeaTunnel 流程解析

以 MySQL 到 StarRocks 举例，我们定义了 Source，Source 是 JDBC，在里面定义了 MySQL，默认为从 MySQL 里面读取数据，然后写入到 StarRocks 中，在 env 里面配置 bug 模式，它是一个离线的或者是批量的数据读取，而整个流程解析主要基于 Zeta 引擎做的，由于 Flink，Spark 社区是独立的开源项目，暂时没有办法在上面进行过多的改造，所以很多新的特性是放在 Zeta 引擎中。

![seaTunnel 流程解析](https://img-blog.csdnimg.cn/img_convert/5108350c407d78451540e5ecf86697a3.png)

## 1、config 编写

1、这个部分将涉及到 Config 文件的编写， Config 文件有多个 Source、 Transform 和 Sink ，不再是演示的文件中一个 Source 一个 Sink，实际上我们支持在一个配置文件中配置多个 Source 以及多个 Tranform 和多个 Sink，这样的话，同步任务的复杂度或者说整个同步任务的一些业务处理将在一个配置文件中处理完成，不需要写多个配置文件，开多个任务进行处理。

![config 编写](https://img-blog.csdnimg.cn/img_convert/3455826a056dc5edd58d5c067d48135f.png)

## 2、选择对应的执行引擎

我们可以选择 Zeta，Flink，Spark 等引擎，选择完毕之后将涉及到任务的提交，目前我们支持 Shell 形式，Http 目前处于计划中，后续将支持 SDK 的形式，比如我可以在 Java 的 SDK 里面声明 Job，通过完成 Config 或者是先查一个库，将你一些信息扩充到 SDK，由 SDK 提交到我们的集群，这样以来任务提交方式是多样性，和用户的系统做兼容，整合将会更加方便一些。

以 Zeta引擎为例，当任务提交到客户端时，我们会有一个对应的 Config 文件，我们通过 Shell 命令提交这个 Config，将启动一个类似于 Client 端的客户端，客户端将和 Master 节点自动化的做出对应的注册，不像 Flink 和 Spark 需要指定一个Master节点，这些 Master 节点是自动发现的，通过节点注册，将把用户定义好的 Config 解析到内部可以识别的Action，Action 定义为由一个 Source，Tranform 和 Sink 组成 Action，则它们将有多个 Action。

![执行流程](https://img-blog.csdnimg.cn/img_convert/8bd9bb0f3dfb67d674c91b0e1bead7ad.png)

比如你定义了三个Action，将会做对应的安全性的初始化，这个初始化可能是根据不同的连接器，比如类似这种 JDBC，Doris，StarRocks的各种连接器，它会有一套自己的一些初始化逻辑，你可以看一些你需要的资源是否已经准备就绪。

![执行引擎](https://img-blog.csdnimg.cn/img_convert/c223c93ffc7acb1d77dd1afb3f683cfa.png)

初始化完成之后，将把 Action 装载到逻辑计划中（这个逻辑计划定义了整个任务的运行流程），当 Client 将逻辑计划提交到 Master 后，Master 将经过优化生成对应的物理执行计划，物理执行计划体现了整个工作或者是数据的同步任务的信息，因为是一个分布式有多个节点，需要将物理执行计划拆分为多个任务，将每个子任务发送到不同的 Worker 节点上，这样 Worker 能运行对应的子任务，每个节点运行的子任务将由 Master 进行统一管理。

![任务执行](https://img-blog.csdnimg.cn/img_convert/bc49e6910256a7dba0ece477038c2059.png)

这里的 Master 被称为协调器，协调器会去监听或者是定期的接收任务的运行状态，进行整合，如果说某一个任务挂了能够恢复即能恢复，如果这个任务挂了会由 Master 去做对应的故障处理，整个 Taskgroup 在任务初始化阶段将协调器接收的 Task group 分发到不同的 Worker 里面。

## 3、 Worker 和 Master 之间如何注册?

这个也是自动化进行的，比如你有四个节点，不需要你去指定 Worker 和 Master，引擎将会为你自动指定 Master 和 Worker，为什么这样做呢？

同时这里会出现一个问题 Master 挂了怎么办？

![注册](https://img-blog.csdnimg.cn/img_convert/8b695567c3c6085982383faeb4b1fd92.png)

有很多中心式的平台或者是调度，一个数据计算的平台，都会存在单点故障的问题，Master 需要去管理对应的一个所有任务，需要知道所有任务的状态，因为 Master 是做统一处理，有一个Worker 挂了，那它上面的任务都挂了，整个任务都需要做一个数据恢复，用户不太接受，所以需要把 Master 的 Job 信息通过定时 vlog 写到 S3，HDFS 或者是本地做一个数据存储，Master挂了，Worker 会自动选出新的 Master，新的 Master将会把正在运行的数据信息重新统计，做对应的数据恢复，重新调度执行，这是数据引擎相关的东西，但是作为一个数据集成工具真正运行起来，不光要引擎，还要不同的连接器去做紧密配合。

## 4、连接器

刚刚以 JDBC 为例，支持并发读取数据，那 JDBC 还需要对数据分片，才能在不同的 Worker 和 Task 上并发读取对应的数据，所以 JDBC 需要支持数据分片，比如说这里定义了9个 Partition，并行度为3，每个 Task 里面将会读取对应三个分片的数据，由字段去做对应的分辨，这个是MySQL相关内容，写到 Starrocks，StarRocks 对应的 Stream load 的API加快数据写入，这样更快完成数据同步或者是数据集成。

![流程解析](https://img-blog.csdnimg.cn/img_convert/64eb7bb3001e7617794331f787ed81b5.png)

## 5、任务状态恢复

刚讲到 Master，如果任务挂了需要做数据恢复，不是说有 JOB 信息就恢复，每一个 JOB 都有自己的一些信息，比如这个 JOB 读了多少数据，写了多少数据，还有多少数据的事物没有提交，这些信息都需要知道的，才可以正常做任务的回滚，保证数据信息没有问题，那我们需要怎么去做？

![5、任务状态恢复](https://img-blog.csdnimg.cn/img_convert/fdb79e10feed12964fbda069cd1df93f.png)

这也是界内的常用的解决方案，大家都知道 Flink 有切换的机制，可以理解为一个作用，定时的把每个任务对应的状态做一个储存，异常恢复的时候，拿对应的状态去做回滚或者是做任务恢复，由此保证我们的异常能够正常恢复，再基于 Sink 的两个阶段提交，做到精准一次（exactly-once），以上就全部讲解了我们的整个运行流程。






# 参考资料

https://blog.csdn.net/weixin_54625990/article/details/130498289

* any list
{:toc}
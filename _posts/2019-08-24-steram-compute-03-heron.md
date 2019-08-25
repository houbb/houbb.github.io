---
layout: post
title: 流式计算-Twitter Heron-03
date:  2019-5-10 11:08:59 +0800
categories: [Stream]
tags: [stream, sh]
published: true
---

# 重要概念定义

在开始了解Heron的具体架构和设计之前，我们首先定义一些流计算以及在Heron设计中用到的基本概念：

Tuple：流计算任务中处理的最小单元数据的抽象。

Stream：由无限个Tuple组成的连续序列。

Spout：从外界数据源获得数据并生成Tuple的计算任务。

Bolt：处理上游Spout或者Bolt生成的Tuple的计算任务。

Topology：一个通过Stream将Spout和Bolt相连的处理Tuple的逻辑计算任务。

Grouping：流计算中的Tuple分发策略。

在Tuple通过Stream传递到下游Bolt的过程中，Grouping策略决定了如何将一个Tuple路由给一个具体的Bolt实例。

典型的Grouping策略有：随机分配、基于Tuple内容的分配等。

Physical Plan：基于Topology定义的逻辑计算任务以及所拥有的计算资源，生成的实际运行时信息的集合。

# 处理语义

在以上流处理基本概念的基础上，我们可以构建出流处理的三种不同处理语义：

至多一次（At-Most-Once）： 尽可能处理数据，但不保证数据一定会被处理。吞吐量大，计算快但是计算结果存在一定的误差。

至少一次（At-Least-Once）：在外部数据源允许Replay（重演）的情况下，保证数据至少被处理一次。在出现错误的情况下会重新处理该数据，可能会出现重复处理多次同一数据的情况。保证数据的处理但是延迟升高。

仅有一次（Exactly-Once）：每一个数据确保被处理且仅被处理一次。结果精确但是所需要的计算资源增多并且还会导致计算效率降低。

从上可知，三种不同的处理模式有各自的优缺点，因此在选择处理模式的时候需要综合考量一个Topology对于吞吐量、延迟、结果误差、计算资源的要求，从而做出最优的选择。目

前的Heron已经实现支持至多一次和至少一次语义，并且正在开发对于仅有一次语义的支持。

# Heron系统概览

保持与Storm接口（API）兼容是Heron的设计目标之一。

因此，Heron的数据模型与Storm的数据模型基本保持一致。

每个提交给Heron的Topology都是一个由Spout和Bolt这两类结点（Vertex）组成的，以Stream为边（Edge）的有向无环图（Directed acyclic graph）。

其中Spout结点是Topology的数据源，它从外部读取Topology所需要处理的数据，常见的如kafka-spout，然后发送给后续的Bolt结点进行处理。

Bolt节点进行实际的数据计算，常见的运算如Filter、Map以及FlatMap等。

我们可以把Heron的Topology类比为数据库的逻辑查询计划。

这种逻辑上的计划最后都要变成实质上的处理计划才能执行。

用户在编写Topology时指定每个Spout和Bolt任务的并行度和Tuple在Topology中结点间的分发策略（Grouping）。

所有用户提供的信息经过打包算法（Pakcing）的计算，这些Spout和Bolt任务（task）被分配到一批抽象容器中。

最后再把这些抽象容器映射到真实的容器中，就可以生成一个物理上可执行的计划（Physical plan），它是所有逻辑信息（拓扑图、并行度、计算任务）和运行时信息（计算任务和容器的对应关系、实际运行地址）的集合。

# 整体结构

## 整体架构

总体上，Heron的整体架构如图1所示。

![image](https://user-images.githubusercontent.com/18375710/63644559-4dd10100-c71e-11e9-8c6b-1051aac595d8.png)


用户通过命令行工具（Heron-CLI）将Topology提交给Heron Scheduler。

再由Scheduler对提交的Topology进行资源分配以及运行调度。

在同一时间，同一个资源平台上可以运行多个相互独立Topology。

## 对比 Storm

与Storm的Service架构不同，Heron是Library架构。

Storm在架构设计上是基于服务的，因此需要设立专有的Storm集群来运行用户提交的Topology。

在开发、运维以及成本上，都有诸多的不足。

而Heron则是基于库的，可以运行在任意的共享资源调度平台上。最大化地降低了运维负担以及成本开销。

目前的Heron支持Aurora、YARN、Mesos以及EC2，而Kubernetes和Docker等目前正在开发中。

通过可扩展插件Heron Scheduler，用户可以根据不同的需求及实际情况选择相应的运行平台，从而达到多平台资源管理器的支持。

## 被提交的任务内部

而被提交运行Topology的内部结构如图2所示，不同的计算任务被封装在多个容器中运行。

这些由调度器调度的容器可以在同一个物理主机上，也可分布在多个主机上。

其中每一个Topology的第一个容器（容器0）负责整个Topology的管理工作，主要运行一个Topology Master进程；

其余各个容器负责用户提交的计算逻辑的实现，每个容器中主要运行一个Stream Manager进程，一个Metrics Manager进程，以及多个Instance进程。

每个Instance都负责运行一个Spout或者Bolt任务（task）。

对于Topology Master、Stream Manager以及Instance进程的结构及重要功能，我们会在本文的后面章节进行详细的分析。

![image](https://user-images.githubusercontent.com/18375710/63644571-ae603e00-c71e-11e9-8c23-0fe172781a05.png)

# 状态（State）存储和监控

Heron的State Manager是一个抽象的模块，它在具体实现中可以是ZooKeeper或者是文件系统。

它的主要作用是保存各个Topology的各种元信息：

Topology的提交者、提交时间、运行时生成的Physical Plan以及Topology Master的地址等，从而为Topology的自我恢复提供帮助。

每个容器中的Metrics Manager负责收集所在容器的运行时状态指标（Metrics），并上传给监控系统。

当前Heron版本中，简化的监控系统集成在Topology Master中。

将来这一监控模块将会成为容器0中的一个独立进程。Heron还提供Heron-Tracker和Heron-UI 这两个工具来查看和监测一个数据中心中运行的所有Topology。

# 启动过程

在一个Topology中，Topology Master是整个Topology的元信息管理者，它维护着完整的Topology元信息。

而Stream Manager是每个容器的网关，它负责各个Instance之间的数据通信，以及和Topology Master之间的控制信令。

当用户提交Topology之后，Scheduler便会开始分配资源并运行容器。

每个容器中启动一个Heron Executor的进程，它区分容器0和其他容器，分别启动Topology Master或者Stream Manager等进程。

在一个普通容器中，Instance进程启动后会主动向本地容器的Stream Manager进行注册。

当Stream Manager收到所有Instance的注册请求后，会向Topology Master发送包含了自己的所负责的Instance的注册信息。

当Topology Master收到所有Stream Manager的注册信息以后，会生成一个各个Instance，Stream Manager的实际运行地址的Physical Plan并进行广播分发。

收到了Physical Plan的各个Stream Manager之间就可以根据这一Physical Plan互相建立连接形成一个完全图，然后开始处理数据。

Instance进行具体的Tuple数据计算处理。

Stream Manager则不执行具体的计算处理任务，只负责中继转发Tuple。

从数据流网络的角度，可以把Stream Manager理解为每个容器的路由器。

所有Instance之间的Tuple传递都是通过Stream Manager中继。

因此容器内的Instance之间通信是一跳（hop）的星形网络。

所有的Stream Manager都互相连接，形成Mesh网络。

容器之间的通信也是通过Stream Manager中继的，是通过两跳的中继完成的。


# TMaster

TMaster是Topology Master的简写。

与很多Master-Slave模式分布式系统中的Master单点处理控制逻辑的作用相同，TMaster作为Master角色提供了一个全局的接口来了解Topology的运行状态。同时，通过将重要的状态信息（Physical Plan）等记录到ZooKeeper中，保证了TMaster在崩溃恢复之后能继续运行。

实际产品中的TMaster在启动的时候，会在ZooKeeper的某一约定目录中创建一个Ephemeral Node来存储自己的IP地址以及端口，让Stream Manager能发现自己。Heron使用Ephemeral Node的原因包括：

避免了一个Topology出现多个TMaster的情况。这样就使得这个Topology的所有进程都能认定同一个TMaster；

同一Topology内部的进程能够通过ZooKeeper来发现TMaster所在的位置，从而与其建立连接。

## 核心功能

TMaster主要有以下三个功能：

1. 构建、分发并维护Topology的Physical Plan；

2. 收集各个Stream Manager的心跳，确认Stream Manager的存活；

3. 收集和分发Topology部分重要的运行时状态指标（Metrics）。

由于Topology的Physical Plan只有在运行时才能确定，因此TMaster就成为了构建、分发以及维护Physical Plan的最佳选择。

在TMaster完成启动和向ZooKeeper注册之后，会等待所有的Stream Manager与自己建立连接。

在Stream Manager与TMaster建立连接之后，Stream Manager会报告自己的实际IP地址、端口以及自己所负责的Instance地址与端口。

TMaster在收到所有Stream Manager报告的地址信息之后就能构建出Physical Plan并进行广播分发。

所有的Stream Manager都会收到由TMaster构建的Physical Plan，并且根据其中的信息与其余的Stream Manager建立两两连接。

只有当所有的连接都建立完成之后，Topology才会真正开始进行数据的运算和处理。

当某一个Stream Manager丢失并重连之后，TMaster会检测其运行地址及端口是否发生了改变；若改变，则会及时地更新Physical Plan并广播分发，使Stream Manager能够建立正确的连接，从而保证整个Topology的正确运行。

TMaster会接受Stream Manager定时发送的心跳信息并且维护各个Stream Manager的最近一次心跳时间戳。

心跳首先能够帮助TMaster确认Stream Manager的存活，其次可以帮助其决定是否更新一个Stream Manager的连接并且更新Physical Plan。

TMaster还会接受由Metrics Manager发送的一部分重要Metrics并且向Heron-Tracker提供这些Metrics。

Heron-Tracker可以通过这些Metrics来确定Topology的运行情况并使得Heron-UI能够基于这些重要的Metrics来进行监控检测。

典型的Metrics有：分发Tuple的次数，计算Tuple的次数以及处于backpressure状态的时间等。

非常值得注意的一点是，TMaster本身并不参与任何实际的数据处理。

因此它也不会接受和分发任何的Tuple。

这一设计使得TMaster本身逻辑清晰，也非常轻量，同时也为以后功能的拓展留下了巨大的空间。

**职责单一化。一个方法只完成一件事情，一个组件也只完成一件事。**

# Stream Manager 和反压（Back pressure）机制

## Stream Manager

Stmgr是Stream Manager的简写。

Stmgr管理着Tuple的路由，并负责中继Tuple。

当Stmgr拿到Physical Plan以后就能根据其中的信息知道与其余的Stmgr建立连接形成Mesh网络，从而进行数据中继以及Backpressure控制。

Tuple传递路径可以通过图3来说明，图3中容器1的Instance D（1D）要发送一个Tuple给容器4中的Instance C（4C），

这个Tuple经过的路径为：容器1的1D，容器1的Stmgr，容器4的Stmgr，容器4的4C。

又比如从3A到3B的Tuple经过的路径为：3A，容器3的Stmgr，3B。

与Internet的路由机制对比，Heron的路由非常简单，这得益于Stmgr之间两两相连，使得所有的Instance之间的距离不超过2跳。

![image](https://user-images.githubusercontent.com/18375710/63644628-d2704f00-c71f-11e9-9554-7a2fc2a26f63.png)


## Acking

Stmgr除了路由中继Tuple的功能以外，它还负责确认（Acking）Tuple已经被处理。

Acking的概念在Heron的前身Storm中已经存在。

**Acking机制的目的是为了实现At-Least-Once的语义。**

原理上，当一个Bolt实例处理完一个Tuple以后，这个Bolt实例发送一个特殊的Acking Tuple给这个bolt的上游Bolt实例或者Spout实例，向上游结点确认Tuple已经处理完成。

这个过程层层向上游结点推进，直到Spout结点。

实现上，当Acking Tuple经过Stmgr时候由异或（xor）操作标记Tuple，由异或操作的特性得知是否处理完成。

当一个Spout实例在一定时间内还没有收集到Acking Tuple，那么它将重发对应的数据Tuple。

Heron的Acking机制的实现与它的前任Storm一致。

## Back Pressure

Heron引入了反压（Back Pressure）机制，来动态调整Tuple的处理速度以避免系统过载。

一般来说，解决系统过载问题有三种策略：

1. 放任不管；

2. 丢弃过载数据；

3. 请求减少负载。

Heron采用了第三种策略，通过Backpressure机制来进行过载恢复，保证系统不会在过载的情况下崩溃。

### 处理过程

Backpressure机制触发过程如下：当某一个Bolt Instance处理速度跟不上Tuple的输入速度时，会造成负责向该Instance转发Tuple的Stmgr缓存不断堆积。

当缓存大小超过一个上限值（Hight Water Mark）时，该Stmgr会停止从本地的Spout中读取Tuple并向Topology中的其他所有Stmgr发送一个“开始Backpressure”的信息。

而其余的Stmgr在接收到这一消息时也会停止从他们所负责的Spout Instance处读取并转发Tuple。

至此，整个Topology就不再从外界读入Tuple而只处理堆积在内部的未处理Tuple。

而处理的速度则由最慢的Instance来决定。

在经过一定时间的处理以后，当缓存的大小减低到一个下限值（Low Water Mark）时，最开始发送“开始Backpressure”的Stmgr会再次发送“停止Backpressure”的信息，从而使得所有的Stmgr重新开始从Spout Instance读取分发数据。

而由于Spout通常是从具有允许重演（Replay）的消息队列中读取数据，因此即使冻结了也不会导致数据的丢失。

注意在Backpressure的过程中两个重要的数值：上限值（High Water Mark）和下限值（Low Water Mark）。

只有当缓存区的大小超过上限值时才会触发Backpressure，然后一直持续到缓存区的大小减低到下限值时。

这一设计有效地避免了一个Topology不停地在Backpressure状态和正常状态之间震荡变化的情况发展，一定程度上保证了Topology的稳定。

## 几种方式

当下游处理速度变慢后，通过反压机制，可以通知上游进行减速， 避免数据因buffer被塞满而丢失，并因此带来资源浪费。

### TCP 反压：

当一个HI 处理慢了后，则该HI的接收buffer会被填满， 紧接着本地SM的sending buffer被填满， ? 然后会传播到其他的SM和上游HI。

这个机制很容易实现，但在实际使用中，存在很多问题。

因为多个HI 共用SM， 不仅将上游的HI 降速了，也把下游的HI 降速。从而整个topology速度全部下架，并且长时间的降级。

### Spout 反压。

这个机制是结合TCP 反压机制， 一旦SM 发现一个或多个HI 速度变慢，立刻对本地spout进行降级， 停止从这些spout读取数据。

并且受影响的SM 会发送一个特殊的start backpressure message 给其他的sm，要求他们对spout进行本地降级。

一旦出问题的HI 恢复速度后，本地的SM 会发送 stop backpressure message 解除降级。

### Stage-by-Stage 反压

这个类似spout反压，但是一级一级向上反压。

Heron最后采用的是spout反压， 因为实现比较简单，而且降级响应非常迅速。 

并且可以很快定位到那个HI 处理速度慢了。 

每个socket channel都绑定了一个buffer，当buffer 的 queue size超过警戒水位时，触发反压，减少时，接触反压。

这种机制，不会丢弃tuple，除了机器宕机。

topology可以设置打开或关闭。

# Instance

Instance是整个Heron处理引擎的核心部分之一。

Topology中不论是Spout类型结点还是Bolt类型结点，都是由Instance来实现的。

不同于Storm的Worker设计，在当前的Heron中每一个Instance都是一个独立的JVM进程，通过Stmgr进行数据的分发接受，完成用户定义的计算任务。

独立进程的设计带来了一系列的优点：便于调试、调优、资源隔离以及容错恢复等。

同时，由于数据的分发传送任务已经交由Stmgr来处理，Instance可以用任何编程语言来进行实现，从而支持各种语言平台。

Instance采用双线程的设计，如图4所示。

一个Instance的进程包含Gateway以及Task Execution这两个线程。

Gateway线程主要控制着Instance与本地Stmgr和Metrics Manager之间的数据交换。

通过TCP连接，Gateway线程：

1. 接受由Stmgr分发的待处理Tuple；

2. 发送经Task Execution处理的Tuple给Stmgr；

3. 转发由Task Execution线程产生的Metrics给Metrics Manager。

不论是Spout还是Bolt，Gateway线程完成的任务都相同。

Task Execution线程的职责是执行用户定义的计算任务。

对于Spout和Bolt，Task Execution线程会相应地去执行open()和prepare()方法来初始化其状态。

如果运行的Instance是一个Bolt实例，那么Task Execution线程会执行execute()方法来处理接收到的Tuple；

如果是Spout，则会重复执行nextTuple()方法来从外部数据源不停地获取数据，生成Tuple，并发送给下游的Instance进行处理。

经过处理的Tuple会被发送至Gateway线程进行下一步的分发。

同时在执行的过程中，Task Execution线程会生成各种Metrics（tuple处理数量，tuple处理延迟等）并发送给Metrics Manager进行状态监控。

![image](https://user-images.githubusercontent.com/18375710/63644643-68a47500-c720-11e9-9b22-0887ad466209.png)

Gateway线程和Task Execution线程之间通过三个单向的队列来进行通信，分别是数据进入队列、数据发送队列以及Metrics发送队列。

Gateway线程通过数据进入队列向Task Execution线程传入Tuple；

Task Execution通过数据发送队列将处理完的Tuple发送给Gateway线程；

Task Execution线程通过Metrics发送队列将收集的Metric发送给Gateway线程。


# 为什么要重新设计Heron：

## （1）debug-ability 很差， 出现问题，很难发现

1.1 多个task运行在一个系统进程中， 很难定位问题。需要一个清晰的逻辑计算单元到物理计算单元的关系

## （2）需要一种更高级的资源池管理系统

2.1 可以和其他编程框架共享资源， 说白了，就是类似yarn/mesos， 而在Twitter就是Aurora

2.2 更简单的弹性扩容和缩容 集群

2.3 因为不同task，对资源需求是不一样的， 而storm会公平对待每个worker， 因此会存在worker浪费内存问题。当worker内存特别大时， 进行jstack或heap dump时，特别容易引起gc，导致被supervisor干掉

2.4 经常为了避免性能故障，常常进行超量资源分配， 原本100个core，分配了200个

## （3）认为Storm设计不合理的地方

3.1 一个executor 存在2个线程， 一个执行线程， 一个发送线程， 并且一个executor运行多个task， task的调度完全依赖来源的tuple， 很不方便确认哪个task出了问题。

3.2 因为多种task运行在一个worker中， 无法明确出每种task使用的资源， 也很难定位出问题的task，当出现性能问题或其他行为时， 常用就是重启topology， 重启后就好了，因为task进行了重新调度

3.3 日志打到同一个文件中，也很难查找问题，尤其是当某个task疯狂的打印日志时

3.4 当一个task挂掉了，直接会干掉worker，并强迫其他运行好的task被kill掉

3.5 最大的问题是，当topology某个部分出现问题时， 会影响到topology其他的环节

3.6 gc引起了大量的问题

3.7 一条消息至少经过4个线程， 4个队列， 这会触发线程切换和队列竞争问题

3.8 nimbus功能太多， 调度/监控/分发jar/metric report， 经常会成为系统的bottleneck

3.9 storm的worker没有做到资源保留和资源隔离， 因此存在一个worker会影响到另外的worker。 而现有的isolation调度会带来资源浪费问题。 Storm on Yarn也没有完全解决这个问题。

3.10 zookeeper 成为系统的瓶颈， 当集群规模增大时。 有些系统为了降低zk心态，新增了tracker，但tracker增加了系统运维难度。

3.11 nimbus 是系统单点

3.12 缺乏反压机制

3.12.1 当receiver忙不过来时， sender就直接扔弃掉tuple，

3.12.2 如果关掉acker机制， 那无法量化drop掉的tuple

3.12.3 因为上游worker执行的计算就被扔弃掉。

3.12.4. 系统会变的难以预测(less predictable.)

3.13 常常出现性能问题， 导致 tuple fail， tuple replay， 执行变慢

3.13.1 不良的replay， 任意一个tuple失败了，都会导致整个tuple tree fail， 不良的设计时（比如不重要的tuple失败），会导致tuple轻易被重发

3.13.2 当内存很大时，长时间的gc，导致处理延时，甚至被误杀

3.13.3 队列竞争

# 参考资料

[Heron：来自Twitter的新一代流处理引擎应用篇](https://blog.csdn.net/dev_csdn/article/details/78898866)

[深度揭秘Twitter的新一代流处理引擎Heron](http://www.sohu.com/a/197679282_355135)

[Twitter 开源了数据实时分析平台 Heron](https://www.oschina.net/news/73811/twitter-open-source-heron)

[Twitter新开源的Heron是否可以完全取代Storm？](http://www.raincent.com/content-85-6759-1.html)

[TOP100summit：【分享实录】Twitter 新一代实时计算平台Heron](https://segmentfault.com/a/1190000011679991)

[深度解析 Twitter Heron 大数据实时分析系统](https://blog.csdn.net/ldds_520/article/details/51891377)

* any list
{:toc}
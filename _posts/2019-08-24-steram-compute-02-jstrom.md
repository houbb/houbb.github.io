---
layout: post
title: 流式计算-JStorm-02
date:  2019-5-10 11:08:59 +0800
categories: [Stream]
tags: [stream, sh]
published: true
---

# JStorm

Alibaba [JStorm](http://120.25.204.125/)  is an enterprise fast and stable streaming process engine.

## Speed

Run program up to 4x faster than Apache Storm. 

It is easy to switch from record mode to mini-batch mode.

![speed](http://120.25.204.125/img/performance/performance1.png)

## Enterprise Exactly－Once

The Enterprise Exactly-once Framework has been used to in tons of application, especially in some critical billing system such as Cainiao, Alimama, Aliexpress and so on. 

it has been approved as stable and correct. 

What’s more, the performance is better than the old “At-least-once through acker”

## JStorm生态系统

JStorm 不仅是一个流媒体流程引擎。 

它意味着一个实时需求的解决方案，即整个实时生态系统。

![Jstorm](http://120.25.204.125/img/jstorm-ecosystem.png)

## Ease of Use

Contain the Apache Storm API, application is easy to migrate from Apache Storm to JStorm. 

Most of application basing Apache Storm 0.9.5 can directly run on JStorm 2.1.1 without recompile the code.

# 应用场景

JStorm处理数据的方式是基于消息的流水线处理， 因此特别适合无状态计算，也就是计算单元的依赖的数据全部在接受的消息中可以找到， 并且最好一个数据流不依赖另外一个数据流。

日志分析: 从日志中分析出特定的数据，并将分析的结果存入外部存储器如数据库。目前，主流日志分析技术就使用JStorm或Storm

管道系统： 将一个数据从一个系统传输到另外一个系统， 比如将数据库同步到 Hadoop

消息转化器： 将接受到的消息按照某种格式进行转化，存储到另外一个系统如消息中间件

统计分析器： 从日志或消息中，提炼出某个字段，然后做count或sum计算，最后将统计值存入外部存储器。中间处理过程可能更复杂。

# 为什么更快、性能提升的原因：

Zeromq 减少一次内存拷贝

增加反序列化线程

重写采样代码，大幅减少采样影响

优化ack代码

优化缓冲map性能

Java 比 clojure 更底层

# JStorm与其它产品的比较：

Flume 是一个成熟的系统，主要focus在管道上，将数据从一个数据源传输到另外一个数据源， 系统提供大量现成的插件做管道作用。当然也可以做一些计算和分析，但插件的开发没有Jstorm便捷和迅速。

S4 就是一个半成品，健壮性还可以，但数据准确性较糟糕，无法保证数据不丢失，这个特性让S4 大受限制，也导致了S4开源很多年，但发展一直不是很迅速。

AKKA 是一个actor模型，也是一个不错的系统，在这个actor模型基本上，你想做任何事情都没有问题，但问题是你需要做更多的工作，topology怎么生成，怎么序列化。数据怎么流（随机，还是group by）等等。

Spark 是一个轻量的内存MR， 更偏重批量数据处理。


# JStorm 组件对比

JStorm通过一系列基本元素实现实时计算的目标，其中包括topology，spout，bolt等。JStorm在模型上和MapReduce有很多相似的地方。

下表是JStorm组件和MapReduce组件的对比：

![image](https://user-images.githubusercontent.com/18375710/63637433-9bae2080-c6ae-11e9-9640-ffcd3a0561b4.png)

实时计算任务需要打包成Topology提交，和MapReduce Job相似，不同的是，MapReduce Job在计算完后就结束，而JStorm的Topology任务一旦提交，就永远不会结束，除非显示停止。

# JStorm系统架构

JStorm的系统架构如下所示：

![image](https://user-images.githubusercontent.com/18375710/63637465-dadc7180-c6ae-11e9-90d0-7944f85b4b02.png)

JStorm与Hadoop相似，保持了Master/Slaves简洁优雅的架构。

与Hadoop不同的是，JStorm的Master/Salves之间不能直接通过RPC来交换心跳信息，而是借助Zookeeper来实现。

这样的设计虽然引入了第三方依赖，但是简化了Nimbus/Supervisor的设计，同时也极大提高了系统的容错能力。

整个JStorm系统中共存三类不同的daemon进程，分别为Nimbus，Supervisor和Worker。

## Nimbus：JStorm的主控节点，作为调度器的角色。

Nimbus类似于MapReduce的JobTracker，负责接收和验证客户端提交的topology；分配任务；向ZK写入任务相关的元信息。

此外，Nimbus还负责通过ZK来监控节点和任务的健康情况。当有Supervisor节点变化和Worker进程出现问题时及时进行任务重新分配。

Nimbus分配任务的结果不是直接下发到Supervisor，而是通过ZK维护分配数据进行过渡。

特别地，JStorm 0.9.0领先Apache Storm实现了Nimbus HA，由于Nimbus是Stateless节点，所有的状态信息都交由ZK托管，所以HA相对比较简单，热备Nimbus subscribe ZK关于Master活跃状态数据，一旦发现Master出现问题即从ZK里恢复数据后可以立即接管。

从0.9.0开始，JStorm提供非常强大的调度功能，基本上可以满足大部分的需求，同时支持自定义任务调度策略。

JStorm的资源不再仅是Worker的端口，而从CPU/Memory/Disk/Port等四个维度综合考虑。

Nimbus任务调度算法如下：

0）优先使用自定义任务分配算法，当资源无法满足需求时，该任务放到下一级任务分配算法；

1）使用历史任务分配算法（如果打开使用历史任务属性），当资源无法满足需求时，该任务放到下一级任务分配算法；

2）使用默认资源平衡算法，计算每个Supervisor上剩余资源权值，取权值最高的Supervisor分配任务。

## Supervisor

JStorm的工作节点，作为Worker的代理角色，负责杀死worker或运行worker。

Supervisor类似于MapReduce的TaskTracker，subscribe ZK分配到该节点的任务数据。

Supervisor根据Nimbus的任务分配情况来启动/停止工作进程Worker。

Supervisor需要定期向ZK写入活跃端口信息以便Nimbus及时监控。

Supervisor不执行具体的数据处理任务，所有的数据处理任务都交给Worker。

## Worker

JStorm中的任务执行者，是Task的容器。

Worker类似于MapReduce的Task，所有实际的数据处理工作都在worker内执行完成。

Worker需要定期向Supervisor汇报心跳。

由于在同一个节点，同时为保持节点的无状态，Worker定期将状态信息写入到本地磁盘。

Supervisor通过读取本地磁盘状态信息完成心跳交互过程，Worker绑定一个独立端口，Worker内所有单元共享Worker的通信能力。

完整的Topology任务是由分布在多个Supervisor节点上的Worker进程（JVM）来执行，每个Worker都执行且仅执行Topology任务的一个子集。

## Task：真正任务的执行者

执行具体数据处理实体，也就是用户实现的Spout/Blot实例。

## ZK：是整个系统的协调者

Nimbus、Supervisor和Worker均为Stateless节点，支持Fail-Fast，这为JStorm的扩展性和容错能力提供了很好的保障。

# JStorm基本概念

## stream

在JStorm中有对于流stream的抽象，流是一个不间断的无界的连续tuple。

在Topology中，spout是stream的源头，负责从特定数据源stream发射；

bolt接收任意多个stream输入，然后进行数据加工处理。

bolt还可以发射出新的stream到下游的bolt。

## spout

JStorm的消息源。

JStorm认为每个stream都有一个stream源，也就是原始元组的源头，所以它将这个源头抽象为spout，spout可能是连接消息中间件（如MetaQ， Kafka， TBNotify等），并不断发出消息，也可能是从某个队列中不断读取队列元素并装配为tuple发射。

## bolt

JStorm的消息处理者。

bolt用于为Topology进行消息处理，它可以执行查询、过滤、聚合及各种复杂运算操作。

Bolt的消息处理结果可以作为下游Bolt的输入不断迭代。

bolt可以消费任意数量的输入流，只要将流方向导向该bolt。

## Tuple

JStorm将流中数据抽象为tuple，存在于任意两个有数据交互的组件（Spout/Bolt）之间。

一个tuple就是一个值列表 value list，list中的每个value都有一个name，并且该value可以是基本类型，字符类型，字节数组等，当然也可以是其他可序列化的类型。简单来说，Tuple就是一组实现了序列化器带有名称的Java对象集合。

拓扑的每个节点都要说明它所发射出的元组的字段的name，其他节点只需要订阅该name就可以接收处理。

## topology

拓扑是JStorm中最高层次的一个抽象概念，它可以被提交到JStorm集群执行，一个拓扑就是一个数据流转换图。

计算任务Topology是由不同的Spout和Bolt通过Stream连接起来的DAG图。

典型的topology的结构示意图如下所示：

![image](https://user-images.githubusercontent.com/18375710/63637579-407d2d80-c6b0-11e9-851b-83327e2bffd6.png)

从整个Topology上看，Spout/Bolt可以看作DAG的节点，Stream是连接不同节点之间的有向边，Tuple则是流过Stream的数据集合。

下面是一个Topology内部Spout和Bolt之间的数据流关系：

![image](https://user-images.githubusercontent.com/18375710/63637591-6b678180-c6b0-11e9-9cb2-51c06546bae5.png)


Topology中每一个计算组件（Spout和Bolt）都有一个并行度，在创建Topology时指定（默认为1），JStorm在集群内分配对应个数的线程Task并行。

## 资源slot

在JStorm中，资源类型分为4种：CPU、Memory、Disk、Port，不再局限于Storm的port。 

即一个supervisor可以提供多少个CPU slot，多少个Memory slot， 多少个Disk slot， 多少个Port slot。

一个worker就消耗一个Port slot， 默认一个task会消耗一个CPU slot和一个Memory slot

### 不同场景

当task执行任务较重时，可以申请更多的CPU slot，

当task需要更多内存时，可以申请更多的内存slot，

当task 磁盘读写较多时，可以申请磁盘slot，则该磁盘slot给该task独享

# 数据流分发策略

spout/bolt都会有多个线程来并发执行，那么如何在两个组件（Spout和Bolt）之间发送Tuple呢？

JStorm通过定义Topology时为每个bolt指定输入stream以及指定提供的若干种数据流分发（Stream Grouping）策略来解决这个问题。

## JStorm提供了8种数据流分发策略：

### Shuffle Grouping：随机分组

随机派发stream里面的tuple，保证每个bolt接收到的tuple数目大致相同。通过轮询随机的方式，使得下游bolt之间接收到的tuple数目差值不超过1。

### Fields Grouping：按字段分组

具有同样字段值的tuple会被分到相同的bolt里的Task，不同字段则会被分配到不同的Task中。

### All Grouping：广播分组

每一个tuple都能被所有的bolt收到。

### Global Grouping：全局分组

tuple被分配到bolt中id值最小的一个task中。

### Non Grouping：不分组

tuple会按完全随机的方式分发到下游bolt。

### Direct Grouping：直接分组

tuple需要指定由bolt的哪个task来接收。只有被声明为Direct Stream的消息流可以声明这种分组方法。

### Local or Shuffle Grouping

基本同Shuffle Grouping

### Custom Grouping

用户自定义分组策略

CustomStreamGrouping 是自定义分组策略时用户需要实现的接口。

# 计算组件映射到计算资源

Topology的计算组件（spout/bolt）如何映射到计算资源上？

首先先明确Worker/Executor/Task之间的关系：

## Worker

完整的Topology任务是由分布在Supervisor节点上的多个Worker进程（JVM）来执行的。

每个Worker都执行且仅执行Topology任务的一个子集。

## Executor

Worker内部会有一个或多个Executor，每个Executor对应一个线程。

Executor包括SpoutExecutor和BoltExecutor，同一个Worker里所有的Executor只能属于某一个Topology里的执行单元。

## Task

执行具体数据的处理实体。

也是用户实现的spout/bolt实例。

一个Excutor对应多个Task，在定义Topology可以指定Task。默认Executor和Task一一对应。这就是说，系统中Executor数量一定是小于等于Task数量（#Executor≤#Task）。

## 例子

下图给出了一个简单的例子：

![image](https://user-images.githubusercontent.com/18375710/63637659-49baca00-c6b1-11e9-86a0-0a8293ae6c47.png)

上半部分描述的是Topology结构及相关说明，其中定义了整个Topology的worker=2、DAG关系、各个计算组件的并行度；下半部分描述了Topology的Task在Supervisor节点的分布情况。从中可以看出Topology到Executor之间的关系。

0、Worker数在提交Topology时在配置文件中指定；

例：#Worker=2

1、执行线程/Executor数在定义Topology的各计算组件并行度时决定，可以不指定，默认为1。其中各个计算组件的并行度之和即为该Topology执行线程总数。

例：#Executor=sum(#parallelism hint)=2+2+6=10

2、Task数目也在定义Toplogy时确定，若不指定默认每个Executor线程对应一个Task，若指定Task数目会在指定数目的线程里平均分配。

例：#Task=sum(#task)=2+4+6=12，其中Executor4={Task0,Task1}

# Ack机制

Ack 机制是storm整个技术体系中非常闪亮的一个创新点， JStorm很好的继承了这个机制，并对原生storm的ack机制做了一点点代码优化。

通过Ack机制，spout发送出去的每一条消息，都可以确定是被成功处理或失败处理， 从而可以让开发者采取动作。

比如在Meta中，成功被处理，即可更新偏移量，当失败时，重复发送数据。

因此，通过Ack机制，很容易做到保证所有数据均被处理，一条都不漏。

另外需要注意的，当spout触发fail动作时，不会自动重发失败的tuple，需要spout自己重新获取数据，手动重新再发送一次。

## 原理解释

如图当定义Topology时指定Acker，JStorm除了Topology本身任务外，还会启动一组称为Acker的特殊任务，负责跟踪Topolgogy DAG中的每个消息。

![image](https://user-images.githubusercontent.com/18375710/63637670-81297680-c6b1-11e9-82dc-f979e20133f1.png)

每当发现一个DAG被成功处理完成，Acker就向创建根消息的Spout任务发送一个Ack信号。

Topology中Acker任务的并行度默认parallelism hint=1，当系统中有大量的消息时，应该适当提高Acker任务的并行度。

Acker按照Tuple Tree的方式跟踪消息。

当Spout发送一个消息的时候，它就通知对应的Acker一个新的根消息产生了，这时Acker就会创建一个新的Tuple Tree。

当Acker发现这棵树被完全处理之后，他就会通知对应的Spout任务。

![image](https://user-images.githubusercontent.com/18375710/63637679-b0d87e80-c6b1-11e9-93f7-89568118bb3e.png)

Acker任务保存了数据结构 `Map<MessageID,Map< TaskID, Value>>`，其中MessageID是Spout根消息ID，TaskID是Spout任务ID，Value表示一个64bit的长整型数字，是树中所有消息的随机ID的异或结果。

通过TaskID，Acker知道当消息树处理完成后通知哪个Spout任务，通过MessageID，Acker知道属于Spout任务的哪个消息被成功处理完成。

Value表示了整棵树的的状态，无论这棵树多大，只需要这个固定大小的数字就可以跟踪整棵树。

当消息被创建和被应答的时候都会有相同的MessageID发送过来做异或。

当Acker发现一棵树的Value值为0的时候，表明这棵树已经被成功处理完成。

## 例子

例如，对于前面Topology中消息树，Acker数据的变化过程：

Step0.A发送T0给B后：

```
R0=r0
<id0,<taskA,R0>>
```

Step1.B接收到T0并成功处理后向C发送T1，向D发送T2：

```
R1=R0^r1^r2=r0^r1^r2
<id0,<taskA,R0^R1>>
=<id0,<taskA,r0^r0^r1^r2>>
=<id0,<taskA,r1^r2>>
```

Step2.C接收到T1并成功处理后：

```
R2=r1
<id0,<taskA,r1^r2^R2>>
=<id0,<taskA,r1^r2^r1>>
=<id0,<taskA,r2>>
```

Step3.D接收到T2并成功处理后：

```
R3=r2
<id0,<taskA,r2^R3>>
=<id0,<taskA,r2^r2>>
=<id0,<taskA,0>>
```

当结果为0时Acker可以通知taskA根消息id0的消息树已被成功处理完成。

需要指出的是，Acker并不是必须的，当实际业务可以容忍数据丢失情况下可以不用Acker，对数据丢失零容忍的业务必须打开Acker，另外当系统的消息规模较大是可适当增加Acker的并行度。


# 故障恢复

## 1）节点故障

### Nimbus故障

Nimbus本身无状态，所以Nimbus故障不会影响正在正常运行任务，另外Nimbus HA保证Nimbus故障后可以及时被备份Nimbus接管。

### Supervisors节点故障

Supervisor故障后，Nimbus会将故障节点上的任务迁移到其他可用节点上继续运行，但是Supervisor故障需要外部监控并及时手动重启。

### Worker故障

Worker健康状况监控由Supervisor负责，当Woker出现故障时，Supervisor会及时在本机重试重启。

### Zookeeper节点故障

Zookeeper本身具有很好的故障恢复机制，能保证至少半数以上节点在线就可正常运行，及时修复故障节点即可。

## 2）任务失败

### Spout失败

消息不能被及时被Pull到系统中，造成外部大量消息不能被及时处理，而外部大量计算资源空闲。

### Bolt失败

消息不能被处理，Acker持有的所有与该Bolt相关的消息反馈值都不能回归到0，最后因为超时最终Spout的fail将被调用。

### Acker失败

Acker持有的所有反馈信息不管成功与否都不能及时反馈到Spout，最后同样因为超时Spout的fail将被调用。

任务失败后，需要Nimbus及时监控到并重新分配失败任务。

# 关键流程

![image](https://user-images.githubusercontent.com/18375710/63637709-26444f00-c6b2-11e9-903a-fc6188069ef8.png)

## Topology提交

JStorm为用户提供了StormSubmitter. submitTopology用来向集群提交Topology，整个提交流程：

## Client端：

0）客户端简单验证；

1）检查是否已经存在同名Topology；

2）提交jar包；

3）向Nimbus提交Topology；

## Nimbus端：

0）Nimbus端简单合法性检查；

1）生成Topology Name；

2）序列化配置文件和Topology Code；

3）Nimbus本地准备运行时所需数据；

4）向ZK注册Topology和Task；

5）将Task压入分配队列等待TopologyAssign分配；

# 参考资料

[JStorm和Storm比较](https://www.jianshu.com/p/cc23017370b1)

[JStorm介绍](https://blog.csdn.net/one_Jachen/article/details/81144899)

* any list
{:toc}
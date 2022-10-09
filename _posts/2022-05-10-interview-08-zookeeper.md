---
layout: post
title:  ZooKeeper 常见面试题汇总
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, redis, sh]
published: true
---

# 系列目录

[spring 常见面试题](https://houbb.github.io/2022/05/10/interview-01-spring)

[spring-boot 常见面试题](https://houbb.github.io/2022/05/10/interview-02-springboot)

[redis 常见面试题](https://houbb.github.io/2022/05/10/interview-04-redis)

[mysql 常见面试题](https://houbb.github.io/2022/05/10/interview-05-mysql)

[mq 常见面试题](https://houbb.github.io/2022/05/10/interview-07-mq)

[rpc/dubbo 常见面试题](https://houbb.github.io/2022/05/10/interview-06-dubbo)

[ZooKeeper 面试题](https://houbb.github.io/2022/05/10/interview-08-zookeeper)

[JVM 常见面试题之双亲委派](https://houbb.github.io/2022/05/10/interview-09-jvm-classloader)

[JVM 常见面试题之 GC 垃圾回收](https://houbb.github.io/2022/05/10/interview-09-jvm-gc)

[JVM 常见面试题之 java 内存结构](https://houbb.github.io/2022/05/10/interview-09-jvm-struct)

[JVM 常见面试题之 java 内存结构2](https://houbb.github.io/2022/05/10/interview-11-java-jvm)

[【面试】mybatis 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-03-mybatis)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

[java 基础之 event 事件机制](https://houbb.github.io/2022/05/10/interview-11-java-basic-event)

[Reflection-01-java 反射机制](https://houbb.github.io/2018/07/01/reflection-01-overview)

[distributed 分布式相关专题汇总](https://houbb.github.io/2022/05/10/interview-11-java-distribute)

[web 常见面试题](https://houbb.github.io/2022/05/10/interview-11-java-web)

[其他常见面试题](https://houbb.github.io/2022/05/10/interview-12-other)

# 拓展阅读


# 前言

大家好，我是老马。

Zookeeper 是一个分布式的，开放源代码的分布式应用程序协调服务。

面试中自然出现频率也比较高，对常见问题进行整理，便于平时查阅收藏。

# 谈谈你对ZooKeeper的理解？

Zookeeper 作为一个分布式的服务框架，主要用来解决分布式集群中应用系统的一致性问题。

ZooKeeper提供的服务包括：分布式消息同步和协调机制、

服务器节点动态上下线、统一配置管理、负载均衡、集群管理等。

ZooKeeper提供基于类似于Linux文件系统的目录节点树方式的数据存储，即分层命名空间。Zookeeper 并不是用来专门存储数据的，它的作用主要是用来维护和监控你存储的数据的状态变化，通过监控这些数据状态的变化，从而可以达到基于数据的集群管理，ZooKeeper节点的数据上限是1MB。

我们可以认为Zookeeper=文件系统+通知机制，对于ZooKeeper的数据结构，每个子目录项如 NameService 都被称作为 znode，这个 znode 是被它所在的
路径唯一标识，如 Server1 这个 znode 的标识为 /NameService/Server1；

znode 可以有子节点目录，并且每个 znode 可以存储数据，注意 EPHEMERAL 类型的目录节点不能有子节点目录(因为它是临时节点)；

znode 是有版本的，每个 znode 中存储的数据可以有多个版本，也就是一个访问路径中可以存储多份数据；

znode 可以是临时节点，一旦创建这个 znode 的客户端与服务器失去联系，这个 znode 也将自动删除，Zookeeper 的客户端和服务器通信采用长连接方式，

每个客户端和服务器通过心跳来保持连接，这个连接状态称为 session，如果 znode 是临时节点，这个 session 失效，znode 也就删除了；

znode 的目录名可以自动编号，如 App1 已经存在，再创建的话，将会自动命名为 App2；

znode 可以被监控，包括这个目录节点中存储的数据的修改，子节点目录的变化等，一旦变化可以通知设置监控的客户端，这个是 Zookeeper 的核心特性，

Zookeeper 的很多功能都是基于这个特性实现的，后面在典型的应用场景中会有实例介绍。

# 1.1 Zookeeper基本概念

Zookeeper作为一个优秀高效且可靠的分布式协调框架，ZooKeeper 在解决分布式数据一致性问题时并没有直接使用Paxos算法 ，而是专门定制了一致性协议叫做 ZAB(ZooKeeper Automic Broadcast) 原子广播协议，该协议能够很好地支持 崩溃恢复 ；

## 一：Zookeeper应用场景

统一命名服务、统一配置管理、统一集群管理、服务器节点动态上下线、软负载均衡等。

（1）统一配置管理

![（1）统一配置管理](https://img-blog.csdnimg.cn/5cf1640b414d4dfebd0a26e0b7b8e21b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAbW9ua2V5X2tvYmU=,size_10,color_FFFFFF,t_70,g_se,x_16)

①分布式环境下，配置文件同步非常常见：

1)一般要求一个集群中，所有节点的配置信息是一致的，比如Kafka集群；

2)对配置文件修改后，希望能够快读同步到各个节点上；

②配置管理可交由Zookeeper实现：

1)可将配置信息写入Zookeeper上的一个Znode节点上；

2)各个客户端服务器监听这个Znode；

3)一旦Znode中的数据被修改了，Zookeeper将通知给各个客户端服务器；

（2）统一集群管理

③在分布式环境中，实时掌握每个节点的状态是必要的：

1)可根据节点实时状态做出一些调整；

④Zookeeper可以实现实时监控节点状态变化：

1)可将节点信息写入Zookeeper上的一个Znode节点上；

2)监听这个Znode可获取它的实时状态变化；

（3）软负载均衡

⑤在Zookeeper中记录每台服务器的访问数，让访问数最少的服务器去处理最新客户端请求；

![（3）软负载均衡](https://img-blog.csdnimg.cn/d403d7eb3ed1400aba9b6e3a99a40d39.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAbW9ua2V5X2tvYmU=,size_16,color_FFFFFF,t_70,g_se,x_16)

## 二：Zookeeper的特点

（1）一个领导者leader，多个跟随者follower组成的集群；

（2）集群中只要半数以上节点存活，Zookeeper集群就能正常服务；

（3）全局数据一致：每个Server保存一份相同的数据副本，Client无论连接哪个Server，数据都是一致的；

（4）数据更新原子性：一次数据更新要么成功，要么失败；

（5）更新请求顺序进行：来自同一个Client的更新请求，按其发送顺序一次执行；

（6）实时性：在一定时间范围内，Client能读到最新的数据；

# 常用的 Zookeeper 客户端命令

```
ls path：查看当前znode的子节点；
create：创建；
get path：获得节点的值；
set：设置节点的具体值；
stat：查看节点状态；
delete：删除节点；
deleteall：递归删除节点；
```

# Zookeeper 的监听原理

（1）首先有一个main()线程；

（2）在main()线程中创建Zookeeper客户端，这时就会创建两个线程，一个负责网络连接通信(connect)、一个负责监听(listen)；

（3）通过connect线程将注册的监听事件发送给Zookeeper；

（4）在Zookeeper的注册监听器列表中将注册的监听事件添加到列表中；

（5）Zookeeper监听到有数据或路径变化，就会将这个消息发送给listen线程；

（6）listen线程内部调用了process()方法进行处理；


# Zookeeper 保证数据一致性

## Paxos 算法

（1）Paxos算法，是一种基于消息传递且具有高度容错性的一致性算法；

（2）Paxos算法解决的问题：就是如何在一个分布式系统中对某个数据值达成一致，并且保证不论发生任何异常(机器宕机、网络异常)，都不会破坏整个系统的一致性；

（3）Paxos算法的描述：

①在一个Paxos系统中，首先将所有节点划分为提议者(Proposers)、接收者(Acceptors)和学习者(Learners)，每个节点都可以身兼数职；

②一个完整的Paxos算法流程分为3个阶段：

![Paxos 算法](https://img-blog.csdnimg.cn/7dc96bea56454610ac8867b145cf4a21.png)

1)Prepare阶段：

a.提议者(Proposers)向多个接收者(Acceptors)发出提议(Propose)，请求承诺(Promise)；

b.接收者(Acceptors)针对收到的提议(Propose)请求，进行承诺(Promise)；

2)Accept阶段：

a.提议者(Proposers)收到多数接收者(Acceptors)承诺的提议(Propose)后，正式向接收者(Acceptors)发出提议(Propose)；

b.接收者(Acceptors)针对收到的提议(Propose)请求，进行接收(Accept)处理；

3)Learn阶段：

a.提议者(Proposers)将形成的决议发送给所有的学习者(Learners)；

（4）Paxos算法缺点

①当系统中有一个以上的提议者(Proposers)时，多个提议者(Proposers)之间相互争夺接收者(Acceptors)，造成迟迟无法达成一致的情况，针对此情况，

一种改进的Paxos算法被提出：从系统中选出一个节点作为Leader，只有Leader能够发起提议。

这样，一次Paxos流程中，只有一个提议者，不会出现活锁的情况；

# Zab协议(解决数据一致性)

## （1）什么是ZAB协议?

ZAB(ZooKeeper Atomic Broadcast原子广播)协议是为分布式协调服务ZooKeeper框架专门设计的一种支持崩溃恢复的原子广播协议。

在ZooKeeper中，主要依赖ZAB协议来实现分布式数据一致性，基于ZAB协议，ZooKeeper实现了一种主备模式的系统架构来保持集群中各个副本之间的数据一致性；

## （2）ZAB的特点

基于该协议，Zookeeper设计为只有一台客户端（Leader）负责处理外部的写事务请求，然后Leader客户端将数据同步到其他Follower节点。

即Zookeeper只有一个Leader可以发起提案。

## （3）ZAB协议内容

ZAB协议包括两种基本的模式：消息广播、崩溃恢复；

（1）消息广播概念：

①当集群中已经有过半的Follower服务器完成了和Leader服务器的状态同步，那么整个服务框架就可以进入消息广播模式了。 当一台同样遵守ZAB协议的服务器启动后加入到集群中时，如果此时集群中已经存在一个Leader服务器在负责进行消息广播，那么新加入的服务器就会自觉地进入数据恢复模式：找到Leader所在的服务器，并与其进行数据同步，然后一起参与到消息广播流程中去；

（2）消息广播流程

① 客户端发起一个写操作请求；

②Leader服务器将客户端的请求转化为事务提案(Proposal)，同时为每个事务提案(Proposal)分配一个全局的ID，即zxid；

③ Leader服务器为每个Follower服务器分配一个单独的队列，然后将需要广播的提案(Proposal)依次放到队列中去，并且根据FIFO策略进行消息发送；

④ Follower接收到提案(Proposal)后，会首先将其以事务日志的方式写入本地磁盘中，写入成功后向Leader反馈一个Ack响应消息；

⑤ Leader接收到超过半数以上Follower的Ack响应消息后，即认为消息发送成功，可以发送commit消息；

⑥ Leader向所有Follower广播commit消息，同时自身也会完成事务提交。Follower 接收到commit消息后，会将上一条事务提交；

总结：Zookeeper采用Zab协议的核心，就是只要有一台服务器提交了提案(Proposal)，就要确保所有的服务器最终都能正确提交提案(Proposal)；

问题：当出现以下2种情况，可能会造成数据不一致问题：（1）Leader 发起一个事务提案(Proposal)后就宕机，Follower都没有提案(Proposal)；（2）Leader收到半数ACK后宕机，没来得及向Follower发送Commit；为解决此问题，Zab引入了崩溃恢复模式；

（3）崩溃恢复概念：

①当整个服务框架在启动过程中，或是当Leader服务器出现网络中断、崩溃退出与重启等异常情况时，ZAB 协议就会进入恢复模式并选举产生新的Leader服务器。当选举产生了新的Leader服务器，同时集群中已经有过半的机器与该Leader服务器完成了状态同步之后，ZAB协议就会退出恢复模式。其中，所谓的状态同步是指数据同步，用来保证集群中存在过半的机器能够和Leader服务器的数据状态保持一致；

（4）崩溃恢复流程

崩溃恢复主要包括两部分：Leader选举和数据恢复；

①Leader选举，Zab协议需要保证选举出来的Leader需要满足以下条件：

1) 新选举出来的Leader不能包含未提交的提案(Proposal)，即新Leader必须都是已经提交了提案(Proposal)的Follower服务器节点；

2) 新选举的Leader节点中含有最大的zxid，这样做的好处是可以避免Leader服务器检查提案(Proposal)的提交和丢弃工作；

②Zab 如何数据同步?

1)完成Leader选举后，在正式开始工作之前（接收事务请求，然后提出新的提案(Proposal)），Leader服务器会首先确认事务日志中的所有的提案(Proposal)是否已经被集群中过半的服务器Commit；

2)Leader服务器需要确保所有的Follower服务器能够接收到每一条事务的提案(Proposal)，并且能将所有已经提交的事务提案(Proposal)应用到内存数据中。

等到Follower 将所有尚未同步的事务提案(Proposal)都从Leader 服务器上同步过，并且应用到内存数据中以后，Leader才会把该Follower加入到真正可用的Follower列表中；

# Zookeeper怎么保证主从节点的状态同步?

Zookeeper的核心是原子广播，这个机制保证了各个服务器之间的数据同步。

实现这个机制的协议叫做ZAB协议。ZAB协议有两种模式：恢复模式（选主）和广播模式（同步）。

当服务启动或者在领导者崩溃之后后，ZAB就进入了恢复模式，当领导者被选举出来，且大多数服务器完成了和 leader的状态同步以后，恢复模式就结束了。

状态同步保证了 leader 和 server 具有相同的系统状态；

# Zookeeper如何保证数据一致性?

Zookeeper保证数据一致性用的是ZAB协议，通过这个ZAB协议来进行Zookeeper集群间的数据同步，来保证数据的一致性；

Zookeeper写数据的机制是客户端把写请求发送到leader节点上，leader节点会把数据通过提案(proposal)请求发送给所有节点，所有到节点接收到数据以后，都会写到自己的本地磁盘上，写好了之后会发送一个ACK请求给leader，leader只要接收到过半的节点发送回来ACK确认响应，就会发送提交(commit)消息给各个节点，各个节点就会把消息放入到内存中(放内存是为了保证高性能)，该消息就会用户可见了；

那么这个时候，如果Zookeeper要想保证数据一致性，就需要考虑如下两个情况：

情况1：leader执行提交(commit)了，还没来得及给follower发送提交(commit)的时候，leader宕机了，这个时候如何保证消息的一致性?

情况2：客户端把消息写到leader了，但是leader还没发送提案(proposal)消息给其他节点，这个时候leader宕机了，leader宕机后恢复的时候，此消息又该如何处理?

解决方案1：ZAB 的崩溃恢复机制

针对情况一，当leader宕机以后，Zookeeper会选举出来新的leader，新的leader启动之后要到磁盘上面去检查是否存在没有提交(commit)的消息，如果存在，就继续检查看其它follower有没有对这条消息进行了提交(commit)，如果有过半节点对这条消息进行了ACK确认，但是没有提交(commit)，那么新对leader要完成提交(commit)的操作；

解决方案2：ZAB 恢复中删除数据机制

针对情况二，客户端把消息写到leader了，但是leader还没发送提案(proposal)消息给其他节点，这个时候leader宕机了，这个时候对于用户来说，这条消息是写失败的。

假设过了一段时间以后leader节点又恢复了，不过这个时候它角色就变为了follower了，它在检查自己磁盘的时候会发现自己有一条消息没有进行提交(commit)，此时就会检测消息的编号，消息是有编号的，由高32位和低32位组成，高32位是用来体现是否发生过leader切换的，低32位就是展示消息的顺序的。

这个时候当前的节点就会根据高32位知道目前leader已经切换过了，所以就把当前的消息给删除掉，然后从新的leader中进行同步数据，这样就保证了数据的一致性；

# Zookeeper的CAP理论

CAP理论告诉我们，一个分布式系统不可能同时满足以下三种：

①　一致性（C:Consistency）

②　可用性（A:Available）

③　分区容错性（P:Partition Tolerance）

这三个基本需求，最多只能同时满足其中的两项，因为P是必须的，因此往往选择就在CP或者AP中；

（1）一致性

在分布式环境中，一致性是指数据在多个副本之间是否能够保持数据一致的特性。在一致性的需求下，当一个系统在数据一致的状态下执行更新操作后，应该保证系统的数据仍然处于一致的状态；

（2）可用性

可用性是指系统提供的服务必须一直处于可用的状态，对于用户的每一个操作请求总是能够在有限的时间内返回结果；

（3）分区容错性

分布式系统在遇到任何网络分区故障的时候，仍然需要能够保证对外提供满足一致性和可用性的服务，除非是整个网络环境都发生了故障；

ZooKeeper保证的是CP：

（1）ZooKeeper不能保证每次服务请求的可用性。（注：在极端环境下，ZooKeeper可能会丢弃一些请求，消费者程序需要重新请求才能获得结果）。所以说，ZooKeeper不能保证服务可用性；

（2）进行Leader选举时集群都是不可用；

# Zookeeper的选举机制

半数机制：集群中半数以上机器存活，集群可用。

所以Zookeeper适合安装奇数台服务器。

假设有五台服务器组成的zookeeper集群，它们的id从1-5，同时它们都是最新启动的，也就是没有历史数据，在存放数据量这一点上，都是一样的。假设这些服务器依序启动，来看看会发生什么。

（1）服务器1启动，此时只有它一台服务器启动了，它发出去的报没有任何响应，所以它的选举状态一直是LOOKING状态。

（2）服务器2启动，它与最开始启动的服务器1进行通信，互相交换自己的选举结果，由于两者都没有历史数据，所以id值较大的服务器2胜出，但是由于没有达到超过半数以上的服务器都同意选举它(这个例子中的半数以上是3)，所以服务器1、2还是继续保持LOOKING状态。

（3）服务器3启动，根据前面的理论分析，服务器3成为服务器1、2、3中的Leader，而与上面不同的是，此时有三台服务器选举了它，所以它成为了这次选举的Leader。

（4）服务器4启动，根据前面的分析，理论上服务器4应该是服务器1、2、3、4中最大的，但是由于前面已经有半数以上的服务器选举了服务器3，所以它成为Follower。

（5）服务器5启动，同4一样成为Follower。

#  Zookeeper的工作机制

Zookeeper从设计模式角度来理解：是一个基于观察者模式设计的分布式服务管理架构，它负责存储和管理大家都关心的数据，然后接受观察者的注册，一旦这些数据的状态发生变化，Zookeeper就将负责通知已经在Zookeeper上注册的那些观察者做出相应的反应；

# Zookeeper的通知机制

客户端会对某个Znode节点建立一个watcher事件，当该Znode节点发生变化时，这些客户端会收到Zookeeper的通知，然后客户端可以根据Znode节点变化来做出业务上的改变；

# Zookeeper的节点类型

Znode有两种类型：

短暂（ephemeral）：客户端和服务器端断开连接后，创建的节点自己删除；

持久（persistent）：客户端和服务器端断开连接后，创建的节点不删除；

细分：

（1）普通持久节点；

（2）带序号持久节点；

（3）普通临时节点；

（4）带序号临时节点；


# Zookeeper集群为啥最好奇数台?

ZooKeeper集群在宕掉几个ZooKeeper服务器之后，如果剩下的ZooKeeper服务器个数大于宕掉的个数的话整个ZooKeeper才依然可用。

假如我们的集群中有n台ZooKeeper服务器，那么也就是剩下的服务数必须大于n/2。

假如我们有3台，那么最大允许宕掉1台ZooKeeper服务器，如果我们有4台的的时候也同样只允许宕掉1台。

假如我们有5台，那么最大允许宕掉2台ZooKeeper服务器，如果我们有6台的的时候也同样只允许宕掉2台。

综上所述，我们发现2n和2n-1的容忍度是一样的，都是n-1。所以，何必增加那一个不必要的ZooKeeper服务器呢?

# 2. Zookeeper的核心功能？

Zookeeper 提供了三个核心功能：文件系统、通知机制和集群管理机制。

## 1. 文件系统

Zookeeper 存储数据的结构，类似于一个文件系统。每个节点称之为znode，买个znode都是类似于K-V的结构，每个节点的名字相当于key，每个节点中都保存了对应的数据，类似于key-value中的value。

## 2. 通知机制

当某个 client 监听某个节点时，当该节点发生变化时，zookeeper就会通知监听该节点的客户端，后续根据客户端的处理逻辑进行处理。

## 3. 集群管理机制

zookeeper 本身是一个集群结构，有一个 leader 节点，负责写请求，多个 follower 节点负责相应读请求。

并且在 leader 节点故障的时候，会根据选举机制从剩下的 follower 中选举出新的leader。

# 3. Zookeeper 中的角色都有哪些？

## 1. leader

处理所有的事务请求（写请求），可以处理读请求，集群中只能有一个leader。

## 2. follower

只能处理读请求，同时作为leader的候选节点，即如果leader宕机，follower节点要参与到新的leader选举中，有可能成为新的leader节点。

## 3. observer

只能处理读请求，不能参与选举。

# 4. Zookeeper中的节点有哪几种，分别有什么不同？

Zookeeper中的几点一共分为7中，分别是持久节点（PERSISTENT）、持久顺序节点（PERSISTENT_SEQUENTIAL）、临时节点（EPHEMERAL）、临时顺序节点（EPHEMERAL_SEQUENTIAL）、容器节点（CONTAINER）、带过期时间的持久节点（PERSISTENT_WITH_TTL）、带过期时间的持久顺序节点（PERSISTENT_SEQUENTIAL_WITH_TTL）。

## 1. 持久节点（PERSISTENT）

持久节点，一旦创建成功不会被删除，除非客户端主动发起删除请求。

## 2. 持久顺序节点（PERSISTENT_SEQUENTIAL）

持久顺序节点，会在用户路径后面拼接一个不会重复的自增数字后缀，一旦创建成功不会被删除，除非客户端主动发起请求。

## 3. 临时节点（EPHEMERAL）

临时节点，当创建该节点的客户端断开连接后就会被自动删除。

## 4. 临时顺序节点（EPHEMERAL_SEQUENTIAL）

临时顺序节点，创建时会在用户路径后面拼接一个不会重复的自增数字后缀，当创建该节点的客户端断开连接后就会被自动删除。

## 5. 容器节点（CONTAINER）

容器节点，一旦子节点被删除完，该节点就会被服务端自动删除。

## 6. 带过期时间的持久节点（PERSISTENT_WITH_TTL）

带过期时间的持久节点，带有超时时间的节点，如果超时时间内没有子节点被创建，就会被删除。需要开启服务端配置extendedTypesEnabled=true。

## 7. 带过期时间的持久顺序节点（PERSISTENT_SEQUENTIAL_WITH_TTL）

带过期时间的持久顺序节点，创建节点时会在用户路径后面拼接一个不会重复的自增数字后缀，带有超时时间，如果超时时间内没有子节点被创建，就会被删除。

需要开启服务端配置 `extendedTypesEnabled=true`。

# Zookeeper 和 Dubbo 的关系？

## Zookeeper的作用

zookeeper用来注册服务和进行负载均衡，哪一个服务由哪一个机器来提供必需让调用者知道，简单来说就是ip地址和服务名称的对应关系。

当然也可以通过硬编码的方式把这种对应关系在调用方业务代码中实现，但是如果提供服务的机器挂掉调用者无法知晓，如果不更改代码会继续请求挂掉的机器提供服务。

zookeeper通过心跳机制可以检测挂掉的机器并将挂掉机器的ip和服务对应关系从列表中删除。

至于支持高并发，简单来说就是横向扩展，在不更改代码的情况通过添加机器来提高运算能力。

通过添加新的机器向zookeeper注册服务，服务的提供者多了能服务的客户就多了。

## dubbo

是管理中间层的工具，在业务层到数据仓库间有非常多服务的接入和服务提供者需要调度，dubbo提供一个框架解决这个问题。

注意这里的dubbo只是一个框架，至于你架子上放什么是完全取决于你的，就像一个汽车骨架，你需要配你的轮子引擎。这个框架中要完成调度必须要有一个分布式的注册中心，储存所有服务的元数据，你可以用zk，也可以用别的，只是大家都用zk。

## zookeeper和dubbo的关系

Dubbo 的将注册中心进行抽象，它可以外接不同的存储媒介给注册中心提供服务，有 ZooKeeper，Memcached，Redis 等。

引入了 ZooKeeper 作为存储媒介，也就把 ZooKeeper 的特性引进来。首先是负载均衡，单注册中心的承载能力是有限的，在流量达到一定程度的时 候就需要分流，负载均衡就是为了分流而存在的，一个 ZooKeeper 群配合相应的 Web 应用就可以很容易达到负载均衡；资源同步，单单有负载均衡还不够，节点之间的数据和资源需要同步，ZooKeeper 集群就天然具备有这样的功能；

命名服务，将树状结构用于维护全局的服务地址列表，服务提供者在启动 的时候，向 ZooKeeper上的指定节点 `/dubbo/${serviceName}/providers` 目录下写入自己的 URL 地址，这个操作就完成了服务的发布。 

其他特性还有 Master 选举，分布式锁等。

# Watcher 监听机制

Zookeeper 允许客户端向服务端的某个Znode注册一个Watcher监听，当服务端的一些指定事件触发了这个Watcher，服务端会向指定客户端发送一个事件通知来实现分布式的通知功能，然后客户端根据 Watcher通知状态和事件类型做出业务上的改变。

可以把Watcher理解成客户端注册在某个Znode上的触发器，当这个Znode节点发生变化时（增删改查），就会触发Znode对应的注册事件，注册的客户端就会收到异步通知，然后做出业务的改变。

# Watcher监听机制的工作原理

ZooKeeper的Watcher机制主要包括客户端线程、客户端 ZkWatcherManager 存储本地监听事件、服务端WacherManger 存储 三部分。

ZkWatcherManager 存储本地监听事件 存储结构

```java
private final Map<String, Set<Watcher>> dataWatches = new HashMap<String, Set<Watcher>>();
private final Map<String, Set<Watcher>> existWatches = new HashMap<String, Set<Watcher>>();
private final Map<String, Set<Watcher>> childWatches = new HashMap<String, Set<Watcher>>();
```

客户端向ZooKeeper服务器注册Watcher的同时，会将Watcher对象存储在客户端的ZkWatcherManager 中。

当zookeeper服务器触发watcher事件后，会向客户端发送通知， 客户端线程从 ZkWatcherManager 中取出对应的 Watcher 对象来执行回调逻辑。

为什么watcher 只通知一次，因为要保存watcher 在服务端会需要很多内存 存储。。如果客户端连接过多，产生事件特别多。 

把重复监听下放到客户端

## Watcher特性总结

「一次性:」 一个Watch事件是一个一次性的触发器。一次性触发，客户端只会收到一次这样的信息。

「异步的：」 Zookeeper服务器发送watcher的通知事件到客户端是异步的，不能期望能够监控到节点每次的变化，Zookeeper只能保证最终的一致性，而无法保证强一致性。

「轻量级：」 Watcher 通知非常简单，它只是通知发生了事件，而不会传递事件对象内容。

「客户端串行：」 执行客户端 Watcher 回调的过程是一个串行同步的过程。

注册 watcher用getData、exists、getChildren方法

触发 watcher用create、delete、setData方法





# 参考资料

https://blog.csdn.net/m0_46689661/article/details/123076236

* any list
{:toc}`
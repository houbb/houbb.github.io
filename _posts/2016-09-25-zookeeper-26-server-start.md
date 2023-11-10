---
layout: post
title: ZooKeeper-26-ZooKeeper 原理之服务端启动 server start
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---


# 服务器启动

从本节开始，我们将真正进入ZooKeeper服务端相关的技术内幕介绍。首先我们来看看ZooKeeper服务端的整体架构，如图7-27所示。

![服务器启动](https://img-blog.csdnimg.cn/9120d9a70ea5421b8524ceeca7f39ed1.png)

本节将向读者介绍ZooKeeper服务器的启动过程，下面先从单机版的服务器开始介绍。

# 单机版服务器启动

ZooKeeper 服务器的启动，大体可以分为以下五个主要步骤：配置文件解析、初始化数据管理器、初始化网络I/O管理器、数据恢复和对外服务。

图7-28所示是单机版ZooKeeper服务器的启动流程图。

![启动流程](https://img-blog.csdnimg.cn/fcfa89ad7e7d4f938dfa1230ee44f43e.png)

图7-28.单机版ZooKeeper服务器启动流程

## 预启动

预启动的步骤如下。

1.统一由QuorumPeerMain作为启动类。

无论是单机版还是集群模式启动ZooKeeper服务器，在zkServer.cmd和zkServer.sh两个脚本中，都配置了使用 org.apache.zookeeper.server.quorum.QuorumPeerMain作为启动入口类。

2.解析配置文件zoo.cfg。

ZooKeeper首先会进行配置文件的解析，配置文件的解析其实就是对zoo.cfg文件的解析。在5.1.2节中，我们曾经提到在部署ZooKeeer服务器时，需要使用到zoo.cfg这个文件。

该文件配置了 ZooKeeper 运行时的基本参数，包括 tickTime、dataDir 和 clientPort 等参数。

关于 ZooKeeper 参数配置，将在 8.1 节中做详细讲解。

3.创建并启动历史文件清理器DatadirCleanupManager。

从3.4.0版本开始，ZooKeeper增加了自动清理历史数据文件的机制，包括对事务日志和快照数据文件进行定时清理。

4.判断当前是集群模式还是单机模式的启动。

ZooKeeper 根据步骤 2 中解析出的集群服务器地址列表来判断当前是集群模式还是单机模式，如果是单机模式，那么就委托给 ZooKeeperServerMain 进行启动处理。

5.再次进行配置文件zoo.cfg的解析。

6.创建服务器实例ZooKeeperServer。

org.apache.zookeeper.server.ZooKeeperServer 是单机版 ZooKeeper服务端最为核心的实体类。

ZooKeeper 服务器首先会进行服务器实例的创建，接下去的步骤则都是对该服务器实例的初始化工作，包括连接器、内存数据库和请求处理器等组件的初始化。

## 初始化

初始化的步骤如下。

1.创建服务器统计器ServerStats。

ServerStats 是 ZooKeeper 服务器运行时的统计器，包含了最基本的运行时信息，如表7-8所示。

- 表7-8.ZooKeeper服务器基本统计信息

![7-8](https://img-blog.csdnimg.cn/138a143d0af84e508123aa5681a6ad1a.png)

2.创建ZooKeeper数据管理器FileTxnSnapLog。

FileTxnSnapLog是ZooKeeper上层服务器和底层数据存储之间的对接层，提供了一系列操作数据文件的接口，包括事务日志文件和快照数据文件。ZooKeeper根据zoo.cfg文件中解析出的快照数据目录dataDir和事务日志目录dataLogDir来创建FileTxnSnapLog。

3.设置服务器tickTime和会话超时时间限制。

4.创建ServerCnxnFactory。

在早期版本中，ZooKeeper都是自己实现NIO框架，从3.4.0版本开始，引入了Netty。读者可以通过配置系统属性 zookeeper.serverCnxnFactory 来指定使用ZooKeeper自己实现的NIO还是使用Netty框架来作为ZooKeeper服务端网络连接工厂。

5.初始化ServerCnxnFactory。

ZooKeeper首先会初始化一个Thread，作为整个ServerCnxnFactory的主线程，然后再初始化NIO服务器。

6.启动ServerCnxnFactory主线程。

启动步骤5中已经初始化的主线程ServerCnxnFactory的主逻辑（run方法）。需要注意的一点是，虽然这里ZooKeeper的NIO服务器已经对外开放端口，客户端能够访问到ZooKeeper的客户端服务端口2181，但
是此时ZooKeeper服务器是无法正常处理客户端请求的。

7.恢复本地数据。

每次在ZooKeeper启动的时候，都需要从本地快照数据文件和事务日志文件中进行数据恢复。

ZooKeeper的本地数据恢复比较复杂，本书将会在7.9.4节中做单独的详细讲解。

8.创建并启动会话管理器。

在ZooKeeper启动阶段，会创建一个会话管理器SessionTracker。关于SessionTracker，我们已经在 7.4.2 节中进行了讲解，它主要负责 ZooKeeper 服务端的会话管理。

创建SessionTracker 的时候，会初始化 expirationInterval、nextExpirationTime和sessionsWithTimeout（用于保存每个会话的超时时间），同时还会计算出一个初始化的sessionID。

SessionTracker初始化完毕后，ZooKeeper就会立即开始会话管理器的会话超时检查。

9.初始化ZooKeeper的请求处理链。

ZooKeeper的请求处理方式是典型的责任链模式的实现，在ZooKeeper服务器上，会有多个请求处理器依次来处理一个客户端请求。

在服务器启动的时候，会将这些请求处理器串联起来形成一个请求处理链。

单机版服务器的请求处理链主要包括PrepRequestProcessor、SyncRequestProcessor和FinalRequestProcessor三个请求处理器，如图7-29所示。

针对每个处理器的详细工作原理，将在7.7.1节中做详细讲解。

10.注册JMX服务。

ZooKeeper 会将服务器运行时的一些信息以 JMX 的方式暴露给外部，关于ZooKeeper的JMX，将在8.3节中做详细讲解。

11.注册ZooKeeper服务器实例。

在步骤6中，ZooKeeper已经将ServerCnxnFactory主线程启动，但是同时我们提到此时ZooKeeper依旧无法处理客户端请求，原因就是此时网络层尚不能够访问ZooKeeper服务器实例。

在经过后续步骤的初始化后，ZooKeeper服务器实例已经初始化完毕，只需要注册给 ServerCnxnFactory 即可，之后，ZooKeeper就可以对外提供正常的服务了。

至此，单机版的ZooKeeper服务器启动完毕。

# 集群版服务器启动

在 7.5.1 节中，我们已经讲解了单机版 ZooKeeper 服务器的启动过程，在本节中，我们将对集群版ZooKeeper服务器的启动过程做详细讲解。

集群版和单机版ZooKeeper服务器的启动过程在很多地方都是一致的，因此本节只会对有差异的地方展开进行讲解。图7-30所示是集群版ZooKeeper服务器的启动流程图。

- 图7-30.集群版ZooKeeper服务器启动流程

![集群版服务器启动](https://img-blog.csdnimg.cn/c07a15bcd04341afbac8f13958f73e70.png)

## 预启动

预启动的步骤如下。

1.统一由QuorumPeerMain作为启动类。
2.解析配置文件zoo.cfg。
3.创建并启动历史文件清理器DatadirCleanupManager。
4.判断当前是集群模式还是单机模式的启动。

在集群模式中，由于已经在zoo.cfg中配置了多个服务器地址，因此此处选择集群模式启动ZooKeeper。

## 初始化

初始化的步骤如下。

1.创建ServerCnxnFactory。
2.初始化ServerCnxnFactory。
3.创建ZooKeeper数据管理器FileTxnSnapLog。
4.创建QuorumPeer实例。
Quorum是集群模式下特有的对象，是ZooKeeper服务器实例（ZooKeeperServer）的托管者，从集群层面看，QuorumPeer代表了ZooKeeper集群中的一台机器。在运行期间，QuorumPeer 会不断检测当前服务器实例的运行状态，同时根据情况发起Leader选举。
5.创建内存数据库ZKDatabase。
ZKDatabase是ZooKeeper的内存数据库，负责管理ZooKeeper的所有会话记录以及DataTree和事务日志的存储。
6.初始化QuorumPeer。
在步骤 5 中我们已经提到，QuorumPeer 是 ZooKeeperServer 的托管者，因此需要将一些核心组件注册到 QuorumPeer 中去，包括 FileTxnSnapLog、ServerCnxnFactory 和 ZKDatabase。同时 ZooKeeper 还会对 QuorumPeer配置一些参数，包括服务器地址列表、Leader选举算法和会话超时时间限制等。
7.恢复本地数据。
8.启动ServerCnxnFactory主线程。

## Leader选举

Leader选举的步骤如下。

1.初始化Leader选举。

Leader 选举可以说是集群和单机模式启动 ZooKeeper 最大的不同点。ZooKeeper首先会根据自身的 SID（服务器 ID）、lastLoggedZxid（最新的 ZXID）和当前的服务器 epoch（currentEpoch）来生成一个初始化的投票——简单地讲，在初始化过程中，每个服务器都会给自己投票。

然后，ZooKeeper会根据zoo.cfg中的配置，创建相应的Leader选举算法实现。在ZooKeeper 中，默认提供了三种 Leader 选举算法的实现，分别是 LeaderElection、AuthFastLeaderElection 和 FastLeaderElection，可以通过在配置文件（zoo.cfg）中使用 electionAlg 属性来指定，分别使用数字 0～3 来表示。读者可以在 7.6.2节中查看关于Leader选举算法的详细讲解。

从3.4.0版本开始，ZooKeeper废弃了前两种Leader选举算法，只支持 FastLeaderElection选举算法了。

在初始化阶段，ZooKeeper会首先创建Leader选举所需的网络I/O层QuorumCnxManager，同时启动对Leader选举端口的监听，等待集群中其他服务器创建连接。

2.注册JMX服务。

3.检测当前服务器状态。

在上文中，我们已经提到QuorumPeer是ZooKeeper服务器实例的托管者，在运行期间，QuorumPeer的核心工作就是不断地检测当前服务器的状态，并做出相应的处理。在正常情况下，ZooKeeper服务器的状态在LOOKING、LEADING和FOLLOWING/OBSERVING之间进行切换。而在启动阶段，QuorumPeer的初始状态是LOOKING，因此开始进行Leader选举。

4.Leader选举

ZooKeeper的Leader选举过程，简单地讲，就是一个集群中所有的机器相互之间进行一系列投票，选举产生最合适的机器成为Leader，同时其余机器成为Follower或是Observer的集群机器角色初始化过程。关于Leader选举算法，简而言之，就是集群中哪个机器处理的数据越新（通常我们根据每个服务器处理过的最大ZXID来比较确定其数据是否更新），其越有可能成为Leader。

当然，如果集群中的所有机器处理的ZXID一致的话，那么SID最大的服务器成为Leader。

关于ZooKeeper的Leader选举，将在本书7.6节中做详细讲解。

## Leader和Follower启动期交互过程

到这里为止，ZooKeeper已经完成了Leader选举，并且集群中每个服务器都已经确定了自己的角色——通常情况下就分为 Leader 和 Follower 两种角色。

下面我们来对 Leader和Follower在启动期间的工作原理进行讲解，其大致交互流程如图7-31所示。

![选举交互](https://img-blog.csdnimg.cn/92c35b10aea64e1297a1021237e4de96.png)

图7-31.Leader和Follower服务器启动期交互过程

Leader和Follower服务器启动期交互过程包括如下步骤。

1.创建Leader服务器和Follower服务器。

完成Leader选举之后，每个服务器都会根据自己的服务器角色创建相应的服务器实例，并开始进入各自角色的主流程。

2.Leader服务器启动Follower接收器LearnerCnxAcceptor。

在ZooKeeper集群运行期间，Leader服务器需要和所有其余的服务器（本书余下部分，我们使用“Learner”来指代这类机器）保持连接以确定集群的机器存活情况。LearnerCnxAcceptor 接收器用于负责接收所有非 Leader 服务器的连接请求。

3.Learner服务器开始和Leader建立连接。

所有的 Learner 服务器在启动完毕后，会从 Leader 选举的投票结果中找到当前集群中的Leader服务器，然后与其建立连接。

4.Leader服务器创建LearnerHandler。

Leader 接收到来自其他机器的连接创建请求后，会创建一个 LearnerHandler实例。每个 LearnerHandler 实例都对应了一个 Leader 与 Learner 服务器之间的连接，其负责Leader和Learner服务器之间几乎所有的消息通信和数据同步。

5.向Leader注册。

当和Leader建立起连接后，Learner就会开始向Leader进行注册——所谓的注册，其实就是将 Learner 服务器自己的基本信息发送给 Leader 服务器，我们称之为LearnerInfo，包括当前服务器的SID和服务器处理的最新的ZXID。

6.Leader解析Learner信息，计算新的epoch。

Leader服务器在接收到Learner的基本信息后，会解析出该Learner的SID和ZXID，然后根据该Learner的ZXID解析出其对应的epoch_of_learner，和当前Leader服务器的 epoch_of_leader进行比较，如果该 Learner 的 epoch_of_learner 更大的话，那么就更新Leader的epoch：

```
epoch_of_leader = epoch_of_learner + 1;
```

然后，LearnerHandler会进行等待，直到过半的Learner已经向Leader进行了注册，同时更新了 epoch_of_leader之后，Leader就可以确定当前集群的epoch了。

7.发送Leader状态。

计算出新的epoch之后，Leader会将该信息以一个LEADERINFO消息的形式发送给Learner，同时等待Learner的响应。

8.Learner发送ACK消息。

Follower 在收到来自 Leader 的 LEADERINFO 消息后，会解析出 epoch 和 ZXID，然后向Leader反馈一个ACKEPOCH响应。

9.数据同步。

Leader服务器接收到Learner的这个ACK消息后，就可以开始与其进行数据同步了。关于ZooKeeper集群服务器间的数据同步，将在7.9.5节中做详细讲解。

10.启动Leader和Learner服务器。

当有过半的Learner已经完成了数据同步，那么Leader和Learner服务器实例就可以开始启动了。

## Leader和Follower启动

Leader和Follower启动的步骤如下。

1.创建并启动会话管理器。

2.初始化ZooKeeper的请求处理链。

和单机版服务器一样，集群模式下，每个服务器都会在启动阶段串联请求处理链，只是根据服务器角色不同，会有不同的请求处理链路，在7.7.1节中有对ZooKeeper请求处理链的详细讲解。

3.注册JMX服务。

至此，集群版的ZooKeeper服务器启动完毕。

# 参考资料

分布式一致性原理与实践

* any list
{:toc}

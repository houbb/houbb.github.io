---
layout: post
title: ZooKeeper-28-ZooKeeper 原理之各服务器角色介绍 role
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---


# 各服务器角色介绍

通过上面的介绍，我们已经了解到，在ZooKeeper集群中，分别有Leader、Follower和Observer三种类型的服务器角色。

在本节中，我们将一起来深入了解这三种服务器角色的技术内幕。

# Leader

Leader服务器是整个ZooKeeper集群工作机制中的核心，其主要工作有以下两个。

· 事务请求的唯一调度和处理者，保证集群事务处理的顺序性。

· 集群内部各服务器的调度者。

## 请求处理链

使用责任链模式来处理每一个客户端请求是 ZooKeeper 的一大特色。

在 7.5.2 节的服务器启动过程讲解中，我们已经提到，在每一个服务器启动的时候，都会进行请求处理链的初始化。

![请求处理链](https://img-blog.csdnimg.cn/e5215561c10a43eb8401318f6e73165a.png)

图7-36.Leader服务器请求处理链
从图7-36中可以看到，从PrepRequestProcessor到FinalRequestProcessor，前后一共7个请求处理器组成了Leader服务器的请求处理链。

- PrepRequestProcessor

PrepRequestProcessor是Leader服务器的请求预处理器，也是Leader服务器的第一个请求处理器。

在ZooKeeper中，我们将那些会改变服务器状态的请求称为“事务请求”——通常指的就是那些创建节点、更新数据、删除节点以及创建会话等请求，PrepRequestProcessor能够识别出当前客户端请求是否是事务请求。

对于事务请求，PrepRequestProcessor 处理器会对其进行一系列预处理，诸如创建请求事务头、事务体，会话检查、ACL检查和版本检查等。

- ProposalRequestProcessor

ProposalRequestProcessor处理器是Leader服务器的事务投票处理器，也是Leader服务器事务处理流程的发起者。

对于非事务请求，ProposalRequestProcessor会直接将请求流转到CommitProcessor处理器，不再做其他处理；而对于事务请求，除了将请求交给CommitProcessor处理器外，还会根据请求类型创建对应的Proposal提议，并发送给所有的 Follower 服务器来发起一次集群内的事务投票。同时，ProposalRequestProcessor 还会将事务请求交付给SyncRequestProcessor 进行事务日志的记录。

- SyncRequestProcessor

SyncRequestProcessor 是事务日志记录处理器，该处理器主要用来将事务请求记录到事务日志文件中去，同时还会触发 ZooKeeper 进行数据快照。

关于ZooKeeper事务日志的记录和数据快照的技术细节，将在7.9.2节和7.9.3节中做详细讲解。

- AckRequestProcessor

AckRequestProcessor处理器是Leader特有的处理器，其主要负责在SyncRequest Processor处理器完成事务日志记录后，向Proposal的投票收集器发送ACK反馈，以通知投票收集器当前服务器已经完成了对该Proposal的事务日志记录。

- CommitProcessor

CommitProcessor是事务提交处理器。对于非事务请求，该处理器会直接将其交付给下一级处理器进行处理；而对于事务请求，CommitProcessor处理器会等待集群内针对Proposal的投票直到该Proposal可被提交。利用CommitProcessor处理器，每个服务器都可以很好地控制对事务请求的顺序处理。

- ToBeCommitProcessor

ToBeCommitProcessor 是一个比较特别的处理器，根据其命名，相信读者也已经理解了该处理器的作用。

ToBeCommitProcessor处理器中有一个toBeApp lied队列，专门用来存储那些已经被CommitProcessor处理过的可被提交的Proposal。

ToBeCommitProcessor处理器将这些请求逐个交付给FinalRequestProcessor处理器进行处理——等到 FinalRequestProcessor 处理器处理完之后，再将其从toBeApplied队列中移除。

- FinalRequestProcessor

FinalRequestProcessor是最后一个请求处理器。该处理器主要用来进行客户端请求返回之前的收尾工作，包括创建客户端请求的响应；针对事务请求，该处理器还会负责将事务应用到内存数据库中去。

- LearnerHandler

为了保持整个集群内部的实时通信，同时也是为了确保可以控制所有的Follower/Observer服务器，Leader服务器会与每一个Follower/Observer服务器都建立一个TCP长连接，同时也会为每个Follower/Observer服务器都创建一个名为LearnerHandler的实体。

LearnerHandler，顾名思义，是ZooKeeper集群中Learner服务器的管理器，主要负责 Follower/Observer 服务器和 Leader 服务器之间的一系列网络通信，包括数据同步、请求转发和Proposal提议的投票等。Leader服务器中保存了所有Follower/Observer对应的LearnerHandler。


# Follower

从角色名字上可以看出，Follower服务器是ZooKeeper集群状态的跟随者，其主要工作有以下三个。

· 处理客户端非事务请求，转发事务请求给Leader服务器。
· 参与事务请求Proposal的投票。
· 参与Leader选举投票。

和Leader服务器一样，Follower也同样使用了采用责任链模式组装的请求处理链来处理每一个客户端请求，由于不需要负责对事务请求的投票处理，因此相对来说 Follower服务器的请求处理链会简单一些，其请求处理链如图7-37所示。

- 图7-37.Follower服务器请求处理链

![Follower](https://img-blog.csdnimg.cn/c8ba58370b3a46e5a38033ddfca5fc9e.png)

从图 7-37 中可以看到，和 Leader 服务器的请求处理链最大的不同点在于，Follower 服务器的第一个处理器换成了FollowerRequestProcessor处理器，同时由于不需要处理事务请求的投票，因此也没有了ProposalRequestProcessor处理器。

- FollowerRequestProcessor

FollowerRequestProcessor是Follower服务器的第一个请求处理器，其主要工作就是识别出当前请求是否是事务请求。

如果是事务请求，那么Follower就会将该事务请求转发给 Leader 服务器，Leader 服务器在接收到这个事务请求后，就会将其提交到请求处理链，按照正常事务请求进行处理。

- SendAckRequestProcessor

SendAckRequestProcessor是Follower服务器上另外一个和Leader服务器有差异的请求处理器。

在 7.7.1 节中，我们讲到过 Leader 服务器上有一个叫AckRequestProcessor的请求处理器，其主要负责在SyncRequestProcessor处理器完成事务日志记录后，向Proposal的投票收集器进行反馈。

而在Follower服务器上，SendAckRequestProcessor处理器同样承担了事务日志记录反馈的角色，在完成事务日志记录后，会向Leader服务器发送ACK消息以表明自身完成了事务日志的记录工作。

两者的唯一区别在于，AckRequestProcessor处理器和Leader服务器在同一个服务器上，因此它的ACK反馈仅仅是一个本地操作；

而SendAckRequestProcessor处理器由于在Follower服务器上，因此需要通过以ACK消息的形式来向Leader服务器进行反馈。

# Observer

Observer是ZooKeeper自3.3.0版本开始引入的一个全新的服务器角色。

从字面意思看，该服务器充当了一个观察者的角色——其观察ZooKeeper集群的最新状态变化并将这些状态变更同步过来。

Observer服务器在工作原理上和Follower基本是一致的，对于非事务请求，都可以进行独立的处理，而对于事务请求，则会转发给Leader服务器进行处理。

和Follower唯一的区别在于，Observer不参与任何形式的投票，包括事务请求Proposal的投票和Leader选举投票。

简单地讲，Observer服务器只提供非事务服务，通常用于在不影响集群事务处理能力的前提下提升集群的非事务处理能力。

另外，Observer的请求处理链路和Follower服务器也非常相近，如图7-38所示。

![Observer](https://img-blog.csdnimg.cn/c7c957848627435f93d533a220038176.png)

- 图7-38.Observer服务器请求处理链

另外需要注意的一点是，虽然在图 7-38 中，Observer 服务器在初始化阶段会将SyncRequestProcessor处理器也组装上去，但是在实际运行过程中，Leader服务器不会将事务请求的投票发送给Observer服务器。

# 集群间消息通信

在7.7.1节中我们讲到过，在整个ZooKeeper集群工作过程中，都是由Leader服务器来负责进行各服务器之间的协调，同时，各服务器之间的网络通信，都是通过不同类型的消息传递来实现的。

在本节中，我们将围绕 ZooKeeper 集群间的消息通信来讲解ZooKeeper集群各服务器之间是如何进行协调的。

ZooKeeper 的消息类型大体上可以分为四类，分别是：数据同步型、服务器初始化型、请求处理型和会话管理型。

## 数据同步型

数据同步型消息是指在Learner和Leader服务器进行数据同步的时候，网络通信所用到的消息，通常有 DIFF、TRUNC、SNAP 和 UPTODATE 四种。

表 7-11 中分别对这四种消息类型进行了详细介绍。

表7-11.ZooKeeper集群间数据同步过程中的消息类型

![数据同步型](https://img-blog.csdnimg.cn/93d22a4d2ee14c5589b88812c532e297.png)

## 服务器初始化型

服务器初始化型消息是指在整个集群或是某些新机器初始化的时候，Leader 和 Learner之间相互通信所使用的消息类型，常见的有 OBSERVERINFO、FOLLOWERINFO、LEADERINFO、ACKEPOCH和NEWLEADER五种。

表7-12中对这五种消息类型进行了详细介绍。

- 表7-12.ZooKeeper集群服务器初始化过程中的消息类型

![服务器初始化型](https://img-blog.csdnimg.cn/4683b1db303e488ea5385fa0f4ad1598.png)

## 请求处理型

请求处理型消息是指在进行请求处理的过程中，Leader和 Learner服务器之间互相通信所使用的消息，常见的有REQUEST、PROPOSAL、ACK、COMMIT、INFORM和SYNC六种。

表7-13中对这六种消息类型进行了详细介绍。

表7-13.ZooKeeper集群请求处理过程中的消息类型

![请求处理型](https://img-blog.csdnimg.cn/f5dd62f455ef459ab89f6648c4be5d92.png)

## 会话管理型

会话管理型消息是指ZooKeeper在进行会话管理的过程中，和Learner服务器之间互相通信所使用的消息，常见的有PING和REVALIDATE两种。

表7-14中对这两种消息类型进行了详细的介绍。

表7-14.ZooKeeper集群会话管理过程中的消息类型

![会话管理型](https://img-blog.csdnimg.cn/3f675a569485426c9e3f38376a1a3a0b.png)

# 参考资料

分布式一致性原理与实践

* any list
{:toc}

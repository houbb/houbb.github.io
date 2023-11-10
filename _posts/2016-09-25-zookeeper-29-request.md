---
layout: post
title: ZooKeeper-29-ZooKeeper 原理之各服务请求 request
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---


# 请求处理

上文中我们已经对一个ZooKeeper集群的启动、Leader选举以及各服务器的工作原理等方面进行了介绍，下面我们一起来看看，针对客户端的一次请求，ZooKeeper 究竟是如何进行处理的。

# 7.8.1 会话创建请求

在 7.3.1 节中，我们曾经介绍了会话创建过程中 ZooKeeper 客户端的大体流程。

在本节中，我们再一起来看看会话创建过程中ZooKeeper服务端的一些流程细节。

ZooKeeper 服务端对于会话创建的处理，大体可以分为请求接收、会话创建、预处理、事务处理、事务应用和会话响应6大环节，其大体流程如图7-39所示。

- 图7-39.会话创建处理——服务端流程示意图

![会话创建请求](https://img-blog.csdnimg.cn/647f23be32f747acbbc5480836d2fc3c.png)


其中事务处理部分的流程详见图7-40所示。

## 请求接收

1.I/O层接收来自客户端的请求。

在ZooKeeper中，NIOServerCnxn实例维护每一个客户端连接，客户端与服务端的所有通信都是由NIOServerCnxn负责的——其负责统一接收来自客户端的所有请求，并将请求内容从底层网络I/O中完整地读取出来。

- 图7-40.请求事务处理流程

![请求事务处理流程](https://img-blog.csdnimg.cn/7700ad4c62c34119b2790e2e954642b7.png)

图7-40.请求事务处理流程
2.判断是否是客户端“会话创建”请求。

NIOServerCnxn 在负责网络通信的同时，自然也承担了客户端会话的载体——每个会话都会对应一个NIOServerCnxn实体。因此，对于每个请求，ZooKeeper都会检查当前NIOServerCnxn实体是否已经被初始化。如果尚未被初始化，那么就可以确定该客户端请求一定是“会话创建”请求。很显然，在会话创建初期，NIOServerCnxn 尚未得到初始化，因此此时的第一个请求必定是“会话创建”请求。

3.反序列化ConnectRequest请求

一旦确定当前客户端请求是“会话创建”请求，那么服务端就可以对其进行反序列化，并生成一个ConnectRequest请求实体。

4.判断是否是ReadOnly客户端。

在ZooKeeper的设计实现中，如果当前ZooKeeper服务器是以ReadOnly模式启动的，那么所有来自非 ReadOnly 型客户端的请求将无法被处理。

因此，针对ConnectRequest，服务端会首先检查其是否是 ReadOnly 客户端，并以此来决定是否接受该“会话创建”请求。

5.检查客户端ZXID。

在正常情况下，同一个ZooKeeper集群中，服务端的ZXID必定大于客户端的ZXID，因此如果发现客户端的 ZXID 值大于服务端的 ZXID 值，那么服务端将不接受该客户端的“会话创建”请求。

6.协商sessionTimeout。

客户端在构造 ZooKeeper 实例的时候，会有一个 sessionTimeout 参数用于指定会话的超时时间。客户端向服务器发送这个超时时间后，服务器会根据自己的超时时间限制最终确定该会话的超时时间——这个过程就是 sessionTimeout协商过程。
默认情况下，ZooKeeper 服务端对超时时间的限制介于 2 个 tickTime 到 20 个tickTime之间。即如果我们设置tickTime值为2000（单位：毫秒）的话，那么服务端就会限制客户端的超时时间，使之介于4秒到40秒之间。读者可以通过zoo.cfg中的相关配置来调整这个超时时间的限制，具体可以参见8.1.2节。

7.判断是否需要重新创建会话。

服务端根据客户端请求中是否包含 sessionID 来判断该客户端是否需要重新创建会话。如果客户端请求中已经包含了sessionID，那么就认为该客户端正在进行会话重连。

在这种情况下，服务端只需要重新打开这个会话，否则需要重新创建。

## 会话创建

8.为客户端生成sessionID。

在为客户端创建会话之前，服务端首先会为每个客户端都分配一个sessionID。分配方式其实很简单，每个 ZooKeeper 服务器在启动的时候，都会初始化一个会话管理器（SessionTracker），同时初始化sessionID，我们将其称为“基准sessionID”。因此针对每个客户端，只需要在这个“基准sessionID”的基础上进行逐个递增就可以了。

由于sessionID是ZooKeeper会话的一个重要标识，许多与会话相关的运行机制都是基于这个 sessionID 的，因此，无论是哪台服务器为客户端分配的 sessionID，都务必保证全局唯一。

在ZooKeeper中，是通过保证“基准sessionID”的全局唯一来确保每次分配的 sessionID 在集群内部都各不相同。

因此，“基准 sessionID”的初始化算法非常重要，在7.4.2节中已经详细介绍了ZooKeeper的会话管理器是如何完成sessionID的初始化工作的。

9.注册会话。

创建会话最重要的工作就是向SessionTracker中注册会话。SessionTracker中维护了两个比较重要的数据结构，分别是sessionsWithTimeout和sessionsById。前者根据sessionID保存了所有会话的超时时间，而后者则是根据sessionID保存了所有会话实体。在会话创建初期，就应该将该客户端会话的相关信息保存到这两个数据结构中，方便后续会话管理器进行管理。

10.激活会话。

向SessionTracker注册完会话后，接下来还需要对会话进行激活操作。激活会话过程涉及ZooKeeper会话管理的分桶策略，在7.4.3节中已经进行了详细讲解，这里就不再赘述。此处，读者需要了解的就是，激活会话的核心是为会话安排一个区块，以便会话清理程序能够快速高效地进行会话清理。

11.生成会话密码。

服务端在创建一个客户端会话的时候，会同时为客户端生成一个会话密码，连同sessionID 一起发送给客户端，作为会话在集群中不同机器间转移的凭证。会话密码的生成算法非常简单，如下：

```java
static final private long superSecret = 0XB3415C00L;
Random r = new Random(sessionId ^ superSecret);

r.nextBytes(password);
```

## 预处理

12.将请求交给ZooKeeper的PrepRequestProcessor处理器进行处理。

ZooKeeper对于每个客户端请求的处理模型采用了典型的责任链模式——每个客户端请求都会由几个不同的请求处理器依次进行处理。

另外，在提交给第一个请求处理器前，ZooKeeper 还会根据该请求所属的会话，进行一次激活会话操作，以确保当前会话处于激活状态。完成会话激活之后，ZooKeeper就会将请求提交给第一个请求处理器：PrepRequestProcessor。

13.创建请求事务头。

对于事务请求，ZooKeeper 首先会为其创建请求事务头。请求事务头是每一个ZooKeeper事务请求中非常重要的一部分，服务端后续的请求处理器都是基于该请求头来识别当前请求是否是事务请求。

请求事务头包含了一个事务请求最基本的一些信息，包括sessionID、ZXID、CXID和请求类型等，如表7-15所示。

表7-15.ZooKeeper请求事务头属性说明

![ZooKeeper请求事务头属性说明](https://img-blog.csdnimg.cn/d74a17d5fac746448c544c814d0800bf.png)

14.创建请求事务体。

对于事务请求，ZooKeeper还会为其创建请求的事务体。在此处由于是“会话创建”请求，因此会创建事务体CreateSessionTxn。

15.注册与激活会话

此处的注册与激活会话过程，和上面步骤9中提到的过程是一致的，虽然重复了，但是读者可以放心，不会引起额外的问题。

此处进行会话注册与激活的目的是处理由非 Leader 服务器转发过来的会话创建请求。

在这种情况下，其实尚未在Leader的SessionTracker中进行会话的注册，因此需要在此处进行一次注册与激活。

## 事务处理

16.将请求交给ProposalRequestProcessor处理器

完成对请求的预处理后，PrepRequestProcessor 处理器会将请求交付给自己的下一级处理器：ProposalRequestProcessor。

ProposalRequestProcessor处理器，顾名思义，是一个与提案相关的处理器。

所谓的提案，是ZooKeeper中针对事务请求所展开的一个投票流程中对事务操作的包装。

从ProposalRequestProcessor处理器开始，请求的处理将会进入三个子处理流程，分别是Sync流程、Proposal流程和Commit流程。

## Sync流程

所谓Sync流程，其核心就是使用SyncRequestProcessor处理器记录事务日志的过程。

ProposalRequestProcessor 处理器在接收到一个上级处理器流转过来的请求后，首先会判断该请求是否是事务请求。

针对每个事务请求，都会通过事务日志的形式将其记录下来。Leader服务器和 Follower服务器的请求处理链路中都会有这个处理器，两者在事务日志的记录功能上是完全一致的。

在 7.9.2 节中，我们将对 ZooKeeper 事务日志的记录过程做更详细的讲解。

完成事务日志记录后，每个Follower服务器都会向Leader服务器发送ACK消息，表明自身完成了事务日志的记录，以便Leader服务器统计每个事务请求的投票情况。

## Proposal流程

在ZooKeeper的实现中，每一个事务请求都需要集群中过半机器投票认可才能被真正应用到ZooKeeper的内存数据库中去，这个投票与统计过程被称为“Proposal流程”。

（1）发起投票。

如果当前请求是事务请求，那么 Leader 服务器就会发起一轮事务投票。在发起事务投票之前，首先会检查当前服务端的ZXID是否可用。关于ZooKeeper的 ZXID 可用性检查，如果当前服务端的 ZXID 不可用，那么将会抛出XidRolloverException异常。

（2）生成提议Proposal

如果当前服务端的ZXID可用，那么就可以开始事务投票了。ZooKeeper会将之前创建的请求头和事务体，以及ZXID和请求本身序列化到Proposal对象中——此处生成的Proposal对象就是一个提议，即针对ZooKeeper服务器状态的一次变更申请。

（3）广播提议。

生成提议后，Leader 服务器会以 ZXID 作为标识，将该提议放入投票箱outstandingProposals中，同时会将该提议广播给所有的Follower服务器。

（4）收集投票。

Follower服务器在接收到Leader发来的这个提议后，会进入Sync流程来进行事务日志的记录，一旦日志记录完成后，就会发送ACK消息给Leader服务器，Leader服务器根据这些ACK消息来统计每个提议的投票情况。

当一个提议获得了集群中过半机器的投票，那么就认为该提议通过，接下去就可以进入提议的Commit阶段了。

（5）将请求放入toBeApplied队列。

在该提议被提交之前，ZooKeeper首先会将其放入toBeApplied队列中去。

（6）广播COMMIT消息。

一旦 ZooKeeper 确认一个提议已经可以被提交了，那么 Leader 服务器就会向Follower和Observer服务器发送COMMIT消息，以便所有服务器都能够提交该提议。

这里需要注意的一点是，由于 Observer 服务器并未参加之前的提议投票，因此 Observer 服务器尚未保存任何关于该提议的信息，所以在广播COMMIT消息的时候，需要区别对待，Leader会向其发送一种被称为“INFORM”的消息，该消息体中包含了当前提议的内容。

而对于 Follower 服务器，由于已经保存了所有关于该提议的信息，因此Leader服务器只需要向其发送ZXID即可。

## Commit流程

（1）将请求交付给CommitProcessor处理器。

CommitProcessor 处理器在收到请求后，并不会立即处理，而是会将其放入queuedRequests队列中。

（2）处理queuedRequests队列请求。

CommitProcessor 处理器会有一个单独的线程来处理从上一级处理器流转下来的请求。当检测到queuedRequests队列中已经有新的请求进来，就会逐个从队列中取出请求进行处理。

（3）标记nextPending。

如果从queuedRequests队列中取出的请求是一个事务请求，那么就需要进行集群中各服务器之间的投票处理，同时需要将 nextPending 标记为当前请求。标记 nextPending 的作用，一方面是为了确保事务请求的顺序性，另一方面也是便于CommitProcessor处理器检测当前集群中是否正在进行事务请求的投票。

（4）等待Proposal投票。

在 Commit 流程处理的同时，Leader 已经根据当前事务请求生成了一个提议Proposal，并广播给了所有的 Follower 服务器。因此，在这个时候，Commit流程需要等待，直到投票结束。

（5）投票通过。

如果一个提议已经获得了过半机器的投票认可，那么将会进入请求提交阶段。ZooKeeper会将该请求放入committedRequests队列中，同时唤醒Commit流程。

（6）提交请求。

一旦发现 committedRequests 队列中已经有可以提交的请求了，那么Commit流程就会开始提交请求。

当然在提交以前，为了保证事务请求的顺序执 行，Commit 流 程 还 会 对 比 之 前 标 记 的 nextPending 和committedRequests队列中第一个请求是否一致。

如果检查通过，那么Commit流程就会将该请求放入toProcess队列中，然后交付给下一个请求处理器：FinalRequestProcessor。

## 事务应用

17.交付给FinalRequestProcessor处理器。

请求流转到FinalRequestProcessor处理器后，也就接近请求处理的尾声了。FinalRequestProcessor 处理器会首先检查 outstandingChanges 队列中请求的有效性，如果发现这些请求已经落后于当前正在处理的请求，那么直接从outstandingChanges队列中移除。

18.事务应用。

在之前的请求处理逻辑中，我们仅仅是将该事务请求记录到了事务日志中去，而内存数据库中的状态尚未变更。

因此，在这个环节，我们需要将事务变更应用到内存数据库中。但是需要注意的一点是，对于“会话创建”这类事务请求，ZooKeeper 做了特殊处理——因为在 ZooKeeper 内存中，会话的管理都是由SessionTracker 负责的，而在会话创建的步骤 9 中，ZooKeeper 已经将会话信息注册到了SessionTracker中，因此此处无须对内存数据库做任何处理，

只需要再次向SessionTracker进行会话注册即可。

19.将事务请求放入队列：commitProposal。
一旦完成事务请求的内存数据库应用，就可以将该请求放入commitProposal队列中。commitProposal队列用来保存最近被提交的事务请求，以便集群间机器进行数据的快速同步。

## 会话响应

客户端请求在经过ZooKeeper服务端处理链路的所有请求处理器的处理后，就进入最后的会话响应阶段了。会话响应阶段非常简单，大体分为以下4个步骤。

20.统计处理。

至此，客户端的“会话创建”请求已经从ZooKeeper请求处理链路上的所有请求处理器间完成了流转。

到这一步，ZooKeeper会计算请求在服务端处理所花费的时间，同时还会统计客户端连接的一些基本信息，包括lastZxid（最新的ZXID）、lastOp（最后一次和服务端的操作）和 lastLatency（最后一次请求处理所花费的时间）等。

21.创建响应ConnectResponse。

ConnectResponse 就是一个会话创建成功后的响应，包含了当前客户端与服务端之间的通信协议版本号protocolVersion、会话超时时间、sessionID和会话密码。

22.序列化ConnectResponse。

23.I/O层发送响应给客户端。

# SetData 请求

在5.3.5节中，我们已经介绍了客户端如何通过SetData接口来更新ZooKeeper服务器上数据节点的内容，在本节中，我们再一起来看看服务端对于 SetData 请求的处理逻辑。

服务端对于SetData请求的处理，大体可以分为4大步骤，分别是请求的预处理、事务处理、事务应用和请求响应，如图7-41所示。

整个事务请求的处理流程和 7.8.1 节中会话创建请求的处理流程非常相近，尤其是事务处理的投票部分，是完全一致的。

因此，对于那些重复的处理步骤，在本节中将不会重点展开讲解。

![SetData](https://img-blog.csdnimg.cn/3c5249f8714b4c46ad4f3e4d956d7ee1.png)

图7-41.事务请求处理——服务端流程示意图

## 预处理

1.I/O层接收来自客户端的请求。

2.判断是否是客户端“会话创建”请求。

ZooKeeper 对于每一个客户端请求，都会检查是否是“会话创建”请求。如果确实是“会话创建”请求，那么就按照7.8.1节中讲解的“会话创建”请求处理流程执行。然而对于 SetData 请求，因为此时已经完成了会话创建，因此按照正常的事务请求进行处理。

3.将请求交给ZooKeeper的PrepRequestProcessor处理器进行处理。

4.创建请求事务头。

5.会话检查。

客户端会话检查是指检查该会话是否有效，即是否已经超时。如果该会话已经超时，那么服务端就会向客户端抛出SessionExpiredException异常。

6.反序列化请求，并创建ChangeRecord记录。

面对客户端请求，ZooKeeper 首先会将其进行反序列化并生成特定的SetDataRequest 请求。SetDataRequest 请求中通常包含了数据节点路径path、更新的数据内容 data 和期望的数据节点版本 version。同时，根据请求中对应的 path，ZooKeeper 会生成一个 ChangeRecord 记录，并放入outstandingChanges队列中。

outstandingChanges队列中存放了当前ZooKeeper服务器正在进行处理的事务请求，以便 ZooKeeper 在处理后续请求的过程中需要针对之前的客户端请求的相关处理，例如对于“会话关闭”请求来说，其需要根据当前正在处理的事务请求来收集需要清理的临时节点，关于会话清理相关的内容，读者可以在7.4.4节中查看具体的临时节点收集过程。

7.ACL检查。

由于当前请求是数据更新请求，因此 ZooKeeper 需要检查该客户端是否具有数据更新的权限。如果没有权限，那么会抛出 NoAuthException 异常。关于ZooKeeper的ACL权限控制，已经在7.1.5节中做了详细讲解。

8.数据版本检查。

在7.1.3节中，我们已经讲解了ZooKeeper可依靠version属性来实现乐观锁机制中的“写入校验”。如果ZooKeeper服务端发现当前数据内容的版本号与客户端预期的版本不匹配的话，那么将会抛出异常。

9.创建请求事务体SetDataTxn。

10.保存事务操作到outstandingChanges队列中去。

## 事务处理

对于事务请求，ZooKeeper 服务端都会发起事务处理流程。无论对于会话创建请求还是SetData 请求，或是其他事务请求，事务处理流程都是一致的，都是由ProposalRequestProcessor 处理器发起，通过 Sync、Proposal 和 Commit 三个子流程相互协作完成的。

## 事务应用

11.交付给FinalRequestProcessor处理器。

12.事务应用。

ZooKeeper会将请求事务头和事务体直接交给内存数据库ZKDatabase进行事务应用，同时返回ProcessTxnResult对象，包含了数据节点内容更新后的stat。

13.将事务请求放入队列：commitProposal。

## 请求响应

14.统计处理。

15.创建响应体SetDataResponse。

SetDataResponse是一个数据更新成功后的响应，主要包含了当前数据节点的最新状态stat。

16.创建响应头。

响应头是每个请求响应的基本信息，方便客户端对响应进行快速的解析，包括当前响应对应的事务ZXID和请求处理是否成功的标识err。

17.序列化响应。

18.I/O层发送响应给客户端。

# 事务请求转发

在事务请求的处理过程中，需要我们注意的一个细节是，**为了保证事务请求被顺序执行，从而确保ZooKeeper集群的数据一致性，所有的事务请求必须由Leader服务器来处理**。

但是，相信读者很容易就会发现一个问题，并不是所有的ZooKeeper都和Leader服务器保持连接，那么如何保证所有的事务请求都由Leader来处理呢？

ZooKeeper实现了非常特别的事务请求转发机制：所有非Leader服务器如果接收到了来自客户端的事务请求，那么必须将其转发给Leader服务器来处理。

在Follower或是Observer服务器中，第一个请求处理器分别是FollowerRequestProcessor和ObserverRequestProcessor，无论是哪个处理器，都会检查当前请求是否是事务请求，如果是事务请求，那么就会将该客户端请求以 REQUEST 消息的形式转发给 Leader 服务器。Leader服务器在接收到这个消息后，会解析出客户端的原始请求，然后提交到自己的请求处理链中开始进行事务请求的处理。

# 7.8.4 GetData 请求

在7.8.2中，我们已经以SetData请求为例，介绍了ZooKeeper服务端对于事务请求的处理流程。

在本节中，我们将以 GetData 请求为例，向读者介绍非事务请求的处理流程。

服务端对于GetData请求的处理，大体可以分为3大步骤，分别是请求的预处理、非事务处理和请求响应，如图7-42所示。

![GetData](https://img-blog.csdnimg.cn/d06e823e34f747888296ed6e6967e8fb.png)

图7-42.非事务请求处理——服务端流程示意图

## 预处理

1.I/O层接收来自客户端的请求。

2.判断是否是客户端“会话创建”请求。

3.将请求交给ZooKeeper的PrepRequestProcessor处理器进行处理。

4.会话检查。

由于 GetData 请求是非事务请求，因此省去了许多事务预处理逻辑，包括创建请求事务头、ChangeRecord和事务体等，以及对数据节点版本的检查。

## 非事务处理

5.反序列化GetDataRequest请求。

6.获取数据节点。

根据步骤5中反序列化出的完整GetDataRequest对象（包括了数据节点的path和Watcher注册情况），ZooKeeper会从内存数据库中获取到该节点及其ACL信息。

7.ACL检查。

8.获取数据内容和stat，注册Watcher。

此处所说的注册Watcher和7.1.4节中讲解的客户端Watcher的注册过程是一致的。

## 请求响应

9.创建响应体GetDataResponse。

GetDataResponse是一个数据获取成功后的响应，主要包含了当前数据节点的内容和状态stat。

10.创建响应头。

11.统计处理。

12.序列化响应。

13.I/O层发送响应给客户端。

# 参考资料

分布式一致性原理与实践

* any list
{:toc}
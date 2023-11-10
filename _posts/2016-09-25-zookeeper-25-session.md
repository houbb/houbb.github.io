---
layout: post
title: ZooKeeper-25-ZooKeeper 原理之会话 session
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---


# 会话

会话（Session）是ZooKeeper中最重要的概念之一，客户端与服务端之间的任何交互操作都与会话息息相关，这其中就包括临时节点的生命周期、客户端请求的顺序执行以及Watcher通知机制等。

在 7.3.1 节中，我们已经讲解了 ZooKeeper 客户端与服务端之间一次会话创建的大体过程。

以 Java 语言为例，简单地说，ZooKeeper 的连接与会话就是客户端通过实例化ZooKeeper对象来实现客户端与服务器创建并保持TCP连接的过程。

在本节中，我们将从会话状态、会话创建和会话管理等方面来讲解ZooKeeper连接与会话的技术内幕。

# 会话状态

在ZooKeeper客户端与服务端成功完成连接创建后，就建立了一个会话。

ZooKeeper会话在整个运行期间的生命周期中，会在不同的会话状态之间进行切换，这些状态一般可以分为CONNECTING、CONNECTED、RECONNECTING、RECONNECTED和CLOSE等。

正如 7.3.1 节中讲的，如果客户端需要与服务端创建一个会话，那么客户端必须提供一个使用字符串表示的服务器地址列表：“host1：port，host2：port，host3：port”。

例如，“192.168.0.1：2181”或是“192.168.0.1：2181，192.168.0.2：2181，192.168.0.3：2181”。一旦客户端开始创建ZooKeeper对象，那么客户端状态就会变成CONNECTING，同时客户端开始从上述服务器地址列表中逐个选取 IP 地址来尝试进行网络连接，直到成功连接上服务器，然后将客户端状态变更为CONNECTED。

通常情况下，伴随着网络闪断或是其他原因，客户端与服务器之间的连接会出现断开情况。

一旦碰到这种情况，ZooKeeper 客户端会自动进行重连操作，同时客户端的状态再次变为CONNECTING，直到重新连接上ZooKeeper服务器后，客户端状态又会再次转变成CONNECTED。

因此，通常情况下，在ZooKeeper运行期间，客户端的状态总是介于CONNECTING和CONNECTED两者之一。

另外，如果出现诸如会话超时、权限检查失败或是客户端主动退出程序等情况，那么客户端的状态就会直接变更为CLOSE。

图7-23展示了ZooKeeper客户端会话状态的变更情况。

![状态流转](https://img-blog.csdnimg.cn/eba92ce4bb3a4efeb2490a5c76131f9e.png)

# 会话创建

在 7.3.1 节中，我们曾经介绍了会话创建过程中 ZooKeeper 客户端的大体工作流程。

在本节中，我们再一起来看看会话创建过程中ZooKeeper服务端的工作原理。

## Session

Session是ZooKeeper中的会话实体，代表了一个客户端会话。其包含以下4个基本属性。

· sessionID：会话 ID，用来唯一标识一个会话，每次客户端创建新会话的时候，ZooKeeper都会为其分配一个全局唯一的sessionID。

· TimeOut：会话超时时间。客户端在构造 ZooKeeper 实例的时候，会配置一个sessionTimeout参数用于指定会话的超时时间。ZooKeeper客户端向服务器发送这个超时时间后，服务器会根据自己的超时时间限制最终确定会话的超时时间。

· TickTime：下次会话超时时间点。为了便于ZooKeeper对会话实行“分桶策略”管理，同时也是为了高效低耗地实现会话的超时检查与清理，ZooKeeper会为每个会话标记一个下次会话超时时间点。TickTime是一个13位的long型数据，其值接近于当前时间加上TimeOut，但不完全相等。关于TickTime的计算方式，将在7.4.3节的“分桶策略”部分做详细讲解。

· isClosing：该属性用于标记一个会话是否已经被关闭。通常当服务端检测到一个会话已经超时失效的时候，会将该会话的 isClosing 属性标记为“已关闭”，这样就能确保不再处理来自该会话的新请求了。

## sessionID

在上面我们也已经提到了，sessionID用来唯一标识一个会话，因此ZooKeeper必须保证sessionID的全局唯一性。

在每次客户端向服务端发起“会话创建”请求时，服务端都会为其分配一个sessionID，现在我们就来看看sessionID究竟是如何生成的。

在SessionTracker初始化的时候，会调用initializeNextSession方法来生成一个初始化的sessionID，之后在ZooKeeper的正常运行过程中，会在该sessionID的基础上为每个会话进行分配，其初始化算法如下：

```java
public long nextId(long id) {

    long nextId = 0;
    nextId = (System.currentTimeMills() << 24) >>> 8;

    nextId = nextId | (id << 56);

    return nextId;
}
```

## SessionTracker

SessionTracker 是 ZooKeeper 服务端的会话管理器，负责会话的创建、管理和清理等工作。

可以说，整个会话的生命周期都离不开 SessionTracker 的管理。

每一个会话在SessionTracker内部都保留了三份，具体如下。

· sessionsById：这是一个 HashMap＜Long，SessionImpl＞类型的数据结构，用于根据sessionID来管理Session实体。

· sessionsWithTimeout：这是一个 `ConcurrentHashMap＜Long，Integer＞` 类型的数据结构，用于根据 sessionID 来管理会话的超时时间。该数据结构和ZooKeeper内存数据库相连通，会被定期持久化到快照文件中去。

· sessionSets：这是一个 `HashMap＜Long，SessionSet＞` 类型的数据结构，用于根据下次会话超时时间点来归档会话，便于进行会话管理和超时检查。在下文“分桶策略”会话管理的介绍中，我们还会对该数据结构进行详细讲解。

## 创建连接

服务端对于客户端的“会话创建”请求的处理，大体可以分为四大步骤，分别是处理ConnectRequest 请求、会话创建、处理器链路处理和会话响应。

在 ZooKeeper服务端，首先将会由NIOServerCnxn来负责接收来自客户端的“会话创建”请求，并反序列化出ConnectRequest请求，然后根据ZooKeeper服务端的配置完成会话超时时间的协商。

随后，SessionTracker 将会为该会话分配一个 sessionID，并将其注册到sessionsById和sessionsWithTimeout中去，同时进行会话的激活。

之后，该“会话请求”还会在ZooKeeper服务端的各个请求处理器之间进行顺序流转，最终完成会话的创建。

关于 ZooKeeper 会话创建的详细过程以及一些细节上的处理，将在 7.8.1 节的“会话创建”部分做详细讲解。

# 会话管理

在上一节中，我们已经讲解了ZooKeeper客户端和服务端之间创建一次会话的整个过程，本节我们将开始讲解ZooKeeper服务端是如何管理这些会话的。

## 分桶策略

ZooKeeper 的会话管理主要是由 SessionTracker 负责的，其采用了一种特殊的会话管理方式，我们称之为“分桶策略”。

所谓**分桶策略，是指将类似的会话放在同一区块中进行管理，以便于 ZooKeeper 对会话进行不同区块的隔离处理以及同一区块的统一处理**。

ooKeeper将所有的会话都分配在了不同的区块之中，分配的原则是每个会话的“下次超时时间点”（ExpirationTime）。

ExpirationTime 是指该会话最近一次可能超时的时间点，对于一个新创建的会话而言，其会话创建完毕后，ZooKeeper就会为其计算ExpirationTime，计算方式如下：

```java
ExpirationTime = CurrentTime + SessiontTimeout;
```

其中CurrentTime指当前时间，单位是毫秒；SessionTimeout指该会话设置的超时时间，单位也是毫秒。

那么，图 7-24 中横坐标所标识的时间，是否就是通过上述公式计算出来的呢？答案是否定的，

在ZooKeeper的实际实现中，还做了一个处理。

ZooKeeper的Leader服务器在运行期间会定时地进行会话超时检查，其时间间隔是ExpirationInterval，单位是毫秒，默认值是 tickTime 的值，即默认情况下，每隔 2000 毫秒进行一次会话超时检查。

为了方便对多个会话同时进行超时检查，完整的ExpirationTime的计算方式如下：

```java
ExpirationTime_ = CurrentTime + SessiontTimeout;
ExpirationTime = (ExpirationTime_ / ExpirationInterval + 1) + ExpirationInterval;
```

就是说，图7-24中横坐标的ExpirationTime值总是ExpirationInterval的整数倍数。举个实际例子，假设当前时间的毫秒表示是 1370907000000，客户端会话设置的超时时间是15000毫秒，ZooKeeper服务器设置的tickTime为2000毫秒，那么ExpirationInterval的值同样为2000毫秒，于是我们可以计算该会话的ExpirationTime值为1370907016000。

## 会话激活

为了保持客户端会话的有效性，在ZooKeeper的运行过程中，客户端会在会话超时时间过期范围内向服务端发送 PING 请求来保持会话的有效性，我们俗称“心跳检测”。

同时，服务端需要不断地接收来自客户端的这个心跳检测，并且需要重新激活对应的客户端会话，我们将这个重新激活的过程称为TouchSession。

会话激活的过程，不仅能够使服务端检测到对应客户端的存活性，同时也能让客户端自己保持连接状态。

其主要流程如图7-25所示。

![会话激活](https://img-blog.csdnimg.cn/f7084bd6554e4a928483c3fc7c719b85.png)

图7-25.Leader服务器激活客户端会话流程

1）检验该会话是否已经被关闭。

Leader 会检查该会话是否已经被关闭，如果该会话已经被关闭，那么不再继续激活该会话。

2）计算该会话新的超时时间ExpirationTime_New。

如果该会话尚未关闭，那么就开始激活会话。首先需要计算出该会话下一次超时时间点，使用的就是上面提到的计算公式。

3）定位该会话当前的区块。

获取该会话老的超时时间ExpirationTime_Old，并根据该超时时间来定位到其所在的区块。

4）迁移会话

将该会话从老的区块中取出，放入ExpirationTime_New对应的新区块中，如图7-26所示。

通过以上4步，就基本完成会话激活的过程。

在上面的会话激活过程中，我们可以看到，只要客户端发来心跳检测，那么服务端就会进行一次会话激活。

心跳检测由客户端主动发起，以 PING 请求的形式向服务端发送。但实际上，在 ZooKeeper 服务端的设计中，只要客户端有请求发送到服务端，那么就会触发一次会话激活。因此，总的来讲，大体会出现以下两种情况下的会话激活。

· 只要客户端向服务端发送请求，包括读或写请求，那么就会触发一次会话激活。

· 如果客户端发现在 sessionTimeout/3 时间内尚未和服务器进行过任何通信，即没有向服务端发送任何请求，那么就会主动发起一个PING请求，服务端收到该请求后，就会触发上述第一种情况下的会话激活。

## 会话超时检查

上面我们分别介绍了ZooKeeper会话的分桶管理策略和会话激活的过程，现在我们再来看看ZooKeeper是如何进行会话超时检查的。

在ZooKeeper中，会话超时检查同样是由SessionTracker负责的。SessionTracker中有一个单独的线程专门进行会话超时检查，这里我们将其称为“超时检查线程”，其工作机制的核心思路其实非常简单：逐个依次地对会话桶中剩下的会话进行清理。

在图 7-24 中，我们可以看到，如果一个会话被激活，那么 ZooKeeper 会将其从上一个会话桶迁移到下一个会话桶中，例如图中的 session.n 这个会话，由于触发了会话激活，因此 ZooKeeper 会将其从 expirationTime 1 桶迁移到 expirationTime n 桶中去。

于是，expirationTime 1中留下的所有会话都是尚未被激活的。

因此，超时检查线程的任务就是定时检查出这个会话桶中所有剩下的未被迁移的会话。

那么超时检查线程是如何做到定时检查的呢？这里就和ZooKeeper会话的分桶策略紧密联系起来了。

在会话分桶策略中，我们将ExpirationInterval的倍数作为时间点来分布会话，因此，超时检查线程只要在这些指定的时间点上进行检查即可，这样既提高了会话检查的效率，而且由于是批量清理，因此性能非常好——这也是为什么ZooKeeper要通过分桶策略来管理客户端会话的最主要的原因。

因为在实际生产环境中，一个ZooKeeper集群的客户端会话数可能会非常多，逐个依次检查会话的方式会非常耗费时间。

# 会话清理

当 SessionTracker 的会话超时检查线程整理出一些已经过期的会话后，那么就要开始进行会话清理了。

会话清理的步骤大致可以分为以下7步。

## 1、 标记会话状态为“已关闭”。

由于整个会话清理过程需要一段的时间，因此为了保证在此期间不再处理来自该客户端的新请求，SessionTracker会首先将该会话的isClosing属性标记为true。

这样，即使在会话清理期间接收到该客户端的新请求，也无法继续处理了。

## 2、发起“会话关闭”请求。

为了使对该会话的关闭操作在整个服务端集群中都生效，ZooKeeper 使用了提交“会话关闭”请求的方式，并立即交付给PrepRequestProcessor处理器进行处理。

## 3、收集需要清理的临时节点

在ZooKeeper中，一旦某个会话失效后，那么和该会话相关的临时（EPHEMERAL）节点都需要被一并清除掉。

因此，在清理临时节点之前，首先需要将服务器上所有和该会话相关的临时节点都整理出来。

在 ZooKeeper 的内存数据库中，为每个会话都单独保存了一份由该会话维护的所有临时节点集合，因此在会话清理阶段，只需要根据当前即将关闭的会话的sessionID从内存数据库中获取到这份临时节点列表即可。

但是，在实际应用场景中，情况并没有那么简单，有如下的细节需要处理：在ZooKeeper 处理会话关闭请求之前，正好有以下两类请求到达了服务端并正在处理中。

· 节点删除请求，删除的目标节点正好是上述临时节点中的一个。

· 临时节点创建请求，创建的目标节点正好是上述临时节点中的一个。

对于这两类请求，其共同点都是事务处理尚未完成，因此还没有应用到内存数据库中，所以上述获取到的临时节点列表在遇上这两类事务请求的时候，会存在不一致的情况。
假定我们当前获取的临时节点列表是ephemerals，那么针对第一类请求，我们需要将所有这些请求对应的数据节点路径从ephemerals中移除，以避免重复删除。针对第二类请求，我们需要将所有这些请求对应的数据节点路径添加到ephemerals中去，以删除这些即将会被创建但是尚未保存到内存数据库中去的临时节点。

## 4、添加“节点删除”事务变更。

完成该会话相关的临时节点收集后，ZooKeeper会逐个将这些临时节点转换成“节点删除”请求，并放入事务变更队列outstandingChanges中去。

## 5.删除临时节点。

在上面的步骤中，我们已经收集了所有需要删除的临时节点，并创建了对应的“节点删除”请求，FinalRequestProcessor 处理器会触发内存数据库，删除该会话对应的所有临时节点。

## 6.移除会话。

完成节点删除后，需要将会话从 SessionTracker 中移除。

主要就是从上面提到的三个数据结构（sessionsById、sessionsWithTimeout和sessionSets）中将该会话移除掉。

## 7.关闭NIOServerCnxn。

最后，从NIOServerCnxnFactory找到该会话对应的NIOServerCnxn，将其关闭。

# 重连

在 7.4.1 节中，我们已经讲过，当客户端和服务端之间的网络连接断开时，ZooKeeper客户端会自动进行反复的重连，直到最终成功连接上ZooKeeper集群中的一台机器。

在这种情况下，再次连接上服务端的客户端有可能会处于以下两种状态之一。

## CONNECTED

如果在会话超时时间内重新连接上了 ZooKeeper 集群中任意一台机器，那么被视为重连成功。

## EXPIRED

如果是在会话超时时间以外重新连接上，那么服务端其实已经对该会话进行了会话清理操作，因此再次连接上的会话将被视为非法会话。

在本章前面几节关于会话生命周期的讲解中，我们已经了解到，在ZooKeeper中，客户端与服务端之间维持的是一个长连接，在sessionTimeout时间内，服务端会不断地检测该客户端是否还处于正常连接——服务端会将客户端的每次操作视为一次有效的心跳检测来反复地进行会话激活。因此，在正常情况下，客户端会话是一直有效的。

然而，当客户端与服务端之间的连接断开后，用户在客户端可能主要会看到两类异常：CONNECTION_LOSS（连接断开）和SESSION_EXPIRED（会话过期）。

那么该如何正确处理CONNECTION_LOSS和SESSION_EXPIRED呢？

## 连接断开：CONNECTION_LOSS

有时会因为网络闪断导致客户端与服务器断开连接，或是因为客户端当前连接的服务器出现问题导致连接断开，我们统称这类问题为“客户端与服务器连接断开”现象，即CONNECTION_LOSS。

在这种情况下，ZooKeeper客户端会自动从地址列表中重新逐个选取新的地址并尝试进行重新连接，直到最终成功连接上服务器。

举个例子，假设某应用在使用 ZooKeeper 客户端进行 setData 操作的时候，正好出现了CONNECTION_LOSS现象，那么客户端会立即接收到事件None-Disconnected通知，同时会抛出异常：org.apache.zookeeper.KeeperException$ConnectionLossExcep tion。

在这种情况下，我们的应用需要做的事情就是捕获住Connection LossException，然后等待ZooKeeper的客户端自动完成重连。一旦客户端成功连接上一台ZooKeeper机器后，那么客户端就会收到事件None-SyncConnected通知，之后就可以重试刚刚出错的setData操作。

## 会话失效：SESSION_EXPIRED

SESSION_EXPIRED是指会话过期，通常发生在CONNECTION_LOSS期间。客户端和服务器连接断开之后，由于重连期间耗时过长，超过了会话超时时间（sessionTimeout）限制后还没有成功连接上服务器，那么服务器认为这个会话已经结束了，就会开始进行会话清理。

但是另一方面，该客户端本身不知道会话已经失效，并且其客户端状态还是DISCONNECTED。

之后，如果客户端重新连接上了服务器，那么很不幸，服务器会告诉客户端该会话已经失效（SESSION_EXPIRED）。

在这种情况下，用户就需要重新实例化一个ZooKeeper对象，并且看应用的复杂情况，重新恢复临时数据。

## 会话转移：SESSION_MOVED

会话转移是指客户端会话从一台服务器机器转移到了另一台服务器机器上。正如上文中提到，假设客户端和服务器 S1 之间的连接断开后，如果通过尝试重连后，成功连接上了新的服务器S2并且延续了有效会话，那么就可以说会话从S1转移到了S2上。

会话转移现象其实在 ZooKeeper 中一直存在，但是在 3.2.0 版本之前，会话转移的概念并没有被明确地提出来，于是就会出现如下所述的异常场景。

假设我们的ZooKeeper服务器集群有三台机器：S1、S2和S3。在开始的时候，客户端C1与服务器S1建立连接且维持着正常的会话，某一个时刻，C1向服务器发送了一个请求R1：setData（‘/$7_4_4/session_moved’，1）。但是在请求发送到服务器之前，客户端和服务器恰好发生了连接断开，并且在很短的时间内重新连接上了新的ZooKeeper服务器S2。

之后，C1又向服务器S2发送了一个请求R2：setData（‘/$7_4_4/session_moved’，2）。这个时候，S2 能够正确地处理请求 R2，但是很不幸的事情发生了，请求 R1 也最终到达了服务器 S1，于是，S1同样处理了请求R1，于是，对于客户端C1来说，它的第2次请求R2就被请求R1覆盖了。
当然，上面这个问题非常罕见，只有在C1和S1之间的网路非常慢的情况下才会发生，读者也可以参见 ZooKeeper 的 ISSUE：ZOOKEEPER-417 了解更多相关的内容。但是，不得不说，一旦发生这个问题，将会产生非常严重的后果。

因此，在 3.2.0 版本之后，ZooKeeper 明确提出了会话转移的概念，同时封装了SessionMovedException异常。之后，在处理客户端请求的时候，会首先检查会话的所有者（Owner）：如果客户端请求的会话 Owner 不是当前服务器的话，那么就会直接抛出SessionMovedException异常。

当然，由于客户端已经和这个服务器断开了连接，因此无法收到这个异常的响应。只有多个客户端使用相同的 sessionId/sessionPasswd创建会话时，才会收到这样的异常。

因为一旦有一个客户端会话创建成功，那么ZooKeeper服务器就会认为该sessionId对应的那个会话已经发生了转移，于是，等到第二个客户端连接上服务器后，就被认为是“会话转移”的情况了。关于sessionId/sessionPasswd的具体用法，已经在5.3.1节中进行了详细讲解。

# 参考资料

分布式一致性原理与实践

* any list
{:toc}

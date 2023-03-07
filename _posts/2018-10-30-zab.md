---
layout: post
title: ZAB-一致性算法
date:  2018-10-30 09:31:33 +0800
categories: [Distributed]
tags: [algorithm, distributed, java, sh]
published: true
---


# 什么是Zab协议？

Zab协议 的全称是 Zookeeper Atomic Broadcast （Zookeeper原子广播）。

Zookeeper 是通过 Zab 协议来保证分布式事务的最终一致性。

Zab协议是为分布式协调服务Zookeeper专门设计的一种支持崩溃恢复的原子广播协议，是Zookeeper保证数据一致性的核心算法。

Zab借鉴了Paxos算法，但又不像Paxos那样，是一种通用的分布式一致性算法。

它是特别为Zookeeper设计的支持崩溃恢复的原子广播协议。

在Zookeeper中主要依赖Zab协议来实现数据一致性，基于该协议，zk实现了一种主备模型（即Leader和Follower模型）的系统架构来保证集群中各个副本之间数据的一致性。
这里的主备系统架构模型，就是指只有一台客户端（Leader）负责处理外部的写事务请求，然后Leader客户端将数据同步到其他Follower节点。

Zookeeper 客户端会随机的链接到 zookeeper 集群中的一个节点，如果是读请求，就直接从当前节点中读取数据；

如果是写请求，那么节点就会向 Leader 提交事务，Leader 接收到事务提交，会广播该事务，只要超过半数节点写入成功，该事务就会被提交。

## 特点

相比Paxos，Zab最大的特点是保证强一致性(strong consistency，或叫线性一致性linearizable consistency)。

1）Zab 协议需要确保那些已经在 Leader 服务器上提交（Commit）的事务最终被所有的服务器提交。

2）Zab 协议需要确保丢弃那些只在 Leader 上被提出而没有被提交的事务。

![zab 协议特性](https://upload-images.jianshu.io/upload_images/1053629-d32b630b65a7a0b2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/470/format/webp)

---------------------------------------------------------------------------------------------------------------------

# 直观理解：Zookeeper分布式一致性协议ZAB

ZAB是Zookeeper使用的分布式一致性协议，英文全称是：Zookeeper Atomic Broadcast，因此ZAB也称之为Zookeeper原子广播协议。

在解决分布式一致性方面，Zookeeper并没有使用Paxos，而是采用了ZAB协议。

基于ZAB协议，Zookeeper实现一种**主备模式的系统架构来保持集群中主备副本之间数据的一致性**。

ZAB协议包括两种基本模式：消息广播（Message Broadcasting）和崩溃恢复（Leader Activation）。

下面来详细介绍这两种基本模式的实现过程。

## 消息广播

消息广播是Zookeeper用来保证写入事务一致性的方法，在Zookeeper集群中，存在以下三种角色的节点：

Leader：Zookeeper集群的核心角色，在集群启动或崩溃恢复中通过Follower参与选举产生，**为客户端提供读写服务，并对事务请求进行处理**。

Follower：Zookeeper集群的核心角色，在集群启动或崩溃恢复中参加选举，没有被选上就是这个角色，**为客户端提供读取服务**，也就是处理非事务请求，Follower不能处理事务请求，对于收到的事务请求会转发给Leader。

Observer：观察者角色，**不参加选举，为客户端提供读取服务，处理非事务请求**，对于收到的事务请求会转发给Leader。使用Observer的目的是为了扩展系统，提高读取性能。

下面通过几张图对ZAB的消息广播过程进行简单的介绍。

1) Zookeeper各节点会接收来自客户端的请求，如果是非事务请求，各节点自行进行相应的处理。

若接收到的是客户端的事务请求，如果当前节点是Follower则将该请求转发给当前集群中的Leader节点进行处理。

![处理](https://upload-images.jianshu.io/upload_images/53727-4f5e54ed3eaa3ffc.png)

2) Leader接收到事务处理的请求后，将向所有的Follower节点发出Proposal提议，并等待各Follower的Ack反馈。

在广播事务之前Leader服务器会先给这个事务分配一个全局单调递增的唯一ID，也就是事务ID（zxid），每一个事务必须按照zxid的先后顺序进行处理。

而且Leader服务器会为每一个Follower分配一个单独的队列，然后将需要广播的事务放到队列中。

![广播](https://upload-images.jianshu.io/upload_images/53727-5c507cccac9af7bd.png)

3) 各Follower节点对Leader节点的Proposal进行Ack反馈，Leader对接收到的Ack进行统计，如果**超多半数Follower进行了Ack，此时进行下一步操作**，否则之间向客户端进行事务请求失败的Response。

![超过一半](https://upload-images.jianshu.io/upload_images/53727-87240c31b1eea272.png)

4) 如果Leader节点接收到了超过半数的Ack响应，此时Leader会向所有的Follower发出事务Commit的指令，同时自己也执行一次Commit，并向客户端进行事务请求成功的Response。

![成功](https://upload-images.jianshu.io/upload_images/53727-2d0f4e7526b50878.png)

Zookeeper的消息广播过程类似 2PC（Two Phase Commit），ZAB **仅需要超过一半以上的Follower返回 Ack 信息就可以执行提交，大大减小了同步阻塞，提高了可用性**。

## 崩溃恢复

在Zookeeper集群启动、运行过程中，如果Leader出现崩溃、网络断开、服务停止或重启等异常情况，或集群中有新服务器加入时，ZAB会让当前集群快速进入崩溃恢复模式并选举出新的Leader节点，在此期间整个集群**不对外提供任何读取服务**。

当产生了新的Leader后并集群中过半Follower完成了与Leader的状态同步，那么ZAB协议就会让Zookeeper集群从崩溃恢复模式转换成消息广播模式。

崩溃恢复的目的就是保证当前Zookeeper集群快速选举出一个新的Leader并完成与其他Follower的状态同步，以便尽快进入消息广播模式对外提供服务。

Zookeeper崩溃恢复的主要任务就是选举Leader（Leader Election），Leader选举分两个场景：一个是Zookeeper服务器启动时Leader选举，另一个是Zookeeper集群运行过程中Leader崩溃后的Leader选举。

### 参数

在详细介绍Leader选举过程之前，需要先介绍几个参数：

myid: 服务器ID，这个是在安装Zookeeper时配置的，myid越大，该服务器在选举中被选为Leader的优先级会越大。

zxid: 事务ID，这个是由Zookeeper集群中的Leader节点进行Proposal时生成的全局唯一的事务ID，由于只有Leader才能进行Proposal，所以这个zxid很容易做到全局唯一且自增。因为Follower没有生成zxid的权限。zxid越大，表示当前节点上提交成功了最新的事务，这也是为什么在崩溃恢复的时候，需要优先考虑zxid的原因。

epoch: 投票轮次，每完成一次Leader选举的投票，当前Leader节点的epoch会增加一次。在没有Leader时，本轮此的epoch会保持不变。

优先选择 myid + zxid 最大的数据。

另外在选举的过程中，每个节点的当前状态会在以下几种状态之中进行转变。

    LOOKING: 竞选状态。

    FOLLOWING: 随从状态，同步Leader 状态，参与Leader选举的投票过程。

    OBSERVING: 观察状态，同步Leader 状态，不参与Leader选举的投票过程。

    LEADING: 领导者状态。

### 集群启动时的Leader选举

假设现在存在一个由5个Zookeeper服务器组成的集群Sever1，Sever2，Sever3，Sever4和Sever5，集群的myid分别为：1， 2，3，4，5。

依次按照myid递增的顺序进行启动。

由于**刚启动时zxid和epoch都为0，因此Leader选举的关键因素成了myid**。

1. 启动Sever1，此时整个集群中只有Sever1启动，Sever1无法与其他任何服务建立通信，立即进入LOOKING状态，此时Server1给自己投1票（上来都觉得自己可以做Leader），由于1不大于集群总数的一半，即2，此时Sever1保持LOOKING状态。

2. 启动Sever2，此时Sever2与Server1建立通信，Sever1和Sever2互相交换投票信息，Server1投票的myid为1，Server2投票的myid为2，此时选取myid最大的，因此Sever1的投票会变成2，但是由于目前投票Server2的服务器数量为2台，小于集群总数的一半2，因此Sever1和Sever2继续保持LOOKING状态。

3. 启动Sever3，此时三台服务器之间建立了通信，Server3进入LOOKING状态，并与前两台服务器交换投票信息，Server1和Server2的投票信息为2，Server3投票自己，即myid为3，这个时候选择myid最大的作为Leader。此时集群中投票3的服务器数量变成了3台，此时3>2，Sever3立刻变成LEADING状态，Sever1和Sever2变成FOLLOWING状态。

4. 启动Sever4，Sever4进入LOOKING状态并与前三台服务器建立通信，由于集群中已经存在LEADING状态的节点，因此，Sever4立刻变为FOLLOWING状态，此时Sever3依旧处于LEADING状态。

5. 启动动Sever5，Sever5与Sever4一样，在与其他服务器建立通信后会立刻变为FOLLOWING状态，此时Sever3依旧处于LEADING状态。

最终整个Zookeeper集群中，Server3成为Leader，Server1，Server2，Server4和Server5成为Follower，最终Server3的epoch加一。

ps: 启动时，都给自己投一票，选举时，优先按照 myid 对比。超过一半的数量，则成为 leader。

---------------------------------------------------------------------------------------------------------------------

### Leader崩溃时的Leader选举

在Zookeeper集群刚启动的时候，zxid和epoch并不参与群首选举。

但是如果Zookeeper集群在运行了一段时间之后崩溃了，那么epoch和zxid在Leader选举中的重要性将大于myid。

重要性的排序为：`epoch  > zxid  > myid`。

当某一个Follower与Leader失去通信的时候，就会进入Leader选举，此时Follower会跟集群中的其他节点进行通信，但此时会存在两种情况：

1) Follower与Leader失去通信，但此时集群中的Follower并未崩溃，且与其他Follower保持正常通信。此时当该Follower与其他Follower进行通信时，其他Follower会告诉他，老大还活着，这个时候，Follower仅需要与Leader建立通信即可。

2) Leader真的崩溃了，此时集群中所有节点之间会进行通信，当得知老大挂了之后，每个节点都会开启争老大模式，各自会将当前节点最新的epoch，zxid和myid发送出来，参与投票，此时各节点之间会参照 `epoch  > zxid  > myid` 进行Leader选举，最后投票数超过集群数量一般的节点会成为新的Leader。

这种崩溃后的Leader选举机制也很好理解，如果Leader挂了，优先选择集群中最后做过（epoch）Leader的节点为新的Leader节点，其次选取有最新事务提交的节点（zxid）为Leader，最后才按默认的最大机器编号（myid）进行投票。

# 保证数据一致性

ZooKeeper从以下几点保证了数据的一致性

## 顺序一致性

来自任意特定客户端的更新都会按其发送顺序被提交。

也就是说，如果一个客户端将Znode z的值更新为a，在之后的操作中，它又将z的值更新为b，则没有客户端能够在看到z的值是b之后再看到值a（如果没有其他对z的更新）。

## 原子性

每个更新要么成功，要么失败。这意味着如果一个更新失败，则不会有客户端会看到这个更新的结果。

## 单一系统映像

一个客户端无论连接到哪一台服务器，它看到的都是同样的系统视图。

这意味着，如果一个客户端在同一个会话中连接到一台新的服务器，它所看到的系统状态不会比在之前服务器上所看到的更老。

当一台服务器出现故障，导致它的一个客户端需要尝试连接集合体中其他的服务器时，所有滞后于故障服务器的服务器都不会接受该连接请求，除非这些服务器赶上故障服务器。

## 持久性

一个更新一旦成功，其结果就会持久存在并且不会被撤销。

这表明更新不会受到服务器故障的影响。

# Zab 协议实现的作用

1）使用一个单一的主进程（Leader）来接收并处理客户端的事务请求（也就是写请求），并采用了Zab的原子广播协议，将服务器数据的状态变更以事务 proposal （事务提议）的形式广播到所有的副本（Follower）进程上去。

2）保证一个全局的变更序列被顺序引用。

Zookeeper是一个树形结构，很多操作都要先检查才能确定是否可以执行，比如P1的事务t1可能是创建节点"/a"，t2可能是创建节点"/a/bb"，只有先创建了父节点"/a"，才能创建子节点"/a/b"。

为了保证这一点，Zab要保证同一个Leader发起的事务要按顺序被apply，同时还要保证只有先前Leader的事务被apply之后，新选举出来的Leader才能再次发起事务。

3）当主进程出现异常的时候，整个zk集群依旧能正常工作。

# Zab 协议核心

Zab 协议的核心：定义了事务请求的处理方式

1）所有的事务请求必须由一个全局唯一的服务器来协调处理，这样的服务器被叫做 Leader 服务器。其他剩余的服务器则是 Follower 服务器。

2）Leader 服务器负责将一个客户端事务请求，转换成一个事务 Proposal，并将该 Proposal 分发给集群中所有的 Follower 服务器，也就是向所有 Follower 节点发送数据广播请求（或数据复制）

3）分发之后 Leader 服务器需要等待所有 Follower 服务器的反馈（Ack请求），在 Zab 协议中，只要超过半数的Follower服务器进行了正确的反馈后（也就是收到半数以上的Follower的Ack请求），那么 Leader 就会再次向所有的 Follower服务器发送 Commit 消息，要求其将上一个事务 proposal 进行提交。

![zab-core](https://upload-images.jianshu.io/upload_images/1053629-61bd17259d608fc8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/614/format/webp)


# Zab协议内容

Zab 协议包括两种基本的模式：崩溃恢复 和 消息广播

## 协议过程

当整个集群启动过程中，或者当 Leader 服务器出现网络中弄断、崩溃退出或重启等异常时，Zab协议就会 进入崩溃恢复模式，选举产生新的Leader。
当选举产生了新的 Leader，同时集群中有过半的机器与该 Leader 服务器完成了状态同步（即数据同步）之后，Zab协议就会退出崩溃恢复模式，进入消息广播模式。
这时，如果有一台遵守Zab协议的服务器加入集群，因为此时集群中已经存在一个Leader服务器在广播消息，那么该新加入的服务器自动进入恢复模式：找到Leader服务器，并且完成数据同步。同步完成后，作为新的Follower一起参与到消息广播流程中。

## 协议状态切换

当Leader出现崩溃退出或者机器重启，亦或是集群中不存在超过半数的服务器与Leader保存正常通信，Zab 就会再一次进入崩溃恢复，发起新一轮Leader选举并实现数据同步。

同步完成后又会进入消息广播模式，接收事务请求。

## 保证消息有序

在整个消息广播中，Leader会将每一个事务请求转换成对应的 proposal 来进行广播，并且在广播事务 Proposal 之前，Leader服务器会首先为这个事务Proposal分配一个全局单递增的唯一ID，称之为事务ID（即zxid），由于Zab协议需要保证每一个消息的严格的顺序关系，因此必须将每一个proposal按照其zxid的先后顺序进行排序和处理。

# 两种模式

ZAB 协议的两个基本模式：恢复模式和广播模式

# 崩溃恢复

一旦 Leader 服务器出现崩溃或者由于网络原因导致 Leader 服务器失去了与过半 Follower 的联系，那么就会进入崩溃恢复模式。

在 Zab 协议中，为了保证程序的正确运行，整个恢复过程结束后需要选举出一个新的 Leader 服务器。因此 Zab 协议需要一个高效且可靠的 Leader 选举算法，从而确保能够快速选举出新的 Leader。

Leader 选举算法不仅仅需要让 Leader 自己知道自己已经被选举为 Leader，同时还需要让集群中的所有其他机器也能够快速感知到选举产生的新 Leader 服务器。

## 崩溃恢复的处理

崩溃恢复过程中，为了保证数据一致性需要处理特殊情况：

1、已经被leader提交的proposal确保最终被所有的服务器follower提交

2、确保那些只在leader被提出的proposal被丢弃

针对这个要求,如果让leader选举算法能够保证新选举出来的Leader服务器拥有集群中所有机器最高的ZXID事务proposal，就可以保证这个新选举出来的Leader一定具有所有已经提交的提案，也可以省去Leader服务器检查proposal的提交与丢弃的工作。

崩溃恢复主要包括两部分：Leader 选举和数据恢复

当服务启动或者在领导者崩溃后，Zab 就进入了恢复模式，当领导者被选举出来，且大多数server完成了和leader的状态同步以后，恢复模式就结束了。

状态同步保证了leader和server具有相同的系统状态。

# 广播模式：（数据同步）

## 过程

1）在zookeeper集群中，数据副本的传递策略就是采用消息广播模式。

zookeeper中农数据副本的同步方式与二段提交相似，但是却又不同。

二段提交要求协调者必须等到所有的参与者全部反馈ACK确认消息后，再发送commit消息。

要求所有的参与者要么全部成功，要么全部失败。

二段提交会产生严重的阻塞问题。

2）Zab协议中 Leader 等待 Follower 的ACK反馈消息是指“只要半数以上的Follower成功反馈即可，不需要收到全部Follower反馈”

## 图示

![图示](https://upload-images.jianshu.io/upload_images/1053629-447433fdf7a1d7d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/555/format/webp)

一旦Leader已经和多数的Follower进行了状态同步后，他就可以开始广播消息了，即进入广播状态。

这时候当一个Server加入ZooKeeper服务中，它会在恢复模式下启动，发现Leader，并和Leader进行状态同步。待到同步结束，它也参与消息广播。

ZooKeeper 服务一直维持在广播状态，直到Leader崩溃了或者Leader失去了大部分的Followers支持。

广播模式极其类似于分布式事务中的2pc（two-phrase commit 两阶段提交）：即Leader提起一个决议，由Followers进行投票，Leader对投票结果进行计算决定是否通过该决议，如果通过执行该决议（事务），否则什么也不做。

广播协议在所有的通讯过程中使用TCP的FIFO信道，通过使用该信道，使保持有序性变得非常的容易。

通过FIFO信道，消息被有序的deliver。只要收到的消息一被处理，其顺序就会被保存下来。

Leader会广播已经被deliver的Proposal消息。

在发出一个Proposal消息前，Leader会分配给Proposal一个单调递增的唯一id，称之为zxid。

广播是把Proposal封装到消息当中，并添加到指向Follower的输出队列中，通过FIFO信道发送到Follower。

当Follower收到一个Proposal时，会将其写入到磁盘，可以的话进行批量写入。

一旦被写入到磁盘媒介当中，Follower就会发送一个ACK给Leader。

当Leader收到了指定数量的ACK时，Leader将广播commit消息并在本地递交该消息。

当收到Leader发来commit消息时，Follower也会递交该消息。

## 丢弃的事务proposal处理过程：

ZAB协议中使用ZXID作为事务编号，ZXID为64位数字，低32位为一个递增的计数器，每一个客户端的一个事务请求时Leader产生新的事务后该计数器都会加1，
高32位为Leader周期epoch编号，当新选举出一个Leader节点时Leader会取出本地日志中最大事务Proposal的ZXID解析出对应的epoch把该值加1作为新的epoch，将低32位从0开始生成新的ZXID；

ZAB使用epoch来区分不同的Leader周期，能有效避免了不同的leader服务器错误的使用相同的ZXID编号提出不同的事务proposal的异常情况，大大简化了提升了数据恢复流程；

所以这个崩溃的机器启动时，也无法成为新一轮的Leader，因为当前集群中的机器一定包含了更高的epoch的事务proposal。

## 对比 2pc

ZAB协议简化了2PC事务提交：

1. 去除中断逻辑移除，follower要么ack，要么抛弃Leader；

2. leader不需要所有的Follower都响应成功，只要一个多数派ACK即可。

## 消息广播具体步骤

1）客户端发起一个写操作请求。

2）Leader 服务器将客户端的请求转化为事务 Proposal 提案，同时为每个 Proposal 分配一个全局的ID，即zxid。

3）Leader 服务器为每个 Follower 服务器分配一个单独的队列，然后将需要广播的 Proposal 依次放到队列中取，并且根据 FIFO 策略进行消息发送。

4）Follower 接收到 Proposal 后，会首先将其以事务日志的方式写入本地磁盘中，写入成功后向 Leader 反馈一个 Ack 响应消息。

5）Leader 接收到超过半数以上 Follower 的 Ack 响应消息后，即认为消息发送成功，可以发送 commit 消息。

6）Leader 向所有 Follower 广播 commit 消息，同时自身也会完成事务提交。Follower 接收到 commit 消息后，会将上一条事务提交。

zookeeper 采用 Zab 协议的核心，就是只要有一台服务器提交了 Proposal，就要确保所有的服务器最终都能正确提交 Proposal。

这也是 CAP/BASE 实现最终一致性的一个体现。

Leader 服务器与每一个 Follower 服务器之间都维护了一个单独的 FIFO 消息队列进行收发消息，使用队列消息可以做到异步解耦。 

Leader 和 Follower 之间只需要往队列中发消息即可。

如果使用同步的方式会引起阻塞，性能要下降很多。

# 选举过程

和Raft一样，Zab要求唯一Leader参与决议，Zab可以分解成discovery、sync、broadcast三个阶段：

![zab-follower](https://images2015.cnblogs.com/blog/116770/201610/116770-20161025133734734-658183229.jpg)

## discovery

选举产生PL(prospective leader)，PL收集Follower epoch(cepoch)，根据Follower的反馈PL产生newepoch(每次选举产生新Leader的同时产生新epoch，类似Raft的term)

## sync

PL补齐相比Follower多数派缺失的状态、之后各Follower再补齐相比PL缺失的状态，PL和Follower完成状态同步后PL变为正式Leader(established leader)

## broadcast

Leader处理Client的写操作，并将状态变更广播至Follower，Follower多数派通过之后Leader发起将状态变更落地(deliver/commit)

Leader和Follower之间通过心跳判别健康状态，正常情况下Zab处在broadcast阶段，出现Leader宕机、网络隔离等异常情况时Zab重新回到discovery阶段。


# Zab 协议如何保证数据一致性

假设两种异常情况：

1. 一个事务在 Leader 上提交了，并且过半的 Folower 都响应 Ack 了，但是 Leader 在 Commit 消息发出之前挂了。

2. 假设一个事务在 Leader 提出之后，Leader 挂了。

要确保如果发生上述两种情况，数据还能保持一致性，那么 Zab 协议选举算法必须满足以下要求：

Zab 协议崩溃恢复要求满足以下两个要求：

1）确保已经被 Leader 提交的 Proposal 必须最终被所有的 Follower 服务器提交。

2）确保丢弃已经被 Leader 提出的但是没有被提交的 Proposal。

根据上述要求

Zab协议需要保证选举出来的Leader需要满足以下条件：

1）新选举出来的 Leader 不能包含未提交的 Proposal 。

即新选举的 Leader 必须都是已经提交了 Proposal 的 Follower 服务器节点。

2）新选举的 Leader 节点中含有最大的 zxid 。

这样做的好处是可以避免 Leader 服务器检查 Proposal 的提交和丢弃工作。


# Zab 如何数据同步

1）完成 Leader 选举后（新的 Leader 具有最高的zxid），在正式开始工作之前（接收事务请求，然后提出新的 Proposal），Leader 服务器会首先确认事务日志中的所有的 Proposal 是否已经被集群中过半的服务器 Commit。

2）Leader 服务器需要确保所有的 Follower 服务器能够接收到每一条事务的 Proposal ，并且能将所有已经提交的事务 Proposal 应用到内存数据中。

等到 Follower 将所有尚未同步的事务 Proposal 都从 Leader 服务器上同步过啦并且应用到内存数据中以后，Leader 才会把该 Follower 加入到真正可用的 Follower 列表中。


# 如何保证强一致性

了解完Zab的基本原理，我们再来看Zab怎样保证强一致性，Zab通过约束事务先后顺序达到强一致性，先广播的事务先commit、FIFO，Zab称之为primary order(以下简称PO)。

## zxid

实现PO的核心是zxid。

Zab中每个事务对应一个zxid，它由两部分组成：`<e, c>`，e即Leader选举时生成的epoch，c表示当次epoch内事务的编号、依次递增。

假设有两个事务的zxid分别是z、z'，当满足 z.e < z'.e 或者 z.e = z'.e && z.c < z'.c 时，定义z先于z'发生(z < z')。

## 对节点的约束

为实现PO，Zab对Follower、Leader有以下约束：

1. 有事务z和z'，如果Leader先广播z，则Follower需保证先commit z对应的事务

2. 有事务z和z'，z由Leader p广播，z'由Leader q广播，Leader p先于Leader q，则Follower需保证先commit z对应的事务

3. 有事务z和z'，z由Leader p广播，z'由Leader q广播，Leader p先于Leader q，如果Follower已经commit z，则q需保证已commit z才能广播z'

第1、2点保证事务FIFO，第3点保证Leader上具备所有已commit的事务。

相比Paxos，Zab约束了事务顺序、适用于有强一致性需求的场景。


# Zab 数据同步过程中，如何处理需要丢弃的 Proposal

在 Zab 的事务编号 zxid 设计中，zxid是一个64位的数字。

其中低32位可以看成一个简单的单增计数器，针对客户端每一个事务请求，Leader 在产生新的 Proposal 事务时，都会对该计数器加1。

而高32位则代表了 Leader 周期的 epoch 编号。

epoch 编号可以理解为当前集群所处的年代，或者周期。

每次Leader变更之后都会在 epoch 的基础上加1，这样旧的 Leader 崩溃恢复之后，其他Follower 也不会听它的了，因为 Follower 只服从epoch最高的 Leader 命令。

每当选举产生一个新的 Leader ，就会从这个 Leader 服务器上取出本地事务日志充最大编号 Proposal 的 zxid，并从 zxid 中解析得到对应的 epoch 编号，然后再对其加1，之后该编号就作为新的 epoch 值，并将低32位数字归零，由0开始重新生成zxid。

Zab 协议通过 epoch 编号来区分 Leader 变化周期，能够有效避免不同的 Leader 错误的使用了相同的 zxid 编号提出了不一样的 Proposal 的异常情况。

基于以上策略

当一个包含了上一个 Leader 周期中尚未提交过的事务 Proposal 的服务器启动时，当这台机器加入集群中，以 Follower 角色连上 Leader 服务器后，Leader 服务器会根据自己服务器上最后提交的 Proposal 来和 Follower 服务器的 Proposal 进行比对，比对的结果肯定是 Leader 要求 Follower 进行一个回退操作，回退到一个确实已经被集群中过半机器 Commit 的最新 Proposal。


# 实现原理

Zab 节点有三种状态：

## 状态

Following：当前节点是跟随者，服从 Leader 节点的命令。

Leading：当前节点是 Leader，负责协调事务。

Election/Looking：节点处于选举状态，正在寻找 Leader。

代码实现中，多了一种状态：Observing 状态

这是 Zookeeper 引入 Observer 之后加入的，Observer 不参与选举，是只读节点，跟 Zab 协议没有关系。

## 节点的持久状态：

history：当前节点接收到事务 Proposal 的Log

acceptedEpoch：Follower 已经接受的 Leader 更改 epoch 的 newEpoch 提议。

currentEpoch：当前所处的 Leader 年代

lastZxid：history 中最近接收到的Proposal 的 zxid（最大zxid）

# Zab 的四个阶段

## 1、选举阶段（Leader Election）

节点在一开始都处于选举节点，只要有一个节点得到超过半数节点的票数，它就可以当选准 Leader，只有到达第三个阶段（也就是同步阶段），这个准 Leader 才会成为真正的 Leader。

Zookeeper 规定所有有效的投票都必须在同一个轮次中，每个服务器在开始新一轮投票时，都会对自己维护的 logicalClock 进行自增操作。

每个服务器在广播自己的选票前，会将自己的投票箱（recvset）清空。该投票箱记录了所受到的选票。

### 例子

例如：Server_2 投票给 Server_3，Server_3 投票给 Server_1，则Server_1的投票箱为(2,3)、(3,1)、(1,1)。（每个服务器都会默认给自己投票）

前一个数字表示投票者，后一个数字表示被选举者。

票箱中只会记录每一个投票者的最后一次投票记录，如果投票者更新自己的选票，则其他服务器收到该新选票后会在自己的票箱中更新该服务器的选票。

这一阶段的目的就是为了选出一个准 Leader ，然后进入下一个阶段。

协议并没有规定详细的选举算法，后面会提到实现中使用的 Fast Leader Election。

![选举流程](https://upload-images.jianshu.io/upload_images/1053629-cb0c776cef667fcb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/700/format/webp)


## 2、发现阶段（Descovery）

在这个阶段，Followers 和上一轮选举出的准 Leader 进行通信，同步 Followers 最近接收的事务 Proposal。

一个 Follower 只会连接一个 Leader，如果一个 Follower 节点认为另一个 Follower 节点，则会在尝试连接时被拒绝。

被拒绝之后，该节点就会进入 Leader Election 阶段。

这个阶段的主要目的是发现当前大多数节点接收的最新 Proposal，并且准 Leader 生成新的 epoch，让 Followers 接收，更新它们的 acceptedEpoch。

![发现流程](https://upload-images.jianshu.io/upload_images/1053629-c75701e220688a8e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/700/format/webp)


## 3、同步阶段（Synchronization）

同步阶段主要是利用 Leader 前一阶段获得的最新 Proposal 历史，同步集群中所有的副本。

只有当 quorum（超过半数的节点） 都同步完成，准 Leader 才会成为真正的 Leader。

Follower 只会接收 zxid 比自己 lastZxid 大的 Proposal。

![同步阶段（Synchronization）](https://upload-images.jianshu.io/upload_images/1053629-594a86e8224affba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/700/format/webp)


## 4、广播阶段（Broadcast）

到了这个阶段，Zookeeper 集群才能正式对外提供事务服务，并且 Leader 可以进行消息广播。

同时，如果有新的节点加入，还需要对新节点进行同步。

需要注意的是，Zab 提交事务并不像 2PC 一样需要全部 Follower 都 Ack，只需要得到 quorum（超过半数的节点）的Ack 就可以。

![广播阶段（Broadcast）](https://upload-images.jianshu.io/upload_images/1053629-6c9e4297627e4570.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/700/format/webp)


# Paxos、Raft、Zab再比较

除Paxos、Raft和Zab外，Viewstamped Replication(简称VR)也是讨论比较多的一致性协议。

这些协议包含很多共同的内容(Leader、quorum、state machine等)，因而我们不禁要问：Paxos、Raft、Zab和VR等分布式一致性协议区别到底在哪，还是根本就是一回事？

Paxos、Raft、Zab和VR都是解决一致性问题的协议，Paxos协议原文倾向于理论，Raft、Zab、VR倾向于实践，一致性保证程度等的不同也导致这些协议间存在差异。

下图帮助我们理解这些协议的相似点和区别：

![compare](https://images2015.cnblogs.com/blog/116770/201610/116770-20161025213003515-974965973.jpg)

相比Raft、Zab、VR，Paxos更纯粹、更接近一致性问题本源，尽管Paxos倾向理论，但不代表Paxos不能应用于工程。

基于Paxos的工程实践，须考虑具体需求场景(如一致性要达到什么程度)，再在Paxos原始语意上进行包装。

# 协议实现

协议的 Java 版本实现跟上面的定义略有不同，选举阶段使用的是 Fast Leader Election（FLE），它包含了步骤1的发现指责。

因为FLE会选举拥有最新提议的历史节点作为 Leader，这样就省去了发现最新提议的步骤。

实际的实现将发现和同步阶段合并为 Recovery Phase（恢复阶段），所以，Zab 的实现实际上有三个阶段。

## Zab协议三个阶段：

1）选举（Fast Leader Election）

2）恢复（Recovery Phase）

3）广播（Broadcast Phase）

Fast Leader Election（快速选举）

前面提到的 FLE 会选举拥有最新Proposal history （lastZxid最大）的节点作为 Leader，这样就省去了发现最新提议的步骤。

这是基于拥有最新提议的节点也拥有最新的提交记录

## 成为 Leader 的条件：

1）选 epoch 最大的

2）若 epoch 相等，选 zxid 最大的

3）若 epoch 和 zxid 相等，选择 server_id 最大的（zoo.cfg中的myid）

节点在选举开始时，都默认投票给自己，当接收其他节点的选票时，会根据上面的 Leader 条件判断并且更改自己的选票，然后重新发送选票给其他节点。

当有一个节点的得票超过半数，该节点会设置自己的状态为 Leading ，其他节点会设置自己的状态为 Following。

![peer](https://upload-images.jianshu.io/upload_images/1053629-75683fa04d349414.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/700/format/webp)

## Recovery Phase（恢复阶段）

这一阶段 Follower 发送他们的 lastZxid 给 Leader，Leader 根据 lastZxid 决定如何同步数据。

这里的实现跟前面的 Phase 2 有所不同：

Follower 收到 TRUNC 指令会终止 L.lastCommitedZxid 之后的 Proposal ，收到 DIFF 指令会接收新的 Proposal。

- 名词解释

history.lastCommitedZxid：最近被提交的 Proposal zxid

history.oldThreshold：被认为已经太旧的已经提交的 Proposal zxid

![恢复阶段](https://upload-images.jianshu.io/upload_images/1053629-613f99cec1c34e2e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/700/format/webp)

# 拓展阅读

[Raft](https://houbb.github.io/2018/10/30/raft)

[Paxos](https://houbb.github.io/2018/10/30/paxos)

[Vector Lock 时钟向量-一致性算法](https://houbb.github.io/2018/08/31/lock-vector-clock-01)

[时间戳-分布式一致性算法](https://houbb.github.io/2018/08/31/lock-time-series-02)

- 分布式事务

[MVCC](https://houbb.github.io/2018/08/31/sql-mvcc)

[2pc（two-phrase commit 两阶段提交）]()


# 参考资料

[Zookeeper一致性协议原理Zab](https://www.cnblogs.com/hongdada/p/8145075.html)

[分布式事务与一致性算法Paxos & raft & zab](https://blog.csdn.net/followmyinclinations/article/details/52870418)

[分布式系统理论进阶 - Raft、Zab](https://www.cnblogs.com/bangerlee/p/5991417.html)

[Zookeeper——一致性协议:Zab协议](https://www.jianshu.com/p/2bceacd60b8a)

https://zhuanlan.zhihu.com/p/60352367

https://www.jianshu.com/p/0d4d7121f458

* any list
{:toc}
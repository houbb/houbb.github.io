---
layout: post
title: Paxos-一致性算法
date:  2018-10-30 09:00:26 +0800
categories: [Distributed]
tags: [distributed, algorithm, java, sh]
published: true
---

# Paxos 算法

Paxos 算法是莱斯利·兰伯特于1990年提出的一种基于消息传递且具有高度容错特性的一致性算法。

# 问题

分布式系统中的节点通信存在两种模型：共享内存（Shared memory）和消息传递（Messages passing）。

基于消息传递通信模型的分布式系统，不可避免的会发生以下错误：进程可能会慢、被杀死或者重启，消息可能会延迟、丢失、重复，在基础 Paxos 场景中，先不考虑可能出现消息篡改即拜占庭错误的情况。

Paxos 算法解决的问题是在一个可能发生上述异常的分布式系统中如何就某个值达成一致，保证不论发生以上任何异常，都不会破坏决议的一致性。

一个典型的场景是，在一个分布式数据库系统中，如果各节点的初始状态一致，每个节点都执行相同的操作序列，那么他们最后能得到一个一致的状态。

为保证每个节点执行相同的命令序列，需要在每一条指令上执行一个一致性算法以保证每个节点看到的指令一致。

一个通用的一致性算法可以应用在许多场景中，是分布式计算中的重要问题。


# 一个故事

从前，在国王Leslie Lamport的统治下，有个黑暗的希腊城邦叫paxos。

城邦里有3类人，

1. 决策者

2. 提议者

3. 群众

虽然这是一个黑暗的城邦但是很民主，按照议会民主制的政治模式制订法律，群众有什么建议和意见都可以写提案交给提议者，提议者会把提案交给决策者来决策，决策者有奇数个，为什么要奇数个？很简单因为决策的方式很无脑，少数服从多数。

最后决策者把刚出炉的决策昭告天下，群众得知决策结果。

等一下，那哪里黑暗呢？问题就出在“提议者会把提案交给决策者来决策”，那么多提案决策者先决策谁的？谁给的钱多就决策谁的。

那这样会有几个问题，决策者那么多，怎么保证最后决策的是同一个提案，以及怎么保证拿到所有提议者中最高的报价。

聪明又贪婪的决策者想到了一个办法：分两阶段报价。

## 第一阶段

决策者接受所有比他当前持有报价高的报价，且不会通知之前报价的人

提议者给所有决策者报价，若有人比自己报价高就加价，有半数以上决策者接受自己报价就停止报价。

## 第一阶段结束的状态

每个提议者都觉得有半数以上的大佬接受了自己的提案，很开心。

而决策者集团此刻的状态是一致的，半数以上同意的提案只有一个，这个就是报价最高的（因为高的总是可以覆盖低的），具体是谁提的who care，一致就行。

## 第二阶段

提议者去找收过自己钱的大佬签合同，这里有 3 种情况：

1. 大佬都收了别人更高的价，回去拿钱继续贿赂，回到第一阶段重新升级;

2. 大佬收到的最高报价是自己的，美滋滋，半数以上成功签合同，提案成功;

3. 提议者回去拿钱回来继续贿赂的时候发现合同已经被签了且半数以上都签了这个提案，不干了，赶快把自己的提案换成已经签了的提案，再去提给所有大佬，看看能不能分一杯羹遇见还没签的大佬。

## 第二阶段结束的状态

所有提议者手头的提案都是一样的，因为有“赶快把自己的提案换成已经签了的提案”这一步;决策者集团所有成员最终接受的提案是一样的。

好的目的已经达到了，把这个提案昭告天下，让所有群众知道这件事。

故事说完了，用正确的姿势再简单介绍下 paxos

# paxos 算法介绍

## 角色

在 paxos 算法中，分为4种角色：

Acceptor：决策者

Proposer：提议者

Client：产生议题者（群众）

Learner：最终决策学习者（群众）

![roles](https://mmbiz.qpic.cn/mmbiz_png/Buj6EMgMp7SNTsBsSqKK16cXQBk5DFVwvjibNiaPdZssokY1MRiad2waChwFapicgAbxr9P7IwcXNmeYdDWOGzLCfA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


## 阶段一

Proposer向半数以上的Acceptor发送Prepare请求并附上编号N。

若Acceptor收到一个编号为N的Prepare请求，且N大于该Acceptor已经响应过的所有Prepare请求的编号，那么它就会将它已经接受过的编号最大的提案（如果有的话）作为响应反馈给Proposer，同时该Acceptor承诺不再接受任何编号小于N的提案。

Proposer若没有得到半数以上Acceptor的响应，则编号+1继续发起请求。

## 阶段二

如果Proposer收到半数以上Acceptor对其发出的编号为N的Prepare请求的响应，那么它就会发送一个 `[N,提案]` Accept请求给半数以上的Acceptor。

如果Acceptor收到一个针对编号为N的提案的Accept请求，只要该Acceptor没有对编号大于N的Prepare请求做出过响应，它就接受该提案

另外再提一下，在一个Paxos过程只批准一个value，只有被prepare的value且被多数Acceptor接受才能被批准，被批准的value才能被learner。

# 疑问

- 决策者Acceptor为什么要多个？

若只有一个acceptor多个proposer，acceptor可以选任意一个提案，很美好，但是有单点问题。

- 为什么要用“半数以上通过”这个办法来决策？

一个集合不可能同时存在两个半数以上的子集，过半的思想保证提交的value在同一时刻在分布式系统中是唯一的一致的。

这种提交方式不管proposer接受到的消息是接受了谁的提议过半，只保证是有提议过半了的。然后再在第二阶段确定这个过半了的提议，让所有节点知道这件事。因此算法如果能保证value被半数acceptor接受，则意味这此时被认定的value是唯一的。

- 为什么acceptor要接受多个提案？

如果acceptor只能够接受一个提案，则可能发生所有proposer提出的提案都无法达到多数，决策者接收一个就结束了，状态无法一致。


- 当Proposer有很多个的时候，会有什么问题？

很难有一个proposer收到半数以上的回复，进而不断地执行第一阶段的协议，决策收敛速度慢，很久都不能做出一个决策。

- 提案为什么要带上编号（即故事中用来贿赂的钱）？

带上编号是为了决策者可以在自身接受到的提案的对比中做出最终的唯一决策。

试想如果按照提案到达时间对比提案，且不说这样就变成了只接收一个第一到达的提案，还可能因为网络原因每个决策者接受到的提案的先后顺序不一样，凉凉。

- 接着上面的问题，那如果把所有决策者收到的提案汇集起来选出个时间最早的呢？

把提案汇集，这时候肯定需要一个master来做判断，大家有没发现这个master好像就变成了propser，它拿到最早的提案，交给决策者...

其实，这就演变成了paxos的变种协议。

# 后记

为了避免竞争，加快收敛的速度，有人在算法中加入leader来代替propser，且leader在集群中只有一位，也就是说只有leader有权提议。

这时leader会有单点问题，于是又加入了leader选举机制保证健壮性，到目前为止paxos演变的越来越像我下一篇要讲的zab协议了。


# 协议描述

## 节点角色

Paxos协议中，有三类节点：

### Proposer 提案者。 

Proposer 可以有多个， Proposer 提出议案 value ）。

所谓 value ，在工程中可以是任何操作，例如“修改某个变量的值为某个值”、“设置当前 primary 为某个节点”等等。 

Paxos 协议中统一将这些操作抽象为 value。

不同的 Proposer 可以提出不同的甚至矛盾的 value ，例如某个Proposer 提议“将变量 X 设置为 1 ”，另一个 Proposer 提议“将变量 X 设置为 2 ”，但对同一轮 Paxos过程，最多只有一个 value 被批准。

### Acceptor ：批准者。 

Acceptor 有 N 个， Proposer 提出的 value 必须获得超过半数 (N/2+ 的 Ac ceptor 批准后才能通过。 

Acceptor 之间完全对等独立。

### Learner ：学习者。 

Learner 学习被批准的 value 。

所谓学习就是通过读取 各个 Proposer 对 value 的选择结果 ，如果某个 value 被超过半数 Proposer 通过，则 Learner 学习到了这个 value 。 

这里 类似 Quorum 机制，某个 value 需要获得 W=N/2 + 1 的 Acceptor 批准，从而学习者需要至少读取 N/2+1 个 Accpetor ，至多读取 N 个 Acceptor 的结果后，能学习到一个通过的 value 。

上述三类角色只是逻辑上的划分，实践中一个节点可以同时充当这三类角色。

## 流程描述

Paxos 协议一轮一轮的进行，每轮 都有一个编号。

每轮 Paxos 协议可能会批准一个 value，也可能无法批准一个 value。

如果某一轮 Paxos 协议批准了某个 value，则以后各轮 Paxos 只能批准这个value。 

上述各轮协议流程组成了一个 Paxos 协议实例，即一次 Paxos 协议实例只能批准一个 value 这也是 Paxos 协议强一致性的重要体现。

每轮 Paxos 协议分为阶段，准备阶段和批准阶段，在这两个阶段 Proposer 和 Acceptor 有各自的 处理流程。

### Proposer 的流程

（准备阶段）

1. 向所有的 Acceptor 发送消息“ Prepare(b) 这里 b 是 Paxos 的轮数，每轮递增

2. 如果收到任何一个 Acceptor 发送的消息“ Reject( B ))”，则对于这个 Proposer 而言本轮 Paxos 失败，将轮数 b 设置为 B+ 1 后重新步骤 1
（批准阶段，根据收到的 Acceptor 的消息作出不同选择）

3. 如果 接收 到的 Acceptor 的“ Promise(b, v _i ))”消息 达到 N/2+1 个（ N 为 Acceptor 总数，除法取整，下同） v_i 表示 Acceptor 最近一次在 i 轮准过 value v 。

3.1 如果收到的“ Promise(b, v ))”消息中 v 都 为空， Proposer 选择一个 value v ，向 所有 Acceptor 广播 Accept(b, v)

3.2 否则，在所有收到的“ Promise(b, v i ))”消息中 选择 i 最大的 value v 向所有 Acceptor 广 播消息 Accept(b v

4. 如果收到 Nack(B) B)，将轮数 b 设置为 B+1 后重新步骤 1


### Accpetor 流程

（准备阶段）

1. 接受某个 Propeser 的消息 Prepare(b) 。

参数 B 是该 Acceptor 收到的最大 Paxos 轮数编号 V 是 Acceptor 批准的 v alue ，可以为空

1.1 如果 b>B ，回复 Promise(b, V _B ))，设置 B=b; 表示保证不再接受编号小于 b 的提案。

1.2 否则，回复 Reject(B)

（批准阶段）

2. 接收 Accept(b, v）

2.1 如果 b < B, 回复 Nack(B) B)，暗示 propo ser 有一个 更大 编号的提案被这个 Acceptor 接收了

2.2 否则 设置 V=v 。表示这个 Acceptor 批准的 Value 是 v 。广播 Accepted 消息。

# 参考资料

[Paxos 算法](https://zh.wikipedia.org/wiki/Paxos%E7%AE%97%E6%B3%95)

[zookeeper-一个关于paxos的故事](https://mp.weixin.qq.com/s/wVcmjIQf8HwxJQFfsD9W0w)

[如何浅显易懂地解说 Paxos 的算法？](https://www.zhihu.com/question/19787937)

[Paxos 算法详解](https://zhuanlan.zhihu.com/p/31780743)

[Raft 算法和 Paxos 算法](https://yeasy.gitbooks.io/blockchain_guide/content/distribute_system/paxos.html)

[Paxos 算法的两种证明方式](http://www.infoq.com/cn/articles/wechat-paxosstore-paxos-algorithm-protocol)

* any list
{:toc}
---
layout: post
title: 分布式共识(Consensus)：PBFT 算法 拜占庭容错算法
date:  2021-3-06 16:52:15 +0800
categories: [Distributed]
tags: [algorithm, distributed, java, sh]
published: true
---

# PBFT简介

BFT（Byzantine Fault Tolerance）是区块链共识算法中需要解决的一个核心问题。

例如，公有链网络中，比特币和以太访中用的是POW，EOS用的是DPOS。

PBFT一般用于联盟链场景中，它是共识节点较少的情况下BFT的一种解决方案。

PBFT（Practical Byzantine Fault Tolerance）即：实用拜占庭容错算法。

该算法是Miguel Castro（卡斯特罗）和Barbara Liskov（利斯科夫）在1999年提出来的，解决了之前拜占庭容错算法效率不高的问题。

PBFT将算法复杂度由指数级降低到多项式级，使得在实际系统应用中可以用此算法解决拜占庭容错问题。

# 拜占庭协定

关于拜占庭问题，网上也有非常多的解读，这里就不在详述，这里仅给出拜占庭问题算法的结论：

假如节点总数为n，故障节点数为f，当n>3f时才能达成拜占庭协定。即算法在失效节点数量f关于拜占庭协定的更多信息，可以参考：《拜占庭协定》

安全性指的是集群能够达成正确的共识（即：集群的决策值为正确的输入值），并且集群中所有副本数据满足线性一致性（linearizability）。

另外，PBFT算法中，集群通过访问控制来限制失效客户端可能造成的破坏，审核客户端并阻止客户端发起无权执行的操作。

活性指的是系统能在有限的时间内能达成共识。

# PBFT算法基础

PBFT算法采用密码学相关的技术（RSA签名算法、消息验证编码和摘要等）确保消息传递过程中无法被篡改和破坏。

消息包含了公钥签名（RSA算法）、消息验证编码（MAC）和无碰撞哈希函数生成的消息摘要（message digest）。

# PBFT算法

## 算法设计的角色

客户端（c）：向primary发起请求的客户端节点；会触发view change。

主节点（primary）：在收到请求后请求分配序号，排好序后广播。

备份节点（replica，也称副本节点）：接收广播消息，验证请求合法性，投票，触发view change协议来推举新的主节点。

视图（view）：一个view中存在一个主节点和多个副本节点，它描述了一个多副本系统的当前状态。另外，节点是在同一个view上对数据达成共识，不能跨域view。

每个副本节点的状态都包含了服务的整体状态，副本节点上的消息日志(message log)包含了该副本节点接受(accepted)的消息，并且使用一个整数表示副本节点的当前视图编号（记作i）。

## 算法流程介绍

### 1)算法流程

a)简化逻辑

客户端向主节点发送请求 

主节点通过广播将请求发送给其他副本 

所有副本都执行请求并将结果发回客户端 

客户端需要等待f+1个不同副本节点发回相同的结果，作为整个操作的最终结果。

b)流程图

![流程图](https://yqfile.alicdn.com/c9d7eede1ba0304b65e566e74419de9ec6d07fda.jpeg)

c)算法限定条件

PBFT算法有两个限定条件：

所有节点必须是确定性的，即：在给定状态和参数相同的情况下，操作执行的结果必须相同

所有节点必须从相同的状态开始执行

在这两个限定条件下，即使失效的副本节点存在，PBFT算法对所有非失效副本节点的请求执行总顺序达成一致，从而保证安全性。

在每一个View中，首先需要选举一个主节点，例如P节点，其它节点为备份节点，例如B1、B2、B3节点；选举主节点的过程被称之为「View Change」。

d)主节点计算公式

主节点选举其实由以下公式决定：

```
p = v % |R|
```

v是视图编号，p是主节点编号，`|R|` 是副本集合的个数。

### 2)REQUEST

客户端C向主节点P发< REQUEST, o, t, c>请求。

o指请求的具体操作；t指请求时客户端追加的时间戳；c指客户端标识；REQUEST包含消息内容m，以及消息摘要d。客户端C发出请求的时间戳是顺序排列的，后续发出的请求比早先发出的请求拥有更高的时间戳。

主节点P收到客户端C的< REQUEST, o, t, c>请求，需要进行以下校验：

客户端请求REQUEST中消息签名是否正确。

如果验证不通过，则丢弃，否则接受消息，于是进入PRE-PREPARE阶段。

### 3)PRE-PREPARE

此阶段中，主节点给收到的消息分配一个编号n，接着广播一条< PRE-PREPARE, v, n, d>,  m>消息给其他副本节点，并将请求记录到本地历史（log）中。

说明：n主要用于对所有客户端的请求进行排序；v指视图编号；m指消息内容；d指消息摘要。

从< PRE-PREPARE, v, n, d>可以看出，请求消息本身内容（m）是不包含在预准备的消息里面的，这样就能使预准备消息足够小。预准备消息的目的是作为一种证明，确定该请求是在视图v中被赋予了序号n，从而在视图变更的过程中可以追索。
副本节点收到主节点的< PRE-PREPARE, v, n, d>,  m>消息，需要进行以下校验：

REQUEST和PRE-PREPARE消息中签名是否正确。

当前视图编号是v。

该节点从未在视图v中接受过序号为n但是摘要d不同的消息m。

m的消息摘要与消息中d是否一致。

判断n是否在区间[h, H]内

如果验证不通过，则丢弃，否则接受消息，于是进入PREPARE阶段。

### 4)PREPARE

此阶段中，当前副本节点广播一条< PREPARE, v, n, d, i>消息，并且将预准备消息和准备消息写入自己的消息日志。i是当前节点编号。

主节点和副本节点收到< PREPARE, v, n, d, i>消息，需要进行以下校验 ：

消息签名是否正确。

判断n是否在区间[h, H]内。

d是否和当前已收到PRE-PPREPARE中的d相同

如果验证不通过，则丢弃，否则接受消息。PREPARE准备阶段完成的条件为：当前节点i将(m,v,n,i)写入消息日志，从2f个不同副本节点收到的与预准备消息一致的准备消息。满足这两个条件后进入COMMIT阶段。

### 5)COMMIT

此阶段中，当前节点广播一条< COMMIT, v, n, d, i>消息。

主节点和副本节点收到< COMMIT, v, n, d, i>消息，需要进行以下校验：

COMMIT消息签名是否正确。

当前副本节点是否已经收到了同一视图v下的n。

计算m的摘要，并判断和d是否一致。

n是否在区间[h, H]内。

如果验证不通过，则丢弃，否则接受消息。

COMMIT阶段完成的条件是：

任意f+1个正常副本节点集合中prepared(m,v,n,i)为真，这一条确保committed(m,v,n)为真。
prepared(m,v,n,i)为真，并且节点i已经接受了2f+1个确认（包括自身在内）与预准备一致的消息。这一条确保committed-local(m,v,n,i)为真。确认与预准备消息一致的条件是具有相同的视图编号、消息序号和消息摘要。
完成COMMIT阶段后，进入REPLY阶段。

### 6)REPLY

到达此阶段，说明共识已达成，运行客户端的请求操作o，并返回< REPLY, v, t, c, i, r>给客户端。其中v是视图编号，t是时间戳，i是副本的编号，r是请求执行的结果。

如果客户端收到f+1不同节点返回的相同REPLY消息，说明客户端发起的请求已经达成共识，否则如果客户端没有在有限时间内收到足够的回复，客户端将判断是否再次向所有副本节点进行广播请求。为什么客户端收到f+1个不同节点返回相同的REPLY消息，就能认为达成共识了呢？因为失效节点不能超过f，f+1个相同的REPLY消息说明其中至少有一个好节点返回正确的结果了，好节点返回正确的结果，那么就可以认为消息已经得到有效的共识。

如果客户端没有在有限时间内收到回复，请求将向所有副本节点进行广播。如果请求已经在副本节点处理过了，副本就向客户端重发一遍执行结果。如果请求没有在副本节点处理过，该副本节点将把请求转发给主节点。如果主节点没有将该请求进行广播，那么就有认为主节点失效，如果有足够多的副本节点认为主节点失效，则会触发一次视图变更。

另外：根据副本发给客户端的响应为< REPLY,v,t,c,i,r>，客户端通过p = v % |R|可以推到出主节点的编号。以后客户端就能够通过点对点消息向它自己认为的主节点发送请求，然后主节点自动将该请求向所有备份节点进行广播。

## View Change

### a)触发条件

视图改变由以下两个条件之一触发：

副本从一个客户得知，主节点存在不正当行为（例如：伪造数据等）
副本不能收到主节点发出的消息
View Change由副本发起，它们向其他副本发送IHatePrimary消息以启动一个视图改变。注意View Chage不能由拜占庭节点发起。

### b)VIEW-CHANGE的条件

副本持续接收IHatePrimary消息，直到遇到下面两个条件之一：

当接收到超过f+1个IHatePrimary消息
如果收到了其他节点的ViewChange消息。
当遇到这两个条件之一时，将会将广播一条< VIEW-CHANGE, v+1, n, C, P, i>消息，n是最新的stable CheckPoint的编号，C是2f+1验证过的CheckPoint消息集合，P是当前副本节点未完成的请求的PRE-PREPARE和PREPARE消息集合。

### c)NEW-VIEW的条件

当节点收到2f个有效的VIEW-CHANGE消息后，向其他节点广播< NEW-VIEW, v+1, V, O>消息。V是有效的VIEW-CHANGE消息集合。O是主节点重新发起的未经完成的PRE-PREPARE消息集合。PRE-PREPARE消息集合的选取规则：

选取V中最小的stable CheckPoint编号min-s，选取V中prepare消息的最大编号max-s。
在min-s和max-s之间，如果存在P消息集合，则创建< PRE-PREPARE, v+1, n, d>, m>消息。否则创建一个空的PRE-PREPARE消息，即：< PRE-PREPARE, v+1, n, d(null)>, m(null)>, m(null)空消息，d(null)空消息摘要。
副本节点收到主节点的NEW-VIEW消息，验证有效性，有效的话，进入v+1视图，并且开始O中的PRE-PREPARE消息处理流程。

# 垃圾清理

在上面的流程中我们看到，消息的各个环节都会记录日志，这将占用大量空间，所以当请求执行请求后，需要把之前记录的该请求的信息清除掉。

具体过程如下：

每执行完一条请求，该节点会再一次发出广播，就是否可以清除信息在全网达成一致。更好的方案是，执行K条请求后再向全网发起广播，告诉大家它已经将这K条执行完毕；如果大家反馈说这K条我们也执行完毕了，那就可以删除这K条的信息了；接下来再执行K条，完成后再发起一次广播，即每隔K条发起一次全网共识，这个概念叫checkpoint，即每隔K条去征求一下大家的意见，要是获得了大多数的认同（a quorum certificate with 2 f + 1 CHECKPOINT messages (including its own)），就形成了一个 stable checkpoint（记录在第K条的编号）。

这是理想的情况，实际上当副本i向全网发出checkpoint共识后，其他节点可能没有执行完这K条请求，所以副本i不会立即得到响应，它还要继续自己的事情，那这个checkpoint在它那里就不是stable的。

这里有一个处理策略：对该副本来说，它的低水位h等于它上一个stable checkpoint的编号，高水位H=h+L（一般我们设置L是K的倍数，例如2倍），这样即使该副本处理速度很快，它处理的请求编号达到高水位H后也得停一停自己的脚步，直到它的stable checkpoint发生变化，它才能继续向前。

# 算法论证

## 1)主节点宕机，集群是否能正产工作？

集群中各节点间通过心跳监听节点状态，如果leader宕机，那么副本节点将无法收到主节点的心跳，超过一定时间后，副本节点将发起发送IHatePrimary消息给其他节点，以触发View Change。

## 2)如果副本节点宕机，集群是否能够正常工作？

可以，如流程图中的示例。

## 3)如果主节点伪造请求内容，集群数据是否能继续保持可靠？

主节点分别发给副本节点不同的结果，让集群无法达成共识。当发生这种情况时，副本节点因为无法达成共识，认为主节点作恶，此时可以发起「View Change」流程。

假设客户端输入内容是1，主节点将内容改成2后分别发给所有的副本节点，因为副本节点收到的数据都是一致的，可以达成共识（决策值是2），出现这种情况时，集群是否能感知并保持数据可靠？

集群是可以保持可靠的，原理如下：当客户端发送Request给主节点时带有摘要信息（d），这个摘要在整个共识阶段都会用到，并且被所有节点验证，并且最后REPLY给客户端的时候也会返回此信息。

如果整个过程中d一致，那么说明数据是可靠的。如果当客户端收到REPLY中此信息和发送时不一致，则认为数据被篡改了，客户端就会向所有副本发送一条IHatePrimary消息来通知整个不正当的行为，这将导致触发「View Change」。

## 4)View Change后，之前的数据是否会丢失？

在视图改变时，消息中将包含视图最近一次提交的消息，这将用来恢复之前正确历史，见View Change部分。

## 5)所有节点上数据的顺序是否能保持一致？

在上面的流程图中，我们可以看到，PBFT使用了三阶段协议（预准备、准备、确认）实现拜占庭协定。

预准备和准备两个阶段用来确保同一个视图中请求发送的时序性；准备和确认两个阶段用来确保在不同的视图之间的确认请求是严格排序的。

预准备阶段给请求分配了一个序号n，准备阶段如果验证通过，那么这个消息将持久化下来。这可以确保其他节点中持久化下来的消息顺序与主节点一直，即实现同一个视图内的顺序性。

消息经过准备、确认阶段后，说明消息已经达成共识了，并且已经持久化下来了，消息持久化后，顺序也就确定了；即便此时发生了view change，也可以保证消息可靠。

需要注意的是，这里消息的顺序由主节点接受消息分配序号n为准，并不以客户端请求顺序为准，因为客户端有可能后发出的请求，主节点先收到。

# 参考资料

https://developer.aliyun.com/article/758516

https://zhuanlan.zhihu.com/p/53897982

https://www.jianshu.com/p/78e2b3d3af62

https://www.cnblogs.com/zmk-c/p/14535734.html

https://learnblockchain.cn/2019/08/29/pbft

https://learnblockchain.cn/article/2384

https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/design/consensus/pbft.html

https://rigelyoung.github.io/2020/04/12/PBFT%E7%AE%97%E6%B3%95/

http://yangzhe.me/2019/11/25/pbft/

http://www.joca.cn/CN/10.11772/j.issn.1001-9081.2020060900

* any list
{:toc}

---
layout: post
title: 分布式原理：Gossip 协议
date:  2018-10-30 09:31:33 +0800
categories: [Distributed]
tags: [algorithm, distributed, java, sh]
published: true
---

# Gossip

gossip 协议（gossip protocol）又称 epidemic 协议（epidemic protocol），是基于流行病传播方式的节点或者进程之间信息交换的协议，在分布式系统中被广泛使用，比如我们可以使用 gossip 协议来确保网络中所有节点的数据一样。

从 gossip 单词就可以看到，其中文意思是八卦、流言等意思，我们可以想象下绯闻的传播（或者流行病的传播）；

gossip 协议的工作原理就类似于这个。gossip 协议利用一种随机的方式将信息传播到整个网络中，并在一定时间内使得系统内的所有节点数据一致。

Gossip 其实是一种去中心化思路的分布式协议，解决状态在集群中的传播和状态一致性的保证两个问题。

# gossip 优势

## 可扩展性（Scalable）

gossip 协议是可扩展的，一般需要 O（logN） 轮就可以将信息传播到所有的节点，其中 N 代表节点的个数。

每个节点仅发送固定数量的消息，并且与网络中节点数目无法。

在数据传送的时候，节点并不会等待消息的 ack，所以消息传送失败也没有关系，因为可以通过其他节点将消息传递给之前传送失败的节点。系统可以轻松扩展到数百万个进程。

## 容错（Fault-tolerance）

网络中任何节点的重启或者宕机都不会影响 gossip 协议的运行。

## 健壮性（Robust）

gossip 协议是去中心化的协议，所以集群中的所有节点都是对等的，没有特殊的节点，所以任何节点出现问题都不会阻止其他节点继续发送消息。任何节点都可以随时加入或离开，而不会影响系统的整体服务质量（QOS）

## 最终一致性（Convergent consistency）

Gossip 协议实现信息指数级的快速传播，因此在有新信息需要传播时，消息可以快速地发送到全局节点，在有限的时间内能够做到所有节点都拥有最新的数据。

# gossip 协议的类型

前面说了节点会将信息传播到整个网络中，那么节点在什么情况下发起信息交换？这就涉及到 gossip 协议的类型。目前主要有两种方法：

AnTI-Entropy（反熵）：以固定的概率传播所有的数据

Rumor-Mongering（谣言传播）：仅传播新到达的数据

## AnTI-Entropy

AnTI-Entropy 的主要工作方式是：每个节点周期性地随机选择其他节点，然后通过互相交换自己的所有数据来消除两者之间的差异。AnTI-Entropy 这种方法非常可靠，但是每次节点两两交换自己的所有数据会带来非常大的通信负担，以此不会频繁使用。

Anti-Entropy 使用“simple epidemics”的方式，所以其包含两种状态：susceptible 和 infective，这种模型也称为 SI model。处于 infective 状态的节点代表其有数据更新，并且会将这个数据分享给其他节点；处于 susceptible 状态的节点代表其并没有收到来自其他节点的更新。

## Rumor-Mongering

Rumor-Mongering 的主要工作方式是：当一个节点有了新的信息后，这个节点变成活跃状态，并周期性地联系其他节点向其发送新信息。直到所有的节点都知道该新信息。因为节点之间只是交换新信息，所有大大减少了通信的负担。

Rumor-Mongering 使用“complex epidemics”方法，相比 Anti-Entropy 多了一种状态：removed，这种模型也称为 SIR model。处于 removed 状态的节点说明其已经接收到来自其他节点的更新，但是其并不会将这个更新分享给其他节点。

因为 Rumor 消息会在某个时间标记为 removed，然后不会发送给其他节点，所以 Rumor-Mongering 类型的 gossip 协议有极小概率使得更新不会达到所有节点。

一般来说，为了在通信代价和可靠性之间取得折中，需要将这两种方法结合使用。

# gossip 协议的通讯方式

不管是 Anti-Entropy 还是 Rumor-Mongering 都涉及到节点间的数据交互方式，节点间的交互方式主要有三种：Push、Pull 以及 Push&Pull。

Push：发起信息交换的节点 A 随机选择联系节点 B，并向其发送自己的信息，节点 B 在收到信息后更新比自己新的数据，一般拥有新信息的节点才会作为发起节点。

Pull：发起信息交换的节点 A 随机选择联系节点 B，并从对方获取信息。一般无新信息的节点才会作为发起节点。

Push&Pull：发起信息交换的节点 A 向选择的节点 B 发送信息，同时从对方获取数据，用于更新自己的本地数据。

# gossip 算法实现

Gossip 协议是按照流言传播或流行病传播的思想实现的，所以，Gossip 协议的实现算法也是很简单的，下面分别是 Anti-Entropy 和 Rumor-Mongering 的实现伪代码。

![gossip 算法实现](https://file.elecfans.com/web1/M00/83/AE/pIYBAFxKhC-AXHaLAACBREZaOCY740.jpg)

# gossip 在工程上的使用

gossip 协议可以支持以下需求：

Database replication

消息传播

Cluster membership

Failure 检测

Overlay Networks

Aggregations （比如计算平均值、最大值以及总和）

# 小结

综上所述，我们可以得出Gossip是一种去中心化的分布式协议，数据通过节点像病毒一样逐个传播。因为是指数级传播，整体传播速度非常快，很像现在美国失控的2019-nCoV(新冠)一样。

## 优势

它具备以下优势：

扩展性：允许节点的任意增加和减少，新增节点的状态 最终会与其他节点一致。

容错：任意节点的宕机和重启都不会影响 Gossip 消息的传播，具有天然的分布式系统容错特性。

去中心化：无需中心节点，所有节点都是对等的，任意节点无需知道整个网络状况，只要网络连通，任意节点可把消息散播到全网。

一致性收敛：消息会以“一传十的指数级速度”在网络中传播，因此系统状态的不一致可以在很快的时间内收敛到一致。消息传播速度达到了 logN。

简单

## 缺点

同样也存在以下缺点：

消息延迟：节点随机向少数几个节点发送消息，消息最终是通过多个轮次的散播而到达全网；不可避免的造成消息延迟。

消息冗余：节点定期随机选择周围节点发送消息，而收到消息的节点也会重复该步骤；不可避免的引起同一节点消息多次接收，增加消息处理压力。

Gossip协议由于以上的优缺点，所以适合于AP场景的数据一致性处理，常见应用有：P2P网络通信、Apache Cassandra、Redis Cluster、Consul。

# 参考资料

https://www.elecfans.com/jiqiren/858219.html

https://zhuanlan.zhihu.com/p/457098784

* any list
{:toc}
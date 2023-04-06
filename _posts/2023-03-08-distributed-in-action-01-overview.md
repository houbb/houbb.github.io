---
layout: post
title: 分布式一致性原理与实践-01-overview 概览
date:  2023-03-07 +0800
categories: [Distributed]
tags: [distributed, learn, overview, sh]
published: true
---

# 分布式架构

随着计算机系统规模变得越来越大，将所有的业务单元集中部署在一个或若干个大型机上的体系结构，已经越来越不能满足当今计算机系统，尤其是大型互联网系统的快速发展，各种灵活多变的系统架构模型层出不穷。

同时，随着微型计算机的出现，越来越多廉价的PC机成为了各大企业IT架构的首选，分布式的处理方式越来越受到业界的青睐——计算机系统正在经历一场前所未有的从集中式向分布式架构的变革。

# 1.1 从集中式到分布式

自20世纪60年代大型主机被发明出来以后，凭借其超强的计算和I/O处理能力以及在稳定性和安全性方面的卓越表现，在很长一段时间内，大型主机引领了计算机行业以及商业计算领域的发展。

在大型主机的研发上最知名的当属IBM，其主导研发的革命性产品 System/360 系列大型主机，是计算机发展史上的一个里程碑，与波音 707 和福特 T型车齐名，被誉为 20 世纪最重要的三大商业成就，并一度成为了大型主机的代名词。

从那时起，IT界进入了大型主机时代。

伴随着大型主机时代的到来，集中式的计算机系统架构也成为了主流。

在那个时候，由于大型主机卓越的性能和良好的稳定性，其在单机处理能力方面的优势非常明显，使得IT系统快速进入了集中式处理阶段，其对应的计算机系统称为集中式系统。

但从20世纪 80 年代以来，计算机系统向网络化和微型化的发展日趋明显，传统的集中式处理模式越来越不能适应人们的需求。

首先，大型主机的人才培养成本非常之高。通常一台大型主机汇集了大量精密的计算机组件，操作非常复杂，这对一个运维人员掌握其技术细节提出了非常高的要求。

其次，大型主机也是非常昂贵的。通常一台配置较好的 IBM 大型主机，其售价可能在上百万美元甚至更高，因此也只有像政府、金融和电信等企业才有能力采购大型主机。

另外，集中式系统具有明显的单点问题。大型主机虽然在性能和稳定性方面表现卓越，但这并不代表其永远不会出现故障。

一旦一台大型主机出现了故障，那么整个系统将处于不可用状态，其后果相当严重。

最后，随着业务的不断发展，用户访问量迅速提高，计算机系统的规模也在不断扩大，在单一大型主机上进行系统的扩容往往比较困难。

而另一方面，随着 PC机性能的不断提升和网络技术的快速普及，大型主机的市场份额变得越来越小，很多企业开始放弃原来的大型主机，而改用小型机和普通PC服务器来搭建分布式的计算机系统。

其中最为典型的就是阿里巴巴集团的“去 IOE”运动。

从 2008 年开始，阿里巴巴的各项业务都进入了井喷式的发展阶段，这对于后台 IT 系统的计算与存储能力提出了非常高的要求，一味地针对小型机和高端存储进行不断扩容，无疑会产生巨大的成本。同时，集中式的系统架构体系也存在诸多单点问题，完全无法满足互联网应用爆炸式的发展需求。

因此，为了解决业务快速发展给IT系统带来的巨大挑战，从2009年开始，阿里集团启动了“去IOE”计划，其电商系统开始正式迈入分布式系统时代。

## 1.1.1 集中式的特点

所谓的集中式系统就是指由一台或多台主计算机组成中心节点，数据集中存储于这个中心节点中，并且整个系统的所有业务单元都集中部署在这个中心节点上，系统的所有功能均由其集中处理。

也就是说，在集中式系统中，每个终端或客户端机器仅仅负责数据的录入和输出，而数据的存储与控制处理完全交由主机来完成。

集中式系统最大的特点就是部署结构简单。由于集中式系统往往基于底层性能卓越的大型主机，因此无须考虑如何对服务进行多个节点的部署，也就不用考虑多个节点之间的分布式协作问题。

## 1.1.2 分布式的特点

在《分布式系统概念与设计》[1]一书中，对分布式系统做了如下定义：

分布式系统是一个硬件或软件组件分布在不同的网络计算机上，彼此之间仅仅通过消息传递进行通信和协调的系统。

上面这个简单的定义涵盖了几乎所有有效地部署了网络化计算机的系统。

严格地讲，同一个分布式系统中的计算机在空间部署上是可以随意分布的，这些计算机可能被放在不同的机柜上，也可能在不同的机房中，甚至分布在不同的城市。

无论如何，一个标准的分布式系统在没有任何特定业务逻辑约束的情况下，都会有如下几个特征。

### 分布性

分布式系统中的多台计算机都会在空间上随意分布，同时，机器的分布情况也会随时变动。

### 对等性

分布式系统中的计算机没有主/从之分，既没有控制整个系统的主机，也没有被控制的从机，组成分布式系统的所有计算机节点都是对等的。

副本（Replica）是分布式系统最常见的概念之一，指的是分布式系统对数据和服务提供的一种冗余方式。

在常见的分布式系统中，为了对外提供高可用的服务，我们往往会对数据和服务进行副本处理。数据副本是指在不同的节点上持久化同一份数据，当某一个节点上存储的数据丢失时，可以从副本上读取到该数据，这是解决分布式系统数据丢失问题最为有效的手段。

另一类副本是服务副本，指多个节点提供同样的服务，每个节点都有能力接收来自外部的请求并进行相应的处理。

### 并发性

在“问题的提出”部分，我们已经提到过与“更新的并发性”相关的内容。

在一个计算机网络中，程序运行过程中的并发性操作是非常常见的行为，例如同一个分布式系统中的多个节点，可能会并发地操作一些共享的资源，诸如数据库或分布式存储等，如何准确并高效地协调分布式并发操作也成为了分布式系统架构与设计中最大的挑战之一。

### 缺乏全局时钟

在上面的讲解中，我们已经了解到，一个典型的分布式系统是由一系列在空间上随意分布的多个进程组成的，具有明显的分布性，这些进程之间通过交换消息来进行相互通信。

因此，在分布式系统中，很难定义两个事件究竟谁先谁后，原因就是因为分布式系统缺乏一个全局的时钟序列控制。

关于分布式系统的时钟和事件顺序，在 Leslie Lamport[2]的经典论文 Time，Clocks，and the Ordering of Events in a Distributed System[3]中已经做了非常深刻的讲解。

### 故障总是会发生

组成分布式系统的所有计算机，都有可能发生任何形式的故障。

一个被大量工程实践所检验过的黄金定理是：**任何在设计阶段考虑到的异常情况，一定会在系统实际运行中发生，并且，在系统实际运行过程中还会遇到很多在设计时未能考虑到的异常故障**。

所以，除非需求指标允许，在系统设计时不能放过任何异常情况。

## 1.1.3 分布式环境的各种问题

分布式系统体系结构从其出现之初就伴随着诸多的难题和挑战，本节将向读者简要的介绍分布式环境中一些典型的问题。

### 通信异常

从集中式向分布式演变的过程中，必然引入了网络因素，而由于网络本身的不可靠性，因此也引入了额外的问题。

分布式系统需要在各个节点之间进行网络通信，因此每次网络通信都会伴随着网络不可用的风险，网络光纤、路由器或是 DNS 等硬件设备或是系统不可用都会导致最终分布式系统无法顺利完成一次网络通信。

另外，即使分布式系统各节点之间的网络通信能够正常进行，其延时也会远大于单机操作。

通常我们认为在现代计算机体系结构中，单机内存访问的延时在纳秒数量级（通常是10ns左右），而正常的一次网络通信的延迟在 0.1～1ms 左右（相当于内存访问延时的 105～106 倍），如此巨大的延时差别，也会影响消息的收发的过程，因此消息丢失和消息延迟变得非常普遍。

### 网络分区

当网络由于发生异常情况，导致分布式系统中部分节点之间的网络延时不断增大，最终导致组成分布式系统的所有节点中，只有部分节点之间能够进行正常通信，而另一些节点则不能——我们将这个现象称为网络分区，就是俗称的“脑裂”。

当网络分区出现时，分布式系统会出现局部小集群，在极端情况下，这些局部小集群会独立完成原本需要整个分布式系统才能完成的功能，包括对数据的事务处理，这就对分布式一致性提出了非常大的挑战。

### 三态

从上面的介绍中，我们已经了解到了在分布式环境下，网络可能会出现各式各样的问题，因此分布式系统的每一次请求与响应，存在特有的“三态”概念，即**成功、失败与超时**。

在传统的单机系统中，应用程序在调用一个函数之后，能够得到一个非常明确的响应：成功或失败。

而在分布式系统中，由于网络是不可靠的，虽然在绝大部分情况下，网络通信也能够接收到成功或失败的响应，但是当网络出现异常的情况下，就可能会出现超时现象，通常有以下两种情况：

1) 由于网络原因，该请求（消息）并没有被成功地发送到接收方，而是在发送过程就发生了消息丢失现象。

2) 该请求（消息）成功的被接收方接收后，并进行了处理，但是在将响应反馈给发送方的过程中，发生了消息丢失现象。

当出现这样的超时现象时，网络通信的发起方是无法确定当前请求是否被成功处理的。

### 节点故障

节点故障则是分布式环境下另一个比较常见的问题，指的是组成分布式系统的服务器节点出现的宕机或“僵死”现象。通常根据经验来说，每个节点都有可能会出现故障，并且每天都在发生。

# 从ACID到CAP/BASE

在上文中，我们讲解了集中式系统和分布式系统各自的特点，同时也看到了在从集中式系统架构向分布式系统架构变迁的过程中会碰到的一系列问题。

接下来，我们再重点看看在分布式系统事务处理与数据一致性上遇到的种种挑战。

## 1.2.1 ACID

事务（Transaction）是由一系列对系统中数据进行访问与更新的操作所组成的一个程序执行逻辑单元（Unit），狭义上的事务特指数据库事务。

一方面，当多个应用程序并发访问数据库时，事务可以在这些应用程序之间提供一个隔离方法，以防止彼此的操作互相干扰。

另一方面，事务为数据库操作序列提供了一个从失败中恢复到正常状态的方法，同时提供了数据库即使在异常状态下仍能保持数据一致性的方法。

事务具有四个特征，分别是原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）和持久性（Durability），简称为事务的ACID特性。

### 原子性

事务的原子性是指事务必须是一个原子的操作序列单元。事务中包含的各项操作在一次执行过程中，只允许出现以下两种状态之一。

全部成功执行。

全部不执行。

任何一项操作失败都将导致整个事务失败，同时其他已经被执行的操作都将被撤销并回滚，只有所有的操作全部成功，整个事务才算是成功完成。

### 一致性

事务的一致性是指事务的执行不能破坏数据库数据的完整性和一致性，一个事务在执行之前和执行之后，数据库都必须处于一致性状态。

也就是说，事务执行的结果必须是使数据库从一个一致性状态转变到另一个一致性状态，因此当数据库只包含成功事务提交的结果时，就能说数据库处于一致性状态。而如果数据库系统在运行过程中发生故障，有些事务尚未完成就被迫中断，这些未完成的事务对数据库所做的修改有一部分已写入物理数据库，这时数据库就处于一种不正确的状态，或者说是不一致的状态。

### 隔离性

事务的隔离性是指在并发环境中，并发的事务是相互隔离的，一个事务的执行不能被其他事务干扰。也就是说，不同的事务并发操纵相同的数据时，每个事务都有各自完整的数据空间，即一个事务内部的操

作及使用的数据对其他并发事务是隔离的，并发执行的各个事务之间不能互相干扰。

在标准 SQL 规范中，定义了 4 个事务隔离级别，不同的隔离级别对事务的处理不同，如未授权读取、授权读取、可重复读取和串行化[4]。

#### 未授权读取

未授权读取也被称为读未提交（Read Uncommitted），该隔离级别允许脏读取，其隔离级别最低。

换句话说，如果一个事务正在处理一数据，并对其进行了更新，但同时尚未完成事务，因此还没有进行事务提交；而与此同时，允许另一个事务也能够访问该数据。

举个例子来说，事务A和事务B同时进行，事务A在整个执行阶段，会将某数据项的值从1开始，做一系列加法操作（比如说加1操作）直到变成10之后进行事务提交，此时，事务B能够看到这个数据项在事务A操作过程中的所有中间值（如1变成2、2变成3等），而对这一系列的中间值的读取就是未授权读取。

#### 授权读取

授权读取也被称为读已提交（Read Committed），它和未授权读取非常相近，唯一的区别就是授权读取只允许获取已经被提交的数据。

同样以上面的例子来说，事务A和事务B同时进行，事务A进行与上述同样的操作，此时，事务B无法看到这个数据项在事务 A 操作过程中的所有中间值，只能看到最终的 10。

另外，如果说有一个事务C，和事务A进行非常类似的操作，只是事务C是将数据项从10加到20，此时事务B也同样可以读取到20，即授权读取允许不可重复读取。

#### 可重复读取

可重复读取（Repeatable Read），简单地说，就是保证在事务处理过程中，多次读取同一个数据时，其值都和事务开始时刻是一致的。

因此该事务级别禁止了不可重复读取和脏读取，但是有可能出现幻影数据。所谓幻影数据，就是指同样的事务操作，在前后两个时间段内执行对同一个数据项的读取，可能出现不一致的结果。在上面的例子，可重复读取隔离级别能够保证事务 B 在第一次事务操作过程中，始终对数据项读取到 1，但是在下一次事务操作中，即使事务 B（注意，事务名字虽然相同，但是指的是另一次事务操作）采用同样的查询方式，就可能会读取到10或20。

#### 串行化

串行化（Serializable）是最严格的事务隔离级别。它要求所有事务都被串行执行，即事务只能一个接一个地进行处理，不能并发执行。

事务隔离级别越高，就越能保证数据的完整性和一致性，但同时对并发性能的影响也越大。

通常，对于绝大多数的应用程序来说，可以优先考虑将数据库系统的隔离级别设置为授权读取，这能够在避免脏读取的同时保证较好的并发性能。

尽管这种事务隔离级别会导致不可重复读、虚读和第二类丢失更新等并发问题，但较为科学的做法是在可能出现这类问题的个别场合中，由应用程序主动采用悲观锁或乐观锁来进行事务控制。

### 持久性

事务的持久性也被称为永久性，是指一个事务一旦提交，它对数据库中对应数据的状态变更就应该是永久性的。

换句话说，一旦某个事务成功结束，那么它对数据库所做的更新就必须被永久保存下来——即使发生系统崩溃或机器宕机等故障，只要数据库能够重新启动，那么一定能够将其恢复到事务成功结束时的状态。

## 1.2.2 分布式事务

随着分布式计算的发展，事务在分布式计算领域中也得到了广泛的应用。

在单机数据库中，我们很容易能够实现一套满足 ACID 特性的事务处理系统，但在分布式数据库中，数据分散在各台不同的机器上，如何对这些数据进行分布式的事务处理具有非常大的挑战。

在 1.1.3 节中，我们已经讲解了分布式环境中会碰到的种种问题，其中就包括机器宕机和各种网络异常等。尽管存在这种种分布式问题，但是在分布式计算领域，为了保证分布式应用程序的可靠性，分布式事务是无法回避的。

分布式事务是指事务的参与者、支持事务的服务器、资源服务器以及事务管理器分别位于分布式系统的不同节点之上。

通常一个分布式事务中会涉及对多个数据源或业务系统的操作。

我们可以设想一个最典型的分布式事务场景：一个跨银行的转账操作涉及调用两个异地的银行服务，其中一个是本地银行提供的取款服务，另一个则是目标银行提供的存款服务，这两个服务本身是无状态并且是互相独立的，共同构成了一个完整的分布式事务。

如果从本地银行取款成功，但是因为某种原因存款服务失败了，那么就必须回滚到取款前的状态，否则用户可能会发现自己的钱不翼而飞了。

从上面这个例子中，我们可以看到，一个分布式事务可以看作是由多个分布式的操作序列组成的，例如上面例子中的取款服务和存款服务，通常可以把这一系列分布式的操作序列称为子事务。

因此，分布式事务也可以被定义为一种嵌套型的事务，同时也就具有了ACID事务特性。但由于在分布式事务中，各个子事务的执行是分布式的，因此要实现一种能够保证ACID特性的分布式事务处理系统就显得格外复杂。

## 1.2.3 CAP和BASE理论

对于本地事务处理或者是集中式的事务处理系统，很显然我们可以采用已经被实践证明很成熟的 ACID 模型来保证数据的严格一致性。

而在 1.2.2节中，我们也已经看到，随着分布式事务的出现，传统的单机事务模型已经无法胜任。

尤其是对于一个高访问量、高并发的互联网分布式系统来说，如果我们期望实现一套严格满足 ACID 特性的分布式事务，很可能出现的情况就是在系统的可用性和严格一致性之间出现冲突——因为当我们要求分布式系统具有严格一致性时，很可能就需要牺牲掉系统的可用性。

但毋庸置疑的一点是，可用性又是一个所有消费者不允许我们讨价还价的系统属性，比如说像淘宝网这样的在线购物网站，就要求它能够7×24小时不间断地对外提供服务，而对于一致性，则更加是所有消费者对于一个软件系统的刚需。

因此，在可用性和一致性之间永远无法存在一个两全其美的方案，于是如何构建一个兼顾可用性和一致性的分布式系统成为了无数工程师探讨的难题，出现了诸如CAP和BASE这样的分布式系统经典理论。

### CAP定理

2000年7月，来自加州大学伯克利分校的Eric Brewer教授[5]在ACM PODC（Principles of Distributed Computing）会议上，首次提出了著名的CAP猜想[6]。

2年后，来自麻省理工学院的Seth Gilbert和Nancy Lynch从理论上证明了Brewer教授CAP猜想的可行性[7]，从此，CAP理论正式在学术上成为了分布式计算领域的公认定理，并深深地影响了分布式计算的发展。

CAP理论告诉我们，一个分布式系统不可能同时满足一致性（C：Consistency）、可用性（A：Availability）和分区容错性（P：Partition tolerance）这三个基本需求，最多只能同时满足其中的两项。

### 一致性（C）

在分布式环境中，一致性是指数据在多个副本之间是否能够保持一致的特性。

在一致性的需求下，当一个系统在数据一致的状态下执行更新操作后，应该保证系统的数据仍然处于一致的状态。

对于一个将数据副本分布在不同分布式节点上的系统来说，如果对第一个节点的数据进行了更新操作并且更新成功后，却没有使得第二个节点上的数据得到相应的更新，于是在对第二个节点的数据进行读取操作时，获取的依然是老数据（或称为脏数据），这就是典型的分布式数据不一致情况。

在分布式系统中，如果能够做到针对一个数据项的更新操作执行成功后，所有的用户都可以读取到其最新的值，那么这样的系统就被认为具有强一致性（或严格的一致性）。

### 可用性（A）

可用性是指系统提供的服务必须一直处于可用的状态，对于用户的每一个操作请求总是能够在有限的时间内返回结果。

这里我们重点看下“有限的时间内”和“返回结果”。

“有限的时间内”是指，对于用户的一个操作请求，系统必须能够在指定的时间（即响应时间）内返回对应的处理结果，如果超过了这个时间范围，那么系统就被认为是不可用的。

另外，“有限的时间内”是一个在系统设计之初就设定好的系统运行指标，通常不同的系统之间会有很大的不同。比如说，对于一个在线搜索引擎来说，通常在 0.5秒内需要给出用户搜索关键词对应的检索结果。

以 Google为例，搜索“分布式”这一关键词，Google能够在 0.3秒左右的时间，返回大约上千万条检索结果。而对于一个面向 HIVE 的海量数据查询平台来说，正常的一次数据检索时间可能在20 秒到 30 秒之间，而如果是一个时间跨度较大的数据内容查询，“有限的时间”有时候甚至会长达几分钟。

从上面的例子中，我们可以看出，用户对于一个系统的请求响应时间的期望值不尽相同。

但是，无论系统之间的差异有多大，唯一相同的一点就是对于用户请求，系统必须存在一个合理的响应时间，否则用户便会对系统感到失望。

“返回结果”是可用性的另一个非常重要的指标，它要求系统在完成对用户请求的处理后，返回一个正常的响应结果。正常的响应结果通常能够明确地反映出对请求的处理结果，即成功或失败，而不是一个让用户感到困惑的返回结果。

让我们再来看看上面提到的在线搜索引擎的例子，如果用户输入指定的搜索关键词后，返回的结果是一个系统错误，通常类似于“OutOfMemoryError”或“System Has Crashed”等提示语，那么我们认为此时系统是不可用的。

### 分区容错性（P）

分区容错性约束了一个分布式系统需要具有如下特性：分布式系统在遇到任何网络分区故障的时候，仍然需要能够保证对外提供满足一致性和可用性的服务，除非是整个网络环境都发生了故障。

网络分区是指在分布式系统中，不同的节点分布在不同的子网络（机房或异地网络等）中，由于一些特殊的原因导致这些子网络之间出现网络不连通的状况，但各个子网络的内部网络是正常的，从而导致整个系统的网络环境被切分成了若干个孤立的区域。

需要注意的是，组成一个分布式系统的每个节点的加入与退出都可以看作是一个特殊的网络分区。

以上就是对CAP定理中一致性、可用性和分区容错性的讲解，通常使用图1-2所示的示意图来表示CAP定理。

既然在上文中我们提到，一个分布式系统无法同时满足上述三个需求，而只能满足其中的两项，因此在进行对CAP定理的应用时，我们就需要抛弃其中的一项，表1-2所示是抛弃CAP定理中任意一项特性的场景说明。

# BASE理论

BASE是Basically Available（基本可用）、Soft state（软状态）和Eventually consistent （最终一致性）三个短语的简写，是由来自eBay的架构师Dan Pritchett在其文章BASE：An Acid Alternative[8]中第一次明确提出的。

BASE是对CAP中一致性和可用性权衡的结果，其来源于对大规模互联网系统分布式实践的总结，是基于 CAP 定理逐步演化而来的，其核心思想是即使无法做到强一致性（Strong consistency），但每个应用都可以根据自身的业务特点，采用适当的方式来使系统达到最终一致性（Eventual consistency）。

接下来我们着重对BASE中的三要素进行详细讲解。

## 基本可用（Basically Available）

基本可用是指分布式系统在出现不可预知故障的时候，允许损失部分可用性——但请注意，这绝不等价于系统不可用。

以下两个就是

- 响应时间上的损失

正常情况下，一个在线搜索引擎需要在 0.5 秒之内返回给用户相应的查询结果，但由于出现故障（比如系统部分机房发生断电或断网故障），查询结果的响应时间增加到了1～2秒。

- 功能上的损失

正常情况下，在一个电子商务网站上进行购物，消费者几乎能够顺利地完成每一笔订单，但是在一些节日大促购物高峰的时候，由于消费者的购物行为激增，为了保护购物系统的稳定性，部分消费者可能会被引导到一个降级页面。

## 弱状态（Soft state）

弱状态也称为软状态，和硬状态相对，是指允许系统中的数据存在中间状态，并认为该中间状态的存在不会影响系统的整体可用性，即允许系统在不同节点的数据副本之间进行数据同步的过程存在延时。

## 最终一致性（Eventually consistent）

最终一致性强调的是系统中所有的数据副本，在经过一段时间的同步后，最终能够达到一个一致的状态。因此，最终一致性的本质是需要系统保证最终数据能够达到一致，而不需要实时保证系统数据的强一致性。

亚马逊首席技术官Werner Vogels在于2008年发表的一篇经典文章Eventually Consistent-Revisited[9]中，对最终一致性进行了非常详细的介绍。

他认为最终一致性是一种特殊的弱一致性：系统能够保证在没有其他新的更新操作的情况下，数据最终一定能够达到一致的状态，因此所有客户端对系统的数据访问都能够获取到最新的值。

同时，在没有发生故障的前提下，数据达到一致状态的时间延迟，取决于网络延迟、系统负载和数据复制方案设计等因素。

在实际工程实践中，最终一致性存在以下五类主要变种。

- 因果一致性（Causal consistency）

因果一致性是指，如果进程 A 在更新完某个数据项后通知了进程 B，那么进程 B之后对该数据项的访问都应该能够获取到进程A更新后的最新值，并且如果进程B要对该数据项进行更新操作的话，务必基于进程 A 更新后的最新值，即不能发生丢失更新情况。

与此同时，与进程 A 无因果关系的进程 C 的数据访问则没有这样的限制。

- 读己之所写（Read your writes）

读己之所写是指，进程 A 更新一个数据项之后，它自己总是能够访问到更新过的最新值，而不会看到旧值。也就是说，对于单个数据获取者来说，其读取到的数据，一定不会比自己上次写入的值旧。因此，读己之所写也可以看作是一种特殊的因果一致性。

- 会话一致性（Session consistency）

会话一致性将对系统数据的访问过程框定在了一个会话当中：系统能保证在同一个有效的会话中实现“读己之所写”的一致性，也就是说，执行更能操作之后，客户端能够在同一个会话中始终读取到该数据项的最新值。

- 单调读一致性（Monotonic read consistency）

单调读一致性是指如果一个进程从系统中读取出一个数据项的某个值后，那么系统对于该进程后续的任何数据访问都不应该返回更旧的值。

- 单调写一致性（Monotonic write consistency）

单调写一致性是指，一个系统需要能够保证来自同一个进程的写操作被顺序地执行。

以上就是最终一致性的五类常见的变种，在实际系统实践中，可以将其中的若干个变种互相结合起来，以构建一个具有最终一致性特性的分布式系统。

事实上，最终一致性并不是只有那些大型分布式系统才涉及的特性，许多现代的关系型数据库都采用了最终一致性模型。在现代关系型数据库中，大多都会采用同步和异步方式来实现主备数据复制技术。在同步方式中，数据的复制过程通常是更新事务的一部分，因此在事务完成后，主备数据库的数据就会达到一致。

而在异步方式中，备库的更新往往会存在延时，这取决于事务日志在主备数据库之间传输的时间长短，如果传输时间过长或者甚至在日志传输过程中出现异常导致无法及时将事务应用到备库上，那么很显然，从备库中读取的数据将是旧的，因此就出现了数据不一致的情况。当然，无论是采用多次重试还是人为数据订正，关系型数据库还是能够保证最终数据达到一致——这就是系统提供最终一致性保证的经典案例。

总的来说，BASE 理论面向的是大型高可用可扩展的分布式系统，和传统事务的 ACID特性是相反的，它完全不同于ACID的强一致性模型，而是提出通过牺牲强一致性来获得可用性，并允许数据在一段时间内是不一致的，但最终达到一致状态。

但同时，在实际的分布式场景中，不同业务单元和组件对数据一致性的要求是不同的，因此在具体的分布式系统架构设计过程中，ACID特性与BASE理论往往又会结合在一起使用。

# 小结

计算机系统从集中式向分布式的变革伴随着包括分布式网络、分布式事务和分布式数据一致性等在内的一系列问题与挑战，同时也催生了一大批诸如ACID、CAP和BASE等经典理论的快速发展。

本章由计算机系统从集中式向分布式发展的过程展开，围绕在分布式架构发展过程中碰到的一系列问题，结合 ACID、CAP 和 BASE 等分布式事务与一致性方面的经典理论，向读者介绍了分布式架构。

# 参考资料

《分布式一致性原理与实践》

* any list
{:toc}
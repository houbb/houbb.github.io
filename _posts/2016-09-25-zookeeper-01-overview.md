---
layout: post
title: ZooKeeper-01-overview
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# ZooKeeper

ZooKeeper：分布式应用程序的分布式协调服务

ZooKeeper是用于分布式应用程序的分布式，开放源代码协调服务。它公开了一组简单的原语，分布式应用程序可以基于这些原语来实现用于同步，配置维护以及组和命名的更高级别的服务。

您可以现成使用它来实现共识，组管理，领导者选举和状态协议。 

它的设计易于编程，并使用了按照文件系统熟悉的目录树结构样式设置的数据模型。它以Java运行，并且具有Java和C的绑定。

众所周知，协调服务很难做到。它们特别容易出现诸如比赛条件和死锁之类的错误。 

ZooKeeper背后的动机是**减轻分布式应用程序从头开始实施协调服务的责任**。

# 设计目标

ZooKeeper很简单。 

ZooKeeper允许分布式进程通过共享的分层名称空间相互协调，该命名空间的组织方式类似于标准文件系统。名称空间由数据寄存器（在ZooKeeper看来，称为znode）组成，它们类似于文件和目录。与设计用于存储的典型文件系统不同，ZooKeeper数据保留在内存中，这意味着ZooKeeper可以实现高吞吐量和低延迟数。

ZooKeeper实施对高性能，高可用性，严格有序访问加以重视。 ZooKeeper的性能方面意味着它可以在大型的分布式系统中使用。可靠性方面使它不会成为单点故障。严格的排序意味着可以在客户端上实现复杂的同步原语。

（1）ZooKeeper 是高可用的。像它协调的分布式进程一样，ZooKeeper本身也可以在称为集合的一组主机上进行复制。

![zkservice](https://zookeeper.apache.org/doc/r3.6.2/images/zkservice.jpg)

组成ZooKeeper服务的服务器都必须彼此了解。 它们维护内存中的状态图像，以及持久存储中的事务日志和快照。 只要大多数服务器可用，ZooKeeper服务将可用。

客户端连接到单个ZooKeeper服务器。 客户端维护一个TCP连接，通过该连接发送请求，获取响应，获取监视事件并发送心跳。 如果与服务器的TCP连接断开，则客户端将连接到其他服务器。

（2）ZooKeeper 是严格有序的。 

ZooKeeper用一个反映所有ZooKeeper事务顺序的数字标记每个更新。 后续操作可以使用该命令来实现更高级别的抽象，例如同步原语。

（3）ZooKeeper 很快。 

在“读取为主”的工作负载中，它特别快。 

ZooKeeper应用程序可在数千台计算机上运行，并且在读取比写入更常见的情况下，其性能最佳，比率约为10：1。

# 数据模型和分层名称空间

ZooKeeper提供的名称空间与标准文件系统的名称空间非常相似。 

名称是由斜杠（`/`）分隔的一系列路径元素。 

ZooKeeper命名空间中的每个节点都由路径标识。

- ZooKeeper 的层次命名空间

![层次命名空间](https://zookeeper.apache.org/doc/r3.6.2/images/zknamespace.jpg)

# 节点和短暂节点

与标准文件系统不同，ZooKeeper命名空间中的每个节点都可以具有与其关联的数据以及子节点。就像拥有一个文件系统一样，该文件系统也允许文件成为目录。 

（ZooKeeper旨在存储协调数据：状态信息，配置，位置信息等，因此存储在每个节点上的数据通常很小，在字节到千字节范围内。）

我们使用术语znode来明确表示在谈论ZooKeeper数据节点。

Znodes维护一个统计信息结构，其中包括用于数据更改，ACL更改和时间戳的版本号，以允许进行缓存验证和协调更新。 

znode的数据每次更改时，版本号都会增加。

例如，每当客户端检索数据时，它也会接收数据的版本。

原子地读取和写入存储在命名空间中每个znode上的数据。读取将获取与znode关联的所有数据字节，而写入将替换所有数据。每个节点都有一个访问控制列表（ACL），用于限制谁可以执行操作。

ZooKeeper还具有短暂节点的概念。只要创建znode的会话处于活动状态，这些znode就存在。会话结束时，将删除znode。

# 有条件的更新和监视

ZooKeeper支持 wathchs 的概念。

客户端可以在znode上设置监听者（watches）。 

znode更改时，将触发并删除监视。触发监视后，客户端会收到一个数据包，说明znode已更改。如果客户端和其中一个ZooKeeper服务器之间的连接断开，则客户端将收到本地通知。

3.6.0中的新增功能：客户端还可以在znode上设置永久的，递归的监听者，这些监听者在被触发时不会被删除，并且会以递归方式触发已注册znode以及所有子znode的更改。

# 保证（Guarantees）

ZooKeeper非常快速且非常简单。

但是，由于其目标是作为构建更复杂的服务（例如同步）的基础，因此它提供了一组保证。

这些是：

顺序一致性-来自客户端的更新将按照发送的顺序应用。

原子性-更新成功或失败。没有部分结果。

单个系统映像-无论客户端连接到哪个服务器，客户端都将看到相同的服务视图。即，即使客户端故障转移到具有相同会话的其他服务器，客户端也永远不会看到系统的较旧视图。

可靠性-应用更新后，此更新将一直持续到客户端覆盖更新为止。

及时性-确保系统的客户视图在特定时间范围内是最新的。

# 简单的API

ZooKeeper的设计目标之一是提供一个非常简单的编程界面。

因此，它仅支持以下操作：

create：在树中的某个位置创建一个节点

delete：删除节点

exists：测试某个节点是否存在于某个位置

get data：从节点读取数据

set data：将数据写入节点

get children：检索节点的子节点列表

sync：等待数据传播

# 实现

ZooKeeper组件显示ZooKeeper服务的高级组件。 

除请求处理器外，构成ZooKeeper服务的每个服务器都复制其自己的每个组件副本。

![实现](https://zookeeper.apache.org/doc/r3.6.2/images/zkcomponents.jpg)

复制的数据库是包含整个数据树的内存数据库。更新被记录到磁盘以确保可恢复性，并且在将写入应用于内存数据库之前，将写入序列化到磁盘。

每个ZooKeeper服务器都为客户端提供服务。客户端仅连接到一台服务器即可提交请求。读取请求从每个服务器数据库的本地副本提供服务。更改服务状态的请求（写请求）由协议协议处理。

作为协议协议的一部分，来自客户端的所有写请求都转发到称为领导者的单个服务器。其余的ZooKeeper服务器（称为跟随者）从领导者接收消息建议并同意消息传递。消息传递层负责替换出现故障的领导者，并将跟随者与领导者同步。

ZooKeeper使用自定义的原子消息传递协议。由于消息传递层是原子层，因此ZooKeeper可以保证本地副本永远不会发散。领导者收到写请求时，它将计算要应用写操作时系统的状态，并将其转换为捕获此新状态的事务。

ps: 这里比较核心的应该还是分布式一致性协议。

# 用途

ZooKeeper的编程接口刻意简单。 

但是，有了它，您可以实现更高阶的操作，例如同步原语，组成员身份，所有权等。

# 性能

ZooKeeper被设计为具有高性能。 

但是吗？ Yahoo!的ZooKeeper开发团队的结果。 

研究表明确实如此。 （请参见ZooKeeper吞吐量，以了解读写比率的变化。）

由于写入涉及同步所有服务器的状态，因此在读取次数超过写入次数的应用程序中，该性能特别高。 （对于协调服务来说，读取次数多于写入次数）。

![性能](https://zookeeper.apache.org/doc/r3.6.2/images/zkperfRW-3.2.jpg)

ZooKeeper吞吐量随读写比率的变化而变化是ZooKeeper版本3.2在具有两个2Ghz Xeon和两个SATA 15K RPM驱动器的服务器上运行的吞吐量图。 

一个驱动器用作专用的ZooKeeper日志设备。 

快照已写入OS驱动器。 

写请求是1K写，读是1K读。 

“服务器”指示ZooKeeper集合的大小，以及构成该服务的服务器的数量。

大约还有30台其他服务器用于模拟客户端。 
 
ZooKeeper集成配置为使得领导者不允许来自客户端的连接。

# 可靠性

为了显示随着故障注入系统随时间变化的行为，我们运行了由7台机器组成的ZooKeeper服务。 

我们使用与以前相同的饱和度基准，但是这次我们将写入百分比保持在恒定的30％，这是我们预期工作量的保守比率。

![zkperfreliability](https://zookeeper.apache.org/doc/r3.6.2/images/zkperfreliability.jpg)

该图有一些重要的观察结果。 

首先，如果关注者失败并迅速恢复，则ZooKeeper能够在失败的情况下维持高吞吐量。 

但是，也许更重要的是，领导者选举算法允许系统恢复得足够快，以防止吞吐量大幅下降。 

根据我们的观察，ZooKeeper只需不到200毫秒即可选出一位新领导。 

第三，随着关注者的恢复，ZooKeeper一旦开始处理请求就能够再次提高吞吐量。

# 参考资料

https://zookeeper.apache.org/doc/r3.6.2/index.html

* any list
{:toc}
---
layout: post
title:  etcd实战课-01etcd的前世今生：为什么Kubernetes使用etcd？
date:   2015-01-01 23:20:27 +0800
categories: [etcd实战课]
tags: [etcd实战课, other]
published: true
---



01 etcd的前世今生：为什么Kubernetes使用etcd？
你好，我是唐聪。

今天是专栏课程的第一讲，我们就从etcd的前世今生讲起。让我们一起穿越回2013年，看看etcd最初是在什么业务场景下被设计出来的？

2013年，有一个叫CoreOS的创业团队，他们构建了一个产品，Container Linux，它是一个开源、轻量级的操作系统，侧重自动化、快速部署应用服务，并要求应用程序都在容器中运行，同时提供集群化的管理方案，用户管理服务就像单机一样方便。

他们希望在重启任意一节点的时候，用户的服务不会因此而宕机，导致无法提供服务，因此需要运行多个副本。但是多个副本之间如何协调，如何避免变更的时候所有副本不可用呢？

为了解决这个问题，CoreOS团队需要一个协调服务来存储服务配置信息、提供分布式锁等能力。怎么办呢？当然是分析业务场景、痛点、核心目标，然后是基于目标进行方案选型，评估是选择社区开源方案还是自己造轮子。这其实就是我们遇到棘手问题时的通用解决思路，CoreOS团队同样如此。

假设你是CoreOS团队成员，你认为在这样的业务场景下，理想中的解决方案应满足哪些目标呢？

如果你有过一些开发经验，应该能想到一些关键点了，我根据自己的经验来总结一下，一个协调服务，理想状态下大概需要满足以下五个目标：

* **可用性角度：高可用**。协调服务作为集群的控制面存储，它保存了各个服务的部署、运行信息。若它故障，可能会导致集群无法变更、服务副本数无法协调。业务服务若此时出现故障，无法创建新的副本，可能会影响用户数据面。
* **数据一致性角度：提供读取“最新”数据的机制**。既然协调服务必须具备高可用的目标，就必然不能存在单点故障（single point of failure），而多节点又引入了新的问题，即多个节点之间的数据一致性如何保障？比如一个集群3个节点A、B、C，从节点A、B获取服务镜像版本是新的，但节点C因为磁盘 I/O异常导致数据更新缓慢，若控制端通过C节点获取数据，那么可能会导致读取到过期数据，服务镜像无法及时更新。
* **容量角度：低容量、仅存储关键元数据配置。**协调服务保存的仅仅是服务、节点的配置信息（属于控制面配置），而不是与用户相关的数据。所以存储上不需要考虑数据分片，无需过度设计。
* **功能：增删改查，监听数据变化的机制**。协调服务保存了服务的状态信息，若服务有变更或异常，相比控制端定时去轮询检查一个个服务状态，若能快速推送变更事件给控制端，则可提升服务可用性、减少协调服务不必要的性能开销。
* **运维复杂度：可维护性。**在分布式系统中往往会遇到硬件Bug、软件Bug、人为操作错误导致节点宕机，以及新增、替换节点等运维场景，都需要对协调服务成员进行变更。若能提供API实现平滑地变更成员节点信息，就可以大大降低运维复杂度，减少运维成本，同时可避免因人工变更不规范可能导致的服务异常。

了解完理想中的解决方案目标，我们再来看CoreOS团队当时为什么选择了从0到1开发一个新的协调服务呢？

如果使用开源软件，当时其实是有ZooKeeper的，但是他们为什么不用ZooKeeper呢？我们来分析一下。

从高可用性、数据一致性、功能这三个角度来说，ZooKeeper是满足CoreOS诉求的。然而当时的ZooKeeper不支持通过API安全地变更成员，需要人工修改一个个节点的配置，并重启进程。

若变更姿势不正确，则有可能出现脑裂等严重故障。适配云环境、可平滑调整集群规模、在线变更运行时配置是CoreOS的期望目标，而ZooKeeper在这块的可维护成本相对较高。

其次ZooKeeper是用 Java 编写的，部署较繁琐，占用较多的内存资源，同时ZooKeeper RPC的序列化机制用的是Jute，自己实现的RPC API。无法使用curl之类的常用工具与之互动，CoreOS期望使用比较简单的HTTP + JSON。

因此，CoreOS决定自己造轮子，那CoreOS团队是如何根据系统目标进行技术方案选型的呢？

## etcd v1和v2诞生

首先我们来看服务高可用及数据一致性。前面我们提到单副本存在单点故障，而多副本又引入数据一致性问题。

因此为了解决数据一致性问题，需要引入一个共识算法，确保各节点数据一致性，并可容忍一定节点故障。常见的共识算法有Paxos、ZAB、Raft等。CoreOS团队选择了易理解实现的Raft算法，它将复杂的一致性问题分解成Leader选举、日志同步、安全性三个相对独立的子问题，只要集群一半以上节点存活就可提供服务，具备良好的可用性。

其次我们再来看数据模型（Data Model）和API。数据模型参考了ZooKeeper，使用的是基于目录的层次模式。API相比ZooKeeper来说，使用了简单、易用的REST API，提供了常用的Get/Set/Delete/Watch等API，实现对key-value数据的查询、更新、删除、监听等操作。

key-value存储引擎上，ZooKeeper使用的是Concurrent HashMap，而etcd使用的是则是简单内存树，它的节点数据结构精简后如下，含节点路径、值、孩子节点信息。这是一个典型的低容量设计，数据全放在内存，无需考虑数据分片，只能保存key的最新版本，简单易实现。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/etcd%e5%ae%9e%e6%88%98%e8%af%be/assets/365d82380b90431cb5a99e877741bb5d.jpg)
type node struct { Path string //节点路径 Parent /*node //关联父亲节点 Value string //key的value值 ExpireTime time.Time //过期时间 Children map[string]/*node //此节点的孩子节点 }

最后我们再来看可维护性。Raft算法提供了成员变更算法，可基于此实现成员在线、安全变更，同时此协调服务使用Go语言编写，无依赖，部署简单。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/etcd%e5%ae%9e%e6%88%98%e8%af%be/assets/bdfe66695ead4c3b8a17936dc40390f2.jpg)

基于以上技术方案和架构图，CoreOS团队在2013年8月对外发布了第一个测试版本v0.1，API v1版本，命名为etcd。

那么etcd这个名字是怎么来的呢？其实它源于两个方面，unix的“/etc”文件夹和分布式系统(“D”istribute system)的D，组合在一起表示etcd是用于存储分布式配置的信息存储服务。

v0.1版本实现了简单的HTTP Get/Set/Delete/Watch API，但读数据一致性无法保证。v0.2版本，支持通过指定consistent模式，从Leader读取数据，并将Test And Set机制修正为CAS(Compare And Swap)，解决原子更新的问题，同时发布了新的API版本v2，这就是大家熟悉的etcd v2版本，第一个非stable版本。

下面，我用一幅时间轴图，给你总结一下etcd v1/v2关键特性。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/etcd%e5%ae%9e%e6%88%98%e8%af%be/assets/b1cd04d91f3e4142af6729c6f7f01c12.jpg)

## 为什么Kubernetes使用etcd?

这张图里，我特别标注出了Kubernetes的发布时间点，这个非常关键。我们必须先来说说这个事儿，也就是Kubernetes和etcd的故事。

2014年6月，Google的Kubernetes项目诞生了，我们前面所讨论到Go语言编写、etcd高可用、Watch机制、CAS、TTL等特性正是Kubernetes所需要的，它早期的0.4版本，使用的正是etcd v0.2版本。

Kubernetes是如何使用etcd v2这些特性的呢？举几个简单小例子。

当你使用Kubernetes声明式API部署服务的时候，Kubernetes的控制器通过etcd Watch机制，会实时监听资源变化事件，对比实际状态与期望状态是否一致，并采取协调动作使其一致。Kubernetes更新数据的时候，通过CAS机制保证并发场景下的原子更新，并通过对key设置TTL来存储Event事件，提升Kubernetes集群的可观测性，基于TTL特性，Event事件key到期后可自动删除。

Kubernetes项目使用etcd，除了技术因素也与当时的商业竞争有关。CoreOS是Kubernetes容器生态圈的核心成员之一。

当时Docker容器浪潮正席卷整个开源技术社区，CoreOS也将容器集成到自家产品中。一开始与Docker公司还是合作伙伴，然而Docker公司不断强化Docker的PaaS平台能力，强势控制Docker社区，这与CoreOS核心商业战略出现了冲突，也损害了Google、RedHat等厂商的利益。

最终CoreOS与Docker分道扬镳，并推出了rkt项目来对抗Docker，然而此时Docker已深入人心，CoreOS被Docker全面压制。

以Google、RedHat为首的阵营，基于Google多年的大规模容器管理系统Borg经验，结合社区的建议和实践，构建以Kubernetes为核心的容器生态圈。相比Docker的垄断、独裁，Kubernetes社区推行的是民主、开放原则，Kubernetes每一层都可以通过插件化扩展，在Google、RedHat的带领下不断发展壮大，etcd也进入了快速发展期。

在2015年1月，CoreOS发布了etcd第一个稳定版本2.0，支持了quorum read，提供了严格的线性一致性读能力。7月，基于etcd 2.0的Kubernetes第一个生产环境可用版本v1.0.1发布了，Kubernetes开始了新的里程碑的发展。

etcd v2在社区获得了广泛关注，GitHub star数在2015年6月就高达6000+，超过500个项目使用，被广泛应用于配置存储、服务发现、主备选举等场景。

下图我从构建分布式系统的核心要素角度，给你总结了etcd v2核心技术点。无论是NoSQL存储还是SQL存储、文档存储，其实大家要解决的问题都是类似的，基本就是图中总结的数据模型、复制、共识算法、API、事务、一致性、成员故障检测等方面。

希望通过此图帮助你了解从0到1如何构建、学习一个分布式系统，要解决哪些技术点，在心中有个初步认识，后面的课程中我会再深入介绍。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/etcd%e5%ae%9e%e6%88%98%e8%af%be/assets/d19c5364bec04cbcabd70b91aabbc9d4.jpg)

## etcd v3诞生

然而随着Kubernetes项目不断发展，v2版本的瓶颈和缺陷逐渐暴露，遇到了若干性能和稳定性问题，Kubernetes社区呼吁支持新的存储、批评etcd不可靠的声音开始不断出现。

具体有哪些问题呢？我给你总结了如下图：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/etcd%e5%ae%9e%e6%88%98%e8%af%be/assets/ff7afbc5cd264f2b952025f802191e66.jpg)

下面我分别从功能局限性、Watch事件的可靠性、性能、内存开销来分别给你剖析etcd v2的问题。

首先是**功能局限性问题。**它主要是指etcd v2不支持范围和分页查询、不支持多key事务。

第一，etcd v2不支持范围查询和分页。分页对于数据较多的场景是必不可少的。在Kubernetes中，在集群规模增大后，Pod、Event等资源可能会出现数千个以上，但是etcd v2不支持分页，不支持范围查询，大包等expensive request会导致严重的性能乃至雪崩问题。

第二，etcd v2不支持多key事务。在实际转账等业务场景中，往往我们需要在一个事务中同时更新多个key。

然后是**Watch机制可靠性问题**。Kubernetes项目严重依赖etcd Watch机制，然而etcd v2是内存型、不支持保存key历史版本的数据库，只在内存中使用滑动窗口保存了最近的1000条变更事件，当etcd server写请求较多、网络波动时等场景，很容易出现事件丢失问题，进而又触发client数据全量拉取，产生大量expensive request，甚至导致etcd雪崩。

其次是**性能瓶颈问题**。etcd v2早期使用了简单、易调试的HTTP/1.x API，但是随着Kubernetes支撑的集群规模越来越大，HTTP/1.x协议的瓶颈逐渐暴露出来。比如集群规模大时，由于HTTP/1.x协议没有压缩机制，批量拉取较多Pod时容易导致APIServer和etcd出现CPU高负载、OOM、丢包等问题。

另一方面，etcd v2 client会通过HTTP长连接轮询Watch事件，当watcher较多的时候，因HTTP/1.x不支持多路复用，会创建大量的连接，消耗server端过多的socket和内存资源。

同时etcd v2支持为每个key设置TTL过期时间，client为了防止key的TTL过期后被删除，需要周期性刷新key的TTL。

实际业务中很有可能若干key拥有相同的TTL，可是在etcd v2中，即使大量key TTL一样，你也需要分别为每个key发起续期操作，当key较多的时候，这会显著增加集群负载、导致集群性能显著下降。

最后是**内存开销问题。**etcd v2在内存维护了一颗树来保存所有节点key及value。在数据量场景略大的场景，如配置项较多、存储了大量Kubernetes Events， 它会导致较大的内存开销，同时etcd需要定时把全量内存树持久化到磁盘。这会消耗大量的CPU和磁盘 I/O资源，对系统的稳定性造成一定影响。

为什么etcd v2有以上若干问题，Consul等其他竞品依然没有被Kubernetes支持呢？

一方面当时包括Consul在内，没有一个开源项目是十全十美完全满足Kubernetes需求。而CoreOS团队一直在聆听社区的声音并积极改进，解决社区的痛点。用户吐槽etcd不稳定，他们就设计实现自动化的测试方案，模拟、注入各类故障场景，及时发现修复Bug，以提升etcd稳定性。

另一方面，用户吐槽性能问题，针对etcd v2各种先天性缺陷问题，他们从2015年就开始设计、实现新一代etcd v3方案去解决以上痛点，并积极参与Kubernetes项目，负责etcd v2到v3的存储引擎切换，推动Kubernetes项目的前进。同时，设计开发通用压测工具、输出Consul、ZooKeeper、etcd性能测试报告，证明etcd的优越性。

etcd v3就是为了解决以上稳定性、扩展性、性能问题而诞生的。

在内存开销、Watch事件可靠性、功能局限上，它通过引入B-tree、boltdb实现一个MVCC数据库，数据模型从层次型目录结构改成扁平的key-value，提供稳定可靠的事件通知，实现了事务，支持多key原子更新，同时基于boltdb的持久化存储，显著降低了etcd的内存占用、避免了etcd v2定期生成快照时的昂贵的资源开销。

性能上，首先etcd v3使用了gRPC API，使用protobuf定义消息，消息编解码性能相比JSON超过2倍以上，并通过HTTP/2.0多路复用机制，减少了大量watcher等场景下的连接数。

其次使用Lease优化TTL机制，每个Lease具有一个TTL，相同的TTL的key关联一个Lease，Lease过期的时候自动删除相关联的所有key，不再需要为每个key单独续期。

最后是etcd v3支持范围、分页查询，可避免大包等expensive request。

2016年6月，etcd 3.0诞生，随后Kubernetes 1.6发布，默认启用etcd v3，助力Kubernetes支撑5000节点集群规模。

下面的时间轴图，我给你总结了etcd3重要特性及版本发布时间。从图中你可以看出，从3.0到未来的3.5，更稳、更快是etcd的追求目标。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/etcd%e5%ae%9e%e6%88%98%e8%af%be/assets/172120c29b6c431abbd9f0970a263ed7.jpg)

从2013年发布第一个版本v0.1到今天的3.5.0-pre，从v2到v3，etcd走过了7年的历程，etcd的稳定性、扩展性、性能不断提升。

发展到今天，在GitHub上star数超过34K。在Kubernetes的业务场景磨炼下它不断成长，走向稳定和成熟，成为技术圈众所周知的开源产品，而**v3方案的发布，也标志着etcd进入了技术成熟期，成为云原生时代的首选元数据存储产品。**

## 小结

最后我们来小结下今天的内容，我们从如下几个方面介绍了etcd的前世今生，并在过程中详细解读了为什么Kubernetes使用etcd：

* etcd诞生背景， etcd v2源自CoreOS团队遇到的服务协调问题。
* etcd目标，我们通过实际业务场景分析，得到理想中的协调服务核心目标：高可用、数据一致性、Watch、良好的可维护性等。而在CoreOS团队看来，高可用、可维护性、适配云、简单的API、良好的性能对他们而言是非常重要的，ZooKeeper无法满足所有诉求，因此决定自己构建一个分布式存储服务。
* 介绍了v2基于目录的层级数据模型和API，并从分布式系统的角度给你详细总结了etcd v2技术点。etcd的高可用、Watch机制与Kubernetes期望中的元数据存储是匹配的。etcd v2在Kubernetes的带动下，获得了广泛的应用，但也出现若干性能和稳定性、功能不足问题，无法满足Kubernetes项目发展的需求。
* CoreOS团队未雨绸缪，从问题萌芽时期就开始构建下一代etcd v3存储模型，分别从性能、稳定性、功能上等成功解决了Kubernetes发展过程中遇到的瓶颈，也捍卫住了作为Kubernetes存储组件的地位。

希望通过今天的介绍， 让你对etcd为什么有v2和v3两个大版本，etcd如何从HTTP/1.x API到gRPC API、单版本数据库到多版本数据库、内存树到boltdb、TTL到Lease、单key原子更新到支持多key事务的演进过程有个清晰了解。希望你能有所收获，在后续的课程中我会和你深入讨论各个模块的细节。

## 思考题

最后，我给你留了一个思考题。分享一下在你的项目中，你主要使用的是哪个etcd版本来解决什么问题呢？使用的etcd v2 API还是v3 API呢？在这过程中是否遇到过什么问题？

感谢你的阅读，欢迎你把思考和观点写在留言区，也欢迎你把这篇文章分享给更多的朋友一起阅读。




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/etcd%e5%ae%9e%e6%88%98%e8%af%be/01%20etcd%e7%9a%84%e5%89%8d%e4%b8%96%e4%bb%8a%e7%94%9f%ef%bc%9a%e4%b8%ba%e4%bb%80%e4%b9%88Kubernetes%e4%bd%bf%e7%94%a8etcd%ef%bc%9f.md

* any list
{:toc}

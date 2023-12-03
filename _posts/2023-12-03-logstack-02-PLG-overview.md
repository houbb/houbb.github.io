---
layout: post
title: logstack 日志技术栈-02-PLG 入门介绍
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, elk, sh]
published: true
---

# ELK/EFK日志系统

如果今天谈论到要部署一套日志系统，相信用户首先会想到的就是经典的ELK架构，或者现在被称为Elastic Stack。

Elastic Stack架构为Elasticsearch + Logstash + Kibana + Beats的组合，其中，Beats负责日志的采集， Logstash负责做日志的聚合和处理，Elasticsearch作为日志的存储和搜索系统，Kibana作为可视化前端展示，整体架构如下图所示：

![ELK](https://s3.cn-north-1.amazonaws.com.cn/awschinablog/from-elk-efk-to-plg-implement-in-eks-a-container-logging-solution-based-on-promtail-loki-grafana1.jpg)

此外，在容器化场景中，尤其是在Kubernetes环境中，用户经常使用的另一套框架是EFK架构。

其中，E还是Elasticsearch，K还是Kibana，其中的F代表Fluent Bit，一个开源多平台的日志处理器和转发器。

Fluent Bit可以让用户从不同的来源收集数据/日志，统一并发送到多个目的地，并且它完全兼容Docker和Kubernetes环境。

# 既生瑜，何生亮？

## ELK 的缺点

最近，在对公司容器云的日志方案进行设计的时候，发现主流的ELK或者EFK比较重，再加上现阶段对于ES复杂的搜索功能很多都用不上最终选择了Grafana开源的Loki日志系统，下面介绍下Loki的背景。

背景和动机

当我们的容器云运行的应用或者某个节点出现问题了，解决思路应该如下：

![背景和动机](https://img-blog.csdnimg.cn/img_convert/e160d442574c2d5e577464b9d1396b06.png)

我们的监控使用的是基于Prometheus体系进行改造的，Prometheus中比较重要的是Metric和Alert，Metric是来说明当前或者历史达到了某个值，Alert设置Metric达到某个特定的基数触发了告警，但是这些信息明显是不够的。

我们都知道，Kubernetes的基本单位是Pod，Pod把日志输出到stdout和stderr，平时有什么问题我们通常在界面或者通过命令查看相关的日志，

举个例子：当我们的某个Pod的内存变得很大，触发了我们的Alert，这个时候管理员，去页面查询确认是哪个Pod有问题，然后要确认Pod内存变大的原因，我们还需要去查询Pod的日志，如果没有日志系统，那么我们就需要到页面或者使用命令进行查询了：

如果，这个时候应用突然挂了，这个时候我们就无法查到相关的日志了，所以需要引入日志系统，统一收集日志，而使用ELK的话，就需要在Kibana和Grafana之间切换，影响用户体验。

所以 ，loki的第一目的就是**最小化度量和日志的切换成本，有助于减少异常事件的响应时间和提高用户的体验**。

## ELK存在的问题

现有的很多日志采集的方案都是采用全文检索对日志进行索引（如ELK方案），优点是功能丰富，允许复杂的操作。

但是，这些方案往往规模复杂，资源占用高，操作苦难。

很多功能往往用不上，大多数查询只关注一定时间范围和一些简单的参数（如host、service等），使用这些解决方案就有点杀鸡用牛刀的感觉了。

因此，Loki的第二个目的是，**在查询语言的易操作性和复杂性之间可以达到一个权衡**。

## 成本

全文检索的方案也带来成本问题，简单的说就是全文搜索（如ES）的倒排索引的切分和共享的成本较高。

后来出现了其他不同的设计方案如：OKlog，采用最终一致的、基于网格的分布策略。

这两个设计决策提供了大量的成本降低和非常简单的操作，但是查询不够方便。

因此，Loki的第三个目的是，提高一个**更具成本效益的解决方案**。


# PLG日志系统

但是，Grafana Labs提供的另一个日志解决方案PLG目前也逐渐变得流行起来。

PLG架构为Promtail + Loki + Grafana的组合，整体架构图下所示：

![PLG日志系统](https://s3.cn-north-1.amazonaws.com.cn/awschinablog/from-elk-efk-to-plg-implement-in-eks-a-container-logging-solution-based-on-promtail-loki-grafana3.png)

其中，Grafana大家应该都比较熟悉，它是一款开源的可视化和分析软件，它允许用户查询、可视化、警告和探索监控指标。

Grafana主要提供时间序列数据的仪表板解决方案，支持超过数十种数据源（还在陆续添加支持中）。

这里稍微介绍下另外两个软件Promtail和Loki。

官方介绍Grafana Loki是一组可以组成一个功能齐全的日志堆栈组件，与其它日志系统不同的是，Loki只建立日志标签的索引而不索引原始日志消息，而是为日志数据设置一组标签，这意味着Loki的运营成本更低，效率也能提高几个数量级

![loki](https://s3.cn-north-1.amazonaws.com.cn/awschinablog/from-elk-efk-to-plg-implement-in-eks-a-container-logging-solution-based-on-promtail-loki-grafana4.jpg)

Loki的设计理念收到了很多Prometheus的启发，可以实现可水平扩展、高可用的多租户日志系统。

Loki整体架构也是由不同的组件来协同完成日志收集、索引、存储等工作的，各个组件如下所示，有关Loki架构的更多信息这里不再展开描述，可以参考官方文档Loki’s Architecture进一步深入了解。

最后，一句话形容下Loki就是like Prometheus, but for logs。

![loki](https://s3.cn-north-1.amazonaws.com.cn/awschinablog/from-elk-efk-to-plg-implement-in-eks-a-container-logging-solution-based-on-promtail-loki-grafana5.jpg)

Promtail是一个日志收集的代理，它会将本地日志的内容发送到一个Loki实例，它通常部署到需要监视应用程序的每台机器/容器上。

Promtail主要是用来发现目标、将标签附加到日志流以及将日志推送到Loki。

截止到目前，Promtail可以跟踪两个来源的日志：本地日志文件和systemd日志（仅支持AMD64架构）。

这样看上去，PLG和ELK都能完成类似的日志管理工作，那它们之间的差别在哪里呢？


# Loki

Loki 简介Loki 的第一个稳定版本于 2019 年 11 月 19 日发布，是 Grafana Labs 团队最新的开源项目，是一个水平可扩展，高可用性，多租户的日志聚合系统。

Loki 是专门用于聚集日志数据，重点是高可用性和可伸缩性。

与竞争对手不同的是，它确实易于安装且资源效率极高。

与其他日志聚合系统相比，Loki 具有下面的一些特性：

- 不对日志进行全文索引。通过存储压缩非结构化日志和仅索引元数据，Loki 操作起来会更简单，更省成本。

通过使用与 Prometheus 相同的标签记录流对日志进行索引和分组，这使得日志的扩展和操作效率更高，能对接 alertmanager。

特别适合储存 Kubernetes Pod 日志；诸如 Pod 标签之类的元数据会被自动删除和编入索引。

受 Grafana 原生支持，避免 kibana 和 grafana 来回切换。

我们来简单总结一下 Loki 的优缺点。

## 优点

Loki 的架构非常简单，使用了和 Prometheus 一样的标签来作为索引，通过这些标签既可以查询日志的内容也可以查询到监控的数据，不但减少了两种查询之间的切换成本，也极大地降低了日志索引的存储。

与 ELK 相比，消耗的成本更低，具有成本效益。在日志的收集以及可视化上可以连用 Grafana，实现在日志上的筛选以及查看上下行的功能。

## 缺点

技术比较新颖，相对应的论坛不是非常活跃。功能单一，只针对日志的查看，筛选有好的表现，对于数据的处理以及清洗没有 ELK 强大，同时与 ELK 相比，对于后期，ELK 可以连用各种技术进行日志的大数据处理，但是 loki 不行。

# Loki 架构

Loki 的架构如下：

![Loki 架构](https://picx.zhimg.com/80/v2-549593541aa4754c7e272adbba9f90c1_720w.webp?source=1def8aca)

不难看出，Loki 的架构非常简单，使用了和 Prometheus 一样的标签来作为索引，也就是说，你通过这些标签既可以查询日志的内容也可以查询到监控的数据，不但减少了两种查询之间的切换成本，也极大地降低了日志索引的存储。

Loki 将使用与 Prometheus 相同的服务发现和标签重新标记库，编写了 pormtail，在 Kubernetes 中 promtail 以 DaemonSet 方式运行在每个节点中，通过 Kubernetes API 等到日志的正确元数据，并将它们发送到 Loki。

下面是日志的存储架构：

![存储架构](https://picx.zhimg.com/80/v2-d16624383375819f35e3e530cd29d9dc_720w.webp?source=1def8aca)


# 日志方案对比

首先，ELK/EFK架构功能确实强大，也经过了多年的实际环境验证，其中存储在Elasticsearch中的日志通常以非结构化JSON对象的形式存储在磁盘上，并且Elasticsearch为每个对象都建立了索引，以便进行全文搜索，然后用户可以特定查询语言来搜索这些日志数据。

与之对应的Loki的数据存储是解耦的，既可以在磁盘上存储数据，也可以使用如Amazon S3的云存储系统。

Loki中的日志带有一组标签名和值，其中只有标签对被索引，这种权衡使得它比完整索引的操作成本更低，但是针对基于内容的查询，需要通过LogQL再单独查询。

和Fluentd相比，Promtail是专门为Loki量身定制的，它可以为运行在同一节点上的Kubernetes Pods做服务发现，从指定文件夹读取日志。Loki采用了类似于Prometheus的标签方式。

因此，当与Prometheus部署在同一个环境中时，因为相同的服务发现机制，来自Promtail的日志通常具有与应用程序指标相同的标签，统一了标签管理。

Kibana提供了许多可视化工具来进行数据分析，高级功能比如异常检测等机器学习功能。

Grafana专门针对Prometheus和Loki等时间序列数据打造，可以在同一个仪表板上查看日志的指标。

# 小结

本文首先简单介绍了经典的日志系统ELK/EFK架构，引出了Grafana新推出的PLG架构，并探讨了两种架构之间的对比和重点发展的方向。

由于篇幅有限，关于Loki的详细架构介绍和更多高级功能（如多租户）和高级配置（如DynamoDB详细配置）都没有展开，希望有机会会再进行讨论。关于和Prometheus共同部署的方案也是用户考虑使用PLG的重要因素，以此实现整体的可观测性解决方案，用户可以结合实际情况进行配合使用。

此外，亚马逊云科技也提供了Grafana和Prometheus的托管服务Amazon Managed Service for Grafana（AMG）和Amazon Managed Service for Prometheus（AMP），可以非常方便地与其他云服务快速集成，使用户可以轻松地可视化和分析规模的运营数据以及大规模监控容器化的应用程序。


# 整体架构

Loki的架构如下：

![loki](https://img-blog.csdnimg.cn/img_convert/f7ad452cf3ef56a3010fa547c46e263f.png)

不难看出，Loki 的架构非常简单，主要有 3 个组件组成：

- Loki 是主服务器，负责存储日志和处理查询。

- Promtail 是代理，负责收集日志并将其发送给 Loki 。

- Grafana 用于 UI 展示。

Loki 使用了和Prometheus一样的标签来作为索引，也就是说，你通过这些标签既可以查询日志的内容也可以查询到监控的数据，不但减少了两种查询之间的切换成本，也极大地降低了日志索引的存储。

Loki使用与Prometheus相同的服务发现和标签重新标记库，编写了pormtail，在Kubernetes中promtail以DaemonSet方式运行在每个节点中，通过Kubernetes API等到日志的正确元数据，并将它们发送到Loki。

下面是日志的存储架构：

![整体架构](https://img-blog.csdnimg.cn/img_convert/b8fd072e4b21819a474f30b0a2d9b2ab.png)

## 读写

日志数据的写主要依托的是Distributor和Ingester两个组件，整体的流程如下：

![读写](https://img-blog.csdnimg.cn/img_convert/de6440697d156335c96e80cdb4e9305b.png)

## Distributor

一旦promtail收集日志并将其发送给loki，Distributor就是第一个接收日志的组件。

由于日志的写入量可能很大，所以不能在它们传入时将它们写入数据库。这会毁掉数据库。我们需要批处理和压缩数据。

Loki通过构建压缩数据块来实现这一点，方法是在日志进入时对其进行gzip操作，组件ingester是一个有状态的组件，负责构建和刷新chunck，当chunk达到一定的数量或者时间后，刷新到存储中去。

每个流的日志对应一个ingester，当日志到达Distributor后，根据元数据和hash算法计算出应该到哪个ingester上面。

![Distributor](https://img-blog.csdnimg.cn/img_convert/02fa7ddbc34cc8922c6c253ba1dfb5ee.png)

此外，为了冗余和弹性，我们将其复制n（默认情况下为3）次。

## Ingester

Ingester接收到日志并开始构建chunk：

![Ingester](https://img-blog.csdnimg.cn/img_convert/46cadaf52dcad5320c1284a5de1210bc.png)

基本上就是将日志进行压缩并附加到chunk上面。一旦chunk“填满”（数据达到一定数量或者过了一定期限），ingester将其刷新到数据库。

我们对块和索引使用单独的数据库，因为它们存储的数据类型不同。

![Ingester](https://img-blog.csdnimg.cn/img_convert/b6f2d053940a75f438a47be11dc38435.png)

刷新一个chunk之后，ingester然后创建一个新的空chunk并将新条目添加到该chunk中。

## Querier

读取就非常简单了，由Querier负责给定一个时间范围和标签选择器，Querier查看索引以确定哪些块匹配，并通过greps将结果显示出来。

它还从Ingester获取尚未刷新的最新数据。

对于每个查询，一个查询器将为您显示所有相关日志。实现了查询并行化，提供分布式grep，使即使是大型查询也是足够的。

![Querier](https://img-blog.csdnimg.cn/img_convert/9c9da0c51d22612e90954b0a4a5451e2.png)

## 可扩展性

Loki的索引存储可以是cassandra/bigtable/dynamodb，而chuncks可以是各种对象存储，Querier和Distributor都是无状态的组件。

对于ingester他虽然是有状态的但是，当新的节点加入或者减少，整节点间的chunk会重新分配，已适应新的散列环。

而Loki底层存储的实现Cortex已经 在实际的生产中投入使用多年了。

有了这句话，我可以放心的在环境中实验一把了。

# 参考资料

[从ELK/EFK到PLG – 在EKS中实现基于Promtail + Loki + Grafana容器日志解决方案](https://aws.amazon.com/cn/blogs/china/from-elk-efk-to-plg-implement-in-eks-a-container-logging-solution-based-on-promtail-loki-grafana/)

[哪一个开源的日志收集系统比较好？](https://www.zhihu.com/question/22761013)

https://blog.csdn.net/rlnLo2pNEfx9c/article/details/121199923

https://blog.csdn.net/Linkthaha/article/details/100575278
http://blog.csdn.net/Linkthaha/article/details/100575651
https://blog.csdn.net/Linkthaha/article/details/100582422
https://blog.csdn.net/Linkthaha/article/details/10058258


* any list
{:toc}
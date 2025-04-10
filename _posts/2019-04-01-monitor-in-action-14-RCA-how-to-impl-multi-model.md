---
layout: post
title: 监控系统实战-14-RCA 根本原因分析(Root Cause Analysis) 如何实现？多模态融合
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, rca, sh]
published: true
---

# 前言

AI paper 的一些，主要看一下思路。

# 基于多模态运维数据的根因定位（一）：异构数据时序化

为了使故障诊断方法能够诊断更多种类的故障，融合多模态运维数据进行自动化故障诊断，已经成为当前学术界和工业界的重要研究热点。

将文本类型的 Log 和 Trace 转换成与 Metric 同构的时间序列表示，然后输入到故障诊断算法中进行分析，是融合多模态运维数据分析最直接的方式，今天将分享两篇使用这个思路进行故障诊断的论文。

软件可观测性(Observability)是通过 Log、Trace 和 Metric 来洞察一个软件系统内部的运行状态和行为的能力。

Log、Trace 和 Metric 因此也被称为可观测性的三大支柱，具体来说，可观测性主要包含以下几个方面:

Trace（分布式追踪）：Trace 是一种记录分布式系统中请求流程的工具，用于跟踪请求在系统中的流转过程。通过 Trace，我们可以了解请求在系统的哪些组件中经过，每个组件的处理时间，以及请求出现问题的可能原因。Trace 可以帮助我们快速定位分布式系统中的问题，优化系统性能

Log（日志）：Log 是一种记录系统运行状态和事件的工具，可以记录系统中的各种操作和事件，如错误、警告、调试信息等。通过 Log，我们可以了解系统中发生的各种事件，从而快速定位问题并进行调试。同时，Log 也是监控系统运行状态的重要工具，可以帮助我们了解系统的运行状况和性能

Metric（指标）：Metric 是一种记录系统运行状态和性能的工具，用于度量系统的各种指标，如请求处理时间、吞吐量、并发数等。通过 Metric，我们可以了解系统的运行状况和性能，从而进行优化和调整。Metric 是监控系统性能的重要工具，可以帮助我们及时发现性能问题并进行优化

![3](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBemhpg7NQOc3P09MP6tmABGVCqlI9APXm936lbuWenIfogdePUayc1vYJPeXDWWo7AJKvNuqNPBtVg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


在系统发生问题时，我们需要借助可观测性数据进行根因分析。

将各类数据关联在一起,可以更清楚地判断问题的根因。

例如,用户报告页面加载速度变慢,我们可以:

通过 Trace 查看一个请求的调用链路,发现数据库查询超时是瓶颈

再在 Log 中搜寻数据库查询的错误日志,了解导致超时的查询语句

最后在 Metric 图表中发现,最近数据库服务器CPU使用量飙升,确认是数据库 CPU 瓶颈导致的慢查询

在之前的分享中，我们介绍了 基于 Metric 的根因定位 和 基于 Trace 的根因定位 ，但这两种类型的方法都各自有其缺陷，如上面的例子，如果只看 Trace 不看 Metric，无法发现故障的根因是 CPU 竞争。

而如果只看 Metric 的响应成功率下降，不看 Trace  和  Log， 则无法定位由代码 bug 导致的故障的根因。

因此，为了使故障诊断方法能够适应更多种类的故障，获得更细粒度的根因，融合多模态运维数据进行自动化故障诊断，已经成为当前学术界和工业界的重要研究热点。

想要实现多模态运维的融合分析，其中的最大的挑战是要克服  Log、Trace 和 Metric 之间的异构性 ，其中 Metric 是时序数据，Trace 和  Log 是半结构化的文本数据，如何将三种异构的数据作为算法的输入呢？

很容易想到的是将 Log、Trace 和 Metric  三种异构数据转换成同构的数据表示，这样后续即可以使用同构的数据进行分析。

那应该使用哪种方式将异构数据转换成同构数据呢？

我们今天介绍的方法是：将  Log  和  Trace  转换成与  Metric  同构的时间序列表示，然后输入到故障诊断算法中进行分析，得到最后的根因定位结果。

今天我们就来简单介绍采用这种方式的两个比较有代表性的学术论文，分别是来自北京大学李影老师团队的 PDiagnose 和港中文吕荣聪老师团队的 Eadro 。 


## 2021_ISPA_Diagnosing Performance Issues in Microservices with Heterogeneous Data Source

论文提出了一个无监督的基于多模态运维数据根因定位算法 PDiagnose。

下图展示了 PDiagnose 的整体框架，PDiagnose 首先用  KPI  的异常检测算法触发根因定位。

![KPI](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBelWGpOfuU1lSQ8dIicwjpp45ciatJqhZu1RIkR0ZnAJ07fiaTquzEibibpR8eQDPEfic9rFT1kWcH4xNnPg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在做根因定位时，针对三种异构的数据源，PDiagnose 将  Trace 和  Log  转化为与  Metric 同构的时序数据，它采用了三种不同的处理方法：

对  Metrics，PDiagnose 首先根据 Kernel Density Estimation (KDE) 和 Weighted Moving Average (WMA) 检测出异常 KPI  然后构建出一个anomaly KPI queue。

针对这个  KPI  queue，PDiagnose 还提取队列的一些特征包括，Density of anomaly KPI queue，Distribution of anomalies，Standard Deviation of Anomaly Counts，Length of Anomaly KPI Queue 等等，然后通过表二的阈值判断是否异常，

对  Trace，PDiagnose 计算出每个服务上的  Span 的运行时间，然后通过表二的阈值判断是否异常

对  Log，PDiagnose 只统计日志中是否出现 “error”, “problem”等关键词，如果出现这些关键词则认为这个服务有异常

![health](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenyW6au8VUhcjvFR5tabMrQqmWrtr8LA7NC0pdxpBCjq7VuydP1Jx8DiaQ2VXibCicxkMjZBprOCZyDw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


在根因定位时，PDiagnose 根据一个投票算法，计算哪个微服务更可疑

![votes](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenyW6au8VUhcjvFR5tabMrQ6DoG5LJBwkBNU2ZeX5cxAO1GJghplT0VUuJ16WjNWFoVnxbrcAMTqQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

并输出可疑微服务的异常  KPI  和异常  Log  供  SRE  检查

![SCI](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenyW6au8VUhcjvFR5tabMrQBfqMmmRxo9icBwRO9JiaMCBYgpc1giaicb7M7TFGszP7iaiaZgB6kOdsOHbA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 个人评论

本文是北京大学李影老师团队的成果，是多模态运维数据融合的根因定位上比较早的一篇论文。

PDiagnose 也曾在 AIOps 挑战赛上获奖，在算法设计我觉得是符合工业界场景的，可解释性也比较强，但是在使用 Trace 时只考虑了  Latency, 没有使用到 Trace 带来的拓扑信息和上下文信息。此外，论文写作上有点简单粗暴，如果稍加改进，至少是一篇  CCF B  类的论文。

论文链接：https://ieeexplore.ieee.org/document/9644910

## 2023_ICSE_Eadro: An End-to-End Troubleshooting Framework for Microservices on Multi-source Data

### 论文简介

论文提出了一个有监督的基于多模态运维数据的异常检测和根因定位一体化的根因诊断方法 Eadro。

下图展示了 Eadro 的核心框架。 

值得注意的是，Eadro 不是由异常检测触发的，它认为先异常检测，再根因定位的两阶段故障诊断方法会冗余地处理相同的输入，丢失异常检测和根因定位之间丰富的相关性信息，进而影响根因定位的准确率。所以 Eadro 会实时将多模态数据作为输入，最后直接输出系统正常或者根因。

![论文简介](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBelWGpOfuU1lSQ8dIicwjpp45zvDq5ibcFourO53UCvJnTcVKHdYzicfXgD2QdWcyM5aib04ibkvicc68zTg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在处理多模态异构数据时，Eadro 同样也将  Trace 和  Log  转化为时序数据，三种数据源的方式处理如下：

对 Metric， Eadro 采用了 1D dilated causal convolution (DCC) 学习时间依赖和不同 KPI  之间的关系，然后使用 self-attention 对  Metric 进行表征

对 Log， Eadro 首先进行  Log Parsing, 然后统计每个日志事件发生的频数，接着用 Hawkes 过程进行建模获得 intensity vector， 并将其 embeding 到 fully connected layer 中

对  Trace，Eadro 像  PDiagnose 一样抽取出来每个服务的延迟，然后采用 Metric 相似的方式进行处理

最后， Eadro 采用  Gated Linear Unit (GLU) 和 Graph Attention Network (GAT) 对以上的层进行融合分析，并得出最后的根因结果。

### 个人评论

论文来自于港中文吕荣聪老师的团队，女孩子写的论文非常好看，跟 Eadro 比起来，我们的论文颜值简直不忍直视。

Eadro 的处理方式同样舍弃了 Trace 中最重要的请求上下文关系，Latency 和  Depenency 这个其实用  Service Mesh 就可以拿到了，也无需去处理复杂的 Trace 。

论文链接：https://arxiv.org/pdf/2302.05092.pdf

代码链接：https://github.com/BEbillionaireUSD/Eadro

## 本文小结 

本文介绍了两个将 Log 和 Trace 转换成与 Metric 同构的时间序列表示，然后输入到故障诊断算法中进行分析的方法。

这种融合方式解决了多模态运维数据的异构问题，实现了多模态运维数据初步的融合。

虽然将  Log 和 Trace 转换成时间序列虽然简单高效，但是对 Log 来说，这种方式丢失了 Log 原本携带的语意信息，降低了方法的可解释性。

对 Trace 来说，丢失了 Trace 记录的最重要的请求上下文信息，如果仅仅使用延迟和拓扑，根本无需插桩和采集成本极高的 Trace ，多少有点杀鸡用牛刀的意思。

为了克服将 Log 和 Trace 转换成时间序列带来的缺陷，当前学术界也提出了其他的多模态运维数据融合方案，欢迎关注我们后续推送，我们将分析更多的多模态运维数据融合的工作。

# 下一代分布式追踪（一）：扩展 Trace 到网络设备

Metrics, Traces, Logs 被誉为可观测性的三大支柱。

Trace 记录了请求在分布式应用程序中运行的轨迹，能够完整的串联起请求的上下文关系，在大规模分布式系统根因定位中的作用举足轻重 。

在 Dapper 之后，Trace 的结构基本稳定下来，那Trace 下一步将往哪个方面发展呢? 

我们今天将介绍如何将 Trace 到网络设备。

## 前言

Metrics, Traces, Logs 被誉为可观测性的三大支柱。

Trace 记录了请求在分布式应用程序中运行的轨迹，能够完整的串联起请求的上下文关系，在大规模分布式系统根因定位中的作用举足轻重 。

在 基于 Traces 的根因定位（一）：Trace 的演进之路 中我们介绍了 Trace 的发展过程，在 Dapper 之后，Trace 的结构基本稳定下来。

再后来是 Opentelmetry 整合了 OpenTracing 和 Opencensus，直接进 CNCF Sanbox项目，成为CNCF 分布式链路追踪的首选，并与 Apache Skywalking 的 Trace 项目旗鼓相当。

但我们可以看到，不管是 Opentelmetry，还是 Skywalking，做的更多是将 Dapper 的思路普世化，例如对 Trace 格式标准化，支持更多的语言以及实现 Trace 数据的可视化。

但没有对 Trace 进一步的演进做出突出贡献。

闲暇期间，我就在想，Trace 下一步将往哪个方面发展呢？

正巧最近 Eurosys, Sigcom, NSDI 等顶会都出现了 Trace 相关的论文。

那我们就来捋一捋国际上顶尖团队是怎么看待 Trace 未来的发展的。

今天我们先来看一下发表在 CCF A 类顶级国际会议 Eurosy 上的 Paper “Foxhound: Server-Grade Observability for Network-Augmented Applications”  

论文链接：https://dl.acm.org/doi/pdf/10.1145/3552326.3567502

## 论文背景

随着摩尔定律的结束，工程师开始探索加速应用程序的替代方法，例如利用GPU加速计算。

可编程数据平面（Programmable data planes，PDP）具有执行用户定义计算的能力，能够将函数下发到网络交换机中，有望提高应用程序的性能。

本文将这种设计范式称为在网计算函数（In-network compute functions，INCs）。

例如，下图展示了一个网络缓存函数，它的功能是识别被查询的最频繁的密钥并将它们缓存在交换机中，从而实现请求不需要经过服务器处理就能得到返回，能够显著加快处理速度。

![paper](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBemHKdNh4wRmxxZFS8uMyRzQbWebs3Dg4DQQMW8dBwicHoQeyzxUBVOB6tfEBNZftHzCQCuiawVnjiaVg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

虽然 INC 能够带来很多好处，但是 INC 与传统的应用程序一样，也是由工程师开发的，也是会受到人为和设备等因素的影响，进而导致各种类型的故障，工程师需要对 INC 进行持续监控，在故障发生时才能快速地进行故障诊断。

## 论文动机

但是，当前的监控系统是为传统的网络或者应用的性能监控设计的，对 INC 的监控存在以下几种缺陷：

Trace 缺乏跨层的监控能力，无法关联服务器和交换机之间的监控数据。例如，对一个请求，当前的 Trace 的 Span 信息无法精确判断请求是由服务器执行的，还是由交换机执行，导致不能很好地处理 INC 的故障

在网遥测系统（INT）专注于以网络为中心的指标，忽略 RPC 的数据。网络遥测产生的记录不包括诊断 INC 必要的请求级别的数据（例如 RPC 延迟）

从上面的分析可以看出，INT 缺乏足够的请求级别的数据来诊断 INC，网络交换机缺乏足够的资源来实现 Trace。那我们直观地就能想到：能否通过关联 INT 和 Trace，实现 1+1 > 2 的效果呢？

本文最核心的观点，就是通过将 INT 数据与x86 Trace 数据合并，实现对 INC  的监控。

## 论文方法

为此，论文提出了一个为 INC 设计的的可观测性框架 Foxhound，Foxhound 的架构图如下图所示。

Foxhound 的核心设计理念是：开发工程师在 INC 中注释数据，运维工程师在运行时查询可观测性数据。

![论文方法](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBemHKdNh4wRmxxZFS8uMyRzQTqKdKcozyiaQ2eIJIbX0VSxCEyGSqlXGsra3EH9rX9aNVtGXjOdDDyg/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

假设当前想要诊断一个 INC 函数 NetCache 的故障，Foxhound 的工作流程如下：

0. PDP 开发人员在 INC 中插入 Annotation，以指示感兴趣的变量

1. 运维工程师将把所需的查询写入 Foxhound

2. Foxhound 生成插桩代码并加载到交换机中

3. Foxhound Shim 层使用唯一的 RPC 标识符（RPCID）标记出站查询请求数据包

4&5. 标记的数据包通过交换机

6. 交换机将带 Annotation 的变量与标记数据包的RPCID一起存储在交换机ASIC上

7. 交换机通过 PCI-link 将数据以 PDP Span 的形式导出到Foxhound框架。

8. x86 服务器 Trace 也被导出到Foxhound框架

9. 合并 x86 Trace 和 PDP Span

进而 Foxhound 实现了服务器的 Trace 和交换机的监控数据融合的过程，将  Trace 扩展到网络设备。

在具体实现的时候，作者还做了一些优化策略，感兴趣的可以阅读原文。

## 本文小结 

随着摩尔定律的终结，硬件性能的增长逐步放慢，将系统功能下放到网络，进行在网计算已经成为优化系统性能重要方式。但是当前的 Trace 和  INT  采集的数据，都不足以帮助工程师精确地诊断在网计算函数。本文将网络 INT 数据与x86 Trace 数据合并，将 Trace 扩展到网络层，实现对 INC 的跨层监控，帮助工程师诊断 INC 故障。

过去的一年，我经历了许多挑战和困难，中间也断更了一段时间，但也收获了成长和坚韧。

我要特别感谢关注和支持我微信公众号的每一位朋友，感谢你们的陪伴和信任，你们是我前进的动力和源泉，希望明年我会更新更多的内容。


# 参考资料

https://mp.weixin.qq.com/s?__biz=MzI5Mjc1NTcwNA==&mid=2247484130&idx=1&sn=8fbcec1dbe1dc0d880f64bf4decea52d&chksm=ec7dc375db0a4a63b408ae57b5aad0a614590e2825f7d7f64380b444ebf829b1fa530d343d5b&scene=178&cur_album_id=2509595374064467968#rd


* any list
{:toc}
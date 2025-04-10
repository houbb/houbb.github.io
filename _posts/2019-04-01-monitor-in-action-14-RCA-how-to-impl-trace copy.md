---
layout: post
title: 监控系统实战-13-RCA 根本原因分析(Root Cause Analysis) 如何实现？基于Trace的根因分析
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, rca, sh]
published: true
---

# 前言

AI paper 的一些，主要看一下思路。

# Trace 的演进之路

接下来的几个月里，将继续不定期总结基于 Traces 的根因定位方法。

Trace 记录了请求在分布式应用程序中运行的轨迹，能够完整的串联起请求的上下文关系，在大规模分布式系统根因定位中的作用举足轻重 。

在讨论基于 Traces 的根因定位之前，本文先简单介绍 Trace 的出现及其演进的过程。

## 02_DSN_Pinpoint: Problem Determination in Large, Dynamic Internet Services

论文简介：典型的 Internet 服务有许多分为多个层的组件：Frontend、WebServer 和 Database，每个层中的许多（复制的）子组件。当客户端连接到这些服务时，它们的请求将通过该系统动态路由到子组件。为了捕获这些动态的请求路径，Pinpoint 设计了一种记录每个请求经过组件的数据格式，用于帮助工程师分析根因。

Pinpoint 为每个组件（Component）生成唯一的 Component ID 用于标记组件，为每个 HTTP 请求生成唯一的标识 Request ID 标记请求。

在请求执行中 Request ID 通过线程局部变量（ThreadLocal）传递到下游组件，每次调用到一个组件，就使用 (Request ID , Component ID) 组合记录一个 Trace Log。

除此之外，Pinpoint 还实时检测请求是否成功，并利用 Failure 字段对请求的成功和失败进行标记。 最后汇总 Trace Log 可获得下表所示的 Trace 数据。

![Tab1](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBemk6P4o0u6XXK9Bre8jNcEx0CicUNusflG1Z7fEb0kZuehcWT2EmUia3OWQzfiaT44ibS24KSkJWf0icgQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文发表于 2002 年的 CCF B 类会议 DSN，是我看到的第一篇生成唯一的 Request ID，并进行全链路传播的论文，为以后 Trace 的实现提供了思路。但在传统的三层架构的服务架构下，Span 之间的父子关系是比较简单的，论文还未考虑复杂的 Parent-Child Span 的构建。

论文链接：https://ieeexplore.ieee.org/document/1029005

## 07_NSDI_X-Trace: A Pervasive Network Tracing Framework

论文简介：现代 Internet 系统通常结合不同的应用程序，并且跨越不同的网络管理域。

为了构建在分布式集群的网络链路，X-Trace 论文延续并扩展了 Pinpoint 论文的思路，提出了能够重新构建完整 Trace 的框架。

X-Trace 的调用链追踪方案是对 Poinpont 思路的扩展，它将 Trace 的 Meta Data 写入到 message 中 (例如，写入到 HTTP 请求的拓展头上)，并沿着请求传播到经过的每个设备上。 

与 Poinpont 相比，如下图所示 X-Trace 的 Meta Data 扩展了更多的元素，引入了 Span ID 和 Colletor 地址的概念。

![F4](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBemk6P4o0u6XXK9Bre8jNcExG7bDicBKygLctwSX8TKy6lnoqNibqxENa8NMNNP5WzcOHHczhuicct9pw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

此外，X-Trace 还设计了一个Trace Collector 的框架，将 Trace 的生成与采集解耦。

X-Trace 在本地启动一个开放一个 UDP 协议端口的守护进程，应用可以将 Trace 发送到守护进程，并放入到一个队列中，队列的另外一边则将 Trace 发送到缓存或者持久化的数据库中。

![x-trace](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBemk6P4o0u6XXK9Bre8jNcExkQwJwmZP1ky6hOEAthTs8rmUib4tfouqyCPuohuwNEvfLHatrnbxKPQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：X-Trace 发表于 2007 年的 CCF A 类会议 NSDI，论文对 Trace 的 Meta Data 的定义已经初具雏形，Trace Collector 的架构也深深地影响了现今的 Opentelemetry Collector, Jeager Agent 等 Trace Collector。但 X-Trace  还主要注重于 Trace 结构的构建，对时间的开销是忽视的，不能很好地诊断性能问题。

论文链接: https://www.usenix.org/conference/nsdi-07/x-trace-pervasive-network-tracing-framework


## 10_Google_Dapper, a Large-Scale Distributed Systems Tracing Infrastructure

论文简介：Google 网站一个 Web Search 请求可能需要上千台服务器和很多不同开发团队开发的服务去处理，为了帮助理解系统的表现和论证效率，Google 设计和开发了 Dapper 用于观测整个系统的行为。 

Dapper 的设计理念与 Pinpoint、 X-Trace 有许多是相通的，Dapper 更注重于在工业应用中的低开销和应用的透明化。

由于 Google 内部的程序间的通信大多是通过 RPC 完成的，因此 Google 将 Dapper Trace 的预先插桩在 RPC 的框架内，预先定义所有 RPC 调用相关 Span，降低了 Trace 插桩的成本。

下图展示了 Dapper Trace 的结构，Trace 由基本单元 Span 组成，一条 Trace 的所有 Span 共享唯一的可标识的 TraceID , 一个 Span 就是带有起止时间戳、RPC 耗时以及应用相关的 annotation。

Parent Span 和 Child Span 通过 Parent ID 关联。

引入 RPC 耗时将极大提升 Trace 用于根因定位潜力。

![parentSpant](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBemk6P4o0u6XXK9Bre8jNcExibGWVM2ZjYBczCmuRR4sj7GYHDx4dZ6Y9uKxK9eApEiazAJDmXZctovw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


此外，为了达到低开销的设计目标，Dapper 还提出对 Trace 的采集进行采样。

根据 Dapper 在谷歌的实践经验，对于许多常用的场景，即使对 1/1024 的请求进行采样收集，也能够得到足够的信息。

个人评论：Dapper 是 Google 2010 年发布的 Technical Report, 它为 Trace 的工业界实践打开了新的大门，启发了Jaeger, Zipkin, Opentelemtry 等众多现代分布式链路系统。而 Trace Sampling 的提出，更是开辟出了一个科研的方向，这里挖坑，我们后面再谈。

论文链接： https://static.googleusercontent.com/media/research.google.com/zh-CN//archive/papers/dapper-2010-1.pdf

## 小结

在 Dapper 的论文发表之后，分布式链路系统日趋走向成熟，中间有一段百家争鸣的日子，Jaeger, Zipkin, OpenTracing, OpenCensus, Skywalking 等开源分布式链路系统都非常活跃。

随着2019年 Opentracing 和 Opencencus 的团队合并到 Opentelemtry 并加入 CNCF，Opentelemetry 的 OTEL 标准逐渐成为云原生 Trace 链路的主流并得到广泛使用。未来 Trace 还会如何进化，让我们保持期待！




# 基于 Trace 的根因定位（二）：Spectrum-Based Fault Localization 根因定位算法


前面我们简单地介绍了 Trace 的出现及其演进的过程。

下面我将总结第一种基于 Trace 的根因定位算法：基于 Spectrum-Based Fault Localization（SFL，基于程序频谱的故障定位）算法的 Trace 根因定位算法。

首先我们介绍一下什么是 SFL ？

SFL 是软件测试领域定位故障常用的一种方法。该方法通过测试用例对被测函数（代码实体）的覆盖情况以及测试用例的成功或失败来对潜在的代码错误进行定位。

具体地，对于某个函数 𝑓 ， 𝑒𝑝 为覆盖了该函数并成功运行的测试用例的数量， 𝑒𝑓 为覆盖了该函数但运行失败测试用例的数量， 𝑛𝑝 为未覆盖该函数并成功运行的测试用例的数量， 𝑛𝑓 为未覆盖该函数并运行失败测试用例的数量。最后通过一些数学公式，利用这四个原始统计量计算各个函数的得分。

如下图是一个由 3 个被测函数和 4 个测试用例的示意图，其中函数 m2 存在代码错误，而且是条件触发的，所有标红的函数和测试用例都出现了错误。

下表中给出了不同函数的 SFL 原始统计量的取值。

![SFL](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenIjjSIxlribzqxC7ME7aVV5DqWJ6LRKApgZFuXibicicqSQ1eCOrDvomztNqqn43aOAL9JxKM8Ev5NVQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

根据数学推理和证明，已经有许多 SFL 计算公式，如

![SFL-formula](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenIjjSIxlribzqxC7ME7aVV5SdwOR162PiaS7elwyUBPIUbI1vg8QDwZbn5Kgxoho7qcZ2eXw6DV01A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

根据 Tarantula 计算方式，上图中 m1、m2、m3 的SBFL的得分分别为 0.5、0.57 和 0，显示代码错误发生在 m2。

我们通过上面的例子可以观察到，每条测试用例经过的程序路径，与 Trace 在分布式系统中的运行路径是相似的，

- 表 1 SFL 与 Trace 根因定位的相似性

![根因定位的相似性](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenIjjSIxlribzqxC7ME7aVV5cf5XTbeMf6YibJd6qhzqbYXkUJNRqCmz5ETWlSia5alEdYehXqASWQGQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

由此我们尝试将 SFL 应用到 Trace 的根因定位中，下面我简单介绍一下我们在这方面的工作。

## 21_CCGrid_T-Rank:A Lightweight Spectrum based Fault Localization Approach for Microservice Systems

论文简介：T-Rank 将微服务的 Trace 作为输入，首先根据 Trace 经过的服务实例的次数对 Trace 进行分类。

接着对每个类别的 Trace，Anomly Detector 通过对 3-sgima 找到该类别中请求延迟异常的 Trace 并判定为异常 Trace，其他 Trace 则归为正常 Trace。

最后根据 表 1 的对应关系，将异常 Trace 和 正常 Trace 输入到 SFL 计算公式中得出最后的根因。

![Trace](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenIjjSIxlribzqxC7ME7aVV5iaSSuB6WRQw20d70JiclnrdDuQ7vOjAtn74icPgFsuWQUb9x626Y7Vkiaw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

论文链接：https://yuxiaoba.github.io/publication/trank/trank.pdf

## 21_WWW_MicroRank: End-to-End Latency Issue Localization with Extended Spectrum Analysis in Microservice Environments

论文简介：经过更深的研究，像 T-Rank 这样将 Trace 数据简单地输入到 SFL 中只考虑了 Trace 的覆盖信息，没有考虑 Trace 它所携带的服务依赖信息，导致无法处理一些  SFL 得分相同的情况。 

因此我们提出了能够将服务依赖信息也融入进 SFL 计算的 MicroRank 根因定位框架。

![SFL](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenIjjSIxlribzqxC7ME7aVV5y1Y08gDbrGJxMXbIMyGuLrFxkNQ2Bl9QG4psBibesCpIn3IeDW3H7ibA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

与 T-Rank 类似的，MicroRank 首先根据 Trace 的延迟将 Trace 划分为异常 Trace 和 正常 Trace。然后  MicroRank 根据正常和异常 Trace 分别构建出正常，异常 operation-trace 图，并在这两个图上利用 PageRank 算法计算出每个 operation 的正常和异常的权重。最后，MicroRank 基于权重与覆盖统计信息相乘的结果计算 SFL 来得到根因。

论文链接：https://yuxiaoba.github.io/publication/microrank/microrank.pdf

个人评论：这两篇论文都是我自己写的，所以可以不需要顾忌，可以直接光明正大的嫌弃自己。

基于 SFL 的 Trace 根因定位算法，从思想上是非常容易理解的，但是在实际应用中还是存在几个问题：

1) 基于 SFL 的 Trace 根因定位算法非常依赖于正常和异常 Trace 的判断结果，但是想要很好地判断哪些 Trace 是正常，哪些 Trace 是异常，其实并不容易。我们不仅需要考虑 Trace 的延迟，还需要考虑 Trace 的返回码， Trace 的结构等等。一旦正常和异常 Trace 判定错了，也会影响到方法的准确率。 

2) 基于 SFL 的 Trace 根因定位算法非常依赖于 Trace 的质量，如果 Trace 的质量比较差，有很多的莫名其妙的断链，实际用起来准确率也会打到折扣。

3) 基于 SFL 的 Trace 根因定位算法目前更倾向于去解决 Microservice 的性能问题，而不是可用性问题，在可用性问题上还需要进一步讨论。

以上我简单介绍了基于 SFL 的 Trace 根因定位算法的思路，相对来说，这种基于统计的根因定位方法比基于深度学习的方法，更容易让运维工程师理解，可解释性也更强。

但是要实际地落地，还需要进一步的研究，希望未来我们还会在这个领域有更大的进展。

# 基于 Trace 的根因定位（三）：Trace 路径抽象

这一期我们再来讨论一下另外一种基于 Trace 的根因定位算法：Trace 路径抽象。

路径（Path）是请求在系统中运行路径的抽象，它记录了同一类请求经过的组件的性能和交互关系。

例如对于下面五条 Trace：

a → b → c → d

a → e → f

a → b → c → d

a → e → f

a → e → f

我们可以将其抽象为两个 Path：

a → b → c → d

a → e →f

然后可以通过统计分析，计算每个组件被经过的数目及平均延迟。

基于 Trace 路径抽象进行根因定位的核心思想是：

**如果我们预先对没有故障的（fault-free）阶段的 Trace 进行 Path 的抽象，那么在故障发生（fault-suffering）阶段我们可以通过比对当前时间窗口的 Path 与历史的 Path 是否表现一致来检测异常和定位根因**。

## 04_NSDI_Path-Based Failure and Evolution Management

论文简介：论文以 Trace 作为输入，在根因定位时主要分为两个步骤：

第一步首先是检测哪些 Path 表现异常，其中包括结构异常和性能异常

对结构异常，论文首先通过 probabilistic context free grammar (PCFG) 根据训练过程中 的 fault-free data 抽象出 Path，并对给定 Path 发生的可能性进行建模。

在生产阶段，如果抽象出来的 Path 不符合训练的 PCFG 模型，那么认为这个 Path 的结构是异常的

对性能异常，系统延迟的偏差往往是问题的信号。尾延迟的增加可能表明部分故障，而平均延迟的增加可能表明过载。延迟的减少可能是由于错误造成的阻止一个请求执行完成

第二步是定位根因，其中包括只有一种 Path 异常和多种 Path 异常发生的情况

对只有一种 Path 异常，论文通过 Path 所体现的控制流引导着本地日志分析工具的使用，以将组件的细节与特定的请求联系起来。如果没有 Path ，单个组件的日志就不那么有用了，因为缺乏日志条目和其他系统状态之间的关联

对多种 Path 异常的情况，其核心思想是搜索组件的使用和失败的请求之间的相关性。论文通过训练一个决策树模型来区分成功和失败的类别，其中导致失败的树边成为根因的候选

![04_NSDI_Path-Based Failure and Evolution Management](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBenJICxib0QPzad5MB3muDoUBkFptYaK9hp6KRk6S095V6nLK56iaQO5wLdwicFDeCBfAtibtgRaPSbrMg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


下图展示了论文的 20 年前的可视化界面

![VISUAL](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenJICxib0QPzad5MB3muDoUBnTZ1UCc6bPAcvnd06WHCcWShz0l9QxibfkfHEqlSS7iaY4wN8jjDYibZw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


个人评论：论文来自 UC Berkeley David Patterson 的 20 年前发表在 NSDI （CCF A）的古董论文，对 Trace 已经有很深刻的见解，并且已经尝试使用 log 和 trace 的融合进行根因定位。

20 年后的 Trace 分析方法也没有能逃出这个分析框架，只能说 RiseLab YYDS。

论文链接：https://www.usenix.org/conference/nsdi-04/path-based-failure-and-evolution-management

## 20_FSE_Graph-Based Trace Analysis for Microservice Architecture Understanding and Problem Diagnosis

论文简介：论文提出一种基于图形分析的微服务架构理解和问题诊断方法 GMTA。GMTA 将微服务中的 Trace 转换为Graph ，通过 Graph 的分析和可视化来发现微服务架构中的问题和瓶颈。它主要提供了四种 Graph 的展示方式：Trace, Path, BusinessFlow 和 Error Propagation Chains （EP Chains）

![FSE](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenJICxib0QPzad5MB3muDoUBWgSaiciahEic25lmVeGbXB39Y7szylwP9woTnwdANIzynJrPe7N9v3Mbw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

Trace：GMTA 根据 Trace ID 对同一个请求的 Span 进行聚合，然后对一些缺乏 Root Span 和没有 Parent span 的 Trace 进行了修复

Error Propagation Chains：给定一个带有 error attribute 的 Span，GMTA 检查该 Span 的一个Child Span 是否也有错误标记，从而构建出 EP Chains

Path: 对每一条 Trace，GMTA 根据 Trace 访问的微服务名称和操作名称进行哈希，生成 Path ID。如果 Path ID 已经存在，那么更新 Path 的属性（如trace数、平均延迟等）。如果 Path 不存在，便为这条 Trace创建一个新 Path。

Business Flow: 由运维人员按需求制定的调用某个微服务与当前操作之前/之后会调用某个微服务 的任意组合。

最后 GMTA Explorer提供4类主要功能。前面两个可视化相关功能主要用于系统架构理解、后面两个功能主要用于故障诊断。

下面是可视化的几个样例。

![几个样例](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBenJICxib0QPzad5MB3muDoUBiajiaUcp5SL573rckWsXeMqQzicWeibmXxf9Wq2G1Jms0oUXkiaVwz4ZGkw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文是 eBay 与复旦大学彭鑫老师团队合作发表的论文。论文更多的是针对于 Path 的抽象和可视化的展示，对根因定位的自动化考虑的还是比较少。

论文链接：https://taoxie.cs.illinois.edu/publications/esecfse20in-trace.pdf

从 2004 年到 2020 年，16 年的时间里可观测性有了很大的发展，分布式的场景让 Trace 已经走进千家万户。

现在大型互联网厂商每日产生的 Trace 数目上百亿条，手动地分析和查看单条 Trace 越来越不实际。

对同种类型的 Trace 的路径进行抽象，再具象化展示，能够更直观地反映当前某种请求的处理状态，帮助运维工程师定位故障，降低运维工程师的运维压力。

但目前基于 Trace 路径抽象方法的根因定位大多还是 UI 展示功能，根因定位自动化能力不足，未来还需继续研究。


# 基于 Trace 的根因定位（四）：Trace 频繁模式挖掘

这一期我们再来讨论一下另外一种基于 Trace 的根因定位算法：Trace 频繁模式挖掘。

频繁模式，在 Trace 根因定位的背景下，可以理解为在一段时间内所有 Trace 中，出现频率较高的连续的 Span 集合。

举个例子🌰，下图中有 5 条 Trace，

```
Trace1: 1->2->3->4
Trace2: 1->2->3
Trace3: 2->3
Trace4: 5->6->7->8
Trace5: 5->7
```

其中图片可以视为在 Trace 集合中出现的模式（Pattern）。

传统的频繁模式挖掘方法通常并不在意 Pattern 中的项的前后依赖关系，但是在 Trace 的分析中，我们应该只考虑**那些连续的有父子关系的Pattern**，如(2,3,4)， 而没有直接父子关系的 Pattern (2,4) 则不被考虑。

这是因为 (2,4) 仅提供了 (2) 和 (4) 一起出现的证据，这个模式被破坏在根因定位中提供的作用较小。

而 (2->3->4) 提供的是(2->3)，且(3->4)的情况，如果这个模式被破坏则说明这个子调用链发生了问题，值得运维工程师关注。

确定一个 Pattern 出现是否是频繁模式（Frequent Pattern），可以通过计算这个 Pattern 的支持度（support）来衡量。

一种 Pattern 的  support 是指在所有 Trace 集合中这个 Pattern 出现的频率。

如上图中(2->3)的 support 是 3 ，因为它一共出现了三次。 

通常我们会定义一个最小支持度的阈值 support_min 来进行划分。也就是说，如果一个 Pattern 的 support > support_min, 那么判定这个 Pattern 属于 Frequent Pattern。 

在获得 Frequent Pattern 后，利用它们进行根因定位的核心思想是：对比正常 Trace 的频繁模式和异常 Trace 的频繁模式的差异，或者对比正常时间段 Trace 的频繁模式和异常时间段 Trace 的频繁模式的差异，找到只在异常时候发生，不在正常时候发生的频繁模式，从而将这些频繁模式判定为根因。

这个思路是比较直观的且可解释的，如果一个 Pattern 在正常的时候经常发生，但是在异常的时候不发生了，那么很有可能这个 Pattern 是因为故障发生导致它没有按正常的路径运行，运维工程师应该优先检查这个 Pattern。

或者如果一个Pattern 之前从不发生，但是在异常的时候发生频繁了，那么很有可能是故障的发生导致它变频繁，也应该优先检查这个 Pattern。而在正常阶段和异常阶段发生频率相似的模式，是不太需要关注的。

下面我再简单介绍两篇使用频繁模式挖掘进行根因定位的论文。

## 21_ICSE_Scalable Statistical Root Cause Analysis on App Telemetry

论文简介：论文提出了一个可扩展统计根因定位框架 Minesweeper。

Minesweeper 以没有故障的 Test 阶段的 Trace 和包含故障的 Control 阶段的 Trace 作为输入。 

它首先通过 PrefixSpan 算法分别挖掘出 Test 和 Control 阶段的  Frequent Pattern 的 support 。

![Minesweeper](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBem7QRVk4SD0jLxKav4RcZaWibzSNSEkoTrKZeRecORT9AS7lxeEoLamPfhEqUExS11OxgmfSFn89hw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


对每一个 Frequent Pattern P，Minesweeper 会根据下面的公式计算出它的 Precision 和 Recall 

![p](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBem7QRVk4SD0jLxKav4RcZaWpQkcxBJ4ycWYR1pJXoXBibfyyFwqFndUKCYEovbLAKjN9yUzkKBZn7g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

这里 Precision 描述了一个 P 在 Test 阶段出现，不在 Control 阶段出现的概率，也就是说在 T 中频繁出现，在 C 中出现不频繁的 P 可疑得分更高。Recall 描述了 P 能覆盖多少 Test 阶段的 Trace，它表示了 P 在 Test 阶段的代表性，越有代表性越重要。最后为了综合考虑两个参数，一个  Frequent Pattern 的可疑性是通过计算它的 F1-Score 得出的。

个人评论：这篇论文是 Facebook 在 2021 年发表在 CCF A 类会议 ICSE 的 Industry Track 上的论文。Minesweeper 来自工业界的真实实践，使用简单的统计方法，可解释性比较强。不过论文似乎没有考虑并发和异步调用的情况。

论文链接：https://arxiv.org/abs/2010.09974

## 21_IWQoS_Practical Root Cause Localization for Microservice Systems via Trace Analysis

论文简介：论文提出了一个 Spectrum 算法与频繁模式挖掘相结合的无监督根因定位算法 TraceRCA。

TraceRCA 以一个时间窗口的 Trace 为输入，然后使用一个无监督多度量异常检测方法检测出异常的 Trace。

Trace 异常检测是另外一个内容了，这里先不细说，我先挖个坑，以后再专门统一对 Trace 异常检测的论文进行分析。

![21](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBem7QRVk4SD0jLxKav4RcZaW2z6YpXlw248iarwzvpkdiahCyo8I13a8KxXRYvt5LqI8U03tOZkoQtAw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在划分好正常的 Trace 和异常的 Trace后，TraceRCA 通过 FP-Growth 算法 来挖掘满足支持度阈值的 Frequent Pattern （即可疑的微服务集），然后计算出 Frequent Pattern  的支持度 (support )和置信度 (confidence) 。

其中 `support = P(X|Y)`，X指的是通过某个 Pattern 的所有 Trace，Y是指所有异常的 Trace，这个 P 指的是在所有异常 Trace 中经过该 Pattern 的异常 Trace比例。 `confidence = P(Y|X)`，指的是所有经过该 Pattern 的 Trace中，异常 Trace所占的比例。

接着 TraceRCA 计算他们的 Jaccard Index (JI) 得分，也就是 support 和 confidence 的调和平均数，获得 Pattern 的可疑得分。

![JI](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBekgmtTY4vJy4UekXOIy6kv4Zlevwzp86yoONhb4962E4mlIbP92Zq4gdhkPEwD5EJUgsQrHpdxR1Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文是清华大学裴丹老师团队 2021 年发表在 CCF B 类会议 IWQoS 上的。与前面 Facebook 的方案比较大的不同是，TraceRCA 需要事先检测出异常的 Trace，这个 Trace 异常检测的效果会对后面根因定位的结果有较大的影响。并且对每条 Trace 进行准确异常检测，不仅难度比较大，计算的量也比较大，一定程度上限制了 TraceRCA 的使用。

论文链接：https://netman.aiops.org/wp-content/uploads/2021/05/1570705191.pdf

代码链接：https://github.com/NetManAIOps/TraceRCA

最后再来小结一下，与 Trace 路径抽象 中输出粗粒度的 Trace 路径不同，频繁模式挖掘最后输出的是一个更细粒度的路径子集，能够帮助运维工程师更快地聚焦到故障点。

此外，基于统计的计算方式以及较强的可解释性，也为这种方法在工业界实际应用提供了可能。


# WWW 2023 云计算领域论文盘点

WWW 全称 World Wide Web Conference，又称 The Web Conference，是一个CCF A 类的，旨在促进互联网技术的研究与发展国际性学术会议。

WWW 的历史可以追溯到 1994 年，首次会议在瑞士日内瓦举行。该会议汇集了来自学术界、产业界、政府和非营利组织的研究人员、开发者和实践者，共同探讨和分享有关互联网技术的最新进展、创新应用和未来发展方向。

WWW 2023 将于 2023年4月30日至5月4日在美国举行。

本次会议共收到 1900 篇投稿， 录用了 365 篇，录用率为 19.2%。我们实验室投了一篇，做了分母。

在这个链接 https://www2023.thewebconf.org/program/accepted-papers/ 中可以看到全部接收的 Paper。

下面跟随本文追踪 WWW 2023 中云计算领域的最新研究吧。

## 2023_WWW_Diagnostor: An Ambiguity-Aware Root Cause Localization Approach Based on Call Metric Data

论文提出了一个无监督的通过分析服务之间 Call Metric 的因果关系进行根因定位方法 CMDiagnostor。这种指标根因定位的思路我们之前在 基于 Metrics 的根因定位 (二)：因果关系图 中概述过，它主要是通过Metrics 之间的依赖关系构建出调用关系图，然后基于相关性或随机游走算法在图上游走从而定位出根因。这种根因定位方法的准确性极大地依赖于调用关系图的构建是否准确。CMDiagnostor 的主要贡献就是优化了调用关系图的构建方式。

传统的调用图构建方式受限于 Call Metric 的有限信息，构建出的调用图有可能会带有歧义（Ambiguity）。 

这里的歧义如下图所示，（a）中是 Call Metric 中包含的调用关系，（b）是根据这些调用关系组合出来的调用图。

但是（b）的调用图在实际的运行中，可能包含（c）中的多种可能的控制流，这就导致了文章所言的歧义。

![tx](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBekv8jkD90fkbYDavNWJViaO9aiaLJzxLMicdJzbAZd6823aeX09VwJXWXweAjFL5DYuJzmlsY2A7VKBg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

如果没有对上文的歧义进行进一步的划分，因果关系图的构建是不够准确的，从而也会影响到根因定位的准确性。

CMDiagnostor 提出了一种流量回归方法（称为AmSitor）来处理模糊性，并构建无模糊调用图。

其核心思想是：将一个下游流量与其可能的上游流量进行线性回归，每个上游流量的回归系数可以被视为其期望值。具有低系数（例如，小于或等于 0.005）的上游将被剪枝掉。

通过 AmSitor 进行剪枝，CMDiagnostor 就可以去除掉调用图中带有的歧义，剩下的根因定位过程（如下图所示）与我们之前分享的  MicroHECL 和 Microscope 大同小异，感兴趣也可看一下 基于 Metrics 的根因定位 (二)：因果关系图 。

![因果关系图](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBekv8jkD90fkbYDavNWJViaO9niaWtsicLzibq9HzVGaBaqxKv8hquImQ2O4An6sfg858qCEth98B0zicgg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 个人评论

CMDiagnostor 是清华大学裴丹老师的团队，话题是一个老话题，但是裴老师的团队又做出了新的创新点，不失为在没有 Trace 的情况下的一种解决方式吧。

但是如果系统的 Trace 已经比较完善，应该是还是使用 Trace 能获得更准确的调用关系。

论文链接：https://netman.aiops.org/wp-content/uploads/2023/02/CMDiagnostor_www_2023.pdf

代码链接：https://github.com/NetManAIOps/CMDiagnostor

## 2023_WWW_CausIL: Causal Graph for Instance Level Microservice Data

### 论文简介

论文为微服务系统提出一个服务实例级别（service instance level）的因果关系图构建框架 CausIL 。

传统的因果构建图方式如 MicroHECL、Microscope 和上文的 CMDiagnostor 一般都是在服务级别（service level）构建因果关系图，这种构造方式对 instance level metric 进行聚合，可能会平滑了某个服务实例的异常表现。

如下图两个例子都是在服务级别进行 metric 的 average 后导致了失真，从而影响到后面的根因定位。

![论文简介](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBelBvx6x6kz4Cc23bI271HzicandAkgoBdiaw5Qd2eaGpUAdaiaDSjXBqx8Ku5b9yHP9yslRJaVg7Tj3A/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

为了克服在服务级别构建因果关系图的缺陷，本文就提出了构建服务实例级别的因果关系图。

对于微服务S，设 x_ijt 是服务 S 的第 j 个实例在 t 时间的第 i 的指标，假设child metric x_ijt 是因果依赖于 parent metric 集合 P(x_ijt)，
那给定 P(x_ijt)‍ 下， 图片的条件分布可以表示为:

![dis](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBelBvx6x6kz4Cc23bI271Hzic2zgLgY6jto4R4D6G49nBfpmckm1dN018naicNu7KkDYdiasBfkUe1nZQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

因果关系估计算法的任务是识别每个 metric 的 parent metric P(x_ijt)以及因果函数f_ij(-)。

给定每个 child metric 的因果parent metric，通过估计器 ^f_ij 估计 parent metric 和 child metric 之间的因果关系的强度。 

CausIL 使用 Fast Greedy Equivalence Search（fGES）和 Bayesian Information Criterion (BIC) 进行因果发现。

![因果发现](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBekJaLVcKRsqHyO3u1fe5WfMSbrJicRwXPob93ZK1GX55pIqwqnV4m7a8n7FVKoOO3zLCDCk49AwGwg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 个人评论

这篇论文是 Adobe 印度研究院的团队发表的论文，最大的贡献是把因果关系细粒度化到服务实例级别，这么简单的 idea 我之前怎么没想到 图片 。

除此之外，论文里还融入了一些 domain knowledge，这些在工业界的实践值得参考

在任何情况下，同一服务中的任何其他 metric 都不会影响 workload
latency 不会影响 resource 利用率。
如果服务之间在调用图上没有连接，禁止服务之间的所有因果关联
对服务内部的 metric 之间的因果关系进行假设（如下图）

![relation](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBekJaLVcKRsqHyO3u1fe5WfMY2axfSkNVjbfImHbyogbzyze41kIYib2qXiaL2CocIkc5b2UnGic2YjIw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

论文链接：https://arxiv.org/abs/2303.00554

代码链接：https://github.com/sarthak-chakraborty/CausIL

# 参考资料


https://mp.weixin.qq.com/s?__biz=MzI5Mjc1NTcwNA==&mid=2247484000&idx=1&sn=213163d8730d386b377b839830375e0c&chksm=ec7dc3f7db0a4ae1c6936d086cc9d26b70189fb18b0936420b48c8aa0537879e3f697ed7e7dc&scene=178&cur_album_id=2509595374064467968#rd

https://mp.weixin.qq.com/s?__biz=MzI5Mjc1NTcwNA==&mid=2247483814&idx=1&sn=d93801fc52754e44afe2bb9ebcabb067&chksm=ec7dc031db0a49273b85e14e81f1b4fb594b5ea4d6a68bb2153944438ca08c5cf282ba6a18c3&scene=178&cur_album_id=2509595374064467968#rd

https://mp.weixin.qq.com/s?__biz=MzI5Mjc1NTcwNA==&mid=2247483932&idx=1&sn=fa1bba0837857adb85fb6b326fa6a1a2&chksm=ec7dc38bdb0a4a9d0a44baa1fea4beab009b7006093571b63dabe6a1d71d3283ad9f3f90ba73&cur_album_id=2509595374064467968&scene=189#wechat_redirect

https://mp.weixin.qq.com/s?__biz=MzI5Mjc1NTcwNA==&mid=2247483968&idx=1&sn=dee2b262fc44871f4314f3e322900265&chksm=ec7dc3d7db0a4ac13acd28169b7f3ce4777a1f73cd1b042f4f4be374a74589ff03d574c1336a&cur_album_id=2509595374064467968&scene=189#wechat_redirect

* any list
{:toc}
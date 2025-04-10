---
layout: post
title: 监控系统实战-13-RCA 根本原因分析(Root Cause Analysis) 如何实现？基于指标的根因分析
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, rca, sh]
published: true
---

# 前言

AI paper 的一些，主要看一下思路。

# 基于 Metrics 的根因定位 (一)：故障刻画

“ Metrics, Traces, Logs 被誉为可观测性的三大支柱。

Metrics 又是三者中在根因定位中最常用的数据源，阅读本文可快速了解当前学术界热门的基于 Metric 的根因定位算法类型——故障刻画。”

故障刻画是指通过提取历史的故障发生时不同 Metric 变化的特征，挖掘出不同种类故障发生时 Metric 变化的特征集合。在运行时阶段，可通过匹配特征集合定位到具体的故障种类。

例如：CPU 竞争的故障的指标变化特征是 {"CPU 利用率升高", "响应延迟升高"}。那么当在线程序出现  {"CPU 利用率升高", "响应延迟升高"} 的情况时可推断为 CPU 竞争的故障。


# 22_FSE_Actionable and Interpretable Fault Localization for Recurring Failures in Online Service System

论文简介：Dejavu 是一种通过对故障进行刻画找到每种故障对应的特征，从而在故障重复发生时快速进行根因定位的方法。

Dejavu  利用基于 gated recurrent unit (GRU)  recurrent neural networks 构建的特征提取器统一表达故障故障单元（failure class）。然后根据 Trace 和 CMDB 构建的 failure dependency graph （FDG）。

接着基于 graph attention networks (GAT) 算法对 FDG 图上的每个故障单元计算聚合的特征。

最后在基于 dense neural network 为每个故障单元计算出故障的得分，得分最高的为根因故障。

此外，Dejavu 还提供了故障的可解释算法用于向 SRE 解释故障的根因。

![SRE](https://mmbiz.qpic.cn/mmbiz_png/Q6Yiby2bYBek0a2BfhoHMBr9kibPJJ9iceR3j0S0ARvDXJhzu6iaVrxsAuZRp0waSX7qe1NnFzTLO9ARiafnIUeP2rw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文是清华大学裴丹老师团队在 CCF A类会议 FSE 上发表。

论文主要针对故障重复发生的场景，需要大量的标签，且无法很好地处理新的故障。

论文链接：

https://arxiv.org/abs/2207.09021

代码链接：

https://github.com/NetManAIOps/DejaVu


# 02 20_VLDB_Diagnosing Root Causes of Intermittent Slow Queries in Cloud Databases

论文简介：这项工作中发现了现实世界中云数据库中的间歇性慢速查询（Intermittent Slow Queries， iSQ）问题。

为了定位 ISQ 问题，论文提出了基于指标根因诊断框架 iSQUAD。 

iSQUAD 首先离线对历史上在发生 iSQ 时的异常指标变化类型进行刻画，将不同种类的 iSQ 聚类为不同的类别。

在在线阶段，通过匹配故障特征相同的类别定位出根因的 iSQ , 并推荐历史的修复策略。

![F5](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBek0a2BfhoHMBr9kibPJJ9iceRdhvZEZL9fI6nE7m0GSQ8ZAsEic9OFBszsqUUMPJIuVEib4UQPB6lHMZg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

论文定义了四种值得参考的异常类型

![四种值得参考的异常类型](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBek0a2BfhoHMBr9kibPJJ9iceRehTtFbUNgrr3YqBOGjJJ882kfxspfZTbZjHZHCf08FWJ9dqxR7wJiaA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评价： MSRA 马明华博士在阿里巴巴李飞飞博士团队访问时发表在 CCF A类会议 VLDB 上的论文。

文章是一篇优秀的故障刻画文章。创新性的提出利用指标的类型来增加更多的线索，方法也可以用于指标的压缩。

但是要获得 Level Shift Up 的类型需要长时间的数据采集，不能实现及时的根因定位。

论文链接:

http://www.vldb.org/pvldb/vol13/p1176-ma.pdf

同一个团队复现代码链接: 

https://github.com/NetManAIOps/DejaVu/blob/master/iSQUAD/iSQ.py


# 03 21_ISSRE_Identifying Root-Cause Metrics for Incident Diagnosis in Online Service Systems

论文简介：论文从大规模的生产系统中总结出 13 种典型的异常模式。

然后提出了一个有监督的根因定位算法 PatternMatcher. PatternMatcher采用双样本假设检验作为粗粒度的异常检测算法，筛选出在该事件发生时表现正常的指标，从而大大减少搜索空间。

之后，利用主动学习对历史故障进行标签，训练出一种基于一维CNN的异常模式分类方法，过滤掉那些工程师不关心的异常模式。

最后利用 p-value 方法对每个指标计算得分并排序。

![F3](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBek0a2BfhoHMBr9kibPJJ9iceRf4GsrxI6eBkS2ZibYsMLQ6ynZwiacKcG3SkjcicaJ0KwNZhtvZOyPBcbA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

论文中总结的典型的指标异常模式：

![指标异常模式](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBek0a2BfhoHMBr9kibPJJ9iceRxsJxaSdMbticCr3GSlcUakfs5ssgWfBAHqD1N1JKAibtJnOZXKJLnOTw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文是清华大学裴丹老师团队的论文，论文总结出的典型的指标异常模式是很值得学习的。

论文链接：

http://netman.aiops.org/wp-content/uploads/2021/10/wch_ISSRE-1.pdf


# 因果关系

除故障刻画外，还有另外一种根因定位的思想是通过Metrics 之间的依赖关系构建出因果关系图，然后基于相关性或随机游走算法在图上游走从而定位出根因。

下面简要介绍典型的几个 Micro.X 算法。

# 01 18_ICSOC_Microscope: Pinpoint the Abnormal Services with Causal Graphs in Micro-service Environments

论文简介：在不进行源代码进行插桩的情况下，Microscope 通过拦截网络连接信息和指标之间的相关性构建出微服务之间的因果关系图。

在根因定位被触发时，Microscope 从前端对因果关系图进行遍历，找到因果关系图每个分支中最深的 SLO 异常服务并判定为根因候选。

最后计算根因候选与前端服务的相关性为每个根因候选赋予得分。

![F1](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBenicPta78wqanckK5CkBIYf7D10qPLfQyebaARgUj0Ok8pQG3Wwv4q0eWdPphfF2RctNCMHZtYtB1Q/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文是我导师来了中大以后组内的第一篇论文,发布在CCF B类会议 ICSOC上。

第一作者的师兄去了外交部，现在在非洲为国奋斗图片。论文的主要贡献放在因果关系图的构建，根因的推断是比较简单的深度优先搜索和根节点的相关性计算。

论文链接：https://link.springer.com/chapter/10.1007/978-3-030-03596-9_1

# 02 20_MicroRCA: Root Cause Localization of Performance Issues in Microservices

论文简介：MicroRCA首先构建一个包含服务调用路径对应主机的属性图。

在异常发生时，MicroRCA通过判断服务之间的边的响应延迟是否异常提取异常子图。

然后通过对子图进行加权计算连接节点之间的相似度，接着使用异常服务节点的响应时间与其容器资源利用率之间的最大相关系数来调整服务异常的分数，最后使用 PageRank 算法进行定位根因。

![pageRank](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBek2tes4DboX4DZSJKfMmCEtOYzJtTAicvvJwNiaQzB58GRMtOs0IVTZZV2JNQ2Pfr1ibEyygqdRT8QZg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文通过构建因果关系图，然后通过对图上的节点和边赋予权重进行 PageRank 计算，是一个通用的根因定位思路。

论文链接：https://hal.inria.fr/hal-02441640/document

代码链接： https://github.com/elastisys/MicroRCA

# 21_MicroDiag: Fine-grained Performance Diagnosis for Microservice Systems

论文简介：

MicroDiag 首先构建不同指标类型之间的异常传播依赖关系：

对资源类指标（如 CPU）传播, MicroDiag 采用 SCM（Structural Causal Model）推断异常的传播方向

对业务指标传播（如 Latency）MicroDiag 先用 Istio 获得服务依赖图，然后根据服务依赖图的逆向推断传播方向

通过资源类和业务类指标传播, MicroDiag 采用 Granger causality tests 推断异常的传播方向

接着 MicroDiag 通过皮尔逊相关系数计算指标间的相似性来判断异常传播的概率，在归一化权重后通过 PageRank 直接计算图中节点的重要性给出节点排序。

![MicroDiag](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBek2tes4DboX4DZSJKfMmCEtVzRmKRae0pQA6PpjXLHs9tqzib8NLNY3aE399uoYeh1Znc8zuJJ2IOg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文发表在 ICSE 2021 的 Workshop 上，对不同种类的资源采用不同的因果推断异常传播的方向值得学习。

论文链接：https://hal.inria.fr/hal-03155797/document

# 21_MicroHECL: High-Efﬁcient Root Cause Localization in Large-Scale Microservice Systems

论文简介：MicroHECL 首先根据根据最近30分钟的服务调用关系构造出服务依赖图，然后通过划分三个异常类型，构建出异常的传播图，最后根据异常传播图找到最深的节点作为根因

对性能故障，MicroHECL 采用 OC-SVM（one class support vector machine）以响应延迟的特征作为输入，判断是否存在性能故障。如果存在性能故障，故障传播从下游传播到上游

对可靠性故障，MicroHECL 采用随机森林以请求错误率的特征作为输入，判断是否存在可靠性故障。如果存在可靠性故障，故障传播从下游传播到上游

流量异常故障，MicroHECL 采用3-sigma 规则检测 QPS 的波动，判断是否存在流量异常故障。如果存在流量异常故障，故障传播从上游传播到下游

最后论文还提出了一个异常传播图剪枝的策略提高分析效率。

![HECL](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBek2tes4DboX4DZSJKfMmCEt1Ou207U3Th2egrBNeiayzI4ic0CTPEyfsfz4sgAAHQpG09drAL7LgaXA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：本文是复旦大学彭鑫老师团队与阿里巴巴合作的论文，论文发表在 ICSE 2021 的 Workshop 上，论文预先对不同种类的异常进行分类，然后根据不同的传播方向分别构造异常传播图的思路值得学习。论文在阿里巴巴的数据上上取得 top3 为 68% 的准确率。

论文链接：https://arxiv.org/pdf/2103.01782.pdf

# DDS

我们实验室最近在 ASE 2022，ISSRE 2022, ICSOC 2022, ICWS 2022 等会议上都有斩获（只有我颗粒无收，泪奔图片），下面简单的介绍一下我们最新的一些研究，有兴趣的同学可以下载论文详细看看。

# 2022_ASE_Graph based Incident Extraction and Diagnosis in Large-Scale Online Systems


论文简介：在大规模微服务系统中，一个可用性的故障可能会因级联效应导致多个上游服务发生异常，这导致难以定位出真正的根因。为了解决这个问题，本文首先将 KPI 与前一天的 KPI 值进行对比对 KPI 进行异常检测，并基于 DBSCAN 和链路图抽取出与被故障影响的异常子图。接着将异常子图及其节点的特征输入到图神经网络中判断是否异常。

如果异常，则在此异常子图上利用 Pagerank 定位出根因。

![Pagerank](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBekpibzzeua4a1oFSkxODrMSKUTN450yqmCNSW8MmS0xxhf9O4rWpmS9jIaWwx7f8qGu7ia0icjJGgXfw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文发表在 CCF A 类会议 ASE 2022 上，论文比较详细地介绍了当前微信内部基于指标和服务依赖图的根因定位算法，久经考验，非常值得落地学习。

论文链接：https://yuxiaoba.github.io/publication/gied22/gied22.pdf

代码链接：https://github.com/IntelligentDDS/GIED

# 02 2022_ISSRE_Going through the Life Cycle of Faults in Clouds:Guidelines on Fault Handling

论文简介：即便是当前最先进的云平台，小范围的可用性故障依旧是层出不穷。云厂商在故障发生后，通常会公开自己对故障的事后分析来给用户一个解释。

在本文中，我们收集并格式化了 354 个来自 AWS，Azure，Google 公开的故障的事后调查（incident）。在此数据集之上，我们从故障的生命周期：故障发生，故障检测，故障定位，故障修复四个方面对这些 incident 进行了定量和定性的研究，并获得了 10 个重要的发现。最后我们还基于这些发现指导当前云计算平台的智能运维，混沌工程和可观测性的研究。

![02](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBekpibzzeua4a1oFSkxODrMSKSVw4C1fcFyK1nM4wPeiaLxKolBZAlY7DI0841cu8Y7nLAD8LVnj22CA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文发表在 CCF B 类会议 ISSRE 2022 上，采集和格式化这 300 多个故障案例的经历真的不堪回首，甚至还为我在微信实习的第一个工作打下了基础。在 rebuttal 的时候还出了突发情况，还好最后被录用了，终于不用再继续更新数据集了。当时我在读 Google SRE 书的时候突然想引用了几个名人名言，还挺有意思的。

论文链接：https://yuxiaoba.github.io/publication/swisslog22/swisslog22.pdf

代码链接：https://github.com/IntelligentDDS/SwissLog

# 2022_ICSOC_MicroSketch: Lightweight and Adaptive Sketch based Performance Issue Detection and Localization in Microservice Systems

论文简介：Trace 是可观测性的重要组成部分，但是基于 Trace 的异常检测和根因定位算法一直受制于对每条 Trace 分析带来的巨大开销。

本文借鉴了网络通信中常用的 Sketch 的思想，首先基于 Sketch 计算出每个调用对的百分位数延迟，然后所有调用对的延迟输入到随机砍伐森林 (Robust Random Cut Forest) 中检测出异常的调用对，最后根据投票机制定位出根因。

![sketch](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBekpibzzeua4a1oFSkxODrMSKCzuCxkpAZkdZZNh4vGCy4mFzL6FRXRG3sCpctyicIU6KJd2sxfPz7MA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


个人评论：论文发表在 CCF B 类会议 ICSOC 2022 上，考虑到大规模的生产系统上遍历分析每一条 Trace 的成本，把 Trace 指标化是当前工业界分析 Trace 的主要方式。本文提出了基于 Sketch 的轻量级 Trace 指标化方案，与遍历每条 Trace 进行分析的 Microrank 相比，速度提升明显。

论文链接：https://yuxiaoba.github.io/publication/microsketch22/microsketch22.pdf

# 2022_ICWS_TS-InvarNet: Anomaly Detection and Localization based on Tempo-spatial KPI Invariants in Distributed Services

论文简介：在大规模的分布式系统正常运行中，某两个 KPI 之间可能存在某种稳定的关系。

例如，上下游服务因流量的一致性 CPU 利用率的变化可能存在稳定的变化关系。我们把这种稳定的关系称为不变量。

本文致力于在系统正常运行阶段挖掘出不同 KPI 之间的不变量关系，在系统发生故障后通过检测不变量是否被破坏来进行异常检测和根因定位。

![KPI](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBekpibzzeua4a1oFSkxODrMSKOqzlCP5vhIzVa5j5quewcvCb68xbEG6sSibrh86EEpKyrnr6UaopTwg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：当前的基于深度学习的异常检测算法通常可解释性比较差，我们提出的基于时空不变量的方法有较强的可解释性，易于工程师理解系统的变化。下图中展示了当故障发生时，不同节点的 KPI 之间不变量的变化的例子，非常容易理解。

![KPI-2](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBekpibzzeua4a1oFSkxODrMSKIGeAbia9nO89QBibNaGvAjibNYL0ywD3XlLjh6R74MwS74DaljRQdQKYQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

论文链接：https://yuxiaoba.github.io/publication/tsinvarnet22/tsInvarNet22.pdf


# Metrics 的根因定位 (三)：多维下钻

这一次将介绍第三种基于 Metric 的根因定位算法: 多维下钻。 

在 SRE 检测到 KPI 发生异常时（如响应成功率下降），还面临一个灵魂拷问：为什么发生异常了？（成功率为什么下降了？）这个时候我们需要增加维的层次，从而可以由粗粒度的数据到细粒度的数据来观察故障。

例如下表我们发现某服务的当前总的失败请求数目比前一个时间点徒增，运维工程师会进一步挖掘失败请求对应的属性，比如查看数据中心的元素，发现只有广州的数据中心出现问题，而其他的数据中心正常，那么可以推断为广州的数据中心存在异常导致的这次故障。

这就是一个简单的多维下钻的样例。

以下是按照表格形式整理的内容：

| 数据中心 | 前一时间点失败请求数 | 当前时间失败请求数 | 差异 |
|----------|----------------------|--------------------|------|
| 广州     | 10                   | 990                | 980  |
| 上海     | 5                    | 5                  | 0    |
| 北京     | 10                   | 11                 | 1    |
| **合计** | **25**               | **1016**           | **991** |

# 14_NSDI_Adtributor: Revenue Debugging in Advertising Systems

论文简介：论文针对广告营收领域的 revenue debugging问题，将多维根因分析问题分解为多个单维根因分析问题，提出了的 Adtributor 算法，并分别针对量值与率值两类指标进行多维度的根因分析。

整体思路如下：

利用 ARMA 模型进行异常检测。根据8周的历史数据，考虑到正常的时间和星期的波动，生成一个基于模型的测量值预测。然后，将实际值与预测值进行比较：当一个测量值的实际值与预测值有明显差异时，将产生一个异常警报。

计算每个维度下每个元素的 explanatory power （单个元素预测值与实际值的差异和整个维度预测值与实际值差异的比值，论文公式 4） 与 surprise 值（可直观理解为预测值与实际值变化的程度，论文公式 5），定位出每个维度下的异常元素集合，最后根据每个维度总的 surprise  值大小汇总输出根因集合。

![mertric](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBelOtvPtedduDJGbicXztia86TSvtq2OAZaJ5u9bKicCU6KpPz6p9dNYNsxEZdicFib9g07jp0wnADKyOibg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：Microsoft 2014 年发表在 NSDI （CCF A）上的论文，论文可以说是基于 Metrics 的多维下钻分析的开山之作，论文在 Mcirosoft 实际落地，可解释性比较强，后面的多维下钻的工作也大多在其基础之上进行创新。

论文链接：https://www.usenix.org/system/files/conference/nsdi14/nsdi14-paper-bhagwan.pdf

# 16_ICSE_iDice: Problem Identification for Emerging Issues

论文简介：软件在发布时一般会有很多分类属性（例如版本号，地域，操作平台等），如果发布有异常，用户通过会反馈上报一些的 Issue，此时需要运维工程师能够快速定位究竟是哪些属性造成了 Issue 的上升，提升响应的速度。

文章以 Issue 的上升作为告警，通过分析一个时间窗口内 Issue 的属性的组合，找出最有可能导致 Issue 上升的最小属性组合。面对搜索空间过大的问题，论文使用了启发式的三个剪枝策略来应对：

Impact based Pruning：一个有用的属性组合必须引起较大数量变化

Change Detection based Pruning: 一个有用的属性组合必须在时间点上符合变化特征

Isolation Power based Prunning: 合并多余属性组合

![report](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBelOtvPtedduDJGbicXztia86Ts5mU3MHW8pyUKQIeS3MUFTQgJhktKNVzwNzicGOomADtrsq9GJbW5ag/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：MSRA 林庆维研究员 2016 年发表在 ICSE（CCF A）的论文。论文针对性地处理了用户反馈 Issue 的维度下钻，并在微软落地，剪枝的策略比较值得学习。

论文链接：http://hongyujohn.github.io/iDice.pdf

# 20_ASE_ImpAPTr: A Tool For Identifying The Clues To Online Service Anomalies

论文简介：论文提出了一个广度优先的多维下钻根因定位算法，ImpAPTr，整体思路可分为以下四个步骤：

1. 根据维度组合创建包含根结点和子结点的元素树，如下图所示；

2. 采用广度优先遍历算法，删除冗余元素和影响系数 （Impact Factor，论文公式3）相反的元素；

3. 计算每个维度组合的贡献度 （Contribution Power，连续两个时间段的影响系数差值，论文公式4）和差异系数 （Diversity Factor， 两个连续时间段内的成功率指标变化程度， 论文公式 5） ；

4. 计算每个维度组合 Contribution Power 和 Diversity Factor 的排名之和 ，选取前 n 个维度组合作为成功率下跌的根因线索。

![impa](https://mmbiz.qpic.cn/mmbiz_jpg/Q6Yiby2bYBelOtvPtedduDJGbicXztia86TohJ57M0h3dOcCGQEcgTo2WepxibvLltNw5xrkuBzHlIbNpH6zGk2k5w/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

个人评论：论文是南京大学与美团合作发表在 ASE 2020 上的一篇短文。与 Adtributor  只考虑单个维度不同，ImpAPTr 考虑了多个维度，且构建出维度之间的关系图，通过在图上做广度优先搜索进行根因定位。美团实际落地算法的总结。这个方法在根因的属性数量不多以及单根因的时候定位效果应该会比较好。公司内部落地的算法愿意开源，美团真的良心图片图片。

论文链接：https://dl.acm.org/doi/10.1145/3324884.3415301

代码链接：https://github. com/wanghaoUp/ImpAPTr

基于 Metrics 的根因定位已经写到第三个方法了，总的来说， 我个人感觉 因果关系图 更倾向于找模块之间的根因，而多维下钻则是更倾向于找模块内的根因，这两类方法在工业界都已经比较成熟。而 故障刻画 的方法由于依赖于历史已发生故障的标签，且难以处理历史没有出现过的故障，是当前业内比较少用的方法。



# 参考资料

https://mp.weixin.qq.com/s?__biz=MzI5Mjc1NTcwNA==&mid=2247483712&idx=1&sn=f5d85933ccfab91d854bdeb03eefec2e&chksm=ec7dc0d7db0a49c112714d32491b0df1ab410d83d5ae54384c3303016481fbabae78b518a2fc&scene=178&cur_album_id=2509595374064467968#rd


https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzI5Mjc1NTcwNA==&action=getalbum&album_id=2509595374064467968&scene=173&subscene=&sessionid=svr_3e71ec24ddd&enterid=1744092730&from_msgid=2247483712&from_itemidx=1&count=3&nolastread=1#wechat_redirect

https://mp.weixin.qq.com/s?__biz=MzI5Mjc1NTcwNA==&mid=2247483749&idx=1&sn=a000625583f995a2670c119ef7b6b7a0&chksm=ec7dc0f2db0a49e46f91bc9754eab08ae0d0dfe6a1796eddc7ebf10eb742f43cad02854d9c25&scene=178&cur_album_id=2509595374064467968#rd

https://mp.weixin.qq.com/s?__biz=MzI5Mjc1NTcwNA==&mid=2247483788&idx=1&sn=a934d21a2b505578d98a72c497d6be44&chksm=ec7dc01bdb0a490def38341baef9451305f16cab2702c9fb14f50c629873dbe07491731e8cee&cur_album_id=2509595374064467968&scene=189#wechat_redirect

* any list
{:toc}
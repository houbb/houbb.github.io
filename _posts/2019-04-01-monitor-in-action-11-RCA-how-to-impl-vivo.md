---
layout: post
title: 监控系统实战-11-RCA 根本原因分析(Root Cause Analysis) 如何实现？亿级vivo 故障定位平台的探索与实践
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---


# 一、背景介绍

## 1.1 程序员的困扰

作为一名IT从业人员，比如开发和运维，多少有过类似的经历：睡觉的时候被电话叫醒，过节的时候在值班，游玩的时候被通知处理故障。

作为一名程序员，我们时时刻刻都在想着运用信息技术，为别人解决问题，提升效率，节省成本。

随着微服务架构的快速发展，带来一系列复杂的调用链路和海量的数据。

对于我们来说，排查问题是一个大挑战，寻找故障原因犹如大海捞针，需要花费大量的时间和精力。

## 1.2 现状分析

vivo已经建立了一套完整的端到端监控体系，涵盖了基础监控、通用监控、调用链、日志监控、拨测监控等。

这些系统每天都会产生海量的数据，如何利用好这些数据，挖掘数据背后的潜在价值，让数据更好的服务于人，成为了监控体系的探索方向。

目前行业内很多厂商都在朝AIOps探索，业界有一些优秀的根因分析算法和论文，部分厂商分享了在故障定位实践中的解决方案。

vivo有较完整的监控数据，业界有较完整的分析算法和解决方案，结合两者就可以将故障定位平台run起来，从而解决困扰互联网领域的定位问题。接下来我们看下实施的效果。

# 二、实施效果

目前主要针对平均时延指标的问题，切入场景包括两种：主动查询和调用链告警。

## 2.1 主动查询场景

当用户反馈某个应用很慢或超时，我们第一反应可能是查看对应服务的响应时间，并定位出造成问题的原因，通常这两个步骤是分别进行，需要用到一系列的监控工具，费时费力。

如果使用故障定位平台，只需从vivo的paas平台上进入故障定位首页，找到故障服务和故障时间，剩下的事情就交给系统完成。

## 2.2 告警场景

当收到一条关于平均响应时间问题的调用链告警，只需查看告警内容下方的查看原因链接，故障定位平台就能帮助我们快速定位出可能的原因。

下图是调用链告警示例：

![alarm](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKJncCdv8YnWicHEFwH493zLRfWpWVz5OaZEBicBuloic2GoaD8icn6oUbxg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

调用链是vivo服务级监控的重要手段，上图红框内原因链接是故障定位平台提供的根因定位能力。

## 2.3 分析效果

通过以上两种方式进入故障定位平台后，首先看到的是故障现场，下图表示服务A的平均响应时间突增。

![分析效果](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKYQp978RrMPD9rcd2dg3WwybPm58OuxQXksG49F9iaIicbPAZPU8YwqeQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

上图红框区域，A服务从10:00左右，每分钟平均时延从78ms开始增长，突增到10:03分的90ms左右

直接点击图2蓝色的【根因分析】按钮，就可以分析出下图结果：

![rca](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaK7N41fUMoSBJZIrXOY2b9E7niapEWzhNiavzgLOPXTlkEAlUWnGmjkofQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

从点击按钮到定位出原因的过程中，系统是如何做的呢？接下来我们看下系统的分析流程。

# 分析流程

![分析流程](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKRQV1q26RfO5OymdF9daibRHGdXIduDrTMrvdPN09d7XRZRNTj6nWbPw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

红色箭头各部分组成了一个递归调用

图4是根因分析的主要流程，下面将通过文字详细描述：

```
第一步：前端将异常服务名和时间作为参数通过接口传递到后端；

第二步：后端执行分析函数，分析函数调用检测算法，检测算法分析后，返回一组下游数据给分析函数(包括下游服务及组件、波动方差及pointType)；

第三步：分析函数根据pointType做不同逻辑处理，如果pointType=END_POINT，则结束分析，如果pointType=RPC_POINT，则将下游服务作为入参，继续执行分析函数，形成递归。

RPC_POINT包含组件：HTTP、DUBBO、TARS

END_POINT包含组件：MYSQL、REDIS、ES、MONGODB、MQ
```

最终分析结果展示了造成服务A异常的主要链路及原因，如下图所示：

![rca](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKLGvrg6YJaTuia2Wk5qYpTfdYhSenLtKXEGTiaR7sIPfnA3PSAlxZ7l8g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在整个分析过程中，分析函数负责调用检测算法，并根据返回结果决定是否继续下钻分析。

而核心逻辑是在检测算法中实现的，接下来我们看下检测算法是如何做的。


# 四、检测算法

## 4.1 算法逻辑

检测算法的大体逻辑是：先分析异常服务，标记出起始时间、波动开始时间、波动结束时间。

然后根据起始时间～波动结束时间，对异常服务按组件和服务名下钻，将得到的下游服务时间线分成两个区域：正常区域(起始时间~波动开始时间)和异常区域(波动开始时间～波动结束时间)，最后计算出每个下游服务的波动方差。

大体过程如下图所示：

![算法逻辑](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKDUuoPbIrAuoHCfia20IesDf3zicSiadjoKVHYrGcqIWib5ViaWxpzib1Od9Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

图中异常服务A调用了两个下游服务B和C，先标记出服务A的起始时间、波动开始时间、波动结束时间。

然后将下游服务按时间线分成两个正常区域和异常区域，标准是起始时间 到 波动开始时间属于正常区域，波动开始时间 到 波动结束时间属于异常区域。

## 那么波动方差和异常原因之间有什么关联呢？

其实波动方差代表当前服务波动的一个量化值，有了这个量化值后，我们利用K-Means聚类算法，将波动方差值分类，波动大的放一起聚成一类，波动小的放一起聚成一类。

如下图：

![k-means](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKfyIBsZ38KkHzGT58nJbcZbhP00PXTmM0LTic0A5x0FmJmOuzc3YFHeg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

最后我们通过聚成类的波动方差，过滤掉波动小的聚类，找到最可能造成异常服务的原因。以上是对算法原理的简要介绍，接下来我们更进一步，深入到算法实现细节。

## 4.2 算法实现

（1）切分时间线：将异常时间线从中点一分为二，如下图：

![切分时间](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKECRSTVy1BTN05bKPnR5YEAtpGm873kwF5Jwx1JTxlfd2wRWM9vTNicA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


(2) 计算波动标准差：运用二级指数平滑算法对前半段进行数据预测，然后根据观测值与预测值计算出波动标准差，如下图：


![计算波动标准差](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKbCYjMx0R9pR1Uic80iaic1oHc2Y8zokmZJtveua0uxBgx7byrbTBBib36Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


(3)计算异常波动范围：后半段大于3倍波动标准差的时间线属于异常波动，下图红线代表3倍波动标准差，所以异常波动是红线以上的时间线，如下图：

![计算异常波动范围](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKnvTwWRAkxSv3V3c5CAR5OyxhicUnhF4zdEgXqrOpOia43Xu8uxgvrhxg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

（4）时间点标记：红线与时间线第一次相交的时间点是波动开始时间，红线与时间线最后一次相交的时间点是波动结束时间，起始时间和波动结束时间关于波动开始时间对称，如下图：

![时间点标记](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKELCJ6MxgEk0zrI6v8xKxYKUzHy2EMA6iag4aw7ngvqefkrNUJfialFicA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

（5）服务下钻：根据起始时间～波动结束时间，对异常服务按组件和服务名下钻，得到下游服务时间线，如下图：

![服务下钻](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKaEPLCwib3MwZyjYUK6cwsIh5XjMF0rdHqd7lziaLWf47ERMicf1v5yPRw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

（6）计算正常区域平均值：下游服务的前半段是正常区域，后半段是异常区域，先求出正常区域的平均值，如下图：

![计算正常区域平均值](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaK6iaokuWvBXrfsj7PyibMaGGC0UkfGmGFo4zqyLOAarPhNJvJUCDOEhibQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

（7）计算异常区域波动方差：根据异常区域波动点与正常区域均值之间的波动计算波动方差和波动比率，如下图：   

![计算异常区域波动方差](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKxJIhYDZALuFNxa3QHPgQClUk5FUTibfeQZclCu9yZkAWTaR81OrlPRQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

（8）时间线过滤：过滤掉波动方向相反、波动比率小于总波动比率的1/10的时间线，排除正常时间线，如下图：

![时间线过滤](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKdWQmbicojicpTw97OE6ZxK7toiaRuyhumRK2SWS8lvqGHJpeHzWLAjByA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

（9）对剩余下钻时间线进行KMeans聚类，如下图：

![k-means](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt667HzrwePXayQ5yOiap3EiaKSx1K0dFJ73wD11icencau1zCZZQFZeCmsVnHcT15YoXrRdns0Qtbvibw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


# 五、简要总结

1、一种小而美的根因定位算法，利用方差量化波动，再通过排除法过滤掉波动小的下游，留下可能的下游作为原因。这种算法可以利用我们较完善的链路数据，可实现的成本低；

2、针对下游依赖场景的原因定位，准确率可达85%以上。但没有覆盖自身原因造成的故障(如GC、变更、机器问题等)；

3、分析结果只能提供大概的线索，最后一公里还是需要人工介入；

4、故障定位算是AI领域的项目，开发方式与传统的敏捷开发有一定的区别：

角色职责：领域专家(提出问题) → AI专家(算法预研) → 算法专家(算法实现和优化) → 应用专家(工程化开发)

操作步骤：调研论文和git(业界、学界、同行) → 交流 → 实践 → 验证

项目实施：复杂问题简单化，先做简单部分；通用问题特例化，找出具体案例，先解决具体问题。

# 六、未来展望

1、故障预测：当前我们主要关注服务出现异常后，如何检测异常和定位根因，未来是否能够通过一些现象提前预判故障，将介入的时间点左移，防患于未然；

2、数据质量治理：当前我们的监控数据都有，但数据质量却参差不齐，而且数据格式的差异很大(比如日志数据和指标数据)，我们在做机器学习或AIOps时，想要从中找出一些有价值的规律，其实挺难的；

3、经验知识化：当前我们的专家经验很多都在运维和开发同学的脑海中，如果将这些经验知识化，对于机器学习或AIOps将是一笔宝贵的财富；

4、从统计算法往AI算法演进：我们故障定位现在实际用的是统计算法，并没有用到AI。统计往往是一种强关系描述，而AI偏向弱关系，可以以统计算法为主，然后通过AI算法优化的方式。


# 参考资料

https://mp.weixin.qq.com/s?__biz=MzU0OTE4MzYzMw==&mid=2247552936&idx=3&sn=f8b47d7b84edce2ca44c0db35fa97000&chksm=fa989743b1de83a09c6fdc41cec9f379b426fbb6c1ab169728487474c7d4e92aa06d363014ad&mpshare=1&scene=1&srcid=0402URH1WR2fr1lWHvGqLCCY&sharer_shareinfo=ec50c8e24f4ce20b3e077e579b46eb51&sharer_shareinfo_first=ec50c8e24f4ce20b3e077e579b46eb51#rd

[1]Dapper, a Large-Scale Distributed Systems Tracing Infrastructure[EB/OL]，2010-04-01.

[2]Holt-Winters Forecasting for Dummies (or Developers)[EB/OL]，2016-01-29.

[3]k-means clustering[EB/OL]，2021-03-09.


* any list
{:toc}
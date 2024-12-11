---
layout: post
title: 开源分布式系统追踪 02-pinpoint-01-入门介绍
date:  2023-07-25 08:00:00 +0800
categories: [Trace]
tags: [trace, distributed, opensource, apm, sh]
published: true
---

# 分布式跟踪系列

## CAT

[cat monitor 分布式监控 CAT-是什么？](https://houbb.github.io/2023/09/19/cat-monitor-01-overview)

[cat monitor-02-分布式监控 CAT埋点](https://houbb.github.io/2023/09/19/cat-monitor-02-event-tracking)

[cat monitor-03-深度剖析开源分布式监控CAT](https://houbb.github.io/2023/09/19/cat-monitor-03-depth)

[cat monitor-04-cat 服务端部署实战](https://houbb.github.io/2023/09/19/cat-monitor-04-server-deploy-in-action)

[cat monitor-05-cat 客户端集成实战](https://houbb.github.io/2023/09/19/cat-monitor-05-client-intergration-in-action)

[cat monitor-06-cat 消息存储](https://houbb.github.io/2023/09/19/cat-monitor-06-message-store)

## skywalking

[监控-skywalking-01-APM 监控入门介绍](https://houbb.github.io/2019/04/01/monitor-skyworking-01-overview)

[监控-skywalking-02-深入学习 skywalking 的实现原理的一些问题](https://houbb.github.io/2019/04/01/monitor-skyworking-02-chat)

[监控-skywalking-03-深入浅出介绍全链路跟踪](https://houbb.github.io/2019/04/01/monitor-skyworking-03-intro)

[监控-skywalking-04-字节码增强原理](https://houbb.github.io/2019/04/01/monitor-skyworking-04-why)

[监控-skywalking-05-in action 实战笔记](https://houbb.github.io/2019/04/01/monitor-skyworking-05-in-action)

[监控-skywalking-06-SkyWalking on the way 全链路追踪系统的建设与实践](https://houbb.github.io/2019/04/01/monitor-skyworking-06-summary)

## 其他

[开源分布式系统追踪-00-overview](https://houbb.github.io/2023/07/25/distributed-trace-opensource-00-overview)

[开源分布式系统追踪-01-Zipkin-01-入门介绍](https://houbb.github.io/2023/07/25/distributed-trace-opensource-01-zipkin-01-intro)

[开源分布式系统追踪 02-pinpoint-01-入门介绍](https://houbb.github.io/2023/07/25/distributed-trace-opensource-02-pinpoint-01-intro)

[开源分布式系统追踪-03-CNCF jaeger-01-入门介绍](https://houbb.github.io/2023/07/25/distributed-trace-opensource-03-cncf-jaeger)


# PinPoint

[pinpoint](https://naver.github.io/pinpoint/) is an APM (Application Performance Management) tool for large-scale distributed systems written in Java / PHP. 

受Dapper的启发，Pinpoint提供了一种解决方案，可通过跟踪跨分布式应用程序的事务来帮助分析系统的整体结构以及其中的组件如何互连。

## 是否需要

您绝对应该检查出是否要

- 一目了然地了解您的应用程序拓扑

- 实时监控您的应用程序

- 获得每笔交易的代码级可见性

- 安装APM代理而无需更改任何代码

- 对性能的影响最小（资源使用量增加约3％）

![ss_server-map.png](https://naver.github.io/pinpoint/images/ss_server-map.png)

## 快速预览

[pinpoint 快速预览](http://125.209.240.10:10123/#/main)

# 设计架构

![pinpoint-architecture.png](https://naver.github.io/pinpoint/images/pinpoint-architecture.png)

# Overview

当今的服务通常由许多不同的组件组成，它们之间相互通信以及对外部服务进行API调用。 

每笔交易如何执行通常被留在黑匣子中。 

精确跟踪这些组件之间的事务流，并提供清晰的视图以识别问题区域和潜在瓶颈。

- ServerMap

通过可视化其组件如何互连来了解任何分布式系统的拓扑。 

单击节点可显示有关组件的详细信息，例如其当前状态和事务计数。

- 实时活动线程图表

实时监视应用程序内部的活动线程。

- 请求/响应散点图

随时间可视化请求计数和响应模式，以识别潜在问题。 

可以通过在图表上拖动来选择事务以获取更多详细信息。

## CallStack

获得分布式环境中每个事务的代码级可见性，在单个视图中识别瓶颈和故障点。

![ss_call-stack.png](https://naver.github.io/pinpoint/images/ss_call-stack.png)

## 检查器

查看有关应用程序的其他详细信息，例如CPU使用率，内存/垃圾收集，TPS和JVM参数。

![ss_inspector.png](https://naver.github.io/pinpoint/images/ss_inspector.png)

# 参考资料

[Opentsdb Document](http://opentsdb.net/docs/build/html/index.html)


* any list
{:toc}
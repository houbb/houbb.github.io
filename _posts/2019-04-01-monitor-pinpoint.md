---
layout: post
title: PinPoint-监控
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, sf]
published: true
---

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
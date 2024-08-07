---
layout: post
title: 时序数据库-04-InfluxData-分布式时序数据库
date:  2019-4-1 19:24:57 +0800
categories: [Database]
tags: [database, dis-database, distributed, time-series, sf]
published: true
---

# 时序数据库系列

[时序数据库-01-时序数据库有哪些？为什么要使用](https://houbb.github.io/2019/04/01/database-time-seriers-01-overview)

[时序数据库-02-聊一聊时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-02-chat)

[时序数据库-03-opentsdb-分布式时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-03-opentsdb)

[时序数据库-04-InfluxData-分布式时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-04-influxdb)

[时序数据库-05-TDengine 是一款开源、高性能、云原生的时序数据库 (Time-Series Database, TSDB)](https://houbb.github.io/2019/04/01/database-time-seriers-05-00-tdengine-overview)

[时序数据库-05-TDengine Time-Series Database, TSDB](https://houbb.github.io/2019/04/01/database-time-seriers-05-01-tdengine-chat)

[时序数据库-05-TDengine windows11 WSL 安装实战笔记 docker](https://houbb.github.io/2019/04/01/database-time-seriers-05-02-windows-wls-install)

[时序数据库-06-01-vm VictoriaMetrics 快速、经济高效的监控解决方案和时间序列数据库](https://houbb.github.io/2019/04/01/database-time-seriers-06-01-vm-intro)

[时序数据库-06-02-vm VictoriaMetrics install on docker 安装 vm](https://houbb.github.io/2019/04/01/database-time-seriers-06-02-vm-install-docker)

[时序数据库-06-03-vm VictoriaMetrics java 整合](https://houbb.github.io/2019/04/01/database-time-seriers-06-03-vm-java-integration)

[时序数据库-06-04-vm VictoriaMetrics storage 存储原理简介](https://houbb.github.io/2019/04/01/database-time-seriers-06-04-vm-storage)

[时序数据库-06-05-vm VictoriaMetrics cluster 集群原理](https://houbb.github.io/2019/04/01/database-time-seriers-06-05-vm-cluster)

[时序数据库-06-06-vm VictoriaMetrics cluster 集群访问方式](https://houbb.github.io/2019/04/01/database-time-seriers-06-06-vm-cluster-access)


# InfluxData

[InfluxData](https://www.influxdata.com/) 提供领先的时序平台，用于检测、观察、学习和自动化各种系统、应用程序和业务流程，适用于多种使用场景。

# 核心功能

## DevOps Observability

观察并自动化面向客户的关键系统，基础架构，应用程序和业务流程。

## 物联网分析

实时分析和自动化传感器和设备，在仍然重要的同时提供洞察力和价值

## 实时分析

利用对仪器和可观察性检测模式的投资并创造新的商机

# 时间序列平台

## 为何选择专用时间序列平台？

计算基础架构和架构基于新的需求和需求而发展。现有技术通常不足以满足这些新要求。

考虑大数据以及HDFS和Hadoop的出现：创建了一个全新的类别和市场，因为SQL和noSQL存储中的先前数据存储技术不足以满足这些新需求。

没有人会认真考虑在SQL数据库上运行他们的数据湖 - 对于时间序列数据也是如此。

除了时间序列数据库之外，没有人应该考虑将时间序列数据存储在任这就是我们创建一个专门构建的现代时间序列平台的原因。

## 增长最快的数据库 - 时间序列数据库

根据DB-Engines的数据，时间序列数据库（TSDB）的类别在过去两年中一直是增长最快的数据库类别。这一增长受到两大行业趋势的推动 - 物联网系统的快速增长，物联网系统投资的增加，以及云原生应用和服务软件世界的爆炸式增长，所有这些都是真实的 - 时间可见性和控制力。这种“仪器时代”正在促进专用时间序列平台的增长，该平台可以支持实时处理无数指标和事件的关键要求，从而为数据驱动的组织提供洞察力和竞争优势。

## 时间序列数据库的要求

时间序列数据库必须处理特定的工作负载和要求。他们需要每秒摄取数百万个数据点;以非阻塞方式对这些大数据集执行实时查询;下采样并驱逐高精度低值数据;优化数据存储以降低存储成本;并执行复杂的时间限制查询以从数据中提取有意义的洞察力。只有使用InfluxData提供的专用平台才能满足这些要求。

## 功能架构

InfluxData平台是一个完整的平台，用于处理来自人类，传感器或机器的所有时间序列数据 - 无缝收集，存储，可视化以及将洞察力转化为行动。凭借快速部署和快速性能，InfluxData可实时提供真正的价值。 InfluxData有三个主要产品：InfluxCloud（完全托管和托管服务），InfluxEnterprise（可在本地或任何云提供商运行的软件），以及开源时间序列平台。


## 仪器

InfluxData提供了一套全面的工具和服务，可以从传感器，设备，系统，机器，容器和应用程序中获取指标和事件数据。 InfluxData的收集服务是从开源Telegraf项目或一组客户端库构建的。 Telegraf代理是插件，可以从200多个来源收集数据。数据存储在InfluxDB中，支持高写入负载，大数据集存储，并通过压缩节省空间。

## 守

观察过程要求您能够实时查询，分析和可视化大型数据集。

InfluxData平台提供此功能以及特定的基于时间的功能，用于“随时间变化”分析和控制。

## 自动化

在实现系统自动化的过程中，您需要对时间序列数据采用相同的方法。 InfluxData允许用户自动下采样，过期和删除不需要的数据以及备份和恢复。通过数据本身，InfluxData允许用户插入自定义逻辑或用户定义的函数来处理具有动态阈值的警报，匹配模式的度量或计算统计异常，自动扩展容器，并且基本上可以执行任何可编程的操作。它可以对流式传输以及存储在数据库中的数据执行这些分析。

## 学习

开发人员可以使用集成的开源项目Chronograf分析数据，绘图并将其可视化，并对数据进行临时探索。此外，InfluxDB还支持其他可视化工具，如Grafana。它们还可以促进机器学习和异常检测算法，以及为运动中的数据提供流分析。

# 个人感受

1. DevOps 是个非常好的思想。有时候将其和 database 结合起来，也可以成为产品的噱头。

2. 任何一个技术都应该形成其对应的生态。

# 参考资料

[influxdata 产品](https://www.influxdata.com/products/)

* any list
{:toc}
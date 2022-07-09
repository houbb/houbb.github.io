---
layout: post
title: SOFALookout 介绍-01-overview
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, rpc, sh]
published: true
---


# SOFALookout

SOFALookout 是蚂蚁金服开源的一款解决系统的度量和监控问题的轻量级中间件服务。

它提供的服务包括：Metrics 的埋点、收集、加工、存储与查询等。

该开源项目包括了两个独立部分，分别是客户端与服务器端服务。

## 客户端部分

SOFALookout Client 是一个 Java 的 SDK，可以帮助开发者在项目代码中进行 metrics 埋点。通过它也可以查看该 JAVA 应用的实时的状态信息。

```
       +------------------+                      Reg:
 API:  | dimension meters +--------+
       +------------------+        |   flatmap   +---------------------------+
                                   +-----------> |  Default/DropwizardMetrics|
                                   |             +---------------------------+
                                   |
                                   |    http     +--------------+
                                   +-----------> |Lookout server|
                                   |             +--------------+
       +----------------------+    |  add common tags dimension
EXTS:  |   JVM,OS,GC...       +----+
       +----------------------+

```


## 服务器端服务

SOFALookout Server 可以帮助我们解决分布式环境下系统状态度量的问题，它提供丰富的协议接入支持，包括自有SDK（SOFALookout Client）上报协议，还支持 Prometheus 的数据协议（推模式和拉模式），Metricbeat 协议（版本是6），Opentsdb写入协议。 

Lookout Server 兼容和增强了 Prometheus 的数据及元数据查询的 RESTful API。

同样对应 PromQL 我们也基本实现了兼容和增强（不包括 Alert 相关语法）。

### Metrics 服务器端主要特性:

- 适配社区主要 Metrics 数据源协议写入（比如: Prometheus，Metricbeat等）；

- 数据的存储支持扩展，暂时开源版默认支持 Elasticsearch,并且透明和自动化了相关运维操作；

- 遵循 Prometheus 查询 API 的标准以及支持 PromQL，并进行了适当改进；

- 自带数据查询的控制台，并支持 Grafana 进行数据可视化；

- 使用简单，支持单一进程运行整个服务器端模块。


### Metrics 服务器端工作机制

```
+----------------+
| Lookout Client +-----+
+----------------+     |
+----------------+     |
| Prometheus SDK +-----+  +-------------------+   +----------------------+     +------------------+    +-----------+
+----------------+     +-->  Lookout Gateway  +--->  DB(ES/InfluxDB...)  <-----+  Lookout Server  <----+  Grafana  |
+----------------+     |  +-------------------+   +----------------------+     +------------------+    +-----------+
|   Metricbeat   +-----+
+----------------+     |
+----------------+     |
|       ...      +-----+
+----------------+
```


# 参考资料

https://www.sofastack.tech/projects/sofa-lookout/overview/

* any list
{:toc}
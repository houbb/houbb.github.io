---
layout: post
title: 开源分布式系统追踪-03-CNCF jaeger-01-入门介绍
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


# Jaeger

欢迎来到 Jaeger 文档！

在下面，您将找到适用于Jaeger初学者和有经验用户的信息。如果您找不到所需内容，或遇到未涵盖的问题，我们非常希望听到您的反馈。

### 关于

Jaeger是一个分布式追踪平台，由Uber Technologies于2016年发布为开源项目，并捐赠给Cloud Native Computing Foundation（CNCF），目前已成为CNCF的毕业项目。

通过Jaeger，您可以：

- 监控和排查分布式工作流
- 识别性能瓶颈
- 查找根本原因
- 分析服务依赖关系

### 了解更多

如果您是分布式追踪的新手，建议参考以下外部资源：

- 《Mastering Distributed Tracing (2019)》：由Jaeger的创始人Yuri Shkuro编写，书中深入讲解了Jaeger的设计和操作方面的内容，以及分布式追踪的基本概念。

- 《Take Jaeger for a HotROD ride》：这是一个分步教程，展示了如何使用Jaeger来解决应用程序性能问题。

- 《Introducing Jaeger》：一场介绍Jaeger及其功能的（较老）网络研讨会。

- 《Evolving Distributed Tracing at Uber》：这篇博客文章讲解了Jaeger的历史及其架构选择背后的原因。

### Jaeger v2

(2024-11-12) Jaeger作为领先的开源分布式追踪平台，已经有9年的成功历史，并且与OpenTracing和OpenTelemetry等行业标准化工作紧密对接。

Jaeger是Cloud Native Computing Foundation（CNCF）首批毕业的项目之一。

经过超过60个版本的发布，Jaeger迎来了一个重要的里程碑——Jaeger v2的发布。Jaeger v2采用了OpenTelemetry Collector框架作为基础，并在此基础上扩展实现了Jaeger独特的功能。

它带来了显著的改进和变化，使Jaeger更加灵活、可扩展，并与OpenTelemetry项目更好地对接。详细内容请阅读完整的文章。

有关从Jaeger v1迁移到Jaeger v2的详细信息，请参阅迁移指南。

### 特性

- 基于OpenTracing的数据模型

- 兼容OpenTelemetry

- 多个内置存储后端：
  - Cassandra 4+
  - Elasticsearch 7.x, 8.x
  - Badger
  - Kafka（作为中间缓冲）
  - 内存存储

- 通过远程存储API支持自定义后端扩展
- 系统拓扑/服务依赖关系图
- 自适应采样
- 服务性能监控（SPM）
- 数据收集后的处理

欲了解更多详情，请参阅功能页面。


# 截图

Traces View

![Traces](https://www.jaegertracing.io/img/traces-ss.png)

Trace Detail View

![Trace Detail View](https://www.jaegertracing.io/img/trace-detail-ss.png)

Service Performance Monitoring View

![Service Performance Monitoring View](https://www.jaegertracing.io/img/frontend-ui/spm.png)

# 特性

### 高扩展性

Jaeger 后端设计时考虑到没有单点故障，并能根据业务需求进行扩展。

例如，Uber 的 Jaeger 安装通常每天处理数十亿个 span。

### 云原生

Jaeger 后端以容器镜像或原生二进制文件的形式发布，支持多个平台。二进制文件的行为可以通过 YAML 配置文件进行定制。部署到 Kubernetes 集群的过程由 Kubernetes Operator 和 Helm Chart 协助完成。

### OpenTelemetry

Jaeger 后端和 Web UI 从一开始就设计为支持 OpenTracing 标准。

- 通过 span 引用将追踪表示为有向无环图（而不仅仅是树）
- 支持强类型的 span 标签和结构化日志
- Jaeger 可以接收标准的 OpenTelemetry 协议（OTLP）中的追踪数据。然而，内部数据表示和 UI 仍遵循 OpenTracing 规范的模型。

### 多种存储后端

Jaeger 支持越来越多的存储后端：

- 原生支持流行的开源 NoSQL 数据库作为追踪存储后端：Cassandra 4.0+、Elasticsearch 7.x/8.x 和 OpenSearch 1.0+。
- 通过远程存储 API 可扩展支持其他经过 Jaeger 兼容认证的数据库，例如 ClickHouse。
- 支持嵌入式数据库，如 Badger 和简单的内存存储，用于测试环境。
- 社区正在进行一些实验，使用其他数据库，更多内容可参见该问题。

### 采样

为了控制应用程序的开销和存储成本，Jaeger 支持多种形式的采样：基于头部的采样（集中式远程配置，静态或自适应）和基于尾部的采样。有关更多信息，请参阅采样页面。

### 现代 Web UI

Jaeger Web UI 采用 JavaScript 实现，基于 React。v1.0 版本发布了几项性能改进，使 UI 能有效处理大量数据，并显示包含数万个 span 的追踪（例如，我们尝试了一个包含 80,000 个 span 的追踪）。

### 可观测性

所有 Jaeger 后端组件默认会暴露 Prometheus 指标。日志使用结构化日志库 zap 写入 stdout。

### 拓扑图

Jaeger UI 支持两种类型的服务图：系统架构图和深度依赖关系图。

#### 系统架构图

这是一个“经典”的服务依赖关系图，显示架构中所有服务的依赖关系。该图仅表示服务之间的一跳依赖，类似于从服务网格产生的遥测数据。例如，图中的 A - B - C 意味着存在一些追踪记录了 A 和 B 之间的网络调用，还有一些追踪记录了 B 和 C 之间的调用。然而，这并不意味着存在从 A 到 C 的完整链条，即不能说 A 依赖于 C。

此图的节点粒度仅为服务，而非服务端点。

系统架构图可以通过内存存储实时构建，或者在使用分布式存储时，通过 Spark 或 Flink 任务构建。

#### 深度依赖关系图

也称为“传递依赖图”，其中 A -> B -> C 意味着 A 对 C 存在传递依赖。单个图需要一个“焦点”服务（以粉色显示），并且仅显示通过该服务的路径。通常，这种类型的图不表示系统的完整架构，除非存在一个与所有服务连接的服务（例如 API 网关），并将其选为焦点服务。

此图的节点粒度可以在服务和服务端点之间切换。在后者模式下，同一服务中的不同端点将作为单独的节点显示，例如 A::op1 和 A::op2。

目前，传递依赖图只能通过追踪搜索结果构建。未来将会有一个 Flink 任务，通过汇总所有追踪来计算这些图。

### 服务性能监控（SPM）

SPM 允许通过计算追踪的汇总指标，并将其可视化为时间序列图表，来监控和调查服务性能的趋势。

它是一个强大的工具，可以帮助识别和调查性能问题。

有关更多详细信息，请参阅服务性能监控（SPM）页面。

### Zipkin 兼容性

虽然我们推荐使用 OpenTelemetry 对应用程序进行编码，但如果您的组织已经使用 Zipkin 库进行仪器化，您不必重写所有代码。

Jaeger 提供与 Zipkin 的向后兼容性，可以通过 HTTP 接收 Zipkin 格式的 span（Thrift、JSON v1/v2 和 Protobuf）。

从 Zipkin 后端切换到 Jaeger 后端，只需将流量从 Zipkin 库路由到 Jaeger 后端即可。




# 参考资料

https://www.jaegertracing.io/docs/2.1/



* any list
{:toc}
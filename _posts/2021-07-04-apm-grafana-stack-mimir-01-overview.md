---
layout: post
title: grafana stack mimir-01-provides a scalable long-term storage for Prometheus.
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, grafana]
published: true
---


# Grafana Mimir 

Grafana Mimir 是一个开源软件项目，为 Prometheus 提供可扩展的长期存储。Grafana Mimir 的一些核心优势包括：

易于安装和维护：Grafana Mimir 提供了详细的文档、教程和部署工具，使得快速入门变得轻而易举。

通过其单体模式，您只需一个二进制文件和无需额外的依赖即可运行 Grafana Mimir。

一旦部署完成，Grafana Mimir 提供的最佳实践仪表盘、警报和运行手册使得监控系统的健康状态变得轻松。

巨大的可扩展性：您可以在多台机器上运行 Grafana Mimir 的水平可扩展架构，从而能够处理比单个 Prometheus 实例多得多的时间序列。

内部测试显示 Grafana Mimir 能够处理高达 10 亿个活跃时间序列。

全局视图的度量：Grafana Mimir 允许您运行查询，汇总来自多个 Prometheus 实例的系列，为您提供系统的全局视图。其查询引擎广泛并行执行查询，即使是最高基数的查询也能以极快的速度完成。

廉价、耐久的度量存储：Grafana Mimir 使用对象存储进行长期数据存储，利用这种无处不在、经济实惠、高耐久性的技术。

它与多种对象存储实现兼容，包括 AWS S3、Google Cloud Storage、Azure Blob Storage、OpenStack Swift，以及任何兼容 S3 的对象存储。

高可用性：Grafana Mimir 复制传入的度量，确保在机器故障时不会丢失数据。其水平可扩展的架构还意味着它可以在零停机的情况下重新启动、升级或降级，这意味着度量摄取或查询不会中断。

本地多租户支持：Grafana Mimir 的多租户架构使您能够从独立的团队或业务单元中隔离数据和查询，使这些组能够共享同一集群。先进的限制和服务质量控制确保容量在租户之间公平共享。

# chat

## Grafana Mimir 的核心优势是什么？为什么不直接使用 Prometheus ?

Grafana Mimir 的核心优势主要体现在以下几个方面，使其成为一个有吸引力的选择，尤其是在长期存储和大规模环境中：

### 1. **可扩展的长期存储：**
   - **Mimir：** 提供可扩展的长期存储，使用对象存储（如 AWS S3、Google Cloud Storage、Azure Blob Storage）作为后端，能够处理大规模的时间序列数据。
   - **Prometheus：** Prometheus 的存储默认为短期内存存储，适用于实时监控，但对于长期存储和处理大量历史数据，可能不如 Mimir 灵活和高效。

### 2. **全局视图的度量：**
   - **Mimir：** 允许汇总来自多个 Prometheus 实例的系列，提供全局视图。查询引擎并行执行查询，实现高效的全局度量聚合。
   - **Prometheus：** 通常局限于单个实例的视图，需要通过其他手段来实现多个 Prometheus 实例的集成。

### 3. **使用对象存储降低成本：**
   - **Mimir：** 利用对象存储技术，实现成本效益高、耐久性强的长期数据存储。与多种对象存储兼容，灵活适应各种云平台。
   - **Prometheus：** 长期存储通常需要依赖于远程存储适配器，而这些适配器的性能和成本可能会有一些限制。

### 4. **高可用性和水平扩展性：**
   - **Mimir：** 复制传入的度量，保障在机器故障时不会丢失数据。水平可扩展的架构支持零停机的重新启动、升级或降级。
   - **Prometheus：** 需要通过联邦方式或其他手段实现高可用性和水平扩展性，相对而言可能更加复杂。

### 5. **多租户支持：**
   - **Mimir：** 支持多租户架构，使不同团队或业务单元能够隔离数据和查询，共享同一集群。
   - **Prometheus：** 在原生状态下对多租户支持相对有限，需要额外的配置和实践。

### 为什么不直接使用 Prometheus？

尽管 Prometheus 是一个强大的实时监控系统，但在某些场景下，使用 Grafana Mimir 可能更为合适：

- **长期存储需求：** 当需要长期存储大量历史数据时，Grafana Mimir 提供了更为灵活和成本效益高的方案。

- **大规模环境：** 对于需要处理大量时间序列的大规模环境，Mimir 的水平可扩展性和全局视图能够更好地满足需求。

- **全面的监控解决方案：** Grafana Mimir 与 Grafana、Prometheus 和 Loki 等工具深度集成，提供了全面的监控解决方案，适用于集成分析。

总的来说，选择使用 Grafana Mimir 还是直接使用 Prometheus 取决于具体的需求，特别是在长期存储、大规模环境和全面监控集成等方面的需求。

## 为什么感觉 Grafana 和 Prometheus 生态定位冲突这么大，二者使竞争关系吗？

虽然 Grafana 和 Prometheus 在监控领域都扮演重要的角色，但它们实际上并不是竞争关系，而是可以协同工作的互补关系。

以下是一些解释为何有时可能会感觉它们的生态存在一些定位上的冲突：

### 1. **监控生态系统中的不同角色：**
   - **Prometheus：** 是一个独立的开源监控系统，专注于实时监控和告警。Prometheus 收集、存储和查询时间序列数据，具有自己的查询语言 PromQL。
   - **Grafana：** 是一个开源的数据可视化和监控平台，它提供了丰富的图表、仪表盘和警报功能，可以与多个数据源集成，其中包括 Prometheus。

### 2. **互补关系：**
   - **Prometheus 和 Grafana 协同工作：** Prometheus 提供了时间序列数据的实时监控和告警，而 Grafana 则提供了强大的数据可视化和灵活的仪表盘配置。Grafana 可以通过 Prometheus 数据源连接到 Prometheus 实例，从而创建丰富的监控仪表盘。

### 3. **生态系统整合：**
   - **Grafana 生态系统整合多个数据源：** Grafana 的强大之处在于它可以整合多个数据源，不仅仅限于 Prometheus。Grafana 还支持与 InfluxDB、Elasticsearch、Loki、Microsoft SQL Server 等多种数据源的集成，使其成为一个通用的监控和可视化平台。

### 4. **角色的不同侧重点：**
   - **Prometheus 侧重实时监控和告警：** Prometheus 的设计目标是实时监控和告警，特别适用于云原生环境和微服务架构。
   - **Grafana 侧重数据可视化和灵活性：** Grafana 更侧重于提供数据可视化和灵活的仪表盘配置，使用户能够根据需求自定义展示数据的方式。

### 5. **用户使用场景的不同：**
   - **Prometheus 用户更关注实时监控：** Prometheus 的用户更注重实时性和即时的监控数据，强调在实时动态环境下的快速响应。
   - **Grafana 用户更关注可视化和综合分析：** Grafana 的用户可能更关注数据的可视化、历史趋势和跨数据源的集成分析，强调对多个数据源的整合。

因此，尽管 Prometheus 和 Grafana 在某些方面有一些功能上的重叠，但它们的核心定位和侧重点不同，使得它们更适合在监控生态系统中互为补充，而非竞争。

用户可以根据具体的需求，选择结合使用这两个工具，以构建更全面、灵活的监控解决方案。



# 参考资料

chat

https://github.com/grafana/mimir


* any list
{:toc}
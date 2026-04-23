---
layout: post 
title: Shannon — Keygraph 出品的 AI 渗透测试工具
date: 2026-04-23 21:01:55 +0800
categories: [Ai]
tags: [safe, ai]
published: true
---

# open-metadata

## 什么是 OpenMetadata？

[OpenMetadata](https://open-metadata.org/) 是一个统一的元数据平台，用于数据发现（Data Discovery）、数据可观测性（Data Observability）以及数据治理（Data Governance）。

它由一个中央元数据仓库、深入到列级别的数据血缘分析以及无缝的团队协作能力驱动。

它是增长最快的开源项目之一，拥有活跃的社区，并被来自各行各业的众多公司采用。

基于开放元数据标准和 API，并支持广泛的数据服务连接器，OpenMetadata 提供端到端的元数据管理能力，让你能够充分释放数据资产的价值。

<div align="center">
    <img src="https://github.com/open-metadata/OpenMetadata/assets/40225091/ebfb4ec5-f0a2-4d58-8ce5-a082b5cf0f76" width=800>
</div>

<br />

目录：

* [功能特性](#key-features-of-openmetadata)
* [体验 Sandbox](#try-our-sandbox)
* [安装与运行](#install-and-run-openmetadata)
* [路线图](https://docs.open-metadata.org/latest/roadmap)
* [文档与支持](#documentation-and-support)
* [贡献者](#contributors)

OpenMetadata 由四个核心组件组成：

* **元数据 Schema（Metadata Schemas）**：基于通用抽象和类型定义的元数据核心模型与词汇体系，同时支持自定义扩展和属性，以适配不同业务场景和领域。
* **元数据存储（Metadata Store）**：用于存储和管理元数据图的中央仓库，将数据资产、用户以及各类工具生成的元数据统一连接起来。
* **元数据 API（Metadata APIs）**：构建在元数据 Schema 之上的接口层，用于元数据的生产与消费，支持 UI、工具、系统与服务的无缝集成。
* **采集框架（Ingestion Framework）**：一个可插拔的元数据采集框架，用于从各类数据源和工具中导入元数据。当前支持 84+ 连接器，覆盖数据仓库、数据库、可视化工具、消息系统、数据流水线等。

## OpenMetadata 核心功能

**数据发现（Data Discovery）**：
在一个统一入口中查找和探索所有数据资产，支持关键词搜索、数据关联分析和高级查询。可跨表、Topic、仪表盘、数据流水线和服务进行检索。

---

**数据协作（Data Collaboration）**：
支持用户和团队围绕数据资产进行沟通与协作。包括事件通知、告警、公告、任务创建以及对话线程等能力。

---

**数据质量与分析（Data Quality & Profiler）**：
通过**零代码（no-code）**方式构建数据质量体系，提升数据可信度。支持定义并执行数据质量测试、测试套件管理，并通过交互式仪表盘查看结果。同时通过协作机制，让数据质量成为组织的共同责任。

---

**数据治理（Data Governance）**：
在组织范围内统一执行数据策略与标准。支持定义数据域（Domain）和数据产品（Data Product），分配负责人和干系人，并通过标签和术语对数据资产进行分类。同时支持自动化数据分类。

---

**数据洞察与 KPI（Data Insights & KPIs）**：
通过报表与平台分析能力，全面了解组织的数据状况。Data Insights 提供统一视图展示关键指标。支持定义 KPI 并设定目标（如文档完善度、数据归属、分层等），并可基于 KPI 设置定时告警。

---

**数据血缘（Data Lineage）**：
端到端追踪和可视化数据的来源与变换过程。支持列级血缘分析、查询过滤以及通过无代码编辑器手动编辑血缘关系。

---

**数据文档（Data Documentation）**：
支持使用富文本、图片和链接对数据资产和元数据实体进行文档化，同时支持评论、注释，以及自动生成数据字典和数据目录。

---

**数据可观测性（Data Observability）**：
监控数据资产和数据流水线的健康状态与性能。支持查看数据新鲜度、数据量、数据质量、延迟等指标，并对异常或失败设置告警。

---

**数据安全（Data Security）**：
通过多种认证与授权机制保障数据与元数据安全。支持集成身份提供商实现单点登录（SSO），并通过角色与策略进行访问控制。

---

**Webhooks**：
通过 Webhook 与外部系统集成。支持注册 URL 接收元数据事件通知，并可集成 Slack、Microsoft Teams、Google Chat 等。

---

**连接器（Connectors）**：
通过连接器从多种数据源和工具中采集元数据。目前支持 84+ 种连接器，覆盖数据仓库、数据库、可视化工具、消息系统、数据流水线等。

---

## 体验 Sandbox

访问示例数据并体验功能：
[http://sandbox.open-metadata.org](http://sandbox.open-metadata.org)

---

## 安装与运行 OpenMetadata

几分钟即可快速启动。请参考官方文档获取[安装指南](https://docs.open-metadata.org/quick-start/local-docker-deployment)。

---

## 文档与支持

我们致力于帮助你更好地使用 OpenMetadata！
请查看 [官方文档](https://docs.open-metadata.org/) 获取完整功能说明。

也可以加入我们的 [Slack 社区](https://slack.open-metadata.org/) 进行交流、获取支持或讨论新功能需求。

---

## 贡献者

我们 ❤️ 所有贡献，无论大小！
请查看 [CONTRIBUTING](./CONTRIBUTING.md) 指南开始贡献，并告诉我们如何帮助你。

不想错过更新？给项目点个 ⭐ 🚀

**衷心感谢所有支持者！**

<a href="https://github.com/open-metadata/OpenMetadata/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=open-metadata/OpenMetadata&max=4000&columns=30" />
</a>

---

## Stargazers

[![Stargazers of @open-metadata/OpenMetadata repo](http://reporoster.com/stars/open-metadata/OpenMetadata)](https://github.com/open-metadata/OpenMetadata/stargazers)

---

## 许可证

OpenMetadata 基于 [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0) 开源发布。


# 参考资料

* any list
{:toc}
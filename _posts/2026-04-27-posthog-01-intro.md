---
layout: post 
title: PostHog 是一个用于构建成功产品的一体化开源平台
date: 2026-04-27 21:01:55 +0800
categories: [Ai]
tags: [claude, ai]
published: true
---

# PostHog

## PostHog 是一个用于构建成功产品的一体化开源平台

[PostHog](https://posthog.com/) 提供构建成功产品所需的全部工具，包括：

* **产品分析（Product Analytics）**：通过自动采集或手动埋点的事件分析用户行为，并使用可视化或 SQL 进行数据分析
* **网站分析（Web Analytics）**：通过类似 Google Analytics 的仪表盘监控网站流量与用户会话，分析转化率、Web 指标和收入
* **会话回放（Session Replays）**：回放真实用户在网站或移动应用中的操作，用于问题诊断与行为分析
* **功能开关（Feature Flags）**：将新功能安全地灰度发布给特定用户或用户群体
* **实验（Experiments）**：对改动进行测试，并衡量其对目标指标的统计影响，支持无代码配置
* **错误追踪（Error Tracking）**：跟踪错误、接收告警并修复问题，提升产品质量
* **问卷（Surveys）**：使用无代码模板快速创建问卷，或通过构建器自定义调查
* **数据仓库（Data warehouse）**：从 Stripe、HubSpot、数据仓库等外部工具同步数据，并与产品数据统一查询
* **数据管道（Data pipelines）**：对数据进行过滤与转换，并实时或批量发送到 25+ 工具或任意 webhook
* **LLM 分析（LLM analytics）**：采集 LLM 应用的 trace、生成结果、延迟与成本
* **工作流（Workflows）**：创建自动化流程或向用户发送消息

最重要的是，这些功能均提供**免费使用额度**（每个产品都有慷慨的月度免费层）。你可以通过注册：

* PostHog Cloud US
* PostHog Cloud EU

快速开始使用。

---

## 目录（Table of Contents）

* PostHog 概述
* 快速开始
* 配置 PostHog
* 深入学习
* 贡献
* 开源与付费
* 招聘

---

## 快速开始（Getting started with PostHog）

### PostHog Cloud（推荐）

最快且最稳定的方式是直接注册 PostHog Cloud。

免费额度包括：

* 每月 100 万事件
* 5000 条录制（session recordings）
* 100 万次 feature flag 请求
* 10 万条异常（exceptions）
* 1500 条问卷回复

超出部分按使用量付费。

---

### 自托管（高级）

如果你希望自行部署，可以使用 Docker 一行命令启动（建议 4GB 内存）：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/posthog/posthog/HEAD/bin/deploy-hobby)"
```

开源部署通常支持约 **10 万事件/月**，超过该规模建议迁移到 PostHog Cloud。

注意：

* 官方**不提供自托管支持或 SLA 保证**
* 参考：

  * self-host 文档
  * 故障排查指南
  * 免责声明

---

## 配置 PostHog（Setting up PostHog）

启动实例后，可通过以下方式接入：

* JavaScript Web Snippet
* 官方 SDK
* API 接入

支持的技术栈包括：

### 前端

* JavaScript
* Next.js
* React
* Vue

### 移动端

* React Native
* Android
* iOS
* Flutter

### 后端

* Python
* Node
* PHP
* Ruby

此外还支持：

* Go
* .NET / C#
* Django
* Angular
* WordPress
* Webflow

---

安装后，可以进一步配置：

* 产品分析（事件采集）
* 网站分析
* 会话回放
* Feature Flags
* 实验（A/B Testing）
* 错误追踪
* 问卷系统
* 数据仓库

---

## 深入了解 PostHog（Learning more）

PostHog 不仅开源代码，还开源：

* 公司手册（handbook）
* 战略
* 工作方式
* 组织结构

此外提供实践指南：

* 如何提升激活（activation）
* 如何跟踪留存（retention）
* 如何衡量收入（revenue）

---

## 贡献（Contributing）

欢迎各种规模的贡献：

* 在 roadmap 上投票或参与 beta
* 提交 PR（参考本地开发指南）
* 提交功能请求或 Bug 报告

代码结构参考：

* monorepo layout
* products 目录

---

## 开源 vs 付费（Open-source vs. paid）

* 本仓库采用 MIT expat 许可证
* `ee` 目录为独立许可证（企业功能）

如果需要 **100% 纯 FOSS**：

* 可使用 `posthog-foss` 仓库（已移除所有专有代码）

定价完全透明，详见官网 pricing 页面。

---

## 招聘（We’re hiring!）

如果你认真读到了这里，说明你是一个高质量 README 用户 👀

我们正在快速扩张团队，欢迎加入：

👉 [https://posthog.com/careers](https://posthog.com/careers)

# 参考资料

* any list
{:toc}
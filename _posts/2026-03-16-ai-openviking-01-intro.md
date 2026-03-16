---
layout: post
title: 
date: 2026-03-16 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# OpenViking

**OpenViking 是一个专为 AI 智能体设计的开源上下文数据库（Context Database）。**

它通过 **文件系统范式（filesystem paradigm）**，统一管理智能体所需的 **记忆（memory）、资源（resources）和技能（skills）**，从而实现 **层次化上下文传递与自我进化能力**。 ([agentskill.work][1])

---

# 项目概述

OpenViking 提供一种新的方式来组织 AI Agent 的上下文。

传统系统通常仅依赖 **向量数据库（vector database）** 来存储和检索上下文，而 OpenViking 采用类似 **文件系统目录结构** 的方式管理上下文数据。 ([Jimmy Song][2])

通过这种方式，可以：

* 将上下文按 **目录 / 文件结构**组织
* 进行 **层次化检索**
* 提供 **可观察的检索路径**
* 减少 LLM token 消耗

---

# 核心理念

OpenViking 将 AI Agent 所需的一切上下文统一抽象为：

```
Context
├── Memory
├── Resources
└── Skills
```

并以 **类似文件系统的结构进行组织**。

例如：

```
viking://
├── memory/
│   ├── user/
│   └── session/
├── resources/
│   ├── documents/
│   └── knowledge/
└── skills/
    ├── tools/
    └── workflows/
```

这种结构使得 Agent 可以：

* 根据目录位置进行上下文定位
* 结合语义检索进行精准检索

---

# 关键特性

## 1. 文件系统式上下文组织

OpenViking 使用 **目录与文件** 的方式组织上下文：

* 支持递归目录检索
* 支持目录定位
* 支持结构化知识组织

这种方式比单纯的向量检索更加可控。 ([Jimmy Song][3])

---

## 2. 分层上下文加载（Tiered Context Loading）

上下文分为三个层级：

| 层级 | 含义        |
| -- | --------- |
| L0 | 抽象层（简短摘要） |
| L1 | 概览层       |
| L2 | 详细内容      |

Agent 在推理时：

1. 先加载 **L0**
2. 再按需加载 **L1**
3. 必要时加载 **L2**

这样可以显著 **减少 token 消耗**。 ([Jimmy Song][3])

---

## 3. 可视化检索路径

OpenViking 会记录：

* 检索路径
* 检索决策过程
* 检索结果来源

这样可以实现：

* 调试 RAG
* 分析 Agent 行为
* 优化检索策略

---

## 4. 统一上下文管理

OpenViking 将 Agent 需要的所有内容统一管理：

* Memory（记忆）
* Knowledge（知识）
* Resources（资源）
* Skills（技能）

从而避免：

* 上下文碎片化
* 多系统耦合

---

# 使用场景

OpenViking 适用于以下 AI Agent 系统：

### 1. 长生命周期 Agent

例如：

* 自动化任务 Agent
* 编程 Agent
* 研究 Agent

需要长期记忆管理。

---

### 2. 高级 RAG 系统

结合：

* 目录结构定位
* 向量语义搜索

从而提高检索精度。

---

### 3. 上下文工程（Context Engineering）

适用于：

* 构建 Agent 知识体系
* 管理工具与技能
* 管理上下文数据结构

---

# 技术架构

OpenViking 采用模块化架构：

主要模块包括：

```
OpenViking
├── Storage Layer
│   └── 上下文存储
├── Retrieval Layer
│   └── 检索引擎
├── Session Layer
│   └── 会话管理
├── Parser Layer
│   └── 内容解析
```

并支持：

* 多模型 embedding
* 多模型推理
* 本地或云部署

---

# 支持的模型后端

OpenViking 可以与多个模型服务配合使用，例如：

* OpenAI
* Volcengine
* 自定义模型

用于：

* Embedding
* VLM
* 推理

---

# 技术背景

OpenViking 来自字节跳动 **Viking 系列产品线**。

该团队此前推出：

* **VikingDB**（向量数据库）
* **Viking KnowledgeBase**
* **Viking MemoryBase**

这些产品主要用于 **大规模非结构化数据检索与 AI 应用**。 ([PyPI][4])

---

# 项目特点

* 开源
* 面向 AI Agent
* 文件系统式上下文管理
* 层级上下文加载
* 可观测检索
* Agent 自进化能力

---

# 开源协议

Apache 2.0 License


# 参考资料

* any list
{:toc}
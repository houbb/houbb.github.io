---
layout: post 
title:  ChatDev：用于软件开发的通信型智能体
date: 2026-04-01 21:01:55 +0800
categories: [AI]
tags: [ai, LLM]
published: true
---


# 📖 ChatDev：用于软件开发的通信型智能体

## 📌 概述（Overview）

ChatDev 是一个“虚拟软件公司”，由多个具备不同角色的智能体组成，例如：

* CEO（首席执行官）
* CPO（产品负责人）
* CTO（技术负责人）
* 程序员
* 代码审查员
* 测试工程师
* UI / 美术设计师

这些智能体构成一个**多智能体组织结构**，共同目标是：

> “通过编程革新数字世界”

它们通过参与各种“功能性研讨会”协作完成任务，例如：

* 需求设计
* 编码实现
* 测试验证
* 文档编写

---

## 🎯 核心目标

ChatDev 的目标是提供一个：

* ✅ 易于使用（easy-to-use）
* ✅ 高度可定制（customizable）
* ✅ 可扩展（extendable）

的框架，该框架：

* 基于大语言模型（LLMs）
* 用于研究和理解“群体智能（collective intelligence）”

---

## 🧠 能力本质（你需要重点理解）

ChatDev 本质上是：

> 一个「多 Agent 协作的软件工程系统」

关键机制：

* 使用自然语言作为统一通信协议
* 通过多轮对话推进任务
* 模拟真实软件开发流程（类似瀑布模型）

👉 核心思想：

* “语言即接口”
* “对话即流程编排”

---

## 🚀 最新进展（News）

### 2025

* 提出 **Puppeteer-style 多 Agent 编排机制**

  * 引入“中央调度器（orchestrator）”
  * 使用强化学习动态调度 Agent
  * 优化：

    * 推理质量
    * 计算成本

---

### 2024

* 发布 **MacNet（多智能体协作网络）**

  * 使用 DAG（有向无环图）组织 Agent
  * 支持：

    * 超大规模 Agent（>1000）
    * 更复杂拓扑结构
  * 不再局限于链式流程（比传统 ChatDev 更强）

---

### 2023

* 发布 ChatDev 初始版本
* 支持：

  * Git 模式
  * Human-Agent 交互模式
  * Art 模式（生成 UI/图片）
  * 增量开发（基于已有代码继续开发）

---

## ❓ ChatDev 能做什么？

（原文是视频 demo，这里解释其能力）

可以自动完成：

* 从 idea → 完整软件
* 包含：

  * 需求分析
  * 设计
  * 编码
  * 测试
  * 文档

👉 本质是：

> “一句自然语言 → 一套软件产出”

---

## ⚡ 快速开始（Quickstart）

### 方式一：Web

访问在线平台：

```
https://chatdev.modelbest.cn/
```

---

### 方式二：本地运行

#### 1️⃣ 克隆仓库

```bash
git clone https://github.com/OpenBMB/ChatDev.git
```

#### 2️⃣ 创建 Python 环境

```bash
conda create -n ChatDev_conda_env python=3.9 -y
conda activate ChatDev_conda_env
```

#### 3️⃣ 安装依赖

```bash
cd ChatDev
pip3 install -r requirements.txt
```

#### 4️⃣ 设置 OpenAI API Key

（通过环境变量配置）

---

## ⚙️ 高级能力（Advanced Skills）

官方 Wiki 提供：

### 1️⃣ 运行参数说明

* 所有 CLI 参数解释

---

### 2️⃣ 可视化工具

支持：

* 实时日志
* 回放日志
* ChatChain 可视化

---

### 3️⃣ 核心框架结构

#### ChatChain（核心）

定义流程，例如：

```
需求分析 → 编码 → 测试 → 人工确认
```

👉 本质：流程编排 DSL

---

### 4️⃣ Phase（阶段）

可以自定义阶段：

例如：

* DemandAnalysis（需求分析）
* Coding（编码）
* Testing（测试）

---

### 5️⃣ Role（角色）

可以自定义公司角色：

例如：

* CEO
* CTO
* Programmer

👉 本质：Agent Persona 定义

---

## 🏗️ 产出结构（非常重要）

当你执行：

```bash
python3 run.py --task "design a 2048 game"
```

会生成：

```
/WareHouse/2048_xxx/
```

里面包含：

### 1️⃣ 软件代码 + 文档

### 2️⃣ 公司配置（3个 JSON）

### 3️⃣ 完整执行日志

* 可回放（Replay）

### 4️⃣ 初始 Prompt

👉 这是你做 AI 工程化最关键的资产

---

## 🏢 “公司配置”机制（核心设计）

你可以创建自己的“AI公司”：

只需 3 个 JSON：

* 角色配置
* 流程配置
* 阶段配置

👉 这其实就是：

> “AI Agent Workflow Engine”

---

## 📚 论文引用（Citation）

项目基于多个论文：

* ChatDev（2023）
* Experiential Co-Learning
* MacNet
* 多 Agent 协作网络

---

## ⚖️ 许可证（License）

### 代码

* Apache 2.0（可商用）

### 数据

* CC BY-NC 4.0（仅限非商业）

⚠️ 注意：

* 用数据训练的模型也必须非商业

---

# 🧠 我帮你总结一下（重点提炼）

如果你是架构师（你确实是），这个项目真正的价值不是“写代码”，而是：

## 1️⃣ 多 Agent 软件工程范式

* 人类 → AI团队
* 单模型 → 多角色协作

---

## 2️⃣ ChatChain = 编排引擎

类似：

* Airflow（但用自然语言）
* Temporal（但由 LLM 驱动）

---

## 3️⃣ CompanyConfig = Agent OS

你可以构建：

* 自动化测试公司
* 运维分析公司
* 推荐系统公司

👉 这点和你正在做的 **AI根因分析系统**高度契合

---

## 4️⃣ 可扩展到非软件领域

ChatDev 2.0 已支持：

* 数据分析
* 视频生成
* 研究总结
* 游戏开发 ([DeepWiki][1])

# 参考资料

* any list
{:toc}
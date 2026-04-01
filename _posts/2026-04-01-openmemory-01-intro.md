---
layout: post 
title: OpenMemory 为 AI 系统提供**长期记忆能力**。不是向量搜索，不是 RAG，而是“真正的记忆系统”。
date: 2026-04-01 21:01:55 +0800
categories: [AI]
tags: [ai, LLM]
published: true
---

# OpenMemory

为 AI 系统提供**长期记忆能力**。不是向量搜索，不是 RAG，而是“真正的记忆系统”。 ([GitHub][1])

👉 自托管 / 本地优先 / 可解释 / 可扩展
👉 可以用“一行代码”为 Agent 增加记忆能力 ([GitHub][1])

---

# 核心定位（Introduction）

现代 LLM 存在的问题：

* 会话之间**完全遗忘**
* 向量数据库只是“平面 chunk”，缺乏：

  * 时间维度
  * 重要性
  * 关系结构
* 云 memory API：

  * 成本高
  * Vendor lock-in

---

## OpenMemory 提供的能力

* 持久记忆（persistent memory）
* 多层认知结构（multi-sector cognitive structure）
* 自然遗忘（decay）
* 基于图的召回（graph-based recall）
* 时间感知（time-aware）
* 可解释性（waypoint trace）
* 完全数据控制权（local-first）
* MCP 协议集成 ([GitHub][1])

👉 本质定位：
**AI 的 Memory OS（记忆操作系统）**

---

# 🚀 对比传统方案

传统方案（LangChain + Pinecone）：

* 复杂（10+ 行）
* 依赖云
* 初始化慢

OpenMemory：

```python
from openmemory import OpenMemory

om = OpenMemory(...)
om.add("User allergic to peanuts")
om.query("allergies")
```

👉 仅 3 行代码
👉 本地 SQLite
👉 无云依赖 ([GitHub][1])

---

# ⚡ Standalone 模式

无需后端：

* 直接运行在 Node.js / Python 中
* 本地 SQLite 存储
* 数据不离开本机 ([GitHub][1])

---

# 🧠 核心设计：认知记忆模型

OpenMemory 不是“向量库”，而是**类人脑结构**

## 五大记忆类型（Multi-sector）

1. Episodic（情景记忆）→ 事件
2. Semantic（语义记忆）→ 知识
3. Procedural（程序记忆）→ 技能
4. Emotional（情绪记忆）→ 情感
5. Reflective（反思记忆）→ 元认知 ([GitHub][1])

👉 这是它和 RAG 最大的本质区别

---

# 🧩 架构核心（Architecture）

## 数据流

1. 输入分类（按 memory sector）
2. 生成 embedding（按 sector）
3. 分 sector 检索
4. graph 扩展（waypoint）
5. 综合评分：

```
similarity + salience + recency + weight
```

6. 时间图修正（temporal graph）
7. 输出 + 可解释路径 ([GitHub][1])

---

## 核心引擎组件

* Vector Search（向量召回）
* Waypoint Graph（关系图）
* Decay Engine（遗忘机制）
* Composite Scoring（综合评分）

👉 和传统 RAG 最大差异：

**不是“相似度检索”，而是“认知计算”**

---

# ⏳ 时间维度（Temporal Knowledge Graph）

传统 memory 系统：
❌ 忽略时间

OpenMemory：

* `valid_from / valid_to`
* 自动更新事实（新事实覆盖旧事实）
* 时间点查询（point-in-time）
* 时间线重建 ([GitHub][1])

👉 举例：

CEO 变化会自动更新历史，而不是覆盖

---

# 🧠 记忆动态机制

## 1️⃣ Decay（遗忘）

* 随时间衰减
* 不重要的信息自动消失

## 2️⃣ Reinforcement（强化）

* 高频 / 重要记忆被强化

👉 模型类似：

```
Memory Strength = Recency + Frequency + Importance
```

---

# 🔗 MCP 集成

OpenMemory 内置 MCP server：

可直接接入：

* Claude Desktop
* Cursor
* Windsurf
* 等 AI IDE ([GitHub][1])

提供工具：

* `openmemory_query`
* `openmemory_store`
* `openmemory_list`
* `openmemory_reinforce`

---

# 📦 使用方式

## 1️⃣ JS SDK

```bash
npm install openmemory-js
```

```js
import { OpenMemory } from "openmemory-js"
const mem = new OpenMemory()
```

---

## 2️⃣ Python SDK

```bash
pip install openmemory-py
```

```python
from openmemory import Memory
mem = Memory()
```

---

## 3️⃣ Backend Server

适用于：

* 多用户系统
* SaaS / Dashboard
* 企业级 memory

```bash
docker compose up --build -d
```

---

# 🧪 性能（官方测试）

* 115ms 查询延迟（10万节点）
* 338 QPS
* Recall@5 = 95% ([GitHub][1])

---

# 🔐 安全

* AES-GCM 加密
* 用户隔离
* 默认无 telemetry ([GitHub][1])

---

# 🧰 CLI 工具

```bash
opm add "user prefers dark mode"
opm query "preferences"
opm list
opm reinforce <id>
```

---

# 📊 Dashboard

支持：

* memory 浏览
* decay 曲线
* graph 可视化
* timeline 分析 ([GitHub][1])

---

# 🧠 本质总结（非常关键）

如果用一句话说：

👉 **OpenMemory ≠ 向量数据库**
👉 **OpenMemory = AI 的“类人脑记忆系统”**

---

# 🔥 和你当前系统的关系（重点）

你现在在做：

> IM + Feed + 推荐 + 用户画像 + AI Agent

👉 OpenMemory 对你来说，本质是：

## 👉 “统一记忆中枢”（Memory Layer）

可以替代：

* 用户画像系统（部分）
* 标签系统（部分）
* RAG memory
* 行为日志的语义层

---

# 🚀 如果你要落地（建议）

你可以这样用：

## 架构映射

```
IM事件流 → Memory Engine（OpenMemory思想）
              ↓
        推荐系统 / Agent / Feed
```

## 可拆能力

1. 用户长期偏好（user memory）
2. 会话上下文（session memory）
3. 项目知识（project memory）
4. 行为沉淀（behavior → memory）


# 参考资料

* any list
{:toc}
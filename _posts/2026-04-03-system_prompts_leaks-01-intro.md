---
layout: post 
title: system_prompts_leaks 是一个公开的系统提示词（System Prompts）收集仓库
date: 2026-04-03 21:01:55 +0800
categories: [AI]
tags: [ai, llm, prompt]
published: true
---

# 📦 system_prompts_leaks（中文翻译）

## 🧠 项目简介

**system_prompts_leaks 是一个公开的系统提示词（System Prompts）收集仓库**，主要整理来自主流 AI 聊天模型的：

* System Prompt（系统提示词）
* System Message（系统消息）
* Developer Message（开发者指令）

涵盖平台包括：

* ChatGPT
* Claude
* Gemini 等主流大模型 ([Titan AI Explore][1])

👉 本质上，这是一个：

> **“AI 行为控制层（System Prompt）的反向观察与归档库”**

---

## 🎯 项目目的

该仓库的目标是：

* 📚 构建一个 **系统提示词知识库**
* 🔍 帮助开发者理解：

  * LLM 是如何被“指挥”的
  * 不同 AI 的行为策略差异
* 🧪 支持研究：

  * Prompt Engineering
  * AI 行为控制机制
  * 模型安全与限制设计 ([DeepWiki][2])

---

## 🧱 仓库内容结构

仓库按照不同 AI 系统进行分类，大致包括：

### 1️⃣ Claude 系列

* claude.txt
* Claude Sonnet / Opus 等版本

👉 特点：

* 工具调用（Tool use）
* 行为规范极其详细
* 强调安全与对齐

---

### 2️⃣ OpenAI / GPT 系列

* GPT-5 personalities
* GPT thinking / reasoning 模式

👉 特点：

* 人格（personality）设计
* 推理策略控制
* 工具使用策略

---

### 3️⃣ 专用功能模块

例如：

* study / 学习模式
* image safety / 图像安全
* file search / 文件检索

👉 本质是：

> **“能力模块级 Prompt”**

---

## 🧩 内容特点

### ✅ 1. 高度还原真实系统 Prompt

这些内容通常来自：

* 泄露（leak）
* 逆向分析
* 实际抓取

👉 可以理解为：

> “AI 的操作系统配置文件”

---

### ✅ 2. 社区驱动

* 通过 Pull Request 提交新内容
* 持续更新
* 无中心化维护

👉 类似：

> prompt 版的 “awesome list + leaks archive”

---

### ✅ 3. 只收集，不做解释

仓库本身：

* ❌ 不提供分析
* ❌ 不解释设计原因
* ✅ 只做归档

👉 需要你自己解读

---

## ⚙️ 使用场景

### 👨‍💻 开发者

* 学习如何设计：

  * system prompt
  * AI agent 行为规则

### 🧠 研究人员

* 分析不同模型：

  * 对齐策略
  * 安全机制
  * 输出控制方式

### 🎓 教学

* 用作 Prompt Engineering 教材

---

## ⚠️ 风险与注意事项

### 1️⃣ 法律与合规问题

部分 prompt：

* 可能涉及平台私有配置
* 存在知识产权问题

👉 使用需谨慎 ([Titan AI Explore][1])

---

### 2️⃣ Prompt 泄露本身是安全问题

学术上已经明确：

> System Prompt 是 LLM 的核心资产
> 泄露会导致能力被复制或攻击 ([arXiv][3])

---

### 3️⃣ 数据不一定完整 / 准确

* 有些是片段
* 有些是推测还原

---

## 🧠 一句话总结

> **这是一个“AI 系统提示词的泄露与归档库”，本质是在拆解大模型的“行为控制层”。**

---

# 🔥 架构级解读（重点）

结合你的背景（你在做 AI + 系统架构），这个仓库真正有价值的是：

---

## 1️⃣ System Prompt = “软操作系统”

可以把 LLM 分成三层：

```
模型（权重）
   ↓
System Prompt（行为控制层）
   ↓
User Prompt（输入）
```

👉 system prompt 本质是：

* 行为约束
* 能力开关
* 工具编排规则

---

## 2️⃣ 不同公司本质在做同一件事

你会发现：

| 公司        | 本质      |
| --------- | ------- |
| OpenAI    | 人格 + 工具 |
| Anthropic | 安全 + 规范 |
| Google    | 多模态 +工具 |

👉 差异其实在：

> **system prompt 设计哲学**

---

## 3️⃣ 对你（做 IM + AI 平台）最关键的价值

你可以直接借鉴：

### ✅ AI Agent 设计

* tool calling 规则
* memory 结构
* persona 控制

### ✅ 商业化能力

* 不同用户 → 不同 prompt
* 不同场景 → 不同 agent

👉 本质：

> **prompt = 产品逻辑**

---

## 4️⃣ 更深一层（非常关键）

这个仓库揭示了一个核心事实：

> **大模型的“产品差异”，很大一部分来自 Prompt，而不是模型本身**

---

# 👉 如果你要继续深入（建议）

我可以帮你做这几件更有价值的事：

1️⃣ 拆解 GPT / Claude 的 system prompt 设计模式
2️⃣ 帮你设计一套你 IM 平台的 **Agent Prompt 架构（可商业化）**
3️⃣ 做一套 **Prompt DSL（类似配置语言）**，让你平台可扩展

直接说你想往哪一层深入，我帮你往“可落地架构”继续推。

[1]: https://www.titanaiexplore.com/projects/system_prompts_leaks-976921297?utm_source=chatgpt.com "system_prompts_leaks - JavaScript | Titan AI Explore"
[2]: https://deepwiki.com/asgeirtj/system_prompts_leaks/1-system-prompts-repository-overview?utm_source=chatgpt.com "asgeirtj/system_prompts_leaks | DeepWiki"
[3]: https://arxiv.org/abs/2405.06823?utm_source=chatgpt.com "PLeak: Prompt Leaking Attacks against Large Language Model Applications"


# 参考资料

* any list
{:toc}
---
layout: post
title: Claude Subconscious 将Letta Agent 的记忆系统挂载到 Claude 
date: 2026-03-26 21:01:55 +0800
categories: [AI]
tags: [ai, memory]
published: true
---

# 安装笔记

```
/plugin marketplace add letta-ai/claude-subconscious
/plugin install claude-subconscious@claude-subconscious
```

# 🧠 Claude Subconscious

---

## 🚀 项目简介

如果你使用过 Claude Code，可能会发现一个问题：

* 它会忽略 `CLAUDE.md`
* 无法记住你设置的偏好
* 会忘记会话中的高层目标
* 一旦发生上下文压缩（compaction），之前的信息就丢失 ([Cameron][1])

👉 简单说：**Claude 是“无记忆的”**

---

## 💡 项目动机

作者来自 **Letta（专注于 AI 记忆系统）**，核心想法是：

> 为什么不给 Claude 加一层“长期记忆”？

因此构建了：

> **Claude Subconscious（潜意识层）**

---

## 🧠 Claude Subconscious 是什么

Claude Subconscious 是一个：

> **Claude Code 插件（Plugin）**

其核心作用：

* 将 **Letta Agent 的记忆系统**挂载到 Claude
* 将你和 Claude 的对话同步给一个后台 Agent
* 让 Agent 维护“长期记忆”
* 并在后续会话中影响 Claude 的行为 ([Cameron][1])

---

## 🔁 工作原理（核心机制）

### 1️⃣ 双层结构（显式 + 潜意识）

系统包含两层：

#### 🧍 显意识（Claude 本体）

* 当前上下文
* 当前对话

#### 🧠 潜意识（Letta Agent）

* 长期记忆
* 用户偏好
* 项目上下文
* 历史模式

---

### 2️⃣ 记忆注入机制（关键点）

Claude Subconscious 会：

> **自动将 Agent 的记忆块注入到 `CLAUDE.md` 中**

示例结构：

```markdown
<!-- Letta agent memory is automatically synced below -->

<letta>
  <letta_context>
    Subconscious Layer (Letta Agent)
    ...
  </letta_context>
</letta>
```

👉 本质是：

> **通过“伪系统提示 + 结构化注入”实现长期记忆**

---

### 3️⃣ 会话监听与同步

* 插件监听 Claude 对话
* 将对话发送给 Letta Agent
* Agent：

  * 更新 memory blocks
  * 生成指导信息（guidance）

👉 这些信息会在下一轮对话中影响 Claude

---

### 4️⃣ 潜意识指导机制

Agent 可以通过：

```xml
<letta_message>
```

向 Claude 注入“指导信息”，用于：

* 提供背景知识
* 提供上下文补充
* 做研究或提示方向

👉 注意：

> 不是直接改 Claude 输出，而是**引导**

---

## 🧱 Memory Blocks（记忆块）

Agent 会维护结构化长期记忆，例如：

* 用户偏好
* 项目背景
* 历史决策
* 会话模式

👉 这些内容：

> **跨 session 持久存在**

---

## ⚡ 并发与多会话能力

Claude Subconscious 基于 Letta 的：

> **Conversations API（支持并行）**

能力包括：

* 多个 Claude 会话共享同一个 Agent
* 实时更新 memory
* 支持跨项目记忆共享 ([Cameron][1])

---

## 🧩 使用方式

在 Claude Code 中安装：

```bash
/plugin install github:letta-ai/claude-subconscious
```

---

## 🔐 依赖条件

* 需要 Letta 账户
* 需要 API Key
* 推理可能收费（但有免费模型）

---

## 🧠 行为特性（关键细节）

### 📌 首次消息行为

Claude 会被要求：

> 在新会话中告知用户：

* 当前被 Subconscious 监控
* 提供 Agent 可视化链接

---

### 📌 异步观察机制

Subconscious Agent：

* **异步观察对话**
* 不阻塞 Claude 响应
* 在后台更新记忆

---

### 📌 可交互性

用户可以：

* 主动“对潜意识说话”
* Agent 会在下一次同步中回应

---

## 🏗️ 架构本质（非常关键）

该系统的真实架构是：

```
用户
 ↓
Claude（短期上下文）
 ↓
Claude Subconscious 插件
 ↓
Letta Agent（长期记忆 + 推理）
```

---

## 🎯 核心能力总结

### ✅ 1. 长期记忆（Persistent Memory）

跨 session 保留信息

---

### ✅ 2. 上下文增强（Context Injection）

自动注入记忆到 Prompt

---

### ✅ 3. 行为引导（Guidance Layer）

通过 memory + message 影响 Claude

---

### ✅ 4. 多会话共享（Shared Brain）

多个 session 共用同一 Agent

---

## ⚠️ 本质理解（非常重要）

Claude Subconscious 并不是：

❌ 改 Claude 模型
❌ 扩大上下文窗口

而是：

> ✅ **在 Claude 外面加了一层“长期记忆代理（Memory Agent）”**

---

## 🧠 一句话总结

> Claude Subconscious =
> **Claude + 外挂记忆系统（Letta Agent）+ Prompt 注入机制**

---

## 🔥 工程视角点评（给你这个架构背景的重点）

这个项目的价值非常明确：

### 它解决的问题

* Claude 无法跨会话记忆
* 上下文压缩导致信息丢失
* 无法形成“长期认知”

---

### 它的技术本质

属于：

> **Memory Augmented LLM（记忆增强型 LLM）**

实现方式：

* Prompt Injection（注入）
* External Memory（外部记忆）
* Agent Loop（代理循环）

---

### 类比你现在在做的系统

你可以把它理解为：

| 组件           | 类比                     |
| ------------ | ---------------------- |
| Claude       | 推理引擎                   |
| Letta Agent  | 用户画像 + 知识库             |
| Subconscious | 中间件（Memory Middleware） |

---

## 🚨 延伸（关键思考）

这个设计其实隐含一个重要范式：

> **未来 AI = 模型 + 记忆 + 工具 + 控制层**

而 Claude Subconscious 正在补齐：

👉 **“记忆层”**


# 参考资料

* any list
{:toc}
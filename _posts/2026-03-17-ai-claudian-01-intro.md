---
layout: post
title: Claudian 一个将 Claude Code 嵌入到 Obsidian 中的插件，使其成为你知识库中的 AI 协作助手 
date: 2026-03-17 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# Claudian

一个将 Claude Code 嵌入到 Obsidian 中的插件，使其成为你知识库中的 AI 协作助手。 ([trendshift.io][1])

你的 Obsidian Vault 会成为 Claude 的工作目录，从而赋予它完整的智能体能力：
包括文件读写、搜索、执行 Bash 命令以及多步骤工作流。 ([trendshift.io][1])

---

## 功能特性

### 🔧 完整的智能体能力（Agentic Capabilities）

在 Obsidian 中直接使用 Claude Code 的能力：

* 读取、写入、编辑文件
* 搜索内容
* 执行 Bash 命令
* 支持多步骤任务执行 ([trendshift.io][1])

---

### 🧠 上下文感知（Context-Aware）

自动理解当前工作上下文：

* 自动附加当前聚焦笔记
* 使用 `@` 引用文件
* 可通过标签排除笔记
* 支持选中文本作为上下文
* 可访问外部目录补充上下文 ([trendshift.io][1])

---

### 🖼️ 视觉能力（Vision Support）

支持图像分析：

* 拖拽上传
* 粘贴图片
* 使用文件路径导入

---

### ✏️ 内联编辑（Inline Edit）

* 直接在笔记中编辑选中内容或光标位置插入内容
* 提供逐词级 diff 预览
* 支持只读工具用于上下文分析 ([trendshift.io][1])

---

### 🧾 指令模式（Instruction Mode `#`）

* 在聊天输入中添加自定义系统指令
* 支持在弹窗中查看和编辑

---

### ⚡ Slash Commands（斜杠命令）

* 使用 `/command` 创建可复用提示模板
* 支持参数占位符
* 支持 `@file` 引用文件
* 支持 Bash 内联替换 ([trendshift.io][1])

---

### 🧩 Skills（技能系统）

* 可扩展的能力模块
* 根据上下文自动触发
* 与 Claude Code 的 Skill 格式兼容 ([trendshift.io][1])

---

### 🤖 自定义 Agent（Custom Agents）

* 支持定义子 Agent
* 可设置工具权限限制
* 支持模型覆盖（model override）

---

### 🔌 Claude Code 插件支持

* 自动发现 CLI 安装的插件（`~/.claude/plugins`）
* 支持按 Vault 配置
* 插件能力（Skills / Agents / Commands）无缝集成 ([trendshift.io][1])

---

### 🔗 MCP（Model Context Protocol）支持

* 可连接外部工具和数据源
* 支持多种协议：stdio / SSE / HTTP
* 支持上下文持久化
* 可通过 `@` 触发调用 ([trendshift.io][1])

---

### ⚙️ 高级模型控制（Advanced Model Control）

* 支持选择不同模型：Haiku / Sonnet / Opus
* 支持自定义模型（通过环境变量）
* 可调节“思考预算”（thinking budget）
* 支持 Sonnet 100万上下文窗口（需 Max 订阅） ([trendshift.io][1])

---

## 核心定位（总结）

Claudian 的本质是：

> 将 Obsidian 从“静态笔记工具”升级为“AI 可操作的工作空间”

它不是简单的 AI Chat 插件，而是一个：

* 可执行操作的 AI Agent
* 可参与知识构建的协作系统
* 可扩展（Skills / MCP / Plugins）的平台层能力 ([博客园][2])

---

## 一句话理解

👉 Claudian = Obsidian + Claude Code + Agent 能力 + 本地知识上下文

---

如果你需要，我可以帮你做一版**更偏架构视角的拆解**（比如：它在你 IM + AI Agent 平台里的定位、是否可以复用其设计思想）。

[1]: https://trendshift.io/admin/repository/ask-ai/21115?utm_source=chatgpt.com "Trendshift - Ask AI"
[2]: https://www.cnblogs.com/bugshare/p/19577439?utm_source=chatgpt.com "Obsidian × Claudian × Skills：打造真正会“思考”的个人知识库 - BugShare - 博客园"

# 参考资料

* any list
{:toc}
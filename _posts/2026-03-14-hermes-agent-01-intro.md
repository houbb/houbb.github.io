---
layout: post
title: Hermes Agent —— 一个会随着你成长的智能代理
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, speech, sh]
published: true
---

# Hermes Agent —— 一个会随着你成长的智能代理

在一台机器上安装它，连接你的各种消息账号，它就会变成一个**持续运行的个人 AI Agent**。

它会逐渐学习你的项目、积累自己的技能，并且可以在任何你所在的平台与你沟通。 ([Hermes Agent][1])

支持：

* Linux
* macOS
* WSL2

安装命令：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

无需任何前置依赖，安装脚本会自动完成所有配置。 ([Hermes Agent][1])

---

# 它是什么

Hermes 不是：

* 绑定在 IDE 中的代码 Copilot
* 仅仅包装某个 API 的聊天机器人

它是一个**运行在你服务器上的自主 AI Agent**，
能够记住学习到的内容，并且随着运行时间变得越来越强大。 ([Hermes Agent][2])

---

# 核心能力

## 💬 生活在你所在的平台

Hermes 可以通过一个统一的网关运行在多个平台：

* Telegram
* Discord
* Slack
* WhatsApp
* CLI

例如：

* 在 Telegram 开始对话
* 在终端继续对话

还支持：

* 语音消息转录
* 跨平台对话延续

---

## 🧠 随运行时间不断成长

Hermes 具有**持久化记忆**：

* 记住你的偏好
* 记住你的项目
* 记住你的环境

当它解决一个复杂问题时，它会：

* 自动生成一个 **技能文档（skill document）**
* 以后遇到类似问题自动调用

这些技能可以：

* 搜索
* 共享
* 复用

---

## ⏰ 定时自动化任务

内置 **cron 调度器**，支持自然语言调度：

例如：

* 每日报告
* 夜间备份
* 每周审计
* 早间简报

任务会自动运行，并将结果发送到任意平台。

---

## 🔀 代理分工与并行执行

Hermes 可以：

* 创建多个 **子 Agent**
* 并行处理不同任务

每个子 Agent：

* 有独立对话
* 有独立终端

同时支持：

* Python 脚本调用工具
* RPC 调用工具
* 多步骤流程压缩为单次交互

---

## 🔒 真实的沙箱环境

Hermes 提供 **5 种终端执行后端**：

* Local
* Docker
* SSH
* Singularity
* Modal

并具备安全机制：

* 只读 root 文件系统
* 降权 capability
* PID 限制
* Namespace 隔离

---

## 🌐 Web 与浏览器自动化

Hermes 支持完整 Web 自动化：

能力包括：

* Web 搜索
* 页面解析
* 浏览器操作
* 自动点击
* 自动输入
* 截图

并支持：

* 视觉分析
* 图像生成
* 文本转语音
* 多模型协同推理

---

# 内置工具（40+）

Hermes 内置大量工具：

* Web Search
* Terminal
* File System
* Browser
* Vision
* Image Generation
* Text-to-Speech
* Memory
* Task Planning
* Cron Jobs
* Code Execution
* Subagents
* Skills
* Multi-model Reasoning
* Messaging
* Session Search

---

# 与各种系统兼容

## 聊天平台

* Telegram
* Discord
* Slack
* WhatsApp
* CLI

## LLM 提供商

* Nous Portal
* OpenRouter
* 自定义 API

## 执行环境

* Local
* Docker
* SSH
* Singularity
* Modal

---

# 技能系统（Skills）

Hermes 的技能是一种**过程型记忆（procedural memory）**。

特点：

* 解决复杂问题后自动生成技能
* 遇到类似任务自动加载
* 可从社区安装新技能

---

## 内置技能

系统自带 **40+ 技能**，例如：

* MLOps
* GitHub 自动化
* 图表生成
* 笔记管理

同时 Agent 在运行过程中会**自动创建新技能**。

---

## 社区技能库

支持从多个社区安装技能：

* agentskills.io
* GitHub
* ClawHub
* LobeHub
* Claude Code Marketplace

系统提供：

* 技能隔离
* 技能审计

保障安全。

---

## 开放技能标准

技能采用 **agentskills.io 标准**：

* 每个技能是一个 `SKILL.md`
* 可以跨 Agent 共享
* 可自由发布和安装

---

# 60 秒快速开始

## 1 安装

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

安装内容：

* uv
* Python 3.11
* 项目代码
* 所有依赖

无需 sudo。

---

## 2 配置

```bash
hermes setup
```

或选择模型：

```bash
hermes model
```

支持：

* Nous Portal
* OpenRouter
* 自定义 API

---

## 3 开始对话

```bash
hermes
```

进入交互式 CLI。

---

## 4 启用多平台（可选）

```bash
hermes gateway setup
hermes gateway
hermes gateway install
```

连接：

* Telegram
* Discord
* Slack
* WhatsApp

并作为 systemd 服务运行。

---

## 5 更新

```bash
hermes update
```

自动拉取最新版本并更新依赖。

---

# 面向 AI 研究

Hermes 也可用于 AI 研究场景。

## 批量轨迹生成

可以：

* 并行生成数千条 tool-calling 轨迹
* 自动 checkpoint
* 配置 worker 和 batch

---

## 强化学习训练

与 **Atropos** 集成：

* 用于 Agent 行为强化学习
* 支持 11 种 tool-call parser

---

## 轨迹导出

支持导出为：

* ShareGPT 格式

可用于：

* 模型微调
* 训练数据生成

---

# 项目特点总结

Hermes Agent 的核心定位：

**一个长期运行、持续学习的个人 AI Agent 平台**

核心特性：

1️⃣ 持久记忆
2️⃣ 技能系统
3️⃣ 多 Agent 并行
4️⃣ 多平台通信
5️⃣ 浏览器 + 工具调用
6️⃣ 自动化调度
7️⃣ 本地自托管

项目：

* 开源
* MIT License
* 无遥测
* 数据完全在本地保存。 ([Hermes Agent][2])

# 参考资料

* any list
{:toc}
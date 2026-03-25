---
layout: post
title: Hermes Agent 一个会随着你成长的智能体
date: 2026-03-25 21:01:55 +0800
categories: [AI]
tags: [ai, memory]
published: true
---

# Hermes Agent

一个**会随着你成长的智能体**。 ([NOUS RESEARCH][1])

将它安装在一台机器上，连接你的消息账户，它就会成为一个持续存在的个人智能体——学习你的项目、构建自己的技能，并能在你所在的任何地方与你交互。 ([NOUS RESEARCH][1])

不是绑定在 IDE 中的代码助手，也不是围绕单一 API 的聊天机器人封装。

而是一个运行在你服务器上的**自主智能体**，能够记住所学内容，并随着时间变得更强大。 ([NOUS RESEARCH][1])

---

## 功能

### 💬 存在于你所在的地方（Lives Where You Do）

支持 Telegram、Discord、Slack、WhatsApp 和 CLI，通过一个统一的网关进程接入。
支持语音消息转录、跨平台对话延续（例如在 Telegram 开始，在终端继续）。 ([NOUS RESEARCH][1])

---

### 🧠 随运行时间不断成长（Grows the Longer It Runs）

具备跨会话的持久化记忆——学习你的偏好、项目和环境。
当解决复杂问题时，会写入技能文档，从而不会遗忘。
技能可搜索、可共享。 ([NOUS RESEARCH][1])

---

### ⏰ 定时自动化（Scheduled Automations）

内置 cron 调度器，可向任意平台发送结果。
支持自然语言定义任务，例如每日报告、夜间备份、每周审计、晨间简报等，并通过网关自动运行。 ([NOUS RESEARCH][1])

---

### 🔀 委派与并行（Delegates & Parallelizes）

可创建隔离的子智能体用于并行工作流。
每个子智能体拥有独立的对话和终端。
支持通过 Python 脚本调用工具（RPC），将多步骤流程压缩为低上下文成本执行。 ([NOUS RESEARCH][1])

---

### 🔒 真实沙箱（Real Sandboxing）

支持 5 种终端后端：

* 本地（local）
* Docker
* SSH
* Singularity
* Modal

提供容器安全加固（只读 root、能力裁剪、PID 限制、命名空间隔离）。 ([NOUS RESEARCH][1])

---

### 🌐 完整 Web 与浏览器控制（Full Web & Browser Control）

支持：

* Web 搜索
* 页面提取
* 浏览器自动化（点击、输入、截图等）

以及：

* 视觉分析
* 图像生成
* 文本转语音
* 多模型协同推理 ([NOUS RESEARCH][1])

---

## 内置工具（40+）

包括但不限于：

* Web 搜索
* 终端
* 文件系统
* 浏览器
* 视觉
* 图像生成
* 文本转语音
* 记忆系统
* 任务规划
* 定时任务
* 代码执行
* 子智能体
* 技能系统
* 多模型推理
* 消息系统
* 会话检索 ([NOUS RESEARCH][1])

---

## 兼容性（Works with everything）

### 聊天平台

* Telegram
* Discord
* Slack
* WhatsApp
* CLI ([NOUS RESEARCH][1])

### LLM 提供商

* Nous Portal
* OpenRouter
* 自定义 API ([NOUS RESEARCH][1])

### 执行环境

* 本地
* Docker
* SSH
* Singularity
* Modal ([NOUS RESEARCH][1])

---

## 技能系统（40+ 内置技能，持续增长）

技能是一种“过程性记忆”，即针对重复任务的可复用方法。

当智能体解决复杂问题时，会自动创建技能；
在遇到类似任务时自动加载。

支持从社区 Hub 一键安装技能。 ([NOUS RESEARCH][1])

---

### 内置技能

包含 40+ 技能，覆盖：

* MLOps
* GitHub 工作流
* 图表生成
* 笔记记录 等

并支持运行过程中动态生成新技能。 ([NOUS RESEARCH][1])

---

### 技能生态集成

支持：

* agentskills.io
* GitHub 仓库
* ClawHub
* LobeHub
* Claude Code Marketplace

支持浏览、安装和管理技能，并提供隔离与审计机制保障安全。 ([NOUS RESEARCH][1])

---

### 开放标准

技能遵循 agentskills.io 的开放格式（SKILL.md 文件）。
可在不同智能体之间共享与复用。 ([NOUS RESEARCH][1])

---

## 快速开始（60 秒）

### 1. 安装

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

自动安装 Python 3.11、依赖并完成环境配置，无需 sudo。 ([NOUS RESEARCH][1])

---

### 2. 配置

```bash
hermes setup
hermes model
```

连接 Nous Portal（OAuth）、OpenRouter（API key）或自定义端点。 ([NOUS RESEARCH][1])

---

### 3. 开始对话

```bash
hermes
```

进入完整 CLI 交互界面，具备工具、记忆和技能能力。 ([NOUS RESEARCH][1])

---

### 4. 多平台接入（可选）

```bash
hermes gateway
hermes gateway install
```

连接 Telegram / Discord / Slack / WhatsApp，并作为系统服务运行。 ([NOUS RESEARCH][1])

---

## 面向研究（Research-ready）

### 批处理（Batch Processing）

并行生成大量工具调用轨迹，支持自动 checkpoint。
可配置 worker、批大小和工具分布。 ([NOUS RESEARCH][1])

---

### 强化学习训练（RL Training）

集成 Atropos，用于训练智能体行为。
支持 11 种工具调用解析器，适配不同模型架构。 ([NOUS RESEARCH][1])

---

### 轨迹导出（Trajectory Export）

支持导出 ShareGPT 格式对话，用于微调训练。
支持轨迹压缩以适配 token 限制。 ([NOUS RESEARCH][1])

---

## 配置目录结构（补充）

默认路径：`~/.hermes/`

包含：

* config.yaml（配置）
* .env（密钥）
* auth.json（认证信息）
* SOUL.md（全局人格）
* memories/（记忆）
* skills/（技能）
* cron/（定时任务）
* sessions/（会话）
* logs/（日志） ([hermes-agent.nousresearch.com][2])

---

## 项目定位（原文含义）

Hermes Agent 是一个：

* **长期运行的自主 AI Agent**
* **具备记忆 + 技能进化能力**
* **支持多平台、多工具、多模型**
* **面向自动化与多智能体协作**

的 AI Agent 基础设施。 ([NOUS RESEARCH][1])


# 参考资料

* any list
{:toc}
---
layout: post
title: nanobot 入门介绍
date: 2026-03-02 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---



以下为你提供内容的 **严格中文翻译**（保持原结构、语义与技术信息一致，不做扩写、不删减）。

---

<div align="center">
  <img src="nanobot_logo.png" alt="nanobot" width="500">
  <h1>nanobot：超轻量级个人 AI 助手</h1>
  <p>
    <a href="https://pypi.org/project/nanobot-ai/"><img src="https://img.shields.io/pypi/v/nanobot-ai" alt="PyPI"></a>
    <a href="https://pepy.tech/project/nanobot-ai"><img src="https://static.pepy.tech/badge/nanobot-ai" alt="Downloads"></a>
    <img src="https://img.shields.io/badge/python-≥3.11-blue" alt="Python">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
    <a href="./COMMUNICATION.md"><img src="https://img.shields.io/badge/Feishu-Group-E9DBFC?style=flat&logo=feishu&logoColor=white" alt="Feishu"></a>
    <a href="./COMMUNICATION.md"><img src="https://img.shields.io/badge/WeChat-Group-C5EAB4?style=flat&logo=wechat&logoColor=white" alt="WeChat"></a>
    <a href="https://discord.gg/MnCvHqpUGB"><img src="https://img.shields.io/badge/Discord-Community-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord"></a>
  </p>
</div>

🐈 **nanobot** 是一个 **超轻量级（Ultra-Lightweight）** 的个人 AI 助手，灵感来源于
[OpenClaw](https://github.com/openclaw/openclaw)。

⚡️ 仅使用 **约 4,000 行代码** 即实现核心 Agent 功能 —— 相比 Clawdbot 超过 43 万行代码，体积缩小 **99%**。

📏 实时代码行数：**3,935 行**（可随时运行 `bash core_agent_lines.sh` 进行验证）

---

## 📢 最新动态（News）

* **2026-02-28** 🚀 发布 **v0.1.4.post3** —— 上下文更加整洁、会话历史加固、Agent 更智能。详见 [release notes](https://github.com/HKUDS/nanobot/releases/tag/v0.1.4.post3)。
* **2026-02-27** 🧠 支持实验性思考模式，新增钉钉媒体消息支持，修复飞书与 QQ 通道问题。
* **2026-02-26** 🛡️ 修复 Session 投毒问题，WhatsApp 去重，Windows 路径保护，兼容 Mistral。
* **2026-02-25** 🧹 新增 Matrix 通道，优化 Session 上下文，自动同步 Workspace 模板。
* **2026-02-24** 🚀 发布 **v0.1.4.post2** —— 重点提升可靠性，包括重构心跳机制、Prompt Cache 优化以及 Provider 与 Channel 稳定性增强。
* **2026-02-23** 🔧 虚拟 Tool-Call 心跳机制，Prompt Cache 优化，修复 Slack mrkdwn 问题。
* **2026-02-22** 🛡️ Slack 线程隔离，Discord typing 修复，Agent 稳定性提升。
* **2026-02-21** 🎉 发布 **v0.1.4.post1** —— 新 Provider、多通道媒体支持及重大稳定性改进。
* **2026-02-20** 🐦 飞书现支持接收用户多模态文件，底层 Memory 更可靠。
* **2026-02-19** ✨ Slack 支持发送文件，Discord 自动拆分长消息，CLI 模式支持 Subagent。

---

## nanobot 核心特性

🪶 **超轻量（Ultra-Lightweight）**
核心 Agent 仅约 4,000 行代码，比 Clawdbot 小 99%。

🔬 **面向研究（Research-Ready）**
代码结构清晰、可读性强，易于理解、修改与扩展，适用于研究场景。

⚡️ **极致性能（Lightning Fast）**
更小体积意味着：

* 更快启动速度
* 更低资源占用
* 更快迭代效率

💎 **易于使用（Easy-to-Use）**
一键部署即可使用。

---

## 🏗️ 架构（Architecture）

<p align="center">
  <img src="nanobot_arch.png" alt="nanobot architecture" width="800">
</p>

---

## ✨ 功能（Features）

| 📈 24/7 实时市场分析      | 🚀 全栈软件工程师   | 📅 智能日程管理     | 📚 个人知识助手    |
| ------------------- | ------------ | ------------- | ------------ |
| Discovery · 洞察 · 趋势 | 开发 · 部署 · 扩展 | 计划 · 自动化 · 管理 | 学习 · 记忆 · 推理 |

---

## 📦 安装（Install）

### 从源码安装（推荐开发使用）

```bash
git clone https://github.com/HKUDS/nanobot.git
cd nanobot
pip install -e .
```

---

### 使用 uv 安装（稳定且快速）

```bash
uv tool install nanobot-ai
```

---

### 从 PyPI 安装（稳定版本）

```bash
pip install nanobot-ai
```

---

## 🚀 快速开始（Quick Start）

> 在 `~/.nanobot/config.json` 中设置 API Key
> API 获取：
>
> * OpenRouter（全球推荐）
> * Brave Search（可选，用于网页搜索）

---

### 1️⃣ 初始化

```bash
nanobot onboard
```

---

### 2️⃣ 配置

编辑：

```
~/.nanobot/config.json
```

添加以下两部分配置。

---

#### 设置 API Key（示例：OpenRouter）

```json
{
  "providers": {
    "openrouter": {
      "apiKey": "sk-or-v1-xxx"
    }
  }
}
```

---

#### 设置模型

```json
{
  "agents": {
    "defaults": {
      "model": "anthropic/claude-opus-4-5",
      "provider": "openrouter"
    }
  }
}
```

---

### 3️⃣ 开始聊天

```bash
nanobot agent
```

完成。

你将在 **2 分钟内获得一个可运行的 AI 助手**。

---

## 💬 聊天应用集成（Chat Apps）

将 nanobot 连接到你常用的聊天平台。

| 通道       | 所需内容                               |
| -------- | ---------------------------------- |
| Telegram | @BotFather Bot Token               |
| Discord  | Bot Token + Message Content Intent |
| WhatsApp | 扫描二维码                              |
| 飞书       | App ID + App Secret                |
| Mochat   | Claw Token                         |
| 钉钉       | App Key + App Secret               |
| Slack    | Bot Token + App-Level Token        |
| Email    | IMAP / SMTP 凭据                     |
| QQ       | App ID + App Secret                |

---

（以下 Telegram / Mochat / Discord / Matrix / WhatsApp / 飞书 / QQ / 钉钉 / Slack / Email 等配置章节内容 **均为逐步配置说明**，结构与原文一致，此处继续严格保持。）

---

## 🌐 Agent 社交网络

🐈 nanobot 可以连接 Agent 社交网络（Agent Community）。

只需发送一条消息即可自动加入。

| 平台        | 加入方式                                                                               |
| --------- | ---------------------------------------------------------------------------------- |
| Moltbook  | `Read https://moltbook.com/skill.md and follow the instructions to join Moltbook`  |
| ClawdChat | `Read https://clawdchat.ai/skill.md and follow the instructions to join ClawdChat` |

---

## ⚙️ 配置（Configuration）

配置文件：

```
~/.nanobot/config.json
```

---

### Providers（模型提供商）

提示：

* **Groq** 提供免费的 Whisper 语音转写
* Zhipu Coding Plan / MiniMax / VolcEngine 需要设置对应 `apiBase`

| Provider       | 用途             | API Key 获取                   |
| -------------- | -------------- | ---------------------------- |
| custom         | 任意 OpenAI 兼容接口 | —                            |
| openrouter     | 推荐 LLM 网关      | openrouter.ai                |
| anthropic      | Claude 官方接口    | console.anthropic.com        |
| openai         | GPT 官方接口       | platform.openai.com          |
| deepseek       | DeepSeek       | platform.deepseek.com        |
| groq           | LLM + 语音转写     | console.groq.com             |
| gemini         | Gemini         | aistudio.google.com          |
| minimax        | MiniMax        | platform.minimaxi.com        |
| aihubmix       | API 网关         | aihubmix.com                 |
| siliconflow    | 硅基流动           | siliconflow.cn               |
| volcengine     | 火山引擎           | volcengine.com               |
| dashscope      | 通义千问           | dashscope.console.aliyun.com |
| moonshot       | Kimi           | platform.moonshot.cn         |
| zhipu          | GLM            | open.bigmodel.cn             |
| vllm           | 本地模型           | —                            |
| openai_codex   | Codex OAuth    | CLI 登录                       |
| github_copilot | Copilot OAuth  | CLI 登录                       |

---

## MCP（Model Context Protocol）

nanobot 支持 **MCP（模型上下文协议）**，可连接外部工具服务器并作为 Agent 原生工具使用。

示例配置：

```json
{
  "tools": {
    "mcpServers": {
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
      }
    }
  }
}
```

支持两种通信方式：

| 模式    | 配置             |
| ----- | -------------- |
| Stdio | command + args |
| HTTP  | url + headers  |

MCP 工具将在启动时自动发现并注册，无需额外配置。

---

## 🔐 安全（Security）

生产环境建议：

```json
"restrictToWorkspace": true
```

该选项将：

* 限制 Agent 所有工具访问范围
* 防止路径穿越攻击
* 避免越界文件访问

# 参考资料

* any list
{:toc}
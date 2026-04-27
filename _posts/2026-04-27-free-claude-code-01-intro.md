---
layout: post 
title: 免费 Claude Code-免费使用 Claude Code CLI 与 VSCode。无需 Anthropic API Key
date: 2026-04-27 21:01:55 +0800
categories: [Ai]
tags: [claude, ai]
published: true
---

# 🤖 免费 Claude Code

### 免费使用 Claude Code CLI 与 VSCode。无需 Anthropic API Key。

一个轻量级代理，将 Claude Code 的 Anthropic API 请求路由到 **NVIDIA NIM（每分钟 40 次免费）**、**OpenRouter（数百模型）**、**DeepSeek（兼容 Anthropic 的原生 API）**、**LM Studio（完全本地）**、**llama.cpp（本地 + Anthropic 端点）** 或 **Ollama（完全本地，原生 Anthropic Messages）**。

</div>

<div align="center">
  <img src="pic.png" alt="Free Claude Code in action" width="700">
  <p><em>通过 NVIDIA NIM 运行 Claude Code，完全免费</em></p>
</div>

---

## 功能特性（Features）

| 特性                            | 描述                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| **零成本**                       | NVIDIA NIM 提供 40 req/min 免费额度；OpenRouter 提供免费模型；LM Studio / Ollama / llama.cpp 支持完全本地运行 |
| **无缝替换（Drop-in Replacement）** | 仅需设置 2 个环境变量，无需修改 Claude Code CLI 或 VSCode 插件                                           |
| **6 个 Provider**              | NVIDIA NIM、OpenRouter、DeepSeek、LM Studio（本地）、llama.cpp、Ollama                           |
| **按模型路由**                     | 可将 Opus / Sonnet / Haiku 映射到不同模型与 Provider，自由混用                                         |
| **Thinking Token 支持**         | 将 `<think>` 标签与 `reasoning_content` 转换为 Claude 原生 thinking blocks                       |
| **启发式工具解析器**                  | 将文本形式的 tool 调用自动解析为结构化调用                                                                |
| **请求优化**                      | 本地拦截 5 类无意义 API 请求，节省配额与延迟                                                              |
| **智能限流**                      | 滚动窗口限流 + 429 指数退避 + 并发控制                                                                |
| **Discord / Telegram Bot**    | 支持远程自动化编码、树状线程、会话持久化、实时进度                                                               |
| **Subagent 控制**               | 强制 `run_in_background=False`，避免子 agent 失控                                               |
| **可扩展性**                      | 清晰的 `BaseProvider` 与 `MessagingPlatform` 抽象                                             |

---

## 快速开始（Quick Start）

### 前置条件（Prerequisites）

1. 获取 API Key（或使用本地模型）：

* NVIDIA NIM
* OpenRouter
* DeepSeek
* LM Studio（本地，无需 Key）
* llama.cpp（本地）
* Ollama（本地）

2. 安装 Claude Code

---

### 安装 uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv self update
uv python install 3.14
```

Windows：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
uv self update
uv python install 3.14
```

> 注意：Homebrew Python 环境下 `pip install uv` 可能失败（PEP 668）

---

### 克隆与配置

```bash
git clone https://github.com/Alishahryar1/free-claude-code.git
cd free-claude-code
cp .env.example .env
```

选择 Provider 并编辑 `.env`：

（以下配置结构保持不变，仅说明翻译）

#### NVIDIA NIM（推荐）

```dotenv
NVIDIA_NIM_API_KEY="你的 key"
MODEL="nvidia_nim/z-ai/glm4.7"
ENABLE_MODEL_THINKING=true
```

#### OpenRouter

```dotenv
OPENROUTER_API_KEY="你的 key"
MODEL="open_router/stepfun/step-3.5-flash:free"
```

#### DeepSeek

```dotenv
DEEPSEEK_API_KEY="你的 key"
MODEL="deepseek/deepseek-chat"
```

#### LM Studio（本地）

```dotenv
MODEL="lmstudio/unsloth/GLM-4.7-Flash-GGUF"
```

#### llama.cpp

```dotenv
LLAMACPP_BASE_URL="http://localhost:8080/v1"
MODEL="llamacpp/local-model"
```

#### Ollama

```dotenv
OLLAMA_BASE_URL="http://localhost:11434"
MODEL="ollama/llama3.1"
```

---

### 运行

启动代理：

```bash
uv run uvicorn server:app --host 0.0.0.0 --port 8082
```

运行 Claude：

```bash
ANTHROPIC_BASE_URL="http://localhost:8082" claude
```

完成。

---

## 工作原理（How It Works）

```
Claude Code → Proxy → LLM Provider
```

* Claude 使用标准 Anthropic API
* Proxy 转发到实际模型
* 支持模型级路由
* 本地优化请求
* 自动格式转换（Anthropic / OpenAI）
* thinking token 转换

---

## Provider

| Provider   | 成本    | 限流     | 场景           |
| ---------- | ----- | ------ | ------------ |
| NVIDIA NIM | 免费    | 40/min | 日常使用         |
| OpenRouter | 免费/付费 | 可变     | 多模型          |
| DeepSeek   | 按量    | 可变     | 原生 Anthropic |
| LM Studio  | 本地    | 无限     | 隐私           |
| llama.cpp  | 本地    | 无限     | 轻量推理         |
| Ollama     | 本地    | 无限     | 易用           |

---

## Discord Bot

支持远程控制 Claude Code：

能力包括：

* 树状对话分支
* 会话持久化
* 实时流式输出
* 并发任务
* 语音输入（自动转文本）

---

## 配置（Configuration）

### 核心变量

| 变量                    | 说明          |
| --------------------- | ----------- |
| MODEL                 | 默认模型        |
| MODEL_OPUS            | Opus 模型     |
| MODEL_SONNET          | Sonnet 模型   |
| MODEL_HAIKU           | Haiku 模型    |
| ENABLE_MODEL_THINKING | thinking 开关 |

---

### 限流

| 变量                       | 默认 |
| ------------------------ | -- |
| PROVIDER_RATE_LIMIT      | 40 |
| PROVIDER_MAX_CONCURRENCY | 5  |

---

### 消息与语音

支持：

* Discord / Telegram
* Whisper 语音识别（本地或 NIM）

---

## 开发（Development）

### 项目结构

```
server.py          # 入口
api/               # API层
core/              # 协议处理
providers/         # Provider实现
messaging/         # Bot系统
config/            # 配置
cli/               # CLI管理
tests/             # 测试
```

---

### 常用命令

```bash
uv run ruff format
uv run ruff check
uv run ty check
uv run pytest
```

---

### 扩展

新增 Provider：

```python
class MyProvider(OpenAIChatTransport):
    ...
```

新增消息平台：

```python
class MyPlatform(MessagingPlatform):
    ...
```

---

## 贡献（Contributing）

* 提交 Issue
* 增加 Provider
* 增加平台（如 Slack）
* 提升测试覆盖

```bash
git checkout -b my-feature
uv run ruff format && uv run pytest
```

---

## 许可证（License）

MIT License


# 参考资料

* any list
{:toc}
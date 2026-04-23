---
layout: post 
title: Langfuse 是一个**开源 LLM 工程平台**。它帮助团队协作完成 AI 应用的**开发、监控、评估与调试**。
date: 2026-04-23 21:01:55 +0800
categories: [Ai]
tags: [plateform, ai]
published: true
---

# langfuse

Langfuse 是一个**开源 LLM 工程平台**。它帮助团队协作完成 AI 应用的**开发、监控、评估与调试**。

Langfuse 支持**分钟级自托管部署**，并已在生产环境中经过验证（battle-tested）。

[![Langfuse Overview Video](https://github.com/user-attachments/assets/925d71db-6331-445e-8f3e-727ee95d1c9f)](https://langfuse.com/watch-demo)

---

## ✨ 核心功能

<img width="4856" height="1944" alt="Langfuse Overview" src="https://github.com/user-attachments/assets/5dac68ef-d546-49fb-b06f-cfafc19282e3" />

* [LLM 应用可观测性](https://langfuse.com/docs/tracing)：对应用进行埋点并接入 trace 数据，从而跟踪 LLM 调用以及检索（retrieval）、向量嵌入（embedding）、Agent 行为等关键逻辑。支持复杂日志与用户会话的调试分析。

* [Prompt 管理](https://langfuse.com/docs/prompt-management/get-started)：集中管理 Prompt，支持版本控制与团队协作迭代。通过客户端与服务端缓存优化，保证 Prompt 迭代不会增加延迟。

* [评估系统](https://langfuse.com/docs/evaluation/overview)：支持 LLM-as-a-judge、用户反馈收集、人工标注、自定义评估流水线（API/SDK）。

* [数据集](https://langfuse.com/docs/evaluation/dataset-runs/datasets)：用于测试集与基准评测，支持持续优化、上线前验证、结构化实验，并可集成 LangChain、LlamaIndex 等框架。

* [LLM Playground](https://langfuse.com/docs/playground)：用于 Prompt 与模型参数调试，加速反馈闭环，可从 trace 中直接跳转调试。

* [完整 API](https://langfuse.com/docs/api)：支持构建定制化 LLMOps 流程，提供 OpenAPI、Postman 集合，以及 Python / JS/TS SDK。

---

## 📦 部署 Langfuse

<img width="4856" height="1322" alt="Langfuse Deployment Options" src="https://github.com/user-attachments/assets/98f020c7-7a20-4264-a201-65c41a52a5d5" />

### Langfuse 云

由官方托管，提供免费额度，无需信用卡。

### 自托管 Langfuse

在自有基础设施运行：

* 本地部署（docker compose）

```bash
git clone https://github.com/langfuse/langfuse.git
cd langfuse
docker compose up
```

* VM 部署（Docker Compose）
* Kubernetes（Helm，推荐生产环境）
* Terraform：AWS / Azure / GCP

详见自托管文档。

---

## 🔌 集成

（表格结构保留，仅翻译描述）

### 主要集成

| 集成            | 支持            | 描述            |
| ------------- | ------------- | ------------- |
| SDK           | Python, JS/TS | 手动埋点，灵活控制     |
| OpenAI        | Python, JS/TS | 替换 SDK 自动埋点   |
| LangChain     | Python, JS/TS | callback 自动接入 |
| LlamaIndex    | Python        | callback 自动接入 |
| Haystack      | Python        | tracing 自动接入  |
| LiteLLM       | Python, JS/TS | 统一 100+ LLM   |
| Vercel AI SDK | JS/TS         | 前端 AI 开发工具    |
| Mastra        | JS/TS         | Agent 框架      |
| API           | -             | 直接调用 API      |

---

## 🚀 快速开始

### 1️⃣ 创建项目

1. 注册账号或自托管
2. 创建项目
3. 创建 API Key

---

### 2️⃣ 记录第一个 LLM 调用

```bash
pip install langfuse openai
```

```bash
LANGFUSE_SECRET_KEY="sk-lf-..."
LANGFUSE_PUBLIC_KEY="pk-lf-..."
LANGFUSE_BASE_URL="https://cloud.langfuse.com"
```

```python
from langfuse import observe
from langfuse.openai import openai

@observe()
def story():
    return openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "What is Langfuse?"}],
    ).choices[0].message.content

main()
```

---

### 3️⃣ 查看 Trace

在 Langfuse 控制台中查看调用链与应用逻辑。

---

## 💭 支持

* 文档（最优先）
* FAQ
* Ask AI

支持渠道：

* GitHub Discussions
* Feature Request
* Issue
* 应用内聊天

---

## 🤝 贡献

欢迎贡献：

* 投票 Ideas
* 提交 Issue
* 提交 PR

---

## 🥇 许可证

MIT（`ee` 目录除外）

---

## 🔒 安全与隐私

默认会发送匿名使用统计（PostHog）：

目的：

1. 产品优化
2. 使用统计

不包含：

* trace
* prompt
* 数据集内容

可关闭：

```bash
TELEMETRY_ENABLED=false
```


# 参考资料

* any list
{:toc}
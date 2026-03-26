---
layout: post
title: LiteLLM 是什么 Python SDK + 代理服务器（AI Gateway）
date: 2026-03-26 21:01:55 +0800
categories: [AI]
tags: [ai, memory]
published: true
---

# 📦 LiteLLM

---

## 🚅 LiteLLM

在 **OpenAI 格式（或原生格式）** 下调用 **100+ LLM 模型**。
支持：Bedrock、Azure、OpenAI、VertexAI、Anthropic、Groq 等。 ([berriai.github.io][1])

---

## 🧠 LiteLLM 是什么

LiteLLM 是一个：

> **Python SDK + 代理服务器（AI Gateway）**

用于：

* 统一调用多个大模型 API（100+）
* 提供统一接口（兼容 OpenAI API 规范）
* 支持生产级能力（成本、限流、日志、负载均衡等） ([berriai.github.io][1])

---

## 🎯 使用 LiteLLM 的目的

LiteLLM 主要用于：

### 1️⃣ 多模型统一调用

支持以下接口统一访问：

* `/chat/completions`
* `/responses`
* `/embeddings`
* `/images`
* `/audio`
* `/batches`
* `/rerank`
* `/messages`
* 等等 ([berriai.github.io][1])

---

## 🏗️ 使用方式（两种模式）

### 方式一：LiteLLM Proxy（AI Gateway）

👉 一个**集中式 LLM 网关服务**

适用场景：

* 多团队共享
* 企业级 AI 平台

核心能力：

* 统一 API 网关
* 身份认证（AuthN/AuthZ）
* 多租户成本统计
* 每项目配置（日志 / Guardrails / 缓存）
* 虚拟 API Key（安全访问控制）
* 管理后台 UI（监控与管理） ([GitHub][2])

---

### 方式二：LiteLLM Python SDK

👉 在代码中直接使用

适用场景：

* 应用开发
* Agent / 工具链开发

核心能力：

* 统一 Python API
* 多模型 Router（重试 / fallback）
* 应用层负载均衡
* 成本统计
* 异常统一（兼容 OpenAI 错误格式）
* 可观测性（支持 MLflow / Langfuse 等） ([GitHub][2])

---

## ⚡ 性能

* P95 延迟：**8ms**
* 吞吐：**1000 RPS** ([berriai.github.io][1])

---

## 🌐 支持的模型提供商

LiteLLM 支持大量模型提供商，包括但不限于：

* OpenAI
* Anthropic
* Azure
* AWS Bedrock
* Cohere
* HuggingFace
* Ollama
* NVIDIA NIM
* Vertex AI
* DeepSeek
* 等（100+） ([berriai.github.io][1])

👉 并支持多种能力：

| 能力         | 支持 |
| ---------- | -- |
| Chat       | ✅  |
| Embedding  | ✅  |
| Image      | ✅  |
| Audio      | ✅  |
| Moderation | ✅  |
| Batch      | ✅  |

---

## 🧩 核心能力（抽象总结）

### ✅ 1. 统一 API 层（最核心）

```python
from litellm import completion

response = completion(
  model="gpt-3.5-turbo",
  messages=[{"role": "user", "content": "Hello"}]
)
```

👉 同一接口调用不同模型（OpenAI / Claude / Llama）

---

### ✅ 2. 模型 fallback / 重试机制

```python
fallback_models = ["gpt-3.5-turbo", "claude-2"]
```

* 主模型失败 → 自动切换备用模型
* 解决：

  * 限流
  * 服务不可用

---

### ✅ 3. 统一返回格式

所有模型输出统一为：

```
response['choices'][0]['message']['content']
```

---

### ✅ 4. 成本与监控

支持：

* 成本统计（per user / project）
* 日志
* 调试
* 可观测性平台集成

---

### ✅ 5. 缓存能力

支持：

* embedding 缓存
* completion 缓存

👉 用于降低成本 + 提升性能

---

### ✅ 6. 负载均衡 & Router

* 多 provider 路由
* 自动重试
* 请求分发

---

## 🏢 企业版（Enterprise）

提供：

* SSO 单点登录
* 定制集成
* SLA
* 专业支持
* 功能优先级支持 ([berriai.github.io][1])

---

## 🧪 开发与贡献

### 安装开发环境

```bash
git clone https://github.com/BerriAI/litellm.git
cd litellm
make install-dev
make format
make lint
make test-unit
```

---

### 代码规范

* Black（格式化）
* Ruff（Lint）
* MyPy（类型检查）
* 循环依赖检测
* import 安全检查 ([berriai.github.io][1])

---

## 🤔 为什么要做 LiteLLM

> 原因：管理不同 LLM API（Azure / OpenAI / Cohere）过于复杂

👉 LiteLLM 的目标：

* 简化多模型接入
* 降低开发复杂度
* 提供统一抽象层 ([berriai.github.io][1])

---

## 🧠 一句话总结

LiteLLM 本质是：

> **“LLM 领域的 API 网关 + SDK 统一抽象层”**

你可以把它理解为：

* 👉 AI 版的 **API Gateway（类似 Kong / Zuul）**
* 👉 或者 LLM 版的 **数据库驱动层（类似 JDBC）**

---

## ⚠️（补充：工程视角关键认知）

这个项目在架构中的定位非常关键：

### 它解决的核心问题

* 多模型适配成本高
* API 不统一
* 成本不可控
* 稳定性差

### 它的本质层级

```
应用层（Agent / 业务）
        ↓
LiteLLM（统一抽象层）
        ↓
各大模型厂商 API
```

# 参考资料

* any list
{:toc}
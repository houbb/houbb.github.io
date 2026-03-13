---
layout: post
title: javaer 转型 ai 学习之路-08-AI Platform
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# AI Platform

当企业从 **单个 AI 功能**（聊天、RAG）走向 **规模化 AI 应用** 时，通常需要构建一个 **AI Platform（AI 系统平台）**。

这个平台的目标是：**把 LLM、RAG、Agent、数据、工具统一管理和服务化**，让多个业务团队都能复用。

可以把 AI Platform 理解为：

```text
AI Platform = AI 的 DevOps 平台
```

类似于软件开发中的：

* CI/CD 平台
* Kubernetes 平台
* DevOps 平台

只是对象变成 **LLM 应用**。

---

# 一、AI Platform 的核心目标

企业 AI 平台通常解决 5 个核心问题：

```text
1 模型管理
2 Prompt管理
3 RAG服务
4 Agent服务
5 AI应用接入
```

换句话说：

```text
统一 AI 能力
```

---

# 二、AI Platform 总体架构

一个典型 AI Platform 架构：

```text
                AI Applications
       (Chatbot / Copilot / Search / Agents)
                       │
                       ▼
                 AI Gateway
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Prompt Service   RAG Service   Agent Service
        │              │              │
        ▼              ▼              ▼
   Model Router   Vector Database   Tool Registry
        │              │              │
        ▼              ▼              ▼
      LLM APIs      Embedding      External APIs
```

这个架构可以理解为 **AI 中台**。

---

# 三、AI Gateway（AI 网关）

所有 AI 请求都会先进入：

```text
AI Gateway
```

作用类似：

```text
API Gateway
```

主要功能：

```text
鉴权
限流
日志
成本统计
```

例如：

```text
token 使用统计
用户权限
模型选择
```

---

# 四、Prompt Service

Prompt 是 AI 应用的核心逻辑。

企业通常会把 Prompt 管理成：

```text
Prompt Service
```

功能：

```text
Prompt 模板管理
Prompt 版本控制
Prompt A/B测试
Prompt 回滚
```

例如：

```text
prompt_v1
prompt_v2
prompt_v3
```

可以随时切换。

---

# 五、Model Router（模型路由）

企业通常不会只用一个模型。

例如：

| 任务 | 模型   |
| -- | ---- |
| 聊天 | 大模型  |
| 总结 | 小模型  |
| 代码 | 代码模型 |

所以需要：

```text
Model Router
```

逻辑：

```text
根据任务类型
自动选择模型
```

示例：

```text
复杂推理 → 大模型
简单问答 → 小模型
```

常见模型：

* DeepSeek
* Qwen
* Llama

---

# 六、RAG Service

企业 AI 平台一般会提供：

```text
统一 RAG 服务
```

包括：

```text
文档解析
chunk
embedding
vector search
rerank
```

典型流程：

```text
文档
↓
Parser
↓
Chunk
↓
Embedding
↓
Vector DB
↓
Retrieve
↓
LLM
```

向量数据库通常是：

* Milvus
* Qdrant

---

# 七、Agent Service

Agent 功能也需要平台化。

通常包括：

```text
Tool Registry
Agent Runtime
Workflow Engine
```

结构：

```text
Agent
↓
LLM
↓
Tool Router
↓
Tools
```

工具可能是：

```text
SQL
API
搜索
代码执行
```

常见框架：

* LangGraph

---

# 八、Tool Registry（工具注册中心）

Agent 调用的工具需要统一管理。

例如：

```text
weather_api
sql_query
log_search
monitor_query
```

工具注册：

```text
name
description
parameters
```

LLM 才能知道：

```text
可以调用哪些工具
```

---

# 九、Memory Service

Agent 需要记忆。

企业平台通常提供：

```text
Memory Service
```

包括：

```text
conversation history
user profile
long-term memory
```

存储方式：

```text
vector db
redis
database
```

---

# 十、Embedding Service

Embedding 通常也会独立成服务：

```text
Embedding API
```

用于：

```text
RAG
语义搜索
推荐系统
```

常见模型：

* sentence-transformers

---

# 十一、Observability（可观测性）

AI 系统必须有监控。

典型指标：

```text
token usage
latency
cost
hallucination rate
retrieval accuracy
```

很多平台会做：

```text
AI tracing
```

记录：

```text
prompt
tool calls
model response
```

---

# 十二、AI Platform 技术栈

企业常见技术栈：

### 应用层

```text
Java / Python
```

Java 生态：

* Spring AI
* LangChain4j

---

### 模型层

```text
OpenAI API
私有化模型
```

推理框架：

* vLLM
* Ollama

---

### 数据层

```text
Vector DB
Search Engine
Database
```

---

# 十三、AI Platform 的典型应用

AI Platform 建好后，可以快速构建：

```text
AI Chatbot
AI Copilot
AI 搜索
AI 知识库
AI DevOps Agent
```

例如：

```text
企业知识问答
代码助手
客服机器人
```

---

# 十四、AI Platform 与传统系统的区别

传统系统：

```text
业务逻辑
```

AI 系统：

```text
Prompt
+
数据
+
模型
```

所以 AI Platform 更像：

```text
AI 操作系统
```

---

# 十五、AI 架构师真正的职责

AI 架构师通常负责：

```text
AI 平台架构
模型选择
RAG 架构
Agent 架构
成本控制
```

而不是：

```text
训练模型
```

---

如果你愿意继续深入，我可以带你讲 **AI 平台最核心但很少有人讲清楚的一件事**：

**Prompt Engineering 的工程化（PromptOps）**

这是很多企业 AI 项目成败的关键。


# 参考资料

* any list
{:toc}
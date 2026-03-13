---
layout: post
title: javaer 转型 ai 学习之路-01-概览
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# 怎么学习呢？

python 只是语言，在 ai 时代并不是障碍。

下面给你一套 **偏工程实践、可落地的 6 个月路线**。目标不是成为研究型 ML Scientist，而是成为 **能设计企业 AI 平台 / AI 产品架构的 AI 架构师**。
路线会贴合 **Java 技术栈 + AI 系统工程**。

整体思路：

```
认知 → 工具 → RAG → Agent → AI 平台架构 → 模型工程
```

6 个月后应具备能力：

* 能设计 **AI 平台架构**
* 能落地 **RAG / Agent 系统**
* 能部署 **私有化 LLM**
* 能做 **AI 系统性能与成本优化**

---

# 总体 6 个月路线

```
第1月  LLM基础 + Prompt工程
第2月  RAG系统
第3月  Agent系统
第4月  AI系统架构设计
第5月  私有化模型部署
第6月  微调 + 推理优化
```

---

# 第 1 个月：LLM 基础 + Prompt 工程

目标：

**理解 LLM 的工作机制 + 学会控制模型输出**

核心知识：

1 token
2 embedding
3 context window
4 next-token prediction
5 hallucination

Transformer 只需要理解：

* attention 做什么
* 为什么上下文有限

经典论文：

* Attention Is All You Need

---

## Prompt Engineering

核心技巧：

```
system prompt
few-shot
chain-of-thought
self-consistency
structured output
tool calling
```

重点能力：

```
把业务需求转化为 prompt
```

例如：

```
用户问题
→ prompt模板
→ LLM
→ structured JSON
```

---

## Java 技术栈

推荐：

* LangChain4j
* Spring AI

第一个项目：

**AI Chat 服务**

架构：

```
用户
 ↓
Java API
 ↓
LLM API
 ↓
结果返回
```

支持：

* streaming
* prompt template
* tool call

---

# 第 2 个月：RAG 系统（最重要）

企业 AI 90% 都是：

```
RAG
```

RAG 架构：

```
文档
 ↓
chunk
 ↓
embedding
 ↓
vector database
 ↓
retrieve
 ↓
prompt
 ↓
LLM
```

---

## 技术栈

Embedding：

* sentence-transformers

向量数据库：

* Milvus
* Qdrant

---

## 重点学习

### 1 文档切分

核心策略：

```
固定长度 chunk
语义 chunk
递归 chunk
```

### 2 检索策略

```
top-k retrieval
hybrid search
rerank
```

### 3 Prompt 拼接

```
question
+
retrieved context
```

---

## 项目

做一个：

**企业知识库问答系统**

支持：

```
PDF
markdown
wiki
代码库
```

---

# 第 3 个月：Agent 系统

Agent 本质：

```
LLM
+ tools
+ memory
+ planning
```

能力：

```
调用工具
自动规划
多轮任务
```

---

## Agent 框架

推荐理解：

* LangGraph
* AutoGPT
* CrewAI

Java 生态：

LangChain4j Agent

---

## 项目

做一个：

**DevOps Agent**

功能：

```
分析日志
查询监控
执行脚本
生成报告
```

典型流程：

```
用户问题
↓
Agent规划
↓
调用工具
↓
整理结果
```

---

# 第 4 个月：AI 系统架构设计

这是 **AI 架构师最核心能力**。

一个完整 AI 平台通常包含：

```
AI Gateway
Prompt Service
Embedding Service
Vector DB
Agent Service
Model Router
Cache
Observability
```

架构示意：

```
用户
 ↓
AI Gateway
 ↓
Prompt Service
 ↓
RAG Service
 ↓
Model Router
 ↓
LLM
```

---

## 关键系统能力

### 1 Prompt 管理

```
版本管理
A/B test
回滚
```

### 2 模型路由

```
复杂问题 → GPT-4
简单问题 → 小模型
```

### 3 Token 成本控制

```
cache
short context
rerank
```

---

## 项目

设计一个：

**企业 AI Platform**

能力：

```
Prompt管理
Agent管理
RAG管理
模型管理
调用监控
```

---

# 第 5 个月：私有化模型部署

企业 AI 最重要的问题之一：

```
数据安全
```

所以需要本地部署模型。

推荐工具：

* Ollama
* vLLM
* SGLang

---

## 需要理解

GPU 基础：

```
显存
KV cache
batch
tokens/s
```

---

## 项目

部署模型：

* DeepSeek
* Qwen
* Llama

构建：

```
Java AI 服务
 + 本地模型
```

---

# 第 6 个月：微调 + 推理优化

很多企业会用：

```
LoRA 微调
```

工具：

* LLaMA Factory
* Hugging Face Transformers

---

## 推理优化

重点：

```
量化
推理加速
```

常见方法：

```
INT8
INT4
GGUF
```

工具：

* llama.cpp

---

# 六、6个月完成后的能力

如果按这个路线执行，你会具备：

### 1 AI 应用能力

能开发：

```
AI客服
AI搜索
AI知识库
AI Copilot
```

---

### 2 AI 平台能力

能设计：

```
AI Platform
Agent Platform
RAG Platform
```

---

### 3 AI 系统架构能力

你会知道：

```
什么时候用 RAG
什么时候微调
什么时候 Agent
```

---

# 七、AI 架构师真正的核心能力

很多人误以为 AI 架构师是：

```
深度学习专家
```

其实不是。

真正的能力结构是：

```
系统架构
+
数据工程
+
Prompt设计
+
RAG设计
+
Agent系统
```

而不是：

```
推导 Transformer
```



# 参考资料

* any list
{:toc}
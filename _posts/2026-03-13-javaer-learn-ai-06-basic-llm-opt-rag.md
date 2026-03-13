---
layout: post
title: javaer 转型 ai 学习之路-06-RAG 的工程优化
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# RAG 的工程优化

理解 **RAG（Retrieval-Augmented Generation）** 后，真正决定系统效果的不是“是否用了 RAG”，而是 **RAG 的工程优化**。
很多企业做出来的 RAG 效果差，其实都是这几个环节没做好。

下面是 **RAG 系统最核心的 8 个优化点**（几乎所有先进 AI 知识系统都会做）。

---

# 一、Chunk Strategy（分块策略）

这是 **RAG 最重要的优化点之一**。

如果 chunk 切得不好：

```text
检索不到正确信息
```

---

## 常见 chunk 方式

### 1 固定长度 chunk

例如：

```text
500 tokens
```

优点：

* 简单

缺点：

* 可能切断语义

---

### 2 滑动窗口（Overlap）

例如：

```text
chunk_size = 500
overlap = 100
```

结构：

```text
chunk1: 0-500
chunk2: 400-900
chunk3: 800-1300
```

优点：

```text
减少信息丢失
```

---

### 3 语义 chunk（推荐）

按：

```text
段落
标题
章节
```

例如：

```text
Markdown
HTML
PDF章节
```

这是效果最好的。

---

# 二、Hybrid Search（混合检索）

只用 **向量搜索**其实是不够的。

原因：

```text
向量搜索擅长语义
不擅长关键词
```

例如：

用户搜索：

```text
HTTP 404
```

向量搜索可能找不到。

---

所以现代 RAG 都用：

```text
Hybrid Search
```

结构：

```text
vector search
+
keyword search
```

关键词搜索通常用：

* Elasticsearch
* OpenSearch

最终：

```text
score = vector_score + bm25_score
```

---

# 三、Rerank（重排序）

向量搜索返回：

```text
top_k = 10
```

但这些文档 **未必最相关**。

所以需要：

```text
reranker model
```

重新排序。

流程：

```text
query
↓
vector search
↓
top 20 docs
↓
reranker
↓
top 5 docs
```

---

常用 reranker：

* bge-reranker

效果通常能提升：

```text
20%+ 准确率
```

---

# 四、Query Rewrite（查询改写）

用户问题往往 **表达不清楚**。

例如：

```text
它什么时候发布？
```

RAG 不知道：

```text
它 = 什么
```

所以需要：

```text
query rewrite
```

例如：

原问题：

```text
它什么时候发布？
```

改写为：

```text
GPT-4 什么时候发布？
```

通常用 LLM 做：

```text
Rewrite Query
```

---

# 五、Multi Query Retrieval

一个问题往往可以：

```text
多种表达方式
```

例如：

用户问：

```text
怎么优化 JVM 内存？
```

可以扩展：

```text
JVM 内存调优
JVM GC 优化
Java 内存管理
```

然后：

```text
多次检索
合并结果
```

流程：

```text
query
↓
query expansion
↓
multiple retrieval
↓
merge
```

---

# 六、Context Compression（上下文压缩）

RAG 的问题：

```text
检索到的文档太长
```

但 LLM 的：

```text
context window 有限
```

所以需要：

```text
context compression
```

例如：

原文：

```text
1000 tokens
```

压缩为：

```text
200 tokens
```

方法：

```text
LLM summarization
extractive compression
```

---

# 七、Multi-Hop Retrieval（多跳检索）

有些问题需要：

```text
多次检索
```

例如：

用户问题：

```text
OpenAI CEO 的出生国家？
```

步骤：

1

```text
OpenAI CEO → Sam Altman
```

2

```text
Sam Altman → 美国
```

流程：

```text
query
↓
retrieve
↓
reason
↓
retrieve again
```

这叫：

```text
multi-hop retrieval
```

---

# 八、Answer Grounding（答案溯源）

企业 AI **必须能证明答案来源**。

否则：

```text
不可控
```

RAG 系统会返回：

```text
引用文档
```

例如：

```text
答案：
......

来源：
Doc1
Doc2
```

这叫：

```text
grounding
```

---

# 九、RAG 完整优化架构

一个成熟 RAG 系统通常是：

```text
用户问题
↓
Query Rewrite
↓
Multi Query
↓
Hybrid Search
↓
Vector DB
↓
Top 20 Docs
↓
Reranker
↓
Top 5 Docs
↓
Context Compression
↓
LLM
↓
Answer + Citation
```

---

# 十、企业级 RAG 架构

一个企业 AI 知识库通常是：

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
Hybrid Search
↓
Reranker
↓
LLM
```

技术栈通常是：

Embedding：

* sentence-transformers

Vector DB：

* Milvus
* Qdrant

LLM：

* DeepSeek
* Qwen

---

# 十一、RAG 效果的真实比例

很多人不知道一个真实情况：

RAG 效果通常来自：

| 组件                 | 贡献  |
| ------------------ | --- |
| chunk strategy     | 30% |
| retrieval strategy | 25% |
| reranker           | 20% |
| prompt             | 15% |
| LLM                | 10% |

所以很多企业：

```text
换更大的模型
效果却没变
```

原因就是：

```text
检索没做好
```

---

# 十二、一个 AI 架构师必须知道的事实

真正强的 AI 知识系统（例如企业内部 Copilot）通常不是：

```text
简单 RAG
```

而是：

```text
Advanced RAG
```

包含：

```text
query rewrite
multi query
hybrid search
rerank
context compression
```

---

如果你继续深入 **AI 系统工程**，下一步最重要的一课其实是：

**AI Agent 的核心原理（为什么 LLM 能调用工具）**

因为 Agent 本质是：

```text
LLM
+
Tool
+
Workflow
```

理解这个，你就真正进入 **AI 系统架构层面**了。

# 参考资料

* any list
{:toc}
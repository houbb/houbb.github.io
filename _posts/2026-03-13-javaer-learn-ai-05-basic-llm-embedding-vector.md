---
layout: post
title: javaer 转型 ai 学习之路-05-Embedding + Vector Database 原理（为什么语义搜索成立）
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# Embedding + Vector Database 原理（为什么语义搜索成立）

这一节非常关键。**Embedding + Vector Database** 是几乎所有 **RAG 系统 / AI 搜索 / AI 知识库** 的基础。
很多人会用，但其实没有真正理解 **为什么语义搜索成立**。

我们从工程和数学两个角度讲清楚。

---

# 一、Embedding 的本质

Embedding 的核心思想是：

```text
把“语言”映射到“向量空间”
```

例如：

```text
猫
狗
汽车
飞机
```

经过 embedding 模型后会变成：

```text
猫   → [0.12, -0.55, 0.78, ...]
狗   → [0.10, -0.51, 0.81, ...]
汽车 → [-0.66, 0.23, -0.44, ...]
```

关键性质：

```text
语义相近 → 向量接近
语义不同 → 向量远离
```

所以：

```text
猫 ≈ 狗
猫 ≠ 飞机
```

---

# 二、Embedding 模型是怎么训练的

Embedding 模型的训练目标通常是：

```text
相似文本 → 向量距离更近
不相似文本 → 向量距离更远
```

训练数据示例：

```text
query: "苹果手机"
positive: "iPhone"
negative: "宝马汽车"
```

训练目标：

```text
distance(query, positive) < distance(query, negative)
```

常见训练方式：

```text
contrastive learning
```

损失函数通常类似：

```text
triplet loss
```

直觉理解：

模型在 **学习一个语义空间**。

---

# 三、向量空间（Vector Space）

Embedding 其实是在构建一个 **高维语义空间**。

例如：

```text
dimension = 768
```

每个文本就是：

```text
空间中的一个点
```

示意：

```
           猫
            ●
             \
              \
狗 ●-----------● 狮子

飞机 ●
```

语义接近：

```text
距离更近
```

---

# 四、如何计算向量相似度

最常用的方法是：

```text
cosine similarity
```

公式：

[
\cos(\theta)=\frac{A \cdot B}{|A||B|}
]

\cos(\theta)=\frac{A \cdot B}{|A||B|}

含义：

```text
两个向量夹角越小
相似度越高
```

范围：

```text
-1 ～ 1
```

通常：

```text
0.8+  非常相似
0.6+  相似
0.4+  有点关系
```

---

# 五、语义搜索为什么成立

传统搜索：

```text
关键词匹配
```

例如：

搜索：

```text
苹果手机
```

只能找到：

```text
苹果手机
```

但找不到：

```text
iPhone
```

---

语义搜索流程：

```
用户问题
↓
Embedding
↓
向量
↓
Vector Search
↓
最相似文档
```

例如：

用户搜索：

```text
苹果手机
```

Embedding：

```text
[0.21, -0.88, ...]
```

数据库中：

```text
iPhone
```

Embedding：

```text
[0.19, -0.83, ...]
```

向量距离很近：

```text
检索成功
```

---

# 六、Vector Database 是干什么的

如果只有 **100 条数据**：

可以直接算相似度。

但如果：

```text
1亿向量
```

逐个计算：

```text
O(N)
```

会非常慢。

所以需要 **Vector Database**。

它的作用：

```text
快速找到最相似向量
```

这叫：

```text
ANN (Approximate Nearest Neighbor)
```

---

# 七、ANN 的核心思想

ANN 的目标是：

```text
用很少计算
找到大概率最相似向量
```

而不是：

```text
完全精确
```

因为：

```text
语义搜索允许近似
```

---

# 八、常见 ANN 算法

最常见的是：

### HNSW

```text
Hierarchical Navigable Small World
```

核心思想：

```
多层图结构
```

搜索过程：

```
高层粗搜索
↓
低层精搜索
```

类似：

```
地图导航
```

先找城市：

```
北京
```

再找区：

```
海淀
```

再找街道。

---

# 九、Vector Database 架构

典型流程：

```
文档
↓
chunk
↓
embedding
↓
vector db
↓
query embedding
↓
similarity search
↓
top-k 文档
```

这就是 **RAG 检索阶段**。

---

# 十、主流 Vector Database

工程中常见：

| 数据库      | 特点    |
| -------- | ----- |
| Milvus   | 最成熟   |
| Qdrant   | 易用    |
| Weaviate | AI功能多 |

轻量方案：

```
FAISS
Chroma
```

---

# 十一、为什么 RAG 要切 chunk

如果直接 embedding 整篇文档：

```text
信息太多
```

Embedding 会：

```text
语义模糊
```

所以要切：

```text
chunk
```

例如：

```
1000 tokens
```

变成：

```
10 chunks
```

每个：

```
100 tokens
```

这样检索更精准。

---

# 十二、RAG 的完整流程

完整架构：

```
用户问题
↓
query embedding
↓
vector search
↓
top-k 文档
↓
拼接 prompt
↓
LLM
↓
回答
```

核心思想：

```text
让 LLM 看到正确上下文
```

---

# 十三、为什么 RAG 比微调更常用

企业 AI 通常优先：

```
RAG
```

原因：

### 1 数据更新简单

```
更新文档即可
```

---

### 2 成本低

不需要：

```
GPU训练
```

---

### 3 可解释

可以返回：

```
引用来源
```

---

# 十四、一个非常重要的工程认知

RAG 的效果 **70% 取决于检索质量**：

```
embedding model
chunk strategy
retrieval strategy
rerank
```

而不是：

```
LLM大小
```

很多人误以为：

```
模型越大越好
```

其实：

```
检索才是关键
```

---

# 十五、一个 AI 架构师必须理解的结构

所有 AI 知识系统本质是：

```
Embedding System
+
Vector Search
+
LLM
```

架构：

```
数据
↓
Embedding
↓
Vector DB
↓
RAG
↓
LLM
```

---

如果继续深入 **RAG 工程实践**，下一步最重要的是理解：

**RAG 系统的 8 个核心优化点**（这是 AI 工程里最实用的知识）。

例如：

```
chunk 策略
hybrid search
rerank
context compression
query rewrite
multi-hop retrieval
```

这些技术基本决定了 **企业 AI 知识库的效果上限**。




# 参考资料

* any list
{:toc}
---
layout: post
title: javaer 转型 ai 学习之路-04-基础知识 LLM 的内部计算流程完整走一遍
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# LLM 的内部计算流程完整走一遍

很好。接下来我们把 **LLM 的内部计算流程完整走一遍**。
理解这一节，你会彻底明白：

* 为什么 **Prompt 有作用**
* 为什么 **RAG 可以增强知识**
* 为什么 **上下文长度重要**
* 为什么 **Agent 可以调用工具**

整个流程其实可以概括为：

```text
文本 → Token → Embedding → Transformer → 概率 → 采样 → 新Token
```

我们一步一步拆开。

---

# 一、Step1：Tokenization（文本 → Token）

LLM 不能直接处理文本字符串。

第一步是 **Tokenizer**。

例如输入：

```text
今天天气很好，我们去公园散步。
```

可能被拆成：

```text
今天 | 天气 | 很 | 好 | ， | 我们 | 去 | 公园 | 散步 | 。
```

然后变成 **token id**：

```text
[3142, 5521, 77, 921, 13, 993, 221, 4420, 7710, 9]
```

注意：

```text
模型看到的不是文字
而是 token id
```

---

## Tokenization 的重要性

Token 决定了：

* 成本（API 按 token 收费）
* 上下文长度
* 推理速度

例如：

英文：

```text
Hello world
```

可能：

```text
2 tokens
```

中文：

```text
你好世界
```

可能：

```text
4 tokens
```

所以中文 **token 成本通常更高**。

---

# 二、Step2：Embedding（Token → 向量）

Token id 只是一个数字。

神经网络需要 **向量表示**。

例如：

```text
token = "猫"
```

embedding：

```text
[0.21, -0.83, 0.44, ...]
```

维度通常：

```text
768
1024
4096
```

这叫：

```text
token embedding
```

核心性质：

```text
语义相近 → 向量相近
```

例如：

```
猫 ≈ 狗
猫 ≠ 飞机
```

这也是为什么：

```text
向量数据库可以做语义搜索
```

（RAG 的基础）

---

# 三、Step3：位置编码（Position Encoding）

Transformer **不知道顺序**。

例如：

```
猫吃鱼
鱼吃猫
```

如果没有顺序：

```
猫 鱼 吃
```

语义完全不同。

所以需要：

```text
position embedding
```

例如：

```
token_embedding + position_embedding
```

最终输入向量：

```
input_vector = token_embedding + position_embedding
```

---

# 四、Step4：Self-Attention（最核心）

Transformer 的核心是 **Self-Attention**。

来自论文：

Attention Is All You Need

---

## Attention 的直觉理解

当模型处理一个 token 时：

```text
会看所有其他 token
并决定关注谁
```

例如句子：

```
小明把书放在桌子上，因为它太重了
```

当处理：

```
它
```

模型会计算：

```
它 ↔ 小明
它 ↔ 书
它 ↔ 桌子
```

attention 权重可能：

```
小明 0.1
书   0.7
桌子 0.2
```

所以模型理解：

```
它 = 书
```

---

## Attention 的数学结构

每个 token 会产生三个向量：

```
Query (Q)
Key   (K)
Value (V)
```

attention 公式：

[
Attention(Q,K,V)=softmax(\frac{QK^T}{\sqrt{d_k}})V
]

Attention(Q,K,V)=\mathrm{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V

含义：

1. Q 和 K 计算相似度
2. 得到注意力权重
3. 用权重加权 V

结果：

```text
得到新的 token 表示
```

---

# 五、Step5：Multi-Head Attention

一个 attention 不够。

所以 transformer 使用：

```text
Multi-Head Attention
```

例如：

```
8 heads
16 heads
32 heads
```

不同 head 关注不同关系：

```
语法
语义
指代
逻辑
```

最后再拼接：

```
concat(head1, head2, ...)
```

---

# 六、Step6：Transformer Layers

LLM 不是一层 attention。

而是：

```
Transformer Block × N
```

例如：

| 模型    | 层数   |
| ----- | ---- |
| GPT-2 | 48   |
| GPT-3 | 96   |
| 现代模型  | 100+ |

每一层都在：

```
重新理解上下文
```

逐渐形成：

```
深层语义理解
```

---

# 七、Step7：输出概率（Logits）

最后一层会输出：

```
vocabulary size
```

例如词表：

```
50,000 tokens
```

模型输出：

```
[0.001, 0.002, 0.05, ...]
```

表示：

```
每个 token 的概率
```

---

# 八、Step8：Sampling（采样）

这时就用到上一节讲的参数：

```
temperature
top_p
top_k
```

最终选一个 token：

```
next_token
```

例如：

```
天气很好，我们去公园
```

模型可能预测：

```
散步
玩
跑步
```

选择一个。

---

# 九、Step9：循环生成

生成 token 后：

```
加入上下文
```

再重新计算：

```
预测下一个 token
```

直到：

```
stop token
max_tokens
```

---

# 十、完整流程图

LLM 推理完整流程：

```
文本输入
   ↓
Tokenization
   ↓
Embedding
   ↓
Position Encoding
   ↓
Transformer Layers
   ↓
Attention
   ↓
Logits
   ↓
Sampling
   ↓
生成 Token
   ↓
循环
```

---

# 十一、为什么 Prompt 会生效（关键理解）

Prompt 其实就是：

```
输入 token
```

模型会把 Prompt 当成：

```
上下文
```

例如：

```
你是一个Java专家
```

模型在预测 token 时：

```
attention 会关注这句话
```

所以回答会：

```
偏向 Java 专家风格
```

---

# 十二、为什么 RAG 有用

RAG 本质是：

```
把知识插入 Prompt
```

例如：

```
Context:
OpenAI founded in 2015

Question:
OpenAI 什么时候成立？
```

模型看到：

```
2015
```

就能回答。

---

# 十三、为什么上下文长度重要

因为 attention 只能看到：

```
context window
```

例如：

```
128k tokens
```

超过：

```
旧内容会被截断
```

---

# 十四、一个非常重要的工程理解

LLM **不会真正“思考”**。

它做的是：

```
模式匹配 + 概率预测
```

但因为训练数据极大：

```
表现出类似推理能力
```

---

# 下一步建议学习

现在你已经理解：

```
LLM内部结构
```

接下来最重要的是学习：

**Embedding 和向量数据库（RAG 的基础）**

因为：

```
90% 企业 AI 项目
都是 RAG
```

下一节我可以给你讲：

**Embedding + Vector Database 原理（为什么语义搜索成立）**

这部分其实非常关键，也是 AI 工程师最核心技能之一。



# 参考资料

* any list
{:toc}
---
layout: post
title: javaer 转型 ai 学习之路-02-基础知识 LLM（Large Language Model）
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# 第 1 个月：LLM 基础

很好。学习 **LLM（Large Language Model）** 时，不建议一开始就钻进深度学习细节，而是先建立 **正确的心智模型（mental model）**。
我会用 **工程师视角**把 LLM 的核心拆成几个逐步理解的模块。

今天先打基础：**LLM 的 5 个核心概念**。

---

# 一、LLM 本质：预测下一个 Token

所有大模型的核心其实非常简单：

> **根据已有文本，预测下一个 token。**

数学形式可以写成：

[
P(x_t \mid x_1, x_2, ..., x_{t-1})
]

P(x_t \mid x_1, x_2, \ldots, x_{t-1})

意思是：

```text
根据前面所有 token
预测下一个 token 的概率
```

举个例子：

输入：

```
今天天气很
```

模型内部可能预测：

```
好    0.35
热    0.25
冷    0.18
不错  0.12
```

然后随机采样一个。

继续：

```
今天天气很好
```

再预测下一个 token。

这就是 **生成文本的全过程**。

---

# 二、Token（最重要概念）

LLM 处理的不是“字”或“词”，而是 **Token**。

Token 可以是：

```
字
词
子词
符号
```

例如：

句子：

```
ChatGPT is amazing
```

可能被拆成：

```
Chat
G
PT
 is
 amazing
```

中文：

```
人工智能改变世界
```

可能拆成：

```
人工
智能
改变
世界
```

大模型其实看到的是：

```
[1023, 8872, 3455, 9123]
```

这些是 **token id**。

---

# 三、Embedding（向量化）

token 不能直接被神经网络处理。

所以需要变成 **向量（embedding）**。

例如：

```
猫 → [0.12, -0.33, 0.98, ...]
狗 → [0.15, -0.30, 0.95, ...]
汽车 → [-0.88, 0.71, -0.44, ...]
```

关键性质：

```
语义相近 → 向量接近
```

例如：

```
猫 ≈ 狗
猫 ≠ 飞机
```

embedding 是：

> **语言的数学表示**

---

# 四、Transformer（LLM核心结构）

大模型几乎全部基于一个架构：

Attention Is All You Need

Transformer 的核心思想是：

> **Attention（注意力）**

模型在理解一个词时，会“关注”其他相关词。

例如：

句子：

```
小明把书放在桌子上，因为它太重了
```

“它”指的是谁？

模型通过 attention 发现：

```
它 → 书
```

因为语义最相关。

---

# 五、Context Window（上下文窗口）

LLM 不是无限记忆。

它只能看到一定数量的 token：

例如：

```
8k tokens
32k tokens
128k tokens
```

这叫：

```
context window
```

如果对话太长：

```
旧内容会被截断
```

这也是为什么：

* 聊天会“忘记”
* RAG 要检索知识

---

# 六、LLM 推理流程（完整）

把上面串起来：

```
文本输入
↓
Tokenization
↓
Embedding
↓
Transformer layers
↓
Next token probability
↓
采样
↓
生成 token
↓
循环
```

简化流程：

```
Text
↓
Token
↓
Vector
↓
Transformer
↓
Next token
```

---

# 七、为什么 LLM 会“幻觉”（Hallucination）

原因很简单：

模型做的是：

```
概率预测
```

不是：

```
事实查询
```

所以当知识不足时：

模型会生成 **最可能的文本**。

例如：

问：

```
张三是哪一年获得诺贝尔奖？
```

如果没有这个人：

模型可能编造。

---

# 八、LLM 的三种能力来源

大模型能力来自三部分：

```
1 预训练（互联网数据）
2 指令微调（instruction tuning）
3 RLHF（人类反馈强化学习）
```

经典例子：

* ChatGPT
* Claude
* DeepSeek
* Qwen

---

# 九、LLM 能力边界（必须理解）

LLM **不擅长**：

```
精确计算
长逻辑推理
最新知识
复杂规划
```

所以需要：

```
RAG
Agent
Tool
```

这也是 AI 工程存在的原因。

---

# 十、一个最重要的工程理解

作为工程师要理解：

LLM 本质是：

```
概率文本生成器
```

而 AI 系统其实是：

```
LLM
+ 工具
+ 数据
+ 记忆
+ workflow
```

这就是为什么：

```
RAG
Agent
AI Platform
```

非常重要。

---

如果继续往下学，**下一步最重要的知识其实不是 Transformer**，而是：

**LLM 的 6 个关键运行参数**（几乎决定模型行为）：

```
temperature
top_p
top_k
max_tokens
stop
seed
```





# 参考资料

* any list
{:toc}
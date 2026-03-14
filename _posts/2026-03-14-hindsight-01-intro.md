---
layout: post
title: Hindsight：像人类记忆一样工作的 Agent 记忆系统
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, rag, sh]
published: true
---

# Hindsight

**Hindsight：像人类记忆一样工作的 Agent 记忆系统**

---

# 什么是 Hindsight？

**Hindsight™ 是一个 Agent 记忆系统**，用于构建能够随着时间不断学习的更智能的 Agent。

它解决了许多替代技术（例如 **RAG 和知识图谱**）存在的不足，并在 **长期记忆任务** 上提供了最先进的性能。 ([GitHub][1])

Hindsight 旨在解决 AI 工程师在构建自动化任务和对话式 Agent 时遇到的一些常见问题，其中许多问题都源于 **缺乏长期记忆能力**。 ([GitHub][1])

常见问题包括：

### 不一致（Inconsistency）

Agent 可能一次成功完成任务，但下次再执行同样任务时却失败。

记忆机制让 Agent 能够记住：

* 哪些方法有效
* 哪些方法无效

从而减少错误并提高一致性。

---

### 幻觉（Hallucinations）

长期记忆可以通过引入外部知识来增强 Agent 的行为，使其基于可靠来源，而不仅仅依赖训练数据。

---

### 认知过载（Cognitive Overload）

随着工作流复杂度增加：

* 检索结果
* 工具调用
* 用户消息
* Agent 回复

会迅速占满 **上下文窗口**，导致“上下文腐败（context rot）”。

短期记忆优化可以：

* 减少 token 消耗
* 移除不相关信息
* 保持上下文聚焦。

---

# Hindsight 与其他记忆系统有什么不同？

大多数 Agent 记忆系统依赖：

* 基础 **向量搜索**
* 或 **知识图谱**

而 Hindsight 使用 **仿生数据结构（biomimetic data structures）** 来组织记忆，使其更接近人类的记忆方式。 ([GitHub][1])

记忆被分为四种类型：

### World（世界知识）

关于世界的事实，例如：

> “炉子会变热”

---

### Experiences（经验）

Agent 自身经历，例如：

> “我碰了炉子，很痛”

---

### Opinion（观点）

带有置信度的信念，例如：

> “我不应该再碰炉子”
> 置信度：0.99

---

### Observation（观察）

通过反思事实和经验形成的复杂模型，例如：

> “卷发棒、烤箱、火也会很热，我不应该碰它们”

---

# 记忆存储方式

在 Hindsight 中，记忆存储在 **Memory Bank（记忆库）** 中。

当记忆被添加时：

* 会进入 **世界知识路径** 或 **经验路径**
* 同时被表示为：

  * 实体（Entities）
  * 关系（Relationships）
  * 时间序列（Time Series）

并使用：

* 稀疏向量
* 稠密向量

帮助后续检索。 ([GitHub][1])

---

# 与系统交互的三个核心操作

Hindsight 提供三个核心方法：

### Retain

存储信息（让系统记住）。

---

### Recall

从记忆库中检索信息。

---

### Reflect

对记忆进行反思，从已有记忆中生成新的洞察。

---

# 会学习的 Agent 记忆

Hindsight 的核心目标是：

**让 Agent 能够随着时间学习并不断改进。**

这是通过 `reflect` 操作实现的。

例如：

一个产品支持 Agent 正在帮助用户排查问题。

过程：

1. Agent 调用了 `search-documentation` 工具
2. 发现返回的文档并不是正确产品的文档
3. 这成为一次 **经验记忆**

随着经验积累，`reflect` 操作可以帮助 Agent：

* 总结哪些方法有效
* 哪些方法失败
* 下次应该如何处理类似问题。 ([GitHub][1])

---

# 记忆性能与准确率

Hindsight 在 **LongMemEval 基准测试**中达到了最先进性能。 ([GitHub][1])

该基准用于评估对话式 AI 的长期记忆能力。

研究结果表明：

* Hindsight 在多个模型上达到 **SOTA**
* 在某些测试中准确率超过 **90%**。 ([AICompetence.org][2])

---

# 快速开始

推荐使用 Docker 运行：

```bash
export OPENAI_API_KEY=your-key

docker run --rm -it --pull always -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
  -e HINDSIGHT_API_LLM_MODEL=o3-mini \
  -v $HOME/.hindsight-docker:/home/hindsight/.pg0 \
  ghcr.io/vectorize-io/hindsight:latest
```

访问：

```
API: http://localhost:8888
UI: http://localhost:9999
```

---

# 客户端安装

Python：

```bash
pip install hindsight-client -U
```

Node.js：

```bash
npm install @vectorize-io/hindsight-client
```

---

# Python 示例

```python
from hindsight_client import Hindsight

client = Hindsight(base_url="http://localhost:8888")

# Retain：存储记忆
client.retain(bank_id="my-bank", content="Alice works at Google as a software engineer")

# Recall：检索记忆
client.recall(bank_id="my-bank", query="What does Alice do?")

# Reflect：反思并生成洞察
client.reflect(bank_id="my-bank", query="Tell me about Alice")
```

---

# 系统架构

## Retain（存储）

用于向系统写入新记忆。

系统会自动：

* 提取事实
* 提取实体
* 提取关系
* 识别时间信息

并将这些数据规范化为：

* 实体
* 时间序列
* 搜索索引。

---

## Recall（检索）

检索过程会并行执行四种策略：

1. 语义搜索（向量相似度）
2. 关键词搜索（BM25）
3. 图结构检索（实体关系）
4. 时间过滤

随后：

* 合并结果
* 使用 **Reciprocal Rank Fusion**
* 使用 **cross-encoder rerank**

最终返回最相关的记忆。 ([GitHub][1])

---

## Reflect（反思）

`reflect` 用于深入分析记忆。

它可以：

* 发现记忆之间的关系
* 形成新的观点或观察
* 让 Agent 从经验中学习。

示例场景：

* AI 项目经理分析项目风险
* 销售 Agent 分析哪些营销信息有效
* 客服 Agent 分析文档缺失的知识点。 ([GitHub][1])

---

# 资源

文档：

```
https://hindsight.vectorize.io
```

客户端：

* Python
* Node.js
* REST API
* CLI

社区：

* Slack
* GitHub Issues

---

# 贡献

请查看：

```
CONTRIBUTING.md
```

---

# License

MIT License

---

✅ **一句话总结：**

**Hindsight 是一个专门为 AI Agent 设计的长期记忆系统**，
通过 **retain / recall / reflect** 三个操作，使 Agent 能够像人类一样：

* 记住事实
* 积累经验
* 形成观点
* 通过反思学习。 ([Vectorize][3])

# 参考资料

* any list
{:toc}
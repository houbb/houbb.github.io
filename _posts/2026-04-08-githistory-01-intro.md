---
layout: post 
title: gitHistory 概览
date: 2026-04-08 21:01:55 +0800
categories: [AI]
tags: [ai, llm, skill, gitHistory]
published: true
---

# 业务背景

希望帮我编写一份提示词 git-history-SKILL.md，满足下面的业务场景：

在当前代 git 码仓库下，拉取最近1年的 git 提交历史。

然后让 llm 分析解析每一次 commit，其中用户填写的 commit message 作为理解的辅助。

总结分析出功能点和文件之间的映射关系（隐形知识）

## 理念参考

可以首先学习阐述一下 superMemory、openMemory 这些记忆设计系统的核心理念是如何越做越准的？

让我们的设计思路参考这个，虽然变更次数的增多，分析的也可以更加准。

## 性能问题

最好按照 commit 并行处理，每一次 commit 可以并行处理。这样性能比较好。子 agent 实现。

分析每一次提交涉及的文件，每一个文件的作用（类名语义理解），differ 上下 100 行之类的，找到变更的方便。

llm 解析识别对应的方法信息+方法的核心逻辑

每一个子 agent 的解析结果放在 .gitHistory/commits/ 下面，给出约定的规范，最好是按照 commitHash，然后下面对应每一个文件的信息+类方法信息。整体 commit 的基本信息（时间、提交人、提交信息、hash 等等）

## 结果输出

最后每个子 commit 处理好之后，进行整体的汇总。

按照分类进行总结，给出功能点的分类及相关文件、核心方法、次数、趋势等等比较有价值的分析。

### markdown 

输出一份 markdown 主文件，方便人类阅读审阅

### json

额外输出一份 json 文件，方便后续程序解析

## 重要程度

离现在时间越近的越重要。

变更次数越多的文件越重要。

## 文件排除

类似于 xxxTest 测试类全部忽略掉，无价值

xml properties yaml 这些是有价值的，需要保留

## review

最后的结果完成后，需要对每一个子 agent commit 进行完成度审查

最后的输出结果审查等等，确认正确、准确、有价值


# skills.md

```md
好，这一版我直接给你一个**完全符合 Skill 风格、可执行、可落地的中文版本**。
不讲概念，不讲背景，全部是**约束 + 协议 + 执行步骤**。

---

# 📄 git-history-SKILL.md（中文版 / 可执行版）

---

## 🧩 Skill 名称

`git-history-analyzer`

---

## 🎯 目标（Purpose）

分析当前 Git 仓库最近 1 年的提交历史，构建：

```text
功能（Feature） → 文件（File） → 方法（Method）
```

输出结构化知识，用于：

* 架构理解
* 隐性知识提取
* 变更趋势分析

---

## ⚙️ 输入（Input）

```json
{
  "repoPath": ".",
  "since": "1 year ago"
}
```

---

## 📦 输出（Output）

必须生成以下文件结构：

```bash
.gitHistory/
  ├── commits/
  │     ├── <commitHash>.json
  ├── summary.md
  ├── summary.json
```

---

## 🚫 约束（Constraints）

### 文件过滤

忽略：

```text
*Test*
*Mock*
*Fixture*
```

保留：

```text
.java
.xml
.yaml / .yml
.properties
```

---

### 执行约束

* MUST 使用并行处理 commit
* MUST 使用 diff 上下文：

```bash
--unified=100
```

* MUST 基于 diff 推断逻辑（优先级高于 commit message）
* MUST 保证输出结构稳定（不可随意变化字段）

---

## 🧠 核心规则（Core Rules）

1. 越新的 commit 权重越高
2. 修改次数越多的文件越重要
3. commit message = 弱信号
4. diff = 强信号
5. 所有分析必须可累积（不可覆盖历史认知）

---

# 🚀 执行流程（Execution Plan）

---

## STEP 1：获取提交历史

执行：

```bash
git log --since="{{since}}" --pretty=format:"%H|%an|%ad|%s" --date=iso
```

输出：

```json
[
  {
    "hash": "",
    "author": "",
    "date": "",
    "message": ""
  }
]
```

---

## STEP 2：并行处理 Commit（核心）

对于每一个 commit：

执行：

```bash
git show <hash> --unified=100
```

然后启动 **子 Agent（Sub Agent）**

---

# 🤖 子 Agent 规范（Sub Agent）

---

## 输入

```json
{
  "commit": {
    "hash": "",
    "author": "",
    "date": "",
    "message": ""
  },
  "diff": ""
}
```

---

## 必须完成的任务（MANDATORY）

---

### 1️⃣ 文件提取

识别：

* filePath
* fileType

过滤无效文件（根据约束）

---

### 2️⃣ 类语义分析

推断：

```json
{
  "name": "类名",
  "responsibility": "一句话职责描述",
  "domain": "领域（1个词）"
}
```

---

### 3️⃣ 方法级分析（核心）

必须从 diff 中提取：

```json
{
  "name": "方法名",
  "changeType": "add | modify | delete",
  "logic": "核心逻辑（≤20字）"
}
```

---

### 4️⃣ 功能识别（Feature）

```json
{
  "name": "功能名称",
  "type": "feature | fix | refactor | config",
  "confidence": 0.0-1.0
}
```

规则：

* 必须结合 message + diff
* 不确定 → 降低 confidence

---

### 5️⃣ 提交意图分类

必须归类为：

```text
feature / fix / refactor / config
```

---

## 📁 输出格式（严格）

```json
{
  "commit": {
    "hash": "",
    "author": "",
    "date": "",
    "message": "",
    "type": ""
  },
  "files": [
    {
      "filePath": "",
      "fileType": "",
      "class": {
        "name": "",
        "responsibility": "",
        "domain": ""
      },
      "methods": [
        {
          "name": "",
          "changeType": "",
          "logic": ""
        }
      ]
    }
  ],
  "features": [
    {
      "name": "",
      "confidence": 0.0
    }
  ]
}
```

---

## 💾 保存路径

```bash
.gitHistory/commits/<commitHash>.json
```

---

# 🧠 聚合 Agent（Aggregator）

在所有 commit 处理完成后执行

---

## 必须完成的任务

---

### 1️⃣ Feature 合并

要求：

* 语义相近必须合并
* 统一命名

示例：

```text
订单优化 → 订单增强 → 订单系统（统一）
```

---

### 2️⃣ 构建映射关系

```text
Feature → File → Method
```

---

### 3️⃣ 重要性计算

#### 文件重要性

```text
importance = 修改次数 × 时间权重
```

---

#### Feature 置信度

```text
confidence = 平均置信度 × log(提交次数)
```

---

### 4️⃣ 趋势分析

识别：

* 高频变更模块
* 最近活跃模块
* 稳定模块

---

### 5️⃣ 风险识别

标记：

* 高频 + 最近修改的文件
* 大规模 diff 的 commit

---

# 📄 最终输出

---

## summary.md（人类阅读）

```md
# Git 历史分析报告

## 🔥 核心功能

### 订单系统
- 提交次数：32
- 核心文件：
  - OrderService.java
- 核心方法：
  - createOrder

---

## 📈 趋势

- 最近活跃：
  - 支付模块
- 稳定模块：
  - 用户模块

---

## ⚠️ 风险

- PaymentService.java（高频变更）
```

---

## summary.json（机器使用）

```json
{
  "features": [],
  "files": [],
  "trends": [],
  "risks": []
}
```

---

# ✅ 质量审查（Review，必须执行）

---

## 1️⃣ 子 Agent 校验

检查：

* 是否提取 method
* 是否识别 feature
* 是否存在空字段

---

## 2️⃣ 聚合校验

检查：

* feature 是否重复
* 映射关系是否完整
* 是否存在遗漏

---

## 3️⃣ 输出评分

```json
{
  "completeness": 0.0,
  "accuracy": 0.0,
  "consistency": 0.0
}
```

---

# ♻️ Memory（可选增强）

路径：

```bash
.gitHistory/memory/
```

记录：

* feature 演化
* 文件归属变化

---

# ⚡ 强制执行规则（Execution Rules）

* MUST 并行处理 commit
* MUST 不得虚构方法
* MUST 优先使用 diff
* MUST 输出稳定结构
* MUST 每个 commit 独立分析
```

# 参考资料

* any list
{:toc}
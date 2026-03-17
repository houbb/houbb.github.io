---
layout: post
title: Claude-Mem-04-Smart Explore Benchmark（智能探索基准）
date: 2026-03-16 21:01:55 +0800
categories: [AI]
tags: [ai, memory, sh]
published: true
---

# Smart Explore Benchmark（智能探索基准）

基于 AST 的代码探索与传统方法的 token 效率对比 ([docs.claude-mem.ai](https://docs.claude-mem.ai/smart-explore-benchmark)) ([Claude-Mem][1])

---

## 概述

Smart Explore 使用 tree-sitter 的 AST 解析，通过三个 MCP 工具提供结构化代码导航：

* `smart_search`
* `smart_outline`
* `smart_unfold`

本报告通过与标准 Explore agent（使用 Glob、Grep 和 Read 工具）的严格 A/B 对比，量化 token 节省和质量权衡。 ([Claude-Mem][1])

---

## 执行摘要

| 指标           | Smart Explore  | Explore Agent   | 优势                          |
| ------------ | -------------- | --------------- | --------------------------- |
| 发现（跨文件搜索）    | ~14,200 tokens | ~252,500 tokens | 17.8x 更低成本                  |
| 定向读取（特定符号）   | ~5,650 tokens  | ~109,400 tokens | 19.4x 更低成本                  |
| 端到端（搜索 + 读取） | ~4,200 tokens  | ~45,000 tokens  | 10–12x 更低成本                 |
| 完整性          | 5/5 返回完整源码     | 4/5（最长方法被截断）    | Smart Explore 更可靠           |
| 速度           | 每次调用 <2 秒      | 5–66 秒          | 快 10–30 倍 ([Claude-Mem][1]) |

---

## 方法论

### 测试环境

* 代码库：claude-mem（`src/` 目录，194 个 TypeScript 文件，1206 个符号）
* 模型：Claude Opus 4.6（两种方法一致）
* 计量方式：工具返回的 token 数量（Explore 使用 `total_tokens`，Smart Explore 使用折叠视图估算） ([Claude-Mem][1])

---

### 控制变量

明确要求 Explore agent：

> 不得使用 smart_search / smart_outline / smart_unfold

仅允许：

* Glob
* Grep
* Read

否则会污染对比结果。 ([Claude-Mem][1])

---

### 查询任务

选取 5 个典型探索任务：

1. “session processing” —— 跨多个服务的功能
2. “shutdown” —— 涉及 6+ 文件的基础设施
3. “hook registration” —— 插件架构问题
4. “sqlite database” —— 技术栈检索
5. “worker-service.ts outline” —— 单大文件结构理解 ([Claude-Mem][1])

---

## 第一轮：发现（Discovery）

问题：**“有哪些内容？在哪里？”**

### 结果

| Query                  | Smart Explore | Explore Agent | 倍数    | 调用次数                  |
| ---------------------- | ------------- | ------------- | ----- | --------------------- |
| session processing     | ~4,391        | 51,659        | 11.8x | 15                    |
| shutdown               | ~3,852        | 51,523        | 13.4x | 18                    |
| hook registration      | ~1,930        | 51,688        | 26.8x | 37                    |
| sqlite database        | ~2,543        | 58,633        | 23.1x | 16                    |
| worker-service outline | ~1,500        | 38,973        | 26.0x | 15                    |
| 总计                     | ~14,216       | 252,476       | 17.8x | 101 ([Claude-Mem][1]) |

---

### 返回内容对比

**Smart Explore（每个查询 1 次调用）：**

* Top 10 相关符号（签名 + 行号 + JSDoc）
* 所有匹配文件的结构折叠视图（函数/类/接口）

**Explore Agent（15–37 次调用）：**

* 架构说明
* 设计模式分析
* 数据流解释
* 文件结构总结
* 大量解释性文本 ([Claude-Mem][1])

---

### 分析

* 窄查询（如 hook registration）差距最大（26.8x）
* 广查询差距较小（11.8x）
* Smart Explore 成本稳定（固定 1 次调用）
* Explore 成本随读取文件数波动（15–37 次调用） ([Claude-Mem][1])

---

## 第二轮：定向读取（Targeted Reads）

问题：**“给我这个函数的实现”**

### 结果

| 符号                         | Smart Unfold | Explore Agent | 倍数    | 完整性                   |
| -------------------------- | ------------ | ------------- | ----- | --------------------- |
| initializeSession          | ~1,800       | 27,816        | 15.5x | 都完整                   |
| performGracefulShutdown    | ~700         | 19,621        | 28.0x | 都完整                   |
| hookCommand                | ~650         | 18,680        | 28.7x | 都完整                   |
| DatabaseManager.initialize | ~400         | 22,334        | 55.8x | 都完整                   |
| startSessionProcessor      | ~2,100       | 20,906        | 10.0x | Smart 完整 / Explore 截断 |
| 总计                         | ~5,650       | 109,357       | 19.4x | — ([Claude-Mem][1])   |

---

### 分析

* 函数越小，差距越大（因为 Explore 会读整个文件）
* Smart Explore 按 AST 提取，保证完整性
* Explore 可能截断（长函数）
* 对于“已知符号”的读取，Explore 的额外成本几乎是纯浪费 ([Claude-Mem][1])

---

## 组合工作流（Combined Workflow）

现实流程：**先发现 → 再读取**

### Smart Explore

```
smart_search("shutdown")      ~3,852 tokens
smart_unfold(...)            ~700 tokens
总计：~4,552 tokens（2 次调用，<3 秒）
```

---

### Explore Agent

```
"Find and explain shutdown logic" ~51,523 tokens
总计：~51,523 tokens（18 次调用，约 43 秒）
```

---

端到端：**11.3x token 节省**

* Smart Explore：返回源码
* Explore：返回解释性文本 ([Claude-Mem][1])

---

## 质量评估

两者并非绝对优劣，而是优化方向不同。

---

### Smart Explore 优势

* 成本可预测（1 次调用）
* 返回完整源码（AST 保证）
* 提供结构视图
* 响应极快（亚秒级）
* 工具可组合 ([Claude-Mem][1])

---

### Explore Agent 优势

* 能生成架构级理解
* 跨文件综合分析
* 输出类似文档
* 能解释设计决策
* 无需先验信息 ([Claude-Mem][1])

---

### 不同任务的最佳选择

| 任务          | 更优方案          | 原因                      |
| ----------- | ------------- | ----------------------- |
| “X 在哪里定义？”  | Smart Explore | 精确定位                    |
| “文件里有哪些函数？” | Smart Explore | 结构化返回                   |
| “展示这个函数”    | Smart Explore | 完整源码                    |
| “功能是如何工作的？” | Explore Agent | 跨文件分析                   |
| “用了什么设计模式？” | Explore Agent | 需要解释                    |
| “理解整个代码库”   | Explore Agent | 文档级输出 ([Claude-Mem][1]) |

---

## 使用建议

### 使用 Smart Explore

* 已知目标（函数 / 文件 / 概念）
* 需要源码而不是解释
* 快速迭代
* token 预算敏感
* 查看结构 ([Claude-Mem][1])

---

### 使用 Explore Agent

* 需要整体理解
* 问题开放
* 编写文档
* 需要理解“为什么” ([Claude-Mem][1])

---

### 混合使用（最佳实践）

* 先 Smart Explore 做导航
* 再用 Explore 做深度分析
  → 同时兼顾成本与理解 ([Claude-Mem][1])

---

## Token 经济学参考

| 操作            | Token    | 场景                     |
| ------------- | -------- | ---------------------- |
| smart_search  | 2k–6k    | 跨文件搜索                  |
| smart_outline | 1k–2k    | 文件结构                   |
| smart_unfold  | 400–2100 | 单函数源码                  |
| 组合            | 3k–8k    | 查找 + 读取                |
| Explore（定向）   | 18k–28k  | 单函数解释                  |
| Explore（跨文件）  | 39k–59k  | 架构理解                   |
| Read（全文件）     | 8k–15k+  | 完整文件 ([Claude-Mem][1]) |

---

## 工作流节省对比

| 场景      | Smart Explore | 传统方式    | 节省                   |
| ------- | ------------- | ------- | -------------------- |
| 理解一个文件  | ~3,100        | ~12,000 | 4x                   |
| 查找函数    | ~3,500        | ~50,000 | 14x                  |
| 查找+读取函数 | ~4,500        | ~50,000 | 11x                  |
| 浏览大文件   | ~1,500        | ~12,000 | 8x ([Claude-Mem][1]) |



# 参考资料

* any list
{:toc}
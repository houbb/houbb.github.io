---
layout: post
title: Claude-Mem-03-Progressive Disclosure（渐进式披露）
date: 2026-03-16 21:01:55 +0800
categories: [AI]
tags: [ai, memory, sh]
published: true
---

# Progressive Disclosure（渐进式披露）

Claude-Mem 的上下文预加载哲学 ([docs.claude-mem.ai][1])

---

## 核心原则

先展示“有哪些内容”以及“获取成本”，让 agent 根据相关性和需求自行决定获取哪些内容。 ([docs.claude-mem.ai][1])

---

## 什么是渐进式披露？

渐进式披露是一种信息架构模式：**逐步揭示复杂性，而不是一次性全部展示**。

在 AI agent 场景中，它意味着：

1. 第 1 层（索引）：展示轻量级元数据（标题、日期、类型、token 数量）
2. 第 2 层（详情）：仅在需要时获取完整内容
3. 第 3 层（深入）：必要时读取原始文件

这与人类的行为方式一致：先浏览标题，再读文章；先看目录，再读章节；先看文件名，再打开文件。 ([docs.claude-mem.ai][1])

---

## 问题：上下文污染（Context Pollution）

传统 RAG（检索增强生成）系统会在一开始加载所有内容：

```
❌ 传统方式：

Session Start

[15,000 tokens 历史会话]
[8,000 tokens 观测数据]
[12,000 tokens 文件摘要]

总计：35,000 tokens
相关内容：约 2,000 tokens（6%）
```

问题：

* 94% 的注意力预算被浪费在无关内容上
* 用户 prompt 被淹没在大量历史中
* agent 必须处理全部内容才能理解任务
* 在读取之前无法判断哪些有用 ([docs.claude-mem.ai][1])

---

## Claude-Mem 的解决方案：渐进式披露

```
✅ 渐进式披露方式：

Session Start

50 条观测的索引：~800 tokens
↓
Agent 看到："🔴 Hook timeout issue"
Agent 判断："相关！"
↓
获取 observation #2543：~120 tokens

总计：920 tokens
相关内容：920 tokens（100%）
```

优势：

* agent 控制自身上下文消费
* 内容与当前任务直接相关
* 可按需继续获取
* 可跳过无关内容
* 每次获取都有明确成本/收益 ([docs.claude-mem.ai][1])

---

## 在 Claude-Mem 中的工作方式

### 索引格式

每次 SessionStart 提供一个紧凑索引：

```
### Oct 26, 2025

**General**
| ID | Time | T | Title | Tokens |
|----|------|---|-------|--------|
| #2586 | 12:58 AM | 🔵 | Context hook file exists but is empty | ~51 |
| #2587 | ″ | 🔵 | Context hook script file is empty | ~46 |
| #2589 | ″ | 🟡 | Investigated hook debug output docs | ~105 |
```

agent 能看到：

* 存在什么（标题提供语义）
* 何时发生（时间）
* 类型（图标分类）
* 获取成本（token 数）
* 获取路径（MCP 工具） ([docs.claude-mem.ai][1])

---

### 图例系统（Legend）

```
🎯 session-request  用户目标
🔴 gotcha          关键坑点
🟡 problem-solution 解决方案
🔵 how-it-works    技术说明
🟢 what-changed    变更
🟣 discovery       发现
🟠 why-it-exists   设计原因
🟤 decision        决策
⚖️ trade-off       权衡
```

作用：

* 支持视觉扫描
* 提供语义分类
* 标识优先级（如 🔴 更重要）
* 跨 session 形成模式识别 ([docs.claude-mem.ai][1])

---

### 渐进式披露指引

索引中包含使用说明：

```
💡 Progressive Disclosure：
- 使用 MCP 工具按需获取详情
- 优先搜索观测，而不是重新读代码
- 🔴 / 🟤 / ⚖️ 类型通常值得优先获取
```

作用：

* 教会 agent 使用模式
* 指导何时获取
* 提升效率
* 系统自解释化 ([docs.claude-mem.ai][1])

---

## 核心哲学：上下文即货币（Context as Currency）

### 心智模型：Token = 钱

| 方式     | 比喻            | 结果     |
| ------ | ------------- | ------ |
| 全部加载   | 把工资全买不确定会用的食物 | 浪费、混乱  |
| 什么都不加载 | 一分钱不花         | 无法完成任务 |
| 渐进式披露  | 先盘点，再按需购买     | 高效     |

---

### 注意力预算

* 每个 token 关注所有 token（n²）
* 10 万 token ≠ 有效注意力
* 上下文会“腐化”
* 后面的 token 注意力更低

Claude-Mem 方法：

* 初始约 1000 tokens 索引
* 保留大部分预算用于任务
* 按需获取少量内容 ([docs.claude-mem.ai][1])

---

### 为自主性设计（Design for Autonomy）

> “随着模型进化，让它们自主决策”

传统 RAG：

```
系统 → 决定相关性 → Agent
```

渐进式披露：

```
系统 → 展示索引 → Agent → 决定 → 获取
```

agent 知道：

* 当前任务
* 需要什么信息
* 预算如何分配
* 何时停止搜索 ([docs.claude-mem.ai][1])

---

## 实现原则

### 1. 显示成本

每条记录显示 token 数：

```
| ... | ~155 |
```

作用：

* 支持 ROI 决策
* 小内容更易获取
* 大内容需要更强理由 ([docs.claude-mem.ai][1])

---

### 2. 语义压缩（Semantic Compression）

好的标题示例：

```
🔴 Hook timeout issue: 60s default too short for npm install
```

特点：

* 具体
* 可执行
* 自包含
* 可搜索
* 带分类 ([docs.claude-mem.ai][1])

---

### 3. 按上下文分组

分组维度：

* 日期
* 文件路径
* 项目

好处：

* 减少扫描成本
* 符合开发者思维 ([docs.claude-mem.ai][1])

---

### 4. 提供检索工具

可用 MCP 工具：

* `search`：获取索引
* `timeline`：查看上下文
* `get_observations`：获取详情

形成三层流程：
**索引 → 上下文 → 详情** ([docs.claude-mem.ai][1])

---

## 三层工作流

### Layer 1：搜索（索引）

```
search({ query: "hook timeout" })
```

返回简要列表（低成本）

---

### Layer 2：时间线（上下文）

```
timeline({ anchor: 2543 })
```

查看前后关系

---

### Layer 3：详情

```
get_observations({ ids: [...] })
```

获取完整信息 ([docs.claude-mem.ai][1])

---

## 认知负荷理论（Cognitive Load Theory）

### 内在负荷

任务本身的复杂度（不可避免）

---

### 外在负荷

信息组织不当带来的负担

传统 RAG：

* 需要筛选无关信息
* 噪声多

渐进式披露：

* 先扫标题
* 精确获取
* 降低负担

---

### 相关负荷

构建理解模型的努力

渐进式披露通过：

* 结构一致
* 分类清晰
* 标题压缩
* 成本可见

来优化认知过程 ([docs.claude-mem.ai][1])

---

## 反模式（Anti-Patterns）

### ❌ 冗长标题

### ❌ 隐藏成本

### ❌ 没有获取路径

### ❌ 跳过索引层

正确做法：

* 先 search
* 再筛选
* 最后获取少量内容 ([docs.claude-mem.ai][1])

---

## 关键设计决策

### 为什么显示 token 数？

* 表达规模
* 支持预算决策

---

### 为什么用图标？

* 更高效
* 跨语言
* 易识别

---

### 为什么先索引？

* 系统无法比 agent 更懂任务
* 避免错误预取

---

### 为什么按文件分组？

* 空间局部性
* 降低扫描成本 ([docs.claude-mem.ai][1])

---

## 成功指标

### ✅ 低浪费率

```
相关 token / 总 token > 80%
```

---

### ✅ 选择性获取

只获取少量关键内容

---

### ✅ 更快完成任务

---

### ✅ 深度合理

任务越复杂，获取越多 ([docs.claude-mem.ai][1])

---

## 未来优化方向

* 自适应索引大小
* 相关性排序
* 成本预估
* 多层细节结构 ([docs.claude-mem.ai][1])

---

## 核心要点

1. 展示而不是强制加载
2. 成本透明
3. agent 自主决策
4. 标题至关重要
5. 结构一致
6. 先索引后详情
7. 上下文是资源 ([docs.claude-mem.ai][1])

---

## 记住

> “最好的界面是在不需要时消失，在需要时恰好出现。”

渐进式披露尊重 agent 的智能与自主性：
👉 系统提供地图，agent 选择路径 ([docs.claude-mem.ai][1])

# 参考资料

* any list
{:toc}
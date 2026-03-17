---
layout: post
title: Learn Claude Code-01-通过从零构建一个 AI agent，学习现代 AI agent 的工作原理
date: 2026-03-17 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# Learn Claude Code

> 免责声明：这是 shareAI Lab 的一个独立教育项目。它与 Anthropic 无任何关联、未获得其认可或赞助。“Claude Code”是 Anthropic 的商标。

通过从零构建一个 AI agent，学习现代 AI agent 的工作原理。

（中文文档）

---

## 给读者的一点说明

我们创建这个仓库，是出于对 Claude Code 的钦佩——我们认为它是目前世界上能力最强的 AI 编码 agent。

最初，我们试图通过行为观察和推测来对其设计进行逆向工程。我们发布的分析充满了不准确、不可靠的猜测以及技术错误。对此我们向 Claude Code 团队以及被误导的读者深表歉意。

在过去六个月中，通过构建和迭代真实的 agent 系统，我们对“什么构成一个真正的 AI agent”的理解发生了根本性变化。我们希望将这些洞见分享给你。所有先前的推测性内容已被删除，并替换为原创的教学内容。

---

> 兼容 Kode CLI、Claude Code、Cursor，以及任何支持 Agent Skills Spec 的 agent。

---

## 这是什么？

一个渐进式教程，用于揭示（demystify）AI 编码 agent（如 Kode、Claude Code、Cursor Agent）的内部机制。

共 5 个版本，总计约 1100 行代码，每个版本增加一个核心概念：

| 版本 | 行数   | 新增内容        | 核心洞察      |
| -- | ---- | ----------- | --------- |
| v0 | ~50  | 1 个 bash 工具 | Bash 就足够了 |
| v1 | ~200 | 4 个核心工具     | 模型即 Agent |
| v2 | ~300 | Todo 跟踪     | 显式规划      |
| v3 | ~450 | 子 Agent     | 分而治之      |
| v4 | ~550 | Skills      | 按需领域能力    |

---

## 快速开始

```bash
pip install anthropic python-dotenv

# 配置你的 API
cp .env.example .env
# 在 .env 中填写你的 API key

# 运行任意版本
python v0_bash_agent.py   # 最简版本
python v1_basic_agent.py  # 核心 agent 循环
python v2_todo_agent.py   # + Todo 规划
python v3_subagent.py     # + 子 agent
python v4_skills_agent.py # + Skills
```

---

## 核心模式（Core Pattern）

每一个编码 agent，本质上就是下面这个循环：

```python
while True:
    response = model(messages, tools)
    if response.stop_reason != "tool_use":
        return response.text
    results = execute(response.tool_calls)
    messages.append(results)
```

就是这么简单。
模型不断调用工具直到完成任务，其他一切只是优化与演进。

---

## 文件结构

```
learn-claude-code/
├── v0_bash_agent.py       # ~50 行：1 个工具，递归子 agent
├── v0_bash_agent_mini.py  # ~16 行：极致压缩版本
├── v1_basic_agent.py      # ~200 行：4 个工具，核心循环
├── v2_todo_agent.py       # ~300 行：+ TodoManager
├── v3_subagent.py         # ~450 行：+ Task 工具，agent 注册表
├── v4_skills_agent.py     # ~550 行：+ Skill 工具，SkillLoader
├── skills/                # 示例 skills（用于学习）
└── docs/                  # 详细说明（英文 + 中文）
```

---

## 使用 Agent Builder Skill

该仓库包含一个“元技能（meta-skill）”，用于教 agent 如何构建 agent：

```bash
# 创建一个新的 agent 项目骨架
python skills/agent-builder/scripts/init_agent.py my-agent

# 或指定复杂度等级
python skills/agent-builder/scripts/init_agent.py my-agent --level 0  # 最简
python skills/agent-builder/scripts/init_agent.py my-agent --level 1  # 默认（4 tools）
```

---

## 在生产环境中安装 Skills

```bash
# Kode CLI（推荐）
kode plugins install https://github.com/shareAI-lab/shareAI-skills

# Claude Code
claude plugins install https://github.com/shareAI-lab/shareAI-skills
```

完整的生产级 skills 见 shareAI-skills 仓库。

---

## 核心概念

### v0：Bash 就是一切

一个工具。通过递归自调用实现子 agent。证明核心可以极其简单。

---

### v1：模型即 Agent

4 个工具（bash、read、write、edit）。
一个函数实现完整 agent。

---

### v2：结构化规划

通过 Todo 工具让计划显式化。
通过约束支持复杂任务。

---

### v3：子 Agent 机制

Task 工具可以生成隔离的子 agent。
上下文保持干净。

---

### v4：Skills 机制

通过 `SKILL.md` 文件按需提供领域能力。
知识成为一等公民（first-class citizen）。

---

## 深入解析（Deep Dives）

技术教程（docs/）：

| 英文                       | 中文            |
| ------------------------ | ------------- |
| v0: Bash is All You Need | v0: Bash 就是一切 |
| v1: Model as Agent       | v1: 模型即代理     |
| v2: Structured Planning  | v2: 结构化规划     |
| v3: Subagent Mechanism   | v3: 子代理机制     |
| v4: Skills Mechanism     | v4: Skills 机制 |

---

## 原始文章（articles/）

仅中文（偏社交媒体风格）：

* v0文章 | v1文章 | v2文章 | v3文章 | v4文章
* 上下文缓存经济学（Context Caching Economics for Agent Developers）

---

## 相关项目

| 仓库                | 作用                   |
| ----------------- | -------------------- |
| Kode              | 全功能开源 agent CLI（生产级） |
| shareAI-skills    | 生产级 skills 集合        |
| Agent Skills Spec | 官方规范                 |

---

## 作为模板使用

Fork 并定制你的 agent 项目：

```bash
git clone https://github.com/shareAI-lab/learn-claude-code
cd learn-claude-code

# 从任意版本开始
cp v1_basic_agent.py my_agent.py
```

---

## 设计哲学（Philosophy）

> 模型占 80%，代码占 20%。

像 Kode 和 Claude Code 这样的现代 agent 能成功，并不是因为工程技巧多么高明，而是因为模型本身被训练成了 agent。

我们的工作，是提供工具，然后尽量不要干扰它。

---

## License

MIT

---

## 核心总结

**模型即 Agent。这就是全部秘密。**

# 参考资料

* any list
{:toc}
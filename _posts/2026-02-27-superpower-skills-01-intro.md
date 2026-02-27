---
layout: post
title: Superpowers 是一套完整的软件开发工作流，用于编码 Agent（Coding Agent）。
date: 2026-01-20 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---

# Superpowers

Superpowers 是一套完整的软件开发工作流，用于编码 Agent（Coding Agent）。
它构建在一组可组合的「技能（skills）」之上，并结合了一些初始指令，以确保你的 Agent 会正确使用这些技能。

---

## 工作原理

整个流程从你启动编码 Agent 的那一刻开始。

当 Agent 发现你正在构建某个系统时，它**不会**立刻开始编写代码。相反，它会先退一步，询问你真正想要实现的目标。

当它从对话中逐步提炼出需求规格（spec）后，会将设计内容拆分为足够短的小块展示给你，使其真正可阅读、可理解。

在你确认设计方案之后，Agent 会制定一份实现计划。这份计划的清晰程度足以让一位：

* 充满热情但经验不足的初级工程师
* 审美较差
* 缺乏判断力
* 不了解项目上下文
* 且不喜欢写测试

也能够严格按照步骤执行。

该流程强调：

* 真正的 Red/Green TDD
* YAGNI（You Aren't Gonna Need It，不做当前不需要的功能）
* DRY（Don't Repeat Yourself，避免重复）

接下来，当你说「开始」后，系统会启动 **subagent-driven-development（子 Agent 驱动开发）** 流程：

多个 Agent 会分别执行工程任务，对彼此的工作进行检查与评审，并持续推进开发流程。在实践中，Claude 通常可以连续数小时自主工作，同时仍然严格遵循既定计划。

系统中还有更多机制，但以上构成了其核心。

由于所有技能都会自动触发，你无需进行额外操作——你的编码 Agent 将直接拥有 Superpowers。

---

## 赞助

如果 Superpowers 帮助你完成了产生商业价值的工作，并且你愿意支持项目维护者，欢迎考虑赞助其开源工作：

[https://github.com/sponsors/obra](https://github.com/sponsors/obra)

感谢支持！

— Jesse

---

## 安装

**注意：** 不同平台的安装方式不同。

* Claude Code 与 Cursor 内置插件市场
* Codex 与 OpenCode 需要手动安装

---

### Claude Code（通过插件市场）

首先注册插件市场：

```bash
/plugin marketplace add obra/superpowers-marketplace
```

随后安装插件：

```bash
/plugin install superpowers@superpowers-marketplace
```

#### 安装确认

装完输入 `/help`，能看到 `/superpowers:brainstorm`、`/superpowers:write-plan` 等命令就成功了。


### Cursor（通过插件市场）

在 Cursor Agent 聊天窗口中执行：

```text
/plugin-add superpowers
```

---

### Codex

向 Codex 输入：

```
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.codex/INSTALL.md
```

详细文档：

docs/README.codex.md

---

### OpenCode

向 OpenCode 输入：

```
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
```

详细文档：

docs/README.opencode.md

---

### 验证安装

在所选平台中新建会话，并提出一个会触发技能的请求，例如：

* “帮我规划这个功能”
* “一起调试这个问题”

Agent 应当自动调用对应的 Superpowers 技能。

---

## 基础工作流

1. **brainstorming（头脑风暴）**
   在编写代码前触发。通过提问细化想法，探索替代方案，并分段展示设计以供确认，同时保存设计文档。

2. **using-git-worktrees**
   在设计批准后触发。创建独立分支工作区，完成项目初始化，并验证测试基线干净可用。

3. **writing-plans**
   基于已批准设计触发。将工作拆分为可在 2–5 分钟完成的微任务，每个任务包含：

   * 精确文件路径
   * 完整代码
   * 验证步骤

4. **subagent-driven-development / executing-plans**
   在计划确定后触发。为每个任务分配独立子 Agent，并进行两阶段评审：

   * 是否符合规格
   * 代码质量检查
     或以批处理方式执行，并在人类检查点暂停。

5. **test-driven-development**
   在实现阶段触发。强制执行 RED-GREEN-REFACTOR：

   * 编写失败测试
   * 确认测试失败
   * 编写最小实现代码
   * 测试通过
   * 提交代码
     在测试之前编写的代码会被删除。

6. **requesting-code-review**
   在任务之间触发。根据计划进行审查，并按严重等级报告问题。严重问题会阻止流程继续。

7. **finishing-a-development-branch**
   所有任务完成后触发。验证测试结果，并提供：

   * 合并
   * 创建 PR
   * 保留分支
   * 丢弃分支
     同时清理 worktree。

**Agent 在执行任何任务前都会检查可用技能。**
这些是强制流程，而非建议。

---

## 内部组成

### Skills（技能库）

#### 测试

* **test-driven-development**
  RED-GREEN-REFACTOR 循环（包含测试反模式参考）

---

#### 调试

* **systematic-debugging**
  四阶段根因分析流程（包含根因追踪、防御式设计、基于条件等待等技术）

* **verification-before-completion**
  确保问题真正被修复

---

#### 协作

* **brainstorming** —— 苏格拉底式设计推导
* **writing-plans** —— 详细实现计划
* **executing-plans** —— 带检查点的批量执行
* **dispatching-parallel-agents** —— 并行子 Agent 工作流
* **requesting-code-review** —— 预审查检查清单
* **receiving-code-review** —— 处理评审反馈
* **using-git-worktrees** —— 并行开发分支
* **finishing-a-development-branch** —— Merge / PR 决策流程
* **subagent-driven-development** —— 双阶段评审的快速迭代开发

---

#### 元能力（Meta）

* **writing-skills**
  按最佳实践创建新技能（包含测试方法论）

* **using-superpowers**
  技能系统介绍

---

## 设计哲学

* **测试驱动开发（TDD）** —— 始终先写测试
* **系统化优于临时处理** —— 流程优于猜测
* **降低复杂度** —— 简单性是首要目标
* **证据优于声明** —— 在宣告成功前必须验证

更多内容：

[https://blog.fsck.com/2025/10/09/superpowers/](https://blog.fsck.com/2025/10/09/superpowers/)

---

## 贡献方式

所有技能直接存放于本仓库中。

贡献流程：

1. Fork 仓库
2. 为你的技能创建分支
3. 按照 `writing-skills` 技能创建并测试新技能
4. 提交 PR

完整指南见：

skills/writing-skills/SKILL.md

---

## 更新

更新插件时，技能会自动更新：

```bash
/plugin update superpowers
```

---

## License

MIT License
详见 LICENSE 文件。

---

## 支持

Issues：
[https://github.com/obra/superpowers/issues](https://github.com/obra/superpowers/issues)

Marketplace：
[https://github.com/obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace)

# 什么时候会使用？

## 何时会自动触发 skills

不会随意自动触发。只有当一个 skill 明确适用于当前任务时，我才必须使用它。

## 具体规则是：

我判断有 1% 以上可能性 某个 skill 适用 → 我必须先调用该 skill 检查
如果调用后发现 skill 不适用 → 就不使用它

## 何时必须使用

举例说明：

你说 "帮我 review 代码" → 我会检查是否有 code-reviewer skill 适用
你说 "添加一个新功能" → 我会先调用 brainstorming skill
你说 "修复这个 bug" → 我会先调用 systematic-debugging skill

## Slash 命令

当你使用 / 开头的命令时（如 /superpowers:brainstorming），这是你明确请求使用该 skill，我会直接加载并遵循它。

回到当前情况：你刚才输入了 /superpowers:brainstorming，所以我加载了 brainstorming skill。

但如果你想直接做别的事（比如修复刚才 review 中的问题），告诉我你想要什么，我可以直接帮你处理。






# 参考资料

https://github.com/obra/superpowers

https://www.yeyulingfeng.com/312133.html

https://www.cnblogs.com/gyc567/p/19510203



* any list
{:toc}
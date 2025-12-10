---
layout: post
title: AI SDD 开发规范-05-spec-kit 使用入门实战，以及如何应用到 Trae 实战
date: 2025-11-20 14:12:33 +0800
categories: [AI]
tags: [ai, sdd, sh]
published: true
---


# 实战笔记

# OpenSpec 是什么？

## 1. 核心概念与定位

**OpenSpec** 是一个轻量级的 **规范驱动开发框架**，专门为 **AI 编程助手** 设计。

核心理念是：**在写代码之前，先让人类和 AI 就“要做什么”达成共识**。

截至 **2025-12**，OpenSpec 在 GitHub 上已获得超过 **11,000 ⭐**，成为规范驱动开发领域增长最快的开源项目。它已原生支持超过 **20 种主流 AI 编程工具**（如 Claude Code、TRAE、Codex CLI、GitHub Copilot、Gemini CLI 等）。

**项目信息**

* GitHub 地址: [https://github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
* 官方网站: [https://openspec.dev](https://openspec.dev)
* 当前最新版本: **v0.16.0**

---

## 2. 为什么需要 OpenSpec（你是否遇到过这些问题）

常见痛点：

* 让 AI 帮写代码，但结果与期望完全不一样
* AI 自作主张加入不需要的功能，或忽略关键细节
* 聊着聊着上下文丢失，AI 忘记之前讨论的需求
* 团队协作时，个人与 AI 的沟通内容无法共享

**解决方案（简述）**：OpenSpec 让你在写代码之前，把“要做什么”写成规范文档，AI 按规范执行，减少随意发挥；同时把规范加入版本控制，利于团队协作与审查。

---

## 3. 目标用户 / 本教程适合谁

* **完全小白**
  → 从头读到尾，跟着每一步操作学习。
* **有经验的开发者**
  → 可跳过环境准备，直接看“5分钟快速上手”和实战案例。
* **Vibe Coding 玩家**（偏自然语言交互）
  → 重点看“用自然语言玩转 OpenSpec”章节。

---

# Part 1：零基础小白篇 — 从 0 到 1 完整教程

## 1.1 准备工作：安装必要软件

需要安装：**Node.js** 和 一个 **AI 编程工具**（例如 TRAE / Claude Code / Trae 等）。

### Step 1 — 安装 Node.js

1. 打开浏览器访问 `nodejs.org`
2. 下载 LTS（稳定版）并安装
3. 验证安装：

```bash
# 在终端或命令行执行
node --version
# 预期输出类似：v20.18.0
```

> 如果出现“不是内部或外部命令”，重启终端或电脑再试。

### Step 2 — 安装一个 AI 编程工具（可选示例）

| 工具          |        特点 | 获取方式                                 |
| ----------- | --------: | ------------------------------------ |
| TRAE      | 界面友好，适合新手 | 访问 TRAE.com 下载                     |
| Claude Code | 命令行工具，功能强 | `npm i -g @anthropic-ai/claude-code` |
| Trae        | 字节出品，中文友好 | 访问 trae.ai 下载                        |

---

## 1.2 安装 OpenSpec

```bash
# 全局安装
npm install -g @fission-ai/openspec@latest

# 验证
openspec --version
```

此处老马的版本是：`0.16.0`，不同时间会有差异。

---

## 1.3 创建你的第一个项目（示例：待办事项应用）

### Step 1 — 创建项目文件夹

`D:\aicode\openspec-demo` 我们创建一个测试文件夹。

### Step 2 — 初始化 OpenSpec

```bash
openspec init
```

在选择菜单中选中你想配置的 AI 工具（例如：TRAE）。

这里我用的是 Trae 测试，可以选择【Other】

### Step 3 — 查看初始化生成的文件结构（示例）

```
openspec-demo/
  openspec/
    AGENTS.md      <- AI 的说明书（如何按规范工作）
    project.md     <- 项目介绍（填写）
    specs/         <- 存放功能规范
    changes/       <- 存放待实施的变更
  AGENTS.md      <- OTHER 的 AI 的说明书（如何按规范工作）  
```

### Step 4 — 在 TRAE 中打开项目（可视化操作）

`File -> Open Folder` 选择 `my-todo-app`。

---

## 1.4 第一次使用：让 AI 帮你规划功能（示例流程）

1. 在 TRAE 打开 AI 聊天（`Ctrl+L` / `Cmd+L`）。
2. 让 AI 读取 `openspec/project.md` 并填写项目信息（技术栈、代码规范等）。
3. 创建第一个功能规范（示例指令）：

```
/openspec-proposal 创建一个待办事项应用的基础功能，包括：
1. 添加待办事项
2. 标记完成/未完成
3. 删除待办事项
4. 待办事项保存在 localStorage
```

4. AI 会在 `openspec/changes/` 下生成变更提案（如 `add-todo-features`），包含 `proposal.md`、`tasks.md`、`specs/todo/spec.md` 等文件。
5. 审查 `tasks.md`（任务清单），确认后在聊天框输入：

```
/openspec-apply add-todo-features
```

AI 会按 `tasks.md` 顺序执行任务，完成后可归档：

```bash
openspec archive add-todo-features --yes
```

---

# Part 2：开发者篇 — 5 分钟快速上手

## 2.1 一分钟安装

```bash
npm i -g @fission-ai/openspec@latest

cd your-project
openspec init  # 选择你用的 AI 工具
```

## 2.2 核心工作流（3 个命令搞定）

| 阶段 | 命令                        | 作用                                   |
| -- | ------------------------- | ------------------------------------ |
| 规划 | `/openspec:proposal [描述]` | AI 创建 proposal + tasks + specs delta |
| 执行 | `/openspec:apply [name]`  | AI 按 tasks.md 写代码                    |
| 归档 | `openspec archive [name]` | 合并 specs，归档历史                        |

## 2.3 `spec.md` 的标准格式速查

```md
# Feature Specification

## Purpose
一句话说明功能目的

## Requirements
### Requirement: 需求名称
系统 SHALL/MUST 做什么

#### Scenario: 场景名称
- **WHEN** 触发条件
- **THEN** 预期结果
- **AND** 附加结果
```

**注意**：Requirement 用 3 个 `#`，Scenario 用 4 个 `#`。每个 Requirement 至少要有一个 Scenario。

## 2.4 常用 CLI 命令

```bash
openspec list              # 查看活跃变更
openspec list --specs      # 查看现有规范
openspec show [name]       # 查看变更详情
openspec validate          # 验证格式
openspec diff              # 查看规范差异
openspec archive --yes     # 非交互式归档
```

---

# Part 3：各 AI 工具实操指南（要点）

## 3.1 Claude Code（命令行）

* 安装：`npm i -g @anthropic-ai/claude-code`
* 流程示例（交互式）：启动 `claude` → `/openspec:proposal ...` → 审查 `tasks.md` → `/openspec:apply ...` → `/openspec:archive ...`

## 3.2 TRAE（图形界面）

* 初始化：`openspec init` 选择 TRAE
* 在 TRAE 中：`Ctrl+L` 打开 AI 聊天 → 输入 `/openspec-proposal` → 在左侧文件树查看 `openspec/changes/` → `/openspec-apply [变更名]` → 终端运行 `openspec archive [变更名]`

> 推荐使用 `@codebase` 命令让 AI 了解项目上下文，或选中代码后再发起对话以提高上下文理解。

## 3.3 Trae（字节出品）

* 初始化：`openspec init` → 选择 Other → 配置 `.trae/rules/project_rules.md` 描述 OpenSpec 工作流
* 在 Trae 中可以用自然语言创建提案 / 执行变更 / 提醒归档

## 3.4 Codex CLI（OpenAI）

* 安装：`npm i -g @openai/codex`
* 使用方法同上：`codex` → `/openspec-proposal` → `/openspec-apply` → `openspec archive`

---

# Part 4：Vibe Coding 篇 — 用自然语言玩转 OpenSpec

## 4.1 什么是 Vibe Coding

用自然语言描述需求，AI 帮你实现。OpenSpec 把自然语言转成规范文档，保证 AI 不随意发挥。

## 4.2 自然语言工作流（示例）

1. 描述需求（越具体越好）。
2. 审查 AI 生成的规划（tasks、specs），提出修改。
3. 确认后让 AI 实施（可用 `/openspec-apply` 或自然语言命令）。
4. 实施过程中保持沟通并调整实现细节。
5. 完成后归档：`openspec archive [name] --yes`

## 4.3 实战案例（天气应用）

* 目标：React、用户输入城市名、显示当前天气 + 未来 3 天预报。
* 过程：你描述 → AI 创建 `add-weather-app` 变更提案 → 指定 API（如 OpenWeatherMap） → `/openspec-apply add-weather-app` → 完成后 `npm start` 运行 → 归档。

**Vibe Coding 关键点**：描述清楚 → 审查规划 → 过程沟通 → 用 OpenSpec 保证可追溯性。

---

# Part 5：进阶篇 — 在已有项目上使用 OpenSpec

## 5.1 为现有项目添加 OpenSpec

```bash
cd existing-project
openspec init
```

让 AI 阅读项目（`/openspec:read` 或手动让 AI 阅读代码），并填写 `openspec/project.md`（技术栈、代码组织、主要模块、约定等）。

## 5.2 迭代开发实战（示例：优惠券功能）

* 创建提案：`/openspec:proposal 添加优惠券功能`（列出功能点）
* 审查影响范围（AI 会列出受影响的 specs & 代码路径）
* 分批实施（可按子功能拆成多个 proposal）

## 5.3 处理复杂变更

两种策略：

1. **拆分小变更**（更安全、并行友好）
2. **大变更分阶段执行**（tasks.md 会自动按阶段组织）

---

# Part 6：常见问题与解决

**Q1：验证报错怎么办？**

* 错误：`Change must have at least one delta` → 确保 `changes/xxx/specs/` 下有 `.md`，并包含操作标记（`## ADDED Requirements` 等）。
* 错误：`Requirement must have at least one scenario` → 每个 Requirement 底下至少要有一个 `#### Scenario: 名称`。

**Q2：AI 不按规范执行怎么办？**

1. 提醒它遵循 `openspec/AGENTS.md` 指引。
2. 让 AI 重新读取 `AGENTS.md`。
3. 使用斜杠命令而非纯自然语言以提高确定性。

**Q3：团队协作怎么用？**

* 将 `openspec/` 目录纳入 Git。
* 每个成员运行 `openspec update` 同步配置。
* 代码 review 时同时 review 规范变更。
* 保持 `project.md` 更新，帮助新成员快速上手。

**Q4：能和其他工具一起用吗？**
可以。例如：

* OpenSpec + ESLint/Prettier（规范 vs 风格）
* OpenSpec + Jest/Vitest（Scenario 指导测试用例）
* OpenSpec + Storybook（规范描述行为，Storybook 展示）

---

# 附：规范与工作流程要点（速查）

## 规范编写原则

1. 每个需求至少包含一个场景。
2. 使用 **SHALL/MUST** 表示强制需求，避免 should/may。
3. 场景必须使用 4 个 `#` 的标题格式（`#### Scenario:`）。
4. 在编码前始终运行：

```bash
openspec validate --strict
```

## 工作流程建议

1. 规范优先：先定义“做什么”，再讨论“怎么做”。
2. 迭代审查：创建提案后仔细审查再实施。
3. 顺序实施：按 `tasks.md` 的顺序执行，不要跳跃。
4. 及时归档：任务完成后尽快 `openspec archive`，保持 `changes/` 清洁。

## 团队协作建议

* 把 `openspec/` 目录纳入 Git。
* 不同成员可用不同 AI 工具，使用 `openspec update` 保持配置同步。
* 在代码审查时同时审查规范变更。
* 保持 `project.md` 更新，便于 AI 理解项目上下文。

---

# 附录一：项目上下文（`project.md` 建议内容）

建议包含：

* **技术栈**：语言 / 框架 / 主要库
* **代码约定**：命名规范、文件组织、注释风格
* **架构模式**：目录结构、模块划分、数据流
* **测试策略**：测试框架、覆盖率要求
* **外部依赖**：第三方服务、API 集成

---

# 附录二：支持的 AI 工具（示例清单）

| 工具名称               |                   配置目录 | 支持方式      |
| ------------------ | ---------------------: | --------- |
| Claude Code        |    `.claude/commands/` | 原生斜杠命令    |
| TRAE             |    `.TRAE/commands/` | 原生斜杠命令    |
| Codex CLI          |    `~/.codex/prompts/` | 原生斜杠命令    |
| GitHub Copilot     |     `.github/prompts/` | 原生斜杠命令    |
| Gemini CLI         |    `.gemini/commands/` | 原生斜杠命令    |
| Amazon Q Developer |    `.amazonq/prompts/` | 原生斜杠命令    |
| Windsurf           | `.windsurf/workflows/` | 原生斜杠命令    |
| Trae               |         `.trae/rules/` | AGENTS.md |
| RooCode            |       `.roo/commands/` | 原生斜杠命令    |
| Kilo Code          | `.kilocode/workflows/` | 原生斜杠命令    |

---

# 最后总结（核心一句话）

**OpenSpec 的本质是：先想清楚“要做什么”，再让 AI 动手。

规范文档是你和 AI 之间的“契约”——保证 AI 不乱发挥，也让项目状态随时可查、可审。**


# 参考资料

[OpenSpec保姆级实战指南：从0到1实战教程](https://mp.weixin.qq.com/s?__biz=MzYzMTI2NzQ2Mw==&mid=2247483768&idx=1&sn=42eb798c8097d715318f4064b4887bf2&chksm=f1e0b9b3e7fb9679b94fec475175320931df209f74a06a4a9c20299be823409cd35314094644&mpshare=1&scene=1&srcid=1210ZFHRvsF6pLhIlS5vMpqf&sharer_shareinfo=3c7412873a8fc6c6f1221a30b20bd253&sharer_shareinfo_first=3c7412873a8fc6c6f1221a30b20bd253#rd)

[TRAE使用openspec](https://blog.csdn.net/qq_30632605/article/details/153780412)

* any list
{:toc}
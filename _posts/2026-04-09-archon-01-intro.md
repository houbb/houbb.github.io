---
layout: post 
title:  Archon 首个面向AI编码的开源编排器构建工具。让AI编码变得确定且可重复。
date: 2026-04-09 21:01:55 +0800
categories: [AI]
tags: [ai, llm, voice]
published: true
---



# Archon

首个面向AI编码的开源编排器构建工具。让AI编码变得确定且可重复。

Archon 是一个面向 AI 编码代理的工作流引擎。将您的开发流程定义为 YAML 工作流 —— 规划、实现、验证、代码审查、PR 创建 —— 并在所有项目中可靠地运行它们。

就像 Dockerfile 为基础设施所做的那样，GitHub Actions 为 CI/CD 所做的那样 —— Archon 为 AI 编码工作流做到了这一点。可以把它想象成 n8n，但是为软件开发量身定制。

## 为什么选择 Archon？

当您让 AI 代理“修复这个 bug”时，结果取决于模型当时的状态。它可能会跳过规划。可能会忘记运行测试。可能会写出忽略您模板的 PR 描述。每次运行都不一样。

Archon 解决了这个问题。将您的开发过程编码为一个工作流。工作流定义了阶段、验证门禁和工件。AI 在每个步骤中填充智能，但结构是确定的，并且由您掌控。

- **可重复** —— 相同的工作流，相同的顺序，每次都是。规划、实现、验证、审查、PR。
- **隔离** —— 每次工作流运行都会获得自己的 git worktree。并行运行 5 个修复任务，无冲突。
- **即抛即忘** —— 启动一个工作流，去做其他工作。回来时就能看到一个带有审查评论的已完成 PR。
- **可组合** —— 将确定性节点（bash 脚本、测试、git 操作）与 AI 节点（规划、代码生成、审查）混合使用。AI 只在能增加价值的地方运行。
- **可移植** —— 在 `.archon/workflows/` 中定义一次工作流，提交到您的仓库中。它们从 CLI、Web UI、Slack、Telegram 或 GitHub 上的运行方式都是一样的。

## 它看起来是什么样

下面是一个 Archon 工作流的示例，它会进行规划，循环实现直到测试通过，然后获得您的批准，最后创建 PR：

```yaml
# .archon/workflows/build-feature.yaml
nodes:
  - id: plan
    prompt: "探索代码库并创建实现计划"

  - id: implement
    depends_on: [plan]
    loop:                                      # AI 循环 - 迭代直到完成
      prompt: "阅读计划。实现下一个任务。运行验证。"
      until: ALL_TASKS_COMPLETE
      fresh_context: true                      # 每次迭代都是全新会话

  - id: run-tests
    depends_on: [implement]
    bash: "bun run validate"                   # 确定性 - 无 AI

  - id: review
    depends_on: [run-tests]
    prompt: "对照计划审查所有更改。修复任何问题。"

  - id: approve
    depends_on: [review]
    loop:                                      # 人工批准门禁
      prompt: "展示更改以供审查。处理任何反馈。"
      until: APPROVED
      interactive: true                        # 暂停并等待人工输入

  - id: create-pr
    depends_on: [approve]
    prompt: "推送更改并创建拉取请求"
```

告诉您的编码代理您想要什么，Archon 会处理其余部分：

```
您：使用 archon 为设置页面添加深色模式

代理：我将为此运行 archon-idea-to-pr 工作流。
       → 创建隔离 worktree，分支 archon/task-dark-mode...
       → 规划中...
       → 实现中（任务 1/4）...
       → 实现中（任务 2/4）...
       → 测试失败 - 迭代中...
       → 经过 2 次迭代后测试通过
       → 代码审查完成 - 0 个问题
       → PR 已就绪：https://github.com/you/project/pull/47
```

## 先前版本

正在寻找基于 Python 的原始 Archon（任务管理 + RAG）？它完整保留在 [`archive/v1-task-management-rag`](https://github.com/coleam00/Archon/tree/archive/v1-task-management-rag) 分支中。

## 快速开始

> **大多数用户应该从[完整设置](#full-setup-5-minutes)开始** —— 它会引导您完成凭据配置，将 Archon 技能安装到您的项目中，并为您提供 Web 仪表板。
>
> **已经有 Claude Code 并且只想要 CLI？** 跳转到[快速安装](#quick-install-30-seconds)。

### 完整设置（5 分钟）

克隆仓库并使用引导式设置向导。这将配置凭据、平台集成，并将 Archon 技能复制到您的目标项目中。

<details>
<summary><b>前置条件</b> - Bun、Claude Code 和 GitHub CLI</summary>

**Bun** - [bun.sh](https://bun.sh)

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
irm bun.sh/install.ps1 | iex
```

**GitHub CLI** - [cli.github.com](https://cli.github.com/)

```bash
# macOS
brew install gh

# Windows (via winget)
winget install GitHub.cli

# Linux (Debian/Ubuntu)
sudo apt install gh
```

**Claude Code** - [claude.ai/code](https://claude.ai/code)

```bash
# macOS/Linux/WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows (PowerShell)
irm https://claude.ai/install.ps1 | iex
```

</details>

```bash
git clone https://github.com/coleam00/Archon
cd Archon
bun install
claude
```

然后说：**“Set up Archon”**（设置 Archon）

设置向导会引导您完成所有步骤：CLI 安装、身份验证、平台选择，并将 Archon 技能复制到您的目标仓库。

### 快速安装（30 秒）

已经设置好了 Claude Code？安装独立的 CLI 二进制文件并跳过向导。

**macOS / Linux**
```bash
curl -fsSL https://archon.diy/install | bash
```

**Windows (PowerShell)**
```powershell
irm https://archon.diy/install.ps1 | iex
```

**Homebrew**
```bash
brew install coleam00/archon/archon
```

### 开始使用 Archon

完成任一安装路径后，进入您的项目并开始工作：

```bash
cd /path/to/your/project
claude
```

```
使用 archon 修复 issue #42
```

```
我有哪些 archon 工作流？分别在什么情况下使用？
```

编码代理会为您处理工作流选择、分支命名和 worktree 隔离。项目在首次使用时会被自动注册。

> **重要提示：** 始终从您的目标仓库运行 Claude Code，而不是从 Archon 仓库。设置向导会将 Archon 技能复制到您的项目中，以便它可以从那里工作。

## Web UI

Archon 包含一个 Web 仪表板，用于与您的编码代理聊天、运行工作流和监控活动。要启动它，请让您的编码代理从 Archon 仓库运行前端，或者自己从仓库根目录运行 `bun run dev`。

通过单击聊天侧边栏中“项目”旁边的 **+** 来注册一个项目 —— 输入 GitHub URL 或本地路径。然后开始对话、调用工作流，并实时查看进度。

**关键页面：**
- **聊天** - 带有实时流式传输和工具调用可视化的对话界面
- **仪表板** - 用于监控运行中工作流的任务控制中心，可按项目、状态和日期筛选历史记录
- **工作流构建器** - 用于创建带有循环节点的 DAG 工作流的可视化拖放编辑器
- **工作流执行** - 任何正在运行或已完成工作流的分步进度视图

**监控中心：** 侧边栏显示来自**所有平台**的对话 —— 不仅仅是 Web。从 CLI 启动的工作流、来自 Slack 或 Telegram 的消息、GitHub issue 交互 —— 所有内容都集中在一个地方。

有关完整文档，请参阅 [Web UI 指南](https://archon.diy/adapters/web/)。

## 您可以自动化什么？

Archon 附带了用于常见开发任务的工作流：

| 工作流 | 功能 |
|----------|-------------|
| `archon-assist` | 通用问答、调试、探索 —— 带有所有工具的完整 Claude Code 代理 |
| `archon-fix-github-issue` | 分类问题 → 调查/规划 → 实现 → 验证 → PR → 智能审查 → 自我修复 |
| `archon-idea-to-pr` | 功能创意 → 规划 → 实现 → 验证 → PR → 5 路并行审查 → 自我修复 |
| `archon-plan-to-pr` | 执行现有计划 → 实现 → 验证 → PR → 审查 → 自我修复 |
| `archon-issue-review-full` | 全面的修复 + 针对 GitHub issue 的多代理完整审查流程 |
| `archon-smart-pr-review` | 分类 PR 复杂度 → 运行针对性审查代理 → 综合发现 |
| `archon-comprehensive-pr-review` | 多代理 PR 审查（5 个并行审查者）并自动修复 |
| `archon-create-issue` | 分类问题 → 收集上下文 → 调查 → 创建 GitHub issue |
| `archon-validate-pr` | 对主分支和特性分支进行彻底的 PR 验证测试 |
| `archon-resolve-conflicts` | 检测合并冲突 → 分析双方 → 解决 → 验证 → 提交 |
| `archon-feature-development` | 根据计划实现功能 → 验证 → 创建 PR |
| `archon-architect` | 架构扫描、降低复杂度、改善代码库健康度 |
| `archon-refactor-safely` | 带有类型检查钩子和行为验证的安全重构 |
| `archon-ralph-dag` | PRD 实现循环 —— 迭代完成故事直到结束 |
| `archon-remotion-generate` | 使用 AI 生成或修改 Remotion 视频合成 |
| `archon-test-loop-dag` | 循环节点测试工作流 —— 迭代计数器直到完成 |
| `archon-piv-loop` | 引导式计划-实现-验证循环，迭代之间有人工审查 |

Archon 附带 17 个默认工作流 —— 运行 `archon workflow list` 或描述您的需求，路由器会选择合适的工作流。

**或者定义您自己的工作流。** 默认工作流是很棒的起点 —— 从 `.archon/workflows/defaults/` 复制一个并自定义它。工作流是 `.archon/workflows/` 中的 YAML 文件，命令是 `.archon/commands/` 中的 markdown 文件。您仓库中同名文件会覆盖捆绑的默认文件。提交它们 —— 您的整个团队将运行相同的流程。

请参阅[编写工作流](https://archon.diy/guides/authoring-workflows/)和[编写命令](https://archon.diy/guides/authoring-commands/)。

## 添加一个平台

Web UI 和 CLI 开箱即用。可选地连接一个聊天平台以实现远程访问：

| 平台 | 设置时间 | 指南 |
|----------|-----------|-------|
| **Telegram** | 5 分钟 | [Telegram 指南](https://archon.diy/adapters/telegram/) |
| **Slack** | 15 分钟 | [Slack 指南](https://archon.diy/adapters/slack/) |
| **GitHub Webhooks** | 15 分钟 | [GitHub 指南](https://archon.diy/adapters/github/) |
| **Discord** | 5 分钟 | [Discord 指南](https://archon.diy/adapters/community/discord/) |

## 架构

```
┌─────────────────────────────────────────────────────────┐
│  平台适配器（Web UI, CLI, Telegram, Slack,              │
│                    Discord, GitHub）                      │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     编排器                               │
│          （消息路由与上下文管理）                          │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
      ┌───────┴────────┐          ┌───────┴────────┐
      │                │          │                │
      ▼                ▼          ▼                ▼
┌───────────┐  ┌────────────┐  ┌──────────────────────────┐
│  命令     │  │  工作流    │  │   AI 助手客户端           │
│  处理器   │  │  执行器    │  │      (Claude / Codex)     │
│  (Slash)  │  │  (YAML)    │  │                          │
└───────────┘  └────────────┘  └──────────────────────────┘
      │              │                      │
      └──────────────┴──────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              SQLite / PostgreSQL (7 张表)                │
│   代码库 • 对话 • 会话 • 工作流运行                       │
│   隔离环境 • 消息 • 工作流事件                            │
└─────────────────────────────────────────────────────────┘
```

## 文档

完整文档请访问 **[archon.diy](https://archon.diy)**。

| 主题 | 描述 |
|-------|-------------|
| [快速开始](https://archon.diy/getting-started/overview/) | 设置指南（Web UI 或 CLI） |
| [Archon 之书](https://archon.diy/book/) | 10 章叙事教程 |
| [CLI 参考](https://archon.diy/reference/cli/) | 完整的 CLI 参考 |
| [编写工作流](https://archon.diy/guides/authoring-workflows/) | 创建自定义 YAML 工作流 |
| [编写命令](https://archon.diy/guides/authoring-commands/) | 创建可复用的 AI 命令 |
| [配置](https://archon.diy/reference/configuration/) | 所有配置选项、环境变量、YAML 设置 |
| [AI 助手](https://archon.diy/getting-started/ai-assistants/) | Claude 和 Codex 设置详情 |
| [部署](https://archon.diy/deployment/) | Docker、VPS、生产环境设置 |
| [架构](https://archon.diy/reference/architecture/) | 系统设计和内部原理 |
| [故障排除](https://archon.diy/reference/troubleshooting/) | 常见问题及修复 |

## 贡献

欢迎贡献！请查看开放的 [issues](https://github.com/coleam00/Archon/issues) 了解可以参与的工作。

在提交拉取请求之前，请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

# 参考资料

* any list
{:toc}
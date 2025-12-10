---
layout: post
title: AI SDD 开发规范-02-spec-kit 介绍
date: 2025-11-20 14:12:33 +0800
categories: [AI]
tags: [ai, sdd, sh]
published: true
---

# Spec Kit

## 更快构建高质量软件

一个开源工具包，让你不必“从零 scratch 写所有代码”，而是聚焦 **产品场景 + 结果**，通过「规格驱动 + AI 协助」的方式生成代码。([GitHub][1])

---

## 📋 目录

* 什么是 Spec-Driven Development（规格驱动开发）？
* ⚡ 快速开始 (Get Started)
* 🎯 支持的 AI Agent（AI 助手）
* Specify CLI 使用参考
* 核心理念 (Core Philosophy)
* 开发阶段 (Development Phases)
* 实验与目标 (Experimental Goals)
* 环境要求 (Prerequisites)
* 更深入了解 (Learn More)
* 详细流程 (Detailed Process)
* 排错 (Troubleshooting)
* 维护者 (Maintainers) / 许可协议 (License) ([GitHub][1])

---

## 什么是 “规格驱动开发”？

长期以来，软件开发往往是这样的：先写代码，规格／设计文档只是 “辅助 scaffolding” —— 写完就扔。
而 Spec Kit 要反过来：**让规格本身变成可执行的** —— 也就是说，你先定义「要做什么」(what)，再让 AI 帮你把它“变成代码”，而不是直接从 prompt 写代码。([GitHub][1])

---

## ⚡ 快速开始 (Get Started)

### 1. 安装 Specify CLI

推荐方式（全局安装）：

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

这样你将 `specify` 工具安装到系统中，后续任何项目里都能用。([GitHub][1])

如果只是想一次性使用，也可以不用安装，直接用 `uvx ...` 运行 CLI。([GitHub][1])

### 2. 初始化项目

例如：

```bash
specify init <PROJECT_NAME>
```

也可以在当前目录初始化：

```bash
specify init . --here    # 或者 specify init --here
```

还可以指定 AI Agent，比如：

```bash
specify init . --ai claude
specify init . --ai cursor-agent
```

如果当前目录已有内容，也可以加 `--force` 来强制覆盖／合并。([GitHub][1])

---

## 🎯 支持的 AI Agent

Spec Kit 支持多种 AI 编码助手 / agent。目前官方列出的包括（但不限于）：

* Claude Code
* GitHub Copilot
* Gemini CLI
* Cursor
* Qwen Code
* OpenCode
* Windsurf
* Kilo Code
* Auggie CLI
* CodeBuddy CLI
* Roo Code
* Codex CLI
* Amazon Q Developer CLI（但注意：它不支持自定义参数的 slash 命令）
* Amp、SHAI 等其他 agent ([GitHub][1])

也就是说，不论你用哪种支持的 AI，只要符合条件，都可以加入 Spec-Kit 流程。

---

## Specify CLI – 常用命令参考

`specify` 提供以下主要命令／选项：([GitHub][1])

| 命令 / 子命令        | 描述                                          |
| --------------- | ------------------------------------------- |
| `specify init`  | 初始化一个新的 Spec-Kit 项目（或在当前目录初始化）              |
| `specify check` | 检查系统环境是否满足工具运行所需条件（如 git、AI agent、Python 等） |

### `specify init` 的参数 / 选项：

* `<project-name>`：新项目的目录名（如果用 `--here` 或 `.`，则表示当前目录） ([GitHub][1])
* `--ai <agent>`：指定要使用的 AI agent，例如 `claude`、`gemini`、`copilot`、`cursor-agent`、`qwen`、`opencode`、`codex`、`windsurf` … ([GitHub][1])
* `--script`：指定脚本类型 (shell 脚本 `sh` / `bash` / zsh，或 Windows PowerShell `ps`) ([GitHub][1])
* `--ignore-agent-tools`：跳过对 AI agent 是否安装的检查（适合你已经确认 agent 可用，但 CLI 检测失败的情况） ([GitHub][1])
* `--no-git`：初始化时跳过 git 仓库初始化（如果你不想立即 git init 的话） ([GitHub][1])
* `--here`：在当前目录初始化，而不是创建一个新项目目录 ([GitHub][1])
* `--force`：即使当前目录已有内容，也强制合并／覆盖。谨慎使用。 ([GitHub][1])

初始化后，会为你的项目生成基础结构，例如规范模板、脚本、AI 配置等。

---

## Slash 命令 (Slash Commands) 工作流

当你在项目目录，并启动对应 AI agent 后，会自动获得一系列命令 (slash commands)，用于引导、规范、执行开发流程 —— 而不是人工手写全部。([GitHub][1])

### 核心命令：

| 命令                      | 含义                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `/speckit.constitution` | 为项目创建／更新 “宪章” (governing principles / development guidelines)，定义团队／项目约定、编码标准、测试标准、性能标准等 |
| `/speckit.specify`      | 描述你想要构建什么 (功能／用户故事／需求)，聚焦 “what / why”，而不是 “how”                                        |
| `/speckit.plan`         | 基于需求，创建技术实现方案 (tech stack + 架构 + 模块设计 + 接口设计 等)                                         |
| `/speckit.tasks`        | 将 plan 拆解为具体的、可执行任务列表 (task list)，每个任务清晰、可执行                                            |
| `/speckit.implement`    | 根据任务列表，由 AI 或开发者实际执行 (代码实现)                                                             |

### 可选／增强命令：

| 命令                   | 含义                                                                  |
| -------------------- | ------------------------------------------------------------------- |
| `/speckit.clarify`   | 针对规范中模糊／不清楚的地方进行澄清 (clarify)，推荐在 plan 之前运行                          |
| `/speckit.analyze`   | 做 cross-artifact consistency & coverage 分析 (比如规范 vs 任务 vs 实现之间是否一致) |
| `/speckit.checklist` | 生成自定义质量检查清单 (quality checklist)，用于验收标准／一致性／覆盖率验证                    |

这样一整套流程，就把 “需求 → 规范 → 设计 → 任务 → 实现 → 验收” 变成结构化、可追踪、可审查的闭环，而不是靠临时 prompt 和人工随意写代码。([GitHub][1])

---

## 🎯 Spec Kit 的核心理念 (Core Philosophy)

* **关注 “要做什么”**，先定义清楚 “what / why”，再考虑 “how” —— 避免一开始就跳进技术细节。([Speckit][2])
* **AI 驱动 (AI-Powered)**：利用 AI agent 自动化生成规范、任务、甚至代码，实现高效率。([Speckit][2])
* **更快交付 (Faster Delivery)**：通过规范 + AI，减少歧义、减少返工、提高一致性，从而更快交付高质量软件。([Speckit][2])

---

## 开发阶段 (Development Phases)

Spec-Kit 将软件开发拆分为多个阶段 (phase)，每一阶段都有明确职责 —— 而不是直接 “想什么 → 写什么”。结构分明、各司其职。([GitHub][1])

大致流程如下：

```
1. 宪章 (constitution) – 定义项目约定、编码标准、团队规则  
2. 规格 (specify) – 写需求 / 用户故事 / 功能规范 (what / why)  
3. 方案 (plan) – 技术选型 + 架构设计 + 模块/接口设计  
4. 任务拆解 (tasks) – 把 “方案” 拆成可执行任务列表  
5. （可选）澄清 (clarify) – 澄清需求 / 方案中模糊点  
6. （可选）分析 (analyze) – 检查规范/任务/实现的一致性 / 覆盖性 / 风险  
7. 实现 (implement) – 执行任务 / 编写代码 / 测试 / 实现功能  
8. （可选/辅助）检查清单 (checklist) – 完成功能后的自检 / 验收标准  
```

这种结构化流程特别适合团队、多人协作、大项目，也适合对质量、可维护性要求高的项目。([GitHub][3])

---

## ✅ 前提 / 环境要求 (Prerequisites)

为了能正常使用 Spec-Kit，你的环境需要满足：

* 操作系统：Linux / macOS / Windows 都可以 ([GitHub][3])
* 支持的 AI coding agent 之一 (见上面的支持列表) ([GitHub][1])
* `uv` 包管理器 (用于安装 specify-cli) ([GitHub][1])
* Python 3.11+ ([GitHub][1])
* Git (用于版本管理) ([GitHub][3])

可选但推荐：

* 编辑器 (例如 VS Code / Cursor)，便于结合 AI coding agent 使用 ([GitHub][1])
* 对于 Web 项目：Node.js / Docker / 浏览器支持（视项目需要）([GitHub][1])

---

## 为什么用 Spec Kit？优势是什么

相比传统 “想什么就写什么 / 先 code 后文档 / 后补需求说明” 的开发方式，Spec Kit 带来了这些好处：([cnblogs.com][4])

* **需求更清晰、明确**：先写规范 / 需求说明 (specify) 而不是直接写代码
* **减少误解 / 返工**：在 plan / tasks / implement 前，把逻辑、依赖、边界都梳清楚
* **适合多人或团队协作**：大家一起遵守同一 “宪章 + 规格 + 流程”
* **AI + 人类协作更稳定**：AI 不再只靠一次 prompt 写代码，而是按结构化说明逐步执行
* **更好的可维护性 / 可追溯性**：功能开发、修改、重构都有明确规范 + 版本 + 流程

---

## 🎬 视频概览（Video Overview）

Spec Kit 在官网 / 仓库里提供了一个 视频简介 (video overview)，建议新手通过视频看一次整个流程，会比读文字更直观。([GitHub][1])

---

## 📚 想深入了解 / 学习更多

Spec Kit 提供：

* 完整的 Spec-Driven Development 方法论文档
* 详细的 Step-by-step 指南 (walkthrough)
* 实验性目标 / 扩展说明 (experimental goals)
* 社区讨论 / 维护者支持

如果你认真运行几个特性 (feature) 的开发，你会对整个规范 + 流程 + AI + 实现链条有更深刻理解。([GitHub][1])

---

## 🛠 总结 — Spec Kit 适合谁 / 什么时候用它

如果你是：

* 想在团队中保持高代码质量 / 可维护性
* 想让 AI 编码助手和你协作，而不仅仅是一次性 “prompt → code”
* 项目较复杂、功能多、模块耦合多
* 希望有清晰规范 / 文档 / 流程 / 可追溯性

→ 那 Spec Kit 非常适合你

如果你只是做一个小工具 / 快速原型 / 临时脚本，也许重型规范就显得“杀鸡用牛刀”了。但对中大型项目 / 长期维护系统，它能极大提升可读性、可维护性与协作效率。



# 参考资料



* any list
{:toc}
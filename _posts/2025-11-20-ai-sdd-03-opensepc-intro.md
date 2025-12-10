---
layout: post
title: AI SDD 开发规范-03-openspec 介绍
date: 2025-11-20 14:12:33 +0800
categories: [AI]
tags: [ai, sdd, sh]
published: true
---


# OpenSpec

OpenSpec 让人类和 AI 编码助手之间达成「规格驱动开发」（spec-driven development），确保在写任何代码之前，大家都同意要构建什么。**不需要 API 密钥**。

---

## 为什么要用 OpenSpec？

* 虽然 AI 编码助手很强大，但当需求散落在聊天记录里时，它们极不稳定。
* OpenSpec 引入一种轻量级的规格工作流程，把意图锁定下来，然后再去实现。这样可以得到 **确定性（deterministic）**、**可复审（reviewable）** 的输出。
* 关键收益包括：

  1. 人类和 AI 的参与者在工作开始之前就对规格达成一致。
  2. 通过结构化的变更文件夹（proposal 提案、tasks 任务、spec 更新），让范围明确且可审计。
  3. 对「正在提议」「正在进行」「已归档」的变更，都有共享可见性。
  4. 与你已经使用的 AI 工具兼容 — 在支持的工具里可以用自定义斜杠命令（slash commands），在其他地方则可以通过上下文规则（context rules）工作。

---

## OpenSpec 与其他工具对比（简览）

* **轻量**：工作流程简单，不用 API key，设置成本低。
* **支持已有项目（褐地／brownfield优先）**：专为“已有代码基础”设计。OpenSpec 把「真实规范」和「提案规范」分离： `openspec/specs/` 是当前真相，`openspec/changes/` 是提议变更。这样 diff（差异）清晰、可控。
* **变更追踪**：提案（proposal）、任务（tasks）和规格差异（spec deltas）在一个地方管理；归档（archive）后，把被批准的变更合并回当前规范。
* **与 spec-kit / Kiro 的对比**：

  * spec-kit 和 Kiro 非常适合从零开始（0→1）功能开发。
  * OpenSpec 在修改已有功能（1→n）时表现更好，尤其是当一个变更涉及多个规范时。

---

## OpenSpec 的工作流程

```
┌────────────────────┐
│ Draft Change       │
│ Proposal           │
└────────┬───────────┘
         │ 与 AI 分享你的意图
         ▼
┌────────────────────┐
│ Review & Align     │
│（编辑 spec 和 tasks）  │◀── 反馈循环 ────┐
└────────┬───────────┘                  │
         │ 批准后的计划                     │
         ▼                                  │
┌────────────────────┐                      │
│ Implement Tasks    │──────────────────────┘
│（AI 写代码）         │
└────────┬───────────┘
         │ 提交变更
         ▼
┌────────────────────┐
│ Archive & Update   │
│ Specs（真实规范）   │
└────────────────────┘
```

具体步骤：

1. 草拟一个变更提案（proposal），描述你想要修改或新增什么规范。
2. 和你的 AI 助手一起复审这个提案，直到大家达成一致。
3. 实现与规格相对应的任务（tasks）。
4. 归档这个变更：把经过确认的规格更改合并回 `openspec/specs/`，成为新的真实规范。

---

## 快速上手（Getting Started）

### 支持的 AI 工具

**原生 Slash 命令支持的工具**（也就是可以直接用 `/openspec:proposal` 之类命令）：

| 工具                   | 支持命令                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Claude Code          | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive`                                    |
| CodeBuddy（CLI）       | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive`（在 `.codebuddy/commands/` 里）        |
| CoStrict             | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.cospec/openspec/commands/`）    |
| Cursor               | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`                                    |
| Cline                | `.clinerules/workflows/openspec-*.md` 中有对应工作流                                                 |
| Crush                | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.crush/commands/openspec/` 里）   |
| RooCode              | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.roo/commands/`）                |
| Factory Droid        | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.factory/commands/`）            |
| Gemini CLI           | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive`（在 `.gemini/commands/openspec/`）    |
| OpenCode             | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`                                    |
| Kilo Code            | `/openspec-proposal.md`、`/openspec-apply.md`、`/openspec-archive.md`（在 `.kilocode/workflows/`） |
| Qoder (CLI)          | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive`（在 `.qoder/commands/openspec/`）     |
| Antigravity          | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.agent/workflows/`）             |
| Windsurf             | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.windsurf/workflows/`）          |
| Codex                | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（全局在 `~/.codex/prompts`，会自动安装）      |
| GitHub Copilot       | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.github/prompts/`）              |
| Amazon Q Developer   | `@openspec-proposal`、`@openspec-apply`、`@openspec-archive`（在 `.amazonq/prompts/`）             |
| Auggie (Augment CLI) | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.augment/commands/`）            |
| Qwen Code            | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.qwen/commands/`）               |
| iFlow (iflow-cli)    | `/openspec-proposal`、`/openspec-apply`、`/openspec-archive`（在 `.iflow/commands/`）              |

**AGENTS.md 兼容工具**：

* 有些工具遵循 `openspec/AGENTS.md` 约定。
* 如果你的 AI 助手支持从 `AGENTS.md` 读取工作流指令，就可以让它遵循 OpenSpec 流程。
* OpenSpec 就是借助这个通用约定，让更多工具能工作。

---

### 安装 & 初始化

1. **前置条件**

   * 需要 Node.js，版本 **>= 20.19.0**。可以通过 `node --version` 检查。

2. **全局安装 CLI**

   ```bash
   npm install -g @fission-ai/openspec@latest
   ```

   安装完成后，验证：

   ```bash
   openspec --version
   ```

3. **在你的项目里初始化 OpenSpec**

   ```bash
   cd my-project    # 进入你的项目目录  
   openspec init    # 运行初始化
   ```

   初始化时会发生：

   * 提示让你选择一个或多个原生支持 OpenSpec 的 AI 工具（如 Claude Code、Cursor、OpenCode、Qoder 等）
   * 自动为你配置斜杠命令（slash command）
   * 在项目根目录生成 `AGENTS.md`（这是 OpenSpec 的工作流指导文件）
   * 创建 `openspec/` 目录结构（包括 `specs/`、`changes/` 等）

完成之后：

* 选定的 AI 工具可以触发 `/openspec` 工作流命令。
* 你可以执行 `openspec list` 来查看当前有哪些变更在进行中。
* 如果你的 AI 助手暂时没显示新命令（slash commands），可以重启它（很多助手在启动时加载命令）。

---

### （可选）初始化后填项目上下文

初始化完成后，OpenSpec 会建议一个 prompt，让你用它来填充项目上下文：

```text
“请阅读 openspec/project.md，并帮我用我的项目技术栈、约定、架构风格等信息填充它”
```

`openspec/project.md` 是一个用来定义整个项目级别约定的地方，比如：

* 代码约定（命名规则、目录结构）
* 架构风格
* 技术栈
* 团队工作流程

这些是 OpenSpec 用来指导后续变更提案 / 实现的重要基础。

---

## 创建你的第一个变更（Change）

下面是一个用任何 AI 工具都能跑通的完整示例流程（对于原生支持 Slash Command 的工具，还可以简化）：

1. **草拟提案（Proposal）**
   你对 AI 说：

   ```
   创建一个 OpenSpec 变更提案（change proposal），用于 “根据角色和团队过滤资料搜索” 的功能。
   （如果你的工具支持 Slash Command，可以直接： `/openspec:proposal Add profile search filters`）
   ```

   然后 AI 会生成目录结构，比如：

   ```
   openspec/changes/add-profile-filters/
     ├── proposal.md
     ├── tasks.md
     └── specs/… （存放规范 delta）
   ```

2. **验证 & 审查**

   * 在终端里执行 `openspec list`：确认提案文件夹已经生成。
   * 执行 `openspec validate add-profile-filters`：校验 proposal 的格式、结构是否正确。
   * 执行 `openspec show add-profile-filters`：查看提案内容、任务、规范变更（delta）。

3. **细化规范**
   你可以让 AI 修改提案 / 规范，例如：

   ```
   你：请为角色和团队过滤器加入验收标准（acceptance criteria）  
   AI：好的，我会在 spec delta 里增加这些场景，并更新 tasks.md  
   ```

4. **实施变更**
   当提案和规范确认无误后，你对 AI 说：

   ```
   我们开始实现该变更（如果支持 Slash Command：`/openspec:apply add-profile-filters`）  
   ```

   AI 会根据 `tasks.md` 中的任务一步步写代码，并在完成每个任务后打勾（✓）。

5. **归档变更**
   实现完成后，你让 AI 归档这个变更：

   ```
   你：请归档 “add-profile-filters” 变更  
   （Slash Command 形式：`/openspec:archive add-profile-filters`）  
   ```

   AI 会执行类似 `openspec archive add-profile-filters --yes`，将 `changes/add-profile-filters` 中的规范 delta 合并回 `openspec/specs/`，并标记为完成。

---

## 常用命令参考

* `openspec list`
  列出当前所有活跃的变更（change folders）。

* `openspec view`
  打开一个交互式面板，查看规范和变更。

* `openspec show <change>`
  显示某个具体变更（提案、任务、规范差异）。

* `openspec validate <change>`
  校验某个变更的规范结构是否符合格式要求。

* `openspec archive <change> [--yes|-y]`
  归档一个已完成的变更，并将其规范合并回主规范。加 `--yes` 可以跳过确认。

---

## 示例（AI 如何创建 OpenSpec 文件）

假设你对 AI 说：“我要加双因素认证（2FA）”：

* AI 会创建：

```
openspec/
  ├── specs/
  │   └── auth/
  │       └── spec.md           # 当前 auth 模块的规范
  └── changes/
      └── add-2fa/
          ├── proposal.md       # 为什么要加 2FA、业务背景
          ├── tasks.md          # 实现任务清单
          ├── design.md         # 技术设计（可选）
          └── specs/
              └── auth/
                  └── spec.md   # 规范 delta（2FA 相关新增内容）
```

* `openspec/specs/auth/spec.md`（主规范）大致可能长这样：

  ```md
  # 认证（Auth） 模块规范

  ## 目的  
  处理用户认证和会话管理。

  ## 需求  
  ### 需求：用户认证（User Authentication）  
  系统 **必须**（SHALL）在用户成功登录后发一个 JWT。

  #### 场景：凭证合法  
  - 当用户提交合法凭证  
  - 那么系统返回一个 JWT
  ```

* 在 delta 里（`changes/add-2fa/specs/auth/spec.md`）：

  ```md
  # Auth 模块 Delta

  ## 新增需求（ADDED Requirements）  
  ### 需求：双因素认证（Two-Factor Authentication）  
  系统 **必须**（MUST）在登录时要求第二因素。

  #### 场景：需要 OTP  
  - 当用户提交合法凭证  
  - 那么系统要求一个 OTP 验证挑战
  ```

* `tasks.md` 大致任务清单可能是：

  ```md
  ## 1. 数据库准备  
  - [ ] 增加用户表的 OTP secret 字段  
  - [ ] 新建 OTP 验证日志表  

  ## 2. 后端实现  
  - [ ] 创建 OTP 生成接口  
  - [ ] 修改登录逻辑以要求 OTP  
  - [ ] 新建 OTP 验证的接口  

  ## 3. 前端更新  
  - [ ] 新建 OTP 输入组件  
  - [ ] 修改登录界面流程，加入 OTP 步骤  
  ```

AI 会完全自动生成这些文件（你基本不用自己写），前提是你告诉 AI 你的意图。

---

## 关于 OpenSpec 文件格式

* **Delta（差异）格式**：用来展示规范如何变化。

  * `## ADDED Requirements` — 新增需求
  * `## MODIFIED Requirements` — 已有需求被修改（完整写出新的版本）
  * `## REMOVED Requirements` — 废弃的功能

* 规范头结构：

  * `### Requirement: <名字>`：用这个格式来写每条需求
  * 每个需求至少应该有一个 `#### Scenario:`（场景）块
  * 需求文本里建议使用 `SHALL` / `MUST` 这种词语来强调规范要求

---

## OpenSpec 与其他工具对比（深入）

* **vs spec-kit**：OpenSpec 的双文件夹模型（`specs/` + `changes/`）使得「当前真实规范」和「提案中的规范变更」分离。这在你修改老功能、或者一次变更影响多个模块时非常有用。spec-kit 更适合「全新功能从 0 到 1」。
* **vs Kiro.dev**：OpenSpec 把一个变更相关的所有内容 — 提案、任务、规范 delta — 都集中在一个变更文件夹里（`openspec/changes/feature-name/`），便于追踪。Kiro 的做法可能把变更分散到多个规范目录里，更难集中查看。

---

## 团队采用建议（Team Adoption）

1. 在你的 repo 里运行 `openspec init` 初始化。
2. **从新功能开始**：建议先对你之后要做的新 feature 用 OpenSpec 建 proposal / 变更。
3. **增量构建规范**：每个变更做完后，都把它归档（archive），然后把规范（delta）合并到主规范里，这样你的 `openspec/specs/` 会越来越完整。
4. **兼容各种工具**：不同人可以用不同 AI 编码助手（Claude Code、Cursor、CodeBuddy 等），大家共享统一规范。

> 小贴士：当有人切换 AI 工具时，运行 `openspec update`，可以更新 AI 指令和 slash-command 的配置，让新工具也能正确工作。

---

## 更新 OpenSpec 的方式

1. **升级 CLI**

   ```bash
   npm install -g @fission-ai/openspec@latest
   ```

2. **刷新 AI 指令**
   在你的项目里运行：

   ```bash
   openspec update
   ```

   这样可以重新生成 `AGENTS.md`，并确保你选择的 AI 工具对应最新的 Slash 命令。

---

## 参与贡献（Contributing）

* 安装依赖：`pnpm install`
* 构建项目：`pnpm run build`
* 运行测试：`pnpm test`
* 本地开发 CLI：`pnpm run dev` 或 `pnpm run dev:cli`
* 提交规范：使用 Conventional Commits 风格（例如 `feat(cli): add new command`）

# 参考资料

* any list
{:toc}
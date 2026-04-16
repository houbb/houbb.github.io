---
layout: post 
title: claude-code 游戏工作室
date: 2026-04-16 21:01:55 +0800
categories: [AI]
tags: [ai, claude-code]
published: true
---

# Claude Code 游戏工作室

将单个 Claude Code 会话转变为完整的游戏开发工作室。

49 个智能体。72 项技能。一个协调一致的 AI 团队。

## 为什么会有这个项目

独自使用 AI 来构建游戏非常强大——但单个聊天会话缺乏结构。

没有人会阻止你硬编码魔法数字、跳过设计文档或编写意大利面条式代码。

没有 QA 环节，没有设计评审，也没有人问“这真的符合游戏的核心愿景吗？”

**Claude Code 游戏工作室**通过为你的 AI 会话提供真实工作室的结构来解决这个问题。你得到的不是一个通用助手，而是 49 个按工作室层级组织的专业智能体——守护愿景的总监、负责各自领域的部门主管，以及执行具体工作的专家。每个智能体都有明确的职责、升级路径和质量门禁。

结果是：你仍然做出每一个决定，但现在你有一个能提出正确问题、及早发现错误、并让你的项目从第一次头脑风暴到发布都保持有序的团队。

---

## 目录

- [包含内容](#包含内容)
- [工作室层级](#工作室层级)
- [斜杠命令](#斜杠命令)
- [快速入门](#快速入门)
- [升级](#升级)
- [项目结构](#项目结构)
- [工作原理](#工作原理)
- [设计理念](#设计理念)
- [自定义](#自定义)
- [平台支持](#平台支持)
- [社区](#社区)
- [支持本项目](#支持本项目)
- [许可证](#许可证)

---

## 包含内容

| 类别 | 数量 | 描述 |
|----------|------|-------------|
| **智能体** | 49 | 涵盖设计、编程、美术、音频、叙事、QA 和生产等领域的专业子智能体 |
| **技能** | 72 | 每个工作流阶段的斜杠命令（`/start`、`/design-system`、`/create-epics`、`/create-stories`、`/dev-story`、`/story-done` 等） |
| **钩子** | 12 | 在提交、推送、资源变更、会话生命周期、智能体审计追踪和缺口检测时自动执行验证 |
| **规则** | 11 | 基于路径的编码规范，在编辑游戏玩法、引擎、AI、UI、网络代码等时自动生效 |
| **模板** | 39 | 用于 GDD、UX 规范、ADR、冲刺计划、HUD 设计、无障碍设计等的文档模板 |

## 工作室层级

智能体按三个层级组织，与真实工作室的运作方式一致：

```
第 1 层 — 总监（Opus）
  creative-director    technical-director    producer

第 2 层 — 部门主管（Sonnet）
  game-designer        lead-programmer       art-director
  audio-director       narrative-director    qa-lead
  release-manager      localization-lead

第 3 层 — 专家（Sonnet/Haiku）
  gameplay-programmer  engine-programmer     ai-programmer
  network-programmer   tools-programmer      ui-programmer
  systems-designer     level-designer        economy-designer
  technical-artist     sound-designer        writer
  world-builder        ux-designer           prototyper
  performance-analyst  devops-engineer       analytics-engineer
  security-engineer    qa-tester             accessibility-specialist
  live-ops-designer    community-manager
```

### 引擎专家

模板中包含了三大主流引擎的智能体集合。使用与你的项目匹配的集合：

| 引擎 | 主管智能体 | 子专家 |
|--------|-----------|-----------------|
| **Godot 4** | `godot-specialist` | GDScript、着色器、GDExtension |
| **Unity** | `unity-specialist` | DOTS/ECS、着色器/VFX、Addressables、UI Toolkit |
| **Unreal Engine 5** | `unreal-specialist` | GAS、蓝图、网络复制、UMG/CommonUI |

## 斜杠命令

在 Claude Code 中输入 `/` 即可使用全部 72 项技能：

**入门与导航**
`/start` `/help` `/project-stage-detect` `/setup-engine` `/adopt`

**游戏设计**
`/brainstorm` `/map-systems` `/design-system` `/quick-design` `/review-all-gdds` `/propagate-design-change`

**美术与资源**
`/art-bible` `/asset-spec` `/asset-audit`

**UX 与界面设计**
`/ux-design` `/ux-review`

**架构**
`/create-architecture` `/architecture-decision` `/architecture-review` `/create-control-manifest`

**故事与冲刺**
`/create-epics` `/create-stories` `/dev-story` `/sprint-plan` `/sprint-status` `/story-readiness` `/story-done` `/estimate`

**评审与分析**
`/design-review` `/code-review` `/balance-check` `/content-audit` `/scope-check` `/perf-profile` `/tech-debt` `/gate-check` `/consistency-check`

**QA 与测试**
`/qa-plan` `/smoke-check` `/soak-test` `/regression-suite` `/test-setup` `/test-helpers` `/test-evidence-review` `/test-flakiness` `/skill-test` `/skill-improve`

**生产管理**
`/milestone-review` `/retrospective` `/bug-report` `/bug-triage` `/reverse-document` `/playtest-report`

**发布**
`/release-checklist` `/launch-checklist` `/changelog` `/patch-notes` `/hotfix`

**创意与内容**
`/prototype` `/onboard` `/localize`

**团队编排**（在单个功能上协调多个智能体）
`/team-combat` `/team-narrative` `/team-ui` `/team-release` `/team-polish` `/team-audio` `/team-level` `/team-live-ops` `/team-qa`

## 快速入门

### 前置条件

- [Git](https://git-scm.com/)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)（`npm install -g @anthropic-ai/claude-code`）
- **推荐**：[jq](https://jqlang.github.io/jq/)（用于钩子验证）和 Python 3（用于 JSON 验证）

如果缺少可选工具，所有钩子都会优雅失败——不会有任何功能损坏，只是会失去验证能力。

### 设置

1. **克隆或用作模板**：
   ```bash
   git clone https://github.com/Donchitos/Claude-Code-Game-Studios.git my-game
   cd my-game
   ```

2. **打开 Claude Code** 并启动一个会话：
   ```bash
   claude
   ```

3. **运行 `/start`** —— 系统会询问你当前处于什么阶段（毫无头绪、模糊概念、清晰设计、已有成果），并引导你进入正确的工作流。不会做任何假设。

   或者，如果你已经知道自己需要什么，可以直接跳到某个特定技能：
   - `/brainstorm` —— 从零开始探索游戏创意
   - `/setup-engine godot 4.6` —— 如果你已经确定引擎，进行配置
   - `/project-stage-detect` —— 分析现有项目

## 升级

已经在使用本模板的旧版本？请查看 [UPGRADING.md](UPGRADING.md) 获取逐步迁移说明、版本变更详情，以及哪些文件可以直接覆盖、哪些需要手动合并。

## 项目结构

```
CLAUDE.md                           # 主配置
.claude/
  settings.json                     # 钩子、权限、安全规则
  agents/                           # 49 个智能体定义（markdown + YAML frontmatter）
  skills/                           # 72 项技能（每个技能一个子目录）
  hooks/                            # 12 个钩子脚本（bash，跨平台）
  rules/                            # 11 条基于路径的编码规范
  statusline.sh                     # 状态行脚本（上下文百分比、模型、阶段、史诗面包屑）
  docs/
    workflow-catalog.yaml           # 7 阶段流水线定义（供 /help 读取）
    templates/                      # 39 个文档模板
src/                                # 游戏源代码
assets/                             # 美术、音频、VFX、着色器、数据文件
design/                             # GDD、叙事文档、关卡设计
docs/                               # 技术文档和 ADR
tests/                              # 测试套件（单元、集成、性能、试玩）
tools/                              # 构建和流水线工具
prototypes/                         # 一次性原型（与 src/ 隔离）
production/                         # 冲刺计划、里程碑、发布跟踪
```

## 工作原理

### 智能体协作

智能体遵循结构化的委托模型：

1. **垂直委托** —— 总监委托给主管，主管委托给专家
2. **横向咨询** —— 同层智能体可以互相咨询，但不能做出具有约束力的跨域决策
3. **冲突解决** —— 分歧向上升级到共同的父级（设计方面为 `creative-director`，技术方面为 `technical-director`）
4. **变更传播** —— 跨部门变更由 `producer` 协调
5. **领域边界** —— 没有明确委托的情况下，智能体不得修改其领域之外的文件

### 协作而非自主

这**不是**一个自动驾驶系统。每个智能体都遵循严格的协作协议：

1. **询问** —— 智能体在提出解决方案之前先提问
2. **提供选项** —— 智能体展示 2-4 个选项，并列出优缺点
3. **你来决定** —— 用户始终做出最终决定
4. **草稿** —— 智能体在最终确定之前展示工作成果
5. **批准** —— 未经你签字确认，不会写入任何内容

你始终掌握控制权。智能体提供的是结构和专业知识，而不是自主权。

### 自动化安全

**钩子**在每个会话中自动运行：

| 钩子 | 触发时机 | 功能 |
|------|---------|--------------|
| `validate-commit.sh` | PreToolUse (Bash) | 检查硬编码值、TODO 格式、JSON 有效性、设计文档章节 —— 如果命令不是 `git commit` 则提前退出 |
| `validate-push.sh` | PreToolUse (Bash) | 警告推送到受保护分支 —— 如果命令不是 `git push` 则提前退出 |
| `validate-assets.sh` | PostToolUse (Write/Edit) | 验证命名规范和 JSON 结构 —— 如果文件不在 `assets/` 中则提前退出 |
| `session-start.sh` | 会话打开 | 显示当前分支和最近的提交，用于定位 |
| `detect-gaps.sh` | 会话打开 | 检测全新项目（建议运行 `/start`）以及当代码或原型存在时缺少设计文档的情况 |
| `pre-compact.sh` | 压缩前 | 保留会话进度笔记 |
| `post-compact.sh` | 压缩后 | 提醒 Claude 从 `active.md` 恢复会话状态 |
| `notify.sh` | 通知事件 | 通过 PowerShell 显示 Windows 通知 |
| `session-stop.sh` | 会话关闭 | 将 `active.md` 归档到会话日志并记录 git 活动 |
| `log-agent.sh` | 智能体生成时 | 审计追踪开始 —— 记录子智能体调用 |
| `log-agent-stop.sh` | 智能体停止时 | 审计追踪结束 —— 完成子智能体记录 |
| `validate-skill-change.sh` | PostToolUse (Write/Edit) | 在 `.claude/skills/` 发生任何变更后，建议运行 `/skill-test` |

> **注意**：`validate-commit.sh`、`validate-assets.sh` 和 `validate-skill-change.sh` 会在每次 Bash/Write 工具调用时触发，并在命令或文件路径不相关时立即退出（exit 0）。这是正常的钩子行为，无需担心性能问题。

**`settings.json` 中的权限规则**自动允许安全操作（git status、测试运行），并阻止危险操作（强制推送、`rm -rf`、读取 `.env` 文件）。

### 基于路径的规则

编码规范根据文件位置自动生效：

| 路径 | 强制要求 |
|------|----------|
| `src/gameplay/**` | 数据驱动值、使用增量时间、不引用 UI |
| `src/core/**` | 热路径中零分配、线程安全、API 稳定性 |
| `src/ai/**` | 性能预算、可调试性、数据驱动参数 |
| `src/networking/**` | 服务端权威、版本化消息、安全性 |
| `src/ui/**` | 不拥有游戏状态、本地化就绪、无障碍设计 |
| `design/gdd/**` | 必需的 8 个章节、公式格式、边界情况 |
| `tests/**` | 测试命名、覆盖率要求、固件模式 |
| `prototypes/**` | 宽松标准、要求 README、记录假设 |

## 设计理念

本模板以专业游戏开发实践为基础：

- **MDA 框架** —— 机制、动态、美学分析用于游戏设计
- **自我决定理论** —— 自主性、胜任感、归属感用于玩家动机
- **心流状态设计** —— 挑战与技能的平衡用于玩家参与度
- **巴托玩家类型** —— 受众定位与验证
- **验证驱动开发** —— 先写测试，后写实现

## 自定义

这是一个**模板**，而不是一个锁定的框架。所有内容都旨在被自定义：

- **添加/删除智能体** —— 删除你不需要的智能体文件，为你自己的领域添加新的
- **编辑智能体提示词** —— 调整智能体行为，添加项目特定知识
- **修改技能** —— 调整工作流以匹配你团队的流程
- **添加规则** —— 为项目的目录结构创建新的基于路径的规则
- **调整钩子** —— 调整验证严格程度，添加新的检查
- **选择你的引擎** —— 使用 Godot、Unity 或 Unreal 智能体集合（也可以不使用）
- **设置评审强度** —— `full`（所有总监门禁）、`lean`（仅阶段门禁）或 `solo`（无）。在 `/start` 期间设置，或编辑 `production/review-mode.txt`。可以在任何技能上通过 `--review solo` 覆盖单次运行。

## 平台支持

已在 **Windows 10** 上使用 Git Bash 测试。所有钩子使用 POSIX 兼容的模式（`grep -E`，而不是 `grep -P`），并为缺少的工具提供了回退方案。无需修改即可在 macOS 和 Linux 上运行。

## 社区

- **讨论** —— [GitHub Discussions](https://github.com/Donchitos/Claude-Code-Game-Studios/discussions) 用于提问、分享想法和展示你的作品
- **问题反馈** —— [Bug 报告和功能请求](https://github.com/Donchitos/Claude-Code-Game-Studios/issues)

---

## 支持本项目

Claude Code 游戏工作室是免费且开源的。如果它为你节省了时间或帮助你发布了游戏，请考虑支持持续开发：

<p>
  <a href="https://www.buymeacoffee.com/donchitos3"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee"></a>
  &nbsp;
  <a href="https://github.com/sponsors/Donchitos"><img src="https://img.shields.io/badge/GitHub%20Sponsors-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="GitHub Sponsors"></a>
</p>

- **[请我喝杯咖啡](https://www.buymeacoffee.com/donchitos3)** —— 一次性支持
- **[GitHub 赞助者](https://github.com/sponsors/Donchitos)** —— 通过 GitHub 进行定期支持

赞助将帮助投入时间维护技能、添加新智能体、跟进 Claude Code 和引擎 API 的变更，以及响应社区问题。

---

*为 Claude Code 构建。持续维护和扩展 —— 欢迎通过 [GitHub Discussions](https://github.com/Donchitos/Claude-Code-Game-Studios/discussions) 贡献。*

## 许可证

MIT 许可证。详见 [LICENSE](LICENSE) 文件。
```

# 参考资料

* any list
{:toc}
---
layout: post
title: claude-code-best-practice
date: 2026-03-16 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# claude-code-best-practice

**熟能生巧，Claude 才会更完美**

![Last Updated](https://img.shields.io/badge/Last_Updated-Mar%2015%2C%202026%2012%3A53%20PM%20PKT-white?style=flat\&labelColor=555) <a href="https://github.com/shanraisshan/claude-code-best-practice/stargazers"><img src="https://img.shields.io/github/stars/shanraisshan/claude-code-best-practice?style=flat&label=%E2%98%85&labelColor=555&color=white" alt="GitHub Stars"></a>

[![Best Practice](!/tags/best-practice.svg)](best-practice/)
*点击此徽章查看最新最佳实践*

[![Implemented](!/tags/implemented.svg)](implementation/)
*点击此徽章查看本仓库中的实现*

[![Orchestration Workflow](!/tags/orchestration-workflow.svg)](orchestration-workflow/orchestration-workflow.md)
*点击此徽章查看 Command → Agent → Skill 编排工作流*

---

## 🧠 概念（CONCEPTS）

| 功能                       | 位置                                         | 描述                                                  |
| ------------------------ | ------------------------------------------ | --------------------------------------------------- |
| **Commands（命令）**         | `.claude/commands/<name>.md`               | 注入到现有上下文中的知识 —— 简单的用户触发 Prompt 模板，用于工作流编排           |
| **Subagents（子代理）**       | `.claude/agents/<name>.md`                 | 在新的隔离上下文中的自治执行体 —— 自定义工具、权限、模型、记忆和持久身份              |
| **Skills（技能）**           | `.claude/skills/<name>/SKILL.md`           | 注入到现有上下文中的知识 —— 可配置、可预加载、可自动发现，支持上下文分叉与渐进式披露        |
| **Workflows（工作流）**       | `.claude/commands/weather-orchestrator.md` | Command → Agent → Skill 编排模式                        |
| **Hooks（钩子）**            | `.claude/hooks/`                           | 在特定事件上运行的确定性脚本，运行在 agent 循环之外                       |
| **MCP Servers**          | `.claude/settings.json`, `.mcp.json`       | Model Context Protocol 连接，用于接入外部工具、数据库和 API         |
| **Plugins（插件）**          | 可分发包                                       | 技能、子代理、钩子和 MCP 服务器的组合                               |
| **Settings（设置）**         | `.claude/settings.json`                    | 分层配置系统                                              |
| **Status Line（状态栏）**     | `.claude/settings.json`                    | 可自定义状态栏，显示上下文使用量、模型、成本和会话信息                         |
| **Memory（记忆）**           | `CLAUDE.md` 等                              | 通过 CLAUDE.md 文件与 `@path` 导入实现持久上下文                  |
| **Checkpointing（检查点）**   | 自动（基于 git）                                 | 自动跟踪文件修改，支持回退和摘要                                    |
| **CLI Startup Flags**    | `claude [flags]`                           | CLI 启动参数、子命令和环境变量                                   |
| **AI 术语**                |                                            | Agentic Engineering、Context Engineering、Vibe Coding |
| **Best Practices（最佳实践）** |                                            | 官方最佳实践、Prompt Engineering、扩展 Claude Code            |

---

## 🔥 热门（Hot）

| 功能                    | 位置                    | 描述                        |
| --------------------- | --------------------- | ------------------------- |
| **/btw**              | `/btw`                | 在 Claude 工作时进行侧链对话        |
| **Code Review**       | GitHub App            | 多代理 PR 分析，可检测 bug、安全漏洞和回归 |
| **Scheduled Tasks**   | `/loop`               | 按计划运行 Prompt（最长 3 天）      |
| **Voice Mode**        | `/voice`              | 语音输入 Prompt               |
| **Simplify & Batch**  | `/simplify`, `/batch` | 内置技能，用于代码质量优化和批量操作        |
| **Agent Teams**       | 内置                    | 多个 agent 并行处理同一代码库        |
| **Remote Control**    | `/remote-control`     | 从任意设备继续本地会话               |
| **Git Worktrees**     | 内置                    | 用于并行开发的隔离 Git 分支          |
| **Ralph Wiggum Loop** | 插件                    | 长时间运行的自动开发循环              |

---

## 编排工作流（Orchestration Workflow）

查看 **Command → Agent → Skill** 模式的实现。

使用方式：

```bash
claude
/weather-orchestrator
```

---

# ⚙️ 开发工作流（DEVELOPMENT WORKFLOWS）

### 🔥 热门

* Cross-Model Workflow（Claude Code + Codex）
* RPI Workflow
* Ralph Wiggum Loop

### 其他

* Github Speckit
* obra/superpowers
* OpenSpec OPSX
* get-shit-done (GSD)
* gstack
* Agent OS
* Human Layer RPI
* Andrej Karpathy 工作流
* Boris Cherny 工作流
* Peter Steinberger 工作流

---

# 💡 提示与技巧（TIPS AND TRICKS）

## Prompt 技巧

* 挑战 Claude
  “对这些改动严格审查，在我通过测试前不要创建 PR。”
* 修复效果一般时
  “基于现在的理解，推翻旧实现，重新实现优雅方案。”
* 让 Claude 自动修 bug
  粘贴 bug 并说 “fix”。
* 使用 subagents
  将任务卸载给子代理保持主上下文干净。

---

## 规划 / 规格

* 始终从 **plan mode** 开始。
* 使用 **AskUserQuestion** 工具让 Claude 采访你。
* 制定分阶段计划，每阶段包含多个测试。
* 用第二个 Claude 评审计划。
* 在执行前写详细规格以减少歧义。

---

## 工作流

* 每个 `CLAUDE.md` 文件最好 **少于 200 行**。
* Monorepo 使用多个 CLAUDE.md。
* 用 `.claude/rules/` 拆分大型指令。
* 工作流优先使用 **commands**。
* 为特定功能创建 **subagents + skills**。
* 避免 agent “笨区”，定期 compact。
* 小任务使用 vanilla Claude Code 更好。
* Monorepo 使用技能子目录。
* 使用 `/model` `/context` `/usage` `/config` 等命令。
* 使用 **thinking mode = true**。
* 使用 **Explanatory 输出风格**。
* Prompt 中使用 **ultrathink**。
* 使用 `/rename` 和 `/resume` 管理会话。
* 用 `/rewind` 回退错误操作。
* 经常 commit（至少每小时一次）。

---

## 高级工作流

* 使用 ASCII 图理解架构。
* 使用 agent teams + git worktrees 并行开发。
* 使用 `/loop` 监控部署和 PR。
* 使用 Ralph Wiggum 插件处理长任务。
* 使用 `/permissions` 进行权限控制。
* 使用 `/sandbox` 进行隔离。

---

## 调试

* 遇到问题时截图并给 Claude。
* 使用 MCP 访问 Chrome console 日志。
* 让 Claude 运行终端作为后台任务。
* 使用 `/doctor` 诊断安装问题。
* 使用 cross-model 做 QA。

---

## 工具

* 使用 iTerm / Ghostty / tmux 终端。
* 使用 Wispr Flow 语音输入。
* 使用 claude-code-voice-hooks。
* 使用 status line 监控上下文。
* 探索 settings.json 自定义配置。

---

## 每日习惯

* 每天更新 Claude Code。
* 关注社区论坛。
* 关注核心开发者。

---

# ☠️ 初创公司 / 商业产品

| Claude 功能        | 替代产品                               |
| ---------------- | ---------------------------------- |
| Code Review      | Greptile、CodeRabbit、Devin Review 等 |
| Voice Mode       | Wispr Flow、SuperWhisper            |
| Remote Control   | OpenClaw                           |
| Cowork           | OpenAI Operator、AgentShadow        |
| Tasks            | Beads                              |
| Plan Mode        | Agent OS                           |
| Skills / Plugins | YC AI wrapper startups             |

---

# 💰 十亿美元问题（Billion-Dollar Questions）

## Memory & Instructions

1. CLAUDE.md 中应该放什么？不应该放什么？
2. 是否需要单独的 constitution.md 或 rules.md？
3. CLAUDE.md 应多久更新一次？
4. 为什么 Claude 有时仍忽略 CLAUDE.md？

---

## Agents / Skills / Workflows

1. 何时使用 command、agent 或 skill？
2. 模型升级后是否需要更新 agent 和 workflow？
3. 子代理是否需要详细 persona？
4. 应使用内置 plan mode 还是自定义规划系统？
5. 个人 skill 与社区 skill 冲突时如何处理？
6. 是否可以仅通过 specs 重新生成整个代码库？

---

## Specs & Documentation

1. 每个功能是否都应该有 spec 文档？
2. spec 应多久更新一次？
3. 新功能如何影响旧 spec？

---

# 报告（REPORTS）

包含以下主题：

* Agent SDK vs CLI
* Browser Automation MCP
* Global vs Project Settings
* Skills in Monorepos
* Agent Memory
* Advanced Tool Use
* Usage & Rate Limits
* Agents vs Commands vs Skills
* LLM Degradation

---

# 使用方法

```
1. 将此仓库当作课程阅读，理解 commands、agents、skills、hooks。
2. 克隆仓库并尝试示例。
3. 在自己的项目中让 Claude 建议可应用的最佳实践。
```

---

# 开发者

工作流：

| Workflow                  | 描述             |
| ------------------------- | -------------- |
| workflow-concepts         | 更新 README 中的概念 |
| workflow-claude-settings  | 跟踪 Claude 设置变化 |
| workflow-claude-subagents | 跟踪子代理变化        |
| workflow-claude-commands  | 跟踪命令变化         |
| workflow-claude-skills    | 跟踪技能变化         |

# 参考资料

* any list
{:toc}
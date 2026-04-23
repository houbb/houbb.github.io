---
layout: post 
title: skills 面向开放 Agent Skills 生态的 CLI 工具
date: 2026-04-21 21:01:55 +0800
categories: [Ai]
tags: [skills, ai]
published: true
---

# skills

面向开放 Agent Skills 生态的 CLI 工具。

<!-- agent-list:start -->

支持 **OpenCode**、**Claude Code**、**Codex**、**Cursor**，以及 [另外 41 种](#available-agents)。

<!-- agent-list:end -->

---

## 安装一个 Skill

```bash
npx skills add vercel-labs/agent-skills
```

---

## 支持的来源格式

```bash
# GitHub 简写（owner/repo）
npx skills add vercel-labs/agent-skills

# 完整 GitHub URL
npx skills add https://github.com/vercel-labs/agent-skills

# 指向仓库中某个 skill 的路径
npx skills add https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines

# GitLab URL
npx skills add https://gitlab.com/org/repo

# 任意 git 地址
npx skills add git@github.com:vercel-labs/agent-skills.git

# 本地路径
npx skills add ./my-local-skills
```

---

## 参数选项

| 参数                        | 说明                                  |
| ------------------------- | ----------------------------------- |
| `-g, --global`            | 安装到用户目录（而非项目目录）                     |
| `-a, --agent <agents...>` | 指定目标 agent（如 `claude-code`、`codex`） |
| `-s, --skill <skills...>` | 指定安装的 skill（使用 `'*'` 表示全部）          |
| `-l, --list`              | 仅列出可用 skill，不执行安装                   |
| `--copy`                  | 使用复制而非符号链接                          |
| `-y, --yes`               | 跳过所有确认提示                            |
| `--all`                   | 将所有 skill 安装到所有 agent               |

---

## 使用示例

```bash
# 查看仓库中的 skills
npx skills add vercel-labs/agent-skills --list

# 安装指定 skills
npx skills add vercel-labs/agent-skills --skill frontend-design --skill skill-creator

# 安装带空格的 skill（需加引号）
npx skills add owner/repo --skill "Convex Best Practices"

# 安装到指定 agent
npx skills add vercel-labs/agent-skills -a claude-code -a opencode

# 非交互安装（CI/CD）
npx skills add vercel-labs/agent-skills --skill frontend-design -g -a claude-code -y

# 安装所有 skill 到所有 agent
npx skills add vercel-labs/agent-skills --all

# 安装所有 skill 到指定 agent
npx skills add vercel-labs/agent-skills --skill '*' -a claude-code

# 安装指定 skill 到所有 agent
npx skills add vercel-labs/agent-skills --agent '*' --skill frontend-design
```

---

## 安装范围

| 范围      | 参数   | 路径                  | 使用场景       |
| ------- | ---- | ------------------- | ---------- |
| **项目级** | 默认   | `./<agent>/skills/` | 随项目提交，团队共享 |
| **全局级** | `-g` | `~/<agent>/skills/` | 所有项目可用     |

---

## 安装方式

| 方式           | 说明                                   |
| ------------ | ------------------------------------ |
| **符号链接（推荐）** | 各 agent 指向统一源，便于维护与更新                |
| **复制**       | 为每个 agent 创建独立副本（适用于不支持 symlink 的环境） |

---

## 其他命令

| 命令                  | 说明           |
| ------------------- | ------------ |
| `npx skills list`   | 查看已安装 skills |
| `npx skills find`   | 搜索 skill     |
| `npx skills remove` | 删除 skill     |
| `npx skills update` | 更新 skill     |
| `npx skills init`   | 创建新 skill 模板 |

---

### skills list

```bash
# 所有 skill
npx skills list

# 全局
npx skills ls -g

# 按 agent 过滤
npx skills ls -a claude-code -a cursor
```

---

### skills find

```bash
# 交互式搜索
npx skills find

# 关键词搜索
npx skills find typescript
```

---

### skills update

```bash
# 更新全部
npx skills update

# 更新单个
npx skills update my-skill

# 更新多个
npx skills update frontend-design web-design-guidelines

# 指定范围
npx skills update -g
npx skills update -p

# 非交互
npx skills update -y
```

---

### skills init

```bash
# 当前目录
npx skills init

# 子目录
npx skills init my-skill
```

---

### skills remove

```bash
# 交互删除
npx skills remove

# 删除指定
npx skills remove web-design-guidelines

# 删除多个
npx skills remove frontend-design web-design-guidelines

# 全局删除
npx skills remove --global web-design-guidelines

# 指定 agent 删除
npx skills remove --agent claude-code cursor my-skill

# 删除全部
npx skills remove --all
```

---

## 什么是 Agent Skills？

Agent Skills 是可复用的指令集合，用于扩展编码 Agent 的能力。
定义在 `SKILL.md` 文件中，包含 YAML 前置信息（如 `name` 和 `description`）。

典型用途：

* 基于 git 历史生成发布说明
* 按团队规范自动创建 PR
* 集成外部工具（如 Linear、Notion）

👉 发现技能：**[https://skills.sh](https://skills.sh)**

---

## 支持的 Agent

Skills 可安装到多种 Agent（如 Claude Code、Codex、Cursor 等），CLI 会自动检测本地已安装的 Agent。

> 若未检测到，会提示你手动选择。

---

### ⚠ Kiro CLI 特别说明

安装后需手动在 `.kiro/agents/<agent>.json` 添加：

```json
{
  "resources": ["skill://.kiro/skills/**/SKILL.md"]
}
```

---

## 创建 Skill

一个 Skill 是一个目录，包含 `SKILL.md`：

```markdown
---
name: my-skill
description: 技能用途说明
---

# My Skill

## 使用场景

## 执行步骤
1. ...
2. ...
```

---

### 必填字段

* `name`：唯一标识（小写 + 连字符）
* `description`：功能描述

---

### 可选字段

```yaml
metadata:
  internal: true
```

👉 用于隐藏内部技能，仅在 `INSTALL_INTERNAL_SKILLS=1` 时可见。

---

## Skill 发现机制

CLI 会在以下路径查找：

* 根目录（含 SKILL.md）
* `skills/`
* `.agents/skills/`
* `.claude/skills/`
* `.cursor/skills/`
* 等多种 agent 标准目录

如果未找到，将进行递归扫描。

---

## 插件兼容

支持 `.claude-plugin` 声明的 skills：

```json
{
  "plugins": [
    {
      "skills": ["./skills/review"]
    }
  ]
}
```

👉 与 Claude Code 插件市场兼容

---

## 兼容性说明

大多数 Skills 跨 Agent 通用（遵循统一规范），但部分能力存在差异，例如：

* `allowed-tools`
* `context: fork`
* Hooks

---

## 故障排查

### 未找到 skill

* 检查是否存在 `SKILL.md`
* 是否包含 `name` 和 `description`

### Skill 未生效

* 检查安装路径
* 校验 YAML 格式
* 查看 Agent 文档

### 权限错误

* 确保目录可写

---

## 环境变量

| 变量                        | 说明     |
| ------------------------- | ------ |
| `INSTALL_INTERNAL_SKILLS` | 显示内部技能 |
| `DISABLE_TELEMETRY`       | 禁用遥测   |
| `DO_NOT_TRACK`            | 同上     |

```bash
INSTALL_INTERNAL_SKILLS=1 npx skills add vercel-labs/agent-skills --list
```

---

## 遥测

CLI 会收集匿名使用数据用于改进，不包含个人信息。
在 CI 环境中自动关闭。

---

## 相关链接

* Agent Skills 规范：[https://agentskills.io](https://agentskills.io)
* Skills 目录：[https://skills.sh](https://skills.sh)
* 各类 Agent 官方文档（Claude、Codex、Cursor 等）

---

## 许可证

MIT


# 参考资料

* any list
{:toc}
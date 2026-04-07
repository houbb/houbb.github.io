---
layout: post 
title: obsidian skills 用于 Obsidian 的智能体技能
date: 2026-04-07 21:01:55 +0800
categories: [AI]
tags: [ai, llm, skills, agent]
published: true
---

# 用于 Obsidian 的智能体技能

这些技能遵循[智能体技能规范](https://agentskills.io/specification)，因此任何兼容智能体技能的工具（包括 Claude Code 和 Codex CLI）都可以使用它们。

## 安装

### 市场

```
/plugin marketplace add kepano/obsidian-skills
/plugin install obsidian@obsidian-skills
```

### npx skills

```
npx skills add git@github.com:kepano/obsidian-skills.git
```

### 手动安装

#### Claude Code

将此仓库的内容添加到 Obsidian 仓库根目录下的 `/.claude` 文件夹中（或您与 Claude Code 一起使用的任何文件夹）。更多信息请参阅[官方 Claude 技能文档](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)。

#### Codex CLI

将 `skills/` 目录复制到您的 Codex 技能路径中（通常为 `~/.codex/skills`）。有关标准技能格式，请参见[智能体技能规范](https://agentskills.io/specification)。

#### OpenCode

将整个仓库克隆到 OpenCode 技能目录（`~/.opencode/skills/`）中：

```sh
git clone https://github.com/kepano/obsidian-skills.git ~/.opencode/skills/obsidian-skills
```

不要只复制内部的 `skills/` 文件夹——请克隆完整仓库，以使目录结构为 `~/.opencode/skills/obsidian-skills/skills/<技能名称>/SKILL.md`。

OpenCode 会自动发现 `~/.opencode/skills/` 下的所有 `SKILL.md` 文件。无需更改 `opencode.json` 或任何配置文件。重启 OpenCode 后技能即可使用。

## 技能

| 技能 | 描述 |
|-------|-------------|
| [obsidian-markdown](skills/obsidian-markdown) | 创建和编辑 [Obsidian 风味 Markdown](https://help.obsidian.md/obsidian-flavored-markdown)（`.md`），支持维基链接、嵌入、标注、属性以及其他 Obsidian 特有语法 |
| [obsidian-bases](skills/obsidian-bases) | 创建和编辑 [Obsidian Bases](https://help.obsidian.md/bases/syntax)（`.base`），支持视图、筛选器、公式和摘要 |
| [json-canvas](skills/json-canvas) | 创建和编辑 [JSON Canvas](https://jsoncanvas.org/) 文件（`.canvas`），支持节点、边、组和连接 |
| [obsidian-cli](skills/obsidian-cli) | 通过 [Obsidian CLI](https://help.obsidian.md/cli) 与 Obsidian 仓库交互，包括插件和主题开发 |
| [defuddle](skills/defuddle) | 使用 [Defuddle](https://github.com/kepano/defuddle-cli) 从网页中提取干净的 markdown，去除杂音以节省令牌 |

# 参考资料

* any list
{:toc}
---
layout: post
title: 一个 Claude Code 插件，用于展示当前正在发生的事情——上下文使用情况、活跃工具、运行中的代理以及待办进度。始终显示在你的输入下方。
date: 2026-03-18 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# Claude HUD

一个 Claude Code 插件，用于展示当前正在发生的事情——上下文使用情况、活跃工具、运行中的代理以及待办进度。始终显示在你的输入下方。

[![License](https://img.shields.io/github/license/jarrodwatts/claude-hud?v=2)](LICENSE)
[![Stars](https://img.shields.io/github/stars/jarrodwatts/claude-hud)](https://github.com/jarrodwatts/claude-hud/stargazers)

![Claude HUD in action](claude-hud-preview-5-2.png)

## 安装

在一个 Claude Code 实例中，运行以下命令：

**步骤 1：添加市场**

```
/plugin marketplace add jarrodwatts/claude-hud
```

**步骤 2：安装插件**

<details>
<summary><strong>⚠️ Linux 用户：请先点击这里</strong></summary>

在 Linux 上，`/tmp` 通常是一个独立的文件系统（tmpfs），这会导致插件安装失败，并报错：

```
EXDEV: cross-device link not permitted
```

**修复方法**：在安装前设置 TMPDIR：

```bash
mkdir -p ~/.cache/tmp && TMPDIR=~/.cache/tmp claude
```

然后在该会话中运行下面的安装命令。这是一个 [Claude Code 平台限制](https://github.com/anthropics/claude-code/issues/14799)。

</details>

```
/plugin install claude-hud
```

**步骤 3：配置状态栏**

```
/claude-hud:setup
```

完成！HUD 会立即出现——无需重启。

---

## 什么是 Claude HUD？

Claude HUD 为你提供关于 Claude Code 会话中正在发生情况的更深入洞察。

| 你看到的内容     | 为什么重要                     |
| ---------- | ------------------------- |
| **项目路径**   | 知道你当前所在的项目（可配置显示 1-3 级目录） |
| **上下文健康度** | 在为时已晚之前，精确了解上下文窗口的使用情况    |
| **工具活动**   | 实时查看 Claude 读取、编辑和搜索文件的过程 |
| **代理跟踪**   | 查看哪些子代理正在运行以及它们在做什么       |
| **待办进度**   | 实时跟踪任务完成情况                |

## 显示内容

### 默认（2 行）

```
[Opus | Max] │ my-project git:(main*)
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% (1h 30m / 5h)
```

* **第 1 行** — 模型、套餐名称（或 `Bedrock`）、项目路径、git 分支
* **第 2 行** — 上下文条（绿色 → 黄色 → 红色）和使用速率限制

### 可选行（通过 `/claude-hud:configure` 启用）

```
◐ Edit: auth.ts | ✓ Read ×3 | ✓ Grep ×2        ← 工具活动
◐ explore [haiku]: Finding auth code (2m 15s)    ← 代理状态
▸ Fix authentication bug (2/5)                   ← 待办进度
```

---

## 工作原理

Claude HUD 使用 Claude Code 原生的 **statusline API** ——无需单独窗口，无需 tmux，可在任何终端中运行。

```
Claude Code → stdin JSON → claude-hud → stdout → 显示在你的终端中
           ↘ transcript JSONL（工具、代理、待办）
```

**关键特性：**

* 使用来自 Claude Code 的原生 token 数据（非估算）
* 根据 Claude Code 报告的上下文窗口大小自动扩展，包括新的 1M 上下文会话
* 解析 transcript 以获取工具/代理活动
* 每约 300ms 更新一次

---

## 配置

随时自定义你的 HUD：

```
/claude-hud:configure
```

引导式流程会处理布局和显示开关。高级覆盖（如自定义颜色和阈值）会被保留，但需要通过直接编辑配置文件进行设置：

* **首次设置**：选择一个预设（Full/Essential/Minimal），然后微调各个元素
* **随时自定义**：开启/关闭项目，调整 git 显示风格，切换布局
* **保存前预览**：在提交更改前查看 HUD 的实际效果

### 预设

| 预设            | 显示内容                         |
| ------------- | ---------------------------- |
| **Full**      | 启用全部内容——工具、代理、待办、git、使用情况、时长 |
| **Essential** | 活动行 + git 状态，信息最简但保留关键内容     |
| **Minimal**   | 核心信息——仅模型名称和上下文条             |

选择预设后，你可以单独开启或关闭各个元素。

### 手动配置

直接编辑 `~/.claude/plugins/claude-hud/config.json` 以进行高级设置，例如 `colors.*`、`pathLevels` 和阈值覆盖。运行 `/claude-hud:configure` 不会覆盖这些手动设置。

### 选项

| 选项                             | 类型                                 | 默认值                                                                    | 描述                               |
| ------------------------------ | ---------------------------------- | ---------------------------------------------------------------------- | -------------------------------- |
| `lineLayout`                   | string                             | `expanded`                                                             | 布局：`expanded`（多行）或 `compact`（单行） |
| `pathLevels`                   | 1-3                                | 1                                                                      | 项目路径显示的目录层级                      |
| `elementOrder`                 | string[]                           | `["project","context","usage","environment","tools","agents","todos"]` | 扩展模式下的元素顺序，省略即隐藏                 |
| `gitStatus.enabled`            | boolean                            | true                                                                   | 在 HUD 中显示 git 分支                 |
| `gitStatus.showDirty`          | boolean                            | true                                                                   | 显示未提交更改的 `*`                     |
| `gitStatus.showAheadBehind`    | boolean                            | false                                                                  | 显示与远端差异 `↑N ↓N`                  |
| `gitStatus.showFileStats`      | boolean                            | false                                                                  | 显示文件变更统计 `!M +A ✘D ?U`           |
| `display.showModel`            | boolean                            | true                                                                   | 显示模型名称 `[Opus]`                  |
| `display.showContextBar`       | boolean                            | true                                                                   | 显示上下文条 `████░░░░░░`              |
| `display.contextValue`         | `percent` | `tokens` | `remaining` | `percent`                                                              | 上下文显示格式                          |
| `display.showConfigCounts`     | boolean                            | false                                                                  | 显示 CLAUDE.md、规则、MCP、hooks 数量     |
| `display.showDuration`         | boolean                            | false                                                                  | 显示会话时长 `⏱️ 5m`                   |
| `display.showSpeed`            | boolean                            | false                                                                  | 显示输出 token 速度                    |
| `display.showUsage`            | boolean                            | true                                                                   | 显示使用限制                           |
| `display.usageBarEnabled`      | boolean                            | true                                                                   | 使用条形图显示使用量                       |
| `display.sevenDayThreshold`    | 0-100                              | 80                                                                     | 超过阈值显示 7 天使用情况                   |
| `display.showTokenBreakdown`   | boolean                            | true                                                                   | 高上下文时显示 token 详情                 |
| `display.showTools`            | boolean                            | false                                                                  | 显示工具活动                           |
| `display.showAgents`           | boolean                            | false                                                                  | 显示代理活动                           |
| `display.showTodos`            | boolean                            | false                                                                  | 显示待办进度                           |
| `display.showSessionName`      | boolean                            | false                                                                  | 显示会话名称                           |
| `usage.cacheTtlSeconds`        | number                             | 60                                                                     | 使用 API 成功缓存时间（秒）                 |
| `usage.failureCacheTtlSeconds` | number                             | 15                                                                     | 使用 API 失败缓存时间（秒）                 |
| `colors.context`               | 颜色名                                | `green`                                                                | 上下文条颜色                           |
| `colors.usage`                 | 颜色名                                | `brightBlue`                                                           | 使用条颜色                            |
| `colors.warning`               | 颜色名                                | `yellow`                                                               | 警告颜色                             |
| `colors.usageWarning`          | 颜色名                                | `brightMagenta`                                                        | 使用警告颜色                           |
| `colors.critical`              | 颜色名                                | `red`                                                                  | 严重状态颜色                           |

支持的颜色：`red`、`green`、`yellow`、`magenta`、`cyan`、`brightBlue`、`brightMagenta`。

---

## 使用限制（Pro/Max/Team）

默认启用使用量显示，仅适用于 Claude Pro、Max 和 Team 用户。

当超过 `display.sevenDayThreshold`（默认 80%）时，会显示 7 天使用情况：

```
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% (1h 30m / 5h) | ██████████ 85% (2d / 7d)
```

如需禁用，将 `display.showUsage` 设为 `false`。

**要求：**

* Claude Pro / Max / Team 订阅
* Claude Code OAuth 凭证（登录时自动创建）

**故障排查：**

* 确认使用的是订阅账号（非 API key）
* 检查 `display.showUsage` 未被关闭
* API 用户不会显示使用量
* AWS Bedrock 模型会隐藏使用量
* 非默认 API 地址不会显示使用量
* 代理环境需配置 `HTTPS_PROXY`
* 高延迟环境可调整 `CLAUDE_HUD_USAGE_TIMEOUT_MS`

---

## 示例配置

```json
{
  "lineLayout": "expanded",
  "pathLevels": 2,
  "elementOrder": ["project", "tools", "context", "usage", "environment", "agents", "todos"],
  "gitStatus": {
    "enabled": true,
    "showDirty": true,
    "showAheadBehind": true,
    "showFileStats": true
  },
  "display": {
    "showTools": true,
    "showAgents": true,
    "showTodos": true,
    "showConfigCounts": true,
    "showDuration": true
  },
  "colors": {
    "context": "cyan",
    "usage": "cyan",
    "warning": "yellow",
    "usageWarning": "magenta",
    "critical": "red"
  },
  "usage": {
    "cacheTtlSeconds": 120,
    "failureCacheTtlSeconds": 30
  }
}
```

---

## 显示示例

**1 级目录（默认）：**
`[Opus] │ my-project git:(main)`

**2 级目录：**
`[Opus] │ apps/my-project git:(main)`

**3 级目录：**
`[Opus] │ dev/apps/my-project git:(main)`

**带未提交标识：**
`[Opus] │ my-project git:(main*)`

**带 ahead/behind：**
`[Opus] │ my-project git:(main ↑2 ↓1)`

**带文件统计：**
`[Opus] │ my-project git:(main* !3 +1 ?2)`

* `!` = 修改文件
* `+` = 新增/已暂存
* `✘` = 删除
* `?` = 未跟踪

0 的计数会被省略以保持简洁。

---

## 故障排查

**配置未生效？**

* 检查 JSON 语法错误
* 确保参数值合法
* 删除配置并重新生成

**git 状态未显示？**

* 确认在 git 仓库中
* 检查 `gitStatus.enabled`

**工具/代理/待办未显示？**

* 默认关闭，需要手动开启
* 仅在有活动时显示

---

## 依赖

* Claude Code v1.0.80+
* Node.js 18+ 或 Bun

---

## 开发

```bash
git clone https://github.com/jarrodwatts/claude-hud
cd claude-hud
npm ci && npm run build
npm test
```

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 许可证

MIT ——见 [LICENSE](LICENSE)

---

## Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=jarrodwatts/claude-hud\&type=Date)](https://star-history.com/#jarrodwatts/claude-hud&Date)


# 参考资料

* any list
{:toc}
---
layout: post 
title: claude supermemory（AI 记忆引擎）
date: 2026-04-01 21:01:55 +0800
categories: [AI]
tags: [ai, LLM]
published: true
---


# 安装实战笔记

## 安装（Installation）

```bash
/plugin marketplace add supermemoryai/claude-supermemory
/plugin install claude-supermemory
```

设置你的 API Key（在 [https://app.supermemory.ai](https://app.supermemory.ai) 获取）：

```bash
export SUPERMEMORY_CC_API_KEY="sm_..."
```

# Claude-Supermemory

<img width="4000" height="2130" alt="image (6)" src="https://github.com/user-attachments/assets/07e63ac4-b67d-457b-9029-1dc5d860e920" />

> **✨ 需要 [Supermemory Pro 或更高版本](https://app.supermemory.ai/?view=integrations)** —— 解锁你 Claude 代码的最先进记忆能力。

一个 Claude Code 插件，通过 [Supermemory](https://supermemory.ai) 为你的 AI 提供跨会话的持久化记忆。
你的 agent 可以记住你做过的事情——跨会话、跨项目。

## 功能（Features）

* **团队记忆（Team Memory）** —— 在团队内共享项目知识，与个人记忆相互隔离
* **自动捕获（Auto Capture）** —— 会话结束时自动保存对话
* **项目配置（Project Config）** —— 每个仓库独立的设置、API Key 和容器标签

## 安装（Installation）

```bash
/plugin marketplace add supermemoryai/claude-supermemory
/plugin install claude-supermemory
```

设置你的 API Key（在 [https://app.supermemory.ai](https://app.supermemory.ai) 获取）：

```bash
export SUPERMEMORY_CC_API_KEY="sm_..."
```

## 工作原理（How It Works）

* **super-search** —— 询问过去的工作或历史会话，Claude 会在你的记忆中进行搜索
* **super-save** —— 请求保存重要信息，Claude 会将其保存到团队记忆中

## 命令（Commands）

| 命令                                   | 描述          |
| ------------------------------------ | ----------- |
| `/claude-supermemory:index`          | 索引代码库的架构与模式 |
| `/claude-supermemory:project-config` | 配置项目级别设置    |
| `/claude-supermemory:logout`         | 清除已保存的凭据    |

## 配置（Configuration）

### 环境变量（Environment）

```bash
SUPERMEMORY_CC_API_KEY=sm_...    # 必填
SUPERMEMORY_DEBUG=true           # 可选：启用调试日志
```

### 全局设置（Global Settings）— `~/.supermemory-claude/settings.json`

```json
{
  "maxProfileItems": 5,
  "signalExtraction": true,
  "signalKeywords": ["remember", "architecture", "decision", "bug", "fix"],
  "signalTurnsBefore": 3,
  "includeTools": ["Edit", "Write"]
}
```

| 选项                  | 描述                  |
| ------------------- | ------------------- |
| `maxProfileItems`   | 上下文中最多包含的记忆数量（默认：5） |
| `signalExtraction`  | 仅捕获重要对话轮次（默认：false） |
| `signalKeywords`    | 触发捕获的关键词            |
| `signalTurnsBefore` | 信号出现前包含的上下文轮数（默认：3） |
| `includeTools`      | 需要显式捕获的工具           |

### 项目配置（Project Config）— `.claude/.supermemory-claude/config.json`

针对每个仓库的覆盖配置。可运行 `/claude-supermemory:project-config` 或手动创建：

```json
{
  "apiKey": "sm_...",
  "repoContainerTag": "my-team-project",
  "signalExtraction": true
}
```

| 选项                     | 描述          |
| ---------------------- | ----------- |
| `apiKey`               | 项目级 API Key |
| `personalContainerTag` | 覆盖个人容器标签    |
| `repoContainerTag`     | 覆盖团队容器标签    |

## 许可证（License）

MIT

# 参考资料

* any list
{:toc}
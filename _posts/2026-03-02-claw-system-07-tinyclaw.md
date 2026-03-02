---
layout: post
title: TinyClaw 多 Agent、多团队、多渠道、7×24 小时 AI 助手
date: 2026-03-02 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---



多 Agent、多团队、多渠道、7×24 小时 AI 助手

运行多个 AI Agent 团队，在隔离的工作空间中同时协作完成任务。

## 功能特性（Features）

* 多 Agent —— 运行多个具备专业角色的隔离 AI Agent
* 多团队协作 —— Agent 可通过链式执行与扇出（fan-out）方式将任务交接给团队成员
* 多渠道 —— 支持 Discord、WhatsApp 与 Telegram
* Web 门户（TinyOffice）—— 基于浏览器的控制台，用于聊天、Agent、团队、任务、日志与设置管理
* 团队观测 —— 可通过 `tinyclaw team visualize` 可视化查看 Agent 团队对话
* 多 AI Provider —— 支持 Anthropic Claude 与 OpenAI Codex，并可使用现有订阅且不违反 ToS
* 并行处理 —— Agent 可并发处理消息
* 实时 TUI 仪表盘 —— 实时团队链路可视化监控
* 持久化会话 —— 重启后仍保留对话上下文
* SQLite 队列 —— 原子事务、重试机制与死信管理
* 插件系统 —— 支持通过自定义插件扩展消息 Hook 与事件监听
* 7×24 小时运行 —— 基于 tmux 实现持续在线运行

---

## 社区

Discord：

[https://discord.com/invite/jH6AcEChuD](https://discord.com/invite/jH6AcEChuD)

项目正在积极寻找贡献者。

---

## 快速开始（Quick Start）

### 前置条件

* macOS、Linux 或 Windows（WSL2）
* Node.js v18+
* tmux、jq
* Bash 4.0+（macOS：`brew install bash`）
* Claude Code CLI（用于 Anthropic Provider）
* Codex CLI（用于 OpenAI Provider）

---

### 安装

#### 方式 1：一行安装（推荐）

```bash
curl -fsSL https://raw.githubusercontent.com/TinyAGI/tinyclaw/main/scripts/remote-install.sh | bash
```

---

#### 方式 2：从 Release 安装

```bash
wget https://github.com/TinyAGI/tinyclaw/releases/latest/download/tinyclaw-bundle.tar.gz
tar -xzf tinyclaw-bundle.tar.gz
cd tinyclaw && ./scripts/install.sh
```

---

#### 方式 3：源码安装

```bash
git clone https://github.com/TinyAGI/tinyclaw.git
cd tinyclaw && npm install && ./scripts/install.sh
```

---

### 首次运行

```bash
tinyclaw start
```

交互式向导将引导完成：

1. Channel 选择（Discord / WhatsApp / Telegram）
2. Bot Token 配置
3. Workspace 设置
4. 默认 Agent 配置
5. AI Provider 选择
6. 模型选择（Sonnet / Opus / GPT-5.3 等）
7. Heartbeat 检查周期

---

## TinyOffice Web 门户

TinyClaw 内置 `tinyoffice/`（Next.js Web 控制台）。

```html
<div align="center">
  <img src="./docs/images/tinyoffice.png" alt="TinyOffice Office View" width="700" />
</div>
```

### TinyOffice 功能

* Dashboard —— 实时系统与队列状态
* Chat Console —— 向 Agent 或 Team 发送消息
* Agents & Teams —— 创建与管理 Agent/团队
* Tasks（看板）—— 任务创建、拖拽与分配
* Logs & Events —— 队列日志与实时事件
* Settings —— UI 编辑 `settings.json`
* Office View —— Agent 交互可视化模拟

---

### 启动 TinyOffice

先启动 TinyClaw：

```bash
cd tinyoffice
npm install
npm run dev
```

打开：

```
http://localhost:3000
```

若 API 地址不同：

```bash
echo 'NEXT_PUBLIC_API_URL=http://localhost:3777' > .env.local
```

---

## 命令（Commands）

CLI 可通过：

```
tinyclaw
```

或：

```
./tinyclaw.sh
```

执行。

---

### 核心命令

| 命令      | 描述               | 示例                  |
| ------- | ---------------- | ------------------- |
| start   | 启动 TinyClaw 守护进程 | tinyclaw start      |
| stop    | 停止全部进程           | tinyclaw stop       |
| restart | 重启               | tinyclaw restart    |
| status  | 查看状态             | tinyclaw status     |
| setup   | 重新配置             | tinyclaw setup      |
| logs    | 查看日志             | tinyclaw logs queue |
| attach  | 连接 tmux 会话       | tinyclaw attach     |

---

### Agent 命令

| 命令             | 描述          |
| -------------- | ----------- |
| agent list     | 列出 Agent    |
| agent add      | 新建 Agent    |
| agent show     | 查看配置        |
| agent remove   | 删除 Agent    |
| agent reset    | 重置对话        |
| agent provider | 设置 Provider |

---

### Team 命令

| 命令             | 描述      |
| -------------- | ------- |
| team list      | 列出团队    |
| team add       | 新建团队    |
| team show      | 查看团队    |
| team remove    | 删除团队    |
| team visualize | 实时链路可视化 |

---

### Pairing（发送者授权）

用于控制谁可以向 Agent 发送消息。

行为：

* 未知发送者首次发送 → 生成配对码
* 未批准前消息被静默阻止
* 批准后正常通信

---

## Agent 使用

### 消息路由

```
@coder 修复认证问题
@writer 编写 API 文档
@researcher 查找 transformer 论文
help me with this
```

无前缀消息发送至默认 Agent。

---

### Agent 配置

`.tinyclaw/settings.json`

```json
{
  "agents": {
    "coder": {
      "name": "Code Assistant",
      "provider": "anthropic",
      "model": "sonnet"
    }
  }
}
```

每个 Agent：

* 独立 Workspace
* 独立对话历史
* 独立配置
* 可单独重置

---

## 架构（Architecture）

```
Message Channels
        ↓
SQLite Queue
        ↓
Parallel Agent Processing
        ↓
Claude CLI Workspace
```

核心特性：

* SQLite WAL 原子事务
* Agent 并行执行
* 单 Agent 内顺序保证
* 自动重试 + 死信队列
* Workspace 隔离

---

## 目录结构

```
tinyclaw/
├── .tinyclaw/
├── tinyclaw-workspace/
├── src/
├── dist/
├── lib/
├── scripts/
├── tinyoffice/
└── tinyclaw.sh
```

---

## 配置（Configuration）

配置文件：

```
.tinyclaw/settings.json
```

包含：

* Channel 配置
* Workspace
* Agents
* Teams
* Monitoring

---

### Heartbeat

编辑：

```bash
nano ~/tinyclaw-workspace/coder/heartbeat.md
```

默认：

```markdown
检查：

1. 待处理任务
2. 错误
3. 未读消息
```

---

## 使用场景

### 个人 AI 助手

```
提醒我给妈妈打电话
```

Heartbeat 自动触发提醒。

---

### 多 Agent 工作流

```
@coder 修复 Bug
@writer 编写文档
@reviewer 质量检查
```

---

### 团队协作

```
@dev fix auth bug
```

自动：

Leader → 成员 → 审查 → 汇总回复。

---

### 跨设备访问

* 手机 WhatsApp
* 桌面 Discord
* Telegram
* CLI 自动化

所有 Channel 共享上下文。

---

## 文档

* AGENTS.md
* TEAMS.md
* QUEUE.md
* PLUGINS.md
* TROUBLESHOOTING.md

---

## 故障排查

快速修复：

```bash
tinyclaw stop && rm -rf .tinyclaw/queue/* && tinyclaw start
```

常见问题：

* Bash 版本过低
* WhatsApp 未连接
* 消息卡住
* Agent 未找到
* settings.json 损坏（自动修复并生成备份）

---

## 致谢

灵感来源：

* OpenClaw
* Claude Code
* Codex CLI
* discord.js
* whatsapp-web.js
* node-telegram-bot-api

---

## 许可证

MIT

---

**TinyClaw —— 小体积，强能力。** 🦞


# 参考资料

https://github.com/zeroclaw-labs/zeroclaw/blob/main/docs/i18n/zh-CN/README.md

* any list
{:toc}
---
layout: post 
title: Beads 为编码 Agent 提供**持久化、结构化的记忆能力**。
date: 2026-04-27 21:01:55 +0800
categories: [Ai]
tags: [agent, ai]
published: true
---

# bd - Beads

**面向 AI Agent 的分布式图结构问题追踪系统，由 [Dolt](https://github.com/dolthub/dolt) 驱动。**

**支持平台：** macOS、Linux、Windows、FreeBSD

**文档：** [https://gastownhall.github.io/beads/](https://gastownhall.github.io/beads/)

Beads 为编码 Agent 提供**持久化、结构化的记忆能力**。
它使用**具备依赖关系感知的图结构**替代混乱的 Markdown 计划，使 Agent 能够在长周期任务中保持上下文而不丢失。

---

## ⚡ 快速开始

```bash
# 安装 beads CLI（系统级安装 —— 不要将此仓库 clone 到你的项目中）
curl -fsSL https://raw.githubusercontent.com/gastownhall/beads/main/scripts/install.sh | bash

# 在你的项目中初始化
cd your-project
bd init

# 告诉你的 Agent
echo "Use 'bd' for task tracking" >> AGENTS.md
```

**注意：** Beads 是一个一次安装、全局使用的 CLI 工具。你无需将该仓库 clone 到你的项目中。

---

## 🛠 功能特性

* **基于 [Dolt](https://github.com/dolthub/dolt)：**
  具备版本控制能力的 SQL 数据库，支持单元格级别合并（cell-level merge）、原生分支（branching）以及通过 Dolt 远程仓库实现的内置同步。

* **为 Agent 优化：**
  支持 JSON 输出、依赖关系跟踪，以及自动识别“就绪任务”（auto-ready task detection）。

* **零冲突：**
  基于哈希的 ID（如 `bd-a1b2`）可避免多 Agent / 多分支工作流中的合并冲突。

* **压缩（Compaction）：**
  通过语义级“记忆衰减”（memory decay）对已关闭的旧任务进行摘要，以节省上下文窗口。

* **消息机制：**
  支持消息类型 Issue，具备线程（`--thread`）、临时生命周期（ephemeral lifecycle）以及邮件委派（mail delegation）能力。

* **图关系链接：**
  支持 `relates_to`、`duplicates`、`supersedes`、`replies_to` 等关系，用于构建知识图谱。

---

## 📖 核心命令

| 命令                            | 操作                                 |
| ----------------------------- | ---------------------------------- |
| `bd ready`                    | 列出没有未解决阻塞项的任务                      |
| `bd create "Title" -p 0`      | 创建一个 P0 优先级任务                      |
| `bd update <id> --claim`      | 原子化领取任务（设置 assignee + in_progress） |
| `bd dep add <child> <parent>` | 建立任务关系（阻塞、关联、父子）                   |
| `bd show <id>`                | 查看任务详情及审计轨迹                        |

---

## 🔗 层级结构与工作流

Beads 支持用于 Epic 的层级 ID：

* `bd-a3f8`（Epic）
* `bd-a3f8.1`（Task）
* `bd-a3f8.1.1`（Sub-task）

**隐身模式（Stealth Mode）：**
执行 `bd init --stealth` 可在本地使用 Beads，而不向主仓库提交任何文件。非常适合在共享项目中进行个人使用。详见下文 [Git-Free Usage](#-git-free-usage)。

**贡献者 vs 维护者：**

在开源项目中：

* **贡献者（Contributors，fork 仓库）：**
  使用 `bd init --contributor` 将规划类 Issue 路由到独立仓库（例如 `~/.beads-planning`），避免实验性内容进入 PR。

* **维护者（Maintainers，具备写权限）：**
  Beads 会通过 SSH URL 或带凭证的 HTTPS 自动识别维护者身份。
  仅当使用无凭证的 GitHub HTTPS 且拥有写权限时，才需要手动设置：
  `git config beads.role maintainer`

---

## 📦 安装

```bash
brew install beads           # macOS / Linux（推荐）
npm install -g @beads/bd     # Node.js 用户
```

**其他安装方式：**
[安装脚本](docs/INSTALLING.md#quick-install-script-all-platforms) |
[go install](docs/INSTALLING.md#a-note-on-go-install-capability) |
[源码构建](docs/INSTALLING.md#build-dependencies-contributors-only) |
[Windows](docs/INSTALLING.md#windows-11) |
[Arch AUR](docs/INSTALLING.md#linux)

**系统要求：** macOS、Linux、Windows 或 FreeBSD。
完整安装指南见：[docs/INSTALLING.md](docs/INSTALLING.md)

---

### 安全与校验

在信任任何下载的二进制文件之前，请使用 release 中的 `checksums.txt` 校验其哈希值。

安装脚本会在安装前自动校验发布版本的校验值。
对于手动安装，请在首次运行前自行完成校验。

在 macOS 上，`scripts/install.sh` 默认会保留下载的签名。
本地临时重新签名（ad-hoc re-sign）需显式开启：
`BEADS_INSTALL_RESIGN_MACOS=1`

Windows 防病毒误报及校验流程详见：
[docs/ANTIVIRUS.md](docs/ANTIVIRUS.md)

---

## 💾 存储模式

Beads 使用 [Dolt](https://github.com/dolthub/dolt) 作为数据库，提供两种模式：

---

### Embedded 模式（默认）

```bash
bd init
```

Dolt 以内嵌方式运行（in-process），无需外部服务器。
数据存储在 `.beads/embeddeddolt/`。

仅支持单写者（通过文件锁保证）。
这是大多数用户的推荐模式。

---

### Server 模式

```bash
bd init --server
```

连接外部 `dolt sql-server`。
数据存储在 `.beads/dolt/`。

支持多个并发写入。
可通过参数或环境变量配置连接：

| Flag              | Env Var                    | 默认值                             |
| ----------------- | -------------------------- | ------------------------------- |
| `--server-host`   | `BEADS_DOLT_SERVER_HOST`   | `127.0.0.1`                     |
| `--server-port`   | `BEADS_DOLT_SERVER_PORT`   | `3307`                          |
| `--server-socket` | `BEADS_DOLT_SERVER_SOCKET` | （无，默认使用 TCP）                    |
| `--server-user`   | `BEADS_DOLT_SERVER_USER`   | `root`                          |
|                   | `BEADS_DOLT_PASSWORD`      | （无）                             |
|                   | `BEADS_DOLT_CLI_DIR`       | 本地 Dolt 数据库路径（用于 CLI push/pull） |

---

**Unix 域套接字：**
使用 `--server-socket` 可通过 Unix socket 连接（替代 TCP）。

优势：

* 避免多项目间端口冲突
* 适用于沙箱环境（如 Claude Code）中基于文件的访问控制优于网络白名单

Dolt 服务器需通过以下方式启动：

```bash
dolt sql-server --socket <path>
```

注意：socket 模式不支持自动启动。

---

当 `BEADS_DOLT_SERVER_MODE=1` 指向一个由 Beads 外部管理的 Dolt 服务时：

如果 `bd dolt push` / `bd dolt pull` 需要使用本地 `dolt` CLI（例如 git 协议远程或仅在当前 shell 中存在的凭证），需设置：

```
BEADS_DOLT_CLI_DIR
```

该路径应为实际 Dolt 数据库目录，而不是 server 根目录。

---

## 🔄 备份与迁移

使用 `bd backup` 进行数据库备份及模式迁移：

```bash
# 设置备份目标并执行同步
bd backup init /path/to/backup
bd backup sync

# 在新项目中恢复（任意模式）
bd init           # 或 bd init --server
bd backup restore --force /path/to/backup
```

完整迁移说明见：
[docs/DOLT.md](docs/DOLT.md#migrating-between-backends)

---

## 🌐 社区工具

查看社区构建的 UI、扩展及集成列表：
[docs/COMMUNITY_TOOLS.md](docs/COMMUNITY_TOOLS.md)

包括：

* 终端界面
* Web UI
* 编辑器扩展
* 原生应用

---

## 🚀 无 Git 使用

Beads 可在无 Git 环境下运行。

Dolt 数据库作为存储后端 —— Git 集成（hook、仓库发现、身份识别）为可选功能。

```bash
# 在无 git 环境初始化
export BEADS_DIR=/path/to/your/project/.beads
bd init --quiet --stealth

# 所有核心命令均无需 git
bd create "Fix auth bug" -p 1 -t bug
bd ready --json
bd update bd-a1b2 --claim
bd prime
bd close bd-a1b2 "Fixed"
```

`BEADS_DIR` 指定 `.beads/` 数据目录位置，从而绕过 git 仓库发现机制。

`--stealth` 会在配置中设置 `no-git-ops: true`，禁用所有 git hook 安装及 git 操作。

---

适用场景：

* **非 Git 版本控制系统**（Sapling、Jujutsu、Piper）—— 无需 `.git/`
* **单体仓库（Monorepo）** —— 指定子目录
* **CI/CD** —— 无仓库副作用的隔离任务追踪
* **评估 / 测试** —— 在 `/tmp` 中使用临时数据库

---

在无 git 场景下使用守护进程模式：

```bash
bd daemon start --local
```

（参见 [PR #433](https://github.com/gastownhall/beads/pull/433)）

# 参考资料

* any list
{:toc}
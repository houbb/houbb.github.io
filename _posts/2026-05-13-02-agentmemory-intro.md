---
layout: post 
title: rohitg00/agentmemory 基于现实世界基准测试的 AI 编码代理持久化记忆系统
date: 2026-05-13 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---


# GitHub - rohitg00/agentmemory: #1 基于现实世界基准测试的 AI 编码代理持久化记忆系统

**您的编码代理记住一切。无需再重复解释。构建于 iii 引擎之上。**
为 Claude Code、Cursor、Gemini CLI、Codex CLI、Hermes、OpenClaw、pi、OpenCode 以及任何 MCP 客户端提供持久化记忆。

_本要点通过置信度评分、生命周期、知识图谱和混合搜索扩展了 Karpathy 的 LLM Wiki 模式：agentmemory 是其具体实现。_

快速开始 • 基准测试 • 竞品对比 • 代理支持 • 工作原理 • MCP • 查看器 • iii 控制台 • 由 iii 驱动 • 配置 • API

* * *

agentmemory 可与任何支持钩子（hooks）、MCP 或 REST API 的代理协同工作。所有代理共享同一个记忆服务器。

| Claude Code | OpenClaw | Hermes | Cursor | Gemini CLI | OpenCode | Codex CLI | Cline |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 12 钩子 + MCP + 技能 | MCP + 插件 | MCP + 插件 | MCP 服务器 | MCP 服务器 | MCP 服务器 | 6 钩子 + MCP + 技能 | MCP 服务器 |

| Goose | Kilo Code | Aider | Claude Desktop | Windsurf | Roo Code | Claude SDK | 任何代理 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| MCP 服务器 | MCP 服务器 | REST API | MCP 服务器 | MCP 服务器 | MCP 服务器 | AgentSDKProvider | REST API |

适用于**任何**支持 MCP 或 HTTP 的代理。单一服务器，记忆在所有代理间共享。

* * *

每个会话您都要解释相同的架构。重新发现相同的错误。重新教导相同的偏好。内置记忆（CLAUDE.md, .cursorrules）最多 200 行且会过时。agentmemory 解决了这个问题。它静默捕获代理的行为，将其压缩成可搜索的记忆，并在下一个会话开始时注入正确的上下文。一个命令。跨代理工作。

**变化是什么：** 会话 1 您设置了 JWT 认证。会话 2 您询问限流。代理已经知道您的认证使用的是 `src/middleware/auth.ts` 中的 jose 中间件，您的测试覆盖了令牌验证，并且为了 Edge 兼容性您选择了 jose 而非 jsonwebtoken。无需重新解释，无需复制粘贴。代理就是**知道**。

```bash
npx @agentmemory/agentmemory
```

> **v0.9.0 新特性** — 官网 agent-memory.dev，文件系统连接器（`@agentmemory/fs-watcher`），独立 MCP 现在代理到运行中的服务器，使钩子和查看器保持一致，审计策略在每个删除路径上被编纂，健康检查停止在小 Node 进程上标记 `memory_critical`。完整说明见 CHANGELOG.md。

* * *

### 检索准确率

**LongMemEval-S** (ICLR 2025, 500 个问题)

| 系统 | R@5 | R@10 | MRR |
| :--- | :--- | :--- | :--- |
| **agentmemory** | **95.2%** | **98.6%** | **88.2%** |
| 仅 BM25 后备 | 86.2% | 94.6% | 71.5% |

### Token 节省

| 方法 | Token/年 | 成本/年 |
| :--- | :--- | :--- |
| 粘贴完整上下文 | 1950 万+ | 不可能（超出窗口） |
| LLM 摘要 | ~65 万 | ~500 美元 |
| **agentmemory** | **~17 万** | **~10 美元** |
| agentmemory + 本地嵌入 | ~17 万 | **0 美元** |

> 嵌入模型：`all-MiniLM-L6-v2`（本地，免费，无需 API 密钥）。完整报告：`benchmark/LONGMEMEVAL.md`、`benchmark/QUALITY.md`、`benchmark/SCALE.md`。竞品对比：`benchmark/COMPARISON.md` — agentmemory vs mem0、Letta、Khoj、claude-mem、Hippo。

* * *

| 特性 | agentmemory | mem0 (53K ⭐) | Letta / MemGPT (22K ⭐) | 内置 (CLAUDE.md) |
| :--- | :--- | :--- | :--- | :--- |
| **类型** | 记忆引擎 + MCP 服务器 | 记忆层 API | 完整代理运行时 | 静态文件 |
| **检索 R@5** | **95.2%** | 68.5% (LoCoMo) | 83.2% (LoCoMo) | 不适用 (grep) |
| **自动捕获** | 12 钩子（零手动） | 手动 `add()` 调用 | 代理自编辑 | 手动编辑 |
| **搜索** | BM25 + 向量 + 图谱 (RRF 融合) | 向量 + 图谱 | 向量（存档） | 将所有内容加载到上下文 |
| **多代理** | MCP + REST + 租约 + 信号 | API（无协调） | 仅限 Letta 运行时内 | 按代理的文件 |
| **框架锁定** | 无（任何 MCP 客户端） | 无 | 高（必须使用 Letta） | 按代理的格式 |
| **外部依赖** | 无（SQLite + iii-engine） | Qdrant / pgvector | Postgres + 向量数据库 | 无 |
| **记忆生命周期** | 4 层巩固 + 衰减 + 自动遗忘 | 被动提取 | 代理管理 | 手动修剪 |
| **Token 效率** | ~1,900 token/会话（10 美元/年） | 因集成而异 | 核心记忆在上下文中 | 240 条观察时超 22K token |
| **实时查看器** | 是（端口 3113） | 云仪表板 | 云仪表板 | 否 |
| **自托管** | 是（默认） | 可选 | 可选 | 是 |

* * *

兼容性：本版本目标为稳定的 `iii-sdk` `^0.11.0` 和 iii-engine v0.11.x。

### 在 30 秒内尝试

```bash
# 终端 1：启动服务器
npx @agentmemory/agentmemory

# 终端 2：播种示例数据并查看召回效果
npx @agentmemory/agentmemory demo
```

`demo` 会播种 3 个真实场景（JWT 认证、N+1 查询修复、限流）并对其执行语义搜索。当您搜索“数据库性能优化”时，您会看到它找到了“N+1 查询修复”——纯关键词匹配做不到这一点。

打开 `http://localhost:3113` 实时观看记忆构建过程。

### 会话回放

agentmemory 记录的每个会话都是可回放的。打开查看器，选择**回放**选项卡，在时间线上拖拽：提示词、工具调用、工具结果和响应会呈现为离散事件，支持播放/暂停、速度控制（0.5 倍–4 倍）和键盘快捷键（空格键切换，箭头键步进）。

已经有旧的 Claude Code JSONL 记录想要导入？

```bash
# 导入 ~/.claude/projects 下的所有内容
npx @agentmemory/agentmemory import-jsonl

# 或导入单个文件
npx @agentmemory/agentmemory import-jsonl ~/.claude/projects/-my-project/abc123.jsonl
```

导入的会话会与本机会话一起显示在回放选择器中。在底层，每个条目都通过 `mem::replay::load`、`mem::replay::sessions` 和 `mem::replay::import-jsonl` 这些 iii 函数路由——无旁路服务器。

### 升级 / 维护

当您有意更新本地运行时时，请使用维护命令：

```bash
npx @agentmemory/agentmemory upgrade
```

警告：此命令会变更当前工作区/运行时。它可能更新 JavaScript 依赖项，可能运行 `cargo install iii-engine --force`，并可能拉取 Docker 镜像。

实现细节位于 `src/cli.ts`（参见 `src/cli.ts:544-595` 区域附近的 `runUpgrade`）。

### Claude Code（一个代码块，粘贴即可）

```text
安装 agentmemory：在单独的终端中运行 `npx @agentmemory/agentmemory` 以启动记忆服务器。然后运行 `/plugin marketplace add rohitg00/agentmemory` 和 `/plugin install agentmemory`——该插件会注册所有 12 个钩子、4 个技能，并通过其 `.mcp.json` 自动连接 `@agentmemory/mcp` stdio 服务器，因此无需任何额外配置步骤即可获得 51 个 MCP 工具（memory_smart_search, memory_save, memory_sessions, memory_governance_delete 等）。使用 `curl http://localhost:3111/agentmemory/health` 验证。实时查看器在 http://localhost:3113。
```

### Codex CLI（Codex 插件平台）

```bash
# 1. 在单独的终端中启动记忆服务器
npx @agentmemory/agentmemory

# 2. 注册 agentmemory 市场并安装插件
codex plugin marketplace add rohitg00/agentmemory
codex plugin install agentmemory
```

Codex 插件与 Claude Code 插件源自同一个 `plugin/` 目录。它注册了：

*   `@agentmemory/mcp` 作为 MCP 服务器（设置 `AGENTMEMORY_TOOLS=all` 时提供全部 51 个工具）
*   6 个生命周期钩子：`SessionStart`、`UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PreCompact`、`Stop`
*   4 个技能：`/recall`、`/remember`、`/session-history`、`/forget`

Codex 的钩子引擎会将 `CLAUDE_PLUGIN_ROOT` 注入到钩子子进程中，因此相同的钩子脚本可以在两个主机上工作而无需重复。Subagent / SessionEnd / Notification / TaskCompleted / PostToolUseFailure 事件是 Claude Code 独有的，不会为 Codex 注册。

**OpenClaw（粘贴此提示词）**

```text
为 OpenClaw 安装 agentmemory。在单独的终端中运行 `npx @agentmemory/agentmemory` 在 localhost:3111 上启动记忆服务器。然后将此内容添加到我的 OpenClaw MCP 配置中，以便 agentmemory 提供所有 51 个记忆工具：

{
  "mcpServers": {
    "agentmemory": {
      "command": "npx",
      "args": ["-y", "@agentmemory/mcp"],
      "env": {
        "AGENTMEMORY_URL": "http://localhost:3111"
      }
    }
  }
}

重启 OpenClaw。使用 `curl http://localhost:3111/agentmemory/health` 验证。打开 http://localhost:3113 查看实时查看器。如需更深度的记忆槽集成，请将 `integrations/openclaw` 复制到 `~/.openclaw/extensions/agentmemory`，并在 `~/.openclaw/openclaw.json` 中启用 `plugins.slots.memory = "agentmemory"`。

完整指南：`integrations/openclaw/`
```

**Hermes Agent（粘贴此提示词）**

```text
为 Hermes 安装 agentmemory。在单独的终端中运行 `npx @agentmemory/agentmemory` 在 localhost:3111 上启动记忆服务器。然后将此内容添加到 ~/.hermes/config.yaml，以便 Hermes 可以将 agentmemory 用作 MCP 服务器，获得全部 51 个记忆工具：

mcp_servers:
  agentmemory:
    command: npx
    args: ["-y", "@agentmemory/mcp"]

memory:
  provider: agentmemory

使用 `curl http://localhost:3111/agentmemory/health` 验证。打开 http://localhost:3113 查看实时查看器。如需更深度的 6 钩子记忆提供者集成（LLM 前上下文注入、轮次捕获、MEMORY.md 镜像、系统提示块），请将 agentmemory 仓库中的 integrations/hermes 复制到 ~/.hermes/plugins/agentmemory。

完整指南：`integrations/hermes/`
```

### 其他代理

启动记忆服务器：`npx @agentmemory/agentmemory`

对于使用 `mcpServers` 结构的所有主机（Cursor、Claude Desktop、Cline、Roo Code、Windsurf、Gemini CLI、OpenClaw），agentmemory 的条目是**相同的 MCP 服务器块**：

```json
"agentmemory": {
  "command": "npx",
  "args": ["-y", "@agentmemory/mcp"],
  "env": {
    "AGENTMEMORY_URL": "http://localhost:3111"
  }
}
```

**将此条目合并到主机配置文件中现有的 `mcpServers` 对象中**，不要替换整个文件。如果文件已有其他服务器，请在 `mcpServers` 内部将 `agentmemory` 作为另一个键添加在它们旁边。如果完全没有 `mcpServers`，则将整个代码块粘贴到 `{ "mcpServers": { ... } }` 内部。

| 代理 | 配置文件 | 说明 |
| :--- | :--- | :--- |
| **Cursor** | `~/.cursor/mcp.json` | 合并到 `mcpServers`。官网也提供一键深度链接。 |
| **Claude Desktop** | `claude_desktop_config.json` (Application Support) | 合并到 `mcpServers`。编辑后重启 Claude Desktop。 |
| **Cline / Roo Code / Kilo Code** | Cline MCP 设置 (设置界面 → MCP 服务器 → 编辑) | 相同的 `mcpServers` 块。 |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | 相同的 `mcpServers` 块。 |
| **Gemini CLI** | `~/.gemini/settings.json` | `gemini mcp add agentmemory npx -y @agentmemory/mcp --scope user`（自动合并）。 |
| **OpenClaw** | OpenClaw MCP 配置 | 相同的 `mcpServers` 块，或使用更深度的记忆插件。 |
| **Codex CLI (仅 MCP)** | `.codex/config.toml` | TOML 结构：`codex mcp add agentmemory -- npx -y @agentmemory/mcp`，或手动添加 `[mcp_servers.agentmemory]`。 |
| **Codex CLI (完整插件)** | Codex 插件市场 | `codex plugin marketplace add rohitg00/agentmemory` 然后 `codex plugin install agentmemory`。注册 MCP + 6 生命周期钩子 (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PreCompact, Stop) + 4 个技能。 |
| **OpenCode** | `opencode.json` | 结构不同 — 顶层 `mcp` 键，命令为数组：`{"mcp": {"agentmemory": {"type": "local", "command": ["npx", "-y", "@agentmemory/mcp"], "enabled": true}}}`。 |
| **pi** | `~/.pi/agent/extensions/agentmemory` | 复制 `integrations/pi` 并重启 pi。 |
| **Hermes Agent** | `~/.hermes/config.yaml` | 使用更深度的记忆提供者插件，设置 `memory.provider: agentmemory`。 |
| **Goose** | Goose MCP 设置界面 | 相同的 `mcpServers` 块。 |
| **Aider** | 不适用 | 直接与 REST API 对话：`curl -X POST http://localhost:3111/agentmemory/smart-search -d '{"query": "auth"}'`。 |
| **任何代理 (32+ 种)** | 不适用 | `npx skillkit install agentmemory` 会自动检测主机并合并。 |

**沙箱化 MCP 客户端**（Flatpak / Snap / 限制性容器）无法访问主机的 `localhost`：同时在 `env` 块中设置 `"AGENTMEMORY_FORCE_PROXY": "1"`，并将 `AGENTMEMORY_URL` 指向沙箱实际能访问到的路由（例如您的局域网 IP）。故障诊断详解见 #234。

### 从源码构建

```bash
git clone https://github.com/rohitg00/agentmemory.git && cd agentmemory
npm install && npm run build && npm start
```

这会启动 agentmemory，如果已安装 `iii` 则使用本地 `iii-engine`，如果 Docker 可用则回退到 Docker Compose。REST、流和查看器默认绑定到 `127.0.0.1`。

手动安装 `iii-engine`。**agentmemory 当前锁定 `iii-engine` 到 `v0.11.2`** — `v0.11.6` 引入了一个新的通过 `iii worker add` 进行沙箱化的模型，agentmemory 尚未为此重构。一旦重构完成，锁定将解除。如果您已手动迁移到沙箱模型，可通过 `AGENTMEMORY_III_VERSION=<version>` 覆盖。

*   **macOS arm64:** `mkdir -p ~/.local/bin && curl -fsSL https://github.com/iii-hq/iii/releases/download/iii/v0.11.2/iii-aarch64-apple-darwin.tar.gz | tar -xz -C ~/.local/bin && chmod +x ~/.local/bin/iii`
*   **macOS x64:** 将 `aarch64-apple-darwin` 替换为 `x86_64-apple-darwin`
*   **Linux x64:** 替换为 `x86_64-unknown-linux-gnu`
*   **Linux arm64:** 替换为 `aarch64-unknown-linux-gnu`
*   **Windows:** 从 iii-hq/iii 发布页 v0.11.2 下载 `iii-x86_64-pc-windows-msvc.zip`，解压出 `iii.exe`，添加到 PATH

或使用 Docker（打包的 `docker-compose.yml` 拉取 `iiidev/iii:0.11.2`）。完整文档：iii.dev/docs。

### Windows

agentmemory 可在 Windows 10/11 上运行，但仅靠 Node.js 包是不够的 — 您还需要 `iii-engine` 运行时（一个单独的原生二进制程序）作为后台进程。官方上游安装程序是一个 `sh` 脚本，目前没有 PowerShell 安装程序或 scoop/winget 包，因此 Windows 用户有两条路径：

**选项 A — 预编译 Windows 二进制文件（推荐）：**

```bash
# 1. 在浏览器中打开 https://github.com/iii-hq/iii/releases/tag/iii%2Fv0.11.2
#    （我们锁定到 v0.11.2，直到 agentmemory 为引擎 v0.11.6+ 所需的
#     新沙箱模型进行重构）
# 2. 下载 iii-x86_64-pc-windows-msvc.zip
#    （如果您在 ARM 机器上，则下载 iii-aarch64-pc-windows-msvc.zip）
# 3. 解压出 iii.exe 到 PATH 中的某个位置，或将其放在：
#    %USERPROFILE%\.local\bin\iii.exe
#    （agentmemory 会自动检查该位置）
# 4. 验证：
iii --version
# 应打印：0.11.2
# 5. 然后照常运行 agentmemory：
npx -y @agentmemory/agentmemory
```

**选项 B — Docker Desktop：**

```bash
# 1. 安装 Windows 版 Docker Desktop
# 2. 启动 Docker Desktop 并确保引擎正在运行
# 3. 运行 agentmemory — 它会自动启动打包的 compose 文件：
npx -y @agentmemory/agentmemory
```

**选项 C — 仅独立 MCP（无引擎）：** 如果您只需要为您的代理提供 MCP 工具，不需要 REST API、查看器或定时任务，则完全跳过引擎：

```bash
npx -y @agentmemory/agentmemory mcp
# 或通过 shim 包：
npx -y @agentmemory/mcp
```

**Windows 诊断：** 如果 `npx @agentmemory/agentmemory` 失败，使用 `--verbose` 重新运行以查看实际的引擎 stderr。常见故障模式：

| 症状 | 修复 |
| :--- | :--- |
| `iii-engine process started` 然后 `did not become ready within 15s` | 引擎启动时崩溃 — 使用 `--verbose` 重新运行，检查 stderr |
| `Could not start iii-engine` | 既未安装 `iii.exe` 也未安装 Docker。请参见上面的选项 A 或 B |
| 端口冲突 | `netstat -ano | findstr :3111` 查看绑定的内容，然后终止它或使用 `--port <N>` |
| 即使安装了 Docker，也跳过了 Docker 回退 | 确保 Docker Desktop 实际正在运行（系统托盘图标） |

> 注意：没有 `cargo install iii-engine` — `iii` 未发布到 crates.io。唯一支持的安装方法是上面的预编译二进制文件、上游 `sh` 安装脚本（仅限 macOS/Linux）以及 Docker 镜像。

* * *

每个编码代理在会话结束时都会忘记一切。您在每个会话的前 5 分钟都在浪费时间重新解释您的技术栈。agentmemory 在后台运行，完全消除了这一点。

```text
会话 1: "为 API 添加认证"
  代理编写代码，运行测试，修复错误
  agentmemory 静默捕获每一次工具使用
  会话结束 -> 观察结果被压缩成结构化记忆

会话 2: "现在添加限流"
  代理已经知道：
    - 认证使用 src/middleware/auth.ts 中的 JWT 中间件
    - test/auth.test.ts 中的测试覆盖了令牌验证
    - 为了 Edge 兼容性，您选择了 jose 而非 jsonwebtoken
  零重复解释。立即开始工作。
```

### vs 内置代理记忆

每个 AI 编码代理都附带内置记忆 — Claude Code 有 `MEMORY.md`，Cursor 有记事本，Cline 有记忆库。这些就像便利贴。agentmemory 是便利贴背后的可搜索数据库。

| | 内置 (CLAUDE.md) | agentmemory |
| :--- | :--- | :--- |
| **规模** | 200 行上限 | 无限制 |
| **搜索** | 将所有内容加载到上下文 | BM25 + 向量 + 知识图谱（仅取 top-K） |
| **Token 成本** | 240 条观察时超 22K token | ~1,900 token（减少 92%） |
| **跨代理** | 按代理的文件 | MCP + REST（任何代理） |
| **协调** | 无 | 租约、信号、动作、例程 |
| **可观测性** | 手动读取文件 | 端口 :3113 上的实时查看器 |

* * *

### 记忆流水线

```text
PostToolUse 钩子触发
  -> SHA-256 去重（5 分钟窗口）
  -> 隐私过滤（去除密钥、API 密钥）
  -> 存储原始观察
  -> LLM 压缩 -> 结构化事实 + 概念 + 叙述
  -> 向量嵌入（6 种提供者 + 本地）
  -> 索引到 BM25 + 向量

Stop / SessionEnd 钩子触发
  -> 总结会话
  -> 知识图谱提取（如果 GRAPH_EXTRACTION_ENABLED=true）
  -> 槽位反射（如果 SLOT_REFLECT_ENABLED=true）

SessionStart 钩子触发
  -> 加载项目概况（核心概念、文件、模式）
  -> 混合搜索（BM25 + 向量 + 图谱）
  -> Token 预算（默认：2000 token）
  -> 注入到对话中
```

### 4 层记忆巩固

灵感来源于人类大脑处理记忆的方式 — 与睡眠巩固无异。

| 层级 | 内容 | 类比 |
| :--- | :--- | :--- |
| **工作记忆** | 来自工具使用的原始观察 | 短期记忆 |
| **情景记忆** | 压缩的会话摘要 | “发生了什么” |
| **语义记忆** | 提取的事实和模式 | “我知道什么” |
| **程序记忆** | 工作流和决策模式 | “如何做” |

记忆随时间衰减（艾宾浩斯曲线）。频繁访问的记忆会增强。陈旧的记忆会被自动驱逐。矛盾会被检测和解决。

### 捕获的内容

| 钩子 | 捕获内容 |
| :--- | :--- |
| `SessionStart` | 项目路径、会话 ID |
| `UserPromptSubmit` | 用户提示词（经隐私过滤） |
| `PreToolUse` | 文件访问模式 + 丰富上下文 |
| `PostToolUse` | 工具名称、输入、输出 |
| `PostToolUseFailure` | 错误上下文 |
| `PreCompact` | 在压缩前重新注入记忆 |
| `SubagentStart/Stop` | 子代理生命周期 |
| `Stop` | 会话结束时的摘要 |
| `SessionEnd` | 会话完成标记 |

### 关键能力

| 能力 | 描述 |
| :--- | :--- |
| **自动捕获** | 通过钩子记录每次工具使用 — 零手动操作 |
| **语义搜索** | BM25 + 向量 + 知识图谱与 RRF 融合 |
| **记忆演化** | 版本控制、取代、关系图谱 |
| **自动遗忘** | TTL 过期、矛盾检测、重要性驱逐 |
| **隐私优先** | 存储前去除 API 密钥、密钥、`<private>` 标签 |
| **自愈** | 断路器、提供者回退链、健康监控 |
| **Claude 桥接** | 与 MEMORY.md 双向同步 |
| **知识图谱** | 实体提取 + BFS 遍历 |
| **团队记忆** | 团队成员间的命名空间共享 + 私有 |
| **引用溯源** | 将任何记忆追溯到源观察 |
| **Git 快照** | 版本控制、回滚和记忆状态差异比较 |

* * *

三流检索结合三种信号：

| 流 | 作用 | 状态 |
| :--- | :--- | :--- |
| **BM25** | 带同义词扩展的词干关键词匹配 | 始终开启 |
| **向量** | 稠密嵌入上的余弦相似度 | 配置了嵌入提供者 |
| **图谱** | 通过实体匹配进行知识图谱遍历 | 查询中检测到实体时 |

使用倒数排名融合（RRF，k=60）和会话多样化（每个会话最多 3 个结果）进行融合。

### 嵌入提供者

agentmemory 自动检测您的提供者。为获得最佳效果，请安装本地嵌入（免费）：

```bash
npm install @xenova/transformers
```

| 提供者 | 模型 | 成本 | 说明 |
| :--- | :--- | :--- | :--- |
| **本地（推荐）** | `all-MiniLM-L6-v2` | 免费 | 离线，召回率比仅 BM25 提高 8 个百分点 |
| Gemini | `text-embedding-004` | 免费套餐 | 1500 RPM |
| OpenAI | `text-embedding-3-small` | $0.02/1M | 最高质量 |
| Voyage AI | `voyage-code-3` | 付费 | 针对代码优化 |
| Cohere | `embed-english-v3.0` | 免费试用 | 通用 |
| OpenRouter | 任意模型 | 各异 | 多模型代理 |

* * *

51 个工具、6 个资源、3 个提示词和 4 个技能 — 适用于任何代理的最全面的 MCP 记忆工具包。

### 50 个工具

**核心工具（始终可用）**

| 工具 | 描述 |
| :--- | :--- |
| `memory_recall` | 搜索过往观察 |
| `memory_compress_file` | 压缩 Markdown 文件同时保留结构 |
| `memory_save` | 保存洞察、决策或模式 |
| `memory_patterns` | 检测重复出现的模式 |
| `memory_smart_search` | 混合语义 + 关键词搜索 |
| `memory_file_history` | 关于特定文件的过往观察 |
| `memory_sessions` | 列出最近的会话 |
| `memory_timeline` | 按时间顺序的观察 |
| `memory_profile` | 项目概况（概念、文件、模式） |
| `memory_export` | 导出所有记忆数据 |
| `memory_relations` | 查询关系图谱 |

**扩展工具（共 50 个 — 设置 `AGENTMEMORY_TOOLS=all`）**

| 工具 | 描述 |
| :--- | :--- |
| `memory_patterns` | 检测重复出现的模式 |
| `memory_timeline` | 按时间顺序的观察 |
| `memory_relations` | 查询关系图谱 |
| `memory_graph_query` | 知识图谱遍历 |
| `memory_consolidate` | 运行 4 层巩固 |
| `memory_claude_bridge_sync` | 与 MEMORY.md 同步 |
| `memory_team_share` | 与团队成员共享 |
| `memory_team_feed` | 最近共享的项目 |
| `memory_audit` | 操作审计跟踪 |
| `memory_governance_delete` | 带审计跟踪的删除 |
| `memory_snapshot_create` | 基于 Git 版本控制的快照 |
| `memory_action_create` | 创建带依赖关系的工作项 |
| `memory_action_update` | 更新动作状态 |
| `memory_frontier` | 按优先级排序的未阻塞动作 |
| `memory_next` | 单个最重要的下一个动作 |
| `memory_lease` | 独占动作租约（多代理） |
| `memory_routine_run` | 实例化工作流例程 |
| `memory_signal_send` | 代理间消息传递 |
| `memory_signal_read` | 带回执的读取消息 |
| `memory_checkpoint` | 外部条件门控 |
| `memory_mesh_sync` | 实例间的 P2P 同步 |
| `memory_sentinel_create` | 事件驱动的观察器 |
| `memory_sentinel_trigger` | 外部触发哨兵 |
| `memory_sketch_create` | 临时动作图 |
| `memory_sketch_promote` | 提升为永久 |
| `memory_crystallize` | 紧凑动作链 |
| `memory_diagnose` | 健康检查 |
| `memory_heal` | 自动修复卡住状态 |
| `memory_facet_tag` | 维度:值 标签 |
| `memory_facet_query` | 按维度标签查询 |
| `memory_verify` | 追踪溯源 |

### 6 个资源 · 3 个提示词 · 4 个技能

| 类型 | 名称 | 描述 |
| :--- | :--- | :--- |
| 资源 | `agentmemory://status` | 健康状态、会话数、记忆数 |
| 资源 | `agentmemory://project/{name}/profile` | 按项目划分的情报 |
| 资源 | `agentmemory://memories/latest` | 最近的 10 个活跃记忆 |
| 资源 | `agentmemory://graph/stats` | 知识图谱统计信息 |
| 提示词 | `recall_context` | 搜索并返回上下文消息 |
| 提示词 | `session_handoff` | 代理间的交接数据 |
| 提示词 | `detect_patterns` | 分析重复出现的模式 |
| 技能 | `/recall` | 搜索记忆 |
| 技能 | `/remember` | 保存到长期记忆 |
| 技能 | `/session-history` | 最近的会话摘要 |
| 技能 | `/forget` | 删除观察/会话 |

### 独立 MCP

无需完整服务器即可运行 — 适用于任何 MCP 客户端。以下任一命令均可：

```bash
npx -y @agentmemory/agentmemory mcp   # 权威方式（始终可用）
npx -y @agentmemory/mcp                # shim 包别名
```

或添加到您代理的 MCP 配置中：

**大多数代理（Cursor、Claude Desktop、Cline、Roo Code、Windsurf、Gemini CLI）：**

```json
{
  "mcpServers": {
    "agentmemory": {
      "command": "npx",
      "args": ["-y", "@agentmemory/mcp"],
      "env": {
        "AGENTMEMORY_URL": "http://localhost:3111"
      }
    }
  }
}
```

将 `agentmemory` 条目合并到您主机现有的 `mcpServers` 对象中，而不是替换文件。对于无法访问主机 `localhost` 的沙箱客户端，请在 env 块中添加 `"AGENTMEMORY_FORCE_PROXY": "1"`，并将 `AGENTMEMORY_URL` 设置为沙箱可以访问的路由。

**OpenCode（`opencode.json`）：**

```json
{
  "mcp": {
    "agentmemory": {
      "type": "local",
      "command": ["npx", "-y", "@agentmemory/mcp"],
      "enabled": true
    }
  }
}
```

* * *

在端口 `3113` 上自动启动。实时观察流、会话浏览器、记忆浏览器、知识图谱可视化和健康仪表板。

```bash
open http://localhost:3113
```

查看器服务器默认绑定到 `127.0.0.1`。REST 服务的 `/agentmemory/viewer` 端点遵循常规的 `AGENTMEMORY_SECRET` bearer token 规则。CSP 头为每个响应使用脚本 nonce，并禁用内联处理器属性（`script-src-attr 'none'`）。

* * *

端口 `:3113` 上的查看器显示您的代理**记住了**什么。iii 控制台显示您的代理**做了**什么 — 每个记忆操作作为 OpenTelemetry 跟踪，每个 KV 条目可编辑，每个函数可调用，每个流可监听。同一个记忆的两个窗口：一个面向产品，一个面向引擎。

观察一个 `memory_smart_search` 触发，看到 BM25 扫描 → 嵌入查找 → RRF 融合 → 重排序器形成一个瀑布图。在 KV 浏览器中编辑一个卡住的巩固计时器。使用调整后的载荷重放一个 `PostToolUse` 钩子。固定 WebSocket 流并实时观察观察结果到达。

agentmemory 免费提供这些，因为每个函数、触发器、状态作用域和流都是 iii 的原语 — 没有自定义代码，无需插桩。

_工作页面：每个已连接的工作进程 — 包括 agentmemory 自身 — 及其 PID、函数计数、运行时长和最后在线时间。_

**已安装。** 控制台与 `iii` 一同提供 — 无需单独安装。

**与 agentmemory 一同启动：**

```bash
# agentmemory 查看器占用端口 3113，因此在 3114 上运行控制台。
# 引擎 REST (3111)、WebSocket (3112) 和桥接 (49134) 的默认值与 agentmemory 匹配。
iii console --port 3114
```

然后打开 `http://localhost:3114`。添加 `--enable-flow` 以启用实验性架构图页面。

仅当您移动了引擎端点时才覆盖它们：

```bash
iii console --port 3114 \
  --engine-port 3111 \
  --ws-port 3112 \
  --bridge-port 49134
```

# 参考资料

* any list
{:toc}
---
layout: post 
title: Context Mode 解决 ai-agent 上下文问题
date: 2026-05-06 21:01:55 +0800
categories: [AI]
tags: [ai, context]
published: true
---


# Context Mode

**上下文问题的另一半。**

## 问题所在

每次 MCP 工具调用都会将原始数据转储到您的上下文窗口中。一次 Playwright 快照花费 56 KB。20 个 GitHub Issue 花费 59 KB。一份访问日志 —— 45 KB。30 分钟后，40% 的上下文就消失了。当 agent 为了释放空间而压缩对话时，它会忘记自己正在编辑哪些文件、哪些任务正在进行以及您最后一次的请求是什么。除此之外，agent 还会在填充词、客套话和冗长的解释上浪费输出 token —— 从两侧消耗上下文。

### Context Mode 如何解决

Context Mode 是一个 MCP 服务器，它解决了这个问题的所有四个方面：

1. **上下文节约** —— 沙箱工具将原始数据挡在上下文窗口之外。315 KB 变成 5.4 KB。减少 98%。
2. **会话连续性** —— 每次文件编辑、git 操作、任务、错误和用户决策都被记录在 SQLite 中。当对话被压缩时，context-mode 不会将这些数据重新放回上下文 —— 它会将事件索引到 FTS5 中，并仅通过 BM25 检索相关内容。模型可以准确地从您上次中断的地方继续。如果您不使用 `--continue`，之前的会话数据会立即删除 —— 一次全新的会话意味着一个干净的状态。
3. **用代码思考** —— LLM 应该编写分析代码，而不是自己计算。为了统计函数数量而将 50 个文件读入上下文，不如让 agent 编写一个脚本来执行计数，并仅 `console.log()` 出结果。一个脚本替代十次工具调用，节省 100 倍的上下文。这是所有 14 个平台上的强制性范式：不要再把 LLM 当成数据处理者，把它当成代码生成器。

   ```js
   // 之前：47 次 Read() = 700 KB。  之后：1 次 ctx_execute() = 3.6 KB。
   ctx_execute("javascript", `
     const files = fs.readdirSync('src').filter(f => f.endsWith('.ts'));
     files.forEach(f => console.log(f + ': ' + fs.readFileSync('src/'+f,'utf8').split('\\n').length + ' lines'));
   `);
   ```
4. **输出压缩** —— 像穴居人一样简洁。只保留精确的技术内容。去掉废话。省略冠词、填充词（只是/真的/基本上）、客套话、含糊其辞。片段可以。使用短同义词。代码保持不变。模式：[事物] [动作] [原因]。[下一步]。在安全警告、不可逆操作和用户困惑时自动展开。减少约 65-75% 的输出 token，同时保持完整的技术准确性。

<a href="https://www.youtube.com/watch?v=QUHrntlfPo4">
  <picture>
    <img src="https://img.youtube.com/vi/QUHrntlfPo4/maxresdefault.jpg" alt="在 YouTube 上观看 context-mode 演示" width="100%">
  </picture>
</a>
<p align="center"><a href="https://www.youtube.com/watch?v=QUHrntlfPo4"><img src="https://img.shields.io/badge/%E2%96%B6%EF%B8%8F_Watch_Demo-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="在 YouTube 上观看"></a></p>

## 安装

平台按安装复杂度分组。支持 hook 的平台可以获得自动路由强制。不支持 hook 的平台需要一次性复制路由文件。

<details open>
<summary><strong>Claude Code</strong> —— 插件市场，全自动</summary>

**前置条件：** Claude Code v1.0.33+（`claude --version`）。如果无法识别 `/plugin`，请先更新：`brew upgrade claude-code` 或 `npm update -g @anthropic-ai/claude-code`。

**安装：**

```bash
/plugin marketplace add mksglu/context-mode
/plugin install context-mode@context-mode
```

重启 Claude Code（或运行 `/reload-plugins`）。

**验证：**

```
/context-mode:ctx-doctor
```

所有检查应显示 `[x]`。doctor 会验证运行时、hooks、FTS5 和插件注册。

**路由：** 自动。SessionStart hook 在运行时注入路由指令 —— 不会向您的项目写入任何文件。该插件注册了所有 hooks（PreToolUse、PostToolUse、PreCompact、SessionStart）和 11 个 MCP 工具 —— 六个沙箱工具（`ctx_batch_execute`、`ctx_execute`、`ctx_execute_file`、`ctx_index`、`ctx_search`、`ctx_fetch_and_index`）加上五个元工具（`ctx_stats`、`ctx_doctor`、`ctx_upgrade`、`ctx_purge`、`ctx_insight`）。

| 斜杠命令 | 功能 |
|---|---|
| `/context-mode:ctx-stats` | 上下文节省 —— 按工具细分、消耗的 token、节省比率。 |
| `/context-mode:ctx-doctor` | 诊断 —— 运行时、hooks、FTS5、插件注册、版本。 |
| `/context-mode:ctx-upgrade` | 拉取最新版本、重建、迁移缓存、修复 hooks。 |
| `/context-mode:ctx-purge` | 从知识库中永久删除所有已索引的内容。 |
| `/context-mode:ctx-insight` | 个人分析仪表盘 —— 90 个指标、37 种洞察模式、4 个综合得分（生产力、质量、委派、上下文健康），涵盖 23 个事件类别。打开本地 Web UI。 |

> **注意：** 斜杠命令是 Claude Code 插件的一个特性。在其他平台上，在聊天中输入 `ctx stats`、`ctx doctor`、`ctx upgrade` 或 `ctx insight` —— 模型会自动调用 MCP 工具。请参阅[实用命令](#utility-commands)。

**状态行（可选）：** Claude Code 的插件清单无法声明状态行，因此这是一次性手动编辑 `~/.claude/settings.json`：

```json
{
  "statusLine": {
    "type": "command",
    "command": "context-mode statusline"
  }
}
```

保存后，重启 Claude Code。状态栏会显示 `本次会话节省 · 所有会话节省 · 效率百分比`，让您实时看到节省的累积。其连接是与路径无关的 —— `context-mode statusline` 通过捆绑的 CLI 解析，无论插件缓存位于何处。

<details>
<summary>替代方案 —— 仅 MCP 安装（无 hooks 或斜杠命令）</summary>

```bash
claude mcp add context-mode -- npx -y context-mode
```

这将为您提供所有 11 个 MCP 工具，但没有自动路由。模型仍然可以使用它们 —— 只是不会被提示优先使用它们而不是原始的 Bash/Read/WebFetch。适合在完全采用完整插件之前进行试用。

</details>

</details>

<details>
<summary><strong>Gemini CLI</strong> —— 一个配置文件，包含 hooks</summary>

**前置条件：** Node.js 18+，已安装 Gemini CLI。

**安装：**

1. 全局安装 context-mode：

   ```bash
   npm install -g context-mode
   ```

2. 将以下内容添加到 `~/.gemini/settings.json`。这一个文件注册了 MCP 服务器和所有四个 hooks：

   ```json
   {
     "mcpServers": {
       "context-mode": {
         "command": "context-mode"
       }
     },
     "hooks": {
       "BeforeTool": [
         {
           "matcher": "run_shell_command|read_file|read_many_files|grep_search|search_file_content|web_fetch|activate_skill|mcp__plugin_context-mode",
           "hooks": [{ "type": "command", "command": "context-mode hook gemini-cli beforetool" }]
         }
       ],
       "AfterTool": [
         {
           "matcher": "",
           "hooks": [{ "type": "command", "command": "context-mode hook gemini-cli aftertool" }]
         }
       ],
       "PreCompress": [
         {
           "matcher": "",
           "hooks": [{ "type": "command", "command": "context-mode hook gemini-cli precompress" }]
         }
       ],
       "SessionStart": [
         {
           "matcher": "",
           "hooks": [{ "type": "command", "command": "context-mode hook gemini-cli sessionstart" }]
         }
       ]
     }
   }
   ```

3. 重启 Gemini CLI。

**验证：**

```
/mcp list
```

您应该会看到 `context-mode: ... - Connected`。

**路由：** 通过 SessionStart hook 自动。可选地复制路由指令以获得完整的模型感知：

```bash
cp node_modules/context-mode/configs/gemini-cli/GEMINI.md ./GEMINI.md
```

> **为什么需要 BeforeTool matcher？** 它仅针对产生大量输出的工具（`run_shell_command`、`read_file`、`read_many_files`、`grep_search`、`search_file_content`、`web_fetch`、`activate_skill`）以及 context-mode 自己的工具（`mcp__plugin_context-mode`）。这避免了在轻量级工具上产生不必要的 hook 开销，同时拦截了所有可能淹没您上下文窗口的工具。

完整配置参考：[`configs/gemini-cli/settings.json`](configs/gemini-cli/settings.json)

</details>

<details>
<summary><strong>VS Code Copilot</strong> —— 带 SessionStart 的 hooks</summary>

**前置条件：** Node.js 18+，带有 Copilot Chat v0.32+ 的 VS Code。

**安装：**

1. 全局安装 context-mode：

   ```bash
   npm install -g context-mode
   ```

2. 在项目根目录创建 `.vscode/mcp.json`：

   ```json
   {
     "servers": {
       "context-mode": {
         "command": "context-mode"
       }
     }
   }
   ```

3. 创建 `.github/hooks/context-mode.json`：

   ```json
   {
     "hooks": {
       "PreToolUse": [
         { "type": "command", "command": "context-mode hook vscode-copilot pretooluse" }
       ],
       "PostToolUse": [
         { "type": "command", "command": "context-mode hook vscode-copilot posttooluse" }
       ],
       "SessionStart": [
         { "type": "command", "command": "context-mode hook vscode-copilot sessionstart" }
       ]
     }
   }
   ```

4. 重启 VS Code。

**验证：** 打开 Copilot Chat 并输入 `ctx stats`。应该会出现 context-mode 工具并做出响应。

**路由：** 通过 SessionStart hook 自动。可选地复制路由指令以获得完整的模型感知：

```bash
cp node_modules/context-mode/configs/vscode-copilot/copilot-instructions.md .github/copilot-instructions.md
```

包含 PreCompact 的完整 hook 配置：[`configs/vscode-copilot/hooks.json`](configs/vscode-copilot/hooks.json)

</details>

<details>
<summary><strong>JetBrains Copilot</strong> —— 带 SessionStart 的 hooks</summary>

**前置条件：** Node.js 18+，带有 GitHub Copilot 插件 v1.5.57+ 的 JetBrains IDE。

**安装：**

1. 全局安装 context-mode：

   ```bash
   npm install -g context-mode
   ```

2. 通过设置 UI 添加 MCP 服务器：**设置 > 工具 > AI Assistant > 模型上下文协议（MCP） > 添加服务器**：
   - **名称：** `context-mode`
   - **命令：** `context-mode`

3. 创建 `.github/hooks/context-mode.json`：

   ```json
   {
     "hooks": {
       "PreToolUse": [
         { "type": "command", "command": "context-mode hook jetbrains-copilot pretooluse" }
       ],
       "PostToolUse": [
         { "type": "command", "command": "context-mode hook jetbrains-copilot posttooluse" }
       ],
       "SessionStart": [
         { "type": "command", "command": "context-mode hook jetbrains-copilot sessionstart" }
       ]
     }
   }
   ```

4. 重启 JetBrains IDE。

**验证：** 打开 Copilot Chat 并输入 `ctx stats`。应该会出现 context-mode 工具并做出响应。

**路由：** 通过 SessionStart hook 自动。可选地复制路由指令以获得完整的模型感知：

```bash
cp node_modules/context-mode/configs/jetbrains-copilot/copilot-instructions.md .github/copilot-instructions.md
```

包含 PreCompact 的完整 hook 配置：[`configs/jetbrains-copilot/hooks.json`](configs/jetbrains-copilot/hooks.json)

完整设置指南：[`docs/jetbrains-copilot.md`](docs/jetbrains-copilot.md)

</details>

<details>
<summary><strong>Cursor</strong> —— 支持 stop 的 hooks</summary>

**前置条件：** Node.js 18+，启用 agent 模式的 Cursor。

**安装：**

1. 全局安装 context-mode：

   ```bash
   npm install -g context-mode
   ```

2. 在项目根目录（或全局使用 `~/.cursor/mcp.json`）创建 `.cursor/mcp.json`：

   ```json
   {
     "mcpServers": {
       "context-mode": {
         "command": "context-mode"
       }
     }
   }
   ```

3. 创建 `.cursor/hooks.json`（或全局使用 `~/.cursor/hooks.json`）：

   ```json
   {
     "version": 1,
     "hooks": {
       "preToolUse": [
         {
           "command": "context-mode hook cursor pretooluse",
           "matcher": "Shell|Read|Grep|WebFetch|Task|MCP:ctx_execute|MCP:ctx_execute_file|MCP:ctx_batch_execute"
         }
       ],
       "postToolUse": [
         {
           "command": "context-mode hook cursor posttooluse"
         }
       ],
       "stop": [
         {
           "command": "context-mode hook cursor stop"
         }
       ]
     }
   }
   ```

   可选的 `preToolUse` matcher —— 没有它，hook 会触发所有工具。`stop` hook 在 agent 回合结束时触发，可以发送后续消息以继续循环。`afterAgentResponse` 也可用（即发即忘，接收完整的响应文本）。

4. 复制路由规则文件。Cursor 缺少 SessionStart hook，因此模型需要一个规则文件来感知路由：

   ```bash
   mkdir -p .cursor/rules
   cp node_modules/context-mode/configs/cursor/context-mode.mdc .cursor/rules/context-mode.mdc
   ```

5. 重启 Cursor 或打开一个新的 agent 会话。

**验证：** 打开 Cursor 设置 > MCP，确认“context-mode”显示为已连接。在 agent 聊天中，输入 `ctx stats`。

**路由：** Hooks 通过 `preToolUse`/`postToolUse`/`stop` 以编程方式强制路由。由于 Cursor 的 `sessionStart` hook 当前被其验证器拒绝，`.cursor/rules/context-mode.mdc` 文件在会话开始时提供路由指令。项目级的 `.cursor/hooks.json` 会覆盖 `~/.cursor/hooks.json`。

**已知限制：** Cursor 接受 hook 响应中的 `additional_context`，但不会将其呈现给模型。路由依赖 `.mdc` 规则文件而不是 hook 上下文注入。

完整配置：[`configs/cursor/hooks.json`](configs/cursor/hooks.json) | [`configs/cursor/mcp.json`](configs/cursor/mcp.json) | [`configs/cursor/context-mode.mdc`](configs/cursor/context-mode.mdc)

</details>

<details>
<summary><strong>OpenCode</strong> —— 带 hooks 的 TypeScript 插件</summary>

**前置条件：** Node.js 18+，已安装 OpenCode。

**安装：**

1. 全局安装 context-mode：

   ```bash
   npm install -g context-mode
   ```

2. 在项目根目录（或全局使用 `~/.config/opencode/opencode.json`）的 `opencode.json` 中添加：

   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "mcp": {
       "context-mode": {
         "type": "local",
         "command": ["context-mode"]
       }
     },
     "plugin": ["context-mode"]
   }
   ```

   `mcp` 条目注册所有 11 个 MCP 工具。`plugin` 条目启用 hooks —— OpenCode 会在每次工具执行前后直接调用插件的 TypeScript 函数，阻止危险命令并强制沙箱路由。

3. *（可选）* 复制路由规则文件。模型需要一个 `AGENTS.md` 文件来感知路由：

   ```bash
   cp node_modules/context-mode/configs/opencode/AGENTS.md AGENTS.md
   ```

   这告诉模型应该使用哪些工具以及哪些命令被阻止。没有它，hooks 仍然会强制路由 —— 但模型不会知道命令被拒绝的*原因*。

4. 重启 OpenCode。

**验证：** 在 OpenCode 会话中，输入 `ctx stats`。应该会出现 context-mode 工具并做出响应。

**路由：** Hooks 通过 `tool.execute.before` 和 `tool.execute.after` 以编程方式强制路由。可选的 [`AGENTS.md`](configs/opencode/AGENTS.md) 文件为模型感知提供路由指令。`experimental.session.compacting` hook 在对话压缩时构建恢复快照。`experimental.chat.system.transform` hook 在会话开始时注入路由块和先前会话的快照，实现跨重启的会话连续性。`chat.message` hook 捕获用户提示和决策（相当于 UserPromptSubmit）。

> **注意：** OpenCode 缺少真正的 SessionStart hook。该插件使用 `experimental.chat.system.transform` 作为替代 —— 它将路由块和恢复快照都注入到系统提示中。用户提示捕获使用 `chat.message` 代替缺失的 UserPromptSubmit hook。AGENTS.md/CLAUDE.md/CONTEXT.md 规则在项目首次触发 hook 时自动捕获。

完整配置：[`configs/opencode/opencode.json`](configs/opencode/opencode.json) | [`configs/opencode/AGENTS.md`](configs/opencode/AGENTS.md)

</details>

<details>
<summary><strong>KiloCode</strong> —— 带 hooks 的 TypeScript 插件</summary>

**前置条件：** Node.js 18+，已安装 KiloCode。

**安装：**

1. 全局安装 context-mode：

   ```bash
   npm install -g context-mode
   ```

2. 在项目根目录（或全局使用 `~/.config/kilo/kilo.json`）的 `kilo.json` 中添加：

   ```json
   {
     "$schema": "https://app.kilo.ai/config.json",
     "mcp": {
       "context-mode": {
         "type": "local",
         "command": ["context-mode"]
       }
     },
     "plugin": ["context-mode"]
   }
   ```

   `mcp` 条目注册所有 11 个 MCP 工具。`plugin` 条目启用 hooks —— KiloCode 会在每次工具执行前后直接调用插件的 TypeScript 函数，阻止危险命令并强制沙箱路由。

3. *（可选）* 复制路由规则文件。KiloCode 共享 OpenCode 插件架构，因此模型需要一个 `AGENTS.md` 文件来感知路由：

   ```bash
   cp node_modules/context-mode/configs/opencode/AGENTS.md AGENTS.md
   ```

4. 重启 KiloCode。

**验证：** 在 KiloCode 会话中，输入 `ctx stats`。应该会出现 context-mode 工具并做出响应。

**路由：** Hooks 通过 `tool.execute.before` 和 `tool.execute.after` 以编程方式强制路由。可选的 [`AGENTS.md`](configs/opencode/AGENTS.md) 文件为模型感知提供路由指令。`experimental.session.compacting` hook 在对话压缩时构建恢复快照。`experimental.chat.system.transform` hook 在会话开始时注入路由块和先前会话的快照，实现跨重启的会话连续性。`chat.message` hook 捕获用户提示和决策（相当于 UserPromptSubmit）。

> **注意：** KiloCode 与 OpenCode 共享相同的插件架构，使用 OpenCodeAdapter 以及特定于平台的配置路径（`kilo.json` 而不是 `opencode.json`，`~/.config/kilo/` 而不是 `~/.config/opencode/`）。与 OpenCode 一样，它缺少真正的 SessionStart hook —— 该插件使用 `experimental.chat.system.transform` 作为替代。用户提示捕获使用 `chat.message` 代替缺失的 UserPromptSubmit hook。AGENTS.md/CLAUDE.md/CONTEXT.md 规则在项目首次触发 hook 时自动捕获。

</details>

<details>
<summary><strong>OpenClaw / Pi Agent</strong> —— 原生网关插件</summary>

**前置条件：** OpenClaw 网关正在运行（[>2026.1.29](https://github.com/openclaw/openclaw/pull/9761)），Node.js 22+。

context-mode 作为原生 [OpenClaw](https://github.com/openclaw) 网关插件运行，针对 **Pi Agent** 会话（Read/Write/Edit/Bash 工具）。与其他平台不同，这里没有单独的 MCP 服务器 —— 该插件通过 OpenClaw 的[插件 API](https://docs.openclaw.ai/tools/plugin) 直接注册到网关运行时中。

**安装：**

1. 克隆并安装：

   ```bash
   git clone https://github.com/mksglu/context-mode.git
   cd context-mode
   npm run install:openclaw
   ```

   安装程序使用您环境中的 `$OPENCLAW_STATE_DIR`（默认值：`/openclaw`）。要指定自定义路径：

   ```bash
   npm run install:openclaw -- /path/to/openclaw-state
   ```

   常见位置：**Docker** —— `/openclaw`（默认）。**本地** —— `~/.openclaw` 或您设置 `OPENCLAW_STATE_DIR` 的任何位置。

   安装程序会处理一切：`npm install`、`npm run build`、`better-sqlite3` 原生重建、在 `runtime.json` 中注册扩展，以及通过 SIGUSR1 重启网关。

2. 打开一个 Pi Agent 会话。

**验证：** 该插件通过 [`api.on()`](https://docs.openclaw.ai/tools/plugin)（生命周期）和 [`api.registerHook()`](https://docs.openclaw.ai/tools/plugin)（命令）注册 8 个 hooks。输入 `ctx stats` 确认工具已加载。

**路由：** 自动。所有工具拦截、会话跟踪和压缩恢复 hooks 都会自动激活 —— 无需手动配置 hook 或路由文件。

> **最低版本：** OpenClaw >2026.1.29 —— 这包含了来自 [PR #9761](https://github.com/openclaw/openclaw/pull/9761) 的 `api.on()` 生命周期修复。在旧版本上，生命周期 hooks 会静默失败。适配器会回退到数据库快照重建（精度较低，但能保留关键状态）。

完整文档：[`docs/adapters/openclaw.md`](docs/adapters/openclaw.md)

</details>

<details>
<summary><strong>Codex CLI</strong> —— MCP + hooks</summary>

**前置条件：** Node.js 18+，已安装 Codex CLI。

**安装：**

1. 全局安装 context-mode：

   ```bash
   npm install -g context-mode
   ```

2. 添加到 `~/.codex/config.toml`：

   ```toml
   [mcp_servers.context-mode]
   command = "context-mode"
   ```

3. 添加 hooks 以强制路由和会话跟踪。创建 `~/.codex/hooks.json`：

   ```json
   {
     "hooks": {
       "PreToolUse": [{ "matcher": "local_shell|shell|shell_command|exec_command|container.exec|Bash|Shell|grep_files|mcp__plugin_context-mode_context-mode__ctx_execute|mcp__plugin_context-mode_context-mode__ctx_execute_file|mcp__plugin_context-mode_context-mode__ctx_batch_execute", "hooks": [{ "type": "command", "command": "context-mode hook codex pretooluse" }] }],
       "PostToolUse": [{ "hooks": [{ "type": "command", "command": "context-mode hook codex posttooluse" }] }],
       "SessionStart": [{ "hooks": [{ "type": "command", "command": "context-mode hook codex sessionstart" }] }],
       "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "context-mode hook codex userpromptsubmit" }] }],
       "Stop": [{ "hooks": [{ "type": "command", "command": "context-mode hook codex stop" }] }]
     }
   }
   ```

   `PreToolUse` 目前执行拒绝/阻止路由，并在 Codex 支持输入重写后做好准备。`PostToolUse` 捕获会话事件。`SessionStart` 在压缩后恢复状态。`UserPromptSubmit` 捕获用户决策和修正。`Stop` 记录回合结束状态。

   > **注意：** Codex PreToolUse 路由目前仅支持拒绝规则（阻止危险命令）。在 context-mode 能够重写工具输入之前，仍需要上游的 `updatedInput` 支持；请跟踪 [openai/codex#18491](https://github.com/openai/codex/issues/18491)。Codex PreToolUse 不支持上下文注入（`additionalContext`）—— 它通过 PostToolUse 和 SessionStart 工作。这会自动处理。

4. 复制路由指令（即使有 hooks 也建议复制，以获得完整的路由感知）：

   ```bash
   cp node_modules/context-mode/configs/codex/AGENTS.md ./AGENTS.md
   ```

   对于全局使用：`cp node_modules/context-mode/configs/codex/AGENTS.md ~/.codex/AGENTS.md`。全局适用于所有项目。如果两者都存在，Codex CLI 会合并它们。

5. 重启 Codex CLI。

**验证：** 启动一个会话并输入 `ctx stats`。应该会出现 context-mode 工具并做出响应。

**路由：** MCP 工具可以工作。当配置了 `~/.codex/hooks.json` 时，基于 hook 的路由处于活动状态。`AGENTS.md` 文件为模型感知提供路由指令。

</details>

<details>
<summary><strong>Qwen Code</strong> —— MCP + hooks（与 Claude Code 相同的线路协议）</summary>

**前置条件：** Node.js 18+，已安装 Qwen Code（`npm install -g @qwen-code/qwen-code`）。

1. 安装 context-mode：

   ```bash
   npm install -g context-mode
   ```

2. 将 context-mode 添加为 MCP 服务器。添加到 `~/.qwen/settings.json`：

   ```json
   {
     "mcpServers": {
       "context-mode": {
         "command": "context-mode",
         "args": []
       }
     }
   }
   ```

3. 添加 hooks 以强制路由和会话跟踪。添加到 `~/.qwen/settings.json`：

   ```json
   {
     "hooks": {
       "PreToolUse": [{ "matcher": "run_shell_command|read_file|read_many_files|grep_search|web_fetch|agent|mcp__plugin_context-mode_context-mode__ctx_execute|mcp__plugin_context-mode_context-mode__ctx_execute_file|mcp__plugin_context-mode_context-mode__ctx_batch_execute", "hooks": [{ "type": "command", "command": "context-mode hook qwen-code pretooluse" }] }],
       "PostToolUse": [{ "matcher": "", "hooks": [{ "type": "command", "command": "context-mode hook qwen-code posttooluse" }] }],
       "SessionStart": [{ "matcher": "", "hooks": [{ "type": "command", "command": "context-mode hook qwen-code sessionstart" }] }],
       "PreCompact": [{ "matcher": "", "hooks": [{ "type": "command", "command": "context-mode hook qwen-code precompact" }] }],
       "UserPromptSubmit": [{ "matcher": "", "hooks": [{ "type": "command", "command": "context-mode hook qwen-code userpromptsubmit" }] }]
     }
   }
   ```

4. 复制路由指令（建议获得完整的路由感知）：

   ```bash
   cp node_modules/context-mode/configs/qwen-code/QWEN.md ./QWEN.md
   ```

   对于全局使用：`cp node_modules/context-mode/configs/qwen-code/QWEN.md ~/.qwen/QWEN.md`

5. 重启 Qwen Code。

**验证：** 启动一个会话并输入 `ctx stats`。应该会出现 context-mode 工具并做出响应。

**注意：** Qwen Code 使用与 Claude Code 相同的 hook 线路协议（JSON stdin/stdout，相同的事件名称）。通过 MCP clientInfo（`qwen-cli-mcp-client-*`）或 `QWEN_PROJECT_DIR` 环境变量自动检测。

</details>

<details>
<summary><strong>Antigravity</strong> —— 仅 MCP，无 hooks</summary>

**前置条件：** Node.js 18+，已安装 Antigravity。

**安装：**

1. 全局安装 context-mode：

   ```bash
   npm install -g context-mode
   ```

2. 添加到 `~/.gemini/antigravity/mcp_config.json`：

   ```json
   {
     "mcpServers": {
       "context-mode": {
         "command": "context-mode"
       }
     }
   }
   ```

3. 复制路由指令（Antigravity 不支持 hook）：

   ```bash
   cp node_modules/context-mode/configs/antigravity/GEMINI.md ./GEMINI.md
   ```

4. 重启 Antigravity。

**验证：** 在 Antigravity 会话中，输入 `ctx stats`。应该会出现 context-mode 工具并做出响应。

**路由：** 手动。`GEMINI.md` 文件是唯一的


# 参考资料

* any list
{:toc}
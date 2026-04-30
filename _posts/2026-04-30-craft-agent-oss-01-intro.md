---
layout: post 
title: Craft Agents 是我们 (craft.do) 构建的工具，旨在让我们能与智能体高效协作。
date: 2026-04-30 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---


# Craft Agents

## 工作原理（视频）

观看此视频，了解 Craft Agents 的作用及其工作方式。

[![Demo Video](https://img.youtube.com/vi/xQouiAIilvU/hqdefault.jpg)](https://www.youtube.com/watch?v=xQouiAIilvU)

[点击此处（或上方图片）在 YouTube 上观看视频 →](https://www.youtube.com/watch?v=xQouiAIilvU)

## 为什么开发 Craft Agents

Craft Agents 是我们 (craft.do) 构建的工具，旨在让我们能与智能体高效协作。它实现了直观的多任务处理、与任何 API 或服务的直接连接、会话共享，以及更以文档（而非代码）为中心的工作流——所有这些都集成在一个美观流畅的用户界面中。

它同时使用 Claude Agent SDK 和 Pi SDK，在我们发现优秀之处的基础上构建，并对我们期望改进的地方进行了提升。

它遵循智能体原生软件理念构建，开箱即用且高度可定制，是同类产品中的先行者。

Craft Agents 基于 Apache 2.0 许可证开源——您可以自由地重新组合、修改任何内容。而且这真的可行。我们自己正完全使用 Craft Agents 来构建 Craft Agents——不使用任何代码编辑器——因此，实际上，任何定制都只需要一句提示词。

我们之所以构建 Craft Agents，是因为我们想要一种更优秀、更理念明确（且最好是非 CLI 方式）的与世界上最强大的智能体协作的方式。我们将基于自身经验与直觉持续改进它。

<img width="1578" height="894" alt="image" src="https://github.com/user-attachments/assets/3f1f2fe8-7cf6-4487-99ff-76f6c8c0a3fb" />

## 那些令人难以置信的“开箱即用”功能

**如何连接到 Linear、Gmail、Slack……？**
告诉智能体“将 Linear 添加为来源”。它会查找公共 API 和 MCP 服务器，阅读它们的文档，设置凭据并配置好一切。无需配置文件，无需设置向导。

[看看我是如何直接连接到 Slack 的 →](https://agents.craft.do/s/DRNQEiy8w2e1v5LPgKl8b)

**我已有 MCP 配置 JSON。**
粘贴进去即可，智能体会处理其余部分。

**本地 MCP 呢？**
完全支持。基于 Stdio 的 MCP 服务器会作为您机器上的本地子进程运行。将它指向一个 npx 命令、Python 脚本或任何本地二进制文件，即可正常工作。

**它能处理自定义 API 吗？**
是的。粘贴 OpenAPI 规范、一些端点 URL、文档截图等，无论您提供什么，它都能理解并引导您完成剩余步骤。

**不仅是 MCP，API 也可以吗？**
Craft Agents 可以连接任何东西。我们已将其连接到跳板机后面的一个直接 Postgres 数据库。技能 + 来源 = 魔法。

**如何导入我的 Claude Code 技能和 MCP？**
告诉智能体您想要从 Claude Code 导入技能，它会处理迁移。

[这里我一次性导入了所有技能 →](https://agents.craft.do/s/gWCFqwhObFWaNJIEJmd6j)

**如何创建新技能？**
描述该技能应做什么，提供一些上下文，智能体将负责其余工作。

**更改后需要重启吗？**
不需要。一切都是即时的。即使在对话过程中，也可以使用 `@` 提及新的技能或来源。

**所以我可以直接向它提出任何要求？**
是的。这就是智能体原生软件的核心思想。您描述您想要什么，它来想办法实现。这是对 Token 的良好利用。

## 安装

### 一行命令安装（推荐）

**macOS / Linux：**
```bash
curl -fsSL https://agents.craft.do/install-app.sh | bash
```

**Windows (PowerShell)：**
```powershell
irm https://agents.craft.do/install-app.ps1 | iex
```

### 从源码构建

```bash
git clone https://github.com/lukilabs/craft-agents-oss.git
cd craft-agents-oss
bun install
bun run electron:start
```

## 功能特性

- **多会话收件箱**：桌面应用具备会话管理、状态工作流和标记功能
- **Claude Code 风格体验**：流式响应、工具可视化、实时更新
- **多 LLM 连接**：添加多个 AI 供应商，并为每个工作区设置默认值
- **多供应商支持**：可在 Anthropic 之外，使用 Google AI Studio、ChatGPT Plus、GitHub Copilot 或 OpenAI API 密钥运行会话
- **Craft MCP 集成**：可访问 32 个以上的 Craft 文档工具（块、集合、搜索、任务）
- **来源**：连接 MCP 服务器、REST API（Google、Slack、Microsoft）以及本地文件系统
- **权限模式**：三级系统（Explore、Ask to Edit、Auto），可自定义规则
- **后台任务**：运行长时间操作并具备进度跟踪
- **动态状态系统**：可自定义的会话工作流状态（Todo、In Progress、Done 等）
- **主题系统**：在应用和工作区级别层叠应用主题
- **多文件差异对比**：VS Code 风格的窗口，查看一轮会话中所有文件的更改
- **技能**：按工作区存储的专用智能体指令
- **文件附件**：拖放图片、PDF、Office 文档，自动转换
- **自动化**：事件驱动的自动化——可在标签更改、计划任务、工具使用等事件发生时创建智能体会话

## 快速开始

1. 安装后**启动应用**
2. **选择 API 连接**：使用 Anthropic（API 密钥或 Claude Max）、Google AI Studio、ChatGPT Plus（Codex OAuth）或 GitHub Copilot OAuth
3. **创建工作区**：设置工作区来组织您的会话
4. **连接来源**（可选）：添加 MCP 服务器、REST API 或本地文件系统
5. **开始聊天**：创建会话并与 Claude 互动

## 桌面应用功能

### 会话管理

- **收件箱/存档**：按工作流状态组织的会话
- **标记**：标记重要会话以便快速访问
- **状态工作流**：待办 → 进行中 → 需审查 → 已完成
- **会话命名**：AI 生成的标题或手动命名
- **会话持久化**：完整的对话历史记录保存至磁盘

### 来源

将外部数据源连接到工作区：

| 类型 | 示例 |
|------|----------|
| **MCP 服务器** | Craft、Linear、GitHub、Notion、自定义服务器 |
| **REST API** | Google（Gmail、日历、云端硬盘、YouTube、Search Console）、Slack、Microsoft |
| **本地文件** | 文件系统、Obsidian 仓库、Git 仓库 |

### 权限模式

| 模式 | 显示 | 行为 |
|------|---------|----------|
| `safe` | Explore（探索） | 只读，阻止所有写入操作 |
| `ask` | Ask to Edit（询问编辑） | 提示审批（默认） |
| `allow-all` | Auto（自动） | 自动批准所有命令 |

使用 **SHIFT+TAB** 在聊天界面中循环切换模式。

### 键盘快捷键

| 快捷键 | 操作 |
|----------|--------|
| `Cmd+N` | 新建聊天 |
| `Cmd+1/2/3` | 聚焦侧边栏/列表/聊天 |
| `Cmd+/` | 键盘快捷键对话框 |
| `SHIFT+TAB` | 循环切换权限模式 |
| `Enter` | 发送消息 |
| `Shift+Enter` | 换行 |

## 远程服务器（无头模式）

Craft Agents 可作为无头服务器运行在远程机器上（如 Linux VPS），桌面应用作为瘦客户端连接。这样您可以保持长时间运行的会话处于活跃状态，从多台机器访问它们，并在性能强大的服务器上运行计算密集型任务。

### 快速开始

在 monorepo 根目录中：

```bash
# 生成令牌并启动服务器
CRAFT_SERVER_TOKEN=$(openssl rand -hex 32) bun run packages/server/src/index.ts
```

服务器启动时会输出连接详情：

```
CRAFT_SERVER_URL=ws://203.0.113.5:9100
CRAFT_SERVER_TOKEN=<generated-token>
```

复制这些值并用于连接桌面应用。

### 连接桌面应用

通过传入服务器 URL 和令牌，在瘦客户端模式下启动 Electron 应用：

```bash
CRAFT_SERVER_URL=wss://203.0.113.5:9100 CRAFT_SERVER_TOKEN=<token> bun run electron:start
```

在瘦客户端模式下，桌面应用仅渲染用户界面，所有会话逻辑、工具执行和 LLM 调用都在远程服务器上运行。

### 环境变量

| 变量 | 是否必需 | 默认值 | 描述 |
|----------|----------|---------|-------------|
| `CRAFT_SERVER_TOKEN` | 是 | — | 用于客户端认证的 Bearer 令牌 |
| `CRAFT_RPC_HOST` | 否 | `127.0.0.1` | 绑定地址（远程访问需设为 `0.0.0.0`） |
| `CRAFT_RPC_PORT` | 否 | `9100` | 绑定端口 |
| `CRAFT_RPC_TLS_CERT` | 否 | — | PEM 证书文件路径（启用 `wss://`） |
| `CRAFT_RPC_TLS_KEY` | 否 | — | PEM 私钥文件路径（与证书同时使用） |
| `CRAFT_RPC_TLS_CA` | 否 | — | PEM CA 链文件路径（可选，用于验证客户端证书） |
| `CRAFT_DEBUG` | 否 | `false` | 启用调试日志 |

### TLS（远程访问推荐配置）

在公网暴露服务器时，TLS 会加密 WebSocket 连接（由 `ws://` 变为 `wss://`）。

**生成自签名证书（开发/测试用）：**

```bash
./scripts/generate-dev-cert.sh
# 在 certs/ 目录下创建 cert.pem 和 key.pem（有效期 365 天）
```

**使用 TLS 启动服务器：**

```bash
CRAFT_SERVER_TOKEN=<token> \
CRAFT_RPC_HOST=0.0.0.0 \
CRAFT_RPC_TLS_CERT=certs/cert.pem \
CRAFT_RPC_TLS_KEY=certs/key.pem \
bun run packages/server/src/index.ts
```

服务器将打印 `CRAFT_SERVER_URL=wss://<your-public-ip>:9100`。

**生产环境中**，请使用受信任的 CA（如 Let's Encrypt）颁发的证书，或将服务器置于反向代理（nginx、Caddy）之后，由代理终结 TLS。

### Docker

```bash
docker run -d \
  -p 9100:9100 \
  -e CRAFT_SERVER_TOKEN=<token> \
  -e CRAFT_RPC_HOST=0.0.0.0 \
  -v craft-data:/root/.craft-agent \
  craft-agents-server
```

要在 Docker 中启用 TLS，请挂载证书并设置环境变量：

```bash
docker run -d \
  -p 9100:9100 \
  -e CRAFT_SERVER_TOKEN=<token> \
  -e CRAFT_RPC_HOST=0.0.0.0 \
  -e CRAFT_RPC_TLS_CERT=/certs/cert.pem \
  -e CRAFT_RPC_TLS_KEY=/certs/key.pem \
  -v ./certs:/certs:ro \
  -v craft-data:/root/.craft-agent \
  craft-agents-server
```

## CLI 客户端

一个终端客户端，通过 WebSocket（`ws://` 或 `wss://`）连接到运行中的 Craft Agent 服务器。可用于脚本编写、CI/CD 流水线、服务器验证，或当您偏好命令行时使用。

### 安装

```bash
# 从 monorepo 安装（需要 Bun）
bun run apps/cli/src/index.ts --help

# 或添加到 PATH
alias craft-cli="bun run $(pwd)/apps/cli/src/index.ts"
```

### 连接

CLI 通过命令行标志或环境变量读取连接详情：

```bash
# 通过环境变量设置（一次性设置）
export CRAFT_SERVER_URL=ws://127.0.0.1:9100
export CRAFT_SERVER_TOKEN=<your-token>

# 或通过标志设置
craft-cli --url ws://127.0.0.1:9100 --token <token> ping
```

对于 TLS 连接（`wss://`），自签名证书需使用 `--tls-ca <path>` 指定 CA。

### 命令

| 命令 | 描述 |
|---------|-------------|
| `ping` | 验证连通性（返回 clientId + 延迟） |
| `health` | 检查凭据存储健康状况 |
| `versions` | 显示服务器运行时的各组件版本 |
| `workspaces` | 列出工作区 |
| `sessions` | 列出工作区中的会话 |
| `connections` | 列出 LLM 连接 |
| `sources` | 列出已配置的来源 |
| `session create` | 创建会话（`--name`、`--mode`） |
| `session messages <id>` | 打印会话消息历史 |
| `session delete <id>` | 删除会话 |
| `send <id> <message>` | 发送消息并流式接收 AI 回复 |
| `cancel <id>` | 取消进行中的处理 |
| `invoke <channel> [args]` | 使用 JSON 参数进行原始 RPC 调用 |
| `listen <channel>` | 订阅推送事件（按 Ctrl+C 停止） |
| `run <prompt>` | 自包含模式：启动服务器、运行提示词、流式输出回复、退出 |
| `--validate-server` | 21 步集成测试（若未提供 `--url` 则自动启动服务器） |

#### Run 命令标志

| 标志 | 默认值 | 描述 |
|------|---------|-------------|
| `--workspace-dir <path>` | — | 运行前注册一个工作区目录 |
| `--source <slug>` | — | 启用一个来源（可重复使用） |
| `--output-format <fmt>` | `text` | 输出格式：`text` 或 `stream-json` |
| `--mode <mode>` | `allow-all` | 会话的权限模式 |
| `--no-cleanup` | `false` | 退出时跳过删除会话 |
| `--server-entry <path>` | — | 自定义服务器入口点 |
| `--provider <name>` | `anthropic` | LLM 供应商（`anthropic`、`openai`、`google`、`openrouter`、`groq`、`mistral`、`xai` 等） |
| `--model <id>` | （供应商默认） | 模型 ID（例如 `claude-sonnet-4-5-20250929`、`gpt-4o`、`gemini-2.0-flash`） |
| `--api-key <key>` | — | API 密钥（或 `$LLM_API_KEY`，或供应商特定的环境变量） |
| `--base-url <url>` | — | 用于代理或自托管模型的自定义 API 端点 |

`run` 命令是完全自包含的——它启动一个无头服务器，创建一个会话，发送提示词，流式输出回复，然后退出。无需单独搭建服务器。API 密钥从 `--api-key`、`$LLM_API_KEY` 或供应商特定的环境变量（如 `$ANTHROPIC_API_KEY`、`$OPENAI_API_KEY`）中获取。

### 示例

```bash
# 快速连通性检查
craft-cli ping

# 列出会话（人类可读格式）
craft-cli sessions

# 发送消息并流式接收 AI 回复
craft-cli send abc-123 "当前目录下有哪些文件？"

# 管道输入
echo "总结一下这个内容" | craft-cli send abc-123

# 用于脚本的 JSON 输出
craft-cli --json workspaces | jq '.[].name'

# 自包含运行（启动自己的服务器）
craft-cli run "总结 README"
craft-cli run --workspace-dir ./my-project --source github "列出未合并的 PR"

# 多供应商支持
craft-cli run --provider openai --model gpt-4o "总结这个仓库"
GOOGLE_API_KEY=... craft-cli run --provider google --model gemini-2.0-flash "你好"
craft-cli run --provider anthropic --base-url https://openrouter.ai/api/v1 --api-key $OR_KEY "你好"

# 验证服务器（若未提供 --url 则自动启动）
craft-cli --validate-server
craft-cli --validate-server --url ws://127.0.0.1:9100 --token <token>
```

## 架构

```
craft-agent/
├── apps/
│   ├── cli/                   # 终端客户端 (CLI)
│   └── electron/              # 桌面 GUI（主要）
│       └── src/
│           ├── main/          # Electron 主进程
│           ├── preload/       # 上下文桥接
│           └── renderer/      # React UI（Vite + shadcn）
└── packages/
    ├── core/                  # 共享类型
    └── shared/                # 业务逻辑
        └── src/
            ├── agent/         # CraftAgent、权限管理
            ├── auth/          # OAuth、令牌
            ├── config/        # 存储、偏好、主题
            ├── credentials/   # AES-256-GCM 加密存储
            ├── sessions/      # 会话持久化
            ├── sources/       # MCP、API、本地来源
            └── statuses/      # 动态状态系统
```

## 开发

```bash
# 热重载开发模式
bun run electron:dev

# 构建并运行
bun run electron:start

# 类型检查
bun run typecheck:all

# 调试日志（写入 ~/Library/Logs/@craft-agent/electron/ 目录下）
# 开发模式下日志自动启用
```

### 环境变量

OAuth 集成（Slack、Microsoft）需要在构建中嵌入凭据。请创建一个 `.env` 文件：

```bash
MICROSOFT_OAUTH_CLIENT_ID=your-client-id
SLACK_OAUTH_CLIENT_ID=your-slack-client-id
SLACK_OAUTH_CLIENT_SECRET=your-slack-client-secret
```

**注意：** Google OAuth 凭据不会嵌入到构建中。用户需通过来源配置提供自己的凭据。请参阅下方的 [Google OAuth 设置](#google-oauth-设置-gmail日历云端硬盘) 部分。

### Google OAuth 设置（Gmail、日历、云端硬盘、YouTube、Search Console）

Google 集成需要您创建自己的 OAuth 凭据。这是一次性设置。

#### 1. 创建 Google Cloud 项目

1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 创建一个新项目（或选择现有项目）
3. 记下您的项目 ID

#### 2. 启用所需 API

前往 **APIs & Services → Library** 并启用您所需的 API：
- **Gmail API** - 用于电子邮件集成
- **Google Calendar API** - 用于日历集成
- **Google Drive API** - 用于文件存储集成

#### 3. 配置 OAuth 同意屏幕

1. 前往 **APIs & Services → OAuth consent screen**
2. 选择 **External** 用户类型（除非您有 Google Workspace）
3. 填写必填字段：
   - 应用名称：例如 "My Craft Agent"
   - 用户支持电子邮件：您的邮箱
   - 开发者联系信息：您的邮箱
4. 添加范围（可选，可使用默认值）
5. 将您自己添加为测试用户（测试模式下的 External 应用必须执行此操作）
6. 完成向导

#### 4. 创建 OAuth 凭据

1. 前往 **APIs & Services → Credentials**
2. 点击 **Create Credentials → OAuth Client ID**
3. 应用类型：**Desktop app**
4. 名称：例如 "Craft Agent Desktop"
5. 点击 **Create**
6. 记下 **Client ID** 和 **Client Secret**

#### 5. 在 Craft Agent 中配置

设置 Google 来源（Gmail、日历、云端硬盘、YouTube、Search Console 等）时，将以下字段添加到来源的 `config.json` 中：

```json
{
  "api": {
    "googleService": "gmail",
    "googleOAuthClientId": "your-client-id.apps.googleusercontent.com",
    "googleOAuthClientSecret": "your-client-secret"
  }
}
```

或者直接告诉智能体您想要连接 Gmail/日历/云端硬盘——它会引导您输入凭据。

#### 安全说明

- 您的 OAuth 凭据会与其他来源凭据一同加密存储
- 切勿将凭据提交到版本控制系统
- 在生产环境中使用时，建议让 Google 验证您的 OAuth 同意屏幕

## 支持的 LLM 供应商

Craft Agents 支持多种连接 LLM 供应商的方式：

### 直接连接

| 供应商 | 认证方式 | 备注 |
|----------|------|-------|
| **Anthropic** | API 密钥或 Claude Max/Pro OAuth | 通过 Claude Agent SDK 直接连接 Claude |
| **Google AI Studio** | API 密钥 | Gemini 模型，内置 Google Search 接地能力 |
| **ChatGPT Plus / Pro** | Codex OAuth | 使用 ChatGPT 订阅登录——使用 OpenAI 的 Codex 模型 |
| **GitHub Copilot** | OAuth（设备码） | 一键认证您的 Copilot 订阅 |

### 第三方与自托管供应商

通过选择自定义端点，可通过 **Claude / Anthropic API 密钥** 连接来支持其他供应商：

| 供应商 | 端点 | 备注 |
|----------|----------|-------|
| **OpenRouter** | `https://openrouter.ai/api` | 通过单一 API 密钥访问 Claude、GPT、Llama、Gemini 及其他数百个模型。使用 `provider/model-name` 格式（例如 `anthropic/claude-opus-4.7`）。 |
| **Vercel AI Gateway** | `https://ai-gateway.vercel.sh` | 通过 Vercel 的 AI Gateway 路由请求，内置可观测性和缓存。 |
| **Ollama** | `http://localhost:11434` | 本地运行开源模型，无需 API 密钥。 |
| **自定义** | 任意 URL | 支持任何与 OpenAI 或 Anthropic 兼容的端点。 |

### 架构

Craft Agents 使用两种智能体后端：

- **Claude** — 由 [Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk) 提供支持，原生支持自定义基础 URL 和供应商路由。Anthropic API 密钥、Claude Max/Pro OAuth 及所有第三方端点均使用此后端。
- **Pi** — 由 Pi SDK 提供支持，处理 Google AI Studio、ChatGPT Plus（Codex OAuth）、GitHub Copilot OAuth 和 OpenAI API 密钥连接。Pi 连接通过其自身的供应商基础设施进行路由。

## 配置

配置存储在 `~/.craft-agent/` 目录中：

```
~/.craft-agent/
├── config.json              # 主配置（工作区、LLM 连接）
├── credentials.enc          # 加密凭据 (AES-256-GCM)
├── preferences.json         # 用户偏好
├── theme.json               # 应用级主题
└── workspaces/
    └── {id}/
        ├── config.json      # 工作区设置
        ├── theme.json       # 工作区主题覆盖
        ├── automations.json  # 事件驱动的自动化
        ├── sessions/        # 会话数据 (JSONL)
        ├── sources/         # 已连接的来源
        ├── skills/          # 自定义技能
        └── statuses/        # 状态配置
```

### 自动化

自动化让您可以通过在事件发生时触发操作来实现工作流自动化——例如标签变更、会话开启、工具运行，或按 cron 计划执行。

**只需告诉智能体：**
- “设置每个工作日早上 9 点的每日站会简报”
- “当一个会话被标记为 urgent 时通知我”
- “跟踪权限模式变更并进行总结”
- “每周五下午 5 点总结本周已完成的任务”

或手动在 `~/.craft-agent/workspaces/{id}/automations.json` 中进行配置：

```json
{
  "version": 2,
  "automations": {
    "SchedulerTick": [
      {
        "cron": "0 9 * * 1-5",
        "timezone": "America/New_York",
        "labels": ["Scheduled"],
        "actions": [
          { "type": "prompt", "prompt": "查看 @github 上分配给我的新 issues" }
        ]
      }
    ],
    "LabelAdd": [
      {
        "matcher": "^urgent$",
        "actions": [
          { "type": "prompt", "prompt": "添加了紧急标签。请检查该会话并总结需要关注的内容。" }
        ]
      }
    ]
  }
}
```

**提示词操作** 会创建一个包含提示词的智能体会话。它们支持使用 `@提及` 引用来源和技能，`$CRAFT_LABEL` 和 `$CRAFT_SESSION_ID` 等环境变量也会自动展开。

**支持的事件：** `LabelAdd`、`LabelRemove`、`PermissionModeChange`、`FlagChange`、`SessionStatusChange`、`SchedulerTick`、`PreToolUse`、`PostToolUse`、`SessionStart`、`SessionEnd` 等。

有关完整参考，请参阅 [自动化文档](https://agents.craft.do/docs/automations/overview)。

## 高级特性

### 大型响应处理

超过约 60KB 的工具响应会自动使用 Claude Haiku 进行摘要，并注入了意图感知上下文。`_intent` 字段被注入到 MCP 工具架构中，以保持摘要聚焦。

### 深度链接

外部应用可通过 `craftagents://` URL 进行导航：

```
craftagents://allSessions                      # 所有会话视图
craftagents://allSessions/session/session123   # 特定会话
craftagents://settings                         # 设置
craftagents://sources/source/github            # 来源信息
craftagents://action/new-chat                  # 创建新会话
```

## 技术栈

| 层级 | 技术 |
|-------|------------|
| 运行时 | [Bun](https://bun.sh/) |
| AI | [@anthropic-ai/claude-agent-sdk](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk) |
| AI (Pi) | Pi SDK 智能体服务器 |
| 桌面 | [Electron](https://www.electronjs.org/) + React |
| UI | [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS v4 |
| 构建 | esbuild（主进程）+ Vite（渲染进程） |
| 凭据 | AES-256-GCM 加密文件存储 |

## 故障排除

### 调试模式

要启动带有详细日志记录的打包应用，请使用 `-- --debug`（注意双破折号分隔符）：

**macOS：**
```bash
/Applications/Craft\ Agents.app/Contents/MacOS/Craft\ Agents -- --debug
```

**Windows (PowerShell)：**
```powershell
& "$env:LOCALAPPDATA\Programs\@craft-agentelectron\Craft Agents.exe" -- --debug
```

**Linux：**
```bash
./craft-agents -- --debug
```

日志写入路径：
- **macOS：** `~/Library/Logs/@craft-agent/electron/main.log`
- **Windows：** `%APPDATA%\@craft-agent\electron\logs\main.log`
- **Linux：** `~/.config/@craft-agent/electron/logs/main.log`

## 许可证

本项目基于 Apache License 2.0 许可证授权——详情请参阅 [LICENSE](LICENSE) 文件。

### 第三方许可证

本项目使用 [Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)，其受 [Anthropic 商业服务条款](https://www.anthropic.com/legal/commercial-terms) 约束。

### 商标

"Craft" 和 "Craft Agents" 是 Craft Docs Ltd. 的商标。使用指南请参阅 [TRADEMARK.md](TRADEMARK.md)。

## 贡献

我们欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解相关准则。

## 安全性

### 本地 MCP 服务器隔离

在生成本地 MCP 服务器（stdio 传输方式）时，敏感环境变量会被过滤，以防止凭据泄露给子进程。被阻止的变量包括：

- `ANTHROPIC_API_KEY`、`CLAUDE_CODE_OAUTH_TOKEN`（应用认证）
- `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`
- `GITHUB_TOKEN`、`GH_TOKEN`、`OPENAI_API_KEY`、`GOOGLE_API_KEY`、`STRIPE_SECRET_KEY`、`NPM_TOKEN`

要向特定 MCP 服务器显式传递某个环境变量，请在来源配置中使用 `env` 字段。

要报告安全漏洞，请参阅 [SECURITY.md](SECURITY.md)。

# 参考资料

* any list
{:toc}
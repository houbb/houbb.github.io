---
layout: post 
title: Open Agents 是一个开源参考应用，用于在 Vercel 上构建和运行后台编码智能体。
date: 2026-04-16 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---


# Open Agents

Open Agents 是一个开源参考应用，用于在 Vercel 上构建和运行后台编码智能体。

它包含了 Web UI、智能体运行时、沙箱编排以及 GitHub 集成，使得从提示词到代码变更的全流程无需依赖您的本地电脑持续运行。

本仓库旨在被 fork 和适配，而非作为一个黑盒使用。

## 它是什么

Open Agents 是一个三层系统：

```text
Web -> 智能体工作流 -> 沙箱虚拟机
```

- Web 应用处理身份验证、会话、聊天和流式 UI。
- 智能体在 Vercel 上以持久化工作流的形式运行。
- 沙箱是执行环境：文件系统、Shell、Git、开发服务器以及预览端口。

### 关键架构决策：智能体 ≠ 沙箱

智能体并不运行在虚拟机内部。它运行在沙箱外部，并通过文件读取、编辑、搜索和 Shell 命令等工具与沙箱交互。

这种分离是项目的主要设计点：

- 智能体的执行不绑定到单个请求生命周期
- 沙箱的生命周期可以独立休眠和恢复
- 模型/提供商的选择和沙箱的实现可以分别演进
- 虚拟机始终保持为一个纯粹的执行环境，而不是控制平面

## 当前能力

- 基于聊天的编码智能体，包含文件、搜索、Shell、任务、技能和 Web 工具
- 支持 Workflow SDK 的持久化多步骤执行、流式传输和取消
- 基于快照恢复的隔离 Vercel 沙箱
- 在沙箱内克隆仓库和进行分支工作
- 运行成功后可选自动提交、推送和创建 PR
- 通过只读链接分享会话
- 通过 ElevenLabs 转录实现可选的语音输入

## 运行时说明

理解当前实现时需要留意的一些细节：

- 聊天请求会启动一个工作流运行，而不是直接内联执行智能体。
- 每个智能体回合可以跨越多个持久化的工作流步骤继续进行。
- 可以通过重新连接到现有工作流的流来恢复活跃的运行。
- 沙箱使用基础快照，暴露端口 `3000`、`5173`、`4321` 和 `8000`，并在不活动后休眠。
- 支持自动提交和自动 PR，但这些是由偏好驱动的功能，并非总是开启的行为。

## 当前实际需要的配置

这些要求基于当前 `apps/web` 的代码路径，而非旧版设置脚本。

### 最低运行时要求

以下是应用启动并加载服务端状态所必需的硬性要求：

```env
POSTGRES_URL=
JWE_SECRET=
```

### 登录并实际使用托管应用所需配置

一个有实际用途的部署还需要令牌加密以及 Vercel OAuth 登录：

```env
ENCRYPTION_KEY=
NEXT_PUBLIC_VERCEL_APP_CLIENT_ID=
VERCEL_APP_CLIENT_SECRET=
```

如果没有这些配置，站点可以部署，但 Vercel 登录将无法工作。

### 访问 GitHub 仓库、推送和 PR 所需配置

如果您希望用户连接 GitHub、在仓库/组织上安装应用、克隆私有仓库、推送分支或发起 PR，请添加以下 GitHub App 配置：

```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
NEXT_PUBLIC_GITHUB_APP_SLUG=
GITHUB_WEBHOOK_SECRET=
```

### 可选配置

```env
REDIS_URL=
KV_URL=
VERCEL_PROJECT_PRODUCTION_URL=
NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL=
VERCEL_SANDBOX_BASE_SNAPSHOT_ID=
ELEVENLABS_API_KEY=
```

- `REDIS_URL` / `KV_URL`：可选的技能元数据缓存（未配置时回退到内存缓存）。
- `VERCEL_PROJECT_PRODUCTION_URL` / `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`：用于元数据和某些回调行为的规范生产 URL。
- `VERCEL_SANDBOX_BASE_SNAPSHOT_ID`：覆盖默认的沙箱快照。
- `ELEVENLABS_API_KEY`：语音转录。

## 在 Vercel 上部署您自己的副本

推荐路径：在 Vercel 上部署本仓库的根目录，然后叠加身份验证和 GitHub 集成。

1. Fork 本仓库。
2. 创建一个 PostgreSQL 数据库并复制其连接字符串。
3. 生成以下密钥：

   ```bash
   openssl rand -base64 32 | tr '+/' '-_' | tr -d '=\n'   # JWE_SECRET
   openssl rand -hex 32                                    # ENCRYPTION_KEY
   ```

4. 将仓库导入 Vercel。
5. 在 Vercel 项目设置中至少添加以下环境变量：

   ```env
   POSTGRES_URL=
   JWE_SECRET=
   ENCRYPTION_KEY=
   ```

6. 部署一次以获得一个稳定的生产 URL。
7. 创建一个 Vercel OAuth 应用，回调 URL 为：

   ```text
   https://YOUR_DOMAIN/api/auth/vercel/callback
   ```

8. 添加以下环境变量并重新部署：

   ```env
   NEXT_PUBLIC_VERCEL_APP_CLIENT_ID=
   VERCEL_APP_CLIENT_SECRET=
   ```

9. 如果您想要完整的支持 GitHub 的编码智能体流程，请创建一个 GitHub App，使用：

   - 主页 URL：`https://YOUR_DOMAIN`
   - 回调 URL：`https://YOUR_DOMAIN/api/github/app/callback`
   - 设置 URL：`https://YOUR_DOMAIN/api/github/app/callback`

   在 GitHub App 设置中：
   - 启用“安装时请求用户授权 (OAuth)”
   - 使用 GitHub App 的 Client ID 和 Client Secret 作为 `NEXT_PUBLIC_GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`
   - 如果希望组织安装正常工作，请将应用设为公开

10. 添加 GitHub App 的环境变量并重新部署。
11. 可选地添加 Redis/KV 以及规范生产 URL 变量。

## 本地设置

1. 安装依赖：

   ```bash
   bun install
   ```

2. 创建本地环境变量文件：

   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

3. 在 `apps/web/.env` 中填写所需的值。
4. 启动应用：

   ```bash
   bun run web
   ```

如果您已经有一个关联的 Vercel 项目，您仍然可以使用 `vc env pull` 在本地拉取环境变量，但现在设置是故意手动的，以便您确切知道哪些值是重要的。

## OAuth 和集成设置

### Vercel OAuth

创建一个 Vercel OAuth 应用并使用以下回调：

```text
https://YOUR_DOMAIN/api/auth/vercel/callback
```

本地开发时，使用：

```text
http://localhost:3000/api/auth/vercel/callback
```

然后设置：

```env
NEXT_PUBLIC_VERCEL_APP_CLIENT_ID=...
VERCEL_APP_CLIENT_SECRET=...
```

### GitHub App

您不需要单独的 GitHub OAuth 应用。Open Agents 使用 GitHub App 的用户授权流程。

创建一个 GitHub App，用于基于安装的仓库访问，并配置：

- 主页 URL：`https://YOUR_DOMAIN`
- 回调 URL：`https://YOUR_DOMAIN/api/github/app/callback`
- 设置 URL：`https://YOUR_DOMAIN/api/github/app/callback`
- 启用“安装时请求用户授权 (OAuth)”
- 如果希望组织安装正常工作，请将应用设为公开

本地开发时，使用 `http://localhost:3000/api/github/app/callback` 作为回调/设置 URL，使用 `http://localhost:3000` 作为主页 URL。

然后设置：

```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=...   # GitHub App 的 Client ID
GITHUB_CLIENT_SECRET=...           # GitHub App 的 Client Secret
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...
NEXT_PUBLIC_GITHUB_APP_SLUG=...
GITHUB_WEBHOOK_SECRET=...
```

`GITHUB_APP_PRIVATE_KEY` 可以存储为包含转义换行符的 PEM 内容，或者存储为 base64 编码的 PEM。

## 常用命令

```bash
bun run web
bun run check
bun run typecheck
bun run ci
bun run sandbox:snapshot-base
```

## 仓库结构

```text
apps/web         Next.js 应用、工作流、身份验证、聊天 UI
packages/agent   智能体实现、工具、子智能体、技能
packages/sandbox 沙箱抽象以及 Vercel 沙箱集成
packages/shared  共享工具
```

# 参考资料

* any list
{:toc}
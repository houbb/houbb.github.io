---
layout: post
title: Claude-Mem-06-Claude-Mem 使用入门
date: 2026-03-16 21:01:55 +0800
categories: [AI]
tags: [ai, memory, sh]
published: true
---

# Claude-Mem 使用入门

## 自动运行

Claude-Mem 安装后即可自动工作，无需手动干预！

### 完整工作流程

1. **启动 Claude Code** - 自动显示最近 10 次会话的上下文
2. **正常工作** - 每次工具执行都会被捕获记录
3. **Claude 完成响应** - Stop 钩子自动生成并保存摘要
4. **下次会话** - 之前的工作内容自动出现在上下文中

### 捕获内容

每次 Claude 使用工具时，claude-mem 都会捕获：

- **Read** - 文件读取和内容访问
- **Write** - 新文件创建
- **Edit** - 文件修改
- **Bash** - 命令执行
- **Glob** - 文件模式搜索
- **Grep** - 内容搜索
- 以及所有其他 Claude Code 工具

### 处理内容

工作服务处理工具观测数据并提取：

- **Title** - 发生事件的简要描述
- **Subtitle** - 额外上下文信息
- **Narrative** - 详细说明
- **Facts** - 关键要点（以项目符号列出）
- **Concepts** - 相关标签和分类
- **Type** - 分类（决策、bug修复、功能等）
- **Files** - 读取或修改的文件

### 会话摘要

当 Claude 完成响应时（触发 Stop 钩子），自动生成摘要，包含：

- **Request** - 你的请求内容
- **Investigated** - Claude 探索了什么
- **Learned** - 关键发现和洞察
- **Completed** - 完成了什么
- **Next Steps** - 下一步做什么

### 上下文注入

当你启动新的 Claude Code 会话时，SessionStart 钩子会：

1. 查询数据库获取项目中最近的观测数据（默认：50条）
2. 检索最近的会话摘要作为上下文
3. 按时间线显示观测数据，并标记会话分隔
4. **仅当摘要生成时间晚于最后一条观测数据时**，才显示完整摘要详情（Investigated、Learned、Completed、Next Steps）
5. 将格式化后的上下文注入到 Claude 的初始上下文中

**摘要显示逻辑：**最新摘要的完整详情仅在该摘要生成时间晚于最新观测数据时，才会显示在上下文展示的最后。这确保你在摘要代表项目最新状态时看到详情，但如果自上次摘要以来有新的观测数据被捕获，则不会显示。

例如：

- ✅ **显示摘要**：最后观测数据在下午 2:00，摘要生成于下午 2:05 → 显示摘要详情
- ❌ **隐藏摘要**：摘要生成于下午 2:00，新观测数据在下午 2:05 → 隐藏摘要详情（已过时）

这防止在已捕获新工作但尚未生成新摘要时显示过时的摘要。

这意味着 Claude 能"记住"之前会话中发生的事情！

## 手动命令（可选）

### 工作服务管理

v4.0+ 版本在首次会话时自动启动工作服务。以下手动命令为可选操作。

```bash
# 启动工作服务（可选 - 自动启动）
npm run worker:start

# 停止工作服务
npm run worker:stop

# 重启工作服务
npm run worker:restart

# 查看工作服务日志
npm run worker:logs

# 检查工作服务状态
npm run worker:status
```

### 测试

```bash
# 运行所有测试
npm test

# 测试上下文注入
npm run test:context

# 详细上下文测试
npm run test:context:verbose
```

### 开发

```bash
# 构建钩子和工作服务
npm run build

# 仅构建钩子
npm run build:hooks

# 发布到 NPM（仅维护者）
npm run publish:npm
```

## 查看存储的上下文

上下文存储在 SQLite 数据库中，路径为 `~/.claude-mem/claude-mem.db`。

直接查询数据库：

```bash
# 打开数据库
sqlite3 ~/.claude-mem/claude-mem.db

# 查看最近的会话
SELECT session_id, project, created_at, status
FROM sdk_sessions
ORDER BY created_at DESC
LIMIT 10;

# 查看会话摘要
SELECT session_id, request, completed, learned
FROM session_summaries
ORDER BY created_at DESC
LIMIT 5;

# 查看某会话的观测数据
SELECT tool_name, created_at
FROM observations
WHERE session_id = 'YOUR_SESSION_ID';
```

## 理解渐进式披露

上下文注入使用渐进式披露机制以实现高效的 Token 使用：

### 第一层：索引展示（会话开始）

- 显示观测数据标题及 Token 消耗估算
- 按时间线显示会话标记
- 按文件分组观测数据以提高视觉清晰度
- **仅当摘要生成时间晚于最后一条观测数据时**，才显示完整摘要详情
- Token 消耗：索引视图约 50-200 个 Token

### 第二层：按需详情（MCP 工具）

- 自然提问："我们修复了哪些 bug？"或"我们是如何实现 X 的？"
- Claude 自动调用 MCP 搜索工具获取完整详情
- 按概念、文件、类型或关键词搜索
- 获取特定观测数据周围的时间线上下文
- Token 消耗：每次获取观测数据约 100-500 个 Token
- 使用 3 层工作流程：搜索 → 时间线 → 获取观测数据

### 第三层：完美回忆（代码访问）

- 需要时直接读取源文件
- 访问原始记录和原始数据
- 按需获取完整上下文

这确保了高效的 Token 使用，同时在需要时能够访问完整历史记录。

## 多提示会话与 `/clear` 行为

Claude-Mem 支持跨越多个用户提示的会话：

- **prompt_counter**：跟踪会话中的总提示数
- **prompt_number**：标识会话中的特定提示
- **会话连续性**：观测数据和摘要在多个提示间关联

### 关于 `/clear` 的重要说明

当你使用 `/clear` 时，会话并不会结束 - 它会以新的提示编号继续。这意味着：

- ✅ **上下文被重新注入**来自最近会话（SessionStart 钩子以 `source: "clear"` 触发）
- ✅ **观测数据仍被捕获**并添加到当前会话
- ✅ **摘要将被生成**当 Claude 完成响应时（Stop 钩子触发）

`/clear` 命令会清除 Claude 可见的对话上下文，并重新注入来自最近会话的新鲜上下文，而底层会话继续跟踪观测数据。

## 搜索你的历史记录

Claude-Mem 提供 MCP 工具用于查询项目历史。只需自然提问：

```
"上次会话我们修复了哪些 bug？"
"我们是如何实现身份验证的？"
"worker-service.ts 做了哪些更改？"
"显示我最近在项目上的工作"
```

Claude 会自动识别你的意图并调用 MCP 搜索工具，使用 3 层工作流程（搜索 → 时间线 → 获取观测数据）以实现高效的 Token 使用。

## 下一步

- **基于技能的搜索** - 学习如何搜索项目历史
- **架构概览** - 了解其工作原理
- **故障排除** - 常见问题及解决方案

# 参考资料

* any list
{:toc}
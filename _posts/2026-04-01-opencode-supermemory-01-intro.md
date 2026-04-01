---
layout: post 
title: opencode-supermemory 用于持久化记忆的 OpenCode 插件基于 Supermemory
date: 2026-04-01 21:01:55 +0800
categories: [AI]
tags: [ai, memory]
published: true
---

# 接入 claude code

```
npx -y install-mcp https://mcp.supermemory.ai/mcp --client claude
```

# opencode-supermemory

用于持久化记忆的 OpenCode 插件，基于 [Supermemory](https://supermemory.ai)。

你的 agent 会记住你告诉它的内容——跨会话、跨项目。

---

## 安装

### 面向普通用户（For Humans）

```bash
bunx opencode-supermemory@latest install
```

然后从 [app.supermemory.ai](https://app.supermemory.ai/?view=integrations) 获取你的 API key，并设置：

```bash
export SUPERMEMORY_API_KEY="sm_..."
```

**或者让你的 agent 来完成** —— 将以下内容粘贴到 OpenCode 中：

```
Install opencode-supermemory by following https://raw.githubusercontent.com/supermemoryai/opencode-supermemory/main/README.md
```

---

### 面向 LLM Agents

<details>
<summary>LLM Agent 指南（点击展开）</summary>

如果你是一个帮助用户配置 opencode-supermemory 的 LLM agent，请按照以下步骤操作：

#### 第 1 步：运行安装器

```bash
bunx opencode-supermemory@latest install --no-tui
```

该命令会：

* 在 `~/.config/opencode/opencode.jsonc` 中注册插件
* 创建 `/supermemory-init` 命令

---

#### 第 2 步：验证配置

```bash
cat ~/.config/opencode/opencode.jsonc
```

应该包含：

```json
{
  "plugin": ["opencode-supermemory"]
}
```

如果没有，请手动添加：

**JSONC：**

```jsonc
{
  "plugin": [
    "opencode-supermemory",
    // ... 其他插件
  ],
}
```

**JSON：**

```json
{
  "plugin": ["opencode-supermemory"]
}
```

---

#### 第 3 步：配置 API key

让用户从 [app.supermemory.ai](https://app.supermemory.ai/?view=integrations) 获取 API key。

然后通过环境变量设置：

```bash
export SUPERMEMORY_API_KEY="sm_..."
```

或者创建 `~/.config/opencode/supermemory.jsonc`：

```jsonc
{
  "apiKey": "sm_...",
}
```

---

#### 第 4 步：验证安装

让用户重启 OpenCode 并运行：

```bash
opencode -c
```

他们应该能在工具列表中看到 `supermemory`。如果没有，请检查：

1. 是否设置了 `SUPERMEMORY_API_KEY`？
2. 插件是否存在于 `opencode.jsonc` 中？
3. 查看日志：`tail ~/.opencode-supermemory.log`

---

#### 第 5 步：初始化代码库记忆（可选）

运行 `/supermemory-init`，让 agent 自动探索并记忆代码库。

</details>

---

## 功能

### 上下文注入（Context Injection）

在首次消息时，agent 会收到（对用户不可见）：

* 用户画像（跨项目偏好）
* 项目记忆（所有项目知识）
* 相关用户记忆（语义搜索）

示例（agent 实际看到的内容）：

```
[SUPERMEMORY]

User Profile:
- 偏好简洁回答
- TypeScript 专家

Project Knowledge:
- [100%] 使用 Bun，而不是 Node.js
- [100%] 构建命令：bun run build

Relevant Memories:
- [82%] 如果缺少 .env.local，构建会失败
```

agent 会自动使用这些上下文——无需手动提示。

---

### 关键词检测（Keyword Detection）

当你说 “remember”、“save this”、“don’t forget” 等关键词时，agent 会自动保存记忆。

```
你："记住这个项目使用 bun"
Agent: [保存到项目记忆]
```

可以通过 `keywordPatterns` 配置自定义触发词。

---

### 代码库索引（Codebase Indexing）

运行 `/supermemory-init`，agent 会探索并记忆你的代码结构、模式和约定。

---

### 预防性压缩（Preemptive Compaction）

当上下文使用达到 80% 时：

1. 触发 OpenCode 的摘要机制
2. 将项目记忆注入摘要上下文
3. 将会话摘要保存为记忆

这样可以在压缩过程中保留对话上下文。

---

### 隐私（Privacy）

```
API key is <private>sk-abc123</private>
```

被 `<private>` 标签包裹的内容永远不会被存储。

---

## 工具使用（Tool Usage）

`supermemory` 工具可供 agent 使用：

| 模式        | 参数                           | 描述     |
| --------- | ---------------------------- | ------ |
| `add`     | `content`, `type?`, `scope?` | 存储记忆   |
| `search`  | `query`, `scope?`            | 搜索记忆   |
| `profile` | `query?`                     | 查看用户画像 |
| `list`    | `scope?`, `limit?`           | 列出记忆   |
| `forget`  | `memoryId`, `scope?`         | 删除记忆   |

**作用域（Scopes）：**

* `user`（跨项目）
* `project`（默认）

**类型（Types）：**

* `project-config`
* `architecture`
* `error-solution`
* `preference`
* `learned-pattern`
* `conversation`

---

## 记忆作用域（Memory Scoping）

| 作用域 | 标识                                     | 持久性  |
| --- | -------------------------------------- | ---- |
| 用户  | `opencode_user_{sha256(git email)}`    | 所有项目 |
| 项目  | `opencode_project_{sha256(directory)}` | 当前项目 |

---

## 配置（Configuration）

创建 `~/.config/opencode/supermemory.jsonc`：

```jsonc
{
  // API key（也可以使用 SUPERMEMORY_API_KEY 环境变量）
  "apiKey": "sm_...",

  // 记忆检索的最小相似度（0-1）
  "similarityThreshold": 0.6,

  // 每次请求注入的最大记忆数量
  "maxMemories": 5,

  // 最大项目记忆数量
  "maxProjectMemories": 10,

  // 最大用户画像条目数
  "maxProfileItems": 5,

  // 是否在上下文中注入用户画像
  "injectProfile": true,

  // 容器标签前缀（当 userContainerTag/projectContainerTag 未设置时使用）
  "containerTagPrefix": "opencode",

  // 可选：自定义用户容器标签（覆盖自动生成）
  "userContainerTag": "my-custom-user-tag",

  // 可选：自定义项目容器标签（覆盖自动生成）
  "projectContainerTag": "my-project-tag",

  // 额外关键词匹配（正则）
  "keywordPatterns": ["log\\s+this", "write\\s+down"],

  // 触发上下文压缩的阈值（0-1）
  "compactionThreshold": 0.8,
}
```

所有字段均为可选。

环境变量 `SUPERMEMORY_API_KEY` 优先级高于配置文件。

---

### 容器标签选择（Container Tag Selection）

默认情况下，容器标签会基于 `containerTagPrefix` + hash 自动生成：

* 用户标签：`{prefix}_user_{hash(git_email)}`
* 项目标签：`{prefix}_project_{hash(directory)}`

你可以通过指定固定标签来覆盖：

```jsonc
{
  "userContainerTag": "my-team-workspace",
  "projectContainerTag": "my-awesome-project",
}
```

适用于以下场景：

* 团队共享记忆（相同 `userContainerTag`）
* 多设备同步项目记忆
* 使用自定义命名规则组织记忆
* 与其他工具中的 Supermemory 容器标签集成

---

## 与 Oh My OpenCode 一起使用

如果你在使用 [Oh My OpenCode](https://github.com/code-yeongyu/oh-my-opencode)，请禁用其内置的自动压缩 hook，让 supermemory 接管上下文压缩：

在 `~/.config/opencode/oh-my-opencode.json` 中添加：

```json
{
  "disabled_hooks": ["anthropic-context-window-limit-recovery"]
}
```

---

## 开发（Development）

```bash
bun install
bun run build
bun run typecheck
```

本地安装：

```jsonc
{
  "plugin": ["file:///path/to/opencode-supermemory"],
}
```

---

## 日志（Logs）

```bash
tail -f ~/.opencode-supermemory.log
```

---

## 许可证（License）

MIT


# 参考资料

* any list
{:toc}
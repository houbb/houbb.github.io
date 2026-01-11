---
layout: post
title: GLM 4.7 如何在 claude-code 结合使用？
date: 2026-01-05 21:01:55 +0800
categories: [AI]
tags: [ai, ai-coding, sh]
published: true
---

# 前提条件：

您需要安装 Node.js 18 或更新版本环境

Windows 用户还需安装 Git for Windows

# 安装 claude code

```SH
npm install -g @anthropic-ai/claude-code
```

版本验证

```
>claude --version
2.1.4 (Claude Code)
```

# 配置 GLM Coding Plan

1) 注册账号

访问 智谱开放平台，点击右上角的「注册/登录」按钮，按照提示完成账号注册流程。

2) 获取API Key

登录后，在个人中心页面，点击 API Keys，创建一个新的 API Key。

# 配置环境变量

Coding Tool Helper 是一个编码工具助手，快速将您的GLM编码套餐加载到您喜爱的编码工具中。

安装并运行它，按照界面提示操作即可自动完成工具安装，套餐配置，MCP服务器管理等。

```sh
# 进入命令行界面，执行如下运行 Coding Tool Helper
npx @z_ai/coding-helper
```

根据提示操作即可。

配置成功后，请确保重新打开一个新的终端窗口，以便环境配置生效。

## 手动配置

支持 MacOS & Linux & Windows, 注意不同系统配置文件路径不一样。注意需保证修改的 JSON 文件格式正确性(比如多或少,)。

```
# 编辑或新增 `settings.json` 文件
# MacOS & Linux 为 `~/.claude/settings.json`
# Windows 为`用户目录/.claude/settings.json`
# 新增或修改里面的 env 字段
# 注意替换里面的 `your_zhipu_api_key` 为您上一步获取到的 API Key
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_zhipu_api_key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1
  }
}
# 再编辑或新增 `.claude.json` 文件
# MacOS & Linux 为 `~/.claude.json`
# Windows 为`用户目录/.claude.json`
# 新增 `hasCompletedOnboarding` 参数
{
  "hasCompletedOnboarding": true
}
```

比如 windows 就是 `C:\Users\Administrator\.claude\settings.json`

## 指定模型

我们可以手动指定一下模型

直接在 env 下面编辑这个部分

```json
{
  "env": {
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
  }
}
```

注意：

1）一般不建议您手动调整模型映射，因为硬编码模型映射后，当 GLM Coding Plan 的模型更新升级时，不方便您自动更新到最新模型。

2）若您想使用最新默认映射（针对老用户已配置旧模型映射的情况），删除 settings.json 中的模型映射配置即可，Claude Code 会自动使用最新的默认模型。

# 实际编码


直接在需要的项目下面。

然后进行登录

```
claude
```

效果如下：

```
D:\aicode\openim-plateform>claude

╭─── Claude Code v2.1.4 ─────────────────────────────────────────────────────────────────────────────────╮
│                                    │ Tips for getting started                                          │
│            Welcome back!           │ Run /init to create a CLAUDE.md file with instructions for Claude │
│                                    │ ───────────────────────────────────────────────────────────────── │
│               ▐▛███▜▌              │ Recent activity                                                   │
│              ▝▜█████▛▘             │ No recent activity                                                │
│                ▘▘ ▝▝               │                                                                   │
│                                    │                                                                   │
│   Sonnet 4.5 · API Usage Billing   │                                                                   │
│     D:\aicode\openim-plateform     │                                                                   │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

# 参考资料

https://docs.bigmodel.cn/cn/guide/develop/claude#claude-code

* any list
{:toc}
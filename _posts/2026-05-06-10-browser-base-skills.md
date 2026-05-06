---
layout: post 
title: Browserbase Skills 一组技能，用于让 Claude Code 通过浏览器自动化和官方 `bb` CLI 与 Browserbase 协同工作。 
date: 2026-05-06 21:01:55 +0800
categories: [AI]
tags: [ai, context]
published: true
---




# Browserbase Skills

一组技能，用于让 Claude Code 通过浏览器自动化和官方 `bb` CLI 与 Browserbase 协同工作。

## 技能列表

此插件包含以下技能（详情见 `skills/` 目录）：

| 技能 | 描述 |
|---|---|
| `browser` | 通过 CLI 命令自动化网页浏览器交互 —— 支持远程 Browserbase 会话，具备反机器人隐身、验证码求解和住宅代理功能 |
| `browserbase-cli` | 使用官方 `bb` CLI 操作 Browserbase Functions 和平台 API 工作流，包括会话、项目、上下文、扩展、fetch 和仪表盘 |
| `functions` | 使用 `bb` CLI 将无服务器浏览器自动化部署到 Browserbase 云端 |
| `site-debugger` | 诊断并修复失败的浏览器自动化 —— 分析机器人检测、选择器、时机、认证和验证码问题，然后生成经过测试的站点操作手册 |
| `browser-trace` | 在任何浏览器自动化旁边捕获完整的 DevTools 协议跟踪（CDP 全量数据、截图、DOM 转储），然后将数据流按页面切分为可搜索的数据块 |
| `safe-browser` | 构建本地的 Claude Agent SDK 浏览器代理，其唯一的浏览器能力是受 CDP 门控的 `safe_browser` 工具，并强制执行域名白名单 |
| `bb-usage` | 在终端仪表盘中显示 Browserbase 使用统计、会话分析和成本预测 |
| `cookie-sync` | 将 Cookie 从本地 Chrome 同步到 Browserbase 持久化上下文，使 `browse` CLI 能够访问需要登录的站点 |
| `fetch` | 无需浏览器会话即可从静态页面获取 HTML 或 JSON —— 检查状态码、标头、跟随重定向 |
| `search` | 无需浏览器会话即可搜索网络并返回结构化结果（标题、URL、元数据） |
| `ui-test` | 由 AI 驱动的对抗性 UI 测试 —— 分析 git 差异以测试变更，或探索整个应用以查找错误 |

## 安装

要将技能安装到流行的编码代理中，请运行：
```bash
$ npx skills add browserbase/skills
```

### Claude Code

在 Claude Code 中，要添加市场，只需运行：
```bash
/plugin marketplace add browserbase/skills
```
然后安装插件：
```bash
/plugin install browse@browserbase
```

如果你更喜欢手动操作界面：
1. 在 Claude Code 中输入 `/plugin`
2. 选择选项 `3. Add marketplace`
3. 输入市场源：`browserbase/skills`
4. 按回车键选择 `browse` 插件
5. 再次按回车键 `Install now`
6. 重启 Claude Code 以使更改生效

## 使用方法

安装完成后，你可以让 Claude 进行浏览或使用 Browserbase CLI：

- “去 Hacker News，获取置顶帖的评论，并总结它们”
- “对 http://localhost:3000 进行 QA 测试，并修复你遇到的任何错误”
- “给我点个披萨，你已经登录了 Doordash”
- “使用 `bb` 列出我的 Browserbase 项目，并将输出显示为 JSON”
- “使用 `bb functions init` 初始化一个新的 Browserbase Function，并解释接下来的命令”
- “使用 `safe-browser` 构建一个仅停留在主网站的 Hacker News 爬虫”

Claude 会处理剩下的事情。

对于本地和 localhost 的工作，`browse env local` 现在默认启动一个干净、隔离的浏览器。当代理应重用你现有的本地 Chrome 会话、Cookie 或登录状态时，请使用 `browse env local --auto-connect`。

## 故障排除

### 未找到 Chrome

请为你的平台安装 Chrome：
- **macOS 或 Windows**：https://www.google.com/chrome/
- **Linux**：`sudo apt install google-chrome-stable`

### 刷新配置文件

要刷新来自主 Chrome 配置文件的 Cookie：
```bash
rm -rf .chrome-profile
```

## 资源

- [Browserbase 文档](https://docs.browserbase.com)
- [Skills 文档](https://docs.browserbase.com/agents/skills)
- [bb CLI 参考](https://docs.browserbase.com/cli)

# 参考资料

* any list
{:toc}
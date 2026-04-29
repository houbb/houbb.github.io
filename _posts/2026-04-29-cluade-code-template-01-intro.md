---
layout: post 
title: Claude Code 模板库 
date: 2026-04-29 21:01:55 +0800
categories: [AI]
tags: [ai, claude]
published: true
---

# Claude Code 模板库 ([aitmpl.com](https://aitmpl.com))

**面向 Anthropic 的 Claude Code 的即用型配置。** 包含大量 AI 智能体、自定义命令、设置、钩子、外部集成（MCP）和项目模板的综合性集合，旨在提升您的开发工作流。

## 浏览和安装组件及模板

**[浏览所有模板](https://aitmpl.com)** —— 通过交互式网页界面探索并安装超过 100 个智能体、命令、设置、钩子和 MCP。

<img width="1049" height="855" alt="2025-08-19 08:09:24 截图" src="https://github.com/user-attachments/assets/e3617410-9b1c-4731-87b7-a3858800b737" />

## 🚀 快速安装

```bash
# 安装完整开发技术栈
npx claude-code-templates@latest --agent development-team/frontend-developer --command testing/generate-tests --mcp development/github-integration --yes

# 交互式浏览并安装
npx claude-code-templates@latest

# 安装特定组件
npx claude-code-templates@latest --agent development-tools/code-reviewer --yes
npx claude-code-templates@latest --command performance/optimize-bundle --yes
npx claude-code-templates@latest --setting performance/mcp-timeouts --yes
npx claude-code-templates@latest --hook git/pre-commit-validation --yes
npx claude-code-templates@latest --mcp database/postgresql-integration --yes
```

## 您将获得什么

| 组件 | 描述 | 示例 |
|------|------|------|
| **🤖 智能体** | 特定领域的 AI 专家 | 安全审计员、React 性能优化器、数据库架构师 |
| **⚡ 命令** | 自定义斜杠命令 | `/generate-tests`、`/optimize-bundle`、`/check-security` |
| **🔌 MCP** | 外部服务集成 | GitHub、PostgreSQL、Stripe、AWS、OpenAI |
| **⚙️ 设置** | Claude Code 配置 | 超时时间、内存设置、输出样式 |
| **🪝 钩子** | 自动化触发器 | 预提交验证、完成任务后动作 |
| **🎨 技能** | 支持渐进式披露的可复用能力 | PDF 处理、Excel 自动化、自定义工作流 |

## 🛠️ 附加工具

除了模板目录，Claude Code 模板库还包含强大的开发工具：

### 📊 Claude Code 分析
实时监控您的 AI 驱动开发会话，支持实时状态检测和性能指标。

```bash
npx claude-code-templates@latest --analytics
```

### 💬 对话监视器
移动端优化界面，可实时查看 Claude 响应，支持安全的远程访问。

```bash
# 本地访问
npx claude-code-templates@latest --chats

# 通过 Cloudflare Tunnel 安全远程访问
npx claude-code-templates@latest --chats --tunnel
```

### 🔍 健康检查
全面的诊断，确保您的 Claude Code 安装已优化。

```bash
npx claude-code-templates@latest --health-check
```

### 🔌 插件仪表板
在统一界面中查看市场、已安装插件并管理权限。

```bash
npx claude-code-templates@latest --plugins
```

## 📖 文档

**[📚 docs.aitmpl.com](https://docs.aitmpl.com/)** —— 所有组件和工具的完整指南、示例和 API 参考。

## 贡献

我们欢迎贡献！**[浏览现有模板](https://aitmpl.com)** 查看可用内容，然后查看我们的[贡献指南](CONTRIBUTING.md)，添加您自己的智能体、命令、MCP、设置或钩子。

**在贡献之前请阅读我们的[行为准则](CODE_OF_CONDUCT.md)。**

## 鸣谢

本集合包含来自多个来源的组件：

**科学技能：**
- **[K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills)** 由 K-Dense Inc. 提供 —— MIT 许可证（139 个科学技能，用于生物学、化学、医学和计算研究）

**官方 Anthropic：**
- **[anthropics/skills](https://github.com/anthropics/skills)** —— 官方 Anthropic 技能（21 个技能）
- **[anthropics/claude-code](https://github.com/anthropics/claude-code)** —— 开发指南和示例（10 个技能）

**社区技能和智能体：**
- **[obra/superpowers](https://github.com/obra/superpowers)** 由 Jesse Obra 提供 —— MIT 许可证（14 个工作流技能）
- **[alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills)** 由 Alireza Rezvani 提供 —— MIT 许可证（36 个专业角色技能）
- **[wshobson/agents](https://github.com/wshobson/agents)** 由 wshobson 提供 —— MIT 许可证（48 个智能体）
- **NerdyChefsAI 技能** —— 社区贡献 —— MIT 许可证（专业企业技能）

**命令和工具：**
- **[awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)** 由 hesreallyhim 提供 —— CC0 1.0 通用（21 个命令）
- **[awesome-claude-skills](https://github.com/mehdi-lamrani/awesome-claude-skills)** —— Apache 2.0（社区技能）
- **move-code-quality-skill** —— MIT 许可证
- **cocoindex-claude** —— Apache 2.0

每个资源都保留其**原始许可证和归属声明**，由各自作者定义。
我们尊重并感谢所有原创作者为 Claude 生态系统所做的工作和贡献。

## 📄 许可证

本项目采用 MIT 许可证 —— 详见 [LICENSE](LICENSE) 文件。

## 🔗 链接

- **🌐 浏览模板**：[aitmpl.com](https://aitmpl.com)
- **📚 文档**：[docs.aitmpl.com](https://docs.aitmpl.com)
- **💬 社区**：[GitHub Discussions](https://github.com/davila7/claude-code-templates/discussions)
- **🐛 问题反馈**：[GitHub Issues](https://github.com/davila7/claude-code-templates/issues)

## 随时间变化的星标数
[![Stargazers over time](https://starchart.cc/davila7/claude-code-templates.svg?variant=adaptive)](https://starchart.cc/davila7/claude-code-templates)

# 参考资料

* any list
{:toc}
---
layout: post
title: Claude Code 插件目录
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, speech, sh]
published: true
---

# Claude Code 插件目录

一个**经过精选的高质量 Claude Code 插件目录**。 ([GitHub][1])

> ⚠️ **重要提示：**
> 在安装、更新或使用插件之前，请确保你信任该插件。
> Anthropic **并不控制插件中包含的 MCP 服务器、文件或其他软件**，也无法验证它们是否会按预期运行或是否会发生变化。
> 有关更多信息，请查看每个插件的主页。 ([GitHub][1])

---

# 目录结构

该仓库包含两个主要目录：

* `/plugins`
  Anthropic **内部开发并维护的插件**

* `/external_plugins`
  来自 **合作伙伴和社区的第三方插件** ([GitHub][1])

---

# 安装

插件可以通过 **Claude Code 的插件系统** 直接从该市场安装。

安装命令：

```bash
/plugin install {plugin-name}@claude-plugin-directory
```

或者在插件浏览界面中查找：

```
/plugin > Discover
```

---

# 贡献

## 内部插件（Internal Plugins）

内部插件由 **Anthropic 团队成员开发**。

可以参考示例实现：

```
/plugins/example-plugin
```

---

## 外部插件（External Plugins）

第三方合作伙伴可以提交插件并申请加入该插件市场。

外部插件需要满足一定的：

* **质量标准**
* **安全标准**

才会被批准加入。 ([GitHub][1])

---

# 插件结构

每个插件遵循统一的目录结构：

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # 插件元数据（必需）
├── .mcp.json            # MCP 服务器配置（可选）
├── commands/            # Slash 命令（可选）
├── agents/              # Agent 定义（可选）
├── skills/              # Skill 定义（可选）
└── README.md            # 文档
```

说明：

* **plugin.json**
  插件的核心元数据配置

* **.mcp.json**
  MCP（Model Context Protocol）服务器配置

* **commands/**
  定义 Claude 可调用的 **Slash 命令**

* **agents/**
  定义可复用的 **Agent**

* **skills/**
  定义 Claude 可调用的 **技能模块**

---

# 文档

关于如何开发 Claude Code 插件的更多信息，请参考 **官方文档**。

---

✅ **一句话总结这个仓库：**

`claude-plugins-official` 是 **Anthropic 官方维护的 Claude Code 插件市场目录**，用于：

* 发布官方插件
* 收录社区插件
* 提供统一插件结构
* 支持 MCP、Agent、Command、Skill 等能力的打包与安装。 ([SourcePulse][2])

# 参考资料

* any list
{:toc}
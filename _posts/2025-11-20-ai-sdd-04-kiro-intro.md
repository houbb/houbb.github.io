---
layout: post
title: AI SDD 开发规范-04-kiro 入门介绍
date: 2025-11-20 14:12:33 +0800
categories: [AI]
tags: [ai, sdd, sh]
published: true
---


# Kiro

Kiro 是一个“agent-driven”（具有代理/智能体能力）的 IDE，帮助你从原型（prototype）一路推进到生产（production）：通过规范驱动开发（spec-driven development）、agent 钩子（agent hooks）、自然语言编码辅助等机制，让 AI + 人类协作更高效。([GitHub][1])

> “Build faster with AI-powered features that understand your entire codebase, turn prompts into structured specs, and automate repetitive tasks.” ([GitHub][1])

---

## 核心能力 (Core Capabilities)

* **Specs（规范）** — 使用结构化的规范 (specs) 来规划并构建功能，把需求拆解成详细、可执行的实现计划。([GitHub][1])
* **Hooks（钩子）** — 借助智能触发器 (hooks)，对文件变更或开发事件做出响应，自动化处理重复任务。([GitHub][1])
* **Agentic Chat（智能体对话）** — 通过自然语言与 Kiro 对话，它能理解你的项目上下文 (codebase context)，帮助你构建功能。([GitHub][1])
* **Steering（行为引导 / 项目规则）** — 通过 Markdown 文件为项目设定自定义规则或上下文，让 Kiro 的行为更符合团队/项目规范。([GitHub][1])
* **MCP Servers（外部集成 / 扩展能力）** — 支持通过 “Model Context Protocol (MCP)” 将外部工具、数据源接入，比如数据库、API、文档服务器等等。([GitHub][1])
* **Privacy First（隐私优先）** — 强调企业级安全和隐私保护，保证你的代码安全。([GitHub][1])

---

## 平台支持 (Platform Support)

Kiro 提供独立桌面应用 (standalone desktop application)，适用于以下操作系统：

* macOS ([GitHub][1])
* Windows ([GitHub][1])
* Linux ([GitHub][1])

---

## 快速开始 (Getting Started)

### 下载与安装 (Download & Install)

从官网 (kiro.dev) 下载适合你操作系统的安装程序即可。([GitHub][1])

### 第一个项目 (First Project)

Kiro 提供了一个 “first project guide”（首个项目指南），帮助你快速上手。通过这个教程，你将学到：

* 如何设置 steering 文件 (项目级规则 / 引导)
* 如何创建和管理 specs，进行结构化开发
* 如何配置 hooks，让 workflow 自动化
* 如何连接 MCP servers，以整合外部服务 / 工具 ([GitHub][1])

### 一键迁移 (One-Click Migration)

如果你之前在使用 Visual Studio Code (VS Code)，Kiro 支持导入你的 VS Code 设置 (extensions 和 settings)，让你无缝迁移。([GitHub][1])

---

## 文档 (Documentation)

Kiro 官方提供了详细文档，涵盖以下内容：([GitHub][1])

* Getting Started — 安装与第一个项目
* Chat — 上下文对话 & 代码生成
* Specs — 结构化特性开发
* Hooks — 使用触发器自动化工作流程
* Steering — 项目 / 团队级别的 AI 引导规则
* MCP — 外部工具 & 服务集成
* Troubleshooting — 故障排查 & 隐私 / 安全说明

---

## 问题报告 & 支持 (Issue Reporting & Support)

如果你在使用中遇到 bug、想提功能建议、对现有功能有反馈、希望讨论改进，都可以通过这个 GitHub 仓库提交 issue。([GitHub][1])

此外，他们有社区 (Discord server) 支持，也对付费用户 (通过 AWS) 提供更多服务 (billing support / AWS 支持) 。([GitHub][1])

---

## 安全 & 行为准则 (Security & Code of Conduct)

* 如果你发现潜在安全问题，请通过官方 “vulnerability reporting” 渠道报告，而 **不要** 在公开 issue 里直接提交。([GitHub][1])
* Kiro 遵循 Amazon Open Source Code of Conduct (开源行为准则)。([GitHub][1])

---

## 总结 — 为什么选择 Kiro

* 如果你不只是要 “AI 补全代码”，而是希望用一种更系统化、规范化、结构化的方法来开发 — Kiro 的 Specs + Hooks + Steering + MCP 能给你一种接近“工程流水 / 规范驱动 + 自动化 + AI 协作”的体验。
* 支持多平台 / 多语言 / 与现有 VS Code 配置兼容。如果你之前已经有项目基础，迁移门槛较低。
* 提供从 “想法 → 规范 → 任务 → 实现 → 自动化 / 集成 → 上线 / 维护” 的完整链条。

# 参考资料

https://github.com/kirodotdev/Kiro

* any list
{:toc}
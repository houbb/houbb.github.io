---
layout: post
title: Impeccable 让 AI 编程助手具备设计能力的设计语言。
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, ui, ux, sh]
published: true
---

# Impeccable

**让 AI 编程助手具备设计能力的设计语言。**

Impeccable 是一套 **AI Coding Agent 的设计技能（Design Skills）集合**，
用于让 AI 在生成 UI / 前端代码时具备更专业的设计判断能力。 ([Impeccable][1])

它通过一组 **设计命令（design commands）** 和 **设计模式（patterns）**，
为 AI 提供：

* 排版（Typography）
* 颜色（Color）
* 布局（Layout）
* 动效（Motion）
* UX 写作（UX writing）

等设计领域的专业“词汇”和方法。 ([note（ノート）][2])

目标是解决一个常见问题：

> AI 生成的 UI 往往具有“AI 味道”（AI slop），例如模板化布局、随意渐变、泛化文案等。 ([note（ノート）][2])

Impeccable 通过系统化设计技能，让 AI 能生成 **更专业、更有设计感的界面**。

---

# 核心理念

优秀的设计 Prompt 需要 **设计语言（design vocabulary）**。

但大多数开发者不会使用设计术语，例如：

* vertical rhythm（垂直节奏）
* visual hierarchy（视觉层级）
* whitespace（留白）

因此难以正确引导 AI。

Impeccable 提供了一套 **标准命令体系**，让你可以直接用设计语言控制 AI。 ([Impeccable][1])

---

# 功能组成

Impeccable 包含：

* 一个增强版 **frontend-design skill**
* 一组 **17 个设计命令**

例如：

* `/polish`
* `/audit`
* `/distill`
* `/bolder`
* `/animate`
* `/adapt`
* `/normalize`

这些命令构成了完整的 **AI 设计语言体系**。 ([Impeccable][1])

---

# 示例技能

## animate

分析一个功能，并通过以下方式改进 UI：

* 添加动画
* 微交互
* 视觉反馈

从而提升：

* 可理解性
* 可用性
* 用户体验。 ([Learn Skills][3])

---

## adapt

让设计适配不同环境，例如：

* 不同屏幕尺寸
* 不同设备
* 不同平台

强调：

> 适配不仅是缩放，而是重新思考体验。 ([Learn Skills][4])

---

## normalize

将 UI 设计统一到 **设计系统标准**：

* 保证视觉一致性
* 遵循既有组件模式
* 优先考虑 UX 而不是装饰。 ([Learn Skills][5])

---

# 安装

## 推荐安装方式

```bash
npx skills add pbakaus/impeccable
```

该命令会自动：

* 检测你的 AI 编程环境
* 安装到正确目录。 ([Impeccable][1])

---

# 支持的 AI 开发工具

Impeccable 可以在多个 AI 编程环境中使用：

* Cursor
* Claude Code
* Gemini CLI
* Codex CLI
* VS Code Copilot

安装后即可在这些工具中调用设计技能。 ([Impeccable][1])

---

# 手动安装

下载项目 ZIP 并解压到项目根目录：

```
.cursor/
.claude/
.gemini/
.codex/
.agents/
```

这些目录分别对应不同 AI 工具的配置。 ([Impeccable][1])

---

# 使用方式

在 AI 编程助手中输入 `/` 即可看到可用命令，例如：

```
/audit
/polish
/distill
```

AI 会根据当前代码和上下文自动应用对应的设计技能。

---

# 版本信息

v1.0.0

主要内容：

* 增强版 frontend-design skill
* 17 个设计命令
* 支持多个 AI coding 工具。 ([Impeccable][1])

---

# 项目总结

**Impeccable 的本质：**

> 一套为 AI 编程助手提供设计能力的“设计技能系统”。

它解决的问题：

AI 写前端时经常出现：

* 模板化 UI
* 不合理布局
* 糟糕排版
* 没有设计系统

Impeccable 的方案：

给 AI **设计知识 + 设计词汇 + 设计命令**。

最终效果：

让 AI 生成的 UI 更接近 **专业设计师水平**。

# 参考资料

* any list
{:toc}
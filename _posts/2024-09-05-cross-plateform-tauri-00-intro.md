---
layout: post
title:  cross-plateform 跨平台应用-00-tauri 入门介绍
date: 2024-09-05 21:01:55 +0800
categories: [WEB]
tags: [web, cross-plateform, uni-app, sh]
published: true
---

# 简介

### 什么是 Tauri？

Tauri 是一个框架，用于构建适用于所有主要桌面和移动平台的体积小、运行快的二进制文件。

开发者可以集成任何编译成 HTML、JavaScript 和 CSS 的前端框架来构建用户体验，同时在需要时利用 Rust、Swift 和 Kotlin 等语言来实现后端逻辑。

通过以下命令使用 create-tauri-app 快速开始构建应用。

确保先按照先决条件指南安装 Tauri 所需的所有依赖项，然后查看前端配置指南以了解推荐的前端配置。

- Bash
- PowerShell
- npm
- Yarn
- pnpm
- deno
- bun
- Cargo
- `sh <(curl https://create.tauri.app/sh)`

在创建完第一个应用后，您可以在“功能与食谱列表”中探索 Tauri 的不同功能和实例。

### 为什么选择 Tauri？

Tauri 为开发者提供了三大主要优势：

- 构建应用的安全基础

- 通过使用系统的本地 webview，减小应用包体积

- 开发者可以灵活选择前端框架，并且支持多种语言绑定

可以通过 Tauri 1.0 博客文章了解更多 Tauri 的理念。

### 安全基础

Tauri 基于 Rust 构建，因此可以利用 Rust 提供的内存、安全、线程和类型安全特性。使用 Tauri 构建的应用可以自动获得这些优势，即便开发者并非 Rust 专家。

Tauri 还会对主要和次要版本进行安全审核。这不仅涵盖了 Tauri 组织中的代码，还包括 Tauri 所依赖的上游依赖项。当然，这并不能消除所有风险，但它为开发者提供了一个坚实的基础。

可以阅读 Tauri 的安全政策和 Tauri 2.0 审核报告以了解更多信息。

### 更小的应用体积

Tauri 应用利用了系统上已经存在的 webview。一个 Tauri 应用只包含该应用特有的代码和资源，而不需要每个应用都打包一个浏览器引擎。这意味着，一个最小的 Tauri 应用体积可以小于 600KB。

可以通过“应用体积”概念了解更多关于优化应用创建的信息。

### 灵活的架构

由于 Tauri 使用的是 web 技术，这意味着几乎任何前端框架都可以与 Tauri 兼容。前端配置指南中包含了常见的前端框架配置。

开发者可以通过 JavaScript 中的 invoke 函数使用 JavaScript 和 Rust 之间的绑定，Swift 和 Kotlin 也提供了 Tauri 插件的绑定。

TAO 负责 Tauri 窗口的创建，而 WRY 负责 webview 渲染。这些库由 Tauri 维护，若需要更深入的系统集成，也可以直接使用它们。

此外，Tauri 还维护了一些插件，扩展 Tauri 核心功能。您可以在插件部分找到这些插件，以及社区提供的插件。

# 参考资料

https://v2.tauri.app/start/

* any list
{:toc}
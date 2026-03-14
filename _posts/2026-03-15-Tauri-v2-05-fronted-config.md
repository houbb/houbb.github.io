---
layout: post
title: Tauri 2.0-05-前端配置（Frontend Configuration）
date: 2026-03-15 21:01:55 +0800
categories: [Tauri]
tags: [cross-platefrom, sh]
published: true
---

# 前端配置（Frontend Configuration）

**Tauri 是前端无关（frontend-agnostic）的**，
因此它可以开箱即用地支持 **大多数前端框架**。

不过，在某些情况下，某些框架需要 **额外的配置** 才能与 Tauri 正常集成。
下面列出了一些框架以及推荐配置。 ([Tauri][1])

如果某个框架没有出现在列表中：

* 可能 **无需额外配置即可使用**
* 或者 **尚未被记录在文档中**

如果你发现某个框架需要特殊配置，也欢迎向 Tauri 社区提交文档贡献。 ([Tauri][1])

---

# 配置检查清单（Configuration Checklist）

从概念上讲：

> **Tauri 的工作方式类似于一个静态 Web 服务器（Static Web Host）。**

因此你需要向 Tauri 提供一个目录，该目录包含：

* HTML
* CSS
* JavaScript
* （可选）WASM

这些资源会被 **Tauri WebView** 加载并显示。 ([Tauri][1])

在将前端与 Tauri 集成时，需要注意以下常见情况：

### 1 使用静态构建模式

推荐使用：

* **SSG（Static Site Generation，静态站点生成）**
* **SPA（Single Page Application，单页应用）**
* **MPA（Multi-Page Application，多页应用）**

注意：

> Tauri **不原生支持基于服务器的方案**，例如 **SSR（Server Side Rendering）**。 ([Tauri][1])

---

### 2 移动端开发需要开发服务器

如果你在开发 **移动应用（Android / iOS）**：

需要一个 **开发服务器（Dev Server）**，
该服务器必须能够在 **内部 IP** 上提供前端页面。

这样移动设备才能访问你的前端应用。 ([Tauri][1])

---

### 3 使用标准 Client-Server 架构

你的应用应采用 **客户端-服务器模式**：

```
Frontend App
      ↓
API Server
```

不要使用：

```
Frontend + SSR Server 混合架构
```

因为 Tauri **并不支持 SSR 模式**。 ([Tauri][1])

---

# JavaScript 前端

对于大多数项目，官方推荐使用 **Vite**。

Vite 适用于：

* React
* Vue
* Svelte
* Solid
* 原生 JavaScript
* TypeScript

这些框架通常构建为 **SPA 应用**。 ([Tauri][1])

---

## 常见 JavaScript 框架

Tauri 文档中提供配置示例的框架包括：

* Next.js
* Nuxt
* Qwik
* SvelteKit
* **Vite（推荐）** ([Tauri][1])

说明：

许多 **Meta Framework（元框架）** 默认是为 **SSR** 设计的，
因此在 Tauri 中需要额外配置。

---

# Rust 前端

除了 JavaScript 前端外，
Tauri 也支持 **Rust Web Framework**。

常见方案：

* **Leptos**
* **Trunk** ([Tauri][1])

这些框架可以生成：

```
WASM + HTML + CSS
```

从而在 WebView 中运行。

---

# 如果你的框架不在列表中

如果某个框架没有出现在文档中：

可能原因包括：

1. 它 **无需额外配置**
2. 它 **尚未被文档记录**

此时可以：

* 参考 **Configuration Checklist**
* 自行配置构建输出目录和开发服务器。 ([Tauri][1])

---

# 总结

Tauri 的前端集成原则非常简单：

```
任何能编译成
HTML + CSS + JavaScript
的框架
都可以作为 Tauri 前端
```

推荐架构：

```
Frontend (Vue / React / Svelte)
        ↓
Build (Vite)
        ↓
dist/
        ↓
Tauri WebView
```

---

💡结合你前面在做的 **IM 多端客户端**，这一页其实隐含一个非常关键的结论：

**Tauri 实际上就是一个 Web App Container。**

所以：

```
Vue Web
React Web
Svelte Web
```

都可以 **100% 复用 UI 代码**。

真正生产级项目通常会做成：

```
apps/
   web
   desktop (tauri)
   mobile (tauri)

packages/
   ui
   shared
   api
```

这样可以做到：

**Web + Desktop + Mobile 共用 90% 前端代码。**

# 参考资料

* any list
{:toc}
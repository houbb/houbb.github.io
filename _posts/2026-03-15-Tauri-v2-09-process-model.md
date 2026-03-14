---
layout: post
title: Tauri 2.0-09-进程模型（Process Model）
date: 2026-03-15 21:01:55 +0800
categories: [Tauri]
tags: [cross-platefrom, sh]
published: true
---

# 进程模型（Process Model）

**Tauri 采用类似于 Electron 或许多现代 Web 浏览器的多进程架构**。
本指南解释了这种设计选择的原因，以及为什么它对于编写安全的应用程序至关重要。 ([Tauri][1])

---

## 为什么使用多个进程？（Why Multiple Processes）

在图形用户界面（GUI）应用程序的早期阶段，通常使用一个单一进程来：

* 执行计算
* 绘制界面
* 响应用户输入

正如你可能猜到的，这种设计存在问题：如果出现长期运行的、耗时的计算，会导致整个界面 **无响应（UI 阻塞）**；更糟的是，当一个组件失败时，**整个应用可能崩溃**。 ([Tauri][1])

为了提高稳定性和安全性，应用程序采用了 **多进程架构**：

* 不同组件运行在不同进程中
* 可以更好利用现代多核 CPU
* 一个进程出错不会影响其他进程

此外，可以根据 **最小权限原则（Principle of Least Privilege）**，只分配必要权限给每个进程，从而限制潜在安全风险的影响范围。 ([Tauri][1])

> 类比真实世界：如果请园丁修剪篱笆，只给他花园门钥匙，而不会给房子钥匙；程序权限同理。 ([Tauri][1])

---

## 核心进程（The Core Process）

每个 Tauri 应用都有一个 **核心进程（Core Process）**：

* 它是应用程序的 **入口点**
* 是唯一具有 **完整操作系统访问权限** 的组件 ([Tauri][1])

核心进程的主要职责包括：

* 创建和管理应用窗口
* 创建系统托盘菜单
* 发送和协调通知
* 管理所有 **进程间通信（IPC）**

所有的 IPC 都由核心进程统一路由，这样可以：

* 在中心统一位置 **拦截 / 过滤 / 修改消息**
* 管理应用的全局状态，例如设置、数据库连接等
* 保护敏感数据不被前端窃取 ([Tauri][1])

Tauri 使用 **Rust 实现核心进程**，因为它通过所有权机制保证了：

* 高性能
* 内存安全 ([Tauri][1])

🚀 通常一个 Tauri 应用只有一个核心进程，它会启动一个或多个 WebView 进程（见下文）。 ([Tauri][1])

---

## WebView 进程（The WebView Process）

核心进程本身 **不直接渲染 UI**。
它负责启动一个或多个 **WebView 进程**，每个 WebView 进程负责：

* 使用操作系统提供的 **WebView 库**
* 执行你的前端代码：HTML / CSS / JavaScript

WebView 本质上是一个 **浏览器环境**，因此你在传统 Web 开发中使用的大多数技术都能在 Tauri 中复用。
例如常见前端框架就可以在 WebView 中运行：Svelte、Vue、React + Vite 等。 ([Tauri][1])

从安全性角度来说：

* 必须对所有用户输入进行 **清理（sanitize）**
* 不要在前端处理敏感信息
* 尽可能把业务逻辑放到核心进程执行，以减小攻击面 ([Tauri][1])

与一些其他技术不同的是：

> **WebView 库不是捆绑进最终二进制中**，而是在运行时 **动态链接**。
> 这让应用体积大幅缩小，但也要注意平台间的差异（类似传统浏览器兼容性问题）。 ([Tauri][1])

当前平台选择如下：

* **Windows**：Microsoft Edge WebView2
* **macOS**：WKWebView
* **Linux**：webkitgtk ([Tauri][1])

---

## 核心总结

Tauri 的进程模型可以简要描述为：

```
单 一 核 心 进 程
        ↓
多 个 WebView 进 程
```

其中：

* **核心进程** 管理生命周期、IPC、窗口、菜单、全局状态
* **WebView 进程** 负责 UI 渲染和前端逻辑

这种架构融合了：

* Web 技术的灵活性（HTML / CSS / JS）
* 原生系统访问和能力（Rust + OS WebView） ([Tauri][1])

---

如需进一步深入 IPC、权限设计、生命周期管理等概念，我也可以帮你整理成总结或工程实践指南。

[1]: https://v2.tauri.app/zh-cn/concept/process-model/?utm_source=chatgpt.com "进程模型 | Tauri"

# 参考资料

* any list
{:toc}
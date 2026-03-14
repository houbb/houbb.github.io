---
layout: post
title: Tauri 2.0-06-Leptos 是一个基于Rust 的 Web 框架
date: 2026-03-15 21:01:55 +0800
categories: [Tauri]
tags: [cross-platefrom, sh]
published: true
---

# Leptos

**Leptos** 是一个基于 **Rust 的 Web 框架**。
你可以在 Leptos 官方网站上了解更多信息。

本指南内容适用于 **Leptos 0.6 版本**。 ([Tauri][1])

---

# 检查清单（Checklist）

在将 **Leptos 前端** 与 **Tauri** 集成时，需要注意以下事项：

* 使用 **SSG（Static Site Generation，静态站点生成）**
  因为 Tauri **不正式支持基于服务器的解决方案**。

* 使用：

```toml
serve.ws_protocol = "ws"
```

这样可以确保 **热重载（Hot Reload）WebSocket** 在 **移动开发** 时能够正确连接。

* 启用：

```json
withGlobalTauri
```

这样可以确保：

* Tauri API 会暴露在

```javascript
window.__TAURI__
```

变量中。

然后可以通过 **`wasm-bindgen`** 导入这些 API。 ([Tauri][1])

---

# 示例配置（Example Configuration）

## 1 更新 Tauri 配置

修改文件：

```
src-tauri/tauri.conf.json
```

配置示例：

```json
{
  "build": {
    "beforeDevCommand": "trunk serve",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "trunk build",
    "frontendDist": "../dist"
  },
  "app": {
    "withGlobalTauri": true
  }
}
```

说明：

* `beforeDevCommand`
  在开发模式下启动 **Trunk 开发服务器**

* `devUrl`
  指定前端开发服务器地址

* `beforeBuildCommand`
  在构建应用之前执行 **trunk build**

* `frontendDist`
  指定前端构建后的目录

* `withGlobalTauri`
  让 Tauri API 挂载到 `window.__TAURI__`。 ([Tauri][1])

---

## 2 更新 Trunk 配置

修改文件：

```
Trunk.toml
```

配置示例：

```toml
[build]
target = "./index.html"

[watch]
ignore = ["./src-tauri"]

[serve]
port = 1420
open = false
ws_protocol = "ws"
```

配置说明：

* `target`
  指定入口 HTML 文件

* `watch.ignore`
  忽略 `src-tauri` 目录变化

* `serve.port`
  开发服务器端口

* `serve.open`
  是否自动打开浏览器

* `serve.ws_protocol = "ws"`
  用于 **Hot Reload WebSocket 连接**。 ([Tauri][1])

---

# 总结

使用 **Leptos + Tauri** 的基本架构如下：

```
Leptos (Rust → WASM)
        ↓
HTML + WASM + JS
        ↓
Tauri WebView
        ↓
Rust Backend
```

开发流程：

```
trunk serve
      ↓
http://localhost:1420
      ↓
tauri dev
      ↓
桌面应用
```

构建流程：

```
trunk build
      ↓
dist/
      ↓
tauri build
      ↓
桌面应用
```

---

💡给你一个非常关键的理解（很多人没意识到）：

**Leptos + Tauri 实际是一个「全 Rust UI 技术栈」方案：**

```
UI          → Leptos
Frontend    → WASM
Desktop API → Tauri
Backend     → Rust
```

相比常见的：

```
Vue / React + Tauri
```

区别是：

| 架构                 | UI语言  | 复杂度 | 生态     |
| ------------------ | ----- | --- | ------ |
| Vue + Tauri        | JS/TS | 简单  | 最成熟    |
| React + Tauri      | JS/TS | 简单  | 成熟     |
| **Leptos + Tauri** | Rust  | 较复杂 | Rust生态 |


# 参考资料

* any list
{:toc}
---
layout: post
title: Tauri 2.0-04-项目结构（Project Structure）
date: 2026-03-15 21:01:55 +0800
categories: [Tauri]
tags: [cross-platefrom, sh]
published: true
---

# 项目结构（Project Structure）

一个 **Tauri 项目**通常由两部分组成：

1. **Rust 项目**
2. **JavaScript 项目（可选）**

一个典型的项目结构如下： ([Tauri][1])

```
.

├── package.json

├── index.html

├── src/

│   ├── main.js

├── src-tauri/

│   ├── Cargo.toml

│   ├── Cargo.lock

│   ├── build.rs

│   ├── tauri.conf.json

│   ├── src/

│   │   ├── main.rs

│   │   └── lib.rs

│   ├── icons/

│   │   ├── icon.png

│   │   ├── icon.icns

│   │   └── icon.ico

│   └── capabilities/

│       └── default.json
```

在这种结构中：

* **JavaScript 项目位于项目顶层**
* **Rust 项目位于 `src-tauri/` 目录中**

Rust 项目本质上是一个 **标准 Cargo 项目**，只是增加了一些 Tauri 相关文件。 ([Tauri][1])

---

# 关键文件说明

## `tauri.conf.json`

这是 **Tauri 的主配置文件**。

该文件包含：

* 应用程序 **Identifier**
* **开发服务器 URL**
* 打包配置
* 应用窗口配置
* 图标配置
* 安全权限配置

同时：

> 该文件也是 **Tauri CLI 用于识别 Rust 项目的标记文件**。 ([Tauri][1])

---

## `capabilities/`

该目录用于存放 **Capability 文件（能力权限配置）**。

简单来说：

如果你希望 **JavaScript 代码调用 Rust 命令或系统能力**，
需要在这里 **显式允许对应权限**。 ([Tauri][1])

示例：

```
src-tauri/capabilities/default.json
```

常见能力包括：

* 文件系统
* 剪贴板
* shell
* window API

---

## `icons/`

该目录存放 **应用程序图标**。

通常由以下命令生成：

```
tauri icon
```

生成的图标包括：

```
icon.png
icon.icns
icon.ico
```

这些图标会在配置文件中引用：

```
tauri.conf.json > bundle > icon
```

用于：

* Windows 应用图标
* macOS 应用图标
* Linux 应用图标。 ([Tauri][1])

---

## `build.rs`

该文件属于 **Rust 构建脚本**。

其中包含：

```
tauri_build::build()
```

该函数用于：

* 处理 Tauri 构建流程
* 生成资源
* 配置编译行为。 ([Tauri][1])

---

## `src/lib.rs`

这里包含：

* **Rust 后端代码**
* **移动端入口函数**

移动端入口函数标记如下：

```
#[cfg_attr(mobile, tauri::mobile_entry_point)]
```

为什么不直接写在 `main.rs`？

因为：

> 在移动端构建时，应用会被编译成 **Rust library（库）**，然后由平台框架加载。 ([Tauri][1])

---

## `src/main.rs`

这是 **桌面端的入口文件（Desktop Entry Point）**。

其主要作用是调用：

```
app_lib::run()
```

从而使用 **与移动端相同的入口逻辑**。

官方建议：

> 不要修改 `main.rs`，而是修改 `lib.rs`。 ([Tauri][1])

说明：

```
app_lib
```

对应 `Cargo.toml` 中：

```
[lib]
name = "app_lib"
```

---

# Tauri 的构建方式

Tauri 的工作方式类似于 **静态 Web Host（静态网站托管）**。

构建流程如下：

1️⃣ 先编译 **JavaScript 前端项目**
→ 生成 **静态文件**

例如：

```
dist/
index.html
assets/
```

2️⃣ 再编译 **Rust 项目**

Rust 会：

* 将前端静态资源 **打包进应用**
* 生成 **桌面或移动应用程序**

因此：

> JavaScript 项目的结构基本和 **普通 Web 项目完全一样**。 ([Tauri][1])

---

# 仅使用 Rust 项目

如果你只想写 **Rust 应用**：

可以：

* 删除 JavaScript 项目
* 直接使用

```
src-tauri/
```

作为：

* 顶层项目
  或
* Rust Workspace 的成员。 ([Tauri][1])

---

# 下一步（Next Steps）

建议继续阅读：

* Frontend Configuration（前端配置）
* Tauri CLI Reference
* Develop your Tauri app
* Tauri 扩展功能



# 参考资料

* any list
{:toc}
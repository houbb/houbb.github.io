---
layout: post
title: Tauri 2.0-03-创建项目（Create a Project）
date: 2026-03-15 21:01:55 +0800
categories: [Tauri]
tags: [cross-platefrom, sh]
published: true
---


# 创建项目（Create a Project）

使 **Tauri** 非常灵活的一个重要原因是：
它可以与 **几乎任何前端框架** 一起使用。

官方提供了一个工具 **`create-tauri-app`**，
用于通过官方维护的框架模板快速创建一个新的 Tauri 项目。 ([Tauri][1])

`create-tauri-app` 当前提供以下模板：

* Vanilla（HTML / CSS / JavaScript，无框架）
* Vue.js
* Svelte
* React
* SolidJS
* Angular
* Preact
* Yew
* Leptos
* Sycamore

你也可以在 **Awesome Tauri** 仓库中找到或添加社区模板。

另外一种方式是：

> 将 **Tauri 添加到已有项目中**，从而快速把现有代码库转换成 Tauri 应用。 ([Tauri][1])

---

# 使用 `create-tauri-app`

在你希望创建项目的目录中运行以下命令之一：

如果不知道该用哪个命令：

* Linux / macOS 推荐 **Bash**
* Windows 推荐 **PowerShell**

---

## Bash

```bash
sh <(curl https://create.tauri.app/sh)
```

## PowerShell

```powershell
irm https://create.tauri.app/ps | iex
```

## Fish

```bash
sh (curl -sSL https://create.tauri.app/sh | psub)
```

## npm

```bash
npm create tauri-app@latest
```

## Yarn

```bash
yarn create tauri-app
```

## pnpm

```bash
pnpm create tauri-app
```

## Deno

```bash
deno run -A npm:create-tauri-app
```

## Bun

```bash
bun create tauri-app
```

## Cargo

```bash
cargo install create-tauri-app --locked
cargo create-tauri-app
```

---

# 创建项目（Scaffold a new project）

执行命令后，CLI 会提示你进行配置。

---

## 1 选择项目名称和 Bundle Identifier

```text
? Project name (tauri-app) ›
? Identifier (com.tauri-app.app) ›
```

说明：

* **Project name**：项目名称
* **Identifier**：应用唯一标识（类似 Java package）

---

## 2 选择前端语言

```text
? Choose which language to use for your frontend ›

Rust  (cargo)

TypeScript / JavaScript  (pnpm, yarn, npm, bun)

.NET  (dotnet)
```

---

## 3 选择包管理器（Package Manager）

当选择 **TypeScript / JavaScript** 时：

```text
? Choose your package manager ›

pnpm
yarn
npm
bun
```

---

## 4 选择 UI 模板

### Rust 版本

```text
? Choose your UI template ›

Vanilla
Yew
Leptos
Sycamore
```

---

### TypeScript / JavaScript 版本

```text
? Choose your UI template ›

Vanilla
Vue
Svelte
React
Solid
Angular
Preact
```

随后选择：

```text
? Choose your UI flavor ›

TypeScript
JavaScript
```

---

## 官方推荐配置

如果不确定选什么：

建议使用 **Vanilla 模板**：

* HTML
* CSS
* JavaScript

后续可以再集成框架。

推荐配置：

```
Frontend language: TypeScript / JavaScript
Package manager: pnpm
UI template: Vanilla
UI flavor: TypeScript
```

---

# 启动开发服务器（Start the Development Server）

创建项目完成后：

进入项目目录并安装依赖。

### npm

```bash
cd tauri-app
npm install
npm run tauri dev
```

### yarn

```bash
cd tauri-app
yarn install
yarn tauri dev
```

### pnpm

```bash
cd tauri-app
pnpm install
pnpm tauri dev
```

### deno

```bash
cd tauri-app
deno install
deno task tauri dev
```

### bun

```bash
cd tauri-app
bun install
bun tauri dev
```

### cargo

```bash
cd tauri-app
cargo install tauri-cli --version "^2.0.0" --locked
cargo tauri dev
```

运行后：

系统会打开一个 **桌面窗口**，运行你的应用。 ([Tauri][1])

🎉 恭喜，你已经创建了你的第一个 Tauri 应用。

---

# 手动创建项目（Manual Setup - Tauri CLI）

如果你已经有一个前端项目，
或者希望手动配置，可以使用 **Tauri CLI** 初始化。

---

## 1 创建前端项目

例如使用 **Vite**：

```bash
mkdir tauri-app
cd tauri-app
npm create vite@latest .
```

---

## 2 安装 Tauri CLI

```bash
npm install -D @tauri-apps/cli@latest
```

或：

```bash
yarn add -D @tauri-apps/cli@latest
```

或：

```bash
pnpm add -D @tauri-apps/cli@latest
```

或：

```bash
cargo install tauri-cli --version "^2.0.0" --locked
```

---

## 3 确定前端开发服务器 URL

例如 Vite 默认地址：

```
http://localhost:5173
```

该地址会被 **Tauri 用来加载前端页面**。

---

## 4 初始化 Tauri

```bash
npx tauri init
```

CLI 会询问以下问题：

```text
✔ What is your app name? tauri-app

✔ What should the window title be? tauri-app

✔ Where are your web assets located? ..

✔ What is the url of your dev server? http://localhost:5173

✔ What is your frontend dev command? pnpm run dev

✔ What is your frontend build command? pnpm run build
```

执行完成后：

项目中会生成一个目录：

```
src-tauri
```

其中包含：

* Tauri 配置
* Rust 代码
* 打包配置

---

## 5 运行项目

```bash
npx tauri dev
```

该命令会：

1. 编译 Rust
2. 启动 Web 前端
3. 打开桌面窗口

---

🎉 恭喜，你已经使用 **Tauri CLI 创建了一个新项目**。 ([Tauri][1])

---

# 下一步（Next Steps）

接下来建议阅读：

* Project Structure（项目结构）
* Add and Configure Frontend Framework
* Tauri CLI Reference
* Develop your Tauri app
* Discover additional features

# 参考资料

* any list
{:toc}
---
layout: post
title: Tauri 2.0-12-棕地集成（Brownfield Integration）
date: 2026-03-15 21:01:55 +0800
categories: [Tauri]
tags: [cross-platefrom, sh]
published: true
---

# 棕地集成（Brownfield Integration）

*Tauri* 支持在 **已有 Web 应用中集成 Tauri**。
这称为 **Brownfield（棕地）集成** —— 即把 Tauri 加到现有项目里，而不是从零启动一个新项目。
这对于步骤渐进迁移、现有应用转桌面端非常有用。

以下指南展示如何在已有 Web 应用中设置调用 Rust 端命令。 ([v2.tauri.app](https://v2.tauri.app/concept/inter-process-communication/brownfield/?utm_source=chatgpt.com))

---

# 前提条件（Prerequisites）

要在棕地应用中使用 IPC，你的项目需要：

* 一个 **现有 Web 应用**
* 安装了 **@tauri-apps/api**
* Tauri 目录（即 `src-tauri/`）已经初始化

如果没有初始化 Tauri，可以运行：

```bash
tauri init
```

之后需要确保你的项目：

* 可在浏览器中独立运行
* 构建后会生成静态资源目录（例如：`dist/`）

这对于 Tauri 正常加载前端是必要的。 ([v2.tauri.app](https://v2.tauri.app/concept/inter-process-communication/brownfield/?utm_source=chatgpt.com))

---

# 在前端调用 Rust 命令

在 **已有 Web 应用代码** 中，你可以直接像使用普通 API 一样调用 Tauri 命令。

## 安装 API 包

确保先安装：

```bash
npm install @tauri-apps/api
```

或者：

```bash
yarn add @tauri-apps/api
```

然后在 Web 端代码中导入：

```javascript
import { invoke } from '@tauri-apps/api/tauri';
```

---

## 示例：调用 Rust 命令

假设 Rust 端已经定义命令：

```rust
#[tauri::command]
fn multiply(a: i32, b: i32) -> i32 {
  a * b
}
```

那么前端调用方式如下：

```javascript
import { invoke } from '@tauri-apps/api/tauri';

const result = await invoke('multiply', { a: 5, b: 7 });
console.log(result); // 35
```

注意：

* `invoke()` 第一个参数是命令名称
* 第二个参数是命令参数对象
  → 键必须与命令参数名一致

---

# 发送事件给前端

Rust 可以主动触发事件通知 Web 端：

```rust
tauri::Window::emit_all(
  &window,
  "notification",
  "新的消息来了！"
)?;
```

前端监听：

```javascript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen('notification', event => {
  console.log(event.payload); // "新的消息来了！"
});
```

---

# 条件加载 IPC

在 Brownfield 集成场景下：

因为你的 Web 应用可能也会在 **普通浏览器中运行**，
而浏览器无法加载 Tauri API（不存在 WebView 环境）。

因此推荐做条件判断 —— 如果运行在 Tauri 环境，才用 IPC：

```javascript
import { isTauri } from '@tauri-apps/api/tauri';

if (isTauri) {
  invoke('multiply', { a: 5, b: 7 });
}
```

> `isTauri` 在非 Tauri 浏览器中为 `false`
> 在 Tauri WebView 中为 `true`

这样你的 Web 代码仍可在浏览器中正常运行，而不会因找不到 Tauri API 报错。

---

# Rust 命令参数校验

即便在 Brownfield 场景下，你仍应：

* **校验 Rust 命令输入参数**
* 不信任来自前端的任何输入
* 在 Rust 内部做严格检查

例如：

```rust
#[tauri::command]
fn div(a: i32, b: i32) -> Result<i32, String> {
  if b == 0 {
    return Err("除数不能为 0".into());
  }
  Ok(a / b)
}
```

然后前端处理可能的错误：

```javascript
try {
  const res = await invoke('div', { a: 10, b: 0 });
} catch (err) {
  console.error(err);
}
```

---

# 注意事件监听生命周期

如果你在前端监听事件：

```javascript
const unlisten = await listen('my-event', handler);
```

请务必在组件卸载或不需要时：

```javascript
unlisten(); // 移除监听
```

避免内存泄漏或重复事件触发。

---

# 指令冲突避免

在棕地项目中，你可能已有很多命令或函数名。
为了避免 IPC 命令名冲突，你可以采用 **命名空间（namespace）约定**：

例如：

```rust
#[tauri::command]
fn file_read(path: String) -> String { … }
```

可以写成：

```rust
#[tauri::command]
fn fs_read_file(path: String) -> String { … }
```

这样在大型项目中可以更容易维护 IPC 接口。

---

# 总结（Summary）

在棕地集成场景中：

1️⃣ 确保 Tauri API 在 Web 项目中可用
2️⃣ 在 Web 端做条件判断（非 Tauri 环境不执行 IPC）
3️⃣ Rust 端严格验证参数
4️⃣ 事件监听要及时移除
5️⃣ 使用命名规则避免冲突

---

📌 这种方式让你能在 **现有 Web 应用基础上**：

✔ 无侵入加入桌面客户端
✔ 与现有逻辑共存
✔ 最小改动迁移至 Tauri



# 参考资料

* any list
{:toc}
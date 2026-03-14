---
layout: post
title: Tauri 2.0-13-隔离（Isolation）
categories: [Tauri]
tags: [cross-platefrom, sh]
published: true
---


# 隔离（Isolation）

Tauri 的 IPC 设计具有 **隔离性**，这意味着：

> **Web 前端与 Rust 后端之间具有严格的边界** — 两者运行在不同的环境中，并且不能直接访问彼此的内存或执行上下文。
> 所有的数据交换必须通过 **IPC 调用（invoke / event）** 进行。

这种隔离不仅提高了安全性，还能确保应用更加稳定。
隔离模型是 Tauri 安全设计的核心之一。 ([v2.tauri.app](https://v2.tauri.app/concept/inter-process-communication/isolation/?utm_source=chatgpt.com))

---

## 为什么需要隔离（Why Isolation Matters）

在没有隔离的环境中：

* 前端代码可能直接访问核心逻辑
* 错误或恶意输入可能破坏整个应用
* 配置和资源访问可能不受限制

但在 Tauri 中：

* **WebView 与 Rust 内核互相隔离**
* 仅通过 **受控的消息通道** 进行通信
* IPC 接口在 Rust 端由开发者显式注册

这意味着：

> 你不会暴露出任意系统 API 给前端
> 只有开发者明确允许的逻辑才可被调用

因此隔离模型是 Tauri 的一项 **安全策略核心**。 ([v2.tauri.app](https://v2.tauri.app/concept/inter-process-communication/isolation/?utm_source=chatgpt.com))

---

## 隔离如何工作（How Isolation Works）

Tauri 将应用分成两个独立执行环境：

1. **WebView 进程**

   * 承载前端 UI
   * 运行 HTML / CSS / JavaScript
   * 通过消息传递调用后端

2. **核心进程（Rust 端）**

   * 提供系统访问权限
   * 处理 IPC 调用
   * 执行文件访问、进程调用、数据库等敏感操作

在这个模型中：

* 前端无法直接访问系统或 Rust 内存
* Rust 也不会将任意函数暴露给前端
* 所有互通操作都通过 **命令（commands） + 事件（events）** 机制完成

---

## IPC 的边界（IPC Boundaries）

下面是各流程如何隔离的详细说明：

### ⚡ WebView → Rust

调用后端命令时：

1. 前端调用：

```javascript
import { invoke } from '@tauri-apps/api/tauri';

await invoke('read_file', { path: '/tmp/data.txt' });
```

2. IPC 桥会：

* 进行 **序列化**
* 将调用信息发送到 Rust 内核

3. Rust 内核：

* 在预注册的命令集合中查找函数
* 运行对应函数
* 序列化返回值

4. 返回前端。

这个过程完全经过安全检查，中间不存在直接内存共享。

---

### 🎯 Rust → WebView

Rust 可以将事件发送给前端：

```rust
window.emit_all("status-updated", payload).unwrap();
```

前端监听：

```javascript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen("status-updated", event => {
  console.log(event.payload);
});
```

数据在发送前后都会进行序列化和内存复制，确保前端无法看到未授权的数据。

---

## 为什么隔离是安全的（Why Isolation Is Secure）

隔离机制能有效防止如下风险：

### 🚫 跨境访问内存

多数现代前端应用采用 JavaScript / WASM，但它们运行在 WebView 内部，不共享与 Rust 的内存空间。
这意味着：

* Web 端无法通过内存访问读取 Rust 内部数据结构
* Rust 也无法读取前端未授权的运行时数据

---

### 💥 防止任意函数调用

只有在 Rust 端被 **显式声明为命令的函数** 才能被前端调用：

```rust
#[tauri::command]
fn do_sensitive() { /* … */ }
```

若未注册：

* 即便前端调用该名称，也不会被执行
* 编译时不会包含相关代码路径

---

## 安全设计理念（Security Design Principles）

Tauri IPC 的隔离策略基于：

### 🔒 最小暴露（Least Exposure）

只向前端曝光必要的功能接口。

* 不需要的系统 API 不会被附带
* 不会默认暴露文件系统、网络访问权限

这同现代 Web 浏览器的安全策略一致。

---

### 🔐 输入验证（Input Validation）

所有从前端传入的数据：

* 都需要在 Rust 端进行合法性检查
* 不应依赖前端验证结果
* Rust 必须拒绝不合法参数

例如：

```rust
#[tauri::command]
fn set_port(port: u16) -> String {
  if port == 0 {
    return "端口不能为 0".into();
  }
  format!("设置端口: {}", port)
}
```

---

## 你不必担心（What You Don’t Need to Worry About）

* 前端直接访问文件系统
* WebView 任意注入原生代码
* 跨域访问未授权资源

这些都有隔离边界策略阻止。

要访问系统能力，必须：

### 1️⃣ Rust 声明命令

### 2️⃣ 前端调用命令

### 3️⃣ Rust 执行并返回或触发事件

---

## 隔离总结（Summary）

Tauri IPC 隔离模型核心要点：

🔹 **WebView 与 Rust 分离执行环境**
🔹 **无共享内存，全部显式消息机制**
🔹 **命令/事件作为唯一桥梁**
🔹 **安全性来源于最小暴露和输入验证**

这种设计带来：

✔ 更好的安全性
✔ 更高的稳定性
✔ 可预测的权限控制模型


# 参考资料

* any list
{:toc}
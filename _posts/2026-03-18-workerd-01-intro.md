---
layout: post
title: workerd 是一个 JavaScript / Wasm 服务器运行时
date: 2026-03-18 21:01:55 +0800
categories: [JavaScriptAI]
tags: [js, wasm]
published: true
---

# 👷 `workerd`，Cloudflare 的 JavaScript/Wasm 运行时

`workerd`（发音：“worker-dee”）是一个 JavaScript / Wasm 服务器运行时，基于驱动 [Cloudflare Workers](https://workers.dev) 的相同代码构建。

你可以将它用于：

* **作为应用服务器**，用于自托管为 Cloudflare Workers 设计的应用。
* **作为开发工具**，用于在本地开发和测试此类代码。
* **作为可编程 HTTP 代理**（正向或反向），用于高效拦截、修改并路由网络请求。

## 介绍

### 设计原则

* **Server-first（以服务器为中心）：** 面向服务器设计，而非 CLI 或 GUI。

* **基于标准：** 内置 API 基于 Web 平台标准，例如 `fetch()`。

* **纳米服务（Nanoservices）：** 将应用拆分为解耦、可独立部署的组件，类似微服务，但具备本地函数调用级别的性能。当一个纳米服务调用另一个时，被调用方在同一线程和进程中运行。

* **同构部署（Homogeneous deployment）：** 不再将不同微服务部署到集群中的不同机器，而是将所有纳米服务部署到集群中的每一台机器，从而使负载均衡更简单。

* **能力绑定（Capability bindings）：** `workerd` 配置使用能力（capabilities）而非全局命名空间来连接纳米服务与外部资源。其结果是代码更具可组合性——并且能够抵御 SSRF 攻击。

* **始终向后兼容：** 将 `workerd` 升级到新版本不会破坏你的 JavaScript 代码。`workerd` 的版本号实际上是一个日期，对应于该版本支持的最大 ["兼容性日期"](https://developers.cloudflare.com/workers/platform/compatibility-dates/)。你始终可以将 worker 配置为过去的某个日期，`workerd` 会模拟该日期下的 API 行为。

[阅读博客以了解更多这些原则。](https://blog.cloudflare.com/workerd-open-source-workers-runtime/)

### ⚠️ 警告：`workerd` 不是一个强化的沙箱

`workerd` 会尝试隔离每个 Worker，使其只能访问被配置允许的资源。然而，`workerd` 本身并不具备足够的纵深防御能力来应对实现漏洞的可能性。当使用 `workerd` 运行可能存在恶意的代码时，你必须将其运行在合适的安全沙箱中，例如虚拟机。Cloudflare Workers 托管服务本身使用了[多层纵深防御机制](https://blog.cloudflare.com/mitigating-spectre-and-other-security-threats-the-cloudflare-workers-security-model/)。

话虽如此，如果你发现某个漏洞允许恶意代码突破 `workerd` 的隔离，请将其提交至 [Cloudflare 漏洞赏金计划](https://hackerone.com/cloudflare?type=team) 以获得奖励。

---

## 快速开始

### 支持的平台

理论上，`workerd` 应该可以运行在任何被 V8 支持的 POSIX 系统以及 Windows 上。

在实践中，`workerd` 已在以下平台进行测试：

* Linux 和 macOS（x86-64 与 arm64 架构）
* Windows（x86-64 架构）

在其他平台上，你可能需要进行一些调整才能使其正常运行。

---

### 构建 `workerd`

要构建 `workerd`，你需要：

* Bazel

  * 如果你使用 [Bazelisk](https://github.com/bazelbuild/bazelisk)（推荐），它会自动下载并使用构建 workerd 所需的正确 Bazel 版本。

* 在 Linux 上：

  * 使用 clang/LLVM 工具链构建 workerd，支持 19 及以上版本（更早版本可能可用，但不受官方支持）

  * Clang 19+（例如 Debian Trixie 中的 `clang-19`）

  * 如果 clang 安装为 `clang-<version>`，请创建一个名为 `clang` 的符号链接，或在 `bazel` 命令中使用 `--action_env=CC=clang-<version>`

  * libc++ 19+（如 `libc++-19-dev`、`libc++abi-19-dev`）

  * LLD 19+（如 `lld-19`）

  * `python3`、`python3-distutils`、`tcl8.6`

* 在 macOS 上：

  * 安装 Xcode 16.3（适用于 macOS 15 及以上）
  * 安装 Homebrew 的 `tcl-tk`（提供 Tcl 8.6）

* 在 Windows 上：

  * 从 Microsoft Store 安装 [App Installer](https://learn.microsoft.com/en-us/windows/package-manager/winget/#install-winget)，以使用 `winget`
  * 以管理员权限运行 `tools/windows/install-deps.bat` 安装依赖
  * 在用户目录的 `.bazelrc` 中添加：

    ```
    startup --output_user_root=C:/tmp
    ```
  * 在命令行开发时，先运行 `tools/windows/bazel-env.bat`

---

构建命令：

```sh
bazel build //src/workerd/server:workerd
```

使用 release 模式：

```sh
bazel build //src/workerd/server:workerd --config=release
```

构建产物位于：

```
bazel-bin/src/workerd/server/workerd
```

---

如果依赖安装顺序有问题，可执行：

```sh
bazel fetch --configure --force
```

或：

```sh
bazel clean --expunge
```

---

更高性能构建：

```sh
bazel build --config=thin-lto //src/workerd/server:workerd
```

---

### 配置 `workerd`

使用 Cap'n Proto 文本格式配置。

示例：

```capnp
using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
  services = [
    (name = "main", worker = .mainWorker),
  ],

  sockets = [
    ( name = "http",
      address = "*:8080",
      http = (),
      service = "main"
    ),
  ]
);

const mainWorker :Workerd.Worker = (
  serviceWorkerScript = embed "hello.js",
  compatibilityDate = "2023-02-28",
);
```

`hello.js`：

```javascript
addEventListener("fetch", event => {
  event.respondWith(new Response("Hello World"));
});
```

参考文档：

* `workerd.capnp` 注释
* `samples` 示例库

---

### 运行 `workerd`

```bash
workerd serve my-config.capnp
```

或使用 npm 预编译版本：

```bash
npx workerd ...
```

---

依赖要求：

* Linux：glibc 2.35+
* macOS：13.5+
* CPU：支持 SSE4.2 / CLMUL 或 arm64 CRC

---

### 使用 `wrangler` 本地开发

```bash
export MINIFLARE_WORKERD_PATH="<WORKERD_REPO_DIR>/bazel-bin/src/workerd/server/workerd"
wrangler dev
```

---

### 生产部署

推荐使用 `systemd`。

示例 service：

```sh
ExecStart=/usr/bin/workerd serve /etc/workerd/config.capnp --socket-fd http=3 --socket-fd https=4
```

特点：

* 自动重启
* 使用低权限用户运行
* 禁止 suid-root 程序

对应 socket：

```sh
ListenStream=0.0.0.0:80
ListenStream=0.0.0.0:443
```

启用服务请参考 systemd 文档。


# 参考资料

* any list
{:toc}
---
layout: post
title: Lightpanda 是一个为无头（headless）使用场景设计的开源浏览器。
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, speech, sh]
published: true
---

# Lightpanda Browser

Lightpanda 是一个 **为无头（headless）使用场景设计的开源浏览器**。 ([GitHub][1])

主要能力：

* JavaScript 执行
* Web API 支持（部分实现，仍在开发中）
* 通过 **CDP（Chrome DevTools Protocol）** 兼容

  * Playwright
  * Puppeteer
  * chromedp

该浏览器面向以下场景提供 **高速 Web 自动化能力**：

* AI Agent
* LLM 训练
* Web 数据抓取（scraping）
* 自动化测试

性能特点：

* **极低内存占用**（比 Chrome 少约 9 倍）
* **执行速度极快**（约比 Chrome 快 11 倍）
* **几乎瞬时启动** ([GitHub][1])

---

# 基准测试

示例：

在 **AWS EC2 m5.large** 实例上，
使用 Puppeteer 请求本地网站 **100 个页面**。

详细 benchmark 数据见项目说明。

---

# 快速开始（Quick start）

## 安装

从 nightly 构建版本安装。

可以下载最新的二进制文件：

支持平台：

* Linux x86_64
* macOS aarch64

---

### Linux

```bash
curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux && \
chmod a+x ./lightpanda
```

---

### macOS

```bash
curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-aarch64-macos && \
chmod a+x ./lightpanda
```

---

### Windows + WSL2

Lightpanda 可以在 Windows 上通过 **WSL** 运行。

安装方式：

在 WSL 终端中按照 Linux 安装步骤执行。

建议：

在 Windows 主机安装 Puppeteer 等客户端工具。

---

## Docker 安装

Lightpanda 提供官方 Docker 镜像：

支持：

* Linux amd64
* Linux arm64

运行命令：

```bash
docker run -d --name lightpanda -p 9222:9222 lightpanda/browser:nightly
```

该命令会启动一个容器，并在端口：

```
9222
```

暴露 Lightpanda 的 **CDP server**。

---

# 获取网页内容（Dump URL）

示例：

```bash
./lightpanda fetch --dump https://lightpanda.io
```

示例输出：

```
info(browser): GET https://lightpanda.io/ http.Status.ok
info(browser): fetch script https://api.website.lightpanda.io/js/script.js: http.Status.ok
info(browser): eval remote https://api.website.lightpanda.io/js/script.js: TypeError: Cannot read properties of undefined (reading 'pushState')
<!DOCTYPE html>
```

---

# 启动 CDP Server

```bash
./lightpanda serve --host 127.0.0.1 --port 9222
```

输出示例：

```
info(websocket): starting blocking worker to listen on 127.0.0.1:9222
info(server): accepting new conn...
```

启动 CDP server 后，可以通过 Puppeteer 连接。

---

# Puppeteer 示例

```javascript
'use strict'

import puppeteer from 'puppeteer-core';

// 使用 browserWSEndpoint 指定 Lightpanda CDP 地址
const browser = await puppeteer.connect({
  browserWSEndpoint: "ws://127.0.0.1:9222",
});

// 后续脚本与普通 Puppeteer 使用方式相同
const context = await browser.createBrowserContext();
const page = await context.newPage();

await page.goto('https://wikipedia.com/');

const links = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('a')).map(row => {
    return row.getAttribute('href');
  });
});

console.log(links);

await page.close();
await context.close();
await browser.disconnect();
```

---

# Telemetry（遥测）

默认情况下，Lightpanda 会收集并发送 **使用遥测数据**。

可以通过设置环境变量禁用：

```
LIGHTPANDA_DISABLE_TELEMETRY=true
```

隐私政策见：

```
https://lightpanda.io/privacy-policy
```

---

# 项目状态（Status）

Lightpanda 目前处于：

```
Beta
```

仍在持续开发中。

稳定性和功能覆盖正在逐步提升。
部分网站仍可能出现错误或崩溃。

如果遇到问题，请提交 GitHub Issue。

---

# 当前已实现功能

核心实现包括：

* HTTP loader（基于 **Libcurl**）
* HTML 解析器与 DOM 树（基于 **Netsurf libs**）
* JavaScript 支持（**V8 引擎**）
* DOM API
* Ajax

  * XHR API
  * Fetch API（polyfill）
* DOM dump
* CDP / WebSocket server
* 点击（Click）
* 表单输入（Input form）
* Cookies
* 自定义 HTTP headers
* 代理支持
* 网络拦截

说明：

Web API 数量非常多。
即使只是实现 **headless 浏览器** 也非常复杂。

未来将逐步增加支持。

---

# 从源码构建（Build from sources）

## 前置要求

Lightpanda 使用：

```
Zig 0.15.2
```

依赖组件：

* zig-js-runtime（包含 V8）
* Libcurl
* Netsurf libs
* Mimalloc

---

### Debian / Ubuntu 依赖

```bash
sudo apt install xz-utils \
    python3 ca-certificates git \
    pkg-config libglib2.0-dev \
    gperf libexpat1-dev unzip rsync \
    cmake clang
```

---

### Nix 系统

```bash
nix develop
```

---

### macOS

需要：

* Xcode
* Homebrew

安装依赖：

```bash
brew install cmake pkgconf
```

---

# 构建依赖

## 一键构建

```bash
make install
```

开发版本：

```bash
make install-dev
```

注意：

该过程非常耗时，
因为会从源码编译所有依赖（包括 V8）。

---

## 分步骤构建

初始化 submodules：

```bash
make install-submodule
```

---

### iconv

国际化库，用于 Netsurf。

```
make install-libiconv
```

---

### Netsurf libs

用于：

* HTML 解析
* DOM 树构建

```
make install-netsurf
```

开发版本：

```
make install-netsurf-dev
```

---

### Mimalloc

C 语言内存分配器。

```
make install-mimalloc
```

开发版本：

```
make install-mimalloc-dev
```

---

### V8

下载 V8 源码：

```
make get-v8
```

编译：

```
make build-v8
```

开发版本：

```
make build-v8-dev
```

---

# 测试（Test）

## 单元测试

```
make test
```

---

## 端到端测试

需要：

* 克隆 demo 仓库到 `../demo`
* 安装 Node 依赖
* 安装 Go > 1.24

运行：

```
make end2end
```

---

## Web Platform Tests

Lightpanda 使用标准 **WPT（Web Platform Tests）** 进行测试。

测试文件位于：

```
tests/wpt
```

---

运行全部测试：

```
make wpt
```

运行指定测试：

```
make wpt Node-childNodes.html
```

---

# 贡献（Contributing）

项目接受 GitHub Pull Request。

提交 PR 时需要签署：

```
CLA
```

否则无法接受贡献。

---

# 为什么要做 Lightpanda？

## 现代 Web 必须执行 JavaScript

过去抓取网页只需要：

```
HTTP request
```

现在不再如此。

原因：

* Ajax
* Single Page Application
* 无限加载
* 点击加载内容
* 即时搜索

以及各种 JS 框架：

* React
* Vue
* Angular

---

## Chrome 不是合适的工具

如果需要 JavaScript，
为什么不用真正浏览器？

例如：

运行大量 **headless Chrome 实例**。

但这带来问题：

* RAM 和 CPU 消耗巨大
* 部署和维护复杂
* 包含大量无用功能

---

## Lightpanda 的设计目标

如果既要 **JavaScript 执行能力**，又要 **高性能**：

就必须重新设计浏览器。

Lightpanda 的设计：

* **不基于 Chromium / Blink / WebKit**
* 使用系统级语言 **Zig**
* 专注性能优化
* 不包含图形渲染

---

# Footnotes

### Playwright 兼容性说明

由于 Playwright 的实现方式：

未来 Lightpanda 新增 Web API 后，
Playwright 可能选择不同执行路径。

这可能导致：

* 某些脚本在未来版本出现不兼容。

如果遇到问题，请提交 Issue 并附带：

* 脚本
* 最后可运行的版本

---

# License

该项目使用：

```
AGPL-3.0
```

# 参考资料

* any list
{:toc}
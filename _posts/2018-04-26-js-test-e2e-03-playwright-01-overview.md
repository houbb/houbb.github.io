---
layout: post
title:  端到端测试-03-Playwright 能够进行各种网页测试，包括功能测试、回归测试和端到端测试
date:  2018-07-05 21:01:28 +0800
categories: [Tool]
tags: [tool, js, test, end-to-end-test, sh]
published: true
---

# 安装

## 简介

Playwright Test 是专门为满足端到端测试需求而创建的。

Playwright 支持包括 Chromium、WebKit 和 Firefox 在内的所有现代渲染引擎。

您可以在 Windows、Linux 和 macOS 上本地或在 CI 上进行测试，无论是无头还是带有本地移动仿真的 Google Chrome for Android 和 Mobile Safari。

## 安装 Playwright

您可以通过 npm 或 yarn 来安装 Playwright。

或者，您也可以使用 VS Code 扩展程序开始并运行您的测试。

```sh
npm init playwright@latest
```

## 运行安装命令并选择以下选项开始：

- 选择 TypeScript 或 JavaScript（默认为 TypeScript）
- 指定您的测试文件夹的名称（默认为 tests，或者如果您的项目中已经有一个 tests 文件夹，则为 e2e）
- 添加 GitHub Actions 工作流以便在 CI 上轻松运行测试
- 安装 Playwright 浏览器（默认为 true）

### 安装内容

Playwright 将下载所需的浏览器，并创建以下文件：

- playwright.config.ts
- package.json
- package-lock.json
- tests/
  - example.spec.ts
- tests-examples/
  - demo-todo-app.spec.ts

playwright.config 是您可以添加 Playwright 配置的地方，包括修改您想要在 Playwright 上运行的浏览器。如果您在已经存在的项目中运行测试，则依赖项将直接添加到您的 package.json 中。

tests 文件夹包含一个基本的示例测试，以帮助您开始测试。如果需要更详细的示例，请查看 tests-examples 文件夹，其中包含用于测试 todo 应用程序的测试。

## 运行示例测试

默认情况下，测试将在所有 3 个浏览器（Chromium、Firefox 和 WebKit）上使用 3 个工作进程运行。您可以在 playwright.config 文件中进行配置。测试将以无头模式运行，意味着在运行测试时不会打开任何浏览器。测试结果和测试日志将显示在终端中。

```
npx playwright test
```

在命令行中运行测试。有关在 headed 模式下运行测试、运行多个测试、运行特定测试等更多信息，请参阅我们的运行测试文档。

### HTML 测试报告

在测试完成后，将生成 HTML 报告，其中显示了测试的完整报告，允许您通过浏览器、通过测试、失败的测试、跳过的测试和不稳定的测试来过滤报告。您可以单击每个测试，并探索测试的错误以及每个测试的每一步。默认情况下，如果某些测试失败，HTML 报告将自动打开。

```
npx playwright show-report
```

显示 HTML 报告。

### 在 UI 模式下运行示例测试

通过 UI 模式运行测试，以获得更好的开发者体验，包括时间旅行调试、监视模式等。

```
npx playwright test --ui
```

在 UI 模式下运行示例测试。

### 更新 Playwright

要将 Playwright 更新到最新版本，请运行以下命令：

```bash
npm install -D @playwright/test@latest
# 同时下载新的浏览器二进制文件及其依赖项：
npx playwright install --with-deps
```

您始终可以通过运行以下命令来检查您拥有的 Playwright 版本：

```bash
npx playwright --version
```

### 系统要求

- Node.js 18+
- Windows 10+、Windows Server 2016+ 或 Windows Subsystem for Linux (WSL)。
- MacOS 12 Monterey、MacOS 13 Ventura 或 MacOS 14 Sonoma。
- Debian 11、Debian 12、Ubuntu 20.04 或 Ubuntu 22.04，使用 x86-64 或 arm64 架构。

# 参考资料

https://playwright.dev/


* any list
{:toc}
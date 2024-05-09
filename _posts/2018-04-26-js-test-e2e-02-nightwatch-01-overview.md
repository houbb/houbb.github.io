---
layout: post
title:  端到端测试-02-nightwatch 无可妥协的测试自动化框架，拥有强大的工具集，可以编写、运行和调试您的测试，涵盖网络和本地移动应用程序
date:  2018-07-05 21:01:28 +0800
categories: [Tool]
tags: [tool, js, test, end-to-end-test, sh]
published: true
---

# Nightwatch是什么？

Nightwatch.js是一个集成框架，用于在所有主要浏览器上执行Web应用程序和网站的自动化端到端测试。

它是使用Node.js编写的，并使用W3C WebDriver API与各种浏览器进行交互。

它是端到端和跨浏览器测试的完整解决方案。它旨在简化编写和运行各种类型的测试的过程，包括：

- 在所有主要Web浏览器上进行端到端测试

- Node.js服务的单元测试

- HTTP API的集成测试

Nightwatch于2014年在荷兰阿姆斯特丹创建，其名称的灵感来自于荷兰17世纪画家伦勃朗·范·莱因的著名作品《夜巡》，这幅杰作在阿姆斯特丹的国立博物馆（Rijksmuseum）中醒目展示。阅读更多关于Nightwatch是如何创建的的信息请点击这里。

# 架构概述

Nightwatch作为易于使用的CLI工具分发，并内置对所有主要浏览器的支持：Chrome、Firefox、Safari和Edge。

Nightwatch利用行业标准协议WebDriver执行浏览器自动化，WebDriver被定义为W3C标准规范。

![struct](https://nightwatchjs.org/img/operation.png)

# WebDriver是什么？

W3C WebDriver

WebDriver是用于自动化Web浏览器的通用库，是Selenium项目的一部分。它现在是一个W3C规范，标准化了浏览器自动化，通过一个可靠且一致的协议，通过RESTful HTTP API远程控制Web浏览器。

Selenium项目创立超过十年，迄今为止是自动化测试行业中使用最广泛的项目，最初是为Java编写的，但现在支持大多数编程语言，提供了一套全面的用于浏览器自动化的工具集。

Nightwatch内部使用W3C WebDriver API执行与浏览器自动化相关的任务，比如打开窗口或点击链接。

对Selenium Grid和云服务提供商的支持

Nightwatch还可以与Selenium服务器（也称为Selenium Grid）一起用于规模化的分布式跨浏览器端到端测试，Selenium Grid是一个用Java编写的开源项目，用于管理WebDriver节点的网络。

Nightwatch 还可以集成到基于云的测试平台，如Browserstack、SauceLabs、CrossBrowserTesting或LambdaTest。

![Nightwatch](https://nightwatchjs.org/img/operation-cloud.png)

# 支持的浏览器

| 浏览器驱动程序 | 浏览器 | 描述 |
|-------------------|-------------|------|
| GeckoDriver | Mozilla Firefox | 独立应用程序，实现了W3C WebDriver API，用于与Firefox通信。 |
| ChromeDriver | Google Chrome | 独立应用程序，实现了W3C WebDriver API，用于Chromium。适用于Android上的Chrome和桌面版Chrome（Mac、Linux、Windows和ChromeOS）。 |
| Microsoft Edge Driver | Microsoft Edge | 独立应用程序，用于驱动最新的基于Chromium的Edge浏览器，类似于ChromeDriver。 |
| SafariDriver | Safari | /usr/bin/safaridriver二进制文件预装在最新版本的MacOS中，并可根据Apple开发者网站上的说明进行使用。有关更多信息，请参阅关于Safari的WebDriver页面。 |

# 快速开始

## 安装Nightwatch

开始使用Nightwatch只需几分钟。您可以使用Nightwatch执行以下类型的测试：

- 在桌面和移动浏览器上进行Web应用的端到端测试
- 使用React、Vue、Storybook和Angular等顶级框架进行组件测试
- 在Android和iOS上进行移动应用测试
- API测试
- 可视化回归测试（VRT）
- 可访问性测试

对于所有类型的测试，您必须首先安装Nightwatch本身。让我们开始吧！

## 先决条件

确保系统上安装了Node。

Nightwatch支持所有高于V14.20的Node版本。

## 设置Nightwatch

Nightwatch可以仅用一个命令行进行安装，可以是作为一个新项目或者已有位置的项目。

1. 作为一个新项目：

要将Nightwatch设置为新项目，只需运行：

```shell
npm init nightwatch <directory-name>
```

2. 在一个现有项目中：

```shell
cd <directory-name>
npm init nightwatch
```

当看到提示安装create-nightwatch时，请按下y。

这会安装Nightwatch，并根据您的喜好设置nightwatch.conf.js文件，如下所示：

通过CLI实用程序设置Nightwatch

回答一系列简单的问题来完成Nightwatch安装。如果您需要有关这些问题的更多信息，请参考下面的指南。

![如下](https://github-production-user-asset-6210df.s3.amazonaws.com/1677755/242005915-a270e3c5-04ff-48e8-9f21-0a72c2b47756.gif)

否则，请在安装完成后跳到运行端到端测试部分。

## 偏好设置

### 测试类型
这将设置 Nightwatch 以及所选测试类型所需的所有依赖项。无论选择哪种类型的测试，Nightwatch 基础版本都将被安装。

? 选择要为项目设置的测试类型（按<空格>选择，<a>切换所有，<i>反转选择，按<回车>继续）
❯◉ 端到端测试
◯ 组件测试
◯ 移动应用测试
您可以选择任何一种选项，并随后设置其他类型的测试。

### 测试运行器与语言
Nightwatch 还支持其他测试运行器。除了 Nightwatch 外，您可以选择 Mocha 或 Cucumber JS 作为测试运行器。

Nightwatch 在 v1.6.0 之后支持 TypeScript 的测试文件。因此，您可以选择使用 JavaScript 或 TypeScript 进行测试设置。

? 选择语言 + 测试运行器变体（使用箭头键）
❯ JavaScript / 默认
TypeScript / 默认
JavaScript / Mocha
JavaScript / CucumberJS

### 浏览器选择
您可以选择要进行测试的浏览器，并且配置将自动为它们创建。

? 选择目标浏览器（按<空格>选择，<a>切换所有，<i>反转选择，按<回车>继续）
❯◯ Firefox
◯ Chrome
◯ Edge
◯ Safari
您也可以稍后通过安装驱动程序并添加相应的环境来添加其他浏览器。

### 测试文件夹
接下来，您可以命名要放置测试的文件夹。默认值为 tests。

? 输入存储测试文件的源文件夹（tests）

### 基本 URL
这是一个非常重要的配置，应该在您的测试中用作变量，以便您可以通过简单的配置更改在不同的测试环境和 URL 之间切换。此偏好设置默认为 http://localhost。

? 输入项目的基本 URL（http://localhost）

### 在本地/远程（云端）运行
您可以配置 Nightwatch 在本地计算机上运行、在远程云端计算机上运行，或两者兼而有之。

? 选择在哪里运行 Nightwatch 测试（使用箭头键）
❯ 在本地主机上
在远程/云服务上
两者
对于远程测试，如果选择 BrowserStack 或 Sauce Labs，主机和端口详细信息将自动添加。但是，如果选择在您自己的远程 Selenium 服务器或任何其他云提供商上运行，则必须在 nightwatch.conf.js 文件中手动配置主机和端口详细信息。

### 匿名度量
允许 Nightwatch 收集匿名度量。此偏好设置默认为否，因为我们尊重用户的隐私。

? 允许 Nightwatch 收集完全匿名的使用度量？（y/N）

### 在移动 Web 上运行测试
Nightwatch 支持在真实和虚拟移动设备上运行测试。Nightwatch 还将处理所有底层 SDK、库和虚拟设备的设置。

是否也设置在移动设备上进行测试？（使用箭头键）
是
❯ 不，现在跳过

一旦选择了此偏好设置，Nightwatch 设置将开始。它还将为您生成示例测试，以便您开始使用。

如果您正在从 Mac 上运行，safaridriver 默认存在但必须启用。您将看到以下选项。

? 启用 safaridriver（需要 sudo 密码）？（使用箭头键） ❯是 否，稍后我会处理。


## 运行你的首个端到端测试

一旦设置完成，您可以使用以下命令运行示例测试：

```
npx nightwatch ./nightwatch/examples
```

输出应该类似于这样：

```
Running: default: examples/accessibilty-tests/websiteAccessibility.js
Running: default: examples/basic/duckDuckGo.js
Running: default: examples/basic/ecosia.js
Running: default: examples/basic/todoList.js
Running: default: examples/with-custom-assertions/todoList.js
Running: default: examples/with-custom-commands/angularTodo.js
Running: default: examples/with-page-objects/google.js

✔ default: examples/with-custom-assertions/todoList.js
[To-Do List End-to-End Test] Test Suite
──────────────────────────────────────────────────────────────────────────────
Using: chrome (110.0.5481.177) on MAC OS X.

– should add a new todo element
✔ Testing if element <#todo-list ul li> has count: 4 (10ms)
✔ Testing if element <#todo-list ul li> has count: 5 (59ms)
✔ default: examples/with-custom-assertions/todoList.js [To-Do List End-to-End Test] should add a new todo element (2.531s)
.
.
.
✨ PASSED. 22 total assertions (16.68s)
Wrote HTML report file to: <path to Nightwatch project folder>/tests_output/nightwatch-html-report/index.html
View the report
Simply, copy-paste the HTML path at the end of the output in your browser address bar to view the report
```

![结果](https://github.com/nightwatchjs/nightwatch-docs/assets/1677755/6fa81ef5-59f2-4562-8075-1aabb04e593f)






# 参考资料

https://docs.cypress.io/guides/overview/why-cypress


* any list
{:toc}
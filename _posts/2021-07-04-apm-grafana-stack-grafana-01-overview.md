---
layout: post
title: grafana stack grafana-01-The open and composable observability and data visualization platform.
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, grafana]
published: true
---


# 开源的监控和可观测性平台

Grafana 允许您查询、可视化、设置警报并理解您的度量数据，无论它们存储在何处。

创建、探索并与团队共享仪表板，促进数据驱动文化：

**可视化：** 快速而灵活的客户端图表，提供多种选项。面板插件提供了许多不同的方法来可视化度量和日志。

**动态仪表板：** 使用模板变量创建动态且可重用的仪表板，这些模板变量会显示在仪表板顶部作为下拉菜单。

**探索度量：** 通过自发式查询和动态钻取来探索您的数据。在仪表板上并排查看和比较不同的时间范围、查询和数据源。

**探索日志：** 通过保留的标签过滤器在度量和日志之间切换的神奇体验。快速搜索所有日志或实时流式传输它们。

**警报：** 视觉化定义您最重要度量的警报规则。Grafana 将持续评估并发送通知到诸如 Slack、PagerDuty、VictorOps、OpsGenie 等系统。

**混合数据源：** 在同一图表中混合不同的数据源！您可以基于每个查询指定数据源。这适用于甚至是自定义数据源。

# windows10 安装笔记

## 准备工作

- git

```
> git --version
git version 2.33.1.windows.1
```

- go

```
> go version
go version go1.20.4 windows/amd64
```

- node

```
> node -v
v16.16.0
```

- yarn

```
> npm install -g yarn
npm WARN config global `--global`, `--local` are deprecated. Use `--location=global` instead.
npm WARN config global `--global`, `--local` are deprecated. Use `--location=global` instead.

added 1 package, and audited 2 packages in 8s

found 0 vulnerabilities
```

## 下载

```
$  git clone git@github.com:grafana/grafana.git
```

## 编译

```
cd grafana
```

## 前端

### 安装前端依赖：

在 Grafana 目录中运行以下命令：

```bash
yarn install --pure-lockfile
```

#### 报错：

```
Usage Error: This tool requires a Node version compatible with >=18.12.0 (got 16.16.0). Upgrade Node, or set `YARN_IGNORE_NODE=1` in your environment.
```

可以考虑升级 nodejs 版本，此处直接下载最新版本：node-v20.10.0-x64.msi

重新安装。

```
# node -v
v20.10.0
```

重新执行

```
yarn install --pure-lockfile
```

继续报错：

```
λ yarn install --pure-lockfile
Unknown Syntax Error: Unsupported option name ("--pure-lockfile").

$ yarn install [--json] [--immutable] [--immutable-cache] [--refresh-lockfile] [--check-cache] [--check-resolutions] [--inline-builds] [--mode #0]
```

使用命令：

```
yarn install
```

这个命令才可以正常执行，然后等待包下载。


### 编译前端代码：

```bash
yarn dev
```


## 编译后端代码：

```bash
go run build.go setup
go run build.go build
```

## 启动 Grafana 服务器：

```bash
go run build.go run
```

在执行这些步骤后，你可以通过浏览器访问 [http://localhost:3000](http://localhost:3000) 来打开 Grafana Web 界面。



# yarn 报错

### 报错

```
λ yarn install --pure-lockfile
Usage Error: This tool requires a Node version compatible with >=18.12.0 (got 16.16.0). Upgrade Node, or set `YARN_IGNORE_NODE=1` in your environment.

━━━ Yarn Package Manager - 4.0.0 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  $ yarn <command>

You can also print more details about any of these commands by calling them with
the `-h,--help` flag right after the command name.
```

## 解决方式

### yarn 报错

这个错误表明 Yarn 要求的 Node.js 版本大于等于 18.12.0，而你的系统上安装的 Node.js 版本为 16.16.0。为了解决这个问题，你可以选择升级你的 Node.js 版本。

以下是一种解决方法：

### 1. 升级 Node.js：

去 [Node.js 官网](https://nodejs.org/) 下载并安装最新版本的 Node.js。在安装过程中，新版本的 Node.js 会替代旧版本。

### 2. 验证 Node.js 和 npm 版本：

打开命令行工具（Command Prompt 或 PowerShell），运行以下命令验证 Node.js 和 npm 是否成功升级：

```bash
node -v
npm -v
```

确保输出的版本号是新版本。

### 3. 重新运行 Yarn 安装：

回到你的 Grafana 项目目录，重新运行 Yarn 安装命令：

```bash
yarn install --pure-lockfile
```

现在，你应该不再遇到关于 Node.js 版本的错误。

如果你因为某些原因不能或不想升级 Node.js，你可以考虑使用 Yarn 提供的 `YARN_IGNORE_NODE` 环境变量。在你运行 `yarn install` 命令之前，可以执行以下操作：

```bash
YARN_IGNORE_NODE=1 yarn install --pure-lockfile
```

这将绕过对 Node.js 版本的检查。请注意，这并不总是推荐的做法，因为一些 Yarn 包可能需要较新版本的 Node.js 来正常工作。最好的方法是将 Node.js 升级到符合要求的版本。


# chat

## Q:  windows 环境编译运行 grafana

在 Windows 环境下编译和运行 Grafana 源码的步骤略有不同。以下是在 Windows 上的基本步骤：

### 1. 安装 Git：

首先，确保你已经安装了 Git。你可以从 [Git 官网](https://git-scm.com/) 下载并安装 Git。

### 2. 安装 Node.js 和 Yarn：

同样，在 Windows 上安装 Node.js 和 Yarn。你可以从 [Node.js 官网](https://nodejs.org/) 下载并安装 Node.js，并使用 npm 安装 Yarn：

```bash
npm install -g yarn
```

### 3. 安装 Go：

下载并安装 Go 编程语言。你可以从 [Go 官网](https://golang.org/) 下载安装程序并按照说明进行安装。

### 4. 克隆 Grafana 仓库：

使用 Git 克隆 Grafana 仓库到本地：

```bash
git clone https://github.com/grafana/grafana.git
```

### 5. 进入 Grafana 目录：

```bash
cd grafana
```

### 6. 安装前端依赖：

在 Grafana 目录中运行以下命令：

```bash
yarn install --pure-lockfile
```

### 7. 编译前端代码：

```bash
yarn dev
```

### 8. 编译后端代码：

```bash
go run build.go setup
go run build.go build
```

### 9. 启动 Grafana 服务器：

```bash
go run build.go run
```

在执行这些步骤后，你可以通过浏览器访问 [http://localhost:3000](http://localhost:3000) 来打开 Grafana Web 界面。

请注意，这里的步骤是一个基本的流程，具体的步骤可能会因 Grafana 版本和 Windows 环境而有所不同。确保查阅 Grafana 项目的官方文档，以获取关于在 Windows 上搭建本地开发环境的详细说明和最新信息。

## 介绍一下 yarn

Yarn 是一个用于管理 JavaScript 项目依赖关系的包管理工具。它在 npm（Node Package Manager）的基础上进行了改进，旨在提高包的安装速度、版本管理和网络安全性。

Yarn 由 Facebook、Google、Exponent 和 Tilde 等公司合作开发，并得到了开源社区的广泛支持。

以下是 Yarn 的一些主要特性和优势：

### 1. **快速且可靠的包安装：**
   - Yarn 使用并行和缓存机制，可以更快地下载和安装依赖项，减少了网络请求和等待时间。
   - 通过离线模式，Yarn 可以在没有网络连接的情况下进行包的安装，提高了包管理的可靠性。

### 2. **版本锁定和确定性：**
   - Yarn 提供了 `yarn.lock` 文件，用于锁定项目的依赖版本，确保在不同环境中使用相同的依赖版本。
   - 这有助于确保在不同开发者或部署环境中，依赖关系的行为是确定性的，减少了由于版本差异引起的问题。

### 3. **离线模式：**
   - Yarn 具有离线模式，它通过本地缓存中的数据来执行包的安装，而不必依赖于网络。这对于在没有网络连接的环境中工作的开发者来说很有用。

### 4. **工作区：**
   - Yarn 支持工作区（Workspaces），允许将多个相关的包组织在一个单独的仓库中，并通过单一的 `yarn install` 命令来安装所有包的依赖。

### 5. **自动解决依赖冲突：**
   - Yarn 自动解决依赖冲突，确保使用的依赖版本能够满足所有依赖关系，而不会出现版本冲突。

### 6. **交互式操作界面：**
   - Yarn 提供了一个交互式的操作界面，可以帮助用户更轻松地理解和管理项目的依赖关系。

### 7. **可插拔的架构：**
   - Yarn 的架构设计允许用户使用插件扩展其功能，以适应各种不同的工作流和需求。

### 使用 Yarn 的基本命令：

- `yarn init`: 初始化一个新的项目。
- `yarn install`: 安装项目的所有依赖项。
- `yarn add [package]`: 添加一个新的依赖项。
- `yarn remove [package]`: 移除一个依赖项。
- `yarn upgrade [package]`: 升级一个依赖项。
- `yarn run [script]`: 运行项目中的自定义脚本。

总体来说，Yarn 是一个强大而灵活的 JavaScript 包管理工具，为开发者提供了更好的依赖关系管理和包安装体验。






# 参考资料

chat

https://github.com/grafana/grafana


* any list
{:toc}
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

> [开发者参考手册](https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md)

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

实际效果：

```
➤ YN0002: │ @grafana/plugin-configs@workspace:packages/grafana-plugin-configs doesn't provide typescript (pcebad), requested by fork-ts-checker-webpack-plugin.
➤ YN0086: │ Some peer dependencies are incorrectly met; run yarn explain peer-requirements <hash> for details, where <hash> is the six-letter p-prefixed code.
➤ YN0068: │ react-compat-css-styled ➤ dependencies ➤ react-simple-compat: No matching package in the dependency tree; you may not need this rule anymore.
➤ YN0068: │ react-icons ➤ peerDependencies ➤ prop-types: No matching package in the dependency tree; you may not need this rule anymore.
➤ YN0068: │ react-resizable ➤ peerDependencies ➤ react-dom: No matching package in the dependency tree; you may not need this rule anymore.
➤ YN0000: └ Completed
➤ YN0000: ┌ Fetch step
➤ YN0013: │ 2782 packages were added to the project (+ 273.86 MiB).
➤ YN0000: └ Completed in 2m 8s
➤ YN0000: ┌ Link step
➤ YN0000: │ ESM support for PnP uses the experimental loader API and is therefore experimental
➤ YN0007: │ esbuild@npm:0.18.12 must be built because it never has been before or the last one failed
➤ YN0007: │ @swc/core@npm:1.3.38 must be built because it never has been before or the last one failed
➤ YN0007: │ core-js@npm:3.33.0 must be built because it never has been before or the last one failed
➤ YN0007: │ protobufjs@npm:7.2.4 must be built because it never has been before or the last one failed
➤ YN0007: │ cypress@npm:13.1.0 must be built because it never has been before or the last one failed
➤ YN0007: │ @parcel/watcher@npm:2.0.4 must be built because it never has been before or the last one failed
➤ YN0007: │ core-js@npm:2.6.12 must be built because it never has been before or the last one failed
➤ YN0007: │ esbuild@npm:0.18.20 must be built because it never has been before or the last one failed
➤ YN0007: │ @swc/core@npm:1.3.90 [4e715] must be built because it never has been before or the last one failed
➤ YN0007: │ core-js-pure@npm:3.30.2 must be built because it never has been before or the last one failed
➤ YN0007: │ esbuild@npm:0.17.19 must be built because it never has been before or the last one failed
➤ YN0007: │ msw@npm:1.3.2 [655a6] must be built because it never has been before or the last one failed
➤ YN0007: │ cypress@npm:9.5.1 must be built because it never has been before or the last one failed
➤ YN0007: │ nx@npm:16.10.0 [aedfc] must be built because it never has been before or the last one failed
➤ YN0000: └ Completed in 3m 58s
➤ YN0000: · Done with warnings in 6m 8s
```

### 编译前端代码：

```bash
yarn start
```

启动日志：

```
Type-checking in progress...
assets by status 95.1 MiB [cached] 359 assets
asset assets-manifest.json 244 KiB [emitted]
Entrypoint app 28.2 MiB (28.9 MiB) = runtime~app.27c08a9f68af7e92fb70.js 33.4 KiB app.4637a8c44c163a0c58f6.js 28.2 MiB 2 auxiliary assets
Entrypoint dark 270 KiB (5.05 KiB) = runtime~dark.17b4d1c541b0624fca31.js 5.44 KiB grafana.dark.5a6c38de282ddca58f82.css 264 KiB dark.d1451cb7139b373d9b65.js 638 bytes 2 auxiliary assets
Entrypoint light 269 KiB (5.05 KiB) = runtime~light.6e52bb965b366de4b171.js 5.44 KiB grafana.light.1eb7e955dcb272501f67.css 263 KiB light.43fe4e93df8c0f730f97.js 642 bytes 2 auxiliary assets
cached modules 48.6 MiB (javascript) 515 KiB (css/mini-extract) 72.3 KiB (asset) 36.1 KiB (runtime) [cached] 10069 modules
javascript modules 2.64 KiB
  ./public/app/ sync extensions\/index.ts 160 bytes [built]
  ./public/app/ sync \.html$ 2.49 KiB [built]
webpack 5.89.0 compiled successfully in 184279 ms
No errors found.
```


## 编译后端代码：

这里按理说应该不通过，我们先尝试一下。

```bash
go run build.go setup # 通常用于运行一个名为 `setup` 的 Go 程序或脚本
go run build.go build # 通常用于运行一个名为 `build` 的 Go 程序或脚本
```


日志：

```
λ go run build.go setup
Version: 10.3.0, Linux Version: 10.3.0, Package Iteration: 1701789185pre
go install -v -buildmode=exe ./pkg/cmd/grafana-server
go: downloading github.com/fatih/color v1.15.0
go: downloading github.com/mattn/go-colorable v0.1.13
go: downloading github.com/mattn/go-isatty v0.0.18
go: downloading golang.org/x/sys v0.14.0
github.com/mattn/go-isatty
golang.org/x/sys/windows
github.com/mattn/go-colorable
github.com/fatih/color
github.com/grafana/grafana/pkg/util/cmd
github.com/grafana/grafana/pkg/cmd/grafana-server

λ go run build.go build
Version: 10.3.0, Linux Version: 10.3.0, Package Iteration: 1701789339pre
building binaries build
building grafana ./pkg/cmd/grafana
rm -r ./bin/windows-amd64/grafana.exe
rm -r ./bin/windows-amd64/grafana.exe.md5
go build -ldflags -w -X main.version=10.3.0-pre -X main.commit=unknown-dev -X main.buildstamp=1701789339 -X main.buildBranch=main -buildmode=exe -o ./bin/windows-amd64/grafana.exe ./pkg/cmd/grafan
...
go: downloading github.com/segmentio/asm v1.2.0
# runtime/cgo
cgo: C compiler "gcc" not found: exec: "gcc": executable file not found in %PATH%
exit status 1
exit status 1
```

这里会有一个报错。

### windows10 下的报错

#### 1、安装 GCC

Grafana 后端包含 SQLite，需要 GCC 进行编译。

因此，在 Windows 上编译 Grafana 时，您需要安装 GCC。

我们建议使用 [TDM-GCC](http://tdm-gcc.tdragon.net/download)。

如果您使用 Scoop，最终可以通过 [Scoop](https://scoop.sh/) 安装 GCC。

#### 2、安装 wire 

您可以按照以下步骤构建后端：

1） 按照安装 Wire 工具的说明进行安装: https://github.com/google/wire#installing


```
go install github.com/google/wire/cmd/wire@latest
```

and ensuring that `$GOPATH/bin` is added to your `$PATH`.

2) 使用 Wire 生成代码：

```
λ wire gen -tags oss ./pkg/server ./pkg/cmd/grafana-cli/runner
wire: github.com/grafana/grafana/pkg/server: wrote D:\_go\grafana-main\grafana-main\pkg\server\wire_gen.go
```

3) 运行二进制

```
go run build.go build
```

编译日志如下：

```
D:\_go\grafana-main\grafana-main
λ go run build.go build
Version: 10.3.0, Linux Version: 10.3.0, Package Iteration: 1701791482pre
building binaries build
building grafana ./pkg/cmd/grafana
rm -r ./bin/windows-amd64/grafana.exe
rm -r ./bin/windows-amd64/grafana.exe.md5
go build -ldflags -w -X main.version=10.3.0-pre -X main.commit=unknown-dev -X main.buildstamp=1701791483 -X main.buildBranch=main -buildmode=exe -o ./bin/windows-amd64/grafana.exe ./pkg/cmd/grafana
go version
go version go1.21.3 windows/amd64
Targeting windows/amd64
building binaries build
building grafana-server ./pkg/cmd/grafana-server
rm -r ./bin/windows-amd64/grafana-server.exe
rm -r ./bin/windows-amd64/grafana-server.exe.md5
go build -ldflags -w -X main.version=10.3.0-pre -X main.commit=unknown-dev -X main.buildstamp=1701791556 -X main.buildBranch=main -buildmode=exe -o ./bin/windows-amd64/grafana-server.exe ./pkg/cmd/grafana-server
go version
go version go1.21.3 windows/amd64
Targeting windows/amd64
building binaries build
building grafana-cli ./pkg/cmd/grafana-cli
rm -r ./bin/windows-amd64/grafana-cli.exe
rm -r ./bin/windows-amd64/grafana-cli.exe.md5
go build -ldflags -w -X main.version=10.3.0-pre -X main.commit=unknown-dev -X main.buildstamp=1701791558 -X main.buildBranch=main -buildmode=exe -o ./bin/windows-amd64/grafana-cli.exe ./pkg/cmd/grafana-cli
go version
go version go1.21.3 windows/amd64
Targeting windows/amd64
```

Wire 是一个代码生成工具，它通过依赖注入自动连接组件。

在 Wire 中，组件之间的依赖关系被表示为函数参数，鼓励显式初始化而不是使用全局变量。

由于 Wire 在没有运行时状态或反射的情况下操作，因此使用 Wire 编写的代码即使用于手动编写的初始化，也是有用的。


## 启动 Grafana 服务器：

```bash
grafana.exe server -homepath "D:\_go\grafana-main\grafana-main"
```

-homepath 必须指定对应的项目 root 所在的路径。

## 效果

然后就可以访问：[http://localhost:3000/login](http://localhost:3000/login)

默认的账户：admin/admin

然后就可以登录成功了。



------------------------------------------------------------------------------------

# windows10 下后端 make 编译

## 说明

感觉基于 gcc 的方式真的麻烦，整了一大堆。

试一下 make 的方式。

## install

> [https://gnuwin32.sourceforge.net/packages/make.htm](https://gnuwin32.sourceforge.net/packages/make.htm)

安装完成后，配置完环境变量 PATH。

我们尝试一下。

```
>make -v
GNU Make 3.81
```

## 编译后端

```
make run
```

运行这个命令，需要使用 linux 的 shell，比如 git bash。

但是估计会有各种参数报错，好像不影响。

PS: 这种的好处就是相对比较方便一些，但是也应该会依赖前面的一些包下载。

------------------------------------------------------------------------------------

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


## Q: yarn 有清空重新 install 的命令吗？

是的，Yarn 提供了清空并重新安装所有依赖项的命令。你可以使用以下命令：

```bash
yarn cache clean
yarn install
```

这两个命令的作用是：

1. **`yarn cache clean`：** 清空 Yarn 的缓存，包括已经下载的依赖项。这样可以确保重新下载最新版本的依赖项。

2. **`yarn install`：** 重新安装项目的所有依赖项。

通过执行这两个命令，你可以实现清空并重新安装项目的依赖项。请注意，这也会删除之前下载的所有缓存，所以在执行 `yarn install` 时，Yarn 会重新下载所有依赖项。

如果你遇到与依赖项或构建相关的问题，这是一个常用的操作来解决问题。但在执行之前，请确保你真的需要清空缓存，因为这会增加重新下载依赖项的时间。


## 解释一下 make run 命令

`make run` 是一个常见的命令，通常用于执行 Makefile 中定义的名为 "run" 的目标（target）。Makefile 是一个包含了构建项目规则的文件，其中包括了如何编译、链接和运行程序的规定。

具体而言，`make run` 命令的执行过程如下：

1. **make：** 这是一个构建工具，用于根据 Makefile 中的规则构建项目。`make` 命令会读取 Makefile 文件，查找并执行指定的目标。

2. **run：** 这是 Makefile 中的一个目标（target）的名称。在 Makefile 中，可能定义了多个目标，每个目标代表一组构建规则。

3. **执行规则：** 当执行 `make run` 时，`make` 会查找 Makefile 中定义的 "run" 目标，并执行与之相关联的规则。这些规则通常包括了运行程序的命令。

举例来说，一个简单的 Makefile 可能如下所示：

```make
CC = gcc
CFLAGS = -Wall

all: myprogram

myprogram: main.c utils.c
    $(CC) $(CFLAGS) main.c utils.c -o myprogram

run: myprogram
    ./myprogram
```

在这个例子中：

- `all` 是默认目标，它依赖于 `myprogram`。
- `myprogram` 目标依赖于 `main.c` 和 `utils.c`，执行 `gcc` 命令将它们编译链接为可执行文件 `myprogram`。
- `run` 目标依赖于 `myprogram`，执行 `./myprogram` 命令来运行程序。

因此，当你运行 `make run` 时，`make` 会先构建 `myprogram`，然后执行 `./myprogram` 来运行程序。这使得 `make` 成为一个强大的自动化构建工具，可以管理复杂项目的构建过程。

对于 grafana 来说，对应的 Makefile 很多。

> [grafana Makefile](https://github.com/grafana/grafana/blob/main/Makefile)

## 解释一下 go run build.go setup

`go run build.go setup` 命令是在 Go 语言项目中使用的一种命令，通常用于运行一个名为 `setup` 的 Go 程序或脚本。该命令的含义可以分解为以下几个部分：

- **`go`：** 这是 Go 语言的官方命令行工具，用于执行各种 Go 相关的操作，包括构建、运行、测试等。

- **`run`：** 这是 `go` 工具的一个子命令，用于编译并运行 Go 源代码文件或通过 main 包执行的 Go 程序。

- **`build.go`：** 这是一个 Go 源代码文件，通常包含了一些与项目构建相关的逻辑。文件名中的 `.go` 扩展名表明这是一个 Go 源代码文件。

- **`setup`：** 这是 `build.go` 文件中的一个可执行的 Go 程序或函数名称。在 Go 语言中，可以通过在代码中定义一个 `main` 包并包含一个 `main` 函数来创建可执行程序。`setup` 是该程序或函数的名称，表示执行构建过程中的设置操作。

因此，`go run build.go setup` 的目的是使用 Go 工具运行 `build.go` 文件中名为 `setup` 的可执行程序或函数。具体的操作取决于 `setup` 的实现，可能包括项目的初始化、依赖项的安装、配置文件的生成等。

在实际项目中，这样的命令通常用于自动化项目的构建和设置过程，以确保项目能够顺利地编译、运行或进行其他必要的初始化步骤。


## Q: 介绍一下 windows 下的 Scoop

Scoop 是一个用于 Windows 操作系统的命令行包管理器，类似于其他操作系统上的包管理器（如 Linux 上的 apt、yum，macOS 上的 Homebrew）。

Scoop 的目标是简化 Windows 上软件的安装、更新和卸载过程，使得管理开发工具、实用程序和其他软件变得更加方便。

以下是 Scoop 的一些特点和使用方法：

1. **简单安装：** Scoop 本身可以通过一行命令进行安装。在 PowerShell 中运行以下命令即可：

    ```powershell
    iwr -useb get.scoop.sh | iex
    ```

2. **用户级安装：** Scoop 安装在用户的主目录下，无需管理员权限。这使得用户可以在没有管理员权限的情况下自由管理软件。

3. **软件安装：** 通过 Scoop，您可以使用类似下面的命令来安装软件：

    ```powershell
    scoop install <软件名称>
    ```

    例如，要安装 Git，可以运行：

    ```powershell
    scoop install git
    ```

4. **软件更新：** 使用 Scoop 可以轻松更新已安装的软件：

    ```powershell
    scoop update
    ```

5. **软件卸载：** Scoop 允许您卸载已安装的软件：

    ```powershell
    scoop uninstall <软件名称>
    ```

6. **桶（Buckets）：** Scoop 使用桶来组织软件的安装脚本和元数据。有许多社区维护的桶，用于支持大量常见的开源软件。

7. **自定义桶：** 用户可以创建自己的桶，以添加、修改或删除软件。

8. **环境变量管理：** Scoop 可以自动添加软件安装目录到系统的 PATH 环境变量中，方便直接在命令行中运行已安装的工具。

总体而言，Scoop 是一个强大而灵活的工具，使得在 Windows 环境中管理软件变得更加便捷。

### 实际 windows10 安装笔记

```
PS C:\Users\Administrator> iwr -useb get.scoop.sh | iex                                                                 Initializing...
Running the installer as administrator is disabled by default, see https://github.com/ScoopInstaller/Install#for-admin for details.
Abort.
```

直接报错，查文档，建议：

```sh
iex "& {$(irm get.scoop.sh)} -RunAsAdmin"
```

继续报错：

```
PS C:\Users\Administrator> iex "& {$(irm get.scoop.sh)} -RunAsAdmin"
Initializing...
PowerShell requires an execution policy in [Unrestricted, RemoteSigned, ByPass] to run Scoop. For example, to set the execution policy to 'RemoteSigned' please run 'Set-ExecutionPolicy RemoteSigned -Scope CurrentUser'.
Abort.
```

执行下面的脚本；

```sh
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

选择 A:

```
执行策略更改
执行策略可帮助你防止执行不信任的脚本。更改执行策略可能会产生安全风险，如 https:/go.microsoft.com/fwlink/?LinkID=135170
中的 about_Execution_Policies 帮助主题所述。是否要更改执行策略?
[Y] 是(Y)  [A] 全是(A)  [N] 否(N)  [L] 全否(L)  [S] 暂停(S)  [?] 帮助 (默认值为“N”): A
```

重新运行：

```sh
iex "& {$(irm get.scoop.sh)} -RunAsAdmin"
```

安装成功日志：

```
Initializing...
Downloading ...
fatal: fetch-pack: invalid index-pack output
fetch-pack: unexpected disconnect while reading sideband packet
PS C:\Users\Administrator> ^C
PS C:\Users\Administrator> iex "& {$(irm get.scoop.sh)} -RunAsAdmin"
Initializing...
Downloading ...
Creating shim...
Adding ~\scoop\shims to your path.
Scoop was installed successfully!
```

# 参考资料

chat

https://github.com/grafana/grafana


* any list
{:toc}
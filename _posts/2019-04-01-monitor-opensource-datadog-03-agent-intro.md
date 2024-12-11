---
layout: post
title: 监控利器之 datadog-03-datadog agent 介绍
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, sf]
published: true
---

### Datadog Agent

本仓库包含了 Datadog Agent 版本 7 和版本 6 的源代码。有关 Agent v5、Agent v6 和 Agent v7 之间差异的更多信息，请参阅 [Agent 用户文档](https://docs.datadoghq.com/agent/)。

此外，我们还提供了预打包的二进制文件列表，方便安装，[可以在这里查看](https://app.datadoghq.com/account/settings/agent/latest?platform=overview)。

**注意**：Datadog Agent v5 的源代码位于 [dd-agent](https://github.com/DataDog/dd-agent) 仓库中。

## 文档

本项目的一般文档，包括安装和开发指南，位于当前仓库的 [docs 目录](docs) 中。

## 快速开始

要构建 Datadog Agent，您需要：

- [Go](https://golang.org/doc/install) 1.23 或更高版本。您还需要设置 `$GOPATH` 并确保 `$GOPATH/bin` 在您的路径中。
- Python 3.11+，以及开发工具所需的库。如果您要构建支持 Python 2 的 Agent，还需要 Python 2.7。
- Python 依赖项。可以通过 `pip install -r requirements.txt` 安装这些依赖项。此命令还会安装 [Invoke](http://www.pyinvoke.org)（如果尚未安装）。
- CMake 版本 3.12 或更高版本，并且需要一个 C++ 编译器。

**注意**：建议您使用 Python 虚拟环境，以避免将 Agent 构建/开发依赖项污染全局的 Python 环境。您可以使用 `virtualenv` 创建虚拟环境，然后使用 `invoke agent.build` 参数 `--python-home-3=<venv_path>` 来使用虚拟环境中的解释器和库。默认情况下，该环境仅用于 `requirements.txt` 中列出的开发依赖项。

**注意**：如果您之前已经通过 brew 在 MacOS 上安装了 `invoke`，或者在其他平台通过 `pip` 安装了 `invoke`，我们建议您使用 `requirements` 文件中指定的版本，以获得顺利的开发/构建体验。

**注意**：您可以启用 invoke 任务的自动补全功能。使用以下命令将适当的行添加到您的 `.zshrc` 文件中：  
`echo "source <(inv --print-completion-script zsh)" >> ~/.zshrc`

构建和测试是通过 `invoke` 协调的，您可以在 shell 中输入 `invoke --list` 查看可用任务。

要开始开发 Agent，您可以构建 `main` 分支：

1. 克隆仓库：`git clone https://github.com/DataDog/datadog-agent.git $GOPATH/src/github.com/DataDog/datadog-agent`。
2. 进入项目文件夹：`cd $GOPATH/src/github.com/DataDog/datadog-agent`。
3. 安装 Go 工具：`invoke install-tools`（如果遇到超时错误，您可能需要在命令前加上 `GOPROXY=https://proxy.golang.org,https://goproxy.io,direct` 环境变量）。
4. 创建一个开发 `datadog.yaml` 配置文件，位于 `dev/dist/datadog.yaml`，并包含一个有效的 API 密钥：`api_key: <API_KEY>`。您可以从一个空的文件开始，或者使用步骤 5 中 Agent 构建后生成的完整文件（位于构建完成后的 `cmd/agent/dist/datadog.yaml`）。
5. 使用 `invoke agent.build --build-exclude=systemd` 构建 Agent。

您可以为 Agent 指定自定义的 Python 位置（在使用虚拟环境时很有用）：

```
invoke agent.build \
  --python-home-3=$GOPATH/src/github.com/DataDog/datadog-agent/venv3
```

运行 `invoke agent.build` 时：

- 丢弃 `bin/agent/dist` 中的任何更改。
- 构建 Agent，并将二进制文件写入 `bin/agent/agent`。
- 将文件从 `dev/dist` 复制到 `bin/agent/dist`。有关更多信息，请参见 [dev/dist 目录中的 README](https://github.com/DataDog/datadog-agent/blob/main/dev/dist/README.md)。

如果您构建的是较早版本的 Agent，可能会遇到错误 `make: *** No targets specified and no makefile found. Stop.`。为解决此问题，您应删除 `rtloader` 文件夹中的 `CMakeCache.txt`，使用 `rm rtloader/CMakeCache.txt`。

请注意，[追踪代理](https://docs.datadoghq.com/tracing/trace_collection/) 需要单独构建和运行。

更多详细信息，请参阅 [Agent 开发者指南](docs/dev/README.md)。关于 Windows 开发环境的设置，请参见 [Windows 开发环境](devenv)。

## 测试

使用 `invoke test` 运行单元测试：

```
invoke test --targets=./pkg/aggregator
```

您还可以使用 `invoke linter.go` 只运行 Go linters：

```
invoke linter.go
```

测试依赖于 [rtloader](/rtloader) 的代码时，先构建并安装 rtloader：

```
invoke rtloader.make && invoke rtloader.install
invoke test --targets=./pkg/collector/python
```

## 运行

您可以使用以下命令运行 Agent：

```
./bin/agent/agent run -c bin/agent/dist/datadog.yaml
```

文件 `bin/agent/dist/datadog.yaml` 是通过 `invoke agent.build` 从 `dev/dist/datadog.yaml` 复制过来的，并且必须包含有效的 API 密钥。

### 运行 JMX 检查

为了在本地运行基于 JMX 的检查，您必须具备以下条件：

1. 将 JMXFetch `jar` 文件复制到 `dev/dist/jmx/jmxfetch.jar`
2. 确保 `java` 可在您的 `$PATH` 中找到

有关详细说明，请参见 [JMX 检查](./docs/dev/checks/jmxfetch.md)。

## 贡献代码

关于如何为本项目贡献代码的信息，请查看本仓库中的 [docs/dev 目录](docs/dev)。

## 许可证

Datadog Agent 用户空间组件采用 [Apache License, Version 2.0](LICENSE) 许可证。BPF 代码采用 [General Public License, Version 2.0](pkg/ebpf/c/COPYING) 许可证。

# 参考资料

https://github.com/DataDog/datadog-agent

* any list
{:toc}
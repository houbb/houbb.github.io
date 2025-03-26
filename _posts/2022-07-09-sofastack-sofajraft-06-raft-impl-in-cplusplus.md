---
layout: post
title: raft-06-LogCabin 是一个分布式系统，提供少量高度复制和一致性的存储。
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFAJRaft, raft, sh]
published: true
---

## 前言

大家好，我是老马。

分布式系统中，一致性算法是最重要的基石，也是最难学习的部分。

本系列根据 jraft 作为入口，学习一下 raft 的原理和实现。

## raft 系列

[SOFAStack-00-sofa 技术栈概览](https://houbb.github.io/2022/07/09/sofastack-00-overview)

# logcabin

之所以介绍这个库 LogCabin，是因为这个库是Raft作者的开源实现。

### 概述

LogCabin 是一个分布式系统，提供少量高度复制和一致性的存储。

它是其他分布式系统存储其核心元数据的可靠地方，并在解决集群管理问题时非常有用。

LogCabin 内部使用 [Raft 共识算法](https://raft.github.io)，并且实际上是 Raft 算法的首个实现。

它以 [ISC 许可证](https://en.wikipedia.org/wiki/ISC_license) 发布（等同于 BSD 许可证）。

外部资源：
- [幻灯片](https://logcabin.github.io/talk/)：介绍 LogCabin 的使用、操作和内部实现
- [代码级文档](https://logcabin.github.io/doxygen/annotated.html)：使用 Doxygen 构建
- LogCabin 开发的最新动态：[Diego 的博客](http://ongardie.net/blog/+logcabin/)

有关发布的信息，请查看 [RELEASES.md](RELEASES.md)。

本 README 将指导您如何编译和运行 LogCabin。

### 问题

关于 LogCabin 实现的最佳提问场所是 [logcabin-dev](https://groups.google.com/forum/#!forum/logcabin-dev) 邮件列表。您还可以尝试在 freenode IRC 网络的 `#logcabin` 频道提问，尽管并不是总有人在线。使用 GitHub Issues 报告问题或建议功能。

如果您对 Raft 共识算法有问题或想讨论，Raft 的实现由 LogCabin 提供，您可以使用 [raft-dev](https://groups.google.com/forum/#!forum/raft-dev) 邮件列表。

### 构建

[![构建状态](https://travis-ci.org/logcabin/logcabin.svg?branch=master)](https://travis-ci.org/logcabin/logcabin)

#### 前提条件：

- Linux x86-64（应支持 v2.6.32 及以上版本）
- git（应支持 v1.7 及以上版本）
- scons（已知 v2.0 和 v2.3 可用）
- g++（已知 v4.4 至 v4.9 和 v5.1 可用）或 clang（已知 v3.4 至 v3.7 可用，且支持 libstdc++ 4.9，libc++ 也支持；更多信息请参见 [CLANG.md](CLANG.md)）
- protobuf（建议使用 v2.6.x，v2.5.x 应该也可用，v2.3.x 不支持）
- crypto++（已知 v5.6.1 可用）
- doxygen（可选；已知 v1.8.8 可用）

简而言之，RHEL/CentOS 6 及更新版本应该适用。

获取源代码：

```bash
git clone git://github.com/logcabin/logcabin.git
cd logcabin
git submodule update --init
```

构建客户端库、服务器二进制文件和单元测试：

```bash
scons
```

对于自定义构建环境，您可以将配置变量放在 `Local.sc` 文件中。例如，该文件可能如下所示：

```bash
BUILDTYPE='DEBUG'
CXXFLAGS=['-Wno-error']
```

要查看可用的配置参数，请运行：

```bash
scons --help
```

### 运行基础测试

在继续之前，建议先运行包含的单元测试：

```bash
build/test/test
```

您还可以运行一些系统范围的测试。首先运行烟雾测试，这将通过嵌入在 LogCabin 客户端中的内存数据库进行（不涉及服务器）：

```bash
build/Examples/SmokeTest --mock && echo 'Smoke test completed successfully'
```

要在真实的 LogCabin 集群上运行相同的烟雾测试，需要进行更多的设置。

### 运行真实集群

本节介绍如何在一个三服务器的 LogCabin 集群上运行 `HelloWorld` 示例程序。我们将暂时在本地主机上运行所有服务器：

- 服务器 1 将监听 127.0.0.1:5254
- 服务器 2 将监听 127.0.0.1:5255
- 服务器 3 将监听 127.0.0.1:5256

端口 5254 是 LogCabin 的默认端口，由 IANA 为 LogCabin 保留。其他两个端口则为其他使用，应该不会在您的网络中冲突。

我们首先需要创建三个配置文件。您可以基于 `sample.conf` 创建，或者以下内容在当前也有效：

文件 `logcabin-1.conf`：

```bash
serverId = 1
listenAddresses = 127.0.0.1:5254
```

文件 `logcabin-2.conf`：

```bash
serverId = 2
listenAddresses = 127.0.0.1:5255
```

文件 `logcabin-3.conf`：

```bash
serverId = 3
listenAddresses = 127.0.0.1:5256
```

现在您几乎准备好启动服务器。首先，初始化其中一台服务器的日志，配置一个只包含它自己的集群成员配置：

```bash
build/LogCabin --config logcabin-1.conf --bootstrap
```

ID 为 1 的服务器现在会有一个有效的集群成员配置。此时，集群中只有 1 台服务器，所以只需要 1 票：它可以选举自己为领导者并提交新条目。现在我们可以启动该服务器（保持运行）：

```bash
build/LogCabin --config logcabin-1.conf
```

但是我们不想停在这里，因为只有一台服务器的集群并不具备容错能力！我们将启动另外两台服务器，并将它们添加到第一台服务器的集群中。

首先，在另一个终端中启动第二台服务器（保持运行）：

```bash
build/LogCabin --config logcabin-2.conf
```

请注意，这台服务器只是空闲，等待集群成员配置。它仍然不属于集群。

同样，启动第三台服务器（LogCabin 会检查确保您的新配置中的所有服务器都可用，才会提交切换，避免您做出错误操作）：

```bash
build/LogCabin --config logcabin-3.conf
```

现在使用重新配置命令将第二和第三台服务器添加到集群中：

```bash
ALLSERVERS=127.0.0.1:5254,127.0.0.1:5255,127.0.0.1:5256
build/Examples/Reconfigure --cluster=$ALLSERVERS set 127.0.0.1:5254 127.0.0.1:5255 127.0.0.1:5256
```

该 `Reconfigure` 命令是一个特殊的 LogCabin 客户端。它首先查询每个在命令行参数中给定的服务器（空格分隔），以获取其服务器 ID 和监听地址。然后，它连接到通过 `--cluster` 选项指定的集群（逗号分隔），并请求领导者将集群成员设置为这些服务器。注意，如果现有集群成员也要保留在集群中，它们应该包括在命令行参数中，否则它们将被驱逐。

如果成功，您应该看到第一台服务器已将其他服务器添加到集群中，第二和第三台服务器现在也在参与。输出应该类似于：

```bash
Current configuration:
Configuration 1:
- 1: 127.0.0.1:5254

Attempting to change cluster membership to the following:
1: 127.0.0.1:5254 (given as 127.0.0.1:5254)
2: 127.0.0.1:5255 (given as 127.0.0.1:5255)
3: 127.0.0.1:5256 (given as 127.0.0.1:5256)

Membership change result: OK

Current configuration:
Configuration 4:
- 1: 127.0.0.1:5254
- 2: 127.0.0.1:5255
- 3: 127.0.0.1:5256
```

注意：如果您在所有服务器之间共享一个磁盘，并且负载较重，集群可能会遇到难以保持领导者的问题。有关症状和解决方法，请参见 [issue 57](https://github.com/logcabin/logcabin/issues/57)。

最后，您可以运行 LogCabin 客户端以测试集群：

```bash
build/Examples/HelloWorld --cluster=$ALLSERVERS
```

该程序并没有做任何特别有趣的事情。另一个工具 `TreeOps` 可以在命令行上展示 LogCabin 的数据结构：

```bash
echo -n hello | build/Examples/TreeOps --cluster=$ALLSERVERS write /world
build/Examples/TreeOps --cluster=$ALLSERVERS dump
```

查看 `--help` 获取完整的可用命令列表

。

您应该能够逐个停止服务器并保持可用性，或者停止多个并重新启动它们并保持安全性（可能会有短暂的可用性中断）。

如果您发现每次都要传递 `--cluster=$ALLSERVERS` 很麻烦，也可以使用 DNS 名称返回所有 IP 地址。不过，您需要为每个服务器使用不同的 IP 地址，而不仅仅是不同的端口。

如果您有自己的应用程序，您可以将其链接到 `build/liblogcabin.a`。您还需要链接以下库：

- pthread
- protobuf
- cryptopp

### 运行集群范围的测试

如上所述，在运行集群时的过程有点繁琐，特别是当您只是想跑一些测试并立即拆除集群时。为此，`scripts/smoketest.py` 自动化了这一过程。创建一个名为 `scripts/localconfig.py` 的文件来覆盖 `scripts/config.py` 中的 `smokehosts` 和 `hosts` 变量：

```python
smokehosts = hosts = [
  ('192.168.2.1', '192.168.2.1', 1),
  ('192.168.2.2', '192.168.2.2', 2),
  ('192.168.2.3', '192.168.2.3', 3),
]
```

该脚本使用此文件来通过 SSH 启动服务器。每个元组代表一个服务器，包含：

1. 用于 SSH 的地址，
2. 用于 LogCabin TCP 连接的地址，
3. 唯一的 ID。

每台服务器应该能够通过 SSH 无需密码访问，并且 LogCabin 目录应该位于相同的文件系统位置。脚本假设该目录位于共享文件系统中，例如 NFS 挂载或本地磁盘。

您还可以选择创建一个 `smoketest.conf` 文件，该文件可以定义适用于所有服务器的各种选项。服务器的监听地址将与您的 `smoketest.conf` 自动合并。

现在，您已经准备好运行：

```bash
scripts/smoketest.py && echo 'Smoke test completed successfully'
```

此脚本还可以被劫持/包含来运行其他测试程序。

### 文档

要从源代码构建文档，请运行：

```bash
scons docs
```

生成的 HTML 文件将放置在 `docs/doxygen` 目录下。

您也可以在 <https://logcabin.github.io> 上找到这些文档。

### 安装

要在文件系统上安装一堆东西，请运行：

```bash
scons install
```

除了二进制文件外，这还会安装一个与 RHEL 6 兼容的初始化脚本。

如果您不希望这些文件污染您的文件系统，可以将文件安装到任何指定的目录，方法如下（将 `pathtoinstallprefix` 替换为您希望安装文件的路径）：

```bash
scons --install-sandbox=pathtoinstallprefix pathtoinstallprefix
```

最后，您可以按照以下方式构建一个二进制 RPM：

```bash
scons rpm
```

这将创建一个名为 `build/logcabin-0.0.1-0.1.alpha.0.x86_64.rpm` 的文件，您可以使用 RPM 安装，效果与 `scons install` 相同。

### 贡献

请使用 GitHub 报告问题和发送拉取请求。

所有提交都应该通过预提交钩子。启用它们以在每次提交之前运行：

```bash
ln -s ../../hooks/pre-commit .git/hooks/pre-commit
```

# 参考资料

https://github.com/logcabin/logcabin

* any list
{:toc}
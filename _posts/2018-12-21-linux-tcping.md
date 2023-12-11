---
layout: post
title: linux tcping 验证网络端口连通性
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, net, sh]
published: true
excerpt: linux ping
---

# 拓展阅读

[linux-ping](https://houbb.github.io/2018/12/21/linux-ping)

[linux-telnet](https://houbb.github.io/2018/12/20/linux-telnet)

# tcping

## 背景

以前验证网络端口，都习惯使用 telnet。

后来发现有些环境这个命令没有，或者被禁用，哪还有其他方式吗？

tcping 就是其中一个。

## 用法

```
tcping [options] host [port]
```

# chat

## 介绍一下 linux tcping

`tcping` 是一个用于测试 TCP 连接的命令行工具，它类似于常见的 ping 工具，但专门用于检测 TCP 连接的可用性。

与传统的 ping 命令不同，tcping 通过尝试建立 TCP 连接来测试目标主机的可达性，而不是发送 ICMP 报文。

以下是 `tcping` 命令的基本用法：

```bash
tcping [options] host [port]
```

- `host`: 指定目标主机的域名或 IP 地址。
- `port` (可选): 指定要测试的目标端口号，如果不指定，则默认使用 TCP 默认端口 80。

一些常用的选项包括：

- `-t` 或 `--timeout`: 指定超时时间，即等待建立连接的最大时间。
- `-c` 或 `--count`: 指定尝试建立连接的次数。
- `-i` 或 `--interval`: 指定尝试连接之间的时间间隔。

以下是一个简单的示例：

```bash
tcping -t 5 -c 3 example.com 80
```

上述命令将尝试连接到 `example.com` 的 TCP 端口 80，设置超时时间为 5 秒，尝试连接的次数为 3 次。

`tcping` 在网络故障排除和监控方面非常有用，它可以帮助确定目标主机的 TCP 服务是否可用，以及连接延迟的情况。

请注意，为了使用 `tcping` 命令，你可能需要先在系统上安装该工具，具体安装方式取决于你使用的 Linux 发行版。

## tcping 和 ping 还有 telnet 命令的区别和联系

`tcping`、`ping` 和 `telnet` 是用于网络诊断和测试的三个不同的命令行工具，它们在功能和使用方式上有一些区别。

以下是它们的主要区别和联系：

1. **ping**:
   - **功能：** `ping` 用于测试目标主机的可达性，通常通过发送 ICMP 报文并等待目标主机的响应来测量网络的往返时间（Round-Trip Time，RTT）。
   - **使用：** `ping` 常用于检查主机是否在线，以及网络连接的基本情况。
   - **示例：** `ping example.com`

2. **tcping**:
   - **功能：** 与 `ping` 类似，但是 `tcping` 专门用于测试 TCP 连接的可用性。它尝试建立 TCP 连接而不是发送 ICMP 报文。
   - **使用：** `tcping` 可用于检测目标主机的特定 TCP 端口是否开放，并且可以测量连接建立的时间。
   - **示例：** `tcping -t 5 -c 3 example.com 80`

3. **telnet**:
   - **功能：** `telnet` 是一个网络协议工具，用于建立与远程主机的 Telnet 会话。它可以用于连接到远程主机的特定端口并执行一些简单的交互式命令。
   - **使用：** `telnet` 常用于测试目标主机上的服务是否正常运行，也可以用于远程登录到其他系统。
   - **示例：** `telnet example.com 80`

**联系：**
- 所有这三个工具都用于测试网络连接的一些方面，但是它们的焦点和使用场景略有不同。
- `ping` 主要用于测试主机的基本可达性和网络延迟。
- `tcping` 专注于测试 TCP 连接，特别是检查目标主机的特定端口是否开放。
- `telnet` 则提供一种交互式的方式来连接到远程主机上的服务，可以用于测试特定端口的可用性以及执行简单的命令。

在进行网络故障排除和性能测试时，这些工具通常结合使用，以全面了解网络和主机的状态。

# 参考资料



* any list
{:toc}
---
layout: post
title: Linux 命令专题汇总 overview 
date:  2018-12-21 +0800
categories: [Linux]
tags: [linux, topics, overview, sh]
published: true
---

# 介绍

Linux 命令相关的专题内容。

# 命令汇总

[linux top-linux 内存](https://houbb.github.io/2018/12/21/linux-top)

[linux tar gz 解压命令](https://houbb.github.io/2018/12/21/linux-tar-gz)

[linux tail, linux head](https://houbb.github.io/2018/12/21/linux-tail)

[linux rm, mkdir](https://houbb.github.io/2018/12/21/linux-rm)

[linux pwd](https://houbb.github.io/2018/12/21/linux-pwd)

[linux ps](https://houbb.github.io/2018/12/21/linux-ps)

[linux port 端口占用](https://houbb.github.io/2018/12/21/linux-port)

[linux ping](https://houbb.github.io/2018/12/21/linux-ping)

[linux mv](https://houbb.github.io/2018/12/21/linux-mv)

[linux ls](https://houbb.github.io/2018/12/21/linux-ls)

[linux less, linux more](https://houbb.github.io/2018/12/21/linux-less)

[linux grep](https://houbb.github.io/2018/12/21/linux-grep)

[linux file 命令](https://houbb.github.io/2018/12/21/linux-file)

[linux diff](https://houbb.github.io/2018/12/21/linux-diff)

[linux chmod](https://houbb.github.io/2018/12/21/linux-chmod)

[linux cd](https://houbb.github.io/2018/12/21/linux-cd)

[linux cat](https://houbb.github.io/2018/12/21/linux-cat)

[Linux Tool Box](https://houbb.github.io/2018/12/20/linux-tool-box)

[linux telnet](https://houbb.github.io/2018/12/20/linux-telnet)

## 统计类的命令

[linux free-内存统计信息](https://houbb.github.io/2018/12/21/linux-free)

[linux df-磁盘统计信息](https://houbb.github.io/2018/12/21/linux-df)

[linux top 实时查看系统性能](https://houbb.github.io/2018/12/20/linux-top)

[linux netstat-显示系统网络连接、路由表、接口统计、masquerade 连接等信息](https://houbb.github.io/2018/12/20/linux-netstat)


# chat

## Q1: apt install sysstat，会安装哪些命令？

当你运行`apt install sysstat`时，它将安装`sysstat`软件包，其中包含了一系列用于系统性能监控和报告的工具。

以下是通过安装`sysstat`而获得的一些常见命令：

1. **sar**：System Activity Reporter，用于报告系统的活动情况，包括CPU使用率、内存使用率、磁盘活动等。

2. **iostat**：用于报告关于系统输入/输出设备（磁盘、终端、网络接口等）的统计信息。

3. **mpstat**：Multiple Processor Statistics，用于显示多处理器系统的CPU使用率统计。

4. **pidstat**：用于报告有关Linux进程及其任务的统计信息，包括CPU、内存、I/O等。

5. **sadc**：System Activity Data Collector，用于收集系统活动数据，sar命令实际上是它的前端。

这些工具是`sysstat`软件包的一部分，安装后你就可以使用这些命令来监控系统性能，进行故障排查和性能优化。

## Q2-根据 top/sar/iostat/mpstat/pidstat 有些重复的地方，这几个命令的区别和联系是什么？

这些命令是 Linux 系统中用于监控系统性能和资源利用的工具，但它们各自有不同的重点和使用方式。

以下是这些命令的主要区别和联系：

1. **top**：

   - **区别**：`top` 提供了实时的交互式系统监视，显示系统中运行的进程列表，并按 CPU 使用率和内存使用率进行排序。它还提供了对进程的操作，如终止进程。
   - **联系**：与其他工具相比，`top` 更注重交互性，适用于需要实时监视并在运行时进行交互的场景。

2. **sar**：

   - **区别**：`sar`（System Activity Reporter）提供了系统性能历史数据的收集和报告功能。它可以定期记录系统的 CPU 使用率、内存使用率、磁盘 I/O 等信息，以便后续分析。
   - **联系**：`sar` 适用于长时间的性能监控，可以生成报告并支持系统管理员对历史数据的分析。

3. **iostat**：

   - **区别**：`iostat` 提供了有关系统的磁盘 I/O 活动的实时统计信息，包括每个磁盘的读取、写入速率等。
   - **联系**：`iostat` 适用于监控磁盘性能，帮助发现磁盘瓶颈和优化磁盘使用。

4. **mpstat**：

   - **区别**：`mpstat` 用于显示多处理器系统的 CPU 使用率统计信息，包括每个 CPU 的使用情况。
   - **联系**：`mpstat` 提供了对 CPU 使用率的详细分析，适用于多核系统。

5. **pidstat**：

   - **区别**：`pidstat` 提供了有关进程级别的 CPU、内存、磁盘 I/O 等统计信息。它允许用户指定监控的进程，并提供对特定进程的详细分析。
   - **联系**：`pidstat` 适用于深入了解特定进程的性能，并在需要时对其进行监控。

这些工具在不同的场景中都有用处，可以根据具体的需求选择合适的工具。

例如，

如果需要实时监视整个系统的运行状态，可以使用 `top`；

如果需要长时间的历史数据，可以使用 `sar`；

如果关注磁盘 I/O，可以使用 `iostat`；

对于多核系统的 CPU 监控，可以使用 `mpstat`；

而对于进程级别的监控，可以使用 `pidstat`。

这些工具也可以结合使用，以提供更全面的系统性能分析。

# 参考资料

* any list
{:toc}
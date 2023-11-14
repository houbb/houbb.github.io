---
layout: post
title: linux apt install sysstat 安装系统的统计命令
date:  2018-12-21 +0800
categories: [Linux]
tags: [linux, topics, overview, sh]
published: true
---

# 安装

```
sudo apt install sysstat
```

日志：

```
dh@d:~$ sudo apt install sysstat
[sudo] password for dh:
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following additional packages will be installed:
  libsensors-config libsensors5
Suggested packages:
  lm-sensors isag
The following NEW packages will be installed:
  libsensors-config libsensors5 sysstat
0 upgraded, 3 newly installed, 0 to remove and 0 not upgraded.
Need to get 487 kB/519 kB of archives.
After this operation, 1649 kB of additional disk space will be used.
Do you want to continue? [Y/n] y
Ign:1 http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 sysstat amd64 12.5.2-2ubuntu0.1
Err:1 http://security.ubuntu.com/ubuntu jammy-updates/main amd64 sysstat amd64 12.5.2-2ubuntu0.1
  404  Not Found [IP: 185.125.190.36 80]
E: Failed to fetch http://security.ubuntu.com/ubuntu/pool/main/s/sysstat/sysstat_12.5.2-2ubuntu0.1_amd64.deb  404  Not Found [IP: 185.125.190.36 80]
E: Unable to fetch some archives, maybe run apt-get update or try with --fix-missing?
```

## 更新

```
sudo apt-get update
```

首先进行一次更新。

## 重新安装

```
sudo apt install sysstat
```

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

请注意，具体可用的命令可能取决于你系统上安装的`sysstat`软件包的版本。

# 参考资料


* any list
{:toc}
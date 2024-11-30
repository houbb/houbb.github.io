---
layout: post
title: jvm-49-linux cpu 使用率升高应该如何排查分析？
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, thread, sh]
published: true
---

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[jvisualvm java 性能分析工具](https://houbb.github.io/2018/11/12/jvisualvm)

[jvm-44-jvm 内存性能分析工具 Eclipse Memory Analyzer Tool (MAT) / 内存分析器 (MAT)](https://houbb.github.io/2018/10/08/jvm-44-dump-file-analysis-mat)

[jvm-45-jvm dump 文件内存介绍+获取方式+堆内存可视分析化工具](https://houbb.github.io/2018/10/08/jvm-45-dump-file-analysis-visual)

[jvm-46-jvm Thread Dump 线程的堆栈跟踪信息+获取方式+可视分析化工具 FastThread](https://houbb.github.io/2018/10/08/jvm-46-dump-thread-file-analysis-visual)

[jvm-47-jvm GC 日志获取方式+可视分析化工具 GcViewer](https://houbb.github.io/2018/10/08/jvm-47-gc-file-analysis-visual)

[jvm-48-java 变更导致压测应用性能下降，如何分析定位原因？](https://houbb.github.io/2018/10/08/jvm-48-slow-how-to-analysis)

[jvm-49-linux 服务器 cpu 使用率升高应该如何排查分析？](https://houbb.github.io/2018/10/08/jvm-49-cpu-high-how-to-analysis)

# 前言

大家好，我是老马。

有时候我们监控了应用的 cpu 使用率，过高的时候需要分析排查，那么一般的分析流程应该是什么样的？

# 应用方面

我们首先要看一下应用层面是否最近发生过变更，比如配置变更+应用发布。

或者是存在定时的跑批等。

如果是周期性的，可以考虑忽略，或者调整对应报警的阈值。

## 业务流量

可能存在一些特别大的任务处理/查询之类的，可以通过应用日志确认。

可能应用业务量飙升，首先看请求网络流量/CAT请求统计是否升高；

或者应用本身的服务是否正常，导致每一台的处理压力上升？

# linux 机器方面

当 Linux 服务器的 CPU 使用率升高时，可能有多种原因，排查问题需要系统地分析。

以下是一些常见的排查步骤：

## 检查整体 CPU 使用情况 

首先，你可以使用一些常用的命令查看系统整体的 CPU 使用率：

- `top`：查看实时的系统资源使用情况。
    - 按 `1` 键查看每个 CPU 核心的使用情况。
- `htop`：类似于 `top`，但是提供了更友好的界面，能显示更多的信息（如果未安装，可以使用 `sudo apt install htop` 安装）。
- `uptime` 或 `w`：查看系统负载（1、5、15 分钟的平均负载）。

## top 效果

我们以 WSL 为例

> [linux top 介绍](https://houbb.github.io/2018/12/21/linux-top) 

```
$ top
top - 17:37:38 up 6 min,  1 user,  load average: 0.04, 0.13, 0.08
Tasks:  38 total,   1 running,  37 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.1 us,  0.1 sy,  0.0 ni, 99.8 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :  15962.4 total,  14373.8 free,    932.2 used,    656.4 buff/cache
MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.  14765.8 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      1 root      20   0  167068  12564   8220 S   2.0   0.1   0:06.03 systemd
    325 mysql     20   0 2308084 403664  35500 S   1.0   2.5   0:02.99 mysqld
    611 root      20   0   43372  36876  10276 S   0.7   0.2   0:03.56 python3
    497 root      20   0  154392  69488  18200 S   0.3   0.4   0:03.83 python3.10
      2 root      20   0    2616   1444   1320 S   0.0   0.0   0:00.00 init-systemd(Ub
      9 root      20   0    2616      4      0 S   0.0   0.0   0:00.00 init
     44 root      19  -1   47836  15480  14396 S   0.0   0.1   0:00.13 systemd-journal
     69 root      20   0   22224   6104   4560 S   0.0   0.0   0:00.24 systemd-udevd
     88 root      20   0    4496    204     56 S   0.0   0.0   0:00.00 snapfuse
     94 root      20   0    4628    176     24 S   0.0   0.0   0:00.00 snapfuse
```

### 具体 cpu 效果

按下 `1`

```
$ top
top - 17:59:36 up 28 min,  1 user,  load average: 0.05, 0.05, 0.06
Tasks:  39 total,   1 running,  36 sleeping,   2 stopped,   0 zombie
%Cpu0  :  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu1  :  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu2  :  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu3  :  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu4  :  0.0 us,  0.3 sy,  0.0 ni, 99.7 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu5  :  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
...
MiB Mem :  15962.4 total,  14659.2 free,    963.8 used,    339.3 buff/cache
MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.  14735.0 avail Mem
```

## 按照 %CPU% 排序

在 `top` 界面中，按 `P` 键（大写的 P）来按 CPU 使用率排序。

默认情况下，`top` 是按照进程 ID 排序的，通过按 `P` 键，你可以切换到按照 CPU 使用率（%CPU）排序。

- 按 `P` 键后，进程会按照 `%CPU` 由高到低进行排序，进程使用 CPU 的百分比会显示在 `%CPU` 列中。

- 按 `q` 键退出 `top` 命令的交互界面。

效果：

```
PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      1 root      20   0  167068  12568   8220 S   2.0   0.1   0:29.47 systemd
    325 mysql     20   0 2308084 421892  35500 S   1.0   2.6   0:12.09 mysqld
    611 root      20   0   43372  37364  10276 S   1.0   0.2   0:12.41 python3
      2 root      20   0    2616   1444   1320 S   0.0   0.0   0:00.00 init-systemd(Ub
      9 root      20   0    2616      4      0 S   0.0   0.0   0:00.00 init
     44 root      19  -1   47836  15508  14424 S   0.0   0.1   0:00.14 systemd-journal
     69 root      20   0   22224   6104   4560 S   0.0   0.0   0:00.24 systemd-udevd
```

## 分析高 CPU 使用的进程 

如果发现某个进程使用了大量 CPU，进一步分析该进程的原因：

- 检查该进程是否为正常进程，是否是你期望运行的服务。

- 如果是某个应用程序或服务导致的，查看该应用的日志文件（通常位于 `/var/log/` 或应用特定的日志目录）。

### 系统日志

查看系统日志文件，可能会发现一些错误信息，帮助排查原因：

- `/var/log/syslog` 或 `/var/log/messages`：一般的系统日志。

- `/var/log/dmesg`：内核日志，特别是硬件相关的问题。

- `/var/log/auth.log`：检查是否有未授权的访问。

## 检查 I/O 操作

过度的磁盘 I/O 或网络 I/O 也可能导致 CPU 使用率升高。

你可以使用以下命令进行检查：

- `iostat`：查看磁盘的 I/O 情况。

- `iotop`：实时监控磁盘 I/O（需要 root 权限）。

- `netstat -tuln` 或 `ss -tuln`：查看当前的网络连接，判断是否有大量的网络通信导致 CPU 占用增加。

### iostat 效果

> [linux iostat 介绍](https://houbb.github.io/2018/12/21/linux-iostat) 

```
$ iostat
Command 'iostat' not found, but can be installed with:
sudo apt install sysstat
```

提示没安装，我们安装一下

```
sudo apt install sysstat
```

再次执行：

```
$ iostat
Linux 5.15.167.4-microsoft-standard-WSL2 (PC-20230404XHIO)      11/30/24        _x86_64_        (20 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.19    0.01    0.13    0.08    0.00   99.60

Device             tps    kB_read/s    kB_wrtn/s    kB_dscd/s    kB_read    kB_wrtn    kB_dscd
sda               0.44        29.22         0.00         0.00      78933          0          0
sdb               0.04         0.82         0.00         0.00       2228          4          0
sdc               7.03       209.14        51.84       172.57     564925     140028     466136
```

## 检查内存是否充足

如果系统内存不足，可能会导致大量的交换（swap）操作，进而增加 CPU 使用率。

使用以下命令查看内存使用情况：

- `free -h`：查看内存和交换空间的使用情况。

- `vmstat`：查看内存的交换（swap）情况。

### free 效果

这个是很常用的一个命令：

```
$ free -h
               total        used        free      shared  buff/cache   available
Mem:            15Gi       961Mi        14Gi       3.0Mi       398Mi        14Gi
Swap:          4.0Gi          0B       4.0Gi
```

> [linux free 命令](https://houbb.github.io/2018/12/21/linux-free)

### vmstat 效果

- `vmstat 1`：每秒显示一次系统的虚拟内存统计信息，包含 CPU 使用、进程、内存等数据。

下面的命令是 2S 一次，共计 5 次。

```
$ vmstat 2 5
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 0  0      0 15061208   2616 302412    0    0    31     8   11   47  0  0 99  0  0
 0  0      0 15060708   2616 302412    0    0     0     0   60  531  0  0 100  0  0
 0  0      0 15062192   2616 302412    0    0     0     0   76  542  0  0 100  0  0
 0  0      0 15061940   2616 302412    0    0     0     0   63  535  0  0 100  0  0
 0  0      0 15062192   2616 302412    0    0     0     0   59  531  0  0 100  0  0
```

> [linux vmstat 介绍](https://houbb.github.io/2018/12/21/linux-vmstat) 


# 其他

如果上面都分析了一遍，下面的也可作为一种思路参考，但是一般可能性比较低。

## 检查是否存在恶意进程

如果系统中出现了不明进程，可能是被攻击或有恶意软件。

你可以：

- 使用 `ps` 和 `top` 查找不明进程。

- 检查异常进程的启动时间和路径，判断是否是恶意软件或病毒。

## 检查定时任务和后台进程**

定时任务（如 `cron`）或后台服务（如守护进程）可能会在特定时间执行大量计算或其他操作。

检查是否有定时任务异常：

- `crontab -l`：查看当前用户的定时任务。

- `sudo crontab -l`：查看 root 用户的定时任务。

这种一般比较少，不过还是有一些系统通过 cron 实现调度的。

## 检查系统资源限制 

可能存在系统资源限制导致某些进程被迫大量占用 CPU。

可以检查以下参数：

- `ulimit -a`：查看当前用户的资源限制。

- `sysctl -a`：查看系统的内核参数配置，尤其是与进程调度和资源限制相关的参数。

# 小结

可以发现，如果我们没有统一的监控平台，可能还是要对 linux 的命令比较熟悉。

有一些统一监控系统，比如普米/zabbix，问题排查会更加直观一些。但是排查思路是一样的。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}
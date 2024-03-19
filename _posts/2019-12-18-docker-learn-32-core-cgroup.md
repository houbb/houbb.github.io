---
layout: post
title: Docker learn-09-Docker 核心技术 CGROUP
date:  2019-12-18 11:34:23 +0800
categories: [Devpos]
tags: [docker, windows, devops, sh]
published: true
---

# 容器的核心技术是 Cgroup + Namespace。

```
容器 = cgroup + namespace + rootfs + 容器引擎
```

Cgroup： 资源控制

namespace： 访问隔离

rootfs：文件系统隔离。镜像的本质就是一个rootfs文件

容器引擎：生命周期控制

# Cgroup

Cgroup 是 Control group 的简称，是 Linux 内核提供的一个特性，用于限制和隔离一组进程对系统资源的使用。

## 子系统

对不同资源的具体管理是由各个子系统分工完成的。

| 子系统		 | 作用 |
|:---|:---|
| devices		 | 设备权限控制 |
| cpuset		 | 分配指定的CPU和内存节点 |
| CPU			 | 控制CPU使用率 |
| cpuacct		 | 统计CPU使用情况 |
| memory		 | 限制内存的使用上限 |
| freezer		 | 暂停 Cgroup 中的进程 |
| net_cls		 | 配合流控限制网络带宽 |
| net_prio	 | 设置进程的网络流量优先级 |
| perf_event	 | 允许 Perf 工具基于 Cgroup 分组做性能检测 |
| huge_tlb	 | 限制 HugeTLB 的使用 |

在 Cgroup 出现之前，只能对一个进程做资源限制，如 ulimit 限制一个进程的打开文件上限、栈大小。

而 Cgroup 可以对进程进行任意分组，如何分组由用户自定义。

# 子系统介绍

## cpuset 子系统

cpuset 可以为一组进程分配指定的CPU和内存节点。 

cpuset 一开始用在高性能计算上，在 NUMA(non-uniform memory access) 架构的服务器上，通过将进程绑定到固定的 CPU 和内存节点上，来避免进程在运行时因跨节点内存访问而导致的性能下降。

## cpuset 的主要接口如下：

cpuset.cpus: 允许进程使用的CPU列表

cpuset.mems： 允许进程使用的内存节点列表

## cpu 子系统

cpu 子系统用于限制进程的 CPU 利用率。

具体支持三个功能

第一，CPU 比重分配。使用 cpu.shares 接口。

第二，CPU 带宽限制。使用 cpu.cfs_period_us 和 cpu.cfs_quota_us 接口。

第三， 实时进程的 CPU 带宽限制。使用 cpu_rt_period_us 和 cpu_rt_quota_us 接口。

## cpuacct 子系统

统计各个 Cgroup 的 CPU 使用情况，有如下接口：

cpuacct.stat: 报告这个 Cgroup 在用户态和内核态消耗的 CPU 时间，单位是 赫兹。

cpuacct.usage： 报告该 Cgroup 消耗的总 CPU 时间。

cpuacct.usage_percpu：报告该 Cgroup 在每个 CPU 上的消耗时间。

## memory 子系统

限制 Cgroup 所能使用的内存上限。

memory.limit_in_bytes：设定内存上限，单位字节。

默认情况下，如果使用的内存超过上限，Linux 内核会试图回收内存，如果这样仍无法将内存降到限制的范围内，就会触发 OOM，选择杀死该Cgroup 中的某个进程。
memory.memsw,limit_in_bytes: 设定内存加上交换内存区的总量。

memory.oom_control： 如果设置为0，那么内存超过上限时，不会杀死进程，而是阻塞等待进程释放内存；同时系统会向用户态发送事件通知。
memory.stat: 报告内存使用信息。

## blkio

限制 Cgroup 对 阻塞 IO 的使用。

blkio.weight: 设置权值，范围在[100, 1000]，属于比重分配，不是绝对带宽。因此只有当不同 Cgroup 争用同一个阻塞设备时才起作用
blkio.weight_device： 对具体设备设置权值。它会覆盖上面的选项值。
blkio.throttle.read_bps_device: 对具体的设备，设置每秒读磁盘的带宽上限。
blkio.throttle.write_bps_device: 对具体的设备，设置每秒写磁盘的带宽上限。
blkio.throttle.read_iops_device: 对具体的设备，设置每秒读磁盘的IOPS带宽上限。
blkio.throttle.write_iops_device: 对具体的设备，设置每秒写磁盘的IOPS带宽上限。

## devices 子系统

控制 Cgroup 的进程对哪些设备有访问权限
devices.list: 只读文件，显示目前允许被访问的设备列表，文件格式为
`类型 [a|b|c] 设备号 [major:minor] 权限 [r/w/m 的组合]`

a/b/c 表示 所有设备、块设备和字符设备。

devices.allow： 只写文件，以上述格式描述允许相应设备的访问列表。
devices.deny： 只写文件，以上述格式描述禁止相应设备的访问列表。



# 参考资料

[容器核心技术--Cgroup 与 Namespace](https://www.jianshu.com/p/ab423c3db59d)

# 拓展阅读

[code shell docker 系列博客](https://coolshell.cn/tag/docker)

* any list
{:toc}
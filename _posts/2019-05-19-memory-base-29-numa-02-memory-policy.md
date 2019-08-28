---
layout: post
title: Memory 内存知识-29-NUMA 内存策略
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Memory Policy

The idea behind defining a memory policy is to allow existing code to work reasonably well in a NUMA environment without major modifications. 

The policy is inherited by child processes, which makes it possible to use the numactl tool. 

This tool can be used to, among other things, start a program with a given policy. 

# Linux 内核的策略支持

## 策略

The Linux kernel supports the following policies:

- MPOL_BIND 

Memory is allocated only from the given set of nodes. 

If this is not possible allocation fails.

- MPOL_PREFERRED 

Memory is preferably allocated from the given set of nodes. 

If this fails memory from other nodes is considered.

- MPOL_INTERLEAVE 

Memory is allocated equally from the specified nodes. 

The node is selected either by the offset in the virtual memory region for VMAbased policies, or through a free-running counter
for task-based policies.

- MPOL_DEFAULT 

Choose the allocation based on the default for the region.

## 是递归定义策略吗

This list seems to recursively define policies. 

此列表似乎以递归方式定义策略。

This is half true. 

In fact, memory policies form a hierarchy (see Figure 6.15).

![image](https://user-images.githubusercontent.com/18375710/63820516-18295380-c97c-11e9-8d2d-62f1ee6c4a67.png)

If an address is covered by a VMA policy then this policy is used. 

A special kind of policy is used for shared memory segments. 

If no policy for the specific address is present, the task’s policy is used. 

If this is also not present the system’s default policy is used.

如果VMA策略覆盖了某个地址，则使用此策略。

一种特殊的策略用于共享内存段。

如果没有针对特定地址的策略，则使用任务的策略。

如果这也不存在，则使用系统的默认策略。

## 系统默认策略

The system default is to allocate memory local to the thread requesting the memory. 

No task and VMA policies are provided by default. 

For a process with multiple threads the local node is the “home” node, the one which first ran the process. 

The system calls mentioned above can be used to select different policies.


# Specifying Policies

## set_mempolicy 指令 

The set_mempolicy call can be used to set the task policy for the current thread (task in kernel-speak). 

Only the current thread is affected, not the entire process.

```c
#include <numaif.h>
long set_mempolicy(int mode,
unsigned long *nodemask,
unsigned long maxnode);
```

### 函数介绍

The mode parameter must be one of the `MPOL_*` constants introduced in the previous section. 

The nodemask parameter specifies the memory nodes to use for future allocations and maxnode is the number of nodes (i.e., bits) in nodemask. 

If mode is MPOL_DEFAULT no memory nodes need to be specified and the nodemask parameter is ignored. 

If a null pointer is passed as nodemask for MPOL_PREFERRED the local node is selected. 

Otherwise MPOL_PREFERRED uses the lowest node number with the corresponding bit set in nodemask.

## 设置策略的影响

Setting a policy does not have any effect on already allocated memory. 

对已经分配的内存没有影响。

Pages are not automatically migrated（迁移）;

only future allocations are affected. 

只会影响以后的分配，这也很容易理解。

Note the difference between memory allocation and address space reservation（保留）:

an address space region established using mmap is usually not automatically allocated. 

The first read or write operation on the memory region will allocate the appropriate page. 

If the policy changes between accesses to different pages of the same address space region, or if the policy allows allocation of memory from different nodes, a seemingly uniform address space region might be scattered across many memory nodes.

存储器区域上的第一次读取或写入操作将分配适当的页面。

如果策略在对相同地址空间区域的不同页面的访问之间改变，或者如果策略允许从不同节点分配存储器，则看似统一的地址空间区域可能分散在许多存储器节点上。

# numactl 工具

NUMA(Non-Uniform Memory Access)字面直译为“非一致性内存访问”，对于Linux内核来说最早出现在2.6.7版本上。

这种特性对于当下大内存+多CPU为潮流的X86平台来说确实会有不少的性能提升，但相反的，如果配置不当的话，也是一个很大的坑。

本文就从头开始说说Linux下关于CPU NUMA特性的配置和调优。 

## NUMA 替代 FSB 总线

最早Intel在Nehalem架构上实现了NUMA，取代了在此之前一直使用的FSB前端总线的架构，用以对抗AMD的HyperTransport技术。

一方面这个架构的特点是内存控制器从传统的北桥中移到了CPU中，排除了商业战略方向的考虑之外，这样做的方法同样是为了实现NUMA。 

在SMP多CPU架构中，传统上多CPU对于内存的访问是总线方式。

是总线就会存在资源争用和一致性问题，而且如果不断的增加CPU数量，总线的争用会愈演愈烈，这就体现在4核CPU的跑分性能达不到2核CPU的2倍，甚至1.5倍！

理论上来说这种方式实现12core以上的CPU已经没有太大的意义。 

## Intel NUMA 的解决方案

Intel的NUMA解决方案，Litrin始终认为它来自本家的安藤。

他的模型有点类似于MapReduce。

放弃总线的访问方式，将CPU划分到多个Node中，每个node有自己独立的内存空间。

各个node之间通过高速互联通讯，通讯通道被成为QuickPath Interconnect即QPI。 

这个架构带来的问题也很明显，如果一个进程所需的内存超过了node的边界，那就意味着需要通过QPI获取另一node中的资源，尽管QPI的理论带宽远高于传统的FSB，比如当下流行的内存数据库，在这种情况下就很被动了。 

## 分段的思想

有些类似于 HashMap 与 ConcurrentHashMap 的思想。

**分段可以避免冲突，提升性能。**

## Linux 手动调优工具

Linux提供了一个一个手工调优的命令numactl（默认不安装），首先你可以通过它查看系统的numa状态：

```
numactl --hardware
available: 1 nodes (0)
node 0 cpus: 0 1 2 3
node 0 size: 4095 MB
node 0 free: 835 MB
node distances:
node   0 
  0:  10 
```

此系统共有1个node，各领取4个CPU和4G内存。 

# NUNA 与 SMP

NUMA(Non-Uniform Memory Access，非一致性内存访问)和SMP(Symmetric Multi-Processor，对称多处理器系统)是两种不同的CPU硬件体系架构。 

SMP的主要特征是共享，所有的CPU共享使用全部资源，例如内存、总线和I/O，多个CPU对称工作，彼此之间没有主次之分，平等地访问共享的资源，这样势必引入资源的竞争问题，从而导致它的扩展内力非常有限。 

NUMA技术将CPU划分成不同的组（Node)，每个Node由多个CPU组成，并且有独立的本地内存、I/O等资源。

Node之间通过互联模块连接和沟通，因此除了本地内存外，每个CPU仍可以访问远端Node的内存，只不过效率会比访问本地内存差一些，我们用Node之间的距（Distance，抽象的概念）来定义各个Node之间互访资源的开销。

```
Node->Socket->Core->Processor
```

随着多核技术的发展，将多个CPU封装在一起，这个封装被称为插槽Socket；Core是socket上独立的硬件单元；通过intel的超线程HT技术进一步提升CPU的处理能力，OS看到的逻辑上的核数Processor。

socket = node
socket是物理概念，指的是主板上CPU插槽；node是逻辑概念，对应于socket。

core = 物理CPU
core是物理概念，一个独立的硬件执行单元，对应于物理CPU；

thread = 逻辑CPU = Processor
thread是逻辑CPU，也就是Processor。

# 参考资料

P73

[numactl](https://blog.csdn.net/qccz123456/article/details/81979819)

* any list
{:toc}
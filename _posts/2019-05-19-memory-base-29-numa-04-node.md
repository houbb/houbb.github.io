---
layout: post
title: Memory 内存知识-29-NUMA 节点信息
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Querying Node Information

The get_mempolicy interface can be used to query a variety of facts about the state of NUMA for a given address.

```c
#include <numaif.h>
long get_mempolicy(int *policy,
const unsigned long *nmask,
unsigned long maxnode,
void *addr, int flags);
```

When get_mempolicy is called with zero for the flags parameter, the information about the policy for address addr is stored in the word pointed to by policy and in the bitmask for the nodes pointed to by nmask. 

If addr falls into an address space region for which a VMA policy has been specified, information about that policy is returned. 

Otherwise information about the task policy or, if necessary, system default policy will be returned.

## MPOL_F_NODE 标识

If the MPOL_F_NODE flag is set in flags, and the policy governing addr is MPOL_INTERLEAVE, the value stored in the word pointed to by policy is the index of the node on which the next allocation is going to happen（将要发生）. 

This information can potentially（可能） be used to set the affinity of a thread which is going to work on the newly-allocated memory. 

This might be a less costly way to achieve proximity（实现接近）, especially if the thread has yet to be created.

## MPOL_F_ADDR 标识

The MPOL_F_ADDR flag can be used to retrieve（取回） yet another completely different data item. 

If this flag is used, the value stored in the word pointed to by policy is the index of the memory node on which the memory for the page containing addr has been allocated. 

如果使用此标志，则策略指向的单词中存储的值是已分配包含addr的页面的内存的内存节点的索引。

This information can be used to make decisions about possible page migration, to decide which thread could work on the memory location most efficiently, and many more things.

此信息可用于决定可能的页面迁移，确定哪个线程可以最有效地在内存位置上工作，以及更多的事情。

# 内存分配的稳定性问题

The CPU–and therefore memory node–a thread is using is much more volatile than its memory allocations. 

CPU和内存节点 - 线程正在使用的内存节点比其内存分配更不稳定。

Memory pages are, without explicit（明确的） requests, only moved in extreme circumstances（极端的情况）. 

A thread can be assigned to another CPU as the result of rebalancing the CPU loads. 

Information about the current CPU and node might therefore be short-lived. 

当前的 cpu 和 node 可能存活的时间都很短。

The scheduler will try to keep the thread on the same CPU, and possibly even on the same core, to minimize performance losses due to cold caches.

尽可能不进行内存的切换，提升 cache 的命中率。

This means it is useful to look at the current CPU and node information; 

one only must avoid assuming the association will not change.

一个人必须避免假设关联不会改变。


# NUMA 查询接口

libNUMA provides two interfaces to query the node information for a given virtual address space range:

## 方案一

```c
#include <libNUMA.h>
int NUMA_mem_get_node_idx(void *addr);
int NUMA_mem_get_node_mask(void *addr,
size_t size,
size_t __destsize,
memnode_set_t *dest);
```

NUMA_mem_get_node_mask sets in dest the bits for all memory nodes on which the pages in the range [addr, addr+size) are (or would be) allocated, according to the governing policy（治理政策）. 

NUMA_mem_get_node only looks at the address addr and returns the index of the memory node on which this address is (or would be) allocated.

These interfaces are simpler to use than get_mempolicy and probably should be preferred.

## 查询当前的 cpu 信息

The CPU currently used by a thread can be queried using sched_getcpu (see section 6.4.3). 

Using this information, a program can determine the memory node(s) which are local to the CPU using the NUMA_cpu_to_memnode
interface from libNUMA:

```c
#include <libNUMA.h>
int NUMA_cpu_to_memnode(size_t cpusetsize,
const cpu_set_t *cpuset,
size_t memnodesize,
memnode_set_t *
memnodeset);
```

A call to this function will set (in the memory node set pointed to by the fourth parameter) all the bits corresponding to（对应于） memory nodes which are local to any of the CPUs in the set pointed to by the second parameter. 

Just like CPU information itself, this information is only correct until the configuration of the machine changes (for instance, CPUs get removed and added).

## 获取内存策略更方便的方式

The bits in the memnode_set_t objects can be used in calls to the low-level functions like get_mempolicy.

It is more convenient（方便） to use the other functions in libNUMA. 

The reverse（相反） mapping is available through:

```c
#include <libNUMA.h>

int NUMA_memnode_to_cpu(size_t memnodesize,
const memnode_set_t *
memnodeset,
size_t cpusetsize,
cpu_set_t *cpuset);
```

The bits set in the resulting cpuset are those of the CPUs local to any of the memory nodes with corresponding bits set in memnodeset. 

For both interfaces, the programmer has to be aware that the information can change over time (especially with CPU hot-plugging). 

In many situations, a single bit is set in the input bit set, but it is also meaningful, for instance, to pass the entire set of CPUs retrieved by a call to sched_getaffinity to NUMA_cpu_to_memnode to determine which are the memory nodes the thread ever can have direct access to.

在生成的cpuset中设置的位是任何内存节点本地的CPU的位，其中相应的位在memnodeset中设置。

对于这两个接口，程序员必须意识到信息会随着时间的推移而发生变化（特别是在CPU热插拔时）。

在许多情况下，在输入位集中设置单个位，但是，例如，将通过调用sched_getaffinity检索到的整个CPU集传递给NUMA_cpu_to_memnode以确定线程可以存储的内存节点也是有意义的。 

可以直接访问。


# CPU and Node Sets

Adjusting code for SMP and NUMA environments by changing the code to use the interfaces described so far might be prohibitively（登天） expensive (or impossible) if the sources are not available. 

Additionally, the system administrator might want to impose restrictions（施加限制） on the resources a user and/or process can use. 

## so-called CPU sets

For these situations the Linux kernel supports so-called CPU sets. 

The name is a bit misleading（误导） since memory nodes are also covered（覆盖）. 

They also have nothing to do with the cpu_set_t data type.

## cpu 集合接口

The interface to CPU sets is, at the moment, a special filesystem. 

It is usually not mounted (so far at least). 

This can be changed with

```
mount -t cpuset none /dev/cpuset
```

The mount point /dev/cpuset must of course exist at that time. 

The content of this directory is a description of the default (root) CPU set. 

It comprises（包含） initially all CPUs and all memory nodes. 

The cpus file in that directory shows the CPUs in the CPU set, the mems file the memory nodes, the tasks file the processes.

# 创建一个新的 cpu 集合

To create a new CPU set one simply creates a new directory somewhere in the hierarchy（等级关系）. 

The new CPU set will inherit（继承） all settings from the parent. 

Then the CPUs and memory nodes for new CPU set can be changed by writing the new values into the cpus and mems pseudo files in the new directory.

## 如何处理器出于 cpu 集合

If a process belongs to a CPU set, the settings for the CPUs and memory nodes are used as masks for the affinity and memory policy bitmasks. 

That means the program cannot select any CPU in the affinity mask which is not in the cpus file for the CPU set the process is using (i.e., where it is listed in the tasks file). 

Similarly for the node masks for the memory policy and the mems file.

如果进程属于CPU集，则CPU和内存节点的设置将用作关联和内存策略位掩码的掩码。

这意味着程序无法在关联掩码中选择任何CPU，该关联掩码不在cpus文件中，用于进程正在使用的CPU集（即，它在任务文件中列出的位置）。

类似地，对于内存策略和mems文件的节点掩码。

## 程序的性能

The program will not experience any errors unless the bitmasks are empty after the masking, so CPU sets are an almost-invisible means to control program execution.

This method is especially efficient（非常高效） on machines with lots of CPUs and/or memory nodes. 

Moving a process into a new CPU set is as simple as writing the process ID into the tasks file of the appropriate（适当） CPU set.

## cpu 集合对应的文件信息

The directories for the CPU sets contain a number of other files which can be used to specify details like behavior under memory pressure and exclusive（独占） access to CPUs and memory nodes. 

The interested reader is referred to the file Documentation/cpusets.txt in the kernel source tree.

# 参考资料

P75

* any list
{:toc}
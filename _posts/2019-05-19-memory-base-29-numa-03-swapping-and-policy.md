---
layout: post
title: Memory 内存知识-29-NUMA 内存策略与 swapping
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Swapping and Policies

If physical memory runs out, the system has to drop clean pages and save dirty pages to swap. 

The Linux swap implementation discards（丢弃） node information when it writes pages to swap. 

That means when the page is reused and paged in the node which is used will be chosen from scratch（抹掉）. 

The policies for the thread will likely cause a node which is close to the executing processors to be chosen, but the node might be different from the one used before.

该线程的策略可能会导致选择接近执行处理器的节点，但该节点可能与之前使用的节点不同。

## 这种改变意味着什么

This changing association means that the node association cannot be stored by a program as a property of the page. 

The association can change over time. 

For pages which are shared with other processes this can also happen because a process asks for it (see the discussion of mbind below). 

The kernel by itself can migrate pages if one node runs out of space while other nodes still have free space.

Any node association the user-level code learns about can therefore be true for only a short time. 

It is more of a hint than absolute information. 

Whenever accurate（准确） knowledge is required the `get_mempolicy` interface should be used (see section 6.5.5).

# VMA Policy

## 接口

To set the VMA policy for an address range a different interface has to be used:

```c
#include <numaif.h>
long mbind(void *start, unsigned long len,
int mode,
unsigned long *nodemask,
unsigned long maxnode,
unsigned flags);
```

## 接口说明 

This interface registers a new VMA policy for the address range [start, start + len). 

Since memory handling operates on pages the start address must be page-aligned（页对齐）.

The len value is rounded up（四舍五入） to the next page size.

## 参数说明

The mode parameter specifies, again, the policy; the values must be chosen from the list in section 6.5.1. 

As with set_mempolicy, the nodemask parameter is only used for some policies. 

Its handling is identical（相同）.

# mbind 接口的语义

The semantics of the mbind interface depends on the value of the flags parameter. 

By default, if flags is zero, the system call sets the VMA policy for the address range. 

Existing mappings are not affected. 

## 三种标识

If this is not sufficient there are currently three flags to modify this behavior; 

they can be selected individually or together:

- MPOL_MF_STRICT 

The call to mbind will fail if not all pages are on the nodes specified by nodemask. 

In case this flag is used together with MPOL_MF_MOVE and/or MPOL_MF_MOVEALL the call will fail if any page cannot be moved.

- MPOL_MF_MOVE 

The kernel will try to move any page in the address range allocated on a node not in the set specified by nodemask. 

By default, only pages used exclusively by the current process’s page tables are moved.

- MPOL_MF_MOVEALL 

Like MPOL_MF_MOVE but the kernel will try to move all pages, not just those used by the current process’s page tables alone. 

This operation has system-wide implications since it influences the memory access of other processes– which are possibly not owned by the same user as well. 

Therefore MPOL_MF_MOVEALL is a privileged operation (CAP_NICE capability is needed).

### 版本限制

Note that support for MPOL_MF_MOVE and MPOL_MF_MOVEALL was added only in the 2.6.16 Linux kernel.

Calling mbind without any flags is most useful when the policy for a newly reserved address range has to be specified before any pages are actually allocated.

## 代码示例

```c
void *p = mmap(NULL, len,
PROT_READ|PROT_WRITE,
MAP_ANON, -1, 0);
if (p != MAP_FAILED)
mbind(p, len, mode, nodemask, maxnode,
0);
```

This code sequence reserve（保留） an address space range of len bytes and specifies that the policy mode referencing the memory nodes in nodemask should be used. 

Unless the MAP_POPULATE flag is used with mmap, no memory will have been allocated by the time of the mbind call and, therefore, the new policy applies to all pages in that address space region.

## MPOL_MF_STRICT 标识

The MPOL_MF_STRICT flag alone can be used to determine whether any page in the address range described by the start and len parameters to mbind is allocated on nodes other than those specified by nodemask（节点掩码）. 

No allocated pages are changed. 

If all pages are allocated on the specified nodes, the VMA policy for the address space region will be changed according to mode.

# 重平衡内存（MPOL_MF_MOVE）

Sometimes rebalancing of memory is needed, in which case it might be necessary to move pages allocated on one node to another node. 

Calling mbind with MPOL_MF_MOVE set makes a best effort to achieve that. 

Only pages which are solely referenced by the process’s page table tree are considered for moving. 

There can be multiple users in the form of threads or other processes which share that part of the page table tree. 

It is not possible to affect other processes which happen to map the same data. 

These pages do not share the page table entries.

仅考虑由进程的页表树单独引用的页面进行移动。

可以有线程或其他进程形式的多个用户共享页表树的该部分。

不可能影响恰好映射相同数据的其他进程。

这些页面不共享页表条目。

# MPOL_MF_STRICT + MPOL_MF_MOVE

If both the MPOL_MF_STRICT and MPOL_MF_MOVE bits are set in the flags parameter passed to mbind the kernel will try to move all pages which are not allocated on the specified nodes. 

If this is not possible the call will fail. 

Such a call might be useful to determine whether there is a node (or set of nodes) which can house all the pages. 

这样的调用可能有助于确定是否存在可以容纳所有页面的节点（或节点集）。

Several combinations can be tried in succession until a suitable node is found.

The use of MPOL_MF_MOVEALL is harder to justify unless running the current process is the main purpose of the computer. 

The reason is that even pages that appear in multiple page tables are moved. 

That can easily affect other processes in a negative way. 

This operation should thus be used with caution.

可以连续尝试几种组合，直到找到合适的节点。

除非运行当前进程是计算机的主要目的，否则使用MPOL_MF_MOVEALL更难以证明其合理性。

原因是甚至移动了出现在多个页表中的页面。

这很容易以负面的方式影响其他流程。

因此，应谨慎使用此操作。

# 参考资料

P73

* any list
{:toc}
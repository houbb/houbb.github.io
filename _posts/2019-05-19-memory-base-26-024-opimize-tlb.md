---
layout: post
title: Memory 内存知识-26-024-TLB 访问优化
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Optimizing TLB Usage

There are two kinds of optimization of TLB usage. 

## 降低程序使用的 page 数量

The first optimization is to reduce the number of pages a program has to use. 

This automatically results in fewer TLB misses. 

## 降低 TLB 的访问开销

The second optimization is to make the TLB lookup cheaper by reducing the number higher level directory tables which must be allocated. 

Fewer tables means less memory is used which can result in higher cache hit rates for the directory lookup.

# 降低 page 的优化方案

## 降低缺页

The first optimization is closely related to the minimization of page faults. 

We will cover that topic in detail in section 7.5. 

While page faults usually are a one-time cost, TLB misses are a perpetual penalty（永久性的惩罚） given that the TLB cache is usually small and it is flushed frequently.

## 缺页与 cache miss 的影响

Page faults are orders of magnitude（大小） more expensive than TLB misses but, if a program is running long enough and certain parts of the program are executed frequently enough, TLB misses can outweigh even page fault costs.

It is therefore important to regard page optimization not only from the perspective of page faults but also from the TLB miss perspective. 


也就是不单单要注意缺页，还要注意 TLB cache miss 的问题。

The difference is that, while page fault optimizations only require page-wide grouping of the code and data, TLB optimization requires that, at any point in time, as few TLB entries are in use as possible.

不同之处在于，虽然页面错误优化仅需要对代码和数据进行页面范围的分组，但TLB优化要求在任何时间点尽可能少地使用TLB条目。


# 降低 TLB 的访问开销

The second TLB optimization is even harder to control. 

## 文件夹数量的影响因素

The number of page directories which have to be used depends on the distribution of the address ranges used in the virtual address space of the process. 

Widely varying locations in the address space mean more directories.

## ASLR

A complication is that Address Space Layout Randomization (ASLR) leads to exactly these situations. 

The load addresses of stack, DSOs, heap, and possibly executable are randomized at runtime to prevent attackers of the machine from guessing the addresses of functions or variables.

复杂的是地址空间布局随机化（ASLR）导致了这些情况。

堆栈，DSO，堆和可执行文件的加载地址在运行时随机化，以防止机器的攻击者猜测函数或变量的地址。

- 性能与安全的权衡

很多时候，追求性能和追求安全是相互违背的。

## 二者如何取舍

Only if maximum performance is critical ASLR should be turned off. 

只有在最高性能至关重要时，才应关闭ASLR。

The costs of the extra directories is low enough to make this step unnecessary in all but a few extreme cases. 

One possible optimization the kernel could at any time perform is to ensure that a single mapping does not cross the address space boundary between two directories. 

This would limit ASLR in a minimal fashion but not enough to substantially weaken it.

内核可以在任何时间执行的一种可能的优化是确保单个映射不跨越两个目录之间的地址空间边界。

这将以极小的方式限制ASLR，但不足以大幅削弱它。

## 开发者能够做什么

The only way a programmer is directly affected by this is when an address space region is explicitly（明确地） requested.

This happens when using mmap with `MAP_FIXED`. 

Allocating new a address space region this way is very dangerous and hardly ever done. 

It is possible, though, and, if it is used and the addresses can be freely chosen, the programmer should know about the boundaries of the last level page directory and select the requested address appropriately.

以这种方式分配新的地址空间区域是非常危险的，并且几乎没有完成。

但是，如果使用它并且地址可以自由选择，程序员应该知道最后一级页面目录的边界并适当地选择所请求的地址。

# 参考资料

P59

* any list
{:toc}
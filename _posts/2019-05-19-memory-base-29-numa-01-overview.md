---
layout: post
title: Memory 内存知识-29-NUMA 概览
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# NUMA

For NUMA programming everything said so far about cache optimizations applies as well. 

The differences only start below that level. 

NUMA introduces different costs when accessing different parts of the address space. 

With uniform memory access we can optimize to minimize page faults (see section 7.5) but that is about it. 

All pages are created equal.

# NUMA 带来的变化

NUMA changes this. 

Access costs can depend on the page which is accessed. 

Differing access costs also increase the importance of optimizing for memory page locality. 

NUMA is inevitable for most SMP machines since both Intel with CSI (for x86,x86-64, and IA-64) and AMD (for Opteron) use it. 

对于大多数SMP机器而言，NUMA是不可避免的，因为英特尔与CSI（用于x86，x86-64和IA-64）和AMD（用于Opteron）都使用它。

With an increasing number of cores per processor we are likely to see a sharp reduction of SMP systems being used (at least outside data centers and offices of people with terribly high CPU usage requirements). 

Most home machines will be fine with just one processor and hence no NUMA issues. 

But this 

a) does not mean programmers can ignore NUMA and 

b) it does not mean there are not related issues.

## 思想拓展到处理器缓存

If one thinks about generalizations（概括） toNUMAone quickly realizes the concept extends to processor caches as well.

Two threads on cores using the same cache will collaborate faster than threads on cores not sharing a cache. 

This is not a fabricated case:

如果人们想到概括（概括）到NuMAone很快意识到概念也扩展到处理器缓存。

使用相同缓存的核心上的两个线程将比不共享缓存的核心上的线程协作更快。

（1）early dual-core processors had no L2 sharing.

（2）Intel’s Core 2 QX 6700 and QX 6800 quad core chips, for instance, have two separate L2 caches.

（3）as speculated early, with more cores on a chip and the desire to unify caches, we will have more levels of caches.

# 多级缓存与 NUMA 的相同问题

Caches form their own hierarchy（等级制度）; 

placement of threads on cores becomes important for sharing (or not) of the various caches. 

在核心上放置线程对于共享（或不共享）各种缓存非常重要。

This is not very different from the problems NUMA is facing and, therefore, the two concepts can be unified. 

Even people only interested in non-SMP machines should therefore read this section.


# Linux 内核提供的方法

In section 5.3 we have seen that the Linux kernel provides a lot of information which is useful–and needed–in NUMA programming. 

Collecting this information is not that easy, though. 

The currently available NUMA library on Linux is wholly inadequate（完全不足） for this purpose.

A much more suitable version is currently under construction by the author.

The existing NUMA library, libnuma, part of the numactl package, provides no access to system architecture information. 

It is only a wrapper around the available system calls together with some convenience interfaces for commonly used operations. 

## 当今 linux 系统命令

The system calls available on Linux today are:

- mbind 

Select binding of specified memory pages.

- set_mempolicy 

Set the default memory binding policy.

- get_mempolicy 

Get the default memory binding policy.

- migrate_pages 

Migrate all pages of a process on a

- given 

set of nodes to a different set of nodes.

- move_pages 

Move selected pages to given node or request node information about pages.


These interfaces are declared in the `<numaif.h>` header which comes along with the libnuma library. 

Before we go into more details we have to understand the concept of memory policies.

# NUMA 简介

NUMA（Non Uniform Memory Access Architecture）技术可以使众多服务器像单一系统那样运转，同时保留小系统便于编程和管理的优点。

基于电子商务应用对内存访问提出的更高的要求，NUMA也向复杂的结构设计提出了挑战。

非统一内存访问（NUMA）是一种用于多处理器的电脑记忆体设计，内存访问时间取决于处理器的内存位置。 

在NUMA下，处理器访问它自己的本地存储器的速度比非本地存储器（存储器的地方到另一个处理器之间共享的处理器或存储器）快一些。

NUMA架构在逻辑上遵循对称多处理（SMP）架构。 

它是在二十世纪九十年代被开发出来的，开发商包括Burruphs （优利系统）， Convex Computer（惠普），意大利霍尼韦尔信息系统（HISI）的（后来的Group Bull），Silicon Graphics公司（后来的硅谷图形），Sequent电脑系统（后来的IBM），通用数据（EMC）， Digital （后来的Compaq ，HP）。 

这些公司研发的技术后来在类Unix操作系统中大放异彩，并在一定程度上运用到了Windows NT中。

# 参考资料

P73

[numa](https://baike.baidu.com/item/NUMA/6906025)

* any list
{:toc}
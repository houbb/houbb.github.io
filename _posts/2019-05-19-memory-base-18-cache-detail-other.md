---
layout: post
title: Memory 内存知识-18-缓存实现的细节之其他
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Other Details

So far we talked about the address as consisting of threeparts, tag, set index, and cache line offset. 

But what address is actually used? All relevant processors today provide virtual address spaces to processes, which means that there are two different kinds of addresses: virtual and physical.

ps: 只有两种地址：虚拟和物理。虚拟只是物理的映射而已。

## 虚拟地址的问题

The problem with virtual addresses is that they are not unique. 

A virtual address can, over time, refer to different physical memory addresses. 

The same address in different processes also likely refers to different physical addresses. 

So it is always better to use the physical memory address, right?

ps: 相同的虚拟地址，可能在不同时间映射的物理地址。

这反而让人感觉直接用物理地址更加方便？

## MMU 内存管理单元

The problem here are the virtual addresses used during execution which must to be translated with the help of the Memory Management Unit (MMU) into physical addresses.

This is a non-trivial（不平凡的） operation. 

In the pipeline to execute an instruction the physical address might only be available at a later stage. 

This means that the cache logic has to be very quick in determining（确认） whether the memory location is cached. 

If virtual addresses could be used the cache lookup can happen much earlier in the pipeline and in case of a cache hit the memory content can be made available. 

The result is that more of the memory access costs could be hidden by the pipeline.

ps: 这是一种预先缓存的方式，（如果缓存命中）可以将内存访问的开销隐藏掉。

# processor 设计

Processor designers are currently using virtual address tagging for the first level caches. 

These caches are rather small and can be cleared without too much pain（痛苦）.

ps: 清理很方便，反之，一级缓存能存储的信息也非常有限。

## 局部刷新

At least partial clearing the cache is necessary if the page table tree of a process changes. 

It might be possible to avoid a complete flush if the processor has an instruction which allows to specify the virtual address range which has changed. 

Given the low latency of L1i and L1d caches (~ 3 cycles) using virtual addresses is almost mandatory（强制性）.

## L2 L3

For larger caches including L2, L3, . . . caches physical address tagging is needed. 

These caches have a higher latency and the virtual physical address translation can finish in time（及时）. 

Because these caches are larger (i.e., a lot of information is lost when they are flushed) and refilling them takes a long time due to the main memory access latency, flushing them often would be costly.

ps: L2/L3 刷新和再次填充花费的时间较多。

## 地址处理

It should, in general, not be necessary to know about the details of the address handling in those caches. 

They cannot be changed and all the factors which would influence the performance are normally something which should be avoided or is associated with high cost. 

Overflowing（满溢） the cache capacity is bad and all caches run into problems early if the majority of the used cache lines fall into the same set. 

The latter can be avoided with virtually addressed caches but is impossible for user-level processes to avoid for caches addressed using physical addresses.

The only detail one might want to keep in mind is to not map the same physical memory location to two or more virtual addresses in the same process, if at all possible.

## 其他细节

Another detail of the caches which is rather uninterestingto（不感兴趣） programmers is the cache replacement strategy.

Most caches evict the Least Recently Used (LRU) element first. 

This is always a good default strategy. 

With larger associativity (and associativity might indeed grow further in the coming years due to the addition of more cores) maintaining the LRU list becomes more and more expensive and we might see different strategies adopted.

## 缓存替换

As for the cache replacement there is not much a programmer can do. 

If the cache is using physical address tags there is no way to find out how the virtual addresses correlate with the cache sets. 

It might be that cache lines in all logical pages are mapped to the same cache sets, leaving much of the cache unused. 

If anything, it is the job of the OS to arrange that this does not happen too often.

如果缓存使用物理地址标记，则无法找出虚拟地址如何与缓存集相关联。

可能是所有逻辑页面中的高速缓存行都映射到相同的高速缓存集，从而使大部分高速缓存未被使用。

如果有的话，操作系统的工作就是安排这种情况不会经常发生。

## 虚拟化

With the advent of virtualization（虚拟化） things get even more complicated. 

Now not even the OS has control over the assignment of physical memory. 

The Virtual Machine Monitor (VMM, aka Hypervisor) is responsible for the physical memory assignment.

The best a programmer can do is to a) use logical memory pages completely and b) use page sizes as large as meaningful to diversify the physical addresses as much as possible. 

Larger page sizes have other benefits, too, but this is another topic.

# 参考资料

P31

* any list
{:toc}
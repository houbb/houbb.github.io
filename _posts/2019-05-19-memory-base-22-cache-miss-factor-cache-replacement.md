---
layout: post
title: Memory 内存知识-22-影响缓存命中的因素之缓存替换
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Cache Placement

Where the caches are placed in relationship to the hyperthreads（超级线程）, cores, and processors is not under control of the programmer. 

But programmers can determine（确认） where the threads are executed and then it becomes important how the caches relate to the used CPUs.

Here we will not go into details of when to select what cores to run the threads. 

We will only describe architecture details which the programmer has to take into account（考虑到） when setting the affinity（亲和力） of the threads.


# 超级线程

Hyper-threads, by definition share everything but the register set. 

This includes the L1 caches. 

There is not much more to say here. 

The fun starts with the individual cores（个别核心） of a processor. 

Each core has at least its own L1 caches. 

## 共同点

Aside from this there are today not many details in common:

除此之外，今天没有太多共同点：

（1）Early multi-core processors had no shared caches at all.

（2）Later Intel models have shared L2 caches for dualcore（双核） processors. 

For quad-core processors we have to deal with separate L2 caches for each pair of two cores. 

There are no higher level caches.

（3）AMD’s family 10h processors have separate L2 caches and a unified L3 cache.


# 不使用共享内存的优点

A lot has been written in the propaganda（宣传） material of the processor vendors about the advantage of their respective models. 

Having no shared cache has an advantage if the working sets handled by the cores do not overlap（交叠）.

This works well for single-threaded programs. 

Since this is still often the reality today this approach does not perform too badly. 

But there is always some overlap.

The caches all contain the most actively used parts of the common runtime libraries which means some cache space is wasted.

## 完全共享内存

Completely sharing all caches beside L1 as Intel’s dualcore processors（双核处理器） do can have a big advantage.

If the working set of the threads working on the two cores overlaps significantly（显著） the total available cache memory is increased and working sets can be bigger without performance degradation（降解）. 

If the working sets do not overlap Intel’s Advanced Smart Cache management is supposed to prevent any one core from monopolizing（垄断） the entire cache.

## 每个核各用一半带来的问题

If both cores use about half the cache for their respective（各自的） working sets there is some friction（摩擦）, though.

The cache constantly has to weigh the two cores’ cache use and the evictions（驱逐） performed as part of this rebalancing might be chosen poorly. 

To see the problems we look at the results of yet another test program.


# 问题的测试程序

## 程序背景

The test program has one process constantly reading or writing, using SSE instructions, a 2MB block of memory.

2MB was chosen because this is half the size of the L2 cache of this Core 2 processor. 

The process is pinned（固定） to one core while a second process is pinned to the other core. 

This second process reads and writes a memory region of variable size. 

## 图表达了什么

The graph shows the number of bytes per cycle which are read or written. 

Four different graphs are shown, one for each combination of the processes reading and writing. 

The read/write graph is for the background process, which always uses a 2MB working set to write, and the measured process with variable
working set to read.

![image](https://user-images.githubusercontent.com/18375710/62756388-29ccb900-baaa-11e9-988a-fb29dd08728b.png)

## 值得注意的地方

The interesting part of the graph is the part between 2^20 and 2^23 bytes. 

If the L2 cache of the two cores were completely separate we could expect that the performance of all four tests would drop between 2^21 and 2^22 bytes, that means, once the L2 cache is exhausted. 

As we can see in Figure 3.31 this is not the case. 

For the cases where the background process is writing this is most visible.

The performance starts to deteriorate before the working set size reaches 1MB. 

The two processes do not share memory and therefore the processes do not cause RFO messages to be generated. 

ps: 不共享内存，就需要使用 RFO 进行信息的同步。

These are pure cache eviction problems. 

The smart cache handling has its problems with the effect that the experienced cache size per core is closer to 1MB than the 2MB per core which are available.

One can only hope that, if caches shared between cores remain a feature of upcoming（即将到来） processors, the algorithm used for the smart cache handling will be fixed.

## 四核处理器

Having a quad-core（四核） processor with two L2 caches was just a stop-gap（权宜） solution before higher-level caches could be introduced. 

This design provides no significant（重大） performance advantage over separate sockets and dual-core processors. 

The two cores communicate via the same bus which is, at the outside, visible as the FSB. 

There is no special fast-track（快速通道） data exchange.

## 未来的设计

The future of cache design for multi-core processors will lie in more layers. 

AMD’s 10h processor family makes the start. 

Whether we will continue to see lower level caches be shared by a subset of the cores of a processor remains to be seen (in the 2008 generation of processors L2 caches are not shared). 

The extra levels of cache are necessary since the high-speed and frequently used caches cannot be shared among many cores. 

The performance would be impacted（影响）. 

It would also require very large caches with high associativity（关联）. 

Both numbers, the cache size and the associativity, must scale with the number of cores sharing the cache. 

Using a large L3 cache and reasonably-sized L2 caches is a reasonable trade-off.

The L3 cache is slower but it is ideally not as frequently used as the L2 cache.

# 调度决策

For programmers all these different designs mean complexity（复杂） when making scheduling（调度） decisions. 

One has to know the workloads（工作负载） and the details of the machine architecture to achieve the best performance. 

Fortunately we have support to determine the machine architecture. 

The interfaces will be introduced in later sections.

# 参考资料

P34

* any list
{:toc}
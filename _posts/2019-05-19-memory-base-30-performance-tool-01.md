---
layout: post
title: Memory 内存知识-30-性能工具
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Memory Performance Tools

A wide variety of tools is available to help programmers understand performance characteristics of a program, the cache and memory use among others. 

Modern processors have performance monitoring hardware that can be used. 

Some events are hard to measure exactly, so there is also room for simulation. 

When it comes to higherlevel functionality, there are special tools to monitor the execution of a process. 

We will introduce a set of commonly used tools available on most Linux systems.

# Memory Operation Profiling（剖析）

Profiling memory operations requires collaboration from the hardware. 

It is possible to gather some information in software alone, but this is either coarse-grained or merely a simulation. 

Examples of simulation will be shown in section 7.2 and 7.5. 

Here we will concentrate on（专注于） measurable memory effects.

## 如何访问 linux 的性能监控

Access to performance monitoring hardware on Linux is provided by oprofile. 

Oprofile provides continuous profiling capabilities as first described in; 

it performs statistical（统计）, system-wide profiling with an easy-to-use interface.

Oprofile is by no means the only way the performance measurement functionality of processors can be used; 

Linux developers are working on pfmon which might at some point be sufficiently widely deployed to warrant（保证） being described here, too.

## 接口

The interface oprofile provides is simple and minimal but also pretty low-level, even if the optional GUI is used.

The user has to select among the events the processor can record. 

The architecture manuals for the processors describe the events but, oftentimes, it requires extensive knowledge about the processors themselves to interpret（翻译） the data. 

Another problem is the interpretation of the collected data. 

The performance measurement counters are absolute values and can grow arbitrarily（任意）. 

How high is too high for a given counter?


## 部分答案

A partial answer to this problem is to avoid looking at the absolute values and, instead, relate multiple counters to each other. 

Processors can monitor more than one event; 

the ratio of the collected absolute values can then be examined. 

This gives nice, comparable results. 

Often the divisor is a measure of processing time, the number of clock cycles or the number of instructions. 

As an initial stab at program performance, relating just these two numbers by themselves is useful.

对此问题的部分答案是避免查看绝对值，而是将多个计数器相互关联。

处理器可以监控多个事件;

然后可以检查所收集的绝对值的比率。

这给出了很好的，可比的结果。

除数通常是处理时间，时钟周期数或指令数量的度量。

作为程序性能的初步尝试，仅将这两个数字相关联是有用的。


# CPI 信息

Figure 7.1 shows the Cycles Per Instruction (CPI) for the simple random “Follow” test case for the various working set sizes. 

The names of the events to collect this information for most Intel processor are CPU_CLK_UNHALTED and INST_RETIRED. 

As the names suggest, the former counts the clock cycles of the CPU and the latter the number of instructions. 

We see a picture similar to the cycles per list element measurements we used. 

For small working set sizes the ratio is 1.0 or even lower. 

![image](https://user-images.githubusercontent.com/18375710/63990170-9a00b480-cb15-11e9-97a8-853290594811.png)

These measurements were made on a Intel Core 2 processor, which is multi-scalar（多标量） and can work on several instructions at once. 

For a program which is not limited by memory bandwidth, the ratio can be significantly below 1.0 but, in this case, 1.0 is pretty good.


### L1d 内存不够用时

Once the L1d is no longer large enough to hold the working set, the CPI jumps to just below 3.0. 

Note that the CPI ratio averages the penalties（处罚） for accessing L2 over all instructions, not just the memory instructions. 

Using the cycles for list element data, it can be worked out how many instructions per list element are needed. 

If even the L2 cache is not sufficient, the CPI ratio jumps to more than 20. 

These are expected results.

## 性能测量工具

But the performance measurement counters are supposed to give more insight into what is going on in the processor.

For this we need to think about processor implementations. 

In this document, we are concerned with cache handling details, so we have to look at events related to the caches. 

These events, their names, and what they count, are processor–specific（特定于处理器的）. 

This is where oprofile is currently hard to use, irrespective（不管） of the simple user interface: the user has to figure out the performance counter details by her/himself. 

In Appendix B we will see details about some processors.


# 2核处理器

For the Core 2 processor the events to look for are L1D_REPL, DTLB_MISSES, and L2_LINES_IN. 

The latter can measure both all misses and misses caused by instructions instead of hardware prefetching. 

The results for the random “Follow” test can be seen in Figure 7.2.

![image](https://user-images.githubusercontent.com/18375710/63993920-31213880-cb25-11e9-8296-06af48239d6d.png)

All ratios are computed using the number of retired instructions (INST_RETIRED). 

This means that to compute the cache miss rate all the load and store instructions a substantial（大量） number has to be subtracted（扣除） from the INST_RETIRED value which means the actual cache miss rate of the memory operation is even higher than the numbers shown in the graph.

这意味着为了计算所有加载和存储指令的高速缓存未命中率，必须从INST_RETIRED值中减去大量数量，这意味着存储器操作的实际高速缓存未命中率甚至高于所示的数量。 在图中。

## 比率

All ratios are computed using the number of retired instructions (INST_RETIRED). 

This means that to compute the cache miss rate all the load and store instructions a substantial number has to be subtracted from the INST_RETIRED value which means the actual cache miss rate of the memory operation is even higher than the numbers shown in the graph.

所有比率均使用退役指令数（INST_RETIRED）计算。

这意味着为了计算所有加载和存储指令的高速缓存未命中率，必须从INST_RETIRED值中减去相当大的数量，这意味着存储器操作的实际高速缓存未命中率甚至高于图中所示的数量。


The L1d misses tower over all the others since an L2 miss implies（暗示）, for Intel processors, an L1d miss due to the use of inclusive caches. 

The processor has 32k of L1d and so we see, as expected, the L1d rate go up from zero at about that working set size (there are other uses of the cache beside the list data structure, which means the increase happens between the 16k and 32k mark). 

It is interesting to see that the hardware prefetching can keep the miss rate at 1% for a working set size up to and including 64k.

After that the L1d rate skyrockets（一飞冲天）.

## L2 cache miss 比例

The L2 miss rate stays zero until the L2 is exhausted;

the few misses due to other uses of L2 do not influence the numbers much. 

Once the size of L2 (221 bytes) is exceeded, the miss rates rise. 

It is important to notice that the L2 demand（需求） miss rate is nonzero. 

This indicates that the hardware prefetcher does not load all the cache lines needed by instructions later. 

This is expected, the randomness of the accesses prevents perfect prefetching.

这是预期的，访问的随机性阻止了完美的预取。

Compare this with the data for the sequential read in Figure 7.3.

![image](https://user-images.githubusercontent.com/18375710/63994055-c6bcc800-cb25-11e9-8629-7a218e654bc5.png)

### 顺序访问

In this graph we can see that the L2 demand miss rate is basically zero (note the scale of this graph is different from Figure 7.2). 

For the sequential access case, the hardware prefetcher works perfectly: 

almost all L2 cache misses are caused by the prefetcher. 

The fact that the L1d and L2 miss rates are the same shows that all L1d cache misses are handled by the L2 cache without further delays.

This is the ideal case for all programs but it is, of course, hardly ever achievable.

TODO...


# 参考资料

P77

* any list
{:toc}
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

### data TLB 

The fourth line in both graphs is the DTLB miss rate (Intel has separate TLBs for code and data, DTLB is the data TLB). 

将指令和数据分开，是一种很棒的优化思路。

For the random access case, the DTLB miss rate is significant and contributes（重要且有贡献） to the delays. 

What is interesting is that the DTLB penalties（处罚） set in before the L2 misses. 

For the sequential access case the DTLB costs are basically zero.

顺序访问会使得预取可以工作的很好。


# 回顾历史例子

Going back to the matrix multiplication（矩阵乘法） example in section 6.2.1 and the example code in section A.1, we can make use of three more counters. 

The SSE_HIT_PRE, SSE_PRE_MISS, and LOAD_PRE_EXEC counters can be used to see how effective the software prefetching is. 

If the code in section A.1 is run we get the following results:

| Description |   Ratio |
|:---|:---|
| Useful NTA prefetches | 2.84% |
| Late NTA prefetches |   2.65% |


## NTA 预取比例信息

The low late NTA prefetch ratio is misleading. 

The ratio means that 2.65% of all prefetch instructions are issued too late. 

The instruction which needs the data is executed before the data could be prefetched into the cache.

It must be kept in mind that only 2:84% + 2:65% = 5:5% of the prefetch instructions were of any use. 

Of the NTA prefetch instructions which are useful, 48% did not finish in time. 

The code therefore can be optimized further:

（1）most of the prefetch instructions are not needed.

（2） the use of the prefetch instruction can be adjusted to match the hardware better.

It is left as an exercise to the reader to determine the best solution for the available hardware. 

The exact hardware specification plays a big role. 

On Core 2 processors the latency of the SSE arithmetic operations is 1 cycle. 

Older versions had a latency of 2 cycles, meaning that the hardware prefetcher and the prefetch instructions had more time to bring in the data.

在Core 2处理器上，SSE算术运算的延迟为1个周期。

旧版本的延迟为2个周期，这意味着硬件预取器和预取指令有更多时间来引入数据。

# 如何判断是否需要预取

To determine where prefetches might be needed–or are unnecessary–one can use the opannotate program. 

It lists the source or assembler code of the program and shows the instructions where the event was recognized. 

## 两点注意点

Note that there are two sources of vagueness（暧昧，含糊；茫然;）:


（1） Oprofile performs stochastic profiling. （随机的资料收集）

Only every Nth event (where N is a per-event threshold with an enforced minimum) is recorded to avoid slowing down operation of the system too much. 

There might be lines which cause 100 events and yet they might not show up in the report.

仅记录每个第N个事件（其中N是具有强制最小值的每事件阈值）以避免过多地减慢系统的操作。

可能存在导致100个事件的行，但它们可能不会显示在报告中。

ps: 这是一种采样的统计思想，避免统计对于性能的过渡消耗。

（2） Not all events are recorded accurately（记录准确）. 

For example, the instruction counter at the time a specific event was recorded might be incorrect. 

Processors being multi-scalar（多标量） makes it hard to give a 100% correct answer. 

A few events on some processors are exact, though.

多标量的执行环境，会导致结果的不准确性。


# 预取的注意列表

The annotated listings are useful for more than determining the prefetching information. 

Every event is recorded with the instruction pointer; it is therefore also possible to pinpoint other hot spots in the program. 

每个事件都用指令指针记录; 因此，也可以确定程序中的其他热点。

Locations which are the source of many INST_RETIRED events are executed frequently and deserve to be tuned. 

Locations where many cache misses are reported might warrant（保证） a prefetch instruction to avoid the cache miss.

One type of event which can be measured without hardware support is page faults. 

The OS is responsible for resolving page faults and, on those occasions, it also counts them. 

操作系统负责解决页面错误，在这种情况下，它也会对它们进行计数。

## 缺页类型

It distinguishes（区分） two kinds of page faults:

### Minor Page Faults 

For anonymous (i.e., not backed by a file) pages which have not been used so far, for copy-on-write pages, and for other pages whose
content is already in memory somewhere.

### Major Page Faults 

Resolving them requires access to disk to retrieve the file-backed (or swapped-out) data.

解析它们需要访问磁盘以检索文件支持（或换出）的数据。

Obviously, major page faults are significantly more expensive than minor page faults. 

But the latter are not cheap either. 

这两种缺页的代价都非常的大。

In either case an entry into the kernel is necessary, a new page must be found, the page must be cleared or populated with the appropriate data, and the page table tree must be modified accordingly（从尔，于是）. 

The last step requires synchronization with other tasks reading or modifying the page table tree, which might introduce further
delays.

一旦需要把明细加载到内核，那就需要去更新数据，以及 page table tree。

更新的过程又涉及到锁，保证并发的数据安全。

# 获取缺页统计的工具

The easiest way to retrieve（取回，恢复） information about the page fault counts is to use the time tool. 

Note: use the real tool, not the shell builtin. 

The output can be seen as following.

```
$ \time ls /etc
[...]
0.00user 0.00system 0:00.02elapsed 17%CPU (0avgtext+0avgdata 0maxresident)k
0inputs+0outputs (1major+335minor)pagefaults 0swaps
```

The interesting part here is the last line. 

The time tool reports one major and 335 minor page faults. 

The exact numbers vary; in particular, repeating the run immediately will likely show that there are now no major page faults at all. 

If the program performs the same action, and nothing changes in the environment, the total page fault count will be stable.

具体数字各不相同; 特别是，立即重复运行可能会显示现在根本没有主要的缺页。

如果程序执行相同的操作，并且环境中没有任何更改，则总缺页计数将保持稳定。


## 程序启动阶段

An especially sensitive phase with respect to page faults is program start-up. 

Each page which is used will produce a page fault; the visible effect (especially for GUI applications) is that the more pages that are used, the longer it takes for the program to start working. 

In section 7.5 we will see a tool to measure this effect specifically.

## 时间统计工具类

Under the hood, the time tool uses the rusage functionality. 

The *wait4* system call fills in a struct rusage object when the parent waits for a child to terminate;

that is exactly what is needed for the time tool. 

# 开发者如何指定

But it is also possible for a process to request information about its own resource usage (that is where the name rusage comes from) or the resource usage of its terminated children.

## 函数

```c
#include <sys/resource.h>
int getrusage(__rusage_who_t who,
struct rusage *usage)
```

### 参数简介

The who parameter specifies which process the information is requested for. 

Currently, only RUSAGE_SELF and RUSAGE_CHILDREN are defined. 

The resource usage of the child processes is accumulated when each child terminates.

It is a total value, not the usage of an individual child process. 

Proposals to allow requesting thread specific information exist, so it is likely that we will see RUSAGE_THREAD in the near future. 

The rusage structure is defined to contain all kinds of metrics, including execution time, the number of IPC messages sent and memory used, and the number of page faults. 

The latter information is available in the *ru_minflt* and *ru_majflt* members of the structure.


A programmer who tries to determine where her program loses performance due to page faults could regularly request the information and then compare the returned values with the previous results.

程序员试图确定程序因页面错误而失去性能的位置，可以定期请求信息，然后将返回的值与之前的结果进行比较。

From the outside, the information is also visible if the requester has the necessary privileges. 

The pseudo file `/proc/<PID>/stat`, where `<PID>` is the process ID of the process we are interested in, contains the page fault
numbers in the tenth to fourteenth fields. 

They are pairs of the process’s and its children’s cumulative minor and major page faults, respectively.

# 参考资料

P77

- other

[Linux代码性能检测利器（四）- 获取分析结果](https://blog.csdn.net/fenghaibo00/article/details/17249833)

* any list
{:toc}
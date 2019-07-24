---
layout: post
title: Memory 内存知识-07-cpu caches
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# CPU Caches

## RAM 与 memory 之间的速度差异

CPUs are today much more sophisticated（复杂） than they were only 25 years ago. 

In those days, the frequency of the CPU core was at a level equivalent to that of the memory bus. 

Memory access was only a bit slower than register access. 

ps: 内存访问，仅次于寄存器访问。

But this changed dramatically（显著） in the early 90s, when CPU designers increased the frequency of the CPU core but the frequency of the memory bus and the performance of RAM chips did not increase proportionally（按比例的）.

ps: 速度之间的差异，内存访问提升，但是 RAM 芯片没有同步提升。

This is not due to the fact that faster RAM could not be built, as explained in the previous section. 

It is possible but it is not economical（经济）.

RAM as fast as current CPU cores is orders of magnitude（大小） more expensive than any dynamic RAM.

ps: RAM 之所以会比较慢，主要是因为 SRAM 价格昂贵导致的。出于经济性的考虑。

## 二级存储

If the choice is between a machine with very little, very fast RAM and a machine with a lot of relatively fast RAM, 
the second will always win given a working set size which exceeds（超越，超出） the small RAM size and the cost of accessing secondary storage（二级存储） media such as hard drives（硬件驱动）.

The problem here is the speed of secondary storage, usually hard disks, which must be used to hold the swapped out part of the working set. 

Accessing those disks is orders of magnitude（大小） slower than even DRAM access.

## 使用一部分 SRAM

Fortunately it does not have to be an all-or-nothing（非此即彼，非黑即白） decision.

A computer can have a small amount of high-speed SRAM in addition to the large amount of DRAM. 

One possible implementation would be to dedicate a certain area of the address space of the processor as containing the SRAM and the rest the DRAM. 

The task of the operating system would then be to optimally distribute data to make use of the SRAM. 

Basically, the SRAM serves in this situation as an extension（延期，拓展） of the register set of the processor.

While this is a possible implementation it is not viable.

## 资源管理的开销

Ignoring the problem of mapping the physical resources of such SRAM-backed memory to the virtual address
spaces of the processes (which by itself is terribly hard（太难）) this approach would require each process to administer
in software the allocation of this memory region. 

ps: 物理地址和虚拟地址的映射。

The size of the memory region can vary from processor to processor (i.e., processors have different amounts of the
expensive SRAM-backed memory). 

Each module which makes up part of a program will claim its share of the fast memory, which introduces additional costs through
synchronization requirements（同步要求）. 

In short, the gains（收益） of having fast memory would be eaten up completely by the overhead of administering the resources.

ps: 资源管理的开销可能把性能提升的收益全部抵消掉。

## 替代的方案

So, instead of putting the SRAM under the control of the OS or user, it becomes a resource which is transparently（透明） used and administered by the processors. 

In this mode, SRAM is used to make temporary（临时） copies of (to cache, in other words) data in main memory which is likely to be used soon by the processor. 

This is possible because program code and data has temporal and spatial locality（时空局限性）. 

This means that, over short periods of time, there is a good chance that the same code or data gets reused. 

For code this means that there are most likely loops in the code so that the same code gets executed over and over again (the perfect case for spatial locality).

Data accesses are also ideally（理想的） limited to small regions.

Even if the memory used over short time periods is not close together there is a high chance that the same data will be reused before long (temporal locality（时间局部性）). 

For code this means, for instance, that in a loop a function call is made and that function is located else where in the address space.

The function may be distant in memory, but calls to that function will be close in time. 

For data it means that the total amount of memory used at one time (the working set size) is ideally limited but the memory used, as a result of the random access nature of RAM, is not close together. 

Realizing that locality exists is key to the concept of CPU caches as we use them today.

## Cache 的性能提升

A simple computation can show how effective caches can theoretically be. 

Assume access to main memory takes 200 cycles and access to the cache memory take 15 cycles. 

Then code using 100 data elements 100 times each will spend 2,000,000 cycles on memory operations if there is no cache and only 168,500 cycles if all data can be cached. 

That is an improvement of 91.5%.

## 主存与 SRAM 对于 cache 的使用情况

The size of the SRAM used for caches is many times smaller than the main memory. 

In the author’s experience with workstations with CPU caches the cache size has always been around 1/1000th of the size of the main
memory (today: 4MB cache and 4GB main memory).

This alone does not constitute（构成） a problem. 

If the size of the working set (the set of data currently worked on) is smaller than the cache size it does not matter. 

But computers do not have large main memories for no reason.

The working set is bound to be larger than the cache. 

This is especially true for systems running multiple processes where the size of the working set is the sum of the
sizes of all the individual processes and the kernel.

## 需要有好的缓存策略

What is needed to deal with the limited size of the cache is a set of good strategies to determine what should be
cached at any given time. 

Since not all data of the working set is used at exactly the same time we can use techniques to temporarily replace some data in the cache with others. 

And maybe this can be done before the data is actually needed. 

This prefetching（预取） would remove some of the costs of accessing main memory since it happens asynchronously with respect to the execution of the program.

All these techniques and more can be used to make the cache appear bigger than it actually is. 

We will discuss them in section 3.3. 

Once all these techniques are exploited it is up to the programmer to help the processor.

How this can be done will be discussed in section 6.



# 参考资料

[cpumemory.pdf-13](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

* any list
{:toc}
---
layout: post
title: Memory 内存知识-21-影响缓存命中的因素之关键词加载
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Critical Word Load（关键词加载）

Memory is transferred from the main memory into the caches in blocks which are smaller than the cache line size. 

Today 64 bits are transferred at once and the cache line size is 64 or 128 bytes. 

This means 8 or 16 transfers per cache line are needed.

The DRAM chips（DRAM芯片） can transfer those 64-byte blocks in burst mode. 

This can fill the cache line without any further commands from the memory controller and the possibly associated（相关） delays. 

If the processor prefetches（预取） cache lines this is probably the best way to operate.

If a program’s cache access of the data or instruction caches misses (that means, it is a compulsory cache miss, because the data is used for the first time, or a capacity cache miss, because the limited cache size requires eviction of the cache line) the situation is different. 

如果程序对数据或指令缓存的缓存访问未命中（这意味着它是强制缓存未命中，因为数据是第一次使用，或容量缓存未命中，因为有限的缓存大小需要驱逐缓存行 ）情况有所不同。

The word inside the cache line which is required for the program to continue might not be the first word in the cache line.

Even in burst mode and with double data rate transfer the individual 64-bit blocks arrive at noticeably different times. 

Each block arrives 4 CPU cycles or more later than the previous one. 

If the word the program needs to continue is the eighth of the cache line the program has to wait an additional 30 cycles or more after the first word arrives.

程序继续执行所需的缓存行内的字可能不是缓存行中的第一个字。

即使在突发模式和双数据速率传输中，各个64位模块也会在明显不同的时间到达。

每个块比前一个块到达4个CPU周期或更多。

如果程序需要继续的单词是高速缓存行的第八个，则程序必须在第一个单词到达后再等待30个或更多周期。

## 关键词第一次&早期重启

Things do not necessarily have to be like this. 

The memory controller is free to request the words of the cache line in a different order. 

The processor can communicate which word the program is waiting on, the critical word, and the memory controller can request this word first.

Once the word arrives the program can continue while the rest of the cache line arrives and the cache is not yet in a consistent（一贯） state. 

This technique is called Critical Word First & Early Restart.

### 当今处理器

Processors nowadays implement this technique but there are situations when that is not possible. 

If the processor prefetches data the critical word is not known. 

Should the processor request the cache line during the time the prefetch operation is in flight it will have to wait until the
critical word arrives without being able to influence the order.

# 顺序与随机访问性能

![image](https://user-images.githubusercontent.com/18375710/62750506-00ecf980-ba93-11e9-9429-80b98a17b061.png)

Even with these optimizations in place the position of the critical word on a cache line matters. 

Figure 3.30 shows the Follow test for sequential and random access. 

Shown is the slowdown of running the test with the pointer used in the chase in the first word versus（与） the case when the pointer is in the last word. 

The element size is 64 bytes, corresponding（符合，对应） the cache line size. 

The numbers are quite noisy but it can be seen that, as soon as the L2 is not sufficient to hold the working set size, the performance of the case where the critical word is at the end is about 0.7% slower. 

The sequential access appears to be affected a bit more. 

This would be consistent with the aforementioned problem（上述问题） when prefetching the next cache line.

# 参考资料

P34

* any list
{:toc}
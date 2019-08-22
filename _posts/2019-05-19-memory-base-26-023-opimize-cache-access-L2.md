---
layout: post
title: Memory 内存知识-26-023-L2 缓存优化
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Optimizing Level 2 and Higher Cache Access

Everything said about optimizations for level 1 caches also applies to level 2 and higher cache accesses. 

ps: 优化的思想是相通的。

## 补充内容

There are two additional aspects of last level caches:

（1）cache misses are always very expensive. 

While L1 misses (hopefully) frequently hit L2 and higher cache, thus limiting the penalties（处罚）, there is obviously no fallback（倒退） for the last level cache.

（2）L2 caches and higher are often shared by multiple cores and/or hyper-threads. 

The effective cache size available to each execution unit is therefore usually less than the total cache size.

因为这个缓存被共享，所以实际可用的并没有那么多。

# 如何避免 cache miss

To avoid the high costs of cache misses, the working set size should be matched to the cache size. 

If data is only needed once this obviously is not necessary since the cache would be ineffective anyway. 

最乐观的情况，是缓存的大小可以全部加载工作集合的大小。当然这是不太现实的。

还有一种是，如果信息只会被用一次，那么缓存是纯属浪费资源的。

We are talking about workloads where the data set is needed more than once. 

In such a case the use of a working set which is too large to fit into the cache will create large amounts of cache misses which, even with prefetching being performed successfully, will slow down the program.

## 如何尽可能的降低 cache miss

A program has to perform its job even if the data set is too large. 

It is the programmer’s job to do the work in a way which minimizes cache misses. 

For last-level caches this is possible–just as for L1 caches–by working on the job in smaller pieces. 

This is very similar to the optimized matrix multiplication on page 50. 

One difference, though, is that, for last level caches, the data blocks which are be worked on can be bigger. 

这个和 L1 的优化非常相似。只不过 L2 的缓存比 L1 要大一些。

The code becomes yet more complicated if L1 optimizations are needed, too. 

Imagine a matrix multiplication where the data sets–the two input matrices（矩阵） and the output matrix– do not fit into the last level cache together. 

In this case it might be appropriate to optimize the L1 and last level cache accesses at the same time.

## L1 cache 

The L1 cache line size is usually constant over many processor generations; 

even if it is not, the differences will be small. 

It is no big problem to just assume the larger size. 

On processors with smaller cache sizes two or more cache lines will then be used instead of one. 

In any case, it is reasonable to hardcode the cache line size and optimize the code for it.

## 高级别缓存

For higher level caches this is not the case if the program is supposed to be generic. 

The sizes of those caches can vary widely. 

Factors of eight or more are not uncommon.

It is not possible to assume the larger cache size as a default since this would mean the code performs poorly on all machines except those with the biggest cache. 

The opposite choice is bad too: 

assuming the smallest cache means throwing away（扔掉） 87% of the cache or more. 

This is bad; 

as we can see from Figure 3.14 using large caches can have a huge impact（巨大的影响） on the program’s speed.


## 意味着什么

What this means is that the code must dynamically adjust itself to the cache line size. 

代码可以自动适应缓存行。

This is an optimization specific to the program. 

All we can say here is that the programmer should compute the program’s requirements correctly. 

Not only are the data sets themselves needed, the higher level caches are also used for other purposes; 

for example, all the executed instructions are loaded from cache. 

If library functions are used this cache usage might add up to a significant amount. 

Those library functions might also need data of their own which further reduces the available memory.

例如，从缓存加载所有执行的指令。

如果使用库函数，则此缓存使用量可能会增加很多。

这些库函数可能还需要自己的数据，这进一步减少了可用内存。


# 内存需要的计算公式

Once we have a formula（公式，配方） for the memory requirement we can compare it with the cache size. 

As mentioned before, the cache might be shared with multiple other cores. 

## 根据文件系统获得

Currently the only way to get correct information without hardcoding knowledge is through the `/sys` filesystem.

In Table 5.2 we have seen the what the kernel publishes about the hardware. 

A program has to find the directory:

```
/sys/devices/system/cpu/cpu*/cache
```

for the last level cache. 

This can be recognized by the highest numeric value in the level file in that directory.

When the directory is identified the program should read the content of the size file in that directory and divide the numeric value by the number of bits set in the bitmask in the file `shared_cpu_map`.


## 安全的下限

The value which is computed this way is a safe lower limit.

Sometimes a program knows a bit more about the behavior of other threads or processes. 

If those threads are scheduled on a core or hyper-thread sharing the cache, and the cache usge is known to not exhaust its fraction（分数） of the total cache size, then the computed limit might be too low to be optimal. 

Whether more than the fair share should be used really depends on the situation. 

The programmer has to make a choice or has to allow the user to make a decision.

# 参考资料

P58

* any list
{:toc}
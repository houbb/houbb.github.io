---
layout: post
title: Memory 内存知识-27-Prefetch 预取
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Prefetching

## 目的

The purpose of prefetching is to hide the latency of a memory access. 

直接预取，可以隐藏内存访问的延迟。

The command pipeline and out-of-order (OOO) execution capabilities of today’s processors can hide some latency but, at best, only for accesses which hit the caches. 

今天的处理器的命令管道和无序（OOO）执行功能可以隐藏一些延迟，但最多只能用于访问高速缓存的访问。

To cover the latency of main memory accesses, the command queue would have to be incredibly（令人难以置信的长） long. 

Some processors without OOO try to compensate（补偿） by increasing the number of cores, but this is a bad trade unless all the code in use is parallelized.

通过增加内核数量来补偿没有 OOO，实际上效果是并不好的。

除非所有的代码都顺序执行，不然就会存在并发问题，反而会降低性能。

## 预取如何进一步隐藏延迟

Prefetching can further help to hide latency. 

The processor performs prefetching on its own, triggered by certain events (hardware prefetching) or explicitly requested by the program (software prefetching).

预取可以进一步帮助隐藏延迟。

处理器自己执行预取，由某些事件（硬件预取）触发或由程序明确请求（软件预取）。

# Hardware Prefetching

The trigger for the CPU to start hardware prefetching is usually a sequence of two or more cache misses in a certain pattern. 

These cache misses can be to succeeding or preceding cache lines. 

In old implementations only cache misses to adjacent cache lines are recognized.

With contemporary（当代的，现代的） hardware, strides（进步） are recognized as well, meaning that skipping a fixed number of cache lines is recognized as a pattern and handled appropriately（适当）.

## 为什么要两个 cache miss 才会触发预取

It would be bad for performance if every single cache miss triggered a hardware prefetch. 

Random memory access patterns, for instance to global variables, are quite common and the resulting prefetches would mostly waste FSB bandwidth. 

This is why, to kickstart prefetching, at least two cache misses are needed. 

如果每个缓存未命中都触发了硬件预取，那么性能就不好了。

随机存储器访问模式，例如全局变量，是非常常见的，并且所得到的预取将主要浪费FSB带宽。

这就是为什么要启动预取，**至少需要两次缓存未命中。**

## 当代处理器

Processors today all expect there to be more than one stream of memory accesses. 

The processor tries to automatically assign each cache miss to such a stream and, if the threshold is reached, start hardware prefetching. 

CPUs today can keep track of eight to sixteen separate streams for the higher level caches.

## 预取的单元

The units responsible for the pattern recognition（模式识别） are associated with the respective（相应的，各自的） cache. 

There can be a prefetch unit for the L1d and L1i caches. 

There is most probably a prefetch unit for the L2 cache and higher. 

The L2 and higher prefetch unit is shared with all the other cores and hyper-threads using the same cache. 

The number of eight to sixteen separate streams therefore is quickly reduced.

L2和更高版本的预取单元使用相同的高速缓存与所有其他内核和超线程共享。

因此，快速减少8到16个单独流的数量。

# 预取的缺点

## 无法跨越页边界

Prefetching has one big weakness: it cannot cross page boundaries. 

The reason should be obvious when one realizes that the CPUs support demand（需求） paging. 

If the prefetcher were allowed to cross page boundaries, the access might trigger an OS event to make the page available.

This by itself can be bad, especially for performance. 

当人们意识到CPU支持需求（需求）分页时，原因应该是显而易见的。

如果允许预取器跨越页边界，则访问可能会触发OS事件以使页面可用。

这本身可能很糟糕，特别是对于性能。

What is worse is that the prefetcher does not know about the semantics of the program or the OS itself.

It might therefore prefetch pages which, in real life, never would be requested. 

更糟糕的是，预取程序不知道程序的语义或操作系统本身。

因此，它可能会预取在现实生活中永远不会被请求的页面。

That means the prefetcher would run past the end of the memory region the processor accessed in a recognizable pattern before. 

This is not only possible, it is very likely. 

If the processor, as a side effect of a prefetch, triggered a request for such a page the OS might even be completely thrown off its tracks if such a request could never otherwise happen.

这意味着预取器将以超过可识别模式的处理器访问的存储器区域的末端运行。

这不仅是可能的，而且非常有可能。

如果作为预取的副作用的处理器触发了对这样的页面的请求，则OS甚至可能完全抛弃其轨道，如果这样的请求永远不会发生的话。

## 数据在页边界出现的

It is therefore important to realize that, regardless of how good the prefetcher is at predicting the pattern, the program will experience cache misses at page boundaries unless it explicitly prefetches or reads from the new page.

This is another reason to optimize the layout of data as described in section 6.2 to minimize cache pollution by keeping unrelated data out.

因此，重要的是要意识到，无论预取器在预测模式方面有多好，程序都将在页面边界处遇到高速缓存未命中，除非它明确地从新页面预取或读取。

这是优化数据布局的另一个原因，如第6.2节所述，通过保持不相关的数据来最小化缓存污染。

## 分页限制

Because of this page limitation the processors today do not have terribly sophisticated（非常复杂） logic to recognize prefetch patterns. 

With the still predominant（优越的） 4k page size there is only so much which makes sense. 

The address range in which strides（步幅） are recognized has been increased over the years, but it probably does not make much sense to go beyond the 512 byte window which is often used today.

多年来，识别步幅的地址范围已经增加，但是超出今天经常使用的512字节窗口可能没有多大意义。

Currently prefetch units do not recognize non-linear access patterns. 

It is more likely than not that such patterns are truly random or, at least, sufficiently non-repeating that it makes no sense to try recognizing them.

当前预取单元不识别非线性访问模式。

这种模式更可能是真正随机的，或者至少是足够不重复的，尝试识别它们是没有意义的。

## 硬件预取

If hardware prefetching is accidentally triggered（意外触发） there is only so much one can do. 

One possibility is to try to detect（检测） this problem and change the data and/or code layout a bit. 

This is likely to prove hard. 

这可能很难。

There might be special localized solutions（本地化解决方案） like using the ud2 instruction on x86 and x86-64 processors. 

This instruction, which cannot be executed itself, is used after an indirect jump instruction; it is used as a signal to the instruction fetcher that the processor should not waste efforts decoding the following memory since the execution will continue at a different location. 

该指令本身不能执行，在间接跳转指令之后使用; 它被用作指令提取器的信号，处理器不应该浪费时间来解码后续存储器，因为执行将在不同的位置继续。

This is a very special situation, though. 

In most cases one has to live with this problem.

## 禁止硬件预取

It is possible to completely or partially disable hardware prefetching for the entire processor. 

On Intel processors an Model Specific Register (MSR) is used for this (IA32 MISC ENABLE, bit 9 on many processors; bit 19 disables only the adjacent cache line prefetch). 

This, in most cases, has to happen in the kernel since it is a privileged operation（特权行动）. 

If profiling shows that an important application running on a system suffers from bandwidth exhaustion and premature cache evictions due to hardware prefetches, using this MSR is a possibility.

如果分析显示在系统上运行的重要应用程序由于硬件预取而导致带宽耗尽和过早的高速缓存驱逐，则使用此MSR是可能的。

# Software Prefetching


## 硬件预取的优缺点

- 优点

The advantage of hardware prefetching is that programs do not have to be adjusted. 

- 缺点

The drawbacks, as just described, are that the access patterns must be trivial and that prefetching cannot happen across page boundaries.

## 软件预取

For these reasons we now have more possibilities, software prefetching the most important of them. 

Software prefetching does require modification of the source code by inserting special instructions. 

Some compilers support pragmas to more or less automatically insert prefetch instructions. 

## 如何使用

On x86 and x86-64 Intel’s convention for compiler intrinsics to insert these special instructions is generally used:

```c
#include <xmmintrin.h>
enum _mm_hint
{
_MM_HINT_T0 = 3,
_MM_HINT_T1 = 2,
_MM_HINT_T2 = 1,
_MM_HINT_NTA = 0
};
void _mm_prefetch(void *p,
enum _mm_hint h);
```

Programs can use the `_mm_prefetch` intrinsic on any pointer in the program. 

Most processors (certainly all x86 and x86-64 processors) ignore errors resulting from invalid pointers which makes the life of the programmer significantly（显著） easier. 

If the passed pointer references valid memory, the prefetch unit will be instructed to load the data into cache and, if necessary, evict other data. 

访问到合法的内存，就进行预取。如果有必要，就进行淘汰。

Unnecessary prefetches should definitely（无疑） be avoided since this might reduce the effectiveness of the caches and it consumes memory bandwidth (possibly for two cache lines in case the evicted cache line is dirty).

### 不同处理器的实现方式

The different hints to be used with the `_mm_prefetch` intrinsic（固有，内在） are implementation defined. 

That means each processor version can implement them (slightly) differently.

## 预取缓存级别

What can generally be said is that `_MM_HINT_T0` fetches data to all levels of the cache for inclusive caches and to the lowest level cache for exclusive caches（独占缓存）. 

If the data item is in a higher level cache it is loaded into L1d. 

The `_MM_HINT_T1` hint pulls the data into L2 and not into L1d. 

If there is an L3 cache the `_MM_HINT_T2` hints can do something similar for it. 

These are details, though, which are weakly specified and need to be verified for the actual processor in use. 

### 如何使用

In general, if the data is to be used right away using _MM_HINT_T0 is the right thing to do. 

如果数据要立刻使用，那就指定为 _MM_HINT_T0。这样会把数据全量加载到 L1 cache，自然地，要求缓存大小必须能够存储下预取的数据。

如果放不下，就不应该放在这一层缓存。

Of course this requires that the L1d cache size is large enough to hold all the prefetched data. 

If the size of the immediately used working set is too large, prefetching everything into L1d is a bad idea and the other two hints should be used.

### _MM_HINT_NTA

The fourth hint, _MM_HINT_NTA, allows telling the processor to treat the prefetched cache line specially. 

NTA stands for non-temporal aligned which we already explained in section 6.1. 

第四个提示_MM_HINT_NTA允许告诉处理器专门处理预取的缓存行。

NTA代表非时间对齐，我们已在6.1节中解释过。

The program tells the processor that polluting caches with this data should be avoided as much as possible since the data is only used for a short time. 

The processor can therefore, upon loading, avoid reading the data into the lower level caches for inclusive cache implementations. 

When the data is evicted from L1d the data need not be pushed into L2 or higher but, instead, can be written directly to memory. 

There might be other tricks the processor designers can deploy if this hint is given. 

The programmer must be careful using this hint: if the immediate working set size is too large and forces eviction of a cache line loaded with the NTA hint, reloading from memory will occur.

小心：如果直接工作集大小太大并强制驱逐加载了NTA提示的缓存行，则会从内存重新加载。

## 预取的性能

![image](https://user-images.githubusercontent.com/18375710/63510558-7041ff00-c511-11e9-87a2-09bfe03a17e7.png)

Figure 6.7 shows the results of a test using the now familiar pointer chasing（追） framework. 

The list is randomly laid out in memory. 

The difference to previous test is that the program actually spends some time at each list node (about 160 cycles). 

As we learned from the data in Figure 3.15, the program’s performance suffers badly as soon as the working set size is larger than the last-level cache.

## 提升性能

We can now try to improve the situation by issuing prefetch（发出预取） requests ahead of the computation. 

I.e., in each round of the loop we prefetch a new element. 

The distance between the prefetched node in the list and the node which is currently worked on must be carefully chosen.

Given that each node is processed in 160 cycles and that we have to prefetch two cache lines (NPAD=31), a distance of five list elements is enough.

## 预取的提升

The results in Figure 6.7 show that the prefetch does indeed help. 

As long as the working set size does not exceed the size of the last level cache (the machine has 512kB = 2^19B of L2) the numbers are identical. 

The prefetch instructions do not add a measurable extra burden（可衡量的额外负担。）.

As soon as the L2 size is exceeded the prefetching saves between 50 to 60 cycles, up to 8%. 

The use of prefetch cannot hide all the （处罚） but it does help a bit.

## AMD 的实现

AMD implements, in their family 10h of the Opteron line, another instruction: prefetchw. 

This instruction has so far no equivalent on the Intel side and is not available through intrinsics. 

The prefetchw instruction tells the CPU to prefetch the cache line into L1 just like the other prefetch instructions. 

prefetchw 指令告诉CPU将高速缓存行预取到L1中，就像其他预取指令一样。

The difference is that the cache line is immediately put into ’M’ state. 

This will be a disadvantage if no write to the cache line follows later.

If there are one or more writes, they will be accelerated since the writes do not have to change the cache state that happened when the cache line was prefetched. 

This is especially important for contended cache lines where a simple read of a cache line in another processor’s cache would first change the state to ’S’ in both caches.

如果稍后没有写入高速缓存行，这将是一个缺点。

如果有一个或多个写入，则它们将被加速，因为写入不必更改预取高速缓存行时发生的高速缓存状态。

这对于竞争缓存行尤其重要，其中在另一个处理器的缓存中简单读取缓存行将首先在两个缓存中将状态更改为“S”。

## 预取的更多优势

Prefetching can have bigger advantages than the meager（微不足道的） 8% we achieved here. 

But it is notoriously（臭名昭著） hard to do right, especially if the same binary is supposed to perform well on a variety of machines. 

### 预取统计

The performance counters provided by the CPU can help the programmer to analyze prefetches. 

Events which can be counted and sampled include hardware prefetches, software prefetches, useful/used software prefetches, cache misses at the various levels, and more. 

In section 7.1 we will introduce a number of these events. 

All these counters are machine specific.

ps: 所有的属性信息，就会有固定的统计信息。便于我们进行定位和调整统计。

## 分析程序-cache miss 

When analyzing programs one should first look at the cache misses. 

When a large source of cache misses is located one should try to add a prefetch instruction for the problematic memory accesses. 

This should be done in one place at a time. 

The result of each modification should be checked by observing the performance counters measuring useful prefetch instructions. 

If those counters do not increase the prefetch might be wrong, it is not given enough time to load from memory, or the prefetch evicts memory from the cache which is still needed.

如果这些计数器没有增加预取可能是错误的，则没有足够的时间从内存加载，或者预取从需要的高速缓存中驱逐内存。

## gcc 预取

gcc today is able to emit prefetch（发起预取） instructions automatically in one situation. 

If a loop is iterating over an array the following option can be used:

```
-fprefetch-loop-arrays
```

The compiler will figure out whether prefetching makes sense and, if so, how far ahead it should look. 

For small arrays this can be a disadvantage and, if the size of the array is not known at compile time, the results might be worse. 

The gcc manual warns that the benefits highly depend on the form of the code and that in some situation the code might actually run slower. 

Programmers have to use this option carefully

编译器将弄清楚预取是否有意义，如果是，它应该看多远。

对于小型数组，这可能是一个缺点，如果在编译时不知道数组的大小，结果可能会更糟。

gcc手册警告说，好处在很大程度上取决于代码的形式，在某些情况下，代码实际上可能运行得更慢。

程序员必须仔细使用此选项

# 参考资料

P59

* any list
{:toc}
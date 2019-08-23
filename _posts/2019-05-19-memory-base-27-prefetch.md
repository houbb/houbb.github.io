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

# Special Kind of Prefetch: Speculation（推测）

The OOO(out of order) execution capability of a modern processor allows moving instructions around if they do not conflict with each other. 

## IA-64 例子

For instance (using this time IA-64 for the example):

```
st8 [r4] = 12
add r5 = r6, r7;;
st8 [r18] = r5
```

This code sequence stores 12 at the address specified by register r4, adds the content of registers r6 and r7 and stores it in register r5. 

Finally it stores the sum at the address specified by register r18. 

The point here is that the add instruction can be executed before–or at the same time as–the first st8 instruction since there is no data
dependency. 

But what happens if one of the addends（加数） has to be loaded?

```
st8 [r4] = 12
ld8 r6 = [r8];;
add r5 = r6, r7;;
st8 [r18] = r5
```

The extra ld8 instruction loads the value from the address specified by the register r8. 

There is an obvious data dependency between this load instruction and the following add instruction (this is the reason for the ;; after the instruction, thanks for asking). 

What is critical here is that the new ld8 instruction–unlike the add instruction–cannot be moved in front of the first st8.

The processor cannot determine quickly enough during the instruction decoding whether the store and load conflict, i.e., whether r4 and r8 might have same value. 

If they do have the same value, the st8 instruction would determine the value loaded into r6. 

What is worse, the ld8 might also bring with it a large latency in case the load misses the caches. 

The IA-64 architecture supports speculative（投机） loads for this case:

```
ld8.a r6 = [r8];;
[... other instructions ...]
st8 [r4] = 12
ld8.c.clr r6 = [r8];;
add r5 = r6, r7;;
st8 [r18] = r5
```

The new ld8.a and ld8.c.clr instructions belong together and replace the ld8 instruction in the previous code sequence. 

The ld8.a instruction is the speculative load. 

The value cannot be used directly but the processor can start the work. 

At the time when the ld8.c.clr instruction is reached the content might have been loaded already (given there is a sufficient number of instructions in the gap). 

The arguments for this instruction must match that for the ld8.a instruction. 

If the preceding st8 instruction does not overwrite the value (i.e., r4 and r8 are the same), nothing has to be done. 

The speculative load does its job and the latency of the load is hidden. 

If the store and load do conflict the ld8.c.clr reloads the value from memory and we end up with the semantics of a normal ld8 instruction.

该指令的参数必须与ld8.a指令的参数匹配。

如果前面的st8指令没有覆盖该值（即r4和r8是相同的），则不需要做任何事情。

推测性负载完成其工作并隐藏负载的延迟。

如果存储和加载发生冲突，则ld8.c.clr会从内存中重新加载该值，最后我们会得到正常的ld8指令的语义。

## 投机加载

Speculative（投机） loads are not (yet?) widely used. 

But as the example shows it is a very simple yet effective way to hide latencies. 

Prefetching is basically equivalent and, for processors with few registers, speculative loads probably do not make much sense. 

Speculative loads have the (sometimes big) advantage of loading the value directly into the register and not into the cache line where
it might be evicted again (for instance, when the thread is descheduled). 

If speculation is available it should be used.

# Helper Threads

## 代码的复杂性

When one tries to use software prefetching one often runs into problems with the complexity（复杂性） of the code. 

If the code has to iterate over a data structure (a list in our case) one has to implement two independent iterations in the same loop: 

the normal iteration doing the work and the second iteration, which looks ahead, to use prefetching.

This easily gets complex enough that mistakes are likely.

执行工作的正常迭代和向前看的第二次迭代，以使用预取。

这很容易变得足够复杂，可能会出错。

## 确定要看多远

Furthermore, it is necessary to determine how far to look ahead. 

Too little and the memory will not be loaded in time. 

Too far and the just loaded data might have been evicted again. 

太少的数据加载可能导致不及时，太多的加载可能导致被驱除。

## 预取也是需要时间的

Another problem is that prefetch instructions, although they do not block and wait for the memory to be loaded, take time. 

The instruction has to be decoded, which might be noticeable if the decoder is too busy, for instance, due to well written/generated code.

Finally, the code size of the loop is increased. 

This decreases the L1i efficiency. 

预取数据也需要解码，这会占用 L1i 的资源，降低其性能。

If one tries to avoid parts of this cost by issuing multiple prefetch requests in a row (in case the second load does not depend on the result of the first) one runs into problems with the number of outstanding prefetch requests.

## 可选的方案：分开执行正常操作和预取。

An alternative approach is to perform the normal operation and the prefetch completely separately. 

This can happen using two normal threads. 

The threads must obviously be scheduled so that the prefetch thread is populating a cache accessed by both threads. 

There are two special solutions worth mentioning:

（1）Use hyper-threads (see page 29) on the same core. 

In this case the prefetch can go into L2 (or even L1d).

（2）Use “dumber”（笨） threads than SMT threads which can do nothing but prefetch and other simple operations.

This is an option processor manufacturers（处理器制造商） might explore.

## 超级线程的使用

The use of hyper-threads is particularly intriguing（特别有趣）. 

As we have seen on page 29, the sharing of caches is a problem if the hyper-threads execute independent code. 

If, instead, one thread is used as a prefetch helper thread this is not a problem. 

To the contrary, it is the desired effect since the lowest level cache is preloaded. 

相反，由于最低级高速缓存被预加载，因此是期望的效果。

Furthermore, since the prefetch thread is mostly idle or waiting for memory, the normal operation of the other hyperthread is not disturbed much if it does not have to access main memory itself. 

The latter is exactly what the prefetch helper thread prevents.

此外，由于预取线程主要是空闲或等待内存，因此如果不必访问主存储器本身，则其他超线程的正常操作不会受到太多干扰。

后者正是预取助手线程所阻止的。

## 确保不要太超前

The only tricky（狡猾） part is to ensure that the helper thread is not running too far ahead. 

It must not completely pollute the cache so that the oldest prefetched values are evicted again. 

On Linux, synchronization is easily done using the `futex` system call  or, at a little bit higher cost, using the POSIX thread synchronization primitives.

![image](https://user-images.githubusercontent.com/18375710/63567794-826d7d00-c5a5-11e9-9460-689d43c0b393.png)

The benefits of the approach can be seen in Figure 6.8. 

This is the same test as in Figure 6.7 only with the additional result added. 

The new test creates an additional helper thread which runs about 100 list entries ahead and reads (not only prefetches) all the cache lines of each list element. 

In this case we have two cache lines per list element (NPAD=31 on a 32-bit machine with 64 byte cache line size).

The two threads are scheduled on two hyper-threads of the same core. 

The test machine has only one core but the results should be about the same if there is more than one core. 

The affinity（亲和力） functions, which we will introduce in section 6.4.3, are used to tie the threads down to the appropriate hyper-thread.

## 确认哪一个处理器是超线程

To determine which two (or more) processors the OS knows are hyper-threads, the NUMA_cpu_level_mask interface from libNUMA can be used (see Appendix D).

```c
#include <libNUMA.h>
ssize_t NUMA_cpu_level_mask(size_t destsize,
cpu_set_t *dest,
size_t srcsize,
const cpu_set_t*src,
unsigned int level);
```

This interface can be used to determine the hierarchy（等级制度） of CPUs as they are connected through caches and memory.

Of interest here is level 1 which corresponds to hyper-threads. 

To schedule two threads on two hyperthreads the libNUMA functions can be used (error handling dropped for brevity):

```c
cpu_set_t self;
NUMA_cpu_self_current_mask(sizeof(self),
&self);
cpu_set_t hts;
NUMA_cpu_level_mask(sizeof(hts), &hts,
sizeof(self), &self, 1);
CPU_XOR(&hts, &hts, &self);
```

After this code is executed we have two CPU bit sets.

self can be used to set the affinity of the current thread and the mask in hts can be used to set the affinity of the helper thread. 

This should ideally happen before the thread is created. 

In section 6.4.3 we will introduce the interface to set the affinity. 

If there is no hyper-thread available the NUMA_cpu_level_mask function will return 1. 

This can be used as a sign to avoid this optimization.

## 性能测试报告

The result of this benchmark might be surprising (or perhaps not). 

If the working set fits into L2, the overhead of the helper thread reduces the performance by between 10% and 60% (mostly at the lower end, ignore the smallest working set sizes again, the noise is too high). 

This should be expected since, if all the data is already in the L2 cache, the prefetch helper thread only uses system resources without contributing to the execution.

Once the L2 size is not sufficient is exhausted the picture changes, though. 

The prefetch helper thread helps to reduce the runtime by about 25%. 

We still see a rising curve simply because the prefetches cannot be processed fast enough. 

The arithmetic（算数） operations performed by the main thread and the memory load operations of the helper thread do complement each other, though. 

The resource collisions are minimal which causes this synergistic effect.

资源冲突很小，这会产生这种协同效应。

## 其他情况的推广

The results of this test should be transferable（转让） to many other situations. 

Hyper-threads, often not useful due to cache pollution, shine in these situations and should be taken advantage of. 

The NUMA library introduced in Appendix D makes finding thread siblings very easy (see the example in that appendix). 

If the library is not available the sys file system allows a program to find the thread siblings (see the thread_siblings column in Table 5.3). 

Once this information is available the program just has to define the affinity of the threads and then run the loop in two modes: normal operation and prefetching. 

The amount of memory prefetched should depend on the size of the shared cache. 

In this example the L2 size is relevant（响应的） and the program can query the size using

```
sysconf(_SC_LEVEL2_CACHE_SIZE)
```

Whether or not the progress of the helper thread must be restricted depends on the program. 

In general it is best to make sure there is some synchronization since scheduling details could otherwise cause significant performance
degradations.

# Direct Cache Access

One sources of cache misses in a modern OS is the handling of incoming data traffic. 

## 直接写入内存的优缺点

### 优点

Modern hardware, like Network Interface Cards (NICs) and disk controllers, has the ability to write the received or read data directly into memory without involving the CPU. 

This is crucial（关键） for the performance of the devices we have today, but it also causes problems. 

可以直接写入主存，这样可以绕过 cache。节约时间。

### 缺点

Assume an incoming packet from a network: the OS has to decide how to handle it by looking at the header of the packet. 

The NIC places the packet into memory and then notifies the processor about the arrival.

The processor has no chance to prefetch the data since it does not know when the data will arrive, and maybe not even where exactly it will be stored. 

The result is a cache miss when reading the header.

假设来自网络的传入数据包：操作系统必须通过查看数据包的标头来决定如何处理它。

NIC将数据包放入内存，然后通知处理器有关到达的信息。

处理器没有机会预取数据，因为它不知道数据何时到达，甚至可能不知道数据的存储位置。

结果是读取标题时出现缓存未命中。

## Intel 处理方式

Intel has added technology in their chipsets（芯片组） and CPUs to alleviate（缓解） this problem. 

The idea is to populate the cache of the CPU which will be notified about the incoming packet with the packet’s data. 

The payload of the packet is not critical here, this data will, in general, be handled by higher-level functions, either in the kernel or at user level. 

The packet header is used to make decisions about the way the packet has to be handled and so this data is needed immediately.

数据包的有效负载在这里并不重要，一般来说，这些数据将由更高级别的函数处理，无论是在内核中还是在用户层面。

数据包标头用于决定数据包的处理方式，因此需要立即获取此数据。

## 网络硬件

The network I/O hardware already has DMA to write the packet. 

That means it communicates directly with the memory controller which potentially（可能） is integrated in the Northbridge. 

Another side of the memory controller is the interface to the processors through the FSB (assuming the memory controller is not integrated into the CPU itself).

## 其他的想法

The idea behind Direct Cache Access (DCA) is to extend the protocol between the NIC and the memory controller.

In Figure 6.9 the first figure shows the beginning of the DMA transfer in a regular machine with Northand Southbridge. 

![image](https://user-images.githubusercontent.com/18375710/63580865-4ac3fc80-c5c8-11e9-869b-d357263b8a6c.png)

The NIC is connected to (or is part of) the Southbridge. 

It initiates the DMA access but provides the new information about the packet header which should be pushed into the processor’s cache.

## 传统的方式

The traditional behavior would be, in step two, to simply complete the DMA transfer with the connection to the memory. 

在第二步中，传统行为是通过与内存的连接简单地完成DMA传输。

For the DMA transfers with the DCA flag set the Northbridge additionally sends the data on the FSB with a special, new DCA flag. 

The processor always snoops the FSB and, if it recognizes the DCA flag, it tries to load the data directed to the processor into the lowest cache. 

The DCA flag is, in fact, a hint; the processor can freely ignore it. After the DMA transfer is finished the processor is signaled.

对于具有DCA标志设置的DMA传输，北桥还使用特殊的新DCA标志在FSB上发送数据。

处理器总是监听FSB，如果它识别出DCA标志，它会尝试将指向处理器的数据加载到最低的缓存中。

事实上，DCA标志是一个提示; 处理器可以自由地忽略它。 DMA传输完成后，处理器发出信号。

## OS 如何处理

The OS, when processing the packet, first has to determine what kind of packet it is. 

If the DCA hint is not ignored, the loads the OS has to perform to identify the packet most likely hit the cache. 

Multiply this saving of hundreds of cycles per packet with tens of thousands of packets which can be processed per second, and the savings
add up to very significant numbers, especially when it comes to latency.

操作系统必须判断出 packet 的种类。

Without the integration of I/O hardware (a NIC in this case), chipset, and CPUs such an optimization is not possible.

It is therefore necessary to make sure to select the platform wisely if this technology is needed.

# 参考资料

P59

* any list
{:toc}
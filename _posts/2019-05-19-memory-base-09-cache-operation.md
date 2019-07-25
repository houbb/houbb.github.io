---
layout: post
title: Memory 内存知识-09-Operation in High level
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Cache Operation at High Level

To understand the costs and savings of using a cache we have to combine the knowledge about the machine architecture
and RAM technology from section 2 with the structure of caches described in the previous section.

By default all data read or written by the CPU cores is stored in the cache. 

There are memory regions（区域） which cannot be cached but this is something only the OS implementers have to be concerned about; 

it is not visible to the application programmer. 

There are also instructions（说明） which allow the programmer to deliberately（故意） bypass certain caches. 

This will be discussed in section 6.

If the CPU needs a data word the caches are searched first. 

Obviously, the cache cannot contain the content of the entire main memory (otherwise we would need no cache), 

ps: 缓存无法放下所有的主存内容。

but since all memory addresses are cacheable, each cache entry is tagged using the address of the data word in the main memory. 

This way a request to read or write to an address can search the caches for a matching tag. 

The address in this context can be either the virtual or physical address, varying based on the cache implementation.

Since for the tag, in addition to the actual memory, additional space is required, it is inefficient to chose a word as the granularity（粒度） of the cache. 

For a 32-bit word on an x86 machine the tag itself might need 32 bits or more. 

Furthermore, since spatial locality（空间位置） is one of the principles on which caches are based, it would be bad to not take this into account. 

Since neighboring memory（临近的内存） is likely to be used together it should also be loaded into the cache together.

Remember also what we learned in section 2.2.1: RAM modules are much more effective if they can transport many data words in a row without a new CAS or even RAS signal. 

ps: 如果RAM模块可以在没有新的CAS或甚至RAS信号的情况下连续传输许多数据字，则RAM模块会更有效。

So the entries stored in the caches are not single words but, instead, “lines” of several contiguous（临近的） words. 

In early caches these lines were 32 bytes long; nowadays the norm is 64 bytes. 

If the memory bus is 64 bits wide this means 8 transfers per cache line.

DDR supports this transport mode efficiently.

## 缓存内容

When memory content is needed by the processor the entire cache line is loaded into the L1d. 

The memory address for each cache line is computed by masking the address value according to the cache line size. 

For a 64 byte cache line this means the low 6 bits are zeroed（低6位全是0）. 

The discarded（丢弃） bits are used as the offset into the cache line.

### cache line

这里有一个缓存行的概念。

记得在 java 中有利用过这个特性。

The remaining bits are in some cases used to locate the line in the cache and as the tag. 

# 实际组成

In practice an address value is split into three parts. 

For a 32-bit address it might look as follows:

## 结构

```
| TAG | Cache Set | Offset |
```

T->S->O

### offset

With a cache line size of `2^O` the low O bits are used as the offset into the cache line. 

### cache set

The next S bits select the “cache set”. 

We will go into more detail soon on why sets, and not single slots, are used for cache lines.

For now it is sufficient（足够） to understand there are `2^S` sets of cache lines. 

### tag

This leaves the top `32-S-O = T` bits which form the tag. 

These T bits are the value associated with each cache line to distinguish（区分） all the aliases which are cached in the same cache set. 

ps: 所有缓存行的 S 部分的别名都是相同的，换言之，全部通过 T 去区分.

The S bits used to address the cache set do not have to be stored since they are the same for all cache lines in the same set.

# 写操作

When an instruction（指令） modifies memory the processor still has to load a cache line first because no instruction modifies
an entire cache line at once (exception to the rule: write-combining as explained in section 6.1). 

The content of the cache line before the write operation therefore has to be loaded. 

It is not possible for a cache to hold partial cache lines. 

ps: 缓存加载是按照 cache line. 

A cache line which has been written to and which has not been written back to main memory is said to be “dirty”. 

Once it is written the dirty flag is cleared.

ps: 已经在缓存中写（变化），但是还没有被刷回到主存中。会被标记为**脏**，如果刷到主存中，则会清除这个标记。

# 加载数据到缓存的准备工作

To be able to load new data in a cache it is almost always first necessary to make room in the cache. 

An eviction from L1d pushes the cache line down into L2 (which uses the same cache line size). 

This of course means room has to be made in L2. 

This in turn might push the content into L3 and ultimately into main memory. 

Each eviction is progressively（逐渐） more expensive. 

- 祛除数据的代价

L1d 层祛除速度最快，L2 次之，L3 最慢。

## 商业模型

What is described here is the model for an exclusive cache as is preferred by modern AMD and VIA processors. 

Intel implements inclusive caches（包容性缓存） where each cache line in L1d is also present in L2. 

Therefore evicting from L1d is much faster. 

With enough L2 cache the disadvantage of wasting memory for content held in two places is minimal and it pays off when evicting. 

A possible advantage of an exclusive cache（独占高速缓存） is that loading a new cache line only has to touch the L1d and not the L2, which could be faster.

- 用空间换时间

通过在将 L1d 层的数据，同时也放一层在 L2 层。

这样在数据祛除的时候，就可以节约时间。

# CPU 对于 cache

The CPUs are allowed to manage the caches as they like as long as the memory model defined for the processor architecture（处理器） is not changed. 

It is, for instance, perfectly fine for a processor to take advantage of little or no memory bus activity and proactively（主动） write dirty cache lines back to main memory. 

The wide variety of cache architectures（缓存架构） among the processors for the x86 and x86-64, between manufacturers（制造商） and even within the models of the same manufacturer, are testament（证明了） to the power of the memory model abstraction.

# SMP（对称多处理器）

In symmetric multi-processor (SMP) systems the caches of the CPUs cannot work independently（独立的，非依赖的） from each other.

All processors are supposed to see the same memory content at all times. 

The maintenance of this uniform view of memory is called “cache coherency（缓存一致性）”. 

If a processor were to look simply at its own caches and main memory it would not see the content of dirty cache lines in other processors. 

Providing direct access to the caches of one processor from another processor would be terribly expensive and a huge bottleneck. 

ps: 价格昂贵，且是性能瓶颈。

##  读写的检测

Instead, processors detect（检测） when another processor wants to read or write to a certain cache line.

If a write access is detected and the processor has a clean copy of the cache line in its cache, this cache line is marked invalid. 

Future references will require the cache line to be reloaded. 

Note that a read access on another CPU does not necessitate an invalidation, multiple clean copies can very well be kept around.

相反，处理器检测（检测）另一个处理器何时想要读取或写入某个高速缓存行。

如果检测到写访问并且处理器在其高速缓存中具有高速缓存行的干净副本，则该高速缓存行被标记为无效。

未来的引用将要求重新加载缓存行。

请注意，在另一个CPU上进行读取访问不需要失效，可以很好地保留多个干净的副本。

## 更加复杂的缓存实现

More sophisticated（复杂的） cache implementations allow another possibility to happen. 

Assume a cache line is dirty in one processor’s cache and a second processor wants to read or write that cache line. 

In this case the main memory is out-of-date（过期） and the requesting processor must, instead, get the cache line content from the first processor.

Through snooping（窥探）, the first processor notices this situation and automatically sends the requesting processor the data. 

This action bypasses main memory, though in some implementations the memory controller is supposed to notice this direct transfer and store the updated cache line content in main memory. 

If the access is for writing the first processor then invalidates its copy of the local cache line.

- 个人理解

这里讨论了两个处理器并发处理的场景。

如果处理器A存在脏数据（修改，暂时没有刷到 main memory），第二个处理器B读取时，就需要从处理器A处获取数据（或者将A的信息，刷到主存），这个才是准确的。

## MESI-不同缓存相关性的协议

Over time a number of cache coherency（相干性） protocols have been developed. 

The most important is MESI, which we will introduce in section 3.3.4. 

The outcome of all this can be summarized in a few simple rules:

- A dirty cache line is not present in any other processor’s cache.

- Clean copies of the same cache line can reside in arbitrarily（任意的） many caches.

If these rules can be maintained, processors can use their caches efficiently even in multi-processor systems. 

All the processors need to do is to monitor（监控） each others’ write accesses and compare the addresses with those in their
local caches. 

In the next section we will go into a few more details about the implementation and especially the costs.

ps: 也就是只要满足提到了两个条件，在多处理器系统中，缓存也可以被高效的利用。


## 缓存命中率问题

Finally, we should at least give an impression（印象） of the costs associated with cache hits and misses. 

These are the numbers Intel lists for a Pentium（奔腾） M:

| where | cycle |
|:---|:---|
| register | <= 1|
| L1d | ~3 |
| L2 | ~14 |
| main memory | ~240 |

ps: 大概理解下不同的 cache 之间的数据关联。

These are the actual access times measured in CPU cycles.

### L2 Cache 的延迟

It is interesting to note that for the on-die L2 cache a large part (probably even the majority) of the access time is caused by wire delays（电线延迟？）. 

This is a physical limitation which can only get worse with increasing cache sizes. 

Only process shrinking （缩小）(for instance, going from 60nm for Merom to 45nm for Penryn in Intel’s lineup) can improve those numbers.

ps: 说白了是物理层面的限制。

The numbers in the table look high but, fortunately, the entire cost does not have to be paid for each occurrence of the cache load and miss. 

Some parts of the cost can be hidden. 

Today’s processors all use internal pipelines of different lengths where the instructions are decoded and prepared for execution. 

Part of the preparation is loading values from memory (or cache) if they are transferred to a register. 

If the memory load operation can be started early enough in the pipeline, it may happen in parallel with other operations and the entire cost of the load might be hidden. 

This is often possible for L1d; for some processors with long pipelines for L2 as well.

- 并行提升速度

今天的处理器都使用不同长度的内部流水线，其中指令被解码并准备执行。部分准备工作是将内存（或缓存）中的值加载到寄存器中

可以利用**并行加载**的方式，将这些加载时间损耗隐藏掉。

这种方式是可以推广使用的。

### 提前读取的一些障碍

There are many obstacles（障碍） to starting the memory read early. 

It might be as simple as not having sufficient resources for the memory access or it might be that the final address of the load becomes available late as the result of another instruction. 

In these cases the load costs cannot be hidden (completely).

它可能很简单，因为没有足够的资源用于存储器访问，或者可能是因为另一条指令导致负载的最终地址变得可用。

# 写操作

For write operations the CPU does not necessarily have to wait until the value is safely stored in memory. 

As long as the execution of the following instructions（说明） appears to have the same effect as if the value were stored in memory there is nothing which prevents the CPU from taking shortcuts（取得捷径）. 

It can start executing the next instruction early. 

With the help of shadow registers which can hold values no longer available in a regular register it is even possible to change the value which is to be stored in the incomplete write operation.

在影子寄存器的帮助下，它可以保存常规寄存器中不再可用的值，甚至可以更改在不完整写入操作中存储的值。

## 随机写的性能

![image](https://user-images.githubusercontent.com/18375710/61848878-13d3cb80-aee2-11e9-9af3-d94f441ce227.png)

For an illustration of the effects of cache behavior see Figure 3.4. 

We will talk about the program which generated the data later; 

it is a simple simulation of a program which accesses a configurable amount of memory repeatedly in a random fashion. 

Each data item has a fixed size. 

The number of elements depends on the selected working set size. 

The Y–axis shows the average number of CPU cycles it takes to process one element; 

note that the scale for the Y–axis is logarithmic. （对数的）

The same applies in all the diagrams of this kind to the X–axis. 

The size of the working set is always shown in powers of two. （2的指数增长）

### 图中我们知道什么

The graph shows three distinct plateaus（高原）. 

ps： 个人理解就是接近水平的三个地方（曲线）。

This is not surprising:

the specific processor has L1d and L2 caches, but no L3. 

With some experience we can deduce（推断） that the L1d is 213 bytes in size and that the L2 is 220 bytes in
size. 

If the entire working set fits into the L1d the cycles per operation on each element is below 10. 

Once the L1d size is exceeded the processor has to load data from L2 and the average time springs up to around 28. 

Once the L2 is not sufficient anymore the times jump to 480 cycles and more. 

This is when many or most operations have to load data from main memory. 

And worse: since data is being modified dirty cache lines have to be written back, too.

因为数据正在被修改，所以也必须写回脏缓存行。

- 个人理解

 L1d 速度最快，第一个高原区域其实可以推断出 L1d 缓存的大小。

 L2 速度次之，第二个高原区域对应了 L2 缓存的大小。

 L3 同理。

 最后全部从 main memory 进行读取数据。

## 总结

This graph should give sufficient motivation（足够的动力） to look into coding improvements which help improve cache usage.

We are not talking about a difference of a few measly percent here; 

we are talking about orders-of-magnitude（订单的数量级） improvements which are sometimes possible. 

In section 6 we will discuss techniques which allow writing more efficient code. 

The next section goes into more details of CPU cache designs. 

The knowledge is good to have but not necessary for the rest of the paper. 

So this section could be skipped.

后面会介绍一下一些 cache 设计的细节，对于剩余的 paper 内容却不是必须的。

# 拓展阅读

## 影子寄存器

有阴影的寄存器，表示在物理上这个寄存器对应2个寄存器，一个是程序员可以写入或读出的寄存器，称为preload register(预装载寄存器)，另一个是程序员看不见的、但在操作中真正起作用的寄存器，称为shadow register(影子寄存器)

设计preload register和shadow register的好处是，所有真正需要起作用的寄存器(shadow register)可以在同一个时间(发生更新事件时)被更新为所对应的preload register的内容，这样可以保证多个通道的操作能够准确地同步。

如果没有shadow register，或者preload register和shadow register是直通的，即软件更新preload register时，同时更新了shadow register，因为软件不可能在一个相同的时刻同时更新多个寄存器，结果造成多个通道的时序不能同步，如果再加上其它因素(例如中断)，多个通道的时序关系有可能是不可预知的。

# 参考资料

[15-cpumemory.pdf-13](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

[影子寄存器](https://www.cnblogs.com/chengqi521/p/7737101.html)

* any list
{:toc}
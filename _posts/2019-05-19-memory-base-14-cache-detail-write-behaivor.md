---
layout: post
title: Memory 内存知识-14-缓存实现的细节之写入行为
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Write Behavior

Before we start looking at the cache behavior when multiple execution contexts (threads or processes) use the same memory we have to explore a detail of cache implementations.

Caches are supposed to be coherent（相干） and this coherency（相关性） is supposed to be completely transparent for the userlevel code. 

Kernel code is a different story; it occasionally（间或，偶尔） requires cache flushes.

This specifically means that, if a cache line is modified, the result for the system after this point in time is the same as if there were no cache at all and the main memory location itself had been modified. 

## 实现方式

This can be implemented in two ways or policies:

- write-through cache implementation;

- write-back cache implementation.

# Write-through

The write-through cache is the simplest way to implement cache coherency（相关性）. 

If the cache line is written to, the processor immediately also writes the cache line into main memory. 

This ensures that, at all times, the main memory and cache are in sync. 

如果写入高速缓存行，则处理器立即将高速缓存行写入主存储器。

这可确保主存储器和高速缓存始终保持同步。

The cache content could simply be discarded（丢弃） whenever a cache line is replaced.

## 缺点

This cache policy is simple but not very fast. 

A program which, for instance, modifies a local variable over and over again would create a lot of traffic on the FSB even though the data is likely not used anywhere else and might be short-lived.

例如，一次又一次地修改局部变量的程序将在FSB上创建大量流量，即使数据可能在其他任何地方都没有使用并且可能是短暂的。

# write-back

The write-back policy is more sophisticated（复杂的）. 

Here the processor does not immediately write the modified cache line back to main memory. 

Instead, the cache line is only marked as dirty（标记为脏）. 

When the cache line is dropped from the cache at some point in the future the dirty bit will instruct the processor to write the data back at that time instead of just discarding the content.

当缓存行在将来的某个时刻从缓存中删除时，脏位将指示处理器在那时将数据写回，而不是仅丢弃内容。

## 优点

Write-back caches have the chance to be significantly（显著） better performing, which is why most memory in a system with a decent processor is cached this way. 

ps: 这种策略性能比较好，所以很多缓存使用这种策略。

The processor can even take advantage of free capacity on the FSB to store the content of a cache line before the line has to be evacuated. 

This allows the dirty bit to be cleared and the processor can just drop the cache line when the room in the cache is needed.

处理器甚至可以利用FSB上的空闲容量来存储高速缓存线的内容，然后才能撤离线路。

这允许清除脏位，并且当需要高速缓存中的空间时，处理器可以仅丢弃高速缓存行。

## 问题

But there is a significant（重大的） problem with the write-back implementation.

When more than one processor (or core or hyper-thread) is available and accessing the same memory it must still be assured that both processors see the same memory content at all times. 

ps: 必须保证多线程下的缓存一致性。

If a cache line is dirty on one processor (i.e., it has not been written back yet) and a second processor tries to read the same memory location, the read operation cannot just go out to the main memory. 

Instead the content of the first processor’s cache line is needed. 

In the next section we will see how this is currently implemented.

# 其他的缓存策略

Before we get to this there are two more cache policies to mention:

- write-combining; and

- uncacheable.

Both these policies are used for special regions of the address space which are not backed by real RAM. 

The kernel sets up these policies for the address ranges (on x86 processors using the Memory Type Range Registers, MTRRs) and the rest happens automatically. 

The MTRRs are also usable to select between write-through and write-back policies.

# Write-combining

Write-combining is a limited caching optimization more often used for RAM on devices such as graphics cards（显卡）.

Since the transfer costs to the devices are much higher than the local RAM access it is even more important to avoid doing too many transfers. 

Transferring an entire cache line just because a word in the line has been written is wasteful if the next operation modifies the next word. 

One can easily imagine that this is a common occurrence, the memory for horizontal neighboring pixels on a screen are in most cases neighbors, too. 

可以很容易地想象这是常见的事情，屏幕上水平相邻像素的存储器在大多数情况下也是邻居。

As the name suggests, write-combining combines multiple write accesses before the cache line is written out. 

In ideal（理想） cases the entire cache line is modified word by word and, only after the last word is written, the cache line is written to the device. 

This can speed up access to RAM on devices significantly.

# Uncacheable

Finally there is uncacheable memory. 

This usually means the memory location is not backed by RAM at all. 

It might be a special address which is hardcoded to have some functionality implemented outside the CPU. 

For commodity hardware this most often is the case for memory mapped address ranges which translate to accesses to cards and devices attached to a bus (PCIe etc). 

On embedded boards one sometimes finds such a memory address which can be used to turn an LED on and off.

Caching such an address would obviously be a bad idea. 

这通常意味着RAM根本不支持内存位置。

它可能是一个特殊的地址，硬编码以在CPU外部实现某些功能。

对于商用硬件，这通常是存储器映射地址范围的情况，其转换为对连接到总线（PCIe等）的卡和设备的访问。

在嵌入式电路板上，有时会找到一个可用于打开和关闭LED的存储器地址。

缓存这样的地址显然是个坏主意。

LEDs in this context are used for debugging or status reports and one wants to see this as soon as possible. 

The memory on PCIe cards can change without the CPU’s interaction（相互影响）, so this memory should not be cached.

- 不应该被缓存

有些缓存信息，可以不经过 cpu 就可以直接被修改。这些信息，是不应该被缓存的。

# 拓展阅读

[究竟先操作缓存，还是数据库](https://houbb.github.io/2018/09/01/cache-03-more#%E7%A9%B6%E7%AB%9F%E5%85%88%E6%93%8D%E4%BD%9C%E7%BC%93%E5%AD%98%E8%BF%98%E6%98%AF%E6%95%B0%E6%8D%AE%E5%BA%93)

[如何正确的缓存](https://houbb.github.io/2018/09/01/cache-07-cache-right)

# 参考资料

p25

* any list
{:toc}
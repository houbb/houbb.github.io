---
layout: post
title: Memory 内存知识-14-缓存实现的细节之多处理器支持
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# 回顾

In the previous section we have already pointed out the problem we have when multiple processors come into play. 

Even multi-core processors have the problem for those cache levels which are not shared (at least the L1d).

It is completely impractical to provide direct access from one processor to the cache of another processor. 

提供从一个处理器到另一个处理器的高速缓存的直接访问是完全不切实际的。

The connection is simply not fast enough, for a start. 

The practical alternative is to transfer the cache content over to the other processor in case it is needed. 

Note that this also applies to caches which are not shared on the same processor.

实际的替代方案是在需要时将缓存内容传输到另一个处理器。

请注意，这也适用于未在同一处理器上共享的高速缓存。

# 问题

The question now is when does this cache line transfer have to happen? 

## 回答

This question is pretty easy to answer: 

when one processor needs a cache line which is dirty in another processor’s cache for reading or writing. 

But how can a processor determine（确定） whether a cache line is dirty in another processor’s cache? 

Assuming it just because a cache line is loaded by another processor would be suboptimal (at best). 

假设它只是因为另一个处理器加载了一个缓存行，那将是次优的（最多）。

Usually the majority of memory accesses are read accesses and the resulting cache lines are not dirty. 

Processor operations on cache lines are frequent (of course, why else would we have this paper?) which means broadcasting information about changed cache lines after each write access would be impractical.

通常，大多数内存访问都是读访问，并且生成的缓存行不是脏的。

高速缓存行上的处理器操作是频繁的（当然，为什么我们还有这篇论文呢？）这意味着在每次写访问之后广播有关已更改的高速缓存行的信息是不切实际的。

# MESI

What developed over the years is the MESI cache coherency protocol (Modified, Exclusive, Shared, Invalid).

The protocol is named after the four states a cache line can be in when using the MESI protocol:

## 协议

Modified: The local processor has modified the cache line. This also implies it is the only copy in any cache.

Exclusive: The cache line is not modified but known to not be loaded into any other processor’s cache.

Shared: The cache line is not modified and might exist in another processor’s cache.

Invalid: The cache line is invalid, i.e., unused.

修改：本地处理器已修改缓存行。 这也意味着它是任何缓存中的唯一副本。

独占：缓存行未被修改，但已知不会加载到任何其他处理器的缓存中。

共享：缓存行未被修改，可能存在于另一个处理器的缓存中。

无效：缓存行无效，即未使用。


## 发展历史

This protocol developed over the years from simpler versions which were less complicated（不太复杂） but also less efficient（不太高效）.

With these four states it is possible to efficiently implement write-back caches while also supporting concurrent use of read-only data on different processors.

![image](https://user-images.githubusercontent.com/18375710/62096872-b364d580-b2b7-11e9-9cff-5d1b34b38322.png)

The state changes are accomplished without too much effort by the processors listening, or snooping（窥探）, on the other processors’ work. 

Certain operations a processor performs are announced on external pins and thus make the processor’s cache handling visible to the outside. 

处理器执行的某些操作在外部引脚上公布，从而使处理器的缓存处理对外部可见。

The address of the cache line in question is visible on the address bus. 

In the following description of the states and their transitions (shown in Figure 3.18) we will point out when the bus is involved.

## 状态流转

Initially all cache lines are empty and hence also Invalid.

If data is loaded into the cache for writing the cache changes to Modified. 

If the data is loaded for reading the new state depends on whether another processor has the cache line loaded as well. 

If this is the case then the new state is Shared, otherwise Exclusive.

# Request For Ownership

## 场景

If a Modified cache line is read from or written to on the local processor, the instruction（指令） can use the current cache content and the state does not change. 

If a second processor wants to read from the cache line the first processor has to send the content of its cache to the second processor and then it can change the state to Shared.

The data sent to the second processor is also received and processed by the memory controller which stores the content in memory. 

If this did not happen the cache line could not be marked as Shared. 

If the second processor wants to write to the cache line the first processor sends the cache line content and marks the cache line locally
as Invalid. 

## RFO

This is the infamous（臭名昭著的） “Request For Ownership” (RFO) operation. 

Performing this operation in the last level cache, just like the **I->M** transition is comparatively（相对） expensive. 

For write-through caches we also have to add the time it takes to write the new cache line content to the next higher-level cache or the main memory, further increasing the cost.

对于直写高速缓存，我们还必须添加将新高速缓存行内容写入下一个更高级别高速缓存或主存储器所需的时间，从而进一步增加成本。

ps: 这种 RFO 操作的代价是非常大的。

# Shared state

If a cache line is in the **Shared** state and the local processor reads from it no state change is necessary and the read request can be fulfilled from the cache. 

If the cache line is locally written to the cache line can be used as well but the state changes to **Modified**. 

It also requires that all other possible copies of the cache line in other processors are marked as **Invalid**. 

Therefore the write operation has to be announced（声明） to the other processors via an RFO message. 

If the cache line is requested for reading by a second processor nothing has to happen. 

The main memory contains the current data and the local state is already Shared. 

In case a second processor wants to write to the cache line (RFO) the cache line is simply marked Invalid. 

No bus operation is needed.


# Exclusive state

The Exclusive state is mostly identical to the Shared state with one crucial（关键的） difference: 

a local write operation does not have to be announced on the bus. 

ps: 相当于这个变量是当前处理器私有的，没有任何其他处理器使用。所以不用通知。

The local cache is known to be the only one holding this specific cache line. 

This can be a huge advantage so the processor will try to keep as many cache lines as possible in the Exclusive state instead of the Shared state. 

The latter is the fallback（倒退） in case the information is not available at that moment. 

The Exclusive state can also be left out（抛弃） completely without causing functional problems. 

It is only the performance that will suffer since the E->M transition is much faster than the S->M transition.

## 两个场景

There are two situations when RFO messages are necessary:

- A thread is migrated（迁移） from one processor to another and all the cache lines have to be moved over to the new processor once.

- A cache line is truly needed in two different processors.

# 数据同步的必要性

In multi-thread or multi-process programs there is always some need for synchronization; 

this synchronization is implemented using memory. 

So there are some valid RFO messages. 

They still have to be kept as infrequent（罕见的） as possible. 

There are other sources of RFO messages, though. 

In section 6 we will explain these scenarios（场景）. 

The Cache coherency（相关性） protocol messages must be distributed among the processors of the system. 

A MESI transition cannot happen until it is clear that all the processors in the system have had a chance to reply to the message.

That means that the longest possible time a reply can take determines the speed of the coherency protocol.

Collisions on the bus are possible, latency can be high in NUMA systems, and of course sheer traffic volume can slow things down. 

All good reasons to focus on avoiding unnecessary traffic.

缓存相关性协议消息必须在系统的处理器之间分配。

在明确系统中的所有处理器都有机会回复消息之前，才能进行MESI转换。

这意味着回复可以采用的最长时间决定了一致性协议的速度。

总线上的冲突是可能的，NUMA系统中的延迟可能很高，当然，纯粹的流量可能会减慢速度。

所有好的理由都集中在避免不必要的流量上。

## 另外的问题

There is one more problem related to having more than one processor in play. 

The effects are highly machine specific but in principle the problem always exists: 

the FSB is a shared resource. 

效果是高度机器特定的，但原则上问题始终存在：

In most machines all processors are connected via one single bus to the memory controller (see Figure 2.1). 

If a single processor can saturate（饱和） the bus (as is usually the case) then two or four processors sharing the same bus will restrict（限制） the bandwidth available to each processor even more.

Even if each processor has its own bus to the memory controller as in Figure 2.2 there is still the bus to the memory modules. 

Usually this is one bus but, even in the extended model in Figure 2.2, concurrent accesses to the same memory module will limit the bandwidth.

The same is true with the AMD model where each processor can have local memory. 

All processors can indeed concurrently access their local memory quickly, especially with the integrated memory controller. 

## 多处理器要小心处理并行问题

But multithread and multi-process programs at least from time to time have to access the same memory regions to synchronize.

Concurrency is severely limited by the finite bandwidth available for the implementation of the necessary synchronization.

Programs need to be carefully designed to minimize accesses from different processors and cores to the same memory locations. 

The following measurements will show this and the other cache effects related to multi-threaded code.

# 参考资料

p26

* any list
{:toc}
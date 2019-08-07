---
layout: post
title: Memory 内存知识-20-影响缓存命中的因素
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Cache Miss Factors

We have already seen that when memory accesses miss the caches the costs skyrocket（飞涨）. 

Sometimes this is not avoidable and it is important to understand the actual costs and what can be done to mitigate（减轻） the problem.

# Cache and Memory Bandwidth

## 衡量的标准

To get a better understanding of the capabilities of the processors we measure the bandwidth available in optimal circumstances（情况）. 

This measurement is especially interesting since different processor versions vary widely.

This is why this section is filled with the data of several different machines. 

The program to measure performance uses the SSE instructions of the x86 and x86-64 processors to load or store 16 bytes at once. 


## 性能图示

The working set is increased from 1kB to 512MB just as in our other tests and it is measured how many bytes per cycle can be
loaded or stored.

Figure 3.24 shows the performance on a 64-bit Intel Netburst processor. 

![image](https://user-images.githubusercontent.com/18375710/62622297-9af85900-b950-11e9-8b9f-fdb44d4ba4e3.png)

For working set sizes which fit into L1d the processor is able to read the full 16 bytes per cycle, i.e., one load instruction is performed per cycle (the movaps instruction moves 16 bytes at once). 

The test does not do anything with the read data, we test only the read instructions themselves. 

As soon as the L1d is not sufficient anymore the performance goes down dramatically（显着） to less than 6 bytes per cycle. 

The step at 218 bytes is due to the exhaustion of the DTLB cache which means additional work for each new page. 

## 顺序读预取

Since the reading is sequential prefetching can predict the accesses perfectly and the FSB can stream the memory content at about 5.3 bytes per cycle for all sizes of the working set.

The prefetched data is not propagated（传播） into L1d, though. 

These are of course numbers which will never be achievable in a real program. 

Think of them as practical limits.

## 写入和复制的性能

What is more astonishing(惊人) than the read performance is the write and copy performance. 

The write performance, even for small working set sizes, does not ever rise above 4 bytes per cycle. 

This indicates that, in these Netburst processors, Intel elected to use a Write-Through mode for L1d where the performance is obviously limited by the L2 speed. 

This also means that the performance of the copy test, which copies from one memory region into a second, non-overlapping memory region, is not significantly worse. 

The necessary read operations are so much faster and can partially overlap（部分重叠） with the write operations.

The most noteworthy（值得一提的） detail of the write and copy measurements is the low performance once the L2 cache is not sufficient anymore. 

The performance drops to 0.5 bytes per cycle! 

That means write operations are by a factor of ten slower than the read operations. 

This means optimizing those operations is even more important for the performance of the program.

ps: 优化写比优化读更加重要，不过也要考虑到读写比例。

## P4 Bandwidth with 2 Hyper-Threads

In Figure 3.25 we see the results on the same processor but with two threads running, one pinned to each of the two hyper-threads of the processor. 

![image](https://user-images.githubusercontent.com/18375710/62623763-350dd080-b954-11e9-9f0f-6a9b446d46a3.png)

The graph is shown at the same scale as the previous one to illustrate（说明） the differences and the curves are a bit jittery simply because of the problem of measuring two concurrent threads.

The results are as expected. 

Since the hyper-threads share all the resources except the registers each thread has only half the cache and bandwidth available. 

That means even though each thread has to wait a lot and could award the other thread with execution time this does not make any difference since the other thread also has to wait for the memory. 

This truly shows the worst possible use of hyper-threads.

## 对比

Compared to Figure 3.24 and 3.25 the results in Figure 3.26 and 3.27 look quite different for an Intel Core 2 processor. 

This is a dual-core processor with shared L2 which is four times as big as the L2 on the P4 machine.

This only explains the delayed drop-off（放下） of the write and copy performance, though.

![image](https://user-images.githubusercontent.com/18375710/62624287-58854b00-b955-11e9-8105-28c8fc81c130.png)

There are other, bigger differences. 

The read performance throughout the working set range hovers around the optimal（最佳） 16 bytes per cycle. 

The drop-off in the read performance after 220 bytes is again due to the working set being too big for the DTLB. 

Achieving these high numbers means the processor is not only able to prefetch the data and transport the data in time. 

It also means the data is prefetched into L1d.


## 执行器的缓存策略

The write and copy performance is dramatically different, too. 

The processor does not have a Write-Through policy; written data is stored in L1d and only evicted when necessary. 

This allows for write speeds close to the optimal 16 bytes per cycle. 

ps: 这里不采取 write-through 的方式，可以让写的性能尽可能的很高。

Once L1d is not sufficient anymore the performance drops significantly. 

As with the Netburst processor, the write performance is significantly lower. 

Due to the high read performance the difference is even higher here. 

In fact, when even the L2 is not sufficient anymore the speed difference increases to a factor of 20! 

This does not mean the Core 2 processors perform poorly. 

To the contrary（与此相反的）, their performance is always better than the Netburst core’s.

## 双线程

![image](https://user-images.githubusercontent.com/18375710/62624447-ae59f300-b955-11e9-9071-d9cd35c0d161.png)

In Figure 3.27 the test runs two threads, one on each of the two cores of the Core 2 processor. 

Both threads access the same memory, not necessarily perfectly in sync, though. 

The results for the read performance are not different from the single-threaded case. 

A few more jitters（抖动） are visible which is to be expected in any multi-threaded test case.

### 有趣的地方

The interesting point is the write and copy performance for working set sizes which would fit into L1d. 

As can be seen in the figure, the performance is the same as if the data had to be read from the main memory. 

Both threads compete for the same memory location and RFO messages for the cache lines have to be sent. 

The problematic（问题） point is that these requests are not handled at the speed of the L2 cache, even though both cores share the cache.

Once the L1d cache is not sufficient anymore modified entries are flushed from each core’s L1d into the shared L2. 

At that point the performance increases significantly since now the L1d misses are satisfied by the L2 cache and RFO messages are only needed when the data has not yet been flushed. 

This is why we see a 50% reduction in speed for these sizes of the working set. 

The asymptotic（渐近） behavior is as expected: since both cores share the same FSB each core gets half the FSB bandwidth which means for large working sets each thread’s performance is about half that of the single threaded case.

一旦L1d高速缓存不足，则将每个核心的L1d刷新到共享L2中。

此时，性能显着提高，因为现在L2缓存已经被L2缓存满足，并且仅在数据尚未刷新时才需要RFO消息。

这就是我们看到这些尺寸的工作装置速度降低50％的原因。

渐近行为与预期的一样：由于两个内核共享相同的FSB，因此每个内核获得FSB带宽的一半，这意味着对于大型工作集，每个线程的性能大约是单线程情况的一半。

Because there are significant differences even between the processor versions of one vendor（供应商） it is certainly worthwhile looking at the performance of other vendors’ processors, too. 

## AMD系列10h Opteron处理器

Figure 3.28 shows the performance of an AMD family 10h Opteron processor. 

This processor has 64kB L1d, 512kB L2, and 2MB of L3. 

The L3 cache is shared between all cores of the processor. 

The results of the performance test can be seen in Figure 3.28.

![image](https://user-images.githubusercontent.com/18375710/62625767-7c965b80-b958-11e9-97e2-72b54129ad07.png)

### 读性能

The first detail one notices about the numbers is that the processor is capable of handling two instructions per cycle if the L1d cache is sufficient（足够）. 

The read performance exceeds 32 bytes per cycle and even the write performance is, with 18.7 bytes per cycle, high. 

The read curve flattens（变平） quickly, though, and is, with 2.3 bytes per cycle, pretty low. 

The processor for this test does not prefetch any data, at least not efficiently.

### 写性能

The write curve on the other hand performs according to the sizes of the various caches. 

The peak performance is achieved for the full size of the L1d, going down to 6 bytes per cycle for L2, 
to 2.8 bytes per cycle for L3, and finally 0.5 bytes per cycle if not even L3 can hold all the data. 

The performance for the L1d cache exceeds that of the (older) Core 2 processor, the L2 access is equally fast (with the Core 2 having a larger cache), and the L3 and main memory access is slower.

The copy performance cannot be better than either the read or write performance. 

This is why we see the curve initially dominated by the read performance and later by the write performance.



# 多线程性能

The multi-thread performance of the Opteron processor is shown in Figure 3.29. 

![image](https://user-images.githubusercontent.com/18375710/62626628-61c4e680-b95a-11e9-8393-1597b64a9eb1.png)

## 读性能

The read performance is largely unaffected. 

Each thread’s L1d and L2 works as before and the L3 cache is in this case not prefetched very well either. 

The two threads do not unduly（过度地） stress the L3 for their purpose. 

The big problem in this test is the write performance. 

All data the threads share has to go through the L3 cache. 

This sharing seems to be quite inefficient since even if the L3 cache size is sufficient to hold the entire working set the cost is significantly higher than an L3 access. 

Comparing this graph with Figure 3.27 we see that the two threads of the Core 2 processor operate at the speed of the shared L2 cache for the appropriate range of working set sizes. 

This level of performance is achieved for the Opteron processor only for a very small range of the working set sizes and even here it approaches only the speed of the L3 which is slower than the Core 2’s L2.

# 参考资料

P34

* any list
{:toc}
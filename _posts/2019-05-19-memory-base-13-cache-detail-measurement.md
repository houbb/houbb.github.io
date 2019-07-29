---
layout: post
title: Memory 内存知识-13-缓存实现的细节之测量缓存效果
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Measurements of Cache Effects

All the figures are created by measuring a program which can simulate working sets of arbitrary（随意） size, 
read and write access, and sequential or random access. 

We have already seen some results in Figure 3.4. 

The program creates an array corresponding to（对应于） the working set size of elements of this type:

```c
struct l {
    struct l *n;
    long int pad[NPAD];
};
```

All entries are chained in a circular list using the n element, either in sequential or random order. 

Advancing（前进） from one entry to the next always uses the pointer, even if the elements are laid out sequentially. 

The pad element is the payload and it can grow arbitrarily（任意） large. 

In some tests the data is modified, in others the program only performs read operations.

## 性能评定的标准

In the performance measurements we are talking about working set sizes. 

The working set is made up of an array of struct l elements. 

A working set of 2^N bytes contains `2^N / sizeof(struct l)` elements. 

Obviously `sizeof(struct l)` depends on the value of NPAD. 

For 32-bit systems, NPAD=7 means the size of each array element is 32 bytes, for 64-bit systems the size is 64 bytes.

# Single Threaded Sequential Access 

The simplest case is a simple walk over all the entries in the list. 

ps: 最简单的场景就是单线程，顺序读列表中的所有元素。

The list elements are laid out sequentially, densely packed（密密麻麻的）.

Whether the order of processing is forward or backward does not matter, the processor can deal with both directions equally well. 

What we measure here–and in all the following tests–is how long it takes to handle a single list element. 

The time unit is a processor cycle. 

Figure 3.10 shows the result. 

Unless otherwise specified, all measurements are made on a Pentium 4 machine in 64-bit mode which means the structure l with NPAD=0 is eight bytes in size.

![image](https://user-images.githubusercontent.com/18375710/62027857-5ca4c080-b211-11e9-8c22-83ed711c1431.png)

## 解释

The first two measurements are polluted by noise（被噪音污染了）. 

The measured workload（工作量） is simply too small to filter the effects of the rest of the system out. 

We can safely assume that the values are all at the 4 cycles level. 

With this in mind（考虑到这一点） we can see three distinct levels:

- Up to a working set size of 214 bytes.

- From 215 bytes to 220 bytes.

- From 221 bytes and up.

These steps can be easily explained: the processor has a 16kB L1d and 1MB L2. 

We do not see sharp edges（锋利的边缘） in the transition from one level to the other 
because the caches are used by other parts of the system as well and so the cache is not exclusively available（专有） for the program data.

Specifically the L2 cache is a unified（统一） cache and also used for the instructions（说明） (NB: Intel uses inclusive caches).

## 不同 work-size 消耗的不同时间

What is perhaps not quite expected are the actual times for the different working set sizes. 

The times for the L1d hits are expected: 

load times after an L1d hit are around 4 cycles on the P4. 

But what about the L2 accesses?

Once the L1d is not sufficient to hold the data one might expect it would take 14 cycles or more per element since this is the access time for the L2. 

But the results show that only about 9 cycles are required. 

### 原因解释

This discrepancy（差异） can be explained by the advanced logic in the processors.

In anticipation（预期） of using consecutive（连续） memory regions, the processor prefetches（预取） the next cache line. 

This means that when the next line is actually used it is already halfway loaded. 

The delay required to wait for the next cache line to be loaded is therefore much less than the L2 access time.

ps: 每次加载，都会对连续的内存区域进行预取。这样就降低了下一次加载消耗的时间。

### 预取的效果

The effect of prefetching is even more visible once the working set size grows beyond the L2 size. 

Before we said that a main memory access takes 200+ cycles. 

Only with effective prefetching is it possible for the processor to keep the access times as low as 9 cycles. 

As we can see from the difference between 200 and 9, this works out nicely.

### 效果的观察

We can observe the processor while prefetching, at least indirectly. 

In Figure 3.11 we see the times for the same working set sizes but this time we see the graphs for different sizes of the structure l. 

This means we have fewer but larger elements in the list. 

The different sizes have the effect that the distance between the n elements in the (still consecutive（不是连续的）) list grows. 

In the four cases of the graph the distance is 0, 56, 120, and 248 bytes respectively.

![image](https://user-images.githubusercontent.com/18375710/62029039-49dfbb00-b214-11e9-8a15-674fc0630ac4.png)

At the bottom we can see the line from Figure 3.10, but this time it appears more or less as a flat line（水平线）. 

The times for the other cases are simply so much worse. 

We can see in this graph, too, the three different levels and we see the large errors in the tests with the small working set sizes
(ignore them again). 

The lines more or less all match each other as long as only the L1d is involved（参与）. 

There is no prefetching necessary so all element sizes just hit the L1d for each access.

## L2 cache 

For the L2 cache hits we see that the three new lines all pretty much match each other but that they are at a higher level (about 28). 

This is the level of the access time for the L2. 

This means prefetching from L2 into L1d is basically disabled（基本禁用）. 

Even with NPAD=7 we need a new cache line for each iteration of the loop; 

for NPAD=0, instead, the loop has to iterate eight times before the next cache line is needed. 

The prefetch logic cannot load a new cache line every cycle. 

Therefore we see a stall to load from L2 in every iteration.

预取逻辑无法在每个周期加载新的高速缓存行。

因此，我们在每次迭代中都会看到从L2加载的停顿。

## work-set 大小超过 L2 容量时

It gets even more interesting once the working set size exceeds the L2 capacity. 

Now all four lines vary widely. 

The different element sizes play obviously a big role in the difference in performance. 

The processor should recognize the size of the strides（步幅） and not fetch unnecessary cache lines for NPAD=15 and 31 since the element size is smaller than the prefetch window (see section 6.3.1).

### 限制

Where the element size is hampering（妨碍） the prefetching efforts is a result of a limitation of hardware prefetching:

it cannot cross page boundaries（不能超过分页限制）. 

We are reducing the effectiveness of the hardware scheduler by 50% for each size increase. 

If the hardware prefetcher were allowed to cross page boundaries and the next page is not resident（居民） or valid the OS would have to get involved in locating the page. 

That means the program would experience a page fault（错误） it did not initiate（发起） itself. 

This is completely unacceptable since the processor does not know whether a page is not present or does not exist. 

In the latter case the OS would have to abort the process. 

In any case, given that, for NPAD=7 and higher, we need one cache line per list element the hardware prefetcher cannot do much. 

There simply is no time to load the data from memory since all the processor does is read one word and then load the next element.

这意味着该程序将遇到一个页面错误（错误）它没有启动（发起）本身。

这是完全不可接受的，因为处理器不知道页面是否不存在或不存在。

在后一种情况下，操作系统必须中止该过程。

在任何情况下，鉴于NPAD = 7或更高，我们需要每个列表元素一个缓存行，硬件预取器不能做太多。

没有时间从内存加载数据，因为所有处理器都读取一个字然后加载下一个元素。

# TLB(Translation Lookaside Buffer) Cache

Another big reason for the slowdown are the misses of the TLB cache. 

This is a cache where the results of the translation of a virtual address to a physical address are stored, as is explained in more detail in section 4. 

ps: 提供虚拟地址与物理地址之间的映射。

The TLB cache is quite small since it has to be extremely（非常） fast. 

If more pages are accessed repeatedly than the TLB cache has entries for the translation from virtual to physical address has to be constantly repeated. 

如果重复访问的页面多于TLB缓存，则必须不断重复从虚拟地址到物理地址的转换条目。

This is a very costly operation. 

With larger element sizes the cost of a TLB lookup is amortized（摊销） over fewer elements. 

That means the total number of TLB entries which have to be computed per list element is higher.

## TLB 的影响

To observe the TLB effects we can run a different test.

For one measurement we lay out the elements sequentially as usual. 

We use NPAD=7 for elements which occupy（占据） one entire cache line. 

For the second measurement we place each list element on a separate（分离） page. 

The rest of each page is left untouched（不变） and we do not count it in the total for the working set size.

The consequence is that, for the first measurement, each list iteration requires a new cache line and, for every 64 elements, a new page.

For the second measurement each iteration requires loading a new cache line which is on a new page.

结果是，对于第一次测量，每个列表迭代需要新的高速缓存行，并且对于每64个元素，需要新的页面。

对于第二次测量，每次迭代都需要加载新页面上的新缓存行。

## 性能结果图

The result can be seen in Figure 3.12. 

![image](https://user-images.githubusercontent.com/18375710/62041751-fe86d600-b22e-11e9-9da8-8586e4da0d09.png)

The measurements were performed on the same machine as Figure 3.11.

Due to limitations of the available RAM the working set size had to be restricted（限制） to 224 bytes which requires 1GB to place the objects on separate pages. 

The lower, red curve corresponds exactly to the NPAD=7 curve in Figure 3.11. 

We see the distinct steps showing the sizes of the L1d and L2 caches. 

The second curve looks radically（根本） different. 

The important feature is the huge spike（巨大的尖峰） starting when the working set size reaches 213 bytes. 

This is when the TLB cache overflows（溢出）. 

With an element size of 64 bytes we can compute that the TLB cache has 64 entries. 

There are no page faults affecting the cost since the program locks the memory to prevent it from being swapped out.

由于程序锁定内存以防止其被换出，因此没有影响成本的分页错误。

As can be seen the number of cycles it takes to compute the physical address and store it in the TLB is very high.

The graph in Figure 3.12 shows the extreme（极端） case, but it should now be clear that a significant factor（重要因素） in the slowdown （较少） for larger NPAD values is the reduced（降低） efficiency of the TLB cache. 

Since the physical address has to be computed before a cache line can be read for either L2 or main memory the address translation penalties（处罚） are additive to the memory access times. 

This in part explains why the total cost per list element for NPAD=31 is higher than the theoretical access time for the RAM.

这部分解释了为什么NPAD = 31的每个列表元素的总成本高于RAM的理论访问时间。

# 预取的更多细节

We can glimpse（一瞥） a few more details of the prefetch implementation by looking at the data of test runs where the list elements are modified. 

## 图示

![image](https://user-images.githubusercontent.com/18375710/62042659-3000a100-b231-11e9-91d7-770bdb6b47db.png)

Figure 3.13 shows three lines. 

The element width is in all cases 16 bytes. 

The first line is the now familiar list walk which serves as a baseline. 

第一行是现在熟悉的列表遍历，作为基线。

The second line, labeled “Inc”, simply increments the `pad[0]` member of the current element before going on to the next. 

The third line, labeled “Addnext0”, takes the `pad[0]` list element of the next element and adds it to the `pad[0]` member of the current list element.


## 解释

The naive assumption（天真的假设） would be that the “Addnext0” test runs slower because it has more work to do. 

天真的假设是“Addnext0”测试运行得更慢，因为它还有更多的工作要做。

Before advancing to the next list element a value from that element has to be loaded. 

This is why it is surprising to see that this test actually runs, for some working set sizes, faster than the “Inc” test. 

在前进到下一个列表元素之前，必须加载该元素的值。

这就是为什么令人惊讶地看到这个测试实际上运行，对于一些工作集大小，比“Inc”测试更快。

The explanation for this is that the load from the next list element is basically a forced prefetch.

Whenever the program advances（进展） to the next list element we know for sure that element is already in the L1d cache. 

As a result we see that the “Addnext0” performs as well as the simple “Follow” test as long as the working set size fits into the L2 cache.

- 个人理解

所要加载的信息，全部被提前加载到了 cache 中。所有只要 work-set 大小小于 L2 cache，都工作良好。

## L2 超出时的性能

The “Addnext0” test runs out of L2 faster than the “Inc” test, though. 

It needs more data loaded from main memory. 

This is why the “Addnext0” test reaches the 28 cycles level for a working set size of 221 bytes. 

The 28 cycles level is twice as high as the 14 cycles level the “Follow” test reaches. 

This is easy to explain, too. 

Since the other two tests modify memory an L2 cache eviction to make room for new cache lines cannot simply discard（丢弃） the data. 

Instead it has to be written to memory. 

This means the available bandwidth on the FSB is cut in half, hence doubling the time it takes to transfer the data from main
memory to L2.

- 个人理解

`Addnext0` 这个模式会强制加载下一个元素到 cache，但是如果超过了 L2 cache，就会导致性能下降，并且每次加载都是普通的 2 倍左右。

# 高速缓存的大小与性能

One last aspect of the sequential, efficient cache handling is the size of the cache. 

This should be obvious but it still should be pointed out. 

## 图示

Figure 3.14 shows the timing for the Increment benchmark with 128-byte elements (NPAD=15 on 64-bit machines). 

![image](https://user-images.githubusercontent.com/18375710/62043511-211aee00-b233-11e9-8788-59a7109f6572.png)

This time we see the measurement from three different machines. 

The first two machines are P4s, the last one a Core2 processor.

The first two differentiate themselves by having different cache sizes. 

The first processor has a 32k L1d and an 1M L2. 

The second one has 16k L1d, 512k L2, and 2M L3. 

The Core2 processor has 32k L1d and 4M L2.

## 解释

The interesting part of the graph is not necessarily how well the Core2 processor performs relative to the other two (although it is impressive（优秀）). 

The main point of interest here is the region where the working set size is too large for the respective last level cache and the main
memory gets heavily involved.

这里的主要关注点是工作集大小对于相应的最后一级缓存而言太大而且主存储器受到严重影响的区域。

As expected, the larger the last level cache is the longer the curve stays at the low level corresponding to the L2 access costs. 

The important part to notice is the performance advantage this provides. 

The second processor (which is slightly older) can perform the work on the working set of 220 bytes twice as fast as the first processor.

All thanks to the increased last level cache size. 

The Core2 processor with its 4M L2 performs even better.

最后一个缓存，极大的提升性能。

For a random workload this might not mean that much.

But if the workload can be tailored to（量身定做） the size of the last level cache the program performance can be increased quite dramatically（显著）. 

This is why it sometimes is worthwhile（值得） to spend the extra money for a processor with a larger cache.

- 个人理解

通过这个图，我们得知 cache 对于性能的提升是非常显著的。


----

# Single Threaded Random Access（单线程随机访问）

We have seen that the processor is able to hide most of the main memory and even L2 access latency by prefetching cache lines into L2 and L1d. 

This can work well only when the memory access is predictable（可预测的）, though.

- 个人理解

因为顺序访问的信息是可预测的，所以提前加载需要访问的信息到 cache，可以提升性能。

那如果随机读呢？

If the access pattern is unpredictable or random the situation is quite different. 

## 随机 VS 顺序

Figure 3.15 compares the per-listelement times for the sequential access (same as in Figure 3.10) with the times when the list elements are randomly distributed in the working set. 

The order is determined by the linked list which is randomized. 

There is no way for the processor to reliably prefetch data. 

This can only work by chance if elements which are used shortly after one another are also close to each other in memory.

![image](https://user-images.githubusercontent.com/18375710/62044216-edd95e80-b234-11e9-9ce1-303abb232768.png)

- 个人理解

根据图示，随机图和顺序图的性能差距非常之大。

## 注意点

There are two important points to note in Figure 3.15.

The first is the large number of cycles needed for growing working set sizes. 

The machine makes it possible to access the main memory in 200-300 cycles but here we reach 450 cycles and more. 

We have seen this phenomenon（现象） before (compare Figure 3.11). 

The automatic prefetching is actually working to a disadvantage（缺点） here.

- 个人理解

加载消耗的时间肯定和 work-set 的大小成正比。

这里的自动加载，只会增加负担，因为下一次读取是随机的。

### 消耗时间持续上升

The second interesting point is that the curve is not flattening at various plateaus as it has been for the sequential
access cases. 

第二个有趣的一点是，曲线在各种平台上并不像在顺序中那样变平访问案例。

ps: 个人理解的是，这里的 cache 基本也已经失效了。

The curve keeps on rising. 

To explain this we can measure the L2 access of the program for the various working set sizes. 

The result can be seen in Figure 3.16 and Table 3.2.

# L2 cache 在随机读的表现

## 命中率

![image](https://user-images.githubusercontent.com/18375710/62045008-d56a4380-b236-11e9-8a62-703da3f1a4dd.png)

The figure shows that, when the working set size is larger than the L2 size, the cache miss ratio (L2 accesses / L2
misses) starts to grow. 

The curve has a similar form to the one in Figure 3.15: it rises quickly, declines slightly（略微下降）, and starts to rise again. 

There is a strong correlation（相关性） with the cycles per list element graph. 

The L2 miss rate will grow until it eventually reaches close to 100%. 

Given a large enough working set (and RAM) the probability that any of the randomly picked cache lines is in L2 or is in the process of being loaded can be reduced arbitrarily（任意减少）.


- 个人理解

简而言之，命中率随着数据提升，会越来越高。

The increasing cache miss rate alone explains some of the costs. 

But there is another factor.

## 性能

![image](https://user-images.githubusercontent.com/18375710/62045281-98eb1780-b237-11e9-971c-f4efa939c1a4.png)

Looking at Table 3.2 we can see in the L2/#Iter columns that the total number of L2 uses per iteration of the program is growing.

Each working set is twice as large as the one before. 

So, without caching we would expect double the main memory accesses. 

With caches and (almost) perfect predictability we see the modest increase in the L2 use shown in the data for sequential access. 

The increase is due to the increase of the working set size and nothing else.

- 个人理解

原来顺序读预取可以提升性能，但是现在只会增加访问主存的负担。


## TLB MISS

For random access the per-element access time more than doubles for each doubling of the working set size. 

This means the average access time per list element increases since the working set size only doubles. 

The reason behind this is a rising rate of TLB misses. 

- 个人理解

TLB 是一种提升虚拟地址到物理地址的 cache，大小也是有限的。

如果使用这种预取，会导致 TLB 的很多缓存被挤掉，性能降低。

# 页面智能随机化

In Figure 3.17 we see the cost for random accesses for NPAD=7. 

Only this time the randomization is modified. 

## 图示

![image](https://user-images.githubusercontent.com/18375710/62045593-570ea100-b238-11e9-9aa1-5a56ef3f7ca6.png)

While in the normal case the entire list of randomized as one block (indicated by the label1) the other 11 curves show randomizations
which are performed in smaller blocks. 

For the curve labeled ‘60’ each set of 60 pages (245.760 bytes) is randomized individually（个别的）. 

That means all list elements in the block are traversed before going over to an element in the next block. 

This has the effect that number of TLB entries which are used at any one time is limited.

## 元素测试的变量控制

The element size for NPAD=7 is 64 bytes, which corresponds to（对应） the cache line size. 

Due to the randomized order of the list elements it is unlikely that the hardware prefetcher has any effect, most certainly not for more than a handful of elements. 

由于列表元素的随机顺序，硬件预取器不太可能具有任何效果，绝大多数情况下不会超过少数元素。

This means the L2 cache miss rate does not differ significantly（显著） from the randomization of the entire list in one block. 

ps: 这里控制了一个变量，那就是 L2 的缓存命中率。

## 测试结论

The performance of the test with increasing block size approaches asymptotically（渐进） the curve for the one-block randomization. 

This means the performance of this latter test case is significantly influenced by the TLB misses. 

If the TLB misses can be lowered the performance increases significantly (in one test we will see later up to 38%).

我们得出结论，随着 size 的增加，TLB 的 cache 命中率显著下降，性能也显著下降。

# 参考资料

p24

[虚拟内存，MMU/TLB，PAGE，Cache之间关系](http://blog.chinaunix.net/uid-12461657-id-3227788.html)

* any list
{:toc}
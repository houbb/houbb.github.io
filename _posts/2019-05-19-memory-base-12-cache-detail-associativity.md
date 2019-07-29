---
layout: post
title: Memory 内存知识-12-缓存实现的细节之关联性
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# CPU Cache Implementation Details

Cache implementers have the problem that each cell in the huge main memory potentially（可能） has to be cached. 

If the working set of a program is large enough this means there are many main memory locations which fight for each place in the cache. 

Previously it was noted that a ratio of 1-to-1000 for cache versus main memory size is not uncommon.

# Associativity（关联性）

## 完全关联的缓存

It would be possible to implement a cache where each cache line can hold a copy of any memory location (see Figure 3.5). 

This is called a fully associative cache. 

To access a cache line the processor core would have to compare the tags of each and every cache line with the tag for the requested address. 

The tag would be comprised（构成） of the entire part of the address which is not the offset into the cache line (that means, S in the figure on page 15 is zero).

There are caches which are implemented like this but, by looking at the numbers for an L2 in use today, will show that this is impractical（不切实际）. 

标签将包含（构成）地址的整个部分，而不是高速缓存行的偏移量（这意味着，第15页图中的S为零）。

有像这样实现的缓存，但是，通过查看今天使用的L2的数字，将显示这是不切实际的（不切实际）。

Given a 4MB cache with 64B cache lines the cache would have 65,536 entries. 

To achieve adequate performance the cache logic would have to be able to pick from all these entries the one matching a given tag in just a few cycles. 

The effort（功夫） to implement this would be enormous（巨大）.

给定具有64B高速缓存行的4MB高速缓存，高速缓存将具有65,536个条目。

为了获得足够的性能，高速缓存逻辑必须能够在几个周期内从所有这些条目中选择与给定标签匹配的条目。

实现这一目标的努力将是巨大的（巨大）。

![image](https://user-images.githubusercontent.com/18375710/61924022-97e88a80-af98-11e9-8484-17b84c312bb4.png)

For each cache line a comparator is needed to compare the large tag (note, S is zero).

The letter next to each connection indicates the width in bits. 

If none is given it is a single bit line. 

Each comparator has to compare two T-bit-wide values. 

Then, based on the result, the appropriate cache line content is selected and made available.

选择适当的缓存行内容并使其可用

This requires merging as many sets of O data lines as there are cache buckets. 

这需要合并与缓存桶一样多的O数据行集。

The number of transistors（晶体管） needed to implement a single comparator is large especially since it must work very fast. 

No iterative comparator is usable. 

The only way to save on the number of comparators is to reduce the number of them by iteratively comparing the tags. 

This is not suitable for the same reason that iterative comparators are not: it takes too long.

ps: 消耗了太多的时间。

Fully associative caches are practical for small caches (for instance, the TLB caches on some Intel processors are fully associative) but those caches are small, really small. 

- 一般的机器

```
L1d cache:             32K
L1i cache:             32K
L2 cache:              256K
L3 cache:              40960K
```

缓存大小，非常的小。

We are talking about a few dozen（一打，12 个） entries at most.

## 约束条件

For L1i, L1d, and higher level caches a different approach is needed. 

What can be done is to restrict（限制，约束） the search. 

In the most extreme（极端） restriction each tag maps to exactly one cache entry. 

The computation is simple: given the 4MB/64B cache with 65,536 entries we can directly address each entry by using bits 6 to 21 of the address (16 bits). 

The low 6 bits are the index into the cache line.

![image](https://user-images.githubusercontent.com/18375710/61926142-f9612700-afa1-11e9-889c-c3f2d781fbba.png)

Such a direct-mapped cache is fast and relatively easy to implement as can be seen in Figure 3.6. 

### 优点

It requires exactly one comparator, one multiplexer （复用器）(two in this diagram where tag and data are separated, but this is not a hard requirement on the design), and some logic to select only valid cache line content. 

The comparator is complex due to the speed requirements but there is only one of them now; 

as a result more effort can be spent on making it fast. 

- 改进后收益

物理元件只需要一个比较器、一个复用器。

比较器固然复杂，但是只有一个，总归有方法进行优化。

### 复杂的问题

The real complexity in this approach lies in the multiplexers. 


The number of transistors in a simple multiplexer grows with **O(log N)**, where N is the number of cache lines. 

This is tolerable（可容忍的） but might get slow, in which case speed can be increased by spending more real estate on transistors in the multiplexers to parallelize some of the work and to increase the speed. 

- 空间换时间

可以利用空间换时间。

虽然 cache size 的增长，晶体管可以增长的很慢。

The total number of transistors can grow slowly with a growing cache size which makes this solution very attractive（有吸引力）.

### 缺点

But it has a drawback: 

it only works well if the addresses used by the program are evenly distributed with respect to the bits used for the direct mapping. 

If they are not, and this is usually the case, some cache entries are heavily used and therefore repeated evicted while others are
hardly used at all or remain empty.

- 均匀分布

说道数据的分布，就会想到 hash。

说道均匀分布，那么增删节点，其实可以参考 [一致性 hash](https://houbb.github.io/2018/08/13/consistent-hash)

思想都是通用的。

# 解决 cache 分布均匀的问题

## 图示

![image](https://user-images.githubusercontent.com/18375710/61926524-7e007500-afa3-11e9-9945-120f68387a8e.png)

## 解决方案

This problem can be solved by making the cache set associative.

A set-associative cache combines the good features of the full associative and direct-mapped cachesto largely avoid the weaknesses of those designs. 

ps: 这种设计将前面两种的优缺点进行整合，融合了二者的长度。

Figure 3.7 shows the design of a set-associative cache. 

The tag and data storage are divided into sets, one of which is selected by the address of a cache line. 

This is similar to the direct-mapped cache. 

But instead of only having one element for each set value in the cache a small number of values is cached for the same set value. 

The tags for all the set members are compared in parallel, which is similar to the functioning of the fully associative cache.

标签和数据存储器被分成几组，其中一组由高速缓存线的地址选择。这类似于直接映射的缓存。

但是，不是仅为缓存中的每个设置值设置一个元素，而是为相同的设置值缓存少量值。并行比较所有集成员的标记，这类似于完全关联高速缓存的功能。

The result is a cache which is not easily defeated by unfortunate–or deliberate–selection of addresses with the same set numbers and at the same time the size of the cache is not limited by the number of comparators which can be implemented economically. 

结果是高速缓存不容易因不幸或故意选择具有相同设定数的地址而失败，同时高速缓存的大小不受可以经济地实现的比较器数量的限制。

If the cache grows it is (in this figure) only the number of columns which increases, not the number of rows. 

The number of rows (and therefore comparators) only increases if the associativity of the cache is increased. 

Today processors are using associativity levels of up to 24 for L2 caches or higher. 

L1 caches usually get by with 8 sets.

## 性能对比图

![image](https://user-images.githubusercontent.com/18375710/61927333-f9175a80-afa6-11e9-8daf-4f7ed3c7df94.png)

Given our 4MB/64B cache and 8-way set associativity the cache we are left with has 8,192 sets and only 13 bits of the tag are used in addressing the cache set. 

To determine（确认） which (if any) of the entries in the cache set contains the addressed cache line 8 tags have to be compared.

That is feasible to do in very short time. 

With an experiment we can see that this makes sense.

鉴于我们的 4MB/64B 高速缓存和8路组关联性，我们剩下的高速缓存有 8,192 组，并且只有 13 位标签用于寻址高速缓存集。

为了确定高速缓存组中的哪些条目（如果有的话）包含所寻址的高速缓存行 8，必须比较标签。

这在很短的时间内就可行了。

通过实验我们可以看出这是有道理的。

Table 3.1 shows the number of L2 cache misses for a program (gcc in this case, the most important benchmark of them all, according to the Linux kernel people) for changing cache size, cache line size, and associativity set size. 

In section 7.2 we will introduce the tool to simulate the caches as required for this test.

## 关联关系

Just in case this is not yet obvious（明显）, the relationship of all these values is that the cache size is

```
cache line size × associativity × number of sets
```

The addresses are mapped into the cache by using

```
O = log2 cache line size
S = log2 number of sets
```

in the way the figure on page 15 shows.

## 缓存大小与关联性图示

![image](https://user-images.githubusercontent.com/18375710/61928690-d2a7ee00-afab-11e9-9c55-05a168d98ebc.png)

Figure 3.8 makes the data of the table more comprehensible（容易理解的，直观的）.

It shows the data for a fixed cache line size of 32 bytes. 

Looking at the numbers for a given cache size we can see that associativity can indeed help to reduce the number of cache misses significantly（显著地）. 

For an 8MB cache going from direct mapping to 2-way set associative cache saves almost 44% of the cache misses. 

The processor can keep more of the working set in the cache with a set associative cache compared with a direct mapped cache.

对于从直接映射到双向组关联缓存的8MB缓存，可以节省近44％的缓存未命中。

与直接映射的高速缓存相比，处理器可以使用组关联高速缓存将更多工作集保留在高速缓存中。

In the literature（文献） one can occasionally（偶尔） read that introducing associativity has the same effect as doubling cache size. 

This is true in some extreme cases as can be seen in the jump from the 4MB to the 8MB cache. 

But it certainly is not true for further doubling of the associativity. 

As we can see in the data, the successive gains are much smaller. 

We should not completely discount the effects, though. 

In the example program the peak memory use is 5.6M. 

So with a 8MB cache there are unlikely to be many (more than two) uses for the same cache set.

With a larger working set the savings can be higher as we can see from the larger benefits of associativity for the smaller cache sizes.

使用更大的工作集可以节省更多，因为我们可以从更小的缓存大小的关联性的更大优势中看出。

- 命中率与缓存大小

其实也很容易理解，极端情况。

缓存无限大，把所有数据都缓存进去。命中率 100%。

当然这是不现实的，这样主存就失去意义了。价格也非常的昂贵。

# 关联关系

## 路的影响

In general, increasing the associativity of a cache above 8 seems to have little effects for a single-threaded workload（负载）.

With the introduction of hyper-threaded（超线程） processors where the first level cache is shared and multi-core processors which use a shared L2 cache the situation changes. 

Now you basically have two programs hitting on the same cache which causes the associativity in practice to be halved (or quartered for quad-core processors).

So it can be expected that, with increasing numbers of cores, the associativity of the shared caches should grow.

Once this is not possible anymore (16-way set associativity is already hard) processor designers have to start using shared L3 caches and beyond, while L2 caches are potentially（可能） shared by a subset of the cores.


## 缓存对于性能的影响

Another effect we can study in Figure 3.8 is how the increase in cache size helps with performance. 

This data cannot be interpreted without knowing about the working set size. 

Obviously, a cache as large as the main memory would lead to better results than a smaller cache, so there is in general no limit to the largest cache size with measurable benefits.

### 最佳缓存大小

As already mentioned above, the size of the working set at its peak is 5.6M. 

This does not give us any absolute number of the maximum beneficial cache size but it allows us to estimate（估计） the number. 

ps: 这个数据的大小需要根据实际的业务来进行界定调整。

The problem is that not all the memory used is contiguous and, therefore, we have, even with a 16M cache and a 5.6M working set, conflicts (see the benefit of the 2-way set associative 16MB cache over the direct mapped version). 

ps: 这里还有个问题需要注意，并不是所有的内存都是连续的。而不连续的内存就会导致访问变慢。顺序读永远是最快的。

But it is a safe bet that with the same workload the benefits of a 32MB cache would be negligible.（微不足道）

### 动态的看待 workload & cache size

But who says the working set has to stay the same? 

Workloads are growing over time and so should the cache size. 

When buying machines, and one has to choose the cache size one is willing to pay for, it is worthwhile to measure the working set size. 

Why this is important can be seen in the figures on page 21.


# 顺序读和随机读

Two types of tests are run. 

In the first test the elements are processed sequentially. 

The test program follows the pointer n but the array elements are chained so that they are traversed in the order in which they are found in memory.

This can be seen in the lower part of Figure 3.9. 

There is one back reference from the last element. 

In the second test (upper part of the figure) the array elements are traversed in a random order. 

In both cases the array elements form a circular single-linked list.

## 类比

如果类比数据结构的话，就是一个是 arrayList，另一个是 linkedList。

# 参考资料

p20

* any list
{:toc}
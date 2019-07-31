---
layout: post
title: Memory 内存知识-16-缓存实现的细节之多线程访问
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Multi Threaded Access 

Multi Threaded Access To ensure that the gravity（重力） of the problems introduced by concurrently using the same cache lines on different processors is understood, we will look here at some more performance graphs for the same program we used before. 

This time, though, more than one thread is running at the same time. 

What is measured is the fastest runtime of any of the threads. 

This means the time for a complete run when all threads are done is even higher. 

The machine used has four processors; the tests use up to four threads. 

All processors share one bus to the memory controller and there is only one bus to the memory modules.

## 顺序读

Figure 3.19 shows the performance for sequential readonly access for 128 bytes entries (NPAD=15 on 64-bit machines).

![image](https://user-images.githubusercontent.com/18375710/62195409-86dfb500-b3ae-11e9-99da-3a3fc487420b.png)

For the curve for one thread we can expect a curve similar to Figure 3.11. 

The measurements are for a different machine so the actual numbers vary.

The important part in this figure is of course the behavior when running multiple threads. 

Note that no memory is modified and no attempts（尝试） are made to keep the threads in sync when walking the linked list. 

Even though no RFO messages are necessary and all the cache lines can be shared, we see up to an 18% performance decrease for the fastest thread when two threads are used and up to 34% when four threads are used. 

Since no cache lines have to be transported between the processors this slowdown is solely caused by the one or both of the two bottlenecks:

由于不必在处理器之间传输高速缓存行，因此这种减速仅由两个瓶颈中的一个或两个引起：

the shared bus from the processor to the memory controller and bus from the memory controller to the memory modules. 

Once the working set size is larger than the L3 cache in this machine all three threads will be prefetching new list elements. 

Even with two threads the available bandwidth is not sufficient（不足以） to scale linearly（线性扩展） (i.e., have no penalty（惩罚） from running multiple threads).


## 修改内存的场景

When we modify memory things get even uglier. 

Figure 3.20 shows the results for the sequential Increment test. 

![image](https://user-images.githubusercontent.com/18375710/62195585-e5a52e80-b3ae-11e9-90b2-77558458135d.png)

This graph is using a logarithmic（对数的） scale for the Y axis. 

So, do not be fooled by the apparently small differences.

We still have about a 18% penalty（罚款） for running two threads and now an amazing 93% penalty for running four threads. 

This means the prefetch traffic together with the write-back traffic is pretty much saturating（饱和） the bus when four threads are used.

### 图的解释

We use the logarithmic scale to show the results for the L1d range. 

What can be seen is that, as soon as more than one thread is running, the L1d is basically ineffective.

The single-thread access times exceed 20 cycles only when the L1d is not sufficient to hold the working set. 

When multiple threads are running, those access times are hit immediately, even with the smallest working set sizes.

### 问题

One aspect of the problem is not shown here. 

It is hard to measure with this specific test program. 

Even though the test modifies memory and we therefore must expect RFO messages we do not see higher costs for the L2 range when more than one thread is used. 

The program would have to use a large amount of memory and all threads must access the same memory in parallel. 

This is hard to achieve without a lot of synchronization which would then dominate（只配） the execution time.

- 个人理解

这里就是多个进程同时访问一个主存时，则需要使用同步保证数据的正确性。

# 随机读取

Finally in Figure 3.21 we have the numbers for the Addnextlast test with random access of memory. 

## 图示

![image](https://user-images.githubusercontent.com/18375710/62197151-ebe8da00-b3b1-11e9-9920-786bacec6c5e.png)

This figure is provided mainly to show the appallingly（令人吃惊） high numbers.

It now takes around 1,500 cycles to process a single list element in the extreme（极端） case. 

The use of more threads is even more questionable. 

## 表格总结

We can summarize the efficiency of multiple thread use in a table.

| #Threads | Seq Read | Seq Inc | Read Add |
|:---|:---|:---|:---|
| 2 | 1.69 | 1.69 | 1.54 |
| 4 | 2.98 | 2.07 | 1.65 |

The table shows the efficiency for the multi-thread run with the largest working set size in the three figures on page 28. 

The number shows the best possible speed-up the test program incurs for the largest working set size by using two or four threads. 

For two threads the theoretical（理论上） limits for the speed-up are 2 and, for four threads, 4. 

The numbers for two threads are not that bad. 

But for four threads the numbers for the last test show that it is almost not worth it to scale beyond two threads. 

The additional benefit is minuscule（微不足道）. 

We can see this more easily if we represent（代表） the data in Figure 3.21 a bit differently.

- 个人收获

这里应该不是什么边缘递减效应。

而是线程较多时，其实冲突也变多了。

类比到团队管理，一个 team 3 个人是最平衡的。

# 影响速度的因素

The curves in Figure 3.22 show the speed-up factors, i.e., relative performance compared to the code executed by a single thread. 

## 图示

![image](https://user-images.githubusercontent.com/18375710/62198718-be516000-b3b4-11e9-877a-aaa992a99894.png)

## 解释

We have to ignore the smallest sizes, the measurements are not accurate（准确） enough. 

For the range of the L2 and L3 cache we can see that we indeed achieve almost linear acceleration（确实实现了几乎线性加速）. 

We almost reach factors of 2 and 4 respectively（分别）. 

But as soon as the L3 cache is not sufficient to hold the working set the numbers crash（紧急）.

They crash to the point that the speed-up of two and four threads is identical（相同） (see the fourth column in Table 3.3).

This is one of the reasons why one can hardly find motherboard with sockets for more than four CPUs all using the same memory controller. 

Machines with more processors have to be built differently (see section 5).

这就是为什么人们很难找到带有超过四个CPU的插座的主板都使用相同的内存控制器的原因之一。

## 数据的普遍性

These numbers are not universal. 

In some cases even working sets which fit into the last level cache will not allow linear speed-ups. 

In fact, this is the norm since threads are usually not as decoupled as is the case in this test program. 

On the other hand it is possible to work with large working sets and still take advantage of more than two threads. 

Doing this requires thought, though. 

We will talk about some approaches in section 6.

# 参考资料

p29

* any list
{:toc}
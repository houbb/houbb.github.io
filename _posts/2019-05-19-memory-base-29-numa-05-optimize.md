---
layout: post
title: Memory 内存知识-29-NUMA 显示优化
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Explicit NUMA Optimizations

All the local memory and affinity rules cannot help out if all threads on all the nodes need access to the same memory regions. 

It is, of course, possible to simply restrict the number of threads to a number supportable by the processors which are directly connected to the memory node. 

This does not take advantage of SMP NUMA machines, though, and is therefore not a real option.

If the data in question is read-only there is a simple solution: replication. 

Each node can get its own copy of the data so that no inter-node accesses are necessary. 

如果所有节点上的所有线程都需要访问相同的内存区域，则所有本地内存和关联性规则都无法解决。

当然，可以简单地将线程数限制为可由直接连接到存储器节点的处理器支持的数量。

但是，这并没有利用SMP NUMA机器，因此不是一个真正的选择。

如果有问题的数据是只读的，则有一个简单的解决方案：复制。

**每个节点都可以获得自己的数据副本，因此不需要进行节点间访问。**

## 示例代码

Code to do this can look like this:

```c
void *local_data(void) {
    static void *data[NNODES];
    int node = NUMA_memnode_self_current_idx();
    if (node == -1)
        /* Cannot get node, pick one. */
        node = 0;
    if (data[node] == NULL)
        data[node] = allocate_data();
    return data[node];
}
void worker(void) {
    void *data = local_data();
    for (...)
        compute using data
}
```

In this code the function worker prepares by getting a pointer to the local copy of the data by a call to local_data. 

Then it proceeds with the loop, which uses this pointer. 

The local_data function keeps a list of the already allocated copies of the data around. 

Each system has a limited number of memory nodes, so the size of the array with the pointers to the per-node memory copies is limited in size. 

The NUMA_memnode_system_count function from libNUMA returns this number. 

If memory for the given node has not yet been allocated for the current node (recognized by a null pointer in data at the index returned by the NUMA_memnode_self_current_idx call), a new copy is allocated.


## 必须知道

It is important to realize that nothing terrible happens if the threads get scheduled onto another CPU connected to a different memory node after the getcpu system call.

重要的是要意识到，如果在getcpu系统调用之后线程被调度到连接到不同内存节点的另一个CPU，则不会发生任何可怕的事情。

It just means that the accesses using the data variable in worker access memory on another memory node. 

This slows the program down until data is computed anew, but that is all. 

The kernel will always avoid gratuitous（无偿） rebalancing of the per-CPU run queues. 

If such a transfer happens it is usually for a good reason and will not happen again for the near future.

它只是意味着在另一个内存节点上使用工作者访问内存中的数据变量进行访问。

这会减慢程序，直到重新计算数据，但这就是全部。

内核将始终避免每个CPU运行队列的无偿重新平衡。

如果发生这种转移通常是有充分理由的，并且不会在不久的将来再次发生。


# 写入时如何解决

Things are more complicated（复杂） when the memory area in question is writable.

Simple duplication will not work in this case. 

Depending on the exact situation there might a number of possible solutions.

## 根据不同情况而定

For instance, if the writable memory region is used to accumulate（积累） results, it might be possible to first create a
separate region for each memory node in which the results are accumulated. 

首先对内存进行分段。

Then, when this work is done, all the per-node memory regions are combined to get the total
result. 

map-reduce 的思想。

This technique can work even if the work never really stops, but intermediate（中间） results are needed. 

The requirement for this approach is that the accumulation of a result is stateless, i.e., it does not depend on the previously collected results.

前提要求：这种计算必须是无状态的。

## DMA 的方式

It will always be better, though, to have direct access to the writable memory region. 

但是，直接访问可写存储区域总是更好。

If the number of accesses to the memory region is substantial（大量的）, it might be a good idea to force the kernel to migrate the memory pages in question to the local node. 

If the number of accesses is really high, and the writes on different nodes do not happen concurrently, this could help. 

But be aware that the kernel cannot perform miracles: the page migration is a copy operation and as such it is not cheap. 

This cost has to be amortized.

如果对内存区域的访问次数很多（大量的），强制内核将所讨论的内存页面迁移到本地节点可能是个好主意。

如果访问次数非常高，并且不同节点上的写入不会同时发生，这可能会有所帮助。

但请注意，内核无法执行奇迹：页面迁移是一种复制操作，因此它并不便宜。

该成本必须摊销。

# 利用所有的带宽

The numbers in Figure 5.4 show that access to remote memory when the caches are ineffective is not measurably（不用测量的） slower than access to local memory. 

因为有网络传输。

前端时间看了一个 RDMA-Rmote Direct Memory Access 觉得很有趣。

This means a program could possibly save bandwidth to the local memory by writing data it does not have to read again into memory attached to another processor. 

The bandwidth of the connection to the DRAM modules and the bandwidth of the interconnects are mostly independent, so parallel use could improve overall performance.

并行可以提升互相之间不依赖的性能。

## 影响的因素

Whether this is really possible depends on many factors.

One really has to be sure that caches are ineffective since otherwise the slowdown related to remote accesses is measurable. 

Another big problem is whether the remote node has any needs for its own memory band-width. 

This possibility must be examined in detail before the approach is taken. 

In theory, using all the bandwidth available to a processor can have positive effects（积极的影响）. 

A family 10h Opteron processor can be directly connected to up to four other processors. 

Utilizing all that additional bandwidth, perhaps coupled with appropriate prefetches (especially prefetchw) could lead to improvements if
the rest of the system plays along.

# 参考资料

P77

* any list
{:toc}
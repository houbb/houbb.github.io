---
layout: post
title: Memory 内存知识-06-其他主存使用者
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Other Main Memory Users

Beside CPUs there are other system components which can access the main memory. 

High-performance cards such as network and mass-storage controllers cannot afford to pipe all the data they need or provide through the
CPU. 

Instead, they read or write the data directly from/to the main memory (Direct Memory Access, DMA). 

In Figure 2.1 we can see that the cards can talk through the Southbridge and Northbridge directly with the memory.

Other buses, like USB, also require FSB bandwidth–even if they do not use DMA, since the Southbridge is connected via the Northbridge to the processor through the FSB, too.

While DMA is certainly beneficial, it means that there is more competition for the FSB bandwidth. 

In times with high DMA traffic the CPU might stall（停滞） more than usual while waiting for data from the main memory. 

There are ways around this given the right hardware. 

With an architecture as in Figure 2.3 one can make sure the computation uses memory on nodes which are not affected by DMA. 

It is also possible to attach a Southbridge to each node, equally distributing the load on the FSB of all the nodes. 

There are a myriad（无数的） of possibilities. 

In section 6 we will introduce techniques and programming interfaces which help achieving the improvements which are possible in software.

## video RAM 

Finally it should be mentioned that some cheap systems have graphics systems without separate, dedicated video RAM. 

Those systems use parts of the main memory as video RAM. 

Since access to the video RAM is frequent (for a 1024x768 display with 16 bpp at 60Hz we are talking 94MB/s) and system memory, unlike RAM on graphics cards, does not have two ports this can substantially（基本上） influence the systems performance and especially the latency.

It is best to ignore such systems when performance is a priority. 

They are more trouble than they are worth. 

People buying those machines know they will not get the best performance.

# 参考资料

[cpumemory.pdf-7](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

* any list
{:toc}
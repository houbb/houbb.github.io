---
layout: post
title: Memory 内存知识-08-大局观中的 cpu caches
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# CPU Caches in the Big Picture

Before diving into（一头扎进技术细节） technical details of the implementation of CPU caches some readers might find it useful to first see in some more details how caches fit into the “big picture” of a modern computer system.

![image](https://user-images.githubusercontent.com/18375710/61760386-f7f6f980-adfd-11e9-97cd-3c801813cbf7.png)

Figure 3.1 shows the minimum cache configuration. 

It corresponds to the architecture which could be found in early systems which deployed CPU caches. 

The CPU core is no longer directly connected to the main memory.

All loads and stores have to go through the cache.

The connection between the CPU core and the cache is a special, fast connection. 

In a simplified representation（表示）, the main memory and the cache are connected to the system bus which can also be used for communication with other components of the system. 

We introduced the system bus as “FSB” which is the name in use today;  see section 2.2. 

In this section we ignore the Northbridge; it is assumed to be present to facilitate（促进） the communication of the CPU(s) with the main memory.

## Intel 区分 data code 缓存

Even though most computers for the last several decades have used the von Neumann architecture（冯诺依曼架构）, experience has shown that it is of advantage to separate the caches used for code and for data. 

Intel has used separate code and data caches since 1993 and never looked back（从不回头）. 

The memory regions needed for code and data are pretty much independent of each other, which is why independent caches work better. 

ps: 各司其职，划分明确。自然工作良好。

In recent years another advantage emerged（出现）: 

the instruction decoding step for the most common processors is slow; 

caching decoded instructions can speed up the execution, especially when the pipeline is empty due to incorrectly predicted or impossible-topredict（不可预测） branches.

ps: 提升了处理器解码的速度

## 主存与缓存之间的速度差异

Soon after the introduction of the cache the system got more complicated（复杂）. 

The speed difference between the cache and the main memory increased again, to a point that another level of cache was added, bigger and slower than the first-level cache. 

Only increasing the size of the first-level cache was not an option for economical reasons（不是出于经济的选择）.

Today, there are even machines with three levels of cache in regular use. 

A system with such a processor looks like Figure 3.2. 

![image](https://user-images.githubusercontent.com/18375710/61761153-6d63c980-ae00-11e9-929d-f64c2732189e.png)

With the increase on the number of cores in a single CPU the number of cache levels might increase in the future even more.

ps: 没有什么是一层缓存解决不了的，如果有，那就再加一层。

Figure 3.2 shows three levels of cache and introduces the nomenclature we will use in the remainder of the document.

L1d is the level 1 data cache, L1i the level 1 instruction cache, etc. 

Note that this is a schematic（概要）; 

the data flow in reality need not pass through any of the higher-level caches on the way from the core to the main memory. 

CPU designers have a lot of freedom designing the interfaces of the caches. 

For programmers these design choices are invisible（不可见，透明）.

# 多核多线程模式

In addition we have processors which have multiple cores and each core can have multiple “threads”. 

The difference between a core and a thread is that separate cores have separate copies of (almost17) all the hardware resources.

The cores can run completely independently unless they are using the same resources–e.g., the connections to the outside–at the same time. 

Threads, on the other hand, share almost all of the processor’s resources.

## Intel 的做法

Intel’s implementation of threads has only separate registers for the threads and even that is limited, some registers are shared. 

ps: 只是分开了寄存器，甚至一些寄存器是共享的。

## 完整的设计方式

The complete picture for a modern CPU therefore looks like Figure 3.3.

![image](https://user-images.githubusercontent.com/18375710/61761448-4b1e7b80-ae01-11e9-8843-95c8d4f6763e.png)

In this figure we have two processors, each with two cores, each of which has two threads. 

The threads share the Level 1 caches. 

The cores (shaded in the darker gray) have individual Level 1 caches. 

All cores of the CPU share the higher-level caches. 

The two processors (the two big boxes shaded in the lighter gray) of course do not share any caches. 

All this will be important, especially when we are discussing the cache effects on multiprocess and multi-thread applications.

ps: 这些 cache 的设计，使我想到了 JMM 内存结构设计。

# 参考资料

[cpumemory.pdf-13](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf)

* any list
{:toc}
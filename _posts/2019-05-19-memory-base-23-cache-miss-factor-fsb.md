---
layout: post
title: Memory 内存知识-23-影响缓存命中的因素之FSB
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# FSB Influence

The FSB plays a central role in the performance of the machine. 

Cache content can only be stored and loaded as quickly as the connection to the memory allows. 

We can show how much so by running a program on two machines which only differ in the speed of their memory modules. 

Figure 3.32 shows the results of the Addnext0 test (adding the content of the next elements pad[0] element to the own pad[0] element) for NPAD=7 on a 64-bit machine. 

Both machines have Intel Core 2 processors, the first uses 667MHz DDR2 modules, the second 800MHz modules (a 20% increase).

![image](https://user-images.githubusercontent.com/18375710/62761640-c21e6a00-bab9-11e9-9084-98cee802988d.png)

# 图片解释

The numbers show that, when the FSB is really stressed（强调） for large working set sizes, we indeed see a large benefit.

The maximum performance increase measured in this test is 18.2%, close to the theoretical（理论值） maximum. 

What this shows is that a faster FSB indeed can pay off big time.

It is not critical when the working set fits into the caches (and these processors have a 4MB L2). 

It must be kept in mind that we are measuring one program here.

The working set of a system comprises（包含） the memory needed by all concurrently running processes. 

This way it is easily possible to exceed（超过） 4MB memory or more with much smaller programs.

# 当代处理器

Today some of Intel’s processors support FSB speeds up to 1,333MHz which would mean another 60% increase.

The future is going to see even higher speeds.

If speed is important and the working set sizes are larger, fast RAM and high FSB speeds are certainly worth the money. 

One has to be careful, though, since even though the processor might support higher FSB speeds the motherboard/Northbridge might not. 

It is critical to check the specifications.

# FSB 的概念

FSB=Front Side BUS前段总线

FSB只指CPU与北桥芯片之间的数据传输总线，又称前端总线。

对于P4来说，**FSB频率=CPU外频*4**。

这个参数指的就是前端总线的频率，它是处理器与主板交换数据的通道，既然是通道，那就是越大越好，现在主流中最高的FSB是800M，向下有533M、400M和333M等几种，它们价格是递减的。（现在也有1066/1333 FSB的主板不过由于面向骨灰级发烧级的玩家和超频者，价格比较高昂）

FSB(或是FrontSideBus，前端总线)是超频最容易和最常见的方法之一。

FSB是CPU与系统其它部分连接的速度。它还影响内存时钟，那是内存运行的速度。一般而言，对FSB和内存时钟两者来说越高等于越好。然而，在某些情况下这不成立。例如，让内存时钟比FSB运行得快根本不会有真正的帮助。

同样，在AthlonXP系统上，让FSB运行在更高速度下而强制内存与FSB不同步(使用稍后将讨论的内存分频器)对性能的阻碍将比运行在较低FSB及同步内存下要严重得多。

FSB在Athlon和P4系统上涉及到不同的方法。

在Athlon这边，它是DDR总线，意味着如果实际时钟是200MHz的话，那就是运行在400MHz下。

在P4上，它是“四芯的”，所以如果实际时钟是相同的200MHz的话，就代表800MHz。

这是Intel的市场策略，因为对一般用户来说，越高等于越好。

Intel的“四芯”FSB实际上具有一个现实的优势，那就是以较小的性能损失为代价允许P4芯片与内存不同步运行。

每个时钟越高的周期速度使得它越有机会让内存周期与CPU周期重合，那等同于越好的性能。

# 参考资料

P34

* any list
{:toc}
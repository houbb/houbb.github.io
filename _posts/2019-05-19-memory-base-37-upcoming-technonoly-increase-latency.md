---
layout: post
title: Memory 内存知识-37-新技术之增加延迟
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, tx, sh]
published: true
---

# Increasing Latency

One thing about future development of memory technology is almost certain: latency will continue to creep up. 

延迟将继续蔓延。

We already discussed, in section 2.2.4, that the upcoming DDR3 memory technology will have higher latency than the current DDR2 technology. 

FB-DRAM, if it should get deployed, also has potentially higher latency, especially when FB-DRAM modules are daisychained.

Passing through the requests and results does not come for free.

FB-DRAM如果应该部署，也可能具有更高的延迟，特别是当FB-DRAM模块采用菊花链时。

通过请求和结果不是免费的。

# 延迟的第二个来源-NUMA

The second source of latency is the increasing use of NUMA. 

AMD’s Opterons are NUMA machines if they have more than one processor. 

There is some local memory attached to the CPU with its own memory controller but, on SMP motherboards, the rest of the memory has to be accessed through the Hypertransport bus. 

Intel’s CSI technology will use almost the same technology. 

Due to per-processor bandwidth limitations and the requirement to service (for instance) multiple 10Gb/s Ethernet cards, multi-socket motherboards will not vanish, even if the number of cores per socket increases.

AMD的Opteron是NUMA机器，如果它们有多个处理器。

有一些本地内存连接到CPU并带有自己的内存控制器，但在SMP主板上，其余内存必须通过Hypertransport总线访问。

英特尔的CSI技术将采用几乎相同的技术。 

由于每处理器带宽限制和服务（例如）多个10Gb / s以太网卡的要求，即使每个插槽的核心数量增加，多插槽主板也不会消失。

# 第三个来运-协处理器

A third source of latency are co-processors. 

We thought that we got rid of them after math co-processors for commodity processors were no longer necessary at the beginning of the 1990’s, but they are making a comeback.

Intel’s Geneseo and AMD’s Torrenza are extensions of the platform to allow third-party hardware developers to integrate their products into the motherboards. 

I.e., the co-processors will not have to sit on a PCIe card but, instead, are positioned much closer to the CPU. 

This gives them more bandwidth.

也就是说，协处理器不必坐在PCIe卡上，而是更靠近CPU。

这为他们提供了更多带宽。

IBM went a different route (although extensions like Intel’s and AMD’s are still possible) with the Cell CPU.

The Cell CPU consists, beside the PowerPC core, of 8 Synergistic Processing Units (SPUs) which are specialized processors mainly for floating-point computation.

除PowerPC内核外，Cell CPU还包含8个协同处理单元（SPU），它们是专门用于浮点计算的专用处理器。

What co-processors and SPUs have in common is that they, most likely, have even slower memory logic than the real processors. 

This is, in part, caused by the necessary simplification: 

all the cache handling, prefetching etc is complicated, especially when cache coherency is needed, too. 

High-performance programs will increasingly rely on co-processors since the performance differences can be dramatic（戏剧性）. 

Theoretical peak performance for a Cell CPU is 210 GFLOPS, compared to 50-60 GFLOPS for a high-end CPU. 

Graphics Processing Units (GPUs, processors on graphics cards) in use today achieve even higher numbers (north of 500 GFLOPS) and those could probably, with not too much effort, be integrated into the Geneseo/Torrenza systems.

As a result of all these developments, a programmer must conclude that prefetching will become ever more important.

由于所有这些发展，程序员必须得出结论，预取将变得更加重要。

For co-processors it will be absolutely critical. 

For CPUs, especially with more and more cores, it is necessary to keep the FSB busy all the time instead of piling on the requests in batches. 

This requires giving the CPU as much insight into future traffic as possible through the efficient use of prefetching instructions.

对于协处理器来说，这绝对是至关重要的。

对于CPU，尤其是具有越来越多内核的CPU，必须始终保持FSB忙，而不是批量处理请求。

这需要通过有效使用预取指令为CPU提供尽可能多的洞察未来流量。

# 参考资料

P91

* any list
{:toc}
---
layout: post
title: Memory 内存知识-38-新技术之向量操作
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, tx, sh]
published: true
---

# Vector Operations

The multi-media extensions in today’s mainstream processors implement vector operations only in a limited fashion. 

Vector instructions are characterized by large numbers of operations which are performed as the result of one instruction (Single Instruction Multiple Data, SIMD). 

Compared with scalar operations, this can be said about the multi-media instructions, but it is a far cry from what vector computers like the Cray-1 or vector units for machines like the IBM 3090 did.

To compensate for the limited number of operations performed for one instruction (four float or two double operations on most machines) the surrounding loops have to be executed more often. 

The example in section A.1 shows this clearly, each cache line requires SM iterations.

为了补偿对一条指令执行的有限操作次数（在大多数机器上进行四次浮动或两次双重操作），必须更频繁地执行周围的循环。

A.1节中的示例清楚地显示了这一点，每个缓存行都需要SM迭代。


With wider vector registers and operations, the number of loop iterations can be reduced. 

This results in more than just improvements in the instruction decoding etc.; here we are more interested in the memory effects. 

通过更宽的向量寄存器和操作，可以减少循环迭代次数。

这导致不仅仅是指令解码等的改进。 

在这里，我们对记忆效应更感兴趣。

With a single instruction loading or storing more data, the processor has a better picture about the memory use of the application and does not have to try to piece together the nformation from the behavior of individual instructions.

Furthermore, it becomes more useful to provide load or store instructions which do not affect the caches. 

With 16 byte wide loads of an SSE register in an x86 CPU, it is a bad idea to use uncached loads since later accesses to the same cache line have to load the data from memory again (in case of cache misses). 

If, on the other hand, the vector registers are wide enough to hold one or more cache lines, uncached loads or stores do not have negative impacts. 

It becomes more practical to perform operations on data sets which do not fit into the caches.

通过单个指令加载或存储更多数据，处理器可以更好地了解应用程序的内存使用情况，而不必尝试将信息与单个指令的行为拼凑在一起。

此外，提供不影响高速缓存的加载或存储指令变得更有用。

在x86 CPU中使用16字节宽的SSE寄存器加载时，使用未缓存的加载是一个坏主意，因为以后对同一缓存行的访问必须再次从内存加载数据（在缓存未命中的情况下）。

另一方面，如果向量寄存器足够宽以容纳一个或多个高速缓存行，则未缓存的负载或存储不会产生负面影响。

对不适合高速缓存的数据集执行操作变得更加实际。

# 指令的数量

Having large vector registers does not necessarily mean the latency of the instructions is increased; 

vector instructions do not have to wait until all data is read or stored. 

The vector units could start with the data which has already been read if it can recognize the code flow.

That means, if, for instance, a vector register is to be loaded and then all vector elements multiplied by a scalar, the CPU could start the multiplication operation as soon as the first part of the vector has been loaded. 

如果可以识别代码流，则向量单元可以从已经读取的数据开始。

这意味着，例如，如果要加载向量寄存器，然后所有向量元素乘以标量，则只要加载了向量的第一部分，CPU就可以开始乘法运算。

It is just a matter of sophistication（诡辩） of the vector unit. 

What this shows is that, in theory, the vector registers can grow really wide, and that programs could potentially（可能） be designed today with this in mind.

In practice, there are limitations imposed on the vector register size by the fact that the processors are used in multi-process and multithread OSes. 

As a result, the context switch times, which include storing and loading register values, is important.

实际上，由于处理器用于多进程和多线程操作系统，因此对向量寄存器大小施加了限制。

因此，上下文切换时间（包括存储和加载寄存器值）非常重要。

# 问题

With wider vector registers there is the problem that the input and output data of the operations cannot be sequentially laid out in memory. 

This might be because a matrix is sparse, a matrix is accessed by columns instead of rows, and many other factors. 

这可能是因为矩阵是稀疏的，矩阵是通过列而不是行来访问的，还有许多其他因素。

Vector units provide, for this case, ways to access memory in non-sequential patterns.

A single vector load or store can be parametrized and instructed to load data from many different places in the address space. 

Using today’s multi-media instructions, this is not possible at all.

The values would have to be explicitly loaded one by one and then painstakingly combined into one vector register.

可以对单个矢量加载或存储进行参数化并指示从地址空间中的许多不同位置加载数据。

使用今天的多媒体指令，这根本不可能。

这些值必须逐个显式加载，然后精心组合成一个向量寄存器。

# 过去的向量工具

The vector units of the old days had different modes to allow the most useful access patterns:

（1） using striding, the program can specify how big the gap between two neighboring vector elements is. 

The gap between all elements must be the same but this would, for instance, easily allow to read the column of a matrix into a vector register in one instruction instead of one instruction per row.

（2）using indirection, arbitrary access patterns can be created. 

The load or store instruction receive a pointer to an array which contains addresses or offsets of the real memory locations which have to be loaded.

It is unclear at this point whether we will see a revival of true vector operations in future versions of mainstream processors. 

目前尚不清楚我们是否会看到未来主流处理器版本中真正的矢量运算的复兴。

Maybe this work will be relegated to coprocessors. 

In any case, should we get access to vector operations, it is all the more important to correctly organize the code performing such operations. 

The code should be self-contained and replaceable, and the interface should be general enough to efficiently apply vector operations. 

For instance, interfaces should allow adding entire matrixes instead of operating on rows, columns, or even groups of elements. 

The larger the building blocks, the better the chance of using vector operations.

在任何情况下，如果我们能够访问向量操作，正确组织执行此类操作的代码就更为重要。

代码应该是自包含且可替换的，并且接口应该足够通用以有效地应用向量操作。

例如，接口应允许添加整个矩阵，而不是对行，列或甚至元素组进行操作。

构建块越大，使用向量操作的可能性越大。

# 指令中断的代价

In [11] the authors make a passionate plea for the revival of vector operations. 

They point out many advantages and try to debunk various myths（揭穿各种神话）. 

They paint an overly simplistic image, though. 

As mentioned above, large register sets mean high context switch times, which have to be avoided in general purpose OSes. 

See the problems of the IA-64 processor when it comes to context switchintensive operations. 

The long execution time for vector operations is also a problem if interrupts are involved. 

If an interrupt is raised, the processor must stop its current work and start working on handling the interrupt. 

After that, it must resume executing the interrupted code. 

It is generally a big problem to interrupt an instruction in the middle of the work; it is not impossible, but it is complicated.

For long running instructions this has to happen, or the instructions must be implemented in a restartable fashion, since otherwise the interrupt reaction time is too high. The latter is not acceptable.

如上所述，大寄存器组意味着高上下文切换时间，在通用OS中必须避免这种情况。

在上下文切换密集型操作方面，请参阅IA-64处理器的问题。

如果涉及中断，向量操作的长执行时间也是一个问题。

如果发出中断，处理器必须停止当前的工作并开始处理中断。

之后，它必须继续执行被中断的代码。

在工作中断中断指令通常是一个大问题; 这不是不可能，但它很复杂。

对于长时间运行的指令，必须发生这种情况，或者指令必须以可重启的方式实现，否则中断响应时间太长。 后者是不可接受的。

# 向量对于对齐的宽容性

Vector units also were forgiving as far as alignment of the memory access is concerned, which shaped the algorithms which were developed. 

Some of today’s processors (especially RISC processors) require strict alignment so the extension to full vector operations is not trivial.

There are big potential upsides to having vector operations, especially when striding and indirection are supported, so that we can hope to see this functionality in the future.

就存储器访问的对齐而言，向量单元也是宽容的，这形成了所开发的算法。

今天的一些处理器（特别是RISC处理器）需要严格的对齐，因此全向量操作的扩展并不是微不足道的。

向量操作有很大的潜在优势，特别是在支持跨步和间接时，我们希望将来可以看到这个功能。

# 参考资料

P91

* any list
{:toc}
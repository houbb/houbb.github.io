---
layout: post
title: Memory 内存知识-32-测量内存使用
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Measuring Memory Usage

Knowing how much memory a program allocates and possibly where the allocation happens is the first step to optimizing its memory use.

There are, fortunately, some easy-to-use programs available which do not require that the program be recompiled or specifically modified.

For the first tool, called massif, it is sufficient to not strip the debug information which the compiler can automatically generate. 

对于第一个名为massif的工具，不剥离编译器可以自动生成的调试信息就足够了。

It provides an overview of the accumulated memory use over time. 

Figure 7.7 shows an example of the generated output. 

## 测量命令

Like cachegrind (section 7.2), *massif* is a tool using the valgrind infrastructure. 

It is started using

```
valgrind --tool=massif command arg
```

where command arg is the program which is to be observed and its parameter(s).

The program will be simulated and all calls to memory allocation functions are recognized. 

The call site is recorded along with a timestamp value; 

the new allocation size is added to both the whole-program total and total for the specific call site.

The same applies to the functions which free memory where, obviously, the size of the freed block is subtracted from the appropriated sums. 

This information can then be used to create a graph showing the memory use over the lifetime of the program, splitting each time value according to the location which requested the allocation.

新的分配大小将添加到特定呼叫站点的整个程序总数和总计。

这同样适用于释放存储器的功能，显然，从适当的总和中减去释放的块的大小。

然后，可以使用此信息创建一个图表，显示程序生命周期内的内存使用情况，根据请求分配的位置拆分每个时间值。

# 文件的内容 

Before the process terminates massif creates two files: massif.XXXXX.txt and massif.XXXXX.ps; 

XXXXX is as before the PID of the process. 

The `.txt` file is a summary of the memory use for all call sites and the `.ps` is what can be seen in Figure 7.7.

![image](https://user-images.githubusercontent.com/18375710/64172616-f7836100-ce87-11e9-9b4a-0e6ca8b823ea.png)

## massif 的作用

Massif can also record the program’s stack usage, which can be useful to determine the total memory footprint of an application. 

But this is not always possible. 

In some situations (some thread stacks or when signaltstack is used) the valgrind runtime cannot know about the limits of the stack . 

In these situations, it also does not make much sense to add these stacks’ sizes to the total. 

There are several other situations where it makes no sense. 

在某些情况下（某些线程堆栈或使用signaltstack），valgrind运行时无法知道堆栈的限制。

在这些情况下，将这些堆栈的大小添加到总数中也没有多大意义。

还有其他几种情况没有意义。

If a program is affected by this, massif should be started with the addition option --stacks=no. 

Note, this is an option for valgrind and therefore must come before the name of the program which is being observed.

## 一些程序的自己实现

Some programs provide their own memory allocation implementation or wrapper functions around the system’s allocation functions. 

In the first case, allocations are normally missed; in the second case, the recorded call sites hide information, since only the address of the call in the wrapper function is recorded. 

For this reason, it is possible to add additional functions to the list of allocation functions. 

The `--alloc-fn=xmalloc` parameter would specify that the function xmalloc is also an allocation function, which is often the case in GNU programs.

Calls to xmalloc are recorded, but not the allocation calls made from within xmalloc.

# memusage 工具

The second tool is called memusage; 

it is part of the GNU C library. 

It is a simplified version of massif (but existed a long time before massif). 

It only records the total memory use for heap (including possible calls to mmap etc. 

if the -m option is given) and, optionally, the stack. 

The results can be shown as a graph of the total memory use over time or, alternatively, linearly over the calls made to allocation functions. 

The graphs are created separately by the memusage script which, just as with valgrind, has to be used to start the application:

它是地块的简化版本（但在地块之前存在很长时间）。

它只记录堆的总内存使用量（包括对mmap等的可能调用）。

如果给出-m选项）和（可选）堆栈。

结果可以显示为总内存使用量随时间变化的曲线图，或者可选地，与分配函数的调用呈线性关系。

这些图表是由memusage脚本单独创建的，就像使用valgrind一样，它必须用于启动应用程序：

```
memusage command arg
```

The `-p IMGFILE option` must be used to specify that the graph should be generated in the file IMGFILE. 

This is a PNG file. 

The code to collect the data is run in the actual program itself, it is not an simulation like valgrind. 

This means memusage is much faster than massif and usable in situations where massif would be not useful. 

Besides total memory consumption, the code also records allocation sizes and, on program termination, it shows a histogram of the used allocation sizes. 

This information is written to standard error.

## 直接观察程序的困难性

Sometimes it is not possible (or feasible) to call the program which is supposed to be observed directly. 

有时，调用应该直接观察的程序是不可能的（或不可行的）。

An example is the compiler stage of gcc, which is started by the gcc driver program. 

In this case the name of the program which should be observed must be provided to the memusage script using the `-n NAME` parameter. 

This parameter is also useful if the program which is observed starts other programs. 

If no program name is specified all started programs will be profiled（异形）.


## 不同命令的选项

Both programs, massif and memusage, have additional options. 

A programmer finding herself in the position needing more functionality should first consult the manual or help messages to make sure the additional functionality is not already implemented.

这两个程序，massif 和 memusage 都有其他选择。

程序员发现自己处于需要更多功能的位置时，应首先查阅手册或帮助消息，以确保尚未实现其他功能。


# 如何解释相关的数据

Now that we know how the data about memory allocation can be captured, it is necessary to discuss how this data can be interpreted in the context of memory and cache use. 

现在我们知道如何捕获有关内存分配的数据，有必要讨论如何在内存和缓存使用的上下文中解释这些数据。

The main aspects of efficient dynamic memory allocation are linear allocation and compactness of the used portion. （使用部分的紧凑性）

This goes back to making prefetching efficient and reducing cache misses.

这可以追溯到使预取有效并减少缓存未命中。

## 任意读与性能

A program which has to read in an arbitrary（随意） amount of data for later processing could do this by creating a list where each of the list elements contains a new data item.

The overhead（高架，上面） for this allocation method might be minimal (one pointer for a single-linked list) but the cache effects when using the data can reduce the performance dramatically（显着）.

## 存在的问题

One problem is, for instance, that there is no guarantee（保证） that sequentially allocated memory is laid out sequentially in memory. 

顺序的内存分配，无法保证在主存中也是连续的。

比如，出于内存使用的考量，一般类似于链表的分配。

出于安全的考虑，将程序的信息故意打乱。

### 一些原因

There are many possible reasons for this:

- memory blocks inside a large memory chunk administrated by the memory allocator are actually returned from the back to the front;

- a memory chunk is exhausted and a new one is started in a different part of the address space;

- the allocation requests are for different sizes which are served from different memory pools;

- the interleaving allocations in the various threads of multi-threaded programs.


## 链表分配的缺点

If data must be allocated up front for later processing, the linked-list approach is clearly a bad idea. 

如果必须预先分配数据以供以后处理，那么链表方法显然是个坏主意。

There is no guarantee (or even likelihood) that the consecutive elements in the list are laid out consecutively in memory.

To ensure contiguous allocations, that memory must not be allocated in small chunks. 

Another layer of memory handling must be used;  it can easily be implemented by the programmer. 

An alternative is to use the obstack implementation available in the GNU C library. 

This allocator requests large blocks of memory from the system’s allocator and then hands arbitrarily large or small blocks of memory out. 

These allocations are always sequential unless the large memory chunk is exhausted, which is, depending on the requested allocation sizes pretty rare.

不能保证（甚至可能）列表中的连续元素在存储器中连续布局。

为确保连续分配，不得以小块分配该内存。

必须使用另一层内存处理; 它可以很容易地由程序员实现。

另一种方法是使用GNU C库中提供的obstack实现。

这个分配器从系统的分配器请求大块内存，然后将任意大或小的内存块输出。

除非大量内存块耗尽，否则这些分配始终是顺序的，这取决于所请求的分配大小非常罕见。

Obstacks are not a complete replacement for a memory allocator, they have limited abilities to free objects. 

See the GNU C library manual for details.

Obstack并不是内存分配器的完全替代品，它们对于释放对象的能力有限。

有关详细信息，请参阅GNU C库手册。

## 如何解决问题

So, how can a situation where the use of obstacks (or similar techniques) is advisable be recognized from the graphs? 

Without consulting  the source, possible candidates for the changes cannot be identified, but the graph can provide an entry point for the search. 

那么，如何从图表中识别出使用障碍物（或类似技术）的情况呢？

在没有咨询来源的情况下，无法识别可能的变更候选者，但图表可以为搜索提供切入点。

If many allocations are made from the same location, this could mean that allocation in bulk（块） might help. 

In Figure 7.7, we can see such a possible candidate in the allocations at address 0x4c0e7d5. 

From about 800ms into the run until 1,800ms into the run this is the only area (except the top, green one) which grows. 

Moreover, the slope is not steep, which means we have a large number of relatively small allocations. 

This is, indeed, a candidate for the use of obstacks or similar techniques.

从大约800毫秒进入运行直到运行1,800毫秒，这是唯一一个增长的区域（除了顶部，绿色之外）。

此外，坡度不陡，这意味着我们有大量相对较小的分配。

事实上，这是使用障碍物或类似技术的候选者。

# 分配的总数较高

Another problem the graphs can show is when the total number of allocations is high. 

This is especially easy to see if the graph is not drawn linearly over time but, instead, linearly over the number of calls (the default with memusage). 

In that case, a gentle slope in the graph means a lot of small allocations. 

memusage will not say where the allocations took place, but the comparison with massif’s output can say that, or the programmer might recognize it right away. 

Many small allocations should be consolidated to achieve linear memory use.

在这种情况下，图中的平缓斜率意味着很多小的分配。

memusage不会说分配发生在哪里，但是与massif的输出的比较可以说，或者程序员可能立即认出它。

应合并许多小分配以实现线性内存使用。

## 许多分配也意味着更高管理数据的开销

But there is another, equally important, aspect to this latter class of cases: 

many allocations also means higher overhead in administrative data. 

This by itself might not be that problematic. 

The red area named “heap-admin” represents this overhead in the massif graph and it is quite small. 

But, depending on the malloc implementation, this administrative data is allocated along with the data blocks, in the same memory. 

### 当今的 GNU C

For the current malloc implementation in the GNU C library, this is the case: 

every allocated block has at least a 2-word header (8 bytes for 32-bit platforms, 16 bytes for 64-bit platforms). 

In addition, block sizes are often a bit larger than necessary due to the way memory is administrated (rounding up block sizes to specific multiples).

每个分配的块至少有一个2字的头（32位平台为8字节，64位平台为16字节）。

此外，由于管理内存的方式（将块大小四舍五入到特定的倍数），块大小通常比必要的大一些。

# 内存分配策略意味着什么

This all means that memory used by the program is interspersed（穿插） with memory only used by the allocator for administrative purposes. 

We might see something like this:

![image](https://user-images.githubusercontent.com/18375710/64308813-1dfee480-cfcd-11e9-866b-6f1f68506748.png)

Each block represents one memory word. 

In this small region of memory we have four allocated blocks. 

The overhead due to the block header and padding is 50%.

Due to the placement of the header, this automatically means that the effective prefetch rate of the processor is lowered by up to 50% as well. 

由于 Header 的放置，这自动意味着处理器的有效预取率也降低了50％。

If the blocks were be processed sequentially (to take maximum advantage of prefetching), the processor would read all the header and padding words into the cache, even though they are never supposed to be read from or written to by the application itself. 

Only the runtime uses the header words, and the runtime only comes into play when the block is freed.

只有运行时使用标题字，并且运行时仅在释放块时才起作用。

One could at this point argue that the implementation should be changed to put the administrative data somewhere else. 

This is indeed done in some implementations, and it might prove to be a good idea. 

There are many aspects to be kept in mind, though, security not being the least of them. 

Regardless of whether we might see a change in the future, the padding issue will never go away (amounting to 16% of the data in the example, when ignoring the headers). 

Only if the programmer directly takes control of allocations can this be avoided.

When alignment requirements come into play there can still be holes, but this is also something under control of the programmer.

在这一点上，人们可以争辩应该改变实施以将管理数据放在其他地方。

这确实在某些实现中完成，并且它可能被证明是个好主意。

但要记住很多方面，安全性并不是最不重要的。

无论我们是否会在未来看到更改，填充问题都将永远消失（在忽略标题时，示例中的数据总数为16％）。

只有程序员直接控制分配才能避免这种情况。

当对齐要求发挥作用时，仍然可能存在漏洞，但这也是程序员控制的。

# 参考资料

P82

* any list
{:toc}
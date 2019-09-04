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

TODO...

# 参考资料

P82

* any list
{:toc}
---
layout: post
title: Memory 内存知识-31-模仿 CPU 缓存
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Simulating CPU Caches

While the technical description of how a cache works is relatively easy to understand, it is not so easy to see how an actual program behaves with respect to（尊重） cache. 

Programmers are not directly concerned with the values of addresses, be they absolute nor relative. 

Addresses are determined, in part, by the linker and, in part, at runtime by the dynamic linker and the kernel. 

The generated assembly code is expected to work with all possible addresses and, in the source language, there is not even a hint of absolute address values left. 

So it can be quite difficult to get a sense for how a program is making use of memory. 

生成的汇编代码应该与所有可能的地址一起使用，并且在源语言中，甚至没有留下一些绝对地址值的提示。

因此，了解程序如何利用内存可能非常困难。

# 分析工具

CPU-level profiling tools（分析工具） such as oprofile (as described in section 7.1) can help to understand the cache use. 

The resulting data corresponds to the actual hardware, and it can be collected relatively quickly if fine-grained collection（细粒度的集合） is not needed. 

As soon as more fine-grained data is needed, oprofile is not usable anymore; 

the thread would have to be interrupted too often. 

Furthermore, to see the memory behavior of the program on different processors, one actually has to have such machines and execute the program on them. 

此外，要查看程序在不同处理器上的内存行为，实际上必须有这样的机器并在它们上执行程序。

This is sometimes (often) not possible. 

One example is the data from Figure 3.8. 

To collect such data with oprofile one would have to have 24 different machines, many of which do not exist.

要用oprofile收集这些数据，必须有24台不同的机器，其中许多机器不存在。


# cache 模拟器

The data in that graph was collected using a cache simulator.

This program, cachegrind, uses the valgrind framework, which was initially developed to check for memory handling related problems in a program. 

## valgrind

Valgrind是一款用于内存调试、内存泄漏检测以及性能分析的软件开发工具。

Valgrind是一个二进制插桩框架，可以用来制作二进制分析工具。

利用Valgrind可以检测二进制程序的内存和线程漏洞。

The valgrind framework simulates the execution of a program and, while doing this, it allows various extensions, such as cachegrind, to hook into the execution framework. 

The cachegrind tool uses this to intercept all uses of memory addresses; 

it then simulates the operation of L1i, L1d, and L2 caches with a given size, cache line size, and associativity.

To use the tool a program must be run using valgrind as a wrapper:

```
valgrind --tool=cachegrind command arg
```

## 统计信息

In this simplest form the program command is executed with the parameter arg while simulating the three caches using sizes and associativity corresponding to that of the processor it is running on. 

One part of the output is printed to standard error when the program is running;

it consists of statistics of the total cache use as can be seen in Figure 7.5. 

```
==19645== I refs: 152,653,497
==19645== I1 misses: 25,833
==19645== L2i misses: 2,475
==19645== I1 miss rate: 0.01%
==19645== L2i miss rate: 0.00%
==19645==
==19645== D refs: 56,857,129 (35,838,721 rd + 21,018,408 wr)
==19645== D1 misses: 14,187 ( 12,451 rd + 1,736 wr)
==19645== L2d misses: 7,701 ( 6,325 rd + 1,376 wr)
==19645== D1 miss rate: 0.0% ( 0.0% + 0.0% )
==19645== L2d miss rate: 0.0% ( 0.0% + 0.0% )
==19645==
==19645== L2 refs: 40,020 ( 38,284 rd + 1,736 wr)
==19645== L2 misses: 10,176 ( 8,800 rd + 1,376 wr)
==19645== L2 miss rate: 0.0% ( 0.0% + 0.0% )
```

The total number of instructions and memory references is given, along with the number of misses they produce for the L1i/L1d and L2 cache, the miss rates, etc. 

The tool is even able to split the L2 accesses into instruction and data accesses, and all data cache uses are split in read and write accesses.

给出了指令和存储器参考的总数，以及它们为 L1i/L1d和L2高速缓存产生的未命中数，未命中率等。

该工具甚至能够将L2访问分成指令和数据访问，并且所有数据缓存使用在读和写访问中分开。

It becomes even more interesting when the details of the simulated caches are changed and the results compared.

Through the use of the --I1, --D1, and --L2 parameters, cachegrind can be instructed to disregard the processor’s cache layout and use that specified on the command line. 

For example:

```
valgrind --tool=cachegrind \
--L2=8388608,8,64 command arg
```

would simulate an 8MB L2 cache with 8-way set associativity and 64 byte cache line size. 

Note that the --L2 option appears on the command line before the name of the program which is simulated.

This is not all cachegrind can do. 

这不是所有cachegrind都可以做到的。

Before the process exits it writes out a file named cachegrind.out.XXXXX where XXXXX is the PID of the process. 

在进程退出之前，它会写出一个名为cachegrind.out.XXXXX的文件，其中XXXXX是进程的PID。

This file contains the summary information and detailed information about the cache use in each function and source file. 

The data can be viewed using the cg annotate program.

此文件包含有关每个函数和源文件中缓存使用的摘要信息和详细信息。

可以使用cg annotate程序查看数据。

## 程序输出

The output this program produces contains the cache use summary which was printed also when the process terminated, along with a detailed summary of the cache line use in each function of the program. 

Generating this perfunction data requires that cg annotate is able to match addresses to functions. 

This means debug information should be available for best results. 

Failing that, the ELF symbol tables can help a bit but, since internal symbols are not listed in the dynamic symbol table, the results are not complete. 

Figure 7.6 shows part of the output for the same program run as Figure 7.5.

- Figure 7.6

```
--------------------------------------------------------------------------------
Ir I1mr I2mr Dr D1mr D2mr Dw D1mw D2mw file:function
--------------------------------------------------------------------------------
53,684,905 9 8 9,589,531 13 3 5,820,373 14 0 ???:_IO_file_xsputn@@GLIBC_2.2.5
36,925,729 6,267 114 11,205,241 74 18 7,123,370 22 0 ???:vfprintf
11,845,373 22 2 3,126,914 46 22 1,563,457 0 0 ???:__find_specmb
6,004,482 40 10 697,872 1,744 484 0 0 0 ???:strlen
5,008,448 3 2 1,450,093 370 118 0 0 0 ???:strcmp
3,316,589 24 4 757,523 0 0 540,952 0 0 ???:_IO_padn
2,825,541 3 3 290,222 5 1 216,403 0 0 ???:_itoa_word
2,628,466 9 6 730,059 0 0 358,215 0 0 ???:_IO_file_overflow@@GLIBC_2.2.5
2,504,211 4 4 762,151 2 0 598,833 3 0 ???:_IO_do_write@@GLIBC_2.2.5
2,296,142 32 7 616,490 88 0 321,848 0 0 dwarf_child.c:__libdw_find_attr
2,184,153 2,876 20 503,805 67 0 435,562 0 0 ???:__dcigettext
2,014,243 3 3 435,512 1 1 272,195 4 0 ???:_IO_file_write@@GLIBC_2.2.5
1,988,697 2,804 4 656,112 380 0 47,847 1 1 ???:getenv
1,973,463 27 6 597,768 15 0 420,805 0 0 dwarf_getattrs.c:dwarf_getattrs
```

此程序生成的输出包含缓存使用摘要，该摘要在进程终止时也会打印，同时还包含程序每个函数中缓存行使用的详细摘要。

生成此perfunction数据需要cg annotate能够将地址与函数匹配。

这意味着应该可以获得调试信息以获得最佳结果。

如果不这样做，ELF符号表可以帮助一点，但由于内部符号未在动态符号表中列出，结果是不完整。

图7.6显示了与图7.5相同的程序输出的一部分。

### 内容分析

The Ir, Dr, and Dw columns show the total cache use, not cache misses, which are shown in the following two columns. 

This data can be used to identify the code which produces the most cache misses. 

First, one probably would concentrate on（专注于） L2 cache misses, then proceed to optimizing L1i/L1d cache misses.

### cg-annotate 提供更加详细的信息

cg_annotate can provide the data in more detail. 

If the name of a source file is given, it also annotates (hence the program’s name) each line of the source file with the number of cache hits and misses corresponding to that line. 

This information allows the programmer to drill down（深入研究） to the exact line where cache misses are a problem. 

The program interface is a bit raw: 

as of this writing, the cachegrind data file and the source file must be in the same directory.


## 注意

It should, at this point, be noted again: 

cachegrind is a simulator which does not use measurements from the processor（处理器的测量结果）. 

The actual cache implementation in the processor might very well be quite different. 

cachegrind simulates Least Recently Used (LRU) eviction, which is likely to be too expensive for caches with large associativity（关联）.

Furthermore, the simulation does not take context switches and system calls into account, both of which can destroy large parts of L2 and must flush L1i and L1d.

This causes the total number of cache misses to be lower than experienced in reality. 

Nevertheless, cachegrind is a nice tool to learn about a program’s memory use and its problems with memory.

尽管如此，cachegrind是了解程序内存使用及其内存问题的好工具。

# 参考资料

P81

- Other

[valgrind](https://baike.baidu.com/item/valgrind/3774370?fr=aladdin)

* any list
{:toc}
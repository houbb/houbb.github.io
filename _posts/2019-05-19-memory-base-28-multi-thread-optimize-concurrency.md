---
layout: post
title: Memory 内存知识-28-多线程优化之并发
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Multi-Thread Optimizations

When it comes to multi-threading, there are three different aspects of cache use which are important:

- Concurrency

- Atomicity

- Bandwidth

These aspects also apply to multi-process situations but, because multiple processes are (mostly) independent, it is not so easy to optimize for them. 

The possible multiprocess optimizations are a subset of those available for the multi-thread scenario. 

可能的多进程优化是可用于多线程方案的子集。

So we will deal exclusively with the latter here.

In this context concurrency refers to the memory effects a process experiences when running more than one thread at a time. 

A property of threads is that they all share the same address space and, therefore, can all access the same memory. 

In the ideal case, the memory regions used by the threads most of the time are distinct, in which case those threads are coupled only lightly (common input and/or output, for instance). 

If more than one thread uses the same data, coordination is needed; this is when atomicity comes into play. 

Finally, depending on the machine architecture, the available memory and interprocessor bus bandwidth available to the processors is limited. 

We will handle these three aspects separately in the following sections–although they are, of course, closely linked.

# Concurrency Optimizations

Initially, in this section, we will discuss two separate issues which actually require contradictory（矛盾） optimizations.

A multi-threaded application uses common data in some of its threads. 

Normal cache optimization calls for keeping data together so that the footprint of the application is small, thus maximizing the amount of memory which fits into the caches at any one time.

正常的高速缓存优化要求将数据保持在一起，以便应用程序的占用空间很小，从而最大限度地增加适合高速缓存的内存量。

## 问题

There is a problem with this approach, though: if multiple threads write to a memory location, the cache line must be in ‘E’ (exclusive) state in the L1d of each respective core. 

This means that a lot of RFO messages are sent, in the worst case one for each write access. 

So a normal write will be suddenly very expensive. 

多线程会导致写的代价非常大。

If the same memory location is used, synchronization is needed (maybe through the use of atomic operations, which is handled in the next section). 

The problem is also visible, though, when all the threads are using different memory locations and are supposedly independent.

如果使用相同的内存位置，则需要同步（可能通过使用原子操作，这将在下一节中处理）。

但是，当所有线程使用不同的内存位置并且被认为是独立的时，问题也是可见的。

## 性能对比图

Figure 6.10 shows the results of this “false sharing”. 

The test program (shown in section A.3) creates a number of threads which do nothing but increment a memory location (500 million times). 

The measured time is from the program start until the program finishes after waiting for the last thread. 

The threads are pinned to（固定到） individual processors. 

The machine has four P4 processors. 

The blue values represent runs where the memory allocations assigned to each thread are on separate cache lines. 

The red part is the penalty（惩罚） occurred when the locations for the threads are moved to just one cache line.

![image](https://user-images.githubusercontent.com/18375710/63666537-b1345f00-c802-11e9-90ab-1c9b8bd909c6.png)

### 蓝色

The blue measurements (time needed when using individual cache lines) match what one would expect. 

The program scales without penalty to many threads. 

Each processor keeps its cache line in its own L1d and there are no bandwidth issues since not much code or data has to be read (in fact, it is all cached). 

The measured slight increase is really system noise and probably some prefetching effects (the threads use sequential cache lines).

### 测量过载

The measured overhead, computed by dividing the time needed when using one single cache line versus a separate cache line for each thread, is 390%, 734%, and 1,147% respectively. 

通过将使用单个高速缓存行所需的时间除以每个线程的单独高速缓存行计算的测量开销分别为390％，734％和1,147％。

These large numbers might be surprising at first sight but, when thinking about the cache interaction（相互作用） needed, it should be obvious（明显）. 

The cache line is pulled from one processor’s cache just after it has finished writing to the cache line. 

All processors, except the one which has the cache line at any given moment, are delayed and cannot do anything. 

Each additional processor will just cause more delays.

## 如何解决这个问题

It is clear from these measurements that this scenario（脚本） must be avoided in programs. 

Given the huge penalty, this problem is, in many situations, obvious (profiling will show the code location, at least) but there is a pitfall with modern hardware. 

鉴于巨大的损失，在许多情况下，这个问题是显而易见的（分析将显示代码位置，至少）但现代硬件存在缺陷。

### 单核的测量信息

Figure 6.11 shows the equivalent measurements when running the code on a single processor, quad core machine (Intel Core 2 QX 6700). 

Even with this processor’s two separate L2s the test case does not show any scalability issues. 

![image](https://user-images.githubusercontent.com/18375710/63666755-c8278100-c803-11e9-87e4-b15ec62ccda7.png)

There is a slight overhead when using the same cache line more than once but it does not increase with the number of cores.

虽然也存在一定的负载，但是不会随着核数的增长而线性变化。

If more than one of these processors were used we would, of course, see results similar to those in Figure 6.10. 

Despite the increasing use of multi-core processors, many machines will continue to use multiple processors and, therefore, it is important to handle this scenario correctly, which might mean testing the code on real SMP machines.

尽管越来越多地使用多核处理器，但许多机器将继续使用多个处理器，因此，正确处理这种情况非常重要，这可能意味着在真正的SMP机器上测试代码。

## 简单的解决方案

There is a very simple “fix” for the problem: put every variable on its own cache line. 

This is where the conflict with the previously mentioned optimization comes into play, specifically, the footprint of the application would increase a lot. 

This is not acceptable; it is therefore necessary to come up with a more intelligent solution.

问题有一个非常简单的“修复”：将每个变量放在自己的缓存行上。

这就是与前面提到的优化冲突起作用的地方，具体而言，应用程序的占用空间会增加很多。

这是不可接受的; 因此有必要提出一个更智能的解决方案。

## 如何区分变量是否被属于竞态资源

What is needed is to identify which variables are used by only one thread at a time, those used by only one thread ever, and maybe those which are contested at times. 

所需要的是识别一次仅由一个线程使用的变量，仅由一个线程使用的变量，以及可能有时被争议的那些变量。

Different solutions for each of these scenarios are possible and useful. 

The most basic criterion（标准） for the differentiation of variables is: 

are they ever written to and how often does this happen.

## 变量的各种状态标记

Variables which are never written to and those which are only initialized once are basically constants. 

Since RFO messages are only needed for write operations, constants can be shared in the cache (‘S’ state). 

So, these variables do not have to be treated specially; 

grouping them together is fine. 

If the programmer marks the variables correctly with const, the tool chain will move the variables away from the normal variables into the `.rodata` (read-only data) or `.data.rel.ro` (read-only after relocation) section No other special action is required. 

If, for some reason, variables cannot be marked correctly with const, the programmer can influence their placement by assigning them to a special section.


## 将基本不变的变量分组的可能性

When the linker constructs the final binary, it first appends the sections with the same name from all input files; 

those sections are then arranged in an order determined by the linker script. 

当链接器构造最终的二进制文件时，它首先在所有输入文件中附加具有相同名称的部分;

然后按链接器脚本确定的顺序排列这些部分。

This means that, by moving all variables which are basically constant but are not marked as such into a special section, the programmer can group all of those variables together. 

There will not be a variable which is often written to between them. 

By aligning the first variable in that section appropriately（适当）,it is possible to guarantee that no false sharing happens.

## 例子

Assume this little example:

```
int foo = 1;
int bar __attribute__((section(".data.ro"))) = 2;
int baz = 3;
int xyzzy __attribute__((section(".data.ro"))) = 4;
```


If compiled, this input file defines four variables. 

The interesting part is that the variables foo and baz, and bar and xyzzy are grouped together respectively（分别）. 

Without the attribute definitions the compiler would allocate all four variables in the sequence in which they are defined in the source code the a section named `.data.` With the code as-is the variables bar and xyzzy are placed in a section named `.data.ro`. 

The section name `.data.ro` is more or less arbitrary. 

A prefix of `.data.` guarantees that the GNU linker will place the section together with the other data sections.

## 技术的其他应用场景

The same technique can be applied to separate out variables which are mostly read but occasionally also written to. 

Simply choose a different section name. 

This separation seems to make sense in some cases like the Linux kernel.

If a variable is only ever used by one thread, there is another way to specify the variable. 

In this case it is possible and useful to use thread-local variables. 

The C and C++ language in gcc allow variables to be defined as per-thread using the __thread keyword.

可以应用相同的技术来分离主要读取但偶尔也写入的变量。

只需选择不同的部分名称即可。

在某些情况下，例如Linux内核，这种分离似乎是有意义的。

如果一个线程只使用了一个变量，那么还有另一种方法来指定变量。

在这种情况下，使用线程局部变量是可能和有用的。

### gcc 中如何指定

gcc中的C和C ++语言允许使用__thread关键字将变量定义为每个线程。

ps: 可以将不变的进行分组，同理也就可以对主要读取+偶尔写入的进行分组。

```c
int foo = 1;
__thread int bar = 2;
int baz = 3;
__thread int xyzzy = 4;
```

The variables *bar* and *xyzzy* are not allocated in the normal data segment; 

instead each thread has its own separate area where such variables are stored. 

The variables can have static initializers. 

### thread-local 变量

All thread-local variables are addressable by all other threads but, unless a thread passes a pointer to a thread-local variable to those
other threads, there is no way the other threads can find that variable. 

Due to the variable being thread-local, false sharing is not a problem–unless the program artificially creates a problem. 

This solution is easy to set up (the compiler and linker do all the work), but it has its cost.

When a thread is created, it has to spend some time on setting up the thread-local variables, which requires time and memory. 

In addition, addressing thread-local variables is usually more expensive than using global or automatic variables.

所有线程局部变量都可由所有其他线程寻址，但除非线程将指向线程局部变量的指针传递给那些线程
其他线程，其他线程无法找到该变量。

由于变量是线程本地的，因此虚假共享不是问题 - 除非程序人为地产生问题。

这个解决方案很容易设置（编译器和链接器完成所有工作），但它有成本。

### 代价

- 浪费内存 & 耗时

创建线程时，必须花一些时间来设置线程局部变量，这需要时间和内存。

此外，寻址线程局部变量通常比使用全局或自动变量更昂贵。

ps: 应该就是 java 中的 ThreadLocal 这样可以避免不同线程间的信息

- 每个线程的副本都不同

Another drawback of using thread-local storage (TLS) is that, if the use of the variable shifts over to another thread, the current value of the variable in the old thread is not available to new thread. 

Each thread’s copy of the variable is distinct. 

Often this is not a problem at all and, if it is, the shift over to the new thread needs coordination, at which time the current value can be copied.

- 更大的问题资源的浪费

A bigger problem is possible waste of resources. 

If only one thread ever uses the variable at any one time, all threads have to pay a price in terms of memory. 

If a thread does not use any TLS variables, the lazy allocation of the TLS memory area prevents this from being a problem (except for TLS in the application itself). 

If a thread uses just one TLS variable in a DSO, the memory for all the other TLS variables in this object will be allocated, too. 

This could potentially（可能） add up if TLS variables are used on a large scale（规模大）.

# 最佳实践

In general the best advice which can be given is

（1）Separate at least read-only (after initialization) and read-write variables. 

Maybe extend this separation to read-mostly variables as a third category.

（2） Group read-write variables which are used together into a structure. 

Using a structure is the only way to ensure the memory locations for all of those variables are close together in a way which is translated consistently by all gcc versions..

（3） Move read-write variables which are often written to by different threads onto their own cache line.

This might mean adding padding at the end to fill a remainder of the cache line. If combined with step 2, this is often not really wasteful. 

## 拓展上述案例

Extending the example above, we might end up with code as follows (assuming bar and xyzzy are meant to be used together):

```c
int foo = 1;
int baz = 3;
struct {
struct al1 {
int bar;
int xyzzy;
};
char pad[CLSIZE - sizeof(struct al1)];
} rwstruct __attribute__((aligned(CLSIZE))) =
{ { .bar = 2, .xyzzy = 4 } };
```

Some code changes are needed (references to bar have to be replaced with rwstruct.bar, likewise for xyzzy) but that is all. 

The compiler and linker do all the rest.

（4） If a variable is used by multiple threads, but every use is independent, move the variable into TLS.

# 参考资料

P68

* any list
{:toc}
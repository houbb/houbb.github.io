---
layout: post
title: Memory 内存知识-26-021-实战技巧之 Cache L1 优化
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Cache Access

Programmers wishing to improve their programs’ performance will find it best to focus on changes affected the level 1 cache since those will likely yield the best results.

We will discuss it first before extending the discussion to the other levels. 

Obviously, all the optimizations for the level 1 cache also affect the other caches. 

The theme for all memory access is the same: improve locality (spatial and temporal) and align the code and data.

**改善局部性（空间和时间）并对齐代码和数据。**

# Optimizing Level 1 Data Cache Access

In section section 3.3 we have already seen how much the effective use of the L1d cache can improve performance

## 代码编码对于性能的提升

In this section we will show what kinds of code changes can help to improve that performance. 

Continuing from the previous section, we first concentrate on（专注于） optimizations to access memory sequentially. 

As seen in the numbers of section 3.3, the processor automatically prefetches data when memory is accessed sequentially.

如果我们可以保证访问内存的顺序性，处理器会帮我们自动预取。

## 例子

The example code used is a matrix multiplication. 

We use two square matrices of 1000 * 1000 double elements.

For those who have forgotten the math, given two matrices A and B with elements aij and bij with
0 <= i; j < N the product is

![image](https://user-images.githubusercontent.com/18375710/63067590-43ef1700-bf42-11e9-8f0a-397b5d3f77ff.png)

### 直接使用 c 语言实现

```c
for (i = 0; i < N; ++i)
    for (j = 0; j < N; ++j)
        for (k = 0; k < N; ++k)
            res[i][j] += mul1[i][k] * mul2[k][j];
```

The two input matrices are mul1 and mul2. 

The result matrix *res* is assumed to be initialized to all zeroes. 

It is a nice and simple implementation. 

But it should be obvious that we have exactly the problem explained in Figure 6.1. 

While *mul1* is accessed sequentially, the inner loop advances the row number of *mul2*. 

That means that *mul1* is handled like the left matrix in Figure 6.1 while *mul2* is handled like the right matrix. 

This cannot be good.


## 优化方式1-顺序化访问

There is one possible remedy（补救） one can easily try. 

Since each element in the matrices（矩阵） is accessed multiple times it might be worthwhile to rearrange （改编）(“transpose,” in mathematical terms) the second matrix mul2 before using it.

![image](https://user-images.githubusercontent.com/18375710/63071716-ffb84280-bf52-11e9-8b62-91454472cd2a.png)

After the transposition (traditionally indicated by a superscript ‘T’) we now iterate over both matrices sequentially.

As far as the C code is concerned, it now looks like this:

```c
double tmp[N][N];
for (i = 0; i < N; ++i)
    for (j = 0; j < N; ++j)
        tmp[i][j] = mul2[j][i];

for (i = 0; i < N; ++i)
    for (j = 0; j < N; ++j)
        for (k = 0; k < N; ++k)
            res[i][j] += mul1[i][k] * tmp[j][k];
```

We create a temporary variable to contain the transposed（换位，颠倒）matrix. 

This requires touching additional memory, but this cost is, hopefully, recovered since the 1000 nonsequential accesses per column are more expensive (at least on modern hardware). 

- 性能提升

Time for some performance tests. 

The results on a Intel Core 2 with 2666MHz clock speed are (in clock cycles):

|         | Original |  Transposed | 
| Cycles  | 16,765,297,870 |  3,922,373,010 |
| Relative | 100% | 23.4% | 

Through the simple transformation of the matrix we can achieve a 76.6% speed-up! 

The copy operation is more than made up. 

The 1000 non-sequential accesses really hurt.

## 这是最好的方案吗？

The next question is whether this is the best we can do. 

We certainly need an alternative method anyway which does not require the additional copy. 

我们当然需要一种替代方法，不需要额外的副本。

ps: 也就是上面的优化，实际上用到了额外的存储空间。

We will not always have the luxury（豪华，奢侈） to be able to perform the copy: 

the matrix can be too large or the available memory too small.

ps: 在对象非常大的时候，或者可用内存非常小的时候，拷贝就会变得非常奢侈。

### 思考方式

Now let us examine the actual problem in the execution of the original code. 

The order in which the elements of mul2 are accessed is: 

```
(0,0), (1,0), . . . , (N-1,0), (0,1), (1,1), . . . .
``` 

The elements (0,0) and (0,1) are in the same cache line but, by the time the inner loop completes one round, this cache line has long been evicted. 

For this example, each round of the inner loop requires, for each of the three matrices, 1000 cache lines (with 64 bytes for the Core 2 processor). 

This adds up to much more than the 32k of L1d available.

But what if we handle two iterations of the middle loop together while executing the inner loop? 

In this case we use two double values from the cache line which is guaranteed to be in L1d. 

We cut the L1d miss rate in half. 

但是如果我们在执行内部循环时一起处理中间循环的两次迭代呢？

在这种情况下，我们使用缓存行中的两个double值，保证在L1d中。

我们将L1d未命中率降低了一半。

That is certainly an improvement, but, depending on the cache line size, it still might not be as good as we can get it. 

The Core 2 processor has a L1d cache line size of 64 bytes. 

The actual value can be queried using

```
sysconf (_SC_LEVEL1_DCACHE_LINESIZE)
```

或者使用 `pscpu` 指令查看。

at runtime or using the getconf utility from the command line so that the program can be compiled for a specific cache line size. 

With `sizeof(double)` being 8 this means that, to fully utilize（利用） the cache line, we should unroll（披，摊开） the middle loop 8 times. 

Continuing this thought, to effectively use the res matrix as well, i.e., to write 8 results at the same time, we should unroll the outer loop 8 times as well. 

We assume here cache lines of size 64 but the code works also well on systems with 32 byte cache lines since both cache lines are also 100% utilized. 

In general it is best to hardcode cache line sizes at compile time by using the *getconf* utility as in:

```
gcc -DCLS=$(getconf LEVEL1_DCACHE_LINESIZE) ...
```

If the binaries are supposed to be generic, the largest cache line size should be used. 

如果二进制文件应该是通用的，则应使用最大的缓存行大小。

With very small L1ds this might mean that not all the data fits into the cache but such processors are not suitable for high-performance programs anyway. 

### 示意代码

The code we arrive at looks something like this:

```c
#define SM (CLS / sizeof (double))

for (i = 0; i < N; i += SM)
    for (j = 0; j < N; j += SM)
        for (k = 0; k < N; k += SM)
            for (i2 = 0, rres = &res[i][j],
            rmul1 = &mul1[i][k]; i2 < SM;
            ++i2, rres += N, rmul1 += N)

            for (k2 = 0, rmul2 = &mul2[k][j];
                k2 < SM; ++k2, rmul2 += N)
                    for (j2 = 0; j2 < SM; ++j2)
                        rres[j2] += rmul1[k2] * rmul2[j2];
```

This looks quite scary（令人害怕）. 

To some extent it is but only because it incorporates（合并） some tricks. 

The most visible change is that we now have six nested loops. 

The outer loops iterate with intervals of SM (the cache line size divided by sizeof(double)). 

This divides the multiplication in several smaller problems which can be handled with more cache locality. 

The inner loops iterate over the missing indexes of the outer loops. 

There are, once again, three loops. 

The only tricky part here is that the k2 and j2 loops are in a different order. 

This is done since, in the actual computation, only one expression depends on k2 but two depend on j2.

- 编译器的问题

The rest of the complication here results from the fact that gcc is not very smart when it comes to optimizing array indexing. 

The introduction of the additional variables rres, rmul1, and rmul2 optimizes the code by pulling common expressions out of the inner loops, as far down as possible. 

The default aliasing rules of the C and C++ languages do not help the compiler making these decisions (unless restrict is used, all pointer accesses are potential sources of aliasing). 

This is why Fortran is still a preferred language for numeric programming: it makes writing fast code easier.

这就是为什么Fortran仍然是数字编程的首选语言：它使编写快速代码变得更容易。

### 性能测评

![image](https://user-images.githubusercontent.com/18375710/63074253-f634d780-bf5e-11e9-8d76-3ef90df57311.png)

How all this work pays off can be seen in Table 6.2. 

By avoiding the copying we gain another 6.1% of performance.

Plus, we do not need any additional memory.

The input matrices can be arbitrarily（任意） large as long as the result matrix fits into memory as well. 

This is a requirement for a general solution which we have now achieved.

ps: 其实不增加临时变量（额外空间），提升性能。我们的代价是，代码的复杂度变得很高。

- 其他要注意的地方

There is one more column in Table 6.2 which has not been explained. 

Most modern processors nowadays include special support for vectorization（矢量，向量）. 

Often branded as multi-media extensions, these special instructions allow processing of 2, 4, 8, or more values at the same time. 

These are often SIMD (Single Instruction, Multiple Data) operations, augmented by others to get the data in the right form. 

The SSE2 instructions provided by Intel processors can handle two double values in one operation. 

The instruction reference manual lists the intrinsic functions which provide access to these SSE2 instructions.

If these intrinsics are used the program runs another 7.3% (relative to the original) faster. 

The result is a program which runs in 10% of the time of the original code. 

Translated into numbers which people recognize, we went from 318 MFLOPS to 3.35 GFLOPS. 

Since we are only interested in memory effects here, the program code is pushed out into section A.1.

## 注意

It should be noted that, in the last version of the code, we still have some cache problems with mul2; 

prefetching still will not work. 

But this cannot be solved without transposing（移调，颠倒） the matrix. 

Maybe the cache prefetching units will get smarter to recognize the patterns, then no additional change would be needed. 

3.19 GFLOPS on a 2.66 GHz processor with single-threaded code is not bad, though.

What we optimized in the example of the matrix multiplication（惩罚，繁殖） is the use of the loaded cache lines. 

All bytes of a cache line are always used. 

We just made sure they are used before the cache line is evacuated（疏散，稀疏）. 

This is certainly a special case.

- 更普遍的场景

It is much more common to have data structures which fill one or more cache lines where the program uses only a few members at any one time. 

In Figure 3.11 we have already seen the effects of large structure sizes if only few members are used.

## 性能对比图

Figure 6.2 shows the results of yet another set of benchmarks performed using the by now well-known program.

This time two values of the same list element are added. 

In one case, both elements are in the same cache line; 

in another case, one element is in the first cache line of the list element and the second is in the last cache line. 

The graph shows the slowdown we are experiencing.

该图显示了我们正在经历的放缓。

![image](https://user-images.githubusercontent.com/18375710/63091111-f00b1f00-bf8f-11e9-81ff-630f29a62f05.png)

Unsurprisingly, in all cases there are no negative effects if the working set fits into L1d. 

Once L1d is no longer sufficient, penalties（处罚） are paid by using two cache lines in the process instead of one. 

The red line shows the data when the list is laid out sequentially in memory. 

We see the usual two step patterns: 

about 17% penalty when the L2 cache is sufficient and about 27% penalty when the main memory has to be used.

### 随机访问

In the case of random memory accesses the relative data looks a bit different. 

The slowdown for working sets which fit into L2 is between 25% and 35%. 

Beyond that it goes down to about 10%. 

This is not because the penalties（处罚） get smaller but, instead, because the actual memory accesses get disproportionally（不成比例） more costly. 

The data also shows that, in some cases, the distance between the elements does matter. 

The Random 4 CLs curve shows higher penalties because the first and fourth cache lines are used.


## 数据结构布局

An easy way to see the layout of a data structure compared to cache lines is to use the pahole program. 

This program examines the data structures defined in a binary. 

Take a program containing this definition:

```c
struct foo {
    int a;
    long fill[7];
    int b;
};
```

- 输出结果

```c
struct foo {
int a; /* 0 4 */
/* XXX 4 bytes hole, try to pack */
long int fill[7]; /* 8 56 */
/* --- cacheline 1 boundary (64 bytes) --- */
int b; /* 64 4 */
}; /* size: 72, cachelines: 2 */
/* sum members: 64, holes: 1, sum holes: 4 */
/* padding: 4 */
/* last cacheline: 8 bytes */
```

When compiled on a 64-bit machine, the output of pahole contains (among other things) the output shown in Figure 6.3. 

This output tells us a lot. 

First, it shows that the data structure uses up more than one cache line. 

The tool assumes the currently used processor’s cache line size, but this value can be overridden using a command line parameter. 

Especially in cases where the size of the structure is barely over the limit of a cache line, and many objects of this type are allocated,it makes sense to seek a way to compress that structure. 

Maybe a few elements can have a smaller type, or maybe some fields are actually flags which can be represented using individual bits.

## 压缩

In the case of the example the compression（压缩） is easy and it is hinted at by the program. 

The output shows that there is a hole of four bytes after the first element. 

This hole is caused by the alignment requirement of the structure and the *fill* element. 

It is easy to see that the element b, which has a size of four bytes (indicated by the 4 at the end of the line), fits perfectly into the gap. 

The result in this case is that the gap no longer exists and that the data structure fits onto one cache line. 

The pahole tool can perform this optimization itself. 

If the `--reorganize` parameter is used and the structure name is added at the end of the command line the output of the tool is the optimized structure and the cache line use. 

Besides moving elements to fill gaps, the tool can also optimize bit fields and combine padding and holes. 

For more details see.

## 对齐的好处 

Having a hole which is just large enough for the trailing（尾随） element is, of course, the ideal situation（理想的情况）. 

For this optimization to be useful it is required that the object itself is aligned to a cache line. 

We get to that in a bit.

The pahole output also allows to see easily whether elements have to be reordered so that those elements which are used together are also stored together. 

Using the pahole tool, it is easily possible to determine which elements are on the same cache line and when, instead, the elements have to be reshuffled to achieve that. 

This is not an automatic process but the tool can help quite a bit.

使用pahole工具，可以很容易地确定哪些元素在同一缓存行上，以及何时必须重新调整元素以实现该目标。

这不是一个自动过程，但该工具可以帮助很多。

## 最佳实践规则

The position of the individual structure elements（个别结构元素） and the way they are used is important, too. 

As we have seen in section 3.5.2 the performance of code with the critical word late in the cache line is worse. 

This means a programmer programmer should always follow the following two rules:

1. Always move the structure element which is most likely to be the critical word to the beginning of the structure.

2. When accessing the data structures, and the order of access is not dictated（决定） by the situation, access the elements in the order in which they are defined in the structure.

1. 始终将最可能是关键词的结构元素移动到结构的开头。

2. 在访问数据结构时，根据情况没有规定访问顺序（决定），按照结构中定义的顺序访问元素。

For small structures, this means that the elements should be arranged in the order in which they are likely accessed.

This must be handled in a flexible way to allow the other optimizations, such as filling holes, to be applied as well.

For bigger data structures each cache line-sized block should be arranged to follow the rules.

## 对齐与重排序的代价

If the object itself is not aligned as expected, reordering elements is not worth the time it takes, though. 

The alignment of an object is determined by the alignment requirement of the data type. 

Each fundamental（基本的） type has its own alignment requirement. 

For structured types the largest alignment requirement of any of its elements determines the alignment of the structure. 

This is almost always smaller than the cache line size. 

This means even if the members of a structure are lined up to fit into the same cache line an allocated object might not have an
alignment matching the cache line size. 

### 两种处理方式

There are two ways to ensure that the object has the alignment which was used when designing the layout of the structure:

（1）the object can be allocated with an explicit（明确的） alignment requirement. 

For dynamic allocation a call to *malloc* would only allocate the object with an alignment matching that of the most demanding（严格） standard type (usually long double). 

It is possible to use *posix_memalign*, though, to request higher alignments.

```c
#include <stdlib.h>
int posix_memalign(void **memptr,
size_t align,
size_t size);
```

The function stores a pointer pointing to the newly allocated memory in the pointer variable pointed to by *memptr*. 

The memory block is size bytes in size and is aligned on a align-byte boundary.

- 编译器分配对象

For objects allocated by the compiler (in .data, .bss, etc, and on the stack) a variable attribute can be used:

```c
struct strtype variable
    __attribute((aligned(64)));
```

In this case the variable is aligned at a 64 byte boundary regardless of the alignment requirement of the strtype structure. 

This works for global variables as well as automatic variables.

- 对于数组的内存分配

For arrays this method does not work as one might expect. 

Only the first element of the array would be aligned unless the size of each array element is a multiple of the alignment value. 

It also means that every single variable must be annotated appropriately.

The use of *posix_memalign* is also not entirely free since the alignment requirements usually lead to fragmentation（碎片） and/or higher memory consumption（消费）.


（2）the alignment requirement of a user-defined type can be changed by using a type attribute:

用户自定义的对齐可以修改，通过指定类型属性。

```c
struct strtype {
...members...
} __attribute((aligned(64)));
```

This will cause the compiler to allocate all objects with the appropriate（适当） alignment, including arrays.

The programmer has to take care of requesting the appropriate alignment for dynamically allocated objects, though. 

Here once again posix_memalign must be used. 

It is easy enough to use the alignof operator gcc provides and pass the value as the second parameter to posix_memalign.

## 硬对齐

The multimedia extensions（多媒体拓展） previously mentioned in this section almost always require that the memory accesses are aligned. 

I.e., for 16 bytememory accesses the address is supposed to be 16 byte aligned. 

The x86 and x86-64 processors have special variants of the memory operations which can handle unaligned accesses but these are slower. 

This hard alignment requirement（硬对齐） is nothing new for most RISC architectures which require full alignment for all memory accesses. 

Even if an architecture supports unaligned accesses this is sometimes slower than using appropriate alignment, especially if the misalignment causes a load or store to use two cache lines instead of one.

对于大多数需要完全对齐所有内存访问的RISC架构而言，这种硬对齐要求并不是什么新鲜事。

即使体系结构支持未对齐访问，这有时比使用适当的对齐慢，特别是如果未对齐导致加载或存储使用两个缓存行而不是一个缓存行。

ps: 对齐可以保证加载的信息和 cache line 的大小完全一致。这样可以保证最高的加载性能。

# 未对齐的访问

![image](https://user-images.githubusercontent.com/18375710/63096740-4896e800-bfa1-11e9-88db-7de0e7f4b18d.png)

Figure 6.4 shows the effects of unaligned memory accesses.

The now well-known tests which increment a data element while visiting memory (sequentially or randomly) are measured, once with aligned list elements and once with deliberately misaligned（故意不对齐） elements. 

The graph shows the slowdown the program incurs because of the unaligned accesses. 

The effects are more dramatic（戏剧性） for the sequential access case than for the random case because, in the latter case, the costs of unaligned accesses are partially hidden by the generally higher costs of the memory access. 

ps: 这种影响对于顺序访问更加明显，因为随机访问的代价过大，将未对齐的影响都掩盖了。

## L1 & L2

In the sequential case, for working set sizes which do fit into the L2 cache, the slowdown is about 300%. 

This can be explained by the reduced effectiveness of the L1 cache. 

Some increment operations now touch two cache lines, and beginning work on a list element now often requires reading of two cache lines. 

The connection between L1 and L2 is simply too congested（拥挤）.

ps: 个人感觉不对齐影响有不少。一个是两个缓存行造成缓存的实际有效数量下降，第二个实际 L1 和 L2 的交互变多，性能降低。

## 大的工作集合

For very large working set sizes, the effects of the unaligned access are still 20% to 30%–which is a lot given that the aligned access time for those sizes is long. 

This graph should show that alignment must be taken seriously.

Even if the architecture supports unaligned accesses, this must not be taken as “they are as good as aligned accesses”.

## 对齐的缺点

There is some fallout from these alignment requirements, though. 

If an automatic variable has an alignment requirement, the compiler has to ensure that it is met in all situations. 

This is not trivial since the compiler has no control over the call sites and the way they handle the stack. 

### 问题的解决方式

This problem can be handled in two ways:

（1） The generated code actively aligns the stack, inserting gaps if necessary. 

This requires code to check for alignment, create alignment, and later undo the alignment.

ps: 直接通过填充间隙的方式，来弥补这种间隙。类似于 char(xxx)，填充的感觉。

但是需要检测-填充-取消填充。感觉很麻烦。

（2）Require that all callers have the stack aligned.

All of the commonly used application binary interfaces (ABIs) follow the second route. 

所有常用的应用程序二进制接口（ABI）都遵循第二条路径。

Programs will likely fail if a caller violates the rule and alignment is needed in the callee. 

Keeping alignment intact（完整） does not come for free, though.


## stack frame 是否需要对齐

The size of a stack frame used in a function is not necessarily a multiple of the alignment. 

This means padding is needed if other functions are called from this stack frame. 

The big difference is that the stack frame size is, in most cases, known to the compiler and, therefore, it knows how to adjust the stack pointer to ensure alignment for any function which is called from that stack frame. 

In fact, most compilers will simply round the stack frame size up and be done with it.

事实上，大多数编译器只是简化堆栈帧大小并完成它。

### 对齐最简单的方式

This simple way to handle alignment is not possible if variable length arrays (VLAs) or alloca are used. 

In that case, the total size of the stack frame is only known at runtime. 

Active alignment control might be needed in this case, making the generated code (slightly) slower.

## 多媒体拓展才需要严格对齐

On some architectures, only the multimedia extensions require strict alignment; 

stacks on those architectures are always minimally aligned for the normal data types, 

usually 4 or 8 byte alignment for 32- and 64-bit architectures respectively. 

On these systems, enforcing the alignment incurs unnecessary costs. 

That means that, in this case, we might want to get rid of the strict alignment requirement if we know that it is never depended upon.

Tail functions (those which call no other functions) which do no multimedia operations do not need alignment. 

不执行多媒体操作的尾部功能（不调用其他功能的功能）不需要对齐。

Neither do functions which only call functions which need no alignment. 

If a large enough set of functions can be identified, a program might want to relax the alignment requirement. 

ps: 如果数据集很大，那么应该放宽对于对齐的要求。


## x86 系统

For x86 binaries gcc has support for relaxed stack alignment requirements:

```
-mpreferred-stack-boundary=2
```

If this option is given a value of N, the stack alignment requirement will be set to 2N bytes. 

So, if a value of 2 is used, the stack alignment requirement is reduced from the default (which is 16 bytes) to just 4 bytes. 

In most cases this means no additional alignment operation is needed since normal stack push and pop operations work on four-byte boundaries anyway. 

在大多数情况下，这意味着不需要额外的对齐操作，因为正常的堆栈推送和弹出操作无论如何都在四字节边界上工作。

This machine-specific（机器专用） option can help to reduce code size and also improve execution speed. 

可以降低代码数量，并且提升执行性能。

But it cannot be applied for many other architectures. 

Even for x86-64 it is generally not applicable since the x86-64 ABI requires that floating-point（浮点） parameters are passed in an SSE register and the SSE instructions require full 16 byte alignment.

Nevertheless, whenever the option is usable it can make a noticeable difference.

然而，只要该选项可用，它就会产生明显的差异。


# 数组结构的影响

Efficient placement of structure elements and alignment are not the only aspects of data structures which influence cache efficiency. 

If an array of structures is used, the entire structure definition affects performance. 

结构元素的有效放置和对齐不是影响高速缓存效率的数据结构的唯一方面。

如果使用结构数组，则整个结构定义会影响性能。 

Remember the results in Figure 3.11: 

in this case we had increasing amounts of unused data in the elements of the array. 

The result was that prefetching was increasingly less effective and the program, for large data sets, became less efficient.

ps: 随着数据集合的提升，数据的预取性能会变得越来越差。

For large working sets it is important to use the available cache as well as possible. 

To achieve this, it might be necessary to rearrange data structures. 

为此，可能需要重新排列数据结构。

While it is easier for the programmer to put all the data which conceptually belongs together in the same data structure, this might not be the best approach for maximum performance. 

## 数据结构

Assume we have a data structure as follows:

```c
struct order {
  double price;
  bool paid;
  const char *buyer[5];
  long buyer_id;
};
```

Further assume that these records are stored in a big array and that a frequently-run job adds up the expected payments of all the outstanding bills. 

In this scenario（脚本）, the memory used for the buyer and buyer_id fields is unnecessarily loaded into the caches. 

Judging from the data in Figure 3.11 the program will perform up to 5 times worse than it could.

It is much better to split the order data structure in two pieces, storing the first two fields in one structure and the other fields elsewhere. 

This change certainly increases the complexity of the program, but the performance gains might justify this cost.

这种变化肯定会增加程序的复杂性，但性能提升可能证明这一成本是合理的。

就是通过降低不必要的缓存信息，来提升数据的性能。

# 缓存的冲突未命中问题

Finally, let us consider another cache use optimization which, while also applying to the other caches, is primarily felt in the L1d access. 

As seen in Figure 3.8 an increased associativity of the cache benefits normal operation. 

The larger the cache, the higher the associativity usually is. 

The L1d cache is too large to be fully associative but not large enough to have the same associativity as L2 caches. 

This can be a problem if many of the objects in the working set fall into the same cache set. 

If this leads to evictions due to overuse of a set, the program can experience delays even though much of the cache is unused. 

These cache misses are sometimes called conflict misses. 

Since the L1d addressing uses virtual addresses, this is actually something the programmer can have control over. 

If variables which are used together are also stored together the likelihood of them falling into the same set is minimized. 

## 问题的触发 

Figure 6.5 shows how quickly the problem can hit.

### 图示解释

In the figure, the now familiar Follow with NPAD=15 test is measured with a special setup. 

The X–axis is the distance between two list elements, measured in empty list elements. 

In other words, a distance of 2 means that the next element’s address is 128 bytes after the previous one. 

All elements are laid out in the virtual address space with the same distance. 

The Y–axis shows the total length of the list. 

Only one to 16 elements are used, meaning that the total working set size is 64 to 1024 bytes. 

The z–axis shows the average number of cycles needed to traverse each list element.

![image](https://user-images.githubusercontent.com/18375710/63104895-5f920600-bfb2-11e9-9e7f-fa3a8e1777e1.png)

## 结果分析

The result shown in the figure should not be surprising. 

If few elements are used, all the data fits into L1d and the access time is only 3 cycles per list element. 

The same is true for almost all arrangements of the list elements: 

the virtual addresses are nicely mapped to L1d slots with almost no conflicts. 

There are two (in this graph) special distance values for which the situation is different. 

If the distance is a multiple of 4096 bytes (i.e., distance of 64 elements) and the length of the list is greater than eight, the average number of cycles per list element increases dramatically（显著）. 

ps: 就是图中的两个高峰。

In these situations all entries are in the same set and, once the list length is greater than the associativity, entries are flushed from L1d and have to be re-read from L2 the next round. 

This results in the cost of about 10 cycles per list element.

## 我们能得到什么结论

With this graph we can determine that the processor used has an L1d cache with associativity 8 and a total size of 32kB. 

That means that the test could, if necessary, be used to determine these values. 

The same effects can be measured for the L2 cache but, here, it is more complex since the L2 cache is indexed using physical addresses and it is much larger.

Programmers will hopefully see this data as an indication（迹象，表示） that set associativity is something worth paying attention to. 

Laying out data at boundaries that are powers of two happens often enough in the real world, but this is exactly the situation which can easily lead to the above effects and degraded performance. 

Unaligned accesses can increase the probability of conflict misses since each access might require an additional cache line.

在现实世界中，在两个幂的边界处布置数据经常发生，但这恰好是容易导致上述效果和性能下降的情况。

未对齐访问可能会增加冲突未命中的可能性，因为每次访问可能需要额外的缓存行。

## AMD 

- Figure 6.6: Bank Address of L1d on AMD

```
INDEX   BANK    BYTE
14-7    6-4     3-0
```

If this optimization is performed, another related optimization is possible, too. 

AMD’s processors, at least, implement the L1d as several individual banks. 

The L1d can receive two data words per cycle but only if both words are stored in different banks or in a bank with the same index. 

The bank address is encoded in the low bits of the virtual address as shown in Figure 6.6. 

If variables which are used together are also stored together the likelihood that they are in different banks or the same bank with the same index is high.

L1d每个周期可以接收两个数据字，但只有当两个字存储在不同的存储体或具有相同索引的存储体中时。

如果一起使用的变量也存储在一起，那么它们在不同银行或具有相同指数的同一银行的可能性很高。

# 参考资料

P54

* any list
{:toc}
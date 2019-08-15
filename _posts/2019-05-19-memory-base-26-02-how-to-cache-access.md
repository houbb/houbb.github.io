---
layout: post
title: Memory 内存知识-2602-实战技巧之 Cache L1 优化
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

================================

TODO: 后续更精彩。

# 参考资料

P49

* any list
{:toc}
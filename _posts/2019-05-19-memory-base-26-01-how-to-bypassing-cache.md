---
layout: post
title: Memory 内存知识-2601-实战技巧之绕过缓存
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# What Programmers Can Do

After the descriptions in the previous sections it is clear that there are many, many opportunities for programmers to influence a program’s performance, positively or negatively.

And this is for memory-related operations only. 

We will proceed in covering the opportunities from the ground up, starting with the lowest levels of physical RAM access and L1 caches, up to and including OS functionality which influences memory handling.

# Bypassing the Cache

When data is produced and not (immediately) consumed again, the fact that memory store operations read a full cache line first and then modify the cached data is detrimental（有害） to performance. 

This operation pushes data out of the caches which might be needed again in favor of data which will not be used soon. 

This is especially true for large data structures, like matrices（矩阵，模型）, which are filled and then used later. 

Before the last element of the matrix is filled the sheer size evicts the first elements, making caching of the writes ineffective.

## 类似场景的处理方式

For this and similar situations, processors provide support for non-temporal（非时间性） write operations. 

Non-temporal in this context means the data will not be reused soon, so there is no reason to cache it. 

These non-temporal write operations do not read a cache line and then modify it;

instead, the new content is directly written to memory.

- 对于缓存的建议

也就是在创建的时候，不进行缓存的一种操作方式。

结合 spring 的 `@Cacheable` 的相关注解。

可以在新建的时候不进行缓存，修改/删除的时候直接移除缓存。

读取命中的时候才进行缓存。

这样维护起来比较简单，当然需要考虑下并发下的问题。

## 代价如何

This might sound expensive but it does not have to be.

The processor will try to use write-combining (see section 3.3.3) to fill entire cache lines. 

If this succeeds no memory read operation is needed at all. 

For the x86 and x86-64 architectures a number of intrinsics are provided by gcc:

```c
#include <emmintrin.h>
void _mm_stream_si32(int *p, int a);
void _mm_stream_si128(int *p, __m128i a);
void _mm_stream_pd(double *p, __m128d a);
#include <xmmintrin.h>
void _mm_stream_pi(__m64 *p, __m64 a);
void _mm_stream_ps(float *p, __m128 a);
#include <ammintrin.h>
void _mm_stream_sd(double *p, __m128d a);
void _mm_stream_ss(float *p, __m128 a);
```

These instructions are used most efficiently if they process large amounts of data in one go（一气呵成）. 

Data is loaded from memory, processed in one or more steps, and then written back to memory. 

The data “streams” through the processor, hence the names of the intrinsics（内联函数）.

## 内联函数

The memory address must be aligned to 8 or 16 bytes respectively（分别）.

In code using the multimedia extensions it is possible to replace the normal `_mm_store_*` intrinsics with these non-temporal versions. 

In the matrix multiplication code in section A.1 we do not do this since the written values are reused in a short order of time. 

This is an example where using the stream instructions is not useful. 

More on this code in section 6.2.1.

## 写组合缓冲区

The processor’s write-combining buffer can hold requests for partial writing to a cache line for only so long. 

It is generally necessary to issue all the instructions which modify a single cache line one after another so that the write-combining can actually take place. 

An example for how to do this is as follows:

```c
#include <emmintrin.h>
void setbytes(char *p, int c)
{
__m128i i = _mm_set_epi8(c, c, c, c,
c, c, c, c,
c, c, c, c,
c, c, c, c);
_mm_stream_si128((__m128i *)&p[0], i);
_mm_stream_si128((__m128i *)&p[16], i);
_mm_stream_si128((__m128i *)&p[32], i);
_mm_stream_si128((__m128i *)&p[48], i);
}
```

Assuming the pointer p is appropriately aligned（适当调整）, a call to this function will set all bytes of the addressed cache line to c. 

The write-combining logic will see the four generated `movntdq` instructions and only issue the write command for the memory once the last instruction has been executed. 

To summarize, this code sequence not only avoids reading the cache line before it is written, it also avoids polluting the cache with data which might not be needed soon. 

总而言之，这个代码序列不仅避免了在写入之前读取高速缓存行，还避免了使用可能不需要的数据来缓存高速缓存。

This can have huge benefits in certain situations.

An example of everyday code using this techniquem is the memset function in the C runtime, which should use a code sequence like the above for large blocks.

## 一些结构的专门解决方案 

Some architectures provide specialized（专门） solutions. 

The PowerPC architecture defines the `dcbz` instruction which can be used to clear an entire cache line. 

The instruction does not really bypass the cache since a cache line is allocated for the result, but no data is read from memory. 

It is more limited than the non-temporal store instructions since a cache line can only be set to all-zeros and it pollutes the cache (in case the data is non-temporal), but no write-combining logic is needed to achieve（实现） the results.

## 非时间性指令

To see the non-temporal instructions in action we will look at a new test which is used to measure writing to a matrix, organized as a two-dimensional array（二维数组）. 

The compiler lays out the matrix in memory so that the leftmost (first) index addresses the row which has all elements laid out sequentially in memory. 

The right (second) index addresses the elements in a row. 

The test program iterates over the matrix in two ways: 

first by increasing the column number in the inner loop and then by increasing the row index in the inner loop. 

This means we get the behavior shown in Figure 6.1.

- Figure 6.1

![image](https://user-images.githubusercontent.com/18375710/62992456-12b11100-be86-11e9-9609-040f88b46bd8.png)


We measure the time it takes to initialize a 3000 * 3000 matrix. 

To see how memory behaves, we use store instructions which do not use the cache. 

On IA-32 processors the “non-temporal hint” is used for this. 

For comparison we also measure ordinary store operations. 

- Table 6.1 Timing Matrix Initialization

The results can be seen in Table 6.1.

| - | Inner Loop row |  Increment Column |
| Normal | 0.048s | 0.127s |
| Non-Temporal | 0.048s | 0.160s | 

For the normal writes which do use the cache we see the expected result: 

if memory is used sequentially we get a much better result, 0.048s for the whole operation translating to about 750MB/s, compared to the more-orless random access which takes 0.127s (about 280MB/s).

The matrix is large enough that the caches are essentially ineffective（基本上无效）.

# 跳过写缓存

The part we are mainly interested in here are the writes bypassing the cache. 

It might be surprising that the sequential access is just as fast here as in the case where the cache is used. 

The reason for this result is that the processor is performing write-combining as explained above.

In addition, the memory ordering rules for non-temporal writes are relaxed: 

the program needs to explicitly（明确地） insert memory barriers (sfence instructions for the x86 and x86-64 processors). 

This means the processor has more freedom to write back the data and thereby using the available bandwidth as well as possible.

## 列式访问

In the case of column-wise access in the inner loop the situation is different. 

The results for uncached accesses are significantly（显著） slower than in the case of cached accesses (0.16s, about 225MB/s). 

Here we can see that no write combining is possible and each memory cell must be addressed individually. 

This requires constantly selecting new rows in the RAM chips with all the associated delays. 

The result is a 25% worse result than the cached run.


# 读

On the read side, processors, until recently, lacked support aside from weak hints using non-temporal access (NTA) prefetch instructions. 

除了使用非时间访问（NTA）预取指令的弱提示之外，缺乏支持

There is no equivalent to write-combining for reads, which is especially bad for uncacheable memory such as memory-mapped I/O. 

Intel, with the SSE4.1 extensions, introduced NTA loads.

They are implemented using a small number of streaming load buffers; each buffer contains a cache line. 

The first `movntdqa` instruction for a given cache line will load a cache line into a buffer, possibly replacing another cache line. 

Subsequent（随后） 16-byte aligned accesses to the same cache line will be serviced from the load buffer at little cost. 

Unless there are other reasons to do so, the cache line will not be loaded into a cache, thus enabling the loading of large amounts of memory without polluting the caches. 

除非有其他原因，否则缓存行不会加载到缓存中，因此可以加载大量内存而不会污染缓存。

## 内联函数的多次去读

The compiler provides an intrinsic（固有） for this instruction:

```c
#include <smmintrin.h>
__m128i _mm_stream_load_si128 (__m128i *p);
```

This intrinsic should be used multiple times, with addresses of 16-byte blocks passed as the parameter, until each cache line is read. 

Only then should the next cache line be started. 

Since there are a few streaming read buffers it might be possible to read from two memory locations at once.

应该多次使用此内联函数，并将16字节块的地址作为参数传递，直到读取每个高速缓存行。

只有这样才能启动下一个缓存行。

由于存在一些流式读取缓冲区，因此可以一次从两个存储器位置读取。

What we should take away from this experiment is that modern CPUs very nicely optimize uncached write and more recently even read accesses as long as they are sequential.

This knowledge can come in very handy when handling large data structures which are used only once.

## 预取对于随机访问的优化

Second, caches can help to cover up some–but not all–of the costs of random memory access. 

Random access in this example is 70% slower due to the implementation of RAM access. 

Until the implementation changes, random accesses should be avoided whenever possible.

In the section about prefetching we will again take a look at the non-temporal flag.

尽量将随机访问变为顺序访问。

# 参考资料

P49

[what-is-pessimization](https://stackoverflow.com/questions/32618848/what-is-pessimization)

* any list
{:toc}
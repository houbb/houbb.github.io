---
layout: post
title: Memory 内存知识-26-021-实战技巧之 Cache L1 指令优化
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# 优化 L1 指令 

Preparing code for good L1i use needs similar techniques as good L1d use. 

The problem is, though, that the programmer usually does not directly influence the way L1i is used unless s/he writes code in assembler（汇编）. 

If compilers are used, programmers can indirectly determine the L1i use by guiding the compiler to create a better code layout.

Code has the advantage that it is linear between jumps（跳跃之间的线性）.

In these periods the processor can prefetch memory efficiently. 

## 跳跃的原因

Jumps disturb this nice picture because

（1）the jump target might not be statically determined;

（2）and even if it is static the memory fetch might take a long time if it misses all caches.

## 问题带来的影响

These problems create stalls（停滞） in execution with a possibly severe impact on performance. 

This is why today’s processors invest heavily in branch prediction (BP). 

分支预测投入巨大的财力物力，因为这个可以极大程度的提升性能。

Highly specialized BP units try to determine the target of a jump as far ahead of the jump as possible so that the processor can initiate （发起）loading the instructions at the new location into the cache. 

They use static and dynamic rules and are increasingly good at determining patterns in execution.

Getting data into the cache as soon as possible is even more important for the instruction cache. 

As mentioned in section 3.1, instructions have to be decoded before they can be executed and, to speed this up (important on x86 and x86-64), instructions are actually cached in the decoded form（解码形式）, not in the byte/word form read from memory.

利用缓存解码的形式，来提升性能。因为计算也需要消耗时间。

## 如何达到最好的缓存效果

To achieve the best L1i use programmers should look out for at least the following aspects of code generation:

1. reduce the code footprint as much as possible. This has to be balanced with optimizations like loop unrolling and inlining.

2. code execution should be linear without bubbles.

3. aligning code when it makes sense.

# 编译器技术

We will now look at some compiler techniques available to help with optimizing programs according to these aspects.

## 优化级别

Compilers have options to enable levels of optimization; specific optimizations can also be individually enabled.

Many of the optimizations enabled at high optimization levels (-O2 and -O3 for gcc) deal with loop optimizations and function inlining. 

In general, these are good optimizations.

If the code which is optimized in these ways accounts for a significant part of the total execution time of the program, overall performance can be improved.

Inlining of functions, in particular, allows the compiler to optimize larger chunks of code at a time which, in turn, enables the generation of machine code which better exploits the processor’s pipeline architecture. 

The handling of both code and data (through dead code elimination or value range propagation, and others) works better when larger parts of the program can be considered as a single unit.

如果以这些方式优化的代码占程序总执行时间的很大一部分，则可以提高整体性能。

特别是内联函数允许编译器一次优化更大的代码块，这反过来又能够生成更好地利用处理器流水线架构的机器代码。

当程序的较大部分可以被视为单个单元时，代码和数据的处理（通过死代码消除或值范围传播等）更好地工作。

## 较大的代码块

A larger code size means higher pressure on the L1i (and also L2 and higher level) caches. 

This can lead to less performance. 

Smaller code can be faster. 

个人理解：较大的代码块，意味着对应的指令可能无法在 L1 cache 中被全部缓存。导致了性能的下降。

### GCC 优化选项

Fortunately gcc has an optimization option to specify this. 

If `-Os` is used the compiler will optimize for code size. 

Optimizations which are known to increase the code size are disabled.

Using this option often produces surprising results. 

Especially if the compiler cannot really take advantage of loop unrolling and inlining, this option is a big win.

特别是如果编译器无法真正利用循环展开和内联，这个选项是一个很大的胜利。

## 函数内联

Inlining can be controlled individually as well. 

The compiler has heuristics（启发式） and limits which guide inlining; these limits can be controlled by the programmer. 

The `-finlinelimit` option specifies how large a function must be to be considered too large for inlining. 

If a function is called in multiple places, inlining it in all of them would cause an explosion（爆炸） in the code size. 

But there is more. 

### 是否内联对比

Assume a function *inlcand* is called in two functions f1 and f2. 

The functions f1 and f2 are themselves called in sequence.

![image](https://user-images.githubusercontent.com/18375710/63315201-dcb7d500-c33c-11e9-8775-6e5e8791045c.png)

Table 6.3 shows how the generated code could look like in the cases of no inline and inlining in both functions.

If the function inlcand is inlined in both f1 and f2 the total size of the generated code is size `f1 + size f2 + 2*size` inlcand. 

If no inlining happens, the total size is smaller by size inlcand. 

This is how much more L1i and L2 cache is needed if f1 and f2 are called shortly after one another. 

Plus: if inlcand is not inlined, the code might still be in L1i and it will not have to be decoded again. 

Plus: the branch prediction unit might do a better job of predicting jumps since it has already seen the code. 

If the compiler default for the upper limit on the size of inlined functions is not the best for the program, it should be lowered.

## 需要内联的场景

There are cases, though, when inlining always makes sense. 

If a function is only called once it might as well be inlined. 

This gives the compiler the opportunity to perform more optimizations (like value range propagation, which might significantly improve the code). 

That inlining might be thwarted（受限） by the selection limits. gcc has, for cases like this, an option to specify that a function is always inlined. 

Adding the **always_inline** function attribute instructs the compiler to do exactly what the name suggests.

## 不应该被内联的场景

In the same context, if a function should never be inlined despite（尽管） being small enough, the *noinline* function attribute can be used. 

Using this attribute makes sense even for small functions if they are called often from different places. 

If the L1i content can be reused and the overall footprint is reduced this often makes up for the additional cost of the extra function call. 

Branch prediction units are pretty good these days. 

If inlining can lead to more aggressive（侵略性） optimizations things look different. 

This is something which must be decided on a case-by-case（根据实际情况而定） basis.

## 永远内联选项

The **always_inline** attribute works well if the inline code is always used. 

But what if this is not the case? 

What if the inlined function is called only occasionally（偶尔）:

```
void fct(void) {
... code block A ...
if (condition)
inlfct()
... code block C ...
}
```

The code generated for such a code sequence in general matches the structure of the sources. 

That means first comes the code block A, then a conditional jump which, if the condition evaluates to false, jumps forward. 

The code generated for the inlined *inlfct* comes next, and finally the code block C. 

This looks all reasonable but it has a problem.

### 存在的问题

If the condition is frequently false, the execution is not linear. 

There is a big chunk of unused code in the middle which not only pollutes the L1i due to prefetching, it also can cause problems with branch prediction. 

If the branch prediction is wrong the conditional expression can be very inefficient.

This is a general problem and not specific to inlining functions. 

Whenever conditional execution is used and it is lopsided (i.e., the expression far more often leads to one result than the other) there is the potential for false static branch prediction and thus bubbles in the pipeline.

This can be prevented by telling the compiler to move the less often executed code out of the main code path.

In that case the conditional branch generated for an if statement would jump to a place out of the order as can be seen in the following figure.

![image](https://user-images.githubusercontent.com/18375710/63323559-a7b97b80-c358-11e9-8c8d-c606995c554e.png)

The upper parts represents the simple code layout. 

If the area B, e.g. generated from the inlined function inlfct above, is often not executed because the conditional I jumps over it, the prefetching of the processor will pull in cache lines containing block B which are rarely used.

Using block reordering this can be changed, with a result that can be seen in the lower part of the figure. 

The often-executed code is linear in memory while the rarely executed code is moved somewhere where it does not hurt prefetching and L1i efficiency.

# GCC 的解决方案

gcc provides two methods to achieve（实现） this. 

## 解决方案

First, the compiler can take profiling（剖析） output into account while recompiling code and lay out the code blocks according to the profile. 

We will see how this works in section 7. 

The second method is through explicit branch prediction. 

gcc recognizes `__builtin_` expect:

```
long __builtin_expect(long EXP, long C);
```

This construct tells the compiler that the expression EXP most likely will have the value C. 

The return value is EXP. 

`__builtin_expect` is meant to be used in an conditional expression. 

In almost all cases will it be used in the context of boolean expressions in which case it is much more convenient to define two helper macros（宏）:

```c
#define unlikely(expr) __builtin_expect(!!(expr), 0)
#define likely(expr) __builtin_expect(!!(expr), 1)
```

These macros can then be used as in

```c
if (likely(a > 1))
```

If the programmer makes use of these macros and then uses the `-freorder-blocks` optimization option gcc will reorder blocks as in the figure above. 

This option is enabled with `-O2` but disabled for `-Os`. 

There is another gcc option to reorder block (-freorder-blocks-and-partition) but it has limited usefulness because it does not work with exception handling.

## 小循环的优势

There is another big advantage of small loops, at least on certain processors. 

The Intel Core 2 front end has a special feature called Loop Stream Detector (LSD). 

If a loop has no more than 18 instructions (none of which is a call to a subroutine), requires only up to 4 decoder fetches of 16 bytes, has at most 4 branch instructions, and is executed more than 64 times, than the loop is sometimes locked in the instruction queue and therefore more quickly available when the loop is used again. 

如果一个循环不超过18个指令（没有一个是对子程序的调用），则最多需要4个16字节的解码器提取，最多有4个分支指令，并且执行的次数比循环多64次 有时会锁定在指令队列中，因此在再次使用循环时可以更快地获得。

This applies, for instance, to small inner loops which are entered many times through an outer loop. 

Even without such specialized hardware compact loops have advantages.

例如，这适用于通过外环多次输入的小内环。

即使没有这种专用硬件，紧凑型环也具有优势

# 内联

Inlining is not the only aspect of optimization with respect to L1i. 

Another aspect is alignment, just as for data. 

两大法宝：对齐和内联。

## 区别

There are obvious differences: 

code is a mostly linear blob which cannot be placed arbitrarily（任意） in the address space and it cannot be influenced directly by the programmer as the compiler generates the code. 

There are some aspects which the programmer can control, though.

## 可行的方案

Aligning each single instruction does not make any sense.

对齐每一条指令没有任何意义。

The goal is to have the instruction stream be sequential.

目标是使指令流顺序。

So alignment only makes sense in strategic（战略） places. 

To decide where to add alignments it is necessary to understand what the advantages can be. 

Having an instruction at the beginning of a cache line means that the prefetch of the cache line is maximized. 

For instructions this also means the decoder is more effective. 

It is easy to see that, if an instruction at the end of a cache line is executed, the processor has to get ready to read a new cache line and decode the instructions. 

There are things which can go wrong (such as cache line misses), meaning that an instruction at the end of the cache line is, on average, not as effectively executed as one at the beginning.

在高速缓存行的开头具有指令意味着高速缓存行的预取被最大化。

对于指令，这也意味着解码器更有效。

很容易看出，如果执行高速缓存行末尾的指令，则处理器必须准备好读取新的高速缓存行并解码指令。

存在可能出错的事情（例如高速缓存行未命中），这意味着高速缓存行末尾的指令平均不像开头那样有效地执行。

## 代码对齐最有用的场景

Combine this with the follow-up deduction（后续扣除） that the problem is most severe if control was just transferred to the instruction in question (and hence prefetching is not effective) and we arrive at our final conclusion where alignment of code is most useful:

（1）at the beginning of functions;

（2）at the beginning of basic blocks which are reached only through jumps;

（3）to some extent（程度）, at the beginning of loops.

### 前两种场景

In the first two cases the alignment comes at little cost.

Execution proceeds at a new location and, if we choose it to be at the beginning of a cache line, we optimize prefetching and decoding.

The compiler accomplishes this alignment through the insertion of a series of no-op instructions to fill the gap created by aligning the code.

This “dead code” takes a little space but does not normally hurt performance.

在前两种情况下，对齐成本很低。

执行在新位置进行，如果我们选择它在缓存行的开头，我们会优化预取和解码。

编译器通过插入一系列无操作指令来完成此对齐，以填补通过对齐代码创建的间隙。

这个“死代码”需要一点空间，但通常不会影响性能。

### 第三种场景

The third case is slightly different: aligning the beginning of each loop might create performance problems.

The problem is that beginning of a loop often follows other code sequentially. 

If the circumstances（情况） are not very lucky there will be a gap between the previous instruction and the aligned beginning of the loop. 

Unlike in the previous two cases, this gap cannot be completely dead.

After execution of the previous instruction the first instruction in the loop must be executed. 

This means that, following the previous instruction, there either must be a number of no-op instructions to fill the gap or there must
be an unconditional jump to the beginning of the loop.

Neither possibility is free. 

Especially if the loop itself is not executed often, the no-ops or the jump might cost more than one saves by aligning the loop.

# 开发影响对齐的几种方式

There are three ways the programmer can influence the alignment of code. 

Obviously, if the code is written in assembler the function and all instructions in it can be explicitly aligned. 

The assembler provides for all architectures the `.align` pseudo-op to do that. 

## 高级语言如何影响

此处指非汇编语言，只能通过指定编译器的选项来影响。

For high-level languages the compiler must be told about alignment requirements.

Unlike for data types and variables this is not possible in the source code. 

Instead a compiler option is used:

```
-falign-functions=N
```

## 指定不进行对齐

This option instructs the compiler to align all functions to the next power-of-two boundary greater than N. 

That means a gap of up to N bytes is created. 

此选项指示编译器将所有函数与大于N的下一个二次幂边界对齐。

这意味着创建了最多N个字节的间隙。

For small functions using a large value for N is a waste. 

Equally for code which is executed only rarely. 

The latter can happen a lot in libraries which can contain both popular and not-so-popular interfaces. 

A wise choice of the option value can speed things up or save memory by avoiding alignment. 

All alignment is turned off by using one as the value of N or by using the `-fno-align-functions` option.

- 优点

节约内存，加快速度。

## 不同的选项控制

The alignment for the second case above–beginning of basic blocks which are not reached sequentially–can be controlled with a different option:

第二种情况的对齐方式可以通过不同的选项控制第二种情况，即基本块的开头不是顺序到达的：

```
-falign-jumps=N
```

All the other details are equivalent（相同）, the same warning about waste of memory applies.

The third case also has its own option: 

```
-falign-loops=N
```

Yet again, the same details and warnings apply. 

Except that here, as explained before, alignment comes at a runtime cost since either no-ops or a jump instruction has to be executed if the aligned address is reached sequentially.

除此之外，如前所述，对齐以运行时成本出现，因为如果按顺序到达对齐的地址，则必须执行无操作或跳转指令。

gcc knows about one more option for controlling alignment which is mentioned here only for completeness.

## label 对齐

`-falign-labels` aligns every single label in the code (basically the beginning of each basic block). 

This, in all but a few exceptional cases, slows down the code and therefore should not be used.

`-falign-labels` 对齐代码中的每个标签（基本上是每个基本块的开头）。

除了少数例外情况之外，这会减慢代码速度，因此不应使用。

# 参考资料

P58

* any list
{:toc}
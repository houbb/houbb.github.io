---
layout: post
title: Memory 内存知识-28-多线程优化之原子性
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, sh]
published: true
---

# Atomicity Optimizations

If multiple threads modify the same memory location concurrently, processors do not guarantee any specific result（处理器不保证任何特定结果）. 

This is a deliberate（商榷） decision made to avoid costs which are unnecessary in 99.999% of all cases. 

## 实际例子

For instance, if a memory location is in the ‘S’ state and two threads concurrently have to increment its value, the execution
pipeline does not have to wait for the cache line to be available in the ‘E’ state before reading the old value from the cache to perform the addition. 

Instead it reads the value currently in the cache and, once the cache line is available in state ‘E’, the new value is written back.

The result is not as expected if the two cache reads in the two threads happen simultaneously（同时）; one addition will be lost.

其实就是我们常说的并发安全问题。

# 处理器提供的原子操作

For situations where concurrent operations can happen, processors provide atomic operations. 

These atomic operations would, for instance, not read the old value until it is clear that the addition could be performed in a way that the addition to the memory location appears as atomic. 

例如，这些原子操作不会读取旧值，直到很明显可以以对存储器位置的添加显示为原子的方式执行添加。

In addition to waiting for other cores and processors, some processors even signal atomic operations for specific addresses to other devices on the motherboard.

除了等待其他内核和处理器之外，一些处理器甚至会将特定地址的原子操作发送到主板上的其他设备。

All this makes atomic operations slower.

# 处理器供应商的不同策略

Processor vendors decided to provide different sets of atomic operations. 

Early RISC processors, in line with the ‘R’ for reduced, provided very few atomic operations, sometimes only an atomic bit set and test.

At the other end of the spectrum（系列）, we have x86 and x86-64 which provide a large number of atomic operations. 

The generally available atomic operations can be categorized in four classes:

## Bit Test

These operations set or clear a bit atomically and return a status indicating whether the bit was set before or not.

## Load Lock/Store Conditional (LL/SC)

The LL/SC operations work as a pair where the special load instruction is used to start an transaction and the final store will only succeed if the location has not been modified in the meantime（与此同时）. 

The store operation indicates success or failure, so the program can repeat its efforts if necessary.

## Compare-and-Swap (CAS) 

This is a ternary operation（三元操作） which writes a value provided as a parameter into an address (the second parameter) only if the current value is the same as the third parameter value;

## Atomic Arithmetic 

These operations are only available on x86 and x86-64, which can perform arithmetic and logic operations on memory locations. 

These processors have support for non-atomic versions of these operations but RISC architectures do not. 

So it is no wonder that their availability is limited.

# 架构支持

An architecture supports either the LL/SC or the CAS instruction, not both. 

Both approaches are basically equivalent（基本相同）; they allow the implementation of atomic arithmetic operations equally well, but CAS seems to be the preferred method these days. 

All other operations can be indirectly implemented using it. 

## 原子加法

For instance, an atomic addition:

### CAS 版本

```c
int curval;
int newval;
do {
curval = var;
newval = curval + addend;
} while (CAS(&var, curval, newval));
```

The result of the CAS call indicates whether the operation succeeded or not. 

If it returns failure (non-zero value), the loop is run again, the addition is performed, and the CAS call is tried again. 

This repeats until it is successful. 

Noteworthy about the code is that the address of the memory location has to be computed in two separate instructions.

### LL/SC

For LL/SC the code looks about the same:

```c
int curval;
int newval;
do {
curval = LL(var);
newval = curval + addend;
} while (SC(var, newval));
```

Here we have to use a special load instruction (LL) and we do not have to pass the current value of the memory location to SC since the processor knows if the memory location has been modified in the meantime.

## x86 的不同

The big differentiators are x86 and x86-64, where we have the atomic operations and, here, it is important to select the proper atomic operation to achieve the best result.

Figure 6.12 shows three different ways to implement an atomic increment operation. 

All three produce different code on x86 and x86-64 while the code might be identical on other architectures. 

There are huge performance differences. 

## 不同实现方式的对比

The following table shows the execution time for 1 million increments by four concurrent threads. 

The code uses the built-in primitives of gcc `(__sync_*)`.

| Exchange Add |  Add Fetch | CAS | 
| 0.23s |  0.21s | 0.73s | 

the old value is a little bit faster. 

The important piece of information is the highlighted field, the cost when using CAS. 

It is, unsurprisingly, a lot more expensive. 

### CAS 耗时较多的原因

There are several reasons for this: 

1. there are two memory operations,

2. the CAS operation by itself is more complicated and requires even conditional operation, and 

3. the whole operation has to be done in a loop in case two concurrent accesses cause a CAS call to fail.

## 为什么有人会使用使用CAS的复杂而长的代码？

Now a reader might ask a question: 

why would somebody use the complicated and longer code which utilizes CAS? 

The answer to this is: the complexity is usually hidden. 

**复杂性通常是隐藏的。**

As mentioned before, CAS is currently the unifying atomic operation across all interesting architectures.

So some people think it is sufficient to define all atomic operations in terms of CAS. 

This makes programs simpler. 

But as the numbers show, the results can be everything but optimal（最佳）. 

The memory handling overhead of the CAS solution is huge. 

## 双线程执行耗时

The following illustrates the execution of just two threads, each on its own core.

![image](https://user-images.githubusercontent.com/18375710/63671899-3cb5ec00-c813-11e9-9c60-10c552538d8d.png)

We see that, within this short period of execution, the cache line status changes at least three times; 

two of the changes are RFOs. 

Additionally, the second CAS will fail, so that thread has to repeat the whole operation. 

During that operation the same can happen again.

## 对于数学运算的处理

In contrast（相反）, when the atomic arithmetic operations are used, the processor can keep the load and store operations needed to perform the addition (or whatever) together.

It can ensure that concurrently-issued cache line requests are blocked until the atomic operation is done.

相反，当使用原子算术运算时，处理器可以保持执行加法（或其他）所需的加载和存储操作。

它可以确保在原子操作完成之前阻止并发的高速缓存行请求。

Each loop iteration in the example therefore results in, at most, one RFO cache request and nothing else.

What all this means is that it is crucial to define the machine abstraction at a level at which atomic arithmetic and logic operations can be utilized. 

CAS should not be universally used as the unification mechanism.

因此，该示例中的每个循环迭代最多导致一个RFO高速缓存请求而不产生任何其他。

所有这一切意味着，在可以利用原子算术和逻辑运算的水平上定义机器抽象至关重要。

CAS不应被普遍用作统一机制。

# 处理器现状

## 原子操作永远原子性

For most processors, the atomic operations are, by themselves, always atomic. 

One can avoid them only by providing completely separate code paths for the case when atomicity is not needed. 

This means more code, a conditional, and further jumps to direct execution appropriately（并进一步跳转到适当的直接执行）.

## x86 系列

For x86 and x86-64 the situation is different: 

the same instructions can be used in both atomic and non-atomic ways. 

相同的指令可以同时在 atomic 和 non-aotimc 模式下使用。

### Lock Prefix 

To make them atomic, a special prefix for the instruction is used: the lock prefix. 

This opens the door for atomic operations to avoid the high costs if the atomicity requirement in a given situation is not needed. 

Code in libraries, for example, which always has to be threadsafe if needed, can benefit from this. 

No information is needed when writing the code, the decision can be made at runtime. 

The trick is to jump over the lock prefix. 

This trick applies to all the instructions which the x86 and x86-64 processor allow to prefix with lock.

```
cmpl $0, multiple_threads
je 1f
lock1: add $1, some_var
```

### 代码解释

If this assembler code appears cryptic（神秘）, do not worry, it is simple. 

The first instruction checks whether a variable is zero or not. 

Nonzero in this case indicates that more than one thread is running. 

If the value is zero, the second instruction jumps to label 1.

Otherwise, the next instruction is executed. 

This is the tricky part. 

If the je instruction does not jump, the add instruction is executed with the lock prefix. 

Otherwise it is executed without the lock prefix.

ps: 类似于加了一个判断，当前指令是否超过一个线程在执行。

然后根据是否多个线程执行，来决定是否添加 lock 前缀。

# 条件跳跃

Adding a potentially（可能） expensive operation like a conditional jump (expensive in case the branch prediction is wrong) seems to be counter productive. 

Indeed it can be:

if multiple threads are running most of the time, the performance is further decreased, especially if the branch prediction is not correct. 

But if there are many situations where only one thread is in use, the code is significantly faster. 

The alternative of using an if-then-else construct introduces an additional unconditional jump in both cases which can be slower. 

Given that an atomic operation costs on the order of 200 cycles, the crossover point for using the trick (or the if-then-else block) is pretty low. 

This is definitely a technique to be kept in mind. 

如果多个线程在大多数时间运行，则性能会进一步降低，尤其是在分支预测不正确的情况下。

但是，**如果有许多情况只使用一个线程，则代码明显更快。**

使用if-then-else结构的替代方案在两种情况下引入了额外的无条件跳转，这可能更慢。

鉴于原子操作成本大约为200个周期，使用技巧（或if-then-else块）的交叉点非常低。

这绝对是一种需要牢记的技巧。

Unfortunately this means gcc’s `__sync_*` primitives cannot be used.


# 参考资料

P68

* any list
{:toc}
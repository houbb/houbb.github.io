---
layout: post
title: Memory 内存知识-35-新技术 DCAS
date:  2019-5-10 11:08:59 +0800
categories: [Memory]
tags: [memory, cache, lock-free, sh]
published: true
---

# Upcoming Technology

In the preceding sections about multi-processor handling we have seen that significant performance problems must be expected if the number of CPUs or cores is scaled up.

But this scaling-up is exactly what has to be expected in the future. 

Processors will get more and more cores, and programs must be ever more parallel to take advantage of the increased potential of the CPU, since single-core performance will not rise as quickly as it used to.

# The Problem with Atomic Operations

Synchronizing access to shared data structures is traditionally done in two ways:

（1） through mutual exclusion, usually by using functionality of the system runtime to achieve just that;

（2） by using lock-free data structures.

The problem with lock-free data structures is that the processor has to provide primitives which can perform the entire operation atomically. 

This support is limited. 

On most architectures support is limited to atomically read and write a word. 

在大多数架构上，支持仅限于原子读取和写入一个单词。

There are two basic ways to implement this (see section 6.4.2):

## 实现原子性的操作

- using atomic compare-and-exchange (CAS) operations;

- using a load lock/store conditional (LL/SC) pair.

It can be easily seen how a CAS operation can be implemented using LL/SC instructions. 

This makes CAS operations the building block for most atomic operations and lock free data structures.

# 一些处理器

Some processors, notably the x86 and x86-64 architectures, provide a far more elaborate set of atomic operations.

Many of them are optimizations of the CAS operation for specific purposes. 

For instance, atomically adding a value to a memory location can be implemented using CAS and LL/SC operations, but the native support for atomic increments on x86/x86-64 processors is faster.

例如，可以使用CAS和LL / SC操作以原子方式将值添加到内存位置，但x86 / x86-64处理器上原子增量的本机支持更快。

It is important for programmers to know about these operations, and the intrinsics which make them available when programming, but that is nothing new.


## DCAS

The extraordinary extension（非凡的延伸） of these two architectures is that they have double-word CAS (DCAS) operations.

This is significant for some applications but not all. 

# 一个无锁 LIFO 的数据结构例子

As an example of how DCAS can be used, let us try to write a lock-free array-based stack/LIFO data structure.

作为DCAS如何使用的一个例子，让我们尝试编写一个无锁的基于阵列的堆栈/ LIFO数据结构。

## 线程不安全的

A first attempt using gcc’s intrinsics can be seen in Figure 8.1.

-  Figure 8.1.

非线程安全的 LIFO 实现。

```c
struct elem {
  data_t d;
  struct elem *c;
};

struct elem *top;
  void push(struct elem *n) {
  n->c = top;
  top = n;
}

struct elem *pop(void) {
  struct elem *res = top;
  if (res != NULL)
  top = res->c;
  return res;
}
```

This code is clearly not thread-safe. 

Concurrent accesses in different threads will modify the global variable top without consideration of other threads’s modifications.

Elements could be lost or removed elements can magically reappear. 

It is possible to use mutual exclusion（互斥锁） but here we will try to use only atomic operations.


## 修复问题-CAS 方式

The first attempt to fix the problem uses CAS operations when installing or removing list elements. 

The resulting code looks like Figure 8.2.

```c
#define CAS __sync_bool_compare_and_swap

struct elem {
  data_t d;
  struct elem *c;
};

struct elem *top;

void push(struct elem *n) {
  do
    n->c = top;
  while (!CAS(&top, n->c, n));
}

struct elem *pop(void) {
  struct elem *res;
  while ((res = top) != NULL)
    if (CAS(&top, res, res->c))
      break;
  return res;
}
```

At first glance this looks like a working solution. 

top is never modified unless it matches the element which was at the top of the LIFO when the operation started. 

### 依然存在的问题-ABA 问题

But we have to take concurrency at all levels into account. 

It might be that another thread working on the data structure is scheduled at the worst possible moment. 

One such case here is the so-called ABA problem. 

Consider what happens if a second thread is scheduled right before the CAS operation in pop and it performs the following operation:

1. l = pop()

2. push(newelem)

3. push(l)

The end effect of this operation is that the former top element of the LIFO is back at the top but the second element is different. 

Back in the first thread, because the top element is unchanged, the CAS operation will succeed. 

But the value res->c is not the right one. 

It is a pointer to the second element of the original LIFO and not newelem. 

The result is that this new element is lost.

## 解决这个问题-DCAS

In the literature  you find suggestions to use a feature found on some processors to work around this problem.

Specifically, this is about the ability of the x86 and x86-64 processors to perform DCAS operations. 

This is used in the third incarnation of the code in Figure 8.3.

```c
#define CAS __sync_bool_compare_and_swap

struct elem {
  data_t d;
  struct elem *c;
};

struct lifo {
  struct elem *top;
  size_t gen;
} l;

void push(struct elem *n) {
  struct lifo old, new;
  do {
    old = l;
    new.top = n->c = old.top;
    new.gen = old.gen + 1;
  } while (!CAS(&l, old, new));
}

struct elem *pop(void) {
  struct lifo old, new;
  do {
    old = l;
    if (old.top == NULL) return NULL;
      new.top = old.top->c;
      new.gen = old.gen + 1;
} while (!CAS(&l, old, new));
  return old.top;
}
```

Unlike the other two examples, this is (currently) pseudocode（伪代码） since gcc does not grok the use of structures in the CAS intrinsics（内联函数）. 

Regardless, the example should be sufficient understand the approach. 

A generation counter is added to the pointer to the top of the LIFO. 

Since it is changed on every operation, push or pop, the ABA problem described above is no longer a problem. 

By the time the first thread is resuming its work by actually exchanging the top pointer, the generation counter has been incremented three times. 

The CAS operation will fail and, in the next round of the loop, the correct first and second element of the LIFO are determined and the LIFO is not corrupted. 

ps：其实这里就是使用了 CAS+版本号的方式。


## DCAS 真的解决问题了吗？

Is this really the solution? 

The authors of certainly make it sound like it and, to their credit, it should be mentioned that it is possible to construct data structures for the LIFO which would permit using the code above. 

But, in general, this approach is just as doomed（注定） as the previous one. 

We still have concurrency problems, just now in a different place. 

# 其他存在问题的场景

Let us assume a thread executes pop and is interrupted after the test for `old.top == NULL`.

Now a second thread uses pop and receives ownership of the previous first element of the LIFO. 

It can do anything with it, including changing all values or, in case of dynamically allocated elements, freeing the memory.

Now the first thread resumes. The old variable is still filled with the previous top of the LIFO. 

More specifically, the top member points to the element popped by the second thread. 

更具体地说，顶部成员指向由第二个线程弹出的元素。

In `new.top = old.top->c` the first thread dereferences a pointer in the element. 

But the element this pointer references might have been freed. 

That part of the address space might be inaccessible and the process could crash. 

This cannot be allowed for a generic data type implementation. 

## 解决这种方式很昂贵

Any fix for this problem is terribly expensive: 

memory must never be freed, or at least it must be verified that no thread is referencing the memory anymore before it is freed. 

Given that lock-free data structures are supposed to be faster and more concurrent, these additional requirements completely destroy any advantage.

In languages which support it, memory handling through garbage collection can solve the problem, but this comes with its price.

解决这个问题的任何方法都非常昂贵：

永远不能释放内存，或者至少必须验证在释放之前没有线程再引用内存。

鉴于无锁数据结构应该更快，更并发，这些额外的要求完全破坏了任何优势。

在支持它的语言中，通过垃圾收集进行内存处理可以解决问题，但这需要它的价格。

## 更糟糕的情况

The situation is often worse for more complex data structures.

The same paper cited above also describes a FIFO implementation (with refinements in a successor paper).

But this code has all the same problems. 

Because CAS operations on existing hardware (x86, x86-64)47 are limited to modifying two words which are consecutive（连续） in memory, they are no help at all in other common situations.

For instance, atomically adding or removing elements anywhere in a double-linked list is not possible.

因为现有硬件（x86，x86-64）47上的**CAS操作仅限于修改内存中连续的两个单词，所以在其他常见情况下它们根本没有帮助**。

例如，不可能在双链表中的任何地方原子地添加或删除元素。

The problem is that more than one memory address is generally involved, and only if none of the values of these addresses is changed concurrently can the entire operation succeed. 

This is a well-known concept in database handling, and this is exactly where one of the most promising proposals to solve the dilemma comes from.

问题是通常涉及多个存储器地址，并且只有当这些地址的值中没有一个同时改变时，整个操作才能成功。

这是数据库处理中众所周知的概念，而这恰恰是解决这一难题的最有希望的提案之一。

# 参考资料

P91

* any list
{:toc}
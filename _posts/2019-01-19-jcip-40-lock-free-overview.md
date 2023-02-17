---
layout: post
title:  JCIP-40-Lock Free 无锁算法
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock-free, sh]
published: true
---

# Lock-Free 编程是什么？

当谈及 Lock-Free 编程时，我们常将其概念与 Mutex 或 Lock 联系在一起，描述要在编程中尽量少使用这些锁结构，降低线程间互相阻塞的机会，以提高应用程序的性能。

类同的概念还有 "Lockless" 和 "Non-Blocking" 等。

实际上，这样的描述只涵盖了 Lock-Free 编程的一部分内容。本质上说，Lock-Free 编程仅描述了代码所表述的性质，而没有限定或要求代码该如何编写。

基本上，如果程序中的某一部分符合下面的条件判定描述，则我们称这部分程序是符合 Lock-Free 的。反过来说，如果某一部分程序不符合下面的条件描述，则称这部分程序是不符合 Lock-Free 的。

![lock-free](https://images0.cnblogs.com/blog/175043/201410/231017024496623.png)

从这个意义上来说，Lock-Free 中的 "Lock" 并没有直接涉及 Mutex 或 Lock 等互斥量结构，而是描述了应用程序因某种原因被锁定的可能性，例如可能因为死锁（DeadLock）、活锁（LiveLock）或线程调度（Thread Scheduling）导致优先级被抢占等。

Lock-Free 编程的一个重要效果就是，**在一系列访问 Lock-Free 操作的线程中，如果某一个线程被挂起，那么其绝对不会阻止其他线程继续运行（Non-Blocking）。**

下面的这段简单的程序片段中，没有使用任何互斥量结构，但却不符合 Lock-Free 的性质要求。如果用两个线程同时执行这段代码，在线程以某种特定的调度方式运行时，非常有可能两个线程同时陷入死循环，也就是互相阻塞了对方。

```c
while (x == 0)
{
    x = 1 - x;
}
```

所以说，Lock-Free 编程所带来的挑战不仅来自于其任务本身的复杂性，还要始终着眼于对事物本质的洞察。

通常，应该没有人会期待一个大型的应用程序中全部采用 Lock-Free 技术，而都是在有特定需求的类的设计上采用 Lock-Free 技术。

例如，如果需要一个 Stack 类应对多线程并发访问的场景，可以使用 Lock-Free 相关技术实现 ConcurrentStack 类，在其 Push 和 Pop 操作中进行具体的实现。

所以，在使用 Lock-Free 技术前，需要预先考虑一些软件工程方面的成本：

Lock-Free 技术很容易被错误的使用，代码后期的维护中也不容易意识到，所以非常容易引入 Bug，而且这样的 Bug 还非常难定位。

Lock-Free 技术的细节上依赖于内存系统模型、编译器优化、CPU架构等，而这在使用 Lock 机制时是不相关的，所以也增加了理解和维护的难度。

# Lock-Free 编程技术

当我们准备要满足 Lock-Free 编程中的非阻塞条件时，有一系列的技术和方法可供使用，如原子操作（Atomic Operations）、内存栅栏（Memory Barrier）、避免 ABA 问题（Avoiding ABA Problem）等。

那么我们该如何抉择在何时使用哪种技术呢？

可以根据下图中的引导来判断。

![lock-free-choose](https://images0.cnblogs.com/blog/175043/201410/231028206521362.png)


# Lock-Free 的优缺点

## 优点

相比于传统的基于 Mutex 锁机制, Lock-Free 有下面的优势:

Lock-Free 的速度更快

线程之间不会相互影响, 没有死锁

不受异步信号影响, 可重入

不会发生线程优先级反转

在通常使用 Mutex 互斥锁的场景, 有的线程抢占了锁, 其他线程则会被阻塞, 当获得锁的进程挂掉之后, 整个程序就 block 住了. 但在 Lock-Free 的程序中, 单个线程挂掉, 也不会影响其他线程, 因为线程之间不会相互影响.

## 缺陷

但是, Lock-Free 也有不少缺陷:

只能利用有限的原子操作, 例如 CAS (操作的位数有限), 编码实现复杂

竞争会加剧, 优先级不好控制

测试时需要考虑各种软硬件环境, 很难做到尽善尽美

# 演进条件

我们先将演进条件分为四个主要类别，阻塞（blocking），无干扰（obstruction-free），无锁（lock-free），和无等待（wait-free）。

详细列表如下：

```
Blocking

1. Blocking

2. Starvation-Free

Obstruction-Free

3. Obstruction-Free

Lock-Free

4. Lock-Free (LF)

Wait-Free

5. Wait-Free (WF)

6. Wait-Free Bounded (WFB)

7. Wait-Free Population Oblivious (WFPO)
```

## 1. 阻塞

阻塞是大家所熟知的。基本所有加锁的算法都可以说是阻塞的。某个线程所引起的意外延迟会阻止其他线程继续运行。

在最坏的情况下，某个占有锁的线程可能被睡眠，从而阻止其他等待锁释放的线程进行接下来的任何操作。

### 定义

一个方法被称为阻塞的，即这个方法在其演进过程中不能正常运行直到其他（占有锁的）线程释放。

### 例子

循环中对拥有两个状态的变量的简单CAS操作

```java
AtomicInteger lock = new AtomicInteger(0);

public void funcBlocking() {

    while (!lock.compareAndSet(0, 1)) {
        hread.yield();
    }
}
```

## 2. 无饥饿

（无饥饿）有的时候也被称为无闭锁。

这是一个独立的性质，只有当底层平台/系统提供了明确的保障以后讨论这个性质才有意义。

### 定义：

只要有一个线程在互斥区中，那么一些希望进入互斥区域的线程最终都能够进入互斥区域（即使之前在互斥区中的线程意外停止了）。

### 例子

一个严格公平的互斥锁通常是无饥饿的。

在JDK 8中的StampedLock有这样的性质，因为它创建了一个线程队列（链表）等待获取锁。

这个队列的插入操作是无锁的，但是在插入之后，每个线程都会自旋或者让步从而被当前占有锁的线程锁阻塞。

释放锁的线程采用unsafe.park()/unpark()机制，够唤醒下一个在队列中等待的线程，从而执行了严格的优先级。

这个机制的意义是，如果给予其他线程（占有锁的线程）足够的时间去完成他们的操作，那么当前线程可以确保最终获取锁，然后完成自己的操作。

[StampedLock](http://grepcode.com/file/repo1.maven.org$maven2@org.elasticsearch$elasticsearch@0.90.0.Beta1@jsr166e$StampedLock.java)

## 3. 无干扰

这是一个非阻塞性质。

关于无干扰和无饥饿的更多细节可以查看《The Art of Multiprocessor Programming》(revised edition)的第60页。

### 定义：

如果一个方法满足无干扰性质，那么这个方法从任意一点开始它的执行都是隔离的，并且能够在有限步内完成。

### 例子：

我所知道的唯一例子就是Maurice Herlihy，Mark Moir和Victor Luchangco所提出的Double-ended Queue。

[Double-ended Queue](http://cs.brown.edu/~mph/HerlihyLM03/main.pdf)

## 4. 无锁

无锁的性质保证了至少有一个线程在正常运行。

在理论上这代表了一个方法可能需要无限的操作才能完成，但是在实践中只需要消耗很短的时间，否则这个性质就没有什么价值了。

### 定义：

如果一个方法是lock-free的，它保证线程无限次调用这个方法都能够在有限步内完成。

### 例子：

一个调用CAS操作的循环增加原子整形变量。

```java
AtomicInteger atomicVar = new AtomicInteger(0);

public void funcLockFree() {

    int localVar = atomicVar.get();

    while (!atomicVar.compareAndSet(localVar, localVar+1)) {
        localVar = atomicVar.get();
    }
}
```

另外一个比较著名的例子是java.util.concurrent中的ConcurrentLinkedQueue，其中add()和remove()操作是无锁的。

## 5. 无等待

无等待性质保证了任何一个时间片内的线程可以运行，并且最后完成。

这个性质保证步骤是有限的，但是在实践中，这个数字可能是极大的，并且依赖活动的线程数目，因此目前没有很多实用的无等待数据结构。

### 定义：

假如一个方法是无等待的，那么它保证了每一次调用都可以在有限的步骤内结束。

### 例子：

这篇论文给出了一个无等待（有界无等待）算法的例子。

http://www.cs.technion.ac.il/~moran/r/PS/bm94.ps


## 6. 有界无等待

任何一个有界无等待的算法，也是无等待的（但并不一定是集居数无关无等待的）。

### 定义：

如果一个方法是有界无等待的，那么这个方法保证每次调用都能够在有限，并且有界的步骤内完成。这个界限可能依赖于线程的数量。

### 例子：

一个扫描/写入到长度和线程数目相关的数组的方法。

如果数组中每个条目的操作数是常量，那么显然这个方法是有界无等待的，并且不是集居数无关无等待，因为数组的长度和线程的数目有关。

```java
AtomicIntegerArray intArray = new AtomicIntegerArray(MAX_THREADS);

public void funcWaitFreeBounded() {

    for (int i = 0; i < MAX_THREADS ; i++) {
        intArray.set(i, 1);
    }

}
```

## 7. 集居数无关无等待

这个性质用来描述这些在一定数量步骤内完成一些指令，并且指令数目与活动线程数目无关的方法。任何一个集居数无关无等待的方法都是有界无等待的。

### 定义：

一个无等待的方法，如果其性能和活动线程数目无关，那么被称为集居数无关无等待的。

### 例子：

最简单的例子是使用fetch-and-add原语(在X86 CPU上是XADD指令)增加一个原子变量。

这个操作可以用C11/C++11中的fetch_add()原子方法完成。

```c
atomic counter;

void funcWaitFreeBoundedPopulationOblivious() {
    counter.fetch_add(1);
}
```

## 结论

上述的这些并不是问题的全部。我们忽略了两个了解全貌需要掌握的知识点：

第一点，如果你的方法需要分配内存，那么这个方法可以提供的演进保证在实际中受到内存分配机制的演进条件所限制。我认为，我们需要针对方法是否需要分配内存进行不同的分类。你可以在这篇文章中了解更多的细节，但是基本的思想是创造一个集居数无关无等待的，并且一直需要用阻塞机制分配内存的方法没有太大的意义。

第二点，关于演进条件的完整概念是用于将算法和方法按照时间保证分类，但是这些定义却是基于操作数目。这基于一个操作的完成时间与活动线程数目无关这个假设的，这些假设在单线程代码中是正确的，但是在多线程程序中将会失效。

CPU缓存一致性的工作机制，将会导致多线程/多核访问（原子）变量的竞争，从而使得一个操作/指令在一定情况下（因为cache-miss）需要相对更长的时间才能完成。

如果你不相信我的话，可以看一看这篇文章，这就是为什么许多wait-free数据结构的实现要比lock-free的相同数据结构更慢的主要的原因（或者说主要原因之一），尽管他们对执行的操作总次数有更强的保证，每一个操作因为竞争的因素却可能要用很长的时间去完成……还可能是他们平均执行的操作次数更多。

# 拓展阅读

- 数据结构

lock-free data

- wiki 并发概念

non-blocking althgorithm

read-copy-update

Seqlock

- java

[java 顺序一致性模型](https://houbb.github.io/2018/07/29/jmm-06-happens-before)

[CAS](https://houbb.github.io/2018/07/24/java-concurrency-06-cas)

[StampedLock](https://houbb.github.io/2019/01/18/jcip-37-stamped-lock)

- 开源框架

[Disruptor](https://houbb.github.io/2018/07/02/disruptor-01-introduction)

# 搜索关键词

lock-free data struct


# 个人收获

- 拓宽自己的知识维度

比起深入学习，拓宽自己的知识维度非常重要。

如果你知道多线程，那么就会知道锁，知道锁，就会知道无锁。

知识的学习网络就是这样的过程。

- 自己看一手资料

很多知识，都是比人从国外的网站  copy 过来的。自己多看看国外网站。

## 个人实践

写一个框架 lock-free，里面提供各种无锁的数据结构实现。

## 思想

个人觉得这是一种思想。

比如 copyOnWriteList，就是一种思想。你可以根据这种思想实现很多类似的数据结构。

CAS 也是一种无锁的思想，你可以根据这个思想实现类似的原子类。

# 参考资料

- Wiki

[Non-blocking algorithm](https://en.wikipedia.org/wiki/Non-blocking_algorithm)

[Fetch-and-add](https://en.wikipedia.org/wiki/Fetch-and-add)

[Test-and-set](https://en.wikipedia.org/wiki/Test-and-set)

[Double_compare-and-swap](https://en.wikipedia.org/wiki/Double_compare-and-swap)

[Test_and_test-and-set](https://en.wikipedia.org/wiki/Test_and_test-and-set)

[Lock-Free 堆栈](https://en.wikipedia.org/wiki/Hazard_pointer)

- Tutorials

[Non-blocking Algorithms](http://tutorials.jenkov.com/java-concurrency/non-blocking-algorithms.html)

[an-introduction-to-lock-free-programming](https://preshing.com/20120612/an-introduction-to-lock-free-programming/)

[NonBlocking HashTable Source Code](http://cliffc.org/blog/2007/04/23/nonblocking-hashtable-source-code/)

[writing-lock-free-code-a-corrected-queue](http://www.drdobbs.com/parallel/writing-lock-free-code-a-corrected-queue/210604448?pgno=1)

[Yet-another-implementation-of-a-lock-free-circular](http://www.codeproject.com/Articles/153898/Yet-another-implementation-of-a-lock-free-circular)

[设计不使用互斥锁的并发数据结构](https://www.ibm.com/developerworks/cn/aix/library/au-multithreaded_structures2/index.html)

[boost 无锁队列算法](https://www.boost.org/doc/libs/1_55_0/boost/lockfree/queue.hpp)

- Paper

[《Implementing Lock-Free Queues](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.53.8674&rep=rep1&type=pdf)

[Lock-Free Data Structures](http://erdani.com/publications/cuj-2004-10.pdf)

[Lock-Free Data Structures with Hazard Pointers](http://www.drdobbs.com/lock-free-data-structures-with-hazard-po/184401890)

- Books

[The-Multiprocessor-Programming-Revised-Reprint](https://www.amazon.com/The-Multiprocessor-Programming-Revised-Reprint/dp/0123973376)

- Blog

[Lock-Free 编程](https://www.cnblogs.com/gaochundong/p/lock_free_programming.html)

[Lock-Free 学习总结](https://cloud.tencent.com/developer/article/1174721)

[无锁队列的实现](https://coolshell.cn/articles/8239.html)

[并发编程网-无锁编程](http://ifeve.com/tag/lock-free/)

[无锁和无等待的定义和例子](http://ifeve.com/lock-free-and-wait-free/)

[LockFree思想](https://blog.csdn.net/baichoufei90/article/details/84930393)

[lockFreeQueue 无锁队列实现与总结](https://www.cnblogs.com/scaugsh/p/10074297.html)

[LockFreeHashMap:无阻塞代码技巧](http://ifeve.com/lockfreehashmap/)

[LockFreeVector](https://blog.csdn.net/netcobol/article/details/79785651)

[[LockFree之美] 使用Hazard Version实现的无锁Stack与Queue](http://oceanbase.org.cn/?p=183)

[《C++0x漫谈》系列之：多线程内存模型](https://www.boost.org/doc/libs/1_55_0/boost/lockfree/queue.hpp)

* any list
{:toc}
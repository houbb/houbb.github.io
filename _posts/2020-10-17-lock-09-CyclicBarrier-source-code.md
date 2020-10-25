---
layout: post
title:  锁专题（9） CyclicBarrier 栅栏源码深度解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

# 栅栏（Barrier）

## 简介

栅栏（Barrier）类似于闭锁，它能阻塞一组线程直到某个事件发生。

闭锁是一次性对象，一旦进入最终状态，就不能被重置了。

栅栏与闭锁的关键区别在于，所有线程必须同时达到栅栏位置，才能继续执行。

**闭锁用于等待事件，而栅栏用于等待其他线程**。

而我再等你点赞。

[java 手写并发框架（一）异步查询转同步的7种实现方式](https://www.toutiao.com/item/6881613033299247619/) 我就用到了 CyclicBarrier 作为其中的实现方式之一，感兴趣的小伙伴可以去看看。

## 使用场景

栅栏用于实现一些协议，例如几个小伙伴定在某个地方集合：“明天 6：00 在老马家碰头，到了以后要等其他人，之后再讨论去哪里玩。”

CyclicBarrer可以使一定数量的参与方反复地在栅栏位置汇集，它在并行迭代算法中非常有用：这种算法通常将一个问题拆分一些列互相独立的子问题。

如果所有线程都达到了栅栏位置，那么栅栏将打开，为此所有线程都被释放，而栅栏将被重置以便下次使用。如果对await的调用超时，或者await阻塞的线程被中断，那么栅栏就认为是打破了，所有阻塞的await调用都将终止并抛出BrokenBarrerException。

如果成功通过栅栏，那么await将为每个线程返回一个唯一的到达索引号，我们可以利用这些索引来“选举”产生一个领导线程，并在下一次迭代中由该领导线程执行一些特殊的工作。

CyclicBarrer还可以使你将一个栅栏操作传递给构造函数,这是Runnable，当成功通过栅栏时会（在一个子任务线程中）执行它，但在阻塞线程被释放之前是不能被执行的。

在模拟程序中通常需要使用栅栏，例如某个步骤中的计算可以并行执行，但必须等到该步骤中的所有计算都执行完成才能进入下一个步骤。

## 例子

### 代码实现

我们首先定义一个 Writer 模拟我们需要处理的子任务：

```java
static class Writer extends Thread {
    private CyclicBarrier cyclicBarrier;
    
    public Writer(CyclicBarrier cyclicBarrier) {
        this.cyclicBarrier = cyclicBarrier;
    }
    
    @Override
    public void run() {
        System.out.println("线程" + Thread.currentThread().getName() + "正在写入数据...");
        try {
            Thread.sleep(5000);      //以睡眠来模拟写入数据操作
            System.out.println("线程" + Thread.currentThread().getName() + "写入数据完毕，等待其他线程写入完毕");
            cyclicBarrier.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (BrokenBarrierException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + "所有线程写入完毕，继续处理其他任务...");
    }
}
```

线程通过沉睡 5S 来模拟平时的工作执行耗时，然后使用 `cyclicBarrier.await();` 等待其他线程执行完成。

最后统一输出全部：所有线程写入完毕，继续处理其他任务...

这个就等价于约定好早晨 6：00 到老马家，各位小伙伴都到了，就可以继续进行后去的任务安排了。

```java
public static void main(String[] args) {
    int limit = 4;
    CyclicBarrier barrier = new CyclicBarrier(limit);
    for (int i = 0; i < limit; i++) {
        new Writer(barrier).start();
    }
    try {
        Thread.sleep(25000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    System.out.println("CyclicBarrier重用");
    barrier.reset();
    for (int i = 0; i < limit; i++) {
        new Writer(barrier).start();
    }
}
```

任务的执行，我们这里定义了 4 个需要执行的任务。

并且还演示了 CyclicBarrier 非常方便的一个特性，使用 `barrier.reset();` 就可以重用，非常符合环保节能可持续发展的精神。

### 测试日志

对应的日志如下：

```
线程Thread-1正在写入数据...
线程Thread-3正在写入数据...
线程Thread-2正在写入数据...
线程Thread-0正在写入数据...
线程Thread-0写入数据完毕，等待其他线程写入完毕
线程Thread-2写入数据完毕，等待其他线程写入完毕
线程Thread-3写入数据完毕，等待其他线程写入完毕
线程Thread-1写入数据完毕，等待其他线程写入完毕
Thread-1所有线程写入完毕，继续处理其他任务...
Thread-2所有线程写入完毕，继续处理其他任务...
Thread-3所有线程写入完毕，继续处理其他任务...
Thread-0所有线程写入完毕，继续处理其他任务...

CyclicBarrier重用
线程Thread-4正在写入数据...
线程Thread-5正在写入数据...
线程Thread-6正在写入数据...
线程Thread-7正在写入数据...
线程Thread-4写入数据完毕，等待其他线程写入完毕
线程Thread-6写入数据完毕，等待其他线程写入完毕
线程Thread-5写入数据完毕，等待其他线程写入完毕
线程Thread-7写入数据完毕，等待其他线程写入完毕
Thread-7所有线程写入完毕，继续处理其他任务...
Thread-4所有线程写入完毕，继续处理其他任务...
Thread-6所有线程写入完毕，继续处理其他任务...
Thread-5所有线程写入完毕，继续处理其他任务...
```

# CyclicBarrier 源码

看完了 CyclicBarrier 的使用例子，让我们一起学习一下 CyclicBarrier 的源码吧。

## jdk 版本

老马本次阅读 jdk 的版本是：

```
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.191-b12, mixed mode)
```

## Generation

每一个栅栏都有一个对应的 Generation 维护对应的 broken 状态。

```java
/**
 * Each use of the barrier is represented as a generation instance.
 * The generation changes whenever the barrier is tripped, or
 * is reset. There can be many generations associated with threads
 * using the barrier - due to the non-deterministic way the lock
 * may be allocated to waiting threads - but only one of these
 * can be active at a time (the one to which {@code count} applies)
 * and all the rest are either broken or tripped.
 * There need not be an active generation if there has been a break
 * but no subsequent reset.
 */
private static class Generation {
    boolean broken = false;
}
```

## 基本属性

可以看到，这里用到了 ReentrantLock 可重入锁及对应的 Condition 等。

```java
/** The lock for guarding barrier entry */
private final ReentrantLock lock = new ReentrantLock();
/** Condition to wait on until tripped */
private final Condition trip = lock.newCondition();
/** The number of parties */
private final int parties;
/* The command to run when tripped */
private final Runnable barrierCommand;
/** The current generation */
private Generation generation = new Generation();

/**
 * Number of parties still waiting. Counts down from parties to 0
 * on each generation.  It is reset to parties on each new
 * generation or when broken.
 */
private int count;
```

## 构造器

我们最常用的就是第一个构造器，可以指定需要等个几个线程。

这里主要初始化 parties 和 count 的值。

barrierCommand 应该是一个可执行的 Runnable 任务，可以在 tripped 状态时执行。

```java
public CyclicBarrier(int parties) {
    this(parties, null);
}

public CyclicBarrier(int parties, Runnable barrierAction) {
    if (parties <= 0) throw new IllegalArgumentException();
    this.parties = parties;
    this.count = parties;
    this.barrierCommand = barrierAction;
}
```

## await 方法

我们一起来看一下最常用的 await 方法：

```java
public int await() throws InterruptedException, BrokenBarrierException {
    try {
        return dowait(false, 0L);
    } catch (TimeoutException toe) {
        throw new Error(toe); // cannot happen
    }
}
```

当然，也有对应的指定超时时间的版本；

```java
public int await(long timeout, TimeUnit unit)
    throws InterruptedException,
           BrokenBarrierException,
           TimeoutException {
    return dowait(true, unit.toNanos(timeout));
}
```

这里实际上调用的都是 dowait 方法：

好家伙，洋洋洒洒几十行，为了便于阅读，老马将解析写在代码注释中。

```java
/**
 * Main barrier code, covering the various policies.
 * @author 老马啸西风
 */
private int dowait(boolean timed, long nanos)
    throws InterruptedException, BrokenBarrierException,
           TimeoutException {
    //通过可重入锁执行加锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 获取当前的 Generation
        final Generation g = generation;
        if (g.broken)
            // 如果已经是 broker 状态，直接抛出异常
            throw new BrokenBarrierException();

        // 如果当前线程被中断，则中断栅栏（下面有解释），并抛出中断异常    
        if (Thread.interrupted()) {
            breakBarrier();
            throw new InterruptedException();
        }

        // 执行 --count，对计数器减一，判断是否为0（所有线程都已经 ready）
        int index = --count;
        if (index == 0) {  // tripped
            boolean ranAction = false;
            try {
                // 这里会调用一个 runnable 方法，默认是 null。
                final Runnable command = barrierCommand;
                if (command != null)
                    command.run();

                // 更新标识，并且更新 generation（后续有讲解）   
                ranAction = true;
                nextGeneration();
                return 0;
            } finally {
                if (!ranAction)
                    breakBarrier();
            }
        }

        // 如果没有全部 ready，这里就是一个循环，也可以指定对应的等待超时时间。
        // loop until tripped, broken, interrupted, or timed out
        for (;;) {
            try {
                if (!timed)
                    // 如果没有超时设置，直接等待
                    trip.await();
                else if (nanos > 0L)
                    // 通过 Condition.awaitNanos 方法控制超时
                    nanos = trip.awaitNanos(nanos);
            } catch (InterruptedException ie) {
                // 如果被中断，且 g 没变，也不是 broken 状态，直接调用  breakBarrier();
                if (g == generation && ! g.broken) {
                    breakBarrier();
                    throw ie;
                } else {
                    // We're about to finish waiting even if we had not
                    // been interrupted, so this interrupt is deemed to
                    // "belong" to subsequent execution.
                    Thread.currentThread().interrupt();
                }
            }

            // 如果已经处于 broken 状态，抛出异常。
            if (g.broken)
                throw new BrokenBarrierException();

            // 如果 g 和 generation 不匹配，直接返回 index    
            if (g != generation)
                return index;

            // 如果超时时间小于等于0，立刻超时。    
            if (timed && nanos <= 0L) {
                breakBarrier();
                throw new TimeoutException();
            }
        }
    } finally {
        // 释放锁
        lock.unlock();
    }
}
```

### 中断栅栏

这里是直接设置 broken 的值为 true，然后唤醒所有等待线程。

```java
/**
 * Sets current barrier generation as broken and wakes up everyone.
 * Called only while holding lock.
 */
private void breakBarrier() {
    generation.broken = true;
    count = parties;
    trip.signalAll();
}
```

### nextGeneration 更新 generation

唤醒所有的等待者，并且重新设置 generation。

```java
/**
 * Updates state on barrier trip and wakes up everyone.
 * Called only while holding lock.
 */
private void nextGeneration() {
    // signal completion of last generation
    trip.signalAll();
    // set up next generation
    count = parties;
    generation = new Generation();
}
```

# 小结

CyclicBarrier 作为一个并发的控制工具，和 CountDownLatch 对比个人感觉最大的优势就是可重用。而且多个线程执行完成后，才能继续执行，非常适合多线程任务拆分执行等场景。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

* any list
{:toc}
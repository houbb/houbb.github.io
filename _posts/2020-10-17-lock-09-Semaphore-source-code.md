---
layout: post
title:  锁专题（9） Semaphore 信号量源码深度解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

# 情景导入

我想各位小伙伴一定都做过导出功能，就算没做过，那肯定也用过。

如果你既**没有吃过猪肉，也没有见过猪跑**。那这篇文章也可以读一读，可以补充点知识。

导出作为一个非常常见的功能，也是稍有不慎就会导致系统压力剧增的问题之一。

有类似苦恼的小伙伴可以阅读下我以前写的文章：

> [java 导出 excel 最佳实践，java 大文件 excel 避免OOM(内存溢出) excel 工具框架](https://www.jianshu.com/p/63579d0985df)

## cpu 又报警了，快看看为什么？

记得前不久，一个本该和平的上午，报警群里忽然就炸了，报警信息不断地轰炸过来。

“快看看怎么了？”，项目经理赶紧让各位同事查查问题。

“CPU 太高了”，查了下，有人回到，“不知道是谁在一直导出大文件。”

我们知道 excel 的导出是非常消耗较器性能的，为了限制范围，以前已经加了时间范围 1 个月，还做了很多优化。

但是现在操作员可能在同时导出，导致机器压力还是太大了。

“看一下能不能解决这个问题”，项目经理说，“这么报警也不是办法。”

## 怎么解决？

各位小伙伴，如果是你来解决这个问题，你会怎么做呢？

我们今天来介绍一种比较常用的解决方案，需要用到今天的主角 Semaphore 信号量。

小伙伴有其他想法也欢迎评论区和大家分享讨论一下。

# Semaphore 介绍

计数信号量（Counting Semaphore）用来**控制同时访问的某个特定资源的操作数量，或者同时执行某个指定操作的数量**。

ps: 我们可以根据这个特性，灵活地限制同时导出的执行数量。

计算信号量还可以用来实现某种资源池，或者对容器施加边界。

Semaphore 中管理着一组虚拟许可（permit），许可的初始量可通过构造函数来指定。

在执行操作时可以首先获得许可（只要还有剩余的许可），并在使用以后释放许可。

如果没有许可，那么acquire将阻塞直到有许可（或者直到被中断或者操作超时）。

release方法将返回一个许可给信号量。计算信号量的一种简化形式是二值信号量，即初始化值为1的Semaphore。二值信号量可以用做互斥体（mutex），并具备不可重入的加锁语义：谁拥有这个唯一的许可，谁就拥有了互斥锁。

## 使用例子

```java
public class TestSemaphore {
    public static void main(String[] args) {
        // 线程池
        ExecutorService exec = Executors.newCachedThreadPool();
        // 只能5个线程同时访问
        final Semaphore semp = new Semaphore(5);
        // 模拟20个客户端访问
        for (int index = 0; index < 20; index++) {
            final int NO = index;
            Runnable run = new Runnable() {
                public void run() {
                    try {
                        // 获取许可
                        semp.acquire();
                        System.out.println("Accessing: " + NO);
                        Thread.sleep((long) (Math.random() * 10000));
                        // 访问完后，释放
                        semp.release();
                        System.out.println("-----------------" + semp.availablePermits());
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                }

            };
            exec.execute(run);
        }
        // 退出线程池
        exec.shutdown();
    }
}
```

### 使用说明

声明信号量：

```java
// 只能5个线程同时访问
final Semaphore semp = new Semaphore(5);
```

获取许可：

```java
// 获取许可
semp.acquire();
```

释放许可：

```java
// 访问完后，释放
semp.release();
```

### 测试日志

```
Accessing: 1
Accessing: 3
Accessing: 0
Accessing: 2
Accessing: 5
-----------------1
Accessing: 4
-----------------1
Accessing: 6
-----------------1
Accessing: 7
-----------------1
Accessing: 18
-----------------1
Accessing: 11
-----------------1
Accessing: 12
-----------------1
Accessing: 15
-----------------1
Accessing: 9
-----------------1
Accessing: 10
-----------------1
Accessing: 13
-----------------1
Accessing: 16
-----------------1
Accessing: 14
-----------------1
Accessing: 17
-----------------1
Accessing: 8
-----------------1
Accessing: 19
-----------------1
-----------------2
-----------------3
-----------------4
-----------------5
```

可以看到一开始前 5 个客户端都拿到了访问权限，但是后面的就需要等待了。

等到后面逐渐释放锁，锁的 `semp.availablePermits()` 又恢复到了 5 个。

# 源码解析

## jdk 版本

不同的 jdk 版本源码可能存在差异，老马这次梳理的 jdk 信息如下：

```
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.191-b12, mixed mode)
```

## 类定义

Semaphore 实现了 Serializable 接口。

Sync 是整个实现最核心的部分。

```java
public class Semaphore implements java.io.Serializable {
    private static final long serialVersionUID = -3222578661600680210L;
    /** All mechanics via AbstractQueuedSynchronizer subclass */
    private final Sync sync;

    /**
     * Creates a {@code Semaphore} with the given number of
     * permits and nonfair fairness setting.
     *
     * @param permits the initial number of permits available.
     *        This value may be negative, in which case releases
     *        must occur before any acquires will be granted.
     */
    public Semaphore(int permits) {
        sync = new NonfairSync(permits);
    }

    /**
     * Creates a {@code Semaphore} with the given number of
     * permits and the given fairness setting.
     *
     * @param permits the initial number of permits available.
     *        This value may be negative, in which case releases
     *        must occur before any acquires will be granted.
     * @param fair {@code true} if this semaphore will guarantee
     *        first-in first-out granting of permits under contention,
     *        else {@code false}
     */
    public Semaphore(int permits, boolean fair) {
        sync = fair ? new FairSync(permits) : new NonfairSync(permits);
    }

}
```

通过构造器可以看到，支持是否为公平锁。

和可重入锁的设计看起来有些类似。

## Sync 实现

继承自 AQS 类，简单介绍直接写在了注释中。

```java
/**
 * Synchronization implementation for semaphore.  Uses AQS state
 * to represent permits. Subclassed into fair and nonfair
 * versions.
 * @author 老马啸西风
 */
abstract static class Sync extends AbstractQueuedSynchronizer {
    private static final long serialVersionUID = 1192457210091910933L;
    
    // permits 对应的就是需要维护的状态值
    Sync(int permits) {
        setState(permits);
    }

    // 获取对应的状态值
    final int getPermits() {
        return getState();
    }

    // 非公平模式尝试以共享模式获取锁
    final int nonfairTryAcquireShared(int acquires) {
        for (;;) {
            int available = getState();
            int remaining = available - acquires;

            // 如果 remaining 剩余小于 0，直接返回。
            // 否则通过 CAS 进行设置。
            if (remaining < 0 ||
                compareAndSetState(available, remaining))
                return remaining;
        }
    }

    // 尝试释放锁
    protected final boolean tryReleaseShared(int releases) {
        for (;;) {
            int current = getState();
            int next = current + releases;
            if (next < current) // overflow
                throw new Error("Maximum permit count exceeded");

            // 通过 CAS 设置对应的值    
            if (compareAndSetState(current, next))
                return true;
        }
    }

    // 减少允许的数量
    final void reducePermits(int reductions) {
        for (;;) {
            int current = getState();
            int next = current - reductions;
            if (next > current) // underflow
                throw new Error("Permit count underflow");
            // 通过 CAS 设置    
            if (compareAndSetState(current, next))
                return;
        }
    }

    // 这个就是将 state 设置为 0
    // 功能是将剩余的授权都清空。
    final int drainPermits() {
        for (;;) {
            int current = getState();
            if (current == 0 || compareAndSetState(current, 0))
                return current;
        }
    }
}
```

## 非公平锁实现

非公平锁的 tryAcquireShared 就是直接调用 Sync 中的方法。

```java
/**
 * NonFair version
 */
static final class NonfairSync extends Sync {
    private static final long serialVersionUID = -2694183684443567898L;
    NonfairSync(int permits) {
        super(permits);
    }
    protected int tryAcquireShared(int acquires) {
        return nonfairTryAcquireShared(acquires);
    }
}
```

## 公平锁实现

```java
/**
 * Fair version
 */
static final class FairSync extends Sync {
    private static final long serialVersionUID = 2014338818796000944L;

    FairSync(int permits) {
        super(permits);
    }

    protected int tryAcquireShared(int acquires) {
        for (;;) {
            if (hasQueuedPredecessors())
                return -1;
            int available = getState();
            int remaining = available - acquires;
            if (remaining < 0 ||
                compareAndSetState(available, remaining))
                return remaining;
        }
    }
}
```

如何实现公平锁模式呢？

其实答案就是**按顺序排队，谁插队，用吐沫星子淹死他**。

这里都是通过父类的 hasQueuedPredecessors 方法，如果前面有人排队，直接返回获取失败。

如果已经排到我了，则计算剩余的量，然后通过 CAS 设置。

## 获取锁

### 获取锁

```java
public void acquire() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}

public void acquireUninterruptibly() {
    sync.acquireShared(1);
}
```

获取锁实际上调用的还是 `sync.acquireShared(1);` 方法。

这个是 AQS 中的方法，

### 尝试获取锁

这个和可重入锁中的实现实际上非常类似，注意这里调用的是非公平获取锁的模式。

```java
public boolean tryAcquire() {
    return sync.nonfairTryAcquireShared(1) >= 0;
}
```

可以根据我们指定是否公平尝试获取锁：

```java
public boolean tryAcquire(long timeout, TimeUnit unit)
    throws InterruptedException {
    return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
}
```

这个方法对应的就是我们指定的 NoFairSync 或者 FairSync 对象了。


### 指定获取信号量的个数

默认是获取 1 个信号量，我们也可以指定获取的个数。

```java
public void acquire(int permits) throws InterruptedException {
    if (permits < 0) throw new IllegalArgumentException();
    sync.acquireSharedInterruptibly(permits);
}

public void acquireUninterruptibly(int permits) {
    if (permits < 0) throw new IllegalArgumentException();
    sync.acquireShared(permits);
}

public boolean tryAcquire(int permits) {
    if (permits < 0) throw new IllegalArgumentException();
    return sync.nonfairTryAcquireShared(permits) >= 0;
}
```

当然也有同时指定信号量个数+超时时间的方法：

```java
public boolean tryAcquire(int permits, long timeout, TimeUnit unit)
    throws InterruptedException {
    if (permits < 0) throw new IllegalArgumentException();
    return sync.tryAcquireSharedNanos(permits, unit.toNanos(timeout));
}
```

实际上这里就体现了一个问题，就叫做**接口爆炸**。

jdk 为了使用者的便利性，对一个基础的方法，提供了大量的封装方法，本质上实际只有一个方法。

## 锁释放

```java
public void release() {
    sync.releaseShared(1);
}
```

统一调用的是 releaseShared 方法，实际上参数为 1。

```java
public void release(int permits) {
    if (permits < 0) throw new IllegalArgumentException();
    sync.releaseShared(permits);
}
```

当然参数如果允许用户自定义，就需要添加一个判断。

## 其他方法

主要讲述下和 Sync 对象有关的几个方法，不能让我们前面 Sync 源码讲解浪费了。

这里就是对 Sync 对应方法的简单调用。

```java
/**
 * Returns the current number of permits available in this semaphore.
 *
 * <p>This method is typically used for debugging and testing purposes.
 *
 * @return the number of permits available in this semaphore 剩余的可用信号量
 * @author 老马啸西风
 */
public int availablePermits() {
    return sync.getPermits();
}

/**
 * Acquires and returns all permits that are immediately available.
 *
 * @return the number of permits acquired 这个会把所有可用的信号量都用掉。有点一掷千金的味道。
 */
public int drainPermits() {
    return sync.drainPermits();
}
/**
 * Shrinks the number of available permits by the indicated
 * reduction. This method can be useful in subclasses that use
 * semaphores to track resources that become unavailable. This
 * method differs from {@code acquire} in that it does not block
 * waiting for permits to become available.
 *
 * @param reduction the number of permits to remove 减少对应的可用数量。不过这个方法是一个 protected，
 * @throws IllegalArgumentException if {@code reduction} is negative
 */
protected void reducePermits(int reduction) {
    if (reduction < 0) throw new IllegalArgumentException();
    sync.reducePermits(reduction);
}
```

# 小结

Semaphore 作为一个并发的控制工具，使用起来非常的方便，实现的原理非常类似可重入锁，都是继承自 AQS 类。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

* any list
{:toc}
---
layout: post
title:  锁专题（9） CountDownLatch 源码深度解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

# CountDownLatch 闭锁

我们在 [java 手写并发框架（一）异步查询转同步的7种实现方式](https://www.toutiao.com/item/6881613033299247619/) 和 [从零手写并发框架（二）异步转同步实现4种锁策略](https://www.toutiao.com/item/6882012107857265160/) 都是用过这个类，感兴趣的小伙伴可以看一下。

## 说明 

CountDownLatch 是一种同步工具类，它允许一个或多个线程等待，直到在其他线程中执行的一组操作完成为止。

可以让一个线程等待一组事件发生后（不一定要线程结束）继续执行；

闭锁是一种同步工具类，可以延迟线程的进度直到其达到终止状态。

闭锁的作用相当于一扇门：在闭锁到达结束状态之前，这扇门一直是关闭的，并且没有任何线程能通过，当到达结束状态时，这扇门会打开并允许所有的线程通过。当闭锁到达结束状态后，将不会再改变状态，因此这扇门将永远保持打开状态。

闭锁可以用来确保某些活动直到其它活动都完成后才继续执行，例如：

1、确保某个计算在其需要的所有资源都被初始化之后才继续执行。二元闭锁（包括两个状态）可以用来表示“资源R已经被初始化”，而所有需要R的操作都必须先在这个闭锁上等待。

2、确保某个服务在其依赖的所有其它服务都已经启动之后才启动。每个服务都有一个相关的二元闭锁。当启动服务S时，将首先在S依赖的其它服务的闭锁上等待，在所有依赖的服务都启动后会释放闭锁S，这样其他依赖S的服务才能继续执行。

3、等待直到某个操作的所有参与者（例如，在多玩家游戏中的所有玩家）都就绪再继续执行。在这种情况中，当所有玩家都准备就绪时，闭锁将到达结束状态。

## 使用例子

一个简单的使用例子如下：

```java
public class TestHarness {
    public long timeTakes(int nThreads, final Runnable task) throws InterruptedException {
        final CountDownLatch startGate = new CountDownLatch(1);
        final CountDownLatch endGate = new CountDownLatch(nThreads);

        for (int i = 0; i < nThreads; i++) {
            Thread t = new Thread() {
                public void run() {
                    try {
                        startGate.await();
                        try {
                            task.run();
                        } finally {
                            endGate.countDown();
                        }
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                }
            };
            t.start();
        }

        long start = System.nanoTime();
        startGate.countDown();
        endGate.await();
        long end = System.nanoTime();
        return end - start;
    }

    public static void main(String[] args) throws InterruptedException {
        TestHarness testHarness = new TestHarness();
        long nanoTime = testHarness.timeTakes(10, new Runnable() {
            public void run() {
                try {
                    Thread.sleep(1000);
                    System.out.println("Task is over!!!");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        System.out.println(nanoTime);
    }
}
```

### 说明

创建一个 CountDownLatch

```java
CountDownLatch startGate = new CountDownLatch(1);
```

执行等待：

```java
startGate.await();
```

表示资源已经完成，可以使用下面的方法通知：

```java
startGate.countDown();
```

当降低到 0 的时候，这个门就被打开了，就可以通行了。

实际上这个实现原理和其他锁是一样的，我们一起来看一下实现源码。

# CountDownLatch 源码

## 类声明

```java
public class CountDownLatch {
    
    private final Sync sync;

    /**
     * Constructs a {@code CountDownLatch} initialized with the given count.
     *
     * @param count the number of times {@link #countDown} must be invoked
     *        before threads can pass through {@link #await}
     * @throws IllegalArgumentException if {@code count} is negative
     */
    public CountDownLatch(int count) {
        if (count < 0) throw new IllegalArgumentException("count < 0");
        this.sync = new Sync(count);
    }

}
```

这个类的内部变量非常简单，只有一个 Sync 对象，这个类的实现实现主要继承自 AQS。

## Sync 实现

```java
/**
 * Synchronization control For CountDownLatch.
 * Uses AQS state to represent count.
 */
private static final class Sync extends AbstractQueuedSynchronizer {
    private static final long serialVersionUID = 4982264981922014374L;
    Sync(int count) {
        setState(count);
    }
    int getCount() {
        return getState();
    }
    
}
```

其实实现还算简单，这已经是 CountDownLatch 中最复杂的一个实现了。

### 尝试获取锁

```java
protected int tryAcquireShared(int acquires) {
    return (getState() == 0) ? 1 : -1;
}
```

这个是尝试获取共享锁。

可见只有当 count == 0 的时候，才能获取成功。

### 尝试释放锁

```java
protected boolean tryReleaseShared(int releases) {
    // Decrement count; signal when transition to zero
    // 这里就是一个 while(true) 循环
    for (;;) {
        int c = getState();
        if (c == 0)
            return false;
        int nextc = c-1;
        if (compareAndSetState(c, nextc))
            return nextc == 0;
    }
}
```


还是会判断，如果 c == 0，说明锁已经释放过了，直接返回 false。

nextc 就是 c-1，听过 CAS 进行设置。

如果 c-1 == 0，则返回释放锁成功。

## 基本方法

看完了上面的 Sync 实现，其他的方法就变得非常简单了。

### await 等待

```java
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
```

这里实际是调用的 Sync 父类 AQS 中的方法：

```java
public final void acquireSharedInterruptibly(int arg)
        throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    if (tryAcquireShared(arg) < 0)
        doAcquireSharedInterruptibly(arg);
}
```

tryAcquireShared 是 Sync 中实现的方法，尝试获取共享锁。

如果获取失败，则会调用 doAcquireSharedInterruptibly 通过共享可中断的模式获取锁。

### await 指定超时时间的等待

有时候业务不允许我们一直等待下去，可以通过指定超时时间：

```java
public boolean await(long timeout, TimeUnit unit)
    throws InterruptedException {
    return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
}
```

tryAcquireSharedNanos 也是 AQS 中的基本方法：

```java
public final boolean tryAcquireSharedNanos(int arg, long nanosTimeout)
        throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    return tryAcquireShared(arg) >= 0 ||
        doAcquireSharedNanos(arg, nanosTimeout);
}
```

这里实现也是类似的，首先调用 tryAcquireShared 共享模式获取锁，然后调用 doAcquireSharedNanos 方法。这个方法就是指定了对应的超时时间。

## countDown 减少闭锁的次数

```java
/**
 * Decrements the count of the latch, releasing all waiting threads if
 * the count reaches zero.
 *
 * <p>If the current count is greater than zero then it is decremented.
 * If the new count is zero then all waiting threads are re-enabled for
 * thread scheduling purposes.
 *
 * <p>If the current count equals zero then nothing happens.
 */
public void countDown() {
    sync.releaseShared(1);
}
```

这里还是有点差异的：

（1）如果 count 大于 0，则只是减少 1

（2）如果 count 等于 0，则可以唤醒所有等待的线程。

这里的 releaseShared 调用的也是 AQS 中的方法。

## getCount 获取当前的次数

```java
/**
 * Returns the current count.
 *
 * <p>This method is typically used for debugging and testing purposes.
 *
 * @return the current count
 */
public long getCount() {
    return sync.getCount();
}
```


这个注释也说了，一般用于 debug 或者测试。

实际使用中很少用到。

# 小结

CountDownLatch 作为一个并发的控制工具，使用起来非常的方便，使用起来也并发不麻烦。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[linux 锁实现](http://www.lameter.com/gelato2005.pdf)

* any list
{:toc}
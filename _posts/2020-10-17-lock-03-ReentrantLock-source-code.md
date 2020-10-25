---
layout: post
title:  锁专题（3）ReentrantLock 可重入锁源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

> 点赞再看，已成习惯。

![可重入锁源码](https://images.gitee.com/uploads/images/2020/1017/205515_dcf6ab66_508704.png)

# ReentrantLock 源码

介绍 ReentrantLock 的文章很多，今天我们来一起看一下 ReentrantLock 的源码，理解一下实现原理。

## 类定义

ReentrantLock 实现了 Lock 接口，和序列化接口。

```java
/**
 * @author 老马啸西风
 */
public class ReentrantLock implements Lock, java.io.Serializable {
    private static final long serialVersionUID = 7373984872572414699L;
    /** Synchronizer providing all implementation mechanics */
    private final Sync sync;

}
```

## Sync 介绍

Sync 作为可重入锁的私有变量，实际上是继承自 AQS 的一个锁实现。

关于部分方法的解释我写在了注释中，便于大家理解。

ps：AQS 我们本节不做展开，后续会专门有一节进行讲解。 

```java
/**
 * Base of synchronization control for this lock. Subclassed
 * into fair and nonfair versions below. Uses AQS state to
 * represent the number of holds on the lock.
 * @author 老马啸西风
 */
abstract static class Sync extends AbstractQueuedSynchronizer {
    private static final long serialVersionUID = -5179523762034025860L;
    /**
     * Performs {@link Lock#lock}. The main reason for subclassing
     * is to allow fast path for nonfair version.
     */
    abstract void lock();
    /**
     * Performs non-fair tryLock.  tryAcquire is implemented in
     * subclasses, but both need nonfair try for trylock method.
     *
     * 非公平获取锁。
     * （1）如果当前没有线程持有锁，则通过 CAS 比较，如果 state=0，且设置为 acquires 成功，则设置持有锁的线程为当前线程。
     * （2）如果持有锁的线程已经是当前线程，则设置 state += acquires;
     * 这里还很细心，做了一个防止 overflow 的处理。
     */
    final boolean nonfairTryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        if (c == 0) {
            if (compareAndSetState(0, acquires)) {
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0) // overflow
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }

    /**
     * 尝试释放锁
     * （1）如果当前进程不是最后一个设置锁的进程（锁的持有者），则报错
     * （2）c = 当前状态-释放的个数。
     * 如果 c = 0，说明锁已经被完全释放，设置所的持有者为 null，更新 state=c，返回 free 的结果。
     */
    protected final boolean tryRelease(int releases) {
        int c = getState() - releases;
        if (Thread.currentThread() != getExclusiveOwnerThread())
            throw new IllegalMonitorStateException();
        boolean free = false;
        if (c == 0) {
            free = true;
            setExclusiveOwnerThread(null);
        }
        setState(c);
        return free;
    }
     /**
     * 判断当前线程是否为持有者
     */
    protected final boolean isHeldExclusively() {
        // While we must in general read state before owner,
        // we don't need to do so to check if current thread is owner
        return getExclusiveOwnerThread() == Thread.currentThread();
    }
    /**
     * 创建一个 ConditionObject
     */
    final ConditionObject newCondition() {
        return new ConditionObject();
    }
    // Methods relayed from outer class
    /**
     * 获取锁持有者
     */
    final Thread getOwner() {
        return getState() == 0 ? null : getExclusiveOwnerThread();
    }
    /**
     * 获取锁持有者的数量
     */
    final int getHoldCount() {
        return isHeldExclusively() ? getState() : 0;
    }
    /**
     * 判断是否处于加锁状态
     */
    final boolean isLocked() {
        return getState() != 0;
    }
    /**
     * Reconstitutes the instance from a stream (that is, deserializes it).
     */
    private void readObject(java.io.ObjectInputStream s)
        throws java.io.IOException, ClassNotFoundException {
        s.defaultReadObject();
        setState(0); // reset to unlocked state
    }
}
```

## 非公平锁实现

### 源码

这里的非公平锁实现直接继承自 `Sync`。

```java
/**
 * Sync object for non-fair locks
 * @author 老马啸西风
 */
static final class NonfairSync extends Sync {
    private static final long serialVersionUID = 7316153563782823691L;
    /**
     * Performs lock.  Try immediate barge, backing up to normal
     * acquire on failure.
     */
    final void lock() {
        if (compareAndSetState(0, 1))
            setExclusiveOwnerThread(Thread.currentThread());
        else
            acquire(1);
    }

    /**
     * 尝试获取锁的实现很简单，直接调用 Sync 中的方法。
     */
    protected final boolean tryAcquire(int acquires) {
        return nonfairTryAcquire(acquires);
    }
}
```

### lock 方法

这里我们讲解下 lock() 方法，这个是一个加锁的方法。

`if (compareAndSetState(0, 1))` 意思就是当 state=0 且设置为1成功时，设置锁的持有者为当前线程。

否则就调用 `acquire(1);`，这个方法时 AQS 中的一个方法：

```java
/**
 * Acquires in exclusive mode, ignoring interrupts.  Implemented
 * by invoking at least once {@link #tryAcquire},
 * returning on success.  Otherwise the thread is queued, possibly
 * repeatedly blocking and unblocking, invoking {@link
 * #tryAcquire} until success.  This method can be used
 * to implement method {@link Lock#lock}.
 *
 * @param arg the acquire argument.  This value is conveyed to
 *        {@link #tryAcquire} but is otherwise uninterpreted and
 *        can represent anything you like.
 * @author 老马啸西风
 */
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

这里使用独占模式获取锁，忽略打断。

而且会至少调用一次 tryAcquire() 方法，成功就返回。没成功，就是放在重试队列里，一直重试，直到成功为止。

所以本质上，acquire 方法调用的还是 tryAcquire() 方法，额外多了重试功能。

### 小思考题

为什么说这是一种非公平锁？

## 公平锁实现

### 源码

公平锁也是继承自 Sync 类。

```java
/**
 * Sync object for fair locks
 * @author 老马啸西风
 */
static final class FairSync extends Sync {
    private static final long serialVersionUID = -3000897897090466540L;

     /**
     * 加锁方法，比较简单就是直接调用 acquire()
     */
    final void lock() {
        acquire(1);
    }

    /**
     * Fair version of tryAcquire.  Don't grant access unless
     * recursive call or no waiters or is first.
     */
    protected final boolean tryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        if (c == 0) {
            if (!hasQueuedPredecessors() &&
                compareAndSetState(0, acquires)) {
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0)
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }
}
```

### tryAcquire 方法

我们来重点看一下 tryAcquire() 方法。

这里首先如果 state=0（没有线程持有锁），则尝试开始加锁。但是有一个前提，那就是这个方法：`!hasQueuedPredecessors()`

这个方法意思也比较明确，就是在当前线程之前没有其他线程等待，就像排队一样，讲究一个先来后到。

- hasQueuedPredecessors()

这个方法我们简单看一下，不是本节的重点内容：

```java
/**
 * @author 老马啸西风
 */
public final boolean hasQueuedPredecessors() {
    // The correctness of this depends on head being initialized
    // before tail and on head.next being accurate if the current
    // thread is first in queue.
    Node t = tail; // Read fields in reverse initialization order
    Node h = head;
    Node s;
    return h != t &&
        ((s = h.next) == null || s.thread != Thread.currentThread());
}
```

当前线程前面有其他线程等待的条件如下：

（1）等待的队列不是空。

（2）第一个元素不是当前线程。

### 什么叫可重入？

实际上 `current == getExclusiveOwnerThread()` 分支的处理方式，这里就是可重入的概念。

如果当前线程和持有锁的线程是同一个，直接操作即可，省去了上面的判断。

## 构造器

构造器相对理解起来就轻松很多。

默认是非公平锁，也可以指定是否公平来创建。

```java
/**
 * Creates an instance of {@code ReentrantLock}.
 * This is equivalent to using {@code ReentrantLock(false)}.
 * @author 老马啸西风
 */
public ReentrantLock() {
    sync = new NonfairSync();
}

/**
 * Creates an instance of {@code ReentrantLock} with the
 * given fairness policy.
 *
 * @param fair {@code true} if this lock should use a fair ordering policy
 */
public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

### 为什么默认是非公平锁？

个人理解是处于性能的考虑，非公平和公平锁对比，少了一次判断是否为第一个等待获取锁的线程比较。

当然公平锁的优点就是避免饥饿。

## 其他方法

剩下的方法，大部分都是对 Sync 实现的简单调用，让我们来一起看一遍。

### lock()

加锁方法，不允许被打断。直接调用 sync。

```java
public void lock() {
    sync.lock();
}
```

### lockInterruptibly()

允许被打断的加锁方式。

```java
public void lockInterruptibly() throws InterruptedException {
    sync.acquireInterruptibly(1);
}
```

这个调用的也是 AQS 的方法：

```java
/**
 * @author 老马啸西风
 */
public final void acquireInterruptibly(int arg)
        throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    if (!tryAcquire(arg))
        doAcquireInterruptibly(arg);
}
```

如果当前被打断，直接抛出打断异常。

如果尝试获取锁失败，则调用 doAcquireInterruptibly()，方法实现如下：

```java
/**
 * Acquires in exclusive interruptible mode.
 * @param arg the acquire argument
 * @author 老马啸西风
 */
private void doAcquireInterruptibly(int arg)
    throws InterruptedException {
    final Node node = addWaiter(Node.EXCLUSIVE);
    boolean failed = true;
    try {
        for (;;) {
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return;
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                throw new InterruptedException();
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

这里就是在循环等待获取锁，用独占的方式，只不过允许被打断。

### tryLock() 

尝试获取锁，实现如下：

```java
public boolean tryLock() {
    return sync.nonfairTryAcquire(1);
}
```

这里非常有趣，调用的是非公平尝试获取锁的方法。

- 为什么调用的是非公平锁？

我们都声明使用公平锁模式了，为什么 jdk 在这里用的确实非公平模式获取的？

jdk 给出的解释如下：

> 即使将此锁设置为使用公平的排序策略，对 tryLock() 的调用也会立即获取该锁（如果有），无论当前是否有其他线程在等待该锁。即使破坏公平性，这种插入行为在某些情况下也可能有用。

个人的理解是这里的尝试获取锁就只有一次，虽然破坏了公平性呢，但是性能很好，常常是更符合使用者预期的。

ps: 这里不得不感慨一下，有些东西不看源码，是想不到的。

- 我们想使用公平模式获取锁怎么办？

[公平](https://p1.pstatp.com/origin/pgc-image/4d86a8d763934ce1962965c80dca89e8)

那问题又来了，我们想使用公平锁模式获取锁怎么办？

我们可以使用 `tryLock(0, TimeUnit.SECONDS)` 这个方法公平的获取锁。

### tryLock(long timeout, TimeUnit unit) 

指定超时时间的获取锁方法，系统会统一转换为 nanos 去处理。

```java
public boolean tryLock(long timeout, TimeUnit unit)
        throws InterruptedException {
    return sync.tryAcquireNanos(1, unit.toNanos(timeout));
}
```

- 纳秒是多久？

ns（nanosecond）：纳秒，时间单位。一秒的十亿分之一，等于10的负9次方秒（1 ns = 10 s）。

光在真空中一纳秒仅传播0.3米。个人电脑的微处理器执行一道指令（如将两数相加）约需2至4纳秒。

- tryAcquireNanos

```java
/**
 * @author 老马啸西风
 */
public final boolean tryAcquireNanos(int arg, long nanosTimeout)
        throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    return tryAcquire(arg) ||
        doAcquireNanos(arg, nanosTimeout);
}
```

可以看出这个方法同样支持中断。

```java
/**
 * Acquires in exclusive timed mode.
 *
 * @param arg the acquire argument
 * @param nanosTimeout max wait time
 * @return {@code true} if acquired
 * @author 老马啸西风
 */
private boolean doAcquireNanos(int arg, long nanosTimeout)
        throws InterruptedException {
    if (nanosTimeout <= 0L)
        return false;
    final long deadline = System.nanoTime() + nanosTimeout;
    final Node node = addWaiter(Node.EXCLUSIVE);
    boolean failed = true;
    try {
        for (;;) {
            final Node p = node.predecessor();
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return true;
            }
            nanosTimeout = deadline - System.nanoTime();
            if (nanosTimeout <= 0L)
                return false;
            if (shouldParkAfterFailedAcquire(p, node) &&
                nanosTimeout > spinForTimeoutThreshold)
                LockSupport.parkNanos(this, nanosTimeout);
            if (Thread.interrupted())
                throw new InterruptedException();
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

方法执行的时候设置了一个 deadline，有一句话怎么说来着。

deadline 是第一生产力，可能对于锁而言也是如此吧。

### unlock()

释放锁。

```java
public void unlock() {
    sync.release(1);
}
```

- release()

这里会调用 tryRelease，如果成功还会有一些 Node 信息的更新。

```java
/**
 * @author 老马啸西风
 */
public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

其他还有一些方法，我们平时也不常用，此处就不做重点解析。

# 小结

锁作为我们高性能并发中并发安全的基础，是每一位 java 程序员的必备技能。

源码相对各种博客中的使用，显得有些无趣，但是有些东西，是源码中才有的知识。

相信你对技术有着更深的追求，**极客的学习就样追根究底且枯燥。**

本节中多次出现了一个类叫 AQS，下一节让我们一起来揭开这个类的神秘面纱。

各位**极客的点赞转发关注**，是我创作的最大动力，感谢你的支持！

# 参考资料

jdk8 源码

* any list
{:toc}
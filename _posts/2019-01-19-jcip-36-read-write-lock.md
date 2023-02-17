---
layout: post
title:  JCIP-36-ReentrantReadWriteLock 读写锁详解
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, sh]
published: true
---


# ReentrantLock 锁回顾

在Java5.0之前,只有synchronized(内置锁)和volatile. Java5.0后引入了显示锁ReentrantLock.

ReentrantLock是可重入的锁,它不同于内置锁, 它在每次使用都需要显示的加锁和解锁, 而且提供了更高级的特性:公平锁, 定时锁, 有条件锁, 可轮询锁, 可中断锁. 可以有效避免死锁的活跃性问题

## Lock 接口

```java
 public interface Lock {
    //阻塞直到获得锁或者中断
    void lock();
    //阻塞直到获得锁或者中断抛异常
    void lockInterruptibly() throws InterruptedException;
    
    //只有锁可用时才获得,否则直接返回
    boolean tryLock();
    
    //只有锁在指定时间内可用时才获得,否则直接返回,中断时抛异常
    boolean tryLock(long time, TimeUnit unit) throws InterruptedException;
    
    void unlock();
    
    //返回一个绑定在这个锁上的条件
    Condition newCondition();
}
```

## 使用

```java
Lock lock = new ReentrantLock();
lock.lock();
try{
    //更新对象状态
}finally{
    //这里注意,一定要有finally代码块去解锁
    //否则容易造成死锁等活跃性问题
    lock.unlock();
}
```

## 轮询锁的和定时锁

可轮询和可定时的锁请求是通过tryLock()方法实现的,和无条件获取锁不一样. 

ReentrantLock可以有灵活的容错机制.死锁的很多情况是由于顺序锁引起的, 不同线程在试图获得锁的时候阻塞,并且不释放自己已经持有的锁, 最后造成死锁. 

tryLock()方法在试图获得锁的时候,如果该锁已经被其它线程持有,则按照设置方式立刻返回,而不是一直阻塞等下去,同时在返回后释放自己持有的锁.

可以根据返回的结果进行重试或者取消,进而避免死锁的发生.

## 公平性

ReentrantLock构造函数中提供公平性锁和非公平锁（默认）两种选择。

所谓公平锁，线程将按照他们发出请求的顺序来获取锁，不允许插队；但在非公平锁上，则允许插队：当一个线程发生获取锁的请求的时刻，如果这个锁是可用的，那这个线程将跳过所在队列里等待线程并获得锁。

我们一般希望所有锁是非公平的。因为当执行加锁操作时，公平性将讲由于线程挂起和恢复线程时开销而极大的降低性能。考虑这么一种情况：A线程持有锁，B线程请求这个锁，因此B线程被挂起；A线程释放这个锁时，B线程将被唤醒，因此再次尝试获取锁；与此同时，C线程也请求获取这个锁，那么C线程很可能在B线程被完全唤醒之前获得、使用以及释放这个锁。这是种双赢的局面，B获取锁的时刻（B被唤醒后才能获取锁）并没有推迟，C更早地获取了锁，并且吞吐量也获得了提高。

在大多数情况下，非公平锁的性能要高于公平锁的性能。

## 可中断获锁获取操作

lockInterruptibly() 方法能够在获取锁的同时保持对中断的响应，因此无需创建其它类型的不可中断阻塞操作。

对于可重入锁的回顾就到这里，更深入地讲解，可以阅读 

> [ReentrantLock 可重入锁这样学，面试没烦恼](https://www.toutiao.com/item/6886091002042384908/)

> [锁专题（五）ReentrantLock 深入源码详解](https://www.toutiao.com/item/6886098848280740355/)

# 为什么需要读写锁

在Java并发包中常用的锁（如：ReentrantLock），基本上都是排他锁，这些锁在同一时刻只允许一个线程进行访问，而读写锁在同一时刻可以允许多个读线程访问，但是在写线程访问时，所有的读线程和其他写线程均被阻塞。

读写锁维护了一对锁，一个读锁和一个写锁，通过分离读锁和写锁，使得 并发性相比一般的排他锁有了很大提升。

**除了保证写操作对读操作的可见性以及并发性的提升之外，读写锁能够简化读写交互场景的编程方式。**

假设在程序中定义一个共享的数据结构用作缓存，它大部分时间提供读服务（例如：查询和搜索），而写操作占有的时间很少，但是写操作完成之后的更新需要对后续的读服务可见。

在没有读写锁支持的（Java 5 之前）时候，如果需要完成上述工作就要使用Java的等待通知机制，就是当写操作开始时，所有晚于写操作的读操作均会进入等待状态，只有写操作完成并进行通知之后，所有等待的读操作才能继续执行（写操作之间依靠synchronized关键字进行同步），这样做的目的是使读操作都能读取到正确的数据，而不会出现脏读。

改用读写锁实现上述功能，只需要在读操作时获取读锁，而写操作时获取写锁即可，当写锁被获取到时，后续（非当前写操作线程）的读写操作都会被 阻塞，写锁释放之后，所有操作继续执行，编程方式相对于使用等待通知机制的实现方式而言，变得简单明了。

一般情况下，读写锁的性能都会比排它锁要好，因为大多数场景读是多于写的。在读多于写的情况下，读写锁能够提供比排它锁更好的并发性和吞吐量。

## 读写锁的优势

与传统锁不同的是读写锁的规则是可以共享读，但只能一个写，总结起来为：读读不互斥，读写互斥，写写互斥，

而一般的独占锁是：读读互斥，读写互斥，写写互斥，而场景中往往读远远大于写，读写锁就是为了这种优化而创建出来的一种机制。

注意是读远远大于写，一般情况下独占锁的效率低来源于高并发下对临界区的激烈竞争导致线程上下文切换。因此当并发不是很高的情况下，读写锁由于需要额外维护读锁的状态，可能还不如独占锁的效率高。因此需要根据实际情况选择使用。

# jdk 内置实现 ReentrantReadWriteLock

java并发包提供了读写锁的具体实现 ReentrantReadWriteLock，它主要提供了一下特性：

## 特性

公平性选择：支持公平和非公平（默认）两种获取锁的方式，非公平锁的吞吐量优于公平锁；

可重入：支持可重入，读线程在获取读锁之后能够再次获取读锁，写线程在获取了写锁之后能够再次获取写锁，同时也可以获取读锁；

锁降级：线程获取锁的顺序遵循获取写锁，获取读锁，释放写锁，写锁可以降级成为读锁。

## 如何保证同步

Java中的可重入读写锁ReentrantReadWriteLock是基于AQS（AbstractQueuedSynchronizer）实现的，查看源码可以发现内部有一个Sync对象继承自AbstractQueuedSynchronizer，它用来管理同步机制，java并发包下的类基本都是用它来提供同步机制的。

再查看AQS的源码会发现其内部全是native方法及包装这些方法的一些其他方法。

这些native方法都是调用本地方法，利用了运行机器CPU的CAS特性。

CAS（CompareAndSet）是一种非阻塞算法来保证同步，它的效率通常要比加锁算法高很多，因为它无阻塞，无挂起和恢复，无死锁。

简单来说，比较和替换是使用一个期望值和一个变量的当前值进行比较，如果当前变量的值与我们期望的值相等，就使用一个新值替换当前变量的值，返回true，否则返回false，线程可以选择继续做其他事情。

关于CAS可以参考 [锁专题（四）深入浅出 CAS 算法，乐观锁原来这样实现的](https://www.toutiao.com/item/6885723630169227784/)。

## 如何维护状态

ReentrantReadWriteLock内部维护的读写状态是由32位码表示，高16位为读状态，表示持有读锁的线程数（sharedCount），低16位为写状态，表示写锁的重入次数 （exclusiveCount），状态的改变通过AQS实现，保证同步。

关于ReentrantReadWriteLock的最核心部分大概就是上述两点，这里不再细致分析具体代码实现，它注重了效率但实现方式不容易我们理解一个读写锁到底该有什么东西。因此这里重点通过一个wait/notify版本的读写锁如何实现来深入了解读写锁的原理。

# ReentrantReadWriteLock 源码分析

## jdk 版本

```
java version "1.8.0_191"
```

## 接口

```java
public class ReentrantReadWriteLock
        implements ReadWriteLock, java.io.Serializable 
```

## 私有属性

ReadLock与WriteLock使用的是同一个Sync，具体怎么实现同一个队列既可以为共享锁，又可以表示排他锁下文会具体分析。

参见 [Sync 源码](#Sync)

```java
 /** Inner class providing readlock */
private final ReentrantReadWriteLock.ReadLock readerLock;
/** Inner class providing writelock */
private final ReentrantReadWriteLock.WriteLock writerLock;
/** Performs all synchronization mechanics */
final Sync sync;
```

## 构造器

```java
 /**
 * Creates a new {@code ReentrantReadWriteLock} with
 * default (nonfair) ordering properties.
 */
public ReentrantReadWriteLock() {
    this(false);
}

/**
 * Creates a new {@code ReentrantReadWriteLock} with
 * the given fairness policy.
 *
 * @param fair {@code true} if this lock should use a fair ordering policy
 */
public ReentrantReadWriteLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
    readerLock = new ReadLock(this);
    writerLock = new WriteLock(this);
}
```

# Sync

sync是读写锁实现的核心，sync是基于AQS实现的，在AQS中核心是state字段和双端队列，那么一个一个问题来分析。

## Sync如何同时表示读锁与写锁？

- 读写锁状态获取

```java
static final int SHARED_SHIFT = 16;
static final int SHARED_UNIT = (1 << SHARED_SHIFT);
static final int MAX_COUNT = (1 << SHARED_SHIFT) - 1;
static final int EXCLUSIVE_MASK = (1 << SHARED_SHIFT) - 1;

/** Returns the number of shared holds represented in count */
static int sharedCount(int c) { return c >>> SHARED_SHIFT; }
/** Returns the number of exclusive holds represented in count */
static int exclusiveCount(int c) { return c & EXCLUSIVE_MASK; }
```

从代码中获取读写状态可以看出其是把state（int32位）字段分成高16位与低16位，其中高16位表示读锁个数，低16位表示写锁个数，如下图所示（图来自Java并发编程艺术）。

![读写锁状态获取](https://oscimg.oschina.net/oscnet/46fde3fea314277b2dbdd598564a67ec5a7.jpg)

该图表示当前一个线程获取到了写锁，并且重入了两次，因此低16位是3，并且该线程又获取了读锁，并且重入了一次，所以高16位是2，当写锁被获取时如果读锁不为0那么读锁一定是获取写锁的这个线程。

## 读锁的获取

读锁的获取主要实现是AQS中的acquireShared方法，其调用过程如下代码。

### 清单3：读锁获取入口

```java
// ReadLock
public void lock() {
    sync.acquireShared(1);
}
// AQS
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

其中doAcquireShared(arg)方法是获取失败之后AQS中入队操作，等待被唤醒后重新获取，那么关键点就是tryAcquireShared(arg)方法，方法有点长，因此先总结出获取读锁所经历的步骤，获取的第一部分步骤如下：

操作1：读写需要互斥，因此当存在写锁并且持有写锁的线程不是该线程时获取失败。

操作2：是否存在等待写锁的线程，存在的话则获取读锁需要等待，避免写锁饥饿。(写锁优先级是比较高的)

操作3：CAS获取读锁，实际上是state字段的高16位自增。

操作4：获取成功后再ThreadLocal中记录当前线程获取读锁的次数。

### 清单4：读锁获取的第一部分

```java
protected final int tryAcquireShared(int unused) {
    Thread current = Thread.currentThread();
    int c = getState();
    // 操作1：存在写锁，并且写锁不是当前线程则直接去排队
    if (exclusiveCount(c) != 0 &&
        getExclusiveOwnerThread() != current)
        return -1;
    int r = sharedCount(c);
    // 操作2：读锁是否该阻塞，对于非公平模式下写锁获取优先级会高，如果存在要获取写锁的线程则读锁需要让步，公平模式下则先来先到
    if (!readerShouldBlock() && 
        // 读锁使用高16位，因此存在获取上限为2^16-1
        r < MAX_COUNT &&
        // 操作3：CAS修改读锁状态，实际上是读锁状态+1
        compareAndSetState(c, c + SHARED_UNIT)) {
        // 操作4：执行到这里说明读锁已经获取成功，因此需要记录线程状态。
        if (r == 0) {
            firstReader = current; // firstReader是把读锁状态从0变成1的那个线程
            firstReaderHoldCount = 1;
        } else if (firstReader == current) { 
            firstReaderHoldCount++;
        } else {
            // 这些代码实际上是从ThreadLocal中获取当前线程重入读锁的次数，然后自增下。
            HoldCounter rh = cachedHoldCounter; // cachedHoldCounter是上一个获取锁成功的线程
            if (rh == null || rh.tid != getThreadId(current))
                cachedHoldCounter = rh = readHolds.get();
            else if (rh.count == 0)
                readHolds.set(rh);
            rh.count++;
        }
        return 1;
    }
    // 当操作2，操作3失败时执行该逻辑
    return fullTryAcquireShared(current);
}
```

当操作2，操作3失败时会执行fullTryAcquireShared(current)，为什么会这样写呢？

个人认为是一种补偿操作，操作2与操作3失败并不代表当前线程没有读锁的资格，并且这里的读锁是共享锁，有资格就应该被获取成功，因此给予补偿获取读锁的操作。

在fullTryAcquireShared(current)中是一个循环获取读锁的过程，大致步骤如下：

操作5：等同于操作2，存在写锁，且写锁线程并非当前线程则直接返回失败

操作6：当前线程是重入读锁，这里只会偏向第一个获取读锁的线程以及最后一个获取读锁的线程，其他都需要去AQS中排队。

操作7：CAS改变读锁状态

操作8：同操作4，获取成功后再ThreadLocal中记录当前线程获取读锁的次数。

### 清单5：读锁获取的第二部分

```java
final int fullTryAcquireShared(Thread current) {
    HoldCounter rh = null;
    // 最外层嵌套循环
    for (;;) {
        int c = getState();
        // 操作5：存在写锁，且写锁并非当前线程则直接返回失败
        if (exclusiveCount(c) != 0) {
            if (getExclusiveOwnerThread() != current)
                return -1;
            // else we hold the exclusive lock; blocking here
            // would cause deadlock.
        // 操作6：如果当前线程是重入读锁则放行
        } else if (readerShouldBlock()) {
            // Make sure we're not acquiring read lock reentrantly
            // 当前是firstReader，则直接放行,说明是已获取的线程重入读锁
            if (firstReader == current) {
                // assert firstReaderHoldCount > 0;
            } else {
                // 执行到这里说明是其他线程，如果是cachedHoldCounter（其count不为0）也就是上一个获取锁的线程则可以重入，否则进入AQS中排队
                // **这里也是对写锁的让步**，如果队列中头结点为写锁，那么当前获取读锁的线程要进入队列中排队
                if (rh == null) {
                    rh = cachedHoldCounter;
                    if (rh == null || rh.tid != getThreadId(current)) {
                        rh = readHolds.get();
                        if (rh.count == 0)
                            readHolds.remove();
                    }
                }
                // 说明是上述刚初始化的rh，所以直接去AQS中排队
                if (rh.count == 0)
                    return -1;
            }
        }
        if (sharedCount(c) == MAX_COUNT)
            throw new Error("Maximum lock count exceeded");
        // 操作7：修改读锁状态，实际上读锁自增操作
        if (compareAndSetState(c, c + SHARED_UNIT)) {
            // 操作8：对ThreadLocal中维护的获取锁次数进行更新。
            if (sharedCount(c) == 0) {
                firstReader = current;
                firstReaderHoldCount = 1;
            } else if (firstReader == current) {
                firstReaderHoldCount++;
            } else {
                if (rh == null)
                    rh = cachedHoldCounter;
                if (rh == null || rh.tid != getThreadId(current))
                    rh = readHolds.get();
                else if (rh.count == 0)
                    readHolds.set(rh);
                rh.count++;
                cachedHoldCounter = rh; // cache for release
            }
            return 1;
        }
    }
}
```

## 读锁的释放

### 清单6：读锁释放入口

```java
// ReadLock
public void unlock() {
    sync.releaseShared(1);
}
// Sync
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared(); // 这里实际上是释放读锁后唤醒写锁的线程操作
        return true;
    }
    return false;
}
```

读锁的释放主要是tryReleaseShared(arg)函数，因此拆解其步骤如下：

操作1：清理ThreadLocal中保存的获取锁数量信息

操作2：CAS修改读锁个数，实际上是自减一

### 清单7：读锁的释放流程

```java
protected final boolean tryReleaseShared(int unused) {
    Thread current = Thread.currentThread();
    // 操作1：清理ThreadLocal对应的信息
    if (firstReader == current) {;
        if (firstReaderHoldCount == 1)
            firstReader = null;
        else
            firstReaderHoldCount--;
    } else {
        HoldCounter rh = cachedHoldCounter;
        if (rh == null || rh.tid != getThreadId(current))
            rh = readHolds.get();
        int count = rh.count;
        // 已释放完的读锁的线程清空操作
        if (count <= 1) {
            readHolds.remove();
            // 如果没有获取锁却释放则会报该错误
            if (count <= 0)
                throw unmatchedUnlockException();
        }
        --rh.count;
    }
    // 操作2：循环中利用CAS修改读锁状态
    for (;;) {
        int c = getState();
        int nextc = c - SHARED_UNIT;
        if (compareAndSetState(c, nextc))
            // Releasing the read lock has no effect on readers,
            // but it may allow waiting writers to proceed if
            // both read and write locks are now free.
            return nextc == 0;
    }
}
```

## 写锁的获取

### 清单8：写锁的获取入口

```java
// WriteLock
public void lock() {
  sync.acquire(1);
}

// AQS
public final void acquire(int arg) {
    // 尝试获取，获取失败后入队，入队失败则interrupt当前线程
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

写锁的获取也主要是tryAcquire(arg)方法，这里也拆解步骤：

操作1：如果读锁数量不为0或者写锁数量不为0，并且不是重入操作，则获取失败。

操作2：如果当前锁的数量为0，也就是不存在操作1的情况，那么该线程是有资格获取到写锁，因此修改状态，设置独占线程为当前线程

### 清单9：写锁的获取

```java
protected final boolean tryAcquire(int acquires) {
    Thread current = Thread.currentThread();
    int c = getState();
    int w = exclusiveCount(c);
    // 操作1：c != 0，说明存在读锁或者写锁
    if (c != 0) {
        // (Note: if c != 0 and w == 0 then shared count != 0)  
        // 写锁为0，读锁不为0 或者获取写锁的线程并不是当前线程，直接失败
        if (w == 0 || current != getExclusiveOwnerThread())
            return false;
        if (w + exclusiveCount(acquires) > MAX_COUNT)
            throw new Error("Maximum lock count exceeded");
        // Reentrant acquire
        // 执行到这里说明是写锁线程的重入操作，直接修改状态，也不需要CAS因为没有竞争
        setState(c + acquires);
        return true;
    }
    // 操作2：获取写锁，writerShouldBlock对于非公平模式直接返回fasle，对于公平模式则线程需要排队，因此需要阻塞。
    if (writerShouldBlock() ||
        !compareAndSetState(c, c + acquires))
        return false;
    setExclusiveOwnerThread(current);
    return true;
}
```

## 写锁的释放

### 清单10：写锁的释放入口

```java
// WriteLock
public void unlock() {
       sync.release(1);
}

// AQS
public final boolean release(int arg) {
    // 释放锁成功后唤醒队列中第一个线程
    if (tryRelease(arg)) {
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

写锁的释放主要是tryRelease(arg)方法，其逻辑就比较简单了，注释很详细。

### 清单11：写锁的释放

```java
protected final boolean tryRelease(int releases) {
     // 如果当前线程没有获取写锁却释放，则直接抛异常
     if (!isHeldExclusively())
         throw new IllegalMonitorStateException();
     // 状态变更至nextc
     int nextc = getState() - releases;
     // 因为写锁是可以重入，所以在都释放完毕后要把独占标识清空
     boolean free = exclusiveCount(nextc) == 0;
     if (free)
         setExclusiveOwnerThread(null);
     // 修改状态
     setState(nextc);
     return free;
}
```

## 锁降级操作哪里体现？

锁降级操作指的是一个线程获取写锁之后再获取读锁，然后读锁释放掉写锁的过程。

在tryAcquireShared(arg)获取读锁的代码中有如下代码。

### 清单12：写锁降级策略

```java
Thread current = Thread.currentThread();
// 当前状态
int c = getState();
// 存在写锁，并且写锁不等于当前线程时返回，换句话说等写锁为当前线程时则可以继续往下获取读锁。
if (exclusiveCount(c) != 0 &&
    getExclusiveOwnerThread() != current)
    return -1;
```

### 那么锁降级有什么用？

答案是为了可见性的保证。

在ReentrantReadWriteLock的javadoc中有如下代码，其是锁降级的一个应用示例。

```java
class CachedData {
  Object data;
  volatile boolean cacheValid;
  final ReentrantReadWriteLock rwl = new ReentrantReadWriteLock();
 
  void processCachedData() {
    // 获取读锁
    rwl.readLock().lock();
    if (!cacheValid) {
      // Must release read lock before acquiring write lock，不释放的话下面写锁会获取不成功，造成死锁
      rwl.readLock().unlock();
     // 获取写锁
      rwl.writeLock().lock();
      try {
        // Recheck state because another thread might have
        // acquired write lock and changed state before we did.
        if (!cacheValid) {
          data = ...
          cacheValid = true;
        }
        // Downgrade by acquiring read lock before releasing write lock
        // 这里再次获取读锁，如果不获取那么当写锁释放后可能其他写线程再次获得写锁，导致下方`use(data)`时出现不一致的现象
        // 这个操作就是降级
        rwl.readLock().lock();
      } finally {
        rwl.writeLock().unlock(); // Unlock write, still hold read
      }
    }

    try {
    // 使用完后释放读锁
      use(data);
    } finally {
      rwl.readLock().unlock();
    }
  }
 }}
```

## 公平与非公平的区别

### 清单13：公平下的Sync

```java
static final class FairSync extends Sync {
     private static final long serialVersionUID = -2274990926593161451L;
     final boolean writerShouldBlock() {
         return hasQueuedPredecessors(); // 队列中是否有元素，有则当前操作需要block
     }
     final boolean readerShouldBlock() {
         return hasQueuedPredecessors();// 队列中是否有元素，有则当前操作需要block
     }
}
```

公平下的Sync实现策略是所有获取的读锁或者写锁的线程都需要入队排队，按照顺序依次去尝试获取锁。

### 清单14：非公平下的Sync

```java
static final class NonfairSync extends Sync {
    private static final long serialVersionUID = -8159625535654395037L;
    final boolean writerShouldBlock() {
        // 非公平下不考虑排队，因此写锁可以竞争获取
        return false; // writers can always barge
    }
    final boolean readerShouldBlock() {
        /* As a heuristic to avoid indefinite writer starvation,
         * block if the thread that momentarily appears to be head
         * of queue, if one exists, is a waiting writer.  This is
         * only a probabilistic effect since a new reader will not
         * block if there is a waiting writer behind other enabled
         * readers that have not yet drained from the queue.
         */
        // 这里实际上是一个优先级，如果队列中头部元素时写锁，那么读锁需要等待，避免写锁饥饿。
        return apparentlyFirstQueuedIsExclusive();
    }
}
```

非公平下由于抢占式获取锁，写锁是可能产生饥饿，因此解决办法就是提高写锁的优先级，换句话说获取写锁之前先占坑。

# 小结

本文回顾了可重入锁 ReentrantLock，引入了读场景多时性能更加优异的可重入读写锁 ReentrantReadWriteLock。

从类的介绍使用，深入到源码解析，希望给各位极客们带来全面的认识。下一节我们将一起学习下比 ReentrantReadWriteLock 性能更好的锁，你知道是什么吗？

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马写作的最大动力！


---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# ReadWriteLock

## 接口

```java
public interface ReadWriteLock {
    /**
     * Returns the lock used for reading.
     *
     * @return the lock used for reading
     */
    Lock readLock();

    /**
     * Returns the lock used for writing.
     *
     * @return the lock used for writing
     */
    Lock writeLock();
}
```

# 简单实现

根据上面理论可以利用两个int变量来简单实现一个读写锁，实现虽然烂，但是原理都是差不多的，值得阅读下。

## 示例代码

```java
public class ReadWriteLock {
  /**
   * 读锁持有个数
   */
  private int readCount = 0;
  /**
   * 写锁持有个数
   */
  private int writeCount = 0;

  /**
   * 获取读锁,读锁在写锁不存在的时候才能获取
   */
  public synchronized void lockRead() throws InterruptedException {
    // 写锁存在,需要wait
    while (writeCount > 0) {
      wait();
    }
    readCount++;
  }

  /**
   * 释放读锁
   */
  public synchronized void unlockRead() {
    readCount--;
    notifyAll();
  }

  /**
   * 获取写锁,当读锁存在时需要wait.
   */
  public synchronized void lockWrite() throws InterruptedException {
    // 先判断是否有写请求
    while (writeCount > 0) {
      wait();
    }

    // 此时已经不存在获取写锁的线程了,因此占坑,防止写锁饥饿
    writeCount++;

    // 读锁为0时获取写锁
    while (readCount > 0) {
      wait();
    }
  }

  /**
   * 释放读锁
   */
  public synchronized void unlockWrite() {
    writeCount--;
    notifyAll();
  }

}
```

## 简单分析

ReadWriteLock类中，读锁和写锁各有一个获取锁和释放锁的方法。

读锁的实现在lockRead()中,只要没有线程拥有写锁（writers==0），且没有线程在请求写锁（writeRequests ==0），所有想获得读锁的线程都能成功获取。

写锁的实现在lockWrite()中,当一个线程想获得写锁的时候，首先会把写锁请求数加1（writeRequests++），然后再去判断是否能够真能获得写锁，当没有线程持有读锁（readers==0 ）,且没有线程持有写锁（writers==0）时就能获得写锁。有多少线程在请求写锁并无关系。

## notifyAll() 的作用

需要注意的是，在两个释放锁的方法（unlockRead，unlockWrite）中，都调用了notifyAll方法，而不是notify。

要解释这个原因，我们可以想象下面一种情形：

如果有线程在等待获取读锁，同时又有线程在等待获取写锁。如果这时其中一个等待读锁的线程被notify方法唤醒，但因为此时仍有请求写锁的线程存在（writeRequests>0），所以被唤醒的线程会再次进入阻塞状态。然而，等待写锁的线程一个也没被唤醒，就像什么也没发生过一样（译者注：信号丢失现象）。如果用的是notifyAll方法，所有的线程都会被唤醒，然后判断能否获得其请求的锁。

用notifyAll还有一个好处。如果有多个读线程在等待读锁且没有线程在等待写锁时，调用unlockWrite()后，所有等待读锁的线程都能立马成功获取读锁 —— 而不是一次只允许一个。

# 锁的可重入性

## 读写锁的可重入性原理

上面实现的读/写锁(ReadWriteLock) 是不可重入的，当一个已经持有写锁的线程再次请求写锁时，就会被阻塞。

原因是已经有一个写线程了——就是它自己。

此外，考虑下面的例子：

1. Thread 1 获得了读锁

2. Thread 2 请求写锁，但因为Thread 1 持有了读锁，所以写锁请求被阻塞。

3. Thread 1 再想请求一次读锁，但因为Thread 2处于请求写锁的状态，所以想再次获取读锁也会被阻塞。

上面这种情形使用前面的ReadWriteLock就会被锁定——一种类似于死锁的情形。不会再有线程能够成功获取读锁或写锁了。

为了让ReadWriteLock可重入，需要对它做一些改进。

下面会分别处理读锁的重入和写锁的重入

## 读锁实现

### 规则

为了让ReadWriteLock的读锁可重入，我们要先为读锁重入建立规则：

1. 要保证某个线程中的读锁可重入，要么满足获取读锁的条件（没有写或写请求），要么已经持有读锁（不管是否有写请求）。

2. 要确定一个线程是否已经持有读锁，可以用一个map来存储已经持有读锁的线程以及对应线程获取读锁的次数，当需要判断某个线程能否获得读锁时，就利用map中存储的数据进行判断。

### 实现

下面是方法lockRead和unlockRead修改后的的代码：

```java
public class ReadWriteLock{
	private Map<Thread, Integer> readingThreads =
		new HashMap<Thread, Integer>();

	private int writers = 0;
	private int writeRequests = 0;

	public synchronized void lockRead() 
		throws InterruptedException{
		Thread callingThread = Thread.currentThread();
		while(! canGrantReadAccess(callingThread)){
			wait();                                                                   
		}

		readingThreads.put(callingThread,
			(getAccessCount(callingThread) + 1));
	}

	public synchronized void unlockRead(){
		Thread callingThread = Thread.currentThread();
		int accessCount = getAccessCount(callingThread);
		if(accessCount == 1) { 
			readingThreads.remove(callingThread); 
		} else {
			readingThreads.put(callingThread, (accessCount -1)); 
		}
		notifyAll();
	}

	private boolean canGrantReadAccess(Thread callingThread){
		if(writers > 0) return false;
		if(isReader(callingThread) return true;
		if(writeRequests > 0) return false;
		return true;
	}

	private int getReadAccessCount(Thread callingThread){
		Integer accessCount = readingThreads.get(callingThread);
		if(accessCount == null) return 0;
		return accessCount.intValue();
	}

	private boolean isReader(Thread callingThread){
		return readingThreads.get(callingThread) != null;
	}
}
```

代码中我们可以看到，只有在没有线程拥有写锁的情况下才允许读锁的重入。

此外，重入的读锁比写锁优先级高。

## 写锁重入

### 规则

1. 仅当一个线程已经持有写锁，才允许写锁重入（再次获得写锁）。

### 实现

下面是方法lockWrite和unlockWrite修改后的的代码。

```java
public class ReadWriteLock{
	private Map<Thread, Integer> readingThreads =
		new HashMap<Thread, Integer>();

	private int writeAccesses    = 0;
	private int writeRequests    = 0;
	private Thread writingThread = null;

	public synchronized void lockWrite() 
		throws InterruptedException{
		writeRequests++;
		Thread callingThread = Thread.currentThread();
		while(!canGrantWriteAccess(callingThread)){
			wait();
		}
		writeRequests--;
		writeAccesses++;
		writingThread = callingThread;
	}

	public synchronized void unlockWrite() 
		throws InterruptedException{
		writeAccesses--;
		if(writeAccesses == 0){
			writingThread = null;
		}
		notifyAll();
	}

	private boolean canGrantWriteAccess(Thread callingThread){
		if(hasReaders()) return false;
		if(writingThread == null)    return true;
		if(!isWriter(callingThread)) return false;
		return true;
	}

	private boolean hasReaders(){
		return readingThreads.size() > 0;
	}

	private boolean isWriter(Thread callingThread){
		return writingThread == callingThread;
	}
}
```

注意在确定当前线程是否能够获取写锁的时候，是如何处理的。

# 读锁升级到写锁

有时，我们希望一个拥有读锁的线程，也能获得写锁。

想要允许这样的操作，要求这个线程是唯一一个拥有读锁的线程。

`canGrantWriteAccess()` 需要做点改动来达到这个目的：

```java
public class ReadWriteLock{
	private Map<Thread, Integer> readingThreads =
		new HashMap<Thread, Integer>();

	private int writeAccesses    = 0;
	private int writeRequests    = 0;
	private Thread writingThread = null;

	public synchronized void lockWrite() 
		throws InterruptedException{
		writeRequests++;
		Thread callingThread = Thread.currentThread();
		while(!canGrantWriteAccess(callingThread)){
			wait();
		}
		writeRequests--;
		writeAccesses++;
		writingThread = callingThread;
	}

	public synchronized void unlockWrite() throws InterruptedException{
		writeAccesses--;
		if(writeAccesses == 0){
			writingThread = null;
		}
		notifyAll();
	}

	private boolean canGrantWriteAccess(Thread callingThread){
		if(isOnlyReader(callingThread)) return true;
		if(hasReaders()) return false;
		if(writingThread == null) return true;
		if(!isWriter(callingThread)) return false;
		return true;
	}

	private boolean hasReaders(){
		return readingThreads.size() > 0;
	}

	private boolean isWriter(Thread callingThread){
		return writingThread == callingThread;
	}

	private boolean isOnlyReader(Thread thread){
		return readers == 1 && readingThreads.get(callingThread) != null;
	}
}
```

现在ReadWriteLock类就可以从读锁升级到写锁了。

# 写锁降级到读锁

有时拥有写锁的线程也希望得到读锁。如果一个线程拥有了写锁，那么自然其它线程是不可能拥有读锁或写锁了。

所以对于一个拥有写锁的线程，再获得读锁，是不会有什么危险的。

我们仅仅需要对上面canGrantReadAccess方法进行简单地修改：

```java
public class ReadWriteLock{
       private boolean canGrantReadAccess(Thread callingThread){
       	if(isWriter(callingThread)) return true;
       	if(writingThread != null) return false;
       	if(isReader(callingThread) return true;
       	if(writeRequests > 0) return false;
       	return true;
       }
}
```

# 拓展阅读

[StampedLock-读写锁中的性能之王](https://houbb.github.io/2019/01/18/jcip-37-stamped-lock)

[AQS](https://houbb.github.io/2020/10/17/lock-06-aqs-source-code)

# 参考资料

《Java并发编程实战》 P250

[Java并发编程之显示锁ReentrantLock和ReadWriteLock读写锁](https://www.jb51.net/article/64012.htm)

[java中的读写锁](https://www.jianshu.com/p/ab836f5e501e)

https://www.cnblogs.com/memoryXudy/p/readWriteMathod.html

https://liuyanzhao.com/7778.html

[【Java并发】ReadWriteLock读写锁的使用](https://www.jianshu.com/p/9cd5212c8841)

[Java 读写锁](https://www.jianshu.com/p/90f760df3fd6)

[Java处理多人同时读写文件的文件锁处理](https://blog.csdn.net/gxy3509394/article/details/7435993)

http://developer.51cto.com/art/201511/495995.htm

- 源码分析

[ReentrantReadWriteLock](https://my.oschina.net/editorial-story/blog/1928306)

[Java并发——读写锁ReentrantReadWriteLock](https://juejin.im/post/5b5f275ce51d451964627877)

- StampedLock

[Java并发（8）- 读写锁中的性能之王：StampedLock](https://juejin.im/post/5bacf523f265da0a951ee418)

[stampedlocks](https://blog.overops.com/java-8-stampedlocks-vs-readwritelocks-and-synchronized/)

* any list
{:toc}
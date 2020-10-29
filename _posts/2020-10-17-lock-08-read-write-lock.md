---
layout: post
title:  锁专题（8）java 从零手写实现 ReadWriteLock 读写锁 
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, hand-write, sf]
published: true
---

> 点赞再看，已成习惯。

# 序言

我们在前面的文章中详细介绍了 jdk 自带的可重入读写锁使用及其源码。

本节就让我们一起来实现一个读写锁。

# 最基础的版本

## 思路

我们先实现一个最基础版本的读写锁，便于大家理接最核心的部分。

后续将在这个基础上持续优化。

## 接口定义

为了后续拓展，我们统一定义基础的接口，一共 4 个方法：

```java
package com.github.houbb.lock.api.core;

/**
 * 读写锁定义接口
 * @author binbin.hou
 * @since 0.0.2
 */
public interface IReadWriteLock {

    /**
     * 获取读锁
     * @since 0.0.2
     */
    void lockRead();

    /**
     * 释放读锁
     */
    void unlockRead();

    /**
     * 获取写锁
     * @since 0.0.2
     */
    void lockWrite();

    /**
     * 释放写锁
     */
    void unlockWrite();

}
```

## 类定义

```java
/**
 * 读写锁实现
 *
 * @author binbin.hou
 * @since 0.0.2
 */
public class LockReadWrite implements IReadWriteLock {

    private static final Log log = LogFactory.getLog(LockReadWrite.class);

    /**
     * 读次数统计
     */
    private int readCount = 0;

    /**
     * 写次数统计
     */
    private int writeCount = 0;

}
```

我们这里实现 IReadWriteLock 接口，LockReadWrite 定义了两个属性，用于计算读写的次数。


## 获取读锁

这里通过 tryLock 获取读锁，通过 wait 进入等待。

如果获取读锁成功，则 readCount++，这个值主要用于标识是否有读操作。

```java
/**
 * 获取读锁,读锁在写锁不存在的时候才能获取
 *
 * @since 0.0.2
 */
@Override
public synchronized void lockRead() {
    try {
        // 写锁存在,需要wait
        while (!tryLockRead()) {
            wait();
        }
        readCount++;
    } catch (InterruptedException e) {
        Thread.interrupted();
        // 忽略打断
    }
}

/**
 * 尝试获取读锁
 *
 * @return 是否成功
 * @since 0.0.2
 */
private boolean tryLockRead() {
    if (writeCount > 0) {
        log.debug("当前有写锁，获取读锁失败");
        return false;
    }
    return true;
}
```

tryLockRead 尝试获取读锁，读写互斥，读读不互斥，所以有写锁操作的时候，会导致获取读锁失败。


## 释放读锁

释放读锁的操作非常简单，直接 readCount-1，然后唤醒所有等待的线程。

```java
/**
 * 释放读锁
 *
 * @since 0.0.2
 */
@Override
public synchronized void unlockRead() {
    readCount--;
    notifyAll();
}
```

## 获取写锁

尝试获取写锁的条件和读写有一些差异：

**写操作和读写操作都是互斥的**，所以当前如果存在其他操作，都会获取锁失败。

```java
/**
 * 获取写锁
 *
 * @since 0.0.2
 */
@Override
public synchronized void lockWrite() {
    try {
        // 写锁存在,需要wait
        while (!tryLockWrite()) {
            wait();
        }
        // 此时已经不存在获取写锁的线程了,因此占坑,防止写锁饥饿
        writeCount++;
    } catch (InterruptedException e) {
        Thread.interrupted();
    }
}

/**
 * 尝试获取写锁
 *
 * @return 是否成功
 * @since 0.0.2
 */
private boolean tryLockWrite() {
    if (writeCount > 0) {
        log.debug("当前有其他写锁，获取写锁失败");
        return false;
    }
    // 读锁
    if (readCount > 0) {
        log.debug("当前有其他读锁，获取写锁失败。");
        return false;
    }
    return true;
}
```

## 释放写锁

释放写锁的操作也非常简单，写操作计数器-1，并且唤醒所有的等待线程。

```java
/**
 * 释放写锁
 *
 * @since 0.0.2
 */
@Override
public synchronized void unlockWrite() {
    writeCount--;
    notifyAll();
}
```

### 思考

为什么使用 notifyAll() 而不是 notify()?

要解释这个原因，我们可以想象下面一种情形：

如果有线程在等待获取读锁，同时又有线程在等待获取写锁。如果这时其中一个等待读锁的线程被notify方法唤醒，但因为此时仍有请求写锁的线程存在（writeRequests>0），所以被唤醒的线程会再次进入阻塞状态。然而，等待写锁的线程一个也没被唤醒，就像什么也没发生过一样（译者注：信号丢失现象）。如果用的是notifyAll方法，所有的线程都会被唤醒，然后判断能否获得其请求的锁。

用notifyAll还有一个好处。如果有多个读线程在等待读锁且没有线程在等待写锁时，调用unlockWrite()后，所有等待读锁的线程都能立马成功获取读锁 —— 而不是一次只允许一个。

# 锁是属于谁的？

## 问题

上面的实现是一个最基本的读写锁实现流程，但是存在一个很大的问题，没有校验释放锁的归属权问题。

想想你正在带薪，忽然一位哥们把你的们直接打开了，多尴尬。

所以我们需要通过 CAS 进行比较是否为预期的线程信息，然后才能进行替换和锁的释放等操作。

## 类定义

我们重新实现一个可以校验锁归属的实现读写锁实现：

```java

/**
 * 读写锁实现-保证释放锁时为锁的持有者
 *
 * @author binbin.hou
 * @since 0.0.2
 */
public class LockReadWriteOwner implements IReadWriteLock {

    private static final Log log = LogFactory.getLog(LockReadWriteOwner.class);

    /**
     * 如果使用类似 write 的方式，会导致读锁只能有一个。
     * 调整为使用 HashMap 存放读的信息
     *
     * @since 0.0.2
     */
    private final Map<Thread, Integer> readCountMap = new HashMap<>();

    /**
     * volatile 引用，保证线程间的可见性+易变性
     *
     * @since 0.0.2
     */
    private final AtomicReference<Thread> writeOwner = new AtomicReference<>();

    /**
     * 写次数统计
     */
    private int writeCount = 0;

}
```

## 获取读锁

```java
/**
 * 获取读锁,读锁在写锁不存在的时候才能获取
 *
 * @since 0.0.2
 */
@Override
public synchronized void lockRead() {
    try {
        // 写锁存在,需要wait
        while (!tryLockRead()) {
            log.debug("获取读锁失败，进入等待状态。");
            wait();
        }
    } catch (InterruptedException e) {
        Thread.interrupted();
    }
}

/**
 * 尝试获取读锁
 *
 * 读锁之间是不互斥的，这里后续需要优化。
 *
 * @return 是否成功
 * @since 0.0.2
 */
private boolean tryLockRead() {
    if (writeCount > 0) {
        log.debug("当前有写锁，获取读锁失败");
        return false;
    }
    Thread currentThread = Thread.currentThread();
    // 次数暂时固定为1，后面如果实现可重入，这里可以改进。
    this.readCountMap.put(currentThread, 1);
    return true;
}
```

每次尝试获取读锁的时候，我们都将当前线程作为 key 放入 readCountMap 中，对应的值暂时为1。


## 释放读锁

释放读锁的时候，我们就会进行归属权校验。

如果获取失败，则说明不是当前锁的持有者，则直接释放失败。

```java
/**
 * 释放读锁
 *
 * @since 0.0.2
 */
@Override
public synchronized void unlockRead() {
    Thread currentThread = Thread.currentThread();
    Integer readCount = readCountMap.get(currentThread);
    if (readCount == null) {
        throw new RuntimeException("当前线程未持有任何读锁，释放锁失败！");
    } else {
        log.debug("释放读锁，唤醒所有等待线程。");
        readCountMap.remove(currentThread);
        notifyAll();
    }
}
```

## 获取写锁

```java
/**
 * 获取写锁
 *
 * @since 0.0.2
 */
@Override
public synchronized void lockWrite() {
    try {
        // 写锁存在,需要wait
        while (!tryLockWrite()) {
            wait();
        }
        // 此时已经不存在获取写锁的线程了,因此占坑,防止写锁饥饿
        writeCount++;
    } catch (InterruptedException e) {
        Thread.interrupted();
    }
}

/**
 * 尝试获取写锁
 *
 * @return 是否成功
 * @since 0.0.2
 */
private boolean tryLockWrite() {
    if (writeCount > 0) {
        log.debug("当前有其他写锁，获取写锁失败");
        return false;
    }
    // 读锁
    if (!readCountMap.isEmpty()) {
        log.debug("当前有其他读锁，获取写锁失败。");
        return false;
    }
    Thread currentThread = Thread.currentThread();
    boolean result = writeOwner.compareAndSet(null, currentThread);
    log.debug("尝试获取写锁结果：{}", result);
    return result;
}
```

尝试获取写锁时，判断是否有写的条件不变。

如果 readCountMap 不为空，则说明存在写锁。

通过 CAS 设置对应的写线程持有信息，返回是否设置成功。

## 释放写锁

释放写锁的逻辑和原来类似，只不过添加了一个 owner 持有权的校验。

```java
/**
 * 释放写锁
 *
 * @since 0.0.2
 */
@Override
public synchronized void unlockWrite() {
    boolean toNullResult = writeOwner.compareAndSet(Thread.currentThread(), null);
    if (toNullResult) {
        writeCount--;
        log.debug("写锁释放，唤醒所有等待线程。");
        notifyAll();
    } else {
        throw new RuntimeException("释放写锁失败");
    }
}
```

# 可重入的支持

## 说明

我们上一小节实现了一个支持验证锁持有者的读写锁。

下面来看一下如何实现一个可重入的读写锁。

## 类定义

```java
/**
 * 读写锁实现-可重入锁
 *
 * @author binbin.hou
 * @since 0.0.2
 */
public class LockReadWriteRe implements IReadWriteLock {

    private static final Log log = LogFactory.getLog(LockReadWriteRe.class);

    /**
     * 如果使用类似 write 的方式，会导致读锁只能有一个。
     * 调整为使用 HashMap 存放读的信息
     *
     * @since 0.0.2
     */
    private final Map<Thread, Integer> readCountMap = new HashMap<>();

    /**
     * volatile 引用，保证线程间的可见性+易变性
     *
     * @since 0.0.2
     */
    private final AtomicReference<Thread> writeOwner = new AtomicReference<>();

    /**
     * 写次数统计
     */
    private int writeCount = 0;

}
```

基本的属性和上一小节是一样的。

## 获取读锁

```java
/**
 * 获取读锁,读锁在写锁不存在的时候才能获取
 *
 * @since 0.0.2
 */
@Override
public synchronized void lockRead() {
    try {
        // 写锁存在,需要wait
        while (!tryLockRead()) {
            log.debug("获取读锁失败，进入等待状态。");
            wait();
        }
    } catch (InterruptedException e) {
        Thread.interrupted();
    }
}

/**
 * 尝试获取读锁
 *
 * 读锁之间是不互斥的，这里后续需要优化。
 * 
 * @return 是否成功
 * @since 0.0.2
 */
private boolean tryLockRead() {
    if (writeCount > 0) {
        log.debug("当前有写锁，获取读锁失败");
        return false;
    }
    Thread currentThread = Thread.currentThread();
    Integer count = readCountMap.get(currentThread);
    if(count == null) {
        count = 0;
    }
    // 可重入实现
    count++;
    this.readCountMap.put(currentThread, count);
    return true;
}
```

这里和以前的区别就是支持可重入，通过 count 来维护每一个线程对应的读总数。

## 释放读锁

```java
/**
 * 释放读锁
 *
 * @since 0.0.2
 */
@Override
public synchronized void unlockRead() {
    Thread currentThread = Thread.currentThread();
    Integer readCount = readCountMap.get(currentThread);
    if (readCount == null) {
        throw new RuntimeException("当前线程未持有任何读锁，释放锁失败！");
    } else {
        readCount--;
        // 已经是最后一次
        if(readCount == 0) {
            readCountMap.remove(currentThread);
        } else {
            readCountMap.put(currentThread, readCount);
        }
        log.debug("释放读锁，唤醒所有等待线程。");
        notifyAll();
    }
}
```

这里每次释放锁，会比较是否为当前锁的持有者。

如果 readCount 已经为0，就直接从 readCountMap 中移除。

## 获取写锁

```java
/**
 * 获取写锁
 *
 * @since 0.0.2
 */
@Override
public synchronized void lockWrite() {
    try {
        // 写锁存在,需要wait
        while (!tryLockWrite()) {
            log.debug("获取写锁失败，进入等待状态。");
            wait();
        }
        // 此时已经不存在获取写锁的线程了,因此占坑,防止写锁饥饿
        writeCount++;
    } catch (InterruptedException e) {
        Thread.interrupted();
    }
}
/**
 * 尝试获取写锁
 *
 * @return 是否成功
 * @since 0.0.2
 */
private boolean tryLockWrite() {
    if (writeCount > 0) {
        log.debug("当前有其他写锁，获取写锁失败");
        return false;
    }
    // 读锁
    if (!readCountMap.isEmpty()) {
        log.debug("当前有其他读锁，获取写锁失败。");
        return false;
    }
    Thread currentThread = Thread.currentThread();
    // 多次重入
    if(writeOwner.get() == currentThread) {
        log.debug("为当前写线程多次重入，直接返回 true。");
        return true;
    }
    boolean result = writeOwner.compareAndSet(null, currentThread);
    log.debug("尝试获取写锁结果：{}", result);
    return result;
}
```

如果当前线程时持有锁的线程，则直接返回 true。

## 释放写锁

释放写锁的时候，支持多次写锁释放。

```java
/**
 * 释放写锁
 *
 * @since 0.0.2
 */
@Override
public synchronized void unlockWrite() {
    Thread currentThread = Thread.currentThread();
    // 多次重入释放（当次数多于1时直接返回，否则需要释放 owner 信息）
    if(writeCount > 1 && (currentThread == writeOwner.get())) {
        log.debug("当前为写锁释放多次重入，直接返回成功。");
        unlockWriteNotify();
        return;
    }
    boolean toNullResult = writeOwner.compareAndSet(currentThread, null);
    if (toNullResult) {
        unlockWriteNotify();
    } else {
        throw new RuntimeException("释放写锁失败");
    }
}

/**
 * 释放写锁并且通知
 */
private synchronized void unlockWriteNotify() {
    writeCount--;
    log.debug("释放写锁成功，唤醒所有等待线程。");
    notifyAll();
}
```

# 小结

本节主要是为了让大家理解一下读写锁的实现原理。

从最基本的实现开始，逐步改进，实现了最基本的一个可重入的读写锁。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

* any list
{:toc}
---
layout: post
title:  锁专题（7）从零手写实现你的 SpinLock 自旋锁及可重入锁
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, hand-write, sf]
published: true
---

> 点赞再看，已成习惯。

# 序言

我们在前面的文章中详细介绍了 jdk 自带的可重入锁使用及其源码。

本节就让我们一起来实现一个可重入锁。

![思维导图](https://p1.pstatp.com/origin/pgc-image/ae36c63186e24b36a2162b86f1f6f74e)

# 接口定义

为了便于后期拓展，我们统一定义接口。

## 接口

继承自 jdk Lock 接口，并且新增了几个常用的方法。

```java
package com.github.houbb.lock.api.core;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;

/**
 * 锁定义
 * @author binbin.hou
 * @since 0.0.1
 */
public interface ILock extends Lock {

    /**
     * 尝试加锁
     * @param time 时间
     * @param unit 当为
     * @param key key
     * @return 返回
     * @throws InterruptedException 异常
     * @since 0.0.1
     */
    boolean tryLock(long time, TimeUnit unit,
                    String key) throws InterruptedException;

    /**
     * 尝试加锁
     * @param key key
     * @return 返回
     * @since 0.0.1
     */
    boolean tryLock(String key);

    /**
     * 解锁
     * @param key key
     * @since 0.0.1
     */
    void unlock(String key);

}
```

## 抽象类

为了便于实现，我们统一定义对应的抽象类：

```java
package com.github.houbb.lock.redis.core;

import com.github.houbb.lock.api.core.ILock;
import com.github.houbb.lock.redis.constant.LockRedisConst;
import com.github.houbb.wait.api.IWait;
import com.github.houbb.wait.core.Waits;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;

/**
 * 抽象实现
 * @author binbin.hou
 * @since 0.0.1
 */
public abstract class AbstractLock implements ILock {

    /**
     * 锁等待
     * @since 0.0.1
     */
    private final IWait wait;

    public AbstractLock() {
        this.wait = Waits.threadSleep();
    }

    protected AbstractLock(IWait wait) {
        this.wait = wait;
    }

    @Override
    public void lock() {
        throw new UnsupportedOperationException();
    }

    @Override
    public void lockInterruptibly() throws InterruptedException {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean tryLock() {
        return tryLock(LockRedisConst.DEFAULT_KEY);
    }

    @Override
    public void unlock() {
        unlock(LockRedisConst.DEFAULT_KEY);
    }

    @Override
    public boolean tryLock(long time, TimeUnit unit, String key) throws InterruptedException {
        long startTimeMills = System.currentTimeMillis();

        // 一次获取，直接成功
        boolean result = this.tryLock(key);
        if(result) {
            return true;
        }

        // 时间判断
        if(time <= 0) {
            return false;
        }
        long durationMills = unit.toMillis(time);
        long endMills = startTimeMills + durationMills;

        // 循环等待
        while (System.currentTimeMillis() < endMills) {
            result = tryLock(key);
            if(result) {
                return true;
            }

            // 等待 1ms
            wait.wait(TimeUnit.MILLISECONDS, 1);
        }
        return false;
    }

    @Override
    public synchronized boolean tryLock(long time, TimeUnit unit) throws InterruptedException {
        return tryLock(time, unit, LockRedisConst.DEFAULT_KEY);
    }

    @Override
    public Condition newCondition() {
        throw new UnsupportedOperationException();
    }

}
```

这里主要是实现一个默认的超时等待，基本上是通用的。

前面实现 redis 的分布式锁时有介绍过。

![自旋锁](https://cdn.pixabay.com/photo/2017/03/03/13/56/key-2114046_1280.jpg)

# 自旋锁实现

## java 实现

### 类定义

我们直接继承自 `AbstractLock` 抽象类。

```java
package com.github.houbb.lock.redis.core;

import com.github.houbb.lock.redis.exception.LockRuntimeException;

import java.util.concurrent.atomic.AtomicReference;

/**
 * 自旋锁
 * @author binbin.hou
 * @since 0.0.2
 */
public class LockSpin extends AbstractLock {

    /**
     * volatile 引用，保证线程间的可见性+易变性
     *
     * @since 0.0.2
     */
    private AtomicReference<Thread> owner =new AtomicReference<>();

}
```

### 加锁

lock 就是一个不断尝试获取锁的方法，直到成功为止才返回。

```java
@Override
public void lock() {
    // 循环等待，直到获取到锁
    while (!tryLock()) {
    }
}

@Override
public boolean tryLock(String key) {
    Thread current = Thread.currentThread();
    // CAS
    return owner.compareAndSet(null, current);
}
```

tryLock() 的实现也比较简单，就是通过 CAS 设置持有者为当前线程。

owner 是通过 AtomicReference 声明，保证 CAS 操作的原子性。

### 解锁实现

解锁的就是一个逆过程，不过这里我们没有做重试，只比较了一次。

通过 CAS，只有当 owner 的持有者为当前线程，且设置为 null 成功时，才返回 true。

释放锁失败，此处直接报错。

```java
@Override
public void unlock(String key) {
    Thread current = Thread.currentThread();
    boolean result = owner.compareAndSet(current, null);
    if(!result) {
        throw new LockRuntimeException("解锁失败");
    }
}
```

## 测试

自旋锁可以说是最简单的锁实现了，我们一起看一下实现的是否符合预期。

### 线程定义

```java
package com.github.houbb.lock.test.core;

import com.github.houbb.lock.api.core.ILock;
import com.github.houbb.lock.redis.core.LockSpin;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class LockSpinThread implements Runnable {

    private final ILock lock = new LockSpin();

    @Override
    public void run() {
        System.out.println("first-lock: " + Thread.currentThread().getId());
        lock.lock();

        System.out.println("second-lock: " + Thread.currentThread().getId());
        lock.lock();
        lock.unlock();
        System.out.println("second-unlock: " + Thread.currentThread().getId());

        lock.unlock();
        System.out.println("first-unlock: " + Thread.currentThread().getId());
    }

}
```

### 测试

```java
public static void main(String[] args) {
    final Runnable runnable = new LockSpinThread();
    new Thread(runnable).start();
    new Thread(runnable).start();
    new Thread(runnable).start();
}
```

我们同时开启 3 个线程，执行。

日志输出：

```
first-lock: 12
first-lock: 14
first-lock: 13
second-lock: 12     // 卡住
```

我们发现在第二次加锁的时候卡住了，这显然不太符合正常的使用习惯。

因为同一个线程，我们认为已经持有锁之后，重复加锁应该是成功的，这个就叫**锁的可重入性**。

但是我们的实现太简单粗暴了，我们第一次加所已经将 owner 设置为当前线程了，再次加锁 `owner.compareAndSet(null, current);` 是无法成功的，因为已经不是预期的 null 值了。

那应该怎么解决呢？

# 自旋锁的可重入版本

## 解决思路

我们引入一个计数器。

如果已经是当前线程持有锁，加锁时，计数器直接加1，并返回成功；解锁时，直接减1即可。

## java 实现

### 类定义

和自旋锁类似，我们新增一个计数器变量。

```java
package com.github.houbb.lock.redis.core;

import com.github.houbb.heaven.util.util.DateUtil;
import com.github.houbb.lock.redis.exception.LockRuntimeException;

import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 自旋锁-可重入
 * @author binbin.hou
 * @since 0.0.2
 */
public class LockSpinRe extends AbstractLock {

    /**
     * volatile 引用，保证线程间的可见性+易变性
     *
     * @since 0.0.2
     */
    private AtomicReference<Thread> owner =new AtomicReference<>();

    /**
     * 计数统计类
     *
     * @since 0.0.2
     */
    private AtomicLong count = new AtomicLong(0);

}
```

### 加锁

lock 时直接重复调用 tryLock 方法，直到加锁成功为止。

```java
@Override
public void lock() {
    // 循环等待，直到获取到锁
    while (!tryLock()) {
        // sleep
        DateUtil.sleep(1);
    }
}

@Override
public boolean tryLock(String key) {
    Thread current = Thread.currentThread();
    // 判断是否已经拥有此锁
    if(current == owner.get()) {
        // 原子性自增 1
        count.incrementAndGet();
        return true;
    }
    // CAS
    return owner.compareAndSet(null, current);
}
```

tryLock 和前面的方法对比，多了一个判断。

如果线程已经拥有此锁，则直接计数器+1,并且返回获取锁成功。

### 解锁

有借有还，再借不难。

解锁也是类似的操作，如果当前线程已经持有锁，且 count 不是 0，直接返回 true。

```java
@Override
public void unlock(String key) {
    Thread current = Thread.currentThread();
    // 可重入实现
    if(owner.get() == current && count.get() != 0) {
        count.decrementAndGet();
        return;
    }
    boolean result = owner.compareAndSet(current, null);
    if(!result) {
        throw new LockRuntimeException("解锁失败");
    }
}
```

## 验证

```java
package com.github.houbb.lock.test.core;

import com.github.houbb.lock.api.core.ILock;
import com.github.houbb.lock.redis.core.LockSpin;
import com.github.houbb.lock.redis.core.LockSpinRe;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class LockSpinReThread implements Runnable {

    private final ILock lock = new LockSpinRe();

    @Override
    public void run() {
        System.out.println("first-lock: " + Thread.currentThread().getId());
        lock.lock();

        System.out.println("second-lock: " + Thread.currentThread().getId());
        lock.lock();
        lock.unlock();
        System.out.println("second-unlock: " + Thread.currentThread().getId());

        lock.unlock();
        System.out.println("first-unlock: " + Thread.currentThread().getId());
    }

    public static void main(String[] args) {
        final Runnable runnable = new LockSpinReThread();
        new Thread(runnable).start();
        new Thread(runnable).start();
        new Thread(runnable).start();
    }

}
```

我们将线程的锁实现换成 LockSpinRe 可重入的自旋锁。

日志输出如下：

```
first-lock: 12
first-lock: 14
first-lock: 13
second-lock: 12
second-unlock: 12
first-unlock: 12
second-lock: 13
second-unlock: 13
first-unlock: 13
second-lock: 14
second-unlock: 14
first-unlock: 14
```

这样就可以全部正常执行完成了。

# 小结

前面我们将结果可重入锁的源码，jdk 中的实现更加严谨，同时也更加复杂。

我们文中做了简单的实现，主要是为了让读者更简单的理解整体的逻辑和思想。

这里留一个思考题，如何使用 wait+notify 实现一个可重入的自旋锁？有思路的小伙伴可以在评论区写下自己的想法。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

* any list
{:toc}
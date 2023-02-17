---
layout: post
title:  java 手写并发框架（二）异步转同步框架封装锁策略
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [concurrency, thread, async, sync, sh]
published: true
---

# 序言

上一节我们学习了异步查询转同步的 7 种实现方式，今天我们就来学习一下，如何对其进行封装，使其成为一个更加便于使用的工具。

思维导图如下：

![异步转同步](https://upload-images.jianshu.io/upload_images/5874675-62f39c3e1912db5d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 拓展阅读

[java 手写并发框架（1）异步查询转同步的 7 种实现方式](https://houbb.github.io/2019/01/18/jcip-42-async-to-sync)

# 异步转同步的便利性

## 实现方式

- 循环等待

- wait & notify

- 使用条件锁

- 使用 CountDownLatch

- 使用 CyclicBarrier

- Future

- Spring EventListener

上一节我们已经对上面的 7 种实现方式进行了详细的介绍，没有看过的同学可以去简单回顾一下。

但是这样个人觉得还是不够方便，懒惰是进步的阶梯。

## 更进一步简化

我们希望达到下面的效果：

```java
@Sync
public String queryId() {
    System.out.println("开始查询");
    return id;
}

@SyncCallback(value = "queryId")
public void queryIdCallback() {
    System.out.println("回调函数执行");
    id = "123";
}
```

通过注解直接需要同步的方法，和回调的方法，代码中直接调用即可。

我们首先实现基于字节码增强的版本，后续将实现整合 spring, springboot 的版本。

# 锁的代码实现

## 锁的定义

我们将原来的实现抽象为加锁和解锁，为了便于拓展，接口定义如下:

```java
package com.github.houbb.sync.api.api;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public interface ISyncLock {

    /**
     * 等待策略
     * @param context 上下文
     * @since 0.0.1
     */
    void lock(final ISyncLockContext context);

    /**
     * 解锁策略
     * @param context 上下文
     * @since 0.0.1
     */
    void unlock(final ISyncUnlockContext context);

}
```

其中上下文加锁和解锁做了区分，不过暂时内容是一样的。

主要是超时时间和单位：

```java
package com.github.houbb.sync.api.api;

import java.util.concurrent.TimeUnit;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public interface ISyncLockContext {

    /**
     * 超时时间
     * @return 结果
     */
    long timeout();

    /**
     * 超时时间单位
     * @return 结果
     */
    TimeUnit timeUnit();

}
```

## 锁策略实现

我们本节主要实现下上一节中的几种锁实现。

目前我们选择其中的是个进行实现：

### wait & notify

```java
package com.github.houbb.sync.core.support.lock;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.sync.api.api.ISyncLock;
import com.github.houbb.sync.api.api.ISyncLockContext;
import com.github.houbb.sync.api.api.ISyncUnlockContext;
import com.github.houbb.sync.api.exception.SyncRuntimeException;

/**
 * 等待通知同步
 *
 * @author binbin.hou
 * @since 0.0.1
 */
public class WaitNotifyLock implements ISyncLock {

    private static final Log log = LogFactory.getLog(WaitNotifyLock.class);

    /**
     * 声明对象
     */
    private final Object lock = new Object();

    @Override
    public synchronized void lock(ISyncLockContext context) {
        synchronized (lock) {
            try {
                long timeoutMills = context.timeUnit().toMillis(context.timeout());
                log.info("进入等待，超时时间为：{}ms", timeoutMills);
                lock.wait(timeoutMills);
            } catch (InterruptedException e) {
                log.error("中断异常", e);
                throw new SyncRuntimeException(e);
            }
        }
    }

    @Override
    public void unlock(ISyncUnlockContext context) {
        synchronized (lock) {
            log.info("唤醒所有等待线程");
            lock.notifyAll();
        }
    }

}
```

加锁的部分比较简单，我们从上下文中获取超时时间和超时单位，直接和上一节内容类似，调用即可。

至于上下文中的信息是怎么来的，我们后续就会讲解。

### 条件锁实现

这个在有了上一节的基础之后也非常简单。

核心流程：

（1）创建锁

（2）获取锁的 condition

（3）执行加锁和解锁

```java
package com.github.houbb.sync.core.support.lock;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.sync.api.api.ISyncLock;
import com.github.houbb.sync.api.api.ISyncLockContext;
import com.github.houbb.sync.api.api.ISyncUnlockContext;

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * 等待通知同步
 *
 * @author binbin.hou
 * @since 0.0.1
 */
public class LockConditionLock implements ISyncLock {

    private static final Log log = LogFactory.getLog(LockConditionLock.class);

    private final Lock lock = new ReentrantLock();

    private final Condition condition = lock.newCondition();

    @Override
    public synchronized void lock(ISyncLockContext context) {
        lock.lock();
        try{
            log.info("程序进入锁定状态");
            condition.await(context.timeout(), context.timeUnit());
        } catch (InterruptedException e) {
            log.error("程序锁定状态异常", e);
        } finally {
            lock.unlock();
        }
    }

    @Override
    public void unlock(ISyncUnlockContext context) {
        lock.lock();
        try{
            log.info("解锁状态，唤醒所有等待线程。");
            condition.signalAll();
        } finally {
            lock.unlock();
        }
    }

}
```

### CountDownLatch 实现

```java
package com.github.houbb.sync.core.support.lock;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.sync.api.api.ISyncLock;
import com.github.houbb.sync.api.api.ISyncLockContext;
import com.github.houbb.sync.api.api.ISyncUnlockContext;

import java.util.concurrent.CountDownLatch;

/**
 * 等待通知同步
 *
 * @author binbin.hou
 * @since 0.0.1
 */
public class CountDownLatchLock implements ISyncLock {

    private static final Log log = LogFactory.getLog(CountDownLatchLock.class);

    /**
     * 闭锁
     * 调用1次，后续方法即可通行。
     */
    private CountDownLatch countDownLatch = new CountDownLatch(1);

    @Override
    public synchronized void lock(ISyncLockContext context) {
        countDownLatch = new CountDownLatch(1);

        try {
            log.info("进入等待，超时时间为：{}，超时单位：{}", context.timeout(),
                    context.timeUnit());
            boolean result = countDownLatch.await(context.timeout(), context.timeUnit());
            log.info("等待结果: {}", result);
        } catch (InterruptedException e) {
            log.error("锁中断异常", e);
        }
    }

    @Override
    public void unlock(ISyncUnlockContext context) {
        log.info("执行 unlock 操作");
        countDownLatch.countDown();
    }

}
```

注意：这里为了保证 countDownLatch 可以多次使用，我们在每一次加锁的时候，都会重新创建 CountDownLatch。

### CyclicBarrierLock 锁实现

```java
package com.github.houbb.sync.core.support.lock;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.sync.api.api.ISyncLock;
import com.github.houbb.sync.api.api.ISyncLockContext;
import com.github.houbb.sync.api.api.ISyncUnlockContext;
import com.github.houbb.sync.api.exception.SyncRuntimeException;

import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.TimeoutException;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class CyclicBarrierLock implements ISyncLock {

    private static final Log log = LogFactory.getLog(CyclicBarrierLock.class);

    private final CyclicBarrier cyclicBarrier = new CyclicBarrier(2);

    @Override
    public synchronized void lock(ISyncLockContext context) {
        try {
            log.info("进入锁定状态, timeout:{}, timeunit: {}",
                    context.timeout(), context.timeUnit());
            cyclicBarrier.await(context.timeout(), context.timeUnit());

            log.info("重置 cyclicBarrier");
            cyclicBarrier.reset();
        } catch (InterruptedException | BrokenBarrierException | TimeoutException e) {
            log.error("锁定时遇到异常", e);
            throw new SyncRuntimeException(e);
        }
    }

    @Override
    public void unlock(ISyncUnlockContext context) {
        try {
            log.info("解锁信息");
            cyclicBarrier.await(context.timeout(), context.timeUnit());
        } catch (InterruptedException | TimeoutException | BrokenBarrierException e) {
            log.error("解锁时遇到异常", e);
        }
    }

}
```

这里和 CountDownLatchLock 的实现非常类似，不过 CyclicBarrier 有一个好处，就是可以复用。

我们在每一次解锁之后，重置一下栅栏：

```java
log.info("重置 cyclicBarrier");
cyclicBarrier.reset();
```

# 锁的工具类

为了简单的生成上述几种锁的实例，我们提供了一个简单的工具类方法：

```java
package com.github.houbb.sync.core.support.lock;

import com.github.houbb.heaven.support.instance.impl.Instances;
import com.github.houbb.sync.api.api.ISyncLock;
import com.github.houbb.sync.api.constant.LockType;

import java.util.HashMap;
import java.util.Map;

/**
 * 锁策略
 * @author binbin.hou
 * @since 0.0.1
 */
public final class Locks {

    private Locks(){}

    /**
     * MAP 信息
     * @since 0.0.1
     */
    private static final Map<LockType, ISyncLock> MAP = new HashMap<>();

    static {
        MAP.put(LockType.WAIT_NOTIFY, waitNotify());
        MAP.put(LockType.COUNT_DOWN_LATCH, countDownLatch());
        MAP.put(LockType.CYCLIC_BARRIER, cyclicBarrier());
        MAP.put(LockType.LOCK_CONDITION, lockCondition());
    }

    /**
     * 获取锁实现
     * @param lockType 锁类型
     * @return 实现
     * @since 0.0.1
     */
    public static ISyncLock getLock(final LockType lockType) {
        return MAP.get(lockType);
    }

    /**
     * @since 0.0.1
     * @return 实现
     */
    private static ISyncLock waitNotify() {
        return Instances.singleton(WaitNotifyLock.class);
    }

    /**
     * @since 0.0.1
     * @return 实现
     */
    private static ISyncLock countDownLatch() {
        return Instances.singleton(CountDownLatchLock.class);
    }

    /**
     * @since 0.0.1
     * @return 实现
     */
    private static ISyncLock lockCondition() {
        return Instances.singleton(LockConditionLock.class);
    }

    /**
     * @since 0.0.1
     * @return 实现
     */
    private static ISyncLock cyclicBarrier() {
        return Instances.singleton(CyclicBarrierLock.class);
    }

}
```

上述的锁实现都是线程安全的，所以全部使用单例模式创建。

LockType 类是一个锁的枚举类，会在注解中使用。

# 小结

好了，到这里我们就把上一节中的常见的 4 种锁策略就封装完成了。

你可能好奇上下文的时间信息哪里来？这些锁又是如何被调用的？

我们将通过注解+字节码增强的方式来实现调用（就是 aop 的原理），由于篇幅原因，字节码篇幅较长，为了阅读体验，实现部分将放在下一节。

感兴趣的可以关注一下，便于实时接收最新内容。

觉得本文对你有帮助的话，欢迎点赞评论收藏转发一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

文中如果链接失效，可以点击 {阅读原文}。

* any list
{:toc}
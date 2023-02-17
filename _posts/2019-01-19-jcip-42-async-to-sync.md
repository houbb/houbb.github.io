---
layout: post
title:  java 手写并发框架（一）异步查询转同步的 7 种实现方式
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [concurrency, thread, async, sync, sh]
published: true
---

# 序言

本节将学习一下如何实现异步查询转同步的方式，共计介绍了 7 种常见的实现方式。

思维导图如下：


![思维导图](https://p1-tt.byteimg.com/origin/pgc-image/db66a071750a433f8f8fb287755a819d?from=pc)


# 异步转同步

## 业务需求

有些接口查询反馈结果是异步返回的，无法立刻获取查询结果。

比如业务开发中我们调用其他系统，但是结果的返回确实通知的。

或者 rpc 实现中，client 调用 server 端，结果也是异步返回的，那么如何同步获取调用结果呢？

- 正常处理逻辑

触发异步操作，然后传递一个唯一标识。

等到异步结果返回，根据传入的唯一标识，匹配此次结果。

- 如何转换为同步

正常的应用场景很多，但是有时候不想做数据存储，只是想简单获取调用结果。

即想达到同步操作的结果，怎么办呢？

## 思路

1. 发起异步操作

2. 在异步结果返回之前，一直等待(可以设置超时)

3. 结果返回之后，异步操作结果统一返回

# 常见的实现方式

- 循环等待

- wait & notify

- 使用条件锁

- 使用 CountDownLatch

- 使用 CyclicBarrier

- Future

- Spring EventListener

下面我们一起来学习下这几种实现方式。

# 循环等待

## 说明

循环等待是最简单的一种实现思路。

我们调用对方一个请求，在没有结果之前一直循环查询即可。

这个结果可以在内存中，也可以放在 redis 缓存或者 mysql 等数据库中。

## 代码实现

### 定义抽象父类

为了便于后面的其他几种实现方式统一，我们首先定义一个抽象父类。

```java
/**
 * 抽象查询父类
 * @author binbin.hou
 * @since 1.0.0
 */
public abstract class AbstractQuery {

    private static final Log log = LogFactory.getLog(AbstractQuery.class);

    protected String result;

    public void asyncToSync() {
        startQuery();
        new Thread(new Runnable() {
            public void run() {
                remoteCall();
            }
        }).start();
        endQuery();
    }

    protected void startQuery() {
        log.info("开始查询...");
    }

    /**
     * 远程调用
     */
    protected void remoteCall() {
        try {
            log.info("远程调用开始");
            TimeUnit.SECONDS.sleep(5);
            result = "success";
            log.info("远程调用结束");
        } catch (InterruptedException e) {
            log.error("远程调用失败", e);
        }
    }

    /**
     * 查询结束
     */
    protected void endQuery() {
        log.info("完成查询，结果为：" + result);
    }

}
```

### 代码实现

实现还是非常简单的，在没有结果之前一直循环。

`TimeUnit.MILLISECONDS.sleep(10);` 这里循环等待的小睡一会儿是比较重要的，避免 cpu 飙升，也可以降低为 1ms，根据自己的业务调整即可。

```java
/**
 * 循环等待
 * @author binbin.hou
 * @since 1.0.0
 */
public class LoopQuery extends AbstractQuery {

    private static final Log log = LogFactory.getLog(LoopQuery.class);

    @Override
    protected void endQuery() {
        try {
            while (StringUtil.isEmpty(result)) {
                //循环等待一下
                TimeUnit.MILLISECONDS.sleep(10);
            }

            //获取结果

            log.info("完成查询，结果为：" + result);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

}
```

### 测试

```java
LoopQuery loopQuery = new LoopQuery();
loopQuery.asyncToSync();
```

- 日志

```
[INFO] [2020-10-08 09:50:43.330] [main] [c.g.h.s.t.d.AbstractQuery.startQuery] - 开始查询...
[INFO] [2020-10-08 09:50:43.331] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用开始
[INFO] [2020-10-08 09:50:48.334] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用结束
[INFO] [2020-10-08 09:50:48.343] [main] [c.g.h.s.t.d.LoopQuery.endQuery] - 完成查询，结果为：success
```

这里可以看到远程调用是 `Thread-0` 线程执行的，远程调用的耗时为 5S。

## 超时特性

### 为什么需要超时时间

上面的实现存在一个问题，那就是循环等待没有超时时间。

我们的一个网络请求，可能存在失败，也可能对方收到请求之后没有正确处理。

所以如果我们一直等待，可能永远也没有结果，或者很久之后才有结果。这在业务上是不可忍受的，所以需要添加一个超时时间。

### 代码实现

```java
/**
 * 循环等待-包含超时时间
 * @author binbin.hou
 * @since 1.0.0
 */
public class LoopTimeoutQuery extends AbstractQuery {

    private static final Log log = LogFactory.getLog(LoopTimeoutQuery.class);

    /**
     * 超时时间
     */
    private long timeoutMills = 3000;

    public LoopTimeoutQuery() {
    }

    public LoopTimeoutQuery(long timeoutMills) {
        this.timeoutMills = timeoutMills;
    }

    @Override
    protected void endQuery() {
        try {
            final long endTimeMills = System.currentTimeMillis() + timeoutMills;

            while (StringUtil.isEmpty(result)) {
                // 超时判断
                if(System.currentTimeMillis() >= endTimeMills) {
                    throw new RuntimeException("请求超时");
                }

                //循环等待一下
                TimeUnit.MILLISECONDS.sleep(10);
            }

            //获取结果

            log.info("完成查询，结果为：" + result);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

}
```

### 测试

```java
LoopTimeoutQuery loopQuery = new LoopTimeoutQuery();
loopQuery.asyncToSync();
```

日志如下：

```
[INFO] [2020-10-08 10:04:58.091] [main] [c.g.h.s.t.d.AbstractQuery.startQuery] - 开始查询...
[INFO] [2020-10-08 10:04:58.092] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用开始
Exception in thread "main" java.lang.RuntimeException: 请求超时
	at com.github.houbb.sync.test.demo.LoopTimeoutQuery.endQuery(LoopTimeoutQuery.java:38)
	at com.github.houbb.sync.test.demo.AbstractQuery.asyncToSync(AbstractQuery.java:26)
	at com.github.houbb.sync.test.demo.LoopTimeoutQuery.main(LoopTimeoutQuery.java:55)
[INFO] [2020-10-08 10:05:03.097] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用结束
```

超时时间是可以设定的，平时开发中可以根据自己的响应时间设置。

如果请求超时，考虑对应的兜底方案。

# 基于 wait() & notifyAll()

## 简介

实际上 loop 循环还是比较消耗性能的，对于这种等待特性, jdk 实际上为我们封装了多种特性。

比如最常见的 wait() 进入等待，notifyAll() 唤醒等待的组合方式。

这个同时也是阻塞队列的实现思想，阻塞队列我们就不介绍了，我们来看一下 wait+notify 的实现方式。

## java 实现

```java
package com.github.houbb.sync.test.demo;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

/**
 * wait+notify 实现
 * @author binbin.hou
 * @since 1.0.0
 */
public class WaitNotifyQuery extends AbstractQuery {

    private static final Log log = LogFactory.getLog(WaitNotifyQuery.class);

    /**
     * 声明对象
     */
    private final Object lock = new Object();

    @Override
    protected void remoteCall() {
        super.remoteCall();
        synchronized (lock) {
            log.info("远程线程执行完成，唤醒所有等待。");
            lock.notifyAll();
        }
    }

    @Override
    protected void endQuery() {
        try {
            // 等待 10s
            synchronized (lock) {
                log.info("主线程进入等待");
                lock.wait(10 * 1000);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        super.endQuery();
    }

    public static void main(String[] args) {
        WaitNotifyQuery query = new WaitNotifyQuery();
        query.asyncToSync();
    }

}
```

注意：编程时需要使用 synchronized 保证锁的持有者线程安全，不然会报错。

## 测试

日志如下：

```
[INFO] [2020-10-08 11:05:50.769] [main] [c.g.h.s.t.d.AbstractQuery.startQuery] - 开始查询...
[INFO] [2020-10-08 11:05:50.770] [main] [c.g.h.s.t.d.WaitNotifyQuery.endQuery] - 主线程进入等待
[INFO] [2020-10-08 11:05:50.770] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用开始
[INFO] [2020-10-08 11:05:55.772] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用结束
[INFO] [2020-10-08 11:05:55.773] [Thread-0] [c.g.h.s.t.d.WaitNotifyQuery.remoteCall] - 远程线程执行完成，唤醒所有等待。
[INFO] [2020-10-08 11:05:55.773] [main] [c.g.h.s.t.d.AbstractQuery.endQuery] - 完成查询，结果为：success
```

# 基于条件锁的实现

## 条件锁简介

如果你想编写一个含有多个条件谓词的并发对象,或者你想获得比条件队列的可见性之外更多的控制权,那么显式的Lock和Condition的实现类提供了一个**比内部锁和条件队列更加灵活的选择。**

如同Lock提供了比内部加锁要丰富得多的特征集一样,Condition也提供了比内部条件队列要丰富得多的特征集:

每个锁可以有多个等待集(因await挂起的线程的集合)、可中断/不可中断的条件等待、基于时限的等待以及公平/非公平队列之间的选择.

> [Condition 介绍](https://houbb.github.io/2019/01/18/jcip-38-define-sync-tool#%E4%B8%89%E6%98%BE%E7%A4%BA%E7%9A%84condition%E5%AF%B9%E8%B1%A1)

注意事项:

wait、notify和notifyAll在Condition对象中的对等体是await、signal和signalAll.

但是,Condition继承与Object,这意味着它也有wait和notify方法.

一定要确保使用了正确的版本–await和signal!

## java 实现

为了演示简单，我们直接选择可重入锁即可。

一个Condition和一个单独的Lock相关联,就像条件队列和单独的内部锁相关联一样;

调用与Condition相关联的Lock的Lock.newCondition方法,可以创建一个Condition.

```java
package com.github.houbb.sync.test.demo;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * 条件锁实现
 * @author binbin.hou
 * @since 1.0.0
 */
public class LockConditionQuery extends AbstractQuery {

    private static final Log log = LogFactory.getLog(LockConditionQuery.class);

    private final Lock lock = new ReentrantLock();

    private final Condition condition = lock.newCondition();

    @Override
    protected void remoteCall() {
        lock.lock();
        try{
            super.remoteCall();

            log.info("远程线程执行完成，唤醒所有等待线程。");
            condition.signalAll();
        } finally {
            lock.unlock();
        }

    }

    @Override
    protected void endQuery() {
        lock.lock();
        try{
            // 等待
            log.info("主线程进入等待");

            condition.await();

            super.endQuery();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        LockConditionQuery query = new LockConditionQuery();
        query.asyncToSync();
    }

}
```

实现也比较简单，我们在方法进入，调用 lock.lock() 加锁，finally 中调用 lock.unlock() 释放锁。

`condition.await();` 进入等待；`condition.signalAll();` 唤醒所有等待线程。

## 测试日志

```
[INFO] [2020-10-08 12:33:40.985] [main] [c.g.h.s.t.d.AbstractQuery.startQuery] - 开始查询...
[INFO] [2020-10-08 12:33:40.986] [main] [c.g.h.s.t.d.LockConditionQuery.endQuery] - 主线程进入等待
[INFO] [2020-10-08 12:33:40.987] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用开始
[INFO] [2020-10-08 12:33:45.990] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用结束
[INFO] [2020-10-08 12:33:45.991] [Thread-0] [c.g.h.s.t.d.LockConditionQuery.remoteCall] - 远程线程执行完成，唤醒所有等待线程。
[INFO] [2020-10-08 12:33:45.993] [main] [c.g.h.s.t.d.AbstractQuery.endQuery] - 完成查询，结果为：success
```

# CountDownLatch 闭锁实现

CountDownLatch/Future/CyclicBarrier 这三个都是 jdk 为我们提供的同步工具类，我们此处只做简单介绍。

详情参见：

> [JCIP-19-同步工具类。闭锁/栅栏/信号量/阻塞队列/FutureTask](https://houbb.github.io/2019/01/18/jcip-19-sync-tool)

## CountDownLatch 简介

闭锁是一种同步工具类，可以延迟线程的进度直到其达到终止状态。

闭锁的作用相当于一扇门：在闭锁到达结束状态之前，这扇门一直是关闭的，并且没有任何线程能通过，当到达结束状态时，这扇门会打开并允许所有的线程通过。

当闭锁到达结束状态后，将不会再改变状态，因此这扇门将永远保持打开状态。

闭锁可以用来确保某些活动直到其它活动都完成后才继续执行。

## java 代码实现

```java
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * CountDownLatch 实现
 * @author binbin.hou
 * @since 1.0.0
 */
public class CountDownLatchQuery extends AbstractQuery {

    private static final Log log = LogFactory.getLog(CountDownLatchQuery.class);

    /**
     * 闭锁
     * 调用1次，后续方法即可通行。
     */
    private final CountDownLatch countDownLatch = new CountDownLatch(1);

    @Override
    protected void remoteCall() {
        super.remoteCall();

        // 调用一次闭锁
        countDownLatch.countDown();
    }

    @Override
    protected void endQuery() {
        try {
//            countDownLatch.await();
            countDownLatch.await(10, TimeUnit.SECONDS);

            log.info("完成查询，结果为：" + result);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        CountDownLatchQuery loopQuery = new CountDownLatchQuery();
        loopQuery.asyncToSync();
    }

}
```

我们在返回结果之前调用 `countDownLatch.await(10, TimeUnit.SECONDS);` 进行等待，这里可以指定超时时间。

remoteCall() 远程完成后，执行一下 `countDownLatch.countDown();`，进而可以让程序继续执行下去。

## 测试

### 代码

```java
CountDownLatchQuery loopQuery = new CountDownLatchQuery();
loopQuery.asyncToSync();
```

### 日志

```
[INFO] [2020-10-08 10:24:03.348] [main] [c.g.h.s.t.d.AbstractQuery.startQuery] - 开始查询...
[INFO] [2020-10-08 10:24:03.350] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用开始
[INFO] [2020-10-08 10:24:08.353] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用结束
[INFO] [2020-10-08 10:24:08.354] [main] [c.g.h.s.t.d.CountDownLatchQuery.endQuery] - 完成查询，结果为：success
```

jdk 提供的闭锁功能还是非常的方便的。

# CyclicBarrier 栅栏

## 简介

栅栏（Barrier）类似于闭锁，它能阻塞一组线程直到某个事件发生[CPJ 4.4.3]。闭锁是一次性对象，一旦进入最终状态，就不能被重置了。

**栅栏与闭锁的关键区别在于，所有线程必须同时达到栅栏位置，才能继续执行。闭锁用于等待事件，而栅栏用于等待其他线程。**

## java 实现

```java
package com.github.houbb.sync.test.demo;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

/**
 * CyclicBarrier 实现
 * @author binbin.hou
 * @since 1.0.0
 */
public class CyclicBarrierQuery extends AbstractQuery {

    private static final Log log = LogFactory.getLog(CyclicBarrierQuery.class);

    private CyclicBarrier cyclicBarrier = new CyclicBarrier(2);

    @Override
    protected void remoteCall() {
        super.remoteCall();

        try {
            cyclicBarrier.await();
            log.info("远程调用进入等待");
        } catch (InterruptedException | BrokenBarrierException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void endQuery() {
        try {
            cyclicBarrier.await();
            log.info("主线程进入等待");
        } catch (InterruptedException | BrokenBarrierException e) {
            e.printStackTrace();
        }

        super.endQuery();
    }

}
```

## 测试

### 代码

```java
public static void main(String[] args) {
    CyclicBarrierQuery cyclicBarrierQuery = new CyclicBarrierQuery();
    cyclicBarrierQuery.asyncToSync();
}
```

### 日志

```
[INFO] [2020-10-08 10:39:00.890] [main] [c.g.h.s.t.d.AbstractQuery.startQuery] - 开始查询...
[INFO] [2020-10-08 10:39:00.892] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用开始
[INFO] [2020-10-08 10:39:05.894] [Thread-0] [c.g.h.s.t.d.AbstractQuery.remoteCall] - 远程调用结束
[INFO] [2020-10-08 10:39:05.895] [Thread-0] [c.g.h.s.t.d.CyclicBarrierQuery.remoteCall] - 远程调用进入等待
[INFO] [2020-10-08 10:39:05.895] [main] [c.g.h.s.t.d.CyclicBarrierQuery.endQuery] - 主线程进入等待
[INFO] [2020-10-08 10:39:05.896] [main] [c.g.h.s.t.d.AbstractQuery.endQuery] - 完成查询，结果为：success
```

可以看出远程线程 `Thread-0` 执行完之后就进入等待，此时主线程调用，然后也进入等待。

等主线程 endQuery 等待时，就满足了两个线程同时等待，然后执行就结束了。

# 基于 Future 实现

## Future 简介

Future模式可以这样来描述：我有一个任务，提交给了Future，Future替我完成这个任务。期间我自己可以去做任何想做的事情。一段时间之后，我就便可以从Future那儿取出结果。就相当于下了一张订货单，一段时间后可以拿着提订单来提货，这期间可以干别的任何事情。其中Future 接口就是订货单，真正处理订单的是Executor类，它根据Future接口的要求来生产产品。

Future接口提供方法来检测任务是否被执行完，等待任务执行完获得结果，也可以设置任务执行的超时时间。这个设置超时的方法就是实现Java程序执行超时的关键。

详细介绍：

> [JCIP-26-Executor Future FutureTask](https://houbb.github.io/2019/01/18/jcip-26-executor-future)

## java 代码实现

采用 Future 返回和以前的实现差异较大，我们直接覆写以前的方法即可。

```java
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.concurrent.*;

/**
 * Future 实现
 * @author binbin.hou
 * @since 1.0.0
 */
public class FutureQuery extends AbstractQuery {

    private static final Log log = LogFactory.getLog(FutureQuery.class);

    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    @Override
    public void asyncToSync() {
        //1. 开始调用
        super.startQuery();

        //2. 远程调用
        Future<String> stringFuture = remoteCallFuture();

        //3. 完成结果
        try {
            String result = stringFuture.get(10, TimeUnit.SECONDS);
            log.info("调用结果：{}", result);
        } catch (InterruptedException | TimeoutException | ExecutionException e) {
            e.printStackTrace();
        }
    }

    /**
     * 远程调用
     * @return Future 信息
     */
    private Future<String> remoteCallFuture() {
        FutureTask<String> futureTask = new FutureTask<>(new Callable<String>() {
            @Override
            public String call() throws Exception {
                log.info("开始异步调用");
                TimeUnit.SECONDS.sleep(5);
                log.info("完成异步调用");
                return "success";
            }
        });

        executorService.submit(futureTask);
        // 关闭线程池
        executorService.shutdown();
        return futureTask;
    }

    public static void main(String[] args) {
        FutureQuery query = new FutureQuery();
        query.asyncToSync();
    }

}
```

远程调用执行时，是一个 FutureTask，然后提交到线程池去执行。

获取结果的时候，`stringFuture.get(10, TimeUnit.SECONDS)` 可以指定获取的超时时间。

## 日志

测试日志如下:

```
[INFO] [2020-10-08 12:52:05.175] [main] [c.g.h.s.t.d.AbstractQuery.startQuery] - 开始查询...
[INFO] [2020-10-08 12:52:05.177] [pool-1-thread-1] [c.g.h.s.t.d.FutureQuery.call] - 开始异步调用
[INFO] [2020-10-08 12:52:10.181] [pool-1-thread-1] [c.g.h.s.t.d.FutureQuery.call] - 完成异步调用
[INFO] [2020-10-08 12:52:10.185] [main] [c.g.h.s.t.d.FutureQuery.asyncToSync] - 调用结果：success
```

# Spring EventListener

## spring 事件监听器模式

对于一件事情完成的结果调用，使用观察者模式是非常适合的。

spring 为我们提供了比较强大的监听机制，此处演示下结合 spring 使用的例子。

ps: 这个例子是2年前的自己写的例子了，此处为了整个系列的完整性，直接搬过来作为补充。

## 代码实现

- BookingCreatedEvent.java

定义一个传输属性的对象。

```java
public class BookingCreatedEvent extends ApplicationEvent {

    private static final long serialVersionUID = -1387078212317348344L;

    private String info;

    public BookingCreatedEvent(Object source) {
        super(source);
    }

    public BookingCreatedEvent(Object source, String info) {
        super(source);
        this.info = info;
    }

    public String getInfo() {
        return info;
    }
}
```

- BookingService.java

说明：当 `this.context.publishEvent(bookingCreatedEvent);` 触发时，
会被 `@EventListener` 指定的方法监听到。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class BookingService {

    @Autowired
    private ApplicationContext context;

    private volatile BookingCreatedEvent bookingCreatedEvent;

    /**
     * 异步转同步查询
     * @param info
     * @return
     */
    public String asyncQuery(final String info) {
        query(info);

        new Thread(new Runnable() {
            @Override
            public void run() {
                remoteCallback(info);
            }
        }).start();

        while(bookingCreatedEvent == null) {
            //.. 空循环
            // 短暂等待。
            try {
                TimeUnit.MILLISECONDS.sleep(1);
            } catch (InterruptedException e) {
                //...
            }
            //2. 使用两个单独的 event...

        }

        final String result = bookingCreatedEvent.getInfo();
        bookingCreatedEvent = null;
        return result;
    }

    @EventListener
    public void onApplicationEvent(BookingCreatedEvent bookingCreatedEvent) {
        System.out.println("监听到远程的信息: " + bookingCreatedEvent.getInfo());
        this.bookingCreatedEvent = bookingCreatedEvent;
        System.out.println("监听到远程消息后: " + this.bookingCreatedEvent.getInfo());
    }

    /**
     * 执行查询
     * @param info
     */
    public void query(final String info) {
        System.out.println("开始查询: " + info);
    }

    /**
     * 远程回调
     * @param info
     */
    public void remoteCallback(final String info) {
        System.out.println("远程回调开始: " + info);

        try {
            TimeUnit.SECONDS.sleep(2);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 重发结果事件
        String result = info + "-result";
        BookingCreatedEvent bookingCreatedEvent = new BookingCreatedEvent(this, result);
        //触发event
        this.context.publishEvent(bookingCreatedEvent);
    }
}
```

- 测试方法

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringConfig.class)
public class BookServiceTest {

    @Autowired
    private BookingService bookingService;

    @Test
    public void asyncQueryTest() {
        bookingService.asyncQuery("1234");
    }

}
```

- 日志

```
2018-08-10 18:27:05.958  INFO  [main] com.github.houbb.spring.lean.core.ioc.event.BookingService:84 - 开始查询:1234
2018-08-10 18:27:05.959  INFO  [Thread-2] com.github.houbb.spring.lean.core.ioc.event.BookingService:93 - 远程回调开始:1234
接收到信息: 1234-result
2018-08-10 18:27:07.964  INFO  [Thread-2] com.github.houbb.spring.lean.core.ioc.event.BookingService:73 - 监听到远程的信息: 1234-result
2018-08-10 18:27:07.964  INFO  [Thread-2] com.github.houbb.spring.lean.core.ioc.event.BookingService:75 - 监听到远程消息后: 1234-result
2018-08-10 18:27:07.964  INFO  [Thread-2] com.github.houbb.spring.lean.core.ioc.event.BookingService:106 - 已经触发event
2018-08-10 18:27:07.964  INFO  [main] com.github.houbb.spring.lean.core.ioc.event.BookingService:67 - 查询结果: 1234-result
2018-08-10 18:27:07.968  INFO  [Thread-1] org.springframework.context.support.GenericApplicationContext:993 - Closing org.springframework.context.support.GenericApplicationContext@5cee5251: startup date [Fri Aug 10 18:27:05 CST 2018]; root of context hierarchy
```

# 小结

本文共计介绍了 7 种异步转同步的方式，实际上思想都是一样的。

在异步执行完成前等待，执行完成后唤醒等待即可。

当然我写本文除了总结以上几种方式以外，还想为后续写一个异步转同步的工具提供基础。

下一节我们将一起学习下如何将这个功能封装为一个同步转换框架，感兴趣的可以关注一下，便于实时接收最新内容。

觉得本文对你有帮助的话，欢迎点赞评论收藏转发一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

# 代码地址

为了便于学习，文中的所有例子都已经开源：

实现 1-6：[sync](https://github.com/houbb/sync/tree/master/sync-test/src/main/java/com/github/houbb/sync/test/demo)

[loop](https://github.com/houbb/thread-learn/tree/master/aysnc/src/main/java/com/github/houbb/thread/learn/aysnc/loop)

[countdownlatch](https://github.com/houbb/thread-learn/tree/master/aysnc/src/main/java/com/github/houbb/thread/learn/aysnc/countdownlatch)

[spring-event-listener](https://github.com/houbb/spring-framework-learn/tree/master/spring-learn-core/spring-core-ioc/src/main/java/com/github/houbb/spring/lean/core/ioc/event)

* any list
{:toc}
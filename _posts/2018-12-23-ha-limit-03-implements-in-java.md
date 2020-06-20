---
layout: post
title: 高可用之限流-03-从零开始 java 手写实现
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, limit, sh]
published: true
---

## 滑动时间窗口

首先实现基于滑动时间窗口的实现。

实现了一定时间窗口内的限次和限频率，支持全局和线程维度。

## 快速开始

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>rate-limit-core</artifactId>
    <version>0.0.2</version>
</dependency>
```

### 全局限频

- 测试

```java
public class GlobalLimitFrequencyTest {

    private static final Log log = LogFactory.getLog(GlobalLimitFrequencyTest.class);

    /**
     * 2S 访问一次
     */
    private static Limit LIMIT = new GlobalLimitFrequency(TimeUnit.SECONDS, 2);

    static class LimitRunnable implements Runnable {

        @Override
        public void run() {
            for (int i = 0; i < 4; i++) {
                LIMIT.limit();
                log.info("{}-{}", Thread.currentThread().getName(), i);
            }
        }
    }

    public static void main(String[] args) {
        new Thread(new LimitRunnable()).start();
        new Thread(new LimitRunnable()).start();
    }

}
```

- 日志

```
23:18:46.466 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitFrequencyTest - Thread-2-0
23:18:48.469 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitFrequencyTest - Thread-1-0
23:18:50.470 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitFrequencyTest - Thread-2-1
23:18:52.473 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitFrequencyTest - Thread-1-1
23:18:54.478 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitFrequencyTest - Thread-2-2
23:18:56.480 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitFrequencyTest - Thread-1-2
23:18:58.484 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitFrequencyTest - Thread-2-3
23:19:00.487 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitFrequencyTest - Thread-1-3
```

### 全局限次

- 测试

```java
public class GlobalLimitCountTest {

    private static final Log log = LogFactory.getLog(GlobalLimitCountTest.class);

    /**
     * 2S 内最多运行 5 次
     */
    private static final Limit LIMIT = new GlobalLimitCount(TimeUnit.SECONDS, 2, 5);

    static class LimitRunnable implements Runnable {

        @Override
        public void run() {
            for(int i = 0; i < 10; i++) {
                LIMIT.limit();
                log.info("{}-{}", Thread.currentThread().getName(), i);
            }
        }
    }

    public static void main(String[] args) {
        new Thread(new LimitRunnable()).start();
        new Thread(new LimitRunnable()).start();
    }

}
```

- 日志

```
18:54:29.618 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-0
18:54:29.618 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-0
18:54:29.619 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-1
18:54:29.619 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-1
18:54:29.619 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-2
18:54:31.613 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-2
18:54:31.613 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-3
18:54:31.618 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-3
18:54:31.618 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-4
18:54:31.619 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-4
18:54:33.613 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-5
18:54:33.613 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-5
18:54:33.618 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-6
18:54:33.618 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-6
18:54:33.619 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-7
18:54:35.613 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-7
18:54:35.613 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-8
18:54:35.618 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-8
18:54:35.618 [Thread-2] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-2-9
18:54:35.619 [Thread-1] INFO  com.github.houbb.rate.limit.test.core.GlobalLimitCountTest - Thread-1-9
```

## 核心源码

### 接口定义

```java
public interface Limit {

    /**
     * 限制
     * @since 0.0.1
     */
    void limit() ;

}
```

### 全局的限次实现

```java
public class GlobalLimitCount extends AbstractLimitCount {

    private static Log log = LogFactory.getLog(GlobalLimitCount.class);

    /**
     * 构造器
     * @param timeUnit 时间单位
     * @param interval 时间间隔
     * @param count 访问次数
     */
    public GlobalLimitCount(TimeUnit timeUnit, long interval, int count) {
        super(timeUnit, interval, count);
    }

    @Override
    public synchronized void limit() {
        CurrentTime currentTime = getCurrentTime();

        long currentTimeInMills = currentTime.currentTimeInMills();

        //1. 将时间放入队列中 如果放得下，直接可以执行。反之，需要等待
        //2. 等待完成之后，将第一个元素剔除。将最新的时间加入队列中。
        boolean offerResult = timeBlockQueue.offer(currentTimeInMills);
        if(!offerResult) {
            //获取队列头的元素
            long headTimeInMills = timeBlockQueue.poll();
            //当前时间和头的时间差
            long durationInMills = currentTimeInMills - headTimeInMills;

            if(intervalInMills > durationInMills) {
                //需要沉睡的时间
                long sleepInMills = intervalInMills - durationInMills;
                LimitHandler limitHandler = getLimitHandler();
                try {
                    limitHandler.beforeHandle();
                    limitHandler.handle(sleepInMills);
                    limitHandler.afterHandle();
                } catch (Exception e) {
                    log.error("GlobalLimitCount.limit() meet ex: "+e, e);
                }
            }

            currentTimeInMills = currentTime.currentTimeInMills();
            timeBlockQueue.offer(currentTimeInMills);
        }

    }

}
```

### 全局的限频操作

```java
public class GlobalLimitFrequency extends AbstractLimitFrequency {

    private static Log log = LogFactory.getLog(GlobalLimitFrequency.class);

    public GlobalLimitFrequency(TimeUnit timeUnit, long interval) {
        super(timeUnit, interval);
    }

    @Override
    public synchronized void limit() {
        IsFirstTime isFirstTime = getIsFirstTime();

        //1. 初次调用，可以考虑不进行时间拦截。
        //2. 计算本次和上次之间的时间间隔。如果时间 < 最小间隔。则睡眠等待。
        boolean isFirstTimeFlag = isFirstTime.isFirstTime();
        if (isFirstTimeFlag) {
            firstTimeHandler();
        } else {
            handleTimeDiff();
        }

    }

    /**
     * 初次调用处理
     * 1. 初始化第一次的时间调用
     */
    protected void firstTimeHandler() {
        TimeDiff timeDiff = getTimeDiff();
        timeDiff.updateAfterCall();
    }

    /**
     * 处理时间差异
     */
    protected void handleTimeDiff() {
        TimeDiff timeDiff = getTimeDiff();

        //1. 获取时间差
        long timeDiffInMills = timeDiff.getTimeDiff();

        //2. 时间差处理
        if (timeDiffInMills < intervalInMills) {
            long sleepInMills = intervalInMills - timeDiffInMills;
            LimitHandler limitHandler = getLimitHandler();
            try {
                limitHandler.beforeHandle();
                limitHandler.handle(sleepInMills);
                limitHandler.afterHandle();
            } catch (Exception e) {
                log.error("GlobalLimitCount.limit() meet ex: "+e, e);
            }
        }

        //3. 更新时间
        timeDiff.updateAfterCall();
    }

}
```

## 基于线程

可以为每一个线程提供一定的拦截。

### 线程维度的限次

```java
public class ThreadLocalLimitCount extends AbstractLimitCount {

    /**
     * 构造器
     * @param timeUnit 时间单位
     * @param interval 时间
     * @param count 访问次数
     */
    public ThreadLocalLimitCount(TimeUnit timeUnit, long interval, int count) {
        super(timeUnit, interval, count);
    }

    @Override
    public void limit() {
        GlobalLimitCount globalLimitCount = threadLocal.get();
        globalLimitCount.limit();
    }


    /**
     * 线程
     * 1. 保证每一个线程都有一份独立的线程
     */
    private ThreadLocal<GlobalLimitCount> threadLocal = new ThreadLocal<GlobalLimitCount>(){

        @Override
        protected synchronized GlobalLimitCount initialValue() {
            return new GlobalLimitCount(timeUnit, interval, count);
        }

    };

}
```

### 线程维度的限频

```java
public class ThreadLocalLimitFrequency implements Limit {

    /**
     * 时间单位
     */
    private TimeUnit timeUnit;

    /**
     * 时间间隔
     */
    private long interval;

    /**
     * 构造器
     * @param timeUnit 时间单位
     * @param interval 时间间隔
     */
    public ThreadLocalLimitFrequency(TimeUnit timeUnit, long interval) {
        this.timeUnit = timeUnit;
        this.interval = interval;
    }

    @Override
    public void limit() {
        AbstractLimitFrequency abstractLimitFrequency = threadLocal.get();
        abstractLimitFrequency.limit();
    }


    /**
     * 线程
     * 1. 保证每一个线程都有一份独立的线程
     */
    private ThreadLocal<AbstractLimitFrequency> threadLocal = new ThreadLocal<AbstractLimitFrequency>(){

        @Override
        protected synchronized AbstractLimitFrequency initialValue() {
            return new GlobalLimitFrequency(timeUnit, interval);
        }

    };

}
```

## 完整代码

[rate-limit](https://github.com/houbb/rate-limit/)

后续将实现如何整合 spring。

* any list
{:toc}
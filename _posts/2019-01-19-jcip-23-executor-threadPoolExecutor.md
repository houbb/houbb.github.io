---
layout: post
title:  JCIP-23-Executor ThreadPoolExecutor 和 Executors
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, thread, async, sh]
published: true
excerpt: JCIP-23-Executor ThreadPoolExecutor 和 Executors
---

# ThreadPoolExecutor

线程池相关的处理时 Executor 的核心。

可以通过调用Executors以下静态工厂方法来创建线程池并返回一个ExecutorService对象。

## 接口定义

继承实现了 AbstractExecutorService。

AbstractExecutorService 中定义了一系列对于 

```java
public class ThreadPoolExecutor extends AbstractExecutorService {}
```

## 构造器

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler) //后两个参数为可选参数
```

### 参数说明

corePoolSize：核心线程数，如果运行的线程少于corePoolSize，则创建新线程来执行新任务，即使线程池中的其他线程是空闲的
 
maximumPoolSize:最大线程数，可允许创建的线程数，corePoolSize和maximumPoolSize设置的边界自动调整池大小：
corePoolSize <运行的线程数< maximumPoolSize:仅当队列满时才创建新线程
corePoolSize=运行的线程数= maximumPoolSize：创建固定大小的线程池
 
keepAliveTime:如果线程数多于corePoolSize,则这些多余的线程的空闲时间超过keepAliveTime时将被终止
 
unit:keepAliveTime参数的时间单位
 
workQueue:保存任务的阻塞队列，与线程池的大小有关：
  当运行的线程数少于corePoolSize时，在有新任务时直接创建新线程来执行任务而无需再进队列
  当运行的线程数等于或多于corePoolSize，在有新任务添加时则选加入队列，不直接创建线程
  当队列满时，在有新任务时就创建新线程
 
threadFactory:使用ThreadFactory创建新线程，默认使用defaultThreadFactory创建线程
 
handle:定义处理被拒绝任务的策略，默认使用ThreadPoolExecutor.AbortPolicy,任务被拒绝时将抛出RejectExecutorException

### 情况说明

如果运行的线程少于 corePoolSize，ThreadPoolExecutor 会始终首选创建新的线程来处理请求；注意，这时即使有空闲线程也不会重复使用（这和数据库连接池有很大差别）。

如果运行的线程等于或多于 corePoolSize，则 ThreadPoolExecutor 会将请求加入队列BlockingQueue，而不添加新的线程（这和数据库连接池也不一样）。

如果无法将请求加入队列（比如队列已满），则创建新的线程来处理请求；但是如果创建的线程数超出 maximumPoolSize，在这种情况下，请求将被拒绝。

newCachedThreadPool使用了SynchronousQueue，并且是无界的。

## 实际使用

建议使用 Executors 提供的方式去创建 ThreadPoolExecutor。

Executors 的静态方法进行了常见的封装，也比较容易理解，并与阅读。

如果比较灵活的自定义，直接使用 ThreadPoolExecutor 本身的构造即可。

# Executors

通过Executors提供四种线程池，newFixedThreadPool、newCachedThreadPool、newSingleThreadExecutor、newScheduledThreadPool。

1.public static ExecutorService newFixedThreadPool(int nThreads) 

创建固定数目线程的线程池。

2.public static ExecutorService newCachedThreadPool() 

创建一个可缓存的线程池，调用execute将重用以前构造的线程（如果线程可用）。如果现有线程没有可用的，则创建一个新线 程并添加到池中。终止并从缓存中移除那些已有 60 秒钟未被使用的线程。

3.public static ExecutorService newSingleThreadExecutor() 

创建一个单线程化的Executor。

4.public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) 

创建一个支持定时及周期性的任务执行的线程池，多数情况下可用来替代Timer类。

## 1. newFixedThreadPool

创建一个可重用固定线程数的线程池，以共享的无界队列方式来运行这些线程。

### 源码

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
     return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>());
}
```

### 例子

```java
ExecutorService executorService = Executors.newFixedThreadPool(5);

for (int i = 0; i < 20; i++) {
    Runnable syncRunnable = new Runnable() {
        @Override
        public void run() {
            Log.e(TAG, Thread.currentThread().getName());
        }
    };
    executorService.execute(syncRunnable);
}
```

运行结果：总共只会创建5个线程， 开始执行五个线程，当五个线程都处于活动状态，再次提交的任务都会加入队列等到其他线程运行结束，当线程处于空闲状态时会被下一个任务复用

## 2.newCachedThreadPool

创建一个可缓存线程池，如果线程池长度超过处理需要，可灵活回收空闲线程

### 源码

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
```

### 例子

```java
ExecutorService executorService = Executors.newCachedThreadPool();
for (int i = 0; i < 100; i++) {
    Runnable syncRunnable = new Runnable() {
        @Override
        public void run() {
            Log.e(TAG, Thread.currentThread().getName());
        }
    };
    executorService.execute(syncRunnable);
}
```

运行结果：可以看出缓存线程池大小是不定值，可以需要创建不同数量的线程，在使用缓存型池时，先查看池中有没有以前创建的线程，如果有，就复用.如果没有，就新建新的线程加入池中，缓存型池子通常用于执行一些生存期很短的异步型任务

## 3.newScheduledThreadPool

### 源码

```java
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
```

ScheduledThreadPoolExecutor 用于定时的线程任务调度，后续讲解。

### 例子

创建一个定长线程池，支持定时及周期性任务执行

`schedule(Runnable command,long delay, TimeUnit unit)` 创建并执行在给定延迟后启用的一次性操作

示例：表示从提交任务开始计时，5000毫秒后执行

```java
ScheduledExecutorService executorService = Executors.newScheduledThreadPool(5);
for (int i = 0; i < 20; i++) {
    Runnable syncRunnable = new Runnable() {
        @Override
        public void run() {
            Log.e(TAG, Thread.currentThread().getName());
        }
    };
    executorService.schedule(syncRunnable, 5000, TimeUnit.MILLISECONDS);
}
```

运行结果和newFixedThreadPool类似，不同的是newScheduledThreadPool是延时一定时间之后才执行

```java
scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnitunit)
```

创建并执行一个在给定初始延迟后首次启用的定期操作，后续操作具有给定的周期；

也就是将在 initialDelay 后开始执行，然后在initialDelay+period 后执行，接着在 initialDelay + 2 * period 后执行，依此类推

```java
ScheduledExecutorService executorService = Executors.newScheduledThreadPool(5);
Runnable syncRunnable = new Runnable() {
    @Override
    public void run() {
        Log.e(TAG, Thread.currentThread().getName());
    }
};
executorService.scheduleAtFixedRate(syncRunnable, 5000, 3000, TimeUnit.MILLISECONDS);
scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit)
```

创建并执行一个在给定初始延迟后首次启用的定期操作，随后，在每一次执行终止和下一次执行开始之间都存在给定的延迟

```java
ScheduledExecutorService executorService = Executors.newScheduledThreadPool(5);
Runnable syncRunnable = new Runnable() {
    @Override
    public void run() {
        Log.e(TAG, Thread.currentThread().getName());
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
};
executorService.scheduleWithFixedDelay(syncRunnable, 5000, 3000, TimeUnit.MILLISECONDS);
```

## 4. newSingleThreadExecutor

### 源码

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}
```

FinalizableDelegatedExecutorService 是 Executors 类再次封装的一个实现，后续讲解。

暂时不做深入学习。

### 例子

创建一个单线程化的线程池，它只会用唯一的工作线程来执行任务，保证所有任务按照指定顺序(FIFO, LIFO, 优先级)执行

```java
ExecutorService executorService = Executors.newSingleThreadExecutor();
for (int i = 0; i < 20; i++) {
    Runnable syncRunnable = new Runnable() {
        @Override
        public void run() {
            Log.e(TAG, Thread.currentThread().getName());
        }
    };
    executorService.execute(syncRunnable);
}
```

运行结果：只会创建一个线程，当上一个执行完之后才会执行第二个


# Executors 创建线程池可能存在的隐患

## alibaba 的强制规范

【强制】线程池不允许使用 Executors 去创建，而是通过 ThreadPoolExecutor 的方式，这样的处理方式让写的同学更加明确线程池的运行规则，规避资源耗尽的风险。

说明：Executors 返回的线程池对象的弊端如下：

1）FixedThreadPool 和 SingleThreadPool:

允许的请求队列长度为 Integer.MAX_VALUE，可能会堆积大量的请求，从而导致 OOM。

2）CachedThreadPool 和 ScheduledThreadPool:

允许的创建线程数量为 Integer.MAX_VALUE，可能会创建大量的线程，从而导致 OOM。

## 结合源码

结合源码看：FixedThreadPool、SingleThreadExecutor的LinkedBlockQueue是一个用链表实现的有界阻塞队列，容量可以选择进行设置，默认将是一个无边界的阻塞队列，最大长度为Integer.MAX_VALUE.

```java
/**
 * Creates a {@code LinkedBlockingQueue} with a capacity of
 * {@link Integer#MAX_VALUE}.
 */
public LinkedBlockingQueue() {
    this(Integer.MAX_VALUE);
}
```

而CacheThreadPool和ScheduledThreadPool实例化时默认最大允许创建的线程数是Integer.MAX_VALUE

```java
 public static ExecutorService newCachedThreadPool() {
     return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                   60L, TimeUnit.SECONDS,
                                   new SynchronousQueue<Runnable>());
 }
 
 public ScheduledThreadPoolExecutor(int corePoolSize) {
     super(corePoolSize, Integer.MAX_VALUE, 0, TimeUnit.NANOSECONDS,
           new DelayedWorkQueue());
 }
```

所以上述两个"漏洞"在特定的场景下就有可能会导致OOM，故而很多人都不建议使用这颗"定时炸弹"。

## 如何正确的创建线程池？

那么上面说了使用Executors创建的线程池有隐患，那如何使用才能避免这个隐患呢？

对症下药，既然FixedThreadPool和SingleThreadPool"可能"导致的OOM是由于使用了无界队列任务堆积，CacheThreadPool和ScheduledThreadPool是由于"可能"创建Interger.MAX_VALUE，那创建线程池时我们就使用有界队列或者指定最大允许创建线程个数即可。

使用下面的构造函数

```java
private static ExecutorService executor = new ThreadPoolExecutor(10,10,60L, TimeUnit.SECONDS,new ArrayBlockingQueue(10));
```

样可以指定corePoolSize、maximumPoolSize、workQueue为ArrayBlockingQueue有界队列

# ThreadPoolExecutor 源码

TODO...

# 参考资料

[为什么引入Executor线程池框架](https://www.cnblogs.com/fengsehng/p/6048610.html)

《java 并发编程实战》P125

[《Alibaba 开发手册》](https://files-cdn.cnblogs.com/files/han-1034683568/%E9%98%BF%E9%87%8C%E5%B7%B4%E5%B7%B4Java%E5%BC%80%E5%8F%91%E6%89%8B%E5%86%8C%E7%BB%88%E6%9E%81%E7%89%88v1.3.0.pdf)

[Java并发编程实战系列8之线程池的使用](https://yq.aliyun.com/articles/636093)

- 源码

[Java并发编程原理与实战三十七：线程池的原理与使用](https://www.colabug.com/4221632.html)

* any list
{:toc}



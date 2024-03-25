---
layout: post
title:  JCIP-25-Executor ScheduledThreadPoolExecutor 实现定时调度
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, thread, async, sh]
published: true
---

# Timer 类的不足

- 为什么需要 ScheduledThreadPoolExecutor？

在JDK1.5之前，我们关于定时/周期操作都是通过Timer来实现的。

但是Timer有以下几种危险

a. Timer是基于绝对时间的。容易受系统时钟的影响。 

b. Timer只新建了一个线程来执行所有的TimeTask。所有TimeTask可能会相关影响 

c. Timer不会捕获TimerTask的异常，只是简单地停止。这样势必会影响其他TimeTask的执行。 

如果你是使用JDK1.5以上版本，建议用ScheduledThreadPoolExecutor代替Timer。它基本上解决了上述问题。它采用相对时间，用线程池来执行TimerTask，会出来TimerTask异常。 

# ScheduledThreadPoolExecutor

## 概念

ThreadPoolExecutor是ExecutorService的默认实现。

ScheduledThreadPoolExecutor继承ThreadPoolExecutor的ScheduledExecutorService接口实现，周期性任务调度的类实现。

可另行安排在给定的延迟后运行命令，或者定期执行命令。需要多个辅助线程时，或者要求 ThreadPoolExecutor 具有额外的灵活性或功能时，此类要优于 Timer。 
一旦启用已延迟的任务就执行它，但是有关何时启用，启用后何时执行则没有任何实时保证。按照提交的先进先出 (FIFO) 顺序来启用那些被安排在同一执行时间的任务。 
虽然此类继承自 ThreadPoolExecutor，但是几个继承的调整方法对此类并无作用。特别是，因为它作为一个使用 corePoolSize 线程和一个无界队列的固定大小的池，所以调整 maximumPoolSize 没有什么效果。
 
## 优点

### 优于 Timer

其主要有如下两个优点：

1. 使用多线程执行任务，不用担心任务执行时间过长而导致任务相互阻塞的情况，Timer是单线程执行的，因而会出现这个问题；

2. 不用担心任务执行过程中，如果线程失活，其会新建线程执行任务，Timer类的单线程挂掉之后是不会重新创建线程执行后续任务的。

### 灵活的 API

除去上述两个优点外，ScheduledThreadPoolExecutor还提供了非常灵活的API，用于执行任务。

其任务的执行策略主要分为两大类：

1. 在一定延迟之后只执行一次某个任务

2. 在一定延迟之后周期性的执行某个任务。如下是其主要API：

# 入门例子

```java
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * @author binbin.hou
 * date 2019/2/20
 */
public class ScheduledThreadPoolTest {

    public static void main(String[] args) {
        ScheduledThreadPoolExecutor exec = new ScheduledThreadPoolExecutor(2);
        exec.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                System.out.println("定期执行的任务："+System.nanoTime());
            }
        }, 1, 5, TimeUnit.SECONDS);

        exec.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                System.out.println("系统任务：" + System.nanoTime());
            }
        }, 1, 2, TimeUnit.SECONDS);
    }
}
```

- 日志信息

```
定期执行的任务：7720665347800
系统任务：7720668101900
系统任务：7722667313900
系统任务：7724667136200
定期执行的任务：7725666196800
系统任务：7726667205200
系统任务：7728667086700
定期执行的任务：7730666168100
系统任务：7730668156300
系统任务：7732668617700
```



# 使用注意点

这里关于ScheduledThreadPoolExecutor的使用有三点需要说明如下：

## ThreadPoolExecutor 方法发生了变化

ScheduledThreadPoolExecutor继承自ThreadPoolExecutor（ThreadPoolExecutor详解），因而也有继承而来的execute()和submit()方法，但是ScheduledThreadPoolExecutor重写了这两个方法，重写的方式是直接创建两个立即执行并且只执行一次的任务；

## ScheduledFutureTask

ScheduledThreadPoolExecutor使用ScheduledFutureTask封装每个需要执行的任务，而任务都是放入DelayedWorkQueue队列中的，该队列是一个使用数组实现的优先队列，在调用ScheduledFutureTask.cancel()方法时，其会根据removeOnCancel变量的设置来确认是否需要将当前任务真正的从队列中移除，而不只是标识其为已删除状态；

## 钩子函数

ScheduledThreadPoolExecutor提供了一个钩子方法decorateTask(Runnable, RunnableScheduledFuture)用于对执行的任务进行装饰，该方法第一个参数是调用方传入的任务实例，第二个参数则是使用ScheduledFutureTask对用户传入任务实例进行封装之后的实例。这里需要注意的是，在ScheduledFutureTask对象中有一个heapIndex变量，该变量用于记录当前实例处于队列数组中的下标位置，该变量可以将诸如contains()，remove()等方法的时间复杂度从O(N)降低到O(logN)，因而效率提升是比较高的，但是如果这里用户重写decorateTask()方法封装了队列中的任务实例，那么heapIndex的优化就不存在了，因而这里强烈建议是尽量不要重写该方法，或者重写时也还是复用ScheduledFutureTask类。

# 源码详解

TODO...

# 参考资料

《java 并发编程实战》

[Java并发编程14-ScheduledThreadPoolExecutor详解](http://th7.cn/Program/java/201703/1121088.shtml)

[ScheduledThreadPoolExecutor详解](http://www.bubuko.com/infodetail-2638335.html)

[ScheduledThreadPoolExecutor详解](https://www.jianshu.com/p/a8bb4db97643)

https://blog.csdn.net/wenzhi20102321/article/details/78681379

http://www.voidcn.com/article/p-kdkfgupk-es.html

* any list
{:toc}



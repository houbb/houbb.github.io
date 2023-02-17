---
layout: post
title:  JCIP-29-Executor 框架小结
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, future, async, TODO, sh]
published: true
excerpt: JCIP-29-Executor 框架小结
---

# jdk8 以后的多线程处理

集合进行并行计算有两种方式：并行流和CompletableFutures。

## 并行流

计算密集型操作，并且没有I/O，推荐使用Stream接口。因为实现简单，同时效率也可能是最高的（如果所有的线程都是计算密集型的，那就没有必要创建比处理器核数更多的线程）；

## CompletableFutures

如果并行的工作单元还涉及等待I/O的操作（包括网络连接等待），那么使用CompletableFuture灵活性更好。这种情况下处理流的流水线中如果发生I/O等待，流的延迟特性会让我们很难判断到底什么时候触发了等待。

# Exeutor 线程池 

## 如何正确的创建线程池？

那么上面说了使用Executors创建的线程池有隐患，那如何使用才能避免这个隐患呢？

对症下药，既然FixedThreadPool和SingleThreadPool"可能"导致的OOM是由于使用了无界队列任务堆积，CacheThreadPool和ScheduledThreadPool是由于"可能"创建Interger.MAX_VALUE，那创建线程池时我们就使用有界队列或者指定最大允许创建线程个数即可。

使用下面的构造函数

```java
private static ExecutorService executor = new ThreadPoolExecutor(10,10,60L, TimeUnit.SECONDS,new ArrayBlockingQueue(10));
```

样可以指定corePoolSize、maximumPoolSize、workQueue为ArrayBlockingQueue有界队列

# 常用多线程并发，取结果归集的几种实现方案

| 描述	| Future	| FutureTask	|  CompletionService	| CompletableFuture |
|:----|:----|:----|:----|:----|
| 原理 | Future接口 | 接口RunnableFuture的唯一实现类，RunnableFuture接口继承自Future+Runnable | 内部通过阻塞队列+FutureTask接口 | JDK8实现了Future, CompletionStage两个接口 |
| 多任务并发执行	  |  支持	         |         支持	  | 支持	     |                支持 |
| 获取任务结果的顺序 | 按照提交顺序获取结果	  |  未知	     支持任务完成的先后顺序	   |  支持任务完成的先后顺序 |
| 异常捕捉 |  自己捕捉	       |           自己捕捉    | 自己捕捉	        |     原生API支持，返回每个任务的异常 |
| 建议	|           CPU高速轮询，耗资源，可以使用，但不推荐	| 功能不对口，并发任务这一块多套一层，不推荐使用	|  推荐使用，没有JDK8CompletableFuture之前最好的方案，没有质疑 | 	API极端丰富，配合流式编程，速度飞起，推荐使用！| 

# 参考资料

《java 并发编程实战》

[Java8新特性整理之CompletableFuture：组合式、异步编程（七）](https://blog.csdn.net/u011726984/article/details/79320004)

[多线程并发执行任务，取结果归集。终极总结：Future、FutureTask、CompletionService、CompletableFuture](https://www.cnblogs.com/dennyzhangdd/p/7010972.html)

* any list
{:toc}
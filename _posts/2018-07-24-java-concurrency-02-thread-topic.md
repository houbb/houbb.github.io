---
layout: post
title:  Java Concurrency-02-thread topic
date:  2018-07-24 15:52:20 +0800
categories: [Java]
tags: [thread, concurrency, thread]
published: true
---

# JDK 版本特性更迭

## JDK 1.X

- 功能类

```
java.lang.Thread
java.lang.ThreadGroup
java.lang.Runnable
java.lang.Process
java.lang.ThreadDeath
```

- 异常类

```
java.lang.IllegalMonitorStateException
java.lang.IllegalStateException
java.lang.IllegalThreadStateException.
```

- 线程安全的集合

```
java.util.Hashtable
java.util.Vector
```

## JDK 1.2 + JDK 1.3

没有特性变化

## JDK 1.4

通过一次调用挂起/恢复多个线程，JVM级别的微调。

但是没有出现重大的API更改。

## JDK 1.5

Executor, semaphore, mutex, barrier, latches, concurrent collections, blocking queues; 

[jdk concurrency](https://docs.oracle.com/javase/1.5.0/docs/guide/concurrency/overview.html)

## JDK 1.6

JDK 1.6 更多的是平台修复，而不是API升级。

## JDK 1.7

JDK 1.7 增加了对 `ForkJoinPool` 的支持，它实现了工作窃取技术以最大限度地提高吞吐量。

还添加了 `Phaser` 类。

## JDK 1.8

JDK 1.8 主要以Lambda更改而闻名，但它也几乎没有并发更改。

在 `java.util.concurrent` 中添加了两个新接口和四个新类。如 `CompletableFuture` 和 `CompletionException`。

集合框架在Java 8中进行了重大修改，以基于新添加的流工具和lambda表达式添加聚合操作;

导致在几乎所有的集合类中添加大量的方法，因此在并发集合中也是如此。


# 锁优化

高效并发是从JDK 1.5到JDK 1.6的一个重要改进，HotSpot虚拟机开发团队在这个版本上
花费了大量的精力去实现各种锁优化技术，如适应性自旋（Adaptive  Spinning）、锁消除
（Lock Elimination）、锁粗化（Lock Coarsening）、轻量级锁（Lightweight Locking）和偏向
锁（Biased Locking）等，这些技术都是为了在线程之间更高效地共享数据，以及解决竞争问
题，从而提高程序的执行效率。

* any list
{:toc}
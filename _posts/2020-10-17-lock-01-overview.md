---
layout: post
title:  锁专题（1）概览
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, overview, sf]
published: true
---

# 专题创作目的

系统整理学习 Java 中的锁信息。

为后续 mysql 数据库编写做铺垫。

# 历史回顾

## 基础知识

[java 锁基本概念](https://houbb.github.io/2017/08/25/lock)

[java 对象锁](https://houbb.github.io/2018/07/25/java-concurrency-07-class-object-lock)

[java 可重入锁](https://houbb.github.io/2018/07/25/java-concurrency-08-re-lock)

------------------------------------------------------------------------------------------------------------------------

## 深入学习

[java 锁介绍 √](https://houbb.github.io/2018/07/24/java-concurrency-05-lock-intro)

[java synchronized 关键字详解](https://houbb.github.io/2018/07/25/java-concurrency-09-sync)

[java volatile 关键字详解](https://houbb.github.io/2018/07/27/jmm-05-volatile)

[java cas 详解](https://houbb.github.io/2018/07/24/java-concurrency-06-cas)

[java 可重入锁 ReentrantLock & jmm √](https://houbb.github.io/2018/07/29/jmm-07-lock)

[java ReentrantReadWriteLock 可重入读写锁](https://houbb.github.io/2019/01/18/jcip-36-read-write-lock)

[StampedLock 读写锁中的最强王者](https://houbb.github.io/2019/01/18/jcip-37-stamped-lock)

[java dead lock 死锁](https://houbb.github.io/2019/01/18/jcip-33-dead-lock)

## 自己实现

await+notify 实现锁

自旋锁

可重入锁

可重入读写锁

## 分布式锁

[sql 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-sql)

[ZooKeeper 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-zookeeper)

[Redis 分布式锁 redis lock](https://houbb.github.io/2018/09/08/redis-learn-42-distributed-lock-redis)

[Redis Learn-26-Distributed Lock 分布式锁](https://houbb.github.io/2018/12/12/redis-learn-26-distributed-lock)

[Redis Learn-27-分布式锁进化史](https://houbb.github.io/2018/12/12/redis-learn-27-distributed-lock-history)

[redis 分布式锁设计 redis lock](https://houbb.github.io/2019/01/07/redis-learn-41-lock)

## 异步转同步

[java 手写并发框架（一）异步查询转同步的 7 种实现方式](https://houbb.github.io/2019/01/18/jcip-42-async-to-sync)

[java 手写并发框架（二）异步转同步框架封装锁策略](https://houbb.github.io/2019/01/18/jcip-43-async-to-sync-02-lock)

[java 手写并发框架（三）异步转同步框架注解和字节码增强](https://houbb.github.io/2019/01/18/jcip-44-async-to-sync-03-annotation-cglib)

[java 手写并发框架（四）异步转同步框架spring整合](https://houbb.github.io/2019/01/18/jcip-45-async-to-sync-04-spring)

## 数据库锁

MVCC

# 新篇章

必须在以前的基础上进一步提升，主要偏重于源码学习。

[Lock 和 Condition 接口源码学习](https://houbb.github.io/2020/10/17/lock-02-lock-interface-source-code)

[ReentrantLock 源码学习 √](https://houbb.github.io/2020/10/17/lock-03-ReentrantLock-source-code)

[ReentrantReadWriteLock 可重入读写锁源码学习](https://houbb.github.io/2019/01/18/jcip-36-read-write-lock)

ReentrantReadWriteLock.ReadLock

ReentrantReadWriteLock.WriteLock

[StampedLock 读写锁中的最强王者](http://houbb.github.io/2019/01/18/jcip-37-stamped-lock)

[AtomicLong 原子性 long 详解](http://houbb.github.io/2019/01/20/juc-02-atomiclong)

[AtomicInteger]()

[AtomicReference]()

[LongAdder 更高效的原子性变量](http://houbb.github.io/2019/01/20/juc-03-longadder)

[AbstractQueuedSynchronizer AQS 源码详解](http://houbb.github.io/2020/10/17/lock-06-aqs-source-code)

AbstractQueuedLongSynchronizer  这个和 AQS 实现基本一样，只是 64 位的 long state 而已。

[LockSupport](http://houbb.github.io/2019/01/20/juc-06-lock-support)

[Unsafe 并发锁的基石](http://houbb.github.io/2019/01/20/juc-05-unsafe)

[striped64 缓存行](http://houbb.github.io/2019/01/20/juc-04-striped64)

## 工具篇

[闭锁（如CountDownLatch），栅栏（如CyclicBarrier），信号量（如Semaphore）和阻塞队列（如LinkedBlockingQueue）](http://houbb.github.io/2019/01/18/jcip-19-sync-tool)

CountDownLatch

CyclicBarrier

Semaphore

Phaser

Exchanger

## 并发数据结构 

ArrayBlockingQueue

ConcurrentHashMap

ConcurrentLinkedDeque

ConcurrentLinkedQueue

ConcurrentSkipListMap

ConcurrentSkipListSet

CopyOnWriteArrayList

CopyOnWriteArraySet

DelayQueue

LinkedBlockingDeque

LinkedBlockingQueue

LinkedTransferQueue

PriorityBlockingQueue

SynchronousQueue

## 进阶学习

linux 系统中的 seqlocks 实现原理

[seqlock 在 jmm 如何应用？](https://houbb.github.io/2020/10/17/lock-05-seqlock-jmm)

* any list
{:toc}
---
layout: post
title:  锁专题（1）概览 lock overview
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

## 异步转同步

[java 手写并发框架（一）异步查询转同步的 7 种实现方式](https://houbb.github.io/2019/01/18/jcip-42-async-to-sync)

[java 手写并发框架（二）异步转同步框架封装锁策略](https://houbb.github.io/2019/01/18/jcip-43-async-to-sync-02-lock)

[java 手写并发框架（三）异步转同步框架注解和字节码增强](https://houbb.github.io/2019/01/18/jcip-44-async-to-sync-03-annotation-cglib)

[java 手写并发框架（四）异步转同步框架spring整合](https://houbb.github.io/2019/01/18/jcip-45-async-to-sync-04-spring)

## 开源代码

> [The async tool for java.(Java 多线程异步并行框架，基于 java 字节码，支持注解。)](https://github.com/houbb/async)

> [The distributed lock tool for java.(java 实现开箱即用基于 redis 的分布式锁，支持可重入锁获取。内置整合 spring、springboot。)](https://github.com/houbb/lock)

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

[手写 spinlock 自旋锁 & 可重入锁](https://houbb.github.io/2020/10/17/lock-07-spin-lock)

[手写可重入读写锁](https://houbb.github.io/2020/10/17/lock-08-read-write-lock)

# 新篇章

必须在以前的基础上进一步提升，主要偏重于源码学习。

[Lock 和 Condition 接口源码学习](https://houbb.github.io/2020/10/17/lock-02-lock-interface-source-code)

[ReentrantLock 源码学习](https://houbb.github.io/2020/10/17/lock-03-ReentrantLock-source-code)

[ReentrantReadWriteLock 可重入读写锁源码学习](https://houbb.github.io/2019/01/18/jcip-36-read-write-lock)

[AtomicLong 原子性 long 详解](https://houbb.github.io/2019/01/20/juc-02-atomiclong)

[AtomicInteger 源码解析](https://houbb.github.io/2019/01/20/juc-02-atomicinteger)

[AtomicReference 源码解析](https://houbb.github.io/2019/01/20/juc-02-AtomicReference)

## 基础数据结构

[JCIP-14-双端队列与工作密取](https://houbb.github.io/2019/01/18/jcip-14-deque-workstealing)

[双端队列之 ArrayDeque](https://houbb.github.io/2019/01/18/jcip-15-deque-ArrayDeque)

[binary heap 二叉堆介绍](https://houbb.github.io/2019/01/18/jcip-11-binary-heap)

[PriorityQueue 优先级队列](https://houbb.github.io/2019/01/18/jcip-10-priority-queue)

[优先级队列与堆排序](https://houbb.github.io/2019/01/04/prority-queue)

[JCIP-12-环形队列 CircularQueue 与  CircularBlockingQueue](https://houbb.github.io/2019/01/18/jcip-12-circle-queue)

## 并发基础知识

[轻松学习多线程 00-多线程学习概览](https://houbb.github.io/2019/01/19/thread-learn-00-overview)

[JCIP-00-并发概览](https://houbb.github.io/2019/01/18/jcip-00-overview)

## 同步数据结构

[同步类数据结构](https://houbb.github.io/2019/01/18/jcip-06-sync-collection)

## 并发数据结构 

----------------------------------------------------------------------------------------------------------------------

[CopyOnWriteArrayList 详解](https://houbb.github.io/2019/01/18/jcip-07-copyonwritelist)

[CopyOnWriteArraySet 入门及源码详解](https://houbb.github.io/2019/01/18/jcip-07-CopyOnWriteSet)

[java 从零实现 CopyOnWriteHashMap](https://houbb.github.io/2019/01/18/jcip-07-CopyOnWriteHashMap)

[双端队列之 ConcurrentLinkedDeque](https://houbb.github.io/2019/01/18/jcip-17-deque-ConcurrentLinkedDeque)

[ConcurrentLinkedQueue 入门及源码分析](https://houbb.github.io/2020/10/17/lock-09-ConcurrentLinkedQueue-source-code)

----------------------------------------------------------------------------------------------------------------------

[ConcurrentHashMap 源码详解](https://houbb.github.io/2018/09/12/java-concurrent-hashmap)

[跳跃表(SkipList)](https://houbb.github.io/2019/02/13/datastruct-skiplist)

[ConcurrentSkipListMap](https://houbb.github.io/2020/10/17/lock-09-ConcurrentSkipListMap-source-code)

[ConcurrentSkipListSet](https://houbb.github.io/2020/10/17/lock-09-ConcurrentSkipListSet-source-code)

----------------------------------------------------------------------------------------------------------------------

【阻塞队列】

[已发布-阻塞队列（8）-SynchronousQueue 同步队列源码详解](https://houbb.github.io/2020/10/17/lock-09-SynchronousQueue-source-code)

[阻塞队列（1）java 7 种阻塞队列 BlockingQueue 介绍](https://houbb.github.io/2019/01/18/jcip-09-blocking-queue)

[阻塞队列（2）ArrayBlockingQueue 源码详解](https://houbb.github.io/2020/10/17/lock-09-ArrayBlockingQueue-source-code)

[阻塞队列（3）LinkedBlockingQueue 源码详解](https://houbb.github.io/2020/10/17/lock-09-LinkedBlockingQueue-source-code)

[阻塞队列（4）LinkedBlockingDeque 源码详解](https://houbb.github.io/2019/01/18/jcip-16-deque-LinkedBlockingDeque)

[阻塞队列（5）DelayQueue 延迟队列使用入门及源码详解](https://houbb.github.io/2020/10/17/lock-09-DelayQueue-source-code)

[阻塞队列（6）PriorityBlockingQueue 阻塞优先级队列源码详解](https://houbb.github.io/2020/10/17/lock-09-PriorityBlockingQueue-source-code)

[阻塞队列（7）LinkedTransferQueue 使用入门及源码详解](https://houbb.github.io/2020/10/17/lock-09-LinkedTransferQueue-source-code)

[阻塞队列（8）SynchronousQueue 同步队列源码详解](https://houbb.github.io/2020/10/17/lock-09-SynchronousQueue-source-code)

----------------------------------------------------------------------------------------------------------------------

### 无锁队列

[无锁队列](https://houbb.github.io/2019/01/18/jcip-13-free-lock-queue)

## 工具篇

[闭锁（如CountDownLatch），栅栏（如CyclicBarrier），信号量（如Semaphore）和阻塞队列（如LinkedBlockingQueue）](https://houbb.github.io/2019/01/18/jcip-19-sync-tool)

[java 异步查询转同步多种实现方式：循环等待，CountDownLatch，Spring EventListener，超时处理和空循环性能优化](https://houbb.github.io/2019/01/18/jcip-41-async-sync)

[闭锁 CountDownLatch 使用入门及源码详解](https://houbb.github.io/2020/10/17/lock-09-CountDownLatch-source-code)

[Semaphore 信号量源码深度解析](https://houbb.github.io/2020/10/17/lock-09-Semaphore-source-code)

[CyclicBarrier 源码详解](https://houbb.github.io/2020/10/17/lock-09-CyclicBarrier-source-code)

[Phaser 源码详解](https://houbb.github.io/2020/10/17/lock-12-tool-phaser)

[Exchanger 源码详解](https://houbb.github.io/2020/10/17/lock-12-tool-exchanger)

## 底层原理

[LongAdder 更高效的原子性 Long 变量](https://houbb.github.io/2019/01/20/juc-03-longadder)

[AbstractQueuedSynchronizer AQS 源码详解](https://houbb.github.io/2020/10/17/lock-06-aqs-source-code)

AbstractQueuedLongSynchronizer  这个和 AQS 实现基本一样，只是 64 位的 long state 而已。

[LockSupport 源码解析](https://houbb.github.io/2019/01/20/juc-06-lock-support)

[Unsafe 并发锁的基石](https://houbb.github.io/2019/01/20/juc-05-unsafe)

[striped64 缓存行](https://houbb.github.io/2019/01/20/juc-04-striped64)

## 分布式锁

[sql 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-sql)

[ZooKeeper 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-zookeeper)

[Redis 分布式锁 redis lock](https://houbb.github.io/2018/09/08/redis-learn-42-distributed-lock-redis)

[Redis Learn-26-Distributed Lock 分布式锁](https://houbb.github.io/2018/12/12/redis-learn-26-distributed-lock)

[Redis Learn-27-分布式锁进化史](https://houbb.github.io/2018/12/12/redis-learn-27-distributed-lock-history)

[redis 分布式锁设计 redis lock](https://houbb.github.io/2019/01/07/redis-learn-41-lock)

## 数据库锁

[MVCC Multi Version Concurrency Control 多版本控制](https://houbb.github.io/2018/08/31/sql-mvcc)

## 进阶学习

[linux 系统中的 seqlocks 实现原理](https://houbb.github.io/2020/10/17/lock-10-linux-seq-locks-01-atomic)

[seqlock 在 jmm 如何应用？](https://houbb.github.io/2020/10/17/lock-05-seqlock-jmm)

paper 算法篇

## 内存相关

缓存行

理解CPU Cache和Java对象内存布局。

[Java8使用@sun.misc.Contended避免伪共享](https://www.jianshu.com/p/c3c108c3dcfd) 整理一篇

* any list
{:toc}
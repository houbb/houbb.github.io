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

[java 锁基本概念](https://houbb.github.io/2017/08/25/lock)

[java 锁介绍](https://houbb.github.io/2018/07/24/java-concurrency-05-lock-intro)

[java 可重入锁](https://houbb.github.io/2018/07/25/java-concurrency-08-re-lock)

[java 可重入锁 & jmm](https://houbb.github.io/2018/07/29/jmm-07-lock)

[java synchronized 关键字详解](https://houbb.github.io/2018/07/25/java-concurrency-09-sync)

[java volatile 关键字详解](https://houbb.github.io/2018/07/27/jmm-05-volatile)

[cas 详解](https://houbb.github.io/2018/07/24/java-concurrency-06-cas)

[java 对象锁](https://houbb.github.io/2018/07/25/java-concurrency-07-class-object-lock)

[java 可重入读写锁](https://houbb.github.io/2019/01/18/jcip-36-read-write-lock)

[java StampedLock 读写锁中的性能之王](https://houbb.github.io/2019/01/18/jcip-37-stamped-lock)

[java 死锁](https://houbb.github.io/2019/01/18/jcip-33-dead-lock)

## 数据库锁

MVCC



## 分布式锁

[sql 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-sql)

[ZooKeeper 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-zookeeper)

[Redis 分布式锁 redis lock](https://houbb.github.io/2018/09/08/redis-learn-42-distributed-lock-redis)

[Redis Learn-26-Distributed Lock 分布式锁](https://houbb.github.io/2018/12/12/redis-learn-26-distributed-lock)

[Redis Learn-27-分布式锁进化史](https://houbb.github.io/2018/12/12/redis-learn-27-distributed-lock-history)

[redis 分布式锁设计 redis lock](https://houbb.github.io/2019/01/07/redis-learn-41-lock)

## 相关数据结构


# 新篇章

必须在以前的基础上进一步提升，主要偏重于源码学习。

[Lock 和 Condition 接口源码学习](https://houbb.github.io/2020/10/17/lock-02-lock-interface-source-code)

AbstractOwnableSynchronizer

AbstractQueuedLongSynchronizer

AbstractQueuedSynchronizer

LockSupport

[ReentrantLock 源码学习](https://houbb.github.io/2020/10/17/lock-03-ReentrantLock-source-code)

[ReentrantReadWriteLock 可重入读写锁源码学习](https://houbb.github.io/2019/01/18/jcip-36-read-write-lock)

ReentrantReadWriteLock.ReadLock

ReentrantReadWriteLock.WriteLock

StampedLock

## 自己实现

简易版本可重入锁

简易版本可重入读写锁

## 进阶学习

linux 系统中的 seqlocks 实现原理

seqlock 在 jmm 如何应用？

* any list
{:toc}
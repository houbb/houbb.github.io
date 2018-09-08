---
layout: post
title:  Redis 分布式锁
date:  2018-09-08 11:07:16 +0800
categories: [Distributed]
tags: [distributed, redis, lock, sql, zookeeper, sh]
published: false
excerpt: Redis 分布式锁原理及其代码实现。
---

# 锁的准则

首先，为了确保分布式锁可用，我们至少要确保锁的实现同时满足以下四个条件：

- 互斥性。

在任意时刻，只有一个客户端能持有锁。

- 不会发生死锁。

即使有一个客户端在持有锁的期间崩溃而没有主动解锁，也能保证后续其他客户端能加锁。

- 具有容错性。

只要大部分的Redis节点正常运行，客户端就可以加锁和解锁。

- 解铃还须系铃人。

加锁和解锁必须是同一个客户端，客户端自己不能把别人加的锁给解了。

- 具备可重入特性；

- 具备非阻塞锁特性;

即没有获取到锁将直接返回获取锁失败。

- 高性能 & 高可用


# redlock

# 拓展阅读

- 其他实现方式

[数据库实现](https://houbb.github.io/2018/09/08/distributed-lock-sql)

[zookeeper 实现](https://houbb.github.io/2018/09/08/distributed-lock-zookeeper)

- 基础知识

[java lock](https://houbb.github.io/2017/08/25/lock)

[java synchronized](https://houbb.github.io/2018/07/25/java-concurrency-09-sync)

[java lock & ReentrantLock](https://houbb.github.io/2018/07/29/jmm-07-lock)

[java volatile](https://houbb.github.io/2018/07/27/jmm-05-volatile)

# 参考资料

- 分布式锁

[分布式锁的几种实现方式](https://juejin.im/entry/5a502ac2518825732b19a595)

- redis

[Redis 分布式锁的正确实现方式（ Java 版 ）](http://www.importnew.com/27477.html)

[jedisLock—redis分布式锁实现](https://www.cnblogs.com/0201zcr/p/5942748.html)

- redlock

[基于Redis的分布式锁到底安全吗（上）？](http://zhangtielei.com/posts/blog-redlock-reasoning.html)

[分布式锁实现方式](https://runnerliu.github.io/2018/05/06/distlock/)

* any list
{:toc}
---
layout: post
title: Redis Learn-26-Distributed Lock 分布式锁
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, lock, distributed, sh]
published: true
---

# Distributed locks with Redis

Distributed locks are a very useful primitive in many environments where different processes must operate with shared resources in a mutually exclusive way.

There are a number of libraries and blog posts describing how to implement a DLM (Distributed Lock Manager) with Redis, but every library uses a different approach, and many use a simple approach with lower guarantees compared to what can be achieved with slightly more complex designs.

This page is an attempt to provide a more canonical（典范） algorithm to implement distributed locks with Redis. 

We propose an algorithm, called Redlock, which implements a DLM which we believe to be safer than the vanilla single instance approach. 

We hope that the community will analyze it, provide feedback, and use it as a starting point for the implementations or more complex or alternative designs.

# Implementations

Before describing the algorithm, here are a few links to implementations already available that can be used for reference.

[redisson](https://github.com/redisson/redisson)

[redlock-cpp](https://github.com/jacket-code/redlock-cpp)

# Safety and Liveness guarantees

We are going to model our design with just three properties that, from our point of view, are the minimum guarantees needed to use distributed locks in an effective way.

Safety property: Mutual exclusion. At any given moment, only one client can hold a lock.
Liveness property A: Deadlock free. Eventually it is always possible to acquire a lock, even if the client that locked a resource crashes or gets partitioned.
Liveness property B: Fault tolerance. As long as the majority of Redis nodes are up, clients are able to acquire and release locks.

# 拓展阅读

[ZooKeeper 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-zookeeper)

[SQL 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-sql)

[Redis 分布式锁设计](https://houbb.github.io/2019/01/07/redis-lock)

# 参考资料

[distlock](https://redis.io/topics/distlock)

* any list
{:toc}
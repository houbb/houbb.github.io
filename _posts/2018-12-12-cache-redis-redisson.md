---
layout: post
title:  Redisson 入门教程
date:  2018-05-24 23:03:04 +0800
categories: [Cache]
tags: [redis, sf]
published: true
---

# Redisson

[Redisson](https://github.com/redisson/redisson) - distributed Java objects and services (Set, Multimap, SortedSet, 
Map, List, Queue, BlockingQueue, Deque, BlockingDeque, Semaphore, Lock, AtomicLong, 
Map Reduce, Publish / Subscribe, Bloom filter, Spring Cache, Executor service, 
Tomcat Session Manager, Scheduler service, JCache API) on top of Redis server. 

State of the Art Redis client


# Quick Start

## jar 引入

```xml
<dependencies>
    <dependency>
        <groupId>org.redisson</groupId>
        <artifactId>redisson</artifactId>
        <version>3.7.0</version>
    </dependency>
</dependencies>
```

## Hello World

```java
public static void main(String[] args) throws IOException {
    RedissonClient redisson = Redisson.create();
    RBucket<String> bucket = redisson.getBucket("anyObject");
    bucket.set("hello");
    String obj = bucket.get();
    System.out.println(obj);
}
```

* any list
{:toc}
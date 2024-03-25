---
layout: post
title: Redis Learn-27-分布式锁进化史
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, lock, distributed, distributed-lock, history, sh]
published: true
---

# 业务背景

近两年来微服务变得越来越热门，越来越多的应用部署在分布式环境中，在分布式环境中，数据一致性是一直以来需要关注并且去解决的问题，分布式锁也就成为了一种广泛使用的技术，常用的分布式实现方式为Redis，Zookeeper，其中基于Redis的分布式锁的使用更加广泛。

但是在工作和网络上看到过各个版本的Redis分布式锁实现，每种实现都有一些不严谨的地方，甚至有可能是错误的实现，包括在代码中，如果不能正确的使用分布式锁，可能造成严重的生产环境故障，本文主要对目前遇到的各种分布式锁以及其缺陷做了一个整理，并对如何选择合适的Redis分布式锁给出建议。

# v1.0

## 代码

```
trylock() {
    SETNX Key 1
    Expire Key Seconds
}

release() {
    DEELTE Key
}
```

## 解释

这个版本应该是最简单的版本，也是出现频率很高的一个版本，首先给锁加一个过期时间操作是为了避免应用在服务重启或者异常导致锁无法释放后，不会出现锁一直无法被释放的情况。

## 存在的问题

这个方案的一个问题在于每次提交一个 Redis 请求，如果执行完第一条命令后应用异常或者重启，锁将无法过期。

一种改善方案就是使用Lua脚本（包含SETNX和EXPIRE两条命令），但是如果Redis仅执行了一条命令后crash或者发生主从切换，依然会出现锁没有过期时间，最终导致无法释放。

另外一个问题在于，很多同学在释放分布式锁的过程中，无论锁是否获取成功，都在finally中释放锁，这样是一个锁的错误使用，这个问题将在后续的V3.0版本中解决。

针对锁无法释放问题的一个解决方案基于 GETSET 命令来实现

ps: 也就是命令执行的原子性问题。

# V1.1 基于 GETSET

## 代码

```
release() {
    DELETE key
}

tryLock() {
    NewExpireTime = CurrentTimestamp + ExpireSeconds
    if((SETNX Key NewExpireTime Seconds)) {
        oldExpireTime = GET(key)
        if (oldExpireTime < CurrentTimestamp) {
            NewExpireTime=CurrentTimeSTAMP+ExpireSecond
            CurrentExpireTime = GETSET(Key, NewExpireTime)
            if(CurrentExpireTime - oldExpireTime) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}
```

## 解释

1. SETNX(Key,ExpireTime)获取锁

2. 如果获取锁失败，通过GET(Key)返回的时间戳检查锁是否已经过期

3. GETSET(Key,ExpireTime)修改Value为NewExpireTime

4. 检查GETSET返回的旧值，如果等于GET返回的值，则认为获取锁成功

注意：这个版本去掉了EXPIRE命令，改为通过Value时间戳值来判断过期

## 问题

1. 在锁竞争较高的情况下，会出现Value不断被覆盖，但是没有一个Client获取到锁

2. 在获取锁的过程中不断的修改原有锁的数据，设想一种场景C1，C2竞争锁，C1获取到了锁，C2锁执行了GETSET操作修改了C1锁的过期时间，如果C1没有正确释放锁，锁的过期时间被延长，其它Client需要等待更久的时间

# V2.0 基于SETNX

## 代码

```
trylock() {
    SETNX key 1 seconds
}
```

Redis 2.6.12版本后 SETNX 增加过期时间参数，这样就解决了两条命令无法保证原子性的问题。

## 问题场景

但是设想下面一个场景：

1. C1成功获取到了锁，之后C1因为GC进入等待或者未知原因导致任务执行过长，最后在锁失效前C1没有主动释放锁 

2. C2在C1的锁超时后获取到锁，并且开始执行，这个时候C1和C2都同时在执行，会因重复执行造成数据不一致等未知情况 

3. C1如果先执行完毕，则会释放C2的锁，此时可能导致另外一个C3进程获取到了锁

![unsafe-lock.png](http://martin.kleppmann.com/2016/02/unsafe-lock.png)

## 存在问题：

1. 由于C1的停顿导致C1 和C2同都获得了锁并且同时在执行，在业务实现间接要求必须保证幂等性

2. C1释放了不属于C1的锁

# V3.0

## 编码

```
trylock() {
    SETNX Key UnixTimestamp Secoonds
}

release() {
    EVAL (
        //Lua scipt
        if redis.call("get", KEYS[1] == ARGV[1]) then
            return redis.call("del", KEYS[1])
        else
            return 0
        end        
    )
}
```

这个方案通过指定Value为时间戳，并在释放锁的时候检查锁的Value是否为获取锁的Value，

避免了V2.0版本中提到的C1释放了C2持有的锁的问题；

另外在释放锁的时候因为涉及到多个Redis操作，并且考虑到Check And Set 模型的并发问题，所以使用Lua脚本来避免并发问题。

## 存在问题

如果在并发极高的场景下，比如抢红包场景，可能存在UnixTimestamp重复问题，

另外由于不能保证分布式环境下的物理时钟一致性，也可能存在UnixTimestamp重复问题，只不过极少情况下会遇到。

# v3.1 最后的方案

## 编码

```
trylock() {
    SETNX Key UniqID Secoonds
}

release() {
    EVAL (
        //Lua scipt
        if redis.call("get", KEYS[1] == ARGV[1]) then
            return redis.call("del", KEYS[1])
        else
            return 0
        end        
    )
}
```

Redis 2.6.12后SET同样提供了一个NX参数，等同于SETNX命令，

官方文档上提醒后面的版本有可能去掉SETNX, SETEX, PSETEX,并用SET命令代替，

另外一个优化是使用一个自增的唯一UniqId代替时间戳来规避V3.0提到的时钟问题。

## 问题

这个方案是目前最优的分布式锁方案，但是如果在Redis集群环境下依然存在问题：

由于Redis集群数据同步为异步，假设在Master节点获取到锁后未完成数据同步情况下Master节点crash，此时在新的Master节点依然可以获取锁，所以多个Client同时获取到了锁

## 个人理解

这里其实用 id 代替时间戳，换言之将问题转换为如何生成一个分布式的 id 上。

参考: [分布式 id 的生成](https://houbb.github.io/2018/09/05/distributed-id-01-overview-01)



# RedLock 

可以参考作者的设计

[RedLock](https://redis.io/topics/distlock)

# 参考资料

[Redis 分布式锁进化史解读+缺陷分析](https://mp.weixin.qq.com/s/8FYMUpaBcgOZ9lEqt-0PKg)

[how-to-do-distributed-locking](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)

* any list
{:toc}
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

# jedis 实现一

这个实例不够规范，(没有实现 Lock 接口)。只是以工具类的方式，初步分析一下实现的思路。

## 引入 jar

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>2.8.1</version>
</dependency>
```

## 加锁实现

### 实现代码

- JedisLockUtil.java

```java
public class JedisLockUtil {
    private static final String LOCK_SUCCESS         = "OK";
    private static final String SET_IF_NOT_EXIST     = "NX";
    private static final String SET_WITH_EXPIRE_TIME = "PX";

    /**
     * 尝试获取分布式锁
     *
     * @param jedis      Redis客户端
     * @param lockKey    锁
     * @param requestId  请求标识
     * @param expireTime 超期时间
     * @return 是否获取成功
     */
    public static boolean tryLock(Jedis jedis, String lockKey, String requestId, int expireTime) {
        String result = jedis.set(lockKey, requestId, SET_IF_NOT_EXIST, SET_WITH_EXPIRE_TIME, expireTime);
        return LOCK_SUCCESS.equals(result);
    }
}
```

- 参数说明

第一个为 key，我们使用key来当锁，因为key是唯一的。

第二个为 value，我们传的是 requestId，很多童鞋可能不明白，有key作为锁不就够了吗，为什么还要用到value？原因就是我们在上面讲到可靠性时，分布式锁要满足第四个条件解铃还须系铃人，通过给 value 赋值为 requestId，我们就知道这把锁是哪个请求加的了，在解锁的时候就可以有依据。

第三个为 nxxx，这个参数我们填的是 NX，意思是`SET IF NOT EXIST`，即当key不存在时，我们进行set操作；若key已经存在，则不做任何操作；

第四个为 expx，这个参数我们传的是 PX，意思是我们要给这个 key 加一个过期的设置，具体时间由第五个参数决定。

第五个为 time，与第四个参数相呼应，代表 key 的过期时间。

- 结果分析

总的来说，执行上面的set()方法就只会导致两种结果：

1. 当前没有锁（key不存在），那么就进行加锁操作，并对锁设置个有效期，同时value表示加锁的客户端。

2. 已有锁存在，不做任何操作。

我们的加锁代码满足我们可靠性里描述的三个条件。

首先，set()加入了NX参数，可以保证如果已有key存在，则函数不会调用成功，也就是只有一个客户端能持有锁，满足互斥性。

其次，由于我们对锁设置了过期时间，即使锁的持有者后续发生崩溃而没有解锁，锁也会因为到了过期时间而自动解锁（即key被删除），不会发生死锁。

最后，因为我们将value赋值为requestId，代表加锁的客户端请求标识，那么在客户端在解锁的时候就可以进行校验是否是同一个客户端。

由于我们只考虑Redis单机部署的场景，所以容错性我们暂不考虑。

- 缺陷

这里可以给定很多默认值。

requestId 是否可以不暴露给调用者？

大概如下的感觉：

```
lock.tryLock("key");
```

- 拓展阅读

各种 id 的生成，可以参考。

[分布式 id](https://houbb.github.io/2018/09/05/distributed-id)

### 错误实现

- 错误实现一

```java
public static void wrongGetLock1(Jedis jedis, String lockKey, String requestId, int expireTime) {
 
    Long result = jedis.setnx(lockKey, requestId);
    if (result == 1) {
        // 若在这里程序突然崩溃，则无法设置过期时间，将发生死锁
        jedis.expire(lockKey, expireTime);
    }
 
}
```

setnx()方法作用就是SET IF NOT EXIST，expire()方法就是给锁加一个过期时间。

乍一看好像和前面的set()方法结果一样，然而由于这是两条Redis命令，不具有原子性，如果程序在执行完setnx()之后突然崩溃，导致锁没有设置过期时间。

那么将会发生死锁。网上之所以有人这样实现，是因为低版本的jedis并不支持多参数的set()方法。

- 错误示例2

这一种错误示例就比较难以发现问题，而且实现也比较复杂。

实现思路：使用jedis.setnx()命令实现加锁，其中key是锁，value是锁的过期时间。

执行过程：

1. 通过setnx()方法尝试加锁，如果当前锁不存在，返回加锁成功。

2. 如果锁已经存在则获取锁的过期时间，和当前时间比较，如果锁已经过期，则设置新的过期时间，返回加锁成功。

代码如下：

```java
public static boolean wrongGetLock2(Jedis jedis, String lockKey, int expireTime) {
 
    long expires = System.currentTimeMillis() + expireTime;
    String expiresStr = String.valueOf(expires);
 
    // 如果当前锁不存在，返回加锁成功
    if (jedis.setnx(lockKey, expiresStr) == 1) {
        return true;
    }
 
    // 如果锁存在，获取锁的过期时间
    String currentValueStr = jedis.get(lockKey);
    if (currentValueStr != null && Long.parseLong(currentValueStr) < System.currentTimeMillis()) {
        // 锁已过期，获取上一个锁的过期时间，并设置现在锁的过期时间
        String oldValueStr = jedis.getSet(lockKey, expiresStr);
        if (oldValueStr != null && oldValueStr.equals(currentValueStr)) {
            // 考虑多线程并发的情况，只有一个线程的设置值和当前值相同，它才有权利加锁
            return true;
        }
    }
 
    // 其他情况，一律返回加锁失败
    return false;
}
```

那么这段代码问题在哪里？

1. 由于是客户端自己生成过期时间，所以需要强制要求分布式下每个客户端的时间必须同步。 

2. 当锁过期的时候，如果多个客户端同时执行jedis.getSet()方法，那么虽然最终只有一个客户端可以加锁，但是这个客户端的锁的过期时间可能被其他客户端覆盖。

3. 锁不具备拥有者标识，即任何客户端都可以解锁。

## 解锁实现

### 代码实现

- releaseLock

```java
public class JedisLockUtil {

    private static final Long RELEASE_SUCCESS = 1L;

    /**
     * 释放分布式锁
     *
     * @param jedis     Redis客户端
     * @param lockKey   锁
     * @param requestId 请求标识
     * @return 是否释放成功
     */
    public static boolean releaseLock(Jedis jedis, String lockKey, String requestId) {
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
        Object result = jedis.eval(script, Collections.singletonList(lockKey), Collections.singletonList(requestId));
        return RELEASE_SUCCESS.equals(result);
    }
}
```

- 解释

此处使用了 lua 脚本。

代码的功能：

其实很简单，首先获取锁对应的value值，检查是否与requestId相等，如果相等则删除锁（解锁）。

那么为什么要使用Lua语言来实现呢？因为要确保上述操作是原子性的。

那么为什么执行eval()方法可以确保原子性，源于Redis的特性，下面是官网对eval命令的部分解释：

### eval 的原子性

```
Atomicity of scripts
Redis uses the same Lua interpreter to run all the commands. Also Redis guarantees that a script is executed in an atomic way: no other script or Redis command will be executed while a script is being executed. This semantic is similar to the one of MULTI / EXEC. From the point of view of all the other clients the effects of a script are either still not visible or already completed.

However this also means that executing slow scripts is not a good idea. It is not hard to create fast scripts, as the script overhead is very low, but if you are going to use slow scripts you should be aware that while the script is running no other client can execute commands.
```

简单来说，就是在eval命令执行Lua代码的时候，Lua代码将被当成一个命令去执行，并且直到eval命令执行完成，Redis才会执行其他命令。

### 错误实例

- 错误1

最常见的解锁代码就是直接使用 `jedis.del()` 方法删除锁，这种不先判断锁的拥有者而直接解锁的方式，会导致任何客户端都可以随时进行解锁，即使这把锁不是它的。

```java
public static void wrongReleaseLock1(Jedis jedis, String lockKey) {
    jedis.del(lockKey);
}
```

- 错误2

如代码注释，问题在于如果调用jedis.del()方法的时候，这把锁已经不属于当前客户端的时候会解除他人加的锁。

那么是否真的有这种场景？

答案是肯定的，比如客户端A加锁，一段时间之后客户端A解锁，在执行jedis.del()之前，锁突然过期了，此时客户端B尝试加锁成功，然后客户端A再执行del()方法，则将客户端B的锁给解除了。

```java
public static void wrongReleaseLock2(Jedis jedis, String lockKey, String requestId) {
    // 判断加锁与解锁是不是同一个客户端
    if (requestId.equals(jedis.get(lockKey))) {
        // 若在此时，这把锁突然不是这个客户端的，则会误解锁
        jedis.del(lockKey);
    }
}
```

### 拓展阅读

[lua](https://houbb.github.io/2018/09/09/lua)

# jedis 实现二

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
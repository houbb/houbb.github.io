---
layout: post
title:  Redis 分布式锁 redis lock
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

# 知识准备

谈起redis锁，下面三个，算是出现最多的高频词汇：

setnx

redLock

redisson

## setnx

其实目前通常所说的setnx命令，并非单指redis的 `setnx key value` 这条命令。

一般代指redis中对set命令加上nx参数进行使用 set 这个命令，目前已经支持这么多参数可选：

```
SET key value [EX seconds|PX milliseconds] [NX|XX] [KEEPTTL]
```

当然了，就不在文章中默写Api了，基础参数还有不清晰的，可以蹦到官网。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0902/093732_a57625a9_508704.png)

上图是setnx大致原理，主要依托了它的**key不存在才能set成功的特性**，进程A拿到锁，在没有删除锁的Key时，进程B自然获取锁就失败了。

### 为什么设置超时时间？

那么为什么要使用 PX 30000 去设置一个超时时间？

是怕进程A不讲道理啊，锁没等释放呢，万一崩了，直接原地把锁带走了，导致系统中谁也拿不到锁。

就算这样，还是不能保证万无一失。

### 如何保证只能操作自己的锁？

如果进程A又不讲道理，操作锁内资源超过设置的超时时间，那么就会导致其他进程拿到锁，等进程A回来了，回手就是把其他进程的锁删了，如图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0902/094007_1a9e7104_508704.png)

还是刚才那张图，将T5时刻改成了锁超时，被redis释放。

进程B在T6开开心心拿到锁不到一会，进程A操作完成，回手一个del，就把锁释放了。

当进程B操作完成，去释放锁的时候（图中T8时刻），发现自己锁没了。

找不到锁其实还算好的，万一T7时刻有个进程C过来加锁成功，那么进程B就把进程C的锁释放了。

以此类推，进程C可能释放进程D的锁，进程D....(禁止套娃)，具体什么后果就不得而知了。

所以在用setnx的时候，key虽然是主要作用，但是value也不能闲着，可以设置一个唯一的客户端ID，或者用UUID这种随机数。

当解锁的时候，先获取value判断是否是当前进程加的锁，再去删除。

伪代码：

```
String uuid = xxxx;
// 伪代码，具体实现看项目中用的连接工具
// 有的提供的方法名为set 有的叫setIfAbsent
set Test uuid NX PX 3000
try{
// biz handle....
} finally {
    // unlock
    if(uuid.equals(redisTool.get('Test')){
        redisTool.del('Test');
    }
}
```

这回看起来是不是稳了。

相反，这回的问题更明显了，在finally代码块中，get和del并非原子操作，还是有进程安全问题。

## 原子性问题

为什么有问题还说这么多呢？

第一，搞清劣势所在，才能更好的完善。

第二点，其实上文中最后这段代码，还是有很多公司在用的。

那么删除锁的正确姿势之一，就是可以使用lua脚本，通过redis的eval/evalsha命令来运行：

目的：保证查询和删除的原子性。

### 伪代码

```
-- lua删除锁：
-- KEYS和ARGV分别是以集合方式传入的参数，对应上文的Test和uuid。
-- 如果对应的value等于传入的uuid。
if redis.call('get', KEYS[1]) == ARGV[1]
    then
 -- 执行删除操作
        return redis.call('del', KEYS[1])
    else
 -- 不成功，返回0
        return 0
end
```

通过lua脚本能保证原子性的原因说的通俗一点：

就算你在lua里写出花，执行也是一个命令(eval/evalsha)去执行的，一条命令没执行完，其他客户端是看不到的。







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

[redis lock 实现](https://houbb.github.io/2019/01/07/redis-lock)

# jedis 实现二

# redlock

# Redisson

那么既然这么麻烦，有没有比较好的工具呢？

就要说到redisson了。

介绍redisson之前，笔者简单解释一下为什么现在的setnx默认是指set命令带上nx参数，而不是直接说是setnx这个命令。

因为redis版本在2.6.12之前，set是不支持nx参数的，如果想要完成一个锁，那么需要两条命令：

```
1. setnx Test uuid
2. expire Test 30
```

即放入Key和设置有效期，是分开的两步，理论上会出现1刚执行完，程序挂掉，无法保证原子性。

但是早在2013年，也就是7年前，Redis就发布了2.6.12版本，并且官网(set命令页)，也早早就说明了“SETNX, SETEX, PSETEX可能在未来的版本中，会弃用并永久删除”。

曾阅读过一位大佬的文章，其中就有一句指导入门者的面试小套路，具体文字忘记了，大概意思如下：

说到redis锁的时候，可以先从setnx讲起，最后慢慢引出set命令的可以加参数，可以体现出自己的知识面。

如果有缘你也阅读过这篇文章，并且学到了这个套路，作为本文的笔者我要加一句提醒：

请注意你的工作年限！首先回答官网表明即将废弃的命令，再引出set命令七年前的“新特性”，如果是刚毕业不久的人这么说，面试官会以为自己穿越了。

你套路面试官，面试官也会套路你。  -- vt・沃兹基硕德

## 特性

Redisson是java的redis客户端之一，提供了一些api方便操作redis。

但是redisson这个客户端可有点厉害，笔者在官网截了仅仅是一部分的图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0902/094652_aa414fd0_508704.png)

这个特性列表可以说是太多了，是不是还看到了一些JUC包下面的类名，redisson帮我们搞了分布式的版本，比如AtomicLong，直接用RedissonAtomicLong就行了，连类名都不用去新记，很人性化了。

锁只是它的冰山一角，并且从它的wiki页面看到，对主从，哨兵，集群等模式都支持，当然了，单节点模式肯定是支持的。

本文还是以锁为主，其他的不过多介绍。

Redisson普通的锁实现源码主要是RedissonLock这个类，还没有看过它源码的盆友，不妨去瞧一瞧。

源码中加锁/释放锁操作都是用lua脚本完成的，封装的非常完善，开箱即用。

这里有个小细节，加锁使用setnx就能实现，也采用lua脚本是不是多此一举？

笔者也非常严谨的思考了一下：这么厉害的东西哪能写废代码？

其实仔细看了一下，加锁解锁的lua脚本考虑的非常全面，其中就包括锁的重入性，这点可以说是考虑非常周全。

## 源码浅析







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
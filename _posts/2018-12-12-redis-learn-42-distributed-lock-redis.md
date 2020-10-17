---
layout: post
title:  Redis 分布式锁 redis lock
date:  2018-09-08 11:07:16 +0800
categories: [Distributed]
tags: [distributed, redis, lock, sql, zookeeper, sh]
published: true
excerpt: Redis 分布式锁原理及其代码实现。
---

# 为什么需要分布式锁

在 jdk 中为我们提供了加锁的方式：

（1）synchronized 关键字

（2）volatile + CAS 实现的乐观锁

（3）ReadWriteLock 读写锁

（4）ReenTrantLock 可重入锁

等等，这些锁为我们变成提供极大的便利性，保证在多线程的情况下，保证线程安全。

但是在分布式系统中，上面的锁就统统没用了。

我们想要解决分布式系统中的并发问题，就需要引入分布式锁的概念。

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

多快好省一直使我们追求的目标，加锁带来的时间消耗太大，肯定使我们不想见到的。

- 锁的公平性

避免饱汉子不知饿汉子饥，饿汉子不知饱汉子虚。保证锁的公平性也比较重要。

分布式锁的实现方式多种多样，此处选择比较流行的 redis 进行我们的 redis 锁实现。

# 单机版 Redis 的实现

我们首先来看一下 antirez 的实现 RedLock，这个也是一种流传比较广泛的版本。

antirez 是谁？

是 redis 的作者，那么一个写 redis 的，真的懂锁吗？

## 加锁的实现

只需要下面的一条命令：

```
SET resource_name my_random_value NX PX 30000
```

看起来非常简单，但是其中还是有很多学问的。

### setnx

其实目前通常所说的setnx命令，并非单指redis的 `setnx key value` 这条命令。

一般代指redis中对set命令加上nx参数进行使用 set 这个命令，目前已经支持这么多参数可选：

```
SET key value [EX seconds|PX milliseconds] [NX|XX] [KEEPTTL]
```

主要依托了它的**key不存在才能set成功的特性**，个人理解类似于 putIfAbsent

### PX 30000

为什么需要设置过期时间？

根据墨菲定律，如果一件事情可能发生，那么他就一定会发生。

如果当前锁的持有者挂掉了，他持有的锁永远也无法释放，那岂不是太悲剧了。

于是我们设定一个过期时间，让 redis 为我们做一次兜底工作。

一般这个超时时间可以根据自己的业务灵活调整，大部分都不会超过 10min。

真正的高并发，如果锁住了 10min，带来的经济损失也是比较客观的。但是总比一直锁住强的太多。

### my_random_value 有什么用

细心的同学一定发现了这里的 value 是一个 my_random_value，一个随机值。

这个值是用来做什么的？

其实这个值是一种标识，最大的作用就是**解铃还须系铃人**。

不能你在洗手间锁上门，准备解放身心的时候，别人直接把门打开了，这样不就乱了套了。

我们可以让一个线程持有唯一的标识，这样在解锁的时候就知道这个锁是属于自己的，大家井然有序，社会和平美好。

## 释放锁的实现

在完成操作之后，通过以下Lua脚本来释放锁：

```lua
if redis.call("get",KEYS[1]) == ARGV[1] then
    return redis.call("del",KEYS[1])
else
    return 0
end
```

### 保证是锁的持有者

这里是先确认资源对应的value与客户端持有的value是否一致，如果一致的话就释放锁。

### 保证原子性

注意上面的脚本是通过 lua 脚本实现的，必须是一个原子性操作。

- eval 的原子性

```
Atomicity of scripts
Redis uses the same Lua interpreter to run all the commands. Also Redis guarantees that a script is executed in an atomic way: no other script or Redis command will be executed while a script is being executed. This semantic is similar to the one of MULTI / EXEC. From the point of view of all the other clients the effects of a script are either still not visible or already completed.

However this also means that executing slow scripts is not a good idea. It is not hard to create fast scripts, as the script overhead is very low, but if you are going to use slow scripts you should be aware that while the script is running no other client can execute commands.
```

直接翻译：

```
脚本的原子性

Redis使用相同的Lua解释器来运行所有命令。 另外，Redis保证以原子方式执行脚本：执行脚本时不会执行其他脚本或Redis命令。 这种语义类似于MULTI / EXEC中的一种。 从所有其他客户端的角度来看，脚本的效果还是不可见或已经完成。

但是，这也意味着执行慢速脚本不是一个好主意。 创建快速脚本并不难，因为脚本开销非常低，但是如果要使用慢速脚本，则应注意，在脚本运行时，没有其他客户端可以执行命令。
```

## java 代码的实现

### maven 引入

```xml
<dependency>
     <groupId>redis.clients</groupId>
     <artifactId>jedis</artifactId>
     <version>${jedis.version}</version>
 </dependency>
```

### 获取锁

```java
/**
 * 尝试获取分布式锁
 *
 * expireTimeMills 保证当前进程挂掉，也能释放锁
 *
 * requestId 保证解锁的是当前进程（锁的持有者）
 *
 * @param lockKey         锁
 * @param requestId       请求标识
 * @param expireTimeMills 超期时间
 * @return 是否获取成功
 * @since 0.0.1
 */
@Override
public boolean lock(String lockKey, String requestId, int expireTimeMills) {
    String result = jedis.set(lockKey, requestId, LockRedisConst.SET_IF_NOT_EXIST, LockRedisConst.SET_WITH_EXPIRE_TIME, expireTimeMills);
    return LockRedisConst.LOCK_SUCCESS.equals(result);
}
```

### 释放锁

```java
/**
 * 解锁
 *
 * （1）使用 requestId，保证为当前锁的持有者
 * （2）使用 lua 脚本，保证执行的原子性。
 *
 * @param lockKey   锁 key
 * @param requestId 请求标识
 * @return 结果
 * @since 0.0.1
 */
@Override
public boolean unlock(String lockKey, String requestId) {
    String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
    Object result = jedis.eval(script, Collections.singletonList(lockKey), Collections.singletonList(requestId));
    return LockRedisConst.RELEASE_SUCCESS.equals(result);
}
```

> 完整代码：[https://github.com/houbb/lock](https://github.com/houbb/lock)

# RedLock

看到这里，你是不是觉得上面的实现已经很完美了？

但是遗憾的是，上面的实现有一个致命的缺陷，那就是单点问题。

当锁服务所在的redis节点宕机时，会导致锁服务不可用，数据恢复之后可能会丢失部分锁数据。

为了解决明显的单点问题，antirez 设计提出了RedLock算法。

antirez 是何许人也？

如果你知道 redis，你就应该知道他。

## 实现步骤

RedLock的实现步骤可以看成下面几步：

1. 获取当前时间t1，精确到毫秒；

2. 依次向锁服务所依赖的N个节点发送获取锁的请求，加锁的操作和上面单节点的加锁操作请求相同；

3. 如果获取了超过半数节点的资源锁(>=N/2+1)，则计算获取锁所花费的时间，计算方法是用当前时间t2减去t1，如果花费时间小于锁的过期时间，则成功的获取了锁；

4. 这时锁的实际有效时间是设置的有效时间t0减去获取锁花费的时间(t2-t1)；

5. 如果在第3步没有成功的获取锁，需要向所有的N个节点发送释放锁的请求，释放锁的操作和上面单节点释放锁操作一致；

由于引入了多节点的redis集群，RedLock的可用性明显是大于单节点的锁服务的。

## 节点故障重启

这里需要说明一个节点故障重启的例子：

1. client1向5个节点请求锁，获取了a,b,c上的锁；

2. b节点故障重启，丢失了client1申请的锁；

3. client2向5个节点请求锁，获取了b,d,e上的锁；

这里例子中，从客户端角度来看，有两个客户端合法的在同一时间都持有同一资源的锁，关于这个问题，antirez提出了延迟重启(delayed restarts)的概念：在节点宕机之后，不要立即重启恢复服务，而是至少经过一个完整锁有效周期之后再启动恢复服务，这样可以保证节点因为宕机而丢失的锁数据一定因为过期而失效。

接下来就是比较有趣的部分了。

# Martin Flower 的分析

Martin Flower 首先说明，在没有fencing token的保证之下，锁服务可能出现的问题，他给出了下面的图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0910/211358_78694d65_508704.png)

Martin Flower 又是谁？

被称为软件开发教父的男人。以前拜读过其写的《重构》一书，确实厉害。

不怕大佬有文化，就怕大佬会说话。我们天天吹的微服务，就是 Matrin 大佬提出的。

【Martin.jpg】

## 客户端停顿导致锁失效

上图说明的问题可以描述成下面的步骤：

1. client1成功获取了锁，之后陷入了长时间GC中，直到锁过期；

2. client2在client1的锁过期之后成功的获取了锁，并去完成数据操作；

3. client1从GC中恢复，从它本身的角度来看，并不会意识到自己持有的锁已经过期，去操作数据；

从上面的例子看出，这里的锁服务提供了完整的互斥锁语义保证，从资源的角度来看，两次操作都是合法的。

上面提到，RedLock根据随机字符串来作为单次锁服务的token，这就意味着对于资源而言，无法根据锁token来区分client持有的锁所获取的先后顺序。

为此，Martin引入了fencing token机制，fencing token可以理解成采用全局递增的序列替代随机字符串，作为锁token来使用。

这样就可以从资源侧确定client所携带锁的获取先后顺序了。

![客户端停顿导致锁失效](https://images.gitee.com/uploads/images/2020/0910/211634_6a5d23d9_508704.png)

大佬就是大佬，张口就来 GC。

GC 对于 java go 这种语言大家肯定不陌生，对于写 C/C++ 的开发者肯定很少接触。

## fencing token机制

除了没有fencing机制保证之外，Martin还指出，RedLock依赖时间同步不同节点之间的状态这种做法有问题。

具体可以看个例子：

1. client1获取节点a,b,c上的锁；

2. 节点c由于时间同步，发生了时钟漂移，时钟跳跃导致client1获取的锁失效；

3. client2获取节点c,d,e上的锁；

本质上来看，RedLock通过不同节点的时钟来进行锁状态的同步。

而在分布式系统中，物理时钟本身就有可能出现问题，也就是说，RedLock的安全性保证建立在物理时钟没问题的假设上。

分布式系统中不同节点的协调一般不使用物理时钟作为度量，相应的，Lamport提出逻辑时钟作为分布式事件先后顺序的度量。

## 引入锁的目的

Martin还指出，引入锁的主要目的无非以下两个：

1. 为了资源效率，避免不必要的重复昂贵计算；

2. 为了正确性，保证数据正确；

对于第一点而言，采用单redis节点的锁就可以满足需求；对于第二点而言，则需要借助更严肃的分布式协调系统（如zookeeper，etcd，consul等等）。

# antirez 的反驳

在Martin发表自己对RedLock的分析之后，antirez也发表了自己的反驳。

针对Martin提出的两点质疑，antirez分别提出反驳：

1. 首先，antirez认为在RedLock中，虽然没有用到fencing保证机制，但是随机字符串token也可以提供client到具体锁的匹配映射；

2. 其次，antirez认为分布式系统中的物理时钟可以通过良好的运维来保证；

## 个人理解

关于第一点，随机的 token 确实可以和客户端做映射。但是这并没有什么卵用，除非我们再多加一个字段，标识时间或者是顺序。

如果这么做，不如直接使用一个 fetching token。

关于第二点，将开发的锅直接推到运维头上了，也不是不可以，可惜大部分的现实情况总是没有那么美好。

不过随着云技术的兴起，也许有一天所有的应用都在云上，然后各大云厂商统一运维，也不是不能解决这个问题。

但是 antirez 的反驳确实没有说服我，所以我选择 —— Matrin 的简化版本。

【我选我.jpg】

# 一种实现方案

## 整体思路

我们在 antirez 的基础上做一点点改进，引入 Matrin 提出的 fetching token 来解决 GC 的问题。

## 加锁

client先获取一个fencing token，携带fencing token去获取资源相关的锁，这时出现两种情况：

1. 锁已被占用，且锁的fencing token大于此时client的fencing token，这种情况的主要原因是client在获取fencing token之后出现了长时间GC；

2. 锁已被占用，且锁的fencing token小于此时的client的fencing token，这种情况就是之前有其他客户端成功持有了锁且还没有释放（这里的释放包括client主动释放和锁超时之后的被动释放）；

3. 锁未被占用，成功加锁；

## 解锁

解锁和 antirez 的方案类似，直接采用 lua 脚本释放。

对于锁的持有者也是大同小异。

## 不足

当然这个方案的优点是可以解决 GC 问题，缺点依然比较明显，就是无法解决 redis 单点问题。

不过我个人的工作经验中，redis 一般都是采用集群的方式，所以单点问题并没有那么严重。

就像我们平时存储分布式 session 一样。

当然，问题还是要面对的，解决方案也是有的。

## 其他方案

数据库实现 [https://houbb.github.io/2018/09/08/distributed-lock-sql](https://houbb.github.io/2018/09/08/distributed-lock-sql)

zookeeper 实现 [https://houbb.github.io/2018/09/08/distributed-lock-zookeeper](https://houbb.github.io/2018/09/08/distributed-lock-zookeeper)

只不过性能和维护的复杂度，这些问题都需要我们去权衡。

----------------------------------------------------------------------------------------

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

直接翻译：

```
脚本的原子性

Redis使用相同的Lua解释器来运行所有命令。 另外，Redis保证以原子方式执行脚本：执行脚本时不会执行其他脚本或Redis命令。 这种语义类似于MULTI / EXEC中的一种。 从所有其他客户端的角度来看，脚本的效果还是不可见或已经完成。

但是，这也意味着执行慢速脚本不是一个好主意。 创建快速脚本并不难，因为脚本开销非常低，但是如果要使用慢速脚本，则应注意，在脚本运行时，没有其他客户端可以执行命令。
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
---
layout: post
title: redis 分布式锁设计 redis lock RedLock
date: 2019-1-7 19:29:47 +0800
categories: [Distributed]
tags: [redis, lock, distributed-lock, sh]
published: true
---

# RedLock

在redis的官网上，可以很方便的查到一个分布式锁的实现：RedLock。

那就先简单说下，redis作者antirez对于分布式锁是如何设计的吧。

## 基于单redis节点的锁

首先，获取锁采用类似下面的命令：

```
SET resource_name my_random_value NX PX 30000
```

这条命令尝试去获取一个资源的锁，这里的锁过期时间是30000毫秒。
在完成操作之后，通过以下Lua脚本来释放锁：

```lua
if redis.call("get",KEYS[1]) == ARGV[1] then
    return redis.call("del",KEYS[1])
else
    return 0
end
```

这里是先确认资源对应的value与客户端持有的value是否一致，如果一致的话就释放锁。

这里需要说明几点：

1.锁需要有一个超时时间，这个时长需要略长于操作所需的时间，以备在客户端获取锁之后宕机的情况下，锁也可以安全释放。这种带有效期的锁，通常也被叫做租约；

2.在解锁的时候，实际上进行的是一个 `get and del` 的操作，需要确认是释放由客户端自己申请的锁，且get和del操作之间不要有其他操作插入，所以采用lua脚本来做原子保证。

值得注意的是，当锁服务所在的redis节点宕机时，会导致锁服务不可用，数据恢复之后可能会丢失部分锁数据。当然，关于redis数据持久化和恢复，就是另一个话题了。

为了解决明显的单点问题，antirez设计提出了RedLock算法。

RedLock基于完全独立的N个节点（通常推荐N = 5，一般可以把N看做是一个大于1的奇数）。


### 实现步骤拆分

RedLock的实现步骤可以看成下面几步：

获取当前时间t1，精确到毫秒；

依次向锁服务所依赖的N个节点发送获取锁的请求，加锁的操作和上面单节点的加锁操作请求相同；

如果获取了超过半数节点的资源锁(>=N/2+1)，则计算获取锁所花费的时间，计算方法是用当前时间t2减去t1，如果花费时间小于锁的过期时间，则成功的获取了锁；

这时锁的实际有效时间是设置的有效时间t0减去获取锁花费的时间(t2-t1)；

如果在第3步没有成功的获取锁，需要向所有的N个节点发送释放锁的请求，释放锁的操作和上面单节点释放锁操作一致；

由于引入了多节点的redis集群，RedLock的可用性明显是大于单节点的锁服务的。

- 节点故障重启

这里需要说明一个节点故障重启的例子：

1. client1向5个节点请求锁，获取了a,b,c上的锁；

2. b节点故障重启，丢失了client1申请的锁；

3. client2向5个节点请求锁，获取了b,d,e上的锁；

这里例子中，从客户端角度来看，有两个客户端合法的在同一时间都持有同一资源的锁，关于这个问题，antirez提出了延迟重启(delayed restarts)的概念：在节点宕机之后，不要立即重启恢复服务，而是至少经过一个完整锁有效周期之后再启动恢复服务，这样可以保证节点因为宕机而丢失的锁数据一定因为过期而失效。


# Martin的分析

Martin首先说明，在没有fencing token的保证之下，锁服务可能出现的问题，他给出了下面的图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0910/211358_78694d65_508704.png)

## 客户端停顿导致锁失效

上图说明的问题可以描述成下面的步骤：

1. client1成功获取了锁，之后陷入了长时间GC中，直到锁过期；

2. client2在client1的锁过期之后成功的获取了锁，并去完成数据操作；

3. client1从GC中恢复，从它本身的角度来看，并不会意识到自己持有的锁已经过期，去操作数据；

从上面的例子看出，这里的锁服务提供了完整的互斥锁语义保证，从资源的角度来看，两次操作都是合法的。

上面提到，RedLock根据随机字符串来作为单次锁服务的token，这就意味着对于资源而言，无法根据锁token来区分client持有的锁所获取的先后顺序。

为此，Martin引入了fencing token机制，fencing token可以理解成采用全局递增的序列替代随机字符串，作为锁token来使用。

这样就可以从资源侧确定client所携带锁的获取先后顺序了。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0910/211634_6a5d23d9_508704.png)

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

1. 首先，antirez认为在RedLock中，虽然没有用到fencing保证机制，但是随机字符串token也可以提供client到具体锁的匹配映射（这点个人不敢苟同，具体原因后面分析）；

2. 其次，antirez认为分布式系统中的物理时钟可以通过良好的运维来保证；

# 个人理解

在整个论证的过程中，个人比较倾向于Martin的看法，antirez的反驳在我看来是没有真正说明RedLock安全性问题的。

首先，我设计的Redis锁服务是基于单个redis节点的，在锁服务上，基本和antirez描述的单redis节点的锁服务操作相同，唯一的不同在于采用Martin提出的fencing token替换antirez的随机字符串，整个过程如下：

## 整体过程

### 加锁操作

client先获取一个fencing token，携带fencing token去获取资源相关的锁，这时出现两种情况：

1. 锁已被占用，且锁的fencing token大于此时client的fencing token，这种情况的主要原因是client在获取fencing token之后出现了长时间GC；

2. 锁已被占用，且锁的fencing token小于此时的client的fencing token，这种情况就是之前有其他客户端成功持有了锁且还没有释放（这里的释放包括client主动释放和锁超时之后的被动释放）；

3. 锁未被占用，成功加锁；

### 解锁操作

这里解锁操作和antirez提出的单节点情况一样，是一个借助lua脚本实现的原子 `get compare and del` 的操作；

### 校验token情况

这里引入了对于fencing token的校验操作，有条件的情况下，可以在资源侧被操作前进行fencing token的校验，保证能够操作资源的client持有的锁依次递增；

## 缺点

这里缺点和antirez提出的缺点类似，主要出现在可用性和安全性上，包括两点：

1. redis节点宕机造成锁服务完全不可用；

2. redis节点故障恢复导致锁数据丢失的问题；

其中第一点在单点服务中无可避免，只能够通过良好的运维和故障转移来提高redis节点的可用性，对于第二点，可以通过必要的校验token操作来保证。

## 优点

相比RedLock，拥有更好的性能，简单比较一下，一次RedLock加锁操作需要至少N次redis请求，如果加锁时间过程，则需要2*N次redis请求（N次加锁，N次解锁），而我的设计中，只需要2次redis请求（一次生成fencing token，一次加锁）。

相比antirez提出的单redis节点锁的方案，引入fencing token可以更有利于开发者判断系统究竟发生了什么。

简单的比较fencing token就可以在加锁阶段判断出问题所在（是正常的锁未释放还是出现了长时间的GC），校验token的操作可以在资源侧保证访问资源的client顺序严格按照获取锁的顺序。

# 拓展阅读

[ZooKeeper 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-zookeeper)

[SQL 分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-sql)

[分布式 id](https://houbb.github.io/2018/09/05/distributed-id)

# 参考资料

[如何实现分布式锁](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)

[Is Redlock safe?](http://antirez.com/news/101)

[从0设计一个基于Redis的锁服务](https://mp.weixin.qq.com/s/goZDSKaisVJRL_OCL5gOnQ)

[用Redis构建分布式锁-RedLock(真分布)](https://www.cnblogs.com/ironPhoenix/p/6048467.html)

* any list
{:toc}


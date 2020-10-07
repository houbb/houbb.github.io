---
layout: post
title: Redis Learn-20-Memory Expire redis 过期策略
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, lua, sh]
published: true
---

# 内存管理

Redis主要通过控制内存上限和回收策略实现内存管理，本节将围绕这两个方面来介绍Redis如何管理内存。

## 设置内存上限

Redis使用maxmemory参数限制最大可用内存。

限制内存的目的主要有：

- 用于缓存场景，当超出内存上限maxmemory时使用LRU等删除策略释放空间。

- 防止所用内存超过服务器物理内存。

需要注意，maxmemory限制的是Redis实际使用的内存量，也就是used_memory统计项对应的内存。

由于内存碎片率的存在，实际消耗的内存可能会比maxmemory设置的更大，实际使用时要小心这部分内存溢出。

通过设置内存上限可以非常方便地实现一台服务器部署多个Redis进程的内存控制。

比如一台24GB内存的服务器，为系统预留4GB内存，预留4GB空闲内存给其他进程或Redis fork进程，留给Redis16GB内存，这样可以部署4个maxmemory=4GB的Redis进程。

得益于Redis单线程架构和内存限制机制，即使没有采用虚拟化，不同的Redis进程之间也可以很好地实现CPU和内存的隔离性。


# 动态调整内存上限

Redis的内存上限可以通过config set maxmemory进行动态修改，即修改最大可用内存。

例如之前的示例，当发现Redis-2没有做好内存预估，实际只用了不到2GB内存，而Redis-1实例需要扩容到6GB内存才够用，这时可以分别执行如下命令进行调整：

```
Redis-1>config set maxmemory 6GB
Redis-2>config set maxmemory 2GB
```

通过动态修改maxmemory，可以实现在当前服务器下动态伸缩Redis内存的目的。

这个例子过于理想化，如果此时Redis-3和Redis-4实例也需要分别扩容到6GB，这时超出系统物理内存限制就不能简单的通过调整maxmemory来达到扩容的目的，需要采用在线迁移数据或者通过复制切换服务器来达到扩容的目的。

# 内存回收策略

Redis的内存回收机制主要体现在以下两个方面：

- 删除到达过期时间的键对象。

- 内存使用达到maxmemory上限时触发内存溢出控制策略。

# 删除过期键对象

Redis所有的键都可以设置过期属性，内部保存在过期字典中。

由于进程内保存大量的键，维护每个键精准的过期删除机制会导致消耗大量的CPU，对于单线程的Redis来说成本过高，因此Redis采用惰性删除和定时任务删除机制实现过期键的内存回收。

## 定时删除

含义：在设置key的过期时间的同时，为该key创建一个定时器，让定时器在key的过期时间来临时，对key进行删除

优点：保证内存被尽快释放

缺点：

若过期key很多，删除这些key会占用很多的CPU时间，在CPU时间紧张的情况下，CPU不能把所有的时间用来做要紧的事儿，还需要去花时间删除这些key

定时器的创建耗时，若为每一个设置过期时间的key创建一个定时器（将会有大量的定时器产生），性能影响严重

ps: 这个方案，redis 是不采用的。

## 惰性删除

惰性删除用于当客户端读取带有超时属性的键时，如果已经超过键设置的过期时间，会执行删除操作并返回空，这种策略是出于节省CPU成本考虑，不需要单独维护TTL链表来处理过期键的删除。

但是单独用这种方式存在内存泄露的问题，当过期键一直没有访问将无法得到及时删除，从而导致内存不能及时释放。

正因为如此，Redis还提供另一种定时任务删除机制作为惰性删除的补充。

## 定时任务删除

Redis内部维护一个定时任务，默认每秒运行10次（通过配置hz控制）。

定时任务中删除过期键逻辑采用了自适应算法，根据键的过期比例、使用快慢两种速率模式回收键，流程如下所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1007/171945_ea4d32b9_508704.png)

### 流程说明：

1）定时任务在每个数据库空间随机检查20个键，当发现过期时删除对应的键。

2）如果超过检查数25%的键过期，循环执行回收逻辑直到不足25%或运行超时为止，慢模式下超时时间为25毫秒。

3）如果之前回收键逻辑超时，则在Redis触发内部事件之前再次以快模式运行回收过期键任务，快模式下超时时间为1毫秒且2秒内只能运行1次。

4）快慢两种模式内部删除逻辑相同，只是执行的超时时间不同。

# 内存溢出控制策略

当Redis所用内存达到maxmemory上限时会触发相应的溢出控制策略。


## 内置的策略

具体策略受maxmemory-policy参数控制，Redis支持6种策略，

如下所示：

1）noeviction：默认策略，不会删除任何数据，拒绝所有写入操作并返回客户端错误信息（error）OOM command not allowed when used memory，

此时Redis只响应读操作。

2）volatile-lru：根据LRU算法删除设置了超时属性（expire）的键，直到腾出足够空间为止。如果没有可删除的键对象，回退到noeviction策略。

3）allkeys-lru：根据LRU算法删除键，不管数据有没有设置超时属性，直到腾出足够空间为止。

4）allkeys-random：随机删除所有键，直到腾出足够空间为止。

5）volatile-random：随机删除过期键，直到腾出足够空间为止。

6）volatile-ttl：根据键值对象的ttl属性，删除最近将要过期数据。如果没有，回退到noeviction策略。

## policy 的指定

内存溢出控制策略可以采用 `config set maxmemory-policy{policy}` 动态配置。

Redis支持丰富的内存溢出应对策略，可以根据实际需求灵活定制，比如当设置volatile-lru策略时，保证具有过期属性的键可以根据LRU剔除，而未设置超时的键可以永久保留。

还可以采用allkeys-lru策略把Redis变为纯缓存服务器使用。

当Redis因为内存溢出删除键时，可以通过执行info stats命令查看evicted_keys指标找出当前Redis服务器已剔除的键数量。

每次Redis执行命令时如果设置了maxmemory参数，都会尝试执行回收内存操作。

当Redis一直工作在内存溢出（used_memory>maxmemory）的状态下且设置非noeviction策略时，会频繁地触发回收内存的操作，影响Redis服务器的性能。

## 伪代码

回收内存逻辑伪代码如下：

```rb
def freeMemoryIfNeeded():
    int mem_used, mem_tofree, mem_freed;
    // 计算当前内存总量，排除从节点输出缓冲区和AOF缓冲区的内存占用
    int slaves = server.slaves;
    mem_used = used_memory()-slave_output_buffer_size(slaves)-aof_rewrite_buffer_size();
    // 如果当前使用小于等于maxmemory退出
    if (mem_used <= server.maxmemory) :
        return REDIS_OK;
    // 如果设置内存溢出策略为noeviction（不淘汰），返回错误。
    if (server.maxmemory_policy == 'noeviction') :
        return REDIS_ERR;
    // 计算需要释放多少内存
    mem_tofree = mem_used - server.maxmemory;
    // 初始化已释放内存量
    mem_freed = 0;

    // 根据maxmemory-policy策略循环删除键释放内存
    while (mem_freed < mem_tofree) :
        // 迭代Redis所有数据库空间
        for (int j = 0; j < server.dbnum; j++) :
            String bestkey = null;
            dict dict;
            if (server.maxmemory_policy == 'allkeys-lru' ||
                server.maxmemory_policy == 'allkeys-random'):
                // 如果策略是 allkeys-lru/allkeys-random
                // 回收内存目标为所有的数据库键
                dict = server.db[j].dict;
            else :
                // 如果策略是volatile-lru/volatile-random/volatile-ttl
                // 回收内存目标为带过期时间的数据库键
                dict = server.db[j].expires;
            // 如果使用的是随机策略，那么从目标字典中随机选出键
            if (server.maxmemory_policy == 'allkeys-random' ||
                server.maxmemory_policy == 'volatile-random') :
                // 随机返回被删除键
                bestkey = get_random_key(dict);
            else if (server.maxmemory_policy == 'allkeys-lru' ||
                server.maxmemory_policy == 'volatile-lru') :
                // 循环随机采样maxmemory_samples次(默认5次)，返回相对空闲时间最长的键
                bestkey = get_lru_key(dict);
            else if (server.maxmemory_policy == 'volatile-ttl') :
                // 循环随机采样maxmemory_samples次，返回最近将要过期的键
                bestkey = get_ttl_key(dict);
            // 删除被选中的键
            if (bestkey != null) :
                long delta = used_memory();
                deleteKey(bestkey);
                // 计算删除键所释放的内存量
                delta -= used_memory();
                mem_freed += delta;
                // 删除操作同步给从节点
            if (slaves):
                flushSlavesOutputBuffers();
    return REDIS_OK;
```

- 感受

从伪代码可以看到，频繁执行回收内存成本很高，主要包括查找可回收键和删除键的开销，如果当前Redis有从节点，
回收内存操作对应的删除命令会同步到从节点，导致写放大的问题。

## 运维建议

建议线上Redis内存工作在maxmemory>used_memory状态下，避免频繁内存回收开销。

对于需要收缩Redis内存的场景，可以通过调小maxmemory来实现快速回收。

比如对一个实际占用6GB内存的进程设置maxmemory=4GB，之后第一次执行命令时，如果使用非noeviction策略，它会一次性回收到maxmemory指
定的内存量，从而达到快速回收内存的目的。

注意，此操作会导致数据丢失和短暂的阻塞问题，一般在缓存场景下使用。

# Redis采用的过期策略

## 策略

惰性删除+定期删除

## 取舍

在实际中，如果我们要自己设计过期策略，在使用懒汉式删除+定期删除时，控制时长和频率这个尤为关键，需要结合服务器性能，已经并发量等情况进行调整，以致最佳。


# 对于 AOF/RDB 持久化的影响

## 官方说明

In order to obtain（获得） a correct behavior without sacrificing consistency（牺牲一致性）, 
when a key expires, a **DEL** operation is synthesized（综合） in both the AOF file and gains all the attached replicas nodes. 

This way the expiration process is centralized in the master instance, and there is no chance of consistency errors.

ps: 这里 redis 没有牺牲数据的一致性。而是在 expire 的时候，发送一个 DEL 命令到所有的从节点。

However while the replicas connected to a master will not expire keys independently (but will wait for the DEL coming from the master), they'll still take the full state of the expires existing in the dataset, so when a replica is elected to master it will be able to expire the keys independently, fully acting as a master.

但是，虽然连接到主服务器的副本不会独立到期密钥（但会等待来自主服务器的DEL），但它们仍将采用数据集中存在的过期的完整状态，因此当副本被选为主服务器时

它将能够独立地使密钥到期，充分充当主人。


## 其他博客

### RDB 

- 生成RDB文件时

执行 SAVE 或 BGSAVE 时，数据库键空间中的过期键不会被保存在RDB文件中

- 载入RDB文件时

Master 载入RDB时，文件中的未过期的键会被正常载入，过期键则会被忽略。

Slave 载入 RDB 时，文件中的所有键都会被载入，当同步进行时，会和 Master 保持一致。

### AOF 

- AOF 文件写入时

数据库键空间的过期键的过期但并未被删除释放的状态会被正常记录到 AOF 文件中，当过期键发生释放删除时，DEL 也会被同步到 AOF 文件中去。

- 重新生成 AOF 文件时

执行 BGREWRITEAOF 时，数据库键中过期的键不会被记录到 AOF 文件中

### 复制

Master 删除过期 Key 之后，会向所有 Slave 服务器发送一个 DEL命令，从服务器收到之后，会删除这些 Key。

Slave 在被动的读取过期键时，不会做出操作，而是继续返回该键，只有当 Master 发送 DEL 通知来，才会删除过期键，这是统一、中心化的键删除策略，保证主从服务器的数据一致性。

ps: 这里就会出现一个数据一致性的问题，追求的是最终一致性。

# 拓展阅读

[lazy free]()

[redis 默认的 16 个 db]()

# 个人收获

## 性能

异步与批量，永远是提升性能的好帮手。

## trade-off

我们系统中有一个慢操作，希望通过定期删除来移除，但是操作本身比较耗时。

自然就会想到，如果把过期时间调整很大，不就可以了吗？

但是这回引来另一个问题，频率的降低。

## 兼容性

作为一个成熟框架的设计者，有时候设计需要考虑很多问题。

比如 expire 对于 AOF/RDB 持久化的影响？主从复制的影响？

# 参考资料

- 官方

[redis expire](https://redis.io/commands/expire)

- 其他

[Redis过期策略 实现原理](https://blog.csdn.net/xiangnan129/article/details/54928672)

* any list
{:toc}
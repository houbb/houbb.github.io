---
layout: post
title:  Cache Travel-10-多层缓存概览
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, redis, lru, sh]
published: true
---

# 手写 Redis 系列

[java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s/6J2K2k4Db_20eGU6xGYVTw)

[java从零手写实现redis（三）redis expire 过期原理](https://mp.weixin.qq.com/s/BWfBc98oLqhAPLN2Hgkwow)

[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s/G41SRZQm1_0uQXBAGHAYbw)

[java从零手写实现redis（四）添加监听器](https://mp.weixin.qq.com/s/6pIG3l_wkXBwSuJvj_KwMA)

[java从零手写实现redis（五）过期策略的另一种实现思路](https://mp.weixin.qq.com/s/Atrd36UGds9_w_NFQDoEQg)

[java从零手写实现redis（六）AOF 持久化原理详解及实现](https://mp.weixin.qq.com/s/rFuSjNF43Ybxy-qBCtgasQ)

[java从零手写实现redis（七）LRU 缓存淘汰策略详解](https://mp.weixin.qq.com/s/X-OIqu_rgLskvbF2rZMP6Q)

[java从零开始手写redis（八）朴素 LRU 淘汰算法性能优化](https://mp.weixin.qq.com/s/H8gOujnlTinctjVQqW0ITA)

[java从零开始手写redis（九）LRU 缓存淘汰算法如何避免缓存污染](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-09-evict-lru-optimize2)

[java从零开始手写redis（十）缓存淘汰算法 LFU 最少使用频次](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-10-lfu)

[java从零开始手写redis（十一）缓存淘汰算法 COLOK 算法](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-11-clock)

[java从零开始手写redis（十二）过期策略如何实现随机 keys 淘汰](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-12-expire2)

[java从零开始手写redis（十三）redis渐进式rehash详解](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-13-redis-rehash)

[java从零开始手写redis（十四）JDK HashMap 源码解析](https://houbb.github.io/2018/09/12/java-hashmap)

[java从零开始手写redis（十四）JDK ConcurrentHashMap 源码解析](https://houbb.github.io/2018/09/12/java-concurrent-hashmap)

[java从零开始手写redis（十五）实现自己的 HashMap](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-15-write-hashmap)

[java从零开始手写redis（十六）实现渐进式 rehash map](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-16-rehash-map)


# 简介

layering-cache是一个支持分布式环境的多级缓存框架，主要解决在高并发下数据快速读取的问题。

整体采用了分层架构设计的思路，来保证整个框架的扩展性；采用了面向切面的设计模式，来解决了缓存和业务代码耦合性。

它使用Caffeine作为一级本地缓存，redis作为二级集中式缓存。

一级缓存和二级缓存的数据一致性是通过推和拉两种模式相结合的方式来保证。

- 推主要是基于redis的pub/sub机制

- 拉主要是基于消息队列和记录消费消息的偏移量来实现的。

# 支持

- 支持缓存命中率的监控统计，统计数据上报支持自定义扩展

- 内置dashboard，支持对缓存的管理和缓存命中率的查看

- 支持缓存过期时间在注解上直接配置

- 支持缓存的自动刷新（当缓存命中并发现二级缓存将要过期时，会开启一个异步线程刷新缓存）

- 缓存Key支持SpEL表达式

- Redis支持Kryo、FastJson、Jackson、Jdk和Protostuff序列化，默认使用Protostuff序列化，并支持自定义的序列化

- 支持同一个缓存名称设置不同的过期时间

- 支持只使用一级缓存或者只使用二级缓存

- Redis支持单机、集群、Sentinel三种客户端

# 优势

- 提供缓存命中率的监控统计，统计数据上报支持自定义扩展

- 支持本地缓存和集中式两级缓存

- 接入成本和使用成本都非常低

- 无缝集成Spring、Spring boot

- 内置dashboard使得缓存具备可运维性

- 通过缓存空值来解决缓存穿透问题、通过异步加载缓存的方式来解决缓存击穿和雪崩问题


# 实现原理

## 总体架构

layering-cache总体架构分为两层，第一层是本地缓存L1，第二层是集中式缓存L2，如下图：

## 缓存的选择

一级缓存：Caffeine是一个一个高性能的 Java 缓存库；使用 Window TinyLfu 回收策略，提供了一个近乎最佳的命中率（Caffeine 缓存详解）。优点数据就在应用内存所以速度快。缺点受应用内存的限制，所以容量有限；没有持久化，重启服务后缓存数据会丢失；在分布式环境下缓存数据数据无法同步；

二级缓存：redis是一高性能、高可用的key-value数据库，支持多种数据类型，支持集群，和应用服务器分开部署易于横向扩展。优点支持多种数据类型，扩容方便；有持久化，重启应用服务器缓存数据不会丢失；他是一个集中式缓存，不存在在应用服务器之间同步数据的问题。缺点每次都需要访问redis存在IO浪费的情况。
我们可以发现Caffeine和Redis的优缺点正好相反，所以他们可以有效的互补。

## 数据读取

数据读取会先读L1，当L1未命中会获取本地锁；

获取到本地锁过后去读L2，如果L2未命中，则获取redis分布式锁；

获取到分布式锁过后去读DB，然后将数据放到L1和L2中。

获取到本地锁过后去读L2，如果L2命中，则将数据放入到L1中，并判断是否需要刷新二级缓存；

## 数据删除/更新

缓存的数据更新需要保证多机器下一级缓存和二级缓存的数据一致性。

保证多机数据一致性的方式一般有两种，一种是推模式，这种方式实时性好，但是推的消息有可能会丢；另一种是拉模式，这种方式可靠性更好，但是这种方式不够实时。

layering-cache结合了推和拉两种模式来保证多机数据的一致性。推主要是基于redis的pub/sub机制，拉主要是基于消息偏移量的方式，架构如下：

## 可用性设计

借助redis的list结构维护一个删除缓存的消息队列，所有应用服务器内存中保存一个偏移量（offset）。offset表示该服务处理缓存消息的位置，每次处理消息后就更新offset的位置，这样就能保证消息不会丢失。最后在每天凌晨3点会去清空这个消息队列。

## pub/sub断线重连设计

layering-cache会记录两个参数：最后一次处理推消息的时间A和最后一次处理拉消息的时间B。

如如果B - A >= 10s则认为断线，然后发起重连尝试。

## 推模式数据同步

在数据删除或更新时，首先更新DB，保证DB数据的准确性；再更新或删除redis缓存，然后向redis推送一条消息，并将这条消息保存到redis的消息队列中；最后再发送一条pub/sub消息。应用服务器收到pub/sub消息后，将会根据本地offset去redis消息队列中拉取需要处理的消息，然后根据拉取到的消息删除本地缓存。这里允许消息的重复消费，因为本地缓存即使删除，也会根据二级缓存重建。

基于redis pub/sub 实现一级缓存的更新同步。主要原因有两点：

使用缓存本来就允许脏读，所以有一定的延迟是允许的 。

redis本身是一个高可用的数据库，并且删除动作不是一个非常频繁的动作所以使用redis原生的发布订阅在性能上是没有问题的。

## 拉模式数据同步

这里分几种情况：

服务刚启动的时候，需要同步最新偏移量（offset）到本地。

每隔30秒会检查一下本地偏移量和远程偏移量是否一致，以此来解决redis pub/sub消息丢失或者断线问题。

每天凌晨3点会执行一个定时任务来清空消息队列。

# Cache和CacheManager接口

该框架最核心的接口有两个，一个是Cache接口：主要负责具体的缓存操作，如对缓存的增删改查；一个是CacheManager接口：主要负责对Cache的管理，最常用的方法是通过缓存名称获取对应的Cache。

Cache接口：

```java
public interface Cache {

    String getName();

    Object getNativeCache();

    Object get(Object key);

    <T> T get(Object key, Class<T> type);

    <T> T get(Object key, Callable<T> valueLoader);

    void put(Object key, Object value);

    Object putIfAbsent(Object key, Object value);

    void evict(Object key);

    void clear();
    
    CacheStats getCacheStats();
}
```

CacheManager接口：

```java
public interface CacheManager {

    Collection<Cache> getCache(String name);

    Cache getCache(String name, LayeringCacheSetting layeringCacheSetting);

    Collection<String> getCacheNames();
    
    List<CacheStatsInfo> listCacheStats(String cacheName);

    void resetCacheStat();
}
```

在CacheManager里面Cache容器默认使用 `ConcurrentMap<String, ConcurrentMap<String, Cache>>` 数据结构，以此来满足同一个缓存名称可以支持不同的缓存过期时间配置。

外层key就是缓存名称，内层key是"一级缓存有效时间-二级缓存有效时间-二级缓存自动刷新时间"缓存时间全部转换成毫秒值，如"1111-2222-3333"。

# 缓存的监控和统计

简单思路就是缓存的命中和未命中使用LongAdder先暂存到内存，在通过定时任务同步到redis，并重置LongAdder，集中计算缓存的命中率等。

监控统计API直接获取redis中的统计数据做展示分析。

因为可能是集群环境，为了保证数据准确性在同步数据到redis的时候需要加一个分布式锁。

# 小结

https://github.com/xiaolyuh/layering-cache

https://github.com/xiaolyuh/layering-cache/wiki/%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86

* any list
{:toc}
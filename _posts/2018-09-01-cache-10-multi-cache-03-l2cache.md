---
layout: post
title:  Cache Travel-10-03-L2Cache 是一个基于 Caffeine + Redis 的二级缓存框架。让缓存的使用在业务开发中更加简单、高效 
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

L2Cache 是一个基于内存、 Redis 、 Spring Cache 实现的满足高并发场景下的分布式二级缓存框架。

L2Cache 并没有重复造轮子，它只是将目前市面上比较成熟、经得起考验的框架组合起来，封装屏蔽了复杂的缓存操作和实现原理，最终给开发者留出了一个简单易懂和易维护的分布式缓存开发工具。

# L2Cache 核心原理解析

## L2Cache是什么

L2Cache 是一个基于内存、 Redis 、 Spring Cache 实现的满足高并发场景下的分布式二级缓存框架。

L2Cache 并没有重复造轮子，它只是将目前市面上比较成熟、经得起考验的框架组合起来，封装屏蔽了复杂的缓存操作和实现原理，最终给开发者留出了一个简单易懂和易维护的分布式缓存开发工具。

## L2Cache架构图

![L2Cache架构图](https://i-blog.csdnimg.cn/blog_migrate/2c5f271d1f57211bda52c2ccd4a534aa.png)

核心逻辑

1、发起 get(key) 请求

2、从localCache中get缓存，若存在则返回缓存，若不存在则从Redis中get缓存

3、若从Redis中get到缓存，则返回缓存并put到localCache中

4、若redis中不存在缓存，则执行load从数据源加载数据，并将数据put到localCache和Redis

5、发送refresh消息到MQ，其他节点订阅到消息，则refresh缓存

## L2Cache底层原理图

![L2Cache底层原理图](https://i-blog.csdnimg.cn/blog_migrate/082b9c36839d0319119a36f5a20d4d4d.png)

模块介绍

业务层： 系统中实际的业务逻辑【也就是你的业务代码】
缓存层： 承载各种业务维度的缓存实现，简化开发和维护【最佳实践】
缓存构建模块： 用于构建各种类型的缓存对象
缓存容器： 作为一个容器，用来存储各种业务维度的缓存对象，以便复用【类spring容器】
缓存模块： 实际的缓存对象，分为混合缓存、一级缓存、二级缓存
热key探测模块： 用于探测热key，并缓存到本地缓存，提高性能
缓存同步模块： 用于保证分布式环境下，各个POD节点中本地缓存的一致性

## L2Cache模块演进图

![L2Cache模块演进图](https://i-blog.csdnimg.cn/blog_migrate/d4f9ac8c78a52dad36ce87300efeccfe.png)

初始版本： 基于快速迭代的理念，优先实现核心功能并快速验证。

当前版本： 基于可拔插的设计理念，设计出具有高可扩展性和松耦合的代码体系，实现整个框架的模块化、可复用性和职责分离，让后续可能发生的变更更加容易、升级成本更低。

## L2Cache缓存层

为什么有了L2Cache缓存框架这一层后，还定义了缓存层呢？

承上启下： 通过缓存层连接业务层和缓存框架。

标准化： 定义一套标准的业务缓存操作，降低系统复杂度，简化开发，便于维护和扩展。

缓存层的核心接口：CacheService 。小接口，大功能。

![L2Cache缓存层](https://i-blog.csdnimg.cn/blog_migrate/490a8b0857395c17295d560f4d81cec7.png)

业务层 只需根据 缓存层 实现的各种维度的CacheService 来组装复杂的业务逻辑即可。

业务层 的难点在于缓存维度的划分。

# 核心功能

支持多种缓存类型： 一级缓存、二级缓存、混合缓存

解决痛点问题： 缓存击穿、缓存穿透等

动态缓存配置： 支持动态调整混合缓存下的缓存类型，支持热key的手动配置

缓存一致性保证： 通过消息通知的方式来保证集群环境下一级缓存的一致性

自动热key探测： 自动识别热key并缓存到一级缓存

支持缓存批量操作： 支持分页的批量获取、批量删除等

定义通用缓存层： 承上启下，简化业务开发，规整业务代码

## 1、同其他开源框架的对比

| 核心功能       | JetCache（阿里）                        | J2Cache（OSChina）                    | L2Cache                              |
| -------------- | ------------------------------------ | ------------------------------------ | ------------------------------------ |
| 支持的缓存类型 | 一级缓存<br />二级缓存<br />混合缓存 | 一级缓存<br />二级缓存<br />混合缓存 | 一级缓存<br />二级缓存<br />混合缓存 |
| 解决的痛点问题 | 缓存击穿<br />缓存穿透               | 缓存击穿<br />缓存穿透               | 缓存击穿<br />缓存穿透               |
| 缓存一致性保证 | 支持                                 | 支持                                 | 支持                                 |
| 动态缓存配置   | 不支持                               | 不支持                               | 支持                                 |
| 自动热key探测  | 不支持                               | 不支持                               | 支持                                 |
| 缓存批量操作   | 不支持                               | 不支持                               | 支持                                 |
| 通用缓存层     | 不支持                               | 不支持                               | 支持                                 |
> 说明：上面表格的对比，数据正在整理中，后续会再校对一次。

- 从上面表格的对比可发现，`L2Cache` 的核心优势为三个点：`自动热key探测`、`缓存批量操作`、`通用缓存层`。
- 这三点优势是从实际业务开发中沉淀下来的能力，不仅解决了实现多级缓存的复杂性问题，还进一步屏蔽了业务维度的缓存操作的复杂性。
- 这样一来，原本需要资深开发者才能开发的功能，现在高级和中级开发者，甚至初级开发者都能轻松、高效、高质地进行开发。
- 如果在实际业务开发中，你也遇到开发难度高，难以维护，难以扩展的痛点问题，建议可以试试L2Cache。`反正接入成本低，试试又何妨？`

## 2、L2Cache 的二级缓存结构

1、L1：一级缓存，内存缓存，支持 Caffeine 和 Guava Cache。

2、L2：二级缓存，集中式缓存，支持 Redis。

3、混合缓存，指支持同时使用一级缓存和二级缓存。

由于大量的缓存读取会导致 L2 的网络成为整个系统的瓶颈，因此 L1 的目标是降低对 L2 的读取次数。避免使用独立缓存系统所带来的网络IO开销问题。L2 可以避免应用重启后导致的 L1数据丢失的问题，同时无需担心L1会增加太多的内存消耗，因为你可以设置 L1中缓存数据的数量。

说明：

L2Cache 满足CAP定理中的AP，也就是满足可用性和分区容错性，至于C(一致性)因为缓存的特性所以无法做到强一致性，只能尽可能的去做到一致性，保证最终的一致。

## 3、关键点

支持根据配置缓存类型来灵活的组合使用不同的Cache。

1、支持只使用一级缓存Caffeine 和 Guava Cache。

2、支持只使用二级缓存Redis。

3、支持同时使用一二级缓存Composite。

## 4、必知

若使用缓存，则必然可能出现不一致的情况。

也就是说，无法保证强一致性，只能保证最终一致性。


# 小结

https://github.com/xiaolyuh/layering-cache

https://github.com/xiaolyuh/layering-cache/wiki/%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86

* any list
{:toc}
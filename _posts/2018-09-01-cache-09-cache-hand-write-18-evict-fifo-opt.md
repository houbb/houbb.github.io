---
layout: post
title:  Cache Travel-09-从零开始手写redis（18）缓存淘汰算法 FIFO 优化
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, redis, lru, sh]
published: true
---

# 项目简介

大家好，我是老马。

[Cache](https://github.com/houbb/cache) 用于实现一个可拓展的高性能本地缓存。

有人的地方，就有江湖。有高性能的地方，就有 cache。

# v1.0.0 版本

以前的 FIFO 实现比较简单，但是 queue 循环一遍删除的话，性能实在是太差。

于是想到引入一个 Set 存储有哪些 key，改成下面的方式：

```java
package com.github.houbb.cache.core.support.evict.impl;

import com.github.houbb.cache.api.ICacheContext;
import com.github.houbb.cache.core.model.CacheEntry;
import com.github.houbb.cache.core.support.evict.AbstractCacheEvict;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

/**
 * 丢弃策略-先进先出
 * @author binbin.hou
 * @since 0.0.2
 */
public class CacheEvictFifo<K,V> extends AbstractCacheEvict<K,V> {

    /**
     * queue 信息
     * @since 0.0.2
     */
    private final Queue<K> queue = new LinkedList<>();

    /**
     * 避免数据重复加入问题
     * @since 1.0.1
     */
    private final Set<K> keySet = new HashSet<>();

    @Override
    public CacheEntry<K,V> doEvict(ICacheContext<K, V> context, final K newKey) {
        CacheEntry<K,V> result = null;

        // 超过限制，执行移除
        if(isNeedEvict(context)) {
            K evictKey = queue.remove();
            keySet.remove(evictKey);
            // 移除最开始的元素
            V evictValue = doEvictRemove(context, evictKey);
            result = new CacheEntry<>(evictKey, evictValue);
        }

        return result;
    }

    @Override
    public void updateKey(ICacheContext<K, V> context, K key) {
        if (!keySet.contains(key)) {
            queue.add(key);
            keySet.add(key);
        }
    }

}
```

这里虽然可以解决 fifo 的删除问题，但是内存有点浪费。

而且这样其实顺序也太对，每次还是需要更新 queue 的位置。

我们把结构继续调整一下，用其他的数据结构来替代。

# v1.0.1 实现

## 其他的方式

| 方案 | 数据结构 | 内存开销 | 实现难度 | 是否推荐 |
|------|----------|-----------|------------|-------------|
| `Queue + Set` | 两个结构 | 较大 | 简单 | ❌ |
| `LinkedHashSet` | 单结构 | 小 | 简单 | ✅ 推荐 |
| `LinkedHashMap` | Map+链表 | 中等 | 中等 | ✅ 可选 |

## 实现

简单起见，我们使用 LinkedHashSet 来实现。

```java
package com.github.houbb.cache.core.support.evict.impl;

import com.github.houbb.cache.api.ICacheContext;
import com.github.houbb.cache.core.model.CacheEntry;
import com.github.houbb.cache.core.support.evict.AbstractCacheEvict;

import java.util.*;

/**
 * 丢弃策略-先进先出
 * @author binbin.hou
 * @since 0.0.2
 */
public class CacheEvictFifo<K,V> extends AbstractCacheEvict<K,V> {

    /**
     * queue 信息
     * @since 0.0.2
     */
    private final Set<K> accessOrder = new LinkedHashSet<>();;

    @Override
    public CacheEntry<K,V> doEvict(ICacheContext<K, V> context, final K newKey) {
        CacheEntry<K,V> result = null;

        // 超过限制，执行移除
        if(isNeedEvict(context)) {
            Iterator<K> iterator = accessOrder.iterator();
            K evictKey = iterator.next();
            V evictValue = doEvictRemove(context, evictKey);
            iterator.remove();

            // 移除最开始的元素
            result = new CacheEntry<>(evictKey, evictValue);
        }

        return result;
    }

    @Override
    public void updateKey(ICacheContext<K, V> context, K key) {
        accessOrder.remove(key);
        accessOrder.add(key);
    }

}
```

这样我们的目标算是达成了，实现了内存和性能的平衡。


# 拓展信息

## 开源矩阵

下面是一些缓存系列的开源矩阵规划。

| 名称 | 介绍 | 状态  |
|:---|:---|:----|
| [resubmit](https://github.com/houbb/resubmit) | 防止重复提交核心库 | 已开源 |
| [rate-limit](https://github.com/houbb/rate-limit) | 限流核心库 | 已开源 |
| [cache](https://github.com/houbb/cache) | 手写渐进式 redis | 已开源 |
| [lock](https://github.com/houbb/lock) | 开箱即用的分布式锁 | 已开源 |
| [common-cache](https://github.com/houbb/common-cache) | 通用缓存标准定义 | 已开源 |
| [redis-config](https://github.com/houbb/redis-config) | 兼容各种常见的 redis 配置模式 | 已开源 |
| [quota-server](https://github.com/houbb/quota-server) | 限额限次核心服务 | 待开始 |
| [quota-admin](https://github.com/houbb/quota-admin) | 限额限次控台 | 待开始 |
| [flow-control-server](https://github.com/houbb/flow-control-server) | 流控核心服务 | 待开始 |
| [flow-control-admin](https://github.com/houbb/flow-control-admin) | 流控控台 | 待开始 |

# 手写 Redis 系列

[java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s/6J2K2k4Db_20eGU6xGYVTw)

[java从零手写实现redis（三）redis expire 过期原理](https://mp.weixin.qq.com/s/BWfBc98oLqhAPLN2Hgkwow)

[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s/G41SRZQm1_0uQXBAGHAYbw)

[java从零手写实现redis（四）添加监听器](https://mp.weixin.qq.com/s/6pIG3l_wkXBwSuJvj_KwMA)

[java从零手写实现redis（五）过期策略的另一种实现思路](https://mp.weixin.qq.com/s/Atrd36UGds9_w_NFQDoEQg)

[java从零手写实现redis（六）AOF 持久化原理详解及实现](https://mp.weixin.qq.com/s/rFuSjNF43Ybxy-qBCtgasQ)

[java从零手写实现redis（七）LRU 缓存淘汰策略详解](https://mp.weixin.qq.com/s/X-OIqu_rgLskvbF2rZMP6Q)

[java从零开始手写redis（八）朴素 LRU 淘汰算法性能优化](https://mp.weixin.qq.com/s/H8gOujnlTinctjVQqW0ITA)

[java从零开始手写redis（九）LRU 缓存淘汰算法如何避免缓存污染](https://mp.weixin.qq.com/s/jzM_wDw37QXTeYMFYtRJaw)

[java从零开始手写redis（十）缓存淘汰算法 LFU 最少使用频次](https://mp.weixin.qq.com/s/mUyCTCVObwY8XdLcO1pOWg)

[java从零开始手写redis（十一）缓存淘汰算法 COLOK 算法](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-11-clock)

[java从零开始手写redis（十二）过期策略如何实现随机 keys 淘汰](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-12-expire2)

[java从零开始手写redis（十三）redis渐进式rehash详解](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-13-redis-rehash)

[java从零开始手写redis（十四）JDK HashMap 源码解析](https://mp.weixin.qq.com/s/SURVmTf6K_ou85fShFzrNA)

[java从零开始手写redis（十四）JDK ConcurrentHashMap 源码解析](https://houbb.github.io/2018/09/12/java-concurrent-hashmap)

[java从零开始手写redis（十五）实现自己的 HashMap](https://mp.weixin.qq.com/s/e5fskVfeDMTuJhjEAd1gQw)

[java从零开始手写redis（十六）实现渐进式 rehash map](https://mp.weixin.qq.com/s/Lwp2js4lrHAbuQ5Fexer6w)

[java从零开始手写redis（十七）v1.0.0 代码重构+拓展性增强](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-17-v1.0.0-opt-code)

[java从零开始手写redis（十八）缓存淘汰算法 FIFO 优化](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-18-evict-fifo-opt)

* any list
{:toc}
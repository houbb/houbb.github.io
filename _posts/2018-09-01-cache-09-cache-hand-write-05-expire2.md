---
layout: post
title:  Cache Travel-09-java 从零开始手写 redis（五）过期策略的另一种实现思路
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, sh]
published: true
---

# 前言

[java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s/6J2K2k4Db_20eGU6xGYVTw)

[java从零手写实现redis（三）redis expire 过期原理](https://mp.weixin.qq.com/s/BWfBc98oLqhAPLN2Hgkwow)

[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s/G41SRZQm1_0uQXBAGHAYbw)

[java从零手写实现redis（四）添加监听器](https://mp.weixin.qq.com/s/6pIG3l_wkXBwSuJvj_KwMA)

前面实现了 redis 的几个基本特性，其中在 expire 过期原理时，提到了另外一种实现方式。

这里将其记录下来，可以拓展一下自己的思路。

# 以前的实现方式

## 核心思路

原来的实现方式见：

> [java从零手写实现redis（三）redis expire 过期原理](https://mp.weixin.qq.com/s/BWfBc98oLqhAPLN2Hgkwow)

https://mp.weixin.qq.com/s/BWfBc98oLqhAPLN2Hgkwow

## 不足

以前的设计非常简单，符合最基本的思路，就是将过期的信息放在一个 map 中，然后去遍历清空。

为了避免单次操作时间过长，类似 redis，单次操作 100 个元素之后，直接返回。

不过定时任务之心时，其实存在两个不足：

（1）keys 的选择不够随机，可能会导致每次循环 100 个结束时，真正需要过期的没有被遍历到。

不过 map 的随机比较蠢，就是将 map 的 keys 全部转为集合，然后通过 random 返回。

转的过程就是一个时间复杂度为 O(n) 的遍历，所以一开始没有去实现。

还有一种方式，就是用空间换区时间，存储的时候，同时存储在 list 中，然后随机返回处理，这个后续优化。

（2）keys 的遍历可能大部分都是无效的。

我们每次都是根据 keys 从前往后遍历，但是没有关心对应的过期时间，所以导致很多无效遍历。

本文主要提供一种以过期时间为维度的实现方式，仅供参考，因为这种方式也存在缺陷。

# 基于时间的遍历

## 思路

我们每次 put 放入过期元素时，根据过期时间对元素进行排序，相同的过期时间的 Keys 放在一起。

优点：定时遍历的时候，如果时间不到当前时间，就可以直接返回了，大大降低无效遍历。

缺点：考虑到惰性删除问题，还是需要存储以删除信息作为 key 的 map 关系，这样内存基本翻倍。

## 基本属性定义

我们这里使用 `TreeMap` 帮助我们进行过期时间的排序，这个集合后续有时间可以详细讲解了，我大概看了下 jdk1.8 的源码，主要是通过红黑树实现的。

```java
public class CacheExpireSort<K,V> implements ICacheExpire<K,V> {

    /**
     * 单次清空的数量限制
     * @since 0.0.3
     */
    private static final int LIMIT = 100;

    /**
     * 排序缓存存储
     *
     * 使用按照时间排序的缓存处理。
     * @since 0.0.3
     */
    private final Map<Long, List<K>> sortMap = new TreeMap<>(new Comparator<Long>() {
        @Override
        public int compare(Long o1, Long o2) {
            return (int) (o1-o2);
        }
    });

    /**
     * 过期 map
     *
     * 空间换时间
     * @since 0.0.3
     */
    private final Map<K, Long> expireMap = new HashMap<>();

    /**
     * 缓存实现
     * @since 0.0.3
     */
    private final ICache<K,V> cache;

}
```

## 放入元素时 

每次存入新元素时，同时放入 sortMap 和 expireMap。

```java
@Override
public void expire(K key, long expireAt) {
    List<K> keys = sortMap.get(expireAt);
    if(keys == null) {
        keys = new ArrayList<>();
    }
    keys.add(key);
    // 设置对应的信息
    sortMap.put(expireAt, keys);
    expireMap.put(key, expireAt);
}
```

## 定时任务的执行

### 定义

我们定义一个定时任务，100ms 执行一次。

```java
/**
 * 线程执行类
 * @since 0.0.3
 */
private static final ScheduledExecutorService EXECUTOR_SERVICE = Executors.newSingleThreadScheduledExecutor();

public CacheExpireSort(ICache<K, V> cache) {
    this.cache = cache;
    this.init();
}
/**
 * 初始化任务
 * @since 0.0.3
 */
private void init() {
    EXECUTOR_SERVICE.scheduleAtFixedRate(new ExpireThread(), 100, 100, TimeUnit.MILLISECONDS);
}
```

### 执行任务

实现源码如下：

```java
/**
 * 定时执行任务
 * @since 0.0.3
 */
private class ExpireThread implements Runnable {
    @Override
    public void run() {
        //1.判断是否为空
        if(MapUtil.isEmpty(sortMap)) {
            return;
        }
        //2. 获取 key 进行处理
        int count = 0;
        for(Map.Entry<Long, List<K>> entry : sortMap.entrySet()) {
            final Long expireAt = entry.getKey();
            List<K> expireKeys = entry.getValue();
            // 判断队列是否为空
            if(CollectionUtil.isEmpty(expireKeys)) {
                sortMap.remove(expireAt);
                continue;
            }
            if(count >= LIMIT) {
                return;
            }
            // 删除的逻辑处理
            long currentTime = System.currentTimeMillis();
            if(currentTime >= expireAt) {
                Iterator<K> iterator = expireKeys.iterator();
                while (iterator.hasNext()) {
                    K key = iterator.next();
                    // 先移除本身
                    iterator.remove();
                    expireMap.remove(key);
                    // 再移除缓存，后续可以通过惰性删除做补偿
                    cache.remove(key);
                    count++;
                }
            } else {
                // 直接跳过，没有过期的信息
                return;
            }
        }
    }
}
```

这里直接遍历 sortMap，对应的 key 就是过期时间，然后和当前时间对比即可。

删除的时候，需要删除 expireMap/sortMap/cache。

## 惰性删除刷新

惰性删除刷新时，就会用到 expireMap。

因为有时候刷新的 key 就一个，如果没有 expireMap 映射关系，可能要把 sortMap 全部遍历一遍才能找到对应的过期时间。

就是一个时间复杂度与空间复杂度衡量的问题。

```java
@Override
public void refreshExpire(Collection<K> keyList) {
    if(CollectionUtil.isEmpty(keyList)) {
        return;
    }
    // 这样维护两套的代价太大，后续优化，暂时不用。
    // 判断大小，小的作为外循环
    final int expireSize = expireMap.size();
    if(expireSize <= keyList.size()) {
        // 一般过期的数量都是较少的
        for(Map.Entry<K,Long> entry : expireMap.entrySet()) {
            K key = entry.getKey();
            // 这里直接执行过期处理，不再判断是否存在于集合中。
            // 因为基于集合的判断，时间复杂度为 O(n)
            this.removeExpireKey(key);
        }
    } else {
        for(K key : keyList) {
            this.removeExpireKey(key);
        }
    }
}

/**
 * 移除过期信息
 * @param key key
 * @since 0.0.10
 */
private void removeExpireKey(final K key) {
    Long expireTime = expireMap.get(key);
    if(expireTime != null) {
        final long currentTime = System.currentTimeMillis();
        if(currentTime >= expireTime) {
            expireMap.remove(key);
            List<K> expireKeys = sortMap.get(expireTime);
            expireKeys.remove(key);
            sortMap.put(expireTime, expireKeys);
        }
    }
}
```


# 小结

实现过期的方法有很多种，目前我们提供的两种方案，都各有优缺点，我相信会有更加优秀的方式。

程序 = 数据结构 + 算法

redis 之所以性能这么优异，其实和其中的数据结构与算法用的合理是分不开的，优秀的框架值得反复学习和思考。

文中主要讲述了思路，实现部分因为篇幅限制，没有全部贴出来。

> 开源地址：[https://github.com/houbb/cache](https://github.com/houbb/cache)

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波~

你的鼓励，是我最大的动力~

* any list
{:toc}
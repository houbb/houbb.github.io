---
layout: post
title:  Cache Travel-09-从零开始手写缓存框架（二）redis expire 过期原理及实现
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, sh]
published: true
---

# 前言

我们在 [从零手写 cache 框架（一）实现固定大小的缓存](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-01-size) 中已经初步实现了我们的 cache。

本节，让我们来一起学习一下如何实现类似 redis 中的 expire 过期功能。

过期是一个非常有用的特性，比如我希望登录信息放到 redis 中，30min 之后失效；或者单日的累计信息放在 redis 中，在每天的凌晨自动清空。

# 代码实现

## 接口

我们首先来定义一下接口。

主要有两个：一个是多久之后过期，一个是在什么时候过期。

```java
public interface ICache<K, V> extends Map<K, V> {

    /**
     * 设置过期时间
     * （1）如果 key 不存在，则什么都不做。
     * （2）暂时不提供新建 key 指定过期时间的方式，会破坏原来的方法。
     *
     * 会做什么：
     * 类似于 redis
     * （1）惰性删除。
     * 在执行下面的方法时，如果过期则进行删除。
     * {@link ICache#get(Object)} 获取
     * {@link ICache#values()} 获取所有值
     * {@link ICache#entrySet()} 获取所有明细
     *
     * 【数据的不一致性】
     * 调用其他方法，可能得到的不是使用者的预期结果，因为此时的 expire 信息可能没有被及时更新。
     * 比如
     * {@link ICache#isEmpty()} 是否为空
     * {@link ICache#size()} 当前大小
     * 同时会导致以 size() 作为过期条件的问题。
     *
     * 解决方案：考虑添加 refresh 等方法，暂时不做一致性的考虑。
     * 对于实际的使用，我们更关心 K/V 的信息。
     *
     * （2）定时删除
     * 启动一个定时任务。每次随机选择指定大小的 key 进行是否过期判断。
     * 类似于 redis，为了简化，可以考虑设定超时时间，频率与超时时间成反比。
     *
     * 其他拓展性考虑：
     * 后期考虑提供原子性操作，保证事务性。暂时不做考虑。
     * 此处默认使用 TTL 作为比较的基准，暂时不想支持 LastAccessTime 的淘汰策略。会增加复杂度。
     * 如果增加 lastAccessTime 过期，本方法可以不做修改。
     *
     * @param key         key
     * @param timeInMills 毫秒时间之后过期
     * @return this
     * @since 0.0.3
     */
    ICache<K, V> expire(final K key, final long timeInMills);

    /**
     * 在指定的时间过期
     * @param key key
     * @param timeInMills 时间戳
     * @return this
     * @since 0.0.3
     */
    ICache<K, V> expireAt(final K key, final long timeInMills);

}
```

## 代码实现

为了便于处理，我们将多久之后过期，进行计算。将两个问题变成同一个问题，在什么时候过期的问题。

核心的代码，主要还是看 cacheExpire 接口。

```java
@Override
public ICache<K, V> expire(K key, long timeInMills) {
    long expireTime = System.currentTimeMillis() + timeInMills;
    return this.expireAt(key, expireTime);
}

@Override
public ICache<K, V> expireAt(K key, long timeInMills) {
    this.cacheExpire.expire(key, timeInMills);
    return this;
}
```

# 缓存过期

这里为了便于后期拓展，对于过期的处理定义为接口，便于后期灵活替换。

## 接口

其中 `expire(final K key, final long expireAt);` 就是我们方法中调用的地方。

refershExpire 属于惰性删除，需要进行刷新时才考虑，我们后面讲解。

```java
public interface ICacheExpire<K,V> {

    /**
     * 指定过期信息
     * @param key key
     * @param expireAt 什么时候过期
     * @since 0.0.3
     */
    void expire(final K key, final long expireAt);

    /**
     * 惰性删除中需要处理的 keys
     * @param keyList keys
     * @since 0.0.3
     */
    void refreshExpire(final Collection<K> keyList);

}
```

## expire 实现原理

其实过期的实思路也比较简单：我们可以开启一个定时任务，比如 1 秒钟做一次轮训，将过期的信息清空。

### 过期信息的存储

```java
/**
 * 过期 map
 *
 * 空间换时间
 * @since 0.0.3
 */
private final Map<K, Long> expireMap = new HashMap<>();

@Override
public void expire(K key, long expireAt) {
    expireMap.put(key, expireAt);
}
```

我们定义一个 map，key 是对应的要过期的信息，value 存储的是过期时间。

### 轮询清理

我们固定 100ms 清理一次，每次最多清理 100 个。

```java
/**
 * 单次清空的数量限制
 * @since 0.0.3
 */
private static final int LIMIT = 100;

/**
 * 缓存实现
 * @since 0.0.3
 */
private final ICache<K,V> cache;
/**
 * 线程执行类
 * @since 0.0.3
 */
private static final ScheduledExecutorService EXECUTOR_SERVICE = Executors.newSingleThreadScheduledExecutor();
public CacheExpire(ICache<K, V> cache) {
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

这里定义了一个单线程，用于执行清空任务。

### 清空任务

这个非常简单，遍历过期数据，判断对应的时间，如果已经到期了，则执行清空操作。

为了避免单次执行时间过长，最多只处理 100 条。

```java
/**
 * 定时执行任务
 * @since 0.0.3
 */
private class ExpireThread implements Runnable {
    @Override
    public void run() {
        //1.判断是否为空
        if(MapUtil.isEmpty(expireMap)) {
            return;
        }
        //2. 获取 key 进行处理
        int count = 0;
        for(Map.Entry<K, Long> entry : expireMap.entrySet()) {
            if(count >= LIMIT) {
                return;
            }
            expireKey(entry);
            count++;
        }
    }
}

/**
 * 执行过期操作
 * @param entry 明细
 * @since 0.0.3
 */
private void expireKey(Map.Entry<K, Long> entry) {
    final K key = entry.getKey();
    final Long expireAt = entry.getValue();
    // 删除的逻辑处理
    long currentTime = System.currentTimeMillis();
    if(currentTime >= expireAt) {
        expireMap.remove(key);
        // 再移除缓存，后续可以通过惰性删除做补偿
        cache.remove(key);
    }
}
```

### 清空的优化思路

如果过期的应用场景不多，那么经常轮训的意义实际不大。

比如我们的任务 99% 都是在凌晨清空数据，白天无论怎么轮询，纯粹是浪费资源。

那有没有什么方法，可以快速的判断有没有需要处理的过期元素呢？

答案是有的，那就是排序的 MAP。

我们换一种思路，让过期的时间做 key，相同时间的需要过期的信息放在一个列表中，作为 value。

然后对过期时间排序，轮询的时候就可以快速判断出是否有过期的信息了。

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
        EXECUTOR_SERVICE.scheduleAtFixedRate(new ExpireThread(), 1, 1, TimeUnit.SECONDS);
    }

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
}
```

看起来是切实可行的，这样可以降低轮询的压力。

这里其实使用空间换取时间，觉得后面可以做一下改进，这种方法性能应该还是不错的。

不过我并没有采用这个方案，主要是考虑到惰性删除的问题，这样会麻烦一些，后续考虑持续改善下这个方案。

# 惰性删除

## 出现的原因

类似于 redis，我们采用定时删除的方案，就有一个问题：可能数据清理的不及时。

那当我们查询时，可能获取到到是脏数据。

于是就有一些人就想了，当我们关心某些数据时，才对数据做对应的删除判断操作，这样压力会小很多。

算是一种折中方案。

## 需要惰性删除的方法

一般就是各种查询方法，比如我们获取 key 对应的值时

```java
@Override
@SuppressWarnings("unchecked")
public V get(Object key) {
    //1. 刷新所有过期信息
    K genericKey = (K) key;
    this.cacheExpire.refreshExpire(Collections.singletonList(genericKey));
    return map.get(key);
}
```

我们在获取之前，先做一次数据的刷新。

## 刷新的实现

实现原理也非常简单，就是一个循环，然后作删除即可。

这里加了一个小的优化：选择数量少的作为外循环。

循环集合的时间复杂度是 O(n), map.get() 的时间复杂度是 O(1);

```java
@Override
public void refreshExpire(Collection<K> keyList) {
    if(CollectionUtil.isEmpty(keyList)) {
        return;
    }
    // 判断大小，小的作为外循环。一般都是过期的 keys 比较小。
    if(keyList.size() <= expireMap.size()) {
        for(K key : keyList) {
            expireKey(key);
        }
    } else {
        for(Map.Entry<K, Long> entry : expireMap.entrySet()) {
            this.expireKey(entry);
        }
    }
}
```

## 测试

上面的代码写完之后，我们就可以验证一下了。

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .size(3)
        .build();
cache.put("1", "1");
cache.put("2", "2");

cache.expire("1", 10);
Assert.assertEquals(2, cache.size());

TimeUnit.MILLISECONDS.sleep(50);
Assert.assertEquals(1, cache.size());

System.out.println(cache.keySet());
```

结果也符合我们的预期。

# 小结

到这里，一个类似于 redis 的 expire 过期功能，算是基本实现了。

当然，还有很多优化的地方。

比如为了后续添加各种监听器方便，我对所有需要刷新的地方调整为使用字节码+注解的方式，而不是在每一个需要的方法中添加刷新方法。

下一节，我们将共同学习下如何实现各种监听器。

对你有帮助的话，欢迎点赞评论收藏关注一波走起~

你的鼓励，是我最大的动力~

# 原文地址

[Cache Travel-09-从零手写 cache 之 redis expire 过期实现原理](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-02-expire)

* any list
{:toc}
---
layout: post
title:  Cache Travel-09-java 从零开始手写 redis（七）LRU 缓存淘汰策略详解
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, redis, lru, sh]
published: true
---

# 前言

[java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s/6J2K2k4Db_20eGU6xGYVTw)

[java从零手写实现redis（三）redis expire 过期原理](https://mp.weixin.qq.com/s/BWfBc98oLqhAPLN2Hgkwow)

[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s/G41SRZQm1_0uQXBAGHAYbw)

[java从零手写实现redis（四）添加监听器](https://mp.weixin.qq.com/s/6pIG3l_wkXBwSuJvj_KwMA)

[java从零手写实现redis（五）过期策略的另一种实现思路](https://mp.weixin.qq.com/s/Atrd36UGds9_w_NFQDoEQg)

[java从零手写实现redis（六）AOF 持久化原理详解及实现](https://mp.weixin.qq.com/s/rFuSjNF43Ybxy-qBCtgasQ)

我们前面简单实现了 redis 的几个特性，[java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s/6J2K2k4Db_20eGU6xGYVTw) 中实现了先进先出的驱除策略。

但是实际工作实践中，一般推荐使用 LRU/LFU 的驱除策略。

# LRU 基础知识

## 拓展学习

[Apache Commons LRUMAP 源码详解](https://houbb.github.io/2018/09/01/cache-05-lrumap)

[Redis 当做 LRU MAP 使用](https://houbb.github.io/2018/12/12/redis-learn-21-as-lru-cache)

## LRU 是什么

LRU 是由 Least Recently Used 的首字母组成，表示最近最少使用的含义，一般使用在对象淘汰算法上。

也是比较常见的一种淘汰算法。

其核心思想是**如果数据最近被访问过，那么将来被访问的几率也更高**。

## 连续性

在计算机科学中，有一个指导准则：连续性准则。

时间连续性：对于信息的访问，最近被访问过，被再次访问的可能性会很高。缓存就是基于这个理念进行数据淘汰的。

空间连续性：对于磁盘信息的访问，将很有可能访问连续的空间信息。所以会有 page 预取来提升性能。

## 实现步骤

1. 新数据插入到链表头部；

2. 每当缓存命中（即缓存数据被访问），则将数据移到链表头部；

3. 当链表满的时候，将链表尾部的数据丢弃。

其实比较简单，比起 FIFO 的队列，我们引入一个链表实现即可。

## 一点思考

我们针对上面的 3 句话，逐句考虑一下，看看有没有值得优化点或者一些坑。

### 如何判断是新数据？

（1） 新数据插入到链表头部；

我们使用的是链表。

判断新数据最简单的方法就是遍历是否存在，对于链表，这是一个 O(n) 的时间复杂度。

其实性能还是比较差的。

当然也可以考虑空间换时间，比如引入一个 set 之类的，不过这样对空间的压力会加倍。

### 什么是缓存命中

（2）每当缓存命中（即缓存数据被访问），则将数据移到链表头部；

put(key,value) 的情况，就是新元素。如果已有这个元素，可以先删除，再加入，参考上面的处理。

get(key) 的情况，对于元素访问，删除已有的元素，将新元素放在头部。

remove(key) 移除一个元素，直接删除已有元素。

keySet() valueSet() entrySet() 这些属于无差别访问，我们不对队列做调整。

### 移除

（3）当链表满的时候，将链表尾部的数据丢弃。

链表满只有一种场景，那就是添加元素的时候，也就是执行 put(key, value) 的时候。

直接删除对应的 key 即可。

# java 代码实现

## 接口定义

和 FIFO 的接口保持一致，调用地方也不变。

为了后续 LRU/LFU 实现，新增 remove/update 两个方法。

```java
public interface ICacheEvict<K, V> {

    /**
     * 驱除策略
     *
     * @param context 上下文
     * @since 0.0.2
     * @return 是否执行驱除
     */
    boolean evict(final ICacheEvictContext<K, V> context);

    /**
     * 更新 key 信息
     * @param key key
     * @since 0.0.11
     */
    void update(final K key);

    /**
     * 删除 key 信息
     * @param key key
     * @since 0.0.11
     */
    void remove(final K key);

}
```

## LRU 实现

直接基于 LinkedList 实现：

```java
/**
 * 丢弃策略-LRU 最近最少使用
 * @author binbin.hou
 * @since 0.0.11
 */
public class CacheEvictLRU<K,V> implements ICacheEvict<K,V> {

    private static final Log log = LogFactory.getLog(CacheEvictLRU.class);

    /**
     * list 信息
     * @since 0.0.11
     */
    private final List<K> list = new LinkedList<>();

    @Override
    public boolean evict(ICacheEvictContext<K, V> context) {
        boolean result = false;
        final ICache<K,V> cache = context.cache();
        // 超过限制，移除队尾的元素
        if(cache.size() >= context.size()) {
            K evictKey = list.get(list.size()-1);
            // 移除对应的元素
            cache.remove(evictKey);
            result = true;
        }
        return result;
    }


    /**
     * 放入元素
     * （1）删除已经存在的
     * （2）新元素放到元素头部
     *
     * @param key 元素
     * @since 0.0.11
     */
    @Override
    public void update(final K key) {
        this.list.remove(key);
        this.list.add(0, key);
    }

    /**
     * 移除元素
     * @param key 元素
     * @since 0.0.11
     */
    @Override
    public void remove(final K key) {
        this.list.remove(key);
    }

}
```

实现比较简单，相对 FIFO 多了三个方法：

update()：我们做一点简化，认为只要是访问，就是删除，然后插入到队首。

remove()：删除就是直接删除。

这三个方法是用来更新最近使用情况的。

那什么时候调用呢？

## 注解属性

为了保证核心流程，我们基于注解实现。

添加属性：

```java
/**
 * 是否执行驱除更新
 *
 * 主要用于 LRU/LFU 等驱除策略
 * @return 是否
 * @since 0.0.11
 */
boolean evict() default false;
```

## 注解使用

有哪些方法需要使用？

```java
@Override
@CacheInterceptor(refresh = true, evict = true)
public boolean containsKey(Object key) {
    return map.containsKey(key);
}

@Override
@CacheInterceptor(evict = true)
@SuppressWarnings("unchecked")
public V get(Object key) {
    //1. 刷新所有过期信息
    K genericKey = (K) key;
    this.expire.refreshExpire(Collections.singletonList(genericKey));
    return map.get(key);
}

@Override
@CacheInterceptor(aof = true, evict = true)
public V put(K key, V value) {
    //...
}

@Override
@CacheInterceptor(aof = true, evict = true)
public V remove(Object key) {
    return map.remove(key);
}
```

## 注解驱除拦截器实现

执行顺序：放在方法之后更新，不然每次当前操作的 key 都会被放在最前面。

```java
/**
 * 驱除策略拦截器
 * 
 * @author binbin.hou
 * @since 0.0.11
 */
public class CacheInterceptorEvict<K,V> implements ICacheInterceptor<K, V> {

    private static final Log log = LogFactory.getLog(CacheInterceptorEvict.class);

    @Override
    public void before(ICacheInterceptorContext<K,V> context) {
    }

    @Override
    @SuppressWarnings("all")
    public void after(ICacheInterceptorContext<K,V> context) {
        ICacheEvict<K,V> evict = context.cache().evict();

        Method method = context.method();
        final K key = (K) context.params()[0];
        if("remove".equals(method.getName())) {
            evict.remove(key);
        } else {
            evict.update(key);
        }
    }

}
```

我们只对 remove 方法做下特判，其他方法都使用 update 更新信息。

参数直接取第一个参数。

## 测试

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .size(3)
        .evict(CacheEvicts.<String, String>lru())
        .build();
cache.put("A", "hello");
cache.put("B", "world");
cache.put("C", "FIFO");

// 访问一次A
cache.get("A");
cache.put("D", "LRU");
Assert.assertEquals(3, cache.size());

System.out.println(cache.keySet());
```

- 日志信息

```
[D, A, C]
```

通过 removeListener 日志也可以看到 B 被移除了：

```
[DEBUG] [2020-10-02 21:33:44.578] [main] [c.g.h.c.c.s.l.r.CacheRemoveListener.listen] - Remove key: B, value: world, type: evict
```

# 小结

redis LRU 淘汰策略，实际上并不是真正的 LRU。

LRU 有一个比较大的问题，就是每次 O(n) 去查找，这个在 keys 数量特别多的时候，还是很慢的。

如果 redis 这么设计肯定慢的要死了。

个人的理解是可以用空间换取时间，比如添加一个 `Map<String, Integer>` 存储在 list 中的 keys 和下标，O(1) 的速度去查找，但是空间复杂度翻倍了。

不过这个牺牲还是值得的。这种后续统一做下优化，将各种优化点统一考虑，这样可以统筹全局，也便于后期统一调整。

下一节我们将一起来实现以下改进版的 LRU。

Redis 做的事情，就是将看起来的简单的事情，做到一种极致，这一点值得每一个开源软件学习。

文中主要讲述了思路，实现部分因为篇幅限制，没有全部贴出来。

> 开源地址：[https://github.com/houbb/cache](https://github.com/houbb/cache)

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波~

你的鼓励，是我最大的动力~

# 参考资料

[缓存淘汰算法--LRU算法](https://zhuanlan.zhihu.com/p/34989978)

* any list
{:toc}
---
layout: post
title:  Cache Travel-09-从零开始手写 redis（八）朴素 LRU 淘汰算法性能优化
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

[java从零手写实现redis（七）LRU 缓存淘汰策略详解](https://mp.weixin.qq.com/s/X-OIqu_rgLskvbF2rZMP6Q)

前面我们共同实现了 LRU 基本的算法，但是性能存在一定的问题，本节一起来看一下如何解决性能问题。

# LRU 基础知识

## 是什么

LRU算法全称是最近最少使用算法（Least Recently Use），广泛的应用于缓存机制中。

当缓存使用的空间达到上限后，就需要从已有的数据中淘汰一部分以维持缓存的可用性，而淘汰数据的选择就是通过LRU算法完成的。

LRU算法的基本思想是基于局部性原理的时间局部性：

**如果一个信息项正在被访问，那么在近期它很可能还会被再次访问。**

## 拓展阅读

[Apache Commons LRUMAP 源码详解](https://houbb.github.io/2018/09/01/cache-05-lrumap)

[Redis 当做 LRU MAP 使用](https://houbb.github.io/2018/12/12/redis-learn-21-as-lru-cache)

[java 从零开始手写 redis（七）redis LRU 驱除策略详解及实现](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-07-evict-lru)


# 简单的实现思路

## 基于数组

方案：为每一个数据附加一个额外的属性——时间戳，当每一次访问数据时，更新该数据的时间戳至当前时间。

当数据空间已满后，则扫描整个数组，淘汰时间戳最小的数据。

不足：维护时间戳需要耗费额外的空间，淘汰数据时需要扫描整个数组。

这个时间复杂度太差，空间复杂度也不好。

## 基于长度有限的双向链表

方案：访问一个数据时，当数据不在链表中，则将数据插入至链表头部，如果在链表中，则将该数据移至链表头部。当数据空间已满后，则淘汰链表最末尾的数据。

不足：插入数据或取数据时，需要扫描整个链表。

这个就是我们上一节实现的方式，缺点还是很明显，每次确认元素是否存在，都要消耗 O(n) 的时间复杂度去查询。

## 基于双向链表和哈希表

方案：为了改进上面需要扫描链表的缺陷，配合哈希表，将数据和链表中的节点形成映射，将插入操作和读取操作的时间复杂度从O(N)降至O(1)

缺点：这个使我们上一节提到的优化思路，不过还是有缺点的，那就是空间复杂度翻倍。

### 数据结构的选择

（1）基于数组的实现

这里不建议选择 array 或者 ArrayList，因为读取的时间复杂度为 O(1)，但是更新相对是比较慢的，虽然 jdk 使用的是 System.arrayCopy。

（2）基于链表的实现

如果我们选择链表，HashMap 中还是不能简单的存储 key, 和对应的下标。

因为链表的遍历，实际上还是 O(n) 的，双向链表理论上可以优化一半，但是这并不是我们想要的 O(1) 效果。

（3）基于双向列表

双向链表我们保持不变。

Map 中 key 对应的值我们放双向链表的节点信息。

那实现方式就变成了实现一个双向链表。

### 代码实现

- 节点定义

```java
/**
 * 双向链表节点
 * @author binbin.hou
 * @since 0.0.12
 * @param <K> key
 * @param <V> value
 */
public class DoubleListNode<K,V> {

    /**
     * 键
     * @since 0.0.12
     */
    private K key;

    /**
     * 值
     * @since 0.0.12
     */
    private V value;

    /**
     * 前一个节点
     * @since 0.0.12
     */
    private DoubleListNode<K,V> pre;

    /**
     * 后一个节点
     * @since 0.0.12
     */
    private DoubleListNode<K,V> next;

    //fluent get & set
}
```

- 核心代码实现

我们保持和原来的接口不变，实现如下：

```java
public class CacheEvictLruDoubleListMap<K,V> extends AbstractCacheEvict<K,V> {

    private static final Log log = LogFactory.getLog(CacheEvictLruDoubleListMap.class);


    /**
     * 头结点
     * @since 0.0.12
     */
    private DoubleListNode<K,V> head;

    /**
     * 尾巴结点
     * @since 0.0.12
     */
    private DoubleListNode<K,V> tail;

    /**
     * map 信息
     *
     * key: 元素信息
     * value: 元素在 list 中对应的节点信息
     * @since 0.0.12
     */
    private Map<K, DoubleListNode<K,V>> indexMap;

    public CacheEvictLruDoubleListMap() {
        this.indexMap = new HashMap<>();
        this.head = new DoubleListNode<>();
        this.tail = new DoubleListNode<>();

        this.head.next(this.tail);
        this.tail.pre(this.head);
    }

    @Override
    protected ICacheEntry<K, V> doEvict(ICacheEvictContext<K, V> context) {
        ICacheEntry<K, V> result = null;
        final ICache<K,V> cache = context.cache();
        // 超过限制，移除队尾的元素
        if(cache.size() >= context.size()) {
            // 获取尾巴节点的前一个元素
            DoubleListNode<K,V> tailPre = this.tail.pre();
            if(tailPre == this.head) {
                log.error("当前列表为空，无法进行删除");
                throw new CacheRuntimeException("不可删除头结点!");
            }

            K evictKey = tailPre.key();
            V evictValue = cache.remove(evictKey);
            result = new CacheEntry<>(evictKey, evictValue);
        }

        return result;
    }


    /**
     * 放入元素
     *
     * （1）删除已经存在的
     * （2）新元素放到元素头部
     *
     * @param key 元素
     * @since 0.0.12
     */
    @Override
    public void update(final K key) {
        //1. 执行删除
        this.remove(key);

        //2. 新元素插入到头部
        //head<->next
        //变成：head<->new<->next
        DoubleListNode<K,V> newNode = new DoubleListNode<>();
        newNode.key(key);

        DoubleListNode<K,V> next = this.head.next();
        this.head.next(newNode);
        newNode.pre(this.head);
        next.pre(newNode);
        newNode.next(next);

        //2.2 插入到 map 中
        indexMap.put(key, newNode);
    }

    /**
     * 移除元素
     *
     * 1. 获取 map 中的元素
     * 2. 不存在直接返回，存在执行以下步骤：
     * 2.1 删除双向链表中的元素
     * 2.2 删除 map 中的元素
     *
     * @param key 元素
     * @since 0.0.12
     */
    @Override
    public void remove(final K key) {
        DoubleListNode<K,V> node = indexMap.get(key);

        if(ObjectUtil.isNull(node)) {
            return;
        }

        // 删除 list node
        // A<->B<->C
        // 删除 B，需要变成： A<->C
        DoubleListNode<K,V> pre = node.pre();
        DoubleListNode<K,V> next = node.next();

        pre.next(next);
        next.pre(pre);

        // 删除 map 中对应信息
        this.indexMap.remove(key);
    }

}
```

实现起来不难，就是一个简易版本的双向列表。

只是获取节点的时候，借助了一下 map，让时间复杂度降低为 O(1)。

### 测试

我们验证一下自己的实现：

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .size(3)
        .evict(CacheEvicts.<String, String>lruDoubleListMap())
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

- 日志

```
[DEBUG] [2020-10-03 09:37:41.007] [main] [c.g.h.c.c.s.l.r.CacheRemoveListener.listen] - Remove key: B, value: world, type: evict
[D, A, C]
```

因为我们访问过一次 A，所以 B 已经变成最少被访问的元素。

## 基于 LinkedHashMap 实现

实际上，LinkedHashMap 本身就是对于 list 和 hashMap 的一种结合的数据结构，我们可以直接使用 jdk 中 LinkedHashMap 去实现。

### 直接实现

```java
public class LRUCache extends LinkedHashMap {

    private int capacity;

    public LRUCache(int capacity) {
        // 注意这里将LinkedHashMap的accessOrder设为true
        super(16, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry eldest) {
        return super.size() >= capacity;
    }
}
```

默认LinkedHashMap并不会淘汰数据，所以我们重写了它的removeEldestEntry()方法，当数据数量达到预设上限后，淘汰数据，accessOrder设为true意为按照访问的顺序排序。

整个实现的代码量并不大，主要都是应用LinkedHashMap的特性。

### 简单改造

我们对这个方法简单改造下，让其适应我们定义的接口。

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .size(3)
        .evict(CacheEvicts.<String, String>lruLinkedHashMap())
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

### 测试

- 代码

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .size(3)
        .evict(CacheEvicts.<String, String>lruLinkedHashMap())
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

- 日志

```java
[DEBUG] [2020-10-03 10:20:57.842] [main] [c.g.h.c.c.s.l.r.CacheRemoveListener.listen] - Remove key: B, value: world, type: evict
[D, A, C]
```

# 小结

上一节中提到的数组 O(n) 遍历的问题，本节已经基本解决了。

但其实这种算法依然存在一定的问题，比如当偶发性的批量操作时，会导致热点数据被非热点数据挤出缓存，下一节我们一起学习如何进一步改进 LRU 算法。

文中主要讲述了思路，实现部分因为篇幅限制，没有全部贴出来。

> 开源地址：[https://github.com/houbb/cache](https://github.com/houbb/cache)

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更好的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

# 参考资料

[缓存淘汰算法--LRU算法](https://zhuanlan.zhihu.com/p/34989978)

[LRU算法及其优化策略——算法篇](https://juejin.im/post/6844904049263771662)

* any list
{:toc}
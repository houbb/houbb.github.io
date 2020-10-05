---
layout: post
title:  Cache Travel-09-java 从零开始手写 redis（九）LRU 缓存淘汰算法如何避免缓存污染
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

[从零开始手写 redis（八）朴素 LRU 淘汰算法性能优化](https://mp.weixin.qq.com/s/H8gOujnlTinctjVQqW0ITA)

前两节我们分别实现了 LRU 算法，并且进行了性能优化。

本节作为 LRU 算法的最后一节，主要解决一下缓存污染的问题。

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

## 朴素 LRU 算法的不足

当存在热点数据时，LRU的效率很好，但偶发性的、周期性的批量操作会导致LRU命中率急剧下降，缓存污染情况比较严重。

# 扩展算法

## 1. LRU-K

LRU-K中的K代表最近使用的次数，因此LRU可以认为是LRU-1。

LRU-K的主要目的是为了解决LRU算法“缓存污染”的问题，其核心思想是将“最近使用过1次”的判断标准扩展为“最近使用过K次”。

相比LRU，LRU-K需要多维护一个队列，用于记录所有缓存数据被访问的历史。只有当数据的访问次数达到K次的时候，才将数据放入缓存。

当需要淘汰数据时，LRU-K会淘汰第K次访问时间距当前时间最大的数据。

数据第一次被访问时，加入到历史访问列表，如果数据在访问历史列表中没有达到K次访问，则按照一定的规则（FIFO,LRU）淘汰；

当访问历史队列中的数据访问次数达到K次后，将数据索引从历史队列中删除，将数据移到缓存队列中，并缓存数据，缓存队列重新按照时间排序；

缓存数据队列中被再次访问后，重新排序，需要淘汰数据时，淘汰缓存队列中排在末尾的数据，即“淘汰倒数K次访问离现在最久的数据”。

LRU-K具有LRU的优点，同时还能避免LRU的缺点，实际应用中LRU-2是综合最优的选择。

由于LRU-K还需要记录那些被访问过、但还没有放入缓存的对象，因此内存消耗会比LRU要多。

## 2. two queue

Two queues（以下使用2Q代替）算法类似于LRU-2，不同点在于2Q将LRU-2算法中的访问历史队列（注意这不是缓存数据的）改为一个FIFO缓存队列，即：2Q算法有两个缓存队列，一个是FIFO队列，一个是LRU队列。 

当数据第一次访问时，2Q算法将数据缓存在FIFO队列里面，当数据第二次被访问时，则将数据从FIFO队列移到LRU队列里面，两个队列各自按照自己的方法淘汰数据。

新访问的数据插入到FIFO队列中，如果数据在FIFO队列中一直没有被再次访问，则最终按照FIFO规则淘汰；

如果数据在FIFO队列中再次被访问到，则将数据移到LRU队列头部，如果数据在LRU队列中再次被访问，则将数据移动LRU队列头部，LRU队列淘汰末尾的数据。

## 3. Multi Queue(MQ)

MQ算法根据访问频率将数据划分为多个队列，不同的队列具有不同的访问优先级，其核心思想是：**优先缓存访问次数多的数据**。 

详细的算法结构图如下，Q0，Q1....Qk代表不同的优先级队列，Q-history代表从缓存中淘汰数据，但记录了数据的索引和引用次数的队列：

新插入的数据放入Q0，每个队列按照LRU进行管理，当数据的访问次数达到一定次数，需要提升优先级时，将数据从当前队列中删除，加入到高一级队列的头部；为了防止高优先级数据永远不会被淘汰，当数据在指定的时间里没有被访问时，需要降低优先级，将数据从当前队列删除，加入到低一级的队列头部；需要淘汰数据时，从最低一级队列开始按照LRU淘汰，每个队列淘汰数据时，将数据从缓存中删除，将数据索引加入Q-history头部。

如果数据在Q-history中被重新访问，则重新计算其优先级，移到目标队列头部。 

Q-history按照LRU淘汰数据的索引。

MQ需要维护多个队列，且需要维护每个数据的访问时间，复杂度比LRU高。

## LRU算法对比

| 对比点 | 对比 |
|:---|:---|
| 命中率 | LRU-2 > MQ(2) > 2Q > LRU |
| 复杂度 | LRU-2 > MQ(2) > 2Q > LRU |
| 代价 | LRU-2  > MQ(2) > 2Q > LRU |

## 个人理解

实际上上面的几个算法，思想上大同小异。

核心目的：解决批量操作导致热点数据失效，缓存被污染的问题。

实现方式：增加一个队列，用来保存只访问一次的数据，然后根据次数不同，放入到 LRU 中。

只访问一次的队列，可以是 FIFO 队列，可以是 LRU，我们来实现一下 2Q 和 LRU-2 两种实现。

# 2Q 

## 实现思路

实际上就是我们以前的 FIFO + LRU 二者的结合。

## 代码实现

### 基本属性

```java
public class CacheEvictLru2Q<K,V> extends AbstractCacheEvict<K,V> {

    private static final Log log = LogFactory.getLog(CacheEvictLru2Q.class);

    /**
     * 队列大小限制
     *
     * 降低 O(n) 的消耗，避免耗时过长。
     * @since 0.0.13
     */
    private static final int LIMIT_QUEUE_SIZE = 1024;

    /**
     * 第一次访问的队列
     * @since 0.0.13
     */
    private Queue<K> firstQueue;

    /**
     * 头结点
     * @since 0.0.13
     */
    private DoubleListNode<K,V> head;

    /**
     * 尾巴结点
     * @since 0.0.13
     */
    private DoubleListNode<K,V> tail;

    /**
     * map 信息
     *
     * key: 元素信息
     * value: 元素在 list 中对应的节点信息
     * @since 0.0.13
     */
    private Map<K, DoubleListNode<K,V>> lruIndexMap;

    public CacheEvictLru2Q() {
        this.firstQueue = new LinkedList<>();
        this.lruIndexMap = new HashMap<>();
        this.head = new DoubleListNode<>();
        this.tail = new DoubleListNode<>();

        this.head.next(this.tail);
        this.tail.pre(this.head);
    }

}
```

### 数据淘汰

数据淘汰的逻辑：

当缓存大小，已经达到最大限制时执行：

（1）优先淘汰 firstQueue 中的数据

（2）如果 firstQueue 中数据为空，则淘汰 lruMap 中的数据信息。

这里有一个假设：我们认为被多次访问的数据，重要性高于被只访问了一次的数据。

```java
@Override
protected ICacheEntry<K, V> doEvict(ICacheEvictContext<K, V> context) {
    ICacheEntry<K, V> result = null;
    final ICache<K,V> cache = context.cache();
    // 超过限制，移除队尾的元素
    if(cache.size() >= context.size()) {
        K evictKey = null;
        //1. firstQueue 不为空，优先移除队列中元素
        if(!firstQueue.isEmpty()) {
            evictKey = firstQueue.remove();
        } else {
            // 获取尾巴节点的前一个元素
            DoubleListNode<K,V> tailPre = this.tail.pre();
            if(tailPre == this.head) {
                log.error("当前列表为空，无法进行删除");
                throw new CacheRuntimeException("不可删除头结点!");
            }
            evictKey = tailPre.key();
        }
        // 执行移除操作
        V evictValue = cache.remove(evictKey);
        result = new CacheEntry<>(evictKey, evictValue);
    }
    return result;
}
```

### 数据删除

当数据被删除时调用：

这个逻辑和以前类似，只是多了一个 FIFO 队列的移除。

```java
/**
 * 移除元素
 *
 * 1. 获取 map 中的元素
 * 2. 不存在直接返回，存在执行以下步骤：
 * 2.1 删除双向链表中的元素
 * 2.2 删除 map 中的元素
 *
 * @param key 元素
 * @since 0.0.13
 */
@Override
public void removeKey(final K key) {
    DoubleListNode<K,V> node = lruIndexMap.get(key);
    //1. LRU 删除逻辑
    if(ObjectUtil.isNotNull(node)) {
        // A<->B<->C
        // 删除 B，需要变成： A<->C
        DoubleListNode<K,V> pre = node.pre();
        DoubleListNode<K,V> next = node.next();
        pre.next(next);
        next.pre(pre);
        // 删除 map 中对应信息
        this.lruIndexMap.remove(node.key());
    } else {
        //2. FIFO 删除逻辑（O(n) 时间复杂度）
        firstQueue.remove(key);
    }
}
```

### 数据的更新

当数据被访问时，提升数据的优先级。

（1）如果在 lruMap 中，则首先移除，然后放入到头部

（2）如果不在 lruMap 中，但是在 FIFO 队列，则从 FIFO 队列中移除，添加到 LRU map 中。

（3）如果都不在，直接加入到 FIFO 队列中即可。

```java
/**
 * 放入元素
 * 1. 如果 lruIndexMap 已经存在，则处理 lru 队列，先删除，再插入。
 * 2. 如果 firstQueue 中已经存在，则处理 first 队列，先删除 firstQueue，然后插入 Lru。
 * 1 和 2 是不同的场景，但是代码实际上是一样的，删除逻辑中做了二种场景的兼容。
 *
 * 3. 如果不在1、2中，说明是新元素，直接插入到 firstQueue 的开始即可。
 *
 * @param key 元素
 * @since 0.0.13
 */
@Override
public void updateKey(final K key) {
    //1.1 是否在 LRU MAP 中
    //1.2 是否在 firstQueue 中
    DoubleListNode<K,V> node = lruIndexMap.get(key);
    if(ObjectUtil.isNotNull(node)
        || firstQueue.contains(key)) {
        //1.3 删除信息
        this.removeKey(key);
        //1.4 加入到 LRU 中
        this.addToLruMapHead(key);
        return;
    }
    //2. 直接加入到 firstQueue 队尾
    //        if(firstQueue.size() >= LIMIT_QUEUE_SIZE) {
//            // 避免第一次访问的列表一直增长，移除队头的元素
//            firstQueue.remove();
//        }
    firstQueue.add(key);
}
```


这里我想到了一个优化点，限制 firstQueue 的一直增长，因为遍历的时间复杂度为 O(n)，所以限制最大的大小为 1024。

如果超过了，则把 FIFO 中的元素先移除掉。

不过只移除 FIFO，不移除 cache，会导致二者的活跃程度不一致；

如果同时移除，但是 cache 的大小还没有满足，可能会导致超出用户的预期，这个可以作为一个优化点，暂时注释掉。

## 测试

### 代码

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .size(3)
        .evict(CacheEvicts.<String, String>lru2Q())
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

### 效果

```
[DEBUG] [2020-10-03 13:15:50.670] [main] [c.g.h.c.c.s.l.r.CacheRemoveListener.listen] - Remove key: B, value: world, type: evict
[D, A, C]
```

# LRU-2 实现

## 说明

FIFO 中的缺点还是比较明显的，需要 O(n) 的时间复杂度做遍历。

而且命中率和 LRU-2 比起来还是会差一点。

## 准备工作

这里 LRU map 出现了多次，我们为了方便，将 LRU map 简单的封装为一个数据结构。

我们使用双向链表+HashMap 实现一个简单版本的。

### 节点

node 节点和以前一致：

```java
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

    //fluent getter & setter
}
```

### 接口

我们根据自己的需要，暂时定义 3 个最重要的方法。

```java
/**
 * LRU map 接口
 * @author binbin.hou
 * @since 0.0.13
 */
public interface ILruMap<K,V> {

    /**
     * 移除最老的元素
     * @return 移除的明细
     * @since 0.0.13
     */
    ICacheEntry<K, V> removeEldest();

    /**
     * 更新 key 的信息
     * @param key key
     * @since 0.0.13
     */
    void updateKey(final K key);

    /**
     * 移除对应的 key 信息
     * @param key key
     * @since 0.0.13
     */
    void removeKey(final K key);

    /**
     * 是否为空
     * @return 是否
     * @since 0.0.13
     */
    boolean isEmpty();

    /**
     * 是否包含元素
     * @param key 元素
     * @return 结果
     * @since 0.0.13
     */
    boolean contains(final K key);
}
```

### 实现

我们基于 DoubleLinkedList + HashMap 实现。

就是把上一节中的实现整理一下即可。

```java
import com.github.houbb.cache.api.ICacheEntry;
import com.github.houbb.cache.core.exception.CacheRuntimeException;
import com.github.houbb.cache.core.model.CacheEntry;
import com.github.houbb.cache.core.model.DoubleListNode;
import com.github.houbb.cache.core.support.struct.lru.ILruMap;
import com.github.houbb.heaven.util.lang.ObjectUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * 基于双向列表的实现
 * @author binbin.hou
 * @since 0.0.13
 */
public class LruMapDoubleList<K,V> implements ILruMap<K,V> {

    private static final Log log = LogFactory.getLog(LruMapDoubleList.class);

    /**
     * 头结点
     * @since 0.0.13
     */
    private DoubleListNode<K,V> head;

    /**
     * 尾巴结点
     * @since 0.0.13
     */
    private DoubleListNode<K,V> tail;

    /**
     * map 信息
     *
     * key: 元素信息
     * value: 元素在 list 中对应的节点信息
     * @since 0.0.13
     */
    private Map<K, DoubleListNode<K,V>> indexMap;

    public LruMapDoubleList() {
        this.indexMap = new HashMap<>();
        this.head = new DoubleListNode<>();
        this.tail = new DoubleListNode<>();

        this.head.next(this.tail);
        this.tail.pre(this.head);
    }

    @Override
    public ICacheEntry<K, V> removeEldest() {
        // 获取尾巴节点的前一个元素
        DoubleListNode<K,V> tailPre = this.tail.pre();
        if(tailPre == this.head) {
            log.error("当前列表为空，无法进行删除");
            throw new CacheRuntimeException("不可删除头结点!");
        }

        K evictKey = tailPre.key();
        V evictValue = tailPre.value();

        return CacheEntry.of(evictKey, evictValue);
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
    public void updateKey(final K key) {
        //1. 执行删除
        this.removeKey(key);

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
     * @since 0.0.13
     */
    @Override
    public void removeKey(final K key) {
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

    @Override
    public boolean isEmpty() {
        return indexMap.isEmpty();
    }

    @Override
    public boolean contains(K key) {
        return indexMap.containsKey(key);
    }
}
```

## 实现思路

LRU 的实现保持不变。我们直接将 FIFO 替换为 LRU map 即可。

为了便于理解，我们将 FIFO 对应为 firstLruMap，用来存放用户只访问了一次的元素。

将原来的 LRU 中存入访问了 2 次及其以上的元素。

其他逻辑和 2Q 保持一致。

## 实现

### 基本属性

定义两个 LRU，用来分别存储访问的信息

```java
public class CacheEvictLru2<K,V> extends AbstractCacheEvict<K,V> {

    private static final Log log = LogFactory.getLog(CacheEvictLru2.class);

    /**
     * 第一次访问的 lru
     * @since 0.0.13
     */
    private final ILruMap<K,V> firstLruMap;

    /**
     * 2次及其以上的 lru
     * @since 0.0.13
     */
    private final ILruMap<K,V> moreLruMap;

    public CacheEvictLru2() {
        this.firstLruMap = new LruMapDoubleList<>();
        this.moreLruMap = new LruMapDoubleList<>();
    }

}
```

### 淘汰实现

和 lru 2Q 模式类似，这里我们优先淘汰 firstLruMap 中的数据信息。

```java
@Override
protected ICacheEntry<K, V> doEvict(ICacheEvictContext<K, V> context) {
    ICacheEntry<K, V> result = null;
    final ICache<K,V> cache = context.cache();
    // 超过限制，移除队尾的元素
    if(cache.size() >= context.size()) {
        ICacheEntry<K,V>  evictEntry = null;
        //1. firstLruMap 不为空，优先移除队列中元素
        if(!firstLruMap.isEmpty()) {
            evictEntry = firstLruMap.removeEldest();
            log.debug("从 firstLruMap 中淘汰数据：{}", evictEntry);
        } else {
            //2. 否则从 moreLruMap 中淘汰数据
            evictEntry = moreLruMap.removeEldest();
            log.debug("从 moreLruMap 中淘汰数据：{}", evictEntry);
        }
        // 执行缓存移除操作
        final K evictKey = evictEntry.key();
        V evictValue = cache.remove(evictKey);
        result = new CacheEntry<>(evictKey, evictValue);
    }
    return result;
}
```

### 删除

```java
/**
 * 移除元素
 *
 * 1. 多次 lru 中存在，删除
 * 2. 初次 lru 中存在，删除
 *
 * @param key 元素
 * @since 0.0.13
 */
@Override
public void removeKey(final K key) {
    //1. 多次LRU 删除逻辑
    if(moreLruMap.contains(key)) {
        moreLruMap.removeKey(key);
        log.debug("key: {} 从 moreLruMap 中移除", key);
    } else {
        firstLruMap.removeKey(key);
        log.debug("key: {} 从 firstLruMap 中移除", key);
    }
}
```

### 更新

```java
/**
 * 更新信息
 * 1. 如果 moreLruMap 已经存在，则处理 more 队列，先删除，再插入。
 * 2. 如果 firstLruMap 中已经存在，则处理 first 队列，先删除 firstLruMap，然后插入 Lru。
 * 1 和 2 是不同的场景，但是代码实际上是一样的，删除逻辑中做了二种场景的兼容。
 *
 * 3. 如果不在1、2中，说明是新元素，直接插入到 firstLruMap 的开始即可。
 *
 * @param key 元素
 * @since 0.0.13
 */
@Override
public void updateKey(final K key) {
    //1. 元素已经在多次访问，或者第一次访问的 lru 中
    if(moreLruMap.contains(key)
        || firstLruMap.contains(key)) {
        //1.1 删除信息
        this.removeKey(key);
        //1.2 加入到多次 LRU 中
        moreLruMap.updateKey(key);
        log.debug("key: {} 多次访问，加入到 moreLruMap 中", key);
    } else {
        // 2. 加入到第一次访问 LRU 中
        firstLruMap.updateKey(key);
        log.debug("key: {} 为第一次访问，加入到 firstLruMap 中", key);
    }
}
```

实际上使用 LRU-2 的代码逻辑反而变得清晰了一些，主要是因为我们把 lruMap 作为独立的数据结构抽离了出去。

## 测试

### 代码

```java
ICache<String, String> cache = CacheBs.<String,String>newInstance()
        .size(3)
        .evict(CacheEvicts.<String, String>lru2Q())
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

### 日志

为了便于定位分析，源代码实现的时候，加了一点日志。

```java
[DEBUG] [2020-10-03 14:39:04.966] [main] [c.g.h.c.c.s.e.CacheEvictLru2.updateKey] - key: A 为第一次访问，加入到 firstLruMap 中
[DEBUG] [2020-10-03 14:39:04.967] [main] [c.g.h.c.c.s.e.CacheEvictLru2.updateKey] - key: B 为第一次访问，加入到 firstLruMap 中
[DEBUG] [2020-10-03 14:39:04.968] [main] [c.g.h.c.c.s.e.CacheEvictLru2.updateKey] - key: C 为第一次访问，加入到 firstLruMap 中
[DEBUG] [2020-10-03 14:39:04.970] [main] [c.g.h.c.c.s.e.CacheEvictLru2.removeKey] - key: A 从 firstLruMap 中移除
[DEBUG] [2020-10-03 14:39:04.970] [main] [c.g.h.c.c.s.e.CacheEvictLru2.updateKey] - key: A 多次访问，加入到 moreLruMap 中
[DEBUG] [2020-10-03 14:39:04.972] [main] [c.g.h.c.c.s.e.CacheEvictLru2.doEvict] - 从 firstLruMap 中淘汰数据：EvictEntry{key=B, value=null}
[DEBUG] [2020-10-03 14:39:04.974] [main] [c.g.h.c.c.s.l.r.CacheRemoveListener.listen] - Remove key: B, value: world, type: evict
[DEBUG] [2020-10-03 14:39:04.974] [main] [c.g.h.c.c.s.e.CacheEvictLru2.updateKey] - key: D 为第一次访问，加入到 firstLruMap 中
[D, A, C]
```

# 小结

对于 LRU 算法的改进我们主要做了两点：

（1）性能的改进，从 O(N) 优化到 O(1)

（2）批量操作的改进，避免缓存污染

其实除了 LRU，我们还有其他的淘汰策略。

我们需要考虑下面的问题：

A 数据被访问了 10 次，B 数据被访问了 2 次。那么二者谁是热点数据呢？

如果你认为肯定 A 是热点数据，这里实际上是另一种淘汰算法，基于 LFU 的淘汰算法，**认为访问次数越多，就越是热点数据**。

我们下一节共同学习下 LFU 淘汰算法的实现。

> 开源地址：[https://github.com/houbb/cache](https://github.com/houbb/cache)

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波，你的鼓励，是我最大的动力~

目前我们通过两次优化，解决了性能问题，和批量导致的缓存污染问题。

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

# 参考资料

[LRU算法及其优化策略——算法篇](https://juejin.im/post/6844904049263771662)

[LRU算法四种实现方式介绍](https://blog.csdn.net/elricboa/article/details/78847305)

[算法就像搭乐高：带你手撸 LRU 算法](https://labuladong.gitbook.io/algo/shu-ju-jie-gou-xi-lie/lru-suan-fa)

[LRU - 缓存淘汰算法](https://www.jianshu.com/p/5451e22109a1)

* any list
{:toc}
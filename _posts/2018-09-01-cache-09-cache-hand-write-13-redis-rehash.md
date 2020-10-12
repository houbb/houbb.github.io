---
layout: post
title:  Cache Travel-09-从零手写缓存框架（14）redis渐进式rehash详解
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, redis, lru, sh]
published: true
---

# redis 的 rehash 设计

本文思维导图如下：

!["redis+渐进式+rehash](https://images.gitee.com/uploads/images/2020/1011/130750_0bdc7034_508704.png)

## HashMap 的 rehash 回顾

读过 HashMap 源码的同学，应该都知道 map 在扩容的时候，有一个 rehash 的过程。

没有读过也没有关系，可以花时间阅读下 [从零开始手写 redis(13) HashMap源码详解](https://www.toutiao.com/i6881966640594944516/) 简单了解下整个过程即可。

## HashMap 的扩容简介

这里简单介绍下：

扩容(resize)就是重新计算容量，向HashMap对象里不停的添加元素，而HashMap对象内部的数组无法装载更多的元素时，对象就需要扩大数组的长度，以便能装入更多的元素。

当然Java里的数组是无法自动扩容的，方法是使用一个新的数组代替已有的容量小的数组，就像我们用一个小桶装水，如果想装更多的水，就得换大水桶。

## redis 中的扩容设计

HashMap 的扩容需要对集合中大部分的元素进行重新计算，但是对于 redis 这种企业级应用，特别是单线程的应用，如果像传统的 rehash 一样把所有元素来一遍的话，估计要十几秒的时间。

十几秒对于常见的金融、电商等相对高并发的业务场景，是无法忍受的。

那么 redis 的 rehash 是如何实现的呢？

实际上 redis 的 rehash 动作并不是一次性、集中式地完成的， 而是**分多次、渐进式地完成的**。

这里补充一点，不单单是扩容，缩容也是一样的道理，二者都需要进行 rehash。

只增不降就是对内存的浪费，浪费就是犯罪，特别是内存还这么贵。

ps: 这种思想和 key 淘汰有异曲同工之妙，一口吃不了一个大胖子，一次搞不定，那就 1024 次，慢慢来总能解决问题。

# Redis 的渐进式 rehash

这部分直接选自经典入门书籍《Redis 设计与实现》

## 为什么要渐进式处理？

实际上 redis 内部有两个 hashtable，我们称之为 ht[0] 和 ht[1]。传统的 HashMap 中只有一个。

为了避免 rehash 对服务器性能造成影响， 服务器不是一次性将 ht[0] 里面的所有键值对全部 rehash 到 ht[1] ， 而是分多次、渐进式地将 ht[0] 里面的键值对慢慢地 rehash 到 ht[1] 。

## 详细步骤

哈希表渐进式 rehash 的详细步骤：

（1）为 ht[1] 分配空间， 让字典同时持有 ht[0] 和 ht[1] 两个哈希表。

（2）在字典中维持一个索引计数器变量 rehashidx ， 并将它的值设置为 0 ， 表示 rehash 工作正式开始。

（3）在 rehash 进行期间， 每次对字典执行添加、删除、查找或者更新操作时， 程序除了执行指定的操作以外， 还会顺带将 ht[0] 哈希表在 rehashidx 索引上的所有键值对 rehash 到 ht[1] ， 当 rehash 工作完成之后， 程序将 rehashidx 属性的值增1。

（4）随着字典操作的不断执行， 最终在某个时间点上， ht[0] 的所有键值对都会被 rehash 至 ht[1] ， 这时程序将 rehashidx 属性的值设为 -1 ， 表示 rehash 操作已完成。

渐进式 rehash 的好处在于它采取分而治之的方式， 将 rehash 键值对所需的计算工作均滩到对字典的每个添加、删除、查找和更新操作上， 从而避免了集中式 rehash 而带来的庞大计算量。

## rehash 间的操作怎么兼容呢？

因为在进行渐进式 rehash 的过程中， 字典会同时使用 ht[0] 和 ht[1] 两个哈希表， 那这期间的操作如何保证正常进行呢？

（1）查询一个信息

这个类似于我们的数据库信息等迁移，先查询一个库，没有的话，再去查询另一个库。

ht[0] 中没找到，我们去 ht[1] 中查询即可。

（2）新数据怎么办？

这个和数据迁移一样的道理。

当我们有新旧的两个系统时，新来的用户等信息直接落在新系统即可，

这一措施保证了 ht[0] 包含的键值对数量会只减不增， 并随着 rehash 操作的执行而最终变成空表。

## 一图胜千言

我们来看图：

（1）准备 rehash

![输入图片说明](https://images.gitee.com/uploads/images/2020/1011/110624_fdafc2dc_508704.png)

（2）rehash index=0

![输入图片说明](https://images.gitee.com/uploads/images/2020/1011/111105_33e2b631_508704.png)

（3）rehash index=1

![输入图片说明](https://images.gitee.com/uploads/images/2020/1011/111124_b9710fbe_508704.png)

（4）rehash index=2

![输入图片说明](https://images.gitee.com/uploads/images/2020/1011/111739_e35276ba_508704.png)

（5）rehash index=3

![输入图片说明](https://images.gitee.com/uploads/images/2020/1011/111756_81b4c0ba_508704.png)

（6）rehash 完成

![输入图片说明](https://images.gitee.com/uploads/images/2020/1011/111810_5cc3e090_508704.png)

# 缩容扩容的思考

看完了上面的流程，不知道你对 rehash 是否有一个大概了思路呢？

下面让我们来一起思考下几个缩扩容的问题。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1011/123451_15cd3567_508704.jpeg)

## 什么时候扩容呢？

### 什么时候判断？

redis 在每次执行 put 操作的时候，就可以检查是否需要扩容。

其实也很好理解，put 插入元素的时候，判断是否需要扩容，然后开始扩容，是直接的一种思路。

留一个思考题：我们可以在其他的时候判断吗？

### redis 判断是否需要扩容的源码

```c
/* Expand the hash table if needed */
static int _dictExpandIfNeeded(dict *d)
{
    /* Incremental rehashing already in progress. Return. */
    // 如果正在进行渐进式扩容，则返回OK
    if (dictIsRehashing(d)) return DICT_OK;

    /* If the hash table is empty expand it to the initial size. */
    // 如果哈希表ht[0]的大小为0，则初始化字典
    if (d->ht[0].size == 0) return dictExpand(d, DICT_HT_INITIAL_SIZE);

    /* If we reached the 1:1 ratio, and we are allowed to resize the hash
     * table (global setting) or we should avoid it but the ratio between
     * elements/buckets is over the "safe" threshold, we resize doubling
     * the number of buckets. */
    /*
     * 如果哈希表ht[0]中保存的key个数与哈希表大小的比例已经达到1:1，即保存的节点数已经大于哈希表大小
     * 且redis服务当前允许执行rehash，或者保存的节点数与哈希表大小的比例超过了安全阈值（默认值为5）
     * 则将哈希表大小扩容为原来的两倍
     */
    if (d->ht[0].used >= d->ht[0].size &&
        (dict_can_resize ||
         d->ht[0].used/d->ht[0].size > dict_force_resize_ratio))
    {
        return dictExpand(d, d->ht[0].used*2);
    }
    return DICT_OK;
}
```

扩容的条件总结下来就是两句话：

（1）服务器目前没有在执行 BGSAVE/BGREWRITEAOF 命令， 并且哈希表的负载因子大于等于 1；

（2）服务器目前正在执行 BGSAVE/BGREWRITEAOF 命令， 并且哈希表的负载因子大于等于 5；

这里其实体现了作者的一种设计思想：如果负载因子超过5，说明信息已经很多了，管你在不在保存，都要执行扩容，优先保证服务可用性。如果没那么高，那就等持久化完成再做 rehash。

我们自己在实现的时候可以简化一下，比如只考虑情况2。

## 扩容到原来的多少？

知道了什么时候应该开始扩容，但是要扩容到多大也是值得思考的一个问题。

扩容的太小，会导致频繁扩容，浪费性能。

扩容的太大，会导致资源的浪费。

其实这个最好的方案是结合我们实际的业务，不过这部分对用户是透明的。

一般是扩容为原来的两倍。

## 为什么需要扩容？

我们在实现 ArrayList 的时候需要扩容，因为数据放不下了。

我们知道 HashMap 的底层是数组 + 链表（红黑树）的数据结构。

那么会存在放不下的情况吗？

个人理解实际上不会。因为链表可以一直加下去。

那为什么需要扩容呢？

实际上更多的是处于性能的考虑。我们使用 HashMap 就是为了提升性能，如果一直不扩容，可以理解为元素都 hash 到相同的 bucket 上，这时就退化成了一个链表。

这会导致查询等操作性能大大降低。

## 什么时候缩容呢？

### 何时判断

看了前面的扩容，我们比较直观地方式是在用户 remove 元素的时候执行是否需要缩容。

不过 redis 并不完全等同于传统的 HashMap，还有数据的淘汰和过期，这些是对用户透明的。

redis 采用的方式实际上是一个定时任务。

个人理解内存缩容很重要，但是没有那么紧急，我们可以 1min 扫描一次，这样可以节省机器资源。

实际工作中，一般 redis 的内存都是逐步上升的，或者稳定在一个范围内，很少去大批量删除数据。（除非数据搞错了，我就遇到过一次，数据同步错地方了）。

所以数据删除，一般几分钟内给用户一个反馈就行。

知其然，知其所以然。

我们懂得了这个道理也就懂得了为什么有时候删除 redis 的几百万 keys，内存也不是直接降下来的原因。

### 缩容的条件

```java
/* If the percentage of used slots in the HT reaches HASHTABLE_MIN_FILL
 * we resize the hash table to save memory */
void tryResizeHashTables(int dbid) {
    if (htNeedsResize(server.db[dbid].dict))
        dictResize(server.db[dbid].dict);
    if (htNeedsResize(server.db[dbid].expires))
        dictResize(server.db[dbid].expires);
}

/* Hash table parameters */
#define HASHTABLE_MIN_FILL        10      /* Minimal hash table fill 10% */
int htNeedsResize(dict *dict) {
    long long size, used;

    size = dictSlots(dict);
    used = dictSize(dict);
    return (size > DICT_HT_INITIAL_SIZE &&
            (used*100/size < HASHTABLE_MIN_FILL));
}

/* Resize the table to the minimal size that contains all the elements,
 * but with the invariant of a USED/BUCKETS ratio near to <= 1 */
int dictResize(dict *d)
{
    int minimal;

    if (!dict_can_resize || dictIsRehashing(d)) return DICT_ERR;
    minimal = d->ht[0].used;
    if (minimal < DICT_HT_INITIAL_SIZE)
        minimal = DICT_HT_INITIAL_SIZE;
    return dictExpand(d, minimal);
}
```

和扩容类似，不过这里的缩容比例不是 5 倍，而是当哈希表保存的key数量与哈希表的大小的比例小于 10% 时需要缩容。

## 缩容到多少？

最简单的方式是直接变为原来的一半，不过这么做有时候也不是那么好用。

redis 是**缩容后的大小为第一个大于等于当前key数量的2的n次方。**

这个可能不太好理解，举几个数字就懂了：

| keys数量 |  缩容大小 | 
|:----|:----|
| 3 | 4 |
| 4 | 4 |
| 5 | 8 |
| 9 | 16 |

主要保障以下3点：

（1）缩容之后，要大于等于 key 的数量

（2）尽可能的小，节约内存

（3）2 的倍数。

第三个看过 HashMap 源码讲解的小伙伴应该深有体会。

当然也不能太小，redis 限制的最小为 4。

实际上如果 redis 中只放 4 个 key，实在是杀鸡用牛刀，一般不会这么小。

我们在实现的时候，直接参考 jdk 好了，给个最小值限制 8。

## 为什么需要缩容？

最核心的目的就是为了节约内存，其实还有一个原因，叫 small means fast（小即是快——老马）。

# 渐进式 ReHash 实现的思考

好了，扩容和缩容就聊到这里，那么这个渐进式 rehash 到底怎么一个渐进法？

![什么是渐进式](https://images.gitee.com/uploads/images/2020/1011/124519_05547151_508704.png)

## 扩容前

不需要扩容时应该有至少需要初始化两个元素：

```java
hashtable[0] = new HashTable(size);
hashIndex=-1;

hashtable[1] = null;
```

hashtable 中存储着当前的元素信息，hashIndex=-1 标识当前没有在进行扩容。

## 扩容准备

当需要扩容的时候，我们再去创建一个 hashtable[1]，并且 size 是原来的 2倍。

```java
hashtable[0] = new HashTable(size);

hashtable[1] = new HashTable(2 * size);

hashIndex=-1;
```

主要是为了节约内存，使用惰性初始化的方式创建 hashtable。

## 扩容时

调整 hashIndex=0...size，逐步去 rehash 到新的 hashtable[1]

新的插入全部放入到 hashtable[1]

## 扩容后

扩容后我们应该把 hashtable[0] 的值更新为 hashtable[1]，并且释放掉 hashtable[1] 的资源。

并且设置 hashIndex=-1，标识已经 rehash 完成

```java
hashtable[0] = hashtable[1];
hashIndex=-1;

hashtable[1] = null;
```

这样整体的实现思路就已经差不多了，光说不练假把式，我们下一节就来自己实现一个渐进式 rehash 的 HashMap。

至于现在，先让 rehash 的思路飞一会儿~

![6](https://images.gitee.com/uploads/images/2020/1011/130235_ca732822_508704.png)

# 小结

本节我们对 redis rehash 的原理进行了讲解，其中也加入了不少自己的思考。

文章的结尾，也添加了简单的实现思路，当然实际实现还会有很多问题需要解决。

下一节我们将一起手写一个渐进式 rehash 的 HashMap，感兴趣的伙伴可以关注一波，即使获取最新动态~

> 开源地址：[https://github.com/houbb/cache](https://github.com/houbb/cache)

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

# 参考资料

[渐进式 rehash](http://redisbook.com/preview/dict/incremental_rehashing.html)

[美团针对Redis Rehash机制的探索和实践](https://tech.meituan.com/2018/07/27/redis-rehash-practice-optimization.html)

[redis渐进式rehash机制](https://luoming1224.github.io/2018/11/12/[redis%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0]redis%E6%B8%90%E8%BF%9B%E5%BC%8Frehash%E6%9C%BA%E5%88%B6/)

* any list
{:toc}
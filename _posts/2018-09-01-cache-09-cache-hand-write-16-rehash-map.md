---
layout: post
title:  Cache Travel-09-从零开始手写redis（16）实现渐进式 rehash map
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, redis, lru, sh]
published: true
---


思维导图：

![实现渐进式rehash](https://images.gitee.com/uploads/images/2020/1012/212216_5c05cda0_508704.png)

# 上节内容回顾

我们在 [从零手写缓存框架（15）实现自己的 HashMap](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-15-write-hashmap) 中已经实现了自己的简易版本的 HashMap，下面就让我们为这个简易版的 HashMap 加一点特技，让他变成一个渐进式 HashMap。

![duang~](https://images.gitee.com/uploads/images/2020/1012/211146_ddc82d9a_508704.png)

# 渐进式 rehash

好了，接下来，让我们考虑下，如何实现一个渐进式 rehash 的 Map？

## 实现流程

让我们在回顾一遍 redis 的渐进式 rehash 过程：

哈希表渐进式 rehash 的详细步骤：

（1）为 ht[1] 分配空间， 让字典同时持有 ht[0] 和 ht[1] 两个哈希表。

（2）在字典中维持一个索引计数器变量 rehashidx ， 并将它的值设置为 0 ， 表示 rehash 工作正式开始。

（3）在 rehash 进行期间， 每次对字典执行添加、删除、查找或者更新操作时， 程序除了执行指定的操作以外， 还会顺带将 ht[0] 哈希表在 rehashidx 索引上的所有键值对 rehash 到 ht[1] ， 当 rehash 工作完成之后， 程序将 rehashidx 属性的值增1。

（4）随着字典操作的不断执行， 最终在某个时间点上， ht[0] 的所有键值对都会被 rehash 至 ht[1] ， 这时程序将 rehashidx 属性的值设为 -1 ， 表示 rehash 操作已完成。

## 实现方式

我们直接在上面简易版本的基础上进行实现。

实习过程中发现还是有点难度的，代码量也是成倍增长。

本次编写耗费的时间较多，大家一次看不完建议收藏，慢慢学习。

无论面试还是工作，都可以做到知其然，知其所以然。升职加薪，不在话下。

## 类定义

```java
/**
 * 自己实现的渐进式 rehash map
 *
 * @since 0.0.3
 * @param <K> key 泛型
 * @param <V> value 泛型
 * @see HashMap
 * @author binbin.hou
 */
public class MyProgressiveReHashMap<K,V> extends AbstractMap<K,V> implements Map<K,V> {
}
```

和简易版本类似。

## 私有变量

```java
private static final Log log = LogFactory.getLog(MyProgressiveReHashMap.class);

/**
 * rehash 的下标
 *
 * 如果 rehashIndex != -1，说明正在进行 rehash
 * @since 0.0.3
 * @author binbin.hou
 */
private int rehashIndex = -1;

/**
 * 容量
 * 默认为 8
 */
private int capacity;

/**
 * 处于 rehash 状态的容量
 * @since 0.0.3
 */
private int rehashCapacity;

/**
 * 统计大小的信息
 */
private int size = 0;

/**
 * 阈值
 * 阈值=容量*factor
 * 暂时不考虑最大值的问题
 *
 * 当达到这个阈值的时候，直接进行两倍的容量扩充+rehash。
 */
private final double factor = 1.0;

/**
 * 用来存放信息的 table 数组。
 * 数组：数组的下标是一个桶，桶对应的元素 hash 值相同。
 * 桶里放置的是一个链表。
 *
 * 可以理解为 table 是一个 ArrayList
 * arrayList 中每一个元素，都是一个 DoubleLinkedList
 */
private List<List<Entry<K, V>>> table;

/**
 * 渐进式 rehash 时，用来存储元素信息使用。
 *
 * @since 0.0.3
 */
private List<List<Entry<K, V>>> rehashTable;

/**
 * 是否开启 debug 模式
 * @since 0.0.3
 */
private boolean debugMode = false;
```

rehashIndex/rehashCapacity/rehashTable 这三个值都是我们在进行渐进式实现的时候需要使用的值。

## 构造器

主要是一些值的初始化。

```java
public MyProgressiveReHashMap() {
    this(8);
}

/**
 * 初始化 hash map
 * @param capacity 初始化容量
 */
public MyProgressiveReHashMap(int capacity) {
    this(capacity, false);
}

/**
 * 初始化 hash map
 * @param capacity 初始化容量
 * @param debugMode 是否开启 debug 模式
 * @since 0.0.3
 * @author binbin.hou
 */
public MyProgressiveReHashMap(int capacity, boolean debugMode) {
    this.capacity = capacity;
    // 初始化最大为容量的个数，如果 hash 的非常完美的话。
    this.table = new ArrayList<>(capacity);
    // 初始化为空列表
    for(int i = 0; i < capacity; i++) {
        this.table.add(i, new ArrayList<Entry<K, V>>());
    }
    this.debugMode = debugMode;
    this.rehashIndex = -1;
    this.rehashCapacity = -1;
    this.rehashTable = null;
}
```

## put() 方法

这个方法相对难度比较大：

put() 的过程可以见方法的注释。

需要考虑是否为 rehash 阶段，还需要考虑是否为更新。

```java
/**
 * put 一个值
 *
 * （1）如果不处于 rehash 阶段
 *
 * 1.1 判断是否为 table 更新，如果是，则进行更新
 * 1.2 如果不是更新，则进行插入
 *
 * 插入的时候可能触发 rehash
 *
 * （2）如果处于 rehash 阶段
 *
 * 2.0 执行一次渐进式 rehash 的动作
 *
 * 2.1 判断是否为更新，需要遍历 table 和 rehashTable
 * 如果是，执行更新
 *
 * 2.2 如果不是，则执行插入
 * 插入到 rehashTable 中
 *
 * @param key 键
 * @param value 值
 * @return 值
 * @author binbin.hou
 */
@Override
public V put(K key, V value) {
    boolean isInRehash = isInReHash();
    if(!isInRehash) {
        //1. 是否为更新
        Pair<Boolean, V> pair = updateTableInfo(key, value, this.table, this.capacity);
        if(pair.getValueOne()) {
            V oldVal = pair.getValueTwo();
            if(debugMode) {
                log.debug("不处于渐进式 rehash，此次为更新操作。key: {}, value: {}", key, value);
                printTable(this.table);
            }
            return oldVal;
        } else {
            // 插入
            return this.createNewEntry(key, value);
        }
    } else {
        //2.0 执行一个附加操作，进行渐进式 rehash 处理
        if(debugMode) {
            log.debug("当前处于渐进式 rehash 阶段，额外执行一次渐进式 rehash 的动作");
        }
        rehashToNew();
        //2.1 是否为 table 更新
        Pair<Boolean, V> pair = updateTableInfo(key, value, this.table, this.capacity);
        if(pair.getValueOne()) {
            V oldVal = pair.getValueTwo();
            if(debugMode) {
                log.debug("此次为更新 table 操作。key: {}, value: {}", key, value);
                printTable(this.table);
            }
            return oldVal;
        }
        //2.2 是否为 rehashTable 更新
        Pair<Boolean, V> pair2 = updateTableInfo(key, value, this.rehashTable, this.rehashCapacity);
        if(pair2.getValueOne()) {
            V oldVal = pair2.getValueTwo();
            if(debugMode) {
                log.debug("此次为更新 rehashTable 操作。key: {}, value: {}", key, value);
                printTable(this.table);
            }
            return oldVal;
        }
        //2.3 插入
        return this.createNewEntry(key, value);
    }
}
```


### 是否为 rehash 阶段

这个实现比较简单，就是判断 rehashIndex 是否为 -1：

```java
/**
 * 是否处于 rehash 阶段
 * @return 是否
 * @since 0.0.3
 * @author binbin.hou
 */
private boolean isInReHash() {
    return rehashIndex != -1;
}
```

### 更新列表信息

这里为了复用，对方法进行了抽象。可以同时使用到 table 和 rehashTable 中。

```java
/**
 * 是否为更新信息
 * @param key key
 * @param value value
 * @param table table 信息
 * @param tableCapacity table 的容量（使用 size 也可以，因为都默认初始化了。）
 * @return 更新结果
 * @since 0.0.3
 * @author binbin.hou
 */
private Pair<Boolean, V> updateTableInfo(K key, V value, final List<List<Entry<K,V>>> table,
                             final int tableCapacity) {
    // 计算 index 值
    int hash = HashUtil.hash(key);
    int index = HashUtil.indexFor(hash, tableCapacity);
    // 判断是否为替换
    List<Entry<K,V>> entryList = new ArrayList<>();
    if(index < table.size()) {
        entryList = table.get(index);
    }
    // 遍历
    for(Entry<K,V> entry : entryList) {
        // 二者的 key 都为 null，或者二者的 key equals()
        final K entryKey = entry.getKey();
        if(ObjectUtil.isNull(key, entryKey)
                || key.equals(entryKey)) {
            final V oldValue = entry.getValue();
            // 更新新的 value
            entry.setValue(value);
            return Pair.of(true, oldValue);
        }
    }
    return Pair.of(false, null);
}
```

这个和以前基本是类似的。

返回结果时，为了同时保存是否为更新，以及更新的 value 值。所以使用了 Pair 工具类。

### 插入新的元素

插入方法也比较麻烦，需要区分是否处于渐进式 rehash 阶段。还要考虑是否需要扩容。

```java
/**
 * 创建一个新的明细
 *
 * （1）如果处于渐进式 rehash 中，则设置到 rehashTable 中
 * （2）如果不是，则判断是否需要扩容
 *
 * 2.1 如果扩容，则直接放到 rehashTable 中。
 * 因为我们每次扩容内存翻倍，一次只处理一个 index 的信息，所以不会直接 rehash 结束，直接放到新的 rehashTable 中即可
 * 2.2 如果不扩容，则放入 table 中
 *
 * @param key key
 * @param value value
 * @since 0.0.3
 * @author binbin.hou
 */
private V createNewEntry(final K key,
                            final V value) {
    Entry<K,V> entry = new DefaultMapEntry<>(key, value);
    // 重新计算 tableIndex
    int hash = HashUtil.hash(key);
    //是否处于 rehash 中？
    if(isInReHash()) {
        int index = HashUtil.indexFor(hash, this.rehashCapacity);
        List<Entry<K,V>> list = this.rehashTable.get(index);
        list.add(entry);
        if(debugMode) {
            log.debug("目前处于 rehash 中，元素直接插入到 rehashTable 中。");
            printTable(this.rehashTable);
        }
    }
    // 是否需要扩容 && 不处于渐进式 rehash
    // rehash 一定是扩容 rehashTable
    // 如果发生了 rehash，元素是直接放到 rehashTable 中的
    if(isNeedExpand()) {
        rehash();
        // 放入到 rehashTable 中
        int index = HashUtil.indexFor(hash, this.rehashCapacity);
        List<Entry<K,V>> list = this.rehashTable.get(index);
        list.add(entry);
        if(debugMode) {
            log.debug("目前处于 rehash 中，元素直接插入到 rehashTable 中。");
            printTable(this.rehashTable);
        }
    } else {
        int index = HashUtil.indexFor(hash, this.capacity);
        List<Entry<K,V>> list = this.table.get(index);
        list.add(entry);
        if(debugMode) {
            log.debug("目前不处于 rehash 中，元素直接插入到 table 中。");
            printTable(this.table);
        }
    }
    this.size++;
    return value;
}
```

是否需要扩容的方法也比较简单：

```java
/**
 * 是否需要扩容
 *
 * 比例满足，且不处于渐进式 rehash 中
 * @return 是否
 * @since 0.0.3
 * @author binbin.hou
 */
private boolean isNeedExpand() {
    // 验证比例
    double rate = size*1.0 / capacity*1.0;
    return rate >= factor && !isInReHash();
}
```

不过我们这次添加了一个不要处于渐进式 rehash 过程中。

其中 rehash 的实现也发生了很大的变化，具体实现如下：

```java
/**
 * 直接 rehash 的流程
 *
 * （1）如果处于 rehash 中，直接返回
 * （2）初始化 rehashTable，并且更新 rehashIndex=0;
 * （3）获取 table[0]，rehash 到 rehashTable 中
 * （4）设置 table[0] = new ArrayList();
 *
 * @since 0.0.3
 * @author binbin.hou
 */
private void rehash() {
    if(isInReHash()) {
        if(debugMode) {
            log.debug("当前处于渐进式 rehash 阶段，不重复进行 rehash!");
        }
        return;
    }
    // 初始化 rehashTable
    this.rehashIndex = -1;
    this.rehashCapacity = 2*capacity;
    this.rehashTable = new ArrayList<>(this.rehashCapacity);
    for(int i = 0; i < rehashCapacity; i++) {
        rehashTable.add(i, new ArrayList<Entry<K, V>>());
    }

    // 遍历元素第一个元素，其他的进行渐进式更新。
    rehashToNew();
}
```

渐进式更新的方法，可以在 get/put/remove 等操作时，执行附加操作时使用。

所以单独抽成了一个方法，实现如下：

```java
/**
 * 将信息从旧的 table 迁移到新的 table 中
 *
 * （1）table[rehashIndex] 重新 rehash 到 rehashTable 中
 * （2）设置 table[rehashIndex] = new ArrayList();
 * （3）判断是否完成渐进式 rehash
 */
private void rehashToNew() {
    rehashIndex++;

    List<Entry<K, V>> list = table.get(rehashIndex);
    for(Entry<K, V> entry : list) {
        int hash = HashUtil.hash(entry);
        int index = HashUtil.indexFor(hash, rehashCapacity);
        //  添加元素
        // 获取列表，避免数组越界
        List<Entry<K,V>> newList = rehashTable.get(index);
        // 添加元素到列表
        // 元素不存在重复，所以不需要考虑更新
        newList.add(entry);
        rehashTable.set(index, newList);
    }

    // 清空 index 处的信息
    table.set(rehashIndex, new ArrayList<Entry<K, V>>());

    // 判断大小是否完成 rehash
    // 验证是否已经完成
    if(rehashIndex == (table.size()-1)) {
        this.capacity = this.rehashCapacity;
        this.table = this.rehashTable;
        this.rehashIndex = -1;
        this.rehashCapacity = -1;
        this.rehashTable = null;
        if(debugMode) {
            log.debug("渐进式 rehash 已经完成。");
            printTable(this.table);
        }
    } else {
        if(debugMode) {
            log.debug("渐进式 rehash 处理中, 目前 index：{} 已完成", rehashIndex);
            printAllTable();
        }
    }
}
```

## get() 操作

渐进式 rehash 将动作分散到每一个操作中，我们对 get 方法进行重写，当做一个例子。其他的方法如果实现也是类似的。

```java
/**
 * 查询方法
 * （1）如果处于渐进式 rehash 状态，额外执行一次 rehashToNew()
 * （2）判断 table 中是否存在元素
 * （3）判断 rehashTable 中是否存在元素
 * @param key key
 * @return 结果
 */
@Override
public V get(Object key) {
    if(isInReHash()) {
        if(debugMode) {
            log.debug("当前处于渐进式 rehash 状态，额外执行一次操作");
            rehashToNew();
        }
    }

    //1. 判断 table 中是否存在
    V result = getValue(key, this.table);
    if(result != null) {
        return result;
    }

    //2. 是否处于渐进式 rehash
    if(isInReHash()) {
        return getValue(key, this.rehashTable);
    }
    return null;
}
```

## 测试

我们历经千辛万苦，终于实现了一个简单版本的渐进式 hash map。

下面来测试一下功能是否符合我们的预期。

### put 操作

```java
Map<String, String> map = new MyProgressiveReHashMap<>(2, true);
map.put("1", "1");
map.put("1", "2");
```

日志：

```
[DEBUG] [2020-10-11 21:30:15.072] [main] [c.g.h.d.s.c.u.m.MyProgressiveReHashMap.createNewEntry] - 目前不处于 rehash 中，元素直接插入到 table 中。
{1: 1} 
[DEBUG] [2020-10-11 21:30:15.076] [main] [c.g.h.d.s.c.u.m.MyProgressiveReHashMap.put] - 不处于渐进式 rehash，此次为更新操作。key: 1, value: 2
{1: 2} 
```

第一次是插入，第二次是更新。

这里都没有触发扩容，下面我们看一下触发扩容的情况。

### 扩容测试

```java
Map<String, String> map = new MyProgressiveReHashMap<>(2, true);
map.put("1", "1");
map.put("2", "2");
map.put("3", "3");

Assert.assertEquals("1", map.get("1"));
Assert.assertEquals("2", map.get("2"));
Assert.assertEquals("3", map.get("3"));
```

日志如下：

```
[DEBUG] [2020-10-11 21:31:12.559] [main] [c.g.h.d.s.c.u.m.MyProgressiveReHashMap.createNewEntry] - 目前不处于 rehash 中，元素直接插入到 table 中。
{1: 1} 
[DEBUG] [2020-10-11 21:31:12.560] [main] [c.g.h.d.s.c.u.m.MyProgressiveReHashMap.createNewEntry] - 目前不处于 rehash 中，元素直接插入到 table 中。
{2: 2} 
{1: 1} 
[DEBUG] [2020-10-11 21:31:12.563] [main] [c.g.h.d.s.c.u.m.MyProgressiveReHashMap.rehashToNew] - 渐进式 rehash 处理中, 目前 index：0 已完成
原始 table 信息: 
{1: 1} 
新的 table 信息: 
{2: 2} 
[DEBUG] [2020-10-11 21:31:12.563] [main] [c.g.h.d.s.c.u.m.MyProgressiveReHashMap.createNewEntry] - 目前处于 rehash 中，元素直接插入到 rehashTable 中。
{2: 2} 
{3: 3} 
[DEBUG] [2020-10-11 21:31:12.564] [main] [c.g.h.d.s.c.u.m.MyProgressiveReHashMap.get] - 当前处于渐进式 rehash 状态，额外执行一次操作
[DEBUG] [2020-10-11 21:31:12.564] [main] [c.g.h.d.s.c.u.m.MyProgressiveReHashMap.rehashToNew] - 渐进式 rehash 已经完成。
{2: 2} 
{1: 1} 
{3: 3} 
```

当放入元素【3】的时候，已经触发了 rehash。

（1）第一次渐进式 rehash 将 table[0] 的元素 rehash 到了新的节点。

（2）插入的元素直接插入到 rehashTable 中

（3）get 操作时，额外触发一次 rehash，然后所有的 rehash 已经完成。

ps: 写完的那一刻，感觉自己又变强了！

![输入图片说明](https://images.gitee.com/uploads/images/2020/1012/211350_e76182e1_508704.png)

# 小结

本节我们自己动手实现了一个简易版本的渐进式 rehash HashMap。

为了实现这个功能，我们做了很多准备工作，HashMap 的源码学习，redis 渐进式 rehash 原理，HashMap 的手写实现。

跨过这几个难关之后，终于实现了一个自己的 rehash HashMap。

本实现是我个人完全独立创造，只参考了 redis 的实现流程，如有雷同，肯定是抄【老马啸西风】的。

本节的内容较长，书写也花费了大量的时间，一切都是值得的。希望你喜欢。

可以先收藏转发一波，然后细细品味。后续将带给大家更多高性能相关的原理和手写框架，感兴趣的伙伴可以关注一波，即使获取最新动态~

> 开源地址：[https://github.com/houbb/cache](https://github.com/houbb/cache)

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

* any list
{:toc}
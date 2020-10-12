---
layout: post
title:  Cache Travel-09-从零开始手写redis（15）实现自己的 HashMap
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, redis, lru, sh]
published: true
---

# 回顾

我们在 [从零手写缓存框架（14）redis渐进式rehash详解](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-13-redis-rehash) 中已经介绍了 redis 的渐进式 rehash 的原理。

在 [从零开始手写缓存框架 redis（13）HashMap 源码原理详解](https://www.jianshu.com/p/fa6a139500bd) 中详细讲解了 HashMap 的源码和设计思想。

本节就让我们一起来实现一个 HashMap，为后续实现渐进式 rehash 打下基础。

本文思维导图如下：

![手写HashMap](https://images.gitee.com/uploads/images/2020/1012/210822_ccff8c35_508704.png)

# 简易版本 HashMap 的实现

我们先循序渐进的实现，第一步首先实现一个简易版本的 HashMap。

## 简单的准则

我们主要学习的是 rehash 的过程，所以实现尽可能的简单，主要是实现 rehash 的相关操作。

为了实现方便，我们继承 jdk 的 AbstractMap，使用 ArrayList+LinkedList 的方式实现。

![hashmap](https://images.gitee.com/uploads/images/2020/1012/213238_799276e7_508704.jpeg)

## 核心代码

核心代码主要选自我自己去年写的一段代码，可能会有部分调整，但是整体思路不变。

### 类的定义

注释可以参考，这次我们会做一些调整，主要是针对 rehash 的条件部分。

我们的类继承自 `AbstractMap<K,V>`，可以让我们专注于实现 put() 和 remove() 这两个方法。

```java
/**
 * 自己实现的 hash map
 *
 * （1）所有的 hash 值相同的元素，放在同一个桶中
 * （2）新增时
 * 2.1 hash 值相同，且 equals() 的，则认为相同，使用替换。
 * 2.2 不同的，则使用链表，新增。
 * 新增时，进行判断，如果 size() 超出阈值，且 hash 的位置有元素，则进行 rehash()
 *
 * 这样是为了避免 hash 的桶数太少，导致的查找性能下降。
 * 个人觉得，现在觉得这种方式很浪费。
 * 比如：容量=8 当 size=6 的时候可能就要进行 rehash
 * （size gte 阈值，且 hash 的位置，已经存在元素。）
 * 某种角度而言，这是没有必要的。
 * 因为即使在同一个桶上的数据出现重复，如果桶中链表的数量小于8，其实遍历性能并不差。
 *
 * 优化思路：可以考虑将 rehash 的条件调整为，当前 hash 的桶位置有元素，且当前桶的链表数量已经达到了8。
 *
 * rehash 的优化思路：
 * 可以参考 redis，进行渐进式 rehash。
 *
 * （3）hash 的简化
 * jdk 实现中，对于 null 值做了特殊处理。其实感觉没必要，直接 null 的 hash 为0，比较的时候认为相等即可。
 * @author binbin.hou
 * @since 0.0.1
 * @param <K> key 泛型
 * @param <V> value 泛型
 * @see HashMap
 * @author binbin.hou
 */
public class MyHashMap<K,V> extends AbstractMap<K,V> implements Map<K,V> {
}
```

### 私有属性

```java
private static final Log log = LogFactory.getLog(MyHashMap.class);

/**
 * 容量
 * 默认为 8
 */
private int capacity;

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
 * 是否开启 debug 模式
 * @since 0.0.3
 */
private boolean debugMode = false;
```


我们定义了 capacity、size 保存容量和元素的大小。

factor 主要用于判断何时进行 rehash。

table 是一个 arrayList + linkedList 的数据结构。

log+debugMode 主要是为了便于读者理解，添加了 rehash 等日志信息。

### 构造器

```java
public MyHashMap() {
    this(8);
}
/**
 * 初始化 hash map
 * @param capacity 初始化容量
 */
public MyHashMap(int capacity) {
    this(capacity, false);
}
/**
 * 初始化 hash map
 * @param capacity 初始化容量
 * @param debugMode 是否开启 debug 模式
 * @since 0.0.3
 * @author binbin.hou
 */
public MyHashMap(int capacity, boolean debugMode) {
    this.capacity = capacity;
    // 初始化最大为容量的个数，如果 hash 的非常完美的话。
    this.table = new ArrayList<>(capacity);
    // 初始化为空列表
    for(int i = 0; i < capacity; i++) {
        this.table.add(i, new ArrayList<Entry<K, V>>());
    }
    this.debugMode = debugMode;
}
```

这里注意下，我们需要对 arrayList 进行初始化（底层是一个 array），不然后面设置 index 会导致越界问题。

hash 的算法不是本节重点，后续有时间讲一讲完美哈希，一致性哈希等哈希算法。

### put() 方法

put 方法的实现流程如下：

（1）根据 key 计算 hash 值，根据容器容量，计算对应的下标。

（2）判断是否为替换操作，如果 key 已经存在，则认为是一个替换操作。

替换相对简单，不涉及到 size 的变更，也不涉及到 rehash。

（3）新增元素

需要判断是否需要扩容，如果要，则执行扩容，最后增加 size。

```java
/**
 * 存储一个值
 * @param key 键
 * @param value 值
 * @return 值
 * @author binbin.hou
 */
@Override
public V put(K key, V value) {
    // 计算 index 值
    int hash = HashUtil.hash(key);
    int index = HashUtil.indexFor(hash, this.capacity);

    // 判断是否为替换
    List<Entry<K,V>> entryList = new ArrayList<>();
    if(index < this.table.size()) {
        entryList = this.table.get(index);
    }

    // 遍历
    for(Entry<K,V> entry : entryList) {
        // 二者的 key 都为 null，或者二者的 key equals()
        final K entryKey = entry.getKey();
        if(ObjectUtil.isNull(key, entryKey)
            || key.equals(entryKey)) {
            // 更新新的 entry
            entry.setValue(value);
            if(debugMode) {
                log.debug("put 为替换元素，table 信息为：");
                printTable();
            }
            return value;
        }
    }

    // 新增：
    this.createNewEntry(hash, index, key, value);
    this.size++;
    if(debugMode) {
        log.debug("put 为新增元素，table 信息为：");
        printTable();
    }
    return value;
}
```


### printTable() 实现

这是一个便于用户理解的辅助类，我们会将 table 信息输出出来，实现如下：

```java
/**
 * 打印 table 信息
 * @since 0.0.3
 * @author binbin.hou
 */
private void printTable() {
    for(List<Entry<K, V>> list : this.table) {
        for(Entry<K,V> entry : list) {
            System.out.print(entry+ " ") ;
        }
        System.out.println();
    }
}
```

为了便于日志打印，我们实现的 `DefaultMapEntry` 的 toString() 方法重写如下：

```java
@Override
public String toString() {
    return "{" +key +
            ": " + value +
            '}';
}
```

### createNewEntry 实现

```java
/**
 * 创建一个新的明细
 * （1）获取当前 index 对应的链表
 * （2）判断是否需要 rehash
 * 如果当前链表存在，且大小超过阈值8，则进行 rehash。
 * （3）rehash 之后，或者不需要 rehash
 *
 * 都将最后的 index，然后将新元素放在对应的链表中。
 * @param hash hash 值
 * @param tableIndex 下标
 * @param key key
 * @param value value
 * @author binbin.hou
 */
private void createNewEntry(int hash,
                            int tableIndex,
                            final K key,
                            final V value) {
    Entry<K,V> entry = new DefaultMapEntry<>(key, value);
    // 是否需要扩容
    if(isNeedExpand()) {
        this.capacity = this.capacity * 2;
        rehash(this.capacity);
        // 重新计算 tableIndex
        tableIndex = HashUtil.indexFor(hash, this.capacity);
    }
    //  添加元素
    List<Entry<K,V>> list = new ArrayList<>();
    if(tableIndex < this.table.size()) {
        list = table.get(tableIndex);
    }
    list.add(entry);
    if(debugMode) {
        log.debug("Key: {} 对应的 tableIndex: {}", key, tableIndex);
    }
    this.table.set(tableIndex, list);
}
```

穿件明细会判断是否需要扩容。

### 是否需要扩容

实际上这个方法比较简单，直接计算一下比例即可：

```java
/**
 * 是否需要扩容
 * @return 是否
 * @since 0.0.3
 * @author binbin.hou
 */
private boolean isNeedExpand() {
    // 验证比例
    double rate = size*1.0 / capacity*1.0;
    return rate >= factor;
}
```

### rehash 实现

终于到我们今天的重头戏了。

```java
/**
 * 直接 rehash 的流程
 *
 * 当然这个 rehash 的方法可以抽象，和 put 复用，暂时不做处理。
 * @param newCapacity 新的 table 的容量
 * @since 0.0.3
 * @author binbin.hou
 */
private void rehash(final int newCapacity) {
    List<List<Entry<K, V>>> newTable = new ArrayList<>(newCapacity);
    for(int i = 0; i < newCapacity; i++) {
        newTable.add(i, new ArrayList<Entry<K, V>>());
    }

    // 遍历元素，全部放置到新的 table 中
    for(List<Entry<K, V>> list : table) {
        for(Entry<K, V> entry : list) {
            int hash = HashUtil.hash(entry);
            int index = HashUtil.indexFor(hash, newCapacity);
            //  添加元素
            // 获取列表，避免数组越界
            List<Entry<K,V>> newList = new ArrayList<>();
            if(index < newTable.size()) {
                newList = newTable.get(index);
            }
            // 添加元素到列表
            // 元素不存在重复，所以不需要考虑更新
            newList.add(entry);
            newTable.set(index, newList);
        }
    }
    // 将新的 table 赋值到原来的 table 上
    this.table = newTable;
    if(debugMode) {
        log.debug("rehash: {} 完成，table 内容为：", newCapacity);
        printTable();
    }
}
```

rehash 的流程如下：

（1）创建一个新的 table，大小为原来的两倍，并且初始化。

（2）遍历原来的元素，重新 hash 计算下标之后，放到新的 table 中

（3）将 table 赋值为新的 table 信息。

最后为了便于读者理解，我们做了 table 信息的输出。

## 测试

### put() 的测试

```java
MyHashMap<String, String> map = new MyHashMap<>(2, true);
map.put("1", "1");
map.put("1", "2");
```

日志如下：

```
[DEBUG] [2020-10-11 18:01:27.466] [main] [c.g.h.d.s.c.u.m.MyHashMap.createNewEntry] - Key: 1 对应的 tableIndex: 1
[DEBUG] [2020-10-11 18:01:27.466] [main] [c.g.h.d.s.c.u.m.MyHashMap.put] - put 为新增元素，table 信息为：

{1: 1} 
[DEBUG] [2020-10-11 18:01:27.468] [main] [c.g.h.d.s.c.u.m.MyHashMap.put] - put 为替换元素，table 信息为：

{1: 2} 
```

第一次 put 是新增，第二次为替换。

### rehash 测试

```java
MyHashMap<String, String> map = new MyHashMap<>(2, true);
map.put("1", "1");
map.put("2", "2");
map.put("3", "2");
```

日志如下：

```
[DEBUG] [2020-10-11 18:03:46.797] [main] [c.g.h.d.s.c.u.m.MyHashMap.createNewEntry] - Key: 1 对应的 tableIndex: 1
[DEBUG] [2020-10-11 18:03:46.798] [main] [c.g.h.d.s.c.u.m.MyHashMap.put] - put 为新增元素，table 信息为：

{1: 1} 
[DEBUG] [2020-10-11 18:03:46.798] [main] [c.g.h.d.s.c.u.m.MyHashMap.createNewEntry] - Key: 2 对应的 tableIndex: 0
[DEBUG] [2020-10-11 18:03:46.799] [main] [c.g.h.d.s.c.u.m.MyHashMap.put] - put 为新增元素，table 信息为：
{2: 2} 
{1: 1} 
[DEBUG] [2020-10-11 18:03:46.800] [main] [c.g.h.d.s.c.u.m.MyHashMap.rehash] - rehash: 4 完成，table 内容为：

{1: 1} 
{2: 2} 

[DEBUG] [2020-10-11 18:03:46.801] [main] [c.g.h.d.s.c.u.m.MyHashMap.createNewEntry] - Key: 3 对应的 tableIndex: 3
[DEBUG] [2020-10-11 18:03:46.801] [main] [c.g.h.d.s.c.u.m.MyHashMap.put] - put 为新增元素，table 信息为：

{1: 1} 
{2: 2} 
{3: 2} 
```

比较符合我们的预期。

# 缩容的实现

## 实现思路

实现了扩容之后，实际上缩容的实现就变得非常简单。

二者是非常类似的，只是触发的时机和条件做了一点调整。

## java 实现

### 属性定义

我们定义一下常量，便于后面判断使用

```java
/**
 * 缩容
 *
 * @since 0.0.4
 */
private final double reduceFactor = 0.5;

/**
 * 最小大小
 *
 * @since 0.0.4
 */
private static final int MIN_CAPACITY = 2;
```

我们指定缩容的 factor=0.5，最小的容器大小为2。毕竟再小就没有意义了。

### 是否满足缩容条件

```java
/**
 * 是否需要缩容
 * （1）元素比例为一半
 * （2）当前容量大于2
 *
 * @return 是否
 * @since 0.0.4
 */
private boolean isNeedReduce() {
    // 验证比例
    double rate = size * 1.0 / capacity * 1.0;
    return rate <= reduceFactor && (this.capacity > MIN_CAPACITY);
}
```

### remove 的实现

删除的逻辑相对比较简单，我们删除之后判断是否需要缩容即可。

rehash 的方法和扩容时一样的，容器大小变为原来的而一半。

我了便于读者理解，我们输出了对应的 debug 日志信息。

```java
/**
 * 删除一个元素
 * （1）元素不存在，直接返回 null
 * （2）元素存在，移除元素，判断是否需要缩容
 *
 * @param key 元素信息
 * @return 结果
 * @since 0.0.3
 */
@Override
public V remove(Object key) {
    // 计算 index 值
    int hash = HashUtil.hash(key);
    int index = HashUtil.indexFor(hash, this.capacity);
    // 遍历
    List<Entry<K, V>> entryList = this.table.get(index);

    for (Entry<K, V> entry : entryList) {
        // 二者的 key 都为 null，或者二者的 key equals()
        final K entryKey = entry.getKey();
        if (ObjectUtil.isNull(key, entryKey)
                || key.equals(entryKey)) {
            if (isNeedReduce()) {
                if (debugMode) {
                    log.debug("触发缩容操作");
                }
                this.capacity = this.capacity / 2;
                rehash(this.capacity);
            }

            if (debugMode) {
                log.debug("移除元素，table 信息为：");
                printTable();
            }
        }
    }
    return null;
}
```

## 验证

### 测试代码

```java
MyHashMap<String, String> map = new MyHashMap<>(2, true);
map.put("1", "1");
map.put("2", "2");
map.put("3", "3");

map.remove("3");
map.remove("2");
map.remove("1");
```

### 日志

```
[DEBUG] [2020-10-12 20:57:53.871] [main] [c.g.h.d.s.c.u.m.MyHashMap.createNewEntry] - Key: 1 对应的 tableIndex: 1
[DEBUG] [2020-10-12 20:57:53.871] [main] [c.g.h.d.s.c.u.m.MyHashMap.put] - put 为新增元素，table 信息为：
{1: 1} 
[DEBUG] [2020-10-12 20:57:53.872] [main] [c.g.h.d.s.c.u.m.MyHashMap.createNewEntry] - Key: 2 对应的 tableIndex: 0
[DEBUG] [2020-10-12 20:57:53.872] [main] [c.g.h.d.s.c.u.m.MyHashMap.put] - put 为新增元素，table 信息为：
{2: 2} 
{1: 1} 
[DEBUG] [2020-10-12 20:57:53.874] [main] [c.g.h.d.s.c.u.m.MyHashMap.rehash] - rehash: 4 完成，table 内容为：
{1: 1} 
{2: 2} 
[DEBUG] [2020-10-12 20:57:53.874] [main] [c.g.h.d.s.c.u.m.MyHashMap.createNewEntry] - Key: 3 对应的 tableIndex: 3
[DEBUG] [2020-10-12 20:57:53.875] [main] [c.g.h.d.s.c.u.m.MyHashMap.put] - put 为新增元素，table 信息为：
{1: 1} 
{2: 2} 
{3: 3} 
[DEBUG] [2020-10-12 20:57:53.875] [main] [c.g.h.d.s.c.u.m.MyHashMap.rehash] - rehash: 2 完成，table 内容为：
{2: 2} 
{1: 1} 

[DEBUG] [2020-10-12 20:57:53.876] [main] [c.g.h.d.s.c.u.m.MyHashMap.remove] - 缩容完成
[DEBUG] [2020-10-12 20:57:53.876] [main] [c.g.h.d.s.c.u.m.MyHashMap.remove] - 删除后的 table 信息
{2: 2} 
{1: 1} 
[DEBUG] [2020-10-12 20:57:53.877] [main] [c.g.h.d.s.c.u.m.MyHashMap.remove] - 删除后的 table 信息
{1: 1} 
[DEBUG] [2020-10-12 20:57:53.877] [main] [c.g.h.d.s.c.u.m.MyHashMap.remove] - 删除后的 table 信息
```

可见当元素为2个的时候，触发了一次缩容。

后续在变小就不会再触发了，因为我们设置的最小容量为2。

# 小结

本节我们自己动手实现了一个简易版本 HashMap。

麻雀虽小五脏俱全，我们已经搞清楚了扩容、缩容的实现机制，为我们后面实现渐进式 rehash 做好铺垫。

相对而言，渐进式 rehash 要比这个麻烦的多。

本来想全部放在一起的，考虑到篇幅问题，拆分为两节，避免读者朋友读的太累。

本节的内容较长，书写也花费了大量的时间，一切都是值得的。希望你喜欢。

下一节我们将共同来实现一个渐进式 rehash 的 HashMap，感兴趣的伙伴可以关注一波，即使获取最新动态~

> 开源地址：[https://github.com/houbb/cache](https://github.com/houbb/cache)

觉得本文对你有帮助的话，欢迎点赞评论收藏关注一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

* any list
{:toc}
---
layout: post
title: JDK ConcurrentHashMap 源码解析
date:  2018-09-12 11:44:23 +0800
categories: [Java]
tags: [source-code, hash, cache, data-struct, java, sf]
published: true
---

# HashMap 的线程安全性

HashMap 是线程不安全的。

![HashMap 的线程安全性](https://p1.pstatp.com/origin/pgc-image/36355f204b6f465fafc86874775145ca)

为了使用线程安全的数据结构，多线程条件下，可使用 `Collections.synchronizedMap` 方法构造出一个同步Map，或者直接使用线程安全的 `ConcurrentHashMap`。

# Java 7基于分段锁的ConcurrentHashMap

注：本章的代码均基于JDK 1.7.0_67

## 数据结构

Java 7中的ConcurrentHashMap的底层数据结构仍然是数组和链表。

与HashMap不同的是，ConcurrentHashMap最外层不是一个大的数组，而是一个Segment的数组。

每个Segment包含一个与HashMap数据结构差不多的链表数组。整体数据结构如下图所示。

![jdk7-concurrent-hashmap](http://www.jasongj.com/img/java/concurrenthashmap/concurrenthashmap_java7.png)

## 寻址方式

在读写某个Key时，先取该Key的哈希值。

并将哈希值的高N位对Segment个数取模从而得到该Key应该属于哪个Segment，接着如同操作HashMap一样操作这个Segment。

为了保证不同的值均匀分布到不同的Segment，需要通过如下方法计算哈希值。

```java
private int hash(Object k) {
  int h = hashSeed;
  if ((0 != h) && (k instanceof String)) {
    return sun.misc.Hashing.stringHash32((String) k);
  }
  h ^= k.hashCode();
  h += (h <<  15) ^ 0xffffcd7d;
  h ^= (h >>> 10);
  h += (h <<   3);
  h ^= (h >>>  6);
  h += (h <<   2) + (h << 14);
  return h ^ (h >>> 16);
}
```

同样为了提高取模运算效率，通过如下计算，ssize即为大于concurrencyLevel的最小的2的N次方，同时segmentMask为2^N-1。

这一点跟上文中计算数组长度的方法一致。

对于某一个Key的哈希值，只需要向右移segmentShift位以取高sshift位，再与segmentMask取与操作即可得到它在Segment数组上的索引。

```java
int sshift = 0;
int ssize = 1;
while (ssize < concurrencyLevel) {
  ++sshift;
  ssize <<= 1;
}
this.segmentShift = 32 - sshift;
this.segmentMask = ssize - 1;
Segment<K,V>[] ss = (Segment<K,V>[])new Segment[ssize];
```

## 同步方式

Segment继承自ReentrantLock，所以我们可以很方便的对每一个Segment上锁。

对于读操作，获取Key所在的Segment时，需要保证可见性(请参考如何保证多线程条件下的可见性)。

具体实现上可以使用volatile关键字，也可使用锁。但使用锁开销太大，而使用volatile时每次写操作都会让所有CPU内缓存无效，也有一定开销。

ConcurrentHashMap使用如下方法保证可见性，取得最新的Segment。

```java
Segment<K,V> s = (Segment<K,V>)UNSAFE.getObjectVolatile(segments, u)
```

获取Segment中的HashEntry时也使用了类似方法

```java
HashEntry<K,V> e = (HashEntry<K,V>) UNSAFE.getObjectVolatile
  (tab, ((long)(((tab.length - 1) & h)) << TSHIFT) + TBASE)
```

对于写操作，并不要求同时获取所有Segment的锁，因为那样相当于锁住了整个Map。

它会先获取该Key-Value对所在的Segment的锁，获取成功后就可以像操作一个普通的HashMap一样操作该Segment，并保证该Segment的安全性。

同时由于其它Segment的锁并未被获取，因此理论上可支持concurrencyLevel（等于Segment的个数）个线程安全的并发读写。

获取锁时，并不直接使用lock来获取，因为该方法获取锁失败时会挂起。

事实上，它使用了自旋锁，如果tryLock获取锁失败，说明锁被其它线程占用，此时通过循环再次以tryLock的方式申请锁。

如果在循环过程中该Key所对应的链表头被修改，则重置retry次数。如果retry次数超过一定值，则使用lock方法申请锁。

这里使用自旋锁是因为自旋锁的效率比较高，但是它消耗CPU资源比较多，因此在自旋次数超过阈值时切换为互斥锁。

## size操作

put、remove和get操作只需要关心一个Segment，而size操作需要遍历所有的Segment才能算出整个Map的大小。

一个简单的方案是，先锁住所有Segment，计算完后再解锁。

但这样做，在做size操作时，不仅无法对Map进行写操作，同时也无法进行读操作，不利于对Map的并行操作。

为更好支持并发操作，ConcurrentHashMap会在不上锁的前提逐个Segment计算3次size，如果某相邻两次计算获取的所有Segment的更新次数（每个Segment都与HashMap一样通过modCount跟踪自己的修改次数，Segment每修改一次其modCount加一）相等，说明这两次计算过程中无更新操作，则这两次计算出的总size相等，可直接作为最终结果返回。

如果这三次计算过程中Map有更新，则对所有Segment加锁重新计算Size。

该计算方法代码如下

```java
public int size() {
  final Segment<K,V>[] segments = this.segments;
  int size;
  boolean overflow; // true if size overflows 32 bits
  long sum;         // sum of modCounts
  long last = 0L;   // previous sum
  int retries = -1; // first iteration isn't retry
  try {
    for (;;) {
      if (retries++ == RETRIES_BEFORE_LOCK) {
        for (int j = 0; j < segments.length; ++j)
          ensureSegment(j).lock(); // force creation
      }
      sum = 0L;
      size = 0;
      overflow = false;
      for (int j = 0; j < segments.length; ++j) {
        Segment<K,V> seg = segmentAt(segments, j);
        if (seg != null) {
          sum += seg.modCount;
          int c = seg.count;
          if (c < 0 || (size += c) < 0)
            overflow = true;
        }
      }
      if (sum == last)
        break;
      last = sum;
    }
  } finally {
    if (retries > RETRIES_BEFORE_LOCK) {
      for (int j = 0; j < segments.length; ++j)
        segmentAt(segments, j).unlock();
    }
  }
  return overflow ? Integer.MAX_VALUE : size;
}
```

## 不同之处

ConcurrentHashMap与HashMap相比，有以下不同点

1. ConcurrentHashMap线程安全，而HashMap非线程安全

2. HashMap允许Key和Value为null，而ConcurrentHashMap不允许

3. HashMap不允许通过Iterator遍历的同时通过HashMap修改，而ConcurrentHashMap允许该行为，并且该更新对后续的遍历可见

# Java 8 基于 CAS 的 ConcurrentHashMap

注：本章的代码均基于JDK 1.8.0_91

## 数据结构

Java 7为实现并行访问，引入了Segment这一结构，实现了分段锁，理论上最大并发度与Segment个数相等。

Java 8为进一步提高并发性，摒弃了分段锁的方案，而是直接使用一个大的数组。

同时为了提高哈希碰撞下的寻址性能，Java 8在链表长度超过一定阈值（8）时将链表（寻址时间复杂度为`O(N)`）转换为 [红黑树](https://houbb.github.io/2018/09/12/data-struct-red-black-tree)（寻址时间复杂度为`O(log(N))`）。

其数据结构如下图所示:

![jdk8-concurrent-hashmap](http://www.jasongj.com/img/java/concurrenthashmap/concurrenthashmap_java8.png)

## 寻址方式

Java 8的ConcurrentHashMap同样是通过Key的哈希值与数组长度取模确定该Key在数组中的索引。

同样为了避免不太好的Key的hashCode设计，它通过如下方法计算得到Key的最终哈希值。

不同的是，Java 8的ConcurrentHashMap作者认为引入红黑树后，即使哈希冲突比较严重，寻址效率也足够高，所以作者并未在哈希值的计算上做过多设计，只是将Key的hashCode值与其高16位作异或并保证最高位为0（从而保证最终结果为正整数）。

```java
static final int spread(int h) {
  return (h ^ (h >>> 16)) & HASH_BITS;
}
```

## 同步方式

对于put操作，如果Key对应的数组元素为null，则通过CAS操作将其设置为当前值。

如果Key对应的数组元素（也即链表表头或者树的根元素）不为null，则对该元素使用synchronized关键字申请锁，然后进行操作。

如果该put操作使得当前链表长度超过一定阈值，则将该链表转换为树，从而提高寻址效率。

对于读操作，由于数组被volatile关键字修饰，因此不用担心数组的可见性问题。

同时每个元素是一个Node实例（Java 7中每个元素是一个HashEntry），它的Key值和hash值都由final修饰，不可变更，无须关心它们被修改后的可见性问题。

而其Value及对下一个元素的引用由volatile修饰，可见性也有保障。

```java
static class Node<K,V> implements Map.Entry<K,V> {
  final int hash;
  final K key;
  volatile V val;
  volatile Node<K,V> next;
}
```

对于Key对应的数组元素的可见性，由 Unsafe.getObjectVolatile() 保证。

```java
static final <K,V> Node<K,V> tabAt(Node<K,V>[] tab, int i) {
  return (Node<K,V>)U.getObjectVolatile(tab, ((long)i << ASHIFT) + ABASE);
}
```

## size 操作

put方法和remove方法都会通过addCount方法维护Map的size。

size方法通过sumCount获取由addCount方法维护的Map的size。

```java
public int size() {
    long n = sumCount();
    return ((n < 0L) ? 0 :
            (n > (long)Integer.MAX_VALUE) ? Integer.MAX_VALUE :
            (int)n);
}
```

# 小结

HashMap 和 List 是我最喜欢的两种数据结构，简单实用。

ConcurrentHashMap 为了性能提升，都在不同的 jdk 版本中提升自己，**何况你我**呢？

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

http://www.jasongj.com/java/concurrenthashmap/

* any list
{:toc}
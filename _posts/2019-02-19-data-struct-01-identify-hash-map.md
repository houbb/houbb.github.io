---
layout: post
title: 数据结构 01 IdentityHashMap 详解
date:  2019-2-19 14:50:42 +0800
categories: [Data-Struct]
tags: [data-struct, source-code, jdk, cache, sh]
published: true
---

# IdentityHashMap

## 简介

IdentityHashMap 类利用哈希表实现 Map 接口，比较键（和值）时使用引用相等性代替对象相等性。

换句话说，在 IdentityHashMap 中，当且仅当 (k1==k2) 时，才认为两个键 k1 和 k2 相等（在正常 Map 实现（如 HashMap）中，

当且仅当满足下列条件时才认为两个键 k1 和 k2 相等：(k1==null ? k2==null : e1.equals(e2))）。

## 注意

此类不是 通用 Map 实现！此类实现 Map 接口时，它有意违反 Map 的常规协定，该协定在比较对象时强制使用 equals 方法。此类设计仅用于其中需要引用相等性语义的罕见情况。 此类的典型用法是拓扑保留对象图形转换，如序列化或深层复制。

要执行这样的转换，程序必须维护用于跟踪所有已处理对象引用的“节点表”。

节点表一定不等于不同对象，即使它们偶然相等也如此。此类的另一种典型用法是维护代理对象。

例如，调试设施可能希望为正在调试程序中的每个对象维护代理对象。

此类提供所有的可选映射操作，并且允许 null 值和 null 键。此类对映射的顺序不提供任何保证；特别是不保证顺序随时间的推移保持不变。
此类提供基本操作（get 和 put）的稳定性能，假定系统标识了将桶间元素正确分开的哈希函数 (System.identityHashCode(Object))。
此类具有一个调整参数（影响性能但不影响语义）：expected maximum size。此参数是希望映射保持的键值映射关系最大数。
在内部，此参数用于确定最初组成哈希表的桶数。未指定所期望的最大数量和桶数之间的确切关系。
默认的价值加载因子为2/3,在重新哈希后，加载因子变为1/3.当哈希表中的条目数超出了加载因子与当前容量的乘积时，通过调用 reszie 方法将容量翻倍,重新进行哈希。增加桶数，重新哈希，可能相当昂贵。

因此创建具有足够大的期望最大数量的标识哈希映射更合算。另一方面，对 collection 视图进行迭代所需的时间与哈希表中的桶数成正比，
所以如果特别注重迭代性能或内存使用，则不宜将期望的最大数量设置得过高。

注意，此实现不是同步的。如果多个线程同时访问此映射，并且其中至少一个线程从结构上修改了该映射，
则其必须保持外部同步（结构上的修改是指添加或删除一个或多个映射关系的操作；仅改变与实例已经包含的键关联的值不是结构上的修改。）

这一般通过对自然封装该映射的对象进行同步操作来完成。如果不存在这样的对象，则应该使用 Collections.synchronizedMap 方法来“包装”该映射。

最好在创建时完成这一操作，以防止对映射进行意外的不同步访问，如下所示：

```java
Map m = Collections.synchronizedMap(new HashMap(...));
```

 由所有此类的“collection 视图方法”所返回的迭代器都是快速失败的：在迭代器创建之后，
 如果从结构上对映射进行修改，除非通过迭代器自身的 remove 或 add 方法，其他任何时间任何方式的修改，
 迭代器都将抛出 ConcurrentModificationException。因此，面对并发的修改，迭代器很快就会完全失败，
 而不冒在将来不确定的时间任意发生不确定行为的风险。

 注意，迭代器的快速失败行为不能得到保证，一般来说，存在不同步的并发修改时，不可能作出任何强有力的保证。
 快速失败迭代器尽最大努力抛出 ConcurrentModificationException。因此，编写依赖于此异常的程序的方式是错误的，正确做法是：
 迭代器的快速失败行为应该仅用于检测程序错误。

 实现注意事项：此为简单的线性探头哈希表，如 Sedgewick 和 Knuth 原文示例中所述。
 该数组交替保持键和值（对于大型表来说，它比使用独立组保持键和值更具优势）。对于多数 JRE 实现和混合操作，
 此类比 HashMap（它使用链 而不使用线性探头）能产生更好的性能。 

 注意1：允许 null 值和 null 键。
 注意2：此类对映射的顺序不提供任何保证；特别是不保证顺序随时间的推移保持不变。
 注意3：此实现不是同步的。
 注意4：迭代器的快速失败行为不能得到保证。
 注意5：此为简单的线性探头哈希表。对于多数 JRE 实现和混合操作，
 此类比 HashMap（它使用链 而不使用线性探头）能产生更好的性能。 

## 使用场景

需要根据地址去判断的实现。

# 简单例子

- IdentityHashMapTest.java

```java
import java.util.IdentityHashMap;
import java.util.Map;

/**
 * @author binbin.hou
 * date 2019/2/19
 */
public class IdentityHashMapTest {

    public static void main(String[] args) {
        Map<String, String> map = new IdentityHashMap<>();
        map.put("A", "A-value-1");
        map.put("A", "A-value-2");
        map.put(new String("B"), "B-value-2");
        map.put(new String("B"), "B-value-2");
        System.out.println(map);
    }

}
```

- 输出日志

```
{B=B-value-2, A=A-value-2, B=B-value-2}
```

# 源码分析

## jdk 版本

```
java version "1.8.0_191"
```

## 接口定义

```java
public class IdentityHashMap<K,V>
    extends AbstractMap<K,V>
    implements Map<K,V>, java.io.Serializable, Cloneable
{}
```

## 基础属性

底层依然使用的数组进行数据的存储。

```java
    /**
     * The initial capacity used by the no-args constructor.
     * MUST be a power of two.  The value 32 corresponds to the
     * (specified) expected maximum size of 21, given a load factor
     * of 2/3.
     */
    private static final int DEFAULT_CAPACITY = 32;

    /**
     * The minimum capacity, used if a lower value is implicitly specified
     * by either of the constructors with arguments.  The value 4 corresponds
     * to an expected maximum size of 2, given a load factor of 2/3.
     * MUST be a power of two.
     */
    private static final int MINIMUM_CAPACITY = 4;

    /**
     * The maximum capacity, used if a higher value is implicitly specified
     * by either of the constructors with arguments.
     * MUST be a power of two <= 1<<29.
     *
     * In fact, the map can hold no more than MAXIMUM_CAPACITY-1 items
     * because it has to have at least one slot with the key == null
     * in order to avoid infinite loops in get(), put(), remove()
     */
    private static final int MAXIMUM_CAPACITY = 1 << 29;

    /**
     * The table, resized as necessary. Length MUST always be a power of two.
     */
    transient Object[] table; // non-private to simplify nested class access

    /**
     * The number of key-value mappings contained in this identity hash map.
     *
     * @serial
     */
    int size;

    /**
     * The number of modifications, to support fast-fail iterators
     */
    transient int modCount;

    /**
     * Value representing null keys inside tables.
     */
    static final Object NULL_KEY = new Object();
```

## 基础工具方法

感觉是为了避免 NPE，对 null 值进行了转换处理。

### null 的处理

```java
/**
 * Use NULL_KEY for key if it is null.
 */
private static Object maskNull(Object key) {
    return (key == null ? NULL_KEY : key);
}

/**
 * Returns internal representation of null key back to caller as null.
 */
static final Object unmaskNull(Object key) {
    return (key == NULL_KEY ? null : key);
}
```

### hash 的处理

主要是在 put() 的时候使用。

```java
/**
 * Returns index for Object x.
 */
private static int hash(Object x, int length) {
    int h = System.identityHashCode(x);
    // Multiply by -127, and left-shift to use least bit as part of hash
    return ((h << 1) - (h << 8)) & (length - 1);
}

/**
 * Circularly traverses table of size len.
 */
private static int nextKeyIndex(int i, int len) {
    return (i + 2 < len ? i + 2 : 0);
}
```

## 构造器

```java
    /**
     * Constructs a new, empty identity hash map with a default expected
     * maximum size (21).
     */
    public IdentityHashMap() {
        init(DEFAULT_CAPACITY);
    }

    /**
     * Constructs a new, empty map with the specified expected maximum size.
     * Putting more than the expected number of key-value mappings into
     * the map may cause the internal data structure to grow, which may be
     * somewhat time-consuming.
     *
     * @param expectedMaxSize the expected maximum size of the map
     * @throws IllegalArgumentException if <tt>expectedMaxSize</tt> is negative
     */
    public IdentityHashMap(int expectedMaxSize) {
        if (expectedMaxSize < 0)
            throw new IllegalArgumentException("expectedMaxSize is negative: "
                                               + expectedMaxSize);
        init(capacity(expectedMaxSize));
    }

    /**
     * Constructs a new identity hash map containing the keys-value mappings
     * in the specified map.
     *
     * @param m the map whose mappings are to be placed into this map
     * @throws NullPointerException if the specified map is null
     */
    public IdentityHashMap(Map<? extends K, ? extends V> m) {
        // Allow for a bit of growth
        this((int) ((1 + m.size()) * 1.1));
        putAll(m);
    }
```

### init()

其中 init() 源码如下:

```java
    /**
     * Initializes object to be an empty map with the specified initial
     * capacity, which is assumed to be a power of two between
     * MINIMUM_CAPACITY and MAXIMUM_CAPACITY inclusive.
     */
    private void init(int initCapacity) {
        // assert (initCapacity & -initCapacity) == initCapacity; // power of 2
        // assert initCapacity >= MINIMUM_CAPACITY;
        // assert initCapacity <= MAXIMUM_CAPACITY;

        table = new Object[2 * initCapacity];
    }
```

默认初始化为 DEFAULT_CAPACITY*2，所以为什么不把 DEFAULT_CAPACITY 设置为 64？

### capacity

对传入的大小进行校验。

并选择 2 的幂作为大小。

```java
    /**
     * Returns the appropriate capacity for the given expected maximum size.
     * Returns the smallest power of two between MINIMUM_CAPACITY and
     * MAXIMUM_CAPACITY, inclusive, that is greater than (3 *
     * expectedMaxSize)/2, if such a number exists.  Otherwise returns
     * MAXIMUM_CAPACITY.
     */
    private static int capacity(int expectedMaxSize) {
        // assert expectedMaxSize >= 0;
        return
            (expectedMaxSize > MAXIMUM_CAPACITY / 3) ? MAXIMUM_CAPACITY :
            (expectedMaxSize <= 2 * MINIMUM_CAPACITY / 3) ? MINIMUM_CAPACITY :
            Integer.highestOneBit(expectedMaxSize + (expectedMaxSize << 1));
    }
```

### putAll()

根据已有的 map 生成新的 map 中用到。

```java
    /**
     * Copies all of the mappings from the specified map to this map.
     * These mappings will replace any mappings that this map had for
     * any of the keys currently in the specified map.
     *
     * @param m mappings to be stored in this map
     * @throws NullPointerException if the specified map is null
     */
    public void putAll(Map<? extends K, ? extends V> m) {
        int n = m.size();
        if (n == 0)
            return;
        if (n > size)
            resize(capacity(n)); // conservatively pre-expand

        for (Entry<? extends K, ? extends V> e : m.entrySet())
            put(e.getKey(), e.getValue());
    }
```

- resize() 扩容

```java
/**
 * Resizes the table if necessary to hold given capacity.
 *
 * @param newCapacity the new capacity, must be a power of two.
 * @return whether a resize did in fact take place
 */
private boolean resize(int newCapacity) {
    // assert (newCapacity & -newCapacity) == newCapacity; // power of 2
    int newLength = newCapacity * 2;
    Object[] oldTable = table;
    int oldLength = oldTable.length;
    if (oldLength == 2 * MAXIMUM_CAPACITY) { // can't expand any further
        if (size == MAXIMUM_CAPACITY - 1)
            throw new IllegalStateException("Capacity exhausted.");
        return false;
    }
    if (oldLength >= newLength)
        return false;
    Object[] newTable = new Object[newLength];
    for (int j = 0; j < oldLength; j += 2) {
        Object key = oldTable[j];
        if (key != null) {
            Object value = oldTable[j+1];
            oldTable[j] = null;
            oldTable[j+1] = null;
            int i = hash(key, newLength);
            while (newTable[i] != null)
                i = nextKeyIndex(i, newLength);
            newTable[i] = key;
            newTable[i + 1] = value;
        }
    }
    table = newTable;
    return true;
}
```

## put() 核心方法

元素的放入

```java
    /**
     * Associates the specified value with the specified key in this identity
     * hash map.  If the map previously contained a mapping for the key, the
     * old value is replaced.
     *
     * @param key the key with which the specified value is to be associated
     * @param value the value to be associated with the specified key
     * @return the previous value associated with <tt>key</tt>, or
     *         <tt>null</tt> if there was no mapping for <tt>key</tt>.
     *         (A <tt>null</tt> return can also indicate that the map
     *         previously associated <tt>null</tt> with <tt>key</tt>.)
     * @see     Object#equals(Object)
     * @see     #get(Object)
     * @see     #containsKey(Object)
     */
    public V put(K key, V value) {
        final Object k = maskNull(key);

        retryAfterResize: for (;;) {
            final Object[] tab = table;
            final int len = tab.length;
            int i = hash(k, len);

            for (Object item; (item = tab[i]) != null;
                 i = nextKeyIndex(i, len)) {
                if (item == k) {
                    @SuppressWarnings("unchecked")
                        V oldValue = (V) tab[i + 1];
                    tab[i + 1] = value;
                    return oldValue;
                }
            }

            final int s = size + 1;
            // Use optimized form of 3 * s.
            // Next capacity is len, 2 * current capacity.
            if (s + (s << 1) > len && resize(len))
                continue retryAfterResize;

            modCount++;
            tab[i] = k;
            tab[i + 1] = value;
            size = s;
            return null;
        }
    }
```

## get() 属性的获取

```java
    /**
     * Returns the value to which the specified key is mapped,
     * or {@code null} if this map contains no mapping for the key.
     *
     * <p>More formally, if this map contains a mapping from a key
     * {@code k} to a value {@code v} such that {@code (key == k)},
     * then this method returns {@code v}; otherwise it returns
     * {@code null}.  (There can be at most one such mapping.)
     *
     * <p>A return value of {@code null} does not <i>necessarily</i>
     * indicate that the map contains no mapping for the key; it's also
     * possible that the map explicitly maps the key to {@code null}.
     * The {@link #containsKey containsKey} operation may be used to
     * distinguish these two cases.
     *
     * @see #put(Object, Object)
     */
    @SuppressWarnings("unchecked")
    public V get(Object key) {
        Object k = maskNull(key);
        Object[] tab = table;
        int len = tab.length;
        int i = hash(k, len);
        while (true) {
            Object item = tab[i];
            if (item == k)
                return (V) tab[i + 1];
            if (item == null)
                return null;
            i = nextKeyIndex(i, len);
        }
    }
```



# 参考资料 

[IdentityHashMap](https://blog.csdn.net/hudashi/article/details/6947625)

[Java1.8-IdentityHashMap源码解析](https://www.jianshu.com/p/1b441546078a)

* any list
{:toc}
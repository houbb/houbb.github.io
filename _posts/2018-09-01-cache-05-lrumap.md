---
layout: post
title:  Cache Travel-05-LRUMAP
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, redis, in-action, sh]
published: true
---

# LRU

本文通过对 Apache Commons Collections 项目中 LRUMap 这个集合类的源代码进行详细解读，为帮助大家更好的了解这个集合类的实现原理以及使用如何该集合类。

## 算法简介

首先介绍一下LRU算法。 

LRU 是由 Least Recently Used 的首字母组成，表示最近最少使用的含义，一般使用在对象淘汰算法上。也是比较常见的一种淘汰算法。

# 简单的实现

## 重写 removeEldestEntry

```java
import java.util.LinkedHashMap;
import java.util.Map;
 
public class LRUMap extends LinkedHashMap {
    
    private int maxSize=20;
    
    public LRUMap(int size){
        super(size,0.75f,true);
        this.maxSize=size;
    };
    
    protected boolean removeEldestEntry(Map.Entry eldest) {
        return (size()>maxSize);
    }
}
```

## removeEldestEntry

这个方法默认是 false 的，如果指定为 true。就是一种移除的指定条件。

```java
/**
 * Returns <tt>true</tt> if this map should remove its eldest entry.
 * This method is invoked by <tt>put</tt> and <tt>putAll</tt> after
 * inserting a new entry into the map.  It provides the implementor
 * with the opportunity to remove the eldest entry each time a new one
 * is added.  This is useful if the map represents a cache: it allows
 * the map to reduce memory consumption by deleting stale entries.
 *
 * <p>Sample use: this override will allow the map to grow up to 100
 * entries and then delete the eldest entry each time a new entry is
 * added, maintaining a steady state of 100 entries.
 * <pre>
 *     private static final int MAX_ENTRIES = 100;
 *
 *     protected boolean removeEldestEntry(Map.Entry eldest) {
 *        return size() &gt; MAX_ENTRIES;
 *     }
 * </pre>
 *
 * <p>This method typically does not modify the map in any way,
 * instead allowing the map to modify itself as directed by its
 * return value.  It <i>is</i> permitted for this method to modify
 * the map directly, but if it does so, it <i>must</i> return
 * <tt>false</tt> (indicating that the map should not attempt any
 * further modification).  The effects of returning <tt>true</tt>
 * after modifying the map from within this method are unspecified.
 *
 * <p>This implementation merely returns <tt>false</tt> (so that this
 * map acts like a normal map - the eldest element is never removed).
 *
 * @param    eldest The least recently inserted entry in the map, or if
 *           this is an access-ordered map, the least recently accessed
 *           entry.  This is the entry that will be removed it this
 *           method returns <tt>true</tt>.  If the map was empty prior
 *           to the <tt>put</tt> or <tt>putAll</tt> invocation resulting
 *           in this invocation, this will be the entry that was just
 *           inserted; in other words, if the map contains a single
 *           entry, the eldest entry is also the newest.
 * @return   <tt>true</tt> if the eldest entry should be removed
 *           from the map; <tt>false</tt> if it should be retained.
 */
protected boolean removeEldestEntry(Map.Entry<K,V> eldest) {
    return false;
}
```


# apache common-collections 实现

## LRUMap

LRUMap 则是实现的LRP算法的Map集合类，它继承于AbstractLinkedMap 抽象类。

LRUMap的使用说明如下：

LRUMap的初始化时需要指定最大集合元素个数，新增的元素个数大于允许的最大集合个数时，则会执行LRU淘汰算法。所有的元素在LRUMap中会根据最近使用情况进行排序。

最近使用的会放在元素的最前面(LRUMap是通过链表来存储元素内容). 所以LRUMap进行淘汰时只需要***链表最后一个即可（即header.after所指的元素对象）

那么那些操作会影响元素的使用情况：

1. put 当新增加一个集合元素对象，则表示该对象是最近被访问的

2. get 操作会把当前访问的元素对象作为最近被访问的，会被移到链接表头
 
注：当执行 containsKey 和 containsValue 操作时，不会影响元素的访问情况。

## 线程安全性

LRUMap 也是非线程安全。

在多线程下使用可通过 `Collections.synchronizedMap(Map)` 操作来保证线程安全。

## 入门使用

```java
public static void main(String[] args) {
    LRUMap lruMap = new LRUMap(2);
    lruMap.put("a1", "1");
    lruMap.put("a2", "2");
    lruMap.get("a1");//mark as recentused
    lruMap.put("a3", "3");
    System.out.println(lruMap);
}
```

上面的示例，当增加”a3”值时，会淘汰最近最少使用的”a2”, 最后输出的结果为：

```
{a1=1,a3=3} 
```

# 源码分析

## 类继承

```java
public class LRUMap
        extends AbstractLinkedMap implements BoundedMap, Serializable, Cloneable
```

主要继承自 `AbstractLinkedMap` 类，实现了 `BoundedMap` 接口。

### BoundedMap

```java
public interface BoundedMap extends Map {

    /**
     * Returns true if this map is full and no new elements can be added.
     *
     * @return <code>true</code> if the map is full
     */
    boolean isFull();

    /**
     * Gets the maximum size of the map (the bound).
     *
     * @return the maximum number of elements the map can hold
     */
    int maxSize();

}
```

比起普通的 map，多了两个方法。

用来确定 map 的大小边界。

## 私有属性

```java
/** Default maximum size */
protected static final int DEFAULT_MAX_SIZE = 100;

/** Maximum size */
private transient int maxSize;

/** Scan behaviour */
private boolean scanUntilRemovable;
```

两个关于 map 的 maxSize 属性，scanUntilRemovable 是一种扫描的行为标识，后面会提到。

## 构造器

```java
    /**
     * Constructs a new empty map with a maximum size of 100.
     */
    public LRUMap() {
        this(DEFAULT_MAX_SIZE, DEFAULT_LOAD_FACTOR, false);
    }

    /**
     * Constructs a new, empty map with the specified maximum size.
     *
     * @param maxSize  the maximum size of the map
     * @throws IllegalArgumentException if the maximum size is less than one
     */
    public LRUMap(int maxSize) {
        this(maxSize, DEFAULT_LOAD_FACTOR);
    }

    /**
     * Constructs a new, empty map with the specified maximum size.
     *
     * @param maxSize  the maximum size of the map
     * @param scanUntilRemovable  scan until a removeable entry is found, default false
     * @throws IllegalArgumentException if the maximum size is less than one
     * @since Commons Collections 3.1
     */
    public LRUMap(int maxSize, boolean scanUntilRemovable) {
        this(maxSize, DEFAULT_LOAD_FACTOR, scanUntilRemovable);
    }

    /**
     * Constructs a new, empty map with the specified initial capacity and
     * load factor. 
     *
     * @param maxSize  the maximum size of the map, -1 for no limit,
     * @param loadFactor  the load factor
     * @throws IllegalArgumentException if the maximum size is less than one
     * @throws IllegalArgumentException if the load factor is less than zero
     */
    public LRUMap(int maxSize, float loadFactor) {
        this(maxSize, loadFactor, false);
    }

    /**
     * Constructs a new, empty map with the specified initial capacity and
     * load factor.
     *
     * @param maxSize  the maximum size of the map, -1 for no limit,
     * @param loadFactor  the load factor
     * @param scanUntilRemovable  scan until a removeable entry is found, default false
     * @throws IllegalArgumentException if the maximum size is less than one
     * @throws IllegalArgumentException if the load factor is less than zero
     * @since Commons Collections 3.1
     */
    public LRUMap(int maxSize, float loadFactor, boolean scanUntilRemovable) {
        super((maxSize < 1 ? DEFAULT_CAPACITY : maxSize), loadFactor);
        if (maxSize < 1) {
            throw new IllegalArgumentException("LRUMap max size must be greater than 0");
        }
        this.maxSize = maxSize;
        this.scanUntilRemovable = scanUntilRemovable;
    }

    /**
     * Constructor copying elements from another map.
     * <p>
     * The maximum size is set from the map's size.
     *
     * @param map  the map to copy
     * @throws NullPointerException if the map is null
     * @throws IllegalArgumentException if the map is empty
     */
    public LRUMap(Map map) {
        this(map, false);
    }

    /**
     * Constructor copying elements from another map.
     * <p/>
     * The maximum size is set from the map's size.
     *
     * @param map  the map to copy
     * @param scanUntilRemovable  scan until a removeable entry is found, default false
     * @throws NullPointerException if the map is null
     * @throws IllegalArgumentException if the map is empty
     * @since Commons Collections 3.1
     */
    public LRUMap(Map map, boolean scanUntilRemovable) {
        this(map.size(), DEFAULT_LOAD_FACTOR, scanUntilRemovable);
        putAll(map);
    }
```

提供常见的构造器，便于使用。

主要用于初始化两种私有属性。

loadFactor 是和 map 中一样的加载因子。

## 获取方法

```java
/**
 * Gets the value mapped to the key specified.
 * <p>
 * This operation changes the position of the key in the map to the
 * most recently used position (first).
 * 
 * @param key  the key
 * @return the mapped value, null if no match
 */
public Object get(Object key) {
    LinkEntry entry = (LinkEntry) getEntry(key);
    if (entry == null) {
        return null;
    }
    moveToMRU(entry);
    return entry.getValue();
}
```

这个方法和传统的属性类似，但是每一次获取会导致使用频率发生变化。

也就是 `moveToMRU(entry);` 所要做的事情。

### moveToMRU(entry)

```java
//-----------------------------------------------------------------------
/**
 * Moves an entry to the MRU position at the end of the list.
 * <p>
 * This implementation moves the updated entry to the end of the list.
 * 
 * @param entry  the entry to update
 */
protected void moveToMRU(LinkEntry entry) {
    if (entry.after != header) {
        modCount++;
        // remove
        entry.before.after = entry.after;
        entry.after.before = entry.before;
        // add first
        entry.after = header;
        entry.before = header.before;
        header.before.after = entry;
        header.before = entry;
    } else if (entry == header) {
        throw new IllegalStateException("Can't move header to MRU" +
            " (please report this to commons-dev@jakarta.apache.org)");
    }
}
```

## 更新明细信息

```java
/**
 * Updates an existing key-value mapping.
 * <p>
 * This implementation moves the updated entry to the top of the list
 * using {@link #moveToMRU(AbstractLinkedMap.LinkEntry)}.
 * 
 * @param entry  the entry to update
 * @param newValue  the new value to store
 */
protected void updateEntry(HashEntry entry, Object newValue) {
    moveToMRU((LinkEntry) entry);  // handles modCount
    entry.setValue(newValue);
}
```

## 添加明细信息

```java
/**
 * Adds a new key-value mapping into this map.
 * <p>
 * This implementation checks the LRU size and determines whether to
 * discard an entry or not using {@link #removeLRU(AbstractLinkedMap.LinkEntry)}.
 * <p>
 * From Commons Collections 3.1 this method uses {@link #isFull()} rather
 * than accessing <code>size</code> and <code>maxSize</code> directly.
 * It also handles the scanUntilRemovable functionality.
 * 
 * @param hashIndex  the index into the data array to store at
 * @param hashCode  the hash code of the key to add
 * @param key  the key to add
 * @param value  the value to add
 */
protected void addMapping(int hashIndex, int hashCode, Object key, Object value) {
    if (isFull()) {
        LinkEntry reuse = header.after;
        boolean removeLRUEntry = false;
        if (scanUntilRemovable) {
            while (reuse != header && reuse != null) {
                if (removeLRU(reuse)) {
                    removeLRUEntry = true;
                    break;
                }
                reuse = reuse.after;
            }
            if (reuse == null) {
                throw new IllegalStateException(
                    "Entry.after=null, header.after" + header.after + " header.before" + header.before +
                    " key=" + key + " value=" + value + " size=" + size + " maxSize=" + maxSize +
                    " Please check that your keys are immutable, and that you have used synchronization properly." +
                    " If so, then please report this to commons-dev@jakarta.apache.org as a bug.");
            }
        } else {
            removeLRUEntry = removeLRU(reuse);
        }
        
        if (removeLRUEntry) {
            if (reuse == null) {
                throw new IllegalStateException(
                    "reuse=null, header.after=" + header.after + " header.before" + header.before +
                    " key=" + key + " value=" + value + " size=" + size + " maxSize=" + maxSize +
                    " Please check that your keys are immutable, and that you have used synchronization properly." +
                    " If so, then please report this to commons-dev@jakarta.apache.org as a bug.");
            }
            reuseMapping(reuse, hashIndex, hashCode, key, value);
        } else {
            super.addMapping(hashIndex, hashCode, key, value);
        }
    } else {
        super.addMapping(hashIndex, hashCode, key, value);
    }
}
```

这个方法是比较复杂的。

其中：

### reuseMapping()

```java
/**
 * Reuses an entry by removing it and moving it to a new place in the map.
 * <p>
 * This method uses {@link #removeEntry}, {@link #reuseEntry} and {@link #addEntry}.
 * 
 * @param entry  the entry to reuse
 * @param hashIndex  the index into the data array to store at
 * @param hashCode  the hash code of the key to add
 * @param key  the key to add
 * @param value  the value to add
 */
protected void reuseMapping(LinkEntry entry, int hashIndex, int hashCode, Object key, Object value) {
    // find the entry before the entry specified in the hash table
    // remember that the parameters (except the first) refer to the new entry,
    // not the old one
    try {
        int removeIndex = hashIndex(entry.hashCode, data.length);
        HashEntry[] tmp = data;  // may protect against some sync issues
        HashEntry loop = tmp[removeIndex];
        HashEntry previous = null;
        while (loop != entry && loop != null) {
            previous = loop;
            loop = loop.next;
        }
        if (loop == null) {
            throw new IllegalStateException(
                "Entry.next=null, data[removeIndex]=" + data[removeIndex] + " previous=" + previous +
                " key=" + key + " value=" + value + " size=" + size + " maxSize=" + maxSize +
                " Please check that your keys are immutable, and that you have used synchronization properly." +
                " If so, then please report this to commons-dev@jakarta.apache.org as a bug.");
        }
        
        // reuse the entry
        modCount++;
        removeEntry(entry, removeIndex, previous);
        reuseEntry(entry, hashIndex, hashCode, key, value);
        addEntry(entry, hashIndex);
    } catch (NullPointerException ex) {
        throw new IllegalStateException(
                "NPE, entry=" + entry + " entryIsHeader=" + (entry==header) +
                " key=" + key + " value=" + value + " size=" + size + " maxSize=" + maxSize +
                " Please check that your keys are immutable, and that you have used synchronization properly." +
                " If so, then please report this to commons-dev@jakarta.apache.org as a bug.");
    }
}
```

### removeLRU

移除 LRU 

```java
/**
 * Subclass method to control removal of the least recently used entry from the map.
 * <p>
 * This method exists for subclasses to override. A subclass may wish to
 * provide cleanup of resources when an entry is removed. For example:
 * <pre>
 * protected boolean removeLRU(LinkEntry entry) {
 *   releaseResources(entry.getValue());  // release resources held by entry
 *   return true;  // actually delete entry
 * }
 * </pre>
 * <p>
 * Alternatively, a subclass may choose to not remove the entry or selectively
 * keep certain LRU entries. For example:
 * <pre>
 * protected boolean removeLRU(LinkEntry entry) {
 *   if (entry.getKey().toString().startsWith("System.")) {
 *     return false;  // entry not removed from LRUMap
 *   } else {
 *     return true;  // actually delete entry
 *   }
 * }
 * </pre>
 * The effect of returning false is dependent on the scanUntilRemovable flag.
 * If the flag is true, the next LRU entry will be passed to this method and so on
 * until one returns false and is removed, or every entry in the map has been passed.
 * If the scanUntilRemovable flag is false, the map will exceed the maximum size.
 * <p>
 * NOTE: Commons Collections 3.0 passed the wrong entry to this method.
 * This is fixed in version 3.1 onwards.
 * 
 * @param entry  the entry to be removed
 */
protected boolean removeLRU(LinkEntry entry) {
    return true;
}
```

## 属性状态获取

```java
/**
 * Returns true if this map is full and no new mappings can be added.
 *
 * @return <code>true</code> if the map is full
 */
public boolean isFull() {
    return (size >= maxSize);
}

/**
 * Gets the maximum size of the map (the bound).
 *
 * @return the maximum number of elements the map can hold
 */
public int maxSize() {
    return maxSize;
}

/**
 * Whether this LRUMap will scan until a removable entry is found when the
 * map is full.
 *
 * @return true if this map scans
 * @since Commons Collections 3.1
 */
public boolean isScanUntilRemovable() {
    return scanUntilRemovable;
}
```

## 序列化 Clone 方法

```java
//-----------------------------------------------------------------------
/**
 * Clones the map without cloning the keys or values.
 *
 * @return a shallow clone
 */
public Object clone() {
    return super.clone();
}

/**
 * Write the map out using a custom routine.
 */
private void writeObject(ObjectOutputStream out) throws IOException {
    out.defaultWriteObject();
    doWriteObject(out);
}
/**
 * Read the map in using a custom routine.
 */
private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
    in.defaultReadObject();
    doReadObject(in);
}

/**
 * Writes the data necessary for <code>put()</code> to work in deserialization.
 */
protected void doWriteObject(ObjectOutputStream out) throws IOException {
    out.writeInt(maxSize);
    super.doWriteObject(out);
}
/**
 * Reads the data necessary for <code>put()</code> to work in the superclass.
 */
protected void doReadObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
    maxSize = in.readInt();
    super.doReadObject(in);
}
```


# 个人收获

## 最简单的实现

需要知道 `removeEldestEntry` 方法，但是这种最简单的实现是有缺陷的。

## commons-collection 做了什么

确定了每一个 entry 的使用频率，可以确定每次淘汰的元素是什么。

比较有趣的是，并没有将数据的淘汰交给 `removeEldestEntry()`。因为自己已经重新实现了这一套淘汰的时机，和淘汰的策略。 

# 拓展阅读

[Hash](https://houbb.github.io/2018/05/30/hash)

[HashMap](https://houbb.github.io/2018/09/12/java-hashmap)

[ConcurrentHashMap](https://houbb.github.io/2018/09/12/java-concurrent-hashmap)

# 参考资料

## apache

[LRUMap Doc](https://commons.apache.org/proper/commons-collections/apidocs/org/apache/commons/collections4/map/LRUMap.html)

## other

[利用LRUMap 设计缓存](https://www.cnblogs.com/mingziday/p/4910004.html)

* any list
{:toc}
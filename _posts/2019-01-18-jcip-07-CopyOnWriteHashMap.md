---
layout: post
title:  JCIP-07-java 从零实现 CopyOnWriteHashMap
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, sh]
published: true
---

# COW 的思想

## 思想的通用性

CopyOnWriteArrayList 和 CopyOnWriteArraySet 这种读写分离的思想是通用的。

今天就让我们用这种思想实现一个简单的工具：CopyOnWriteHashMap。

## 实践出真知

这个工具包都出来几十年了，还是用的人很少。

要学以致用，站在巨人的肩膀上，

# 自己实现一个 copyOnWriteMap

## 类定义

```java
public class CopyOnWriteHashMap<K,V> implements Map<K, V>, Cloneable {

    /**
     * 内部 HashMap
     * @since 0.0.4
     */
    private volatile Map<K, V> internalMap;

    /**
     * 可重入锁
     * @since 0.0.4
     */
    private final ReentrantLock lock;

    /**
     * 无参构造器
     *
     * 初始化对应的属性
     * @since 0.0.4
     */
    public CopyOnWriteHashMap() {
        this.internalMap = new HashMap<K, V>();
        this.lock = new ReentrantLock();
    }
}
```

我们实现 Map接口，内部声明 internalMap 用于复用 HashMap 的方法，使用 lock 锁保证并发安全。

无参构造器，就是对属性进行简单的初始化。

## 核心方法

### put 方法

我们通过并发加锁，并且拷贝一份 internalMap 的方式，实现 put 操作。

```java
@Override
public V put(K key, V value) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 拷贝一份
        Map<K, V> newMap = new HashMap<>(internalMap);
        V val = newMap.put(key, value);
        // 设置为新的
        internalMap = newMap;
        return val;
    } finally {
        lock.unlock();
    }
}
```


### putAll 方法

根据一个集合进行初始化。

```java
@Override
public void putAll(Map<? extends K, ? extends V> m) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 拷贝一份
        Map<K, V> newMap = new HashMap<>(internalMap);
        newMap.putAll(m);
        // 设置为新的
        internalMap = newMap;
    } finally {
        lock.unlock();
    }
}
```

### remove 操作

这个实现也是类似的。

```java
@Override
public V remove(Object key) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 拷贝一份
        Map<K, V> newMap = new HashMap<>(internalMap);
        V val = newMap.remove(key);

        // 设置为新的
        internalMap = newMap;
        return val;
    } finally {
        lock.unlock();
    }
}
```

### clear 清空操作

```java
@Override
public void clear() {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        internalMap.clear();
    } finally {
        lock.unlock();
    }
}
```

## 整体实现

一个完整版本的实现如下：

```java
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.ReentrantLock;

/**
 * COW HashMap
 * @author 老马啸西风
 * @since 0.0.4
 * @param <K> key
 * @param <V> value
*/
public class CopyOnWriteHashMap<K,V> implements Map<K, V>, Cloneable {

    /**
     * 内部 HashMap
     * @since 0.0.4
     */
    private volatile Map<K, V> internalMap;

    /**
     * 可重入锁
     * @since 0.0.4
     */
    private final ReentrantLock lock;

    /**
     * 无参构造器
     *
     * 初始化对应的属性
     * @since 0.0.4
     */
    public CopyOnWriteHashMap() {
        this.internalMap = new HashMap<K, V>();
        this.lock = new ReentrantLock();
    }

    @Override
    public int size() {
        return internalMap.size();
    }

    @Override
    public boolean isEmpty() {
        return internalMap.isEmpty();
    }

    @Override
    public boolean containsKey(Object key) {
        return internalMap.containsKey(key);
    }

    @Override
    public boolean containsValue(Object value) {
        return internalMap.containsValue(value);
    }

    @Override
    public V get(Object key) {
        return internalMap.get(key);
    }

    @Override
    public V put(K key, V value) {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            // 拷贝一份
            Map<K, V> newMap = new HashMap<>(internalMap);
            V val = newMap.put(key, value);

            // 设置为新的
            internalMap = newMap;
            return val;
        } finally {
            lock.unlock();
        }
    }

    @Override
    public V remove(Object key) {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            // 拷贝一份
            Map<K, V> newMap = new HashMap<>(internalMap);
            V val = newMap.remove(key);

            // 设置为新的
            internalMap = newMap;
            return val;
        } finally {
            lock.unlock();
        }
    }

    @Override
    public void putAll(Map<? extends K, ? extends V> m) {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            // 拷贝一份
            Map<K, V> newMap = new HashMap<>(internalMap);
            newMap.putAll(m);

            // 设置为新的
            internalMap = newMap;
        } finally {
            lock.unlock();
        }
    }

    @Override
    public void clear() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            internalMap.clear();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public Set<K> keySet() {
        return internalMap.keySet();
    }

    @Override
    public Collection<V> values() {
        return internalMap.values();
    }

    @Override
    public Set<Entry<K, V>> entrySet() {
        return internalMap.entrySet();
    }

}
```

# 小结

这个简易版本的 COW HashMap 只是老马的一个简单实践，还有很多可以改进的饿地方。

各位小伙伴感兴趣的话，可以利用 COW 这种思想，事项更多属于自己的 COW 集合。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk8

* any list
{:toc}
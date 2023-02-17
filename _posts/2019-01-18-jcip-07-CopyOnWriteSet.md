---
layout: post
title:  JCIP-07-CopyOnWriteArraySet 入门使用及源码详解 
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, sh]
published: true
---

# 问题

- 是什么？

- 有什么优缺点？

- 为什么性能高？原理是什么？

- 源码阅读

- 设计的启发

# CopyOnWriteArraySet

## 官方定义

[CopyOnWriteArraySet](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CopyOnWriteArraySet.html) 是一个使用内部CopyOnWriteArrayList进行所有操作的Set。

### 特性

因此，它具有相同的基本属性：

1. 它最适合于集大小通常保持较小的应用程序，只读操作大大超过了可变操作，并且您需要防止遍历期间线程之间的干扰。

2. 这是线程安全的。

3. 可变操作（添加，设置，删除等）非常昂贵，因为它们通常需要复制整个基础数组。

4. 迭代器不支持可变删除操作。

5. 通过迭代器的遍历速度很快，并且不会遇到其他线程的干扰。 迭代器在构造迭代器时依赖于数组的不变快照。

6. 样本用法。 

## 入门例子

### 读写方法

```java
/**
 * 读线程
 */
private static class ReadTask implements Runnable {
    Set<String> set;
    public ReadTask(Set<String> set) {
        this.set = set;
    }
    public void run() {
        System.out.println(set);
    }
}

/**
 * 写线程
 */
private static class WriteTask implements Runnable {
    private Set<String> set;
    private String value;
    public WriteTask(Set<String> set, String value) {
        this.set = set;
        this.value = value;
    }
    public void run() {
        set.remove(value);
    }
}
```

### 测试代码

```java
public static void main(String[] args) {
    final int NUM = 5;
    Set<String> set = new CopyOnWriteArraySet<>();
    for (int i = 0; i < NUM; i++) {
        set.add("main_" + i);
    }
    ExecutorService executorService = Executors.newFixedThreadPool(NUM);
    for (int i = 0; i < NUM; i++) {
        executorService.execute(new WriteTask(set, "main_" + i));
        executorService.execute(new ReadTask(set));
    }
    executorService.shutdown();
}
```

日志输出如下：

```
[main_1, main_2, main_3, main_4]
[main_2, main_3, main_4]
[main_2, main_3, main_4]
[main_3, main_4]
[]
```

ps: 这个结果因为并发的原因，每一次执行的结果可能是不同的。


# 源码解析

## 类定义

继承自抽象类 AbstractSet

```java
public class CopyOnWriteArraySet<E> extends AbstractSet<E>
        implements java.io.Serializable {
    private static final long serialVersionUID = 5457747651344034263L;

    private final CopyOnWriteArrayList<E> al;

}
```

这里有一个私有变量 CopyOnWriteArrayList，正如官方文档中描述的一样，是基于 CopyOnWriteArrayList 实现的。

可见这样源码将会简化很多。

## 构造器

无参构造器比较简单，直接初始化了内部的 CopyOnWriteArrayList。

```java
/**
 * Creates an empty set.
 * @author 老马啸西风
 */
public CopyOnWriteArraySet() {
    al = new CopyOnWriteArrayList<E>();
}

/**
 * Creates a set containing all of the elements of the specified
 * collection.
 *
 * @param c the collection of elements to initially contain
 * @throws NullPointerException if the specified collection is null
 */
public CopyOnWriteArraySet(Collection<? extends E> c) {
    // 如果就是 CopyOnWriteArraySet，直接赋值即可。
    if (c.getClass() == CopyOnWriteArraySet.class) {
        @SuppressWarnings("unchecked") CopyOnWriteArraySet<E> cc =
            (CopyOnWriteArraySet<E>)c;
        al = new CopyOnWriteArrayList<E>(cc.al);
    }
    else {
        al = new CopyOnWriteArrayList<E>();
        // 如果不是，则需要进行去重，只添加不存在的元素。
        al.addAllAbsent(c);
    }
}
```

### addAllAbsent 添加不存在的元素

这个方法是 CopyOnWriteArrayList 类中的一个 public 方法。

```java
public int addAllAbsent(Collection<? extends E> c) {
    // 集合转换为数组
    Object[] cs = c.toArray();
    // 为空，直接返回
    if (cs.length == 0)
        return 0;

    // 获取可重入锁执行加锁操作    
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 获取当前内部的 array 对象
        Object[] elements = getArray();
        int len = elements.length;
        int added = 0;

        // uniquify and compact elements in cs
        // 执行元素去重
        for (int i = 0; i < cs.length; ++i) {
            Object e = cs[i];
            if (indexOf(e, elements, 0, len) < 0 &&
                indexOf(e, cs, 0, added) < 0)
                cs[added++] = e;
        }

        // 将需要添加的元素拷贝到 newElements 数组中。
        if (added > 0) {
            Object[] newElements = Arrays.copyOf(elements, len + added);
            System.arraycopy(cs, 0, newElements, len, added);
            setArray(newElements);
        }
        return added;
    } finally {
        lock.unlock();
    }
}
```

## 添加和删除

这里都是直接调用 COWArrayList 的，所以实现变得非常简洁。

### add 添加元素

```java
public boolean add(E e) {
    return al.addIfAbsent(e);
}
```

```java
/**
 * Appends the element, if not present.
 *
 * @param e element to be added to this list, if absent
 * @return {@code true} if the element was added
 */
public boolean addIfAbsent(E e) {
    Object[] snapshot = getArray();
    return indexOf(e, snapshot, 0, snapshot.length) >= 0 ? false :
        addIfAbsent(e, snapshot);
}
```

元素不存在时，才进行设置。

```java
/**
 * A version of addIfAbsent using the strong hint that given
 * recent snapshot does not contain e.
 *
 * @author 老马啸西风
 */
private boolean addIfAbsent(E e, Object[] snapshot) {
    // 获取可重入锁加锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 获取当前的数组
        Object[] current = getArray();
        int len = current.length;

        // 如果快照和当前数组不一致
        if (snapshot != current) {
            // Optimize for lost race to another addXXX operation
            int common = Math.min(snapshot.length, len);
            // 如果元素发生不一致，且 i 位置的元素等于 e，直接返回 false
            for (int i = 0; i < common; i++)
                if (current[i] != snapshot[i] && eq(e, current[i]))
                    return false;

            // 如果元素已经存在        
            if (indexOf(e, current, common, len) >= 0)
                    return false;
        }

        // 拷贝 current 到 newElements
        Object[] newElements = Arrays.copyOf(current, len + 1);
        newElements[len] = e;
        setArray(newElements);
        return true;
    } finally {
        lock.unlock();
    }
}
```

### remove 移除元素

```java
public boolean remove(Object o) {
    return al.remove(o);
}
```

实现如下：

```java
public boolean remove(Object o) {
    Object[] snapshot = getArray();
    int index = indexOf(o, snapshot, 0, snapshot.length);
    return (index < 0) ? false : remove(o, snapshot, index);
}
```

- indexOf 获取元素下标

```java
private static int indexOf(Object o, Object[] elements,
                           int index, int fence) {
    if (o == null) {
        for (int i = index; i < fence; i++)
            if (elements[i] == null)
                return i;
    } else {
        for (int i = index; i < fence; i++)
            if (o.equals(elements[i]))
                return i;
    }
    return -1;
}
```

- remove 移除元素

```java
/**
 * A version of remove(Object) using the strong hint that given
 * recent snapshot contains o at the given index.
 *
 * @author 老马啸西风
 */
private boolean remove(Object o, Object[] snapshot, int index) {
    // 获取可重入锁加锁
    final ReentrantLock lock = this.lock;
    lock.lock();

    try {
        Object[] current = getArray();
        int len = current.length;

        // 如果快照和当前不一致，则进行处理
        if (snapshot != current) findIndex: {

            // 获取最小的下标
            int prefix = Math.min(index, len);
            for (int i = 0; i < prefix; i++) {
                if (current[i] != snapshot[i] && eq(o, current[i])) {
                    index = i;
                    // 找到对应的 index，跳出循环。
                    break findIndex;
                }
            }

            // 如果 index >= len，直接返回 false
            if (index >= len)
                return false;

            // 如果当前 index 和指定元素相同，跳出循环。
            if (current[index] == o)
                break findIndex;

            // 遍历寻找，没找到，直接返回 false    
            index = indexOf(o, current, index, len);
            if (index < 0)
                return false;
        }

        // 直接进行对象拷贝，设置对应的元素信息。
        Object[] newElements = new Object[len - 1];
        System.arraycopy(current, 0, newElements, 0, index);
        System.arraycopy(current, index + 1,
                         newElements, index,
                         len - index - 1);
        setArray(newElements);
        return true;
    } finally {
        // 最后记得释放锁
        lock.unlock();
    }
}
```

# 小结

COW 这种思想是非常有优秀的，在写少读多的场景，可以通过空间换取时间。

jdk 中通过复用 COWArrayList，大大简化了实现 COWArraySet 的复杂度。

下一节让我一起实现一个属于自己的 CopyOnWriteHashMap 集合。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

《java 并发编程的艺术》

https://my.oschina.net/jielucky/blog/167198

https://blog.csdn.net/maoyuanming0806/article/details/79143692

https://yq.aliyun.com/articles/25507

http://www.dczou.com/viemall/227.html

* any list
{:toc}
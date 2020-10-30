---
layout: post
title:  锁专题（9） PriorityBlockingQueue 优先级阻塞队列源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, queue, data-struct, sf]
published: flase
---

# PriorityBlockingQueue 

## 简介

一个无界BlockingQue，它使用与类PriorityQueue相同的排序规则，并提供阻塞检索操作。

尽管此队列在逻辑上是不受限制的，但是尝试添加可能由于资源耗尽 OutOfMemoryError而失败。

限制如下：

（1）此类不允许使用null元素。

（2）依赖于Comparable的优先级队列也不允许插入不可比较的对象。

## 使用入门

# 源码实现

## 类定义

```java
public class PriorityBlockingQueue<E> extends AbstractQueue<E>
    implements BlockingQueue<E>, java.io.Serializable {
    private static final long serialVersionUID = 5595510919245408276L;
}
```

实现了阻塞队列接口，继承自 AbstractQueue。

## 算法笔记

该实现使用基于数组的二叉堆（binary heap），公共操作受单个锁保护。

但是，调整大小期间的分配使用简单的自旋锁（仅在不持有主锁的情况下使用），以允许获取与分配同时进行。

这避免了等待的消费者的重复推迟和后续元素的建立。

在分配过程中需要回退锁的需求使得不可能像在此类的早期版本中那样简单地将委托的java.util.PriorityQueue操作包装在锁中。

为了保持互操作性，在序列化过程中仍然使用普通的PriorityQueue，它维护兼容性，但代价是瞬时增加一倍的开销。

## 基本属性

```java
/**
 * 默认容量
 */
private static final int DEFAULT_INITIAL_CAPACITY = 11;

/**
 * 最大数组的大小
 */
private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

/**
 * 存储队列元素
 */
private transient Object[] queue;
/**
 * 优先级队列中的元素个数
 */
private transient int size;
/**
 *  比较器
 */
private transient Comparator<? super E> comparator;

/**
 * 最基本的优先级队列
 */
private PriorityQueue<E> q;
```

## 并发控制

```java
/**
 * 可重入锁
 */
private final ReentrantLock lock;
/**
 * notEmpty 的条件
 */
private final Condition notEmpty;
/**
 * Spinlock for allocation, acquired via CAS.
 * 自旋锁
 */
private transient volatile int allocationSpinLock;
```

## 构造器

```java
public PriorityBlockingQueue(int initialCapacity) {
    this(initialCapacity, null);
}

public PriorityBlockingQueue(int initialCapacity,
                             Comparator<? super E> comparator) {
    if (initialCapacity < 1)
        throw new IllegalArgumentException();
    this.lock = new ReentrantLock();
    this.notEmpty = lock.newCondition();
    this.comparator = comparator;
    this.queue = new Object[initialCapacity];
}
```

最基本的 2 个构造器，主要是对内部变量的初始化。

当然，还可以根据集合进行队列的初始化：

```java
public PriorityBlockingQueue(Collection<? extends E> c) {
    this.lock = new ReentrantLock();
    this.notEmpty = lock.newCondition();

    boolean heapify = true; // true if not known to be in heap order
    boolean screen = true;  // true if must screen for nulls
    
    // 如果为 SortedSet，则说明不需要 heapify
    if (c instanceof SortedSet<?>) {
        SortedSet<? extends E> ss = (SortedSet<? extends E>) c;
        this.comparator = (Comparator<? super E>) ss.comparator();
        heapify = false;
    }
    // 如果就是优先级阻塞队列，则进行转换的处理就行
    else if (c instanceof PriorityBlockingQueue<?>) {
        PriorityBlockingQueue<? extends E> pq =
            (PriorityBlockingQueue<? extends E>) c;
        this.comparator = (Comparator<? super E>) pq.comparator();
        screen = false;
        if (pq.getClass() == PriorityBlockingQueue.class) // exact match
            heapify = false;
    }

    // 数组及其长度
    Object[] a = c.toArray();
    int n = a.length;

    // 实现数组的转换处理
    // If c.toArray incorrectly doesn't return Object[], copy it.
    if (a.getClass() != Object[].class)
        a = Arrays.copyOf(a, n, Object[].class);
    if (screen && (n == 1 || this.comparator != null)) {

        // 这里添加了元素不能为 null 的校验
        for (int i = 0; i < n; ++i)
            if (a[i] == null)
                throw new NullPointerException();
    }
    this.queue = a;
    this.size = n;

    // 执行 heapify 处理
    if (heapify)
        heapify();
}
```

### heapify 实现

```java
/**
 * Establishes the heap invariant (described above) in the entire tree,
 * assuming nothing about the order of the elements prior to the call.
 */
private void heapify() {
    Object[] array = queue;
    int n = size;

    // 这里使用位移运算，找到一半的位置。
    int half = (n >>> 1) - 1;

    // 通过是否有比较器，选择不同的实现方法。
    Comparator<? super E> cmp = comparator;
    if (cmp == null) {
        for (int i = half; i >= 0; i--)
            siftDownComparable(i, (E) array[i], array, n);
    }
    else {
        for (int i = half; i >= 0; i--)
            siftDownUsingComparator(i, (E) array[i], array, n, cmp);
    }
}
```

- siftDownComparable

```java
/**
 * Inserts item x at position k, maintaining heap invariant by
 * demoting x down the tree repeatedly until it is less than or
 * equal to its children or is a leaf.
 *
 * 在 k 位置插入元素 x。


 * @param k the position to fill
 * @param x the item to insert
 * @param array the heap array
 * @param n heap size
 */
private static <T> void siftDownComparable(int k, T x, 
                                           Object[] array,
                                           int n) {
    if (n > 0) {
        Comparable<? super T> key = (Comparable<? super T>)x;
        int half = n >>> 1;           // loop while a non-leaf

        // 如果不是叶子节点，就一直执行循环。
        while (k < half) {
            // 左边节点是最小的。
            int child = (k << 1) + 1; // assume left child is least
            Object c = array[child];
            int right = child + 1;
            if (right < n &&
                ((Comparable<? super T>) c).compareTo((T) array[right]) > 0)
                c = array[child = right];
            if (key.compareTo((T) c) <= 0)
                break;
            array[k] = c;
            k = child;
        }

        array[k] = key;
    }
}
```

TODO... 二叉堆 + 优先级队列 + 排序









# 小结


希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[DelayQueue 的使用](https://blog.csdn.net/hsqingwei/article/details/88850835)

[Java延时队列DelayQueue的使用](https://my.oschina.net/lujianing/blog/705894)

* any list
{:toc}
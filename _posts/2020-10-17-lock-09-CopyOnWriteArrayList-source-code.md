---
layout: post
title:  锁专题（9） CopyOnWriteArrayList源码深度解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: false
---

# CopyOnWriteArrayList

## 简介

ArrayList 的线程安全变体，其中所有可变操作 add/set 都通过对基础数组进行全新复制来实现。

通常这样做的成本太高，但是在**遍历操作的数量远远超过变更的情况下**，它可能比其他方法更有效，并且在您无法或不想同步遍历而又需要防止并发线程之间的干扰时很有用。

“快照”样式的迭代器方法在创建迭代器时使用对数组状态的引用。

此数组在迭代器的生命周期内永不更改，因此不会发生干扰，并且保证迭代器不会抛出 ConcurrentModificationException。

自创建迭代器以来，该迭代器将不会反映对该列表的添加，删除或更改。

不支持迭代器本身的元素更改操作 remove/set/add，这些方法抛出 UnsupportedOperationException。

允许所有元素，包括null。

允许所有元素，包括null。

内存一致性影响：与其他并发集合一样，在将对象放入 CopyOnWriteArrayList 中之前，线程中的操作发生在从另一个线程中的 CopyOnWriteArrayList 中访问或删除该元素之后的操作之前。

# 源码解读

## 类定义

```java
public class CopyOnWriteArrayList<E>
    implements List<E>, RandomAccess, Cloneable, java.io.Serializable {
    private static final long serialVersionUID = 8673264195747942595L;
    }
```

实现了最基本的 List 接口。


## 属性

我们看到前几次反复提及的 ReentrantLock 可重入锁。

array 比较好理解，以前的 List 也是通过数组实现的。

```java
/** The lock protecting all mutators */
final transient ReentrantLock lock = new ReentrantLock();

/** The array, accessed only via getArray/setArray. */
private transient volatile Object[] array;
/**
 * Gets the array.  Non-private so as to also be accessible
 * from CopyOnWriteArraySet class.
 */
final Object[] getArray() {
    return array;
}
/**
 * Sets the array.
 */
final void setArray(Object[] a) {
    array = a;
}
```

## 构造器

```java
/**
 * Creates an empty list.
 */
public CopyOnWriteArrayList() {
    setArray(new Object[0]);
}

/**
 * Creates a list containing the elements of the specified
 * collection, in the order they are returned by the collection's
 * iterator.
 *
 * @param c the collection of initially held elements
 * @throws NullPointerException if the specified collection is null
 */
public CopyOnWriteArrayList(Collection<? extends E> c) {
    Object[] elements;
    if (c.getClass() == CopyOnWriteArrayList.class)
        elements = ((CopyOnWriteArrayList<?>)c).getArray();
    else {
        elements = c.toArray();
        // c.toArray might (incorrectly) not return Object[] (see 6260652)
        if (elements.getClass() != Object[].class)
            elements = Arrays.copyOf(elements, elements.length, Object[].class);
    }
    setArray(elements);
}

/**
 * Creates a list holding a copy of the given array.
 *
 * @param toCopyIn the array (a copy of this array is used as the
 *        internal array)
 * @throws NullPointerException if the specified array is null
 */
public CopyOnWriteArrayList(E[] toCopyIn) {
    setArray(Arrays.copyOf(toCopyIn, toCopyIn.length, Object[].class));
}
```

这几种构造器都是统一调用的 `setArray` 方法：

```java
/**
 * Sets the array.
 */
final void setArray(Object[] a) {
    array = a;
}
```

这个方法非常简单，就是初始化对应的数组信息。


## 核心方法

我大概看了下，很多方法和以前大同小异，我们来重点关注下几个修改元素值的方法：

### set

方法通过 ReentrantLock 可重入锁控制加锁和解锁。

这里最巧妙的地方在于，首先会判断指定 index 的值是否和预期值相同。

按理说相同，是可以不进行更新的，这样性能更好；不过 jdk 中还是会进行一次设置。

如果值不同，则会对原来的 array 进行拷贝，然后更新，最后重新设置。

这样做的好处就是写是不阻塞读的，缺点就是比较浪费内存，拷贝数组也是要花时间的。

```java
/**
 * Replaces the element at the specified position in this list with the
 * specified element.
 *
 * @throws IndexOutOfBoundsException {@inheritDoc}
 */
public E set(int index, E element) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        E oldValue = get(elements, index);
        if (oldValue != element) {
            int len = elements.length;
            Object[] newElements = Arrays.copyOf(elements, len);
            newElements[index] = element;
            setArray(newElements);
        } else {
            // 不是完全禁止操作； 确保可变的写语义
            // Not quite a no-op; ensures volatile write semantics
            setArray(elements);
        }
        return oldValue;
    } finally {
        lock.unlock();
    }
}
```

ps: 这里的所有变更操作是互斥的。

### add

```java
/**
 * Appends the specified element to the end of this list.
 *
 * @param e element to be appended to this list
 * @return {@code true} (as specified by {@link Collection#add})
 */
public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        int len = elements.length;
        Object[] newElements = Arrays.copyOf(elements, len + 1);
        newElements[len] = e;
        setArray(newElements);
        return true;
    } finally {
        lock.unlock();
    }
}
```

也是通过 ReentrantLock 进行加锁。

这里比起更新更加简单直接，因为是添加元素，所以新数组的长度直接+1。

jdk 中数组的这种复制都是使用的 Arrays.copy 方法，这个以前实测，性能还是不错的。

### add(int, E)

```java
/**
 * Inserts the specified element at the specified position in this
 * list. Shifts the element currently at that position (if any) and
 * any subsequent elements to the right (adds one to their indices).
 *
 * @throws IndexOutOfBoundsException {@inheritDoc}
 */
public void add(int index, E element) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        int len = elements.length;

        // 越界校验
        if (index > len || index < 0)
            throw new IndexOutOfBoundsException("Index: "+index+
                                                ", Size: "+len);
        Object[] newElements;
        int numMoved = len - index;

        // 如果是放在数组的最后，其实就等价于上面的 add 方法了。
        if (numMoved == 0)
            newElements = Arrays.copyOf(elements, len + 1);
        else {
            // 如果元素不是在最后，就从两边开始复制即可：

            //0...index-1
            //index+1..len

            newElements = new Object[len + 1];
            System.arraycopy(elements, 0, newElements, 0, index);
            System.arraycopy(elements, index, newElements, index + 1,
                             numMoved);
        }
        
        // 统一设置 index 位置的元素信息
        newElements[index] = element;
        setArray(newElements);
    } finally {
        lock.unlock();
    }
}
```

### remove 删除元素

```java
/**
 * Removes the element at the specified position in this list.
 * Shifts any subsequent elements to the left (subtracts one from their
 * indices).  Returns the element that was removed from the list.
 *
 * @throws IndexOutOfBoundsException {@inheritDoc}
 */
public E remove(int index) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        int len = elements.length;
        E oldValue = get(elements, index);
        int numMoved = len - index - 1;

        // 如果删除最后一个元素，直接从 0..len-1 进行拷贝即可。
        if (numMoved == 0)
            setArray(Arrays.copyOf(elements, len - 1));
        else {
            // 新的数组比原来长度-1
            Object[] newElements = new Object[len - 1];

            //0...index-1 拷贝
            //indx+1...len-1 拷贝
            System.arraycopy(elements, 0, newElements, 0, index);
            System.arraycopy(elements, index + 1, newElements, index,
                             numMoved);
            setArray(newElements);
        }
        return oldValue;
    } finally {
        lock.unlock();
    }
}
```

删除元素实际上和添加元素的流程是类似的。

不过很奇怪，没有做越界判断？

# 迭代器

## 说明

COWList 的迭代器和常规的 ArrayList 迭代器还是有差异的，我们以前可能会被问过，一边遍历一边删除如何实现？

答案可能就是 Iterator。

但是 COW 的 Iterator 恰恰是不能支持变更的，个人理解是为了保证并发只在上面提及的几个变更中控制。


## 实现

### 迭代器定义

```java
static final class COWIterator<E> implements ListIterator<E> {
        /** Snapshot of the array */
        private final Object[] snapshot;
        /** Index of element to be returned by subsequent call to next.  */
        private int cursor;

        private COWIterator(Object[] elements, int initialCursor) {
            cursor = initialCursor;
            snapshot = elements;
        }
}
```

### 基础方法

这里提供了一些基础的最常用的方法。

```java
public boolean hasNext() {
    return cursor < snapshot.length;
}
public boolean hasPrevious() {
    return cursor > 0;
}
@SuppressWarnings("unchecked")
public E next() {
    if (! hasNext())
        throw new NoSuchElementException();
    return (E) snapshot[cursor++];
}
@SuppressWarnings("unchecked")
public E previous() {
    if (! hasPrevious())
        throw new NoSuchElementException();
    return (E) snapshot[--cursor];
}
public int nextIndex() {
    return cursor;
}
public int previousIndex() {
    return cursor-1;
}
```

### 不支持的操作

```java
public void remove() {
    throw new UnsupportedOperationException();
}
public void set(E e) {
    throw new UnsupportedOperationException();
}
public void add(E e) {
    throw new UnsupportedOperationException();
}

@Override
public void forEachRemaining(Consumer<? super E> action) {
    Objects.requireNonNull(action);
    Object[] elements = snapshot;
    final int size = elements.length;
    for (int i = cursor; i < size; i++) {
        @SuppressWarnings("unchecked") E e = (E) elements[i];
        action.accept(e);
    }
    cursor = size;
}
```

# 小结

COW 这种思想是非常有优秀的，在写少读多的场景，可以通过空间换取时间。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk8 源码。

* any list
{:toc}
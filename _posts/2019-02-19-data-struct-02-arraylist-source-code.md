---
layout: post
title: 数据结构 02 ArrayList 源码分析
date:  2019-2-19 14:50:42 +0800
categories: [Data-Struct]
tags: [data-struct, list, source-code, sh]
published: true
---

# ArrayList

以前学习数据结构的时候，自己通过实现过 ArrayList。

但是 jdk 中的源码没有仔细研读过。

本篇查缺补漏，好好学习一下。

> jdk 版本为 11

## 类定义

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
```

继承自 AbstractList 抽象类。

实现了几个接口 List, RandomAccess, Cloneable, java.io.Serializable。

### RandomAccess 接口

其他几个并不陌生，我们看一下 RandomAccess

```java
public interface RandomAccess {
}
```

没有任何方法和属性，这个类只是用来标识一个实现方法，是否可以 O(1) 获取属性。

相比较而言，LinkedList 就不支持，也没有实现这个接口。

PS: 感觉这里应该换成注解等更加合理。

### AbstractList 抽象父类

大部分实现应该都在 AbstractList 中。

为了保障阅读的流畅性，我们把 AbstractList 单独放在一篇文章中。

便于阅读和复用。

## 属性

```java
   // 默认的容量大小     
   private static final int DEFAULT_CAPACITY = 10;

    /**
     * Shared empty array instance used for empty instances.
     * 空对象使用的数组
     */
    private static final Object[] EMPTY_ELEMENTDATA = {};

    /**
     * Shared empty array instance used for default sized empty instances. We
     * distinguish this from EMPTY_ELEMENTDATA to know how much to inflate when
     * first element is added.
     * 
     * 用于默认大小的空实例的共享空数组实例。 我们将其与 EMPTY_ELEMENTDATA 区分开来，以了解添加第一个元素时要膨胀多少。
     */
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    /**
     * The array buffer into which the elements of the ArrayList are stored.
     * The capacity of the ArrayList is the length of this array buffer. Any
     * empty ArrayList with elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA
     * will be expanded to DEFAULT_CAPACITY when the first element is added.
     * 
     * 存储 ArrayList 元素的数组缓冲区。ArrayList 的容量就是这个数组缓冲区的长度。
     * 添加第一个元素时，任何具有 elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA 的空 ArrayList 都将扩展为 DEFAULT_CAPACITY。
     */
    transient Object[] elementData; // non-private to simplify nested class access

    /**
     * The size of the ArrayList (the number of elements it contains).
     *
     * 数组大小
     * @serial
     */
    private int size;

     /**
     * The maximum size of array to allocate (unless necessary).
     * Some VMs reserve some header words in an array.
     * Attempts to allocate larger arrays may result in
     * OutOfMemoryError: Requested array size exceeds VM limit
     * 
     * 最大的申请内存数量，但是实际上应该不会有这么大，除非程序有问题。
     */
    private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

```

## 构造器

构造器的方法实际上不算多，比如就没有基于数组的。

不过有 Arrays.asList(...) 可以替代。

```java
   public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        }
    }

    /**
     * Constructs an empty list with an initial capacity of ten.
     */
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }

    /**
     * Constructs a list containing the elements of the specified
     * collection, in the order they are returned by the collection's
     * iterator.
     *
     * @param c the collection whose elements are to be placed into this list
     * @throws NullPointerException if the specified collection is null
     */
    public ArrayList(Collection<? extends E> c) {
       // 这里还是挺有趣的，不是遍历这个集合，而是把集合转化为数组。难道是 Arrays.copy 更快吗？ 
        Object[] a = c.toArray();
        if ((size = a.length) != 0) {
            if (c.getClass() == ArrayList.class) {
                elementData = a;
            } else {
                elementData = Arrays.copyOf(a, size, Object[].class);
            }
        } else {
            // replace with empty array.
            elementData = EMPTY_ELEMENTDATA;
        }
    }
```

# 核心方法

其他的方法比较多。我们主要看一下 list 的 add/set/get/remove 这几个方法。

## add

```java
public boolean add(E e) {
    modCount++;
    add(e, elementData, size);
    return true;
}
```

可以发现，这里变化的是 modCount 变量。

### modCount 

这个是用来记录 list 的变化次数。

```java
    /**
     * The number of times this list has been <i>structurally modified</i>.
     * Structural modifications are those that change the size of the
     * list, or otherwise perturb it in such a fashion that iterations in
     * progress may yield incorrect results.
     *
     * <p>This field is used by the iterator and list iterator implementation
     * returned by the {@code iterator} and {@code listIterator} methods.
     * If the value of this field changes unexpectedly, the iterator (or list
     * iterator) will throw a {@code ConcurrentModificationException} in
     * response to the {@code next}, {@code remove}, {@code previous},
     * {@code set} or {@code add} operations.  This provides
     * <i>fail-fast</i> behavior, rather than non-deterministic behavior in
     * the face of concurrent modification during iteration.
     *
     * <p><b>Use of this field by subclasses is optional.</b> If a subclass
     * wishes to provide fail-fast iterators (and list iterators), then it
     * merely has to increment this field in its {@code add(int, E)} and
     * {@code remove(int)} methods (and any other methods that it overrides
     * that result in structural modifications to the list).  A single call to
     * {@code add(int, E)} or {@code remove(int)} must add no more than
     * one to this field, or the iterators (and list iterators) will throw
     * bogus {@code ConcurrentModificationExceptions}.  If an implementation
     * does not wish to provide fail-fast iterators, this field may be
     * ignored.
     */
    protected transient int modCount = 0;
```

### add(e, elementData, size);

这个是核心的方法。

```java
private void add(E e, Object[] elementData, int s) {
    // 触发长度    
    if (s == elementData.length)
        // 扩容
        elementData = grow();

    // 设置元素     
    elementData[s] = e;
    // 大小加1
    size = s + 1;
}
```

比较核心的就是 grow 方法。

```java
/**
 * Increases the capacity to ensure that it can hold at least the
 * number of elements specified by the minimum capacity argument.
 *
 * @param minCapacity the desired minimum capacity
 * @throws OutOfMemoryError if minCapacity is less than zero
 */
private Object[] grow(int minCapacity) {
    return elementData = Arrays.copyOf(elementData, newCapacity(minCapacity));
}
```

可以发现，其实 java 中并不是使用数组的移动来实现元素的添加。

而是直接通过 Arrays.copy，这样性能会更好。

```java
/**
 * Returns a capacity at least as large as the given minimum capacity.
 * Returns the current capacity increased by 50% if that suffices.
 * Will not return a capacity greater than MAX_ARRAY_SIZE unless
 * the given minimum capacity is greater than MAX_ARRAY_SIZE.
 *
 * @param minCapacity the desired minimum capacity
 * @throws OutOfMemoryError if minCapacity is less than zero
 */
private int newCapacity(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);

    if (newCapacity - minCapacity <= 0) {
        if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
            return Math.max(DEFAULT_CAPACITY, minCapacity);
        if (minCapacity < 0) // overflow
            throw new OutOfMemoryError();
        return minCapacity;
    }

    return (newCapacity - MAX_ARRAY_SIZE <= 0)
        ? newCapacity
        : hugeCapacity(minCapacity);
}
```

newCapacity 默认应该是 oldCapacity 的 3  倍。（原始 + 原始 *2）

但是这里就需要考虑一些越界的问题。

如果 newCapacity 没超过 MAX_ARRAY_SIZE，则直接返回 newCapacity；

或者执行 `hugeCapacity(minCapacity)` 方法。

### hugeCapacity(minCapacity)

也就是如果超过了最大的值，怎么办？

```java
private static int hugeCapacity(int minCapacity) {
    // 扩容以后，超过了 int 上限
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    // 超过了 int 的限制-8，默认为整形的最大值。
    return (minCapacity > MAX_ARRAY_SIZE)
        ? Integer.MAX_VALUE
        : MAX_ARRAY_SIZE;
}
```

## set-修改

修改方法特别简单。

```java
public E set(int index, E element) {
    // 校验指定元素的范围    
    Objects.checkIndex(index, size);
    // 获取元素
    E oldValue = elementData(index);
    // 设置元素
    elementData[index] = element;
    // 返回就值
    return oldValue;
}
```

## get 读取

```java
public E get(int index) {
    Objects.checkIndex(index, size);
    return elementData(index);
}
```


## remove

```java
/**
 * Removes the element at the specified position in this list.
 * Shifts any subsequent elements to the left (subtracts one from their
 * indices).
 *
 * @param index the index of the element to be removed
 * @return the element that was removed from the list
 * @throws IndexOutOfBoundsException {@inheritDoc}
 */
public E remove(int index) {
    // 范围校验 
    Objects.checkIndex(index, size);
    final Object[] es = elementData;

    // 获取删除元素
    @SuppressWarnings("unchecked") E oldValue = (E) es[index];

    // 快速删除
    fastRemove(es, index);

    // 范围旧元素
    return oldValue;
}
```

### fastRemove

```java
private void fastRemove(Object[] es, int i) {
    //变化次数+1
    modCount++;
    final int newSize;

    // 这里有一个判断，如果删除的不是最后一个，直接数组拷贝即可。
    if ((newSize = size - 1) > i)
        System.arraycopy(es, i + 1, es, i, newSize - i);
    // 最后一个直接值为空    
    es[size = newSize] = null;
}
```

看的出来，缩容并不会降低数组。

也就是一直扩容到最大，删除完，依然会占用这么多内存。

# 小结

jdk 的源码，其实跟以前学习 c 的时候数据结构的移动差异还是很大的。

# 参考资料 

jdk11

* any list
{:toc}
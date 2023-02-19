---
layout: post
title: 数据结构 03 LinkedList 源码分析
date:  2019-2-19 14:50:42 +0800
categories: [Data-Struct]
tags: [data-struct, list, source-code, sh]
published: true
---

# LinkedList

## 类定义

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable
```

和 ArrayList 的接口实现还是有区别的。

实现了 Deque 接口，继承自 AbstractSequentialList。

## Deque 接口

```java
/**
 * A linear collection that supports element insertion and removal at
 * both ends.  The name <i>deque</i> is short for "double ended queue"
 * and is usually pronounced "deck".  Most {@code Deque}
 * implementations place no fixed limits on the number of elements
 * they may contain, but this interface supports capacity-restricted
 * deques as well as those with no fixed size limit.
 *
 * <p>This interface defines methods to access the elements at both
 * ends of the deque.  Methods are provided to insert, remove, and
 * examine the element.  Each of these methods exists in two forms:
 * one throws an exception if the operation fails, the other returns a
 * special value (either {@code null} or {@code false}, depending on
 * the operation).  The latter form of the insert operation is
 * designed specifically for use with capacity-restricted
 * {@code Deque} implementations; in most implementations, insert
 * operations cannot fail.
 */
public interface Deque<E> extends Queue<E> {
```

double ended queue：支持线性时间在两头改变集合。

## AbstractSequentialList

```java
/**
 * This class provides a skeletal implementation of the <tt>List</tt>
 * interface to minimize the effort required to implement this interface
 * backed by a "sequential access" data store (such as a linked list).  For
 * random access data (such as an array), <tt>AbstractList</tt> should be used
 * in preference to this class.<p>
 *
 * This class is the opposite of the <tt>AbstractList</tt> class in the sense
 * that it implements the "random access" methods (<tt>get(int index)</tt>,
 * <tt>set(int index, E element)</tt>, <tt>add(int index, E element)</tt> and
 * <tt>remove(int index)</tt>) on top of the list's list iterator, instead of
 * the other way around.<p>
 *
 * To implement a list the programmer needs only to extend this class and
 * provide implementations for the <tt>listIterator</tt> and <tt>size</tt>
 * methods.  For an unmodifiable list, the programmer need only implement the
 * list iterator's <tt>hasNext</tt>, <tt>next</tt>, <tt>hasPrevious</tt>,
 * <tt>previous</tt> and <tt>index</tt> methods.<p>
 *
 * For a modifiable list the programmer should additionally implement the list
 * iterator's <tt>set</tt> method.  For a variable-size list the programmer
 * should additionally implement the list iterator's <tt>remove</tt> and
 * <tt>add</tt> methods.<p>
 *
 * The programmer should generally provide a void (no argument) and collection
 * constructor, as per the recommendation in the <tt>Collection</tt> interface
 * specification.<p>
 */
public abstract class AbstractSequentialList<E> extends AbstractList<E> {
```

这个的访问性能是 O(N) 的 ，相比于 arraylist 的 O(1) 访问性能。

基于迭代器，遍历整个 list，进行相关处理。


# 内部变量

```java
// 链表大小
transient int size = 0;

/**
 * Pointer to first node.
 * Invariant: (first == null && last == null) ||
 *            (first.prev == null && first.item != null)

 * 首节点
 */
transient Node<E> first;
/**
 * Pointer to last node.
 * Invariant: (first == null && last == null) ||
 *            (last.next == null && last.item != null)
 *
 * 尾节点
 */
transient Node<E> last;
```

## Node 节点

定义如下：

```java
private static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;

    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

linkedlist 中的节点是双向的。

# 构造器

```java
/**
 * Constructs an empty list.
 */
public LinkedList() {
}

/**
 * Constructs a list containing the elements of the specified
 * collection, in the order they are returned by the collection's
 * iterator.
 *
 * @param  c the collection whose elements are to be placed into this list
 * @throws NullPointerException if the specified collection is null
 */
public LinkedList(Collection<? extends E> c) {
    this();
    addAll(c);
}
```

## addAll()

```java
public boolean addAll(Collection<? extends E> c) {
    return addAll(size, c);
}
```

具体实现如下：

```java
public boolean addAll(int index, Collection<? extends E> c) {
    // 检测下标
    checkPositionIndex(index);

    // 转化为数组
    Object[] a = c.toArray();

    // 数组为0，直接返回 false
    int numNew = a.length;
    if (numNew == 0)
        return false;

    // 声明两个节点，前继和后继    
    Node<E> pred, succ;

    // 如果是列表元素的末尾
    if (index == size) {
        succ = null;
        pred = last;
    } else {
        succ = node(index);
        pred = succ.prev;
    }

    // 遍历元素，执行插入操作。
    for (Object o : a) {
        @SuppressWarnings("unchecked") E e = (E) o;
        Node<E> newNode = new Node<>(pred, e, null);

        // 处理前继节点为 null 的情况。
        if (pred == null)
            first = newNode;
        else
            pred.next = newNode;
        pred = newNode;
    }

    // 如果后继为空
    if (succ == null) {
        last = pred;
    } else {
        pred.next = succ;
        succ.prev = pred;
    }
    
    // 更新大小
    // 更新变化次数
    size += numNew;
    modCount++;
    return true;
}
```

## 检测下标 checkPositionIndex

```java
private void checkPositionIndex(int index) {
    if (!isPositionIndex(index))
        throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
}

/**
 * Tells if the argument is the index of a valid position for an
 * iterator or an add operation.
 */
private boolean isPositionIndex(int index) {
    return index >= 0 && index <= size;
}
```

直接将 index 和数组的大小进行范围比较。

# 核心方法

## add

在指定位置插入一个元素：

```java
public void add(int index, E element) {
    // 位置校验
    checkPositionIndex(index);

    // 等于最后
    if (index == size)
        linkLast(element);
    else
        linkBefore(element, node(index));
}
```

### node(index)

获取指定位置的元素，实现如下：

```java
/**
 * Returns the (non-null) Node at the specified element index.
 * 
 * 如果超过了范围呢？
 */
Node<E> node(int index) {
    // assert isElementIndex(index);

    // 这里因为是双向节点。
    // 所以只判断了一半的位置，如果在前一半，从前往后比较快；反之，则从后往前遍历比较快。
    // 也就是 TC 为 O(N/2)
    if (index < (size >> 1)) {
        Node<E> x = first;
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

### linkLast

```java
/**
 * Links e as last element.
 */
void linkLast(E e) {
    // 最后一个元素
    final Node<E> l = last;
    final Node<E> newNode = new Node<>(l, e, null);
    last = newNode;

    // 处理为空的情况
    if (l == null)
        first = newNode;
    else
        l.next = newNode;

    // 更新 size + modCount    
    size++;
    modCount++;
}
```

### linkBefore

```java
/**
 * Inserts element e before non-null Node succ.
 */
void linkBefore(E e, Node<E> succ) {
    // assert succ != null;
    final Node<E> pred = succ.prev;
    final Node<E> newNode = new Node<>(pred, e, succ);
    succ.prev = newNode;

    // 前继为空
    if (pred == null)
        first = newNode;
    else
        // 新的节点放在前继节点之后
        pred.next = newNode;
    size++;
    modCount++;
}
```

## set

set 的思路其实非常简单粗暴，找到对应的节点，然后直接更换即可。

最后返回以前的节点。

```java
/**
 * Replaces the element at the specified position in this list with the
 * specified element.
 *
 * @param index index of the element to replace
 * @param element element to be stored at the specified position
 * @return the element previously at the specified position
 * @throws IndexOutOfBoundsException {@inheritDoc}
 */
public E set(int index, E element) {
    checkElementIndex(index);
    Node<E> x = node(index);
    E oldVal = x.item;
    x.item = element;
    return oldVal;
}
```

## get

获取方法对比之下就非常的简单。

校验范围，范围节点元素。

```java
public E get(int index) {
    checkElementIndex(index);
    return node(index).item;
}
```

## remove

指定索引删除一个元素：

```java
/**
 * Removes the element at the specified position in this list.  Shifts any
 * subsequent elements to the left (subtracts one from their indices).
 * Returns the element that was removed from the list.
 *
 * @param index the index of the element to be removed
 * @return the element previously at the specified position
 * @throws IndexOutOfBoundsException {@inheritDoc}
 */
public E remove(int index) {
    // 校验范围
    checkElementIndex(index);
    // 取消对应节点
    return unlink(node(index));
}
```

### unlink

`a<=>b<=>c`，如果删除 b，就会变成 `a<=>c`

```java
/**
 * Unlinks non-null node x.
 */
E unlink(Node<E> x) {
    // assert x != null;
    final E element = x.item;
    final Node<E> next = x.next;
    final Node<E> prev = x.prev;
    if (prev == null) {
        first = next;
    } else {
        prev.next = next;
        x.prev = null;
    }
    if (next == null) {
        last = prev;
    } else {
        next.prev = prev;
        x.next = null;
    }
    x.item = null;
    size--;
    modCount++;
    return element;
}
```

# 小结

比较有收获的就是获取元素时，根据下标的位置，判断是在前面还是在后面。

从而节省大概一半的时间。

# 参考资料 

jdk8

* any list
{:toc}
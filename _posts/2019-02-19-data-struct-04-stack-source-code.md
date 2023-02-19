---
layout: post
title: 数据结构 04 Stack 源码分析
date:  2019-2-19 14:50:42 +0800
categories: [Data-Struct]
tags: [data-struct, source-code, sh]
published: true
---

# Stack

## 类定义

```java
/**
 * The <code>Stack</code> class represents a last-in-first-out
 * (LIFO) stack of objects. It extends class <tt>Vector</tt> with five
 * operations that allow a vector to be treated as a stack. The usual
 * <tt>push</tt> and <tt>pop</tt> operations are provided, as well as a
 * method to <tt>peek</tt> at the top item on the stack, a method to test
 * for whether the stack is <tt>empty</tt>, and a method to <tt>search</tt>
 * the stack for an item and discover how far it is from the top.
 * <p>
 * When a stack is first created, it contains no items.
 *
 * <p>A more complete and consistent set of LIFO stack operations is
 * provided by the {@link Deque} interface and its implementations, which
 * should be used in preference to this class.  For example:
 * <pre>   {@code
 *   Deque<Integer> stack = new ArrayDeque<Integer>();}</pre>
 *
 * @author  Jonathan Payne
 * @since   JDK1.0
 */
public
class Stack<E> extends Vector<E> {}
```

和 queue 的 FIFO 不同，stack 是 LIFO。

# 核心方法

整体方法也比较简单。

## push

```java
public E push(E item) {
    addElement(item);
    return item;
}
```

PS: 这个方法的返回值还挺有趣的，其实不需要返回。

```java
public synchronized void addElement(E obj) {
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = obj;
}
```


其中 ensureCapacityHelper

```java
private void ensureCapacityHelper(int minCapacity) {
    // overflow-conscious code
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}
```

核心的增长方法：

```java
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + ((capacityIncrement > 0) ?
                                     capacityIncrement : oldCapacity);

    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
        
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);

    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

```java
private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
        MAX_ARRAY_SIZE;
}
```

这个对于内存的处理，和 arraylist 非常类似。

## pop

```java
public synchronized E pop() {
    E       obj;
    int     len = size();

    obj = peek();

    removeElementAt(len - 1);
    return obj;
}
```

### peek

```java
public synchronized E peek() {
    int     len = size();
    if (len == 0)
        throw new EmptyStackException();

    return elementAt(len - 1);
}

public synchronized E elementAt(int index) {
    if (index >= elementCount) {
        throw new ArrayIndexOutOfBoundsException(index + " >= " + elementCount);
    }

    return elementData(index);
}

E elementData(int index) {
    return (E) elementData[index];
}
```

本质上还是使用数组维护数据，直接返回对应 index 的元素。

### removeElementAt

移除指定位置的元素：

```java
public synchronized void removeElementAt(int index) {
    modCount++;
    if (index >= elementCount) {
        throw new ArrayIndexOutOfBoundsException(index + " >= " +
                                                 elementCount);
    }

    else if (index < 0) {
        throw new ArrayIndexOutOfBoundsException(index);
    }

    int j = elementCount - index - 1;

    // 通过数组拷贝，避免元素的移动
    if (j > 0) {
        System.arraycopy(elementData, index + 1, elementData, index, j);
    }

    elementCount--;
    // 指定位置置为 null
    elementData[elementCount] = null; /* to let gc do its work */
}
```

## search

查询一个元素

```java
public synchronized int search(Object o) {
    int i = lastIndexOf(o);

    if (i >= 0) {
        return size() - i;
    }

    return -1;
}

public synchronized int lastIndexOf(Object o) {
    return lastIndexOf(o, elementCount-1);
}

public synchronized int lastIndexOf(Object o, int index) {
    if (index >= elementCount)
        throw new IndexOutOfBoundsException(index + " >= "+ elementCount);

    if (o == null) {
        for (int i = index; i >= 0; i--)
            if (elementData[i]==null)
                return i;
    } else {
        for (int i = index; i >= 0; i--)
            if (o.equals(elementData[i]))
                return i;
    }

    return -1;
}
```

直接遍历整个数组，获取匹配的元素 index。

# 小结

整体实现和 arrayList 非常类似。

# 参考资料 

jdk8

* any list
{:toc}
---
layout: post
title: JUC-02-AtomicReference 对象原子性更新
date:  2019-1-20 14:10:12 +0800
categories: [Concurrency]
tags: [thread, concurrency, juc, sh]
published: true
---

# AtomicReference 介绍

可以原子性更新的引用值。 

# 源码学习

## 类定义

AtomicReference 和 AtomicInteger 比较类似。

都有 Unsafe 属性，和一个对应的值偏移量。

区别就是此处的 value 是通过 `volatile` 关键字修饰的变量。

```java
public class AtomicReference<V> implements java.io.Serializable {
    private static final long serialVersionUID = -1848883965231344442L;

    private static final Unsafe unsafe = Unsafe.getUnsafe();
    private static final long valueOffset;

    static {
        try {
            valueOffset = unsafe.objectFieldOffset
                (AtomicReference.class.getDeclaredField("value"));
        } catch (Exception ex) { throw new Error(ex); }
    }

    private volatile V value;

    /**
     * Creates a new AtomicReference with the given initial value.
     *
     * @param initialValue the initial value
     */
    public AtomicReference(V initialValue) {
        value = initialValue;
    }

    /**
     * Creates a new AtomicReference with null initial value.
     */
    public AtomicReference() {
    }

}
```


## 核心方法


这些方法和 AtomicInteger 类似。

不过实现调用的是 xxxObject 了。

```java
/**
 * Eventually sets to the given value.
 *
 * @param newValue the new value
 * @since 1.6
 */
public final void lazySet(V newValue) {
    unsafe.putOrderedObject(this, valueOffset, newValue);
}
/**
 * Atomically sets the value to the given updated value
 * if the current value {@code ==} the expected value.
 * @param expect the expected value
 * @param update the new value
 * @return {@code true} if successful. False return indicates that
 * the actual value was not equal to the expected value.
 */
public final boolean compareAndSet(V expect, V update) {
    return unsafe.compareAndSwapObject(this, valueOffset, expect, update);
}
/**
 * Atomically sets the value to the given updated value
 * if the current value {@code ==} the expected value.
 *
 * <p><a href="package-summary.html#weakCompareAndSet">May fail
 * spuriously and does not provide ordering guarantees</a>, so is
 * only rarely an appropriate alternative to {@code compareAndSet}.
 *
 * @param expect the expected value
 * @param update the new value
 * @return {@code true} if successful
 */
public final boolean weakCompareAndSet(V expect, V update) {
    return unsafe.compareAndSwapObject(this, valueOffset, expect, update);
}
/**
 * Atomically sets to the given value and returns the old value.
 *
 * @param newValue the new value
 * @return the previous value
 */
@SuppressWarnings("unchecked")
public final V getAndSet(V newValue) {
    return (V)unsafe.getAndSetObject(this, valueOffset, newValue);
}
```

## 更新与获取

### 获取之后更新

```java
/**
 * Atomically updates the current value with the results of
 * applying the given function, returning the previous value. The
 * function should be side-effect-free, since it may be re-applied
 * when attempted updates fail due to contention among threads.
 *
 * @param updateFunction a side-effect-free function
 * @return the previous value
 * @since 1.8
 */
public final V getAndUpdate(UnaryOperator<V> updateFunction) {
    V prev, next;
    do {
        prev = get();
        next = updateFunction.apply(prev);
    } while (!compareAndSet(prev, next));
    return prev;
}
```

这个方法是 jdk1.8 之后添加的，可以设置一个二元的 Function 函数。

不过要求保证方法没有副作用（side-effect-free），因为会执行重试。

### 更新之后获取

和上面的方法类似，唯一的区别就是一个是返回原来的值，这个方法返回的是更新后的值。

```java
/**
 * Atomically updates the current value with the results of
 * applying the given function, returning the updated value. The
 * function should be side-effect-free, since it may be re-applied
 * when attempted updates fail due to contention among threads.
 *
 * @param updateFunction a side-effect-free function
 * @return the updated value
 * @since 1.8
 */
public final V updateAndGet(UnaryOperator<V> updateFunction) {
    V prev, next;
    do {
        prev = get();
        next = updateFunction.apply(prev);
    } while (!compareAndSet(prev, next));
    return next;
}
```

## 制定 CAS 值

### 先获取并设置

这里可以手动指定一个对象值 x，作为 CAS 的比较对象。

这样在实现的时候，提供了更高的灵活性。

```java
/**
 * Atomically updates the current value with the results of
 * applying the given function to the current and given values,
 * returning the previous value. The function should be
 * side-effect-free, since it may be re-applied when attempted
 * updates fail due to contention among threads.  The function
 * is applied with the current value as its first argument,
 * and the given update as the second argument.
 *
 * @param x the update value
 * @param accumulatorFunction a side-effect-free function of two arguments
 * @return the previous value
 * @since 1.8
 */
public final V getAndAccumulate(V x,
                                BinaryOperator<V> accumulatorFunction) {
    V prev, next;
    do {
        prev = get();
        next = accumulatorFunction.apply(prev, x);
    } while (!compareAndSet(prev, next));
    return prev;
}
```

### 先 CAS 再获取值

这个方法和上面的区别就是 CAS 更新之后，返回设置后的值。

```java
/**
 * Atomically updates the current value with the results of
 * applying the given function to the current and given values,
 * returning the updated value. The function should be
 * side-effect-free, since it may be re-applied when attempted
 * updates fail due to contention among threads.  The function
 * is applied with the current value as its first argument,
 * and the given update as the second argument.
 *
 * @param x the update value
 * @param accumulatorFunction a side-effect-free function of two arguments
 * @return the updated value
 * @since 1.8
 */
public final V accumulateAndGet(V x,
                                BinaryOperator<V> accumulatorFunction) {
    V prev, next;
    do {
        prev = get();
        next = accumulatorFunction.apply(prev, x);
    } while (!compareAndSet(prev, next));
    return next;
}
```

# 小结

这个源码阅读，在原来的基础之上变得非常简单。

合抱之木，生于毫末；九层之台，起于累土；千里之行，始于足下。 

* any list
{:toc}
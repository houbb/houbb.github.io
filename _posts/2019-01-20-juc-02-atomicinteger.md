---
layout: post
title: JUC-02-AtomicInterger 原子性整型源码详解
date:  2019-1-20 14:10:12 +0800
categories: [Concurrency]
tags: [thread, concurrency, juc, sh]
published: true
---

# AtomicInterger 介绍

可以原子性更新的 Integer 值，当然这个类并不能完全替代 Integer 对象。

![AtomicInterger](https://p1.pstatp.com/origin/pgc-image/1e4ca429e5c84cfdb74c3b3df127fc90)

## 使用

使用起来还是很方便的。

比如说我们定义一个计数器，使用 AtomicInteger 可以同时兼顾性能与并发安全。

```java
import java.util.concurrent.atomic.AtomicInteger;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class Counter {

    private AtomicInteger c = new AtomicInteger(0);

    /**
     * 递增
     */
    public void increment() {
        c.getAndIncrement();
    }

    /**
     * 获取值
     * @return 值
     */
    public int value() {
        return c.get();
    }

    public static void main(String[] args) throws InterruptedException {
        final Counter counter = new Counter();

        //1000 threads
        for(int i = 0; i < 100 ; i++) {
            new Thread(new Runnable() {
                public void run() {
                    counter.increment();
                }
            }).start();
        }
        Thread.sleep(1000);
        System.out.println("Final number (should be 100): " + counter.value());
    }

}
```

日志输出：

```
Final number (should be 100): 100
```

# AtomicInteger 源码

可恶！这个类使用起来竟然这么方便。

那么李大狗是如何实现的呢？

## 类定义

```java
public class AtomicInteger extends Number implements java.io.Serializable {
    private static final long serialVersionUID = 6214790243416807050L;
}
```

继承自 Number 类，实现了序列化接口。

## 内部属性

这里初始化了 unsafe 变量，用于后面使用 CAS 做变量更新。

```java
// setup to use Unsafe.compareAndSwapInt for updates
private static final Unsafe unsafe = Unsafe.getUnsafe();

// 值的偏移量
private static final long valueOffset;

static {
    try {
        valueOffset = unsafe.objectFieldOffset
            (AtomicInteger.class.getDeclaredField("value"));
    } catch (Exception ex) { throw new Error(ex); }
}

// 定义的变量值
private volatile int value;
```

- objectFieldOffset 方法

这是一个 native 方法，换言之就是直接调用的操作系统，获取到 value 变量的内存偏移量信息。

```java
public native long objectFieldOffset(Field var1);
```

## 构造器

平淡无奇的构造器，用来初始化 value。

当然也可以不指定，不指定的时候默认值是什么呢？

我想各位读者肯定都清楚，不清楚的可以留言区忏悔一下。

```java
/**
 * Creates a new AtomicInteger with the given initial value.
 *
 * @param initialValue the initial value
 */
public AtomicInteger(int initialValue) {
    value = initialValue;
}

/**
 * Creates a new AtomicInteger with initial value {@code 0}.
 */
public AtomicInteger() {
}
```

## 基本的方法

```java
/**
 * Gets the current value.
 *
 * @return the current value
 */
public final int get() {
    return value;
}

/**
 * Sets to the given value.
 *
 * @param newValue the new value
 */
public final void set(int newValue) {
    value = newValue;
}

/**
 * Returns the String representation of the current value.
 * @return the String representation of the current value
 */
public String toString() {
    return Integer.toString(get());
}
/**
 * Returns the value of this {@code AtomicInteger} as an {@code int}.
 */
public int intValue() {
    return get();
}
/**
 * Returns the value of this {@code AtomicInteger} as a {@code long}
 * after a widening primitive conversion.
 * @jls 5.1.2 Widening Primitive Conversions
 */
public long longValue() {
    return (long)get();
}
/**
 * Returns the value of this {@code AtomicInteger} as a {@code float}
 * after a widening primitive conversion.
 * @jls 5.1.2 Widening Primitive Conversions
 */
public float floatValue() {
    return (float)get();
}
/**
 * Returns the value of this {@code AtomicInteger} as a {@code double}
 * after a widening primitive conversion.
 * @jls 5.1.2 Widening Primitive Conversions
 */
public double doubleValue() {
    return (double)get();
}
```

这两个方法和普通类中的 getter/setter等并没有区别，此处不做过多解释。

## 基于 unsafe 的方法

为什么 AtomicInteger 能保持原子性呢？

我们一起来看一下是如何基于 Unsafe 实现原子性的？

### lazySet 惰性设置

```java
/**
 * Eventually sets to the given value.
 *
 * @param newValue the new value
 * @since 1.6
 */
public final void lazySet(int newValue) {
    unsafe.putOrderedInt(this, valueOffset, newValue);
}
```

最终会把值设置为给定的值。这是什么意思？我直接懵了。

其实这个是相对的，我们前面说过，volatile 修饰的变量，修改后可以保证线程间的可见性。但是这个方法，**修改后并不保证线程间的可见性**。

这和以前在网上看到的可不一样，不是说好的 AtomicXXX 都是基于 volatile+cas 实现的吗？这里为什么要反其道而行之呢？

其实是为了性能，lazySet 有自己的应用场景。

高级程序员都知道 volatile 可以保证变量在线程间的可见性，但是这里再问一句，不使用 volatile 修饰就无法保证可见性了吗？

事实上，这里完全可以不用 volatile 变量来修饰这些共享状态，

1. 因为访问共享状态之前先要获得锁, Lock.lock()方法能够获得锁，而获得锁的操作和volatile变量的读操作一样，会强制使CPU缓存失效，强制从内存读取变量。

2. Lock.unlock()方法释放锁时，和写volatile变量一样，会强制刷新CPU写缓冲区，把缓存数据写到主内存

底层也是通过加内存屏障实现的。

而lazySet()优化原理，就是在**不需要让共享变量的修改立刻让其他线程可见的时候，以设置普通变量的方式来修改共享状态，可以减少不必要的内存屏障，从而提高程序执行的效率。**

这个讨论可以参考 stackoverflow 的问题 [AtomicInteger lazySet vs. set](https://stackoverflow.com/questions/1468007/atomicinteger-lazyset-vs-set)


### 原子性设置值

```java
/**
 * Atomically sets to the given value and returns the old value.
 *
 * @param newValue the new value
 * @return the previous value
 */
public final int getAndSet(int newValue) {
    return unsafe.getAndSetInt(this, valueOffset, newValue);
}
```

这个方法实现如下：

```java
public final int getAndSetInt(Object var1, long var2, int var4) {
    int var5;
    do {
        var5 = this.getIntVolatile(var1, var2);
    } while(!this.compareAndSwapInt(var1, var2, var5, var4));
    return var5;
}
```

实际上就是我们常说的 volatile + CAS 实现。

### compareAndSet 比较并且设置

jdk 将 CAS 这个方法暴露给了开发者，不过做了一层封装，让 unsafe 类对使用者不可见。

compareAndSwapInt 这个方法是一个 native 方法，此处不做深入。其他的方法很多都大同小异，所以我们不再赘述。

ps: 很烦，native 方法直接看源码就会变得很麻烦，以后有时间研究下 openJdk 之类的。

```java
/**
 * Atomically sets the value to the given updated value
 * if the current value {@code ==} the expected value.
 *
 * @param expect the expected value
 * @param update the new value
 * @return {@code true} if successful. False return indicates that
 * the actual value was not equal to the expected value.
 */
public final boolean compareAndSet(int expect, int update) {
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}
```

### weakCompareAndSet 

这个方法我觉得也很有趣，弱比较？拿泥搜来。

```java
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
public final boolean weakCompareAndSet(int expect, int update) {
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}
```

我们发现这两个方法在 jdk1.8 中实际上是没有差异的。

底层调用的都是同一个方法：

```java
public final native boolean compareAndSwapInt(Object var1, long var2, int var4, int var5);
```

那区别是什么呢？

于是我就去查了一下，JDK1.9以前，两者底层实现是一样的，并没有严格区分。

JDK 1.9提供了Variable Handles的API，主要是用来取代java.util.concurrent.atomic包以及sun.misc.Unsafe类的功能。

Variable Handles需要依赖jvm的增强及编译器的协助，即需要依赖java语言规范及jvm规范的升级。

VarHandle中compareAndSet和compareAndSet的定义如下：

（1）compareAndSet(Object... args)

```
Atomically sets the value of a variable to the newValue with the memory semantics of set(java.lang.Object...) if the variable's current value, referred to as the witness value, == the expectedValue, as accessed with the memory semantics of getAcquire(java.lang.Object...).
```

（2）weakCompareAndSet(Object... args)

```
Possibly atomically sets the value of a variable to the newValue with the memory semantics of setVolatile(java.lang.Object...) if the variable's current value, referred to as the witness value, == the expectedValue, as accessed with the memory semantics of getVolatile(java.lang.Object...).
```

weakCompareAndSet的描述多了一个单词Possibly，可能的。

weakCompareAndSet有可能不是原子性的去更新值，这取决于虚拟机的实现。

`@HotSpotIntrinsicCandidate` 标注的方法，在HotSpot中都有一套高效的实现，该高效实现基于CPU指令，运行时，HotSpot维护的高效实现会替代JDK的源码实现，从而获得更高的效率。

也就是说HotSpot可能会手动实现这个方法。

```java
@PolymorphicSignature
@HotSpotIntrinsicCandidate
public final native boolean compareAndSet(Object... var1);

@PolymorphicSignature
@HotSpotIntrinsicCandidate
public final native boolean weakCompareAndSet(Object... var1);
```

其实这个方法和上面的 lazySet 有异曲同工之妙。

# 小结

我们对 AtomicInteger 源码进行了初步的分析，底层也确实是依赖 volatile+CAS 实现。

不过发现了两个有趣的实现：weakCompareAndSet 和 lazySet。

看起来反其道而行之，实际上都是出于更高的性能考虑。

文中很多方法都是 native 实现，这让我们读起来不够尽兴，说到底这个**世界上本没有高级语言，只有C语言，和对C语言的封装**。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马写作的最大动力！

# 参考资料

[理解AtomicXXX.lazySet方法](https://blog.csdn.net/bluetjs/article/details/52423867)

[compareAndSet和weakCompareAndSet区别](https://blog.csdn.net/weixin_38207722/article/details/103795991)

* any list
{:toc}
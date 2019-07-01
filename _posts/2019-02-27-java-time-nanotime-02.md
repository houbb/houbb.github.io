---
layout: post
title: Java 时间之 currentTimeMillis 与 nanoTime - 时间精确测量
date:  2019-2-26 09:48:47 +0800
categories: [Java]
tags: [java, java-base, sh]
published: true
---

# currentTimeMills

```java
/**
 * Returns the current time in milliseconds.  Note that
 * while the unit of time of the return value is a millisecond,
 * the granularity of the value depends on the underlying
 * operating system and may be larger.  For example, many
 * operating systems measure time in units of tens of
 * milliseconds.
 *
 * <p> See the description of the class <code>Date</code> for
 * a discussion of slight discrepancies that may arise between
 * "computer time" and coordinated universal time (UTC).
 *
 * @return  the difference, measured in milliseconds, between
 *          the current time and midnight, January 1, 1970 UTC.
 * @see     java.util.Date
 */
public static native long currentTimeMillis();
```

# System.nanoTime

## 为什么需要

平时产生随机数时我们经常拿时间做种子，比如用 System.currentTimeMillis 的结果，但是在执行一些循环中使用了System.currentTimeMillis，那么每次的结果将会差别很小，甚至一样，因为现代的计算机运行速度很快。

后来看到java中产生随机数函数以及线程池中的一些函数使用的都是 System.nanoTime。

## 方法声明

```java
/**
 * Returns the current value of the running Java Virtual Machine's
 * high-resolution time source, in nanoseconds.
 *
 * <p>This method can only be used to measure elapsed time and is
 * not related to any other notion of system or wall-clock time.
 * The value returned represents nanoseconds since some fixed but
 * arbitrary <i>origin</i> time (perhaps in the future, so values
 * may be negative).  The same origin is used by all invocations of
 * this method in an instance of a Java virtual machine; other
 * virtual machine instances are likely to use a different origin.
 *
 * <p>This method provides nanosecond precision, but not necessarily
 * nanosecond resolution (that is, how frequently the value changes)
 * - no guarantees are made except that the resolution is at least as
 * good as that of {@link #currentTimeMillis()}.
 *
 * <p>Differences in successive calls that span greater than
 * approximately 292 years (2<sup>63</sup> nanoseconds) will not
 * correctly compute elapsed time due to numerical overflow.
 *
 * <p>The values returned by this method become meaningful only when
 * the difference between two such values, obtained within the same
 * instance of a Java virtual machine, is computed.
 *
 * <p> For example, to measure how long some code takes to execute:
 *  <pre> {@code
 * long startTime = System.nanoTime();
 * // ... the code being measured ...
 * long estimatedTime = System.nanoTime() - startTime;}</pre>
 *
 * <p>To compare two nanoTime values
 *  <pre> {@code
 * long t0 = System.nanoTime();
 * ...
 * long t1 = System.nanoTime();}</pre>
 *
 * one should use {@code t1 - t0 < 0}, not {@code t1 < t0},
 * because of the possibility of numerical overflow.
 *
 * @return the current value of the running Java Virtual Machine's
 *         high-resolution time source, in nanoseconds
 * @since 1.5
 */
public static native long nanoTime();
```

## 使用方式

比如如下使用：

```java
public static void main(String[] args) {
    long start = System.nanoTime();
    
    //do sth...

    long end = System.nanoTime();
    System.out.println("Time: " + (end - start));
}
```

## 使用注意

To compare two nanoTime values

```java
*  <pre> {@code
* long t0 = System.nanoTime();
* ...
* long t1 = System.nanoTime();}</pre>
*
* one should use {@code t1 - t0 < 0}, not {@code t1 < t0},
* because of the possibility of numerical overflow.
```

JDK表明比较两个nanoTime的时候，应该用t1 - t2 > 0的方式来比较，而不能用 t1 > t2的方式来比较，因为nanoTime在获取时有数值溢出的可能。

### 问什么要这么比较

Nano时间不是'真实'时间，它只是一个计数器，当某些未指定的事件发生时（可能是计算机启动），计数器从一些未指定的数字开始递增。
它会溢出，在某些时候变为负数。 如果你的t0恰好在它溢出之前（即非常大的正数），并且你的t1刚好在（非常大的负数）之后，

则 t1 < t0（即你的条件错误，因为t1发生在t0之后）.....

但是，如果你说 `t1-t0 < 0`，那么神奇的是，对于相同的溢出（undeflow）原因（非常大的负数减去一个非常大的正数），结果将是t1的纳秒数在t0之后......并且是对的。

在这种情况下，两个错误确实是正确的！

# 总结

## 二者的关系

都可以用来计算耗时。

两个方法都不能保证完全精确,精确程度依赖具体的环境.

## 二者的区别

（1）System.currentTimeMillis 返回的毫秒，这个毫秒其实就是自1970年1月1日0时起的毫秒数. 

（2）java 中 System.nanoTime() 返回的是纳秒，nanoTime 而返回的可能是任意时间，甚至可能是负数

# 时间单位

ns（nanosecond）：纳秒， 时间单位。一秒的 10 亿分之一，即等于10的负9次方秒。常用作 内存读写速度的单位。 

1纳秒=0.000001 毫秒 

1纳秒=0.00000 0001 秒 

# 拓展阅读

[jdk8 时间类](https://houbb.github.io/2019/02/27/java8-08-datetime)

[jdk8 ChronoUnit 日期枚举类](https://houbb.github.io/2019/02/27/java8-07-datetime-ChronoUnit)

# 参考资料 

[闲谈System.nanoTime()函数](https://blog.csdn.net/u012581453/article/details/53706573)

[JDK NanoTime比较](https://www.jianshu.com/p/c6df3448aa00)

[java-system-nanotime-runs-too-slow](https://stackoverflow.com/questions/10026812/java-system-nanotime-runs-too-slow)

## 源码

[JVM源码分析之System.currentTimeMillis及nanoTime原理详解](https://yq.aliyun.com/articles/67089)

* any list
{:toc}
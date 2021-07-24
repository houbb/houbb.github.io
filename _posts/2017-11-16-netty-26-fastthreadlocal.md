---
layout: post
title:  Netty-26-Netty 的 FastThreadLocal 源码解析
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, nio, sh]
published: false
---

# Netty 的 FastThreadLocal 是什么

该文中涉及到的 Netty 源码版本为 4.1.6。

## 说明

ThreadLocal 的一个特殊变体，当从 FastThreadLocalThread 访问时会产生更高的访问性能。

在内部，FastThreadLocal 使用数组中的常量索引来查找变量，而不是使用哈希码和哈希表。 

虽然看起来很微妙，但与使用哈希表相比，它产生了轻微的性能优势，并且在频繁访问时很有用。

要利用此线程局部变量，您的线程必须是 FastThreadLocalThread 或其子类型。 

由于这个原因，默认情况下 DefaultThreadFactory 创建的所有线程都是 FastThreadLocalThread。

请注意，快速路径仅适用于扩展 FastThreadLocalThread 的线程，因为它需要一个特殊的字段来存储必要的状态。 

任何其他类型的线程的访问都会回退到常规的 ThreadLocal。

以上是 Netty 官方文档中关于 FastThreadLocal 的介绍。

简而言之，FastThreadLocal 是在 ThreadLocal 实现上的一种变种，相比 ThreadLocal 内部通过将自身 hash 的方式在 hashTable 上定位需要的变量存储位置，FastThreadLocal 选择在数组上的一个固定的常量位置来存放线程本地变量，这样的操作看起来并没有太大区别，但是相比 ThreadLocal 的确体现了性能上的优势，尤其是在读操作频繁的场景下。

# 如何使用 FastThreadLocal

如果想要得到 FastThreadLocal 的速度优势，必须通过 FastThreadLocalThread 或者其子类的线程，才可以使用，因为这个原因，Netty 的 DefaultThreadFactory，其内部默认线程工厂的 newThread()方法就是直接初始化一个 FastThreadLocalThread ，以便期望在 ThreadLocal 的操作中，得到其性能上带来的优势。

```java
protected Thread newThread(Runnable r, String name) {
    return new FastThreadLocalThread(threadGroup, r, name);
}
```

# FastThreadLocal 的源码实现

## FastThreadLocal 被访问的入口

当需要用到 FastThreadLocal 的时候，想必和 jdk 原生的 ThreadLocal 的 api 类似，都是通过初始化一个新的 FastThreadLocal 之后，通过其 set() 方法初始化并放入一个变量作为线程本地变量存储。

```java
public final void set(V value) {
    if (value != InternalThreadLocalMap.UNSET) {
        set(InternalThreadLocalMap.get(), value);
    } else {
        remove();
    }
}
```

因此，在 FastThreadLocal 的 set()方法中，可以看到，存储本地线程变量的数据结构是一个 InternalThreadLocalMap。

```java
private InternalThreadLocalMap threadLocalMap;
```

在 FastThreadLocalThread 中，因为本身 threadLocalMap 就是其中的一个成员，能够快速得到返回。

而其他线程实现，就将面临没有这个成员的尴尬，Netty 也给出了相应的兼容。

```java
public static InternalThreadLocalMap get() {
    Thread thread = Thread.currentThread();
    if (thread instanceof FastThreadLocalThread) {
        return fastGet((FastThreadLocalThread) thread);
    } else {
        return slowGet();
    }
}
```

InternalThreadLocalMap 的 get()方法中，当前线程如果是 FastThreadLocalThread 或是其子类的实现，变直接返回其 InternalThreadLocalMap 进行操作，但对于不属于上述条件的线程，Netty 通过 slowGet()的方式，也将返回一个 InternalThreadLocalMap。

```java
private static InternalThreadLocalMap slowGet() {
    ThreadLocal<InternalThreadLocalMap> slowThreadLocalMap = UnpaddedInternalThreadLocalMap.slowThreadLocalMap;
    InternalThreadLocalMap ret = slowThreadLocalMap.get();
    if (ret == null) {
        ret = new InternalThreadLocalMap();
        slowThreadLocalMap.set(ret);
    }
    return ret;
}
```

在 slowGet()方法中，当前线程对应的 InternalThreadLocalMap 会通过原生 jdk 下 ThreadLocal 的方式存储并通过 ThreadLocal 返回，因此，在这个场景下，使用的还是 jdk 原生的 ThreadLocal，但是只占用了原生 ThreadLocal 下的 Entry[]数组的一个位置，具体的变量还是存放在专门为 FastThreadLocal 服务的 InternalThreadLocalMap 中。  

在此，随着 InternalThreadLocalMap 的得到并返回，针对 FastThreadLocal 的 get 和 set 操作，也将变为操作 InternalThreadLocalMap 来达到目的，FastThreadLocal 性能优越的原因，也在 InternalThreadLocalMap 当中。

## InternalThreadLocalMap 的内部构造

```java
static final AtomicInteger nextIndex = new AtomicInteger();

Object[] indexedVariables;
```

InternalThreadlocalMap 主要由以上两个成员组成，其中 indexedVariables 作为一个 Object[]数组，直接用来存放 FastThreadLocal 对应的 value，每个 FastThreadLocal 对象都会在相应的线程的 ThreadLocalMap 中被分配到对应的 index，而这里的具体下标，则由以上的 nextIndex 成员在每个 FastThreadLocal 初始化的时候分配。

```java
private final int index;

public FastThreadLocal() {
    index = InternalThreadLocalMap.nextVariableIndex();
}
```

每个 FastThreadLocal 在构造方法的过程中，都会通过 InternalThreadlocalMap 的 nextVariableIndex()返回 nextIndex 自加后的结果作为其在 InternalThreadlocalMap 上的下标。

后续该 FastThreadLocal 在操作变量的时候可以直接通过该 index 定位到 Object[] 数组上的位置。

```java
private static final int variablesToRemoveIndex = InternalThreadLocalMap.nextVariableIndex();
```

而数组上的下标有一个特殊位，一般在其首位也就是 0 的位置，这个位置在 FastThreadLocal 类被加载的时候作为静态变量被设置。

在这个位置上，存放的是一个 FastThreadLocal 对象集合，每个存放到 InternalThreadlocalMap 中的 FastThreadLocal 都会被保存在首位的集合中。

```java
public static final Object UNSET = new Object();
```

另外，为了具体区分保存的变量是 null 还是不存在当前变量，InternalThreadLocalMap 中定义了一个为 NULL 的成员变量，以便区分上述情况，在一开始，InternalThreadLocalMap 中的 indexedVariables 数组都是 NULL。

## FastThreadLocal 的 set() 方法的源码分析

相比 FastThreadLocal 的 set 操作，get 方法的过程与逻辑都要简单的多，因此此处主要以其 set 方法为主。

```java
public final void set(V value) {
    if (value != InternalThreadLocalMap.UNSET) {
        set(InternalThreadLocalMap.get(), value);
    } else {
        remove();
    }
}

public final void set(InternalThreadLocalMap threadLocalMap, V value) {
    if (value != InternalThreadLocalMap.UNSET) {
        if (threadLocalMap.setIndexedVariable(index, value)) {
            addToVariablesToRemove(threadLocalMap, this);
        }
    } else {
        remove(threadLocalMap);
    }
}
```

在其 set()方法中，首先会判断 set 的值是否是 InternalThreadLocalMap 中的 NULL 对象来判断是 set 操作还是 remove 操作，如果不是，会通过 InternalThreadLocalMap.get()方法获取当前线程对应的 InternalThreadLocalMap，获取的过程在前文已经描述过。

之后的主要流程主要分为两步：

(1) 调用 InternalThreadLocalMap 的 setIndexedVariable()方法，将该 FastThreadLocal 成员在构造方法中获得到的 InternalThreadLocalMap 上的下标作为入参传入。

```java
public boolean setIndexedVariable(int index, Object value) {
    Object[] lookup = indexedVariables;
    if (index < lookup.length) {
        Object oldValue = lookup[index];
        lookup[index] = value;
        return oldValue == UNSET;
    } else {
        expandIndexedVariableTableAndSet(index, value);
        return true;
    }
}
```

在 InternalThreadLocalMap 的 setIndexedVariable()方法过程中，set 的过程并不复杂，找到对应的下标，并将对应的值放到 InternalThreadLocalMap 数组下标对应的位置上即宣告结束。

但是，因为 FastThreadLocal 在构造过程中虽然预先获得了对应的下标，但是实际上的数组大小可能完全还没有达到相应的大小，就要在此处通过 expandIndexedVariableTableAndSet()方法进行扩容，由于是数组的缘故，只需要扩容后将原来的值复制过去，并将剩余的值用 NULL 对象填满即可。


（2）如果上一步 set 成功，通过 addToVariablesToRemove()方法将该 FastThreadLocal 对象放入到 InternalThreadLocalMap 的数组中的首位集合中。在这个集合中，对于 FastThreadLocal 是一个强引用。

这样，对于 FastThreadLocal 的一次 set 操作即宣告结束。

# ## 相比 ThreadLocal，FastThreadLocal 到底快在哪里

- FastThreadLocal 在具体的定位的过程中，只需要根据在构造方法里获取得到的具体下标就可以定位到具体的数组位置进行变量的存取，而在 jdk 原生的 ThreadLocal 中，具体位置的下标获取不仅需要计算 ThreadLocal 的 hash 值，并需要在 hashTable 上根据 key 定位的结果，一旦定位之后的结果上已经存在其他 ThreadLocal 的变量，那么则是通过线性探测法，在 hashTable 上寻找下一个位置进行，相比 FastThreadLocal 定位的过程要复杂的多。

- FastThreadLocal 由于采取数组的方式，当面对扩容的时候，只需要将原数组中的内容复制过去，并用 NULL 对象填满剩余位置即可，而在 ThreadLocal 中，由于 hashTable 的缘故，在扩容后还需要进行一轮 rehash，在这过程中，仍旧存在 hash 冲突的可能。

- 在 FastThreadLocal 中，遍历当前线程的所有本地变量，只需要将数组首位的集合即可，不需要遍历数组上的每一个位置。

- 在原生的 ThreadLocal 中，由于可能存在 ThreadLocal 被回收，但是当前线程仍旧存活的情况导致 ThreadLocal 对应的本地变量内存泄漏的问题，因此在 ThreadLocal 的每次操作后，都会进行启发式的内存泄漏检测，防止这样的问题产生，但也在每次操作后花费了额外的开销。而在 FastThreadLocal 的场景下，由于数组首位的 FastThreadLocal 集合中保持着所有 FastThreadLocal 对象的引用，因此当外部的 FastThreadLocal 的引用被置为 null，该 FastThreadLocal 对象仍旧保持着这个集合的引用，不会被回收掉，只需要在线程当前业务操作后，手动调用 FastThreadLocal 的 removeAll()方法，将会遍历数组首位集合，回收掉所有 FastThreadLocal 的变量，避免内存泄漏的产生，也减少了原生 ThreadLocal 的启发式检测开销。

```java
private static final class DefaultRunnableDecorator implements Runnable {

    private final Runnable r;

    DefaultRunnableDecorator(Runnable r) {
        this.r = r;
    }

    @Override
    public void run() {
        try {
            r.run();
        } finally {
            FastThreadLocal.removeAll();
        }
    }
}
```

在 Netty 的 DefaultThreadFactory 中，每个线程在执行为任务后都会调用 FastThreadLocal 的 removeAll()方法。

#  小结

确实令人拍案叫绝，所有技术的底层还是数据结构与算法的较量。

* any list
{:toc}


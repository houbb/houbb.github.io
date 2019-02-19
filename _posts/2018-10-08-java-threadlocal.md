---
layout: post
title: Java ThreadLocal
date:  2018-10-08 17:55:28 +0800
categories: [Java]
tags: [sql, java, thread, sh]
published: true
excerpt: Java 线程安全之 ThreadLocal
---

# ThreadLocal

## 定义

该类提供线程局部变量。这些变量与普通的变量不同之处在于，每个访问一个变量的线程(通过它的get或set方法)都有自己的、独立初始化的变量副本。

ThreadLocal实例通常是类中希望将状态与线程关联的私有静态字段(例如，用户ID或事务ID)。

## 例子

例如，下面的类为每个线程生成唯一的本地标识符。线程的id在第一次调用ThreadId.get()时被分配，并且在后续调用时保持不变。

```java
import java.util.concurrent.atomic.AtomicInteger;

 public class ThreadId {
     // Atomic integer containing the next thread ID to be assigned
     private static final AtomicInteger nextId = new AtomicInteger(0);

     // Thread local variable containing each thread's ID
     private static final ThreadLocal<Integer> threadId =
         new ThreadLocal<Integer>() {
             @Override protected Integer initialValue() {
                 return nextId.getAndIncrement();
         }
     };

     // Returns the current thread's unique ID, assigning it if necessary
     public static int get() {
         return threadId.get();
     }
 }
```

只要线程是活的，且线程局部实例是可访问的，每个线程都有对其线程局部变量副本的隐式引用;

在一个线程消失后，它的所有线程本地实例副本都将受到垃圾收集(除非存在对这些副本的其他引用)。

## 保证实例创建的线程安全性

如果每次 service 都创建一个对象，会有些浪费。

如果不创建，可能不存在并发安全问题。

使用下面的方式，为每一个线程创建一个实例。(spring 采用的方式)

```java
import com.github.houbb.bean.mapping.api.core.IBeanMpping;
import com.github.houbb.bean.mapping.core.api.core.DefaultBeanMapping;
import com.github.houbb.bean.mapping.core.util.ObjectUtil;

/**
 * Bean 映射工厂
 * @author binbin.hou
 * date 2019/2/19
 */
public final class BeanMappingFactory {

    /**
     * 用于保存当前线程的信息
     */
    private static final ThreadLocal<IBeanMpping> THREAD_LOCAL = new ThreadLocal<>();

    /**
     * 获取对应的实现
     * 1. 线程安全
     * @return 结果
     */
    public static IBeanMpping getInstance() {
        IBeanMpping beanMpping = THREAD_LOCAL.get();
        if(ObjectUtil.isNull(beanMpping)) {
            beanMpping = new DefaultBeanMapping();
            THREAD_LOCAL.set(beanMpping);
        }
        return beanMpping;
    }


    /**
     * 清空
     * 1. 建议在每个线程执行结束，调用
     */
    public static void clear() {
        THREAD_LOCAL.remove();
    }

}
```

## 个人理解

为每一个线程都创建一个副本，所以不存在并发的资源安全问题。

适合在工具类，线程内信息传递(比如日志 traceId) 等场景使用。

# ThreadLocal 与线程封闭

维持线程封闭性的一种更规范方法是使用ThreadLocal，这个类能使线程中的某个值与保存值的对象关联起来。ThreadLocal提供了get与set等访问接口或方法，这些方法为每个使用该变量的线程都存有一份独立的副本，因此get总是返回由当前执行线程在调用set时设置的最新值。

ThreadLocal对象通常用于防止对可变的单实例变量（Singleton）或全局变量进行共享。例如，在单线程应用程序中可能会维持一个全局的数据库连接，并在程序启动时初始化这个连接对象，从而避免在调用每个方法时都要传递一个Connection对象。由于JDBC的连接对象不一定是线程安全的，因此，当多线程应用程序在没有协同的情况下使用全局变量时，就不是线程安全的。通过将JDBC的连接保存到ThreadLocal对象中，每个线程都会拥有属于自己的连接。
当某个频繁执行的操作需要一个临时对象，例如一个缓冲区，而同时又希望避免在每次执行时都重新分配该临时对象，就可以使用这项技术。例如，在Java 5.0之前，Integer.toString()方法使用ThreadLocal对象来保存一个12字节大小的缓冲区，用于对结果进行格式化，而不是使用共享的静态缓冲区（这需要使用锁机制）或者在每次调用时都分配一个新的缓冲区。

当某个线程初次调用ThreadLocal.get方法时，就会调用initialValue来获取初始值。从概念上看，你可以将ThreadLocal视为包含了Map< Thread,T>对象，其中保存了特定于该线程的值，但ThreadLocal的实现并非如此。这些特定于线程的值保存在Thread对象中，当线程终止后，这些值会作为垃圾回收。

假设你需要将一个单线程应用程序移植到多线程环境中，通过将共享的全局变量转换为ThreadLocal对象（如果全局变量的语义允许），可以维持线程安全性。然而，如果将应用程序范围内的缓存转换为线程局部的缓存，就不会有太大作用。

在实现应用程序框架时大量使用了ThreadLocal。例如，在EJB调用期间，J2EE容器需要将一个事务上下文（Transaction Context）与某个执行中的线程关联起来。通过将事务上下文保存在静态的ThreadLocal对象中，可以很容易地实现这个功能：当框架代码需要判断当前运行的是哪一个事务时，只需从这个ThreadLocal对象中读取事务上下文。这种机制很方便，因为它避免了在调用每个方法时都要传递执行上下文信息，然而这也将使用该机制的代码与框架耦合在一起。

开发人员经常滥用ThreadLocal，例如将所有全局变量都作为ThreadLocal对象，或者作为一种“隐藏”方法参数的手段。ThreadLocal变量类似于全局变量，它能降低代码的可重用性，并在类之间引入隐含的耦合性，因此在使用时要格外小心。

# ThreadLocal 原理

## ThreadLocal 维护线程与实例的映射

既然每个访问 ThreadLocal 变量的线程都有自己的一个“本地”实例副本。

一个可能的方案是 ThreadLocal 维护一个 Map，键是 Thread，值是它在该 Thread 内的实例。

线程通过该 ThreadLocal 的 get() 方案获取实例时，只需要以线程为键，从 Map 中找出对应的实例即可。

该方案如下图所示

![threadlocal/VarMap.png](http://www.jasongj.com/img/java/threadlocal/VarMap.png)

该方案可满足上文提到的每个线程内一个独立备份的要求。

每个新线程访问该 ThreadLocal 时，需要向 Map 中添加一个映射，而每个线程结束时，应该清除该映射。

这里就有两个问题：

- 增加线程与减少线程均需要写 Map，故需保证该 Map 线程安全。

- 线程结束时，需要保证它所访问的所有 ThreadLocal 中对应的映射均删除，否则可能会引起内存泄漏。（后文会介绍避免内存泄漏的方法）

其中锁的问题，是 JDK 未采用该方案的一个原因。

## Thread维护ThreadLocal与实例的映射

上述方案中，出现锁的问题，原因在于多线程访问同一个 Map。

如果该 Map 由 Thread 维护，从而使得每个 Thread 只访问自己的 Map，那就不存在多线程写的问题，也就不需要锁。

该方案如下图所示

![threadlocal/ThreadMap.png](http://www.jasongj.com/img/java/threadlocal/ThreadMap.png)

该方案虽然没有锁的问题，但是由于每个线程访问某 ThreadLocal 变量后，都会在自己的 Map 内维护该 ThreadLocal 变量与具体实例的映射，如果不删除这些引用（映射），则这些 ThreadLocal 不能被回收，可能会造成内存泄漏。

后文会介绍 JDK 如何解决该问题。


# 源码解析

以 JDK1.8 为例

## ThreadLocalMap与内存泄漏

该方案中，Map 由 ThreadLocal 类的静态内部类 ThreadLocalMap 提供。

该类的实例维护某个 ThreadLocal 与具体实例的映射。

与 HashMap 不同的是，ThreadLocalMap 的每个 Entry 都是一个对键的弱引用，这一点从super(k)可看出。

另外，每个 Entry 都包含了一个对值的强引用。

```java
/**
 * The entries in this hash map extend WeakReference, using
 * its main ref field as the key (which is always a
 * ThreadLocal object).  Note that null keys (i.e. entry.get()
 * == null) mean that the key is no longer referenced, so the
 * entry can be expunged from table.  Such entries are referred to
 * as "stale entries" in the code that follows.
 */
static class Entry extends WeakReference<ThreadLocal<?>> {
    /** The value associated with this ThreadLocal. */
    Object value;
    Entry(ThreadLocal<?> k, Object v) {
        super(k);
        value = v;
    }
}
```

使用弱引用的原因在于，当没有强引用指向 ThreadLocal 变量时，它可被回收，从而避免上文所述 ThreadLocal 不能被回收而造成的内存泄漏的问题。

但是，这里又可能出现另外一种内存泄漏的问题。ThreadLocalMap 维护 ThreadLocal 变量与具体实例的映射，当 ThreadLocal 变量被回收后，该映射的键变为 null，该 Entry 无法被移除。从而使得实例被该 Entry 引用而无法被回收造成内存泄漏。

注：Entry虽然是弱引用，但它是 ThreadLocal 类型的弱引用（也即上文所述它是对键的弱引用），而非具体实例的的弱引用，所以无法避免具体实例相关的内存泄漏。

## 读取实例

- get()

```java
/**
 * Returns the value in the current thread's copy of this
 * thread-local variable.  If the variable has no value for the
 * current thread, it is first initialized to the value returned
 * by an invocation of the {@link #initialValue} method.
 *
 * @return the current thread's value of this thread-local
 */
public T get() {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null) {
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null) {
            @SuppressWarnings("unchecked")
            T result = (T)e.value;
            return result;
        }
    }
    return setInitialValue();
}
```

- getMap()

```java
/**
 * Get the map associated with a ThreadLocal. Overridden in
 * InheritableThreadLocal.
 *
 * @param  t the current thread
 * @return the map
 */
ThreadLocalMap getMap(Thread t) {
    return t.threadLocals;
}
```

读取实例时，线程首先通过getMap(t)方法获取自身的 ThreadLocalMap。

从如下该方法的定义可见，该 ThreadLocalMap 的实例是 Thread 类的一个字段，即由 Thread 维护 ThreadLocal 对象与具体实例的映射，这一点与上文分析一致。

获取到 ThreadLocalMap 后，通过 `map.getEntry(this)` 方法获取该 ThreadLocal 在当前线程的 ThreadLocalMap 中对应的 Entry。

该方法中的 this 即当前访问的 ThreadLocal 对象。

如果获取到的 Entry 不为 null，从 Entry 中取出值即为所需访问的本线程对应的实例。

如果获取到的 Entry 为 null，则通过setInitialValue()方法设置该 ThreadLocal 变量在该线程中对应的具体实例的初始值。

## 设置初始值

- setInitialValue()

```java
/**
 * Variant of set() to establish initialValue. Used instead
 * of set() in case user has overridden the set() method.
 *
 * @return the initial value
 */
private T setInitialValue() {
    T value = initialValue();
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
    return value;
}
```

首先，通过 `initialValue()` 方法获取初始值。该方法为 public 方法，且默认返回 null。所以典型用法中常常重载该方法。上例中即在内部匿名类中将其重载。

然后拿到该线程对应的 ThreadLocalMap 对象，若该对象不为 null，则直接将该 ThreadLocal 对象与对应实例初始值的映射添加进该线程的 ThreadLocalMap中。若为 null，则先创建该 ThreadLocalMap 对象再将映射添加其中。

这里并不需要考虑 ThreadLocalMap 的线程安全问题。

因为每个线程有且只有一个 ThreadLocalMap 对象，并且只有该线程自己可以访问它，其它线程不会访问该 ThreadLocalMap，也即该对象不会在多个线程中共享，也就不存在线程安全的问题。

## 设置实例

除了通过initialValue()方法设置实例的初始值，还可通过 set 方法设置线程内实例的值，如下所示。

```java
/**
 * Sets the current thread's copy of this thread-local variable
 * to the specified value.  Most subclasses will have no need to
 * override this method, relying solely on the {@link #initialValue}
 * method to set the values of thread-locals.
 *
 * @param value the value to be stored in the current thread's copy of
 *        this thread-local.
 */
public void set(T value) {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
}
```

该方法先获取该线程的 ThreadLocalMap 对象，然后直接将 ThreadLocal 对象（即代码中的 this）与目标实例的映射添加进 ThreadLocalMap 中。

当然，如果映射已经存在，就直接覆盖。

另外，如果获取到的 ThreadLocalMap 为 null，则先创建该 ThreadLocalMap 对象。

## 防止内存泄漏

对于已经不再被使用且已被回收的 ThreadLocal 对象，它在每个线程内对应的实例由于被线程的 ThreadLocalMap 的 Entry 强引用，无法被回收，可能会造成内存泄漏。

针对该问题，ThreadLocalMap 的 set 方法中，通过 `replaceStaleEntry()` 将所有键为 null 的 Entry 的值设置为 null，从而使得该值可被回收。

另外，会在 rehash 方法中通过 `expungeStaleEntry()` 将键和值为 null 的 Entry 设置为 null 从而使得该 Entry 可被回收。

通过这种方式，ThreadLocal 可防止内存泄漏。

```java
private void set(ThreadLocal<?> key, Object value) {
  Entry[] tab = table;
  int len = tab.length;
  int i = key.threadLocalHashCode & (len-1);
  for (Entry e = tab[i]; e != null; e = tab[i = nextIndex(i, len)]) {
    ThreadLocal<?> k = e.get();
    if (k == key) {
      e.value = value;
      return;
    }
    if (k == null) {
      replaceStaleEntry(key, value, i);
      return;
    }
  }
  tab[i] = new Entry(key, value);
  int sz = ++size;
  if (!cleanSomeSlots(i, sz) && sz >= threshold)
    rehash();
}
```

# 会导致内存泄漏吗

不会导致内存泄漏。

## 网上的说法

有网上讨论说ThreadLocal会导致内存泄露，原因如下

1. 首先ThreadLocal实例被线程的ThreadLocalMap实例持有，也可以看成被线程持有。

2. 如果应用使用了线程池，那么之前的线程实例处理完之后出于复用的目的依然存活

所以，ThreadLocal设定的值被持有，导致内存泄露。

## 实际

上面的逻辑是清晰的，可是ThreadLocal并不会产生内存泄露，因为ThreadLocalMap在选择key的时候，并不是直接选择ThreadLocal实例，而是ThreadLocal实例的弱引用。

```java
static class ThreadLocalMap {
    /**
    * The entries in this hash map extend WeakReference, using
    * its main ref field as the key (which is always a
    * ThreadLocal object).  Note that null keys (i.e. entry.get()
    * == null) mean that the key is no longer referenced, so the
    * entry can be expunged from table.  Such entries are referred to
    * as "stale entries" in the code that follows.
    */
    static class Entry extends WeakReference<ThreadLocal<?>> {
        /** The value associated with this ThreadLocal. */
        Object value;
        Entry(ThreadLocal<?> k, Object v) {
            super(k);
            value = v;
        }
    }
}
```

所以实际上从ThreadLocal设计角度来说是不会导致内存泄露的。

弱引用相关知识参见 [java 弱引用](https://houbb.github.io/2018/08/20/java-weak-reference#%E5%BC%B1%E5%BC%95%E7%94%A8weak-reference)

# 只能一个线程访问吗

## InheritableThreadLocal

InheritableThreadLocal类是ThreadLocal类的子类。

ThreadLocal中每个线程拥有它自己的值，与ThreadLocal不同的是，InheritableThreadLocal允许一个线程以及该线程创建的所有子线程都可以访问它保存的值。

- testInheritableThreadLocal()

如下，我们在主线程中创建一个InheritableThreadLocal的实例，然后在子线程中得到这个InheritableThreadLocal实例设置的值。

```java
private void testInheritableThreadLocal() {
    final ThreadLocal threadLocal = new InheritableThreadLocal();
    threadLocal.set("droidyue.com");
    Thread t = new Thread() {
        @Override
        public void run() {
            super.run();
            Log.i(LOGTAG, "testInheritableThreadLocal =" + threadLocal.get());
        }
    };

    t.start();
}
```

# 对象存放在哪里

在Java中，栈内存归属于单个线程，每个线程都会有一个栈内存，其存储的变量只能在其所属线程中可见，即栈内存可以理解成线程的私有内存。

而堆内存中的对象对所有线程可见。堆内存中的对象可以被所有线程访问。

问：那么是不是说ThreadLocal的实例以及其值存放在栈上呢？

其实不是，因为ThreadLocal实例实际上也是被其创建的类持有（更顶端应该是被线程持有）。

而ThreadLocal的值其实也是被线程实例持有。

它们都是**位于堆上，只是通过一些技巧将可见性修改成了线程可见**。

# 拓展阅读

[java 弱引用](https://houbb.github.io/2018/08/20/java-weak-reference#%E5%BC%B1%E5%BC%95%E7%94%A8weak-reference)

[java 线程安全](https://houbb.github.io/2018/07/24/java-concurrency-03-thread-safety)

# 参考资料

[threadlocal doc](https://docs.oracle.com/javase/7/docs/api/java/lang/ThreadLocal.html)

[正确理解Thread Local的原理与适用场景](http://www.jasongj.com/java/threadlocal/)

[Java中的ThreadLocal通常是在什么情况下使用的？](https://www.zhihu.com/question/21709953)

* any list
{:toc}
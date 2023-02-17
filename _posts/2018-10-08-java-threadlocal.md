---
layout: post
title: Java 线程安全之 ThreadLocal 详解及源码分析
date:  2018-10-08 17:55:28 +0800
categories: [Java]
tags: [sql, java, thread, source-code, sh]
published: true
---

# ThreadLocal 典型的使用场景

典型使用场景： 

每个线程都有一个独享的对象

1. 通常是工具类 典型需要使用的类simpleDateFormat和Random每个thread内有自己的实例副本不共享

2. 教材只有一本 每个人都抢着看 那么这终究会有线程安全问题

3. 模拟场景 1000个线程都需要去打印日期 simpleDateFormat 格式化 但是线程不安全 而且如果用线程池 就造成资源浪费

如何解决：

1. 可以加锁 但是会销毁比较低

2. threadlocal 可以解决  可以实现 initialValue 去 new 一下 simpledateFormat 每一个线程内都有自己独享的对象

## 每个线程内需要保存全局变量

（例如在拦截器中获取用户信息 可以让每个不同的方法直接使用 避免参数传递的麻烦）

比如当前用户信息需要被线程内所有的方法共享

一个比较繁琐的解决方案就是 把user作为参数层层传递 从service-1（） 传到service-2（） 再从 service-2（ ）传到service-3（） 但是这样会造成代码冗余并且不易维护

可以用map一类的存储参数信息但是需要考虑 并发安全 所有会对性能有影响

threadlocal的作用和方法概念

1. 保存一些业务内容 用户权限信息 用户系统获取用户名 userid等

2. 这些信息在同一个线程里面 但是不同的线程使用的业务内容是不相同的

3. 在线程的生命周期内 都通过这个静态的threadlocal实例的get() 方法来 自己set过得那个对象 避免将这个对象（例如user对象）作为参数传递的麻烦用threadLocal 保存一些业务内容 

4. 强调的是同一个请求内不同方法间的共享

5. 不需要重写initialvalue方法 但是必须手动调用set方法

总结： 

1. 让某个需要用到的对象在线程建隔离 （每个对象都有自己独立的对象）

2. 在任何方法都可以轻松获取对象

## ThreadLocal的好处

1. 线程安全 

2. 不需要加锁 提高执行效率 

3. 高效利用那个内存 和开销 

4. 避免传参的繁琐

## ThreadLocal 内存泄露

1. 内存泄露 某个对象不再有用 但是占用的内存却不能被回收

2. 只有两种可能性 key 泄露 value 泄露

```java
static class Entry extends WeakReference<ThreadLocal<?>> {
          /** The value associated with this ThreadLocal. */
          Object value;
          Entry(ThreadLocal<?> k, Object v) {
              super(k);
              value = v;
          }
      }
```

弱引用  ThreadLocalMap 的每个Entry 都是一个key的弱引用 同时每个Entry都包含了一个对value的强引用  

正常情况下 当线程终止 保存在Threadlocal 里面的value 会被垃圾回收 因为没有任何的强引用了

但是如果线程不终止 比如线程需要保持很久 那么key对应的value 就不能被回收 比如线程池就是用一个线程反复被使用  因此就有了一下的调用链：

Thread -- ThreadLocalMap -- entry (Key为null) -- value 

因为 value 和Thread之间 还存在这个强引用链路 所以导致value无法回收 就可能会出现OOM

JDK已经考虑到这个问题了 所以在set remove rehash 方法中 会扫描 key为null 的 entry 

并吧对应的value设置为null  这样value对象 就可以被回收 

但是如果一个Threadlocal 不被使用 那么实际上set remove rehash 方法也不会被调用 

如果同时线程又不停止 那么调用链就一直存在那么就会导致value的泄露 


## 如何避免内存泄露？？

调用remove方法 就会删除对应的entry对象 可以避免内存泄露 所以使用完ThreadLocal之后 应该调用remove()方法

在进行get 之前 必须先set 否则可能会报空指针异常吗 不会 返回null 但是进行装箱和拆箱 会出现错误

共享变量：如果在每个线程中ThreadLocal.set() 进去的东西本来就是多线程共享的同一个对象 比如static对象 那么多个线程的ThreadLocal.get() 取得的还是共享变量本身 还是有并发访问的问题

## spring 中的实例分析

DateTimeContextHolder 类 看到了里面用了ThreadLocal 每次http 请求 都对应一个线程 线程之间相互隔离 这就是ThreadLocal 典型应用场景

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

# ThredaLocal 保证线程安全的两种方式

## 无状态

无状态的类天生线程安全。

但是存在一个问题，同一个线程中属性可能无法传递。

ThreadLocal 可以让变量在同一个线程中可见。

## 副本

DateFormat 线程不安全。

使用的时候可以用 `ThreadLocal<DateFormat> format = new ThreadLocal<>();`

为每个线程单独创建一个副本，从而保证线程的安全性。

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

## 无法保证的场景

但这样也并不能保证ThreadLocal不会发生内存泄漏，例如：

（1）使用static的ThreadLocal，延长了ThreadLocal的生命周期，可能导致的内存泄漏。

（2）分配使用了ThreadLocal又不再调用get()、set()、remove()方法，那么就会导致内存泄漏。

# 为什么使用弱引用？

从表面上看，发生内存泄漏，是因为Key使用了弱引用类型。

但其实是因为整个Entry的key为null后，没有主动清除value导致。

但为什么使用弱引用而不是强引用？

## 官方说话

官方文档的说法：

```
To help deal with very large and long-lived usages, the hash table entries use WeakReferences for keys.
为了处理非常大和生命周期非常长的线程，哈希表使用弱引用作为 key。
```

## 场景

下面我们分两种情况讨论：

### key 为强引用

key 使用强引用：引用的ThreadLocal的对象被回收了，但是ThreadLocalMap还持有ThreadLocal的强引用，如果没有手动删除，ThreadLocal不会被回收，导致Entry内存泄漏。

### key 为弱引用

key 使用弱引用：引用的ThreadLocal的对象被回收了，由于ThreadLocalMap持有ThreadLocal的弱引用，即使没有手动删除，ThreadLocal也会被回收。

value在下一次ThreadLocalMap调用set,get，remove的时候会被清除。

比较两种情况，我们可以发现：由于ThreadLocalMap的生命周期跟Thread一样长，如果都没有手动删除对应key，都会导致内存泄漏，但是使用弱引用可以多一层保障：

弱引用ThreadLocal不会内存泄漏，对应的value在下一次ThreadLocalMap调用set,get,remove的时候会被清除。

因此，ThreadLocal内存泄漏的根源是：由于ThreadLocalMap的生命周期跟Thread一样长，如果没有手动删除对应key的value就会导致内存泄漏，而不是因为弱引用。

# 会导致内存泄漏吗

会导致内存泄漏，如果线程一直没有被销毁的话。

## 网上的说法

有网上讨论说 ThreadLocal 会导致内存泄露，原因如下

1. 首先 ThreadLocal 实例被线程的ThreadLocalMap实例持有，也可以看成被线程持有。

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

只有一种场景，那就是线程一直没有被销毁。比如线程池场景。

## 生命周期

threadlocal里面使用了一个存在弱引用的map,当释放掉threadlocal的强引用以后,map里面的value却没有被回收.而这块value永远不会被访问到了. 所以存在着内存泄露. 

在threadlocal的生命周期中,都存在这些引用. 

看下图: 实线代表强引用,虚线代表弱引用.

![生命周期](https://images0.cnblogs.com/blog/458716/201401/172259164557.jpg)

每个thread中都存在一个map, map的类型是ThreadLocal.ThreadLocalMap. Map中的key为一个threadlocal实例. 

这个Map的确使用了弱引用,不过弱引用只是针对key. 每个key都弱引用指向threadlocal. 当把threadlocal实例置为null以后,没有任何强引用指向threadlocal实例,所以threadlocal将会被gc回收. 但是,我们的value却不能回收,因为存在一条从current thread连接过来的强引用. 

只有当前thread结束以后, current thread就不会存在栈中,强引用断开, Current Thread, Map, value将全部被GC回收.

所以得出一个结论就是只要这个线程对象被gc回收，就不会出现内存泄露，但在threadLocal设为null和线程结束这段时间不会被回收的，就发生了我们认为的内存泄露。

其实这是一个对概念理解的不一致，也没什么好争论的。

最要命的是线程对象不被回收的情况，这就发生了真正意义上的内存泄露。比如使用线程池的时候，线程结束是不会销毁的，会再次使用的。就可能出现内存泄露。　

## 解决方案

使用 `remove()` 方法移除对象，如果使用线程池的话。

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


# ThreadLocal 线程安全吗？

## 场景

As we all know, java 的 DateFormat 是线程不安全的。

我们为了保证线程安全，又不想浪费太多的内存，于是就有人想使用 ThreadLocal 来保证线程安全性。

这样每个线程都有副本，那么这样做真的安全，吗？

## 测试代码

- Number.java

```java
public class Number {


    private int num;

    public int getNum() {
        return num;
    }

    public void setNum(int num) {
        this.num = num;
    }
    
}
```

- 测试类

```java
package com.ryo.netty.threadlocal;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class NotSafeThread implements Runnable {


    public static Number number = new Number();

    public static int i = 0;

    @Override
    public void run() {
        //每个线程计数加一
        number.setNum(i++);
        //将其存储到ThreadLocal中
        value.set(number);

        // 添加延时测试,为了效果更加明显
        try {
            TimeUnit.SECONDS.sleep(2);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        //输出num值
        System.out.println(Thread.currentThread().getName()+": "+value.get().getNum());
    }

    public static ThreadLocal<Number> value = new ThreadLocal<>();

    public static void main(String[] args) {
        ExecutorService newCachedThreadPool = Executors.newFixedThreadPool(3);
        for (int i = 0; i < 5; i++) {
            newCachedThreadPool.execute(new NotSafeThread());
        }
        // 关闭线程池
        newCachedThreadPool.shutdown();
    }

}
```

## 测试日志

```
pool-1-thread-1: 2
pool-1-thread-3: 2
pool-1-thread-2: 2
pool-1-thread-1: 4
pool-1-thread-3: 4
```

很明显，并没有达到每个对象一个副本的概念。为什么会这样呢？

## 源码分析

- set

```java
public void set(Object obj) {
    Thread thread = Thread.currentThread();
    ThreadLocalMap threadlocalmap = getMap(thread);
    if(threadlocalmap != null)
        threadlocalmap.set(this, obj);
    else
        createMap(thread, obj);
}
```

- getMap

```java
ThreadLocal.ThreadLocalMap getMap(Thread thread) {
    //返回的是thread的成员变量
    return thread.inheritableThreadLocals;
}
```

可以看到，这些特定于线程的值是保存在当前的 Thread 对象中，并非保存在 ThreadLocal 对象中。

并且我们发现Thread对象中保存的是Object对象的一个引用，这样的话，当有其他线程对这个引用指向的对象做修改时，当前线程Thread对象中保存的值也会发生变化。

这也就是为什么上面的程序为什么会输出一样的结果：线程中保存的是同一Number对象的引用，在线程睡眠2s的时候，其他线程将num变量进行了修改，因此它们最终输出的结果是相同的。

## 正确的方式

那么，ThreadLocal的“为每个使用该变量的线程都存有一份独立的副本，因此get总是返回由当前执行线程在调用set时设置的最新值。

”这句话中的“独立的副本”，也就是我们理解的“线程本地存储”只能是每个线程所独有的对象并且不与其他线程进行共享，大概是这样的情况：

```java
public static ThreadLocal<Number> value = new ThreadLocal<Number>() {
    public Number initialValue(){//为每个线程保存的值进行初始化操作
        return new Number();
    }
};
```

or

```java
public void run() {
    value.set(new Number());
}
```

## 程序员的吐槽

好吧...这个时候估计你会说：那这个ThreadLocal有什么用嘛，每个线程都自己new一个对象使用，只有它自己使用这个对象而不进行共享，那么程序肯定是线程安全的咯。这样看起来我不使用ThreadLocal，在需要用某个对象的时候，直接new一个给本线程使用不就好咯。

确实，ThreadLocal的使用不是为了能让多个线程共同使用某一对象，而是我有一个线程A，其中我需要用到某个对象o，这个对象o在这个线程A之内会被多处调用，而我不希望将这个对象o当作参数在多个方法之间传递，于是，我将这个对象o放到TheadLocal中，这样，在这个线程A之内的任何地方，只要线程A之中的方法不修改这个对象o，我都能取到同样的这个变量o。

比如：spring 中事务获取 connection, 日志的 MDC。

## 正确的使用姿势-事务

再举一个在实际中应用的例子，

例如，我们有一个银行的BankDAO类和一个个人账户的PeopleDAO类，现在需要个人向银行进行转账，在PeopleDAO类中有一个账户减少的方法，BankDAO类中有一个账户增加的方法，那么这两个方法在调用的时候必须使用同一个Connection数据库连接对象，如果他们使用两个Connection对象，则会开启两段事务，可能出现个人账户减少而银行账户未增加的现象。

使用同一个Connection对象的话，在应用程序中可能会设置为一个全局的数据库连接对象，从而避免在调用每个方法时都传递一个Connection对象。

问题是当我们把Connection对象设置为全局变量时，你不能保证是否有其他线程会将这个Connection对象关闭，这样就会出现线程安全问题。

解决办法就是在进行转账操作这个线程中，使用ThreadLocal中获取Connection对象，这样，在调用个人账户减少和银行账户增加的线程中，就能从ThreadLocal中取到同一个Connection对象，并且这个Connection对象为转账操作这个线程独有，不会被其他线程影响，保证了线程安全性。

```java
public class ConnectionHolder {
    
    public static ThreadLocal<Connection> connectionHolder = new ThreadLocal<Connection>() {
    };
    
    public static Connection getConnection(){
        Connection connection = connectionHolder.get();
        if(null == connection){
            connection = DriverManager.getConnection(DB_URL);
            connectionHolder.set(connection);
        }
        return connection;
    }
 
}
```

在框架中，我们需要将一个事务上下文（Transaction  Context）与某个执行中的线程关联起来。

通过将事务上下文保存在静态的ThreaLocal对象中（这个上下文肯定是不与其他线程共享的），可以很容易地实现这个功能：

当框架代码需要判断当前运行的是哪一个事务时，只需从这个ThreadLocal对象中读取事务上下文，避免了在调用每个方法时都需要传递执行上下文信息。

# 拓展阅读

[java 弱引用](https://houbb.github.io/2018/08/20/java-weak-reference#%E5%BC%B1%E5%BC%95%E7%94%A8weak-reference)

[java 线程安全](https://houbb.github.io/2018/07/24/java-concurrency-03-thread-safety)

# 参考资料

[threadlocal doc](https://docs.oracle.com/javase/7/docs/api/java/lang/ThreadLocal.html)

[正确理解Thread Local的原理与适用场景](http://www.jasongj.com/java/threadlocal/)

[Java中的ThreadLocal通常是在什么情况下使用的？](https://www.zhihu.com/question/21709953)

## 内存泄漏

[ThreadLocal可能引起的内存泄露](https://www.cnblogs.com/onlywujun/p/3524675.html)

[ThreadLocal内存泄漏真因探究](https://www.jianshu.com/p/a1cd61fa22da)

## 线程安全

[ThreadLocal使用注意：线程不安全，可能会发生内存泄漏](https://blog.csdn.net/h2604396739/article/details/83033302)

* any list
{:toc}
---
layout: post
title: JUC-02-AtomicLong 使用入门及源码详解
date:  2019-1-20 14:10:12 +0800
categories: [Concurrency]
tags: [thread, concurrency, juc, sh]
published: true
---

# AtomicLong 介绍

![AtomicLong](https://p1.pstatp.com/origin/pgc-image/df0506ee12704282a01e6ad9944c8e26)

可以原子更新的 Long 值。 

AtomicLong用于诸如原子递增的序列号之类的应用程序中，并且不能用作Long的替代品。 

但是，此类确实扩展了Number，以允许通过处理基于数字的类的工具和实用程序进行统一访问。

## API

直接查阅 [JDK Doc](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/atomic/AtomicLong.html)

# AtomicLong 与 Long 的区别

这两个对象之间存在显着差异，虽然最终结果是相同的，但它们肯定是非常不同的，并且在非常不同的情况下使用。

## Long

在以下情况下使用基本Long对象：

1. 你需要包装类

2. 您正在使用一个集合

3. 你只想处理对象而不是 primitives（有点工作）

## AtomicLong

您在以下情况下使用AtomicLong：

1. 您必须保证该值可以在并发环境中使用

2. 你不需要包装类（因为这个类不会自动装箱）

3. Long本身不允许线程互操作，因为两个线程都可以看到并更新相同的值，但是使用AtomicLong，在多个线程将看到的值周围有相当不错的保证。

实际上，除非您曾经使用线程，否则您不需要使用AtomicLong。

![原子性](https://p1.pstatp.com/origin/dfic-imagehandler/036294e0-8e4d-4967-a594-267c08f9d00f)

# AtomicLong 使用

线程安全的构建一个递增序列号。

## 代码

```java
static class Counter {
   private AtomicLong c = new AtomicLong(0);
   public void increment() {
      c.getAndIncrement();
   }
   public long value() {
      return c.get();
   }
}
```

## 测试

```java
public static void main(final String[] arguments) throws InterruptedException {
   final Counter counter = new Counter();
   
   //1000 threads
   for(int i = 0; i < 1000 ; i++) {
      new Thread(new Runnable() {
         
         public void run() {
            counter.increment();
         }
      }).start();	
   }
   Thread.sleep(6000);			   		  
   System.out.println("Final number (should be 1000): " + counter.value());
}
```

- 测试结果

```
Final number (should be 1000): 1000
```

# AtomicLong 源码

基于 JDK 1.8.0_191

## UnSafe

源码中一个比较重要的对象 Unsafe

```java
// setup to use Unsafe.compareAndSwapLong for updates
private static final Unsafe unsafe = Unsafe.getUnsafe();
```

先列一下AtomicLong里面用到的Unsafe方法，实际上这里的Long也有Object或者Integer版本：

- compareAndSwapLong

- getAndAddLong

- getAndSetLong

- putOrderedLong

## 构造函数与内部变量与静态块

可以看到在类加载时，需要获取Unsafe的实例，检查JVM是否支持无锁的long型CAS操作，获取类中value字段的偏移量。

构造函数可以指定初始值也可以默认为0。value值用volatile变量修饰。

```java
public class AtomicLong extends Number implements java.io.Serializable {
    private static final long serialVersionUID = 1927816293512124184L;

    // setup to use Unsafe.compareAndSwapLong for updates
    private static final Unsafe unsafe = Unsafe.getUnsafe();
    private static final long valueOffset;

    /**
     * Records whether the underlying JVM supports lockless
     * compareAndSwap for longs. While the Unsafe.compareAndSwapLong
     * method works in either case, some constructions should be
     * handled at Java level to avoid locking user-visible locks.
     */
    static final boolean VM_SUPPORTS_LONG_CAS = VMSupportsCS8();

    /**
     * Returns whether underlying JVM supports lockless CompareAndSet
     * for longs. Called only once and cached in VM_SUPPORTS_LONG_CAS.
     */
    private static native boolean VMSupportsCS8();

    static {
        try {
            valueOffset = unsafe.objectFieldOffset
                (AtomicLong.class.getDeclaredField("value"));
        } catch (Exception ex) { throw new Error(ex); }
    }

    private volatile long value;

    /**
     * Creates a new AtomicLong with the given initial value.
     *
     * @param initialValue the initial value
     */
    public AtomicLong(long initialValue) {
        value = initialValue;
    }

    /**
     * Creates a new AtomicLong with initial value {@code 0}.
     */
    public AtomicLong() {
    }
}
```

## Getter & Setter

### get与set是直接获取与更新value值

```java
/**
 * Gets the current value.
 *
 * @return the current value
 */
public final long get() {
    return value;
}
/**
 * Sets to the given value.
 *
 * @param newValue the new value
 */
public final void set(long newValue) {
    value = newValue;
}
```

### 而getAndSet原子性设定为给出值并且返回旧值

```java
/**
 * Atomically sets to the given value and returns the old value.
 *
 * @param newValue the new value
 * @return the previous value
 */
public final long getAndSet(long newValue) {
    return unsafe.getAndSetLong(this, valueOffset, newValue);
}
```

### compareAndSet 

compareAndSet如果当前value==expect，则原子性的更新value为update，返回是否操作成功，同样借助了unsafe.compareAndSwapLong。

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
public final boolean compareAndSet(long expect, long update) {
    return unsafe.compareAndSwapLong(this, valueOffset, expect, update);
}
```

## getAndAdd和addAndGet

下面几个方法本质上都是一个意思，原子性的增减当前值，返回新值或者旧值。

全部都是基于Unsafe.getAndAddLong，实现方法是循环尝试compareAndSwapLong，如果因为有其他线程更新而失败则getLongVolatile重新获取当前值。

```java
/**
 * Atomically increments by one the current value.
 *
 * @return the previous value
 */
public final long getAndIncrement() {
    return unsafe.getAndAddLong(this, valueOffset, 1L);
}
/**
 * Atomically decrements by one the current value.
 *
 * @return the previous value
 */
public final long getAndDecrement() {
    return unsafe.getAndAddLong(this, valueOffset, -1L);
}
/**
 * Atomically adds the given value to the current value.
 *
 * @param delta the value to add
 * @return the previous value
 */
public final long getAndAdd(long delta) {
    return unsafe.getAndAddLong(this, valueOffset, delta);
}
/**
 * Atomically increments by one the current value.
 *
 * @return the updated value
 */
public final long incrementAndGet() {
    return unsafe.getAndAddLong(this, valueOffset, 1L) + 1L;
}
/**
 * Atomically decrements by one the current value.
 *
 * @return the updated value
 */
public final long decrementAndGet() {
    return unsafe.getAndAddLong(this, valueOffset, -1L) - 1L;
}
/**
 * Atomically adds the given value to the current value.
 *
 * @param delta the value to add
 * @return the updated value
 */
public final long addAndGet(long delta) {
    return unsafe.getAndAddLong(this, valueOffset, delta) + delta;
}
```

# LazySet

## 出处

```java
/**
 * Eventually sets to the given value.
 *
 * @param newValue the new value
 * @since 1.6
 */
public final void lazySet(long newValue) {
    unsafe.putOrderedLong(this, valueOffset, newValue);
}
```

为一个AtomicLong对象设置一个值，jvm会确保其他线程读取到最新值，原子类和voliatile变量也是一样的，这是由依赖于硬件的系统指令(如x86的xchg)实现的。lazySet却是无法保证这一点的方法，所以其他线程在之后的一小段时间里还是可以读到旧的值。

lazySet是使用Unsafe.putOrderedObject方法，这个方法在对低延迟代码是很有用的，它能够实现非堵塞的写入，这些写入不会被Java的JIT重新排序指令(instruction reordering)，这样它使用快速的存储-存储(store-store) barrier, 而不是较慢的存储-加载(store-load) barrier, 后者总是用在volatile的写操作上，这种性能提升是有代价的，写后结果并不会立即被其他线程甚至是自己的线程看到，通常是几纳秒后被其他线程看到，这个时间比较短，所以代价可以忍受。

## 优点

性能：在多核处理器下，内存以及cpu缓存的读和写常常是顺序执行的，所以在多个cpu缓存之间同步一个内存值的代价是很昂贵的。

## 如何实现

大多数的原子类，比如AtomicLong本质上都是一个Unsafe和一个volatile Long变量的包装类。

值得注意的是AtomicLong.lazySet方法实际是调用了本地方法Unsafe.putOrderedLong，本地方法Unsafe.putOrderedLong的实现可以参考

[unsafe.cpp](http://hg.openjdk.java.net/jdk7/jdk7/hotspot/file/9b0ca45cd756/src/share/vm/prims/unsafe.cpp)。

从Unsafe的代码中可以发现Unsafe_setOrderedLong是一个本地方法（c++实现），它仅调用了SET_FIELD_VOLATILE，这很是奇怪，我们期望共享的Unsafe_setLongVolatile拥有不同的语义。

PS：在非增强版本中，setOrdered仅仅是调用了setVolatile方法，很是让人失望。深入查看你会发现其实他们是相同的，SET_FIELD_VOLATILE是一个OrderAccess:release_store_fence的包装。

可以在Linux x86的代码 [orderAccess_linux_x86.inline.hpp](http://hg.openjdk.java.net/jdk7/jdk7/hotspot/file/9b0ca45cd756/src/os_cpu/linux_x86/vm/orderAccess_linux_x86.inline.hpp) 中找到此方法的实现，在64bit x86系统中采用xchgq来代码,64位版本指令的问题我上面有提到过。

ps：从理论上讲lazySet能比一个标准的volatile变量的写性能更好。但是我在openJdk里没有找到相关代码。

Felix Sulima说：

sun.misc.unsafe很多方法被jvm增强了，JIT（just in time运行时编译执行的技术）直接解释而忽略原始的实现。

可以在这里找到这个例子：

[src/share/vm/classfile/vmSymbols.hpp@3facbb14e873](http://hg.openjdk.java.net/jdk7u/jdk7u/hotspot/file/6e9aa487055f/src/share/vm/classfile/vmSymbols.hpp) 列表中的native方法仅仅是非JIT环境下的一个备份的内部方法。

例如，如果它没有被调用(我也不知道是什么原因)，因此这些方法缺乏一些必要的优化。

从Talk from JAX London的幻灯片11-12可以看到AtomicLong.lazySet(…)在x86系统上会被编译成“mov”指令。

这里是Google Group里关于如何获得JIT装配的一个描述。

## 源码

下面是native方法的实现，因为OpenJDK版本异常复杂，可以看下面libjava版本的。

关于spinlock lock这段，个人理解是自旋等待其他线程结束占用，然后修改内存中value的值。相比直接修改value，延后了删除其他线程中的缓存这一步。

```java
#define SET_FIELD_VOLATILE(obj, offset, type_name, x) \
  oop p = JNIHandles::resolve(obj); \
  OrderAccess::release_store_fence((volatile type_name*)index_oop_from_field_offset_long(p, offset), x);

UNSAFE_ENTRY(void, Unsafe_SetOrderedLong(JNIEnv *env, jobject unsafe, jobject obj, jlong offset, jlong x))
  UnsafeWrapper("Unsafe_SetOrderedLong");
#ifdef SUPPORTS_NATIVE_CX8
  SET_FIELD_VOLATILE(obj, offset, jlong, x);
#else
  // Keep old code for platforms which may not have atomic long (8 bytes) instructions
  {
    if (VM_Version::supports_cx8()) {
      SET_FIELD_VOLATILE(obj, offset, jlong, x);//指令设置
    }
    else {
      Handle p (THREAD, JNIHandles::resolve(obj));
      jlong* addr = (jlong*)(index_oop_from_field_offset_long(p(), offset));
      ObjectLocker ol(p, THREAD);
      *addr = x;
    }
  }
#endif
UNSAFE_END

void
sun::misc::Unsafe::putOrderedLong (jobject obj, jlong offset, jlong value)
{
  volatile jlong *addr = (jlong *) ((char *) obj + offset);//计算value字段地址
  spinlock lock;//自旋
  *addr = value;//设置值
}
```

# 总结

1. 底层还是 C

2. 要知道应用的场景。

# 拓展阅读

# 参考资料

[jdk8 官方文档](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/atomic/AtomicLong.html)

[what-is-atomiclong-in-java-used-for](https://stackoverflow.com/questions/35546956/what-is-atomiclong-in-java-used-for)

https://www.tutorialspoint.com/java_concurrency/concurrency_atomiclong.htm

- 源码

[AtomicLong.lazySet是如何工作的？](http://ifeve.com/how-does-atomiclong-lazyset-work/)

[Java多线程——AtomicLong LongAdder源码解析](https://yq.aliyun.com/articles/651530)

[AtomicLong与LongAdder性能对比](https://zhuanlan.zhihu.com/p/45489739)

* any list
{:toc}
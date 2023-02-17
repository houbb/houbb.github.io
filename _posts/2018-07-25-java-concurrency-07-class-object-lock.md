---
layout: post
title:  Java Concurrency-07-class object lock
date:  2018-07-25 14:44:36 +0800
categories: [Java]
tags: [thread, concurrency, thread, lock]
published: true
---

# Object level Locking vs. Class level Locking

同步是指多线程。同步代码块一次只能由一个线程执行。

Java支持执行多个线程。这可能导致两个或多个线程访问相同的字段或对象。同步是使执行中的所有并发线程保持同步的进程。

同步避免了由于共享内存视图不一致而导致的内存一致性错误。

当一个方法被声明为同步(`synchronized`)时;

如果另一个线程正在执行同步方法，则该线程为该方法的对象持有监视器，您的线程将被阻塞，直到该线程释放监视器为止。

使用 `synchronized` 关键字实现了java中的同步。

- 使用范围

您可以在类中对已定义的方法或块使用 `synchronized` 关键字。

关键字不能与类定义中的变量或属性一起使用。

# Object level locking

当您希望同步一个非静态方法或非静态代码块时，对象级锁是一种机制，以便只有一个线程能够在类的给定实例上执行代码块。

应该始终这样做，以使实例级数据线程安全。可以这样做:

```java
public class DemoClass
{
    public synchronized void demoMethod(){}
}
 
// or
 
public class DemoClass
{
    public void demoMethod(){
        synchronized (this)
        {
            //other thread safe code
        }
    }
}
 
// or
 
public class DemoClass
{
    private final Object lock = new Object();
    public void demoMethod(){
        synchronized (lock)
        {
            //other thread safe code
        }
    }
}
```

# Class level locking

类级锁防止多个线程在运行时的任何可用实例中进入同步块。

这意味着，如果在运行时中有100个DemoClass实例，那么每次只有一个线程能够在任何一个实例中执行demoMethod()，其他所有实例将被锁定为其他线程。

应该始终这样做，以使静态数据线程安全。

```java
public class DemoClass
{
    public synchronized static void demoMethod(){}
}
 
// or
 
public class DemoClass
{
    public void demoMethod(){
        synchronized (DemoClass.class)
        {
            //other thread safe code
        }
    }
}
 
// or
 
public class DemoClass
{
    private final static Object lock = new Object();
    public void demoMethod(){
        synchronized (lock)
        {
            //other thread safe code
        }
    }
}
```

# 笔记

- java中的同步保证没有两个线程可以同时或同时执行需要相同锁的同步方法。

- synchronized 关键字只能与方法和代码块一起使用。这些方法或块可以是静态的，也可以是非静态的。

- 当一个线程进入java同步方法或块时，它会获得一个锁，每当它离开java同步方法或块时，它就会释放锁。即使线程在完成后或由于任何错误或异常而离开同步方法，也会释放锁。

- java `synchronized` 关键字本质上是可重入的，它意味着如果java synchronized方法调用另一个需要相同锁的synchronized方法，那么持有lock的当前线程可以进入该方法，而无需获取lock。

- 如果Java同步块中使用的对象为空，则Java同步将抛出NullPointerException。

例如，在上面的代码示例中，如果锁初始化为null，那么synchronized (lock)将抛出NullPointerException。

- 在Java中同步的方法为您的应用程序带来了性能成本。所以在绝对需要的时候使用同步。另外，考虑使用同步代码块来同步代码的关键部分。

- 静态同步方法和非静态同步方法可以同时运行或同时运行，因为它们锁定不同的对象。

- 根据Java语言规范，您不能使用Java synchronized关键字与构造函数，它是非法的，并导致编译错误。

- 不要在Java中同步块上的非最终字段上同步。因为非最终字段的引用可能随时改变，不同的线程可能在不同的对象上同步，即根本不同步。
最好是使用String类，它已经是不可变的，并且已经声明为final。

# 参考资料

https://howtodoinjava.com/core-java/multi-threading/thread-synchronization-object-level-locking-and-class-level-locking/

https://blog.csdn.net/u013142781/article/details/51697672

* any list
{:toc}
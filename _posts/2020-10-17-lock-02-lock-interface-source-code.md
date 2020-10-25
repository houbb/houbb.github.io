---
layout: post
title:  锁专题（2）Lock 和 Condition 接口简介
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

# 接口源码学习

## 说明 

Lock 接口和 Condition 接口作为锁最核心的两个接口，这里做一下简单介绍，为后续的源码阅读提供基础。

## jdk 版本

```
>java -version
java version "1.8.0_192"
Java(TM) SE Runtime Environment (build 1.8.0_192-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.192-b12, mixed mode)
```

# Lock 接口定义

这个接口是李大狗在 jdk1.5 开始引入的，不得不佩服这位大佬。

@see 提及到的几个类后续都会进行学习。

```java
/*
 * @see ReentrantLock
 * @see Condition
 * @see ReadWriteLock
 *
 * @since 1.5
 * @author Doug Lea
 */
public interface Lock {
    //...
}
```

在包 `java.util.concurrent.locks` 下面。

## 接口说明

Lock实现提供比使用synchronized方法和语句可以获得的更广泛的锁定操作。

它们允许更灵活的结构化，可能具有完全不同的属性，并且可以支持多个相关联的对象Condition。

锁是用于通过多个线程控制对共享资源的访问的工具。 

通常，锁提供对共享资源的独占访问：一次只能有一个线程可以获取锁，并且对共享资源的所有访问都要求首先获取锁。 但是，一些锁可能允许并发访问共享资源，如ReadWriteLock的读锁。

使用synchronized方法或语句提供对与每个对象相关联的隐式监视器锁的访问，但是强制所有锁获取和释放以块结构的方式发生：当获取多个锁时，它们必须以相反的顺序被释放，并且所有的锁都必须被释放在与它们相同的词汇范围内。

虽然synchronized方法和语句的范围机制使得使用监视器锁更容易编程，并且有助于避免涉及锁的许多常见编程错误，但是有时您需要以更灵活的方式处理锁。 

例如，用于遍历并发访问的数据结构的一些算法需要使用“手动”或“链锁定”：您获取节点A的锁定，然后获取节点B，然后释放A并获取C，然后释放B并获得D等。 所述的实施方式中Lock接口通过允许获得并在不同的范围释放的锁，并允许获得并以任何顺序释放多个锁使得能够使用这样的技术。

随着这种增加的灵活性，额外的责任。 

没有块结构化锁定会删除使用synchronized方法和语句发生的锁的自动释放。 

在大多数情况下，应使用以下惯用语：

```java
Lock l = ...; l.lock(); 
try { 
    // access the resource protected by this lock 
} 
finally { 
    l.unlock(); 
} 
```

当在不同范围内发生锁定和解锁时，必须注意确保在锁定时执行的所有代码由try-finally或try-catch保护，以确保在必要时释放锁定。

Lock实现提供了使用synchronized方法和语句的附加功能，通过提供非阻塞尝试来获取锁（ tryLock() ），尝试获取可被中断的锁（ lockInterruptibly()） ，以及尝试获取可以超时（ tryLock(long, TimeUnit) ）。

一个Lock类还可以提供与隐式监视锁定的行为和语义完全不同的行为和语义，例如保证排序，非重入使用或死锁检测。 

如果一个实现提供了这样的专门的语义，那么实现必须记录这些语义。

请注意， Lock实例只是普通对象，它们本身可以用作synchronized语句中的目标。 

获取Lock实例的监视器锁与调用该实例的任何lock()方法没有特定关系。 

建议为避免混淆，您不要以这种方式使用Lock实例，除了在自己的实现中。

除非另有说明，传递任何参数的null值将导致NullPointerException被抛出。

## 内存同步

所有Lock实施必须执行与内置监视器锁相同的内存同步语义，如The Java Language Specification (17.4 Memory Model) 所述 ：

1. 成功的lock操作具有与成功锁定动作相同的内存同步效果。

2. 成功的unlock操作具有与成功解锁动作相同的内存同步效果。

3. 不成功的锁定和解锁操作以及重入锁定/解锁操作，不需要任何内存同步效果。

## 实施注意事项

锁定采集（可中断，不可中断和定时）的三种形式在性能特征，排序保证或其他实施质量方面可能不同。 

此外，在给定的Lock课程中，中断正在获取锁的能力可能不可用。

因此，不需要实现对所有三种形式的锁获取完全相同的保证或语义，也不需要支持正在进行的锁获取的中断。 

需要一个实现来清楚地记录每个锁定方法提供的语义和保证。

它还必须遵守此接口中定义的中断语义，只要支持锁获取的中断，即全部或仅在方法输入。

由于中断通常意味着取消，并且检查中断通常是不频繁的，所以实现可以有利于通过正常方法返回来响应中断。 

即使可以显示中断发生在另一个动作可能已经解除了线程之后，这是真的。 

一个实现应该记录这个行为。

## 方法介绍

| 返回值 | 方法 | 说明 |
|:----|:----|:----|
| void	| lock() | 获得锁。 |
| void	| lockInterruptibly() | 获取锁定，除非当前线程是 interrupted。 |
| Condition	| newCondition() |  返回一个新Condition绑定到该实例Lock实例。 |
| boolean | 	tryLock() | 只有在调用时才可以获得锁。|
| boolean	| tryLock(long time, TimeUnit unit) | 如果在给定的等待时间内是空闲的，并且当前的线程尚未得到 interrupted，则获取该锁。|
| void	| unlock() | 释放锁。|

# Condition 接口

## 接口说明

Condition因素出Object监视器方法（wait， notify和notifyAll ）成不同的对象，以得到具有多个等待集的每个对象，通过将它们与使用任意的组合的效果Lock个实现。 

Lock替换synchronized方法和语句的使用， Condition取代了对象监视器方法的使用。

条件（也称为条件队列或条件变量 ）为一个线程暂停执行（“等待”）提供了一种方法，直到另一个线程通知某些状态现在可能为真。 

因为访问此共享状态信息发生在不同的线程中，所以它必须被保护，因此某种形式的锁与该条件相关联。 等待条件的关键属性是它原子地释放相关的锁并挂起当前线程，就像Object.wait 。

一个Condition实例本质上绑定到一个锁。 

要获得特定Condition实例的Condition实例，请使用其newCondition()方法。

例如，假设我们有一个有限的缓冲区，它支持put和take方法。 

如果在一个空的缓冲区尝试一个take ，则线程将阻塞直到一个项目可用; 如果put试图在一个完整的缓冲区，那么线程将阻塞，直到空间变得可用。 

我们希望在单独的等待集中等待put线程和take线程，以便我们可以在缓冲区中的项目或空间可用的时候使用仅通知单个线程的优化。 

这可以使用两个Condition实例来实现。

```java
class BoundedBuffer {
  final Lock lock = new ReentrantLock();
  final Condition notFull  = lock.newCondition(); 
  final Condition notEmpty = lock.newCondition(); 
  final Object[] items = new Object[100];
  int putptr, takeptr, count;
  public void put(Object x) throws InterruptedException {
    lock.lock(); try {
      while (count == items.length)
        notFull.await();
      items[putptr] = x;
      if (++putptr == items.length) putptr = 0;
      ++count;
      notEmpty.signal();
    } finally { lock.unlock(); }
  }

  public Object take() throws InterruptedException {
    lock.lock(); try {
      while (count == 0)
        notEmpty.await();
      Object x = items[takeptr];
      if (++takeptr == items.length) takeptr = 0;
      --count;
      notFull.signal();
      return x;    } finally { lock.unlock(); }
  }
} 
```

Condition实现可以提供Object监视器方法的行为和语义，例如有保证的通知顺序，或者在执行通知时不需要锁定。 

如果一个实现提供了这样的专门的语义，那么实现必须记录这些语义。

需要注意的是Condition实例只是普通的对象，其本身作为一个目标synchronized语句，可以有自己的监视器wait和notification个方法调用。

获取Condition实例的监视器锁或使用其监视方法与获取与该Condition相关联的Condition或使用其waiting和signalling方法没有特定关系。 
 
建议为避免混淆，您永远不会以这种方式使用Condition实例，除了可能在自己的实现之内。

除非另有说明，传递任何参数的null值将导致NullPointerException被抛出。

### 实施注意事项

当等待Condition时，允许发生“虚假唤醒”，一般来说，作为对底层平台语义的让步。 

这对大多数应用程序几乎没有实际的影响，因为Condition应该始终在循环中等待，测试正在等待的状态谓词。 

一个实现可以免除虚假唤醒的可能性，但建议应用程序员总是假定它们可以发生，因此总是等待循环。

条件等待（可中断，不可中断和定时）的三种形式在一些平台上的易用性和性能特征可能不同。 

特别地，可能难以提供这些特征并保持特定的语义，例如排序保证。 

此外，中断线程实际挂起的能力可能并不总是在所有平台上实现。

因此，不需要一个实现来为所有三种形式的等待定义完全相同的保证或语义，也不需要支持中断线程的实际暂停。

需要一个实现来清楚地记录每个等待方法提供的语义和保证，并且当一个实现确实支持线程挂起中断时，它必须遵守该接口中定义的中断语义。

由于中断通常意味着取消，并且检查中断通常是不频繁的，所以实现可以有利于通过正常方法返回来响应中断。 

即使可以显示中断发生在另一个可能解除阻塞线程的动作之后，这一点也是如此。 

一个实现应该记录这个行为。 

| 返回值 | 方法 | 说明 |
|:----|:----|:----|
| void	| await() |  导致当前线程等到发信号或 interrupted 。| 
| boolean	| await(long time, TimeUnit unit) |  使当前线程等待直到发出信号或中断，或指定的等待时间过去。| 
| long	| awaitNanos(long nanosTimeout) | 使当前线程等待直到发出信号或中断，或指定的等待时间过去。| 
| void	| awaitUninterruptibly() | 使当前线程等待直到发出信号。| 
| boolean	| awaitUntil(Date deadline) | 使当前线程等待直到发出信号或中断，或者指定的最后期限过去。| 
| void	| signal() | 唤醒一个等待线程。 | 
| void	| signalAll() | 唤醒所有等待线程。 | 

# 参考资料

[oracle](https://docs.oracle.com/javase/8/docs/index.html)

https://www.matools.com/api/java8

* any list
{:toc}
---
layout: post
title:  Java Concurrency-05-lock intro 
date:  2018-07-24 16:11:28 +0800
categories: [Java]
tags: [java, concurrency, thread, lock]
published: true
---

# 悲观锁、乐观锁

- 悲观锁(Pessimistic Lock)

顾名思义，就是很悲观，每次去拿数据的时候都认为别人会修改，所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会 block 直到它拿到锁。
传统的关系型数据库里边就用到了很多这种锁机制，比如行锁，表锁等，读锁，写锁等，都是在做操作之前先上锁。

- 乐观锁(Optimistic Lock)

顾名思义，就是很乐观，每次去拿数据的时候都认为别人不会修改，所以不会上锁，但是在更新的时候会判断一下在此期间别人有没有去更新这个数据，可以使用版本号等机制，即对数据做版本控制。
乐观锁适用于多读的应用类型，这样可以提高吞吐量，像数据库如果提供类似于 `write_condition` 机制的其实都是提供的乐观锁。

# 公平锁、非公平锁

- 公平锁(Fair)

加锁前检查是否有排队等待的线程，优先排队等待的线程，先来先得。

- 非公平锁(Nonfair)

加锁时不考虑排队等待问题，直接尝试获取锁，获取不到自动到队尾等待。

`ReentrantLock` 锁内部提供了公平锁与分公平锁内部类之分，默认是非公平锁，如：

```java
public ReentrantLock() {
    sync = new NonfairSync();
}
public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

# 互斥锁、读写锁

- 互斥锁

指的是一次最多只能有一个线程持有的锁。

在jdk1.5之前, 我们通常使用 `synchronized` 机制控制多个线程对共享资源的访问。 

而现在, Lock提供了比synchronized机制更广泛的锁定操作, Lock和synchronized机制的主要区别: 

synchronized 机制提供了对与每个对象相关的隐式监视器锁的访问，并强制所有锁获取和释放均要出现在一个块结构中，当获取了多个锁时, 它们必须以相反的顺序释放。synchronized机制对锁的释放是隐式的，只要线程运行的代码超出了synchronized语句块范围，锁就会被释放。

而Lock机制必须显式的调用Lock对象的unlock()方法才能释放锁，这为获取锁和释放锁不出现在同一个块结构中，以及以更自由的顺序释放锁提供了可能。

- 读写锁

`ReadWriteLock` 接口及其实现类 ReentrantReadWriteLock，默认情况下也是非公平锁。

ReentrantReadWriteLock中定义了2个内部类，`ReentrantReadWriteLock.ReadLock` 和 `ReentrantReadWriteLock.WriteLock`，
分别用来代表读取锁和写入锁，ReentrantReadWriteLock对象提供了readLock()和writeLock()方法，用于获取读取锁和写入锁。

`java.util.concurrent.locks.ReadWriteLock` 接口允许一次读取多个线程，但一次只能写入一个线程：

读锁 - 如果没有线程锁定ReadWriteLock进行写入，则多线程可以访问读锁。

写锁 - 如果没有线程正在读或写，那么一个线程可以访问写锁。

其中：

读取锁允许多个reader线程同时持有，而写入锁最多只能有一个 writer 线程持有。

读写锁的使用场合是：读取数据的频率远大于修改共享数据的频率。

在上述场合下使用读写锁控制共享资源的访问，可以提高并发性能。

如果一个线程已经持有了写入锁，则可以再持有读锁。

相反，如果一个线程已经持有了读取锁，则在释放该读取锁之前，不能再持有写入锁。

可以调用写入锁的 `newCondition()` 方法获取与该写入锁绑定的 Condition 对象，此时与普通的互斥锁并没有什么区别，但是调用读取锁的 newCondition() 方法将抛出异常。


# 可重入锁、不可重入锁

## 可重入锁

可重入锁：即某个线程获得了锁之后，在锁释放前，它可以多次重新获取该锁。

可重入锁解决了**重入死锁**的问题。

java 的内置锁 `synchronized` 和 `ReentrantLock` 都是可重入锁

## 不可重入锁

不可重入锁（自旋锁）：不可以再次进入方法A，也就是说获得锁进入方法A是此线程在释放锁钱唯一的一次进入方法A。

# 参考文档

http://www.hollischuang.com/archives/934

http://www.hollischuang.com/archives/909

https://blog.csdn.net/truelove12358/article/details/54963791

https://blog.csdn.net/loongshawn/article/details/76985272

* any list
{:toc}
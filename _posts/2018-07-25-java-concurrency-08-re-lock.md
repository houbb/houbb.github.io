---
layout: post
title:  Java Concurrency-08-reentrant lock
date:  2018-07-25 15:34:17 +0800
categories: [Java]
tags: [thread, concurrency, thread, lock]
published: true
---

# 锁是否可重入

锁分为可重入锁和不可重入锁。 
可重入和不可重入的概念是这样的：当一个线程获得了当前实例的锁，并进入方法A，这个线程在没有释放这把锁的时候，能否再次进入方法A呢？

- 可重入锁

可以再次进入方法A，就是说在释放锁前此线程可以再次进入方法A（方法A递归）。

- 不可重入锁（自旋锁）

不可以再次进入方法A，也就是说获得锁进入方法A是此线程在释放锁钱唯一的一次进入方法A。

# 可重入锁

可重入锁，也叫做递归锁，指的是同一线程外层函数获得锁之后 ，内层递归函数仍然有获取该锁的代码，但不受影响。

可重入锁是一种特殊的互斥锁，它可以被同一个线程多次获取，而不会产生死锁。 

在JAVA环境下 `ReentrantLock` 和 `synchronized` 都是 可重入锁

1. 首先它是互斥锁：任意时刻，只有一个线程锁。

即假设A线程已经获取了锁，在A线程释放这个锁之前，B线程是无法获取到这个锁的，B要获取这个锁就会进入阻塞状态。 

2. 其次，它可以被同一个线程多次持有。

即，假设A线程已经获取了这个锁，如果A线程在释放锁之前又一次请求获取这个锁，那么是能够获取成功的。 

举例说明：

## Synchronized

- SynchronizedDemo.java

```java
public class SynchronizedDemo implements Runnable {

    public synchronized void get(){
        System.out.println(Thread.currentThread().getId());
        set();
    }

    public synchronized void set(){
        System.out.println(Thread.currentThread().getId());
    }

    @Override
    public void run() {
        get();
    }

    public static void main(String[] args) {
        SynchronizedDemo ss=new SynchronizedDemo();
        new Thread(ss).start();
        new Thread(ss).start();
        new Thread(ss).start();
    }
}
```

- 运行日志

```
10
10
12
12
11
11
```

## ReentrantLock

- ReentrantLockDemo.java

```java
public class ReentrantLockDemo implements Runnable {

    ReentrantLock lock = new ReentrantLock();

    public void get() {
        lock.lock();
        System.out.println(Thread.currentThread().getId());
        set();
        lock.unlock();
    }

    public void set() {
        lock.lock();
        System.out.println(Thread.currentThread().getId());
        lock.unlock();
    }

    @Override
    public void run() {
        get();
    }

    public static void main(String[] args) {
        ReentrantLockDemo ss = new ReentrantLockDemo();
        new Thread(ss).start();
        new Thread(ss).start();
        new Thread(ss).start();
    }
}
```

- 输出日志

```
10
10
11
11
12
12
```

# 不可重入锁

## 自旋锁

- SpinLock.java

对于自旋锁来说，

1、若有同一线程两调用lock() ，会导致第二次调用lock位置进行自旋，产生了死锁
说明这个锁并不是可重入的。（在lock函数内，应验证线程是否为已经获得锁的线程）

2、若1问题已经解决，当unlock（）第一次调用时，就已经将锁释放了。实际上不应释放锁。
（采用计数次进行统计）

```java
public class SpinLock implements Runnable {


    private AtomicReference<Thread> owner =new AtomicReference<>();

    public void lock(){
        Thread current = Thread.currentThread();
        while(!owner.compareAndSet(null, current)){
        }
    }
    public void unlock (){
        Thread current = Thread.currentThread();
        owner.compareAndSet(current, null);
    }


    public void get() {
        this.lock();
        System.out.println(Thread.currentThread().getId());
        set();
        this.unlock();
    }

    public void set() {
        this.lock();
        System.out.println(Thread.currentThread().getId());
        this.unlock();
    }

    @Override
    public void run() {
        get();
    }

    public static void main(String[] args) {
        SpinLock lock = new SpinLock();
        new Thread(lock).start();
        new Thread(lock).start();
        new Thread(lock).start();
    }

}
```

- 输出日志

```
10

// 卡死
```

## 自旋锁改进

改进成为可重入锁

```java
public class SpinLockBetter implements Runnable {

    private AtomicReference<Thread> owner = new AtomicReference<>();

    private int count = 0;

    public void lock() {
        Thread current = Thread.currentThread();

        // 判断是否已经拥有此线程
        if (current == owner.get()) {
            count++;
            return;
        }
        while (!owner.compareAndSet(null, current)) {
        }
    }

    public void unlock() {
        Thread current = Thread.currentThread();
        if (current == owner.get()) {
            if (count != 0) {
                count--;
            } else {
                owner.compareAndSet(current, null);
            }
        }
    }

    public void get() {
        this.lock();
        System.out.println(Thread.currentThread().getId());
        set();
        this.unlock();
    }

    public void set() {
        this.lock();
        System.out.println(Thread.currentThread().getId());
        this.unlock();
    }

    @Override
    public void run() {
        get();
    }


    public static void main(String[] args) {
        SpinLockBetter ss = new SpinLockBetter();
        new Thread(ss).start();
        new Thread(ss).start();
        new Thread(ss).start();
    }
}
```

改进后，可以和前面一样正常运行。

# 参考资料

https://blog.csdn.net/soonfly/article/details/70918802

http://blog.jobbole.com/108571/

https://www.cnblogs.com/cposture/p/SpinLock.html

https://blog.csdn.net/yanyan19880509/article/details/52345422

* any list
{:toc}
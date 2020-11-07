---
layout: post
title:  锁专题（9） ArrayBlockingQueue 使用入门及源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

# ArrayBlockingQueue

![ArrayBlockingQueue](https://images.gitee.com/uploads/images/2020/1107/131551_68a4e1f9_508704.png)

## 简介

由数组支持的有界阻塞队列。该队列对元素FIFO（先进先出）进行排序。

队列的开头是已在队列中停留最长时间的元素。

队列的尾部是最短时间位于队列中的元素。

新元素插入到队列的尾部，并且队列检索操作在队列的开头获取元素。

## 应用场景

多线程环境中，通过队列可以很容易实现数据共享，比如经典的“生产者”和“消费者”模型中，通过队列可以很便利地实现两者之间的数据共享。

BlockingQueue 最核心的两个特点：

（1）当队列中没有数据的情况下，消费者端的所有线程都会被自动阻塞（挂起），直到有数据放入队列。

（2）当队列中填满数据的情况下，生产者端的所有线程都会被自动阻塞（挂起），直到队列中有空的位置，线程被自动唤醒。

这个特性，可以让开发者不用在关心其中的逻辑，而是专注于自己的业务。


## 核心方法

在使用之前，让我们一起看一个简单的例子。

### 添加元素

| 方法 | 说明 | 是否阻塞 |
|:---|:---|:----|
| offer(E) | 尝试设置，成功返回 true; 失败返回 false | 否 |
| offer(E, timeout, TimeUnit) | 指定时间内尝试设置，未成功返回失败 | 是 |
| put(E) | 阻塞线程，直到设置成功。 | 是 |

### 移除元素

| 方法 | 说明 | 是否阻塞 |
|:---|:---|:----|
| poll(time) | 指定时间内获取队头的元素，失败返回 null | 是 |
| poll(timeout, TimeUnit) | 指定时间内获取队头的元素，失败返回 null | 是 |
| take() | 阻塞线程，直到获取成功。 | 是 |
| drainTo() | 一次性从 BlockingQueue 获取所有可用的数据对象，可以提升获取效率。 | 是 |


## 例子

定义对应的设置和获取方法。

```java
public class ArrayBlockingQueueDemo {

    private ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(3);

    public void put(final String put) throws InterruptedException {
        System.out.println("设置开始");
        TimeUnit.SECONDS.sleep(1);
        queue.put(put);
        System.out.println("设置完成: " + put);
    }

    public void take() throws InterruptedException {
        System.out.println("获取开始");
        String take = queue.take();
        System.out.println("获取成功: " + take);
    }
}
```

测试例，我们模拟两个线程：

```java
public static void main(String[] args) {
    final ArrayBlockingQueueDemo queueTest = new ArrayBlockingQueueDemo();
    // 写入线程
    new Thread(new Runnable() {
        @Override
        public void run() {
            try {
                for(int i = 0; i < 3; i++) {
                    queueTest.put(i+"T");
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }).start();

    // 读取线程
    new Thread(new Runnable() {
        @Override
        public void run() {
            try {
                while (true) {
                    queueTest.take();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }).start();
}
```

测试日志如下:

```
设置开始
获取开始
设置完成: 0T
获取成功: 0T
获取开始
设置开始
设置完成: 1T
设置开始
获取成功: 1T
获取开始
设置完成: 2T
获取成功: 2T
获取开始
```

![ArrayBlockingQueue-face](https://images.gitee.com/uploads/images/2020/1107/131939_5d69a503_508704.png)

# 源码解析

## 类定义

```java
public class ArrayBlockingQueue<E> extends AbstractQueue<E>
        implements BlockingQueue<E>, java.io.Serializable {
}
```

实现了 BlockingQueue 接口，并且继承自 AbstractQueue。

## 内部属性

其实可以看到底层是通过 ReentrantLock 可重入锁保证并发安全的。

```java
/** The queued items */
// 内部的数组
final Object[] items;

/** items index for next take, poll, peek or remove */
// 存放 take 的 indx
int takeIndex;

/** items index for next put, offer, or add */
int putIndex;
// 存放 put 的 index

/** Number of elements in the queue */
// 队列中元素的个数
int count;

/*
 * Concurrency control uses the classic two-condition algorithm
 * found in any textbook.
 */
/** Main lock guarding all access */
// 并发锁
final ReentrantLock lock;

/** Condition for waiting takes */
// 不为空的条件 
private final Condition notEmpty;

/** Condition for waiting puts */
// 不满的条件
private final Condition notFull;
```

## 构造器

可以看出我们不但可以指定容量，也可以指定是否使用公平锁。

这个对应创建的就是是否公平的可重入锁。

notEmpty 和 notFull 是对应的两个 condition。

```java
public ArrayBlockingQueue(int capacity) {
    this(capacity, false);
}

public ArrayBlockingQueue(int capacity, boolean fair) {
    if (capacity <= 0)
        throw new IllegalArgumentException();
    this.items = new Object[capacity];
    lock = new ReentrantLock(fair);
    notEmpty = lock.newCondition();
    notFull =  lock.newCondition();
}
```

## put 设置元素

我们看一下最核心的方法：

```java
/**
* Inserts the specified element at the tail of this queue, waiting
* for space to become available if the queue is full.
* @author 老马啸西风
*/
public void put(E e) throws InterruptedException {
    // 校验是否为 null
    checkNotNull(e);

    // 使用可打断的模式加锁
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {

        // 如果队列是满的，notFull 条件进入等待。
        while (count == items.length)
            notFull.await();

        // 执行入队    
        enqueue(e);
    } finally {
        lock.unlock();
    }
}
```

### 入队方法

```java
/**
 * Inserts element at current put position, advances, and signals.
 * Call only when holding lock.
 *
 * @author 老马啸西风
 */
private void enqueue(E x) {
    // assert lock.getHoldCount() == 1;
    // assert items[putIndex] == null;
    final Object[] items = this.items;
    items[putIndex] = x;

    // 如果队列已经满了，则设置 putIndx=0
    if (++putIndex == items.length)
        putIndex = 0;
    
    // 增加个数
    count++;

    // 唤醒 notEmpty 的等待线程    
    notEmpty.signal();
}
```

## 出队

看了前面的入队之后，实际上出队也是类似的。

```java
/**
 * @author 老马啸西风
 */
public E take() throws InterruptedException {
    // 可中断的锁
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        // 如果队列为空，则进行 notEmpty 等待
        while (count == 0)
            notEmpty.await();

        // 执行出队    
        return dequeue();
    } finally {
        lock.unlock();
    }
}
```

### 出队方法

```java
/**
 * Extracts element at current take position, advances, and signals.
 * Call only when holding lock.
 * @author 老马啸西风
 */
private E dequeue() {
    // assert lock.getHoldCount() == 1;
    // assert items[takeIndex] != null;
    final Object[] items = this.items;
    @SuppressWarnings("unchecked")
    E x = (E) items[takeIndex];
    // 对应的元素置空
    items[takeIndex] = null;

    // 如果 takeIndex 已经到最大值，则重置为 0
    if (++takeIndex == items.length)
        takeIndex = 0;
    // 元素个数-1
    count--;

    // 这里还额外更新了迭代器的信息。
    if (itrs != null)
        itrs.elementDequeued();

    // 唤醒 notFull 元素
    notFull.signal();
    return x;
}
```

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[BlockingQueue应用场景](https://blog.csdn.net/luzhensmart/article/details/81712583)


* any list
{:toc}
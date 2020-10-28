---
layout: post
title:  锁专题（9） ArrayBlockingQueue 使用入门及源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

# ArrayBlockingQueue

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

# 阻塞队列全家桶

## 1. ArrayBlockingQueue

基于数组的阻塞队列实现，在ArrayBlockingQueue内部，维护了一个定长数组，以便缓存队列中的数据对象，这是一个常用的阻塞队列，除了一个定长数组外，ArrayBlockingQueue内部还保存着两个整形变量，分别标识着队列的头部和尾部在数组中的位置。

ArrayBlockingQueue在生产者放入数据和消费者获取数据，都是共用同一个锁对象，由此也意味着两者无法真正并行运行，这点尤其不同于LinkedBlockingQueue；按照实现原理来分析，ArrayBlockingQueue完全可以采用分离锁，从而实现生产者和消费者操作的完全并行运行。Doug Lea之所以没这样去做，也许是因为ArrayBlockingQueue的数据写入和获取操作已经足够轻巧，以至于引入独立的锁机制，除了给代码带来额外的复杂性外，其在性能上完全占不到任何便宜。 ArrayBlockingQueue和LinkedBlockingQueue间还有一个明显的不同之处在于，前者在插入或删除元素时不会产生或销毁任何额外的对象实例，而后者则会生成一个额外的Node对象。这在长时间内需要高效并发地处理大批量数据的系统中，其对于GC的影响还是存在一定的区别。而在创建ArrayBlockingQueue时，我们还可以控制对象的内部锁是否采用公平锁，默认采用非公平锁。

## 2. LinkedBlockingQueue

基于链表的阻塞队列，同ArrayListBlockingQueue类似，其内部也维持着一个数据缓冲队列（该队列由一个链表构成），当生产者往队列中放入一个数据时，队列会从生产者手中获取数据，并缓存在队列内部，而生产者立即返回；只有当队列缓冲区达到最大值缓存容量时（LinkedBlockingQueue可以通过构造函数指定该值），才会阻塞生产者队列，直到消费者从队列中消费掉一份数据，生产者线程会被唤醒，反之对于消费者这端的处理也基于同样的原理。而LinkedBlockingQueue之所以能够高效的处理并发数据，还因为其对于生产者端和消费者端分别采用了独立的锁来控制数据同步，这也意味着在高并发的情况下生产者和消费者可以并行地操作队列中的数据，以此来提高整个队列的并发性能。
作为开发者，我们需要注意的是，如果构造一个LinkedBlockingQueue对象，而没有指定其容量大小，LinkedBlockingQueue会默认一个类似无限大小的容量（Integer.MAX_VALUE），这样的话，如果生产者的速度一旦大于消费者的速度，也许还没有等到队列满阻塞产生，系统内存就有可能已被消耗殆尽了。

ArrayBlockingQueue和LinkedBlockingQueue是两个最普通也是最常用的阻塞队列，一般情况下，在处理多线程间的生产者消费者问题，使用这两个类足以。

## 3. DelayQueue

DelayQueue中的元素只有当其指定的延迟时间到了，才能够从队列中获取到该元素。

DelayQueue是一个没有大小限制的队列，因此往队列中插入数据的操作（生产者）永远不会被阻塞，而只有获取数据的操作（消费者）才会被阻塞。

使用场景：

DelayQueue使用场景较少，但都相当巧妙，常见的例子比如使用一个DelayQueue来管理一个超时未响应的连接队列。

## 4. PriorityBlockingQueue

基于优先级的阻塞队列（优先级的判断通过构造函数传入的Compator对象来决定），但需要注意的是PriorityBlockingQueue并不会阻塞数据生产者，而只会在没有可消费的数据时，阻塞数据的消费者。

因此使用的时候要特别注意，生产者生产数据的速度绝对不能快于消费者消费数据的速度，否则时间一长，会最终耗尽所有的可用堆内存空间。

在实现PriorityBlockingQueue时，内部控制线程同步的锁采用的是公平锁。

## 5. SynchronousQueue

一种无缓冲的等待队列，类似于无中介的直接交易，有点像原始社会中的生产者和消费者，生产者拿着产品去集市销售给产品的最终消费者，而消费者必须亲自去集市找到所要商品的直接生产者，如果一方没有找到合适的目标，那么对不起，大家都在集市等待。

相对于有缓冲的BlockingQueue来说，少了一个中间经销商的环节（缓冲区），如果有经销商，生产者直接把产品批发给经销商，而无需在意经销商最终会将这些产品卖给那些消费者，由于经销商可以库存一部分商品，因此相对于直接交易模式，总体来说采用中间经销商的模式会吞吐量高一些（可以批量买卖）；但另一方面，又因为经销商的引入，使得产品从生产者到消费者中间增加了额外的交易环节，单个产品的及时响应性能可能会降低。

声明一个SynchronousQueue有两种不同的方式，它们之间有着不太一样的行为。

公平模式和非公平模式的区别:

如果采用公平模式：SynchronousQueue会采用公平锁，并配合一个FIFO队列来阻塞多余的生产者和消费者，从而体系整体的公平策略；

但如果是非公平模式（SynchronousQueue默认）：SynchronousQueue采用非公平锁，同时配合一个LIFO队列来管理多余的生产者和消费者，而后一种模式，如果生产者和消费者的处理速度有差距，则很容易出现饥渴的情况，即可能有某些生产者或者是消费者的数据永远都得不到处理。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[BlockingQueue应用场景](https://blog.csdn.net/luzhensmart/article/details/81712583)


* any list
{:toc}
---
layout: post
title:  锁专题（9） LinkedBlockingQueue 使用入门及源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

# 问题

![LinkedBlockingQueue](https://images.gitee.com/uploads/images/2020/1107/133519_07c2e461_508704.png)

- LinkedBlockingQueue 是什么？

- 优缺点？

- 应用场景？

- 源码实现？

- 个人启发？

# LinkedBlockingQueue

双向并发阻塞队列。

所谓双向是指可以从队列的头和尾同时操作，并发只是线程安全的实现，阻塞允许在入队出队不满足条件时挂起线程，这里说的队列是指支持FIFO/FILO实现的链表。

1. 要想支持阻塞功能，队列的容量一定是固定的，否则无法在入队的时候挂起线程。也就是capacity是final类型的。

2. 既然是双向链表，每一个结点就需要前后两个引用，这样才能将所有元素串联起来，支持双向遍历。也即需要prev/next两个引用。

3. 双向链表需要头尾同时操作，所以需要first/last两个节点，当然可以参考LinkedList那样采用一个节点的双向来完成，那样实现起来就稍微麻烦点。

4. 既然要支持阻塞功能，就需要锁和条件变量来挂起线程。这里使用一个锁两个条件变量来完成此功能。

## 优缺点

优点当然是功能足够强大，同时由于采用一个独占锁，因此实现起来也比较简单。所有对队列的操作都加锁就可以完成。同时独占锁也能够很好的支持双向阻塞的特性。

凡事有利必有弊。缺点就是由于独占锁，所以不能同时进行两个操作，这样性能上就大打折扣。从性能的角度讲LinkedBlockingDeque要比LinkedQueue要低很多，比CocurrentLinkedQueue就低更多了，这在高并发情况下就比较明显了。

前面分析足够多的Queue实现后，LinkedBlockingDeque的原理和实现就不值得一提了，无非是在独占锁下对一个链表的普通操作。

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

我们实现 put 和 take，分别模拟写入工作者，和取出工作者。


```java
package com.github.houbb.lock.test.lock;

import java.util.concurrent.*;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class LinkedBlockingQueueDemo {

    private BlockingQueue<String> queue = new LinkedBlockingQueue<>(3);

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

测试代码：

```java
public static void main(String[] args) {
    final LinkedBlockingQueueDemo queueTest = new LinkedBlockingQueueDemo();
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

日志如下：

```
设置开始
获取开始
设置完成: 0T
获取成功: 0T
获取开始
设置开始
设置完成: 1T
获取成功: 1T
获取开始
设置开始
设置完成: 2T
获取成功: 2T
获取开始
```

# LinkedBlockingQueue 源码

## jdk 版本

```
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.191-b12, mixed mode)
```

## 算法简介

“两个锁队列”算法的一种变体。 putLock设置了看跌期权（和卖出价）的入口，并具有等待看跌期权的相关条件。

对于takeLock同样。 

他们俩都依赖的“ count”字段作为原子进行维护，以避免在大多数情况下都需要获得两个锁。

同样，为了最大程度地减少获取putLock的需求，反之亦然，使用了级联通知。

当认沽权通知其至少启用了一个卖空时，它将向买受人发出信号。

如果自信号发出后输入了更多项目，则该接收者又会发信号通知其他人。

并对称地用于信令放置。 

诸如remove（Object）和迭代器之类的操作均获得这两个锁。


提供作者和读者之间的可见性，如下所示：

每当将元素放入队列时，都会获取putLock并更新计数。

后续的读取器通过获取putLock（通过fullyLock）或通过获取takeLock，然后读取 `n = count.get();` 来保证对排队的节点的可见性。 

这样就可以看到前n个项目。


为了实现弱一致性的迭代器，看来我们需要使所有节点都可以从先前的出队节点GC到达。

这将导致两个问题：

- 允许恶意的Iterator导致无限的内存保留

- 如果某个节点在使用期间处于使用期，则导致旧节点到新节点的跨代链接，这导致了一代代GC难以处理，从而导致重复的主要集合。

但是，只有未删除的节点可以从出队节点到达，并且可达性不必一定是GC理解的那种。

我们使用链接刚刚退出队列的Node的技巧。

这样的自链接意味着前进到head.next。

## 类定义

实现了 BlockingQueue 接口，继承自 AbstractQueue 抽象类。

```java
public class LinkedBlockingQueue<E> extends AbstractQueue<E>
        implements BlockingQueue<E>, java.io.Serializable {
    private static final long serialVersionUID = -6903933977591709194L;
}
```

## 序列化

有趣的是此类支持序列化，但是Node并不支持序列化，因此fist/last就不能序列化，那么如何完成序列化/反序列化过程呢？

```java
private void writeObject(java.io.ObjectOutputStream s)
    throws java.io.IOException {
    lock.lock();
    try {
        // Write out capacity and any hidden stuff
        s.defaultWriteObject();
        // Write out all elements in the proper order.
        for (Node<E> p = first; p != null; p = p.next)
            s.writeObject(p.item);
        // Use trailing null as sentinel
        s.writeObject(null);
    } finally {
        lock.unlock();
    }
}
 
private void readObject(java.io.ObjectInputStream s)
    throws java.io.IOException, ClassNotFoundException {
    s.defaultReadObject();
    count = 0;
    first = null;
    last = null;
    // Read in all elements and place in queue
    for (;;) {
        E item = (E)s.readObject();
        if (item == null)
            break;
        add(item);
    }
}
```

描述的是LinkedBlockingDeque序列化/反序列化的过程。

序列化时将真正的元素写入输出流，最后还写入了一个null。

读取的时候将所有对象列表读出来，如果读取到一个null就表示结束。

这就是为什么写入的时候写入一个null的原因，因为没有将count写入流，所以就靠null来表示结束，省一个整数空间。

## 内部变量

### 基本节点

```java
/**
 * Linked list node class
 * 单向的链表节点。
 */
static class Node<E> {
    E item;
    /**
     * One of:
     * - the real successor Node
     * - this Node, meaning the successor is head.next
     * - null, meaning there is no successor (this is the last node)
     */
    Node<E> next;
    Node(E x) { item = x; }
}

/** The capacity bound, or Integer.MAX_VALUE if none 
** 队列的容量大小
*/
private final int capacity;

/** Current number of elements 
** aotmic 变量，用于统计元素个数
*/
private final AtomicInteger count = new AtomicInteger();

/**
 * Head of linked list.
 * Invariant: head.item == null
 * 头节点
 */
transient Node<E> head;

/**
 * Tail of linked list.
 * Invariant: last.next == null
 * 尾巴节点
 */
private transient Node<E> last;
```

### 并发控制

```java
/** Lock held by take, poll, etc */
private final ReentrantLock takeLock = new ReentrantLock();
/** Wait queue for waiting takes */
private final Condition notEmpty = takeLock.newCondition();
/** Lock held by put, offer, etc */
private final ReentrantLock putLock = new ReentrantLock();
/** Wait queue for waiting puts */
private final Condition notFull = putLock.newCondition();
```

## 构造器

实际上这个默认容量这么大，感觉是用不到的。

不过既然是 LinkedList 基于链表实现，大概是想表达长度不受限制的意思。

```java
/**
 * Creates a {@code LinkedBlockingQueue} with a capacity of
 * {@link Integer#MAX_VALUE}.
 */
public LinkedBlockingQueue() {
    this(Integer.MAX_VALUE);
}


/**
 * Creates a {@code LinkedBlockingQueue} with the given (fixed) capacity.
 *
 * @param capacity the capacity of this queue
 * @throws IllegalArgumentException if {@code capacity} is not greater
 *         than zero
 */
public LinkedBlockingQueue(int capacity) {
    if (capacity <= 0) throw new IllegalArgumentException();
    this.capacity = capacity;

    // 初始化头结点和尾巴节点
    last = head = new Node<E>(null);
}
```

还有一个基于集合初始化的构造器：

```java
/**
 * Creates a {@code LinkedBlockingQueue} with a capacity of
 * {@link Integer#MAX_VALUE}, initially containing the elements of the
 * given collection,
 * added in traversal order of the collection's iterator.
 *
 * @param c the collection of elements to initially contain
 * @throws NullPointerException if the specified collection or any
 *         of its elements are null
 */
public LinkedBlockingQueue(Collection<? extends E> c) {
    // 首先初始化基本属性
    this(Integer.MAX_VALUE);

    // 声明一个写入锁
    final ReentrantLock putLock = this.putLock;
    putLock.lock(); // Never contended, but necessary for visibility
    try {
        int n = 0;
        for (E e : c) {
            // 禁止元素为 null
            
            if (e == null)
                throw new NullPointerException();
            if (n == capacity)
                throw new IllegalStateException("Queue full");
            enqueue(new Node<E>(e));
            ++n;
        }
        count.set(n);
    } finally {
        putLock.unlock();
    }
}
```

### 这里问一下大家，为什么禁止为 null 呢？

BlockingQueue 不接受 null 值的插入，相应的方法在碰到 null 的插入时会抛出 NullPointerException 异常。

null 值在这里通常用于作为特殊值返回，比如 poll() 返回 null，则代表 poll 失败。

所以，如果允许插入 null 值的话，那获取的时候，就不能很好地用 null 来判断到底是代表失败，还是获取的值就是 null 值。


### enqueue 入队

```java
/**
 * Links node at end of queue.
 *
 * @param node the node
 */
private void enqueue(Node<E> node) {
    // assert putLock.isHeldByCurrentThread();
    // assert last.next == null;
    last = last.next = node;
}
```

这个方法写的非常的精炼。

建议看不懂的同学可以分成 2 步来看：

```java
last.next = node;
last = last.next;
```

将 node 节点放在队列的最后，将 last.next 变为新的队尾。


## put 放入元素

我们来重点看一下 put() 方法。

```java
/**
 * Inserts the specified element at the tail of this queue, waiting if
 * necessary for space to become available.
 *
 * @throws InterruptedException {@inheritDoc}
 * @throws NullPointerException {@inheritDoc}
 * @author 老马啸西风
 */
public void put(E e) throws InterruptedException {
    if (e == null) throw new NullPointerException();

    // Note: convention in all put/take/etc is to preset local var
    // holding count negative to indicate failure unless set.
    int c = -1;

    // 创建节点
    Node<E> node = new Node<E>(e);

    // 并发控制
    final ReentrantLock putLock = this.putLock;
    final AtomicInteger count = this.count;
    putLock.lockInterruptibly();
    try {
        /*
         * Note that count is used in wait guard even though it is
         * not protected by lock. This works because count can
         * only decrease at this point (all other puts are shut
         * out by lock), and we (or some other waiting put) are
         * signalled if it ever changes from capacity. Similarly
         * for all other uses of count in other wait guards.

         * 如果队列已经满了，则进入等待。
         */
        while (count.get() == capacity) {
            notFull.await();
        }

        // 执行入队
        enqueue(node);
        c = count.getAndIncrement();

        // 这里挺有趣的，如果判断未满，则会唤醒 notFull
        if (c + 1 < capacity)
            notFull.signal();
    } finally {
        putLock.unlock();
    }

    // c == 0,说明的是刚才新增成功了。因为默认是-1
    if (c == 0)
        signalNotEmpty();
}
```

### signalNotEmpty

这个方法是通知 notEmpty，便于元素可以取出。

```java
/**
 * Signals a waiting take. Called only from put/offer (which do not
 * otherwise ordinarily lock takeLock.)
 */
private void signalNotEmpty() {
    final ReentrantLock takeLock = this.takeLock;
    takeLock.lock();
    try {
        notEmpty.signal();
    } finally {
        takeLock.unlock();
    }
}
```

当然这里的对于 notEmpty 的唤醒，是通过 takeLock 保证并发安全的。

这样看来，LinkedBlockingQuue 和 ArrayBlockingQueue 实现上还是有很大差异的。

## take 获取元素

获取元素的实现如下：

```java
/**
** 获取一个元素
** @author 老马啸西风
*/
public E take() throws InterruptedException {
    E x;

    // 默认的 c = -1;
    int c = -1;

    // 并发控制。
    // 注意，这里的读写锁是分离的。这个和 ArrayBlockingList 是不同的。
    final AtomicInteger count = this.count;
    final ReentrantLock takeLock = this.takeLock;
    takeLock.lockInterruptibly();
    try {
        // 如果元素为空，则陷入等待。
        while (count.get() == 0) {
            notEmpty.await();
        }

        // 执行出队
        x = dequeue();
        c = count.getAndDecrement();

        // 如果总数 > 1，则说明不再为空。
        // 唤醒 notEmpty 等待的线程
        if (c > 1)
            notEmpty.signal();
    } finally {
        takeLock.unlock();
    }

    // 如果总数等于容量，唤醒 notFull
    // 感觉这个唤醒微妙，因为 capacity 默认是 Integer#MAX_VALUE 最大值
    if (c == capacity)
        signalNotFull();
    return x;
}
```

### dequeue 出队方法

```java
/**
 * Removes a node from head of queue.
 * 从队首移除元素
 *
 * @author 老马啸西风
 * @return the node
 */
private E dequeue() {
    // assert takeLock.isHeldByCurrentThread();
    // assert head.item == null;
    Node<E> h = head;

    // first 节点变为原来 head.next 节点
    Node<E> first = h.next;
    h.next = h; // help GC

    // 更新 head 节点
    head = first;
    // 记录出队的元素
    E x = first.item;
    first.item = null;
    return x;
}
```

### signalNotFull 唤醒 notFull

```java
/**
 * Signals a waiting put. Called only from take/poll.
 * 唤醒所有等待放入的线程。
 */
private void signalNotFull() {
    final ReentrantLock putLock = this.putLock;
    putLock.lock();
    try {
        notFull.signal();
    } finally {
        putLock.unlock();
    }
}
```

# 小结

本文从 LinkedBlockingQueue 的入门使用，逐渐深入到源码分析。

实际上原理都是类似的，不过这个对比 ArrayBlockingQueeu 的锁粒度更加细致。

没读源码之前，我一直以为二者只是链表和数组的区别。

**很多事情，都不是我们以为的那个样子。**

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[BlockingQueue应用场景](https://blog.csdn.net/luzhensmart/article/details/81712583)

* any list
{:toc}
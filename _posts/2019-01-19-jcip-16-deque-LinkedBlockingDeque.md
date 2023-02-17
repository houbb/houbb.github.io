---
layout: post
title:  JCIP-16-双端队列之 LinkedBlockingDeque
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, data-struct, sh]
published: true
---

# 问题

- LinkedBlockingDeque 是什么？

- 优缺点？

- 应用场景？

- 源码实现？

- 个人启发？

# LinkedBlockingDeque

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

## 使用案例

我们还是来看一个生产者消费者的例子。

### 生产者

```java
private static class Producer implements Runnable{
    private BlockingDeque<Integer> queue;
    public Producer(BlockingDeque<Integer> queue) {
        this.queue = queue;
    }
    @Override
    public void run() {
        while(true) {
            try {
                Integer num = ThreadLocalRandom.current().nextInt(100);
                queue.put(num);
                System.out.println(String.format("%s producer a num %d",Thread.currentThread().getName(),num));
                Thread.sleep(1000);
            } catch (InterruptedException e1) {
                e1.printStackTrace();
            }
        }
    }
}
```

### 消费者

```java
private static class Consumer implements Runnable{
    private BlockingDeque<Integer> queue;
    public Consumer(BlockingDeque<Integer> queue) {
        this.queue = queue;
    }
    @Override
    public void run() {
        while(true) {
            try {
                System.out.println(String.format("%s consume a num %d",Thread.currentThread().getName(),queue.take()));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

### 测试代码

```java
public static void main(String[] args) {
    BlockingDeque<Integer> queue = new LinkedBlockingDeque<>(100);
    new Thread(new Producer(queue),"Producer").start();
    new Thread(new Consumer(queue),"Consumer").start();
}
```

测试日志：

```
Producer producer a num 62
Consumer consume a num 62
Producer producer a num 19
Consumer consume a num 19
Producer producer a num 26
Consumer consume a num 26
Consumer consume a num 39
Producer producer a num 39
```


# 序列化

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

描述的是LinkedBlockingDeque序列化/反序列化的过程。序列化时将真正的元素写入输出流，最后还写入了一个null。

读取的时候将所有对象列表读出来，如果读取到一个null就表示结束。

这就是为什么写入的时候写入一个null的原因，因为没有将count写入流，所以就靠null来表示结束，省一个整数空间。


# 源码解析

## 接口

```java
/**
 * @since 1.6
 * @author  Doug Lea
 * @param <E> the type of elements held in this collection
 */
public class LinkedBlockingDeque<E>
    extends AbstractQueue<E>
    implements BlockingDeque<E>, java.io.Serializable {
```

## 双向链表节点

```java
/** Doubly-linked list node class */
static final class Node<E> {
    /**
     * The item, or null if this node has been removed.
     */
    E item;
    /**
     * One of:
     * - the real predecessor Node
     * - this Node, meaning the predecessor is tail
     * - null, meaning there is no predecessor
     */
    Node<E> prev;
    /**
     * One of:
     * - the real successor Node
     * - this Node, meaning the successor is head
     * - null, meaning there is no successor
     */
    Node<E> next;
    Node(E x) {
        item = x;
    }
}
```

## 基础属性

```java
/**
 * Pointer to first node.
 * Invariant: (first == null && last == null) ||
 *            (first.prev == null && first.item != null)
 */
transient Node<E> first;
/**
 * Pointer to last node.
 * Invariant: (first == null && last == null) ||
 *            (last.next == null && last.item != null)
 */
transient Node<E> last;
/** Number of items in the deque */
private transient int count;
/** Maximum number of items in the deque */
private final int capacity;
/** Main lock guarding all access */
final ReentrantLock lock = new ReentrantLock();
/** Condition for waiting takes */
private final Condition notEmpty = lock.newCondition();
/** Condition for waiting puts */
private final Condition notFull = lock.newCondition();
```

## 构造器

```java
    /**
     * Creates a {@code LinkedBlockingDeque} with a capacity of
     * {@link Integer#MAX_VALUE}.
     */
    public LinkedBlockingDeque() {
        this(Integer.MAX_VALUE);
    }

    /**
     * Creates a {@code LinkedBlockingDeque} with the given (fixed) capacity.
     *
     * @param capacity the capacity of this deque
     * @throws IllegalArgumentException if {@code capacity} is less than 1
     */
    public LinkedBlockingDeque(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException();
        this.capacity = capacity;
    }

    /**
     * Creates a {@code LinkedBlockingDeque} with a capacity of
     * {@link Integer#MAX_VALUE}, initially containing the elements of
     * the given collection, added in traversal order of the
     * collection's iterator.
     *
     * @param c the collection of elements to initially contain
     * @throws NullPointerException if the specified collection or any
     *         of its elements are null
     */
    public LinkedBlockingDeque(Collection<? extends E> c) {
        this(Integer.MAX_VALUE);
        final ReentrantLock lock = this.lock;
        lock.lock(); // Never contended, but necessary for visibility
        try {
            for (E e : c) {
                if (e == null)
                    throw new NullPointerException();
                if (!linkLast(new Node<E>(e)))
                    throw new IllegalStateException("Deque full");
            }
        } finally {
            lock.unlock();
        }
    }
```

### 吐槽

默认竟然构造成最大整数，真是令人费解？

### 初始化线程安全保证

使用了 ReentrantLock 可互斥锁，来保证线程安全性。

看的出来，如果有元素为空，会直接抛出异常。

## 添加元素

```java
    /**
     * @throws IllegalStateException if this deque is full
     * @throws NullPointerException {@inheritDoc}
     */
    public void addFirst(E e) {
        if (!offerFirst(e))
            throw new IllegalStateException("Deque full");
    }

    /**
     * @throws IllegalStateException if this deque is full
     * @throws NullPointerException  {@inheritDoc}
     */
    public void addLast(E e) {
        if (!offerLast(e))
            throw new IllegalStateException("Deque full");
    }

    /**
     * @throws NullPointerException {@inheritDoc}
     */
    public boolean offerFirst(E e) {
        if (e == null) throw new NullPointerException();
        Node<E> node = new Node<E>(e);
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return linkFirst(node);
        } finally {
            lock.unlock();
        }
    }

    /**
     * @throws NullPointerException {@inheritDoc}
     */
    public boolean offerLast(E e) {
        if (e == null) throw new NullPointerException();
        Node<E> node = new Node<E>(e);
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return linkLast(node);
        } finally {
            lock.unlock();
        }
    }

    /**
     * @throws NullPointerException {@inheritDoc}
     * @throws InterruptedException {@inheritDoc}
     */
    public void putFirst(E e) throws InterruptedException {
        if (e == null) throw new NullPointerException();
        Node<E> node = new Node<E>(e);
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            while (!linkFirst(node))
                notFull.await();
        } finally {
            lock.unlock();
        }
    }

    /**
     * @throws NullPointerException {@inheritDoc}
     * @throws InterruptedException {@inheritDoc}
     */
    public void putLast(E e) throws InterruptedException {
        if (e == null) throw new NullPointerException();
        Node<E> node = new Node<E>(e);
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            while (!linkLast(node))
                notFull.await();
        } finally {
            lock.unlock();
        }
    }

    /**
     * @throws NullPointerException {@inheritDoc}
     * @throws InterruptedException {@inheritDoc}
     */
    public boolean offerFirst(E e, long timeout, TimeUnit unit)
        throws InterruptedException {
        if (e == null) throw new NullPointerException();
        Node<E> node = new Node<E>(e);
        long nanos = unit.toNanos(timeout);

        // 有没有想过为什么不是直接使用 this.lock.lockInterruptibly?
        // 在默认的 HotSpot 中，局部变量是存储在局部线程存储区中的，在这里将共享区中的变量复制到局部线程存储区中是为了加速变量的访问速度。 
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            while (!linkFirst(node)) {
                if (nanos <= 0)
                    return false;
                nanos = notFull.awaitNanos(nanos);
            }
            return true;
        } finally {
            lock.unlock();
        }
    }

    /**
     * @throws NullPointerException {@inheritDoc}
     * @throws InterruptedException {@inheritDoc}
     */
    public boolean offerLast(E e, long timeout, TimeUnit unit)
        throws InterruptedException {
        if (e == null) throw new NullPointerException();
        Node<E> node = new Node<E>(e);
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            while (!linkLast(node)) {
                if (nanos <= 0)
                    return false;
                nanos = notFull.awaitNanos(nanos);
            }
            return true;
        } finally {
            lock.unlock();
        }
    }
```

## linkFirst & linkLast

这里使用了 Condition 类来保证队列阻塞。 

见 [阻塞队列实现原理](https://houbb.github.io/2019/01/18/jcip-09-blocking-queue#%E9%98%BB%E5%A1%9E%E9%98%9F%E5%88%97%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86)


```java
    /**
     * Links node as first element, or returns false if full.
     */
    private boolean linkFirst(Node<E> node) {
        // assert lock.isHeldByCurrentThread();
        if (count >= capacity)
            return false;
        Node<E> f = first;
        node.next = f;
        first = node;
        if (last == null)
            last = node;
        else
            f.prev = node;
        ++count;
        notEmpty.signal();
        return true;
    }

    /**
     * Links node as last element, or returns false if full.
     */
    private boolean linkLast(Node<E> node) {
        // assert lock.isHeldByCurrentThread();
        if (count >= capacity)
            return false;
        Node<E> l = last;
        node.prev = l;
        last = node;
        if (first == null)
            first = node;
        else
            l.next = node;
        ++count;
        notEmpty.signal();
        return true;
    }
```

## 移除元素

```java
    /**
     * @throws NoSuchElementException {@inheritDoc}
     */
    public E removeFirst() {
        E x = pollFirst();
        if (x == null) throw new NoSuchElementException();
        return x;
    }

    /**
     * @throws NoSuchElementException {@inheritDoc}
     */
    public E removeLast() {
        E x = pollLast();
        if (x == null) throw new NoSuchElementException();
        return x;
    }

    public E pollFirst() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return unlinkFirst();
        } finally {
            lock.unlock();
        }
    }

    public E pollLast() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return unlinkLast();
        } finally {
            lock.unlock();
        }
    }
```

### unlinkLast & unlinkFirst

原理和 linkFirst 是类似的，仍然使用 Condition 保证阻塞。

```java
    /**
     * Removes and returns first element, or null if empty.
     */
    private E unlinkFirst() {
        // assert lock.isHeldByCurrentThread();
        Node<E> f = first;
        if (f == null)
            return null;
        Node<E> n = f.next;
        E item = f.item;
        f.item = null;
        f.next = f; // help GC
        first = n;
        if (n == null)
            last = null;
        else
            n.prev = null;
        --count;
        notFull.signal();
        return item;
    }

    /**
     * Removes and returns last element, or null if empty.
     */
    private E unlinkLast() {
        // assert lock.isHeldByCurrentThread();
        Node<E> l = last;
        if (l == null)
            return null;
        Node<E> p = l.prev;
        E item = l.item;
        l.item = null;
        l.prev = l; // help GC
        last = p;
        if (p == null)
            first = null;
        else
            p.next = null;
        --count;
        notFull.signal();
        return item;
    }

    /**
     * Unlinks x.
     */
    void unlink(Node<E> x) {
        // assert lock.isHeldByCurrentThread();
        Node<E> p = x.prev;
        Node<E> n = x.next;
        if (p == null) {
            unlinkFirst();
        } else if (n == null) {
            unlinkLast();
        } else {
            p.next = n;
            n.prev = p;
            x.item = null;
            // Don't mess with x's links.  They may still be in use by
            // an iterator.
            --count;
            notFull.signal();
        }
    }
```




## 获取元素

```java
    public E takeFirst() throws InterruptedException {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            E x;
            while ( (x = unlinkFirst()) == null)
                notEmpty.await();
            return x;
        } finally {
            lock.unlock();
        }
    }

    public E takeLast() throws InterruptedException {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            E x;
            while ( (x = unlinkLast()) == null)
                notEmpty.await();
            return x;
        } finally {
            lock.unlock();
        }
    }

    public E pollFirst(long timeout, TimeUnit unit)
        throws InterruptedException {
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            E x;
            while ( (x = unlinkFirst()) == null) {
                if (nanos <= 0)
                    return null;
                nanos = notEmpty.awaitNanos(nanos);
            }
            return x;
        } finally {
            lock.unlock();
        }
    }

    public E pollLast(long timeout, TimeUnit unit)
        throws InterruptedException {
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            E x;
            while ( (x = unlinkLast()) == null) {
                if (nanos <= 0)
                    return null;
                nanos = notEmpty.awaitNanos(nanos);
            }
            return x;
        } finally {
            lock.unlock();
        }
    }

    /**
     * @throws NoSuchElementException {@inheritDoc}
     */
    public E getFirst() {
        E x = peekFirst();
        if (x == null) throw new NoSuchElementException();
        return x;
    }

    /**
     * @throws NoSuchElementException {@inheritDoc}
     */
    public E getLast() {
        E x = peekLast();
        if (x == null) throw new NoSuchElementException();
        return x;
    }

    public E peekFirst() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return (first == null) ? null : first.item;
        } finally {
            lock.unlock();
        }
    }

    public E peekLast() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return (last == null) ? null : last.item;
        } finally {
            lock.unlock();
        }
    }

```

这些代码大同小异，都是使用 ReentrantLock 保证线程安全性。

使用 Condition 保证阻塞性。

# 小结

1. 使用 ReentrantLock 保证线程安全性。可以说掌握这个就掌握了大部分的同步容器。

2. 使用 Condition 保证阻塞性，掌握这个就掌握了大部分的阻塞队列容器。

3. 所有的容器都有优缺点。比如双向队列，就有对应的并发容器。我们要学习原理，化为自己所用。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://blog.csdn.net/vernonzheng/article/details/8267541

https://blog.csdn.net/qq_38293564/article/details/80592429

[LinkedBlockingDeque源码学习](https://www.jianshu.com/p/2adf7d66a0d3)

* any list
{:toc}
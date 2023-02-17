---
layout: post
title:  JCIP-17-双端队列之 ConcurrentLinkedDeque
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, data-struct, sh]
published: true
excerpt: JCIP-17-双端队列之 ConcurrentLinkedDeque
---

# 问题

- ConcurrentLinkedDeque 是什么？

- 优缺点？

- 应用场景？

- 源码实现？

- 个人启发？

# 引言

在并发编程中我们有时候需要使用线程安全的队列。

如果我们要实现一个线程安全的队列有两种实现方式一种是使用阻塞算法，另一种是使用非阻塞算法。

使用阻塞算法的队列可以用一个锁（入队和出队用同一把锁）或两个锁（入队和出队用不同的锁）等方式来实现，而非阻塞的实现方式则可以使用循环CAS的方式来实现，本文让我们一起来研究下Doug Lea是如何使用非阻塞的方式来实现线程安全队列ConcurrentLinkedQueue的，相信从大师身上我们能学到不少并发编程的技巧。

# ConcurrentLinkedDeque

ConcurrentLinkedQueue是一个基于链接节点的无界线程安全队列，它采用先进先出的规则对节点进行排序，当我们添加一个元素的时候，它会添加到队列的尾部，当我们获取一个元素时，它会返回队列头部的元素。

ConcurrentLinkedDeque是一种基于链接节点的无限并发链表。可以安全地并发执行插入、删除和访问操作。当许多线程同时访问一个公共集合时，ConcurrentLinkedDeque是一个合适的选择。

和大多数其他并发的集合类型一样，这个类不允许使用空元素。

## 算法

它采用了“wait－free”算法来实现，该算法在Michael & Scott算法上进行了一些修改, Michael & Scott算法的详细信息可以参见[http://www.cs.rochester.edu/u/scott/papers/1996_PODC_queues.pdf]http://www.cs.rochester.edu/u/scott/papers/1996_PODC_queues.pdf)。

## 注意的地方

与大多数集合类型不同，其size方法不是一个常量操作。因为链表的异步性质，确定当前元素的数量需要遍历所有的元素，所以如果在遍历期间有其他线程修改了这个集合，size方法就可能会报告不准确的结果。

同时，对链表的批量操作也不是一个原子操作，在使用的时候要注意，在API文档中这样表述：

批量的操作：包括添加、删除或检查多个元素，比如addAll(java.util.Collection<? extends E>)、removeIf(java.util.function.Predicate<? super E>)或者removeIf(java.util.function.Predicate<? super E>)或forEach(java.util.function.Consumer<? super E>)方法，这个类型并不保证以原子方式执行。

由此可见如果想保证原子访问，不得使用批量操作的方法。

# 线程安全的队列对比

我来分析设计一个线程安全的队列哪几种方法。

## synchronized 同步队列

第一种：使用synchronized同步队列，就像Vector或者Collections.synchronizedList/Collection那样。
 显然这不是一个好的并发队列，这会导致吞吐量急剧下降。

## Lock 同步队列

第二种：使用Lock。一种好的实现方式是使用ReentrantReadWriteLock来代替ReentrantLock提高读取的吞吐量。
 但是显然 ReentrantReadWriteLock的实现更为复杂，而且更容易导致出现问题，
 另外也不是一种通用的实现方式，因为 ReentrantReadWriteLock适合哪种读取量远远大于写入量的场合。
 当然了ReentrantLock是一种很好的实现，结合 Condition能够很方便的实现阻塞功能，
 这在后面介绍BlockingQueue的时候会具体分析。

## CAS 操作

第三种：使用CAS操作。尽管Lock的实现也用到了CAS操作，但是毕竟是间接操作，而且会导致线程挂起。
 一个好的并发队列就是采用某种非阻塞算法来取得最大的吞吐量。

ConcurrentLinkedQueue采用的就是第三种策略。

它采用了参考资料1（http://www.cs.rochester.edu/u/scott/papers/1996_PODC_queues.pdf） 中的算法。

要使用非阻塞算法来完成队列操作，那么就需要一种“循环尝试”的动作，就是循环操作队列，直到成功为止，失败就会再次尝试。

# 简单实用例子

## 场景

向公共列表中插入元素。

## 示例编码

```java
import java.util.concurrent.ConcurrentLinkedDeque;

public class CLDMain {
	private static ConcurrentLinkedDeque<String> cld = new ConcurrentLinkedDeque<>();
	
	public static void main(String[] args) {
		int numThread = Runtime.getRuntime().availableProcessors();
		Thread[] threads = new Thread[numThread];
		for (int i = 0; i < threads.length; i++) {
			(threads[i] = new Thread(addTask(), "Thread "+i)).start();
		}
	}
	
	public static Runnable addTask() {
		return new Runnable() {
			
			@Override
			public void run() {
				int num = Runtime.getRuntime().availableProcessors();
				for (int i = 0; i < num; i++) {
					StringBuilder item = new StringBuilder("Item ").append(i);
					cld.addFirst(item.toString());
					callbackAdd(Thread.currentThread().getName(), item);
				}
				callbackFinish(Thread.currentThread().getName());
			}
		};
	}
	
	public static void callbackAdd(String threadName, StringBuilder item) {
		StringBuilder builder = new StringBuilder(threadName).append(" added :").append(item);
		System.out.println(builder);
	}
	
	public static void callbackFinish(String threadName) {
		StringBuilder builder = new StringBuilder(threadName).append(" has Finished");
		System.out.println(builder);
		System.out.println(new StringBuilder("CurrentSize ").append(cld.size()));
	}
}
```

- 输出日志

```java
Thread 0 added :Item 0
Thread 0 added :Item 1
Thread 0 added :Item 2
Thread 0 added :Item 3
Thread 0 has Finished
CurrentSize 6
Thread 1 added :Item 0
Thread 2 added :Item 0
Thread 2 added :Item 1
Thread 2 added :Item 2
Thread 2 added :Item 3
Thread 1 added :Item 1
Thread 1 added :Item 2
Thread 2 has Finished
Thread 1 added :Item 3
Thread 1 has Finished
CurrentSize 13
CurrentSize 13
Thread 3 added :Item 0
Thread 3 added :Item 1
Thread 3 added :Item 2
Thread 3 added :Item 3
Thread 3 has Finished
CurrentSize 16
```

## 简单分析

该程序实现了多线程并发添加大量元素到一个公共的链表，刚好是ConcurrentLinkedDeque的典型使用场景。

同时也验证了上面的说法，即size()方法需要遍历链表，可能返回错误的结果。

# 源码分析

## 接口

```java
/**
 * @since 1.7
 * @author Doug Lea
 * @author Martin Buchholz
 * @param <E> the type of elements held in this collection
 */
public class ConcurrentLinkedDeque<E>
    extends AbstractCollection<E>
    implements Deque<E>, java.io.Serializable {
```

## Node 节点定义

```java
static final class Node<E> {
    volatile Node<E> prev;
    volatile E item;
    volatile Node<E> next;
    Node() {  // default constructor for NEXT_TERMINATOR, PREV_TERMINATOR
    }
    /**
     * Constructs a new node.  Uses relaxed write because item can
     * only be seen after publication via casNext or casPrev.
     */
    Node(E item) {
        UNSAFE.putObject(this, itemOffset, item);
    }
    boolean casItem(E cmp, E val) {
        return UNSAFE.compareAndSwapObject(this, itemOffset, cmp, val);
    }
    void lazySetNext(Node<E> val) {
        UNSAFE.putOrderedObject(this, nextOffset, val);
    }
    boolean casNext(Node<E> cmp, Node<E> val) {
        return UNSAFE.compareAndSwapObject(this, nextOffset, cmp, val);
    }
    void lazySetPrev(Node<E> val) {
        UNSAFE.putOrderedObject(this, prevOffset, val);
    }
    boolean casPrev(Node<E> cmp, Node<E> val) {
        return UNSAFE.compareAndSwapObject(this, prevOffset, cmp, val);
    }
    // Unsafe mechanics
    private static final sun.misc.Unsafe UNSAFE;
    private static final long prevOffset;
    private static final long itemOffset;
    private static final long nextOffset;
    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            Class<?> k = Node.class;
            prevOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("prev"));
            itemOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("item"));
            nextOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("next"));
        } catch (Exception e) {
            throw new Error(e);
        }
    }
}
```

> volatile 参见 [volatile](https://houbb.github.io/2018/07/27/jmm-05-volatile)

> UnSafe 参见 [UnSafe](https://houbb.github.io/2019/01/20/juc-05-unsafe)

ps: 这里对 UnSafe 不熟练，看起来比较吃力。

## 基础属性

```java
    private static final int HOPS = 2;

    private transient volatile Node<E> tail;

    private static final Node<Object> PREV_TERMINATOR, NEXT_TERMINATOR;

    @SuppressWarnings("unchecked")
    Node<E> prevTerminator() {
        return (Node<E>) PREV_TERMINATOR;
    }

    @SuppressWarnings("unchecked")
    Node<E> nextTerminator() {
        return (Node<E>) NEXT_TERMINATOR;
    }
```

## 构造器

```java
    /**
     * Constructs an empty deque.
     */
    public ConcurrentLinkedDeque() {
        head = tail = new Node<E>(null);
    }

    /**
     * Constructs a deque initially containing the elements of
     * the given collection, added in traversal order of the
     * collection's iterator.
     *
     * @param c the collection of elements to initially contain
     * @throws NullPointerException if the specified collection or any
     *         of its elements are null
     */
    public ConcurrentLinkedDeque(Collection<? extends E> c) {
        // Copy c into a private chain of Nodes
        Node<E> h = null, t = null;
        for (E e : c) {
            checkNotNull(e);
            Node<E> newNode = new Node<E>(e);
            if (h == null)
                h = t = newNode;
            else {
                t.lazySetNext(newNode);
                newNode.lazySetPrev(t);
                t = newNode;
            }
        }
        initHeadTail(h, t);
    }
```

### 用到的方法

- checkNotNull

校验元素不为 null。

ps: 这种方法竟然没有统一的方法类。。。

```java
/**
 * Throws NullPointerException if argument is null.
 *
 * @param v the element
 */
private static void checkNotNull(Object v) {
    if (v == null)
        throw new NullPointerException();
}
```

- initHeadTail

初始化头和尾

```java
/**
 * Initializes head and tail, ensuring invariants hold.
 */
private void initHeadTail(Node<E> h, Node<E> t) {
    if (h == t) {
        if (h == null)
            h = t = new Node<E>(null);
        else {
            // Avoid edge case of a single Node with non-null item.
            Node<E> newNode = new Node<E>(null);
            t.lazySetNext(newNode);
            newNode.lazySetPrev(t);
            t = newNode;
        }
    }
    head = h;
    tail = t;
}
```

## 添加元素

和原来类似，也分为头尾。也有 add/offer。本系列只选取一个来看，后面都是如此。

```java
    /**
     * Links e as first element.
     */
    private void linkFirst(E e) {
        checkNotNull(e);
        final Node<E> newNode = new Node<E>(e);

        restartFromHead:
        for (;;)
            for (Node<E> h = head, p = h, q;;) {
                if ((q = p.prev) != null &&
                    (q = (p = q).prev) != null)
                    // Check for head updates every other hop.
                    // If p == q, we are sure to follow head instead.
                    p = (h != (h = head)) ? h : q;
                else if (p.next == p) // PREV_TERMINATOR
                    continue restartFromHead;
                else {
                    // p is first node
                    newNode.lazySetNext(p); // CAS piggyback
                    if (p.casPrev(null, newNode)) {
                        // Successful CAS is the linearization point
                        // for e to become an element of this deque,
                        // and for newNode to become "live".
                        if (p != h) // hop two nodes at a time
                            casHead(h, newNode);  // Failure is OK.
                        return;
                    }
                    // Lost CAS race to another thread; re-read prev
                }
            }
    }
```

`restartFromHead:` 这里应该是一个 goto 的语法，用在合适的地方就是好语法。

这里用了 CAS 来保证线程安全性。

### cas 方法

```java
private boolean casHead(Node<E> cmp, Node<E> val) {
    return UNSAFE.compareAndSwapObject(this, headOffset, cmp, val);
}

private boolean casTail(Node<E> cmp, Node<E> val) {
    return UNSAFE.compareAndSwapObject(this, tailOffset, cmp, val);
}
```

## 移除元素

```java
public E pollLast() {
    for (Node<E> p = last(); p != null; p = pred(p)) {
        E item = p.item;
        if (item != null && p.casItem(item, null)) {
            unlink(p);
            return item;
        }
    }
    return null;
}
```

### 私有方法

- unlink

```java
    /**
     * Unlinks non-null node x.
     */
    void unlink(Node<E> x) {
        // assert x != null;
        // assert x.item == null;
        // assert x != PREV_TERMINATOR;
        // assert x != NEXT_TERMINATOR;

        final Node<E> prev = x.prev;
        final Node<E> next = x.next;
        if (prev == null) {
            unlinkFirst(x, next);
        } else if (next == null) {
            unlinkLast(x, prev);
        } else {
            // Unlink interior node.
            //
            // This is the common case, since a series of polls at the
            // same end will be "interior" removes, except perhaps for
            // the first one, since end nodes cannot be unlinked.
            //
            // At any time, all active nodes are mutually reachable by
            // following a sequence of either next or prev pointers.
            //
            // Our strategy is to find the unique active predecessor
            // and successor of x.  Try to fix up their links so that
            // they point to each other, leaving x unreachable from
            // active nodes.  If successful, and if x has no live
            // predecessor/successor, we additionally try to gc-unlink,
            // leaving active nodes unreachable from x, by rechecking
            // that the status of predecessor and successor are
            // unchanged and ensuring that x is not reachable from
            // tail/head, before setting x's prev/next links to their
            // logical approximate replacements, self/TERMINATOR.
            Node<E> activePred, activeSucc;
            boolean isFirst, isLast;
            int hops = 1;

            // Find active predecessor
            for (Node<E> p = prev; ; ++hops) {
                if (p.item != null) {
                    activePred = p;
                    isFirst = false;
                    break;
                }
                Node<E> q = p.prev;
                if (q == null) {
                    if (p.next == p)
                        return;
                    activePred = p;
                    isFirst = true;
                    break;
                }
                else if (p == q)
                    return;
                else
                    p = q;
            }

            // Find active successor
            for (Node<E> p = next; ; ++hops) {
                if (p.item != null) {
                    activeSucc = p;
                    isLast = false;
                    break;
                }
                Node<E> q = p.next;
                if (q == null) {
                    if (p.prev == p)
                        return;
                    activeSucc = p;
                    isLast = true;
                    break;
                }
                else if (p == q)
                    return;
                else
                    p = q;
            }

            // TODO: better HOP heuristics
            if (hops < HOPS
                // always squeeze out interior deleted nodes
                && (isFirst | isLast))
                return;

            // Squeeze out deleted nodes between activePred and
            // activeSucc, including x.
            skipDeletedSuccessors(activePred);
            skipDeletedPredecessors(activeSucc);

            // Try to gc-unlink, if possible
            if ((isFirst | isLast) &&

                // Recheck expected state of predecessor and successor
                (activePred.next == activeSucc) &&
                (activeSucc.prev == activePred) &&
                (isFirst ? activePred.prev == null : activePred.item != null) &&
                (isLast  ? activeSucc.next == null : activeSucc.item != null)) {

                updateHead(); // Ensure x is not reachable from head
                updateTail(); // Ensure x is not reachable from tail

                // Finally, actually gc-unlink
                x.lazySetPrev(isFirst ? prevTerminator() : x);
                x.lazySetNext(isLast  ? nextTerminator() : x);
            }
        }
    }
```

TODO:...

后续补充

# 参考资料

https://segmentfault.com/a/1190000013144544

[聊聊并发（六）ConcurrentLinkedQueue的实现原理分析](http://ifeve.com/concurrentlinkedqueue/)

https://blog.csdn.net/lifuxiangcaohui/article/details/8051144

* any list
{:toc}


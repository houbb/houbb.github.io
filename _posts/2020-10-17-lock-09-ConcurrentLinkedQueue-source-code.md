---
layout: post
title:  锁专题（9） ConcurrentLinkedQueue 源码深度解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

# ConcurrentLinkedQueue

## 简介

这个类由李大狗和 Martin Buchholz 一起实现的。

ConcurrentLinkedQueue是一个基于链接节点的无界**线程安全队列**，遵循队列的FIFO原则，队尾入队，队首出队。

注意：此队列不允许使用 null 元素。

## 入门案例

这里我们主要演示方法使用，就不演示并发安全了，后面源码会解释。

```java
ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();

// add()  将指定元素插入此队列的尾部。
queue.add("add");

// offer()  将指定元素插入此队列的尾部。
queue.offer("offer");

// peek() 获取但不移除此队列的头；如果此队列为空，则返回 null
String value = queue.peek();
System.out.println("PEEK: " + value);

// poll() 获取并移除此队列的头，如果此队列为空，则返回 null。
String poll = queue.poll();
System.out.println("POLL: " + poll);

// remove() 移除 从队列中移除指定元素的单个实例（如果存在）。
boolean remove = queue.remove("offer");
System.out.println("Remove result: " + remove);
```

输出日志：

```
PEEK: add
POLL: add
Remove result: true
```

# 几个简单的问题

## 阻塞队列和非阻塞队列如何实现线程安全？

阻塞队列可以用一个锁（入队和出队共享一把锁）或者两个锁（入队使用一把锁，出队使用一把锁）来实现线程安全，JDK中典型的实现是 BlockingQueue。

非阻塞队列可以用循环CAS的方式来保证数据的一致性，来保证线程安全。

## iterator 是一致性的吗？

其实 jdk 文档中有说明，迭代器是弱一致性的（weakly consistent）。

## 复杂度 & 内存一致性

时间复杂度：不是恒定时间操作。由于这些队列的异步性质，确定当前元素数需要对元素进行遍历，因此，如果在遍历期间修改此集合，可能会报告不正确的结果。

内存一致性影响：与其他并发集合一样，在将对象放入ConcurrentLinkedQueue之前在线程中执行操作。

# java 源码

## java 版本

```
java version "1.8.0_192"
Java(TM) SE Runtime Environment (build 1.8.0_192-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.192-b12, mixed mode)
```

## 类定义

```java
public class ConcurrentLinkedQueue<E> extends AbstractQueue<E>
        implements Queue<E>, java.io.Serializable {
    private static final long serialVersionUID = 196745693267521676L;
}
```

实现了 Queue 接口，并且继承自  AbstractQueue 类。

## 节点定义

和其他队列一样，我们需要定义一个 Node 节点。

我们看到这是一个单向的 node，都是通过 `volatile` 关键字声明的。

对 volatile 不太熟的同学，可以阅读下

> [工作5年了，竟然不知道 volatile 关键字](https://www.toutiao.com/item/6885685189117706756/)

```java
private static class Node<E> {
    volatile E item;
    volatile Node<E> next;
    /**
     * Constructs a new node.  Uses relaxed write because item can
     * only be seen after publication via casNext.
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
    // Unsafe mechanics
    private static final sun.misc.Unsafe UNSAFE;
    private static final long itemOffset;
    private static final long nextOffset;
    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            Class<?> k = Node.class;
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

这里的操作都是通过 `Unsafe` 来实现的，我们可以简单的认为就是 CAS 实现，后续会讲解下 Unsafe 这个类。

### 定义头和尾

做事情一定要有头有尾：

```java
private transient volatile Node<E> tail;

private transient volatile Node<E> head;
```

这里通过 volatile 声明了头尾变量，保证线程间可见性和 happends-before 语义。

## 构造器

构造器实现也比较简单：

```java
/**
 * Creates a {@code ConcurrentLinkedQueue} that is initially empty.
 *
 * 直接初始化 head/tail 节点
 */
public ConcurrentLinkedQueue() {
    head = tail = new Node<E>(null);
}


public ConcurrentLinkedQueue(Collection<? extends E> c) {
    Node<E> h = null, t = null;

    // 遍历元素
    for (E e : c) {
        // 验证数据不可为 null
        checkNotNull(e);

        Node<E> newNode = new Node<E>(e);
        if (h == null)
            h = t = newNode;
        else {
            
            t.lazySetNext(newNode);
            t = newNode;
        }
    }
    if (h == null)
        h = t = new Node<E>(null);
    head = h;
    tail = t;
}
```

第二个相对麻烦一点。

### lazySetNext

lazySetNex 这个方法非常有趣，我们以前介绍 AtomicInteger 的时候介绍过，此处再复述一遍。

高级程序员都知道 volatile 可以保证变量在线程间的可见性，但是这里再问一句，不使用 volatile 修饰就无法保证可见性了吗？

事实上，这里完全可以不用 volatile 变量来修饰这些共享状态，

1. 因为访问共享状态之前先要获得锁, Lock.lock()方法能够获得锁，而获得锁的操作和volatile变量的读操作一样，会强制使CPU缓存失效，强制从内存读取变量。

2. Lock.unlock()方法释放锁时，和写volatile变量一样，会强制刷新CPU写缓冲区，把缓存数据写到主内存

底层也是通过加内存屏障实现的。

而lazySet()优化原理，就是在**不需要让共享变量的修改立刻让其他线程可见的时候，以设置普通变量的方式来修改共享状态，可以减少不必要的内存屏障，从而提高程序执行的效率。**


## 添加元素

add 直接调用的 offer，可见二者没有区别。因为基于链表实现，是没有大小限制的。

```java
public boolean add(E e) {
    return offer(e);
}
```

offer 实现：

```java
/**
 * Inserts the specified element at the tail of this queue.
 * As the queue is unbounded, this method will never return {@code false}.
 *
 * @return {@code true} (as specified by {@link Queue#offer})
 * @throws NullPointerException if the specified element is null
 */
public boolean offer(E e) {
    // 非空校验
    checkNotNull(e);

    // 创建新节点
    final Node<E> newNode = new Node<E>(e);

    //从尾节点进行插入
    //（这种写法看起来比较迷惑人）
    for (Node<E> t = tail, p = t;;) {
        Node<E> q = p.next;

        // 如果q==null说明p是尾节点，则执行插入
        // 目的就是把新的元素插入到队列尾部
        if (q == null) {
            // p is last node

            // 使用CAS设置p节点的next节点，预期本来是 null，设置为新节点。
            if (p.casNext(null, newNode)) {
                // Successful CAS is the linearization point
                // for e to become an element of this queue,
                // and for newNode to become "live".
                // cas成功，则说明新增节点已经被放入链表，然后设置当前尾节点
                if (p != t) // hop two nodes at a time
                    casTail(t, newNode);  // Failure is OK.
                return true;
            }
            // Lost CAS race to another thread; re-read next
        }
        else if (p == q)
            // We have fallen off list.  If tail is unchanged, it
            // will also be off-list, in which case we need to
            // jump to head, from which all live nodes are always
            // reachable.  Else the new tail is a better bet.

            // 多线程操作时候，由于poll操作移除元素后有可能会把head变为自引用，然后head的next变为新head，所以这里需要重新找新的head，因为新的head后面的节点才是正常的节点。
            // 自引用的节点，会被 GC 回收
            p = (t != (t = tail)) ? t : head;
        else
            // Check for tail updates after two hops.
            // 寻找尾节点
            p = (p != t && t != (t = tail)) ? t : q;
    }
}
```

## poll 移除元素

这里使用了我们非常讨厌的类似 goto 的功能。



```java
public E poll() {
    restartFromHead:

    // 直接一个 while(true) 新欢
    for (;;) {

        // 从头开始执行循环
        for (Node<E> h = head, p = h, q;;) {
            E item = p.item;

            // 如果元素不为空，且 CAS 设置成功。
            // 则说明移除元素成功
            if (item != null && p.casItem(item, null)) {
                // Successful CAS is the linearization point
                // for item to be removed from this queue.
                if (p != h) // hop two nodes at a time
                    updateHead(h, ((q = p.next) != null) ? q : p);
                return item;
            }
            // 当前队列为空则返回null
            else if ((q = p.next) == null) {
                updateHead(h, p);
                return null;
            }
            // 自引用了，则重新找新的队列头节点，后续会被 GC 回收。
            // 执行分支中如果发现头节点被修改了要跳到外层循环重新获取新的头节点。
            else if (p == q)
                continue restartFromHead;
            else
                p = q;
        }
    }
}
```

更新头结点的方法：

```java
/**
 * Tries to CAS head to p. If successful, repoint old head to itself
 * as sentinel for succ(), below.

 * 尝试通过 CAS 将 head 设置为 P，如果成功，请将旧头 head 指向自己，作为下面 succ 的标记。
 */
final void updateHead(Node<E> h, Node<E> p) {
    if (h != p && casHead(h, p))
        h.lazySetNext(h);
}

private boolean casHead(Node<E> cmp, Node<E> val) {
    return UNSAFE.compareAndSwapObject(this, headOffset, cmp, val);
}
```


# 算法说明

这个算法是来自于 [http://www.cs.rochester.edu/u/michael/PODC96.html](http://www.cs.rochester.edu/u/michael/PODC96.html)

不过可惜的是，我现在去看已经不见了。

## jdk 中的算法笔记

这是对Michael＆Scott算法的修改，适用于垃圾回收环境，并支持内部节点删除（以支持remove（Object））。

要进行解释，请阅读 [paper](https://www.cs.rochester.edu/u/scott/papers/1996_PODC_queues.pdf)。

ps: 这个我们后续专门用一节去阅读论文。

请注意，与该程序包中的大多数非阻塞算法一样，此实现依赖于以下事实：**在垃圾回收系统中，由于回收的节点而不会出现ABA问题，因此无需使用“计数指针”或相关技术** 在非GC设置中使用的版本中可以看到。


基本不变式是：

- 刚好有一个（最后一个）节点，其下一个引用为空，入队时将进行CAS附加。

可以从尾部的O（1）时间到达最后一个节点，但是尾部仅仅是一种优化-它也总是可以从头部的O（N）时间到达。

- 队列中包含的元素是节点中从头可到达的非空项目。

将Node的项目引用CAS原子化为null会将其从队列中删除。

即使在并行修改导致 head 前进的情况下，所有 head 的可达性也必须保持正确。

由于创建了Iterator或只是丢失了其时间片的 poll()，出队节点可能会无限期保持使用状态。


上面的内容似乎暗示所有节点都可以从先前的出队节点通过GC到达。

这将导致两个问题：

（1）允许恶意的Iterator导致无限的内存保留

（2）如果某个节点在使用中处于使用期，则导致旧节点到新节点的跨代链接，这导致了一代代GC难以处理，从而导致重复的主要集合。

但是，只有未删除的节点可以从出队节点到达，并且可达性不必一定是GC理解的那种。

我们使用链接刚刚退出队列的Node的技巧。 

这样的 slef-link 意味着前进到 head 节点（advance to head）。



head 和 tail 都允许滞后。

实际上，每次都无法更新它们是一个重大的优化（较少的CASes）。

与LinkedTransferQueue一样（请参阅该类的内部文档），我们使用的松弛阈值（slack threshold）为2。 

也就是说，当当前指针似乎与第一个/最后一个节点相距两步或更多步时，我们将更新 head/tail。


由于头和尾同时并独立地更新，所以尾可能会滞后于头（为什么不这样）？



将Node的项目引用CAS原子化为null会从队列中删除该元素。

迭代器跳过具有空项目的节点。

该类的先前实现在 poll() 和 remove(Object) 之间存在竞争，其中相同的元素似乎可以通过两次并发操作成功删除。

方法 remove(Object) 也会懒惰地取消链接已删除的节点，但这仅仅是一种优化。


在构造Node时（在将其放入队列之前），我们避免通过使用Unsafe.putObject而不是常规写入来为项目进行易失性写入。

这使得入队成本成为 `one-and-a-half` 的情况。


头部和尾部都可能指向也可能不指向带有非空项目的节点。

如果队列为空，则所有项目当然必须为空。

创建后，头和尾都引用具有空项目的虚拟Node。

头部和尾部都仅使用CAS进行更新，因此它们永不回归(regress)，尽管这只是一种优化。






# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk8 源码

[ConcurrentLinkedQueue使用和方法介绍](https://www.cnblogs.com/yangzhenlong/p/8359875.html)

[Java并发编程笔记之ConcurrentLinkedQueue源码探究](https://www.cnblogs.com/huangjuncong/p/9196240.html)

* any list
{:toc}
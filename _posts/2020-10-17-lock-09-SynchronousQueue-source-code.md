---
layout: post
title:  锁专题（9） SynchronousQueue 同步队列源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, queue, data-struct, sf]
published: flase
---

# SynchronousQueue 

![思维导图](https://p1.pstatp.com/origin/pgc-image/f76c27ed738844d099b011022d2e054f)

## 是什么

SynchronousQueue 是这样一种阻塞队列，其中每个 put 必须等待一个 take，反之亦然。

简而言之：线程安全，阻塞。

## 入门案例

我们定义两个线程，一个负责写入，一个负责读取。

```java
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.TimeUnit;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
public class SynchronousQueueDemo {

    public static void main(String[] args) {
        SynchronousQueue<Integer> queue = new SynchronousQueue<>();

        new Writer(queue).start();
        new Reader(queue).start();
    }

    private static class Writer extends Thread {
        SynchronousQueue<Integer> queue;

        public Writer(SynchronousQueue<Integer> queue) {
            this.queue = queue;
        }

        @Override
        public void run() {
            for (int i = 0; i < 5; i++) {
                System.out.println("开始设置第 " + i + " 个元素");
                try {
                    TimeUnit.SECONDS.sleep(2);
                    queue.put(i);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * 消息读取者
     */
    private static class Reader extends Thread {
        SynchronousQueue<Integer> queue;

        public Reader(SynchronousQueue<Integer> queue) {
            this.queue = queue;
        }

        @Override
        public void run() {
            while (true) {
                try {
                    System.out.println("读取信息: " + queue.take() + "\n");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

}
```

对应的日志信息如下：

```
开始设置第 0 个元素
开始设置第 1 个元素
读取信息: 0

开始设置第 2 个元素
读取信息: 1

开始设置第 3 个元素
读取信息: 2

开始设置第 4 个元素
读取信息: 3

读取信息: 4
```

可以看到当元素被设置之后，就会被立刻读取。这个在实际使用过程中还是非常便利的，比轮训优雅多了。

# 源码分析

## 类定义

```java
public class SynchronousQueue<E> extends AbstractQueue<E>
    implements BlockingQueue<E>, java.io.Serializable {
    
    // 转换类实现，也是最核心的一个属性。
    // 后面会详细讲解    
    private transient volatile Transferer<E> transferer;
}
```

实现了阻塞队列接口，继承自 AbstractQueue 抽象队列。

实际上对应的 put/take 方法，经过 transfer 的封装之后，都变得非常简单。

我们本文的核心在于对 Transferer 的解析。

## 构造器

SynchronousQueue 也是支持是否为公平锁模式的。

默认为非公平模式。

是否公平取决于使用的 Transfer 实现子类。

```java
public SynchronousQueue() {
    this(false);
}
public SynchronousQueue(boolean fair) {
    transferer = fair ? new TransferQueue<E>() : new TransferStack<E>();
}
```

## put 方法

```java
/**
 * Adds the specified element to this queue, waiting if necessary for
 * another thread to receive it.
 */
public void put(E e) throws InterruptedException {
    if (e == null) throw new NullPointerException();
    if (transferer.transfer(e, false, 0) == null) {
        Thread.interrupted();
        throw new InterruptedException();
    }
}
```

## take 方法

```java
/**
 * Retrieves and removes the head of this queue, waiting if necessary
 * for another thread to insert it.
 */
public E take() throws InterruptedException {
    E e = transferer.transfer(null, false, 0);
    if (e != null)
        return e;
    Thread.interrupted();
    throw new InterruptedException();
}
```

## 算法笔记

下面是源码中的一部分算法笔记，不会出现在文档中。


此类实现W. N. Scherer III和M. L. Scott所著的“不带条件同步的并发对象的无阻塞”中描述的双堆栈和双队列算法的扩展。 

第十八届年度大会 （2004年10月，分布式计算）（另请参见 http://www.cs.rochester.edu/u/scott/synchronization/pseudocode/dals.html ）。

（Lifo）堆栈用于非公平模式，（Fifo）队列用于公平模式。

两者的性能通常相似。

**Fifo通常在竞争下支持更高的吞吐量，但是Lifo在常见应用程序中保持更高的线程局部性**。


双队列（和类似的堆栈）是在任何给定时间保存“数据”（由put操作提供的项，或“请求”）的插槽，表示 take 操作，或者为空。

对 `fulfill` 的调用（即，从保存数据的队列中请求元素的调用，反之亦然）使互补节点出队。

![互补节点](https://p1.pstatp.com/origin/pgc-image/dfc14e8447194971a091db0b7532f7ae)

这些队列最有趣的功能是，任何操作都可以弄清楚队列所处的模式，并且无需锁就可以采取相应的措施。


队列和堆栈都扩展了抽象类Transferer，它们定义了执行放置或取出操作的单个方法。

将它们统一为一个方法，因为在双重数据结构中，放置和取出操作是对称的，因此几乎所有代码都可以合并。

最终的传输方法长远来看，但比分解成几乎重复的部分要容易得多。



队列和堆栈数据结构在概念上有很多相似之处，但具体细节很少。

为简单起见，它们保持不同，以便以后可以分别发展。


此处的算法与上述论文中的版本不同，在于扩展了它们以用于同步队列以及处理取消。

主要区别包括：

1. 原始算法使用带位标记的指针，但此处的算法使用节点中的模式位，从而导致了许多进一步的调整。

2. SynchronousQueues必须阻塞等待实现的线程。

3. 支持通过超时和中断进行取消，包括从列表中清除已取消的节点/线程，以避免垃圾保留和内存耗尽。


阻塞主要使用LockSupport park/unpark 来完成，除了看起来像是首先要实现的下一个要暂存的节点外，它还会旋转一点（仅在多处理器上）。

在非常繁忙的同步队列上，旋转可以大大提高吞吐量。

在不那么忙碌的队列上，自旋的量很小，不足以引起注意。


在队列和堆栈中以不同的方式进行清理。 

对于队列，我们几乎总是可以在取消节点后的 O(1) 时间内立即删除该节点（进行模数重试以进行一致性检查）。

但是，如果可能将其固定为当前尾巴，则必须等待直到随后的一些取消。

对于堆栈，我们需要潜在的 O(n) 遍历，以确保可以删除节点，但这可以与其他访问堆栈的线程同时运行。



尽管垃圾回收会处理大多数会使非阻塞算法复杂化的节点回收问题，但还是要小心“忘记”对数据，其他节点和可能被阻塞线程长期保留的线程的引用。

**如果设置为null会与主要算法冲突，则可以通过将节点的链接更改为现在指向节点本身来完成。**

ps: 这是一个不错的技巧。

对于Stack节点，这不会发生太多（因为阻塞的线程不会挂在旧的头部指针上），但是必须积极地忘记Queue节点中的引用，以防止自到达以来任何节点都曾引用的所有内容都可以访问。



## 内部变量

有几个关于内核数等的相关变量。

```java
/** 
** 内核数，用于自旋锁控制。
** 单核是不能自旋的。
**
** @author 老马啸西风
*/
static final int NCPUS = Runtime.getRuntime().availableProcessors();

/**
 * 最大的自旋次数，如果是单核，不进行自旋。
 * 如果是多核，最多旋转 32 次。
 */
static final int maxTimedSpins = (NCPUS < 2) ? 0 : 32;

/**
 * 在阻塞未定时的等待之前旋转的次数。
 * 此值大于定时值，因为非定时等待旋转得更快，因为他们不需要每次旋转都检查时间。
 */
static final int maxUntimedSpins = maxTimedSpins * 16;

/**
 * 旋转秒级比使用定时停泊更快的纳秒数。 
 * 粗略的估计就足够了。
 */
static final long spinForTimeoutThreshold = 1000L;
```

# Transferer

## 接口定义

一个非常简单的方法。

```java
abstract static class Transferer<E> {
    abstract E transfer(E e, boolean timed, long nanos);
}
```

这里就像算法笔记中说的，使用了队列（FIFO） 和 堆栈（FILO）

![阻塞队列](https://p1.pstatp.com/origin/pgc-image/2983104c9993471ab898265885cb4779)

## 基于队列

```java
/**
* 
* 这扩展了Scherer-Scott双队列算法，其不同之处在于，通过使用节点内的模式而不是标记的指针来实现。
*
* 该算法比堆栈的算法更简单，因为实现者节点，并且匹配是通过CAS将QNode.item字段从非null转换为null（用于放置）或反之亦然（用于take）来完成的。
* 
* @author 老马啸西风
* 
*/
static final class TransferQueue<E> extends Transferer<E> {
    
    /** 头结点 */
    transient volatile QNode head;

    /** 尾节点 */
    transient volatile QNode tail;

    /**
     * 对已取消节点的引用，该节点可能尚未取消与队列的链接，因为它是取消时最后插入的节点。
     */
    transient volatile QNode cleanMe;

    TransferQueue() {
        QNode h = new QNode(null, false); // initialize to dummy node.
        head = h;
        tail = h;
    }

    /**
     * 尝试以 cas nh 作为新元素； 如果成功，请取消链接旧头的下一个节点，以免造成垃圾遗留。
     */
    void advanceHead(QNode h, QNode nh) {
        if (h == head &&
            UNSAFE.compareAndSwapObject(this, headOffset, h, nh))
            h.next = h; // forget old next
    }
    /**
     * T尝试设置 nt 作为新的尾巴元素
     */
    void advanceTail(QNode t, QNode nt) {
        if (tail == t)
            UNSAFE.compareAndSwapObject(this, tailOffset, t, nt);
    }
    /**
     * 尝试 CAS 设置 cleanMe 元素
     */
    boolean casCleanMe(QNode cmp, QNode val) {
        return cleanMe == cmp &&
            UNSAFE.compareAndSwapObject(this, cleanMeOffset, cmp, val);
    }
   
    // Unsafe 相关属性
    // 这个很多并发类中都有，基本是固定的。
    private static final sun.misc.Unsafe UNSAFE;
    private static final long headOffset;
    private static final long tailOffset;
    private static final long cleanMeOffset;
    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            Class<?> k = TransferQueue.class;
            headOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("head"));
            tailOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("tail"));
            cleanMeOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("cleanMe"));
        } catch (Exception e) {
            throw new Error(e);
        }
    }
}
```

### 节点定义

```java
/** Node class for TransferQueue. */
static final class QNode {

    volatile QNode next;          // next node in queue
    volatile Object item;         // CAS'ed to or from null
    volatile Thread waiter;       // to control park/unpark
    final boolean isData;

    QNode(Object item, boolean isData) {
        this.item = item;
        this.isData = isData;
    }

    // 基于 CAS 的设置方法
    boolean casNext(QNode cmp, QNode val) {
        return next == cmp &&
            UNSAFE.compareAndSwapObject(this, nextOffset, cmp, val);
    }
    boolean casItem(Object cmp, Object val) {
        return item == cmp &&
            UNSAFE.compareAndSwapObject(this, itemOffset, cmp, val);
    }


    /**
     * 尝试通过 CAS 取消元素的引用
     */
    void tryCancel(Object cmp) {
        UNSAFE.compareAndSwapObject(this, itemOffset, cmp, this);
    }

    // 判断是否已经取消
    boolean isCancelled() {
        return item == this;
    }

    /**
     * 下一个指针指向当前类，说明什么？
     * 说明节点已经不再队列中
     */
    boolean isOffList() {
        return next == this;
    }

    // Unsafe 的相关实现
    private static final sun.misc.Unsafe UNSAFE;
    private static final long itemOffset;
    private static final long nextOffset;
    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            Class<?> k = QNode.class;
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

### transfer 核心方法

基本算法是循环尝试执行以下两个操作之一：

1. 如果队列明显为空或持有相同模式的节点，请尝试将节点添加到等待队列中，等待被实现（或取消）并返回匹配项。

2. 如果队列显然包含等待项，并且此调用是互补模式，请尝试通过对等待节点的CAS'ing item字段进行出队并使其出队，然后返回匹配项来实现。

在每种情况下，一路检查并尝试帮助其他停滞/缓慢的线程推进头和尾。

循环以空检查开始，以防止看到未初始化的头或尾值。

这在当前的 SynchronousQueue 中永远不会发生，但是如果调用者持有对传输者的非易失性/最终引用（non-volatile/final），则可能会发生这种情况。

无论如何，这里的检查是因为将空检查放在循环的顶部，通常比隐式散布（implicitly interspersed）检查要快。

```java
/**
 * 放入或者获取一个元素
 * @author 老马啸西风
 */
@SuppressWarnings("unchecked")
E transfer(E e, boolean timed, long nanos) {

    QNode s = null; // constructed/reused as needed
    boolean isData = (e != null);
    for (;;) {
        QNode t = tail;
        QNode h = head;

        // 元素未初始化完成，自旋。
        if (t == null || h == null)        
            continue;                     

        // 如果为空，或者持有相同模式的节点
        if (h == t || t.isData == isData) { 
            QNode tn = t.next;

            // 元素被其他线程修改，重来
            if (t != tail)                 
                continue;

            // 尝试节点加入到 tail    
            if (tn != null) {            
                advanceTail(t, tn);
                continue;
            }

            // 时间不等人，直接返回 null
            if (timed && nanos <= 0)    
                return null;

            // 设置新元素失败，重来
            if (s == null)
                s = new QNode(e, isData);
            if (!t.casNext(null, s))        
                continue;

            // 添加到尾部等待
            advanceTail(t, s);            

            // 旋转/阻塞，直到满足节点s为止。
            Object x = awaitFulfill(s, e, timed, nanos);

            // 等待被取消，清空元素，并且返回 null
            if (x == s) {   
                clean(t, s);
                return null;
            }

            // 元素已经不再队列中了，
            if (!s.isOffList()) {           // not already unlinked
                // 设置 s 为新的头结点
                advanceHead(t, s);    
                if (x != null)              // and forget fields
                    s.item = s;
                s.waiter = null;
            }

            return (x != null) ? (E)x : e;
        } else {       
            // 互补模式 complementary-mode 
            // 这里就是上面说的第二种算法模式                     
            QNode m = h.next;              

            // 已经被其他线程修改，重来
            if (t != tail || m == null || h != head)
                continue;                   // inconsistent read

            Object x = m.item;
            // 元素 CAS 失败，执行出队，进行重试。
            if (isData == (x != null) ||    // m already fulfilled
                x == m ||                   // m cancelled
                !m.casItem(x, e)) {         // lost CAS
                advanceHead(h, m);          // dequeue and retry
                continue;
            }

            // 成功设置
            advanceHead(h, m);              // successfully fulfilled
            LockSupport.unpark(m.waiter);
            return (x != null) ? (E)x : e;
        }
    }
}
```

### awaitFulfill 等待直到节点满足条件

```java
/**
 * 旋转/阻止，直到满足节点s为止。
 *
 * @param s the waiting node
 * @param e the comparison value for checking match
 * @param timed true if timed wait
 * @param nanos timeout value
 * @return matched item, or s if cancelled
 * @author 老马啸西风
 */
Object awaitFulfill(QNode s, E e, boolean timed, long nanos) {
    /* Same idea as TransferStack.awaitFulfill */
    // deadline 是第一生产力
    // 我们设置一个超时时间，避免一直等待下去。
    final long deadline = timed ? System.nanoTime() + nanos : 0L;


    // 这 3 目运算符用的人脑袋疼。
    Thread w = Thread.currentThread();
    int spins = ((head.next == s) ?
                 (timed ? maxTimedSpins : maxUntimedSpins) : 0);

    for (;;) {
        // 如果当前线程被打断，尝试取消。
        if (w.isInterrupted())
            s.tryCancel(e);

        Object x = s.item;

        // 如果 s.item 与 e 不等，直接返回 x
        if (x != e)
            return x;
        if (timed) {
            // 计算超时时间，超时之后尝试取消。
            nanos = deadline - System.nanoTime();
            if (nanos <= 0L) {
                s.tryCancel(e);
                continue;
            }
        }
        // 更新自旋次数
        if (spins > 0)
            --spins;
        // 如果 waiter 为 null,设置为当前线程。    
        else if (s.waiter == null)
            s.waiter = w;
        else if (!timed)
            // 通过 LockSupport 进行 park，区别只是是否有超时时间。
            LockSupport.park(this);
        else if (nanos > spinForTimeoutThreshold)
            LockSupport.parkNanos(this, nanos);
    }
}
```

#### clean 清空操作

在任何给定时间，列表中的一个节点都不能删除-最后插入的节点。

为了解决这个问题，如果我们不能删除s，我们将其前身保存为 `cleanMe`，首先删除之前保存的版本。

可以始终删除节点s或先前保存的节点中的至少一个，因此该操作始终终止。

```java
/**
 * 使用原始的前任pred摆脱已取消的节点s。
 * @author 老马啸西风
 */
void clean(QNode pred, QNode s) {
    // 清空 waiter 信息
    s.waiter = null; 

    while (pred.next == s) { //如果已取消链接，请提早返回
        QNode h = head;
        QNode hn = h.next;   
        //设置已取消的第一个节点为head
        if (hn != null && hn.isCancelled()) {
            advanceHead(h, hn);
            continue;
        }

        // 保证一致性读
        QNode t = tail;      // Ensure consistent read for tail
        // 为空，直接返回
        if (t == h)
            return;

        // 不一致，重试    
        QNode tn = t.next;
        if (t != tail)
            continue;

        // 尝试设置 tail 信息    
        if (tn != null) {
            advanceTail(t, tn);
            continue;
        }

        // 如果 s 节点不是尾巴节点，尝试进行 unsplice
        if (s != t) {      
            QNode sn = s.next;
            if (sn == s || pred.casNext(s, sn))
                return;
        }

        QNode dp = cleanMe;
        //尝试取消链接先前取消的节点
        if (dp != null) {    
            QNode d = dp.next;
            QNode dn;
            if (d == null ||               // d is gone or
                d == dp ||                 // d is off list or
                !d.isCancelled() ||        // d not cancelled or
                (d != t &&                 // d not tail and
                 (dn = d.next) != null &&  //   has successor
                 dn != d &&                //   that is on list
                 dp.casNext(d, dn)))       // d unspliced

                // 通过 CAS 清空 dp
                casCleanMe(dp, null);

            // s 已经保存在信息中，直接返回    
            if (dp == pred)
                return;      
        } else if (casCleanMe(null, pred))
            return;          // Postpone cleaning s
    }
}
```

## 基于堆栈

还有基于 stack 的实现。

不过思想都是类似的。

### 类定义

这扩展了Scherer-Scott双栈算法，除了使用“覆盖”节点而不是位标记的指针以外，其他方式也有所不同：

完成操作会推动标记节点（将FULFILLING位设置为模式）以保留一个点以匹配等待的节点。

```java
/** 
** 基于 Stack  的转换实现
** @author 老马啸西风
*/
static final class TransferStack<E> extends Transferer<E> {
    
    /* Modes for SNodes, ORed together in node fields */
    /** 节点代表未实现的消费者 */
    static final int REQUEST    = 0;

    /** 节点代表未完成的生产者 */
    static final int DATA       = 1;

    /** 节点正在执行另一个未完成的数据或请求 */
    static final int FULFILLING = 2;

    /** 如果m设置了满足位，则返回true。 */
    static boolean isFulfilling(int m) { return (m & FULFILLING) != 0; }

    /** stack 的头结点 */
    volatile SNode head;
}
```

那么这个通过 volatile 修饰的头结点又是什么呢？

### 节点

```java
/** 
* Node class for TransferStacks. 
* @author 老马啸西风
*/
static final class SNode {
    volatile SNode next;        // next node in stack
    volatile SNode match;       // the node matched to this
    volatile Thread waiter;     // to control park/unpark
    Object item;                // data; or null for REQUESTs
    int mode;

    //注意：item和mode字段不需要是volatile的，因为它们总是在其他volatile /原子操作之前和之后写入。
    SNode(Object item) {
        this.item = item;
    }

    //cas 方法设置 next 节点
    boolean casNext(SNode cmp, SNode val) {
        return cmp == next &&
            UNSAFE.compareAndSwapObject(this, nextOffset, cmp, val);
    }

    /**
     * 尝试将节点s与此节点匹配，如果是，则唤醒线程。
     * Fulfiller呼叫tryMatch来识别其 waiter 。
     * waiters 封锁直到他们被匹配。
     */
    boolean tryMatch(SNode s) {
        if (match == null &&
            UNSAFE.compareAndSwapObject(this, matchOffset, null, s)) {
            Thread w = waiter;

            // waiters 需要最多一次 unpark
            if (w != null) {    
                waiter = null;
                LockSupport.unpark(w);
            }
            return true;
        }
        return match == s;
    }

    /**
     * 尝试通过将节点与其自身匹配来取消等待。
     */
    void tryCancel() {
        UNSAFE.compareAndSwapObject(this, matchOffset, null, this);
    }
    boolean isCancelled() {
        return match == this;
    }

    // Unsafe 相关配置信息
    private static final sun.misc.Unsafe UNSAFE;
    private static final long matchOffset;
    private static final long nextOffset;
    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            Class<?> k = SNode.class;
            matchOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("match"));
            nextOffset = UNSAFE.objectFieldOffset
                (k.getDeclaredField("next"));
        } catch (Exception e) {
            throw new Error(e);
        }
    }
}
```

节点相关的几个方法：

```java
boolean casHead(SNode h, SNode nh) {
    return h == head &&
        UNSAFE.compareAndSwapObject(this, headOffset, h, nh);
}

/**
 * 创建或重置节点的字段。
 * 仅从传输中调用，在该传输中延迟创建要推送到栈上的节点，并在可能时进行重用，以帮助减少读取和头的CASes之间的间隔，并避免当CASes推送到节点由于争用而失败时产生的大量垃圾。
 */
static SNode snode(SNode s, Object e, SNode next, int mode) {
    if (s == null) s = new SNode(e);
    s.mode = mode;
    s.next = next;
    return s;
}
```

### 转换方法

这个应该和基于队列的类似。

基本算法是循环尝试以下三个动作之一：

1. 如果显然是空的或已经包含相同模式的节点，请尝试将节点压入堆栈并等待匹配，然后将其返回，如果取消则返回null。

2. 如果显然包含互补模式的节点，请尝试将满足要求的节点推入堆栈，与相应的等待节点匹配，从堆栈中弹出两者，然后返回匹配的项目。 由于其他线程正在执行操作3，因此实际上可能不需要匹配或取消链接：

3. 如果堆栈顶部已经包含另一个充实的节点，请通过执行其匹配和/或弹出操作来对其进行帮助，然后继续。 

帮助代码与实现代码基本相同，不同之处在于它不返回项目。

```java
/**
 * Puts or takes an item.
 */
@SuppressWarnings("unchecked")
E transfer(E e, boolean timed, long nanos) {
    
    SNode s = null; // constructed/reused as needed
    int mode = (e == null) ? REQUEST : DATA;
    for (;;) {
        SNode h = head;
        if (h == null || h.mode == mode) {  // empty or same-mode
            if (timed && nanos <= 0) {      // can't wait
                if (h != null && h.isCancelled())
                    casHead(h, h.next);     // pop cancelled node
                else
                    return null;
            } else if (casHead(h, s = snode(s, e, h, mode))) {
                SNode m = awaitFulfill(s, timed, nanos);
                if (m == s) {               // wait was cancelled
                    clean(s);
                    return null;
                }
                if ((h = head) != null && h.next == s)
                    casHead(h, s.next);     // help s's fulfiller
                return (E) ((mode == REQUEST) ? m.item : s.item);
            }
        } else if (!isFulfilling(h.mode)) { // try to fulfill
            if (h.isCancelled())            // already cancelled
                casHead(h, h.next);         // pop and retry
            else if (casHead(h, s=snode(s, e, h, FULFILLING|mode))) {
                for (;;) { // loop until matched or waiters disappear
                    SNode m = s.next;       // m is s's match
                    if (m == null) {        // all waiters are gone
                        casHead(s, null);   // pop fulfill node
                        s = null;           // use new node next time
                        break;              // restart main loop
                    }
                    SNode mn = m.next;
                    if (m.tryMatch(s)) {
                        casHead(s, mn);     // pop both s and m
                        return (E) ((mode == REQUEST) ? m.item : s.item);
                    } else                  // lost match
                        s.casNext(m, mn);   // help unlink
                }
            }
        } else {                            // help a fulfiller
            SNode m = h.next;               // m is h's match
            if (m == null)                  // waiter is gone
                casHead(h, null);           // pop fulfilling node
            else {
                SNode mn = m.next;
                if (m.tryMatch(h))          // help match
                    casHead(h, mn);         // pop both h and m
                else                        // lost match
                    h.casNext(m, mn);       // help unlink
            }
        }
    }
}
```

### 等待方法

当节点/线程将要阻塞时，它将设置其 waiter 字段，然后在实际停车之前至少再检查一次状态，从而涵盖了竞争者与实现者的关系，并注意到 waiter 为非空，因此应将其唤醒。

当由出现在调用点位于堆栈顶部的节点调用时，对停放的调用之前会进行旋转，以避免在生产者和消费者及时到达时阻塞。

这可能足以只在多处理器上发生。

从主循环返回的检查顺序反映了这样一个事实，即中断的优先级高于正常的返回，而正常的返回优先于超时。 （因此，在超时时，在放弃之前要进行最后一次匹配检查）。

除了来自非定时SynchronousQueue的调用。{poll / offer}不会检查中断，也根本不需要等待，因此被困在传输方法中，而不是调用awaitFulfill。

```java
/**
 * 旋转/阻止，直到节点s通过执行操作匹配。
 *
 * @author 老马啸西风
 */
SNode awaitFulfill(SNode s, boolean timed, long nanos) {
    // 设置超时时间
    final long deadline = timed ? System.nanoTime() + nanos : 0L;
    Thread w = Thread.currentThread();

    // 是否需要等待？
    int spins = (shouldSpin(s) ?
                 (timed ? maxTimedSpins : maxUntimedSpins) : 0);
    for (;;) {
        // 被中断，则尝试取消
        if (w.isInterrupted())
            s.tryCancel();

        // 如果不等，直接返回    
        SNode m = s.match;
        if (m != null)
            return m;

        // 指定超时时间，超时之后，尝试取消，重来    
        if (timed) {
            nanos = deadline - System.nanoTime();
            if (nanos <= 0L) {
                s.tryCancel();
                continue;
            }
        }

        // 自旋次数降低
        if (spins > 0)
            spins = shouldSpin(s) ? (spins-1) : 0;

        // 更新 waiter 信息    
        else if (s.waiter == null)
            s.waiter = w; // establish waiter so can park next iter
        else if (!timed)
            // 通过 LockSupport 实现。
            LockSupport.park(this);
        else if (nanos > spinForTimeoutThreshold)
            LockSupport.parkNanos(this, nanos);
    }
}
```


看的出来，这个和基于 Queue 的基本没什么区别。

只不过算法笔记中作者也说了，为了让二者便于后期的发展，就将其分开实现。


这个方法和 queue 中不同的是有一个是否需要自旋的方法：

```java
/**
 * 如果节点s在头或有一个活跃的履行者，则返回true。
 */
boolean shouldSpin(SNode s) {
    SNode h = head;
    return (h == s || h == null || isFulfilling(h.mode));
}
```

### 清空元素

最糟糕的是，我们可能需要遍历整个堆栈以取消s的链接。

如果有多个并发调用要清理，则如果另一个线程已将其删除，则可能看不到。

但是当看到任何已知跟随s的节点时，我们可以停止。

除非也将其取消，否则我们将使用s.next，在这种情况下，我们将尝试过去一个节点。

我们不做进一步检查，因为我们**不想为了找到标记而进行双重遍历**。

```java
/**
 * 从堆栈取消链接 s。
 * 
 * @author 老马啸西风
 */
void clean(SNode s) {
    s.item = null;   // forget item
    s.waiter = null; // forget thread
    
    SNode past = s.next;
    if (past != null && past.isCancelled())
        past = past.next;
    // Absorb cancelled nodes at head
    SNode p;
    while ((p = head) != null && p != past && p.isCancelled())
        casHead(p, p.next);
    // Unsplice embedded nodes
    while (p != null && p != past) {
        SNode n = p.next;
        if (n != null && n.isCancelled())
            p.casNext(n, n.next);
        else
            p = n;
    }
}
```

# 小结

阻塞队列大家族的成员共计 5 位，SynchronousQueue 是其中非常优秀的一份子。

工作学习中希望可以活学活用，提升工作效率，写出更加优异的代码。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[DelayQueue 的使用](https://blog.csdn.net/hsqingwei/article/details/88850835)

[Java延时队列DelayQueue的使用](https://my.oschina.net/lujianing/blog/705894)

[SynchronousQueue 的使用](https://blog.csdn.net/zmx729618/article/details/52980158)

* any list
{:toc}
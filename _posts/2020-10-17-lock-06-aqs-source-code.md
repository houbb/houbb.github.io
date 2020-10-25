---
layout: post
title:  锁专题（6）AbstractQueuedSynchronizer AQS 源码详解
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

> 点赞再看，已成习惯。

# AQS

提供一个框架，用于实现依赖先进先出（FIFO）等待队列的阻塞锁和相关同步器（信号量，事件等）。 

# 源码学习

## 类定义

```java
/*
 * @since 1.5
 * @author Doug Lea
 */
public abstract class AbstractQueuedSynchronizer
    extends AbstractOwnableSynchronizer
    implements java.io.Serializable {

    private static final long serialVersionUID = 7373984972572414691L;

    /**
     * Creates a new {@code AbstractQueuedSynchronizer} instance
     * with initial synchronization state of zero.
     */
    protected AbstractQueuedSynchronizer() { }

}
```

当前类继承自 `AbstractOwnableSynchronizer` 类。

### AbstractOwnableSynchronizer 实现

看的出来，这个类是 jdk1.6 引入的，上面的类时 jdk1.5 引入的。

估计是为了后续其他类实现方便，所以统一抽象了父类。

比如这个类还有子类 `AbstractQueuedLongSynchronizer`，这个我们选一节进行源码学习。

```java
/*
* @since 1.6
 * @author Doug Lea
 */
public abstract class AbstractOwnableSynchronizer
    implements java.io.Serializable {

    /** Use serial ID even though all fields transient. */
    private static final long serialVersionUID = 3737899427754241961L;

    /**
     * Empty constructor for use by subclasses.
     */
    protected AbstractOwnableSynchronizer() { }

    /**
     * The current owner of exclusive mode synchronization.
     * 独占模式同步的当前所有者。
     */
    private transient Thread exclusiveOwnerThread;

    /**
     * 
     * 设置当前独占模式的所有者为指定线程
     * 
     * Sets the thread that currently owns exclusive access.
     * A {@code null} argument indicates that no thread owns access.
     * This method does not otherwise impose any synchronization or
     * {@code volatile} field accesses.
     * @param thread the owner thread
     */
    protected final void setExclusiveOwnerThread(Thread thread) {
        exclusiveOwnerThread = thread;
    }

    /**
     *
     * 获取当前独占模式的所有者
     * 
     * Returns the thread last set by {@code setExclusiveOwnerThread},
     * or {@code null} if never set.  This method does not otherwise
     * impose any synchronization or {@code volatile} field accesses.
     * @return the owner thread
     */
    protected final Thread getExclusiveOwnerThread() {
        return exclusiveOwnerThread;
    }
}
```

这个类的实现还是非常简洁的。

可以理解为一个 `exclusiveOwnerThread` 和对应的 getter/setter 方法。

## 节点定义

提供一个框架，用于实现依赖先进先出（FIFO）等待队列的阻塞锁和相关同步器（信号量，事件等）。 

先进先出的节点，定义如下：

```java
static final class Node {
    /** Marker to indicate a node is waiting in shared mode */
    static final Node SHARED = new Node();
    /** Marker to indicate a node is waiting in exclusive mode */
    static final Node EXCLUSIVE = null;
    /** waitStatus value to indicate thread has cancelled */
    static final int CANCELLED =  1;
    /** waitStatus value to indicate successor's thread needs unparking */
    static final int SIGNAL    = -1;
    /** waitStatus value to indicate thread is waiting on condition */
    static final int CONDITION = -2;
    /**
     * waitStatus value to indicate the next acquireShared should
     * unconditionally propagate
     */
    static final int PROPAGATE = -3;
    /**
     * Status field, taking on only the values:
     * 状态字段
     */
    volatile int waitStatus;
    /**
     * 前一个节点
     */
    volatile Node prev;
    /**
     * 下一个节点
     */
    volatile Node next;
    /**
     * The thread that enqueued this node.  Initialized on
     * construction and nulled out after use.
     */
    volatile Thread thread;
    /**
     * 下一个等待者
     */
    Node nextWaiter;
    /**
     * Returns true if node is waiting in shared mode.
     */
    final boolean isShared() {
        return nextWaiter == SHARED;
    }
    /**
     * Returns previous node, or throws NullPointerException if null.
     * Use when predecessor cannot be null.  The null check could
     * be elided, but is present to help the VM.
     *
     * @return the predecessor of this node
     */
    final Node predecessor() throws NullPointerException {
        Node p = prev;
        if (p == null)
            throw new NullPointerException();
        else
            return p;
    }
    Node() {    // Used to establish initial head or SHARED marker
    }
    Node(Thread thread, Node mode) {     // Used by addWaiter
        this.nextWaiter = mode;
        this.thread = thread;
    }
    Node(Thread thread, int waitStatus) { // Used by Condition
        this.waitStatus = waitStatus;
        this.thread = thread;
    }
}
```

看起来洋洋洒洒很多行，实际上解释起来还是不难的。

### 状态

主要 waitStatus 属性对应的几个状态需要注意一下。

- SIGNAL（信号）：

此节点的后继者被（或将很快被阻止）（通过停放），因此当前节点释放或取消时必须取消其后继者的停放。

为避免冲突，acquire方法必须首先指示它们需要信号，然后重试原子获取，然后在失败时阻塞。

- CANCELLED（取消）: 

由于超时或中断，该节点被取消。节点永远不会离开此状态。特别是，具有取消节点的线程永远不会再次阻塞。

- CONDITION （条件）：

该节点当前在条件队列中。 

在传输之前，它不会用作同步队列节点，此时状态将设置为0。（此值的使用与该字段的其他用途无关，但简化了机制。）

- PROPAGATE（传播）：

应将releaseShared传播到其他节点。 

在doReleaseShared中对此进行了设置（仅适用于头节点），以确保传播继续进行，即使此后进行了其他操作也是如此。

- 0

不是上面的任何一个值

这些值以数字方式排列以简化使用。 

非负值表示节点不需要发信号。

因此，**大多数代码不需要检查特定值，仅需检查符号即可**。

对于常规同步节点，该字段初始化为0，对于条件节点，该字段初始化为CONDITION。

使用CAS（或在可能的情况下进行无条件的易失性写操作）对其进行修改。

## 队列基本属性

我们可以理解为就是一个 FIFO 的队列：

```java
/**
 * 头结点
 */
private transient volatile Node head;
/**
 * 尾结点
 */
private transient volatile Node tail;
/**
 * 同步状态
 */
private volatile int state;
/**
 * 获取同步状态
 */
protected final int getState() {
    return state;
}
/**
 * 设置同步状态 
 */
protected final void setState(int newState) {
    state = newState;
}
/**
 * 通过 CAS 比较设置值
 */
protected final boolean compareAndSetState(int expect, int update) {
    // See below for intrinsics setup to support this
    return unsafe.compareAndSwapInt(this, stateOffset, expect, update);
}
```

这几个属性也比较简单，头尾结点用于队列处理，多了一个 state 属性及其  get/set 方法。

unsafe 本节不做深入，后续会对这个类做讲解。



# 队列工具方法相关


## 属性

```java
/**
 * 旋转秒级比使用定时停泊更快的纳秒数。 
 * 粗略估计足以在非常短的超时时间内提高响应能力。
 */
static final long spinForTimeoutThreshold = 1000L;
```

## 队列方法

### 入队

```java
private Node enq(final Node node) {
    for (;;) {
        Node t = tail;
        if (t == null) { // Must initialize
            if (compareAndSetHead(new Node()))
                tail = head;
        } else {
            node.prev = t;
            if (compareAndSetTail(t, node)) {
                t.next = node;
                return t;
            }
        }
    }
}
```

如果就是分为两种情况：

（1）对列为空

初始化 head 节点，并让 tail=head

继续循环。

（2）队列不为空

新节点的前一个节点为原来的尾巴节点

设置新节点为新的尾巴节点

原来的尾巴节点.next 只想新节点。返回尾巴节点。

ps: 其实就是做一件事：让新节点插入队列，并且成为新的尾巴节点。


这里的 for 循环其实写的挺奇怪的。

### compareAndSetHead

可以看出这个方法是 CAS 一次，循环是通过 for 来控制的。

```java
/**
 * CAS head field. Used only by enq.
 */
private final boolean compareAndSetHead(Node update) {
    return unsafe.compareAndSwapObject(this, headOffset, null, update);
}
```

### compareAndSetTail

这个和 compareAndSetHead 类似。

```java
/**
* CAS tail field. Used only by enq.
 */
private final boolean compareAndSetTail(Node expect, Node update) {
    return unsafe.compareAndSwapObject(this, tailOffset, expect, update);
}
```


# 锁的获取

AQS 中提供了丰富的方法，看的我眼花缭乱。

想了想还是看最基本的锁的获取和释放即可。

AQS 提供了两种基本的锁获取模式：共享锁和排他锁模式，当然也包含是否可以被打断。

是否可以被打断我们不做重点讲解。

## 排他锁模式

也叫独占锁。

就像是一个爱吃独食的小朋友，好吃的我一个人吃，其他人都要等着。

源码如下：

```java
/**
 * Acquires in exclusive mode, ignoring interrupts.  Implemented
 * by invoking at least once {@link #tryAcquire},
 * returning on success.  Otherwise the thread is queued, possibly
 * repeatedly blocking and unblocking, invoking {@link
 * #tryAcquire} until success.  This method can be used
 * to implement method {@link Lock#lock}.
 *
 * @param arg the acquire argument.  This value is conveyed to
 *        {@link #tryAcquire} but is otherwise uninterpreted and
 *        can represent anything you like.
 * @author 老马啸西风
 */
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```


这个方法的注释说明的比较清楚。

独占获取锁的模式，忽略中断。至少调用一次 `tryAcquire`，否则就会将线程入队，重试调用  tryAcquire，直到成功为止。

实现只有 3 行，实际上却是有 4 个方法组成，我们来分别看下这几个方法。

### tryAcquire 尝试获取锁

这个默认的实现是不支持的，都是在各种子类中实现的，我们其他章节讲过，这里不做深入。

```java
protected boolean tryAcquire(int arg) {
    throw new UnsupportedOperationException();
}
```

### acquireQueued 线程入队

这个方法是使用排他锁的模式不可中断的方式获取锁。

```java
/**
 * Acquires in exclusive uninterruptible mode for thread already in
 * queue. Used by condition wait methods as well as acquire.
 *
 * @param node the node
 * @param arg the acquire argument
 * @return {@code true} if interrupted while waiting
 * @author 老马啸西风
 */
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            // 当前节点的前一个节点为 head，说明已经是排在最前的等待者。
            final Node p = node.predecessor();
            // 第一个等待者获取锁成功，则说明本次获取锁成功。
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }

            // 如果获取锁失败需要发信号 && 检测状态为中断，更新 interrupted = true;
            // 这个值实际上只是在获取锁之后才会返回，用来记录等待过程中是否被中断。
            // 但是中断了几次，这些细节信息实际上已经丢失了。
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

- shouldParkAfterFailedAcquire

如果获取锁失败，则需要更新对应的状态。

返回 true 则说明 thread 需要被阻塞。

这是在获取锁循环中最主要的主信号控制。

```java
/**
 * Checks and updates status for a node that failed to acquire.
 * Returns true if thread should block. This is the main signal
 * control in all acquire loops.  Requires that pred == node.prev.
 *
 * @param pred node's predecessor holding status
 * @param node the node
 * @return {@code true} if thread should block
 * @author 老马啸西风
 */
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus;
    if (ws == Node.SIGNAL)
        /*
         * This node has already set status asking a release
         * to signal it, so it can safely park.
         *
         * 状态已经是需要发信号，直接返回 true。
         */
        return true;
    if (ws > 0) {
        /*
         * Predecessor was cancelled. Skip over predecessors and
         * indicate retry.
         * 
         * 前继节点已经取消，这里就是循环向前找到一个状态不大于0的节点。
         * 也就是找到一个需要发信号的节点。（非负值表示节点不需要发信号。）
         */
        do {
            node.prev = pred = pred.prev;
        } while (pred.waitStatus > 0);
        pred.next = node;
    } else {
        /*
         * waitStatus must be 0 or PROPAGATE.  Indicate that we
         * need a signal, but don't park yet.  Caller will need to
         * retry to make sure it cannot acquire before parking.
         * 
         * 这里是用 CAS 设置一个需要发信号，但是还没有发现好的节点。
         */
        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
    }
    return false;
}
```

- compareAndSetWaitStatus

这里调用了 unsafe 的方法，将节点状态的值设置为 Node.SIGNAL。

```java
/**
 * CAS waitStatus field of a node.
 */
private static final boolean compareAndSetWaitStatus(Node node,
                                                     int expect,
                                                     int update) {
    return unsafe.compareAndSwapInt(node, waitStatusOffset,
                                    expect, update);
}
```

- parkAndCheckInterrupt

这里是直接暂停，并且检查是否中断。

```java
/**
 * Convenience method to park and then check if interrupted
 *
 * @return {@code true} if interrupted
 */
private final boolean parkAndCheckInterrupt() {
    LockSupport.park(this);
    return Thread.interrupted();
}
```

### addWaiter 添加等待者

Node 有排他和共享两种模式。

```java
/**
 * Creates and enqueues node for current thread and given mode.
 *
 * @param mode Node.EXCLUSIVE for exclusive, Node.SHARED for shared
 * @return the new node
 * @author 老马啸西风
 */
private Node addWaiter(Node mode) {
    Node node = new Node(Thread.currentThread(), mode);
    // Try the fast path of enq; backup to full enq on failure
    Node pred = tail;
    if (pred != null) {
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            return node;
        }
    }
    enq(node);
    return node;
}
```

这里在 enq 之前，做了一次快速。

如果 tail 节点存在，直接尝试入队。

要问为什么快？

个人理解是和 enq 对比，少了一次 t == null 判断？

不过我想这种代码实现在后期的编译器应该会优化掉的。

### selfInterrupt 我打断我自己？

这个方法比较简单，就是执行线程中断：

```java
/**
 * Convenience method to interrupt current thread.
 */
static void selfInterrupt() {
    Thread.currentThread().interrupt();
}
```

看了下是否可中断，和这个整理流程类似。

只是在被中断的时候，会直接抛出 `InterruptedException` 异常，中断操作。

### cancelAcquire 取消获取锁

在 finally 中会执行取消获取锁，目的是取消正在尝试获取锁的操作。

```java
/**
 * Cancels an ongoing attempt to acquire.
 *
 * @param node the node
 */
private void cancelAcquire(Node node) {
    // Ignore if node doesn't exist
    // 节点不存在，直接返回。
    if (node == null)
        return;


    node.thread = null;

    // 跳过所有不需要发信号的前继节点。
    // Skip cancelled predecessors
    Node pred = node.prev;
    while (pred.waitStatus > 0)
        node.prev = pred = pred.prev;

    // predNext is the apparent node to unsplice. CASes below will
    // fail if not, in which case, we lost race vs another cancel
    // or signal, so no further action is necessary.
    Node predNext = pred.next;
    // Can use unconditional write instead of CAS here.
    // After this atomic step, other Nodes can skip past us.
    // Before, we are free of interference from other threads.
    // 这里将节点状态设置为取消。
    node.waitStatus = Node.CANCELLED;

    // 如果是尾巴节点，而且设置前继节点为新的尾巴节点成功，直接移除自身即可。
    // If we are the tail, remove ourselves.
    if (node == tail && compareAndSetTail(node, pred)) {
        compareAndSetNext(pred, predNext, null);
    } else {
        // 如果后继者需要信号，请尝试设置pred的下一个链接，以便获得一个信号。 否则唤醒它以传播。
        // If successor needs signal, try to set pred's next-link
        // so it will get one. Otherwise wake it up to propagate.
        int ws;
        if (pred != head &&
            ((ws = pred.waitStatus) == Node.SIGNAL ||
             (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) &&
            pred.thread != null) {
            Node next = node.next;
            if (next != null && next.waitStatus <= 0)
                compareAndSetNext(pred, predNext, next);
        } else {
            unparkSuccessor(node);
        }
        node.next = node; // help GC
    }
}
```


## 共享锁模式

看完了排他锁模式，让我们一起来看一下共享锁模式。

```java
/**
 * Acquires in shared mode, ignoring interrupts.  Implemented by
 * first invoking at least once {@link #tryAcquireShared},
 * returning on success.  Otherwise the thread is queued, possibly
 * repeatedly blocking and unblocking, invoking {@link
 * #tryAcquireShared} until success.
 *
 * @param arg the acquire argument.  This value is conveyed to
 *        {@link #tryAcquireShared} but is otherwise uninterpreted
 *        and can represent anything you like.
 */
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

使用共享模式获取锁，忽略中断。

至少调用一次 tryAcquireShared，如果不成功，则加入到队列中重复尝试，直到成功。

这个感觉实际上和上面的排他锁非常类似，让我们看一下对应的方法到底有神马不同。

### tryAcquireShared 

尝试共享模式获取锁方法。默认是不支持的，在子类中有对应的实现，此处不做展开。

返回大于 0 的值，说明获取锁成功。

```java
protected int tryAcquireShared(int arg) {
    throw new UnsupportedOperationException();
}
```

### doAcquireShared 

这个方法流程和上面的 `acquireQueued` 方法非常类似。

只不过添加的节点状态为 `Node.SHARED`。

```java
/**
 * Acquires in shared uninterruptible mode.
 * @param arg the acquire argument
* @author 老马啸西风
 */
private void doAcquireShared(int arg) {
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            // 如果当前节点为队列最前面的元素
            final Node p = node.predecessor();
            if (p == head) {
                int r = tryAcquireShared(arg);
                // 获取锁成功，则设置头信息。
                if (r >= 0) {
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    if (interrupted)
                        selfInterrupt();
                    failed = false;
                    return;
                }
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

- setHeadAndPropagate 设置头结点并传播

这里主要做了两件事：

（1）设置头结点信息

（2）传播

传播算是这个方法的核心，我们不妨问自己一下：

为什么需要传播？

什么时候进行传播？

怎么传播？

```java
/**
 * Sets head of queue, and checks if successor may be waiting
 * in shared mode, if so propagating if either propagate > 0 or
 * PROPAGATE status was set.
 *
 * @param node the node 节点信息
 * @param propagate the return value from a tryAcquireShared 是否获取锁成功
 * @author 老马啸西风
 */
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head; // Record old head for check below
    setHead(node);
    /*
     * Try to signal next queued node if:
     *   Propagation was indicated by caller,
     *     or was recorded (as h.waitStatus either before
     *     or after setHead) by a previous operation
     *     (note: this uses sign-check of waitStatus because
     *      PROPAGATE status may transition to SIGNAL.)
     * and
     *   The next node is waiting in shared mode,
     *     or we don't know, because it appears null
     *
     * The conservatism in both of these checks may cause
     * unnecessary wake-ups, but only when there are multiple
     * racing acquires/releases, so most need signals now or soon
     * anyway.
     */
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        if (s == null || s.isShared())
            doReleaseShared();
    }
}
```

如果发生以下情况，请尝试向下一个排队的节点发送信号：

（1）传播是由调用者指示的，或者是由上一个操作记录的（作为setHead之前或之后的h.waitStatus）（请注意：此方法使用waitStatus的符号检查，因为PROPAGATE状态可能转换为SIGNAL。）

（2）下一个节点正在共享模式下等待，或者我们不知道，因为它显示为空

代码里实际用的是 `||`，满足任意一个都需要发送信息。

为什么要这么做呢？

这两项检查中的保守性可能会导致不必要的唤醒，但是只有在有多个竞态（racing）获取/发布时，因此无论现在还是不久之后，大多数人都需要发出信号。

简而言之，**可能多余，但是必要**。


### 其他方法

其他几个方法和排他锁是一样的，大家可以自行回顾一下。

我们后面进入锁的释放环节。


# 锁的释放

常言道，好借好还，再借不难。

获取锁，一定要记得释放锁。

## 独占模式

```java
/**
 * Releases in exclusive mode.  Implemented by unblocking one or
 * more threads if {@link #tryRelease} returns true.
 * This method can be used to implement method {@link Lock#unlock}.
 *
 * @param arg the release argument.  This value is conveyed to
 *        {@link #tryRelease} but is otherwise uninterpreted and
 *        can represent anything you like.
 * @return the value returned from {@link #tryRelease}
 */
public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```

使用独占模式释放锁，我们一起来看一下几个核心方法：

### tryRelease 尝试释放锁

这个方法默认是不支持的：

```java
protected boolean tryRelease(int arg) {
    throw new UnsupportedOperationException();
}
```

### unparkSuccessor 唤醒后继节点

```java
/**
 * Wakes up node's successor, if one exists.
 *
 * @param node the node
 * @author 老马啸西风
 */
private void unparkSuccessor(Node node) {
    /*
     * If status is negative (i.e., possibly needing signal) try
     * to clear in anticipation of signalling.  It is OK if this
     * fails or if status is changed by waiting thread.
     */
    int ws = node.waitStatus;
    // 如果状态小于0，说明需要发送信号。
    // 会通过 CAS 设置等待的状态为 0。
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);

    /*
     * Thread to unpark is held in successor, which is normally
     * just the next node.  
     * But if cancelled or apparently null,
     * traverse backwards from tail to find the actual
     * non-cancelled successor.
     * 如果 node.next 存在，是直接释放当前 node.next。
     * 如果 node.next 不存在，获取 node.next 的等待状态大于 0（不需要发送信号），则从队尾一直向前遍历，找到第一个非取消的节点进行释放。
     */
    Node s = node.next;
    if (s == null || s.waitStatus > 0) {
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)
        LockSupport.unpark(s.thread);
}
```

释放用到了 LockSupport 的 unpark 方法：

```java
public static void unpark(Thread thread) {
    if (thread != null)
        unsafe.unpark(thread);
}
```

这里底层还是调用 `unsafe` 的方法，我们暂时不做展开。


## 共享模式

说完了独占模式，让我们一起看一下共享模式的锁释放。

```java
/**
 * Releases in shared mode.  Implemented by unblocking one or more
 * threads if {@link #tryReleaseShared} returns true.
 *
 * @param arg the release argument.  This value is conveyed to
 *        {@link #tryReleaseShared} but is otherwise uninterpreted
 *        and can represent anything you like.
 * @return the value returned from {@link #tryReleaseShared}
 * @author 老马啸西风
 */
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}
```

这个方法比较有趣，主要由两个方法组成：

### tryReleaseShared 尝试释放锁

默认是不支持的，这个可以在后续其他如 CountDownLatch 等源码中讲解。

```java
protected boolean tryReleaseShared(int arg) {
    throw new UnsupportedOperationException();
}
```


### doReleaseShared 

共享模式释放锁。



```java
/**
 * Release action for shared mode -- signal successor and ensure
 * propagation. (Note: For exclusive mode, release just amounts
 * to calling unparkSuccessor of head if it needs signal.)
 */
private void doReleaseShared() {
    /*
     * Ensure that a release propagates, even if there are other
     * in-progress acquires/releases.  This proceeds in the usual
     * way of trying to unparkSuccessor of head if it needs
     * signal. But if it does not, status is set to PROPAGATE to
     * ensure that upon release, propagation continues.
     * Additionally, we must loop in case a new node is added
     * while we are doing this. Also, unlike other uses of
     * unparkSuccessor, we need to know if CAS to reset status
     * fails, if so rechecking.
     */
    //jdk 特别喜欢这样写，等价于 while(true)
    for (;;) {
        Node h = head;
        // 如果头节点不为空 && 队列不为空
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            // 如果节点的状态为需要发送信号，这里会一致尝试设置节点状态为0，直到成功为止。
            // 设置成功，则执行 unparkSuccessor 
            if (ws == Node.SIGNAL) {
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;            // loop to recheck cases
                unparkSuccessor(h);
            }
            // 如果节点状态已经为零，且设置为广播失败，则继续循环。
            else if (ws == 0 &&
                     !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;                // loop on failed CAS
        }
        // 头节点不再改变时，直接跳出。
        if (h == head)                   // loop if head changed
            break;
    }
}
```

unparkSuccessor 这个方法和上面的独占模式实现完全一样。

# 小结

有头发的程序员，阅读源码就是这样**深入浅出且枯燥**。

看的愈多，就发现需要继续阅读就越多，只怕头发会越来越少。

* any list
{:toc}
---
layout: post
title:  锁专题（6）AbstractQueuedSynchronizer AQS 源码详解
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, overview, sf]
published: true
---

> 点赞再看，已成习惯。

# AQS

## 作用

提供一个框架，用于实现依赖先进先出（FIFO）等待队列的阻塞锁和相关同步器（信号量，事件等）。 

该类被设计为大多数类型的同步器的有用依据，这些同步器依赖于单个原子int值来表示状态。 

子类必须定义改变此状态的受保护方法，以及根据该对象被获取或释放来定义该状态的含义。 给定这些，这个类中的其他方法执行所有排队和阻塞机制。 

子类可以保持其他状态字段，但只以原子方式更新int使用方法操纵值getState() ， setState(int)和compareAndSetState(int, int)被跟踪相对于同步。

子类应定义为非公共内部助手类，用于实现其封闭类的同步属性。 

AbstractQueuedSynchronizer类不实现任何同步接口。 

相反，它定义了一些方法，如acquireInterruptibly(int) ，可以通过具体的锁和相关同步器来调用适当履行其公共方法。

此类支持默认独占模式和共享模式。 

当以独占模式获取时，尝试通过其他线程获取不能成功。 多线程获取的共享模式可能（但不需要）成功。 除了在机械意义上，这个类不理解这些差异，当共享模式获取成功时，下一个等待线程（如果存在）也必须确定它是否也可以获取。 

在不同模式下等待的线程共享相同的FIFO队列。 

通常，实现子类只支持这些模式之一，但是两者都可以在ReadWriteLock中发挥作用。 

仅支持独占或仅共享模式的子类不需要定义支持未使用模式的方法。

这个类定义的嵌套AbstractQueuedSynchronizer.ConditionObject可用于作为一类Condition由子类支持独占模式用于该方法的实施isHeldExclusively()份报告是否同步排他相对于保持在当前线程，方法release(int)与当前调用getState()值完全释放此目的，和acquire(int) ，给定此保存的状态值，最终将此对象恢复到其先前获取的状态。 

AbstractQueuedSynchronizer方法将创建此类条件，因此如果不能满足此约束，请勿使用该约束。 

AbstractQueuedSynchronizer.ConditionObject的行为当然取决于其同步器实现的语义。

该类为内部队列提供检查，检测和监控方法，以及条件对象的类似方法。 这些可以根据需要导出到类中，使用AbstractQueuedSynchronizer进行同步机制。

此类的序列化仅存储底层原子整数维持状态，因此反序列化对象具有空线程队列。 需要可序列化的典型子类将定义一个readObject方法，可以将其恢复为readObject时的已知初始状态。

## 用法

使用这个类用作同步的基础上，重新定义以下方法，如适用，通过检查和/或修改使用所述同步状态getState() ， setState(int)和/或compareAndSetState(int, int) ：

```java
tryAcquire(int)
tryRelease(int)
tryAcquireShared(int)
tryReleaseShared(int)
isHeldExclusively()
```

每个这些方法默认抛出UnsupportedOperationException。

这些方法的实现必须是线程安全的，通常应该是短的而不是阻止的。 定义这些方法是唯一支持使用此类的方法。
 
所有其他方法都被声明为final ，因为它们不能独立变化。

您还可以找到来自继承的方法AbstractOwnableSynchronizer有用跟踪线程拥有独家同步的。 

我们鼓励您使用它们 - 这样可以使监控和诊断工具帮助用户确定哪些线程持有锁定。

即使这个类基于内部FIFO队列，它也不会自动执行FIFO采集策略。 

排他同步的核心形式如下：

```java
Acquire:
     while (!tryAcquire(arg)) {
        enqueue thread if it is not already queued;
        possibly block current thread;
     }

 Release:
     if (tryRelease(arg))
        unblock the first queued thread; 
```

（共享模式类似，但可能包含级联信号。）

因为在采集检查入队之前调用，所以新获取的线程可能闯入其他被阻塞和排队的。 

但是，如果需要，您可以通过内部调用一个或多个检查方法来定义tryAcquire和/或tryAcquireShared来禁用驳船，从而提供一个合理的 FIFO采购订单。 

特别地，最公平同步器可以定义tryAcquire返回false如果hasQueuedPredecessors() （具体地设计成由公平同步器中使用的方法）返回true 。 其他变化是可能的。

吞吐量和可扩展性通常对于默认的驳船（也称为贪心 ， 放弃和车队避免 ）战略来说是最高的。 

虽然这不能保证是公平的或无饥饿的，但较早排队的线程在稍后排队的线程之前被允许重新侦听，并且每次重新提供对于传入线程成功的机会。 

此外，虽然获取在通常意义上不“旋转”，但是在阻止之前它们可以执行多个tryAcquire tryAcquire与其他计算的交互。 

当独占同步只是简单地持有时，这样可以提供旋转的大部分好处，而没有大部分负债。 

如果需要，您可以通过以前通过“快速路径”检查获取方法的调用进行扩充，可能预先检查hasContended()和/或hasQueuedThreads() ，以便只有在同步器可能不被竞争的情况下才能进行。

该类为同步提供了一个高效和可扩展的基础，部分原因是可以依靠int状态，获取和释放参数以及内部FIFO等待队列的同步器的使用范围。 

当这不足够时，您可以使用atomic类，您自己的自定义Queue类和LockSupport类阻止支持从较低级别构建同步器。


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

## 添加等待着

Node 有排他和共享两种模式。

```java
/**
 * Creates and enqueues node for current thread and given mode.
 *
 * @param mode Node.EXCLUSIVE for exclusive, Node.SHARED for shared
 * @return the new node
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


TODO....

# 小结


* any list
{:toc}
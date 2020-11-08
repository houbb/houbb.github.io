---
layout: post
title:  锁专题（12）Phaser 相位器转换工具
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, concurrency, sf]
published: true
---

# Phaser

## 简介

可重用的同步屏障，其功能类似于CyclicBarrier和CountDownLatch，但支持更灵活的用法。

这个工具类我们暂时就翻译为：移相器/相位器 

## 使用入门

我们来看一个简单的例子。

假设我们有一个比赛，有多位玩家参加。

当所有玩家完成第一次比赛，我们认为上半场游戏结束；全部参加完第二次比赛，认为下半场游戏结束。

这个要如何实现呢？

### 自定义 Phaser 类

```java
public class MyPhaser extends Phaser {

    @Override
    protected boolean onAdvance(int phase, int registeredParties) {
        switch (phase) {
            case 0 :
                System.out.println("上半场完成");
                return false;
            case 1:
                System.out.println("下半场完成");
                return false;
            default:
                return true;
        }
    }

}
```

### 自定义 Runnable 类

```java
private static class GameRunnable implements Runnable {
    private final Phaser phaser;
    private GameRunnable(Phaser phaser) {
        this.phaser = phaser;
    }

    @Override
    public void run() {
        //参加上半场比赛
        System.out.println("玩家-"+Thread.currentThread().getName()+":参加上半场比赛");
        //执行这个方法的话会等所有的选手都完成了之后再继续下面的方法
        phaser.arriveAndAwaitAdvance();
        // 下半场
        //参加上半场比赛
        System.out.println("玩家-"+Thread.currentThread().getName()+":参加下半场比赛");
        //执行这个方法的话会等所有的选手都完成了之后再继续下面的方法
        phaser.arriveAndAwaitAdvance();
    }
}
```

### 测试验证

```java
public static void main(String[] args) {
    int nums = 3;
    Phaser phaser = new MyPhaser();

    //注册一次表示 phaser 维护的线程个数
    phaser.register();
    for(int i = 0; i < nums; i++) {
        phaser.register();
        Thread thread = new Thread(new GameRunnable(phaser));
        thread.start();
    }

    //后续阶段主线程就不参加了
    phaser.arriveAndDeregister();
}
```

对应日志如下：

```
玩家-Thread-0:参加上半场比赛
玩家-Thread-2:参加上半场比赛
玩家-Thread-1:参加上半场比赛
上半场完成
玩家-Thread-1:参加下半场比赛
玩家-Thread-2:参加下半场比赛
玩家-Thread-0:参加下半场比赛
下半场完成
```

非常符合我们的预期。

那么这个到底是怎么实现的呢？

这个基本上已经是 juc 的最后一节了。

# 源码解析

## 类定义

此类实现X10“时钟”的扩展。

感谢Vijay Saraswat的想法，以及Vivek Sarkar的扩展以扩展功能。

```java
/**
 * @since 1.7
 * @author Doug Lea
 */
public class Phaser {
}
```

这个类是在 jdk1.7 引入的。

## 状态

状态是一个很重要的属性，我们这里重点看一下。

```java
private volatile long state;
```

这是一个通过 volatile 修饰的变量。

主要状态表示形式，具有四个位域：

```
unarrived-尚未达到要求的参与方数量（位0-15）
parties-等待的派对数量（16-31位）
phase-屏障的产生（位32-62）
terminated-设置是否终止屏障（位63 /符号）
```

除了没有注册方的 phaser 以外，否则具有零方和一个未到达方的非法状态（在下面编码为EMPTY）除外。

为了有效地保持原子性，这些值打包成一个（原子）长整型变量。

良好的性能取决于保持状态解码和编码简单，并保持竞争窗口简短。

所有状态更新都是通过CAS执行的，除了子 phaser（即具有非空父级的子phaser）的初始注册。

在这种情况下（相对罕见），我们在首次向其父级注册时使用内置同步进行锁定。

子phaser的相位被允许滞后于其祖先的相位，直到其被实际访问为止-参见方法reconcileState。

## 其他内部变量

主要是一些位运算变量，还有一些特殊的值。

```java
private static final int  MAX_PARTIES     = 0xffff;
private static final int  MAX_PHASE       = Integer.MAX_VALUE;
private static final int  PARTIES_SHIFT   = 16;
private static final int  PHASE_SHIFT     = 32;
private static final int  UNARRIVED_MASK  = 0xffff;      // to mask ints
private static final long PARTIES_MASK    = 0xffff0000L; // to mask longs
private static final long COUNTS_MASK     = 0xffffffffL;
private static final long TERMINATION_BIT = 1L << 63;

// some special values
private static final int  ONE_ARRIVAL     = 1;
private static final int  ONE_PARTY       = 1 << PARTIES_SHIFT;
private static final int  ONE_DEREGISTER  = ONE_ARRIVAL|ONE_PARTY;
private static final int  EMPTY           = 1;
```


## 构造器

```java
public Phaser() {
    this(null, 0);
}


public Phaser(int parties) {
    this(null, parties);
}

public Phaser(Phaser parent) {
    this(parent, 0);
}
```

上面 3 个调用的都是下面的方法：

```java
public Phaser(Phaser parent, int parties) {
    if (parties >>> PARTIES_SHIFT != 0)
        throw new IllegalArgumentException("Illegal number of parties");
    int phase = 0;
    this.parent = parent;
    if (parent != null) {
        final Phaser root = parent.root;
        this.root = root;
        this.evenQ = root.evenQ;
        this.oddQ = root.oddQ;
        if (parties != 0)
            phase = parent.doRegister(1);
    }
    else {
        this.root = this;
        this.evenQ = new AtomicReference<QNode>();
        this.oddQ = new AtomicReference<QNode>();
    }
    this.state = (parties == 0) ? (long)EMPTY :
        ((long)phase << PHASE_SHIFT) |
        ((long)parties << PARTIES_SHIFT) |
        ((long)parties);
}
```

这里的 root 或者是 parent 实际上也是一个 phaser 变量：

```java
/**
 * The parent of this phaser, or null if none
 */
private final Phaser parent;

/**
 * The root of phaser tree. Equals this if not in a tree.
 */
private final Phaser root;
```

对应的 evenQ/oddQ 是一个 atomic 的引用：

```java
/**
 * Treiber堆栈头用于等待线程。
 * 为了消除释放某些线程而添加其他线程时的争用，我们使用其中两个，在偶数和奇数阶段交替使用。
 * 子相位器与root共享队列以加快发布速度。
 */
private final AtomicReference<QNode> evenQ;
private final AtomicReference<QNode> oddQ;
```


## register 注册

我们主要看一下案例中用到的几个方法，首先看一下 register 方法。

```java
public int register() {
    return doRegister(1);
}
```

实际上调用的是下面的方法：

```java
/**
 * Implementation of register, bulkRegister
 *
 * @param registrations 要添加到双方和未到达字段的数量。 必须大于零。
 * @author 老马啸西风
 */
private int doRegister(int registrations) {
    // adjustment to state
    // 位移+或运算
    long adjust = ((long)registrations << PARTIES_SHIFT) | registrations;
    final Phaser parent = this.parent;
    int phase;
    for (;;) {
        // 父类状态为 null，直接取 state，或者取 reconcileState（见下方）
        long s = (parent == null) ? state : reconcileState();
        int counts = (int)s;

        // 
        int parties = counts >>> PARTIES_SHIFT;
        int unarrived = counts & UNARRIVED_MASK;
        if (registrations > MAX_PARTIES - parties)
            // 返回异常信息，见下方
            throw new IllegalStateException(badRegister(s));
        phase = (int)(s >>> PHASE_SHIFT);
        if (phase < 0)
            break;
        if (counts != EMPTY) {                  // not 1st registration
            if (parent == null || reconcileState() == s) {
                if (unarrived == 0)             // wait out advance
                    // 这个是内部等待的方法，见下方详解。
                    root.internalAwaitAdvance(phase, null);
                    
                // 通过 CAS 设置
                else if (UNSAFE.compareAndSwapLong(this, stateOffset,
                                                   s, s + adjust))
                    break;
            }
        }
        else if (parent == null) {              // 1st root registration
            long next = ((long)phase << PHASE_SHIFT) | adjust;
            if (UNSAFE.compareAndSwapLong(this, stateOffset, s, next))
                break;
        }
        else {
            // 使用悲观锁加锁
            synchronized (this) {               // 1st sub registration
                if (state == s) {               // recheck under lock
                    phase = parent.doRegister(1);
                    if (phase < 0)
                        break;
                    // finish registration whenever parent registration
                    // succeeded, even when racing with termination,
                    // since these are part of the same "transaction".
                    while (!UNSAFE.compareAndSwapLong
                           (this, stateOffset, s,
                            ((long)phase << PHASE_SHIFT) | adjust)) {
                        s = state;
                        phase = (int)(root.state >>> PHASE_SHIFT);
                        // assert (int)s == EMPTY;
                    }
                    break;
                }
            }
        }
    }
    return phase;
}
```

### reconcileState 解析

```java
/**
 * 如有必要，解决从根开始的滞后相位传播。
 * 协调通常在root已提前但子相位尚未执行时发生，在这种情况下，它们必须通过将未到达方设置为前进（或如果方为零，则重置为未注册的EMPTY状态）来完成自己的 * 前。
 *
 * @return reconciled state
 * @author 老马啸西风
 */
private long reconcileState() {
    // 获取 root 节点
    final Phaser root = this.root;
    long s = state;

    // 默认的 root 就是 this，不等于说明有真正的 root 节点。
    if (root != this) {
        int phase, p;
        // CAS to root phase with current parties, tripping unarrived
        // 秀的头皮发麻的 CAS 操作。
        while ((phase = (int)(root.state >>> PHASE_SHIFT)) !=
               (int)(s >>> PHASE_SHIFT) &&
               !UNSAFE.compareAndSwapLong
               (this, stateOffset, s,
                s = (((long)phase << PHASE_SHIFT) |
                     ((phase < 0) ? (s & COUNTS_MASK) :
                      (((p = (int)s >>> PARTIES_SHIFT) == 0) ? EMPTY :
                       ((s & PARTIES_MASK) | p))))))
            s = state;
    }
    return s;
}
```

### badRegister

返回相关注册失败的信息。

```java
/**
 * Returns message string for bounds exceptions on registration.
 */
private String badRegister(long s) {
    return "Attempt to register more than " +
        MAX_PARTIES + " parties for " + stateToString(s);
}
```

对应的状态信息为：

```java
/**
 * Implementation of toString and string-based error messages
 */
private String stateToString(long s) {
    return super.toString() +
        "[phase = " + phaseOf(s) +
        " parties = " + partiesOf(s) +
        " arrived = " + arrivedOf(s) + "]";
}
```

### internalAwaitAdvance 内部的等待方法

这个方法只能被 root 节点调用，用于阻塞线程，等待阶段完成使用。

```java
/**
 * 除非中止，否则可能会阻塞并等待阶段前进。
 * 仅在根相位器上调用。
 *
 * @param phase current phase
 * @param node if non-null, the wait node to track interrupt and timeout;
 * if null, denotes noninterruptible wait
 * @return current phase
 * @author 老马啸西风
 */
private int internalAwaitAdvance(int phase, QNode node) {
    // assert root == this;
    releaseWaiters(phase-1);          // ensure old queue clean
    boolean queued = false;           // true when node is enqueued
    int lastUnarrived = 0;            // to increase spins upon change
    int spins = SPINS_PER_ARRIVAL;
    long s;
    int p;
    while ((p = (int)((s = state) >>> PHASE_SHIFT)) == phase) {
        if (node == null) {           // spinning in noninterruptible mode
            int unarrived = (int)s & UNARRIVED_MASK;
            if (unarrived != lastUnarrived &&
                (lastUnarrived = unarrived) < NCPU)
                spins += SPINS_PER_ARRIVAL;
            boolean interrupted = Thread.interrupted();

            // 被中断，且已经自旋结束。
            if (interrupted || --spins < 0) { // need node to record intr
                node = new QNode(this, phase, false, false, 0L);
                node.wasInterrupted = interrupted;
            }
        }
        else if (node.isReleasable()) // done or aborted
            break;
        else if (!queued) {           // push onto queue
            AtomicReference<QNode> head = (phase & 1) == 0 ? evenQ : oddQ;
            QNode q = node.next = head.get();
            if ((q == null || q.phase == phase) &&
                (int)(state >>> PHASE_SHIFT) == phase) // avoid stale enq
                queued = head.compareAndSet(q, node);
        }
        else {
            try {
                // 线程阻塞
                ForkJoinPool.managedBlock(node);
            } catch (InterruptedException ie) {
                node.wasInterrupted = true;
            }
        }
    }
    if (node != null) {
        if (node.thread != null)
            node.thread = null;       // avoid need for unpark()
        if (node.wasInterrupted && !node.interruptible)
            Thread.currentThread().interrupt();
        if (p == phase && (p = (int)(state >>> PHASE_SHIFT)) == phase)
            // 中断等待，见下方实现
            return abortWait(phase); // possibly clean up on abort
    }
    releaseWaiters(phase);
    return p;
}
```

- releaseWaiters 释放等待者

```java
/**
* 从队列中删除线程并发出信号通知阶段。
* @author 老马啸西风
*/
private void releaseWaiters(int phase) {
    // 队列中的第一个元素
    QNode q;   
    // 对应的线程信息
    Thread t;  
    // 根据奇偶，选择不同的队列。
    AtomicReference<QNode> head = (phase & 1) == 0 ? evenQ : oddQ;
    while ((q = head.get()) != null &&
           q.phase != (int)(root.state >>> PHASE_SHIFT)) {
        // 设置 q 为 q.next，并且 q.thread 持有线程       
        if (head.compareAndSet(q, q.next) &&
            (t = q.thread) != null) {
            // 清空对应的线程    
            q.thread = null;
            // 唤醒 t 对应的线程
            LockSupport.unpark(t);
        }
    }
}
```

- abortWait 中断等待

```java
/**
 * releaseWaiters的一种变体，它另外尝试删除由于超时或中断而不再等待提前的任何节点。
 * 当前，仅当节点位于队列头时才将其删除，这足以减少大多数使用情况下的内存占用。
 *
 * @return current phase on exit
 * @author 老马啸西风
 */
private int abortWait(int phase) {
    // 选择奇偶队列
    AtomicReference<QNode> head = (phase & 1) == 0 ? evenQ : oddQ;
    for (;;) {
        Thread t;
        // 头节点
        QNode q = head.get();
        int p = (int)(root.state >>> PHASE_SHIFT);
        if (q == null || ((t = q.thread) != null && q.phase == p))
            return p;

        // CAS 设置节点 q 为 q.next（删除头节点）    
        if (head.compareAndSet(q, q.next) && t != null) {
            q.thread = null;
            LockSupport.unpark(t);
        }
    }
}
```

# arriveAndAwaitAdvance 到达并且等待

## 实现

```java
/**
 * 到达此移相器并等待其他人。
 * 等效于awaitAdvance。
 * 如果您需要等待中断或超时，则可以使用 awaitAdvance 方法的其他形式之一以类似的方式进行安排。
 * 如果相反，您需要在到达时注销，请使用 awaitAdvance（arriveAndDeregister（））。
 *
 * 未注册方调用此方法是错误的用法。
 * 但是，仅在此相位器上进行一些后续操作时，此错误才可能导致IllegalStateException。
 *
 * @return the arrival phase number, or the (negative)
 * {@linkplain #getPhase() current phase} if terminated
 * @throws IllegalStateException if not terminated and the number
 * of unarrived parties would become negative
 * @author 老马啸西风
 */
public int arriveAndAwaitAdvance() {
    // Specialization of doArrive+awaitAdvance eliminating some reads/paths
    final Phaser root = this.root;
    for (;;) {
        // 获取状态
        long s = (root == this) ? state : reconcileState();
        int phase = (int)(s >>> PHASE_SHIFT);
        if (phase < 0)
            return phase;

        // 计算未到达的数量    
        int counts = (int)s;
        int unarrived = (counts == EMPTY) ? 0 : (counts & UNARRIVED_MASK);
        if (unarrived <= 0)
            throw new IllegalStateException(badArrive(s));

        // 通过 CAS 更新到达者的数量    
        if (UNSAFE.compareAndSwapLong(this, stateOffset, s,
                                      s -= ONE_ARRIVAL)) {

            // 如果还存在未到达的，参见上面的等待方法。                              
            if (unarrived > 1)
                return root.internalAwaitAdvance(phase, null);
            if (root != this)
                // 这个方法上面有解析，不过此处调用的时 parent
                return parent.arriveAndAwaitAdvance();

            long n = s & PARTIES_MASK;  // base of next state
            int nextUnarrived = (int)n >>> PARTIES_SHIFT;

            // 注意：这里调用了对应的 onAdvance 方法，就是我们前面自定义实现的方法。
            if (onAdvance(phase, nextUnarrived))
                n |= TERMINATION_BIT;
            else if (nextUnarrived == 0)
                n |= EMPTY;
            else
                n |= nextUnarrived;

            int nextPhase = (phase + 1) & MAX_PHASE;
            n |= (long)nextPhase << PHASE_SHIFT;

            //CAS 更新失败，直接中断
            if (!UNSAFE.compareAndSwapLong(this, stateOffset, s, n))
                return (int)(state >>> PHASE_SHIFT); // terminated
            releaseWaiters(phase);
            return nextPhase;
        }
    }
}
```

### onAdvance 重载时的核心方法

一般我们都会对这个方法进行重载。

```java
/**
 * 一种在即将到来的相位超前执行操作并控制终止的可重写方法。
 * 在推进此移相器的一方到达时（当所有其他等待方都处于休眠状态时）调用此方法。
 * 如果此方法返回{@code true}，则此移相器将提前设置为最终终止状态，随后对{@link #isTerminated}的调用将返回true。
 *  调用此方法引发的任何（未经检查的）异常或错误都会传播到尝试推进此相位器的一方，在这种情况下，不会发生提前。
 *
 * 此方法的参数提供了当前过渡中普遍使用的移相器状态。
 * 从{@code onAdvance}内在此相位器上调用到达，注册和等待方法的效果是不确定的，因此不应依赖。
 *
 * 如果此相位器是分层相位器集合的成员，则每次前进时仅为其根相位器调用{@code onAdvance}。
 *
 * 为了支持最常见的用例，当由于一方调用{@code到达AndDeregister}而导致的注册方数量变为零时，此方法的默认实现返回{@code true}。
 * 您可以通过重写此方法以始终返回{@code false}来禁用此行为，从而使以后的注册继续进行：
 *
 * <pre> {@code
 * Phaser phaser = new Phaser() {
 *   protected boolean onAdvance(int phase, int parties) { return false; }
 * }}</pre>
 *
 * @param phase 进入此方法之前，当前相位编号
 * @param registeredParties 当前注册方的数量
 * @return {@code true} 如果此移相器应终止
 * @author 老马啸西风
 */
protected boolean onAdvance(int phase, int registeredParties) {
    return registeredParties == 0;
}
```

## arriveAndDeregister 到达并且取消注册

```java
/**
 * Arrives at this phaser and deregisters from it without waiting
 * for others to arrive. Deregistration reduces the number of
 * parties required to advance in future phases.  If this phaser
 * has a parent, and deregistration causes this phaser to have
 * zero parties, this phaser is also deregistered from its parent.
 *
 * <p>It is a usage error for an unregistered party to invoke this
 * method.  However, this error may result in an {@code
 * IllegalStateException} only upon some subsequent operation on
 * this phaser, if ever.
 *
 * @return 到达阶段数量，如果终止则为负值
 * @throws IllegalStateException 如果未终止，则已注册或未注册方的数量将变为负数
 * @author 老马啸西风
 */
public int arriveAndDeregister() {
    return doArrive(ONE_DEREGISTER);
}
```

### doArrive 方法

adjust 有两个参数值：

ONE_ARRIVAL for arrive,   // 值为 1

ONE_DEREGISTER for arriveAndDeregister  // 值为 ONE_ARRIVAL|ONE_PARTY;

```java
/**
 * 方法的主要实现到达+到达并取消注册。
 * 对于仅减少未到达字段的常见情况，进行手动调整以加快并最小化竞赛窗口。
 *
 * @param adjust value to subtract from state;
 * @author 老马啸西风               
 */
private int doArrive(int adjust) {
    final Phaser root = this.root;
    for (;;) {
        // 获取状态
        long s = (root == this) ? state : reconcileState();
        int phase = (int)(s >>> PHASE_SHIFT);
        if (phase < 0)
            return phase;
        int counts = (int)s;

        // 计算未到达的数量
        int unarrived = (counts == EMPTY) ? 0 : (counts & UNARRIVED_MASK);
        if (unarrived <= 0)
            throw new IllegalStateException(badArrive(s));


        // 通过 CAS 设置变量信息    
        if (UNSAFE.compareAndSwapLong(this, stateOffset, s, s-=adjust)) {
            if (unarrived == 1) {
                long n = s & PARTIES_MASK;  // base of next state
                int nextUnarrived = (int)n >>> PARTIES_SHIFT;
                if (root == this) {
                    // 这个就是我们重载的方法
                    if (onAdvance(phase, nextUnarrived))
                        n |= TERMINATION_BIT;
                    else if (nextUnarrived == 0)
                        n |= EMPTY;
                    else
                        n |= nextUnarrived;

                    // 计算下一个 phase 
                    int nextPhase = (phase + 1) & MAX_PHASE;
                    n |= (long)nextPhase << PHASE_SHIFT;
                    UNSAFE.compareAndSwapLong(this, stateOffset, s, n);
                    releaseWaiters(phase);
                }

                // 广播注销
                else if (nextUnarrived == 0) { // propagate deregistration
                    phase = parent.doArrive(ONE_DEREGISTER);
                    UNSAFE.compareAndSwapLong(this, stateOffset,
                                              s, s | EMPTY);
                }
                else
                    phase = parent.doArrive(ONE_ARRIVAL);
            }
            return phase;
        }
    }
}
```

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

* any list
{:toc}
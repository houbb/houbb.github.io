---
layout: post
title:  锁专题（9） Exchanger 双方栅栏源码深度解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: false
---

# Exchanger

## 简介

栅栏在Java同步工具包中的体现还有一个Exchanger，是一个双方栅栏，每一个在栅栏处交换数据。

当双方执行的操作不对称的时候，Exchanger会很有用。

当双方线程都到达栅栏的时候，将双方的数据进行交换，这个Exchanger对象可以使得两个线程生成的对象能够安全地交换。

## 空构造函数

这个类只提供了一个空构造函数，提供了两个方法：

```java
exchange(V x);//交换双方线程生成对象 交换成功或者被中断

exchange(V x, long timeout, TimeUnit unit);//交换双方线程生成对象 交换成功或者超时抛出超时异常或者被中断
```

## 例子

### 类定义

```java
static class Thread1 extends Thread {
    private Exchanger<String> exchanger;
    private String name;
    public Thread1(String name, Exchanger<String> exchanger) {
        super(name);
        this.exchanger = exchanger;
    }
    @Override
    public void run() {
        try {
            long startTime = System.currentTimeMillis();
            Thread.sleep(3000);
            System.out.println(Thread.currentThread() + "获取到数据:" + exchanger.exchange("我是Thread1的实例"));
            System.out.println("等待了" + (System.currentTimeMillis() - startTime));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

static class Thread2 extends Thread {
    private Exchanger<String> exchanger;
    private String name;
    public Thread2(String name, Exchanger<String> exchanger) {
        super(name);
        this.exchanger = exchanger;
    }
    @Override
    public void run() {
        try {
            long startTime = System.currentTimeMillis();
            System.out.println(Thread.currentThread() + "获取到数据:" + exchanger.exchange("我是Thread2的实例"));
            System.out.println("等待了" + (System.currentTimeMillis() - startTime));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 测试

```java
public static void main(String[] args) {
    Exchanger<String> exchanger = new Exchanger<String>();
    new Thread1("thread1", exchanger).start();
    new Thread2("thread2", exchanger).start();
}
```

我们通过 exchanger 让两个线程之间可以交换数据信息，日志如下：

```
Thread[thread2,5,main]获取到数据:我是Thread1的实例
Thread[thread1,5,main]获取到数据:我是Thread2的实例
等待了3016
等待了3016
```

可见 thread2 获取到了线程 1 的信息；thread1 也获取到了线程 2 的信息。


# 算法讲解

这个类的源码看起来应该是比较难懂的，我们先看一下李大狗写的算法笔记。

ps: 这个部分说明在源码中，但是不会出现在文档中。

概述：对于交换“槽”，核心算法是一个参与者和一个项目（调用者 caller）：

```java
for (;;) {
  if (slot is empty) {                       // offer
    place item in a Node;
    if (can CAS slot from empty to node) {
      wait for release;
      return matching item in node;
    }
  }
  else if (can CAS slot from node to empty) { // release
    get the item in node;
    set matching item in node;
    release waiting thread;
  }
  // else retry on CAS failure
}
```

这是“双重数据结构”的最简单形式之一-参见Scott和Scherer的DISC 04论文和

[http://www.cs.rochester.edu/research/synchronization/pseudocode/duals.html](http://www.cs.rochester.edu/research/synchronization/pseudocode/duals.html)

原则上，这很好。但是实际上，就像许多集中于单个位置的原子更新的算法一样，当使用同一个Exchanger的参与者多于几个时，它会可怕地扩展。

因此，该实现改为使用消除域的形式，该域通过安排某些线程通常使用不同的插槽来扩展此争用，同时仍然确保最终任何两个方都可以交换项目。

也就是说，我们不能完全在线程之间进行分区，而是给线程提供竞技场索引，这些索引在争用情况下平均会增长，在缺乏争用的情况下会缩小。

我们通过将我们仍然需要的节点定义为ThreadLocals来实现这一点，并在其中包括每个线程的索引和相关的簿记状态。 

（我们可以安全地重用每个线程的节点，而不必每次都重新创建它们，因为插槽在指向节点与空节点之间交替出现，因此不会遇到ABA问题。

但是，在使用之间重置它们时，我们确实需要谨慎。



实施有效的竞技场需要分配一堆空间，因此我们仅在检测到争用时这样做（单处理器除外，在单处理器上它们将无济于事，因此不会使用）。

否则，交换使用单槽slotExchange方法。

在争用时，插槽不仅必须位于不同的位置，而且由于位于同一高速缓存行（或更常见的是，相同的一致性单元），这些位置也不得遇到内存争用。 

因为在撰写本文时，尚无法确定高速缓存行的大小，所以我们定义了一个足以满足常见平台的值。

此外，在其他地方也要格外小心，以避免其他错误/意外共享并增强位置，包括向节点添加填充（通过sun.misc.Contended），将“ bound”作为Exchanger字段嵌入，以及重新处理比较的 park/unpark 机制到LockSupport版本。


竞技场（arena）仅以一个已使用的插槽开始。

我们通过跟踪碰撞来扩大有效竞技场的规模； 即尝试交换时失败了。

根据上述算法的性质，唯一能够可靠地表明竞争的冲突是两种尝试的释放发生冲突时-两种尝试的提议中的一种可以合法地导致CAS失败，而没有其他多个线程指示争用。 （注意：有可能但不值得通过在CAS故障后读取插槽值来更精确地检测竞争。）

当线程在当前竞技场边界内的每个插槽处发生冲突时，它将尝试将竞技场大小扩大一倍。 

我们通过在“bound”字段上使用版本（序列）编号来跟踪边界内的冲突，并在参与者注意到边界已更新（沿任一方向）时保守地重置冲突计数。


通过在一段时间后放弃等待并在到期时尝试减小竞技场的大小，可以减小有效竞技场的大小（当有多个插槽时）。

“一会儿”的值是一个经验问题。

我们通过附带使用spin-> yield-> block来实现，这对于获得合理的等待性能是必不可少的-在繁忙的交换器中，报价通常几乎立即发布，在这种情况下，在多处理器上进行上下文切换非常缓慢/浪费。

Arena等待，只是省略了阻塞部分，而是使用 cancel 取代（instead cancel）。

根据经验将旋转计数选择为一个值，该值可以避免在一系列测试机器上以最大持续汇率兑换99％的时间。

自旋和产量需要一定程度的随机性（使用廉价的xorshift），以避免可能导致无效的生长/收缩周期的规则模式。 

（使用伪随机还可以通过使分支不可预测来帮助调整旋转周期的持续时间。）

另外，在要约期间，服务员可以“知道”在插槽更改后将被释放，但是直到设置了匹配项之后才能进行。

同时，它不能取消 offer，而是用 spins/yields 替代。

注意：可以通过将线性化点更改为match字段的CAS（如Scott＆Scherer DISC论文中的一种情况）来避免这种二次检查，这也会增加异步性，但代价是更差冲突检测以及无法始终重用每个线程节点。

因此，当前方案通常是更好的折衷方案。



发生碰撞时，索引会以相反的顺序循环遍历整个竞技场，并在范围更改时以最大索引（趋向于最稀疏）重新开始。 （在到期时，索引减半直到达到0。）

可以（并已尝试）使用随机，素值步进或双哈希样式遍历，而不是简单的循环遍历，以减少聚集。

但是从经验上讲，这些好处可能无法克服其增加的开销：

除非存在持续的争用，否则我们将对发生的操作进行快速管理，因此，较简单/较快的控制策略比较准确但较慢的控制策略效果更好。


因为我们将到期时间用于竞技场大小控制，所以在竞技场大小缩小到零（或未启用竞技场）之前，我们无法在定时版本的公共交换方法中引发TimeoutExceptions。

这可能会延迟对超时的响应，但仍在规范范围内。


本质上，所有实现都在slotExchange和arenaExchange方法中。

它们具有相似的总体结构，但是在太多细节上无法组合。

slotExchange方法使用单个Exchanger字段“slot”，而不是竞技场数组元素。

但是，它仍然需要最少的碰撞检测来触发竞技场的建设。

（最混乱的部分是确保在两种方法都可能被调用时在过渡期间正确显示中断状态和InterruptedExceptions。这是通过将null返回作为哨兵来重新检查中断状态来完成的。）



在这种代码中太普遍了，方法是单块的，因为大多数逻辑依赖于字段的读取，这些字段作为局部变量维护，因此无法很好地分解-主要是在这里，笨重的 spin->yield-> block/cancel代码），并且在很大程度上依赖于内在函数（不安全）来使用嵌入式嵌入式CAS和相关的内存访问操作（当动态编译器隐藏在其他方法后面时，动态编译器通常不会内联它们，因为它们会更好地命名和封装预期的效果）。

这包括使用putOrderedX来清除两次使用之间每个线程节点的字段。

请注意，即使通过释放线程读取Node.item字段，也不会将其声明为volatile，因为它们仅在必须进行访问的CAS操作之后才声明为volatile，而其他线程可以接受地接受拥有线程的所有使用。 

（由于原子性的实际点是插槽CASes，所以在发行版中对Node.match的写入要弱于完全易失性写入，这也是合法的。但是，之所以不这样做，是因为它可能允许进一步推迟写入，延迟进度。）


# 源码学习

看完了算法的介绍思路，我们来看一下源码，和算法对照来看，才能更加深入的理接。

## 基本属性

这些属性的 jdk 味道太浓了，又是一堆位运算的赶脚。

```java
/**
 * The byte distance (as a shift value) between any two used slots
 * in the arena.  1 << ASHIFT should be at least cacheline size.
 * 
 * 任意两个槽hi见的距离。
 * 1 << ASHIFT 至少是一个缓存行的大小。
 * 
 * @author 老马啸西风
 */
private static final int ASHIFT = 7;

/**
 * The maximum supported arena index. The maximum allocatable
 * arena size is MMASK + 1. Must be a power of two minus one, less
 * than (1<<(31-ASHIFT)). The cap of 255 (0xff) more than suffices
 * for the expected scaling limits of the main algorithms.
 * 
 * 这里的值是 255 = 2^8 - 1，对应的是索引下标，所以实际是 256 个元素。
 * 上限255（0xff）足以满足主要算法的预期缩放比例限制。
 */
private static final int MMASK = 0xff;

/**
 * Unit for sequence/version bits of bound field. 
 * Each successful change to the bound also adds SEQ.
 *
 * 绑定字段的序列/版本位的单位。每次成功更改边界也会添加SEQ。
 */
private static final int SEQ = MMASK + 1;

/** 
* The number of CPUs, for sizing and spin control 
* CPU的数量，用于大小调整和旋转控制
*/
private static final int NCPU = Runtime.getRuntime().availableProcessors();

/**
 * The maximum slot index of the arena: The number of slots that
 * can in principle hold all threads without contention, or at
 * most the maximum indexable value.

 * 竞技场的最大插槽索引：原则上可以容纳所有线程而没有争用或最多为最大可索引值的插槽数。
 */
static final int FULL = (NCPU >= (MMASK << 1)) ? MMASK : NCPU >>> 1;

/**
 * The bound for spins while waiting for a match. The actual
 * number of iterations will on average be about twice this value
 * due to randomization. Note: Spinning is disabled when NCPU==1.

 * 等待比赛时旋转的界限。
 * 由于随机化，实际的实际迭代次数平均约为此值的两倍。
 * 注意：当NCPU == 1时，禁用旋转。
 * ps: 不要问我为什么单核禁止旋转，这个问题自己想一下。
 */
private static final int SPINS = 1 << 10;

/**
 * Value representing null arguments/returns from public
 * methods. Needed because the API originally didn't disallow null
 * arguments, which it should have.
 *
 * 表示空参数/从公共方法返回的值。
 * 因为API最初不允许使用null参数，所以需要它。
 */
private static final Object NULL_ITEM = new Object();

/**
 * Sentinel value returned by internal exchange methods upon
 * timeout, to avoid need for separate timed versions of these
 * methods.
 * 
 * 内部交换方法在超时时返回的前哨值，以避免需要这些方法的单独定时版本。
 */
private static final Object TIMED_OUT = new Object();
```


## 节点

节点保存部分交换的数据，以及其他每个线程的簿记。

通过 `@sun.misc.Contended` 填充。旨在减少内存争用。

```java
/**
 * Nodes hold partially exchanged data, plus other per-thread
 * bookkeeping. Padded via @sun.misc.Contended to reduce memory
 * contention.
 */
@sun.misc.Contended static final class Node 
    //arena 下标
    int index;              // Arena index  
    //Exchanger.bound的最后记录值
    int bound;              // Last recorded value of Exchanger.bound 
    //当前限制下的CAS失败数
    int collides;           // Number of CAS failures at current bound
    // 伪随机旋转
    int hash;               // Pseudo-random for spins
    // 该线程的当前元素
    Object item;            // This thread's current item
    // 释放线程提供的物品
    volatile Object match;  // Item provided by releasing thread
    // 停放时设置为此线程，否则为null
    volatile Thread parked; // Set to this thread when parked, else null
}
```

## 节点相关元素

```java
/** 
* The corresponding thread local class 
* 
* 对应线程本地类
*/
static final class Participant extends ThreadLocal<Node> {
    public Node initialValue() { return new Node(); }
}


/**
 * Per-thread state
 * 
 * 每一个线程的状态
 */
private final Participant participant;

/**
 * Elimination array; null until enabled (within slotExchange).
 * Element accesses use emulation of volatile gets and CAS.
 * 
 * 消除阵列； 
 * null，直到启用（在slotExchange内）。元素访问使用易失性get和CAS的仿真。
 */
private volatile Node[] arena;

/**
 * Slot used until contention detected.
 *
 * 在检测到争用之前一直使用插槽。
 */
private volatile Node slot;

/**
 * The index of the largest valid arena position, OR'ed with SEQ number in high bits, incremented on each update.  
 * The initial update from 0 to SEQ is used to ensure that the arena array is constructed only once.
 *
 * 每次更新时，将最大有效竞技场位置的索引与高位SEQ号进行“或”运算。
 * 从0到SEQ的初始更新用于确保舞台阵列仅被构造一次。
 */
private volatile int bound;
```

## exchange 方法

我们看一下最核心的方法 `exchange(V)` 方法。

等待另一个线程到达此交换点（除非当前线程被中断，然后将给定的对象传送给它，以接收其返回的对象。

```java
@SuppressWarnings("unchecked")
public V exchange(V x) throws InterruptedException {
    Object v;

    // 这里对 null 值做了一个统一转换。
    Object item = (x == null) ? NULL_ITEM : x; // translate null args

    if ((arena != null ||
         (v = slotExchange(item, false, 0L)) == null) &&
        ((Thread.interrupted() || // disambiguates null return
          (v = arenaExchange(item, false, 0L)) == null)))
        throw new InterruptedException();

    // 对 NULL_ITEM 重新转转换为 null
    return (v == NULL_ITEM) ? null : (V)v;
}
```

这里最核心的是两个 exchange 方法：slotExchange 和 arenaExchange

## slotExchange

在启用 arenas 之前一直使用交换功能。

这个方法太长了，对阅读的人非常不友好。

```java
private final Object slotExchange(Object item, boolean timed, long ns) {
    Node p = participant.get();
    Thread t = Thread.currentThread();

    // 如果当前线程中断，则直接返回 null
    if (t.isInterrupted()) // preserve interrupt status so caller can recheck
        return null;

    for (Node q;;) {
        if ((q = slot) != null) {
            // 
            if (U.compareAndSwapObject(this, SLOT, q, null)) {
                Object v = q.item;
                q.match = item;
                Thread w = q.parked;
                if (w != null)
                    U.unpark(w);
                return v;
            }

            // create arena on contention, but continue until slot null
            if (NCPU > 1 && bound == 0 &&
                U.compareAndSwapInt(this, BOUND, 0, SEQ))
                arena = new Node[(FULL + 2) << ASHIFT];
        }
        // arena 如果不为 null，则直接返回 null
        else if (arena != null)
            return null; // caller must reroute to arenaExchange
        else {
            p.item = item;
            if (U.compareAndSwapObject(this, SLOT, null, p))
                break;
            p.item = null;
        }
    }

    // await release
    int h = p.hash;
    long end = timed ? System.nanoTime() + ns : 0L;
    int spins = (NCPU > 1) ? SPINS : 1;
    Object v;
    while ((v = p.match) == null) {
        if (spins > 0) {
            h ^= h << 1; h ^= h >>> 3; h ^= h << 10;
            if (h == 0)
                h = SPINS | (int)t.getId();
            else if (h < 0 && (--spins & ((SPINS >>> 1) - 1)) == 0)
                Thread.yield();
        }
        else if (slot != p)
            spins = SPINS;
        else if (!t.isInterrupted() && arena == null &&
                 (!timed || (ns = end - System.nanoTime()) > 0L)) {
            U.putObject(t, BLOCKER, this);
            p.parked = t;
            if (slot == p)
                U.park(false, ns);
            p.parked = null;
            U.putObject(t, BLOCKER, null);
        }
        else if (U.compareAndSwapObject(this, SLOT, p, null)) {
            v = timed && ns <= 0L && !t.isInterrupted() ? TIMED_OUT : null;
            break;
        }
    }
    U.putOrderedObject(p, MATCH, null);
    p.item = null;
    p.hash = h;
    return v;
}
```

### Unsafe

和其他 AQS 工具一样，这里的锁控制也是依赖于 Unsafe 对象的。

```java
// Unsafe mechanics
private static final sun.misc.Unsafe U;
private static final long BOUND;
private static final long SLOT;
private static final long MATCH;
private static final long BLOCKER;
private static final int ABASE;
static {
    int s;
    try {
        U = sun.misc.Unsafe.getUnsafe();
        Class<?> ek = Exchanger.class;
        Class<?> nk = Node.class;
        Class<?> ak = Node[].class;
        Class<?> tk = Thread.class;
        BOUND = U.objectFieldOffset
            (ek.getDeclaredField("bound"));
        SLOT = U.objectFieldOffset
            (ek.getDeclaredField("slot"));
        MATCH = U.objectFieldOffset
            (nk.getDeclaredField("match"));
        BLOCKER = U.objectFieldOffset
            (tk.getDeclaredField("parkBlocker"));
        s = U.arrayIndexScale(ak);
        // ABASE absorbs padding in front of element 0
        ABASE = U.arrayBaseOffset(ak) + (1 << ASHIFT);
    } catch (Exception e) {
        throw new Error(e);
    }
    if ((s & (s-1)) != 0 || s > (1 << ASHIFT))
        throw new Error("Unsupported array scale");
}
```

## arenaExchange

arenas 启用时的交换方法。

```java
private final Object arenaExchange(Object item, boolean timed, long ns) {
    Node[] a = arena;
    Node p = participant.get();
    for (int i = p.index;;) {                      // access slot at i
        int b, m, c; long j;                       // j is raw array offset
        Node q = (Node)U.getObjectVolatile(a, j = (i << ASHIFT) + ABASE);
        if (q != null && U.compareAndSwapObject(a, j, q, null)) {
            Object v = q.item;                     // release
            q.match = item;
            Thread w = q.parked;
            if (w != null)
                U.unpark(w);
            return v;
        }
        else if (i <= (m = (b = bound) & MMASK) && q == null) {
            p.item = item;                         // offer
            if (U.compareAndSwapObject(a, j, null, p)) {
                long end = (timed && m == 0) ? System.nanoTime() + ns : 0L;
                Thread t = Thread.currentThread(); // wait
                for (int h = p.hash, spins = SPINS;;) {
                    Object v = p.match;
                    if (v != null) {
                        U.putOrderedObject(p, MATCH, null);
                        p.item = null;             // clear for next use
                        p.hash = h;
                        return v;
                    }
                    else if (spins > 0) {
                        h ^= h << 1; h ^= h >>> 3; h ^= h << 10; // xorshift
                        if (h == 0)                // initialize hash
                            h = SPINS | (int)t.getId();
                        else if (h < 0 &&          // approx 50% true
                                 (--spins & ((SPINS >>> 1) - 1)) == 0)
                            Thread.yield();        // two yields per wait
                    }
                    else if (U.getObjectVolatile(a, j) != p)
                        spins = SPINS;       // releaser hasn't set match yet
                    else if (!t.isInterrupted() && m == 0 &&
                             (!timed ||
                              (ns = end - System.nanoTime()) > 0L)) {
                        U.putObject(t, BLOCKER, this); // emulate LockSupport
                        p.parked = t;              // minimize window
                        if (U.getObjectVolatile(a, j) == p)
                            U.park(false, ns);
                        p.parked = null;
                        U.putObject(t, BLOCKER, null);
                    }
                    else if (U.getObjectVolatile(a, j) == p &&
                             U.compareAndSwapObject(a, j, p, null)) {
                        if (m != 0)                // try to shrink
                            U.compareAndSwapInt(this, BOUND, b, b + SEQ - 1);
                        p.item = null;
                        p.hash = h;
                        i = p.index >>>= 1;        // descend
                        if (Thread.interrupted())
                            return null;
                        if (timed && m == 0 && ns <= 0L)
                            return TIMED_OUT;
                        break;                     // expired; restart
                    }
                }
            }
            else
                p.item = null;                     // clear offer
        }
        else {
            if (p.bound != b) {                    // stale; reset
                p.bound = b;
                p.collides = 0;
                i = (i != m || m == 0) ? m : m - 1;
            }
            else if ((c = p.collides) < m || m == FULL ||
                     !U.compareAndSwapInt(this, BOUND, b, b + SEQ + 1)) {
                p.collides = c + 1;
                i = (i == 0) ? m : i - 1;          // cyclically traverse
            }
            else
                i = m + 1;                         // grow
            p.index = i;
        }
    }
}
```


TODO....





# 小结

Semaphore 作为一个并发的控制工具，使用起来非常的方便，实现的原理非常类似可重入锁，都是继承自 AQS 类。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

* any list
{:toc}
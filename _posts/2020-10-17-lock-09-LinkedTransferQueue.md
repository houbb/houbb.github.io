---
layout: post
title:  锁专题（9） LinkedTransferQueue 源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, queue, data-struct, sf]
published: flase
---

# LinkedTransferQueue 

## 是什么

基于链接节点的无限制{@link TransferQueue}。

此队列针对任何给定的生产者对元素FIFO（先进先出）进行排序。

队列的开头是某个生产者在队列中停留时间最长的元素。

队列的尾部是某个生产者最短时间进入队列的元素。


# 算法笔记

Transfer 的接口是 jdk1.7 才引入的。

下面是一些算法笔记，不会出现在 doc 文档中。是作者设计和实现这个类的一些想法，可以帮助我们更好的理解源码，不感兴趣可以跳过。

## 具有松弛的双队列概述（Overview of Dual Queues with Slack）

由Scherer和Scott 0（http://www.cs.rice.edu/~wns1/papers/2004-DISC-DDS.pdf）引入的双重队列是（链接的）队列，其中的节点可以表示数据或请求。

当线程尝试使数据节点入队，但遇到请求节点时，它将“匹配”并删除它； 反之亦然。

阻塞双队列安排使排队未匹配请求的线程阻塞，直到其他线程提供匹配为止。

双同步队列（请参见Scherer，Lea和Scott http://www.cs.rochester.edu/u/scott/papers/2009_Scherer_CACM_S Q.pdf）还安排了使不匹配数据排队的线程也会阻塞。

双重呼叫队列支持所有这些模式，具体取决于 caller。


可以使用Michael＆Scott（M＆S）无锁队列算法（http://www.cs.rochester.edu/u/scott/papers/1996_PODC_queues.pdf）的变体来实现FIFO双队列。

它维护两个指针字段“head”，它们指向一个（匹配的）节点，该节点又指向第一个实际的（不匹配的）队列节点（如果为空，则为null）； 和“tail”指向队列的最后一个节点（如果为空，则再次为null）。

例如，这是一个可能的队列，其中包含四个数据元素：

```
head                tail
  |                   |
  v                   v
  M -> U -> U -> U -> U
```


众所周知，在维护（通过CAS）这些头和尾指针时，M＆S队列算法容易受到可伸缩性和开销的限制。

这就导致了减少竞争的变体的发展，例如消除数组（请参见Moir等人http://portal.acm.org/citation.cfm?id=1074013）和乐观的后指针（请参见Ladan-Mozes和Shavit http://people.csail.mit.edu/edya/publications/OptimisticFIFOQueue-journal.pdf）。

但是，双重队列的性质使得在需要双重性时可以采用一种更简单的策略来改进M＆S样式的实现。


在双队列中，每个节点必须自动保持其匹配状态。

尽管还有其他可能的变体，但我们在这里实现为：**对于数据模式节点，匹配需要在匹配时将CAS的“item”字段从非null数据值转换为null，反之亦然，对于请求节点，CASing 从 null 转换为数据值**。

（请注意，这种队列样式的线性化属性很容易验证-元素通过链接可用，而通过匹配不可用。）

与普通M＆S队列相比，双队列的此属性需要每个enq / deq对额外进行一次成功的原子操作。

但这也使队列维护机制的成本降低。 （这种想法的变体甚至适用于支持删除内部元素的非双重队列，例如j.u.c.ConcurrentLinkedQueue。）



节点匹配后，其匹配状态将永远不会再改变。

因此，我们可以安排它们的链表包含零个或多个匹配节点的前缀，后跟零个或多个不匹配节点的后缀。 （请注意，我们允许前缀和后缀都为零长度，这又意味着我们不使用虚拟头。）

如果我们不关心时间或空间效率，则可以通过以下方式正确地执行入队和出队操作：

 从指针遍历到初始节点； 对匹配中的第一个不匹配节点的项进行CAS处理，对追加中的尾随节点的下一个字段进行CAS处理。 （加上最初装空的一些特殊外壳）。

尽管这本身就是一个可怕的想法，但它的好处是不需要在头/尾字段进行任何原子更新。


我们在这里介绍一种介于永不与总是更新队列（头和尾）指针之间的方法。

这在有时需要额外的遍历步骤来定位第一个和/或最后一个不匹配的节点与减少的开销以及争用较少的队列指针争用之间进行权衡。

例如，队列的可能快照为：

```
head           tail
  |              |
  v              v
  M -> M -> U -> U -> U -> U
```


对于此“松弛”的最佳值（“head”的值与第一个不匹配节点之间的目标最大距离，类似地对于“tail”而言）是一个经验问题。

我们发现，在1-3范围内使用非常小的常数在各种平台上效果最佳。

较大的值会增加高速缓存未命中的成本，并会带来较长的遍历链风险，而较小的值会增加CAS争用和开销。


松弛的双队列与普通的M＆S双队列的区别在于，在匹配，附加甚至遍历节点时，有时仅更新头或尾指针。 为了保持目标松弛。

“有时”的想法可以通过几种方式来实施。

最简单的方法是使用在每个遍历步骤上递增的每操作计数器，并在计数超过阈值时尝试（通过CAS）更新关联的队列指针。

另一个需要更多开销的方法是使用随机数生成器以每个遍历步骤的给定概率进行更新。



在遵循这些方针的任何策略中，由于CASes更新字段可能会失败，因此实际松弛可能会超过目标松弛。

但是，可以随时重试它们以保持目标。

即使使用非常小的松弛值，此方法也适用于双队列，因为它允许直到匹配或附加项目（因此可能允许另一个线程进行进度）之前的所有操作都是只读的，因此不会进一步引入争论。

如下所述，我们仅在这些步骤之后通过执行松弛维护重试来实现此目的。


作为此类技术的伴随，可以在不增加头指针更新争用的情况下进一步减少遍历开销：

线程有时可能会缩短从当前“头”节点到当前已知的第一个不匹配节点的“下一个”链接路径，并且对于尾部也是如此。

同样，这可以通过使用阈值或随机化来触发。


必须进一步扩展这些思想，以免由于从旧的，被遗忘的头节点开始的节点的顺序“下一个”链接而造成无数的代价高昂的回收垃圾：

正如Boehm首先详细描述的 （http://portal.acm.org/citation.cfm?doid=503272.503282）如果GC延迟通知任何任意旧节点已变为垃圾，则所有较新的死节点也将不被回收。
（在非GC环境中也会出现类似的问题。）

为了在我们的实现中解决此问题，**在CASing前进头指针时，我们将前一个头的“下一个”链接设置为仅指向自身。从而限制了连接的死列表的长度**。

（我们也采取了类似的措施，以清除其他Node字段中保留的垃圾保留值。）

但是，这样做会进一步增加遍历的复杂性：

如果**有任何“下一个”指针链接到自身，则表明当前线程已落后于head更新，因此遍历必须从“head”开始**。

试图从“尾巴”开始查找当前尾巴的遍历也可能会遇到自链接，在这种情况下，它们也将在“头部”继续。

ps: 这里实际上是一种 trade-off，指向自身，可以很好的限制死列表的长度，但是会导致遍历时需要重头开始。不过作者应该还是觉得利大于弊。


## 实现概览

我们使用基于阈值的方法进行更新，其松弛阈值为2，即，当当前指针似乎与第一个/最后一个节点相距两步或更多步时，我们更新头/尾。

Slack值是硬连线（hard-wired）的：通过检查遍历指针的相等性来自然地实现大于1的路径，除非列表只有一个元素，在这种情况下，我们将Slack阈值保持为1。

避免在方法调用之间跟踪显式计数会稍微简化已经很混乱的实现。 如果每个线程都有一个低质量的便宜线程，那么使用随机化可能会更好，但是即使ThreadLocalRandom对于这些目的来说也太重了。


由于松弛阈值如此之小，除非取消/删除（请参阅下文），否则不值得通过路径短路（即内部节点未拼接）来增加它。


在任何节点入队之前，我们允许head和tail字段都为空； 在第一次追加时初始化。

这简化了其他逻辑，并提供了更有效的显式控制路径，而不是让JVM在null时插入隐式NullPointerExceptions。

尽管目前尚未完全实施，但我们也保留了在空白状态下重新清空这些字段的可能性（安排起来很复杂，几乎没有好处）。



所有入队/出队操作均由单一方法 `xfer` 处理，该方法的参数指示是否充当要约，卖出，轮询，接受或转移的某种形式（每种可能具有超时）。

使用一种整体方法的相对复杂性超过了每种情况下使用单独方法的代码量和维护问题。


操作最多包括三个阶段。 

第一个在方法xfer中实现，第二个在tryAppend中实现，第三个在awaitMatch方法中实现。



（1）尝试匹配现有节点

从头开始，跳过已经匹配的节点，直到找到一个相反模式的不匹配节点（如果存在），在这种情况下将其匹配并返回，还可以根据需要将头更新为经过匹配的节点（如果列表具有 没有其他不匹配的节点）。

如果CAS未命中，则循环重试前进两步，直到成功或松弛最多为两步为止。

通过要求每次尝试都前进两个（如果适用），我们可以确保松弛不会无限增长。 遍历还检查初始头是否现在不在列表中，在这种情况下，遍历从新头开始。

如果未找到任何候选者并且呼叫是未定时的轮询/提供，则返回（参数“how”为NOW）。


（2）尝试附加一个新节点（方法tryAppend）

从当前的尾指针开始，找到实际的最后一个节点，然后尝试追加一个新节点（或者如果head为空，则建立第一个节点）。

仅当其前任节点已经匹配或处于相同模式时，才可以追加节点。

如果我们检测到其他情况，则遍历期间必须添加了具有相反模式的新节点，因此我们必须在阶段1重新启动。

遍历和更新步骤在其他方面类似于阶段1：重试CAS遗漏并检查陈旧性。

特别是，如果遇到自链接，则可以通过在当前头继续遍历来安全地跳转到列表中的节点。
  
成功追加后，如果调用为ASYNC，则返回。

（3）等待比赛或取消比赛（方法awaitMatch）

等待另一个线程与节点匹配；如果当前线程被中断或等待超时，则取消该操作。

在多处理器上，我们使用队列前旋转：如果某个节点似乎是队列中的第一个不匹配节点，则它会在阻塞之前旋转一点。无论哪种情况，在阻塞之前，它都会尝试取消拼接当前“头”与第一个不匹配节点之间的任何节点。

队列前旋转极大地提高了竞争激烈的队列的性能。

只要相对简短和“安静”，旋转就不会对竞争较少的队列的性能产生太大影响。

在旋转期间，线程检查其中断状态并生成线程本地随机数，以决定偶尔执行Thread.yield。

尽管收益率的规格还不够明确，但我们认为，它可以帮助（但不会损害）限制旋转对繁忙系统的影响。

对于未知的前节点但其前辈尚未阻塞的节点，我们也使用较小的（1/2）自旋-这些“链接”自旋避免了排队规则的伪像，否则会导致交替的节点旋转与阻塞。

此外，与前代相比，表示相变（从数据到请求节点，反之亦然）的相变线程的前线程会收到附加的链式自旋，反映出在相变过程中解除线程阻塞所需的较长路径。


## 取消链接已删除的内部节点

除了通过上述自链接最大程度地减少垃圾保留之外，我们还取消链接已移除的内部节点。

这些可能是由于超时或等待中断或调用remove（x）或Iterator.remove引起的。

通常，如果已知某个节点曾经是某个要删除的某些节点s的前任节点，那么我们可以通过CAS对其前任的下一个字段（如果它仍指向s）取消拼接（否则s必须已经已删除或现在已不在列表中）。

但是在两种情况下，我们不能保证以这种方式使节点无法访问：

（1）如果s是列表的尾节点（即next为null），则将其固定为追加的目标节点，因此只能在追加其他节点之后再删除。

（2）给定匹配的前任节点（包括被取消的情况），我们不一定可以取消链接s：前任可能已经被拼接，在这种情况下，某些先前的可达节点可能仍指向s。

（有关更多说明，请参见Herlihy＆Shavit的“多处理器编程的艺术”第9章）。

虽然在这两种情况下，如果s或其前身位于（或可以使之）名单首位或从名单首位跌落，我们都可以排除采取进一步行动的必要性。


如果不考虑这些因素，则可能会有无数个据称已删除的节点保持可达状态。

导致这种积聚的情况很少见，但实际上可能会发生。 

例如，当一系列短时间的轮询重复出现超时，但又因队列中未计时的呼叫而永远不在列表之外时。



当出现这些情况时，我们并非总是遍历整个列表以找到要取消链接的实际前任（无论如何对情况（1）都无济于事），我们记录了可能的未拼接失败的保守估计（在“sweepVotes”中）。

当估计值超过阈值（ `SWEEP_THRESHOLD` ）时，我们将触发一次全面扫描，该阈值指示在清除之前可容忍的估计清除失败的最大数量，取消链接在初始移除时未取消链接的已取消节点。

我们通过线程达到阈值（而不是后台线程或通过将工作分散到其他线程）执行扫描，因为在发生删除的主要上下文中，调用者已经超时，取消或正在执行潜在的O（n）操作 （例如remove（x）），它们都不是时间紧迫的，足以保证替代方案会给其他线程带来的开销。


因为sweepVotes估计是保守的，并且因为节点从队列的头部掉下来时节点自然断开连接，并且由于即使在进行扫描时也允许累积投票，所以此类节点通常比估计的要少得多。

阈值的选择平衡了浪费精力和争用的可能性，而不是为内部队列在静态队列中的保留提供最坏的情况。

根据经验选择以下定义的值，以在各种超时情况下平衡这些值。


请注意，在扫描期间，我们无法自链接未链接的内部节点。

但是，当某些后继者最终跌落列表的顶端并自链接时，关联的垃圾链终止。


# 源码学习

## 类定义

```java
public class LinkedTransferQueue<E> extends AbstractQueue<E>
    implements TransferQueue<E>, java.io.Serializable {
```

继承自 AbstractQueue 抽象队列，实现了 TransferQueue 接口。

```java
/**
** @author 老马啸西风
*/
public interface TransferQueue<E> extends BlockingQueue<E> {

    boolean tryTransfer(E e);

    void transfer(E e) throws InterruptedException;

    boolean tryTransfer(E e, long timeout, TimeUnit unit)
        throws InterruptedException;

    boolean hasWaitingConsumer();

    int getWaitingConsumerCount();

}
```


## 内部变量

```java
// 是否为多核
private static final boolean MP = Runtime.getRuntime().availableProcessors() > 1;

/**
 * 当一个节点显然是队列中的第一个 waiter 时，阻塞之前在多处理器上旋转的次数（随机散布着对Thread.yield的调用）。
 * 必须是2的幂。
 * 该值是根据经验得出的-在各种处理器，CPU数量和OS上都可以很好地工作。
 */
private static final int FRONT_SPINS   = 1 << 7;

/**
* 在一个节点之前有另一个显然在旋转的节点之前，在阻塞之前旋转的次数。
* 还可作为相变时FRONT_SPINS的增量，并用作自旋期间屈服的基本平均频率。
* 必须是2的幂。
* 
* 这里其实是实际上就是 1 << 6; 为什么要这样写？大概是为了强调二者之间的联系吧。
*/
private static final int CHAINED_SPINS = FRONT_SPINS >>> 1;

/**
* 清除队列之前的最大估计移除失败次数（sweepVotes），该操作可以取消取消链接的已取消节点，这些节点在初始移除时并未取消链接。
* 该值必须至少为2，以避免在删除尾节点时进行不必要的清除。
*/
static final int SWEEP_THRESHOLD = 32;
```

# 节点定义

## 说明

队列节点。

对项目使用Object而不是E，以便在使用后忘记它们。

严重依赖于 Unsafe mechanics 来最大程度地减少不必要的排序约束：在其他访问或CAS的本质上排序的写入使用简单的宽松形式。

## 属性

```java
static final class Node {
    final boolean isData;   // false if this is a request node
    volatile Object item;   // initially non-null if isData; CASed to match
    volatile Node next;
    volatile Thread waiter; // null until waiting

    /**
     * Constructs a new node.  Uses relaxed write because item can
     * only be seen after publication via casNext.
     */
    Node(Object item, boolean isData) {
        UNSAFE.putObject(this, itemOffset, item); // relaxed write
        this.isData = isData;
    }
```


## 方法

```java
// @author: 老马啸西风
// CAS methods for fields
final boolean casNext(Node cmp, Node val) {
    return UNSAFE.compareAndSwapObject(this, nextOffset, cmp, val);
}
final boolean casItem(Object cmp, Object val) {
    // assert cmp == null || cmp.getClass() != Node.class;
    return UNSAFE.compareAndSwapObject(this, itemOffset, cmp, val);
}

/**
 * 将节点链接到自身以避免垃圾保留。
 * 仅在CASing头字段之后调用，因此使用 relaxed write。
 * 为什么是指向自己，算法笔记中作者也提到过，为了避免过长的 dead list。
 */
final void forgetNext() {
    UNSAFE.putObject(this, nextOffset, this);
}

/**
 * 将item设置为self，将waiter设置为null，以避免在匹配或取消之后保留垃圾。

    使用宽松的写法，因为顺序仅在唯一的调用上下文中受到限制：仅在提取项目的易失性/原子力学之后才忘记该项目。

    同样，清算服务员会跟随CAS或从停放处返回（如果停放过，否则我们不在乎）。
 */
final void forgetContents() {
    UNSAFE.putObject(this, itemOffset, this);
    UNSAFE.putObject(this, waiterOffset, null);
}

/**
 * 如果此节点已匹配（包括由于取消而人为匹配的情况），则返回true。
 */
final boolean isMatched() {
    Object x = item;
    return (x == this) || ((x == null) == isData);
}

/**
 * 如果这是不匹配的请求节点，则返回true。
 */
final boolean isUnmatchedRequest() {
    return !isData && item == null;
}

/**
 * 如果具有给定模式的节点无法附加到该节点，因为该节点不匹配并且具有相反的数据模式，则返回true。
 */
final boolean cannotPrecede(boolean haveData) {
    boolean d = isData;
    Object x;
    return d != haveData && (x = item) != this && (x != null) == d;
}

/**
 * 尝试人为地匹配数据节点-由remove使用。
 */
final boolean tryMatchData() {
    // assert isData;
    Object x = item;
    if (x != null && x != this && casItem(x, null)) {
        LockSupport.unpark(waiter);
        return true;
    }
    return false;
}
```

## Unsafe 相关

这里主要是通过 Unsafe 实现一些 CAS 操作，实际上也不难。

```java
// Unsafe mechanics
private static final sun.misc.Unsafe UNSAFE;
private static final long itemOffset;
private static final long nextOffset;
private static final long waiterOffset;
static {
    try {
        UNSAFE = sun.misc.Unsafe.getUnsafe();
        Class<?> k = Node.class;
        itemOffset = UNSAFE.objectFieldOffset
            (k.getDeclaredField("item"));
        nextOffset = UNSAFE.objectFieldOffset
            (k.getDeclaredField("next"));
        waiterOffset = UNSAFE.objectFieldOffset
            (k.getDeclaredField("waiter"));
    } catch (Exception e) {
        throw new Error(e);
    }
}
```

# 准备工作

我们上面定义了一个队列节点，当然也离不开对于 head tail 节点的声明：

```java
/** 
** 头结点
** 惰性初始化
*/
transient volatile Node head;

/** 
** 尾结点
** 惰性初始化
*/
private transient volatile Node tail;

/** 取消拼接已删除节点的明显故障数 */
private transient volatile int sweepVotes;
```

## 节点相关 CAS 方法

这几个都是通过 Unsafe 对上面的三个变量进行 CAS 设置。

```java
// CAS methods for fields
private boolean casTail(Node cmp, Node val) {
    return UNSAFE.compareAndSwapObject(this, tailOffset, cmp, val);
}

private boolean casHead(Node cmp, Node val) {
    return UNSAFE.compareAndSwapObject(this, headOffset, cmp, val);
}

private boolean casSweepVotes(int cmp, int val) {
    return UNSAFE.compareAndSwapInt(this, sweepVotesOffset, cmp, val);
}
```

# put 方法讲解

## 源码

```java
/**
*  插入一个元素
*/
public void put(E e) {
    xfer(e, true, ASYNC, 0);
}
```

只有一行代码，是不是很简单？

no no no, 下面才是重头戏。

## xfer

xfer 的代码就是算法笔记中提到的，还是有点多的。

TODO...

```java
/**
 * 入队方法实现
 * @author 老马啸西风
 * @param e the item or null for take
 * @param haveData true if this is a put, else a take
 * @param how NOW, ASYNC, SYNC, or TIMED
 * @param nanos timeout in nanosecs, used only if mode is TIMED
 */
private E xfer(E e, boolean haveData, int how, long nanos) {
    if (haveData && (e == null))
        throw new NullPointerException();
    Node s = null;                        // the node to append, if needed
    retry:
    for (;;) {                            // restart on append race
        for (Node h = head, p = h; p != null;) { // find & match first node
            boolean isData = p.isData;
            Object item = p.item;
            if (item != p && (item != null) == isData) { // unmatched
                if (isData == haveData)   // can't match
                    break;
                if (p.casItem(item, e)) { // match
                    for (Node q = p; q != h;) {
                        Node n = q.next;  // update by 2 unless singleton
                        if (head == h && casHead(h, n == null ? q : n)) {
                            h.forgetNext();
                            break;
                        }                 // advance and retry
                        if ((h = head)   == null ||
                            (q = h.next) == null || !q.isMatched())
                            break;        // unless slack < 2
                    }
                    LockSupport.unpark(p.waiter);
                    return LinkedTransferQueue.<E>cast(item);
                }
            }
            Node n = p.next;
            p = (p != n) ? n : (h = head); // Use head if p offlist
        }
        if (how != NOW) {                 // No matches available
            if (s == null)
                s = new Node(e, haveData);
            Node pred = tryAppend(s, haveData);
            if (pred == null)
                continue retry;           // lost race vs opposite mode
            if (how != ASYNC)
                return awaitMatch(s, pred, e, (how == TIMED), nanos);
        }
        return e; // not waiting
    }
}

```



# take 方法讲解










# 小结

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
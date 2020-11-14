---
layout: post
title:  锁专题（12）高并发进阶 Exchanger 双方栅栏源码深度解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, concurrency, sf]
published: true
---

# Exchanger

## 简介

有时我们须要对元素进行配对和交换线程的同步点，使用 exchange 方法返回其伙伴的对象，这时我们就须要使用线程类中的 Exchanger 类了，

简而言之，可以在不同线程间交换数据。

## 使用入门

废话少说，直接上代码。

### 定义执行类

```java
private static class ExchangeRunnable implements Runnable {
    private final Exchanger<String> exchanger;
    private final String data;

    private ExchangeRunnable(Exchanger<String> exchanger, String data) {
        this.exchanger = exchanger;
        this.data = data;
    }

    @Override
    public void run() {
        try {
            System.out.println(Thread.currentThread().getName() +" 正在把数据 "+ data + " 交换出去" );
            Thread.sleep((long) (Math.random()*1000));
            String data2 = exchanger.exchange(data);
            System.out.println(Thread.currentThread().getName() + " 交换数据到  "+ data2);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

我们定义一个 Runnable 类，会将传入的 data 已经交换，并打印获取到的数据。


### 测试

```java
public static void main(String[] args) {
    ExecutorService executor = Executors.newCachedThreadPool();
    final Exchanger<String> exchanger = new Exchanger<>();
    executor.execute(new ExchangeRunnable(exchanger, "one"));
    executor.execute(new ExchangeRunnable(exchanger, "two"));
    executor.shutdown();
}
```

我们使用线程池执行数据交换测试，日志如下：

```
pool-1-thread-1 正在把数据 one 交换出去
pool-1-thread-2 正在把数据 two 交换出去
pool-1-thread-1 交换数据到  two
pool-1-thread-2 交换数据到  one
```

可以看到两个线程的数据已经发生了交换。

这么神奇，到底是如何实现的呢？

感兴趣的小伙伴可以一起来阅读以下源码。

# 源码解析

## 类定义

```java
/**
 * @since 1.5
 * @author Doug Lea and Bill Scherer and Michael Scott
 * @param <V> The type of objects that may be exchanged
 */
public class Exchanger<V> {
}
```

这个类是在 jdk1.5 引入的。

## 算法笔记

ps: 这里是作者的算法笔记，不出现在 doc 中，主要是便于大家理解。内容较多，可以跳过。阅读完源码后，结合起来看。

概述：对于交换“槽(slot)”，核心算法是一个参与者和一个项目（呼叫者）：

```
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

这是“双重数据结构”（dual data structure）的最简单形式之一-参见Scott和Scherer的DISC 04论文和

http://www.cs.rochester.edu/research/synchronization/pseudocode/duals.html


原则上，这很好。

但是实际上，就像许多集中于单个位置的原子更新的算法一样，当使用同一个Exchanger的参与者多于几个时，它会可怕地扩展。

因此，该实现改为使用消除域的形式，该域通过安排某些线程通常使用不同的插槽来扩展此争用，同时仍确保最终任何两个参与方都能够交换项目。

也就是说，我们**不能完全在线程之间进行分区，而是给线程提供竞技场索引，这些索引在争用情况下平均会增长，在缺乏争用的情况下会缩小**。

我们通过将我们仍然需要的节点定义为ThreadLocals来实现这一点，并在其中包括每个线程的索引和相关的簿记状态。

（我们可以安全地重用每个线程的节点，而不必每次都重新创建它们，因为插槽在指向节点与空节点之间交替出现，因此不会遇到ABA问题。但是，在每次使用之间重置它们时，我们确实需要谨慎。）



实施有效的竞技场需要分配一堆空间，因此我们仅在检测到争用时这样做（单处理器除外，在单处理器上它们将无济于事，因此不会使用）。

否则，交换使用单槽slotExchange方法。

在争用时，插槽不仅必须位于不同的位置，而且由于位于同一高速缓存行（或更常见的是，相同的一致性单元），这些位置也不能遇到内存争用。

因为在撰写本文时，尚无法确定高速缓存行的大小，所以我们定义了一个足以满足通用平台的值。

此外，在其他地方也要格外小心，以避免其他错误/意外共享并增强位置，包括向节点添加填充（通过sun.misc.Contended），将“ bound”作为Exchanger字段嵌入，以及重新处理比较的某些 park/unpark 机制 到LockSupport版本。


竞技场（arena）仅以一个已使用的插槽开始。 

我们通过跟踪碰撞来扩大有效竞技场的规模； 即尝试交换时失败了。

根据上述算法的性质，唯一能够可靠地表明竞争的冲突是两种尝试的释放发生冲突时-两种尝试的提议中的一种可以合法地导致CAS失败，而没有其他多个线程指示争用。

（注意：有可能但不值得通过在CAS故障后读取插槽值来更精确地检测竞争。）

当线程在当前竞技场边界内的每个插槽处发生冲突时，它将尝试将竞技场大小扩大一倍。

我们通过在“bound”字段上使用版本（序列）编号来跟踪边界内的冲突，并在参与者注意到边界已更新（沿任一方向）时保守地重置冲突计数。



通过在一段时间后放弃等待并在到期时尝试减小竞技场的大小，可以减小有效竞技场的大小（当有多个插槽时）。

“一会儿”的值是一个经验问题。

我们通过附带使用 `spin-> yield-> block` 来实现，这对于获得合理的等待性能是必不可少的-在繁忙的交换器中，offers 通常几乎立即发布，在这种情况下，在多处理器上进行上下文切换非常缓慢/浪费。

Arena 等待，只是省略了阻塞部分，用于替代取消了。

根据经验，将自旋计数选择为一个值，该值可避免在一系列测试机上以最大持续汇率兑换99％的时间。

自旋和产量需要一定程度的随机性（使用廉价的xorshift），以避免可能导致无效的生长/收缩周期的规则模式。

（使用伪随机还可以通过使分支不可预测来帮助调整旋转周期的持续时间。）

另外，在要约期间，服务员可以“知道”在插槽更改后将被释放，但是直到设置了匹配项之后才能进行。

同时，它不能取消要约(cancel the offer)，用来替代 spins/yields。

注意：可以通过将线性化点更改为match字段的CAS（如Scott＆Scherer DISC论文中的一种情况）来避免这种二次检查，这也会增加异步性，但代价是更差冲突检测以及无法始终重用每个线程节点。

因此，当前方案通常是更好的折衷方案。



发生碰撞时，索引会以相反的顺序循环遍历竞技场，并在范围更改时以最大索引（趋向于最稀疏）重新开始。

（在到期时，索引减半直到达到0。）

可以（并已尝试）使用随机，素值步进或双哈希样式遍历，而不是简单的循环遍历，以减少聚集。

但是从经验上讲，这些好处可能无法克服其增加的开销：

除非存在持续的争用，否则我们将对发生的操作进行快速管理，因此，较简单/较快的控制策略比较准确但较慢的控制策略更有效。



因为我们将到期时间用于竞技场大小控制，所以在竞技场大小缩小到零（或者未启用竞技场）之前，我们无法在定时版本的公共交换方法中引发TimeoutExceptions。

这可能会延迟对超时的响应，但仍在规范范围内。


本质上，所有实现都在slotExchange和arenaExchange方法中。

它们具有相似的总体结构，但是在太多细节上无法组合。

slotExchange方法使用单个Exchanger字段“slot”，而不是竞技场数组元素。

但是，它仍然需要最少的碰撞检测来触发竞技场的建设。

（最混乱的部分是确保在两种方法都可能被调用时在过渡期间正确显示中断状态和InterruptedExceptions。这是通过将null返回作为哨兵来重新检查中断状态来完成的。）




在这种代码中太普遍了，方法是单块的，因为大多数逻辑依赖于字段的读取，这些字段作为局部变量维护，因此无法很好地进行分解-主要是在这里，笨重的 `spin-> yield-> block/cancel` 代码），并且在很大程度上依赖于内在函数（不安全）来使用内联嵌入式CAS和相关的内存访问操作（当动态编译器隐藏在其他方法后面时，动态编译器通常不会内联它们，因为它们可以更好地命名和封装该方法）预期的效果）。

这包括使用putOrderedX来清除两次使用之间每个线程节点的字段。

请注意，即使通过释放线程读取Node.item字段，也不会将其声明为volatile，因为它们仅在必须进行访问的CAS操作之后才声明为volatile，并且其他线程可以接受地接受拥有线程的所有使用。 

（由于原子性的实际点是插槽CASes，所以在发行版中对Node.match的写入要弱于完全易失性写入，这也是合法的。但是，之所以不这样做，是因为它可能允许进一步推迟写入，延迟进度。）



## 平平无奇的内部变量

我们一起来看几个平平无奇的内部变量：

```java
/**
 * 竞技场（arena）上任何两个使用的插槽之间的字节距离（作为移位值）。 
 * 
 * 1 << ASHIFT应该至少是缓存行大小。
 * @author 老马啸西风
 */
private static final int ASHIFT = 7;

/**
 * 支持的最大竞技场索引。 可分配的最大竞技场大小为MMASK + 1。
 * 必须是2的幂乘以1，小于（1 <<（31-ASHIFT））。
 * 上限255（0xff）足以满足主要算法的预期缩放比例限制。
 */
private static final int MMASK = 0xff;

/**
 * 绑定字段的序列/版本位的单位。
 * 每次成功更改边界也会添加SEQ。
 */
private static final int SEQ = MMASK + 1;

/**
** CPU的数量，用于大小调整和自旋控制
*/
private static final int NCPU = Runtime.getRuntime().availableProcessors();
/**
 * 竞技场的最大插槽索引：
 * 原则上可以容纳所有线程而没有争用或最多为最大可索引值的插槽数。
 */
static final int FULL = (NCPU >= (MMASK << 1)) ? MMASK : NCPU >>> 1;

/**
 * 等待比赛时旋转的界限。
 * 由于随机化，实际的实际迭代次数平均约为该值的两倍。 注意：当NCPU == 1时，禁用旋转。
 */
private static final int SPINS = 1 << 10;

/**
 * 表示空参数/从公共方法返回的值。
 * 因为API最初不允许使用null参数，所以需要它。
 */
private static final Object NULL_ITEM = new Object();

/**
 * 内部交换方法在超时时返回的前哨值，以避免需要这些方法的单独定时版本。
 */
private static final Object TIMED_OUT = new Object();
```

这几个变量在 LinkedTransferQueue 也有类似的。

## Node 节点相关

```java
/**
 * 节点保存部分交换的数据，以及其他每个线程的簿记（bookkeeping）。
 */
@sun.misc.Contended static final class Node {
    //竞技场索引
    int index;          
    // Exchanger.bound的最后记录值    
    int bound;              
    //当前限制下的CAS失败次数
    int collides;           
    //伪随机旋转
    int hash;               
    //该线程的当前元素
    Object item;            
    //释放线程提供的元素
    volatile Object match;
    //停放时设置为此线程，否则为null
    volatile Thread parked; 
}

/** 对应线程本地类 
** 这里定义的 ThreadLocal 类，用于避免并发争用。
*/
static final class Participant extends ThreadLocal<Node> {
    public Node initialValue() { return new Node(); }
}
```

## @sun.misc.Contended

这个注解是干什么的？

这个主要是用来避免**伪共享**的。 

这里先简单的解释一下。

### 伪共享

伪共享，高速缓存与内存之间是以缓存行为单位交换数据的，根据局部性原理，相邻地址空间的数据会被加载到高速缓存的同一个数据块上（缓存行），而数组是连续的（逻辑，涉及到虚拟内存）内存地址空间，因此，多个slot会被加载到同一个缓存行上，当一个slot改变时，会导致这个slot所在的缓存行上所有的数据（包括其他的slot）无效，需要从内存重新加载，影响性能。

所以，为了避免这种情况，需要填充数据，使得有效的slot不被加载到同一个缓存行上。

填充的大小即为1 << 7，如下图所示

![填充](https://images.gitee.com/uploads/images/2020/1107/162330_93fec805_508704.png)

### collides CAS 操作

collides，当前bound下CAS失败的次数，最大为m，m（bound & MMASK）为当前bound下最大有效索引，从右往左遍历，等到collides == m时，有效索引的槽位也已经遍历完了，这时需要增长槽位，增长的方式是重置bound（依赖SEQ更新其版本，高位；+1，低位），同时collides重置

![collides](https://images.gitee.com/uploads/images/2020/1107/162552_8321eabc_508704.png)







### 几个重要的变量

```java
/**
 * 每个线程状态
 */
private final Participant participant;

/**
 * 消除阵列； null，直到启用（在slotExchange内）。
 * 元素访问使用易失性get和CAS的仿真。
 */
private volatile Node[] arena;

/**
 * 在检测到争用之前一直使用插槽。
 */
private volatile Node slot;

/**
 * 每次更新时，将最大有效竞技场位置的索引与高位SEQ号进行“或”运算。
 * 从0到SEQ的初始更新用于确保舞台阵列仅被构造一次。
 */
private volatile int bound;
```

你看这个 bound 平平无奇，实际上还是有写东西需要大家理解一下。

bound，记录最大有效的arena索引，动态变化，竞争激烈时（槽位全满）增加， 槽位空旷时减小。

bound + SEQ +/- 1，其高位+ 1（SEQ,oxff + 1）确定其版本唯一性（比如，+1后，又-1，实际上是两个版本的bound，collides要重置的，而且从右向左遍历的索引也要更新，一般来讲，左边槽位比右边槽位竞争激烈，所以要从右向左找，为的是快速找到一个空位置，并尝试占领它，当bound加一又减一后，遍历索引右侧的槽位应该就空出来了，因为大家都往左边靠拢，所以要更新到最右侧，如果没有bound的版本唯一性，便没有索引更新，就一直往左遍历竞争激烈的槽位，还会误判，本来bound应该缩减的，反而又使其增加，于是会很影响效率的。），低位+/-1实际有效的索引（&MMASK）

对应的 CAS 操作如下图：

![bound](https://images.gitee.com/uploads/images/2020/1107/162656_30b38568_508704.png)

## 构造器

我们想使用 Exchanger 类，肯定要创建他。

如何创建呢？

```java
public Exchanger() {
    participant = new Participant();
}
```

只有一个无参构造器。

Participant 是什么？

希望你还记得前面的内容，这个就是一个 ThreadLocal 的子类简单实现。

## 核心方法

Exchanger 类最核心的方法其实只有一个：

```java
public V exchange(V x) throws InterruptedException {
    Object v;
    Object item = (x == null) ? NULL_ITEM : x; // translate null args
    if ((arena != null ||
         (v = slotExchange(item, false, 0L)) == null) &&
        ((Thread.interrupted() || // disambiguates null return
          (v = arenaExchange(item, false, 0L)) == null)))
        throw new InterruptedException();
    return (v == NULL_ITEM) ? null : (V)v;
}
```

当然也有可以指定超时时间的方法：

```java
public V exchange(V x, long timeout, TimeUnit unit)
    throws InterruptedException, TimeoutException {
    Object v;
    Object item = (x == null) ? NULL_ITEM : x;
    long ns = unit.toNanos(timeout);
    if ((arena != null ||
         (v = slotExchange(item, true, ns)) == null) &&
        ((Thread.interrupted() ||
          (v = arenaExchange(item, true, ns)) == null)))
        throw new InterruptedException();
    if (v == TIMED_OUT)
        throw new TimeoutException();
    return (v == NULL_ITEM) ? null : (V)v;
}
```

这两个方法本身并不难理解。

因为所有的复杂度都被封装在了 slotExchange 和 arenaExchange 这两个方法中，也是本文的重点。

## Unsafe 机制

这些知道是通过 Unsafe 机制操作的即可，后面会用到。

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

## slotExchange 方法

最核心的只有 2 个方法，个人的理解就是 slot 进行交换，然后等待 arean 唤醒。

```java
/**
 * 在启用竞技场之前一直使用交换功能。 请参阅算法笔记。
 *
 * @param item 待交换的元素
 * @param timed 是否需要等待
 * @param ns 超时时间
 * @return 另一个线程的项目； 如果启用了竞技场或线程在完成之前被中断，则返回null；或者 或TIMED_OUT（如果超时和超时）
 * @author 老马啸西风
 */
private final Object slotExchange(Object item, boolean timed, long ns) {
    // 获取 threadlocal 中的节点
    Node p = participant.get();
    // 获取当前线程
    Thread t = Thread.currentThread();
    // 如果线程被中断，直接返回 null
    if (t.isInterrupted()) // preserve interrupt status so caller can recheck
        return null;


    for (Node q;;) {
        // q = slot 不为空
        if ((q = slot) != null) {
            // 通过 CAS 设置元素成功
            if (U.compareAndSwapObject(this, SLOT, q, null)) {

                // 当前线程待交换的元素
                Object v = q.item;
                // exchange 操作传递过来的 item 元素
                q.match = item;
                // q 阻塞的线程
                Thread w = q.parked;
                // 如果有，则进行唤醒
                if (w != null)
                    U.unpark(w);
                return v;
            }

            // 在竞争中创建竞技场，但继续直到 slot 为 null
            //bound 则是上次Exchanger.bound
            if (NCPU > 1 && bound == 0 &&
                U.compareAndSwapInt(this, BOUND, 0, SEQ))
                arena = new Node[(FULL + 2) << ASHIFT];
        }
        else if (arena != null)
            // 直接返回，进入arenaExchange逻辑处理
            return null; // caller must reroute to arenaExchange
        else {
            p.item = item;
            if (U.compareAndSwapObject(this, SLOT, null, p))
                break;
            p.item = null;
        }
    }

    
    // await release
    // 等待释放
    // 等待的方式就是：spin+yeild+block
    int h = p.hash;
    long end = timed ? System.nanoTime() + ns : 0L;
    int spins = (NCPU > 1) ? SPINS : 1;
    Object v;
    while ((v = p.match) == null) {
        // 自旋，直至spins不大于0
        if (spins > 0) {
            // 伪随机算法， 目的是等h小于0（随机的）
            h ^= h << 1; 
            h ^= h >>> 3; 
            h ^= h << 10;
            if (h == 0)
                h = SPINS | (int)t.getId();
            else if (h < 0 && (--spins & ((SPINS >>> 1) - 1)) == 0)
                // 等到h < 0, 而spins的低9位也为0（防止spins过大，CPU空转过久），让出CPU时间片，每一次等待有两次让出CPU的时机（SPINS >>> 1）
                Thread.yield();
        }
        else if (slot != p)
            // 重置自旋的数量，并重试
            spins = SPINS;

        // 如果线程没被中断，且arena还没被创建，并且没有超时    
        else if (!t.isInterrupted() && arena == null &&
                 (!timed || (ns = end - System.nanoTime()) > 0L)) {

            // 设置当前线程将阻塞在当前对象上
            U.putObject(t, BLOCKER, this);
            // 挂在此结点上的阻塞着的线程
            p.parked = t;
            if (slot == p)
                // 挂起当前线程在 Node 节点，等下一个使用该节点交换的线程唤醒
                U.park(false, ns);

            // 被唤醒后，清空 parked 信息    
            p.parked = null;
            // 清空对应的阻塞对象
            U.putObject(t, BLOCKER, null);
        }
        // 超时或其他（取消），给其他线程腾出slot
        else if (U.compareAndSwapObject(this, SLOT, p, null)) {
            v = timed && ns <= 0L && !t.isInterrupted() ? TIMED_OUT : null;
            break;
        }
    }

    // 重置归位
    U.putOrderedObject(p, MATCH, null);
    p.item = null;
    p.hash = h;
    return v;
}
```

### 流程梳理

为了便于大家理解，我们把流程梳理一遍：

1. 检查slot是否为空（null），不为空，说明已经有线程在此等待，尝试占领该槽位，如果占领成功，与等待线程交换数据，并唤醒等待线程，交易结束，返回。

2. 如果占领槽位失败，创建arena，但要继续【步骤1】尝试抢占slot，直至slot为空，或者抢占成功，交易结束返回。

3. 如果slot为空，则判断arena是否为空，如果arena不为空，返回null，重新路由到arenaExchange方法

4. 如果arena为空，说明当前线程是先到达的，尝试占有slot，如果成功，将slot标记为自己占用，跳出循环，继续【步骤5】，如果失败，则继续【步骤1】

5. 当前线程等待被释放，等待的顺序是先自旋（spin），不成功则让出CPU时间片（yield），最后还不行就阻塞（block），spin -> yield -> block

6. 如果超时（设置超时的话）或被中断，则退出循环。

7. 最后，重置数据，下次重用，返回结果，结束。

## arenaExchange 方法

```java
/**
 * 启用竞技场时交换功能。 请参阅上面算法说明。
 *
 * @param item 待交换的非 null 元素
 * @param timed 如果等待已计时，则为true
 * @param ns 如果定时，则为最大等待时间，否则为0L
 * @return 另一个线程的项目； 或null（如果被中断）； 或TIMED_OUT（如果超时和超时）
 */
private final Object arenaExchange(Object item, boolean timed, long ns) {
    // arena 这个变量是在 slotExchange 中初始化的。
    Node[] a = arena;
    // 获取当前线程的 Node 节点信息
    Node p = participant.get();
    for (int i = p.index;;) {                      // access slot at i
        int b, m, c; long j;                       // j is raw array offset

        // 从场地中选出偏移地址为(i << ASHIFT) + ABASE的内存值，也即真正可用的Node。这是一个 volatile 变量。
        Node q = (Node)U.getObjectVolatile(a, j = (i << ASHIFT) + ABASE);
        // 如果对象存在，且通过 CAS 设置成功。
        // 此槽位不为null, 说明已经有线程在这里等了，重新将其设置为null, CAS操作
        if (q != null && U.compareAndSwapObject(a, j, q, null)) {
            // 取出等待线程携带的数据
            Object v = q.item;                     // release
            // 将当前线程携带的数据交给等待线程
            q.match = item;
            // 可能存在的等待线程
            Thread w = q.parked;
            if (w != null)
                // 唤醒等待的线程
                U.unpark(w);

            // 返回结果， 交易成功
            return v;
        }

        // 有效交换位置，且槽位为空
        else if (i <= (m = (b = bound) & MMASK) && q == null) {
            // 将携带的数据卸下，等待别的线程来交易
            p.item = item;                         // offer

            // 通过 CAS 设置 slot 成功
            if (U.compareAndSwapObject(a, j, null, p)) {
                // 计算超时时间
                long end = (timed && m == 0) ? System.nanoTime() + ns : 0L;
                // 当前线程
                Thread t = Thread.currentThread(); // wait

                // 一直循环，直到有别的线程来交换，或超时，或中断
                for (int h = p.hash, spins = SPINS;;) {

                    // 检查是否有别的线程来交换数据
                    Object v = p.match;

                    // 有则返回
                    if (v != null) {

                        // match重置，等着下次使用
                        U.putOrderedObject(p, MATCH, null);

                        // 清空，下次接着使用
                        p.item = null;             // clear for next use
                        p.hash = h;

                        // 交换结束，返回成功。
                        return v;
                    }
                    else if (spins > 0) {
                        // 自旋，这个和 slotExchange 类似，是一个伪随机。
                        h ^= h << 1; 
                        h ^= h >>> 3; 
                        h ^= h << 10; // xorshift
                        if (h == 0)                // initialize hash
                            h = SPINS | (int)t.getId();

                        // SPINS >>> 1, 一半的概率    
                        else if (h < 0 &&          // approx 50% true
                                 (--spins & ((SPINS >>> 1) - 1)) == 0)
                             // 每一次等待，有 2 次可以让渡 cpu 的机会    
                            Thread.yield();        // two yields per wait
                    }

                    // 别的线程已经到来，正在准备数据，自旋等待
                    else if (U.getObjectVolatile(a, j) != p)
                        spins = SPINS;       // releaser hasn't set match yet
                    else if (!t.isInterrupted() && m == 0 &&
                             (!timed ||
                              (ns = end - System.nanoTime()) > 0L)) {


                        //ps: 其实下面的流程和 slotExchange 也差不多，就是等待被唤醒。
                        // 设置当前线程将阻塞在当前对象上          
                        U.putObject(t, BLOCKER, this); // emulate LockSupport
                        // 挂在此结点上的阻塞着的线程
                        p.parked = t;              // minimize window
                        if (U.getObjectVolatile(a, j) == p)
                            // 阻塞， 等着被唤醒或中断
                            U.park(false, ns);

                        // 被唤醒后，清空数据    
                        p.parked = null;
                        // 解除阻塞对象
                        U.putObject(t, BLOCKER, null);
                    }

                    else if (U.getObjectVolatile(a, j) == p &&
                             U.compareAndSwapObject(a, j, p, null)) {
                        // 尝试缩减
                        if (m != 0)                // try to shrink
                            // 更新bound, 高位递增，低位 -1
                            U.compareAndSwapInt(this, BOUND, b, b + SEQ - 1);

                        // 重置元素
                        p.item = null;
                        p.hash = h;

                        // 索引减半，为的是快速找到汇合点（最左侧）
                        i = p.index >>>= 1;        // descend

                        // 保留中断状态，以便调用者可以重新检查，Thread.interrupted() 会清除中断状态标记
                        if (Thread.interrupted())
                            return null;

                        // 超时    
                        if (timed && m == 0 && ns <= 0L)
                            return TIMED_OUT;

                        // 重新开始    
                        break;                     // expired; restart
                    }
                }
            }
            else
                // 重置
                p.item = null;                     // clear offer
        }
        else {
            // 别的线程更改了bound，重置collides为0, i的情况如下：当i != m, 或者m = 0时，i = m; 否则，i = m-1; 从右往左遍历
            if (p.bound != b) {                    // stale; reset
                p.bound = b;
                p.collides = 0;

                // index 左移
                i = (i != m || m == 0) ? m : m - 1;
            }
            else if ((c = p.collides) < m || m == FULL ||
                     !U.compareAndSwapInt(this, BOUND, b, b + SEQ + 1)) {
                p.collides = c + 1;
                // 更新bound, 高位递增，低位 +1
                i = (i == 0) ? m : i - 1;          // cyclically traverse
            }
            else
                // 槽位增长
                i = m + 1;                         // grow
            p.index = i;
        }
    }
}
```


### 流程梳理

为了便于大家理解，流程梳理如下：

1. 从场地中选出偏移地址为(i << ASHIFT) + ABASE的内存值，也即第i个真正可用的Node，判断其槽位是否为空，为空，进入【步骤2】；不为空，说明有线程在此等待，尝试抢占该槽位，抢占成功，交换数据，并唤醒等待线程，返回，结束；没有抢占成功，进入【步骤9】

2. 检查索引（i vs m）是否越界，越界，进入【步骤9】；没有越界，进入下一步。

3. 尝试占有该槽位，抢占失败，进入【步骤1】；抢占成功，进入下一步。

4. 检查match，是否有线程来交换数据，如果有，交换数据，结束；如果没有，进入下一步。

5. 检查spin是否大于0，如果不大于0，进入下一步；如果大于0，检查hash是否小于0，并且spin减半或为0，如果不是，进入【步骤4】；如果是，让出CPU时间，过一会儿，进入【步骤4】

6. 检查是否中断，m达到最小值，是否超时，如果没有中断，没有超时，并且m达到最小值，阻塞，过一会儿进入【步骤4】；否则，下一步。

7. 没有线程来交换数据，尝试丢弃原有的槽位重新开始，丢弃失败，进入【步骤4】；否则，下一步。

8. bound减1（m>0），索引减半；检查是否中断或超时，如果没有，进入【步骤1】；否则，返回，结束。

9. 检查bound是否发生变化，如果变化了，重置collides，索引重置为m或左移，转向【步骤1】；否则，进入下一步。

10. 检查collides是否达到最大值，如果没有，进入【步骤13】，否则下一步。

11. m是否达到FULL，是，进入【步骤13】；否则，下一步。

12. CAS bound加1是否成功，如果成功，i置为m+1，槽位增长，进入【步骤1】；否则，下一步。

13. collides加1，索引左移，进入【步骤1】


流程图如下：

![流程图](https://images.gitee.com/uploads/images/2020/1107/164328_50c1f423_508704.png)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[Java8使用@sun.misc.Contended避免伪共享](https://www.jianshu.com/p/c3c108c3dcfd)

[【并发工具源码系列】 Exchanger 源码解析](https://blog.csdn.net/weixin_43934607/article/details/109088641)

[【JUC源码解析】Exchanger](https://blog.csdn.net/weixin_30299709/article/details/95088048)

[java线程中Exchanger使用](https://www.cnblogs.com/zhchoutai/p/6819451.html)

* any list
{:toc}
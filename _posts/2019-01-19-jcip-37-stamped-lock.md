---
layout: post
title:  JCIP-37-StampedLock 读写锁中的最强王者
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, lock-free, sh]
published: true
---

![思维导图](https://p1.pstatp.com/origin/pgc-image/2da5d1f23a394b8bafd88bd68f99fc44)

# StampedLock

## 简介

我们前面介绍了 [ReentrantReadWriteLock可重入读写锁详解](https://www.toutiao.com/item/6886467001011831300/)，不过 jdk1.8 引入了性能更好的 StampedLock 读写锁，我愿称之为最强！

一种基于能力的锁，具有三种模式用于控制读/写访问。 

StampedLock的状态由版本和模式组成。 

锁定采集方法返回一个表示和控制相对于锁定状态的访问的印记; 这些方法的“尝试”版本可能会返回特殊值为零以表示获取访问失败。 

锁定释放和转换方法要求stamps作为参数，如果它们与锁的状态不匹配则失败。 

### 三种模式

这三种模式是：

（1）write

方法writeLock()可能阻止等待独占访问，返回可以在方法unlockWrite(long)中使用的stamps来释放锁定。 

不定时的和定时版本tryWriteLock，还提供当锁保持写入模式时，不能获得读取锁定，并且所有乐观读取验证都将失败。

（2）read

方法readLock()可能阻止等待非独占访问，返回可用于方法unlockRead(long)释放锁的戳记。 

还提供不定时的和定时版本tryReadLock。

（3）乐观读 

方法tryOptimisticRead()只有当锁当前未保持在写入模式时才返回非零标记。 

方法validate(long)返回true，如果在获取给定的stamps时尚未在写入模式中获取锁定。

这种模式可以被认为是一个非常弱的版本的读锁，可以随时由 writer 打破。 

对简单的只读代码段使用乐观模式通常会减少争用并提高吞吐量。 

然而，其使用本质上是脆弱的。 乐观阅读部分只能读取字段并将其保存在局部变量中，以供后验证使用。 

以乐观模式读取的字段可能会非常不一致，因此只有在熟悉数据表示以检查一致性和/或重复调用方法validate()时，使用情况才适用。 

例如，当首次读取对象或数组引用，然后访问其字段，元素或方法之一时，通常需要这样的步骤。

### 核心思想

StampedLock实现了不仅多个读不互相阻塞，同时在**读操作时不会阻塞写操作**。

- 为什么StampedLock这么神奇？

能够达到这种效果，它的核心思想在于，**在读的时候如果发生了写，应该通过重试的方式来获取新的值，而不应该阻塞写操作。**

这种模式也就是典型的无锁编程思想，和CAS自旋的思想一样。

这种操作方式决定了StampedLock在读线程非常多而写线程非常少的场景下非常适用，同时还避免了写饥饿情况的发生。

![锁](https://p1.pstatp.com/origin/pgc-image/567c455acc0b460b9bbca550deedb6e9)

## 使用案例

```java
public class Point {

	private double x, y;
	
	private final StampedLock stampedLock = new StampedLock();
	
	//写锁的使用
	void move(double deltaX, double deltaY){
		long stamp = stampedLock.writeLock(); //获取写锁
		try {
			x += deltaX;
			y += deltaY;
		} finally {
			stampedLock.unlockWrite(stamp); //释放写锁
		}
	}
	
	//乐观读锁的使用
	double distanceFromOrigin() {
		
		long stamp = stampedLock.tryOptimisticRead(); //获得一个乐观读锁
		double currentX = x;
		double currentY = y;
		if (!stampedLock.validate(stamp)) { //检查乐观读锁后是否有其他写锁发生，有则返回false
			
			stamp = stampedLock.readLock(); //获取一个悲观读锁
			
			try {
				currentX = x;
			} finally {
				stampedLock.unlockRead(stamp); //释放悲观读锁
			}
		} 
		return Math.sqrt(currentX*currentX + currentY*currentY);
	}
	
	//悲观读锁以及读锁升级写锁的使用
	void moveIfAtOrigin(double newX,double newY) {
		
		long stamp = stampedLock.readLock(); //悲观读锁
		try {
			while (x == 0.0 && y == 0.0) {
				long ws = stampedLock.tryConvertToWriteLock(stamp); //读锁转换为写锁
				if (ws != 0L) { //转换成功
					
					stamp = ws; //票据更新
					x = newX;
					y = newY;
					break;
				} else {
					stampedLock.unlockRead(stamp); //转换失败释放读锁
					stamp = stampedLock.writeLock(); //强制获取写锁
				}
			}
		} finally {
			stampedLock.unlock(stamp); //释放所有锁
		}
	}
}
```

首先看看第一个方法move，可以看到它和ReentrantReadWriteLock写锁的使用基本一样，都是简单的获取释放，可以猜测这里也是一个独占锁的实现。

需要注意的是在获取写锁是会返回个只long类型的stamp，然后在释放写锁时会将stamp传入进去。

这个stamp是做什么用的呢？如果我们在中间改变了这个值又会发生什么呢？这里先暂时不做解释，后面分析源码时会解答这个问题。

第二个方法distanceFromOrigin就比较特别了，它调用了tryOptimisticRead，根据名字判断这是一个乐观读锁。首先什么是乐观锁？乐观锁的意思就是先假定在乐观锁获取期间，共享变量不会被改变，既然假定不会被改变，那就不需要上锁。在获取乐观读锁之后进行了一些操作，然后又调用了validate方法，这个方法就是用来验证tryOptimisticRead之后，是否有写操作执行过，如果有，则获取一个读锁，这里的读锁和ReentrantReadWriteLock中的读锁类似，猜测也是个共享锁。

第三个方法moveIfAtOrigin，它做了一个锁升级的操作，通过调用tryConvertToWriteLock尝试将读锁转换为写锁，转换成功后相当于获取了写锁，转换失败相当于有写锁被占用，这时通过调用writeLock来获取写锁进行操作。

看过了上面的三个方法，估计大家对怎么使用StampedLock有了一个初步的印象。

下面就通过对StampedLock源码的分析来一步步了解它背后是怎么解决锁饥饿问题的。

# 源码分析 

## 类定义

```java
/*
 * @since 1.8
 * @author Doug Lea
 */
public class StampedLock implements java.io.Serializable {}
```

这个锁也是李大狗实现的，让我们一起来学习下源码吧。

## 算法笔记

有一段很核心的算法，没有出现在文档中。

我们简单翻译如下：

该设计采用了序列锁的元素（在Linux内核中使用；请参阅Lameter的 http://www.lameter.com/gelato2005.pdf 和其他地方； 

请参阅Boehm的http://www.hpl.hp.com/techreports/2012/HPL-2012-68.html）和订购的RW锁（请参见Shirako等人的 http://dl.acm.org/citation.cfm?id=2312015）

从概念上讲，锁的主要状态包括一个序列号，该序列号在写锁定时是奇数，在其他情况下甚至是奇数。

但是，当读取锁定时，读取器计数将偏移非零值。

验证“乐观” seqlock-reader样式标记时，将忽略读取计数。

因为我们必须为读者使用少量的位数（目前为7），当阅读器的数量超过计数字段时，将使用补充阅读器溢出字。

为此，我们将最大读取器计数值（RBITS）视为保护溢出更新的自旋锁。

等待者使用在AbstractQueuedSynchronizer中使用的修改形式的CLH锁（有关完整帐户，请参阅其内部文档）， 其中每个节点都被标记（字段模式）为读取器或写入器。
 
等待读取器的集合在一个公共节点（field cowait）下分组（链接），因此相对于大多数CLH机制而言，它充当单个节点。
 
由于队列结构的原因，等待节点实际上不需要携带序列号。我们知道每一个都比其前任更大。
 
这将调度策略简化为一个主要的FIFO方案，该方案包含了阶段公平锁定的元素（请参阅Brandenburg＆Anderson，尤其是http://www.cs.unc.edu/~bbb/diss/）。
 
特别是，我们使用相公平的反驳规则：
 
如果在保持读取锁定的同时传入的读取器到达，但是有排队的写入器，则此传入的读取器处于排队状态。
 
（此规则负责方法acquireRead的某些复杂性，但是如果没有它，锁将变得非常不公平。）
 
方法释放本身不会（有时不能）本身唤醒等待者。
 
这是由主线程完成的，但是得到了其他任何线程的帮助，在方法acquireRead和acquireWrite中没有更好的事情要做。

这些规则适用于实际排队的线程。

不管偏好规则如何，所有tryLock形式都会尝试获取锁，因此可能会“插入”它们的方式。

获取方法中使用了随机旋转，以减少（越来越昂贵）上下文切换，同时还避免了许多线程之间持续的内存抖动。 

我们将旋转限制在队列的开头。

线程在阻塞之前最多等待SPINS次（每次迭代以50％的概率减少自旋计数）。

如果唤醒后它未能获得锁定，并且仍然是（或成为）第一个等待线程（指示其他一些线程被锁定并获得了锁定），它将升级自旋（最高可达MAX_HEAD_SPINS），目的是减少连续丢失到获取线程的可能性（reduce the likelihood of continually losing to barging threads.）。

几乎所有这些机制都是在方法acquireWrite和acquireRead中执行的，它们是此类代码的典型代表，因为动作和重试依赖于本地缓存的读取的一致集合，因此它们会蔓延开来。

如Boehm的论文（上文）所述，序列验证（主要是方法validate() ）要求的排序规则比适用于普通易失性读取（“状态”）的排序规则更严格。
 
为了在验证之前强制执行读取顺序以及在尚未强制执行验证的情况下强制执行验证本身，我们使用Unsafe.loadFence。

内存布局将锁定状态和队列指针保持在一起（通常在同一高速缓存行上）。这通常适用于大多数读负载。

在大多数其他情况下，自适应旋转CLH锁减少内存争用的自然趋势会降低进一步分散竞争位置的动力，但可能会在将来得到改进。

ps: 这里可以看出，这个设计实际上是取自序列锁的设计思想，linux 内核中也有使用。

> https://www.hpl.hp.com/techreports/2012/HPL-2012-68.pdf  论文地址

[Effective Synchronization on Linux/NUMA Systems](http://www.lameter.com/gelato2005.pdf)

ps: 这两本书我本人也翻译了一遍，但是内容过于枯燥（水平有限，翻译的枯燥），且内容较多，这里就不做展开了。

## 一些常量定义

```java
/** Number of processors, for spin control
计算机核数：用于旋转控制
 */
private static final int NCPU = Runtime.getRuntime().availableProcessors();

/** Maximum number of retries before enqueuing on acquisition 
	入队前最大重试次数
*/
private static final int SPINS = (NCPU > 1) ? 1 << 6 : 0;

/** Maximum number of retries before blocking at head on acquisition 
捕获前最大重试次数
*/
private static final int HEAD_SPINS = (NCPU > 1) ? 1 << 10 : 0;

/** Maximum number of retries before re-blocking 
重封锁前的最大重试次数
*/
private static final int MAX_HEAD_SPINS = (NCPU > 1) ? 1 << 16 : 0;

/** The period for yielding when waiting for overflow spinlock 
等待溢出自旋锁时的屈服时间
*/
private static final int OVERFLOW_YIELD_RATE = 7; // must be power 2 - 1
/** The number of bits to use for reader count before overflowing 
溢出前用于读取器计数的位数
*/
private static final int LG_READERS = 7;
```

## 读写锁共享的状态量

从上面的使用示例中我们看到，在 StampedLock 中，除了提供了类似ReentrantReadWriteLock读写锁的获取释放方法，还提供了一个乐观读锁的获取方式。

那么这三种方式是如何交互的呢？

根据AQS的经验，StampedLock中应该也是使用了一个状态量来标志锁的状态。

通过下面的源码可以证明这点：

```java
// 用于操作state后获取stamp的值
private static final int LG_READERS = 7;
private static final long RUNIT = 1L;               //0000 0000 0001
private static final long WBIT  = 1L << LG_READERS; //0000 1000 0000
private static final long RBITS = WBIT - 1L;        //0000 0111 1111
private static final long RFULL = RBITS - 1L;       //0000 0111 1110
private static final long ABITS = RBITS | WBIT;     //0000 1111 1111
private static final long SBITS = ~RBITS;           //1111 1000 0000

//初始化时state的值
private static final long ORIGIN = WBIT << 1;       //0001 0000 0000

//锁共享变量state
private transient volatile long state;
//读锁溢出时用来存储多出的毒素哦
private transient int readerOverflow;
```

上面的源码中除了定义state变量外，还提供了一系列变量用来操作state，用来表示读锁和写锁的各种状态。

为了方便理解，我将他们都表示成二进制的值，长度有限，这里用低12位来表示64的long，高位自动用0补齐。

要理解这些状态的作用，就需要具体分析三种锁操作方式是怎么通过state这一个变量来表示的，首先来看看获取写锁和释放写锁。

## 其他常量

```java
// Initial value for lock state; avoid failure value zero
// 锁定状态的初始值； 避免故障值为零
private static final long ORIGIN = WBIT << 1;

// Special value from cancelled acquire methods so caller can throw IE
// 取消get方法中的特殊值，以便调用方可以抛出中断异常
private static final long INTERRUPTED = 1L;

// Values for node status; order matters
// 节点状态的值； 顺序很重要
private static final int WAITING   = -1;
private static final int CANCELLED =  1;

// Modes for nodes (int not boolean to allow arithmetic)
// 节点的模式（不为布尔值以允许算术计算）
private static final int RMODE = 0;
private static final int WMODE = 1;
```

## 等待节点定义

这里的节点定义，应该是为了后面双向链表使用。

所有的值都是通过 volatile 保证易变性，和线程间的可变性。

mode 使用 final 修饰，一旦创建就是不可变的，所以是线程安全的。

```java
/** Wait nodes */
static final class WNode {
    volatile WNode prev;
    volatile WNode next;
    volatile WNode cowait;    // list of linked readers
    volatile Thread thread;   // non-null while possibly parked
    volatile int status;      // 0, WAITING, or CANCELLED
    final int mode;           // RMODE or WMODE
    WNode(int m, WNode p) { mode = m; prev = p; }
}

/** Head of CLH queue */
private transient volatile WNode whead;
/** Tail (last) of CLH queue */
private transient volatile WNode wtail;
```

# 视图

这里还引入了视图的概念，不晓得和我们数据库中常见的视图有没有关联。

```java
// views
transient ReadLockView readLockView;
transient WriteLockView writeLockView;
transient ReadWriteLockView readWriteLockView;
```

## ReadLockView 定义

这个是对 Lock 接口的简单实现。

视图中调用的方法，我们后面会介绍。

```java
final class ReadLockView implements Lock {
    public void lock() { readLock(); }
    public void lockInterruptibly() throws InterruptedException {
        readLockInterruptibly();
    }
    public boolean tryLock() { return tryReadLock() != 0L; }
    public boolean tryLock(long time, TimeUnit unit)
        throws InterruptedException {
        return tryReadLock(time, unit) != 0L;
    }
    public void unlock() { unstampedUnlockRead(); }
    public Condition newCondition() {
        throw new UnsupportedOperationException();
    }
}
```

## 写锁视图

也是对于 Lock 接口的实现，对应的实现都是写锁。

```java
final class WriteLockView implements Lock {
    public void lock() { writeLock(); }
    public void lockInterruptibly() throws InterruptedException {
        writeLockInterruptibly();
    }
    public boolean tryLock() { return tryWriteLock() != 0L; }
    public boolean tryLock(long time, TimeUnit unit)
        throws InterruptedException {
        return tryWriteLock(time, unit) != 0L;
    }
    public void unlock() { unstampedUnlockWrite(); }
    public Condition newCondition() {
        throw new UnsupportedOperationException();
    }
}
```

## 读写锁视图

```java
final class ReadWriteLockView implements ReadWriteLock {
    public Lock readLock() { return asReadLock(); }
    public Lock writeLock() { return asWriteLock(); }
}
```

这里主要是转换返回读写锁实现。

### 读锁实现

有读锁视图就直接返回，没有就创建一个实例。

```java
public Lock asReadLock() {
    ReadLockView v;
    return ((v = readLockView) != null ? v :
            (readLockView = new ReadLockView()));
}
```

### 写锁实现

类似的返回写锁视图。

```java
public Lock asWriteLock() {
    WriteLockView v;
    return ((v = writeLockView) != null ? v :
            (writeLockView = new WriteLockView()));
}
```

# 三种锁的获取和释放

后续的内容，已经有人整理的非常好了，我这里直接放在文中，便于大家学习。

> [Java并发（8）- 读写锁中的性能之王：StampedLock](https://juejin.im/post/5bacf523f265da0a951ee418)

## 写锁的释放和获取

### 源码

```java
public StampedLock() {
    state = ORIGIN; //初始化state为 0001 0000 0000
}

public long writeLock() {
    long s, next; 
    return ((((s = state) & ABITS) == 0L && //没有读写锁
                U.compareAndSwapLong(this, STATE, s, next = s + WBIT)) ? //cas操作尝试获取写锁
            next : acquireWrite(false, 0L));    //获取成功后返回next，失败则进行后续处理，排队也在后续处理中
}

public void unlockWrite(long stamp) {
    WNode h;
    if (state != stamp || (stamp & WBIT) == 0L) //stamp值被修改，或者写锁已经被释放，抛出错误
        throw new IllegalMonitorStateException();
    state = (stamp += WBIT) == 0L ? ORIGIN : stamp; //加0000 1000 0000来记录写锁的变化，同时改变写锁状态
    if ((h = whead) != null && h.status != 0)
        release(h);
}
```

这里先说明两点结论：读锁通过前7位来表示，每获取一个读锁，则加1。

写锁通过除前7位后剩下的位来表示，每获取一次写锁，则加1000 0000，这两点在后面的源码中都可以得到证明。

初始化时将state变量设置为0001 0000 0000。

写锁获取通过((s = state) & ABITS)操作等于0时默认没有读锁和写锁。

### 写锁获取的情况

写锁获取分三种情况：

（1）没有读锁和写锁时，state为0001 0000 0000

```
0001 0000 0000 & 0000 1111 1111 = 0000 0000 0000 // 等于0L，可以尝试获取写锁
```

（2）有一个读锁时，state为0001 0000 0001

```
0001 0000 0001 & 0000 1111 1111 = 0000 0000 0001 // 不等于0L
```

（3）有一个写锁，state为0001 1000 0000

```
0001 1000 0000 & 0000 1111 1111 = 0000 1000 0000 // 不等于0L
```

获取到写锁，需要将s + WBIT设置到state，也就是说每次获取写锁，都需要加0000 1000 0000。

同时返回s + WBIT的值

```
0001 0000 0000 + 0000 1000 0000 = 0001 1000 0000
```

### 写锁释放

释放写锁首先判断stamp的值有没有被修改过或者多次释放，之后通过state = (stamp += WBIT) == 0L ? ORIGIN : stamp来释放写锁，位操作表示如下：
stamp += WBIT

```
0010 0000 0000 = 0001 1000 0000 + 0000 1000 0000
```

这一步操作是重点！！！

写锁的释放并不是像ReentrantReadWriteLock一样+1然后-1，而是通过再次加0000 1000 0000来使高位每次都产生变化，为什么要这样做？

直接减掉0000 1000 0000不就可以了吗？

这就是为了后面乐观锁做铺垫，让每次写锁都留下痕迹。

大家可以想象这样一个场景，字母A变化为B能看到变化，如果在一段时间内从A变到B然后又变到A，在内存中自会显示A，而不能记录变化的过程，这也就是CAS中的ABA问题。

在StampedLock中就是通过每次对高位加0000 1000 0000来达到记录写锁操作的过程，可以通过下面的步骤理解：

第一次获取写锁：

```
0001 0000 0000 + 0000 1000 0000 = 0001 1000 0000
```

第一次释放写锁：

```
0001 1000 0000 + 0000 1000 0000 = 0010 0000 0000
```

第二次获取写锁：

```
0010 0000 0000 + 0000 1000 0000 = 0010 1000 0000
```

第二次释放写锁：

```
0010 1000 0000 + 0000 1000 0000 = 0011 0000 0000
```

第n次获取写锁：

```
1110 0000 0000 + 0000 1000 0000 = 1110 1000 0000
```

第n次释放写锁：

```
1110 1000 0000 + 0000 1000 0000 = 1111 0000 0000
```

可以看到第8位在获取和释放写锁时会产生变化，也就是说第8位是用来表示写锁状态的，前7位是用来表示读锁状态的，8位之后是用来表示写锁的获取次数的。这样就有效的解决了ABA问题，留下了每次写锁的记录，也为后面乐观锁检查变化提供了基础。

关于acquireWrite方法这里不做具体分析，方法非常复杂，感兴趣的同学可以网上搜索相关资料。

这里只对该方法做下简单总结，该方法**分两步来进行线程排队，首先通过随机探测的方式多次自旋尝试获取锁，然后自旋一定次数失败后再初始化节点进行插入。**

## 悲观读锁的释放和获取

### 源码

```java
public long readLock() {
    long s = state, next;  
    return ((whead == wtail && (s & ABITS) < RFULL && //队列为空，无写锁，同时读锁未溢出，尝试获取读锁
                U.compareAndSwapLong(this, STATE, s, next = s + RUNIT)) ?   //cas尝试获取读锁+1
            next : acquireRead(false, 0L));     //获取读锁成功，返回s + RUNIT，失败进入后续处理，类似acquireWrite
}

public void unlockRead(long stamp) {
    long s, m; WNode h;
    for (;;) {
        if (((s = state) & SBITS) != (stamp & SBITS) ||
            (stamp & ABITS) == 0L || (m = s & ABITS) == 0L || m == WBIT)
            throw new IllegalMonitorStateException();
        if (m < RFULL) {    //小于最大记录值（最大记录值127超过后放在readerOverflow变量中）
            if (U.compareAndSwapLong(this, STATE, s, s - RUNIT)) {  //cas尝试释放读锁-1
                if (m == RUNIT && (h = whead) != null && h.status != 0)
                    release(h);
                break;
            }
        }
        else if (tryDecReaderOverflow(s) != 0L) //readerOverflow - 1
            break;
    }
}
```

悲观读锁的获取和ReentrantReadWriteLock类似，不同在于StampedLock的读锁很容易溢出，最大只有127，超过后通过一个额外的变量readerOverflow来存储，这是为了给写锁留下更大的空间，因为写锁是在不停增加的。

### 锁获取

悲观读锁获取分下面四种情况：

没有读锁和写锁时，state为0001 0000 0000

```
// 小于 0000 0111 1110，可以尝试获取读锁
0001 0000 0000 & 0000 1111 1111 = 0000 0000 0000
```

有一个读锁时，state为0001 0000 0001

```
// 小于 0000 0111 1110，可以尝试获取读锁
0001 0000 0001 & 0000 1111 1111 = 0000 0000 0001
```

有一个写锁，state为0001 1000 0000

```
// 大于 0000 0111 1110，不可以获取读锁
0001 1000 0000 & 0000 1111 1111 = 0000 1000 0000
```

读锁溢出，state为0001 0111 1110

```
// 等于 0000 0111 1110，不可以获取读锁
0001 0111 1110 & 0000 1111 1111 = 0000 0111 1110
```

### 锁释放

读锁的释放过程在没有溢出的情况下是通过s - RUNIT操作也就是-1来释放的，当溢出后则将readerOverflow变量-1。

## 乐观读锁的获取和验证

乐观读锁因为实际上没有获取过锁，所以也就没有释放锁的过程，只是在操作后通过验证检查和获取前的变化。

### 源码

源码如下：

```java
//尝试获取乐观锁
public long tryOptimisticRead() {
    long s;
    return (((s = state) & WBIT) == 0L) ? (s & SBITS) : 0L;
}

//验证乐观锁获取之后是否有过写操作
public boolean validate(long stamp) {
    //该方法之前的所有load操作在内存屏障之前完成，对应的还有storeFence()及fullFence()
    U.loadFence();  
    return (stamp & SBITS) == (state & SBITS);  //比较是否有过写操作
}
```

乐观锁基本原理就时获取锁时记录state的写状态，然后在操作完成之后检查写状态是否有变化，因为写状态每次都会在高位留下记录，这样就避免了写锁获取又释放后得不到准确数据。

### 锁获取

获取写锁记录有三种情况：

（1）没有读锁和写锁时，state为0001 0000 0000

```
//((s = state) & WBIT) == 0L) true
0001 0000 0000 & 0000 1000 0000 = 0000 0000 0000
//(s & SBITS)
0001 0000 0000 & 1111 1000 0000 = 0001 0000 0000
```

（2）有一个读锁时，state为0001 0000 0001

```
//((s = state) & WBIT) == 0L) true
0001 0000 0001 & 0000 1000 0000 = 0000 0000 0000
//(s & SBITS)
0001 0000 0001 & 1111 1000 0000 = 0001 0000 0000
```

（3）有一个写锁，state为0001 1000 0000

```
//((s = state) & WBIT) == 0L) false
0001 1000 0000 & 0000 1000 0000 = 0000 1000 0000
//0L
0000 0000 0000
```

### 验证是否有写操作


验证过程中是否有过写操作，分四种情况


（1）写过一次

```
0001 0000 0000 & 1111 1000 0000 = 0001 0000 0000
0010 0000 0000 & 1111 1000 0000 = 0010 0000 0000   //false
```

（2）未写过，但读过

```
0001 0000 0000 & 1111 1000 0000 = 0001 0000 0000
0001 0000 1111 & 1111 1000 0000 = 0001 0000 0000   //true
```

（3）正在写

```
0001 0000 0000 & 1111 1000 0000 = 0001 0000 0000
0001 1000 0000 & 1111 1000 0000 = 0001 1000 0000   //false
```

（4）之前正在写，无论是否写完都不会为0L

```
0000 0000 0000 & 1111 1000 0000 = 0000 0000 0000   //false
```

# 小结

我们纵观整个并发锁的发展史，实际上一种思想的发展史

（1）[synchronized 最常用的悲观锁](https://www.toutiao.com/item/6884966680137728526/)，使用方便，但是为非公平锁。

（2）[ReentrantLock 可重入锁](https://www.toutiao.com/i6886091002042384908/)，提供了公平锁等丰富特性。

（3）[ReentrantReadWriteLock 可重入读写锁](https://www.toutiao.com/i6886467001011831300/) 支持读写分离，在读多的场景中表现优异。

（4）本文的读不阻塞写，是一种更加优异的思想。类似思想的实现还有 CopyOnWriteList 等。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马写作的最大动力！

# 参考资料

[Java并发（8）- 读写锁中的性能之王：StampedLock](https://juejin.im/post/5bacf523f265da0a951ee418)

[stampedlocks](https://blog.overops.com/java-8-stampedlocks-vs-readwritelocks-and-synchronized/)

* any list
{:toc}
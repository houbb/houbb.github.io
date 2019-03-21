---
layout: post
title:  JCIP-37-StampedLock 读写锁中的性能之王  
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [java, concurrency, lock, lock-free, sh]
published: true
---

# StampedLock

StampedLock实现了不仅多个读不互相阻塞，同时在读操作时不会阻塞写操作。

- 为什么StampedLock这么神奇？

能够达到这种效果，它的核心思想在于，在读的时候如果发生了写，应该通过重试的方式来获取新的值，而不应该阻塞写操作。

这种模式也就是典型的无锁编程思想，和CAS自旋的思想一样。

这种操作方式决定了StampedLock在读线程非常多而写线程非常少的场景下非常适用，同时还避免了写饥饿情况的发生。

# 使用案例

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

首先看看第一个方法move，可以看到它和ReentrantReadWriteLock写锁的使用基本一样，都是简单的获取释放，可以猜测这里也是一个独占锁的实现。需要注意的是在获取写锁是会返回个只long类型的stamp，然后在释放写锁时会将stamp传入进去。这个stamp是做什么用的呢？如果我们在中间改变了这个值又会发生什么呢？这里先暂时不做解释，后面分析源码时会解答这个问题。

第二个方法distanceFromOrigin就比较特别了，它调用了tryOptimisticRead，根据名字判断这是一个乐观读锁。首先什么是乐观锁？乐观锁的意思就是先假定在乐观锁获取期间，共享变量不会被改变，既然假定不会被改变，那就不需要上锁。在获取乐观读锁之后进行了一些操作，然后又调用了validate方法，这个方法就是用来验证tryOptimisticRead之后，是否有写操作执行过，如果有，则获取一个读锁，这里的读锁和ReentrantReadWriteLock中的读锁类似，猜测也是个共享锁。

第三个方法moveIfAtOrigin，它做了一个锁升级的操作，通过调用tryConvertToWriteLock尝试将读锁转换为写锁，转换成功后相当于获取了写锁，转换失败相当于有写锁被占用，这时通过调用writeLock来获取写锁进行操作。

看过了上面的三个方法，估计大家对怎么使用StampedLock有了一个初步的印象。下面就通过对StampedLock源码的分析来一步步了解它背后是怎么解决锁饥饿问题的。


# 源码分析 

## 读写锁共享的状态量

从上面的使用示例中我们看到，在StampedLock中，除了提供了类似ReentrantReadWriteLock读写锁的获取释放方法，还提供了一个乐观读锁的获取方式。

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

## 写锁的释放和获取

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

写锁通过除前7位后剩下的位来表示，每获取一次写锁，则加1000 0000，这两点在后面的源码中都可以得倒证明。

初始化时将state变量设置为0001 0000 0000。写锁获取通过((s = state) & ABITS)操作等于0时默认没有读锁和写锁。写

锁获取分三种情况：

没有读锁和写锁时，state为0001 0000 0000
0001 0000 0000 & 0000 1111 1111 = 0000 0000 0000 // 等于0L，可以尝试获取写锁


有一个读锁时，state为0001 0000 0001
0001 0000 0001 & 0000 1111 1111 = 0000 0000 0001 // 不等于0L


有一个写锁，state为0001 1000 0000
0001 1000 0000 & 0000 1111 1111 = 0000 1000 0000 // 不等于0L


获取到写锁，需要将s + WBIT设置到state，也就是说每次获取写锁，都需要加0000 1000 0000。同时返回s + WBIT的值
0001 0000 0000 + 0000 1000 0000 = 0001 1000 0000
释放写锁首先判断stamp的值有没有被修改过或者多次释放，之后通过state = (stamp += WBIT) == 0L ? ORIGIN : stamp来释放写锁，位操作表示如下：
stamp += WBIT
0010 0000 0000 = 0001 1000 0000 + 0000 1000 0000
这一步操作是重点！！！写锁的释放并不是像ReentrantReadWriteLock一样+1然后-1，而是通过再次加0000 1000 0000来使高位每次都产生变化，为什么要这样做？直接减掉0000 1000 0000不就可以了吗？这就是为了后面乐观锁做铺垫，让每次写锁都留下痕迹。
大家可以想象这样一个场景，字母A变化为B能看到变化，如果在一段时间内从A变到B然后又变到A，在内存中自会显示A，而不能记录变化的过程，这也就是CAS中的ABA问题。在StampedLock中就是通过每次对高位加0000 1000 0000来达到记录写锁操作的过程，可以通过下面的步骤理解：

第一次获取写锁：
0001 0000 0000 + 0000 1000 0000 = 0001 1000 0000
第一次释放写锁：
0001 1000 0000 + 0000 1000 0000 = 0010 0000 0000
第二次获取写锁：
0010 0000 0000 + 0000 1000 0000 = 0010 1000 0000
第二次释放写锁：
0010 1000 0000 + 0000 1000 0000 = 0011 0000 0000
第n次获取写锁：
1110 0000 0000 + 0000 1000 0000 = 1110 1000 0000
第n次释放写锁：
1110 1000 0000 + 0000 1000 0000 = 1111 0000 0000

可以看到第8位在获取和释放写锁时会产生变化，也就是说第8位是用来表示写锁状态的，前7位是用来表示读锁状态的，8位之后是用来表示写锁的获取次数的。这样就有效的解决了ABA问题，留下了每次写锁的记录，也为后面乐观锁检查变化提供了基础。

关于acquireWrite方法这里不做具体分析，方法非常复杂，感兴趣的同学可以网上搜索相关资料。

这里只对该方法做下简单总结，该方法分两步来进行线程排队，首先通过随机探测的方式多次自旋尝试获取锁，然后自旋一定次数失败后再初始化节点进行插入。

## 悲观读锁的释放和获取

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

悲观读锁的获取和ReentrantReadWriteLock类似，不同在于StampedLock的读锁很容易溢出，最大只有127，超过后通过一个额外的变量readerOverflow来存储，这是为了给写锁留下更大的空间，因为写锁是在不停增加的。悲观读锁获取分下面四种情况：


没有读锁和写锁时，state为0001 0000 0000
// 小于 0000 0111 1110，可以尝试获取读锁
0001 0000 0000 & 0000 1111 1111 = 0000 0000 0000


有一个读锁时，state为0001 0000 0001
// 小于 0000 0111 1110，可以尝试获取读锁
0001 0000 0001 & 0000 1111 1111 = 0000 0000 0001


有一个写锁，state为0001 1000 0000
// 大于 0000 0111 1110，不可以获取读锁
0001 1000 0000 & 0000 1111 1111 = 0000 1000 0000


读锁溢出，state为0001 0111 1110
// 等于 0000 0111 1110，不可以获取读锁
0001 0111 1110 & 0000 1111 1111 = 0000 0111 1110
读锁的释放过程在没有溢出的情况下是通过s - RUNIT操作也就是-1来释放的，当溢出后则将readerOverflow变量-1。

## 乐观读锁的获取和验证

乐观读锁因为实际上没有获取过锁，所以也就没有释放锁的过程，只是在操作后通过验证检查和获取前的变化。

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

乐观锁基本原理就时获取锁时记录state的写状态，然后在操作完成之后检查写状态是否有变化，因为写状态每次都会在高位留下记录，这样就避免了写锁获取又释放后得不到准确数据。获取写锁记录有三种情况：


没有读锁和写锁时，state为0001 0000 0000
//((s = state) & WBIT) == 0L) true
0001 0000 0000 & 0000 1000 0000 = 0000 0000 0000
//(s & SBITS)
0001 0000 0000 & 1111 1000 0000 = 0001 0000 0000


有一个读锁时，state为0001 0000 0001
//((s = state) & WBIT) == 0L) true
0001 0000 0001 & 0000 1000 0000 = 0000 0000 0000
//(s & SBITS)
0001 0000 0001 & 1111 1000 0000 = 0001 0000 0000


有一个写锁，state为0001 1000 0000
//((s = state) & WBIT) == 0L) false
0001 1000 0000 & 0000 1000 0000 = 0000 1000 0000
//0L
0000 0000 0000


验证过程中是否有过写操作，分四种情况


写过一次
0001 0000 0000 & 1111 1000 0000 = 0001 0000 0000
0010 0000 0000 & 1111 1000 0000 = 0010 0000 0000   //false


未写过，但读过
0001 0000 0000 & 1111 1000 0000 = 0001 0000 0000
0001 0000 1111 & 1111 1000 0000 = 0001 0000 0000   //true


正在写
0001 0000 0000 & 1111 1000 0000 = 0001 0000 0000
0001 1000 0000 & 1111 1000 0000 = 0001 1000 0000   //false


之前正在写，无论是否写完都不会为0L
0000 0000 0000 & 1111 1000 0000 = 0000 0000 0000   //false

# 参考资料

[Java并发（8）- 读写锁中的性能之王：StampedLock](https://juejin.im/post/5bacf523f265da0a951ee418)

[stampedlocks](https://blog.overops.com/java-8-stampedlocks-vs-readwritelocks-and-synchronized/)

* any list
{:toc}
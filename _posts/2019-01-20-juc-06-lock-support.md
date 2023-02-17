---
layout: post
title: JUC-06-LockSupport
date:  2019-1-20 14:10:12 +0800
categories: [Concurrency]
tags: [thread, concurrency, juc, sh]
published: true
---

# LockSupport

在Java多线程中，当需要阻塞或者唤醒一个线程时，都会使用LockSupport工具类来完成相应的工作。

LockSupport定义了一组公共静态方法，这些方法提供了最基本的线程阻塞和唤醒功能，而LockSupport也因此成为了构建同步组件的基础工具。


## 方法

LockSupport定义了一组以park开头的方法用来阻塞当前线程，以及unpark(Thread)方法来唤醒一个被阻塞的线程，这些方法描述如下：

| 方法名称 | 描  述 | 
|:---|:---|
| park()                    | 阻塞当前线程，如果掉用unpark(Thread)方法或被中断，才能从park()返回 | 
| parkNanos(long nanos)     | 阻塞当前线程，超时返回，阻塞时间最长不超过nanos纳秒 | 
| parkUntil(long deadline)  | 阻塞当前线程，直到deadline时间点 | 
| unpark(Thread)            | 唤醒处于阻塞状态的线程 |

在Java 6中，LockSupport增加了park(Object blocker)、parkNanos(Object blocker, long nanos)、parkUntil(Object blocker, long deadline)这3个方法，用于实现阻塞当前线程的功能，其中参数blocker是用来标识当前线程在等待的对象，该对象主要用于问题排查和系统监控。

## 使用案例

下面的示例中，将对比parkNanos(long nanos)和parkNanos(Object blocker, long nanos)方法来展示阻塞对象blocker的用处。

- 采用parkNanos(long nanos)阻塞线程：

```java
public class LockSupportTest {
	public static void main(String[] args) {
		LockSupport.parkNanos(TimeUnit.SECONDS.toNanos(20));
	}
}
```

- 采用parkNanos(Object blocker, long nanos)阻塞线程：

```java
public class LockSupportTest {
	public static void main(String[] args) {
		LockSupport.parkNanos(new Object(), TimeUnit.SECONDS.toNanos(20));
	}
}
```

这两段代码都是 阻塞当前线程20秒，从上面的dump结果可以看出，有阻塞对象的parkNanos方法能够传递给开发人员更多的现场信息。

这是由于在Java 5之前，当线程使用synchronized关键字阻塞在一个对象上时，通过线程dump能够看到该线程的阻塞对象，而Java 5推出的Lock等并发工具却遗漏了这一点，致使在线程dump时无法提供阻塞对象的信息。

因此，在Java 6中，LockSupport新增了上述3个含有阻塞对象的方法，用以替代原有的park方法。

通过源码可以发现，LockSupport的park和unpark方法都是通过sun.misc.Unsafe类的park和unpark方法实现的，那下面我们对sun.misc.Unsafe类的源码进行进一步解析。

> 详情见 [Unsafe](https://houbb.github.io/2019/01/20/juc-05-unsafe)


## 操作对象

归根结底，LockSupport调用的Unsafe中的native代码： 

```java
public native void unpark(Thread jthread); 
public native void park(boolean isAbsolute, long time); 
```

两个函数声明清楚地说明了操作对象：park函数是将当前Thread阻塞，而unpark函数则是将另一个Thread唤醒。

与Object类的wait/notify机制相比，park/unpark有两个优点：

1. 以thread为操作对象更符合阻塞线程的直观定义；

2. 操作更精准，可以准确地唤醒某一个线程（notify随机唤醒一个线程，notifyAll唤醒所有等待的线程），增加了灵活性。

## 关于许可

在上面的文字中，我使用了阻塞和唤醒，是为了和wait/notify做对比。

其实park/unpark的设计原理核心是“许可”。park是等待一个许可。unpark是为某线程提供一个许可。如果某线程A调用park，那么除非另外一个线程调用unpark(A)给A一个许可，否则线程A将阻塞在park操作上。

有一点比较难理解的，是unpark操作可以再park操作之前。也就是说，先提供许可。

**当某线程调用park时，已经有许可了，它就消费这个许可，然后可以继续运行。这其实是必须的。**

考虑最简单的生产者(Producer)消费者(Consumer)模型：Consumer需要消费一个资源，于是调用park操作等待；Producer则生产资源，然后调用unpark给予Consumer使用的许可。非常有可能的一种情况是，Producer先生产，这时候Consumer可能还没有构造好（比如线程还没启动，或者还没切换到该线程）。那么等Consumer准备好要消费时，显然这时候资源已经生产好了，可以直接用，那么park操作当然可以直接运行下去。

如果没有这个语义，那将非常难以操作。


## Semaphore 对比 

这个类的作用有点类似于Semaphore，通过许可证(permit)来联系使用它的线程。

如果许可证可用，调用park方法会立即返回并在这个过程中消费这个许可，不然线程会阻塞。

调用unpark会使许可证可用。(和Semaphores有些许区别,许可证不会累加，最多只有一张）

因为有了许可证，所以调用park和unpark的先后关系就不重要了，这里可以对比一下Object的wait和notify,如果先调用同一个对象的notify再wait，那么调用wait的线程依旧会被阻塞，依赖方法的调用顺序。

# Lock 与 LockSupport

主要的区别应该说是它们面向的对象不同。

阻塞和唤醒是对于线程来说的，LockSupport的park/unpark更符合这个语义，以“线程”作为方法的参数，语义更清晰，使用起来也更方便。

而wait/notify的实现使得“线程”的阻塞/唤醒对线程本身来说是被动的，要准确的控制哪个线程、什么时候阻塞/唤醒很困难，要不随机唤醒一个线程（notify）要不唤醒所有的（notifyAll）。

JDK1.8后，ReentrantLock及ReentrantReadWriteLock是基于AQS实现的，AQS内部使用了unsafe类进行操作；LockSupport也是基于unsafe类操作。

可以说LockSupport也是阻塞的，但是不会发生 `Thread.suspend()` 和 `Thread.resume()` 所可能引发的死锁问题。

## LockSupport 的优势

我们可以使用它来阻塞和唤醒线程,功能和wait,notify有些相似,但是LockSupport比起wait,notify功能更强大，也好用的多。


## wait() and notify() 

- 代码

```java
public class WaitNotifyTest {
    private static Object obj = new Object();
    public static void main(String[] args) {
        new Thread(new WaitThread()).start();
        new Thread(new NotifyThread()).start();
    }
    static class WaitThread implements Runnable {
        @Override
        public void run() {
            synchronized (obj) {
                System.out.println("start wait!");
                try {
                    obj.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("end wait!");
            }
        }
    }
    static class NotifyThread implements Runnable {
        @Override
        public void run() {
            synchronized (obj) {
                System.out.println("start notify!");
                obj.notify();
                System.out.println("end notify");
            }
        }
    }
}
```

- 日志信息

```
start wait!
start notify!
end notify
end wait!
```

使用wait，notify来实现等待唤醒功能至少有两个缺点：

1. 由上面的例子可知,wait和notify都是Object中的方法,在调用这两个方法前必须先获得锁对象，这限制了其使用场合:只能在同步代码块中。

2. 另一个缺点可能上面的例子不太明显，当对象的等待队列中有多个线程时，notify只能随机选择一个线程唤醒，无法唤醒指定的线程。

而使用LockSupport的话，我们可以在任何场合使线程阻塞，同时也可以指定要唤醒的线程，相当的方便。

## 使用 LockSupport

```java
public class LockSupportTest {

    public static void main(String[] args) {
        Thread parkThread = new Thread(new ParkThread());
        parkThread.start();
        System.out.println("开始线程唤醒");
        LockSupport.unpark(parkThread);
        System.out.println("结束线程唤醒");

    }

    static class ParkThread implements Runnable{

        @Override
        public void run() {
            System.out.println("开始线程阻塞");
            LockSupport.park();
            System.out.println("结束线程阻塞");
        }
    }
}
```

LockSupport.park();可以用来阻塞当前线程,park是停车的意思，把运行的线程比作行驶的车辆，线程阻塞则相当于汽车停车，相当直观。

该方法还有个变体LockSupport.park(Object blocker),指定线程阻塞的对象blocker，该对象主要用来排查问题。

方法LockSupport.unpark(Thread thread)用来唤醒线程，因为需要线程作参数，所以可以指定线程进行唤醒。

- 日志信息

```
开始线程唤醒
开始线程阻塞
结束线程唤醒
结束线程阻塞
```

## 优势

总结一下，LockSupport比Object的wait/notify有两大优势： 

1. LockSupport不需要在同步代码块里。所以线程间也不需要维护一个共享的同步对象了，实现了线程间的解耦。 

2. unpark函数可以先于park调用，所以不需要担心线程间的执行的先后顺序。

# 其他场景

## 可以先唤醒线程再阻塞线程

在阻塞线程前睡眠1秒中，使唤醒动作先于阻塞发生，看看会发生什么

```java
public class LockSupportTest {

    public static void main(String[] args) {
        Thread parkThread = new Thread(new ParkThread());
        parkThread.start();
        System.out.println("开始线程唤醒");
        LockSupport.unpark(parkThread);
        System.out.println("结束线程唤醒");

    }

    static class ParkThread implements Runnable{

        @Override
        public void run() {
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("开始线程阻塞");
            LockSupport.park();
            System.out.println("结束线程阻塞");
        }
    }
}
```

- 日志信息

```
开始线程唤醒
结束线程唤醒
开始线程阻塞
结束线程阻塞
```

先唤醒指定线程,然后阻塞该线程，但是线程并没有真正被阻塞而是正常执行完后退出了。

这是怎么回事？

## 先唤醒线程两次再阻塞两次会发生什么

我们试着在改动下代码,先唤醒线程两次，在阻塞线程两次，看看会发生什么。

- 代码

```java
public class LockSupportTest {

    public static void main(String[] args) {
        Thread parkThread = new Thread(new ParkThread());
        parkThread.start();
        for(int i=0;i<2;i++){
            System.out.println("开始线程唤醒");
            LockSupport.unpark(parkThread);
            System.out.println("结束线程唤醒");
        }
    }

    static class ParkThread implements Runnable{

        @Override
        public void run() {
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            for(int i=0;i<2;i++){
                System.out.println("开始线程阻塞");
                LockSupport.park();
                System.out.println("结束线程阻塞");
            }
        }
    }
}
```

可以看到线程被阻塞导致程序一直无法结束掉。

对比上面的例子，我们可以得出一个匪夷所思的结论，先唤醒线程，在阻塞线程，线程不会真的阻塞；但是先唤醒线程两次再阻塞两次时就会导致线程真的阻塞。

那么这到底是为什么？

- 个人理解

unpark() 是上面说到的许可，park() 第一次时被使用之后其实就消失了。

再次 park() 就会阻塞线程。

LockSupport是不可重入的，如果一个线程连续2次调用LockSupport.park()，那么该线程一定会一直阻塞下去。

# 源码

LockSupport 这个类基本就是对Unsafe中park，unpark方法的包装，LockSupport不可以实例化。

```java
public class LockSupport {

    //Cannot be instantiated.
    private LockSupport() {} 

    //替换Thread中parkBlocker属性的值为arg
    private static void setBlocker(Thread t, Object arg) {
        UNSAFE.putObject(t, parkBlockerOffset, arg);
    }

    
    //唤醒thread线程
    public static void unpark(Thread thread) {
        if (thread != null)
            UNSAFE.unpark(thread);
    }

    //堵塞线程，堵塞前把当前线程属性名是parkBlocker的变量替换成blocker
    //返回后值为null
    public static void park(Object blocker) {
        Thread t = Thread.currentThread();
        setBlocker(t, blocker);
        UNSAFE.park(false, 0L);
        setBlocker(t, null);
    }

    //和park(Object blocker)类似，增加了堵塞的纳秒数，都是相对时间
    public static void parkNanos(Object blocker, long nanos) {
        if (nanos > 0) {
            Thread t = Thread.currentThread();
            setBlocker(t, blocker);
            UNSAFE.park(false, nanos);
            setBlocker(t, null);
        }
    }

    //绝对时间堵塞
    public static void parkUntil(Object blocker, long deadline) {
        Thread t = Thread.currentThread();
        setBlocker(t, blocker);
        UNSAFE.park(true, deadline);
        setBlocker(t, null);
    }

    //获取堵塞的时候设置的对象，parkBlockerOffset 是Thread 中属性值是parkBlocker的偏移量（地址）
    public static Object getBlocker(Thread t) {
        if (t == null)
            throw new NullPointerException();
        return UNSAFE.getObjectVolatile(t, parkBlockerOffset);
    }

    //直接堵塞，
    public static void park() {
        UNSAFE.park(false, 0L);
    }

    //堵塞，相对时间
    public static void parkNanos(long nanos) {
        if (nanos > 0)
            UNSAFE.park(false, nanos);
    }

    //堵塞 绝对时间
    public static void parkUntil(long deadline) {
        UNSAFE.park(true, deadline);
    }

    //根据当前线程中属性名是threadLocalRandomSecondarySeed的变量生成随机数
    static final int nextSecondarySeed() {
        int r;
        Thread t = Thread.currentThread();
        if ((r = UNSAFE.getInt(t, SECONDARY)) != 0) {
            r ^= r << 13;   // xorshift
            r ^= r >>> 17;
            r ^= r << 5;
        }
        else if ((r = java.util.concurrent.ThreadLocalRandom.current().nextInt()) == 0)
            r = 1; // avoid zero
        UNSAFE.putInt(t, SECONDARY, r);
        return r;
    }

    //以下属性是根据Unsafe中的objectFieldOffset方法获取Thread属性的偏移量(地址)
    private static final sun.misc.Unsafe UNSAFE;
    private static final long parkBlockerOffset;
    private static final long SEED;
    private static final long PROBE;
    private static final long SECONDARY;
    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            Class<?> tk = Thread.class;
            
            parkBlockerOffset = UNSAFE.objectFieldOffset(tk.getDeclaredField("parkBlocker"));
                
            SEED = UNSAFE.objectFieldOffset(tk.getDeclaredField("threadLocalRandomSeed"));
                
            PROBE = UNSAFE.objectFieldOffset(tk.getDeclaredField("threadLocalRandomProbe"));
                
            SECONDARY = UNSAFE.objectFieldOffset (tk.getDeclaredField("threadLocalRandomSecondarySeed"));
               
        } catch (Exception ex) { throw new Error(ex); }
    }

}
```


# 应用

看一个Java docs中的示例用法：一个先进先出非重入锁类的框架

```java
class FIFOMutex {
    private final AtomicBoolean locked = new AtomicBoolean(false);
    private final Queue<Thread> waiters = new ConcurrentLinkedQueue<Thread>();
 
    public void lock() {
      boolean wasInterrupted = false;
      Thread current = Thread.currentThread();
      waiters.add(current);
 
      // Block while not first in queue or cannot acquire lock
      while (waiters.peek() != current ||
             !locked.compareAndSet(false, true)) {
        LockSupport.park(this);
        if (Thread.interrupted()) // ignore interrupts while waiting
          wasInterrupted = true;
      }
 
      waiters.remove();
      if (wasInterrupted)          // reassert interrupt status on exit
        current.interrupt();
    }
 
    public void unlock() {
      locked.set(false);
      LockSupport.unpark(waiters.peek());
    }
  }
}
```

# 底层

park 方法

`UNSAFE.park(false, 0L);` 是个native方法，接口如下：

```java
public native void park(boolean isAbsolute, long time);
```

park这个方法会阻塞当前线程，只有以下四种情况中的一种发生时，该方法才会返回。

与park对应的unpark执行或已经执行时。注意：已经执行是指unpark先执行，然后再执行的park。
线程被中断时。

如果参数中的time不是零，等待了指定的毫秒数时。

发生异常现象时。这些异常事先无法确定。

我们继续看一下JVM是如何实现park方法的，park在不同的操作系统使用不同的方式实现，在linux下是使用的是系统方法pthread_cond_wait实现。

实现代码在JVM源码路径 `src/os/linux/vm/os_linux.cp`p里的 `os::PlatformEvent::park` 方法，代码如下：
 
```java
void os::PlatformEvent::park() {
	     int v ;
    for (;;) {
	v = _Event ;
    if (Atomic::cmpxchg (v-1, &_Event, v) == v) break ;
    }
    guarantee (v >= 0, "invariant") ;
    if (v == 0) {
    // Do this the hard way by blocking ...
    int status = pthread_mutex_lock(_mutex);
    assert_status(status == 0, status, "mutex_lock");
    guarantee (_nParked == 0, "invariant") ;
    ++ _nParked ;
    while (_Event < 0) {
    status = pthread_cond_wait(_cond, _mutex);
    // for some reason, under 2.7 lwp_cond_wait() may return ETIME ...
    // Treat this the same as if the wait was interrupted
    if (status == ETIME) { status = EINTR; }
    assert_status(status == 0 || status == EINTR, status, "cond_wait");
    }
    -- _nParked ;
    // In theory we could move the ST of 0 into _Event past the unlock(),
    // but then we'd need a MEMBAR after the ST.
    _Event = 0 ;
    status = pthread_mutex_unlock(_mutex);
    assert_status(status == 0, status, "mutex_unlock");
    }
    guarantee (_Event >= 0, "invariant") ;
    }
}
```

pthread_cond_wait是一个多线程的条件变量函数，cond是condition的缩写，字面意思可以理解为线程在等待一个条件发生，这个条件是一个全局变量。这个方法接收两个参数，一个共享变量_cond，一个互斥量_mutex。而unpark方法在linux下是使用pthread_cond_signal实现的。

park 在windows下则是使用WaitForSingleObject实现的。

## 队列满

当队列满时，生产者往阻塞队列里插入一个元素，生产者线程会进入WAITING (parking)状态。我们可以使用jstack dump阻塞的生产者线程看到这点：

```
"main" prio=5 tid=0x00007fc83c000000 nid=0x10164e000 waiting on condition [0x000000010164d000]
   java.lang.Thread.State: WAITING (parking)
        at sun.misc.Unsafe.park(Native Method)
        - parking to wait for  <0x0000000140559fe8> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
        at java.util.concurrent.locks.LockSupport.park(LockSupport.java:186)
        at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2043)
        at java.util.concurrent.ArrayBlockingQueue.put(ArrayBlockingQueue.java:324)
        at blockingqueue.ArrayBlockingQueueTest.main(ArrayBlockingQueueTest.java:11)
```


# 总结

LockSupport是JDK中用来实现线程阻塞和唤醒的工具。

使用它可以在任何场合使线程阻塞，可以指定任何线程进行唤醒，并且不用担心阻塞和唤醒操作的顺序，但要注意连续多次唤醒的效果和一次唤醒是一样的。

JDK并发包下的锁和其他同步工具的底层实现中大量使用了LockSupport进行线程的阻塞和唤醒，掌握它的用法和原理可以让我们更好的理解锁和其它同步工具的底层实现。

# 拓展阅读

[Unsafe](https://houbb.github.io/2019/01/20/juc-05-unsafe)

# 参考资料

[Java并发编程之LockSupport、Unsafe详解](https://blog.csdn.net/qq_38293564/article/details/80512758)

[LockSupport](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/concurrent/locks/LockSupport.html)

[Java中Lock和LockSupport的区别到底是什么？](https://www.zhihu.com/question/26471972)

[关于LockSupport](https://www.cnblogs.com/zhizhizhiyuan/p/4966827.html)

[阻塞和唤醒线程——LockSupport功能简介及原理浅析](http://www.cnblogs.com/takumicx/p/9328459.html)

[LockSupport原理剖析](https://blog.csdn.net/lldouble/article/details/80938644)

https://yq.aliyun.com/articles/493552

https://www.cnblogs.com/fairjm/p/locksuport.html

* any list
{:toc}
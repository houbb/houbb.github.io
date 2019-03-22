---
layout: post
title: JUC-06-LockSupport
date:  2019-1-20 14:10:12 +0800
categories: [Concurrency]
tags: [java, concurrency, juc, sh]
published: true
---

# LockSupport

在Java多线程中，当需要阻塞或者唤醒一个线程时，都会使用LockSupport工具类来完成相应的工作。LockSupport定义了一组公共静态方法，这些方法提供了最基本的线程阻塞和唤醒功能，而LockSupport也因此成为了构建同步组件的基础工具。




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

当某线程调用park时，已经有许可了，它就消费这个许可，然后可以继续运行。这其实是必须的。

考虑最简单的生产者(Producer)消费者(Consumer)模型：Consumer需要消费一个资源，于是调用park操作等待；Producer则生产资源，然后调用unpark给予Consumer使用的许可。非常有可能的一种情况是，Producer先生产，这时候Consumer可能还没有构造好（比如线程还没启动，或者还没切换到该线程）。那么等Consumer准备好要消费时，显然这时候资源已经生产好了，可以直接用，那么park操作当然可以直接运行下去。

如果没有这个语义，那将非常难以操作。

## 其它细节 

理解了以上两点，我觉得应该把握了关键，其它细节就不是那么关键，也容易理解了，不作分析。


# Lock 与 LockSupport

主要的区别应该说是它们面向的对象不同。阻塞和唤醒是对于线程来说的，LockSupport的park/unpark更符合这个语义，以“线程”作为方法的参数，语义更清晰，使用起来也更方便。而wait/notify的实现使得“线程”的阻塞/唤醒对线程本身来说是被动的，要准确的控制哪个线程、什么时候阻塞/唤醒很困难，要不随机唤醒一个线程（notify）要不唤醒所有的（notifyAll）。先把API粘贴上来，该类据我所知为Lock()实现提供了基本操作，比如ReentrantLock的lock就是利用了LockSupport的相关方法来使线程阻塞或者唤醒的。

JDK1.8后，ReentrantLock及ReentrantReadWriteLock是基于AQS实现的，AQS内部使用了unsafe类进行操作；LockSupport也是基于unsafe类操作。

可以说LockSupport也是阻塞的，但是不会发生Thread.suspend 和 Thread.resume所可能引发的死锁问题。

而AQS是非阻塞机制。

## LockSupport.park()和unpark()，与object.wait()和notify()的区别？   

主要的区别应该说是它们面向的对象不同。

阻塞和唤醒是对于线程来说的，LockSupport的park/unpark更符合这个语义，以“线程”作为方法的参数，语义更清晰，使用起来也更方便。

而wait/notify的实现使得“阻塞/唤醒对线程本身来说是被动的，要准确的控制哪个线程、什么时候阻塞/唤醒很困难，要不随机唤醒一个线程（notify）要不唤醒所有的（notifyAll）。

前几篇分析过wait和notify方法，这两个方法是用来在两个线程之间进行通信的（生产者消费者模型的基本实现）。

```java
public class Test {
    public static void main(String[] args) throws Exception {
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("starting");
 
                LockSupport.park(this);
 
                System.out.println("oh,I am alive");
 
            }
        });
        thread.start();
        Thread.sleep(3000);
        System.out.println("main over");
        LockSupport.unpark(thread);
    }
}
```

- 执行结果

```
starting
main over
oh,I am alive
```

## 优势

总结一下，LockSupport比Object的wait/notify有两大优势： 

1. LockSupport不需要在同步代码块里。所以线程间也不需要维护一个共享的同步对象了，实现了线程间的解耦。 

2. unpark函数可以先于park调用，所以不需要担心线程间的执行的先后顺序。

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

# 拓展阅读

[Unsafe](https://houbb.github.io/2019/01/20/juc-05-unsafe)

# 参考资料

[Java并发编程之LockSupport、Unsafe详解](https://blog.csdn.net/qq_38293564/article/details/80512758)

[LockSupport](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/concurrent/locks/LockSupport.html)

[Java中Lock和LockSupport的区别到底是什么？](https://www.zhihu.com/question/26471972)

[关于LockSupport](https://www.cnblogs.com/zhizhizhiyuan/p/4966827.html)

* any list
{:toc}
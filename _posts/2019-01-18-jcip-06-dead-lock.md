---
layout: post
title: Dead Lock
date:  2018-10-10 15:26:09 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, sh]
published: false
excerpt: Java 并发之 Executor 框架
---

# Java 死锁

## 死锁条件

死锁是这样一种情形：多个线程同时被阻塞，它们中的一个或者全部都在等待某个资源被释放。由于线程被无限期地阻塞，因此程序不可能正常终止。

java 死锁产生的四个必要条件：

- 1、互斥使用，即当资源被一个线程使用(占有)时，别的线程不能使用

- 2、不可抢占，资源请求者不能强制从资源占有者手中夺取资源，资源只能由资源占有者主动释放。

- 3、请求和保持，即当资源请求者在请求其他的资源的同时保持对原有资源的占有。

- 4、循环等待，即存在一个等待队列：P1占有P2的资源，P2占有P3的资源，P3占有P1的资源。这样就形成了一个等待环路。

当上述四个条件都成立的时候，便形成死锁。当然，死锁的情况下如果打破上述任何一个条件，便可让死锁消失。下面用java代码来模拟一下死锁的产生。

## 死锁案例

因此我们举个例子来描述，如果此时有一个线程A，按照先锁a再获得锁b的的顺序获得锁，而在此同时又有另外一个线程B，按照先锁b再锁a的顺序获得锁。

- DeadLock.java

创建类，演示方法如下：

```java
public static void main(String[] args) {
    final Object a = new Object();
    final Object b = new Object();
    Thread threadA = new Thread(new Runnable() {
        @Override
        public void run() {
            synchronized (a) {
                try {
                    System.out.println("now i in threadA-locka");
                    Thread.sleep(1000L);
                    synchronized (b) {
                        System.out.println("now i in threadA-lockb");
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
        }
    });

    Thread threadB = new Thread(new Runnable() {
        @Override
        public void run() {
            synchronized (b) {
                try {
                    System.out.println("now i in threadB-lockb");
                    Thread.sleep(1000L);
                    synchronized (a) {
                        System.out.println("now i in threadB-locka");
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
        }
    });
    threadA.start();
    threadB.start();
}
```

日志信息：

```
now i in threadA-locka
now i in threadB-lockb
```

## 死锁分析


### 1. jps 

jps获得当前Java虚拟机进程的pid

```
$ jps
1926 RemoteMavenServer
1912 
1981 Launcher
2045 Jps
1982 DeadLock
```

`1982 DeadLock` 

### 2. jstack 打印堆栈

jstack打印内容的最后其实已经报告发现了一个死锁，但因为我们是分析死锁产生的原因，而不是直接得到这里有一个死锁的结论，所以别管它，就看前面的部分

```
$ jstack 1982
2018-10-10 16:29:28
Full thread dump Java HotSpot(TM) 64-Bit Server VM (25.91-b14 mixed mode):

"Attach Listener" #13 daemon prio=9 os_prio=31 tid=0x00007f9446019000 nid=0x1007 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"DestroyJavaVM" #12 prio=5 os_prio=31 tid=0x00007f944900d000 nid=0x1903 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"Thread-1" #11 prio=5 os_prio=31 tid=0x00007f944900c000 nid=0x5803 waiting for monitor entry [0x0000700009ddc000]
   java.lang.Thread.State: BLOCKED (on object monitor)
	at com.github.houbb.thread.learn.jcip.deadLock.demo.DeadLock$2.run(DeadLock.java:47)
	- waiting to lock <0x000000076abb0128> (a java.lang.Object)
	- locked <0x000000076abb0138> (a java.lang.Object)
	at java.lang.Thread.run(Thread.java:745)

"Thread-0" #10 prio=5 os_prio=31 tid=0x00007f944981d800 nid=0x5603 waiting for monitor entry [0x0000700009cd9000]
   java.lang.Thread.State: BLOCKED (on object monitor)
	at com.github.houbb.thread.learn.jcip.deadLock.demo.DeadLock$1.run(DeadLock.java:30)
	- waiting to lock <0x000000076abb0138> (a java.lang.Object)
	- locked <0x000000076abb0128> (a java.lang.Object)
	at java.lang.Thread.run(Thread.java:745)

...

"Finalizer" #3 daemon prio=8 os_prio=31 tid=0x00007f9448035800 nid=0x3503 in Object.wait() [0x00007000094c1000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x000000076ab08ee0> (a java.lang.ref.ReferenceQueue$Lock)
	at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:143)
	- locked <0x000000076ab08ee0> (a java.lang.ref.ReferenceQueue$Lock)
	at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:164)
	at java.lang.ref.Finalizer$FinalizerThread.run(Finalizer.java:209)

"Reference Handler" #2 daemon prio=10 os_prio=31 tid=0x00007f9448033000 nid=0x3403 in Object.wait() [0x00007000093be000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x000000076ab06b50> (a java.lang.ref.Reference$Lock)
	at java.lang.Object.wait(Object.java:502)
	at java.lang.ref.Reference.tryHandlePending(Reference.java:191)
	- locked <0x000000076ab06b50> (a java.lang.ref.Reference$Lock)
	at java.lang.ref.Reference$ReferenceHandler.run(Reference.java:153)

"VM Thread" os_prio=31 tid=0x00007f944802e800 nid=0x3203 runnable 

...

Found one Java-level deadlock:
=============================
"Thread-1":
  waiting to lock monitor 0x00007f944600b2b8 (object 0x000000076abb0128, a java.lang.Object),
  which is held by "Thread-0"
"Thread-0":
  waiting to lock monitor 0x00007f944600dbf8 (object 0x000000076abb0138, a java.lang.Object),
  which is held by "Thread-1"

Java stack information for the threads listed above:
===================================================
"Thread-1":
	at com.github.houbb.thread.learn.jcip.deadLock.demo.DeadLock$2.run(DeadLock.java:47)
	- waiting to lock <0x000000076abb0128> (a java.lang.Object)
	- locked <0x000000076abb0138> (a java.lang.Object)
	at java.lang.Thread.run(Thread.java:745)
"Thread-0":
	at com.github.houbb.thread.learn.jcip.deadLock.demo.DeadLock$1.run(DeadLock.java:30)
	- waiting to lock <0x000000076abb0138> (a java.lang.Object)
	- locked <0x000000076abb0128> (a java.lang.Object)
	at java.lang.Thread.run(Thread.java:745)

Found 1 deadlock.
```

先说明介绍一下每一部分的意思，以"Thread-1"为例：

（1）"Thread-1"表示线程名称

（2）"prio=5"表示线程优先级

（3）"tid=0x00007f944900c000"表示线程Id

（4）nid=0x5803

线程对应的本地线程Id，这个重点说明下。

因为Java线程是依附于Java虚拟机中的本地线程来运行的，实际上是本地线程在执行Java线程代码，只有本地线程才是真正的线程实体。

Java代码中创建一个thread，虚拟机在运行期就会创建一个对应的本地线程，而这个本地线程才是真正的线程实体。

Linux环境下可以使用 `top -H -p JVM进程Id` 来查看JVM进程下的本地线程（也被称作LWP）信息，注意这个本地线程是用十进制表示的，nid是用16进制表示的，转换一下就好了，0x219c对应的本地线程Id应该是8604。

（5）`for monitor entry [0x0000700009ddc000]` 表示线程占用的内存地址

（6）"java.lang.Thread.State：BLOCKED"表示线程的状态

解释完了每一部分的意思，看下Thread-1处于BLOCKED状态，Thread-0处于BLOCKED状态。

对这两个线程分析一下：

```
"Thread-1":
  waiting to lock monitor 0x00007f944600b2b8 (object 0x000000076abb0128, a java.lang.Object),
  which is held by "Thread-0"
"Thread-0":
  waiting to lock monitor 0x00007f944600dbf8 (object 0x000000076abb0138, a java.lang.Object),
  which is held by "Thread-1"
```

由于两个线程都在等待获取对方持有的锁，所以就这么永久等待下去了。


## 避免死锁

有很多方针可供我们使用来避免死锁的局面。


- 以特定顺序获得锁

如果必须获取多个锁，那么在设计的时候需要充分考虑不同线程之前获得锁的顺序。

按照上面的例子，两个线程获得锁的时序图如下：

![lock-wrong-order](https://user-gold-cdn.xitu.io/2018/3/19/1623d495aa379fe7?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

如果此时把获得锁的时序改成：

![lock-in-order](https://user-gold-cdn.xitu.io/2018/3/19/1623d495c63027dc?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

那么死锁就永远不会发生。 

针对两个特定的锁，开发者可以尝试按照锁对象的hashCode值大小的顺序，分别获得两个锁，这样锁总是会以特定的顺序获得锁，那么死锁也不会发生。

- 超时放弃

当使用synchronized关键词提供的内置锁时，只要线程没有获得锁，那么就会永远等待下去，然而Lock接口提供了

`boolean tryLock(long time, TimeUnit unit) throws InterruptedException` 方法，该方法可以按照固定时长等待锁，
因此线程可以在获取锁超时以后，主动释放之前已经获得的所有的锁。

通过这种方式，也可以很有效地避免死锁。

还是按照之前的例子，时序图如下：

![deadlock-timeout](https://user-gold-cdn.xitu.io/2018/3/19/1623d495c8474263?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

- 避免嵌套封锁

这是死锁最主要的原因的，如果你已经有一个资源了就要避免封锁另一个资源。

如果你运行时只有一个对象封锁，那是几乎不可能出现一个死锁局面的。

例如，这里是另一个运行中没有嵌套封锁的run()方法，而且程序运行没有死锁局面，运行得很成功。

```java
public void run() {
    String name = Thread.currentThread().getName();
    System.out.println(name + " acquiring lock on " + obj1);
    synchronized (obj1) {
        System.out.println(name + " acquired lock on " + obj1);
        work();
    }
    System.out.println(name + " released lock on " + obj1);
    System.out.println(name + " acquiring lock on " + obj2);
    synchronized (obj2) {
        System.out.println(name + " acquired lock on " + obj2);
        work();
    }
    System.out.println(name + " released lock on " + obj2);
    System.out.println(name + " finished execution.");
}
```

- 只对有请求的进行封锁

你应当只想你要运行的资源获取封锁，比如在上述程序中我在封锁的完全的对象资源。
但是如果我们只对它所属领域中的一个感兴趣，那我们应当封锁住那个特殊的领域而并非完全的对象。

- 避免无限期的等待

如果两个线程正在等待对象结束，无限期的使用线程加入，如果你的线程必须要等待另一个线程的结束，若是等待进程的结束加入最好准备最长时间。

# 参考资料

《java 并发编程的艺术》

[死锁终极篇](https://juejin.im/post/5aaf6ee76fb9a028d3753534)

* any list
{:toc}
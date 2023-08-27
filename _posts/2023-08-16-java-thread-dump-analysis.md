---
layout: post
title: jstack-java 死锁应用卡死 thread dump 分析记录
date: 2023-08-16 21:01:55 +0800
categories: [JVM]
tags: [jvm, thread, lock, sh]
published: true
---

# 现象

应用开始启动正常，然后应用卡死。

`ps -ef | grep java` 进程还在，应用的 dubbo 端口还是活着的。


# 流程

## 查看应用 PID

```
ps -ef | grep java 
```


## 获取 dump 文件

'jstack' 是捕获线程转储的有效命令行工具。

jstack 工具包含在 JDK_HOMEbin 文件夹中。这是您需要发出以捕获线程转储的命令：

```
jstack -l   <​​pid> > <文件路径>
```

在哪里

pid：是应用程序的进程ID，应捕获其线程转储

file-path：是写入线程转储的文件路径。

### -l 的作用

```
jstack -l <pid> > thread_dump_with_locks.txt
```

**在使用`jstack`命令时，`-l`选项用于在生成线程转储时同时显示关于锁的额外信息。这些锁信息包括每个线程当前正在持有的锁、等待的锁以及相关的监视器状态。**

通常，线程转储（或线程快照）是一个用于诊断和调试多线程应用程序的工具。通过查看线程的状态、堆栈跟踪和锁定信息，你可以识别潜在的死锁、竞争条件以及其他与多线程相关的问题。

使用`-l`选项生成的线程转储会显示每个线程的堆栈跟踪以及线程当前的锁状态。这可以帮助你更好地理解线程在执行过程中的行为，特别是涉及到锁定和同步的情况。

例如，你可以运行以下命令来生成包含锁信息的线程转储：

```
jstack -l <pid> > thread_dump_with_locks.txt
```

在这里，`<pid>`是Java进程的进程ID，`thread_dump_with_locks.txt`是输出线程转储信息的文件名。

总之，`-l`选项可以为你提供更全面的线程信息，特别是在分析涉及锁定和同步问题的情况时，这些信息可能非常有价值。

### 常用参数说明

`jstack`是一个用于生成Java应用程序线程转储信息的命令行工具，它对于分析多线程应用程序的问题非常有用。下面是`jstack`命令的一些常用参数介绍：

1. **不带参数：**
   运行简单的`jstack`命令（例如 `jstack <pid>`），将会生成包含所有线程信息的线程转储。这将显示每个线程的状态和堆栈跟踪。

2. **-l：**
   `-l`选项会在线程转储中包含关于锁的额外信息。这将显示每个线程当前持有的锁、等待的锁以及监视器状态。

3. **-F：**
   `-F`选项会强制生成线程转储，即使目标Java进程没有响应。这在分析应用程序出现问题并且无法进行常规线程转储时很有用。

4. **-m：**
   `-m`选项会在线程转储中包含本地方法的符号信息。通常，线程堆栈中的本地方法部分可能不会显示详细的符号信息，但使用该选项会尝试提供更多信息。

5. **-h 或 --help：**
   使用`-h`或`--help`选项，可以在命令行中查看`jstack`命令的帮助信息，包括可用的选项和参数说明。

6. **其他参数：**
   除了上述常用参数外，`jstack`还可以接受一个进程ID（PID）作为参数，用于指定要生成线程转储的目标Java进程。例如：`jstack 12345`，其中12345是目标Java进程的PID。

请注意，生成线程转储可能会在一定程度上影响应用程序的性能。因此，在生产环境中使用时，要谨慎考虑。使用`jstack`可以帮助你识别和解决多线程应用程序中的问题，例如死锁、线程竞争和性能瓶颈。

### 例子

例子：

```
jstack -l  37320 > /opt/tmp/threadDump.txt
```

根据示例，进程的线程转储将在 /opt/tmp/threadDump.txt 文件中生成。

Jstack 工具自 Java 5 起包含在 JDK 中。如果您在旧版本的 java 中运行，请考虑使用其他选项


## 其他获取 dump 的方式

### 3. JVisualVM

Java VisualVM 是一种图形用户界面工具，可在应用程序在指定的 Java 虚拟机 (JVM) 上运行时提供有关应用程序的详细信息。

它位于 JDK_HOMEbinjvisualvm.exe 中。它是自 JDK 6 更新 7.s 以来 Sun 的 JDK 发行版的一部分

启动 jvisualvm。在左侧面板上，您会注意到在您的机器上运行的所有 Java 应用程序。您需要从列表中选择您的应用程序（请参见下图中的红色突出显示）。该工具还能够从远程主机上运行的 java 进程中捕获线程转储。

![jvisual](https://i0.wp.com/dzone.com/storage/temp/2234095-jvisualvm-1.png?w=736&ssl=1)

### 6. ThreadMXBean

从 JDK 1.5 开始引入了 ThreadMXBean。

这是Java虚拟机中线程系统的管理接口。

使用此接口，您还可以生成线程转储。

您只需编写几行代码即可以编程方式生成线程转储。

下面是 ThreadMXBean 实现的骨架实现，它从应用程序生成线程转储。

```java
ThreadMXBean threadMxBean = ManagementFactory.getThreadMXBean();
for (ThreadInfo ti : threadMxBean.dumpAllThreads(true, true)) {
    System.out.print(ti.toString());
}
```

### 8. JCMD

jcmd 工具是在 Oracle 的 Java 7 中引入的。它对于解决 JVM 应用程序的问题很有用。

它具有各种功能，例如识别 Java 进程 ID、获取堆转储、获取线程转储、获取垃圾收集统计信息……。

使用下面的 JCMD 命令可以生成线程转储：

```
jcmd <pid> Thread.print > <文件路径>
```

在那里

pid：是应用程序的进程ID，应捕获其线程转储

file-path：是写入线程转储的文件路径。

例子：

```
jcmd 37320 Thread.print > /opt/tmp/threadDump.txt
```

根据示例，进程的线程转储将在 /opt/tmp/threadDump.txt 文件中生成。 

# dump 文件介绍

我们把整个 Thread dump 的信息, 分成3部分来分别讲解:

- 头部 JVM 及线程 Summary 部分

- 常规线程具体信息部分

- 尾部特殊线程及其它部分

## Thread dump 头部 JVM 及线程ID列表

在最开始部分, 我们看到类似下面的信息:

```
3499:
2023-04-01 08:41:33
Full thread dump OpenJDK 64-Bit Server VM (17.0.5+1-b653.25 mixed mode):
 
Threads class SMR info:
_java_thread_list=0x000060000b029f00, length=113, elements={
0x00007fc18981e800, 0x00007fc18a01ee00, 0x00007fc18a01cc00, 0x00007fc18a8bea00,
				... ...
0x00007fc1878f0200, 0x00007fc1410d6600, 0x00007fc18a489600, 0x00007fc131aefa00,
0x00007fc131ad4a00
}
```

第一行是当前进程的进程号(pid), 第二行是产生 Thread dump的系统时间, 第三行主要是JDK的信息, 然后是所有线程的线程ID(tid)的列表,以及线程的数量(113). 

上面SMR是 Safe Memory Reclamation 的缩写. 

这部分信息通常情况下价值不大, 大部分有用的信息都在线程具体内容部分.

## Thread dump 常规线程具体信息

接下来就是每个线程的具体元数据部分和线程栈部分

我们拿其中一个例子来说明:

```
"pool-4-thread-1" #191 prio=5 os_prio=31 cpu=4012.76ms elapsed=313903.17s allocated=1229K defined_classes=23 tid=0x00007fc1898a8000 nid=0x23757 in Object.wait()  [0x000070000a4d5000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(java.base@17.0.5/Native Method)
	- waiting on <no object reference available>
	at java.io.PipedInputStream.read(java.base@17.0.5/PipedInputStream.java:326)
	- eliminated <0x0000000782139b00> (a java.io.PipedInputStream)
	at java.io.PipedInputStream.read(java.base@17.0.5/PipedInputStream.java:377)
	- locked <0x0000000782139b00> (a java.io.PipedInputStream)
	at com.jetbrains.python.console.transport.TCumulativeTransport.read(TCumulativeTransport.kt:46)
	at com.jetbrains.python.console.transport.server.TNettyServerTransport$TNettyTransport.readAll(TNettyServerTransport.kt:243)
	at org.apache.thrift.protocol.TBinaryProtocol.readAll(TBinaryProtocol.java:455)
	at org.apache.thrift.protocol.TBinaryProtocol.readI32(TBinaryProtocol.java:354)
	at org.apache.thrift.protocol.TBinaryProtocol.readMessageBegin(TBinaryProtocol.java:243)
	at org.apache.thrift.TBaseProcessor.process(TBaseProcessor.java:27)
	at org.apache.thrift.server.TThreadPoolServer$WorkerProcess.run(TThreadPoolServer.java:313)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(java.base@17.0.5/ThreadPoolExecutor.java:1136)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(java.base@17.0.5/ThreadPoolExecutor.java:635)
	at java.lang.Thread.run(java.base@17.0.5/Thread.java:833)
 
   Locked ownable synchronizers:
	- <0x0000000782139ef8> (a java.util.concurrent.ThreadPoolExecutor$Worker)
```

第一行是当前线程的元数据信息, 包含很多有用的信息, 我们逐一来解释一下:

```
"pool-4-thread-1": 是当前线程的名字
#192: 表示这是应用启动后创建的第192个线程, 我们可以看到这个数字在我们的 Thread dump 从上到下是顺序增加的, 如果你发现中间某个数字没有, 说明那个线程已经死亡了.
prio=5: 这是线程的优先级. Java 线程优先级是1~10, 默认是5.
os_prio=31: 这是当前线程在操作系统层面的优先级, 这里是31.
cpu=4012.76ms: 表示当前线程从开始运行到生成Thread dump 时共使用了4012.76ms CPU 时间.
elapsed=313903.17s: 表示当前线程已经存活了313903.17s秒.
allocated=1229K: 表示当前线程共分配了1229K的内存.
defined_classes=23: 表示当前线程共新定义了23个新类.
tid=0x00007fc1898a8000: 当前线程的ID, 和第一部分的线程ID对应.
nid=0x23757: 当前线程在操作系统层面的ID(在Linux里,线程是一个轻量级的进程(LWP)).
in Object.wait(): 表示当前线程最后运行在 Obect 类的 wait() 方法里面.
[0x000070000a4d5000]: 最后的栈指针(SP)地址, 一般诊断中用不到这个信息.
```

第二行告诉我们当前线程的状态: TIMED_WAITING, 并且是等着对象的 monitor 上.

接着是线程的栈信息, 以 at 开头的行告诉我们当前栈帧执行的类和方法, 括号里面的内容告诉我们这个类的源文件名及当前在执行的行号, 如果前面有 /, 斜线前面表示代码属于的模块及版本.

另外有些行是以 - 开头的, 比如下面的每一行的栈帧都跟着一行以 - 开头的一行:

```
	at java.lang.Object.wait(java.base@17.0.5/Native Method)
	- waiting on <no object reference available>
	at java.io.PipedInputStream.read(java.base@17.0.5/PipedInputStream.java:326)
	- eliminated <0x0000000782139b00> (a java.io.PipedInputStream)
	at java.io.PipedInputStream.read(java.base@17.0.5/PipedInputStream.java:377)
	- locked <0x0000000782139b00> (a java.io.PipedInputStream)
```

PS: 其实就是方法堆栈，从下往上看。结合源码即可。

首先, 我们最下面2行看起, 第5行表示在执行 PipedInputStream 的 377 行的 read()方法的时候, 当前线程获得了一把锁, 这把锁是属于一个 java.io.PipedInputStream 对象的. 

下面是截取的 JDK 这个版本的 PipedInputStream 类的377 行附近的源代码:

```java
    public synchronized int read()  throws IOException {
        if (!connected) {
            throw new IOException("Pipe not connected");
        } else if (closedByReader) {
            throw new IOException("Pipe closed");
        } else if (writeSide != null && !writeSide.isAlive()
                   && !closedByWriter && (in < 0)) {
            throw new IOException("Write end dead");
        }

        readSide = Thread.currentThread();
        int trials = 2;
        while (in < 0) {
            if (closedByWriter) {
                /* closed by writer, return EOF */
                return -1;
            }
            if ((writeSide != null) && (!writeSide.isAlive()) && (--trials < 0)) {
                throw new IOException("Pipe broken");
            }
            /* might be a writer waiting */
            notifyAll();
            try {
                wait(1000);
            } catch (InterruptedException ex) {
                throw new java.io.InterruptedIOException();
            }
        }
        int ret = buffer[out++] & 0xFF;
        if (out >= buffer.length) {
            out = 0;
        }
        if (in == out) {
            /* now empty */
            in = -1;
        }

        return ret;
    }
```

可以看到, 这个方法是一个 synchronized 方法, 要执行到377行, 必须先获得当前对象的锁.

然后我们看第3, 4 行, 它表示在执行PipedInputStream 的326 行的 read() 方法的时候, 当前线程临时释放(eliminated) 了上层栈帧(第5行)获得的那把锁, 根据锁的ID可以看出锁是同一把.

然后我们看326行附近的源代码:

```java
try {
    wait(1000);
} catch (InterruptedException ex) {
    throw new java.io.InterruptedIOException();
}
```

进入这个方法也需要获得当前对象的锁, 但是上层栈帧已经获得了这个锁, 所以这次可以直接进入这个方法. 然后在326行, 当前线程调用当前对象的 wait() 方法, 并且给了1000ms 的参数, 意思是: 当前线程要临时放弃拥有这个锁, 并且加入这个锁的wait队列. 

在这个wait队列里, 如果没被 notify(), notifyAll() 提前唤醒进入等待队列, 那么至多等待1000ms, 就可以进入这个锁的block队列(关于 syncronized 锁, wait(), notify(), notifyAll() 方法以及 block队列 和 wait 队列, 请查询相关信息), 然后就可以竞争再次获得这个锁.

进入 wait() 方法之后, 就进入了非Java写的 native code, 拿不到对象的地址, 所以这里虽然显示等着, 但是没有对象的引用可以给我们看.

最后, 每个线程尾部, 都有一段是关于Locked ownable synchronizers的部分. 

有的线程拥有这种一个或多个同步器, 有的没有(none), 如果有就显示在这里.

```
   Locked ownable synchronizers:
	- <0x0000000782139ef8> (a java.util.concurrent.ThreadPoolExecutor$Worker)
```

在 Java 里面凡是使用 java.util.concurrent.locks.AbstractOwnableSynchronizer 或其子类实现同步功能的同步器, 并且被某个线程获得这个同步器锁的, 这个同步器就会显示在这段 Locked ownable synchronizers 里面. 

Java 里面的2个实现类分别是: ReentrantLock 和 ReentrantReadWriteLock

在 Java 里面, 一个锁(lock)可以是一个内置的(built-in) monitor, 也可以是一个 ownable synchronizer, 也可以是一个与同步器关联的 java.util.concurrent.locks.Condition 对象.

## 尾部特殊线程及其它

在整个 Thread dump 的最下面, 我们可以看到一些信息非常简单的线程, 比如下面这种:

```
"VM Thread" os_prio=31 cpu=10486.47ms elapsed=314111.17s tid=0x00007fc188405460 nid=0x7c03 runnable  
 
"GC Thread#0" os_prio=31 cpu=71683.40ms elapsed=314111.18s tid=0x00007fc188507c80 nid=0x4203 runnable  
 
"GC Thread#1" os_prio=31 cpu=71692.01ms elapsed=314110.89s tid=0x00007fc18800dd80 nid=0xe403 runnable  
 
"G1 Conc#0" os_prio=31 cpu=295753.03ms elapsed=314111.18s tid=0x00007fc188508ba0 nid=0x4403 runnable  
 
"G1 Conc#1" os_prio=31 cpu=295775.82ms elapsed=314110.87s tid=0x00007fc136f0aa20 nid=0x1050b runnable  
 
"VM Periodic Task Thread" os_prio=31 cpu=49667.04ms elapsed=314111.09s tid=0x00007fc188529b50 nid=0x6c03 waiting on condition  
```

这种线程基本都是 JVM 本身的一些线程, 不去处理我们写的业务逻辑, 主要用来维护 JVM 系统本身. 

它的元数据跟我们上面介绍的线程元数据一样, 信息更少, 由于很多都是 native 代码编写, 也没有Java 的栈帧信息.

最后, Java Native Interface(JNI)相关的一些信息.

比如:

```
JNI global refs: 2777, weak refs: 6388
```


## 死锁信息

如果在做 Thread dump 的时候, 有死锁的存在, Thread dump 里面最后面会标明线程死锁的相关信息, 比如:

```
Found one Java-level deadlock:
=============================
"Thread-0":
  waiting to lock monitor 0x0000600003a000d0 (object 0x000000061f613348, a java.io.PrintStream),
  which is held by "Thread-1"
 
"Thread-1":
  waiting to lock monitor 0x0000600003a185b0 (object 0x000000061f54ddd8, a ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy),
  which is held by "Thread-0"
 
Java stack information for the threads listed above:
===================================================
"Thread-0":
	at java.io.PrintStream.write(java.base@17.0.2/PrintStream.java:696)
	- waiting to lock <0x000000061f613348> (a java.io.PrintStream)
	at java.io.PrintStream.print(java.base@17.0.2/PrintStream.java:877)
	   ... 省略 ...
"Thread-1":
	at ch.qos.logback.core.rolling.RollingFileAppender.subAppend(RollingFileAppender.java:234)
	- waiting to lock <0x000000061f54ddd8> (a ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy)
        ... 省略 ...
```

# 实战测试

## 测试代码

```java
package com.ryo.log4j2.hello.world;

import java.util.concurrent.locks.ReentrantLock;

public class ThreadDeadLockMain {

    static class AThread extends Thread {
        private ReentrantLock lock1;
        private ReentrantLock lock2;

        /**
         * @param lock1
         * @param lock2
         */
        public AThread(ReentrantLock lock1, ReentrantLock lock2) {
            super();
            this.lock1 = lock1;
            this.lock2 = lock2;
        }

        public void run() {
            try {
                System.out.println("AThread START");
                lock1.lock();
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                } //  必须获取两个锁后才执行操作 lock2.lock(); System.out.println("A: I have all Locks!"); } catch (InterruptedException e) { e.printStackTrace(); } finally { lock2.unlock(); lock1.unlock(); } } } static class BThread extends Thread { private ReentrantLock lock1; private ReentrantLock lock2; /**
                lock2.lock();
                System.out.println("AThread DONE");
            } finally {
                lock2.unlock();
                lock1.unlock();
            }
        }
    }

    static class BThread extends Thread {
        private ReentrantLock lock1;
        private ReentrantLock lock2;

        /**
         * @param lock1
         * @param lock2
         */
        public BThread(ReentrantLock lock1, ReentrantLock lock2) {
            super();
            this.lock1 = lock1;
            this.lock2 = lock2;
        }

        public void run() {
            try {
                System.out.println("BThread START");
                lock2.lock();
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                } //  必须获取两个锁后才执行操作 lock2.lock(); System.out.println("A: I have all Locks!"); } catch (InterruptedException e) { e.printStackTrace(); } finally { lock2.unlock(); lock1.unlock(); } } } static class BThread extends Thread { private ReentrantLock lock1; private ReentrantLock lock2; /**
                lock1.lock();
                System.out.println("BThread DONE");
            } finally {
                lock1.unlock();
                lock2.unlock();
            }
        }

        public static void main(String[] args) {
            final ReentrantLock lock1 = new ReentrantLock();
            final ReentrantLock lock2 = new ReentrantLock();
            new AThread(lock1, lock2).start();
            new BThread(lock1, lock2).start();
        }

    }
}
```

运行效果

```
AThread START
BThread START
```

然后就卡主了。

## 获取 dump

1) 获取 pid

windows 下：

```
D:\tool\jdk\jdk-1.8\bin
λ jps
23184 ThreadDeadLockMain$BThread
26080
17544 Jps
13740 Launcher
```

找到对应的 pid 为 23184

2) 获取 dump 文件 

```
λ jstack -l 23184 > threadDump.txt
```

完整的文件内容如下：

```
2023-08-16 12:49:36
Full thread dump OpenJDK 64-Bit Server VM (17.0.7+7-LTS mixed mode, sharing):

Threads class SMR info:
_java_thread_list=0x000001f28072ba70, length=15, elements={
0x000001f280418b50, 0x000001f280419410, 0x000001f28049f080, 0x000001f2804d0f70,
0x000001f2804d1a40, 0x000001f2804a1560, 0x000001f2804ac990, 0x000001f2804d4840,
0x000001f2804e5510, 0x000001f2805cdd50, 0x000001f280756780, 0x000001f280757460,
0x000001f28075cd80, 0x000001f28075d250, 0x000001f2dab4b4c0
}

"Reference Handler" #2 daemon prio=10 os_prio=2 cpu=0.00ms elapsed=228.44s tid=0x000001f280418b50 nid=0x16f4 waiting on condition  [0x00000034688ff000]
   java.lang.Thread.State: RUNNABLE
	at java.lang.ref.Reference.waitForReferencePendingList(java.base@17.0.7/Native Method)
	at java.lang.ref.Reference.processPendingReferences(java.base@17.0.7/Reference.java:253)
	at java.lang.ref.Reference$ReferenceHandler.run(java.base@17.0.7/Reference.java:215)

   Locked ownable synchronizers:
	- None

"Finalizer" #3 daemon prio=8 os_prio=1 cpu=0.00ms elapsed=228.44s tid=0x000001f280419410 nid=0x252c in Object.wait()  [0x00000034689ff000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(java.base@17.0.7/Native Method)
	- waiting on <0x0000000713e0d5d0> (a java.lang.ref.ReferenceQueue$Lock)
	at java.lang.ref.ReferenceQueue.remove(java.base@17.0.7/ReferenceQueue.java:155)
	- locked <0x0000000713e0d5d0> (a java.lang.ref.ReferenceQueue$Lock)
	at java.lang.ref.ReferenceQueue.remove(java.base@17.0.7/ReferenceQueue.java:176)
	at java.lang.ref.Finalizer$FinalizerThread.run(java.base@17.0.7/Finalizer.java:172)

   Locked ownable synchronizers:
	- None

"Signal Dispatcher" #4 daemon prio=9 os_prio=2 cpu=0.00ms elapsed=228.43s tid=0x000001f28049f080 nid=0x3158 waiting on condition  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"Attach Listener" #5 daemon prio=5 os_prio=2 cpu=0.00ms elapsed=228.43s tid=0x000001f2804d0f70 nid=0x66e0 waiting on condition  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"Service Thread" #6 daemon prio=9 os_prio=0 cpu=0.00ms elapsed=228.43s tid=0x000001f2804d1a40 nid=0x4880 runnable  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"Monitor Deflation Thread" #7 daemon prio=9 os_prio=0 cpu=0.00ms elapsed=228.43s tid=0x000001f2804a1560 nid=0xfb4 runnable  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C2 CompilerThread0" #8 daemon prio=9 os_prio=2 cpu=0.00ms elapsed=228.43s tid=0x000001f2804ac990 nid=0xc90 waiting on condition  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE
   No compile task

   Locked ownable synchronizers:
	- None

"C1 CompilerThread0" #16 daemon prio=9 os_prio=2 cpu=0.00ms elapsed=228.43s tid=0x000001f2804d4840 nid=0xb44 waiting on condition  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE
   No compile task

   Locked ownable synchronizers:
	- None

"Sweeper thread" #20 daemon prio=9 os_prio=2 cpu=0.00ms elapsed=228.43s tid=0x000001f2804e5510 nid=0x5204 runnable  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"Common-Cleaner" #21 daemon prio=8 os_prio=1 cpu=0.00ms elapsed=228.42s tid=0x000001f2805cdd50 nid=0x4f60 in Object.wait()  [0x00000034691fe000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(java.base@17.0.7/Native Method)
	- waiting on <0x0000000713f12200> (a java.lang.ref.ReferenceQueue$Lock)
	at java.lang.ref.ReferenceQueue.remove(java.base@17.0.7/ReferenceQueue.java:155)
	- locked <0x0000000713f12200> (a java.lang.ref.ReferenceQueue$Lock)
	at jdk.internal.ref.CleanerImpl.run(java.base@17.0.7/CleanerImpl.java:140)
	at java.lang.Thread.run(java.base@17.0.7/Thread.java:833)
	at jdk.internal.misc.InnocuousThread.run(java.base@17.0.7/InnocuousThread.java:162)

   Locked ownable synchronizers:
	- None

"Monitor Ctrl-Break" #22 daemon prio=5 os_prio=0 cpu=0.00ms elapsed=228.39s tid=0x000001f280756780 nid=0x730 runnable  [0x00000034696fe000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.SocketDispatcher.read0(java.base@17.0.7/Native Method)
	at sun.nio.ch.SocketDispatcher.read(java.base@17.0.7/SocketDispatcher.java:46)
	at sun.nio.ch.NioSocketImpl.tryRead(java.base@17.0.7/NioSocketImpl.java:261)
	at sun.nio.ch.NioSocketImpl.implRead(java.base@17.0.7/NioSocketImpl.java:312)
	at sun.nio.ch.NioSocketImpl.read(java.base@17.0.7/NioSocketImpl.java:350)
	at sun.nio.ch.NioSocketImpl$1.read(java.base@17.0.7/NioSocketImpl.java:803)
	at java.net.Socket$SocketInputStream.read(java.base@17.0.7/Socket.java:966)
	at sun.nio.cs.StreamDecoder.readBytes(java.base@17.0.7/StreamDecoder.java:270)
	at sun.nio.cs.StreamDecoder.implRead(java.base@17.0.7/StreamDecoder.java:313)
	at sun.nio.cs.StreamDecoder.read(java.base@17.0.7/StreamDecoder.java:188)
	- locked <0x0000000713d02488> (a java.io.InputStreamReader)
	at java.io.InputStreamReader.read(java.base@17.0.7/InputStreamReader.java:177)
	at java.io.BufferedReader.fill(java.base@17.0.7/BufferedReader.java:162)
	at java.io.BufferedReader.readLine(java.base@17.0.7/BufferedReader.java:329)
	- locked <0x0000000713d02488> (a java.io.InputStreamReader)
	at java.io.BufferedReader.readLine(java.base@17.0.7/BufferedReader.java:396)
	at com.intellij.rt.execution.application.AppMainV2$1.run(AppMainV2.java:53)

   Locked ownable synchronizers:
	- <0x0000000713cf8c60> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)

"Notification Thread" #23 daemon prio=9 os_prio=0 cpu=0.00ms elapsed=228.39s tid=0x000001f280757460 nid=0x3320 runnable  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"Thread-0" #24 prio=5 os_prio=0 cpu=0.00ms elapsed=228.39s tid=0x000001f28075cd80 nid=0x27ec waiting on condition  [0x00000034699ff000]
   java.lang.Thread.State: WAITING (parking)
	at jdk.internal.misc.Unsafe.park(java.base@17.0.7/Native Method)
	- parking to wait for  <0x0000000713c8f188> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)
	at java.util.concurrent.locks.LockSupport.park(java.base@17.0.7/LockSupport.java:211)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:715)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:938)
	at java.util.concurrent.locks.ReentrantLock$Sync.lock(java.base@17.0.7/ReentrantLock.java:153)
	at java.util.concurrent.locks.ReentrantLock.lock(java.base@17.0.7/ReentrantLock.java:322)
	at com.ryo.log4j2.hello.world.ThreadDeadLockMain$AThread.run(ThreadDeadLockMain.java:31)

   Locked ownable synchronizers:
	- <0x0000000713c8f158> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)

"Thread-1" #25 prio=5 os_prio=0 cpu=0.00ms elapsed=228.39s tid=0x000001f28075d250 nid=0x3e90 waiting on condition  [0x0000003469aff000]
   java.lang.Thread.State: WAITING (parking)
	at jdk.internal.misc.Unsafe.park(java.base@17.0.7/Native Method)
	- parking to wait for  <0x0000000713c8f158> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)
	at java.util.concurrent.locks.LockSupport.park(java.base@17.0.7/LockSupport.java:211)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:715)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:938)
	at java.util.concurrent.locks.ReentrantLock$Sync.lock(java.base@17.0.7/ReentrantLock.java:153)
	at java.util.concurrent.locks.ReentrantLock.lock(java.base@17.0.7/ReentrantLock.java:322)
	at com.ryo.log4j2.hello.world.ThreadDeadLockMain$BThread.run(ThreadDeadLockMain.java:64)

   Locked ownable synchronizers:
	- <0x0000000713c8f188> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)

"DestroyJavaVM" #26 prio=5 os_prio=0 cpu=0.00ms elapsed=228.39s tid=0x000001f2dab4b4c0 nid=0x501c waiting on condition  [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"VM Thread" os_prio=2 cpu=0.00ms elapsed=228.44s tid=0x000001f280411e70 nid=0x6540 runnable  

"GC Thread#0" os_prio=2 cpu=0.00ms elapsed=228.45s tid=0x000001f2dabb24f0 nid=0x3918 runnable  

"G1 Main Marker" os_prio=2 cpu=0.00ms elapsed=228.45s tid=0x000001f2dabc2ff0 nid=0x3efc runnable  

"G1 Conc#0" os_prio=2 cpu=0.00ms elapsed=228.45s tid=0x000001f2dabc3a00 nid=0x3e14 runnable  

"G1 Refine#0" os_prio=2 cpu=0.00ms elapsed=228.45s tid=0x000001f2dac0ec10 nid=0x56b8 runnable  

"G1 Service" os_prio=2 cpu=0.00ms elapsed=228.45s tid=0x000001f2802cfa10 nid=0x4b28 runnable  

"VM Periodic Task Thread" os_prio=2 cpu=0.00ms elapsed=228.39s tid=0x000001f2dabd80c0 nid=0x4154 waiting on condition  

JNI global refs: 23, weak refs: 0


Found one Java-level deadlock:
=============================
"Thread-0":
  waiting for ownable synchronizer 0x0000000713c8f188, (a java.util.concurrent.locks.ReentrantLock$NonfairSync),
  which is held by "Thread-1"

"Thread-1":
  waiting for ownable synchronizer 0x0000000713c8f158, (a java.util.concurrent.locks.ReentrantLock$NonfairSync),
  which is held by "Thread-0"

Java stack information for the threads listed above:
===================================================
"Thread-0":
	at jdk.internal.misc.Unsafe.park(java.base@17.0.7/Native Method)
	- parking to wait for  <0x0000000713c8f188> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)
	at java.util.concurrent.locks.LockSupport.park(java.base@17.0.7/LockSupport.java:211)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:715)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:938)
	at java.util.concurrent.locks.ReentrantLock$Sync.lock(java.base@17.0.7/ReentrantLock.java:153)
	at java.util.concurrent.locks.ReentrantLock.lock(java.base@17.0.7/ReentrantLock.java:322)
	at com.ryo.log4j2.hello.world.ThreadDeadLockMain$AThread.run(ThreadDeadLockMain.java:31)
"Thread-1":
	at jdk.internal.misc.Unsafe.park(java.base@17.0.7/Native Method)
	- parking to wait for  <0x0000000713c8f158> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)
	at java.util.concurrent.locks.LockSupport.park(java.base@17.0.7/LockSupport.java:211)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:715)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:938)
	at java.util.concurrent.locks.ReentrantLock$Sync.lock(java.base@17.0.7/ReentrantLock.java:153)
	at java.util.concurrent.locks.ReentrantLock.lock(java.base@17.0.7/ReentrantLock.java:322)
	at com.ryo.log4j2.hello.world.ThreadDeadLockMain$BThread.run(ThreadDeadLockMain.java:64)

Found 1 deadlock.
```

## 死锁分析

我们最核心的只需要关注，这里列出了对应的死锁信息。

```
Found one Java-level deadlock:
=============================
"Thread-0":
  waiting for ownable synchronizer 0x0000000713c8f188, (a java.util.concurrent.locks.ReentrantLock$NonfairSync),
  which is held by "Thread-1"

"Thread-1":
  waiting for ownable synchronizer 0x0000000713c8f158, (a java.util.concurrent.locks.ReentrantLock$NonfairSync),
  which is held by "Thread-0"
```

对应的线程信息如下：

```
Java stack information for the threads listed above:
===================================================
"Thread-0":
	at jdk.internal.misc.Unsafe.park(java.base@17.0.7/Native Method)
	- parking to wait for  <0x0000000713c8f188> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)
	at java.util.concurrent.locks.LockSupport.park(java.base@17.0.7/LockSupport.java:211)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:715)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:938)
	at java.util.concurrent.locks.ReentrantLock$Sync.lock(java.base@17.0.7/ReentrantLock.java:153)
	at java.util.concurrent.locks.ReentrantLock.lock(java.base@17.0.7/ReentrantLock.java:322)
	at com.ryo.log4j2.hello.world.ThreadDeadLockMain$AThread.run(ThreadDeadLockMain.java:31)
"Thread-1":
	at jdk.internal.misc.Unsafe.park(java.base@17.0.7/Native Method)
	- parking to wait for  <0x0000000713c8f158> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)
	at java.util.concurrent.locks.LockSupport.park(java.base@17.0.7/LockSupport.java:211)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:715)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquire(java.base@17.0.7/AbstractQueuedSynchronizer.java:938)
	at java.util.concurrent.locks.ReentrantLock$Sync.lock(java.base@17.0.7/ReentrantLock.java:153)
	at java.util.concurrent.locks.ReentrantLock.lock(java.base@17.0.7/ReentrantLock.java:322)
	at com.ryo.log4j2.hello.world.ThreadDeadLockMain$BThread.run(ThreadDeadLockMain.java:64)

Found 1 deadlock.
```

然后可以直接结合代码查看。

```
com.ryo.log4j2.hello.world.ThreadDeadLockMain$BThread.run(ThreadDeadLockMain.java:64)
com.ryo.log4j2.hello.world.ThreadDeadLockMain$AThread.run(ThreadDeadLockMain.java:31)
```

这两个底层是互相加锁，导致死锁等待。

# 参考资料

[介绍8个获取线程dump文件的方法](https://heapdump.cn/article/4438429)

[Thread Dump 分析死锁](https://blog.csdn.net/qiaoxu1989/article/details/131459735)

[Java Thread Dump 分析](https://blog.csdn.net/BASK2312/article/details/130054578)

[Java中各种死锁详细讲述及其解决方案（图文并茂，浅显易懂）](https://zhuanlan.zhihu.com/p/385855265)

https://www.cnblogs.com/cfas/p/15963496.html

[Java线程Dump分析](https://blog.csdn.net/import_sadaharu/article/details/102792360)

* any list
{:toc}
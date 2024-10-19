---
layout: post
title: jvm-42-java 如何获取 jvm thread dump 线程转储文件？ jstack / jcmd
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, thread, sh]
published: true
---

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[java 多线程实现通用方法 threadpool implement in java](https://houbb.github.io/2018/10/08/jvm-full-gc-39-inaction4)

# 注意

dump 会导致应用卡主一段时间，建议先下流量+dump

# 线程转储简介

线程转储(Thread Dump)就是JVM中所有线程状态信息的一次快照。

线程转储一般使用文本格式, 可以将其保存到文本文件中, 然后人工查看和分析, 或者使用工具/API自动分析。

Java中的线程模型, 直接使用了操作系统的线程调度模型, 只进行简单的封装。

线程调用栈, 也称为方法调用栈。 

比如在程序执行过程中, 有一连串的方法调用链: obj1.method2 调用了 obj2.methodB, obj2.methodB 又调用了 obj3.methodC。

每个线程的状态都可以通过这种调用栈来表示。

线程转储展示了各个线程的行为, 对于诊断和排查问题非常有用。

下面我们通过具体示例, 来演示各种获取Java线程转储的工具, 以及使用方法。

# 2. 使用JDK自带的工具

我们一般使用JDK自带的命令行工具来获取Java应用程序的线程转储。 

这些工具都在JDK主目录的bin文件夹下。

所以, 只要配置好 PATH 路径即可。 

如果不会配置, 可以参考: JDK环境准备

## 2.1 jstack 工具

jstack 是JDK内置的一款命令行工具, 专门用来查看线程状态, 也可以用来执行线程转储。

一般先通过 jps 或者 ps 命令找到Java进程对应的pid, 然后在控制台中通过pid来输出线程转储。 

当然, 我们也可以将输出内容重定向到某个文件中。

使用jstack工具获取线程转储的基本参数格式为:

```sh
jstack [-F] [-l] [-m] <pid>1
```

下面请看具体的演示:

```sh
# 1. 查看帮助信息
jstack -help
```
输出的内容类似于:

```
Usage:
    jstack [-l] <pid>
        (to connect to running process)
    jstack -F [-m] [-l] <pid>
        (to connect to a hung process)
    jstack [-m] [-l] <executable> <core>
        (to connect to a core file)
    jstack [-m] [-l] [server_id@]<remote server IP or hostname>
        (to connect to a remote debug server)Options:
    -F  to force a thread dump. Use when jstack <pid> does not respond (process is hung)
    -m  to print both java and native frames (mixed mode)
    -l  long listing. Prints additional information about locks
    -h or -help to print this help message123456789101112131415
```

对应的参数选项是可选的。 

具体含义如下：

-F 选项, 强制执行线程转储； 有时候 jstack pid 会假死, 则可以加上 -F 标志

-l 选项, 会查找堆内存中拥有的同步器以及资源锁

-m 选项, 额外打印 native栈帧（C和C++的）

例如, 获取线程转储并将结果输出到文件：

```sh
jstack -F 17264 > /tmp/threaddump.txt1
```

使用 jps 命令可以获取本地Java进程的 pid。

## 2.2 Java Mission Control

Java Mission Control（JMC）是一款客户端图形界面工具, 用于收集和分析Java应用程序的各种数据。
启动JMC后, 首先会显示本地计算机上运行的Java进程列表。 当然也可以通过JMC连接到远程Java进程。

可以鼠标右键单击对应的进程, 选择 “Start Flight Recording（开始飞行记录）” 。 

结束之后, “Threads（线程）” 选项卡会显示“线程转储”：

![JMC](https://img-blog.csdnimg.cn/2021010721222251.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3JlbmZ1ZmVp,size_16,color_FFFFFF,t_70#pic_center)

## 2.3 jvisualvm

jvisualvm 是一款客户端图形界面工具, 既简单又实用, 可用来监控 Java应用程序, 对JVM进行故障排查和性能分析。

也可以用来获取线程转储。 

鼠标右键单击Java进程, 选择“ Thread Dump”选项, 则可以创建线程转储, 完成后会在新选项卡中自动打开：

![jvisualvm](https://img-blog.csdnimg.cn/20210107212310646.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3JlbmZ1ZmVp,size_16,color_FFFFFF,t_70#pic_center)

## 2.4 jcmd

jcmd 工具本质上是向目标JVM发送一串命令。 

尽管支持很多功能, 但不支持连接远程JVM - 只能在Java进程的本地机器上使用。

其中一个命令是 Thread.print, 用来获取线程转储, 示例用法如下:

```sh
jcmd 17264 Thread.print1
```

## 2.5 jconsole

jconsole 工具也可以查看线程栈跟踪。

打开jconsole并连接到正在运行的Java进程, 导航到“线程”选项卡, 可以查看每个线程的堆栈跟踪：

![jsoncole](https://img-blog.csdnimg.cn/20210107212353759.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3JlbmZ1ZmVp,size_16,color_FFFFFF,t_70#pic_center)

## 2.6 小结

事实证明, 可以使用JDK中的很多工具来获取线程转储。 

让我们回顾一下, 并总结它们的优缺点：

jstack：获取线程转储最简单最方便的工具； Java 8之后可以使用 jcmd 工具来替代；

jmc：增强的JDK性能分析和问题诊断工具。 用这款工具进行性能分析的开销非常低。

jvisualvm：轻量级的开源分析工具, 图形界面非常棒, 还支持各种强悍的功能插件。

jcmd： 非常强大的本地工具, 支持Java 8及更高版本。 集成了多种工具的作用, 例如： 捕获线程转储（jstack）, 堆转储（jmap）, 查看系统属性和查看命令行参数（jinfo）

jconsole：也可以用来查看线程栈跟踪信息。

# 3. 使用Linux命令

在企业应用服务器中, 出于安全原因, 可能只安装了 JRE。 这时候没法使用这些JDK内置的工具。
但还是有办法获取线程转储。

## 3.1 使用 kill -3 指令

在Unix/Linux之类的系统中, 可以使用 kill 命令获取线程转储, 底层实现原理, 则是通过系统调用 kill() 将信号参数发送给进程。 

这里需要发送的是 -3 信号。

一般先通过 jps 找到JAVA进程对应的pid, kill -3 使用示例如下：

```sh
kill -3 172641
```

## 3.2 Ctrl + Break (Windows)

在Windows操作系统的命令行窗口中, 可使用组合键 Ctrl + Break 来获取线程转储。 

当然, 需要先导航至启动Java程序的控制台窗口, 然后同时按下 CTRL键和Break键。

需要注意的是, 某些键盘是没有 “Break” 键的。

在这种情况下, 可以组合使用 CTRL, SHIFT, 以及 Pause键。

这两个命令都可以将线程转储打印到控制台。

# 4. 通过编程方式使用ThreadMxBean

JMX技术支持各种各样的花式操作。 

可通过 ThreadMxBean 来执行线程转储。

示例代码如下：

```java
private static String threadDump(boolean lockedMonitors, boolean lockedSynchronizers) {
    StringBuffer threadDump = new StringBuffer(System.lineSeparator());
    ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
    for(ThreadInfo threadInfo : threadMXBean.dumpAllThreads(lockedMonitors, lockedSynchronizers)) {
        threadDump.append(threadInfo.toString());
    }
    return threadDump.toString();
}
```

上面代码做的事情很简单, 先通过 ManagementFactory 获取 ThreadMxBean 对象。

方法的布尔参数 lockedMonitors 和 lockedSynchronizers, 表示是否导出持有的同步器和管程锁。

# 总结

我们通过具体示例展示了获取线程转储的各种方法。

首先介绍的是各种JDK内置工具,
然后讨论了命令行方式,
最后介绍了JMX编程的方式。

# chat

## java 转存 thread 线程文件的几种方法

在Java中，获取线程转储（Thread Dump）是诊断多线程问题的重要手段。以下是几种获取线程转储的方法：

1. **使用`jstack`工具**：
   - `jstack`是JDK自带的命令行工具，可以生成Java进程的线程堆栈转储。使用方式如下：
     ```
     jstack -l <pid> > thread_dump.txt
     ```
     其中`-l`选项表示长列表格式，包含关于锁的信息。这将把进程ID为`<pid>`的Java进程的线程转储输出到`thread_dump.txt`文件中。

2. **使用图形化工具JVisualVM**：
   - JVisualVM是一个图形化的Java监控工具，提供了获取线程转储的功能。操作步骤如下：
     1. 启动JVisualVM，通常位于JDK的`bin`目录下。
     2. 在JVisualVM中，双击要监视的Java进程。
     3. 进入“线程”标签，可以看到当前活动的线程。
     4. 右键点击想要获取转储的线程，选择“检测死锁”或“生成线程转储”。

3. **使用`ThreadMXBean`编程方式获取**：
   - `ThreadMXBean`是Java的内置管理接口，可以用来获取线程信息，包括线程转储。示例代码如下：
     ```java
     import java.lang.management.ManagementFactory;
     import java.lang.management.ThreadInfo;
     import java.lang.management.ThreadMXBean;

     public class ThreadDumpDemo {
         public static void main(String[] args) {
             ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
             long[] threadIds = threadMXBean.findDeadlockedThreads();
             if (threadIds != null) {
                 System.out.println("Detected deadlock, threads involved:");
                 for (long id : threadIds) {
                     ThreadInfo info = threadMXBean.getThreadInfo(id);
                     System.out.println("Thread " + id + ": " + info.toString());
                 }
             } else {
                 System.out.println("No deadlock detected.");
             }
         }
     }
     ```
     这段代码首先获取`ThreadMXBean`实例，然后检查是否存在死锁的线程。如果存在，它将打印出这些线程的详细信息。

4. **使用`kill -3`指令**：
   - 在Unix/Linux系统中，可以使用`kill -3`指令来获取线程转储。首先通过`jps`找到Java进程对应的PID，然后执行`kill -3 <PID>`。这将导致Java进程生成线程转储并输出到标准输出或指定的日志文件中。

5. **使用`Ctrl + Break`（Windows）**：
   - 在Windows操作系统中，可以通过同时按下`Ctrl`和`Break`键来获取线程转储。需要先导航到启动Java程序的控制台窗口，然后同时按下这两个键。在某些键盘上，可能需要使用`Ctrl`、`Shift`和`Pause`键的组合。

6. **使用第三方库**：
   - 有些第三方库也提供了获取线程转储的功能，例如Slf4j的Logger。示例代码如下：
     ```java
     import org.slf4j.Logger;
     import org.slf4j.LoggerFactory;

     public class Slf4jThreadDump {
         private static final Logger logger = LoggerFactory.getLogger(Slf4jThreadDump.class);
         public static void main(String[] args) {
             logger.error("Thread dump:");
             for (Map.Entry<Thread, StackTraceElement[]> stackTrace : Thread.getAllStackTraces().entrySet()) {
                 logger.error("Thread " + stackTrace.getKey() + ":");
                 for (StackTraceElement element : stackTrace.getValue()) {
                     logger.error("    " + element);
                 }
             }
         }
     }
     ```
     这段代码使用Slf4j的Logger来记录每个线程的堆栈跟踪。

通过这些方法，开发者可以在需要时获取线程转储，从而更有效地分析和解决线程相关的问题。


# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[Java堆转储Dump文件的几种方法](https://blog.nowcoder.net/n/0aae9acaa6c14aafb505d37fc6a7f4ec)

* any list
{:toc}
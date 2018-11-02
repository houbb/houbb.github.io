---
layout: post
title: Java Cpu & Memory
date:  2018-11-02 21:01:14 +0800
categories: [Java]
tags: [java, jvm, sh]
published: true
excerpt: Java Cpu 和 内存占用查看
---

# 程序的方式

## freeMemory

- 简单的测试方法

```java
public static void main(String[] args) throws IOException {
    Runtime run = Runtime.getRuntime();
    System.out.println("Time: " + (new Date()));
    // 获取开始时内存使用量
    long startMem = run.totalMemory() - run.freeMemory();
    System.out.println("Memory> total:" + run.totalMemory() + " free:" + run.freeMemory() + " used:" + startMem);
    
    String str = "";
    for (int i = 0; i < 50000; ++i) {
        str += i;
    }

    System.out.println("\nTime: " + (new Date()));
    long endMem = run.totalMemory() - run.freeMemory();
    System.out.println("Memory> total:" + run.totalMemory() + " free:" + run.freeMemory() + " used:" + endMem);
    System.out.println("Memory difference:" + (endMem - startMem));
}
```

日志如下：

```
Time: Fri Nov 02 21:25:01 CST 2018
Memory> total:257425408 free:254741016 used:2684392

Time: Fri Nov 02 21:25:08 CST 2018
Memory> total:486539264 free:287638856 used:198900408
Memory difference:196216016
```

这个内存的单位为 byte。

### 优缺点

- 优点

不需要其他任何工具,就可以大致测出我们程序消耗的内存.

- 缺点

可能jvm刚回收过垃圾,我们的程序就获取了内存的使用量,导致结果严重偏低。不过这种概率还是很低的.

需要改动我们的程序.测试完成以后还需要删除这些代码,不小心可能引入bug.这才是最大的问题!

这里可以写成 AOP 的方式，却单独切，还好。

后期有时间，可以写成一个性能监控的小工具。

## MemoryMXBean

也可以用这种方式

```java
public static void main(String[] args) {
    MemoryMXBean bean = ManagementFactory.getMemoryMXBean();
    MemoryUsage memoryUsage = bean.getHeapMemoryUsage();
    System.out.println("Before: " + memoryUsage.getUsed());
    String str = "";
    for (int i = 0; i < 50000; ++i) {
        str += i;
    }
    MemoryUsage memoryAfterUsage = bean.getHeapMemoryUsage();
    System.out.println("After: " + memoryAfterUsage.getUsed());
}
```

日志：

```
Before: 4026592
After: 546174448
```

# 利用 java 自带的工具

查看java程序的资源消耗方法。 

查看java程序运行的峰值内存消耗（含虚拟机）和CPU消耗（ms）的方法： 

用jdk自带的工具，命令行输入 `jconsole`。就会出现一个内存管理的窗口。

根据进程号选择要监控的虚拟机； 

里面有内存、线程、包括各种对象定义占有的内存，都可以看到。 

# 常用命令

jinfo: 可以输出并修改运行时的java 进程的opts。 

jps: 与unix上的ps类似，用来显示本地的java进程，可以查看本地运行着几个java程序，并显示他们的进程号。 

jstat: 一个极强的监视VM内存工具。可以用来监视VM内存内的各种堆和非堆的大小及其内存使用量。 

jmap: 打印出某个java进程（使用pid）内存内的所有'对象'的情况（如：产生那些对象，及其数量）。 

jconsole: 一个java GUI监视工具，可以以图表化的形式显示各种数据。并可通过远程连接监视远程的服务器VM。 

[JDK工具（查看JVM参数、内存使用情况及分析等）](https://www.cnblogs.com/z-sm/p/6745375.html)

# java进程内存分析

[java进程内存分析](https://blog.csdn.net/sinat_30397435/article/details/54587846)

[Java进程内存占用高排查小结](http://blog.51cto.com/kusorz/1962548)

[linux下java进程占用内存过高（排查）](https://www.jianshu.com/p/8563c762fced)

# 参考资料

[获取java程序运行时内存信息](https://blog.csdn.net/u011004037/article/details/45740673)

[查看java内存情况命令](http://boendev.iteye.com/blog/882479)

[LINUX类主机JAVA应用程序占用CPU、内存过高分析手段](https://dbaplus.cn/news-21-130-1.html)

https://blog.csdn.net/frontend922/article/details/18619549

* any list
{:toc}
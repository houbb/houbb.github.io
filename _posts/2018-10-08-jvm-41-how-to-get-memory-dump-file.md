---
layout: post
title: jvm-41-java 如何获取 jvm memory dump jvm 内存的转存文件？  jmap / jcmd /  
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

# Java堆转储Dump文件的几种方法

在本文中，我们将展示用Java捕获堆转储的不同方法。

堆转储是JVM内存中某一时刻所有对象的快照。它们对于解决内存泄漏问题和优化Java应用程序中的内存使用非常有用。

堆文件通常以二进制格式存储。我们可以使用jhat或JVisualVM之类的工具打开和分析这些文件。另外，对于Eclipse用户来说，使用MAT是非常常见的。

下面我们将介绍生成堆转储的多种工具和方法，并将展示它们之间的主要区别。

# JDK 工具

JDK附带了几种工具，可以以不同的方式捕获堆转储。所有这些工具都位于JDK文件夹下的主目录中。

因此，只要这个目录包含在系统路径中，我们就可以从命令行启动它们。

## Jmap

jmap是一种打印运行JVM内存统计信息的工具。我们可以将其用于本地或远程进程。

要使用jmap捕获堆转储，我们需要使用dump选项：

`jmap-dump:[live]，格式=b，file=<file path><pid>`

除了这个选项，我们还应该指定几个参数：

live：如果设置，则只打印具有活动引用的对象，并丢弃准备进行垃圾收集的对象。此参数是可选的

format=b：指定转储文件将采用二进制格式

file：将写入转储的文件

pid:Java进程的id

例如：

```sh
jmap -dump:live,format=b,file=/tmp/dump.hprof 12587
```

我们可以通过使用jps命令轻松获得Java进程的pid。

请记住，jmap是作为实验工具引入JDK中的，它不受支持。

因此，在某些情况下，最好使用其他工具。

## Jcmd

jcmd是一个非常完整的工具，它通过向JVM发送命令请求来工作。

我们必须在运行Java进程的同一台机器上使用它。

它的许多命令之一是GC.heap_dump. 我们只需指定进程的pid和输出文件路径，就可以使用它获取堆转储：

```sh
jcmd <pid> GC.heap_dump <file-path>
```

我们可以在执行之前使用相同的参数：

```sh
jcmd 12587 GC.heap_dump /tmp/dump.hprof
```

与jmap一样，生成的转储是二进制格式的。

# JVisualVM

JVisualVM是一个带有图形用户界面的工具，它允许我们监视、排除故障和分析Java应用程序。

图形用户界面很简单，但非常直观，易于使用。

它的许多选项之一允许我们捕获堆转储。如果我们右键单击Java进程并选择“堆转储”选项，该工具将创建一个堆转储并在新选项卡中打开它：

![JVisualVM](https://uploadfiles.nowcoder.com/images/20210408/858838406_1617835658406_E899A3290460D42FABAFB5541C2F9A74)

注意，我们可以在“基本信息”部分找到创建的文件的路径。

从jdk9开始，visualvm不包括在oracle jdk和open jdk发行版中。

因此，如果我们使用java9或更新版本，我们可以从visualvm开源项目站点获得JVisualVM。

# 自动捕获堆转储

我们在前面几节中展示的所有工具都是为了在特定时间手动捕获堆转储。

在某些情况下，我们希望在java.lang.OutOfMemoryError因此它有助于我们调查错误。

对于这些情况，Java提供HeapDumpOnOutOfMemoryError命令行选项，当java.lang.OutOfMemoryError抛出：

```
java-XX:+HeapDumpOnOutOfMemoryError
```

默认情况下，它将转储存储在运行应用程序的目录下的 `java_pid<pid>.hprof` 文件中。

如果要指定另一个文件或目录，可以在HeapDumpPath选项中进行设置：

`java-XX:+HeapDumpOnOutOfMemoryError-XX:HeapDumpPath=<file or dir path>`

当应用程序使用此选项耗尽内存时，我们将能够在日志中看到创建的包含堆转储的文件：

```
java.lang.OutOfMemoryError: Requested array size exceeds VM limit
Dumping heap to java_pid12587.hprof ...
Exception in thread "main" Heap dump file created [4744371 bytes in 0.029 secs]
java.lang.OutOfMemoryError: Requested array size exceeds VM limit
    at com.baeldung.heapdump.App.main(App.java:7)
```

在上面的示例中，它被写入java_pid12587.hprof文件。

正如我们所看到的，这个选项非常有用，并且在使用这个选项运行应用程序时没有开销。

因此，强烈建议始终使用此选项，特别是在生产中。

最后，还可以在运行时通过使用热点诊断MBean指定此选项。

为此，我们可以使用JConsole并将heapdumpOnAutoFMMemoryError VM选项设置为true：

![JConsole](https://uploadfiles.nowcoder.com/images/20210408/858838406_1617835658686_0A5CC5F90D82FB6486688EC330613D46)

# JMX

本文将介绍的最后一种方法是使用JMX。我们将使用上一节中简要介绍的热点诊断MBean。

此MBean提供接受2个参数的dumpHeap方法：

outputFile：转储文件的路径。该文件应具有hprof扩展名

live：如果设置为true，它只转储内存中的活动对象，正如我们以前在jmap中看到的那样

在下一节中，我们将展示两种不同的方法来调用此方法以捕获堆转储。

# JConsole

使用热点诊断MBean的最简单方法是使用JConsole等JMX客户机。

如果我们打开JConsole并连接到一个正在运行的Java进程，我们可以导航到MBeans选项卡并在下面找到热点诊断com.sun.management 。

在操作中，我们可以找到前面描述过的dumpHeap方法：

![JConsole](https://uploadfiles.nowcoder.com/images/20210408/858838406_1617835658930_B4BA82E68FAE5F497C064026E2480455)

如图所示，我们只需要在p0和p1文本字段中引入参数outputFile和live，以便执行dumpHeap操作。

# 程序化方式

使用热点诊断MBean的另一种方法是从Java代码以编程方式调用它。

为此，我们首先需要获取一个MBeanServer实例，以便获得在应用程序中注册的MBean。

之后，我们只需要获取一个热点DiagnosticXbean的实例并调用其dumpHeap方法。

让我们看看代码：

```java
public static void dumpHeap(String filePath, boolean live) throws IOException {
    MBeanServer server = ManagementFactory.getPlatformMBeanServer();
    HotSpotDiagnosticMXBean mxBean = ManagementFactory.newPlatformMXBeanProxy(
      server, "com.sun.management:type=HotSpotDiagnostic", HotSpotDiagnosticMXBean.class);
    mxBean.dumpHeap(filePath, live);
}
```

请注意，不能覆盖hprof文件。因此，我们在创建打印堆转储的应用程序时应该考虑到这一点。

如果我们不能这样做，我们将得到一个例外：

```java
Exception in thread "main" java.io.IOException: File exists
    at sun.management.HotSpotDiagnostic.dumpHeap0(Native Method)
    at sun.management.HotSpotDiagnostic.dumpHeap(HotSpotDiagnostic.java:60)
```

# 结论

在本教程中，我们展示了用Java捕获堆转储的多种方法。

根据经验，在运行Java应用程序时，我们应该记住始终使用HeapDumpOnOutOfMemoryError选项。

出于其他目的，只要记住jmap的不受支持状态，其他任何工具都可以完美地使用。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[Java堆转储Dump文件的几种方法](https://blog.nowcoder.net/n/0aae9acaa6c14aafb505d37fc6a7f4ec)

* any list
{:toc}
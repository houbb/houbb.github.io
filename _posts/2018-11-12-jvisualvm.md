---
layout: post
title: jvisualvm java 性能分析工具
date:  2018-11-12 21:22:26 +0800
categories: [JVM]
tags: [jvm, tool, sh]
published: true
---

# jvisualvm

Java VisualVM是一个直观的图形用户界面，可在指定的Java虚拟机（JVM）上运行时提供有关基于Java技术的应用程序（Java应用程序）的详细信息。 Java VisualVM这个名称源于Java VisualVM可视化地提供有关JVM软件的信息。

Java VisualVM将多个监视，故障排除和分析实用程序组合到一个工具中。例如，独立工具jmap，jinfo，jstat和jstack提供的大多数功能都集成到Java VisualVM中。其他功能（例如jconsole命令提供的功能）可以添加为可选插件。

Java VisualVM对Java应用程序开发人员有用，可以对应用程序进行故障排除，并监视和改进应用程序的性能。 

Java VisualVM使开发人员能够生成和分析堆转储，跟踪内存泄漏，执行和监视垃圾收集，以及执行轻量级内存和CPU分析。

您可以使用插件扩展Java VisualVM功能。例如，jconsole命令的大多数功能都可以通过MBeans选项卡和JConsole插件包装器插件获得。

您可以通过选择Tools，然后选择Java VisualVM菜单中的Plugins，从标准Ja​​va VisualVM插件目录中进行选择

# 下载安装

[visualvm](https://visualvm.github.io/) is a visual tool integrating commandline JDK tools and lightweight profiling capabilities.

Designed for both development and production time use.

## Download

VisualVM is distributed as a standalone tool at GitHub, and as an optional component of the GraalVM. 

Both are the same bits with the same features. Standalone tool runs on any compatible JDK, component is configured to run using the host GraalVM.

VisualVM has also been distributed in Oracle JDK 6~8 as Java VisualVM. It has been discontinued in Oracle JDK 9. 

See the Upgrading Java VisualVM page to learn how to upgrade to the latest VisualVM. 

## 插件整合

> [https://visualvm.github.io/idesupport.html](https://visualvm.github.io/idesupport.html)

# 使用方式

打开文件夹:

```
cd D:\tool\Java\jdk1.8.0_102\bin 
```

直接命令行输入

```
jvisualvm
```

即可。


# 监控进程

## java

我们使用 idea 启动一个单元测试。

## 启动 jvisualvm

可以在首页。【应用程序】-【本地】看到我们启动的应用进程。

![首页](https://img-blog.csdnimg.cn/669115c415cf4848a2763a6526234de0.png#pic_center)

选择点击打开，可以进行监控分析。

# jvisualvm 几个特性

打开之后，右边有几个特性

## 概述

基本的 jvm 等信息

```
PID: 16264
主机: localhost
主类: com.intellij.rt.junit.JUnitStarter
参数: -ideVersion5 -junit4 com.github.houbb.chars.scan.benchmark.CharsScanBsHelperBenchmarkTest,testWTimes

JVM: Java HotSpot(TM) Client VM (25.102-b14, mixed mode)
Java: 版本 1.8.0_102, 供应商 Oracle Corporation
Java Home 目录: C:\Program Files (x86)\Java\jdk1.8.0_102\jre
JVM 标志: <无>

出现 OOME 时生成堆 dump: 禁用
```

## 监视

可以看到 cpu/堆内存 等信息。

![监视](https://img-blog.csdnimg.cn/e1b01e1ce2fc4812bca1b60c29e19c30.png#pic_center)

## 线程

各种线程信息

## 抽样器

抽样可以选择 CPU、内存。

### CPU

可以看到对应执行方法的耗时情况。

![CPU](https://img-blog.csdnimg.cn/cccf72fa0c5e43e2877a2497d988ee70.png#pic_center)

这样我们优化程序的思路也就有了。

### 内存

当然也可以实时分析对应的内存情况。

## profiler 

可以用于分析。

# 参考资料

https://docs.oracle.com/javase/8/docs/technotes/tools/unix/jvisualvm.html

[jvisualvm 工具使用](https://www.cnblogs.com/kongzhongqijing/articles/3625340.html)

[使用 VisualVM 进行性能分析及调优](https://www.ibm.com/developerworks/cn/java/j-lo-visualvm/)

* any list
{:toc}
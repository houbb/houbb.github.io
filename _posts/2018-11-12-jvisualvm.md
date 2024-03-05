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

## 修改配置文件大小

有时候配置 jvm 太小，可能导致 dump 文件打不开。

jvisual（Java VisualVM）导入dump文件内存不足解决办法：

当通过jvusual调整-Xmx参数：

c:/program files/java/jdk1.6/lib/visualvm/etc/visualvm.conf

修改内容：

```
-J-Xmx24m -J-Xmx256m
```

改为：

```
-J-Xmx4096m -J-Xmx4096m
```

验证办法：

重新打开jvisual，点击“本地”--VisualVM，查看JVM参数是否更新。

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

# 插件介绍 

VisualVM功能可以通过官方和第三方插件轻松扩展。

使用Tools | Plugins | Available Plugins从VisualVM Plugins Center下载插件。这里有IDE集成插件。

要在离线环境中扩展VisualVM功能，请在plugins Centers页面获取插件，并使用Tools | plugins | downloads安装它们。

由于VisualVM 2.0的变化，一些第三方插件可能无法工作。请联系他们的供应商并要求更新。

## mbean浏览器-MBeans Browser

MBeans Browser插件提供了类似于JConsole中的MBeans Browser的功能:显示应用程序的MBeans，显示值、操作和通知。

在VisualVM中，浏览器得到了进一步改进，以提供更好的可用性和对最新JMX特性的支持。

## 可视化GC插件-Visual GC Plugin

可视化垃圾收集监控工具集成到VisualVM中。

Visual GC附加到应用程序上，收集并图形化显示垃圾收集、类加载器和HotSpot编译器性能数据。有关详细信息，请参见Visual GC工具页面。

## Tracer

用于详细监视和分析Java应用程序的框架和GUI。

Tracer使用各种探针从应用程序收集指标，并在时间轴中显示数据。

数据以图形和表格两种形式显示，并且可以导出为通用格式，以便外部工具进行进一步处理。

## Kill Application

Kill Application 插件允许轻松地杀死一个监控进程，活着或死锁，只需一个单一的鼠标点击。

最后，它对没有响应的进程使用硬终止。

## 启动分析器

Startup Profiler插件可以从本地Java 5+应用程序启动时就对其进行仪器化分析，并帮助分析短时间运行的进程。

有关更多详细信息，请参阅Startup Profiler插件页面。

## 其他插件:

Go To Source: 增加了对在VisualVM中开源代码的支持。有关详细信息，请参阅源代码支持页面。

Threads Inspector: 可以在线程选项卡中分析一个或多个线程的堆栈跟踪。

Buffer Monitor: 监视ByteBuffer创建的直接缓冲区的使用情况。分配直接和映射缓冲区由filecchannel.map创建。

Security: 用于在VisualVM中设置SSL/TLS连接的密钥库、信任库、协议和密码的GUI，相当于设置适当的系统属性javax.net.ssl.*和javax.rmi.ssl.client.*

OQL Syntax Support: HeapWalker中OQL控制台的增强编辑器，提供语法着色和基本的代码完成。

JConsole Plugins Container: 支持在VisualVM中使用现有的JConsole插件(如JTop)。

VisualVM Extensions: 支持在VisualVM发布时VisualVM核心模块不支持的附加功能(如新的jdk、jvm、HotSpot版本等)。

## 第三方插件:

BTrace插件: 支持直接从VisualVM创建、部署和保存BTrace脚本。

Coherence插件: 为启用JMX的Coherence集群总结统计数据和信息。

CRaSH插件: 在VisualVM (VisualVM 1)中支持Java平台的CRaSH开源shell x

TDA插件: 线程转储分析器是一个GUI，用于分析Java虚拟机生成的线程转储。

# 参考资料

https://docs.oracle.com/javase/8/docs/technotes/tools/unix/jvisualvm.html

[jvisualvm 工具使用](https://www.cnblogs.com/kongzhongqijing/articles/3625340.html)

[使用 VisualVM 进行性能分析及调优](https://www.ibm.com/developerworks/cn/java/j-lo-visualvm/)

https://visualvm.github.io/

* any list
{:toc}
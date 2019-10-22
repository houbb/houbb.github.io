---
layout: post
title: jvisualvm
date:  2018-11-12 21:22:26 +0800
categories: [SQL]
tags: [sql, ex, sh]
published: true
excerpt: jvisualvm 入门介绍
---

# jvisualvm

Java VisualVM是一个直观的图形用户界面，可在指定的Java虚拟机（JVM）上运行时提供有关基于Java技术的应用程序（Java应用程序）的详细信息。 Java VisualVM这个名称源于Java VisualVM可视化地提供有关JVM软件的信息。

Java VisualVM将多个监视，故障排除和分析实用程序组合到一个工具中。例如，独立工具jmap，jinfo，jstat和jstack提供的大多数功能都集成到Java VisualVM中。其他功能（例如jconsole命令提供的功能）可以添加为可选插件。

Java VisualVM对Java应用程序开发人员有用，可以对应用程序进行故障排除，并监视和改进应用程序的性能。 

Java VisualVM使开发人员能够生成和分析堆转储，跟踪内存泄漏，执行和监视垃圾收集，以及执行轻量级内存和CPU分析。

您可以使用插件扩展Java VisualVM功能。例如，jconsole命令的大多数功能都可以通过MBeans选项卡和JConsole插件包装器插件获得。

您可以通过选择Tools，然后选择Java VisualVM菜单中的Plugins，从标准Ja​​va VisualVM插件目录中进行选择


# 使用方式

直接命令行输入

```
jvisualvm
```

即可。

# 参考资料

https://docs.oracle.com/javase/8/docs/technotes/tools/unix/jvisualvm.html

[jvisualvm 工具使用](https://www.cnblogs.com/kongzhongqijing/articles/3625340.html)

[使用 VisualVM 进行性能分析及调优](https://www.ibm.com/developerworks/cn/java/j-lo-visualvm/)

* any list
{:toc}
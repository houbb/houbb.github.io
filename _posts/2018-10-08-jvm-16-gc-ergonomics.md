---
layout: post
title: JVM16--GC Ergonomics 人体工程学
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, sh]
published: true
---

# 人机工程学(Ergonomics)

人机工程学是Java虚拟机（JVM）和垃圾收集启发式（例如基于行为的启发式）提高应用程序性能的过程。

JVM为垃圾收集器，堆大小和运行时编译器提供与平台相关的默认选择。 

这些选择符合不同类型应用程序的需求，同时需要较少的命令行调整。 

此外，基于行为的调优动态地优化堆的大小以满足应用程序的指定行为。

本节介绍这些默认选择和基于行为的调整。 

在使用后续部分中描述的更详细控件之前，请使用这些默认值。

# 垃圾收集器，堆和运行时编译器默认选择

以下是有关垃圾收集器，堆大小和运行时编译器默认选择的信息。

- 被称为服务器级机器的一类机器被定义为具有以下内容的机器：

两个或更多物理处理器

两个或更多GB的物理内存

- 在服务器级计算机上，默认情况下选择以下内容：

Garbage-First（G1）收集器

初始堆大小为物理内存的1/64

最大堆大小为物理内存的1/4

分层编译器，使用C1和C2

## 实战

### 查看机器基础信息

linux 系统为例

- jdk 版本

```
java -version
```

本机为 1.8

- 查看核数

```
cat /proc/cpuinfo | grep "physical id" | uniq | wc -l
```

结果为 4 核

- 查看内存

```
free -h
```

如下，内存为 8G

```
             total       used       free     shared    buffers     cached
Mem:          7.7G       6.1G       1.6G       192K       194M       1.5G
-/+ buffers/cache:       4.4G       3.3G
Swap:           9G       584K         9G
```

- 查看是 32/64 位

```
getconf LONG_BIT
```

本机为 64 位

### XXFox 推荐参数

```
-Xmx5440M -Xms5440M -XX:MaxMetaspaceSize=512M -XX:MetaspaceSize=512M -XX:+UseG1GC -XX:MaxGCPauseMillis=100 -XX:+ParallelRefProcEnabled
```

# 基于行为的调整

可以将Java HotSpot VM垃圾收集器配置为优先满足两个目标之一：最大暂停时间和应用程序吞吐量。

如果满足首选目标，收藏家将尝试最大化另一个目标。当然，这些目标并不总能得到满足：应用程序需要最少的堆来保存至少所有实时数据，而其他配置可能会妨碍达到部分或全部目标。

## 最大暂停时间目标

暂停时间是垃圾收集器停止应用程序并恢复不再使用的空间的持续时间。最大暂停时间目标的意图是限制这些暂停的最长时间。

垃圾收集器维持平均停顿时间和平均时差。

平均值是从执行开始时开始的，但是它的加权使得最近的暂停计数更加严重。如果平均加上暂停时间的方差大于最大暂停时间目标，则垃圾收集器认为目标未得到满足。

使用命令行选项 `-XX:MaxGCPauseMillis=<nnn>` 指定最大暂停时间目标。

这被解释为对垃圾收集器的暗示，希望暂停时间`<nnn>`毫秒或更少。

垃圾收集器调整Java堆大小和与垃圾收集相关的其他参数，以试图使垃圾收集暂停时间小于`<nnn>`毫秒。

最大暂停时间目标的默认值因收集器而异。这些调整可能导致垃圾收集更频繁地发生，从而降低了应用程序的整体吞吐量。

但是，在某些情况下，无法满足所需的暂停时间目标。

## 吞吐量目标

吞吐量目标是根据收集垃圾所花费的时间来衡量的，而在垃圾收集之外花费的时间是应用时间。

目标由命令行选项 `XX:GCTimeRatio=nnn` 指定。

垃圾收集时间与应用时间的比率为 1/(1 + nnn)。

例如，`XX:GCTimeRatio=19` 设置目标为垃圾收集总时间的1/20或5％。

垃圾收集所花费的时间是所有垃圾收集引起的暂停的总时间。如果未满足吞吐量目标，则垃圾收集器的一个可能操作是增加堆的大小，以便在收集暂停之间在应用程序中花费的时间可以更长。

## 脚印(Footprint)

如果已满足吞吐量和最大暂停时间目标，则垃圾收集器会减小堆的大小，直到无法满足其中一个目标（总是吞吐量目标）。

可以使用 `-Xms=<nnn>` 和 `-Xmx=<mmm>` 分别设置垃圾收集器可以使用的最小和最大堆大小，以获得最小和最大堆大小。

# 调整策略

堆增大或缩小到支持所选吞吐量目标的大小。

了解堆调整策略，例如选择最大堆大小以及选择最大暂停时间目标。

**除非您知道需要的堆大于默认的最大堆大小，否则不要为堆选择最大值。选择足以满足您应用的吞吐量目标。**

应用程序行为的更改可能导致堆增长或缩小。例如，如果应用程序开始以更高的速率分配，则堆增长以保持相同的吞吐量。

如果堆增长到其最大大小并且未满足吞吐量目标，则最大堆大小对于吞吐量目标而言太小。

将最大堆大小设置为接近平台上的总物理内存的值，但不会导致应用程序的交换。再次执行应用程序。如果仍未满足吞吐量目标，则应用程序时间的目标对于平台上的可用内存来说太高。

如果可以满足吞吐量目标，但暂停时间过长，则选择最大暂停时间目标。选择最大暂停时间目标可能意味着您的吞吐量目标将无法满足，因此请选择对应用程序而言可接受的折衷的值。

当垃圾收集器试图满足竞争目标时，堆的大小通常会振荡。即使应用程序已达到稳定状态，也是如此。实现吞吐量目标（可能需要更大的堆）的压力与最大暂停时间和最小占用空间（两者都可能需要小堆）的目标竞争。

# 参考资料

https://docs.oracle.com/javase/9/gctuning/ergonomics.htm#JSGCT-GUID-DB4CAE94-2041-4A16-90EC-6AE3D91EC1F1

* any list
{:toc}
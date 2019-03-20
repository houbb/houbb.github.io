---
layout: post
title: JVM-Shenandoah GC-29
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, sh]
published: true
---

# JDK 12 如期而至

[jdk12 下载地址](https://www.oracle.com/technetwork/java/javase/downloads/index.html)

# Shenandoah GC 

则是很有现实意义度 Shenandoah GC。它是 Redhat 主导开发的 Pauseless GC 实现，从大概 2013 年开始研发，终于取得了重要的阶段性成果，与其他 Pauseless GC 类似。

**Shenandoah GC 主要目标是 99.9% 的暂停小于 10ms，暂停与堆大小无关等。**

也许了解 Shenandoah GC 的人比较少，业界声音比较响亮的是 Oracle 在 JDK11 中开源出来的 ZGC，或者商业版本的 Azul C4（Continuously Concurrent Compacting Collector）。但是，笔者认为，至少目前，其实际意义大于后两者，因为：

使用 ZGC 的最低门槛是升级到 JDK11，对很多团队来说，这种版本的跳跃并不是非常低成本的事情，更何况是尚不清楚 ZGC 在自身业务场景中的实际表现如何。

而 C4，毕竟是土豪们的选择，现实情况是，有多少公司连个几十块钱的 License 都不舍得…

而 Shenandoah GC 可是有稳定的 JDK8u 版本发布的哦，据我所知已经有个别公司在 HBase 等高实时性产品中实践许久。

# 原理

从原理的角度，我们可以参考该项目官方的示意图，其内存结构与 G1 非常相似，都是将内存划分为类似棋盘的 region。

整体流程与 G1 也是比较相似的，最大的区别在于实现了并发的 Evacuation 环节，引入的 Brooks Forwarding Pointer 技术使得 GC 在移动对象时，对象引用仍然可以访问。

![shenandoah-gc-cycle](http://cr.openjdk.java.net/~shade/shenandoah/shenandoah-gc-cycle.png)

# 性能对比

下面是 jbb15 benchmark 中，Shenandoah GC 相对于其他主流 GC 的表现，GC 暂停相比于 CMS 等选择有数量级程度的提高，对于 GC 暂停非常敏感的场景，价值还是很明显的，能够在 SLA 层面有显著提高。

当然，这种对于低延迟的保证，也是以消耗 CPU 等计算资源为代价的，实际吞吐量表现也不是非常明朗，需要看企业的实际场景需求，并不是一个一劳永逸的解决方案。

![specjbb-preset4K-10min](http://cr.openjdk.java.net/~shade/shenandoah/specjbb-preset4K-10min.png)

# 参考资料

[JEP 189: Shenandoah: A Low-Pause-Time Garbage Collector (Experimental)](http://openjdk.java.net/jeps/189)

[官方核心 GC 原理](https://wiki.openjdk.java.net/display/shenandoah/Main)

https://shipilev.net/talks/vmm-Sep2017-shenandoah.pdf


* any list
{:toc}
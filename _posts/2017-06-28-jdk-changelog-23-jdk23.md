---
layout: post
title: java 变更日志-23-jdk23
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)


# GraalVm jdk23

### 宣布 GraalVM 支持 JDK 23

Graal 团队很高兴地宣布，Oracle GraalVM 已经正式支持 JDK 23。除了对 JDK 23 的支持外，本版本还对原生镜像（Native Image）进行了许多增强，提升了提前编译生成的可执行文件的大小、内存使用和吞吐量的调优。本版本还是首次提供对在 Java 中嵌入 Python 和 WebAssembly 的生产环境支持，且支持完整的即时编译（JIT），以确保出色的性能。

### 原生镜像（Native Image）

Oracle GraalVM for JDK 23 增加了一个新的选项，用于最小化编译后可执行文件的大小，并对串行垃圾回收器（Serial GC）进行了改进，以支持内存受限的应用程序。

#### 优化可执行文件的大小

在将应用程序编译为本地机器代码时，可以使用 `-O` 命令行选项控制代码优化的级别，值范围从 0（无优化）到 3（应用所有可用优化）。优化级别越低，编译时间越短，但性能可能会较慢。更多的优化可能会导致生成的可执行文件更大，这部分是由于代码内联（code inlining）造成的。

此外，还有一些特殊的优化级别，例如 `-Ob`（快速构建），通过避免一些耗时的优化来加速构建过程。生成的可执行文件可能会稍大，因此不推荐用于生产部署，但在开发过程中，构建时间比吞吐量和文件大小更重要时，这个选项非常有用。

在 JDK 23 版本中，Oracle GraalVM 增加了新的 `-Os` 优化级别，该选项通过跳过增加代码大小的特定优化，最小化生成的可执行文件的大小。这个选项对于在容器中或小型设备上部署应用程序非常有用，特别是当磁盘空间有限时。

你可以在 [Native Image Optimization Levels](https://www.graalvm.org/docs/reference-manual/native-image/#optimization-levels) 了解更多信息。

#### 优化内存使用

为了支持不同的使用场景，Oracle GraalVM 原生镜像支持三种垃圾回收实现：

- **G1 GC**：适用于具有较大堆内存的应用程序，具有低延迟特性。
- **Epsilon GC**：不进行垃圾回收，适合短生命周期的应用程序，如命令行工具。
- **Serial GC**：适合具有小堆内存的应用程序。

在 GraalVM for JDK 23 中，串行垃圾回收器（Serial GC）得到了增强，增加了一个实验性的标记和压缩收集器选项，进一步减少了应用程序所需的总内存量（即最大 RSS）。这个新收集器可以将垃圾回收内存开销减少 50%。带有新标记和压缩收集器的串行垃圾回收器非常适合内存受限的容器应用程序。要启用此选项，在使用 `native-image` 工具生成可执行文件时，添加 `-H:+CompactingOldGen` 选项。

### Python 和 WebAssembly

自 2019 年推出以来，Oracle GraalVM 一直支持 GraalJS，这是一个符合 ECMAScript 标准的 JavaScript 实现。通过 GraalJS，Java 应用程序可以嵌入和调用 JavaScript 模块。在 Oracle GraalVM for JDK 23 版本中，GraalJS 与 GraalPy 和 GraalWasm 一起，分别提供了对 Python 和 WebAssembly（WASM）嵌入的支持。

- **GraalPy** 使得在 Java 应用程序中可以利用流行的 Python 包，包括用于机器学习的库。
- **GraalWasm** 提供了对 WebAssembly 的类似嵌入支持。通过 GraalWasm，可以集成并调用编译为 WASM 的 C、C++、Rust、Go 和其他语言的库。

尽管 WebAssembly 仍在不断发展中，GraalWasm 提供了出色的功能支持。得益于 GraalVM 的先进编译技术，JavaScript、Python 和 WASM 都通过 Graal JIT 编译器动态编译为本地机器代码，确保了卓越的性能和与 Java 的互操作性。

### 了解更多

有关 Oracle GraalVM for JDK 23 版本的技术细节，请查看开发者博客、发布说明和文档。

如果想了解最新的新闻，您可以通过 X（Twitter）和 LinkedIn 关注 GraalVM。

Oracle GraalVM 包含在 Oracle Java SE 订阅中，并且在 Oracle Cloud Infrastructure 上使用时无需额外费用。今天就下载最新版本！

# 参考资料

https://blogs.oracle.com/java/post/the-arrival-of-java-22


* any list
{:toc}
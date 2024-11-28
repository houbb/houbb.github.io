---
layout: post
title: jvm-44-jvm 内存性能分析工具 Eclipse Memory Analyzer Tool (MAT) / 内存分析器 (MAT)
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, thread, sh]
published: true
---

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[jvm-44-jvm 内存性能分析工具 Eclipse Memory Analyzer Tool (MAT) / 内存分析器 (MAT)](https://houbb.github.io/2018/10/08/jvm-44-dump-file-analysis-mat)

[jvm-45-jvm dump 文件内存介绍+获取方式+堆内存可视分析化工具](https://houbb.github.io/2018/10/08/jvm-45-dump-file-analysis-visual)

[jvm-46-jvm Thread Dump 线程的堆栈跟踪信息+获取方式+可视分析化工具 FastThread](https://houbb.github.io/2018/10/08/jvm-46-dump-thread-file-analysis-visual)

[jvm-47-jvm GC 垃圾回收日志+获取方式+可视分析化工具 gcviewer](https://houbb.github.io/2018/10/08/jvm-47-gc-file-analysis-visual)

[jvisualvm java 性能分析工具](https://houbb.github.io/2018/11/12/jvisualvm)

# 场景 

JVM DUMP 文件应该如何分析？

[jvisualvm java 性能分析工具](https://houbb.github.io/2018/11/12/jvisualvm)

# 内存分析器 (MAT)  

[Eclipse Memory Analyzer](https://eclipse.dev/mat/) 是一个快速且功能丰富的 Java 堆分析工具，帮助你查找内存泄漏并减少内存消耗。

使用内存分析器可以分析包含数亿个对象的堆转储，快速计算对象的保留大小，查看哪些对象阻止了垃圾回收器回收，运行报告自动提取内存泄漏嫌疑对象。

## 链接  

[下载最新版本的 RCP 应用程序](https://eclipse.dev/mat/downloads.php)。  

[阅读我们的博客了解背景信息](https://memoryanalyzer.blogspot.in/)。  

[在论坛上提出你的问题](https://www.eclipse.org/forums/eclipse.memory-analyzer)。  

## 新闻  

**2024 年 5 月 8 日，Memory Analyzer 迁移至 Github**

Memory Analyzer 的代码库已从 Eclipse Git 服务器迁移至 Github：https://github.com/eclipse-mat/mat。  

随着这次迁移，项目也从使用 Eclipse Bugzilla 转为在 MAT 的 Github 项目上使用 Github Issues。  

我们对这次迁移非常高兴，不过在更新所有指向 Eclipse 旧仓库的链接时可能需要一些时间。如果你发现我们遗漏的地方，请提供反馈！  

**2023 年 12 月 6 日，Memory Analyzer 1.15.0 版本发布**  

Memory Analyzer 1.15.0 版本现已可供下载。请查看“新功能与改进”页面，了解新功能和修复内容，包括安全修复。发布记录中还有更多详细信息。

# chat

## 详细介绍一下 MAT

**Eclipse Memory Analyzer Tool (MAT)** 是一个强大的 Java 堆内存分析工具，常用于分析 Java 内存转储（heap dump），帮助开发者找到内存泄漏、检查大对象等问题。以下是对 MAT 的详细介绍，包括其核心功能、使用场景以及分析步骤。

### 1. **MAT 的核心功能**
   - **查找内存泄漏**：MAT 通过分析 heap dump，可以帮助发现潜在的内存泄漏点，特别是无法被垃圾回收的对象。
   - **识别大对象**：MAT 可以快速识别占用大量内存的对象及其引用路径，帮助优化应用程序的内存使用。
   - **分析对象保留集**：通过计算每个对象的保留大小（retained size），MAT 可以帮助确定哪些对象或对象树最为消耗内存。
   - **生成报告**：MAT 可以自动生成问题分析报告，给出可能的内存泄漏或对象过大等问题的总结，并提供详细的建议。

### 2. **常见使用场景**
   - **内存泄漏排查**：在应用程序出现 OutOfMemoryError 错误或内存消耗异常时，MAT 是分析堆转储、查找泄漏原因的利器。
   - **优化内存使用**：MAT 能帮助你识别内存使用的热点对象，帮助改进代码以减少内存消耗。
   - **分析应用的生命周期内存模式**：了解应用程序的内存分配情况，帮助开发者优化对象的生命周期管理，避免内存问题。
   - **调试内存泄漏测试**：在模拟压力测试或性能测试时，可以生成 heap dump 并使用 MAT 来确定内存使用的瓶颈。

### 3. **MAT 的基本分析步骤**

#### **步骤 1: 获取 heap dump**
   - **生成 heap dump**：在 Java 应用程序中，可以通过多种方式生成 heap dump，如通过 JVM 参数 `-XX:+HeapDumpOnOutOfMemoryError`，或手动触发 `jmap` 命令生成 heap dump：
     ```bash
     jmap -dump:live,format=b,file=heapdump.hprof <pid>
     ```

#### **步骤 2: 加载 heap dump**
   - 打开 MAT 工具，并通过“File -> Open Heap Dump”加载生成的 `.hprof` 文件。
   - MAT 支持各种格式的 heap dump，包括 JVM 生成的 HPROF 格式和其他第三方工具生成的格式。

#### **步骤 3: 基本内存分析**
   - **Overview**：MAT 会生成内存使用的概要报告，其中包括：
     - **Histogram**：列出所有类的实例数和占用内存大小的直方图。通过它可以快速找到占用内存最多的类。
     - **Dominator Tree**：MAT 通过分析对象的引用关系生成主导者树（dominator tree），帮助你理解哪些对象是内存中的主要占用者。
   
#### **步骤 4: 定位问题**
   - **Leak Suspects Report**：MAT 提供的“Leak Suspects”报告会自动分析潜在的内存泄漏点。通过该报告，MAT 会列出可能导致内存泄漏的对象及其引用路径。
   - **Top Consumers**：分析内存消耗最多的对象，帮助确定内存热点。
   - **查找引用链**：通过 "Merge Shortest Paths to GC Roots" 功能，你可以找到从垃圾收集器根节点（GC Roots）到目标对象的最短引用链，以确定导致对象无法被回收的原因。

#### **步骤 5: 深入分析**
   - **Retained Size 和 Shallow Size**：
     - **Shallow Size**：对象本身占用的内存大小。
     - **Retained Size**：如果该对象被回收，那么所有因该对象而无法被回收的对象所占用的总内存大小。通过 retained size，可以帮助你找到哪些对象影响了最大的内存回收。
   - **Dominators View**：可以帮助你找到哪些对象主导了内存的占用，分析这些对象的引用链，找出阻止垃圾回收的原因。

### 4. **MAT 的高级功能**
   - **OQL 查询**：MAT 支持 OQL（Object Query Language），允许用户通过类 SQL 的语法查询和分析堆内存中的对象。
   
   例如，你可以编写 OQL 查询来查找特定的对象或对象集合：
     ```sql
     SELECT * FROM java.lang.String s WHERE s.value.toString() == "example"
     ```
   - **扩展插件**：MAT 提供了一些扩展插件来增强其功能，比如 SAP Memory Analyzer 中的一些企业级插件，用于分析更复杂的 Java 应用程序。

### 5. **优化 MAT 使用体验**
   - **内存设置**：如果你分析的 heap dump 文件较大（数 GB 以上），MAT 可能会由于内存不足而变得非常慢。
   
   此时，你可以通过增加 MAT 的最大堆内存来提升分析速度。
   
   例如，可以修改启动参数来增加 MAT 的内存：
     ```bash
     mat.ini
     -Xmx4g
     ```

   - **分步骤分析**：如果 heap dump 文件过大，可以先通过直方图分析具体类的内存占用情况，找到内存占用较大的类或实例，再逐步深入到对象引用链的分析。

### 6. **与其他工具的对比**
   - **JVisualVM**：JVisualVM 是一个更轻量的 JVM 分析工具，适合实时监控和简单的 heap dump 分析。MAT 则提供了更强大的分析功能，尤其适合深入的内存问题排查。

   - **YourKit**：YourKit 提供了强大的 Java 性能和内存分析功能，但属于商业软件，而 MAT 是开源免费的。

### 总结

MAT 是 Java 内存分析的利器，能够通过详细的内存使用分析帮助开发者快速定位问题，如内存泄漏和对象持有关系。

它的强大之处在于自动化报告、对象引用分析和多种高级功能的支持，适合处理大型 heap dump 文件。


## MAT 和 JVisualVM 对比有什么优缺点？

MAT（Memory Analyzer Tool）和 JVisualVM 是两款常用的 Java 内存分析工具，它们在功能、用途和使用场景上有所不同。

以下是它们的详细对比，包括优缺点分析：

### **1. 工具概述**

- **MAT（Memory Analyzer Tool）**：
  - **特点**：MAT 是一个专门用于分析 Java 堆转储（heap dump）的工具，能够深入分析内存占用、查找内存泄漏、分析对象保留集、生成问题报告等。
  - **适用场景**：MAT 适合详细的堆内存分析，尤其是排查内存泄漏、深度分析内存使用问题等场景。

- **JVisualVM**：
  - **特点**：JVisualVM 是一个用于监控和分析运行中 Java 应用程序的工具。它不仅支持堆内存分析，还支持性能监控、线程分析、GC 活动监控等。可以查看实时的 JVM 运行状态以及生成和分析堆转储。
  - **适用场景**：JVisualVM 更适合实时监控 JVM 的运行状态，分析应用的 CPU、内存、线程等使用情况，适合日常调试和监控。

### **2. 功能对比**

| **功能**           | **MAT**                                | **JVisualVM**                          |
|--------------------|----------------------------------------|----------------------------------------|
| **实时监控**        | 不支持实时监控，只分析堆转储          | 支持实时监控 JVM 性能，包括 CPU、内存、线程、GC 活动等 |
| **堆转储分析**      | 强大的堆转储分析能力，支持深入分析     | 支持堆转储分析，但功能不如 MAT 详细    |
| **内存泄漏检测**    | 自动生成内存泄漏嫌疑报告，提供深入的保留集分析 | 提供基础的内存泄漏分析                 |
| **线程分析**        | 不支持线程分析                         | 支持实时线程分析和线程 dump            |
| **GC 分析**         | 不支持 GC 分析                         | 提供基本的 GC 活动监控                 |
| **对象引用链分析**  | 支持详细的对象引用链分析、保留大小等   | 提供基本的对象引用分析                 |
| **OQL 查询**        | 支持 OQL（Object Query Language）      | 不支持 OQL                             |
| **性能调优**        | 不适合性能调优，专注于内存分析         | 支持实时性能调优                       |

### **3. 优缺点对比**

#### **MAT 的优点**
1. **详细的内存分析**：MAT 可以深入分析堆转储，找到内存泄漏、识别大对象，并详细分析对象的保留集和引用链，适合复杂内存问题的排查。
2. **自动生成报告**：MAT 的“Leak Suspects”报告可以自动检测潜在的内存泄漏点，并生成分析报告，给出详细的内存问题建议。
3. **对象引用分析**：MAT 的 Dominator Tree、Shortest Paths to GC Roots 等功能可以帮助开发者分析哪些对象主导了内存的占用，并快速找到问题对象。
4. **支持大文件分析**：MAT 设计用于处理大型堆转储文件，特别是在分析数 GB 的堆文件时表现优越。

#### **MAT 的缺点**
1. **不支持实时监控**：MAT 无法分析运行中的应用程序，只能分析静态的 heap dump 文件。
2. **较复杂**：MAT 的分析功能强大但复杂，初学者可能需要一定时间来熟悉其操作和报告的含义。
3. **内存消耗较大**：MAT 自身对内存的需求较高，处理大型堆转储时可能需要手动增加 MAT 的 JVM 堆大小。

#### **JVisualVM 的优点**
1. **实时监控**：JVisualVM 支持实时监控运行中的 Java 应用，包括 CPU、内存、线程和 GC 活动，非常适合日常性能监控和调试。
2. **易于使用**：JVisualVM 提供了一个图形化界面，操作简单，适合日常调试、监控和简单的堆内存分析。
3. **多功能支持**：除了内存分析外，JVisualVM 还支持性能监控、线程分析、GC 分析、CPU 使用分析等多项功能，覆盖面较广。

#### **JVisualVM 的缺点**
1. **堆内存分析能力较弱**：虽然支持堆转储分析，但 JVisualVM 的内存分析功能不如 MAT 深入和强大，无法自动生成详细的内存泄漏报告，也不支持高级的对象引用链分析。
2. **无法处理大型 heap dump 文件**：JVisualVM 在处理非常大的堆转储文件时性能可能不佳，且缺乏 MAT 那样的高级优化选项。

### **4. 使用场景对比**

- **使用 MAT 的场景**：
  - 应用出现了内存泄漏问题，需要分析堆转储文件，寻找泄漏根源。
  - 需要详细分析内存中的大对象、对象引用链、保留集等问题。
  - 分析和优化内存使用的热点对象。
  - 应用程序发生 `OutOfMemoryError`，需要深入排查内存占用问题。

- **使用 JVisualVM 的场景**：
  - 需要实时监控 Java 应用的性能，监控 CPU、内存、线程和 GC 活动。
  - 日常性能调优，分析 CPU 使用情况和线程运行情况。
  - 简单的堆转储分析，查看对象占用内存情况。
  - 调试和排查性能问题，例如长时间运行的线程、频繁的 GC 活动等。

### **5. 结论**

- **MAT** 更适合**深入的内存问题分析**，尤其是在面对复杂的内存泄漏、对象引用问题时，MAT 提供了强大的工具和报告来帮助开发者定位问题。它的 OQL 支持和对象引用链分析功能，使其在分析大型堆转储文件时非常有效。
  
- **JVisualVM** 更适合**实时监控和性能调优**，适合日常使用。它的实时分析功能使开发者能够监控应用的运行状态并调优性能，但在内存分析的深度和复杂性上不如 MAT。

总结来说，MAT 在堆转储分析方面功能强大，适合内存问题排查，而 JVisualVM 更适合日常的 JVM 性能监控和调试，两者可以结合使用以满足不同场景的需求。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[Java堆转储Dump文件的几种方法](https://blog.nowcoder.net/n/0aae9acaa6c14aafb505d37fc6a7f4ec)

* any list
{:toc}
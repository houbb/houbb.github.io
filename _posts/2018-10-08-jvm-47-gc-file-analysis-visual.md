---
layout: post
title: jvm-47-jvm GC 日志获取方式+可视分析化工具 GcViewer
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, thread, sh]
published: true
---

# 拓展阅读

[JVM FULL GC 生产问题 I-多线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-37-inaction)

[JVM FULL GC 生产问题 II-如何定位内存泄露？ 线程通用实现](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction2)

[JVM FULL GC 生产问题 III-多线程执行队列的封装实现，进一步抽象](https://houbb.github.io/2018/10/08/jvm-full-gc-38-inaction3)

[jvisualvm java 性能分析工具](https://houbb.github.io/2018/11/12/jvisualvm)

[jvm-44-jvm 内存性能分析工具 Eclipse Memory Analyzer Tool (MAT) / 内存分析器 (MAT)](https://houbb.github.io/2018/10/08/jvm-44-dump-file-analysis-mat)

[jvm-45-jvm dump 文件内存介绍+获取方式+堆内存可视分析化工具](https://houbb.github.io/2018/10/08/jvm-45-dump-file-analysis-visual)

[jvm-46-jvm Thread Dump 线程的堆栈跟踪信息+获取方式+可视分析化工具 FastThread](https://houbb.github.io/2018/10/08/jvm-46-dump-thread-file-analysis-visual)

[jvm-47-jvm GC 日志获取方式+可视分析化工具 GcViewer](https://houbb.github.io/2018/10/08/jvm-47-gc-file-analysis-visual)

[jvm-48-java 变更导致压测应用性能下降，如何分析定位原因？](https://houbb.github.io/2018/10/08/jvm-48-slow-how-to-analysis)

[jvm-49-linux 服务器使用率升高应该如何排查分析？](https://houbb.github.io/2018/10/08/jvm-49-cpu-high-how-to-analysis)

# 是什么？

Java 的垃圾回收（GC）日志提供了关于 JVM 垃圾回收过程的详细信息。

这些日志对于性能调优和分析垃圾回收行为至关重要。

通过 GC 日志，开发者可以了解堆内存的使用情况、垃圾回收的频率、每次 GC 的时间等信息，帮助排查内存泄漏、性能瓶颈等问题。

# 如何获得 GC 日志？

在 Java 8 之前，启用 GC 日志需要设置 `-XX:+PrintGCDetails` 和 `-XX:+PrintGCDateStamps` 等 JVM 参数。

从 Java 9 开始，JVM 提供了统一的 GC 日志格式，可以通过 `-Xlog:gc` 启用日志记录。

## Java 8 之前的方式：

```bash
-XX:+PrintGCDetails -XX:+PrintGCDateStamps
```

## Java 9 及之后的方式：

```bash
-Xlog:gc*:file=gc.log
```

## 常见 GC 日志参数

1. **`-XX:+PrintGCDetails`**  
   打印详细的 GC 信息，包括每个垃圾回收周期的类型、堆的使用情况、GC 前后的堆状态等。

2. **`-XX:+PrintGCDateStamps`**  
   打印 GC 时间戳，帮助你确定垃圾回收的发生时间。

3. **`-XX:+PrintGCTimeStamps`**  
   记录垃圾回收的时间戳。

4. **`-XX:+PrintHeapAtGC`**  
   每次 GC 发生时，打印堆的详细信息（如堆内存大小、使用的内存等）。

5. **`-XX:+PrintGCApplicationStoppedTime`**  
   打印应用程序停顿的时间，尤其是在发生 Stop-the-World 的 GC 时，能够帮助定位性能瓶颈。

6. **`-XX:+PrintTenuringDistribution`**  
   打印年轻代到老年代的对象晋升分布，了解对象的生命周期和对象晋升的时机。

# GC 日志的分析

## GC 日志中的常见输出字段

GC 日志包含多个重要的字段，每个字段对应着不同的 GC 细节，以下是一些常见的字段及其含义：

1. **GC 事件类型**  
   常见的 GC 类型包括：
   - **Minor GC**：年轻代垃圾回收
   - **Full GC**：包括年轻代和老年代垃圾回收，通常需要进行 Stop-the-World 操作
   - **Mixed GC**：G1 垃圾回收器的一种类型，涉及年轻代和部分老年代回收

2. **时间戳**  
   每次 GC 事件的时间。

3. **堆的大小**  
   - **Young Generation**（年轻代）
   - **Old Generation**（老年代）
   - **Permanent Generation**（永久代，Java 8 之后被元空间（Metaspace）替代）

4. **GC 前后的堆内存状态**  
   GC 前后的堆使用情况：包括每个代（年轻代、老年代、元空间）的内存大小、已使用内存和最大内存。

5. **GC 停顿时间**  
   - **Pause Time**：GC 期间应用程序的停顿时间
   - **Application Time**：应用程序执行的时间，通常用于计算总的停顿时间与应用程序的执行时间比例。

6. **GC 执行时间**  
   每次 GC 的执行时间。例如：
   ```text
   [GC (Allocation Failure)  [PSYoungGen: 2048K->512K(3072K)] 1024K->512K(4096K), 0.0012345 secs]
   ```

## 示例日志

假设在使用 G1 垃圾回收器时，GC 日志的输出可能如下所示：

```text
2024-11-28T08:00:00.001+0000: 0.001: [GC pause (young) (G1 Evacuation Pause) (mixed) 3124M->1024M(4096M), 0.0034567 secs]
2024-11-28T08:00:00.004+0000: 0.004: [GC pause (young) (G1 Evacuation Pause) (mixed) 2048M->1024M(4096M), 0.0023456 secs]
```

其中：

- `2024-11-28T08:00:00.001+0000`: 表示 GC 事件发生的时间。
- `3124M->1024M(4096M)`: 表示 GC 之前年轻代占用的内存是 3124M，GC 后为 1024M，堆总内存是 4096M。
- `0.0034567 secs`: GC 执行的时间。


# 可视化工具

下面是对上述 GC 日志可视化分析工具的简明对比表格：

| 工具名称                  | 支持的 GC 日志格式  | 特点                                               | 是否免费       | 使用方式      |
|-----------------------|-----------------|---------------------------------------------------|--------------|-------------|
| **GCViewer**           | Java 6 及以上    | 开源，支持多种 GC 日志格式，提供详细的 GC 图表分析      | 免费           | 下载并运行   |
| **Censum (JClarity)**  | Java 8 及以上    | 商业工具，自动生成报告，深度分析 GC 停顿和内存使用情况   | 付费           | 上传日志文件 |
| **FastThread**         | Java 8 及以上    | 在线工具，快速分析 GC 日志，自动生成报告和图表          | 免费           | 在线上传日志 |
| **GCEasy.io**          | Java 8 及以上    | 在线工具，提供详细的 GC 分析报告，支持 G1、CMS 等       | 免费（有高级功能付费） | 在线上传日志 |
| **VisualVM**           | Java 6 及以上    | 官方工具，集成 GC 日志分析、内存分析、线程监控等        | 免费           | 下载并运行   |
| **XRebel GC Viewer**   | Java 8 及以上    | 提供易于理解的图表和 GC 报告，支持停顿时间和内存使用分析    | 免费（有高级功能付费） | 在线上传日志 |
| **JFR + JMC (Oracle)** | Java 8 及以上    | 官方工具，提供高效的性能分析，适用于生产环境           | 免费           | JDK 内建，配置并运行 |

# 小结

可以发现，很多工具都是帮助我们降低分析的使用门槛，不需要每一个人都熟悉 GC 文件的格式。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。






--------------------------------------------------------------------------------------------------------------------------------

# chat

## 详细介绍一下 java GC 日志

Java 的垃圾回收（GC）日志提供了关于 JVM 垃圾回收过程的详细信息。这些日志对于性能调优和分析垃圾回收行为至关重要。通过 GC 日志，开发者可以了解堆内存的使用情况、垃圾回收的频率、每次 GC 的时间等信息，帮助排查内存泄漏、性能瓶颈等问题。

### 启用 GC 日志

在 Java 8 之前，启用 GC 日志需要设置 `-XX:+PrintGCDetails` 和 `-XX:+PrintGCDateStamps` 等 JVM 参数。从 Java 9 开始，JVM 提供了统一的 GC 日志格式，可以通过 `-Xlog:gc` 启用日志记录。

#### Java 8 之前的方式：
```bash
-XX:+PrintGCDetails -XX:+PrintGCDateStamps
```

#### Java 9 及之后的方式：
```bash
-Xlog:gc*:file=gc.log
```

### 常见 GC 日志参数

1. **`-XX:+PrintGCDetails`**  
   打印详细的 GC 信息，包括每个垃圾回收周期的类型、堆的使用情况、GC 前后的堆状态等。

2. **`-XX:+PrintGCDateStamps`**  
   打印 GC 时间戳，帮助你确定垃圾回收的发生时间。

3. **`-XX:+PrintGCTimeStamps`**  
   记录垃圾回收的时间戳。

4. **`-XX:+PrintHeapAtGC`**  
   每次 GC 发生时，打印堆的详细信息（如堆内存大小、使用的内存等）。

5. **`-XX:+PrintGCApplicationStoppedTime`**  
   打印应用程序停顿的时间，尤其是在发生 Stop-the-World 的 GC 时，能够帮助定位性能瓶颈。

6. **`-XX:+PrintTenuringDistribution`**  
   打印年轻代到老年代的对象晋升分布，了解对象的生命周期和对象晋升的时机。

### GC 日志中的常见输出字段

GC 日志包含多个重要的字段，每个字段对应着不同的 GC 细节，以下是一些常见的字段及其含义：

1. **GC 事件类型**  
   常见的 GC 类型包括：
   - **Minor GC**：年轻代垃圾回收
   - **Full GC**：包括年轻代和老年代垃圾回收，通常需要进行 Stop-the-World 操作
   - **Mixed GC**：G1 垃圾回收器的一种类型，涉及年轻代和部分老年代回收

2. **时间戳**  
   每次 GC 事件的时间。

3. **堆的大小**  
   - **Young Generation**（年轻代）
   - **Old Generation**（老年代）
   - **Permanent Generation**（永久代，Java 8 之后被元空间（Metaspace）替代）

4. **GC 前后的堆内存状态**  
   GC 前后的堆使用情况：包括每个代（年轻代、老年代、元空间）的内存大小、已使用内存和最大内存。

5. **GC 停顿时间**  
   - **Pause Time**：GC 期间应用程序的停顿时间
   - **Application Time**：应用程序执行的时间，通常用于计算总的停顿时间与应用程序的执行时间比例。

6. **GC 执行时间**  
   每次 GC 的执行时间。例如：
   ```text
   [GC (Allocation Failure)  [PSYoungGen: 2048K->512K(3072K)] 1024K->512K(4096K), 0.0012345 secs]
   ```

### 示例日志

假设在使用 G1 垃圾回收器时，GC 日志的输出可能如下所示：

```text
2024-11-28T08:00:00.001+0000: 0.001: [GC pause (young) (G1 Evacuation Pause) (mixed) 3124M->1024M(4096M), 0.0034567 secs]
2024-11-28T08:00:00.004+0000: 0.004: [GC pause (young) (G1 Evacuation Pause) (mixed) 2048M->1024M(4096M), 0.0023456 secs]
```

其中：
- `2024-11-28T08:00:00.001+0000`: 表示 GC 事件发生的时间。
- `3124M->1024M(4096M)`: 表示 GC 之前年轻代占用的内存是 3124M，GC 后为 1024M，堆总内存是 4096M。
- `0.0034567 secs`: GC 执行的时间。

### GC 日志分析

1. **GC 类型分析**  
   确定 GC 类型（Minor GC 或 Full GC）。频繁的 Full GC 可能表明内存配置不合理或对象生命周期较短，需要优化内存管理或增加堆内存。

2. **GC 停顿分析**  
   通过 `Pause Time` 分析应用的停顿时间。如果 GC 停顿时间较长，可能需要调整垃圾回收器、调整堆内存的大小或优化代码。

3. **堆内存分析**  
   检查每次 GC 事件后堆内存的使用情况，分析年轻代和老年代的内存使用是否合理。例如，年轻代内存过小可能导致频繁的 GC，而老年代内存过小可能导致频繁的 Full GC。

### 常见的 GC 收集器

1. **Serial GC**：适用于单线程环境，性能较低，但延迟小，适合小型应用。
2. **Parallel GC**：并行回收器，适用于多核系统，能够提高吞吐量。
3. **CMS（Concurrent Mark-Sweep）GC**：针对低延迟应用优化，能够减少停顿时间，但需要更多的内存。
4. **G1 GC**：适用于大内存和低延迟要求的应用，能够控制 GC 停顿时间。

### GC 日志的重要性

- **性能调优**：通过 GC 日志，可以查看应用的 GC 活动，及时发现并解决 GC 造成的性能问题。
- **内存泄漏诊断**：GC 日志有助于发现对象未能及时回收，可能是内存泄漏的表现。
- **监控和报警**：通过分析 GC 日志，可以设置基于 GC 停顿时间或内存使用的监控报警，提前发现潜在问题。

GC 日志的分析对于 Java 应用程序的性能优化至关重要，可以帮助开发者深入了解内存管理和垃圾回收的行为，从而做出相应的调整和优化。


# GC 日志的可视化分析工具有哪些？

GC 日志的可视化分析工具能够帮助开发者更直观地查看和分析垃圾回收的行为、性能瓶颈、内存分配等。以下是一些常见的 GC 日志可视化分析工具：

### 1. **GCViewer**
[GCViewer](https://github.com/cheusov/gcviewer) 是一个开源的 GC 日志分析工具，支持 Java 6 及以上版本。它通过图形化界面展示 GC 活动，包括每次 GC 的详细信息，如 GC 类型、时间戳、堆内存使用情况等。GCViewer 提供了堆使用图、停顿时间图等多种视图，帮助开发者更容易地理解 GC 行为。

#### 特点：
- 支持多种 GC 日志格式（包括 Java 9 及以上的 `-Xlog` 格式）。
- 显示 GC 活动、内存使用和停顿时间的趋势。
- 可导出为 CSV 文件，进行进一步的数据处理。

#### 使用：
1. 下载并运行 GCViewer。
2. 加载 GC 日志文件。
3. 查看堆内存使用情况、GC 活动频率、停顿时间等指标。

### 2. **JClarity's Censum**
[Censum](https://www.jclarity.com/censum/) 是 JClarity 提供的一款商业 GC 日志分析工具，专注于提供高质量的 GC 日志分析。Censum 可以自动解析并报告 GC 的不同类型、停顿时间、内存使用和吞吐量等关键性能指标。它能够帮助开发者识别潜在的性能瓶颈，特别是在垃圾回收相关的停顿和吞吐量方面。

#### 特点：
- 支持多种 GC 收集器（包括 G1 GC、CMS GC 等）。
- 自动生成报告，详细显示每次 GC 的类型、停顿时间、内存使用等。
- 提供直观的图表，如 GC 类型分布、停顿时间分布、内存使用趋势等。

#### 使用：
1. 上传 GC 日志文件到 Censum。
2. 工具自动分析日志并生成报告。
3. 查看分析结果和优化建议。

### 3. **JVM GC Log Analyzer by FastThread**
[FastThread GC Log Analyzer](https://fastthread.io/) 是一个在线 GC 日志分析工具，它提供了快速的分析和可视化报告，帮助开发者分析 Java 应用程序的 GC 行为。该工具能够解析日志并生成包括 GC 停顿时间、GC 事件类型、堆内存使用情况等方面的详细报告。

#### 特点：
- 在线工具，无需下载和安装。
- 支持常见的 GC 日志格式，包括 Java 9 的 `-Xlog` 格式。
- 自动生成报告，显示堆使用情况、GC 停顿时间、GC 类型分布等。

#### 使用：
1. 访问 FastThread 网站并上传 GC 日志文件。
2. 快速查看 GC 日志分析结果，生成图表和报告。
3. 根据分析结果调整应用的内存配置或 GC 参数。

### 4. **GCEasy.io**
[GCEasy](https://gceasy.io/) 是一个易于使用的在线 GC 日志分析工具。它支持 Java 8 和 Java 9 以上版本的 GC 日志，能够解析日志并提供详细的分析报告。GCEasy 提供图形化的界面和直观的视图，帮助开发者深入了解每次 GC 事件的性能表现和影响。

#### 特点：
- 支持常见的垃圾回收器（如 G1、CMS、Parallel GC 等）。
- 生成多种图表，如 GC 停顿时间图、堆内存使用图等。
- 提供详细的分析报告，帮助开发者优化 GC 设置和性能。

#### 使用：
1. 上传 GC 日志文件到 GCEasy 网站。
2. 查看分析报告，包含 GC 停顿时间、内存使用、GC 类型等。
3. 根据报告做出性能优化决策。

### 5. **JVisualVM (VisualVM)**
[VisualVM](https://visualvm.github.io/) 是 Java 官方提供的工具，它集成了多个功能，包括 GC 日志分析、内存分析、线程监控等。通过 VisualVM，开发者可以查看实时的 GC 活动、内存使用情况、垃圾回收的详细信息，还可以分析不同的 JVM 参数对性能的影响。

#### 特点：
- 支持 GC 日志的分析和实时监控。
- 可视化 GC 停顿、堆内存使用、GC 频率等。
- 提供多种图表和报告，帮助开发者分析性能瓶颈。

#### 使用：
1. 启动 VisualVM，连接到目标 JVM 进程。
2. 在 "Monitor" 或 "Profiler" 标签页中查看 GC 活动。
3. 在 "GC" 视图中查看详细的 GC 日志和堆内存使用情况。

### 6. **XRebel GC Viewer**
[XRebel GC Viewer](https://xrebel.com/tools/gc-viewer/) 是由 RebelLabs 提供的一款 GC 日志可视化分析工具，主要用于分析 Java 8 及以上版本的 GC 日志。它能帮助开发者查看 GC 的详细过程、停顿时间、内存使用、GC 类型等，并提供易于理解的报告和图表。

#### 特点：
- 支持 Java 8 和 Java 9 的 GC 日志分析。
- 可生成直观的图表，包括 GC 停顿时间图、堆内存使用图等。
- 提供清晰的报告，帮助开发者识别潜在的性能问题。

#### 使用：
1. 上传 GC 日志文件。
2. 查看 GC 分析结果，包括 GC 类型、停顿时间、堆内存使用等。

### 7. **JDK Flight Recorder + Java Mission Control**
[JDK Flight Recorder](https://www.oracle.com/java/technologies/jdk-mission-control.html) (JFR) 和 Java Mission Control (JMC) 是 Oracle 提供的一组性能分析工具。JFR 能够记录 JVM 的各类性能数据，包括 GC 活动。JMC 提供可视化界面，能够帮助开发者分析 JFR 收集的 GC 数据。

#### 特点：
- 内建于 JDK 中，适用于生产环境。
- 提供详细的 GC 分析报告，包括堆内存使用情况、GC 停顿时间、GC 类型分布等。
- 可以进行高效的性能分析和调优。

#### 使用：
1. 在 JDK 中启用 Flight Recorder。
2. 使用 Java Mission Control 导入并分析 JFR 文件。
3. 查看 GC 数据以及性能瓶颈分析结果。

### 总结

以上工具可以帮助开发者更好地理解和优化 Java 应用的垃圾回收过程。选择适合的工具可以大大提升垃圾回收日志的分析效率和效果。对于快速在线分析，`FastThread`、`GCEasy` 和 `GCViewer` 是不错的选择；而对于深入的性能分析，`JVM GC Log Analyzer`、`Censum` 或 `VisualVM` 等则提供了更多功能和更强的分析能力。



# 参考资料

[Java堆转储Dump文件的几种方法](https://blog.nowcoder.net/n/0aae9acaa6c14aafb505d37fc6a7f4ec)

* any list
{:toc}
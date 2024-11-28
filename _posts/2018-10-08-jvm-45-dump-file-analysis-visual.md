---
layout: post
title: jvm-45-jvm dump 文件内存介绍+获取方式+堆内存可视分析化工具
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

# jvm dump 文件是什么？

JVM内存Dump是指在Java虚拟机运行时，将其内存状态（堆、栈等信息）写入到磁盘文件中的操作。

内存Dump文件通常用于故障排查、性能分析和诊断。

当JVM出现崩溃、内存泄漏或严重的性能瓶颈时，生成内存Dump文件可以帮助开发人员进一步分析内存状态，找出根本原因。

## 内存 Dump 文件类型

JVM提供了几种常见的内存Dump文件类型：

- **Heap Dump**：包含JVM堆的所有对象及其状态，适用于分析内存泄漏和分析堆中对象的分布。它可以通过工具如 `jhat`、`VisualVM`、`Eclipse MAT` 等来分析。

- **Thread Dump**：包含所有线程的堆栈跟踪信息，适用于分析死锁、线程阻塞或性能瓶颈。可以通过 `jstack` 命令生成。

- **Core Dump**：包含JVM的核心内存状态，通常用于分析JVM崩溃时的堆栈信息。

# 如何获得？

Heap Dump记录了JVM堆内存的详细信息，包括对象的实例、大小、引用关系、类加载信息等。

Heap Dump通常用于分析内存泄漏、对象分配情况等问题。

生成Heap Dump的方式有几种：

## 启动参数

- **JVM启动时配置**：通过启动参数来配置JVM在出现`OutOfMemoryError`时自动生成Heap Dump。

  ```bash
  java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dump.hprof -jar app.jar
  ```

  这会在出现内存溢出时生成Heap Dump文件。

### jvm 参数解释

下面是对`java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dump.hprof -jar app.jar`命令中各个参数的解释，以表格形式展示：

| **参数**                            | **含义**                                                                                                                                              |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-XX:+HeapDumpOnOutOfMemoryError`   | 启用在发生`OutOfMemoryError`时自动生成Heap Dump文件。该参数在JVM内存溢出时非常有用，可以帮助开发者分析内存泄漏问题。                                               |
| `-XX:HeapDumpPath=/path/to/dump.hprof` | 指定Heap Dump文件的保存路径。文件的扩展名通常是`.hprof`，这是Heap Dump的标准格式。路径可以是绝对路径或相对路径，确保目标目录存在并具有写权限。 |
| `-jar app.jar`                      | 启动指定的Java应用程序，其中`app.jar`是应用程序的JAR文件。这个参数告诉JVM运行一个JAR文件，替代了普通的`-cp`（classpath）方式。                        |

这些参数组合在一起，确保在`OutOfMemoryError`发生时，JVM会自动生成堆内存Dump，并将其保存到指定路径。

## 命令

- **通过JVM命令行工具**：可以使用`jmap`工具手动生成Heap Dump文件：

  ```bash
  jmap -dump:live,format=b,file=/path/to/dump.hprof <pid>
  ```

  其中，`<pid>` 是目标JVM进程的PID，`live`表示只导出存活对象，`format=b`表示使用二进制格式，`file`指定文件输出路径。

- **通过JVM信号**：在Linux或Mac上，发送`SIGQUIT`信号（例如使用`Ctrl+\`）也可以生成Heap Dump。

一般实际中主要用第一种 jmap 的方式。

# 如何分析？可视化工具

这些 dump 文件靠人眼看，不太现实。

下面是一些常见的分析工具，个人比较喜欢 MAT 工具。

| **工具**            | **特点**                                                                                               | **适用场景**                                                                                       |
|---------------------|------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Eclipse MAT**      | 强大的内存泄漏检测，支持Dominator树、引用链分析，报告生成                                          | 深入分析Heap Dump，找出内存泄漏和性能瓶颈。                                                      |
| **VisualVM**         | 集成JVM监控，支持Heap Dump分析，实时性能监控，插件扩展                                               | 实时监控和分析Java应用，适用于日常性能分析和内存分析。                                            |
| **JProfiler**        | 强大的内存、CPU、线程分析，内存泄漏检测，性能瓶颈分析，商业工具                                     | 适用于复杂的Java应用，帮助深入分析内存泄漏和性能瓶颈。                                            |
| **YourKit**          | 高度可定制的性能分析工具，内存、CPU、线程分析，支持Heap Dump分析，商业工具                         | 性能优化和内存分析，适合大型和复杂的Java应用，支持实时性能监控。                                   |
| **jhat**             | 轻量级工具，JDK自带，简单Web界面，适用于基本的Heap Dump分析                                        | 用于快速查看Heap Dump，适合轻量级分析，不适合复杂的内存分析需求。                               |

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。


--------------------------------------------------------------------------------------------------------------------------------

# chat

## 详细介绍一下 jvm 的内存 dump 

JVM内存Dump是指在Java虚拟机运行时，将其内存状态（堆、栈等信息）写入到磁盘文件中的操作。

内存Dump文件通常用于故障排查、性能分析和诊断。当JVM出现崩溃、内存泄漏或严重的性能瓶颈时，生成内存Dump文件可以帮助开发人员进一步分析内存状态，找出根本原因。

### 1. **内存Dump文件类型**
JVM提供了几种常见的内存Dump文件类型：
- **Heap Dump**：包含JVM堆的所有对象及其状态，适用于分析内存泄漏和分析堆中对象的分布。它可以通过工具如 `jhat`、`VisualVM`、`Eclipse MAT` 等来分析。
- **Thread Dump**：包含所有线程的堆栈跟踪信息，适用于分析死锁、线程阻塞或性能瓶颈。可以通过 `jstack` 命令生成。
- **Core Dump**：包含JVM的核心内存状态，通常用于分析JVM崩溃时的堆栈信息。
  
### 2. **生成Heap Dump**
Heap Dump记录了JVM堆内存的详细信息，包括对象的实例、大小、引用关系、类加载信息等。Heap Dump通常用于分析内存泄漏、对象分配情况等问题。

生成Heap Dump的方式有几种：
- **JVM启动时配置**：通过启动参数来配置JVM在出现`OutOfMemoryError`时自动生成Heap Dump。
  ```bash
  java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dump.hprof -jar app.jar
  ```
  这会在出现内存溢出时生成Heap Dump文件。
  
- **通过JVM命令行工具**：可以使用`jmap`工具手动生成Heap Dump文件：
  ```bash
  jmap -dump:live,format=b,file=/path/to/dump.hprof <pid>
  ```
  其中，`<pid>` 是目标JVM进程的PID，`live`表示只导出存活对象，`format=b`表示使用二进制格式，`file`指定文件输出路径。

- **通过JVM信号**：在Linux或Mac上，发送`SIGQUIT`信号（例如使用`Ctrl+\`）也可以生成Heap Dump。

### 3. **分析Heap Dump**
Heap Dump生成后可以使用以下工具进行分析：
- **Eclipse MAT**：一个强大的内存分析工具，支持多种分析模式，比如查找大对象、垃圾回收分析、查找引用链等。
- **VisualVM**：JVM自带的性能分析工具，可以通过`Heap Dump`功能查看对象分布、内存占用等信息。
- **jhat**：一个JVM自带的Heap Dump分析工具，但功能不如MAT强大。
  
分析Heap Dump时，常见的目的包括：
- **找出内存泄漏**：通过分析哪些对象未被垃圾回收，查找引用链，发现未被释放的对象。
- **检查对象分布**：查看哪些类占用了大量内存，优化内存占用。
- **分析垃圾回收**：通过堆信息分析垃圾回收是否有效，是否有频繁的Full GC。

### 4. **生成Thread Dump**
Thread Dump记录了JVM中所有线程的堆栈信息，适用于分析死锁、线程阻塞或性能瓶颈。可以通过以下方式生成：
- **jstack工具**：
  ```bash
  jstack <pid>
  ```
  该命令会打印出所有线程的堆栈信息，帮助诊断线程的问题。

- **发送信号**：在Linux和Mac系统中，发送`SIGQUIT`信号也会生成线程Dump。

- **JVM启动参数**：通过`-XX:+PrintThreadDumpOnCrash`来在JVM崩溃时自动生成线程Dump。

Thread Dump的分析重点是：
- **死锁检测**：如果线程卡住或无法继续执行，检查是否存在死锁。
- **线程阻塞**：检查是否有线程在等待某些资源或锁，导致阻塞。
- **线程状态**：查看线程的状态（如`RUNNABLE`、`WAITING`、`BLOCKED`等），帮助诊断性能问题。

### 5. **Core Dump**
Core Dump通常用于JVM崩溃时生成，包含JVM的完整内存状态。生成Core Dump通常需要配置：
```bash
ulimit -c unlimited  # 允许生成Core Dump
```
JVM崩溃时会生成Core Dump文件，使用调试工具（如gdb）结合JVM的调试信息来分析崩溃原因。

### 6. **JVM内存模型**
JVM的内存管理包括多个区域：
- **堆（Heap）**：存放所有动态分配的对象。
- **栈（Stack）**：每个线程都有自己的栈，用来存放局部变量和方法调用。
- **方法区（Method Area）**：存放类信息、常量、静态变量等。
- **直接内存（Direct Memory）**：通过`java.nio`包中的`ByteBuffer`直接分配的内存。

Heap Dump主要关注堆内存区域，用于诊断堆内存中的问题，而Thread Dump和Core Dump关注JVM崩溃或线程调度相关的问题。

### 7. **使用内存Dump进行故障排查的步骤**
1. **确定生成内存Dump的时机**：根据问题的性质，选择合适的时机生成内存Dump，如内存溢出时、JVM崩溃时或性能问题时。
2. **分析内存Dump**：通过工具（如MAT、VisualVM、jhat等）加载Heap Dump，分析内存使用情况、对象分配、垃圾回收等。
3. **定位问题**：根据分析结果，找出可能的内存泄漏、性能瓶颈、死锁等问题。
4. **优化和修复**：根据诊断结果进行代码优化、配置调整或资源管理优化。

### 8. **总结**
JVM内存Dump是诊断JVM相关问题的重要工具。通过生成和分析Heap Dump、Thread Dump等文件，可以帮助开发人员识别内存泄漏、死锁、线程问题和性能瓶颈等。掌握如何生成和分析内存Dump，对于优化Java应用性能和解决复杂的运行时问题具有重要意义。


## 分析工具有哪些？

分析Java的Dump文件（特别是Heap Dump文件）是一个重要的诊断过程，通常用于找出内存泄漏、性能瓶颈或者垃圾回收问题。以下是几种常见的可视化工具和分析方法，它们可以帮助你更好地分析Dump文件。

### 1. **Eclipse Memory Analyzer Tool (MAT)**
Eclipse MAT 是一个非常强大的工具，用于分析Heap Dump文件，它能够帮助开发者深入了解内存使用情况，检测内存泄漏，分析对象的生命周期等。

#### **特点**：
- **内存泄漏分析**：可以通过堆转储分析找出内存泄漏问题。
- **Dominators树**：可以帮助找到堆中占用内存最多的对象。
- **对象引用分析**：分析对象的引用链，找到内存无法回收的原因。
- **堆转储分析报告**：生成详细的报告，帮助开发者定位问题。
  
#### **使用步骤**：
1. 下载并安装Eclipse MAT（[官网链接](https://www.eclipse.org/mat/)）。
2. 启动MAT并加载Heap Dump文件（.hprof）。
3. 使用工具中的**Leak Suspects Report**功能自动分析潜在的内存泄漏。
4. 分析**Dominator Tree**来查看哪些对象占用了最多的内存。

#### **示例截图**：
- 堆转储分析
- Dominator Tree视图
- 引用链分析

### 2. **VisualVM**
VisualVM 是一个JVM的综合分析工具，它也能够分析Heap Dump文件，并提供丰富的图形化界面帮助开发者了解堆内存使用情况。

#### **特点**：
- **实时监控**：除了分析Dump文件，VisualVM还能监控正在运行的JVM，查看堆、线程、类加载等信息。
- **内存分析**：支持Heap Dump分析，查看堆的结构、对象的分布、垃圾回收等。
- **可视化分析**：提供堆快照、线程分析等功能。
- **插件支持**：支持安装插件来增强功能，如分析JavaFX应用、JMX监控等。

#### **使用步骤**：
1. 下载并安装VisualVM（[官网链接](https://visualvm.github.io/)）。
2. 启动VisualVM并加载Heap Dump文件。
3. 在“Heap Dump”选项卡中查看内存使用情况。
4. 使用**Histogram**和**Dominator Tree**来分析对象占用内存的情况。

#### **示例截图**：
- Heap Dump的Histogram视图
- 堆快照和对象分析

### 3. **JProfiler**
JProfiler 是一个商业工具，用于分析Java应用的性能、内存使用情况、线程状态等。它提供了强大的Heap Dump分析功能，能够帮助开发者定位内存泄漏、性能瓶颈等问题。

#### **特点**：
- **内存分析**：提供Heap Dump分析，包括内存泄漏检测、对象实例数、内存占用等。
- **CPU分析**：可以对应用程序的CPU进行分析，帮助开发者识别性能瓶颈。
- **线程分析**：分析线程的状态，检测死锁和线程阻塞问题。
- **可视化报告**：提供各种报告和图表，便于理解和展示分析结果。

#### **使用步骤**：
1. 下载并安装JProfiler（[官网链接](https://www.ej-technologies.com/products/jprofiler/overview.html)）。
2. 连接JProfiler到正在运行的JVM进程，或者加载Heap Dump文件。
3. 使用内存分析工具来分析对象、内存使用、垃圾回收等。
4. 查看堆分析报告，定位内存泄漏或内存占用问题。

#### **示例截图**：
- 内存泄漏检测报告
- CPU和线程分析

### 4. **YourKit Java Profiler**
YourKit 是一个商业的Java性能分析工具，具有强大的Heap Dump分析功能，能够帮助开发者找到内存泄漏、查看对象的引用关系等。

#### **特点**：
- **内存分析**：可以分析Heap Dump，识别内存泄漏、查看对象分布、分析内存占用等。
- **性能分析**：可以进行CPU分析、线程分析、数据库性能分析等。
- **易用性**：界面友好，易于使用，可以在JVM进程运行时进行实时分析。
- **可扩展性**：支持多种分析插件，可以自定义分析报告。

#### **使用步骤**：
1. 下载并安装YourKit Java Profiler（[官网链接](https://www.yourkit.com/java/profiler/)）。
2. 启动YourKit并连接到目标JVM进程，或者加载Heap Dump文件。
3. 分析Heap Dump并查看对象分布、内存占用、垃圾回收情况。
4. 使用内存泄漏检测工具来定位潜在的内存泄漏问题。

#### **示例截图**：
- 内存占用图表
- 对象引用关系图

### 5. **jhat (JVM Heap Analysis Tool)**
`jhat` 是JDK自带的一个工具，用于分析Heap Dump文件。它比较简单，但也可以用来做基本的Heap Dump分析。

#### **特点**：
- **轻量级**：无需额外安装，只需要JDK自带的`jhat`工具。
- **简单的Web界面**：`jhat`会启动一个简单的Web服务器，用户可以通过浏览器查看Heap Dump的内容。
- **基本的分析功能**：查看Heap Dump中的对象、类分布、引用关系等。

#### **使用步骤**：
1. 通过命令行运行`jhat`工具来启动Heap Dump分析。
   ```bash
   jhat -J-Xmx512m /path/to/heapdump.hprof
   ```
2. 打开浏览器，访问`http://localhost:7000`来查看Heap Dump的Web界面。
3. 使用界面中的各种选项进行对象分析、类分布、引用链等基本操作。

#### **示例截图**：
- Heap Dump对象分析界面
- 类和对象分布图



# 参考资料

[Java堆转储Dump文件的几种方法](https://blog.nowcoder.net/n/0aae9acaa6c14aafb505d37fc6a7f4ec)

* any list
{:toc}
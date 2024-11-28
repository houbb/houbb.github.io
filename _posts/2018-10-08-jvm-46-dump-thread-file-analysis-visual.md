---
layout: post
title: jvm-45-jvm Thread Dump 线程的堆栈跟踪信息+获取方式+可视分析化工具 FastThread
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

[jvm-44-jvm 内存性能分析工具 Eclipse Memory Analyzer Tool (MAT) / 内存分析器 (MAT)](https://houbb.github.io/2018/10/08/jvm-44-dump-file-analysis-mat)

[jvisualvm java 性能分析工具](https://houbb.github.io/2018/11/12/jvisualvm)

# 是什么？

**Thread Dump** 是记录 JVM 中所有线程的执行状态（包括堆栈跟踪）的一种输出，用于分析线程的状态、死锁、阻塞等问题。

Thread Dump 是性能分析和故障排查中非常重要的工具，特别是当应用出现性能瓶颈、线程死锁、线程阻塞等问题时。

## **主要内容包括**：

- **线程状态**：每个线程的当前状态，例如 `RUNNABLE`、`WAITING`、`BLOCKED` 等。
- **线程堆栈信息**：每个线程的调用堆栈，包括它当前执行的方法。
- **锁信息**：如果线程正在等待某个锁，或者持有某个锁，相关的锁信息也会被输出。
- **死锁信息**：如果存在死锁，Thread Dump 会显示死锁的线程和相关的锁信息。

## **线程状态**

- **RUNNABLE**：线程正在执行或在执行队列中等待调度。
- **WAITING**：线程正在等待某个条件的满足（例如，等待某个对象的通知）。
- **BLOCKED**：线程正在等待获取一个锁，其他线程持有该锁。
- **TIMED_WAITING**：线程在等待特定的时间后自动恢复（例如调用 `Thread.sleep`）。
- **TERMINATED**：线程已执行完成，处于终止状态。

# 如何获得？

Thread Dump 可以在多种情况下生成，通常用于排查线程相关的问题（如死锁、线程阻塞、性能瓶颈等）。

在Java中，生成Thread Dump的方法有几种：

## 使用 `jstack` 工具

`jstack` 是JDK自带的工具，用于生成Java进程的Thread Dump。

可以通过以下命令生成Thread Dump：

```bash
jstack <pid> > threaddump.txt
```

## 使用 `jcmd` 工具

`jcmd` 是另一个JDK自带的工具，可以用来获取Thread Dump。

通过以下命令生成Thread Dump：

```bash
jcmd <pid> Thread.print
```

## 区别

二者对比如下：

| **特性**             | **jstack**                              | **jcmd**                                   |
|----------------------|-----------------------------------------|--------------------------------------------|
| **功能**             | 仅获取线程堆栈信息                     | 获取线程堆栈信息并执行其他JVM管理任务     |
| **输出内容**         | 简单的堆栈信息，线程状态与调用堆栈     | 线程堆栈信息，线程状态解释，锁信息等     |
| **使用方便性**       | 简单，适用于快速查看堆栈信息           | 更灵活，支持多种JVM操作和诊断任务        |
| **命令示例**         | `jstack <pid>`                          | `jcmd <pid> Thread.print`                  |
| **附加功能**         | 无                                      | 支持多种操作，如垃圾回收、类加载等       |


# 如何分析？可视化工具

以下是一些常用的 **Thread Dump 可视化分析工具**

| **工具名称**             | **特点**                           | **网址**                                      |
|--------------------------|------------------------------------|-----------------------------------------------|
| **Thread Dump Analyzer**  | 简单易用，支持死锁和线程阻塞分析。  | [GitHub](https://github.com/softinstigate/Thread-Dump-Analyzer) |
| **VisualVM**              | 功能强大，支持多种 JVM 性能分析。    | [VisualVM 官网](https://visualvm.github.io/) |
| **JStack Viewer**         | 高亮显示线程状态和锁信息，易用性强。 | [GitHub](https://github.com/kduman/JStackViewer) |
| **Eclim**                 | 专为 Eclipse 提供的插件，集成环境使用 | [GitHub](https://github.com/holgerd77/eclim) |
| **Deadlock Detector**     | 专注于死锁分析，提供图形化视图。      | [GitHub](https://github.com/alexsuslin/deadlock-detector) |
| **TDA (Thread Dump Analyzer)** | 支持线程堆栈可视化与排序，死锁检测。  | [GitHub](https://github.com/mvysny/tda) |
| **jvm-tools Thread Dump Analyzer** | 基于 JavaFX，现代界面，支持死锁分析。 | [GitHub](https://github.com/jvm-tools/thread-dump-analyzer) |

个人评价：thread 相对比较简单，平时人工分析的比较多，后续可以尝试一下这种可视化工具。VisualVM 倒是看过可视化的 thread 信息。


# 可视化工具-FastThread

是的，**FastThread** 是一个非常实用的开源工具，专门用于分析和可视化 **Thread Dump**，尤其是针对 Java 应用程序中的多线程问题，如死锁、线程阻塞等。它能够帮助开发人员更高效地分析和理解 Java 线程的状态。

### **FastThread 的特点**：

- **线程堆栈分析**：解析和分析 Java 应用程序的 Thread Dump，提供清晰的线程堆栈和状态。
- **死锁检测**：能够自动检测死锁并高亮显示，帮助开发者快速定位死锁问题。
- **线程状态图**：通过图形化界面展示线程状态（如 RUNNABLE、WAITING、BLOCKED），便于直观分析。
- **支持线程堆栈排序**：能够根据不同的标准对线程堆栈进行排序，比如按线程状态、线程 ID 等。
- **简单易用**：界面简洁，操作简单，不需要复杂的配置。

### **FastThread 的使用**：

- **Web 在线工具**：FastThread 提供了一个方便的在线工具，用户只需要将 Thread Dump 粘贴到网站上，即可自动分析和显示结果。
- **命令行工具**：除了在线工具，FastThread 也提供了命令行工具，可以集成到自动化流程中，支持批量处理 Thread Dump。

### **FastThread 网站**：

- **在线工具**：[https://fastthread.io](https://fastthread.io)
  - 用户可以直接将线程转储粘贴到该网站上，进行分析。
  
- **GitHub 项目**：[https://github.com/fastthreadio/fastthread](https://github.com/fastthreadio/fastthread)
  - 这里可以找到 FastThread 的源码和相关文档。

### **使用场景**：

- **死锁分析**：当遇到线程死锁时，FastThread 能够自动识别并标记相关线程，帮助开发者快速解决问题。
- **线程阻塞问题**：通过清晰的线程状态展示，帮助分析线程阻塞的根源，优化多线程程序的性能。
- **性能优化**：对于需要多线程优化的应用，FastThread 提供了对线程状态的详细分析，帮助识别性能瓶颈。

### **总结**：

FastThread 是一个非常适合 Java 开发者使用的线程分析工具，尤其适用于在线分析 Thread Dump 和解决死锁、线程阻塞等常见的多线程问题。

它的开源特性和易用性使它成为开发者在诊断线程问题时的一个有力工具。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

--------------------------------------------------------------------------------------------------------------------------------

# chat

## 详细介绍一下 jvm 的 Thread Dump

**Thread Dump** 是记录 JVM 中所有线程的执行状态（包括堆栈跟踪）的一种输出，用于分析线程的状态、死锁、阻塞等问题。

Thread Dump 是性能分析和故障排查中非常重要的工具，特别是当应用出现性能瓶颈、线程死锁、线程阻塞等问题时。

### 1. **Thread Dump 的结构**

一个 **Thread Dump** 是 JVM 当前所有线程的堆栈信息，包含每个线程在特定时刻的堆栈信息以及线程的状态。

线程状态、锁信息、方法调用等都会记录在 Thread Dump 中。

#### **主要内容包括**：

- **线程状态**：每个线程的当前状态，例如 `RUNNABLE`、`WAITING`、`BLOCKED` 等。
- **线程堆栈信息**：每个线程的调用堆栈，包括它当前执行的方法。
- **锁信息**：如果线程正在等待某个锁，或者持有某个锁，相关的锁信息也会被输出。
- **死锁信息**：如果存在死锁，Thread Dump 会显示死锁的线程和相关的锁信息。

#### **线程状态**

- **RUNNABLE**：线程正在执行或在执行队列中等待调度。
- **WAITING**：线程正在等待某个条件的满足（例如，等待某个对象的通知）。
- **BLOCKED**：线程正在等待获取一个锁，其他线程持有该锁。
- **TIMED_WAITING**：线程在等待特定的时间后自动恢复（例如调用 `Thread.sleep`）。
- **TERMINATED**：线程已执行完成，处于终止状态。

#### **Thread Dump 示例**

下面是一个Thread Dump的简化示例，假设应用有多个线程：

```
"main" #1 prio=5 os_prio=0 tid=0x0000000001b3a000 nid=0x2a8 runnable [0x0000000001b24000]
   java.lang.Thread.State: RUNNABLE
        at java.lang.StringBuilder.append(StringBuilder.java:173)
        at com.example.Main.main(Main.java:15)

"Worker-1" #2 prio=5 os_prio=0 tid=0x0000000001b3b000 nid=0x2a9 waiting on condition [0x0000000001b25000]
   java.lang.Thread.State: WAITING (on object monitor)
        at com.example.Worker.run(Worker.java:30)
        - waiting to lock <0x00000000a0c03d30> (a java.lang.Object)
        at java.lang.Thread.run(Thread.java:748)

"Worker-2" #3 prio=5 os_prio=0 tid=0x0000000001b3c000 nid=0x2aa blocked [0x0000000001b26000]
   java.lang.Thread.State: BLOCKED (on object monitor)
        at com.example.Worker.run(Worker.java:40)
        - waiting to lock <0x00000000a0c03d30> (a java.lang.Object)
        at java.lang.Thread.run(Thread.java:748)

"GC" #4 prio=10 os_prio=0 tid=0x0000000001b3d000 nid=0x2ab waiting on condition [0x0000000001b27000]
   java.lang.Thread.State: WAITING (on object monitor)
        at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:144)
        at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:165)
        at java.lang.ref.Finalizer$FinalizerThread.run(Finalizer.java:229)
```

在这个示例中，我们可以看到：
- 线程 `"main"` 正在运行，它的堆栈信息显示它在调用 `StringBuilder.append`。
- 线程 `"Worker-1"` 正在等待获取锁（`WAITING` 状态），并且其堆栈信息显示它在执行 `Worker.run` 方法并等待某个对象的锁。
- 线程 `"Worker-2"` 被阻塞（`BLOCKED` 状态），它也在等待同一个对象的锁。
- 线程 `"GC"` 是垃圾回收线程，它处于 `WAITING` 状态，等待 `ReferenceQueue` 中的对象。

### 2. **如何生成 Thread Dump**
Thread Dump 可以在多种情况下生成，通常用于排查线程相关的问题（如死锁、线程阻塞、性能瓶颈等）。在Java中，生成Thread Dump的方法有几种：

#### 2.1 使用 `jstack` 工具
`jstack` 是JDK自带的工具，用于生成Java进程的Thread Dump。可以通过以下命令生成Thread Dump：

```bash
jstack <pid>
```

其中，`<pid>` 是目标JVM进程的进程ID（PID）。

生成的Thread Dump将被输出到标准输出，你也可以将其重定向到文件：

```bash
jstack <pid> > threaddump.txt
```

#### 2.2 使用 `jcmd` 工具
`jcmd` 是另一个JDK自带的工具，可以用来获取Thread Dump。通过以下命令生成Thread Dump：

```bash
jcmd <pid> Thread.print
```

`<pid>` 是目标JVM进程的PID，`Thread.print` 表示获取当前线程的堆栈信息。

#### 2.3 使用 `kill` 命令（Linux/Mac）
在Linux或Mac上，可以使用 `kill` 命令向Java进程发送 `SIGQUIT` 信号来生成Thread Dump：

```bash
kill -3 <pid>
```

这会使JVM打印出当前的Thread Dump，并输出到标准输出（通常是控制台或日志文件）。

#### 2.4 使用 `Ctrl + Break`（Windows）
在Windows环境下，如果你在命令行中运行Java应用程序，可以按 `Ctrl + Break` 来生成Thread Dump。这会将当前线程的堆栈信息打印到控制台。

### 3. **分析 Thread Dump**
Thread Dump 中的分析重点包括：
- **线程状态**：检查各个线程的状态，找出是否有线程处于死锁、阻塞或长时间等待状态。
- **死锁**：如果应用中存在死锁，Thread Dump 会显示死锁的线程和相关的锁信息。通常，死锁发生时，线程会处于 `BLOCKED` 或 `WAITING` 状态，且它们之间相互等待对方释放锁。
- **线程堆栈**：检查每个线程的堆栈信息，查看它正在执行的代码以及它是否被其他线程阻塞或等待资源。
- **长时间执行的线程**：查看是否有线程长时间处于 `RUNNABLE` 状态，并执行某些耗时的操作。
- **线程池**：如果使用了线程池，可以检查线程池中的线程状态，看看是否有线程被阻塞或长时间没有执行。

### 4. **常见的分析问题**
以下是通过Thread Dump常见的分析问题：

#### 4.1 死锁（Deadlock）
死锁发生在两个或更多线程互相等待对方释放锁，从而导致线程无法继续执行。Thread Dump会显示死锁的线程和它们所持有的锁。

死锁的标志是，两个线程或更多线程的堆栈信息相互交织，且它们相互等待对方释放锁。

#### **示例死锁：**
```
Found one Java-level deadlock:
=============================
"Thread-1" prio=5 tid=0x0000000001b3c000 nid=0x2aa waiting for monitor entry
   at com.example.MyClass.methodA(MyClass.java:10)
   - waiting to lock <0x00000000a0c03d30> (a java.lang.Object)
   at com.example.MyClass.methodB(MyClass.java:20)
   - locked <0x00000000a0c03d30> (a java.lang.Object)

"Thread-2" prio=5 tid=0x0000000001b3d000 nid=0x2ab waiting for monitor entry
   at com.example.MyClass.methodB(MyClass.java:30)
   - waiting to lock <0x00000000a0c03d30> (a java.lang.Object)
   at com.example.MyClass.methodA(MyClass.java:15)
   - locked <0x00000000a0c03d30> (a java.lang.Object)
```

#### 4.2 线程阻塞（Blocked Threads）
如果线程长时间处于 `BLOCKED` 状态，这通常表示它正在等待获取某个锁。如果多个线程争抢同一个锁，可能会导致线程阻塞。检查 `BLOCKED` 状态的线程并分析它们等待的锁。

#### 4.3 线程长时间等待（Waiting Threads）
某些线程可能会长时间处于 `WAITING` 状态，这通常表示它们在等待某个条件的满足。例如，等待从 `BlockingQueue` 中获取元素，或者等待某个对象的通知。

# jstack 和 jcmd 有什么区别？

`jstack` 和 `jcmd` 都可以用来生成 **Thread Dump**，但它们在生成堆栈信息时存在一些细微的差异。尽管它们的核心功能是相同的，都是捕获 JVM 中当前线程的堆栈信息，但它们有不同的命令选项、输出格式以及支持的功能。下面是对这两个工具的详细对比：

### 1. **生成方式的差异**
- **`jstack`**：
  - `jstack` 是专门用来获取 JVM 线程堆栈的工具，属于 JDK 自带的工具之一。
  - 它通常通过进程 ID (`pid`) 来指定目标进程，或者通过 `SIGQUIT` 信号（在 Linux/Unix 上）来触发 JVM 输出线程堆栈。
  - `jstack` 只提供线程堆栈信息，不能执行其他复杂的 JVM 调试操作。
  
  **命令**：
  ```bash
  jstack <pid>
  ```
  - 你可以通过重定向输出到文件：
    ```bash
    jstack <pid> > threaddump.txt
    ```

- **`jcmd`**：
  - `jcmd` 是一个更通用的命令行工具，它允许与运行中的 JVM 进行交互，执行各种操作，包括线程堆栈信息的获取。
  - `jcmd` 提供了更多的选项和功能，除了可以获取线程堆栈，还可以进行垃圾回收、类加载、JVM参数调整等操作。
  - `jcmd` 需要指定目标进程的 `pid` 和相关命令。

  **命令**：
  ```bash
  jcmd <pid> Thread.print
  ```

### 2. **输出格式的差异**

- **`jstack` 输出**：
  - 输出的内容是 JVM 中所有线程的堆栈信息。
  - 每个线程的堆栈是以线程 ID 为标识的，列出每个线程的状态（`RUNNABLE`、`WAITING`、`BLOCKED` 等），以及该线程的堆栈轨迹（即调用堆栈）。
  - 输出较为简洁，主要以文本形式显示。

  **示例 `jstack` 输出**：
  ```
  "main" #1 prio=5 os_prio=0 tid=0x0000000001b3a000 nid=0x2a8 runnable [0x0000000001b24000]
     java.lang.Thread.State: RUNNABLE
          at java.lang.StringBuilder.append(StringBuilder.java:173)
          at com.example.Main.main(Main.java:15)

  "Worker-1" #2 prio=5 os_prio=0 tid=0x0000000001b3b000 nid=0x2a9 waiting on condition [0x0000000001b25000]
     java.lang.Thread.State: WAITING (on object monitor)
          at com.example.Worker.run(Worker.java:30)
          - waiting to lock <0x00000000a0c03d30> (a java.lang.Object)
          at java.lang.Thread.run(Thread.java:748)
  ```

- **`jcmd` 输出**：
  - 输出与 `jstack` 类似，但更为结构化，尤其是当目标 JVM 是 Java 8 及以上版本时，`jcmd` 提供了更多的上下文信息。
  - `jcmd` 的输出除了线程堆栈信息外，还包括对线程状态的额外解释，例如线程正在等待的条件、堆栈上锁定的对象等。

  **示例 `jcmd` 输出**：
  ```
  Thread "main" #1 prio=5 os_prio=0 tid=0x0000000001b3a000 nid=0x2a8 runnable [0x0000000001b24000]
    java.lang.Thread.State: RUNNABLE
         at java.lang.StringBuilder.append(StringBuilder.java:173)
         at com.example.Main.main(Main.java:15)

  Thread "Worker-1" #2 prio=5 os_prio=0 tid=0x0000000001b3b000 nid=0x2a9 waiting on condition [0x0000000001b25000]
    java.lang.Thread.State: WAITING (on object monitor)
         at com.example.Worker.run(Worker.java:30)
         - waiting to lock <0x00000000a0c03d30> (a java.lang.Object)
         at java.lang.Thread.run(Thread.java:748)
  ```

  在某些情况下，`jcmd` 可能会包含更多的信息，例如：
  - **锁的信息**：`jcmd` 能显示线程等待的具体锁对象。
  - **线程的状态解释**：`jcmd` 能够提供比 `jstack` 更详细的线程状态信息。

### 3. **功能差异**

- **`jstack`**：
  - 仅用于生成线程堆栈（Thread Dump）。
  - 适用于生成完整的线程信息，并不支持其他 JVM 操作。
  
- **`jcmd`**：
  - 提供更多的功能，不仅仅限于生成线程堆栈。它是一个更加全面的命令行工具，可以执行多种操作：
    - 获取线程堆栈（`Thread.print`）。
    - 垃圾回收（`GC.run`）。
    - 类加载信息（`VM.classloader`）。
    - 查看 JVM 参数（`VM.flags`）。
    - JVM 性能监控等。

### 4. **使用场景的差异**
- **`jstack`** 更适合快速捕获线程堆栈信息，用于解决线程死锁、线程阻塞、长时间执行等问题。它简单且专注于堆栈信息。
  
- **`jcmd`** 更适合在一个命令行工具中执行多种不同的操作。它不仅可以捕获线程堆栈，还可以执行很多其他的调试、诊断和管理任务。

### 5. **总结对比**

| **特性**             | **jstack**                              | **jcmd**                                   |
|----------------------|-----------------------------------------|--------------------------------------------|
| **功能**             | 仅获取线程堆栈信息                     | 获取线程堆栈信息并执行其他JVM管理任务     |
| **输出内容**         | 简单的堆栈信息，线程状态与调用堆栈     | 线程堆栈信息，线程状态解释，锁信息等     |
| **使用方便性**       | 简单，适用于快速查看堆栈信息           | 更灵活，支持多种JVM操作和诊断任务        |
| **命令示例**         | `jstack <pid>`                          | `jcmd <pid> Thread.print`                  |
| **附加功能**         | 无                                      | 支持多种操作，如垃圾回收、类加载等       |

### 结论：
- **`jstack`** 是一个专门的工具，适用于快速获取 JVM 的线程堆栈信息，适合对线程状态进行快速分析。
- **`jcmd`** 是一个功能更强大的工具，提供了多种JVM操作，适合进行更复杂的诊断，支持更详细的线程状态和锁信息。

## 可视化分析工具

以下是一些常用的 **Thread Dump 可视化分析工具**，这些工具可以帮助开发者更好地理解 Thread Dump 的输出，并帮助诊断线程问题，如死锁、阻塞等。

所有这些工具都是开源的，且具有不同的功能和使用场景。

### 1. **Thread Dump Analyzer**
**Thread Dump Analyzer** 是一个简单且高效的工具，用于分析和可视化 Java Thread Dump。它支持线程堆栈信息的格式化显示，帮助识别死锁、线程阻塞等问题。其界面友好，适合用来查看 Thread Dump 输出。

- **特点**：
  - 分析线程堆栈信息，寻找死锁和线程阻塞。
  - 直观的界面，易于理解。
  - 支持保存分析结果。

- **网址**：
  - GitHub 页面：[https://github.com/softinstigate/Thread-Dump-Analyzer](https://github.com/softinstigate/Thread-Dump-Analyzer)

### 2. **VisualVM**
**VisualVM** 是一个功能强大的 JVM 监控、分析工具，提供图形界面，可以帮助开发者分析 JVM 的性能、内存使用、线程活动等。它不仅支持 Thread Dump 的分析，还可以监控内存、CPU、垃圾回收等。

- **特点**：
  - 可视化的 Thread Dump 分析。
  - 支持死锁分析。
  - 集成了多种 JVM 性能分析工具。
  - 支持插件扩展，功能可定制。

- **网址**：
  - 官方网站：[https://visualvm.github.io/](https://visualvm.github.io/)
  - GitHub 页面：[https://github.com/visualvm/visualvm](https://github.com/visualvm/visualvm)

### 3. **JStack Viewer**
**JStack Viewer** 是一个用于可视化分析 Java Thread Dump 的工具，它专注于让线程堆栈信息更加易于理解。它提供了一种清晰的方式来查看线程的状态、调用堆栈和锁信息，特别是在复杂的线程环境中。

- **特点**：
  - 支持格式化 Thread Dump 输出。
  - 高亮显示线程状态、锁信息。
  - 简单易用的界面。

- **网址**：
  - GitHub 页面：[https://github.com/kduman/JStackViewer](https://github.com/kduman/JStackViewer)

### 4. **Eclim (Thread Dump Viewer for Eclipse)**
**Eclim** 是一个 Eclipse 插件，用于可视化 Java Thread Dump。它将线程堆栈信息以更加结构化和易于理解的方式展示，适合在 Eclipse 开发环境中使用。

- **特点**：
  - 适用于 Eclipse 开发环境。
  - 支持显示线程堆栈、锁信息、死锁检测。
  - 集成到开发环境中，方便开发者使用。

- **网址**：
  - GitHub 页面：[https://github.com/holgerd77/eclim](https://github.com/holgerd77/eclim)

### 5. **Deadlock Detector**
**Deadlock Detector** 是一个 Java 程序死锁分析工具，专注于检测并报告线程死锁的情况。它提供了一种方式来分析 Thread Dump 输出，特别是死锁和锁竞争的检测。

- **特点**：
  - 专注于死锁检测。
  - 提供图形化的死锁分析视图。
  - 显示被锁定的线程和对象。

- **网址**：
  - GitHub 页面：[https://github.com/alexsuslin/deadlock-detector](https://github.com/alexsuslin/deadlock-detector)

### 6. **TDA (Thread Dump Analyzer)**
**TDA (Thread Dump Analyzer)** 是一个用于分析和展示 Thread Dump 的开源工具。它具有丰富的功能，包括死锁分析、线程状态分类、线程执行的堆栈信息的可视化等。

- **特点**：
  - 分析 Thread Dump 文件，展示线程状态、堆栈信息。
  - 可视化死锁信息。
  - 支持线程堆栈按时间、状态排序。
  
- **网址**：
  - GitHub 页面：[https://github.com/mvysny/tda](https://github.com/mvysny/tda)

### 7. **Thread Dump Analyzer by jvm-tools**
**Thread Dump Analyzer** 由 jvm-tools 提供，它是一个用于分析和查看线程堆栈的开源工具，提供了图形界面来分析死锁和阻塞的线程。

- **特点**：
  - 通过可视化的方式分析和查看线程堆栈。
  - 支持死锁分析、线程状态查看。
  - 基于 JavaFX，界面现代。

- **网址**：
  - GitHub 页面：[https://github.com/jvm-tools/thread-dump-analyzer](https://github.com/jvm-tools/thread-dump-analyzer)

---

### 总结

| **工具名称**             | **特点**                           | **网址**                                      |
|--------------------------|------------------------------------|-----------------------------------------------|
| **Thread Dump Analyzer**  | 简单易用，支持死锁和线程阻塞分析。  | [GitHub](https://github.com/softinstigate/Thread-Dump-Analyzer) |
| **VisualVM**              | 功能强大，支持多种 JVM 性能分析。    | [VisualVM 官网](https://visualvm.github.io/) |
| **JStack Viewer**         | 高亮显示线程状态和锁信息，易用性强。 | [GitHub](https://github.com/kduman/JStackViewer) |
| **Eclim**                 | 专为 Eclipse 提供的插件，集成环境使用 | [GitHub](https://github.com/holgerd77/eclim) |
| **Deadlock Detector**     | 专注于死锁分析，提供图形化视图。      | [GitHub](https://github.com/alexsuslin/deadlock-detector) |
| **TDA (Thread Dump Analyzer)** | 支持线程堆栈可视化与排序，死锁检测。  | [GitHub](https://github.com/mvysny/tda) |
| **jvm-tools Thread Dump Analyzer** | 基于 JavaFX，现代界面，支持死锁分析。 | [GitHub](https://github.com/jvm-tools/thread-dump-analyzer) |

这些工具都可以帮助开发者更好地分析 Thread Dump，特别是在面对复杂的多线程问题时，使用这些工具能够大大提高故障排查的效率。


# 参考资料

[Java堆转储Dump文件的几种方法](https://blog.nowcoder.net/n/0aae9acaa6c14aafb505d37fc6a7f4ec)

* any list
{:toc}
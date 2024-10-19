---
layout: post
title: jvm-43-jvm 参数配置 jvm 参数调优 最佳实践？
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

# 注意

不同的 jdk 版本，不同的内存配置。

需要对应的 jvm 参数配置也不同。

# chat

## jvm 的参数配置介绍？

Java虚拟机（JVM）参数配置是Java开发者和运维人员常用的一种技术手段，用于优化Java应用程序的性能和资源使用。以下是一些常见的JVM参数配置：

1. **堆内存设置**：
   - `-Xms<size>`：设置JVM启动时的初始堆大小。
   - `-Xmx<size>`：设置JVM可以使用的最大堆大小。

2. **新生代和老年代设置**：
   - `-Xmn<size>`：设置新生代的大小。
   - `-XX:NewSize=<size>`：设置新生代的初始大小。
   - `-XX:MaxNewSize=<size>`：设置新生代的最大大小。
   - `-XX:SurvivorRatio=<ratio>`：设置Eden区和Survivor区的大小比例。

3. **垃圾回收器选择**：
   - `-XX:+UseSerialGC`：使用串行垃圾回收器。
   - `-XX:+UseParallelGC`：使用并行垃圾回收器。
   - `-XX:+UseConcMarkSweepGC`：使用CMS垃圾回收器。
   - `-XX:+UseG1GC`：使用G1垃圾回收器。

4. **垃圾回收行为调优**：
   - `-XX:+PrintGCDetails`：打印详细的GC日志。
   - `-XX:+PrintGCTimeStamps`：打印GC的时间戳。
   - `-XX:+UseTLAB`：启用线程本地分配缓冲区（TLAB）。

5. **堆外内存设置**：
   - `-XX:MaxDirectMemorySize=size`：设置直接内存的最大值。

6. **JVM启动参数**：
   - `-Xbootclasspath/a:<jars>`：添加到系统类加载器的类路径。
   - `-D<name>=<value>`：设置系统属性。

7. **性能监控和分析**：
   - `-XX:+PrintCompilation`：打印JVM即时编译器编译的方法。
   - `-XX:+UnlockCommercialFeatures`：启用商业版JVM特性。
   - `-XX:+UnlockDiagnosticVMOptions`：启用诊断VM选项。

8. **线程和同步**：
   - `-XX:ThreadStackSize=<size>`：设置线程的栈大小。
   - `-XX:+UseBiasedLocking`：启用偏向锁。

9. **JVM启动和关闭**：
   - `-XX:OnOutOfMemoryError=<cmd>`：当发生内存溢出时执行的命令。
   - `-XX:+HeapDumpOnOutOfMemoryError`：在发生内存溢出时生成堆转储。

10. **安全设置**：
    - `-Djava.security.manager`：启用安全管理器。

这些参数可以根据应用程序的具体需求进行调整。

需要注意的是，不同的JVM实现（如Oracle HotSpot VM、OpenJ9等）可能支持不同的参数和特性。

在调整参数之前，建议阅读JVM的官方文档，了解每个参数的具体含义和可能的影响。同时，调整参数后应该进行充分的测试，以确保应用程序的稳定性和性能。

## 给一个 jvm 最佳的配置例子 jdk1.8 4c8g 机器，并且解释为什么这么配置

对于一个4核心8GB内存的机器，运行JDK 1.8，一个典型的JVM最佳配置可能如下：

```shell
-Xms4G -Xmx4G -Xmn2G -Xss1M -XX:MetaspaceSize=256M -XX:MaxMetaspaceSize=256M -XX:+UseParNewGC -XX:+UseConcMarkSweepGC -XX:CMSInitiatingOccupancyFraction=70 -XX:+UseCMSInitiatingOccupancyOnly -XX:+AlwaysPreTouch -XX:SurvivorRatio=8 -XX:MaxGCPauseMillis=200 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/heap/dump -XX:+PrintGCDetails -XX:+PrintGCDateStamps
```

参数解释：

```
-Xms4G: 设置JVM启动时的初始堆大小为4GB。
-Xmx4G: 设置JVM可以使用的最大堆大小为4GB，通常建议初始堆和最大堆设置一致，避免JVM在运行过程中频繁调整堆大小。
-Xmn2G: 设置新生代的大小为2GB，考虑到这是一个4核心的机器，新生代可以设置得相对较大，以减少Full GC的发生频率。新生代的大小通常建议为堆大小的1/3到1/2。
-Xss1M: 设置每个线程的栈大小为1MB，这通常对于大多数应用来说是足够的。
-XX:MetaspaceSize=256M: 设置元空间的初始大小为256MB，替代了永久代。
-XX:MaxMetaspaceSize=256M: 设置元空间的最大大小为256MB，避免元空间无限制地增长。
-XX:+UseParNewGC: 使用ParNew作为新生代的垃圾回收器，它是一个并行的、多线程的回收器。
-XX:+UseConcMarkSweepGC: 使用CMS作为老年代的垃圾回收器，它是一个以低延迟为目标的并发回收器。
-XX:CMSInitiatingOccupancyFraction=70: 设置CMS启动的内存占用阈值为70%，当老年代使用达到这个比例时，会触发CMS GC。
-XX:+UseCMSInitiatingOccupancyOnly: 仅在达到阈值时才触发CMS GC。
-XX:+AlwaysPreTouch: 在JVM启动时，预先分配并触摸内存页，减少JVM运行时的内存分配抖动。
-XX:SurvivorRatio=8: 设置Eden区和Survivor区的大小比例为8:1:1，这是一个常见的设置，但也可以根据应用的具体情况进行调整。
-XX:MaxGCPauseMillis=200: 设置最大的GC暂停时间目标为200毫秒，这个值可以根据应用的延迟要求进行调整。
-XX:+HeapDumpOnOutOfMemoryError: 当发生内存溢出时，自动生成堆转储文件，便于事后分析。
-XX:HeapDumpPath=/path/to/heap/dump: 设置堆转储文件的路径。
-XX:+PrintGCDetails: 打印详细的GC日志，便于监控和分析GC行为。
-XX:+PrintGCDateStamps: 在GC日志中包含时间戳。
```

这样的配置考虑了以下几个因素：

1. **堆内存大小**：考虑到机器的物理内存为8GB，JVM堆内存设置为4GB是合理的，这样既保证了JVM有足够的内存使用，也给操作系统和其他可能的进程留出了足够的空间。

2. **新生代和老年代的大小**：新生代设置为2GB可以减少GC的频率，因为大多数对象的生命周期都相对较短。老年代则根据剩余的堆内存来分配。

3. **垃圾收集器的选择**：ParNew和CMS的组合是一个常见的选择，它提供了较好的响应时间，适合需要快速响应的应用程序。

4. **元空间**：由于JDK 1.8开始使用元空间替代了永久代，因此需要设置元空间的初始大小和最大大小，以避免元空间过度膨胀。

5. **GC日志**：开启详细的GC日志可以帮助监控和分析GC行为，对于调优JVM参数非常有帮助。

6. **响应时间**：通过设置`-XX:MaxGCPauseMillis`参数来尽量控制GC的暂停时间在可接受的范围内。

请注意，这些参数需要根据具体的应用场景和性能测试结果进行调整。

没有一种配置能够适用于所有应用，因此建议在生产环境中进行充分的性能测试，并根据测试结果进行调优。

## jvm 参数调优的思路，以及常见方式？

JVM参数调优的思路通常遵循以下几个步骤：

1. **明确优化目标**：根据应用的特点，确定优化的侧重点。例如，是减少延迟、提高吞吐量还是降低内存占用。

2. **发现性能瓶颈**：通过监控工具和GC日志分析，发现性能瓶颈。例如，如果发现Full GC频繁发生，可能需要调整堆内存设置或选择不同的垃圾收集器。

3. **选择合适的垃圾收集器**：根据应用的需求选择适合的垃圾收集器。例如，对于延迟敏感的应用，可以选择CMS或G1收集器；对于吞吐量敏感的应用，可以选择Parallel或G1收集器。

4. **调整内存参数**：根据应用的内存需求和垃圾收集器的特性，调整堆内存、新生代、老年代和元空间的大小。

5. **监控和调整**：启用GC日志记录，监控GC行为，根据监控结果调整参数。

6. **性能测试**：在测试环境中对调整后的参数进行性能测试，确保它们能够满足性能需求。

7. **持续优化**：在生产环境中持续监控应用性能，并根据实际情况进行调整。

常见的JVM调优方式包括：

- **堆内存设置**：通过`-Xms`和`-Xmx`参数设置JVM堆的初始大小和最大大小。
- **新生代和老年代设置**：通过`-Xmn`、`-XX:NewRatio`和`-XX:SurvivorRatio`参数调整新生代和老年代的大小和比例。
- **垃圾收集器选择**：通过`-XX:+UseParallelGC`、`-XX:+UseConcMarkSweepGC`或`-XX:+UseG1GC`参数选择不同的垃圾收集器。
- **GC行为调优**：通过`-XX:MaxGCPauseMillis`、`-XX:GCTimeRatio`和`-XX:+UseAdaptiveSizePolicy`参数调整GC的行为和性能。
- **元空间（Metaspace）设置**：通过`-XX:MetaspaceSize`和`-XX:MaxMetaspaceSize`参数设置元空间的初始大小和最大大小。
- **性能监控**：通过`-XX:+PrintGCDetails`、`-XX:+PrintGCDateStamps`和`-Xloggc`参数启用和配置GC日志，以监控和分析GC性能。

调优时，需要根据应用的具体需求和表现来调整这些参数，并进行充分的测试以确保调优效果。

## jvm 参数配置的最佳实践

JVM参数配置的最佳实践通常遵循以下步骤和原则：

1. **明确调优目标**：根据应用的特点，确定是优化响应时间、吞吐量还是内存使用等。

2. **监控和分析**：在调优前，使用工具监控应用的性能，如CPU使用率、内存使用情况、GC日志等，以确定性能瓶颈。

3. **堆内存设置**：
   - `-Xms` 和 `-Xmx`：分别设置JVM的初始堆大小和最大堆大小。通常建议设置成相同的值，避免JVM在运行时动态调整堆大小，造成额外的性能开销。
   - `-Xmn`：设置新生代的大小，通常建议为整个堆的1/3到1/2，具体比例根据应用对象的生命周期来定。

4. **选择合适的垃圾收集器**：
   - 单核CPU：选择Serial GC。
   - 多核CPU，关注吞吐量：选择Parallel GC。
   - 多核CPU，关注响应时间：选择CMS或G1 GC（JDK 1.8及以后版本推荐G1 GC）。

5. **GC行为调优**：
   - `-XX:MaxGCPauseMillis`：设置期望的最大GC暂停时间，用于优化响应时间。
   - `-XX:GCTimeRatio`：设置用户代码运行时间与GC时间的比率，公式为1/(1+n)，其中n为GC时间占总时间的百分比。

6. **元空间（Metaspace）设置**：
   - `-XX:MetaspaceSize` 和 `-XX:MaxMetaspaceSize`：设置元空间的初始大小和最大大小，避免元空间无限制地增长导致内存溢出。

7. **性能监控**：
   - `-XX:+PrintGCDetails`：打印详细的GC日志。
   - `-XX:+PrintGCDateStamps`：在GC日志中包含时间戳。

8. **日志和监控**：
   - `-Xloggc`：指定GC日志的输出文件。
   - `-XX:+UseGCLogFileRotation`：开启GC日志文件的轮替。

9. **JVM性能调优**：
   - `-XX:+UseStringDeduplication`：开启字符串去重，减少堆内存的占用。
   - `-XX:+DisableExplicitGC`：禁用`System.gc()`的显式调用。

10. **持续优化**：在生产环境中持续监控应用性能，并根据实际情况进行调整。

注意事项：
- 调优参数需要根据具体应用的性能测试结果进行调整。
- 应用性能监控工具可以帮助更好地了解应用的运行情况和调优效果。
- 在生产环境中逐渐调整并观察每次调整的效果，避免一次性大规模变更。

对于一个4核心8GB内存的机器，一个典型的JVM最佳配置可能如下：

```sh
-Xms4G -Xmx4G -Xmn2G -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m -XX:+PrintGCDetails -XX:+PrintGCDateStamps
```
这样的配置考虑了堆内存、垃圾收集器、GC行为、元空间和性能监控的平衡，以实现较好的性能和资源利用。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[Java堆转储Dump文件的几种方法](https://blog.nowcoder.net/n/0aae9acaa6c14aafb505d37fc6a7f4ec)

* any list
{:toc}
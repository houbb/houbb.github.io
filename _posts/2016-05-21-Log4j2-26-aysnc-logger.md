---
layout: post
title: Log4j2-26-Asynchronous Loggers for Low-Latency Logging
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, best-practise, log4j2]
published: true
---

# 用于低延迟日志记录的异步记录器

- Asynchronous Loggers 

异步日志记录可以通过在单独的线程中执行 I/O 操作来提高应用程序的性能。 

Log4j 2 在这方面做出了许多改进。

异步 Logger 是 Log4j 2 中的新增功能。它们的目标是尽快从对 Logger.log 的调用返回到应用程序。 

您可以选择使所有记录器异步或混合使用同步和异步记录器。 

使所有记录器异步将提供最佳性能，而混合则为您提供更大的灵活性。

- LMAX Disruptor technology

LMAX 干扰器技术。 

异步记录器内部使用 Disruptor（一种无锁线程间通信库）而不是队列，从而实现更高的吞吐量和更低的延迟。

- 异步追加器 Asynchronous Appenders 

作为异步记录器工作的一部分，异步追加器已得到增强，可以在批处理结束时（当队列为空时）刷新到磁盘。 

这会产生与配置“immediateFlush=true”相同的结果，即所有接收到的日志事件始终在磁盘上可用，但效率更高，因为它不需要在每个日志事件上都接触磁盘。 

（异步 Appender 在内部使用 ArrayBlockingQueue，不需要类路径上的 Disruptor jar。）

# 权衡

尽管异步日志记录可以带来显着的性能优势，但在某些情况下您可能希望选择同步日志记录。 

本节描述异步日志记录的一些权衡。

## 好处

- 更高的峰值吞吐量。 

使用异步记录器，您的应用程序可以以同步记录器的 6 - 68 倍的速率记录消息。

这对于偶尔需要记录突发消息的应用程序来说尤其有趣。 异步日志记录可以通过缩短记录下一条消息之前的等待时间来帮助防止或抑制延迟峰值。 

如果队列大小配置得足够大以处理突发，异步日志记录将有助于防止您的应用程序在活动突然增加期间落后（尽可能多）。

- 降低日志记录响应时间延迟。 

响应时间延迟是在给定工作负载下调用 Logger.log 返回所需的时间。 

异步记录器的延迟始终低于同步记录器甚至基于队列的异步附加器。

## 缺点

错误处理。 如果在日志记录过程中发生问题并引发异常，则异步记录器或附加程序不太容易向应用程序发出此问题的信号。 通过配置 ExceptionHandler 可以部分缓解这个问题，但这可能仍然无法涵盖所有情况。 因此，如果日志记录是您业务逻辑的一部分，例如，如果您使用 Log4j 作为审核日志记录框架，我们建议同步记录这些审核消息。 （请注意，除了审计跟踪的同步日志记录之外，您仍然可以将它们组合起来并使用异步日志记录进行调试/跟踪日志记录。）

在一些罕见的情况下，必须小心可变消息。 大多数时候你不需要担心这个。 Log4 将确保像 logger.debug("My object is {}", myObject) 这样的日志消息将使用调用 logger.debug() 时 myObject 参数的状态。 即使稍后修改 myObject，日志消息也不会更改。 异步记录可变对象是安全的，因为 Log4j 内置的大多数 Message 实现都会获取参数的快照。 但也有一些例外：MapMessage 和 StructuredDataMessage 在设计上是可变的：创建消息对象后可以将字段添加到这些消息中。 这些消息在使用异步记录器或异步附加程序记录后不应被修改； 您可能会也可能不会在结果日志输出中看到修改。 同样，自定义消息实现在设计时应考虑异步使用，并且在构造时获取其参数的快照，或记录其线程安全特性。

如果您的应用程序运行在 CPU 资源稀缺的环境中，例如一台具有单核 CPU 的机器，则启动另一个线程不太可能提供更好的性能。

如果应用程序记录消息的持续速率快于底层追加器的最大持续吞吐量，则队列将填满，并且应用程序最终将以最慢的追加器的速度进行日志记录。 如果发生这种情况，请考虑选择更快的附加程序，或减少日志记录。 如果这两种方法都不可行，您可以通过同步日志记录获得更好的吞吐量和更少的延迟峰值。

# 使所有记录器异步

Log4j-2.9 及更高版本需要类路径上的disruptor-3.3.4.jar 或更高版本。 

在 Log4j-2.9 之前，需要 Disruptor-3.0.0.jar 或更高版本。

这是最简单的配置并提供最佳性能。 

要使所有记录器异步，请将disruptor jar添加到类路径并将系统属性log4j2.contextSelector设置为org.apache.logging.log4j.core.async.AsyncLoggerContextSelector或org.apache.logging.log4j.core.async.BasicAsyncLoggerContextSelector。

默认情况下，异步记录器不会将位置传递给 I/O 线程。 

如果您的布局或自定义过滤器之一需要位置信息，则需要在所有相关记录器（包括根记录器）的配置中设置“includeLocation=true”。

不需要位置的配置可能如下所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
 
<!-- Don't forget to set system property
-Dlog4j2.contextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector
or
-Dlog4j2.contextSelector=org.apache.logging.log4j.core.async.BasicAsyncLoggerContextSelector
     to make all loggers asynchronous. -->
 
<Configuration status="WARN">
  <Appenders>
    <!-- Async Loggers will auto-flush in batches, so switch off immediateFlush. -->
    <RandomAccessFile name="RandomAccessFile" fileName="async.log" immediateFlush="false" append="false">
      <PatternLayout>
        <Pattern>%d %p %c{1.} [%t] %m %ex%n</Pattern>
      </PatternLayout>
    </RandomAccessFile>
  </Appenders>
  <Loggers>
    <Root level="info" includeLocation="false">
      <AppenderRef ref="RandomAccessFile"/>
    </Root>
  </Loggers>
</Configuration>
```

当使用 AsyncLoggerContextSelector 或 BasicAsyncLoggerContextSelector 使所有记录器异步时，请确保在配置中使用正常的 `<root>` 和 `<logger>` 元素。 

上下文选择器将确保所有记录器都是异步的，使用的机制与配置 `<asyncRoot>` 或 `<asyncLogger>` 时发生的情况不同。 

后面的元素用于混合异步与同步记录器。 

如果同时使用这两种机制，您最终会得到两个后台线程，其中应用程序将日志消息传递给线程 A，线程 A 将消息传递给线程 B，然后线程 B 最终将消息记录到磁盘。 

这可行，但中间会有一个不必要的步骤。

您可以使用一些系统属性来控制异步日志记录子系统的各个方面。 其中一些可用于调整日志记录性能。

还可以通过创建名为 log4j2.component.properties 的文件并将该文件包含在应用程序的类路径中来指定以下属性。

请注意，Log4j 2.10.0 中的系统属性已重命名为更一致的样式。 

仍然支持所有旧的属性名称，这些名称已记录在此处。

## System Properties to configure all asynchronous loggers

### log4j2.asyncLoggerExceptionHandler

### log4j2.asyncLoggerRingBufferSize

### log4j2.asyncLoggerWaitStrategy

### log4j2.asyncLoggerTimeout

### log4j2.asyncLoggerSleepTimeNs

### log4j2.asyncLoggerRetries

### AsyncLogger.SynchronizeEnqueueWhenQueueFull

### log4j2.asyncLoggerThreadNameStrategy

### log4j2.clock

即使底层附加程序无法跟上日志记录速率并且队列已满，也可以使用一些系统属性来维持应用程序吞吐量。 

请参阅系统属性 log4j2.asyncQueueFullPolicy 和 log4j2.discardThreshold 的详细信息。

# 混合同步和异步记录器

Log4j-2.9 及更高版本需要类路径上的disruptor-3.3.4.jar 或更高版本。 在 Log4j-2.9 之前，需要 Disruptor-3.0.0.jar 或更高版本。 

无需将系统属性“Log4jContextSelector”设置为任何值。

同步和异步记录器可以在配置中组合。 这为您提供了更大的灵活性，但代价是性能略有下降（与使所有记录器异步相比）。 

使用 `<asyncRoot>` 或 `<asyncLogger>` 配置元素指定需要异步的记录器。 

一项配置只能包含一个根记录器（`<root>` 或 `<asyncRoot>` 元素），但否则可以组合异步和非异步记录器。 

例如，包含 `<asyncLogger>` 元素的配置文件还可以包含同步记录器的 `<root>` 和 `<logger>` 元素。

默认情况下，异步记录器不会将位置传递给 I/O 线程。 

如果您的布局或自定义过滤器之一需要位置信息，则需要在所有相关记录器（包括根记录器）的配置中设置“includeLocation=true”。

混合异步记录器的配置可能如下所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
 
<!-- No need to set system property "log4j2.contextSelector" to any value
     when using <asyncLogger> or <asyncRoot>. -->
 
<Configuration status="WARN">
  <Appenders>
    <!-- Async Loggers will auto-flush in batches, so switch off immediateFlush. -->
    <RandomAccessFile name="RandomAccessFile" fileName="asyncWithLocation.log"
              immediateFlush="false" append="false">
      <PatternLayout>
        <Pattern>%d %p %class{1.} [%t] %location %m %ex%n</Pattern>
      </PatternLayout>
    </RandomAccessFile>
  </Appenders>
  <Loggers>
    <!-- pattern layout actually uses location, so we need to include it -->
    <AsyncLogger name="com.foo.Bar" level="trace" includeLocation="true">
      <AppenderRef ref="RandomAccessFile"/>
    </AsyncLogger>
    <Root level="info" includeLocation="true">
      <AppenderRef ref="RandomAccessFile"/>
    </Root>
  </Loggers>
</Configuration>
```

# 策略

参考资料

> [asyncQueueFullPolicy](https://logging.apache.org/log4j/2.x/manual/configuration.html#asyncQueueFullPolicy)

## log4j2.asyncQueueFullPolicy (log4j2.AsyncQueueFullPolicy)

异步记录器和 AsyncAppender 使用它来维持应用程序吞吐量，即使底层附加程序无法跟上记录速率并且队列已满时也是如此。

如果未指定值（默认），则事件永远不会被丢弃。 

如果队列已满，记录器调用将阻塞，直到可以将事件添加到队列中。

指定“丢弃”可在队列已满时丢弃级别等于或小于阈值级别（默认为 INFO）的事件。

## log4j2.discardThreshold(log4j2.DiscardThreshold)

由 DiscardingAsyncQueueFullPolicy 用于确定当队列变满时要删除哪些事件。 

默认情况下，当队列已满时，INFO、DEBUG 和 TRACE 级别的事件将被丢弃。 

仅当将 Discard 指定为 log4j2.AsyncQueueFullPolicy 时，此属性才有效。

# 参考资料

https://logging.apache.org/log4j/2.x/manual/async.html

* any list
{:toc}

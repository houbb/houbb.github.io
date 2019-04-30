---
layout: post
title:  Netty-11-EventLoop 之任务调度
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, schedule, sh]
published: true
---

# 任务调度

偶尔，你将需要调度一个任务以便稍后（延迟）执行或者周期性地执行。

例如，你可能想要注册一个在客户端已经连接了 5 分钟之后触发的任务。

一个常见的用例是，发送心跳消息到远程节点，以检查连接是否仍然还活着。如果没有响应，你便知道可以关闭该Channel 了。

在接下来的几节中，我们将展示如何使用核心的Java API 和Netty 的EventLoop 来调度任务。

然后，我们将研究 Netty 的内部实现，并讨论它的优点和局限性。

# JDK 的任务调度API

在Java 5 之前，任务调度是建立在java.util.Timer 类之上的，其使用了一个后台Thread，并且具有与标准线程相同的限制。

随后，JDK 提供了java.util.concurrent 包，它定义了interface ScheduledExecutorService。

## 相关方法

- newScheduledThreadPool(int corePoolSize)/newScheduledThreadPool(int corePoolSize,ThreadFactorythreadFactory)

创建一个ScheduledThreadExecutorService，用于调度命令在指定延迟之后运行或者周期性地执行。

它使用corePoolSize 参数来计算线程数

- newSingleThreadScheduledExecutor()/newSingleThreadScheduledExecutor(ThreadFactorythreadFactory)

创建一个ScheduledThreadExecutorService，用于调度命令在指定延迟之后运行或者周期性地执行。它使用一个线程来执行被调度的任务

虽然选择不是很多但是这些预置的实现已经足以应对大多数的用例。

## 使用案例

```java
ScheduledExecutorService executor = Executors.newScheduledThreadPool(10);
ScheduledFuture<?> future = executor.schedule(
new Runnable() {
    @Override
    public void run() {
        System.out.println("60 seconds later");
    }
}, 60, TimeUnit.SECONDS);
...
executor.shutdown();
```

虽然ScheduledExecutorService API 是直截了当的，但是在高负载下它将带来性能上的负担。

在下一节中，我们将看到Netty 是如何以更高的效率提供相同的功能的。

## 个人疑问

什么负担？线程上下文的切换负担吗？

那 netty 又是怎么解决的呢？

# 使用EventLoop 调度任务

ScheduledExecutorService 的实现具有局限性。

例如，事实上作为线程池管理的一部分，将会有额外的线程创建。

如果有大量任务被紧凑地调度，那么这将成为一个瓶颈。

## 示例

Netty 通过Channel 的EventLoop 实现任务调度解决了这一问题，如代码清单7-3 所示。

- 7.3 使用 EventLoop 调度任务

```java
Channel ch = ...
ScheduledFuture<?> future = ch.eventLoop().schedule(
new Runnable() {
    @Override
    public void run() {
        System.out.println("60 seconds later");
    }
}, 60, TimeUnit.SECONDS);
```

经过60 秒之后，Runnable 实例将由分配给Channel 的EventLoop 执行。

如果要调度任务以每隔60 秒执行一次，请使用scheduleAtFixedRate()方法，如代码清单7-4 所示。

- 7.4 使用 EventLoop 调度周期性的任务

```java
Channel ch = ...
ScheduledFuture<?> future = ch.eventLoop().scheduleAtFixedRate(
new Runnable() {
    @Override
    public void run() {
        System.out.println("Run every 60 seconds");
    }
}, 60, 60, TimeUnit.Seconds);
```

如我们前面所提到的，Netty的EventLoop扩展了ScheduledExecutorService（见图7-2），所以它提供了使用JDK实现可用的所有方法，包括在前面的示例中使用到的schedule()和scheduleAtFixedRate()方法。

所有操作的完整列表可以在ScheduledExecutorService的Javadoc中找到

- 7-5 使用ScheduledFuture 取消任务

要想取消或者检查（被调度任务的）执行状态，可以使用每个异步操作所返回的Scheduled-Future

```java
ScheduledFuture<?> future = ch.eventLoop().scheduleAtFixedRate(...);
// Some other code that runs...
boolean mayInterruptIfRunning = false;
future.cancel(mayInterruptIfRunning);
```

这些例子说明，可以利用 Netty 的任务调度功能来获得性能上的提升。

反过来，这些也依赖于底层的线程模型，我们接下来将对其进行研究。

# 拓展阅读

[quartz](https://houbb.github.io/2017/12/19/quartz)

# 个人收获

1、 理解最基础的知识才是最重要的。

比如：如何实现定时任务？自己实现的话。在底层方面？

2、思想是相通的，在一个地方需要的技术，在很多地方都是需要的。所以没必要学过多的看起来新颖的技术。

伟大始于渺小，前沿源于过往。

3、Future

在编程中和金融中都有这个词，感觉都挺有趣。

# 参考资料

《Netty in Action》 P117

* any list
{:toc}



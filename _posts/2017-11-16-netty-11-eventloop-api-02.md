---
layout: post
title:  Netty-11-EventLoop 之接口 API
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, api, sh]
published: true
---

# EventLoop 接口

运行任务来处理在连接的生命周期内发生的事件是任何网络框架的基本功能。

与之相应的编程上的构造通常被称为事件循环—一个 Netty 使用了 interface io.netty.channel.EventLoop 来适配的术语。

## 定义 

Netty的EventLoop在继承了ScheduledExecutorService的同时，只定义了一个方法，parent()。 

这个方法，如下面的代码片断所示，用于返回到当前EventLoop实现的实例所属的EventLoopGroup的引用。

- 7.0 EventLoop 接口定义

```java
public interface EventLoop extends OrderedEventExecutor, EventLoopGroup {
    @Override
    EventLoopGroup parent();
}
```

## 示例

代码清单7-1 中说明了事件循环的基本思想，其中每个任务都是一个Runnable 的实例。

- 7.1 循环中执行事件

```java
while (!terminated) {
    List<Runnable> readyEvents = blockUntilEventsReady();
    for (Runnable ev: readyEvents) {
        ev.run();
    }
}
```

## 设计理念

Netty 的 EventLoop 是协同设计的一部分，它采用了两个基本的API：并发和网络编程。

首先，io.netty.util.concurrent 包构建在JDK 的java.util.concurrent 包上，用来提供线程执行器。

其次，io.netty.channel 包中的类，为了与Channel 的事件进行交互，扩展了这些接口/类。

在这个模型中，一个EventLoop 将由一个永远都不会改变的Thread 驱动，同时任务（Runnable 或者Callable）可以直接提交给EventLoop 实现，以立即执行或者调度执行。

根据配置和可用核心的不同，可能会创建多个EventLoop 实例用以优化资源的使用，并且单个 EventLoop 可能会被指派用于服务多个Channel。

## 事件/任务的执行顺序 

事件和任务是以先进先出（FIFO）的顺序执行的。这样可以通过保证字节内容总是按正确的顺序被处理，消除潜在的数据损坏的可能性。

# Netty4 处理方式

正如我们在第6 章中所详细描述的，由I/O 操作触发的事件将流经安装了一个或者多个ChannelHandler 的ChannelPipeline。

传播这些事件的方法调用可以随后被ChannelHandler 所拦截，并且可以按需地处理事件。

事件的性质通常决定了它将被如何处理；它可能将数据从网络栈中传递到你的应用程序中，或者进行逆向操作，或者执行一些截然不同的操作。

但是事件的处理逻辑必须足够的通用和灵活，以处理所有可能的用例。

因此，在Netty 4 中，所有的I/O操作和事件都由已经被分配给了EventLoop的那个Thread来处理。


# Netty 3 中的I/O 操作

在以前的版本中所使用的线程模型只保证了入站（之前称为上游）事件会在所谓的I/O 线程（对应于Netty 4 中的EventLoop）中执行。

所有的出站（下游）事件都由调用线程处理，其可能是I/O 线程也可能是别的线程。

开始看起来这似乎是个好主意，但是已经被发现是有问题的，因为需要在ChannelHandler 中对出站事件进行仔细的同步。

简而言之，不可能保证多个线程不会在同一时刻尝试访问出站事件。

例如，如果你通过在不同的线程中调用 Channel.write() 方法，针对同一个Channel 同时触发出站的事件，就会发生这种情况。

当出站事件触发了入站事件时，将会导致另一个负面影响。

当Channel.write()方法导致异常时，需要生成并触发一个exceptionCaught 事件。

但是在Netty 3 的模型中，由于这是一个入站事件，需要在调用线程中执行代码，然后将事件移交给I/O 线程去执行，然而这将带来额外的上下文切换。

Netty 4 中所采用的线程模型，通过在同一个线程中处理某个给定的EventLoop 中所产生的所有事件，解决了这个问题。

这提供了一个更加简单的执行体系架构，并且消除了在多个ChannelHandler 中进行同步的需要（除了任何可能需要在多个Channel 中共享的）。

现在，已经理解了EventLoop 的角色，让我们来看看任务是如何被调度执行的吧。


# 协同设计

协同设计是指为了完成某一设计目标，由两个或两个以上设计主体(或称专家)，通过一定的信息交换和相互协同机制，分别以不同的设计任务共同完成这一设计目标。

# 个人收获

- 框架设计与标准(jdk) 尽可能的兼容。

好处是，如果后续 jdk 对某一个功能进行增强，那么可以直接获取这种收益。

- 接口的向前兼容性。

不要轻易删除一个接口。要保证所有接口使用废弃，而不是直接删除。

- 好的框架是通过不断进化而来的

可见 netty-4 优于 netty-3 的方式，是通过更加简单的方式去解决问题。

# 参考资料

《Netty in Action》 P113

- 协同设计

[协同设计](https://wiki.mbalib.com/wiki/%E5%8D%8F%E5%90%8C%E8%AE%BE%E8%AE%A1)

* any list
{:toc}



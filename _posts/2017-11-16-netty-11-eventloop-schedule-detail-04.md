---
layout: post
title:  Netty-11-EventLoop 之任务调度实现
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, schedule, sh]
published: true
---

# 实现细节

这一节将更加详细地探讨Netty 的线程模型和任务调度实现的主要内容。

我们也将会提到需要注意的局限性，以及正在不断发展中的领域。

# 线程管理

Netty线程模型的卓越性能取决于对于当前执行的Thread的身份的确定它是否是分配给当前Channel以及它的EventLoop的那一个线程。

（回想一下EventLoop将负责处理一个Channel的整个生命周期内的所有事件。）

如果（当前）调用线程正是支撑EventLoop 的线程，那么所提交的代码块将会被（直接）执行。

否则，EventLoop 将调度该任务以便稍后执行，并将它放入到内部队列中。

当EventLoop下次处理它的事件时，它会执行队列中的那些任务/事件。这也就解释了任何的Thread 是如何与Channel 直接交互而无需在ChannelHandler 中进行额外同步的。

注意，每个EventLoop 都有它自已的任务队列，独立于任何其他的EventLoop。

图7-3展示了EventLoop 用于调度任务的执行逻辑。

这是Netty 线程模型的关键组成部分。

- 7.3 伪代码

```
任务==》EventLoop
bool flag = 当前调用线程是否隶属于 EventLoop
if(flag) {
    // 执行
} else {
    // 加入 EventLoop 待执行队列
}
```

我们之前已经阐明了不要阻塞当前I/O 线程的重要性。

我们再以另一种方式重申一次：“永远不要将一个长时间运行的任务放入到执行队列中，因为它将阻塞需要在同一线程上执行的任何其他任务。”

如果必须要进行阻塞调用或者执行长时间运行的任务，我们建议使用一个专门的EventExecutor。

除了这种受限的场景，如同传输所采用的不同的事件处理实现一样，所使用的线程模型也可以强烈地影响到排队的任务对整体系统性能的影响。

（如同我们在第4 章中所看到的，使用Netty可以轻松地切换到不同的传输实现，而不需要修改你的代码库。）

# EventLoop/线程的分配

服务于Channel 的I/O 和事件的EventLoop 包含在EventLoopGroup 中。

根据不同的传输实现，EventLoop 的创建和分配方式也不同。

## 1．异步传输

异步传输实现只使用了少量的EventLoop（以及和它们相关联的Thread），而且在当前的线程模型中，它们可能会被多个Channel 所共享。

这使得可以通过尽可能少量的Thread 来支撑大量的Channel，而不是每个Channel 分配一个Thread。

图7-4 显示了一个EventLoopGroup，它具有3 个固定大小的EventLoop（每个EventLoop都由一个Thread 支撑）。

在创建EventLoopGroup 时就直接分配了EventLoop（以及支撑它们的Thread），以确保在需要时它们是可用的。

EventLoopGroup 负责为每个新创建的Channel 分配一个EventLoop。

在当前实现中，使用顺序循环（round-robin）的方式进行分配以获取一个均衡的分布，并且相同的EventLoop可能会被分配给多个Channel。

（这一点在将来的版本中可能会改变。）

一旦一个Channel 被分配给一个EventLoop，它将在它的整个生命周期中都使用这个EventLoop（以及相关联的Thread）。

请牢记这一点，因为它可以使你从担忧你的ChannelHandler 实现中的线程安全和同步问题中解脱出来。

另外，需要注意的是，EventLoop 的分配方式对ThreadLocal 的使用的影响。因为一个EventLoop 通常会被用于支撑多个Channel，所以对于所有相关联的Channel 来说，

ThreadLocal 都将是一样的。这使得它对于实现状态追踪等功能来说是个糟糕的选择。

然而，在一些无状态的上下文中，它仍然可以被用于在多个Channel 之间共享一些重度的或者代价昂贵的对象，甚至是事件。

### 个人理解

EventLoopGroup 就类似一个线程池，管理着每一个 EventLoop。

每一个 EventLoop 对应着一个 thread。

EventLoopGroup 负责为每一个 channel 分配一个 EventLoop。

## 阻塞传输

用于像OIO（旧的阻塞I/O）这样的其他传输的设计略有不同，

如图7-5 所示。这里每一个Channel 都将被分配给一个EventLoop（以及它的Thread）。

```
1. EventLoop 由 EventLoopGroup 分配。每一个新的 channel 都分配一个新的 EventLoop
2. 分配给 channel 的 EventLoop 负责其生命周期的所有事件和任务。
3. Channel 绑定到 EventLoop
```

如果你开发的应用程序使用过java.io 包中的阻塞I/O 实现，你可能就遇到过这种模型。

但是，正如同之前一样，得到的保证是每个Channel 的I/O 事件都将只会被一个Thread（用于支撑该Channel 的EventLoop 的那个Thread）处理。

这也是另一个Netty 设计一致性的例子，它（这种设计上的一致性）对Netty 的可靠性和易用性做出了巨大贡献。

# 个人收获

1. 框架的设计要保证不同模式的一致性。

# 参考资料

《Netty in Action》 P119

* any list
{:toc}



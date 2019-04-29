---
layout: post
title:  Netty-10-ChannelHandler 异常处理
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, exception, sh]
published: false
---

# 异常处理

异常处理是任何真实应用程序的重要组成部分，它也可以通过多种方式来实现。

因此，Netty提供了几种方式用于处理入站或者出站处理过程中所抛出的异常。

这一节将帮助你了解如何设计最适合你需要的方式。

# 处理入站异常

如果在处理入站事件的过程中有异常被抛出，那么它将从它在ChannelInboundHandler里被触发的那一点开始流经ChannelPipeline。

要想处理这种类型的入站异常，你需要在你的ChannelInboundHandler 实现中重写下面的方法。

```java
public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception
```

代码清单6-12 展示了一个简单的示例，其关闭了Channel 并打印了异常的栈跟踪信息。

```java
public class InboundExceptionHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx,  Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

因为异常将会继续按照入站方向流动（就像所有的入站事件一样），所以实现了前面所示逻辑的 ChannelInboundHandler 通常位于ChannelPipeline 的最后。

这确保了所有的入站异常都总是会被处理，无论它们可能会发生在 ChannelPipeline 中的什么位置。

你应该如何响应异常，可能很大程度上取决于你的应用程序。

你可能想要关闭Channel（和连接），也可能会尝试进行恢复。

如果你不实现任何处理入站异常的逻辑（或者没有消费该异常），

那么Netty将会记录该异常没有被处理的事实


## 总结一下：

1. ChannelHandler.exceptionCaught() 的默认实现是简单地将当前异常转发给 ChannelPipeline 中的下一个ChannelHandler；

2. 如果异常到达了 ChannelPipeline 的尾端，它将会被记录为未被处理；

3. 要想定义自定义的处理逻辑，你需要重写 exceptionCaught() 方法。然后你需要决定是否需要将该异常传播出去。

# 处理出站异常

用于处理出站操作中的正常完成以及异常的选项，都基于以下的通知机制。

1. 每个出站操作都将返回一个ChannelFuture。注册到ChannelFuture 的ChannelFutureListener 将在操作完成时被通知该操作是成功了还是出错了。

2. 几乎所有的ChannelOutboundHandler 上的方法都会传入一个ChannelPromise的实例。作为ChannelFuture 的子类，ChannelPromise 也可以被分配用于异步通
知的监听器。但是，ChannelPromise 还具有提供立即通知的可写方法：

```java
ChannelPromise setSuccess();
Chan nelPromise setFailure(Throwable cause);
```

添加 ChannelFutureListener 只需要调用ChannelFuture 实例上的addListener(ChannelFutureListener)方法，并且有两种不同的方式可以做到这一点。

其中最常用的方式是，调用出站操作（如write()方法）所返回的 ChannelFuture 上的 addListener() 方法。

- 6-13

代码清单6-13 使用了这种方式来添加ChannelFutureListener，它将打印栈跟踪信息并且随后关闭Channel。

```java
ChannelFuture future = channel.write(someMessage);
future.addListener(new ChannelFutureListener() {
    @Override
    public void operationComplete(ChannelFuture f) {
        if (!f.isSuccess()) {
            f.cause().printStackTrace();
            f.channel().close();
        }
    }
});
```

第二种方式是将ChannelFutureListener 添加到即将作为参数传递给ChannelOutboundHandler的方法的ChannelPromise。


- 6-14

代码清单 6-14 中所展示的代码和代码清单6-13中所展示的具有相同的效果。

```java
public class OutboundExceptionHandler extends ChannelOutboundHandlerAdapter {
    @Override
    public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) {
        promise.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture f) {
                if (!f.isSuccess()) {
                    f.cause().printStackTrace();
                    f.channel().close();
                }   
            }
        });
    }
}
```

# ChannelPromise 的可写方法

通过调用ChannelPromise 上的setSuccess()和setFailure()方法，可以使一个操作的状态在ChannelHandler 的方法返回给其调用者时便即刻被感知到。

为何选择一种方式而不是另一种呢？对于细致的异常处理，你可能会发现，在调用出站操作时添加ChannelFutureListener 更合适，如代码清单6-13 所示。

而对于一般的异常处理，你可能会发现，代码清单6-14 所示的自定义的ChannelOutboundHandler 实现的方式更加的简单。

如果你的ChannelOutboundHandler 本身抛出了异常会发生什么呢？

在这种情况下，Netty 本身会通知任何已经注册到对应ChannelPromise 的监听器。

# 参考资料

《Netty in Action》 P110

* any list
{:toc}
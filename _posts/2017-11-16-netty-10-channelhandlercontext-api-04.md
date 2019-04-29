---
layout: post
title:  Netty-10-ChannelHandlerContext API
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, api, sh]
published: false
---

# ChannelHandlerContext 接口

ChannelHandlerContext 代表了ChannelHandler 和 ChannelPipeline 之间的关联，每当有 ChannelHandler 添加到 ChannelPipeline 中时，都会创建ChannelHandlerContext。

ChannelHandlerContext 的主要功能是管理它所关联的ChannelHandler 和在同一个ChannelPipeline 中的其他ChannelHandler 之间的交互。

ChannelHandlerContext 有很多的方法，其中一些方法也存在于 Channel 和 ChannelPipeline 本身上，但是有一点重要的不同。

如果调用 Channel 或者 ChannelPipeline 上的这些方法，它们将沿着整个ChannelPipeline 进行传播。

而调用位于 ChannelHandlerContext 上的相同方法，则将从当前所关联的 ChannelHandler 开始，并且只会传播给位于该 ChannelPipeline 中的下一个能够处理该事件的 ChannelHandler。

## API

api 用于查阅，不用记忆。

```
方法名称	描述
alloc	返回和这个实例相关的Channel所配置的ByteBufAllocator
bind	绑定到给定的SocketAddress，并返回ChannelFuture
channel	返回绑定到这个实例的Channel
close	关闭Channel，并返回ChannelFuture
connect	连接给定的SocketAddress，并返回ChannelFuture
deregister	从之前分配的EventExecutor注销，并返回ChannelFuture
disconnect	从远程节点断开，并返回ChannelFuture
executor	返回调度事件的EventExecutor
fireChannelActive	触发对下一个ChannelInboundHandler上的channelActive()方法的调用
fireChannelInActive	触发下一个ChannelInboundHandler上的channelInActive()方法
fireChannelRead	触发对下一个ChannelInboundHandler上的channelRead()方法
fireChannelReadComplete	触发对下一个ChannelInboundHandler上的channelReadComplete()方法的调用
fireChannelRegistered	触发对下一个ChanneInboundHandler上的fireChannelRegistered方法的调用
fireChannelUnregistered	触发对下一个ChannelInboundHandler上的fireChannelUnregistered方法的调用
fireChannelWritabilityChanged	触发对下一个ChannelInboundHandler上的fireChannelWritabilityChanged方法的调用
fireExceptionCaught	触发对下一个ChannelInboundHandler上的fireExceptionCaught方法的调用
fireUserEventTriggered	触发对下一个ChannelInboundHandler上的fireUserEventTriggered(Object evt)方法的调用
handler	返回绑定到这个实例的ChannelHandler
isRemoved	如果从关联的ChannelHandler已经被从ChannelPipeline中移除则返回true
name	返回这个实例的唯一名称
pipeline	返回这个实例相关联的ChannelPipeline
read	将数据从Channel读取到第一个入站缓冲区；如果读取成功则触发一个channelRead事件，并（在最后一个消息被被读取完成后）通知ChannelInboundHandler的channelReadComplete(ChannelHandlerContext)方法
write	通过这个实例写入消息并经过ChannelPipeline
writeAndFlush	通过这个实例写入并冲刷消息并经过ChannelPipeline
```

当使用 ChannelHandlerContext 的 API 的时候，请牢记以下两点：

1. ChannelHandlerContext 和 ChannelHandler 之间的关联（绑定）是永远不会改变的，所以缓存对它的引用是安全的；

2. 如同我们在本节开头所解释的一样，相对于其他类的同名方法，ChannelHandlerContext 的方法将产生更短的事件流，应该尽可能地利用这个特性来获得最大的性能。

# 使用 ChannelHandlerContext

我们将说明 ChannelHandlerContext的用法 ，以及ChannelHandlerContext, Channel 和 ChannelPipeline 这些类中方法的不同表现。

## 关联关系

下图展示了 ChannelPipeline, Channel, ChannelHandler 和 ChannelHandlerContext 的关系

![ChannelHandlerContext](https://7n.w3cschool.cn/attachments/image/20170808/1502159866928817.jpg)

1. Channel 绑定到 ChannelPipeline

2. ChannelPipeline 绑定到 包含 ChannelHandler 的 Channel

3. ChannelHandler

4. 当添加 ChannelHandler 到 ChannelPipeline 时，ChannelHandlerContext 被创建

## 示例代码

下面展示了， 从 ChannelHandlerContext 获取到 Channel 的引用，通过调用 Channel 上的 write() 方法来触发一个 写事件到通过管道的的流中

Listing 6.6 Accessing the Channel from a ChannelHandlerContext

```java
ChannelHandlerContext ctx = context;
Channel channel = ctx.channel();  // 得到与 ChannelHandlerContext 关联的 Channel 的引用
channel.write(Unpooled.copiedBuffer("Netty in Action",  CharsetUtil.UTF_8));  //通过 Channel 写缓存
```

下面展示了 从 ChannelHandlerContext 获取到 ChannelPipeline 的相同示例

Listing 6.7 Accessing the ChannelPipeline from a ChannelHandlerContext

```java
ChannelHandlerContext ctx = context;
ChannelPipeline pipeline = ctx.pipeline(); //得到与 ChannelHandlerContext 关联的 ChannelPipeline 的引用
pipeline.write(Unpooled.copiedBuffer("Netty in Action", CharsetUtil.UTF_8));  //通过 ChannelPipeline 写缓冲区
```

流在两个清单6.6和6.7是一样的,如图6.4所示。

重要的是要注意,虽然在 Channel 或者 ChannelPipeline 上调用 write() 都会把事件在整个管道传播, 但是在 ChannelHandler 级别上，从一个处理程序转到下一个却要通过在 ChannelHandlerContext 调用方法实现。

![write 流程](https://7n.w3cschool.cn/attachments/image/20170808/1502159893150498.jpg)

1. 事件传递给 ChannelPipeline 的第一个 ChannelHandler

2. ChannelHandler 通过关联的 ChannelHandlerContext 传递事件给 ChannelPipeline 中的 下一个

3. ChannelHandler 通过关联的 ChannelHandlerContext 传递事件给 ChannelPipeline 中的 下一个

Figure 6.4 Event propagation via the Channel or the ChannelPipeline

为什么你可能会想从 ChannelPipeline 一个特定的点开始传播一个事件?

1. 通过减少 ChannelHandler 不感兴趣的事件的传递，从而减少开销

2. 排除掉特定的对此事件感兴趣的处理程序的处理

想要实现从一个特定的 ChannelHandler 开始处理，你必须引用与此 ChannelHandler 的前一个 ChannelHandler 关联的 ChannelHandlerContext。

这个ChannelHandlerContext 将会调用与自身关联的 ChannelHandler 的下一个ChannelHandler。

下面展示了使用场景

Listing 6.8 Events via ChannelPipeline

```java
ChannelHandlerContext ctx = context;    //获得 ChannelHandlerContext 的引用
ctx.write(Unpooled.copiedBuffer("Netty in Action", CharsetUtil.UTF_8)); //write() 将会把缓冲区发送到下一个 ChannelHandler
```

如下所示,消息将会从下一个 ChannelHandler 开始流过 ChannelPipeline, 绕过所有在它之前的ChannelHandler。

![](https://7n.w3cschool.cn/attachments/image/20170808/1502159903932444.jpg)

1. ChannelHandlerContext 方法调用

2. 事件发送到了下一个 ChannelHandler

3. 经过最后一个ChannelHandler后，事件从 ChannelPipeline 移除

我们刚刚描述的用例是一种常见的情形,当我们想要调用某个特定的 ChannelHandler操作时，它尤其有用。


# ChannelHandler 和 ChannelHandlerContext 的高级用法

正如我们在清单6.6中看到的，通过调用ChannelHandlerContext的 pipeline() 方法，你可以得到一个封闭的 ChannelPipeline 引用。

这使得可以在运行时操作 pipeline 的 ChannelHandler ，这一点可以被利用来实现一些复杂的需求。

## 缓存引用

例如,添加一个 ChannelHandler 到 pipeline 来支持动态协议改变。

其他高级用例可以实现通过保持一个 ChannelHandlerContext 引用供以后使用,这可能发生在任何 ChannelHandler 方法,甚至来自不同的线程。

清单6.9显示了此模式被用来触发一个事件。

Listing 6.9 ChannelHandlerContext usage

```java
public class WriteHandler extends ChannelHandlerAdapter {

    private ChannelHandlerContext ctx;

    @Override
    public void handlerAdded(ChannelHandlerContext ctx) {
        this.ctx = ctx;        //存储 ChannelHandlerContext 的引用供以后使用
    }

    public void send(String msg) {
        ctx.writeAndFlush(msg);  //使用之前存储的 ChannelHandlerContext 来发送消息
    }
}
```


## Sharable 

因为 ChannelHandler 可以属于多个 ChannelPipeline ,它可以绑定多个 ChannelHandlerContext 实例。

然而,ChannelHandler 用于这种用法必须添加 `@Sharable` 注解。

否则,试图将它添加到多个 ChannelPipeline 将引发一个异常。

此外,它必须既是线程安全的又能安全地使用多个同时的通道(比如,连接)。

清单6.10显示了此模式的正确实现。

Listing 6.10 A shareable ChannelHandler

```java
@ChannelHandler.Sharable            //添加 @Sharable 注解
public class SharableHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        System.out.println("channel read message " + msg);
        ctx.fireChannelRead(msg);  //日志方法调用， 并专递到下一个 ChannelHandler
    }
}
```

上面这个 ChannelHandler 实现符合所有包含在多个管道的要求;

它通过 `@Sharable` 注解，并不持有任何状态。

而下面清单6.11中列出的情况则恰恰相反,它会造成问题。

Listing 6.11 Invalid usage of @Sharable

```java
@ChannelHandler.Sharable  //添加 @Sharable
public class NotSharableHandler extends ChannelInboundHandlerAdapter {
    private int count;

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        count++;  //count 字段递增

        System.out.println("inboundBufferUpdated(...) called the "
        + count + " time");  //志方法调用， 并专递到下一个 ChannelHandler
        ctx.fireChannelRead(msg);
    }
}
```

这段代码的问题是它持有状态:一个实例变量保持了方法调用的计数。

将这个类的一个实例添加到 ChannelPipeline 并发访问通道时很可能产生错误。

(当然,这个简单的例子中可以通过在 channelRead() 上添加 synchronized 来纠正 )

总之,使用 `@Sharable` 的话，要确定 ChannelHandler 是线程安全的。

无状态类就是一种线程安全比较简单的额实现方式。

## 为什么共享 ChannelHandler

常见原因是要在多个 ChannelPipelines 上安装一个 ChannelHandler 以此来实现跨多个渠道收集统计数据的目的。

# 后续

我们对于ChannelHandlerContext 和它与其他的框架组件之间的关系的讨论到此就结束了。接下来我们将看看异常处理。

# 参考资料

- doc

[netty](https://netty.io/4.0/api/io/netty/channel/ChannelHandlerContext.html)

- blogs

[Netty学习笔记之ChannelHandler](https://www.jianshu.com/p/96a50869b527)

* any list
{:toc}
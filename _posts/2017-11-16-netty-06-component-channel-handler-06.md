---
layout: post
title:  Netty-06-基础组件之 ChannelHandler
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# ChannelHandler

ChannelHandler用于处理Channel对应的事件

ChannelHandler接口里面只定义了三个生命周期方法，我们主要实现它的子接口ChannelInboundHandler和ChannelOutboundHandler，

为了便利，框架提供了ChannelInboundHandlerAdapter，ChannelOutboundHandlerAdapter和ChannelDuplexHandler这三个适配类，在使用的时候只需要实现你关注的方法即可

## 生命周期

ChannelHandler里面定义三个生命周期方法，分别会在当前ChannelHander加入ChannelHandlerContext中，从ChannelHandlerContext中移除，以及ChannelHandler回调方法出现异常时被回调

# 回调方法触发的时机 

| 回调方法                    |  触发时机 |
|:----|:----|
| channelRegistered           | 当前channel注册到EventLoop    |
| channelUnregistered         | 当前channel从EventLoop取消注册    |
| channelActive               | 当前channel激活的时候 |
| channelInactive             | 当前channel不活跃的时候，也就是当前channel到了它生命周期末    |
| channelRead                 | 当前channel从远端读取到数据   |
| channelReadComplete         | channel read消费完读取的数据的时候被触发  |
| userEventTriggered          | 用户事件触发的时候    |
| channelWritabilityChanged   | channel的写状态变化的时候触发 |

可以注意到每个方法都带了ChannelHandlerContext作为参数，具体作用是，在每个回调事件里面，处理完成之后，使用ChannelHandlerContext的fireChannelXXX方法来传递给下个ChannelHandler，netty的codec模块和业务处理代码分离就用到了这个链路处理

# ChannelOutboundHandler

回调方法         触发时机                   client      server
bind            bind操作执行前触发          false       true
connect         connect 操作执行前触发      true        false
disconnect      disconnect 操作执行前触发   true        false
close           close操作执行前触发         false       true
deregister      deregister操作执行前触发    /           /
read            read操作执行前触发          true        true
write           write操作执行前触发         true        true
flush           flush操作执行前触发         true        true

注意到一些回调方法有ChannelPromise这个参数，我们可以调用它的addListener注册监听，当回调方法所对应的操作完成后，会触发这个监听
下面这个代码，会在写操作完成后触发，完成操作包括成功和失败

```java
public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
    ctx.write(msg,promise);
    System.out.println("out write");
    promise.addListener(new GenericFutureListener<Future<? super Void>>() {
        @Override
        public void operationComplete(Future<? super Void> future) throws Exception {
            if(future.isSuccess()){
                System.out.println("OK");
            }
        }
    });
}
```

# ChannelInboundHandler和ChannelOutboundHandler的区别

个人感觉in和out的区别主要在于ChannelInboundHandler的channelRead和channelReadComplete回调和ChannelOutboundHandler的write和flush回调上，ChannelOutboundHandler的channelRead回调负责执行入栈数据的decode逻辑，ChannelOutboundHandler的write负责执行出站数据的encode工作。

其他回调方法和具体触发逻辑有关，和in与out无关。

# ChannelHandlerContext

每个ChannelHandler通过add方法加入到ChannelPipeline中去的时候，会创建一个对应的ChannelHandlerContext，并且绑定，ChannelPipeline实际维护的是ChannelHandlerContext 的关系

在DefaultChannelPipeline源码中可以看到会保存第一个ChannelHandlerContext以及最后一个ChannelHandlerContext的引用

```java
final AbstractChannelHandlerContext head;
final AbstractChannelHandlerContext tail;
```

而在AbstractChannelHandlerContext源码中可以看到

```
volatile AbstractChannelHandlerContext next;
volatile AbstractChannelHandlerContext prev;
```

每个ChannelHandlerContext之间形成双向链表

# 后续学习

ChannelContext

ChannelPipline

ChannelPromise

# 参考资料

- 使用简介

[Netty学习笔记之ChannelHandler](https://www.jianshu.com/p/96a50869b527)

- 源码核心

[精进篇：netty源码死磕5  - 揭开 ChannelHandler 的神秘面纱](https://www.cnblogs.com/crazymakercircle/p/9853586.html)

[Netty 系列七（那些开箱即用的 ChannelHandler）](https://cloud.tencent.com/developer/article/1347288)

* any list
{:toc}


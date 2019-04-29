---
layout: post
title:  Netty-09-ByteBuf 实战
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: true
---


# 资源释放注意事项

## 需要释放的场景

ByteBuf 是Netty中主要用来数据byte[]的封装类，主要分为Heap ByteBuf 和 Direct ByteBuf。

为了减少内存的分配回收以及产生的内存碎片，Netty提供了PooledByteBufAllocator 用来分配可回收的ByteBuf，可以把PooledByteBufAllocator看做一个池子，需要的时候从里面获取ByteBuf，用完了放回去，以此提高性能。

当然与之对应的还有 UnpooledByteBufAllocator，顾名思义Unpooled就是不会放到池子里，所以根据该分配器分配的ByteBuf，不需要放回池子有JVM自己GC回收。

在netty中，根据ChannelHandlerContext 和 Channel获取的Allocator默认都是Pooled，所以需要再合适的时机对其进行释放，避免造成内存泄漏。

Netty默认会在ChannelPipline的最后添加一个tail handler帮你完成ByteBuf的release。

其释放的是channelRead传入的ByteBuf，如果在handlers传递过程中，传递了新值，老值需要你自己手动释放。

另外如果中途没有使用fireChannelRead传递下去也要自己释放。

在传递过程中自己通过Channel或ChannelHandlerContext创建的但是没有传递下去的ByteBuf也要手动释放。

## 问题诊断

为了帮助你诊断潜在的泄漏问题，netty提供了ResourceLeakDetector，该类会采样应用程序中%1的buffer分配，并进行跟踪。不用担心这个开销很小。

如果泄漏发生了会有如下log打印出来

```
SEVERE: LEAK: ByteBuf.release() was not called before it's garbage-collected. Enable advanced leak reporting to find out where the leak occurred. To enable advanced leak reporting, specify the JVM option '-Dio.netty.leakDetection.level=advanced' or call ResourceLeakDetector.setLevel() See http://netty.io/wiki/reference-counted-objects.html for more information.
```

## 诊断级别

Netty目前定义了四中检测级别，

DISABLE, SIMPLE(默认),ADVANCED, PARANOID

可以通过 `java -Dio.netty.leakDetectionLevel=ADVANCED` 指定

指定后会打印出如下信息

```
SEVERE: LEAK: ByteBuf.release() was not called before it's garbage-collected. See http://netty.io/wiki/reference-counted-objects.html for more information.
Recent access records: 0
Created at:
	io.netty.util.ResourceLeakDetector.track(ResourceLeakDetector.java:237)
	io.netty.buffer.PooledByteBufAllocator.newDirectBuffer(PooledByteBufAllocator.java:331)
	...
```

## 需要满足的条件

有些人可能运行时无法打印出上面所提到的那些信息，首先要满足两个条件

1，要有足够的ByteBuf分配才可以，可以自己在代码直接分配200个，

2，要在GC之后，然后在分配，此时就会打印出对应的detect信息。

# 参考资料

《Netty in Action》 P76 

- free

[Netty ByteBuf 释放注意事项](https://blog.csdn.net/u012807459/article/details/77259869)

* any list
{:toc}



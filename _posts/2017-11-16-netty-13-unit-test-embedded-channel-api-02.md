---
layout: post
title:  Netty-13-EmbeddedChannel api 
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, api, sh]
published: true
---

# 概述

你已经知道，可以将ChannelPipeline 中的ChannelHandler 实现链接在一起，以构建你的应用程序的业务逻辑。

我们已经在前面解释过，这种设计支持将任何潜在的复杂处理过程分解为小的可重用的组件，每个组件都将处理一个明确定义的任务或者步骤。

在本章中，我们还将展示它是如何简化测试的。

Netty 提供了它所谓的Embedded 传输，用于测试ChannelHandler。这个传输是一种特殊的Channel 实现—EmbeddedChannel—的功能，这个实现提供了通过ChannelPipeline传播事件的简便方法。

这个想法是直截了当的：将入站数据或者出站数据写入到EmbeddedChannel 中，然后检查是否有任何东西到达了ChannelPipeline 的尾端。

以这种方式，你便可以确定消息是否已经被编码或者被解码过了，以及是否触发了任何的ChannelHandler 动作。

# API 

表9-1 中列出了 EmbeddedChannel 的相关方法。

```
writeInbound	写一个入站消息到 EmbeddedChannel。 如果数据能从 EmbeddedChannel 通过 readInbound() 读到，则返回 true；
readInbound	    从 EmbeddedChannel 读到入站消息。任何返回遍历整个ChannelPipeline。如果读取还没有准备，则此方法返回 null；
writeOutbound	写一个出站消息到 EmbeddedChannel。 如果数据能从 EmbeddedChannel 通过 readOutbound() 读到，则返回 true；
readOutbound	从 EmbeddedChannel 读到出站消息。任何返回遍历整个ChannelPipeline。如果读取还没有准备，则此方法返回 null；
Finish	        如果从入站或者出站中能读到数据，标记 EmbeddedChannel 完成并且返回。这同时会调用 EmbeddedChannel 的关闭方法；
```

完整版参考 [EmbeddedChannel doc](https://netty.io/4.1/api/io/netty/channel/embedded/EmbeddedChannel.html)

# 测试入站和出站数据

处理入站数据由 ChannelInboundHandler 处理并且表示数据从远端读取。

出站数据由 ChannelOutboundHandler 处理并且表示数据写入远端。 

根据 ChannelHandler 测试你会选择 writeInbound(),writeOutbound(), 或者两者都有。

## 流程

图10.1显示了数据流如何通过 ChannelPipeline 使用 EmbeddedChannel 的方法。

![测试流程](https://img-blog.csdn.net/20180929154715943?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2xqejIwMTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

如上图所示，使用writeOutbound(...)写消息到通道，消息在出站方法通过ChannelPipeline，之后就可以使用readOutbound()读取消息。

着同样使用与入站，使用writeInbound(...)和readInbound()。

处理入站和出站是相似的，它总是遍历整个ChannelPipeline直到ChannelPipeline结束，并将处理过的消息存储在EmbeddedChannel中。下面来看看如何测试你的逻辑。

# 参考资料

《Netty in Action》 P137

[EmbeddedChannel doc](https://netty.io/4.1/api/io/netty/channel/embedded/EmbeddedChannel.html)

[EmbeddedChannel 测试教程](https://www.baeldung.com/testing-netty-embedded-channel)

* any list
{:toc}
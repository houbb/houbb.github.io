---
layout: post
title:  Netty-01-netty version 版本选择
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# 如果你是公司的技术架构师，推荐用 netty 的哪个版本？为什么

作为公司的技术架构师，推荐使用Netty 4.x系列的最新版本，目前是4.1.68.Final。

原因如下：

1. 4.x系列已经得到了广泛的使用和验证，是稳定性和可靠性都比较高的版本。

2. Netty 4.x系列相对于之前的版本，引入了很多新特性和改进，例如更好的内存管理、更好的线程模型、更快的性能等。同时，Netty 4.x也更容易与其他框架和工具进行集成，例如Spring Boot、Swagger等。

3. Netty 4.x提供了更加友好和易用的API，例如使用ByteBuf代替原来的ChannelBuffer，使用Promise代替Future等，大大降低了使用Netty的门槛和复杂度。

4. 4.x系列的文档和社区支持比较完善，可以方便地获取相关的技术支持和文档资料。

综上所述，Netty 4.x系列的最新版本是一个非常成熟和稳定的选择，同时也提供了更好的性能和更好的开发体验。

# netty 的 5.x 版本呢？

Netty 5.x是Netty的下一代版本，与Netty 4.x相比有很多新特性和改进，例如更好的可扩展性、更好的性能等。但是需要注意的是，Netty 5.x仍处于实验阶段，尚未正式发布，也未被广泛使用和验证，因此不太适合在生产环境中使用。

Netty 5.x相对于4.x有一些重大的变化，例如底层网络库的切换、ByteBuf的改进等，这些变化可能导致现有的代码和API不兼容。此外，Netty 5.x在设计上更加关注异步和响应式编程，这也可能需要开发人员具备更高的技能和经验。

因此，如果公司有需要使用Netty来构建生产系统，推荐使用Netty 4.x系列的最新版本，如果有需要使用Netty 5.x的新特性，可以在开发环境中尝试使用，但需要注意其实验性质和不稳定性。同时，由于Netty 5.x尚未正式发布，官方文档和社区支持也比较有限，需要开发人员具备一定的自学能力。

# 给我一个 netty 5.x 和 4.x 的对比表格

Netty 5.x相对于Netty 4.x有很多新特性和改进，但同时也有一些变化和不兼容之处。下面是一个Netty 5.x和4.x的对比表格：

| 特性/改进 | Netty 4.x | Netty 5.x |
| ---------| ---------| ---------|
|底层网络库|NIO, OIO, epoll, kqueue, etc.|底层网络库切换为基于NIO2的NIO实现|
|ByteBuf|HeapBuffer, DirectBuffer, CompositeByteBuf等|简化了ByteBuf类型，引入了池化功能和更好的内存管理|
|线程模型|EventLoop和ChannelHandler|引入了全新的EventLoop和Promise实现，更好的支持异步和响应式编程|
|协议支持|HTTP, WebSocket, SSL, TCP, UDP等|支持更多的协议和编解码器，例如gRPC, HTTP/2, Multiplexing等|
|可扩展性|通过ChannelPipeline和ChannelHandler实现可扩展性|更加注重可扩展性和插件化，支持更加灵活的配置和扩展|
|性能|在Netty 4.x的基础上进一步优化和提升|相对于Netty 4.x提升了性能，特别是在高负载和高并发情况下|
|不兼容之处| - |API和ByteBuf类型的改变可能导致现有的代码不兼容|

需要注意的是，Netty 5.x仍处于实验阶段，可能会存在一些问题和不稳定性，因此在选择Netty的版本时需要根据实际情况来选择。如果是在生产环境中使用，建议选择Netty 4.x系列的最新版本；如果需要使用Netty 5.x的新特性，可以在开发环境中进行尝试。

# 参考资料

[Netty学习和进阶策略](https://mp.weixin.qq.com/s/WcWBmvkbft-aNrwqcQu32w)

[《跟闪电侠学Netty》开篇：Netty是什么？](https://www.jianshu.com/p/a4e03835921a)

[《跟闪电侠学Netty》01: 服务端启动流程介绍](https://juejin.im/entry/5b2f07e4f265da59a8364fab)

https://cloud.tencent.com/developer/news/247098

* any list
{:toc}


---
layout: post
title: 分布式链路追踪-03-Jaeger、Zipkin、skywalking 中的 span 是如何设计的？
date:  2023-07-25 08:00:00 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# 开源项目

> 自动日志输出 [https://github.com/houbb/auto-log](https://github.com/houbb/auto-log)

# Jaeger、Zipkin 中的 spanId 是如何生成的？

在 Jaeger 和 Zipkin 这两个分布式跟踪系统中，Span ID 是通过不同的方法生成的。

下面分别介绍它们的生成方式：

Jaeger 中的 Span ID 生成：

   在 Jaeger 中，Span ID 是通过 Snowflake 算法生成的。Snowflake 算法是 Twitter 开源的一种全局唯一 ID 生成算法，用于生成 64 位的唯一标识符。Jaeger 使用 Snowflake 算法生成 64 位的 Span ID，保证在整个分布式系统中每个 Span 的 ID 都是唯一的。

Zipkin 中的 Span ID 生成：

   在 Zipkin 中，Span ID 是一个 64 位的十六进制数字，通常由随机算法生成。Zipkin 不像 Jaeger 一样使用 Snowflake 算法，而是依赖于随机数生成器来生成 Span ID。这样也可以保证在整个分布式系统中每个 Span 的 ID 都是唯一的。

# skywalking 中的 spanId 是如何设计实现的？

在 SkyWalking 中，Span ID 是一种用于唯一标识分布式追踪的重要组成部分。

全局唯一标识符（UUID）：SkyWalking 使用 UUID 作为 Span ID 的生成方式。UUID 是一个 128 位的全局唯一标识符，能够保证在整个分布式系统中每个 Span ID 都是唯一的。

基于 Snowflake 的 Trace ID：除了 Span ID，SkyWalking 还引入了 Trace ID 的概念。Trace ID 是用于唯一标识一个跟踪操作链的标识符。每个跟踪链都有一个 Trace ID，并且跟踪链中的所有 Span 都共享同一个 Trace ID。在 SkyWalking 中，Trace ID 通常由 Snowflake 算法生成，确保在整个分布式系统中每个 Trace ID 都是唯一的。

父子关系：SkyWalking 通过在 Span 数据中记录父 Span 的 ID，来建立 Span 之间的父子关系。这样，就可以构建完整的操作依赖关系图，帮助了解操作之间的调用链路。

# 为什么 skywalking 会用两种算法？直接用一种不行吗

SkyWalking 之所以采用两种算法（UUID 和 Snowflake）来生成 Span ID 和 Trace ID，是为了在不同的场景下兼顾唯一性、顺序性和性能。

UUID 算法：
   UUID（Universally Unique Identifier）是一种标准化的全局唯一标识符，可以保证在不同的系统和环境中生成的 ID 都是唯一的。使用 UUID 算法生成 Span ID 可以确保在整个分布式系统中每个 Span 的 ID 都是唯一的，避免了冲突和数据混淆。

Snowflake 算法：
   Snowflake 算法是一种用于生成分布式唯一 ID 的算法，通常由时间戳、机器ID和序列号组成。在 SkyWalking 中，Snowflake 算法用于生成 Trace ID，用于唯一标识一个跟踪链。通过在 Trace ID 中包含时间戳信息，可以在一定程度上保证 Trace ID 的顺序性，即在同一节点上生成的 Trace ID 是按照时间顺序递增的。

使用两种算法的组合，SkyWalking 在实现跟踪数据的唯一性和顺序性的同时，也考虑了性能的因素。UUID 算法生成 Span ID 具有较高的唯一性，而 Snowflake 算法生成 Trace ID 具有较好的顺序性。这样的设计使得 SkyWalking 在处理大规模分布式系统的跟踪数据时能够有较好的性能表现。

# skywalking 中为什么 traceId 要按照时间递增呢？直接唯一还不够吗

在分布式系统跟踪中，Trace ID 是用于唯一标识一个跟踪操作链的标识符。Trace ID 的唯一性是必要的，以确保在分布式环境中不会出现跟踪数据的混淆和冲突。

通过唯一的 Trace ID，可以将属于同一跟踪链的所有 Span 关联在一起，形成完整的操作路径，帮助开发人员了解操作之间的依赖关系和调用链路。

而按照时间递增的设计则是为了在跟踪数据中引入一定程度的顺序性，以帮助更好地理解操作的时间顺序和执行过程。由于分布式系统中的操作可能在不同节点上同时执行，而节点之间的时钟可能存在微小的差异，导致无法完全按照生成顺序进行排序。因此，通过在 Trace ID 中包含时间戳信息，并按照时间递增的方式生成 Trace ID，可以在局部范围内近似保证顺序性。

这样的设计有助于在分析和可视化跟踪数据时，更好地还原操作的执行顺序和时间线，方便开发人员定位问题和调试分布式系统。

但需要明确的是，SkyWalking 中的 Trace ID 的时间递增并不是严格的全局顺序，而是在局部范围内近似有序。在大规模分布式系统中，完全保证全局顺序是困难的，因此对于跟踪数据的顺序性设计，需要权衡利弊并根据具体需求做出合理的决策。

# spanID 为什么不使用 snowflake ，而是使用 uuid 呢

在分布式系统跟踪中，选择 Span ID 的生成方式是一个涉及多个因素的决策。虽然 Snowflake 算法在生成分布式唯一 ID 方面效果良好，但在分布式系统跟踪中，通常会选择使用 UUID（Universally Unique Identifier）作为 Span ID 的生成方式，原因如下：

全局唯一性：UUID 是标准化的全局唯一标识符，由128位数字组成。使用 UUID 生成 Span ID 可以确保在整个分布式系统中每个 Span 的 ID 都是唯一的，避免了冲突和数据混淆。对于大规模分布式系统，全局唯一性是确保跟踪数据准确性和关联性的重要保证。

简单性和易用性：UUID 的生成过程相对简单，并且在现代编程语言和框架中都有相应的库和函数可用。使用 UUID 生成 Span ID 不需要额外的设置和复杂的算法，简化了代码的实现和维护。

随机性：UUID 是通过随机算法生成的，它不依赖于时间戳或序列号，避免了在生成过程中需要考虑时间戳的顺序性问题。这使得 Span ID 更具有随机性，有助于避免在跟踪数据中产生局部的顺序关联，从而更好地反映分布式系统的实际执行情况。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://storage.googleapis.com/pub-tools-public-publication-data/pdf/36356.pdf

https://research.google/pubs/pub36356/

* any list
{:toc}
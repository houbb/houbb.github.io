---
layout: post
title: raft-09-apache ratis raft java 实现
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFAJRaft, raft, sh]
published: true
---

## 前言

大家好，我是老马。

分布式系统中，一致性算法是最重要的基石，也是最难学习的部分。

本系列根据 jraft 作为入口，学习一下 raft 的原理和实现。

## raft 系列

[SOFAStack-00-sofa 技术栈概览](https://houbb.github.io/2022/07/09/sofastack-00-overview)

# 目的

我希望找到一个比较容易入门的例子。

https://github.com/wenweihu86/raft-java


# 项目介绍

以下是你提供的英文文档的中文翻译：

# Apache Ratis

[Apache Ratis](https://ratis.apache.org/) 是一个实现 Raft 协议的 Java 库，

Raft 论文的扩展版本可以在 <https://raft.github.io/raft.pdf> 上查看。

该论文介绍了 Raft 协议，并以以下话语阐述了其动机：

> Raft 是一种用于管理复制日志的共识算法。

> 它产生的结果等同于（多重）Paxos，并且效率与 Paxos 一致，

> 但其结构与 Paxos 不同；这使得 Raft 比 Paxos 更容易理解，

> 也为构建实用系统提供了更好的基础。

Ratis 旨在将 Raft 协议作为一个 Java 库提供，供任何需要使用复制日志的系统使用。

它为状态机实现提供了插件式架构，便于管理复制状态。

它还提供了 Raft 日志、RPC 实现和度量实现的插件式架构，简化了与其他项目的集成。

另一个重要目标是支持高吞吐量的数据写入，以便能够用于更广泛的数据复制场景。

* 要构建构件，请参阅 [BUILDING.md](https://github.com/apache/ratis/blob/master/BUILDING.md)。

* 要运行示例，请参阅 [ratis-examples/README.md](https://github.com/apache/ratis/blob/master/ratis-examples/README.md)。

## 参考文献

1. Diego Ongaro 和 John Ousterhout，[寻找一种易于理解的共识算法][https://www.usenix.org/conference/atc14/technical-sessions/presentation/ongaro]，
2014 年 USENIX 年度技术大会（USENIX ATC 14）（美国宾夕法尼亚州费城），USENIX 协会，2014，页 305-319。

Here’s the Chinese translation of the provided content:

---

# 什么是 Apache Ratis™？

Apache Ratis 是一个高度可定制的 Raft 协议实现，使用 Java 编写。

Raft 是一种易于理解的共识算法，用于管理复制状态。

Apache Ratis 可用于任何需要在多个实例之间复制状态的 Java 应用程序。

## 特性

**可插拔的传输层**  

Ratis 提供了一个可插拔的传输层。默认情况下，支持 gRPC、Netty+Protobuf 和 Apache Hadoop RPC 基于的传输。

**可插拔的状态机**  

Ratis 支持日志和状态机。状态机通常包含你想要高度可用的数据。Ratis 使得使用自定义状态机变得非常简单。

**可插拔的 Raft 日志**  

Raft 日志也是可插拔的，用户可以提供自己的日志实现。默认实现将日志存储在本地文件中。

应用程序可以轻松定义如何写入数据以及将数据写入到哪里。

**可插拔的度量**  

Ratis 提供了一个可插拔的观察层。默认情况下（ratis-metrics-default），它使用 Ratis 第三方库提供的 Shaded Dropwizard 4。

另一个实现可以在 ratis-metrics-dropwizard3 中找到。用户可以提供自己的度量实现。

**日志服务**  

Ratis 提供了一个日志服务模板，提供 StateMachines 以实现带有集中的客户端 API 的分布式日志服务。有关更多信息，请阅读 LogService 文档。

以下是你提供的内容的中文翻译：

---

# 快速开始  
Ratis 是一个 Java 实现的 Raft 协议库。它不像 Zookeeper 或 Consul 那样是一个独立的服务器应用程序。

## 示例  
为了展示如何在代码中使用 Ratis，请查看以下示例。

- **算术示例**：这是一个简单的分布式计算器，它复制已定义的值，并允许用户对这些复制的值执行算术操作。

- **文件存储示例**：这是一个使用 Ratis 进行文件读写的示例。

示例的源代码可以在 ratis-examples 子项目中找到。

## Maven 使用方式  

要在我们的项目中使用 Ratis，你可以从 Maven 中央仓库获取最新的二进制文件：

```xml
<dependency>
   <artifactId>ratis-server</artifactId>
   <groupId>org.apache.ratis</groupId>
</dependency>
```

你还需要包含以下之一的传输实现：

```xml
<dependency>
   <artifactId>ratis-grpc</artifactId>
   <groupId>org.apache.ratis</groupId>
</dependency>
```

```xml
<dependency>
   <artifactId>ratis-netty</artifactId>
   <groupId>org.apache.ratis</groupId>
</dependency>
```

```xml
<dependency>
   <artifactId>ratis-hadoop</artifactId>
   <groupId>org.apache.ratis</groupId>
</dependency>
```

请注意，Apache Hadoop 的依赖项是阴影处理过的，因此可以安全地与不同版本的 Hadoop 一起使用 hadoop 传输。

# 更多资料

https://www.slideshare.net/slideshow/apache-ratis-in-search-of-a-usable-raft-library/142222208

https://www.slideshare.net/slideshow/high-throughput-data-replication-over-raft/102689036


# 参考资料

https://github.com/wenweihu86/raft-java

* any list
{:toc}
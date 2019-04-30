---
layout: post
title:  Netty-12-Boostrap 引导类 api
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, api, sh]
published: true
---

# 前言

```
算法=控制+逻辑
```

如果将控制可逻辑分开，那么代码的可维护性就会大幅度提升。

同理如果可以将配置与组件之间分开，就像汽车在生产的时候各个组件分开，最后统一组装，那么灵活性也会大幅度提升。

## 结构化

在深入地学习了ChannelPipeline、ChannelHandler 和EventLoop 之后，你接下来的问题可能是：

“如何将这些部分组织起来，成为一个可实际运行的应用程序呢？”

答案是“引导”（Bootstrapping）。

到目前为止，我们对这个术语的使用还比较含糊，现在已经到了精确定义它的时候了。

简单来说，引导一个应用程序是指对它进行配置，并使它运行起来的过程—尽管该过程的具体细节可能并不如它的定义那样简单，尤其是对于一个网络
应用程序来说。

和它对应用程序体系架构的做法一致，Netty处理引导的方式使你的应用程序和网络层相隔离，无论它是客户端还是服务器。

正如同你将要看到的，所有的框架组件都将会在后台结合在一起并且启用。引导是我们一直以来都在组装的完整拼图。


# Bootstrap 类

引导类的层次结构包括一个抽象的父类和两个具体的引导子类，

## api 

```java
public abstract class AbstractBootstrap<B extends AbstractBootstrap<B, C>, C extends Channel> implements Cloneable {}
```

这个抽象类有两个子类：

- 客户端

```java
public class Bootstrap extends AbstractBootstrap<Bootstrap, Channel> {}
```

- 服务端

```java
public class ServerBootstrap extends AbstractBootstrap<ServerBootstrap, ServerChannel> {}
```

相对于将具体的引导类分别看作用于服务器和客户端的引导来说，记住它们的本意是用来支撑不同的应用程序的功能的将有所裨益。

也就是说，服务器致力于使用一个父Channel 来接受来自客户端的连接，并创建子Channel 以用于它们之间的通信；

而客户端将最可能只需要一个单独的、没有父Channel 的Channel 来用于所有的网络交互。
（正如同我们将要看到的，这也适用于无连接的传输协议，如UDP，因为它们并不是每个连接都需要一个单独的Channel。）

我们在前面的几章中学习的几个Netty 组件都参与了引导的过程，而且其中一些在客户端和服务器都有用到。

两种应用程序类型之间通用的引导步骤由AbstractBootstrap 处理，而特定于客户端或者服务器的引导步骤则分别由Bootstrap 或ServerBootstrap 处理。

在本章中接下来的部分，我们将详细地探讨这两个类，首先从不那么复杂的Bootstrap 类开始。

# 为什么引导类是 Cloneable 的

你有时可能会需要创建多个具有类似配置或者完全相同配置的Channel。

为了支持这种模式而又不需要为每个Channel 都创建并配置一个新的引导类实例， AbstractBootstrap 被标记为了Cloneable

注意，这种方式只会创建引导类实例的EventLoopGroup的一个浅拷贝，所以，后者。在一个已经配置完成的引导类实例上调用clone()方法将返回另一个可以立即使用的引
导类实例。

将在所有克隆的Channel实例之间共享。

这是可以接受的，因为通常这些克隆的Channel的生命周期都很短暂，一个典型的场景是——创建一个Channel以进行一次HTTP请求。

# 参考资料

《Netty in Action》 P113

* any list
{:toc}
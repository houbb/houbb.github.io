---
layout: post
title:  Netty-02-Netty 架构详解
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, sh]
published: true
---

# Netty 架构

学习一门技术，在入门使用之后。最好是知道这个框架的整体设计思想。

本文基于 Netty 4.1 展开介绍相关理论模型，使用场景，基本组件、整体架构，知其然且知其所以然，希望给大家在实际开发实践、学习开源项目方面提供参考。

# Netty 逻辑架构

Netty 采用了典型的三层网络架构进行设计和开发，其逻辑架构图如下所示。

![逻辑架构图](https://img-blog.csdnimg.cn/a3df6bfdf17d4a0cadc5bb69667b5fec.png)

## 通信调度层 Reactor

它由一系列辅助类完成，包括 Reactor 线程 NioEventLoop 及其父类，NioSocketChannel / NioServerSocketChannel 及其父类，Buffer 组件，Unsafe 组件 等。

该层的主要职责就是**监听网络的读写和连接操作**，负责**将网络层的数据读取到内存缓冲区**，然后触发各种网络事件，例如连接创建、连接激活、读事件、写事件等，将这些事件触发到 PipeLine 中，由 PipeLine 管理的责任链来进行后续的处理。

## 责任链层 Pipeline

它负责上述的各种网络事件 在责任链中的有序传播，同时负责动态地编排责任链。

责任链可以选择监听和处理自己关心的事件，它可以拦截处理事件，以及向前向后传播事件。

不同应用的 Handler 节点 的功能也不同，通常情况下，往往会开发 编解码 Hanlder 用于消息的编解码，可以将外部的协议消息转换成 内部的 POJO 对象，这样上层业务则只需要关心处理业务逻辑即可，不需要感知底层的协议差异和线程模型差异，实现了架构层面的分层隔离。

## 业务逻辑编排层 Service ChannelHandler

业务逻辑编排层通常有两类：一类是纯粹的业务逻辑编排，还有一类是其他的应用层协议插件，用于特定协议相关的会话和链路管理。

例如，CMPP 协议，用于管理和中国移动短信系统的对接。

架构的不同层面，需要关心和处理的对象都不同，通常情况下，对于业务开发者，只需要关心责任链的拦截和 业务 Handler 的编排。

因为应用层协议栈往往是开发一次，到处运行，所以实际上对于业务开发者来说，只需要关心服务层的业务逻辑开发即可。

各种应用协议以插件的形式提供，只有协议开发人员需要关注协议插件，对于其他业务开发人员来说，只需关心业务逻辑定制。

这种分层的架构设计理念实现了 NIO 框架 各层之间的解耦，便于上层业务协议栈的开发和业务逻辑的定制。

正是由于 Netty 的分层架构设计非常合理，基于 Netty 的各种应用服务器和协议栈开发才能够如雨后春笋般得到快速发展。

# 关键的架构质量属性

## 性能

影响最终产品的性能因素非常多，其中软件因素如下。

- 架构不合理导致的性能问题；

- 编码实现不合理导致的性能问题，例如，锁没用好导致的性能瓶颈。

硬件因素如下。

- 服务器硬件配置太低导致的性能问题；

- 带宽、磁盘的 IOPS 等限制导致的 IO 操作 性能差；

- 测试环境被共用导致被测试的软件产品受到影响。

尽管影响产品性能的因素非常多，但是架构的性能模型合理与否对性能的影响非常大。如果一个产品的架构设计得不好，无论开发如何努力，都很难开发出一个高性能、高可用的软件产品。

“性能是设计出来的，而不是测试出来的”。

下面我们看看 Netty 的架构设计是如何实现高性能的。

1. 采用非阻塞的 NIO 类库，基于 Reactor 模式实现，解决了传统 同步阻塞 IO 模式 下一个服务端无法平滑地处理线性增长的客户端的问题。

2. TCP 接收和发送缓冲区**使用直接内存代替堆内存，避免了内存复制**，提升了 IO 读取和写入的性能。

3. 支持通过内存池的方式循环利用 ByteBuffer，避免了频繁创建和销毁 ByteBuffer 带来的性能损耗。

4. 可配置的 IO 线程数、TCP 参数 等，为不同的用户场景提供定制化的调优参数，满足不同的性能场景。

5. 采用环形数组缓冲区实现无锁化并发编程，代替传统的线程安全容器或者锁。

6. 合理地使用线程安全容器、原子类等，提升系统的并发处理能力。

7. 关键资源的处理使用单线程串行化的方式，避免多线程并发访问带来的锁竞争和额外的 CPU 资源消耗问题。

8. 通过引用计数器及时地申请释放不再被引用的对象，细粒度的内存管理降低了 GC 的频率，减少了频繁 GC 带来的延时和 CPU 损耗。

## 可靠性

作为一个高性能的异步通信框架，架构的可靠性是大家选择的另一个重要依据。

下面我们看一下 Netty 架构 的可靠性设计。

### 1、链路有效性检测

由于长连接不需要每次发送消息都创建链路，也不需要在消息交互完成时关闭链路，因此相对于短连接性能更高。

对于长连接，一旦链路建立成功便一直维系双方之间的链路，直到系统退出。

为了保证长连接的链路有效性，往往需要通过心跳机制周期性地进行链路检测。

使用周期性心跳的原因是：在系统空闲时，例如凌晨，往往没有业务消息。

如果此时链路被防火墙 Hang 住，或者遭遇网络闪断、网络单通等，通信双方无法识别出这类链路异常。

等到第二天业务高峰期到来时，瞬间的海量业务冲击会导致消息积压无法发送给对方，由于链路的重建需要时间，这期间业务会大量失败 (集群或者分布式组网情况会好一些)。为了解决这个问题，需要周期性的 “心跳检测” 对链路进行有效性检查，一旦发生问题，可以及时关闭链路，重建 TCP 连接。

当有业务消息时，无须心跳检测，可以由业务消息进行链路可用性检测。所以心跳消息往往是在链路空闲时发送的。为了支持心跳机制，Netty 提供了如下两种链路空闲检测机制。

- 读空闲超时机制：当经过 连续的周期 T 没有消息可读时，触发 超时 Handler，用户可以基于 该读空闲超时 Handler 发送心跳消息，进行链路检测，如果连续 N 个周期 仍然没有读取到心跳消息，可以主动关闭这条链路。

- 写空闲超时机制：当经过 连续的周期 T 没有消息要发送时，触发 超时 Handler，用户可以基于 该写空闲超时 Handler 发送心跳消息，进行链路检测，如果连续 N 个周期 仍然没有接收到对方的心跳消息，可以主动关闭这条链路。

为了满足不同用户场景的心跳定制，Netty 提供了空闲状态检测事件通知机制，用户可以订阅：空闲超时事件、读空闲超时机制、写空闲超时事件，在接收到对应的空闲事件之后，灵活地进行定制。

### 2、内存保护机制

Netty 提供多种机制对内存进行保护，包括以下几个方面。

- 通过对象引用计数器对 Netty 的 ByteBuffer 等内置对象进行细粒度的内存申请和释放，对非法的对象引用进行检测和保护。

- 通过内存池来重用 ByteBuffer，节省内存。

- 可设置的内存容量上限，包括 ByteBuffer、线程池线程数等。

## 可定制性

Netty 的可定制性主要体现在以下几点。

- 责任链模式：ChannelPipeline 基于责任链模式开发，便于业务逻辑的拦截、定制和扩展。

- 基于接口的开发：关键的类库都提供了接口或者抽象类，如果 Netty 自身的实现无法满足用户的需求，可以由用户自定义实现相关接口。

- 提供了大量工厂类，通过重载这些工厂类可以按需创建出用户实现的对象。

- 提供了大量的系统参数供用户按需设置，增强系统的场景定制性。


## 可扩展性

基于 Netty 的 基本 NIO 框架，可以方便地进行应用层协议定制，例如，HTTP 协议栈、Thrift 协议栈、FTP 协议栈 等。

这些扩展不需要修改 Netty 的源码，直接基于 Netty 的二进制类库即可实现协议的扩展和定制。

目前，业界存在大量的基于 Netty 框架 开发的协议，例如基于 Netty 的 HTTP 协议、Dubbo 协议、RocketMQ 内部私有协议 等。

# Netty 的高性能设计

作为一个高性能的 NIO 通信框架，Netty 被广泛应用于大数据处理、互联网消息中间件、游戏和金融行业等。

大多数应用场景对底层的通信框架都有很高的性能要求，作为综合性能最高的 NIO 框架 之一，Netty 可以完全满足不同领域对高性能通信的需求。

本章我们将从架构层对 Netty 的高性能设计和关键代码实现进行剖析，看 Netty 是如何支撑高性能网络通信的。

## 传统 RPC 调用性能差的原因

**一、网络传输方式问题。**  

传统的 RPC 框架 或者基于 RMI 等方式的 远程过程调用 采用了同步阻塞 I/O，当客户端的并发压力或者网络时延增大之后，同步阻塞 I/O 会由于频繁的 wait 导致 I/O 线程 经常性的阻塞，由于线程无法高效的工作，I/O 处理能力自然下降。

采用 BIO 通信模型 的服务端，通常由一个独立的 Acceptor 线程 负责监听客户端的连接，接收到客户端连接之后，为其创建一个新的线程处理请求消息，处理完成之后，返回应答消息给客户端，线程销毁，这就是典型的 “ 一请求，一应答 ” 模型。

该架构最大的问题就是不具备弹性伸缩能力，当并发访问量增加后，服务端的线程个数和并发访问数成线性正比，由于线程是 Java 虛拟机 非常宝贵的系统资源，当线程数膨胀之后，系统的性能急剧下降，随着并发量的继续增加，可能会发生句柄溢出、线程堆栈溢出等问题，并导致服务器最终宕机。

**二、序列化性能差。**  

Java 序列化 存在如下几个典型问题：

1. Java 序列化机制是 Java 内部的一 种对象编解码技术，无法跨语言使用。例如对于异构系统之间的对接，Java 序列化 后的码流需要能够通过其他语言反序列化成原始对象，这很难支持。

2. 相比于其他开源的序列化框架，Java 序列化 后的码流太大，无论是网络传输还是持久化到磁盘，都会导致额外的资源占用。

3. 序列化性能差，资源占用率高 ( 主要是 CPU 资源占用高 )。

**三、线程模型问题。**  

由于采用同步阻塞 I/O，这会导致每个 TCP 连接 都占用 1 个线程，由于线程资源是 JVM 虚拟机 非常宝贵的资源，当 I/O 读写阻塞导致线程无法及时释放时，会导致系统性能急剧下降，严重的甚至会导致虚拟机无法创建新的线程。

## IO 通信性能三原则

尽管影响 I/O 通信性能 的因素非常多，但是从架构层面看主要有三个要素。

1. 传输：用什么样的通道将数据发送给对方。可以选择 BIO、NIO 或者 AIO，I/O 模型 在很大程度上决定了通信的性能；

2. 协议：采用什么样的通信协议，HTTP 等公有协议或者内部私有协议。协议的选择不同，性能也不同。相比于公有协议，内部私有协议的性能通常可以被设计得更优；

3. 线程模型：数据报如何读取？读取之后的编解码在哪个线程进行，编解码后的消息如何派发，Reactor 线程模型的不同，对性能的影响也非常大。

## 异步非阻塞通信

在 I/O 编程 过程中，当需要同时处理多个客户端接入请求时，可以利用多线程或者 I/O 多路复用技术 进行处理。

I/O 多路复用技术 通过把多个 I/O 的阻塞复用到同一个 select 的阻塞上，从而使得系统在单线程的情况下可以同时处理多个客户端请求。

与传统的多线程 / 多进程模型比，I/O 多路复用 的最大优势是系统开销小，系统不需要创建新的额外进程或者线程，也不需要维护这些进程和线程的运行，降低了系统的维护工作量，节省了系统资源。

JDK1.4 提供了对非阻塞 I/O 的支持，JDK1.5 使用 epoll 替代了传统的 select / poll，极大地提升了 NIO 通信 的性能。

与 Socket 和 ServerSocket 类相对应，NIO 也提供了 SocketChannel 和 ServerSocketChannel 两种不同的套接字通道实现。这两种新增的通道都支持阻塞和非阻塞两种模式。阻塞模式使用非常简单，但是性能和可靠性都不好，非阻塞模式则正好相反。开发人员一般可以根据自己的需要来选择合适的模式，一般来说，低负载、低并发的应用程序可以选择 同步阻塞 I/O 以降低编程复杂度。但是对于高负载、高并发的网络应用，需要使用 NIO 的非阻塞模式进行开发。

Netty 的 I/O 线程 NioEventLoop 由于聚合了 多路复用器 Selector，可以同时并发处理成百上千个客户端 SocketChannel。由于读写操作都是非阻塞的，这就可以充分提升 I/O 线程 的运行效率，避免由频繁的 I/O 阻塞 导致的线程挂起。

另外，由于 Netty 采用了异步通信模式，一个 I/O 线程 可以并发处理 N 个客户端连接和读写操作，这从根本上解决了传统 同步阻塞 I/O “ 一连接，一线程 ” 模型，架构的性能、弹性伸缩能力和可靠性都得到了极大的提升。

## 高效的 Reactor 线程模型

常用的 Reactor 线程模型 有三种，分别如下。

1. Reactor 单线程模型；

2. Reactor 多线程模型；

3. 主从 Reactor 多线程模型。

Reactor 单线程模型，指的是所有的 I/O 操作 都在同一个 NIO 线程 上面完成，NIO 线程 的职责如下：

1. 作为 NIO 服务端，接收客户端的 TCP 连接；

2. 作为 NIO 客户端，向服务端发起 TCP 连接；

3. 读取通信对端的请求或者应答消息；

4. 向通信对端发送消息请求或者应答消息。

由于 Reactor 模式 使用的是 异步非阻塞 I/O，所有的 I/O 操作 都不会导致阻塞，理论上一个线程可以独立处理所有 I/O 相关的操作。

从架构层面看，一个 NIO 线程 确实可以完成其承担的职责。

例如，通过 Acceptor 接收客户端的 TCP 连接请求消息，链路建立成功之后，通过 Dispatch 将对应的 ByteBuffer 派发到指定的 Handler 上进行消息解码。用户 Handler 可以通过 NIO 线程 将消息发送给客户端。

对于一些小容量应用场景，可以使用单线程模型，但是对于高负载、大并发的应用却不合适，主要原因如下。

1. 一个 NIO 线程 同时处理成百上千的链路，性能上无法支撑。即便 NIO 线程 的 CPU 负荷 达到 100%，也无法满足海量消息的编码，解码、读取和发送；

2. 当 NIO 线程 负载过重之后，处理速度将变慢，这会导致大量客户端连接超时，超时之后往往会进行重发，这更加重了 NIO 线程 的负载，最终会导致大量消息积压和处理超时，NIO 线程 会成为系统的性能瓶颈；

3. 可靠性问题。一旦 NIO 线程 意外跑飞，或者进入死循环，会导致整个系统通信模块不可用，不能接收和处理外部消息，造成节点故障。

为了解决这些问题，演进出了 Reactor 多线程模型，下面我们看一下 Reactor 多线程模型。

Rector 多线程模型 与单线程模型最大的区别就是有一组 NIO 线程 处理 I/O 操作，它的特点如下。

1. 有一个专门的 NIO 线程 —— Acceptor 线程 用于监听服务端口，接收客户端的 TCP 连接请求；

2. 网络 IO 操作 —— 读、写等由一个 NIO 线程池 负责，线程池可以采用标准的 JDK 线程池 实现，它包含一个任务队列和 N 个可用的线程，由这些 NIO 线程 负责消息的读取、解码、编码和发送；

3. 1 个 NIO 线程 可以同时处理 N 条链路，但是 1 个链路只对应 1 个 NIO 线程，以防止发生并发操作问题。

在绝大多数场景下，Reactor 多线程模型 都可以满足性能需求，但是，在极特殊应用场景中，一个 NIO 线程 负责监听和处理所有的客户端连接可能会存在性能问题。

例如百万客户端并发连接，或者服务端需要对客户端的握手消息进行安全认证，认证本身非常损耗性能。在这类场景下，单独一个 Acceptor 线程 可能会存在性能不足问题，为了解决性能问题，产生了第三种 Reactor 线程模型 —— 主从 Reactor 多线程模型。

主从 Reactor 线程模型 的特点是，服务端用于接收客户端连接的不再是个单线程的连接处理 Acceptor，而是一个独立的 Acceptor 线程池。

Acceptor 接收到客户端 TCP 连接请求 处理完成后 ( 可能包含接入认证等 )，将新创建的 SocketChannel 注册到 I/O 处理线程池 的某个 I/O 线程 上，由它负责 SocketChannel 的读写和编解码工作。

Acceptor 线程池 只用于客户端的登录、握手和安全认证，一旦链路建立成功，就将链路注册到 I/O 处理线程池的 I/O 线程 上，每个 I/O 线程 可以同时监听 N 个链路，对链路产生的 IO 事件 进行相应的 消息读取、解码、编码及消息发送等操作。

利用 主从 Reactor 线程模型，可以解决 1 个 Acceptor 线程 无法有效处理所有客户端连接的性能问题。因此，Netty 官方 也推荐使用该线程模型。

事实上，Netty 的线程模型并非固定不变，通过在启动辅助类中创建不同的 EventLoopGroup 实例 并进行适当的参数配置，就可以支持上述三种 Reactor 线程模型。可以根据业务场景的性能诉求，选择不同的线程模型。

- Netty 单线程模型 

服务端代码示例如下。

```java
EventLoopGroup reactor = new NioEventLoopGroup(1);
ServerBootstrap bootstrap = new ServerBootstrap();
bootstrap.group(reactor, reactor)
            .channel(NioServerSocketChannel.class)
            ......
```

- Netty 多线程模型 

代码示例如下。

```java
EventLoopGroup acceptor = new NioEventLoopGroup(1);
EventLoopGroup ioGroup = new NioEventLoopGroup();
ServerBootstrap bootstrap = new ServerBootstrap();
bootstrap.group(acceptor, ioGroup)
            .channel(NioServerSocketChannel.class)
            ......
```

- Netty 主从多线程模型 

代码示例如下

```java
EventLoopGroup acceptorGroup = new NioEventLoopGroup();
EventLoopGroup ioGroup = new NioEventLoopGroup();
ServerBootstrap bootstrap = new ServerBootstrap();
bootstrap.group(acceptorGroup, ioGroup)
            .channel(NioServerSocketChannel.class)
            ......
```

## 无锁化的串行设计

在大多数场景下，并行多线程处理可以提升系统的并发性能。

但是，如果对于共享资源的并发访问处理不当，会带来严重的锁竞争，这最终会导致性能的下降。

为了尽可能地避免锁竞争带来的性能损耗，可以通过串行化设计，即消息的处理尽可能在同一个线程内完成，期间不进行线程切换，这样就避免了多线程竞争和同步锁。

为了尽可能提升性能，Netty 对消息的处理 采用了串行无锁化设计，在 I/O 线程 内部进行串行操作，避免多线程竞争导致的性能下降。

Netty 的串行化设计工作原理图如下图所示。

![串行化设计工作原](https://img-blog.csdnimg.cn/ec8c0249e3b34554b00954bda9ee0fc7.png?)

Netty 的 NioEventLoop 读取到消息之后，直接调用 ChannelPipeline 的 fireChannelRead(Object msg)，只要用户不主动切换线程，一直会由 NioEventLoop 调用到 用户的 Handler，期间不进行线程切换。

这种串行化处理方式避免了多线程操作导致的锁的竞争，从性能角度看是最优的。

## 零拷贝

Netty 的 “ 零拷贝 ” 主要体现在如下三个方面。

第一种情况。Netty 的接收和发送 ByteBuffer 采用 堆外直接内存 (DIRECT BUFFERS) 进行 Socket 读写，不需要进行字节缓冲区的二次拷贝。如果使用传统的 堆内存(HEAP BUFFERS) 进行 Socket 读写，JVM 会将 堆内存 Buffer 拷贝一份到 直接内存 中，然后才写入 Socket。相比于堆外直接内存，消息在发送过程中多了一次缓冲区的内存拷贝。

下面我们继续看第二种 “ 零拷贝 ” 的实现 CompositeByteBuf，它对外将多个 ByteBuf 封装成一个 ByteBuf，对外提供统一封装后的 ByteBuf 接口。CompositeByteBuf 实际就是个 ByteBuf 的装饰器，它将多个 ByteBuf 组合成一个集合，然后对外提供统一的 ByteBuf 接口，添加 ByteBuf，不需要做内存拷贝。

第三种 “ 零拷贝 ” 就是文件传输，Netty 文件传输类 DefaultFileRegion 通过 transferTo()方法 将文件发送到目标 Channel 中。很多操作系统直接将文件缓冲区的内容发送到目标 Channel 中，而不需要通过循环拷贝的方式，这是一种更加高效的传输方式，提升了传输性能，降低了 CPU 和内存占用，实现了文件传输的 “ 零拷贝 ” 。

## 内存池

随着 JVM 虚拟机 和 JIT 即时编译技术 的发展，对象的分配和回收是个非常轻量级的工作。

但是对于 缓冲区 Buffer，情况却稍有不同，特别是对于堆外直接内存的分配和回收，是一件耗时的操作。

为了尽量重用缓冲区，Netty 提供了基于内存池的缓冲区重用机制。

ByteBuf 的子类中提供了多种 PooledByteBuf 的实现，基于这些实现 Netty 提供了多种内存管理策略，通过在启动辅助类中配置相关参数，可以实现差异化的定制。

## Socket 与 SocketChannel

网络由下往上分为 物理层、数据链路层、网络层、传输层和应用层。

IP 协议 对应于网络层，TCP 协议 对应于传输层，而 HTTP 协议 对应于应用层，三者从本质上来说没有可比性，Socket 则是对 TCP/IP 协议 的封装和应用 (程序员层面上)。

也可以说，TPC/IP 协议 是传输层协议，主要解决数据如何在网络中传输，而 HTTP 是应用层协议，主要解决如何包装数据。

Socket 是对 TCP/IP 协议 的封装，Socket 本身并不是协议，而是一个 调用接口(API)。 

通过 Socket，我们才能使用 TCP/IP 协议。

### 一、利用 Socket 建立网络连接的步骤

建立 Socket 连接 至少需要一对套接字，其中一个运行于客户端，称为 clientSocket ，另一个运行于服务器端，称为 serverSocket。

套接字之间的连接过程分为三个步骤：服务器监听，客户端请求，连接确认。

1. 服务器监听：服务器端套接字并不定位具体的客户端套接字，而是处于等待连接的状态，实时监控网络状态，等待客户端的连接请求。

2. 客户端请求：指客户端的套接字提出连接请求，要连接的目标是服务器端的套接字。为此，客户端的套接字必须首先描述它要连接的服务器的套接字，指出服务器端套接字的地址和端口号，然后就向服务器端套接字提出连接请求。

3. 连接确认：当服务器端套接字监听到或者说接收到客户端套接字的连接请求时，就响应客户端套接字的请求，建立一个新的线程，把服务器端套接字的描述发给 客户端，一旦客户端确认了此描述，双方就正式建立连接。而服务器端套接字继续处于监听状态，继续接收其他客户端套接字的连接请求。

### 二、HTTP 连接 的特点

HTTP 协议 是 Web 联网 的基础，也是手机联网常用的协议之一，HTTP 协议 是建立在 TCP 协议 之上的一种应用。

HTTP 连接 最显著的特点是客户端发送的每次请求 都需要服务器回送响应，在请求结束后，会主动释放连接。

从建立连接到关闭连接的过程称为 “一次连接”。

### 三、TCP 和 UDP 的区别

1. TCP 是面向连接的，虽然说网络的不安全不稳定特性决定了多少次握手都不能保证连接的可靠性，但 TCP 的三次握手在很大程度上 保证了连接的可靠性。

而 UDP 不是面向连接的，UDP 传送数据前并不与对方建立连接，对接收到的数据也不发送确认信号，发送端不知道数据是否会正确接收，当然也不用重发，所以说 UDP 是无连接的、不可靠的一种数据传输协议。

2. 也正由于 1 所说的特点，使得 UDP 的开销更小，数据传输速率更高，因为不必进行收发数据的确认，所以 UDP 的实时性更好。


### 四、Socket 与 SocketChannel 有什么区别

Socket、SocketChannel 二者的实质都是一样的，都是为了实现客户端与服务器端的连接而存在的，但是在使用上却有很大的区别。

具体如下：

1. 所属包不同。Socket 在 java.net 包 中，而 SocketChannel 在 java.nio 包 中。

2. 异步方式不同。从包的不同，我们大体可以推断出他们主要的区别：Socket 是阻塞连接，SocketChannel 可以设置为非阻塞连接。使用 ServerSocket 与 Socket 的搭配，服务端 Socket 往往要为每一个 客户端 Socket 分配一个线程，而每一个线程都有可能处于长时间的阻塞状态中。过多的线程也会影响服务器的性能。而使用 SocketChannel 与 ServerSocketChannel 的搭配可以非阻塞通信，这样使得服务器端只需要一个线程就能处理所有 客户端 Socket 的请求。

3. 性能不同。一般来说，高并发场景下，使用 SocketChannel 与 ServerSocketChannel 的搭配会有更好的性能。

4. 使用方式不同。Socket、ServerSocket 类 可以传入不同参数直接实例化对象并绑定 IP 和 端口。而 SocketChannel、ServerSocketChannel 类 需要借助 Selector 类。

下面是 SocketChannel 方式 需要用到的几个核心类：

ServerSocketChannel：ServerSocket 的替代类, 支持阻塞通信与非阻塞通信。

SocketChannel：Socket 的替代类, 支持阻塞通信与非阻塞通信。

Selector：为 ServerSocketChannel 监控接收客户端连接就绪事件, 为 SocketChannel 监控连接服务器读就绪和写就绪事件。

SelectionKey：代表 ServerSocketChannel 及 SocketChannel 向 Selector 注册事件的句柄。

当一个 SelectionKey 对象 位于 Selector 对象 的 selected-keys 集合 中时，就表示与这个 SelectionKey 对象 相关的事件发生了。

在 SelectionKey 类 中有如下几个静态常量：

- SelectionKey.OP_ACCEPT，客户端连接就绪事件，等于监听 serverSocket.accept()，返回一个 socket。

- SelectionKey.OP_CONNECT，准备连接服务器就绪，跟上面类似，只不过是对于 socket 的，相当于监听了 socket.connect()。

- SelectionKey.OP_READ，读就绪事件, 表示输入流中已经有了可读数据, 可以执行读操作了。

- SelectionKey.OP_WRITE，写就绪事件, 表示可以执行写操作了。


# Netty 高性能设计

Netty 作为异步事件驱动的网络，高性能之处主要来自于其 I/O 模型和线程处理模型，前者决定如何收发数据，后者决定如何处理数据。

## I/O 模型

用什么样的通道将数据发送给对方，BIO、NIO 或者 AIO，I/O 模型在很大程度上决定了框架的性能。

## 阻塞 I/O

传统阻塞型 I/O(BIO)可以用下图表示：

![BIO](http://5b0988e595225.cdn.sohucs.com/images/20181102/8af3494c4b01416fae52dff97814da40.jpeg)

特点如下：

1. 每个请求都需要独立的线程完成数据 Read，业务处理，数据 Write 的完整操作问题。

2. 当并发数较大时，需要创建大量线程来处理连接，系统资源占用较大。

3. 连接建立后，如果当前线程暂时没有数据可读，则线程就阻塞在 Read 操作上，造成线程资源浪费。

## I/O 复用模型

![I/O 复用模型](http://5b0988e595225.cdn.sohucs.com/images/20181102/be867c0df0f548f581f817482b5b54da.jpeg)

在 I/O 复用模型中，会用到 Select，这个函数也会使进程阻塞，但是和阻塞 I/O 所不同的是这两个函数可以同时阻塞多个 I/O 操作。

而且可以同时对多个读操作，多个写操作的 I/O 函数进行检测，直到有数据可读或可写时，才真正调用 I/O 操作函数。

Netty 的非阻塞 I/O 的实现关键是基于 I/O 复用模型，这里用 Selector 对象表示：

![netty-selector](http://5b0988e595225.cdn.sohucs.com/images/20181102/1f090baec9774e4c9865a5d7a14f06d5.jpeg)

Netty 的 IO 线程 NioEventLoop 由于聚合了多路复用器 Selector，可以同时并发处理成百上千个客户端连接。

当线程从某客户端 Socket 通道进行读写数据时，若没有数据可用时，该线程可以进行其他任务。

线程通常将非阻塞 IO 的空闲时间用于在其他通道上执行 IO 操作，所以单独的线程可以管理多个输入和输出通道。

由于读写操作都是非阻塞的，这就可以充分提升 IO 线程的运行效率，避免由于频繁 I/O 阻塞导致的线程挂起。

一个 I/O 线程可以并发处理 N 个客户端连接和读写操作，这从根本上解决了传统同步阻塞 I/O 一连接一线程模型，架构的性能、弹性伸缩能力和可靠性都得到了极大的提升。

## 基于 Buffer

传统的 I/O 是面向字节流或字符流的，以流式的方式顺序地从一个 Stream 中读取一个或多个字节, 因此也就不能随意改变读取指针的位置。

在 NIO 中，抛弃了传统的 I/O 流，而是引入了 Channel 和 Buffer 的概念。

在 NIO 中，只能从 Channel 中读取数据到 Buffer 中或将数据从 Buffer 中写入到 Channel。

基于 Buffer 操作不像传统 IO 的顺序操作，NIO 中可以随意地读取任意位置的数据。

# 线程模型

数据报如何读取？

读取之后的编解码在哪个线程进行，编解码后的消息如何派发，线程模型的不同，对性能的影响也非常大。

## 事件驱动模型

通常，我们设计一个事件处理模型的程序有两种思路：

1. 轮训方式

2. 事件驱动方式

### 轮训方式

轮询方式，线程不断轮询访问相关事件发生源有没有发生事件，有发生事件就调用事件处理逻辑。

### 事件驱动方式

事件驱动方式，发生事件，主线程把事件放入事件队列，在另外线程不断循环消费事件列表中的事件，调用事件对应的处理逻辑处理事件。

事件驱动方式也被称为消息通知方式，其实是设计模式中观察者模式的思路。

以 GUI 的逻辑处理为例，说明两种逻辑的不同：

轮询方式，线程不断轮询是否发生按钮点击事件，如果发生，调用处理逻辑。

事件驱动方式，发生点击事件把事件放入事件队列，在另外线程消费的事件列表中的事件，根据事件类型调用相关事件处理逻辑。

这里借用 O'Reilly 大神关于事件驱动模型解释图：

![事件驱动方式](http://5b0988e595225.cdn.sohucs.com/images/20181102/af4d9ed3560240f58526336934753387.jpeg)

主要包括 4 个基本组件：

1. 事件队列（event queue）：接收事件的入口，存储待处理事件。

2. 分发器（event mediator）：将不同的事件分发到不同的业务逻辑单元。

3. 事件通道（event channel）：分发器与处理器之间的联系渠道。

4. 事件处理器（event processor）：实现业务逻辑，处理完成后会发出事件，触发下一步操作。

### 优点

可以看出，相对传统轮询模式，事件驱动有如下优点：

1. 可扩展性好，分布式的异步架构，事件处理器之间高度解耦，可以方便扩展事件处理逻辑。

2. 高性能，基于队列暂存事件，能方便并行异步处理事件。

## Reactor 线程模型

Reactor 是反应堆的意思，Reactor 模型是指通过一个或多个输入同时传递给服务处理器的服务请求的事件驱动处理模式。

服务端程序处理传入多路请求，并将它们同步分派给请求对应的处理线程，Reactor 模式也叫 Dispatcher 模式，即 I/O 多了复用统一监听事件，收到事件后分发(Dispatch 给某进程)，是编写高性能网络服务器的必备技术之一。

Reactor 模型中有 2 个关键组成：

Reactor，Reactor 在一个单独的线程中运行，负责监听和分发事件，分发给适当的处理程序来对 IO 事件做出反应。它就像公司的电话接线员，它接听来自客户的电话并将线路转移到适当的联系人。

Handlers，处理程序执行 I/O 事件要完成的实际事件，类似于客户想要与之交谈的公司中的实际官员。

Reactor 通过调度适当的处理程序来响应 I/O 事件，处理程序执行非阻塞操作。

![Reactor 线程模型](http://p3.pstatp.com/large/pgc-image/cf809d28ca544fa9a04b7d6352c0c972)

### Reactor 模型

取决于 Reactor 的数量和 Hanndler 线程数量的不同，Reactor 模型有 3 个变种：

1. 单 Reactor 单线程。

2. 单 Reactor 多线程。

3. 主从 Reactor 多线程。

可以这样理解，Reactor 就是一个执行 `while (true) { selector.select(); …}` 循环的线程，会源源不断的产生新的事件，称作反应堆很贴切。

# Netty 线程模型

Netty 主要基于主从 Reactors 多线程模型（如下图）做了一定的修改，其中主从 Reactor 多线程模型有多个 Reactor：

1. MainReactor 负责客户端的连接请求，并将请求转交给 SubReactor。

2. SubReactor 负责相应通道的 IO 读写请求。

3. 非 IO 请求（具体逻辑处理）的任务则会直接写入队列，等待 worker threads 进行处理。

这里引用 Doug Lee 大神的 Reactor 介绍：Scalable IO in Java 里面关于主从 Reactor 多线程模型的图：

![主从 Rreactor 多线程模型](http://p1.pstatp.com/large/pgc-image/2d1cef14eec944c9a6a05b4951b44452)

特别说明的是：虽然 Netty 的线程模型基于主从 Reactor 多线程，借用了 MainReactor 和 SubReactor 的结构。但是实际实现上 SubReactor 和 Worker 线程在同一个线程池中：

```java
EventLoopGroup bossGroup = new NioEventLoopGroup(); 
EventLoopGroup workerGroup = new NioEventLoopGroup(); 
ServerBootstrap server = new ServerBootstrap(); 
server.group(bossGroup, workerGroup).channel(NioServerSocketChannel.class) 
```

上面代码中的 bossGroup 和 workerGroup 是 Bootstrap 构造方法中传入的两个对象，这两个 group 均是线程池：

bossGroup 线程池则只是在 Bind 某个端口后，获得其中一个线程作为 MainReactor，专门处理端口的 Accept 事件，每个端口对应一个 Boss 线程。

workerGroup 线程池会被各个 SubReactor 和 Worker 线程充分利用。

# 异步处理

异步的概念和同步相对。

当一个异步过程调用发出后，调用者不能立刻得到结果。实际处理这个调用的部件在完成后，通过状态、通知和回调来通知调用者。

Netty 中的 I/O 操作是异步的，包括 Bind、Write、Connect 等操作会简单的返回一个 ChannelFuture。

调用者并不能立刻获得结果，而是通过 Future-Listener 机制，用户可以方便的主动获取或者通过通知机制获得 IO 操作结果。

当 Future 对象刚刚创建时，处于非完成状态，调用者可以通过返回的 ChannelFuture 来获取操作执行的状态，注册监听函数来执行完成后的操作。

## 常见有如下操作：

通过 isDone 方法来判断当前操作是否完成。

通过 isSuccess 方法来判断已完成的当前操作是否成功。

通过 getCause 方法来获取已完成的当前操作失败的原因。

通过 isCancelled 方法来判断已完成的当前操作是否被取消。

通过 addListener 方法来注册监听器，当操作已完成(isDone 方法返回完成)，将会通知指定的监听器；如果 Future 对象已完成，则理解通知指定的监听器。

例如下面的代码中绑定端口是异步操作，当绑定操作处理完，将会调用相应的监听器处理逻辑。

```java
serverBootstrap.bind(port).addListener(future -> { 
    if (future.isSuccess()) { 
        System.out.println(new Date() + ": 端口[" + port + "]绑定成功!"); 
    } else { 
        System.err.println("端口[" + port + "]绑定失败!"); 
    } 
}); 
```

相比传统阻塞 I/O，执行 I/O 操作后线程会被阻塞住, 直到操作完成；异步处理的好处是不会造成线程阻塞，线程在 I/O 操作期间可以执行别的程序，在高并发情形下会更稳定和更高的吞吐量。

# Netty 架构设计

前面介绍完 Netty 相关一些理论，下面从功能特性、模块组件、运作过程来介绍 Netty 的架构设计。

## 功能特性

![netty-features](http://p3.pstatp.com/large/pgc-image/209936dee41246f6b5136cd8ddcab98b)

Netty 功能特性如下：

传输服务，支持 BIO 和 NIO。

容器集成，支持 OSGI、JBossMC、Spring、Guice 容器。

协议支持，HTTP、Protobuf、二进制、文本、WebSocket 等一系列常见协议都支持。还支持通过实行编码解码逻辑来实现自定义协议。

Core 核心，可扩展事件模型、通用通信 API、支持零拷贝的 ByteBuf 缓冲对象。

# 模块组件

## Bootstrap、ServerBootstrap

Bootstrap 意思是引导，一个 Netty 应用通常由一个 Bootstrap 开始，主要作用是配置整个 Netty 程序，串联各个组件，Netty 中 Bootstrap 类是客户端程序的启动引导类，ServerBootstrap 是服务端启动引导类。

## Future、ChannelFuture

正如前面介绍，在 Netty 中所有的 IO 操作都是异步的，不能立刻得知消息是否被正确处理。

但是可以过一会等它执行完成或者直接注册一个监听，具体的实现就是通过 Future 和 ChannelFutures，他们可以注册一个监听，当操作执行成功或失败时监听会自动触发注册的监听事件。

## Channel

Netty 网络通信的组件，能够用于执行网络 I/O 操作。Channel 为用户提供：

当前网络连接的通道的状态（例如是否打开？是否已连接？）

网络连接的配置参数 （例如接收缓冲区大小）

提供异步的网络 I/O 操作(如建立连接，读写，绑定端口)，异步调用意味着任何 I/O 调用都将立即返回，并且不保证在调用结束时所请求的 I/O 操作已完成。

调用立即返回一个 ChannelFuture 实例，通过注册监听器到 ChannelFuture 上，可以 I/O 操作成功、失败或取消时回调通知调用方。

支持关联 I/O 操作与对应的处理程序。

### 常见 Channel 类型

不同协议、不同的阻塞类型的连接都有不同的 Channel 类型与之对应。

下面是一些常用的 Channel 类型：

NioSocketChannel，异步的客户端 TCP Socket 连接。

NioServerSocketChannel，异步的服务器端 TCP Socket 连接。

NioDatagramChannel，异步的 UDP 连接。

NioSctpChannel，异步的客户端 Sctp 连接。

NioSctpServerChannel，异步的 Sctp 服务器端连接，这些通道涵盖了 UDP 和 TCP 网络 IO 以及文件 IO。

## Selector


Netty 基于 Selector 对象实现 I/O 多路复用，通过 Selector 一个线程可以监听多个连接的 Channel 事件。

当向一个 Selector 中注册 Channel 后，Selector 内部的机制就可以自动不断地查询(Select) 这些注册的 Channel 是否有已就绪的 I/O 事件（例如可读，可写，网络连接完成等），这样程序就可以很简单地使用一个线程高效地管理多个 Channel 。

## NioEventLoop

NioEventLoop 中维护了一个线程和任务队列，支持异步提交执行任务，线程启动时会调用 NioEventLoop 的 run 方法，执行 I/O 任务和非 I/O 任务：

I/O 任务，即 selectionKey 中 ready 的事件，如 accept、connect、read、write 等，由 processSelectedKeys 方法触发。

非 IO 任务，添加到 taskQueue 中的任务，如 register0、bind0 等任务，由 runAllTasks 方法触发。

两种任务的执行时间比由变量 ioRatio 控制，默认为 50，则表示允许非 IO 任务执行的时间与 IO 任务的执行时间相等。

## NioEventLoopGroup

NioEventLoopGroup，主要管理 eventLoop 的生命周期，可以理解为一个线程池，内部维护了一组线程，每个线程(NioEventLoop)负责处理多个 Channel 上的事件，而一个 Channel 只对应于一个线程。

## ChannelHandler

ChannelHandler 是一个接口，处理 I/O 事件或拦截 I/O 操作，并将其转发到其 ChannelPipeline(业务处理链)中的下一个处理程序。

ChannelHandler 本身并没有提供很多方法，因为这个接口有许多的方法需要实现，方便使用期间，可以继承它的子类：

ChannelInboundHandler 用于处理入站 I/O 事件。

ChannelOutboundHandler 用于处理出站 I/O 操作。

或者使用以下适配器类：

ChannelInboundHandlerAdapter 用于处理入站 I/O 事件。

ChannelOutboundHandlerAdapter 用于处理出站 I/O 操作。

ChannelDuplexHandler 用于处理入站和出站事件。

## ChannelHandlerContext

保存 Channel 相关的所有上下文信息，同时关联一个 ChannelHandler 对象。

## ChannelPipline

保存 ChannelHandler 的 List，用于处理或拦截 Channel 的入站事件和出站操作。

ChannelPipeline 实现了一种高级形式的拦截过滤器模式，使用户可以完全控制事件的处理方式，以及 Channel 中各个的 ChannelHandler 如何相互交互。

下图引用 Netty 的 Javadoc 4.1 中 ChannelPipeline 的说明，描述了 ChannelPipeline 中 ChannelHandler 通常如何处理 I/O 事件。

I/O 事件由 ChannelInboundHandler 或 ChannelOutboundHandler 处理，并通过调用 ChannelHandlerContext 中定义的事件传播方法。

例如 ChannelHandlerContext.fireChannelRead（Object）和 ChannelOutboundInvoker.write（Object）转发到其最近的处理程序。

![ChannelPipline](http://p1.pstatp.com/large/pgc-image/e9af2af1c93542fbbdedb1d598f60df9)

入站事件由自下而上方向的入站处理程序处理，如图左侧所示。入站 Handler 处理程序通常处理由图底部的 I/O 线程生成的入站数据。

通常通过实际输入操作（例如 SocketChannel.read（ByteBuffer））从远程读取入站数据。

出站事件由上下方向处理，如图右侧所示。出站 Handler 处理程序通常会生成或转换出站传输，例如 write 请求。

I/O 线程通常执行实际的输出操作，例如 SocketChannel.write（ByteBuffer）。

在 Netty 中每个 Channel 都有且仅有一个 ChannelPipeline 与之对应，它们的组成关系如下：

![组成关系](http://p3.pstatp.com/large/pgc-image/cb7ea57530284ddd8c4b0fd3acfc1075)

一个 Channel 包含了一个 ChannelPipeline，而 ChannelPipeline 中又维护了一个由 ChannelHandlerContext 组成的双向链表，并且每个 ChannelHandlerContext 中又关联着一个 ChannelHandler。

入站事件和出站事件在一个双向链表中，入站事件会从链表 head 往后传递到最后一个入站的 handler，出站事件会从链表 tail 往前传递到最前一个出站的 handler，两种类型的 handler 互不干扰。

# Netty 工作原理架构

初始化并启动 Netty 服务端过程如下：

```java
public static void main(String[] args) { 
 // 创建mainReactor 
 NioEventLoopGroup boosGroup = new NioEventLoopGroup(); 
 // 创建工作线程组 
 NioEventLoopGroup workerGroup = new NioEventLoopGroup(); 
 
 final ServerBootstrap serverBootstrap = new ServerBootstrap(); 
 serverBootstrap 
 // 组装NioEventLoopGroup 
 .group(boosGroup, workerGroup) 
 // 设置channel类型为NIO类型 
 .channel(NioServerSocketChannel.class) 
 // 设置连接配置参数 
 .option(ChannelOption.SO_BACKLOG, 1024) 
 .childOption(ChannelOption.SO_KEEPALIVE, true) 
 .childOption(ChannelOption.TCP_NODELAY, true) 
 // 配置入站、出站事件handler 
 .childHandler(new ChannelInitializer<NioSocketChannel>() { 
 @Override 
 protected void initChannel(NioSocketChannel ch) { 
 // 配置入站、出站事件channel 
 ch.pipeline().addLast(...); 
 ch.pipeline().addLast(...); 
 } 
 }); 
 
 // 绑定端口 
 int port = 8080; 
 serverBootstrap.bind(port).addListener(future -> { 
 if (future.isSuccess()) { 
 System.out.println(new Date() + ": 端口[" + port + "]绑定成功!"); 
 } else { 
 System.err.println("端口[" + port + "]绑定失败!"); 
 } 
 }); 
} 
```

### 基本过程如下：

初始化创建 2 个 NioEventLoopGroup，其中 boosGroup 用于 Accetpt 连接建立事件并分发请求，workerGroup 用于处理 I/O 读写事件和业务逻辑。

基于 ServerBootstrap(服务端启动引导类)，配置 EventLoopGroup、Channel 类型，连接参数、配置入站、出站事件 handler。

绑定端口，开始工作。

结合上面介绍的 Netty Reactor 模型，介绍服务端 Netty 的工作架构图：

![服务端 netty 架构图](http://p1.pstatp.com/large/pgc-image/1a9646f2836a48a28e6c1c2c4f1dbe76)

Server 端包含 1 个 Boss NioEventLoopGroup 和 1 个 Worker NioEventLoopGroup。

NioEventLoopGroup 相当于 1 个事件循环组，这个组里包含多个事件循环 NioEventLoop，每个 NioEventLoop 包含 1 个 Selector 和 1 个事件循环线程。

- Boss

每个 Boss NioEventLoop 循环执行的任务包含 3 步：

轮询 Accept 事件。

处理 Accept I/O 事件，与 Client 建立连接，生成 NioSocketChannel，并将 NioSocketChannel 注册到某个 Worker NioEventLoop 的 Selector 上。

处理任务队列中的任务，runAllTasks。任务队列中的任务包括用户调用 eventloop.execute 或 schedule 执行的任务，或者其他线程提交到该 eventloop 的任务。

- Worker 

每个 Worker NioEventLoop 循环执行的任务包含 3 步：

轮询 Read、Write 事件。

处理 I/O 事件，即 Read、Write 事件，在 NioSocketChannel 可读、可写事件发生时进行处理。

处理任务队列中的任务，runAllTasks。


## 任务队列的 Task 典型使用场景

其中任务队列中的 Task 有 3 种典型使用场景。

### 1. 用户程序自定义的普通任务

```java
ctx.channel().eventLoop().execute(new Runnable() { 
 @Override 
 public void run() { 
 //... 
 } 
}); 
```

### 2. 非当前 Reactor 线程调用 Channel 的各种方法

例如在推送系统的业务线程里面，根据用户的标识，找到对应的 Channel 引用，然后调用 Write 类方法向该用户推送消息，就会进入到这种场景。最终的 Write 会提交到任务队列中后被异步消费。

### 3. 用户自定义定时任务

```java
ctx.channel().eventLoop().schedule(new Runnable() { 
 @Override 
 public void run() { 
 
 } 
}, 60, TimeUnit.SECONDS); 
```

# 小结

现在稳定推荐使用的主流版本还是 Netty4，Netty5 中使用了 ForkJoinPool，增加了代码的复杂度，但是对性能的改善却不明显，所以这个版本不推荐使用，官网也没有提供下载链接。

Netty 入门门槛相对较高，是因为这方面的资料较少，并不是因为它有多难，大家其实都可以像搞透 Spring 一样搞透 Netty。

在学习之前，建议先理解透整个框架原理结构，运行过程，可以少走很多弯路。

# 参考资料

[这可能是目前最透彻的Netty原理架构解析 ](http://www.sohu.com/a/272879207_463994)

* any list
{:toc}
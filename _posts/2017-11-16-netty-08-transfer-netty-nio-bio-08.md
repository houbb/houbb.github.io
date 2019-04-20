---
layout: post
title:  Netty-08-数据传输之 Netty 
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: true
---

# 模型

## NIO模型

同步非阻塞

NIO有同步阻塞和同步非阻塞两种模式，一般讲的是同步非阻塞，服务器实现模式为一个请求一个线程，但客户端发送的连接请求都会注册到多路复用器上，多路复用器轮询到连接有I/O请求时才启动一个线程进行处理。

## AIO模型

异步非阻塞

服务器实现模式为一个有效请求一个线程，客户端的I/O请求都是由OS先完成了再通知服务器应用去启动线程进行处理，注：AIO又称为NIO2.0，在JDK7才开始支持。

# netty 为什么不选择 aio

Netty不看重Windows上的使用，在Linux系统上，AIO的底层实现仍使用EPOLL，没有很好实现AIO，因此在性能上没有明显的优势，而且被JDK封装了一层不容易深度优化
Netty整体架构是reactor模型, 而AIO是 proactor 模型, 混合在一起会非常混乱,把AIO也改造成 reactor 模型看起来是把epoll绕个弯又绕回来

AIO还有个缺点是接收数据需要预先分配缓存, 而不是NIO那种需要接收时才需要分配缓存, 所以对连接数量非常大但流量小的情况, 内存浪费很多

Linux上AIO不够成熟，处理回调结果速度跟不到处理需求，比如外卖员太少，顾客太多，供不应求，造成处理速度有瓶颈（待验证）

# OIO

用线程池可以有多个客户端连接，但是非常消耗性能，每一个客户都需要一个线程提供独立服务。

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
 
 
public class OioServer {
	private ExecutorService executorService = Executors.newFixedThreadPool(5);
 
	public OioServer(int port) {
		this.port = port;
	}
 
	public void start() {
		try {
			serverSocket = new ServerSocket(this.port);
			System.out.println("服务启动");
 
 
			while (true) {
				Socket socket = serverSocket.accept();
 
				if (socket == null) {
					continue;
				}
 
				System.out.println("来了一个客户");
				executorService.submit(new Runnable() {
					@Override
					public void run() {
						handler(socket);
					}
				});
			}
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}
 
 
	private void handler(Socket socket) {
		InputStream is = null;
		OutputStream os = null;
		byte[] bytes = new byte[10];
		try {
			is = socket.getInputStream();
			int length = -1;
			while ((length = is.read(bytes)) != -1) {
				System.out.println(new String(bytes, 0, length));
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			//...
		}
	}
 
 
	private int port;
	private ServerSocket serverSocket = null;
 
 
	public static void main(String[] args) {
		new OioServer(1000).start();
	}
 
}
```

# netty 中的区分

```java
ServerBootstrap bootstrap = new ServerBootstrap(
				new OioServerSocketChannelFactory(
						Executors.newCachedThreadPool(),
						Executors.newFixedThreadPool(4)));
ServerBootstrap bootstrap = new ServerBootstrap(
				new NioServerSocketChannelFactory(
						Executors.newCachedThreadPool(),
						Executors.newFixedThreadPool(4)));
```

再说说，这两种情况的区别。OneCoder根据网上的资料和自己的理解，总结了一下：在Netty中，是通过worker执行任务的。也就是我们在构造bootstrap时传入的worker线程池。对于传统OIO来说，一个worker对应的channel，从读到操作到再到回写，只要是这个channel的操作都通过这个worker来完成，对于NIO来说，到MessageRecieved之后，该worker的任务就完成了。所以，从这个角度来说，非常建议你在Recieve之后，立即启动线程去执行耗时逻辑，以释放worker。

基于这个分析，你可能也发现了，上面的代码中我们用的是FiexedThreadPool。固定大小为4，从理论上来说，OIO支持的client数应该是4。而NIO应该不受此影响。测试效果如下图：


# 内置传输

Netty 内置了一些可开箱即用的传输。

因为并不是它们所有的传输都支持每一种协议，所以你必须选择一个和你的应用程序所使用的协议相容的传输。

在本节中我们将讨论这些关系。

| 名 称 | 包 描 述 | 选择器的方式 |
| NIO | `io.netty.channel.socket.nio` | 使用java.nio.channels 包作为基础——基于选择器的方式 |
| Epoll | `io.netty.channel.epoll` | 由 JNI 驱动的 epoll()和非阻塞 IO。这个传输支持 只有在Linux 上可用的多种特性，如SO_REUSEPORT。比NIO 传输更快，而且是完全非阻塞的 |
| OIO |  io.netty.channel.socket.oio | 使用java.net 包作为基础——使用阻塞流 |
| Local | io.netty.channel.local | 可以在 JVM 内部通过管道进行通信的本地传输| 
| Embedded | io.netty.channel.embedded | Embedded 传输，允许使用ChannelHandler 而又不需要一个真正的基于网络的传输。这在测试你的ChannelHandler 实现时非常有用 |

# NIO

NIO 提供了一个所有 I/O 操作的全异步的实现。

它利用了自NIO 子系统被引入JDK 1.4 时便可用的基于选择器的API。

选择器背后的基本概念是充当一个注册表，在那里你将可以请求在Channel 的状态发生变化时得到通知。

可能的状态变化有：

1. 新的 Channel 已被接受并且就绪；

2. Channel 连接已经完成；

3. Channel 有已经就绪的可供读取的数据；

4. Channel 可用于写数据。

选择器运行在一个检查状态变化并对其做出相应响应的线程上，在应用程序对状态的改变做出响应之后，选择器将会被重置，并将重复这个过程。

## 选择操作的位模式

下表中的常量值代表了由 class java.nio.channels.SelectionKey 定义的位模式。

这些位模式可以组合起来定义一组应用程序正在请求通知的状态变化集。

| 名 称 |  描 述 | 
|:---|:---|
| OP_ACCEPT  |  请求在接受新连接并创建Channel 时获得通知  |
| OP_CONNECT |  请求在建立一个连接时获得通知  |
| OP_READ    |  请求当数据已经就绪，可以从Channel 中读取时获得通知 |
| OP_WRITE   |  请求当可以向Channel 中写更多的数据时获得通知。这处理了套接字缓冲区被完全填满时的情况，这种情况通常发生在数据的发送速度比远程节点可处 理的速度更快的时候 |

对于所有Netty 的传输实现都共有的用户级别API 完全地隐藏了这些NIO 的内部细节。

## 零拷贝

零拷贝（zero-copy）是一种目前只有在使用 NIO 和 Epoll 传输时才可使用的特性。

它使你可以快速高效地将数据从文件系统移动到网络接口，而不需要将其从内核空间复制到用户空间，其在像FTP 或者HTTP 这样的协议中可以显著地提升性能。

但是，并不是所有的操作系统都支持这一特性。特别地，它对于实现了数据加密或者压缩的文件系统是不可用的——只能传输文件的原始内容。

反过来说，传输已被加密的文件则不是问题。

# Epoll—用于Linux 的本地非阻塞传输

正如我们之前所说的，Netty 的NIO 传输基于Java 提供的异步/非阻塞网络编程的通用抽象。

虽然这保证了Netty 的非阻塞API 可以在任何平台上使用，但它也包含了相应的限制，因为JDK为了在所有系统上提供相同的功能，必须做出妥协。

## linux epoll

Linux作为高性能网络编程的平台，其重要性与日俱增，这催生了大量先进特性的开发，其中包括epoll——一个高度可扩展的I/O事件通知特性。

这个API自Linux内核版本2.5.44（2002）被引入，提供了比旧的POSIX select和poll系统调用

参见Linux 手册页中的epoll(4)：http://linux.die.net/man/4/epoll。

更好的性能，同时现在也是Linux上非阻塞网络编程的事实标准。

Linux JDK NIO API使用了这些epoll调用。

## netty

Netty为Linux提供了一组NIO API，其以一种和它本身的设计更加一致的方式使用epoll，并且以一种更加轻量的方式使用中断。

如果你的应用程序旨在运行于Linux系统，那么请考虑利用这个版本的传输；你将发现在高负载下它的性能要优于JDK的NIO实现。

这个传输的语义与在图4-2 所示的完全相同，而且它的用法也是简单直接的。相关示例参照代码清单4-4。

如果要在那个代码清单中使用epoll 替代NIO，只需要将NioEventLoopGroup替换为EpollEventLoopGroup， 
并且将NioServerSocketChannel.class 替换为EpollServerSocketChannel.class 即可。

# OIO-旧的阻塞I/O

Netty 的OIO 传输实现代表了一种折中：它可以通过常规的传输API 使用，但是由于它是建立在java.net 包的阻塞实现之上的，所以它不是异步的。

但是，它仍然非常适合于某些用途。

## 适用场景

例如，你可能需要移植使用了一些进行阻塞调用的库（如JDBC的遗留代码，而将逻辑转换为非阻塞的可能也是不切实际的。

相反，你可以在短期内使用Netty的OIO传输，然后再将你的代码移植到纯粹的异步传输上。

让我们来看一看怎么做。

在java.net API 中，你通常会有一个用来接受到达正在监听的ServerSocket 的新连接的线程。

会创建一个新的和远程节点进行交互的套接字，并且会分配一个新的用于处理相应通信流量的线程。

这是必需的，因为某个指定套接字上的任何 I/O 操作在任意的时间点上都可能会阻塞。

使用单个线程来处理多个套接字，很容易导致一个套接字上的阻塞操作也捆绑了所有其他的套接字。

## Netty 是如何做到的

有了这个背景，你可能会想，Netty是如何能够使用和用于异步传输相同的API来支持OIO的呢?

答案就是，Netty利用了SO_TIMEOUT这个Socket标志，它指定了等待一个I/O操作完成的最大毫秒数。

如果操作在指定的时间间隔内没有完成，则将会抛出一个SocketTimeout Exception。

Netty将捕获这个异常并继续处理循环。

在EventLoop下一次运行时，它将再次尝试。

这实际上也是类似于Netty这样的异步框架能够支持OIO的唯一方式。

ps: 这是一种比较巧妙的方式，适用异步+超时异常=实现同步。

这种方式的一个问题是，当一个 SocketTimeoutException 被抛出时填充栈跟踪所需要的时间，其对于性能来说代价很大。

# Local 

用于 JVM 内部通信的 Local 传输。

Netty 提供了一个 Local 传输，用于在同一个 JVM 中运行的客户端和服务器程序之间的异步通信。

同样，这个传输也支持对于所有 Netty 传输实现都共同的 API。

在这个传输中，和服务器Channel 相关联的SocketAddress 并没有绑定物理网络地址；

相反，只要服务器还在运行，它就会被存储在注册表里，并在Channel 关闭时注销。

因为这个传输并不接受真正的网络流量，所以它并不能够和其他传输实现进行互操作。

因此，客户端希望连接到（在同一个JVM 中）使用了这个传输的服务器端时也必须使用它。

除了这个限制，它的使用方式和其他的传输一模一样。

# Embedded

Netty 提供了一种额外的传输，使得你可以将一组ChannelHandler 作为帮助器类嵌入到其他的ChannelHandler 内部。

通过这种方式，你将可以扩展一个ChannelHandler 的功能，而又不需要修改其内部代码。

不足为奇的是，Embedded 传输的关键是一个被称为 EmbeddedChannel 的具体的Channel实现。

在第 9 章中，我们将详细地讨论如何使用这个类来为 ChannelHandler 的实现创建单元测试用例。

# 传输用例

虽然只有SCTP 传输有这些特殊要求，但是其他传输可能也有它们自己的配置选项需要考虑。

此外，如果只是为了支持更高的并发连接数，服务器平台可能需要配置得和客户端不一样。

这里是一些你很可能会遇到的用例。

## 非阻塞代码库

如果你的代码库中没有阻塞调用（或者你能够限制它们的范围），那么在Linux 上使用NIO 或者epoll 始终是个好主意。

虽然NIO/epoll 旨在处理大量的并发连接，但是在处理较小数目的并发连接时，它也能很好地工作，尤其是考虑到它在连接之间共享线程的方式。

## 阻塞代码库

正如我们已经指出的，如果你的代码库严重地依赖于阻塞I/O，而且你的应用程序也有一个相应的设计，
那么在你尝试将其直接转换为Netty 的NIO 传输时，你将可能会遇到和阻塞操作相关的问题。

不要为此而重写你的代码，可以考虑分阶段迁移：先从OIO 开始，等你的代码修改好之后，再迁移到NIO（或者使用epoll，如果你在使用Linux）。

## 在同一个JVM 内部的通信

在同一个JVM 内部的通信，不需要通过网络暴露服务，是Local 传输的完美用例。

这将消除所有真实网络操作的开销，同时仍然使用你的Netty 代码库。

如果随后需要通过网络暴露服务，那么你将只需要把传输改为NIO 或者OIO 即可。

## 测试你的ChannelHandler 实现

如果你想要为自己的ChannelHandler 实现编写单元测试，那么请考虑使用Embedded 传输。

这既便于测试你的代码，而又不需要创建大量的模拟（mock）对象。

你的类将仍然符合常规的API 事件流，保证该ChannelHandler在和真实的传输一起使用时能够正确地工作。

你将在第 9 章中发现关于测试 ChannelHandler 的更多信息。

# 拓展阅读

## 模型

reactor

proactor

epoll

## io

BIO

NIO

AIO

# 个人收获

1. 框架本身一般是提供了更好的性能，更丰富的功能，更简易的写法。

2. 框架一般都提供了所有平台适用的 API，这是一种标准，让使用者不用关心细节。但是也会有对应的缺点，会做出性能等方面的 trade-off。

3. 框架提供的标准让不同方式之间的转换非常的方便。这是一个优秀的封装必备的功能。

# 参考资料

《Netty 实战》P76

[为什么Netty使用NIO而不是AIO？](https://www.jianshu.com/p/df1d6d8c3f9d)

## OIO

[Java NIO框架Netty教程(十四)-Netty中OIO模型(对比NIO)](http://www.cnblogs.com/hashcoder/p/7648437.html)

[Netty 快速入门系列 - Chapter 1 传统OIO与NIO - 传统OIO 【第一讲】](https://blog.csdn.net/netcobol/article/details/79688263)

* any list
{:toc}


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

# Linux Epoll

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

# JVM  Local 

# Embedded


# 拓展阅读

## 模型

reactor

proactor

epoll

## io

BIO

NIO

AIO

# 参考资料

[为什么Netty使用NIO而不是AIO？](https://www.jianshu.com/p/df1d6d8c3f9d)

## OIO

[Java NIO框架Netty教程(十四)-Netty中OIO模型(对比NIO)](http://www.cnblogs.com/hashcoder/p/7648437.html)

[Netty 快速入门系列 - Chapter 1 传统OIO与NIO - 传统OIO 【第一讲】](https://blog.csdn.net/netcobol/article/details/79688263)

* any list
{:toc}


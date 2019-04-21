---
layout: post
title:  Netty-07-通讯模型之 AIO
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: true
---

# java 中的 AIO 

jdk7中新增了一些与文件(网络)I/O相关的一些api。这些API被称为NIO.2，或称为AIO(Asynchronous I/O)。

AIO最大的一个特性就是异步能力，这种能力对socket与文件I/O都起作用。

AIO其实是一种在读写操作结束之前允许进行其他操作的I/O处理。AIO是对JDK1.4中提出的同步非阻塞I/O(NIO)的进一步增强。

关于NIO,之前的一篇文章可以看看：java中的NIO

jdk7主要增加了三个新的异步通道:

AsynchronousFileChannel: 用于文件异步读写；

AsynchronousSocketChannel: 客户端异步socket；

AsynchronousServerSocketChannel: 服务器异步socket。

因为AIO的实施需充分调用OS参与，IO需要操作系统支持、并发也同样需要操作系统的支持，所以性能方面不同操作系统差异会比较明显。

# 异步非阻塞 I/O（AIO）

最后，异步非阻塞 I/O 模型是一种CPU处理与 I/O 重叠进行的模型。读请求会立即返回，说明 read 请求已经成功发起了。

在后台完成读操作时，应用程序然后会执行其他处理操作。

当 read 的响应到达时，就会产生一个信号或执行一个基于线程的回调函数来完成这次 I/O 处理过程。

![异步非阻塞 I/O（AIO）](https://www.ibm.com/developerworks/cn/linux/l-async/figure5.gif)

在一个进程中为了执行多个 I/O 请求而对计算操作和 I/O 处理进行重叠处理的能力利用了处理速度与 I/O 速度之间的差异。当一个或多个 I/O 请求挂起时，CPU 可以执行其他任务；或者更为常见的是，在发起其他 I/O 的同时对已经完成的 I/O 进行操作。

下一节将深入介绍这种模型，探索这种模型使用的 API，然后展示几个命令。

## 动机

从前面 I/O 模型的分类中，我们可以看出 AIO 的动机。这种阻塞模型需要在 I/O 操作开始时阻塞应用程序。这意味着不可能同时重叠进行处理和 I/O 操作。同步非阻塞模型允许处理和 I/O 操作重叠进行，但是这需要应用程序根据重现的规则来检查 I/O 操作的状态。这样就剩下异步非阻塞 I/O 了，它允许处理和 I/O 操作重叠进行，包括 I/O 操作完成的通知。

除了需要阻塞之外，select 函数所提供的功能（异步阻塞 I/O）与 AIO 类似。不过，它是对通知事件进行阻塞，而不是对 I/O 调用进行阻塞。

## Linux 上的 AIO 简介

本节将探索 Linux 的异步 I/O 模型，从而帮助我们理解如何在应用程序中使用这种技术。

在传统的 I/O 模型中，有一个使用惟一句柄标识的 I/O 通道。在 UNIX® 中，这些句柄是文件描述符（这对等同于文件、管道、套接字等等）。在阻塞 I/O 中，我们发起了一次传输操作，当传输操作完成或发生错误时，系统调用就会返回。

在异步非阻塞 I/O 中，我们可以同时发起多个传输操作。这需要每个传输操作都有惟一的上下文，这样我们才能在它们完成时区分到底是哪个传输操作完成了。在 AIO 中，这是一个 aiocb（AIO I/O Control Block）结构。这个结构包含了有关传输的所有信息，包括为数据准备的用户缓冲区。在产生 I/O （称为完成）通知时，aiocb 结构就被用来惟一标识所完成的 I/O 操作。这个 API 的展示显示了如何使用它。

- Linux 上的 AIO

AIO 在 2.5 版本的内核中首次出现，现在已经是 2.6 版本的产品内核的一个标准特性了。


# AIO 代码

NIO 2.0引入了新的异步通道的概念，并提供了异步文件通道和异步套接字通道的实现。

异步的套接字通道时真正的异步非阻塞I/O，对应于UNIX网络编程中的事件驱动I/O（AIO）。

他不需要过多的Selector对注册的通道进行轮询即可实现异步读写，从而简化了NIO的编程模型。

## 服务器

```java
/**
 * AIO服务端
 * @version 1.0
 */
public class Server {
	private static int DEFAULT_PORT = 12345;
	private static AsyncServerHandler serverHandle;
	public volatile static long clientCount = 0;
	public static void start(){
		start(DEFAULT_PORT);
	}
	public static synchronized void start(int port){
		if(serverHandle!=null)
			return;
		serverHandle = new AsyncServerHandler(port);
		new Thread(serverHandle,"Server").start();
	}
	public static void main(String[] args){
		Server.start();
	}
}
```

- AsyncServerHandler

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.util.concurrent.CountDownLatch;

public class AsyncServerHandler implements Runnable {
	public CountDownLatch latch;
	public AsynchronousServerSocketChannel channel;
	public AsyncServerHandler(int port) {
		try {
			//创建服务端通道
			channel = AsynchronousServerSocketChannel.open();
			//绑定端口
			channel.bind(new InetSocketAddress(port));
			System.out.println("服务器已启动，端口号：" + port);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void run() {
		//CountDownLatch初始化
		//它的作用：在完成一组正在执行的操作之前，允许当前的现场一直阻塞
		//此处，让现场在此阻塞，防止服务端执行完成后退出
		//也可以使用while(true)+sleep 
		//生成环境就不需要担心这个问题，以为服务端是不会退出的
		latch = new CountDownLatch(1);
		//用于接收客户端的连接
		channel.accept(this,new AcceptHandler());
		try {
			latch.await();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
}
```

- AcceptHandler

```java
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;

//作为handler接收客户端连接
public class AcceptHandler implements CompletionHandler<AsynchronousSocketChannel, AsyncServerHandler> {
	@Override
	public void completed(AsynchronousSocketChannel channel,AsyncServerHandler serverHandler) {
		//继续接受其他客户端的请求
		Server.clientCount++;
		System.out.println("连接的客户端数：" + Server.clientCount);
		serverHandler.channel.accept(serverHandler, this);
		//创建新的Buffer
		ByteBuffer buffer = ByteBuffer.allocate(1024);
		//异步读  第三个参数为接收消息回调的业务Handler
		channel.read(buffer, buffer, new ReadHandler(channel));
	}
	@Override
	public void failed(Throwable exc, AsyncServerHandler serverHandler) {
		exc.printStackTrace();
		serverHandler.latch.countDown();
	}
}
```

- ReadHandler

```java
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;

public class ReadHandler implements CompletionHandler<Integer, ByteBuffer> {
	//用于读取半包消息和发送应答
	private AsynchronousSocketChannel channel;
	public ReadHandler(AsynchronousSocketChannel channel) {
			this.channel = channel;
	}

	//读取到消息后的处理
	@Override
	public void completed(Integer result, ByteBuffer attachment) {
		//flip操作
		attachment.flip();
		//根据
		byte[] message = new byte[attachment.remaining()];
		attachment.get(message);
		try {
			String expression = new String(message, "UTF-8");
			System.out.println("服务器收到消息: " + expression);
			String calrResult = null;
			try{
				calrResult = "计算结果";
			}catch(Exception e){
				calrResult = "计算错误：" + e.getMessage();
			}
			//向客户端发送消息
			doWrite(calrResult);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
	}

	//发送消息
	private void doWrite(String result) {
		byte[] bytes = result.getBytes();
		ByteBuffer writeBuffer = ByteBuffer.allocate(bytes.length);
		writeBuffer.put(bytes);
		writeBuffer.flip();
		//异步写数据 参数与前面的read一样
		channel.write(writeBuffer, writeBuffer,new CompletionHandler<Integer, ByteBuffer>() {
			@Override
			public void completed(Integer result, ByteBuffer buffer) {
				//如果没有发送完，就继续发送直到完成
				if (buffer.hasRemaining())
					channel.write(buffer, buffer, this);
				else{
					//创建新的Buffer
					ByteBuffer readBuffer = ByteBuffer.allocate(1024);
					//异步读  第三个参数为接收消息回调的业务Handler
					channel.read(readBuffer, readBuffer, new ReadHandler(channel));
				}
			}
			@Override
			public void failed(Throwable exc, ByteBuffer attachment) {
				try {
					channel.close();
				} catch (IOException e) {
				}
			}
		});
	}

	@Override
	public void failed(Throwable exc, ByteBuffer attachment) {
		try {
			this.channel.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
```

OK，这样就已经完成了，其实说起来也简单，虽然代码感觉很多，但是API比NIO的使用起来真的简单多了，主要就是监听、读、写等各种CompletionHandler。
 
此处本应有一个WriteHandler的，确实，我们在ReadHandler中，以一个匿名内部类实现了它。

下面看客户端代码。

## 客户端

```java
import java.util.Scanner;

public class Client {
	private static String DEFAULT_HOST = "127.0.0.1";
	private static int DEFAULT_PORT = 12345;
	private static AsyncClientHandler clientHandle;
	public static void start(){
		start(DEFAULT_HOST,DEFAULT_PORT);
	}
	public static synchronized void start(String ip,int port){
		if(clientHandle!=null)
			return;
		clientHandle = new AsyncClientHandler(ip,port);
		new Thread(clientHandle,"Client").start();
	}
	//向服务器发送消息
	public static boolean sendMsg(String msg) throws Exception{
		if(msg.equals("q")) return false;
		clientHandle.sendMsg(msg);
		return true;
	}
	@SuppressWarnings("resource")
	public static void main(String[] args) throws Exception{
		Client.start();
		System.out.println("请输入请求消息：");
		Scanner scanner = new Scanner(System.in);
		while(Client.sendMsg(scanner.nextLine()));
	}
}
```

- AsyncClientHandler.java

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;
import java.util.concurrent.CountDownLatch;

public class AsyncClientHandler implements CompletionHandler<Void, AsyncClientHandler>, Runnable {
	private AsynchronousSocketChannel clientChannel;
	private String host;
	private int port;
	private CountDownLatch latch;
	public AsyncClientHandler(String host, int port) {
		this.host = host;
		this.port = port;
		try {
			//创建异步的客户端通道
			clientChannel = AsynchronousSocketChannel.open();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	@Override
	public void run() {
		//创建CountDownLatch等待
		latch = new CountDownLatch(1);
		//发起异步连接操作，回调参数就是这个类本身，如果连接成功会回调completed方法
		clientChannel.connect(new InetSocketAddress(host, port), this, this);
		try {
			latch.await();
		} catch (InterruptedException e1) {
			e1.printStackTrace();
		}
		try {
			clientChannel.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	//连接服务器成功
	//意味着TCP三次握手完成
	@Override
	public void completed(Void result, AsyncClientHandler attachment) {
		System.out.println("客户端成功连接到服务器...");
	}
	//连接服务器失败
	@Override
	public void failed(Throwable exc, AsyncClientHandler attachment) {
		System.err.println("连接服务器失败...");
		exc.printStackTrace();
		try {
			clientChannel.close();
			latch.countDown();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	//向服务器发送消息
	public void sendMsg(String msg){
		byte[] req = msg.getBytes();
		ByteBuffer writeBuffer = ByteBuffer.allocate(req.length);
		writeBuffer.put(req);
		writeBuffer.flip();
		//异步写
		clientChannel.write(writeBuffer, writeBuffer,new WriteHandler(clientChannel, latch));
	}
}
```

- WriteHandler

```java
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;
import java.util.concurrent.CountDownLatch;

public class WriteHandler implements CompletionHandler<Integer, ByteBuffer> {
	private AsynchronousSocketChannel clientChannel;
	private CountDownLatch latch;
	public WriteHandler(AsynchronousSocketChannel clientChannel,CountDownLatch latch) {
		this.clientChannel = clientChannel;
		this.latch = latch;
	}
	@Override
	public void completed(Integer result, ByteBuffer buffer) {
		//完成全部数据的写入
		if (buffer.hasRemaining()) {
			clientChannel.write(buffer, buffer, this);
		}
		else {
			//读取数据
			ByteBuffer readBuffer = ByteBuffer.allocate(1024);
			clientChannel.read(readBuffer,readBuffer,new ReadHandler(clientChannel, latch));
		}
	}
	@Override
	public void failed(Throwable exc, ByteBuffer attachment) {
		System.err.println("数据发送失败...");
		try {
			clientChannel.close();
			latch.countDown();
		} catch (IOException e) {
		}
	}
}
```

- ReadHandler

```java
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;
import java.util.concurrent.CountDownLatch;

public class ReadHandler implements CompletionHandler<Integer, ByteBuffer> {
	private AsynchronousSocketChannel clientChannel;
	private CountDownLatch latch;
	public ReadHandler(AsynchronousSocketChannel clientChannel,CountDownLatch latch) {
		this.clientChannel = clientChannel;
		this.latch = latch;
	}
	@Override
	public void completed(Integer result,ByteBuffer buffer) {
		buffer.flip();
		byte[] bytes = new byte[buffer.remaining()];
		buffer.get(bytes);
		String body;
		try {
			body = new String(bytes,"UTF-8");
			System.out.println("客户端收到结果:"+ body);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
	}
	@Override
	public void failed(Throwable exc,ByteBuffer attachment) {
		System.err.println("数据读取失败...");
		try {
			clientChannel.close();
			latch.countDown();
		} catch (IOException e) {
		}
	}
}
```

## 测试

```java
import java.util.Scanner;
import com.anxpp.io.calculator.aio.client.Client;
import com.anxpp.io.calculator.aio.server.Server;

/**
 * 测试方法
 * @version 1.0
 */
public class Test {
	//测试主方法
	@SuppressWarnings("resource")
	public static void main(String[] args) throws Exception{
		//运行服务器
		Server.start();
		//避免客户端先于服务器启动前执行代码
		Thread.sleep(100);
		//运行客户端 
		Client.start();
		System.out.println("请输入请求消息：");
		Scanner scanner = new Scanner(System.in);
		while(Client.sendMsg(scanner.nextLine()));
	}
}
```

# 参考资料

[(001)java中的AIO](https://www.jianshu.com/p/c5e16460047b)

[linux IO模型与AIO](https://blog.csdn.net/secretx/article/details/53668827)

[Linux 网络 I/O 模型简介（图文）](https://blog.csdn.net/anxpp/article/details/51503329)

https://blog.csdn.net/anxpp/article/details/51512200

https://blog.csdn.net/secretx/article/details/53668827

* any list
{:toc}


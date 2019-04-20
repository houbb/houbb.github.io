---
layout: post
title:  Netty-07-通讯模型之 BIO
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: true
---

# 传统的BIO编程

网络编程的基本模型是C/S模型，即两个进程间的通信。

服务端提供IP和监听端口，客户端通过连接操作想服务端监听的地址发起连接请求，通过三次握手连接，如果连接成功建立，双方就可以通过套接字进行通信。

传统的同步阻塞模型开发中，ServerSocket负责绑定IP地址，启动监听端口；Socket负责发起连接操作。连接成功后，双方通过输入和输出流进行同步阻塞式通信。 

简单的描述一下BIO的服务端通信模型：采用BIO通信模型的服务端，通常由一个独立的Acceptor线程负责监听客户端的连接，它接收到客户端连接请求之后为每个客户端创建一个新的线程进行链路处理没处理完成后，通过输出流返回应答给客户端，线程销毁。即典型的一请求一应答通宵模型。

![模型图](http://blog.anxpp.com/usr/uploads/2016/05/549520916.png)

## 缺点

该模型最大的问题就是缺乏弹性伸缩能力，当客户端并发访问量增加后，服务端的线程个数和客户端并发访问数呈1:1的正比关系，

Java中的线程也是比较宝贵的系统资源，线程数量快速膨胀后，系统的性能将急剧下降，随着访问量的继续增大，系统最终就挂了。


# 示例代码

## 服务端

```java
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * BIO服务端源码
 * @version 1.0
 */
public final class ServerNormal {
	//默认的端口号
	private static int DEFAULT_PORT = 12345;
	//单例的ServerSocket
	private static ServerSocket server;
	//根据传入参数设置监听端口，如果没有参数调用以下方法并使用默认值
	public static void start() throws IOException{
		//使用默认值
		start(DEFAULT_PORT);
	}
	//这个方法不会被大量并发访问，不太需要考虑效率，直接进行方法同步就行了
	public synchronized static void start(int port) throws IOException{
		if(server != null) return;
		try{
			//通过构造函数创建ServerSocket
			//如果端口合法且空闲，服务端就监听成功
			server = new ServerSocket(port);
			System.out.println("服务器已启动，端口号：" + port);
			//通过无线循环监听客户端连接
			//如果没有客户端接入，将阻塞在accept操作上。
			while(true){
				Socket socket = server.accept();
				//当有新的客户端接入时，会执行下面的代码
				//然后创建一个新的线程处理这条Socket链路
				new Thread(new ServerHandler(socket)).start();
			}
		}finally{
			//一些必要的清理工作
			if(server != null){
				System.out.println("服务器已关闭。");
				server.close();
				server = null;
			}
		}
	}
}
```

- ServerHandler

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
 
/**
 * 客户端线程
 * @author yangtao__anxpp.com
 * 用于处理一个客户端的Socket链路
 */
public class ServerHandler implements Runnable{
	private Socket socket;
	public ServerHandler(Socket socket) {
		this.socket = socket;
	}
	@Override
	public void run() {
		BufferedReader in = null;
		PrintWriter out = null;
		try{
			in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
			out = new PrintWriter(socket.getOutputStream(),true);
			String expression;
			String result;
			while(true){
				//通过BufferedReader读取一行
				//如果已经读到输入流尾部，返回null,退出循环
				//如果得到非空值，就尝试计算结果并返回
				if((expression = in.readLine())==null) break;
				System.out.println("服务器收到消息：" + expression);
				try{
					result = "计算结果";
				}catch(Exception e){
					result = "计算错误：" + e.getMessage();
				}
				out.println(result);
			}
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			//一些必要的清理工作
			if(in != null){
				try {
					in.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
				in = null;
			}
			if(out != null){
				out.close();
				out = null;
			}
			if(socket != null){
				try {
					socket.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
				socket = null;
			}
		}
	}
}
```

## 客户端

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * 阻塞式I/O创建的客户端
 * @version 1.0
 */
public class Client {
	//默认的端口号
	private static int DEFAULT_SERVER_PORT = 12345;
	private static String DEFAULT_SERVER_IP = "127.0.0.1";
	public static void send(String expression){
		send(DEFAULT_SERVER_PORT,expression);
	}
	public static void send(int port,String expression){
		System.out.println("算术表达式为：" + expression);
		Socket socket = null;
		BufferedReader in = null;
		PrintWriter out = null;
		try{
			socket = new Socket(DEFAULT_SERVER_IP,port);
			in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
			out = new PrintWriter(socket.getOutputStream(),true);
			out.println(expression);
			System.out.println("结果为：" + in.readLine());
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			//一下必要的清理工作
			if(in != null){
				try {
					in.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
				in = null;
			}
			if(out != null){
				out.close();
				out = null;
			}
			if(socket != null){
				try {
					socket.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
				socket = null;
			}
		}
	}
}
```

## 测试代码

```java
import java.io.IOException;
import java.util.Random;

/**
 * 测试方法
 * @version 1.0
 */
public class Test {
	//测试主方法
	public static void main(String[] args) throws InterruptedException {
		//运行服务器
		new Thread(new Runnable() {
			@Override
			public void run() {
				try {
					ServerBetter.start();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}).start();
		//避免客户端先于服务器启动前执行代码
		Thread.sleep(100);
		//运行客户端 
		char operators[] = {'+','-','*','/'};
		Random random = new Random(System.currentTimeMillis());
		new Thread(new Runnable() {
			@SuppressWarnings("static-access")
			@Override
			public void run() {
				while(true){
					//随机产生算术表达式
					String expression = random.nextInt(10)+""+operators[random.nextInt(4)]+(random.nextInt(10)+1);
					Client.send(expression);
					try {
						Thread.currentThread().sleep(random.nextInt(1000));
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
				}
			}
		}).start();
	}
}
```

# 伪异步I/O编程

为了改进这种一连接一线程的模型，我们可以使用线程池来管理这些线程（需要了解更多请参考前面提供的文章），实现1个或多个线程处理N个客户端的模型（但是底层还是使用的同步阻塞I/O），通常被称为“伪异步I/O模型“。

![伪异步I/O编程](http://blog.anxpp.com/usr/uploads/2016/05/614169023.png)

## 代码实现

实现很简单，我们只需要将新建线程的地方，交给线程池管理即可，只需要改动刚刚的Server代码即可：

```java
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
/**
 * BIO服务端源码__伪异步I/O
 * @version 1.0
 */
public final class ServerBetter {
	//默认的端口号
	private static int DEFAULT_PORT = 12345;
	//单例的ServerSocket
	private static ServerSocket server;
	//线程池 懒汉式的单例
	private static ExecutorService executorService = Executors.newFixedThreadPool(60);
	//根据传入参数设置监听端口，如果没有参数调用以下方法并使用默认值
	public static void start() throws IOException{
		//使用默认值
		start(DEFAULT_PORT);
	}
	//这个方法不会被大量并发访问，不太需要考虑效率，直接进行方法同步就行了
	public synchronized static void start(int port) throws IOException{
		if(server != null) return;
		try{
			//通过构造函数创建ServerSocket
			//如果端口合法且空闲，服务端就监听成功
			server = new ServerSocket(port);
			System.out.println("服务器已启动，端口号：" + port);
			//通过无线循环监听客户端连接
			//如果没有客户端接入，将阻塞在accept操作上。
			while(true){
				Socket socket = server.accept();
				//当有新的客户端接入时，会执行下面的代码
				//然后创建一个新的线程处理这条Socket链路
				executorService.execute(new ServerHandler(socket));
			}
		}finally{
			//一些必要的清理工作
			if(server != null){
				System.out.println("服务器已关闭。");
				server.close();
				server = null;
			}
		}
	}
}
```

我们知道，如果使用CachedThreadPool线程池（不限制线程数量，如果不清楚请参考文首提供的文章），其实除了能自动帮我们管理线程（复用），看起来也就像是1:1的客户端：线程数模型，而使用FixedThreadPool我们就有效的控制了线程的最大数量，保证了系统有限的资源的控制，实现了N:M的伪异步I/O模型。

但是，正因为限制了线程数量，如果发生大量并发请求，超过最大数量的线程就只能等待，直到线程池中的有空闲的线程可以被复用。

而对Socket的输入流就行读取时，会一直阻塞，直到发生：

1. 有数据可读

2. 可用数据以及读取完毕

3. 发生空指针或I/O异常

4. 所以在读取数据较慢时（比如数据量大、网络传输慢等），大量并发的情况下，其他接入的消息，只能一直等待，这就是最大的弊端。

而后面即将介绍的NIO，就能解决这个难题。

# 拓展阅读

- nio

[NIO 概览](https://houbb.github.io/2018/09/22/java-nio-01-overview)

aio

epoll

reactor



# 参考资料

[Java 网络IO编程总结（BIO、NIO、AIO均含完整实例代码）](https://blog.csdn.net/anxpp/article/details/51512200)

* any list
{:toc}
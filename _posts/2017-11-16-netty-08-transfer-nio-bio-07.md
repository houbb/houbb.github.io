---
layout: post
title:  Netty-08-数据传输之 BIO NIO 
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: true
---

# 基础知识

 Internet（全球互联网）是无数台机器基于TCP/IP协议族相互通信产生的。TCP/IP协议族分了四层实现，链路层、网络层、传输层、应用层。

与我们应用开发者接触最多的应该是应用层了，例如web应用普遍使用HTTP协议，HTTP协议帮助我们开发者做了非常多的事情，通过HTTP足以完成大部分的通信工作了，但是有时候会有一些特殊的场景出现，使得HTTP协议并不能得心应手的完成工作，这个时候就需要我们寻找其他的应用层协议去适应场景了。

在项目启动初期就要基于业务场景和运行环境选择适当的传输协议，例如常见的发布/订阅场景也就是推送业务可以使用MQTT等协议，文件传输可以用FTP等协议。

不过我们这次要说的不是如何选择通讯协议，而是如何自己实现一套自定的通讯协议。

## 编程

TCP/IP 协议是网络通讯非常重要的理论，后期需要深入学习。

实现自定义的应用层协议，也就是意味着要针对传输层协议进行开发，传输层有TCP、UDP两种协议，两者的区别和适用场景请自行seach，TCP传输具有可靠性，UDP传输不管数据是否送达，一般选择TCP，这篇文章也是讲的TCP方式。

上面说过了TCP/IP是一种协议，也就是一种约定的东西，那怎么针对这个约定编程呢？

其实操作系统已经做了这件事了，并且很有风度的为我们提供了方便的使用方式（Socket API），也就是我们常说的Socket。

用C/C++可以直接调用操作系统的API进行操作，JAVA等需要虚拟机的语言可调用SDK提供的API进行开发。

## 理解

操作系统原理做了很多事情，实际上 netty 的原理是 socket API。

scocket API 还是依赖于操作系统。

操作系统就是硬件+软件+网络通讯协议。

# IO 

在此之前先谈论一下网络io.当一个客户端和服务端之间相互通信,交互我们称之为网络io(网络通讯).网络通讯基本都是通过socket来通讯的。

客户端和服务端这样建立连接:第一步客户端发起建立连接的请求，第二部服务端收到请求建立连接的请求,并同意和该客户端建立连接，并响应给客户端，第三步客户端收到服务端响应的建立连接的消息,并确认和服务端建立连接，通过这样三部客户端和服务端就真正的建立了连接，服务端和客户端就可以开始通讯,交互了.通过这样三次的握手交互服务端和客户端就成功的建立了连接..

![io](https://img-blog.csdn.net/20160915230425675?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)


那么在我们传统的bio里面服务端是怎么处理客户端的请求的呢,首先我们的服务端需要实例化一个socket给我们的该实例socket 绑定ip(本机)和端口，然后进行监听，然后就会一直堵塞等待和客户端stoket建立连接,此时客户端也需要实例化一个socket来和我们服务端建立请求，具体操作和服务端一样，绑定ip和端口(服务端监控的ip和port)，然后通过三次握手确认和服务端建立连接通讯.成功建立连接之后服务端需要新建一个线程去处理该客户端的通讯请求(io操作)，然后主线程会一直堵塞等到下一个客户端socket发起连接请求，在处理下一个，这就是最原始的堵塞式的bio,这种方式的最明显的缺点就是，服务端与每个客户端socket建立连接都需要实时的去创建一个线程去处理该客户端操作，加入同时又1000个客户端socket同时求情建立连接，那我们的服务端就需要同时创建1000个线程去处理,完全没有一点点的缓冲也不能拒绝，显然我们的服务器会吃不消，如果客户端增加socket增加到2000个达到了我们的系统所承受的上线，那我们的服务端就会直接蹦掉.但是jdk1.5以后出现了线程池和队列,能稍稍减轻一点点服务器的负担，把客户端请求直接扔给我们的线程池去处理，再对我们的线程池进行配置最大线程处理数量和队列处理请求排队,等方式去解决服务器的并发过大的情况。

![UDP-服务](https://img-blog.csdn.net/20160915230510016?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)


# BIO

## server

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class ServerHandler implements Runnable{
	private Socket socket ;
	public ServerHandler(Socket socket){
		this.socket = socket;
	}
	@Override
	public void run() {
		BufferedReader in = null;
		PrintWriter out = null;
		try {
			in = new BufferedReader(new InputStreamReader(this.socket.getInputStream()));
			out = new PrintWriter(this.socket.getOutputStream(), true);
			String body = null;
			while(true){
				body = in.readLine();
				if(body == null) break;
				System.out.println("Server :" + body);
				out.println("服务器端回送响的应数据.");
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			//....
		}
	}
}
```

启动服务器

```java
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class Server {
	final static int PROT = 8765;
	public static void main(String[] args) {
		ServerSocket server = null;
		try {
			server = new ServerSocket(PROT);
			System.out.println(" server start .. ");
			//进行阻塞
			Socket socket = server.accept();
			//新建一个线程执行客户端的任务
			new Thread(new ServerHandler(socket)).start();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			//...
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
 
public class Client {
	final static String ADDRESS = "127.0.0.1";
	final static int PORT = 8765;

	public static void main(String[] args) {
		Socket socket = null;
		BufferedReader in = null;
		PrintWriter out = null;
		try {
			socket = new Socket(ADDRESS, PORT);
			in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
			out = new PrintWriter(socket.getOutputStream(), true);
			//向服务器端发送数据
			out.println("接收到客户端的请求数据...");
			String response = in.readLine();
			System.out.println("Client: " + response);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			//...
		}
	}
}
```


# NIO

## BIO 的缺点

上面说了bio是一种堵塞式的同步的网络io，接下来的讲到了的nio是一种非堵塞式的网络io但是最开始的时候也是同步的。

我们前面介绍了bio是客户端和服务端各自创建一个socket实例建立连接相互通信,并且通信是通过单向io客户端发送数据的时候客户端就必须同步去接收收据,同样的服务端向客户端相应数据的时候也必须同保持连接,如果说客户端和服务端的网速非常慢,这样就会导致客户端和服务端的连接长时间不能关闭,从而浪费了很多资源。

## NIO 的实现方式

因为是直连和单向io所以每请次求和响应客户端和服务端都需要创建一个输出流和输入流，收网速的影响流长时间不能关闭那我们nio的改进方式是建立一个缓冲区buffer,这个是nio里面特有的，有了这个缓冲区我们客户端和服务端的输出流和输入流就不用直连了,之前是输出流和输入流都是单向的流(单向io),但是nio里面的buffer可以当做双向流的既可以写数据有可以读数据。

同时nio和引入了管道的概念channel,和选择器也叫多路复用器Selector。

相比传统的bio的建立连接的方式,nio的练级方式是在原有socket的基础上进行了封装和加强,通过管道注册的方式去建立通讯,首先我们的服务端的socketChanenl(我们称之为通讯管道)注册到我们的多路复用器上,然后客户端的通讯管道也注册到我们的多路复用器上,区别是服务端的管道状态是堵塞状态,而客户端的管道是可读状态,在这里补充一下管道的状态有四种,分别是连接状态(Connect),堵塞状态(Accecp),可读状态(Read),可写状态(Write),连接状态就是管道刚刚连接，堵塞就是一直堵塞(多半用于服务端管道),可读状态就是该管道可以读取数据,可写状态是该管道可以写入数据.那刚刚说到服务端管道一直堵塞在这里，然后服务端会起一个线程去轮询注册器也就是多路复用器上已经注册并且处于连接状态的客户端socketChannel,并和他简历管道通讯(注意这里不是socket直连)而是通过管道和缓冲区做通讯交互.在根据通道的状态变化去执行相应的操作,顺带说明一下管道注册其实并不是吧管道本身注册在多路复用器上,而是通过selectedKey去注册的,可以理解为selectedKeys是唯一识别指定管道的标识列,同样Selector咋轮询获取的也不是管道本身，而是获取的一组管道的key,然后建立通讯的时候通过key获取该管道,再在次深挖一下每个socketChinnel底层必然对应一个socket实例，获取该管道本身以后然后就开始根据管道的状态执行对应的操作，这样就达到了通讯。

## NIO 的方式

讲完了nio这里就简单的对应一下之前的bio有哪些优势和好处。

- 可以建立多个客户端

最明显的就是传统的bio, 是一个服务端socket和一个客户端socket建立直连,并且服务端需要为每个客户端新起一个线程去处理客户端的通讯交互,这样必然会无故的开销服务端的很多资源。

而我们的nio只需要一个选择器和一个轮询线程就能接入成千上万甚至更多的客户端连接,这点是nio相比bio最大的进步和改变。

- 减少 TCP 握手的开销

其次就是建立连接的方式，传统的bio是通过客户端服务端三次握手的方式建立tcp连接，而nio是客户端直接把通道注册到服务端的多路复用器上，然后服务端去轮询，这就减少了三次握手请求响应的开销。

- 缓冲区

再次之就是缓冲区代码直连流,传统的bio请求和响应数据读是通过一端创建输出流直接向另一端输出,而另一点穿件输入流写入数据,这样就很依赖网络,如果网络不好就会导致流长时间不能关闭,从而导致资源无故浪费，增加开销。

而nio引入了缓冲区都数据写数据都是直接向缓冲区读写，这样就不依赖网络，一端吧数据写完到缓冲区就可以关闭写入流，这时候只需要通知另一端去读。另一端开启读取流快速的读取缓冲区的数据，然后就可以快速的关闭。如果网络不好情况向就不会开销另一端的资源。

# NIO 代码实现

## server

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
 
public class Server implements Runnable{
	//1 多路复用器（管理所有的通道）
	private Selector seletor;
	//2 建立缓冲区
	private ByteBuffer readBuf = ByteBuffer.allocate(1024);
	//3 
	private ByteBuffer writeBuf = ByteBuffer.allocate(1024);
	public Server(int port){
		try {
			//1 打开路复用器
			this.seletor = Selector.open();
			//2 打开服务器通道
			ServerSocketChannel ssc = ServerSocketChannel.open();
			//3 设置服务器通道为非阻塞模式
			ssc.configureBlocking(false);
			//4 绑定地址
			ssc.bind(new InetSocketAddress(port));
			//5 把服务器通道注册到多路复用器上，并且监听阻塞事件
			ssc.register(this.seletor, SelectionKey.OP_ACCEPT);
			System.out.println("Server start, port :" + port);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	@Override
	public void run() {
		while(true){
			try {
				//1 必须要让多路复用器开始监听
				this.seletor.select();
				//2 返回多路复用器已经选择的结果集
				Iterator<SelectionKey> keys = this.seletor.selectedKeys().iterator();
				//3 进行遍历
				while(keys.hasNext()){
					//4 获取一个选择的元素
					SelectionKey key = keys.next();
					//5 直接从容器中移除就可以了
					keys.remove();
					//6 如果是有效的
					if(key.isValid()){
						//7 如果为阻塞状态
						if(key.isAcceptable()){
							this.accept(key);
						}
						//8 如果为可读状态
						if(key.isReadable()){
							this.read(key);
						}
						//9 写数据
						if(key.isWritable()){
							//this.write(key); //ssc
						}
					}
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	private void write(SelectionKey key){
		//ServerSocketChannel ssc =  (ServerSocketChannel) key.channel();
		//ssc.register(this.seletor, SelectionKey.OP_WRITE);
	}
	private void read(SelectionKey key) {
		try {
			//1 清空缓冲区旧的数据
			this.readBuf.clear();
			//2 获取之前注册的socket通道对象
			SocketChannel sc = (SocketChannel) key.channel();
			//3 读取数据
			int count = sc.read(this.readBuf);
			//4 如果没有数据
			if(count == -1){
				key.channel().close();
				key.cancel();
				return;
			}
			//5 有数据则进行读取 读取之前需要进行复位方法(把position 和limit进行复位)
			this.readBuf.flip();
			//6 根据缓冲区的数据长度创建相应大小的byte数组，接收缓冲区的数据
			byte[] bytes = new byte[this.readBuf.remaining()];
			//7 接收缓冲区数据
			this.readBuf.get(bytes);
			//8 打印结果
			String body = new String(bytes).trim();
			System.out.println("Server : " + body);
			// 9..可以写回给客户端数据 
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
 
	private void accept(SelectionKey key) {
		try {
			//1 获取服务通道
			ServerSocketChannel ssc =  (ServerSocketChannel) key.channel();
			//2 执行阻塞方法
			SocketChannel sc = ssc.accept();
			//3 设置阻塞模式
			sc.configureBlocking(false);
			//4 注册到多路复用器上，并设置读取标识
			sc.register(this.seletor, SelectionKey.OP_READ);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	public static void main(String[] args) {
		new Thread(new Server(8765)).start();;
	}
}
```

## 客户端

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;
 
public class Client {
	//需要一个Selector 
	public static void main(String[] args) {
		//创建连接的地址
		InetSocketAddress address = new InetSocketAddress("127.0.0.1", 8765);
		//声明连接通道
		SocketChannel sc = null;
		//建立缓冲区
		ByteBuffer buf = ByteBuffer.allocate(1024);
		try {
			//打开通道
			sc = SocketChannel.open();
			//进行连接
			sc.connect(address);
			while(true){
				//定义一个字节数组，然后使用系统录入功能：
				byte[] bytes = new byte[1024];
				System.in.read(bytes);
				//把数据放到缓冲区中
				buf.put(bytes);
				//对缓冲区进行复位
				buf.flip();
				//写出数据
				sc.write(buf);
				//清空缓冲区数据
				buf.clear();
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			//...
		}
	}
}
```

# 参考资料

## bio

[纯Socket(BIO)长链接编程的常见的坑和填坑套路](https://www.cnblogs.com/niuxiaozu/p/7942804.html)

[Socket之bio和nio](https://blog.csdn.net/u013239236/article/details/52551322)

* any list
{:toc}


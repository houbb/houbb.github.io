---
layout: post
title:  .Net Socket
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# Socket


A network [socket](https://en.wikipedia.org/wiki/Network_socket) is an internal endpoint for sending or receiving data at a single node in a computer network. 




# TCP


一、 三次握手建立连接

1. 请求端(通常称为客户)发送一个SYN段指明客户打算连接的服务器的端口，以及初始序号(ISN)。

2. 服务器发回包含服务器的初始序号的SYN报文段作为应答。同时，将确认序号设置为客户的ISN加1以对客户的SYN报文段进行确认。一个SYN将占用一个序号。

3. 客户必须将确认序号设置为服务器的ISN加1以对服务器的SYN报文段进行确认。

![connect](https://raw.githubusercontent.com/houbb/resource/master/img/socket/2017-04-19-connect-3.png)


二、四次握手断开连接


1. 现在的网络通信都是基于socket实现的，当客户端将自己的socket进行关闭时，内核协议栈会向服务器自动发送一个FIN置位的包，请求断开连接。我们称首先发起断开请求的一方称为主动断开方。

2. 服务器端收到请客端的FIN断开请求后，内核协议栈会立即发送一个ACK包作为应答，表示已经收到客户端的请求

3. 服务器运行一段时间后，关闭了自己的socket。这个时候内核协议栈会向客户端发送一个FIN置位的包，请求断开连接

4. 客户端收到服务端发来的FIN断开请求后，会发送一个ACK做出应答，表示已经收到服务端的请求


![close](https://raw.githubusercontent.com/houbb/resource/master/img/socket/2017-04-19-close-4.png)


- 参见

[TCP、UDP、IP 协议分析 ](http://blog.chinaunix.net/uid-26833883-id-3627644.html)


# Client & Server

> [.net平台下C#socket通信](http://www.cnblogs.com/ysyn/p/3399351.html)



新建两个**控制台程序**。一个 ServerSocket, 一个 ClientSocket。

- ServerSocket.Main();

```c#
using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace NetSocket
{
	class MainClass
	{
		private static byte[] result = new byte[1024];
		private static int myProt = 18888;   //端口  
		static Socket serverSocket;

		static void Main(string[] args)
		{
			//服务器IP地址  
			IPAddress ip = IPAddress.Parse("127.0.0.1");
			serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
			serverSocket.Bind(new IPEndPoint(ip, myProt));  //绑定IP地址：端口  
			serverSocket.Listen(10);    //设定最多10个排队连接请求  
			Console.WriteLine("启动监听{0}成功", serverSocket.LocalEndPoint.ToString());
			//通过Clientsoket发送数据  
			Thread myThread = new Thread(ListenClientConnect);
			myThread.Start();
			Console.ReadLine();
		}

		/// <summary>  
		/// 监听客户端连接  
		/// </summary>  
		private static void ListenClientConnect()
		{
			while (true)
			{
				Socket clientSocket = serverSocket.Accept();
				clientSocket.Send(Encoding.ASCII.GetBytes("Server Say Hello"));
				Thread receiveThread = new Thread(ReceiveMessage);
				receiveThread.Start(clientSocket);
			}
		}

		/// <summary>  
		/// 接收消息  
		/// </summary>  
		/// <param name="clientSocket"></param>  
		private static void ReceiveMessage(object clientSocket)
		{
			Socket myClientSocket = (Socket)clientSocket;
			while (true)
			{
				try
				{
					//通过clientSocket接收数据  
					int receiveNumber = myClientSocket.Receive(result);
					Console.WriteLine("接收客户端{0}消息{1}", myClientSocket.RemoteEndPoint.ToString(), Encoding.ASCII.GetString(result, 0, receiveNumber));
				}
				catch (Exception ex)
				{
					Console.WriteLine(ex.Message);
					myClientSocket.Shutdown(SocketShutdown.Both);
					myClientSocket.Close();
					break;
				}
			}
		}

	}
}
```


- ClientSocket.Main();

```c#
using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace ClientSocket
{
	class MainClass
	{
		private static byte[] result = new byte[1024];
		static void Main(string[] args)
		{
			//设定服务器IP地址  
			IPAddress ip = IPAddress.Parse("127.0.0.1");
			Socket clientSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
			try
			{
				clientSocket.Connect(new IPEndPoint(ip, 18888)); //配置服务器IP与端口  
				Console.WriteLine("连接服务器成功");
			}
			catch
			{
				Console.WriteLine("连接服务器失败，请按回车键退出！");
				return;
			}
			//通过clientSocket接收数据  
			int receiveLength = clientSocket.Receive(result);
			Console.WriteLine("接收服务器消息：{0}", Encoding.ASCII.GetString(result, 0, receiveLength));
			//通过 clientSocket 发送数据  
			for (int i = 0; i < 10; i++)
			{
				try
				{
					Thread.Sleep(1000);    //等待1秒钟  
					string sendMessage = "Client send Message on " + DateTime.Now;
					clientSocket.Send(Encoding.ASCII.GetBytes(sendMessage));
					Console.WriteLine("向服务器发送消息：{0} ", sendMessage);
				}
				catch
				{
					clientSocket.Shutdown(SocketShutdown.Both);
					clientSocket.Close();
					break;
				}
			}
			Console.WriteLine("发送完毕，按回车键退出");
			Console.ReadLine();
		}
	}
}
```


先运行 server, 再运行 client。如下：


client console

```
连接服务器成功
接收服务器消息：Server Say Hello
向服务器发送消息：Client send Message on 2017/4/19 23:15:24 
向服务器发送消息：Client send Message on 2017/4/19 23:15:25 
向服务器发送消息：Client send Message on 2017/4/19 23:15:26 
向服务器发送消息：Client send Message on 2017/4/19 23:15:27 
向服务器发送消息：Client send Message on 2017/4/19 23:15:28 
向服务器发送消息：Client send Message on 2017/4/19 23:15:29 
向服务器发送消息：Client send Message on 2017/4/19 23:15:30 
向服务器发送消息：Client send Message on 2017/4/19 23:15:31 
向服务器发送消息：Client send Message on 2017/4/19 23:15:32 
向服务器发送消息：Client send Message on 2017/4/19 23:15:33 
发送完毕，按回车键退出
```


server console

```
启动监听127.0.0.1:18888成功
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:24
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:25
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:26
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:27
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:28
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:29
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:30
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:31
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:32
接收客户端127.0.0.1:63939消息Client send Message on 2017/4/19 23:15:33
```




* any list
{:toc}



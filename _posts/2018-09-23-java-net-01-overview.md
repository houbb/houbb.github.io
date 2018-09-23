---
layout: post
title:  Java Net-01-Overview
date:  2018-09-23 07:38:14 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
excerpt: Java 网络编程概览
---

# 网络编程

## 计算机网络 

是指将地理位置不同的具有独立功能的多台计算机及其外部设备，通过通信线路连接起来，在网络操作系统，网络管理软件及网络通信协议的管理和协调下，实现资源共享和信息传递的计算机系统。

## 网络编程 

就是用来实现网络互连的不同计算机上运行的程序间可以进行数据交换。

## 网络编程模型

目前较为流行的网络编程模型是客户机/服务器（C/S）结构。即通信双方一方作为服务器等待客户提出请求并予以响应。

客户则在需要服务时向服务器提出申请。服务器一般作为守护进程始终运行，监听网络端口，一旦有客户请求，就会启动一个服务进程来响应该客户，同时自己继续监听服务端口，使后来的客户也能及时得到服务。

# 网络编程三要素

## IP 地址

每个设备在网络中的唯一标识每台网络终端在网络中都有一个独立的地址，我们在网络中传输数据就是使用这个地址。

- ipconfig：查看本机IP192.168.12.42

- ping：测试连接192.168.40.62

- 本地回路地址：127.0.0.1 255.255.255.255是广播地址

- IPv4：4个字节组成，4个0-255。大概42亿，30亿都在北美，亚洲4亿。2011年初已经用尽。

- IPv6：8组，每组4个16进制数。

## 端口号

每个程序在设备上的唯一标识

每个网络程序都需要绑定一个端口号，传输数据的时候除了确定发到哪台机器上，还要明确发到哪个程序。

端口号范围从 `0-65535`

编写网络应用就需要绑定一个端口号，尽量使用1024以上的，1024以下的基本上都被系统程序占用了。

## 协议

为计算机网络中进行数据交换而建立的规则、标准或约定的集合。

- UDP 

面向无连接，数据不安全，速度快。不区分客户端与服务端。

- TCP 

面向连接（三次握手），数据安全，速度略低。分为客户端和服务端。 

三次握手: 客户端先向服务端发起请求, 服务端响应请求, 传输数据

# URL

## 概念

URL(Uniform Resource Locator)是一致资源定位器的简称，它表示Internet上某一资源的地址。

通过URL我们可以访问Internet上的各种网络资源，比如最常见的WWW，FTP站点。浏览器通过解析给定的URL可以在网络上查找相应的文件或其他资源。

## URL的组成

`protocol://resourceName`

协议名（protocol）指明获取资源所使用的传输协议，如http、ftp、gopher、file等，资源名（resourceName）则应该是资源的完整地址，包括主机名、端口号、文件名或文件内部的一个引用。

例如：

```
http://www.sun.com/ 协议名://主机名
http://home.netscape.com/home/welcome.html 协议名://机器名＋文件名
http://www.gamelan.com:80/Gamelan/network.html#BOTTOM 协议名://机器名＋端口号＋文件名＋内部引用
```

# Socket

## 概念

Socket通常也称作"套接字"，用于描述IP地址和端口，是一个通信链的句柄。

网络上的两个程序通过一个双向的通讯连接实现数据的交换，这个双向链路的一端称为一个Socket，一个Socket由一个IP地址和一个端口号唯一确定。

应用程序通常通过"套接字"向网络发出请求或者应答网络请求。 

Socket是TCP/IP协议的一个十分流行的编程界面，但是，Socket所支持的协议种类也不光TCP/IP一种，因此两者之间是没有必然联系的。

在Java环境下，Socket编程主要是指基于TCP/IP协议的网络编程。

## 通信过程

服务端监听某个端口是否有连接请求，客户端向服务端发送连接请求，服务端收到连接请求向客户端发出接收消息，这样一个连接就建立起来了。客户端和服务端都可以相互发送消息与对方进行通讯。

Socket的基本工作过程包含以下四个步骤：

1. 创建Socket；

2. 打开连接到Socket的输入输出流；

3. 按照一定的协议对Socket进行读写操作；

4. 关闭Socket。

# 拓展阅读

[java io 教程](https://houbb.github.io/2018/09/21/java-io-00-overview)

[java nio 教程](https://houbb.github.io/2018/09/22/java-nio-01-overview) 

# 参考资料

- 系列教程

http://wiki.jikexueyuan.com/project/java-socket/overwise.html

http://ifeve.com/java-network/

- 网络编程

https://blog.csdn.net/shuaicihai/article/details/72809883

https://www.cnblogs.com/linjiqin/archive/2011/06/10/2077237.html

https://www.kancloud.cn/digest/switch-java/120821

https://www.jianshu.com/p/ae5e1cee5b04

* any list
{:toc}
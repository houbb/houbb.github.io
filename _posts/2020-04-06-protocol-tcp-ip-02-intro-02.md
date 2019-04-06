---
layout: post
title: TCP/IP 协议-02-协议简介及其他常见协议
date:  2019-4-5 11:56:39 +0800
categories: [Protocol]
tags: [protocol, tcp/ip, system, sh]
published: true
---

# TCP/IP

[TCP/IP](http://www.runoob.com/tcpip/tcpip-intro.html) 指传输控制协议/网际协议（Transmission Control Protocol / Internet Protocol）。
 
一、TCP 使用固定的连接
 
TCP 用于应用程序之间的通信。

当应用程序希望通过 TCP 与另一个应用程序通信时，它会发送一个通信请求。这个请求必须被送到一个确切的地址。在双方[握手](http://blog.chinaunix.net/uid-26833883-id-3627644.html)之后，
TCP 将在两个应用程序之间建立一个[全双工](http://blog.csdn.net/baixue6269/article/details/7026892)的通信。

这个全双工的通信将占用两个计算机之间的通信线路，直到它被一方或双方关闭为止。

UDP 和 TCP 很相似，但是更简单，同时可靠性低于 TCP。
 
二、IP 是无连接的

IP 用于计算机之间的通信。

IP 是无连接的通信协议。它**不会占用**两个正在通信的计算机之间的通信线路。这样，IP 就降低了对网络线路的需求。每条线可以同时满足许多不同的计算机之间的通信需要。

通过 IP，消息（或者其他数据）被分割为小的独立的包，并通过因特网在计算机之间传送。

IP 负责将每个包路由至它的目的地。


三、IP 路由器

当一个 IP 包从一台计算机被发送，它会到达一个 IP 路由器。

IP 路由器负责将这个包路由至它的目的地，直接地或者通过其他的路由器。

在一个相同的通信中，一个包所经由的路径可能会和其他的包不同。而路由器负责根据通信量、网络中的错误或者其他参数来进行正确地寻址。

# 寻址

一、IP地址

每个计算机必须有一个 IP 地址才能够连入因特网。

每个 IP 包必须有一个地址才能够发送到另一台计算机。

TCP/IP 使用 32 个比特来编址。一个计算机字节是 8 比特。所以 TCP/IP 使用了 4 个字节。介于[00000000, 11111111]之间。(0~255)

二、IPv6

[IPv6](https://en.wikipedia.org/wiki/IPv6) 是 "Internet Protocol Version 6" 的缩写。

在 RFC1884 中（RFC 是 Request for Comments document 的缩写。RFC 实际上就是 Internet 有关服务的一些标准），
规定的标准语法建议把 IPv6 地址的 128 位（16 个字节）写成 8 个 16 位的无符号整数，每个整数用 4 个十六进制位表示，这些数之间用冒号`:`分开，例如：

```
686E：8C64：FFFF：FFFF：0：1180：96A：FFFF
```

冒号十六进制记法允许零压缩，即一串连续的0可以用一对冒号取代，例如：

```
FF05：0：0：0：0：0：0：B3可以定成：FF05：：B3
```

为了保证零压缩有一个清晰的解释，建议中规定，在任一地址中，只能使用一次零压缩。该技术对已建议的分配策略特别有用，因为会有许多地址包含连续的零串。


三、域名

用于 TCP/IP 地址的名字被称为域名。`houbb.github.io` 就是一个域名。

当你键入一个像 http://www.runoob.com 这样的域名，域名会被一种 DNS 程序翻译为数字。

当一个新的域名连同其 TCP/IP 地址一起注册后，全世界的 DNS 服务器都会对此信息进行更新。

(域名申请需要备案)


# 协议

以下仅仅简单列举常见协议

- [TCP](https://en.wiktionary.org/wiki/Transmission_Control_Protocol) - 传输控制协议

TCP 用于从应用程序到网络的数据传输控制。

TCP 负责在数据传送之前将它们分割为 IP 包，然后在它们到达的时候将它们重组。

- [IP](https://en.wiktionary.org/wiki/Internet_Protocol) - 网际协议

IP 负责计算机之间的通信。

IP 负责在因特网上发送和接收数据包。


- [HTTP](https://en.wiktionary.org/wiki/HTTP) - 超文本传输协议

HTTP 负责 web 服务器与 web 浏览器之间的通信。

HTTP 用于从 web 客户端（浏览器）向 web 服务器发送请求，并从 web 服务器向 web 客户端返回内容（网页）。

- [HTTPS](https://en.wiktionary.org/wiki/HTTPS) - 安全的 HTTP

HTTPS 负责在 web 服务器和 web 浏览器之间的安全通信。

- [SLL](https://en.wiktionary.org/wiki/SSL) - 套接字

SSL 协议用于为安全数据传输加密数据。

- [SMTP](https://en.wiktionary.org/wiki/SMTP) - 邮件传输协议

SMTP 用于电子邮件的传输。
 
- [FTP](https://en.wiktionary.org/wiki/File_Transfer_Protocol) - 文件传输协议

FTP 负责计算机之间的文件传输。

- [NTP](https://en.wikipedia.org/wiki/Network_Time_Protocol) - 网络时间协议

NTP 用于在计算机之间同步时间（钟）

这个挺有趣。因为分布式系统经常会有时间不一致的问题。以后可以[研究](http://blog.csdn.net/iloli/article/details/6431757)。


# 邮件

邮件程序会用到

1. 使用 SMTP 来发送邮件

2. 使用 POP 从邮件服务器下载邮件

3. 使用 IMAP 连接到邮件服务器

(这一点现在市场做的很成熟，暂时不是很有兴趣。)

# 拓展阅读

[TCP/IP 协议简介](https://houbb.github.io/2018/09/25/protocol-tcp-ip)

[TCP 协议详解](https://houbb.github.io/2018/09/25/protocol-tcp)

[IP 协议详解](https://houbb.github.io/2018/09/25/protocol-ip)

[OSI 协议和 TCP/IP 协议](https://houbb.github.io/2018/09/25/protocol-osi-tcp-ip)

* any list
{:toc}












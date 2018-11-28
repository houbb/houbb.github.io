---
layout: post
title:  SOAP
date:  2018-11-26 21:17:01 +0800
categories: [Protocol]
tags: [mq, protocol, sh]
published: false
excerpt: SOAP 协议介绍
---

# SOAP

SOAP（原为Simple Object Access Protocol的首字母缩写，即简单对象访问协议）是交换数据的一种协议规范，使用在计算机网络Web服务（web service）中，交换带结构信息。

SOAP为了简化网页服务器（Web Server）从XML数据库中提取数据时，节省去格式化页面时间，以及不同应用程序之间按照HTTP通信协议，遵从XML格式执行资料互换，使其抽象于语言实现、平台和硬件。

此标准由IBM、Microsoft、UserLand和DevelopMentor在1998年共同提出，并得到IBM，莲花（Lotus），康柏（Compaq）等公司的支持，于2000年提交给万维网联盟（World Wide Web Consortium；W3C），目前SOAP 1.1版是业界共同的标准，属于第二代的XML协定（第一代具主要代表性的技术为XML-RPC以及WDDX）。

用一个简单的例子来说明SOAP使用过程，一个SOAP消息可以发送到一个具有Web Service功能的Web站点，例如，一个含有房价信息的数据库，消息的参数中标明这是一个查询消息，此站点将返回一个XML格式的信息，其中包含了查询结果（价格，位置，特点，或者其他信息）。

由于数据是用一种标准化的可分析的结构来传递的，所以可以直接被第三方站点所利用。

## 为什么需要 SOAP

对于应用程序开发来说，使程序之间进行因特网通信是很重要的。

目前的应用程序通过使用远程过程调用（RPC）在诸如 DCOM 与 CORBA 等对象之间进行通信，但是 HTTP 不是为此设计的。RPC 会产生兼容性以及安全问题；防火墙和代理服务器通常会阻止此类流量。

通过 HTTP 在应用程序间通信是更好的方法，因为 HTTP 得到了所有的因特网浏览器及服务器的支持。SOAP 就是被创造出来完成这个任务的。

SOAP 提供了一种标准的方法，使得运行在不同的操作系统并使用不同的技术和编程语言的应用程序可以互相进行通信。

# SOAP 语法

## 元素

一条 SOAP 消息就是一个普通的 XML 文档，包含下列元素：

- 必需的 Envelope 元素，可把此 XML 文档标识为一条 SOAP 消息

- 可选的 Header 元素，包含头部信息

- 必需的 Body 元素，包含所有的调用和响应信息

- 可选的 Fault 元素，提供有关在处理此消息所发生错误的信息


## 语法规则

这里是一些重要的语法规则：

- SOAP 消息必须用 XML 来编码

- SOAP 消息必须使用 SOAP Envelope 命名空间

- SOAP 消息必须使用 SOAP Encoding 命名空间

- SOAP 消息不能包含 DTD 引用

- SOAP 消息不能包含 XML 处理指令

## SOAP 消息的基本结构

```xml
<?xml version="1.0"?>
<soap:Envelope
xmlns:soap="http://www.w3.org/2001/12/soap-envelope"
soap:encodingStyle="http://www.w3.org/2001/12/soap-encoding">

<soap:Header>
</soap:Header>

<soap:Body>
  <soap:Fault>
  </soap:Fault>
</soap:Body>

</soap:Envelope>
```

# 参考资料

[简单对象访问协议](https://zh.wikipedia.org/zh-hans/%E7%AE%80%E5%8D%95%E5%AF%B9%E8%B1%A1%E8%AE%BF%E9%97%AE%E5%8D%8F%E8%AE%AE)

http://www.w3school.com.cn/soap/soap_intro.asp

* any list
{:toc}
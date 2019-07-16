---
layout: post
title: TCP/IP 协议-04-loopback interface 环回接口
date:  2019-4-5 11:56:39 +0800
categories: [Protocol]
tags: [protocol, tcp/ip, system, sh]
published: true
---

# Loopback Interface

Loopback Interface 是回环接口，可允许运行在同一台主机上的程序和服务器程序通过TCP/IP进行通讯。

# 简介

loopback 口是给路由器赋予一个具有IP地址的逻辑接口，这个接口的特点是总是up，不会随着物理接口的状态而变化。

# 例子

一个路由器有两个Token ring口，路由器启动了DLSw与远方路由器通信。

DLSw需要穿过WAN建立一条隧道传输用户数据，在路由器上要定义这条隧道的local ip address和remote ip address。

在定义local ip地址时，选用任何token ring接口地址都不是太好，因为物理接口可能由于各种原因down，这就影响了另外的token ring口通过DLSw的通信。所以，在这种情况下，用loopback口的IP地址作为local ip是很好的。

另外，某些路由协议中，如OSPF，需要有一个IP地址作为路由器的标识。

在默认状态下会选择路由器上IP地址值最大的。同样，这个选择也会受限于物理接口的状态。

因此，选定更稳定的loopback接口作为路由器标识可以使OSPF协议避免许多问题。

当然，使用loopback接口也会有缺点：会牺牲IP地址资源，尤其是在使用RIP，IGRP等不支持子网掩码的路由协议中这个缺陷尤其明显！

Loopback Interface: 回环接口，可允许运行在同一台主机上的程序和服务器程序通过TCP/IP进行通讯。

# 参考资料

[百度百科](https://baike.baidu.com/item/Loopback%20Interface)

* any list
{:toc}












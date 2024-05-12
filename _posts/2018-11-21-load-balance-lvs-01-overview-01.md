---
layout: post
title:  LVS-01-Overview
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [web-server, overview, load-balance, network, sh]
published: true
---


# What is virtual server?

虚拟服务器是一个高度可扩展且高度可用的服务器，构建在真实服务器集群上。 

服务器群集的体系结构对最终用户完全透明，用户与群集系统进行交互，就好像它只是一个高性能的虚拟服务器一样。 

请考虑下图。

![VirtualServer](http://www.linuxvirtualserver.org/VirtualServer.png)

真实服务器和负载平衡器可以通过高速LAN或地理上分散的WAN互连。 

负载均衡器可以将请求分派给不同的服务器，并使群集的并行服务在单个IP地址上显示为虚拟服务，请求分派可以使用IP负载均衡技术或应用级负载均衡技术。 

通过透明地添加或删除集群中的节点来实现系统的可伸缩性。 

通过检测节点或守护程序故障并适当地重新配置系统来提供高可用性。

## 目标

Linux Virtual Server Project的基本目标是：

```
使用集群技术为Linux构建高性能，高可用性的服务器，提供良好的可扩展性，可靠性和可维护性。
```

LVS集群系统也称为负载均衡服务器集群。

# LVS

## 什么是 LVS？

Linux虚拟服务器(Linux Virtual Server) 是一个高度可扩展且高度可用的服务器，构建在真实服务器集群上，负载均衡器在Linux操作系统上运行。 

服务器群集的体系结构对最终用户完全透明，并且用户就像是单个高性能虚拟服务器一样进行交互。 

欲了解更多信息，请点击此处。

## Linux虚拟服务器的应用程序

Linux Virtual Server作为高级负载平衡解决方案可用于构建高度可扩展且高度可用的网络服务，例如可扩展的Web，缓存，邮件，ftp，媒体和VoIP服务。

# 个人收获

负载均衡，原理就是 4 层，或者 7 层的网络+负载均衡算法。

作为开发人员，暂时忽略硬件相关的负载均衡支持。

搞懂最基础的原理即可。

# 拓展阅读

[LVS 之旅-en](http://www.ultramonkey.org/papers/lvs_tutorial/html/)

# 参考资料

- key word

Linux Virtual Server

- 官方

[Linux Virtual Server-wiki](https://en.wikipedia.org/wiki/Linux_Virtual_Server)

http://www.linuxvirtualserver.org/

- 其他

[Chapter 1. Linux Virtual Server Overview](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/4/html/Virtual_Server_Administration/ch-lvs-overview-VSA.html)

[How to Set Up a Linux Server on VirtualBox](https://blog.teamtreehouse.com/set-up-a-linux-server-on-virtualbox)

* any list
{:toc}
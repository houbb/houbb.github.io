---
layout: post
title:  ACP 学习-12-使用负载均衡实现https与http的混合访问
date:  2020-7-19 16:40:20 +0800
categories: [Cloud]
tags: [cloud, sf]
published: false
---

# 实验概述

互联网巨头雅虎官方对外发布消息，承认在2014年的一次黑客袭击中，至少5亿用户的数据信息遭窃。此次事件让我们再次意识到网站安全的重要性，网站加密防护的必要性。我们可以使用HTTPS协议对网站进行全站加密，但是，大部分用户已经习惯直接输入域名（即使用 HTTP 协议）访问网站。

因此，企业需要将用户的 HTTP 请求转化为 HTTPS 请求进行访问。

这个问题在传统的 IT 架构中已经得到解决，但是在云上如何解决 HTTP 与 HTTPS 的混合访问？   

实验使用负载均衡配置监听，利用Nginx实现HTTP请求向HTTPS请求的转化，从而完成HTTP和HTTPS的混合访问。

## HTTP请求转化为HTTPS请求架构图

![输入图片说明](https://images.gitee.com/uploads/images/2020/0910/141817_dec21ed3_508704.png)

## 实验目标

完成此实验后，可以掌握的能力有：

1）使用负载均衡配置HTTP和HTTPS监听，支持HTTP请求和HTTPS请求的混合访问；

2）使用Nginx将HTTP请求转化为HTTPS请求；

# 背景知识

## HTTPS 协议

HTTPS 能够加密信息，以免敏感信息被第三方获取。所以很多银行网站或电子邮箱等等安全级别较高的服务都会采用 HTTPS 协议。

## 基本概念

HTTPS 是更安全的 HTTP 协议，它在 TCP（负责网络数据传输）和 HTTP层 之间，增加了一个 SSL 层。

这一层通过数字证书和加密算法对 HTTP 请求进行加密。已经采用 HTTP 协议的网站要过渡到 HTTPS，将在技术改造、服务器资源、流量资源上付出更多成本。

## 工作流程

HTTPS 其实是有两部分组成：HTTP + SSL / TLS，也就是在 HTTP 上又加了一层处理加密信息的模块。

服务端和客户端的信息传输都会通过 TLS 进行加密，所以传输的数据都是加密后的数据。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0910/142527_0796a169_508704.png)

## 负载均衡监听

负载均衡提供四层（TCP/UDP协议）和七层（HTTP/HTTPS协议）监听，您可根据应用场景选择监听协议：

负载均衡四层监听将请求直接转发到后端ECS实例，而且不修改标头。

负载均衡七层监听原理上是反向代理的一种实现，客户端HTTP请求到达负载均衡监听后，负载均衡服务器会通过与后端ECS建立TCP连接，即再次通过新TCP连接HTTP协议访问后端，而不是直接转发报文到后端ECS。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0910/142615_f9a42885_508704.png)




# 参考资料

[DDos 防護](https://help.aliyun.com/product/28396.html?spm=a2c4g.750001.list.196.74f67b13eaOf4q)

* any list
{:toc}
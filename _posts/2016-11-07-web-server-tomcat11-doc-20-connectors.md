---
layout: post
title: web server apache tomcat11-20-connectors 连接器
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

...




# 介绍

在选择要与 Tomcat 一起使用的连接器时可能会很困难。本页将列出此 Tomcat 发行版支持的连接器，并希望能够根据您的需求帮助您做出正确的选择。

## HTTP

HTTP 连接器默认与 Tomcat 配置好，并且可立即使用。此连接器具有最低的延迟和最佳的整体性能。

对于集群，必须安装支持 Web 会话粘性的 HTTP 负载均衡器来将流量定向到 Tomcat 服务器。Tomcat 支持 mod_proxy（在 Apache HTTP Server 2.x 上，并在 Apache HTTP Server 2.2 中默认包含）作为负载均衡器。值得注意的是，HTTP 代理的性能通常低于 AJP 的性能，因此通常更喜欢使用 AJP 集群。

## AJP

当使用单个服务器时，即使大部分 Web 应用程序由静态文件组成，使用位于 Tomcat 实例前面的本地 Web 服务器时性能大多数情况下明显比默认的 HTTP 连接器的独立 Tomcat 差。如果出于任何原因需要与本地 Web 服务器集成，那么 AJP 连接器将比代理的 HTTP 提供更快的性能。从 Tomcat 视角来看，AJP 集群是最有效的。否则，在功能上等同于 HTTP 集群。

此 Tomcat 发行版支持的本地连接器包括：

- 使用任何支持的服务器的 JK 1.2.x
- Apache HTTP Server 2.x 上的 mod_proxy（默认包含在 Apache HTTP Server 2.2 中），启用 AJP
- 其他支持 AJP 的本地连接器可能可以工作，但不再受支持。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/connectors.html

* any list
{:toc}
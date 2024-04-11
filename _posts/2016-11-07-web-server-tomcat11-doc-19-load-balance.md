---
layout: post
title: web server apache tomcat11-19-load balance 负载均衡
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# # 负载均衡器使用指南

## 使用 JK 1.2.x 原生连接器

请参考 JK 1.2.x 文档。

## 使用带有 mod_proxy 的 Apache HTTP Server 2.x

请参考 Apache HTTP Server 2.2 的 mod_proxy 文档。该模块支持 HTTP 或 AJP 负载均衡。新版本的 mod_proxy 也可以与 Apache HTTP Server 2.0 一起使用，但是 mod_proxy 必须使用来自 Apache HTTP Server 2.2 的代码单独编译。


# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/cluster-howto.html

* any list
{:toc}
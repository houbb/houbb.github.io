---
layout: post
title:  Nginx R31 doc-15-Live Activity Monitoring 实时活动监控
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

## 手写 nginx 系列

如果你对 nginx 原理感兴趣，可以读一下

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[从零手写实现 nginx-06-文件夹自动索引](https://houbb.github.io/2018/11/22/nginx-write-06-dir-list)

[从零手写实现 nginx-07-大文件下载](https://houbb.github.io/2018/11/22/nginx-write-07-big-file)

[从零手写实现 nginx-08-范围查询](https://houbb.github.io/2018/11/22/nginx-write-08-range)

[从零手写实现 nginx-09-文件压缩](https://houbb.github.io/2018/11/22/nginx-write-09-comparess)

[从零手写实现 nginx-10-sendfile 零拷贝](https://houbb.github.io/2018/11/22/nginx-write-10-sendfile)


# 实时活动监控

跟踪 NGINX Plus 和您的应用程序在内置的实时活动监控仪表板上的性能，或通过将 JSON 提供给其他工具。

本文介绍如何配置和使用 NGINX Plus 中的运行时监控服务：交互式仪表板和 NGINX Plus REST API。

## 关于实时活动监控

NGINX Plus 提供了各种监控工具，用于您的服务器基础设施：

- 自 NGINX Plus Release 9 起提供的交互式仪表板页面 - 实时活动监控界面，显示服务器基础设施的关键负载和性能指标。

- 自 NGINX Plus Release 14 起提供的 NGINX REST API - 一个接口，可以获取扩展状态信息、重置统计信息、动态管理上游服务器以及管理键值存储。通过该 API，您可以将 NGINX Plus 状态信息连接到支持 JSON 接口的第三方工具，例如 NewRelic 或您自己的仪表板。

注意：在 NGINX Plus R14 之前，仪表板中收集统计信息和管理上游服务器是使用 status 和 upstream_conf 模块执行的。现在，扩展状态和 upstream_conf 模块已被 api 模块取代。从 R16 开始，status 和 upstream_conf 模块将被移除，并完全被 api 模块取代。

![关于实时活动监控](https://www.nginx.com/wp-content/uploads/2023/08/nginx-plus-dashboard_R30-overview-2.png)


# 参考资料

https://docs.nginx.com/nginx/admin-guide/monitoring/live-activity-monitoring/

* any list
{:toc}
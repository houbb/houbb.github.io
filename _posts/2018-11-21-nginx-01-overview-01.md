---
layout: post
title: Nginx-01-Nginx 是什么? 能做什么？
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [web-server, nginx, overview, sh]
published: true
---

# nginx 系列

[Nginx-01-聊一聊 nginx](https://houbb.github.io/2018/11/22/nginx-00-chat)

[Nginx-01-Nginx 是什么](https://houbb.github.io/2018/11/22/nginx-01-overview-01)

[Nginx-02-为什么使用 Nginx](https://houbb.github.io/2018/11/22/nginx-01-why-02)

[Nginx-02-Nginx Ubuntu 安装 + windows10 + WSL ubuntu 安装 nginx 实战笔记](https://houbb.github.io/2018/11/22/nginx-02-install-ubuntu-02)

[Nginx-02-基本使用](https://houbb.github.io/2018/11/22/nginx-02-usage-02)

[Nginx-03-Nginx 项目架构](https://houbb.github.io/2018/11/22/nginx-03-struct-03)

[Nginx-04-Docker Nginx](https://houbb.github.io/2018/11/22/nginx-04-docker-04)

[Nginx-05-nginx 反向代理是什么？windows 下如何配置使用 nginx](https://houbb.github.io/2018/11/22/nginx-05-reverse-proxy)

[Nginx-06-nginx 汇总入门介绍](https://houbb.github.io/2018/11/22/nginx-06-all-in-one)

[Nginx R31 doc 官方文档-01-nginx 如何安装](https://houbb.github.io/2018/11/22/nginx-doc-01-overview)

[Nginx R31 doc-02-nginx 基本功能](https://houbb.github.io/2018/11/22/nginx-doc-02-basic-functionality-basic-func)

[Nginx R31 doc-03-HTTP Load Balancing HTTP 负载均衡](https://houbb.github.io/2018/11/22/nginx-doc-03-basic-functionality-load-balance-http)

[Nginx R31 doc-04-HTTP Health Checks](https://houbb.github.io/2018/11/22/nginx-doc-04-basic-functionality-http-health-checks)

[Nginx R31 doc-05-Dynamic Configuration of Upstreams with the NGINX Plus API 使用 NGINX Plus API 动态配置上游服务器](https://houbb.github.io/2018/11/22/nginx-doc-05-basic-functionality-dynamic-config)

[Nginx R31 doc-06-Accepting the PROXY Protocol](https://houbb.github.io/2018/11/22/nginx-doc-06-basic-functionality-accept-proxy-protocol)

[Nginx R31 doc-07-内容缓存](https://houbb.github.io/2018/11/22/nginx-doc-07-content-cache)

[Nginx R31 doc-08-Configuring NGINX and NGINX Plus as a Web Server 配置 NGINX 和 NGINX Plus 作为 Web 服务器](https://houbb.github.io/2018/11/22/nginx-doc-08-web-server-web-server)

[Nginx R31 doc-09-Serving Static Content 静态内容](https://houbb.github.io/2018/11/22/nginx-doc-09-web-server-web-server-static-content)

[Nginx R31 doc-10-NGINX Reverse Proxy 反向代理](https://houbb.github.io/2018/11/22/nginx-doc-10-web-server-nginx-reverse-proxy)

[Nginx R31 doc-11-Compression and Decompression 压缩与解压缩](https://houbb.github.io/2018/11/22/nginx-doc-11-compress-and-decompress)

[Nginx R31 doc-12-NGINX SSL Termination 安全加密](https://houbb.github.io/2018/11/22/nginx-doc-12-security-controls-ssl)

[Nginx R31 doc-13-Limiting Access to Proxied HTTP Resources 访问限流](https://houbb.github.io/2018/11/22/nginx-doc-13-security-controls-ratelimit)

[Nginx R31 doc-14-Dynamic Denylisting of IP Addresses 动态拒绝IP地址](https://houbb.github.io/2018/11/22/nginx-doc-14-security-controls-dynamic-denylist)

[Nginx R31 doc-15-Live Activity Monitoring 实时活动监控](https://houbb.github.io/2018/11/22/nginx-doc-15-monitor-live-activity-monitor)

[Nginx R31 doc-16-logging 配置日志](https://houbb.github.io/2018/11/22/nginx-doc-16-monitor-logging)

[Nginx R31 doc-17-debugging 调试](https://houbb.github.io/2018/11/22/nginx-doc-17-monitor-debugging)

[Nginx R31 doc-18-High Availability Support for NGINX Plus in On-Premises Deployments](https://houbb.github.io/2018/11/22/nginx-doc-18-ha-ha-keepalived)

[Nginx 实战-01-nginx ubuntu 安装笔记](https://houbb.github.io/2018/11/22/nginx-inaction-01-ubuntu-install)

[Nginx 实战-01-nginx windows 安装笔记](https://houbb.github.io/2018/11/22/nginx-inaction-01-windows-install)

[Nginx 实战-02-nginx proxy_pass 服务代理访问 使用笔记 ubuntu nodejs](https://houbb.github.io/2018/11/22/nginx-inaction-02-usage-proxy-pass)

[Nginx 实战-03-nginx 负载均衡](https://houbb.github.io/2018/11/22/nginx-inaction-03-usage-load-balance)

[Nginx 实战-04-nginx 不同的地址访问不同的服务](https://houbb.github.io/2018/11/22/nginx-inaction-04-useage-different-proxy-pass)

[Nginx 实战-05-nginx 反向代理实现域名到指定的 ip](https://houbb.github.io/2018/11/22/nginx-inaction-05-reverse-proxy)

# Nginx

[nginx [engine x]](https://nginx.org/en/) is an HTTP and reverse proxy server, 

a mail proxy server, and a generic TCP/UDP proxy server, originally written by Igor Sysoev.

## 背景故事

Igor Sysoev最初写了NGINX来解决C10K问题，这是1999年创造的一个术语，用来描述现有Web服务器在处理大量（10K）并发连接（C）时遇到的困难。

凭借其事件驱动的异步架构，NGINX彻底改变了服务器在高性能环境中的运行方式，并成为最快的Web服务器。

在2004年开始采购该项目并观察其使用呈指数增长后，Scysoev共同创立了NGINX，Inc。

以支持NGINX的持续开发，并将NGINX Plus作为商业产品推向市场，并为企业客户提供额外功能。

如今，NGINX和NGINX Plus可以处理数十万个并发连接，并为网络上50％以上最繁忙的站点供电。

## 特性

- 处理静态文件，索引文件以及自动索引；打开文件描述符缓冲．

- 无缓存的反向代理加速，简单的负载均衡和容错．

- FastCGI，简单的负载均衡和容错．

- 模块化的结构。

包括 gzipping, byte ranges, chunked responses,以及 SSI-filter 等 filter。如果由 FastCGI 或其它代理服务器处理单页中存在的多个 SSI，则这项处理可以并行运行，而不需要相互等待。

- 支持 SSL 和 TLSSNI．

# 应用场景

## NGINX作为Web服务器

NGINX背后的目标是创建最快的Web服务器，并保持卓越仍然是该项目的核心目标。 NGINX在测量Web服务器性能的基准测试中始终优于Apache和其他服务器。然而，自NGINX的最初版本以来，网站已经从简单的HTML页面扩展到动态的，多方面的内容。 NGINX随之发展，现在支持现代Web的所有组件，包括WebSocket，HTTP / 2和多种视频格式的流媒体（HDS，HLS，RTMP等）。

## NGINX超越Web服务

尽管NGINX成为最快的Web服务器，但可扩展的底层架构已被证明是除了提供内容之外的许多Web任务的理想选择。因为它可以处理大量连接，NGINX通常用作反向代理和负载平衡器来管理传入流量并将其分发到较慢的上游服务器 - 从旧数据库服务器到微服务。

NGINX也经常被放置在客户端和第二个Web服务器之间，用作SSL / TLS终结器或Web加速器。作为中间人，NGINX可以有效地处理可能减慢您的Web服务器速度的任务，例如协商SSL / TLS或压缩和缓存内容以提高性能。使用从Node.js到PHP的任何内容构建的动态站点通常将NGINX部署为内容缓存和反向代理，以减少应用程序服务器上的负载并最有效地使用底层硬件。

# NGINX和NGINX Plus能为您做什么？

NGINX Plus和NGINX是Dropbox，Netflix和Zynga等高流量网站使用的同类最佳网络服务器和应用交付解决方案。全球超过3.58亿个网站（包括100,000个最繁忙网站中的大多数）依靠NGINX Plus和NGINX快速，可靠，安全地提供内容。

NGINX使硬件负载平衡器过时。作为纯软件开源负载均衡器，NGINX比硬件负载均衡器更便宜，更易配置，专为现代云架构而设计。 

NGINX Plus支持动态重新配置，并与现代DevOps工具集成，便于监控。

NGINX是一个多功能工具。使用NGINX，您可以使用与负载均衡器，反向代理，内容缓存和Web服务器相同的工具，从而最大限度地减少组织需要维护的工具和配置量。 

NGINX提供教程，网络研讨会和各种文档，让您站起来。 NGINX Plus包括快速响应客户支持，因此您可以轻松获得帮助诊断使用NGINX或NGINX Plus的堆栈的任何部分。

NGINX不断发展。在过去的十年中，NGINX一直处于现代Web开发的最前沿，并在从HTTP/2到微服务支持的各个方面发挥了重要作用。

随着Web应用程序的开发和交付不断发展，NGINX Plus不断添加功能以实现完美的应用程序交付，从最近宣布的使用针对NGINX定制的JavaScript实现的配置支持到支持动态模块。使用NGINX Plus可确保您始终处于网络性能的最前沿。

# 参考资料

> [tengine zh_CN](http://tengine.taobao.org/)

学习则以 tengine 为主。

- what can nginx do 

[nginx](https://www.nginx.com/resources/glossary/nginx/)

* any list
{:toc}




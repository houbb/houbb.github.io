---
layout: post
title: MOSN（Modular Open Smart Network）-07-Sidecar 模式
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, test, sh]
published: true
---

## 前言

大家好，我是老马。

sofastack 其实出来很久了，第一次应该是在 2022 年左右开始关注，但是一直没有深入研究。

最近想学习一下 SOFA 对于生态的设计和思考。

## sofaboot 系列

[SOFAStack-00-sofa 技术栈概览](https://houbb.github.io/2022/07/09/sofastack-00-overview)

[MOSN（Modular Open Smart Network）-00-简单聊一聊](https://houbb.github.io/2022/07/09/sofastack-mosn-00-chat)

[MOSN（Modular Open Smart Network）-01-是一款主要使用 Go 语言开发的云原生网络代理平台](https://houbb.github.io/2022/07/09/sofastack-mosn-01-overview)

[MOSN（Modular Open Smart Network）-02-核心概念](https://houbb.github.io/2022/07/09/sofastack-mosn-02-core-components)

[MOSN（Modular Open Smart Network）-03-流量劫持](https://houbb.github.io/2022/07/09/sofastack-mosn-03-traffic-hijack)

[MOSN（Modular Open Smart Network）-04-TLS 安全链路](https://houbb.github.io/2022/07/09/sofastack-mosn-04-tls)

[MOSN（Modular Open Smart Network）-05-MOSN 平滑升级原理解析](https://houbb.github.io/2022/07/09/sofastack-mosn-05-soomth-upgrade)

[MOSN（Modular Open Smart Network）-06-MOSN 多协议机制解析](https://houbb.github.io/2022/07/09/sofastack-mosn-06-multi-protocol)

[MOSN（Modular Open Smart Network）-07-Sidecar 模式](https://houbb.github.io/2022/07/09/sofastack-mosn-07-sidecar)

[MOSN（Modular Open Smart Network）-08-MOSN 扩展机制解析](https://houbb.github.io/2022/07/09/sofastack-mosn-08-extension)

# Sidecar 模式是 Service Mesh 中习惯采用的模式。

Sidecar 模式是 Service Mesh 中习惯采用的模式，是容器设计模式的一种，在 Service Mesh 出现之前该模式就一直存在，本文将为您讲解 Sidecar 模式。

## 什么是 Sidecar 模式
--------------

将应用程序的功能划分为单独的进程可以被视为 **Sidecar 模式**。

如图所示，Sidecar 模式允许您在应用程序旁边添加更多功能，而无需额外第三方组件配置或修改应用程序代码。

![Sidecar 模式](https://mosn.io/docs/products/structure/sidecar-pattern/sidecar-pattern.jpg)

就像连接了 Sidecar 的三轮摩托车一样，在软件架构中， Sidecar 连接到父应用并且为其添加扩展或者增强功能。Sidecar 应用与主应用程序松散耦合。它可以屏蔽不同编程语言的差异，统一实现微服务的可观察性、监控、日志记录、配置、断路器等功能。

## 使用 Sidecar 模式的优势
----------------

Sidecar 模式具有以下优势：

*   将与应用业务逻辑无关的功能抽象到共同基础设施降低了微服务代码的复杂度。
*   因为不再需要编写相同的第三方组件配置文件和代码，所以能够降低微服务架构中的代码重复度。
*   降低应用程序代码和底层平台的耦合度。

## Sidecar 模式如何工作
--------------

Sidecar 是容器应用模式的一种，也是在 Service Mesh 中发扬光大的一种模式，详见 [Service Mesh 架构解析](https://www.servicemesher.com/blog/service-mesh-architectures/)，其中详细描述使用了**节点代理**和 **Sidecar** 模式的 Service Mesh 架构。

使用 Sidecar 模式部署服务网格时，无需在节点上运行代理，但是集群中将运行多个相同的 Sidecar 副本。在 Sidecar 部署方式中，每个应用的容器旁都会部署一个伴生容器，这个容器称之为 Sidecar 容器。Sidecar 接管进出应用容器的所有流量。在 Kubernetes 的 Pod 中，在原有的应用容器旁边注入一个 Sidecar 容器，两个容器共享存储、网络等资源，可以广义的将这个包含了 Sidecar 容器的 Pod 理解为一台主机，两个容器共享主机资源。

* * *



# 参考资料

https://mosn.io/docs/products/structure/sidecar-pattern/

* any list
{:toc}
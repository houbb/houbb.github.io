---
layout: post
title: 注册中心 Consul-01-实现分布式系统的服务发现、配置共享和健康检查
date:  2022-07-02 09:22:02 +0800
categories: [Distributed]
tags: [distributed, service-mesh, register-center, sh]
published: true
---

# Consul

[Consul](https://www.consul.io/)  是一种服务网格解决方案，提供具有服务发现，配置和分段功能的全功能控制平面。

这些功能中的每一个都可以根据需要单独使用，也可以一起使用以构建全服务网格。 

Consul需要数据平面并支持代理和本机集成模型。 

Consul附带一个简单的内置代理，因此一切都可以开箱即用，但也支持第三方代理集成，如Envoy。

## 特性

- 服务发现

Consul的客户端可以注册服务，例如api或mysql，其他客户端可以使用Consul来发现给定服务的提供者。使用DNS或HTTP，应用程序可以轻松找到它们所依赖的服务。

- 运行状况检查

Consul客户端可以提供任意数量的运行状况检查，这些检查与给定服务（“是Web服务器返回200 OK”）或本地节点（“内存利用率低于90％”）相关联。运营商可以使用此信息来监控群集运行状况，服务发现组件使用此信息将流量路由远离不健康的主机。

- KV商店

应用程序可以将Consul的分层键/值存储用于任何用途，包括动态配置，功能标记，协调，领导者选举等。简单的HTTP API使其易于使用。

- 安全服务通信

Consul可以为服务生成和分发TLS证书，以建立相互的TLS连接。可以使用意图来定义允许哪些服务进行通信。可以使用可以实时更改的意图轻松管理服务分段，而不是使用复杂的网络拓扑和静态防火墙规则。

- 多数据中心

Consul支持多个数据中心。这意味着Consul的用户不必担心构建额外的抽象层以扩展到多个区域。

Consul旨在对DevOps社区和应用程序开发人员友好，使其成为现代弹性基础架构的理想选择。

## Consul 基本架构

Consul 是一个分布式，高可用的系统。 为了快速了解Consul的工作原理，本节只介绍基础知识，不会介绍详细的细节。

向Consul提供服务的每个节点都运行一个Consul代理。 发现其他服务或获取/设置键/值数据不需要运行代理。 代理负责健康检查节点上的服务以及节点本身。

代理与一个或多个Consul服务器通信。Consul 服务器是数据存储和复制的地方。 服务器自己选出一个 leader。 

虽然Consul可以在一台服务器上运行，但推荐使用3到5台来避免数据丢失的情况。 

每个数据中心都建议使用一组Consul服务器。

需要发现其他服务或节点的基础架构组件可以查询任何Consul服务器或任何Consul代理。 代理自动将查询转发到服务器。

每个数据中心都运行Consul服务器集群。 当跨数据中心服务发现或配置请求时，本地Consul服务器将请求转发到远程数据中心并返回结果。

# 参考资料

[服务发现 - consul 的介绍、部署和使用](https://www.cnblogs.com/xiaohanlin/p/8016803.html)

[Consul文档简要整理](http://www.cnblogs.com/Summer7C/p/7327109.html)

[Consul服务注册与服务发现的巨坑](http://blog.51cto.com/qiangmzsx/2086174)

[Consul 介绍](https://www.jianshu.com/p/e0986abbfe48)

[使用Consul做服务发现的若干姿势](https://mp.weixin.qq.com/s/950r6ImhLvF8_m9WSYL5uQ)

* any list
{:toc}
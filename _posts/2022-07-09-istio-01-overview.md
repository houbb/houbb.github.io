---
layout: post
title: istio 介绍-01-overview
date:  2022-07-09 09:22:02 +0800
categories: [Distributed]
tags: [distributed, istio, sh]
published: true
---


# istio

[istio](https://github.com/istio/istio) 一个用于连接、管理和保护微服务的开放平台。

# 介绍

Istio 是一个开放平台，用于提供统一的方式来集成微服务、管理跨微服务的流量、执行策略和聚合遥测数据。 

Istio 的控制平面在底层集群管理平台（例如 Kubernetes）上提供了一个抽象层。

Istio 由以下组件组成：

Envoy - 每个微服务的 Sidecar 代理，用于处理集群中服务之间以及从服务到外部服务的入口/出口流量。

这些代理形成了一个安全的微服务网格，提供了一组丰富的功能，如发现、丰富的第 7 层路由、断路器、策略实施和遥测记录/报告功能。

注意：服务网格不是覆盖网络。它简化并增强了应用程序中的微服务通过底层平台提供的网络相互通信的方式。

Istiod - Istio 控制平面。它提供服务发现、配置和证书管理。它由以下子组件组成：

Pilot - 负责在运行时配置代理。

Citadel - 负责证书的颁发和轮换。

Galley - 负责在 Istio 中验证、摄取、聚合、转换和分发配置。

Operator - 该组件提供用户友好的选项来操作 Istio 服务网格。

# 存储库

Istio 项目分为几个 GitHub 存储库：

istio/api。该存储库定义了 Istio 平台的组件级 API 和常用配置格式。

istio/community。此存储库包含有关 Istio 社区的信息，包括管理 Istio 开源项目的各种文档。

istio/istio。这是主要的代码存储库。它托管 Istio 的核心组件、安装工件和示例程序。这包括：

istioctl.此目录包含 istioctl 命令行实用程序的代码。

operator 操作员。该目录包含 Istio Operator 的代码。

pilot 飞行员。此目录包含特定于平台的代码，用于填充抽象服务模型、在应用拓扑更改时动态重新配置代理以及将路由规则转换为特定于代理的配置。

security 安全。该目录包含安全相关代码，包括 Citadel（充当证书颁发机构）、Citadel 代理等。

istio/proxy istio/代理。 Istio 代理包含对 Envoy 代理的扩展（以 Envoy 过滤器的形式），支持身份验证、授权和遥测收集。

# 问题管理

我们使用 GitHub 来跟踪我们所有的错误和功能请求。 

我们跟踪的每个问题都有各种元数据：

Epic 史诗。 史诗代表了整个 Istio 的功能区域。 史诗的范围相当广泛，基本上是产品级的东西。 每个问题最终都是史诗的一部分。

Milestone 里程碑。 每个问题都分配了一个里程碑。 这是 0.1、0.2、... 或“模糊的未来”。 里程碑表明我们认为问题应该得到解决。

Priority 优先。 每个问题都有一个优先级，由优先级项目中的列表示。 优先级可以是 P0、P1、P2 或 >P2 之一。 优先级表明在里程碑中解决问题的重要性。 P0 表示，如果问题没有得到解决，就不能认为里程碑已经实现。

# 参考资料

https://www.sofastack.tech/projects/sofa-lookout/overview/

* any list
{:toc}
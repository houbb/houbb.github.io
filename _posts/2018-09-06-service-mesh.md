---
layout: post
title:  Service Mesh
date:  2018-09-06 10:00:45 +0800
categories: [Architecture]
tags: [architecture, sh]
published: true
excerpt: 微服务 Service Mesh
---

# Service Mesh

Service mesh 又译作 “服务网格”，作为服务间通信的基础设施层。

## 概念

A service mesh is a dedicated infrastructure layer for handling service-to-service communication. It’s responsible for the reliable delivery of requests through the complex topology of services that comprise a modern, cloud native application. In practice, the service mesh is typically implemented as an array of lightweight network proxies that are deployed alongside application code, without the application needing to be aware.

服务网格是一个基础设施层，功能在于处理服务间通信，职责是负责实现请求的可靠传递。

在实践中，服务网格通常实现为轻量级网络代理，通常与应用程序部署在一起，但是对应用程序透明。

## 开源框架 

[istio](https://istio.io/) 和 [linkerd](https://linkerd.io/) 都可以在

[kubernetes](https://kubernetes.io/) 中集成。

## 理解 Service Mesh

如果用一句话来解释什么是 Service Mesh，可以将它比作是应用程序或者说微服务间的 TCP/IP，负责服务之间的网络调用、限流、熔断和监控。

对于编写应用程序来说一般无须关心 TCP/IP 这一层（比如通过 HTTP 协议的 RESTful 应用），同样使用 Service Mesh 也就无须关系服务之间的那些原来是通过应用程序或者其他框架实现的事情，比如 Spring Cloud、OSS，现在只要交给 Service Mesh 就可以了。

### 发展历程

- 从最原始的主机之间直接使用网线相连

- 网络层的出现

- 集成到应用程序内部的控制流

- 分解到应用程序外部的控制流

- 应用程序的中集成服务发现和断路器

- 出现了专门用于服务发现和断路器的软件包/库，如 Twitter 的 Finagle 和 Facebook 的 Proxygen，这时候还是集成在应用程序内部

- 出现了专门用于服务发现和断路器的开源软件，如 Netflix OSS、Airbnb 的 synapse 和 nerve

- 最后作为微服务的中间层 service mesh 出现

系统架构图如下：

![service mesh](https://ws1.sinaimg.cn/large/00704eQkly1fswh7dbs1pj30id0bpmxl.jpg)

Service mesh 作为 sidecar 运行，对应用程序来说是透明，所有应用程序间的流量都会通过它，所以对应用程序流量的控制都可以在 serivce mesh 中实现。

## 为何使用

Service mesh 并没有给我们带来新功能，它是用于解决其他工具已经解决过的问题，只不过这次是在 Cloud Native 的 kubernetes 环境下的实现。

在传统的 MVC 三层 Web 应用程序架构下，服务之间的通讯并不复杂，在应用程序内部自己管理即可，但是在现今的复杂的大型网站情况下，单体应用被分解为众多的微服务，服务之间的依赖和通讯十分复杂，出现了 twitter 开发的 Finagle、Netflix 开发的 Hystrix 和 Google 的 Stubby 这样的 “胖客户端” 库，这些就是早期的 service mesh，但是它们都近适用于特定的环境和特定的开发语言，并不能作为平台级的 service mesh 支持。

在 Cloud Native 架构下，容器的使用给予了异构应用程序的更多可行性，kubernetes 增强的应用的横向扩容能力，用户可以快速的编排出复杂环境、复杂依赖关系的应用程序，同时开发者又无须过分关心应用程序的监控、扩展性、服务发现和分布式追踪这些繁琐的事情而专注于程序开发，赋予开发者更多的创造性。

# 工作原理

下面以 Linkerd 为例讲解 service mesh 如何工作，Istio 作为 service mesh 的另一种实现原理与 linkerd 基本类似，后续文章将会详解 Istio 和 Linkerd 如何在 kubernetes 中工作。

- Linkerd 将服务请求路由到目的地址，根据中的参数判断是到生产环境、测试环境还是 staging 环境中的服务（服务可能同时部署在这三个环境中），是路由到本地环境还是公有云环境？
所- 有的这些路由信息可以动态配置，可以是全局配置也可以为某些服务单独配置。

- 当 Linkerd 确认了目的地址后，将流量发送到相应服务发现端点，在 kubernetes 中是 service，然后 service 会将服务转发给后端的实例。

- Linkerd 根据它观测到最近请求的延迟时间，选择出所有应用程序的实例中响应最快的实例。

- Linkerd 将请求发送给该实例，同时记录响应类型和延迟数据。

- 如果该实例挂了、不响应了或者进程不工作了，Linkerd 将把请求发送到其他实例上重试。

- 如果该实例持续返回 error，Linkerd 会将该实例从负载均衡池中移除，稍后再周期性得重试。

- 如果请求的截止时间已过，Linkerd 主动失败该请求，而不是再次尝试添加负载。

- Linkerd 以 metric 和分布式追踪的形式捕获上述行为的各个方面，这些追踪信息将发送到集中 metric 系统。

# 参考资料

https://blog.buoyant.io/2017/04/25/whats-a-service-mesh-and-why-do-i-need-one/

https://jimmysong.io/posts/what-is-a-service-mesh/

http://www.infoq.com/cn/news/2017/12/why-service-mesh

- vs API gate-way

https://medium.com/microservices-in-practice/service-mesh-vs-api-gateway-a6d814b9bf56

* any list
{:toc}
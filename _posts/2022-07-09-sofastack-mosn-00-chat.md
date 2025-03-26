---
layout: post
title: MOSN（Modular Open Smart Network）-00-聊一聊 MOSN
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

# MOSN

## 1. 定义与背景

MOSN（Modular Open Smart Network）是由蚂蚁集团（原蚂蚁金服）于2018年7月开源的一款云原生网络代理平台，使用Go语言开发。

其核心定位是为服务提供分布式、模块化、可观察且智能化的代理能力，主要应用于Service Mesh的数据平面(https://github.com/sofastack/sofa-mosn)(https://mosn.io/)。名称中的“Open”和“Smart”体现了其开放生态与智能化流量管理的特点。

MOSN的诞生源于微服务架构演进中的痛点，例如多语言中间件适配成本高、SDK升级困难、服务治理能力不足等。

蚂蚁集团通过自研MOSN，将服务治理能力下沉至Sidecar，实现了业务逻辑与通信逻辑的解耦(https://www.sofastack.tech/projects/sofa-mosn/concept/smooth-upgrade/)。

---

## 2. 核心模块与架构
MOSN的架构设计遵循OSI分层思想，分为以下模块与层级：

- 启动模块（Starter/Server/Listener/Config）：负责进程初始化、配置加载和监听端口(https://mosn.io/blog/code/)(https://mosn.io/blog/code/)。
- 核心功能模块：
  - NET/IO层：处理网络连接与数据包，支持Listener Filter（如流量劫持）和Network Filter（如TCP代理）(https://www.sofastack.tech/projects/sofa-mosn/concept/smooth-upgrade/)。
  - Protocol层：多协议引擎，支持HTTP/1.1、HTTP/2、Dubbo、SOFARPC等协议的解码/编码(https://mosn.io/blog/code/)。
  - Stream层：将协议数据封装为流，支持Stream Filter（如健康检查、故障注入）(https://www.sofastack.tech/projects/sofa-mosn/concept/smooth-upgrade/)。
  - Proxy层：负责流量转发框架，集成路由、负载均衡、连接池等能力(https://mosn.io/blog/code/)。
- 扩展模块：
  - Router：支持基于Header/URL的虚拟主机路由、子集群匹配及重试机制(https://mosn.io/blog/code/)。
  - Upstream：动态管理后端集群，支持健康检查、熔断与CDS/EDS对接(https://mosn.io/blog/code/)。
  - Metrics/Trace：集成Prometheus和SkyWalking，提供网络流量、请求状态、链路追踪等可观测性(https://mosn.io/blog/code/)。
  - FlowControl：通过Sentinel SDK实现限流与熔断(https://mosn.io/blog/code/)。

架构采用工厂模式分层设计，各模块通过接口暴露功能，便于扩展(https://mosn.io/blog/code/)。

---

## 3. 技术特点与优势
- 模块化与扩展性：  
  支持插件机制，用户可自定义协议（如私有RPC）、过滤器（Network/Stream Filter）及负载均衡算法（如RR、Random）(https://mosn.io/blog/code/)(https://www.sofastack.tech/projects/sofa-mosn/concept/smooth-upgrade/)。

- 高性能：  
  - 采用协程池与内存零拷贝技术，减少调度开销(https://mosn.io/blog/code/)。
  - 支持RawEpoll模型优化长连接场景，性能优于传统Go netpoll(https://mosn.io/blog/code/)。
  - 生产环境验证：双十一期间处理数千万QPS，平均RT仅增加0.2ms(https://mosn.io/)(https://mosn.io/blog/code/)。

- 云原生集成：  
  - 兼容xDS API，无缝集成Istio，支持动态配置热更新(https://github.com/sofastack/sofa-mosn)(https://mosn.io/blog/code/)。
  - 提供南北向流量管理能力，可作为API Gateway或云原生Ingress(https://mosn.io/blog/code/)。

- 安全与合规：  
  - 原生支持TLS加密，优化Go TLS性能（如RSA/ECDSA加速）(https://mosn.io/blog/code/)。
  - 支持国密算法，满足金融场景合规需求(https://mosn.io/blog/code/)。

- 平滑升级：  
  通过Domain Socket迁移长连接，实现Sidecar无损升级，业务流量零中断(https://mosn.io/blog/code/)(https://mosn.io/blog/code/)。

---

## 4. 应用场景
- Service Mesh：  
  蚂蚁集团内部数百个应用、数十万容器通过MOSN实现服务治理，覆盖RPC、消息中间件等场景(https://mosn.io/)(https://mosn.io/blog/code/)。
- 负载均衡与API Gateway：  
  支持四层/七层负载均衡，可替代Nginx作为Ingress控制器(https://mosn.io/blog/code/)。
- 云边协同：  
  通过反向通道实现云端与边缘节点通信，解决边缘服务不可达问题(https://mosn.io/blog/code/)。
- 金融场景：  
  在工商银行、江西农信等机构落地，提供高可靠、低延迟的Mesh化服务(https://mosn.io/blog/code/)。

---

## 5. 与同类产品的对比
- Envoy（C++）：  
  - 语言优势：MOSN使用Go语言，开发效率高且内存安全，心智成本更低（尤其对Java/Go开发者）(https://mosn.io/blog/code/)]。
  - 协议扩展：MOSN提供统一的多协议框架，私有协议接入成本更低(https://mosn.io/blog/code/)]。
  - 流量劫持：Envoy依赖iptables，而MOSN通过端口注册实现透明劫持，升级方案更优(https://mosn.io/blog/code/)]。

- Linkerd/NginxMesh：  
  MOSN活跃度更高，且经过双十一等大规模场景验证(https://mosn.io/blog/code/)]。

MOSN凭借其模块化设计、高性能及云原生集成能力，已成为Service Mesh领域的重要开源项目。

随着社区生态的壮大，未来将进一步推动云原生网络技术的标准化与普及。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。


# 参考资料

https://mosn.io/docs/products/overview/ 


* any list
{:toc}
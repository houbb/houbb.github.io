---
layout: post
title: MOSN（Modular Open Smart Network）-04-TLS 安全链路
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

# MOSN 的 TLS 安全能力

本文将向您展示 MOSN 的 TLS 安全能力。

MOSN 支持通过 Istio Citadel 的证书签发方案，基于 Istio 社区的 [SDS（Secret Discovery Service）](https://www.envoyproxy.io/docs/envoy/latest/configuration/security/secret)方案为 Sidecar 配置证书，支持证书动态发现和热更新能力。

为了支持更高级的安全能力，MOSN 没有使用 Citadel 的证书自签发能力，而是通过对接内部 KMS 系统获取证书。同时提供证书缓存和证书推送更新能力。

我们先来看看 MOSN 证书方案的架构图，如下图所示：

![MOSN 证书方案](https://mosn.io/docs/products/structure/tls/mosn-certificate-arch.png)

各组件职能如下：

*   Pilot：负责 Policy、SDS 配置下发，为简化复杂度，图中未标出
*   Citadel：Citadel 作为 Certificate Provider，同时作为 MCP Server 为 Citadel Agent 提供 Pod、CR 等资源
*   Citadel Agent：提供 SDS Server 服务，为 MOSN、DB Sidecar、Security Sidecar 提供 Certificate 和 CR 下发能力
*   KMS：密钥管理系统负责证书签发

### 证书获取流程

对整体架构有个大致理解后，我们分解下 Sidecar 获取证书的流程，如下图所示：

![证书获取流程](https://mosn.io/docs/products/structure/tls/certificate-request-process.png)

补充说明下图中的每一步环节：

1.  Citadel 与 Citadel Agent（NodeAgent）组件通过 MCP 协议（Mesh Configuration Protocol）同步 Pod 和 CR 信息，避免 Citadel Agent 直接请求 API Server 导致 API Server 负载过高
2.  MOSN 通过 Unix Domain Socket 方式向 Citadel Agent 发起 SDS 请求
3.  Citadel Agent 会进行防篡改校验，并提取 appkey
4.  Citadel Agent 携带 appkey 请求 Citadel 签发证书
5.  Citadel 检查证书是否已缓存，如果缓存证书未过期，Citadel 将直接响应缓存证书
6.  证书不在缓存中，Citadel 会基于 appkey 构造证书签发请求，向 KMS 申请签发证书
7.  KMS 会将签发的证书响应回 Citadel，另外 KMS 也支持证书过期轮换通知
8.  Citadel 收到证书后，会将证书传递给对应的 Citadel Agent
9.  Citadel Agent 收到证书后，会在内存中缓存证书，并将证书下发给 MOSN


# 参考资料

https://mosn.io/docs/products/structure/tls/

* any list
{:toc}
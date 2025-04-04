---
layout: post
title: MOSN（Modular Open Smart Network）-03-流量劫持
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

# MOSN 作为 Sidecar 使用时的流量劫持方案

本文描述的是 MOSN 作为 Sidecar 使用时的流量劫持方案。

MOSN 作为 Sidecar 和业务容器部署在同一个 Pod 中时，需要使得业务应用的 Inbound 和 Outbound 服务请求都能够经过 Sidecar 处理。区别于 Istio 社区使用 iptables 做流量透明劫持，MOSN 目前使用的是流量接管方案，并在积极探索适用于大规模流量下的透明劫持方案。

## 流量接管

区别于 Istio 社区的 [iptables 流量劫持方案](https://jimmysong.io/istio-handbook/concepts/sidecar-injection-deep-dive.html)，MOSN 使用的流量接管的方案如下：

1.  假设服务端运行在 1.2.3.4 这台机器上，监听 20880 端口，首先服务端会向自己的 Sidecar 发起服务注册请求，告知 Sidecar 需要注册的服务以及 IP + 端口（1.2.3.4:20880）
2.  服务端的 Sidecar 会向服务注册中心（如 SOFA Registry）发起服务注册请求，告知需要注册的服务以及 IP + 端口，不过这里需要注意的是注册上去的并不是业务应用的端口（20880），而是 Sidecar 自己监听的一个端口（例如：20881）
3.  调用端向自己的 Sidecar 发起服务订阅请求，告知需要订阅的服务信息
4.  调用端的 Sidecar 向调用端推送服务地址，这里需要注意的是推送的 IP 是本机，端口是调用端的 Sidecar 监听的端口（例如 20882）
5.  调用端的 Sidecar 会向服务注册中心（如 SOFA Registry）发起服务订阅请求，告知需要订阅的服务信息；
6.  服务注册中心（如 SOFA Registry）向调用端的 Sidecar 推送服务地址（1.2.3.4:20881）

![流量接管示意图](https://mosn.io/docs/products/structure/traffic-hijack/traffic-hijacking.png)

### 服务调用过程

经过上述的服务发现过程，流量转发过程就显得非常自然了：

1.  调用端拿到的服务端地址是 `127.0.0.1:20882`，所以就会向这个地址发起服务调用
2.  调用端的 Sidecar 接收到请求后，通过解析请求头，可以得知具体要调用的服务信息，然后获取之前从服务注册中心返回的地址后就可以发起真实的调用（`1.2.3.4:20881`）
3.  服务端的 Sidecar 接收到请求后，经过一系列处理，最终会把请求发送给服务端（`127.0.0.1:20880`）

![服务调用过程示意图](https://mosn.io/docs/products/structure/traffic-hijack/service-call-process.png)

## 透明劫持

上文通过在服务注册过程中把服务端地址替换成本机监听端口实现了轻量级的"流量劫持"，在存在注册中心，且调用端和服务端同时使用特定SDK的场景中可以很好的工作，如果不满足这两个条件，则无法流量劫持。为了降低对于应用程序的要求，需要引入透明劫持。

### 使用 iptables 做流量劫持

iptables 通过 NAT 表的 redirect 动作执行流量重定向，通过 syn 包触发新建 nefilter 层的连接，后续报文到来时查找连接转换目的地址与端口。新建连接时同时会记录下原始目的地址，应用程序通过(`SOL_IP`、`SO_ORIGINAL_DST`)获取到真实的目的地址。

iptables 劫持原理如下图所示：

![iptables 劫持原理](https://mosn.io/docs/products/structure/traffic-hijack/iptables.png)

### 使用 iptables 做流量劫持时存在的问题

目前 Istio 使用 iptables 实现透明劫持，主要存在以下三个问题：

1.  需要借助于 conntrack 模块实现连接跟踪，在连接数较多的情况下，会造成较大的消耗，同时可能会造成 track 表满的情况，业内有关闭 conntrack 的做法。
2.  iptables 属于常用模块，全局生效，不能显式的禁止相关联的修改，可管控性比较差。
3.  iptables 重定向流量本质上是通过 loopback 交换数据，outbond 流量将两次穿越协议栈，在大并发场景下会损失转发性能。

上述问题并非在所有场景中都存在，例如连接数不多且 NAT 表未被使用的情况下，iptables 是满足要求的简单方案。为了适配更广泛场景，透明劫持需要解决上述三个问题。

### 透明劫持方案优化

**使用 tproxy 处理 inbound 流量**

tproxy 可以用于 inbound 流量的重定向，且无需改变报文中的目的 IP/端口，不需要执行连接跟踪，避免了 conntrack 模块创建大量连接的问题。目前 Istio 支持通过 tproxy 处理 inbound 流量（需内核版本支持）。

**使用 hook connect 处理 outbound 流量**

outbound 方向通过 hook connect 实现透明劫持，原理如下：

![hook-connect 原理示意图](https://mosn.io/docs/products/structure/traffic-hijack/hook-connect.png)

无论采用哪种透明劫持方案，均需解决获取真实目的 IP/端口的问题：iptables 方案通过 getsockopt 获取，tproxy 直接读取目的地址，hook connect 方案读取方式与 tproxy 类似。

在内核版本 >=4.16 时，通过 sockmap 可缩短报文穿越路径，改善 outbound 方向的转发性能。

## 总结

总结来看：
1. 应用程序通过注册中心发布/订阅服务时，可结合注册中心劫持流量
2. 透明劫持场景中：
   - 性能压力不大时使用 iptables redirect
   - 大并发压力下使用 tproxy 与 hook connect 结合的方案



# 参考资料

https://mosn.io/docs/products/structure/traffic-hijack/

* any list
{:toc}
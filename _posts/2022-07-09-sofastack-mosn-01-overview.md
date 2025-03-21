---
layout: post
title: MOSN（Modular Open Smart Network）是一款主要使用 Go 语言开发的云原生网络代理平台，由蚂蚁集团开源并经过双 11 大促几十万容器的生产级验证
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, test, sh]
published: true
---

# MOSN 简介

MOSN（Modular Open Smart Network）是一款主要使用 Go 语言开发的云原生网络代理平台，由蚂蚁集团开源并经过双 11 大促几十万容器的生产级验证。 

MOSN 为服务提供多协议、模块化、智能化、安全的代理能力，融合了大量云原生通用组件，同时也可以集成 Envoy 作为网络库，具备高性能、易扩展的特点。 

MOSN 可以和 Istio 集成构建 Service Mesh，也可以作为独立的四、七层负载均衡，API Gateway、云原生 Ingress 等使用。

## 核心能力

- Istio 集成
  - 集成 Istio 1.10 版本，可基于全动态资源配置运行
- 核心转发
  - 自包含的网络服务器
  - 支持 TCP 代理
  - 支持 UDP 代理
  - 支持透明劫持模式
- 多协议
  - 支持 HTTP/1.1，HTTP/2
  - 支持基于 XProtocol 框架的多协议扩展
  - 支持多协议自动识别
  - 支持 gRPC 协议
- 核心路由
  - 支持基于 Domain 的 VirtualHost 路由
  - 匹配条件路由
    - Headers/Path/Prefix/Variable/DSL
  - 路由模式
    - 重定向
    - 直接响应
    - 流量镜像
  - 高级路由
    - 基于 Metadata 的分组路由
    - 基于权重的路由
  - 配置支持
    - 基于路由匹配的重试
    - 基于路由匹配的超时配置
    - 基于路由匹配的请求头/响应头处理
- 后端管理 & 负载均衡
  - 连接管理
    - 支持连接池管理
    - 支持长连接心跳处理
  - 容错机制
    - 支持熔断
    - 支持后端主动健康检查
  - 负载均衡策略
    - Random/RR/WRR/EDF 等
    - 基于 Metadata 的分组策略
  - 后端集群模式
    - OriginalDst/DNS/SIMPLE
    - 支持自定义扩展集群模式
- 可观察性
  - Trace 模块
    - 格式可扩展
    - 集成 jaeger/skywalking
  - Metrics
    - 基于 prometheus 格式
  - 日志
    - 支持可配置的 AccessLog
  - 管理接口
    - 可扩展的 Admin API
  - 监控
    - 集成 Holmes，自动监控 pprof
- TLS
  - 证书管理
    - 多证书匹配模式
    - TLS Inspector 模式
    - 基于 SDS 的动态证书获取/更新
    - 可扩展的证书管理机制
  - 国密支持
    - 基于 CGo 的国密套件
- 进程管理
  - 支持平滑升级（连接/配置迁移）
  - 支持优雅退出
- 扩展能力
  - 插件扩展
    - 基于 go-plugin 的模式
    - 基于进程的扩展模式
    - 基于 WASM 的扩展模式
  - 自定义扩展
    - 支持自定义扩展配置
    - 支持四层/七层 Filter 扩展

## 社区介绍

MOSN 开源仍在高速发展中，有很多能力需要补全，欢迎所有人参与进来与我们一起共建。

关于 MOSN 社区的详细介绍请查看 mosn/community 仓库，如有任何疑问欢迎提交 Issue。



# 参考资料

https://mosn.io/docs/products/overview/ 


* any list
{:toc}
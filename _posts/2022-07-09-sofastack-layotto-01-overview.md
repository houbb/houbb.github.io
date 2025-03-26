---
layout: post
title: Layotto 是一款使用 Golang 开发的应用运行时，旨在帮助开发人员快速构建云原生应用
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

[SOFABoot-00-sofaboot 概览](https://houbb.github.io/2022/07/09/sofastack-sofaboot-00-overview)

[SOFABoot-01-蚂蚁金服开源的 sofaboot 是什么黑科技？](https://houbb.github.io/2022/07/09/sofastack-sofaboot-01-intro)

[SOFABoot-02-模块化隔离方案](https://houbb.github.io/2022/07/09/sofastack-sofaboot-02-module-iosolation)

[SOFABoot-03-sofaboot 介绍](https://houbb.github.io/2022/07/09/sofastack-sofaboot-03-intro)

[SOFABoot-04-快速开始](https://houbb.github.io/2022/07/09/sofastack-sofaboot-04-quick-start)

[SOFABoot-05-依赖管理](https://houbb.github.io/2022/07/09/sofastack-sofaboot-05-depency-solve)

[SOFABoot-06-健康检查](https://houbb.github.io/2022/07/09/sofastack-sofaboot-06-health-check)

[SOFABoot-07-版本查看](https://houbb.github.io/2022/07/09/sofastack-sofaboot-07-version)

[SOFABoot-08-启动加速](https://houbb.github.io/2022/07/09/sofastack-sofaboot-08-speed-up)

[SOFABoot-09-模块隔离](https://houbb.github.io/2022/07/09/sofastack-sofaboot-09-module-isolation)

[SOFABoot-10-聊一聊 sofatboot 的十个问题](https://houbb.github.io/2022/07/09/sofastack-sofaboot-10-chat-10-q)

# Layotto 项目文档

## 1. 项目概述
Layotto 是蚂蚁集团开源的 **服务网格应用运行时**，基于 MOSN 构建，旨在通过标准化 API 实现应用与基础设施的解耦，提升跨平台部署能力和异构语言支持。  
- **核心目标**：提供统一的分布式能力抽象（如状态管理、消息订阅、配置管理等），降低应用对底层中间件的依赖。
- **架构定位**：整合 Service Mesh 与 Multi-Runtime 理念，通过单一 Sidecar 同时支持服务治理和分布式能力。

## 2. 核心功能
### 2.1 支持的 API
Layotto 提供以下标准化 API（截至 v0.1.0 版本）：
- **Configuration API**：动态配置管理。
- **PubSub API**：消息发布与订阅。
- **State API**：分布式状态管理（如缓存、数据库）。
- **Distributed Lock API**：分布式锁。
- **Sequencer API**：分布式唯一 ID 生成。
- **RPC API**：服务间通信。
- **Actuator API**：健康检查与运行时元数据查询。

### 2.2 集成能力
- **Service Mesh 集成**：支持通过 4 层或 7 层流量治理（限流、流量镜像等），兼容 Istio。
- **多语言支持**：基于 gRPC 和 WASM 实现跨语言调用。
- **组件扩展**：复用 Dapr 社区组件，支持对接多种基础设施（如 Redis、Kafka 等）。

## 3. 架构设计
### 3.1 分层架构
```plaintext
+-------------------+     +-------------------+
|    Application    |     |   运维平台（如 K8s）|
+-------------------+     +-------------------+
           ↓ HTTP/gRPC                ↑ HTTP
+---------------------------------------------+
|                  Layotto                   |
|  - 标准化 API（gRPC/HTTP）                 |
|  - 服务治理（流量控制、熔断等）              |
+---------------------------------------------+
           ↓ 对接多种协议
+---------------------------------------------+
|              基础设施（Redis、MQ 等）        |
+---------------------------------------------+
```
*架构图描述：Layotto 作为中间层，向上提供统一 API，向下对接异构基础设施。*

### 3.2 关键特性
- **可移植性**：应用通过标准 API 与 Layotto 交互，无需修改代码即可跨云部署或在 Layotto/Dapr 间切换。
- **性能优化**：基于 MOSN 实现低延迟（RT <0.2ms）与低资源占用（CPU 增加 0%~2%，内存增长 <15MB）。

## 4. 社区与资源
### 4.1 参与贡献
- **源码解析活动**：通过 GitHub 协作认领任务，完成任务可获得社区 Contributor/Member 身份及周边奖励。
- **核心开发者**：包括 @seeflood、@wenxuwan 等，担任代码 Review 与导师角色。

### 4.2 相关链接
- **GitHub 仓库**：[mosn/layotto](https://github.com/mosn/layotto)
- **官方博客**：[Layotto 开启服务网格+应用运行时新篇章](https://mosn.io/layotto/#/zh/blog/mosn-subproject-layotto-opening-a-new-chapter-in-service-grid-application-runtime/index)

---

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://github.com/occlum/occlum

* any list
{:toc}
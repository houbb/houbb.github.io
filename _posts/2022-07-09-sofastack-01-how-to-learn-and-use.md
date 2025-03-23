---
layout: post
title: SOFAStack-01-sofastack 技术栈如何学习和应用？
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFAStack, test, sh]
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

# 技术栈如何学习和应用？

## 个人理解

老马一般对一个新的技术，喜欢从下面的几个方面学习：

1）知道 简单了解是做什么的，有什么作用

2）使用 学习、工作中真正的使用这个技术

3）反馈 通过遇到的问题，解决+记录+思考，加深对技术的理解

4）源码 从设计层+源码层，深入理解一门技术。

sofastack 包含的技术栈比较多，下面是一些建议的学习方式：

## sofastack 的项目应该如何由浅入深的学习？

以下是针对 SOFAStack 技术栈 的由浅入深学习路径，结合其项目特性和依赖关系，分为 4 个阶段，适合不同基础的学习者：

---

### 阶段 1️⃣：基础入门（微服务基础 + SOFABoot）
目标：掌握 SOFAStack 核心开发框架和基础组件。  
适用对象：熟悉 Java/Spring，了解微服务基础概念（如 RPC、注册中心）。  

#### 📚 学习内容：
1. SOFABoot  
   - 重点：对比 Spring Boot，学习模块化开发、类隔离机制、健康检查。  
   - 实践：创建一个多模块的 SOFABoot 项目，实现模块热部署。  
   - 资源：  
- [官方文档 - SOFABoot 快速开始](https://www.sofastack.tech/projects/sofa-boot/quick-start/)  
- 示例代码：[sofa-boot-samples](https://github.com/sofastack/sofa-boot-samples)  

2. SOFARPC  
   - 重点：理解 RPC 通信模型，配置服务提供者与消费者。  
   - 实践：用 SOFARPC 实现两个服务之间的接口调用。  
   - 资源：  
- [SOFARPC 官方示例](https://github.com/sofastack/sofa-rpc/tree/master/example)  
- 对比学习：Dubbo vs SOFARPC 的协议差异。  

---

### 阶段 2️⃣：进阶实战（服务治理 + 监控）
目标：掌握服务注册、链路追踪和监控告警能力。  
适用对象：已熟悉 SOFABoot 和 SOFARPC。  

#### 📚 学习内容：
1. SOFARegistry  
   - 重点：服务注册与发现机制，高可用配置。  
   - 实践：搭建 SOFARegistry 集群，模拟服务节点动态扩缩容。  
   - 资源：  
- [SOFARegistry 部署指南](https://www.sofastack.tech/projects/sofa-registry/deployment/)  

2. SOFATracer + SOFALookout  
   - 重点：全链路追踪与指标监控集成。  
   - 实践：  
- 在 SOFARPC 调用链中插入自定义埋点。  
- 通过 SOFALookout 配置 CPU/内存监控告警。  
   - 资源：  
- [SOFATracer 埋点示例](https://www.sofastack.tech/projects/sofa-tracer/log-usage/)  

---

### 阶段 3️⃣：高阶架构（分布式中间件 + Serverless）
目标：深入分布式事务、Service Mesh 和 Serverless 架构。  
适用对象：有分布式系统开发经验。  

#### 📚 学习内容：
1. Seata  
   - 重点：AT/TCC 模式实现跨服务事务一致性。  
   - 实践：在微服务场景下模拟订单-库存的分布式事务回滚。  
   - 资源：  
- [Seata 官方文档 - 场景案例](https://seata.io/zh-cn/docs/user/quickstart.html)  

2. SOFAMesh + MOSN  
   - 重点：Service Mesh 流量劫持与多协议转发。  
   - 实践：通过 MOSN 代理 HTTP/gRPC 流量，实现灰度发布。  
   - 资源：  
- [MOSN 与 Istio 集成教程](https://mosn.io/en/docs/quick-start/istio/)  

3. Serverless 框架（SOFAArk + Layotto）  
   - 重点：模块化热部署、多语言扩展（如 Rust 组件）。  
   - 实践：开发一个 Layotto 扩展组件，支持动态配置加载。  

---

### 阶段 4️⃣：生产级优化（性能调优 + 源码贡献）
目标：解决生产环境问题，参与社区共建。  
适用对象：有大规模微服务架构经验。  

#### 📚 学习内容：
1. 性能调优  
   - 方向：  
- SOFARPC 线程池优化  
- SOFARegistry 数据分片策略  
   - 工具：  
- Arthas 诊断 SOFABoot 应用  
- JProfiler 分析 SOFAJRaft 性能瓶颈  

2. 源码贡献  
   - 路径：  
1. 从 GitHub Issues 中认领 `good first issue` 标签任务。  
2. 参与 SOFADashboard 插件开发（如自定义监控面板）。  
   - 资源：  
- [SOFAStack 贡献指南](https://www.sofastack.tech/community/contribution/)  

# 参考资料

https://www.sofastack.tech/projects/

* any list
{:toc}
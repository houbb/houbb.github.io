---
layout: post
title:  分布式注册中心 nacos-22-NACOS 简介
date:  2022-07-02 09:22:02 +0800
categories: [Distributed]
tags: [distributed, register-center, sofa, sh]
published: true
---


# Nacos 起源

Nacos 在阿里巴巴起源于 2008 年五彩石项目（完成微服务拆分和业务中台建设），成长于十年双十一的洪峰考验，沉淀了简单易用、稳定可靠、性能卓越的核心竞争力。 

随着云计算兴起，2018 年我们深刻感受到开源软件行业的影响，因此决定将 Nacos（阿里内部 Configserver/Diamond/Vipserver 内核） 开源，输出阿里十年的沉淀，推动微服务行业发展，加速企业数字化转型！

![起源](https://cdn.nlark.com/yuque/0/2021/png/1465210/1639749084961-356f6f8f-2c74-4b5f-80fe-9c0207b07283.png#clientId=u929293d6-ee6b-4&from=paste&height=519&id=u2948009e&originHeight=800&originWidth=1086&originalType=binary&ratio=1&rotation=0&showTitle=false&size=616419&status=done&style=none&taskId=u24003c7b-d9eb-4f55-97ce-7946d4a28fe&title=&width=704.9861450195312)


## Nacos 定位

Nacos/nɑ

əʊs/ 是 Dynamic Naming and Configuration Service 的首字母简称；

一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。

官网：https://nacos.io/ 

仓库：https://github.com/alibaba/nacos

# Nacos 优势

**易用：**简单的数据模型，标准的 restfulAPI，易用的控制台，丰富的使用文档。

**稳定：**99.9% 高可用，脱胎于历经阿里巴巴 10 年生产验证的内部产品，支持具有数百万服务的大规模场景，具备企业级 SLA 的开源产品。

**实时：**数据变更毫秒级推送生效；1w 级，SLA 承诺 1w 实例上下线 1s，99.9% 推送完成；10w 级，SLA 承诺1w 实例上下线 3s，99.9% 推送完成；100w 级别，SLA 承诺 1w 实例上下线 9s 99.9% 推送完成。

**规模：**十万级服务/配置，百万级连接，具备强大扩展性。


# Nacos 生态

Nacos 几乎支持所有主流语言，其中 Java/Golang/Python 已经支持 Nacos 2.0 长链接协议，能最大限度发挥 Nacos 性能。

阿里微服务 DNS（Dubbo+Nacos+Spring-cloud-alibaba/Seata/Sentinel）最佳实践，是 Java 微服务生态最佳解决方案；

除此之外，Nacos 也对微服务生态活跃的技术做了无缝的支持，如目前比较流行的 Envoy、Dapr 等，能让用户更加标准获取微服务能力。

生态仓库：https://github.com/nacos-group

# Nacos 发展&规划

2018 年当我们决定做开源的时候，从 0.X 开始把阿里内部能力逐步抽象开源，在这个阶段虎牙作为 Nacos 最早用户开始使用，解决直播行业迅速发展的规模和高可用等问题，然后 Nacos 在视频和直播行业广泛使用。

2019 年当我们开放核心能力和竞争力之后，就开始与 Dubbo/Spring-cloud-alibaba 生态完成集成，随着云原生的大势迅速被互联网行业使用。与此同时我们完成了多语言生态和服务网格生态的布局。

2020 年 Nacos 迅速被成千上万家企业采用，并构建起强大的生态。 

但是随着用户深入使用，逐渐暴露一些性能问题，因此我们启动了 Nacos 2.0 的隔代产品设计，凭借 10 倍性能提升激发社区活力，进入国内开源项目活跃度 Top 10，并且成为行业首选。

未来为了 Nacos 2.0 代码更加清爽，性能更加卓越，我们将加速插件化和服务网格生态的进化速度，期望对此感兴趣小伙伴一起共建！！！

# 参考资料

https://nacos.io/docs/ebook/iez8a4/

* any list
{:toc}
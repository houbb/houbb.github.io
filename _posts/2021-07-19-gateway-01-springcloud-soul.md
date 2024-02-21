---
layout: post
title: 分布式网关-01-Spring cloud gateway Kong Soul
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, spring-cloud, gateway-topic, sh]
published: true
---

# Spring-cloud-gateway

[Spring-cloud-gateway](https://github.com/spring-cloud/spring-cloud-gateway) 提供了一个建立在Spring Ecosystem之上的API网关，包括：Spring 5，Spring Boot 2和Project Reactor。 

Spring Cloud Gateway旨在提供一种简单而有效的方式来路由到API，并为他们提供横切关注点，例如：安全性，监控/指标和弹性。

## 特性

Java 8

Spring Framework 5

动态路由

Spring Handler Mapping中内置的路由匹配

HTTP请求（路径，方法，标题，主机等）上的路由匹配

过滤器范围为匹配路径

过滤器可以修改下游HTTP请求和HTTP响应（添加/删除标头，添加/删除参数，重写路径，设置路径，Hystrix等...）

API或配置驱动

支持Spring Cloud DiscoveryClient配置路由

# Kong 

[Kong](https://github.com/kong/kong) 是一个云原生，快速，可扩展和分布式微服务抽象层（也称为API网关，API中间件或某些情况下的Service Mesh）。

作为2015年的开源项目，其核心价值在于高性能和可扩展性。

Kong积极维护，广泛应用于从创业公司到Global 5000以及政府组织等公司的生产。

## 特性

- Cloud-Native：平台不可知，Kong可以从裸机运行到Kubernetes。

- 动态负载平衡：跨多个上游服务负载均衡流量。

- 基于散列的负载平衡：使用一致的散列/粘性会话进行负载平衡。

- 断路器：智能跟踪不健康的上游服务。

- 运行状况检查：上游服务的主动和被动监控。

- 服务发现：在Consul等第三方DNS解析器中解析SRV记录。

- 无服务器：直接从Kong调用并保护AWS Lambda或OpenWhisk功能。

- WebSockets：通过WebSockets与您的上游服务进行通信。

- OAuth2.0：轻松将OAuth2.0身份验证添加到API。

- 日志记录：通过HTTP，TCP，UDP或磁盘记录对系统的请求和响应。

- 安全性：ACL，Bot检测，白名单/黑名单IP等......

- Syslog：登录系统日志。

- SSL：为基础服务或API设置特定SSL证书。

- 监控：实时监控提供关键负载和性能服务器指标。

- 转发代理：使Kong连接到中间透明HTTP代理。

- 身份验证：HMAC，JWT，Basic等。

- 速率限制：基于许多变量阻止和限制请求。

- 转换：添加，删除或操作HTTP请求和响应。

- 缓存：在代理层缓存并提供响应。

- CLI：从命令行控制您的Kong集群。

- REST API：Kong可以使用其RESTful API进行操作，以获得最大的灵活性。

- 地理复制：配置始终是不同地区的最新信息。

- 故障检测和恢复：如果您的某个Cassandra节点发生故障，Kong不会受到影响。

- 群集：所有Kong节点自动加入群集，使其配置在节点之间更新。

- 可扩展性：通过自然分布，Kong通过简单地添加节点来水平扩展。

- 性能：Kong通过扩展和核心使用NGINX轻松处理负载。

- 插件：可扩展的体系结构，用于为Kong和API添加功能。


# Soul

[Soul](https://github.com/Dromara/soul) 是一个异步的,高性能的,跨语言的,响应式的API网关。

我希望能够有一样东西像灵魂一样，保护您的微服务。

参考了Kong，Spring-Cloud-Gateway等优秀的网关后，站在巨人的肩膀上，Soul由此诞生！

## 特性

支持各种语言,无缝集成Dubbo,SpringCloud。

丰富的插件支持，鉴权，限流，熔断，防火墙等等。

网关多种规则动态配置，支持各种策略配置。

插件热插拔,易扩展。

支持集群部署，支持A/B Test。

# 个人感受

类似的框架可以有千万种，但是技术的本质却是类似的。

应该直接学习其原理，然后手写一个。

吸取各种框架的优势。

# 参考资料

https://github.com/Dromara/soul

https://github.com/kong/kong

https://github.com/spring-cloud/spring-cloud-gateway

* any list
{:toc}
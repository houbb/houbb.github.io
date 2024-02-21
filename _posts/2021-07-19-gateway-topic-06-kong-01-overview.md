---
layout: post
title: 分布式网关 Kong-01-overview
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

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
---
layout: post
title: 开源网关对比 gateway
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# 常见的API网关主要提供以下的功能：

- 反向代理和路由：大多数项目采用网关的解决方案的最主要的原因。给出了访问后端 API 的所有客户端的单一入口，并隐藏内部服务部署的细节。

- 负载均衡：网关可以将单个传入的请求路由到多个后端目的地。

- 身份验证和授权：网关应该能够成功进行身份验证并仅允许可信客户端访问 API，并且还能够使用类似 RBAC 等方式来授权。

- IP 列表白名单/黑名单：允许或阻止某些 IP 地址通过。

- 性能分析：提供一种记录与 API 调用相关的使用和其他有用度量的方法。

- 限速和流控：控制 API 调用的能力。

- 请求变形：在进一步转发之前，能够在转发之前转换请求和响应(包括 Header 和 Body)。

- 版本控制：同时使用不同版本的 API 选项或可能以金丝雀发布或蓝/绿部署的形式提供慢速推出 API。

- 断路器：微服务架构模式有用，以避免使用中断。

- 多协议支持：WebSocket/GRPC。

- 缓存：减少网络带宽和往返时间消耗，如果可以缓存频繁要求的数据，则可以提高性能和响应时间

- API 文档：如果计划将 API 暴露给组织以外的开发人员，那么必须考虑使用 API 文档，例如 Swagger 或 OpenAPI。

# 不同技术栈的区分

我们从不同的技术栈来做个api网关分类

## openresty+lua开源api网关

代表有Kong、APISIX、3scale、、API Umbrella

Kong不用做太多介绍，应该是开源里面最热的一个api网关了，相对庞大复杂

APISIX，轻巧+极致性能+热插件，值得一提到是插件中有个serverless的支持，简单说就是写一段自定义lua脚本，挂载到openresty任意阶段执行！

## golang开源api网关

代表有Tky、Manba、GOKU API Gateway、Ambassador(基于Envoy)、Gloo(基于Envoy)、KrakenD、BFE

## java开源api网关

代表有Gravitee、Zuul、Sentinel、MuleSoft、WSO2、Soul

## Erlang开源api网关

代表有RIG – Reactive Interaction Gateway

## .net开源api网关

代表有Ocelot

## Node.js开源api网关

代表有express-gateway



# Nginx

Nginx 是异步框架的网页服务器，也可以用作反向代理、负载平衡器和 HTTP 缓存。

该软件由伊戈尔·赛索耶夫创建并于 2004 年首次公开发布。2011 年成立同名公司以提供支持。2019 年 3 月 11 日，Nginx 公司被 F5 Networks 以 6.7 亿美元收购。

Nginx 有以下的特点：

- 由 C 编写，占用的资源和内存低，性能高。

- 单进程多线程，当启动 Nginx 服务器，会生成一个 master 进程，master 进程会 fork 出多个 worker 进程，由 worker 线程处理客户端的请求。

- 支持反向代理，支持 7 层负载均衡(拓展负载均衡的好处)。

- 高并发，Nginx 是异步非阻塞型处理请求，采用的 epollandqueue 模式。

- 处理静态文件速度快。

- 高度模块化，配置简单。社区活跃，各种高性能模块出品迅速。

# Kong

Kong 是基于 NGINX 和 OpenResty 的开源 API 网关。

Kong 的总体基础结构由三个主要部分组成：NGINX 提供协议实现和工作进程管理，OpenResty 提供 Lua 集成并挂钩到 NGINX 的请求处理阶段。

而 Kong 本身利用这些挂钩来路由和转换请求。数据库支持 Cassandra 或 Postgres 存储所有配置。

# APISIX

Apache APISIX 是一个动态、实时、高性能的 API 网关， 提供负载均衡、动态上游、灰度发布、服务熔断、身份认证、可观测性等丰富的流量管理功能。

APISIX 于 2019 年 4 月由中国的支流科技创建，于 6 月开源，并于同年 10 月进入 Apache 孵化器。

支流科技对应的商业化产品的名字叫 API7 。APISIX 旨在处理大量请求，并具有较低的二次开发门槛。

APISIX 的主要功能和特点有：

- 云原生设计，轻巧且易于容器化。

- 集成了统计和监视组件，例如 Prometheus，Apache Skywalking 和 Zipkin。

- 支持 gRPC，Dubbo，WebSocket，MQTT 等代理协议，以及从 HTTP 到 gRPC 的协议转码，以适应各种情况。

- 担当 OpenID 依赖方的角色，与 Auth0，Okta 和其他身份验证提供程序的服务连接。

- 通过在运行时动态执行用户功能来支持无服务器，从而使网关的边缘节点更加灵活。

- 支持插件热加载。

- 不锁定用户，支持混合云部署架构。

- 网关节点无状态，可以灵活扩展。

从这个角度来看，API 网关可以替代 Nginx 来处理南北流量，也可以扮演 Istio 控制平面和 Envoy 数据平面的角色来处理东西向流量。

# Tyk

Tyk 是一款基于 Golang 和 Redis 构建的开源 API 网关。它于 2014 年创建，比 AWS 的 API 网关即服务功能早。Tyk 用 Golang 编写，并使用 Golang 自己的 HTTP 服务器。

Tyk 支持不同的运行方式：云，混合(在自己的基础架构中为 GW)和本地。

# Zuul

Zuul 是 Netflix 开源的基于 Java 的 API 网关组件。

![Zuul](https://s6.51cto.com/oss/202107/25/322f5362e07c56f8a7270ce9e683d0cc.jpg)

# Gravitee

Gravitee 是 Gravitee.io 开源的，基于 Java 的，简单易用，性能高，且具成本效益的开源 API 平台，可帮助组织保护，发布和分析您的 API。

# 总结

本文分析了几种开源 API 网关的架构和基本功能，为大家在架构选型的时候提供一些基本的参考信息，本文做作的测试数据比较简单，场景也比较单一，不能作为实际选型的依据。

Nginx：基于 C 开发的高性能 API 网关，拥有众多的插件，如果你的 API 管理的需求比较简单，接受手工配置路由，Nginx 是个不错的选择。

Kong：是基于 Nginx 的 API 网关，使用 OpenResty 和 Lua 扩展，后台使用 PostgreSQL，功能众多，社区的热度很高，但是性能上看比起 Nginx 有相当的损失。如果你对功能和扩展性有要求，可以考虑 Kong。

APISIX：和 Kong 的架构类似，但是采用了云原生的设计，使用 ETCD 作为后台，性能上比起 Kong 有相当的优势，适合对性能要求高的云原生部署的场景。特别提一下，APISIX 支持 MQTT 协议，对于构建 IOT 应用非常友好。

Tyk：使用 Golang 开发，后台使用 Redis，性能不错，如果你喜欢 Golang，可以考虑一下。

要注意的是 Tyk 的开源协议是 MPL，是属于修改代码后不能闭源，对于商业化应用不是很友好。

Zuul：是 Netflix 开源的基于 Java 的 API 网关组件，他并不是一款开箱即用的 API 网关，需要和你的 Java 应用一起构建，所有的功能都是通过集成其他组件的方式来使用。

适合对于 Java 比较熟悉，用 Java 构建的应用的场景，缺点是性能其他的开源产品要差一些，同样的性能条件下，对于资源的要求会更多。

Gravitee：是 Gravitee.io 开源的基于 Java 的 API 管理平台，它能对 API 的生命周期进行管理，即使是开源版本，也有很好的 UI 支持。

但是因为采用了 Java 构建，性能同样是短板，适合对于 API 管理有强烈需求的场景。

# 个人感受

类似的框架可以有千万种，但是技术的本质却是类似的。

应该直接学习其原理，然后手写一个。

吸取各种框架的优势。

# 参考资料

https://network.51cto.com/article/674451.html

https://segmentfault.com/a/1190000021541335

* any list
{:toc}
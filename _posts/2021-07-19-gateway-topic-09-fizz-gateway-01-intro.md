---
layout: post
title: fizz gateway 网关入门介绍
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# FizzGate是什么？

An Aggregation API Gateway in Java . 

FizzGate 是一个基于 Java开发的微服务聚合网关，是拥有自主知识产权的应用网关国产化替代方案，能够实现热服务编排聚合、自动授权选择、线上服务脚本编码、在线测试、高性能路由、API审核管理、回调管理等目的，拥有强大的自定义插件系统可以自行扩展，并且提供友好的图形化配置界面，能够快速帮助企业进行API服务治理、减少中间层胶水代码以及降低编码投入、提高 API 服务的稳定性和安全性。

## 产品特性

- 应用管理：支持对接入的应用进行管理；

- API管理：支持API定义后端服务的配置；

- 分组管理：支持通过分组管理实现同一分组的API使用相关的配置；

- 服务鉴权：通过插件可对服务进行应用访问权限、检验等链式的拦截策略；

- 集群管理：FizzGate网关节点是无状态的，配置信息自动同步，支持节点水平拓展和多集群部署。

- 安全授权：支持内置的key-auth, JWT, basic-auth授权方式，并且可以方便控制。

- 服务编排：支持HTTP、Dubbo、gRPC、Soap协议热服务编排能力，支持前后端编码，支持JSON/XML输出，随时随地更新API。

- 负载均衡：支持round-robin负载均衡。

- 策略熔断：根据服务或者具体地址进行多种恢复策略熔断配置。

- 多注册中心：支持从Eureka或Nacos注册中心进行服务发现。

- 配置中心：支持接入apollo配置中心。

- HTTP反向代理：隐藏真实后端服务，支持 Rest API反向代理。

- 访问策略：支持不同策略访问不同的API、配置不同的鉴权等。

- 黑白名单：支持配置通过绑定黑、白名单限制访问。

- 自定义插件：强大的插件机制支持自由扩展。

- 可扩展：简单易用的插件机制方便扩展功能。

- 高性能：性能在众多网关之中表现优异。

- 版本控制：支持操作的发布和多次回滚。

- 管理后台：通过管理后台界面对网关集群进行各项配置。

- 回调管理：支持回调的管理、订阅、重放、以及日志。

- 多级限流：细颗粒度的限流方式包含服务限流，接口限流，APP_ID限流，IP限流。

- 微服务文档：企业级管理开放微服务文档管理，系统集成更方便。

- 公网专线：建立公网中受到完全保护的私有连接通道。


# FizzGate 的设计

![FizzGate](https://user-images.githubusercontent.com/184315/97130741-33a90d80-177d-11eb-8680-f589a36e44b3.png)

# FizzGate 典型应用场景

![典型应用场景](https://user-images.githubusercontent.com/6129661/216249866-71eb54de-d2e8-44ce-8e70-a1ca1f51553d.png)


# 参考资料

https://github.com/fizzgate/fizz-gateway-node

* any list
{:toc}
---
layout: post
title: Apache Apisix API 网关，用来处理路由、认证、IP 访问限制等。
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# 介绍

Apache APISIX是一个动态的、实时的、高性能的API网关。

APISIX API网关提供了丰富的流量管理功能，如负载均衡、动态上游、金丝雀发布、断路器、身份验证、可观测性等等。

您可以使用APISIX API网关处理传统的南北流量，以及服务之间的东西流量。它还可以作为k8s入口控制器使用。

Apache APISIX的技术架构：

![struct](https://github.com/apache/apisix/blob/master/docs/assets/images/apisix.png?raw=true)

# 特点

您可以将APISIX API网关用作流量入口，处理所有业务数据，包括动态路由、动态上游、动态证书、A/B测试、金丝雀发布、蓝绿部署、限流、防御恶意攻击、指标、监控警报、服务可观察性、服务治理等。

## 所有平台 All platforms

云原生：与平台无关，无供应商锁定，APISIX API网关可以从裸金属运行到Kubernetes。
支持ARM64：不必担心基础技术的锁定。

## 多协议 Multi protocols

TCP/UDP代理：动态TCP/UDP代理。
Dubbo代理：动态HTTP到Dubbo代理。
动态MQTT代理：支持通过client_id负载均衡MQTT，都支持MQTT 3.1.*, 5.0。
gRPC代理：代理gRPC流量。
gRPC Web代理：将gRPC Web流量代理到gRPC服务。
gRPC转码：支持协议转码，以便客户端可以使用HTTP/JSON访问您的gRPC API。
代理WebSocket
代理协议
HTTP(S)转发代理
SSL：动态加载SSL证书。

## 完全动态 Full Dynamic

热更新和热插件：连续更新其配置和插件，无需重新启动！
代理重写：支持在将请求发送到上游之前重写请求的主机、URI、模式、方法、标头。
响应重写：将自定义响应状态代码、主体和标头设置给客户端。
动态负载均衡：轮询负载均衡，带有权重。
基于哈希的负载均衡：使用一致性哈希会话进行负载均衡。
健康检查：启用上游节点的健康检查，并在负载均衡过程中自动过滤不健康的节点，以确保系统稳定性。
断路器：智能跟踪不健康的上游服务。
代理镜像：提供镜像客户端请求的能力。
流量分流：允许用户在各种上游之间逐渐分配流量百分比。

## 细粒度路由 Fine-grained routing

支持完整路径匹配和前缀匹配
支持将所有Nginx内置变量作为路由条件，因此您可以使用cookie、args等作为路由条件来实现金丝雀发布、A/B测试等。
支持各种操作符作为路由判断条件，例如{"arg_age", ">", 24}
支持自定义路由匹配函数
IPv6：使用IPv6来匹配路由。
支持TTL
支持优先级
支持批量HTTP请求
支持根据GraphQL属性过滤路由

## 安全性

丰富的认证和授权支持：
- key-auth
- JWT
- basic-auth
- wolf-rbac
- casbin
- keycloak
- casdoor
IP白名单/黑名单
Referer白名单/黑名单
IdP：支持外部身份平台，如Auth0、okta等。
Limit-req
Limit-count
Limit-concurrency
Anti-ReDoS（正则表达式拒绝服务）：内置策略用于无需配置即可防止ReDoS。
CORS启用CORS（跨域资源共享）为您的API。
URI阻断器：通过URI阻止客户端请求。
请求验证器
CSRF基于双重提交Cookie方式，保护您的API免受CSRF攻击。

## 运维友好

Zipkin跟踪：Zipkin
开源APM：支持Apache SkyWalking
与外部服务发现配合使用：除了内置的etcd外，还支持Consul、Consul_kv、Nacos、Eureka和Zookeeper（CP）。
监控与指标：Prometheus
集群：APISIX节点是无状态的，创建配置中心的集群，请参考etcd集群指南。
高可用性：支持在同一集群中配置多个etcd地址。
仪表板
版本控制：支持操作回滚。
CLI：通过命令行启动\停止\重新加载APISIX。
独立运行：支持从本地YAML文件加载路由规则，更加友好，例如在kubernetes（k8s）下。
全局规则：允许为所有请求运行任何插件，例如：限速、IP过滤等。
高性能：单核QPS达到18k，平均延迟小于0.2毫秒。
故障注入
REST管理API：使用REST管理API来控制Apache APISIX，默认只允许127.0.0.1访问，您可以修改conf/config.yaml中的allow_admin字段来指定允许调用管理API的IP列表。此外，注意管理API使用密钥验证来验证调用者的身份。在部署之前，需要修改conf/config.yaml中的admin_key字段以确保安全性。
外部日志记录器：将访问日志导出到外部日志管理工具。（HTTP记录器、TCP记录器、Kafka记录器、UDP记录器、RocketMQ记录器、SkyWalking记录器、阿里云日志服务（SLS）、谷歌云日志、Splunk HEC日志、文件记录器、SolarWinds Loggly日志、腾讯云CLS）。
ClickHouse：将日志推送到ClickHouse。
Elasticsearch：将日志推送到Elasticsearch。
Datadog：将自定义指标推送到DogStatsD服务器，与Datadog代理捆绑在一起，通过UDP协议传输。DogStatsD基本上是StatsD协议的一个实现，用于收集Apache APISIX代理的自定义指标，将其聚合为单个数据点，并将其发送到配置的Datadog服务器。
Helm图表
HashiCorp Vault：支持密钥管理解决方案，以从Vault安全存储中访问密钥，后者在低信任环境中受支持。目前，RS256密钥（公钥-私钥对）或秘密密钥可以通过APISIX Secret资源链接到jwt-auth认证插件中的vault。

## 高度可扩展

自定义插件：允许挂接常见阶段，如重写、访问、头部过滤器、主体过滤器和日志，还允许挂接负载均衡器阶段。
插件可以用Java/Go/Python编写
插件可以用Proxy Wasm SDK编写
自定义负载均衡算法：您可以在负载均衡器阶段使用自定义负载均衡算法。
自定义路由：支持用户自行实现路由算法。

## 多语言支持

Apache APISIX是一个多语言网关，用于插件开发，并通过RPC和Wasm提供支持。

![多语言支持](https://github.com/apache/apisix/blob/master/docs/assets/images/external-plugin.png?raw=true)

RPC方式是当前的方式。开发者可以根据自己的需要选择语言，并在使用RPC启动独立进程后，通过本地RPC通信与APISIX交换数据。到目前为止，APISIX已支持Java、Golang、Python和Node.js。

Wasm或WebAssembly是一种实验性的方式。APISIX可以通过使用Proxy Wasm SDK编写的APISIX wasm插件加载和运行Wasm字节码。开发者只需根据SDK编写代码，然后将其编译为在Wasm VM上运行的Wasm字节码，以与APISIX一起使用。

## 无服务器 Serverless

Lua函数：在APISIX的每个阶段调用函数。
AWS Lambda：与AWS Lambda函数集成，作为动态上游将特定URI的所有请求代理到AWS API网关端点。支持通过API密钥和AWS IAM访问密钥进行授权。
Azure Functions：与Azure Serverless Function无缝集成，作为动态上游将特定URI的所有请求代理到Microsoft Azure云。
Apache OpenWhisk：与Apache OpenWhisk无缝集成，作为动态上游将特定URI的所有请求代理到您自己的OpenWhisk集群。

# 参考资料

https://github.com/apache/apisix

* any list
{:toc}
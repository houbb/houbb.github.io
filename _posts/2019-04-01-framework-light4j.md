---
layout: post
title: Ligh4j 比 SpringBoot 快几十倍的框架
date:  2019-4-1 19:24:57 +0800
categories: [Framework]
tags: [framework, sh]
published: true
---

# Ligh4j

[light-4j](https://www.networknt.com/faq/what-is-light-4j/) is a platform or ecosystem for building and running cloud native microservices. 

The design goal is higher throughput, lower latency and smaller memory footprint to lower production cost.

# 特性

## 跨领域的问题

所有light-4j框架都构建在嵌入式网关之上，以解决请求/响应链中云本机服务的跨领域问题。这些插件或中间件处理程序在服务器启动期间与IoC服务连接，可以通过配置启用或禁用或更改行为。其中一个设计目标是允许开发人员只编写业务逻辑。

## 互动风格

在微服务架构中，服务需要相互交互，并且有几个框架可以帮助构建具有特定交互风格的服务。

同步（HTTP上的请求/响应）：

light-rest-4j  - 构建restful API并支持Swagger 2.0和OpenAPI 3.0规范

light-graphql-4j  - 使用IDL生成GraphQL服务

light-hybrid-4j  -  RPC和无服务器框架，利用单片和微服务。

## 异步（事件驱动）：

light-tram-4j  - 交易消息传递，确保传递消息，事件或命令。

light-eventuate-4j  - 事件采购和CQRS框架

light-saga-4j  - 跨微服务的分布式事务编排。

## 基建服务

要支持微服务，必须首先实现初始基础结构服务。这包括：

light-oauth2  - 作为微服务实现的OAuth 2.0提供程序。

light-portal  -  API管理门户和市场（正在进行中）

ELK  - 集中日志记录

InfluxDB和Grafana  - 集中指标

Consul  - 服务注册和发现

Kafka和Zookeeper  -  Message Broker

## 工具链

light-codegen  - 所有框架的代码生成器。

openapi-parser  - 轻量级和快速的OpenAPI 3.0解析器和验证器

swagger-bundler  - 将多个swagger文件捆绑在一起并验证最终结果。

light-bot  - 用于微服务的Devops管道。

# 快速开始

TODO...

# 个人收获

1. 新的技术和框架是层出不穷的，掌握最基础的原理才最重要。会使用某一个框架，无论使用的多熟练，有一天没有这个框架了，就没有什么意义。
但是基础知识和思想是公用的。比如以前的 structs2, hibernate。

2. 如果自己想推出一个框架，那么一定要与时俱进，生态非常重要。良好的生态，让其难以被替代。

3. 一些框架的知识正在被各种云框架和云平台做掉，我们能做的第一个是学习原理。然后能否成为这个工具链的制造者呢？

# 参考资料

[What is light-4j](https://www.networknt.com/faq/what-is-light-4j/)


* any list
{:toc}
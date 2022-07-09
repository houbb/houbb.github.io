---
layout: post
title: SOFATracer 介绍-01-overview
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, tracer, sh]
published: true
---

# SOFATracer 

SOFATracer 是蚂蚁金服开发的基于 [OpenTracing 规范](https://opentracing.io/specification/) 的分布式链路跟踪系统，其核心理念就是通过一个全局的 TraceId 将分布在各个服务节点上的同一次请求串联起来。

通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来同时也提供远程汇报到 Zipkin 进行展示的能力，以此达到透视化网络调用的目的。

# 功能描述

## 基于 OpenTracing 规范提供分布式链路跟踪解决方案

基于 OpenTracing 规范 并扩展其能力提供链路跟踪的解决方案。

各个框架或者组件可以基于此实现，通过在各个组件中埋点的方式来提供链路跟踪的能力。

## 提供异步落地磁盘的日志打印能力

基于 Disruptor 高性能无锁循环队列，提供异步打印日志到本地磁盘的能力。

框架或者组件能够在接入时，在异步日志打印的前提下可以自定义日志文件的输出格式。

SOFATracer 提供两种类似的日志打印类型即摘要日志和统计日志，摘要日志：每一次调用均会落地磁盘的日志；统计日志：每隔一定时间间隔进行统计输出的日志。

## 支持日志自清除和滚动能力

异步落地磁盘的 SOFATracer 日志支持自清除和滚动能力，支持按照按照天清除和按照小时或者天滚动的能力

## 基于 SLF4J MDC 的扩展能力

SLF4J 提供了 MDC（Mapped Diagnostic Contexts）功能，可以支持用户定义和修改日志的输出格式以及内容。

SOFATracer 集成了 SLF4J MDC 功能，方便用户在只简单修改日志配置文件即可输出当前 Tracer 上下文的 TraceId 和 SpanId。

## 界面展示能力

SOFATracer 可以将链路跟踪数据远程上报到开源产品 Zipkin 做分布式链路跟踪的展示。

## 统一配置能力

配置文件中提供丰富的配置能力以定制化应用的个性需求。

# 应用场景

解决在实施大规模微服务架构时的链路跟踪问题，达到透视化网络调用的目的，并可用于故障的快速发现，服务治理等。

## 组件埋点

目前 SOFATracer 支持 Spring MVC、标准 JDBC 接口实现的数据库连接池(DBCP、Druid、c3p0、tomcat、HikariCP、BoneCP)、HttpClient、Dubbo、Spring Cloud OpenFeign 等开源组件，其他开源组件（如 MQ、Redis）埋点支持在开发中。

# 基础术语

| 名词	| 说明 |
|:---:---||
| TraceId	| TraceId 指的是 SOFATracer 中代表唯一一次请求的 ID，此 ID 一般由集群中第一个处理请求的系统产生，并在分布式调用下通过网络传递到下一个被请求系统。 |
| SpanId	| SpanId 代表了本次请求在整个调用链路中的位置或者说层次，比如 A 系统在处理一个请求的过程中依次调用了 B，C，D 三个系统，那么这三次调用的的 SpanId 分别是：0.1，0.2，0.3。如果 B 系统继续调用了 E，F 两个系统，那么这两次调用的SpanId 分别是：0.1.1，0.1.2。 |

> [opentracing 规范](https://opentracing.io/specification/)

# TraceId 和 SpanId 生成规则

## TraceId 生成规则

SOFATracer 通过 TraceId 来将一个请求在各个服务器上的调用日志串联起来，TraceId 一般由接收请求经过的第一个服务器产生，产生规则是： 服务器 IP + 产生 ID 时候的时间 + 自增序列 + 当前进程号 ，比如：

```
0ad1348f1403169275002100356696
```

前 8 位 0ad1348f 即产生 TraceId 的机器的 IP，这是一个十六进制的数字，每两位代表 IP 中的一段，我们把这个数字，按每两位转成 10 进制即可得到常见的 IP 地址表示方式 10.209.52.143，大家也可以根据这个规律来查找到请求经过的第一个服务器。 

后面的 13 位 1403169275002 是产生 TraceId 的时间。 

之后的 4 位 1003 是一个自增的序列，从 1000 涨到 9000，到达 9000 后回到 1000 再开始往上涨。 

最后的 5 位 56696 是当前的进程 ID，为了防止单机多进程出现 TraceId 冲突的情况，所以在 TraceId 末尾添加了当前的进程 ID。

TraceId 目前的生成的规则参考了阿里的鹰眼组件。

## SpanId 生成规则

SOFATracer 中的 SpanId 代表本次调用在整个调用链路树中的位置，假设一个 Web 系统 A 接收了一次用户请求，那么在这个系统的 SOFATracer MVC 日志中，记录下的 SpanId 是 0，代表是整个调用的根节点，如果 A 系统处理这次请求，需要通过 RPC 依次调用 B，C，D 三个系统，那么在 A 系统的 SOFATracer RPC 客户端日志中，SpanId 分别是 0.1，0.2 和 0.3，在 B，C，D 三个系统的 SOFATracer RPC 服务端日志中，SpanId 也分别是 0.1，0.2 和 0.3；如果 C 系统在处理请求的时候又调用了 E，F 两个系统，那么 C 系统中对应的 SOFATracer RPC 客户端日志是 0.2.1 和 0.2.2，E，F 两个系统对应的 SOFATracer RPC 服务端日志也是 0.2.1 和 0.2.2。

根据上面的描述，我们可以知道，如果把一次调用中所有的 SpanId 收集起来，可以组成一棵完整的链路树。

我们假设一次分布式调用中产生的 TraceId 是 0a1234（实际不会这么短），那么根据上文 SpanId 的产生过程，有下图：

![生成规则](https://gw.alipayobjects.com/mdn/rms_432828/afts/img/A*qo08QLrjv-QAAAAAAAAAAABjARQnAQ)

> SpanId 目前的生成的规则参考了阿里的鹰眼组件。

# 小结

埋点是一种思想。

（1）如何提供监控？

（2）如何无感埋点？

（3）如何提升性能？




# 参考资料

https://www.sofastack.tech/projects/sofa-tracer/overview/

* any list
{:toc}
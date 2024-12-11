---
layout: post
title: 开源分布式系统追踪 02-pinpoint-01-入门介绍
date:  2023-07-25 08:00:00 +0800
categories: [Trace]
tags: [trace, distributed, opensource, apm, sh]
published: true
---

# 分布式跟踪系列

## CAT

[cat monitor 分布式监控 CAT-是什么？](https://houbb.github.io/2023/09/19/cat-monitor-01-overview)

[cat monitor-02-分布式监控 CAT埋点](https://houbb.github.io/2023/09/19/cat-monitor-02-event-tracking)

[cat monitor-03-深度剖析开源分布式监控CAT](https://houbb.github.io/2023/09/19/cat-monitor-03-depth)

[cat monitor-04-cat 服务端部署实战](https://houbb.github.io/2023/09/19/cat-monitor-04-server-deploy-in-action)

[cat monitor-05-cat 客户端集成实战](https://houbb.github.io/2023/09/19/cat-monitor-05-client-intergration-in-action)

[cat monitor-06-cat 消息存储](https://houbb.github.io/2023/09/19/cat-monitor-06-message-store)

## skywalking

[监控-skywalking-01-APM 监控入门介绍](https://houbb.github.io/2019/04/01/monitor-skyworking-01-overview)

[监控-skywalking-02-深入学习 skywalking 的实现原理的一些问题](https://houbb.github.io/2019/04/01/monitor-skyworking-02-chat)

[监控-skywalking-03-深入浅出介绍全链路跟踪](https://houbb.github.io/2019/04/01/monitor-skyworking-03-intro)

[监控-skywalking-04-字节码增强原理](https://houbb.github.io/2019/04/01/monitor-skyworking-04-why)

[监控-skywalking-05-in action 实战笔记](https://houbb.github.io/2019/04/01/monitor-skyworking-05-in-action)

[监控-skywalking-06-SkyWalking on the way 全链路追踪系统的建设与实践](https://houbb.github.io/2019/04/01/monitor-skyworking-06-summary)

## 其他

[开源分布式系统追踪-00-overview](https://houbb.github.io/2023/07/25/distributed-trace-opensource-00-overview)

[开源分布式系统追踪-01-Zipkin-01-入门介绍](https://houbb.github.io/2023/07/25/distributed-trace-opensource-01-zipkin-01-intro)

[开源分布式系统追踪 02-pinpoint-01-入门介绍](https://houbb.github.io/2023/07/25/distributed-trace-opensource-02-pinpoint-01-intro)

[开源分布式系统追踪-03-CNCF jaeger-01-入门介绍](https://houbb.github.io/2023/07/25/distributed-trace-opensource-03-cncf-jaeger)

# Pinpoint

## 最新版本 (2024/10/23)

我们很高兴地宣布发布 Pinpoint v3.0.1。

请查看发布说明：[v3.0.1](https://github.com/pinpoint-apm/pinpoint/releases/tag/v3.0.1)。

当前稳定版本是 [v3.0.1](https://github.com/pinpoint-apm/pinpoint/releases/tag/v3.0.1)。

## 在线演示

通过我们的[演示](http://223.130.142.103:8080/main/ApiGateway@SPRING_BOOT/5m?inbound=1&outbound=4&wasOnly=false&bidirectional=false)快速了解 Pinpoint！

## PHP, PYTHON

Pinpoint 还支持用 PHP、Python 编写的应用程序。[查看我们的代理仓库](https://github.com/pinpoint-apm/pinpoint-c-agent)。

## 关于 Pinpoint

**Pinpoint** 是一个为大规模分布式系统提供应用性能管理（APM）工具，支持 Java / [PHP](https://github.com/pinpoint-apm/pinpoint-c-agent)/[PYTHON](https://github.com/pinpoint-apm/pinpoint-c-agent) 编写的应用程序。
受 [Dapper](http://research.google.com/pubs/pub36356.html "Google Dapper") 启发，Pinpoint 提供了解决方案，帮助分析系统的整体结构以及其组件如何通过跨分布式应用程序追踪事务而相互连接。

如果您希望：

* 一眼了解您的 *[应用程序拓扑结构](https://pinpoint-apm.gitbook.io/pinpoint/want-a-quick-tour/overview)*
* 实时监控应用程序
* 获得每个事务的 *代码级可视化*
* 安装 APM 代理 *无需更改任何代码*
* 对性能影响最小（资源使用大约增加 3%）

您绝对应该试试 **Pinpoint**！

## 快速入门
* [快速入门指南](https://pinpoint-apm.gitbook.io/pinpoint/getting-started/quickstart) 适用于简单的 Pinpoint 测试运行
* [安装指南](https://pinpoint-apm.gitbook.io/pinpoint/getting-started/installation) 提供更多详细说明。

## 概述
如今，服务通常由多个不同的组件组成，这些组件相互通信并向外部服务发起 API 调用。每个事务如何执行往往被视为黑箱。Pinpoint 追踪这些组件之间的事务流，并提供清晰的视图，帮助识别问题区域和潜在的瓶颈。
若想更深入了解，请查看我们的 *[Pinpoint 简介](https://pinpoint-apm.gitbook.io/pinpoint/#want-a-quick-tour)* 视频。

* **ServerMap** - 通过可视化各个组件的连接方式，了解任何分布式系统的拓扑结构。点击一个节点可以查看该组件的详细信息，例如其当前状态和事务数量。
* **实时活动线程图** - 实时监控应用程序内的活动线程。
* **请求/响应散点图** - 可视化请求数量和响应模式，帮助识别潜在问题。通过 **拖动图表** 可以选择事务并查看详细信息。

  ![Server Map](https://github.com/pinpoint-apm/pinpoint/raw/master/doc/images/ss_server-map.png)

* **调用栈** - 在分布式环境中，获得每个事务的代码级可视化，帮助识别瓶颈和故障点。

  ![Call Stack](https://github.com/pinpoint-apm/pinpoint/raw/master/doc/images/ss_call-stack.png)

* **Inspector** - 查看应用程序的其他详细信息，如 CPU 使用率、内存/垃圾回收、TPS 和 JVM 参数。

  ![Inspector](https://github.com/pinpoint-apm/pinpoint/raw/master/doc/images/ss_inspector.png)

* **URI 指标**
  ![URI-Metric](https://github.com/pinpoint-apm/pinpoint/raw/master/doc/images/ss-uri-metric.png)

* **基础设施**

  ![Infrastructure](https://github.com/pinpoint-apm/pinpoint/raw/master/doc/images/ss-Infrastructure-metric.png)

* **错误分析**

  ![Error-Analysis 1](https://github.com/pinpoint-apm/pinpoint/raw/master/doc/images/ss_error-analysis1.png)

  ![Error-Analysis 2](https://github.com/pinpoint-apm/pinpoint/raw/master/doc/images/ss_error-analysis3.gif)

## 支持的模块
* JDK 8+
* [Tomcat](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/tomcat)、[Jetty](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/jetty)、[JBoss EAP](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/jboss)、[Resin](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/resin)、[Websphere](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/websphere)、[Vertx](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/vertx)、[Weblogic](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/weblogic)、[Undertow](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/undertow)、[Akka HTTP](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/akka-http)

* [Spring](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/spring)、[Spring Boot](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/spring-boot) ([嵌入式 Tomcat](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/tomcat)、[Jetty](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/jetty)、[Undertow](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/undertow)、[Reactor Netty](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/reactor-netty))、[Spring WebFlux](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/spring-webflux)

* Apache HttpClient [3](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/httpclient3) / [4](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/httpclient4) / [5](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/httpclient5)、[JDK HttpConnector](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/jdk-http)、[GoogleHttpClient](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/google-httpclient)、[OkHttpClient](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/okhttp)、[NingAsyncHttpClient](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/ning-asynchttpclient)

* [Thrift](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/thrift)、[DUBBO](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/dubbo)、[GRPC](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/grpc)、[Apache CXF](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/cxf)

* [ActiveMQ](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/activemq-client)、[RabbitMQ](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/rabbitmq)、[Kafka](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/kafka)、[RocketMQ](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/rabbitmq)、[Paho MQTT](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/paho-mqtt)

* [MySQL](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/mysql-jdbc)、[Oracle](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/oracle-jdbc)、[MSSQL](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/mssql-jdbc)、[JTDS](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/jtds)、[CUBRID](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/cubrid-jdbc)、[MongoDB](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/mongo-db)、[PostgreSQL](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/postgresql-jdbc)、[HikariCP](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/hikaricp)、[JDBC](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/jdbc)、[HBase](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/hbase)

* [HDFS](https://github.com/pinpoint-apm/pinpoint/tree/master/agent-module/plugins/hdfs)

## 贡献

欢迎向 Pinpoint 贡献代码！请先查看我们的 [贡献指南](https://github.com/pinpoint-apm/pinpoint/blob/master/CONTRIBUTING.md)。

## 许可证

Pinpoint 采用 [Apache 2.0 许可证](http://www.apache.org/licenses/LICENSE-2.0)。

# 参考资料

https://github.com/pinpoint-apm/pinpoint/blob/master/README.md

* any list
{:toc}
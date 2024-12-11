---
layout: post
title: 开源分布式系统追踪-00-overview
date:  2023-07-25 08:00:00 +0800
categories: [Trace]
tags: [trace, distributed, opensource, sh]
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

# 听说过或开源的trace框架

- Googe的Dapper;

- Twitter的zipkin;

- 淘宝的鹰眼;

- 大众点评的cat;

- 京东的hydra,现在是CallGraph,hydra已不维护了;

- spring Cloud Sleuth,它可以集成zipkin;

# 相关资料

• zipkin https://zipkin.io/

• Jaeger www.jaegertracing.io/

• Pinpoint https://github.com/pinpoint-apm/pinpoint

• SkyWalking http://skywalking.apache.org/

APM —  Application Performance Management

* [《Dapper，大规模分布式系统的跟踪系统》](http://bigbully.github.io/Dapper-translation/)

* [CNCF OpenTracing](http://opentracing.io)，[中文版](https://github.com/opentracing-contrib/opentracing-specification-zh)

* 主要开源软件，按字母排序
  * [Apache SkyWalking](https://github.com/apache/incubator-skywalking)
  * [CAT](https://github.com/dianping/cat)
  * [CNCF jaeger](https://github.com/jaegertracing/jaeger)
  * [Pinpoint](https://github.com/naver/pinpoint)
  * [Zipkin](https://github.com/openzipkin/zipkin)

* [《开源APM技术选型与实战》](http://www.infoq.com/cn/articles/apm-Pinpoint-practice)
	* 主要基于 Google的Dapper（大规模分布式系统的跟踪系统） 思想。

# 参考资料

[Zipkin](https://zipkin.io/) 

* any list
{:toc}
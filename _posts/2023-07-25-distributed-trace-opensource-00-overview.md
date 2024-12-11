---
layout: post
title: 开源分布式系统追踪-00-overview
date:  2023-07-25 +0800
categories: [Trace]
tags: [trace, distributed, opensource, apm, sh]
published: true
---


# 听说过或开源的trace框架

- Googe的Dapper;

- Twitter的zipkin;

- 淘宝的鹰眼;

- 大众点评的cat;

- 京东的hydra,现在是CallGraph,hydra已不维护了;

- spring Cloud Sleuth,它可以集成zipkin;

韩国的Pinpoint，
Twitter的Zipkin，
Uber的Jaeger及
中国的SkyWalking 等，

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
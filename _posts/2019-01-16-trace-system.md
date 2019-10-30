---
layout: post
title: Trace 系统设计
date: 2019-1-16 09:42:23 +0800
categories: [Devops]
tags: [devops, rpc, distributed, soa, apm, sh]
published: true
excerpt: Trace 系统设计
---

# Trace 系统

开发过稍微大一点的soa服务系统的程序员都听说过trace系统（但真正从零开始设计的人，我个人认为很少）。为什么需要trace呢？原因是调用soa服务的调用链路太复杂(什么是调用链路，下面解释)，trace的目的是为了定位系统的调用过程的一切一切。

## 理论依据

Google 的 [Dapper: a Large-Scale Distributed Systems Tracing Infrastructure]()


## 听说过或开源的trace框架

- Googe的Dapper;

- Twitter的zipkin;

- 淘宝的鹰眼;

- 大众点评的cat;

- 京东的hydra,现在是CallGraph,hydra已不维护了;

- spring Cloud Sleuth,它可以集成zipkin;


想了解这些系统，可以去github找源码学习,能找到的就是开源的，找不到就是不开源的。

# SOA服务trace系统的设计思路

大致了解一下，几乎上面所有的系统都是围绕Google的那篇论文，或者说是受那篇论文影响。对于一次rpc请求，trace系统将其分为四个阶段:

1. rpc客户端发送请求(customer send ,简称cs);

2. rpc服务端接收请求(server receive,简称sr);

3. rpc服务端发送响应(server send,简称ss);

4. rpc客户端接收响应(customer receive,简称cr);

追踪就是围绕这四个阶段进行一系统日志记录。之所以很多程序员对于trace系统不理解，原因是对于rpc的整个调用过程不清楚，或者说是没有理解透彻。下面围绕下面几个问题展开。

## 什么是调用链？

上面描述的四个阶段，就是一个完整的调用链。即从一个调用请求发出至该调用接收到相应的响应为止。出现调用依赖，就会有这一调用的结束是下一个调用的开始。

什么是api接口业务参数？

业务参数就是我们在定义api接口中显示定义的参数。

## 什么是api请求参数？

在单机api请求很简单就是直接调用api的实现类对应的实例中的方法并传入相应的业务即可；但是在远程调用(rpc)，则对应的参数不仅仅只是业务参数。至少需要直接调用服务端机器的ip地址与端口port参数。这些参数，而不需要显示的传递至服务端，而是客户端根据这些参数建立调用通道；

## 什么是链路参数?

链路参数：指不同于业务参数，原因是api接口在进行业务处理时，并不真正的依赖于它；也不同于api请求参数,链路参数可以隐示的传递至api服务端。正是由于有了这种机制，我们才可以通过链路参数完成trace系统的非侵入式设计。当然没有这个机制也可以完成trace，只是需要将相应的trace参数显示的定义在api业务参数中。

## 实际连接

说的再直白一点trace系统就是为了完成将各个系统在每个阶段服务调用输入的日志“串起来”。

为了完成这个“串起来”,trace系统只需要在各个服务的调用链上进行拦截，并进行相应的每个阶段的日志记录,并根据链路参数传递traceId进行上下文日志的衔接。 

基于dubbo框架的SOA服务的trace系统hydra正是基于这个思路。

它实现了dubbo框架的com.alibaba.dubbo.rpc.Filter,并注入dubbo框架调用链路中，从而完成前面调用链路的四个阶段的日志记录，构建一个trace系统。

# 拓展阅读

[cat](https://houbb.github.io/2016/12/16/cat)

[Twitter zipkin](https://houbb.github.io/2018/11/25/zipkin)

[google dapper]()

# 参考资料

[追踪(trace)系统框架设计的思考](https://blog.csdn.net/zhurhyme/article/details/76222395)

* any list
{:toc}


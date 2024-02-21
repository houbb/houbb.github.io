---
layout: post
title: Zuul-Zuul 是一种网关服务，可提供动态路由、监控、弹性、安全性等。
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# Zuul

Zuul 是一个 L7 应用程序网关，提供动态路由、监控、弹性、安全性等功能。 

# 什么是 Zuul

Zuul 是从设备和网站到 Netflix 流媒体应用程序后端的所有请求的前门。 

作为边缘服务应用程序，Zuul 旨在实现动态路由、监控、弹性和安全性。 

它还能够根据需要将请求路由到多个 Amazon Auto Scaling 组。

直接进入：[入门 2.0](https://github.com/Netflix/zuul/wiki/Getting-Started-2.0)

# 我们为什么要建立 Zuul？

Netflix API 流量的数量和多样性有时会导致生产问题在没有警告的情况下迅速出现。

我们需要一个允许我们快速改变行为的系统，以便对这些情况做出反应。

Zuul 使用一系列不同类型的过滤器，使我们能够快速灵活地将功能应用于我们的边缘服务。

这些过滤器帮助我们执行以下功能：

身份验证和安全 - 确定每个资源的身份验证要求并拒绝不满足要求的请求。

洞察力和监控 - 在边缘跟踪有意义的数据和统计数据，以便我们准确了解生产情况。

动态路由 - 根据需要将请求动态路由到不同的后端集群。

压力测试 - 逐渐增加集群的流量以衡量性能。

Load Shedding - 为每种类型的请求分配容量并丢弃超过限制的请求。

静态响应处理 - 直接在边缘构建一些响应，而不是将它们转发到内部集群

多区域弹性 - 跨 AWS 区域路由请求，以使我们的 ELB 使用多样化并使我们的优势更接近我们的成员

有关更多详细信息：[我们如何在 Netflix 上使用 Zuul](https://github.com/Netflix/zuul/wiki/How-We-Use-Zuul-At-Netflix)

# Zuul 组件

Zuul 2.x 组件：

     zuul-core - Zuul 2.0 的核心功能

     zuul-sample - Zuul 2.0 的示例驱动程序应用程序

Zuul 1.x 组件：

     zuul-core - 包含编译和执行过滤器核心功能的库

     zuul-simple-webapp - 显示如何使用 zuul-core 构建应用程序的简单示例的 webapp

     zuul-netflix - 将其他 NetflixOSS 组件添加到 Zuul 的库 - 例如，使用 Ribbon 路由请求。

     zuul-netflix-webapp - 将 zuul-core 和 zuul-netflix 打包成一个易于使用的包的 webapp

# 拓展阅读

用法、信息、HOWTO等请查看wiki https://github.com/Netflix/zuul/wiki

这里有一些链接可以帮助您了解有关 Zuul 项目的更多信息。 

随意 PR 以添加任何其他信息、演示文稿等。

Articles from Netflix:

Zuul 1: http://techblog.netflix.com/2013/06/announcing-zuul-edge-service-in-cloud.html

Zuul 2:

https://medium.com/netflix-techblog/open-sourcing-zuul-2-82ea476cb2b3

http://techblog.netflix.com/2016/09/zuul-2-netflix-journey-to-asynchronous.html

Netflix 关于 Zuul 的介绍：

奇怪的循环 2017 - Zuul 2：https://youtu.be/2oXqbLhMS_A

AWS re:Invent 2018 - 为数百万 Netflix 设备扩展推送消息：https://youtu.be/IdR6N9B-S1E

Netflix 关于 Zuul 的演示文稿的幻灯片：

http://www.slideshare.net/MikeyCohen1/zuul-netflix-springone-platform

http://www.slideshare.net/MikeyCohen1/rethinking-cloud-proxies-54923218

https://github.com/strangeloop/StrangeLoop2017/blob/master/slides/ArthurGonigberg-ZuulsJourneyToNonBlocking.pdf

https://www.slideshare.net/SusheelAroskar/scaling-push-messaging-for-millions-of-netflix-devices


# 参考资料

https://github.com/bluezio/xeger

* any list
{:toc}
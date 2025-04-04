---
layout: post
title:  SOFABoot-06-健康检查
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, sofastack, sh]
published: true
---

## 前言

大家好，我是老马。

sofastack 其实出来很久了，第一次应该是在 2022 年左右开始关注，但是一直没有深入研究。

最近想学习一下 SOFA 对于生态的设计和思考。

## sofaboot 系列

[SOFABoot-00-sofaboot 概览](https://houbb.github.io/2022/07/09/sofastack-sofaboot-00-overview)

[SOFABoot-01-蚂蚁金服开源的 sofaboot 是什么黑科技？](https://houbb.github.io/2022/07/09/sofastack-sofaboot-01-intro)

[SOFABoot-02-模块化隔离方案](https://houbb.github.io/2022/07/09/sofastack-sofaboot-02-module-iosolation)

[SOFABoot-03-sofaboot 介绍](https://houbb.github.io/2022/07/09/sofastack-sofaboot-03-intro)

[SOFABoot-04-快速开始](https://houbb.github.io/2022/07/09/sofastack-sofaboot-04-quick-start)

[SOFABoot-05-依赖管理](https://houbb.github.io/2022/07/09/sofastack-sofaboot-05-depency-solve)

[SOFABoot-06-健康检查](https://houbb.github.io/2022/07/09/sofastack-sofaboot-06-health-check)

[SOFABoot-07-版本查看](https://houbb.github.io/2022/07/09/sofastack-sofaboot-07-version)

[SOFABoot-08-启动加速](https://houbb.github.io/2022/07/09/sofastack-sofaboot-08-speed-up)

[SOFABoot-09-模块隔离](https://houbb.github.io/2022/07/09/sofastack-sofaboot-09-module-isolation)

[SOFABoot-10-聊一聊 sofatboot 的十个问题](https://houbb.github.io/2022/07/09/sofastack-sofaboot-10-chat-10-q)

# 健康检查

SOFABoot 为 Spring Boot 的健康检查能力增加了 Readiness Check 的能力。

如果你需要使用 SOFA 中间件，那么建议使用 SOFABoot 的健康检查能力的扩展，来更优雅的上线应用实例

# 引入健康检查扩展

要引入 SOFABoot 的健康检查能力的扩展，只需要引入以下的 Starter 即可：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>healthcheck-sofa-boot-starter</artifactId>
</dependency>
```

如果不引入 SOFABoot 的健康检查扩展，用户依然可以直接依赖 HealthIndicator 接口进行原生的 Spring Boot Actuator 的 Liveness Check。

# 安全提醒

从 SOFABoot 2.3.0 开始，由于健康检查能力依赖于 SpringBoot 1.4.x 里的 Actuator 组件，而 Actuator 会默认开启很多 EndPoint，例如 /dump，/trace 等等，可能存在安全风险，可以参照官方文档里的安全建议进行设置。

SpringBoot 1.5.x 和 SpringBoot 2.x 已修复了部分安全行为，SOFABoot 将通过升级 SpringBoot 内核进行支持。

# 查看健康检查结果

加入健康检查扩展之后，我们可以直接在浏览器中输入 http://localhost:8080/health/readiness 来查看 Readiness Check 的结果。

如果要查看 Liveness Check 的结果，可以直接查看 Spring Boot 的健康检查的 URL http://localhost:8080/health。

除了通过 URL 来查看健康检查的结果之外，在 SOFABoot 中，还可以通过查看具体的日志来确定健康检查的结果，日志的目录位于 health-check 目录下，日志的内容大概如下：

```
2018-04-06 23:29:50,240 INFO  main                             - Readiness check result: success
```

目前 SOFA 中间件已经通过 SOFABoot 的 Readiness Check 的能力来控制了上游流量的进入，但是一个应用的流量可能并不是全部都是从中间件进入的，比较常见的还有从负载均衡器进入的，为了控制从负载均衡器进入的流量，建议使用者通过 PAAS 来访问 Readiness Check 的结果，根据结果来控制是否要在负载均衡器中上线对应的节点。

注: 自 SOFABoot 2.x 之后，不再间接引入 spring-boot-starter-web 依赖，如果需要在浏览器中查看健康检查结果，需要额外在工程中引入 web 容器依赖。

注: 在 SOFABoot 3.x 中调整了 endpoint 路径，health/readiness 更改为 actuator/readiness

# 扩展 Readiness Check 能力

在 Readiness Check 的各个阶段，SOFABoot 都提供了扩展的能力，应用可以根据自己的需要进行扩展，在 2.x 版本中，可供扩展的点如下：

```
回调接口 	说明
org.springframework.context.ApplicationListener 	如果想要在 Readiness Check 之前做一些事情，那么监听这个 Listener 的 SofaBootBeforeHealthCheckEvent 事件。
org.springframework.boot.actuate.health.HealthIndicator 	如果想要在 SOFABoot 的 Readiness Check 里面增加一个检查项，那么可以直接扩展 Spring Boot 的这个接口。
com.alipay.sofa.healthcheck.startup.SofaBootAfterReadinessCheckCallback 	如果想要在 Readiness Check 之后做一些事情，那么可以扩展 SOFABoot 的这个接口。
```

在 3.x 版本中，可供扩展点如下：

```
回调接口 	说明
com.alipay.sofa.healthcheck.core.HealthChecker 	如果想要在 SOFABoot 的 Readiness Check 里面增加一个检查项，可以直接扩展该接口。相较于 Spring Boot 本身的 HealthIndicator 接口，该接口提供了一些额外的参数配置，比如检查失败重试次数等。
org.springframework.boot.actuate.health.HealthIndicator 	如果想要在 SOFABoot 的 Readiness Check 里面增加一个检查项，那么可以直接扩展 Spring Boot 的这个接口。
org.springframework.boot.actuate.health.ReactiveHealthIndicator 	在 WebFlux 中，如果想要在 SOFABoot 的 Readiness Check 里面增加一个检查项，那么可以直接扩展 Spring Boot 的这个接口。
com.alipay.sofa.healthcheck.startup.ReadinessCheckCallback 	如果想要在 Readiness Check 之后做一些事情，那么可以扩展 SOFABoot 的这个接口。
```

需要指出的是，上述四个扩展接口均可以通过 Spring Boot 标准的 Ordered, PriorityOrdered 和注解 @Order 实现执行顺序的设置。

# Readiness Check 配置项

应用在引入 SOFABoot 的健康检查扩展之后，可以在 Spring Boot 的配置文件 application.properties 中添加相关配置项来定制 Readiness Check 的相关行为。

```
Readiness Check 配置项 	说明 	默认值 	开始支持版本
com.alipay.sofa.healthcheck.skip.all 	是否跳过整个 Readiness Check 阶段 	false 	2.4.0
com.alipay.sofa.healthcheck.skip.component 	是否跳过 SOFA 中间件的 Readiness Check 	false 	2.4.0
com.alipay.sofa.healthcheck.skip.indicator 	是否跳过 HealthIndicator 的 Readiness Check 	false 	2.4.0
com.alipay.sofa.healthcheck.component.check.retry.count 	组件健康检查重试次数 	20 	2.4.10 (之前版本重试次数为 0)
com.alipay.sofa.healthcheck.component.check.retry.interval 	组件健康检查重试间隔时间 	1000 (单位：ms) 	2.4.10 (之前版本重试间隔为 0)
com.alipay.sofa.healthcheck.module.check.retry.count 	sofaboot 模块健康检查重试次数 	0 	2.4.10
com.alipay.sofa.healthcheck.module.check.retry.interval 	sofaboot 模块健康检查重试间隔时间 	1000 (单位：ms) 	2.4.10 (之前版本重试间隔为 0)
```

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://www.sofastack.tech/projects/sofa-boot/health-check/

* any list
{:toc}